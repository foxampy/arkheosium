// src/components/dashboard/widgets/ActivityWidget.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

interface ActivityItem { id: string; action: string; entity_name: string; user_name?: string; created_at: string; }

export function ActivityWidget() {
  const [items, setItems] = useState<ActivityItem[]>([]);
  useEffect(() => {
    supabase.from('platform_activity').select('*').order('created_at', { ascending: false }).limit(15)
      .then(({ data }) => { if (data) setItems(data); });
  }, []);

  if (items.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-white/30 text-xs">
        Активность будет отображаться здесь
      </div>
    );
  }
  return (
    <div className="space-y-2 overflow-y-auto h-full">
      {items.map(item => (
        <div key={item.id} className="flex items-start gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400/60 mt-1.5 shrink-0" />
          <div>
            <p className="text-xs text-white/70">{item.action} <span className="text-cyan-400">{item.entity_name}</span></p>
            <p className="text-[10px] text-white/30">
              {item.user_name && `${item.user_name} · `}
              {formatDistanceToNow(new Date(item.created_at), { locale: ru, addSuffix: true })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
