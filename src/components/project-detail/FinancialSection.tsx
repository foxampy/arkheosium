import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, DollarSign, BarChart2, Activity, Clock, Calendar,
  Building2, FileText, Zap, Shield,
} from 'lucide-react';
import type { ProjectData } from '@/data/projects/types';

// ─── Icon resolver ────────────────────────────────────────────
const ICON_MAP: Record<string, React.ElementType> = {
  TrendingUp, DollarSign, BarChart2, Activity, Clock, Calendar,
  Building2, FileText, Zap, Shield,
};

function resolveIcon(name?: string): React.ElementType {
  return (name && ICON_MAP[name]) ? ICON_MAP[name] : DollarSign;
}

// ─── Section title ────────────────────────────────────────────
function SectionTitle({
  icon: Icon,
  title,
  subtitle,
  color = '#00e6c8',
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  color?: string;
}) {
  return (
    <div className="flex items-start gap-3 mb-6">
      <div
        className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
        style={{ background: `${color}15`, border: `1px solid ${color}30` }}
      >
        <Icon size={18} style={{ color }} />
      </div>
      <div>
        <h2 className="text-white font-black text-xl leading-tight">{title}</h2>
        {subtitle && <p className="text-white/40 text-sm mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

// ─── Animated bar ─────────────────────────────────────────────
function AnimatedBar({
  label,
  min,
  max,
  color,
  icon,
  totalMax,
}: {
  label: string;
  min: number;
  max: number;
  color: string;
  icon?: string;
  totalMax: number;
}) {
  const Icon = resolveIcon(icon);
  const pct = Math.round((max / totalMax) * 100);
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <Icon size={13} style={{ color }} />
          <span className="text-white/70 text-xs">{label}</span>
        </div>
        <span className="text-xs font-bold" style={{ color }}>
          ${min}M – ${max}M
        </span>
      </div>
      <div
        className="h-2 rounded-full overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.05)' }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: 'easeOut', delay: 0.2 }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}, ${color}aa)` }}
        />
      </div>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────
interface FinancialSectionProps {
  project: ProjectData;
}

// ─── Component ───────────────────────────────────────────────
export default function FinancialSection({ project }: FinancialSectionProps) {
  const { financials } = project;

  const totalMax = financials.investmentBreakdown.reduce((a, b) => a + b.max, 0);

  // Compute cumulative profit for the table
  let cumulative = 0;
  const projections = financials.yearlyProjections.map((row) => {
    cumulative += row.netProfit;
    return { ...row, cumulative: +cumulative.toFixed(1) };
  });

  const totalRevenue = financials.yearlyProjections.reduce((a, b) => a + b.revenue, 0);
  const totalCosts = financials.yearlyProjections.reduce((a, b) => a + b.costs, 0);
  const totalNetProfit = financials.yearlyProjections.reduce((a, b) => a + b.netProfit, 0);

  // KPI cards data
  const kpiCards = [
    { label: 'Среднегодовая выручка', value: financials.avgRevenue, color: '#4ade80', icon: 'TrendingUp' },
    { label: 'Среднегодовая чистая прибыль', value: financials.avgProfit, color: '#00e6c8', icon: 'DollarSign' },
    { label: 'Рентабельность', value: financials.margin, color: '#a78bfa', icon: 'BarChart2' },
    { label: 'Точка безубыточности', value: financials.breakEven, color: '#fbbf24', icon: 'Activity' },
    { label: 'Срок окупаемости', value: financials.payback, color: '#fb923c', icon: 'Clock' },
    { label: 'Горизонт проекта', value: financials.horizon, color: '#60a5fa', icon: 'Calendar' },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
    >
      <SectionTitle
        icon={TrendingUp}
        title="Финансовая модель"
        subtitle="Ключевые показатели, структура финансирования и прогноз доходов"
        color="#4ade80"
      />

      {/* KPI grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {kpiCards.map((card, i) => {
          const Icon = resolveIcon(card.icon);
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.04 }}
              className="rounded-2xl p-4"
              style={{ background: `${card.color}08`, border: `1px solid ${card.color}20` }}
            >
              <Icon size={14} style={{ color: card.color }} className="mb-2" />
              <div className="text-white/40 text-xs mb-1">{card.label}</div>
              <div className="font-black text-lg leading-tight" style={{ color: card.color }}>
                {card.value}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Financing split + investment breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* Financing split */}
        <div
          className="rounded-2xl p-5"
          style={{ background: 'rgba(0,6,20,0.8)', border: '1px solid rgba(0,230,200,0.12)' }}
        >
          <h4 className="text-white/70 text-sm font-bold mb-4">Структура финансирования</h4>

          <div className="flex items-end gap-2 mb-3">
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-white/50">Привлечённое финансирование</span>
                <span className="font-bold" style={{ color: '#00e6c8' }}>
                  {financials.attractedPct}% ({financials.attractedAmt})
                </span>
              </div>
              <div
                className="h-3 rounded-full overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${financials.attractedPct}%` }}
                  transition={{ duration: 0.9, ease: 'easeOut', delay: 0.3 }}
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg,#00e6c8,#60a5fa)' }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-white/50">Собственный капитал</span>
                <span className="font-bold" style={{ color: '#fbbf24' }}>
                  {financials.equityPct}% ({financials.equityAmt})
                </span>
              </div>
              <div
                className="h-3 rounded-full overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${financials.equityPct}%` }}
                  transition={{ duration: 0.9, ease: 'easeOut', delay: 0.4 }}
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg,#fbbf24,#fb923c)' }}
                />
              </div>
            </div>
          </div>

          {/* Visual donut-like summary */}
          <div className="mt-4 flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-xs font-black shrink-0"
              style={{
                background: `conic-gradient(#00e6c8 0% ${financials.attractedPct}%, #fbbf24 ${financials.attractedPct}% 100%)`,
              }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(0,6,20,0.95)' }}
              >
                <span className="text-[9px] text-white/60 font-bold">80/20</span>
              </div>
            </div>
            <p className="text-white/35 text-xs leading-relaxed">
              Привлечённые средства составляют 80% от общего объёма инвестиций
            </p>
          </div>
        </div>

        {/* Investment breakdown */}
        <div
          className="rounded-2xl p-5"
          style={{ background: 'rgba(0,6,20,0.8)', border: '1px solid rgba(0,230,200,0.12)' }}
        >
          <h4 className="text-white/70 text-sm font-bold mb-4">Структура инвестиций ($M)</h4>
          {financials.investmentBreakdown.map((item) => (
            <AnimatedBar
              key={item.label}
              label={item.label}
              min={item.min}
              max={item.max}
              color={item.color}
              icon={item.icon}
              totalMax={totalMax}
            />
          ))}
          <div className="flex justify-between pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <span className="text-white/40 text-xs">Итого (диапазон)</span>
            <span className="text-white font-bold text-xs">
              ${financials.investmentBreakdown.reduce((a, b) => a + b.min, 0).toFixed(1)}M –{' '}
              ${totalMax.toFixed(1)}M
            </span>
          </div>
        </div>
      </div>

      {/* Year-by-year projection table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(0,6,20,0.8)', border: '1px solid rgba(0,230,200,0.12)' }}
      >
        <div className="px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <h4 className="text-white font-bold text-sm">Прогноз доходов по годам</h4>
          <p className="text-white/35 text-xs mt-0.5">Все значения в $M</p>
        </div>

        <div className="overflow-x-auto">
          <div className="max-h-64 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0" style={{ background: 'rgba(0,8,24,0.98)' }}>
                <tr>
                  {['Год', 'Загрузка', 'Выручка $M', 'Затраты $M', 'Чист. прибыль $M', 'Накоп. прибыль $M', 'Примечание'].map(
                    (col) => (
                      <th
                        key={col}
                        className="px-3 py-2.5 text-left font-semibold text-white/40 whitespace-nowrap"
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                      >
                        {col}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {projections.map((row, idx) => {
                  const isStartup = idx === 0;
                  const isTransfer = row.note === 'Передача актива';
                  return (
                    <tr
                      key={row.year}
                      style={{
                        background: isStartup
                          ? 'rgba(251,191,36,0.04)'
                          : isTransfer
                          ? 'rgba(96,165,250,0.04)'
                          : idx % 2 === 0
                          ? 'rgba(0,0,0,0.25)'
                          : 'transparent',
                      }}
                    >
                      <td className="px-3 py-2 font-bold" style={{ color: isStartup ? '#fbbf24' : 'rgba(255,255,255,0.8)' }}>
                        {row.year}
                      </td>
                      <td className="px-3 py-2 text-white/55">{row.capacity}</td>
                      <td className="px-3 py-2 text-white/70">{row.revenue.toFixed(1)}</td>
                      <td className="px-3 py-2 text-white/55">{row.costs.toFixed(1)}</td>
                      <td
                        className="px-3 py-2 font-bold"
                        style={{ color: isStartup ? '#fbbf24' : '#4ade80' }}
                      >
                        {row.netProfit.toFixed(1)}
                      </td>
                      <td className="px-3 py-2" style={{ color: '#00e6c8' }}>
                        {row.cumulative.toFixed(1)}
                      </td>
                      <td className="px-3 py-2">
                        {row.note ? (
                          <span
                            className="px-2 py-0.5 rounded-full text-[9px] font-bold"
                            style={{
                              background: isStartup ? 'rgba(251,191,36,0.15)' : 'rgba(96,165,250,0.15)',
                              color: isStartup ? '#fbbf24' : '#60a5fa',
                            }}
                          >
                            {row.note}
                          </span>
                        ) : (
                          <span className="text-white/20">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ background: 'rgba(0,230,200,0.05)', borderTop: '1px solid rgba(0,230,200,0.15)' }}>
                  <td className="px-3 py-2.5 font-black text-white/80" colSpan={2}>
                    Итого
                  </td>
                  <td className="px-3 py-2.5 font-bold" style={{ color: '#4ade80' }}>
                    {totalRevenue.toFixed(1)}
                  </td>
                  <td className="px-3 py-2.5 font-bold text-white/60">
                    {totalCosts.toFixed(1)}
                  </td>
                  <td className="px-3 py-2.5 font-bold" style={{ color: '#4ade80' }}>
                    {totalNetProfit.toFixed(1)}
                  </td>
                  <td className="px-3 py-2.5 font-bold" style={{ color: '#00e6c8' }}>
                    {projections[projections.length - 1]?.cumulative.toFixed(1)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
