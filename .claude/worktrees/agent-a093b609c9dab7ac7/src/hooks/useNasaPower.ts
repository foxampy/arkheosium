// ═══════════════════════════════════════════════════════════════
//  useNasaPower — NASA POWER API for solar radiation & climate data
//  Evaluates solar desalination potential for water systems in Uzbekistan
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface NasaPowerMonthly {
  month: number;          // 1-12
  monthLabel: string;     // "Jan", "Feb", etc.
  solarRadiation: number; // kWh/m²/day (ALLSKY_SFC_SW_DWN)
  temperature: number;    // °C (T2M)
  precipitation: number;  // mm/day (PRECTOTCORR)
}

export interface NasaPowerData {
  latitude: number;
  longitude: number;
  startYear: number;
  endYear: number;
  monthly: NasaPowerMonthly[];
  annualAvgSolar: number;     // kWh/m²/day annual average
  annualAvgTemp: number;      // °C annual average
  annualTotalPrecip: number;  // mm/year total
  solarDesalinationPotential: 'excellent' | 'good' | 'moderate' | 'low';
}

export interface UseNasaPowerResult {
  data: NasaPowerData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const NASA_POWER_BASE = 'https://power.larc.nasa.gov/api/temporal/monthly/point';

const PARAMETERS = 'ALLSKY_SFC_SW_DWN,T2M,PRECTOTCORR';

// ─── Cache ───────────────────────────────────────────────────────────────────

const CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours (data is historical / slow-changing)

function cacheKey(lat: number, lng: number, startYear: number, endYear: number): string {
  return `nasa_power_${lat.toFixed(3)}_${lng.toFixed(3)}_${startYear}_${endYear}`;
}

interface CachedNasaPower {
  data: NasaPowerData;
  timestamp: number;
}

function readCache(lat: number, lng: number, startYear: number, endYear: number): NasaPowerData | null {
  try {
    const raw = localStorage.getItem(cacheKey(lat, lng, startYear, endYear));
    if (!raw) return null;
    const cached: CachedNasaPower = JSON.parse(raw);
    if (Date.now() - cached.timestamp > CACHE_TTL_MS) {
      localStorage.removeItem(cacheKey(lat, lng, startYear, endYear));
      return null;
    }
    return cached.data;
  } catch {
    return null;
  }
}

function writeCache(lat: number, lng: number, startYear: number, endYear: number, data: NasaPowerData): void {
  try {
    const entry: CachedNasaPower = { data, timestamp: Date.now() };
    localStorage.setItem(cacheKey(lat, lng, startYear, endYear), JSON.stringify(entry));
  } catch {
    // localStorage full or unavailable
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function evaluateSolarPotential(avgSolar: number): NasaPowerData['solarDesalinationPotential'] {
  if (avgSolar >= 5.5) return 'excellent';
  if (avgSolar >= 4.5) return 'good';
  if (avgSolar >= 3.5) return 'moderate';
  return 'low';
}

function buildUrl(lat: number, lng: number, startYear: number, endYear: number): string {
  const params = new URLSearchParams({
    parameters: PARAMETERS,
    community: 'RE',
    longitude: lng.toString(),
    latitude: lat.toString(),
    start: startYear.toString(),
    end: endYear.toString(),
    format: 'JSON',
  });
  return `${NASA_POWER_BASE}?${params}`;
}

function parseResponse(json: any, lat: number, lng: number, startYear: number, endYear: number): NasaPowerData {
  const props = json.properties?.parameter ?? {};
  const solar = props.ALLSKY_SFC_SW_DWN ?? {};
  const temp = props.T2M ?? {};
  const precip = props.PRECTOTCORR ?? {};

  // NASA POWER returns data keyed by YYYYMM; we compute monthly averages across years
  const monthTotals: { solar: number[]; temp: number[]; precip: number[] } = {
    solar: Array(12).fill(0),
    temp: Array(12).fill(0),
    precip: Array(12).fill(0),
  };
  const monthCounts = Array(12).fill(0);

  for (const key of Object.keys(solar)) {
    if (key.length !== 6) continue; // skip annual "13" entries
    const month = parseInt(key.slice(4)) - 1; // 0-indexed
    if (month < 0 || month > 11) continue;
    const sVal = solar[key] ?? 0;
    const tVal = temp[key] ?? 0;
    const pVal = precip[key] ?? 0;
    // NASA uses -999 as fill value for missing data
    if (sVal > -900 && tVal > -900 && pVal > -900) {
      monthTotals.solar[month] += sVal;
      monthTotals.temp[month] += tVal;
      monthTotals.precip[month] += pVal;
      monthCounts[month]++;
    }
  }

  const monthly: NasaPowerMonthly[] = MONTH_LABELS.map((label, i) => {
    const count = monthCounts[i] || 1;
    return {
      month: i + 1,
      monthLabel: label,
      solarRadiation: Math.round((monthTotals.solar[i] / count) * 100) / 100,
      temperature: Math.round((monthTotals.temp[i] / count) * 10) / 10,
      precipitation: Math.round((monthTotals.precip[i] / count) * 100) / 100,
    };
  });

  const annualAvgSolar = monthly.reduce((s, m) => s + m.solarRadiation, 0) / 12;
  const annualAvgTemp = monthly.reduce((s, m) => s + m.temperature, 0) / 12;
  // Precipitation is mm/day; multiply by ~30.44 days/month and sum all 12 months
  const annualTotalPrecip = monthly.reduce((s, m) => s + m.precipitation * 30.44, 0);

  return {
    latitude: lat,
    longitude: lng,
    startYear,
    endYear,
    monthly,
    annualAvgSolar: Math.round(annualAvgSolar * 100) / 100,
    annualAvgTemp: Math.round(annualAvgTemp * 10) / 10,
    annualTotalPrecip: Math.round(annualTotalPrecip),
    solarDesalinationPotential: evaluateSolarPotential(annualAvgSolar),
  };
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useNasaPower(
  latitude: number | undefined,
  longitude: number | undefined,
  startYear = 2018,
  endYear = 2023,
): UseNasaPowerResult {
  const [data, setData] = useState<NasaPowerData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  const refetch = useCallback(() => setTrigger((n) => n + 1), []);

  useEffect(() => {
    if (latitude == null || longitude == null) return;

    // Try cache first
    const cached = readCache(latitude, longitude, startYear, endYear);
    if (cached && trigger === 0) {
      setData(cached);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(buildUrl(latitude!, longitude!, startYear, endYear), {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (cancelled) return;

        const parsed = parseResponse(json, latitude!, longitude!, startYear, endYear);
        writeCache(latitude!, longitude!, startYear, endYear, parsed);
        setData(parsed);
      } catch (err: any) {
        if (cancelled) return;
        if (err.name === 'AbortError') return;
        console.warn('[useNasaPower] fetch failed:', err);
        setError('NASA POWER data unavailable');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [latitude, longitude, startYear, endYear, trigger]);

  return { data, loading, error, refetch };
}
