// src/components/objects/NewsPanel.tsx
import { useWaterNews } from '@/hooks/useWaterNews';
import { ExternalLink, AlertTriangle, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

export function NewsPanel({ objectId }: { objectId: string }) {
  const { data: news, isLoading } = useWaterNews(objectId, 15);

  if (isLoading) return <div className="h-32 animate-pulse bg-white/5 rounded-xl" />;

  if (!news?.length) return (
    <div className="text-center py-8 text-white/30 text-sm">
      Новости по этому объекту не найдены
    </div>
  );

  return (
    <div className="space-y-3">
      {news.map(item => (
        <div key={item.id} className="p-3 rounded-xl bg-white/5 border border-white/[0.08] hover:border-white/[0.15] transition-colors">
          <div className="flex items-start gap-2">
            {item.severity === 'critical' || item.severity === 'warning'
              ? <AlertTriangle size={12} className="text-amber-400 mt-0.5 shrink-0" />
              : <Info size={12} className="text-cyan-400/60 mt-0.5 shrink-0" />}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white/80 line-clamp-2">{item.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-white/30">{item.source_name}</span>
                <span className="text-[10px] text-white/20">·</span>
                <span className="text-[10px] text-white/30">
                  {formatDistanceToNow(new Date(item.published_at), { locale: ru, addSuffix: true })}
                </span>
              </div>
            </div>
            {item.url && (
              <a href={item.url} target="_blank" rel="noopener noreferrer"
                className="text-white/20 hover:text-cyan-400 transition-colors shrink-0">
                <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
