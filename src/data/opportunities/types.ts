// ─────────────────────────────────────────────────────────────────────────────
//  Opportunities — гранты, конкурсы, хакатоны, премии, акселераторы
// ─────────────────────────────────────────────────────────────────────────────
//  ЖЁСТКОЕ ПРАВИЛО ДАННЫХ (data contract):
//  В этом модуле НЕТ примерных, демонстрационных или выдуманных записей.
//  Каждая запись обязана иметь:
//    • `url`   — рабочую официальную ссылку, которую реально открывали;
//    • `verifiedAt` — дату, когда факты сверялись с первоисточником;
//    • `sources`    — минимум один первоисточник.
//  Если факт (сумма, дедлайн, право на участие) не подтверждён — поле = null.
//  Пустое поле честнее выдуманного. Записи без `url` в модуль не попадают —
//  это проверяется в `assertOpportunity()` ниже и в unit-тесте реестра.
// ─────────────────────────────────────────────────────────────────────────────

/** Что это за возможность. */
export type OpportunityKind =
  | 'grant' // грант / субсидия
  | 'contest' // конкурс проектов
  | 'hackathon' // хакатон
  | 'prize' // премия / award
  | 'accelerator' // акселератор / инкубатор
  | 'fellowship'; // стипендия / фелоушип

/** Жизненный цикл заявки. */
export type OpportunityStatus =
  | 'open' // приём заявок идёт сейчас
  | 'upcoming' // объявлен, приём ещё не открыт
  | 'rolling' // приём без дедлайна, на постоянной основе
  | 'annual' // ежегодный цикл, текущее окно закрыто, следующее ожидается
  | 'closed'; // окно закрыто, оставлено для истории

/** Тематика. Одна возможность может относиться к нескольким. */
export type OpportunityCategory =
  | 'ecology'
  | 'water'
  | 'climate'
  | 'engineering'
  | 'energy'
  | 'rnd'
  | 'digital'
  | 'web3'
  | 'depin'
  | 'refi'
  | 'startup'
  | 'education';

/** География: национальные коды ЦА + региональные/глобальные зонты. */
export type GeoScope =
  | 'uz'
  | 'kz'
  | 'kg'
  | 'tj'
  | 'tm'
  | 'central-asia'
  | 'eu'
  | 'asia'
  | 'global';

export type Currency = 'USD' | 'EUR' | 'GBP' | 'CHF' | 'UZS' | 'KZT';

/** Объём финансирования. Любое поле может быть null — не выдумываем. */
export interface FundingRange {
  min: number | null;
  max: number | null;
  currency: Currency;
  /** Что именно покрывает сумма (RU), если это указано в источнике. */
  covers: string | null;
}

/** Первоисточник факта. */
export interface OpportunitySource {
  /** Заголовок страницы/документа. */
  title: string;
  url: string;
}

export interface Opportunity {
  /** kebab-case, уникален в реестре. */
  id: string;
  /** Название на русском/английском — как в UI. */
  name: string;
  /** Оригинальное название на языке организатора, если отличается. */
  nameOriginal: string | null;

  organizer: string;
  organizerUrl: string | null;

  kind: OpportunityKind;
  categories: OpportunityCategory[];
  scope: GeoScope[];
  status: OpportunityStatus;

  /** ISO `YYYY-MM-DD`. null = дата не объявлена/не подтверждена. */
  opensAt: string | null;
  /** ISO `YYYY-MM-DD`. null = нет дедлайна (rolling) либо не подтверждён. */
  deadline: string | null;

  funding: FundingRange | null;

  /** Кто может подавать (RU). */
  eligibility: string;
  /**
   * Могут ли подавать заявители из Центральной Азии.
   * null = в источнике явно не сказано (показываем «уточняется»).
   */
  centralAsiaEligible: boolean | null;

  /** Официальная страница программы. Обязательна. */
  url: string;
  /** 1–3 предложения на русском. */
  description: string;

  tags: string[];

  /** ISO-дата последней сверки с первоисточником. Обязательна. */
  verifiedAt: string;
  /** Минимум один первоисточник. Обязателен. */
  sources: OpportunitySource[];
}

// ── Валидация контракта данных ───────────────────────────────────────────────

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Бросает исключение, если запись нарушает контракт данных.
 * Вызывается один раз при сборке реестра — «мусорная» запись не попадёт в UI.
 */
export function assertOpportunity(o: Opportunity): Opportunity {
  const fail = (msg: string): never => {
    throw new Error(`[opportunities] ${o.id ?? '<no id>'}: ${msg}`);
  };

  if (!o.id || !/^[a-z0-9][a-z0-9-]*$/.test(o.id)) fail('id должен быть kebab-case');
  if (!o.name?.trim()) fail('пустое name');
  if (!o.organizer?.trim()) fail('пустой organizer');
  if (!o.description?.trim()) fail('пустое description');
  if (!o.eligibility?.trim()) fail('пустое eligibility');
  if (!/^https:\/\//.test(o.url)) fail('url обязателен и должен быть https');
  if (!ISO_DATE.test(o.verifiedAt)) fail('verifiedAt должен быть YYYY-MM-DD');
  if (!o.sources?.length) fail('нужен хотя бы один первоисточник');
  o.sources.forEach((s, i) => {
    if (!/^https:\/\//.test(s.url)) fail(`sources[${i}].url должен быть https`);
  });
  if (!o.categories.length) fail('нужна хотя бы одна категория');
  if (!o.scope.length) fail('нужен хотя бы один scope');
  if (o.opensAt !== null && !ISO_DATE.test(o.opensAt)) fail('opensAt должен быть YYYY-MM-DD или null');
  if (o.deadline !== null && !ISO_DATE.test(o.deadline)) fail('deadline должен быть YYYY-MM-DD или null');
  if (o.opensAt && o.deadline && o.opensAt > o.deadline) fail('opensAt позже deadline');

  return o;
}

// ── Производные вычисления ───────────────────────────────────────────────────

/** Дней до дедлайна. null — если дедлайна нет. Отрицательное — просрочено. */
export function daysLeft(o: Opportunity, now = new Date()): number | null {
  if (!o.deadline) return null;
  const d = new Date(`${o.deadline}T23:59:59Z`).getTime();
  return Math.ceil((d - now.getTime()) / 86_400_000);
}

/**
 * Статус с поправкой на текущую дату: запись, помеченная `open`, но с уже
 * прошедшим дедлайном, показывается как `closed` — витрина не врёт.
 */
export function effectiveStatus(o: Opportunity, now = new Date()): OpportunityStatus {
  const left = daysLeft(o, now);
  if (left !== null && left < 0) return o.status === 'annual' ? 'annual' : 'closed';
  if (o.status === 'upcoming' && o.opensAt && o.opensAt <= now.toISOString().slice(0, 10)) {
    return 'open';
  }
  return o.status;
}

/** Форматирование суммы для карточки: «$50 000 — $500 000». */
export function formatFunding(f: FundingRange | null): string | null {
  if (!f) return null;
  const sym: Record<Currency, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    CHF: 'CHF ',
    UZS: 'сум ',
    KZT: '₸',
  };
  const n = (v: number) => v.toLocaleString('ru-RU').replace(/ /g, ' ');
  const s = sym[f.currency];
  if (f.min !== null && f.max !== null) {
    return f.min === f.max ? `${s}${n(f.max)}` : `${s}${n(f.min)} — ${s}${n(f.max)}`;
  }
  if (f.max !== null) return `до ${s}${n(f.max)}`;
  if (f.min !== null) return `от ${s}${n(f.min)}`;
  return null;
}

// ── Справочники для UI ───────────────────────────────────────────────────────

export const KIND_LABELS: Record<OpportunityKind, string> = {
  grant: 'Грант',
  contest: 'Конкурс',
  hackathon: 'Хакатон',
  prize: 'Премия',
  accelerator: 'Акселератор',
  fellowship: 'Стипендия',
};

export const KIND_PLURAL: Record<OpportunityKind, string> = {
  grant: 'Гранты',
  contest: 'Конкурсы',
  hackathon: 'Хакатоны',
  prize: 'Премии',
  accelerator: 'Акселераторы',
  fellowship: 'Стипендии',
};

export const STATUS_LABELS: Record<OpportunityStatus, string> = {
  open: 'Приём открыт',
  upcoming: 'Скоро откроется',
  rolling: 'Без дедлайна',
  annual: 'Ежегодный цикл',
  closed: 'Приём закрыт',
};

export const STATUS_COLORS: Record<OpportunityStatus, string> = {
  open: '#34d399',
  upcoming: '#00d4ff',
  rolling: '#a3e635',
  annual: '#c084fc',
  closed: '#64748b',
};

export const CATEGORY_LABELS: Record<OpportunityCategory, string> = {
  ecology: 'Экология',
  water: 'Вода',
  climate: 'Климат',
  engineering: 'Инженерия',
  energy: 'Энергетика',
  rnd: 'R&D / наука',
  digital: 'Цифра / IT',
  web3: 'Web3',
  depin: 'DePIN',
  refi: 'ReFi',
  startup: 'Стартапы',
  education: 'Образование',
};

export const CATEGORY_COLORS: Record<OpportunityCategory, string> = {
  ecology: '#34d399',
  water: '#00e6c8',
  climate: '#7dd3fc',
  engineering: '#00d4ff',
  energy: '#f59e0b',
  rnd: '#c084fc',
  digital: '#818cf8',
  web3: '#f472b6',
  depin: '#fb923c',
  refi: '#a3e635',
  startup: '#facc15',
  education: '#5eead4',
};

export const SCOPE_LABELS: Record<GeoScope, string> = {
  uz: 'Узбекистан',
  kz: 'Казахстан',
  kg: 'Кыргызстан',
  tj: 'Таджикистан',
  tm: 'Туркменистан',
  'central-asia': 'Центральная Азия',
  eu: 'ЕС',
  asia: 'Азия',
  global: 'Весь мир',
};
