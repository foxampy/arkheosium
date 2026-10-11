// src/hooks/useObjectMonitoring.ts
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface MonitoringReading {
  id: string;
  timestamp: string;
  parameter: string;
  value: number;
  unit: string;
  source_api?: string;
  quality_flag: string;
}

export function useObjectMonitoring(objectId: string, hours = 72) {
  const since = new Date(Date.now() - hours * 3600 * 1000).toISOString();

  const query = useQuery({
    queryKey: ['monitoring', objectId, hours],
    queryFn: async (): Promise<MonitoringReading[]> => {
      const { data, error } = await supabase
        .from('object_monitoring')
        .select('*')
        .eq('object_id', objectId)
        .gte('timestamp', since)
        .order('timestamp', { ascending: false })
        .limit(200);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!objectId,
    refetchInterval: 60_000, // refresh every minute
  });

  // Real-time subscription for new readings
  const [latest, setLatest] = useState<MonitoringReading | null>(null);
  useEffect(() => {
    const ch = supabase.channel(`monitoring:${objectId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'object_monitoring', filter: `object_id=eq.${objectId}` },
        (p) => setLatest(p.new as MonitoringReading))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [objectId]);

  return { ...query, latest };
}
