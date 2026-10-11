// src/hooks/useObjectHistory.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface ObjectEvent {
  id: string;
  event_date: string;
  event_type: 'construction' | 'modernization' | 'incident' | 'milestone' | 'news';
  title: string;
  description?: string;
  cost_usd?: number;
  severity?: string;
  source_name?: string;
  verified: boolean;
}

export function useObjectHistory(objectId: string) {
  return useQuery({
    queryKey: ['object-history', objectId],
    queryFn: async (): Promise<ObjectEvent[]> => {
      const { data, error } = await supabase
        .from('object_events')
        .select('*')
        .eq('object_id', objectId)
        .order('event_date', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!objectId,
    staleTime: 5 * 60 * 1000,
  });
}
