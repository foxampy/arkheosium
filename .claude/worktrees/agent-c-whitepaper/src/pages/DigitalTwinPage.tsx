// ═══════════════════════════════════════════════════════════════
//  DigitalTwinPage — 3D water object viewer + water balance sim
//  Route: /hub/object/:id/twin
// ═══════════════════════════════════════════════════════════════

import { useState, useRef, useEffect, useMemo } from 'react';
import { useParams, useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, Droplets, Zap, TrendingUp, TrendingDown,
  BarChart3, Activity, AlertTriangle, RefreshCw, Play, Pause,
  Thermometer, Wind, CloudRain, Waves, Mountain, Gauge,
  Settings2, Eye, RotateCcw, Maximize2
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useWaterResource } from '@/hooks/useWaterResources';
import { localizedField } from '@/lib/i18n-utils';

// ─── Types ─────────────────────────────────────────────────────

interface WaterBalanceState {
  storageM3: number;        // current storage volume m³
  capacityM3: number;       // max capacity
  inflowM3s: number;        // inflow m³/s
  outflowM3s: number;       // outflow m³/s
  evapMm: number;           // evaporation mm/day
  precipMm: number;         // precipitation mm/day
  surfaceKm2: number;       // surface area km²
  levelPct: number;         // fill %
}

interface SimPoint {
  month: string;
  storage: number;
  inflow: number;
  outflow: number;
  level: number;
}

// ─── Historical simulation data generator ──────────────────────

function generateSimData(capacityM3: number, baseInflow: number): SimPoint[] {
  const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
                  'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
  // Seasonal multipliers for Central Asia / Uzbekistan
  const seasonMult = [0.4, 0.5, 1.3, 1.8, 1.4, 0.8, 0.5, 0.4, 0.6, 0.9, 0.7, 0.5];
  let storage = capacityM3 * 0.55;
  return months.map((m, i) => {
    const inflow = baseInflow * seasonMult[i] * (0.85 + Math.random() * 0.3);
    const outflow = baseInflow * 0.9 * (0.8 + Math.random() * 0.4);
    storage = Math.max(0, Math.min(capacityM3, storage + (inflow - outflow) * 2.6e6));
    return {
      month: m,
      storage: Math.round(storage / 1e6),
      inflow: Math.round(inflow),
      outflow: Math.round(outflow),
      level: Math.round((storage / capacityM3) * 100),
    };
  });
}

// ─── 3D Canvas — SVG-based pseudo-3D dam/reservoir renderer ────

type ObjectType3D = 'dam' | 'reservoir' | 'canal' | 'pumping_station' | 'treatment_plant' | 'river' | 'lake' | 'default';

function WaterObject3D({
  objectType, waterLevel, color, animated
}: {
  objectType: ObjectType3D;
  waterLevel: number;     // 0–100 percent
  color: string;
  animated: boolean;
}) {
  const wl = Math.max(5, Math.min(95, waterLevel));

  if (objectType === 'dam' || objectType === 'reservoir') {
    return <DamScene waterLevel={wl} color={color} animated={animated} />;
  }
  if (objectType === 'canal') {
    return <CanalScene waterLevel={wl} color={color} animated={animated} />;
  }
  if (objectType === 'pumping_station') {
    return <PumpScene color={color} animated={animated} />;
  }
  if (objectType === 'treatment_plant') {
    return <TreatmentScene color={color} animated={animated} />;
  }
  return <ReservoirScene waterLevel={wl} color={color} animated={animated} />;
}

// SVG Dam Scene
function DamScene({ waterLevel, color, animated }: { waterLevel: number; color: string; animated: boolean }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!animated) return;
    const id = setInterval(() => setTick(t => t + 1), 80);
    return () => clearInterval(id);
  }, [animated]);

  const waterY = 280 - (waterLevel / 100) * 200;
  const waveOffset = (tick * 2) % 60;

  return (
    <svg viewBox="0 0 600 360" className="w-full h-full" style={{ filter: 'drop-shadow(0 4px 24px rgba(0,230,200,0.15))' }}>
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a0e1a" />
          <stop offset="100%" stopColor="#0d1f3c" />
        </linearGradient>
        <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.9" />
          <stop offset="100%" stopColor={color} stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id="concreteGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="50%" stopColor="#475569" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
        <linearGradient id="mountainGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e3a5f" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <clipPath id="waterClip">
          <rect x="0" y={waterY} width="600" height={360 - waterY} />
        </clipPath>
      </defs>

      {/* Sky */}
      <rect width="600" height="360" fill="url(#skyGrad)" />

      {/* Stars */}
      {[...Array(20)].map((_, i) => (
        <circle key={i} cx={30 + i * 28} cy={20 + (i % 4) * 18} r="1"
          fill="white" opacity={0.3 + (i % 3) * 0.2} />
      ))}

      {/* Mountains */}
      <polygon points="0,280 80,120 160,200 240,90 320,170 400,80 480,160 560,100 600,180 600,280"
        fill="url(#mountainGrad)" opacity="0.8" />
      <polygon points="0,280 60,150 130,220 200,110 270,190 340,100 410,165 500,130 600,200 600,280"
        fill="#111827" opacity="0.6" />

      {/* Upstream water body */}
      <rect x="0" y={waterY} width="220" height={360 - waterY}
        fill="url(#waterGrad)" />
      {/* Water waves */}
      {animated && (
        <path d={`M ${-waveOffset} ${waterY + 8} ${[...Array(12)].map((_, i) =>
          `Q ${-waveOffset + i * 60 + 15} ${waterY} ${-waveOffset + i * 60 + 30} ${waterY + 8}`
        ).join(' ')}`}
          fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
      )}

      {/* Dam body — trapezoidal */}
      <polygon points="218,80 240,80 260,360 200,360" fill="url(#concreteGrad)" />
      <polygon points="238,80 260,80 280,360 220,360" fill="#374151" />
      {/* Dam top walkway */}
      <rect x="216" y="76" width="48" height="8" rx="2" fill="#6b7280" />
      {/* Dam details */}
      {[0, 1, 2, 3, 4].map(i => (
        <rect key={i} x="228" y={100 + i * 52} width="6" height="30" rx="1"
          fill="rgba(255,255,255,0.1)" />
      ))}
      {/* Spillway */}
      <rect x="254" y="260" width="8" height="100" fill="#1e40af" opacity="0.6" />
      {animated && (
        <ellipse cx="258" cy={waterY + 4} rx="6" ry="3"
          fill={color} opacity="0.8" />
      )}

      {/* Downstream water */}
      <rect x="268" y="310" width="332" height="50"
        fill="url(#waterGrad)" opacity="0.5" />

      {/* Water level indicator */}
      <line x1="190" y1={waterY} x2="210" y2={waterY}
        stroke={color} strokeWidth="2" strokeDasharray="4,2" />
      <rect x="140" y={waterY - 12} width="46" height="20" rx="4"
        fill="rgba(0,0,0,0.6)" />
      <text x="163" y={waterY + 4} textAnchor="middle" fill={color}
        fontSize="10" fontWeight="bold">{waterLevel}%</text>

      {/* Grid overlay */}
      <line x1="0" y1="320" x2="600" y2="320" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

      {/* Turbine indicators */}
      <circle cx="274" cy="345" r="12" fill="none" stroke={color} strokeWidth="2" opacity="0.6" />
      <circle cx="300" cy="345" r="12" fill="none" stroke={color} strokeWidth="2" opacity="0.5" />
      <text x="287" y="374" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9">ГЭС</text>
    </svg>
  );
}

// SVG Reservoir/Lake Scene
function ReservoirScene({ waterLevel, color, animated }: { waterLevel: number; color: string; animated: boolean }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!animated) return;
    const id = setInterval(() => setTick(t => t + 1), 100);
    return () => clearInterval(id);
  }, [animated]);

  const wavePct = (tick * 1.5) % 100;

  return (
    <svg viewBox="0 0 600 360" className="w-full h-full" style={{ filter: 'drop-shadow(0 4px 24px rgba(0,180,255,0.15))' }}>
      <defs>
        <radialGradient id="waterRadial" cx="50%" cy="40%">
          <stop offset="0%" stopColor={color} stopOpacity="0.7" />
          <stop offset="100%" stopColor={color} stopOpacity="0.3" />
        </radialGradient>
      </defs>
      <rect width="600" height="360" fill="#0a0e1a" />
      {/* Terrain */}
      <path d="M0,360 L0,200 Q50,160 120,180 Q200,200 280,140 Q360,80 440,160 Q520,200 600,170 L600,360Z"
        fill="#1e293b" />
      {/* Water body */}
      <ellipse cx="300" cy={320 - (waterLevel / 100) * 120} rx={180 + waterLevel * 0.8}
        ry={60 + waterLevel * 0.4}
        fill="url(#waterRadial)" />
      {/* Depth shading */}
      <ellipse cx="300" cy={320 - (waterLevel / 100) * 120} rx={80} ry={25}
        fill={color} opacity="0.2" />
      {/* Animated rings */}
      {animated && [0, 1, 2].map(i => (
        <ellipse key={i} cx="300" cy={310 - (waterLevel / 100) * 110}
          rx={20 + ((wavePct + i * 33) % 100) * 1.6}
          ry={8 + ((wavePct + i * 33) % 100) * 0.5}
          fill="none" stroke="rgba(255,255,255,0.15)"
          strokeWidth={1.5 - i * 0.4} opacity={0.8 - i * 0.25} />
      ))}
      {/* Shore line */}
      <text x="300" y="200" textAnchor="middle" fill="rgba(255,255,255,0.3)"
        fontSize="11">{waterLevel}% заполнено</text>
    </svg>
  );
}

// SVG Canal Scene
function CanalScene({ waterLevel, color, animated }: { waterLevel: number; color: string; animated: boolean }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!animated) return;
    const id = setInterval(() => setTick(t => t + 1), 60);
    return () => clearInterval(id);
  }, [animated]);
  const flow = (tick * 3) % 600;

  return (
    <svg viewBox="0 0 600 360" className="w-full h-full">
      <rect width="600" height="360" fill="#0a0e1a" />
      {/* Ground */}
      <rect x="0" y="160" width="600" height="200" fill="#1e293b" />
      {/* Canal walls */}
      <polygon points="0,160 80,160 140,260 0,260" fill="#374151" />
      <polygon points="600,160 520,160 460,260 600,260" fill="#374151" />
      {/* Water */}
      <rect x="80" y={260 - waterLevel * 0.8}
        width="440" height={waterLevel * 0.8}
        fill={color} opacity="0.7" />
      {/* Flow animation */}
      {animated && [-2, -1, 0, 1, 2, 3].map(i => (
        <line key={i}
          x1={(flow + i * 100) % 700 - 50} y1="230"
          x2={(flow + i * 100 + 40) % 700 - 50} y2="230"
          stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" />
      ))}
    </svg>
  );
}

// SVG Pump Scene
function PumpScene({ color, animated }: { color: string; animated: boolean }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!animated) return;
    const id = setInterval(() => setTick(t => t + 1), 50);
    return () => clearInterval(id);
  }, [animated]);
  const angle = (tick * 6) % 360;

  return (
    <svg viewBox="0 0 600 360" className="w-full h-full">
      <rect width="600" height="360" fill="#0a0e1a" />
      {/* Building */}
      <rect x="160" y="100" width="280" height="220" rx="8" fill="#1e293b" stroke="#374151" strokeWidth="2" />
      {/* Pump circle */}
      <circle cx="300" cy="220" r="80" fill="#0f172a" stroke={color} strokeWidth="2" />
      {/* Rotating blades */}
      {[0, 90, 180, 270].map(a => (
        <line key={a}
          x1="300" y1="220"
          x2={300 + 70 * Math.cos(((a + angle) * Math.PI) / 180)}
          y2={220 + 70 * Math.sin(((a + angle) * Math.PI) / 180)}
          stroke={color} strokeWidth="4" strokeLinecap="round" opacity="0.8" />
      ))}
      <circle cx="300" cy="220" r="12" fill={color} opacity="0.9" />
      <text x="300" y="330" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="12">Насосная станция</text>
    </svg>
  );
}

// SVG Treatment Scene
function TreatmentScene({ color, animated }: { color: string; animated: boolean }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!animated) return;
    const id = setInterval(() => setTick(t => t + 1), 120);
    return () => clearInterval(id);
  }, [animated]);
  const bubble = tick % 30;

  return (
    <svg viewBox="0 0 600 360" className="w-full h-full">
      <rect width="600" height="360" fill="#0a0e1a" />
      {/* Tank 1 */}
      <rect x="40" y="80" width="140" height="200" rx="8" fill="#1e293b" stroke="#374151" strokeWidth="2" />
      <rect x="50" y={280 - 120} width="120" height="120" fill={color} opacity="0.4" />
      {/* Tank 2 */}
      <rect x="230" y="80" width="140" height="200" rx="8" fill="#1e293b" stroke="#374151" strokeWidth="2" />
      <rect x="240" y={280 - 80} width="120" height="80" fill="#10b981" opacity="0.4" />
      {/* Tank 3 */}
      <rect x="420" y="80" width="140" height="200" rx="8" fill="#1e293b" stroke="#374151" strokeWidth="2" />
      <rect x="430" y={280 - 50} width="120" height="50" fill="#22c55e" opacity="0.5" />
      {/* Pipes */}
      <path d="M180,180 Q205,180 230,180" fill="none" stroke="#4b5563" strokeWidth="8" />
      <path d="M370,180 Q395,180 420,180" fill="none" stroke="#4b5563" strokeWidth="8" />
      {/* Bubbles */}
      {animated && [0, 1, 2].map(i => (
        <circle key={i} cx={110 + i * 20} cy={280 - (bubble * 4 + i * 10) % 140}
          r="4" fill="rgba(255,255,255,0.3)" />
      ))}
      <text x="110" y="310" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="10">Сырая</text>
      <text x="300" y="310" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="10">Обработка</text>
      <text x="490" y="310" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="10">Чистая</text>
    </svg>
  );
}

// ─── Metric Card ────────────────────────────────────────────────

function MetricCard({ icon: Icon, label, value, unit, color, trend }:
  { icon: any; label: string; value: string | number; unit?: string; color: string; trend?: 'up' | 'down' | 'neutral' }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: 'rgba(0,8,24,0.7)', border: `1px solid ${color}20`, backdropFilter: 'blur(12px)' }}>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
          <Icon size={15} style={{ color }} />
        </div>
        <span className="text-white/40 text-xs">{label}</span>
        {trend === 'up' && <TrendingUp size={12} className="text-green-400 ml-auto" />}
        {trend === 'down' && <TrendingDown size={12} className="text-red-400 ml-auto" />}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-white font-bold text-xl">{value}</span>
        {unit && <span className="text-white/40 text-xs">{unit}</span>}
      </div>
    </div>
  );
}

// ─── Water Balance Gauge ────────────────────────────────────────

function WaterGauge({ level, color }: { level: number; color: string }) {
  const r = 64, cx = 80, cy = 80;
  const circ = 2 * Math.PI * r;
  const filled = (level / 100) * circ * 0.75; // 270° arc
  const dash = `${filled} ${circ}`;
  const rot = -225;

  return (
    <div className="relative flex flex-col items-center">
      <svg width="160" height="160" viewBox="0 0 160 160">
        <circle cx={cx} cy={cy} r={r} fill="none"
          stroke="rgba(255,255,255,0.06)" strokeWidth="12"
          strokeDasharray={`${circ * 0.75} ${circ}`}
          strokeDashoffset="0"
          strokeLinecap="round"
          transform={`rotate(${rot} ${cx} ${cy})`} />
        <circle cx={cx} cy={cy} r={r} fill="none"
          stroke={color} strokeWidth="12"
          strokeDasharray={dash}
          strokeDashoffset="0"
          strokeLinecap="round"
          transform={`rotate(${rot} ${cx} ${cy})`}
          style={{ transition: 'stroke-dasharray 0.8s ease', filter: `drop-shadow(0 0 6px ${color}80)` }} />
        <text x={cx} y={cy - 6} textAnchor="middle" fill="white"
          fontSize="26" fontWeight="bold">{level}%</text>
        <text x={cx} y={cy + 14} textAnchor="middle"
          fill="rgba(255,255,255,0.4)" fontSize="10">заполнено</text>
      </svg>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────

export default function DigitalTwinPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { t, i18n } = useTranslation();
  const [animated, setAnimated] = useState(true);
  const [viewMode, setViewMode] = useState<'3d' | 'balance' | 'forecast'>('3d');

  const objId = parseInt(id ?? '0', 10);
  const { data: obj, isLoading } = useWaterResource(objId);

  // Derive simulation parameters from real DB data
  const capacity = useMemo(() => {
    if (!obj) return 1e9;
    // Rough capacity from water_output_m3 * 30 days, or 1 billion default
    return obj.water_output_m3 ? obj.water_output_m3 * 30 : 1e9;
  }, [obj]);

  const baseInflow = useMemo(() => obj?.water_output_m3 ?? 350, [obj]);

  const simData = useMemo(() => generateSimData(capacity, baseInflow), [capacity, baseInflow]);

  const currentMonth = new Date().getMonth();
  const currentSim = simData[currentMonth];
  const waterLevel = currentSim?.level ?? 60;

  const typeColors: Record<string, string> = {
    dam: '#818cf8', reservoir: '#60a5fa', irrigation_canal: '#38bdf8',
    pumping_station: '#00e6c8', water_treatment_facility: '#10b981',
    river: '#3b82f6', lake: '#14b8a6', mountain_lake: '#34d399',
  };

  const objectType3D = (obj?.object_type as ObjectType3D) ?? 'default';
  const color = typeColors[obj?.object_type ?? ''] ?? '#00e6c8';

  const balance: WaterBalanceState = {
    storageM3: currentSim ? currentSim.storage * 1e6 : capacity * 0.6,
    capacityM3: capacity,
    inflowM3s: currentSim?.inflow ?? baseInflow,
    outflowM3s: currentSim?.outflow ?? baseInflow * 0.9,
    evapMm: 3.2,
    precipMm: 12,
    surfaceKm2: capacity / 1e8,
    levelPct: waterLevel,
  };

  const name = obj ? localizedField(obj as any, 'name') : '—';
  const description = obj ? localizedField(obj as any, 'description') : '';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#000818' }}>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin mx-auto mb-4"
            style={{ borderColor: `${color}60`, borderTopColor: color }} />
          <p className="text-white/40">Загрузка цифрового двойника...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#000818', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ─── Header ───────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 px-4 py-3 flex items-center gap-3"
        style={{ background: 'rgba(0,8,24,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={() => setLocation(`/hub/object/${id}`)}
          className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors text-sm">
          <ChevronLeft size={16} /> Назад
        </button>
        <div className="h-4 w-px bg-white/10" />
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
            <Waves size={12} style={{ color }} />
          </div>
          <span className="text-white font-bold text-sm truncate">{name}</span>
          <span className="text-white/30 text-xs shrink-0">Цифровой двойник</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setAnimated(a => !a)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs transition-colors"
            style={{ background: animated ? `${color}20` : 'rgba(255,255,255,0.05)', color: animated ? color : 'rgba(255,255,255,0.4)' }}>
            {animated ? <Pause size={12} /> : <Play size={12} />}
            {animated ? 'Пауза' : 'Анимация'}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* ─── View Tabs ─────────────────────────────────────── */}
        <div className="flex gap-2 mb-6">
          {(['3d', 'balance', 'forecast'] as const).map(v => (
            <button key={v} onClick={() => setViewMode(v)}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{
                background: viewMode === v ? `${color}20` : 'rgba(255,255,255,0.04)',
                color: viewMode === v ? color : 'rgba(255,255,255,0.4)',
                border: `1px solid ${viewMode === v ? `${color}30` : 'rgba(255,255,255,0.06)'}`,
              }}>
              {v === '3d' ? '3D Модель' : v === 'balance' ? 'Водный баланс' : 'Прогноз'}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {viewMode === '3d' && (
            <motion.div key="3d" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* 3D View */}
                <div className="lg:col-span-2 rounded-3xl overflow-hidden"
                  style={{ background: 'rgba(0,8,24,0.8)', border: `1px solid ${color}20`, minHeight: 360 }}>
                  <div className="p-3 flex items-center justify-between" style={{ borderBottom: `1px solid rgba(255,255,255,0.04)` }}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: color }} />
                      <span className="text-white/40 text-xs">Live симуляция</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: `${color}15`, color }}>
                        {obj?.object_type ?? 'объект'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}>
                        {obj?.status ?? '—'}
                      </span>
                    </div>
                  </div>
                  <div style={{ height: 340 }}>
                    <WaterObject3D objectType={objectType3D} waterLevel={waterLevel} color={color} animated={animated} />
                  </div>
                </div>

                {/* Right metrics */}
                <div className="flex flex-col gap-4">
                  <WaterGauge level={waterLevel} color={color} />

                  <MetricCard icon={Droplets} label="Приток" value={balance.inflowM3s.toFixed(0)} unit="м³/с" color={color} trend="up" />
                  <MetricCard icon={TrendingDown} label="Отток" value={balance.outflowM3s.toFixed(0)} unit="м³/с" color="#f97316" />
                  <MetricCard icon={Gauge} label="Объём" value={(balance.storageM3 / 1e6).toFixed(0)} unit="млн м³" color="#a78bfa" />
                  {obj?.employees_count && (
                    <MetricCard icon={Activity} label="Сотрудников" value={obj.employees_count} color="#fbbf24" />
                  )}
                  {obj?.power_output_mw && (
                    <MetricCard icon={Zap} label="Мощность" value={obj.power_output_mw} unit="МВт" color="#22d3ee" />
                  )}
                </div>
              </div>

              {/* Description */}
              {description && (
                <div className="mt-6 p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-white/60 text-sm leading-relaxed">{description}</p>
                </div>
              )}
            </motion.div>
          )}

          {viewMode === 'balance' && (
            <motion.div key="balance" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <MetricCard icon={CloudRain} label="Осадки" value="12" unit="мм/день" color="#3b82f6" />
                <MetricCard icon={Thermometer} label="Испарение" value="3.2" unit="мм/день" color="#f97316" />
                <MetricCard icon={Waves} label="Площадь" value={(capacity / 1e8).toFixed(1)} unit="км²" color={color} />
                <MetricCard icon={Mountain} label="Ёмкость" value={(capacity / 1e9).toFixed(2)} unit="млрд м³" color="#a78bfa" />
              </div>

              {/* Mass balance diagram */}
              <div className="rounded-3xl p-6 mb-6"
                style={{ background: 'rgba(0,8,24,0.7)', border: `1px solid ${color}15` }}>
                <h3 className="text-white/70 text-sm font-semibold mb-6 flex items-center gap-2">
                  <BarChart3 size={14} style={{ color }} /> Водный баланс (годовой)
                </h3>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={simData}>
                    <defs>
                      <linearGradient id="inflowFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={color} stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="outflowFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f97316" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#f97316" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="month" stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 11 }} />
                    <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: '#0d1117', border: `1px solid ${color}30`, borderRadius: 12, fontSize: 12 }} />
                    <Legend />
                    <Area type="monotone" dataKey="inflow" name="Приток м³/с" stroke={color} fill="url(#inflowFill)" strokeWidth={2} />
                    <Area type="monotone" dataKey="outflow" name="Отток м³/с" stroke="#f97316" fill="url(#outflowFill)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Storage chart */}
              <div className="rounded-3xl p-6"
                style={{ background: 'rgba(0,8,24,0.7)', border: `1px solid rgba(255,255,255,0.06)` }}>
                <h3 className="text-white/70 text-sm font-semibold mb-6 flex items-center gap-2">
                  <Waves size={14} className="text-blue-400" /> Уровень наполнения (%)
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={simData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="month" stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }} />
                    <Line type="monotone" dataKey="level" name="Заполнение %" stroke="#a78bfa" strokeWidth={2.5} dot={false} />
                    {/* Critical level reference */}
                    <Line type="monotone" data={simData.map(d => ({ ...d, critical: 30 }))} dataKey="critical"
                      stroke="#ef4444" strokeWidth={1} strokeDasharray="6 3" dot={false} name="Критический уровень" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {viewMode === 'forecast' && (
            <motion.div key="forecast" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="rounded-3xl p-6 mb-6"
                style={{ background: 'rgba(0,8,24,0.7)', border: `1px solid rgba(255,255,255,0.06)` }}>
                <h3 className="text-white/70 text-sm font-semibold mb-2 flex items-center gap-2">
                  <TrendingUp size={14} className="text-green-400" /> Прогноз на 12 месяцев
                </h3>
                <p className="text-white/30 text-xs mb-6">Модель учитывает сезонность, климатические тренды и исторические данные</p>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={simData}>
                    <defs>
                      <linearGradient id="forecastBar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={0.9} />
                        <stop offset="100%" stopColor={color} stopOpacity={0.3} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="month" stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 11 }} />
                    <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: '#0d1117', border: `1px solid ${color}30`, borderRadius: 12, fontSize: 12 }} />
                    <Bar dataKey="storage" name="Объём млн м³" fill="url(#forecastBar)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Риск засухи', value: waterLevel < 40 ? 'Высокий' : waterLevel < 60 ? 'Средний' : 'Низкий',
                    color: waterLevel < 40 ? '#ef4444' : waterLevel < 60 ? '#f97316' : '#22c55e', icon: AlertTriangle },
                  { label: 'Тренд уровня', value: simData[11].level > simData[0].level ? '+' + (simData[11].level - simData[0].level) + '%' : (simData[11].level - simData[0].level) + '%',
                    color: simData[11].level > simData[0].level ? '#22c55e' : '#ef4444', icon: TrendingUp },
                  { label: 'Ожид. приток (Авг)', value: simData[7].inflow + ' м³/с',
                    color: '#a78bfa', icon: Droplets },
                ].map(card => (
                  <div key={card.label} className="rounded-2xl p-5"
                    style={{ background: 'rgba(0,8,24,0.7)', border: `1px solid ${card.color}20` }}>
                    <div className="flex items-center gap-2 mb-3">
                      <card.icon size={14} style={{ color: card.color }} />
                      <span className="text-white/50 text-xs">{card.label}</span>
                    </div>
                    <span className="text-xl font-bold" style={{ color: card.color }}>{card.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
