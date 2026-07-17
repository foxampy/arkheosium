import { useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, Waves, Droplets, Sun, GitBranch, Building2,
  TrendingUp, TrendingDown, Target, Gauge, Calendar,
  ArrowRight, ArrowDownToLine, ArrowUpFromLine, RotateCcw, FileText, Map,
} from 'lucide-react';

// ══════════════════════════════════════════════════════════════════════════════
//  ArkheOSium — Water Recovery System (Aral Sea restoration simulator)
//  Route: /water-recovery
// ══════════════════════════════════════════════════════════════════════════════

const ACCENT = '#00e6c8';
const ACCENT2 = '#00d4ff';

// ─── Bilingual strings (self-contained) ─────────────────────────────────────────

const STRINGS = {
  ru: {
    back: 'Назад к дорожной карте',
    doc_label: 'Модель восстановления · Аральское море',
    badge: 'Интерактивная симуляция',
    badge_os: 'Water OS',
    hero_title: 'Система восстановления воды',
    hero_accent: 'модель восстановления Аральского моря',
    hero_lead:
      'Живая сценарная модель: меняйте приток рек, испарение и инженерные меры — и наблюдайте, как уровень моря восстанавливается год за годом. Все расчёты детерминированы и реагируют мгновенно.',
    kpi_current: 'Текущий уровень',
    kpi_target: 'Целевой уровень',
    kpi_deficit: 'Дефицит воды',
    kpi_year: 'Год восстановления',
    kpi_never: 'не достигается',
    unit_m: 'м',
    unit_km3: 'км³',

    ctrl_eyebrow: 'Центр управления сценарием',
    ctrl_title: 'Параметры восстановления',
    ctrl_sub: 'Настройте входные данные — проекция, диаграмма баланса и график перестроятся мгновенно.',
    ctrl_inflow: 'Годовой приток рек (Сырдарья + Амударья)',
    ctrl_evap: 'Интенсивность испарения',
    ctrl_diversion: 'Сокращение водозабора на орошение',
    ctrl_canal: 'Каналы и дамбы',
    ctrl_canal_desc: 'Северная дамба и перераспределяющие каналы: снижают потери и концентрируют приток.',
    ctrl_dam_on: 'Задействовано',
    ctrl_dam_off: 'Отключено',
    ctrl_reset: 'Сбросить сценарий',

    diag_eyebrow: 'Водный баланс',
    diag_title: 'Разрез бассейна',
    diag_sub: 'Поперечный разрез моря: высота воды отражает проектируемый уровень. Стрелки — приток и испарение.',
    diag_in: 'Приток',
    diag_out: 'Испарение',
    diag_level: 'Проектируемый уровень',
    diag_target: 'Цель',

    chart_eyebrow: 'Проекция',
    chart_title: 'Уровень моря 2026 → 2075',
    chart_sub: 'Пунктир — сценарий «бездействие» (спад). Сплошная линия — активный сценарий, пересчитанный из ваших параметров.',
    chart_scenario: 'Активный сценарий',
    chart_baseline: 'Бездействие',
    chart_targetline: 'Целевой уровень',

    ledger_eyebrow: 'Гроссбух баланса',
    ledger_title: 'Живой водный баланс',
    ledger_inflow: 'Приток',
    ledger_evap: 'Испарение',
    ledger_net: 'Чистое изменение',
    ledger_time: 'Время до цели',
    ledger_per_year: '/ год',
    ledger_years: 'лет',
    ledger_rising: 'уровень растёт',
    ledger_falling: 'уровень падает',
    ledger_stable: 'равновесие',
    ledger_reached: 'цель достигнута',

    cta_title: 'От модели — к реализации',
    cta_sub: 'Эта симуляция — часть мастер-плана ARAL NEXUS. Изучите дорожную карту фаз и полную концепцию.',
    cta_roadmap: 'Дорожная карта',
    cta_whitepaper: 'Полный whitepaper',
    copyright: '© ArkheOSium · Water Recovery System · концептуальная модель',
  },
  en: {
    back: 'Back to roadmap',
    doc_label: 'Recovery model · Aral Sea',
    badge: 'Interactive simulation',
    badge_os: 'Water OS',
    hero_title: 'Water Recovery System',
    hero_accent: 'Aral Sea restoration model',
    hero_lead:
      'A live scenario model: adjust river inflow, evaporation and engineering interventions and watch the sea level recover year by year. Every calculation is deterministic and responds instantly.',
    kpi_current: 'Current level',
    kpi_target: 'Target level',
    kpi_deficit: 'Water deficit',
    kpi_year: 'Recovery year',
    kpi_never: 'not reached',
    unit_m: 'm',
    unit_km3: 'km³',

    ctrl_eyebrow: 'Scenario control center',
    ctrl_title: 'Recovery parameters',
    ctrl_sub: 'Tune the inputs — the projection, balance diagram and chart rebuild instantly.',
    ctrl_inflow: 'Annual river inflow (Syr Darya + Amu Darya)',
    ctrl_evap: 'Evaporation intensity',
    ctrl_diversion: 'Irrigation diversion reduction',
    ctrl_canal: 'Canals & dams',
    ctrl_canal_desc: 'Northern dike and redistributing canals: cut losses and concentrate inflow.',
    ctrl_dam_on: 'Engaged',
    ctrl_dam_off: 'Disabled',
    ctrl_reset: 'Reset scenario',

    diag_eyebrow: 'Water balance',
    diag_title: 'Basin cross-section',
    diag_sub: 'Cross-section of the sea: water height reflects the projected level. Arrows show inflow vs evaporation.',
    diag_in: 'Inflow',
    diag_out: 'Evaporation',
    diag_level: 'Projected level',
    diag_target: 'Target',

    chart_eyebrow: 'Projection',
    chart_title: 'Sea level 2026 → 2075',
    chart_sub: 'Dashed line is the “do nothing” scenario (decline). Solid line is the active scenario recomputed from your parameters.',
    chart_scenario: 'Active scenario',
    chart_baseline: 'Do nothing',
    chart_targetline: 'Target level',

    ledger_eyebrow: 'Balance ledger',
    ledger_title: 'Live water balance',
    ledger_inflow: 'Inflow',
    ledger_evap: 'Evaporation',
    ledger_net: 'Net change',
    ledger_time: 'Time to target',
    ledger_per_year: '/ yr',
    ledger_years: 'yrs',
    ledger_rising: 'level rising',
    ledger_falling: 'level falling',
    ledger_stable: 'equilibrium',
    ledger_reached: 'target reached',

    cta_title: 'From model to delivery',
    cta_sub: 'This simulation is part of the ARAL NEXUS master plan. Explore the phased roadmap and the full concept.',
    cta_roadmap: 'Roadmap',
    cta_whitepaper: 'Full whitepaper',
    copyright: '© ArkheOSium · Water Recovery System · conceptual model',
  },
} as const;

// ─── Model constants ─────────────────────────────────────────────────────────────

const START_YEAR = 2026;
const END_YEAR = 2075;
const CURRENT_LEVEL = 30; // m (mock present-day sea level)
const TARGET_LEVEL = 53; // m (historic pre-collapse level)
const MIN_LEVEL = 18; // m (floor for do-nothing collapse)
const LEVEL_TO_KM3 = 8; // km³ of water per metre of level (mock basin geometry)

// ─── Model ───────────────────────────────────────────────────────────────────────

interface ScenarioInputs {
  inflow: number; // km³/yr
  evapRate: number; // 0..100 intensity
  diversionCut: number; // % reduction of irrigation diversion
  canals: boolean;
}

interface ModelResult {
  netChange: number; // metres/yr
  inflowM: number; // effective inflow in metres/yr
  evapM: number; // evaporation in metres/yr
  scenario: number[]; // level per year (active)
  baseline: number[]; // level per year (do nothing)
  recoveryYear: number | null;
  yearsToTarget: number | null;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function computeModel(inp: ScenarioInputs): ModelResult {
  // Effective inflow: base inflow, boosted by diversion recovered from irrigation,
  // amplified by canal/dam interventions that reduce transport losses.
  const canalFactor = inp.canals ? 1.18 : 1;
  const recoveredDiversion = (inp.diversionCut / 100) * 22; // up to 22 km³/yr reclaimed
  const effectiveInflowKm3 = (inp.inflow + recoveredDiversion) * canalFactor;
  const inflowM = effectiveInflowKm3 / LEVEL_TO_KM3;

  // Evaporation loss in metres/yr, dampened slightly when canals concentrate the pool.
  const evapM = (inp.evapRate / 100) * 2.6 * (inp.canals ? 0.9 : 1);

  const netChange = inflowM - evapM; // metres/yr

  const years = END_YEAR - START_YEAR;
  const scenario: number[] = [];
  const baseline: number[] = [];
  let lvl = CURRENT_LEVEL;
  let baseLvl = CURRENT_LEVEL;
  let recoveryYear: number | null = null;

  for (let y = 0; y <= years; y++) {
    // Active scenario: integrate net change, ease off as we approach the target.
    const gap = TARGET_LEVEL - lvl;
    const approach = netChange > 0 ? clamp(gap / (TARGET_LEVEL - CURRENT_LEVEL), 0.15, 1) : 1;
    lvl = clamp(lvl + netChange * approach, MIN_LEVEL, TARGET_LEVEL);
    scenario.push(lvl);
    if (recoveryYear === null && lvl >= TARGET_LEVEL - 0.05) recoveryYear = START_YEAR + y;

    // Baseline "do nothing": steady decline toward the collapse floor.
    baseLvl = clamp(baseLvl - 0.35, MIN_LEVEL, TARGET_LEVEL);
    baseline.push(baseLvl);
  }

  const yearsToTarget = recoveryYear !== null ? recoveryYear - START_YEAR : null;

  return { netChange, inflowM, evapM, scenario, baseline, recoveryYear, yearsToTarget };
}

// ─── Small UI atoms ─────────────────────────────────────────────────────────────

function KpiTile({
  Icon, label, value, unit, color,
}: {
  Icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  label: string; value: string; unit?: string; color: string;
}) {
  return (
    <div className="bg-[#000d24] border border-white/10 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3 text-gray-500">
        <Icon size={15} style={{ color }} />
        <span className="text-[11px] uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl md:text-3xl font-black font-mono" style={{ color }}>{value}</span>
        {unit && <span className="text-xs text-gray-500 font-mono">{unit}</span>}
      </div>
    </div>
  );
}

function Slider({
  label, value, min, max, step, unit, color, onChange,
}: {
  label: string; value: number; min: number; max: number; step: number;
  unit: string; color: string; onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-300">{label}</span>
        <span className="text-sm font-mono font-bold" style={{ color }}>
          {value}
          <span className="text-gray-500 text-xs ml-1">{unit}</span>
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer outline-none
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4
          [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md
          [&::-webkit-slider-thumb]:border-2
          [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0"
        style={{
          background: `linear-gradient(90deg, ${color} ${pct}%, rgba(255,255,255,0.1) ${pct}%)`,
        }}
      />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════

export default function WaterRecoveryPage() {
  const [, navigate] = useLocation();
  const { i18n } = useTranslation();
  const reduce = useReducedMotion();
  const lang = (i18n.language || 'ru').slice(0, 2);
  const s = (STRINGS as Record<string, typeof STRINGS.ru>)[lang] ?? STRINGS.ru;

  const [inputs, setInputs] = useState<ScenarioInputs>({
    inflow: 24,
    evapRate: 55,
    diversionCut: 40,
    canals: true,
  });

  const set = <K extends keyof ScenarioInputs>(k: K, v: ScenarioInputs[K]) =>
    setInputs((prev) => ({ ...prev, [k]: v }));

  const reset = () => setInputs({ inflow: 24, evapRate: 55, diversionCut: 40, canals: true });

  const model = useMemo(() => computeModel(inputs), [inputs]);

  const projectedLevel = model.scenario[model.scenario.length - 1];
  const deficitKm3 = Math.max(0, (TARGET_LEVEL - projectedLevel) * LEVEL_TO_KM3);

  // ─── Chart geometry ─────────────────────────────────────────────────────────
  const CW = 720;
  const CH = 300;
  const PAD = { l: 44, r: 16, t: 20, b: 34 };
  const plotW = CW - PAD.l - PAD.r;
  const plotH = CH - PAD.t - PAD.b;
  const yMin = MIN_LEVEL - 2;
  const yMax = TARGET_LEVEL + 3;

  const xOf = (i: number, n: number) => PAD.l + (i / (n - 1)) * plotW;
  const yOf = (lvl: number) => PAD.t + (1 - (lvl - yMin) / (yMax - yMin)) * plotH;

  const toPath = (arr: number[]) =>
    arr.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xOf(i, arr.length).toFixed(1)} ${yOf(v).toFixed(1)}`).join(' ');

  const scenarioPath = toPath(model.scenario);
  const baselinePath = toPath(model.baseline);
  const areaPath =
    `${scenarioPath} L ${xOf(model.scenario.length - 1, model.scenario.length).toFixed(1)} ${(CH - PAD.b).toFixed(1)}` +
    ` L ${PAD.l} ${(CH - PAD.b).toFixed(1)} Z`;
  const targetY = yOf(TARGET_LEVEL);

  const yTicks = [20, 30, 40, 50];
  const xTicks = [START_YEAR, 2038, 2050, 2062, END_YEAR];

  // ─── Basin fill geometry ────────────────────────────────────────────────────
  const fillPct = clamp((projectedLevel - MIN_LEVEL) / (TARGET_LEVEL - MIN_LEVEL), 0, 1);
  const targetPct = clamp((TARGET_LEVEL - MIN_LEVEL) / (TARGET_LEVEL - MIN_LEVEL), 0, 1);
  const BASIN_H = 220;
  const BASIN_W = 340;
  const waterTopY = 24 + (1 - fillPct) * (BASIN_H - 24);
  const targetTopY = 24 + (1 - targetPct) * (BASIN_H - 24);

  const inflowArrow = clamp(model.inflowM * 2.4, 0.5, 6); // stroke width proxy
  const evapArrow = clamp(model.evapM * 3.0, 0.5, 6);

  const netRising = model.netChange > 0.01;
  const netFalling = model.netChange < -0.01;
  const netLabel = model.recoveryYear !== null && projectedLevel >= TARGET_LEVEL - 0.05
    ? s.ledger_reached
    : netRising ? s.ledger_rising : netFalling ? s.ledger_falling : s.ledger_stable;

  const ANIM = reduce ? { duration: 0 } : { duration: 0.7, ease: 'easeInOut' as const };

  return (
    <div className="min-h-screen bg-[#000818] text-gray-200">

      {/* ── Top bar ── */}
      <div className="sticky top-0 z-40 bg-[#000818]/95 backdrop-blur border-b border-white/5 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate('/roadmap')}
          className="flex items-center gap-2 text-sm text-[#00e6c8]/70 hover:text-[#00e6c8] transition-colors flex-shrink-0"
        >
          <ArrowLeft size={16} /> {s.back}
        </button>
        <div className="flex items-center gap-2 text-sm text-gray-400 flex-shrink-0">
          <Waves size={14} />
          <span className="hidden sm:inline">{s.doc_label}</span>
          <span className="sm:hidden">Water Recovery</span>
        </div>
        <button
          onClick={reset}
          className="ml-auto flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border border-white/10 text-gray-300 hover:text-white hover:border-white/20 transition-colors"
        >
          <RotateCcw size={12} /> <span className="hidden sm:inline">{s.ctrl_reset}</span>
        </button>
      </div>

      {/* ══ HERO ══ */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#00153a]/50 to-[#000818]" />
          {!reduce && (
            <motion.div
              className="absolute -top-20 right-0 w-[600px] h-[360px] rounded-full bg-[#00e6c8]/8 blur-3xl"
              animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
              transition={{ duration: 12, repeat: Infinity }}
            />
          )}
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-14 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduce ? 0 : 0.6 }}
          >
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <div className="flex items-center gap-2 text-xs text-[#00e6c8] bg-[#00e6c8]/10 border border-[#00e6c8]/20 rounded-full px-3 py-1">
                <Gauge size={11} /> {s.badge}
              </div>
              <div className="flex items-center gap-2 text-xs text-[#00d4ff] bg-[#00d4ff]/10 border border-[#00d4ff]/20 rounded-full px-3 py-1">
                <Droplets size={11} /> {s.badge_os}
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight leading-[0.98]">
              {s.hero_title}
              <br />
              <span className="bg-gradient-to-r from-[#00e6c8] via-[#00d4ff] to-[#7c3aed] bg-clip-text text-transparent text-2xl md:text-4xl">
                {s.hero_accent}
              </span>
            </h1>

            <p className="text-gray-400 text-base md:text-lg mb-8 max-w-2xl leading-relaxed">
              {s.hero_lead}
            </p>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-4xl">
              <KpiTile Icon={Gauge} label={s.kpi_current} value={CURRENT_LEVEL.toFixed(0)} unit={s.unit_m} color={ACCENT} />
              <KpiTile Icon={Target} label={s.kpi_target} value={TARGET_LEVEL.toFixed(0)} unit={s.unit_m} color={ACCENT2} />
              <KpiTile Icon={Droplets} label={s.kpi_deficit} value={deficitKm3.toFixed(0)} unit={s.unit_km3} color="#7c3aed" />
              <KpiTile
                Icon={Calendar}
                label={s.kpi_year}
                value={model.recoveryYear !== null ? String(model.recoveryYear) : '—'}
                unit={model.recoveryYear === null ? s.kpi_never : ''}
                color={model.recoveryYear !== null ? '#22c55e' : '#f87171'}
              />
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-12 space-y-14">

        {/* ══ SCENARIO CONTROLS + BASIN DIAGRAM ══ */}
        <section className="grid lg:grid-cols-2 gap-6 items-stretch">
          {/* Controls */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.25em] mb-3" style={{ color: ACCENT }}>
              {s.ctrl_eyebrow}
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-2">{s.ctrl_title}</h2>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">{s.ctrl_sub}</p>

            <div className="bg-white/5 border border-white/10 backdrop-blur rounded-2xl p-6 space-y-6">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: ACCENT + '18', color: ACCENT }}>
                  <ArrowDownToLine size={16} />
                </div>
                <div className="flex-1">
                  <Slider
                    label={s.ctrl_inflow} value={inputs.inflow} min={5} max={60} step={1}
                    unit={s.unit_km3 + '/' + s.ledger_per_year.slice(-2)} color={ACCENT}
                    onChange={(v) => set('inflow', v)}
                  />
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: '#f59e0b18', color: '#f59e0b' }}>
                  <Sun size={16} />
                </div>
                <div className="flex-1">
                  <Slider
                    label={s.ctrl_evap} value={inputs.evapRate} min={0} max={100} step={1}
                    unit="%" color="#f59e0b"
                    onChange={(v) => set('evapRate', v)}
                  />
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: ACCENT2 + '18', color: ACCENT2 }}>
                  <GitBranch size={16} />
                </div>
                <div className="flex-1">
                  <Slider
                    label={s.ctrl_diversion} value={inputs.diversionCut} min={0} max={100} step={1}
                    unit="%" color={ACCENT2}
                    onChange={(v) => set('diversionCut', v)}
                  />
                </div>
              </div>

              {/* Canal / dam toggle */}
              <button
                onClick={() => set('canals', !inputs.canals)}
                className={`w-full flex items-center gap-3 rounded-xl border p-4 text-left transition-colors ${
                  inputs.canals
                    ? 'border-[#00e6c8]/40 bg-[#00e6c8]/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: inputs.canals ? ACCENT + '22' : 'rgba(255,255,255,0.06)',
                    color: inputs.canals ? ACCENT : '#9ca3af',
                  }}>
                  <Building2 size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{s.ctrl_canal}</span>
                    <span className="text-[10px] font-mono uppercase tracking-wider"
                      style={{ color: inputs.canals ? ACCENT : '#6b7280' }}>
                      {inputs.canals ? s.ctrl_dam_on : s.ctrl_dam_off}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">{s.ctrl_canal_desc}</p>
                </div>
                <div className={`w-11 h-6 rounded-full flex-shrink-0 relative transition-colors ${
                  inputs.canals ? 'bg-[#00e6c8]/40' : 'bg-white/10'
                }`}>
                  <motion.div
                    className="absolute top-0.5 w-5 h-5 rounded-full bg-white"
                    animate={{ left: inputs.canals ? 22 : 2 }}
                    transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </div>
              </button>
            </div>
          </div>

          {/* Basin cross-section diagram */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.25em] mb-3" style={{ color: ACCENT2 }}>
              {s.diag_eyebrow}
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-2">{s.diag_title}</h2>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">{s.diag_sub}</p>

            <div className="bg-white/5 border border-white/10 backdrop-blur rounded-2xl p-5">
              <div className="flex items-center justify-center">
                <svg viewBox={`0 0 ${BASIN_W} ${BASIN_H + 40}`} className="w-full max-w-md" role="img" aria-label={s.diag_title}>
                  <defs>
                    <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={ACCENT2} stopOpacity="0.85" />
                      <stop offset="100%" stopColor={ACCENT} stopOpacity="0.35" />
                    </linearGradient>
                    <clipPath id="basinClip">
                      {/* trapezoidal basin cross-section */}
                      <path d={`M 30 24 L ${BASIN_W - 30} 24 L ${BASIN_W - 60} ${BASIN_H} L 60 ${BASIN_H} Z`} />
                    </clipPath>
                  </defs>

                  {/* basin outline */}
                  <path
                    d={`M 30 24 L ${BASIN_W - 30} 24 L ${BASIN_W - 60} ${BASIN_H} L 60 ${BASIN_H} Z`}
                    fill="rgba(255,255,255,0.03)"
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth="1.5"
                  />

                  {/* animated water fill */}
                  <g clipPath="url(#basinClip)">
                    <motion.rect
                      x="0"
                      width={BASIN_W}
                      initial={false}
                      animate={{ y: waterTopY, height: BASIN_H - waterTopY + 4 }}
                      transition={ANIM}
                      fill="url(#waterGrad)"
                    />
                    {/* subtle surface line */}
                    <motion.rect
                      x="0"
                      width={BASIN_W}
                      height="2"
                      initial={false}
                      animate={{ y: waterTopY }}
                      transition={ANIM}
                      fill={ACCENT2}
                      opacity="0.9"
                    />
                  </g>

                  {/* target level marker */}
                  <line
                    x1="40" x2={BASIN_W - 40} y1={targetTopY} y2={targetTopY}
                    stroke="#22c55e" strokeWidth="1.5" strokeDasharray="5 4" opacity="0.8"
                  />
                  <text x={BASIN_W - 38} y={targetTopY + 4} fontSize="10" fill="#22c55e" fontFamily="monospace">
                    {s.diag_target} {TARGET_LEVEL}{s.unit_m}
                  </text>

                  {/* inflow arrow (left, in) — width scales with inflow */}
                  <g>
                    <line x1="8" y1="60" x2="42" y2="60" stroke={ACCENT} strokeWidth={inflowArrow} strokeLinecap="round" />
                    <path d="M 42 60 l -9 -6 l 0 12 z" fill={ACCENT} />
                    <text x="8" y="50" fontSize="10" fill={ACCENT} fontFamily="monospace">
                      {s.diag_in} {model.inflowM.toFixed(2)}{s.unit_m}
                    </text>
                  </g>

                  {/* evaporation arrow (up, out) — width scales with evap */}
                  <g>
                    <line x1={BASIN_W / 2} y1="30" x2={BASIN_W / 2} y2="4" stroke="#f59e0b" strokeWidth={evapArrow} strokeLinecap="round" />
                    <path d={`M ${BASIN_W / 2} 4 l -6 9 l 12 0 z`} fill="#f59e0b" />
                    <text x={BASIN_W / 2 + 10} y="16" fontSize="10" fill="#f59e0b" fontFamily="monospace">
                      {s.diag_out} {model.evapM.toFixed(2)}{s.unit_m}
                    </text>
                  </g>

                  {/* projected level readout */}
                  <text x="40" y={BASIN_H + 24} fontSize="11" fill="#e5e7eb" fontFamily="monospace">
                    {s.diag_level}: <tspan fill={ACCENT2} fontWeight="bold">{projectedLevel.toFixed(1)}{s.unit_m}</tspan>
                  </text>
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* ══ PROJECTION CHART ══ */}
        <section>
          <div className="text-xs font-semibold uppercase tracking-[0.25em] mb-3" style={{ color: ACCENT }}>
            {s.chart_eyebrow}
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-2">{s.chart_title}</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed max-w-2xl">{s.chart_sub}</p>

          <div className="bg-white/5 border border-white/10 backdrop-blur rounded-2xl p-4 md:p-6">
            <svg viewBox={`0 0 ${CW} ${CH}`} className="w-full" role="img" aria-label={s.chart_title}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={ACCENT} stopOpacity="0.35" />
                  <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* grid + y ticks */}
              {yTicks.map((t) => (
                <g key={t}>
                  <line x1={PAD.l} x2={CW - PAD.r} y1={yOf(t)} y2={yOf(t)} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                  <text x={PAD.l - 8} y={yOf(t) + 3} fontSize="10" fill="#6b7280" textAnchor="end" fontFamily="monospace">
                    {t}
                  </text>
                </g>
              ))}

              {/* x ticks */}
              {xTicks.map((yr) => {
                const i = yr - START_YEAR;
                return (
                  <text key={yr} x={xOf(i, END_YEAR - START_YEAR + 1)} y={CH - PAD.b + 18}
                    fontSize="10" fill="#6b7280" textAnchor="middle" fontFamily="monospace">
                    {yr}
                  </text>
                );
              })}

              {/* target line */}
              <line x1={PAD.l} x2={CW - PAD.r} y1={targetY} y2={targetY}
                stroke="#22c55e" strokeWidth="1.5" strokeDasharray="6 5" opacity="0.6" />
              <text x={CW - PAD.r} y={targetY - 6} fontSize="10" fill="#22c55e" textAnchor="end" fontFamily="monospace">
                {s.chart_targetline} {TARGET_LEVEL}{s.unit_m}
              </text>

              {/* area under scenario */}
              <motion.path
                key={areaPath}
                d={areaPath}
                fill="url(#areaGrad)"
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: reduce ? 0 : 0.5 }}
              />

              {/* baseline (do nothing) */}
              <path d={baselinePath} fill="none" stroke="#f87171" strokeWidth="2" strokeDasharray="5 5" opacity="0.7" />

              {/* active scenario line */}
              <motion.path
                key={scenarioPath}
                d={scenarioPath}
                fill="none"
                stroke={ACCENT}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={reduce ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: reduce ? 0 : 0.8, ease: 'easeInOut' }}
              />

              {/* recovery-year marker */}
              {model.recoveryYear !== null && (
                <g>
                  <line
                    x1={xOf(model.recoveryYear - START_YEAR, END_YEAR - START_YEAR + 1)}
                    x2={xOf(model.recoveryYear - START_YEAR, END_YEAR - START_YEAR + 1)}
                    y1={PAD.t} y2={CH - PAD.b}
                    stroke="#22c55e" strokeWidth="1" strokeDasharray="3 3" opacity="0.5"
                  />
                  <circle
                    cx={xOf(model.recoveryYear - START_YEAR, END_YEAR - START_YEAR + 1)}
                    cy={targetY} r="4" fill="#22c55e"
                  />
                </g>
              )}
            </svg>

            {/* legend */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-xs text-gray-400">
              <span className="flex items-center gap-2">
                <span className="w-6 h-0.5 rounded" style={{ background: ACCENT }} /> {s.chart_scenario}
              </span>
              <span className="flex items-center gap-2">
                <span className="w-6 border-t-2 border-dashed border-[#f87171]" /> {s.chart_baseline}
              </span>
              <span className="flex items-center gap-2">
                <span className="w-6 border-t-2 border-dashed border-[#22c55e]" /> {s.chart_targetline}
              </span>
            </div>
          </div>
        </section>

        {/* ══ BALANCE LEDGER ══ */}
        <section>
          <div className="text-xs font-semibold uppercase tracking-[0.25em] mb-3" style={{ color: ACCENT2 }}>
            {s.ledger_eyebrow}
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-6">{s.ledger_title}</h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Inflow */}
            <div className="bg-white/5 border border-white/10 backdrop-blur rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <ArrowDownToLine size={16} style={{ color: ACCENT }} />
                <span className="text-xs uppercase tracking-wider text-gray-500">{s.ledger_inflow}</span>
              </div>
              <div className="text-2xl font-black font-mono" style={{ color: ACCENT }}>
                +{model.inflowM.toFixed(2)}
              </div>
              <div className="text-[11px] text-gray-500 font-mono mt-1">{s.unit_m}{s.ledger_per_year}</div>
            </div>

            {/* Evaporation */}
            <div className="bg-white/5 border border-white/10 backdrop-blur rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <ArrowUpFromLine size={16} style={{ color: '#f59e0b' }} />
                <span className="text-xs uppercase tracking-wider text-gray-500">{s.ledger_evap}</span>
              </div>
              <div className="text-2xl font-black font-mono" style={{ color: '#f59e0b' }}>
                −{model.evapM.toFixed(2)}
              </div>
              <div className="text-[11px] text-gray-500 font-mono mt-1">{s.unit_m}{s.ledger_per_year}</div>
            </div>

            {/* Net change */}
            <div className="bg-white/5 border border-white/10 backdrop-blur rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                {netFalling
                  ? <TrendingDown size={16} style={{ color: '#f87171' }} />
                  : <TrendingUp size={16} style={{ color: '#22c55e' }} />}
                <span className="text-xs uppercase tracking-wider text-gray-500">{s.ledger_net}</span>
              </div>
              <div className="text-2xl font-black font-mono" style={{ color: netFalling ? '#f87171' : '#22c55e' }}>
                {model.netChange >= 0 ? '+' : '−'}{Math.abs(model.netChange).toFixed(2)}
              </div>
              <div className="text-[11px] font-mono mt-1" style={{ color: netFalling ? '#f87171' : '#22c55e' }}>
                {netLabel}
              </div>
            </div>

            {/* Time to target */}
            <div className="bg-white/5 border border-white/10 backdrop-blur rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Calendar size={16} style={{ color: ACCENT2 }} />
                <span className="text-xs uppercase tracking-wider text-gray-500">{s.ledger_time}</span>
              </div>
              <div className="text-2xl font-black font-mono" style={{ color: model.yearsToTarget !== null ? ACCENT2 : '#f87171' }}>
                {model.yearsToTarget !== null ? model.yearsToTarget : '∞'}
              </div>
              <div className="text-[11px] text-gray-500 font-mono mt-1">
                {model.yearsToTarget !== null ? s.ledger_years : s.kpi_never}
              </div>
            </div>
          </div>
        </section>

        {/* ══ CTA ══ */}
        <section className="pt-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: reduce ? 0 : 0.5 }}
            className="rounded-2xl border border-[#00e6c8]/20 p-8 text-center bg-gradient-to-b from-[#00e6c8]/5 to-transparent"
          >
            <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-5 bg-[#00e6c8]/10 text-[#00e6c8]">
              <Waves size={26} />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white mb-3">{s.cta_title}</h2>
            <p className="text-gray-400 text-sm md:text-base mb-7 max-w-xl mx-auto leading-relaxed">{s.cta_sub}</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => navigate('/roadmap')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00e6c8]/10 border border-[#00e6c8]/30 text-[#00e6c8] hover:bg-[#00e6c8]/20 transition-colors text-sm font-medium"
              >
                <Map size={14} /> {s.cta_roadmap} <ArrowRight size={14} />
              </button>
              <button
                onClick={() => navigate('/whitepaper-full')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00d4ff]/10 border border-[#00d4ff]/30 text-[#00d4ff] hover:bg-[#00d4ff]/20 transition-colors text-sm font-medium"
              >
                <FileText size={14} /> {s.cta_whitepaper} <ArrowRight size={14} />
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-8">{s.copyright}</p>
          </motion.div>
        </section>

      </div>
    </div>
  );
}
