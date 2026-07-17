import { useState, useMemo, useRef } from 'react';
import { useLocation } from 'wouter';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, Satellite, Radar, Cloud, Clock, Layers as LayersIcon,
  Leaf, Droplets, FlaskConical, Wind, TrendingUp, FileText,
  Waves, Radio, Globe2, ChevronRight, Signal,
} from 'lucide-react';

// ══════════════════════════════════════════════════════════════════════════════
//  ArkheOSium — Satellite Monitoring console (Aral Sea)
//  Route: /satellite
//  NOTE: all data is fabricated / mock — presentation-grade demo, not wired to APIs.
// ══════════════════════════════════════════════════════════════════════════════

const ACCENT = '#00e6c8';
const ACCENT2 = '#00d4ff';

// ─── Self-contained bilingual strings (no shared JSON) ───────────────────────────

const STRINGS = {
  ru: {
    back: 'На главную',
    doc_label: 'Спутниковый мониторинг',
    badge_live: 'В ЭФИРЕ',
    badge_orbit: 'Орбитальное наблюдение',
    hero_title: 'Спутниковый мониторинг',
    hero_accent: 'Аральского моря',
    hero_lead: 'Из космоса — за усыханием и восстановлением Аральского моря. Мультиспектральные снимки, радар и климатические данные объединяются в единый цифровой двойник акватории.',
    stat_coverage: 'Покрытие',
    stat_revisit: 'Период повтора',
    stat_lastpass: 'Последний проход',
    stat_cloud: 'Облачность',
    stat_lastpass_val: '14 мин назад',
    slider_eyebrow: 'Временной срез',
    slider_title: 'Береговая линия: было / стало',
    slider_sub: 'Перемещайте бегунок по годам (1960 → 2026), чтобы увидеть, как менялась акватория Аральского моря. Пунктир — исторический контур 1960 года.',
    slider_year: 'Год',
    legend_hist: 'Контур 1960 (эталон)',
    legend_now: 'Акватория выбранного года',
    map_area: 'Площадь зеркала',
    map_level: 'Уровень воды',
    map_salinity: 'Солёность',
    layers_eyebrow: 'Слои наблюдения',
    layers_title: 'Аналитические слои',
    layers_sub: 'Включайте слои, чтобы наложить на карту данные разных сенсоров. Слои — демонстрационные.',
    layer_ndvi: 'NDVI · Растительность',
    layer_water: 'Водное зеркало',
    layer_salt: 'Солёность',
    layer_dust: 'Пыльные бури',
    chart_eyebrow: 'Хроника изменений',
    chart_title: 'Площадь зеркала моря, тыс. км²',
    chart_sub: 'Снижение с 1960-х и прогнозный разворот к восстановлению после запуска инженерной программы ARAL NEXUS.',
    chart_proj: 'Прогноз восстановления',
    chart_hist: 'Наблюдения',
    passes_eyebrow: 'Телеметрия',
    passes_title: 'Недавние проходы спутников',
    passes_sub: 'Последние снимки, полученные наземными станциями. Ложные цвета для дешифрирования.',
    pass_cloud: 'облачность',
    pass_res: 'разрешение',
    cta_title: 'От наблюдения — к восстановлению',
    cta_sub: 'Спутниковый слой — фундамент цифрового двойника Арала. Далее: инженерная дорожная карта и полный whitepaper проекта.',
    cta_roadmap: 'Дорожная карта',
    cta_wp: 'Полный whitepaper',
    disclaimer: 'Демонстрационная консоль. Значения смоделированы для презентации и не являются данными реального времени.',
  },
  en: {
    back: 'Home',
    doc_label: 'Satellite Monitoring',
    badge_live: 'LIVE',
    badge_orbit: 'Orbital observation',
    hero_title: 'Satellite Monitoring',
    hero_accent: 'of the Aral Sea',
    hero_lead: 'Tracking the shrinkage and recovery of the Aral Sea from orbit. Multispectral imagery, radar and climate data fuse into a single digital twin of the basin.',
    stat_coverage: 'Coverage',
    stat_revisit: 'Revisit time',
    stat_lastpass: 'Last pass',
    stat_cloud: 'Cloud cover',
    stat_lastpass_val: '14 min ago',
    slider_eyebrow: 'Time slice',
    slider_title: 'Shoreline: before / after',
    slider_sub: 'Drag the slider across the years (1960 → 2026) to see how the Aral Sea basin changed. The dashed line is the 1960 historical outline.',
    slider_year: 'Year',
    legend_hist: '1960 outline (baseline)',
    legend_now: 'Water body of selected year',
    map_area: 'Surface area',
    map_level: 'Water level',
    map_salinity: 'Salinity',
    layers_eyebrow: 'Observation layers',
    layers_title: 'Analytical layers',
    layers_sub: 'Toggle layers to overlay data from different sensors onto the map. Layers are demonstrative.',
    layer_ndvi: 'NDVI · Vegetation',
    layer_water: 'Water extent',
    layer_salt: 'Salinity',
    layer_dust: 'Dust storms',
    chart_eyebrow: 'Change timeline',
    chart_title: 'Sea surface area, thousand km²',
    chart_sub: 'Decline since the 1960s and a projected recovery uptick after the ARAL NEXUS engineering programme launches.',
    chart_proj: 'Recovery projection',
    chart_hist: 'Observations',
    passes_eyebrow: 'Telemetry',
    passes_title: 'Recent satellite passes',
    passes_sub: 'Latest scenes downlinked to ground stations. False color for interpretation.',
    pass_cloud: 'cloud',
    pass_res: 'resolution',
    cta_title: 'From observation to restoration',
    cta_sub: 'The satellite layer is the foundation of the Aral digital twin. Next: the engineering roadmap and the full project whitepaper.',
    cta_roadmap: 'Roadmap',
    cta_wp: 'Full whitepaper',
    disclaimer: 'Demonstration console. Values are simulated for presentation and are not real-time data.',
  },
} as const;

// ─── Types ───────────────────────────────────────────────────────────────────────

type LayerId = 'ndvi' | 'water' | 'salinity' | 'dust';

interface LayerDef {
  id: LayerId;
  Icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  labelKey: 'layer_ndvi' | 'layer_water' | 'layer_salt' | 'layer_dust';
  color: string;
}

interface SatPass {
  sensor: string;
  ts: string;
  cloud: number;
  res: string;
  hue: number;
}

interface AreaPoint {
  year: number;
  area: number;      // thousand km²
  projected: boolean;
}

// ─── Static data ─────────────────────────────────────────────────────────────────

const LAYERS: LayerDef[] = [
  { id: 'ndvi', Icon: Leaf, labelKey: 'layer_ndvi', color: '#4ade80' },
  { id: 'water', Icon: Droplets, labelKey: 'layer_water', color: '#00d4ff' },
  { id: 'salinity', Icon: FlaskConical, labelKey: 'layer_salt', color: '#fbbf24' },
  { id: 'dust', Icon: Wind, labelKey: 'layer_dust', color: '#f87171' },
];

const PASSES: SatPass[] = [
  { sensor: 'Sentinel-2 · L2A', ts: '2026-07-17 09:42 UTC', cloud: 3, res: '10 m', hue: 168 },
  { sensor: 'Landsat-9 · OLI-2', ts: '2026-07-16 06:18 UTC', cloud: 12, res: '15 m', hue: 200 },
  { sensor: 'Sentinel-1 · SAR', ts: '2026-07-16 03:55 UTC', cloud: 0, res: '5 m', hue: 44 },
  { sensor: 'MODIS · Terra', ts: '2026-07-15 11:07 UTC', cloud: 28, res: '250 m', hue: 96 },
  { sensor: 'Sentinel-2 · L2A', ts: '2026-07-14 09:39 UTC', cloud: 7, res: '10 m', hue: 158 },
  { sensor: 'Landsat-9 · TIRS', ts: '2026-07-13 06:21 UTC', cloud: 18, res: '30 m', hue: 12 },
];

// Sea surface area timeline (fabricated but plausible: ~68k km² in 1960 → ~8k now → recovery)
const AREA_SERIES: AreaPoint[] = [
  { year: 1960, area: 68, projected: false },
  { year: 1970, area: 60, projected: false },
  { year: 1980, area: 52, projected: false },
  { year: 1990, area: 37, projected: false },
  { year: 2000, area: 24, projected: false },
  { year: 2010, area: 14, projected: false },
  { year: 2020, area: 9, projected: false },
  { year: 2026, area: 8.5, projected: false },
  { year: 2032, area: 11, projected: true },
  { year: 2040, area: 17, projected: true },
];

const YEAR_MIN = 1960;
const YEAR_MAX = 2026;

// ─── Helpers ─────────────────────────────────────────────────────────────────────

// Interpolate the "wetness" factor 0..1 (1 = full 1960 sea, ~0.1 = today) for a given year.
function wetnessForYear(year: number): number {
  const t = (year - YEAR_MIN) / (YEAR_MAX - YEAR_MIN); // 0..1
  // ease: sea stays large until ~1970, then declines faster — quadratic-ish
  const decline = Math.pow(t, 1.55);
  return Math.max(0.12, 1 - decline * 0.88);
}

// Approx surface area label for a given year (thousand km²).
function areaForYear(year: number): number {
  const w = wetnessForYear(year);
  return Math.round((6 + w * 62) * 10) / 10;
}

function salinityForYear(year: number): number {
  const w = wetnessForYear(year);
  return Math.round(10 + (1 - w) * 100); // g/L, rises as it shrinks
}

function levelForYear(year: number): number {
  const w = wetnessForYear(year);
  return Math.round((30 + w * 23) * 10) / 10; // m above datum
}

// ─── Reusable animated section ───────────────────────────────────────────────────

function Section({ id, eyebrow, title, subtitle, children }: {
  id: string; eyebrow?: string; title: string; subtitle?: string; children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 py-14 md:py-20 border-t border-white/5 first:border-0">
      <div className="max-w-5xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          {eyebrow && (
            <div className="text-xs font-semibold uppercase tracking-[0.25em] mb-3" style={{ color: ACCENT }}>
              {eyebrow}
            </div>
          )}
          <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight leading-tight">{title}</h2>
          {subtitle && <p className="mt-4 text-gray-400 text-sm md:text-base max-w-2xl leading-relaxed">{subtitle}</p>}
        </motion.div>
        {children}
      </div>
    </section>
  );
}

function StatTile({ Icon, val, label, color, pulse }: {
  Icon: LayerDef['Icon']; val: string; label: string; color: string; pulse?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.4 }}
      className="bg-white/5 border border-white/10 backdrop-blur rounded-2xl p-4"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="relative flex items-center justify-center w-7 h-7 rounded-lg" style={{ background: color + '18', color }}>
          <Icon size={15} />
          {pulse && !reduce && (
            <motion.span
              className="absolute inset-0 rounded-lg"
              style={{ border: `1px solid ${color}` }}
              animate={{ opacity: [0.6, 0, 0.6], scale: [1, 1.35, 1] }}
              transition={{ duration: 2.4, repeat: Infinity }}
            />
          )}
        </span>
        <div className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</div>
      </div>
      <div className="text-lg md:text-xl font-black font-mono" style={{ color }}>{val}</div>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════

export default function SatellitePage() {
  const [, navigate] = useLocation();
  const { i18n } = useTranslation();
  const reduce = useReducedMotion();

  const lang = (i18n.language || 'ru').slice(0, 2);
  const s = (STRINGS as Record<string, typeof STRINGS.ru>)[lang] ?? STRINGS.ru;

  const [year, setYear] = useState<number>(2026);
  const [layers, setLayers] = useState<Record<LayerId, boolean>>({
    ndvi: false, water: true, salinity: false, dust: false,
  });

  const wet = wetnessForYear(year);
  // Current water body scales down as the sea shrinks. Keep a fixed anchor near the south.
  const seaScale = 0.42 + wet * 0.58; // 1.0 at 1960, ~0.5 today

  const toggleLayer = (id: LayerId) => setLayers((p) => ({ ...p, [id]: !p[id] }));

  // ── Build chart geometry ──
  const chart = useMemo(() => {
    const W = 720, H = 260, padL = 40, padR = 16, padT = 16, padB = 28;
    const xs = AREA_SERIES.map((p) => p.year);
    const minYear = Math.min(...xs), maxYear = Math.max(...xs);
    const maxArea = 70;
    const x = (yr: number) => padL + ((yr - minYear) / (maxYear - minYear)) * (W - padL - padR);
    const y = (a: number) => padT + (1 - a / maxArea) * (H - padT - padB);
    const line = AREA_SERIES.map((p) => `${x(p.year).toFixed(1)},${y(p.area).toFixed(1)}`).join(' ');
    const area = `${x(minYear).toFixed(1)},${y(0).toFixed(1)} ${line} ${x(maxYear).toFixed(1)},${y(0).toFixed(1)}`;
    const splitIdx = AREA_SERIES.findIndex((p) => p.projected);
    const histPts = AREA_SERIES.slice(0, splitIdx).map((p) => `${x(p.year).toFixed(1)},${y(p.area).toFixed(1)}`).join(' ');
    const projPts = AREA_SERIES.slice(splitIdx - 1).map((p) => `${x(p.year).toFixed(1)},${y(p.area).toFixed(1)}`).join(' ');
    const gridY = [0, 20, 40, 60].map((a) => ({ a, yy: y(a) }));
    const ticks = [1960, 1980, 2000, 2020, 2040].map((yr) => ({ yr, xx: x(yr) }));
    return { W, H, line, area, histPts, projPts, gridY, ticks, dots: AREA_SERIES.map((p) => ({ ...p, cx: x(p.year), cy: y(p.area) })) };
  }, []);

  return (
    <div className="min-h-screen text-gray-200">

      {/* ── Sticky top bar ── */}
      <div className="sticky top-0 z-40 bg-[#000818]/95 backdrop-blur border-b border-white/5 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-[#00e6c8]/70 hover:text-[#00e6c8] transition-colors flex-shrink-0"
        >
          <ArrowLeft size={16} /> {s.back}
        </button>
        <div className="flex items-center gap-2 text-sm text-gray-400 flex-shrink-0">
          <Satellite size={14} />
          <span className="hidden sm:inline">{s.doc_label}</span>
          <span className="sm:hidden">Satellite</span>
        </div>
        <div className="ml-auto flex items-center gap-2 text-xs text-[#00e6c8] bg-[#00e6c8]/10 border border-[#00e6c8]/20 rounded-full px-3 py-1">
          {!reduce ? (
            <motion.span
              className="w-2 h-2 rounded-full bg-[#00e6c8]"
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ duration: 1.6, repeat: Infinity }}
            />
          ) : (
            <span className="w-2 h-2 rounded-full bg-[#00e6c8]" />
          )}
          {s.badge_live}
        </div>
      </div>

      {/* ══ HERO ══ */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#00153a]/50 to-[#000818]" />
          {!reduce && (
            <>
              <motion.div
                className="absolute -top-24 right-0 w-[560px] h-[340px] rounded-full bg-[#00e6c8]/8 blur-3xl"
                animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
                transition={{ duration: 13, repeat: Infinity }}
              />
              <motion.div
                className="absolute bottom-0 left-1/4 w-[420px] h-[240px] rounded-full bg-[#00d4ff]/10 blur-3xl"
                animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
                transition={{ duration: 15, repeat: Infinity }}
              />
            </>
          )}
          {/* faint orbital arc */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.14]" preserveAspectRatio="xMidYMid slice" viewBox="0 0 800 400">
            <ellipse cx="400" cy="220" rx="360" ry="120" fill="none" stroke={ACCENT2} strokeWidth="1" />
            <ellipse cx="400" cy="220" rx="260" ry="80" fill="none" stroke={ACCENT} strokeWidth="1" />
          </svg>
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-16 md:py-24">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <div className="flex items-center gap-2 text-xs text-[#00d4ff] bg-[#00d4ff]/10 border border-[#00d4ff]/20 rounded-full px-3 py-1">
                <Globe2 size={11} /> {s.badge_orbit}
              </div>
              <div className="flex items-center gap-2 text-xs text-[#7c3aed] bg-[#7c3aed]/10 border border-[#7c3aed]/20 rounded-full px-3 py-1">
                <Radar size={11} /> Aral Basin
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white mb-5 tracking-tight leading-[0.98]">
              {s.hero_title}
              <br />
              <span className="bg-gradient-to-r from-[#00e6c8] via-[#00d4ff] to-[#7c3aed] bg-clip-text text-transparent">
                {s.hero_accent}
              </span>
            </h1>

            <p className="text-gray-400 text-base md:text-lg mb-8 max-w-2xl leading-relaxed">{s.hero_lead}</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl">
              <StatTile Icon={Signal} val="98.6%" label={s.stat_coverage} color="#00e6c8" pulse />
              <StatTile Icon={Clock} val="~2.1 d" label={s.stat_revisit} color="#00d4ff" />
              <StatTile Icon={Radio} val={s.stat_lastpass_val} label={s.stat_lastpass} color="#7c3aed" pulse />
              <StatTile Icon={Cloud} val="6%" label={s.stat_cloud} color="#4ade80" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ TIME-SLIDER before/after + LAYERS ══ */}
      <Section id="slider" eyebrow={s.slider_eyebrow} title={s.slider_title} subtitle={s.slider_sub}>
        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6 items-start">

          {/* Map panel */}
          <div className="bg-white/5 border border-white/10 backdrop-blur rounded-2xl p-4 md:p-5">
            <div className="relative rounded-xl overflow-hidden border border-white/10" style={{ background: 'radial-gradient(120% 120% at 30% 20%, #06213a, #01101f 70%)' }}>
              <svg viewBox="0 0 400 300" className="w-full block">
                {/* grid graticule */}
                <g stroke="#ffffff" strokeOpacity="0.05" strokeWidth="1">
                  {[60, 120, 180, 240].map((gx) => <line key={'v' + gx} x1={gx} y1="0" x2={gx} y2="300" />)}
                  {[60, 120, 180, 240].map((gy) => <line key={'h' + gy} x1="0" y1={gy} x2="400" y2={gy} />)}
                </g>

                {/* dust storm layer (behind) */}
                {layers.dust && (
                  <g>
                    {[[90, 90, 34], [150, 70, 22], [300, 210, 40], [250, 250, 26]].map(([cx, cy, r], i) => (
                      <circle key={'dust' + i} cx={cx} cy={cy} r={r} fill="#f87171" fillOpacity="0.10" />
                    ))}
                  </g>
                )}

                {/* Historical 1960 outline (dashed baseline) */}
                <path
                  d="M200 40 C255 45 290 80 292 130 C294 180 265 235 205 262 C150 258 118 210 116 158 C114 100 150 48 200 40 Z"
                  fill="none" stroke={ACCENT} strokeOpacity="0.55" strokeWidth="1.6" strokeDasharray="5 5"
                />

                {/* Current water body — scales with year via transform */}
                <g transform={`translate(204 150) scale(${seaScale.toFixed(3)}) translate(-204 -150)`}>
                  <path
                    d="M200 40 C255 45 290 80 292 130 C294 180 265 235 205 262 C150 258 118 210 116 158 C114 100 150 48 200 40 Z"
                    fill={layers.water ? 'url(#waterGrad)' : '#0b3a52'}
                    fillOpacity={layers.water ? 0.9 : 0.55}
                    stroke={ACCENT2} strokeWidth="1.5"
                  />
                  {/* salinity speckle when salinity layer on */}
                  {layers.salinity && [[200, 90], [230, 140], [180, 180], [210, 210], [170, 120]].map(([cx, cy], i) => (
                    <circle key={'salt' + i} cx={cx} cy={cy} r="6" fill="#fbbf24" fillOpacity="0.5" />
                  ))}
                </g>

                {/* NDVI vegetation dots along former shoreline */}
                {layers.ndvi && [[120, 70], [95, 130], [130, 210], [280, 90], [300, 160], [270, 240], [200, 275]].map(([cx, cy], i) => (
                  <circle key={'ndvi' + i} cx={cx} cy={cy} r="4.5" fill="#4ade80" fillOpacity="0.75" />
                ))}

                <defs>
                  <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#0b3a52" stopOpacity="0.95" />
                  </linearGradient>
                </defs>
              </svg>

              {/* year badge overlay */}
              <div className="absolute top-3 left-3 font-mono text-2xl font-black text-white/90 tracking-tight">
                {year}
              </div>
              <div className="absolute bottom-3 right-3 text-[10px] font-mono text-gray-400">45°N · 60°E · Aral</div>
            </div>

            {/* Slider */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500 uppercase tracking-wider">{s.slider_year}</span>
                <span className="font-mono text-sm text-[#00e6c8]">{year}</span>
              </div>
              <input
                type="range"
                min={YEAR_MIN}
                max={YEAR_MAX}
                step={1}
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                aria-label={s.slider_year}
                className="w-full accent-[#00e6c8] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-gray-600 mt-1">
                <span>{YEAR_MIN}</span><span>1980</span><span>2000</span><span>{YEAR_MAX}</span>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-4 text-[11px] text-gray-400">
              <span className="flex items-center gap-2">
                <span className="inline-block w-6 border-t-2 border-dashed" style={{ borderColor: ACCENT }} /> {s.legend_hist}
              </span>
              <span className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-sm" style={{ background: ACCENT2 }} /> {s.legend_now}
              </span>
            </div>
          </div>

          {/* Right column: live metrics + layer toggles */}
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{s.map_area}</div>
                <div className="font-mono text-base font-black text-[#00d4ff]">{areaForYear(year)}k</div>
                <div className="text-[9px] text-gray-600">km²</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{s.map_level}</div>
                <div className="font-mono text-base font-black text-[#00e6c8]">{levelForYear(year)}</div>
                <div className="text-[9px] text-gray-600">m</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{s.map_salinity}</div>
                <div className="font-mono text-base font-black text-[#fbbf24]">{salinityForYear(year)}</div>
                <div className="text-[9px] text-gray-600">g/L</div>
              </div>
            </div>

            {/* Layer toggles */}
            <div className="bg-white/5 border border-white/10 backdrop-blur rounded-2xl p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: ACCENT }}>
                <LayersIcon size={13} /> {s.layers_title}
              </div>
              <p className="text-[11px] text-gray-500 mb-3 leading-relaxed">{s.layers_sub}</p>
              <div className="grid grid-cols-2 gap-2">
                {LAYERS.map((l) => {
                  const on = layers[l.id];
                  return (
                    <button
                      key={l.id}
                      onClick={() => toggleLayer(l.id)}
                      aria-pressed={on}
                      className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium transition-all border"
                      style={{
                        color: on ? l.color : '#9ca3af',
                        borderColor: on ? l.color + '55' : 'rgba(255,255,255,0.08)',
                        background: on ? l.color + '14' : 'rgba(255,255,255,0.03)',
                      }}
                    >
                      <l.Icon size={14} />
                      <span className="truncate text-left">{s[l.labelKey]}</span>
                      <span
                        className="ml-auto w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: on ? l.color : 'transparent', border: `1px solid ${on ? l.color : 'rgba(255,255,255,0.2)'}` }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ══ CHANGE TIMELINE CHART ══ */}
      <Section id="chart" eyebrow={s.chart_eyebrow} title={s.chart_title} subtitle={s.chart_sub}>
        <div className="bg-white/5 border border-white/10 backdrop-blur rounded-2xl p-4 md:p-6">
          <svg viewBox={`0 0 ${chart.W} ${chart.H}`} className="w-full block">
            <defs>
              <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={ACCENT} stopOpacity="0.35" />
                <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* grid */}
            {chart.gridY.map((g) => (
              <g key={'gy' + g.a}>
                <line x1={40} y1={g.yy} x2={chart.W - 16} y2={g.yy} stroke="#ffffff" strokeOpacity="0.06" />
                <text x={8} y={g.yy + 3} fill="#6b7280" fontSize="9" fontFamily="monospace">{g.a}</text>
              </g>
            ))}
            {chart.ticks.map((tk) => (
              <text key={'tk' + tk.yr} x={tk.xx} y={chart.H - 8} fill="#6b7280" fontSize="9" fontFamily="monospace" textAnchor="middle">{tk.yr}</text>
            ))}

            {/* area fill */}
            <polygon points={chart.area} fill="url(#areaFill)" />

            {/* historical line */}
            <motion.polyline
              points={chart.histPts}
              fill="none" stroke={ACCENT} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"
              initial={reduce ? undefined : { pathLength: 0 }}
              whileInView={reduce ? undefined : { pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.1 }}
            />
            {/* projected (dashed) line */}
            <polyline
              points={chart.projPts}
              fill="none" stroke={ACCENT2} strokeWidth="2.5" strokeDasharray="6 5" strokeLinejoin="round" strokeLinecap="round"
            />

            {/* dots */}
            {chart.dots.map((d) => (
              <circle key={d.year} cx={d.cx} cy={d.cy} r="3.2" fill={d.projected ? ACCENT2 : ACCENT} stroke="#000818" strokeWidth="1.5" />
            ))}
          </svg>

          <div className="flex flex-wrap gap-5 mt-3 text-[11px] text-gray-400">
            <span className="flex items-center gap-2">
              <span className="inline-block w-6 border-t-2" style={{ borderColor: ACCENT }} /> {s.chart_hist}
            </span>
            <span className="flex items-center gap-2">
              <span className="inline-block w-6 border-t-2 border-dashed" style={{ borderColor: ACCENT2 }} /> {s.chart_proj}
            </span>
          </div>
        </div>
      </Section>

      {/* ══ RECENT SATELLITE PASSES ══ */}
      <Section id="passes" eyebrow={s.passes_eyebrow} title={s.passes_title} subtitle={s.passes_sub}>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PASSES.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: (i % 3) * 0.08 }}
              className="group bg-white/5 border border-white/10 backdrop-blur rounded-2xl overflow-hidden hover:border-white/20 transition-all"
            >
              {/* false-color SVG tile thumbnail */}
              <div className="relative h-28 overflow-hidden">
                <svg viewBox="0 0 200 90" preserveAspectRatio="none" className="w-full h-full">
                  <defs>
                    <linearGradient id={`tile${i}`} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor={`hsl(${p.hue}, 70%, 45%)`} />
                      <stop offset="100%" stopColor={`hsl(${(p.hue + 40) % 360}, 60%, 22%)`} />
                    </linearGradient>
                  </defs>
                  <rect width="200" height="90" fill={`url(#tile${i})`} />
                  {/* false-color blobs */}
                  <ellipse cx="60" cy="40" rx="45" ry="30" fill={`hsl(${(p.hue + 180) % 360}, 65%, 40%)`} fillOpacity="0.45" />
                  <ellipse cx="150" cy="60" rx="38" ry="24" fill={`hsl(${(p.hue + 90) % 360}, 70%, 50%)`} fillOpacity="0.4" />
                  {/* scanline grid */}
                  {[20, 40, 60, 80, 100, 120, 140, 160, 180].map((gx) => (
                    <line key={gx} x1={gx} y1="0" x2={gx} y2="90" stroke="#000" strokeOpacity="0.08" />
                  ))}
                </svg>
                <div className="absolute top-2 right-2 text-[10px] font-mono px-2 py-0.5 rounded bg-black/50 text-gray-200 backdrop-blur">
                  {p.res}
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <Satellite size={13} style={{ color: ACCENT }} />
                  <span className="text-sm font-semibold text-white truncate">{p.sensor}</span>
                </div>
                <div className="font-mono text-[11px] text-gray-500 mb-2">{p.ts}</div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1 text-gray-400">
                    <Cloud size={11} /> {p.cloud}% {s.pass_cloud}
                  </span>
                  <span className="text-gray-600">{p.res} {s.pass_res}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ══ CTA FOOTER ══ */}
      <section className="scroll-mt-24 py-16 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-[#00e6c8]/20 p-8 text-center bg-gradient-to-b from-[#00e6c8]/5 to-transparent"
          >
            <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-5 bg-[#00e6c8]/10 text-[#00e6c8]">
              <Waves size={26} />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white mb-3">{s.cta_title}</h2>
            <p className="text-gray-400 text-sm md:text-base mb-7 max-w-xl mx-auto leading-relaxed">{s.cta_sub}</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <a
                href="/roadmap"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00d4ff]/10 border border-[#00d4ff]/30 text-[#00d4ff] hover:bg-[#00d4ff]/20 transition-colors text-sm font-medium"
              >
                <TrendingUp size={14} /> {s.cta_roadmap}
              </a>
              <a
                href="/whitepaper-full"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7c3aed]/10 border border-[#7c3aed]/30 text-[#7c3aed] hover:bg-[#7c3aed]/20 transition-colors text-sm font-medium"
              >
                <FileText size={14} /> {s.cta_wp}
              </a>
              <button
                onClick={() => navigate('/roadmap')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white transition-colors text-sm font-medium"
              >
                {s.cta_roadmap} <ChevronRight size={14} />
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-8">{s.disclaimer}</p>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
