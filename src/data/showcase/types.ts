// ═══════════════════════════════════════════════════════════════
//  Витрина контура — типы
//
//  Общая витрина услуг, консалтинга, аудита, R&D, разработки,
//  платформ, решений, продуктов и исследований по всем поставщикам
//  контура: UNICAP, LabForge, DAOCIV, ArkheOS.
//
//  Дисциплина корпуса (правило проекта, не стилистика):
//
//  • Ставка не выдумывается. Разрешены только значения PriceTerms.
//    Если цифры нет — это «расчёт после разбора задачи», а не
//    правдоподобное число.
//
//  • Состояние называется своим именем. «Объявлено» — это не
//    «действует». Счётчик выполненных работ, если он равен нулю,
//    пишется как ноль, а не опускается.
//
//  • У каждой позиции есть `source` — документ или реестр, откуда
//    она взята. Позиция без основания в витрину не вносится.
//
//  • Пробелы помечаются ⟨заполнить⟩ прямо в тексте поля.
// ═══════════════════════════════════════════════════════════════

/** Вид позиции витрины. Таксономия из спецификации UNICAP Platform, раздел SHOWCASE. */
export type OfferingKind =
  | 'service'      // Услуга
  | 'consulting'   // Консалтинг
  | 'audit'        // Аудит
  | 'rnd'          // R&D
  | 'development'  // Разработка
  | 'platform'     // Платформа
  | 'solution'     // Решение
  | 'product'      // Продукт
  | 'research'     // Исследование
  | 'membership';  // Уровень участия в контуре

/** Поставщик — организация контура, которая исполняет работу. */
export type ProviderKey = 'unicap' | 'labforge' | 'daociv' | 'arkheos';

/**
 * Состояние позиции. Разделено намеренно: «объявлено» и «действует» —
 * разные вещи, и витрина не должна их смешивать.
 */
export type OfferingState =
  | 'active'      // Действует, есть развёрнутый контур
  | 'on_demand'   // Выполняется по заказу
  | 'recurring'   // Повторяющаяся работа по договору
  | 'one_time'    // Разовая работа, принимается актом
  | 'announced'   // Объявлено, открыто для заявок
  | 'development';// В разработке

/**
 * Условия оплаты. Числа в витрине не публикуются: ни одна ставка
 * контура не утверждена публично, и подставлять «от N долларов»
 * означало бы выдумать её.
 */
export type PriceTerms =
  | 'after_review'  // Расчёт после разбора задачи
  | 'after_spec'    // Расчёт после технического задания
  | 'negotiated'    // Ставка после согласования объёма
  | 'not_approved'  // Ставка не утверждена
  | 'grant';        // Грантовое финансирование

export interface ShowcaseOffering {
  id: string;
  provider: ProviderKey;
  kind: OfferingKind;
  /** Дополнительные виды: позиция может быть одновременно услугой и аудитом. */
  alsoKinds?: OfferingKind[];
  label: string;
  /** Одна фраза: что это. */
  body: string;
  /** Что входит в работу. */
  includes: string[];
  /** Что заказчик получает на руки. Артефакт, а не обещание. */
  artifact: string;
  terms: PriceTerms;
  state: OfferingState;
  /** Уточнение к состоянию: счётчики, адреса, оговорки. */
  stateNote?: string;
  /** Кому адресовано. */
  audience?: string;
  /** Чего в этой позиции нет — граница ответственности. */
  limits?: string[];
  /** Документ-основание. Обязательно. */
  source: string;
  /** Ссылки внутрь платформы: связанные модули и страницы. */
  links?: Array<{ label: string; path: string }>;
  tags?: string[];
  /** Переименование заголовков для уровней участия. */
  includesLabel?: string;
  artifactLabel?: string;
}

export interface ShowcaseProvider {
  key: ProviderKey;
  title: string;
  /** Чем занимается организация. */
  what: string;
  /** Оговорка контура: лицензии, ограничения, ответственные лица. */
  note?: string;
  source: string;
  site?: string;
  color: string;
}

export const KIND_LABEL: Record<OfferingKind, string> = {
  service: 'Услуги',
  consulting: 'Консалтинг',
  audit: 'Аудит',
  rnd: 'R&D',
  development: 'Разработка',
  platform: 'Платформы',
  solution: 'Решения',
  product: 'Продукты',
  research: 'Исследования',
  membership: 'Уровни участия',
};

/** Единственное число — для бейджа на карточке. */
export const KIND_LABEL_ONE: Record<OfferingKind, string> = {
  service: 'Услуга',
  consulting: 'Консалтинг',
  audit: 'Аудит',
  rnd: 'R&D',
  development: 'Разработка',
  platform: 'Платформа',
  solution: 'Решение',
  product: 'Продукт',
  research: 'Исследование',
  membership: 'Уровень',
};

export const KIND_ORDER: OfferingKind[] = [
  'service', 'consulting', 'audit', 'rnd', 'development',
  'platform', 'solution', 'product', 'research', 'membership',
];

export const STATE_LABEL: Record<OfferingState, string> = {
  active: 'Действует',
  on_demand: 'Выполняется по заказу',
  recurring: 'Повторяющаяся работа по договору',
  one_time: 'Разовая работа, принимается актом',
  announced: 'Объявлено, открыто для заявок',
  development: 'В разработке',
};

export const STATE_COLOR: Record<OfferingState, string> = {
  active: '#34d399',
  on_demand: '#22d3ee',
  recurring: '#60a5fa',
  one_time: '#a78bfa',
  announced: '#fbbf24',
  development: '#94a3b8',
};

export const TERMS_LABEL: Record<PriceTerms, string> = {
  after_review: 'Расчёт после разбора задачи',
  after_spec: 'Расчёт после технического задания',
  negotiated: 'Ставка после согласования объёма',
  not_approved: 'Ставка не утверждена',
  grant: 'Грантовое финансирование',
};
