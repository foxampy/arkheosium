// ─────────────────────────────────────────────────────────────────────────────
//  Сборка реестра источников: валидация, сшивка с экосистемой, выборки для UI.
//
//  Здесь добавляется вторая проверка сверх `assertDataApi`: источник не может
//  ссылаться на несуществующую программу или веху. Если запись обещает закрыть
//  веху `water-inflow`, а такой вехи в экосистеме нет — модуль не инициализируется.
//  Битая ссылка обнаруживается при сборке, а не глазами пользователя.
// ─────────────────────────────────────────────────────────────────────────────

import { DATA_APIS } from './catalogue';
import {
  API_STATUS_LABELS,
  type ApiStatus,
  type AuthMode,
  type DataApi,
  type DataDomain,
  isBrowserCallable,
} from './types';
// Внимание: рядом лежит легаси-файл `src/data/ecosystem.ts`, который перехватывает
// импорт по короткому пути. Поэтому путь указан до файла явно.
import { MILESTONES_MAP, PROGRAMS_MAP } from '../ecosystem/index';

export * from './types';
export { DATA_APIS };

// ── Проверка связности с экосистемой ─────────────────────────────────────────

(() => {
  const seen = new Set<string>();
  for (const a of DATA_APIS) {
    if (seen.has(a.id)) throw new Error(`[apis] дубликат id: ${a.id}`);
    seen.add(a.id);

    for (const pid of a.servesPrograms) {
      if (!PROGRAMS_MAP[pid]) {
        throw new Error(`[apis] ${a.id}: servesPrograms ссылается на несуществующую программу "${pid}"`);
      }
    }
    for (const mid of a.unlocksMilestones) {
      if (!MILESTONES_MAP[mid]) {
        throw new Error(`[apis] ${a.id}: unlocksMilestones ссылается на несуществующую веху "${mid}"`);
      }
    }
  }
})();

export const APIS_MAP: Record<string, DataApi> = Object.fromEntries(
  DATA_APIS.map((a) => [a.id, a]),
);

export function getDataApi(id: string): DataApi | null {
  return APIS_MAP[id] ?? null;
}

// ── Выборки ──────────────────────────────────────────────────────────────────

/** Источники, которые вызываются прямо из браузера: есть 2xx и есть CORS. */
export const BROWSER_READY: DataApi[] = DATA_APIS.filter(isBrowserCallable);

/** Источники, которым нужен серверный посредник, ключ или починка запроса. */
export const NEEDS_WORK: DataApi[] = DATA_APIS.filter((a) => a.status !== 'verified');

export function apisByDomain(d: DataDomain): DataApi[] {
  return DATA_APIS.filter((a) => a.domains.includes(d));
}

export function apisForProgram(programId: string): DataApi[] {
  return DATA_APIS.filter((a) => a.servesPrograms.includes(programId));
}

export function apisForMilestone(milestoneId: string): DataApi[] {
  return DATA_APIS.filter((a) => a.unlocksMilestones.includes(milestoneId));
}

export interface ApiFilter {
  domains?: DataDomain[];
  statuses?: ApiStatus[];
  auth?: AuthMode[];
  /** Только те, что работают из браузера без бэкенда. */
  browserOnly?: boolean;
  query?: string;
}

export function filterApis(list: DataApi[], f: ApiFilter): DataApi[] {
  const q = f.query?.trim().toLowerCase();
  return list.filter((a) => {
    if (f.domains?.length && !a.domains.some((d) => f.domains!.includes(d))) return false;
    if (f.statuses?.length && !f.statuses.includes(a.status)) return false;
    if (f.auth?.length && !f.auth.includes(a.auth)) return false;
    if (f.browserOnly && !isBrowserCallable(a)) return false;
    if (q) {
      const hay = [a.name, a.provider, a.provides, a.baseUrl, ...a.domains].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

// ── Сводка ───────────────────────────────────────────────────────────────────

export interface ApiRegistrySummary {
  total: number;
  /** Проверены живым запросом и вызываются из браузера. */
  browserReady: number;
  needsProxy: number;
  needsKey: number;
  unavailable: number;
  /** Не требуют ключа вообще. */
  keyFree: number;
  /** Сколько вех экосистемы закрывается хотя бы одним проверенным источником. */
  milestonesCovered: number;
  /** Сколько программ получает хотя бы один проверенный источник. */
  programsCovered: number;
  /** Дата самой поздней проверки. */
  lastCheckedAt: string | null;
}

export function buildApiSummary(list: DataApi[] = DATA_APIS): ApiRegistrySummary {
  const verified = list.filter(isBrowserCallable);
  const milestones = new Set<string>();
  const programs = new Set<string>();
  for (const a of verified) {
    a.unlocksMilestones.forEach((m) => milestones.add(m));
    a.servesPrograms.forEach((p) => programs.add(p));
  }
  const dates = list
    .map((a) => a.probe?.checkedAt)
    .filter((d): d is string => !!d)
    .sort();
  return {
    total: list.length,
    browserReady: verified.length,
    needsProxy: list.filter((a) => a.status === 'needs-proxy').length,
    needsKey: list.filter((a) => a.status === 'needs-key').length,
    unavailable: list.filter((a) => a.status === 'unavailable').length,
    keyFree: list.filter((a) => a.auth === 'none' || a.auth === 'user-agent').length,
    milestonesCovered: milestones.size,
    programsCovered: programs.size,
    lastCheckedAt: dates.at(-1) ?? null,
  };
}

/** Человекочитаемое объяснение статуса — для подписи в интерфейсе. */
export function statusExplanation(a: DataApi): string {
  const base = API_STATUS_LABELS[a.status];
  if (!a.probe) return base;
  return `${base} · HTTP ${a.probe.httpStatus} · CORS ${a.probe.corsAllowOrigin ?? 'нет'} · ${a.probe.checkedAt}`;
}
