// ═══════════════════════════════════════════════════════════════
//  Region grouping — shared contract for the region-contour markers
//  used by the 3D globe (EarthGlobePage), the 2D map (WaterMap), and
//  the /journey Block-2 scene.
//
//  Instead of number-in-a-circle clusters, interconnected primary
//  structures are grouped into PREDEFINED territorial regions
//  (from regions-data.ts). Each group yields a contour anchor + a
//  small label: region name + total object count.
//
//  Pure logic, no React — safe to import anywhere.
// ═══════════════════════════════════════════════════════════════

import type { MapMarker } from '@/components/map/types';
import { ALL_REGIONS, type WaterRegion } from '@/data/regions-data';

export interface RegionGroup {
  /** WaterRegion id (e.g. 'central-asia'). */
  id: string;
  /** Localised display name (Russian). */
  name: string;
  /** Total markers assigned to this region. */
  count: number;
  /** Predefined territorial centre — anchor for contour + label. */
  centerLat: number;
  centerLng: number;
  /** Region accent colour. */
  color: string;
  /** Recommended map zoom for this region. */
  zoom: number;
  /** Ids of the markers assigned here (type:id — deduped upstream). */
  markerIds: string[];
}

// Great-circle-ish nearest-region assignment. At the scale of these
// far-apart macro-regions a simple squared planar distance on (lng,lat)
// with longitude wrap handling is precise enough and cheap.
function angularDistSq(
  aLng: number,
  aLat: number,
  bLng: number,
  bLat: number,
): number {
  let dLng = Math.abs(aLng - bLng);
  if (dLng > 180) dLng = 360 - dLng; // shortest way around the globe
  const dLat = aLat - bLat;
  // weight latitude by cos to loosely account for meridian convergence
  const cosLat = Math.cos((((aLat + bLat) / 2) * Math.PI) / 180);
  const x = dLng * cosLat;
  return x * x + dLat * dLat;
}

/**
 * Assign each marker to its nearest predefined region (the catch-all
 * 'global' region is excluded from being a target) and aggregate.
 *
 * Returns only regions that received at least one marker, sorted by
 * descending count so the biggest regions render/label first.
 */
export function groupMarkersByRegion(
  markers: MapMarker[],
  regions: WaterRegion[] = ALL_REGIONS,
): RegionGroup[] {
  const targets = regions.filter((r) => r.id !== 'global');
  if (targets.length === 0) return [];

  const acc = new Map<string, { region: WaterRegion; ids: string[] }>();

  for (const m of markers) {
    if (typeof m.lat !== 'number' || typeof m.lng !== 'number') continue;

    let best: WaterRegion | null = null;
    let bestD = Infinity;
    for (const r of targets) {
      // region.center is [lng, lat]
      const d = angularDistSq(m.lng, m.lat, r.center[0], r.center[1]);
      if (d < bestD) {
        bestD = d;
        best = r;
      }
    }
    if (!best) continue;

    const bucket = acc.get(best.id);
    const key = `${m.type}:${m.id}`;
    if (bucket) bucket.ids.push(key);
    else acc.set(best.id, { region: best, ids: [key] });
  }

  return Array.from(acc.values())
    .map(({ region, ids }) => ({
      id: region.id,
      name: region.name_ru,
      count: ids.length,
      centerLat: region.center[1],
      centerLng: region.center[0],
      color: region.color,
      zoom: region.zoom,
      markerIds: ids,
    }))
    .sort((a, b) => b.count - a.count);
}

/** Convenience: the Central Asia region group, if present (Aral sector). */
export function findCentralAsia(groups: RegionGroup[]): RegionGroup | undefined {
  return groups.find((g) => g.id === 'central-asia');
}
