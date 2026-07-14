// ═══════════════════════════════════════════════════════════════
//  Central Asia pilot — geo data sources.
//  GeoJSON files are pre-filtered to the CA bbox and stored as
//  static assets under client/public/geo/ca/ (served by Vite).
//  Spec: docs/superpowers/specs/2026-05-21-central-asia-pilot-detailed-design.md
// ═══════════════════════════════════════════════════════════════

export const CA_GEO_SOURCES = {
  rivers: '/geo/ca/rivers.json',
  lakes: '/geo/ca/lakes.json',
  glaciers: '/geo/ca/glaciers.json',
  basins: '/geo/ca/basins.json',
  groundwater: '/geo/ca/groundwater.json',
} as const;

export type CaSourceKey = keyof typeof CA_GEO_SOURCES;

/**
 * Bounding box of the Central Asia pilot region.
 * All geometries in the *.json files are clipped (or filtered) to this box.
 * Matches §1 of the CA-pilot detailed design spec.
 */
export const CA_BBOX = {
  west: 46,
  east: 81,
  south: 35,
  north: 50,
} as const;

/**
 * Convenience array form: [west, south, east, north] — the order MapLibre
 * `fitBounds` and turf.js bbox helpers expect.
 */
export const CA_BBOX_ARRAY: [number, number, number, number] = [
  CA_BBOX.west,
  CA_BBOX.south,
  CA_BBOX.east,
  CA_BBOX.north,
];

// ═══════════════════════════════════════════════════════════════
//  Hand-curated ecological status for major CA rivers.
//  X2 wave uses these to data-drive line-color via MapLibre `match`.
//  Keys must match the `name` property exported by rivers.json.
//
//  Values: 'pristine' | 'healthy' | 'under_pressure' | 'degraded'
//          | 'critical' | 'seasonal_dry'
//
//  Source: expert assessment (UNECE 2024 transboundary water reports,
//  CAREC 2023 basin status, IWMI 2023 Aral monitoring, peer-reviewed
//  literature on Murghab/Tedjen seasonal flow).
// ═══════════════════════════════════════════════════════════════
export const CA_RIVER_ECO_STATUS: Record<string, string> = {
  // Aral basin trunk — Amu Darya & Syr Darya
  'Amu Darya': 'under_pressure',
  'Syr Darya': 'degraded',
  'Zeravshan': 'under_pressure',
  'Kashka Darya': 'degraded',
  'Surkhan Darya': 'under_pressure',
  'Vakhsh': 'healthy',
  'Panj': 'healthy',
  'Pyanj': 'healthy',
  'Kafirnigan': 'under_pressure',
  'Naryn': 'healthy',
  'Kara Darya': 'under_pressure',
  'Chirchik': 'under_pressure',
  'Angren': 'under_pressure',

  // Chu-Talas basin — heavily withdrawn for irrigation
  'Chu': 'critical',
  'Talas': 'critical',
  'Asa': 'critical',

  // Balkhash-Ili basin
  'Ili': 'under_pressure',
  'Karatal': 'healthy',
  'Aksu': 'healthy',
  'Lepsy': 'healthy',

  // Irtysh basin (north-east, relatively healthy)
  'Irtysh': 'healthy',
  'Black Irtysh': 'healthy',
  'Bukhtarma': 'pristine',
  'Tobol': 'healthy',
  'Ishim': 'under_pressure',
  'Ural': 'under_pressure',

  // Turkmenistan / Iran transboundary — seasonal & critical
  'Murghab': 'critical',
  'Tedjen': 'critical',
  'Hari': 'critical',
  'Hari Rud': 'critical',
  'Atrek': 'critical',

  // Tarim basin (China side of bbox)
  'Tarim': 'degraded',
  'Aksu': 'under_pressure',
  'Yarkand': 'under_pressure',
  'Hotan': 'under_pressure',
  'Kashgar': 'degraded',

  // Lake Issyk-Kul tributaries
  'Jyrgalan': 'healthy',
  'Tup': 'healthy',
};

// ═══════════════════════════════════════════════════════════════
//  Hand-curated trophic / hydrological state for CA lakes & reservoirs.
//  Values: 'oligotrophic' | 'mesotrophic' | 'eutrophic_early'
//          | 'eutrophic' | 'hypereutrophic' | 'polluted'
//          | 'shrinking' | 'recovering'
// ═══════════════════════════════════════════════════════════════
export const CA_LAKE_STATE: Record<string, string> = {
  // Aral sea complex
  'Aral Sea': 'shrinking',
  'Aral Sea South': 'shrinking',
  'Aral Sea North': 'recovering', // Kok-Aral dam, 2005+
  'Sarykamish': 'eutrophic',

  // Caspian
  'Caspian Sea': 'mesotrophic',
  'Kara-Bogaz-Gol': 'hypereutrophic', // hypersaline

  // Balkhash & Ili system
  'Balkhash': 'mesotrophic',
  'Alakol': 'mesotrophic',
  'Sasykkol': 'eutrophic',

  // Issyk-Kul (high alpine, very clean)
  'Issyk-Kul': 'oligotrophic',
  'Son-Kul': 'oligotrophic',
  'Chatyr-Kul': 'oligotrophic',

  // Major reservoirs (Soviet-era hydropower / irrigation)
  'Toktogul Reservoir': 'mesotrophic',
  'Kayrakkum Reservoir': 'mesotrophic',
  'Charvak Reservoir': 'oligotrophic',
  'Chardarya Reservoir': 'eutrophic_early',
  'Tyuyamuyun Reservoir': 'mesotrophic',
  'Andijan Reservoir': 'mesotrophic',
  'Nurek Reservoir': 'oligotrophic',
  'Bukhtarma Reservoir': 'mesotrophic',
  'Kapchagai Reservoir': 'eutrophic_early',
  'Kara-Kum Canal': 'polluted',
  'Sarez Lake': 'oligotrophic', // natural dam, 1911 quake

  // Turkmenistan basins
  'Altyn Asyr Lake': 'polluted', // drainage-water collector
};

// ═══════════════════════════════════════════════════════════════
//  Glacier mass-balance / recession rate (m/year, negative = retreating).
//  Source: WGMS Global Glacier Change Bulletin 2020-2023, Central Asia
//  Regional Glaciological Centre (CARGC) reports, peer-reviewed papers.
//  Keys must match the `name` property exported by glaciers.json.
// ═══════════════════════════════════════════════════════════════
export const CA_GLACIER_RECESSION: Record<string, number> = {
  // Pamir (Tajikistan / Afghanistan)
  'Fedchenko Glacier': -1.2,
  'Grumm-Grzhimailo Glacier': -1.1,
  'Garmo Glacier': -1.3,
  'Bivachny Glacier': -1.0,
  'Sugran Glacier': -0.9,
  'RGO Glacier': -1.4,

  // Tien Shan (Kyrgyzstan / Kazakhstan / China)
  'Inylchek Glacier': -1.5,
  'South Inylchek Glacier': -1.5,
  'North Inylchek Glacier': -1.6,
  'Kayindy Glacier': -1.3,
  'Petrov Glacier': -1.8,
  'Karabatkak Glacier': -1.4,
  'Tuyuksu Glacier': -1.7, // benchmark glacier near Almaty
  'Korumdu Glacier': -1.2,

  // Pamir-Alai (Kyrgyzstan)
  'Abramov Glacier': -0.8,
  'Zeravshansky Glacier': -1.0,
  'Mushketov Glacier': -0.9,

  // Hindu Kush (north Afghanistan, edge of bbox)
  'Mir Samir Glacier': -0.7,

  // Dzungarian Alatau (Kazakhstan-China border)
  'Dzhungarsky Glacier': -1.1,
  'Berkut Glacier': -0.9,
};

// ═══════════════════════════════════════════════════════════════
//  Major aquifer stress classification (UNESCO WHYMAP framework).
//  Used by X2 to colour groundwater polygons.
//  Values: 'sustainable_fresh' | 'pressured_fresh' | 'sustainable_brackish'
//          | 'overdrafted' | 'depleted_saline' | 'critical'
// ═══════════════════════════════════════════════════════════════
export const CA_AQUIFER_STRESS: Record<string, string> = {
  'Kyzylkum Aquifer': 'overdrafted',
  'Karakum Aquifer': 'depleted_saline',
  'Fergana Basin Aquifer': 'critical',
  'East Aral Aquifer': 'depleted_saline',
  'Pre-Caspian Aquifer': 'overdrafted',
  'Syr Darya Alluvial Aquifer': 'pressured_fresh',
  'Amu Darya Alluvial Aquifer': 'pressured_fresh',
  'Chu-Talas Alluvial Aquifer': 'critical',
  'Ili-Balkhash Alluvial Aquifer': 'pressured_fresh',
  'Turgai Aquifer': 'sustainable_fresh',
};
