// src/hooks/useDashboardStats.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface DashboardStats {
  objectsCount: number;
  projectsCount: number;
  portfolioTotal: number;  // sum of projects.total_funding (USD)
  capacityTotal: number;   // sum of water_resources.water_output_m3
}

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [objCount, projCount, fundData, capData] = await Promise.all([
        supabase.from('water_resources').select('*', { count: 'exact', head: true }),
        supabase.from('projects').select('*', { count: 'exact', head: true }),
        supabase.from('projects').select('total_funding'),
        supabase.from('water_resources').select('water_output_m3'),
      ]);

      const portfolioTotal = (fundData.data ?? [])
        .reduce((s, p) => s + (Number(p.total_funding) || 0), 0);

      const capacityTotal = (capData.data ?? [])
        .reduce((s, r) => s + (Number(r.water_output_m3) || 0), 0);

      return {
        objectsCount: objCount.count ?? 0,
        projectsCount: projCount.count ?? 0,
        portfolioTotal,
        capacityTotal,
      };
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
