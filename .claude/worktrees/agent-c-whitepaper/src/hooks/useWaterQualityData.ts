// ═══════════════════════════════════════════════════════════════
//  useWaterQualityData — Water quality data by region (Uzbekistan)
//  Data-driven approach with hardcoded quality points across regions
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface WaterQualityPoint {
  lat: number;
  lng: number;
  salinity_ppm: number;
  hardness_mg_l: number;
  ph: number;
  turbidity_ntu: number;
  arsenic_ppb: number;
  fluoride_ppm: number;
  region_name: string;
}

export type ExtractionDifficulty = 'easy' | 'moderate' | 'hard' | 'extreme';

export interface UseWaterQualityDataResult {
  points: WaterQualityPoint[];
  loading: boolean;
  error: string | null;
  getFilteredPoints: (region?: string) => WaterQualityPoint[];
}

// ─── Color scale function ────────────────────────────────────────────────────

/**
 * Returns color for salinity level:
 * - blue (#22d3ee) for fresh water (< 500 ppm)
 * - cyan (#06b6d4) for low salinity (500-1000 ppm)
 * - green (#22c55e) for moderate-low (1000-2000 ppm)
 * - yellow (#eab308) for moderate (2000-5000 ppm)
 * - orange (#f97316) for high (5000-10000 ppm)
 * - red (#ef4444) for very high (10000-20000 ppm)
 * - dark red (#dc2626) for extreme (> 20000 ppm)
 */
export function getQualityColor(salinity: number): string {
  if (salinity < 500) return '#22d3ee';
  if (salinity < 1000) return '#06b6d4';
  if (salinity < 2000) return '#22c55e';
  if (salinity < 5000) return '#eab308';
  if (salinity < 10000) return '#f97316';
  if (salinity < 20000) return '#ef4444';
  return '#dc2626';
}

/**
 * Returns extraction difficulty based on the overall water quality parameters.
 */
export function getExtractionDifficulty(point: WaterQualityPoint): ExtractionDifficulty {
  const { salinity_ppm, hardness_mg_l, arsenic_ppb, turbidity_ntu } = point;

  // Score-based approach
  let score = 0;
  if (salinity_ppm > 10000) score += 4;
  else if (salinity_ppm > 5000) score += 3;
  else if (salinity_ppm > 2000) score += 2;
  else if (salinity_ppm > 1000) score += 1;

  if (hardness_mg_l > 500) score += 2;
  else if (hardness_mg_l > 300) score += 1;

  if (arsenic_ppb > 50) score += 2;
  else if (arsenic_ppb > 10) score += 1;

  if (turbidity_ntu > 50) score += 1;

  if (score >= 7) return 'extreme';
  if (score >= 4) return 'hard';
  if (score >= 2) return 'moderate';
  return 'easy';
}

/** Color for extraction difficulty badge */
export const EXTRACTION_DIFFICULTY_COLORS: Record<ExtractionDifficulty, string> = {
  easy: '#22c55e',
  moderate: '#eab308',
  hard: '#f97316',
  extreme: '#ef4444',
};

/** Russian labels for extraction difficulty */
export const EXTRACTION_DIFFICULTY_LABELS: Record<ExtractionDifficulty, string> = {
  easy: 'Легко',
  moderate: 'Умеренно',
  hard: 'Трудно',
  extreme: 'Критично',
};

// ─── Hardcoded data points ───────────────────────────────────────────────────

const WATER_QUALITY_POINTS: WaterQualityPoint[] = [
  // ─── Karakalpakstan (very high salinity, Aral Sea area) ─────────
  { lat: 43.77, lng: 58.69, salinity_ppm: 25000, hardness_mg_l: 800, ph: 8.4, turbidity_ntu: 85, arsenic_ppb: 35, fluoride_ppm: 2.1, region_name: 'Муйнак' },
  { lat: 42.46, lng: 59.60, salinity_ppm: 18000, hardness_mg_l: 720, ph: 8.2, turbidity_ntu: 60, arsenic_ppb: 28, fluoride_ppm: 1.8, region_name: 'Нукус' },
  { lat: 42.06, lng: 59.70, salinity_ppm: 12000, hardness_mg_l: 580, ph: 8.0, turbidity_ntu: 45, arsenic_ppb: 22, fluoride_ppm: 1.5, region_name: 'Каракалпакстан (юг)' },
  { lat: 43.20, lng: 58.40, salinity_ppm: 22000, hardness_mg_l: 750, ph: 8.3, turbidity_ntu: 70, arsenic_ppb: 30, fluoride_ppm: 1.9, region_name: 'Аральск (берег)' },

  // ─── Khorezm ──────────────────────────────────────────────────
  { lat: 41.55, lng: 60.63, salinity_ppm: 5500, hardness_mg_l: 420, ph: 7.9, turbidity_ntu: 35, arsenic_ppb: 15, fluoride_ppm: 1.2, region_name: 'Ургенч' },
  { lat: 41.70, lng: 60.80, salinity_ppm: 6200, hardness_mg_l: 450, ph: 7.8, turbidity_ntu: 40, arsenic_ppb: 18, fluoride_ppm: 1.3, region_name: 'Хива' },

  // ─── Bukhara (high salinity) ──────────────────────────────────
  { lat: 39.77, lng: 64.42, salinity_ppm: 4500, hardness_mg_l: 380, ph: 7.8, turbidity_ntu: 28, arsenic_ppb: 12, fluoride_ppm: 1.1, region_name: 'Бухара' },
  { lat: 40.10, lng: 64.00, salinity_ppm: 5800, hardness_mg_l: 410, ph: 7.9, turbidity_ntu: 32, arsenic_ppb: 14, fluoride_ppm: 1.2, region_name: 'Бухара (север)' },
  { lat: 39.30, lng: 64.80, salinity_ppm: 7200, hardness_mg_l: 480, ph: 8.0, turbidity_ntu: 38, arsenic_ppb: 16, fluoride_ppm: 1.4, region_name: 'Бухара (юг)' },

  // ─── Navoi (high salinity, desert) ────────────────────────────
  { lat: 40.10, lng: 65.38, salinity_ppm: 6000, hardness_mg_l: 440, ph: 8.1, turbidity_ntu: 42, arsenic_ppb: 20, fluoride_ppm: 1.5, region_name: 'Навои' },
  { lat: 40.50, lng: 65.00, salinity_ppm: 8000, hardness_mg_l: 520, ph: 8.2, turbidity_ntu: 50, arsenic_ppb: 25, fluoride_ppm: 1.7, region_name: 'Навои (север)' },

  // ─── Kashkadarya ──────────────────────────────────────────────
  { lat: 38.86, lng: 65.80, salinity_ppm: 3200, hardness_mg_l: 320, ph: 7.6, turbidity_ntu: 22, arsenic_ppb: 8, fluoride_ppm: 0.9, region_name: 'Карши' },
  { lat: 39.10, lng: 66.20, salinity_ppm: 2800, hardness_mg_l: 290, ph: 7.5, turbidity_ntu: 18, arsenic_ppb: 6, fluoride_ppm: 0.8, region_name: 'Шахрисабз' },

  // ─── Samarkand (moderate) ─────────────────────────────────────
  { lat: 39.65, lng: 66.95, salinity_ppm: 1200, hardness_mg_l: 220, ph: 7.4, turbidity_ntu: 12, arsenic_ppb: 5, fluoride_ppm: 0.6, region_name: 'Самарканд' },
  { lat: 39.90, lng: 67.20, salinity_ppm: 1500, hardness_mg_l: 250, ph: 7.5, turbidity_ntu: 15, arsenic_ppb: 6, fluoride_ppm: 0.7, region_name: 'Самарканд (север)' },

  // ─── Jizzakh ──────────────────────────────────────────────────
  { lat: 40.12, lng: 67.85, salinity_ppm: 1800, hardness_mg_l: 260, ph: 7.5, turbidity_ntu: 16, arsenic_ppb: 7, fluoride_ppm: 0.8, region_name: 'Джизак' },
  { lat: 40.30, lng: 68.20, salinity_ppm: 2200, hardness_mg_l: 280, ph: 7.6, turbidity_ntu: 20, arsenic_ppb: 8, fluoride_ppm: 0.9, region_name: 'Джизак (восток)' },

  // ─── Sirdarya ─────────────────────────────────────────────────
  { lat: 40.50, lng: 68.65, salinity_ppm: 1600, hardness_mg_l: 240, ph: 7.4, turbidity_ntu: 14, arsenic_ppb: 5, fluoride_ppm: 0.7, region_name: 'Гулистан' },

  // ─── Tashkent (low salinity, good quality) ────────────────────
  { lat: 41.31, lng: 69.28, salinity_ppm: 280, hardness_mg_l: 150, ph: 7.2, turbidity_ntu: 5, arsenic_ppb: 2, fluoride_ppm: 0.3, region_name: 'Ташкент' },
  { lat: 41.20, lng: 69.60, salinity_ppm: 350, hardness_mg_l: 170, ph: 7.3, turbidity_ntu: 7, arsenic_ppb: 3, fluoride_ppm: 0.4, region_name: 'Ташкент (восток)' },
  { lat: 41.50, lng: 69.10, salinity_ppm: 220, hardness_mg_l: 130, ph: 7.1, turbidity_ntu: 4, arsenic_ppb: 1, fluoride_ppm: 0.2, region_name: 'Чирчик' },
  { lat: 41.60, lng: 70.00, salinity_ppm: 480, hardness_mg_l: 180, ph: 7.3, turbidity_ntu: 8, arsenic_ppb: 3, fluoride_ppm: 0.4, region_name: 'Ангрен' },

  // ─── Fergana Valley (moderate) ────────────────────────────────
  { lat: 40.38, lng: 71.79, salinity_ppm: 800, hardness_mg_l: 200, ph: 7.3, turbidity_ntu: 10, arsenic_ppb: 4, fluoride_ppm: 0.5, region_name: 'Фергана' },
  { lat: 40.78, lng: 72.34, salinity_ppm: 650, hardness_mg_l: 185, ph: 7.2, turbidity_ntu: 8, arsenic_ppb: 3, fluoride_ppm: 0.4, region_name: 'Андижан' },
  { lat: 41.00, lng: 71.67, salinity_ppm: 550, hardness_mg_l: 175, ph: 7.2, turbidity_ntu: 7, arsenic_ppb: 3, fluoride_ppm: 0.4, region_name: 'Наманган' },
  { lat: 40.50, lng: 71.20, salinity_ppm: 1100, hardness_mg_l: 210, ph: 7.4, turbidity_ntu: 12, arsenic_ppb: 5, fluoride_ppm: 0.6, region_name: 'Коканд' },
  { lat: 40.60, lng: 72.00, salinity_ppm: 950, hardness_mg_l: 195, ph: 7.3, turbidity_ntu: 11, arsenic_ppb: 4, fluoride_ppm: 0.5, region_name: 'Маргилан' },
  { lat: 40.10, lng: 71.50, salinity_ppm: 1400, hardness_mg_l: 230, ph: 7.4, turbidity_ntu: 14, arsenic_ppb: 6, fluoride_ppm: 0.6, region_name: 'Фергана (юг)' },

  // ─── Surkhandarya (moderate-high) ─────────────────────────────
  { lat: 37.22, lng: 67.28, salinity_ppm: 2500, hardness_mg_l: 310, ph: 7.6, turbidity_ntu: 20, arsenic_ppb: 8, fluoride_ppm: 0.9, region_name: 'Термез' },
  { lat: 38.20, lng: 67.50, salinity_ppm: 2000, hardness_mg_l: 270, ph: 7.5, turbidity_ntu: 16, arsenic_ppb: 7, fluoride_ppm: 0.8, region_name: 'Денау' },
  { lat: 37.80, lng: 67.00, salinity_ppm: 2800, hardness_mg_l: 330, ph: 7.7, turbidity_ntu: 22, arsenic_ppb: 9, fluoride_ppm: 1.0, region_name: 'Шерабад' },
];

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useWaterQualityData(): UseWaterQualityDataResult {
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  const getFilteredPoints = useMemo(() => {
    return (region?: string) => {
      if (!region) return WATER_QUALITY_POINTS;
      const q = region.toLowerCase();
      return WATER_QUALITY_POINTS.filter(p => p.region_name.toLowerCase().includes(q));
    };
  }, []);

  return {
    points: WATER_QUALITY_POINTS,
    loading,
    error,
    getFilteredPoints,
  };
}
