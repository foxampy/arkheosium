// ═══════════════════════════════════════════════════════════════
//  FinancialHistorySection — Financial history tab for object detail
// ═══════════════════════════════════════════════════════════════

import { motion } from 'framer-motion';
import {
  DollarSign, TrendingUp, TrendingDown, BarChart2,
  Calendar, Percent, Clock,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
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

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl p-3 text-xs shadow-xl"
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
          <span className="text-white font-bold">{fmtUsd(p.value * 1e6)}</span>
        </div>
      ))}
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  label, value, unit, color, icon: Icon, sub,
}: {
  label: string; value: string; unit?: string; color: string;
  icon: React.ElementType; sub?: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="rounded-xl p-4"
      style={{ background: `${color}08`, border: `1px solid ${color}20` }}
    >
      <Icon size={13} style={{ color }} className="mb-2 opacity-80" />
      <div className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-1 truncate">{label}</div>
      <div className="font-black text-xl tabular-nums leading-tight" style={{ color }}>
        {value}
        {unit && <span className="text-white/30 font-normal text-xs ml-1">{unit}</span>}
      </div>
      {sub && <div className="text-white/25 text-xs mt-0.5">{sub}</div>}
    </motion.div>
  );
}

// ─── Generate mock chart data ─────────────────────────────────────────────────

function buildChartData(object: FullObjectData) {
  const inv = object.investment_proposal;
  if (inv && inv.yearly_projections.length > 0) {
    return inv.yearly_projections.map(y => ({
      year: y.year.toString(),
      'Выручка': +(y.revenue_usd / 1e6).toFixed(2),
      'Расходы': +(y.opex_usd / 1e6).toFixed(2),
      'Прибыль': +(y.net_profit_usd / 1e6).toFixed(2),
    }));
  }

  // Generate synthetic data from available fields
  const baseYear = object.construction_year ?? 2010;
  const years = [];
  const annualRev = (object.annual_revenue_usd ?? 1_200_000) / 1e6;
  const annualOpex = (object.annual_opex_usd ?? 800_000) / 1e6;

  for (let i = 0; i < 8; i++) {
    const y = baseYear + Math.floor(i * 2);
    const growth = 1 + i * 0.05;
    years.push({
      year: y.toString(),
      'Выручка': +(annualRev * growth).toFixed(2),
      'Расходы': +(annualOpex * (1 + i * 0.02)).toFixed(2),
      'Прибыль': +((annualRev * growth - annualOpex * (1 + i * 0.02))).toFixed(2),
    });
  }
  return years;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function FinancialHistorySection({ object }: { object: FullObjectData }) {
  const inv = object.investment_proposal;
  const chartData = buildChartData(object);

  const constructionCost = object.book_value_usd ?? inv?.total_usd;
  const replacementCost = object.replacement_cost_usd;
  const annualOpex = object.annual_opex_usd;
  const annualRev = object.annual_revenue_usd;
  const tariff = object.tariff_usd_per_m3;

  // Inflation-adjusted cost (simple 3% annual estimate)
  const builtYear = object.construction_year ?? 1990;
  const yearsOld = new Date().getFullYear() - builtYear;
  const inflationMultiplier = Math.pow(1.03, yearsOld);
  const adjustedCost = constructionCost ? constructionCost * inflationMultiplier : undefined;

  // Simple payback estimate
  const simplePayback = annualRev && annualOpex && constructionCost
    ? Math.round(constructionCost / Math.max(1, annualRev - annualOpex))
    : undefined;

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl p-6 space-y-6"
      style={{
        background: 'rgba(0,6,20,0.85)',
        border: '1px solid rgba(251,191,36,0.15)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.2)' }}
        >
          <BarChart2 size={17} style={{ color: '#fbbf24' }} />
        </div>
        <h2 className="text-white font-black text-xl">Финансовая история</h2>
      </div>

      {/* Construction cost block */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard
          label="Стоимость строительства"
          value={fmtUsd(constructionCost)}
          color="#fbbf24"
          icon={DollarSign}
          sub={`Год: ${builtYear}`}
        />
        <KpiCard
          label="С учётом инфляции"
          value={fmtUsd(adjustedCost)}
          color="#fb923c"
          icon={TrendingUp}
          sub={`×${inflationMultiplier.toFixed(1)} за ${yearsOld} лет`}
        />
        <KpiCard
          label="Восстановительная стоимость"
          value={fmtUsd(replacementCost)}
          color="#60a5fa"
          icon={DollarSign}
        />
        <KpiCard
          label="Срок окупаемости"
          value={simplePayback ? `${simplePayback}` : '—'}
          unit={simplePayback ? 'лет' : ''}
          color="#a78bfa"
          icon={Clock}
        />
      </div>

      {/* Operational finance row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <KpiCard
          label="Годовые расходы (OpEx)"
          value={fmtUsd(annualOpex)}
          color="#ff4d6d"
          icon={TrendingDown}
        />
        <KpiCard
          label="Годовая выручка"
          value={fmtUsd(annualRev)}
          color="#4ade80"
          icon={TrendingUp}
        />
        <KpiCard
          label="Тариф на воду"
          value={tariff ? `$${tariff.toFixed(2)}` : '—'}
          unit="/ м³"
          color="#00e6c8"
          icon={Percent}
        />
      </div>

      {/* Investment metrics */}
      {inv && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
            label="NPV"
            value={fmtUsd(inv.npv_usd)}
            color="#00e6c8"
            icon={TrendingUp}
          />
          <KpiCard
            label="Горизонт"
            value={`${inv.payback_years}`}
            unit="лет"
            color="#60a5fa"
            icon={Calendar}
          />
        </div>
      )}

      {/* DAO investment available */}
      {inv && (
        <div
          className="rounded-xl p-4 flex items-center justify-between flex-wrap gap-3"
          style={{
            background: 'linear-gradient(135deg, rgba(0,230,200,0.06), rgba(74,222,128,0.04))',
            border: '1px solid rgba(0,230,200,0.15)',
          }}
        >
          <div>
            <div className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-1">
              Доступно для DAO-инвестирования
            </div>
            <div className="text-white font-black text-2xl" style={{ color: '#00e6c8' }}>
              {fmtUsd(inv.total_usd * (inv.equity_pct / 100))}
            </div>
            <div className="text-white/30 text-xs mt-0.5">
              Equity-доля: {inv.equity_pct}% от общего объёма
            </div>
          </div>
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(0,230,200,0.12)', border: '1px solid rgba(0,230,200,0.2)' }}
          >
            <TrendingUp size={20} style={{ color: '#00e6c8' }} />
          </div>
        </div>
      )}

      {/* Area chart */}
      <div>
        <div className="text-white/30 text-xs font-semibold uppercase tracking-widest mb-4">
          Динамика доходов и расходов (млн USD)
        </div>
        <div style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00e6c8" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#00e6c8" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="gradOpex" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fb923c" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#fb923c" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="gradProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4ade80" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#4ade80" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="year"
                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                tickLine={false}
                tickFormatter={(v: number) => `$${v}M`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', paddingTop: 8 }} />
              <Area
                type="monotone"
                dataKey="Выручка"
                stroke="#00e6c8"
                strokeWidth={2}
                fill="url(#gradRevenue)"
              />
              <Area
                type="monotone"
                dataKey="Расходы"
                stroke="#fb923c"
                strokeWidth={1.5}
                fill="url(#gradOpex)"
              />
              <Area
                type="monotone"
                dataKey="Прибыль"
                stroke="#4ade80"
                strokeWidth={2}
                fill="url(#gradProfit)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.section>
  );
}
