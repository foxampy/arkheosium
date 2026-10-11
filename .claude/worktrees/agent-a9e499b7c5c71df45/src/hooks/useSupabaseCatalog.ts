// ═══════════════════════════════════════════════════════════════
//  useSupabaseCatalog — fetch technologies & equipment from Supabase catalog_items
//  Provides filtering, search, counts, and category/manufacturer extraction
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface CatalogItem {
  id: string;
  item_type: 'technology' | 'equipment';
  name_ru: string;
  name_en: string;
  category: string;
  subcategory: string | null;
  manufacturer: string | null;
  country_of_origin: string | null;
  description: string;
  price_min: number | null;
  price_max: number | null;
  price_currency: string;
  price_unit: string | null;
  image_url: string | null;
  maturity_level: string | null;
  specifications: Record<string, string>;
  advantages: string[];
  applications: string[];
  certifications: string[];
  website: string | null;
  model_number: string | null;
  power_kw: number | null;
  capacity_m3h: number | null;
  weight_kg: number | null;
  dimensions: string | null;
  warranty_years: number | null;
  tags: string[];
  // Extended fields
  optimal_conditions: Record<string, string>;
  recommendations: string | null;
  documentation_url: string | null;
  datasheet_url: string | null;
  installation_notes: string | null;
  maintenance_interval: string | null;
  lifespan_years: number | null;
  energy_efficiency_class: string | null;
  noise_level_db: number | null;
  operating_temp_min: number | null;
  operating_temp_max: number | null;
  operating_pressure_bar: number | null;
  material: string | null;
  connection_type: string | null;
  protection_class: string | null;
  flow_rate_range: string | null;
  efficiency_percent: number | null;
  voltage: string | null;
  frequency: string | null;
  created_at: string;
}

export interface CatalogFilters {
  search: string;
  category: string;
  manufacturer: string;
  country: string;
  priceMin: number | null;
  priceMax: number | null;
}

const DEFAULT_FILTERS: CatalogFilters = {
  search: '',
  category: '',
  manufacturer: '',
  country: '',
  priceMin: null,
  priceMax: null,
};

export function useSupabaseCatalog(itemType?: 'technology' | 'equipment') {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CatalogFilters>(DEFAULT_FILTERS);

  // Fetch all items of given type (or all)
  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('catalog_items')
        .select('*')
        .order('name_ru');

      if (itemType) {
        query = query.eq('item_type', itemType);
      }

      const { data, error: err } = await query;
      if (err) throw err;

      setItems((data || []) as CatalogItem[]);
    } catch (e: any) {
      console.warn('[useSupabaseCatalog]', e);
      setError('Не удалось загрузить каталог');
    } finally {
      setLoading(false);
    }
  }, [itemType]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Extract unique values for filter chips
  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return Array.from(set).sort();
  }, [items]);

  const manufacturers = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.manufacturer) set.add(item.manufacturer);
    });
    return Array.from(set).sort();
  }, [items]);

  const countries = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.country_of_origin) set.add(item.country_of_origin);
    });
    return Array.from(set).sort();
  }, [items]);

  // Apply client-side filters
  const filteredItems = useMemo(() => {
    const q = filters.search.toLowerCase();
    return items.filter((item) => {
      // Text search
      if (q) {
        const searchable = [
          item.name_ru,
          item.name_en,
          item.category,
          item.subcategory,
          item.manufacturer,
          item.description,
          item.model_number,
          ...(item.applications || []),
          ...(item.tags || []),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!searchable.includes(q)) return false;
      }

      // Category
      if (filters.category && item.category !== filters.category) return false;

      // Manufacturer
      if (filters.manufacturer && item.manufacturer !== filters.manufacturer) return false;

      // Country
      if (filters.country && item.country_of_origin !== filters.country) return false;

      // Price range
      if (filters.priceMin != null && (item.price_max == null || item.price_max < filters.priceMin)) return false;
      if (filters.priceMax != null && (item.price_min == null || item.price_min > filters.priceMax)) return false;

      return true;
    });
  }, [items, filters]);

  // Split by type for convenience
  const technologies = useMemo(
    () => filteredItems.filter((i) => i.item_type === 'technology'),
    [filteredItems],
  );

  const equipment = useMemo(
    () => filteredItems.filter((i) => i.item_type === 'equipment'),
    [filteredItems],
  );

  // Fetch single item by ID
  const fetchItemById = useCallback(async (id: string) => {
    const { data, error: err } = await supabase
      .from('catalog_items')
      .select('*')
      .eq('id', id)
      .single();

    if (err) throw err;
    return data as CatalogItem;
  }, []);

  return {
    items: filteredItems,
    technologies,
    equipment,
    allItems: items,
    loading,
    error,
    filters,
    setFilters,
    resetFilters: () => setFilters(DEFAULT_FILTERS),
    categories,
    manufacturers,
    countries,
    totalCount: items.length,
    filteredCount: filteredItems.length,
    fetchItemById,
    refetch: fetchItems,
  };
}
