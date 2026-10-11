// ═══════════════════════════════════════════════════════════════
//  useSupabaseCommunity — fetch partnerships (subjects) from Supabase
//  Merges with hardcoded SUBJECTS_DATA for a complete list
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { SUBJECTS_DATA, type PlatformSubject } from '@/data/subjects-data';

export interface SupabasePartner {
  id: number;
  organization_name: string;
  contact_email: string;
  partnership_type: string | null;
  status: string | null;
  latitude: number | null;
  longitude: number | null;
  country: string | null;
  region: string | null;
  organization_type: string | null;
  website: string | null;
  description: string | null;
  employees_count: number | null;
  annual_budget: number | null;
  founded_year: number | null;
}

/** Convert a Supabase partnership row into PlatformSubject shape */
function toSubject(p: SupabasePartner): PlatformSubject {
  return {
    id: `sb-partner-${p.id}`,
    name: p.organization_name,
    name_ru: p.organization_name,
    type: p.organization_type || p.partnership_type || 'organization',
    type_label: p.organization_type || p.partnership_type || 'Организация',
    country: p.country || 'Unknown',
    location: p.region || undefined,
    coordinates: p.latitude && p.longitude
      ? { lat: Number(p.latitude), lng: Number(p.longitude) }
      : undefined,
    email: p.contact_email || undefined,
    website: p.website || undefined,
    founded_year: p.founded_year || undefined,
    staff_count: p.employees_count || undefined,
    budget_annual: p.annual_budget ? Number(p.annual_budget) : undefined,
    description: p.description || '',
    tags: [
      p.partnership_type,
      p.organization_type,
      p.status,
    ].filter(Boolean) as string[],
    last_updated: new Date().toISOString().split('T')[0],
  };
}

export function useSupabaseCommunity() {
  const [supabaseSubjects, setSupabaseSubjects] = useState<PlatformSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPartners() {
      setLoading(true);
      setError(null);
      try {
        const { data, error: err } = await supabase
          .from('partnerships')
          .select('*')
          .order('organization_name');

        if (err) throw err;
        if (data) {
          setSupabaseSubjects((data as SupabasePartner[]).map(toSubject));
        }
      } catch (e: any) {
        console.warn('[useSupabaseCommunity]', e);
        setError('Не удалось загрузить данные из базы');
      } finally {
        setLoading(false);
      }
    }

    fetchPartners();
  }, []);

  // Merge: hardcoded first, then Supabase (deduplicated by similar name)
  const allSubjects = useMemo(() => {
    const hardcodedNames = new Set(
      SUBJECTS_DATA.map((s) => s.name_ru.toLowerCase().trim()),
    );

    const uniqueSupabase = supabaseSubjects.filter(
      (s) => !hardcodedNames.has(s.name_ru.toLowerCase().trim()),
    );

    return [...SUBJECTS_DATA, ...uniqueSupabase];
  }, [supabaseSubjects]);

  return {
    subjects: allSubjects,
    hardcodedCount: SUBJECTS_DATA.length,
    supabaseCount: supabaseSubjects.length,
    loading,
    error,
  };
}
