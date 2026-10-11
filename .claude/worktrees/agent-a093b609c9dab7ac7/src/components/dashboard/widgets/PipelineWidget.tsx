// src/components/dashboard/widgets/PipelineWidget.tsx
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useSupabaseProjects } from '@/hooks/useProjects';

interface PipelineStage {
  labelKey: string;
  color: string;
  statuses: string[];
}

const PIPELINE_STAGES: PipelineStage[] = [
  { labelKey: 'dashboard.pipeline_concept',        color: '#94a3b8', statuses: ['long_term', 'under_development', 'concept'] },
  { labelKey: 'dashboard.pipeline_research',       color: '#a78bfa', statuses: ['feasibility_study', 'in_negotiation', 'research'] },
  { labelKey: 'dashboard.pipeline_planning',       color: '#f59e0b', statuses: ['in_planning', 'planned', 'investment_open'] },
  { labelKey: 'dashboard.pipeline_implementation', color: '#00e6c8', statuses: ['in_implementation', 'active', 'ongoing', 'pilot_phase', 'implementation'] },
  { labelKey: 'dashboard.pipeline_completed',      color: '#22c55e', statuses: ['completed', 'operational'] },
];

export function PipelineWidget() {
  const { t } = useTranslation();
  const { data: projects, isLoading } = useSupabaseProjects();

  const pipelineData = useMemo(() => {
    return PIPELINE_STAGES.map((stage) => {
      const count = (projects ?? []).filter((p) =>
        stage.statuses.includes((p.status ?? '').toLowerCase())
      ).length;
      return { ...stage, count };
    });
  }, [projects]);

  const total = (projects ?? []).length;
  const pipelineMax = Math.max(...pipelineData.map((d) => d.count), 1);

  return (
    <div className="h-full flex flex-col justify-between">
      <div className="space-y-3 flex-1">
        {pipelineData.map((stage) => (
          <div key={stage.labelKey}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-white/60">{t(stage.labelKey)}</span>
              <span className="text-xs font-semibold" style={{ color: stage.color }}>
                {isLoading ? (
                  <span className="inline-block w-4 h-3 rounded bg-white/10 animate-pulse" />
                ) : stage.count}
              </span>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: stage.color }}
                initial={{ width: 0 }}
                animate={{ width: isLoading ? 0 : `${(stage.count / pipelineMax) * 100}%` }}
                transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-white/5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/40">{t('dashboard.pipeline_total')}</span>
          {isLoading ? (
            <span className="inline-block w-8 h-3 rounded bg-white/10 animate-pulse" />
          ) : (
            <span className="text-white/80 font-semibold">{total}</span>
          )}
        </div>
      </div>
    </div>
  );
}
