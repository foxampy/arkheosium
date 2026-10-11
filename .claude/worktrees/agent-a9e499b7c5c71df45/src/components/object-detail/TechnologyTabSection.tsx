// ═══════════════════════════════════════════════════════════════
//  TechnologyTabSection — Technology & modernization tab
// ═══════════════════════════════════════════════════════════════

import { motion } from 'framer-motion';
import {
  Cpu, Zap, Wifi, Shield, BarChart2, Thermometer,
  CheckCircle2, Clock, Settings, Wrench,
} from 'lucide-react';
import type { FullObjectData, ModernizationPhase } from '@/types/object-full';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtUsd(n?: number): string {
  if (!n) return '—';
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n}`;
}

// ─── Technology badge ──────────────────────────────────────────────────────────

function TechBadge({ name, color = '#00e6c8' }: { name: string; color?: string }) {
  return (
    <span
      className="px-3 py-1.5 rounded-xl text-xs font-semibold"
      style={{
        background: `${color}10`,
        color,
        border: `1px solid ${color}25`,
      }}
    >
      {name}
    </span>
  );
}

// ─── Timeline phase card ──────────────────────────────────────────────────────

function PhaseCard({
  phase,
  index,
  startYear,
  isLast,
}: {
  phase: ModernizationPhase;
  index: number;
  startYear: number;
  isLast: boolean;
}) {
  const priorityColors = {
    1: { color: '#ff4d6d', label: 'Высокий' },
    2: { color: '#fbbf24', label: 'Средний' },
    3: { color: '#4ade80', label: 'Низкий' },
  };
  const pc = priorityColors[phase.priority as 1 | 2 | 3] ?? priorityColors[3];
  const phaseYear = startYear + index;

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="flex gap-4"
    >
      {/* Timeline node */}
      <div className="flex flex-col items-center shrink-0">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm z-10"
          style={{
            background: 'linear-gradient(135deg, rgba(0,230,200,0.2), rgba(96,165,250,0.1))',
            border: `1.5px solid rgba(0,230,200,0.4)`,
            color: '#00e6c8',
          }}
        >
          {index + 1}
        </div>
        {!isLast && (
          <div className="w-px flex-1 mt-1" style={{ background: 'rgba(0,230,200,0.12)', minHeight: 24 }} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-6 min-w-0">
        <div className="rounded-xl p-4" style={{ background: 'rgba(0,230,200,0.03)', border: '1px solid rgba(0,230,200,0.1)' }}>
          <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
            <div>
              <span className="text-white/35 text-xs font-semibold mb-0.5 block">{phaseYear} г.</span>
              <h4 className="text-white font-bold text-sm leading-snug">{phase.name_ru}</h4>
            </div>
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0"
              style={{ background: `${pc.color}12`, color: pc.color, border: `1px solid ${pc.color}20` }}
            >
              {pc.label} приоритет
            </span>
          </div>

          <p className="text-white/50 text-xs leading-relaxed mb-3">{phase.description_ru}</p>

          {/* Stats mini-row */}
          <div className="flex flex-wrap gap-3 text-xs mb-3">
            <span className="flex items-center gap-1 text-white/40">
              <Clock size={10} />
              {phase.duration_months} мес.
            </span>
            <span className="flex items-center gap-1" style={{ color: '#fbbf24' }}>
              ${fmtUsd(phase.cost_usd)}
            </span>
            {phase.efficiency_gain_pct && (
              <span className="flex items-center gap-1" style={{ color: '#4ade80' }}>
                +{phase.efficiency_gain_pct}% КПД
              </span>
            )}
            {phase.energy_reduction_pct && (
              <span className="flex items-center gap-1" style={{ color: '#00e6c8' }}>
                -{phase.energy_reduction_pct}% энергии
              </span>
            )}
          </div>

          {/* Technologies */}
          {phase.technologies && phase.technologies.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {phase.technologies.map(tech => (
                <TechBadge key={tech} name={tech} color="#60a5fa" />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Metric row ───────────────────────────────────────────────────────────────

function MetricRow({ label, value, color = '#00e6c8', progress }: {
  label: string; value: string; color?: string; progress?: number;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-white/50 text-xs">{label}</span>
        <span className="text-xs font-bold tabular-nums" style={{ color }}>{value}</span>
      </div>
      {progress !== undefined && (
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${Math.min(100, progress)}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ background: color }}
          />
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TechnologyTabSection({ object }: { object: FullObjectData }) {
  const mod = object.modernization_plan;

  // Default technologies based on automation level
  const automationLevel = object.automation_level_pct ?? 0;
  const currentTechs = [
    automationLevel >= 30 && 'SCADA',
    automationLevel >= 50 && 'IoT-датчики',
    automationLevel >= 70 && 'AI-аналитика',
    object.meets_who_standards && 'WHO-стандарты',
    'Телеметрия',
    'АСУТП',
  ].filter(Boolean) as string[];

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl p-6 space-y-6"
      style={{
        background: 'rgba(0,6,20,0.85)',
        border: '1px solid rgba(96,165,250,0.15)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)' }}
        >
          <Cpu size={17} style={{ color: '#60a5fa' }} />
        </div>
        <h2 className="text-white font-black text-xl">Технологии</h2>
      </div>

      {/* Current technologies */}
      <div>
        <div className="text-white/30 text-xs font-semibold uppercase tracking-widest mb-3">
          Текущие технологии
        </div>
        <div className="flex flex-wrap gap-2">
          {currentTechs.map(tech => (
            <TechBadge key={tech} name={tech} color="#60a5fa" />
          ))}
          {currentTechs.length === 0 && (
            <span className="text-white/25 text-sm">Данные не указаны</span>
          )}
        </div>
      </div>

      {/* Efficiency metrics */}
      <div
        className="rounded-xl p-4 space-y-4"
        style={{ background: 'rgba(0,230,200,0.03)', border: '1px solid rgba(0,230,200,0.08)' }}
      >
        <div className="flex items-center gap-2 mb-1">
          <BarChart2 size={13} style={{ color: '#00e6c8' }} />
          <span className="text-white/40 text-xs font-semibold uppercase tracking-widest">
            Технические показатели
          </span>
        </div>

        <MetricRow
          label="Уровень автоматизации"
          value={object.automation_level_pct != null ? `${object.automation_level_pct}%` : '—'}
          color="#60a5fa"
          progress={object.automation_level_pct}
        />
        <MetricRow
          label="Потери воды"
          value={object.water_loss_pct != null ? `${object.water_loss_pct}%` : '—'}
          color={object.water_loss_pct && object.water_loss_pct > 20 ? '#ff4d6d' : '#fbbf24'}
          progress={object.water_loss_pct}
        />
        <MetricRow
          label="Износ оборудования"
          value={object.wear_pct != null ? `${object.wear_pct}%` : '—'}
          color={object.wear_pct && object.wear_pct > 60 ? '#ff4d6d' : '#fbbf24'}
          progress={object.wear_pct}
        />
        <MetricRow
          label="Удельное энергопотребление"
          value={object.energy_kwh_per_m3 != null ? `${object.energy_kwh_per_m3} кВт·ч/м³` : '—'}
          color="#a78bfa"
        />
      </div>

      {/* Water quality metrics */}
      <div
        className="rounded-xl p-4 space-y-3"
        style={{ background: 'rgba(74,222,128,0.03)', border: '1px solid rgba(74,222,128,0.08)' }}
      >
        <div className="flex items-center gap-2 mb-1">
          <Thermometer size={13} style={{ color: '#4ade80' }} />
          <span className="text-white/40 text-xs font-semibold uppercase tracking-widest">
            Качество воды
          </span>
          {object.meets_who_standards && (
            <span className="flex items-center gap-1 text-xs ml-auto" style={{ color: '#4ade80' }}>
              <CheckCircle2 size={10} />
              ВОЗ
            </span>
          )}
        </div>

        <MetricRow
          label="Индекс качества"
          value={object.quality_index != null ? `${object.quality_index}/100` : '—'}
          color={object.quality_index && object.quality_index >= 80 ? '#4ade80' : '#fbbf24'}
          progress={object.quality_index}
        />
        {object.ph_level && (
          <MetricRow
            label="pH"
            value={`${object.ph_level}`}
            color={object.ph_level >= 6.5 && object.ph_level <= 8.5 ? '#4ade80' : '#ff4d6d'}
          />
        )}
        {object.turbidity_ntu && (
          <MetricRow
            label="Мутность"
            value={`${object.turbidity_ntu} NTU`}
            color={object.turbidity_ntu <= 1 ? '#4ade80' : '#fbbf24'}
          />
        )}
        {object.nitrate_mg_per_l && (
          <MetricRow
            label="Нитраты"
            value={`${object.nitrate_mg_per_l} мг/л`}
            color={object.nitrate_mg_per_l <= 10 ? '#4ade80' : '#ff4d6d'}
          />
        )}
      </div>

      {/* Modernization timeline */}
      {mod && mod.phases.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Wrench size={13} style={{ color: '#a78bfa' }} />
            <span className="text-white/30 text-xs font-semibold uppercase tracking-widest">
              История и план модернизации
            </span>
          </div>
          <div>
            {mod.phases.map((phase, idx) => (
              <PhaseCard
                key={phase.id}
                phase={phase}
                index={idx}
                startYear={mod.construction_start_year ?? new Date().getFullYear()}
                isLast={idx === mod.phases.length - 1}
              />
            ))}
          </div>

          {/* Summary */}
          <div
            className="rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2"
            style={{ background: 'rgba(0,230,200,0.04)', border: '1px solid rgba(0,230,200,0.1)' }}
          >
            <div>
              <div className="text-white/30 text-xs mb-0.5">Общий бюджет</div>
              <div className="font-black text-sm" style={{ color: '#fbbf24' }}>
                {fmtUsd(mod.total_investment_usd)}
              </div>
            </div>
            <div>
              <div className="text-white/30 text-xs mb-0.5">Прирост мощности</div>
              <div className="font-black text-sm" style={{ color: '#4ade80' }}>
                +{mod.expected_efficiency_gain_pct}%
              </div>
            </div>
            <div>
              <div className="text-white/30 text-xs mb-0.5">Снижение потерь</div>
              <div className="font-black text-sm" style={{ color: '#00e6c8' }}>
                -{mod.expected_loss_reduction_pct}%
              </div>
            </div>
            {mod.expected_energy_reduction_pct && (
              <div>
                <div className="text-white/30 text-xs mb-0.5">Экономия энергии</div>
                <div className="font-black text-sm" style={{ color: '#a78bfa' }}>
                  -{mod.expected_energy_reduction_pct}%
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {!mod && (
        <div className="text-center py-4 text-white/20 text-sm">
          <Settings size={24} className="mx-auto mb-2 opacity-30" />
          План модернизации не добавлен
        </div>
      )}
    </motion.section>
  );
}
