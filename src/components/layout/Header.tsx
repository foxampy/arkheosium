import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import {
  Menu, X, Map, FolderOpen, TrendingUp,
  Phone, Settings, User, LogOut, Download,
  ChevronRight, ChevronDown, ArrowLeft, FlaskConical, BookOpen,
  LayoutDashboard, Users, MessageSquare, Briefcase,
  BarChart2, Waves, FileText, Cpu, ShoppingCart, Leaf, QrCode, Activity,
  Bell, Globe, Network, Database, Building2,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useMessages } from '@/hooks/useMessages';
import { usePWA } from '@/hooks/usePWA';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';

type NavItem = {
  nameKey: string;
  path: string;
  icon: typeof Map;
  color: string;
  badge?: string;
  /** Russian fallback label for pages without an i18n key yet. */
  label?: string;
};

type NavGroup = {
  id: string;
  /** Russian group title (structural — shown as-is). */
  title: string;
  items: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    id: 'core',
    title: 'Планетарная ОС',
    items: [
      { nameKey: 'nav.globe',     path: '/',       icon: Globe,          color: '#00d4ff', label: 'Глобус' },
      { nameKey: 'nav.map',       path: '/map',    icon: Map,            color: '#00e6c8', label: 'Карта' },
      { nameKey: 'nav.graph',     path: '/graph',  icon: Network,        color: '#7c3aed', label: 'Граф знаний' },
      { nameKey: 'nav.dashboard', path: '/dashboard', icon: LayoutDashboard, color: '#60a5fa', label: 'Дашборд' },
    ],
  },
  {
    id: 'infra',
    title: 'Инфраструктура',
    items: [
      { nameKey: 'nav.projects',  path: '/hub',          icon: FolderOpen, color: '#4ade80', label: 'Проекты' },
      { nameKey: 'nav.objects',   path: '/hub/objects',  icon: Database,   color: '#00d4ff', label: 'Объекты' },
      { nameKey: 'nav.subjects',  path: '/hub/subjects', icon: Building2,  color: '#00e6c8', label: 'Субъекты' },
      { nameKey: 'nav.iot',       path: '/iot',          icon: Activity,   color: '#4ade80', label: 'IoT-сеть' },
      { nameKey: 'nav.alerts',    path: '/alerts',       icon: Bell,       color: '#f87171', label: 'Алерты' },
    ],
  },
  {
    id: 'analytics',
    title: 'Аналитика и ИИ',
    items: [
      { nameKey: 'nav.analytics', path: '/analytics', icon: BarChart2, color: '#00e6c8', label: 'Аналитика' },
      { nameKey: 'nav.ecosystem', path: '/ecosystem', icon: Leaf,      color: '#4ade80', label: 'Экосистема' },
    ],
  },
  {
    id: 'catalog',
    title: 'Каталог и R&D',
    items: [
      { nameKey: 'nav.catalog',     path: '/catalog',          icon: BookOpen,    color: '#a78bfa', label: 'Каталог' },
      { nameKey: 'nav.rd',          path: '/rd',               icon: FlaskConical,color: '#f59e0b', label: 'R&D' },
      { nameKey: 'nav.tech_market', path: '/tech-marketplace', icon: ShoppingCart,color: '#f59e0b', label: 'Тех. маркетплейс' },
    ],
  },
  {
    id: 'invest',
    title: 'Инвестиции и право',
    items: [
      { nameKey: 'nav.invest',      path: '/invest',      icon: TrendingUp, color: '#fbbf24', label: 'Инвестиции' },
      { nameKey: 'nav.marketplace', path: '/marketplace', icon: Waves,      color: '#4ade80', label: 'Права на воду' },
      { nameKey: 'nav.blockchain',  path: '/blockchain',  icon: Cpu,        color: '#a78bfa', label: 'Блокчейн' },
      { nameKey: 'nav.regulatory',  path: '/regulatory',  icon: FileText,   color: '#fbbf24', label: 'Регуляторика' },
    ],
  },
  {
    id: 'community',
    title: 'Сообщество',
    items: [
      { nameKey: 'nav.community', path: '/community', icon: Users,        color: '#f472b6', label: 'Сообщество' },
      { nameKey: 'nav.messages',  path: '/messages',  icon: MessageSquare,color: '#60a5fa', label: 'Сообщения' },
      { nameKey: 'nav.contacts',  path: '/contacts',  icon: Phone,        color: '#38bdf8', label: 'Контакты' },
      { nameKey: 'nav.workspace', path: '/workspace', icon: Briefcase,    color: '#a78bfa', label: 'Рабочий стол' },
    ],
  },
  {
    id: 'materials',
    title: 'Материалы',
    items: [
      { nameKey: 'nav.documents', path: '/documents',            icon: FileText, color: '#00e6c8', label: 'Материалы / Брошюры' },
      { nameKey: 'nav.whitepaper',path: '/whitepaper',           icon: BookOpen, color: '#06b6d4', label: 'Whitepaper' },
      { nameKey: 'nav.tiif',      path: '/conference/tiif-2026', icon: Map,      color: '#00e6c8', badge: '🇺🇿 TIIF 2026' },
      { nameKey: 'nav.onboard',   path: '/onboard',              icon: QrCode,   color: '#00e6c8', label: 'Активация (QR)' },
    ],
  },
  {
    id: 'account',
    title: 'Аккаунт',
    items: [
      { nameKey: 'nav.account',  path: '/account',  icon: User,    color: '#00e6c8', label: 'Профиль' },
      { nameKey: 'nav.settings', path: '/settings', icon: Settings,color: '#94a3b8', label: 'Настройки' },
    ],
  },
];

/** Find which group owns the current route (for auto-expand). */
function groupIdForPath(path: string): string {
  for (const g of NAV_GROUPS) {
    for (const it of g.items) {
      if (path === it.path || (it.path !== '/' && path.startsWith(it.path + '/'))) {
        return g.id;
      }
    }
  }
  return 'main';
}

export function Header() {
  const [location, setLocation] = useLocation();
  const { isAuthenticated, profile, signOut } = useAuth();
  const { unread: unreadCount } = useMessages();
  const { canInstall, isInstalled, install } = usePWA();
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Set<string>>(
    () => new Set([groupIdForPath(location)]),
  );
  const menuRef = useRef<HTMLDivElement>(null);

  // Whenever the menu opens, auto-expand the group containing the current page.
  useEffect(() => {
    if (menuOpen) {
      setOpenGroups((prev) => new Set(prev).add(groupIdForPath(location)));
    }
  }, [menuOpen, location]);

  const toggleGroup = (id: string) =>
    setOpenGroups((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const isFullscreen = ['/', '/map', '/graph'].includes(location);
  const isHome = isFullscreen;
  const showBack = !isHome;

  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-[9000] h-14 flex items-center px-4 gap-3"
      style={{
        background: isFullscreen ? 'rgba(5,13,26,0.7)' : 'rgba(5,13,26,0.92)',
        borderBottom: '1px solid rgba(0,200,230,0.08)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Back button */}
      {showBack && (
        <button
          onClick={() => {
            if (window.history.length > 1) {
              window.history.back();
            } else {
              setLocation('/');
            }
          }}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/8 transition shrink-0"
          title={t('nav.back')}
        >
          <ArrowLeft className="w-5 h-5 text-white/60" />
        </button>
      )}

      {/* Logo */}
      <button
        onClick={() => setLocation('/')}
        className="flex items-center gap-2 shrink-0"
      >
        <img src="/logo.png" alt="ARKHEOSIUM" className="w-8 h-8"
          style={{ filter: 'brightness(0) invert(1) sepia(1) saturate(2) hue-rotate(185deg)' }} />
        <span className="text-sm font-bold text-white/90 tracking-tight hidden sm:inline">ARKHEOSIUM</span>
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Language switcher */}
      <LanguageSwitcher />

      {/* Alert bell */}
      <style>{`
        @keyframes bellPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        .bell-pulse { animation: bellPulse 2s ease-in-out infinite; }
        .wm-menu-scroll { scrollbar-width: thin; scrollbar-color: rgba(0,200,230,0.35) transparent; }
        .wm-menu-scroll::-webkit-scrollbar { width: 6px; }
        .wm-menu-scroll::-webkit-scrollbar-track { background: transparent; }
        .wm-menu-scroll::-webkit-scrollbar-thumb { background: rgba(0,200,230,0.30); border-radius: 999px; }
        .wm-menu-scroll::-webkit-scrollbar-thumb:hover { background: rgba(0,200,230,0.55); }
      `}</style>
      <div className="relative shrink-0">
        <button
          onClick={() => setLocation('/alerts')}
          className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
          style={{
            background: 'rgba(239,68,68,0.10)',
            border: '1px solid rgba(239,68,68,0.30)',
          }}
          title="Алерты"
        >
          <Bell
            className="w-4 h-4 bell-pulse"
            style={{ color: '#f87171' }}
          />
        </button>
        <span
          className="absolute top-0 right-0 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center font-bold pointer-events-none"
          style={{ fontSize: '9px', lineHeight: 1 }}
        >
          3
        </span>
      </div>

      {/* Account button */}
      <button
        onClick={() => setLocation('/account')}
        className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/8 transition shrink-0"
        title={isAuthenticated ? (profile?.name ?? t('nav.account')) : t('nav.signin')}
      >
        <User className="w-5 h-5 text-white/60" />
        {isAuthenticated && (
          <span className="absolute top-2.5 right-[52px] w-2 h-2 rounded-full bg-emerald-400 border border-[#050d1a]" />
        )}
      </button>

      {/* Burger menu */}
      <div ref={menuRef} className="relative">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/8 transition"
          title={t('nav.menu')}
        >
          {menuOpen ? (
            <X className="w-5 h-5 text-cyan-400" />
          ) : (
            <Menu className="w-5 h-5 text-white/60" />
          )}
        </button>

        {/* Dropdown */}
        {menuOpen && (
          <div
            className="absolute top-full right-0 mt-2 w-72 max-w-[88vw] rounded-2xl overflow-hidden flex flex-col"
            style={{
              background: 'rgba(5,13,26,0.97)',
              border: '1px solid rgba(0,200,230,0.15)',
              backdropFilter: 'blur(24px)',
              boxShadow: '0 12px 48px rgba(0,0,0,0.6)',
              maxHeight: 'calc(100vh - 5rem)',
            }}
          >
            {/* User info — pinned */}
            {isAuthenticated && profile && (
              <div className="px-4 py-3 border-b border-slate-800/50 shrink-0">
                <p className="text-sm font-medium text-white truncate">{profile.name}</p>
                <p className="text-[11px] text-cyan-400/60 mt-0.5">{profile.role}</p>
              </div>
            )}

            {/* Scrollable grouped nav */}
            <div className="flex-1 min-h-0 overflow-y-auto wm-menu-scroll p-2 space-y-0.5">
              {NAV_GROUPS.map((group) => {
                const isOpen = openGroups.has(group.id);
                return (
                  <div key={group.id}>
                    {/* Group header (collapsible) */}
                    <button
                      onClick={() => toggleGroup(group.id)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left hover:bg-white/5 transition"
                    >
                      <span className="text-[11px] uppercase tracking-wider font-semibold text-white/40 flex-1">
                        {group.title}
                      </span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-white/30 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {/* Group items */}
                    {isOpen && (
                      <div className="space-y-0.5 mt-0.5 mb-1">
                        {group.items.map((item) => {
                          const Icon = item.icon;
                          const isActive =
                            location === item.path ||
                            (item.path !== '/' && location.startsWith(item.path + '/'));
                          return (
                            <button
                              key={item.path}
                              onClick={() => { setLocation(item.path); setMenuOpen(false); }}
                              className={`w-full flex items-center gap-3 pl-4 pr-3 py-2.5 rounded-xl text-left transition group
                                ${isActive ? 'bg-white/8' : 'hover:bg-white/5'}`}
                            >
                              <Icon className="w-4.5 h-4.5 shrink-0" style={{ color: item.color }} />
                              <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-white/65 group-hover:text-white'} transition flex-1 truncate`}>
                                {item.badge ?? item.label ?? t(item.nameKey)}
                              </span>
                              {item.badge && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold shrink-0 animate-pulse"
                                  style={{ background: 'rgba(0,230,200,0.15)', color: '#00e6c8', border: '1px solid rgba(0,230,200,0.3)' }}>
                                  LIVE
                                </span>
                              )}
                              {item.path === '/messages' && unreadCount > 0 && (
                                <span className="w-5 h-5 rounded-full bg-cyan-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                                  {unreadCount}
                                </span>
                              )}
                              <ChevronRight className="w-3.5 h-3.5 text-slate-700 opacity-0 group-hover:opacity-100 transition shrink-0" />
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Install app + auth — pinned footer */}
            <div className="shrink-0 border-t border-slate-800/50">
              {canInstall && !isInstalled && (
                <div className="px-2 pt-2">
                  <button
                    onClick={() => { install(); setMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-emerald-500/8 transition group"
                  >
                    <Download className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
                    <span className="text-sm font-medium text-emerald-400/80 group-hover:text-emerald-300 transition">
                      {t('nav.install_app')}
                    </span>
                  </button>
                </div>
              )}
              <div className="p-2">
                {isAuthenticated ? (
                  <button
                    onClick={() => { signOut(); setMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-red-500/8 transition"
                  >
                    <LogOut className="w-4 h-4 text-red-400/70" />
                    <span className="text-sm text-red-400/70">{t('nav.signout')}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => { setLocation('/account'); setMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-cyan-500/8 transition"
                  >
                    <User className="w-4 h-4 text-cyan-400/70" />
                    <span className="text-sm text-cyan-400/70">{t('nav.signin')}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
