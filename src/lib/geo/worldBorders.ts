// ─────────────────────────────────────────────────────────────────────────────
//  Реальные государственные границы: загрузка, поиск страны по точке.
//
//  Зачем это здесь. Раньше объекты на глобусе распределялись по восьми
//  «регионам» простым поиском ближайшего центра. У такого правила нет понятия
//  «снаружи»: точка в Найроби попадала в «Израиль» только потому, что из восьми
//  центров он оказался ближайшим. А радиус кольца считался от числа объектов —
//  и «Израиль (299)» расползался кругом на пол-Африки.
//
//  Здесь принадлежность определяется тем, чем она определяется в жизни:
//  попаданием точки внутрь контура государства. Контуры — Natural Earth
//  admin_0, 1:110 млн, лежат в `public/geo/world-countries-110m.json`
//  (~172 КБ, отдаётся статикой и кешируется браузером, в JS-бандл не входит).
//
//  Координаты округлены до двух знаков — это ~1,1 км по экватору, на порядок
//  мельче пикселя глобуса. Острова меньше ~55×55 км отброшены: на шаре они
//  всё равно меньше точки.
// ─────────────────────────────────────────────────────────────────────────────

/** Кольцо контура: замкнутая последовательность [lng, lat]. */
export type GeoRing = [number, number][];
/** Полигон: внешнее кольцо, затем дырки (анклавы, внутренние моря). */
export type GeoPolygon = GeoRing[];

export interface CountryBorder {
  /** ISO 3166-1 alpha-3. */
  iso: string;
  name_ru: string;
  name_en: string;
  /** Субрегион ООН M49 — ключ макрогруппы (см. macroRegions.ts). */
  subregion: string;
  continent: string;
  /** Точка привязки подписи: центроид крупнейшей части, [lng, lat]. */
  anchor: [number, number];
  /** [minLng, minLat, maxLng, maxLat] — дешёвый предфильтр перед точным тестом. */
  bbox: [number, number, number, number];
  /** Суммарная площадь в кв. градусах — для сортировки и веса подписи. */
  area: number;
  polygons: GeoPolygon[];
}

export interface WorldBorders {
  version: string;
  countries: CountryBorder[];
  byIso: Map<string, CountryBorder>;
  /** ISO-коды стран, сгруппированные по субрегиону ООН. */
  bySubregion: Map<string, CountryBorder[]>;
}

const ASSET_URL = '/geo/world-countries-110m.json';

// ── Точка внутри контура ─────────────────────────────────────────────────────

/**
 * Алгоритм трассировки луча. Точка внутри кольца, если луч, пущенный из неё на
 * запад, пересекает границу нечётное число раз.
 *
 * Плоский тест по (lng, lat) здесь корректен: Natural Earth уже режет полигоны
 * по 180-му меридиану, поэтому ни одно кольцо не «перепрыгивает» через край
 * системы координат — а именно на этом плоские тесты обычно и ломаются.
 */
function pointInRing(ring: GeoRing, lng: number, lat: number): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

function pointInCountry(c: CountryBorder, lng: number, lat: number): boolean {
  const [x0, y0, x1, y1] = c.bbox;
  if (lng < x0 || lng > x1 || lat < y0 || lat > y1) return false;
  for (const poly of c.polygons) {
    if (!pointInRing(poly[0], lng, lat)) continue;
    // Внутри внешнего кольца — но, возможно, в дырке (Лесото внутри ЮАР,
    // Ватикан внутри Италии, крупное озеро внутри страны).
    let inHole = false;
    for (let k = 1; k < poly.length; k++) {
      if (pointInRing(poly[k], lng, lat)) { inHole = true; break; }
    }
    if (!inHole) return true;
  }
  return false;
}

/**
 * Страна, которой принадлежит точка, или `null`, если точка не на суше.
 *
 * `null` — честный ответ, а не повод приписать точку ближайшему государству.
 * Буровая в море, судно, буй в открытом океане не принадлежат никому, и
 * подмешивать их в счётчик соседней страны значит врать в цифре.
 */
export function locateCountry(
  world: WorldBorders,
  lng: number,
  lat: number,
): CountryBorder | null {
  for (const c of world.countries) {
    if (pointInCountry(c, lng, lat)) return c;
  }
  return null;
}

/**
 * Ближайшая страна в пределах допуска, в градусах. Нужна ровно для одного
 * случая: точка у самого берега, которая из-за генерализации контура
 * 1:110 млн оказалась на пиксель снаружи. Допуск по умолчанию — 1,5°
 * (~165 км): этого хватает на погрешность контура и не хватает, чтобы
 * приписать стране что-то в открытом море.
 */
export function locateCountryNear(
  world: WorldBorders,
  lng: number,
  lat: number,
  toleranceDeg = 1.5,
): CountryBorder | null {
  const exact = locateCountry(world, lng, lat);
  if (exact) return exact;

  let best: CountryBorder | null = null;
  let bestD = Infinity;
  for (const c of world.countries) {
    const [x0, y0, x1, y1] = c.bbox;
    // расстояние от точки до прямоугольника, с учётом схождения меридианов
    const dLat = lat < y0 ? y0 - lat : lat > y1 ? lat - y1 : 0;
    let dLng = lng < x0 ? x0 - lng : lng > x1 ? lng - x1 : 0;
    if (dLng > 180) dLng = 360 - dLng;
    const cosLat = Math.cos((lat * Math.PI) / 180);
    const d = Math.hypot(dLng * cosLat, dLat);
    if (d < bestD) { bestD = d; best = c; }
  }
  return bestD <= toleranceDeg ? best : null;
}

// ── Загрузка ────────────────────────────────────────────────────────────────

interface RawAtlas {
  version: string;
  countries: CountryBorder[];
}

let cache: Promise<WorldBorders> | null = null;

/**
 * Загружает атлас границ один раз за сессию. Повторные вызовы получают тот же
 * промис, поэтому два компонента на странице не приведут к двум запросам.
 */
export function loadWorldBorders(): Promise<WorldBorders> {
  if (cache) return cache;
  cache = fetch(ASSET_URL)
    .then((r) => {
      if (!r.ok) throw new Error(`[geo] границы не загрузились: HTTP ${r.status}`);
      return r.json() as Promise<RawAtlas>;
    })
    .then((raw) => {
      // Сортировка по убыванию площади: при поиске точки крупные страны
      // проверяются первыми, а именно в них попадает большинство объектов.
      const countries = [...raw.countries].sort((a, b) => b.area - a.area);
      const byIso = new Map<string, CountryBorder>();
      const bySubregion = new Map<string, CountryBorder[]>();
      for (const c of countries) {
        byIso.set(c.iso, c);
        const bucket = bySubregion.get(c.subregion);
        if (bucket) bucket.push(c);
        else bySubregion.set(c.subregion, [c]);
      }
      return { version: raw.version, countries, byIso, bySubregion };
    })
    .catch((e) => {
      // Сбрасываем кеш, чтобы следующая попытка не получила навсегда
      // отвергнутый промис — обрыв сети не должен ломать страницу до перезагрузки.
      cache = null;
      throw e;
    });
  return cache;
}
