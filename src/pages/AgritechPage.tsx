import { useState, useMemo, useRef } from 'react';
import { useLocation } from 'wouter';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, Droplets, Sprout, Wheat, Leaf, Sun, Cpu,
  TrendingDown, TrendingUp, FileText, Compass, Gauge, Warehouse,
} from 'lucide-react';

// ══════════════════════════════════════════════════════════════════════════════
//  ArkheOSium — Precision Agriculture / Agritech on restored Aral land
//  Route: /agritech
// ══════════════════════════════════════════════════════════════════════════════

const ACCENT = '#84cc16';
const ACCENT2 = '#22d3ee';

const GRID_COLS = 14;
const GRID_ROWS = 8;
const CELL_COUNT = GRID_COLS * GRID_ROWS;

// ─── i18n (self-contained, bilingual) ───────────────────────────────────────────

const STRINGS = {
  ru: {
    back: 'Назад к дорожной карте',
    doc_label: 'Точное земледелие',
    eyebrow: 'Агротех на восстановленной земле',
    hero_title: 'Точное земледелие',
    hero_accent: 'Урожай на восстановленном дне Арала',
    hero_lead:
      'Планировщик орошения и структуры посевов для рекультивированных солёных земель. Двигайте распределение воды и состав культур — поле, урожай и расход воды пересчитываются в реальном времени.',
    kpi_area: 'Орошаемая площадь, га',
    kpi_wue: 'Эффективность воды',
    kpi_yield: 'Средний урожай, т/га',
    kpi_halo: 'Покрытие галофитами',
    planner_eyebrow: 'Цифровой агроном',
    planner_title: 'Планировщик орошения и посевов',
    planner_sub:
      'Настройте долю капельного орошения и баланс галофитов и злаков. Донат и поле пересчитывают урожай и экономию воды под ваш выбор.',
    slider_drip: 'Доля капельного орошения',
    slider_mix: 'Галофиты ↔ Злаки',
    mix_left: 'Галофиты',
    mix_right: 'Злаки',
    donut_yield: 'Урожай',
    donut_water: 'Расход воды',
    donut_saved: 'Экономия воды',
    field_legend_low: 'Низкий',
    field_legend_mid: 'Средний',
    field_legend_high: 'Высокий',
    field_note: 'Тепловая карта продуктивности участков. Клетки у периметра — более засолённые.',
    tip_yield: 'Урожай',
    tip_water: 'Вода',
    tip_salt: 'Засолённость',
    tip_plot: 'Участок',
    interv_eyebrow: 'Сценарное моделирование',
    interv_title: 'Агротех-вмешательства',
    interv_sub:
      'Включайте технологии — они повышают прогнозный урожай и сокращают расход воды на поле.',
    proj_yield: 'Прогнозный урожай',
    proj_water: 'Прогнозный расход воды',
    interv_active: 'технологий активно',
    charts_eyebrow: 'Динамика',
    charts_title: 'Тренды агротеха',
    charts_sub:
      'Урожайность растёт, водопотребление снижается. Кривые перестраиваются вслед за настройками планировщика и вмешательствами.',
    chart_yield_title: 'Рост урожайности',
    chart_water_title: 'Снижение водопотребления',
    scen_eyebrow: 'Сценарии до 2040',
    scen_title: 'Три пути земледелия',
    scen_sub: 'Проекции исхода при разной интенсивности агротех-вмешательств.',
    scen_baseline_t: 'Традиционный',
    scen_baseline_d: 'Затопляемое орошение, обычные злаки. Высокий расход воды, засоление.',
    scen_hybrid_t: 'Гибридный',
    scen_hybrid_d: 'Частичное капельное орошение, смешанные культуры, базовые сенсоры.',
    scen_precision_t: 'Точный',
    scen_precision_d: 'Полный комплекс: капля, галофиты, ИИ-сенсоры, теплицы, спутники.',
    scen_metric_yield: 'Урожай т/га',
    scen_metric_water: 'Вода индекс',
    scen_metric_area: 'Площадь га',
    cta_title: 'Агротех — часть большого плана',
    cta_sub: 'Как точное земледелие на восстановленной земле встраивается в дорожную карту и архитектуру платформы ArkheOSium.',
    cta_roadmap: 'Дорожная карта',
    cta_wp: 'Полный whitepaper',
    copyright: '© ArkheOSium — Planetary Infrastructure OS. Данные демонстрационные.',
    years_note: 'Годы: 2026 → 2040',
  },
  en: {
    back: 'Back to roadmap',
    doc_label: 'Precision agriculture',
    eyebrow: 'Agritech on restored land',
    hero_title: 'Precision agriculture',
    hero_accent: 'Harvest from the restored Aral seabed',
    hero_lead:
      'An irrigation and crop-mix planner for reclaimed saline lands. Move the water allocation and crop composition — the field, yield and water use recompute in real time.',
    kpi_area: 'Irrigated area, ha',
    kpi_wue: 'Water-use efficiency',
    kpi_yield: 'Avg yield, t/ha',
    kpi_halo: 'Halophyte coverage',
    planner_eyebrow: 'Digital agronomist',
    planner_title: 'Irrigation & crop planner',
    planner_sub:
      'Tune the share of drip irrigation and the balance of halophytes vs cereals. The donut and field recompute yield and water savings for your choice.',
    slider_drip: 'Drip irrigation share',
    slider_mix: 'Halophytes ↔ Cereals',
    mix_left: 'Halophytes',
    mix_right: 'Cereals',
    donut_yield: 'Yield',
    donut_water: 'Water use',
    donut_saved: 'Water saved',
    field_legend_low: 'Low',
    field_legend_mid: 'Medium',
    field_legend_high: 'High',
    field_note: 'Plot productivity heatmap. Perimeter cells are more saline.',
    tip_yield: 'Yield',
    tip_water: 'Water',
    tip_salt: 'Salinity',
    tip_plot: 'Plot',
    interv_eyebrow: 'Scenario modelling',
    interv_title: 'Agritech interventions',
    interv_sub:
      'Toggle technologies — they raise the projected yield and cut field water consumption.',
    proj_yield: 'Projected yield',
    proj_water: 'Projected water use',
    interv_active: 'technologies active',
    charts_eyebrow: 'Dynamics',
    charts_title: 'Agritech trends',
    charts_sub:
      'Yield rises while water consumption falls. Curves redraw with planner settings and interventions.',
    chart_yield_title: 'Yield growth',
    chart_water_title: 'Water consumption decline',
    scen_eyebrow: 'Scenarios to 2040',
    scen_title: 'Three farming paths',
    scen_sub: 'Projected outcomes under different intervention intensities.',
    scen_baseline_t: 'Traditional',
    scen_baseline_d: 'Flood irrigation, ordinary cereals. High water use, salinization.',
    scen_hybrid_t: 'Hybrid',
    scen_hybrid_d: 'Partial drip irrigation, mixed crops, basic sensors.',
    scen_precision_t: 'Precision',
    scen_precision_d: 'Full package: drip, halophytes, AI sensors, greenhouses, satellites.',
    scen_metric_yield: 'Yield t/ha',
    scen_metric_water: 'Water index',
    scen_metric_area: 'Area ha',
    cta_title: 'Agritech is part of the bigger plan',
    cta_sub: 'How precision agriculture on restored land fits into the roadmap and the ArkheOSium platform architecture.',
    cta_roadmap: 'Roadmap',
    cta_wp: 'Full whitepaper',
    copyright: '© ArkheOSium — Planetary Infrastructure OS. Data is illustrative.',
    years_note: 'Years: 2026 → 2040',
  },
} as const;

// ─── Types ───────────────────────────────────────────────────────────────────────

interface PlotMeta {
  idx: number;
  saltBase: number;   // 0..1 — baseline salinity of the plot
  fertBase: number;   // 0..1 — baseline fertility potential
}

interface Intervention {
  id: string;
  Icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  label_ru: string;
  label_en: string;
  color: string;
  yieldBoost: number; // additive yield boost (0..1)
  waterCut: number;   // additive water reduction (0..1)
}

interface Scenario {
  key: string;
  color: string;
  yield_: string;
  water: number;
  area: string;
  spark: number[];
}

// ─── Deterministic pseudo-random (no per-frame arrays) ──────────────────────────

function hash(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

// ─── Interventions ──────────────────────────────────────────────────────────────

const INTERVENTIONS: Intervention[] = [
  { id: 'drip', Icon: Droplets, label_ru: 'Капельное орошение', label_en: 'Drip irrigation', color: ACCENT2, yieldBoost: 0.10, waterCut: 0.22 },
  { id: 'halophyte', Icon: Leaf, label_ru: 'Галофиты', label_en: 'Halophyte cultivation', color: '#22c55e', yieldBoost: 0.14, waterCut: 0.08 },
  { id: 'sensors', Icon: Cpu, label_ru: 'Почвенные сенсоры', label_en: 'Soil sensors', color: ACCENT, yieldBoost: 0.09, waterCut: 0.12 },
  { id: 'greenhouse', Icon: Sun, label_ru: 'Теплицы', label_en: 'Greenhouses', color: '#fbbf24', yieldBoost: 0.16, waterCut: 0.10 },
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
        {trend === 'down' && <TrendingDown size={15} className="text-cyan-400" />}
        {trend === 'up' && <TrendingUp size={15} style={{ color: ACCENT }} />}
      </div>
      <div className="text-2xl font-black font-mono" style={{ color }}>{val}</div>
      <div className="text-[11px] text-gray-500 mt-1 leading-tight">{label}</div>
    </motion.div>
  );
}

// ─── Color helpers (amber-low → lime-mid → cyan-high productivity) ──────────────

function lerp(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * t);
}

/** Map 0 (low productivity) → 1 (high productivity) to an RGB string. */
function prodColor(t: number): string {
  // 0 amber(180,83,9) → 0.5 lime(132,204,22) → 1 cyan(34,211,238)
  if (t < 0.5) {
    const k = t / 0.5;
    return `rgb(${lerp(180, 132, k)}, ${lerp(83, 204, k)}, ${lerp(9, 22, k)})`;
  }
  const k = (t - 0.5) / 0.5;
  return `rgb(${lerp(132, 34, k)}, ${lerp(204, 211, k)}, ${lerp(22, 238, k)})`;
}

// ─── Trend chart (SVG area) ─────────────────────────────────────────────────────

function TrendChart({
  points, color, title, unit, reduce, decimals = 0,
}: {
  points: number[]; color: string; title: string; unit: string; reduce: boolean; decimals?: number;
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
        <span className="text-lg font-black font-mono" style={{ color }}>{last.toFixed(decimals)}{unit}</span>
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

// ─── Donut arc helper ───────────────────────────────────────────────────────────

function arcPath(cx: number, cy: number, r: number, startFrac: number, endFrac: number): string {
  const a0 = startFrac * 2 * Math.PI - Math.PI / 2;
  const a1 = endFrac * 2 * Math.PI - Math.PI / 2;
  const x0 = cx + r * Math.cos(a0);
  const y0 = cy + r * Math.sin(a0);
  const x1 = cx + r * Math.cos(a1);
  const y1 = cy + r * Math.sin(a1);
  const large = endFrac - startFrac > 0.5 ? 1 : 0;
  return `M${x0.toFixed(2)},${y0.toFixed(2)} A${r},${r} 0 ${large} 1 ${x1.toFixed(2)},${y1.toFixed(2)}`;
}

// ══════════════════════════════════════════════════════════════════════════════

export default function AgritechPage() {
  const [, navigate] = useLocation();
  const { i18n } = useTranslation();
  const reduce = useReducedMotion() ?? false;
  const lang = (i18n.language || 'ru').slice(0, 2);
  const s = (STRINGS as Record<string, typeof STRINGS.ru>)[lang] ?? STRINGS.ru;

  const [drip, setDrip] = useState(45);   // 0..100 — share of drip irrigation
  const [mix, setMix] = useState(50);     // 0..100 — 0 = all halophytes, 100 = all cereals
  const [active, setActive] = useState<Record<string, boolean>>({});
  const [hover, setHover] = useState<{ meta: PlotMeta; x: number; y: number } | null>(null);

  // Memoized static field metadata (never recreated per render)
  const plots = useMemo<PlotMeta[]>(() => {
    return Array.from({ length: CELL_COUNT }, (_, idx) => {
      const col = idx % GRID_COLS;
      const row = Math.floor(idx / GRID_COLS);
      // Perimeter plots are more saline (former shoreline salt crust).
      const edgeDist = Math.min(col, GRID_COLS - 1 - col, row, GRID_ROWS - 1 - row);
      const edgeFactor = 1 - edgeDist / (Math.min(GRID_COLS, GRID_ROWS) / 2);
      const noise = hash(idx);
      const saltBase = Math.min(0.98, Math.max(0.05, edgeFactor * 0.65 + noise * 0.3));
      return {
        idx,
        saltBase,
        fertBase: Math.max(0.1, 1 - saltBase * 0.8 + (hash(idx + 41) - 0.5) * 0.2),
      };
    });
  }, []);

  // Intervention aggregates
  const yieldBoostSum = useMemo(
    () => INTERVENTIONS.reduce((acc, it) => acc + (active[it.id] ? it.yieldBoost : 0), 0),
    [active],
  );
  const waterCutSum = useMemo(
    () => INTERVENTIONS.reduce((acc, it) => acc + (active[it.id] ? it.waterCut : 0), 0),
    [active],
  );
  const activeCount = INTERVENTIONS.filter((it) => active[it.id]).length;

  // Normalized planner factors (0..1)
  const dripF = drip / 100;                 // more drip → more water saved
  const cerealF = mix / 100;                // more cereals → higher yield ceiling but thirstier
  const haloF = 1 - cerealF;                // more halophytes → salt-tolerant, water-thrifty

  // Yield model (t/ha, illustrative). Cereals raise ceiling; halophytes add salt-land floor.
  const yieldFactor = Math.min(
    1,
    0.32 + cerealF * 0.34 + haloF * 0.14 + dripF * 0.14 + yieldBoostSum,
  );
  const avgYield = 2.0 + yieldFactor * 5.2; // ~2.0 → 7.2 t/ha

  // Water model (index 0..100, lower = better). Cereals thirsty; drip + halophytes save.
  const waterIndex = Math.max(
    12,
    Math.round(88 - dripF * 34 - haloF * 18 - waterCutSum * 60 - cerealF * -6),
  );
  const waterSaved = Math.min(78, Math.round(dripF * 34 + haloF * 18 + waterCutSum * 60));

  // Donut fractions for yield vs water (normalized against each other)
  const yieldFrac = yieldFactor;                 // 0..1
  const savedFrac = Math.min(1, waterSaved / 78); // 0..1

  // Derived KPIs
  const kpiArea = Math.round(180_000 + (dripF * 0.5 + yieldFactor * 0.5) * 240_000).toLocaleString('ru-RU');
  const kpiWue = Math.round(42 + dripF * 34 + waterCutSum * 40); // %
  const kpiYield = avgYield.toFixed(1);
  const kpiHalo = Math.round(haloF * 100);

  // Per-plot productivity given planner state
  function plotProd(meta: PlotMeta): number {
    // Salt-tolerant mix helps saline plots; cereals penalized on salt.
    const saltTol = haloF * 0.7 + (active['halophyte'] ? 0.15 : 0);
    const effSalt = Math.max(0, meta.saltBase - saltTol);
    const irrig = dripF * 0.35 + 0.25 + waterCutSum * 0.2;
    const base = meta.fertBase * 0.6 + irrig * 0.5 + yieldBoostSum * 0.6;
    return Math.max(0, Math.min(1, base - effSalt * 0.7));
  }

  // Trend series (redraw with planner + interventions). 8 year steps 2026→2040.
  const YEARS = 8;
  const yieldSeries = useMemo(
    () => Array.from({ length: YEARS }, (_, i) => {
      const tt = i / (YEARS - 1);
      // scaled to 0..100 for the chart (7.5 t/ha == 100)
      return (2.0 + yieldFactor * 5.2 * (0.4 + 0.6 * tt)) / 7.5 * 100;
    }),
    [yieldFactor],
  );
  const waterSeries = useMemo(
    () => Array.from({ length: YEARS }, (_, i) => {
      const tt = i / (YEARS - 1);
      return waterIndex + (88 - waterIndex) * (1 - tt);
    }),
    [waterIndex],
  );

  // Plot tooltip stats
  function plotStats(meta: PlotMeta) {
    const prod = plotProd(meta);
    const y = (2.0 + prod * 5.5).toFixed(1);
    const water = Math.round(30 + meta.saltBase * 45 - dripF * 20 - waterCutSum * 25);
    const salt = Math.round(meta.saltBase * 42);
    return { y, water: Math.max(8, water), salt };
  }

  const scenarios: Scenario[] = [
    {
      key: 'baseline', color: '#fbbf24', yield_: '2.4', water: 86, area: '120K',
      spark: [28, 29, 30, 31, 31, 32, 32, 33],
    },
    {
      key: 'hybrid', color: ACCENT, yield_: '4.6', water: 54, area: '310K',
      spark: [30, 38, 45, 52, 58, 62, 66, 70],
    },
    {
      key: 'precision', color: ACCENT2, yield_: '7.1', water: 26, area: '420K',
      spark: [32, 44, 56, 68, 78, 86, 92, 96],
    },
  ];

  const scenText: Record<string, { t: string; d: string }> = {
    baseline: { t: s.scen_baseline_t, d: s.scen_baseline_d },
    hybrid: { t: s.scen_hybrid_t, d: s.scen_hybrid_d },
    precision: { t: s.scen_precision_t, d: s.scen_precision_d },
  };

  // Donut geometry
  const DC = 90;   // center
  const DR = 62;   // radius

  return (
    <div className="min-h-screen text-gray-200">

      {/* ── Top bar ── */}
      <div className="sticky top-0 z-40 bg-[#000818]/95 backdrop-blur border-b border-white/5 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate('/roadmap')}
          className="flex items-center gap-2 text-sm text-[#84cc16]/70 hover:text-[#84cc16] transition-colors flex-shrink-0"
        >
          <ArrowLeft size={16} /> {s.back}
        </button>
        <div className="flex items-center gap-2 text-sm text-gray-400 flex-shrink-0">
          <Wheat size={14} />
          <span className="hidden sm:inline">{s.doc_label}</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => navigate('/whitepaper-full')}
            className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border border-[#84cc16]/30 text-[#84cc16] hover:bg-[#84cc16]/10 transition-colors"
          >
            <FileText size={12} /> {s.cta_wp}
          </button>
        </div>
      </div>

      {/* ══ HERO ══ */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a1a00]/40 via-[#00153a]/30 to-[#000818]" />
          {!reduce && (
            <>
              <motion.div
                className="absolute -top-20 right-0 w-[560px] h-[340px] rounded-full bg-[#84cc16]/8 blur-3xl"
                animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
                transition={{ duration: 13, repeat: Infinity }}
              />
              <motion.div
                className="absolute bottom-0 left-1/4 w-[440px] h-[220px] rounded-full bg-[#22d3ee]/10 blur-3xl"
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
            <div className="flex items-center gap-2 text-xs text-[#84cc16] bg-[#84cc16]/10 border border-[#84cc16]/20 rounded-full px-3 py-1 mb-6 w-fit">
              <Sprout size={11} /> {s.eyebrow}
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white mb-5 tracking-tight leading-[0.98]">
              {s.hero_title}
              <br />
              <span className="bg-gradient-to-r from-[#84cc16] via-[#22c55e] to-[#22d3ee] bg-clip-text text-transparent text-2xl md:text-4xl">
                {s.hero_accent}
              </span>
            </h1>

            <p className="text-gray-400 text-base md:text-lg mb-8 max-w-2xl leading-relaxed">
              {s.hero_lead}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl">
              <KpiTile Icon={Warehouse} val={kpiArea} label={s.kpi_area} color={ACCENT} trend="up" />
              <KpiTile Icon={Droplets} val={`${kpiWue}%`} label={s.kpi_wue} color={ACCENT2} trend="up" />
              <KpiTile Icon={Wheat} val={kpiYield} label={s.kpi_yield} color="#fbbf24" trend="up" />
              <KpiTile Icon={Leaf} val={`${kpiHalo}%`} label={s.kpi_halo} color="#22c55e" trend="up" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ PLANNER (centerpiece) ══ */}
      <Section id="planner" eyebrow={s.planner_eyebrow} title={s.planner_title} subtitle={s.planner_sub}>
        <div className="bg-[#000d24] border border-white/10 rounded-2xl p-4 md:p-6">
          <div className="grid lg:grid-cols-2 gap-6">

            {/* Left: sliders + donut */}
            <div>
              {/* Drip slider */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: ACCENT2 }}>
                    {s.slider_drip}
                  </label>
                  <span className="font-mono text-sm font-bold" style={{ color: ACCENT2 }}>{drip}%</span>
                </div>
                <input
                  type="range" min={0} max={100} value={drip}
                  onChange={(e) => setDrip(Number(e.target.value))}
                  className="w-full accent-[#22d3ee] cursor-pointer"
                  aria-label={s.slider_drip}
                />
              </div>

              {/* Crop mix slider */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: ACCENT }}>
                    {s.slider_mix}
                  </label>
                </div>
                <input
                  type="range" min={0} max={100} value={mix}
                  onChange={(e) => setMix(Number(e.target.value))}
                  className="w-full accent-[#84cc16] cursor-pointer"
                  aria-label={s.slider_mix}
                />
                <div className="flex justify-between text-[10px] text-gray-500 mt-1 font-mono">
                  <span className="text-emerald-400">{s.mix_left} {kpiHalo}%</span>
                  <span style={{ color: ACCENT }}>{s.mix_right} {cerealF * 100 | 0}%</span>
                </div>
              </div>

              {/* Donut */}
              <div className="flex items-center gap-5">
                <svg viewBox="0 0 180 180" className="w-40 h-40 flex-shrink-0">
                  {/* track */}
                  <circle cx={DC} cy={DC} r={DR} fill="none" stroke="#ffffff" strokeOpacity="0.06" strokeWidth="14" />
                  {/* yield arc */}
                  <motion.path
                    d={arcPath(DC, DC, DR, 0, Math.max(0.001, yieldFrac))}
                    fill="none" stroke={ACCENT} strokeWidth="14" strokeLinecap="round"
                    initial={false}
                    animate={{ d: arcPath(DC, DC, DR, 0, Math.max(0.001, yieldFrac)) }}
                    transition={reduce ? { duration: 0 } : { duration: 0.5, ease: 'easeOut' }}
                  />
                  {/* water-saved arc (inner) */}
                  <motion.path
                    d={arcPath(DC, DC, DR - 18, 0, Math.max(0.001, savedFrac))}
                    fill="none" stroke={ACCENT2} strokeWidth="9" strokeLinecap="round"
                    initial={false}
                    animate={{ d: arcPath(DC, DC, DR - 18, 0, Math.max(0.001, savedFrac)) }}
                    transition={reduce ? { duration: 0 } : { duration: 0.5, ease: 'easeOut' }}
                  />
                  <text x={DC} y={DC - 4} textAnchor="middle" className="fill-white" style={{ fontSize: 22, fontWeight: 900 }}>
                    {kpiYield}
                  </text>
                  <text x={DC} y={DC + 14} textAnchor="middle" className="fill-gray-500" style={{ fontSize: 9 }}>
                    t/ha
                  </text>
                </svg>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ background: ACCENT }} />
                    <span className="text-gray-400">{s.donut_yield}</span>
                    <span className="font-mono font-bold ml-auto" style={{ color: ACCENT }}>{kpiYield} t/ha</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ background: ACCENT2 }} />
                    <span className="text-gray-400">{s.donut_saved}</span>
                    <span className="font-mono font-bold ml-auto" style={{ color: ACCENT2 }}>{waterSaved}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-gray-600" />
                    <span className="text-gray-400">{s.donut_water}</span>
                    <span className="font-mono font-bold ml-auto text-gray-300">{waterIndex}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: field heatmap */}
            <div className="relative">
              <div
                className="grid gap-[3px] rounded-xl overflow-hidden"
                style={{ gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))` }}
                onMouseLeave={() => setHover(null)}
              >
                {plots.map((meta) => {
                  const prod = plotProd(meta);
                  return (
                    <div
                      key={meta.idx}
                      className="aspect-square rounded-[3px] cursor-pointer"
                      style={{
                        backgroundColor: prodColor(prod),
                        transition: reduce ? 'none' : 'background-color 0.5s ease',
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
                const st = plotStats(hover.meta);
                return (
                  <div
                    className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full w-44 bg-[#000818] border border-white/15 rounded-lg p-3 shadow-xl"
                    style={{ left: hover.x, top: hover.y - 6 }}
                  >
                    <div className="text-[11px] text-gray-500 mb-2">
                      {s.tip_plot} #{hover.meta.idx + 1}
                    </div>
                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-gray-400">{s.tip_yield}</span>
                        <span className="font-mono" style={{ color: ACCENT }}>{st.y} t/ha</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">{s.tip_water}</span>
                        <span className="font-mono" style={{ color: ACCENT2 }}>{st.water}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">{s.tip_salt}</span>
                        <span className="font-mono text-amber-400">{st.salt} g/L</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Legend */}
              <div className="flex items-center gap-5 mt-5 flex-wrap text-[11px] text-gray-400">
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-[3px]" style={{ backgroundColor: prodColor(0) }} /> {s.field_legend_low}
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-[3px]" style={{ backgroundColor: prodColor(0.5) }} /> {s.field_legend_mid}
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-[3px]" style={{ backgroundColor: prodColor(1) }} /> {s.field_legend_high}
                </span>
              </div>
              <p className="text-[11px] text-gray-600 mt-3 leading-relaxed">{s.field_note}</p>
            </div>
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
                <div className="flex gap-3 mt-1">
                  <span className="text-[11px] font-mono" style={{ color: ACCENT }}>+{Math.round(it.yieldBoost * 100)}% t/ha</span>
                  <span className="text-[11px] font-mono" style={{ color: ACCENT2 }}>-{Math.round(it.waterCut * 100)}% H₂O</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          <div className="bg-[#000d24] border border-white/10 rounded-2xl p-4">
            <div className="text-[11px] text-gray-500 mb-1">{s.proj_yield}</div>
            <div className="text-2xl font-black font-mono" style={{ color: ACCENT }}>{kpiYield} <span className="text-sm text-gray-500">t/ha</span></div>
          </div>
          <div className="bg-[#000d24] border border-white/10 rounded-2xl p-4">
            <div className="text-[11px] text-gray-500 mb-1">{s.proj_water}</div>
            <div className="text-2xl font-black font-mono" style={{ color: ACCENT2 }}>{waterIndex}</div>
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
          <TrendChart points={yieldSeries} color={ACCENT} title={s.chart_yield_title} unit="" reduce={reduce} />
          <TrendChart points={waterSeries} color={ACCENT2} title={s.chart_water_title} unit="" reduce={reduce} />
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
                  <div className="text-sm font-black font-mono" style={{ color: sc.color }}>{sc.yield_}</div>
                  <div className="text-[9px] text-gray-500 mt-0.5">{s.scen_metric_yield}</div>
                </div>
                <div className="bg-white/5 rounded-lg py-2">
                  <div className="text-sm font-black font-mono" style={{ color: sc.color }}>{sc.water}</div>
                  <div className="text-[9px] text-gray-500 mt-0.5">{s.scen_metric_water}</div>
                </div>
                <div className="bg-white/5 rounded-lg py-2">
                  <div className="text-sm font-black font-mono" style={{ color: sc.color }}>{sc.area}</div>
                  <div className="text-[9px] text-gray-500 mt-0.5">{s.scen_metric_area}</div>
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
            className="rounded-2xl border border-[#84cc16]/20 p-8 text-center bg-gradient-to-b from-[#84cc16]/5 to-transparent"
          >
            <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-5 bg-[#84cc16]/10 text-[#84cc16]">
              <Sprout size={26} />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white mb-3">{s.cta_title}</h2>
            <p className="text-gray-400 text-sm md:text-base mb-7 max-w-xl mx-auto leading-relaxed">{s.cta_sub}</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => navigate('/roadmap')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#84cc16]/10 border border-[#84cc16]/30 text-[#84cc16] hover:bg-[#84cc16]/20 transition-colors text-sm font-medium"
              >
                <Compass size={14} /> {s.cta_roadmap}
              </button>
              <button
                onClick={() => navigate('/whitepaper-full')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#22d3ee]/10 border border-[#22d3ee]/30 text-[#22d3ee] hover:bg-[#22d3ee]/20 transition-colors text-sm font-medium"
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
