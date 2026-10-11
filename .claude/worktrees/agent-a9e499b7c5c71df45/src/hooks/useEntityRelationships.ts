// ═══════════════════════════════════════════════════════════════
//  useEntityRelationships — fetch entity relationships from Supabase
//  Returns relationships where the entity is either source or target
// ═══════════════════════════════════════════════════════════════

import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface EntityRelationship {
  id: string;
  source_type: string;
  source_id: string;
  target_type: string;
  target_id: string;
  relationship_type: string | null;
  description: string | null;
  strength: number | null;
}

export function useEntityRelationships() {
  const fetchRelationships = useCallback(
    async (entityType: string, entityId: string): Promise<EntityRelationship[]> => {
      try {
        // Fetch relationships where entity is source
        const { data: asSource, error: err1 } = await supabase
          .from('entity_relationships')
          .select('*')
          .eq('source_type', entityType)
          .eq('source_id', entityId);

        if (err1) throw err1;

        // Fetch relationships where entity is target
        const { data: asTarget, error: err2 } = await supabase
          .from('entity_relationships')
          .select('*')
          .eq('target_type', entityType)
          .eq('target_id', entityId);

        if (err2) throw err2;

        // Merge and deduplicate by id
        const all = [...(asSource || []), ...(asTarget || [])] as EntityRelationship[];
        const seen = new Set<string>();
        return all.filter((r) => {
          if (seen.has(r.id)) return false;
          seen.add(r.id);
          return true;
        });
      } catch (e: any) {
        console.warn('[useEntityRelationships]', e);
        return [];
      }
    },
    [],
  );

  return { fetchRelationships };
}
