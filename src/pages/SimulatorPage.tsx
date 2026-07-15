/**
 * SimulatorPage — Симулятор водного баланса бассейна
 * Интерактивная механика: пользователь двигает ползунки входных параметров
 * (осадки, забор на ирригацию, эффективность каналов, испарение, опреснение,
 * горизонт прогноза) и вживую видит расчётные KPI и графики.
 * Модель иллюстративная, не научная. Тема — Аральский бассейн / Центральная Азия.
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import {
  ArrowLeft, Droplets, Waves, Gauge, TrendingUp, TrendingDown,
  AlertTriangle, SlidersHorizontal, RotateCcw, Sun, CloudRain,
  Factory, Ship, CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid, Cell,
} from 'recharts';

// ── Palette ──────────────────────────────────────────────────────────────────

const C = {
  cyan: '#00e6c8',
  violet: '#a78bfa',
  green: '#4ade80',
  amber: '#fbbf24',
  red: '#f87171',
  sky: '#38bdf8',
};

// ── Model constants ──────────────────────────────────────────────────────────

const BASE_RIVER_FLOW = 78;      // км³/год — базовый приток рек (Амударья+Сырдарья, норма)
const BASE_EVAPORATION = 42;     // км³/год — базовое испарение с зеркала бассейна
const ARAL_START_AREA = 8.5;     // тыс. км² — стартовая площадь зеркала

// ── Inputs ───────────────────────────────────────────────────────────────────

interface Inputs {
  precip: number;      // % от нормы, 40–160
  irrigation: number;  // км³/год, 20–120
  efficiency: number;  // %, 40–95
  evaporation: number; // % модификатор, 70–150
  transfer: number;    // км³/год, 0–30
  horizon: number;     // год, 2026–2040
}

const DEFAULT_INPUTS: Inputs = {
  precip: 100,
  irrigation: 60,
  efficiency: 65,
  evaporation: 100,
  transfer: 5,
  horizon: 2035,
};

// ── Presets ──────────────────────────────────────────────────────────────────

type PresetKey = 'base' | 'drought' | 'recovery';

const PRESETS: Record<PresetKey, { label: string; icon: typeof Droplets; color: string; values: Inputs }> = {
  base: {
    label: 'Базовый', icon: Droplets, color: C.sky,
    values: { ...DEFAULT_INPUTS },
  },
  drought: {
    label: 'Засуха', icon: Sun, color: C.red,
    values: { precip: 55, irrigation: 105, efficiency: 50, evaporation: 140, transfer: 2, horizon: 2035 },
  },
  recovery: {
    label: 'Восстановление', icon: Waves, color: C.green,
    values: { precip: 120, irrigation: 45, efficiency: 90, evaporation: 90, transfer: 22, horizon: 2035 },
  },
};

// ── Core balance formula (illustrative) ──────────────────────────────────────

interface Balance {
  inflow: number;              // км³/год
  irrigationEffective: number; // км³/год — эффективные потери на ирригацию
  evaporationComp: number;     // км³/год
  net: number;                 // км³/год — чистый баланс
}

function computeBalance(inp: Inputs): Balance {
  const inflow = BASE_RIVER_FLOW * (inp.precip / 100) + inp.transfer;
  // Выше эффективность каналов → меньше эффективный забор (меньше потерь).
  const irrigationEffective = inp.irrigation * (1 - (inp.efficiency / 100) * 0.5);
  const evaporationComp = BASE_EVAPORATION * (inp.evaporation / 100);
  const net = inflow - irrigationEffective - evaporationComp;
  return { inflow, irrigationEffective, evaporationComp, net };
}

// Индекс уровня водохранилища 0–100% как функция чистого баланса.
function reservoirIndex(net: number): number {
  // net ∈ [-40, +40] маппим в [0, 100], центр 50 при net = 0.
  return Math.max(0, Math.min(100, 50 + net * 1.25));
}

// Статус риска по чистому балансу.
function riskStatus(net: number): { key: 'green' | 'amber' | 'red'; label: string; color: string } {
  if (net >= 6) return { key: 'green', label: 'Устойчивый', color: C.green };
  if (net >= -6) return { key: 'amber', label: 'Напряжённый', color: C.amber };
  return { key: 'red', label: 'Критический', color: C.red };
}

// ── Number helpers ───────────────────────────────────────────────────────────

const fmt = (n: number, d = 1) => n.toFixed(d);
const fmtSigned = (n: number, d = 1) => `${n >= 0 ? '+' : ''}${n.toFixed(d)}`;

// ── Animated KPI value ───────────────────────────────────────────────────────

function AnimatedValue({ value, suffix, decimals = 1, color }: { value: number; suffix?: string; decimals?: number; color: string }) {
  return (
    <AnimatePresence mode="popLayout">
      <motion.span
        key={value.toFixed(decimals)}
        initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
        transition={{ duration: 0.25 }}
        className="inline-block tabular-nums"
        style={{ color }}
      >
        {value.toFixed(decimals)}{suffix}
      </motion.span>
    </AnimatePresence>
  );
}

// ── Slider row ───────────────────────────────────────────────────────────────

function Slider({
  label, icon: Icon, value, min, max, step = 1, unit, accent, display, onChange,
}: {
  label: string;
  icon: typeof Droplets;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit: string;
  accent: string;
  display?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="flex items-center gap-2 text-xs text-white/60">
          <Icon className="w-3.5 h-3.5" style={{ color: accent }} />
          {label}
        </span>
        <span className="text-xs font-mono font-semibold" style={{ color: accent }}>
          {display ?? value}<span className="text-white/30 ml-1">{unit}</span>
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/10 outline-none"
        style={{
          accentColor: accent,
          background: `linear-gradient(to right, ${accent} 0%, ${accent} ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.08) ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.08) 100%)`,
        }}
      />
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function SimulatorPage() {
  const [, setLocation] = useLocation();
  const [inputs, setInputs] = useState<Inputs>(DEFAULT_INPUTS);
  const [activePreset, setActivePreset] = useState<PresetKey | null>('base');

  const set = <K extends keyof Inputs>(key: K, v: Inputs[K]) => {
    setInputs((prev) => ({ ...prev, [key]: v }));
    setActivePreset(null);
  };

  const applyPreset = (key: PresetKey) => {
    setInputs({ ...PRESETS[key].values });
    setActivePreset(key);
  };

  // ── Derived outputs (recompute on every input change) ──
  const balance = useMemo(() => computeBalance(inputs), [inputs]);
  const level = useMemo(() => reservoirIndex(balance.net), [balance.net]);
  const risk = useMemo(() => riskStatus(balance.net), [balance.net]);

  // Проекция площади Арала на горизонт: чистый баланс год за годом двигает зеркало.
  const aralProjected = useMemo(() => {
    const years = inputs.horizon - 2026;
    // на каждый км³ чистого баланса ~0.04 тыс. км² зеркала в год
    const area = ARAL_START_AREA + balance.net * 0.04 * years;
    return Math.max(1.5, area);
  }, [inputs.horizon, balance.net]);

  // Многолетний ряд для графика (2026 → горизонт).
  const series = useMemo(() => {
    const rows: { year: number; level: number; aral: number }[] = [];
    let lvl = 50;               // старт индекса уровня
    let aral = ARAL_START_AREA; // старт площади
    for (let y = 2026; y <= inputs.horizon; y++) {
      // уровень стремится к целевому индексу баланса, площадь дрейфует по net
      lvl += (reservoirIndex(balance.net) - lvl) * 0.4;
      aral = Math.max(1.5, aral + balance.net * 0.04);
      rows.push({ year: y, level: +lvl.toFixed(1), aral: +aral.toFixed(2) });
    }
    return rows;
  }, [inputs.horizon, balance.net]);

  // Разбивка баланса: приток vs расход.
  const breakdown = useMemo(() => ([
    { name: 'Приток рек', value: +(BASE_RIVER_FLOW * (inputs.precip / 100)).toFixed(1), color: C.sky },
    { name: 'Опреснение', value: +inputs.transfer.toFixed(1), color: C.cyan },
    { name: 'Ирригация', value: -+balance.irrigationEffective.toFixed(1), color: C.violet },
    { name: 'Испарение', value: -+balance.evaporationComp.toFixed(1), color: C.amber },
  ]), [inputs.precip, inputs.transfer, balance.irrigationEffective, balance.evaporationComp]);

  const RiskIcon = risk.key === 'green' ? CheckCircle2 : risk.key === 'amber' ? AlertTriangle : AlertTriangle;
  const NetIcon = balance.net >= 0 ? TrendingUp : TrendingDown;

  // ── KPI cards config ──
  const kpis = [
    {
      label: 'Чистый баланс',
      value: balance.net, suffix: ' км³/год', decimals: 1, signed: true,
      icon: NetIcon, color: risk.color,
      sub: `Приток ${fmt(balance.inflow)} − расход ${fmt(balance.irrigationEffective + balance.evaporationComp)}`,
    },
    {
      label: 'Уровень водохранилища',
      value: level, suffix: '%', decimals: 0, signed: false,
      icon: Gauge, color: level >= 55 ? C.green : level >= 35 ? C.amber : C.red,
      sub: level >= 55 ? 'Наполнение стабильно' : level >= 35 ? 'Ниже целевого' : 'Дефицит запасов',
    },
    {
      label: `Площадь Арала · ${inputs.horizon}`,
      value: aralProjected, suffix: ' тыс. км²', decimals: 2, signed: false,
      icon: Waves, color: aralProjected >= ARAL_START_AREA ? C.cyan : aralProjected >= 6 ? C.amber : C.red,
      sub: `${fmtSigned(aralProjected - ARAL_START_AREA, 2)} к старту (${ARAL_START_AREA})`,
    },
    {
      label: 'Статус риска',
      value: null, textValue: risk.label,
      icon: RiskIcon, color: risk.color,
      sub: risk.key === 'green' ? 'Баланс ≥ +6 км³' : risk.key === 'amber' ? 'Баланс −6…+6 км³' : 'Баланс < −6 км³',
    },
  ];

  return (
    <div className="min-h-screen pt-14 pb-8" style={{ background: 'linear-gradient(135deg, #000818 0%, #000d1f 100%)' }}>
      <div className="max-w-6xl mx-auto px-4 pt-6">
        {/* Back */}
        <button
          onClick={() => setLocation('/')}
          className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors mb-4 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          На главную
        </button>

        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,230,200,0.12)', border: '1px solid rgba(0,230,200,0.25)' }}>
            <SlidersHorizontal className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-none">Симулятор водного баланса</h1>
            <p className="text-white/35 text-xs mt-1">Сценарное моделирование бассейна Арала — двигайте параметры и смотрите прогноз</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,340px)_1fr] gap-4">
          {/* ── LEFT: controls ── */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl p-5 h-fit"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            {/* Presets */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-white/60">Сценарии</span>
              <button
                onClick={() => applyPreset('base')}
                className="flex items-center gap-1 text-[10px] text-white/40 hover:text-white/70 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Сброс
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-5">
              {(Object.keys(PRESETS) as PresetKey[]).map((key) => {
                const p = PRESETS[key];
                const Icon = p.icon;
                const isActive = activePreset === key;
                return (
                  <button
                    key={key}
                    onClick={() => applyPreset(key)}
                    className="flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl transition-all cursor-pointer"
                    style={{
                      background: isActive ? `${p.color}18` : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isActive ? `${p.color}55` : 'rgba(255,255,255,0.06)'}`,
                    }}
                  >
                    <Icon className="w-4 h-4" style={{ color: isActive ? p.color : 'rgba(255,255,255,0.5)' }} />
                    <span className="text-[10px] font-semibold leading-tight text-center" style={{ color: isActive ? p.color : 'rgba(255,255,255,0.55)' }}>
                      {p.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Sliders */}
            <div className="space-y-5">
              <Slider
                label="Осадки" icon={CloudRain} value={inputs.precip} min={40} max={160}
                unit="% нормы" accent={C.sky} onChange={(v) => set('precip', v)}
              />
              <Slider
                label="Забор на ирригацию" icon={Droplets} value={inputs.irrigation} min={20} max={120}
                unit="км³/год" accent={C.violet} onChange={(v) => set('irrigation', v)}
              />
              <Slider
                label="Эффективность каналов" icon={Gauge} value={inputs.efficiency} min={40} max={95}
                unit="%" accent={C.cyan} onChange={(v) => set('efficiency', v)}
              />
              <Slider
                label="Испарение" icon={Sun} value={inputs.evaporation} min={70} max={150}
                unit="% базы" accent={C.amber} onChange={(v) => set('evaporation', v)}
              />
              <Slider
                label="Опреснение / переброска" icon={Ship} value={inputs.transfer} min={0} max={30}
                unit="км³/год" accent={C.green} onChange={(v) => set('transfer', v)}
              />
              <Slider
                label="Горизонт прогноза" icon={Factory} value={inputs.horizon} min={2026} max={2040}
                unit="год" accent="#60a5fa" display={String(inputs.horizon)} onChange={(v) => set('horizon', v)}
              />
            </div>
          </motion.div>

          {/* ── RIGHT: KPIs + charts ── */}
          <div className="space-y-4">
            {/* KPI cards */}
            <div className="grid grid-cols-2 gap-3">
              {kpis.map((k, i) => {
                const Icon = k.icon;
                return (
                  <motion.div
                    key={k.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 + i * 0.05 }}
                    className="rounded-2xl p-4 relative overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${k.color}22` }}
                  >
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{ background: `radial-gradient(circle at top right, ${k.color}12, transparent 60%)` }}
                    />
                    <div className="relative">
                      <div className="flex items-center gap-2 mb-2" style={{ color: k.color }}>
                        <Icon className="w-4 h-4" />
                        <span className="text-[11px] text-white/45 leading-tight">{k.label}</span>
                      </div>
                      <div className="text-2xl font-black">
                        {k.value !== null ? (
                          k.signed ? (
                            <span style={{ color: k.color }}>
                              {k.value >= 0 ? '+' : ''}<AnimatedValue value={k.value} suffix={k.suffix} decimals={k.decimals} color={k.color} />
                            </span>
                          ) : (
                            <AnimatedValue value={k.value} suffix={k.suffix} decimals={k.decimals} color={k.color} />
                          )
                        ) : (
                          <AnimatePresence mode="popLayout">
                            <motion.span
                              key={k.textValue}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -8 }}
                              transition={{ duration: 0.25 }}
                              className="inline-block"
                              style={{ color: k.color }}
                            >
                              {k.textValue}
                            </motion.span>
                          </AnimatePresence>
                        )}
                      </div>
                      <div className="text-[10px] text-white/35 mt-1.5 leading-tight">{k.sub}</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Multi-year projection */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28 }}
              className="rounded-2xl p-5"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="flex items-center gap-2 mb-1 text-white/40 text-xs">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                Многолетний прогноз · 2026 → {inputs.horizon}
              </div>
              <div className="flex items-center gap-4 mb-3 text-[10px]">
                <span className="flex items-center gap-1.5 text-white/50"><span className="w-2.5 h-0.5 rounded" style={{ background: C.cyan }} />Уровень вдхр., %</span>
                <span className="flex items-center gap-1.5 text-white/50"><span className="w-2.5 h-0.5 rounded" style={{ background: C.sky }} />Площадь Арала, тыс. км²</span>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={series} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="simLevelGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={C.cyan} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={C.cyan} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="simAralGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={C.sky} stopOpacity={0.25} />
                      <stop offset="100%" stopColor={C.sky} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="year" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.4)' }} interval="preserveStartEnd" />
                  <YAxis yAxisId="l" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.4)' }} width={30} domain={[0, 100]} />
                  <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.4)' }} width={30} domain={[0, 14]} />
                  <Tooltip
                    contentStyle={{ background: '#0a1628', border: '1px solid rgba(0,230,200,0.2)', borderRadius: 8, fontSize: 11 }}
                    labelStyle={{ color: 'rgba(255,255,255,0.6)' }}
                    formatter={(v: number, n: string) => [v, n === 'level' ? 'Уровень, %' : 'Арал, тыс. км²']}
                  />
                  <Area yAxisId="l" type="monotone" dataKey="level" stroke={C.cyan} strokeWidth={2} fill="url(#simLevelGrad)" dot={false} />
                  <Area yAxisId="r" type="monotone" dataKey="aral" stroke={C.sky} strokeWidth={2} fill="url(#simAralGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Balance breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.34 }}
              className="rounded-2xl p-5"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-white/40 text-xs">
                  <Waves className="w-4 h-4 text-violet-400" />
                  Компоненты баланса · км³/год
                </div>
                <span className="text-xs font-mono font-semibold" style={{ color: risk.color }}>
                  Итог {fmtSigned(balance.net)}
                </span>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={breakdown} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.4)' }} />
                  <YAxis tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.4)' }} width={34} />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                    contentStyle={{ background: '#0a1628', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 8, fontSize: 11 }}
                    labelStyle={{ color: 'rgba(255,255,255,0.6)' }}
                    formatter={(v: number) => [`${v >= 0 ? '+' : ''}${v} км³`, 'Вклад']}
                  />
                  <Bar dataKey="value" radius={[4, 4, 4, 4]}>
                    {breakdown.map((d, i) => (
                      <Cell key={i} fill={d.color} fillOpacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-[10px] text-white/30 leading-relaxed mt-2">
                Положительные столбцы — приток (реки + опреснение), отрицательные — расход (ирригация + испарение).
                Эффективность каналов снижает потери ирригации, испарение зависит от климата.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
