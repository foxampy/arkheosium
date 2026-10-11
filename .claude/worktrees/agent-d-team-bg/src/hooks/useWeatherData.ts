// ═══════════════════════════════════════════════════════════════
//  useWeatherData — real-time weather from Open-Meteo (no API key)
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ForecastDay {
  date: string;
  tempMax: number;
  tempMin: number;
  precipitationSum: number;
  precipitationProbability: number;
}

export interface WeatherData {
  temperature: number;
  precipitation: number;        // mm
  humidity: number;              // %
  windSpeed: number;             // km/h
  soilMoisture: number;          // m³/m³
  evapotranspiration: number;    // mm
  snowDepth: number;             // cm
  weatherCode: number;
  isDay: boolean;
  forecast: ForecastDay[];
}

export interface UseWeatherDataResult {
  data: WeatherData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// ─── Cache helpers ───────────────────────────────────────────────────────────

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

function cacheKey(lat: number, lng: number): string {
  return `weather_cache_${lat.toFixed(4)}_${lng.toFixed(4)}`;
}

interface CachedWeather {
  data: WeatherData;
  timestamp: number;
}

function readCache(lat: number, lng: number): WeatherData | null {
  try {
    const raw = localStorage.getItem(cacheKey(lat, lng));
    if (!raw) return null;
    const cached: CachedWeather = JSON.parse(raw);
    if (Date.now() - cached.timestamp > CACHE_TTL_MS) {
      localStorage.removeItem(cacheKey(lat, lng));
      return null;
    }
    return cached.data;
  } catch {
    return null;
  }
}

function writeCache(lat: number, lng: number, data: WeatherData): void {
  try {
    const entry: CachedWeather = { data, timestamp: Date.now() };
    localStorage.setItem(cacheKey(lat, lng), JSON.stringify(entry));
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

// ─── API URL builder ─────────────────────────────────────────────────────────

function buildUrl(lat: number, lng: number): string {
  const params = new URLSearchParams({
    latitude:      lat.toString(),
    longitude:     lng.toString(),
    current:       [
      'temperature_2m',
      'relative_humidity_2m',
      'precipitation',
      'wind_speed_10m',
      'weather_code',
      'is_day',
      'soil_moisture_0_to_7cm',
      'et0_fao_evapotranspiration',
      'snow_depth',
    ].join(','),
    daily:         [
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_sum',
      'precipitation_probability_max',
    ].join(','),
    timezone:      'auto',
    forecast_days: '7',
  });
  return `https://api.open-meteo.com/v1/forecast?${params}`;
}

// ─── Response parser ─────────────────────────────────────────────────────────

function parseResponse(json: any): WeatherData {
  const c = json.current ?? {};
  const d = json.daily ?? {};

  const dates: string[]   = d.time ?? [];
  const tMax: number[]    = d.temperature_2m_max ?? [];
  const tMin: number[]    = d.temperature_2m_min ?? [];
  const pSum: number[]    = d.precipitation_sum ?? [];
  const pProb: number[]   = d.precipitation_probability_max ?? [];

  const forecast: ForecastDay[] = dates.map((date, i) => ({
    date,
    tempMax:                  tMax[i]  ?? 0,
    tempMin:                  tMin[i]  ?? 0,
    precipitationSum:         pSum[i]  ?? 0,
    precipitationProbability: pProb[i] ?? 0,
  }));

  return {
    temperature:        c.temperature_2m              ?? 0,
    precipitation:      c.precipitation               ?? 0,
    humidity:           c.relative_humidity_2m         ?? 0,
    windSpeed:          c.wind_speed_10m               ?? 0,
    soilMoisture:       c.soil_moisture_0_to_7cm       ?? 0,
    evapotranspiration: c.et0_fao_evapotranspiration   ?? 0,
    snowDepth:          c.snow_depth                   ?? 0,
    weatherCode:        c.weather_code                 ?? 0,
    isDay:              Boolean(c.is_day),
    forecast,
  };
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useWeatherData(
  latitude: number | undefined,
  longitude: number | undefined,
): UseWeatherDataResult {
  const [data, setData]       = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  const refetch = useCallback(() => setTrigger((n) => n + 1), []);

  useEffect(() => {
    if (latitude == null || longitude == null) return;

    // Try cache first
    const cached = readCache(latitude, longitude);
    if (cached && trigger === 0) {
      setData(cached);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    async function fetchWeather() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(buildUrl(latitude!, longitude!), {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (cancelled) return;

        const parsed = parseResponse(json);
        writeCache(latitude!, longitude!, parsed);
        setData(parsed);
      } catch (err: any) {
        if (cancelled) return;
        if (err.name === 'AbortError') return;
        console.warn('[useWeatherData] fetch failed:', err);
        setError('Данные недоступны');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchWeather();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [latitude, longitude, trigger]);

  return { data, loading, error, refetch };
}
