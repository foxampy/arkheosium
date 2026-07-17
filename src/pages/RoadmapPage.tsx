import { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, Compass, ChevronRight, ExternalLink, Sparkles,
  CheckCircle2, Loader2, CircleDashed, ArrowRight,
  Map, Globe2, Building2, ShoppingCart, BarChart2, FlaskConical,
  TrendingUp, Users, UserCog, FileText, Brain, Image as ImageIcon, KeyRound,
  Orbit, Waves, Droplets, Thermometer, Zap, BookOpen, Truck, Bot,
  Sprout, Building, Recycle, Radar, Rocket,
} from 'lucide-react';

// ══════════════════════════════════════════════════════════════════════════════
//  ArkheOSium — Roadmap / Дорожная карта
//  Route: /roadmap
//  Shows the full development path of the OS platform: Done / In progress / Planned.
//  The star of the page: pre-render UI mockups built purely from divs + SVG + CSS.
// ══════════════════════════════════════════════════════════════════════════════

const ACCENT = '#00e6c8';
const ACCENT2 = '#00d4ff';

type Status = 'done' | 'progress' | 'planned';

const STATUS_META: Record<Status, { color: string; ring: string; Icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }> }> = {
  done:     { color: '#22c55e', ring: 'rgba(34,197,94,0.35)',  Icon: CheckCircle2 },
  progress: { color: '#fbbf24', ring: 'rgba(251,191,36,0.35)', Icon: Loader2 },
  planned:  { color: '#64748b', ring: 'rgba(100,116,139,0.35)', Icon: CircleDashed },
};

interface Item {
  Icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  name: string;
  tag: string;
  desc: string;
  status: Status;
  route?: string;
  mockup?: React.ComponentType;
}

// ─── Mockup primitives (fake pre-render UI, divs + SVG only) ────────────────────

function Sparkline({ color = ACCENT, points }: { color?: string; points?: string }) {
  const pts = points ?? '0,26 14,18 28,22 42,10 56,16 70,6 84,12 98,4';
  return (
    <svg viewBox="0 0 98 30" className="w-full h-8" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`sl-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,30 ${pts} 98,30`} fill={`url(#sl-${color})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function GaugeArc({ pct, color = ACCENT, label, value }: { pct: number; color?: string; label: string; value: string }) {
  const r = 26;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[70px] h-[70px]">
        <svg viewBox="0 0 70 70" className="w-full h-full -rotate-90">
          <circle cx="35" cy="35" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
          <circle
            cx="35" cy="35" r={r} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-[13px] font-mono font-bold" style={{ color }}>
          {value}
        </div>
      </div>
      <div className="text-[10px] text-gray-500 mt-1 text-center leading-tight">{label}</div>
    </div>
  );
}

function StatTile({ val, label, color = ACCENT, spark }: { val: string; label: string; color?: string; spark?: string }) {
  return (
    <div className="rounded-lg bg-white/[0.03] border border-white/10 p-2.5">
      <div className="text-sm font-mono font-bold" style={{ color }}>{val}</div>
      <div className="text-[9px] text-gray-500 uppercase tracking-wide mb-1">{label}</div>
      <Sparkline color={color} points={spark} />
    </div>
  );
}

function LiveDot({ color, delay = 0, reduce }: { color: string; delay?: number; reduce: boolean }) {
  return (
    <span className="relative flex h-2 w-2">
      {!reduce && (
        <motion.span
          className="absolute inline-flex h-full w-full rounded-full"
          style={{ background: color }}
          animate={{ opacity: [0.6, 0, 0.6], scale: [1, 2.2, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, delay }}
        />
      )}
      <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: color }} />
    </span>
  );
}

// Fake node-graph / satellite map
function MapMockup() {
  const reduce = useReducedMotion();
  const nodes = [
    [22, 30], [55, 20], [80, 40], [40, 55], [68, 70], [30, 75], [88, 68],
  ];
  const edges = [[0, 1], [1, 2], [0, 3], [3, 4], [4, 6], [3, 5], [1, 3]];
  return (
    <div className="rounded-lg bg-[#00101f] border border-white/10 p-3 overflow-hidden relative">
      <svg viewBox="0 0 100 90" className="w-full h-28">
        <defs>
          <radialGradient id="blob" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={ACCENT2} stopOpacity="0.18" />
            <stop offset="100%" stopColor={ACCENT2} stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="45" cy="45" rx="42" ry="30" fill="url(#blob)" />
        {edges.map(([a, b], i) => (
          <line key={i} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]}
            stroke={ACCENT} strokeOpacity="0.25" strokeWidth="0.6" />
        ))}
        {nodes.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="2" fill={i % 3 === 0 ? ACCENT : ACCENT2}>
            {!reduce && <animate attributeName="opacity" values="1;0.35;1" dur="2.2s" begin={`${i * 0.25}s`} repeatCount="indefinite" />}
          </circle>
        ))}
      </svg>
      <div className="absolute top-2 right-2 flex items-center gap-1 text-[9px] text-gray-500">
        <LiveDot color="#22c55e" reduce={!!reduce} /> LIVE
      </div>
    </div>
  );
}

// Fake sensor network rows
function SensorMockup() {
  const reduce = useReducedMotion();
  const rows = [
    { name: 'North Buoy · pH', c: '#22c55e', v: '7.9' },
    { name: 'Delta · O₂', c: '#22c55e', v: '82%' },
    { name: 'Bay-04 · Turbidity', c: '#fbbf24', v: '38 NTU' },
    { name: 'Reef · Salinity', c: '#22c55e', v: '11 g/L' },
    { name: 'Estuary · Temp', c: '#f87171', v: '29°C' },
  ];
  return (
    <div className="rounded-lg bg-[#00101f] border border-white/10 p-2.5 space-y-1.5">
      {rows.map((r, i) => (
        <div key={r.name} className="flex items-center gap-2 text-[10px]">
          <LiveDot color={r.c} delay={i * 0.3} reduce={!!reduce} />
          <span className="text-gray-400 truncate flex-1">{r.name}</span>
          <span className="font-mono" style={{ color: r.c }}>{r.v}</span>
        </div>
      ))}
    </div>
  );
}

// Fake dashboard / analytics
function DashMockup() {
  return (
    <div className="rounded-lg bg-[#00101f] border border-white/10 p-2.5">
      <div className="grid grid-cols-3 gap-1.5 mb-2">
        <StatTile val="42.1k" label="km²" color={ACCENT} />
        <StatTile val="+18%" label="приток" color="#22c55e" points="0,28 14,22 28,24 42,14 56,16 70,8 84,10 98,4" />
        <StatTile val="0.87" label="индекс" color={ACCENT2} points="0,10 14,14 28,8 42,16 56,12 70,18 84,14 98,20" />
      </div>
      <div className="space-y-1">
        {[70, 45, 88, 30].map((w, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="h-1.5 rounded-full flex-1 bg-white/5 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${w}%`, background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT2})` }} />
            </div>
            <span className="text-[8px] font-mono text-gray-600 w-6">{w}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Fake water-recovery level model
function WaterMockup() {
  return (
    <div className="rounded-lg bg-[#00101f] border border-white/10 p-3">
      <svg viewBox="0 0 100 50" className="w-full h-24" preserveAspectRatio="none">
        <defs>
          <linearGradient id="wr" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ACCENT2} stopOpacity="0.5" />
            <stop offset="100%" stopColor={ACCENT2} stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <polyline points="0,42 20,40 40,34 60,26 80,18 100,10" fill="none" stroke={ACCENT} strokeWidth="1.5" strokeDasharray="3 2" />
        <polygon points="0,50 0,44 20,43 40,41 60,38 80,36 100,33 100,50" fill="url(#wr)" />
        <polyline points="0,44 20,43 40,41 60,38 80,36 100,33" fill="none" stroke={ACCENT2} strokeWidth="1.5" />
      </svg>
      <div className="flex justify-between text-[9px] text-gray-600 mt-1">
        <span>2026</span><span className="text-gray-400">прогноз уровня</span><span>2040</span>
      </div>
    </div>
  );
}

// Fake climate heatmap grid
function HeatmapMockup() {
  const cells = Array.from({ length: 42 }, (_, i) => {
    const heat = Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.9));
    return heat;
  });
  const colorFor = (h: number) =>
    h > 0.66 ? '#f87171' : h > 0.4 ? '#fbbf24' : h > 0.2 ? ACCENT : '#1e3a5f';
  return (
    <div className="rounded-lg bg-[#00101f] border border-white/10 p-3">
      <div className="grid grid-cols-7 gap-1">
        {cells.map((h, i) => (
          <div key={i} className="aspect-square rounded-sm" style={{ background: colorFor(h), opacity: 0.35 + h * 0.65 }} />
        ))}
      </div>
      <div className="flex items-center gap-1 mt-2 text-[8px] text-gray-600">
        <span>низкий</span>
        <div className="flex-1 h-1.5 rounded-full" style={{ background: `linear-gradient(90deg, #1e3a5f, ${ACCENT}, #fbbf24, #f87171)` }} />
        <span>риск</span>
      </div>
    </div>
  );
}

// Fake Genesis Studio split (agent steps + preview)
function GenesisMockup() {
  const steps = ['Research', 'Концепция', 'Технологии', 'ТЭО', 'Studio 3D'];
  return (
    <div className="rounded-lg bg-[#00101f] border border-white/10 p-2.5 grid grid-cols-2 gap-2">
      <div className="space-y-1.5">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-1.5 text-[10px]">
            {i < 3
              ? <CheckCircle2 size={11} style={{ color: '#22c55e' }} />
              : i === 3
                ? <Loader2 size={11} className="animate-spin" style={{ color: '#fbbf24' }} />
                : <CircleDashed size={11} style={{ color: '#475569' }} />}
            <span className={i < 3 ? 'text-gray-300' : 'text-gray-500'}>{s}</span>
          </div>
        ))}
      </div>
      <div className="rounded bg-black/40 border border-white/5 p-1.5 flex flex-col gap-1">
        <div className="h-1.5 w-2/3 rounded-full bg-white/10" />
        <div className="flex-1 rounded" style={{ background: `linear-gradient(135deg, ${ACCENT}22, ${ACCENT2}11)` }} />
        <div className="grid grid-cols-2 gap-1">
          <div className="h-3 rounded bg-white/5" />
          <div className="h-3 rounded bg-white/5" />
        </div>
      </div>
    </div>
  );
}

// Fake robotics / drone fleet
function FleetMockup() {
  const reduce = useReducedMotion();
  const units = [
    { l: 'AUV-01', c: '#22c55e' }, { l: 'ROV-04', c: '#22c55e' },
    { l: 'UAV-07', c: '#fbbf24' }, { l: 'UGV-02', c: '#22c55e' },
  ];
  return (
    <div className="rounded-lg bg-[#00101f] border border-white/10 p-2.5 grid grid-cols-2 gap-1.5">
      {units.map((u, i) => (
        <div key={u.l} className="flex items-center gap-1.5 rounded bg-white/[0.03] border border-white/5 px-2 py-1.5">
          <Bot size={12} style={{ color: u.c }} />
          <span className="text-[10px] text-gray-400 flex-1">{u.l}</span>
          <LiveDot color={u.c} delay={i * 0.25} reduce={!!reduce} />
        </div>
      ))}
    </div>
  );
}

// Generic skeleton for lighter-weight planned cards
function SkeletonMockup() {
  return (
    <div className="rounded-lg bg-[#00101f] border border-white/10 p-3 space-y-2">
      <div className="flex gap-2">
        <div className="w-8 h-8 rounded-lg bg-white/5" />
        <div className="flex-1 space-y-1.5 pt-0.5">
          <div className="h-2 w-3/4 rounded-full bg-white/10" />
          <div className="h-2 w-1/2 rounded-full bg-white/5" />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {[0, 1, 2, 3].map((i) => <div key={i} className="h-6 rounded bg-white/[0.04]" />)}
      </div>
      <Sparkline />
    </div>
  );
}

// ─── Data: roadmap items ────────────────────────────────────────────────────────

const ITEMS: Item[] = [
  // DONE
  { Icon: Map, name: 'Карта Земли', tag: 'Earth Explorer', status: 'done', route: '/', desc: '3D-глобус и планетарный цифровой двойник — единая точка входа в экосистему.', mockup: MapMockup },
  { Icon: Globe2, name: 'Мировая карта', tag: 'World Map', status: 'done', route: '/map', desc: 'Интерактивная карта объектов, ресурсов и проектов по всему миру.' },
  { Icon: Building2, name: 'Проект Хаб', tag: 'Project Hub', status: 'done', route: '/hub', desc: 'Объекты, субъекты, проекты и R&D в единой связанной среде управления.' },
  { Icon: ShoppingCart, name: 'Тех.маркет', tag: 'Tech Marketplace', status: 'done', route: '/catalog', desc: 'Каталог технологий, оборудования, материалов и поставщиков.' },
  { Icon: BarChart2, name: 'Аналитика', tag: 'Dashboard', status: 'done', route: '/dashboard', desc: 'Сквозная аналитика: KPI, тренды и сценарное моделирование.', mockup: DashMockup },
  { Icon: FlaskConical, name: 'R&D', tag: 'Research', status: 'done', route: '/rd', desc: 'Лаборатории, эксперименты, публикации и граф знаний.' },
  { Icon: TrendingUp, name: 'Инвест-хаб', tag: 'Invest Flow', status: 'done', route: '/invest', desc: 'Инвестиционный контур: модели, ROI, токенизация инфраструктуры.' },
  { Icon: Users, name: 'Сообщество', tag: 'Community', status: 'done', route: '/community', desc: 'Участники экосистемы, обсуждения и совместная работа.' },
  { Icon: UserCog, name: 'Аккаунты', tag: 'Auth & Profile', status: 'done', desc: 'Регистрация, вход, профиль, AuthGate, Premium и админ-инвайты.' },
  { Icon: FileText, name: 'Whitepaper', tag: 'Full Vision', status: 'done', route: '/whitepaper-full', desc: 'Полная презентация экосистемы: видение, модули, ARAL NEXUS, AI Core.' },

  // IN PROGRESS
  { Icon: Brain, name: 'Genesis Engine', tag: 'AI Dev Agent', status: 'progress', route: '/genesis', desc: 'Автономный ИИ-агент разработки проектов: research → концепция → технологии → ТЭО → Studio-визуализация → сборка.', mockup: GenesisMockup },
  { Icon: ImageIcon, name: 'Тематические изображения', tag: 'Catalog Media', status: 'progress', desc: 'Замена каталожных изображений на осмысленные тематические визуалы.', mockup: SkeletonMockup },
  { Icon: KeyRound, name: 'Мульти-агент Gemini', tag: 'Gemini Keys', status: 'progress', desc: 'Интеграция пула Gemini-ключей для параллельной работы ИИ-агентов.' },

  // PLANNED
  { Icon: Orbit, name: 'Спутниковый мониторинг', tag: 'Satellite', status: 'planned', route: '/satellite', desc: 'Мониторинг Арала из космоса, таймлайн изменений береговой линии и площади.', mockup: MapMockup },
  { Icon: Waves, name: 'Сеть морских датчиков', tag: 'Sensors', status: 'planned', route: '/sensors', desc: 'Морская сеть датчиков качества воды с live-алертами.', mockup: SensorMockup },
  { Icon: Droplets, name: 'Восстановление моря', tag: 'Water Recovery', status: 'planned', route: '/water-recovery', desc: 'Модель восстановления: приток, испарение и прогноз уровня воды.', mockup: WaterMockup },
  { Icon: Thermometer, name: 'Климат-инженерия', tag: 'Climate', status: 'planned', route: '/climate', desc: 'Индексы опустынивания, тепловые карты и сценарии восстановления.', mockup: HeatmapMockup },
  { Icon: Zap, name: 'Энерго-кольцо / Водород', tag: 'Energy', status: 'planned', route: '/energy', desc: 'Возобновляемая энергетика, водород и Smart Grid острова.' },
  { Icon: BookOpen, name: 'Открытая наука', tag: 'Open Science', status: 'planned', route: '/open-science', desc: 'Открытые датасеты и публичные API для исследователей.' },
  { Icon: Truck, name: 'Беспилотный транспорт', tag: 'Transport', status: 'planned', route: '/transport', desc: 'Автономный транспорт и логистика инфраструктуры.' },
  { Icon: Bot, name: 'Роботы и дроны', tag: 'Robotics', status: 'planned', route: '/robotics', desc: 'Подводные, наземные и воздушные роботизированные флоты.', mockup: FleetMockup },
  { Icon: Sprout, name: 'АгроТех-зона', tag: 'AgriTech', status: 'planned', route: '/agritech', desc: 'Инновационное сельское хозяйство и продовольственная автономия.' },
  { Icon: Building, name: 'Умный остров-город', tag: 'Smart City', status: 'planned', route: '/city', desc: 'Автономный город-столица проекта — административный и научный центр.' },
  { Icon: Recycle, name: 'Циркулярная экономика', tag: 'Circular', status: 'planned', route: '/circular', desc: 'Замкнутые циклы ресурсов, ноль отходов и переработка.' },
  { Icon: Radar, name: 'Обсерватория воды', tag: 'Observatory', status: 'planned', route: '/observatory', desc: 'Глобальный мониторинг водных ресурсов планеты.', mockup: MapMockup },
];

// ─── Flagship gallery (larger detailed mockups) ─────────────────────────────────

const GALLERY: { key: string; title: string; tag: string; color: string; Mock: React.ComponentType }[] = [
  { key: 'genesis', title: 'Genesis Engine Studio', tag: 'AI Dev Agent', color: ACCENT, Mock: GenesisMockup },
  { key: 'satellite', title: 'Satellite Monitoring', tag: 'Aral Timeline', color: ACCENT2, Mock: MapMockup },
  { key: 'sensors', title: 'Underwater Sensor Network', tag: 'Live Water Quality', color: '#34d399', Mock: SensorMockup },
  { key: 'water', title: 'Water Recovery Model', tag: 'Level Forecast', color: '#00d4ff', Mock: WaterMockup },
  { key: 'climate', title: 'Climate Engineering', tag: 'Desertification Heatmap', color: '#f59e0b', Mock: HeatmapMockup },
  { key: 'fleet', title: 'Robotics & Drones', tag: 'Autonomous Fleet', color: '#a78bfa', Mock: FleetMockup },
];

// ─── Phases (feature-status framing) ────────────────────────────────────────────

const PHASES = [
  { num: 'I', color: '#22c55e', status: 'done' as Status, kName: 'ph1' },
  { num: 'II', color: '#fbbf24', status: 'progress' as Status, kName: 'ph2' },
  { num: 'III', color: ACCENT2, status: 'planned' as Status, kName: 'ph3' },
  { num: 'IV', color: '#7c3aed', status: 'planned' as Status, kName: 'ph4' },
];

// ─── Card ───────────────────────────────────────────────────────────────────────

function ItemCard({ item, i, onNav, t }: { item: Item; i: number; onNav: (r?: string) => void; t: (k: string) => string }) {
  const [open, setOpen] = useState(false);
  const meta = STATUS_META[item.status];
  const Mock = item.mockup;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: (i % 3) * 0.06 }}
      className="group bg-[#000d24] border border-white/10 rounded-2xl p-4 hover:border-white/20 transition-all flex flex-col"
    >
      <div className="flex items-start gap-3">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
          style={{ background: `linear-gradient(145deg, ${meta.color}22, ${meta.color}0d)`, border: `1px solid ${meta.color}30`, color: meta.color }}
        >
          <item.Icon size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2 flex-wrap">
            <h3 className="text-white font-bold text-sm">{item.name}</h3>
            <span className="text-[9px] font-mono uppercase tracking-wider text-gray-500">{item.tag}</span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed mt-1.5">{item.desc}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3">
        <span
          className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-1 rounded-full"
          style={{ color: meta.color, background: meta.color + '18', border: `1px solid ${meta.ring}` }}
        >
          <meta.Icon size={11} className={item.status === 'progress' ? 'animate-spin' : ''} />
          {t(`roadmap.status_${item.status}`)}
        </span>
        {item.route && (
          <button
            onClick={() => onNav(item.route)}
            className="text-[10px] text-gray-500 hover:text-white flex items-center gap-1 transition-colors"
          >
            {item.route} <ArrowRight size={10} />
          </button>
        )}
        {Mock && (
          <button
            onClick={() => setOpen((o) => !o)}
            className="ml-auto text-[10px] font-medium flex items-center gap-1 transition-colors"
            style={{ color: ACCENT }}
          >
            {open ? t('roadmap.hide_preview') : t('roadmap.show_preview')}
            <ChevronRight size={11} className={`transition-transform ${open ? 'rotate-90' : ''}`} />
          </button>
        )}
      </div>

      {Mock && open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 overflow-hidden"
        >
          <div className="text-[9px] uppercase tracking-widest text-gray-600 mb-1.5">{t('roadmap.mockup_label')}</div>
          <Mock />
        </motion.div>
      )}
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════

export default function RoadmapPage() {
  const [, navigate] = useLocation();
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const [filter, setFilter] = useState<'all' | Status>('all');

  const onNav = (r?: string) => { if (r) navigate(r); };

  const counts = useMemo(() => ({
    done: ITEMS.filter((x) => x.status === 'done').length,
    progress: ITEMS.filter((x) => x.status === 'progress').length,
    planned: ITEMS.filter((x) => x.status === 'planned').length,
  }), []);

  const visible = useMemo(
    () => (filter === 'all' ? ITEMS : ITEMS.filter((x) => x.status === filter)),
    [filter]
  );

  const FILTERS: { key: 'all' | Status; label: string; color: string }[] = [
    { key: 'all', label: t('roadmap.filter_all'), color: ACCENT },
    { key: 'done', label: t('roadmap.status_done'), color: STATUS_META.done.color },
    { key: 'progress', label: t('roadmap.status_progress'), color: STATUS_META.progress.color },
    { key: 'planned', label: t('roadmap.status_planned'), color: STATUS_META.planned.color },
  ];

  return (
    <div className="min-h-screen text-gray-200">

      {/* ── Top bar ── */}
      <div className="sticky top-0 z-40 bg-[#000818]/95 backdrop-blur border-b border-white/5 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-[#00e6c8]/70 hover:text-[#00e6c8] transition-colors flex-shrink-0"
        >
          <ArrowLeft size={16} /> {t('roadmap.back')}
        </button>
        <div className="flex items-center gap-2 text-sm text-gray-400 flex-shrink-0">
          <Compass size={14} />
          <span>{t('roadmap.doc_label')}</span>
        </div>
        <button
          onClick={() => navigate('/whitepaper-full')}
          className="ml-auto hidden sm:flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border border-[#00e6c8]/30 text-[#00e6c8] hover:bg-[#00e6c8]/10 transition-colors"
        >
          <FileText size={12} /> Whitepaper
        </button>
      </div>

      {/* ══ HERO ══ */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#00153a]/50 to-[#000818]" />
          {!reduce && (
            <>
              <motion.div
                className="absolute -top-20 right-0 w-[600px] h-[360px] rounded-full bg-[#00e6c8]/8 blur-3xl"
                animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
                transition={{ duration: 12, repeat: Infinity }}
              />
              <motion.div
                className="absolute bottom-0 left-1/4 w-[460px] h-[240px] rounded-full bg-[#7c3aed]/10 blur-3xl"
                animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
                transition={{ duration: 14, repeat: Infinity }}
              />
            </>
          )}
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-2 text-xs text-[#00e6c8] bg-[#00e6c8]/10 border border-[#00e6c8]/20 rounded-full px-3 py-1 w-fit mb-6">
              <Compass size={11} /> {t('roadmap.eyebrow')}
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-5 tracking-tight leading-[0.95]">
              {t('roadmap.hero_title')}
              <br />
              <span className="bg-gradient-to-r from-[#00e6c8] via-[#00d4ff] to-[#7c3aed] bg-clip-text text-transparent text-3xl md:text-5xl">
                {t('roadmap.hero_subtitle')}
              </span>
            </h1>
            <p className="text-gray-400 text-base md:text-xl mb-8 max-w-2xl leading-relaxed">
              {t('roadmap.hero_lead')}
            </p>

            {/* Legend */}
            <div className="flex flex-wrap gap-3">
              {(['done', 'progress', 'planned'] as Status[]).map((s) => {
                const m = STATUS_META[s];
                return (
                  <div key={s} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-lg" style={{ background: m.color + '18', color: m.color }}>
                      <m.Icon size={13} className={s === 'progress' ? 'animate-spin' : ''} />
                    </span>
                    <div>
                      <div className="text-xs font-bold text-white leading-none">{t(`roadmap.status_${s}`)}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">{counts[s]} {t('roadmap.modules_word')}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4">

        {/* ══ PHASES timeline ══ */}
        <section className="py-14 md:py-20 border-b border-white/5">
          <div className="text-xs font-semibold uppercase tracking-[0.25em] mb-3" style={{ color: ACCENT }}>
            {t('roadmap.phases_eyebrow')}
          </div>
          <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight mb-10">{t('roadmap.phases_title')}</h2>

          <div className="grid md:grid-cols-4 gap-4">
            {PHASES.map((p, i) => (
              <motion.div
                key={p.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="relative rounded-2xl border p-5"
                style={{ borderColor: p.color + '25', background: `linear-gradient(135deg, ${p.color}08, transparent)` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl border-2 flex items-center justify-center text-xs font-black"
                    style={{ borderColor: p.color, color: p.color }}>
                    {p.num}
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ color: STATUS_META[p.status].color, background: STATUS_META[p.status].color + '18' }}>
                    {t(`roadmap.status_${p.status}`)}
                  </span>
                </div>
                <div className="font-mono text-[11px] mb-1" style={{ color: p.color }}>{t(`roadmap.${p.kName}_period`)}</div>
                <h3 className="text-white font-bold text-sm mb-1.5">{t(`roadmap.${p.kName}_title`)}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{t(`roadmap.${p.kName}_desc`)}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ══ STATUS BOARD (filterable grid) ══ */}
        <section className="py-14 md:py-20 border-b border-white/5">
          <div className="text-xs font-semibold uppercase tracking-[0.25em] mb-3" style={{ color: ACCENT }}>
            {t('roadmap.board_eyebrow')}
          </div>
          <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight mb-2">{t('roadmap.board_title')}</h2>
          <p className="text-gray-400 text-sm md:text-base max-w-2xl leading-relaxed mb-8">{t('roadmap.board_sub')}</p>

          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className="text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all"
                style={
                  filter === f.key
                    ? { color: '#000818', background: f.color, borderColor: f.color }
                    : { color: f.color, background: f.color + '12', borderColor: f.color + '30' }
                }
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visible.map((item, i) => (
              <ItemCard key={item.name} item={item} i={i} onNav={onNav} t={t} />
            ))}
          </div>
        </section>

        {/* ══ MOCKUP GALLERY ══ */}
        <section className="py-14 md:py-20 border-b border-white/5">
          <div className="text-xs font-semibold uppercase tracking-[0.25em] mb-3" style={{ color: ACCENT }}>
            {t('roadmap.gallery_eyebrow')}
          </div>
          <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight mb-2">{t('roadmap.gallery_title')}</h2>
          <p className="text-gray-400 text-sm md:text-base max-w-2xl leading-relaxed mb-8">{t('roadmap.gallery_sub')}</p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {GALLERY.map((g, i) => (
              <motion.div
                key={g.key}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: (i % 3) * 0.08 }}
                className="rounded-2xl border p-4 bg-[#000d24]"
                style={{ borderColor: g.color + '25' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-white font-bold text-sm">{g.title}</h3>
                    <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: g.color }}>{g.tag}</span>
                  </div>
                  <span className="text-[9px] uppercase tracking-widest text-gray-600 flex items-center gap-1">
                    <Sparkles size={10} style={{ color: g.color }} /> {t('roadmap.prerender')}
                  </span>
                </div>
                <g.Mock />
              </motion.div>
            ))}
          </div>
          <p className="text-[11px] text-gray-600 mt-5 text-center">{t('roadmap.gallery_disclaimer')}</p>
        </section>

        {/* ══ CTA ══ */}
        <section className="py-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-[#00e6c8]/20 p-8 text-center bg-gradient-to-b from-[#00e6c8]/5 to-transparent max-w-3xl mx-auto"
          >
            <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-5 bg-[#00e6c8]/10 text-[#00e6c8]">
              <Rocket size={26} />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white mb-3">{t('roadmap.cta_title')}</h2>
            <p className="text-gray-400 text-sm md:text-base mb-7 max-w-xl mx-auto leading-relaxed">{t('roadmap.cta_sub')}</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => navigate('/genesis')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00e6c8]/10 border border-[#00e6c8]/30 text-[#00e6c8] hover:bg-[#00e6c8]/20 transition-colors text-sm font-medium"
              >
                <Brain size={14} /> {t('roadmap.cta_genesis')}
              </button>
              <button
                onClick={() => navigate('/whitepaper-full')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00d4ff]/10 border border-[#00d4ff]/30 text-[#00d4ff] hover:bg-[#00d4ff]/20 transition-colors text-sm font-medium"
              >
                <FileText size={14} /> {t('roadmap.cta_whitepaper')}
              </button>
              <button
                onClick={() => navigate('/hub')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7c3aed]/10 border border-[#7c3aed]/30 text-[#7c3aed] hover:bg-[#7c3aed]/20 transition-colors text-sm font-medium"
              >
                <Building2 size={14} /> {t('roadmap.cta_hub')}
              </button>
              <button
                onClick={() => navigate('/invest')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white transition-colors text-sm font-medium"
              >
                <TrendingUp size={14} /> {t('roadmap.cta_invest')}
              </button>
              <button
                onClick={() => navigate('/contacts')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white transition-colors text-sm font-medium"
              >
                <ExternalLink size={14} /> {t('roadmap.cta_contacts')}
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-8">{t('roadmap.copyright')}</p>
          </motion.div>
        </section>

      </div>
    </div>
  );
}
