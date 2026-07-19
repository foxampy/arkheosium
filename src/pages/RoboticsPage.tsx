import { useState, useMemo, useRef } from 'react';
import { useLocation } from 'wouter';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, Bot, Plane, Anchor, Truck, BatteryCharging,
  Activity, AlertTriangle, TrendingUp, TrendingDown, FileText,
  Compass, Cpu, Radar, Gauge, MapPin, Zap,
} from 'lucide-react';

// ══════════════════════════════════════════════════════════════════════════════
//  ArkheOSium — Robotics & Autonomy (G-RB)
//  Route: /robotics
//  Autonomous fleets: aerial drones, aquatic ROVs, ground rovers for inspection,
//  construction, dredging and monitoring of water infrastructure.
// ══════════════════════════════════════════════════════════════════════════════

const ACCENT = '#b6ff2e';   // robotics lime
const ACCENT2 = '#ffb020';  // amber

// ─── i18n (self-contained, bilingual) ───────────────────────────────────────────

const STRINGS = {
  ru: {
    back: 'Назад к дорожной карте',
    doc_label: 'Робототехника и автономность',
    eyebrow: 'Автономные флоты',
    hero_title: 'Робототехника и автономность',
    hero_accent: 'Дроны, ROV и роверы для водной инфраструктуры',
    hero_lead:
      'Автономные флоты для инспекции, строительства, дноуглубления и мониторинга. Наблюдайте за живым флотом, фильтруйте по типу и открывайте детали каждой единицы.',
    kpi_units: 'Единиц развёрнуто',
    kpi_autonomy: 'Часов автономии / сутки',
    kpi_area: 'Площадь / сутки, км²',
    kpi_uptime: 'Доступность флота',
    fleet_eyebrow: 'Живой пульт флота',
    fleet_title: 'Диспетчер автономных единиц',
    fleet_sub:
      'Фильтруйте флот по классу, следите за маршрутами патрулирования на карте и выбирайте единицу, чтобы открыть панель телеметрии. Агрегаты пересчитываются под фильтр.',
    filter_all: 'Все',
    filter_aerial: 'Воздушные',
    filter_aquatic: 'Водные',
    filter_ground: 'Наземные',
    stat_shown: 'В выборке',
    stat_active: 'В работе',
    stat_charging: 'На зарядке',
    stat_fault: 'Сбой',
    stat_avgbat: 'Средний заряд',
    map_title: 'Карта патрулирования',
    map_sub: 'Каждая точка — автономная единица на маршруте. Нажмите, чтобы выбрать.',
    unit_battery: 'Заряд',
    unit_task: 'Задача',
    unit_status: 'Статус',
    unit_speed: 'Скорость',
    unit_signal: 'Сигнал',
    unit_select_hint: 'Выберите единицу на карте или в списке',
    status_active: 'В работе',
    status_charging: 'Зарядка',
    status_fault: 'Сбой',
    task_inspection: 'Инспекция',
    task_dredging: 'Дноуглубление',
    task_mapping: 'Картирование',
    task_construction: 'Строительство',
    task_monitoring: 'Мониторинг',
    classes_eyebrow: 'Классы машин',
    classes_title: 'Три автономных класса',
    classes_sub: 'Специализированные платформы для воздуха, воды и суши, объединённые единым автопилотом.',
    class_aerial_t: 'Воздушные дроны',
    class_aerial_d: 'БПЛА для аэрофотограмметрии дамб, тепловизионной инспекции и картирования береговой линии.',
    class_aquatic_t: 'Водные ROV',
    class_aquatic_d: 'Подводные аппараты для инспекции трубопроводов, сонарной съёмки дна и контроля дноуглубления.',
    class_ground_t: 'Наземные роверы',
    class_ground_d: 'Гусеничные роверы для укладки датчиков, отбора проб грунта и патрулирования периметра.',
    spec_endurance: 'Автономность',
    spec_range: 'Радиус',
    spec_payload: 'Нагрузка',
    trend_eyebrow: 'Динамика',
    trend_title: 'Тренды флота',
    trend_sub: 'Покрытая площадь растёт с расширением флота; выявленные инциденты снижаются по мере автономного мониторинга.',
    chart_coverage: 'Покрытие, км²/сутки',
    chart_incidents: 'Инциденты / неделя',
    years_note: 'Периоды: 2026 → 2032',
    cta_title: 'Автономность — операционный слой платформы',
    cta_sub: 'Как флот роботов встраивается в дорожную карту и архитектуру ArkheOSium.',
    cta_roadmap: 'Дорожная карта',
    cta_wp: 'Полный whitepaper',
    copyright: '© ArkheOSium — Planetary Infrastructure OS. Данные демонстрационные.',
  },
  en: {
    back: 'Back to roadmap',
    doc_label: 'Robotics & Autonomy',
    eyebrow: 'Autonomous fleets',
    hero_title: 'Robotics & Autonomy',
    hero_accent: 'Drones, ROVs & rovers for water infrastructure',
    hero_lead:
      'Autonomous fleets for inspection, construction, dredging and monitoring. Watch the live fleet, filter by type and open per-unit telemetry.',
    kpi_units: 'Units deployed',
    kpi_autonomy: 'Autonomy hours / day',
    kpi_area: 'Area / day, km²',
    kpi_uptime: 'Fleet uptime',
    fleet_eyebrow: 'Live fleet console',
    fleet_title: 'Autonomous unit dispatcher',
    fleet_sub:
      'Filter the fleet by class, track patrol routes on the map and select a unit to open its telemetry panel. Aggregates recompute with the filter.',
    filter_all: 'All',
    filter_aerial: 'Aerial',
    filter_aquatic: 'Aquatic',
    filter_ground: 'Ground',
    stat_shown: 'In view',
    stat_active: 'Active',
    stat_charging: 'Charging',
    stat_fault: 'Fault',
    stat_avgbat: 'Avg battery',
    map_title: 'Patrol map',
    map_sub: 'Each dot is an autonomous unit on route. Tap to select.',
    unit_battery: 'Battery',
    unit_task: 'Task',
    unit_status: 'Status',
    unit_speed: 'Speed',
    unit_signal: 'Signal',
    unit_select_hint: 'Select a unit on the map or in the list',
    status_active: 'Active',
    status_charging: 'Charging',
    status_fault: 'Fault',
    task_inspection: 'Inspection',
    task_dredging: 'Dredging',
    task_mapping: 'Mapping',
    task_construction: 'Construction',
    task_monitoring: 'Monitoring',
    classes_eyebrow: 'Machine classes',
    classes_title: 'Three autonomous classes',
    classes_sub: 'Specialised platforms for air, water and land, unified by a single autopilot.',
    class_aerial_t: 'Aerial drones',
    class_aerial_d: 'UAVs for dam photogrammetry, thermal inspection and shoreline mapping.',
    class_aquatic_t: 'Aquatic ROVs',
    class_aquatic_d: 'Submersibles for pipeline inspection, sonar seabed survey and dredging control.',
    class_ground_t: 'Ground rovers',
    class_ground_d: 'Tracked rovers for sensor deployment, soil sampling and perimeter patrol.',
    spec_endurance: 'Endurance',
    spec_range: 'Range',
    spec_payload: 'Payload',
    trend_eyebrow: 'Dynamics',
    trend_title: 'Fleet trends',
    trend_sub: 'Covered area grows as the fleet scales; detected incidents fall as autonomous monitoring matures.',
    chart_coverage: 'Coverage, km²/day',
    chart_incidents: 'Incidents / week',
    years_note: 'Periods: 2026 → 2032',
    cta_title: 'Autonomy is the platform’s operational layer',
    cta_sub: 'How the robot fleet fits into the roadmap and the ArkheOSium architecture.',
    cta_roadmap: 'Roadmap',
    cta_wp: 'Full whitepaper',
    copyright: '© ArkheOSium — Planetary Infrastructure OS. Data is illustrative.',
  },
} as const;

// ─── Types ───────────────────────────────────────────────────────────────────────

type RobotClass = 'aerial' | 'aquatic' | 'ground';
type RobotStatus = 'active' | 'charging' | 'fault';
type FilterKey = 'all' | RobotClass;

interface Robot {
  id: string;
  cls: RobotClass;
  taskKey: string; // maps into STRINGS task_*
  battery: number; // 0..100
  status: RobotStatus;
  speed: number; // km/h
  signal: number; // 0..100
  x: number; // 0..100 map position
  y: number; // 0..100 map position
}

interface ClassCard {
  cls: RobotClass;
  Icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  color: string;
  endurance: string;
  range: string;
  payload: string;
}

// ─── Deterministic pseudo-random (stable across renders) ────────────────────────

function hash(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

// ─── Mock fleet (deterministic, generated once) ─────────────────────────────────

const CLASSES: RobotClass[] = ['aerial', 'aquatic', 'ground'];
const CLASS_PREFIX: Record<RobotClass, string> = { aerial: 'AIR', aquatic: 'AQ', ground: 'GRD' };
const CLASS_TASKS: Record<RobotClass, string[]> = {
  aerial: ['inspection', 'mapping', 'monitoring'],
  aquatic: ['inspection', 'dredging', 'mapping'],
  ground: ['construction', 'monitoring', 'inspection'],
};
const STATUS_ORDER: RobotStatus[] = ['active', 'active', 'active', 'charging', 'active', 'fault', 'active', 'charging'];

function buildFleet(): Robot[] {
  const fleet: Robot[] = [];
  let counter = 0;
  CLASSES.forEach((cls, ci) => {
    const count = cls === 'aerial' ? 9 : cls === 'aquatic' ? 7 : 6;
    for (let i = 0; i < count; i++) {
      const seed = ci * 31 + i;
      const status = STATUS_ORDER[(ci + i) % STATUS_ORDER.length];
      const tasks = CLASS_TASKS[cls];
      fleet.push({
        id: `${CLASS_PREFIX[cls]}-${String(i + 1).padStart(2, '0')}`,
        cls,
        taskKey: tasks[i % tasks.length],
        battery: status === 'charging'
          ? Math.round(18 + hash(seed) * 40)
          : status === 'fault'
            ? Math.round(4 + hash(seed) * 30)
            : Math.round(52 + hash(seed) * 46),
        status,
        speed: Math.round((cls === 'aerial' ? 22 : cls === 'aquatic' ? 6 : 9) + hash(seed + 5) * 8),
        signal: Math.round(60 + hash(seed + 11) * 40),
        x: Math.round(8 + hash(seed + 3) * 84),
        y: Math.round(10 + hash(seed + 7) * 80),
      });
      counter++;
    }
  });
  return fleet;
}

const FLEET: Robot[] = buildFleet();

const CLASS_META: Record<RobotClass, { Icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>; color: string }> = {
  aerial: { Icon: Plane, color: ACCENT },
  aquatic: { Icon: Anchor, color: '#00d4ff' },
  ground: { Icon: Truck, color: ACCENT2 },
};

const STATUS_COLOR: Record<RobotStatus, string> = {
  active: '#22c55e',
  charging: '#00d4ff',
  fault: '#f87171',
};

// ─── Reusable animated section ──────────────────────────────────────────────────

function Section({
  id, eyebrow, title, subtitle, children,
}: {
  id: string; eyebrow?: string; title: string; subtitle?: string; children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 py-14 md:py-20 border-t border-white/5 first:border-0">
      <div className="max-w-5xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          {eyebrow && (
            <div className="text-xs font-semibold uppercase tracking-[0.25em] mb-3" style={{ color: ACCENT }}>
              {eyebrow}
            </div>
          )}
          <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight leading-tight">{title}</h2>
          {subtitle && <p className="mt-4 text-gray-400 text-sm md:text-base max-w-2xl leading-relaxed">{subtitle}</p>}
        </motion.div>
        {children}
      </div>
    </section>
  );
}

// ─── KPI tile ───────────────────────────────────────────────────────────────────

function KpiTile({
  Icon, val, label, color, trend,
}: {
  Icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  val: string; label: string; color: string; trend?: 'up' | 'down';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.4 }}
      className="bg-[#000d24] border border-white/10 rounded-2xl p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: color + '18', color }}>
          <Icon size={17} />
        </div>
        {trend === 'down' && <TrendingDown size={15} className="text-emerald-400" />}
        {trend === 'up' && <TrendingUp size={15} style={{ color: ACCENT }} />}
      </div>
      <div className="text-2xl font-black font-mono" style={{ color }}>{val}</div>
      <div className="text-[11px] text-gray-500 mt-1 leading-tight">{label}</div>
    </motion.div>
  );
}

// ─── Trend chart (SVG area) ─────────────────────────────────────────────────────

function TrendChart({
  points, color, title, unit, reduce,
}: {
  points: number[]; color: string; title: string; unit: string; reduce: boolean;
}) {
  const W = 480;
  const H = 160;
  const PAD = 8;
  const max = Math.max(...points, 1) * 1.1;
  const step = (W - PAD * 2) / (points.length - 1);
  const coords = points.map((p, i) => {
    const x = PAD + i * step;
    const y = PAD + (1 - p / max) * (H - PAD * 2);
    return [x, y] as const;
  });
  const line = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${line} L${coords[coords.length - 1][0].toFixed(1)},${H - PAD} L${coords[0][0].toFixed(1)},${H - PAD} Z`;
  const last = points[points.length - 1];
  const gid = `grad-${title.replace(/[^a-zA-Z]/g, '')}`;

  return (
    <div className="bg-[#000d24] border border-white/10 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-white">{title}</span>
        <span className="text-lg font-black font-mono" style={{ color }}>{Math.round(last)}{unit}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="none">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((g) => (
          <line key={g} x1={PAD} x2={W - PAD} y1={PAD + g * (H - PAD * 2)} y2={PAD + g * (H - PAD * 2)}
            stroke="#ffffff" strokeOpacity="0.05" strokeWidth="1" />
        ))}
        <motion.path
          d={area}
          fill={`url(#${gid})`}
          initial={false}
          animate={{ d: area }}
          transition={reduce ? { duration: 0 } : { duration: 0.5, ease: 'easeOut' }}
        />
        <motion.path
          d={line}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={{ d: line }}
          transition={reduce ? { duration: 0 } : { duration: 0.5, ease: 'easeOut' }}
        />
        <circle cx={coords[coords.length - 1][0]} cy={coords[coords.length - 1][1]} r="4" fill={color} />
      </svg>
    </div>
  );
}

// ─── Small stat pill for aggregate row ──────────────────────────────────────────

function StatPill({ label, val, color }: { label: string; val: string | number; color: string }) {
  return (
    <div className="bg-white/5 rounded-xl px-3 py-2 text-center flex-1 min-w-[70px]">
      <div className="text-lg font-black font-mono leading-none" style={{ color }}>{val}</div>
      <div className="text-[9px] text-gray-500 mt-1 uppercase tracking-wider">{label}</div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════

export default function RoboticsPage() {
  const [, navigate] = useLocation();
  const { i18n } = useTranslation();
  const reduce = useReducedMotion() ?? false;
  const lang = (i18n.language || 'ru').slice(0, 2);
  const s = (STRINGS as Record<string, typeof STRINGS.ru>)[lang] ?? STRINGS.ru;

  const [filter, setFilter] = useState<FilterKey>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const taskLabel = (key: string): string =>
    (s as unknown as Record<string, string>)[`task_${key}`] ?? key;
  const statusLabel = (st: RobotStatus): string =>
    (s as unknown as Record<string, string>)[`status_${st}`] ?? st;

  // Filtered view of the fleet
  const shown = useMemo(
    () => (filter === 'all' ? FLEET : FLEET.filter((r) => r.cls === filter)),
    [filter],
  );

  // Aggregate stats recompute with the filter
  const agg = useMemo(() => {
    const active = shown.filter((r) => r.status === 'active').length;
    const charging = shown.filter((r) => r.status === 'charging').length;
    const fault = shown.filter((r) => r.status === 'fault').length;
    const avgBat = shown.length
      ? Math.round(shown.reduce((a, r) => a + r.battery, 0) / shown.length)
      : 0;
    return { total: shown.length, active, charging, fault, avgBat };
  }, [shown]);

  // When filter hides the selected unit, drop the selection
  const selected = useMemo(
    () => shown.find((r) => r.id === selectedId) ?? null,
    [shown, selectedId],
  );

  // Hero KPIs (fleet-wide, static-ish)
  const kpiUnits = FLEET.length;
  const kpiAutonomy = 18;
  const kpiArea = 42;
  const kpiUptime = Math.round(
    (FLEET.filter((r) => r.status !== 'fault').length / FLEET.length) * 1000,
  ) / 10;

  // Filter buttons
  const filters: { key: FilterKey; label: string; color: string }[] = [
    { key: 'all', label: s.filter_all, color: ACCENT },
    { key: 'aerial', label: s.filter_aerial, color: CLASS_META.aerial.color },
    { key: 'aquatic', label: s.filter_aquatic, color: CLASS_META.aquatic.color },
    { key: 'ground', label: s.filter_ground, color: CLASS_META.ground.color },
  ];

  // Class spec cards
  const classCards: ClassCard[] = [
    { cls: 'aerial', Icon: Plane, color: CLASS_META.aerial.color, endurance: '55 min', range: '12 km', payload: '4 kg' },
    { cls: 'aquatic', Icon: Anchor, color: CLASS_META.aquatic.color, endurance: '6 h', range: '3 km', payload: '25 kg' },
    { cls: 'ground', Icon: Truck, color: CLASS_META.ground.color, endurance: '14 h', range: '40 km', payload: '120 kg' },
  ];
  const classText: Record<RobotClass, { t: string; d: string }> = {
    aerial: { t: s.class_aerial_t, d: s.class_aerial_d },
    aquatic: { t: s.class_aquatic_t, d: s.class_aquatic_d },
    ground: { t: s.class_ground_t, d: s.class_ground_d },
  };

  // Trend series
  const coverageSeries = [12, 18, 24, 30, 35, 39, 42];
  const incidentsSeries = [48, 41, 33, 27, 22, 18, 14];

  return (
    <div className="min-h-screen text-gray-200">

      {/* ── Top bar ── */}
      <div className="sticky top-0 z-40 bg-[#000818]/95 backdrop-blur border-b border-white/5 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate('/roadmap')}
          className="flex items-center gap-2 text-sm hover:opacity-100 opacity-70 transition-opacity flex-shrink-0"
          style={{ color: ACCENT }}
        >
          <ArrowLeft size={16} /> {s.back}
        </button>
        <div className="flex items-center gap-2 text-sm text-gray-400 flex-shrink-0">
          <Bot size={14} />
          <span className="hidden sm:inline">{s.doc_label}</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => navigate('/whitepaper-full')}
            className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border transition-colors"
            style={{ borderColor: ACCENT + '4d', color: ACCENT }}
          >
            <FileText size={12} /> {s.cta_wp}
          </button>
        </div>
      </div>

      {/* ══ HERO ══ */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a1c00]/40 via-[#00153a]/30 to-[#000818]" />
          {!reduce && (
            <>
              <motion.div
                className="absolute -top-20 right-0 w-[560px] h-[340px] rounded-full bg-[#b6ff2e]/8 blur-3xl"
                animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
                transition={{ duration: 13, repeat: Infinity }}
              />
              <motion.div
                className="absolute bottom-0 left-1/4 w-[440px] h-[220px] rounded-full bg-[#ffb020]/10 blur-3xl"
                animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
                transition={{ duration: 15, repeat: Infinity }}
              />
            </>
          )}
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div
              className="flex items-center gap-2 text-xs rounded-full px-3 py-1 mb-6 w-fit"
              style={{ color: ACCENT, background: ACCENT + '1a', border: `1px solid ${ACCENT}33` }}
            >
              <Radar size={11} /> {s.eyebrow}
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white mb-5 tracking-tight leading-[0.98]">
              {s.hero_title}
              <br />
              <span className="bg-gradient-to-r from-[#b6ff2e] via-[#00e6c8] to-[#00d4ff] bg-clip-text text-transparent text-2xl md:text-4xl">
                {s.hero_accent}
              </span>
            </h1>

            <p className="text-gray-400 text-base md:text-lg mb-8 max-w-2xl leading-relaxed">
              {s.hero_lead}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl">
              <KpiTile Icon={Bot} val={String(kpiUnits)} label={s.kpi_units} color={ACCENT} trend="up" />
              <KpiTile Icon={Zap} val={`${kpiAutonomy}h`} label={s.kpi_autonomy} color={ACCENT2} trend="up" />
              <KpiTile Icon={MapPin} val={String(kpiArea)} label={s.kpi_area} color="#00d4ff" trend="up" />
              <KpiTile Icon={Gauge} val={`${kpiUptime}%`} label={s.kpi_uptime} color="#22c55e" trend="up" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ LIVE FLEET DASHBOARD (centerpiece) ══ */}
      <Section id="fleet" eyebrow={s.fleet_eyebrow} title={s.fleet_title} subtitle={s.fleet_sub}>
        <div className="bg-[#000d24] border border-white/10 rounded-2xl p-4 md:p-6">

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-5">
            {filters.map((f) => {
              const on = filter === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className="text-xs font-semibold px-3.5 py-1.5 rounded-lg border transition-all"
                  style={{
                    borderColor: on ? f.color : 'rgba(255,255,255,0.12)',
                    background: on ? f.color + '1f' : 'transparent',
                    color: on ? f.color : '#9ca3af',
                  }}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          {/* Aggregate stats */}
          <div className="flex flex-wrap gap-2 mb-6">
            <StatPill label={s.stat_shown} val={agg.total} color={ACCENT} />
            <StatPill label={s.stat_active} val={agg.active} color={STATUS_COLOR.active} />
            <StatPill label={s.stat_charging} val={agg.charging} color={STATUS_COLOR.charging} />
            <StatPill label={s.stat_fault} val={agg.fault} color={STATUS_COLOR.fault} />
            <StatPill label={s.stat_avgbat} val={`${agg.avgBat}%`} color={ACCENT2} />
          </div>

          <div className="grid lg:grid-cols-5 gap-5">

            {/* Patrol map (SVG) */}
            <div className="lg:col-span-3">
              <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: ACCENT }}>
                {s.map_title}
              </div>
              <div className="text-[11px] text-gray-500 mb-3">{s.map_sub}</div>
              <div className="relative rounded-xl overflow-hidden border border-white/10 bg-[#00081c]">
                <svg viewBox="0 0 100 68" className="w-full h-auto" role="img" aria-label={s.map_title}>
                  {/* grid backdrop */}
                  {Array.from({ length: 9 }, (_, i) => (
                    <line key={`v${i}`} x1={i * 12.5} y1={0} x2={i * 12.5} y2={68}
                      stroke="#ffffff" strokeOpacity="0.04" strokeWidth="0.3" />
                  ))}
                  {Array.from({ length: 6 }, (_, i) => (
                    <line key={`h${i}`} x1={0} y1={i * 13.6} x2={100} y2={i * 13.6}
                      stroke="#ffffff" strokeOpacity="0.04" strokeWidth="0.3" />
                  ))}
                  {/* stylised waterway */}
                  <path
                    d="M0,44 C22,36 34,52 52,46 C70,40 82,54 100,48"
                    fill="none" stroke={CLASS_META.aquatic.color} strokeOpacity="0.18" strokeWidth="4"
                    strokeLinecap="round"
                  />

                  {/* units */}
                  {shown.map((r) => {
                    const cx = (r.x / 100) * 100;
                    const cy = (r.y / 100) * 68;
                    const col = CLASS_META[r.cls].color;
                    const isSel = selected?.id === r.id;
                    return (
                      <g key={r.id} onClick={() => setSelectedId(r.id)} style={{ cursor: 'pointer' }}>
                        {/* patrol ring for active units */}
                        {r.status === 'active' && !reduce && (
                          <motion.circle
                            cx={cx} cy={cy} r={2.4}
                            fill="none" stroke={col} strokeWidth="0.4" strokeOpacity="0.5"
                            initial={{ scale: 0.6, opacity: 0.6 }}
                            animate={{ scale: [0.6, 1.8], opacity: [0.6, 0] }}
                            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }}
                            style={{ transformOrigin: `${cx}px ${cy}px` }}
                          />
                        )}
                        {isSel && (
                          <circle cx={cx} cy={cy} r={3.4} fill="none" stroke={ACCENT} strokeWidth="0.6" />
                        )}
                        <circle
                          cx={cx} cy={cy} r={isSel ? 2 : 1.5}
                          fill={col}
                          stroke={r.status === 'fault' ? STATUS_COLOR.fault : '#00081c'}
                          strokeWidth="0.4"
                          opacity={r.status === 'fault' ? 0.9 : 1}
                        />
                      </g>
                    );
                  })}
                </svg>
                {/* legend */}
                <div className="absolute bottom-2 left-2 flex gap-3 text-[9px] text-gray-400">
                  {CLASSES.map((c) => (
                    <span key={c} className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full" style={{ background: CLASS_META[c].color }} />
                      {c === 'aerial' ? s.filter_aerial : c === 'aquatic' ? s.filter_aquatic : s.filter_ground}
                    </span>
                  ))}
                </div>
              </div>

              {/* Unit list */}
              <div className="mt-4 grid sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                {shown.map((r) => {
                  const isSel = selected?.id === r.id;
                  const col = CLASS_META[r.cls].color;
                  return (
                    <button
                      key={r.id}
                      onClick={() => setSelectedId(r.id)}
                      className="flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition-all"
                      style={{
                        borderColor: isSel ? ACCENT : 'rgba(255,255,255,0.08)',
                        background: isSel ? ACCENT + '12' : 'rgba(255,255,255,0.02)',
                      }}
                    >
                      <span className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                        style={{ background: col + '1f', color: col }}>
                        {(() => { const I = CLASS_META[r.cls].Icon; return <I size={12} />; })()}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-xs font-mono font-bold text-white truncate">{r.id}</span>
                        <span className="block text-[10px] text-gray-500 truncate">{taskLabel(r.taskKey)}</span>
                      </span>
                      <span className="flex flex-col items-end flex-shrink-0">
                        <span className="text-[10px] font-mono" style={{ color: r.battery < 25 ? STATUS_COLOR.fault : '#e5e7eb' }}>
                          {r.battery}%
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full mt-1" style={{ background: STATUS_COLOR[r.status] }} />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Detail panel */}
            <div className="lg:col-span-2">
              <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: ACCENT }}>
                Telemetry
              </div>
              {selected ? (
                <motion.div
                  key={selected.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduce ? 0 : 0.3 }}
                  className="rounded-2xl border border-white/10 bg-[#00081c] p-4"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{ background: CLASS_META[selected.cls].color + '1f', color: CLASS_META[selected.cls].color }}>
                      {(() => { const I = CLASS_META[selected.cls].Icon; return <I size={22} />; })()}
                    </span>
                    <div>
                      <div className="text-lg font-black font-mono text-white leading-none">{selected.id}</div>
                      <div className="text-[11px] text-gray-500 mt-1">{taskLabel(selected.taskKey)}</div>
                    </div>
                    <span className="ml-auto flex items-center gap-1.5 text-[11px] font-semibold px-2 py-1 rounded-lg"
                      style={{ background: STATUS_COLOR[selected.status] + '1f', color: STATUS_COLOR[selected.status] }}>
                      {selected.status === 'active' && <Activity size={11} />}
                      {selected.status === 'charging' && <BatteryCharging size={11} />}
                      {selected.status === 'fault' && <AlertTriangle size={11} />}
                      {statusLabel(selected.status)}
                    </span>
                  </div>

                  {/* battery bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-gray-400">{s.unit_battery}</span>
                      <span className="font-mono" style={{ color: selected.battery < 25 ? STATUS_COLOR.fault : ACCENT }}>
                        {selected.battery}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: selected.battery < 25 ? STATUS_COLOR.fault : ACCENT }}
                        initial={{ width: 0 }}
                        animate={{ width: `${selected.battery}%` }}
                        transition={{ duration: reduce ? 0 : 0.5 }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-white/5 rounded-lg p-2.5">
                      <div className="text-gray-500 mb-1">{s.unit_speed}</div>
                      <div className="font-mono font-bold text-white">{selected.speed} km/h</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2.5">
                      <div className="text-gray-500 mb-1">{s.unit_signal}</div>
                      <div className="font-mono font-bold text-white">{selected.signal}%</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2.5">
                      <div className="text-gray-500 mb-1">{s.unit_task}</div>
                      <div className="font-semibold text-white">{taskLabel(selected.taskKey)}</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2.5">
                      <div className="text-gray-500 mb-1">{s.unit_status}</div>
                      <div className="font-semibold" style={{ color: STATUS_COLOR[selected.status] }}>
                        {statusLabel(selected.status)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-[#00081c] p-8 text-center">
                  <Cpu size={28} className="mx-auto mb-3 text-gray-600" />
                  <div className="text-xs text-gray-500 leading-relaxed">{s.unit_select_hint}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Section>

      {/* ══ ROBOT CLASSES ══ */}
      <Section id="classes" eyebrow={s.classes_eyebrow} title={s.classes_title} subtitle={s.classes_sub}>
        <div className="grid md:grid-cols-3 gap-4">
          {classCards.map((c, i) => (
            <motion.div
              key={c.cls}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border p-5"
              style={{ borderColor: c.color + '30', background: `linear-gradient(135deg, ${c.color}0a, transparent)` }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: c.color + '1f', color: c.color }}>
                <c.Icon size={22} />
              </div>
              <h3 className="text-white font-bold mb-2">{classText[c.cls].t}</h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-4 min-h-[60px]">{classText[c.cls].d}</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white/5 rounded-lg py-2">
                  <div className="text-sm font-black font-mono" style={{ color: c.color }}>{c.endurance}</div>
                  <div className="text-[9px] text-gray-500 mt-0.5">{s.spec_endurance}</div>
                </div>
                <div className="bg-white/5 rounded-lg py-2">
                  <div className="text-sm font-black font-mono" style={{ color: c.color }}>{c.range}</div>
                  <div className="text-[9px] text-gray-500 mt-0.5">{s.spec_range}</div>
                </div>
                <div className="bg-white/5 rounded-lg py-2">
                  <div className="text-sm font-black font-mono" style={{ color: c.color }}>{c.payload}</div>
                  <div className="text-[9px] text-gray-500 mt-0.5">{s.spec_payload}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ══ TREND CHARTS ══ */}
      <Section id="trends" eyebrow={s.trend_eyebrow} title={s.trend_title} subtitle={s.trend_sub}>
        <div className="grid md:grid-cols-2 gap-4">
          <TrendChart points={coverageSeries} color={ACCENT} title={s.chart_coverage} unit="" reduce={reduce} />
          <TrendChart points={incidentsSeries} color={ACCENT2} title={s.chart_incidents} unit="" reduce={reduce} />
        </div>
        <div className="text-[11px] text-gray-600 mt-3 text-center">{s.years_note}</div>
      </Section>

      {/* ══ CTA ══ */}
      <section id="cta" className="scroll-mt-24 py-16 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border p-8 text-center bg-gradient-to-b from-[#b6ff2e]/5 to-transparent"
            style={{ borderColor: ACCENT + '33' }}
          >
            <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-5"
              style={{ background: ACCENT + '1a', color: ACCENT }}>
              <Bot size={26} />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white mb-3">{s.cta_title}</h2>
            <p className="text-gray-400 text-sm md:text-base mb-7 max-w-xl mx-auto leading-relaxed">{s.cta_sub}</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => navigate('/roadmap')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border transition-colors text-sm font-medium"
                style={{ background: ACCENT + '1a', borderColor: ACCENT + '4d', color: ACCENT }}
              >
                <Compass size={14} /> {s.cta_roadmap}
              </button>
              <button
                onClick={() => navigate('/whitepaper-full')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00d4ff]/10 border border-[#00d4ff]/30 text-[#00d4ff] hover:bg-[#00d4ff]/20 transition-colors text-sm font-medium"
              >
                <FileText size={14} /> {s.cta_wp}
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-8">{s.copyright}</p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
