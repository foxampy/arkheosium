import { useLocation } from 'wouter';
import { Lock, Gift, MessageCircle, Newspaper } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface PremiumOverlayProps {
  children: React.ReactNode;
  title?: string;
}

export function PremiumOverlay({ children, title = 'Подробная информация' }: PremiumOverlayProps) {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  if (isAuthenticated) return <>{children}</>;

  return (
    <div className="relative rounded-2xl overflow-hidden">
      {/* Blurred content underneath */}
      <div style={{ filter: 'blur(6px)', pointerEvents: 'none', userSelect: 'none' }}>
        {children}
      </div>

      {/* Frosted glass overlay */}
      <div className="absolute inset-0 flex items-center justify-center p-4"
        style={{ background: 'rgba(5,13,26,0.75)', backdropFilter: 'blur(12px)' }}>
        <div className="w-full max-w-sm rounded-2xl p-6 text-center"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,200,230,0.15)', boxShadow: '0 8px 40px rgba(0,0,0,0.4)' }}>

          {/* Lock icon */}
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.2)' }}>
            <Lock className="w-5 h-5 text-cyan-400" />
          </div>

          <h3 className="text-white font-bold text-base mb-1">{title}</h3>
          <p className="text-white/40 text-xs mb-5">Войдите или зарегистрируйтесь чтобы увидеть полные данные</p>

          {/* Bonuses */}
          <div className="space-y-2 mb-5 text-left">
            {[
              { icon: Gift, text: '+50 VOD токенов за регистрацию', color: '#fbbf24' },
              { icon: MessageCircle, text: 'Прямой чат с основателями', color: '#4ade80' },
              { icon: Newspaper, text: 'Актуальные новости и обновления', color: '#60a5fa' },
            ].map(({ icon: Icon, text, color }) => (
              <div key={text} className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
                style={{ background: `${color}08`, border: `1px solid ${color}12` }}>
                <Icon className="w-4 h-4 shrink-0" style={{ color }} />
                <span className="text-white/70 text-xs">{text}</span>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setLocation('/account')}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold transition hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #22d3ee, #06b6d4)', color: '#000' }}>
              Войти
            </button>
            <button
              onClick={() => setLocation('/account')}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition hover:bg-white/8"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff' }}>
              Регистрация
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
