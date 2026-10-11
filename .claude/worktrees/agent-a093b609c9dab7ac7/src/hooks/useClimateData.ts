// ═══════════════════════════════════════════════════════════════
//  useClimateData — historical monthly climate from Open-Meteo Archive
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface MonthlyClimate {
  date: string;            // YYYY-MM format
  precipitation: number;   // mm total for the month
  temperature: number;     // °C monthly mean
}

export interface UseClimateDataResult {
  months: MonthlyClimate[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// ─── Cache ───────────────────────────────────────────────────────────────────

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour (historical data changes rarely)

function cacheKey(lat: number, lng: number): string {
  return `climate_cache_${lat.toFixed(4)}_${lng.toFixed(4)}`;
}

interface CachedClimate {
  months: MonthlyClimate[];
  timestamp: number;
}

function readCache(lat: number, lng: number): MonthlyClimate[] | null {
  try {
    const raw = localStorage.getItem(cacheKey(lat, lng));
    if (!raw) return null;
    const cached: CachedClimate = JSON.parse(raw);
    if (Date.now() - cached.timestamp > CACHE_TTL_MS) {
      localStorage.removeItem(cacheKey(lat, lng));
      return null;
    }
    return cached.months;
  } catch {
    return null;
  }
}

function writeCache(lat: number, lng: number, months: MonthlyClimate[]): void {
  try {
    const entry: CachedClimate = { months, timestamp: Date.now() };
    localStorage.setItem(cacheKey(lat, lng), JSON.stringify(entry));
  } catch {
    // silently ignore
  }
}

// ─── Date helpers ────────────────────────────────────────────────────────────

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// ─── URL builder ─────────────────────────────────────────────────────────────

function buildArchiveUrl(lat: number, lng: number): string {
  const now   = new Date();
  const end   = new Date(now.getFullYear(), now.getMonth(), 0); // last day of prev month
  const start = new Date(end.getFullYear() - 1, end.getMonth() + 1, 1); // 12 months back

  const params = new URLSearchParams({
    latitude:   lat.toString(),
    longitude:  lng.toString(),
    start_date: toISODate(start),
    end_date:   toISODate(end),
    monthly:    'precipitation_sum,temperature_2m_mean',
    timezone:   'auto',
  });
  return `https://archive-api.open-meteo.com/v1/archive?${params}`;
}

// ─── Parser ──────────────────────────────────────────────────────────────────

function parseArchive(json: any): MonthlyClimate[] {
  const m = json.monthly ?? {};
  const dates: string[]  = m.time ?? [];
  const precip: number[] = m.precipitation_sum ?? [];
  const temp: number[]   = m.temperature_2m_mean ?? [];

  return dates.map((date, i) => ({
    date,
    precipitation: precip[i] ?? 0,
    temperature:   temp[i]   ?? 0,
  }));
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useClimateData(
  latitude: number | undefined,
  longitude: number | undefined,
): UseClimateDataResult {
  const [months, setMonths]   = useState<MonthlyClimate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  const refetch = useCallback(() => setTrigger((n) => n + 1), []);

  useEffect(() => {
    if (latitude == null || longitude == null) return;

    // Try cache
    const cached = readCache(latitude, longitude);
    if (cached && trigger === 0) {
      setMonths(cached);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    async function fetchClimate() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(buildArchiveUrl(latitude!, longitude!), {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (cancelled) return;

        const parsed = parseArchive(json);
        writeCache(latitude!, longitude!, parsed);
        setMonths(parsed);
      } catch (err: any) {
        if (cancelled) return;
        if (err.name === 'AbortError') return;
        console.warn('[useClimateData] fetch failed:', err);
        setError('Данные недоступны');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchClimate();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [latitude, longitude, trigger]);

  return { months, loading, error, refetch };
}
