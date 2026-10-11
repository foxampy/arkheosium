// src/hooks/useDashboardLayout.ts
import { useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useDashboardStore } from '@/store/dashboardStore';

const LS_KEY = 'vodprom-dashboard-layout';

export function useDashboardLayout() {
  const { layouts, widgets, setLayouts, setWidgets } = useDashboardStore();

  // Load from Supabase (if auth'd) or localStorage
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('user_dashboard_layouts')
          .select('layout_json, widget_configs')
          .eq('user_id', user.id)
          .eq('layout_name', 'default')
          .single();
        if (data?.layout_json && data.layout_json.length > 0) {
          setLayouts(data.layout_json);
          if (data.widget_configs?.widgets) setWidgets(data.widget_configs.widgets);
          return;
        }
      }
      // Fallback: localStorage
      try {
        const saved = localStorage.getItem(LS_KEY);
        if (saved) {
          const { layouts: l, widgets: w } = JSON.parse(saved);
          if (l) setLayouts(l);
          if (w) setWidgets(w);
        }
      } catch {
        // ignore parse errors
      }
    }
    load();
  }, []);

  const save = useCallback(async () => {
    const payload = { layouts, widgets };
    localStorage.setItem(LS_KEY, JSON.stringify(payload));
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('user_dashboard_layouts').upsert({
        user_id: user.id,
        layout_name: 'default',
        layout_json: layouts,
        widget_configs: { widgets },
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,layout_name' });
    }
  }, [layouts, widgets]);

  return { save };
}
