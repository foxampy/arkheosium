import * as THREE from 'three';

/**
 * Convert geographic lat/lng (degrees) to a point on a sphere of the given
 * radius, in the same orientation as the equirectangular Earth textures used
 * by {@link earthMaterial}. Longitude 0 / latitude 0 sits on the +X side and
 * the mapping matches three.js SphereGeometry UVs (u = lng, v = lat).
 */
export function latLngToVec3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

/** Surface normal (unit) at a lat/lng — handy for orienting decals/markers. */
export function latLngNormal(lat: number, lng: number): THREE.Vector3 {
  return latLngToVec3(lat, lng, 1).normalize();
}

/** Aral Sea centroid (region focus for the drying story). */
export const ARAL_COORD = { lat: 45.0, lng: 59.5 } as const;

/** Regions surfaced as interactive markers on the globe. */
export interface GlobeRegion {
  id: string;
  label: string;
  sub: string;
  lat: number;
  lng: number;
  color: string;
}

export const GLOBE_REGIONS: GlobeRegion[] = [
  { id: 'aral', label: 'Аральское море', sub: 'Флагман · Каракалпакия', lat: 45.0, lng: 59.5, color: '#00e6c8' },
  { id: 'amudarya', label: 'Амударья', sub: 'Питающая река', lat: 40.5, lng: 62.0, color: '#00d4ff' },
  { id: 'syrdarya', label: 'Сырдарья', sub: 'Северный контур', lat: 44.8, lng: 65.8, color: '#7dd3fc' },
  { id: 'tashkent', label: 'Ташкент', sub: 'Хаб региона', lat: 41.3, lng: 69.2, color: '#a3e635' },
];
