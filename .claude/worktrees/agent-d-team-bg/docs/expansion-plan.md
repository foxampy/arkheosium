# VODPROM Expansion Plan

## Phase 1 — Data & Content (Current Session)

### 1A. Completed Projects (from "Objects of Path" document)
Add 30+ completed Culligan water treatment projects (2003-2016) as a new data source:
- New file: `src/data/completed-projects-data.ts`
- Each project: name, year, location, country, coordinates, capacity, description, client, type
- New color on map (green = completed)
- New tab "Реализованные" in ProjectHubPage
- Countries: Uzbekistan, Kazakhstan, Belarus, Russia, Ukraine, Poland, Turkmenistan, Moldova, Georgia

### 1B. Technology Catalog Pages
New page `/catalog` with tabs:
- **Производители** — water tech manufacturers (Culligan, Xylem, Veolia, SUEZ, Grundfos, etc.)
- **Институты** — research institutes (IWMI, SIWI, IHE Delft, CAIAG, UCA, GFZ, etc.)
- **Стартапы** — water tech startups (Imagine H2O portfolio, BlueTech, etc.)
- **Технологии** — technologies catalog (RO, UV, MBR, SCADA, IoT sensors, etc.)
- **Оборудование** — equipment catalog (pumps, filters, membranes, sensors, etc.)
- **Исследования** — key research/publications

Each entry: card on list page + detail page with full info.

### 1C. Map Layer Filters
Expose existing GeoJSON layers in the map UI:
- Rivers (already in geo data)
- Lakes (already in geo data)
- Glaciers (already in geo data)
- Groundwater zones (already in geo data)
- Water scarcity zones (already in geo data)
- Completed projects (new, green markers)

### 1D. Global Regions Data Structure
Add region-based data organization:
- Central Asia (detailed) — UZ, KZ, KG, TJ, TM
- Middle East — Israel, UAE
- Eastern Europe — Poland, Germany
- Western Europe — UK
- East Asia — China
- Americas — USA
- Each region: overview, key stats, water challenges, projects

## Phase 2 — API Integrations (Next Session)

### Priority APIs (no key required):
1. **Open-Meteo** — precipitation, temperature for any location
2. **NASA POWER** — solar/climate data per point
3. **OpenStreetMap Overpass** — infrastructure queries (dams, canals, treatment plants)
4. **World Bank API** — development indicators by country
5. **FAO AQUASTAT** — water statistics by country

### With free registration:
6. **Copernicus CDS** — ERA5 reanalysis, river discharge
7. **NASA Earthdata** — satellite water indices
8. **GEMStat** — water quality data

## Phase 3 — Web Scraping (Future)

### Central Asia (priority):
- ICWC (icwc-aral.uz) — Aral Sea basin data
- CA Water Info (cawater-info.net) — regional water portal
- Government open data portals (data.gov.uz, data.egov.kz)

### Global:
- ADB/World Bank project databases
- Water technology company directories
- Research institute publications

## Phase 4 — Advanced Map Features (Future)
- H3 hexagonal clustering
- Heatmaps for water stress
- Satellite imagery overlays
- Real-time monitoring dashboard
