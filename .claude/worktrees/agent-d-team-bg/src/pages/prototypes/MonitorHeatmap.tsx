// ═══════════════════════════════════════════════════════════════
//  PROTOTYPE 4 — Regional Monitoring · Style: Heatmap + Real-Time
//  Color-coded water-stress matrix (cool→hot), live pulsing alerts,
//  streaming status feed. Entity class: Alerts / regional monitoring.
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, AlertTriangle, Activity, MapPin, Bell } from 'lucide-react';

const REGIONS = ['Ташкент', 'Фергана', 'Кашкадарья', 'Хорезм', 'Каракалп.', 'Бухара', 'Самарканд', 'Наманган'];
const METRICS = ['Дефицит', 'Качество', 'Инфрастр.', 'Паводок', 'Засоление'];

// stress values 0..1 (0 = ok/cool, 1 = critical/hot)
const BASE: number[][] = [
  [0.2, 0.3, 0.15, 0.4, 0.25],
  [0.5, 0.35, 0.45, 0.2, 0.3],
  [0.85, 0.6, 0.7, 0.15, 0.55],
  [0.4, 0.5, 0.3, 0.6, 0.75],
  [0.9, 0.8, 0.65, 0.3, 0.95],
  [0.3, 0.25, 0.4, 0.2, 0.35],
  [0.45, 0.4, 0.35, 0.25, 0.3],
  [0.55, 0.45, 0.5, 0.3, 0.4],
];

function heatColor(v: number): string {
  // cool blue -> green -> amber -> red
  if (v < 0.3) return `rgba(56,189,248,${0.3 + v})`;
  if (v < 0.55) return `rgba(34,197,94,${0.3 + v * 0.5})`;
  if (v < 0.75) return `rgba(245,158,11,${0.4 + v * 0.4})`;
  return `rgba(239,68,68,${0.5 + v * 0.4})`;
}

const FEED_TEMPLATES = [
  { r: 'Каракалпакстан', m: 'Засоление превысило порог 12 г/л', sev: 'critical' },
  { r: 'Кашкадарья', m: 'Дефицит воды в канале Карши — 34% нормы', sev: 'critical' },
  { r: 'Хорезм', m: 'Риск паводка на Туямуюнском г/у', sev: 'warning' },
  { r: 'Фергана', m: 'IoT-узел FLOW-214 восстановлен', sev: 'ok' },
  { r: 'Бухара', m: 'Качество воды в норме', sev: 'ok' },
  { r: 'Самарканд', m: 'Плановое ТО насосной завершено', sev: 'ok' },
];
const sevColor = (s: string) => s === 'critical' ? '#ef4444' : s === 'warning' ? '#f59e0b' : '#22c55e';

export default function MonitorHeatmap() {
  const [, setLocation] = useLocation();
  const [grid, setGrid] = useState(BASE);
  const [sel, setSel] = useState<{ r: number; c: number } | null>(null);
  const [feed, setFeed] = useState(FEED_TEMPLATES.slice(0, 4).map((f, i) => ({ ...f, id: i, t: `${i * 2 + 1} мин` })));
  const [counter, setCounter] = useState(100);

  // live jitter + feed stream
  useEffect(() => {
    const t = setInterval(() => {
      setGrid((g) => g.map((row) => row.map((v) => Math.max(0, Math.min(1, v + (Math.random() - 0.5) * 0.08)))));
      setCounter((c) => c + 1);
    }, 2000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      const tmpl = FEED_TEMPLATES[Math.floor(Math.random() * FEED_TEMPLATES.length)];
      setFeed((f) => [{ ...tmpl, id: Date.now(), t: 'сейчас' }, ...f].slice(0, 6));
    }, 4500);
    return () => clearInterval(t);
  }, []);

  const critical = grid.flat().filter((v) => v >= 0.75).length;

  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(ellipse at top, #0a1424, #050a14 70%)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
        <div className="flex items-center justify-between mb-5">
          <button onClick={() => setLocation('/updates')} className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors">
            <ChevronLeft size={16} /> Назад
          </button>
          <div className="flex items-center gap-2 text-xs">
            <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
              className="w-2 h-2 rounded-full" style={{ background: '#22c55e' }} />
            <span className="text-white/50">LIVE · обновление {counter}</span>
          </div>
        </div>

        <div className="mb-5">
          <h1 className="text-white font-black text-xl sm:text-2xl mb-1 flex items-center gap-2">
            <Activity size={22} style={{ color: '#38bdf8' }} /> Карта водного стресса ЦА
          </h1>
          <p className="text-white/40 text-sm">Матрица регион × показатель · интенсивность = уровень риска</p>
        </div>

        {/* critical banner */}
        <AnimatePresence>
          {critical > 0 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="mb-4 flex items-center gap-2 px-4 py-2.5 rounded-xl overflow-hidden"
              style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                <AlertTriangle size={16} style={{ color: '#ef4444' }} />
              </motion.span>
              <span className="text-sm text-white font-medium">{critical} критических ячеек требуют внимания</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* heatmap */}
          <div className="lg:col-span-2 p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="overflow-x-auto">
              <div className="min-w-[440px]">
                {/* column headers */}
                <div className="grid mb-1" style={{ gridTemplateColumns: `88px repeat(${METRICS.length}, 1fr)` }}>
                  <div />
                  {METRICS.map((m) => <div key={m} className="text-[10px] text-white/40 text-center px-1">{m}</div>)}
                </div>
                {REGIONS.map((reg, r) => (
                  <div key={reg} className="grid gap-1 mb-1 items-center" style={{ gridTemplateColumns: `88px repeat(${METRICS.length}, 1fr)` }}>
                    <div className="text-[11px] text-white/60 truncate pr-1 flex items-center gap-1">
                      <MapPin size={9} className="text-white/25 shrink-0" />{reg}
                    </div>
                    {grid[r].map((v, c) => (
                      <button key={c} onClick={() => setSel({ r, c })}
                        className="h-9 rounded-md relative transition-all cursor-pointer hover:ring-2 hover:ring-white/40"
                        style={{ background: heatColor(v), outline: sel?.r === r && sel?.c === c ? '2px solid #fff' : 'none' }}>
                        {v >= 0.75 && (
                          <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.2, repeat: Infinity }}
                            className="absolute inset-0 rounded-md" style={{ boxShadow: 'inset 0 0 8px rgba(255,255,255,0.6)' }} />
                        )}
                        <span className="relative text-[9px] font-bold text-white/90">{Math.round(v * 100)}</span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            {/* legend */}
            <div className="flex items-center gap-2 mt-4 text-[10px] text-white/40">
              <span>Норма</span>
              <div className="flex-1 h-2 rounded-full" style={{ background: 'linear-gradient(90deg, rgba(56,189,248,0.6), rgba(34,197,94,0.7), rgba(245,158,11,0.8), rgba(239,68,68,0.9))' }} />
              <span>Критично</span>
            </div>
            {sel && (
              <div className="mt-3 p-3 rounded-xl text-sm" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <span className="text-white/50">{REGIONS[sel.r]} · {METRICS[sel.c]}: </span>
                <span className="font-bold" style={{ color: heatColor(grid[sel.r][sel.c]).replace(/[\d.]+\)$/, '1)') }}>
                  {Math.round(grid[sel.r][sel.c] * 100)}% риска
                </span>
              </div>
            )}
          </div>

          {/* live feed */}
          <div className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-white">
              <Bell size={15} style={{ color: '#f59e0b' }} /> Лента событий
            </div>
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {feed.map((f) => (
                  <motion.div key={f.id} layout
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                    className="p-2.5 rounded-xl" style={{ background: `${sevColor(f.sev)}0e`, border: `1px solid ${sevColor(f.sev)}25` }}>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: sevColor(f.sev) }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: sevColor(f.sev) }} />{f.r}
                      </span>
                      <span className="text-[9px] text-white/30">{f.t}</span>
                    </div>
                    <p className="text-xs text-white/70 leading-snug">{f.m}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
