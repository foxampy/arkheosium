// ═══════════════════════════════════════════════════════════════
//  ResearchPanel — browse related entities (objects / subjects /
//  projects) while designing. Searchable + type-filtered. Clicking
//  "＋ в чат" inserts the entity name into the chat input.
//
//  Uses the lightweight getMapMarkersByType() aggregator (already a
//  flat MapMarker[]) instead of importing the huge raw data arrays.
// ═══════════════════════════════════════════════════════════════

import { useMemo, useState } from 'react';
import { Search, Building2, Boxes, Users, MessageSquarePlus, Layers } from 'lucide-react';
import { getMapMarkersByType } from '@/data/map-markers';
import type { MapMarker, EntityType } from '@/components/map/types';

const TYPE_META: Record<string, { label: string; color: string; icon: typeof Boxes }> = {
  object: { label: 'Объекты', color: '#f472b6', icon: Boxes },
  subject: { label: 'Субъекты', color: '#fbbf24', icon: Users },
  project: { label: 'Проекты', color: '#60a5fa', icon: Building2 },
};

interface Props {
  onInsert: (name: string) => void;
}

const FILTERS: { key: 'all' | EntityType; label: string }[] = [
  { key: 'all', label: 'Все' },
  { key: 'object', label: 'Объекты' },
  { key: 'subject', label: 'Субъекты' },
  { key: 'project', label: 'Проекты' },
];

export default function ResearchPanel({ onInsert }: Props) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | EntityType>('all');

  // Aggregated once. Cap list length to keep the panel lightweight.
  const all = useMemo<MapMarker[]>(() => getMapMarkersByType('object', 'subject', 'project'), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all
      .filter((m) => (filter === 'all' ? true : m.type === filter))
      .filter((m) =>
        q ? m.title.toLowerCase().includes(q) || (m.description ?? '').toLowerCase().includes(q) : true,
      )
      .slice(0, 120);
  }, [all, query, filter]);

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-3 border-b border-white/5 space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по объектам, субъектам, проектам…"
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/30 text-white text-[13px] outline-none border border-white/10 focus:border-cyan-400/50 transition"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                style={{
                  background: active ? 'rgba(0,230,200,0.15)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${active ? 'rgba(0,230,200,0.4)' : 'rgba(255,255,255,0.08)'}`,
                  color: active ? '#fff' : 'rgba(255,255,255,0.55)',
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1.5">
        <div className="flex items-center gap-1.5 px-1.5 py-1 text-[10px] uppercase tracking-wide text-white/30">
          <Layers className="w-3 h-3" /> Найдено {filtered.length}
        </div>
        {filtered.map((m) => {
          const meta = TYPE_META[m.type] ?? { label: m.type, color: '#67e8f9', icon: Boxes };
          const TIcon = meta.icon;
          return (
            <div
              key={`${m.type}:${m.id}`}
              className="group rounded-xl px-2.5 py-2 flex items-start gap-2.5 transition-colors hover:bg-white/[0.04]"
              style={{ border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: `${meta.color}18`, border: `1px solid ${meta.color}33` }}
              >
                <TIcon className="w-3.5 h-3.5" style={{ color: meta.color }} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-semibold text-white/90 truncate">{m.title}</span>
                  <span
                    className="text-[9px] px-1.5 py-px rounded uppercase shrink-0"
                    style={{ background: `${meta.color}22`, color: meta.color }}
                  >
                    {meta.label.slice(0, -1)}
                  </span>
                </div>
                {m.description && (
                  <p className="text-[11px] text-white/45 leading-snug mt-0.5 line-clamp-2">{m.description}</p>
                )}
              </div>
              <button
                onClick={() => onInsert(m.title)}
                title="Добавить в чат"
                className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold text-white/60 hover:text-white opacity-0 group-hover:opacity-100 transition cursor-pointer"
                style={{ background: 'rgba(0,230,200,0.12)', border: '1px solid rgba(0,230,200,0.25)' }}
              >
                <MessageSquarePlus className="w-3.5 h-3.5" /> в чат
              </button>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-8 text-sm text-white/35">Ничего не найдено</div>
        )}
      </div>
    </div>
  );
}
