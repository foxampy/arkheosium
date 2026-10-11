import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface SbObject {
  id: string;
  name: string;
  nameRu: string;
  type: string;
  region: string;
  description: string;
  source: 'supabase';
}

export interface SbSubject {
  id: string;
  name: string;
  nameRu: string;
  type: string;
  region: string;
  description: string;
  source: 'supabase';
}

export interface SbProject {
  id: string;
  name: string;
  nameRu: string;
  type: string;
  category: string;
  region: string;
  description: string;
  budget?: string;
  color: string;
  source: 'supabase';
}

export function useSupabaseHubData() {
  const [objects, setObjects] = useState<SbObject[]>([]);
  const [subjects, setSubjects] = useState<SbSubject[]>([]);
  const [projects, setProjects] = useState<SbProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      try {
        const [wrRes, prRes, ptRes] = await Promise.all([
          supabase.from('water_resources').select('id,name,description,status,category,object_type,country,region,total_funding,capacity'),
          supabase.from('projects').select('id,name,description,status,total_funding,region,country'),
          supabase.from('partnerships').select('id,organization_name,description,partnership_type,organization_type,status,country'),
        ]);

        // Water resources → Objects
        const wrData = (wrRes.data ?? []) as any[];
        setObjects(wrData.map((wr) => ({
          id: `sb-wr-${wr.id}`,
          name: wr.name || '',
          nameRu: wr.name || '',
          type: wr.object_type || wr.category || 'Водный ресурс',
          region: wr.region || wr.country || '',
          description: wr.description || '',
          source: 'supabase' as const,
        })));

        // Projects
        const prData = (prRes.data ?? []) as any[];
        setProjects(prData.map((p) => ({
          id: `sb-pr-${p.id}`,
          name: p.name || '',
          nameRu: p.name || '',
          type: p.status || 'Проект',
          category: p.status || 'Водный проект',
          region: p.region || p.country || '',
          description: p.description || '',
          budget: p.total_funding ? `$${(p.total_funding / 1_000_000).toFixed(1)}M` : undefined,
          color: '#4ade80',
          source: 'supabase' as const,
        })));

        // Partnerships → Subjects
        const ptData = (ptRes.data ?? []) as any[];
        setSubjects(ptData.map((pt) => ({
          id: `sb-pt-${pt.id}`,
          name: pt.organization_name || '',
          nameRu: pt.organization_name || '',
          type: pt.organization_type || pt.partnership_type || 'Организация',
          region: pt.country || '',
          description: pt.description || '',
          source: 'supabase' as const,
        })));
      } catch (err) {
        console.warn('Failed to fetch Supabase hub data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, []);

  return { objects, subjects, projects, loading };
}
