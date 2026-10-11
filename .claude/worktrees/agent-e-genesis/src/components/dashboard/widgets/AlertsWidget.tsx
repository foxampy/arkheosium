// src/components/dashboard/widgets/AlertsWidget.tsx
import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Alert { id: string; title: string; severity: string; created_at: string; object_name?: string; }

export function AlertsWidget() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  useEffect(() => {
    // Subscribe to water quality alerts from Supabase
    supabase.from('water_alerts').select('*').order('created_at', { ascending: false }).limit(10)
      .then(({ data }) => { if (data) setAlerts(data); });
    // Also subscribe to realtime
    const sub = supabase.channel('water_alerts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'water_alerts' },
        (payload) => setAlerts(prev => [payload.new as Alert, ...prev].slice(0, 10)))
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, []);

  if (alerts.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-2 text-white/30">
        <CheckCircle2 size={24} className="text-green-500/40" />
        <p className="text-xs">Активных алертов нет</p>
        <p className="text-[10px] text-white/20">Мониторинг ведётся в реальном времени</p>
      </div>
    );
  }
  return (
    <div className="space-y-2 overflow-y-auto h-full pr-1">
      {alerts.map(a => (
        <div key={a.id} className="flex items-start gap-2 p-2 rounded-lg bg-white/5">
          <AlertTriangle size={12} className={a.severity === 'critical' ? 'text-red-400 mt-0.5' : 'text-amber-400 mt-0.5'} />
          <div>
            <p className="text-xs text-white/80">{a.title}</p>
            {a.object_name && <p className="text-[10px] text-white/40">{a.object_name}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
