// ═══════════════════════════════════════════════════════════════
//  useOrganizations — fetch organizations from Supabase
//  Provides filtering, search, and fetchById
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface Organization {
  id: string;
  name: string;
  name_en: string | null;
  name_ru: string | null;
  description_en: string | null;
  description_ru: string | null;
  type_en: string | null;
  type_ru: string | null;
  org_type: string | null;
  sector: string | null;
  key_people: string | null;
  headquarters: string | null;
  region: string | null;
  country: string | null;
  description: string | null;
  key_solutions: string | null;
  key_projects: string[];
  key_initiatives: string[];
  funding_volume: string | null;
  interaction_type: string | null;
  event_status: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  logo_url: string | null;
  latitude: number | null;
  longitude: number | null;
  priority: string | null;
  tags: string[];
  ca_potential: string | null;
  created_at: string;
}

export interface OrganizationFilters {
  search: string;
  orgType: string;
}

const DEFAULT_FILTERS: OrganizationFilters = {
  search: '',
  orgType: '',
};

export function useOrganizations() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<OrganizationFilters>(DEFAULT_FILTERS);

  const fetchOrganizations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('organizations')
        .select('*')
        .order('name');

      if (err) throw err;
      setOrganizations((data || []) as Organization[]);
    } catch (e: any) {
      console.warn('[useOrganizations]', e);
      setError('Не удалось загрузить организации');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  // Extract unique org types for filter chips
  const orgTypes = useMemo(() => {
    const set = new Set<string>();
    organizations.forEach((o) => {
      if (o.org_type) set.add(o.org_type);
    });
    return Array.from(set).sort();
  }, [organizations]);

  // Apply client-side filters
  const filteredOrganizations = useMemo(() => {
    const q = filters.search.toLowerCase();
    return organizations.filter((o) => {
      // Text search
      if (q) {
        const searchable = [
          o.name,
          o.name_en,
          o.name_ru,
          o.org_type,
          o.sector,
          o.headquarters,
          o.region,
          o.country,
          o.description,
          o.key_solutions,
          o.key_people,
          ...(o.tags || []),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!searchable.includes(q)) return false;
      }

      // Org type
      if (filters.orgType && o.org_type !== filters.orgType) return false;

      return true;
    });
  }, [organizations, filters]);

  // Fetch single organization by ID
  const fetchById = useCallback(async (id: string): Promise<Organization> => {
    const { data, error: err } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', id)
      .single();

    if (err) throw err;
    return data as Organization;
  }, []);

  return {
    organizations: filteredOrganizations,
    allOrganizations: organizations,
    loading,
    error,
    filters,
    setFilters,
    resetFilters: () => setFilters(DEFAULT_FILTERS),
    orgTypes,
    totalCount: organizations.length,
    filteredCount: filteredOrganizations.length,
    fetchById,
    refetch: fetchOrganizations,
  };
}
