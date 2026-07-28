import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

// The knowledge graph lives in `entity_relationships`: typed edges whose
// source_id / target_id reference the SLUG of an object / project / subject.
// We resolve those slugs to coordinates (via water_resources / projects /
// stakeholders) and emit a GeoJSON FeatureCollection of great-circle-ish
// straight lines that maplibre can render as a glowing relationship web.

const ROW_LIMIT = 5000;

/** Relationship categories → colour + human label (RU). Drives edge styling. */
export type EdgeCategory = 'operational' | 'financial' | 'development' | 'infrastructure' | 'other';

export const EDGE_CATEGORY_META: Record<EdgeCategory, { color: string; labelRu: string }> = {
  operational: { color: '#00e6c8', labelRu: 'Операционные' },
  financial: { color: '#f59e0b', labelRu: 'Финансовые' },
  development: { color: '#3b82f6', labelRu: 'Развитие' },
  infrastructure: { color: '#c084fc', labelRu: 'Инфраструктура' },
  other: { color: '#94a3b8', labelRu: 'Прочие' },
};

const REL_TO_CATEGORY: Record<string, EdgeCategory> = {
  operates: 'operational', manages: 'operational', governs: 'operational',
  developed: 'operational', supplies: 'operational', represents: 'operational',
  finances: 'financial', funds: 'financial', certifies: 'financial',
  invests: 'financial', investor: 'financial',
  develops: 'development', expands: 'development', protects: 'development',
  restores: 'development', modernizes: 'development', partners_with: 'development',
  connected_to: 'infrastructure',
};

function categoryOf(relationship: string | null): EdgeCategory {
  if (!relationship) return 'other';
  return REL_TO_CATEGORY[relationship] ?? 'other';
}

interface RawEdge {
  source_type: string;
  source_id: string;
  target_type: string;
  target_id: string;
  relationship_type: string | null;
  strength: number | null;
}

interface Coord {
  lng: number;
  lat: number;
}

export interface GraphEdgesResult {
  /** GeoJSON FeatureCollection of LineStrings ready for a maplibre source. */
  edges: GeoJSON.FeatureCollection;
  /** Number of geo-resolvable edges rendered. */
  count: number;
  loading: boolean;
}

const EMPTY_FC: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] };

export function useSupabaseGraph(): GraphEdgesResult {
  const [edges, setEdges] = useState<GeoJSON.FeatureCollection>(EMPTY_FC);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      try {
        // Only object/project/subject edges are map-drawable (organizations &
        // bare stakeholders have no coordinates).
        const [relRes, wrRes, prRes, skRes] = await Promise.all([
          supabase
            .from('entity_relationships')
            .select('source_type,source_id,target_type,target_id,relationship_type,strength')
            .in('source_type', ['object', 'project', 'subject'])
            .in('target_type', ['object', 'project', 'subject'])
            .range(0, ROW_LIMIT),
          supabase.from('water_resources').select('slug,latitude,longitude').range(0, ROW_LIMIT),
          supabase.from('projects').select('slug,latitude,longitude').range(0, ROW_LIMIT),
          supabase.from('stakeholders').select('slug,latitude,longitude').range(0, ROW_LIMIT),
        ]);

        // slug → coordinate lookup (one map keyed by slug; slugs are globally unique).
        const bySlug = new Map<string, Coord>();
        const ingest = (rows: any[] | null) => {
          for (const r of rows ?? []) {
            if (!r?.slug || r.latitude == null || r.longitude == null) continue;
            bySlug.set(r.slug, { lng: Number(r.longitude), lat: Number(r.latitude) });
          }
        };
        ingest(wrRes.data as any[]);
        ingest(prRes.data as any[]);
        ingest(skRes.data as any[]);

        const features: GeoJSON.Feature[] = [];
        for (const e of (relRes.data as RawEdge[] | null) ?? []) {
          const a = bySlug.get(e.source_id);
          const b = bySlug.get(e.target_id);
          if (!a || !b) continue;
          // Skip zero-length self loops (identical coords) — nothing to draw.
          if (a.lng === b.lng && a.lat === b.lat) continue;
          const category = categoryOf(e.relationship_type);
          features.push({
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: [[a.lng, a.lat], [b.lng, b.lat]] },
            properties: {
              category,
              color: EDGE_CATEGORY_META[category].color,
              relationship: e.relationship_type ?? 'related',
              strength: e.strength ?? 1,
            },
          });
        }

        if (!cancelled) {
          setEdges({ type: 'FeatureCollection', features });
          setCount(features.length);
        }
      } catch (err) {
        console.warn('Failed to build knowledge-graph edges:', err);
        if (!cancelled) {
          setEdges(EMPTY_FC);
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

  return { edges, count, loading };
}
