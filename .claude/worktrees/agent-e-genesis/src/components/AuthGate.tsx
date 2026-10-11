import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import { Lock, LogIn } from 'lucide-react';

interface AuthGateProps {
  children: React.ReactNode;
  message?: string;
}

/**
 * Wraps content that requires authentication.
 * Shows a prompt to sign in if user is not authenticated.
 */
export function AuthGate({ children, message }: AuthGateProps) {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  if (isAuthenticated) return <>{children}</>;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{
          background: 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(251,191,36,0.05))',
          border: '1px solid rgba(251,191,36,0.2)',
        }}>
        <Lock className="w-7 h-7 text-amber-400/70" />
      </div>
      <h3 className="text-lg font-bold text-white mb-2">Требуется авторизация</h3>
      <p className="text-sm text-white/40 max-w-sm mb-6 leading-relaxed">
        {message ?? 'Для доступа к этому разделу необходимо войти в аккаунт или зарегистрироваться.'}
      </p>
      <button
        onClick={() => setLocation('/account')}
        className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition"
        style={{
          background: 'linear-gradient(135deg, rgba(6,182,212,0.25), rgba(34,211,238,0.1))',
          border: '1px solid rgba(34,211,238,0.3)',
        }}
      >
        <LogIn className="w-4 h-4" />
        Войти / Регистрация
      </button>
    </div>
  );
}
