// src/hooks/useWaterResources.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface WaterResource {
  id: number;
  name: string;
  name_en?: string | null;
  name_ru?: string | null;
  description?: string;
  description_en?: string | null;
  description_ru?: string | null;
  location?: string;
  region?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  status?: string;
  irr?: number;
  total_funding?: number;
  available_for_dao?: number;
  category?: string;
  year_completed?: number;
  year_established?: number;
  construction_cost?: number;
  annual_maintenance?: number;
  annual_revenue?: number;
  capacity?: string;
  technologies?: string;
  modernizations?: string;
  employees_count?: number;
  water_output_m3?: number;
  power_output_mw?: number;
  beneficiaries?: number;
  current_issues?: string;
  certifications?: string;
  object_type?: string;
}

export function useWaterResources(filter?: { country?: string; status?: string; category?: string }) {
  return useQuery({
    queryKey: ['water-resources', filter],
    queryFn: async (): Promise<WaterResource[]> => {
      let q = supabase
        .from('water_resources')
        .select('id,name,name_en,name_ru,description,description_en,description_ru,location,region,country,latitude,longitude,status,irr,total_funding,available_for_dao,category,year_completed,year_established,construction_cost,annual_maintenance,annual_revenue,capacity,technologies,modernizations,employees_count,water_output_m3,power_output_mw,beneficiaries,current_issues,certifications,object_type')
        .order('name');
      if (filter?.country) q = q.eq('country', filter.country);
      if (filter?.status)  q = q.eq('status', filter.status);
      if (filter?.category) q = q.eq('category', filter.category);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useWaterResource(id: number) {
  return useQuery({
    queryKey: ['water-resource', id],
    queryFn: async (): Promise<WaterResource | null> => {
      const { data, error } = await supabase
        .from('water_resources')
        .select('id,name,name_en,name_ru,description,description_en,description_ru,location,region,country,latitude,longitude,status,irr,total_funding,available_for_dao,category,year_completed,year_established,construction_cost,annual_maintenance,annual_revenue,capacity,technologies,modernizations,employees_count,water_output_m3,power_output_mw,beneficiaries,current_issues,certifications,object_type')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}
