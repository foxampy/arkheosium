// Eco-timeline data for the onboarding timelapse (Block 1 of /journey).
// Focus: WATER as the planet's most important resource — from the icy past,
// through rivers & irrigation, to the drying present and a fading future.
// Each phase also drives the CLEAN globe's appearance (atmosphere + tint film),
// so the planet visibly changes as the user scrolls the timelapse.

export interface EcoPhase {
  id: string;
  /** Position on the scrub track, 0..1. */
  t: number;
  /** Display year/era label (e.g. "−10 000", "2026", "+2100"). */
  year: string;
  /** lucide-react icon name — resolved on the client. */
  icon: string;
  title: string;
  body: string;
  /** Accent colour for this phase's card + tick. */
  accent: string;
  /** Atmosphere halo colour of the globe during this phase. */
  atmosphere: string;
  /** Colour film laid over the globe (drying → dust → ash). */
  tint: string;
  /** Opacity of that film, 0..1. */
  tintOpacity: number;

  // ── REAL terraforming drivers (not a colour wash) ──────────────
  /** Polar ice-cap advance: 0 = modern caps, 1 = glacial maximum. */
  glaciation: number;
  /** Global land desertification bias: 0 = lush, 1 = arid dust. */
  aridity: number;
  /** Localised Aral-Sea retreat: 0 = full 1960 sea, 1 = Aralkum desert. */
  aralDry: number;
  /** Civilisation night-lights intensity (0 = pristine, 1.4 = peak sprawl). */
  cityGlow: number;
}

export const ECO_TIMELINE: EcoPhase[] = [
  {
    id: 'ice',
    t: 0,
    year: '−10 000',
    icon: 'Snowflake',
    title: 'Ледниковый мир',
    body: 'Планета скована льдами. Пресная вода заперта в ледниках — крупнейшем резервуаре жизни. Отсюда начнётся всё.',
    accent: '#7dd3fc',
    atmosphere: '#3aa0ff',
    tint: '#bfe4ff',
    tintOpacity: 0.14,
    glaciation: 1.0,
    aridity: 0.0,
    aralDry: 0.0,
    cityGlow: 0.0,
  },
  {
    id: 'rivers',
    t: 0.16,
    year: '−6 000',
    icon: 'Waves',
    title: 'Расцвет рек',
    body: 'Тают ледники — рождаются великие реки. Вдоль Амударьи и Сырдарьи расцветают первые цивилизации. Вода = плодородие.',
    accent: '#34d399',
    atmosphere: '#16b47f',
    tint: '#3ad29a',
    tintOpacity: 0.10,
    glaciation: 0.30,
    aridity: 0.0,
    aralDry: 0.0,
    cityGlow: 0.05,
  },
  {
    id: 'industry',
    t: 0.36,
    year: '1850',
    icon: 'Factory',
    title: 'Индустриализация',
    body: 'Человек берёт воду под контроль: плотины, каналы, водозаборы. Ресурс становится топливом роста — и впервые истощается.',
    accent: '#f59e0b',
    atmosphere: '#d98324',
    tint: '#e8a13a',
    tintOpacity: 0.12,
    glaciation: 0.12,
    aridity: 0.14,
    aralDry: 0.05,
    cityGlow: 0.55,
  },
  {
    id: 'irrigation',
    t: 0.54,
    year: '1960',
    icon: 'Sprout',
    title: 'Великая ирригация',
    body: 'Реки Средней Азии разворачивают на хлопковые поля. Амударья и Сырдарья почти перестают питать Аральское море.',
    accent: '#eab308',
    atmosphere: '#c98a1e',
    tint: '#cf9a3f',
    tintOpacity: 0.18,
    glaciation: 0.08,
    aridity: 0.30,
    aralDry: 0.15,
    cityGlow: 0.9,
  },
  {
    id: 'aral',
    t: 0.72,
    year: '2000',
    icon: 'Wind',
    title: 'Усыхание Арала',
    body: 'Море теряет более 90% объёма. Обнажённое дно превращается в солёную пустыню Аралкум — источник ядовитых бурь.',
    accent: '#d97706',
    atmosphere: '#a9601c',
    tint: '#a9722f',
    tintOpacity: 0.30,
    glaciation: 0.05,
    aridity: 0.55,
    aralDry: 0.75,
    cityGlow: 1.15,
  },
  {
    id: 'scarcity',
    t: 0.87,
    year: '2026',
    icon: 'Droplet',
    title: 'Водный дефицит',
    body: 'Мы — здесь. Каждый второй человек уже сталкивается с нехваткой воды хотя бы месяц в году. Точка выбора.',
    accent: '#fb7185',
    atmosphere: '#b4443a',
    tint: '#9a5236',
    tintOpacity: 0.34,
    glaciation: 0.04,
    aridity: 0.70,
    aralDry: 0.95,
    cityGlow: 1.4,
  },
  {
    id: 'fading',
    t: 1,
    year: '+2100',
    icon: 'CloudOff',
    title: 'Угасание',
    body: 'Наблюдаемое будущее без вмешательства: реки пересыхают, пыль укрывает планету, жизнь угасает. Но этот путь — не единственный.',
    accent: '#94a3b8',
    atmosphere: '#4b5563',
    tint: '#6b6257',
    tintOpacity: 0.46,
    glaciation: 0.0,
    aridity: 1.0,
    aralDry: 1.0,
    cityGlow: 0.85,
  },
];

// ── Hex colour interpolation ───────────────────────────────────
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}
function rgbToHex(r: number, g: number, b: number): string {
  const c = (n: number) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}
function lerpHex(a: string, b: string, k: number): string {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  return rgbToHex(r1 + (r2 - r1) * k, g1 + (g2 - g1) * k, b1 + (b2 - b1) * k);
}

export interface GlobeAppearance {
  atmosphere: string;
  tint: string;
  tintOpacity: number;
}

/** Smoothly interpolate globe appearance for a scrub progress in [0,1]. */
export function phaseAppearanceAt(progress: number): GlobeAppearance {
  const p = Math.max(0, Math.min(1, progress));
  let lo = ECO_TIMELINE[0];
  let hi = ECO_TIMELINE[ECO_TIMELINE.length - 1];
  for (let i = 0; i < ECO_TIMELINE.length - 1; i++) {
    if (p >= ECO_TIMELINE[i].t && p <= ECO_TIMELINE[i + 1].t) {
      lo = ECO_TIMELINE[i];
      hi = ECO_TIMELINE[i + 1];
      break;
    }
  }
  const span = hi.t - lo.t || 1;
  const k = (p - lo.t) / span;
  return {
    atmosphere: lerpHex(lo.atmosphere, hi.atmosphere, k),
    tint: lerpHex(lo.tint, hi.tint, k),
    tintOpacity: lo.tintOpacity + (hi.tintOpacity - lo.tintOpacity) * k,
  };
}

// ── Real terraforming state for the unified globe ──────────────
export interface TerraformState {
  /** 0 = modern ice caps, 1 = glacial maximum. */
  glaciation: number;
  /** 0 = lush land, 1 = arid dust. */
  aridity: number;
  /** 0 = full 1960 Aral, 1 = Aralkum desert. */
  aralDry: number;
  /** Night-lights intensity. */
  cityGlow: number;
  /** Atmosphere rim colour for this progress. */
  atmosphere: string;
}

/**
 * Interpolate the globe's physical terraforming state for a scrub progress.
 * These values drive the shader uniforms + the Aral decal directly — the
 * planet actually changes geometry/appearance, no colour film involved.
 */
export function terraformAt(progress: number): TerraformState {
  const p = Math.max(0, Math.min(1, progress));
  let lo = ECO_TIMELINE[0];
  let hi = ECO_TIMELINE[ECO_TIMELINE.length - 1];
  for (let i = 0; i < ECO_TIMELINE.length - 1; i++) {
    if (p >= ECO_TIMELINE[i].t && p <= ECO_TIMELINE[i + 1].t) {
      lo = ECO_TIMELINE[i];
      hi = ECO_TIMELINE[i + 1];
      break;
    }
  }
  const span = hi.t - lo.t || 1;
  // smoothstep for organic easing between epochs
  const raw = (p - lo.t) / span;
  const k = raw * raw * (3 - 2 * raw);
  const mix = (a: number, b: number) => a + (b - a) * k;
  return {
    glaciation: mix(lo.glaciation, hi.glaciation),
    aridity: mix(lo.aridity, hi.aridity),
    aralDry: mix(lo.aralDry, hi.aralDry),
    cityGlow: mix(lo.cityGlow, hi.cityGlow),
    atmosphere: lerpHex(lo.atmosphere, hi.atmosphere, k),
  };
}

/** Index of the phase whose card should be showing for a given progress. */
export function activePhaseIndex(progress: number): number {
  const p = Math.max(0, Math.min(1, progress));
  let idx = 0;
  for (let i = 0; i < ECO_TIMELINE.length; i++) {
    // A phase "owns" the scrub from a bit before its t until the next phase's t.
    if (p >= ECO_TIMELINE[i].t - 0.001) idx = i;
  }
  return idx;
}
