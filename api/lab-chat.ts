// ============================================================
// Project Lab — Vercel Serverless Function  (POST /api/lab-chat)
//
// Interactive AI co-pilot for developing a PROJECT or PRODUCT.
// Unlike Genesis (one-shot autonomous pipeline), this is conversational:
// the user chats, and the assistant BOTH replies AND patches structured
// constructor blocks (concept / tech / economics / roadmap / …).
//
// SECURITY: Gemini API keys live ONLY here (server-side env vars).
//           They are NEVER sent to the client.
//
// Env (Vercel → Settings → Environment Variables):
//   GEMINI_API_KEY_1 .. GEMINI_API_KEY_N   — Gemini keys (round-robin)
//   GEMINI_KEY_COUNT                        — how many to scan (default 4)
//
// Runtime: Node (Node 18+ global fetch).
// ============================================================

type LabMode = 'project' | 'product';
type ChatRole = 'user' | 'assistant' | 'system';

interface LabChatRequest {
  model: string;
  mode: LabMode;
  messages: { role: ChatRole; content: string }[];
  blocks: { id: string; title: string; content: string }[];
}

interface LabChatResponse {
  ok: boolean;
  reply: string;
  block_updates: { id: string; content: string }[];
  model: string;
  token_cost: number;
  error?: string;
  error_code?: 'NO_KEYS' | 'BAD_REQUEST' | 'UPSTREAM' | 'INTERNAL';
}

// ── Gemini config ────────────────────────────────────────────

const FLASH = 'gemini-2.5-flash';
const PRO = 'gemini-2.5-pro';
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

// Client model id → { gemini model, persona system preamble }
const MODEL_MAP: Record<string, { model: string; persona: string }> = {
  'aqua-flash': {
    model: FLASH,
    persona: 'Ты — быстрый со-пилот разработки. Даёшь чёткие, практичные черновики и идеи без воды.',
  },
  'genesis-pro': {
    model: PRO,
    persona: 'Ты — глубокий эксперт-стратег. Рассуждаешь системно, взвешиваешь варианты, обосновываешь решения.',
  },
  architect: {
    model: PRO,
    persona: 'Ты — системный архитектор. Фокус на технологиях, оборудовании, методологиях, интеграциях и инновациях.',
  },
  economist: {
    model: PRO,
    persona: 'Ты — экономист проектов. Фокус на ТЭО: CAPEX, OPEX, окупаемость, IRR, юнит-экономика, риски, допущения. Числа реалистичны.',
  },
  'product-lead': {
    model: FLASH,
    persona: 'Ты — продуктолог. Фокус на аудитории (JTBD), функциях MVP, монетизации, метриках и go-to-market.',
  },
};

function loadKeys(): string[] {
  const count = parseInt(process.env.GEMINI_KEY_COUNT || '4', 10);
  const n = Number.isFinite(count) && count > 0 ? count : 4;
  const keys: string[] = [];
  for (let i = 1; i <= n; i++) {
    const k = process.env[`GEMINI_API_KEY_${i}`];
    if (k && k.trim()) keys.push(k.trim());
  }
  return keys;
}

class KeyPool {
  private keys: string[];
  private idx = 0;
  constructor(keys: string[]) {
    this.keys = keys;
  }
  get size() {
    return this.keys.length;
  }
  next(): string {
    const k = this.keys[this.idx % this.keys.length];
    this.idx++;
    return k;
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function callGemini(
  pool: KeyPool,
  model: string,
  prompt: string,
  opts: { json?: boolean; maxRetries?: number } = {},
): Promise<string> {
  const maxRetries = opts.maxRetries ?? 4;
  let attempt = 0;
  let lastErr = '';

  while (attempt <= maxRetries) {
    const key = pool.next();
    const url = `${GEMINI_BASE}/${model}:generateContent?key=${encodeURIComponent(key)}`;
    const body: any = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.75,
        maxOutputTokens: 4096,
        ...(opts.json ? { responseMimeType: 'application/json' } : {}),
      },
    };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.status === 429 || res.status === 503) {
        const backoff = Math.min(2 ** attempt * 500, 8000);
        lastErr = `HTTP ${res.status}`;
        attempt++;
        await sleep(backoff);
        continue;
      }
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        lastErr = `HTTP ${res.status}: ${txt.slice(0, 300)}`;
        if (res.status >= 400 && res.status < 500 && res.status !== 429) {
          throw new Error(`NONRETRYABLE ${lastErr}`);
        }
        attempt++;
        await sleep(500 * (attempt + 1));
        continue;
      }

      const json = (await res.json()) as any;
      const text =
        json?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text || '').join('') || '';
      if (!text) {
        lastErr = 'Empty response from Gemini';
        attempt++;
        await sleep(500);
        continue;
      }
      return text;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.startsWith('NONRETRYABLE')) throw new Error(msg.replace('NONRETRYABLE ', ''));
      lastErr = msg;
      attempt++;
      await sleep(500 * (attempt + 1));
    }
  }
  throw new Error(`Gemini call failed after ${maxRetries} retries: ${lastErr}`);
}

function parseJsonLoose(text: string): any {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fence) {
      try {
        return JSON.parse(fence[1].trim());
      } catch {
        /* fall through */
      }
    }
    const obj = trimmed.match(/[[{][\s\S]*[\]}]/);
    if (obj) {
      try {
        return JSON.parse(obj[0]);
      } catch {
        /* fall through */
      }
    }
    return { reply: text, block_updates: [] };
  }
}

function buildPrompt(body: LabChatRequest, persona: string): string {
  const modeLabel = body.mode === 'product' ? 'ПРОДУКТА' : 'ПРОЕКТА';
  const blockList = body.blocks
    .map((b) => `- id="${b.id}" · «${b.title}»:\n${b.content?.trim() ? b.content.trim() : '(пусто)'}`)
    .join('\n');
  const history = body.messages
    .slice(-12)
    .map((m) => `${m.role === 'assistant' ? 'Ассистент' : 'Пользователь'}: ${m.content}`)
    .join('\n');

  return `${persona}
Платформа: ARKHEOSIUM — водная/инфраструктурная/ресурсная ОС. Ты помогаешь пользователю разрабатывать концепцию ${modeLabel} в интерактивном конструкторе.

Конструктор состоит из блоков (карточек). Текущее состояние блоков:
${blockList}

История диалога:
${history}

ЗАДАЧА:
1. Ответь пользователю кратко и по делу (reply) — по-русски, дружелюбно, конкретно.
2. Если по ходу диалога стоит заполнить/дополнить блоки — верни их обновлённое содержимое в block_updates. Обновляй ТОЛЬКО релевантные блоки (можно 0, 1 или несколько). content — цельный связный текст блока (перепиши блок целиком с учётом нового), допускается markdown-разметка (списки, **жирный**). Не выдумывай нереалистичных цифр; в ТЭО/экономике давай правдоподобные оценки с единицами.
3. Используй ТОЛЬКО существующие id блоков из списка выше.

Верни СТРОГО JSON без markdown-обёртки:
{"reply": string, "block_updates": [{"id": string, "content": string}]}`;
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, reply: '', block_updates: [], model: '', token_cost: 0, error: 'Method not allowed', error_code: 'BAD_REQUEST' } as LabChatResponse);
    return;
  }

  let body: LabChatRequest;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  } catch {
    res.status(400).json({ ok: false, reply: '', block_updates: [], model: '', token_cost: 0, error: 'Невалидный JSON', error_code: 'BAD_REQUEST' } as LabChatResponse);
    return;
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    res.status(400).json({ ok: false, reply: '', block_updates: [], model: body.model || '', token_cost: 0, error: 'messages обязательны', error_code: 'BAD_REQUEST' } as LabChatResponse);
    return;
  }

  const keys = loadKeys();
  if (keys.length === 0) {
    res.status(200).json({ ok: false, reply: '', block_updates: [], model: body.model || '', token_cost: 0, error: 'Ключи Gemini не настроены (GEMINI_API_KEY_1..N)', error_code: 'NO_KEYS' } as LabChatResponse);
    return;
  }

  const picked = MODEL_MAP[body.model] || MODEL_MAP['aqua-flash'];
  const pool = new KeyPool(keys);
  const validIds = new Set((body.blocks || []).map((b) => b.id));

  try {
    const prompt = buildPrompt({ ...body, blocks: body.blocks || [] }, picked.persona);
    const text = await callGemini(pool, picked.model, prompt, { json: true });
    const tokenCost = Math.ceil((prompt.length + text.length) / 4);
    const parsed = parseJsonLoose(text);

    const reply = typeof parsed?.reply === 'string' && parsed.reply.trim()
      ? parsed.reply.trim()
      : (typeof parsed?.raw === 'string' ? parsed.raw : 'Готово.');
    const updatesRaw = Array.isArray(parsed?.block_updates) ? parsed.block_updates : [];
    const block_updates = updatesRaw
      .filter((u: any) => u && typeof u.id === 'string' && typeof u.content === 'string' && validIds.has(u.id))
      .map((u: any) => ({ id: u.id, content: String(u.content).slice(0, 6000) }));

    res.status(200).json({ ok: true, reply, block_updates, model: picked.model, token_cost: tokenCost } as LabChatResponse);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(200).json({ ok: false, reply: '', block_updates: [], model: picked.model, token_cost: 0, error: msg, error_code: 'INTERNAL' } as LabChatResponse);
  }
}
