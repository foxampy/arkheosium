import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, Globe, Building2, Building, FolderOpen,
  Layers, ArrowRight, X, MapPin, Droplets, Zap,
  Play, Pause, Calendar, AlertTriangle, TrendingDown,
  Search, SlidersHorizontal, ChevronRight, ChevronDown,
  Waves, Mountain, Map
} from "lucide-react";
import { OBJECTS_DATA, getObjectColor, getObjectColorForYear, getObjectValueForYear, CRISIS_COLORS, type PlatformObject } from "@/data/objects-data";
import { SUBJECTS_DATA, getSubjectColor, type PlatformSubject } from "@/data/subjects-data";
import { PROJECTS_DATA, PROJECT_STATUS_COLORS, type PlatformProject } from "@/data/projects-data";
import { WaterMap } from "@/components/map/WaterMap";
import type { MapMarker, LayerKey, WaterMapHandle } from "@/components/map/types";
import { ALL_REGIONS } from "@/data/regions-data";
import { useSupabaseMarkers } from "@/hooks/useSupabaseMarkers";
import { getAllMapMarkers } from "@/data/map-markers";
// useWaterResources removed — map now uses supabaseMarkers directly
import { COMPLETED_PROJECTS, getCompletedProjectColor } from "@/data/completed-projects-data";
import { CheckCircle } from "lucide-react";
import {
  WATER_BODIES, findNearestWaterBody,
  WATER_QUALITY_COLORS, WATER_QUALITY_LABELS,
  FRESHNESS_LABELS, FRESHNESS_COLORS,
  EXTRACTION_LABELS, EXTRACTION_COLORS,
  PURIFICATION_LABELS, PURIFICATION_COLORS,
  WATER_TYPE_ICONS, WATER_TYPE_COLORS,
  type WaterBody,
} from "@/data/water-bodies-data";
import { useWaterQualityData, getQualityColor, getExtractionDifficulty, EXTRACTION_DIFFICULTY_LABELS } from "@/hooks/useWaterQualityData";
import { useDroughtForecast, getDroughtColor, DROUGHT_SEVERITY_LABELS, DROUGHT_TREND_LABELS, DROUGHT_TREND_ICONS } from "@/hooks/useDroughtForecast";
import { localizedField } from "@/lib/i18n-utils";

// Water-related object types that get special highlight
const WATER_TYPES = new Set(["dam", "reservoir", "irrigation_canal", "pumping_station", "water_treatment_facility", "mountain_lake", "river", "lake_crisis"]);

// Years available for slider
const YEAR_MIN = 1960;
const YEAR_MAX = 2025;
const YEAR_MILESTONES: Record<number, string> = {
  1960: "Пик",
  1975: "Начало",
  1991: "Распад СССР",
  2000: "Кризис",
  2005: "Дамба Кок-Арал",
  2020: "Маловодье",
  2025: "Сейчас",
};

// Key events by year for the timeline tooltip
const YEAR_EVENTS: Record<number, { color: string; events: string[] }> = {
  1960: { color: "#34d399", events: ["Аральское море — 4-е по величине в мире (68,100 км²)", "Сырдарья: 400 м³/сек естественный сток"] },
  1975: { color: "#fbbf24", events: ["Советская ирригация хлопка", "Аральское море начинает сокращаться"] },
  1980: { color: "#fbbf24", events: ["Полное перенаправление Амударьи на хлопок", "Начало экологического кризиса"] },
  1991: { color: "#fb923c", events: ["Распад СССР — водные соглашения нарушены", "Независимость 5 республик"] },
  2000: { color: "#ff4d6d", events: ["Аральское море потеряло 80% площади", "Коллапс рыболовства, 6 видов из 32 выжили"] },
  2005: { color: "#f97316", events: ["Казахстан строит дамбу Кок-Арал", "Начало частичного восстановления Северного Арала"] },
  2022: { color: "#ff4d6d", events: ["Конфликт Кыргызстана из-за водохранилища", "Уголовные дела против 20+ граждан"] },
  2023: { color: "#ff4d6d", events: ["Прогноз: дефицит 7 млрд м³ к 2030г", "Скорость таяния ледников x4 выше среднего"] },
  2025: { color: "#a78bfa", events: ["ADB: $3.5 млрд программа ледниковой адаптации", "ВБ: $200 млн на ирригационную модернизацию", "1 млрд м³ направлено в Северное Аральское море"] },
};

type MarkerItem =
  | { kind: "object"; data: PlatformObject }
  | { kind: "subject"; data: PlatformSubject }
  | { kind: "project"; data: PlatformProject };

function getCoords(item: MarkerItem): { lat: number; lng: number } | null {
  const d = item.data;
  if ("coordinates" in d && d.coordinates) return d.coordinates;
  if ("coordinates_start" in d && (d as PlatformObject).coordinates_start) return (d as PlatformObject).coordinates_start!;
  return null;
}

function getColor(item: MarkerItem, year?: number): string {
  if (item.kind === "object") {
    if (year !== undefined) return getObjectColorForYear(item.data, year);
    return getObjectColor(item.data.type);
  }
  if (item.kind === "subject") return getSubjectColor(item.data.type);
  return PROJECT_STATUS_COLORS[(item.data as PlatformProject).status]?.color ?? "#94a3b8";
}

function fmt(n: number | undefined): string {
  if (!n) return "—";
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  return `$${n}`;
}

// ─── Year Slider Component ─────────────────────────────────────
function YearSlider({
  year, onYearChange, playing, onTogglePlay
}: {
  year: number;
  onYearChange: (y: number) => void;
  playing: boolean;
  onTogglePlay: () => void;
}) {
  const pct = ((year - YEAR_MIN) / (YEAR_MAX - YEAR_MIN)) * 100;
  const currentEvent = Object.entries(YEAR_EVENTS)
    .filter(([y]) => parseInt(y) <= year)
    .sort(([a], [b]) => parseInt(b) - parseInt(a))[0];

  const crisisColor = year < 1975 ? "#34d399"
    : year < 1990 ? "#fbbf24"
    : year < 2005 ? "#fb923c"
    : "#ff4d6d";

  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-[500] px-3 sm:px-4 py-2 sm:py-3"
      style={{
        background: "linear-gradient(to top, rgba(0,5,15,0.97), rgba(0,5,15,0.85))",
        borderTop: `1px solid ${crisisColor}25`,
        backdropFilter: "blur(16px)"
      }}
    >
      {/* Top row: year + play + events */}
      <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
        <button
          onClick={onTogglePlay}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 cursor-pointer transition-all"
          style={{ background: `${crisisColor}18`, border: `1px solid ${crisisColor}35`, color: crisisColor }}
        >
          {playing ? <Pause size={12} /> : <Play size={12} />}
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <Calendar size={11} style={{ color: crisisColor }} />
          <span className="font-black text-base sm:text-lg tabular-nums" style={{ color: crisisColor }}>{year}</span>
        </div>

        {/* Crisis level badge */}
        <div className="px-1.5 sm:px-2 py-0.5 rounded-lg text-[10px] sm:text-xs font-bold"
          style={{ background: `${crisisColor}15`, border: `1px solid ${crisisColor}30`, color: crisisColor }}>
          {year < 1975 ? "Норма" : year < 1990 ? "Тревога" : year < 2005 ? "Критично" : "Катастрофа"}
        </div>

        {/* Aral Sea shrinkage indicator */}
        <div className="hidden sm:flex items-center gap-1.5 ml-auto">
          <TrendingDown size={11} className="text-red-400" />
          <span className="text-white/40 text-xs">
            Аральское море:&nbsp;
            <span style={{ color: crisisColor }} className="font-bold">
              {year <= 1960 ? "68,100" : year <= 1975 ? "52,000" : year <= 1980 ? "44,000"
               : year <= 1990 ? "30,000" : year <= 2000 ? "13,000" : year <= 2010 ? "6,200"
               : year <= 2020 ? "3,800" : "3,500"} км²
            </span>
          </span>
        </div>
      </div>

      {/* Event ticker — hidden on mobile to save space */}
      {currentEvent && (
        <div className="hidden sm:flex items-start gap-2 mb-2 px-2.5 py-1.5 rounded-xl"
          style={{ background: "rgba(0,0,0,0.3)", border: `1px solid ${currentEvent[1].color}20` }}>
          <AlertTriangle size={11} style={{ color: currentEvent[1].color }} className="mt-0.5 shrink-0" />
          <p className="text-xs text-white/60 leading-snug line-clamp-1">{currentEvent[1].events[0]}</p>
        </div>
      )}

      {/* Slider track */}
      <div className="relative">
        {/* Milestone labels */}
        <div className="flex justify-between mb-1.5 relative">
          {Object.entries(YEAR_MILESTONES).map(([y, label]) => {
            const p = ((parseInt(y) - YEAR_MIN) / (YEAR_MAX - YEAR_MIN)) * 100;
            const isActive = parseInt(y) <= year;
            return (
              <div
                key={y}
                className="absolute text-[9px] font-medium cursor-pointer transition-colors hidden sm:block"
                style={{
                  left: `${p}%`,
                  transform: "translateX(-50%)",
                  color: isActive ? crisisColor : "rgba(255,255,255,0.25)",
                  top: 0,
                }}
                onClick={() => onYearChange(parseInt(y))}
              >
                {label}
              </div>
            );
          })}
        </div>

        <div className="mt-4 relative">
          {/* Track background gradient */}
          <div className="absolute inset-y-0 left-0 right-0 rounded-full h-1.5 top-1/2 -translate-y-1/2"
            style={{ background: "linear-gradient(to right, #34d399, #fbbf24 30%, #fb923c 60%, #ff4d6d 80%, #ff4d6d)" }} />

          {/* Progress fill overlay */}
          <div className="absolute inset-y-0 left-0 rounded-full h-1.5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ width: `${pct}%`, background: "rgba(0,0,0,0.5)" }} />

          <input
            type="range"
            min={YEAR_MIN}
            max={YEAR_MAX}
            step={1}
            value={year}
            onChange={e => onYearChange(parseInt(e.target.value))}
            className="relative w-full appearance-none bg-transparent cursor-pointer"
            style={{ height: "24px", zIndex: 1 }}
          />
        </div>

        {/* Year ticks */}
        <div className="flex justify-between mt-0.5 sm:mt-1">
          {[1960, 1970, 1980, 1990, 2000, 2010, 2020, 2025].map(y => (
            <span
              key={y}
              className="text-[9px] cursor-pointer transition-colors"
              style={{ color: y <= year ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.18)" }}
              onClick={() => onYearChange(y)}
            >{y}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Map Popup panel ──────────────────────────────────────────
function MapSidePanel({ item, year, onClose }: { item: MarkerItem; year: number; onClose: () => void }) {
  const [, setLocation] = useLocation();
  const color = getColor(item, year);
  const d = item.data;
  const budget = item.kind === "project"
    ? ((d as PlatformProject).budget ?? (d as PlatformProject).budget_total)
    : (d as PlatformObject).investment_potential;
  const navPath = `/hub/${item.kind}/${d.id}`;
  const isWater = item.kind === "object" && WATER_TYPES.has((d as PlatformObject).type);
  const isCompleted = d.id.startsWith('CP-');

  // Historical data for current year
  const yearData = item.kind === "object" ? getObjectValueForYear(d as PlatformObject, year) : null;

  return (
    <>
      {/* Mobile backdrop */}
      <div className="sm:hidden fixed inset-0 z-[490] bg-black/50" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed sm:absolute bottom-0 sm:bottom-auto left-0 sm:left-auto right-0 sm:right-4 sm:top-4 z-[500] sm:w-72 rounded-t-[24px] sm:rounded-[20px] overflow-y-auto max-h-[70vh] sm:max-h-[calc(100vh-6rem)]"
        style={{
          background: "linear-gradient(145deg,rgba(0,10,30,0.98),rgba(0,18,50,0.96))",
          border: `1px solid ${color}30`,
          boxShadow: `0 0 40px ${color}18, 0 -8px 40px rgba(0,0,0,0.6)`,
          backdropFilter: "blur(24px)",
        }}>
      {/* Mobile drag handle */}
      <div className="sm:hidden flex justify-center pt-3 pb-1">
        <div className="w-10 h-1 rounded-full bg-white/20" />
      </div>

      {/* Gradient image area at top */}
      <div
        className="relative w-full flex items-center justify-center"
        style={{
          aspectRatio: "16 / 10",
          background: `linear-gradient(135deg, ${color}18 0%, ${color}08 50%, rgba(0,14,40,0.95) 100%)`,
        }}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: `${color}15`, border: `1px solid ${color}25` }}
        >
          {item.kind === "object"
            ? <Building2 size={28} style={{ color, opacity: 0.7 }} />
            : item.kind === "subject"
            ? <Building size={28} style={{ color, opacity: 0.7 }} />
            : <FolderOpen size={28} style={{ color, opacity: 0.7 }} />}
        </div>
        {/* Close button overlaid on image */}
        <button onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer transition-colors text-white/60 hover:text-white z-10"
          style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}>
          <X size={14} />
        </button>
      </div>

      <div className="p-4">
        {/* Year context badge */}
        {yearData && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg mb-3"
            style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
            <Calendar size={10} style={{ color }} />
            <span className="text-xs font-bold" style={{ color }}>{year} год</span>
            {yearData.label && <span className="text-white/40 text-xs ml-1">— {yearData.label}</span>}
          </div>
        )}

        {/* Header */}
        <div className="flex items-start gap-2.5 mb-3 pr-8">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
            {item.kind === "object"
              ? <Building2 size={16} style={{ color }} />
              : item.kind === "subject"
              ? <Building size={16} style={{ color }} />
              : <FolderOpen size={16} style={{ color }} />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white font-bold text-sm leading-snug line-clamp-2">{localizedField(d as any, 'name')}</div>
            <div className="text-white/40 text-xs mt-0.5">{"type_label" in d ? (d as any).type_label : ""}</div>
          </div>
        </div>

        {/* Water resource badge */}
        {isWater && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl mb-3"
            style={{ background: "rgba(0,180,255,0.1)", border: "1px solid rgba(0,180,255,0.2)" }}>
            <Droplets size={12} className="text-blue-400" />
            <span className="text-blue-300 text-xs font-semibold">Водный ресурс</span>
          </div>
        )}

        {/* Historical year data */}
        {yearData && (
          <div className="mb-3 p-2.5 rounded-xl"
            style={{ background: "rgba(0,0,0,0.3)", border: `1px solid ${color}20` }}>
            {yearData.value !== undefined && (d as PlatformObject).historical_metric_label && (
              <div className="flex items-center justify-between mb-1">
                <span className="text-white/40 text-xs">{(d as PlatformObject).historical_metric_label}</span>
                <span className="font-black text-sm" style={{ color }}>{yearData.value.toLocaleString("ru")} {(d as PlatformObject).historical_metric_unit}</span>
              </div>
            )}
            {yearData.events && yearData.events.length > 0 && (
              <div className="space-y-0.5 mt-1.5 pt-1.5 border-t border-white/5">
                {yearData.events.slice(0, 2).map((ev, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <div className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ background: color }} />
                    <span className="text-white/50 text-xs leading-snug">{ev}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Description */}
        <p className="text-white/50 text-xs leading-relaxed mb-3 line-clamp-3">{d.description}</p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {budget && (
            <div className="p-2 rounded-xl" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="text-white/30 text-xs mb-0.5">Бюджет</div>
              <div className="font-bold text-sm" style={{ color }}>{fmt(budget)}</div>
            </div>
          )}
          {item.kind === "project" && (item.data as PlatformProject).expected_irr != null && (
            <div className="p-2 rounded-xl" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="text-white/30 text-xs mb-0.5">IRR</div>
              <div className="font-bold text-sm text-emerald-400">{String((item.data as PlatformProject).expected_irr)}%</div>
            </div>
          )}
          {item.kind === "object" && (item.data as PlatformObject).efficiency != null && (
            <div className="p-2 rounded-xl" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="text-white/30 text-xs mb-0.5">КПД</div>
              <div className="font-bold text-sm text-cyan-400">{String((item.data as PlatformObject).efficiency)}%</div>
            </div>
          )}
        </div>

        {/* CTA — hide for completed projects that have no detail page */}
        {!isCompleted ? (
          <button
            onClick={() => { setLocation(navPath); onClose(); }}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold cursor-pointer transition-all hover:opacity-90"
            style={{ background: `linear-gradient(135deg,${color}20,${color}10)`, border: `1px solid ${color}35`, color }}>
            Подробнее <ArrowRight size={14} />
          </button>
        ) : (
          <div className="text-center py-1.5">
            <span className="text-white/30 text-xs">✅ Проект завершён</span>
          </div>
        )}
      </div>
    </motion.div>
    </>
  );
}

// ─── Layer toggle ─────────────────────────────────────────────
function LayerBtn({ label, color, active, count, icon, onClick }: {
  label: string; color: string; active: boolean; count?: number; icon?: React.ReactNode; onClick: () => void;
}) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer shrink-0"
      style={active
        ? { background: `${color}20`, color, border: `1px solid ${color}35` }
        : { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.08)" }}>
      {icon}
      {label}
      {count !== undefined && (
        <span className="px-1.5 rounded-full" style={{ background: active ? `${color}25` : "rgba(255,255,255,0.08)", fontSize: 10 }}>{count}</span>
      )}
    </button>
  );
}

// ─── Main ─────────────────────────────────────────────────────
export default function WorldMapPage() {
  const { i18n } = useTranslation();
  const [, setLocation] = useLocation();
  const [selectedItem, setSelectedItem] = useState<MarkerItem | null>(null);
  const [showObjects, setShowObjects] = useState(true);
  const [showSubjects, setShowSubjects] = useState(true);
  const [showProjects, setShowProjects] = useState(true);
  const [showCompleted, setShowCompleted] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [geoLayers, setGeoLayers] = useState<LayerKey[]>(['rivers', 'lakes', 'glaciers', 'borders', 'cities']);
  const { markers: supabaseMarkers, loading: sbLoading } = useSupabaseMarkers();
  const [mapBounds, setMapBounds] = useState<[number, number, number, number] | null>(null);
  const [year, setYear] = useState(YEAR_MAX);
  const [playing, setPlaying] = useState(false);
  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Region selector ──
  const [selectedRegion, setSelectedRegion] = useState('central-asia');
  const [regionDropdownOpen, setRegionDropdownOpen] = useState(false);
  const waterMapRef = useRef<WaterMapHandle | null>(null);
  const regionDropdownRef = useRef<HTMLDivElement | null>(null);

  const handleRegionChange = useCallback((regionId: string) => {
    setSelectedRegion(regionId);
    setRegionDropdownOpen(false);
    const region = ALL_REGIONS.find(r => r.id === regionId);
    if (region && waterMapRef.current) {
      waterMapRef.current.flyTo(region.center, region.zoom);
    }
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (regionDropdownRef.current && !regionDropdownRef.current.contains(e.target as Node)) {
        setRegionDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Water body detail panel ──
  const [selectedWaterBody, setSelectedWaterBody] = useState<WaterBody | null>(null);
  const droughtLoadedRef = useRef(false);
  const waterQualityLoadedRef = useRef(false);

  // ── New API hooks ──
  const { points: waterQualityPoints } = useWaterQualityData();
  const { regions: droughtRegions } = useDroughtForecast();

  // ── Below-map list state ──
  const [listSearch, setListSearch] = useState("");
  const [listTypeFilter, setListTypeFilter] = useState<"all" | "object" | "subject" | "project">("all");
  const [listCountryFilter, setListCountryFilter] = useState("all");
  const [listPage, setListPage] = useState(1);
  const LIST_PAGE_SIZE = 18;

  // Playback
  useEffect(() => {
    if (playing) {
      playIntervalRef.current = setInterval(() => {
        setYear(prev => {
          if (prev >= YEAR_MAX) { setPlaying(false); return YEAR_MAX; }
          return prev + 1;
        });
      }, 120);
    } else {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    }
    return () => { if (playIntervalRef.current) clearInterval(playIntervalRef.current); };
  }, [playing]);

  const handleTogglePlay = useCallback(() => {
    if (year >= YEAR_MAX) setYear(YEAR_MIN);
    setPlaying(p => !p);
  }, [year]);

  const toggleGeoLayer = useCallback((key: LayerKey) => {
    setGeoLayers(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  }, []);

  // ── Drought forecast: render from useDroughtForecast hook data ──
  useEffect(() => {
    if (!geoLayers.includes('drought') || droughtLoadedRef.current) return;
    droughtLoadedRef.current = true;

    function makeCircle(lat: number, lng: number, r: number, steps = 24) {
      const coords: number[][] = [];
      for (let i = 0; i <= steps; i++) {
        const angle = (i / steps) * 2 * Math.PI;
        coords.push([lng + r * Math.cos(angle), lat + r * 0.7 * Math.sin(angle)]);
      }
      return coords;
    }

    const features = droughtRegions.map(region => ({
      type: 'Feature' as const,
      properties: {
        name: localizedField(region as any, 'name'),
        severity: DROUGHT_SEVERITY_LABELS[region.severity],
        color: getDroughtColor(region.severity),
        trend: `${DROUGHT_TREND_ICONS[region.trend]} ${DROUGHT_TREND_LABELS[region.trend]}`,
        precipDeficit: region.precipDeficit,
        soilMoisture: region.soilMoisture,
        description: region.description,
      },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [makeCircle(region.lat, region.lng, region.radius)],
      },
    }));

    const geojson = { type: 'FeatureCollection', features };
    waterMapRef.current?.updateSource('drought', geojson);
  }, [geoLayers, droughtRegions]);

  // ── Water quality overlay: generate from useWaterQualityData hook ──
  useEffect(() => {
    if (!geoLayers.includes('water_quality') || waterQualityLoadedRef.current) return;
    waterQualityLoadedRef.current = true;

    // Combine WATER_BODIES data with the new water quality data points
    const waterBodyFeatures = WATER_BODIES.map(wb => {
      const qualityColorMap: Record<string, string> = {
        excellent: '#22d3ee', good: '#06b6d4', moderate: '#eab308',
        poor: '#f97316', critical: '#ef4444',
      };
      return {
        type: 'Feature' as const,
        properties: {
          name: localizedField(wb as any, 'name'),
          quality: wb.water_quality,
          color: qualityColorMap[wb.water_quality] ?? '#94a3b8',
          salinity: wb.characteristics.salinity_ppt ? Math.round(wb.characteristics.salinity_ppt * 1000) : undefined,
          source: 'water_body',
        },
        geometry: {
          type: 'Point' as const,
          coordinates: [wb.coordinates.lng, wb.coordinates.lat],
        },
      };
    });

    // Add water quality points from the hook — salinity-based coloring
    const qualityPointFeatures = waterQualityPoints.map(pt => {
      const difficulty = getExtractionDifficulty(pt);
      return {
        type: 'Feature' as const,
        properties: {
          name: pt.region_name,
          color: getQualityColor(pt.salinity_ppm),
          salinity: pt.salinity_ppm,
          hardness: pt.hardness_mg_l,
          ph: pt.ph,
          turbidity: pt.turbidity_ntu,
          arsenic: pt.arsenic_ppb,
          fluoride: pt.fluoride_ppm,
          difficulty: EXTRACTION_DIFFICULTY_LABELS[difficulty],
          source: 'quality_point',
        },
        geometry: {
          type: 'Point' as const,
          coordinates: [pt.lng, pt.lat],
        },
      };
    });

    const geojson = { type: 'FeatureCollection', features: [...waterBodyFeatures, ...qualityPointFeatures] };
    waterMapRef.current?.updateSource('water_quality', geojson);
  }, [geoLayers, waterQualityPoints]);

  const allItems: MarkerItem[] = [
    ...(showObjects ? OBJECTS_DATA.map(d => ({ kind: "object" as const, data: d })) : []),
    ...(showSubjects ? SUBJECTS_DATA.filter(s => s.coordinates).map(d => ({ kind: "subject" as const, data: d })) : []),
    ...(showProjects ? PROJECTS_DATA.filter(p => p.coordinates).map(d => ({ kind: "project" as const, data: d })) : []),
  ];

  // Build MapMarker[] — hardcoded data (highlighted with neon pulse) + Supabase data
  const hardcodedMarkers: MapMarker[] = allItems
    .map(item => {
      const coords = getCoords(item);
      if (!coords) return null;
      const d = item.data as any;
      return {
        id: d.id,
        type: item.kind as MapMarker['type'],
        lat: coords.lat,
        lng: coords.lng,
        title: localizedField(d, 'name') || d.id,
        description: d.description,
        source: 'hardcoded' as const,
        isHighlighted: true,
        objectType: item.kind === 'object' ? d.type : undefined,
      } as MapMarker;
    })
    .filter((m): m is MapMarker => m !== null);

  // Completed projects markers (green)
  const completedMarkers: MapMarker[] = showCompleted
    ? COMPLETED_PROJECTS.map(cp => ({
        id: cp.id,
        type: 'project' as MapMarker['type'],
        lat: cp.coordinates.lat,
        lng: cp.coordinates.lng,
        title: localizedField(cp as any, 'name'),
        description: cp.description,
        source: 'hardcoded' as const,
        isHighlighted: false,
        isCompleted: true,
      } as MapMarker))
    : [];

  // Water body markers (clickable on map for detail panel)
  const waterBodyMarkers: MapMarker[] = WATER_BODIES.map(wb => ({
    id: `wb-${wb.id}`,
    type: 'object' as MapMarker['type'],
    lat: wb.coordinates.lat,
    lng: wb.coordinates.lng,
    title: localizedField(wb as any, 'name'),
    description: wb.description,
    source: 'hardcoded' as const,
    isHighlighted: true,
    objectType: wb.type,
  }));

  // All markers combined — local aggregator (getAllMapMarkers) guarantees
  // every object/subject/project renders, then toggle-gated hardcoded markers
  // (with neon highlight/objectType), completed + water-body overlays, and
  // Supabase rows are merged in. Deduped by `${type}:${id}` via a Set so the
  // same entity never appears twice. NB: `Map` here is a lucide icon import —
  // dedup intentionally uses a Set, never `new Map()`.
  const mapMarkers: MapMarker[] = useMemo(() => {
    const seen = new Set<string>();
    const out: MapMarker[] = [];
    const push = (m: MapMarker) => {
      const key = `${m.type}:${m.id}`;
      if (seen.has(key)) return;
      seen.add(key);
      out.push(m);
    };
    // Order matters: richer hardcoded markers win over the plain aggregator
    // entries (first-seen wins), and both win over Supabase duplicates.
    hardcodedMarkers.forEach(push);
    completedMarkers.forEach(push);
    waterBodyMarkers.forEach(push);
    getAllMapMarkers().forEach(push);
    supabaseMarkers.forEach(push);
    return out;
  }, [hardcodedMarkers, completedMarkers, waterBodyMarkers, supabaseMarkers]);

  const handleMapMarkerClick = useCallback((m: MapMarker) => {
    // Check if this is a water body marker (wb- prefix)
    if (m.id.startsWith('wb-')) {
      const wbId = m.id.slice(3);
      const wb = WATER_BODIES.find(w => w.id === wbId);
      if (wb) {
        setSelectedWaterBody(prev => prev?.id === wb.id ? null : wb);
        setSelectedItem(null);
        return;
      }
    }

    // Check if this marker is near a water body
    const nearWb = findNearestWaterBody(m.lat, m.lng, 0.15);
    if (nearWb) {
      setSelectedWaterBody(prev => prev?.id === nearWb.id ? null : nearWb);
      setSelectedItem(null);
      return;
    }

    // Check if this is a completed project marker (CP- prefix)
    if (m.id.startsWith('CP-')) {
      const cp = COMPLETED_PROJECTS.find(p => p.id === m.id);
      if (cp) {
        // Convert CompletedProject → PlatformProject-like for the side panel
        const asProject: PlatformProject = {
          id: cp.id,
          name_ru: cp.name_ru,
          name_en: cp.name_en,
          description: cp.description,
          status: 'completed' as any,
          countries: [cp.country],
          coordinates: cp.coordinates,
          budget: cp.investment_usd,
          budget_total: cp.investment_usd,
          type_label: `Завершённый проект (${cp.year})`,
          tags: cp.technology,
        } as any;
        setSelectedWaterBody(null);
        setSelectedItem(prev =>
          prev && prev.data.id === cp.id ? null : { kind: 'project' as const, data: asProject }
        );
        return;
      }
    }

    // Find original item so the existing side panel can display rich data
    const item =
      OBJECTS_DATA.find(o => o.id === m.id) ? { kind: 'object' as const, data: OBJECTS_DATA.find(o => o.id === m.id)! } :
      SUBJECTS_DATA.find(s => s.id === m.id) ? { kind: 'subject' as const, data: SUBJECTS_DATA.find(s => s.id === m.id)! } :
      PROJECTS_DATA.find(p => p.id === m.id) ? { kind: 'project' as const, data: PROJECTS_DATA.find(p => p.id === m.id)! } :
      null;
    if (item) {
      setSelectedWaterBody(null);
      setSelectedItem(prev =>
        prev && prev.kind === item.kind && prev.data.id === item.data.id ? null : item
      );
    }
    // For Supabase markers without hardcoded data, the popup handles navigation
  }, []);

  useEffect(() => { setMapReady(true); }, []);

  // CSS injection (river flow animation is injected separately inside the map init useEffect)
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes vodMapPulse {
        0%, 100% { opacity: 0.25; transform: scale(1.8); }
        50% { opacity: 0.05; transform: scale(2.8); }
      }
      .vodeco-tooltip {
        background: rgba(0,8,24,0.92) !important;
        border: 1px solid rgba(0,200,230,0.25) !important;
        border-radius: 8px !important;
        color: #00e6c8 !important;
        font-size: 11px !important;
        font-weight: bold !important;
        box-shadow: 0 4px 20px rgba(0,0,0,0.6) !important;
        backdrop-filter: blur(8px) !important;
      }
      .vodeco-tooltip::before { display: none !important; }
      .maplibregl-popup-content {
        background: rgba(0,8,24,0.95) !important;
        border: 1px solid rgba(0,200,230,0.2) !important;
        border-radius: 12px !important;
        box-shadow: 0 8px 32px rgba(0,0,0,0.6), 0 0 20px rgba(0,200,230,0.08) !important;
        padding: 12px !important;
        backdrop-filter: blur(16px) !important;
      }
      .maplibregl-popup-close-button {
        color: rgba(255,255,255,0.4) !important;
        font-size: 18px !important;
        padding: 4px 8px !important;
        right: 2px !important;
        top: 2px !important;
      }
      .maplibregl-popup-close-button:hover {
        color: rgba(255,255,255,0.8) !important;
        background: rgba(255,255,255,0.1) !important;
        border-radius: 6px !important;
      }
      .maplibregl-popup-tip {
        border-top-color: rgba(0,8,24,0.95) !important;
        border-bottom-color: rgba(0,8,24,0.95) !important;
      }
      input[type=range]::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 18px; height: 18px;
        border-radius: 50%;
        background: #00e6c8;
        border: 2px solid #001424;
        box-shadow: 0 0 8px #00e6c888;
        cursor: pointer;
      }
      input[type=range]::-webkit-slider-runnable-track {
        height: 6px; border-radius: 3px; background: transparent;
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  // Viewport-aware counts: count only markers visible in current map bounds
  const isInBounds = useCallback((lat: number, lng: number) => {
    if (!mapBounds) return true;
    const [west, south, east, north] = mapBounds;
    return lng >= west && lng <= east && lat >= south && lat <= north;
  }, [mapBounds]);

  const visibleMarkers = mapMarkers.filter(m => isInBounds(m.lat, m.lng));
  const objectCount = visibleMarkers.filter(m => m.type === 'object').length;
  const subjectCount = visibleMarkers.filter(m => m.type === 'subject').length;
  const projectCount = visibleMarkers.filter(m => m.type === 'project' && !(m as any).isCompleted).length;
  const completedCount = visibleMarkers.filter(m => (m as any).isCompleted).length;

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden" style={{ background: "#000c20" }}>

      {/* ─── Header ─── */}
      <div className="relative z-[600] flex items-center gap-3 px-4 py-3 border-b flex-shrink-0"
        style={{ borderColor: "rgba(0,200,230,0.1)", background: "rgba(0,8,24,0.96)", backdropFilter: "blur(20px)" }}>
        <button onClick={() => setLocation("/whitepaper")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white/50 hover:text-white text-xs transition-colors cursor-pointer"
          style={{ background: "rgba(0,20,50,0.7)", border: "1px solid rgba(0,200,230,0.14)" }}>
          <ChevronLeft size={14} />Назад
        </button>

        <div className="w-7 h-7 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(0,230,200,0.1)", border: "1px solid rgba(0,230,200,0.2)" }}>
          <Globe size={14} style={{ color: "#00e6c8" }} />
        </div>
        <div className="hidden sm:block">
          <h1 className="text-white font-black text-sm">Глобальная карта водных ресурсов</h1>
          <p className="text-white/30 text-xs">VODecology — водные ресурсы и инфраструктура мира</p>
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          {/* Region selector */}
          <div ref={regionDropdownRef} className="relative">
            <button
              onClick={() => setRegionDropdownOpen(v => !v)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-all"
              style={{ background: "rgba(0,230,200,0.05)", color: "#00e6c8", border: "1px solid rgba(0,230,200,0.15)" }}>
              <Globe size={12} />
              <span className="hidden sm:inline">{ALL_REGIONS.find(r => r.id === selectedRegion)?.name_ru ?? 'Регион'}</span>
              <ChevronDown size={12} className={`transition-transform ${regionDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {regionDropdownOpen && (
              <div className="absolute top-full right-0 mt-1 w-56 rounded-xl overflow-hidden z-[700]"
                style={{ background: "rgba(0,8,24,0.97)", border: "1px solid rgba(0,200,230,0.15)", backdropFilter: "blur(20px)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
                {ALL_REGIONS.map(region => (
                  <button
                    key={region.id}
                    onClick={() => handleRegionChange(region.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-left text-xs transition-colors ${selectedRegion === region.id ? 'text-cyan-400 bg-white/5' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                  >
                    <span>{region.emoji}</span>
                    <span className="flex-1">{region.name_ru}</span>
                    {selectedRegion === region.id && <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={() => setLocation("/hub")}
            className="px-2.5 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-all hidden sm:block"
            style={{ background: "rgba(0,230,200,0.05)", color: "#00e6c8", border: "1px solid rgba(0,230,200,0.15)" }}>
            Проект Хаб
          </button>
        </div>
      </div>

      {/* ─── Layer toggles ─── */}
      <div className="relative z-[590] flex items-center gap-2 px-4 py-2 border-b overflow-x-auto flex-shrink-0 flex-wrap"
        style={{ borderColor: "rgba(0,200,230,0.06)", background: "rgba(0,5,18,0.85)" }}>
        <Layers size={11} className="text-white/25 shrink-0" />
        <LayerBtn label="Объекты" color="#00e6c8" active={showObjects} count={objectCount} onClick={() => setShowObjects(v => !v)} />
        <LayerBtn label="Субъекты" color="#fbbf24" active={showSubjects} count={subjectCount} onClick={() => setShowSubjects(v => !v)} />
        <LayerBtn label="Проекты" color="#60a5fa" active={showProjects} count={projectCount} onClick={() => setShowProjects(v => !v)} />
        <LayerBtn label="Реализованные" color="#22c55e" active={showCompleted} count={completedCount} icon={<CheckCircle size={11} />} onClick={() => setShowCompleted(v => !v)} />
        <div className="ml-auto text-white/20 text-xs shrink-0 hidden sm:block">
          {sbLoading ? <span className="animate-pulse">загрузка...</span> : `${visibleMarkers.length} / ${mapMarkers.length} в зоне`}
        </div>
      </div>

      {/* ─── Geo layer toggles ─── */}
      <div className="relative z-[589] flex items-center gap-2 px-4 py-2 border-b overflow-x-auto flex-shrink-0"
        style={{ borderColor: "rgba(0,200,230,0.06)", background: "rgba(0,5,18,0.75)" }}>
        <span className="text-white/25 text-[11px] font-medium shrink-0">Слои:</span>
        <LayerBtn label="Реки" color="#22d3ee" active={geoLayers.includes('rivers')} icon={<Waves size={11} />} onClick={() => toggleGeoLayer('rivers')} />
        <LayerBtn label="Озёра" color="#3b82f6" active={geoLayers.includes('lakes')} icon={<Droplets size={11} />} onClick={() => toggleGeoLayer('lakes')} />
        <LayerBtn label="Ледники" color="#e2e8f0" active={geoLayers.includes('glaciers')} icon={<Mountain size={11} />} onClick={() => toggleGeoLayer('glaciers')} />
        <LayerBtn label="Подземные воды" color="#6366f1" active={geoLayers.includes('groundwater')} icon={<Layers size={11} />} onClick={() => toggleGeoLayer('groundwater')} />
        <LayerBtn label="Дефицит воды" color="#ef4444" active={geoLayers.includes('scarcity')} icon={<AlertTriangle size={11} />} onClick={() => toggleGeoLayer('scarcity')} />
        <LayerBtn label="Границы" color="#64748b" active={geoLayers.includes('borders')} icon={<Map size={11} />} onClick={() => toggleGeoLayer('borders')} />
        <LayerBtn label="Города" color="#fbbf24" active={geoLayers.includes('cities')} icon={<MapPin size={11} />} onClick={() => toggleGeoLayer('cities')} />
        <LayerBtn label="Прогноз засухи" color="#ef4444" active={geoLayers.includes('drought')} icon={<TrendingDown size={11} />} onClick={() => toggleGeoLayer('drought')} />
        <LayerBtn label="Качество воды" color="#06b6d4" active={geoLayers.includes('water_quality')} icon={<Droplets size={11} />} onClick={() => toggleGeoLayer('water_quality')} />
      </div>

      {/* ─── Map area ─── */}
      <div className="relative flex-shrink-0" style={{ height: "calc(100vh - 52px - 80px)" }}>
        <div className="absolute inset-0 z-0" style={{ bottom: "100px" }}>
          <WaterMap
            center={[10, 25]}
            zoom={1.4}
            layers={geoLayers}
            markers={mapMarkers}
            cluster={true}
            onMarkerClick={handleMapMarkerClick}
            onBoundsChange={setMapBounds}
            highlightGroups={['aral', 'samarkand-water', 'tashkent-metro', 'central-asia-rivers']}
            showPopups={true}
            height="100%"
            mapRef={waterMapRef}
          />
        </div>

        {!mapReady && (
          <div className="absolute inset-0 z-10 flex items-center justify-center" style={{ background: "#000c20" }}>
            <div className="text-center">
              <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-white/50 text-sm">Загрузка карты...</p>
            </div>
          </div>
        )}

        {/* Selected item side panel */}
        <AnimatePresence>
          {selectedItem && (
            <MapSidePanel
              key={`${selectedItem.kind}-${selectedItem.data.id}`}
              item={selectedItem}
              year={year}
              onClose={() => setSelectedItem(null)}
            />
          )}
        </AnimatePresence>

        {/* Water body detail panel */}
        <AnimatePresence>
          {selectedWaterBody && (
            <WaterBodyPanel
              key={selectedWaterBody.id}
              waterBody={selectedWaterBody}
              onClose={() => setSelectedWaterBody(null)}
            />
          )}
        </AnimatePresence>

      </div>

      {/* ═══════════════════════════════════════════
          ─── Below-map: full data list ───
      ═══════════════════════════════════════════ */}
      <BelowMapList
        listSearch={listSearch}
        setListSearch={v => { setListSearch(v); setListPage(1); }}
        listTypeFilter={listTypeFilter}
        setListTypeFilter={v => { setListTypeFilter(v); setListPage(1); }}
        listCountryFilter={listCountryFilter}
        setListCountryFilter={v => { setListCountryFilter(v); setListPage(1); }}
        listPage={listPage}
        setListPage={setListPage}
        pageSize={LIST_PAGE_SIZE}
        onSelect={(item) => {
          setSelectedItem(item);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ─── Water Body Detail Panel ─────────────────────────────
// ═══════════════════════════════════════════════════════════

function WaterBodyPanel({ waterBody: wb, onClose }: { waterBody: WaterBody; onClose: () => void }) {
  const color = WATER_TYPE_COLORS[wb.type];
  const qualityColor = WATER_QUALITY_COLORS[wb.water_quality];
  const qualityPct = wb.water_quality === 'excellent' ? 95 : wb.water_quality === 'good' ? 75 : wb.water_quality === 'moderate' ? 50 : wb.water_quality === 'poor' ? 25 : 10;

  return (
    <>
      {/* Mobile backdrop */}
      <div className="sm:hidden fixed inset-0 z-[490] bg-black/50" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 60 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed sm:absolute bottom-0 sm:bottom-auto left-0 sm:left-auto right-0 sm:right-4 sm:top-4 z-[500] sm:w-80 rounded-t-[24px] sm:rounded-[20px] overflow-y-auto max-h-[80vh] sm:max-h-[calc(100vh-6rem)]"
        style={{
          background: "linear-gradient(145deg,rgba(0,10,30,0.98),rgba(0,18,50,0.96))",
          border: `1px solid ${color}30`,
          boxShadow: `0 0 40px ${color}18, 0 -8px 40px rgba(0,0,0,0.6)`,
          backdropFilter: "blur(24px)",
        }}>
        {/* Mobile drag handle */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Gradient header */}
        <div
          className="relative w-full flex items-center justify-center"
          style={{
            aspectRatio: "16 / 8",
            background: `linear-gradient(135deg, ${color}20 0%, ${color}08 50%, rgba(0,14,40,0.95) 100%)`,
          }}
        >
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
            {wb.type === 'river' ? <Waves size={28} style={{ color, opacity: 0.8 }} /> :
             wb.type === 'glacier' ? <Mountain size={28} style={{ color, opacity: 0.8 }} /> :
             <Droplets size={28} style={{ color, opacity: 0.8 }} />}
          </div>
          <button onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer transition-colors text-white/60 hover:text-white z-10"
            style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}>
            <X size={14} />
          </button>
        </div>

        <div className="p-4">
          {/* Type badge */}
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold"
              style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>
              {WATER_TYPE_ICONS[wb.type]}
            </span>
            <span className="text-white/30 text-xs">{wb.name_en}</span>
          </div>

          {/* Name */}
          <h3 className="text-white font-black text-base leading-snug mb-1">{localizedField(wb as any, 'name')}</h3>
          <p className="text-white/45 text-xs leading-relaxed mb-3 line-clamp-3">{wb.description}</p>

          {/* Key characteristics */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {wb.characteristics.length_km != null && (
              <div className="p-2 rounded-xl" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="text-white/30 text-[10px] mb-0.5">Длина</div>
                <div className="font-bold text-sm" style={{ color }}>{wb.characteristics.length_km.toLocaleString('ru')} км</div>
              </div>
            )}
            {wb.characteristics.area_km2 != null && (
              <div className="p-2 rounded-xl" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="text-white/30 text-[10px] mb-0.5">Площадь</div>
                <div className="font-bold text-sm" style={{ color }}>{wb.characteristics.area_km2.toLocaleString('ru')} км&sup2;</div>
              </div>
            )}
            {wb.characteristics.volume_km3 != null && (
              <div className="p-2 rounded-xl" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="text-white/30 text-[10px] mb-0.5">Объём</div>
                <div className="font-bold text-sm" style={{ color }}>{wb.characteristics.volume_km3} км&sup3;</div>
              </div>
            )}
            {wb.characteristics.depth_m != null && (
              <div className="p-2 rounded-xl" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="text-white/30 text-[10px] mb-0.5">Глубина</div>
                <div className="font-bold text-sm" style={{ color }}>{wb.characteristics.depth_m} м</div>
              </div>
            )}
            {wb.characteristics.flow_rate_m3s != null && (
              <div className="p-2 rounded-xl" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="text-white/30 text-[10px] mb-0.5">Расход</div>
                <div className="font-bold text-sm" style={{ color }}>{wb.characteristics.flow_rate_m3s} м&sup3;/с</div>
              </div>
            )}
            {wb.characteristics.altitude_m != null && (
              <div className="p-2 rounded-xl" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="text-white/30 text-[10px] mb-0.5">Высота</div>
                <div className="font-bold text-sm" style={{ color }}>{wb.characteristics.altitude_m.toLocaleString('ru')} м</div>
              </div>
            )}
            {wb.characteristics.salinity_ppt != null && (
              <div className="p-2 rounded-xl" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="text-white/30 text-[10px] mb-0.5">Солёность</div>
                <div className="font-bold text-sm" style={{ color: FRESHNESS_COLORS[wb.freshness] }}>{wb.characteristics.salinity_ppt} ppt</div>
              </div>
            )}
            {wb.characteristics.glaciation_km2 != null && (
              <div className="p-2 rounded-xl" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="text-white/30 text-[10px] mb-0.5">Оледенение</div>
                <div className="font-bold text-sm" style={{ color }}>{wb.characteristics.glaciation_km2} км&sup2;</div>
              </div>
            )}
          </div>

          {/* Water quality meter */}
          <div className="mb-3 p-2.5 rounded-xl" style={{ background: "rgba(0,0,0,0.3)", border: `1px solid ${qualityColor}20` }}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-white/40 text-xs">Качество воды</span>
              <span className="text-xs font-bold" style={{ color: qualityColor }}>{WATER_QUALITY_LABELS[wb.water_quality]}</span>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
              <div className="h-full rounded-full transition-all" style={{
                width: `${qualityPct}%`,
                background: `linear-gradient(90deg, ${qualityColor}, ${qualityColor}80)`,
              }} />
            </div>
          </div>

          {/* Assessment badges */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className="px-2 py-1 rounded-lg text-[10px] font-semibold"
              style={{ background: `${FRESHNESS_COLORS[wb.freshness]}15`, color: FRESHNESS_COLORS[wb.freshness], border: `1px solid ${FRESHNESS_COLORS[wb.freshness]}25` }}>
              {FRESHNESS_LABELS[wb.freshness]}
            </span>
            <span className="px-2 py-1 rounded-lg text-[10px] font-semibold"
              style={{ background: `${EXTRACTION_COLORS[wb.extraction_difficulty]}15`, color: EXTRACTION_COLORS[wb.extraction_difficulty], border: `1px solid ${EXTRACTION_COLORS[wb.extraction_difficulty]}25` }}>
              Добыча: {EXTRACTION_LABELS[wb.extraction_difficulty]}
            </span>
            <span className="px-2 py-1 rounded-lg text-[10px] font-semibold"
              style={{ background: `${PURIFICATION_COLORS[wb.purification_complexity]}15`, color: PURIFICATION_COLORS[wb.purification_complexity], border: `1px solid ${PURIFICATION_COLORS[wb.purification_complexity]}25` }}>
              Очистка: {PURIFICATION_LABELS[wb.purification_complexity]}
            </span>
          </div>

          {/* Status */}
          <div className="mb-3 p-2.5 rounded-xl" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="text-white/30 text-[10px] mb-1">Статус</div>
            <p className="text-white/60 text-xs leading-relaxed">{wb.status}</p>
          </div>

          {/* Threats */}
          {wb.threats.length > 0 && (
            <div className="mb-3">
              <div className="text-white/30 text-[10px] font-medium mb-1.5 flex items-center gap-1">
                <AlertTriangle size={10} className="text-red-400" /> Угрозы
              </div>
              <div className="space-y-1">
                {wb.threats.map((t, i) => (
                  <div key={i} className="flex items-start gap-1.5 px-2 py-1 rounded-lg"
                    style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.1)" }}>
                    <div className="w-1 h-1 rounded-full bg-red-400 mt-1.5 shrink-0" />
                    <span className="text-red-300/70 text-xs leading-snug">{t}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Usage */}
          {wb.usage.length > 0 && (
            <div className="mb-2">
              <div className="text-white/30 text-[10px] font-medium mb-1.5 flex items-center gap-1">
                <Zap size={10} className="text-cyan-400" /> Использование
              </div>
              <div className="flex flex-wrap gap-1">
                {wb.usage.map((u, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                    style={{ background: "rgba(0,230,200,0.08)", color: "#00e6c8", border: "1px solid rgba(0,230,200,0.15)" }}>
                    {u}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════
// ─── Below-Map List Component ─────────────────────────────
// ═══════════════════════════════════════════════════════════

const ALL_COUNTRIES = ["all", "Uzbekistan", "Kazakhstan", "Tajikistan", "Kyrgyzstan", "Turkmenistan", "Multi-country"];
const COUNTRY_LABELS: Record<string, string> = {
  all: "Все страны", Uzbekistan: "Узбекистан", Kazakhstan: "Казахстан",
  Tajikistan: "Таджикистан", Kyrgyzstan: "Кыргызстан", Turkmenistan: "Туркменистан", "Multi-country": "Мульти"
};

function BelowMapList({
  listSearch, setListSearch, listTypeFilter, setListTypeFilter,
  listCountryFilter, setListCountryFilter, listPage, setListPage, pageSize, onSelect
}: {
  listSearch: string; setListSearch: (v: string) => void;
  listTypeFilter: "all" | "object" | "subject" | "project"; setListTypeFilter: (v: "all" | "object" | "subject" | "project") => void;
  listCountryFilter: string; setListCountryFilter: (v: string) => void;
  listPage: number; setListPage: (v: number) => void;
  pageSize: number;
  onSelect: (item: MarkerItem) => void;
}) {
  const [, setLocation] = useLocation();

  const allEntries: MarkerItem[] = [
    ...OBJECTS_DATA.map(d => ({ kind: "object" as const, data: d })),
    ...SUBJECTS_DATA.map(d => ({ kind: "subject" as const, data: d })),
    ...PROJECTS_DATA.map(d => ({ kind: "project" as const, data: d })),
  ];

  const q = listSearch.toLowerCase();

  const filtered = allEntries.filter(item => {
    const d = item.data as any;
    if (listTypeFilter !== "all" && item.kind !== listTypeFilter) return false;
    if (listCountryFilter !== "all") {
      const c = d.country ?? "";
      const cs: string[] = d.countries ?? [];
      if (c !== listCountryFilter && !cs.includes(listCountryFilter)) return false;
    }
    if (q) {
      const haystack = `${d.name_ru ?? ""} ${d.name ?? ""} ${d.description ?? ""} ${d.type_label ?? ""}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const visible = filtered.slice((listPage - 1) * pageSize, listPage * pageSize);

  const typeTabConfig: { key: "all" | "object" | "subject" | "project"; label: string; color: string; count: number }[] = [
    { key: "all", label: "Все", color: "#94a3b8", count: filtered.length },
    { key: "object", label: "Объекты", color: "#00e6c8", count: allEntries.filter(i => i.kind === "object").length },
    { key: "subject", label: "Субъекты", color: "#fbbf24", count: allEntries.filter(i => i.kind === "subject").length },
    { key: "project", label: "Проекты", color: "#60a5fa", count: allEntries.filter(i => i.kind === "project").length },
  ];

  return (
    <div className="px-4 py-6" style={{ background: "linear-gradient(180deg,#000c20 0%,#000818 100%)" }}>
      {/* Section header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-white font-black text-xl flex items-center gap-2">
            <SlidersHorizontal size={18} style={{ color: "#00e6c8" }} />
            База данных
          </h2>
          <p className="text-white/35 text-sm mt-0.5">Все объекты, субъекты и проекты — поиск и фильтры</p>
        </div>
        <div className="text-white/25 text-xs">{filtered.length} записей</div>
      </div>

      {/* Search + filters bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
          <input
            type="text"
            placeholder="Поиск по названию, типу, описанию..."
            value={listSearch}
            onChange={e => setListSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-white/25 outline-none transition-all"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          />
          {listSearch && (
            <button
              onClick={() => setListSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 cursor-pointer"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Country filter */}
        <select
          value={listCountryFilter}
          onChange={e => setListCountryFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl text-sm text-white outline-none cursor-pointer"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", minWidth: "140px" }}
        >
          {ALL_COUNTRIES.map(c => (
            <option key={c} value={c} style={{ background: "#000c20" }}>{COUNTRY_LABELS[c]}</option>
          ))}
        </select>
      </div>

      {/* Type tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {typeTabConfig.map(tab => (
          <button
            key={tab.key}
            onClick={() => setListTypeFilter(tab.key)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all shrink-0"
            style={listTypeFilter === tab.key
              ? { background: `${tab.color}20`, color: tab.color, border: `1px solid ${tab.color}35` }
              : { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.08)" }
            }
          >
            {tab.label}
            <span className="px-1.5 py-0.5 rounded-full text-[10px]"
              style={{ background: listTypeFilter === tab.key ? `${tab.color}25` : "rgba(255,255,255,0.08)" }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Cards grid */}
      {visible.length === 0 ? (
        <div className="text-center py-16">
          <Search size={36} className="text-white/10 mx-auto mb-3" />
          <p className="text-white/30 text-sm">Ничего не найдено</p>
          <button onClick={() => { setListSearch(""); setListTypeFilter("all"); setListCountryFilter("all"); }}
            className="mt-3 px-4 py-2 rounded-xl text-xs cursor-pointer"
            style={{ background: "rgba(0,230,200,0.1)", color: "#00e6c8", border: "1px solid rgba(0,230,200,0.2)" }}>
            Сбросить фильтры
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {visible.map(item => (
            <ListCard key={`${item.kind}-${item.data.id}`} item={item}
              onMap={() => onSelect(item)}
              onDetail={() => setLocation(`/hub/${item.kind}/${item.data.id}`)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setListPage(Math.max(1, listPage - 1))}
            disabled={listPage === 1}
            className="px-3 py-1.5 rounded-xl text-xs cursor-pointer disabled:opacity-30 transition-all"
            style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}>
            ← Пред.
          </button>
          <div className="flex gap-1">
            {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
              const p = totalPages <= 7 ? i + 1
                : listPage <= 4 ? i + 1
                : listPage >= totalPages - 3 ? totalPages - 6 + i
                : listPage - 3 + i;
              return (
                <button key={p} onClick={() => setListPage(p)}
                  className="w-7 h-7 rounded-lg text-xs cursor-pointer transition-all"
                  style={listPage === p
                    ? { background: "#00e6c8", color: "#000c20", fontWeight: "bold" }
                    : { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)" }
                  }>
                  {p}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setListPage(Math.min(totalPages, listPage + 1))}
            disabled={listPage === totalPages}
            className="px-3 py-1.5 rounded-xl text-xs cursor-pointer disabled:opacity-30 transition-all"
            style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}>
            След. →
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Individual list card ─────────────────────────────────
function ListCard({ item, onMap, onDetail }: { item: MarkerItem; onMap: () => void; onDetail: () => void }) {
  const d = item.data as any;
  const color = getColor(item);
  const hasCoords = !!getCoords(item);

  const kindIcon = item.kind === "object"
    ? <Building2 size={15} style={{ color }} />
    : item.kind === "subject"
    ? <Building size={15} style={{ color }} />
    : <FolderOpen size={15} style={{ color }} />;

  const budget = item.kind === "project"
    ? (d.budget ?? d.budget_total)
    : d.investment_potential;

  const statusLabel = item.kind === "project"
    ? (PROJECT_STATUS_COLORS[d.status]?.label ?? d.status)
    : item.kind === "object"
    ? d.status_label ?? null
    : d.status_label ?? null;

  const statusColor = item.kind === "project"
    ? (PROJECT_STATUS_COLORS[d.status]?.color ?? "#94a3b8")
    : "#94a3b8";

  const country = d.country ?? (Array.isArray(d.countries) ? d.countries[0] : "");

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className="rounded-2xl overflow-hidden cursor-pointer group"
      style={{ background: "rgba(0,6,20,0.8)", border: `1px solid ${color}18`, transition: "border-color 0.2s" }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = `${color}40`)}
      onMouseLeave={e => (e.currentTarget.style.borderColor = `${color}18`)}
    >
      {/* Color accent top */}
      <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg,${color},${color}40)` }} />

      <div className="p-3.5">
        {/* Header row */}
        <div className="flex items-start gap-2.5 mb-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
            style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
            {kindIcon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-sm font-bold leading-snug line-clamp-2">{localizedField(d, 'name')}</div>
            <div className="text-white/35 text-xs mt-0.5 truncate">{d.type_label}</div>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {country && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
              style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <MapPin size={9} />{country === "Multi-country" ? "Регион" : country}
            </span>
          )}
          {statusLabel && (
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
              style={{ background: `${statusColor}15`, color: statusColor, border: `1px solid ${statusColor}25` }}>
              {statusLabel}
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-white/40 text-xs leading-relaxed line-clamp-2 mb-3">{d.description}</p>

        {/* Budget */}
        {budget ? (
          <div className="flex items-center gap-1.5 mb-3">
            <Zap size={11} style={{ color }} />
            <span className="text-xs font-bold" style={{ color }}>{fmt(budget)}</span>
          </div>
        ) : null}

        {/* Actions */}
        <div className="flex gap-2">
          {hasCoords && (
            <button
              onClick={e => { e.stopPropagation(); onMap(); }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs cursor-pointer transition-all hover:opacity-80"
              style={{ background: `${color}10`, color, border: `1px solid ${color}20` }}>
              <MapPin size={10} /> На карте
            </button>
          )}
          <button
            onClick={e => { e.stopPropagation(); onDetail(); }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs cursor-pointer transition-all hover:opacity-80 ml-auto"
            style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.1)" }}>
            Подробнее <ChevronRight size={10} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
