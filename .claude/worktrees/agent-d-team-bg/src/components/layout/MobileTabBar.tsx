// ═══════════════════════════════════════════════════════════════
//  MobileTabBar — нижний таб-бар (только мобайл). 5 быстрых входов.
//  Раньше всё пряталось в бургер — теперь ключевые разделы на виду.
// ═══════════════════════════════════════════════════════════════

import { useLocation } from 'wouter';
import { Globe, Map, FolderOpen, Search, User } from 'lucide-react';

const TABS = [
  { path: '/', label: 'Глобус', icon: Globe },
  { path: '/map', label: 'Карта', icon: Map },
  { path: '/hub', label: 'Проекты', icon: FolderOpen },
  { path: '__search', label: 'Поиск', icon: Search },
  { path: '/account', label: 'Профиль', icon: User },
];

export function MobileTabBar() {
  const [location, setLocation] = useLocation();

  const isActive = (p: string) =>
    p !== '__search' && (location === p || (p !== '/' && location.startsWith(p)));

  const onTab = (p: string) => {
    if (p === '__search') {
      // trigger command palette via synthetic Ctrl+K
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
    } else {
      setLocation(p);
    }
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[8500] sm:hidden flex items-stretch"
      style={{
        background: 'rgba(5,13,26,0.96)',
        borderTop: '1px solid rgba(0,200,230,0.12)',
        backdropFilter: 'blur(20px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {TABS.map((t) => {
        const Icon = t.icon;
        const active = isActive(t.path);
        return (
          <button
            key={t.path}
            onClick={() => onTab(t.path)}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-colors cursor-pointer"
          >
            <Icon size={20} style={{ color: active ? '#00e6c8' : 'rgba(255,255,255,0.45)' }} />
            <span className="text-[10px]" style={{ color: active ? '#00e6c8' : 'rgba(255,255,255,0.4)' }}>
              {t.label}
            </span>
            {active && (
              <span className="absolute top-0 w-8 h-0.5 rounded-full" style={{ background: '#00e6c8' }} />
            )}
          </button>
        );
      })}
    </nav>
  );
}
