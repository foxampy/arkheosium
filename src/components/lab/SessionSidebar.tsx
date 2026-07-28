// ═══════════════════════════════════════════════════════════════
//  SessionSidebar — Claude-Code-like chat session list for /lab.
//  New chat, switch, rename (inline), delete. Purely presentational —
//  all persistence lives in useLabSessions.
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react';
import {
  Plus, MessageSquare, Building2, Package, Trash2, Pencil, Check, X,
} from 'lucide-react';
import type { LabSession } from '@/hooks/useLabSessions';

const ACCENT = '#00e6c8';

interface Props {
  sessions: LabSession[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

function relTime(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.round(diff / 60000);
  if (m < 1) return 'только что';
  if (m < 60) return `${m} мин назад`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} ч назад`;
  const d = Math.round(h / 24);
  return `${d} дн назад`;
}

export default function SessionSidebar({
  sessions, activeId, onSelect, onCreate, onRename, onDelete,
}: Props) {
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  const startEdit = (s: LabSession) => {
    setEditing(s.id);
    setDraft(s.name);
  };
  const commitEdit = (id: string) => {
    onRename(id, draft);
    setEditing(null);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-white/5">
        <button
          onClick={onCreate}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold transition cursor-pointer"
          style={{ background: `linear-gradient(135deg, ${ACCENT}, #00d4ff)`, color: '#000' }}
        >
          <Plus className="w-4 h-4" /> Новый чат
        </button>
      </div>

      <div className="flex items-center gap-1.5 px-3 pt-3 pb-1.5 text-[10px] uppercase tracking-wide text-white/35">
        <MessageSquare className="w-3 h-3" /> Сессии · {sessions.length}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-3 space-y-1">
        {sessions.map((s) => {
          const active = s.id === activeId;
          const isEditing = editing === s.id;
          const ModeIcon = s.mode === 'product' ? Package : Building2;
          return (
            <div
              key={s.id}
              onClick={() => !isEditing && onSelect(s.id)}
              className="group rounded-xl px-2.5 py-2 transition-colors cursor-pointer"
              style={{
                background: active ? `${ACCENT}14` : 'transparent',
                border: `1px solid ${active ? ACCENT + '44' : 'transparent'}`,
              }}
            >
              {isEditing ? (
                <div className="flex items-center gap-1.5">
                  <input
                    autoFocus
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitEdit(s.id);
                      if (e.key === 'Escape') setEditing(null);
                    }}
                    className="flex-1 min-w-0 bg-black/40 text-white text-[13px] px-2 py-1 rounded-lg outline-none border border-cyan-400/40"
                  />
                  <button
                    onClick={(e) => { e.stopPropagation(); commitEdit(s.id); }}
                    className="w-6 h-6 rounded-md flex items-center justify-center text-white/70 hover:text-white cursor-pointer"
                    aria-label="Сохранить"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditing(null); }}
                    className="w-6 h-6 rounded-md flex items-center justify-center text-white/40 hover:text-white cursor-pointer"
                    aria-label="Отмена"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: active ? `${ACCENT}22` : 'rgba(255,255,255,0.05)' }}
                  >
                    <ModeIcon className="w-3.5 h-3.5" style={{ color: active ? ACCENT : 'rgba(255,255,255,0.5)' }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-semibold text-white/90 truncate">{s.name}</div>
                    <div className="text-[10px] text-white/35">{relTime(s.updatedAt)}</div>
                  </div>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); startEdit(s); }}
                      className="w-6 h-6 rounded-md flex items-center justify-center text-white/40 hover:text-white cursor-pointer"
                      aria-label="Переименовать"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(s.id); }}
                      className="w-6 h-6 rounded-md flex items-center justify-center text-white/40 hover:text-red-400 cursor-pointer"
                      aria-label="Удалить"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
