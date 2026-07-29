// ═════════════════════════════════════════════════════════════════════════════
//  Группировка объектов по настоящей географии.
//
//  Что было не так. Объект приписывался к «региону» по ближайшему из восьми
//  заранее заданных центров. У такого правила нет понятия «снаружи»: точка в
//  Найроби попадала в «Израиль», потому что из восьми центров он оказался
//  ближайшим, а точка в Бразилии — в «США». Радиус кольца при этом считался от
//  числа объектов, поэтому «Израиль (299)» рисовался кругом на пол-Африки.
//  Цифра была неверной, и картинка была неверной.
//
//  Что теперь. Принадлежность определяется попаданием точки внутрь контура
//  государства (Natural Earth admin_0). Страны собираются в макрорегионы по
//  субрегионам ООН M49. Два уровня детализации:
//
//    'macro'   — «Центральная Азия», «Западная Азия», «Восточная Африка»…
//                Контур — объединение границ стран-участниц.
//    'country' — отдельные государства со своими границами.
//
//  Точка не на суше не приписывается никому. Судно, буй, морская платформа
//  возвращаются отдельным списком и рисуются как есть. Приписать их соседней
//  стране значило бы соврать в счётчике.
// ═════════════════════════════════════════════════════════════════════════════

import type { MapMarker } from '@/components/map/types';
import { macroRegion } from './geo/macroRegions';
import {
  locateCountryNear,
  type CountryBorder,
  type GeoPolygon,
  type WorldBorders,
} from './geo/worldBorders';

/** Уровень детализации группировки. */
export type GeoLevel = 'macro' | 'country';

export interface GeoGroup {
  /** Субрегион ООН для 'macro', ISO alpha-3 для 'country'. */
  id: string;
  level: GeoLevel;
  /** Название по-русски: «Центральная Азия» либо «Узбекистан». */
  name: string;
  /** Сколько объектов внутри этих границ. */
  count: number;
  color: string;
  /** Точка привязки подписи, [lat, lng]. */
  anchorLat: number;
  anchorLng: number;
  /** Настоящие контуры для отрисовки: полигон → кольцо → [lng, lat]. */
  outlines: GeoPolygon[];
  /** Ключи `type:id` вошедших объектов. */
  markerIds: string[];
  /** ISO-коды стран, попавших в группу. */
  isoCodes: string[];
}

export interface GeoGrouping {
  groups: GeoGroup[];
  /** Объекты вне суши — им не назначена ни одна страна. */
  ungrouped: MapMarker[];
}

const EMPTY: GeoGrouping = { groups: [], ungrouped: [] };

/**
 * Раскладывает объекты по настоящим государственным границам.
 *
 * Группы возвращаются по убыванию числа объектов, чтобы самые населённые
 * рисовались и подписывались первыми.
 */
export function groupMarkersByGeography(
  markers: MapMarker[],
  world: WorldBorders | null,
  level: GeoLevel = 'macro',
): GeoGrouping {
  if (!world) return EMPTY;

  interface Bucket {
    countries: Map<string, CountryBorder>;
    ids: string[];
  }
  const acc = new Map<string, Bucket>();
  const ungrouped: MapMarker[] = [];

  for (const m of markers) {
    if (typeof m.lat !== 'number' || typeof m.lng !== 'number') continue;

    const country = locateCountryNear(world, m.lng, m.lat);
    if (!country) { ungrouped.push(m); continue; }

    const key = level === 'macro' ? country.subregion : country.iso;
    const bucket = acc.get(key);
    const markerKey = `${m.type}:${m.id}`;
    if (bucket) {
      bucket.ids.push(markerKey);
      bucket.countries.set(country.iso, country);
    } else {
      acc.set(key, { countries: new Map([[country.iso, country]]), ids: [markerKey] });
    }
  }

  const groups: GeoGroup[] = [];
  for (const [key, bucket] of acc) {
    const members = [...bucket.countries.values()];

    // Контур группы — объединение контуров стран, в которых нашлись объекты.
    // Рисовать границы всего субрегиона, включая страны без единого объекта,
    // было бы обещанием присутствия, которого нет.
    const outlines: GeoPolygon[] = [];
    for (const c of members) outlines.push(...c.polygons);

    // Подпись садится на крупнейшую страну группы: это самое читаемое место,
    // и оно гарантированно на суше — в отличие от среднего арифметического,
    // которое у Западной Азии уехало бы в Персидский залив.
    const anchorHost = members.reduce((a, b) => (b.area > a.area ? b : a));

    if (level === 'macro') {
      const macro = macroRegion(key);
      groups.push({
        id: macro.id,
        level,
        name: macro.name_ru,
        count: bucket.ids.length,
        color: macro.color,
        anchorLat: anchorHost.anchor[1],
        anchorLng: anchorHost.anchor[0],
        outlines,
        markerIds: bucket.ids,
        isoCodes: members.map((c) => c.iso),
      });
    } else {
      const c = members[0];
      groups.push({
        id: c.iso,
        level,
        name: c.name_ru,
        count: bucket.ids.length,
        color: macroRegion(c.subregion).color,
        anchorLat: c.anchor[1],
        anchorLng: c.anchor[0],
        outlines,
        markerIds: bucket.ids,
        isoCodes: [c.iso],
      });
    }
  }

  groups.sort((a, b) => b.count - a.count);
  return { groups, ungrouped };
}

/** Группа Центральной Азии — сектор Арала, фокус проекта. */
export function findCentralAsia(groups: GeoGroup[]): GeoGroup | undefined {
  return groups.find((g) => g.id === 'Central Asia' || g.isoCodes.includes('UZB'));
}
