import { useState, useMemo, useRef } from 'react';
import { useLocation } from 'wouter';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, Zap, Sun, Wind, Droplets, Atom, Battery,
  TrendingDown, TrendingUp, FileText, Compass, Gauge, Leaf, Factory,
} from 'lucide-react';

// ══════════════════════════════════════════════════════════════════════════════
//  ArkheOSium — Energy module (G-EN): renewable backbone for water infrastructure
//  Route: /energy
// ══════════════════════════════════════════════════════════════════════════════

const ACCENT = '#00e6c8';
const ACCENT2 = '#00d4ff';
const ENERGY = '#fbbf24'; // module amber accent (energy)

// ─── i18n (self-contained, bilingual) ───────────────────────────────────────────

const STRINGS = {
  ru: {
    back: 'Назад к дорожной карте',
    doc_label: 'Энергетический модуль G-EN',
    eyebrow: 'Возобновляемый каркас',
    hero_title: 'Энергетика',
    hero_accent: 'Возобновляемый каркас водной инфраструктуры',
    hero_lead:
      'Гидро, солнце, ветер и зелёный водород питают насосы, каналы и опреснение мегапроекта. Балансируйте энергомикс — генерация, выбросы и стоимость пересчитываются вживую.',
    kpi_capacity: 'Установленная мощность',
    kpi_renew: 'Доля ВИЭ',
    kpi_co2: 'CO₂ предотвращено, Мт/год',
    kpi_pump: 'Покрытие насосной энергии',
    mix_eyebrow: 'Интерактивный баланс',
    mix_title: 'Балансировщик энергомикса',
    mix_sub:
      'Двигайте доли источников. Донат-диаграмма, суммарная генерация, предотвращённый CO₂ и стоимость пересчитываются мгновенно. Переключатель хранилища сглаживает суточный профиль.',
    src_hydro: 'Гидро',
    src_solar: 'Солнце',
    src_wind: 'Ветер',
    src_hydrogen: 'Зел. водород',
    total_gen: 'Суммарная генерация',
    co2_avoided: 'CO₂ предотвращено',
    lcoe: 'Средняя стоимость',
    storage_label: 'Батарейное хранилище',
    storage_on: 'Активно',
    storage_off: 'Выключено',
    normalize: 'Сумма долей',
    profile_eyebrow: 'Суточный профиль',
    profile_title: 'Генерация против спроса (24 ч)',
    profile_sub:
      'Как энергомикс покрывает суточный спрос водной инфраструктуры. Хранилище переносит дневной избыток солнца на вечерний пик спроса.',
    legend_gen: 'Генерация',
    legend_demand: 'Спрос',
    legend_solar: 'Солнце',
    peak_cover: 'Покрытие пика',
    self_suff: 'Самообеспечение',
    charts_eyebrow: 'Динамика до 2040',
    charts_title: 'Тренды энергоперехода',
    charts_sub:
      'Доля ВИЭ растёт, стоимость генерации падает. Кривые перестраиваются вслед за энергомиксом и хранилищем.',
    chart_renew_title: 'Доля ВИЭ',
    chart_cost_title: 'Стоимость генерации',
    scen_eyebrow: 'Сценарии до 2040',
    scen_title: 'Три пути энергетики',
    scen_sub: 'Проекции при разной интенсивности перехода на ВИЭ.',
    scen_base_t: 'Базовый',
    scen_base_d: 'Опора на гидро и импорт. Медленный рост ВИЭ, зависимость от сети.',
    scen_bal_t: 'Сбалансированный',
    scen_bal_d: 'Диверсифицированный микс: солнце + ветер + гидро, старт хранилищ.',
    scen_green_t: 'Агрессивный зелёный',
    scen_green_d: 'Полный ВИЭ-каркас: водород, крупные батареи, экспорт излишков.',
    scen_metric_cap: 'Мощность',
    scen_metric_renew: 'ВИЭ к 2040',
    scen_metric_co2: 'CO₂ Мт/год',
    cta_title: 'Энергетика — фундамент всего мегапроекта',
    cta_sub: 'Как возобновляемый каркас G-EN встраивается в дорожную карту и архитектуру платформы ArkheOSium.',
    cta_roadmap: 'Дорожная карта',
    cta_wp: 'Полный whitepaper',
    copyright: '© ArkheOSium — Planetary Infrastructure OS. Данные демонстрационные.',
    years_note: 'Годы: 2026 → 2040',
    hours_note: 'Часы: 00:00 → 24:00',
  },
  en: {
    back: 'Back to roadmap',
    doc_label: 'Energy module G-EN',
    eyebrow: 'Renewable backbone',
    hero_title: 'Energy',
    hero_accent: 'Renewable backbone of the water infrastructure',
    hero_lead:
      'Hydro, solar, wind and green hydrogen power the pumps, channels and desalination of the megaproject. Balance the energy mix — generation, emissions and cost recompute live.',
    kpi_capacity: 'Installed capacity',
    kpi_renew: 'Renewable share',
    kpi_co2: 'CO₂ avoided, Mt/yr',
    kpi_pump: 'Pumping energy covered',
    mix_eyebrow: 'Interactive balancer',
    mix_title: 'Energy-mix balancer',
    mix_sub:
      'Drag each source share. The donut, total generation, CO₂ avoided and cost recompute instantly. The storage switch smooths the daily profile.',
    src_hydro: 'Hydro',
    src_solar: 'Solar',
    src_wind: 'Wind',
    src_hydrogen: 'Green H₂',
    total_gen: 'Total generation',
    co2_avoided: 'CO₂ avoided',
    lcoe: 'Blended cost',
    storage_label: 'Battery storage',
    storage_on: 'Active',
    storage_off: 'Off',
    normalize: 'Share sum',
    profile_eyebrow: 'Daily profile',
    profile_title: 'Generation vs demand (24 h)',
    profile_sub:
      'How the energy mix covers the daily demand of the water infrastructure. Storage shifts midday solar surplus onto the evening demand peak.',
    legend_gen: 'Generation',
    legend_demand: 'Demand',
    legend_solar: 'Solar',
    peak_cover: 'Peak coverage',
    self_suff: 'Self-sufficiency',
    charts_eyebrow: 'Dynamics to 2040',
    charts_title: 'Energy-transition trends',
    charts_sub:
      'Renewable share rises while generation cost falls. Curves redraw with the energy mix and storage.',
    chart_renew_title: 'Renewable share',
    chart_cost_title: 'Generation cost',
    scen_eyebrow: 'Scenarios to 2040',
    scen_title: 'Three energy paths',
    scen_sub: 'Projected outcomes under different renewable-transition intensities.',
    scen_base_t: 'Baseline',
    scen_base_d: 'Reliance on hydro and imports. Slow renewable growth, grid dependence.',
    scen_bal_t: 'Balanced',
    scen_bal_d: 'Diversified mix: solar + wind + hydro, first battery storage.',
    scen_green_t: 'Aggressive green',
    scen_green_d: 'Full renewable backbone: hydrogen, large batteries, surplus export.',
    scen_metric_cap: 'Capacity',
    scen_metric_renew: 'Renewable by 2040',
    scen_metric_co2: 'CO₂ Mt/yr',
    cta_title: 'Energy is the foundation of the whole megaproject',
    cta_sub: 'How the G-EN renewable backbone fits into the roadmap and the ArkheOSium platform architecture.',
    cta_roadmap: 'Roadmap',
    cta_wp: 'Full whitepaper',
    copyright: '© ArkheOSium — Planetary Infrastructure OS. Data is illustrative.',
    years_note: 'Years: 2026 → 2040',
    hours_note: 'Hours: 00:00 → 24:00',
  },
} as const;

// ─── Types ───────────────────────────────────────────────────────────────────────

interface SourceDef {
  id: 'hydro' | 'solar' | 'wind' | 'hydrogen';
  Icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  color: string;
  co2Factor: number; // Mt CO2 avoided per GW·share unit
  cost: number; // $/MWh blended contribution
}

interface Scenario {
  key: string;
  color: string;
  capacity: string;
  renew: number;
  co2: number;
  spark: number[];
}

// ─── Source catalogue ───────────────────────────────────────────────────────────

const SOURCES: SourceDef[] = [
  { id: 'hydro', Icon: Droplets, color: '#00d4ff', co2Factor: 0.42, cost: 38 },
  { id: 'solar', Icon: Sun, color: '#fbbf24', co2Factor: 0.5, cost: 31 },
  { id: 'wind', Icon: Wind, color: '#00e6c8', co2Factor: 0.48, cost: 34 },
  { id: 'hydrogen', Icon: Atom, color: '#a78bfa', co2Factor: 0.55, cost: 62 },
];

const TOTAL_CAPACITY_GW = 24; // demonstration total installed capacity

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

// ─── Donut chart (SVG, reflects live mix) ───────────────────────────────────────

interface DonutSlice { color: string; value: number; label: string; }

function DonutChart({ slices, centerVal, centerLabel, reduce }: {
  slices: DonutSlice[]; centerVal: string; centerLabel: string; reduce: boolean;
}) {
  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const r = 78;
  const stroke = 26;
  const circ = 2 * Math.PI * r;
  const total = slices.reduce((a, s) => a + s.value, 0) || 1;

  let offset = 0;
  const arcs = slices.map((s) => {
    const frac = s.value / total;
    const len = frac * circ;
    const arc = { color: s.color, dash: len, gap: circ - len, rot: (offset / circ) * 360 };
    offset += len;
    return arc;
  });

  return (
    <div className="relative flex items-center justify-center">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[220px] h-auto -rotate-90">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#ffffff" strokeOpacity="0.06" strokeWidth={stroke} />
        {arcs.map((a, i) => (
          <motion.circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={a.color}
            strokeWidth={stroke}
            strokeLinecap="butt"
            strokeDasharray={`${a.dash} ${a.gap}`}
            transform={`rotate(${a.rot} ${cx} ${cy})`}
            initial={false}
            animate={{ strokeDasharray: `${a.dash} ${a.gap}` }}
            transition={reduce ? { duration: 0 } : { duration: 0.5, ease: 'easeOut' }}
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div className="text-2xl md:text-3xl font-black font-mono" style={{ color: ENERGY }}>{centerVal}</div>
        <div className="text-[10px] uppercase tracking-widest text-gray-500 mt-1">{centerLabel}</div>
      </div>
    </div>
  );
}

// ─── Trend chart (SVG area) ─────────────────────────────────────────────────────

function TrendChart({
  points, color, title, unit, max, reduce,
}: {
  points: number[]; color: string; title: string; unit: string; max: number; reduce: boolean;
}) {
  const W = 480;
  const H = 160;
  const PAD = 8;
  const step = (W - PAD * 2) / (points.length - 1);
  const coords = points.map((p, i) => {
    const x = PAD + i * step;
    const y = PAD + (1 - p / max) * (H - PAD * 2);
    return [x, y] as const;
  });
  const line = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${line} L${coords[coords.length - 1][0].toFixed(1)},${H - PAD} L${coords[0][0].toFixed(1)},${H - PAD} Z`;
  const last = points[points.length - 1];
  const gid = `grad-${title.replace(/[^a-zA-Z]/g, '')}`;

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

// ─── 24h generation-vs-demand area chart (SVG) ──────────────────────────────────

function ProfileChart({
  gen, demand, solar, reduce, tGen, tDemand, tSolar,
}: {
  gen: number[]; demand: number[]; solar: number[]; reduce: boolean;
  tGen: string; tDemand: string; tSolar: string;
}) {
  const W = 640;
  const H = 240;
  const PAD = 12;
  const HOURS = gen.length;
  const max = Math.max(...gen, ...demand, 1) * 1.1;
  const sx = (i: number) => PAD + (i / (HOURS - 1)) * (W - PAD * 2);
  const sy = (v: number) => PAD + (1 - v / max) * (H - PAD * 2);

  const toLine = (arr: number[]) =>
    arr.map((v, i) => `${i === 0 ? 'M' : 'L'}${sx(i).toFixed(1)},${sy(v).toFixed(1)}`).join(' ');
  const toArea = (arr: number[]) =>
    `${toLine(arr)} L${sx(HOURS - 1).toFixed(1)},${H - PAD} L${sx(0).toFixed(1)},${H - PAD} Z`;

  return (
    <div className="bg-[#000d24] border border-white/10 rounded-2xl p-4 md:p-6">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="none">
        <defs>
          <linearGradient id="gen-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ACCENT} stopOpacity="0.3" />
            <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="solar-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ENERGY} stopOpacity="0.28" />
            <stop offset="100%" stopColor={ENERGY} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((g) => (
          <line key={g} x1={PAD} x2={W - PAD} y1={PAD + g * (H - PAD * 2)} y2={PAD + g * (H - PAD * 2)}
            stroke="#ffffff" strokeOpacity="0.05" strokeWidth="1" />
        ))}
        {/* solar sub-band */}
        <motion.path
          d={toArea(solar)} fill="url(#solar-fill)"
          initial={false} animate={{ d: toArea(solar) }}
          transition={reduce ? { duration: 0 } : { duration: 0.5, ease: 'easeOut' }}
        />
        {/* generation area */}
        <motion.path
          d={toArea(gen)} fill="url(#gen-fill)"
          initial={false} animate={{ d: toArea(gen) }}
          transition={reduce ? { duration: 0 } : { duration: 0.5, ease: 'easeOut' }}
        />
        <motion.path
          d={toLine(gen)} fill="none" stroke={ACCENT} strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"
          initial={false} animate={{ d: toLine(gen) }}
          transition={reduce ? { duration: 0 } : { duration: 0.5, ease: 'easeOut' }}
        />
        {/* demand dashed line */}
        <motion.path
          d={toLine(demand)} fill="none" stroke="#f87171" strokeWidth="2"
          strokeDasharray="5 4" strokeLinecap="round" strokeLinejoin="round"
          initial={false} animate={{ d: toLine(demand) }}
          transition={reduce ? { duration: 0 } : { duration: 0.5, ease: 'easeOut' }}
        />
      </svg>
      <div className="flex items-center gap-5 mt-4 flex-wrap text-[11px] text-gray-400">
        <span className="flex items-center gap-2">
          <span className="w-3.5 h-1 rounded-full" style={{ background: ACCENT }} /> {tGen}
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3.5 h-1 rounded-full" style={{ background: '#f87171' }} /> {tDemand}
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-[3px]" style={{ background: ENERGY + '55' }} /> {tSolar}
        </span>
      </div>
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

export default function EnergyPage() {
  const [, navigate] = useLocation();
  const { i18n } = useTranslation();
  const reduce = useReducedMotion() ?? false;
  const lang = (i18n.language || 'ru').slice(0, 2);
  const s = (STRINGS as Record<string, typeof STRINGS.ru>)[lang] ?? STRINGS.ru;

  // Interactive mix state (raw slider shares 0..100 each).
  const [mix, setMix] = useState<Record<SourceDef['id'], number>>({
    hydro: 35, solar: 30, wind: 25, hydrogen: 10,
  });
  const [storage, setStorage] = useState(true);

  const rawTotal = SOURCES.reduce((a, src) => a + mix[src.id], 0) || 1;
  // Normalized fractions (sum to 1) so the donut and derived numbers stay consistent.
  const frac = useMemo(
    () => Object.fromEntries(SOURCES.map((src) => [src.id, mix[src.id] / rawTotal])) as Record<SourceDef['id'], number>,
    [mix, rawTotal],
  );

  const srcLabel: Record<SourceDef['id'], string> = {
    hydro: s.src_hydro, solar: s.src_solar, wind: s.src_wind, hydrogen: s.src_hydrogen,
  };

  // Derived live metrics ───────────────────────────────────────────────
  const renewShare = 100; // this mix is fully renewable; storage nudges effective usable share
  const usableRenew = Math.round(88 + (storage ? 9 : 0) + frac.hydro * 3); // capped below
  const renewPct = Math.min(99, usableRenew);

  const co2Avoided = SOURCES.reduce((a, src) => a + frac[src.id] * src.co2Factor, 0) * TOTAL_CAPACITY_GW;
  const blendedCost = SOURCES.reduce((a, src) => a + frac[src.id] * src.cost, 0) * (storage ? 1.06 : 1);
  const totalGen = TOTAL_CAPACITY_GW * (0.9 + (storage ? 0.06 : 0)); // effective GW with storage uplift

  // KPI values
  const kpiCapacity = `${TOTAL_CAPACITY_GW} GW`;
  const kpiRenew = `${renewPct}%`;
  const kpiCo2 = co2Avoided.toFixed(1);
  const pumpCovered = Math.round(68 + frac.hydro * 18 + (storage ? 10 : 0));
  const kpiPump = `${Math.min(99, pumpCovered)}%`;

  // 24h profile (0..23). Demand: two peaks (morning + evening pumping).
  const HOURS = 24;
  const profile = useMemo(() => {
    const demand: number[] = [];
    const gen: number[] = [];
    const solarBand: number[] = [];
    for (let h = 0; h < HOURS; h++) {
      // Demand curve — water pumping peaks morning (7-9) and evening (18-21).
      const morning = Math.exp(-((h - 8) ** 2) / 6);
      const evening = Math.exp(-((h - 19.5) ** 2) / 8);
      const base = 0.42;
      const dem = (base + 0.5 * morning + 0.62 * evening) * TOTAL_CAPACITY_GW;

      // Solar — bell centered at noon.
      const solarRaw = Math.max(0, Math.exp(-((h - 12.5) ** 2) / 9));
      const solarGen = solarRaw * frac.solar * TOTAL_CAPACITY_GW * 1.9;

      // Wind — stronger at night, mild dip midday.
      const windRaw = 0.55 + 0.35 * Math.cos((h / 24) * 2 * Math.PI);
      const windGen = windRaw * frac.wind * TOTAL_CAPACITY_GW * 1.3;

      // Hydro — steady baseload, small evening ramp for peak.
      const hydroGen = (0.8 + 0.2 * evening) * frac.hydro * TOTAL_CAPACITY_GW * 1.2;

      // Hydrogen — dispatchable, ramps to cover evening peak.
      const h2Gen = (0.4 + 0.9 * evening) * frac.hydrogen * TOTAL_CAPACITY_GW * 1.5;

      let g = solarGen + windGen + hydroGen + h2Gen;
      let solarShown = solarGen;

      if (storage) {
        // Storage shaves midday surplus and refills evening peak — flatter, better-matched curve.
        const surplus = Math.max(0, g - dem);
        const eveningWeight = evening * 1.2;
        g = g - surplus * 0.55 + surplus * 0.5 * 0 + (evening > 0.15 ? 0.9 * frac.solar * TOTAL_CAPACITY_GW * eveningWeight : 0);
        solarShown = solarGen * 0.6 + (evening > 0.15 ? 0.9 * frac.solar * TOTAL_CAPACITY_GW * eveningWeight : 0);
      }

      demand.push(dem);
      gen.push(g);
      solarBand.push(Math.min(solarShown, g));
    }
    return { demand, gen, solarBand };
  }, [frac, storage]);

  // Peak coverage + self-sufficiency from the profile.
  const { peakCover, selfSuff } = useMemo(() => {
    let coveredHours = 0;
    let sumGen = 0;
    let sumDem = 0;
    let peakDem = 0;
    let genAtPeak = 0;
    profile.demand.forEach((d, h) => {
      sumDem += d;
      sumGen += profile.gen[h];
      if (profile.gen[h] >= d) coveredHours++;
      if (d > peakDem) { peakDem = d; genAtPeak = profile.gen[h]; }
    });
    return {
      peakCover: Math.min(120, Math.round((genAtPeak / (peakDem || 1)) * 100)),
      selfSuff: Math.min(100, Math.round((Math.min(sumGen, sumDem) / (sumDem || 1)) * 100 * 0.94 + coveredHours * 0.25)),
    };
  }, [profile]);

  // Trend series to 2040 (redraw with mix + storage).
  const YEARS = 8;
  const renewSeries = useMemo(
    () => Array.from({ length: YEARS }, (_, i) => {
      const t = i / (YEARS - 1);
      return 34 + (renewPct - 34) * t;
    }),
    [renewPct],
  );
  const costSeries = useMemo(
    () => Array.from({ length: YEARS }, (_, i) => {
      const t = i / (YEARS - 1);
      return 74 - (74 - blendedCost) * t;
    }),
    [blendedCost],
  );

  const donutSlices: DonutSlice[] = SOURCES.map((src) => ({
    color: src.color, value: frac[src.id], label: srcLabel[src.id],
  }));

  const scenarios: Scenario[] = [
    { key: 'base', color: '#f87171', capacity: '14 GW', renew: 46, co2: 6.1, spark: [34, 36, 37, 39, 41, 43, 45, 46] },
    { key: 'balanced', color: ENERGY, capacity: '22 GW', renew: 78, co2: 9.4, spark: [34, 42, 50, 57, 64, 70, 75, 78] },
    { key: 'green', color: '#22c55e', capacity: '31 GW', renew: 96, co2: 13.2, spark: [34, 48, 61, 72, 81, 88, 93, 96] },
  ];

  const scenText: Record<string, { t: string; d: string }> = {
    base: { t: s.scen_base_t, d: s.scen_base_d },
    balanced: { t: s.scen_bal_t, d: s.scen_bal_d },
    green: { t: s.scen_green_t, d: s.scen_green_d },
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
          <Zap size={14} />
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
          <div className="absolute inset-0 bg-gradient-to-b from-[#2a1a00]/40 via-[#00153a]/30 to-[#000818]" />
          {!reduce && (
            <>
              <motion.div
                className="absolute -top-20 right-0 w-[560px] h-[340px] rounded-full bg-[#fbbf24]/8 blur-3xl"
                animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
                transition={{ duration: 13, repeat: Infinity }}
              />
              <motion.div
                className="absolute bottom-0 left-1/4 w-[440px] h-[220px] rounded-full bg-[#00d4ff]/10 blur-3xl"
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
            <div className="flex items-center gap-2 text-xs text-[#fbbf24] bg-[#fbbf24]/10 border border-[#fbbf24]/20 rounded-full px-3 py-1 mb-6 w-fit">
              <Zap size={11} /> {s.eyebrow}
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white mb-5 tracking-tight leading-[0.98]">
              {s.hero_title}
              <br />
              <span className="bg-gradient-to-r from-[#fbbf24] via-[#00e6c8] to-[#00d4ff] bg-clip-text text-transparent text-2xl md:text-4xl">
                {s.hero_accent}
              </span>
            </h1>

            <p className="text-gray-400 text-base md:text-lg mb-8 max-w-2xl leading-relaxed">
              {s.hero_lead}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl">
              <KpiTile Icon={Gauge} val={kpiCapacity} label={s.kpi_capacity} color={ENERGY} trend="up" />
              <KpiTile Icon={Leaf} val={kpiRenew} label={s.kpi_renew} color="#22c55e" trend="up" />
              <KpiTile Icon={Factory} val={kpiCo2} label={s.kpi_co2} color={ACCENT} trend="up" />
              <KpiTile Icon={Droplets} val={kpiPump} label={s.kpi_pump} color={ACCENT2} trend="up" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ ENERGY-MIX BALANCER (centerpiece) ══ */}
      <Section id="balancer" eyebrow={s.mix_eyebrow} title={s.mix_title} subtitle={s.mix_sub}>
        <div className="bg-[#000d24] border border-white/10 rounded-2xl p-4 md:p-6">
          <div className="grid lg:grid-cols-[1fr_1.1fr] gap-6 md:gap-8 items-center">

            {/* Donut + center total */}
            <div className="flex flex-col items-center gap-4">
              <DonutChart
                slices={donutSlices}
                centerVal={`${totalGen.toFixed(1)}`}
                centerLabel="GW"
                reduce={reduce}
              />
              <div className="grid grid-cols-2 gap-x-5 gap-y-2 w-full max-w-[240px]">
                {SOURCES.map((src) => (
                  <div key={src.id} className="flex items-center gap-2 text-[11px]">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: src.color }} />
                    <span className="text-gray-400">{srcLabel[src.id]}</span>
                    <span className="ml-auto font-mono" style={{ color: src.color }}>
                      {Math.round(frac[src.id] * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sliders + storage + derived metrics */}
            <div>
              <div className="space-y-4">
                {SOURCES.map((src) => (
                  <div key={src.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="flex items-center gap-2 text-xs font-semibold text-gray-300">
                        <span className="w-6 h-6 rounded-lg flex items-center justify-center"
                          style={{ background: src.color + '1f', color: src.color }}>
                          <src.Icon size={13} />
                        </span>
                        {srcLabel[src.id]}
                      </span>
                      <span className="font-mono text-xs font-bold" style={{ color: src.color }}>
                        {mix[src.id]}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={mix[src.id]}
                      onChange={(e) => setMix((p) => ({ ...p, [src.id]: Number(e.target.value) }))}
                      className="w-full cursor-pointer"
                      style={{ accentColor: src.color }}
                      aria-label={srcLabel[src.id]}
                    />
                  </div>
                ))}
              </div>

              {/* Storage toggle */}
              <button
                onClick={() => setStorage((v) => !v)}
                className="mt-5 w-full flex items-center justify-between rounded-xl border p-3 transition-all"
                style={{
                  borderColor: storage ? ENERGY + '80' : 'rgba(255,255,255,0.1)',
                  background: storage ? `linear-gradient(135deg, ${ENERGY}18, transparent)` : 'rgba(255,255,255,0.02)',
                }}
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-white">
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: ENERGY + '1f', color: ENERGY }}>
                    <Battery size={16} />
                  </span>
                  {s.storage_label}
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-[11px] font-mono" style={{ color: storage ? ENERGY : '#6b7280' }}>
                    {storage ? s.storage_on : s.storage_off}
                  </span>
                  <span
                    className="w-9 h-5 rounded-full flex items-center transition-all px-0.5"
                    style={{ background: storage ? ENERGY : 'rgba(255,255,255,0.12)', justifyContent: storage ? 'flex-end' : 'flex-start' }}
                  >
                    <span className="w-4 h-4 rounded-full bg-white block" />
                  </span>
                </span>
              </button>

              {/* Derived metrics */}
              <div className="grid grid-cols-3 gap-2 mt-5">
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <div className="text-lg font-black font-mono" style={{ color: ACCENT }}>{totalGen.toFixed(1)}</div>
                  <div className="text-[9px] text-gray-500 mt-0.5 leading-tight">{s.total_gen} (GW)</div>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <div className="text-lg font-black font-mono" style={{ color: '#22c55e' }}>{co2Avoided.toFixed(1)}</div>
                  <div className="text-[9px] text-gray-500 mt-0.5 leading-tight">{s.co2_avoided} (Mt)</div>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <div className="text-lg font-black font-mono" style={{ color: ENERGY }}>${blendedCost.toFixed(0)}</div>
                  <div className="text-[9px] text-gray-500 mt-0.5 leading-tight">{s.lcoe} ($/MWh)</div>
                </div>
              </div>
              <div className="text-[10px] text-gray-600 mt-3 text-right font-mono">
                {s.normalize}: {rawTotal} → {renewShare}%
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ══ 24H PROFILE ══ */}
      <Section id="profile" eyebrow={s.profile_eyebrow} title={s.profile_title} subtitle={s.profile_sub}>
        <ProfileChart
          gen={profile.gen}
          demand={profile.demand}
          solar={profile.solarBand}
          reduce={reduce}
          tGen={s.legend_gen}
          tDemand={s.legend_demand}
          tSolar={s.legend_solar}
        />
        <div className="grid sm:grid-cols-2 gap-3 mt-4">
          <div className="bg-[#000d24] border border-white/10 rounded-2xl p-4 flex items-center justify-between">
            <span className="text-[11px] text-gray-500">{s.peak_cover}</span>
            <span className="text-2xl font-black font-mono" style={{ color: peakCover >= 100 ? '#22c55e' : ENERGY }}>
              {peakCover}%
            </span>
          </div>
          <div className="bg-[#000d24] border border-white/10 rounded-2xl p-4 flex items-center justify-between">
            <span className="text-[11px] text-gray-500">{s.self_suff}</span>
            <span className="text-2xl font-black font-mono" style={{ color: ACCENT }}>{selfSuff}%</span>
          </div>
        </div>
        <div className="text-[11px] text-gray-600 mt-3 text-center">{s.hours_note}</div>
      </Section>

      {/* ══ TREND CHARTS ══ */}
      <Section id="trends" eyebrow={s.charts_eyebrow} title={s.charts_title} subtitle={s.charts_sub}>
        <div className="grid md:grid-cols-2 gap-4">
          <TrendChart points={renewSeries} color="#22c55e" title={s.chart_renew_title} unit="%" max={100} reduce={reduce} />
          <TrendChart points={costSeries} color={ENERGY} title={s.chart_cost_title} unit=" $/MWh" max={90} reduce={reduce} />
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
                  <div className="text-sm font-black font-mono" style={{ color: sc.color }}>{sc.capacity}</div>
                  <div className="text-[9px] text-gray-500 mt-0.5">{s.scen_metric_cap}</div>
                </div>
                <div className="bg-white/5 rounded-lg py-2">
                  <div className="text-sm font-black font-mono" style={{ color: sc.color }}>{sc.renew}%</div>
                  <div className="text-[9px] text-gray-500 mt-0.5">{s.scen_metric_renew}</div>
                </div>
                <div className="bg-white/5 rounded-lg py-2">
                  <div className="text-sm font-black font-mono" style={{ color: sc.color }}>{sc.co2}</div>
                  <div className="text-[9px] text-gray-500 mt-0.5">{s.scen_metric_co2}</div>
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
            className="rounded-2xl border border-[#fbbf24]/20 p-8 text-center bg-gradient-to-b from-[#fbbf24]/5 to-transparent"
          >
            <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-5 bg-[#fbbf24]/10 text-[#fbbf24]">
              <Zap size={26} />
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
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00d4ff]/10 border text-[#00d4ff] hover:bg-[#00d4ff]/20 transition-colors text-sm font-medium"
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
