// ═══════════════════════════════════════════════════════════════
//  WeatherWidget — real-time weather card for water monitoring
//  Matches the dark neumorphic / glassmorphic design system
// ═══════════════════════════════════════════════════════════════

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Droplets, Wind, Thermometer, CloudRain, Snowflake,
  Loader2, AlertCircle, RefreshCw, MapPin, Sprout,
} from 'lucide-react';
import { useWeatherData } from '@/hooks/useWeatherData';
import { useClimateData } from '@/hooks/useClimateData';

// ─── Props ───────────────────────────────────────────────────────────────────

interface WeatherWidgetProps {
  latitude: number;
  longitude: number;
  locationName?: string;
  compact?: boolean;
}

// ─── Weather code → emoji ────────────────────────────────────────────────────

function weatherEmoji(code: number, isDay: boolean): string {
  if (code === 0)                         return isDay ? '☀️' : '🌙';
  if (code >= 1 && code <= 3)             return isDay ? '⛅' : '☁️';
  if (code >= 45 && code <= 48)           return '🌫️';
  if (code >= 51 && code <= 67)           return '🌧️';
  if (code >= 71 && code <= 77)           return '🌨️';
  if (code >= 80 && code <= 82)           return '🌧️';
  if (code >= 95 && code <= 99)           return '⛈️';
  return '🌤️';
}

function weatherLabel(code: number): string {
  if (code === 0)                         return 'Ясно';
  if (code >= 1 && code <= 3)             return 'Облачно';
  if (code >= 45 && code <= 48)           return 'Туман';
  if (code >= 51 && code <= 55)           return 'Морось';
  if (code >= 56 && code <= 57)           return 'Изморозь';
  if (code >= 61 && code <= 65)           return 'Дождь';
  if (code >= 66 && code <= 67)           return 'Ледяной дождь';
  if (code >= 71 && code <= 77)           return 'Снег';
  if (code >= 80 && code <= 82)           return 'Ливень';
  if (code >= 95 && code <= 99)           return 'Гроза';
  return 'Переменно';
}

// ─── Day-of-week short labels ────────────────────────────────────────────────

const DAY_LABELS_RU = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const MONTH_LABELS_RU = [
  'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
  'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек',
];

function dayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return DAY_LABELS_RU[d.getDay()] ?? '';
}

// ─── Palette ─────────────────────────────────────────────────────────────────

const C = {
  cyan:    '#00e6c8',
  cyanDim: 'rgba(0,230,200,0.5)',
  cyanBg:  'rgba(0,230,200,0.08)',
  blue:    '#60a5fa',
  blueBg:  'rgba(96,165,250,0.08)',
  yellow:  '#fbbf24',
  green:   '#4ade80',
  greenBg: 'rgba(74,222,128,0.08)',
  muted:   'rgba(255,255,255,0.45)',
  card:    'linear-gradient(145deg, rgba(0,22,55,0.92), rgba(0,12,38,0.96))',
  cardShadow:
    '5px 5px 18px rgba(0,0,0,0.55), -3px -3px 10px rgba(0,160,220,0.04), inset 0 1px 0 rgba(255,255,255,0.055), inset 0 0 20px rgba(0,150,220,0.03)',
};

// ─── Tiny bar for precipitation ──────────────────────────────────────────────

function PrecipBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div
      className="w-full rounded-full overflow-hidden"
      style={{ height: 4, background: 'rgba(255,255,255,0.06)' }}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="h-full rounded-full"
        style={{
          background: value > 0
            ? `linear-gradient(90deg, ${C.blue}, ${C.cyan})`
            : 'transparent',
        }}
      />
    </div>
  );
}

// ─── Soil moisture gauge ─────────────────────────────────────────────────────

function SoilGauge({ value }: { value: number }) {
  // value is in m³/m³, typically 0 – 0.5
  const pct = Math.min(100, (value / 0.5) * 100);
  const color = pct > 60 ? C.cyan : pct > 30 ? C.yellow : '#ff4d6d';
  return (
    <div className="flex items-center gap-2 w-full">
      <Sprout className="h-3.5 w-3.5 flex-shrink-0" style={{ color }} />
      <div className="flex-1">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[10px] font-medium" style={{ color: C.muted }}>
            Влажность почвы
          </span>
          <span className="text-[10px] font-bold text-white/80">
            {(value * 100).toFixed(0)}%
          </span>
        </div>
        <div
          className="w-full rounded-full overflow-hidden"
          style={{ height: 4, background: 'rgba(255,255,255,0.06)' }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ background: color }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Stat pill ───────────────────────────────────────────────────────────────

function StatPill({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
      style={{
        background: 'rgba(0,20,55,0.6)',
        border: '1px solid rgba(0,200,240,0.07)',
        boxShadow:
          'inset 2px 2px 6px rgba(0,0,0,0.35), inset -1px -1px 4px rgba(0,160,220,0.04)',
      }}
    >
      <Icon className="h-3.5 w-3.5 flex-shrink-0" style={{ color }} />
      <div className="min-w-0">
        <div className="text-[9px] font-medium leading-none mb-0.5" style={{ color: C.muted }}>
          {label}
        </div>
        <div className="text-xs font-bold text-white/90 leading-none">{value}</div>
      </div>
    </div>
  );
}

// ─── Climate mini chart ──────────────────────────────────────────────────────

function ClimateChart({
  months,
}: {
  months: { date: string; precipitation: number }[];
}) {
  const max = useMemo(
    () => Math.max(1, ...months.map((m) => m.precipitation)),
    [months],
  );

  if (months.length === 0) return null;

  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: C.muted }}>
        Осадки за 12 мес. (мм)
      </div>
      <div className="flex items-end gap-[3px]" style={{ height: 32 }}>
        {months.map((m) => {
          const h = Math.max(2, (m.precipitation / max) * 28);
          const monthIdx = parseInt(m.date.split('-')[1] ?? '1', 10) - 1;
          return (
            <div key={m.date} className="flex-1 flex flex-col items-center gap-0.5">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: h }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="w-full rounded-sm"
                style={{
                  background: `linear-gradient(180deg, ${C.blue}, ${C.cyan})`,
                  opacity: 0.7,
                  minWidth: 4,
                }}
                title={`${MONTH_LABELS_RU[monthIdx]}: ${m.precipitation.toFixed(0)} мм`}
              />
              <span className="text-[7px] text-white/30 leading-none">
                {MONTH_LABELS_RU[monthIdx]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  Main Widget
// ═══════════════════════════════════════════════════════════════

export default function WeatherWidget({
  latitude,
  longitude,
  locationName,
  compact = false,
}: WeatherWidgetProps) {
  const { data, loading, error, refetch } = useWeatherData(latitude, longitude);
  const climate = useClimateData(latitude, longitude);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading && !data) {
    return (
      <WidgetShell compact={compact}>
        <div className="flex items-center justify-center gap-2 py-6">
          <Loader2 className="h-5 w-5 animate-spin" style={{ color: C.cyan }} />
          <span className="text-sm text-white/50">Загрузка погоды...</span>
        </div>
      </WidgetShell>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error && !data) {
    return (
      <WidgetShell compact={compact}>
        <div className="flex flex-col items-center justify-center gap-2 py-6">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <span className="text-sm text-white/50">{error}</span>
          <button
            onClick={refetch}
            className="flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-lg transition-colors"
            style={{ color: C.cyan, background: C.cyanBg }}
          >
            <RefreshCw className="h-3 w-3" /> Повторить
          </button>
        </div>
      </WidgetShell>
    );
  }

  if (!data) return null;

  const maxPrecip = Math.max(1, ...data.forecast.map((f) => f.precipitationSum));

  // ── Compact mode ───────────────────────────────────────────────────────────
  if (compact) {
    return (
      <WidgetShell compact>
        <div className="flex items-center gap-3">
          {/* Emoji + temp */}
          <div className="flex items-center gap-1.5">
            <span className="text-2xl leading-none">
              {weatherEmoji(data.weatherCode, data.isDay)}
            </span>
            <span
              className="text-xl font-black text-white tracking-tight"
              style={{ textShadow: `0 0 14px ${C.cyanDim}` }}
            >
              {data.temperature.toFixed(0)}°
            </span>
          </div>

          {/* Divider */}
          <div className="w-px h-6 opacity-20" style={{ background: C.cyan }} />

          {/* Stats row */}
          <div className="flex items-center gap-3 text-[11px] text-white/60">
            <span className="flex items-center gap-1">
              <Droplets className="h-3 w-3" style={{ color: C.blue }} />
              {data.humidity}%
            </span>
            <span className="flex items-center gap-1">
              <CloudRain className="h-3 w-3" style={{ color: C.cyan }} />
              {data.precipitation.toFixed(1)}мм
            </span>
            <span className="flex items-center gap-1">
              <Wind className="h-3 w-3" style={{ color: C.muted }} />
              {data.windSpeed.toFixed(0)}км/ч
            </span>
          </div>
        </div>
      </WidgetShell>
    );
  }

  // ── Full mode ──────────────────────────────────────────────────────────────
  return (
    <WidgetShell compact={false}>
      {/* Header: location + refresh */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 min-w-0">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0" style={{ color: C.cyan }} />
          <span className="text-xs font-semibold text-white/70 truncate">
            {locationName || `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`}
          </span>
        </div>
        <button
          onClick={refetch}
          className="p-1 rounded-lg transition-all hover:scale-110"
          style={{ color: C.muted }}
          title="Обновить"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Current weather hero */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-4xl leading-none select-none">
          {weatherEmoji(data.weatherCode, data.isDay)}
        </span>
        <div>
          <div
            className="text-3xl font-black text-white tracking-tight leading-none"
            style={{ textShadow: `0 0 20px ${C.cyanDim}` }}
          >
            {data.temperature.toFixed(1)}°C
          </div>
          <div className="text-xs font-medium mt-0.5" style={{ color: C.muted }}>
            {weatherLabel(data.weatherCode)}
          </div>
        </div>
      </div>

      {/* Stats pills row */}
      <div className="grid grid-cols-3 gap-1.5 mb-3">
        <StatPill
          icon={Droplets}
          label="Влажность"
          value={`${data.humidity}%`}
          color={C.blue}
        />
        <StatPill
          icon={CloudRain}
          label="Осадки"
          value={`${data.precipitation.toFixed(1)} мм`}
          color={C.cyan}
        />
        <StatPill
          icon={Wind}
          label="Ветер"
          value={`${data.windSpeed.toFixed(0)} км/ч`}
          color={C.muted}
        />
      </div>

      {/* Evapotranspiration + Snow depth */}
      <div className="grid grid-cols-2 gap-1.5 mb-3">
        <StatPill
          icon={Thermometer}
          label="Эвапотранспирация"
          value={`${data.evapotranspiration.toFixed(1)} мм`}
          color={C.green}
        />
        <StatPill
          icon={Snowflake}
          label="Глубина снега"
          value={`${data.snowDepth.toFixed(0)} см`}
          color="#c4b5fd"
        />
      </div>

      {/* Soil moisture gauge */}
      <div className="mb-4">
        <SoilGauge value={data.soilMoisture} />
      </div>

      {/* 7-day forecast */}
      <div className="mb-4">
        <div
          className="text-[10px] font-semibold uppercase tracking-widest mb-2"
          style={{ color: C.muted }}
        >
          Прогноз на 7 дней
        </div>
        <div className="grid grid-cols-7 gap-1">
          {data.forecast.map((f) => (
            <div key={f.date} className="flex flex-col items-center gap-0.5">
              <span className="text-[9px] font-medium text-white/40">
                {dayLabel(f.date)}
              </span>
              <span className="text-[10px] font-bold text-white/80">
                {f.tempMax.toFixed(0)}°
              </span>
              <PrecipBar value={f.precipitationSum} max={maxPrecip} />
              <span className="text-[8px] text-white/30">
                {f.precipitationSum > 0
                  ? `${f.precipitationSum.toFixed(0)}мм`
                  : '—'}
              </span>
              {f.precipitationProbability > 0 && (
                <span className="text-[7px]" style={{ color: C.blue }}>
                  {f.precipitationProbability}%
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Climate history chart */}
      {!climate.loading && !climate.error && climate.months.length > 0 && (
        <ClimateChart months={climate.months} />
      )}
    </WidgetShell>
  );
}

// ─── Card shell ──────────────────────────────────────────────────────────────

function WidgetShell({
  compact,
  children,
}: {
  compact: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={`relative overflow-hidden rounded-2xl ${compact ? 'px-4 py-2.5' : 'p-4 sm:p-5'} transition-all duration-300 group`}
      style={{
        background: C.card,
        boxShadow: C.cardShadow,
        border: '1px solid rgba(0,210,240,0.09)',
      }}
    >
      {/* Subtle top shimmer */}
      <div
        className="absolute top-0 left-0 right-0 h-px opacity-30"
        style={{
          background: `linear-gradient(90deg, transparent, ${C.cyan}, transparent)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>

      {/* Bottom shimmer line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px opacity-20"
        style={{
          background: `linear-gradient(90deg, transparent, ${C.cyan}, transparent)`,
        }}
      />
    </motion.div>
  );
}
