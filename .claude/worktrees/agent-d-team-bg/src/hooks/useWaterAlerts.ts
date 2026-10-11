import { useState, useEffect, useCallback } from 'react';

export interface WaterAlert {
  id: string;
  object_id: string | null;
  object_name: string | null;
  title: string;
  description: string | null;
  severity: 'critical' | 'warning' | 'info';
  parameter: string | null;
  value: number | null;
  threshold: number | null;
  unit: string | null;
  resolved: boolean;
  resolved_at: string | null;
  created_at: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

async function fetchAlerts(): Promise<WaterAlert[]> {
  const url = `${SUPABASE_URL}/rest/v1/water_alerts?order=created_at.desc&limit=50`;
  const res = await fetch(url, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export function useWaterAlerts(autoRefresh = true) {
  const [alerts, setAlerts] = useState<WaterAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await fetchAlerts();
      setAlerts(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (e) {
      setError('Не удалось загрузить алерты');
      console.error('[useWaterAlerts]', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    if (!autoRefresh) return;
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, [load, autoRefresh]);

  const criticalCount = alerts.filter(a => a.severity === 'critical' && !a.resolved).length;
  const warningCount = alerts.filter(a => a.severity === 'warning' && !a.resolved).length;
  const activeCount = alerts.filter(a => !a.resolved).length;

  return { alerts, loading, error, lastUpdated, criticalCount, warningCount, activeCount, refresh: load };
}
