import { useState, useMemo, useRef } from 'react';
import { useLocation } from 'wouter';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, Wind, Sprout, Leaf, Droplets, Mountain, Waves,
  TrendingDown, TrendingUp, FileText, Compass, Gauge, Trees,
} from 'lucide-react';

// ══════════════════════════════════════════════════════════════════════════════
//  ArkheOSium — Climate Engineering (desertification / Aralkum restoration)
//  Route: /climate
// ══════════════════════════════════════════════════════════════════════════════

const ACCENT = '#00e6c8';
const ACCENT2 = '#00d4ff';

const GRID_COLS = 16;
const GRID_ROWS = 10;
const CELL_COUNT = GRID_COLS * GRID_ROWS;

// ─── i18n (self-contained, bilingual) ───────────────────────────────────────────

const STRINGS = {
  ru: {
    back: 'Назад к дорожной карте',
    doc_label: 'Климатическая инженерия',
    eyebrow: 'Восстановление климата',
    hero_title: 'Климатическая инженерия',
    hero_accent: 'Аралкум и борьба с опустыниванием',
    hero_lead:
      'Мониторинг деградации земель и симуляция восстановительных вмешательств на обнажённом дне Арала. Двигайте прогресс восстановления — карта оживает.',
    kpi_index: 'Индекс опустынивания',
    kpi_dust: 'Пыльных дней / год',
    kpi_restored: 'Восстановлено, га',
    kpi_afforest: 'Покрытие лесопосадками',
    map_eyebrow: 'Цифровой двойник Аралкум',
    map_title: 'Тепловая карта деградации',
    map_sub:
      'Каждая ячейка — участок обнажённого солёного дна. Красный — деградация, зелёный — восстановленная растительность. Двигайте ползунок восстановления.',
    slider_label: 'Прогресс восстановления',
    legend_degraded: 'Деградация',
    legend_transition: 'Переход',
    legend_restored: 'Восстановлено',
    tip_veg: 'Растительность',
    tip_salinity: 'Солёность',
    tip_dust: 'Пыль-риск',
    tip_cell: 'Участок',
    interv_eyebrow: 'Сценарное моделирование',
    interv_title: 'Вмешательства',
    interv_sub:
      'Включайте меры восстановления — они ускоряют озеленение карты и снижают прогнозный индекс опустынивания.',
    proj_index: 'Прогнозный индекс',
    proj_veg: 'Прогнозная растительность',
    interv_active: 'мер активно',
    charts_eyebrow: 'Динамика',
    charts_title: 'Тренды восстановления',
    charts_sub:
      'Индекс опустынивания снижается, покрытие растительностью растёт. Кривые перестраиваются вслед за ползунком и вмешательствами.',
    chart_index_title: 'Индекс опустынивания',
    chart_veg_title: 'Покрытие растительностью',
    scen_eyebrow: 'Сценарии до 2040',
    scen_title: 'Три пути восстановления',
    scen_sub: 'Проекции исхода при разной интенсивности вмешательств.',
    scen_passive_t: 'Пассивный',
    scen_passive_d: 'Минимум мер. Опустынивание продолжается, пыльные бури усиливаются.',
    scen_moderate_t: 'Умеренный',
    scen_moderate_d: 'Точечные лесополосы и стабилизация грунта. Частичное озеленение.',
    scen_aggressive_t: 'Агрессивный',
    scen_aggressive_d: 'Полный комплекс мер: саксаул, ветрозащита, каналы, ИИ-мониторинг.',
    scen_metric_area: 'Восстановлено',
    scen_metric_index: 'Индекс к 2040',
    scen_metric_dust: 'Пыльные дни',
    cta_title: 'Инженерия климата — часть большого плана',
    cta_sub: 'Как восстановление Аралкум встраивается в дорожную карту и архитектуру платформы ArkheOSium.',
    cta_roadmap: 'Дорожная карта',
    cta_wp: 'Полный whitepaper',
    copyright: '© ArkheOSium — Planetary Infrastructure OS. Данные демонстрационные.',
    years_note: 'Годы: 2026 → 2040',
  },
  en: {
    back: 'Back to roadmap',
    doc_label: 'Climate Engineering',
    eyebrow: 'Climate restoration',
    hero_title: 'Climate Engineering',
    hero_accent: 'Aralkum & the fight against desertification',
    hero_lead:
      'Track land degradation and simulate restoration interventions across the exposed Aral seabed. Move the restoration progress — the map comes alive.',
    kpi_index: 'Desertification index',
    kpi_dust: 'Dust-storm days / yr',
    kpi_restored: 'Restored area, ha',
    kpi_afforest: 'Afforestation coverage',
    map_eyebrow: 'Aralkum digital twin',
    map_title: 'Degradation heatmap',
    map_sub:
      'Each cell is a plot of exposed salt seabed. Red is degraded, green is restored vegetation. Drag the restoration slider.',
    slider_label: 'Restoration progress',
    legend_degraded: 'Degraded',
    legend_transition: 'Transition',
    legend_restored: 'Restored',
    tip_veg: 'Vegetation',
    tip_salinity: 'Salinity',
    tip_dust: 'Dust risk',
    tip_cell: 'Plot',
    interv_eyebrow: 'Scenario modelling',
    interv_title: 'Interventions',
    interv_sub:
      'Toggle restoration measures — they accelerate greening of the map and lower the projected desertification index.',
    proj_index: 'Projected index',
    proj_veg: 'Projected vegetation',
    interv_active: 'measures active',
    charts_eyebrow: 'Dynamics',
    charts_title: 'Restoration trends',
    charts_sub:
      'The desertification index falls while vegetation cover rises. Curves redraw with the slider and interventions.',
    chart_index_title: 'Desertification index',
    chart_veg_title: 'Vegetation cover',
    scen_eyebrow: 'Scenarios to 2040',
    scen_title: 'Three restoration paths',
    scen_sub: 'Projected outcomes under different intervention intensities.',
    scen_passive_t: 'Passive',
    scen_passive_d: 'Minimal action. Desertification continues, dust storms intensify.',
    scen_moderate_t: 'Moderate',
    scen_moderate_d: 'Targeted windbreaks and soil stabilization. Partial greening.',
    scen_aggressive_t: 'Aggressive',
    scen_aggressive_d: 'Full package: saxaul, windbreaks, channels, AI monitoring.',
    scen_metric_area: 'Restored',
    scen_metric_index: 'Index by 2040',
    scen_metric_dust: 'Dust days',
    cta_title: 'Climate engineering is part of the bigger plan',
    cta_sub: 'How Aralkum restoration fits into the roadmap and the ArkheOSium platform architecture.',
    cta_roadmap: 'Roadmap',
    cta_wp: 'Full whitepaper',
    copyright: '© ArkheOSium — Planetary Infrastructure OS. Data is illustrative.',
    years_note: 'Years: 2026 → 2040',
  },
} as const;

// ─── Types ───────────────────────────────────────────────────────────────────────

interface CellMeta {
  idx: number;
  threshold: number; // 0..1 — progress at which this cell flips to restored
  vegBase: number;
  salinityBase: number;
  dustBase: number;
}

interface Intervention {
  id: string;
  Icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  label_ru: string;
  label_en: string;
  color: string;
  boost: number; // effective progress boost (0..1)
}

interface Scenario {
  key: string;
  color: string;
  restored: string;
  index: number;
  dust: number;
  spark: number[];
}

// ─── Deterministic pseudo-random (no per-frame arrays) ──────────────────────────

function hash(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

// ─── Interventions ──────────────────────────────────────────────────────────────

const INTERVENTIONS: Intervention[] = [
  { id: 'saxaul', Icon: Sprout, label_ru: 'Посадка саксаула', label_en: 'Saxaul planting', color: '#22c55e', boost: 0.12 },
  { id: 'windbreak', Icon: Wind, label_ru: 'Ветрозащитные полосы', label_en: 'Windbreaks', color: '#00d4ff', boost: 0.08 },
  { id: 'soil', Icon: Mountain, label_ru: 'Стабилизация грунта', label_en: 'Soil stabilization', color: '#fbbf24', boost: 0.07 },
  { id: 'water', Icon: Droplets, label_ru: 'Водные каналы', label_en: 'Water channels', color: '#00e6c8', boost: 0.1 },
];

// ─── Reusable animated section ──────────────────────────────────────────────────

function Section({
  id, eyebrow, title, subtitle, children,
}: {
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

// ─── KPI tile ───────────────────────────────────────────────────────────────────

function KpiTile({
  Icon, val, label, color, trend,
}: {
  Icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  val: string; label: string; color: string; trend?: 'up' | 'down';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.4 }}
      className="bg-[#000d24] border border-white/10 rounded-2xl p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: color + '18', color }}>
          <Icon size={17} />
        </div>
        {trend === 'down' && <TrendingDown size={15} className="text-emerald-400" />}
        {trend === 'up' && <TrendingUp size={15} style={{ color: ACCENT }} />}
      </div>
      <div className="text-2xl font-black font-mono" style={{ color }}>{val}</div>
      <div className="text-[11px] text-gray-500 mt-1 leading-tight">{label}</div>
    </motion.div>
  );
}

// ─── Color helpers (red → amber → green) ────────────────────────────────────────

function lerp(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * t);
}

/** Map 0 (degraded) → 1 (restored) to an RGB string. */
function stateColor(t: number): string {
  // 0 red(220,38,38) → 0.5 amber(245,158,11) → 1 green(34,197,94)
  if (t < 0.5) {
    const k = t / 0.5;
    return `rgb(${lerp(220, 245, k)}, ${lerp(38, 158, k)}, ${lerp(38, 11, k)})`;
  }
  const k = (t - 0.5) / 0.5;
  return `rgb(${lerp(245, 34, k)}, ${lerp(158, 197, k)}, ${lerp(11, 94, k)})`;
}

// ─── Trend chart (SVG area) ─────────────────────────────────────────────────────

function TrendChart({
  points, color, title, unit, reduce,
}: {
  points: number[]; color: string; title: string; unit: string; reduce: boolean;
}) {
  const W = 480;
  const H = 160;
  const PAD = 8;
  const max = 100;
  const step = (W - PAD * 2) / (points.length - 1);
  const coords = points.map((p, i) => {
    const x = PAD + i * step;
    const y = PAD + (1 - p / max) * (H - PAD * 2);
    return [x, y] as const;
  });
  const line = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${line} L${coords[coords.length - 1][0].toFixed(1)},${H - PAD} L${coords[0][0].toFixed(1)},${H - PAD} Z`;
  const last = points[points.length - 1];
  const gid = `grad-${title.replace(/\s+/g, '')}`;

  return (
    <div className="bg-[#000d24] border border-white/10 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-white">{title}</span>
        <span className="text-lg font-black font-mono" style={{ color }}>{Math.round(last)}{unit}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="none">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((g) => (
          <line key={g} x1={PAD} x2={W - PAD} y1={PAD + g * (H - PAD * 2)} y2={PAD + g * (H - PAD * 2)}
            stroke="#ffffff" strokeOpacity="0.05" strokeWidth="1" />
        ))}
        <motion.path
          d={area}
          fill={`url(#${gid})`}
          initial={false}
          animate={{ d: area }}
          transition={reduce ? { duration: 0 } : { duration: 0.5, ease: 'easeOut' }}
        />
        <motion.path
          d={line}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={{ d: line }}
          transition={reduce ? { duration: 0 } : { duration: 0.5, ease: 'easeOut' }}
        />
        <circle cx={coords[coords.length - 1][0]} cy={coords[coords.length - 1][1]} r="4" fill={color} />
      </svg>
    </div>
  );
}

// ─── Sparkline ──────────────────────────────────────────────────────────────────

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const W = 120;
  const H = 34;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const step = W / (data.length - 1);
  const d = data
    .map((v, i) => `${i === 0 ? 'M' : 'L'}${(i * step).toFixed(1)},${(H - ((v - min) / range) * H).toFixed(1)}`)
    .join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-8" preserveAspectRatio="none">
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════════════════════

export default function ClimatePage() {
  const [, navigate] = useLocation();
  const { i18n } = useTranslation();
  const reduce = useReducedMotion() ?? false;
  const lang = (i18n.language || 'ru').slice(0, 2);
  const s = (STRINGS as Record<string, typeof STRINGS.ru>)[lang] ?? STRINGS.ru;

  const [progress, setProgress] = useState(20); // 0..100
  const [active, setActive] = useState<Record<string, boolean>>({});
  const [hover, setHover] = useState<{ meta: CellMeta; x: number; y: number } | null>(null);

  // Memoized static grid metadata (never recreated per render)
  const cells = useMemo<CellMeta[]>(() => {
    return Array.from({ length: CELL_COUNT }, (_, idx) => {
      const col = idx % GRID_COLS;
      const row = Math.floor(idx / GRID_COLS);
      // Cells nearer the (former shore) edges restore earlier → lower threshold.
      const edgeDist = Math.min(col, GRID_COLS - 1 - col, row, GRID_ROWS - 1 - row);
      const edgeFactor = edgeDist / (Math.min(GRID_COLS, GRID_ROWS) / 2);
      const noise = hash(idx);
      const threshold = Math.min(0.98, Math.max(0.02, edgeFactor * 0.6 + noise * 0.4));
      return {
        idx,
        threshold,
        vegBase: Math.round(8 + noise * 22),
        salinityBase: Math.round(28 + hash(idx + 99) * 40),
        dustBase: Math.round(30 + hash(idx + 7) * 55),
      };
    });
  }, []);

  // Effective progress = slider + intervention boosts (capped at 1)
  const boostSum = useMemo(
    () => INTERVENTIONS.reduce((acc, it) => acc + (active[it.id] ? it.boost : 0), 0),
    [active],
  );
  const effProgress = Math.min(1, progress / 100 + boostSum);
  const activeCount = INTERVENTIONS.filter((it) => active[it.id]).length;

  // Derived KPIs
  const restoredFraction = effProgress;
  const kpiIndex = (72 - restoredFraction * 52).toFixed(0); // desertification index 72 → 20
  const kpiDust = Math.round(78 - restoredFraction * 55); // dust days
  const kpiRestored = Math.round(restoredFraction * 1_400_000).toLocaleString('ru-RU');
  const kpiAfforest = Math.round(restoredFraction * 68);

  // Trend series (redraw with effProgress). 8 year steps 2026→2040.
  const YEARS = 8;
  const indexSeries = useMemo(
    () => Array.from({ length: YEARS }, (_, i) => {
      const t = i / (YEARS - 1);
      return 72 - effProgress * 52 * t;
    }),
    [effProgress],
  );
  const vegSeries = useMemo(
    () => Array.from({ length: YEARS }, (_, i) => {
      const t = i / (YEARS - 1);
      return 6 + effProgress * 74 * t;
    }),
    [effProgress],
  );

  // Cell tooltip stats depend on progress relative to threshold
  function cellStats(meta: CellMeta) {
    const restored = effProgress >= meta.threshold;
    const localT = Math.max(0, Math.min(1, (effProgress - meta.threshold + 0.25) / 0.5));
    const veg = Math.round(meta.vegBase + localT * (92 - meta.vegBase));
    const salinity = Math.round(meta.salinityBase * (1 - localT * 0.6));
    const dust = Math.round(meta.dustBase * (1 - localT * 0.7));
    return { restored, veg, salinity, dust };
  }

  const scenarios: Scenario[] = [
    {
      key: 'passive', color: '#f87171', restored: '120K', index: 68, dust: 74,
      spark: [72, 71, 71, 70, 70, 69, 69, 68],
    },
    {
      key: 'moderate', color: '#fbbf24', restored: '640K', index: 41, dust: 44,
      spark: [72, 68, 63, 58, 53, 49, 45, 41],
    },
    {
      key: 'aggressive', color: '#22c55e', restored: '1.35M', index: 19, dust: 16,
      spark: [72, 62, 52, 43, 35, 29, 23, 19],
    },
  ];

  const scenText: Record<string, { t: string; d: string }> = {
    passive: { t: s.scen_passive_t, d: s.scen_passive_d },
    moderate: { t: s.scen_moderate_t, d: s.scen_moderate_d },
    aggressive: { t: s.scen_aggressive_t, d: s.scen_aggressive_d },
  };

  return (
    <div className="min-h-screen text-gray-200">

      {/* ── Top bar ── */}
      <div className="sticky top-0 z-40 bg-[#000818]/95 backdrop-blur border-b border-white/5 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate('/roadmap')}
          className="flex items-center gap-2 text-sm text-[#00e6c8]/70 hover:text-[#00e6c8] transition-colors flex-shrink-0"
        >
          <ArrowLeft size={16} /> {s.back}
        </button>
        <div className="flex items-center gap-2 text-sm text-gray-400 flex-shrink-0">
          <Trees size={14} />
          <span className="hidden sm:inline">{s.doc_label}</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => navigate('/whitepaper-full')}
            className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border border-[#00e6c8]/30 text-[#00e6c8] hover:bg-[#00e6c8]/10 transition-colors"
          >
            <FileText size={12} /> {s.cta_wp}
          </button>
        </div>
      </div>

      {/* ══ HERO ══ */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a0a00]/40 via-[#00153a]/30 to-[#000818]" />
          {!reduce && (
            <>
              <motion.div
                className="absolute -top-20 right-0 w-[560px] h-[340px] rounded-full bg-[#22c55e]/8 blur-3xl"
                animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
                transition={{ duration: 13, repeat: Infinity }}
              />
              <motion.div
                className="absolute bottom-0 left-1/4 w-[440px] h-[220px] rounded-full bg-[#f59e0b]/10 blur-3xl"
                animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
                transition={{ duration: 15, repeat: Infinity }}
              />
            </>
          )}
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 text-xs text-[#22c55e] bg-[#22c55e]/10 border border-[#22c55e]/20 rounded-full px-3 py-1 mb-6 w-fit">
              <Leaf size={11} /> {s.eyebrow}
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white mb-5 tracking-tight leading-[0.98]">
              {s.hero_title}
              <br />
              <span className="bg-gradient-to-r from-[#22c55e] via-[#00e6c8] to-[#00d4ff] bg-clip-text text-transparent text-2xl md:text-4xl">
                {s.hero_accent}
              </span>
            </h1>

            <p className="text-gray-400 text-base md:text-lg mb-8 max-w-2xl leading-relaxed">
              {s.hero_lead}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl">
              <KpiTile Icon={Gauge} val={kpiIndex} label={s.kpi_index} color="#f87171" trend="down" />
              <KpiTile Icon={Wind} val={String(kpiDust)} label={s.kpi_dust} color="#fbbf24" trend="down" />
              <KpiTile Icon={Sprout} val={kpiRestored} label={s.kpi_restored} color="#22c55e" trend="up" />
              <KpiTile Icon={Trees} val={`${kpiAfforest}%`} label={s.kpi_afforest} color={ACCENT} trend="up" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ HEATMAP (centerpiece) ══ */}
      <Section id="heatmap" eyebrow={s.map_eyebrow} title={s.map_title} subtitle={s.map_sub}>
        <div className="bg-[#000d24] border border-white/10 rounded-2xl p-4 md:p-6">

          {/* Slider */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: ACCENT }}>
                {s.slider_label}
              </label>
              <span className="font-mono text-sm font-bold" style={{ color: ACCENT }}>
                {Math.round(effProgress * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full accent-[#00e6c8] cursor-pointer"
              aria-label={s.slider_label}
            />
          </div>

          {/* Grid */}
          <div className="relative">
            <div
              className="grid gap-[3px] rounded-xl overflow-hidden"
              style={{ gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))` }}
              onMouseLeave={() => setHover(null)}
            >
              {cells.map((meta) => {
                // Deterministic flip: distance of effProgress past threshold, smoothed.
                const t = Math.max(0, Math.min(1, (effProgress - meta.threshold) / 0.28 + 0.5));
                return (
                  <div
                    key={meta.idx}
                    className="aspect-square rounded-[3px] cursor-pointer"
                    style={{
                      backgroundColor: stateColor(t),
                      transition: reduce ? 'none' : 'background-color 0.6s ease',
                      opacity: 0.9,
                    }}
                    onMouseEnter={(e) => {
                      const rect = (e.currentTarget.closest('.relative') as HTMLElement)?.getBoundingClientRect();
                      const cr = e.currentTarget.getBoundingClientRect();
                      setHover({
                        meta,
                        x: cr.left - (rect?.left ?? 0) + cr.width / 2,
                        y: cr.top - (rect?.top ?? 0),
                      });
                    }}
                  />
                );
              })}
            </div>

            {/* Tooltip */}
            {hover && (() => {
              const st = cellStats(hover.meta);
              return (
                <div
                  className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full mb-1 w-44 bg-[#000818] border border-white/15 rounded-lg p-3 shadow-xl"
                  style={{ left: hover.x, top: hover.y - 6 }}
                >
                  <div className="text-[11px] text-gray-500 mb-2">
                    {s.tip_cell} #{hover.meta.idx + 1}
                  </div>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-gray-400">{s.tip_veg}</span>
                      <span className="font-mono text-emerald-400">{st.veg}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">{s.tip_salinity}</span>
                      <span className="font-mono text-amber-400">{st.salinity} g/L</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">{s.tip_dust}</span>
                      <span className="font-mono text-red-400">{st.dust}%</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-5 mt-5 flex-wrap text-[11px] text-gray-400">
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-[3px]" style={{ backgroundColor: stateColor(0) }} /> {s.legend_degraded}
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-[3px]" style={{ backgroundColor: stateColor(0.5) }} /> {s.legend_transition}
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-[3px]" style={{ backgroundColor: stateColor(1) }} /> {s.legend_restored}
            </span>
          </div>
        </div>
      </Section>

      {/* ══ INTERVENTIONS ══ */}
      <Section id="interventions" eyebrow={s.interv_eyebrow} title={s.interv_title} subtitle={s.interv_sub}>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {INTERVENTIONS.map((it) => {
            const on = !!active[it.id];
            return (
              <button
                key={it.id}
                onClick={() => setActive((p) => ({ ...p, [it.id]: !p[it.id] }))}
                className="text-left rounded-2xl border p-4 transition-all"
                style={{
                  borderColor: on ? it.color + '80' : 'rgba(255,255,255,0.1)',
                  background: on ? `linear-gradient(135deg, ${it.color}18, transparent)` : 'rgba(255,255,255,0.02)',
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: it.color + '1f', color: it.color }}>
                    <it.Icon size={18} />
                  </div>
                  <span
                    className="w-9 h-5 rounded-full flex items-center transition-all px-0.5"
                    style={{ background: on ? it.color : 'rgba(255,255,255,0.12)', justifyContent: on ? 'flex-end' : 'flex-start' }}
                  >
                    <span className="w-4 h-4 rounded-full bg-white block" />
                  </span>
                </div>
                <div className="text-sm font-semibold text-white">{lang === 'en' ? it.label_en : it.label_ru}</div>
                <div className="text-[11px] font-mono mt-1" style={{ color: it.color }}>+{Math.round(it.boost * 100)}%</div>
              </button>
            );
          })}
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          <div className="bg-[#000d24] border border-white/10 rounded-2xl p-4">
            <div className="text-[11px] text-gray-500 mb-1">{s.proj_index}</div>
            <div className="text-2xl font-black font-mono" style={{ color: '#f87171' }}>{kpiIndex}</div>
          </div>
          <div className="bg-[#000d24] border border-white/10 rounded-2xl p-4">
            <div className="text-[11px] text-gray-500 mb-1">{s.proj_veg}</div>
            <div className="text-2xl font-black font-mono" style={{ color: '#22c55e' }}>{kpiAfforest}%</div>
          </div>
          <div className="bg-[#000d24] border border-white/10 rounded-2xl p-4">
            <div className="text-[11px] text-gray-500 mb-1">{s.interv_active}</div>
            <div className="text-2xl font-black font-mono" style={{ color: ACCENT }}>{activeCount}/{INTERVENTIONS.length}</div>
          </div>
        </div>
      </Section>

      {/* ══ TREND CHARTS ══ */}
      <Section id="trends" eyebrow={s.charts_eyebrow} title={s.charts_title} subtitle={s.charts_sub}>
        <div className="grid md:grid-cols-2 gap-4">
          <TrendChart points={indexSeries} color="#f87171" title={s.chart_index_title} unit="" reduce={reduce} />
          <TrendChart points={vegSeries} color="#22c55e" title={s.chart_veg_title} unit="%" reduce={reduce} />
        </div>
        <div className="text-[11px] text-gray-600 mt-3 text-center">{s.years_note}</div>
      </Section>

      {/* ══ SCENARIO CARDS ══ */}
      <Section id="scenarios" eyebrow={s.scen_eyebrow} title={s.scen_title} subtitle={s.scen_sub}>
        <div className="grid md:grid-cols-3 gap-4">
          {scenarios.map((sc, i) => (
            <motion.div
              key={sc.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border p-5"
              style={{ borderColor: sc.color + '30', background: `linear-gradient(135deg, ${sc.color}0a, transparent)` }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: sc.color }} />
                <h3 className="text-white font-bold">{scenText[sc.key].t}</h3>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed mb-4 min-h-[48px]">{scenText[sc.key].d}</p>

              <div className="mb-4">
                <Sparkline data={sc.spark} color={sc.color} />
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white/5 rounded-lg py-2">
                  <div className="text-sm font-black font-mono" style={{ color: sc.color }}>{sc.restored}</div>
                  <div className="text-[9px] text-gray-500 mt-0.5">{s.scen_metric_area}</div>
                </div>
                <div className="bg-white/5 rounded-lg py-2">
                  <div className="text-sm font-black font-mono" style={{ color: sc.color }}>{sc.index}</div>
                  <div className="text-[9px] text-gray-500 mt-0.5">{s.scen_metric_index}</div>
                </div>
                <div className="bg-white/5 rounded-lg py-2">
                  <div className="text-sm font-black font-mono" style={{ color: sc.color }}>{sc.dust}</div>
                  <div className="text-[9px] text-gray-500 mt-0.5">{s.scen_metric_dust}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ══ CTA ══ */}
      <section id="cta" className="scroll-mt-24 py-16 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-[#22c55e]/20 p-8 text-center bg-gradient-to-b from-[#22c55e]/5 to-transparent"
          >
            <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-5 bg-[#22c55e]/10 text-[#22c55e]">
              <Waves size={26} />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white mb-3">{s.cta_title}</h2>
            <p className="text-gray-400 text-sm md:text-base mb-7 max-w-xl mx-auto leading-relaxed">{s.cta_sub}</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => navigate('/roadmap')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00e6c8]/10 border border-[#00e6c8]/30 text-[#00e6c8] hover:bg-[#00e6c8]/20 transition-colors text-sm font-medium"
              >
                <Compass size={14} /> {s.cta_roadmap}
              </button>
              <button
                onClick={() => navigate('/whitepaper-full')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00d4ff]/10 border border-[#00d4ff]/30 text-[#00d4ff] hover:bg-[#00d4ff]/20 transition-colors text-sm font-medium"
                style={{ borderColor: ACCENT2 + '4d' }}
              >
                <FileText size={14} /> {s.cta_wp}
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-8">{s.copyright}</p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
