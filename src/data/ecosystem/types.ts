// ─────────────────────────────────────────────────────────────────────────────
//  Контракт «программ экосистемы» ARKHEOSIUM.
//
//  Главный принцип файла — тот же, что у реестра грантов:
//  НИ ОДНА ЦИФРА НЕ ПОДАЁТСЯ КАК ФАКТ, ЕСЛИ ОНА НЕ ПОДТВЕРЖДЕНА.
//
//  Экономический эффект здесь — это НЕ утверждение «программа принесёт $X».
//  Это модель: явные допущения (каждое со своим основанием) + формула + расчёт.
//  UI обязан показывать основание каждого допущения, поэтому поле `basis`
//  не имеет значения по умолчанию — его нельзя «забыть».
// ─────────────────────────────────────────────────────────────────────────────

/** Насколько модуль реально существует в коде — проверяется обходом `src/pages`. */
export type ModuleStatus =
  | 'live'       // работает на реальных данных
  | 'partial'    // работает, но часть данных демонстрационная
  | 'prototype'  // интерфейс есть, данных нет
  | 'planned'    // спроектировано, не построено
  | 'concept';   // только описание в документации

export const MODULE_STATUS_LABELS: Record<ModuleStatus, string> = {
  live: 'Работает на реальных данных',
  partial: 'Работает частично',
  prototype: 'Прототип интерфейса',
  planned: 'Запланировано',
  concept: 'Концепция',
};

export const MODULE_STATUS_COLORS: Record<ModuleStatus, string> = {
  live: '#34d399',
  partial: '#f59e0b',
  prototype: '#00d4ff',
  planned: '#818cf8',
  concept: '#64748b',
};

/** Фазы сквозного плана ОС (см. docs/os-backlog-v2.md, раздел 5). */
export type Phase = 'A' | 'B' | 'C' | 'D' | 'E';

export const PHASE_LABELS: Record<Phase, string> = {
  A: 'Фаза A — Ядро ОС',
  B: 'Фаза B — Данные и связи',
  C: 'Фаза C — Двойник и модель',
  D: 'Фаза D — Масштаб',
  E: 'Фаза E — ARAL NEXUS',
};

export const PHASE_COLORS: Record<Phase, string> = {
  A: '#00e6c8',
  B: '#00d4ff',
  C: '#a78bfa',
  D: '#f59e0b',
  E: '#f472b6',
};

export type MilestoneStatus = 'done' | 'in-progress' | 'blocked' | 'todo';

export const MILESTONE_STATUS_LABELS: Record<MilestoneStatus, string> = {
  done: 'Сделано',
  'in-progress': 'В работе',
  blocked: 'Заблокировано',
  todo: 'Не начато',
};

export const MILESTONE_STATUS_COLORS: Record<MilestoneStatus, string> = {
  done: '#34d399',
  'in-progress': '#00d4ff',
  blocked: '#f87171',
  todo: '#64748b',
};

export interface Milestone {
  id: string;
  phase: Phase;
  title: string;
  /** Что конкретно станет доступно пользователю, когда веха закрыта. */
  outcome: string;
  status: MilestoneStatus;
  /** id вех (в любых программах), без которых эта не может быть закрыта. */
  blockedBy: string[];
}

// ── Экономическая модель ─────────────────────────────────────────────────────

/**
 * Основание числа. Отсутствие `benchmark` — это не «плохо», это честно:
 * UI помечает такие значения как редактируемые допущения, а не как факт.
 */
export type AssumptionBasis =
  | 'benchmark'  // взято из внешнего источника, `source` обязателен
  | 'measured'   // измерено в самой системе (телеметрия, БД)
  | 'assumption';// проектное допущение, требует замены на факт

export const BASIS_LABELS: Record<AssumptionBasis, string> = {
  benchmark: 'Внешний источник',
  measured: 'Измерено системой',
  assumption: 'Проектное допущение',
};

export const BASIS_COLORS: Record<AssumptionBasis, string> = {
  benchmark: '#34d399',
  measured: '#00d4ff',
  assumption: '#f59e0b',
};

export interface SourceRef {
  title: string;
  url: string;
}

export interface Assumption {
  /** Ключ, по которому значение подставляется в формулу. */
  key: string;
  label: string;
  value: number;
  unit: string;
  basis: AssumptionBasis;
  /** Обязателен, когда basis === 'benchmark'. Проверяется `assertProgram`. */
  source?: SourceRef;
  note?: string;
}

export interface EffectFormula {
  id: string;
  label: string;
  unit: string;
  /** Человекочитаемая формула — показывается в интерфейсе рядом с числом. */
  expression: string;
  /** Чистая функция от значений допущений (по ключам). */
  compute: (a: Record<string, number>) => number;
}

export interface EconomicModel {
  /** Горизонт, на котором считается накопленный эффект. */
  horizonYears: number;
  /** Капитальные затраты. null — если сумма не подтверждена. Не выдумываем. */
  capexUsd: Assumption | null;
  assumptions: Assumption[];
  effects: EffectFormula[];
  /** Как натуральный эффект превращается в денежный поток. null — если механизм ещё не определён. */
  monetisation: string | null;
  /** Обязательная оговорка, рендерится под каждым расчётом. */
  caveat: string;
}

// ── Программа ────────────────────────────────────────────────────────────────

export type ProgramKind =
  | 'platform'    // ядро операционной системы
  | 'monitoring'  // наблюдение и измерение
  | 'engineering' // физическая инженерия
  | 'economy'     // капитал, рынок, токен
  | 'science'     // исследования
  | 'social';     // сообщество, кампании, образование

export const PROGRAM_KIND_LABELS: Record<ProgramKind, string> = {
  platform: 'Ядро ОС',
  monitoring: 'Наблюдение',
  engineering: 'Инженерия',
  economy: 'Экономика',
  science: 'Наука',
  social: 'Общество',
};

export const PROGRAM_KIND_COLORS: Record<ProgramKind, string> = {
  platform: '#00e6c8',
  monitoring: '#00d4ff',
  engineering: '#f59e0b',
  economy: '#c084fc',
  science: '#8b7cff',
  social: '#34d399',
};

/** Что программа отдаёт наружу — основа графа интеграций. */
export interface DataFlow {
  /** id программы-получателя. */
  to: string;
  /** Что именно передаётся. Конкретика, а не «данные». */
  payload: string;
  /** Реализован ли поток в коде уже сейчас. */
  implemented: boolean;
}

export interface Program {
  id: string;
  name: string;
  tagline: string;
  kind: ProgramKind;
  status: ModuleStatus;
  /** Маршруты в приложении, которые относятся к программе. */
  routes: string[];
  /** Что программа делает — одним абзацем, без маркетинга. */
  purpose: string;
  /** Что уже реально работает. Каждый пункт проверяем открытием маршрута. */
  capabilities: string[];
  /** Честный список того, чего не хватает. */
  gaps: string[];
  roadmap: Milestone[];
  /** id программ, без которых эта не работает. */
  dependsOn: string[];
  /** Исходящие потоки — чем эта программа питает остальные. */
  feeds: DataFlow[];
  /** Внешние источники данных, на которые программа опирается или будет опираться. */
  dataSources: SourceRef[];
  economics: EconomicModel | null;
}

// ── Валидация ────────────────────────────────────────────────────────────────

/**
 * Бросает на этапе инициализации модуля, если запись нарушает контракт.
 * Смысл тот же, что у `assertOpportunity`: недостоверная запись не может
 * молча доехать до интерфейса — она уронит сборку.
 */
export function assertProgram(p: Program): Program {
  const fail = (msg: string): never => {
    throw new Error(`[ecosystem] ${p.id ?? '<no id>'}: ${msg}`);
  };

  if (!p.id || !/^[a-z0-9][a-z0-9-]*$/.test(p.id)) fail('id должен быть kebab-case');
  if (!p.name?.trim()) fail('пустое name');
  if (!p.purpose?.trim()) fail('пустое purpose');
  if (!p.routes.length) fail('нужен хотя бы один маршрут');
  p.routes.forEach((r, i) => {
    if (!r.startsWith('/')) fail(`routes[${i}] должен начинаться с "/"`);
  });

  const ids = new Set<string>();
  p.roadmap.forEach((m, i) => {
    if (!m.id) fail(`roadmap[${i}]: пустой id`);
    if (ids.has(m.id)) fail(`дубликат вехи ${m.id}`);
    ids.add(m.id);
    if (!m.outcome?.trim()) fail(`веха ${m.id}: пустой outcome`);
  });

  p.dataSources.forEach((s, i) => {
    if (!/^https:\/\//.test(s.url)) fail(`dataSources[${i}].url должен быть https`);
  });

  if (p.economics) {
    const e = p.economics;
    if (e.horizonYears <= 0) fail('horizonYears должен быть > 0');
    if (!e.caveat?.trim()) fail('экономическая модель без оговорки недопустима');

    const keys = new Set<string>();
    const checkAssumption = (a: Assumption, where: string) => {
      if (!a.key) fail(`${where}: пустой key`);
      if (keys.has(a.key)) fail(`${where}: дубликат ключа допущения ${a.key}`);
      keys.add(a.key);
      if (!Number.isFinite(a.value)) fail(`${where}: value должно быть числом`);
      if (!a.unit?.trim()) fail(`${where}: пустой unit`);
      if (a.basis === 'benchmark' && !/^https:\/\//.test(a.source?.url ?? '')) {
        fail(`${where}: basis="benchmark" требует source.url (https)`);
      }
    };

    if (e.capexUsd) checkAssumption(e.capexUsd, 'capexUsd');
    e.assumptions.forEach((a, i) => checkAssumption(a, `assumptions[${i}]`));

    if (!e.effects.length) fail('экономическая модель без эффектов бессмысленна');
    e.effects.forEach((f, i) => {
      if (!f.expression?.trim()) fail(`effects[${i}]: пустая expression`);
      if (typeof f.compute !== 'function') fail(`effects[${i}]: compute должен быть функцией`);
    });
  }

  return p;
}

// ── Расчёт ───────────────────────────────────────────────────────────────────

export interface ComputedEffect {
  id: string;
  label: string;
  unit: string;
  expression: string;
  /** Значение за год. */
  perYear: number;
  /** Накопленное за горизонт модели. */
  overHorizon: number;
  /** Худшее основание среди допущений — определяет доверие к числу. */
  weakestBasis: AssumptionBasis;
}

const BASIS_RANK: Record<AssumptionBasis, number> = {
  measured: 0,
  benchmark: 1,
  assumption: 2,
};

/** Собирает `{ключ: значение}` для подстановки в формулы. */
export function assumptionValues(
  model: EconomicModel,
  overrides: Record<string, number> = {},
): Record<string, number> {
  const out: Record<string, number> = {};
  model.assumptions.forEach((a) => {
    out[a.key] = overrides[a.key] ?? a.value;
  });
  if (model.capexUsd) {
    out[model.capexUsd.key] = overrides[model.capexUsd.key] ?? model.capexUsd.value;
  }
  return out;
}

export function computeEffects(
  model: EconomicModel,
  overrides: Record<string, number> = {},
): ComputedEffect[] {
  const values = assumptionValues(model, overrides);

  const all = model.capexUsd ? [...model.assumptions, model.capexUsd] : model.assumptions;
  const weakestBasis = all.reduce<AssumptionBasis>(
    (worst, a) => (BASIS_RANK[a.basis] > BASIS_RANK[worst] ? a.basis : worst),
    'measured',
  );

  return model.effects.map((f) => {
    const perYear = f.compute(values);
    return {
      id: f.id,
      label: f.label,
      unit: f.unit,
      expression: f.expression,
      perYear,
      overHorizon: perYear * model.horizonYears,
      weakestBasis,
    };
  });
}
