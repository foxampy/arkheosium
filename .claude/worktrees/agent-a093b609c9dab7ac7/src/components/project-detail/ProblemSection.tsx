// ═══════════════════════════════════════════════════════════════
//  ProblemSection — Before / After water crisis visualization
// ═══════════════════════════════════════════════════════════════
import React from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle, CheckCircle, Droplets, Activity,
  Users, Clock, TrendingDown, TrendingUp, ArrowRight,
} from 'lucide-react';
import { ProjectData } from '@/data/projects/types';

interface Props {
  project: ProjectData;
}

// ─── Parse numeric value from string like "62%" → 62 ──────────
function parseNum(val: string): number {
  const n = parseFloat(val.replace(/[^0-9.]/g, ''));
  return isNaN(n) ? 0 : n;
}

// ─── Stat icon mapping ────────────────────────────────────────
const STAT_ICONS: Record<string, React.ElementType> = {
  Droplets, Activity, AlertTriangle, Users, Clock, TrendingDown, TrendingUp,
};
function getIcon(name: string): React.ElementType {
  return STAT_ICONS[name] ?? AlertTriangle;
}

// ─── Crisis stat bar (current situation) ─────────────────────
function CrisisBar({
  label, current, target, unit, color, icon, index,
}: {
  label: string; current: string; target: string; unit: string;
  color: string; icon: string; index: number;
}) {
  const Icon = getIcon(icon);
  const currentNum = parseNum(current);
  const targetNum = parseNum(target);
  const max = Math.max(currentNum, targetNum, 1);
  const currentPct = Math.round((currentNum / max) * 100);
  const targetPct = Math.round((targetNum / max) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.07 }}
      className="rounded-xl p-3"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}18` }}
        >
          <Icon size={11} style={{ color }} />
        </div>
        <span className="text-white/55 text-xs">{label}</span>
      </div>

      {/* Current vs target bar */}
      <div className="space-y-1.5">
        {/* Current */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-[10px] text-white/30">Сейчас</span>
            <span className="text-xs font-black" style={{ color }}>{current}{unit}</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${color}, ${color}80)` }}
              initial={{ width: 0 }}
              animate={{ width: `${currentPct}%` }}
              transition={{ delay: 0.4 + index * 0.08, duration: 0.7 }}
            />
          </div>
        </div>

        {/* Target */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-[10px] text-white/30">Цель</span>
            <span className="text-xs font-semibold text-emerald-400">{target}{unit}</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #4ade80, #22c55e)' }}
              initial={{ width: 0 }}
              animate={{ width: `${targetPct}%` }}
              transition={{ delay: 0.5 + index * 0.08, duration: 0.7 }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export const ProblemSection: React.FC<Props> = ({ project }) => {
  const stats = project.problemStats;

  return (
    <div className="space-y-5">
      {/* Section title */}
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}
        >
          <AlertTriangle size={18} style={{ color: '#ef4444' }} />
        </div>
        <div>
          <h2 className="text-white font-bold text-base leading-none">Проблема — водный кризис региона</h2>
          <p className="text-white/35 text-xs mt-0.5">Сырдарьинская область · Текущая ситуация</p>
        </div>
      </div>

      {/* Main 2-column grid */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-start">

        {/* Left: СЕЙЧАС panel */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-4"
          style={{
            background: 'rgba(239,68,68,0.05)',
            border: '1px solid rgba(239,68,68,0.2)',
          }}
        >
          {/* Panel header */}
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}
            >
              <TrendingDown size={14} style={{ color: '#ef4444' }} />
            </div>
            <span className="font-black text-sm text-red-400 tracking-wider uppercase">СЕЙЧАС</span>
            <span
              className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-semibold"
              style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171' }}
            >
              Кризис
            </span>
          </div>

          {/* Big crisis number */}
          <div
            className="rounded-xl p-4 mb-4 text-center"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}
          >
            <div className="text-4xl font-black text-red-400 mb-0.5">62%</div>
            <div className="text-white/45 text-xs">охват централизованным водоснабжением</div>
            <div className="text-red-400/50 text-xs mt-0.5">норматив: 98%</div>
          </div>

          {/* Crisis stats */}
          <div className="space-y-2.5">
            {stats.map((stat, i) => (
              <CrisisBar key={stat.label} {...stat} index={i} />
            ))}
          </div>
        </motion.div>

        {/* Center: Arrow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col items-center justify-center gap-2 self-center"
          style={{ minWidth: 80, padding: '16px 0' }}
        >
          <div
            className="rounded-2xl px-3 py-2 text-center"
            style={{ background: 'rgba(0,230,200,0.08)', border: '1px solid rgba(0,230,200,0.2)' }}
          >
            <div className="text-white/40 text-[9px] font-semibold uppercase tracking-wider mb-1">Проект</div>
            <div className="font-black text-sm" style={{ color: '#00e6c8' }}>«Ширин»</div>
          </div>
          <ArrowRight size={22} style={{ color: 'rgba(0,230,200,0.5)' }} className="hidden md:block" />
          <div className="text-white/20 text-xs font-semibold">$220M</div>
          {/* Down arrow for mobile */}
          <div className="flex flex-col items-center gap-0.5 md:hidden">
            <div className="w-px h-4" style={{ background: 'rgba(0,230,200,0.3)' }} />
            <div
              className="w-0 h-0"
              style={{ borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '6px solid rgba(0,230,200,0.4)' }}
            />
          </div>
        </motion.div>

        {/* Right: ПОСЛЕ ПРОЕКТА panel */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-4"
          style={{
            background: 'rgba(74,222,128,0.05)',
            border: '1px solid rgba(74,222,128,0.2)',
          }}
        >
          {/* Panel header */}
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)' }}
            >
              <TrendingUp size={14} style={{ color: '#4ade80' }} />
            </div>
            <span className="font-black text-sm text-emerald-400 tracking-wider uppercase">ПОСЛЕ ПРОЕКТА</span>
            <span
              className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-semibold"
              style={{ background: 'rgba(74,222,128,0.12)', color: '#4ade80' }}
            >
              Цель 2030
            </span>
          </div>

          {/* Big target number */}
          <div
            className="rounded-xl p-4 mb-4 text-center"
            style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.15)' }}
          >
            <div className="text-4xl font-black text-emerald-400 mb-0.5">98%</div>
            <div className="text-white/45 text-xs">охват централизованным водоснабжением</div>
            <div className="text-emerald-400/50 text-xs mt-0.5">соответствие нормативу ВОЗ</div>
          </div>

          {/* Target stats */}
          <div className="space-y-2.5">
            {[
              { label: 'Суточный дефицит', value: '0 м³', desc: 'Полное покрытие потребности', color: '#4ade80' },
              { label: 'Потери в сетях', value: '≤12%', desc: 'Международный стандарт', color: '#34d399' },
              { label: 'Подключений', value: '551 700', desc: 'Домохозяйств и предприятий', color: '#00e6c8' },
              { label: 'Мощность станции', value: '150 000 м³/сут', desc: 'Фаза 1 из 2', color: '#60a5fa' },
              { label: 'Население', value: '500 000+', desc: 'Жителей с чистой водой', color: '#a78bfa' },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.07 }}
                className="flex items-center gap-3 rounded-xl p-2.5"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <CheckCircle size={14} style={{ color: item.color, flexShrink: 0 }} />
                <div className="flex-1 min-w-0">
                  <div className="text-white/50 text-xs">{item.label}</div>
                  <div className="font-black text-sm leading-tight" style={{ color: item.color }}>{item.value}</div>
                </div>
                <div className="text-white/25 text-xs text-right hidden sm:block">{item.desc}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Context paragraph */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl p-4"
        style={{ background: 'rgba(0,6,20,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-start gap-3">
          <Droplets size={16} style={{ color: 'rgba(0,230,200,0.5)', flexShrink: 0, marginTop: 2 }} />
          <p className="text-white/50 text-sm leading-relaxed">
            Сырдарьинская область Узбекистана сталкивается с острым дефицитом водоснабжения:{' '}
            <span className="text-white/70">62% охвата</span> централизованным водоснабжением при норме 98%.
            Существующая инфраструктура <span className="text-white/70">1960-х годов</span> исчерпала ресурс —
            потери в сети достигают <span className="text-red-400/80">45%</span>. Ежедневный дефицит составляет{' '}
            <span className="text-red-400/80">89 000 м³</span>, что затрагивает{' '}
            <span className="text-white/70">187 000 жителей</span> без стабильного доступа к чистой воде.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ProblemSection;
