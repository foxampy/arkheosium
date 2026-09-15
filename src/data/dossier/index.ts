/**
 * Реестр досье.
 *
 * Одно место, из которого страница узнаёт о существовании проекта.
 * Маршрут `/project/:id` не знает ни одного проекта по имени — он берёт
 * запись из этого массива. Добавление досье означает ровно одну правку:
 * импорт и строку здесь; ни страница, ни навигация не трогаются.
 */

import type { ProjectDossier } from './types';
import { NEW_UZBEKISTAN } from './new-uzbekistan';
import { ETHOSIUM } from './ethosium';
import { ARAL } from './aral';
import { LABFORGE } from './labforge';

export const DOSSIERS: readonly ProjectDossier[] = [
  NEW_UZBEKISTAN,
  ETHOSIUM,
  ARAL,
  LABFORGE,
];

export function getDossier(id: string | undefined): ProjectDossier | undefined {
  if (!id) return undefined;
  return DOSSIERS.find((d) => d.id === id);
}

/** Досье, привязанные к сборке контура: карточка сборки ведёт в них. */
export function dossiersForBuild(buildId: string): ProjectDossier[] {
  return DOSSIERS.filter((d) => d.buildId === buildId);
}

export type { ProjectDossier };
export * from './types';
