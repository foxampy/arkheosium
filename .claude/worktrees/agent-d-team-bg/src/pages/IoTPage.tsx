// ═══════════════════════════════════════════════════════════════
//  IoTPage — Real-time IoT Sensor Monitoring
//  Route: /iot
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import {
  Activity, Wifi, WifiOff, AlertTriangle, CheckCircle,
  Bell, Map, BarChart2, Zap, Droplets, Thermometer,
  Wind, ChevronLeft, RefreshCw, Loader2, MapPin,
} from 'lucide-react';
import { useWaterAlerts, type WaterAlert } from '../hooks/useWaterAlerts';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, Cell,
  XAxis, YAxis, Tooltip as RechartTooltip,
  ResponsiveContainer, Legend,
} from 'recharts';

// ─── Types ──────────────────────────────────────────────────────

type SensorType = 'Уровень воды' | 'Расход' | 'pH' | 'Температура' | 'Мутность' | 'Давление';
type SensorStatus = 'Норма' | 'КРИТИЧНО' | 'Предупреждение' | 'Offline';
type AlertSeverity = 'КРИТИЧНО' | 'ПРЕДУПРЕЖДЕНИЕ' | 'ИНФО' | 'УСТРАНЕНО';
type TabKey = 'monitoring' | 'alerts' | 'map' | 'analytics';

interface Sensor {
  id: string;
  name: string;
  region: string;
  type: SensorType;
  value: string;
  unit: string;
  status: SensorStatus;
  lat: number;
  lng: number;
  threshold?: string;
}

interface Alert {
  id: string;
  severity: AlertSeverity;
  sensorId: string;
  description: string;
  location: string;
  time: string;
}

interface LivePoint {
  t: string;
  water: number;
  flow: number;
  quality: number;
}

// ─── Constants ──────────────────────────────────────────────────

const SENSOR_TYPE_COLORS: Record<SensorType, string> = {
  'Уровень воды': '#00e6c8',
  'Расход': '#60a5fa',
  'pH': '#a78bfa',
  'Температура': '#fbbf24',
  'Мутность': '#f97316',
  'Давление': '#4ade80',
};

const ALERT_COLORS: Record<AlertSeverity, string> = {
  'КРИТИЧНО': '#f87171',
  'ПРЕДУПРЕЖДЕНИЕ': '#fbbf24',
  'ИНФО': '#60a5fa',
  'УСТРАНЕНО': '#4ade80',
};

const ALERT_BG: Record<AlertSeverity, string> = {
  'КРИТИЧНО': 'rgba(248,113,113,0.10)',
  'ПРЕДУПРЕЖДЕНИЕ': 'rgba(251,191,36,0.10)',
  'ИНФО': 'rgba(96,165,250,0.10)',
  'УСТРАНЕНО': 'rgba(74,222,128,0.08)',
};

const ALERT_ICON: Record<AlertSeverity, string> = {
  'КРИТИЧНО': '🔴',
  'ПРЕДУПРЕЖДЕНИЕ': '⚠️',
  'ИНФО': 'ℹ️',
  'УСТРАНЕНО': '✅',
};

// ─── Mock data ──────────────────────────────────────────────────

const SENSORS: Sensor[] = [
  { id: 'УЗБДЖ-001', name: 'Амударья — Старт',     region: 'Амударья',        type: 'Уровень воды', value: '4.82', unit: 'м',     status: 'Норма',          lat: 39.6, lng: 63.1, threshold: '2.5м' },
  { id: 'УЗБДЖ-002', name: 'Сырдарья — Нижний',    region: 'Сырдарья',        type: 'Уровень воды', value: '2.14', unit: 'м',     status: 'КРИТИЧНО',       lat: 40.9, lng: 68.7, threshold: '2.5м' },
  { id: 'УЗКЗХ-001', name: 'Каракалпак — pH Ст.',  region: 'Каракалпакстан',  type: 'pH',           value: '7.2',  unit: '',      status: 'Норма',          lat: 42.4, lng: 59.6 },
  { id: 'УЗТШК-003', name: 'Ташкент — Расход',      region: 'Ташкент',         type: 'Расход',       value: '142',  unit: 'м³/ч', status: 'Предупреждение', lat: 41.3, lng: 69.3 },
  { id: 'УЗФРГ-001', name: 'Фергана — Темп.',        region: 'Фергана',         type: 'Температура',  value: '18.3', unit: '°C',   status: 'Норма',          lat: 40.4, lng: 71.8 },
  { id: 'УЗНМН-002', name: 'Наманган — Мутность',   region: 'Наманган',        type: 'Мутность',     value: '47',   unit: 'NTU',  status: 'Предупреждение', lat: 41.0, lng: 71.6 },
  { id: 'УЗКРС-005', name: 'Каршинский — Давл.',    region: 'Кашкадарья',      type: 'Давление',     value: '8.7',  unit: 'бар',  status: 'КРИТИЧНО',       lat: 38.9, lng: 65.8, threshold: '8 бар' },
  { id: 'УЗБХР-001', name: 'Бухара — Расход',        region: 'Бухара',          type: 'Расход',       value: '89',   unit: 'м³/ч', status: 'Норма',          lat: 39.8, lng: 64.4 },
  { id: 'УЗСМР-004', name: 'Самарканд — Уровень',  region: 'Самарканд',       type: 'Уровень воды', value: '3.41', unit: 'м',    status: 'Норма',          lat: 39.7, lng: 66.9 },
  { id: 'УЗАНД-001', name: 'Андижан — pH',           region: 'Андижан',         type: 'pH',           value: '7.0',  unit: '',     status: 'Норма',          lat: 40.8, lng: 72.3 },
  { id: 'УЗНКС-002', name: 'Нукус — Давление',      region: 'Каракалпакстан',  type: 'Давление',     value: '5.2',  unit: 'бар',  status: 'Норма',          lat: 42.5, lng: 59.6 },
  { id: 'УЗЖЗК-001', name: 'Джизак — Темп.',         region: 'Джизак',          type: 'Температура',  value: '19.7', unit: '°C',   status: 'Норма',          lat: 40.1, lng: 67.8 },
];

const ALERTS: Alert[] = [
  { id: 'a1', severity: 'КРИТИЧНО',       sensorId: 'УЗБДЖ-002', description: 'Уровень воды ниже минимума (2.14м < 2.5м)',    location: 'Сырдарья',         time: '12 мин назад'  },
  { id: 'a2', severity: 'КРИТИЧНО',       sensorId: 'УЗКРС-005', description: 'Прорыв давления (8.7 бар > 8 бар)',            location: 'Каршинский канал', time: '34 мин назад'  },
  { id: 'a3', severity: 'ПРЕДУПРЕЖДЕНИЕ', sensorId: 'УЗТШК-003', description: 'Превышение расхода (142 м³/ч > 120 м³/ч)',    location: 'Ташкент',          time: '1 ч назад'     },
  { id: 'a4', severity: 'ПРЕДУПРЕЖДЕНИЕ', sensorId: 'УЗНМН-002', description: 'Высокая мутность воды (47 NTU > 30 NTU)',     location: 'Наманган',         time: '2 ч назад'     },
  { id: 'a5', severity: 'ИНФО',           sensorId: 'УЗБХР-001', description: 'Профилактическое ТО через 3 дня',             location: 'Бухара',           time: '5 ч назад'     },
  { id: 'a6', severity: 'ИНФО',           sensorId: 'УЗСМР-004', description: 'Плановое обслуживание запланировано',         location: 'Самарканд',        time: '8 ч назад'     },
  { id: 'a7', severity: 'УСТРАНЕНО',      sensorId: 'УЗАНД-001', description: 'Аномальный pH нормализован (6.4→7.0)',        location: 'Андижан',          time: 'Вчера'         },
  { id: 'a8', severity: 'УСТРАНЕНО',      sensorId: 'УЗНКС-002', description: 'Насос перезапущен успешно',                  location: 'Нукус',            time: 'Вчера'         },
];

// ─── Live strip sensors (6 featured) ────────────────────────────

const STRIP_SENSORS = [
  { id: 'УЗБДЖ-001', region: 'Амударья',       label: 'Уровень воды: 4.82м',   statusLabel: 'Норма',      ok: true  },
  { id: 'УЗБДЖ-002', region: 'Сырдарья',       label: 'Уровень воды: 2.14м',   statusLabel: 'КРИТИЧНО',   ok: false },
  { id: 'УЗКЗХ-001', region: 'Каракалпак',     label: 'pH: 7.2',               statusLabel: 'Норма',      ok: true  },
  { id: 'УЗТШК-003', region: 'Ташкент',        label: 'Расход: 142 м³/ч',      statusLabel: 'Превышение', ok: false },
  { id: 'УЗФРГ-001', region: 'Фергана',        label: 'Температура: 18.3°C',   statusLabel: 'Норма',      ok: true  },
  { id: 'УЗНМН-002', region: 'Наманган',       label: 'Мутность: 47 NTU',      statusLabel: 'Высокая',    ok: false },
];

// ─── Chart data generators ───────────────────────────────────────

function genLivePoint(i: number): LivePoint {
  return {
    t: `${String(Math.floor(i / 2)).padStart(2, '0')}:${i % 2 === 0 ? '00' : '30'}`,
    water: +(3.5 + Math.sin(i * 0.4) * 0.8 + Math.random() * 0.3).toFixed(2),
    flow: +(100 + Math.cos(i * 0.3) * 25 + Math.random() * 10).toFixed(1),
    quality: +(7.0 + Math.sin(i * 0.2) * 0.4 + Math.random() * 0.2).toFixed(2),
  };
}

function genInitialLive(): LivePoint[] {
  return Array.from({ length: 30 }, (_, i) => genLivePoint(i));
}

// 30-day water level data (Amudarya vs Syrdarya)
function genWaterLevelMonthly() {
  return Array.from({ length: 30 }, (_, i) => ({
    day: `${i + 1}`,
    amudarya: +(4.2 + Math.sin(i * 0.3) * 0.5 + Math.random() * 0.2).toFixed(2),
    syrdarya: +(2.8 + Math.cos(i * 0.25) * 0.4 + Math.random() * 0.15).toFixed(2),
  }));
}

// Daily flow by region
const REGION_FLOW = [
  { region: 'Ташкент',  flow: 1420 },
  { region: 'Фергана',  flow: 980  },
  { region: 'Самарканд',flow: 870  },
  { region: 'Наманган', flow: 760  },
  { region: 'Андижан',  flow: 640  },
  { region: 'Бухара',   flow: 580  },
];

// pH over 7 days (3 stations)
function genPhData() {
  const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  return days.map((d) => ({
    day: d,
    amudarya: +(7.1 + Math.random() * 0.4).toFixed(2),
    syrdarya: +(7.3 + Math.random() * 0.3).toFixed(2),
    ferghana:  +(6.9 + Math.random() * 0.5).toFixed(2),
  }));
}

// ─── Sub-components ──────────────────────────────────────────────

const CHART_STYLE = {
  tick: { fill: 'rgba(255,255,255,0.3)', fontSize: 11 },
  tooltip: {
    contentStyle: { background: '#001530', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 },
    labelStyle: { color: 'rgba(255,255,255,0.6)' },
    itemStyle: { color: 'rgba(255,255,255,0.85)' },
  },
};

function SensorTypeBadge({ type }: { type: SensorType }) {
  const color = SENSOR_TYPE_COLORS[type];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium"
      style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}
    >
      {type}
    </span>
  );
}

function StatusDot({ status }: { status: SensorStatus }) {
  const color =
    status === 'Норма'         ? '#4ade80' :
    status === 'КРИТИЧНО'      ? '#f87171' :
    status === 'Предупреждение'? '#fbbf24' : '#6b7280';
  const pulse = status === 'КРИТИЧНО' || status === 'Норма';
  return (
    <span className="relative flex items-center justify-center w-2.5 h-2.5 shrink-0">
      {pulse && (
        <span
          className="absolute inline-flex w-full h-full rounded-full opacity-60 animate-ping"
          style={{ background: color }}
        />
      )}
      <span className="relative inline-flex w-2 h-2 rounded-full" style={{ background: color }} />
    </span>
  );
}

// ─── Monitoring Tab ──────────────────────────────────────────────

function MonitoringTab() {
  const [liveData, setLiveData] = useState<LivePoint[]>(genInitialLive);
  const [selectedId, setSelectedId] = useState<string>('УЗБДЖ-001');

  useEffect(() => {
    let idx = 30;
    const iv = setInterval(() => {
      setLiveData((prev) => {
        const next = [...prev.slice(1), genLivePoint(idx)];
        idx++;
        return next;
      });
    }, 3000);
    return () => clearInterval(iv);
  }, []);

  const activeSensor = SENSORS.find((s) => s.id === selectedId) ?? SENSORS[0];

  const trendArrow = (val: number) =>
    val > 0.5 ? '↑' : val < -0.5 ? '↓' : '→';

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Left: real-time chart */}
      <div className="lg:w-2/3 flex flex-col gap-4">
        <div
          className="rounded-2xl p-4"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-white/80">Данные в реальном времени</span>
            <span className="flex items-center gap-1.5 text-xs text-green-400">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
              Live
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={liveData} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
              <defs>
                <linearGradient id="gWater" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#00e6c8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00e6c8" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gFlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#60a5fa" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gQuality" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#a78bfa" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="t" tick={CHART_STYLE.tick} tickLine={false} axisLine={false} interval={4} />
              <YAxis tick={CHART_STYLE.tick} tickLine={false} axisLine={false} />
              <RechartTooltip {...CHART_STYLE.tooltip} />
              <Legend
                wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}
                formatter={(val) =>
                  val === 'water' ? 'Уровень воды (м)' :
                  val === 'flow'  ? 'Расход (м³/ч÷10)' : 'pH'
                }
              />
              <Area type="monotone" dataKey="water"   stroke="#00e6c8" strokeWidth={2} fill="url(#gWater)"   dot={false} />
              <Area type="monotone" dataKey="flow"    stroke="#60a5fa" strokeWidth={2} fill="url(#gFlow)"    dot={false} />
              <Area type="monotone" dataKey="quality" stroke="#a78bfa" strokeWidth={2} fill="url(#gQuality)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Active sensor detail */}
        <div
          className="rounded-2xl p-4"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <StatusDot status={activeSensor.status} />
            <span className="font-semibold text-white text-sm">{activeSensor.id}</span>
            <span className="text-white/40 text-sm">·</span>
            <span className="text-white/60 text-sm">{activeSensor.name}</span>
            <SensorTypeBadge type={activeSensor.type} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Регион',        val: activeSensor.region },
              { label: 'Тип датчика',   val: activeSensor.type },
              { label: 'Значение',      val: `${activeSensor.value} ${activeSensor.unit}`, trend: trendArrow(Math.random() * 2 - 1) },
              { label: 'Порог',         val: activeSensor.threshold ?? '—' },
            ].map(({ label, val, trend }) => (
              <div
                key={label}
                className="rounded-xl p-3"
                style={{ background: 'rgba(255,255,255,0.04)' }}
              >
                <div className="text-xs text-white/40 mb-1">{label}</div>
                <div className="text-sm font-semibold text-white">
                  {val} {trend && <span className={trend === '↑' ? 'text-green-400' : trend === '↓' ? 'text-red-400' : 'text-white/40'}>{trend}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: sensor list */}
      <div
        className="lg:w-1/3 rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <span className="text-sm font-semibold text-white/80">Датчики ({SENSORS.length})</span>
        </div>
        <div className="overflow-y-auto" style={{ maxHeight: 460 }}>
          {SENSORS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedId(s.id)}
              className="w-full text-left px-4 py-3 transition-all duration-200"
              style={{
                background: selectedId === s.id ? 'rgba(0,230,200,0.08)' : 'transparent',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <StatusDot status={s.status} />
                  <div className="min-w-0">
                    <div className="text-xs font-mono text-white/80 truncate">{s.id}</div>
                    <div className="text-[10px] text-white/40 truncate">{s.region}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <SensorTypeBadge type={s.type} />
                  <span className="text-xs font-semibold" style={{ color: SENSOR_TYPE_COLORS[s.type] }}>
                    {s.value} {s.unit}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Alerts Tab ──────────────────────────────────────────────────

// Map WaterAlert severity → IoT display colours
const REAL_ALERT_COLOR: Record<'critical' | 'warning' | 'info', string> = {
  critical: '#f87171',
  warning: '#fbbf24',
  info: '#60a5fa',
};
const REAL_ALERT_BG: Record<'critical' | 'warning' | 'info', string> = {
  critical: 'rgba(248,113,113,0.10)',
  warning: 'rgba(251,191,36,0.10)',
  info: 'rgba(96,165,250,0.10)',
};
const REAL_ALERT_ICON: Record<'critical' | 'warning' | 'info', string> = {
  critical: '🔴',
  warning: '⚠️',
  info: 'ℹ️',
};

function timeAgoStr(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'только что';
  if (mins < 60) return `${mins} мин назад`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} ч назад`;
  return `${Math.floor(hrs / 24)} д назад`;
}

function AlertsTab({
  alerts,
  loading,
  error,
}: {
  alerts: WaterAlert[];
  loading: boolean;
  error: string | null;
}) {
  const [confirmedId, setConfirmedId] = useState<string | null>(null);

  const handleAction = (id: string) => {
    setConfirmedId(id);
    setTimeout(() => setConfirmedId(null), 2500);
  };

  // Active (unresolved) alerts only
  const activeAlerts = alerts.filter((a) => !a.resolved);

  const criticalCnt = activeAlerts.filter((a) => a.severity === 'critical').length;
  const warningCnt  = activeAlerts.filter((a) => a.severity === 'warning').length;
  const infoCnt     = activeAlerts.filter((a) => a.severity === 'info').length;
  const resolvedCnt = alerts.filter((a) => a.resolved).length;

  const statRows: [AlertSeverity, number][] = [
    ['КРИТИЧНО',       criticalCnt],
    ['ПРЕДУПРЕЖДЕНИЕ', warningCnt],
    ['ИНФО',           infoCnt],
    ['УСТРАНЕНО',      resolvedCnt],
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#00e6c8' }} />
        <p className="text-sm text-white/40">Загрузка алертов…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statRows.map(([sev, cnt]) => (
          <div
            key={sev}
            className="rounded-2xl p-3 flex items-center gap-3"
            style={{ background: ALERT_BG[sev], border: `1px solid ${ALERT_COLORS[sev]}33` }}
          >
            <span className="text-xl">{ALERT_ICON[sev]}</span>
            <div>
              <div className="text-lg font-bold" style={{ color: ALERT_COLORS[sev] }}>{cnt}</div>
              <div className="text-[10px] text-white/40 uppercase tracking-wide">{sev}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Toast confirmation */}
      {confirmedId && (
        <div
          className="rounded-xl px-4 py-3 text-sm text-green-300 flex items-center gap-2 transition-all duration-300"
          style={{ background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.25)' }}
        >
          <CheckCircle size={14} />
          Действие выполнено: {confirmedId}
        </div>
      )}

      {/* No alerts */}
      {activeAlerts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <CheckCircle size={32} className="text-emerald-400" />
          <p className="text-sm text-white/40">Нет активных алертов</p>
        </div>
      )}

      {/* Alert list — active (unresolved) only */}
      <div className="flex flex-col gap-2">
        {activeAlerts.map((al) => {
          const sev = al.severity; // 'critical' | 'warning' | 'info'
          const color = REAL_ALERT_COLOR[sev];
          const bg    = REAL_ALERT_BG[sev];
          const icon  = REAL_ALERT_ICON[sev];

          const valueStr =
            al.value !== null && al.threshold !== null && al.unit !== null
              ? `${al.value} ${al.unit} > ${al.threshold} ${al.unit}`
              : al.value !== null && al.unit !== null
              ? `${al.value} ${al.unit}`
              : null;

          return (
            <div
              key={al.id}
              className="rounded-2xl p-4 transition-all duration-200"
              style={{ background: bg, border: `1px solid ${color}30` }}
            >
              <div className="flex flex-wrap items-start gap-3 justify-between">
                <div className="flex items-start gap-3">
                  <span className="text-lg leading-none mt-0.5">{icon}</span>
                  <div>
                    <div className="flex items-center flex-wrap gap-2 mb-1">
                      <span
                        className="text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
                        style={{ background: `${color}22`, color }}
                      >
                        {sev === 'critical' ? 'КРИТИЧНО' : sev === 'warning' ? 'ПРЕДУПРЕЖДЕНИЕ' : 'ИНФО'}
                      </span>
                      {al.object_name && (
                        <>
                          <span className="text-xs text-white/40">·</span>
                          <span className="inline-flex items-center gap-1 text-xs text-white/50">
                            <MapPin size={10} />
                            {al.object_name}
                          </span>
                        </>
                      )}
                      <span className="text-xs text-white/30">·</span>
                      <span className="text-xs text-white/30">{timeAgoStr(al.created_at)}</span>
                    </div>
                    <p className="text-sm font-semibold text-white/90">{al.title}</p>
                    {al.description && (
                      <p className="text-sm text-white/60 mt-0.5">{al.description}</p>
                    )}
                    {valueStr && (
                      <p className="text-xs text-white/40 font-mono mt-0.5">{valueStr}</p>
                    )}
                  </div>
                </div>
                {(sev === 'critical' || sev === 'warning') && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleAction(al.object_id ?? al.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                      style={{ background: 'rgba(0,230,200,0.12)', color: '#00e6c8', border: '1px solid rgba(0,230,200,0.25)' }}
                    >
                      Создать задачу
                    </button>
                    <button
                      onClick={() => handleAction(al.object_id ?? al.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                      style={{ background: 'rgba(251,191,36,0.10)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.20)' }}
                    >
                      Уведомить
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Map Tab ─────────────────────────────────────────────────────

// Approximate Uzbekistan bounding box in SVG coordinates
// Lng range: ~56°E–73°E → SVG x 0–600
// Lat range: ~37°N–45°N → SVG y 0–300

function lngToX(lng: number) { return ((lng - 56) / (73 - 56)) * 600; }
function latToY(lat: number) { return ((45 - lat) / (45 - 37)) * 300; }

function MapTab() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const hovered = SENSORS.find((s) => s.id === hoveredId);

  return (
    <div className="flex flex-col gap-4">
      <div
        className="rounded-2xl overflow-hidden relative"
        style={{ background: '#000d1f', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <svg viewBox="0 0 600 300" className="w-full" style={{ maxHeight: 360 }}>
          {/* Uzbekistan approximate outline */}
          <path
            d="M 60 80 L 90 55 L 130 45 L 180 40 L 230 50 L 280 48 L 330 35 L 380 38 L 420 55
               L 460 60 L 500 80 L 520 100 L 510 140 L 490 160 L 480 200 L 450 220 L 420 230
               L 380 225 L 340 240 L 300 250 L 270 260 L 240 255 L 200 265 L 170 270 L 140 260
               L 110 240 L 90 210 L 70 180 L 55 150 L 50 120 Z"
            fill="rgba(0,230,200,0.04)"
            stroke="rgba(0,230,200,0.25)"
            strokeWidth="1.5"
          />
          {/* River paths (schematic) */}
          <path d="M 55 100 Q 150 80 250 120 Q 350 150 490 130" stroke="#60a5fa" strokeWidth="1.5" fill="none" opacity="0.35" strokeDasharray="6,3" />
          <path d="M 60 200 Q 180 190 280 200 Q 380 210 480 190" stroke="#00e6c8" strokeWidth="1.5" fill="none" opacity="0.35" strokeDasharray="6,3" />
          {/* Labels */}
          <text x="170" y="165" fill="rgba(255,255,255,0.18)" fontSize="9" fontFamily="monospace">УЗБЕКИСТАН</text>
          <text x="80"  y="95"  fill="rgba(96,165,250,0.5)"   fontSize="7" fontFamily="monospace">Сырдарья</text>
          <text x="80"  y="195" fill="rgba(0,230,200,0.5)"    fontSize="7" fontFamily="monospace">Амударья</text>

          {/* Sensor dots */}
          {SENSORS.map((s) => {
            const x = lngToX(s.lng);
            const y = latToY(s.lat);
            const color =
              s.status === 'КРИТИЧНО'       ? '#f87171' :
              s.status === 'Предупреждение' ? '#fbbf24' :
              s.status === 'Offline'        ? '#6b7280' : SENSOR_TYPE_COLORS[s.type];
            const isHov = hoveredId === s.id;
            return (
              <g key={s.id} style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredId(s.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {isHov && <circle cx={x} cy={y} r={12} fill={color} opacity={0.15} />}
                <circle cx={x} cy={y} r={isHov ? 7 : 5} fill={color} opacity={0.9} />
                <circle cx={x} cy={y} r={isHov ? 7 : 5} fill="none" stroke={color} strokeWidth="1.5" opacity={0.6} />
                {isHov && (
                  <g>
                    <rect x={x + 10} y={y - 24} width={130} height={42} rx={5} fill="#001530" stroke={color} strokeWidth="0.8" opacity={0.97} />
                    <text x={x + 16} y={y - 10} fill="white"       fontSize="9"  fontFamily="monospace" fontWeight="bold">{s.id}</text>
                    <text x={x + 16} y={y + 2}  fill={color}       fontSize="8"  fontFamily="sans-serif">{s.value} {s.unit} · {s.status}</text>
                    <text x={x + 16} y={y + 12} fill="rgba(255,255,255,0.45)" fontSize="7.5" fontFamily="sans-serif">{s.region}</text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div
        className="rounded-2xl p-4 flex flex-wrap gap-4"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        {(Object.entries(SENSOR_TYPE_COLORS) as [SensorType, string][]).map(([type, color]) => (
          <div key={type} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
            <span className="text-xs text-white/50">{type}</span>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-red-400" />
          <span className="text-xs text-white/50">КРИТИЧНО</span>
        </div>
      </div>
    </div>
  );
}

// ─── Analytics Tab ───────────────────────────────────────────────

const waterLevelData = genWaterLevelMonthly();
const phData = genPhData();

function AnalyticsTab() {
  return (
    <div className="flex flex-col gap-4">
      {/* 1. Water level 30 days */}
      <div
        className="rounded-2xl p-4"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="text-sm font-semibold text-white/70 mb-3">Уровень воды за 30 дней (м)</div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={waterLevelData} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
            <defs>
              <linearGradient id="gaAmu" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#00e6c8" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00e6c8" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gaSyr" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#60a5fa" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" tick={CHART_STYLE.tick} tickLine={false} axisLine={false} interval={4} />
            <YAxis tick={CHART_STYLE.tick} tickLine={false} axisLine={false} />
            <RechartTooltip {...CHART_STYLE.tooltip} />
            <Legend wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}
              formatter={(v) => v === 'amudarya' ? 'Амударья' : 'Сырдарья'} />
            <Area type="monotone" dataKey="amudarya" stroke="#00e6c8" strokeWidth={2} fill="url(#gaAmu)" dot={false} />
            <Area type="monotone" dataKey="syrdarya" stroke="#60a5fa" strokeWidth={2} fill="url(#gaSyr)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 2. Daily flow by region */}
      <div
        className="rounded-2xl p-4"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="text-sm font-semibold text-white/70 mb-3">Суточный расход воды по регионам (тыс. м³)</div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={REGION_FLOW} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
            <XAxis dataKey="region" tick={CHART_STYLE.tick} tickLine={false} axisLine={false} />
            <YAxis tick={CHART_STYLE.tick} tickLine={false} axisLine={false} />
            <RechartTooltip {...CHART_STYLE.tooltip} />
            <Bar dataKey="flow" radius={[4, 4, 0, 0]} opacity={0.8}>
              {REGION_FLOW.map((_, i) => {
                const colors = ['#00e6c8', '#60a5fa', '#a78bfa', '#fbbf24', '#f97316', '#4ade80'];
                return <Cell key={i} fill={colors[i % colors.length]} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 3. pH over 7 days */}
      <div
        className="rounded-2xl p-4"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="text-sm font-semibold text-white/70 mb-3">Качество воды (pH) за 7 дней</div>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={phData} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
            <XAxis dataKey="day" tick={CHART_STYLE.tick} tickLine={false} axisLine={false} />
            <YAxis tick={CHART_STYLE.tick} tickLine={false} axisLine={false} domain={[6.5, 7.8]} />
            <RechartTooltip {...CHART_STYLE.tooltip} />
            <Legend wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}
              formatter={(v) => v === 'amudarya' ? 'Амударья' : v === 'syrdarya' ? 'Сырдарья' : 'Фергана'} />
            <Line type="monotone" dataKey="amudarya" stroke="#00e6c8" strokeWidth={2} dot={{ r: 3, fill: '#00e6c8' }} />
            <Line type="monotone" dataKey="syrdarya" stroke="#60a5fa" strokeWidth={2} dot={{ r: 3, fill: '#60a5fa' }} />
            <Line type="monotone" dataKey="ferghana"  stroke="#a78bfa" strokeWidth={2} dot={{ r: 3, fill: '#a78bfa' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'monitoring', label: 'Мониторинг', icon: <Activity size={14} /> },
  { key: 'alerts',     label: 'Алерты',     icon: <AlertTriangle size={14} /> },
  { key: 'map',        label: 'Карта',       icon: <Map size={14} /> },
  { key: 'analytics',  label: 'Аналитика',   icon: <BarChart2 size={14} /> },
];

export default function IoTPage() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<TabKey>('monitoring');

  // Real alert data from Supabase (auto-refreshes every 30s)
  const { alerts: waterAlerts, loading: alertsLoading, error: alertsError, lastUpdated } =
    useWaterAlerts();

  return (
    <div className="min-h-screen" style={{ background: '#000818', color: 'white' }}>

      {/* ── Sticky Header ── */}
      <header
        className="sticky top-0 z-30 backdrop-blur-lg border-b"
        style={{ background: 'rgba(0,8,24,0.85)', borderColor: 'rgba(255,255,255,0.07)' }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
          {/* Back */}
          <button
            onClick={() => setLocation('/map')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-white/60 transition-all duration-200"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <ChevronLeft size={14} />
            Карта
          </button>

          {/* Title */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(0,230,200,0.15)', border: '1px solid rgba(0,230,200,0.3)' }}
            >
              <Zap size={16} color="#00e6c8" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-bold text-white truncate">IoT Мониторинг</h1>
              <p className="text-[11px] text-white/40 truncate hidden sm:block">
                Датчики водной инфраструктуры в реальном времени
              </p>
            </div>
          </div>

          {/* Stat pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { label: 'Всего', val: 247, color: 'rgba(255,255,255,0.6)', bg: 'rgba(255,255,255,0.06)' },
              { label: 'Online', val: 231, color: '#4ade80',              bg: 'rgba(74,222,128,0.10)' },
              { label: 'Алерты', val: 8,   color: '#f87171',              bg: 'rgba(248,113,113,0.10)' },
              { label: 'Offline', val: 8,  color: '#9ca3af',              bg: 'rgba(156,163,175,0.10)' },
            ].map(({ label, val, color, bg }) => (
              <div
                key={label}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                style={{ background: bg, color, border: `1px solid ${color}33` }}
              >
                <span className="font-bold">{val}</span>
                <span className="opacity-70">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 flex flex-col gap-6">

        {/* ── Live Status Strip ── */}
        <div
          className="overflow-x-auto pb-2"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}
        >
          <div className="flex gap-3" style={{ minWidth: 'max-content' }}>
            {STRIP_SENSORS.map((s) => (
              <div
                key={s.id}
                className="rounded-2xl px-4 py-3 flex items-center gap-3 shrink-0"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: s.ok
                    ? '1px solid rgba(74,222,128,0.20)'
                    : '1px solid rgba(248,113,113,0.20)',
                  minWidth: 200,
                }}
              >
                <span className="relative flex items-center justify-center w-2.5 h-2.5 shrink-0">
                  <span
                    className="absolute inline-flex w-full h-full rounded-full opacity-60 animate-ping"
                    style={{ background: s.ok ? '#4ade80' : '#f87171' }}
                  />
                  <span
                    className="relative inline-flex w-2 h-2 rounded-full"
                    style={{ background: s.ok ? '#4ade80' : '#f87171' }}
                  />
                </span>
                <div>
                  <div className="font-mono text-xs font-bold text-white/80">{s.id}</div>
                  <div className="text-[10px] text-white/40">{s.region}</div>
                  <div className="text-xs text-white/60 mt-0.5">{s.label}</div>
                </div>
                <span
                  className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    background: s.ok ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)',
                    color:      s.ok ? '#4ade80'                 : '#f87171',
                  }}
                >
                  {s.statusLabel}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex items-center gap-1 p-1 rounded-2xl w-fit"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          {TABS.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
              style={
                activeTab === key
                  ? { background: '#00e6c8', color: '#000818' }
                  : { color: 'rgba(255,255,255,0.5)' }
              }
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        {/* ── Tab content ── */}
        <div>
          {activeTab === 'monitoring' && <MonitoringTab />}
          {activeTab === 'alerts'     && (
            <AlertsTab alerts={waterAlerts} loading={alertsLoading} error={alertsError} />
          )}
          {activeTab === 'map'        && <MapTab />}
          {activeTab === 'analytics'  && <AnalyticsTab />}
        </div>
      </main>

      {/* ── Footer ── */}
      <footer
        className="border-t mt-8 py-4 text-center text-xs text-white/30"
        style={{ borderColor: 'rgba(255,255,255,0.07)' }}
      >
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <RefreshCw size={11} className="opacity-50" />
          <span>
            Последнее обновление:{' '}
            {lastUpdated
              ? lastUpdated.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
              : 'только что'}
          </span>
          <span>·</span>
          <span>Автообновление каждые 30 сек</span>
          <span>·</span>
          <span className="text-[#00e6c8]/60">247 активных датчиков</span>
        </div>
      </footer>
    </div>
  );
}
