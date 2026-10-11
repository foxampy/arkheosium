import { motion } from 'framer-motion';
import {
  TrendingUp, Users, Briefcase, Leaf, Heart,
  DollarSign, HardHat,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Legend,
} from 'recharts';
import type { FullObjectData } from '@/types/object-full';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtUsd(n?: number): string {
  if (!n) return '—';
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n}`;
}

function irrColor(pct?: number): string {
  if (!pct) return '#60a5fa';
  if (pct > 12) return '#4ade80';
  if (pct > 8) return '#fbbf24';
  return '#ff4d6d';
}

function fmtPop(n?: number): string {
  if (!n) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString('ru');
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl p-3 text-xs"
      style={{
        background: 'rgba(0,6,20,0.97)',
        border: '1px solid rgba(0,230,200,0.2)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="text-white/60 mb-2 font-semibold">{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-white/60">{p.name}:</span>
          <span className="text-white font-bold">{fmtUsd(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  unit,
  color,
  icon: Icon,
}: {
  label: string;
  value: string;
  unit?: string;
  color: string;
  icon: React.ElementType;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="rounded-xl p-4"
      style={{
        background: `${color}08`,
        border: `1px solid ${color}20`,
      }}
    >
      <Icon size={14} style={{ color }} className="mb-2 opacity-80" />
      <div className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-1">{label}</div>
      <div className="font-black text-xl tabular-nums leading-tight" style={{ color }}>
        {value}
        {unit && <span className="text-white/30 font-normal text-xs ml-1">{unit}</span>}
      </div>
    </motion.div>
  );
}

// ─── Impact Card ──────────────────────────────────────────────────────────────

function ImpactCard({
  label,
  value,
  color,
  icon: Icon,
}: {
  label: string;
  value: string;
  color: string;
  icon: React.ElementType;
}) {
  return (
    <div
      className="rounded-xl p-3 flex items-center gap-3"
      style={{ background: `${color}08`, border: `1px solid ${color}15` }}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: `${color}15` }}
      >
        <Icon size={16} style={{ color }} />
      </div>
      <div>
        <div className="text-white/40 text-xs mb-0.5">{label}</div>
        <div className="font-bold text-sm tabular-nums" style={{ color }}>{value}</div>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function InvestmentSection({ object }: { object: FullObjectData }) {
  const inv = object.investment_proposal;

  if (!inv) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-2xl p-6"
        style={{
          background: 'rgba(0,6,20,0.85)',
          border: '1px solid rgba(0,230,200,0.15)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.2)' }}>
            <DollarSign size={17} style={{ color: '#fbbf24' }} />
          </div>
          <h2 className="text-white font-black text-xl">Инвестиционное предложение</h2>
        </div>
        <p className="text-white/25 text-sm text-center py-6">Инвестиционное предложение не подготовлено</p>
      </motion.section>
    );
  }

  // Build chart data (M USD)
  const chartData = inv.yearly_projections.map((y) => ({
    year: y.year.toString(),
    'Выручка': +(y.revenue_usd / 1e6).toFixed(2),
    'OpEx': +(y.opex_usd / 1e6).toFixed(2),
    'Прибыль': +(y.net_profit_usd / 1e6).toFixed(2),
  }));

  // Funding structure
  const totalFunding = inv.total_usd;
  const equityW = inv.equity_pct;
  const debtW = inv.debt_pct;
  const grantW = inv.grant_pct ?? 0;

  const si = inv.social_impact;

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl p-6 space-y-6"
      style={{
        background: 'rgba(0,6,20,0.85)',
        border: '1px solid rgba(0,230,200,0.15)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.2)' }}
        >
          <DollarSign size={17} style={{ color: '#fbbf24' }} />
        </div>
        <h2 className="text-white font-black text-xl">Инвестиционное предложение</h2>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <KpiCard
          label="Объём инвестиций"
          value={fmtUsd(inv.total_usd)}
          color="#fbbf24"
          icon={DollarSign}
        />
        <KpiCard
          label="IRR"
          value={`${inv.irr_pct}%`}
          color={irrColor(inv.irr_pct)}
          icon={TrendingUp}
        />
        <KpiCard
          label="Срок окупаемости"
          value={`${inv.payback_years}`}
          unit="лет"
          color="#60a5fa"
          icon={Briefcase}
        />
        <KpiCard
          label="NPV"
          value={fmtUsd(inv.npv_usd)}
          color="#00e6c8"
          icon={TrendingUp}
        />
        <KpiCard
          label="Горизонт"
          value={`${inv.horizon_years}`}
          unit="лет"
          color="#a78bfa"
          icon={TrendingUp}
        />
      </div>

      {/* Funding structure */}
      <div>
        <div className="text-white/30 text-xs font-semibold uppercase tracking-widest mb-3">
          Структура финансирования
        </div>

        {/* Stacked bar */}
        <div className="h-8 rounded-xl overflow-hidden flex mb-3">
          {equityW > 0 && (
            <div
              className="flex items-center justify-center text-xs font-bold"
              style={{ width: `${equityW}%`, background: '#4ade8040', color: '#4ade80', borderRight: '1px solid rgba(0,0,0,0.3)' }}
            >
              {equityW}%
            </div>
          )}
          {debtW > 0 && (
            <div
              className="flex items-center justify-center text-xs font-bold"
              style={{ width: `${debtW}%`, background: '#60a5fa35', color: '#60a5fa', borderRight: '1px solid rgba(0,0,0,0.3)' }}
            >
              {debtW}%
            </div>
          )}
          {grantW > 0 && (
            <div
              className="flex items-center justify-center text-xs font-bold"
              style={{ width: `${grantW}%`, background: '#fbbf2435', color: '#fbbf24' }}
            >
              {grantW}%
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-sm">
          {equityW > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ background: '#4ade80' }} />
              <span className="text-white/60">Собственный капитал</span>
              <span className="text-[#4ade80] font-bold">{fmtUsd(totalFunding * equityW / 100)}</span>
            </div>
          )}
          {debtW > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ background: '#60a5fa' }} />
              <span className="text-white/60">Заёмные средства</span>
              <span className="text-[#60a5fa] font-bold">{fmtUsd(totalFunding * debtW / 100)}</span>
            </div>
          )}
          {grantW > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ background: '#fbbf24' }} />
              <span className="text-white/60">Гранты/субсидии</span>
              <span className="text-[#fbbf24] font-bold">{fmtUsd(totalFunding * grantW / 100)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Yearly projections chart */}
      {chartData.length > 0 && (
        <div>
          <div className="text-white/30 text-xs font-semibold uppercase tracking-widest mb-4">
            Финансовые прогнозы (млн USD)
          </div>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="year"
                  tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                  tickLine={false}
                  tickFormatter={(v: number) => `$${v}M`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', paddingTop: 8 }}
                />
                <Bar dataKey="Выручка" fill="#00e6c840" stroke="#00e6c8" strokeWidth={0.5} radius={[3, 3, 0, 0]} />
                <Bar dataKey="OpEx" fill="#fb923c35" stroke="#fb923c" strokeWidth={0.5} radius={[3, 3, 0, 0]} />
                <Line
                  type="monotone"
                  dataKey="Прибыль"
                  stroke="#4ade80"
                  strokeWidth={2}
                  dot={{ fill: '#4ade80', r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Social impact */}
      {si && (
        <div>
          <div className="text-white/30 text-xs font-semibold uppercase tracking-widest mb-3">
            Социальный эффект
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <ImpactCard
              label="Получат доступ к воде"
              value={fmtPop(si.people_gaining_water) + ' чел.'}
              color="#00e6c8"
              icon={Users}
            />
            <ImpactCard
              label="Рабочие места (строит.)"
              value={fmtPop(si.jobs_construction) + ' чел.'}
              color="#fbbf24"
              icon={HardHat}
            />
            <ImpactCard
              label="Постоянные рабочие места"
              value={fmtPop(si.jobs_permanent) + ' чел.'}
              color="#4ade80"
              icon={Briefcase}
            />
            <ImpactCard
              label="Снижение заболеваний"
              value={`-${si.water_diseases_reduction_pct}%`}
              color="#f472b6"
              icon={Heart}
            />
            <ImpactCard
              label="Снижение CO₂"
              value={
                si.co2_reduction_kg_per_year >= 1e6
                  ? `${(si.co2_reduction_kg_per_year / 1e6).toFixed(1)}K т/г`
                  : `${(si.co2_reduction_kg_per_year / 1e3).toFixed(0)} т/г`
              }
              color="#4ade80"
              icon={Leaf}
            />
            {si.gdp_multiplier_usd != null && (
              <ImpactCard
                label="Мультипликатор ВВП"
                value={fmtUsd(si.gdp_multiplier_usd)}
                color="#a78bfa"
                icon={TrendingUp}
              />
            )}
          </div>
        </div>
      )}
    </motion.section>
  );
}
