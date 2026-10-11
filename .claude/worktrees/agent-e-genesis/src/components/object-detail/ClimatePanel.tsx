// src/components/object-detail/ClimatePanel.tsx
// Real-time climate & hydrology panel for ObjectDetailPage
// Uses Open-Meteo (free, no key) + GloFAS river discharge

import { useEffect, useState } from 'react';
import {
  CloudRain, Thermometer, Wind, Droplets, Sun,
  Activity, TrendingDown, RefreshCw, AlertTriangle, Loader2, MapPin,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import {
  getWeather, getRiverDischarge,
  type ClimateData, type RiverDischarge,
} from '@/services/openDataAPI';

// ─── Types ─────────────────────────────────────────────────────────────────

interface Props {
  lat?: number;
  lon?: number;
  objectType?: string;
  objectName?: string;
}

// ─── River detection ────────────────────────────────────────────────────────

const RIVER_DETECTION: Array<{ keywords: string[]; river: Parameters<typeof getRiverDischarge>[0] }> = [
  { keywords: ['аму','amu','аральское','хорезм','навои','бухар','каракалп','khorezm'], river: 'amu_darya' },
  { keywords: ['сырдарь','syr','ферган','fergana','ташкент','tashkent','андижан','наман','джизак'], river: 'syr_darya' },
  { keywords: ['нарын','naryn','кыргыз','kyrgyz','баткен'], river: 'naryn' },
  { keywords: ['зераф','zeraf','самарк','samarkand','пенджикент'], river: 'zerafshan' },
];

function detectRiver(name: string): Parameters<typeof getRiverDischarge>[0] | null {
  const lower = name.toLowerCase();
  for (const { keywords, river } of RIVER_DETECTION) {
    if (keywords.some(k => lower.includes(k))) return river;
  }
  return null;
}

function wmoDesc(code: number): string {
  const WMO: Record<number, string> = {
    0: 'Ясно', 1: 'Преимущественно ясно', 2: 'Переменная облачность',
    3: 'Пасмурно', 45: 'Туман', 48: 'Изморозь',
    51: 'Морось слабая', 53: 'Морось', 55: 'Морось сильная',
    61: 'Дождь слабый', 63: 'Дождь', 65: 'Дождь сильный',
    71: 'Снег слабый', 73: 'Снег', 75: 'Снег сильный',
    80: 'Ливень слабый', 81: 'Ливень', 82: 'Ливень сильный',
    95: 'Гроза', 96: 'Гроза с градом', 99: 'Гроза с сильным градом',
  };
  return WMO[code] ?? `Погода код ${code}`;
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-4"
      style={{ background: 'rgba(0,8,30,0.7)', border: '1px solid rgba(0,230,200,0.12)', backdropFilter: 'blur(10px)' }}>
      {children}
    </div>
  );
}

function MetricTile({ label, value, sub, icon: Icon, color = '#00e6c8' }:
  { label: string; value: string; sub?: string; icon: React.ElementType; color?: string }) {
  return (
    <div className="flex flex-col gap-1 p-3 rounded-xl"
      style={{ background: 'rgba(0,230,200,0.05)', border: `1px solid ${color}20` }}>
      <div className="flex items-center gap-1.5 mb-0.5">
        <Icon size={12} style={{ color }} />
        <span className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</span>
      </div>
      <span className="text-lg font-black tabular-nums" style={{ color }}>{value}</span>
      {sub && <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{sub}</span>}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function ClimatePanel({ lat, lon, objectName = '' }: Props) {
  const [climate, setClimate] = useState<ClimateData | null>(null);
  const [river, setRiver] = useState<RiverDischarge | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const detectedRiver = detectRiver(objectName);

  // Effective coordinates (fall back to Tashkent for demo)
  const effectiveLat = lat ?? 41.3;
  const effectiveLon = lon ?? 69.3;
  const hasCoords = lat !== undefined && lon !== undefined;

  async function load() {
    setLoading(true);
    try {
      const [climateData, riverData] = await Promise.all([
        getWeather({ lat: effectiveLat, lon: effectiveLon }),
        detectedRiver ? getRiverDischarge(detectedRiver) : Promise.resolve(null),
      ]);
      setClimate(climateData);
      if (riverData) setRiver(riverData);
    } catch {
      // fail silently
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  }

  useEffect(() => { load(); }, [lat, lon, objectName]); // eslint-disable-line react-hooks/exhaustive-deps

  // ET₀ estimate from temperature (simplified Hargreaves)
  const cur = climate?.current;
  const et0 = cur
    ? Math.max(0, 0.0023 * (cur.temperature_2m + 17.8) * Math.sqrt(15) * 0.408).toFixed(1)
    : null;

  // Irrigation demand: 1000 ha, Kc=1.1, efficiency 70%
  const irrigDailyM3 = et0
    ? parseFloat(et0) * 1.1 / 0.70 * 1000 * 10   // mm/day → m³/day per 1000 ha
    : null;

  // 7-day forecast array from parallel arrays in forecast_7d
  const fc = climate?.forecast_7d;
  const chartData = fc?.dates?.slice(0, 7).map((date, i) => ({
    day: new Date(date).toLocaleDateString('ru', { weekday: 'short' }),
    maxT: fc.temperature_max[i] ?? 0,
    minT: fc.temperature_min[i] ?? 0,
    precip: fc.precipitation_sum[i] ?? 0,
  })) ?? [];

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-bold text-white/80 text-sm uppercase tracking-widest">
          🌍 Климат и гидрология
        </h3>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full cursor-pointer"
          style={{ background: 'rgba(0,230,200,0.1)', color: '#00e6c8', border: '1px solid rgba(0,230,200,0.2)' }}
        >
          {loading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
          Обновить
        </button>
      </div>

      {!hasCoords && (
        <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-xl mb-1"
          style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', color: 'rgba(251,191,36,0.8)' }}>
          <MapPin size={12} />
          Координаты не указаны — показаны данные по Ташкенту (по умолчанию)
        </div>
      )}

      {loading && !climate ? (
        <Card>
          <div className="flex items-center justify-center py-12 gap-2" style={{ color: '#00e6c8' }}>
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">Загрузка климатических данных...</span>
          </div>
        </Card>
      ) : climate && cur ? (
        <>
          {/* Current conditions */}
          <Card>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-2xl font-black text-white">{cur.temperature_2m.toFixed(1)}°C</div>
                <div className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{wmoDesc(cur.weather_code)}</div>
              </div>
              <div className="text-right text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {hasCoords ? `${lat!.toFixed(2)}°N, ${lon!.toFixed(2)}°E` : 'Ташкент (по умолчанию)'}
                <br />
                {lastRefresh.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <MetricTile label="Влажность" value={`${cur.relative_humidity_2m}%`} icon={Droplets} color="#60a5fa" />
              <MetricTile label="Ветер" value={`${cur.wind_speed_10m} км/ч`} icon={Wind} color="#a78bfa" />
              <MetricTile label="Осадки" value={`${cur.precipitation} мм`} icon={CloudRain} color="#34d399" />
              {et0 && <MetricTile label="ЕТ₀ (сегодня)" value={`${et0} мм`} icon={Sun} color="#fbbf24" />}
            </div>
          </Card>

          {/* ET0 & Irrigation demand */}
          {et0 && irrigDailyM3 && (
            <Card>
              <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
                💧 Ирригационный спрос · FAO-56 упрощённый
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <MetricTile label="ЕТ₀ сегодня" value={`${et0} мм/сут`} icon={Sun} color="#fbbf24" />
                <MetricTile
                  label="Спрос (1000 га)"
                  value={`${(irrigDailyM3 / 1000).toFixed(0)} тыс. м³/сут`}
                  sub="Kc=1.1, η=70%"
                  icon={Droplets}
                />
                <MetricTile
                  label="Сезон (180 дней)"
                  value={`${(irrigDailyM3 * 180 / 1e6).toFixed(1)} млн м³`}
                  icon={Activity}
                  color="#f97316"
                />
              </div>
              <div className="mt-3 text-xs rounded-xl px-3 py-2"
                style={{ background: 'rgba(251,191,36,0.06)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(251,191,36,0.12)' }}>
                ℹ️ Упрощённый метод Харгривза на основе температуры. Для точного проектирования используйте полный метод Пенмана–Монтейта (FAO-56).
              </div>
            </Card>
          )}

          {/* 7-day forecast */}
          {chartData.length > 0 && (
            <Card>
              <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
                📅 Прогноз на 7 дней · Open-Meteo
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="tMaxG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="tMinG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} unit="°" />
                  <Tooltip
                    contentStyle={{ background: '#000c24', border: '1px solid rgba(0,230,200,0.2)', borderRadius: 12 }}
                    labelStyle={{ color: '#00e6c8' }}
                    itemStyle={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}
                  />
                  <Area type="monotone" dataKey="maxT" name="T макс °C" stroke="#f97316" fill="url(#tMaxG)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="minT" name="T мин °C" stroke="#60a5fa" fill="url(#tMinG)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
              {/* Precipitation mini-bars */}
              <div className="flex gap-1 mt-2">
                {chartData.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                    <div className="w-full rounded-sm"
                      style={{
                        height: Math.max(2, Math.min(24, d.precip * 4)),
                        background: `rgba(96,165,250,${Math.min(0.9, 0.15 + d.precip * 0.1)})`,
                      }}
                    />
                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9 }}>{d.precip.toFixed(0)}мм</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      ) : (
        <Card>
          <div className="flex items-center gap-3 py-6 justify-center" style={{ color: 'rgba(255,190,50,0.8)' }}>
            <AlertTriangle size={20} />
            <span className="text-sm">Не удалось загрузить климатические данные. Проверьте интернет-соединение.</span>
          </div>
        </Card>
      )}

      {/* River discharge */}
      {detectedRiver && (
        <Card>
          <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
            🌊 Расход реки — {
              detectedRiver === 'amu_darya' ? 'Амударья' :
              detectedRiver === 'syr_darya' ? 'Сырдарья' :
              detectedRiver === 'naryn'     ? 'Нарын'     : 'Зарафшан'
            } · GloFAS / Open-Meteo Flood
          </div>
          {loading && !river ? (
            <div className="flex items-center justify-center py-6 gap-2" style={{ color: '#60a5fa' }}>
              <Loader2 size={14} className="animate-spin" />
              <span className="text-xs">Загрузка данных реки...</span>
            </div>
          ) : river ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <MetricTile
                label="Текущий расход"
                value={river.current_discharge_m3s != null ? `${river.current_discharge_m3s.toFixed(0)} м³/с` : '—'}
                icon={Activity}
              />
              <MetricTile
                label="Среднемн. расход"
                value={river.mean_discharge_m3s != null ? `${river.mean_discharge_m3s.toFixed(0)} м³/с` : '—'}
                icon={TrendingDown}
                color="#60a5fa"
              />
              <MetricTile
                label="Пост / Страна"
                value={river.station_name}
                sub={river.country}
                icon={MapPin}
                color="#a78bfa"
              />
            </div>
          ) : (
            <div className="text-center py-4 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Данные реки недоступны. Повторите позже.
            </div>
          )}
          <div className="text-xs mt-3" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Источник: Open-Meteo Flood API (GloFAS) · Обновляется ежечасно
          </div>
        </Card>
      )}

    </div>
  );
}
