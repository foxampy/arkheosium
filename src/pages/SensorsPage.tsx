import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useLocation } from 'wouter';
import { motion, useInView, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, Waves, Activity, Radio, Droplets, Gauge, Thermometer,
  Bell, TrendingUp, ChevronRight, FileText, Cpu, Wifi, AlertTriangle,
  CheckCircle2, CircleDot, Signal,
} from 'lucide-react';

// ══════════════════════════════════════════════════════════════════════════════
//  ArkheOSium — Underwater Sensor Network (live IoT telemetry dashboard)
//  Route: /sensors  · all data mock/simulated, updated live client-side
// ══════════════════════════════════════════════════════════════════════════════

const ACCENT = '#00e6c8';
const ACCENT2 = '#00d4ff';

// ─── Self-contained bilingual strings ────────────────────────────────────────────

const STRINGS = {
  ru: {
    back: 'Дорожная карта',
    doc_label: 'Морская сеть датчиков',
    badge_live: 'LIVE · телеметрия',
    badge_iot: 'IoT · Sensor Network',
    hero_title_a: 'Подводная сеть',
    hero_title_b: 'датчиков качества воды',
    hero_lead: 'Автономная сеть буёв непрерывно измеряет параметры морской среды и передаёт телеметрию в планетарный цифровой двойник в реальном времени.',
    kpi_buoys: 'активных буёв',
    kpi_oxygen: 'ср. раств. O₂ (мг/л)',
    kpi_salinity: 'ср. солёность (‰)',
    kpi_turbidity: 'ср. мутность (NTU)',
    kpi_uptime: 'аптайм сети',
    map_eyebrow: 'Топология сети',
    map_title: 'Карта буёв и шлюза',
    map_sub: 'Каждый узел передаёт данные на центральный шлюз. Нажмите узел, чтобы открыть его телеметрию.',
    gateway: 'Шлюз',
    status_ok: 'Норма',
    status_warn: 'Внимание',
    status_alert: 'Тревога',
    detail_eyebrow: 'Телеметрия узла',
    detail_title: 'Буй',
    detail_sub: 'Живые показания выбранного буя. Значения обновляются каждые ~2 секунды.',
    g_ph: 'pH',
    g_oxygen: 'O₂ мг/л',
    g_salinity: '‰',
    g_temp: '°C',
    g_turbidity: 'NTU',
    spark_label: 'Раств. кислород — последние отсчёты',
    depth: 'Глубина',
    signal: 'Сигнал',
    battery: 'Батарея',
    lastseen: 'Обновлено',
    now: 'только что',
    alerts_eyebrow: 'Раннее предупреждение',
    alerts_title: 'Лента событий',
    alerts_sub: 'Превышения порогов и аномалии по всей сети. Новые события — сверху.',
    alerts_empty: 'Сеть в норме. Событий нет.',
    trend_eyebrow: 'Аналитика',
    trend_title: 'Тренд параметра',
    trend_sub: 'Динамика выбранного параметра по последним отсчётам сети.',
    cta_title: 'Территория, которая сообщает о себе',
    cta_sub: 'Сеть датчиков — часть экосистемы ArkheOSium: от наблюдения до автономного управления средой.',
    cta_roadmap: 'Дорожная карта',
    cta_wp: 'Полный whitepaper',
    copyright: '© ArkheOSium · демонстрационная телеметрия (симуляция)',
    param_ph: 'Кислотность pH',
    param_oxygen: 'Раств. кислород',
    param_salinity: 'Солёность',
    param_temp: 'Температура',
    param_turbidity: 'Мутность',
    ev_high: 'выше порога',
    ev_low: 'ниже порога',
  },
  en: {
    back: 'Roadmap',
    doc_label: 'Underwater Sensor Network',
    badge_live: 'LIVE · telemetry',
    badge_iot: 'IoT · Sensor Network',
    hero_title_a: 'Underwater network of',
    hero_title_b: 'water-quality sensors',
    hero_lead: 'An autonomous buoy network continuously measures marine parameters and streams telemetry into the planetary digital twin in real time.',
    kpi_buoys: 'active buoys',
    kpi_oxygen: 'avg dissolved O₂ (mg/L)',
    kpi_salinity: 'avg salinity (‰)',
    kpi_turbidity: 'avg turbidity (NTU)',
    kpi_uptime: 'network uptime',
    map_eyebrow: 'Network topology',
    map_title: 'Buoy & gateway map',
    map_sub: 'Every node streams to the central gateway. Click a node to open its telemetry.',
    gateway: 'Gateway',
    status_ok: 'OK',
    status_warn: 'Warning',
    status_alert: 'Alert',
    detail_eyebrow: 'Node telemetry',
    detail_title: 'Buoy',
    detail_sub: 'Live readings for the selected buoy. Values refresh every ~2 seconds.',
    g_ph: 'pH',
    g_oxygen: 'O₂ mg/L',
    g_salinity: '‰',
    g_temp: '°C',
    g_turbidity: 'NTU',
    spark_label: 'Dissolved oxygen — recent samples',
    depth: 'Depth',
    signal: 'Signal',
    battery: 'Battery',
    lastseen: 'Updated',
    now: 'just now',
    alerts_eyebrow: 'Early warning',
    alerts_title: 'Live alerts feed',
    alerts_sub: 'Threshold breaches and anomalies across the network. Newest on top.',
    alerts_empty: 'Network nominal. No events.',
    trend_eyebrow: 'Analytics',
    trend_title: 'Parameter trend',
    trend_sub: 'Behaviour of the chosen parameter across the latest network samples.',
    cta_title: 'A territory that reports on itself',
    cta_sub: 'The sensor network is part of the ArkheOSium ecosystem: from observation to autonomous environmental control.',
    cta_roadmap: 'Roadmap',
    cta_wp: 'Full whitepaper',
    copyright: '© ArkheOSium · demonstration telemetry (simulated)',
    param_ph: 'pH acidity',
    param_oxygen: 'Dissolved oxygen',
    param_salinity: 'Salinity',
    param_temp: 'Temperature',
    param_turbidity: 'Turbidity',
    ev_high: 'above threshold',
    ev_low: 'below threshold',
  },
} as const;

// ─── Types ─────────────────────────────────────────────────────────────────────

type Status = 'ok' | 'warn' | 'alert';
type ParamKey = 'ph' | 'oxygen' | 'salinity' | 'temp' | 'turbidity';

interface Reading {
  ph: number;
  oxygen: number;
  salinity: number;
  temp: number;
  turbidity: number;
}

interface Buoy extends Reading {
  id: string;
  label: string;
  x: number; // 0..1 within map viewBox
  y: number;
  depth: number;
  signal: number; // 0..100
  battery: number; // 0..100
  status: Status;
  history: number[]; // rolling dissolved-oxygen sparkline data
  updatedAt: number;
}

interface AlertItem {
  id: number;
  buoy: string;
  param: ParamKey;
  value: number;
  dir: 'high' | 'low';
  severity: 'warn' | 'alert';
  ts: number;
}

// ─── Simulation ranges / thresholds ──────────────────────────────────────────────

const RANGES: Record<ParamKey, { min: number; max: number; step: number; warnLo: number; warnHi: number; alertLo: number; alertHi: number; decimals: number }> = {
  ph:        { min: 7.4, max: 8.6, step: 0.05, warnLo: 7.7, warnHi: 8.35, alertLo: 7.55, alertHi: 8.5, decimals: 2 },
  oxygen:    { min: 4.0, max: 9.5, step: 0.18, warnLo: 5.5, warnHi: 8.8, alertLo: 4.6, alertHi: 9.2, decimals: 1 },
  salinity:  { min: 8.0, max: 14.0, step: 0.12, warnLo: 9.0, warnHi: 12.8, alertLo: 8.4, alertHi: 13.5, decimals: 1 },
  temp:      { min: 9.0, max: 24.0, step: 0.25, warnLo: 11, warnHi: 22, alertLo: 9.8, alertHi: 23.2, decimals: 1 },
  turbidity: { min: 1.0, max: 22.0, step: 0.6, warnLo: 2, warnHi: 12, alertLo: 2, alertHi: 17, decimals: 1 },
};

const PARAM_META: Record<ParamKey, { color: string; unit: string }> = {
  ph:        { color: '#00e6c8', unit: '' },
  oxygen:    { color: '#00d4ff', unit: 'mg/L' },
  salinity:  { color: '#a78bfa', unit: '‰' },
  temp:      { color: '#fbbf24', unit: '°C' },
  turbidity: { color: '#f472b6', unit: 'NTU' },
};

const STATUS_COLOR: Record<Status, string> = { ok: '#22c55e', warn: '#fbbf24', alert: '#f87171' };

const HISTORY_CAP = 30;

// scattered buoy layout (deterministic, hand-tuned to look organic around a centre gateway)
const LAYOUT: Array<{ x: number; y: number }> = [
  { x: 0.14, y: 0.22 }, { x: 0.27, y: 0.12 }, { x: 0.42, y: 0.20 }, { x: 0.62, y: 0.13 },
  { x: 0.78, y: 0.24 }, { x: 0.88, y: 0.42 }, { x: 0.82, y: 0.66 }, { x: 0.68, y: 0.82 },
  { x: 0.50, y: 0.88 }, { x: 0.32, y: 0.80 }, { x: 0.16, y: 0.66 }, { x: 0.10, y: 0.44 },
  { x: 0.36, y: 0.50 }, { x: 0.66, y: 0.48 },
];

// ─── Simulation helpers ──────────────────────────────────────────────────────────

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const round = (v: number, d: number) => { const f = 10 ** d; return Math.round(v * f) / f; };

function statusFor(r: Reading): Status {
  let worst: Status = 'ok';
  (Object.keys(RANGES) as ParamKey[]).forEach((k) => {
    const v = r[k];
    const rg = RANGES[k];
    if (v <= rg.alertLo || v >= rg.alertHi) worst = 'alert';
    else if ((v <= rg.warnLo || v >= rg.warnHi) && worst !== 'alert') worst = 'warn';
  });
  return worst;
}

function seedBuoy(i: number): Buoy {
  const base: Reading = {
    ph: round(rand(7.8, 8.25), 2),
    oxygen: round(rand(6.2, 8.4), 1),
    salinity: round(rand(9.6, 12.2), 1),
    temp: round(rand(13, 20), 1),
    turbidity: round(rand(2.5, 9), 1),
  };
  const { x, y } = LAYOUT[i];
  return {
    id: `B-${String(i + 1).padStart(2, '0')}`,
    label: `B-${String(i + 1).padStart(2, '0')}`,
    x, y,
    depth: Math.round(rand(6, 42)),
    signal: Math.round(rand(62, 99)),
    battery: Math.round(rand(48, 100)),
    status: statusFor(base),
    history: Array.from({ length: HISTORY_CAP }, () => base.oxygen + rand(-0.4, 0.4)),
    updatedAt: Date.now(),
    ...base,
  };
}

function nudge(v: number, key: ParamKey): number {
  const rg = RANGES[key];
  const next = v + rand(-rg.step, rg.step) * 1.4;
  return round(clamp(next, rg.min, rg.max), rg.decimals);
}

// ─── Reusable animated section ───────────────────────────────────────────────────

function Section({ id, eyebrow, title, subtitle, children }: {
  id?: string; eyebrow?: string; title: string; subtitle?: string; children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 py-12 md:py-16 border-t border-white/5 first:border-0">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          {eyebrow && (
            <div className="text-xs font-semibold uppercase tracking-[0.25em] mb-3" style={{ color: ACCENT }}>
              {eyebrow}
            </div>
          )}
          <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight leading-tight">{title}</h2>
          {subtitle && <p className="mt-3 text-gray-400 text-sm md:text-base max-w-2xl leading-relaxed">{subtitle}</p>}
        </motion.div>
        {children}
      </div>
    </section>
  );
}

// ─── KPI tile ──────────────────────────────────────────────────────────────────

function KpiTile({ Icon, val, label, color, i }: {
  Icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  val: string; label: string; color: string; i: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.4, delay: i * 0.05 }}
      className="bg-white/5 border border-white/10 backdrop-blur rounded-2xl p-4 relative overflow-hidden"
    >
      <div className="absolute -right-4 -top-4 opacity-10" style={{ color }}>
        <Icon size={64} />
      </div>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: color + '18', color }}>
        <Icon size={18} />
      </div>
      <div className="text-2xl md:text-3xl font-black font-mono tabular-nums" style={{ color }}>{val}</div>
      <div className="text-[11px] md:text-xs text-gray-500 mt-1">{label}</div>
    </motion.div>
  );
}

// ─── SVG arc gauge ───────────────────────────────────────────────────────────────

function ArcGauge({ value, min, max, label, unit, color, size = 96 }: {
  value: number; min: number; max: number; label: string; unit: string; color: string; size?: number;
}) {
  const stroke = 8;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const startAngle = 135; // sweep 270°
  const sweep = 270;
  const pct = clamp((value - min) / (max - min), 0, 1);
  const toXY = (angleDeg: number) => {
    const a = (angleDeg * Math.PI) / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
  };
  const arcPath = (fromDeg: number, toDeg: number) => {
    const [x1, y1] = toXY(fromDeg);
    const [x2, y2] = toXY(toDeg);
    const large = toDeg - fromDeg > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  };
  const endDeg = startAngle + sweep * pct;
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${label} ${value}`}>
        <path d={arcPath(startAngle, startAngle + sweep)} fill="none" stroke="#ffffff14" strokeWidth={stroke} strokeLinecap="round" />
        <path d={arcPath(startAngle, endDeg)} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          style={{ transition: 'all 0.9s cubic-bezier(0.22,1,0.36,1)', filter: `drop-shadow(0 0 4px ${color}88)` }} />
        <text x={cx} y={cy - 2} textAnchor="middle" className="font-mono font-black" fontSize={size * 0.2} fill="#fff">
          {value}
        </text>
        <text x={cx} y={cy + size * 0.16} textAnchor="middle" fontSize={size * 0.1} fill="#94a3b8">{unit}</text>
      </svg>
      <span className="text-[11px] text-gray-500 mt-1">{label}</span>
    </div>
  );
}

// ─── SVG sparkline ───────────────────────────────────────────────────────────────

function Sparkline({ data, color, w = 260, h = 56 }: { data: number[]; color: string; w?: number; h?: number }) {
  const pts = useMemo(() => {
    if (data.length < 2) return '';
    const min = Math.min(...data);
    const max = Math.max(...data);
    const span = max - min || 1;
    return data
      .map((v, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = h - ((v - min) / span) * (h - 6) - 3;
        return `${round(x, 1)},${round(y, 1)}`;
      })
      .join(' ');
  }, [data, w, h]);
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="overflow-visible">
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 3px ${color}77)` }} />
    </svg>
  );
}

// ─── SVG area trend chart ────────────────────────────────────────────────────────

function AreaChart({ data, color, w = 640, h = 200 }: { data: number[]; color: string; w?: number; h?: number }) {
  const { line, area } = useMemo(() => {
    if (data.length < 2) return { line: '', area: '' };
    const min = Math.min(...data);
    const max = Math.max(...data);
    const span = max - min || 1;
    const pad = 10;
    const coords = data.map((v, i) => {
      const x = (i / (data.length - 1)) * (w - pad * 2) + pad;
      const y = h - pad - ((v - min) / span) * (h - pad * 2);
      return [round(x, 1), round(y, 1)] as const;
    });
    const line = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ');
    const area = `${line} L ${coords[coords.length - 1][0]} ${h - pad} L ${coords[0][0]} ${h - pad} Z`;
    return { line, area };
  }, [data, w, h]);
  const gid = `grad-${color.replace('#', '')}`;
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="rounded-xl">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.35} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1={0} x2={w} y1={h * f} y2={h * f} stroke="#ffffff0a" strokeWidth={1} />
      ))}
      <path d={area} fill={`url(#${gid})`} />
      <path d={line} fill="none" stroke={color} strokeWidth={2.2} strokeLinejoin="round" strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 4px ${color}66)` }} />
    </svg>
  );
}

// ─── Node-graph map ──────────────────────────────────────────────────────────────

function NodeMap({ buoys, selectedId, onSelect, reduce }: {
  buoys: Buoy[]; selectedId: string; onSelect: (id: string) => void; reduce: boolean;
}) {
  const VB = 800;
  const H = 480;
  const gx = VB / 2;
  const gy = H / 2;
  return (
    <div className="bg-[#000d24] border border-white/10 rounded-2xl p-3 md:p-4">
      <svg viewBox={`0 0 ${VB} ${H}`} width="100%" className="block" role="group" aria-label="sensor network map">
        <defs>
          <radialGradient id="gwGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={ACCENT} stopOpacity={0.35} />
            <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
          </radialGradient>
        </defs>

        {/* connecting lines */}
        {buoys.map((b) => {
          const bx = b.x * VB;
          const by = b.y * H;
          return (
            <line key={`l-${b.id}`} x1={gx} y1={gy} x2={bx} y2={by}
              stroke={b.id === selectedId ? STATUS_COLOR[b.status] : '#ffffff14'}
              strokeWidth={b.id === selectedId ? 1.6 : 1} strokeDasharray={b.id === selectedId ? '0' : '4 5'} />
          );
        })}

        {/* gateway */}
        <circle cx={gx} cy={gy} r={54} fill="url(#gwGlow)" />
        <circle cx={gx} cy={gy} r={22} fill="#00121f" stroke={ACCENT} strokeWidth={2} />
        {!reduce && (
          <circle cx={gx} cy={gy} r={22} fill="none" stroke={ACCENT} strokeWidth={2} opacity={0.6}>
            <animate attributeName="r" from="22" to="48" dur="2.4s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.6" to="0" dur="2.4s" repeatCount="indefinite" />
          </circle>
        )}
        <text x={gx} y={gy + 5} textAnchor="middle" fontSize={16} fill={ACCENT} className="font-mono font-bold">◈</text>

        {/* buoy nodes */}
        {buoys.map((b, i) => {
          const bx = b.x * VB;
          const by = b.y * H;
          const c = STATUS_COLOR[b.status];
          const sel = b.id === selectedId;
          return (
            <g key={b.id} onClick={() => onSelect(b.id)} style={{ cursor: 'pointer' }} role="button" aria-label={`${b.id} ${b.status}`}>
              {sel && <circle cx={bx} cy={by} r={16} fill="none" stroke={c} strokeWidth={1.5} opacity={0.9} />}
              <circle cx={bx} cy={by} r={sel ? 9 : 7} fill={c} stroke="#00121f" strokeWidth={2}
                style={{ filter: `drop-shadow(0 0 5px ${c})` }} />
              {!reduce && (
                <circle cx={bx} cy={by} r={7} fill="none" stroke={c} strokeWidth={1.5} opacity={0.55}>
                  <animate attributeName="r" from="7" to="16" dur={`${2 + (i % 5) * 0.3}s`} repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.55" to="0" dur={`${2 + (i % 5) * 0.3}s`} repeatCount="indefinite" />
                </circle>
              )}
              <text x={bx} y={by - 14} textAnchor="middle" fontSize={11} fill={sel ? '#fff' : '#64748b'} className="font-mono">
                {b.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── Utility: relative time ──────────────────────────────────────────────────────

function ago(ts: number, nowLabel: string): string {
  const s = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (s < 3) return nowLabel;
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  return `${m}m ${s % 60}s`;
}

// ══════════════════════════════════════════════════════════════════════════════

export default function SensorsPage() {
  const [, navigate] = useLocation();
  const { i18n } = useTranslation();
  const reduce = useReducedMotion() ?? false;
  const lang = (i18n.language || 'ru').slice(0, 2);
  const s = (STRINGS as any)[lang] ?? STRINGS.ru;

  const [buoys, setBuoys] = useState<Buoy[]>(() => LAYOUT.map((_, i) => seedBuoy(i)));
  const [selectedId, setSelectedId] = useState<string>('B-01');
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [trendParam, setTrendParam] = useState<ParamKey>('oxygen');
  const [, forceTick] = useState(0); // drives "updated Xs ago" relabels

  const alertId = useRef(0);

  const paramLabel = useCallback((p: ParamKey): string => ({
    ph: s.param_ph, oxygen: s.param_oxygen, salinity: s.param_salinity, temp: s.param_temp, turbidity: s.param_turbidity,
  } as Record<ParamKey, string>)[p], [s]);

  // ── live simulation loop (cheap, capped arrays, paused when tab hidden) ──
  useEffect(() => {
    const tick = () => {
      if (document.hidden) return;
      setBuoys((prev) => {
        const newAlerts: AlertItem[] = [];
        const next = prev.map((b) => {
          const upd: Reading = {
            ph: nudge(b.ph, 'ph'),
            oxygen: nudge(b.oxygen, 'oxygen'),
            salinity: nudge(b.salinity, 'salinity'),
            temp: nudge(b.temp, 'temp'),
            turbidity: nudge(b.turbidity, 'turbidity'),
          };
          const status = statusFor(upd);

          // detect fresh threshold breaches → emit alerts (probabilistic to avoid spam)
          (Object.keys(RANGES) as ParamKey[]).forEach((k) => {
            const v = upd[k];
            const rg = RANGES[k];
            const wasBad = b[k] <= rg.warnLo || b[k] >= rg.warnHi;
            const isBad = v <= rg.warnLo || v >= rg.warnHi;
            if (isBad && !wasBad && Math.random() < 0.6) {
              const severe = v <= rg.alertLo || v >= rg.alertHi;
              newAlerts.push({
                id: ++alertId.current,
                buoy: b.id,
                param: k,
                value: v,
                dir: v >= rg.warnHi ? 'high' : 'low',
                severity: severe ? 'alert' : 'warn',
                ts: Date.now(),
              });
            }
          });

          const history = [...b.history, upd.oxygen].slice(-HISTORY_CAP);
          const signal = Math.round(clamp(b.signal + rand(-3, 3), 30, 100));
          const battery = Math.round(clamp(b.battery - rand(0, 0.15), 5, 100));
          return { ...b, ...upd, status, history, signal, battery, updatedAt: Date.now() };
        });

        if (newAlerts.length) {
          setAlerts((cur) => [...newAlerts.reverse(), ...cur].slice(0, 24));
        }
        return next;
      });
    };

    const interval = window.setInterval(tick, 2000);
    const relabel = window.setInterval(() => { if (!document.hidden) forceTick((n) => n + 1); }, 1000);
    const onVis = () => { if (!document.hidden) tick(); };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.clearInterval(interval);
      window.clearInterval(relabel);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  const selected = buoys.find((b) => b.id === selectedId) ?? buoys[0];

  // KPI aggregates
  const kpi = useMemo(() => {
    const n = buoys.length;
    const avg = (k: ParamKey) => round(buoys.reduce((a, b) => a + b[k], 0) / n, 1);
    const online = buoys.filter((b) => b.signal > 35).length;
    return {
      buoys: `${online}/${n}`,
      oxygen: avg('oxygen').toFixed(1),
      salinity: avg('salinity').toFixed(1),
      turbidity: avg('turbidity').toFixed(1),
      uptime: `${(99.2 + (online / n) * 0.7).toFixed(2)}%`,
    };
  }, [buoys]);

  // trend series = selected buoy history mapped, or network average per-tick approximation
  const trendData = useMemo(() => {
    if (trendParam === 'oxygen') return selected.history;
    // derive a pseudo-series from selected buoy history scaled toward the param's current value
    const cur = selected[trendParam];
    const rg = RANGES[trendParam];
    const base = selected.history;
    const bmin = Math.min(...base), bmax = Math.max(...base), span = bmax - bmin || 1;
    return base.map((v) => round(cur + ((v - (bmin + bmax) / 2) / span) * (rg.warnHi - rg.warnLo) * 0.25, rg.decimals));
  }, [selected, trendParam]);

  const statusLabel = (st: Status) => st === 'ok' ? s.status_ok : st === 'warn' ? s.status_warn : s.status_alert;

  return (
    <div className="min-h-screen bg-[#000818] text-gray-200">

      {/* ── Top bar ── */}
      <div className="sticky top-0 z-40 bg-[#000818]/95 backdrop-blur border-b border-white/5 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate('/roadmap')}
          className="flex items-center gap-2 text-sm text-[#00e6c8]/70 hover:text-[#00e6c8] transition-colors flex-shrink-0"
        >
          <ArrowLeft size={16} /> {s.back}
        </button>
        <div className="flex items-center gap-2 text-sm text-gray-400 flex-shrink-0">
          <Waves size={14} />
          <span className="hidden sm:inline">{s.doc_label}</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-full border border-[#22c55e]/30 text-[#22c55e] bg-[#22c55e]/5">
            {!reduce && <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />} {s.badge_live}
          </span>
        </div>
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
                className="absolute bottom-0 left-1/4 w-[460px] h-[240px] rounded-full bg-[#00d4ff]/10 blur-3xl"
                animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
                transition={{ duration: 14, repeat: Infinity }}
              />
            </>
          )}
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-14 md:py-20">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <div className="flex items-center gap-2 text-xs text-[#00e6c8] bg-[#00e6c8]/10 border border-[#00e6c8]/20 rounded-full px-3 py-1">
                <Activity size={11} /> {s.badge_live}
              </div>
              <div className="flex items-center gap-2 text-xs text-[#00d4ff] bg-[#00d4ff]/10 border border-[#00d4ff]/20 rounded-full px-3 py-1">
                <Radio size={11} /> {s.badge_iot}
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white mb-5 tracking-tight leading-[0.98]">
              {s.hero_title_a}
              <br />
              <span className="bg-gradient-to-r from-[#00e6c8] via-[#00d4ff] to-[#7c3aed] bg-clip-text text-transparent">
                {s.hero_title_b}
              </span>
            </h1>

            <p className="text-gray-400 text-base md:text-lg mb-8 max-w-2xl leading-relaxed">{s.hero_lead}</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <KpiTile Icon={CircleDot} val={kpi.buoys} label={s.kpi_buoys} color="#00e6c8" i={0} />
              <KpiTile Icon={Droplets} val={kpi.oxygen} label={s.kpi_oxygen} color="#00d4ff" i={1} />
              <KpiTile Icon={Gauge} val={kpi.salinity} label={s.kpi_salinity} color="#a78bfa" i={2} />
              <KpiTile Icon={Waves} val={kpi.turbidity} label={s.kpi_turbidity} color="#f472b6" i={3} />
              <KpiTile Icon={Wifi} val={kpi.uptime} label={s.kpi_uptime} color="#22c55e" i={4} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ NODE MAP + DETAIL (two-column on large) ══ */}
      <Section eyebrow={s.map_eyebrow} title={s.map_title} subtitle={s.map_sub}>
        <div className="grid lg:grid-cols-5 gap-5">
          {/* map */}
          <div className="lg:col-span-3">
            <NodeMap buoys={buoys} selectedId={selectedId} onSelect={setSelectedId} reduce={reduce} />
            {/* legend */}
            <div className="flex items-center gap-4 mt-3 px-1 flex-wrap text-xs text-gray-400">
              {(['ok', 'warn', 'alert'] as Status[]).map((st) => (
                <span key={st} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: STATUS_COLOR[st], boxShadow: `0 0 6px ${STATUS_COLOR[st]}` }} />
                  {statusLabel(st)}
                </span>
              ))}
              <span className="flex items-center gap-1.5 ml-auto text-gray-500">
                <Cpu size={13} style={{ color: ACCENT }} /> {s.gateway}
              </span>
            </div>
          </div>

          {/* selected detail */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 border border-white/10 backdrop-blur rounded-2xl p-5 h-full">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] mb-1" style={{ color: ACCENT }}>
                {s.detail_eyebrow}
              </div>
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-white font-black text-xl font-mono">{s.detail_title} {selected.label}</h3>
                <span className="ml-auto flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full"
                  style={{ color: STATUS_COLOR[selected.status], background: STATUS_COLOR[selected.status] + '18' }}>
                  {selected.status === 'ok' ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                  {statusLabel(selected.status)}
                </span>
              </div>

              {/* gauges */}
              <div className="grid grid-cols-3 gap-1 mb-4">
                <ArcGauge value={selected.ph} min={RANGES.ph.min} max={RANGES.ph.max} label={s.g_ph} unit={s.g_ph} color={PARAM_META.ph.color} />
                <ArcGauge value={selected.oxygen} min={RANGES.oxygen.min} max={RANGES.oxygen.max} label={s.param_oxygen} unit={s.g_oxygen} color={PARAM_META.oxygen.color} />
                <ArcGauge value={selected.salinity} min={RANGES.salinity.min} max={RANGES.salinity.max} label={s.param_salinity} unit={s.g_salinity} color={PARAM_META.salinity.color} />
                <ArcGauge value={selected.temp} min={RANGES.temp.min} max={RANGES.temp.max} label={s.param_temp} unit={s.g_temp} color={PARAM_META.temp.color} />
                <ArcGauge value={selected.turbidity} min={RANGES.turbidity.min} max={RANGES.turbidity.max} label={s.param_turbidity} unit={s.g_turbidity} color={PARAM_META.turbidity.color} />
                <div className="flex flex-col items-center justify-center text-center gap-1 text-[11px] text-gray-400">
                  <Thermometer size={16} style={{ color: ACCENT2 }} />
                  <span>{s.depth}: <b className="text-gray-200 font-mono">{selected.depth}m</b></span>
                  <span>{s.signal}: <b className="text-gray-200 font-mono">{selected.signal}%</b></span>
                  <span>{s.battery}: <b className="text-gray-200 font-mono">{selected.battery}%</b></span>
                </div>
              </div>

              {/* sparkline */}
              <div className="border-t border-white/5 pt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-gray-500 flex items-center gap-1.5"><Signal size={12} style={{ color: PARAM_META.oxygen.color }} /> {s.spark_label}</span>
                  <span className="text-[10px] text-gray-600 font-mono">{s.lastseen}: {ago(selected.updatedAt, s.now)}</span>
                </div>
                <Sparkline data={selected.history} color={PARAM_META.oxygen.color} />
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ══ ALERTS + TREND ══ */}
      <Section eyebrow={s.alerts_eyebrow} title={s.alerts_title} subtitle={s.alerts_sub}>
        <div className="grid lg:grid-cols-2 gap-5">
          {/* alerts feed */}
          <div className="bg-[#000d24] border border-white/10 rounded-2xl p-4 min-h-[280px]">
            <div className="flex items-center gap-2 mb-3 text-sm text-gray-300">
              <Bell size={15} style={{ color: '#f87171' }} />
              <span className="font-semibold">{s.alerts_title}</span>
              <span className="ml-auto text-[11px] font-mono text-gray-600">{alerts.length}</span>
            </div>
            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
              {alerts.length === 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-500 py-8 justify-center">
                  <CheckCircle2 size={16} style={{ color: '#22c55e' }} /> {s.alerts_empty}
                </div>
              )}
              <AnimatePresence initial={false}>
                {alerts.map((a) => {
                  const col = a.severity === 'alert' ? '#f87171' : '#fbbf24';
                  return (
                    <motion.div
                      key={a.id}
                      layout={!reduce}
                      initial={reduce ? false : { opacity: 0, x: -16, height: 0 }}
                      animate={{ opacity: 1, x: 0, height: 'auto' }}
                      exit={reduce ? { opacity: 0 } : { opacity: 0, x: 16 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 border"
                      style={{ borderColor: col + '30', background: col + '0d' }}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: col + '18', color: col }}>
                        <AlertTriangle size={15} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm text-white truncate">
                          <span className="font-mono font-bold">{a.buoy}</span>
                          <span className="text-gray-400"> · {paramLabel(a.param)} </span>
                          <span style={{ color: col }}>{a.dir === 'high' ? s.ev_high : s.ev_low}</span>
                        </div>
                        <div className="text-[11px] text-gray-500 font-mono">
                          {round(a.value, RANGES[a.param].decimals)}{PARAM_META[a.param].unit ? ' ' + PARAM_META[a.param].unit : ''}
                        </div>
                      </div>
                      <span className="text-[10px] text-gray-600 font-mono flex-shrink-0">{ago(a.ts, s.now)}</span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* trend chart */}
          <div className="bg-[#000d24] border border-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <TrendingUp size={15} style={{ color: PARAM_META[trendParam].color }} />
              <span className="text-sm font-semibold text-gray-300">{s.trend_title}</span>
              <div className="ml-auto flex flex-wrap gap-1">
                {(['ph', 'oxygen', 'salinity', 'temp', 'turbidity'] as ParamKey[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setTrendParam(p)}
                    className="text-[11px] px-2 py-1 rounded-lg border transition-colors font-mono"
                    style={
                      trendParam === p
                        ? { borderColor: PARAM_META[p].color + '55', background: PARAM_META[p].color + '18', color: PARAM_META[p].color }
                        : { borderColor: '#ffffff12', color: '#94a3b8' }
                    }
                  >
                    {paramLabel(p)}
                  </button>
                ))}
              </div>
            </div>
            <AreaChart data={trendData} color={PARAM_META[trendParam].color} />
            <div className="flex items-center justify-between mt-2 text-[11px] text-gray-500 font-mono">
              <span>{s.detail_title} {selected.label}</span>
              <span style={{ color: PARAM_META[trendParam].color }}>
                {round(selected[trendParam], RANGES[trendParam].decimals)} {PARAM_META[trendParam].unit}
              </span>
            </div>
          </div>
        </div>
      </Section>

      {/* ══ CTA ══ */}
      <section className="scroll-mt-24 py-16 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-[#00e6c8]/20 p-8 text-center bg-gradient-to-b from-[#00e6c8]/5 to-transparent"
          >
            <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-5 bg-[#00e6c8]/10 text-[#00e6c8]">
              <Radio size={26} />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white mb-3">{s.cta_title}</h2>
            <p className="text-gray-400 text-sm md:text-base mb-7 max-w-xl mx-auto leading-relaxed">{s.cta_sub}</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => navigate('/roadmap')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00d4ff]/10 border border-[#00d4ff]/30 text-[#00d4ff] hover:bg-[#00d4ff]/20 transition-colors text-sm font-medium"
              >
                <TrendingUp size={14} /> {s.cta_roadmap}
              </button>
              <button
                onClick={() => navigate('/whitepaper-full')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white transition-colors text-sm font-medium"
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
