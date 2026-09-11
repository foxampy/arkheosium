// Иерархическая географическая группировка меток карты.
//
// Карта группирует так же, как глобус: по настоящим государственным границам
// (Natural Earth admin_0) через тот же атлас, что и `regionGrouping.ts`. Это
// не декоративное совпадение — если карта и глобус считают по разным правилам,
// они показывают разные числа для одного набора объектов.
//
// Уровень зависит от зума: макрорегион → страна → область → отдельные метки.
// Область берётся из поля `region` самой метки: контуров admin_1 в атласе нет,
// и выдумывать их по координате было бы догадкой, а не данными.

import { DOMAIN_CONFIG, normalizeDomain, type DomainKey } from '@/lib/domains';
import { locateCountryNear, type WorldBorders } from '@/lib/geo/worldBorders';
import { macroRegion } from '@/lib/geo/macroRegions';
import { findPlace } from '@/lib/geo/regions';

export type ClusterLevel = 'macro' | 'country' | 'region';

export interface ClusterableMarker {
  lat: number;
  lng: number;
  country?: string;
  region?: string;
  district?: string;
  domain?: string;
}

export interface DomainCount {
  domain: DomainKey;
  count: number;
}

export interface GeoCluster<T extends ClusterableMarker> {
  id: string;
  level: ClusterLevel;
  label: string;
  lat: number;
  lng: number;
  /** Цвет преобладающего домена группы — `DOMAIN_CONFIG[key].color`. */
  color: string;
  /** Охват меток группы: [west, south, east, north]. Клик приближает сюда. */
  bounds: [number, number, number, number];
  markers: T[];
  byDomain: DomainCount[];
}

export interface ClusterResult<T extends ClusterableMarker> {
  /** Метки, показываемые как есть: одиночки и всё, что не легло в группу. */
  single: T[];
  clusters: GeoCluster<T>[];
}

const ZOOM_BREAKPOINTS: ReadonlyArray<{ maxZoom: number; level: ClusterLevel }> = [
  { maxZoom: 3.5, level: 'macro' },
  { maxZoom: 5.5, level: 'country' },
  { maxZoom: 8, level: 'region' },
];

/** Уровень агрегации для зума, либо null — показывать отдельные метки. */
export function levelForZoom(zoom: number): ClusterLevel | null {
  return ZOOM_BREAKPOINTS.find((b) => zoom < b.maxZoom)?.level ?? null;
}

/** Зум, на который переходим при клике по чипу — начало следующего уровня. */
export function zoomForDrilldown(level: ClusterLevel): number {
  if (level === 'macro') return 4;
  if (level === 'country') return 6;
  return 8.5;
}

/**
 * Итоговый зум перехода внутрь группы.
 *
 * За основу берётся зум, подобранный `cameraForBounds` под охват меток группы —
 * приближаем ровно туда, где объекты лежат. Но он зажат с двух сторон:
 *
 *  - снизу — началом следующего уровня. Раскинутая группа (Южная Америка,
 *    Россия) целиком помещается на зуме текущего уровня, и без нижней границы
 *    чип собрался бы заново на том же месте: клик выглядел бы сломанным.
 *  - сверху — тремя ступенями от него. Две метки в одном городе дают почти
 *    нулевую рамку, а по ней `cameraForBounds` уходит на предельный зум, где
 *    вокруг уже нет никакого контекста.
 */
export function clampDrilldownZoom(
  level: ClusterLevel,
  fittedZoom: number | undefined,
  maxZoom: number,
): number {
  const floor = zoomForDrilldown(level);
  if (fittedZoom === undefined || !Number.isFinite(fittedZoom)) {
    return Math.min(floor, maxZoom);
  }
  return Math.min(Math.max(fittedZoom, floor), floor + 3, maxZoom);
}

function countByDomain(markers: ClusterableMarker[]): DomainCount[] {
  const tally = new Map<DomainKey, number>();
  for (const m of markers) {
    const d = normalizeDomain(m.domain);
    tally.set(d, (tally.get(d) ?? 0) + 1);
  }
  return [...tally.entries()]
    .map(([domain, count]) => ({ domain, count }))
    .sort((a, b) => b.count - a.count || a.domain.localeCompare(b.domain));
}

function meanCoords(markers: ClusterableMarker[]): { lat: number; lng: number } {
  const n = markers.length;
  return {
    lat: markers.reduce((s, m) => s + m.lat, 0) / n,
    lng: markers.reduce((s, m) => s + m.lng, 0) / n,
  };
}

/**
 * Охват меток группы, [west, south, east, north].
 *
 * Считается по самим меткам, а не по контуру страны: приближать нужно туда,
 * где объекты действительно лежат. У России контур тянется на полмира, а
 * объекты могут стоять кучей под Волгоградом — по контуру мы бы отъехали в
 * пустоту.
 *
 * Вырожденный случай (все метки в одной точке) даёт нулевую рамку. Её
 * расширяет вызывающая сторона: `fitBounds` от нулевой рамки уходит на
 * максимальный зум.
 */
function boundsOf(markers: ClusterableMarker[]): [number, number, number, number] {
  let west = Infinity;
  let south = Infinity;
  let east = -Infinity;
  let north = -Infinity;
  for (const m of markers) {
    if (m.lng < west) west = m.lng;
    if (m.lng > east) east = m.lng;
    if (m.lat < south) south = m.lat;
    if (m.lat > north) north = m.lat;
  }
  return [west, south, east, north];
}

interface Bucket<T> {
  label: string;
  /** Якорь подписи, если он известен из атласа. */
  anchor?: { lat: number; lng: number };
  /** Площадь страны, давшей якорь: подпись садится на крупнейшую из группы. */
  hostArea: number;
  markers: T[];
}

/**
 * Группирует метки по настоящей географии.
 *
 * Точка не на суше не приписывается никакой стране — буй, судно и морская
 * платформа возвращаются в `single` и рисуются как есть. Приписать их берегу
 * значило бы соврать в счётчике чипа.
 *
 * Группа из одной метки чипом не становится: чип с единицей ничего не
 * сообщает, а саму метку прячет.
 */
export function clusterByGeography<T extends ClusterableMarker>(
  markers: T[],
  world: WorldBorders | null,
  zoom: number,
): ClusterResult<T> {
  const level = levelForZoom(zoom);
  if (!level || !world) return { single: markers, clusters: [] };

  const buckets = new Map<string, Bucket<T>>();
  const single: T[] = [];

  for (const m of markers) {
    if (typeof m.lat !== 'number' || typeof m.lng !== 'number') continue;

    const country = locateCountryNear(world, m.lng, m.lat);
    if (!country) {
      single.push(m);
      continue;
    }

    const macro = macroRegion(country.subregion);
    // На уровне области метка без области падает до страны: объект остаётся
    // видимым в общей группе, а не исчезает из-за неполноты данных.
    //
    // Название приводится к каноническому: в данных область записана то как
    // «Jizzakh», то как «Джиззакская область». Без нормализации это две разные
    // группы в одной точке.
    const raw = level === 'region' ? m.region?.trim() : undefined;
    const place = raw ? findPlace(raw) : undefined;
    const region = place?.name ?? raw;

    const key =
      level === 'macro' ? `macro:${macro.id}`
        : level === 'country' ? `country:${country.iso}`
          : region ? `region:${country.iso}:${region}` : `country:${country.iso}`;

    // Область вне реестра якоря не получает — её чип встанет по среднему своих
    // меток. Посадить его в центр страны значило бы собрать там все незнакомые
    // области в одну точку.
    const anchor = place
      ? { lat: place.lat, lng: place.lng }
      : region ? undefined
        : { lat: country.anchor[1], lng: country.anchor[0] };

    const existing = buckets.get(key);
    if (existing) {
      existing.markers.push(m);
      // Подпись макрогруппы садится на крупнейшую её страну: это читаемое
      // место и оно гарантированно на суше, в отличие от среднего по меткам.
      if (!region && country.area > existing.hostArea) {
        existing.anchor = anchor;
        existing.hostArea = country.area;
      }
      continue;
    }

    buckets.set(key, {
      label: level === 'macro' ? macro.name_ru : region ?? country.name_ru,
      anchor,
      hostArea: country.area,
      markers: [m],
    });
  }

  const clusters: GeoCluster<T>[] = [];
  for (const [id, bucket] of buckets) {
    if (bucket.markers.length === 1) {
      single.push(bucket.markers[0]);
      continue;
    }
    const at = bucket.anchor ?? meanCoords(bucket.markers);
    // Цвет группы — цвет преобладающего домена: `byDomain` отсортирован по
    // убыванию, поэтому первый элемент и есть преобладающий. Так чип на карте
    // читается тем же кодом цвета, что и одиночные метки под ним.
    const byDomain = countByDomain(bucket.markers);
    clusters.push({
      id,
      level,
      label: bucket.label,
      lat: at.lat,
      lng: at.lng,
      color: DOMAIN_CONFIG[byDomain[0].domain].color,
      bounds: boundsOf(bucket.markers),
      markers: bucket.markers,
      byDomain,
    });
  }

  clusters.sort((a, b) => b.markers.length - a.markers.length);
  return { single, clusters };
}
