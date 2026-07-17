import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import {
  BarChart3,
  Activity,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Zap,
  Shield,
  Clock,
  Users,
  FileText,
  Plus,
  X,
  Settings,
  ChevronDown,
  Droplets,
  TrendingUp,
  TrendingDown,
  Wifi,
  Radio,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// ─── Types ─────────────────────────────────────────────────

type UserRole = 'state_oversight' | 'minister' | 'regional_water' | 'engineer' | 'default';

type WidgetId =
  | 'critical_objects'
  | 'country_stats'
  | 'active_projects'
  | 'active_reports'
  | 'water_balance'
  | 'risk_map'
  | 'news_feed'
  | 'iot_sensors'
  | 'budget_overview'
  | 'regulatory_status';

interface RoleConfig {
  label: string;
  flag: string;
  color: string;
  greeting: string;
  defaultWidgets: WidgetId[];
}

interface WidgetMeta {
  id: WidgetId;
  title: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}

// ─── Role config ────────────────────────────────────────────

const ROLE_CONFIG: Record<UserRole, RoleConfig> = {
  state_oversight: {
    label: 'Государственный надзор',
    flag: '🏛️',
    color: '#00e6c8',
    greeting: 'Добро пожаловать в Центр государственного управления водными ресурсами',
    defaultWidgets: ['critical_objects', 'country_stats', 'active_reports', 'risk_map', 'news_feed', 'active_projects'],
  },
  minister: {
    label: 'Министр',
    flag: '⭐',
    color: '#fbbf24',
    greeting: 'Министерская панель управления',
    defaultWidgets: ['country_stats', 'critical_objects', 'budget_overview', 'active_projects', 'regulatory_status', 'news_feed'],
  },
  regional_water: {
    label: 'Областной водхоз',
    flag: '🌊',
    color: '#60a5fa',
    greeting: 'Рабочий стол — Региональное управление',
    defaultWidgets: ['critical_objects', 'active_projects', 'active_reports', 'water_balance', 'news_feed'],
  },
  engineer: {
    label: 'Инженер',
    flag: '⚙️',
    color: '#4ade80',
    greeting: 'Инженерный рабочий стол',
    defaultWidgets: ['critical_objects', 'active_projects', 'water_balance', 'iot_sensors'],
  },
  default: {
    label: 'Пользователь',
    flag: '👤',
    color: '#a78bfa',
    greeting: 'Рабочий стол VODPROM',
    defaultWidgets: ['critical_objects', 'active_projects', 'news_feed', 'country_stats'],
  },
};

const ALL_WIDGETS: WidgetMeta[] = [
  { id: 'critical_objects', title: 'Критические объекты', icon: AlertTriangle },
  { id: 'country_stats', title: 'Статистика страны', icon: BarChart3 },
  { id: 'active_projects', title: 'Активные проекты', icon: Activity },
  { id: 'active_reports', title: 'Отчёты к сдаче', icon: FileText },
  { id: 'water_balance', title: 'Водный баланс', icon: Droplets },
  { id: 'risk_map', title: 'Карта рисков', icon: Shield },
  { id: 'news_feed', title: 'Последние события', icon: Radio },
  { id: 'iot_sensors', title: 'IoT Датчики', icon: Wifi },
  { id: 'budget_overview', title: 'Бюджет', icon: TrendingUp },
  { id: 'regulatory_status', title: 'Регуляторика', icon: CheckCircle2 },
];

const LS_ROLE_KEY = 'vodprom-user-role';
const LS_WIDGETS_PREFIX = 'vodprom-widgets-';

// ─── Mock data ──────────────────────────────────────────────

const CRITICAL_OBJECTS = [
  { name: 'Андижанское вдхр', region: 'Андижанская обл.', fill: 38, status: 'critical' as const },
  { name: 'Арало-Сырдарьинское', region: 'Сырдарьинская обл.', fill: 52, status: 'warning' as const },
  { name: 'Туябугузское', region: 'Ташкентская обл.', fill: 71, status: 'ok' as const },
  { name: 'Чарвакское', region: 'Ташкентская обл.', fill: 82, status: 'ok' as const },
  { name: 'Кайраккум', region: 'Сугдская обл.', fill: 93, status: 'ok' as const },
];

const ACTIVE_PROJECTS = [
  { name: 'Реконструкция Андижанского вдхр', status: 'В работе', progress: 42, budget: '$12M', statusColor: '#60a5fa' },
  { name: 'Модернизация Чарвак ГЭС', status: 'Активно', progress: 78, budget: '$28M', statusColor: '#4ade80' },
  { name: 'Ферганский канал ремонт', status: 'Начало', progress: 15, budget: '$4.5M', statusColor: '#fbbf24' },
  { name: 'Туябугузская насосная ст.', status: 'Завершение', progress: 91, budget: '$8M', statusColor: '#00e6c8' },
];

const ACTIVE_REPORTS = [
  { name: 'Квартальный отчёт Q1 2026', ministry: 'Минводхоз', deadline: '2026-06-10', status: 'ready' as const },
  { name: 'Паводковый мониторинг', ministry: 'МЧС Узбекистана', deadline: '2026-06-15', status: 'draft' as const },
  { name: 'Годовой водный баланс', ministry: 'Минэкологии', deadline: '2026-05-30', status: 'overdue' as const },
];

const WATER_BALANCE_DATA = [
  { day: 'Пн', inflow: 420, outflow: 380 },
  { day: 'Вт', inflow: 460, outflow: 410 },
  { day: 'Ср', inflow: 390, outflow: 420 },
  { day: 'Чт', inflow: 510, outflow: 440 },
  { day: 'Пт', inflow: 530, outflow: 460 },
  { day: 'Сб', inflow: 480, outflow: 430 },
  { day: 'Вс', inflow: 500, outflow: 450 },
];

const RISK_MAP = [
  {
    name: 'Засуха Ферганская долина',
    level: 'HIGH' as const,
    desc: 'Уровень осадков ниже нормы на 40%, прогноз ухудшения',
  },
  {
    name: 'Паводок р. Нарын',
    level: 'MEDIUM' as const,
    desc: 'Ожидается таяние снегов, превышение уровня на 1.2м',
  },
  {
    name: 'Загрязнение р. Сырдарья',
    level: 'LOW' as const,
    desc: 'Зафиксированы выбросы агропредприятий, мониторинг',
  },
];

const NEWS_FEED = [
  {
    date: '3 июня 2026',
    source: 'Минводхоз',
    headline: 'Запущена новая система мониторинга уровня воды в Чарвакском водохранилище',
  },
  {
    date: '2 июня 2026',
    source: 'АБР',
    headline: 'Азиатский банк развития выделил $50M на модернизацию ирригационных систем',
  },
  {
    date: '1 июня 2026',
    source: 'Кабмин',
    headline: 'Утверждена новая стратегия управления водными ресурсами до 2030 года',
  },
  {
    date: '31 мая 2026',
    source: 'Узгидромет',
    headline: 'Прогноз: ожидается увеличение притока воды в Нарынский каскад на 15%',
  },
];

const IOT_SENSORS = [
  { name: 'Чарвак уровень воды', value: 892.4, unit: 'м', status: 'ok' as const },
  { name: 'Андижан расход', value: 48.2, unit: 'м³/с', status: 'warning' as const },
  { name: 'Нарын температура', value: 12.4, unit: '°C', status: 'ok' as const },
  { name: 'Туябугуз мутность', value: 8.7, unit: 'NTU', status: 'critical' as const },
];

// ─── Helpers ────────────────────────────────────────────────

function statusDot(status: 'critical' | 'warning' | 'ok') {
  const colors = { critical: '#ef4444', warning: '#f59e0b', ok: '#22c55e' };
  return (
    <span
      className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
      style={{ background: colors[status], boxShadow: `0 0 6px ${colors[status]}80` }}
    />
  );
}

function statusColor(status: 'critical' | 'warning' | 'ok') {
  return { critical: '#ef4444', warning: '#f59e0b', ok: '#22c55e' }[status];
}

function riskColor(level: 'HIGH' | 'MEDIUM' | 'LOW') {
  return { HIGH: '#ef4444', MEDIUM: '#f59e0b', LOW: '#22c55e' }[level];
}

// ─── Widget card shell ─────────────────────────────────────

function WidgetShell({
  title,
  icon: Icon,
  onClose,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl flex flex-col"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {/* Widget header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-[#00e6c8]" />
          <span className="text-sm font-semibold text-white">{title}</span>
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 rounded-lg flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/08 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      {/* Widget body */}
      <div className="p-4 flex-1">{children}</div>
    </div>
  );
}

// ─── Individual widgets ─────────────────────────────────────

function CriticalObjectsWidget({ onClose }: { onClose: () => void }) {
  const [, setLocation] = useLocation();
  return (
    <WidgetShell title="Критические объекты" icon={AlertTriangle} onClose={onClose}>
      <div className="space-y-2.5">
        {CRITICAL_OBJECTS.map((obj) => (
          <button
            key={obj.name}
            onClick={() => setLocation('/hub/objects')}
            className="w-full flex items-center gap-3 group text-left"
          >
            {statusDot(obj.status)}
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white group-hover:text-[#00e6c8] transition-colors truncate">
                {obj.name}
              </div>
              <div className="text-[11px] text-white/40 truncate">{obj.region}</div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-sm font-semibold" style={{ color: statusColor(obj.status) }}>
                {obj.fill}%
              </span>
              {obj.fill < 50 ? (
                <TrendingDown className="w-3.5 h-3.5 text-red-400" />
              ) : (
                <TrendingUp className="w-3.5 h-3.5 text-green-400" />
              )}
            </div>
          </button>
        ))}
      </div>
    </WidgetShell>
  );
}

function CountryStatsWidget({ onClose }: { onClose: () => void }) {
  const items = [
    { value: '473', label: 'Объектов', icon: Droplets, color: '#00e6c8' },
    { value: '139', label: 'Проектов', icon: Activity, color: '#60a5fa' },
    { value: '42', label: 'Организаций', icon: Users, color: '#fbbf24' },
    { value: '36', label: 'Стейкхолдеров', icon: Shield, color: '#a78bfa' },
  ];
  return (
    <WidgetShell title="Статистика страны" icon={BarChart3} onClose={onClose}>
      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="rounded-xl p-3 flex flex-col gap-1.5"
              style={{
                background: `${item.color}0d`,
                border: `1px solid ${item.color}20`,
              }}
            >
              <Icon className="w-4 h-4" style={{ color: item.color }} />
              <div className="text-xl font-bold text-white">{item.value}</div>
              <div className="text-[11px] text-white/50">{item.label}</div>
            </div>
          );
        })}
      </div>
    </WidgetShell>
  );
}

function ActiveProjectsWidget({ onClose }: { onClose: () => void }) {
  return (
    <WidgetShell title="Активные проекты" icon={Activity} onClose={onClose}>
      <div className="space-y-3">
        {ACTIVE_PROJECTS.map((proj) => (
          <div key={proj.name}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-white/80 truncate mr-2">{proj.name}</span>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span
                  className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                  style={{
                    background: `${proj.statusColor}18`,
                    color: proj.statusColor,
                    border: `1px solid ${proj.statusColor}30`,
                  }}
                >
                  {proj.status}
                </span>
                <span className="text-[11px] text-white/40">{proj.budget}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="flex-1 rounded-full overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.06)', height: 5 }}
              >
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${proj.progress}%`,
                    background: `linear-gradient(90deg, ${proj.statusColor}, ${proj.statusColor}cc)`,
                  }}
                />
              </div>
              <span className="text-[11px] text-white/50 w-8 text-right">{proj.progress}%</span>
            </div>
          </div>
        ))}
      </div>
    </WidgetShell>
  );
}

function ActiveReportsWidget({ onClose }: { onClose: () => void }) {
  const badgeColor = (status: 'ready' | 'draft' | 'overdue') => {
    if (status === 'ready') return '#00e6c8';
    if (status === 'overdue') return '#ef4444';
    return '#94a3b8';
  };
  const badgeLabel = (status: 'ready' | 'draft' | 'overdue') => {
    if (status === 'ready') return 'Готов';
    if (status === 'overdue') return 'Просрочен';
    return 'Черновик';
  };

  return (
    <WidgetShell title="Отчёты к сдаче" icon={FileText} onClose={onClose}>
      <div className="space-y-3">
        {ACTIVE_REPORTS.map((report) => {
          const color = badgeColor(report.status);
          return (
            <div
              key={report.name}
              className="rounded-xl p-3"
              style={{
                background: `${color}08`,
                border: `1px solid ${color}18`,
              }}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="text-sm text-white/90 leading-tight">{report.name}</span>
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: `${color}20`, color, border: `1px solid ${color}35` }}
                >
                  {badgeLabel(report.status)}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-white/40">
                <span>{report.ministry}</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {report.deadline}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </WidgetShell>
  );
}

function WaterBalanceWidget({ onClose }: { onClose: () => void }) {
  return (
    <WidgetShell title="Водный баланс" icon={Droplets} onClose={onClose}>
      <ResponsiveContainer width="100%" height={120}>
        <AreaChart data={WATER_BALANCE_DATA} margin={{ top: 4, right: 4, left: -30, bottom: 0 }}>
          <defs>
            <linearGradient id="inflow-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00e6c8" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00e6c8" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="outflow-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              background: 'rgba(0,8,24,0.95)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              fontSize: 11,
              color: '#fff',
            }}
          />
          <Area type="monotone" dataKey="inflow" stroke="#00e6c8" strokeWidth={1.5} fill="url(#inflow-grad)" name="Приток" />
          <Area type="monotone" dataKey="outflow" stroke="#60a5fa" strokeWidth={1.5} fill="url(#outflow-grad)" name="Отток" />
        </AreaChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4 mt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#00e6c8' }} />
          <span className="text-[11px] text-white/50">Приток</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#60a5fa' }} />
          <span className="text-[11px] text-white/50">Отток</span>
        </div>
      </div>
    </WidgetShell>
  );
}

function RiskMapWidget({ onClose }: { onClose: () => void }) {
  return (
    <WidgetShell title="Карта рисков" icon={Shield} onClose={onClose}>
      <div className="space-y-3">
        {RISK_MAP.map((risk) => {
          const color = riskColor(risk.level);
          return (
            <div
              key={risk.name}
              className="rounded-xl p-3"
              style={{ background: `${color}08`, border: `1px solid ${color}20` }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-white">{risk.name}</span>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: `${color}20`, color, border: `1px solid ${color}35` }}
                >
                  {risk.level}
                </span>
              </div>
              <p className="text-[11px] text-white/50 mb-1.5">{risk.desc}</p>
              <button className="text-[11px] text-[#00e6c8] hover:underline">Подробнее →</button>
            </div>
          );
        })}
      </div>
    </WidgetShell>
  );
}

function NewsFeedWidget({ onClose }: { onClose: () => void }) {
  return (
    <WidgetShell title="Последние события" icon={Radio} onClose={onClose}>
      <div className="space-y-3">
        {NEWS_FEED.map((news, i) => (
          <div
            key={i}
            className="pb-3"
            style={{ borderBottom: i < NEWS_FEED.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{
                  background: 'rgba(0,230,200,0.1)',
                  color: '#00e6c8',
                  border: '1px solid rgba(0,230,200,0.2)',
                }}
              >
                {news.source}
              </span>
              <span className="text-[11px] text-white/30">{news.date}</span>
            </div>
            <p className="text-sm text-white/80 leading-snug">{news.headline}</p>
          </div>
        ))}
      </div>
    </WidgetShell>
  );
}

function IotSensorsWidget({ onClose }: { onClose: () => void }) {
  return (
    <WidgetShell title="IoT Датчики" icon={Wifi} onClose={onClose}>
      <div className="space-y-3">
        {IOT_SENSORS.map((sensor) => (
          <div key={sensor.name} className="flex items-center gap-3">
            {statusDot(sensor.status)}
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white/80 truncate">{sensor.name}</div>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="text-sm font-bold" style={{ color: statusColor(sensor.status) }}>
                {sensor.value}
              </span>
              <span className="text-[11px] text-white/40 ml-1">{sensor.unit}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-1.5 text-[11px] text-white/30">
          <Zap className="w-3 h-3 text-[#00e6c8]" />
          <span>Обновлено: только что</span>
        </div>
      </div>
    </WidgetShell>
  );
}

function BudgetOverviewWidget({ onClose }: { onClose: () => void }) {
  const rows = [
    { label: 'Выделено', value: '₽42.8B', percent: 100, color: '#a78bfa' },
    { label: 'Освоено', value: '₽28.1B', percent: 65, color: '#00e6c8' },
    { label: 'Остаток', value: '₽14.7B', percent: 35, color: '#fbbf24' },
  ];
  return (
    <WidgetShell title="Бюджет" icon={TrendingUp} onClose={onClose}>
      <div className="space-y-4">
        {rows.map((row) => (
          <div key={row.label}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm text-white/70">{row.label}</span>
              <span className="text-sm font-bold text-white">{row.value}</span>
            </div>
            <div
              className="w-full rounded-full overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.06)', height: 6 }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${row.percent}%`,
                  background: `linear-gradient(90deg, ${row.color}, ${row.color}cc)`,
                }}
              />
            </div>
            <div className="text-right mt-0.5">
              <span className="text-[10px]" style={{ color: row.color }}>{row.percent}%</span>
            </div>
          </div>
        ))}
      </div>
    </WidgetShell>
  );
}

function RegulatoryStatusWidget({ onClose }: { onClose: () => void }) {
  const items = [
    { label: 'Отчётов готово', count: 2, color: '#00e6c8', icon: CheckCircle2 },
    { label: 'Просрочено', count: 1, color: '#ef4444', icon: AlertCircle },
    { label: 'В работе', count: 3, color: '#fbbf24', icon: Clock },
  ];
  return (
    <WidgetShell title="Регуляторика" icon={CheckCircle2} onClose={onClose}>
      <div className="grid grid-cols-3 gap-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="rounded-xl p-3 text-center"
              style={{ background: `${item.color}0d`, border: `1px solid ${item.color}20` }}
            >
              <Icon className="w-5 h-5 mx-auto mb-1.5" style={{ color: item.color }} />
              <div className="text-xl font-bold" style={{ color: item.color }}>{item.count}</div>
              <div className="text-[10px] text-white/50 mt-0.5 leading-tight">{item.label}</div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="text-[11px] text-white/40 text-center">
          Следующий дедлайн: <span className="text-[#fbbf24]">10 июня 2026</span>
        </div>
      </div>
    </WidgetShell>
  );
}

// ─── Widget renderer ────────────────────────────────────────

function RenderWidget({ id, onClose }: { id: WidgetId; onClose: () => void }) {
  switch (id) {
    case 'critical_objects': return <CriticalObjectsWidget onClose={onClose} />;
    case 'country_stats': return <CountryStatsWidget onClose={onClose} />;
    case 'active_projects': return <ActiveProjectsWidget onClose={onClose} />;
    case 'active_reports': return <ActiveReportsWidget onClose={onClose} />;
    case 'water_balance': return <WaterBalanceWidget onClose={onClose} />;
    case 'risk_map': return <RiskMapWidget onClose={onClose} />;
    case 'news_feed': return <NewsFeedWidget onClose={onClose} />;
    case 'iot_sensors': return <IotSensorsWidget onClose={onClose} />;
    case 'budget_overview': return <BudgetOverviewWidget onClose={onClose} />;
    case 'regulatory_status': return <RegulatoryStatusWidget onClose={onClose} />;
    default: return null;
  }
}

// ─── Add widget modal ───────────────────────────────────────

function AddWidgetModal({
  activeWidgets,
  onToggle,
  onClose,
}: {
  activeWidgets: WidgetId[];
  onToggle: (id: WidgetId) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6"
        style={{
          background: 'rgba(0,8,24,0.98)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-white">Управление виджетами</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-2">
          {ALL_WIDGETS.map((widget) => {
            const Icon = widget.icon;
            const active = activeWidgets.includes(widget.id);
            return (
              <button
                key={widget.id}
                onClick={() => onToggle(widget.id)}
                className="w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left"
                style={{
                  background: active ? 'rgba(0,230,200,0.08)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${active ? 'rgba(0,230,200,0.2)' : 'rgba(255,255,255,0.06)'}`,
                }}
              >
                <Icon
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: active ? '#00e6c8' : 'rgba(255,255,255,0.4)' }}
                />
                <span className="text-sm flex-1" style={{ color: active ? '#fff' : 'rgba(255,255,255,0.6)' }}>
                  {widget.title}
                </span>
                <div
                  className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                  style={{
                    background: active ? '#00e6c8' : 'rgba(255,255,255,0.08)',
                    border: `1px solid ${active ? '#00e6c8' : 'rgba(255,255,255,0.12)'}`,
                  }}
                >
                  {active && <CheckCircle2 className="w-3 h-3 text-black" />}
                </div>
              </button>
            );
          })}
        </div>
        <button
          onClick={onClose}
          className="w-full mt-4 py-2.5 rounded-xl text-sm font-medium text-black transition-all"
          style={{ background: 'linear-gradient(90deg, #00e6c8, #00c4aa)' }}
        >
          Готово
        </button>
      </div>
    </div>
  );
}

// ─── Main page ──────────────────────────────────────────────

export default function WorkspacePage() {
  const [role, setRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem(LS_ROLE_KEY);
    return (saved as UserRole) || 'default';
  });

  const [activeWidgets, setActiveWidgets] = useState<WidgetId[]>(() => {
    const saved = localStorage.getItem(LS_WIDGETS_PREFIX + (localStorage.getItem(LS_ROLE_KEY) || 'default'));
    if (saved) {
      try {
        return JSON.parse(saved) as WidgetId[];
      } catch {
        // ignore
      }
    }
    return ROLE_CONFIG[(localStorage.getItem(LS_ROLE_KEY) as UserRole) || 'default'].defaultWidgets;
  });

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const config = ROLE_CONFIG[role];

  // Persist role
  useEffect(() => {
    localStorage.setItem(LS_ROLE_KEY, role);
  }, [role]);

  // Persist widgets per role
  useEffect(() => {
    localStorage.setItem(LS_WIDGETS_PREFIX + role, JSON.stringify(activeWidgets));
  }, [role, activeWidgets]);

  const handleRoleChange = useCallback((newRole: UserRole) => {
    setRole(newRole);
    setRoleDropdownOpen(false);
    // Load saved widgets for this role, or use defaults
    const saved = localStorage.getItem(LS_WIDGETS_PREFIX + newRole);
    if (saved) {
      try {
        setActiveWidgets(JSON.parse(saved) as WidgetId[]);
        return;
      } catch {
        // fall through to defaults
      }
    }
    setActiveWidgets(ROLE_CONFIG[newRole].defaultWidgets);
  }, []);

  const handleToggleWidget = useCallback((id: WidgetId) => {
    setActiveWidgets((prev) =>
      prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]
    );
  }, []);

  const handleRemoveWidget = useCallback((id: WidgetId) => {
    setActiveWidgets((prev) => prev.filter((w) => w !== id));
  }, []);

  const handleReset = useCallback(() => {
    setActiveWidgets(ROLE_CONFIG[role].defaultWidgets);
  }, [role]);

  return (
    <div
      className="min-h-screen pb-20"
    >
      {/* ─── Header bar ─────────────────────────────────────── */}
      <div
        className="sticky top-0 z-30"
        style={{
          background: 'rgba(0,8,24,0.92)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            {/* Left: role selector + greeting */}
            <div className="flex items-center gap-3 min-w-0">
              {/* Role dropdown */}
              <div className="relative">
                <button
                  onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: `${config.color}12`,
                    border: `1px solid ${config.color}25`,
                    color: config.color,
                  }}
                >
                  <span className="text-base leading-none">{config.flag}</span>
                  <span className="hidden sm:block">{config.label}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${roleDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {roleDropdownOpen && (
                  <div
                    className="absolute left-0 top-full mt-2 w-56 rounded-xl overflow-hidden z-50"
                    style={{
                      background: 'rgba(0,12,32,0.98)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(20px)',
                    }}
                  >
                    {(Object.entries(ROLE_CONFIG) as [UserRole, RoleConfig][]).map(([key, cfg]) => (
                      <button
                        key={key}
                        onClick={() => handleRoleChange(key)}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors hover:bg-white/05"
                        style={{ color: role === key ? cfg.color : 'rgba(255,255,255,0.6)' }}
                      >
                        <span>{cfg.flag}</span>
                        <span>{cfg.label}</span>
                        {role === key && (
                          <CheckCircle2
                            className="w-3.5 h-3.5 ml-auto"
                            style={{ color: cfg.color }}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Greeting */}
              <div className="hidden md:block min-w-0">
                <p className="text-sm text-white/60 truncate">{config.greeting}</p>
              </div>
            </div>

            {/* Right: action buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: 'rgba(0,230,200,0.1)',
                  border: '1px solid rgba(0,230,200,0.2)',
                  color: '#00e6c8',
                }}
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:block">Добавить виджет</span>
              </button>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm transition-all"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.5)',
                }}
                title="Сбросить к умолчаниям"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:block">Сбросить</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Widget grid ─────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {activeWidgets.length === 0 ? (
          <div
            className="rounded-2xl p-16 text-center"
            style={{ border: '1px dashed rgba(255,255,255,0.1)' }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(0,230,200,0.08)', border: '1px solid rgba(0,230,200,0.15)' }}
            >
              <Plus className="w-7 h-7 text-[#00e6c8]" />
            </div>
            <p className="text-white/40 mb-4">Нет виджетов. Добавьте из каталога.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-black transition-all"
              style={{ background: 'linear-gradient(90deg, #00e6c8, #00c4aa)' }}
            >
              Добавить виджет
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {activeWidgets.map((id) => (
              <RenderWidget key={id} id={id} onClose={() => handleRemoveWidget(id)} />
            ))}
          </div>
        )}
      </div>

      {/* ─── Close dropdown on outside click ──────────────── */}
      {roleDropdownOpen && (
        <div className="fixed inset-0 z-20" onClick={() => setRoleDropdownOpen(false)} />
      )}

      {/* ─── Add widget modal ─────────────────────────────── */}
      {showAddModal && (
        <AddWidgetModal
          activeWidgets={activeWidgets}
          onToggle={handleToggleWidget}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}
