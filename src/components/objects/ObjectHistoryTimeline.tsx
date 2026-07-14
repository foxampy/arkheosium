// src/components/objects/ObjectHistoryTimeline.tsx
import { motion } from 'framer-motion';
import { Wrench, AlertTriangle, Star, Newspaper, DollarSign } from 'lucide-react';
import { useObjectHistory } from '@/hooks/useObjectHistory';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const EVENT_CONFIG = {
  construction:   { icon: Wrench,        color: '#3b82f6', label: 'Строительство' },
  modernization:  { icon: Wrench,        color: '#a78bfa', label: 'Модернизация' },
  incident:       { icon: AlertTriangle, color: '#ef4444', label: 'Инцидент' },
  milestone:      { icon: Star,          color: '#00e6c8', label: 'Веха' },
  news:           { icon: Newspaper,     color: '#94a3b8', label: 'Новость' },
} as const;

function formatUSD(v: number) {
  if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(0)}M`;
  return `$${(v / 1000).toFixed(0)}K`;
}

export function ObjectHistoryTimeline({ objectId }: { objectId: string }) {
  const { data: events, isLoading } = useObjectHistory(objectId);

  if (isLoading) return (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />
      ))}
    </div>
  );

  if (!events?.length) return (
    <div className="text-center py-8 text-white/30 text-sm">
      История событий будет отображаться здесь по мере добавления данных
    </div>
  );

  return (
    <div className="relative space-y-0">
      {/* Vertical line */}
      <div className="absolute left-[22px] top-4 bottom-4 w-px bg-white/10" />

      {events.map((event, i) => {
        const cfg = EVENT_CONFIG[event.event_type as keyof typeof EVENT_CONFIG] ?? EVENT_CONFIG.news;
        const Icon = cfg.icon;
        return (
          <motion.div key={event.id}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex gap-4 pb-5 relative"
          >
            {/* Icon */}
            <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 z-10"
              style={{ background: `${cfg.color}18`, border: `1px solid ${cfg.color}40` }}>
              <Icon size={16} style={{ color: cfg.color }} />
            </div>

            {/* Content */}
            <div className="flex-1 pt-1 pb-4 border-b border-white/5 last:border-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${cfg.color}18`, color: cfg.color }}>
                      {cfg.label}
                    </span>
                    {event.severity === 'critical' && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">Критично</span>
                    )}
                    {event.verified && (
                      <span className="text-xs text-white/30">✓ верифицировано</span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-white/90 mt-1">{event.title}</p>
                  {event.description && (
                    <p className="text-xs text-white/50 mt-1 leading-relaxed">{event.description}</p>
                  )}
                  {event.source_name && (
                    <p className="text-xs text-white/30 mt-1">Источник: {event.source_name}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-white/40">
                    {format(new Date(event.event_date), 'd MMM yyyy', { locale: ru })}
                  </p>
                  {event.cost_usd && (
                    <p className="text-xs font-bold text-amber-400 mt-0.5 flex items-center gap-1 justify-end">
                      <DollarSign size={10} />{formatUSD(event.cost_usd)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
