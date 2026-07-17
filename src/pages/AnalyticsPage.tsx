// ═══════════════════════════════════════════════════════════════
//  AnalyticsPage — Drought forecasting, financial projections,
//  water demand modeling, cross-regional comparisons
//  Route: /analytics
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  ChevronLeft, TrendingUp, TrendingDown, AlertTriangle,
  BarChart3, Activity, Droplets, Zap, Globe, RefreshCw,
  CloudRain, Thermometer, Wind, Sun, Calendar, Filter,
  DollarSign, Percent, Target, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { WorldBankPanel } from '@/components/analytics/WorldBankPanel';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  ScatterChart, Scatter, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine, Cell
} from 'recharts';

// ─── Data generators ────────────────────────────────────────────

const REGIONS = [
  { id: 'uz', name: 'Узбекистан', color: '#00e6c8' },
  { id: 'kz', name: 'Казахстан', color: '#60a5fa' },
  { id: 'kg', name: 'Кыргызстан', color: '#a78bfa' },
  { id: 'tj', name: 'Таджикистан', color: '#f59e0b' },
  { id: 'tm', name: 'Туркменистан', color: '#f97316' },
];

const DROUGHT_MONTHS = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'];

function genDroughtData() {
  return DROUGHT_MONTHS.map((m, i) => ({
    month: m,
    uz: 45 + [10,8,5,-5,-15,-25,-35,-40,-30,-15,5,15][i] + (Math.random()-0.5)*5,
    kz: 30 + [5,3,0,-8,-20,-30,-40,-42,-35,-20,0,8][i] + (Math.random()-0.5)*5,
    kg: 65 + [12,10,8,5,0,-5,-10,-15,-8,0,8,14][i] + (Math.random()-0.5)*5,
    threshold: 30,
  }));
}

function genFinancialForecast(irr: number, funding: number) {
  return Array.from({ length: 15 }, (_, y) => ({
    year: 2024 + y,
    revenue: Math.round(funding * 0.08 * Math.pow(1 + irr / 100, y) * (0.9 + Math.random() * 0.2)),
    costs: Math.round(funding * 0.03 * Math.pow(1.04, y) * (0.95 + Math.random() * 0.1)),
    cumulative: Math.round(funding * (Math.pow(1 + irr / 100, y) - 1)),
  }));
}

function genDemandForecast() {
  const base = 12.5; // billion m³/year for Uzbekistan
  return Array.from({ length: 20 }, (_, i) => ({
    year: 2020 + i,
    demand: +(base * Math.pow(1.018, i) * (0.97 + Math.random() * 0.06)).toFixed(2),
    supply: +(base * Math.pow(1.008, i) * (0.96 + Math.random() * 0.06)).toFixed(2),
    efficiency: +(55 + i * 1.8 + (Math.random() - 0.5) * 3).toFixed(1),
  }));
}

const WATER_STRESS_DATA = [
  { subject: 'Доступность', uz: 42, kz: 72, world: 65 },
  { subject: 'Инфраструктура', uz: 58, kz: 61, world: 55 },
  { subject: 'Управление', uz: 45, kz: 52, world: 50 },
  { subject: 'Эффективность', uz: 35, kz: 48, world: 58 },
  { subject: 'Финансирование', uz: 38, kz: 55, world: 60 },
  { subject: 'Технологии', uz: 30, kz: 44, world: 62 },
];

// ─── Stat card ──────────────────────────────────────────────────

function StatCard({ icon: Icon, title, value, change, unit, color, sub }:
  { icon: any; title: string; value: string | number; change?: number; unit?: string; color: string; sub?: string }) {
  const isPositive = (change ?? 0) >= 0;
  return (
    <motion.div whileHover={{ y: -2 }}
      className="rounded-2xl p-5"
      style={{ background: 'rgba(0,8,24,0.75)', border: `1px solid ${color}20`, backdropFilter: 'blur(12px)' }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
          <Icon size={16} style={{ color }} />
        </div>
        <span className="text-white/45 text-xs leading-tight">{title}</span>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-white font-black text-2xl">{value}</span>
        {unit && <span className="text-white/35 text-sm mb-0.5">{unit}</span>}
        {change !== undefined && (
          <div className={`flex items-center gap-0.5 mb-0.5 ml-auto ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            <span className="text-xs font-bold">{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      {sub && <p className="text-white/25 text-xs mt-1">{sub}</p>}
    </motion.div>
  );
}

// ─── Risk badge ─────────────────────────────────────────────────

function RiskBadge({ level }: { level: 'low' | 'medium' | 'high' | 'critical' }) {
  const cfg = {
    low: { label: 'Низкий', color: '#22c55e' },
    medium: { label: 'Средний', color: '#f59e0b' },
    high: { label: 'Высокий', color: '#f97316' },
    critical: { label: 'Критический', color: '#ef4444' },
  }[level];
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-bold"
      style={{ background: `${cfg.color}18`, color: cfg.color, border: `1px solid ${cfg.color}30` }}>
      {cfg.label}
    </span>
  );
}

// ─── Main ───────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  const [tab, setTab] = useState<'drought' | 'finance' | 'demand' | 'stress' | 'worldbank'>('drought');
  const [selectedRegion, setSelectedRegion] = useState('uz');
  const [irr, setIrr] = useState(14);
  const [funding, setFunding] = useState(50);

  const droughtData = useMemo(() => genDroughtData(), []);
  const financialData = useMemo(() => genFinancialForecast(irr, funding * 1e6), [irr, funding]);
  const demandData = useMemo(() => genDemandForecast(), []);

  const ACCENT = '#00e6c8';

  const TABS = [
    { id: 'drought', label: 'Засуха', icon: CloudRain },
    { id: 'finance', label: 'Финансы', icon: DollarSign },
    { id: 'demand', label: 'Спрос', icon: Droplets },
    { id: 'stress', label: 'Стресс-тест', icon: Activity },
    { id: 'worldbank', label: 'World Bank', icon: Globe },
  ] as const;

  return (
    <div className="min-h-screen" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Header */}
      <div className="sticky top-0 z-30 px-4 py-3 flex items-center gap-3"
        style={{ background: 'rgba(0,8,24,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={() => setLocation('/dashboard')}
          className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors text-sm">
          <ChevronLeft size={16} /> Назад
        </button>
        <div className="h-4 w-px bg-white/10" />
        <BarChart3 size={16} style={{ color: ACCENT }} />
        <span className="text-white font-bold text-sm">Прогнозная аналитика</span>
        <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold"
          style={{ background: `${ACCENT}20`, color: ACCENT, border: `1px solid ${ACCENT}30` }}>AI-модели</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={CloudRain} title="Дефицит осадков 2025" value="−23" unit="%" change={-8} color="#3b82f6" sub="vs среднее 1990–2020" />
          <StatCard icon={Thermometer} title="Аномалия темп." value="+1.8" unit="°C" change={12} color="#f97316" sub="выше климатической нормы" />
          <StatCard icon={Target} title="Индекс водного стресса" value="4.1" unit="/5" change={5} color="#ef4444" sub="Центральная Азия" />
          <StatCard icon={TrendingUp} title="IRR водных проектов" value="12–18" unit="%" color="#22c55e" sub="средний по региону" />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id as any)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all"
              style={{
                background: tab === id ? `${ACCENT}18` : 'rgba(255,255,255,0.04)',
                color: tab === id ? ACCENT : 'rgba(255,255,255,0.4)',
                border: `1px solid ${tab === id ? `${ACCENT}30` : 'rgba(255,255,255,0.06)'}`,
              }}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {/* ── Drought Forecast ── */}
        {tab === 'drought' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              {REGIONS.slice(0, 3).map(r => {
                const risk = r.id === 'kg' ? 'low' : r.id === 'kz' ? 'medium' : 'high';
                return (
                  <div key={r.id} className="rounded-2xl p-4"
                    style={{ background: 'rgba(0,8,24,0.75)', border: `1px solid ${r.color}20` }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white font-semibold text-sm">{r.name}</span>
                      <RiskBadge level={risk} />
                    </div>
                    <div className="text-white/40 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span>Индекс PDSI</span>
                        <span style={{ color: r.color }}>{r.id === 'kg' ? '−1.2' : r.id === 'kz' ? '−2.4' : '−3.1'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Осадки (норма)</span>
                        <span style={{ color: r.color }}>{r.id === 'kg' ? '77%' : r.id === 'kz' ? '58%' : '52%'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="rounded-3xl p-6" style={{ background: 'rgba(0,8,24,0.7)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 className="text-white/70 text-sm font-semibold mb-1 flex items-center gap-2">
                <CloudRain size={14} className="text-blue-400" /> Индекс засухи по месяцам (PDSI)
              </h3>
              <p className="text-white/30 text-xs mb-6">Palmer Drought Severity Index. Ниже −3 = тяжёлая засуха</p>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={droughtData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 11 }} />
                  <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }} />
                  <Legend />
                  <ReferenceLine y={30} stroke="#ef4444" strokeDasharray="6 3" label={{ value: 'Критич.', fill: '#ef4444', fontSize: 10 }} />
                  <Line type="monotone" dataKey="uz" name="Узбекистан" stroke="#00e6c8" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="kz" name="Казахстан" stroke="#60a5fa" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="kg" name="Кыргызстан" stroke="#a78bfa" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* ── Financial Forecast ── */}
        {tab === 'finance' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            {/* Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="rounded-2xl p-4" style={{ background: 'rgba(0,8,24,0.75)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <label className="text-white/50 text-xs mb-2 block">IRR (%): <span className="text-white font-bold">{irr}%</span></label>
                <input type="range" min="5" max="30" value={irr} onChange={e => setIrr(+e.target.value)}
                  className="w-full accent-cyan-400" />
              </div>
              <div className="rounded-2xl p-4" style={{ background: 'rgba(0,8,24,0.75)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <label className="text-white/50 text-xs mb-2 block">Объём инвестиций: <span className="text-white font-bold">${funding}M</span></label>
                <input type="range" min="5" max="500" value={funding} onChange={e => setFunding(+e.target.value)}
                  className="w-full accent-cyan-400" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <StatCard icon={DollarSign} title="Выручка год 5" value={`$${(financialData[4]?.revenue / 1e6).toFixed(1)}M`} color="#22c55e" />
              <StatCard icon={Percent} title="ROI за 10 лет" value={`${((financialData[9]?.cumulative / (funding * 1e6)) * 100).toFixed(0)}%`} color={ACCENT} />
              <StatCard icon={Target} title="Окупаемость" value={`${Math.ceil(Math.log(2) / Math.log(1 + irr / 100))} лет`} color="#a78bfa" />
            </div>

            <div className="rounded-3xl p-6" style={{ background: 'rgba(0,8,24,0.7)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 className="text-white/70 text-sm font-semibold mb-6 flex items-center gap-2">
                <TrendingUp size={14} className="text-green-400" /> Финансовые проекции на 15 лет
              </h3>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={financialData}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#22c55e" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="year" stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 11 }} />
                  <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 11 }} tickFormatter={v => `$${(v/1e6).toFixed(0)}M`} />
                  <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
                    formatter={(v: any) => [`$${(v/1e6).toFixed(1)}M`]} />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" name="Выручка" stroke="#22c55e" fill="url(#revGrad)" strokeWidth={2.5} />
                  <Area type="monotone" dataKey="costs" name="Затраты" stroke="#f97316" fill="none" strokeWidth={2} strokeDasharray="6 3" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* ── Water Demand ── */}
        {tab === 'demand' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="rounded-3xl p-6 mb-6" style={{ background: 'rgba(0,8,24,0.7)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 className="text-white/70 text-sm font-semibold mb-1 flex items-center gap-2">
                <Droplets size={14} style={{ color: ACCENT }} /> Спрос и предложение воды (млрд м³/год)
              </h3>
              <p className="text-white/30 text-xs mb-6">Центральная Азия (совокупно). При сохранении тренда — дефицит с 2029</p>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={demandData}>
                  <defs>
                    <linearGradient id="demandGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f97316" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#f97316" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="supplyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={ACCENT} stopOpacity={0.25} />
                      <stop offset="100%" stopColor={ACCENT} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="year" stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 11 }} />
                  <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }} />
                  <Legend />
                  <Area type="monotone" dataKey="demand" name="Спрос млрд м³" stroke="#f97316" fill="url(#demandGrad)" strokeWidth={2.5} />
                  <Area type="monotone" dataKey="supply" name="Предложение млрд м³" stroke={ACCENT} fill="url(#supplyGrad)" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-3xl p-6" style={{ background: 'rgba(0,8,24,0.7)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 className="text-white/70 text-sm font-semibold mb-6">Эффективность использования (%)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={demandData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="year" stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 11 }} />
                  <YAxis domain={[40, 90]} stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }} />
                  <ReferenceLine y={80} stroke="#22c55e" strokeDasharray="6 3" label={{ value: 'Цель 2040', fill: '#22c55e', fontSize: 10 }} />
                  <Line type="monotone" dataKey="efficiency" name="Эффективность %" stroke="#a78bfa" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* ── Stress Test / Radar ── */}
        {tab === 'stress' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-3xl p-6" style={{ background: 'rgba(0,8,24,0.7)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 className="text-white/70 text-sm font-semibold mb-6">Водный стресс-индекс по 6 измерениям</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={WATER_STRESS_DATA} margin={{ top: 0, right: 30, bottom: 0, left: 30 }}>
                    <PolarGrid stroke="rgba(255,255,255,0.08)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                    <Radar name="Узбекистан" dataKey="uz" stroke="#00e6c8" fill="#00e6c8" fillOpacity={0.2} />
                    <Radar name="Казахстан" dataKey="kz" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.1} />
                    <Radar name="Мир (ср.)" dataKey="world" stroke="#ffffff" fill="none" strokeDasharray="4 2" />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-col gap-4">
                {[
                  { scenario: 'Базовый', desc: 'Текущий тренд сохраняется', risk: 'medium' as const, impact: '−12% воды к 2030' },
                  { scenario: 'Оптимистичный', desc: 'VODPROM + ADB программы', risk: 'low' as const, impact: '+8% эффективности' },
                  { scenario: 'Стрессовый', desc: 'Засуха 3 года + конфликты', risk: 'high' as const, impact: '−35% водозабор' },
                  { scenario: 'Критический', desc: 'Коллапс трансграничных договоров', risk: 'critical' as const, impact: 'Кризис 2032–2035' },
                ].map(s => (
                  <div key={s.scenario} className="rounded-2xl p-4"
                    style={{ background: 'rgba(0,8,24,0.75)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-semibold text-sm">{s.scenario}</span>
                      <RiskBadge level={s.risk} />
                    </div>
                    <p className="text-white/40 text-xs">{s.desc}</p>
                    <p className="text-white/60 text-xs mt-1 font-mono">{s.impact}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {tab === 'worldbank' && (
          <motion.div key="wb" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <WorldBankPanel />
          </motion.div>
        )}
      </div>
    </div>
  );
}
