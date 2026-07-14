// ═══════════════════════════════════════════════════════════════
//  MapFilterPanel — Advanced filtering panel for the interactive map
//  Filters: Region, Country, Object Type, Status, Year Range,
//           Funding Range, Search, Object Complexes toggle
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from 'react';
import {
  Search, SlidersHorizontal, X, ChevronDown,
  Building2, Droplets, FlaskConical, Landmark,
  TrendingUp, Rocket, Building, Filter, RotateCcw
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────

export type MarkerObjectType =
  | 'dam'
  | 'reservoir'
  | 'treatment_plant'
  | 'canal'
  | 'organization'
  | 'company'
  | 'startup'
  | 'investment_project';

export type MarkerStatus = 'all' | 'operational' | 'active' | 'investment' | 'completed';

export type MapRegion =
  | 'all'
  | 'Asia'
  | 'Africa'
  | 'Europe'
  | 'Americas'
  | 'Oceania'
  | 'Middle East'
  | 'Central Asia';

export interface MapFilters {
  search: string;
  region: MapRegion;
  country: string;
  objectTypes: MarkerObjectType[];
  status: MarkerStatus;
  yearMin: number;
  yearMax: number;
  fundingMin: number;
  fundingMax: number;
  showComplexes: boolean;
}

export const DEFAULT_FILTERS: MapFilters = {
  search: '',
  region: 'all',
  country: 'all',
  objectTypes: ['dam', 'reservoir', 'treatment_plant', 'canal', 'organization', 'startup', 'investment_project'],
  status: 'all',
  yearMin: 1900,
  yearMax: 2025,
  fundingMin: 0,
  fundingMax: 100,
  showComplexes: false,
};

// ── Region → Countries mapping ────────────────────────────────

const REGION_COUNTRIES: Record<MapRegion, string[]> = {
  all: [],
  'Central Asia': ['Uzbekistan', 'Kazakhstan', 'Tajikistan', 'Kyrgyzstan', 'Turkmenistan'],
  Asia: ['China', 'India', 'Japan', 'South Korea', 'Pakistan', 'Bangladesh', 'Indonesia', 'Vietnam', 'Thailand', 'Philippines', 'Singapore', 'Malaysia'],
  Africa: ['Nigeria', 'Kenya', 'Ethiopia', 'Egypt', 'South Africa', 'Ghana', 'Tanzania', 'Uganda', 'Morocco', 'Cote d\'Ivoire'],
  Europe: ['Germany', 'France', 'United Kingdom', 'Netherlands', 'Belgium', 'Switzerland', 'Sweden', 'Norway', 'Finland', 'Poland', 'Spain', 'Italy'],
  Americas: ['United States', 'Canada', 'Brazil', 'Mexico', 'Argentina', 'Colombia', 'Chile', 'Peru'],
  Oceania: ['Australia', 'New Zealand', 'Papua New Guinea', 'Fiji'],
  'Middle East': ['Saudi Arabia', 'UAE', 'Iran', 'Iraq', 'Israel', 'Jordan', 'Turkey', 'Qatar', 'Kuwait', 'Oman'],
};

// ── Object type config ─────────────────────────────────────────

interface ObjectTypeConfig {
  key: MarkerObjectType;
  label: string;
  icon: React.ComponentType<{ size?: number | string; style?: React.CSSProperties; className?: string }>;
  color: string;
  emoji: string;
}

const OBJECT_TYPE_CONFIG: ObjectTypeConfig[] = [
  { key: 'dam', label: 'Dams', icon: Building2, color: '#3b82f6', emoji: '🏗️' },
  { key: 'reservoir', label: 'Reservoirs', icon: Droplets, color: '#06b6d4', emoji: '💧' },
  { key: 'treatment_plant', label: 'Treatment Plants', icon: FlaskConical, color: '#22c55e', emoji: '⚗️' },
  { key: 'canal', label: 'Canals', icon: Landmark, color: '#14b8a6', emoji: '🌊' },
  { key: 'organization', label: 'Organizations', icon: Building, color: '#f97316', emoji: '🏢' },
  { key: 'startup', label: 'Startups', icon: Rocket, color: '#a855f7', emoji: '🚀' },
  { key: 'investment_project', label: 'Investment Projects', icon: TrendingUp, color: '#eab308', emoji: '💰' },
];

const STATUS_OPTIONS: { value: MarkerStatus; label: string; color: string }[] = [
  { value: 'all', label: 'All', color: '#94a3b8' },
  { value: 'operational', label: 'Operational', color: '#22c55e' },
  { value: 'active', label: 'Active', color: '#3b82f6' },
  { value: 'investment', label: 'Investment', color: '#eab308' },
  { value: 'completed', label: 'Completed', color: '#8b5cf6' },
];

// ── Search Autocomplete ────────────────────────────────────────

interface SearchSuggestion {
  label: string;
  type: string;
}

const SAMPLE_SUGGESTIONS: SearchSuggestion[] = [
  { label: 'Toktogul Reservoir', type: 'reservoir' },
  { label: 'Rogun Dam', type: 'dam' },
  { label: 'Nurek Dam', type: 'dam' },
  { label: 'Veolia Water', type: 'organization' },
  { label: 'World Bank Water Division', type: 'organization' },
  { label: 'Amu Darya Canal', type: 'canal' },
  { label: 'Syr Darya Treatment Plant', type: 'treatment_plant' },
  { label: 'AquaTech Solutions', type: 'startup' },
  { label: 'Hydro Intelligence', type: 'startup' },
];

// ── Dual Range Slider ─────────────────────────────────────────

function DualRangeSlider({
  min,
  max,
  valueMin,
  valueMax,
  step = 1,
  formatLabel,
  onChange,
  color = '#22d3ee',
}: {
  min: number;
  max: number;
  valueMin: number;
  valueMax: number;
  step?: number;
  formatLabel: (v: number) => string;
  onChange: (min: number, max: number) => void;
  color?: string;
}) {
  const pctMin = ((valueMin - min) / (max - min)) * 100;
  const pctMax = ((valueMax - min) / (max - min)) * 100;

  return (
    <div className="relative pt-1">
      <div className="flex justify-between mb-2">
        <span className="text-xs font-semibold" style={{ color }}>{formatLabel(valueMin)}</span>
        <span className="text-xs font-semibold" style={{ color }}>{formatLabel(valueMax)}</span>
      </div>
      <div className="relative h-5">
        {/* Track */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-full h-1.5 rounded-full"
          style={{ background: 'rgba(255,255,255,0.1)' }}
        />
        {/* Active range */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-1.5 rounded-full"
          style={{
            left: `${pctMin}%`,
            width: `${pctMax - pctMin}%`,
            background: color,
          }}
        />
        {/* Min thumb */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={valueMin}
          onChange={e => {
            const v = Number(e.target.value);
            if (v <= valueMax) onChange(v, valueMax);
          }}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
          style={{ zIndex: valueMin > max - (max - min) * 0.1 ? 5 : 3 }}
        />
        {/* Max thumb */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={valueMax}
          onChange={e => {
            const v = Number(e.target.value);
            if (v >= valueMin) onChange(valueMin, v);
          }}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
          style={{ zIndex: 4 }}
        />
        {/* Visual thumbs */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white pointer-events-none"
          style={{ left: `calc(${pctMin}% - 8px)`, background: color }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white pointer-events-none"
          style={{ left: `calc(${pctMax}% - 8px)`, background: color }}
        />
      </div>
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-xs font-bold tracking-widest uppercase text-white/40 hover:text-white/60 transition-colors cursor-pointer"
      >
        {title}
        <ChevronDown
          size={13}
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
        />
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────

interface MapFilterPanelProps {
  filters: MapFilters;
  onChange: (filters: MapFilters) => void;
  onClose?: () => void;
  className?: string;
  totalCount?: number;
  filteredCount?: number;
}

export function MapFilterPanel({
  filters,
  onChange,
  onClose,
  className = '',
  totalCount,
  filteredCount,
}: MapFilterPanelProps) {
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const update = useCallback(
    (patch: Partial<MapFilters>) => onChange({ ...filters, ...patch }),
    [filters, onChange],
  );

  const reset = useCallback(() => onChange({ ...DEFAULT_FILTERS }), [onChange]);

  // Autocomplete
  useEffect(() => {
    if (filters.search.length < 2) {
      setSearchSuggestions([]);
      return;
    }
    const q = filters.search.toLowerCase();
    setSearchSuggestions(
      SAMPLE_SUGGESTIONS.filter(s => s.label.toLowerCase().includes(q)).slice(0, 5),
    );
  }, [filters.search]);

  const countriesForRegion =
    filters.region === 'all'
      ? Object.values(REGION_COUNTRIES).flat().sort()
      : REGION_COUNTRIES[filters.region];

  const isModified =
    filters.search !== DEFAULT_FILTERS.search ||
    filters.region !== DEFAULT_FILTERS.region ||
    filters.country !== DEFAULT_FILTERS.country ||
    filters.status !== DEFAULT_FILTERS.status ||
    filters.objectTypes.length !== DEFAULT_FILTERS.objectTypes.length ||
    filters.yearMin !== DEFAULT_FILTERS.yearMin ||
    filters.yearMax !== DEFAULT_FILTERS.yearMax ||
    filters.fundingMin !== DEFAULT_FILTERS.fundingMin ||
    filters.fundingMax !== DEFAULT_FILTERS.fundingMax;

  return (
    <div
      className={`flex flex-col overflow-hidden ${className}`}
      style={{
        background: 'linear-gradient(180deg, rgba(0,8,24,0.98) 0%, rgba(0,12,32,0.97) 100%)',
        border: '1px solid rgba(34,211,238,0.15)',
        borderRadius: '16px',
        boxShadow: '0 24px 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)',
        backdropFilter: 'blur(24px)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b shrink-0"
        style={{ borderColor: 'rgba(34,211,238,0.12)' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.2)' }}
          >
            <Filter size={13} style={{ color: '#22d3ee' }} />
          </div>
          <span className="text-white font-bold text-sm">Filters</span>
          {isModified && (
            <button
              onClick={reset}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs cursor-pointer transition-all"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              <RotateCcw size={9} />
              Reset
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {totalCount !== undefined && (
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
              <span style={{ color: '#22d3ee', fontWeight: 700 }}>{filteredCount ?? totalCount}</span>
              {' '}/ {totalCount}
            </span>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="w-6 h-6 rounded-lg flex items-center justify-center cursor-pointer transition-all text-white/40 hover:text-white"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable filters */}
      <div className="overflow-y-auto flex-1 custom-scrollbar">
        {/* Search */}
        <FilterSection title="Search">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgba(255,255,255,0.3)' }} />
            <input
              type="text"
              placeholder="Search objects, organizations..."
              value={filters.search}
              onChange={e => update({ search: e.target.value })}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-white/25 outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            />
            {filters.search && (
              <button
                onClick={() => update({ search: '' })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 cursor-pointer"
              >
                <X size={12} />
              </button>
            )}
            {/* Autocomplete dropdown */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div
                className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-50"
                style={{
                  background: 'rgba(0,8,24,0.98)',
                  border: '1px solid rgba(34,211,238,0.2)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                }}
              >
                {searchSuggestions.map(s => (
                  <button
                    key={s.label}
                    onMouseDown={() => update({ search: s.label })}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors cursor-pointer text-left"
                  >
                    <Search size={11} style={{ color: '#22d3ee' }} />
                    <span>{s.label}</span>
                    <span className="ml-auto text-xs text-white/25">{s.type}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </FilterSection>

        {/* Region */}
        <FilterSection title="Region">
          <div className="relative">
            <select
              value={filters.region}
              onChange={e => update({ region: e.target.value as MapRegion, country: 'all' })}
              className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none cursor-pointer appearance-none"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <option value="all" style={{ background: '#000c20' }}>All Regions</option>
              <option value="Central Asia" style={{ background: '#000c20' }}>Central Asia</option>
              <option value="Asia" style={{ background: '#000c20' }}>Asia</option>
              <option value="Africa" style={{ background: '#000c20' }}>Africa</option>
              <option value="Europe" style={{ background: '#000c20' }}>Europe</option>
              <option value="Americas" style={{ background: '#000c20' }}>Americas</option>
              <option value="Oceania" style={{ background: '#000c20' }}>Oceania</option>
              <option value="Middle East" style={{ background: '#000c20' }}>Middle East</option>
            </select>
            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgba(255,255,255,0.4)' }} />
          </div>
        </FilterSection>

        {/* Country */}
        <FilterSection title="Country">
          <div className="relative">
            <select
              value={filters.country}
              onChange={e => update({ country: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none cursor-pointer appearance-none"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <option value="all" style={{ background: '#000c20' }}>All Countries</option>
              {countriesForRegion.map(c => (
                <option key={c} value={c} style={{ background: '#000c20' }}>{c}</option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgba(255,255,255,0.4)' }} />
          </div>
        </FilterSection>

        {/* Object Types */}
        <FilterSection title="Object Types">
          <div className="space-y-1.5">
            {/* Select all / none */}
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => update({ objectTypes: OBJECT_TYPE_CONFIG.map(c => c.key) })}
                className="flex-1 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all"
                style={{ background: 'rgba(34,211,238,0.1)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.2)' }}
              >
                All
              </button>
              <button
                onClick={() => update({ objectTypes: [] })}
                className="flex-1 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all"
                style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                None
              </button>
            </div>
            {OBJECT_TYPE_CONFIG.map(cfg => {
              const Icon = cfg.icon;
              const isOn = filters.objectTypes.includes(cfg.key);
              return (
                <button
                  key={cfg.key}
                  onClick={() => {
                    const next = isOn
                      ? filters.objectTypes.filter(t => t !== cfg.key)
                      : [...filters.objectTypes, cfg.key];
                    update({ objectTypes: next });
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm cursor-pointer transition-all"
                  style={
                    isOn
                      ? { background: `${cfg.color}15`, border: `1px solid ${cfg.color}35`, color: cfg.color }
                      : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.35)' }
                  }
                >
                  <span className="text-base">{cfg.emoji}</span>
                  <Icon size={13} />
                  <span className="text-xs font-medium">{cfg.label}</span>
                  <div
                    className="ml-auto w-4 h-4 rounded-full border-2 flex items-center justify-center"
                    style={isOn
                      ? { background: cfg.color, borderColor: cfg.color }
                      : { background: 'transparent', borderColor: 'rgba(255,255,255,0.2)' }
                    }
                  >
                    {isOn && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </button>
              );
            })}
          </div>
        </FilterSection>

        {/* Status */}
        <FilterSection title="Status">
          <div className="flex flex-wrap gap-1.5">
            {STATUS_OPTIONS.map(s => (
              <button
                key={s.value}
                onClick={() => update({ status: s.value })}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all"
                style={
                  filters.status === s.value
                    ? { background: `${s.color}20`, color: s.color, border: `1px solid ${s.color}40` }
                    : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.08)' }
                }
              >
                {s.label}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Year Range */}
        <FilterSection title="Year Range">
          <DualRangeSlider
            min={1900}
            max={2025}
            valueMin={filters.yearMin}
            valueMax={filters.yearMax}
            step={1}
            formatLabel={v => String(v)}
            onChange={(min, max) => update({ yearMin: min, yearMax: max })}
            color="#22d3ee"
          />
        </FilterSection>

        {/* Funding Range */}
        <FilterSection title="Funding Range">
          <DualRangeSlider
            min={0}
            max={100}
            valueMin={filters.fundingMin}
            valueMax={filters.fundingMax}
            step={1}
            formatLabel={v => v >= 100 ? '$100M+' : `$${v}M`}
            onChange={(min, max) => update({ fundingMin: min, fundingMax: max })}
            color="#eab308"
          />
        </FilterSection>

        {/* Object Complexes */}
        <FilterSection title="Object Complexes" defaultOpen={false}>
          <div
            className="flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all"
            style={{
              background: filters.showComplexes
                ? 'rgba(34,211,238,0.08)'
                : 'rgba(255,255,255,0.03)',
              border: filters.showComplexes
                ? '1px solid rgba(34,211,238,0.2)'
                : '1px solid rgba(255,255,255,0.07)',
            }}
            onClick={() => update({ showComplexes: !filters.showComplexes })}
          >
            <div
              className="w-10 h-5 rounded-full relative flex-shrink-0 transition-all mt-0.5"
              style={{
                background: filters.showComplexes ? '#22d3ee' : 'rgba(255,255,255,0.1)',
              }}
            >
              <div
                className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                style={{ left: filters.showComplexes ? '22px' : '2px' }}
              />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Object Complexes</div>
              <div className="text-xs text-white/40 mt-0.5 leading-relaxed">
                Show clustered groups of related infrastructure objects
              </div>
            </div>
          </div>
        </FilterSection>
      </div>

      {/* Footer */}
      <div
        className="shrink-0 px-4 py-3 border-t"
        style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.2)' }}
      >
        <div className="flex items-center justify-between text-xs text-white/25">
          <span>
            <SlidersHorizontal size={10} className="inline mr-1" />
            {filters.objectTypes.length} of {OBJECT_TYPE_CONFIG.length} types active
          </span>
          {isModified && (
            <button onClick={reset} className="text-red-400 hover:text-red-300 cursor-pointer transition-colors">
              Reset all
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
