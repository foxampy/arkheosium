// src/hooks/useWaterNews.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface WaterNews {
  id: string;
  title: string;
  summary?: string;
  url?: string;
  source_name?: string;
  published_at: string;
  severity: string;
  category: string;
  related_objects: string[];
}

export function useWaterNews(objectId?: string, limit = 20) {
  return useQuery({
    queryKey: ['water-news', objectId, limit],
    queryFn: async (): Promise<WaterNews[]> => {
      let q = supabase.from('water_news').select('*').order('published_at', { ascending: false }).limit(limit);
      if (objectId) {
        q = q.contains('related_objects', [objectId]);
      }
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 10 * 60 * 1000,
  });
}
