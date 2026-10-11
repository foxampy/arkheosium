// CARTO Dark Matter — public free basemap, no API key required.
// Works reliably and matches our dark theme exactly. If/when we
// want a fully self-hosted alternative, swap to OpenFreeMap liberty
// or self-hosted OpenMapTiles.
export const MAP_TILES = {
  styleUrl: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
};

export const MAP_DEFAULTS = {
  center: [15, 20] as [number, number],
  zoom: 2,
  minZoom: 1,
  maxZoom: 18,
};

export const MAP_COLORS = {
  background: '#0a1628',
  ocean: '#133862',
  oceanDeep: '#0a1f3a',
  river: '#22d3ee',
  riverHighlight: '#67e8f9',
  glacier: '#a5f3fc',
  glacierGlow: '#cffafe',
  groundwater: '#1e40af',
  borderDefault: '#475569',
  borderFocus: '#fbbf24',
  city: '#fbbf24',
  scarcity: '#dc2626',
  abundance: '#34d399',
};
