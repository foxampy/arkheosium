import { useEffect, useRef, useCallback } from 'react';

const POLL_INTERVAL = 30_000; // 30 seconds
const STORAGE_KEY = 'vodprom-notif-last-seen';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export function useAlertNotifications(enabled: boolean) {
  const lastSeenRef = useRef<string>(
    localStorage.getItem(STORAGE_KEY) ?? new Date(0).toISOString()
  );

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    const result = await Notification.requestPermission();
    return result === 'granted';
  }, []);

  const checkNewAlerts = useCallback(async () => {
    if (Notification.permission !== 'granted') return;
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return;

    try {
      const since = lastSeenRef.current;
      const url = `${SUPABASE_URL}/rest/v1/water_alerts?resolved=eq.false&severity=in.(critical,warning)&created_at=gt.${encodeURIComponent(since)}&order=created_at.desc&limit=5`;

      const res = await fetch(url, {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      });

      if (!res.ok) return;
      const alerts: Array<{
        id: string;
        title: string;
        description: string;
        severity: string;
        object_name: string;
        created_at: string;
      }> = await res.json();

      if (alerts.length === 0) return;

      // Update last seen to newest alert
      lastSeenRef.current = alerts[0].created_at;
      localStorage.setItem(STORAGE_KEY, alerts[0].created_at);

      // Fire notification for each new alert (max 3)
      alerts.slice(0, 3).forEach((alert) => {
        const icon = alert.severity === 'critical' ? '🔴' : '⚠️';
        const notif = new Notification(`${icon} VODPROM: ${alert.title}`, {
          body: `${alert.object_name ?? ''}\n${alert.description ?? ''}`.trim(),
          icon: '/logo.png',
          badge: '/logo.png',
          tag: `vodprom-alert-${alert.id}`,
          requireInteraction: alert.severity === 'critical',
        });

        notif.onclick = () => {
          window.focus();
          window.location.href = '/alerts';
        };
      });
    } catch (err) {
      console.warn('[VODPROM Notifications] fetch error:', err);
    }
  }, []);

  useEffect(() => {
    if (!enabled || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    // Initial check after short delay
    const init = setTimeout(checkNewAlerts, 2000);
    // Then poll every 30s
    const interval = setInterval(checkNewAlerts, POLL_INTERVAL);

    return () => {
      clearTimeout(init);
      clearInterval(interval);
    };
  }, [enabled, checkNewAlerts]);

  return { requestPermission, checkNewAlerts };
}
