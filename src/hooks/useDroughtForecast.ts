// ═══════════════════════════════════════════════════════════════
//  useDroughtForecast — Drought index data for Uzbekistan regions
//  Severity scale: 0=none, 1=abnormal, 2=moderate, 3=severe, 4=extreme
// ═══════════════════════════════════════════════════════════════

import { useMemo } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

export type DroughtSeverity = 0 | 1 | 2 | 3 | 4;
export type DroughtTrend = 'improving' | 'stable' | 'worsening';

export interface DroughtRegion {
  id: string;
  name_ru: string;
  name_en: string;
  severity: DroughtSeverity;
  trend: DroughtTrend;
  /** Center coordinates for map overlay */
  lat: number;
  lng: number;
  /** Approximate radius in degrees for circle overlay */
  radius: number;
  /** Average precipitation deficit (%) relative to 30-year norm */
  precipDeficit: number;
  /** Soil moisture index 0-100 */
  soilMoisture: number;
  /** Additional description */
  description: string;
}

export interface UseDroughtForecastResult {
  regions: DroughtRegion[];
  loading: boolean;
  error: string | null;
  getRegionBySeverity: (minSeverity: DroughtSeverity) => DroughtRegion[];
}

// ─── Severity labels & colors ────────────────────────────────────────────────

export const DROUGHT_SEVERITY_LABELS: Record<DroughtSeverity, string> = {
  0: 'Норма',
  1: 'Аномально',
  2: 'Умеренная',
  3: 'Сильная',
  4: 'Экстремальная',
};

export const DROUGHT_SEVERITY_COLORS: Record<DroughtSeverity, string> = {
  0: '#22c55e',  // green
  1: '#eab308',  // yellow
  2: '#f97316',  // orange
  3: '#ef4444',  // red
  4: '#991b1b',  // dark red
};

/**
 * Returns a color string for the given drought severity level.
 */
export function getDroughtColor(severity: DroughtSeverity): string {
  return DROUGHT_SEVERITY_COLORS[severity] ?? '#94a3b8';
}

export const DROUGHT_TREND_LABELS: Record<DroughtTrend, string> = {
  improving: 'Улучшение',
  stable: 'Стабильно',
  worsening: 'Ухудшение',
};

export const DROUGHT_TREND_ICONS: Record<DroughtTrend, string> = {
  improving: '↗',  // arrow up-right
  stable: '→',     // arrow right
  worsening: '↘',  // arrow down-right
};

// ─── Hardcoded regional data ─────────────────────────────────────────────────

const DROUGHT_REGIONS: DroughtRegion[] = [
  {
    id: 'karakalpakstan',
    name_ru: 'Каракалпакстан',
    name_en: 'Karakalpakstan',
    severity: 4,
    trend: 'worsening',
    lat: 42.46,
    lng: 59.60,
    radius: 1.5,
    precipDeficit: 72,
    soilMoisture: 8,
    description: 'Катастрофическая засуха. Высыхание Аральского моря усиливает опустынивание. Критический дефицит водных ресурсов.',
  },
  {
    id: 'bukhara',
    name_ru: 'Бухара',
    name_en: 'Bukhara',
    severity: 3,
    trend: 'stable',
    lat: 39.77,
    lng: 64.42,
    radius: 1.2,
    precipDeficit: 58,
    soilMoisture: 15,
    description: 'Сильная засуха. Высокие температуры и низкое количество осадков. Зависимость от ирригации Амударьи.',
  },
  {
    id: 'navoi',
    name_ru: 'Навои',
    name_en: 'Navoi',
    severity: 3,
    trend: 'worsening',
    lat: 40.10,
    lng: 65.38,
    radius: 1.3,
    precipDeficit: 62,
    soilMoisture: 12,
    description: 'Сильная засуха с тенденцией к ухудшению. Пустыня Кызылкум расширяется. Дефицит грунтовых вод.',
  },
  {
    id: 'khorezm',
    name_ru: 'Хорезм',
    name_en: 'Khorezm',
    severity: 2,
    trend: 'stable',
    lat: 41.55,
    lng: 60.63,
    radius: 0.8,
    precipDeficit: 42,
    soilMoisture: 25,
    description: 'Умеренная засуха. Проблемы засоления из-за близости к Аральскому морю. Ирригация частично компенсирует дефицит.',
  },
  {
    id: 'kashkadarya',
    name_ru: 'Кашкадарья',
    name_en: 'Kashkadarya',
    severity: 2,
    trend: 'worsening',
    lat: 38.86,
    lng: 65.80,
    radius: 1.0,
    precipDeficit: 38,
    soilMoisture: 28,
    description: 'Умеренная засуха с ухудшающимся трендом. Снижение стока горных рек.',
  },
  {
    id: 'samarkand',
    name_ru: 'Самарканд',
    name_en: 'Samarkand',
    severity: 1,
    trend: 'stable',
    lat: 39.65,
    lng: 66.95,
    radius: 0.9,
    precipDeficit: 22,
    soilMoisture: 38,
    description: 'Аномально сухие условия. Зерафшан обеспечивает базовый водоснабжение, но сток снижается.',
  },
  {
    id: 'tashkent',
    name_ru: 'Ташкент',
    name_en: 'Tashkent',
    severity: 0,
    trend: 'stable',
    lat: 41.31,
    lng: 69.28,
    radius: 0.8,
    precipDeficit: 8,
    soilMoisture: 55,
    description: 'Нормальные условия. Чирчик-Ахангаранский бассейн обеспечивает стабильное водоснабжение.',
  },
  {
    id: 'fergana',
    name_ru: 'Фергана',
    name_en: 'Fergana',
    severity: 1,
    trend: 'improving',
    lat: 40.38,
    lng: 71.79,
    radius: 0.7,
    precipDeficit: 18,
    soilMoisture: 42,
    description: 'Аномально сухие условия с положительным трендом. Горные водотоки обеспечивают достаточный приток.',
  },
  {
    id: 'andijan',
    name_ru: 'Андижан',
    name_en: 'Andijan',
    severity: 0,
    trend: 'stable',
    lat: 40.78,
    lng: 72.34,
    radius: 0.6,
    precipDeficit: 5,
    soilMoisture: 58,
    description: 'Нормальные условия. Достаточное количество осадков и водных ресурсов из горных притоков.',
  },
  {
    id: 'namangan',
    name_ru: 'Наманган',
    name_en: 'Namangan',
    severity: 0,
    trend: 'stable',
    lat: 41.00,
    lng: 71.67,
    radius: 0.6,
    precipDeficit: 7,
    soilMoisture: 52,
    description: 'Нормальные условия. Близость к Чаткальскому хребту обеспечивает стабильные осадки.',
  },
  {
    id: 'jizzakh',
    name_ru: 'Джизак',
    name_en: 'Jizzakh',
    severity: 2,
    trend: 'stable',
    lat: 40.12,
    lng: 67.85,
    radius: 0.8,
    precipDeficit: 35,
    soilMoisture: 30,
    description: 'Умеренная засуха. Переходная зона между предгорьями и степью. Сезонный дефицит воды.',
  },
  {
    id: 'sirdarya',
    name_ru: 'Сырдарья',
    name_en: 'Sirdarya',
    severity: 1,
    trend: 'stable',
    lat: 40.50,
    lng: 68.65,
    radius: 0.6,
    precipDeficit: 20,
    soilMoisture: 40,
    description: 'Аномально сухие условия. Зависимость от стока Сырдарьи, который зарегулирован выше по течению.',
  },
  {
    id: 'surkhandarya',
    name_ru: 'Сурхандарья',
    name_en: 'Surkhandarya',
    severity: 2,
    trend: 'worsening',
    lat: 37.80,
    lng: 67.27,
    radius: 0.9,
    precipDeficit: 32,
    soilMoisture: 32,
    description: 'Умеренная засуха с ухудшающимся трендом. Самый жаркий регион Узбекистана, экстремальные летние температуры.',
  },
];

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useDroughtForecast(): UseDroughtForecastResult {
  const getRegionBySeverity = useMemo(() => {
    return (minSeverity: DroughtSeverity) =>
      DROUGHT_REGIONS.filter(r => r.severity >= minSeverity);
  }, []);

  return {
    regions: DROUGHT_REGIONS,
    loading: false,
    error: null,
    getRegionBySeverity,
  };
}
