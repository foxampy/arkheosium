// Project Lab — shared API contract (client mirror of api/lab-chat.ts).
// An interactive AI co-pilot workbench: the assistant helps develop a
// PROJECT or PRODUCT by conversing AND patching structured constructor blocks.
// Keep in sync with the serverless function's types.

export type LabMode = 'project' | 'product';

export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  role: ChatRole;
  content: string;
  /** Optional block ids the assistant touched in this turn (UI badge). */
  patched?: string[];
}

/** One editable card on the constructor canvas. */
export interface LabBlock {
  id: string;
  title: string;
  /** lucide icon name — resolved on the client. */
  icon: string;
  /** free-form markdown-ish content the user + AI co-edit. */
  content: string;
  /** short hint shown when the block is empty. */
  hint: string;
}

/** LLM model options exposed to the user. Server maps each to a real Gemini
 *  model + a system persona; API keys never touch the client. */
export interface LabModel {
  id: string;
  name: string;
  tagline: string;
  /** lucide icon name. */
  icon: string;
  /** accent colour for the chip. */
  color: string;
  /** 'fast' | 'deep' — surfaced as a small badge. */
  tier: 'fast' | 'deep';
}

export const LAB_MODELS: LabModel[] = [
  { id: 'aqua-flash', name: 'Aqua-Flash', tagline: 'Быстрый со-пилот, черновики и идеи', icon: 'Zap', color: '#00e6c8', tier: 'fast' },
  { id: 'genesis-pro', name: 'Genesis-Pro', tagline: 'Глубокая проработка и рассуждение', icon: 'Brain', color: '#00d4ff', tier: 'deep' },
  { id: 'architect', name: 'Архитектор', tagline: 'Системный дизайн и технологии', icon: 'Boxes', color: '#c084fc', tier: 'deep' },
  { id: 'economist', name: 'Экономист', tagline: 'ТЭО, юнит-экономика, риски', icon: 'TrendingUp', color: '#f59e0b', tier: 'deep' },
  { id: 'product-lead', name: 'Продуктолог', tagline: 'Продукт, аудитория, go-to-market', icon: 'Rocket', color: '#34d399', tier: 'fast' },
];

/** Block templates per mode. Content starts empty; hints guide the user/AI. */
export const LAB_TEMPLATES: Record<LabMode, LabBlock[]> = {
  project: [
    { id: 'concept', title: 'Концепция', icon: 'Lightbulb', content: '', hint: 'Суть и видение проекта' },
    { id: 'problem', title: 'Проблема и контекст', icon: 'AlertTriangle', content: '', hint: 'Какую задачу решаем и почему' },
    { id: 'solution', title: 'Решение', icon: 'Sparkles', content: '', hint: 'Как именно решаем' },
    { id: 'tech', title: 'Технологии и оборудование', icon: 'Cpu', content: '', hint: 'Стек, методологии, инновации' },
    { id: 'economics', title: 'Технико-экономика (ТЭО)', icon: 'DollarSign', content: '', hint: 'CAPEX, OPEX, окупаемость, IRR' },
    { id: 'roadmap', title: 'Дорожная карта', icon: 'Calendar', content: '', hint: 'Фазы, сроки, KPI' },
  ],
  product: [
    { id: 'concept', title: 'Концепция продукта', icon: 'Lightbulb', content: '', hint: 'Что за продукт и ценность' },
    { id: 'audience', title: 'Аудитория', icon: 'Users', content: '', hint: 'Сегменты, боли, JTBD' },
    { id: 'features', title: 'Функции (MVP → v1)', icon: 'ListChecks', content: '', hint: 'Ключевой функционал' },
    { id: 'tech', title: 'Технический стек', icon: 'Cpu', content: '', hint: 'Архитектура и технологии' },
    { id: 'monetization', title: 'Монетизация', icon: 'DollarSign', content: '', hint: 'Модель дохода, юнит-экономика' },
    { id: 'gtm', title: 'Go-to-market', icon: 'Rocket', content: '', hint: 'Запуск, каналы, метрики роста' },
  ],
};

export type LabErrorCode = 'NO_KEYS' | 'BAD_REQUEST' | 'UPSTREAM' | 'INTERNAL';

export interface LabChatRequest {
  model: string;
  mode: LabMode;
  messages: { role: ChatRole; content: string }[];
  blocks: { id: string; title: string; content: string }[];
}

export interface LabBlockUpdate {
  id: string;
  content: string;
}

export interface LabChatResponse {
  ok: boolean;
  reply: string;
  block_updates: LabBlockUpdate[];
  model: string;
  token_cost: number;
  error?: string;
  error_code?: LabErrorCode;
}
