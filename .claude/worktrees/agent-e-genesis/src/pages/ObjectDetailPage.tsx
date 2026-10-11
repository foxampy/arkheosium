import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronLeft, Info, MapPin, Calendar, Droplets, Users, Briefcase,
  Zap, TrendingUp, DollarSign, Clock, AlertTriangle, Activity,
  Cpu, Wrench, BarChart2, Leaf, Sparkles, Brain,
  Link2, Sun, Settings, Shield, ChevronDown, ChevronUp,
  CheckCircle2, AlertCircle, Newspaper,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

import type { FullObjectData } from '@/types/object-full';
import { PremiumOverlay } from '@/components/PremiumOverlay';
import { localizedField } from '@/lib/i18n-utils';
import { FULL_OBJECTS_MAP } from '../data/objects-data';
import { supabase } from '@/lib/supabase';
import { MiniMap } from '@/components/map/MiniMap';
import { ObjectHistoryTimeline } from '@/components/objects/ObjectHistoryTimeline';
import { MonitoringPanel } from '@/components/objects/MonitoringPanel';
import { NewsPanel } from '@/components/objects/NewsPanel';
import { ClimatePanel } from '@/components/object-detail/ClimatePanel';

// ─── Supabase → FullObjectData mapper ────────────────────────────────────────

function mapSupabaseRow(row: Record<string, any>): FullObjectData {
  return {
    id: String(row.id),
    name_ru: row.name || 'Водный объект',
    name_en: row.name,
    type: (row.object_type || row.type || 'reservoir') as FullObjectData['type'],
    status: (row.status || 'operational') as FullObjectData['status'],
    description_ru: row.description || '',
    region: row.region || '',
    country: row.country || 'Узбекистан',
    coordinates: (row.latitude && row.longitude)
      ? { lat: Number(row.latitude), lng: Number(row.longitude) }
      : undefined,
    investment_proposal: row.total_funding ? {
      total_usd: Number(row.total_funding),
      irr_pct: Number(row.irr) || 0,
      payback_years: 10,
      equity_pct: 40,
      debt_pct: 60,
      avg_annual_revenue_usd: Number(row.total_funding) * 0.1,
      avg_annual_profit_usd: Number(row.total_funding) * 0.05,
      margin_pct: 50,
      horizon_years: 20,
      yearly_projections: [],
      social_impact: {
        people_gaining_water: 0,
        jobs_construction: 0,
        jobs_permanent: 0,
        water_diseases_reduction_pct: 0,
        co2_reduction_kg_per_year: 0,
      },
    } : undefined,
    data_sources: row.data_source ? [row.data_source] : undefined,
    last_updated: row.created_at,
    tags: row.category ? [row.category] : undefined,
  };
}

// ─── Types ────────────────────────────────────────────────────────────────────

type TabId = 'overview' | 'financials' | 'technology' | 'operations' | 'ai' | 'history' | 'monitoring' | 'news' | 'climate';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'overview',    label: 'Overview',     icon: Info },
  { id: 'financials',  label: 'Financials',   icon: DollarSign },
  { id: 'technology',  label: 'Technology',   icon: Cpu },
  { id: 'operations',  label: 'Operations',   icon: Activity },
  { id: 'climate',     label: 'Климат',       icon: Sun },
  { id: 'history',     label: 'История',      icon: Clock },
  { id: 'monitoring',  label: 'Мониторинг',   icon: Activity },
  { id: 'news',        label: 'Новости',      icon: Newspaper },
  { id: 'ai',          label: 'AI Analysis',  icon: Sparkles },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtUsd(n?: number | null): string {
  if (!n) return '—';
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n}`;
}

function fmtNum(n?: number | null, unit = ''): string {
  if (n == null) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M${unit ? ' ' + unit : ''}`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K${unit ? ' ' + unit : ''}`;
  return `${n}${unit ? ' ' + unit : ''}`;
}

function statusConfig(s: string) {
  const m: Record<string, { color: string; bg: string; border: string; label: string }> = {
    operational:      { color: '#4ade80', bg: 'rgba(74,222,128,0.15)',  border: 'rgba(74,222,128,0.3)',  label: 'Operational' },
    active:           { color: '#4ade80', bg: 'rgba(74,222,128,0.15)',  border: 'rgba(74,222,128,0.3)',  label: 'Active' },
    degraded:         { color: '#fbbf24', bg: 'rgba(251,191,36,0.15)',  border: 'rgba(251,191,36,0.3)',  label: 'Degraded' },
    critical:         { color: '#ff4d6d', bg: 'rgba(255,77,109,0.15)', border: 'rgba(255,77,109,0.3)',  label: 'Critical' },
    offline:          { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)',  border: 'rgba(148,163,184,0.2)', label: 'Offline' },
    under_construction:{ color: '#60a5fa', bg: 'rgba(96,165,250,0.15)', border: 'rgba(96,165,250,0.3)',  label: 'Under Construction' },
    investment:       { color: '#a78bfa', bg: 'rgba(167,139,250,0.15)', border: 'rgba(167,139,250,0.3)', label: 'Investment' },
  };
  return m[s] ?? { color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.2)', label: s };
}

function typeLabel(t: string): string {
  const map: Record<string, string> = {
    dam: 'Dam',
    reservoir: 'Reservoir',
    irrigation_canal: 'Irrigation Canal',
    pumping_station: 'Pumping Station',
    water_treatment_facility: 'Treatment Plant',
    mountain_lake: 'Mountain Lake',
    pipeline: 'Pipeline',
    wastewater_plant: 'Wastewater Plant',
    desalination_plant: 'Desalination Plant',
    groundwater_well: 'Groundwater Well',
  };
  return map[t] ?? t;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label, value, icon: Icon, color = '#00e6c8',
}: { label: string; value: string; icon: React.ElementType; color?: string }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="rounded-2xl p-4 flex-1 min-w-0"
      style={{ background: 'rgba(0,6,20,0.85)', border: `1px solid ${color}25`, backdropFilter: 'blur(12px)' }}
    >
      <Icon size={14} style={{ color }} className="mb-2 opacity-80" />
      <div className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-1 truncate">{label}</div>
      <div className="font-black text-lg tabular-nums leading-tight" style={{ color }}>{value}</div>
    </motion.div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg,#000818 0%,#001030 40%,#000c24 100%)' }}>
      <div className="h-80 animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }} />
      <div className="max-w-5xl mx-auto px-5 py-8 space-y-4">
        {[1,2,3].map(i => (
          <div key={i} className="h-40 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }} />
        ))}
      </div>
    </div>
  );
}

// ─── Not Found ────────────────────────────────────────────────────────────────

function NotFound({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: 'linear-gradient(180deg,#000818 0%,#001030 40%,#000c24 100%)' }}>
      <div className="text-center">
        <p className="text-white/40 text-lg mb-4">Object not found</p>
        <button onClick={onBack}
          className="px-4 py-2 rounded-xl text-sm cursor-pointer"
          style={{ background: 'rgba(0,230,200,0.1)', color: '#00e6c8', border: '1px solid rgba(0,230,200,0.2)' }}>
          ← Проект Хаб
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  HERO SECTION
// ═══════════════════════════════════════════════════════════════

function HeroSection({ object }: { object: FullObjectData }) {
  const [, setLocation] = useLocation();
  const sc = statusConfig(object.status);
  const age = object.construction_year ? new Date().getFullYear() - object.construction_year : null;

  return (
    <div className="relative overflow-hidden" style={{ minHeight: 360 }}>
      {/* BG */}
      {object.cover_image_url ? (
        <div className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${object.cover_image_url})` }} />
      ) : (
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, rgba(0,8,18,1) 0%, rgba(0,20,50,1) 50%, rgba(0,8,18,1) 100%)' }} />
      )}
      <div className="absolute inset-0"
        style={{ background: 'linear-gradient(to bottom, rgba(0,8,18,0.5) 0%, rgba(0,8,18,0.95) 100%)' }} />

      <div className="relative z-10 max-w-5xl mx-auto px-5 pt-6 pb-8">
        {/* Breadcrumb */}
        <motion.button
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => setLocation('/hub')}
          className="flex items-center gap-1.5 text-white/50 hover:text-white/80 transition-colors text-sm mb-6"
        >
          <ChevronLeft size={16} />
          <span>Проект Хаб</span>
          <span className="text-white/25 mx-1">/</span>
          <span className="text-white/70 truncate max-w-xs">{localizedField(object, 'name')}</span>
        </motion.button>

        {/* Title row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-6"
        >
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {/* Country badge */}
            <span className="px-3 py-1 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(96,165,250,0.15)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.3)' }}>
              🌍 {object.country}
            </span>
            {/* Type badge */}
            <span className="px-3 py-1 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(0,230,200,0.1)', color: '#00e6c8', border: '1px solid rgba(0,230,200,0.2)' }}>
              {typeLabel(object.type)}
            </span>
            {/* Status badge */}
            <span className="px-3 py-1 rounded-full text-xs font-semibold"
              style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
              {sc.label}
            </span>
          </div>

          <h1 className="text-white font-black text-3xl sm:text-4xl leading-tight mb-2">
            {localizedField(object, 'name')}
          </h1>
          {object.name_en && (
            <p className="text-white/40 text-sm">{object.name_en}</p>
          )}
          {(object.region || object.country) && (
            <div className="flex items-center gap-1.5 mt-2 text-white/50 text-sm">
              <MapPin size={13} />
              <span>{[object.region, object.country].filter(Boolean).join(', ')}</span>
            </div>
          )}
        </motion.div>

        {/* 4 Stat Cards */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          <StatCard
            label="Year Built"
            value={object.construction_year ? String(object.construction_year) : '—'}
            icon={Calendar}
            color="#fbbf24"
          />
          <StatCard
            label="Capacity"
            value={object.actual_capacity_m3_per_day
              ? fmtNum(object.actual_capacity_m3_per_day) + ' m³/d'
              : '—'}
            icon={Droplets}
            color="#00e6c8"
          />
          <StatCard
            label="Beneficiaries"
            value={fmtNum(object.serves_population)}
            icon={Users}
            color="#60a5fa"
          />
          <StatCard
            label="Age"
            value={age ? `${age} yrs` : '—'}
            icon={Activity}
            color="#a78bfa"
          />
        </motion.div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  TAB: OVERVIEW
// ═══════════════════════════════════════════════════════════════

function OverviewTab({ object }: { object: FullObjectData }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Description */}
      <div className="rounded-2xl p-5"
        style={{ background: 'rgba(0,6,20,0.85)', border: '1px solid rgba(0,230,200,0.1)' }}>
        <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-3 flex items-center gap-2">
          <Info size={14} style={{ color: '#00e6c8' }} />
          Description
        </h3>
        <p className="text-white/65 text-sm leading-relaxed">
          {localizedField(object, 'description') || 'No description available.'}
        </p>
        {object.description_en && (
          <p className="text-white/40 text-xs leading-relaxed mt-2 italic">{object.description_en}</p>
        )}
      </div>

      {/* Map mini-preview */}
      {object.coordinates && (
        <div className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid rgba(96,165,250,0.15)' }}>
          <MiniMap
            latitude={object.coordinates.lat}
            longitude={object.coordinates.lng}
            zoom={11}
            markerColor={statusConfig(object.status).color}
            markerType={object.type}
            height="220px"
          />
          <div className="px-4 py-2 flex items-center justify-between"
            style={{ background: 'rgba(0,6,20,0.9)', borderTop: '1px solid rgba(96,165,250,0.1)' }}>
            <div className="flex items-center gap-1.5">
              <MapPin size={12} className="text-blue-400" />
              <span className="text-white/50 text-xs">
                {object.coordinates.lat.toFixed(4)}°N, {object.coordinates.lng.toFixed(4)}°E
                {object.region ? ` — ${object.region}` : ''}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* SVG Schematic Diagram based on type */}
      <TypeSchematic type={object.type} />

      {/* Key facts */}
      <div className="rounded-2xl p-5"
        style={{ background: 'rgba(0,6,20,0.85)', border: '1px solid rgba(167,139,250,0.1)' }}>
        <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
          <BarChart2 size={14} style={{ color: '#a78bfa' }} />
          Key Facts
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <FactRow label="Data Source" value={object.data_sources?.[0] ?? '—'} />
          <FactRow label="Category" value={typeLabel(object.type)} />
          <FactRow label="Last Updated"
            value={object.last_updated ? new Date(object.last_updated).toLocaleDateString() : '—'} />
          <FactRow label="Region" value={object.region ?? '—'} />
          <FactRow label="Basin" value={object.basin ?? '—'} />
          <FactRow label="Data Completeness"
            value={object.completion_pct ? `${object.completion_pct}%` : '—'} />
        </div>
      </div>
    </motion.div>
  );
}

function FactRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-white/35 text-xs min-w-[110px] pt-0.5">{label}:</span>
      <span className="text-white/75 text-xs font-semibold">{value}</span>
    </div>
  );
}

// ─── Type Schematic SVG ───────────────────────────────────────────────────────

function TypeSchematic({ type }: { type: string }) {
  const schematics: Record<string, React.ReactNode> = {
    dam: (
      <svg viewBox="0 0 300 120" className="w-full" style={{ maxHeight: 120 }}>
        {/* Water behind dam */}
        <rect x="0" y="40" width="130" height="80" fill="rgba(0,150,255,0.18)" rx="2"/>
        {/* Dam body */}
        <polygon points="130,20 155,20 160,120 120,120" fill="rgba(96,165,250,0.4)" stroke="rgba(96,165,250,0.7)" strokeWidth="1.5"/>
        {/* Water flow through dam */}
        <path d="M155,80 C180,80 200,75 220,78 C240,81 260,78 300,76" stroke="rgba(0,230,200,0.6)" strokeWidth="2" fill="none"/>
        <path d="M155,90 C180,92 200,88 220,91 C240,94 260,90 300,88" stroke="rgba(0,230,200,0.35)" strokeWidth="1.5" fill="none"/>
        {/* Labels */}
        <text x="55" y="58" fill="rgba(96,165,250,0.7)" fontSize="9" textAnchor="middle">Reservoir</text>
        <text x="143" y="14" fill="rgba(96,165,250,0.9)" fontSize="8" textAnchor="middle">Dam</text>
        <text x="230" y="70" fill="rgba(0,230,200,0.8)" fontSize="9" textAnchor="middle">River Flow</text>
        {/* Spillway */}
        <rect x="140" y="75" width="14" height="12" fill="rgba(0,230,200,0.3)" rx="1"/>
        {/* Level indicator */}
        <line x1="5" y1="40" x2="5" y2="120" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="3,3"/>
        <text x="9" y="47" fill="rgba(255,255,255,0.3)" fontSize="7">WL</text>
      </svg>
    ),
    water_treatment_facility: (
      <svg viewBox="0 0 300 100" className="w-full" style={{ maxHeight: 100 }}>
        {/* Intake */}
        <rect x="5" y="35" width="35" height="30" fill="rgba(0,150,255,0.15)" rx="4" stroke="rgba(96,165,250,0.4)" strokeWidth="1"/>
        <text x="22" y="52" fill="rgba(96,165,250,0.7)" fontSize="7" textAnchor="middle">Intake</text>
        {/* Arrow */}
        <path d="M40,50 H60" stroke="rgba(0,230,200,0.5)" strokeWidth="1.5" markerEnd="url(#arr)"/>
        {/* Coagulation */}
        <circle cx="75" cy="50" r="14" fill="rgba(251,191,36,0.1)" stroke="rgba(251,191,36,0.4)" strokeWidth="1"/>
        <text x="75" y="53" fill="rgba(251,191,36,0.8)" fontSize="6.5" textAnchor="middle">Coag.</text>
        {/* Arrow */}
        <path d="M89,50 H108" stroke="rgba(0,230,200,0.5)" strokeWidth="1.5"/>
        {/* Filter */}
        <rect x="108" y="36" width="28" height="28" fill="rgba(74,222,128,0.1)" rx="4" stroke="rgba(74,222,128,0.4)" strokeWidth="1"/>
        <text x="122" y="53" fill="rgba(74,222,128,0.8)" fontSize="6.5" textAnchor="middle">Filter</text>
        {/* Arrow */}
        <path d="M136,50 H155" stroke="rgba(0,230,200,0.5)" strokeWidth="1.5"/>
        {/* UV/Chlor */}
        <circle cx="170" cy="50" r="14" fill="rgba(167,139,250,0.1)" stroke="rgba(167,139,250,0.4)" strokeWidth="1"/>
        <text x="170" y="53" fill="rgba(167,139,250,0.8)" fontSize="6.5" textAnchor="middle">UV</text>
        {/* Arrow */}
        <path d="M184,50 H203" stroke="rgba(0,230,200,0.5)" strokeWidth="1.5"/>
        {/* Storage */}
        <rect x="203" y="36" width="28" height="28" fill="rgba(0,230,200,0.1)" rx="4" stroke="rgba(0,230,200,0.4)" strokeWidth="1"/>
        <text x="217" y="53" fill="rgba(0,230,200,0.8)" fontSize="6.5" textAnchor="middle">Tank</text>
        {/* Arrow to dist */}
        <path d="M231,50 H260" stroke="rgba(0,230,200,0.5)" strokeWidth="1.5"/>
        <text x="275" y="53" fill="rgba(0,230,200,0.7)" fontSize="7" textAnchor="middle">Dist.</text>
        <defs>
          <marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="rgba(0,230,200,0.5)"/>
          </marker>
        </defs>
      </svg>
    ),
    irrigation_canal: (
      <svg viewBox="0 0 300 80" className="w-full" style={{ maxHeight: 80 }}>
        {/* Main canal cross-section */}
        <path d="M10,20 L10,60 L50,70 L250,70 L290,60 L290,20" stroke="rgba(96,165,250,0.5)" strokeWidth="1.5" fill="none"/>
        {/* Water fill */}
        <path d="M10,35 L10,60 L50,70 L250,70 L290,60 L290,35" fill="rgba(0,150,255,0.15)"/>
        {/* Flow arrows */}
        {[60,120,180,240].map(x => (
          <g key={x}>
            <path d={`M${x},45 H${x+20}`} stroke="rgba(0,230,200,0.5)" strokeWidth="1.5"/>
            <path d={`M${x+17},42 L${x+20},45 L${x+17},48`} stroke="rgba(0,230,200,0.5)" strokeWidth="1.5" fill="none"/>
          </g>
        ))}
        {/* Branch gate */}
        <rect x="145" y="58" width="10" height="14" fill="rgba(251,191,36,0.3)" stroke="rgba(251,191,36,0.6)" strokeWidth="1"/>
        <path d="M150,72 L150,90" stroke="rgba(0,230,200,0.4)" strokeWidth="1.5" strokeDasharray="3,2"/>
        <text x="150" y="40" fill="rgba(96,165,250,0.7)" fontSize="8" textAnchor="middle">Main Canal</text>
        <text x="165" y="88" fill="rgba(251,191,36,0.7)" fontSize="7">Field</text>
      </svg>
    ),
    pumping_station: (
      <svg viewBox="0 0 300 90" className="w-full" style={{ maxHeight: 90 }}>
        {/* Inlet pipe */}
        <rect x="5" y="40" width="70" height="15" fill="rgba(0,150,255,0.15)" rx="3" stroke="rgba(96,165,250,0.4)" strokeWidth="1"/>
        <text x="40" y="50" fill="rgba(96,165,250,0.7)" fontSize="7" textAnchor="middle">Inlet</text>
        {/* Pump unit */}
        <rect x="80" y="20" width="60" height="55" fill="rgba(167,139,250,0.1)" rx="6" stroke="rgba(167,139,250,0.5)" strokeWidth="1.5"/>
        <circle cx="110" cy="47" r="16" fill="rgba(167,139,250,0.15)" stroke="rgba(167,139,250,0.5)" strokeWidth="1.5"/>
        <text x="110" y="44" fill="rgba(167,139,250,0.9)" fontSize="7" textAnchor="middle">PUMP</text>
        <text x="110" y="53" fill="rgba(167,139,250,0.7)" fontSize="6" textAnchor="middle">Motor</text>
        {/* Outlet */}
        <rect x="145" y="40" width="70" height="15" fill="rgba(0,230,200,0.1)" rx="3" stroke="rgba(0,230,200,0.3)" strokeWidth="1"/>
        {/* Pressure gauge */}
        <circle cx="220" cy="38" r="10" fill="rgba(251,191,36,0.1)" stroke="rgba(251,191,36,0.4)" strokeWidth="1"/>
        <text x="220" y="41" fill="rgba(251,191,36,0.8)" fontSize="5.5" textAnchor="middle">P</text>
        {/* Outlet pipe to network */}
        <rect x="220" y="40" width="75" height="15" fill="rgba(0,230,200,0.1)" rx="3" stroke="rgba(0,230,200,0.3)" strokeWidth="1"/>
        <text x="260" y="50" fill="rgba(0,230,200,0.7)" fontSize="7" textAnchor="middle">Network</text>
        <text x="110" y="83" fill="rgba(167,139,250,0.6)" fontSize="7" textAnchor="middle">Pumping Station</text>
      </svg>
    ),
    desalination_plant: (
      <svg viewBox="0 0 300 90" className="w-full" style={{ maxHeight: 90 }}>
        {/* Seawater intake */}
        <path d="M5,45 Q20,35 35,45 Q50,55 65,45" stroke="rgba(96,165,250,0.5)" strokeWidth="2" fill="none"/>
        <text x="35" y="65" fill="rgba(96,165,250,0.6)" fontSize="7" textAnchor="middle">Seawater</text>
        {/* Pre-filter */}
        <rect x="70" y="30" width="28" height="28" fill="rgba(74,222,128,0.1)" rx="3" stroke="rgba(74,222,128,0.4)" strokeWidth="1"/>
        <text x="84" y="47" fill="rgba(74,222,128,0.8)" fontSize="6" textAnchor="middle">Pre-filter</text>
        {/* RO Membrane */}
        <rect x="108" y="25" width="40" height="38" fill="rgba(167,139,250,0.1)" rx="4" stroke="rgba(167,139,250,0.5)" strokeWidth="1.5"/>
        <text x="128" y="43" fill="rgba(167,139,250,0.9)" fontSize="6.5" textAnchor="middle">RO</text>
        <text x="128" y="52" fill="rgba(167,139,250,0.7)" fontSize="6" textAnchor="middle">Membrane</text>
        {/* Freshwater out */}
        <path d="M148,35 H175" stroke="rgba(0,230,200,0.6)" strokeWidth="1.5"/>
        <text x="190" y="32" fill="rgba(0,230,200,0.8)" fontSize="7">Fresh Water</text>
        <rect x="175" y="25" width="30" height="20" fill="rgba(0,230,200,0.1)" rx="3" stroke="rgba(0,230,200,0.3)" strokeWidth="1"/>
        {/* Brine out */}
        <path d="M148,55 H175" stroke="rgba(255,77,109,0.4)" strokeWidth="1.5" strokeDasharray="4,2"/>
        <text x="185" y="65" fill="rgba(255,77,109,0.6)" fontSize="7">Brine</text>
        {/* Energy recovery */}
        <rect x="230" y="35" width="60" height="20" fill="rgba(251,191,36,0.1)" rx="3" stroke="rgba(251,191,36,0.3)" strokeWidth="1"/>
        <text x="260" y="48" fill="rgba(251,191,36,0.7)" fontSize="6.5" textAnchor="middle">Energy Recovery</text>
      </svg>
    ),
  };

  const diagram = schematics[type];
  if (!diagram) return null;

  return (
    <div className="rounded-2xl p-5"
      style={{ background: 'rgba(0,6,20,0.85)', border: '1px solid rgba(96,165,250,0.1)' }}>
      <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
        <Cpu size={14} style={{ color: '#60a5fa' }} />
        {typeLabel(type)} Schematic
      </h3>
      <div className="overflow-hidden rounded-xl p-3"
        style={{ background: 'rgba(0,8,24,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
        {diagram}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  TAB: FINANCIALS
// ═══════════════════════════════════════════════════════════════

function FinancialsTab({ object }: { object: FullObjectData }) {
  const ip = object.investment_proposal;
  const constructionCost = ip?.total_usd ?? object.replacement_cost_usd;
  const annualMaintenance = ip?.avg_annual_profit_usd
    ? undefined
    : object.annual_opex_usd;
  const annualRevenue = object.annual_revenue_usd ?? ip?.avg_annual_revenue_usd;

  const roi = constructionCost && annualRevenue
    ? ((annualRevenue / constructionCost) * 100).toFixed(1)
    : null;
  const payback = constructionCost && annualRevenue
    ? (constructionCost / annualRevenue).toFixed(1)
    : null;

  // Simulate 10-year revenue vs cost chart
  const chartData = Array.from({ length: 10 }, (_, i) => {
    const year = new Date().getFullYear() + i;
    const baseRev = annualRevenue ?? 1_000_000;
    const baseOpex = annualMaintenance ?? (baseRev * 0.6);
    return {
      year: year.toString(),
      revenue: Math.round(baseRev * (1 + i * 0.04)),
      costs: Math.round(baseOpex * (1 + i * 0.02)),
    };
  });

  const isInvestment = object.investment_proposal != null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* 3 Financial stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard label="Construction Cost" value={fmtUsd(constructionCost)} icon={DollarSign} color="#fbbf24" />
        <StatCard label="Annual Maintenance" value={fmtUsd(annualMaintenance)} icon={Wrench} color="#f472b6" />
        <StatCard label="Annual Revenue" value={fmtUsd(annualRevenue)} icon={TrendingUp} color="#4ade80" />
      </div>

      {/* ROI & Payback */}
      {(roi || payback) && (
        <div className="grid grid-cols-2 gap-3">
          {roi && (
            <div className="rounded-2xl p-4"
              style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.15)' }}>
              <div className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-1">ROI</div>
              <div className="font-black text-2xl tabular-nums" style={{ color: '#4ade80' }}>{roi}%</div>
              <div className="text-white/30 text-xs mt-0.5">Annual return on investment</div>
            </div>
          )}
          {payback && (
            <div className="rounded-2xl p-4"
              style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)' }}>
              <div className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-1">Payback</div>
              <div className="font-black text-2xl tabular-nums" style={{ color: '#fbbf24' }}>{payback} yrs</div>
              <div className="text-white/30 text-xs mt-0.5">Years to recover investment</div>
            </div>
          )}
        </div>
      )}

      {/* IRR & DAO if investment */}
      {isInvestment && ip && (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl p-4"
            style={{ background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.15)' }}>
            <div className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-1">IRR</div>
            <div className="font-black text-2xl tabular-nums" style={{ color: '#a78bfa' }}>{ip.irr_pct}%</div>
            <div className="text-white/30 text-xs mt-0.5">Internal rate of return</div>
          </div>
          {ip.social_impact && (
            <div className="rounded-2xl p-4"
              style={{ background: 'rgba(0,230,200,0.06)', border: '1px solid rgba(0,230,200,0.15)' }}>
              <div className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-1">DAO Available</div>
              <div className="font-black text-lg tabular-nums" style={{ color: '#00e6c8' }}>
                {ip.equity_pct}% Equity
              </div>
              <div className="text-white/30 text-xs mt-0.5">Available for DAO funding</div>
            </div>
          )}
        </div>
      )}

      <PremiumOverlay title="Финансовые данные">
        {/* Funding sources / PPP structure */}
        {isInvestment && ip?.funding_sources && ip.funding_sources.length > 0 && (
          <div className="rounded-2xl p-5"
            style={{ background: 'rgba(0,6,20,0.85)', border: '1px solid rgba(0,230,200,0.12)' }}>
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
              <Shield size={14} style={{ color: '#00e6c8' }} />
              Структура финансирования ГЧП
            </h3>
            <div className="space-y-2">
              {ip.funding_sources.map((src, idx) => {
                const pct = Math.round((src.amount_usd / ip.total_usd) * 100);
                const color = src.type === 'equity' ? '#00e6c8' : src.type === 'debt' ? '#60a5fa' : '#4ade80';
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white/70 text-xs truncate">{src.name}</span>
                        <span className="text-xs font-bold ml-2 flex-shrink-0" style={{ color }}>
                          {fmtUsd(src.amount_usd)} · {pct}%
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden"
                        style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}80)` }} />
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-lg text-xs flex-shrink-0"
                      style={{ background: `${color}12`, color, border: `1px solid ${color}22` }}>
                      {src.type === 'equity' ? 'Equity' : src.type === 'debt' ? 'Debt' : 'Grant'}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 pt-3 flex flex-wrap gap-2 text-xs text-white/35"
              style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <span>PPP-модель: Финансирование → Проектирование → Реконструкция → Эксплуатация (10 лет) → Передача</span>
            </div>
          </div>
        )}

        {/* 10-year AreaChart */}
        <div className="rounded-2xl p-5"
          style={{ background: 'rgba(0,6,20,0.85)', border: '1px solid rgba(0,230,200,0.1)' }}>
          <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
            <BarChart2 size={14} style={{ color: '#00e6c8' }} />
            10-Year Revenue vs Costs (Projected)
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="gradRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gradCost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f472b6" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#f472b6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
              <XAxis dataKey="year" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} axisLine={false} tickLine={false}/>
              <YAxis tickFormatter={(v: number) => fmtUsd(v)} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 9 }} axisLine={false} tickLine={false}/>
              <Tooltip
                contentStyle={{ background: 'rgba(0,6,20,0.97)', border: '1px solid rgba(0,230,200,0.2)', borderRadius: 12, fontSize: 12 }}
                labelStyle={{ color: 'rgba(255,255,255,0.6)' }}
                formatter={(v: number) => fmtUsd(v)}
              />
              <Legend wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}/>
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#4ade80" fill="url(#gradRev)" strokeWidth={2}/>
              <Area type="monotone" dataKey="costs" name="Costs" stroke="#f472b6" fill="url(#gradCost)" strokeWidth={2}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </PremiumOverlay>

      {/* Invest button for investment category */}
      {isInvestment && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
          style={{
            background: 'linear-gradient(135deg, rgba(0,230,200,0.2), rgba(96,165,250,0.15))',
            color: '#00e6c8',
            border: '1px solid rgba(0,230,200,0.3)',
            boxShadow: '0 4px 24px rgba(0,230,200,0.1)',
          }}
        >
          <TrendingUp size={16} />
          Invest in this Object
        </motion.button>
      )}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  TAB: TECHNOLOGY
// ═══════════════════════════════════════════════════════════════

function TechnologyTab({ object }: { object: FullObjectData }) {
  const techs: string[] = [
    ...(object.treatment_technologies ?? []),
    object.automation_level_pct && object.automation_level_pct >= 30 ? 'SCADA' : '',
    object.automation_level_pct && object.automation_level_pct >= 50 ? 'IoT Sensors' : '',
    object.automation_level_pct && object.automation_level_pct >= 70 ? 'AI Analytics' : '',
    object.meets_who_standards ? 'WHO Standards' : '',
  ].filter(Boolean) as string[];

  const mods = object.modernization_plan?.phases ?? [];
  const modCount = mods.length;
  const age = object.construction_year ? new Date().getFullYear() - object.construction_year : 0;
  const innovationScore = Math.min(100, Math.max(0,
    100 - Math.round(age * 0.5) + modCount * 8 + (object.automation_level_pct ?? 0) * 0.3
  ));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Tech badge chips */}
      <div className="rounded-2xl p-5"
        style={{ background: 'rgba(0,6,20,0.85)', border: '1px solid rgba(96,165,250,0.1)' }}>
        <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
          <Cpu size={14} style={{ color: '#60a5fa' }} />
          Technologies
        </h3>
        <div className="flex flex-wrap gap-2">
          {techs.length > 0 ? techs.map(tech => (
            <span key={tech}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold"
              style={{ background: 'rgba(96,165,250,0.1)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.2)' }}>
              {tech}
            </span>
          )) : (
            <span className="text-white/25 text-sm">No technologies listed</span>
          )}
        </div>
      </div>

      {/* Innovation Potential Score */}
      <div className="rounded-2xl p-5"
        style={{ background: 'rgba(0,6,20,0.85)', border: '1px solid rgba(167,139,250,0.1)' }}>
        <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
          <Sparkles size={14} style={{ color: '#a78bfa' }} />
          Innovation Potential
        </h3>
        <div className="flex items-center gap-4">
          <div className="text-5xl font-black tabular-nums" style={{ color: innovationScore >= 70 ? '#4ade80' : innovationScore >= 40 ? '#fbbf24' : '#ff4d6d' }}>
            {innovationScore}
          </div>
          <div className="flex-1">
            <div className="text-white/40 text-xs mb-2">Score out of 100</div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${innovationScore}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: innovationScore >= 70 ? '#4ade80' : innovationScore >= 40 ? '#fbbf24' : '#ff4d6d' }}
              />
            </div>
            <div className="text-white/30 text-xs mt-1">
              Based on age ({age}y), {modCount} modernization(s), {object.automation_level_pct ?? 0}% automation
            </div>
          </div>
        </div>
      </div>

      {/* Modernizations vertical timeline */}
      {mods.length > 0 && (
        <PremiumOverlay title="Технологии и оборудование">
          <div className="rounded-2xl p-5"
            style={{ background: 'rgba(0,6,20,0.85)', border: '1px solid rgba(0,230,200,0.1)' }}>
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
              <Wrench size={14} style={{ color: '#00e6c8' }} />
              Modernization Timeline
            </h3>
            <div className="space-y-0">
              {mods.map((phase, idx) => {
                const isLast = idx === mods.length - 1;
                const phaseYear = (object.modernization_plan?.construction_start_year ?? new Date().getFullYear()) + idx;
                return (
                  <motion.div
                    key={phase.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className="flex gap-4"
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs"
                        style={{ background: 'rgba(0,230,200,0.15)', border: '1.5px solid rgba(0,230,200,0.4)', color: '#00e6c8' }}>
                        {idx + 1}
                      </div>
                      {!isLast && <div className="w-px flex-1 mt-1 mb-1" style={{ background: 'rgba(0,230,200,0.12)', minHeight: 24 }}/>}
                    </div>
                    <div className={`flex-1 pb-4 ${isLast ? '' : ''}`}>
                      <div className="rounded-xl p-3"
                        style={{ background: 'rgba(0,230,200,0.03)', border: '1px solid rgba(0,230,200,0.08)' }}>
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div>
                            <span className="text-white/30 text-xs block mb-0.5">{phaseYear}</span>
                            <h4 className="text-white font-bold text-sm">{phase.name_ru}</h4>
                          </div>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 tabular-nums"
                            style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.15)' }}>
                            {fmtUsd(phase.cost_usd)}
                          </span>
                        </div>
                        <p className="text-white/45 text-xs leading-relaxed">{phase.description_ru}</p>
                        {phase.technologies && phase.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {phase.technologies.map(t => (
                              <span key={t} className="text-xs px-1.5 py-0.5 rounded text-white/40"
                                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </PremiumOverlay>
      )}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  TAB: OPERATIONS
// ═══════════════════════════════════════════════════════════════

function OperationsTab({ object }: { object: FullObjectData }) {
  const sc = statusConfig(object.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Operational stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Water Output"
          value={object.actual_capacity_m3_per_day
            ? fmtNum(object.actual_capacity_m3_per_day) + ' m³/d'
            : '—'}
          icon={Droplets}
          color="#00e6c8"
        />
        <StatCard
          label="Power Output"
          value={object.total_pump_power_kw
            ? `${(object.total_pump_power_kw / 1000).toFixed(1)} MW`
            : '—'}
          icon={Zap}
          color="#fbbf24"
        />
        <StatCard
          label="Employees"
          value="—"
          icon={Briefcase}
          color="#60a5fa"
        />
        <StatCard
          label="Beneficiaries"
          value={fmtNum(object.serves_population)}
          icon={Users}
          color="#a78bfa"
        />
      </div>

      {/* Status badge */}
      <div className="rounded-2xl p-5 flex items-center gap-4"
        style={{ background: 'rgba(0,6,20,0.85)', border: `1px solid ${sc.border}` }}>
        <div className="w-3 h-3 rounded-full"
          style={{ background: sc.color, boxShadow: `0 0 8px ${sc.color}` }} />
        <div>
          <div className="text-white font-bold">{sc.label}</div>
          <div className="text-white/40 text-xs">Current operational status</div>
        </div>
        {object.actual_capacity_m3_per_day && object.design_capacity_m3_per_day && (
          <div className="ml-auto text-right">
            <div className="text-white font-bold text-sm">
              {Math.round((object.actual_capacity_m3_per_day / object.design_capacity_m3_per_day) * 100)}%
            </div>
            <div className="text-white/40 text-xs">Capacity utilization</div>
          </div>
        )}
      </div>

      {/* Capacity text display */}
      {(object.design_capacity_m3_per_day || object.actual_capacity_m3_per_day) && (
        <div className="rounded-2xl p-5"
          style={{ background: 'rgba(0,6,20,0.85)', border: '1px solid rgba(0,230,200,0.1)' }}>
          <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
            <Droplets size={14} style={{ color: '#00e6c8' }} />
            Capacity Details
          </h3>
          <div className="space-y-3">
            {object.design_capacity_m3_per_day && (
              <div className="flex justify-between items-center">
                <span className="text-white/50 text-sm">Design Capacity</span>
                <span className="text-white font-bold text-sm">
                  {fmtNum(object.design_capacity_m3_per_day)} m³/day
                </span>
              </div>
            )}
            {object.actual_capacity_m3_per_day && (
              <div className="flex justify-between items-center">
                <span className="text-white/50 text-sm">Actual Capacity</span>
                <span className="font-bold text-sm" style={{ color: '#00e6c8' }}>
                  {fmtNum(object.actual_capacity_m3_per_day)} m³/day
                </span>
              </div>
            )}
            {object.total_volume_m3 && (
              <div className="flex justify-between items-center">
                <span className="text-white/50 text-sm">Total Volume</span>
                <span className="text-white font-bold text-sm">{fmtNum(object.total_volume_m3)} m³</span>
              </div>
            )}
            {object.water_loss_pct != null && (
              <div className="flex justify-between items-center">
                <span className="text-white/50 text-sm">Water Loss</span>
                <span className="font-bold text-sm"
                  style={{ color: object.water_loss_pct > 20 ? '#ff4d6d' : '#fbbf24' }}>
                  {object.water_loss_pct}%
                </span>
              </div>
            )}
            {object.automation_level_pct != null && (
              <div className="flex justify-between items-center">
                <span className="text-white/50 text-sm">Automation Level</span>
                <span className="font-bold text-sm" style={{ color: '#60a5fa' }}>
                  {object.automation_level_pct}%
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Current issues */}
      {object.critical_issues && object.critical_issues.length > 0 && (
        <PremiumOverlay title="Операционные данные">
          <div className="rounded-2xl p-5"
            style={{ background: 'rgba(255,77,109,0.05)', border: '1px solid rgba(255,77,109,0.2)' }}>
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
              <AlertTriangle size={14} style={{ color: '#ff4d6d' }} />
              Current Issues
            </h3>
            <div className="space-y-3">
              {object.critical_issues.map(issue => (
                <div key={issue.id} className="rounded-xl p-3"
                  style={{ background: 'rgba(255,77,109,0.08)', border: '1px solid rgba(255,77,109,0.15)' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        background: issue.urgency === 'critical' || issue.urgency === 'high'
                          ? 'rgba(255,77,109,0.15)' : 'rgba(251,191,36,0.1)',
                        color: issue.urgency === 'critical' || issue.urgency === 'high' ? '#ff4d6d' : '#fbbf24',
                      }}>
                      {issue.urgency} urgency
                    </span>
                    <span className="text-white/30 text-xs">{issue.type}</span>
                  </div>
                  <p className="text-white/65 text-xs leading-relaxed">{issue.description_ru}</p>
                  {issue.estimated_fix_cost_usd && (
                    <p className="text-white/35 text-xs mt-1">Est. fix: {fmtUsd(issue.estimated_fix_cost_usd)}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </PremiumOverlay>
      )}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  TAB: AI ANALYSIS (inline, not modal)
// ═══════════════════════════════════════════════════════════════

interface Innovation {
  id: string;
  title: string;
  description: string;
  category: 'iot' | 'ai' | 'energy' | 'automation' | 'blockchain' | 'environmental' | 'safety';
  roi_improvement_pct: number;
  implementation_cost_usd: number;
  timeline_months: number;
  priority: 'high' | 'medium' | 'low';
  tags: string[];
}

interface AIAnalysisResult {
  object_id: string;
  object_name: string;
  analysis_timestamp: string;
  summary: string;
  innovations: Innovation[];
  total_estimated_investment_usd: number;
  expected_efficiency_gain_pct: number;
  expected_roi_improvement_pct: number;
  implementation_roadmap: string;
}

const CATEGORY_ICONS: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  iot:           { icon: Cpu,       color: '#00e6c8', label: 'IoT Sensors' },
  ai:            { icon: Brain,     color: '#a78bfa', label: 'AI Monitoring' },
  energy:        { icon: Sun,       color: '#fbbf24', label: 'Solar Integration' },
  automation:    { icon: Settings,  color: '#60a5fa', label: 'Smart Water' },
  blockchain:    { icon: Link2,     color: '#f472b6', label: 'Blockchain' },
  environmental: { icon: Leaf,      color: '#4ade80', label: 'Environmental' },
  safety:        { icon: Shield,    color: '#fb923c', label: 'Safety' },
};

function InnovationCard({ inn, idx }: { inn: Innovation; idx: number }) {
  const [open, setOpen] = useState(false);
  const cat = CATEGORY_ICONS[inn.category] ?? CATEGORY_ICONS.automation;
  const CatIcon = cat.icon;
  const priorityColor = inn.priority === 'high' ? '#ff4d6d' : inn.priority === 'medium' ? '#fbbf24' : '#4ade80';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * idx }}
      className="rounded-xl overflow-hidden"
      style={{ background: 'rgba(0,8,24,0.8)', border: `1px solid ${cat.color}20` }}
    >
      <button onClick={() => setOpen(x => !x)} className="w-full text-left p-4 flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${cat.color}10`, border: `1px solid ${cat.color}30` }}>
          <CatIcon size={15} style={{ color: cat.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: `${cat.color}10`, color: cat.color, border: `1px solid ${cat.color}20` }}>
              {cat.label}
            </span>
            <span className="text-xs px-1.5 py-0.5 rounded-full"
              style={{ background: `${priorityColor}10`, color: priorityColor }}>
              {inn.priority}
            </span>
          </div>
          <h4 className="text-white font-bold text-sm leading-snug">{inn.title}</h4>
        </div>
        <div className="flex flex-col items-end shrink-0 ml-2 gap-1">
          <span className="text-xs font-black tabular-nums" style={{ color: '#4ade80' }}>
            +{inn.roi_improvement_pct}% ROI
          </span>
          {open ? <ChevronUp size={13} className="text-white/30" /> : <ChevronDown size={13} className="text-white/30" />}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              <div className="h-px" style={{ background: 'rgba(255,255,255,0.06)' }}/>
              <p className="text-white/60 text-sm leading-relaxed">{inn.description}</p>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg p-2 text-center"
                  style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.12)' }}>
                  <DollarSign size={11} className="mx-auto mb-0.5" style={{ color: '#fbbf24' }}/>
                  <div className="text-xs text-white/35">Cost</div>
                  <div className="text-xs font-black tabular-nums" style={{ color: '#fbbf24' }}>
                    {fmtUsd(inn.implementation_cost_usd)}
                  </div>
                </div>
                <div className="rounded-lg p-2 text-center"
                  style={{ background: 'rgba(96,165,250,0.07)', border: '1px solid rgba(96,165,250,0.12)' }}>
                  <Clock size={11} className="mx-auto mb-0.5" style={{ color: '#60a5fa' }}/>
                  <div className="text-xs text-white/35">Timeline</div>
                  <div className="text-xs font-black tabular-nums" style={{ color: '#60a5fa' }}>
                    {inn.timeline_months}m
                  </div>
                </div>
                <div className="rounded-lg p-2 text-center"
                  style={{ background: 'rgba(74,222,128,0.07)', border: '1px solid rgba(74,222,128,0.12)' }}>
                  <TrendingUp size={11} className="mx-auto mb-0.5" style={{ color: '#4ade80' }}/>
                  <div className="text-xs text-white/35">ROI+</div>
                  <div className="text-xs font-black tabular-nums" style={{ color: '#4ade80' }}>
                    +{inn.roi_improvement_pct}%
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function AILoadingState() {
  const steps = [
    'Analyzing technical specs…',
    'Evaluating automation level…',
    'Selecting innovation solutions…',
    'Calculating ROI and payback…',
    'Building implementation roadmap…',
  ];
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setStep(s => (s + 1) % steps.length), 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="relative mb-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="w-20 h-20 rounded-full border-2 border-transparent"
          style={{ borderTopColor: '#a78bfa', borderRightColor: '#00e6c8' }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <Brain size={28} style={{ color: '#a78bfa' }} />
          </motion.div>
        </div>
      </div>
      <h3 className="text-white font-bold text-lg mb-2">AI is analyzing the object</h3>
      <AnimatePresence mode="wait">
        <motion.p
          key={step}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3 }}
          className="text-white/50 text-sm"
        >
          {steps[step]}
        </motion.p>
      </AnimatePresence>
      <div className="w-48 h-1 rounded-full mt-6" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #00e6c8, #a78bfa)' }}
          animate={{ width: ['0%', '100%'] }}
          transition={{ duration: 6, ease: 'easeInOut' }}
        />
      </div>
    </div>
  );
}

function AITab({ object }: { object: FullObjectData }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [result, setResult] = useState<AIAnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAnalyze = async () => {
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch(`/api/ai/analyze/${object.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name_ru: object.name_ru,
          type: object.type,
          status: object.status,
          country: object.country,
          region: object.region,
          wear_pct: object.wear_pct,
          actual_capacity_m3_per_day: object.actual_capacity_m3_per_day,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as AIAnalysisResult;
      setResult(data);
      setStatus('done');
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Request failed');
      setStatus('error');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      {/* Idle state — big gradient button */}
      {status === 'idle' && (
        <div className="rounded-2xl p-8 flex flex-col items-center text-center"
          style={{ background: 'rgba(0,6,20,0.85)', border: '1px solid rgba(167,139,250,0.15)' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'linear-gradient(135deg,rgba(167,139,250,0.15),rgba(0,230,200,0.1))',
              border: '1px solid rgba(167,139,250,0.25)' }}>
            <Brain size={28} style={{ color: '#a78bfa' }} />
          </div>
          <h3 className="text-white font-bold text-xl mb-2">AI Innovation Analysis</h3>
          <p className="text-white/50 text-sm max-w-md leading-relaxed mb-6">
            AI will analyze the object's characteristics and recommend 5–7 specific technologies
            with ROI calculations, implementation costs, and timelines.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {Object.values(CATEGORY_ICONS).map(cfg => {
              const Icon = cfg.icon;
              return (
                <span key={cfg.label}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs"
                  style={{ background: `${cfg.color}10`, color: cfg.color, border: `1px solid ${cfg.color}20` }}>
                  <Icon size={10} />
                  {cfg.label}
                </span>
              );
            })}
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleAnalyze}
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-sm"
            style={{
              background: 'linear-gradient(135deg, #a78bfa, #00e6c8)',
              color: '#000',
              boxShadow: '0 6px 32px rgba(167,139,250,0.35)',
            }}
          >
            <Sparkles size={16} />
            Run AI Analysis
          </motion.button>
        </div>
      )}

      {/* Loading */}
      {status === 'loading' && (
        <div className="rounded-2xl"
          style={{ background: 'rgba(0,6,20,0.85)', border: '1px solid rgba(167,139,250,0.15)' }}>
          <AILoadingState />
        </div>
      )}

      {/* Error */}
      {status === 'error' && (
        <div className="rounded-2xl p-8 flex flex-col items-center text-center"
          style={{ background: 'rgba(0,6,20,0.85)', border: '1px solid rgba(255,77,109,0.2)' }}>
          <AlertCircle size={36} className="mb-3" style={{ color: '#ff4d6d' }} />
          <p className="text-white/60 text-sm mb-1">Analysis failed</p>
          <p className="text-white/30 text-xs mb-5">{errorMsg}</p>
          <button onClick={handleAnalyze}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: 'rgba(167,139,250,0.15)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.25)' }}>
            Retry
          </button>
        </div>
      )}

      {/* Results */}
      {status === 'done' && result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="space-y-5">
          {/* Executive summary */}
          <div className="rounded-2xl p-5"
            style={{ background: 'linear-gradient(135deg,rgba(167,139,250,0.06),rgba(0,230,200,0.04))',
              border: '1px solid rgba(167,139,250,0.15)' }}>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 size={14} style={{ color: '#4ade80' }} />
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#4ade80' }}>
                Analysis Complete
              </span>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">{result.summary}</p>
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl p-3 text-center"
              style={{ background: 'rgba(74,222,128,0.07)', border: '1px solid rgba(74,222,128,0.15)' }}>
              <TrendingUp size={13} className="mx-auto mb-1.5" style={{ color: '#4ade80' }}/>
              <div className="text-xs text-white/40 mb-0.5">Efficiency+</div>
              <div className="font-black tabular-nums" style={{ color: '#4ade80' }}>+{result.expected_efficiency_gain_pct}%</div>
            </div>
            <div className="rounded-xl p-3 text-center"
              style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.15)' }}>
              <DollarSign size={13} className="mx-auto mb-1.5" style={{ color: '#fbbf24' }}/>
              <div className="text-xs text-white/40 mb-0.5">Investment</div>
              <div className="font-black tabular-nums text-sm" style={{ color: '#fbbf24' }}>{fmtUsd(result.total_estimated_investment_usd)}</div>
            </div>
            <div className="rounded-xl p-3 text-center"
              style={{ background: 'rgba(167,139,250,0.07)', border: '1px solid rgba(167,139,250,0.15)' }}>
              <Sparkles size={13} className="mx-auto mb-1.5" style={{ color: '#a78bfa' }}/>
              <div className="text-xs text-white/40 mb-0.5">ROI+</div>
              <div className="font-black tabular-nums" style={{ color: '#a78bfa' }}>+{result.expected_roi_improvement_pct}%</div>
            </div>
          </div>

          {/* Innovations list */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={13} style={{ color: '#a78bfa' }} />
              <span className="text-white/50 text-xs font-semibold uppercase tracking-widest">
                Recommended Technologies ({result.innovations.length})
              </span>
            </div>
            <div className="space-y-2">
              {result.innovations.map((inn, idx) => (
                <InnovationCard key={inn.id} inn={inn} idx={idx} />
              ))}
            </div>
          </div>

          {/* Roadmap */}
          {result.implementation_roadmap && (
            <div className="rounded-2xl p-4"
              style={{ background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.15)' }}>
              <div className="flex items-center gap-2 mb-2">
                <Clock size={13} style={{ color: '#60a5fa' }}/>
                <span className="text-xs font-semibold uppercase tracking-widest text-white/40">Implementation Roadmap</span>
              </div>
              <p className="text-white/60 text-sm leading-relaxed">{result.implementation_roadmap}</p>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-white/20 text-xs">
              {new Date(result.analysis_timestamp).toLocaleString()}
            </span>
            <button onClick={handleAnalyze}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
              style={{ background: 'rgba(167,139,250,0.12)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.2)' }}>
              <Sparkles size={11}/>
              Re-analyze
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════════════════════════════

export default function ObjectDetailPage() {
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const id = params.id ?? '';

  const [activeTab, setActiveTab] = useState<TabId>('overview');

  // 1. Try local map first
  const localData: FullObjectData | undefined = (FULL_OBJECTS_MAP as Record<string, FullObjectData>)[id];

  // 2. Fetch from Supabase if not in local map
  const { data: apiData, isLoading } = useQuery<FullObjectData>({
    queryKey: ['object-full', id],
    queryFn: async () => {
      // Supabase water_resources item with sb-wr- prefix
      const sbMatch = id.match(/^sb-wr-(\d+)$/);
      if (sbMatch) {
        const { data, error } = await supabase
          .from('water_resources')
          .select('*')
          .eq('id', Number(sbMatch[1]))
          .single();
        if (error || !data) throw new Error('Not found');
        return mapSupabaseRow(data);
      }
      // Fallback: plain numeric ID — try Supabase directly
      if (/^\d+$/.test(id)) {
        const { data, error } = await supabase
          .from('water_resources')
          .select('*')
          .eq('id', Number(id))
          .single();
        if (error || !data) throw new Error('Not found');
        return mapSupabaseRow(data);
      }
      throw new Error('Not found');
    },
    enabled: !localData,
    retry: false,
  });

  const object: FullObjectData | undefined = localData ?? apiData;

  if (!localData && isLoading) return <LoadingSkeleton />;
  if (!object) return <NotFound onBack={() => setLocation('/hub')} />;

  return (
    <div className="min-h-screen"
      style={{ background: 'linear-gradient(180deg,#000818 0%,#001030 40%,#000c24 100%)' }}>

      {/* Hero */}
      <HeroSection object={object} />

      {/* Sticky Tabs */}
      <div className="sticky top-0 z-30 overflow-x-auto"
        style={{ background: 'rgba(0,6,20,0.92)', borderBottom: '1px solid rgba(0,230,200,0.1)', backdropFilter: 'blur(16px)' }}>
        <div className="max-w-5xl mx-auto px-5">
          <div className="flex gap-0.5 py-2 min-w-max">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              const isAI = tab.id === 'ai';
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm transition-all"
                  style={active
                    ? {
                      background: isAI ? 'linear-gradient(135deg,rgba(167,139,250,0.2),rgba(0,230,200,0.15))' : 'rgba(0,230,200,0.14)',
                      color: isAI ? '#a78bfa' : '#00e6c8',
                      border: `1px solid ${isAI ? 'rgba(167,139,250,0.3)' : 'rgba(0,230,200,0.25)'}`,
                    }
                    : { background: 'transparent', color: 'rgba(255,255,255,0.45)', border: '1px solid transparent' }
                  }
                >
                  <Icon size={13} />
                  <span className="font-semibold">{tab.label}</span>
                  {isAI && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full"
                      style={{ background: 'rgba(167,139,250,0.15)', color: '#a78bfa' }}>
                      🤖
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Digital Twin quick-link bar */}
      <div className="max-w-5xl mx-auto px-5 pt-4">
        <button
          onClick={() => setLocation(`/hub/object/${id}/twin`)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all w-full justify-center mb-2"
          style={{
            background: 'linear-gradient(135deg, rgba(0,230,200,0.1), rgba(0,128,255,0.1))',
            border: '1px solid rgba(0,230,200,0.25)',
            color: '#00e6c8',
          }}
        >
          <span>🌊</span>
          Открыть Цифровой двойник объекта
          <span style={{ color: 'rgba(255,255,255,0.3)' }}>→</span>
        </button>
      </div>

      {/* Tab content */}
      <div className="max-w-5xl mx-auto px-5 py-6 pb-12">
        <AnimatePresence mode="wait">
          {activeTab === 'overview'    && <OverviewTab   key="ov"  object={object} />}
          {activeTab === 'financials'  && <FinancialsTab key="fi"  object={object} />}
          {activeTab === 'technology'  && <TechnologyTab key="te"  object={object} />}
          {activeTab === 'operations'  && <OperationsTab key="op"  object={object} />}
          {activeTab === 'history'     && (
            <motion.div key="hist" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="rounded-2xl p-5" style={{ background: 'rgba(0,6,20,0.85)', border: '1px solid rgba(0,230,200,0.1)' }}>
                <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Clock size={14} style={{ color: '#00e6c8' }} />
                  История событий
                </h3>
                <ObjectHistoryTimeline objectId={object.id} />
              </div>
            </motion.div>
          )}
          {activeTab === 'monitoring'  && (
            <motion.div key="mon" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="rounded-2xl p-5" style={{ background: 'rgba(0,6,20,0.85)', border: '1px solid rgba(0,230,200,0.1)' }}>
                <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Activity size={14} style={{ color: '#00e6c8' }} />
                  Мониторинг в реальном времени
                </h3>
                <MonitoringPanel objectId={object.id} />
              </div>
            </motion.div>
          )}
          {activeTab === 'news'        && (
            <motion.div key="news" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="rounded-2xl p-5" style={{ background: 'rgba(0,6,20,0.85)', border: '1px solid rgba(0,230,200,0.1)' }}>
                <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Newspaper size={14} style={{ color: '#00e6c8' }} />
                  Водные новости
                </h3>
                <NewsPanel objectId={object.id} />
              </div>
            </motion.div>
          )}
          {activeTab === 'climate'     && (
            <motion.div key="climate" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <ClimatePanel
                lat={object.coordinates?.lat}
                lon={object.coordinates?.lng}
                objectType={object.type}
                objectName={object.name_ru || object.name_en || ''}
              />
            </motion.div>
          )}
          {activeTab === 'ai'          && <PremiumOverlay title="AI Аналитика"><AITab key="ai" object={object} /></PremiumOverlay>}
        </AnimatePresence>
      </div>
    </div>
  );
}
