// src/hooks/useDashboardPreferences.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export type Role =
  | 'state_oversight'
  | 'minister'
  | 'regional_water'
  | 'engineer'
  | 'researcher'
  | 'investor'
  | 'bank'
  | 'object_manager'
  | 'field_worker'
  | 'analyst'
  | 'default';

export interface DashboardPrefs {
  role: Role;
  background: 'blockchain' | 'deep_ocean' | 'world_map';
  apps: string[];
  dock: string[];
  widget_order: string[];
  widget_enabled: Record<string, boolean>;
}

const STORAGE_KEY = 'vodprom-dashboard-prefs-v2';
const LAYOUT_NAME = 'main';

const DEFAULT_PREFS: DashboardPrefs = {
  role: 'default',
  background: 'blockchain',
  apps: ['map', 'hub', 'iot', 'alerts', 'analytics', 'messages', 'marketplace', 'workspace', 'contacts', 'profile'],
  dock: ['map', 'alerts', 'hub', 'iot'],
  widget_order: ['alerts', 'news', 'projects', 'rd', 'monitoring', 'jobs', 'events', 'stats'],
  widget_enabled: {
    alerts: true,
    news: true,
    projects: true,
    rd: true,
    monitoring: true,
    jobs: false,
    events: false,
    stats: true,
  },
};

function readFromLocalStorage(): DashboardPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PREFS };
    const parsed = JSON.parse(raw) as Partial<DashboardPrefs>;
    return {
      role: parsed.role ?? DEFAULT_PREFS.role,
      background: parsed.background ?? DEFAULT_PREFS.background,
      apps: parsed.apps ?? DEFAULT_PREFS.apps,
      dock: parsed.dock ?? DEFAULT_PREFS.dock,
      widget_order: parsed.widget_order ?? DEFAULT_PREFS.widget_order,
      widget_enabled: parsed.widget_enabled ?? DEFAULT_PREFS.widget_enabled,
    };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

function writeToLocalStorage(prefs: DashboardPrefs): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // ignore storage errors
  }
}

export function useDashboardPreferences(): {
  prefs: DashboardPrefs;
  updatePrefs: (partial: Partial<DashboardPrefs>) => void;
  isLoading: boolean;
} {
  const [prefs, setPrefs] = useState<DashboardPrefs>(readFromLocalStorage);
  const [isLoading, setIsLoading] = useState(true);

  // Debounce timer for Supabase upsert
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // On mount: check auth session and load from Supabase if authenticated
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
          setIsLoading(false);
          return;
        }

        const userId = session.user.id;
        const { data, error } = await supabase
          .from('user_dashboard_layouts')
          .select('layout_json')
          .eq('user_id', userId)
          .eq('layout_name', LAYOUT_NAME)
          .maybeSingle();

        if (!cancelled && !error && data?.layout_json) {
          const dbLayout = data.layout_json as Partial<DashboardPrefs>;
          setPrefs(prev => {
            const merged: DashboardPrefs = {
              role: dbLayout.role ?? prev.role,
              background: dbLayout.background ?? prev.background,
              apps: dbLayout.apps ?? prev.apps,
              dock: dbLayout.dock ?? prev.dock,
              widget_order: dbLayout.widget_order ?? prev.widget_order,
              widget_enabled: dbLayout.widget_enabled ?? prev.widget_enabled,
            };
            writeToLocalStorage(merged);
            return merged;
          });
        }
      } catch {
        // Silently fail — localStorage prefs are still used
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    init();
    return () => { cancelled = true; };
  }, []);

  const upsertToSupabase = useCallback(async (nextPrefs: DashboardPrefs) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const userId = session.user.id;
      await supabase.from('user_dashboard_layouts').upsert(
        {
          user_id: userId,
          layout_name: LAYOUT_NAME,
          layout_json: {
            role: nextPrefs.role,
            background: nextPrefs.background,
            apps: nextPrefs.apps,
            dock: nextPrefs.dock,
            widget_order: nextPrefs.widget_order,
            widget_enabled: nextPrefs.widget_enabled,
          },
          widget_configs: {},
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,layout_name' }
      );
    } catch {
      // Silently fail
    }
  }, []);

  const updatePrefs = useCallback((partial: Partial<DashboardPrefs>) => {
    setPrefs(prev => {
      const next: DashboardPrefs = { ...prev, ...partial };
      // Synchronous localStorage write
      writeToLocalStorage(next);

      // Debounced Supabase upsert
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        upsertToSupabase(next);
      }, 2000);

      return next;
    });
  }, [upsertToSupabase]);

  return { prefs, updatePrefs, isLoading };
}
