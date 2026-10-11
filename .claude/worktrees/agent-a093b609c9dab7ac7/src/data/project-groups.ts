// ═══════════════════════════════════════════════════════════════
//  Project Groups — logical clusters shown as colored bbox-zones
//  on the WaterMap and as legend entries in LayerControl.
//
//  Each group can grow links to actual objects/projects/subjects via
//  objectIds[], projectIds[], subjectIds[] populated from data modules.
// ═══════════════════════════════════════════════════════════════

import type { GroupId } from '@/components/map/types';

export interface ProjectGroup {
  id: GroupId;
  name: string;
  description: string;
  /** Fill / outline color (hex). */
  color: string;
  /** [west, south, east, north] in EPSG:4326 degrees. */
  bbox: [number, number, number, number];
  /** Convenience center point [lng, lat]. */
  center: [number, number];
  objectIds: string[];
  projectIds: string[];
  subjectIds: string[];
}

export const PROJECT_GROUPS: ProjectGroup[] = [
  {
    id: 'aral',
    name: 'Восстановление Аральского моря',
    description:
      'Программа восстановления экосистемы Аральского бассейна: Каракалпакстан, Кызылординская область.',
    color: '#06b6d4',
    bbox: [58.0, 43.0, 64.0, 47.5],
    center: [60.5, 45.0],
    objectIds: [],
    projectIds: [],
    subjectIds: [],
  },
  {
    id: 'central-asia-rivers',
    name: 'Реки Центральной Азии',
    description:
      'Управление трансграничными водными ресурсами: Амударья, Сырдарья, Зеравшан, Чу, Талас.',
    color: '#22d3ee',
    bbox: [55.0, 36.0, 80.0, 46.0],
    center: [68.0, 41.0],
    objectIds: [],
    projectIds: [],
    subjectIds: [],
  },
  {
    id: 'pamir-tianshan-glaciers',
    name: 'Ледники Памира и Тянь-Шаня',
    description:
      'Мониторинг и охрана горных ледниковых систем Таджикистана и Кыргызстана.',
    color: '#a5f3fc',
    bbox: [68.0, 37.0, 80.0, 43.0],
    center: [74.0, 40.0],
    objectIds: [],
    projectIds: [],
    subjectIds: [],
  },
  {
    id: 'samarkand-water',
    name: 'Водоснабжение Самарканда',
    description:
      'Городские и пригородные системы водоснабжения, включая проект Ширин.',
    color: '#fbbf24',
    bbox: [66.6, 39.4, 67.4, 39.9],
    center: [66.97, 39.65],
    objectIds: [],
    projectIds: [],
    subjectIds: [],
  },
  {
    id: 'tashkent-metro',
    name: 'Ташкентский водопровод',
    description:
      'Водоснабжение и водоотведение Ташкента и Ташкентской области.',
    color: '#fb923c',
    bbox: [69.0, 41.0, 70.0, 41.7],
    center: [69.27, 41.31],
    objectIds: [],
    projectIds: [],
    subjectIds: [],
  },
  {
    id: 'caspian-basin',
    name: 'Каспийский регион',
    description:
      'Прибрежные водные системы Казахстана, Туркменистана, Азербайджана.',
    color: '#a78bfa',
    bbox: [46.0, 36.0, 55.0, 47.0],
    center: [50.0, 41.0],
    objectIds: [],
    projectIds: [],
    subjectIds: [],
  },
  {
    id: 'municipal-uz',
    name: 'Муниципальные проекты Узбекистана',
    description:
      'Водоснабжение и очистка для всех областных центров Узбекистана.',
    color: '#34d399',
    bbox: [55.0, 37.0, 73.0, 45.5],
    center: [64.5, 41.0],
    objectIds: [],
    projectIds: [],
    subjectIds: [],
  },
];

export const PROJECT_GROUPS_BY_ID: Record<GroupId, ProjectGroup> =
  Object.fromEntries(PROJECT_GROUPS.map((g) => [g.id, g])) as Record<
    GroupId,
    ProjectGroup
  >;

export function getGroup(id: GroupId): ProjectGroup | undefined {
  return PROJECT_GROUPS_BY_ID[id];
}
