// ═══════════════════════════════════════════════════════════════
//  RegionSelector — Visual world region picker with stats
//  Shows clickable region cards with object count, total funding,
//  countries covered, and quick navigation.
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react';
import { Globe, MapPin, DollarSign, Flag, ChevronRight } from 'lucide-react';
import type { MapRegion } from './MapFilterPanel';

// ── Types ─────────────────────────────────────────────────────

export interface RegionStats {
  objectCount: number;
  totalFunding: number;
  countryCount: number;
}

export interface RegionSelectorProps {
  selected: MapRegion;
  onSelect: (region: MapRegion) => void;
  stats?: Partial<Record<MapRegion, RegionStats>>;
  className?: string;
}

// ── Region configuration ──────────────────────────────────────

interface RegionConfig {
  id: MapRegion;
  label: string;
  emoji: string;
  color: string;
  bgGradient: string;
  defaultStats: RegionStats;
  description: string;
  // SVG path for rough world-map outline position (cx, cy as percentage)
  mapPos: { x: number; y: number };
}

const REGION_CONFIG: RegionConfig[] = [
  {
    id: 'Central Asia',
    label: 'Central Asia',
    emoji: '🏔️',
    color: '#22d3ee',
    bgGradient: 'linear-gradient(135deg, rgba(34,211,238,0.15) 0%, rgba(34,211,238,0.05) 100%)',
    defaultStats: { objectCount: 87, totalFunding: 24.5, countryCount: 5 },
    description: 'Aral Sea basin, Amu Darya, Syr Darya',
    mapPos: { x: 62, y: 35 },
  },
  {
    id: 'Asia',
    label: 'Asia',
    emoji: '🌏',
    color: '#f97316',
    bgGradient: 'linear-gradient(135deg, rgba(249,115,22,0.15) 0%, rgba(249,115,22,0.05) 100%)',
    defaultStats: { objectCount: 142, totalFunding: 58.3, countryCount: 12 },
    description: 'Mekong, Yangtze, Ganges basins',
    mapPos: { x: 72, y: 38 },
  },
  {
    id: 'Africa',
    label: 'Africa',
    emoji: '🌍',
    color: '#eab308',
    bgGradient: 'linear-gradient(135deg, rgba(234,179,8,0.15) 0%, rgba(234,179,8,0.05) 100%)',
    defaultStats: { objectCount: 63, totalFunding: 18.2, countryCount: 10 },
    description: 'Nile, Congo, Niger river systems',
    mapPos: { x: 52, y: 52 },
  },
  {
    id: 'Europe',
    label: 'Europe',
    emoji: '🌍',
    color: '#3b82f6',
    bgGradient: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(59,130,246,0.05) 100%)',
    defaultStats: { objectCount: 54, totalFunding: 42.1, countryCount: 12 },
    description: 'Rhine, Danube, Volga basins',
    mapPos: { x: 50, y: 30 },
  },
  {
    id: 'Americas',
    label: 'Americas',
    emoji: '🌎',
    color: '#22c55e',
    bgGradient: 'linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(34,197,94,0.05) 100%)',
    defaultStats: { objectCount: 78, totalFunding: 67.8, countryCount: 8 },
    description: 'Amazon, Mississippi, Colorado systems',
    mapPos: { x: 25, y: 45 },
  },
  {
    id: 'Middle East',
    label: 'Middle East',
    emoji: '🏜️',
    color: '#a855f7',
    bgGradient: 'linear-gradient(135deg, rgba(168,85,247,0.15) 0%, rgba(168,85,247,0.05) 100%)',
    defaultStats: { objectCount: 45, totalFunding: 31.4, countryCount: 10 },
    description: 'Euphrates, Tigris, Jordan basins',
    mapPos: { x: 58, y: 40 },
  },
  {
    id: 'Oceania',
    label: 'Oceania',
    emoji: '🌊',
    color: '#06b6d4',
    bgGradient: 'linear-gradient(135deg, rgba(6,182,212,0.15) 0%, rgba(6,182,212,0.05) 100%)',
    defaultStats: { objectCount: 22, totalFunding: 8.6, countryCount: 4 },
    description: 'Murray-Darling, Pacific island systems',
    mapPos: { x: 82, y: 65 },
  },
];

// ── Format helpers ────────────────────────────────────────────

function fmtFunding(m: number): string {
  if (m >= 1000) return `$${(m / 1000).toFixed(1)}B`;
  return `$${m.toFixed(0)}M`;
}

// ── Mini world map SVG ────────────────────────────────────────

function WorldMapDots({ selected, onSelect }: {
  selected: MapRegion;
  onSelect: (r: MapRegion) => void;
}) {
  return (
    <div className="relative w-full" style={{ paddingBottom: '50%' }}>
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 200 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Ocean background */}
        <rect width="200" height="100" fill="rgba(0,20,60,0.6)" rx="8" />

        {/* Very rough continent outlines */}
        {/* Americas */}
        <path d="M20 20 L35 18 L38 25 L35 32 L30 40 L28 55 L32 65 L28 70 L22 68 L18 60 L16 45 L18 30 Z"
          fill="rgba(34,197,94,0.12)" stroke="rgba(34,197,94,0.3)" strokeWidth="0.5" />
        {/* Europe */}
        <path d="M46 22 L58 20 L60 26 L55 30 L52 28 L48 30 L44 28 Z"
          fill="rgba(59,130,246,0.12)" stroke="rgba(59,130,246,0.3)" strokeWidth="0.5" />
        {/* Africa */}
        <path d="M48 34 L60 32 L63 42 L60 58 L54 62 L48 58 L44 48 L45 38 Z"
          fill="rgba(234,179,8,0.12)" stroke="rgba(234,179,8,0.3)" strokeWidth="0.5" />
        {/* Middle East */}
        <path d="M62 30 L74 28 L76 36 L70 40 L64 38 Z"
          fill="rgba(168,85,247,0.12)" stroke="rgba(168,85,247,0.3)" strokeWidth="0.5" />
        {/* Asia */}
        <path d="M74 18 L110 15 L115 22 L108 30 L100 35 L88 32 L80 28 L74 24 Z"
          fill="rgba(249,115,22,0.12)" stroke="rgba(249,115,22,0.3)" strokeWidth="0.5" />
        {/* Central Asia */}
        <path d="M74 28 L95 26 L97 34 L88 38 L76 36 Z"
          fill="rgba(34,211,238,0.15)" stroke="rgba(34,211,238,0.4)" strokeWidth="0.5" />
        {/* Oceania */}
        <path d="M115 55 L132 52 L135 60 L128 65 L118 63 Z"
          fill="rgba(6,182,212,0.12)" stroke="rgba(6,182,212,0.3)" strokeWidth="0.5" />

        {/* Dot markers for each region */}
        {REGION_CONFIG.map(r => {
          const isActive = selected === r.id;
          return (
            <g key={r.id} style={{ cursor: 'pointer' }} onClick={() => onSelect(r.id)}>
              {isActive && (
                <circle
                  cx={r.mapPos.x * 2}
                  cy={r.mapPos.y}
                  r="5"
                  fill={r.color}
                  opacity="0.2"
                />
              )}
              <circle
                cx={r.mapPos.x * 2}
                cy={r.mapPos.y}
                r={isActive ? 2.5 : 1.8}
                fill={r.color}
                opacity={isActive ? 1 : 0.65}
              />
              {isActive && (
                <text
                  x={r.mapPos.x * 2}
                  y={r.mapPos.y - 5}
                  textAnchor="middle"
                  fontSize="4"
                  fill={r.color}
                  fontWeight="700"
                >
                  {r.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── Region Card ───────────────────────────────────────────────

function RegionCard({
  cfg,
  stats,
  isSelected,
  onClick,
}: {
  cfg: RegionConfig;
  stats: RegionStats;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl p-3 cursor-pointer transition-all group"
      style={
        isSelected
          ? {
              background: cfg.bgGradient,
              border: `1px solid ${cfg.color}40`,
              boxShadow: `0 0 20px ${cfg.color}12`,
            }
          : {
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
            }
      }
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-base">{cfg.emoji}</span>
          <span
            className="text-sm font-bold"
            style={{ color: isSelected ? cfg.color : 'rgba(255,255,255,0.75)' }}
          >
            {cfg.label}
          </span>
        </div>
        <ChevronRight
          size={13}
          style={{
            color: isSelected ? cfg.color : 'rgba(255,255,255,0.2)',
            transform: isSelected ? 'translateX(2px)' : 'none',
            transition: 'transform 0.15s ease',
          }}
        />
      </div>

      <p className="text-xs text-white/30 mb-2 line-clamp-1">{cfg.description}</p>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <MapPin size={9} style={{ color: cfg.color }} />
          <span className="text-xs font-semibold" style={{ color: isSelected ? cfg.color : 'rgba(255,255,255,0.5)' }}>
            {stats.objectCount}
          </span>
          <span className="text-xs text-white/25">objects</span>
        </div>
        <div className="flex items-center gap-1">
          <DollarSign size={9} style={{ color: '#eab308' }} />
          <span className="text-xs font-semibold text-yellow-400">{fmtFunding(stats.totalFunding)}</span>
        </div>
        <div className="flex items-center gap-1 ml-auto">
          <Flag size={9} style={{ color: 'rgba(255,255,255,0.3)' }} />
          <span className="text-xs text-white/30">{stats.countryCount}</span>
        </div>
      </div>
    </button>
  );
}

// ── Quick navigation buttons ──────────────────────────────────

const QUICK_REGIONS: { id: MapRegion; label: string; color: string }[] = [
  { id: 'all', label: '🌍 All', color: '#94a3b8' },
  { id: 'Central Asia', label: '🏔️ C. Asia', color: '#22d3ee' },
  { id: 'Asia', label: '🌏 Asia', color: '#f97316' },
  { id: 'Europe', label: '🌍 Europe', color: '#3b82f6' },
  { id: 'Americas', label: '🌎 Americas', color: '#22c55e' },
  { id: 'Africa', label: '🌍 Africa', color: '#eab308' },
  { id: 'Middle East', label: '🏜️ ME', color: '#a855f7' },
];

// ── Main Component ────────────────────────────────────────────

export function RegionSelector({
  selected,
  onSelect,
  stats = {},
  className = '',
}: RegionSelectorProps) {
  const [showList, setShowList] = useState(false);

  const mergedStats = (id: MapRegion): RegionStats => {
    const cfg = REGION_CONFIG.find(r => r.id === id);
    return stats[id] ?? cfg?.defaultStats ?? { objectCount: 0, totalFunding: 0, countryCount: 0 };
  };

  const allStats: RegionStats = {
    objectCount: REGION_CONFIG.reduce((s, r) => s + mergedStats(r.id).objectCount, 0),
    totalFunding: REGION_CONFIG.reduce((s, r) => s + mergedStats(r.id).totalFunding, 0),
    countryCount: REGION_CONFIG.reduce((s, r) => s + mergedStats(r.id).countryCount, 0),
  };

  return (
    <div
      className={`rounded-2xl overflow-hidden ${className}`}
      style={{
        background: 'linear-gradient(180deg, rgba(0,8,24,0.97) 0%, rgba(0,12,32,0.96) 100%)',
        border: '1px solid rgba(34,211,238,0.12)',
        boxShadow: '0 16px 60px rgba(0,0,0,0.7)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgba(34,211,238,0.1)' }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.2)' }}>
            <Globe size={13} style={{ color: '#22d3ee' }} />
          </div>
          <span className="text-white font-bold text-sm">Regions</span>
        </div>
        <button
          onClick={() => setShowList(v => !v)}
          className="text-xs cursor-pointer transition-colors"
          style={{ color: '#22d3ee' }}
        >
          {showList ? 'Show map' : 'Show list'}
        </button>
      </div>

      {/* World map visualization */}
      {!showList && (
        <div className="px-4 pt-3 pb-1">
          <WorldMapDots selected={selected} onSelect={onSelect} />
        </div>
      )}

      {/* Quick nav row */}
      <div className="flex gap-1.5 px-4 py-2 overflow-x-auto">
        {QUICK_REGIONS.map(q => (
          <button
            key={q.id}
            onClick={() => onSelect(q.id)}
            className="flex-shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all whitespace-nowrap"
            style={
              selected === q.id
                ? { background: `${q.color}20`, color: q.color, border: `1px solid ${q.color}35` }
                : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.07)' }
            }
          >
            {q.label}
          </button>
        ))}
      </div>

      {/* All stats when "all" selected */}
      {selected === 'all' && (
        <div className="mx-4 mb-3 p-3 rounded-xl" style={{ background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.12)' }}>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-lg font-black" style={{ color: '#22d3ee' }}>{allStats.objectCount}</div>
              <div className="text-xs text-white/35">Objects</div>
            </div>
            <div>
              <div className="text-lg font-black text-yellow-400">{fmtFunding(allStats.totalFunding)}</div>
              <div className="text-xs text-white/35">Funding</div>
            </div>
            <div>
              <div className="text-lg font-black text-white/60">{allStats.countryCount}</div>
              <div className="text-xs text-white/35">Countries</div>
            </div>
          </div>
        </div>
      )}

      {/* Region cards list (when showList or filtered region) */}
      {(showList || selected !== 'all') && (
        <div className="px-4 pb-4 space-y-2 max-h-80 overflow-y-auto">
          {REGION_CONFIG.map(cfg => (
            <RegionCard
              key={cfg.id}
              cfg={cfg}
              stats={mergedStats(cfg.id)}
              isSelected={selected === cfg.id}
              onClick={() => onSelect(cfg.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
