// src/components/dashboard/DashboardWidgets.tsx
// Self-contained widget components for VODPROM Dashboard OS
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// ─────────────────────────────────────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────────────────────────────────────

function SkeletonRows({ count }: { count: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-3 rounded-full bg-white/5 animate-pulse"
          style={{ width: `${70 + (i % 3) * 10}%` }}
        />
      ))}
    </div>
  );
}

type WidgetProps = { onNavigate: (path: string) => void };

const WIDGET_STYLE: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '1rem',
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. AlertsWidget
// ─────────────────────────────────────────────────────────────────────────────

interface AlertRow {
  id: string;
  title: string;
  severity: string;
  resolved: boolean;
  created_at: string;
}

export function AlertsWidget({ onNavigate }: WidgetProps) {
  const [data, setData] = useState<AlertRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('water_alerts')
      .select('id,title,severity,resolved,created_at')
      .eq('resolved', false)
      .order('created_at', { ascending: false })
      .limit(5)
      .then(({ data: rows }) => {
        setData(rows ?? []);
        setLoading(false);
      });
  }, []);

  const critical = data.filter(a => a.severity === 'critical').length;
  const warning = data.filter(a => a.severity === 'warning').length;

  return (
    <div
      className="shrink-0 min-w-[260px] max-w-[300px] rounded-2xl p-4 cursor-pointer transition-all hover:border-white/15"
      style={WIDGET_STYLE}
      onClick={() => onNavigate('/alerts')}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">🚨</span>
        <span className="text-sm font-semibold text-white/80">Алерты</span>
        {data.length > 0 && (
          <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
            {data.length} активных
          </span>
        )}
      </div>
      {loading ? (
        <SkeletonRows count={3} />
      ) : (
        <>
          <div className="flex gap-3 mb-3">
            <div className="flex-1 text-center p-2 rounded-xl bg-red-500/10 border border-red-500/15">
              <div className="text-xl font-bold text-red-400">{critical}</div>
              <div className="text-[10px] text-white/40">Критических</div>
            </div>
            <div className="flex-1 text-center p-2 rounded-xl bg-amber-500/10 border border-amber-500/15">
              <div className="text-xl font-bold text-amber-400">{warning}</div>
              <div className="text-[10px] text-white/40">Предупреждений</div>
            </div>
          </div>
          {data.length === 0 ? (
            <p className="text-white/30 text-xs">Нет активных алертов</p>
          ) : (
            <div className="space-y-1.5">
              {data.slice(0, 3).map(a => (
                <div key={a.id} className="flex items-center gap-2 text-xs">
                  <div
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      a.severity === 'critical' ? 'bg-red-400' : 'bg-amber-400'
                    }`}
                  />
                  <span className="text-white/60 truncate">{a.title}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. NewsWidget
// ─────────────────────────────────────────────────────────────────────────────

interface NewsRow {
  id: string;
  title_ru: string;
  summary_ru: string;
  source_name: string;
  published_at: string;
  category: string;
}

export function NewsWidget({ onNavigate }: WidgetProps) {
  const [data, setData] = useState<NewsRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('water_news')
      .select('id,title_ru,summary_ru,source_name,published_at,category')
      .order('published_at', { ascending: false })
      .limit(4)
      .then(({ data: rows }) => {
        setData(rows ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <div
      className="shrink-0 min-w-[260px] max-w-[300px] rounded-2xl p-4 cursor-pointer transition-all hover:border-white/15"
      style={WIDGET_STYLE}
      onClick={() => onNavigate('/community')}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">📰</span>
        <span className="text-sm font-semibold text-white/80">Новости</span>
        <span className="ml-auto text-[10px] text-white/30">{data.length} статей</span>
      </div>
      {loading ? (
        <SkeletonRows count={4} />
      ) : data.length === 0 ? (
        <p className="text-white/30 text-xs">Нет новостей</p>
      ) : (
        <div className="space-y-2">
          {data.map(n => (
            <div key={n.id} className="flex items-start gap-2">
              <div className="w-1 h-1 rounded-full bg-cyan-400/60 mt-1.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-white/70 leading-snug line-clamp-2">{n.title_ru}</p>
                {n.source_name && (
                  <p className="text-[10px] text-white/30 mt-0.5">{n.source_name}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. ProjectsWidget
// ─────────────────────────────────────────────────────────────────────────────

interface ProjectRow {
  id: string;
  name: string;
  status: string;
  total_funding: number | null;
  apy: number | null;
  irr: number | null;
  region: string | null;
}

export function ProjectsWidget({ onNavigate }: WidgetProps) {
  const [data, setData] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('projects')
      .select('id,name,status,total_funding,apy,irr,region')
      .limit(200)
      .then(({ data: rows }) => {
        setData(rows ?? []);
        setLoading(false);
      });
  }, []);

  const total = data.length;
  const active = data.filter(p => p.status === 'active').length;
  const sumFunding = data.reduce((acc, p) => acc + (p.total_funding ?? 0), 0);
  // Здесь считался «средний APY» по всем проектам и показывался как показатель
  // платформы. Платформа не обещает доходности и не может публиковать среднюю
  // ставку: числа apy приходят из описаний самих проектов, не проверялись и
  // ничем не утверждены. Вместо ставки показываем, у скольких проектов
  // доходность вообще заявлена, — это факт о данных, а не обещание.
  const withDeclaredApy = data.filter(p => (p.apy ?? 0) > 0).length;

  const fmt = (n: number) =>
    n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `$${(n / 1000).toFixed(0)}K` : `$${n}`;

  return (
    <div
      className="shrink-0 min-w-[260px] max-w-[300px] rounded-2xl p-4 cursor-pointer transition-all hover:border-white/15"
      style={WIDGET_STYLE}
      onClick={() => onNavigate('/hub')}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">📁</span>
        <span className="text-sm font-semibold text-white/80">Проекты</span>
        {!loading && (
          <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
            {active} активных
          </span>
        )}
      </div>
      {loading ? (
        <SkeletonRows count={4} />
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded-xl bg-white/4 border border-white/6">
            <div className="text-lg font-bold text-white/90">{total}</div>
            <div className="text-[10px] text-white/40">Всего проектов</div>
          </div>
          <div className="p-2 rounded-xl bg-green-500/8 border border-green-500/12">
            <div className="text-lg font-bold text-green-400">{active}</div>
            <div className="text-[10px] text-white/40">Активных</div>
          </div>
          <div className="p-2 rounded-xl bg-cyan-500/8 border border-cyan-500/12">
            <div className="text-lg font-bold text-cyan-400">{fmt(sumFunding)}</div>
            <div className="text-[10px] text-white/40">Финансирование</div>
          </div>
          <div className="p-2 rounded-xl bg-amber-500/8 border border-amber-500/12">
            <div className="text-lg font-bold text-amber-400">{withDeclaredApy}</div>
            <div className="text-[10px] text-white/40">С заявленной доходностью</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. RDWidget
// ─────────────────────────────────────────────────────────────────────────────

interface RDRow {
  id: string;
  name: string;
  stage: string;
  status: string;
  grant_total_usd: number | null;
  laboratory: string | null;
}

export function RDWidget({ onNavigate }: WidgetProps) {
  const [data, setData] = useState<RDRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('rd_programs')
      .select('id,name,stage,status,grant_total_usd,laboratory')
      .eq('status', 'active')
      .limit(50)
      .then(({ data: rows }) => {
        setData(rows ?? []);
        setLoading(false);
      });
  }, []);

  const totalGrant = data.reduce((acc, r) => acc + (r.grant_total_usd ?? 0), 0);

  return (
    <div
      className="shrink-0 min-w-[260px] max-w-[300px] rounded-2xl p-4 cursor-pointer transition-all hover:border-white/15"
      style={WIDGET_STYLE}
      onClick={() => onNavigate('/rd')}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">🔬</span>
        <span className="text-sm font-semibold text-white/80">НИОКР</span>
        {!loading && (
          <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
            {data.length} программ
          </span>
        )}
      </div>
      {loading ? (
        <SkeletonRows count={3} />
      ) : data.length === 0 ? (
        <p className="text-white/30 text-xs">Нет активных программ</p>
      ) : (
        <>
          <div className="p-2.5 rounded-xl bg-amber-500/8 border border-amber-500/12 mb-3">
            <div className="text-base font-bold text-amber-400">
              ${(totalGrant / 1_000_000).toFixed(1)}M
            </div>
            <div className="text-[10px] text-white/40">Суммарные гранты</div>
          </div>
          <div className="space-y-1.5">
            {data.slice(0, 3).map(r => (
              <div key={r.id} className="flex items-center gap-2 text-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                <span className="text-white/60 truncate">{r.name}</span>
                <span className="ml-auto text-white/30 shrink-0">{r.stage}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. JobsWidget
// ─────────────────────────────────────────────────────────────────────────────

interface JobRow {
  id: string;
  title: string;
  status: string;
  location: string | null;
  department: string | null;
  salary_min: number | null;
}

export function JobsWidget({ onNavigate }: WidgetProps) {
  const [data, setData] = useState<JobRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('jobs')
      .select('id,title,status,location,department,salary_min')
      .eq('status', 'open')
      .order('id', { ascending: false })
      .limit(10)
      .then(({ data: rows }) => {
        setData(rows ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <div
      className="shrink-0 min-w-[260px] max-w-[300px] rounded-2xl p-4 cursor-pointer transition-all hover:border-white/15"
      style={WIDGET_STYLE}
      onClick={() => onNavigate('/community')}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">💼</span>
        <span className="text-sm font-semibold text-white/80">Вакансии</span>
        {!loading && (
          <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400 border border-violet-500/30">
            {data.length} открытых
          </span>
        )}
      </div>
      {loading ? (
        <SkeletonRows count={4} />
      ) : data.length === 0 ? (
        <p className="text-white/30 text-xs">Нет открытых вакансий</p>
      ) : (
        <div className="space-y-2">
          {data.slice(0, 4).map(j => (
            <div key={j.id} className="p-2 rounded-xl bg-white/3 border border-white/5">
              <p className="text-xs text-white/70 font-medium truncate">{j.title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                {j.department && (
                  <span className="text-[10px] text-white/35">{j.department}</span>
                )}
                {j.location && (
                  <span className="text-[10px] text-white/25">· {j.location}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. EventsWidget
// ─────────────────────────────────────────────────────────────────────────────

interface EventRow {
  id: string;
  event_type: string;
  title: string;
  severity: string | null;
  event_date: string;
  description: string | null;
}

export function EventsWidget({ onNavigate }: WidgetProps) {
  const [data, setData] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('object_events')
      .select('id,event_type,title,severity,event_date,description')
      .order('event_date', { ascending: false })
      .limit(6)
      .then(({ data: rows }) => {
        setData(rows ?? []);
        setLoading(false);
      });
  }, []);

  const severityColor = (s: string | null) => {
    if (s === 'critical') return 'text-red-400';
    if (s === 'warning') return 'text-amber-400';
    return 'text-cyan-400';
  };

  return (
    <div
      className="shrink-0 min-w-[260px] max-w-[300px] rounded-2xl p-4 cursor-pointer transition-all hover:border-white/15"
      style={WIDGET_STYLE}
      onClick={() => onNavigate('/hub')}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">📅</span>
        <span className="text-sm font-semibold text-white/80">События</span>
        {!loading && (
          <span className="ml-auto text-[10px] text-white/30">{data.length} событий</span>
        )}
      </div>
      {loading ? (
        <SkeletonRows count={4} />
      ) : data.length === 0 ? (
        <p className="text-white/30 text-xs">Нет событий</p>
      ) : (
        <div className="space-y-1.5">
          {data.slice(0, 4).map(ev => (
            <div key={ev.id} className="flex items-start gap-2 text-xs">
              <div className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${severityColor(ev.severity)} bg-current`} />
              <div className="min-w-0">
                <p className="text-white/65 truncate">{ev.title}</p>
                <p className="text-white/30 text-[10px]">{ev.event_type}</p>
              </div>
              <span className="ml-auto text-[10px] text-white/25 shrink-0">
                {new Date(ev.event_date).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. MonitoringWidget
// ─────────────────────────────────────────────────────────────────────────────

interface MonitoringRow {
  parameter: string;
  value: number | null;
  unit: string | null;
  recorded_at: string;
  object_id: string | null;
}

export function MonitoringWidget({ onNavigate }: WidgetProps) {
  const [data, setData] = useState<MonitoringRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('object_monitoring')
      .select('parameter,value,unit,recorded_at,object_id')
      .order('recorded_at', { ascending: false })
      .limit(20)
      .then(({ data: rows }) => {
        setData(rows ?? []);
        setLoading(false);
      });
  }, []);

  // Group by parameter, show latest per parameter
  const latestByParam = Object.values(
    data.reduce<Record<string, MonitoringRow>>((acc, row) => {
      if (!acc[row.parameter]) acc[row.parameter] = row;
      return acc;
    }, {})
  );

  return (
    <div
      className="shrink-0 min-w-[260px] max-w-[300px] rounded-2xl p-4 cursor-pointer transition-all hover:border-white/15"
      style={WIDGET_STYLE}
      onClick={() => onNavigate('/iot')}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">📡</span>
        <span className="text-sm font-semibold text-white/80">Мониторинг</span>
        {!loading && (
          <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            {latestByParam.length} параметров
          </span>
        )}
      </div>
      {loading ? (
        <SkeletonRows count={4} />
      ) : latestByParam.length === 0 ? (
        <p className="text-white/30 text-xs">Нет данных мониторинга</p>
      ) : (
        <div className="space-y-1.5">
          {latestByParam.slice(0, 5).map(m => (
            <div key={m.parameter} className="flex items-center gap-2 text-xs">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 animate-pulse" />
              <span className="text-white/55 truncate">{m.parameter}</span>
              <span className="ml-auto text-cyan-300 font-mono shrink-0">
                {m.value !== null ? m.value.toFixed(2) : '—'}
                {m.unit ? ` ${m.unit}` : ''}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. StatsWidget (static)
// ─────────────────────────────────────────────────────────────────────────────

export function StatsWidget({ onNavigate }: WidgetProps) {
  const stats = [
    { value: '473', label: 'Объектов',   icon: '🏗️', color: '#00e6c8' },
    { value: '139', label: 'Проектов',   icon: '📁', color: '#4ade80' },
    { value: '263', label: 'Партнёров',  icon: '🤝', color: '#f59e0b' },
    { value: '36',  label: 'Экспертов',  icon: '👨‍🔬', color: '#f472b6' },
  ];

  return (
    <div
      className="shrink-0 min-w-[260px] max-w-[300px] rounded-2xl p-4 cursor-pointer transition-all hover:border-white/15"
      style={WIDGET_STYLE}
      onClick={() => onNavigate('/analytics')}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">📊</span>
        <span className="text-sm font-semibold text-white/80">Статистика</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {stats.map(s => (
          <div
            key={s.label}
            className="p-2.5 rounded-xl"
            style={{ background: `${s.color}0d`, border: `1px solid ${s.color}1a` }}
          >
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-sm">{s.icon}</span>
              <span className="text-lg font-bold" style={{ color: s.color }}>{s.value}</span>
            </div>
            <div className="text-[10px] text-white/40">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. InvestmentWidget
// ─────────────────────────────────────────────────────────────────────────────

interface InvestRow {
  id: string;
  name: string;
  apy: number | null;
  irr: number | null;
  total_funding: number | null;
  region: string | null;
}

export function InvestmentWidget({ onNavigate }: WidgetProps) {
  const [data, setData] = useState<InvestRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('projects')
      .select('id,name,apy,irr,total_funding,region')
      .gt('apy', 0)
      .order('apy', { ascending: false })
      .limit(5)
      .then(({ data: rows }) => {
        setData(rows ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <div
      className="shrink-0 min-w-[260px] max-w-[300px] rounded-2xl p-4 cursor-pointer transition-all hover:border-white/15"
      style={WIDGET_STYLE}
      onClick={() => onNavigate('/invest')}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">💰</span>
        <span className="text-sm font-semibold text-white/80">Инвестиции</span>
        {/*
          Стояло «топ APY»: подпись превращала список в рейтинг доходности, а
          жёлтая жирная ставка справа читалась как предложение платформы.
          Проценты приходят из описаний самих проектов, платформа их не
          проверяла и доходности не обещает — поэтому число названо заявленным
          и снято с акцента.
        */}
        {!loading && (
          <span className="ml-auto text-[10px] text-white/30">заявлено в проектах</span>
        )}
      </div>
      {loading ? (
        <SkeletonRows count={4} />
      ) : data.length === 0 ? (
        <p className="text-white/30 text-xs">Нет инвестиционных предложений</p>
      ) : (
        <>
          <div className="space-y-1.5">
            {data.map(p => (
              <div key={p.id} className="flex items-center gap-2 text-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-white/25 shrink-0" />
                <span className="text-white/60 truncate flex-1">{p.name}</span>
                <span className="text-white/45 shrink-0">заявл. {(p.apy ?? 0).toFixed(1)}%</span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[9px] leading-snug text-white/25">
            Числа взяты из описаний проектов, не проверены и не утверждены.
            Платформа не привлекает средства и не обещает доходности.
          </p>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. TasksWidget
// ─────────────────────────────────────────────────────────────────────────────

interface TaskRow {
  id: string;
  title: string;
  status: string;
  priority: string | null;
  deadline: string | null;
  progress_percent: number | null;
  assigned_to_name: string | null;
}

export function TasksWidget({ onNavigate }: WidgetProps) {
  const [data, setData] = useState<TaskRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('workspace_tasks')
      .select('id,title,status,priority,deadline,progress_percent,assigned_to_name')
      .neq('status', 'done')
      .order('deadline', { ascending: true })
      .limit(5)
      .then(({ data: rows }) => {
        setData(rows ?? []);
        setLoading(false);
      });
  }, []);

  const priorityColor = (p: string | null) => {
    if (p === 'high' || p === 'urgent') return 'text-red-400 bg-red-500/10';
    if (p === 'medium') return 'text-amber-400 bg-amber-500/10';
    return 'text-white/40 bg-white/5';
  };

  return (
    <div
      className="shrink-0 min-w-[260px] max-w-[300px] rounded-2xl p-4 cursor-pointer transition-all hover:border-white/15"
      style={WIDGET_STYLE}
      onClick={() => onNavigate('/workspace')}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">✅</span>
        <span className="text-sm font-semibold text-white/80">Задачи</span>
        {!loading && (
          <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400 border border-violet-500/30">
            {data.length} активных
          </span>
        )}
      </div>
      {loading ? (
        <SkeletonRows count={4} />
      ) : data.length === 0 ? (
        <p className="text-white/30 text-xs">Нет активных задач</p>
      ) : (
        <div className="space-y-2">
          {data.map(t => (
            <div key={t.id} className="space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <span className={`text-[9px] px-1.5 py-0.5 rounded-md shrink-0 ${priorityColor(t.priority)}`}>
                  {t.priority ?? 'нет'}
                </span>
                <span className="text-white/65 truncate">{t.title}</span>
              </div>
              {t.progress_percent !== null && (
                <div className="w-full h-1 rounded-full bg-white/5">
                  <div
                    className="h-1 rounded-full bg-violet-400"
                    style={{ width: `${t.progress_percent}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. PartnershipsWidget
// ─────────────────────────────────────────────────────────────────────────────

interface PartnerRow {
  id: string;
  organization_name: string;
  partnership_type: string | null;
  status: string | null;
  country: string | null;
}

export function PartnershipsWidget({ onNavigate }: WidgetProps) {
  const [data, setData] = useState<PartnerRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('partnerships')
      .select('id,organization_name,partnership_type,status,country')
      .limit(200)
      .then(({ data: rows }) => {
        setData(rows ?? []);
        setLoading(false);
      });
  }, []);

  const total = data.length;
  const active = data.filter(p => p.status === 'active').length;

  // Top 3 countries by count
  const countryCounts = data.reduce<Record<string, number>>((acc, p) => {
    if (p.country) acc[p.country] = (acc[p.country] ?? 0) + 1;
    return acc;
  }, {});
  const topCountries = Object.entries(countryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <div
      className="shrink-0 min-w-[260px] max-w-[300px] rounded-2xl p-4 cursor-pointer transition-all hover:border-white/15"
      style={WIDGET_STYLE}
      onClick={() => onNavigate('/contacts')}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">🤝</span>
        <span className="text-sm font-semibold text-white/80">Партнёры</span>
        {!loading && (
          <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/30">
            {active} активных
          </span>
        )}
      </div>
      {loading ? (
        <SkeletonRows count={3} />
      ) : (
        <>
          <div className="flex gap-3 mb-3">
            <div className="flex-1 text-center p-2 rounded-xl bg-white/4 border border-white/6">
              <div className="text-xl font-bold text-white/90">{total}</div>
              <div className="text-[10px] text-white/40">Всего</div>
            </div>
            <div className="flex-1 text-center p-2 rounded-xl bg-pink-500/8 border border-pink-500/12">
              <div className="text-xl font-bold text-pink-400">{active}</div>
              <div className="text-[10px] text-white/40">Активных</div>
            </div>
          </div>
          {topCountries.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] text-white/30 mb-1.5">Топ страны:</p>
              {topCountries.map(([country, count]) => (
                <div key={country} className="flex items-center gap-2 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-pink-400 shrink-0" />
                  <span className="text-white/55 truncate">{country}</span>
                  <span className="ml-auto text-white/30 shrink-0">{count}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Registry
// ─────────────────────────────────────────────────────────────────────────────

export const WIDGET_REGISTRY: Record<
  string,
  {
    component: React.ComponentType<WidgetProps>;
    name: string;
    icon: string;
    defaultEnabled: boolean;
  }
> = {
  alerts:       { component: AlertsWidget,       name: 'Алерты',     icon: '🚨', defaultEnabled: true  },
  news:         { component: NewsWidget,          name: 'Новости',    icon: '📰', defaultEnabled: true  },
  projects:     { component: ProjectsWidget,      name: 'Проекты',    icon: '📁', defaultEnabled: true  },
  rd:           { component: RDWidget,            name: 'НИОКР',      icon: '🔬', defaultEnabled: true  },
  jobs:         { component: JobsWidget,          name: 'Вакансии',   icon: '💼', defaultEnabled: false },
  events:       { component: EventsWidget,        name: 'События',    icon: '📅', defaultEnabled: false },
  monitoring:   { component: MonitoringWidget,    name: 'Мониторинг', icon: '📡', defaultEnabled: true  },
  stats:        { component: StatsWidget,         name: 'Статистика', icon: '📊', defaultEnabled: true  },
  investment:   { component: InvestmentWidget,    name: 'Инвестиции', icon: '💰', defaultEnabled: false },
  tasks:        { component: TasksWidget,         name: 'Задачи',     icon: '✅', defaultEnabled: false },
  partnerships: { component: PartnershipsWidget,  name: 'Партнёры',   icon: '🤝', defaultEnabled: false },
};
