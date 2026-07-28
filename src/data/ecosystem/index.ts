// ─────────────────────────────────────────────────────────────────────────────
//  Сборка слоя «экосистема»: валидация программ, граф связей, дорожная карта
//  и портфельная экономика.
//
//  Три правила, которые этот файл делает невозможными к нарушению:
//
//  1. Программа, ссылающаяся на несуществующую программу или веху, роняет
//     инициализацию модуля. Битая связь не доедет до интерфейса молча.
//  2. Портфельный итог не складывается «на глаз». Каждая сумма объявлена явно:
//     перечислены входящие эффекты и указан риск двойного счёта. Если риск есть,
//     он написан в самой записи, а не спрятан.
//  3. Основание итога — худшее основание среди слагаемых. Сумма допущений
//     остаётся допущением, сколько бы программ в неё ни вошло.
// ─────────────────────────────────────────────────────────────────────────────

import {
  assertProgram,
  computeEffects,
  type AssumptionBasis,
  type ComputedEffect,
  type Milestone,
  type MilestoneStatus,
  type Phase,
  type Program,
  type ProgramKind,
} from './types';
import { PROGRAMS as RAW_PROGRAMS } from './programs';

export * from './types';

// ── Валидация и индексы ──────────────────────────────────────────────────────

/** Программы, прошедшие контракт. Дубликат id или битая ссылка — исключение. */
export const PROGRAMS: Program[] = (() => {
  const seen = new Set<string>();
  const list = RAW_PROGRAMS.map((p) => {
    if (seen.has(p.id)) throw new Error(`[ecosystem] дубликат id программы: ${p.id}`);
    seen.add(p.id);
    return assertProgram(p);
  });

  // Ссылочная целостность: зависимости и потоки должны указывать на существующие программы.
  list.forEach((p) => {
    p.dependsOn.forEach((dep) => {
      if (!seen.has(dep)) throw new Error(`[ecosystem] ${p.id}: dependsOn ссылается на несуществующую программу "${dep}"`);
      if (dep === p.id) throw new Error(`[ecosystem] ${p.id}: программа не может зависеть от самой себя`);
    });
    p.feeds.forEach((f) => {
      if (!seen.has(f.to)) throw new Error(`[ecosystem] ${p.id}: feeds.to ссылается на несуществующую программу "${f.to}"`);
      if (f.to === p.id) throw new Error(`[ecosystem] ${p.id}: программа не может питать саму себя`);
    });
  });

  // Ссылочная целостность вех: blockedBy разрешается по всему портфелю, не только внутри программы.
  const milestoneIds = new Set<string>();
  list.forEach((p) => p.roadmap.forEach((m) => {
    if (milestoneIds.has(m.id)) throw new Error(`[ecosystem] дубликат id вехи: ${m.id}`);
    milestoneIds.add(m.id);
  }));
  list.forEach((p) => p.roadmap.forEach((m) => {
    if (m.status === 'blocked' && m.blockedBy.length === 0) {
      throw new Error(`[ecosystem] веха ${m.id} (${p.id}): статус "blocked" без указания блокирующих вех`);
    }
    m.blockedBy.forEach((b) => {
      if (!milestoneIds.has(b)) throw new Error(`[ecosystem] веха ${m.id} (${p.id}): blockedBy ссылается на несуществующую веху "${b}"`);
      if (b === m.id) throw new Error(`[ecosystem] веха ${m.id}: не может блокировать саму себя`);
    });
  }));

  // Циклы в графе блокировок: две вехи, ждущие друг друга, никогда не закроются.
  const byId = new Map(list.flatMap((p) => p.roadmap.map((m) => [m.id, m] as const)));
  const state = new Map<string, 0 | 1 | 2>();
  const walk = (id: string, path: string[]): void => {
    if (state.get(id) === 2) return;
    if (state.get(id) === 1) throw new Error(`[ecosystem] цикл блокировок: ${[...path, id].join(' → ')}`);
    state.set(id, 1);
    byId.get(id)?.blockedBy.forEach((b) => walk(b, [...path, id]));
    state.set(id, 2);
  };
  byId.forEach((_, id) => walk(id, []));

  return list;
})();

export const PROGRAMS_MAP: Record<string, Program> = Object.fromEntries(
  PROGRAMS.map((p) => [p.id, p]),
);

export function getProgram(id: string): Program | null {
  return PROGRAMS_MAP[id] ?? null;
}

/** Веха вместе с программой, которой она принадлежит. */
export interface MilestoneRef {
  milestone: Milestone;
  programId: string;
  programName: string;
}

export const MILESTONES: MilestoneRef[] = PROGRAMS.flatMap((p) =>
  p.roadmap.map((m) => ({ milestone: m, programId: p.id, programName: p.name })),
);

export const MILESTONES_MAP: Record<string, MilestoneRef> = Object.fromEntries(
  MILESTONES.map((r) => [r.milestone.id, r]),
);

export function getMilestone(id: string): MilestoneRef | null {
  return MILESTONES_MAP[id] ?? null;
}

/** Развёрнутые блокировки вехи: что именно её держит и в какой программе. */
export function resolveBlockers(id: string): MilestoneRef[] {
  const ref = MILESTONES_MAP[id];
  if (!ref) return [];
  return ref.milestone.blockedBy
    .map((b) => MILESTONES_MAP[b])
    .filter((r): r is MilestoneRef => !!r);
}

/**
 * Веха готова к работе, когда все её блокировки закрыты.
 * Вычисляется, а не проставляется руками — расхождение с графом невозможно.
 */
export function isActionable(id: string): boolean {
  return resolveBlockers(id).every((r) => r.milestone.status === 'done');
}

/**
 * Фактический статус вехи.
 *
 * «Заблокировано» — это не мнение автора данных, а свойство графа: если хоть
 * одна блокирующая веха не закрыта, веха заблокирована, что бы ни было
 * написано в поле `status`. Только так статус в интерфейсе не разойдётся
 * с реальными зависимостями при следующей правке дорожной карты.
 */
export function effectiveMilestoneStatus(id: string): MilestoneStatus {
  const ref = MILESTONES_MAP[id];
  if (!ref) return 'todo';
  const authored = ref.milestone.status;
  if (authored === 'done') return 'done';
  return isActionable(id) ? authored : 'blocked';
}

/** Вехи, которые можно брать в работу прямо сейчас: не сделаны и не заблокированы. */
export const ACTIONABLE_NOW: MilestoneRef[] = MILESTONES.filter((r) => {
  const st = effectiveMilestoneStatus(r.milestone.id);
  return st !== 'done' && st !== 'blocked';
});

/** Что именно нужно закрыть, чтобы разблокировать веху (транзитивно, только незакрытое). */
export function blockingChain(id: string, seen = new Set<string>()): MilestoneRef[] {
  resolveBlockers(id).forEach((r) => {
    if (r.milestone.status === 'done' || seen.has(r.milestone.id)) return;
    seen.add(r.milestone.id);
    blockingChain(r.milestone.id, seen);
  });
  return [...seen].map((mid) => MILESTONES_MAP[mid]);
}

// ── Граф интеграций ──────────────────────────────────────────────────────────

export interface GraphEdge {
  from: string;
  to: string;
  /** Что передаётся. Для рёбер-зависимостей — формулировка зависимости. */
  payload: string;
  /** `feeds` — поток данных наружу, `depends` — жёсткая зависимость. */
  relation: 'feeds' | 'depends';
  implemented: boolean;
}

/**
 * Рёбра графа. Потоки берутся из `feeds` (там указано, что именно передаётся),
 * зависимости — из `dependsOn`. Зависимость, у которой уже есть встречный
 * реализованный поток, не дублируется отдельным ребром.
 */
export const GRAPH_EDGES: GraphEdge[] = (() => {
  const edges: GraphEdge[] = [];
  const feedKeys = new Set<string>();

  PROGRAMS.forEach((p) => {
    p.feeds.forEach((f) => {
      feedKeys.add(`${p.id}→${f.to}`);
      edges.push({ from: p.id, to: f.to, payload: f.payload, relation: 'feeds', implemented: f.implemented });
    });
  });

  PROGRAMS.forEach((p) => {
    p.dependsOn.forEach((dep) => {
      if (feedKeys.has(`${dep}→${p.id}`)) return; // уже описано потоком
      edges.push({
        from: dep,
        to: p.id,
        payload: `${PROGRAMS_MAP[p.id].name} не работает без «${PROGRAMS_MAP[dep].name}»`,
        relation: 'depends',
        implemented: false,
      });
    });
  });

  return edges;
})();

/** Кто питает эту программу. */
export function incomingEdges(programId: string): GraphEdge[] {
  return GRAPH_EDGES.filter((e) => e.to === programId);
}

/** Кого питает эта программа. */
export function outgoingEdges(programId: string): GraphEdge[] {
  return GRAPH_EDGES.filter((e) => e.from === programId);
}

/** Программы, которые сломаются, если убрать эту (обратный индекс dependsOn). */
export const DEPENDENTS: Record<string, string[]> = (() => {
  const out: Record<string, string[]> = Object.fromEntries(PROGRAMS.map((p) => [p.id, [] as string[]]));
  PROGRAMS.forEach((p) => p.dependsOn.forEach((dep) => out[dep].push(p.id)));
  return out;
})();

/**
 * Транзитивное замыкание зависимостей — полный список того, без чего
 * программа не поедет, включая зависимости зависимостей.
 */
export function transitiveDependencies(programId: string, seen = new Set<string>()): string[] {
  const p = PROGRAMS_MAP[programId];
  if (!p) return [];
  p.dependsOn.forEach((dep) => {
    if (seen.has(dep)) return;
    seen.add(dep);
    transitiveDependencies(dep, seen);
  });
  return [...seen];
}

/** Доля реализованных потоков — честный измеритель «интеграционности». */
export interface IntegrationHealth {
  totalFlows: number;
  implementedFlows: number;
  /** 0…1 */
  ratio: number;
}

export function integrationHealth(programId?: string): IntegrationHealth {
  const flows = GRAPH_EDGES.filter(
    (e) => e.relation === 'feeds' && (!programId || e.from === programId || e.to === programId),
  );
  const implemented = flows.filter((e) => e.implemented).length;
  return {
    totalFlows: flows.length,
    implementedFlows: implemented,
    ratio: flows.length ? implemented / flows.length : 0,
  };
}

// ── Дорожная карта ───────────────────────────────────────────────────────────

export const PHASE_ORDER: Phase[] = ['A', 'B', 'C', 'D', 'E'];

export interface PhaseRollup {
  phase: Phase;
  milestones: MilestoneRef[];
  counts: Record<MilestoneStatus, number>;
  /** Доля закрытых вех фазы, 0…1. */
  progress: number;
}

export function buildPhaseRollups(list: MilestoneRef[] = MILESTONES): PhaseRollup[] {
  return PHASE_ORDER.map((phase) => {
    const milestones = list.filter((r) => r.milestone.phase === phase);
    const counts: Record<MilestoneStatus, number> = { done: 0, 'in-progress': 0, blocked: 0, todo: 0 };
    milestones.forEach((r) => { counts[effectiveMilestoneStatus(r.milestone.id)] += 1; });
    return {
      phase,
      milestones,
      counts,
      progress: milestones.length ? counts.done / milestones.length : 0,
    };
  });
}

export interface ProgramProgress {
  total: number;
  done: number;
  blocked: number;
  /** 0…1 */
  ratio: number;
}

export function programProgress(programId: string): ProgramProgress {
  const p = PROGRAMS_MAP[programId];
  const total = p?.roadmap.length ?? 0;
  const done = p?.roadmap.filter((m) => m.status === 'done').length ?? 0;
  const blocked = p?.roadmap.filter((m) => effectiveMilestoneStatus(m.id) === 'blocked').length ?? 0;
  return { total, done, blocked, ratio: total ? done / total : 0 };
}

// ── Экономика: программа ─────────────────────────────────────────────────────

export interface ProgramEconomics {
  programId: string;
  programName: string;
  horizonYears: number;
  effects: ComputedEffect[];
  monetisation: string | null;
  caveat: string;
}

/** Расчёт по всем программам, у которых модель объявлена. `null` не выдумываем. */
export function computePortfolio(
  overrides: Record<string, Record<string, number>> = {},
): ProgramEconomics[] {
  return PROGRAMS.filter((p) => p.economics).map((p) => ({
    programId: p.id,
    programName: p.name,
    horizonYears: p.economics!.horizonYears,
    effects: computeEffects(p.economics!, overrides[p.id] ?? {}),
    monetisation: p.economics!.monetisation,
    caveat: p.economics!.caveat,
  }));
}

// ── Экономика: портфель ──────────────────────────────────────────────────────

/**
 * Объявленная портфельная сумма.
 *
 * Здесь нет автоматического «сложим всё, у чего совпал юнит». Такая сумма врёт:
 * вода, сэкономленная за счёт наблюдения, и вода, сэкономленная за счёт точного
 * полива, частично одна и та же вода. Поэтому каждый итог объявлен вручную,
 * с перечнем слагаемых и прямым указанием, есть ли пересечение.
 */
export interface PortfolioTotalSpec {
  id: string;
  label: string;
  unit: string;
  /** id эффектов (из `EffectFormula.id`), которые складываются. */
  members: string[];
  /** Почему эти эффекты вообще складываются в один показатель. */
  rationale: string;
  /**
   * Пересекаются ли слагаемые физически. `true` — сумма является верхней
   * границей, а не ожидаемым значением, и UI обязан это показать.
   */
  doubleCountingRisk: boolean;
  /** Пояснение к риску. Обязательно, когда `doubleCountingRisk === true`. */
  overlapNote?: string;
}

export const PORTFOLIO_TOTALS: PortfolioTotalSpec[] = [
  {
    id: 'total-water-saved',
    label: 'Сэкономленная вода по портфелю',
    unit: 'млн м³/год',
    members: ['obs-water-saved', 'water-saved', 'agri-water-saved'],
    rationale:
      'Три программы сокращают потери воды на разных участках пути: наблюдение — за счёт информированных решений, ' +
      'восстановление — за счёт устранения потерь в сети, агротех — за счёт нормирования полива на поле.',
    doubleCountingRisk: true,
    overlapNote:
      'Один и тот же кубометр может быть посчитан дважды: решение, принятое по телеметрии, часто и есть решение ' +
      'об изменении водоподачи на поле. До разделения контуров учёта сумму следует читать как верхнюю границу.',
  },
  {
    id: 'total-money',
    label: 'Денежный эффект по портфелю',
    unit: 'млн USD/год',
    members: ['water-value', 'energy-value', 'agri-yield-value', 'fund-extra-capital'],
    rationale:
      'Складываются потоки разной природы: стоимость сэкономленной воды, замещённая электроэнергия, ' +
      'прирост валового сбора и привлечённое грантовое финансирование.',
    doubleCountingRisk: true,
    overlapNote:
      'Стоимость сэкономленной воды (water-value) и прирост урожая (agri-yield-value) частично описывают один ' +
      'и тот же гектар. Кроме того, грантовое финансирование — это приток капитала, а не операционная выгода; ' +
      'складывать его с операционными эффектами корректно только для оценки совокупного денежного потока.',
  },
  {
    id: 'total-energy',
    label: 'Собственная генерация',
    unit: 'ГВт·ч/год',
    members: ['energy-output'],
    rationale: 'Единственная программа портфеля, производящая энергию.',
    doubleCountingRisk: false,
  },
];

export interface PortfolioTotal extends PortfolioTotalSpec {
  perYear: number;
  overHorizon: number;
  /** Максимальный горизонт среди программ-слагаемых. */
  horizonYears: number;
  /** Худшее основание среди слагаемых. Сумма допущений остаётся допущением. */
  weakestBasis: AssumptionBasis;
  /** Сколько объявленных слагаемых реально нашлось в расчёте. */
  resolvedMembers: number;
}

const BASIS_RANK: Record<AssumptionBasis, number> = { measured: 0, benchmark: 1, assumption: 2 };

export function computePortfolioTotals(
  overrides: Record<string, Record<string, number>> = {},
): PortfolioTotal[] {
  const byProgram = computePortfolio(overrides);
  const flat = byProgram.flatMap((p) =>
    p.effects.map((e) => ({ effect: e, horizonYears: p.horizonYears })),
  );
  const index = new Map(flat.map((x) => [x.effect.id, x]));

  return PORTFOLIO_TOTALS.map((spec) => {
    const found = spec.members.map((id) => index.get(id)).filter((x): x is NonNullable<typeof x> => !!x);

    const perYear = found.reduce((s, x) => s + x.effect.perYear, 0);
    const horizonYears = found.reduce((h, x) => Math.max(h, x.horizonYears), 0);
    const weakestBasis = found.reduce<AssumptionBasis>(
      (worst, x) => (BASIS_RANK[x.effect.weakestBasis] > BASIS_RANK[worst] ? x.effect.weakestBasis : worst),
      'measured',
    );

    return {
      ...spec,
      perYear,
      // Накопление считается по максимальному горизонту, но слагаемые с более
      // коротким горизонтом за его пределами уже не работают — поэтому это
      // тоже верхняя граница, а не точное значение.
      overHorizon: found.reduce((s, x) => s + x.effect.perYear * x.horizonYears, 0),
      horizonYears,
      weakestBasis,
      resolvedMembers: found.length,
    };
  });
}

/**
 * Синергия — эффект, которого нет ни у одной программы по отдельности.
 * Числа здесь намеренно отсутствуют: синергия проявляется после соединения
 * потоков, и до этого момента любая цифра была бы выдумкой.
 */
export interface Synergy {
  id: string;
  /** Программы, чьё соединение даёт эффект. */
  programs: string[];
  title: string;
  /** Что становится возможным. */
  outcome: string;
  /** Вехи, после закрытия которых синергия становится доступной. */
  unlockedBy: string[];
}

export const SYNERGIES: Synergy[] = [
  {
    id: 'syn-observed-water-balance',
    programs: ['observation', 'water-restoration', 'agritech'],
    title: 'Замкнутый водный баланс',
    outcome:
      'Спутниковый индекс, телеметрия сети и поливной план на поле сходятся в один баланс: видно, где кубометр ' +
      'потерян, и кто именно его теряет. Это превращает три оценки экономии в одну проверяемую цифру и снимает ' +
      'двойной счёт из портфельного итога.',
    unlockedBy: ['obs-sentinel', 'water-inflow', 'agri-irrigation-plan'],
  },
  {
    id: 'syn-energy-water',
    programs: ['energy-hydrogen', 'water-restoration'],
    title: 'Энергия под водную задачу',
    outcome:
      'Расчёт генерации привязывается к энергопотреблению насосов и опреснения: становится видно, ' +
      'обеспечен ли водный сценарий энергией, а не только водой.',
    unlockedBy: ['energy-resource', 'energy-demand-link'],
  },
  {
    id: 'syn-climate-everything',
    programs: ['climate-engineering', 'agritech', 'water-restoration', 'energy-hydrogen'],
    title: 'Общий климатический сценарий',
    outcome:
      'Один набор климатических сценариев питает водную, аграрную и энергетическую модели. Программы перестают ' +
      'считать по разным допущениям о будущем, и их результаты становятся сопоставимыми.',
    unlockedBy: ['climate-scenarios', 'climate-to-indices'],
  },
  {
    id: 'syn-funding-to-projects',
    programs: ['funding-registry', 'capital-dao', 'science-rnd'],
    title: 'От программы финансирования до проекта',
    outcome:
      'Подтверждённая программа финансирования связывается с конкретным проектом и командой: реестр перестаёт ' +
      'быть справочником и становится входом в воронку капитала.',
    unlockedBy: ['fund-verify', 'fund-match', 'cap-project-funding'],
  },
  {
    id: 'syn-twin',
    programs: ['observation', 'island-city', 'mobility-robotics'],
    title: 'Цифровой двойник территории',
    outcome:
      'Телеметрия датчиков, транспорт и городской баланс сходятся на одной 3D-сцене объекта: состояние ' +
      'территории читается целиком, а не по отдельным дашбордам.',
    unlockedBy: ['obs-sensors-real', 'obs-twin', 'city-twin', 'mob-sensor-carrier'],
  },
];

export function synergiesFor(programId: string): Synergy[] {
  return SYNERGIES.filter((s) => s.programs.includes(programId));
}

/** Синергия доступна, когда все разблокирующие вехи закрыты. */
export function synergyUnlocked(s: Synergy): boolean {
  return s.unlockedBy.every((id) => MILESTONES_MAP[id]?.milestone.status === 'done');
}

// ── Сводка портфеля ──────────────────────────────────────────────────────────

export interface EcosystemSummary {
  programs: number;
  byStatus: Record<string, number>;
  byKind: Record<ProgramKind, number>;
  milestones: number;
  milestonesDone: number;
  milestonesBlocked: number;
  actionableNow: number;
  flows: number;
  flowsImplemented: number;
  /** Сколько программ имеют объявленную экономическую модель. */
  withEconomics: number;
  /** Сколько источников данных объявлено суммарно (уникальных URL). */
  dataSources: number;
}

export function buildEcosystemSummary(list: Program[] = PROGRAMS): EcosystemSummary {
  const byStatus: Record<string, number> = {};
  const byKind = {} as Record<ProgramKind, number>;
  const urls = new Set<string>();

  list.forEach((p) => {
    byStatus[p.status] = (byStatus[p.status] ?? 0) + 1;
    byKind[p.kind] = (byKind[p.kind] ?? 0) + 1;
    p.dataSources.forEach((s) => urls.add(s.url));
  });

  const ms = list.flatMap((p) => p.roadmap);
  const health = integrationHealth();

  return {
    programs: list.length,
    byStatus,
    byKind,
    milestones: ms.length,
    milestonesDone: ms.filter((m) => m.status === 'done').length,
    milestonesBlocked: ms.filter((m) => effectiveMilestoneStatus(m.id) === 'blocked').length,
    actionableNow: ACTIONABLE_NOW.length,
    flows: health.totalFlows,
    flowsImplemented: health.implementedFlows,
    withEconomics: list.filter((p) => p.economics).length,
    dataSources: urls.size,
  };
}

/** Все внешние источники данных портфеля, без дубликатов, для страницы прозрачности. */
export const ALL_DATA_SOURCES = (() => {
  const map = new Map<string, { title: string; url: string; usedBy: string[] }>();
  PROGRAMS.forEach((p) => {
    p.dataSources.forEach((s) => {
      const hit = map.get(s.url);
      if (hit) hit.usedBy.push(p.id);
      else map.set(s.url, { title: s.title, url: s.url, usedBy: [p.id] });
    });
    // Источники, спрятанные в допущениях, тоже должны быть видимы.
    p.economics?.assumptions.forEach((a) => {
      if (!a.source) return;
      const hit = map.get(a.source.url);
      if (hit) { if (!hit.usedBy.includes(p.id)) hit.usedBy.push(p.id); }
      else map.set(a.source.url, { title: a.source.title, url: a.source.url, usedBy: [p.id] });
    });
  });
  return [...map.values()].sort((a, b) => a.title.localeCompare(b.title, 'ru'));
})();
