import { motion } from 'framer-motion';
import { AlertTriangle, Activity } from 'lucide-react';
import type { FullObjectData, CriticalIssue, IssueUrgency } from '@/types/object-full';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function urgencyConfig(u: IssueUrgency): { color: string; label: string } {
  switch (u) {
    case 'critical': return { color: '#ff4d6d', label: 'Критично' };
    case 'high':     return { color: '#fb923c', label: 'Высокий' };
    case 'medium':   return { color: '#fbbf24', label: 'Средний' };
    case 'low':      return { color: '#4ade80', label: 'Низкий' };
  }
}

function issueTypeLabel(type: CriticalIssue['type']): string {
  const map: Record<CriticalIssue['type'], string> = {
    structural:    'Конструктивный',
    mechanical:    'Механический',
    water_quality: 'Качество воды',
    capacity:      'Производительность',
    ecological:    'Экологический',
  };
  return map[type] ?? type;
}

function fmtUsd(n?: number): string {
  if (!n) return '—';
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n}`;
}

function fmtPop(n?: number): string {
  if (!n) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString('ru');
}

function durationColor(h: number): string {
  if (h < 12) return '#4ade80';
  if (h < 48) return '#fbbf24';
  return '#ff4d6d';
}

// ─── Issue Card ───────────────────────────────────────────────────────────────

function IssueCard({ issue, index }: { issue: CriticalIssue; index: number }) {
  const urg = urgencyConfig(issue.urgency);

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      className="rounded-xl p-4"
      style={{
        background: 'rgba(255,77,109,0.04)',
        border: '1px solid rgba(255,77,109,0.2)',
      }}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle size={15} style={{ color: urg.color, marginTop: 2, flexShrink: 0 }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-2 mb-2">
            <span
              className="px-2 py-0.5 rounded-full text-xs font-bold"
              style={{ background: `${urg.color}18`, color: urg.color, border: `1px solid ${urg.color}30` }}
            >
              {urg.label}
            </span>
            <span
              className="px-2 py-0.5 rounded-full text-xs font-medium"
              style={{ background: 'rgba(0,230,200,0.1)', color: '#00e6c8', border: '1px solid rgba(0,230,200,0.2)' }}
            >
              {issueTypeLabel(issue.type)}
            </span>
            {issue.detected_year && (
              <span className="text-white/25 text-xs">
                Обнаружено в {issue.detected_year} г.
              </span>
            )}
          </div>

          <p className="text-white/80 text-sm leading-relaxed mb-2">{issue.description_ru}</p>

          <div className="flex flex-wrap gap-4">
            {issue.affected_population != null && (
              <div className="flex items-center gap-1.5">
                <span className="text-white/40 text-xs">Затронуто:</span>
                <span className="text-white/70 text-xs font-semibold">{fmtPop(issue.affected_population)} чел.</span>
              </div>
            )}
            {issue.estimated_fix_cost_usd != null && (
              <div className="flex items-center gap-1.5">
                <span className="text-white/40 text-xs">Стоимость устранения:</span>
                <span className="text-[#fbbf24] text-xs font-bold">{fmtUsd(issue.estimated_fix_cost_usd)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProblemsSection({ object }: { object: FullObjectData }) {
  const issues = object.critical_issues ?? [];
  const history = object.failure_history ?? [];

  const criticalAndHigh = issues.filter(i => i.urgency === 'critical' || i.urgency === 'high');
  const totalAffected = criticalAndHigh.reduce((sum, i) => sum + (i.affected_population ?? 0), 0);
  const totalFixCost = issues.reduce((sum, i) => sum + (i.estimated_fix_cost_usd ?? 0), 0);

  if (issues.length === 0 && history.length === 0) {
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
            style={{ background: 'rgba(255,77,109,0.1)', border: '1px solid rgba(255,77,109,0.2)' }}>
            <AlertTriangle size={17} style={{ color: '#ff4d6d' }} />
          </div>
          <h2 className="text-white font-black text-xl">Проблемы и аварии</h2>
        </div>
        <p className="text-white/25 text-sm text-center py-6">Критических проблем и аварий не зафиксировано</p>
      </motion.section>
    );
  }

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
      {/* Section header */}
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(255,77,109,0.1)', border: '1px solid rgba(255,77,109,0.2)' }}
        >
          <AlertTriangle size={17} style={{ color: '#ff4d6d' }} />
        </div>
        <h2 className="text-white font-black text-xl">Проблемы и аварии</h2>
      </div>

      {/* Summary bar */}
      {(criticalAndHigh.length > 0 || totalFixCost > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl p-3" style={{ background: 'rgba(255,77,109,0.08)', border: '1px solid rgba(255,77,109,0.15)' }}>
            <div className="text-white/40 text-xs uppercase tracking-widest mb-1">Критичных/высоких</div>
            <div className="text-[#ff4d6d] font-black text-2xl tabular-nums">{criticalAndHigh.length}</div>
          </div>
          <div className="rounded-xl p-3" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.15)' }}>
            <div className="text-white/40 text-xs uppercase tracking-widest mb-1">Затронуто людей</div>
            <div className="text-[#fbbf24] font-black text-2xl tabular-nums">{fmtPop(totalAffected)}</div>
          </div>
          <div className="rounded-xl p-3" style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.12)' }}>
            <div className="text-white/40 text-xs uppercase tracking-widest mb-1">Общая стоимость</div>
            <div className="text-[#fbbf24] font-black text-2xl tabular-nums">{fmtUsd(totalFixCost)}</div>
          </div>
        </div>
      )}

      {/* Critical issues */}
      {issues.length > 0 && (
        <div>
          <h3 className="text-white/60 text-sm font-semibold uppercase tracking-widest mb-3 flex items-center gap-2">
            <AlertTriangle size={13} style={{ color: '#ff4d6d' }} />
            Критические проблемы
          </h3>
          <div className="space-y-3">
            {issues.map((issue, i) => (
              <IssueCard key={issue.id} issue={issue} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Failure history */}
      {history.length > 0 && (
        <div>
          <h3 className="text-white/60 text-sm font-semibold uppercase tracking-widest mb-3 flex items-center gap-2">
            <Activity size={13} style={{ color: '#60a5fa' }} />
            История аварий
          </h3>

          <div
            className="rounded-xl overflow-hidden"
            style={{ border: '1px solid rgba(255,255,255,0.06)' }}
          >
            {/* Table header */}
            <div
              className="grid text-xs font-semibold uppercase tracking-widest text-white/25 px-4 py-2"
              style={{ background: 'rgba(255,255,255,0.03)', gridTemplateColumns: '90px 1fr 70px 80px 1fr' }}
            >
              <span>Дата</span>
              <span>Тип</span>
              <span>Длит.</span>
              <span>Пострад.</span>
              <span>Причина</span>
            </div>

            {history.map((ev, i) => {
              const dc = durationColor(ev.duration_hours);
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="grid px-4 py-3 text-sm items-center hover:bg-white/[0.02] transition-colors"
                  style={{
                    gridTemplateColumns: '90px 1fr 70px 80px 1fr',
                    background: i % 2 === 0 ? 'rgba(0,0,0,0)' : 'rgba(255,255,255,0.015)',
                    borderTop: '1px solid rgba(255,255,255,0.04)',
                  }}
                >
                  <span className="text-white/40 text-xs tabular-nums">{ev.date}</span>
                  <span className="text-white/75 truncate pr-3">{ev.type_ru}</span>
                  <span className="font-semibold tabular-nums" style={{ color: dc }}>
                    {ev.duration_hours < 24
                      ? `${ev.duration_hours}ч`
                      : `${(ev.duration_hours / 24).toFixed(0)}д`}
                  </span>
                  <span className="text-white/55 tabular-nums text-xs">{fmtPop(ev.affected_population)}</span>
                  <span className="text-white/40 text-xs truncate">{ev.cause_ru}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </motion.section>
  );
}
