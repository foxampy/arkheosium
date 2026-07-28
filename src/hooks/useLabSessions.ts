// ═══════════════════════════════════════════════════════════════
//  useLabSessions — persistent multi-session store for the AI Lab
//  (Claude-Code-like chat sessions). Each session keeps its own
//  {mode, modelId, messages, blocks}. Persisted to localStorage under
//  'arkheosium-lab-sessions-v1' with the active session id remembered.
// ═══════════════════════════════════════════════════════════════

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  LAB_MODELS,
  LAB_TEMPLATES,
  type LabMode,
  type LabBlock,
  type ChatMessage,
} from '@/lib/labTypes';

const STORAGE_KEY = 'arkheosium-lab-sessions-v1';

export interface LabSession {
  id: string;
  name: string;
  mode: LabMode;
  modelId: string;
  messages: ChatMessage[];
  blocks: LabBlock[];
  createdAt: number;
  updatedAt: number;
}

interface PersistShape {
  sessions: LabSession[];
  activeId: string | null;
}

function freshBlocks(mode: LabMode): LabBlock[] {
  return LAB_TEMPLATES[mode].map((b) => ({ ...b }));
}

function greeting(mode: LabMode): ChatMessage {
  return {
    role: 'assistant',
    content:
      mode === 'product'
        ? 'Привет! Я — со-пилот разработки продуктов ARKHEOSIUM. Опишите идею продукта — я помогу проработать концепцию, аудиторию, функции, стек, монетизацию и go-to-market, и заполню блоки конструктора.'
        : 'Привет! Я — со-пилот разработки проектов ARKHEOSIUM. Опишите задачу или объект — я помогу собрать концепцию, решение, технологии, ТЭО и дорожную карту, заполняя блоки конструктора.',
  };
}

let counter = 0;
function makeId(): string {
  counter += 1;
  return `sess-${Date.now().toString(36)}-${counter}`;
}

export function newSession(mode: LabMode = 'project', name?: string): LabSession {
  const now = Date.now();
  return {
    id: makeId(),
    name: name ?? (mode === 'product' ? 'Новый продукт' : 'Новый проект'),
    mode,
    modelId: LAB_MODELS[0].id,
    messages: [greeting(mode)],
    blocks: freshBlocks(mode),
    createdAt: now,
    updatedAt: now,
  };
}

function loadState(): PersistShape {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PersistShape;
      if (parsed && Array.isArray(parsed.sessions) && parsed.sessions.length > 0) {
        // basic shape guard — ensure each session has required arrays
        const sessions = parsed.sessions.filter(
          (s) => s && Array.isArray(s.messages) && Array.isArray(s.blocks) && s.id,
        );
        if (sessions.length > 0) {
          const activeId =
            parsed.activeId && sessions.some((s) => s.id === parsed.activeId)
              ? parsed.activeId
              : sessions[0].id;
          return { sessions, activeId };
        }
      }
    }
  } catch {
    /* ignore corrupt storage */
  }
  const first = newSession('project');
  return { sessions: [first], activeId: first.id };
}

export function useLabSessions() {
  const [sessions, setSessions] = useState<LabSession[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const hydrated = useRef(false);

  // Restore on mount.
  useEffect(() => {
    const st = loadState();
    setSessions(st.sessions);
    setActiveId(st.activeId);
    hydrated.current = true;
  }, []);

  // Persist on change (only after initial hydration).
  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ sessions, activeId }));
    } catch {
      /* quota / privacy mode — ignore */
    }
  }, [sessions, activeId]);

  const active = sessions.find((s) => s.id === activeId) ?? sessions[0] ?? null;

  /** Patch the active session (merges + bumps updatedAt). */
  const updateActive = useCallback(
    (patch: Partial<LabSession> | ((s: LabSession) => Partial<LabSession>)) => {
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== activeId) return s;
          const p = typeof patch === 'function' ? patch(s) : patch;
          return { ...s, ...p, updatedAt: Date.now() };
        }),
      );
    },
    [activeId],
  );

  const createSession = useCallback((mode: LabMode = 'project') => {
    const s = newSession(mode);
    setSessions((prev) => [s, ...prev]);
    setActiveId(s.id);
    return s;
  }, []);

  const selectSession = useCallback((id: string) => setActiveId(id), []);

  const renameSession = useCallback((id: string, name: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, name: name.trim() || s.name, updatedAt: Date.now() } : s)),
    );
  }, []);

  const deleteSession = useCallback(
    (id: string) => {
      setSessions((prev) => {
        const next = prev.filter((s) => s.id !== id);
        if (next.length === 0) {
          const fresh = newSession('project');
          setActiveId(fresh.id);
          return [fresh];
        }
        if (id === activeId) setActiveId(next[0].id);
        return next;
      });
    },
    [activeId],
  );

  return {
    sessions,
    active,
    activeId,
    hydrated: hydrated.current,
    createSession,
    selectSession,
    renameSession,
    deleteSession,
    updateActive,
  };
}
