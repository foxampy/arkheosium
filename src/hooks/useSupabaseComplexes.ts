import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { DOMAIN_CONFIG, normalizeDomain } from '@/lib/domains';

// Complexes (`entity_groups`) are geo-anchored hubs that bundle several
// objects/projects/subjects — often across domains. We surface them on the map
// as glowing hub markers (a distinct GeoJSON circle layer, separate from the
// per-entity markers) so users can spot integrated resource complexes at a
// glance and click through to their members.

const ROW_LIMIT = 2000;

export interface ComplexesResult {
  /** GeoJSON FeatureCollection of Point hubs ready for a maplibre source. */
  complexes: GeoJSON.FeatureCollection;
  count: number;
  loading: boolean;
}

interface RawGroup {
  slug: string;
  name: string | null;
  name_ru: string | null;
  description_ru: string | null;
  latitude: number | null;
  longitude: number | null;
  domain: string | null;
}

const EMPTY_FC: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] };

export function useSupabaseComplexes(): ComplexesResult {
  const [complexes, setComplexes] = useState<GeoJSON.FeatureCollection>(EMPTY_FC);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('entity_groups')
          .select('slug,name,name_ru,description_ru,latitude,longitude,domain')
          .range(0, ROW_LIMIT);
        if (error) throw error;

        const features: GeoJSON.Feature[] = [];
        for (const g of (data as RawGroup[] | null) ?? []) {
          if (g.latitude == null || g.longitude == null) continue;
          const domain = normalizeDomain(g.domain ?? 'water');
          const color = DOMAIN_CONFIG[domain]?.color ?? '#00e6c8';
          features.push({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [Number(g.longitude), Number(g.latitude)] },
            properties: {
              slug: g.slug,
              title: g.name_ru || g.name || g.slug,
              description: g.description_ru ?? '',
              domain,
              color,
            },
          });
        }

        if (!cancelled) {
          setComplexes({ type: 'FeatureCollection', features });
          setCount(features.length);
        }
      } catch (err) {
        console.warn('Failed to load complexes:', err);
        if (!cancelled) {
          setComplexes(EMPTY_FC);
          setCount(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return { complexes, count, loading };
}
