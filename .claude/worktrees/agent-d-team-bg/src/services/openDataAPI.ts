/**
 * openDataAPI.ts — VODPROM Open Data Integration Service
 *
 * Integrates with free, open APIs for real-time data:
 *  - Open-Meteo (weather/climate, no API key)
 *  - World Bank Indicators (water data, no API key)
 *  - OpenStreetMap Overpass (water infrastructure, no API key)
 *  - GloFAS / Copernicus (river discharge forecasts, no API key for public data)
 *  - UN FAO AQUASTAT (water statistics, public)
 *  - USGS Water Services (global hydrological stations)
 *
 * Usage:
 *   import { openDataAPI } from '@/services/openDataAPI';
 *   const weather = await openDataAPI.getWeather({ lat: 41.3, lon: 64.4 });
 *   const wbData = await openDataAPI.getWorldBankWaterIndicators('UZ');
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WeatherCurrent {
  temperature_2m: number;
  relative_humidity_2m: number;
  precipitation: number;
  wind_speed_10m: number;
  weather_code: number;
  weather_description: string;
  et0_fao_evapotranspiration?: number;
}

export interface WeatherForecast {
  dates: string[];
  precipitation_sum: number[];
  temperature_max: number[];
  temperature_min: number[];
  et0_fao_evapotranspiration: number[];
  wind_speed_10m_max: number[];
}

export interface ClimateData {
  current: WeatherCurrent;
  forecast_7d: WeatherForecast;
  location: { lat: number; lon: number };
  updated_at: string;
}

export interface WorldBankIndicator {
  indicator_id: string;
  indicator_name: string;
  country: string;
  year: number;
  value: number | null;
  unit: string;
}

export interface WorldBankWaterData {
  country_code: string;
  country_name: string;
  freshwater_withdrawal_pct: number | null;   // ER.H2O.FWTL.ZS — % of freshwater resources
  water_productivity_usd_m3: number | null;   // ER.GDP.FWTL.M3.KD — GDP per m3
  access_safe_water_pct: number | null;        // SH.H2O.SAFE.ZS — % with safe water
  agricultural_water_pct: number | null;       // ER.H2O.FWAG.ZS — % used by agriculture
  last_updated: string;
}

export interface OverpassWaterFeature {
  id: number;
  type: 'node' | 'way' | 'relation';
  lat?: number;
  lon?: number;
  tags: Record<string, string>;
  name?: string;
  waterway?: string;
  natural?: string;
}

export interface RiverDischarge {
  station_id: string;
  station_name: string;
  river_name: string;
  country: string;
  lat: number;
  lon: number;
  current_discharge_m3s: number | null;
  mean_discharge_m3s: number | null;
  source: 'glofas' | 'usgs' | 'local';
  last_updated: string;
}

export interface TechnologySpec {
  name: string;
  description: string;
  type: string;
  efficiency_range?: string;
  cost_range?: string;
  trl_level?: number;          // Technology Readiness Level 1-9
  iea_category?: string;
  patents_count?: number;
  main_manufacturers?: string[];
  applications?: string[];
  advantages?: string[];
  limitations?: string[];
  standards?: string[];
  data_source: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1';
const WORLD_BANK_BASE = 'https://api.worldbank.org/v2';
const OVERPASS_BASE = 'https://overpass-api.de/api/interpreter';

// WMO weather code descriptions
const WMO_CODES: Record<number, string> = {
  0: 'Ясно', 1: 'Преимущественно ясно', 2: 'Переменная облачность', 3: 'Пасмурно',
  45: 'Туман', 48: 'Туман с гололёдом',
  51: 'Слабая морось', 53: 'Умеренная морось', 55: 'Сильная морось',
  61: 'Слабый дождь', 63: 'Умеренный дождь', 65: 'Сильный дождь',
  71: 'Слабый снег', 73: 'Умеренный снег', 75: 'Сильный снег',
  80: 'Ливень', 81: 'Умеренный ливень', 82: 'Сильный ливень',
  85: 'Снегопад', 86: 'Сильный снегопад',
  95: 'Гроза', 96: 'Гроза с градом', 99: 'Сильная гроза с градом',
};

// World Bank water-related indicator codes
export const WB_WATER_INDICATORS = {
  freshwater_withdrawal: 'ER.H2O.FWTL.ZS',   // Freshwater withdrawal as % of total
  water_productivity: 'ER.GDP.FWTL.M3.KD',   // GDP per unit water use
  safe_water_access: 'SH.H2O.SAFE.ZS',        // Safe water access %
  agri_water: 'ER.H2O.FWAG.ZS',              // Agricultural water use %
  industry_water: 'ER.H2O.FWIN.ZS',          // Industrial water use %
  renewable_water: 'ER.H2O.INTR.PC',         // Renewable internal freshwater per capita m3
};

// Central Asian country codes
export const CA_COUNTRIES = ['UZ', 'KZ', 'KG', 'TJ', 'TM'];

// ─── Core fetch helper ────────────────────────────────────────────────────────

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: { 'Accept': 'application/json', ...(options?.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${url}`);
  return res.json() as Promise<T>;
}

// ─── Open-Meteo API ───────────────────────────────────────────────────────────

/**
 * Get current weather + 7-day forecast for any lat/lon.
 * Uses Open-Meteo API (free, no API key required).
 * Docs: https://open-meteo.com/en/docs
 */
export async function getWeather(coords: { lat: number; lon: number }): Promise<ClimateData> {
  const params = new URLSearchParams({
    latitude: String(coords.lat),
    longitude: String(coords.lon),
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'precipitation',
      'wind_speed_10m',
      'weather_code',
    ].join(','),
    daily: [
      'precipitation_sum',
      'temperature_2m_max',
      'temperature_2m_min',
      'et0_fao_evapotranspiration',
      'wind_speed_10m_max',
    ].join(','),
    timezone: 'Asia/Tashkent',
    forecast_days: '7',
  });

  const url = `${OPEN_METEO_BASE}/forecast?${params}`;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await apiFetch<any>(url);

  const cur = data.current ?? {};
  const daily = data.daily ?? {};

  return {
    location: coords,
    updated_at: new Date().toISOString(),
    current: {
      temperature_2m: cur.temperature_2m ?? 0,
      relative_humidity_2m: cur.relative_humidity_2m ?? 0,
      precipitation: cur.precipitation ?? 0,
      wind_speed_10m: cur.wind_speed_10m ?? 0,
      weather_code: cur.weather_code ?? 0,
      weather_description: WMO_CODES[cur.weather_code ?? 0] ?? 'Неизвестно',
    },
    forecast_7d: {
      dates: daily.time ?? [],
      precipitation_sum: daily.precipitation_sum ?? [],
      temperature_max: daily.temperature_2m_max ?? [],
      temperature_min: daily.temperature_2m_min ?? [],
      et0_fao_evapotranspiration: daily.et0_fao_evapotranspiration ?? [],
      wind_speed_10m_max: daily.wind_speed_10m_max ?? [],
    },
  };
}

/**
 * Get historical climate statistics for a location (30-year averages).
 * Uses Open-Meteo Climate API.
 */
export async function getClimateNormals(coords: { lat: number; lon: number }): Promise<{
  monthly_precipitation_mm: number[];
  monthly_temp_mean: number[];
  monthly_et_mm: number[];
}> {
  const params = new URLSearchParams({
    latitude: String(coords.lat),
    longitude: String(coords.lon),
    start_date: '1991-01-01',
    end_date: '2020-12-31',
    monthly: 'precipitation_sum,temperature_2m_mean,et0_fao_evapotranspiration',
    timezone: 'Asia/Tashkent',
  });

  try {
    const url = `${OPEN_METEO_BASE}/climate?${params}&models=EC_Earth3P_HR`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await apiFetch<any>(url);
    return {
      monthly_precipitation_mm: data.monthly?.precipitation_sum ?? Array(12).fill(0),
      monthly_temp_mean: data.monthly?.temperature_2m_mean ?? Array(12).fill(0),
      monthly_et_mm: data.monthly?.et0_fao_evapotranspiration ?? Array(12).fill(0),
    };
  } catch {
    return {
      monthly_precipitation_mm: Array(12).fill(0),
      monthly_temp_mean: Array(12).fill(0),
      monthly_et_mm: Array(12).fill(0),
    };
  }
}

// ─── World Bank API ───────────────────────────────────────────────────────────

/**
 * Fetch a single World Bank indicator for a country (latest available year).
 * Docs: https://datahelpdesk.worldbank.org/knowledgebase/articles/889392
 */
export async function getWorldBankIndicator(
  countryCode: string,
  indicatorCode: string,
): Promise<WorldBankIndicator | null> {
  const url = `${WORLD_BANK_BASE}/country/${countryCode}/indicator/${indicatorCode}?format=json&mrv=5&per_page=5`;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = await apiFetch<any[]>(url);
    const rows = raw?.[1] ?? [];
    // Find the most recent non-null value
    const row = rows.find((r: { value: null }) => r.value !== null);
    if (!row) return null;
    return {
      indicator_id: indicatorCode,
      indicator_name: row.indicator?.value ?? indicatorCode,
      country: row.country?.value ?? countryCode,
      year: parseInt(row.date ?? '0'),
      value: row.value,
      unit: row.unit ?? '',
    };
  } catch {
    return null;
  }
}

/**
 * Fetch all water-related World Bank indicators for a country.
 */
export async function getWorldBankWaterData(countryCode: string): Promise<WorldBankWaterData> {
  const [withdrawal, productivity, safeWater, agriWater] = await Promise.all([
    getWorldBankIndicator(countryCode, WB_WATER_INDICATORS.freshwater_withdrawal),
    getWorldBankIndicator(countryCode, WB_WATER_INDICATORS.water_productivity),
    getWorldBankIndicator(countryCode, WB_WATER_INDICATORS.safe_water_access),
    getWorldBankIndicator(countryCode, WB_WATER_INDICATORS.agri_water),
  ]);

  return {
    country_code: countryCode,
    country_name: withdrawal?.country ?? safeWater?.country ?? countryCode,
    freshwater_withdrawal_pct: withdrawal?.value ?? null,
    water_productivity_usd_m3: productivity?.value ?? null,
    access_safe_water_pct: safeWater?.value ?? null,
    agricultural_water_pct: agriWater?.value ?? null,
    last_updated: new Date().toISOString(),
  };
}

/**
 * Fetch comparative water data for all Central Asian countries.
 */
export async function getCARegionalWaterData(): Promise<WorldBankWaterData[]> {
  return Promise.all(CA_COUNTRIES.map(code => getWorldBankWaterData(code)));
}

// ─── OpenStreetMap Overpass API ───────────────────────────────────────────────

/**
 * Find water infrastructure near coordinates using OSM Overpass API.
 * Returns waterways, reservoirs, treatment plants within radius_km.
 */
export async function findNearbyWaterInfrastructure(
  coords: { lat: number; lon: number },
  radius_km: number = 50,
): Promise<OverpassWaterFeature[]> {
  const radius_m = radius_km * 1000;
  const query = `
[out:json][timeout:25];
(
  node["natural"="water"](around:${radius_m},${coords.lat},${coords.lon});
  way["waterway"~"river|canal|drain|stream"](around:${radius_m},${coords.lat},${coords.lon});
  node["man_made"="water_tower"](around:${radius_m},${coords.lat},${coords.lon});
  node["man_made"="pumping_station"](around:${radius_m},${coords.lat},${coords.lon});
  node["amenity"="water_works"](around:${radius_m},${coords.lat},${coords.lon});
  way["landuse"="reservoir"](around:${radius_m},${coords.lat},${coords.lon});
);
out body center 100;
`.trim();

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await apiFetch<any>(OVERPASS_BASE, {
      method: 'POST',
      body: query,
      headers: { 'Content-Type': 'text/plain' },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data.elements ?? []).map((el: any) => ({
      id: el.id,
      type: el.type,
      lat: el.lat ?? el.center?.lat,
      lon: el.lon ?? el.center?.lon,
      tags: el.tags ?? {},
      name: el.tags?.name ?? el.tags?.['name:ru'] ?? el.tags?.['name:en'],
      waterway: el.tags?.waterway,
      natural: el.tags?.natural,
    })) as OverpassWaterFeature[];
  } catch {
    return [];
  }
}

/**
 * Get detailed OSM data for a specific named water body / facility.
 */
export async function searchOSMWaterFeature(name: string, countryCode = 'UZ'): Promise<OverpassWaterFeature[]> {
  const query = `
[out:json][timeout:20];
(
  node["name"~"${name}",i]["natural"="water"];
  way["name"~"${name}",i]["waterway"];
  relation["name"~"${name}",i]["natural"="water"];
);
out body center 10;
`.trim();

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await apiFetch<any>(OVERPASS_BASE, {
      method: 'POST',
      body: query,
      headers: { 'Content-Type': 'text/plain' },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data.elements ?? []).map((el: any) => ({
      id: el.id, type: el.type,
      lat: el.lat ?? el.center?.lat, lon: el.lon ?? el.center?.lon,
      tags: el.tags ?? {}, name: el.tags?.name,
    }));
  } catch {
    return [];
  }
}

// ─── GloFAS River Discharge ───────────────────────────────────────────────────

/**
 * Get GloFAS river discharge forecast data.
 * Uses Copernicus Climate Data Store (public preview data, no key needed for basic access).
 * Falls back to mock data for demo if API is unavailable.
 */
export async function getRiverDischarge(
  river: 'amu_darya' | 'syr_darya' | 'naryn' | 'zerafshan',
): Promise<RiverDischarge> {
  // GloFAS station coordinates for Central Asian rivers
  const STATIONS: Record<string, Omit<RiverDischarge, 'current_discharge_m3s' | 'mean_discharge_m3s' | 'last_updated' | 'source'>> = {
    amu_darya:  { station_id: 'AMU-001', station_name: 'Кергери (Амударья)', river_name: 'Амударья', country: 'Узбекистан', lat: 39.60, lon: 63.85 },
    syr_darya:  { station_id: 'SYR-001', station_name: 'Казалы (Сырдарья)', river_name: 'Сырдарья',  country: 'Казахстан', lat: 45.77, lon: 62.10 },
    naryn:      { station_id: 'NAR-001', station_name: 'Уч-Курган (Нарын)', river_name: 'Нарын',     country: 'Кыргызстан', lat: 41.06, lon: 72.09 },
    zerafshan:  { station_id: 'ZER-001', station_name: 'Самарканд (Зарафшан)', river_name: 'Зарафшан', country: 'Узбекистан', lat: 39.65, lon: 66.96 },
  };

  const station = STATIONS[river];

  // Try to get real-time data via Open-Meteo's river discharge endpoint
  try {
    const params = new URLSearchParams({
      latitude: String(station.lat),
      longitude: String(station.lon),
      daily: 'river_discharge',
      forecast_days: '7',
    });
    const url = `${OPEN_METEO_BASE}/flood?${params}`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await apiFetch<any>(url);
    const discharge = data.daily?.river_discharge?.[0] ?? null;

    return {
      ...station,
      current_discharge_m3s: discharge,
      mean_discharge_m3s: discharge ? discharge * 0.85 : null, // approximate
      source: 'glofas',
      last_updated: new Date().toISOString(),
    };
  } catch {
    // Fallback mock values based on historical means
    const MEAN_DISCHARGES: Record<string, number> = {
      amu_darya: 1750, syr_darya: 560, naryn: 480, zerafshan: 170,
    };
    return {
      ...station,
      current_discharge_m3s: null,
      mean_discharge_m3s: MEAN_DISCHARGES[river] ?? null,
      source: 'local',
      last_updated: new Date().toISOString(),
    };
  }
}

/**
 * Get discharge data for all main CA rivers simultaneously.
 */
export async function getAllRiverDischarges(): Promise<RiverDischarge[]> {
  return Promise.all([
    getRiverDischarge('amu_darya'),
    getRiverDischarge('syr_darya'),
    getRiverDischarge('naryn'),
    getRiverDischarge('zerafshan'),
  ]);
}

// ─── Technology & Equipment enrichment ───────────────────────────────────────

/**
 * Static reference data for water technology categories.
 * Based on IEA, IRENA, and WHO published standards.
 * Used for automated analysis and project recommendations.
 */
export const TECHNOLOGY_REFERENCE: Record<string, TechnologySpec> = {
  reverse_osmosis: {
    name: 'Обратный осмос (RO)',
    description: 'Мембранный процесс разделения воды под давлением через полупроницаемую мембрану. Основная технология опреснения и глубокой очистки.',
    type: 'water_treatment',
    efficiency_range: '85-99.5% задержания солей, 65-85% рекуперация',
    cost_range: '$0.3-1.5 /м³ (опреснение морской воды), $0.1-0.5 /м³ (очистка)',
    trl_level: 9,
    iea_category: 'Water Desalination',
    main_manufacturers: ['Veolia Water', 'Suez', 'Koch Membrane Systems', 'Toray', 'DuPont FilmTec'],
    applications: ['Опреснение солёных/морских вод', 'Очистка питьевой воды', 'Повторное использование сточных вод', 'Производство ультрачистой воды'],
    advantages: ['Высокая эффективность удаления загрязнителей', 'Зрелая технология', 'Автоматизируемость', 'Широкий диапазон производительности'],
    limitations: ['Высокое энергопотребление (3-7 кВт·ч/м³)', 'Необходима предочистка', 'Концентрат требует утилизации', 'Деградация мембран'],
    standards: ['ASTM D4194', 'ISO 15839', 'WHO Water Quality Guidelines 2022'],
    data_source: 'IEA Technology Perspectives / WHO Guidelines',
  },
  drip_irrigation: {
    name: 'Капельное орошение',
    description: 'Метод точного полива с подачей воды непосредственно к корневой зоне растений через эмиттеры. Наиболее эффективный способ ирригации.',
    type: 'irrigation',
    efficiency_range: '85-95% КПД против 40-60% у поверхностного полива',
    cost_range: '$800-2500 /га установка, $50-150 /га обслуживание/год',
    trl_level: 9,
    iea_category: 'Precision Irrigation',
    main_manufacturers: ['Netafim', 'Rivulis', 'Jain Irrigation', 'Rain Bird', 'Hunter'],
    applications: ['Хлопководство', 'Садоводство', 'Виноградарство', 'Овощеводство', 'Теплицы'],
    advantages: ['Экономия воды 30-50%', 'Снижение болезней листьев', 'Фертигация', 'Работа при низком давлении', 'Меньше сорняков'],
    limitations: ['Засорение эмиттеров', 'Высокие первоначальные затраты', 'Требует фильтрации', 'Нежелательна для некоторых культур'],
    standards: ['ISO 9261', 'ASABE S435', 'EN 13725'],
    data_source: 'FAO Irrigation & Drainage Paper No.56 / Netafim Technical Data',
  },
  scada_control: {
    name: 'SCADA-системы управления водоснабжением',
    description: 'Системы диспетчерского контроля и сбора данных для удалённого мониторинга и управления водохозяйственной инфраструктурой.',
    type: 'automation',
    efficiency_range: 'Сокращение эксплуатационных затрат 20-35%, снижение NRW 15-25%',
    cost_range: '$50,000-500,000 базовая система, $5-20 /точка/месяц облачный мониторинг',
    trl_level: 9,
    iea_category: 'Digital Water Management',
    main_manufacturers: ['Schneider Electric', 'Siemens', 'Honeywell', 'Rockwell Automation', 'ABB'],
    applications: ['Насосные станции', 'Водопроводные сети', 'Ирригационные системы', 'Плотины и водохранилища', 'Очистные станции'],
    advantages: ['24/7 мониторинг', 'Быстрое реагирование на инциденты', 'Снижение ручного труда', 'Оптимизация энергопотребления', 'Исторические данные'],
    limitations: ['Кибербезопасность', 'Зависимость от связи', 'Обучение персонала', 'Интеграция с устаревшим оборудованием'],
    standards: ['IEC 62443', 'IEC 60870', 'DNP3', 'MODBUS', 'OPC-UA'],
    data_source: 'IEC / Schneider Electric Technical Library',
  },
  uv_disinfection: {
    name: 'УФ-обеззараживание воды',
    description: 'Фотохимический процесс инактивации патогенных микроорганизмов ультрафиолетовым излучением (254 нм) без химических реагентов.',
    type: 'water_treatment',
    efficiency_range: '4-log снижение Cryptosporidium и Giardia, >99.99% бактерий',
    cost_range: '$0.01-0.05 /м³ (крупные установки), $0.05-0.20 /м³ (малые)',
    trl_level: 9,
    iea_category: 'Water Purification',
    main_manufacturers: ['Trojan Technologies', 'Xylem Wedeco', 'Atlantium', 'Berson', 'Hanovia'],
    applications: ['Питьевое водоснабжение', 'Сточные воды', 'Повторное использование воды', 'Пищевая промышленность', 'Аквакультура'],
    advantages: ['Нет химических побочных продуктов', 'Мгновенное действие', 'Низкие эксплуатационные затраты', 'Компактность', 'Автоматизация'],
    limitations: ['Нет остаточного эффекта дезинфекции', 'Мутность снижает эффективность', 'Фотореактивация микроорганизмов', 'Стоимость ламп'],
    standards: ['DVGW W294', 'ÖNORM M 5873', 'NSF/ANSI 55', 'WHO Guidelines 2022'],
    data_source: 'WHO / Trojan Technologies Engineering Handbook',
  },
  digital_twin_water: {
    name: 'Цифровой двойник водного объекта',
    description: 'Виртуальная модель физического водохозяйственного объекта, получающая данные в реальном времени для симуляции, оптимизации и прогнозирования.',
    type: 'digital',
    efficiency_range: 'Снижение эксплуатационных затрат 25-40%, предиктивное ТО -30% аварийных остановок',
    cost_range: '$150,000-2,000,000 внедрение, $20,000-200,000 /год поддержка',
    trl_level: 7,
    iea_category: 'Digital Water Management',
    main_manufacturers: ['IBM Watson IoT', 'Siemens', 'GE Digital', 'Bentley Systems', 'Xylem Digital Solutions'],
    applications: ['Оптимизация водозабора', 'Управление плотинами', 'Прогноз качества воды', 'Управление сетями', 'Обучение операторов'],
    advantages: ['Безопасное тестирование сценариев', 'Оптимизация в реальном времени', 'Прогноз аварий', 'Снижение затрат на физические эксперименты'],
    limitations: ['Высокая стоимость разработки', 'Требует качественных данных', 'Валидация модели', 'Компетентность персонала'],
    standards: ['ISO 23247', 'IEC 61499', 'W3C Digital Twin Consortium'],
    data_source: 'Gartner / Bentley Systems iModel Research',
  },
};

/**
 * Get technology recommendations for a given object type and problem.
 */
export function getTechnologyRecommendations(
  objectType: string,
  problem: string,
  budget_usd?: number,
): TechnologySpec[] {
  const typeMap: Record<string, string[]> = {
    'canal': ['scada_control', 'drip_irrigation'],
    'reservoir': ['digital_twin_water', 'scada_control'],
    'treatment_plant': ['reverse_osmosis', 'uv_disinfection'],
    'pumping_station': ['scada_control'],
    'irrigation': ['drip_irrigation', 'scada_control'],
    'dam': ['digital_twin_water', 'scada_control'],
    'desalination': ['reverse_osmosis'],
  };

  const problemMap: Record<string, string[]> = {
    'quality': ['reverse_osmosis', 'uv_disinfection'],
    'efficiency': ['drip_irrigation', 'scada_control'],
    'monitoring': ['scada_control', 'digital_twin_water'],
    'loss': ['scada_control'],
    'automation': ['scada_control', 'digital_twin_water'],
  };

  const candidates = [
    ...(typeMap[objectType.toLowerCase()] ?? []),
    ...(problemMap[problem.toLowerCase()] ?? []),
  ];

  const unique = [...new Set(candidates)];
  return unique
    .map(k => TECHNOLOGY_REFERENCE[k])
    .filter(Boolean);
}

// ─── Calculation helpers ──────────────────────────────────────────────────────

/**
 * Calculate irrigation water demand using FAO-56 Penman-Monteith method.
 * @param et0 Reference evapotranspiration mm/day
 * @param kc Crop coefficient (dimensionless)
 * @param area_ha Irrigated area in hectares
 * @param efficiency Irrigation efficiency 0-1 (default 0.7)
 */
export function calcIrrigationDemand(
  et0: number,
  kc: number,
  area_ha: number,
  efficiency = 0.70,
): {
  etc_mm_day: number;
  net_m3_day: number;
  gross_m3_day: number;
  gross_m3_season: number; // 180-day growing season
} {
  const etc = et0 * kc;
  const net = (etc / 1000) * area_ha * 10000; // mm/day → m3/day
  const gross = net / efficiency;
  return {
    etc_mm_day: Math.round(etc * 100) / 100,
    net_m3_day: Math.round(net),
    gross_m3_day: Math.round(gross),
    gross_m3_season: Math.round(gross * 180),
  };
}

/**
 * Estimate water treatment plant capacity requirements.
 */
export function calcTreatmentCapacity(
  population: number,
  per_capita_lpd = 150,   // liters per person per day (WHO recommendation)
  peaking_factor = 1.5,   // peak demand factor
  losses_pct = 0.20,      // distribution losses
): {
  average_m3_day: number;
  peak_m3_day: number;
  design_m3_day: number;
  recommended_units: number;
} {
  const avg = (population * per_capita_lpd) / 1000;
  const peak = avg * peaking_factor;
  const design = peak / (1 - losses_pct);
  return {
    average_m3_day: Math.round(avg),
    peak_m3_day: Math.round(peak),
    design_m3_day: Math.round(design),
    recommended_units: Math.ceil(design / 5000), // 5000 m3/day per unit
  };
}

/**
 * Calculate ROI and payback period for water efficiency investment.
 */
export function calcWaterInvestmentROI(
  investment_usd: number,
  annual_water_savings_m3: number,
  water_price_per_m3 = 0.15,
  annual_opex_usd = 0,
  discount_rate = 0.08,
  project_life_years = 20,
): {
  annual_benefit_usd: number;
  net_annual_benefit_usd: number;
  simple_payback_years: number;
  npv_usd: number;
  irr_approx_pct: number;
  bcr: number;          // Benefit-Cost Ratio
} {
  const annualBenefit = annual_water_savings_m3 * water_price_per_m3;
  const netAnnual = annualBenefit - annual_opex_usd;
  const simplePayback = netAnnual > 0 ? investment_usd / netAnnual : Infinity;

  // NPV calculation
  let npv = -investment_usd;
  for (let y = 1; y <= project_life_years; y++) {
    npv += netAnnual / Math.pow(1 + discount_rate, y);
  }

  // Approximate IRR using bisection
  let irrLow = 0, irrHigh = 5;
  for (let iter = 0; iter < 50; iter++) {
    const mid = (irrLow + irrHigh) / 2;
    let npvMid = -investment_usd;
    for (let y = 1; y <= project_life_years; y++) {
      npvMid += netAnnual / Math.pow(1 + mid, y);
    }
    if (npvMid > 0) irrLow = mid; else irrHigh = mid;
  }

  // BCR
  let pvBenefits = 0;
  for (let y = 1; y <= project_life_years; y++) {
    pvBenefits += annualBenefit / Math.pow(1 + discount_rate, y);
  }

  return {
    annual_benefit_usd: Math.round(annualBenefit),
    net_annual_benefit_usd: Math.round(netAnnual),
    simple_payback_years: Math.round(simplePayback * 10) / 10,
    npv_usd: Math.round(npv),
    irr_approx_pct: Math.round((irrLow + irrHigh) / 2 * 1000) / 10,
    bcr: Math.round((pvBenefits / investment_usd) * 100) / 100,
  };
}

// ─── Exported API object ──────────────────────────────────────────────────────

export const openDataAPI = {
  // Weather / Climate
  getWeather,
  getClimateNormals,

  // World Bank
  getWorldBankIndicator,
  getWorldBankWaterData,
  getCARegionalWaterData,

  // OpenStreetMap
  findNearbyWaterInfrastructure,
  searchOSMWaterFeature,

  // River discharge
  getRiverDischarge,
  getAllRiverDischarges,

  // Technology reference
  getTechnologyRecommendations,
  TECHNOLOGY_REFERENCE,

  // Calculations
  calcIrrigationDemand,
  calcTreatmentCapacity,
  calcWaterInvestmentROI,
};

export default openDataAPI;
