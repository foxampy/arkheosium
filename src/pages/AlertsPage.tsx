import { useState } from 'react';
import { useLocation } from 'wouter';
import {
  ArrowLeft,
  AlertTriangle,
  Info,
  CheckCircle,
  MapPin,
  Bell,
  Download,
  Edit,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { useWaterAlerts, type WaterAlert } from '../hooks/useWaterAlerts';

// ─── Types ───────────────────────────────────────────────────────────────────

type Severity = 'critical' | 'warning' | 'info' | 'resolved';

function dbSeverity(alert: WaterAlert): Severity {
  if (alert.resolved) return 'resolved';
  return alert.severity; // 'critical' | 'warning' | 'info'
}

interface Rule {
  id: number;
  name: string;
  condition: string;
  triggerCount: number;
  active: boolean;
}

interface NotificationChannel {
  id: string;
  label: string;
  enabled: boolean;
  field: string;
  placeholder: string;
}

interface EscalationTiming {
  level: string;
  delay: string;
}

// ─── Static Data (История / Правила / Настройки tabs — kept as mock) ─────────

const HISTORY_ROWS = [
  { date: '04.06.2026 03:14', object: 'Каршинский канал', type: 'КРИТИЧНО', desc: 'Прорыв давления', status: 'Активен', duration: '—' },
  { date: '04.06.2026 03:09', object: 'Сырдарьинская обл.', type: 'КРИТИЧНО', desc: 'Критический уровень воды', status: 'Активен', duration: '—' },
  { date: '04.06.2026 02:57', object: 'НС-14, Ташкент', type: 'КРИТИЧНО', desc: 'Утечка', status: 'Активен', duration: '—' },
  { date: '04.06.2026 02:40', object: 'Чирчик-Ахангаран', type: 'ПРЕДУПР.', desc: 'Высокая мутность', status: 'Активен', duration: '—' },
  { date: '04.06.2026 02:27', object: 'Ферганский канал', type: 'ПРЕДУПР.', desc: 'Превышение расхода', status: 'Активен', duration: '—' },
  { date: '04.06.2026 02:12', object: 'Андижанское вдхр.', type: 'ПРЕДУПР.', desc: 'pH вне нормы', status: 'Активен', duration: '—' },
  { date: '04.06.2026 01:12', object: 'НС-7, Самарканд', type: 'ПРЕДУПР.', desc: 'Перегрев насоса', status: 'Активен', duration: '—' },
  { date: '04.06.2026 00:12', object: 'Бухарская обл.', type: 'ИНФО', desc: 'Плановое ТО', status: 'Активен', duration: '—' },
  { date: '03.06.2026 22:12', object: '12 устройств', type: 'ИНФО', desc: 'Обновление прошивки', status: 'Активен', duration: '—' },
  { date: '03.06.2026 19:12', object: 'Нукус', type: 'ИНФО', desc: 'Профилактика дамбы', status: 'Активен', duration: '—' },
  { date: '03.06.2026 14:22', object: 'Андижан', type: 'ИНФО', desc: 'pH нормализован', status: 'Устранён', duration: '2 ч 14 мин' },
  { date: '03.06.2026 09:15', object: 'НС-3, Наманган', type: 'КРИТИЧНО', desc: 'Насос перезапущен', status: 'Устранён', duration: '45 мин' },
  { date: '03.06.2026 07:30', object: 'Ферганский канал', type: 'ПРЕДУПР.', desc: 'Давление нормализовано', status: 'Устранён', duration: '1 ч 10 мин' },
  { date: '03.06.2026 05:00', object: 'Каршинский канал', type: 'ИНФО', desc: 'Плановое ТО завершено', status: 'Устранён', duration: '3 ч 00 мин' },
  { date: '02.06.2026 20:45', object: 'НС-11, Бухара', type: 'КРИТИЧНО', desc: 'Аварийный останов насоса', status: 'Устранён', duration: '55 мин' },
  { date: '02.06.2026 18:20', object: 'Сырдарья', type: 'ПРЕДУПР.', desc: 'Низкий уровень воды', status: 'Устранён', duration: '4 ч 30 мин' },
  { date: '02.06.2026 14:10', object: 'Андижанское вдхр.', type: 'ИНФО', desc: 'Плановая инспекция', status: 'Устранён', duration: '2 ч 00 мин' },
  { date: '02.06.2026 10:00', object: 'НС-2, Ташкент', type: 'ПРЕДУПР.', desc: 'Вибрация двигателя', status: 'Устранён', duration: '1 ч 20 мин' },
  { date: '02.06.2026 08:30', object: 'Чирчик', type: 'КРИТИЧНО', desc: 'Засорение фильтра', status: 'Устранён', duration: '35 мин' },
  { date: '01.06.2026 23:00', object: 'Нукус', type: 'ИНФО', desc: 'Обновление ПО датчиков', status: 'Устранён', duration: '15 мин' },
];

const INITIAL_RULES: Rule[] = [
  { id: 1, name: 'Критический уровень воды', condition: '< 2.5м', triggerCount: 8, active: true },
  { id: 2, name: 'Давление вне диапазона', condition: '> 8 бар или < 1 бар', triggerCount: 3, active: true },
  { id: 3, name: 'pH аномалия', condition: '< 6.5 или > 8.5', triggerCount: 12, active: true },
  { id: 4, name: 'Мутность превышена', condition: '> 50 NTU', triggerCount: 5, active: true },
  { id: 5, name: 'Расход критический', condition: '> 180 м³/ч', triggerCount: 2, active: true },
  { id: 6, name: 'Температура датчика', condition: '> 70°C', triggerCount: 1, active: false },
];

const ESCALATION_TIMINGS: EscalationTiming[] = [
  { level: 'Критично', delay: 'немедленно (0 мин)' },
  { level: 'Предупреждение', delay: '15 мин' },
  { level: 'Инфо', delay: '60 мин' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function severityBorderColor(s: Severity): string {
  switch (s) {
    case 'critical': return '#ef4444';
    case 'warning': return '#f59e0b';
    case 'info': return '#3b82f6';
    case 'resolved': return '#22c55e';
  }
}

function severityBgColor(s: Severity): string {
  switch (s) {
    case 'critical': return 'rgba(239,68,68,0.06)';
    case 'warning': return 'rgba(245,158,11,0.06)';
    case 'info': return 'rgba(59,130,246,0.06)';
    case 'resolved': return 'rgba(34,197,94,0.06)';
  }
}

function SeverityBadge({ severity }: { severity: Severity }) {
  if (severity === 'critical') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
        style={{ background: 'rgba(239,68,68,0.18)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}>
        <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
        КРИТИЧНО
      </span>
    );
  }
  if (severity === 'warning') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
        style={{ background: 'rgba(245,158,11,0.18)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)' }}>
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
        ПРЕДУПРЕЖДЕНИЕ
      </span>
    );
  }
  if (severity === 'info') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
        style={{ background: 'rgba(59,130,246,0.18)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.3)' }}>
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />
        ИНФО
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
      style={{ background: 'rgba(34,197,94,0.18)', color: '#86efac', border: '1px solid rgba(34,197,94,0.3)' }}>
      <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
      УСТРАНЕНО
    </span>
  );
}

function SeverityIcon({ severity }: { severity: Severity }) {
  if (severity === 'critical' || severity === 'warning') {
    return <AlertTriangle className="w-5 h-5 shrink-0" style={{ color: severity === 'critical' ? '#f87171' : '#fbbf24' }} />;
  }
  if (severity === 'info') {
    return <Info className="w-5 h-5 shrink-0 text-blue-400" />;
  }
  return <CheckCircle className="w-5 h-5 shrink-0 text-green-400" />;
}

// ─── Toggle Switch ────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200"
      style={{ background: checked ? '#00e6c8' : 'rgba(255,255,255,0.12)' }}
      aria-pressed={checked}
    >
      <span
        className="inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200"
        style={{ transform: checked ? 'translateX(18px)' : 'translateX(2px)' }}
      />
    </button>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] px-5 py-2.5 rounded-xl text-sm font-semibold text-white pointer-events-none"
      style={{
        background: 'rgba(0,230,200,0.15)',
        border: '1px solid rgba(0,230,200,0.4)',
        backdropFilter: 'blur(16px)',
        transition: 'opacity 0.25s, transform 0.25s',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(12px)',
      }}
    >
      {message}
    </div>
  );
}

// ─── Real Alert Card (from Supabase) ─────────────────────────────────────────

function RealAlertCard({ alert }: { alert: WaterAlert }) {
  const [assigned, setAssigned] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const severity = dbSeverity(alert);

  // Format "value unit > threshold unit (норма)" when data is available
  const valueStr =
    alert.value !== null && alert.threshold !== null && alert.unit !== null
      ? `${alert.value} ${alert.unit} > ${alert.threshold} ${alert.unit} (норма)`
      : alert.value !== null && alert.unit !== null
      ? `${alert.value} ${alert.unit}`
      : null;

  // Relative time from created_at
  const timeAgo = (() => {
    const diff = Date.now() - new Date(alert.created_at).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return 'только что';
    if (mins < 60) return `${mins} мин назад`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} ч назад`;
    return `${Math.floor(hrs / 24)} д назад`;
  })();

  return (
    <div
      className="relative rounded-xl overflow-hidden"
      style={{
        background: severityBgColor(severity),
        border: `1px solid ${severityBorderColor(severity)}22`,
        borderLeft: `3px solid ${severityBorderColor(severity)}`,
      }}
    >
      <div className="p-4">
        {/* Top row */}
        <div className="flex items-start gap-3">
          <SeverityIcon severity={severity} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <SeverityBadge severity={severity} />
            </div>
            <p className="text-sm font-bold text-white leading-tight">{alert.title}</p>
            {alert.description && (
              <p className="text-xs text-white/50 mt-0.5 leading-relaxed">{alert.description}</p>
            )}
            {valueStr && (
              <p className="text-xs text-white/40 mt-0.5 font-mono">{valueStr}</p>
            )}
          </div>
        </div>

        {/* Location + time */}
        <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
          {alert.object_name && (
            <span className="inline-flex items-center gap-1 text-[11px] text-white/45">
              <MapPin className="w-3 h-3 shrink-0" />
              {alert.object_name}
            </span>
          )}
          <span className="text-[11px] text-white/35">{timeAgo}</span>
        </div>

        {/* Action buttons */}
        {severity !== 'resolved' && (
          <div className="mt-3 flex items-center gap-2">
            {confirmed ? (
              <span className="text-xs font-semibold text-emerald-400">✓ Принято</span>
            ) : (
              <>
                <button
                  onClick={() => setAssigned(true)}
                  className="text-[11px] font-semibold px-3 py-1 rounded-lg transition-colors"
                  style={{
                    background: assigned ? 'rgba(0,230,200,0.15)' : 'rgba(255,255,255,0.07)',
                    color: assigned ? '#00e6c8' : 'rgba(255,255,255,0.6)',
                    border: `1px solid ${assigned ? 'rgba(0,230,200,0.3)' : 'rgba(255,255,255,0.12)'}`,
                  }}
                >
                  {assigned ? '✓ Назначен' : 'Назначить'}
                </button>
                <button
                  onClick={() => setConfirmed(true)}
                  className="text-[11px] font-semibold px-3 py-1 rounded-lg transition-colors"
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    color: 'rgba(255,255,255,0.6)',
                    border: '1px solid rgba(255,255,255,0.12)',
                  }}
                >
                  Подтвердить
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tab: Активные ────────────────────────────────────────────────────────────

function ActiveTab({
  alerts,
  loading,
  error,
  lastUpdated,
  refresh,
}: {
  alerts: WaterAlert[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => void;
}) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#00e6c8' }} />
        <p className="text-sm text-white/40">Загрузка алертов…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <p className="text-sm text-red-400">{error}</p>
        <button
          onClick={refresh}
          className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl"
          style={{ background: 'rgba(0,230,200,0.1)', color: '#00e6c8', border: '1px solid rgba(0,230,200,0.3)' }}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Повторить
        </button>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <CheckCircle className="w-10 h-10 text-emerald-400" />
        <p className="text-sm text-white/40">Нет активных алертов</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <RealAlertCard key={alert.id} alert={alert} />
      ))}

      {/* Footer with last updated timestamp */}
      <div className="pt-2 flex items-center justify-between flex-wrap gap-2">
        {lastUpdated && (
          <span className="text-[11px] text-white/25 flex items-center gap-1.5">
            <RefreshCw className="w-3 h-3" />
            Обновлено:{' '}
            {lastUpdated.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        )}
        <button
          onClick={refresh}
          className="text-[11px] font-semibold px-3 py-1 rounded-lg transition-colors"
          style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          Обновить
        </button>
      </div>
    </div>
  );
}

// ─── Tab: История ─────────────────────────────────────────────────────────────

function HistoryTab() {
  const [page, setPage] = useState(0);
  const [exportDone, setExportDone] = useState(false);
  const PER_PAGE = 10;
  const totalPages = Math.ceil(HISTORY_ROWS.length / PER_PAGE);
  const pageRows = HISTORY_ROWS.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  function handleExport() {
    setExportDone(true);
    setTimeout(() => setExportDone(false), 2500);
  }

  return (
    <div>
      {/* Export button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl transition-all"
          style={{
            background: exportDone ? 'rgba(0,230,200,0.15)' : 'rgba(255,255,255,0.07)',
            color: exportDone ? '#00e6c8' : 'rgba(255,255,255,0.6)',
            border: `1px solid ${exportDone ? 'rgba(0,230,200,0.3)' : 'rgba(255,255,255,0.12)'}`,
          }}
        >
          <Download className="w-3.5 h-3.5" />
          {exportDone ? '✓ Скачан' : 'Экспорт CSV'}
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                {['Дата/Время', 'Объект', 'Тип', 'Описание', 'Статус', 'Длительность'].map((h) => (
                  <th key={h} className="px-3 py-3 text-left font-semibold text-white/40 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row, i) => (
                <tr
                  key={i}
                  style={{
                    borderBottom: i < pageRows.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
                  }}
                >
                  <td className="px-3 py-2.5 text-white/50 whitespace-nowrap">{row.date}</td>
                  <td className="px-3 py-2.5 text-white/70">{row.object}</td>
                  <td className="px-3 py-2.5">
                    <span
                      className="font-bold"
                      style={{
                        color: row.type === 'КРИТИЧНО' ? '#f87171' : row.type === 'ПРЕДУПР.' ? '#fbbf24' : '#93c5fd',
                      }}
                    >
                      {row.type}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-white/60">{row.desc}</td>
                  <td className="px-3 py-2.5">
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        background: row.status === 'Устранён' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                        color: row.status === 'Устранён' ? '#86efac' : '#fca5a5',
                      }}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-white/40 whitespace-nowrap">{row.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <span className="text-xs text-white/30">
          {page * PER_PAGE + 1}–{Math.min((page + 1) * PER_PAGE, HISTORY_ROWS.length)} из {HISTORY_ROWS.length}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-30"
            style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            ← Пред.
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-30"
            style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            След. →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Правила ─────────────────────────────────────────────────────────────

function RulesTab() {
  const [rules, setRules] = useState<Rule[]>(INITIAL_RULES);

  function toggleRule(id: number) {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r)));
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {rules.map((rule) => (
        <div
          key={rule.id}
          className="rounded-xl p-4"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${rule.active ? 'rgba(0,230,200,0.15)' : 'rgba(255,255,255,0.07)'}`,
          }}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <p className="text-sm font-bold text-white leading-tight">{rule.name}</p>
            <Toggle checked={rule.active} onChange={() => toggleRule(rule.id)} />
          </div>

          <p className="text-xs text-white/45 mb-3">
            Условие: <span className="text-white/65 font-mono">{rule.condition}</span>
          </p>

          <div className="flex items-center justify-between">
            <span
              className="text-[10px] font-semibold px-2 py-1 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.45)' }}
            >
              {rule.triggerCount} раз в месяц
            </span>
            <button
              className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors"
              style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <Edit className="w-3 h-3" />
              Изменить
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Tab: Настройки ───────────────────────────────────────────────────────────

function SettingsTab() {
  const [channels, setChannels] = useState<NotificationChannel[]>([
    { id: 'telegram', label: 'Telegram', enabled: true, field: '@vodprom_alerts', placeholder: '@канал или ID' },
    { id: 'email', label: 'Email', enabled: true, field: 'alerts@vodprom.uz', placeholder: 'email@example.com' },
    { id: 'sms', label: 'SMS', enabled: false, field: '+998 71 200 00 01', placeholder: '+998 XX XXX XX XX' },
    { id: 'push', label: 'Push-уведомления', enabled: true, field: '', placeholder: 'Браузерные push' },
  ]);
  const [saved, setSaved] = useState(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied'
  );

  function toggleChannel(id: string) {
    setChannels((prev) => prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c)));
  }

  function updateField(id: string, value: string) {
    setChannels((prev) => prev.map((c) => (c.id === id ? { ...c, field: value } : c)));
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="space-y-6 max-w-lg">
      {/* Channels */}
      <div>
        <h3 className="text-sm font-bold text-white/70 mb-3 uppercase tracking-wider">Каналы уведомлений</h3>
        <div className="space-y-3">
          {channels.map((ch) => (
            <div
              key={ch.id}
              className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${ch.enabled ? 'rgba(0,230,200,0.12)' : 'rgba(255,255,255,0.07)'}`,
              }}
            >
              <Toggle checked={ch.enabled} onChange={() => toggleChannel(ch.id)} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white/80">{ch.label}</p>
                {ch.id !== 'push' && (
                  <input
                    type="text"
                    value={ch.field}
                    onChange={(e) => updateField(ch.id, e.target.value)}
                    placeholder={ch.placeholder}
                    disabled={!ch.enabled}
                    className="mt-1 w-full text-xs bg-transparent outline-none transition-opacity"
                    style={{
                      color: ch.enabled ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.2)',
                      borderBottom: '1px solid rgba(255,255,255,0.1)',
                      paddingBottom: '2px',
                    }}
                  />
                )}
                {ch.id === 'push' && (
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-[11px] text-white/30">{ch.placeholder}</p>
                    {pushPermission !== 'granted' && (
                      <button
                        onClick={async () => {
                          if (!('Notification' in window)) return;
                          const result = await Notification.requestPermission();
                          setPushPermission(result);
                        }}
                        className="text-xs px-3 py-1 rounded-lg shrink-0"
                        style={{
                          background: 'rgba(0,230,200,0.1)',
                          color: '#00e6c8',
                          border: '1px solid rgba(0,230,200,0.25)',
                        }}
                      >
                        {pushPermission === 'denied' ? 'Заблокировано' : 'Разрешить'}
                      </button>
                    )}
                    {pushPermission === 'granted' && (
                      <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Escalation */}
      <div>
        <h3 className="text-sm font-bold text-white/70 mb-3 uppercase tracking-wider">Эскалация (задержка)</h3>
        <div className="space-y-2">
          {ESCALATION_TIMINGS.map((et) => (
            <div
              key={et.level}
              className="flex items-center justify-between px-4 py-2.5 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <span className="text-sm text-white/60">{et.level}</span>
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                style={{ background: 'rgba(0,230,200,0.1)', color: '#00e6c8' }}
              >
                {et.delay}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        className="w-full py-3 rounded-xl text-sm font-bold transition-all"
        style={{
          background: saved ? 'rgba(0,230,200,0.2)' : 'rgba(0,230,200,0.12)',
          color: '#00e6c8',
          border: '1px solid rgba(0,230,200,0.35)',
        }}
      >
        {saved ? '✓ Сохранено' : 'Сохранить настройки'}
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type TabId = 'active' | 'history' | 'rules' | 'settings';

const TABS: { id: TabId; label: string }[] = [
  { id: 'active', label: 'Активные' },
  { id: 'history', label: 'История' },
  { id: 'rules', label: 'Правила' },
  { id: 'settings', label: 'Настройки' },
];

export default function AlertsPage() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<TabId>('active');

  const { alerts, loading, error, lastUpdated, criticalCount, warningCount, activeCount, refresh } =
    useWaterAlerts();

  const infoCount = alerts.filter((a) => a.severity === 'info' && !a.resolved).length;

  return (
    <div className="min-h-screen pt-14">
      <style>{`
        @keyframes bellPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
      `}</style>

      {/* ── Sticky header ── */}
      <div
        className="sticky top-14 z-40 px-4 pt-4 pb-0"
        style={{
          background: 'rgba(0,8,24,0.92)',
          borderBottom: '1px solid rgba(0,200,230,0.08)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Top row */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setLocation('/map')}
            className="w-9 h-9 flex items-center justify-center rounded-xl transition-colors shrink-0"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}
          >
            <ArrowLeft className="w-4.5 h-4.5 text-white/60" />
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 shrink-0" style={{ color: '#00e6c8' }} />
              <h1 className="text-base font-bold text-white leading-tight">Превентивные алерты</h1>
            </div>
            <p className="text-xs text-white/35 mt-0.5">Система раннего предупреждения</p>
          </div>
        </div>

        {/* Stat pills */}
        <div className="flex items-center gap-2 flex-wrap pb-4">
          <StatPill label="Критических" value={criticalCount} color="#f87171" bg="rgba(239,68,68,0.12)" />
          <StatPill label="Предупреждений" value={warningCount} color="#fbbf24" bg="rgba(245,158,11,0.12)" />
          <StatPill label="Инфо" value={infoCount} color="#93c5fd" bg="rgba(59,130,246,0.12)" />
          <StatPill label="Активных" value={activeCount} color="rgba(255,255,255,0.45)" bg="rgba(255,255,255,0.06)" />
        </div>

        {/* Tabs */}
        <div className="flex gap-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-4 py-2.5 text-sm font-semibold relative transition-colors"
              style={{
                color: activeTab === tab.id ? '#00e6c8' : 'rgba(255,255,255,0.35)',
                borderBottom: activeTab === tab.id ? '2px solid #00e6c8' : '2px solid transparent',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="px-4 py-5 max-w-2xl mx-auto">
        {activeTab === 'active' && (
          <ActiveTab
            alerts={alerts}
            loading={loading}
            error={error}
            lastUpdated={lastUpdated}
            refresh={refresh}
          />
        )}
        {activeTab === 'history' && <HistoryTab />}
        {activeTab === 'rules' && <RulesTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  );
}

// ─── StatPill ─────────────────────────────────────────────────────────────────

function StatPill({
  label,
  value,
  color,
  bg,
}: {
  label: string;
  value: number;
  color: string;
  bg: string;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full"
      style={{ background: bg, color }}
    >
      <span className="text-sm font-bold">{value}</span>
      {label}
    </span>
  );
}
