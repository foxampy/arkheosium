// ─────────────────────────────────────────────────────────────────────────────
//  Реестр возможностей: сборка + валидация + выборки для UI.
//  Данные лежат в двух файлах-источниках и склеиваются здесь.
//  Любая запись проходит `assertOpportunity` — запись без официальной ссылки
//  или без даты сверки в приложение не попадёт.
// ─────────────────────────────────────────────────────────────────────────────

import {
  assertOpportunity,
  daysLeft,
  effectiveStatus,
  type GeoScope,
  type Opportunity,
  type OpportunityCategory,
  type OpportunityKind,
  type OpportunityStatus,
} from './types';
import { CENTRAL_ASIA_OPPORTUNITIES } from './central-asia';
import { INTERNATIONAL_OPPORTUNITIES } from './international';

/** Все возможности, отвалидированные и дедуплицированные по id. */
export const OPPORTUNITIES: Opportunity[] = (() => {
  const all = [...CENTRAL_ASIA_OPPORTUNITIES, ...INTERNATIONAL_OPPORTUNITIES];
  const seen = new Set<string>();
  return all.map((o) => {
    if (seen.has(o.id)) throw new Error(`[opportunities] дубликат id: ${o.id}`);
    seen.add(o.id);
    return assertOpportunity(o);
  });
})();

export const OPPORTUNITIES_MAP: Record<string, Opportunity> = Object.fromEntries(
  OPPORTUNITIES.map((o) => [o.id, o]),
);

export function getOpportunity(id: string): Opportunity | null {
  return OPPORTUNITIES_MAP[id] ?? null;
}

// ── Фильтрация ───────────────────────────────────────────────────────────────

export interface OpportunityFilter {
  kinds?: OpportunityKind[];
  categories?: OpportunityCategory[];
  scopes?: GeoScope[];
  statuses?: OpportunityStatus[];
  /** Только те, где заявители из ЦА точно допущены. */
  centralAsiaOnly?: boolean;
  /** Поиск по названию, организатору, тегам, описанию. */
  query?: string;
}

const CENTRAL_ASIA_SCOPES: GeoScope[] = ['uz', 'kz', 'kg', 'tj', 'tm', 'central-asia'];

export function isCentralAsiaRelevant(o: Opportunity): boolean {
  if (o.centralAsiaEligible === true) return true;
  return o.scope.some((s) => CENTRAL_ASIA_SCOPES.includes(s));
}

export function filterOpportunities(
  list: Opportunity[],
  f: OpportunityFilter,
  now = new Date(),
): Opportunity[] {
  const q = f.query?.trim().toLowerCase();
  return list.filter((o) => {
    if (f.kinds?.length && !f.kinds.includes(o.kind)) return false;
    if (f.categories?.length && !o.categories.some((c) => f.categories!.includes(c))) return false;
    if (f.scopes?.length && !o.scope.some((s) => f.scopes!.includes(s))) return false;
    if (f.statuses?.length && !f.statuses.includes(effectiveStatus(o, now))) return false;
    if (f.centralAsiaOnly && !isCentralAsiaRelevant(o)) return false;
    if (q) {
      const hay = [o.name, o.nameOriginal ?? '', o.organizer, o.description, ...o.tags]
        .join(' ')
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

// ── Сортировка ───────────────────────────────────────────────────────────────

export type OpportunitySort = 'urgency' | 'funding' | 'name';

const STATUS_WEIGHT: Record<OpportunityStatus, number> = {
  open: 0,
  upcoming: 1,
  rolling: 2,
  annual: 3,
  closed: 4,
};

/** По умолчанию: сначала открытые с ближайшим дедлайном, закрытые — в конец. */
export function sortOpportunities(
  list: Opportunity[],
  mode: OpportunitySort = 'urgency',
  now = new Date(),
): Opportunity[] {
  const out = [...list];
  if (mode === 'name') {
    return out.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  }
  if (mode === 'funding') {
    const cap = (o: Opportunity) => o.funding?.max ?? o.funding?.min ?? -1;
    return out.sort((a, b) => cap(b) - cap(a));
  }
  return out.sort((a, b) => {
    const wa = STATUS_WEIGHT[effectiveStatus(a, now)];
    const wb = STATUS_WEIGHT[effectiveStatus(b, now)];
    if (wa !== wb) return wa - wb;
    const da = daysLeft(a, now);
    const db = daysLeft(b, now);
    if (da === null && db === null) return a.name.localeCompare(b.name, 'ru');
    if (da === null) return 1;
    if (db === null) return -1;
    return da - db;
  });
}

// ── Фасеты (счётчики для чипов фильтра) ──────────────────────────────────────

export interface Facets {
  kinds: Partial<Record<OpportunityKind, number>>;
  categories: Partial<Record<OpportunityCategory, number>>;
  scopes: Partial<Record<GeoScope, number>>;
  statuses: Partial<Record<OpportunityStatus, number>>;
}

export function buildFacets(list: Opportunity[], now = new Date()): Facets {
  const f: Facets = { kinds: {}, categories: {}, scopes: {}, statuses: {} };
  for (const o of list) {
    f.kinds[o.kind] = (f.kinds[o.kind] ?? 0) + 1;
    const st = effectiveStatus(o, now);
    f.statuses[st] = (f.statuses[st] ?? 0) + 1;
    for (const c of o.categories) f.categories[c] = (f.categories[c] ?? 0) + 1;
    for (const s of o.scope) f.scopes[s] = (f.scopes[s] ?? 0) + 1;
  }
  return f;
}

// ── Сводка для шапки страницы ────────────────────────────────────────────────

export interface OpportunitySummary {
  total: number;
  open: number;
  centralAsia: number;
  /** Ближайший дедлайн среди открытых, ISO или null. */
  nextDeadline: string | null;
  /** Суммарный подтверждённый потолок финансирования в USD (только USD-записи). */
  totalCeilingUsd: number;
  /** Дата самой свежей сверки данных. */
  lastVerifiedAt: string | null;
}

export function buildSummary(list = OPPORTUNITIES, now = new Date()): OpportunitySummary {
  const open = list.filter((o) => effectiveStatus(o, now) === 'open');
  const upcoming = open
    .map((o) => o.deadline)
    .filter((d): d is string => !!d)
    .sort();
  return {
    total: list.length,
    open: open.length,
    centralAsia: list.filter(isCentralAsiaRelevant).length,
    nextDeadline: upcoming[0] ?? null,
    totalCeilingUsd: list.reduce(
      (sum, o) => sum + (o.funding?.currency === 'USD' ? (o.funding.max ?? 0) : 0),
      0,
    ),
    lastVerifiedAt: list.map((o) => o.verifiedAt).sort().at(-1) ?? null,
  };
}
