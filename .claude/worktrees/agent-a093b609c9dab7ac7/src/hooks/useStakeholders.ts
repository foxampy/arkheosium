// ═══════════════════════════════════════════════════════════════
//  useStakeholders — fetch stakeholders from Supabase
//  Provides filtering, search, and fetchById
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface Stakeholder {
  id: string;
  full_name: string;
  full_name_en: string | null;
  position: string | null;
  activity_area: string | null;
  region: string | null;
  country: string | null;
  related_objects: string[];
  related_subjects: string[];
  description: string | null;
  website: string | null;
  email: string | null;
  photo_url: string | null;
  latitude: number | null;
  longitude: number | null;
  stakeholder_type: string | null;
  priority: string | null;
  tags: string[];
  created_at: string;
}

export interface StakeholderFilters {
  search: string;
  stakeholderType: string;
}

const DEFAULT_FILTERS: StakeholderFilters = {
  search: '',
  stakeholderType: '',
};

export function useStakeholders() {
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<StakeholderFilters>(DEFAULT_FILTERS);

  const fetchStakeholders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('stakeholders')
        .select('*')
        .order('full_name');

      if (err) throw err;
      setStakeholders((data || []) as Stakeholder[]);
    } catch (e: any) {
      console.warn('[useStakeholders]', e);
      setError('Не удалось загрузить стейкхолдеров');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStakeholders();
  }, [fetchStakeholders]);

  // Extract unique stakeholder types for filter chips
  const stakeholderTypes = useMemo(() => {
    const set = new Set<string>();
    stakeholders.forEach((s) => {
      if (s.stakeholder_type) set.add(s.stakeholder_type);
    });
    return Array.from(set).sort();
  }, [stakeholders]);

  // Apply client-side filters
  const filteredStakeholders = useMemo(() => {
    const q = filters.search.toLowerCase();
    return stakeholders.filter((s) => {
      // Text search
      if (q) {
        const searchable = [
          s.full_name,
          s.full_name_en,
          s.position,
          s.activity_area,
          s.region,
          s.country,
          s.description,
          ...(s.tags || []),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!searchable.includes(q)) return false;
      }

      // Stakeholder type
      if (filters.stakeholderType && s.stakeholder_type !== filters.stakeholderType) return false;

      return true;
    });
  }, [stakeholders, filters]);

  // Fetch single stakeholder by ID
  const fetchById = useCallback(async (id: string): Promise<Stakeholder> => {
    const { data, error: err } = await supabase
      .from('stakeholders')
      .select('*')
      .eq('id', id)
      .single();

    if (err) throw err;
    return data as Stakeholder;
  }, []);

  return {
    stakeholders: filteredStakeholders,
    allStakeholders: stakeholders,
    loading,
    error,
    filters,
    setFilters,
    resetFilters: () => setFilters(DEFAULT_FILTERS),
    stakeholderTypes,
    totalCount: stakeholders.length,
    filteredCount: filteredStakeholders.length,
    fetchById,
    refetch: fetchStakeholders,
  };
}
