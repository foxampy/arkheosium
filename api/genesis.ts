// ============================================================
// Genesis Engine — Vercel Serverless Function  (POST /api/genesis)
//
// Autonomous agentic pipeline that turns a raw input
// (object / resource / initiative / concept) into a structured PROJECT:
//   research → concept → tech-selection → ТЭО → studio → assembly
//
// SECURITY: Gemini API keys live ONLY here (server-side env vars).
//           They are NEVER sent to the client.
//
// Env (set in Vercel → Project → Settings → Environment Variables):
//   GEMINI_API_KEY_1 .. GEMINI_API_KEY_N   — Gemini keys (round-robin)
//   GEMINI_KEY_COUNT                        — how many to scan (default 4)
//   SUPABASE_URL                            — for server-side persistence (optional)
//   SUPABASE_SERVICE_ROLE_KEY               — service role for RLS bypass (optional)
//
// Runtime: Node (default for files in /api on a Vite SPA deployed to Vercel).
// Uses built-in global fetch (Node 18+).
// ============================================================

// ── Types (API contract, mirrored on the client in src/lib/genesisTypes.ts) ──

type InputType = 'object' | 'resource' | 'initiative' | 'concept';
type StageId = 'research' | 'concept' | 'tech-selection' | 'teo' | 'studio' | 'assembly';

interface GenesisRequestBody {
  input_type: InputType;
  title: string;
  description: string;
  run_id?: string;      // optional pre-created run id (client may create the run row first)
  user_id?: string | null;
}

interface StageResult {
  stage: StageId;
  ok: boolean;
  model: string;
  duration_ms: number;
  data: any;            // structured JSON produced by the stage
  error?: string;
}

interface GenesisResponse {
  ok: boolean;
  run_id: string | null;
  stages: StageResult[];
  project: {
    title: string;
    summary: string;
    teo: any;
    studio_html: string; // sandboxed HTML/JS artifact for the Studio iframe
  } | null;
  token_cost: number;
  error?: string;
  error_code?: 'NO_KEYS' | 'BAD_REQUEST' | 'UPSTREAM' | 'INTERNAL';
}

// ── Gemini config ────────────────────────────────────────────

const FLASH = 'gemini-2.5-flash';
const PRO = 'gemini-2.5-pro';
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

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

// Round-robin key distributor with rotation on rate-limit.
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

/**
 * Call Gemini generateContent. Handles 429 with exponential backoff and key
 * rotation across the pool. Returns the raw text of the first candidate.
 */
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
    const key = pool.next(); // rotate key each attempt for rate-limit resilience
    const url = `${GEMINI_BASE}/${model}:generateContent?key=${encodeURIComponent(key)}`;
    const body: any = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
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
        // rate-limited / overloaded → backoff + rotate to next key
        const backoff = Math.min(2 ** attempt * 500, 8000);
        lastErr = `HTTP ${res.status}`;
        attempt++;
        await sleep(backoff);
        continue;
      }

      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        lastErr = `HTTP ${res.status}: ${txt.slice(0, 300)}`;
        // non-retryable client error (bad key, malformed request) → stop immediately.
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
      // Propagate non-retryable client errors without burning the retry budget.
      if (msg.startsWith('NONRETRYABLE')) {
        throw new Error(msg.replace('NONRETRYABLE ', ''));
      }
      lastErr = msg;
      attempt++;
      await sleep(500 * (attempt + 1));
    }
  }
  throw new Error(`Gemini call failed after ${maxRetries} retries: ${lastErr}`);
}

/** Best-effort JSON extraction from a model response (handles ```json fences). */
function parseJsonLoose(text: string): any {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    // strip code fences
    const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fence) {
      try {
        return JSON.parse(fence[1].trim());
      } catch {
        /* fall through */
      }
    }
    // grab first {...} or [...]
    const obj = trimmed.match(/[[{][\s\S]*[\]}]/);
    if (obj) {
      try {
        return JSON.parse(obj[0]);
      } catch {
        /* fall through */
      }
    }
    return { raw: text };
  }
}

// ── Stage prompts ────────────────────────────────────────────

function researchPrompt(b: GenesisRequestBody): string {
  return `Ты — исследовательский агент Genesis Engine (платформа ARKHEOSIUM, водная/инфраструктурная тематика).
Вход (тип: ${b.input_type}): "${b.title}". Описание: ${b.description}.
Проведи анализ: контекст, аналоги в мире, ключевые вызовы, стейкхолдеры, регуляторные аспекты.
Верни СТРОГО JSON: {"context": string, "analogs": string[], "challenges": string[], "stakeholders": string[], "opportunities": string[]}. Пиши по-русски.`;
}

function conceptPrompt(b: GenesisRequestBody, research: any): string {
  return `Ты — концептуальный агент Genesis Engine. На основе исследования сформируй концепцию проекта.
Вход: "${b.title}" (${b.input_type}). Исследование: ${JSON.stringify(research).slice(0, 2000)}.
Верни СТРОГО JSON: {"vision": string, "goals": string[], "options": [{"name": string, "pros": string[], "cons": string[]}], "recommended_option": string}. Пиши по-русски.`;
}

function techPrompt(b: GenesisRequestBody, concept: any): string {
  return `Ты — агент подбора технологий Genesis Engine.
Каталог ARKHEOSIUM включает (примеры id): tech-ro (Обратный осмос), tech-uv (УФ-дезинфекция), tech-mbr (Мембранный биореактор), tech-edi (Электродеионизация), а также оборудование (насосы KSB, SCADA, датчики IoT).
Концепция: ${JSON.stringify(concept).slice(0, 1800)}.
Подбери оптимальные технологии/оборудование/методологии/инновации для проекта "${b.title}".
Верни СТРОГО JSON: {"technologies": [{"catalog_id": string|null, "name": string, "why": string}], "equipment": [{"name": string, "why": string}], "methodologies": string[], "innovations": string[]}. Пиши по-русски.`;
}

function teoPrompt(b: GenesisRequestBody, concept: any, tech: any): string {
  return `Ты — агент технико-экономического обоснования (ТЭО) Genesis Engine.
Проект: "${b.title}". Концепция: ${JSON.stringify(concept).slice(0, 1200)}. Технологии: ${JSON.stringify(tech).slice(0, 1200)}.
Сделай реалистичную оценку. Верни СТРОГО JSON:
{"capex_usd": number, "opex_annual_usd": number, "payback_years": number, "irr_percent": number, "revenue_streams": string[], "risks": [{"risk": string, "mitigation": string}], "assumptions": string[]}. Пиши по-русски.`;
}

function assemblyPrompt(b: GenesisRequestBody, all: any): string {
  return `Ты — сборочный агент Genesis Engine. Собери финальный структурированный проект.
Данные всех этапов: ${JSON.stringify(all).slice(0, 3000)}.
Верни СТРОГО JSON: {"title": string, "summary": string, "executive_summary": string, "phases": [{"name": string, "duration": string, "deliverables": string[]}], "kpis": string[]}. Пиши по-русски. title краткий, summary 1-2 предложения.`;
}

/**
 * Studio stage — generate a self-contained interactive HTML visualization
 * (Manus/Replit-style live preview). Rendered inside a sandboxed iframe on the client.
 */
function studioPrompt(b: GenesisRequestBody, all: any): string {
  return `Ты — Studio-агент Genesis Engine. Сгенерируй ЕДИНЫЙ самодостаточный HTML-документ —
интерактивную веб-визуализацию проекта "${b.title}" (дашборд: заголовок, ключевые метрики ТЭО, этапы, подобранные технологии, простой SVG/Canvas-график).
Тёмная тема, акцент #00e6c8 и #00d4ff, всё inline (CSS в <style>, JS в <script>, без внешних CDN и без fetch).
Данные проекта: ${JSON.stringify(all).slice(0, 2500)}.
Верни ТОЛЬКО HTML-код от <!DOCTYPE html> до </html>, без markdown-обёрток и пояснений.`;
}

function extractHtml(text: string): string {
  const fence = text.match(/```(?:html)?\s*([\s\S]*?)```/i);
  const candidate = fence ? fence[1] : text;
  const start = candidate.search(/<!DOCTYPE html>|<html[\s>]/i);
  if (start >= 0) return candidate.slice(start).trim();
  return candidate.trim();
}

// ── Supabase persistence (optional, service role) ────────────

async function sbInsert(table: string, row: any): Promise<any | null> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  try {
    const res = await fetch(`${url}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: key,
        Authorization: `Bearer ${key}`,
        Prefer: 'return=representation',
      },
      body: JSON.stringify(row),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as any[];
    return data?.[0] ?? null;
  } catch {
    return null;
  }
}

async function sbUpdate(table: string, id: string, patch: any): Promise<void> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return;
  try {
    await fetch(`${url}/rest/v1/${table}?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(patch),
    });
  } catch {
    /* best-effort */
  }
}

// ── Handler ──────────────────────────────────────────────────

export default async function handler(req: any, res: any) {
  // CORS (same-origin in prod, but harmless)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method not allowed', error_code: 'BAD_REQUEST' } as GenesisResponse);
    return;
  }

  // Parse body (Vercel Node functions may pass a string or parsed object)
  let body: GenesisRequestBody;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  } catch {
    res.status(400).json({ ok: false, error: 'Невалидный JSON в теле запроса', error_code: 'BAD_REQUEST', run_id: null, stages: [], project: null, token_cost: 0 } as GenesisResponse);
    return;
  }

  if (!body.input_type || !body.title || !body.description) {
    res.status(400).json({
      ok: false,
      error: 'Обязательны поля: input_type, title, description',
      error_code: 'BAD_REQUEST',
      run_id: null, stages: [], project: null, token_cost: 0,
    } as GenesisResponse);
    return;
  }

  const keys = loadKeys();
  if (keys.length === 0) {
    res.status(200).json({
      ok: false,
      error: 'Ключи Gemini не настроены в Vercel (GEMINI_API_KEY_1..N)',
      error_code: 'NO_KEYS',
      run_id: null, stages: [], project: null, token_cost: 0,
    } as GenesisResponse);
    return;
  }

  const pool = new KeyPool(keys);
  const stages: StageResult[] = [];
  let tokenCost = 0;

  // Create / reuse the run row (service-role; RLS-bypass persistence)
  let runId: string | null = body.run_id ?? null;
  if (!runId) {
    const run = await sbInsert('genesis_runs', {
      user_id: body.user_id ?? null,
      input_type: body.input_type,
      input_payload: { title: body.title, description: body.description },
      status: 'running',
    });
    runId = run?.id ?? null;
  } else {
    await sbUpdate('genesis_runs', runId, { status: 'running' });
  }

  // Helper to run one stage with timing + persistence
  async function runStage(
    stage: StageId,
    model: string,
    prompt: string,
    asJson: boolean,
  ): Promise<StageResult> {
    const t0 = Date.now();
    try {
      const text = await callGemini(pool, model, prompt, { json: asJson });
      tokenCost += Math.ceil((prompt.length + text.length) / 4); // rough token estimate
      const data = asJson ? parseJsonLoose(text) : { text };
      const result: StageResult = { stage, ok: true, model, duration_ms: Date.now() - t0, data };
      if (runId) {
        await sbInsert('genesis_steps', {
          run_id: runId, stage, prompt, response: data, model, duration_ms: result.duration_ms,
        });
      }
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const result: StageResult = { stage, ok: false, model, duration_ms: Date.now() - t0, data: null, error: msg };
      if (runId) {
        await sbInsert('genesis_steps', {
          run_id: runId, stage, prompt, response: { error: msg }, model, duration_ms: result.duration_ms,
        });
      }
      return result;
    }
  }

  try {
    // Stage 1: research (flash)
    const research = await runStage('research', FLASH, researchPrompt(body), true);
    stages.push(research);

    // Stage 2: concept (flash)
    const concept = await runStage('concept', FLASH, conceptPrompt(body, research.data), true);
    stages.push(concept);

    // Stage 3: tech-selection (flash)
    const tech = await runStage('tech-selection', FLASH, techPrompt(body, concept.data), true);
    stages.push(tech);

    // Stage 4: ТЭО (pro — heavy)
    const teo = await runStage('teo', PRO, teoPrompt(body, concept.data, tech.data), true);
    stages.push(teo);

    const bundle = {
      input: { type: body.input_type, title: body.title, description: body.description },
      research: research.data,
      concept: concept.data,
      tech: tech.data,
      teo: teo.data,
    };

    // Stage 5: studio (pro — generates interactive HTML)
    const studio = await runStage('studio', PRO, studioPrompt(body, bundle), false);
    const studioHtml = studio.ok ? extractHtml(studio.data?.text || '') : '';
    stages.push({ ...studio, data: { has_html: !!studioHtml } });

    // Stage 6: assembly (pro)
    const assembly = await runStage('assembly', PRO, assemblyPrompt(body, bundle), true);
    stages.push(assembly);

    const project = {
      title: assembly.data?.title || body.title,
      summary: assembly.data?.summary || '',
      teo: teo.data || {},
      studio_html: studioHtml,
    };

    // Persist artifacts + final project row
    if (runId) {
      if (studioHtml) {
        await sbInsert('genesis_artifacts', { run_id: runId, kind: 'studio_html', content: studioHtml });
      }
      await sbInsert('genesis_artifacts', {
        run_id: runId, kind: 'report_md', content: JSON.stringify({ ...bundle, assembly: assembly.data }, null, 2),
      });
      await sbInsert('genesis_projects', {
        run_id: runId, title: project.title, summary: project.summary, teo: project.teo, published: false,
      });
      await sbUpdate('genesis_runs', runId, { status: 'done', token_cost: tokenCost });
    }

    const anyStageFailed = stages.some((s) => !s.ok);
    res.status(200).json({
      ok: !anyStageFailed,
      run_id: runId,
      stages,
      project,
      token_cost: tokenCost,
      ...(anyStageFailed ? { error: 'Один или несколько этапов завершились с ошибкой', error_code: 'UPSTREAM' as const } : {}),
    } as GenesisResponse);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (runId) await sbUpdate('genesis_runs', runId, { status: 'error', error: msg });
    res.status(200).json({
      ok: false, run_id: runId, stages, project: null, token_cost: tokenCost,
      error: msg, error_code: 'INTERNAL',
    } as GenesisResponse);
  }
}
