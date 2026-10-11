// ═══════════════════════════════════════════════════════════════
//  Geo data sources — Natural Earth GeoJSON via jsDelivr CDN
//  + inline GeoJSON for groundwater, scarcity, drought, water_quality
//  Used by WaterMap to render rivers, lakes, glaciers, borders, cities.
// ═══════════════════════════════════════════════════════════════

// Helper: create a simple polygon from center + size (approx rectangle)
function makeRect(lat: number, lng: number, dLat: number, dLng: number) {
  return [
    [lng - dLng, lat - dLat],
    [lng + dLng, lat - dLat],
    [lng + dLng, lat + dLat],
    [lng - dLng, lat + dLat],
    [lng - dLng, lat - dLat],
  ];
}

// ─── Groundwater aquifer zones ──────────────────────────────
const GROUNDWATER_GEOJSON = {
  type: 'FeatureCollection' as const,
  features: [
    {
      type: 'Feature' as const,
      properties: { name: 'Ташкентский бассейн', level: 'high', volume_km3: 10 },
      geometry: { type: 'Polygon' as const, coordinates: [makeRect(41.31, 69.28, 0.45, 0.55)] },
    },
    {
      type: 'Feature' as const,
      properties: { name: 'Ферганский бассейн', level: 'high', volume_km3: 35 },
      geometry: { type: 'Polygon' as const, coordinates: [makeRect(40.55, 71.0, 0.6, 1.2)] },
    },
    {
      type: 'Feature' as const,
      properties: { name: 'Бухаро-Каршинский бассейн', level: 'moderate', volume_km3: 8.5 },
      geometry: { type: 'Polygon' as const, coordinates: [makeRect(39.3, 65.0, 0.7, 1.0)] },
    },
    {
      type: 'Feature' as const,
      properties: { name: 'Навоийский бассейн', level: 'low', volume_km3: 3 },
      geometry: { type: 'Polygon' as const, coordinates: [makeRect(40.1, 65.4, 0.35, 0.5)] },
    },
    {
      type: 'Feature' as const,
      properties: { name: 'Самаркандский бассейн', level: 'moderate', volume_km3: 5 },
      geometry: { type: 'Polygon' as const, coordinates: [makeRect(39.65, 66.95, 0.35, 0.55)] },
    },
    {
      type: 'Feature' as const,
      properties: { name: 'Сурхандарьинский бассейн', level: 'moderate', volume_km3: 4 },
      geometry: { type: 'Polygon' as const, coordinates: [makeRect(37.8, 67.27, 0.4, 0.5)] },
    },
    {
      type: 'Feature' as const,
      properties: { name: 'Хорезмский бассейн', level: 'low', volume_km3: 2 },
      geometry: { type: 'Polygon' as const, coordinates: [makeRect(41.55, 60.65, 0.35, 0.45)] },
    },
  ],
};

// ─── Water scarcity regions ─────────────────────────────────
const SCARCITY_GEOJSON = {
  type: 'FeatureCollection' as const,
  features: [
    {
      type: 'Feature' as const,
      properties: { name: 'Каракалпакстан', severity: 'critical', color: '#ef4444' },
      geometry: { type: 'Polygon' as const, coordinates: [makeRect(43.0, 58.5, 2.0, 2.5)] },
    },
    {
      type: 'Feature' as const,
      properties: { name: 'Хорезмская область', severity: 'high', color: '#f97316' },
      geometry: { type: 'Polygon' as const, coordinates: [makeRect(41.55, 60.65, 0.45, 0.6)] },
    },
    {
      type: 'Feature' as const,
      properties: { name: 'Бухарская область', severity: 'high', color: '#f97316' },
      geometry: { type: 'Polygon' as const, coordinates: [makeRect(39.8, 64.5, 0.8, 1.5)] },
    },
    {
      type: 'Feature' as const,
      properties: { name: 'Навоийская область', severity: 'high', color: '#f97316' },
      geometry: { type: 'Polygon' as const, coordinates: [makeRect(41.0, 64.5, 1.2, 1.8)] },
    },
    {
      type: 'Feature' as const,
      properties: { name: 'Кашкадарьинская область', severity: 'moderate', color: '#eab308' },
      geometry: { type: 'Polygon' as const, coordinates: [makeRect(38.85, 66.05, 0.6, 0.9)] },
    },
    {
      type: 'Feature' as const,
      properties: { name: 'Джизакская область', severity: 'moderate', color: '#eab308' },
      geometry: { type: 'Polygon' as const, coordinates: [makeRect(40.1, 67.85, 0.5, 0.8)] },
    },
    {
      type: 'Feature' as const,
      properties: { name: 'Сырдарьинская область', severity: 'moderate', color: '#eab308' },
      geometry: { type: 'Polygon' as const, coordinates: [makeRect(40.35, 68.7, 0.35, 0.6)] },
    },
    {
      type: 'Feature' as const,
      properties: { name: 'Ташкентская область', severity: 'low', color: '#22c55e' },
      geometry: { type: 'Polygon' as const, coordinates: [makeRect(41.31, 69.28, 0.5, 0.65)] },
    },
    {
      type: 'Feature' as const,
      properties: { name: 'Ферганская область', severity: 'low', color: '#22c55e' },
      geometry: { type: 'Polygon' as const, coordinates: [makeRect(40.38, 71.8, 0.35, 0.45)] },
    },
    {
      type: 'Feature' as const,
      properties: { name: 'Андижанская область', severity: 'low', color: '#22c55e' },
      geometry: { type: 'Polygon' as const, coordinates: [makeRect(40.78, 72.35, 0.3, 0.4)] },
    },
    {
      type: 'Feature' as const,
      properties: { name: 'Наманганская область', severity: 'low', color: '#22c55e' },
      geometry: { type: 'Polygon' as const, coordinates: [makeRect(41.0, 71.0, 0.35, 0.5)] },
    },
    {
      type: 'Feature' as const,
      properties: { name: 'Сурхандарьинская область', severity: 'moderate', color: '#eab308' },
      geometry: { type: 'Polygon' as const, coordinates: [makeRect(37.8, 67.27, 0.5, 0.65)] },
    },
    {
      type: 'Feature' as const,
      properties: { name: 'Самаркандская область', severity: 'moderate', color: '#eab308' },
      geometry: { type: 'Polygon' as const, coordinates: [makeRect(39.65, 66.95, 0.45, 0.65)] },
    },
  ],
};

// ─── Drought forecast zones ─────────────────────────────────
// Displayed when user toggles "Прогноз засухи" layer.
// Static fallback zones; real data is fetched from Open-Meteo at runtime.
const DROUGHT_GEOJSON = {
  type: 'FeatureCollection' as const,
  features: [] as any[],
};

// ─── Water quality overlay ──────────────────────────────────
const WATER_QUALITY_GEOJSON = {
  type: 'FeatureCollection' as const,
  features: [] as any[],
};

export const GEO_SOURCES = {
  rivers:
    'https://cdn.jsdelivr.net/gh/martynafford/natural-earth-geojson@master/10m/physical/ne_10m_rivers_lake_centerlines.json',
  lakes:
    'https://cdn.jsdelivr.net/gh/martynafford/natural-earth-geojson@master/10m/physical/ne_10m_lakes.json',
  glaciers:
    'https://cdn.jsdelivr.net/gh/martynafford/natural-earth-geojson@master/10m/physical/ne_10m_glaciated_areas.json',
  borders:
    'https://cdn.jsdelivr.net/gh/martynafford/natural-earth-geojson@master/10m/cultural/ne_10m_admin_0_countries.json',
  cities:
    'https://cdn.jsdelivr.net/gh/martynafford/natural-earth-geojson@master/10m/cultural/ne_10m_populated_places_simple.json',
  groundwater: GROUNDWATER_GEOJSON as any,
  scarcity: SCARCITY_GEOJSON as any,
  drought: DROUGHT_GEOJSON as any,
  water_quality: WATER_QUALITY_GEOJSON as any,
} as const;

export type SourceKey = keyof typeof GEO_SOURCES;
