// supabase/functions/lead/index.ts
//
// Приём заявок с форм всех сайтов владельца и доставка их в Telegram.
//
// Почему не Firebase Functions. Хостинг dao-civ сидит на плане Spark, где
// Cloud Functions отключены на уровне проекта (403 SERVICE_DISABLED), и
// rewrite `/api/lead` годами отдавал 404. Edge Functions работают на free
// tier — заявка идёт напрямую сюда, минуя мёртвый rewrite.
//
// Порядок работы принципиален: сначала запись в БД, потом Telegram. Если
// Telegram лежит или токен не выставлен — заявка уже сохранена, а клиент
// получает 200. Обратный порядок означал бы, что упавший мессенджер стирает
// клиента.
//
// Секреты берутся только из окружения и нигде не имеют значений по умолчанию:
//   supabase secrets set TELEGRAM_BOT_TOKEN=... TELEGRAM_ADMIN_CHAT_ID=...

// Список источников закрытый. `*` здесь означал бы, что заявку может слать
// любая страница в интернете от имени посетителя — при том что форма ничего
// не подписывает.
const ALLOWED_ORIGINS = [
  "https://dao-civ.web.app",
  "https://arkheosium.vercel.app",
];

// Пределы полей. Числа не «на глаз»: они совпадают с maxlength в самой форме
// (name 120, contact 160, org 160, задача 2000), плюс запас на многобайтовые
// символы. Всё, что вылезает за них, формой отправлено быть не могло.
const LIMITS = {
  body: 16 * 1024, // весь JSON: 2000 символов задачи в UTF-8 + поля ≈ 6 КБ
  name: { min: 2, max: 120 },
  contact: { min: 3, max: 160 },
  org: { min: 0, max: 160 },
  task: { min: 5, max: 4000 }, // вдвое от maxlength=2000: не резать по букве
};

// 5 заявок с одного адреса в минуту. Живой человек столько не наберёт, а
// перебор формы такой порог ловит на первом же десятке.
const RATE = { limit: 5, windowSeconds: 60 };

function corsHeaders(origin: string | null): Record<string, string> {
  const h: Record<string, string> = {
    "Vary": "Origin",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type, x-client-info, apikey, authorization",
    "Access-Control-Max-Age": "86400",
  };
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    h["Access-Control-Allow-Origin"] = origin;
  }
  return h;
}

function json(body: unknown, status: number, origin: string | null): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), "content-type": "application/json; charset=utf-8" },
  });
}

// Экранирование под parse_mode: "HTML". Без него апостроф или угловая скобка
// в имени превращает сообщение в невалидную разметку, Telegram отвечает 400 и
// заявка до владельца не доходит — при том что в БД она уже есть.
function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function clean(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }
  if (req.method !== "POST") {
    return json({ ok: false, error: "Только POST" }, 405, origin);
  }
  // Origin отсутствует у серверных вызовов и curl — их пропускаем. Origin
  // чужого сайта — отказ: это попытка отправить заявку от лица посетителя.
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return json({ ok: false, error: "Источник не разрешён" }, 403, origin);
  }

  const raw = await req.text();
  if (raw.length > LIMITS.body) {
    return json({ ok: false, error: "Слишком длинная заявка" }, 413, origin);
  }

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(raw || "{}");
  } catch {
    return json({ ok: false, error: "Тело не разобрано" }, 400, origin);
  }

  // Ловушка. Поле `website` скрыто от человека, но заполняется автоподстановкой
  // робота. Отвечаем 200, будто всё принято: сообщать роботу, что он опознан,
  // значит помогать его настроить.
  if (clean(data.website)) {
    return json({ ok: true }, 200, origin);
  }

  const name = clean(data.name);
  const contact = clean(data.contact) || clean(data.email);
  const org = clean(data.org) || clean(data.organization);
  // На статике поле задачи называется `subject` (это textarea формы), в SPA
  // может прийти `message` или `task` — принимаем любое из трёх.
  const task = clean(data.subject) || clean(data.message) || clean(data.task);

  const bad: string[] = [];
  if (name.length < LIMITS.name.min || name.length > LIMITS.name.max) bad.push("имя");
  if (contact.length < LIMITS.contact.min || contact.length > LIMITS.contact.max) bad.push("связь");
  if (org.length > LIMITS.org.max) bad.push("организация");
  if (task.length < LIMITS.task.min || task.length > LIMITS.task.max) bad.push("задача");
  if (bad.length) {
    return json({ ok: false, error: `Заполните: ${bad.join(", ")}` }, 400, origin);
  }

  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  const source = origin ? new URL(origin).host : "прямой вызов";

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const restHeaders = {
    "apikey": SERVICE_KEY,
    "authorization": `Bearer ${SERVICE_KEY}`,
    "content-type": "application/json",
  };

  // ── рейт-лимит ────────────────────────────────────────────────────────────
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/rate_limit_hit`, {
      method: "POST",
      headers: restHeaders,
      body: JSON.stringify({
        p_ip: ip,
        p_bucket: "lead",
        p_limit: RATE.limit,
        p_window_seconds: RATE.windowSeconds,
      }),
    });
    if (r.ok && (await r.json()) === false) {
      return json({ ok: false, error: "Слишком часто. Попробуйте через минуту." }, 429, origin);
    }
  } catch (e) {
    // Отказ счётчика не должен отказывать клиенту: лимит — защита, а не приём.
    console.error("rate_limit_hit недоступен:", String(e));
  }

  // ── запись в БД (первым делом) ────────────────────────────────────────────
  // Таблица `contact_requests` уже существовала, колонки подошли — новой не
  // заводим. `email` держит любую связь (почта или телеграм), `subject` —
  // короткая шапка «откуда и от кого», `message` — сам текст задачи.
  const row = {
    name,
    email: contact,
    subject: org ? `Заявка · ${source} · ${org}` : `Заявка · ${source}`,
    message: task,
    type: "lead",
    ip_address: ip,
  };

  const ins = await fetch(`${SUPABASE_URL}/rest/v1/contact_requests`, {
    method: "POST",
    headers: { ...restHeaders, "prefer": "return=representation" },
    body: JSON.stringify(row),
  });
  if (!ins.ok) {
    const detail = await ins.text();
    console.error("не удалось записать заявку:", ins.status, detail);
    return json({ ok: false, error: "Не удалось принять заявку" }, 500, origin);
  }
  const saved = (await ins.json())?.[0] ?? null;

  // ── доставка в Telegram (после записи) ────────────────────────────────────
  let delivered = false;
  try {
    const token = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const chatId = Deno.env.get("TELEGRAM_ADMIN_CHAT_ID");
    if (!token || !chatId) throw new Error("TELEGRAM_BOT_TOKEN / TELEGRAM_ADMIN_CHAT_ID не выставлены");

    const when = new Date().toLocaleString("ru-RU", { timeZone: "Europe/Moscow" });
    const text = [
      "<b>Заявка с сайта</b>",
      `Откуда: <code>${esc(source)}</code>`,
      "",
      `<b>Имя:</b> ${esc(name)}`,
      `<b>Связь:</b> ${esc(contact)}`,
      org ? `<b>Организация:</b> ${esc(org)}` : null,
      "",
      "<b>Задача:</b>",
      esc(task),
      "",
      `<i>${esc(when)} МСК</i>`,
      // Именно `!== null`, а не `Boolean`: пустые строки в списке — это
      // намеренные пустые строки сообщения, и отбрасывать их нельзя.
    ].filter((l) => l !== null).join("\n");

    const tg = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
    if (!tg.ok) throw new Error(`Telegram ответил ${tg.status}: ${await tg.text()}`);
    delivered = true;
  } catch (e) {
    // Заявка уже в БД — клиенту 200. 500 здесь заставил бы человека набирать
    // текст заново, хотя он не потерян.
    console.error("заявка сохранена, но не доставлена в Telegram:", String(e));
  }

  return json({ ok: true, id: saved?.id ?? null, delivered }, 200, origin);
});
