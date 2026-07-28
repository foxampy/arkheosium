import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { MapMarker } from '@/components/map/types';

// PostgREST caps a single request at `max-rows` (default 1000). We set an
// explicit high range so every geolocated row is returned as the DB grows.
const ROW_LIMIT = 5000;

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
  domain: string | null;
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
  domain: string | null;
}

interface SupabaseStakeholder {
  id: number;
  full_name: string | null;
  name_ru: string | null;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  stakeholder_type: string | null;
  country: string | null;
  domain: string | null;
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
  const [counts, setCounts] = useState({ waterResources: 0, projects: 0, subjects: 0, partnerships: 0 });

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      try {
        // stakeholders is the primary subject table (multi-domain, slug-based);
        // partnerships is legacy but still carries geolocated orgs — we render both.
        const [wrRes, prRes, skRes, ptRes] = await Promise.all([
          supabase.from('water_resources')
            .select('id,name,description,latitude,longitude,status,category,object_type,country,region,total_funding,capacity,domain')
            .range(0, ROW_LIMIT),
          supabase.from('projects')
            .select('id,name,description,latitude,longitude,status,total_funding,region,country,domain')
            .range(0, ROW_LIMIT),
          supabase.from('stakeholders')
            .select('id,full_name,name_ru,description,latitude,longitude,stakeholder_type,country,domain')
            .range(0, ROW_LIMIT),
          supabase.from('partnerships')
            .select('id,organization_name,description,latitude,longitude,partnership_type,organization_type,status,country')
            .range(0, ROW_LIMIT),
        ]);

        const allMarkers: MapMarker[] = [];

        // Water resources / objects (coloured by domain)
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
            domain: wr.domain ?? 'water',
            objectType: wr.object_type ?? undefined,
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
            domain: p.domain ?? 'water',
          } as MapMarker);
        }

        // Stakeholders (subjects) — primary subject source
        const stakeholders = (skRes.data as SupabaseStakeholder[] | null) ?? [];
        for (const sk of stakeholders) {
          if (sk.latitude == null || sk.longitude == null) continue;
          allMarkers.push({
            id: `sb-sk-${sk.id}`,
            type: 'subject',
            lat: Number(sk.latitude),
            lng: Number(sk.longitude),
            title: sk.name_ru ?? sk.full_name ?? 'Субъект',
            description: sk.description ?? undefined,
            source: 'supabase',
            domain: sk.domain ?? 'water',
          } as MapMarker);
        }

        // Partnerships (legacy subjects) — kept for coverage
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
            domain: 'water',
          } as MapMarker);
        }

        setCounts({
          waterResources: waterResources.filter(w => w.latitude != null).length,
          projects: projects.filter(p => p.latitude != null).length,
          subjects: stakeholders.filter(s => s.latitude != null).length,
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
