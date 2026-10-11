import { motion } from 'framer-motion';
import { Wrench, CheckCircle } from 'lucide-react';
import type { FullObjectData, ModernizationPhase } from '@/types/object-full';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtUsd(n?: number): string {
  if (!n) return '—';
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n}`;
}

function fmtCap(n?: number): string {
  if (!n) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return n.toLocaleString('ru');
}

function priorityConfig(p: 1 | 2 | 3) {
  switch (p) {
    case 1: return { color: '#ff4d6d', label: 'Высокий' };
    case 2: return { color: '#fbbf24', label: 'Средний' };
    case 3: return { color: '#4ade80', label: 'Низкий' };
  }
}

// ─── Timeline Phase ───────────────────────────────────────────────────────────

function PhaseCard({ phase, index, startYear }: { phase: ModernizationPhase; index: number; startYear: number }) {
  const pc = priorityConfig(phase.priority);

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="flex gap-4"
    >
      {/* Timeline indicator */}
      <div className="flex flex-col items-center">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-black text-sm"
          style={{
            background: 'linear-gradient(135deg, rgba(0,230,200,0.2), rgba(96,165,250,0.1))',
            border: '1.5px solid rgba(0,230,200,0.35)',
            color: '#00e6c8',
          }}
        >
          {index + 1}
        </div>
        {/* Connecting line */}
        <div
          className="w-px flex-1 mt-2"
          style={{ background: 'rgba(0,230,200,0.15)', borderLeft: '1px dashed rgba(0,230,200,0.2)' }}
        />
      </div>

      {/* Phase card */}
      <div
        className="flex-1 rounded-2xl p-5 mb-4"
        style={{
          background: 'rgba(0,10,28,0.7)',
          border: '1px solid rgba(0,230,200,0.1)',
        }}
      >
        {/* Card header */}
        <div className="flex items-start justify-between flex-wrap gap-2 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="px-2 py-0.5 rounded-full text-xs font-bold"
                style={{ background: `${pc.color}15`, color: pc.color, border: `1px solid ${pc.color}25` }}
              >
                {pc.label} приоритет
              </span>
              <span className="text-white/25 text-xs">
                с {startYear} г. · {phase.duration_months} мес.
              </span>
            </div>
            <h4 className="text-white font-bold text-base">{phase.name_ru}</h4>
          </div>
          <div className="text-right">
            <div className="text-[#fbbf24] font-black text-xl tabular-nums">{fmtUsd(phase.cost_usd)}</div>
          </div>
        </div>

        {/* Description */}
        <p className="text-white/60 text-sm leading-relaxed mb-3">{phase.description_ru}</p>

        {/* Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
          {phase.capacity_gain_m3_per_day != null && (
            <div className="rounded-lg p-2 text-center" style={{ background: 'rgba(0,230,200,0.06)' }}>
              <div className="text-[#00e6c8] font-bold text-sm tabular-nums">+{fmtCap(phase.capacity_gain_m3_per_day)}</div>
              <div className="text-white/30 text-xs">м³/сут</div>
            </div>
          )}
          {phase.efficiency_gain_pct != null && (
            <div className="rounded-lg p-2 text-center" style={{ background: 'rgba(96,165,250,0.06)' }}>
              <div className="text-[#60a5fa] font-bold text-sm tabular-nums">+{phase.efficiency_gain_pct}%</div>
              <div className="text-white/30 text-xs">эффективность</div>
            </div>
          )}
          {phase.loss_reduction_pct != null && (
            <div className="rounded-lg p-2 text-center" style={{ background: 'rgba(74,222,128,0.06)' }}>
              <div className="text-[#4ade80] font-bold text-sm tabular-nums">-{phase.loss_reduction_pct}%</div>
              <div className="text-white/30 text-xs">потери</div>
            </div>
          )}
          {phase.energy_reduction_pct != null && (
            <div className="rounded-lg p-2 text-center" style={{ background: 'rgba(251,191,36,0.06)' }}>
              <div className="text-[#fbbf24] font-bold text-sm tabular-nums">-{phase.energy_reduction_pct}%</div>
              <div className="text-white/30 text-xs">энергия</div>
            </div>
          )}
        </div>

        {/* Technologies */}
        {phase.technologies.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {phase.technologies.map((t, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-full text-xs"
                style={{
                  background: 'rgba(167,139,250,0.1)',
                  color: '#c4b5fd',
                  border: '1px solid rgba(167,139,250,0.2)',
                }}
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Construction Timeline Bar ────────────────────────────────────────────────

function TimelineBar({
  phases,
  startYear,
}: {
  phases: ModernizationPhase[];
  startYear: number;
}) {
  const colors = ['#00e6c8', '#60a5fa', '#a78bfa', '#fbbf24'];

  // Build cumulative start months
  const bars: { phase: ModernizationPhase; startMonth: number; color: string }[] = [];
  let cumulative = 0;
  phases.forEach((p, i) => {
    bars.push({ phase: p, startMonth: cumulative, color: colors[i % colors.length] });
    cumulative += p.duration_months;
  });
  const totalMonths = cumulative || 1;

  return (
    <div>
      <div className="text-white/30 text-xs font-semibold uppercase tracking-widest mb-3">
        График строительства
      </div>
      <div className="space-y-2">
        {bars.map((bar, i) => {
          const leftPct = (bar.startMonth / totalMonths) * 100;
          const widthPct = (bar.phase.duration_months / totalMonths) * 100;
          const phaseStartYear = startYear + Math.floor(bar.startMonth / 12);

          return (
            <div key={i} className="flex items-center gap-3">
              <span className="text-white/30 text-xs tabular-nums w-12 shrink-0">{phaseStartYear}</span>
              <div className="flex-1 h-6 rounded-lg overflow-hidden relative" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <div
                  className="absolute top-0 h-full rounded-lg flex items-center px-2"
                  style={{
                    left: `${leftPct}%`,
                    width: `${widthPct}%`,
                    background: `${bar.color}25`,
                    border: `1px solid ${bar.color}40`,
                  }}
                >
                  <span className="text-xs font-semibold truncate" style={{ color: bar.color }}>
                    ФАЗА {i + 1} ({bar.phase.duration_months} мес.)
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ModernizationSection({ object }: { object: FullObjectData }) {
  const plan = object.modernization_plan;

  if (!plan) {
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
            style={{ background: 'rgba(0,230,200,0.12)', border: '1px solid rgba(0,230,200,0.2)' }}>
            <Wrench size={17} style={{ color: '#00e6c8' }} />
          </div>
          <h2 className="text-white font-black text-xl">План модернизации</h2>
        </div>
        <p className="text-white/25 text-sm text-center py-6">План модернизации не разработан</p>
      </motion.section>
    );
  }

  const startYear = plan.construction_start_year ?? new Date().getFullYear();

  // Compute cumulative start year for each phase
  let monthOffset = 0;
  const phaseStartYears: number[] = plan.phases.map((p) => {
    const yr = startYear + Math.floor(monthOffset / 12);
    monthOffset += p.duration_months;
    return yr;
  });

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
      <div className="flex items-center flex-wrap gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(0,230,200,0.12)', border: '1px solid rgba(0,230,200,0.2)' }}
        >
          <Wrench size={17} style={{ color: '#00e6c8' }} />
        </div>
        <h2 className="text-white font-black text-xl flex-1">План модернизации</h2>
        <span
          className="px-4 py-1.5 rounded-full font-bold text-sm"
          style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' }}
        >
          {fmtUsd(plan.total_investment_usd)}
        </span>
      </div>

      {/* Expected improvements */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <motion.div whileHover={{ y: -4 }} className="rounded-xl p-4"
          style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.15)' }}>
          <CheckCircle size={14} style={{ color: '#4ade80' }} className="mb-2" />
          <div className="text-white/40 text-xs uppercase tracking-widest mb-1">Мощность после</div>
          <div className="text-[#4ade80] font-black text-xl tabular-nums">
            {fmtCap(plan.expected_capacity_m3_per_day)}
            <span className="text-white/30 font-normal text-xs ml-1">м³/сут</span>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -4 }} className="rounded-xl p-4"
          style={{ background: 'rgba(0,230,200,0.08)', border: '1px solid rgba(0,230,200,0.15)' }}>
          <CheckCircle size={14} style={{ color: '#00e6c8' }} className="mb-2" />
          <div className="text-white/40 text-xs uppercase tracking-widest mb-1">Потери снизятся</div>
          <div className="text-[#00e6c8] font-black text-xl tabular-nums">
            -{plan.expected_loss_reduction_pct}
            <span className="text-white/30 font-normal text-xs ml-0.5">%</span>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -4 }} className="rounded-xl p-4"
          style={{ background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.15)' }}>
          <CheckCircle size={14} style={{ color: '#60a5fa' }} className="mb-2" />
          <div className="text-white/40 text-xs uppercase tracking-widest mb-1">Эффективность</div>
          <div className="text-[#60a5fa] font-black text-xl tabular-nums">
            +{plan.expected_efficiency_gain_pct}
            <span className="text-white/30 font-normal text-xs ml-0.5">%</span>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -4 }} className="rounded-xl p-4"
          style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.15)' }}>
          <CheckCircle size={14} style={{ color: '#fbbf24' }} className="mb-2" />
          <div className="text-white/40 text-xs uppercase tracking-widest mb-1">Ввод в эксплуатацию</div>
          <div className="text-[#fbbf24] font-black text-xl tabular-nums">
            {plan.commissioning_year ?? '—'}
          </div>
        </motion.div>
      </div>

      {/* Timeline */}
      {plan.phases.length > 0 && (
        <div>
          <div className="text-white/30 text-xs font-semibold uppercase tracking-widest mb-4">
            Фазы реализации
          </div>
          <div>
            {plan.phases.map((phase, i) => (
              <PhaseCard key={phase.id} phase={phase} index={i} startYear={phaseStartYears[i]} />
            ))}
          </div>
        </div>
      )}

      {/* Construction bar */}
      {plan.phases.length > 0 && (
        <div
          className="rounded-xl p-4"
          style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          <TimelineBar phases={plan.phases} startYear={startYear} />
        </div>
      )}

      {/* Notes */}
      {plan.notes_ru && (
        <p className="text-white/40 text-sm leading-relaxed italic">{plan.notes_ru}</p>
      )}
    </motion.section>
  );
}
