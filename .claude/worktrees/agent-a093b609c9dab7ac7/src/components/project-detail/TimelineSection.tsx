import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import type { ProjectData } from '@/data/projects/types';

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

// ─── Props ────────────────────────────────────────────────────
interface TimelineSectionProps {
  project: ProjectData;
}

// ─── Component ───────────────────────────────────────────────
export default function TimelineSection({ project }: TimelineSectionProps) {
  const { timeline } = project;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <SectionTitle
        icon={Calendar}
        title="Дорожная карта"
        subtitle="Этапы реализации проекта"
        color="#fbbf24"
      />

      <div
        className="rounded-2xl p-5"
        style={{ background: 'rgba(0,6,20,0.8)', border: '1px solid rgba(255,191,36,0.12)' }}
      >
        <div className="relative">
          {/* Vertical line */}
          <div
            className="absolute left-5 top-3 bottom-3 w-px"
            style={{ background: 'linear-gradient(180deg, rgba(0,230,200,0.3), rgba(255,255,255,0.04))' }}
          />

          <div className="space-y-1">
            {timeline.map((step, i) => {
              const isActive = step.status === 'current';
              return (
                <motion.div
                  key={step.phase}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 + i * 0.05 }}
                  className="relative flex items-start gap-4 p-3 rounded-xl transition-colors"
                  style={{
                    background: isActive ? `${step.color}08` : 'transparent',
                    border: isActive ? `1px solid ${step.color}25` : '1px solid transparent',
                  }}
                >
                  {/* Dot */}
                  <div className="shrink-0 relative z-10 mt-0.5">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-black"
                      style={{
                        background: isActive ? step.color : `${step.color}18`,
                        border: `2px solid ${step.color}`,
                        color: isActive ? '#000818' : step.color,
                        boxShadow: isActive ? `0 0 16px ${step.color}60` : 'none',
                      }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      {isActive && (
                        <span
                          className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase"
                          style={{ background: `${step.color}20`, color: step.color }}
                        >
                          Текущий этап
                        </span>
                      )}
                      <span
                        className="font-bold text-sm"
                        style={{ color: isActive ? step.color : 'rgba(255,255,255,0.85)' }}
                      >
                        {step.phase}
                      </span>
                    </div>
                    <p className="text-white/40 text-xs leading-relaxed">{step.desc}</p>
                  </div>

                  {/* Period */}
                  <div
                    className="text-xs font-semibold shrink-0 text-right"
                    style={{ color: step.color }}
                  >
                    {step.period}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
