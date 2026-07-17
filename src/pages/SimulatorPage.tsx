/**
 * SimulatorPage — «Живая модель региона»
 * Интерактивная модель водной инфраструктуры на реальной карте местности (maplibre).
 * Никаких ползунков: пользователь кликает объекты / проекты / инициативы на карте и
 * модернизирует их. В ответ вживую растут индексы Благополучия, Экологии и Водного
 * баланса, а система подсказывает, какие объекты и ресурсы обновить следующими.
 * Модель иллюстративная. Тема — Аральский бассейн и Узбекистан.
 */

import { useState, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import {
  ArrowLeft, Gauge, Leaf, Droplets, TrendingUp, Coins, Zap,
  Sparkles, RotateCcw, ArrowUpCircle, Lightbulb, CheckCircle2,
  Lock, Waves, AlertTriangle, Target,
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, YAxis, Tooltip as RTooltip,
} from 'recharts';
import { WaterMap } from '@/components/map/WaterMap';
import type { MapMarker } from '@/components/map/types';

// ── Palette ──────────────────────────────────────────────────────────────────

const C = {
  cyan: '#00e6c8',
  violet: '#a78bfa',
  green: '#4ade80',
  amber: '#fbbf24',
  red: '#f87171',
  sky: '#38bdf8',
};

// ── Tiers ────────────────────────────────────────────────────────────────────

const TIERS = [
  { label: 'Критическое', color: C.red },
  { label: 'Устаревшее', color: C.amber },
  { label: 'Модернизировано', color: C.sky },
  { label: 'Оптимальное', color: C.green },
] as const;
const MAX_TIER = TIERS.length - 1; // 3

// ── Node model ───────────────────────────────────────────────────────────────

type NodeKind =
  | 'dam' | 'reservoir' | 'irrigation_canal' | 'pumping_station'
  | 'water_treatment_facility' | 'river' | 'lake_crisis' | 'mountain_lake';

interface ModelNode {
  id: string;
  name: string;
  kind: NodeKind;
  typeLabel: string;
  zone: string;
  lat: number;
  lng: number;
  tier0: number;          // стартовый уровень 0..3
  wb: number;             // прирост благополучия за уровень
  eco: number;            // прирост экологии за уровень
  water: number;          // прирост водного баланса за уровень
  baseCost: number;       // стоимость первого апгрейда (растёт с уровнем)
}

// Реальные координаты по бассейну Арала и Узбекистану
const NODES: ModelNode[] = [
  { id: 'kokaral', name: 'Дамба Кокарал (Северный Арал)', kind: 'dam', typeLabel: 'Дамба', zone: 'Приаралье', lat: 46.05, lng: 60.65, tier0: 1, wb: 3, eco: 4, water: 4, baseCost: 22 },
  { id: 'muynak', name: 'Муйнак — бывший порт', kind: 'lake_crisis', typeLabel: 'Кризисная зона', zone: 'Приаралье', lat: 43.77, lng: 59.02, tier0: 0, wb: 2, eco: 4, water: 2, baseCost: 18 },
  { id: 'delta-canal', name: 'Канал дельты Амударьи', kind: 'irrigation_canal', typeLabel: 'Ирриг. канал', zone: 'Приаралье', lat: 42.90, lng: 59.60, tier0: 0, wb: 3, eco: 3, water: 4, baseCost: 16 },
  { id: 'nukus-wtf', name: 'Очистные Нукуса', kind: 'water_treatment_facility', typeLabel: 'Очистные', zone: 'Каракалпакстан', lat: 42.46, lng: 59.61, tier0: 1, wb: 4, eco: 3, water: 2, baseCost: 14 },
  { id: 'tuyamuyun', name: 'Водохранилище Туямуюн', kind: 'reservoir', typeLabel: 'Водохранилище', zone: 'Хорезм', lat: 41.20, lng: 61.40, tier0: 1, wb: 3, eco: 2, water: 4, baseCost: 20 },
  { id: 'khorezm-ps', name: 'Насосная станция Хорезма', kind: 'pumping_station', typeLabel: 'Насосная станция', zone: 'Хорезм', lat: 41.55, lng: 60.63, tier0: 1, wb: 3, eco: 1, water: 3, baseCost: 12 },
  { id: 'amu-bukhara', name: 'Аму-Бухарский канал', kind: 'irrigation_canal', typeLabel: 'Ирриг. канал', zone: 'Бухара', lat: 40.00, lng: 63.50, tier0: 1, wb: 3, eco: 2, water: 3, baseCost: 15 },
  { id: 'bukhara-wtf', name: 'Очистные Бухары', kind: 'water_treatment_facility', typeLabel: 'Очистные', zone: 'Бухара', lat: 39.77, lng: 64.42, tier0: 1, wb: 4, eco: 2, water: 1, baseCost: 13 },
  { id: 'kattakurgan', name: 'Водохранилище Каттакурган', kind: 'reservoir', typeLabel: 'Водохранилище', zone: 'Самарканд', lat: 39.90, lng: 66.25, tier0: 2, wb: 2, eco: 2, water: 3, baseCost: 18 },
  { id: 'charvak', name: 'Чарвакское водохранилище', kind: 'reservoir', typeLabel: 'Водохранилище', zone: 'Ташкент', lat: 41.62, lng: 70.05, tier0: 2, wb: 3, eco: 2, water: 3, baseCost: 19 },
  { id: 'tashkent-ps', name: 'Водоузел Ташкента', kind: 'pumping_station', typeLabel: 'Насосная станция', zone: 'Ташкент', lat: 41.31, lng: 69.28, tier0: 2, wb: 4, eco: 1, water: 2, baseCost: 14 },
  { id: 'syrdarya', name: 'Река Сырдарья', kind: 'river', typeLabel: 'Река', zone: 'Сырдарья', lat: 40.50, lng: 68.70, tier0: 1, wb: 2, eco: 3, water: 4, baseCost: 17 },
  { id: 'fedchenko', name: 'Ледник Федченко (исток)', kind: 'mountain_lake', typeLabel: 'Ледник / исток', zone: 'Памир', lat: 38.70, lng: 72.20, tier0: 1, wb: 1, eco: 4, water: 4, baseCost: 21 },
];

// ── Initiatives (region-wide, unlock by prerequisites) ───────────────────────

interface Initiative {
  id: string;
  name: string;
  desc: string;
  requires: string[];    // node ids that must be tier>=2
  cost: number;
  wb: number; eco: number; water: number;
  lat: number; lng: number;
}

const INITIATIVES: Initiative[] = [
  {
    id: 'delta-restore', name: 'Восстановление дельты Амударьи',
    desc: 'Обводнение дельты, водно-болотные угодья, возврат рыболовства в Приаралье.',
    requires: ['delta-canal', 'nukus-wtf', 'muynak'], cost: 40,
    wb: 6, eco: 10, water: 6, lat: 43.3, lng: 59.3,
  },
  {
    id: 'green-belt', name: 'Зелёный пояс Приаралья',
    desc: 'Саксауловые лесопосадки на осушённом дне — против пыле-солевых бурь.',
    requires: ['kokaral', 'delta-canal'], cost: 30,
    wb: 5, eco: 9, water: 3, lat: 45.0, lng: 60.0,
  },
  {
    id: 'smart-metering', name: 'Умный водоучёт ЦА',
    desc: 'IoT-телеметрия и цифровой двойник по всем каналам и насосным станциям.',
    requires: ['khorezm-ps', 'tashkent-ps', 'amu-bukhara'], cost: 34,
    wb: 8, eco: 4, water: 7, lat: 40.8, lng: 65.0,
  },
];

// ── Kind → label ─────────────────────────────────────────────────────────────

const KIND_LABEL: Record<NodeKind, string> = {
  dam: 'Дамба', reservoir: 'Водохранилище', irrigation_canal: 'Канал',
  pumping_station: 'Насосная', water_treatment_facility: 'Очистные',
  river: 'Река', lake_crisis: 'Кризис', mountain_lake: 'Ледник',
};

// ── Index card ───────────────────────────────────────────────────────────────

function IndexCard({
  icon, label, value, color, delta,
}: { icon: React.ReactNode; label: string; value: number; color: string; delta: number }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex items-center justify-between mb-2">
        <span className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-white/50">
          <span style={{ color }}>{icon}</span>{label}
        </span>
        <AnimatePresence mode="popLayout">
          {delta !== 0 && (
            <motion.span
              key={value}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              className="text-[11px] font-semibold" style={{ color: delta > 0 ? C.green : C.red }}
            >
              {delta > 0 ? '+' : ''}{delta.toFixed(0)}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <div className="flex items-end gap-1 mb-2">
        <motion.span key={value} initial={{ scale: 0.85, opacity: 0.5 }} animate={{ scale: 1, opacity: 1 }}
          className="text-3xl font-bold tabular-nums" style={{ color }}>{Math.round(value)}</motion.span>
        <span className="text-white/40 text-sm mb-1">/ 100</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <motion.div className="h-full rounded-full" style={{ background: color }}
          animate={{ width: `${Math.min(100, value)}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

const START_BUDGET = 90;

export default function SimulatorPage() {
  const [, setLocation] = useLocation();
  const mapRef = useRef<any>(null);

  const [tiers, setTiers] = useState<Record<string, number>>(
    () => Object.fromEntries(NODES.map((n) => [n.id, n.tier0])),
  );
  const [budget, setBudget] = useState(START_BUDGET);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeInitiatives, setActiveInitiatives] = useState<string[]>([]);
  const [cycle, setCycle] = useState(0);
  const [history, setHistory] = useState<{ t: number; wb: number }[]>([]);
  const [lastDelta, setLastDelta] = useState({ wb: 0, eco: 0, water: 0 });
  const [flash, setFlash] = useState<string | null>(null);

  // ── Derived indices ──────────────────────────────────────────────────────
  const indices = useMemo(() => {
    let wb = 18, eco = 12, water = 20;
    NODES.forEach((n) => {
      const t = tiers[n.id] ?? 0;
      wb += n.wb * t; eco += n.eco * t; water += n.water * t;
    });
    INITIATIVES.forEach((i) => {
      if (activeInitiatives.includes(i.id)) { wb += i.wb; eco += i.eco; water += i.water; }
    });
    const clamp = (v: number) => Math.max(0, Math.min(100, v));
    return { wb: clamp(wb), eco: clamp(eco), water: clamp(water) };
  }, [tiers, activeInitiatives]);

  const overall = Math.round((indices.wb + indices.eco + indices.water) / 3);

  const costFor = useCallback((n: ModelNode, tier: number) => Math.round(n.baseCost * (1 + tier * 0.6)), []);

  // ── Recommendations ──────────────────────────────────────────────────────
  const recommendations = useMemo(() => {
    return NODES
      .filter((n) => (tiers[n.id] ?? 0) < MAX_TIER)
      .map((n) => {
        const t = tiers[n.id] ?? 0;
        const gain = n.wb + n.eco + n.water;
        const cost = costFor(n, t);
        const score = (gain / cost) * (MAX_TIER - t + 1);
        return { node: n, tier: t, cost, gain, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [tiers, costFor]);
  const recIds = useMemo(() => new Set(recommendations.map((r) => r.node.id)), [recommendations]);

  // ── Initiatives state ────────────────────────────────────────────────────
  const initiativeState = useMemo(() => INITIATIVES.map((i) => {
    const unlocked = i.requires.every((rid) => (tiers[rid] ?? 0) >= 2);
    const active = activeInitiatives.includes(i.id);
    return { init: i, unlocked, active };
  }), [tiers, activeInitiatives]);

  // ── Map markers ──────────────────────────────────────────────────────────
  const markers: MapMarker[] = useMemo(() => {
    const nodeMarkers: MapMarker[] = NODES.map((n) => ({
      id: n.id,
      type: 'object',
      objectType: n.kind,
      lat: n.lat, lng: n.lng,
      title: `${n.name} — ${TIERS[tiers[n.id] ?? 0].label}`,
      description: n.typeLabel,
      isHighlighted: recIds.has(n.id) || selectedId === n.id,
    }));
    const initMarkers: MapMarker[] = initiativeState
      .filter((s) => s.active)
      .map((s) => ({
        id: `init-${s.init.id}`, type: 'project', objectType: 'reservoir',
        lat: s.init.lat, lng: s.init.lng, title: s.init.name,
        description: 'Инициатива активна', isHighlighted: true,
      }));
    return [...nodeMarkers, ...initMarkers];
  }, [tiers, recIds, selectedId, initiativeState]);

  const onMarkerClick = useCallback((m: MapMarker) => {
    if (m.id.startsWith('init-')) return;
    setSelectedId(m.id);
    const n = NODES.find((x) => x.id === m.id);
    if (n && mapRef.current) mapRef.current.flyTo([n.lng, n.lat], 6.5);
  }, []);

  // ── Actions ──────────────────────────────────────────────────────────────
  const doUpgrade = useCallback((n: ModelNode) => {
    const t = tiers[n.id] ?? 0;
    if (t >= MAX_TIER) return;
    const cost = costFor(n, t);
    if (budget < cost) { setFlash('Недостаточно бюджета — запусти годовой цикл, чтобы накопить средства.'); return; }
    setBudget((b) => b - cost);
    setTiers((prev) => ({ ...prev, [n.id]: t + 1 }));
    setLastDelta({ wb: n.wb, eco: n.eco, water: n.water });
    setHistory((h) => [...h, { t: h.length, wb: indices.wb + n.wb }].slice(-24));
    setFlash(null);
  }, [tiers, budget, costFor, indices.wb]);

  const activateInitiative = useCallback((i: Initiative) => {
    if (activeInitiatives.includes(i.id)) return;
    if (budget < i.cost) { setFlash('Недостаточно бюджета для инициативы.'); return; }
    setBudget((b) => b - i.cost);
    setActiveInitiatives((a) => [...a, i.id]);
    setLastDelta({ wb: i.wb, eco: i.eco, water: i.water });
    setHistory((h) => [...h, { t: h.length, wb: indices.wb + i.wb }].slice(-24));
    setFlash(null);
  }, [activeInitiatives, budget, indices.wb]);

  const nextCycle = useCallback(() => {
    const income = NODES.reduce((s, n) => s + (tiers[n.id] ?? 0) * 3, 15);
    setBudget((b) => b + income);
    setCycle((c) => c + 1);
    setHistory((h) => [...h, { t: h.length, wb: indices.wb }].slice(-24));
    setFlash(`Годовой цикл ${cycle + 1}: инфраструктура принесла +${income} у.е. в бюджет развития.`);
  }, [tiers, cycle, indices.wb]);

  const reset = useCallback(() => {
    setTiers(Object.fromEntries(NODES.map((n) => [n.id, n.tier0])));
    setBudget(START_BUDGET); setSelectedId(null); setActiveInitiatives([]);
    setCycle(0); setHistory([]); setLastDelta({ wb: 0, eco: 0, water: 0 }); setFlash(null);
  }, []);

  const selected = selectedId ? NODES.find((n) => n.id === selectedId) ?? null : null;
  const verdict = overall >= 75 ? { t: 'Регион восстановлен', c: C.green }
    : overall >= 50 ? { t: 'Устойчивое развитие', c: C.sky }
    : overall >= 32 ? { t: 'Стабилизация', c: C.amber }
    : { t: 'Кризис — нужны действия', c: C.red };

  return (
    <div className="min-h-screen text-white">
      {/* Header */}
      <div className="sticky top-0 z-20 backdrop-blur-xl" style={{ background: 'rgba(4,7,15,0.75)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3 flex-wrap">
          <button onClick={() => setLocation('/')} className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm cursor-pointer transition-colors">
            <ArrowLeft size={16} /> Назад
          </button>
          <div className="h-4 w-px" style={{ background: 'rgba(255,255,255,0.15)' }} />
          <div className="flex items-center gap-2">
            <Waves size={18} style={{ color: C.cyan }} />
            <h1 className="text-base font-semibold">Живая модель региона</h1>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: `${verdict.c}18`, color: verdict.c, border: `1px solid ${verdict.c}40` }}>
            {verdict.t}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-xl tabular-nums"
              style={{ background: `${C.amber}12`, color: C.amber, border: `1px solid ${C.amber}30` }}>
              <Coins size={15} /> {Math.round(budget)} <span className="text-white/40 text-xs">у.е.</span>
            </span>
            <button onClick={nextCycle} className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-xl cursor-pointer transition-colors"
              style={{ background: `${C.cyan}15`, color: C.cyan, border: `1px solid ${C.cyan}35` }}>
              <Zap size={15} /> Годовой цикл
            </button>
            <button onClick={reset} className="flex items-center justify-center w-9 h-9 rounded-xl text-white/50 hover:text-white cursor-pointer transition-colors"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} title="Сбросить">
              <RotateCcw size={15} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-5">
        {/* Index cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <IndexCard icon={<Gauge size={13} />} label="Благополучие" value={indices.wb} color={C.cyan} delta={lastDelta.wb} />
          <IndexCard icon={<Leaf size={13} />} label="Экология" value={indices.eco} color={C.green} delta={lastDelta.eco} />
          <IndexCard icon={<Droplets size={13} />} label="Водный баланс" value={indices.water} color={C.sky} delta={lastDelta.water} />
          <div className="rounded-2xl p-4 flex flex-col justify-between" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <span className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-white/50">
              <Target size={13} style={{ color: C.violet }} /> Индекс региона
            </span>
            <div className="flex items-end gap-1">
              <span className="text-3xl font-bold tabular-nums" style={{ color: verdict.c }}>{overall}</span>
              <span className="text-white/40 text-sm mb-1">· цикл {cycle}</span>
            </div>
            <div className="h-10 -mb-1 -mx-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history.length ? history : [{ t: 0, wb: indices.wb }]}>
                  <YAxis hide domain={[0, 100]} />
                  <RTooltip contentStyle={{ background: '#0a1628', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }}
                    labelStyle={{ color: 'rgba(255,255,255,0.5)' }} formatter={(v: any) => [Math.round(v), 'Благополучие']} labelFormatter={() => ''} />
                  <Line type="monotone" dataKey="wb" stroke={C.violet} strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* flash */}
        <AnimatePresence>
          {flash && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-4 flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }}>
              <Sparkles size={15} style={{ color: C.amber }} /> {flash}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Map + side panel */}
        <div className="grid lg:grid-cols-[1fr_370px] gap-4">
          {/* Map */}
          <div className="rounded-2xl overflow-hidden relative" style={{ border: '1px solid rgba(255,255,255,0.09)', height: '58vh', minHeight: 420 }}>
            <WaterMap
              markers={markers}
              onMarkerClick={onMarkerClick}
              center={[63.5, 43.0]}
              zoom={4.4}
              height="100%"
              mapRef={mapRef}
              layers={['rivers', 'lakes', 'glaciers', 'borders', 'cities']}
            />
            <div className="absolute left-3 bottom-3 flex items-center gap-2 text-[11px] px-3 py-1.5 rounded-lg pointer-events-none"
              style={{ background: 'rgba(4,7,15,0.8)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>
              <Lightbulb size={13} style={{ color: C.amber }} /> Пульсирующие точки — приоритет к обновлению
            </div>
          </div>

          {/* Side panel */}
          <div className="space-y-4">
            {/* Selected node OR hint */}
            <AnimatePresence mode="wait">
              {selected ? (
                <motion.div key={selected.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
                  className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}>
                  {(() => {
                    const t = tiers[selected.id] ?? 0;
                    const maxed = t >= MAX_TIER;
                    const cost = costFor(selected, t);
                    const canAfford = budget >= cost;
                    return (
                      <>
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div>
                            <div className="text-[11px] uppercase tracking-widest text-white/40">{selected.typeLabel} · {selected.zone}</div>
                            <div className="font-semibold leading-tight">{selected.name}</div>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap" style={{ background: `${TIERS[t].color}18`, color: TIERS[t].color, border: `1px solid ${TIERS[t].color}40` }}>
                            {TIERS[t].label}
                          </span>
                        </div>
                        <div className="flex gap-1 my-3">
                          {TIERS.map((tt, i) => (
                            <div key={i} className="flex-1 h-1.5 rounded-full" style={{ background: i <= t ? tt.color : 'rgba(255,255,255,0.08)' }} />
                          ))}
                        </div>
                        <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                          {([['Благополучие', selected.wb, C.cyan], ['Экология', selected.eco, C.green], ['Вода', selected.water, C.sky]] as [string, number, string][]).map(([l, v, c]) => (
                            <div key={l} className="rounded-lg py-2" style={{ background: 'rgba(255,255,255,0.03)' }}>
                              <div className="text-sm font-semibold" style={{ color: c }}>+{v}</div>
                              <div className="text-[10px] text-white/40">{l}/ур.</div>
                            </div>
                          ))}
                        </div>
                        {maxed ? (
                          <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm" style={{ background: `${C.green}15`, color: C.green }}>
                            <CheckCircle2 size={16} /> Достигнут оптимальный уровень
                          </div>
                        ) : (
                          <button onClick={() => doUpgrade(selected)} disabled={!canAfford}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer disabled:cursor-not-allowed"
                            style={{ background: canAfford ? `${C.cyan}1a` : 'rgba(255,255,255,0.04)', color: canAfford ? C.cyan : 'rgba(255,255,255,0.35)', border: `1px solid ${canAfford ? C.cyan + '45' : 'rgba(255,255,255,0.08)'}` }}>
                            <ArrowUpCircle size={16} /> Модернизировать · {cost} у.е.
                          </button>
                        )}
                      </>
                    );
                  })()}
                </motion.div>
              ) : (
                <motion.div key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="rounded-2xl p-4 text-sm text-white/55" style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.12)' }}>
                  Кликни объект на карте, чтобы увидеть его состояние и модернизировать. Бюджет пополняется через «Годовой цикл».
                </motion.div>
              )}
            </AnimatePresence>

            {/* Recommendations */}
            <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}>
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-white/50 mb-3">
                <Lightbulb size={13} style={{ color: C.amber }} /> Что обновить дальше
              </div>
              <div className="space-y-2">
                {recommendations.map((r) => (
                  <button key={r.node.id} onClick={() => onMarkerClick(markers.find((m) => m.id === r.node.id)!)}
                    className="w-full flex items-center gap-3 p-2 rounded-xl text-left cursor-pointer transition-colors hover:bg-white/5">
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${TIERS[r.tier].color}18`, color: TIERS[r.tier].color }}>
                      <AlertTriangle size={15} />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm truncate">{r.node.name}</span>
                      <span className="block text-[11px] text-white/40">{KIND_LABEL[r.node.kind]} · {TIERS[r.tier].label}</span>
                    </span>
                    <span className="text-xs tabular-nums" style={{ color: C.amber }}>{r.cost} у.е.</span>
                  </button>
                ))}
                {recommendations.length === 0 && (
                  <div className="flex items-center gap-2 text-sm py-2" style={{ color: C.green }}>
                    <CheckCircle2 size={16} /> Вся инфраструктура на оптимуме
                  </div>
                )}
              </div>
            </div>

            {/* Initiatives */}
            <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}>
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-white/50 mb-3">
                <Sparkles size={13} style={{ color: C.violet }} /> Инициативы
              </div>
              <div className="space-y-2.5">
                {initiativeState.map(({ init, unlocked, active }) => (
                  <div key={init.id} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${active ? C.green + '40' : 'rgba(255,255,255,0.07)'}` }}>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-sm font-medium">{init.name}</span>
                      {active ? <CheckCircle2 size={15} style={{ color: C.green }} />
                        : unlocked ? <span className="text-[10px]" style={{ color: C.violet }}>доступно</span>
                        : <Lock size={13} className="text-white/30" />}
                    </div>
                    <p className="text-[11px] text-white/45 leading-snug mb-2">{init.desc}</p>
                    <div className="flex items-center gap-2 text-[10px] text-white/40 mb-2 flex-wrap">
                      <span style={{ color: C.cyan }}>+{init.wb} благ.</span>
                      <span style={{ color: C.green }}>+{init.eco} экол.</span>
                      <span style={{ color: C.sky }}>+{init.water} вода</span>
                    </div>
                    {active ? (
                      <div className="text-[11px]" style={{ color: C.green }}>Активна</div>
                    ) : unlocked ? (
                      <button onClick={() => activateInitiative(init)}
                        className="w-full py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors"
                        style={{ background: `${C.violet}1a`, color: C.violet, border: `1px solid ${C.violet}45` }}>
                        Запустить · {init.cost} у.е.
                      </button>
                    ) : (
                      <div className="text-[10px] text-white/35">
                        Нужно: {init.requires.map((rid) => NODES.find((n) => n.id === rid)?.name.split(' ')[0]).join(', ')} — уровень «Модернизировано»
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <p className="mt-5 text-center text-[11px] text-white/30 flex items-center justify-center gap-1.5">
          <TrendingUp size={12} /> Модель иллюстративная: показывает логику каскадного восстановления бассейна, а не точный прогноз.
        </p>
      </div>
    </div>
  );
}
