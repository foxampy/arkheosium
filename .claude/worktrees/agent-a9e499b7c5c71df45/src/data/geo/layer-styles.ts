// ═══════════════════════════════════════════════════════════════
//  MapLibre layer style definitions for Natural Earth geo data.
//  Visual styles follow gov-edition design spec section 4.2.
// ═══════════════════════════════════════════════════════════════

import type { LayerSpecification } from 'maplibre-gl';
import { MAP_COLORS } from '@/lib/map-config';
import type { LayerKey } from '@/components/map/types';

export interface LayerDef {
  /** id of the source registered on the map */
  sourceId: string;
  /** one or more layer specs (some layers need fill + outline + glow) */
  layers: LayerSpecification[];
}

/**
 * Layer definitions keyed by LayerKey. Some keys produce multiple layer specs
 * (e.g. glaciers = soft glow + solid fill). All `id`s start with `layer-` so we
 * can find/toggle/remove them safely.
 */
export const LAYER_DEFS: Record<LayerKey, LayerDef | undefined> = {
  rivers: {
    sourceId: 'rivers',
    layers: [
      {
        id: 'layer-rivers',
        type: 'line',
        source: 'rivers',
        paint: {
          'line-width': [
            'interpolate',
            ['linear'],
            ['zoom'],
            1, 0.3,
            4, 0.8,
            8, 1.8,
            12, 3.2,
            16, 5,
          ],
          'line-color': MAP_COLORS.river,
          'line-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            1, 0.55,
            6, 0.85,
            12, 0.95,
          ],
          'line-blur': 0.4,
        },
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
      },
    ],
  },

  lakes: {
    sourceId: 'lakes',
    layers: [
      {
        id: 'layer-lakes-fill',
        type: 'fill',
        source: 'lakes',
        paint: {
          'fill-color': MAP_COLORS.ocean,
          'fill-opacity': 0.7,
        },
      },
      {
        id: 'layer-lakes-outline',
        type: 'line',
        source: 'lakes',
        paint: {
          'line-color': MAP_COLORS.river,
          'line-width': [
            'interpolate',
            ['linear'],
            ['zoom'],
            2, 0.3,
            8, 1,
            14, 2,
          ],
          'line-opacity': 0.7,
        },
      },
    ],
  },

  glaciers: {
    sourceId: 'glaciers',
    layers: [
      {
        id: 'layer-glaciers-glow',
        type: 'line',
        source: 'glaciers',
        paint: {
          'line-color': MAP_COLORS.glacierGlow,
          'line-width': 4,
          'line-blur': 6,
          'line-opacity': 0.45,
        },
      },
      {
        id: 'layer-glaciers-fill',
        type: 'fill',
        source: 'glaciers',
        paint: {
          'fill-color': MAP_COLORS.glacier,
          'fill-opacity': 0.6,
          'fill-outline-color': MAP_COLORS.glacierGlow,
        },
      },
    ],
  },

  borders: {
    sourceId: 'borders',
    layers: [
      {
        id: 'layer-borders',
        type: 'line',
        source: 'borders',
        paint: {
          'line-color': MAP_COLORS.borderDefault,
          'line-width': [
            'interpolate',
            ['linear'],
            ['zoom'],
            1, 0.3,
            6, 0.7,
            12, 1.2,
          ],
          'line-opacity': 0.7,
        },
      },
    ],
  },

  cities: {
    sourceId: 'cities',
    layers: [
      {
        id: 'layer-cities',
        type: 'circle',
        source: 'cities',
        minzoom: 3,
        paint: {
          'circle-color': MAP_COLORS.city,
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            3, 1,
            6, 2,
            10, 4,
            14, 6,
          ],
          'circle-opacity': 0.9,
          'circle-stroke-color': MAP_COLORS.background,
          'circle-stroke-width': 0.5,
        },
      },
    ],
  },

  // ─── Groundwater aquifer zones ────────────────────────────
  groundwater: {
    sourceId: 'groundwater',
    layers: [
      {
        id: 'layer-groundwater-fill',
        type: 'fill',
        source: 'groundwater',
        paint: {
          'fill-color': [
            'match',
            ['get', 'level'],
            'high', 'rgba(99, 102, 241, 0.35)',
            'moderate', 'rgba(99, 102, 241, 0.22)',
            'low', 'rgba(99, 102, 241, 0.12)',
            'rgba(99, 102, 241, 0.15)',
          ] as unknown as string,
          'fill-opacity': 0.7,
        },
      },
      {
        id: 'layer-groundwater-outline',
        type: 'line',
        source: 'groundwater',
        paint: {
          'line-color': '#818cf8',
          'line-width': 1.5,
          'line-opacity': 0.6,
          'line-dasharray': [3, 2] as unknown as number[],
        },
      },
    ],
  },

  // ─── Water scarcity regions ───────────────────────────────
  scarcity: {
    sourceId: 'scarcity',
    layers: [
      {
        id: 'layer-scarcity-fill',
        type: 'fill',
        source: 'scarcity',
        paint: {
          'fill-color': [
            'match',
            ['get', 'severity'],
            'critical', 'rgba(239, 68, 68, 0.30)',
            'high', 'rgba(249, 115, 22, 0.25)',
            'moderate', 'rgba(234, 179, 8, 0.20)',
            'low', 'rgba(34, 197, 94, 0.15)',
            'rgba(148, 163, 184, 0.15)',
          ] as unknown as string,
          'fill-opacity': 0.8,
        },
      },
      {
        id: 'layer-scarcity-outline',
        type: 'line',
        source: 'scarcity',
        paint: {
          'line-color': [
            'match',
            ['get', 'severity'],
            'critical', '#ef4444',
            'high', '#f97316',
            'moderate', '#eab308',
            'low', '#22c55e',
            '#94a3b8',
          ] as unknown as string,
          'line-width': 1.5,
          'line-opacity': 0.5,
        },
      },
    ],
  },

  // ─── Drought forecast ─────────────────────────────────────
  drought: {
    sourceId: 'drought',
    layers: [
      {
        id: 'layer-drought-fill',
        type: 'fill',
        source: 'drought',
        paint: {
          'fill-color': ['get', 'color'] as unknown as string,
          'fill-opacity': 0.4,
        },
      },
      {
        id: 'layer-drought-outline',
        type: 'line',
        source: 'drought',
        paint: {
          'line-color': ['get', 'color'] as unknown as string,
          'line-width': 1.5,
          'line-opacity': 0.6,
        },
      },
    ],
  },

  // ─── Water quality overlay ────────────────────────────────
  water_quality: {
    sourceId: 'water_quality',
    layers: [
      {
        id: 'layer-water-quality-circles',
        type: 'circle',
        source: 'water_quality',
        paint: {
          'circle-color': ['get', 'color'] as unknown as string,
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            3, 6,
            6, 10,
            10, 16,
            14, 24,
          ],
          'circle-opacity': 0.5,
          'circle-stroke-color': ['get', 'color'] as unknown as string,
          'circle-stroke-width': 2,
          'circle-stroke-opacity': 0.7,
          'circle-blur': 0.3,
        },
      },
    ],
  },
};

/** Convenience: every layer id we emit, in render order (background -> foreground). */
export const LAYER_RENDER_ORDER: LayerKey[] = [
  'scarcity',
  'groundwater',
  'drought',
  'glaciers',
  'borders',
  'lakes',
  'rivers',
  'water_quality',
  'cities',
];

/** Returns all maplibre layer ids that belong to a logical LayerKey. */
export function getLayerIdsForKey(key: LayerKey): string[] {
  const def = LAYER_DEFS[key];
  if (!def) return [];
  return def.layers.map((l) => l.id);
}
