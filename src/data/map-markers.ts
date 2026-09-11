// ═══════════════════════════════════════════════════════════════
//  Map markers aggregator
//
//  Walks all entity data modules (objects, subjects, projects) and
//  returns a flat list of MapMarker entries — anything with usable
//  lat/lng coordinates becomes a clickable map marker.
//
//  Consumers (e.g. GovDashboard, public dashboard, hero overlays)
//  call getAllMapMarkers() once and feed the result into <WaterMap />.
//
//  Tolerant: any entry missing coordinates is silently skipped.
// ═══════════════════════════════════════════════════════════════

import type { MapMarker, EntityType } from '@/components/map/types';
import { OBJECTS_DATA } from './objects-data';
import { SUBJECTS_DATA } from './subjects-data';
import { PROJECTS_DATA } from './projects-data';
import { ALL_FULL_OBJECTS } from './objects';

/** Anything shaped roughly like { coordinates: { lat, lng } } | { lat, lng }. */
type CoordSource =
  | { coordinates?: { lat?: unknown; lng?: unknown } | null }
  | { lat?: unknown; lng?: unknown }
  | Record<string, unknown>;

function pickCoords(entry: CoordSource): { lat: number; lng: number } | null {
  // 1. Try nested `coordinates: { lat, lng }`
  const coords = (entry as { coordinates?: { lat?: unknown; lng?: unknown } })
    .coordinates;
  if (
    coords &&
    typeof (coords as { lat: unknown }).lat === 'number' &&
    typeof (coords as { lng: unknown }).lng === 'number'
  ) {
    return {
      lat: (coords as { lat: number }).lat,
      lng: (coords as { lng: number }).lng,
    };
  }
  // 2. Try flat lat/lng on the entry itself
  const flatLat = (entry as { lat?: unknown }).lat;
  const flatLng = (entry as { lng?: unknown }).lng;
  if (typeof flatLat === 'number' && typeof flatLng === 'number') {
    return { lat: flatLat, lng: flatLng };
  }
  return null;
}

function pickTitle(entry: Record<string, unknown>): string {
  return (
    (entry.name_ru as string | undefined) ??
    (entry.name as string | undefined) ??
    (entry.name_en as string | undefined) ??
    (entry.id as string | undefined) ??
    'Без названия'
  );
}

function pickDescription(entry: Record<string, unknown>): string | undefined {
  const desc =
    (entry.description as string | undefined) ??
    (entry.description_ru as string | undefined) ??
    (entry.description_en as string | undefined);
  if (!desc) return undefined;
  // truncate long descriptions for popup readability
  return desc.length > 160 ? desc.slice(0, 157) + '…' : desc;
}

function pickString(entry: Record<string, unknown>, key: string): string | undefined {
  const v = entry[key];
  return typeof v === 'string' && v.trim() ? v : undefined;
}

function makeMarker(
  entry: Record<string, unknown>,
  type: EntityType,
): MapMarker | null {
  const coords = pickCoords(entry as CoordSource);
  if (!coords) return null;
  const id = entry.id as string | undefined;
  if (!id) return null;
  return {
    id,
    type,
    lat: coords.lat,
    lng: coords.lng,
    title: pickTitle(entry),
    description: pickDescription(entry),
    // Домен и административная привязка нужны группировке и легенде: без них
    // метка на уровне области падает в общую группу страны.
    domain: pickString(entry, 'domain'),
    country: pickString(entry, 'country'),
    region: pickString(entry, 'region'),
    district: pickString(entry, 'district'),
  };
}

/**
 * Returns all map markers aggregated from the entity data modules.
 * Deduplicates by `${type}:${id}` so an object that exists both in
 * OBJECTS_DATA and ALL_FULL_OBJECTS is emitted only once.
 */
export function getAllMapMarkers(): MapMarker[] {
  const seen = new Set<string>();
  const out: MapMarker[] = [];

  const push = (m: MapMarker | null) => {
    if (!m) return;
    const key = `${m.type}:${m.id}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push(m);
  };

  for (const o of OBJECTS_DATA) {
    push(makeMarker(o as unknown as Record<string, unknown>, 'object'));
  }
  for (const o of ALL_FULL_OBJECTS) {
    push(makeMarker(o as unknown as Record<string, unknown>, 'object'));
  }
  for (const s of SUBJECTS_DATA) {
    push(makeMarker(s as unknown as Record<string, unknown>, 'subject'));
  }
  for (const p of PROJECTS_DATA) {
    push(makeMarker(p as unknown as Record<string, unknown>, 'project'));
  }

  return out;
}

/**
 * Returns only markers matching the given entity types.
 * Useful for type-filtered views (e.g. show only objects on a detail page).
 */
export function getMapMarkersByType(...types: EntityType[]): MapMarker[] {
  const allowed = new Set(types);
  return getAllMapMarkers().filter((m) => allowed.has(m.type));
}
