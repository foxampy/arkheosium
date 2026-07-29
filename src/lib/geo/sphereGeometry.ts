// ─────────────────────────────────────────────────────────────────────────────
//  Границы и заливка территорий на сфере глобуса.
//
//  Готовая библиотека `three-geojson-geometry` умеет только обводку и, главное,
//  раскладывает широту с долготой по своей системе осей: у неё θ = 90° − lng,
//  а на нашем глобусе θ = lng + 180°. Это поворот на 90° вокруг оси Y — контуры
//  легли бы мимо материков. Поэтому обе геометрии строим здесь, одной и той же
//  функцией проекции, что и маркеры: расхождение конвенций между слоями одного
//  глобуса — это баг, который никто потом не найдёт.
//
//  Одной обводки мало. Контур без заливки читается как линия на карте, а не как
//  территория, и на ночной текстуре Земли теряется. Заливка строится через
//  earcut по контуру в плоскости (lng, lat), затем каждая вершина поднимается
//  на сферу.
//
//  Почему длинные рёбра приходится дробить. Треугольник между тремя точками
//  сферы — плоскость, то есть хорда. Над дугой в 20° он провисает на
//  R·(1 − cos 10°) ≈ 0,015·R и уходит внутрь глобуса: середина Казахстана
//  скрылась бы под поверхностью, а края торчали бы наружу. При рёбрах в 2°
//  провисание падает до R·(1 − cos 1°) ≈ 0,00015·R — тоньше линии границы.
//
//  Плоская триангуляция в градусах здесь корректна: Natural Earth режет полигоны
//  по 180-му меридиану, поэтому ни один контур не разрывается по краю системы
//  координат.
// ─────────────────────────────────────────────────────────────────────────────

import * as THREE from 'three';
import earcut from 'earcut';
import type { GeoPolygon, GeoRing } from './worldBorders';

/** Максимальная длина ребра в градусах перед подъёмом на сферу. */
const MAX_EDGE_DEG = 2;
/** Предохранитель от бесконечного дробления вырожденного контура. */
const MAX_DEPTH = 5;

/**
 * Проекция [lat, lng] на сферу радиуса r.
 *
 * Копия `latLngToVec3` из EarthGlobePage — намеренно та же формула, чтобы
 * границы, заливка, маркеры и дуги связей жили в одном мировом пространстве
 * и вращались вместе.
 */
export function latLngToVec3(lat: number, lng: number, r: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  );
}

type P2 = [number, number];

function edgeLen(a: P2, b: P2): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

// ── Обводка ─────────────────────────────────────────────────────────────────

/**
 * Линия границы как непрерывная ломаная, уплотнённая до шага MAX_EDGE_DEG,
 * чтобы длинные прямые участки (например, широтные границы в Африке) ложились
 * по дуге, а не срезали угол сквозь планету.
 */
function densifyRing(ring: GeoRing): P2[] {
  const out: P2[] = [];
  for (let i = 0; i < ring.length - 1; i++) {
    const a = ring[i] as P2;
    const b = ring[i + 1] as P2;
    out.push(a);
    const steps = Math.floor(edgeLen(a, b) / MAX_EDGE_DEG);
    for (let s = 1; s < steps; s++) {
      const t = s / steps;
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
    }
  }
  const last = ring[ring.length - 1];
  if (last) out.push(last as P2);
  return out;
}

/**
 * Геометрия обводки для набора полигонов. Рисуется как THREE.LineSegments:
 * каждое ребро — независимая пара вершин, поэтому соседние кольца и острова
 * не соединяются паразитными отрезками через океан.
 *
 * Возвращает `null`, если рисовать нечего.
 */
export function buildBorderGeometry(
  polygons: GeoPolygon[],
  radius: number,
): THREE.BufferGeometry | null {
  const verts: number[] = [];

  for (const poly of polygons) {
    for (const ring of poly) {
      const pts = densifyRing(ring);
      for (let i = 0; i < pts.length - 1; i++) {
        const a = latLngToVec3(pts[i][1], pts[i][0], radius);
        const b = latLngToVec3(pts[i + 1][1], pts[i + 1][0], radius);
        verts.push(a.x, a.y, a.z, b.x, b.y, b.z);
      }
    }
  }

  if (!verts.length) return null;
  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  return geom;
}

// ── Заливка ─────────────────────────────────────────────────────────────────

/**
 * Делит треугольник пополам по самому длинному ребру, пока все рёбра не станут
 * короче MAX_EDGE_DEG. Деление по длинному ребру, а не на четыре части, не
 * плодит лишних треугольников на и без того мелких участках.
 */
function subdivide(a: P2, b: P2, c: P2, out: P2[], depth = 0): void {
  const ab = edgeLen(a, b);
  const bc = edgeLen(b, c);
  const ca = edgeLen(c, a);
  const max = Math.max(ab, bc, ca);

  if (max <= MAX_EDGE_DEG || depth >= MAX_DEPTH) {
    out.push(a, b, c);
    return;
  }

  const mid = (p: P2, q: P2): P2 => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  if (max === ab) {
    const m = mid(a, b);
    subdivide(a, m, c, out, depth + 1);
    subdivide(m, b, c, out, depth + 1);
  } else if (max === bc) {
    const m = mid(b, c);
    subdivide(a, b, m, out, depth + 1);
    subdivide(a, m, c, out, depth + 1);
  } else {
    const m = mid(c, a);
    subdivide(a, b, m, out, depth + 1);
    subdivide(m, b, c, out, depth + 1);
  }
}

/**
 * Заливка территории, лежащая на сфере радиуса `radius`.
 * Возвращает `null`, если ни один контур не удалось триангулировать.
 */
export function buildFillGeometry(
  polygons: GeoPolygon[],
  radius: number,
): THREE.BufferGeometry | null {
  const tris: P2[] = [];

  for (const poly of polygons) {
    const flat: number[] = [];
    const holes: number[] = [];
    poly.forEach((ring, i) => {
      if (i > 0) holes.push(flat.length / 2);
      // последняя точка кольца дублирует первую — earcut этого не любит
      for (let k = 0; k < ring.length - 1; k++) flat.push(ring[k][0], ring[k][1]);
    });
    if (flat.length < 6) continue;

    const idx = earcut(flat, holes.length ? holes : undefined, 2);
    for (let i = 0; i < idx.length; i += 3) {
      subdivide(
        [flat[idx[i] * 2], flat[idx[i] * 2 + 1]],
        [flat[idx[i + 1] * 2], flat[idx[i + 1] * 2 + 1]],
        [flat[idx[i + 2] * 2], flat[idx[i + 2] * 2 + 1]],
        tris,
      );
    }
  }

  if (!tris.length) return null;

  const positions = new Float32Array(tris.length * 3);
  for (let i = 0; i < tris.length; i++) {
    const v = latLngToVec3(tris[i][1], tris[i][0], radius);
    positions[i * 3] = v.x;
    positions[i * 3 + 1] = v.y;
    positions[i * 3 + 2] = v.z;
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  return geom;
}
