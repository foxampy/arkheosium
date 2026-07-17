// src/pages/DashboardPage.tsx
// VODPROM OS — personal daily workspace launcher (rewrite)
import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'wouter';
import { Search, X, Bell, User, Plus, Store, Palette } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useDashboardPreferences, type Role, type DashboardPrefs } from '@/hooks/useDashboardPreferences';
import { WIDGET_REGISTRY } from '@/components/dashboard/DashboardWidgets';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface AppDef {
  id: string;
  name: string;
  icon: string;
  color: string;
  path: string;
  description: string;
  category: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const ALL_APPS: AppDef[] = [
  { id: 'map',         name: 'Карта',           icon: '🗺️',  color: '#06b6d4', path: '/map',                   category: 'monitoring', description: 'Интерактивная карта водных объектов' },
  { id: 'hub',         name: 'Проект-Хаб',      icon: '📁',  color: '#4ade80', path: '/hub',                   category: 'management', description: 'Объекты, субъекты и проекты' },
  { id: 'iot',         name: 'IoT Датчики',     icon: '📡',  color: '#4ade80', path: '/iot',                   category: 'monitoring', description: 'Показания датчиков в реальном времени' },
  { id: 'alerts',      name: 'Алерты',          icon: '🚨',  color: '#f87171', path: '/alerts',                category: 'monitoring', description: 'Критические предупреждения системы' },
  { id: 'analytics',   name: 'Аналитика',       icon: '📊',  color: '#00e6c8', path: '/analytics',             category: 'analytics',  description: 'Аналитика и дашборды' },
  { id: 'rd',          name: 'НИОКР',           icon: '🔬',  color: '#f59e0b', path: '/rd',                    category: 'research',   description: 'Научные разработки и исследования' },
  { id: 'catalog',     name: 'Каталог',         icon: '📚',  color: '#a78bfa', path: '/catalog',               category: 'management', description: 'Технологии и оборудование' },
  { id: 'messages',    name: 'Сообщения',       icon: '💬',  color: '#60a5fa', path: '/messages',              category: 'tools',      description: 'Внутренние сообщения' },
  { id: 'community',   name: 'Сообщество',      icon: '👥',  color: '#f472b6', path: '/community',             category: 'community',  description: 'Вакансии, задачи, новости' },
  { id: 'invest',      name: 'Инвестиции',      icon: '💰',  color: '#fbbf24', path: '/invest',                category: 'finance',    description: 'Инвестиционные возможности' },
  { id: 'contacts',    name: 'Контакты',        icon: '📞',  color: '#38bdf8', path: '/contacts',              category: 'management', description: 'Стейкхолдеры и организации' },
  { id: 'workspace',   name: 'Рабочее место',   icon: '💼',  color: '#a78bfa', path: '/workspace',             category: 'tools',      description: 'Документы, контракты, задачи' },
  { id: 'settings',    name: 'Настройки',       icon: '⚙️',  color: '#94a3b8', path: '/settings',              category: 'tools',      description: 'Настройки системы' },
  { id: 'tiif',        name: 'TIIF 2026',       icon: '🇺🇿', color: '#00e6c8', path: '/conference/tiif-2026',  category: 'community',  description: 'Международный форум' },
  { id: 'tech',        name: 'Тех.Рынок',       icon: '🛒',  color: '#f59e0b', path: '/tech-marketplace',      category: 'finance',    description: 'Рынок технологий' },
  { id: 'ecosystem',   name: 'Экосистема',      icon: '🌿',  color: '#4ade80', path: '/ecosystem',             category: 'analytics',  description: 'Экосистемные решения' },
  { id: 'regulatory',  name: 'Регуляторика',    icon: '📜',  color: '#fbbf24', path: '/regulatory',            category: 'management', description: 'Нормативно-правовая база' },
  { id: 'blockchain',  name: 'Блокчейн',        icon: '⛓️',  color: '#a78bfa', path: '/blockchain',            category: 'finance',    description: 'Блокчейн-реестр и токены' },
  { id: 'onboard',     name: 'Онбординг',       icon: '🔑',  color: '#00e6c8', path: '/onboard',               category: 'tools',      description: 'Регистрация и верификация' },
  { id: 'twin',        name: 'Цифр.Двойник',    icon: '🔮',  color: '#60a5fa', path: '/hub/object/472/twin',   category: 'monitoring', description: '3D цифровые двойники' },
  { id: 'whitepaper',  name: 'Документация',    icon: '📖',  color: '#06b6d4', path: '/whitepaper',            category: 'research',   description: 'Whitepaper и исследования' },
  { id: 'profile',     name: 'Профиль',         icon: '👤',  color: '#94a3b8', path: '/profile',               category: 'tools',      description: 'Личный профиль' },
  { id: 'ai_gen',      name: 'ИИ-Генератор',    icon: '🤖',  color: '#f472b6', path: '/hub/projects',          category: 'tools',      description: 'ИИ-генерация документации' },
  { id: 'qr',          name: 'QR-доступ',       icon: '📲',  color: '#00e6c8', path: '/qr/engineer',           category: 'tools',      description: 'QR коды для доступа' },
  { id: 'explorer',    name: 'Обзор',           icon: '🔍',  color: '#06b6d4', path: '/whitepaper',            category: 'research',   description: 'Исследование объектов' },
  { id: 'documents',   name: 'Документы',       icon: '📋',  color: '#f472b6', path: '/documents',             category: 'tools',      description: 'Брошюры, визитки, приглашения с QR' },
];

type RoleConfig = {
  label: string;
  icon: string;
  apps: string[];
  dock: string[];
  widgets: string[];
};

const ROLE_CONFIG: Record<Role, RoleConfig> = {
  state_oversight: { label: 'Гос. надзор',   icon: '🏛️', apps: ['map','alerts','analytics','iot','regulatory','contacts','blockchain','workspace','rd','whitepaper','tiif'], dock: ['map','alerts','analytics','regulatory'], widgets: ['alerts','monitoring','stats','news'] },
  minister:        { label: 'Министр',        icon: '👔', apps: ['map','analytics','contacts','ecosystem','regulatory','workspace','invest','tiif','community','hub','blockchain','documents'], dock: ['map','analytics','contacts','documents'], widgets: ['stats','projects','news','alerts'] },
  regional_water:  { label: 'Региональный',   icon: '🌊', apps: ['map','iot','alerts','hub','workspace','regulatory','catalog','rd','messages','contacts','analytics'], dock: ['map','iot','alerts','hub'], widgets: ['alerts','monitoring','projects','events'] },
  engineer:        { label: 'Инженер',        icon: '⚙️', apps: ['iot','hub','twin','workspace','rd','catalog','alerts','marketplace','tech','ai_gen','blockchain'], dock: ['iot','hub','alerts','catalog'], widgets: ['monitoring','alerts','tasks','events'] },
  researcher:      { label: 'Исследователь',  icon: '🔬', apps: ['rd','catalog','hub','analytics','iot','whitepaper','community','workspace','contacts','messages','explorer'], dock: ['rd','catalog','analytics','iot'], widgets: ['rd','news','monitoring','stats'] },
  investor:        { label: 'Инвестор',       icon: '💰', apps: ['invest','analytics','hub','blockchain','marketplace','contacts','tiif','rd','ecosystem','documents'], dock: ['invest','analytics','marketplace','documents'], widgets: ['investment','projects','news','stats'] },
  bank:            { label: 'Банк / Финансы', icon: '🏦', apps: ['invest','analytics','workspace','contacts','regulatory','blockchain','hub','marketplace','community','documents'], dock: ['invest','analytics','regulatory','documents'], widgets: ['investment','projects','partnerships','stats'] },
  object_manager:  { label: 'Управляющий',    icon: '🏗️', apps: ['iot','hub','alerts','workspace','contacts','analytics','regulatory','messages','map','catalog'], dock: ['iot','alerts','hub','workspace'], widgets: ['monitoring','alerts','tasks','events'] },
  field_worker:    { label: 'Оператор',       icon: '🦺', apps: ['iot','alerts','map','hub','workspace','messages','contacts','catalog'], dock: ['iot','alerts','map','messages'], widgets: ['monitoring','alerts','events','tasks'] },
  analyst:         { label: 'Аналитик',       icon: '📊', apps: ['analytics','hub','iot','rd','regulatory','contacts','workspace','blockchain','catalog','marketplace'], dock: ['analytics','hub','iot','rd'], widgets: ['stats','projects','monitoring','rd'] },
  default:         { label: 'По умолчанию',   icon: '👤', apps: ['map','hub','iot','alerts','analytics','messages','marketplace','workspace','contacts','profile'], dock: ['map','alerts','hub','iot'], widgets: ['alerts','news','projects','stats'] },
};

const CATEGORIES = [
  { id: 'all',        label: 'Все' },
  { id: 'monitoring', label: 'Мониторинг' },
  { id: 'management', label: 'Управление' },
  { id: 'analytics',  label: 'Аналитика' },
  { id: 'finance',    label: 'Финансы' },
  { id: 'tools',      label: 'Инструменты' },
  { id: 'community',  label: 'Сообщество' },
  { id: 'research',   label: 'Исследования' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Background components
// ─────────────────────────────────────────────────────────────────────────────

function BlockchainBg() {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: -1, background: '#000818' }}
    >
      <style>{`
        @keyframes gridMove {
          0%   { transform: translate(0, 0); }
          100% { transform: translate(-60px, -60px); }
        }
        @keyframes nodePulse {
          0%, 100% { opacity: 0.06; }
          50%       { opacity: 0.14; }
        }
      `}</style>

      {/* Animated grid */}
      <svg
        width="100%"
        height="100%"
        style={{ position: 'absolute', inset: 0 }}
      >
        <defs>
          <pattern id="bgGrid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(0,230,200,0.06)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect
          width="200%"
          height="200%"
          x="-50%"
          y="-50%"
          fill="url(#bgGrid)"
          style={{ animation: 'gridMove 20s linear infinite' }}
        />
      </svg>

      {/* Network nodes */}
      <svg
        width="100%"
        height="100%"
        style={{ position: 'absolute', inset: 0 }}
      >
        {[
          { x: '15%', y: '20%' }, { x: '35%', y: '45%' }, { x: '55%', y: '15%' },
          { x: '70%', y: '60%' }, { x: '85%', y: '30%' }, { x: '25%', y: '75%' },
          { x: '60%', y: '80%' }, { x: '45%', y: '35%' },
        ].map((n, i) => (
          <circle
            key={i}
            cx={n.x}
            cy={n.y}
            r="3"
            fill="rgba(0,230,200,0.3)"
            style={{ animation: `nodePulse ${3 + i * 0.4}s ease-in-out infinite` }}
          />
        ))}
        <line x1="15%" y1="20%" x2="35%" y2="45%" stroke="rgba(0,230,200,0.06)" strokeWidth="1" />
        <line x1="35%" y1="45%" x2="55%" y2="15%" stroke="rgba(0,230,200,0.06)" strokeWidth="1" />
        <line x1="55%" y1="15%" x2="85%" y2="30%" stroke="rgba(0,230,200,0.06)" strokeWidth="1" />
        <line x1="35%" y1="45%" x2="70%" y2="60%" stroke="rgba(0,230,200,0.06)" strokeWidth="1" />
        <line x1="70%" y1="60%" x2="60%" y2="80%" stroke="rgba(0,230,200,0.06)" strokeWidth="1" />
        <line x1="25%" y1="75%" x2="60%" y2="80%" stroke="rgba(0,230,200,0.06)" strokeWidth="1" />
        <line x1="45%" y1="35%" x2="70%" y2="60%" stroke="rgba(0,230,200,0.06)" strokeWidth="1" />
      </svg>

      {/* Slow glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 20% 60%, rgba(0,230,200,0.05) 0%, transparent 50%)',
        }}
      />
    </div>
  );
}

function DeepOceanBg() {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: -1, background: '#000818' }}
    >
      <style>{`
        @keyframes oceanDrift {
          0%, 100% { transform: translateY(0) translateX(0); }
          33%       { transform: translateY(-8px) translateX(4px); }
          66%       { transform: translateY(4px) translateX(-6px); }
        }
        @keyframes waveSway {
          0%, 100% { transform: scaleX(1) translateY(0); }
          50%       { transform: scaleX(1.03) translateY(-6px); }
        }
        @keyframes particleFloat {
          0%, 100% { transform: translateY(0); opacity: 0.12; }
          50%       { transform: translateY(-18px); opacity: 0.22; }
        }
      `}</style>

      {/* Drifting teal glow */}
      <div
        style={{
          position: 'absolute',
          width: '70%',
          height: '70%',
          top: '15%',
          left: '15%',
          background: 'radial-gradient(ellipse, rgba(0,100,90,0.07) 0%, transparent 70%)',
          animation: 'oceanDrift 12s ease-in-out infinite',
        }}
      />

      {/* Wave shape */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '45%',
          background: 'rgba(0,230,200,0.04)',
          clipPath: 'ellipse(120% 40% at 50% 110%)',
          animation: 'waveSway 8s ease-in-out infinite',
        }}
      />

      {/* Particles */}
      {[
        { left: '10%', top: '30%', delay: '0s' },
        { left: '25%', top: '60%', delay: '1.5s' },
        { left: '50%', top: '45%', delay: '0.8s' },
        { left: '70%', top: '25%', delay: '2s' },
        { left: '85%', top: '55%', delay: '1.2s' },
        { left: '40%', top: '70%', delay: '0.4s' },
      ].map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: p.left,
            top: p.top,
            width: '3px',
            height: '3px',
            borderRadius: '50%',
            background: 'rgba(0,230,200,0.5)',
            animation: `particleFloat ${4 + i * 0.6}s ease-in-out infinite`,
            animationDelay: p.delay,
          }}
        />
      ))}
    </div>
  );
}

function WorldMapBg() {
  // Simple continent approximations in SVG viewBox 0 0 360 180
  // Longitude -180..180 → 0..360, Latitude 90..-90 → 0..180
  const toSvg = (lon: number, lat: number) => [lon + 180, 90 - lat] as [number, number];

  type Continent = { name: string; points: [number, number][] };
  const continents: Continent[] = [
    {
      name: 'northAmerica',
      points: [toSvg(-130,70), toSvg(-60,70), toSvg(-60,25), toSvg(-80,15), toSvg(-130,25)],
    },
    {
      name: 'europe',
      points: [toSvg(-10,70), toSvg(40,70), toSvg(40,35), toSvg(-10,35)],
    },
    {
      name: 'asia',
      points: [toSvg(40,70), toSvg(145,70), toSvg(145,10), toSvg(40,10)],
    },
    {
      name: 'africa',
      points: [toSvg(-20,38), toSvg(55,38), toSvg(55,-35), toSvg(-20,-35)],
    },
    {
      name: 'southAmerica',
      points: [toSvg(-80,15), toSvg(-35,15), toSvg(-35,-55), toSvg(-80,-55)],
    },
    {
      name: 'australia',
      points: [toSvg(115,-10), toSvg(155,-10), toSvg(155,-40), toSvg(115,-40)],
    },
  ];

  // Key Central Asia water points: [lon, lat]
  const waterPoints: [number, number][] = [
    [60, 45],  // Aral Sea
    [63, 37],  // Amu Darya delta
    [71, 40],  // Fergana Valley
    [69, 41],  // Tashkent
    [68, 44],  // Syr Darya
  ];

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: -1, background: '#000818' }}
    >
      <style>{`
        @keyframes dotPulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.5); }
        }
      `}</style>

      <svg
        viewBox="0 0 360 180"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        {/* Continents */}
        {continents.map(c => (
          <polygon
            key={c.name}
            points={c.points.map(p => p.join(',')).join(' ')}
            fill="rgba(0,230,200,0.06)"
            stroke="rgba(0,230,200,0.12)"
            strokeWidth="0.4"
          />
        ))}

        {/* Pulsing water points */}
        {waterPoints.map(([lon, lat], i) => {
          const [x, y] = toSvg(lon, lat);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="1.5"
              fill="#f87171"
              style={{
                animation: `dotPulse ${2 + i * 0.3}s ease-in-out infinite`,
                animationDelay: `${i * 0.4}s`,
              }}
            />
          );
        })}
      </svg>

      {/* Dark overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,8,24,0.8)' }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AppIcon
// ─────────────────────────────────────────────────────────────────────────────

interface AppIconProps {
  app: AppDef;
  onClick: () => void;
  isDragging?: boolean;
  isDragOver?: boolean;
  onPointerDown?: (e: React.PointerEvent) => void;
  onPointerMove?: (e: React.PointerEvent) => void;
  onPointerUp?: (e: React.PointerEvent) => void;
  onPointerCancel?: (e: React.PointerEvent) => void;
}

function AppIcon({
  app,
  onClick,
  isDragging,
  isDragOver,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
}: AppIconProps) {
  return (
    <div
      data-app-id={app.id}
      className="flex flex-col items-center gap-1.5 p-2 rounded-2xl cursor-pointer select-none transition-all duration-150 touch-none"
      style={{
        opacity: isDragging ? 0.4 : 1,
        outline: isDragOver ? `2px dashed ${app.color}` : 'none',
        outlineOffset: '2px',
        transform: isDragOver ? 'scale(1.08)' : 'scale(1)',
      }}
      onClick={onClick}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      <div
        className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl hover:scale-110 transition-transform duration-150 active:scale-95"
        style={{ background: `${app.color}18`, border: `1px solid ${app.color}28` }}
      >
        {app.icon}
      </div>
      <span className="text-[10px] sm:text-[11px] text-white/55 text-center leading-tight max-w-[64px] truncate">
        {app.name}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BgSelector
// ─────────────────────────────────────────────────────────────────────────────

function BgSelector({
  current,
  onChange,
}: {
  current: string;
  onChange: (bg: DashboardPrefs['background']) => void;
}) {
  const [open, setOpen] = useState(false);

  const options: { id: DashboardPrefs['background']; label: string; icon: string }[] = [
    { id: 'blockchain', label: 'Блокчейн', icon: '🔗' },
    { id: 'deep_ocean', label: 'Океан',    icon: '🌊' },
    { id: 'world_map',  label: 'Карта',    icon: '🗺️' },
  ];

  return (
    <div className="fixed bottom-24 right-4 z-30 flex flex-col items-end gap-2">
      {open &&
        options.map(opt => (
          <button
            key={opt.id}
            onClick={() => {
              onChange(opt.id);
              setOpen(false);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs transition-all"
            style={{
              background:
                current === opt.id ? 'rgba(0,230,200,0.2)' : 'rgba(0,8,24,0.9)',
              border: `1px solid ${current === opt.id ? 'rgba(0,230,200,0.4)' : 'rgba(255,255,255,0.15)'}`,
              color: current === opt.id ? '#00e6c8' : 'rgba(255,255,255,0.7)',
            }}
          >
            {opt.icon} {opt.label}
          </button>
        ))}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
        style={{ background: 'rgba(0,8,24,0.88)', border: '1px solid rgba(255,255,255,0.15)' }}
      >
        <Palette className="w-4 h-4 text-white/60" />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AppStoreModal
// ─────────────────────────────────────────────────────────────────────────────

interface AppStoreModalProps {
  onClose: () => void;
  prefs: DashboardPrefs;
  updatePrefs: (partial: Partial<DashboardPrefs>) => void;
  onResetToRole: () => void;
}

function AppStoreModal({ onClose, prefs, updatePrefs, onResetToRole }: AppStoreModalProps) {
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');

  const filteredApps = ALL_APPS.filter(a => {
    const matchCat = category === 'all' || a.category === category;
    const matchQ =
      !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchQ;
  });

  const toggleApp = useCallback(
    (id: string) => {
      const next = prefs.apps.includes(id)
        ? prefs.apps.filter(x => x !== id)
        : [...prefs.apps, id];
      updatePrefs({ apps: next });
    },
    [prefs.apps, updatePrefs]
  );

  const toggleWidget = useCallback(
    (id: string) => {
      const next = { ...prefs.widget_enabled, [id]: !prefs.widget_enabled[id] };
      updatePrefs({ widget_enabled: next });
    },
    [prefs.widget_enabled, updatePrefs]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: 'rgba(0,6,18,0.97)', backdropFilter: 'blur(24px)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-4 shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div>
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            <Store className="w-5 h-5 text-cyan-400" />
            Магазин приложений
          </h2>
          <p className="text-white/35 text-xs mt-0.5">
            {prefs.apps.length} из {ALL_APPS.length} приложений активны
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onResetToRole}
            className="px-4 py-2 rounded-xl text-xs text-white/55 transition-all hover:text-white/80"
            style={{
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.04)',
            }}
          >
            Сбросить к роли
          </button>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white transition-colors"
            style={{ border: '1px solid rgba(255,255,255,0.12)' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search + Categories */}
      <div
        className="shrink-0 px-6 py-3 space-y-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div
          className="flex items-center gap-2 px-3 h-9 rounded-xl"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <Search className="w-3.5 h-3.5 text-white/30 shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск приложений..."
            className="bg-transparent text-sm text-white/70 outline-none flex-1 placeholder-white/25"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-white/30 hover:text-white/60">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className="shrink-0 px-3 py-1.5 rounded-lg text-xs transition-all"
              style={
                category === cat.id
                  ? {
                      background: 'rgba(0,230,200,0.15)',
                      color: '#00e6c8',
                      border: '1px solid rgba(0,230,200,0.3)',
                    }
                  : {
                      background: 'rgba(255,255,255,0.04)',
                      color: 'rgba(255,255,255,0.45)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }
              }
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        {/* Apps grid */}
        {filteredApps.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-white/25">
            <Search className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">Ничего не найдено</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredApps.map(app => {
              const isAdded = prefs.apps.includes(app.id);
              return (
                <div
                  key={app.id}
                  className="flex items-center gap-4 p-4 rounded-2xl transition-all duration-150"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                    style={{ background: `${app.color}15`, border: `1px solid ${app.color}25` }}
                  >
                    {app.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{app.name}</p>
                    <p className="text-white/40 text-xs leading-relaxed mt-0.5 line-clamp-2">
                      {app.description}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleApp(app.id)}
                    className="shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                    style={
                      isAdded
                        ? {
                            background: 'rgba(74,222,128,0.12)',
                            color: '#4ade80',
                            border: '1px solid rgba(74,222,128,0.3)',
                          }
                        : {
                            background: 'rgba(0,230,200,0.08)',
                            color: '#00e6c8',
                            border: '1px solid rgba(0,230,200,0.22)',
                          }
                    }
                  >
                    {isAdded ? '✓ Активно' : '+ Добавить'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Widgets section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.07)' }} />
            <span className="text-xs text-white/30 px-2">Виджеты</span>
            <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.07)' }} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Object.entries(WIDGET_REGISTRY).map(([id, w]) => {
              const enabled = prefs.widget_enabled[id] ?? w.defaultEnabled;
              return (
                <div
                  key={id}
                  className="flex items-center gap-3 p-3 rounded-xl transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <span className="text-lg">{w.icon}</span>
                  <span className="text-sm text-white/65 flex-1">{w.name}</span>
                  <button
                    onClick={() => toggleWidget(id)}
                    className="shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all"
                    style={
                      enabled
                        ? {
                            background: 'rgba(0,230,200,0.15)',
                            color: '#00e6c8',
                            border: '1px solid rgba(0,230,200,0.3)',
                          }
                        : {
                            background: 'rgba(255,255,255,0.04)',
                            color: 'rgba(255,255,255,0.35)',
                            border: '1px solid rgba(255,255,255,0.08)',
                          }
                    }
                  >
                    {enabled ? 'Вкл' : 'Выкл'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Drag & drop helper
// ─────────────────────────────────────────────────────────────────────────────

function reorder(arr: string[], from: string, to: string): string[] {
  const next = [...arr];
  const fi = next.indexOf(from);
  const ti = next.indexOf(to);
  if (fi < 0 || ti < 0) return arr;
  next.splice(fi, 1);
  next.splice(ti, 0, from);
  return next;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main DashboardPage
// ─────────────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [, setLocation] = useLocation();
  const { prefs, updatePrefs } = useDashboardPreferences();

  const [showStore, setShowStore] = useState(false);
  const [search, setSearch] = useState('');
  const [clock, setClock] = useState(new Date());
  const [alertCount, setAlertCount] = useState(0);

  // Drag state
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [ghostPos, setGhostPos] = useState({ x: 0, y: 0 });
  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Clock
  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Alert count badge
  useEffect(() => {
    supabase
      .from('water_alerts')
      .select('id', { count: 'exact', head: true })
      .eq('resolved', false)
      .then(({ count }) => setAlertCount(count ?? 0));
  }, []);

  // Lock body scroll when store open
  useEffect(() => {
    document.body.style.overflow = showStore ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showStore]);

  const navigate = useCallback((path: string) => setLocation(path), [setLocation]);

  const roleConfig = ROLE_CONFIG[prefs.role];

  const visibleApps = ALL_APPS.filter(a => prefs.apps.includes(a.id));
  const filteredApps = search
    ? visibleApps.filter(a => a.name.toLowerCase().includes(search.toLowerCase()))
    : visibleApps;
  const dockApps = ALL_APPS.filter(a => prefs.dock.includes(a.id));

  // Active background component
  const BgComponent =
    prefs.background === 'blockchain'
      ? BlockchainBg
      : prefs.background === 'deep_ocean'
      ? DeepOceanBg
      : WorldMapBg;

  const handleRoleChange = useCallback(
    (role: Role) => {
      const config = ROLE_CONFIG[role];
      updatePrefs({
        role,
        apps: config.apps,
        dock: config.dock,
        widget_order: config.widgets,
        widget_enabled: Object.fromEntries(config.widgets.map(id => [id, true])),
      });
    },
    [updatePrefs]
  );

  // Ordered enabled widgets
  const activeWidgets = prefs.widget_order.filter(
    id => prefs.widget_enabled[id] && WIDGET_REGISTRY[id]
  );

  // ── Drag handlers ──────────────────────────────────────────────────────────

  const onPointerDown = useCallback(
    (id: string, e: React.PointerEvent) => {
      longPressRef.current = setTimeout(() => {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        setDraggingId(id);
        setGhostPos({ x: e.clientX, y: e.clientY });
      }, 400);
    },
    []
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!draggingId) return;
      e.preventDefault();
      setGhostPos({ x: e.clientX, y: e.clientY });
      const el = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-app-id]');
      const overId = el?.getAttribute('data-app-id') ?? null;
      setDragOverId(overId !== draggingId ? overId : null);
    },
    [draggingId]
  );

  const onPointerUp = useCallback(() => {
    if (longPressRef.current) clearTimeout(longPressRef.current);
    if (draggingId && dragOverId) {
      updatePrefs({ apps: reorder(prefs.apps, draggingId, dragOverId) });
    }
    setDraggingId(null);
    setDragOverId(null);
  }, [draggingId, dragOverId, prefs.apps, updatePrefs]);

  const onPointerCancel = onPointerUp;

  // ── Time formatting ────────────────────────────────────────────────────────

  const timeStr = clock.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  const dateStr = clock.toLocaleDateString('ru-RU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen">
      <BgComponent />

      {/* Drag ghost */}
      {draggingId && (
        <div
          className="fixed pointer-events-none z-50 text-4xl"
          style={{
            left: ghostPos.x - 32,
            top: ghostPos.y - 32,
            transform: 'scale(1.2)',
          }}
        >
          {ALL_APPS.find(a => a.id === draggingId)?.icon}
        </div>
      )}

      {/* ── OS Top Bar ────────────────────────────────────────────────────── */}
      <div
        className="fixed top-0 left-0 right-0 z-20 h-12 flex items-center px-4 gap-3"
        style={{
          background: 'rgba(0,8,24,0.88)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0,230,200,0.07)',
        }}
      >
        {/* Role label */}
        <div className="text-[11px] text-white/40 hidden sm:block shrink-0 select-none">
          {roleConfig.icon} {roleConfig.label}
        </div>

        {/* Search */}
        <div className="flex-1 max-w-xs mx-auto">
          <div
            className="flex items-center gap-2 px-3 h-8 rounded-xl transition-all focus-within:border-cyan-400/30"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.09)',
            }}
          >
            <Search className="w-3.5 h-3.5 text-white/30 shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Поиск..."
              className="bg-transparent text-xs text-white/70 outline-none flex-1 placeholder-white/22"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-white/30 hover:text-white/60">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="hidden sm:flex flex-col items-end mr-1">
            <span className="text-sm font-mono text-white/70 leading-none">{timeStr}</span>
            <span className="text-[10px] text-white/30 leading-none mt-0.5 capitalize">{dateStr}</span>
          </div>

          <button
            onClick={() => navigate('/alerts')}
            className="relative w-8 h-8 flex items-center justify-center rounded-xl transition-all hover:bg-white/8"
          >
            <Bell className="w-4 h-4 text-white/55" />
            {alertCount > 0 && (
              <span
                className="absolute top-1 right-1 min-w-[8px] h-2 rounded-full bg-red-500 flex items-center justify-center"
                style={{ fontSize: '7px', color: '#fff', padding: '0 2px' }}
              >
                {alertCount > 9 ? '9+' : alertCount}
              </span>
            )}
          </button>

          <button
            onClick={() => navigate('/profile')}
            className="w-8 h-8 flex items-center justify-center rounded-xl transition-all hover:bg-white/8"
          >
            <User className="w-4 h-4 text-white/55" />
          </button>
        </div>
      </div>

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 pt-16 pb-28">

        {/* Widget Row */}
        <div
          className="mt-3 mb-4 flex gap-3 overflow-x-auto pb-2"
          style={{ scrollbarWidth: 'none' }}
        >
          {activeWidgets.map(id => {
            const W = WIDGET_REGISTRY[id].component;
            return <W key={id} onNavigate={navigate} />;
          })}
          <button
            onClick={() => setShowStore(true)}
            className="shrink-0 min-w-[120px] rounded-2xl flex flex-col items-center justify-center gap-2 transition-all hover:border-white/20"
            style={{
              border: '1px dashed rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.02)',
            }}
          >
            <Plus className="w-5 h-5 text-white/25" />
            <span className="text-[10px] text-white/25">Добавить виджет</span>
          </button>
        </div>

        {/* Role + Store row */}
        <div
          className="flex items-center gap-2 mb-4 overflow-x-auto pb-1"
          style={{ scrollbarWidth: 'none' }}
        >
          <span className="text-[10px] text-white/30 shrink-0">Роль:</span>
          {(Object.keys(ROLE_CONFIG) as Role[]).map(role => (
            <button
              key={role}
              onClick={() => handleRoleChange(role)}
              className="shrink-0 px-2.5 py-1 rounded-xl text-[10px] transition-all"
              style={
                prefs.role === role
                  ? {
                      background: 'rgba(0,230,200,0.14)',
                      color: '#00e6c8',
                      border: '1px solid rgba(0,230,200,0.28)',
                    }
                  : {
                      background: 'rgba(255,255,255,0.04)',
                      color: 'rgba(255,255,255,0.38)',
                      border: '1px solid rgba(255,255,255,0.07)',
                    }
              }
            >
              {ROLE_CONFIG[role].icon} {ROLE_CONFIG[role].label}
            </button>
          ))}
          <button
            onClick={() => setShowStore(true)}
            className="shrink-0 ml-auto flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] transition-all"
            style={{
              background: 'rgba(0,230,200,0.07)',
              color: '#00e6c8',
              border: '1px solid rgba(0,230,200,0.18)',
            }}
          >
            <Store className="w-3 h-3" /> Магазин
          </button>
        </div>

        {/* App Grid */}
        {search && filteredApps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-white/25">
            <Search className="w-10 h-10 mb-3 opacity-40" />
            <p className="text-sm">Приложения не найдены</p>
            <button
              onClick={() => setSearch('')}
              className="mt-3 text-xs text-cyan-400/60 hover:text-cyan-400 transition"
            >
              Сбросить поиск
            </button>
          </div>
        ) : (
          <div
            ref={gridRef}
            className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-1 sm:gap-2"
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerCancel}
          >
            {filteredApps.map(app => (
              <AppIcon
                key={app.id}
                app={app}
                onClick={() => { if (!draggingId) navigate(app.path); }}
                isDragging={draggingId === app.id}
                isDragOver={dragOverId === app.id}
                onPointerDown={e => onPointerDown(app.id, e)}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerCancel}
              />
            ))}
            {!search && (
              <button
                onClick={() => setShowStore(true)}
                className="flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all hover:border-white/20"
                style={{ border: '1px dashed rgba(255,255,255,0.1)' }}
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center">
                  <Plus className="w-6 h-6 text-white/25" />
                </div>
                <span className="text-[10px] text-white/25">Добавить</span>
              </button>
            )}
          </div>
        )}

        {/* Empty state */}
        {!search && filteredApps.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-white/25">
            <div className="text-4xl mb-4">🏗️</div>
            <p className="text-sm mb-2">Нет активных приложений</p>
            <button
              onClick={() => setShowStore(true)}
              className="mt-3 px-4 py-2 rounded-xl text-xs transition-all"
              style={{
                background: 'rgba(0,230,200,0.10)',
                color: '#00e6c8',
                border: '1px solid rgba(0,230,200,0.22)',
              }}
            >
              Открыть магазин приложений
            </button>
          </div>
        )}
      </div>

      {/* ── Bottom Dock ───────────────────────────────────────────────────── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-20 flex justify-center py-2 px-4"
        style={{
          background: 'rgba(0,8,24,0.75)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div
          className="flex items-center gap-2 sm:gap-3 px-3 py-1.5 rounded-2xl"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {dockApps.map(app => (
            <button
              key={app.id}
              onClick={() => navigate(app.path)}
              title={app.name}
              className="flex flex-col items-center gap-1 transition-all hover:scale-110 active:scale-95"
            >
              <div
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-xl sm:text-2xl"
                style={{ background: `${app.color}20`, border: `1px solid ${app.color}30` }}
              >
                {app.icon}
              </div>
              <span className="text-[9px] text-white/35 hidden sm:block">{app.name}</span>
            </button>
          ))}
          <div className="w-px h-10 mx-1" style={{ background: 'rgba(255,255,255,0.08)' }} />
          <button
            onClick={() => setShowStore(true)}
            title="Магазин"
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all hover:scale-110"
            style={{ border: '1px dashed rgba(255,255,255,0.14)' }}
          >
            <Plus className="w-5 h-5 text-white/28" />
          </button>
        </div>
      </div>

      {/* Background selector */}
      <BgSelector
        current={prefs.background}
        onChange={bg => updatePrefs({ background: bg })}
      />

      {/* App Store Modal */}
      {showStore && (
        <AppStoreModal
          onClose={() => setShowStore(false)}
          prefs={prefs}
          updatePrefs={updatePrefs}
          onResetToRole={() => handleRoleChange(prefs.role)}
        />
      )}
    </div>
  );
}
