import { useState } from 'react';
import { Bell, X, CheckCircle } from 'lucide-react';

interface Props {
  onRequest: () => Promise<boolean>;
}

export function NotificationPermissionBanner({ onRequest }: Props) {
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem('vodprom-notif-dismissed') === '1'
  );
  const [status, setStatus] = useState<'idle' | 'granted' | 'denied'>('idle');

  if (dismissed || !('Notification' in window)) return null;
  if (Notification.permission === 'granted') return null;

  const handle = async () => {
    const ok = await onRequest();
    setStatus(ok ? 'granted' : 'denied');
    if (ok) {
      setTimeout(() => {
        localStorage.setItem('vodprom-notif-dismissed', '1');
        setDismissed(true);
      }, 2000);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('vodprom-notif-dismissed', '1');
  };

  return (
    <div
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-[9999] rounded-2xl p-4 flex items-start gap-3"
      style={{
        background: 'rgba(10,22,40,0.97)',
        border: '1px solid rgba(0,230,200,0.25)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.5), 0 0 40px rgba(0,230,200,0.06)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: 'rgba(0,230,200,0.12)', border: '1px solid rgba(0,230,200,0.25)' }}
      >
        <Bell className="w-5 h-5" style={{ color: '#00e6c8' }} />
      </div>

      <div className="flex-1 min-w-0">
        {status === 'granted' ? (
          <div className="flex items-center gap-2 text-green-400 text-sm font-semibold">
            <CheckCircle className="w-4 h-4" /> Уведомления включены!
          </div>
        ) : status === 'denied' ? (
          <p className="text-red-400 text-sm">Доступ запрещён. Включите в настройках браузера.</p>
        ) : (
          <>
            <p className="text-white text-sm font-semibold mb-0.5">Включить алерты?</p>
            <p className="text-white/50 text-xs mb-2 leading-relaxed">
              Получайте мгновенные уведомления о критических ситуациях на водных объектах
            </p>
            <button
              onClick={handle}
              className="px-4 py-1.5 rounded-xl text-xs font-bold transition-all"
              style={{
                background: 'linear-gradient(135deg, rgba(0,230,200,0.2), rgba(0,230,200,0.08))',
                border: '1px solid rgba(0,230,200,0.35)',
                color: '#00e6c8',
              }}
            >
              Включить уведомления
            </button>
          </>
        )}
      </div>

      <button
        onClick={handleDismiss}
        className="shrink-0 text-white/30 hover:text-white/60 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
