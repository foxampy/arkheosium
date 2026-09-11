// supabase/functions/notify/index.ts
//
// Общий приёмник событий: регистрации, запросы, действия — всё, что владелец
// хочет видеть в Telegram, но что не является заявкой с формы.
//
// Тело: { kind, title, body, meta }.
//
// Зовут её серверные триггеры (сейчас — AFTER INSERT на public.profiles через
// net.http_post), а не браузер. Поэтому CORS не открывается вовсе, а доступ
// закрыт общим секретом в заголовке `x-notify-secret`:
//   supabase secrets set NOTIFY_SECRET=... TELEGRAM_BOT_TOKEN=... TELEGRAM_ADMIN_CHAT_ID=...
//
// Код функции намеренно самодостаточен и повторяет пару помощников из `lead`:
// deploy_edge_function собирает каждую функцию отдельно, и общий модуль связал
// бы их выкладку друг с другом ради тридцати строк.

const LIMITS = {
  body: 32 * 1024,
  title: 200,
  text: 3000,
  meta: 2000, // meta печатается как JSON — длинный дамп в сообщении бесполезен
};

// Событий больше, чем заявок (регистрации идут пачками при рассылке), поэтому
// порог выше, чем у `lead`.
const RATE = { limit: 30, windowSeconds: 60 };

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function clean(v: unknown, max: number): string {
  const s = typeof v === "string" ? v.trim() : "";
  return s.length > max ? s.slice(0, max) + "…" : s;
}

// Сравнение постоянного времени. Наивное `a === b` выходит из цикла на первом
// несовпавшем байте, и по времени ответа секрет подбирается посимвольно.
function secretsEqual(a: string, b: string): boolean {
  const ea = new TextEncoder().encode(a);
  const eb = new TextEncoder().encode(b);
  if (ea.length !== eb.length) return false;
  let diff = 0;
  for (let i = 0; i < ea.length; i++) diff |= ea[i] ^ eb[i];
  return diff === 0;
}

const KIND_LABEL: Record<string, string> = {
  registration: "Новая регистрация",
  request: "Запрос",
  action: "Действие",
  payment: "Оплата",
  error: "Сбой",
};

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return json({ ok: false, error: "Только POST" }, 405);

  const expected = Deno.env.get("NOTIFY_SECRET");
  if (!expected) {
    console.error("NOTIFY_SECRET не выставлен — приёмник закрыт");
    return json({ ok: false, error: "Приёмник не настроен" }, 503);
  }
  const given = req.headers.get("x-notify-secret") ?? "";
  if (!secretsEqual(given, expected)) {
    return json({ ok: false, error: "Не авторизовано" }, 401);
  }

  const raw = await req.text();
  if (raw.length > LIMITS.body) return json({ ok: false, error: "Слишком длинное тело" }, 413);

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(raw || "{}");
  } catch {
    return json({ ok: false, error: "Тело не разобрано" }, 400);
  }

  const kind = clean(data.kind, 60) || "event";
  const title = clean(data.title, LIMITS.title);
  const body = clean(data.body, LIMITS.text);
  const meta = data.meta && typeof data.meta === "object"
    ? clean(JSON.stringify(data.meta, null, 1), LIMITS.meta)
    : "";
  if (!title && !body) return json({ ok: false, error: "Пустое событие" }, 400);

  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/rate_limit_hit`, {
      method: "POST",
      headers: {
        "apikey": SERVICE_KEY,
        "authorization": `Bearer ${SERVICE_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        p_ip: ip,
        p_bucket: "notify",
        p_limit: RATE.limit,
        p_window_seconds: RATE.windowSeconds,
      }),
    });
    if (r.ok && (await r.json()) === false) {
      return json({ ok: false, error: "Слишком часто" }, 429);
    }
  } catch (e) {
    console.error("rate_limit_hit недоступен:", String(e));
  }

  const token = Deno.env.get("TELEGRAM_BOT_TOKEN");
  const chatId = Deno.env.get("TELEGRAM_ADMIN_CHAT_ID");
  if (!token || !chatId) {
    console.error("TELEGRAM_BOT_TOKEN / TELEGRAM_ADMIN_CHAT_ID не выставлены");
    return json({ ok: false, error: "Отправка не настроена" }, 503);
  }

  const when = new Date().toLocaleString("ru-RU", { timeZone: "Europe/Moscow" });
  const text = [
    `<b>${esc(KIND_LABEL[kind] ?? kind)}</b>`,
    title ? esc(title) : null,
    body ? "" : null,
    body ? esc(body) : null,
    meta ? `\n<pre>${esc(meta)}</pre>` : null,
    "",
    `<i>${esc(when)} МСК · ${esc(kind)}</i>`,
  ].filter((l) => l !== null).join("\n");

  try {
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
  } catch (e) {
    // В отличие от `lead`, здесь терять нечего: событие уже записано там, где
    // оно возникло. Отдаём 502, чтобы отказ был виден в логах вызывающего.
    console.error("событие не доставлено:", String(e));
    return json({ ok: false, error: "Не доставлено" }, 502);
  }

  return json({ ok: true }, 200);
});
