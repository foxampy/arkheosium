import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { MapMarker } from '@/components/map/types';
import type { WorldBorders } from '@/lib/geo/worldBorders';
import { groupMarkersByGeography, type GeoGroup } from '@/lib/regionGrouping';
import { DOMAIN_CONFIG, DOMAIN_ORDER, normalizeDomain, type DomainKey } from '@/lib/domains';

const TYPE_LABEL: Record<string, string> = { object: 'Объекты', subject: 'Субъекты', project: 'Проекты', rd: 'R&D' };

/**
 * Сводка региона на глобусе: вместо приближения — метрики региона одним окном.
 * Сколько записей реестра и каких, по ресурсным доменам и странам, и ключевые записи (по клику — карточка).
 */
export default function RegionCard({ group, markers, world, onClose, onOpen }: {
  group: GeoGroup; markers: MapMarker[]; world: WorldBorders | null; onClose: () => void; onOpen: (m: MapMarker) => void;
}) {
  const inside = useMemo(() => {
    const ids = new Set(group.markerIds);
    return markers.filter((m) => ids.has(`${m.type}:${m.id}`));
  }, [group, markers]);

  const byType = useMemo(() => {
    const t: Record<string, number> = {};
    inside.forEach((m) => { t[m.type] = (t[m.type] ?? 0) + 1; });
    return t;
  }, [inside]);

  const byDomain = useMemo(() => {
    const t = {} as Record<DomainKey, number>;
    inside.forEach((m) => { if (m.type === 'object') { const d = normalizeDomain(m.domain); t[d] = (t[d] ?? 0) + 1; } });
    return DOMAIN_ORDER.filter((d) => t[d]).map((d) => [d, t[d]] as const);
  }, [inside]);

  const countries = useMemo(() => {
    if (group.level !== 'macro') return [];
    return groupMarkersByGeography(inside, world, 'country').groups.sort((a, b) => b.count - a.count).slice(0, 8);
  }, [group, inside, world]);

  const top = useMemo(() => [...inside].sort((a, b) => (a.type === 'project' ? -1 : 0) - (b.type === 'project' ? -1 : 0)).slice(0, 8), [inside]);

  return (
    <motion.div
      className="absolute z-40 left-3 right-3 bottom-24 sm:left-auto sm:right-5 sm:top-24 sm:bottom-auto sm:w-[380px] max-h-[70vh] overflow-y-auto rounded-2xl p-5"
      style={{ background: 'rgba(5,13,26,0.94)', border: `1px solid ${group.color}55`, backdropFilter: 'blur(24px)', boxShadow: '0 30px 80px -20px rgba(0,0,0,.7)' }}
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }} transition={{ duration: 0.2 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">{group.level === 'macro' ? 'Регион' : 'Страна'}</p>
          <h3 className="text-xl font-bold text-white mt-1">{group.name}</h3>
          <p className="text-sm text-white/55 mt-0.5">{inside.length.toLocaleString('ru-RU')} записей реестра</p>
        </div>
        <button onClick={onClose} aria-label="Закрыть" className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ border: '1px solid rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.7)' }}>
          <X size={16} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4">
        {(['object', 'subject', 'project'] as const).map((t) => (
          <div key={t} className="rounded-xl px-3 py-2.5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="text-lg font-bold text-white tabular-nums">{(byType[t] ?? 0).toLocaleString('ru-RU')}</div>
            <div className="text-[11px] text-white/45">{TYPE_LABEL[t]}</div>
          </div>
        ))}
      </div>

      {byDomain.length > 0 && (
        <div className="mt-4">
          <p className="text-[10px] uppercase tracking-[0.16em] text-white/40 mb-2">Ресурсы</p>
          <div className="flex flex-wrap gap-1.5">
            {byDomain.map(([d, n]) => (
              <span key={d} className="px-2.5 py-1 rounded-full text-[11px] font-semibold" style={{ background: `${DOMAIN_CONFIG[d].color}18`, color: DOMAIN_CONFIG[d].color, border: `1px solid ${DOMAIN_CONFIG[d].color}44` }}>
                {DOMAIN_CONFIG[d].labelRu} · {n}
              </span>
            ))}
          </div>
        </div>
      )}

      {countries.length > 0 && (
        <div className="mt-4">
          <p className="text-[10px] uppercase tracking-[0.16em] text-white/40 mb-2">Страны</p>
          <ul className="space-y-1">
            {countries.map((c) => (
              <li key={c.id} className="flex items-center justify-between text-[13px] text-white/75">
                <span>{c.name}</span><span className="tabular-nums text-white/45">{c.count}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {top.length > 0 && (
        <div className="mt-4">
          <p className="text-[10px] uppercase tracking-[0.16em] text-white/40 mb-2">Ключевые записи</p>
          <ul className="space-y-1">
            {top.map((m) => (
              <li key={`${m.type}:${m.id}`}>
                <button onClick={() => onOpen(m)} className="w-full flex items-center justify-between gap-3 text-left text-[13px] text-white/85 hover:text-white px-2 py-1.5 rounded-lg hover:bg-white/5">
                  <span className="truncate">{m.title}</span><span className="text-[11px] text-white/40 shrink-0">{TYPE_LABEL[m.type] ?? ''}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}
