// src/hooks/useProjects.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface SupabaseProject {
  id: number;
  name: string;
  name_en?: string | null;
  name_ru?: string | null;
  description?: string;
  description_en?: string | null;
  description_ru?: string | null;
  apy?: number;
  total_funding?: number;
  created_at?: string;
  region?: string;
  country?: string;
  status?: string;
  irr?: number;
  technologies?: string;
  team_size?: number;
  risk_level?: string;
  water_object_id?: number;
  latitude?: number;
  longitude?: number;
}

export function useSupabaseProjects(filter?: { status?: string; country?: string }) {
  return useQuery({
    queryKey: ['supabase-projects', filter],
    queryFn: async (): Promise<SupabaseProject[]> => {
      let q = supabase
        .from('projects')
        .select('id,name,name_en,name_ru,description,description_en,description_ru,apy,total_funding,created_at,region,country,status,irr,technologies,team_size,risk_level,water_object_id,latitude,longitude')
        .order('name');
      if (filter?.status)  q = q.eq('status', filter.status);
      if (filter?.country) q = q.eq('country', filter.country);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}
