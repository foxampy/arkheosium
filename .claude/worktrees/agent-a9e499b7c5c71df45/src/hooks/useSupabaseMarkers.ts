import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { MapMarker } from '@/components/map/types';

interface SupabaseWaterResource {
  id: number;
  name: string;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  status: string | null;
  category: string | null;
  object_type: string | null;
  country: string | null;
  region: string | null;
  total_funding: number | null;
  capacity: string | null;
}

interface SupabaseProject {
  id: number;
  name: string;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  status: string | null;
  total_funding: number | null;
  region: string | null;
  country: string | null;
}

interface SupabasePartnership {
  id: number;
  organization_name: string;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  partnership_type: string | null;
  organization_type: string | null;
  status: string | null;
  country: string | null;
}

export function useSupabaseMarkers() {
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ waterResources: 0, projects: 0, partnerships: 0 });

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      try {
        const [wrRes, prRes, ptRes] = await Promise.all([
          supabase.from('water_resources').select('id,name,description,latitude,longitude,status,category,object_type,country,region,total_funding,capacity'),
          supabase.from('projects').select('id,name,description,latitude,longitude,status,total_funding,region,country'),
          supabase.from('partnerships').select('id,organization_name,description,latitude,longitude,partnership_type,organization_type,status,country'),
        ]);

        const allMarkers: MapMarker[] = [];

        // Water resources
        const waterResources = (wrRes.data as SupabaseWaterResource[] | null) ?? [];
        for (const wr of waterResources) {
          if (wr.latitude == null || wr.longitude == null) continue;
          allMarkers.push({
            id: `sb-wr-${wr.id}`,
            type: 'object',
            lat: Number(wr.latitude),
            lng: Number(wr.longitude),
            title: wr.name,
            description: wr.description ?? undefined,
            source: 'supabase',
          } as MapMarker);
        }

        // Projects
        const projects = (prRes.data as SupabaseProject[] | null) ?? [];
        for (const p of projects) {
          if (p.latitude == null || p.longitude == null) continue;
          allMarkers.push({
            id: `sb-pr-${p.id}`,
            type: 'project',
            lat: Number(p.latitude),
            lng: Number(p.longitude),
            title: p.name,
            description: p.description ?? undefined,
            source: 'supabase',
          } as MapMarker);
        }

        // Partnerships (as subjects)
        const partnerships = (ptRes.data as SupabasePartnership[] | null) ?? [];
        for (const pt of partnerships) {
          if (pt.latitude == null || pt.longitude == null) continue;
          allMarkers.push({
            id: `sb-pt-${pt.id}`,
            type: 'subject',
            lat: Number(pt.latitude),
            lng: Number(pt.longitude),
            title: pt.organization_name,
            description: pt.description ?? undefined,
            source: 'supabase',
          } as MapMarker);
        }

        setCounts({
          waterResources: waterResources.filter(w => w.latitude != null).length,
          projects: projects.filter(p => p.latitude != null).length,
          partnerships: partnerships.filter(p => p.latitude != null).length,
        });
        setMarkers(allMarkers);
      } catch (err) {
        console.warn('Failed to fetch Supabase markers:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, []);

  return { markers, loading, counts };
}
