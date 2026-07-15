// ═══════════════════════════════════════════════════════════════
//  ConstructorPage — Конструктор проектов
//  Полный цикл создания проекта из объекта/инициативы:
//  основа → исследование → решения → технико-экономика →
//  инвестиции → дорожная карта → сводка.
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Check, Droplets, Building2, Lightbulb,
  Target, FlaskConical, Cpu, Leaf, Wrench, DollarSign, TrendingUp,
  Calendar, FileText, Sparkles, Download, CheckCircle2, Layers,
} from 'lucide-react';

// ── Опорные данные (статические источники) ────────────────────
const SOURCES = [
  { id: 'obj-charvak', kind: 'Объект', name: 'Чарвакское вдхр.', meta: 'Водохранилище · Ташкентская обл.', icon: <Droplets size={18} />, c: '#00d4ff' },
  { id: 'obj-karshi', kind: 'Объект', name: 'Канал Карши', meta: 'Канал · Кашкадарьинская обл.', icon: <Droplets size={18} />, c: '#00d4ff' },
  { id: 'obj-aral', kind: 'Объект', name: 'Аральская зона', meta: 'Экозона · Каракалпакстан', icon: <Droplets size={18} />, c: '#00d4ff' },
  { id: 'init-smartgrid', kind: 'Инициатива', name: 'Smart Water Grid', meta: 'Цифровизация ирригации', icon: <Lightbulb size={18} />, c: '#fbbf24' },
  { id: 'init-desal', kind: 'Инициатива', name: 'Опреснение для Приаралья', meta: 'Водоснабжение', icon: <Lightbulb size={18} />, c: '#fbbf24' },
  { id: 'init-reuse', kind: 'Инициатива', name: 'Повторное использование КДВ', meta: 'Коллекторно-дренажные воды', icon: <Lightbulb size={18} />, c: '#fbbf24' },
];

type Solution = { id: string; name: string; cat: string; capex: number; effect: string; icon: React.ReactNode; c: string };
const SOLUTIONS: Record<string, Solution[]> = {
  Технологии: [
    { id: 't1', name: 'AI-капельное орошение', cat: 'Технология', capex: 3.2, effect: '−42% воды', icon: <Leaf size={16} />, c: '#22c55e' },
    { id: 't2', name: 'Мембранное опреснение', cat: 'Технология', capex: 8.5, effect: '0.8 кВт·ч/м³', icon: <FlaskConical size={16} />, c: '#38bdf8' },
    { id: 't3', name: 'Реагентная водоочистка', cat: 'Технология', capex: 2.1, effect: '99.2% чистоты', icon: <FlaskConical size={16} />, c: '#f59e0b' },
  ],
  Методологии: [
    { id: 'm1', name: 'IWRM (интегр. управление)', cat: 'Методология', capex: 0.6, effect: 'системный эффект', icon: <Layers size={16} />, c: '#a78bfa' },
    { id: 'm2', name: 'Водный аудит и балансы', cat: 'Методология', capex: 0.4, effect: '−15% потерь', icon: <Target size={16} />, c: '#a78bfa' },
  ],
  Оборудование: [
    { id: 'e1', name: 'IoT-расходомеры (3400 шт.)', cat: 'Оборудование', capex: 4.1, effect: '±0.3% учёт', icon: <Cpu size={16} />, c: '#06b6d4' },
    { id: 'e2', name: 'Насосные станции (VFD)', cat: 'Оборудование', capex: 5.3, effect: '−28% энергии', icon: <Wrench size={16} />, c: '#06b6d4' },
    { id: 'e3', name: 'SCADA-диспетчеризация', cat: 'Оборудование', capex: 2.7, effect: 'реал-тайм', icon: <Cpu size={16} />, c: '#06b6d4' },
  ],
  Инновации: [
    { id: 'i1', name: 'Цифровой двойник сети', cat: 'Инновация', capex: 3.8, effect: 'предиктив', icon: <Sparkles size={16} />, c: '#ec4899' },
    { id: 'i2', name: 'Блокчейн-учёт водопользования', cat: 'Инновация', capex: 1.9, effect: 'прозрачность', icon: <Sparkles size={16} />, c: '#ec4899' },
  ],
};

const STEPS = [
  { key: 'source', label: 'Основа', icon: <Building2 size={15} /> },
  { key: 'research', label: 'Исследование', icon: <Target size={15} /> },
  { key: 'solutions', label: 'Решения', icon: <FlaskConical size={15} /> },
  { key: 'economics', label: 'Технико-экономика', icon: <DollarSign size={15} /> },
  { key: 'invest', label: 'Инвестиции', icon: <TrendingUp size={15} /> },
  { key: 'roadmap', label: 'Дорожная карта', icon: <Calendar size={15} /> },
  { key: 'summary', label: 'Сводка', icon: <FileText size={15} /> },
];

const ROADMAP_PHASES = [
  { phase: 'Фаза 0 · Исследование и ТЭО', dur: '3 мес', share: 8 },
  { phase: 'Фаза 1 · Проектирование', dur: '4 мес', share: 15 },
  { phase: 'Фаза 2 · Пилот', dur: '6 мес', share: 22 },
  { phase: 'Фаза 3 · Масштабирование', dur: '12 мес', share: 40 },
  { phase: 'Фаза 4 · Эксплуатация и M&E', dur: '∞', share: 15 },
];

export default function ConstructorPage() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(0);
  const [source, setSource] = useState<string | null>(null);
  const [problem, setProblem] = useState('');
  const [goal, setGoal] = useState('');
  const [horizon, setHorizon] = useState(5);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [opexPct, setOpexPct] = useState(6);
  const [tariff, setTariff] = useState(0.12);

  const allSolutions = useMemo(() => Object.values(SOLUTIONS).flat(), []);
  const chosen = allSolutions.filter((s) => selected.has(s.id));
  const capex = chosen.reduce((sum, s) => sum + s.capex, 0); // $M
  const opexAnnual = capex * (opexPct / 100);
  const revenueAnnual = capex * 0.28 + tariff * 40; // synthetic model
  const netAnnual = revenueAnnual - opexAnnual;
  const irr = capex > 0 ? Math.max(0, (netAnnual / capex) * 100) : 0;
  const payback = netAnnual > 0 ? capex / netAnnual : 0;

  const srcObj = SOURCES.find((s) => s.id === source);

  const toggle = (id: string) => setSelected((prev) => {
    const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n;
  });

  const canNext = () => {
    if (step === 0) return !!source;
    if (step === 1) return problem.trim().length > 3 && goal.trim().length > 3;
    if (step === 2) return selected.size > 0;
    return true;
  };

  const stepKey = STEPS[step].key;

  return (
    <div className="min-h-screen pb-24 sm:pb-8" style={{ background: 'linear-gradient(135deg, #04070f 0%, #060c1c 60%, #04060f 100%)' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5">
        {/* header */}
        <button onClick={() => setLocation('/hub')} className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white mb-4 transition-colors">
          <ChevronLeft size={16} /> К проектам
        </button>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.25)' }}>
            <Sparkles size={20} style={{ color: '#4ade80' }} />
          </div>
          <div>
            <h1 className="text-white font-black text-xl leading-tight">Конструктор проектов</h1>
            <p className="text-white/35 text-xs">Из объекта или инициативы — в готовый инвестпроект</p>
          </div>
        </div>

        {/* stepper */}
        <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-1">
          {STEPS.map((s, i) => (
            <button key={s.key} onClick={() => i <= step && setStep(i)}
              className="flex items-center gap-1.5 shrink-0 cursor-pointer"
              disabled={i > step}>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all"
                style={i === step
                  ? { background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.35)' }
                  : i < step
                    ? { background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.15)' }
                    : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ color: i < step ? '#4ade80' : i === step ? '#4ade80' : 'rgba(255,255,255,0.3)' }}>
                  {i < step ? <Check size={15} /> : s.icon}
                </span>
                <span className="text-xs font-medium whitespace-nowrap" style={{ color: i <= step ? '#fff' : 'rgba(255,255,255,0.3)' }}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && <ChevronRight size={12} className="text-white/15 shrink-0" />}
            </button>
          ))}
        </div>

        {/* step body */}
        <AnimatePresence mode="wait">
          <motion.div key={stepKey}
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl p-5 mb-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>

            {/* STEP 0 — source */}
            {stepKey === 'source' && (
              <>
                <h2 className="text-white font-bold text-base mb-1">Шаг 1 · Выберите основу проекта</h2>
                <p className="text-white/40 text-xs mb-4">Объект инфраструктуры или инициатива развития.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SOURCES.map((s) => (
                    <button key={s.id} onClick={() => setSource(s.id)}
                      className="flex items-center gap-3 p-3.5 rounded-xl text-left transition-all cursor-pointer"
                      style={source === s.id
                        ? { background: `${s.c}12`, border: `1px solid ${s.c}55` }
                        : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${s.c}15`, color: s.c }}>{s.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: `${s.c}15`, color: s.c }}>{s.kind}</span>
                        </div>
                        <div className="text-white font-semibold text-sm mt-1 truncate">{s.name}</div>
                        <div className="text-white/40 text-xs truncate">{s.meta}</div>
                      </div>
                      {source === s.id && <CheckCircle2 size={18} style={{ color: s.c }} className="shrink-0" />}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* STEP 1 — research */}
            {stepKey === 'research' && (
              <>
                <h2 className="text-white font-bold text-base mb-1">Шаг 2 · Исследование и обоснование</h2>
                <p className="text-white/40 text-xs mb-4">Проблема, цель и горизонт планирования.</p>
                <label className="block text-white/50 text-xs mb-1.5">Проблема / вызов</label>
                <textarea value={problem} onChange={(e) => setProblem(e.target.value)} rows={2}
                  placeholder="Напр.: потери воды на канале достигают 35% из-за фильтрации и отсутствия учёта…"
                  className="w-full rounded-xl px-3 py-2.5 text-sm text-white bg-white/[0.03] border border-white/10 outline-none focus:border-cyan-400/40 mb-4 resize-none" />
                <label className="block text-white/50 text-xs mb-1.5">Цель проекта</label>
                <textarea value={goal} onChange={(e) => setGoal(e.target.value)} rows={2}
                  placeholder="Напр.: сократить потери до 10%, внедрить учёт и предиктивное управление…"
                  className="w-full rounded-xl px-3 py-2.5 text-sm text-white bg-white/[0.03] border border-white/10 outline-none focus:border-cyan-400/40 mb-4 resize-none" />
                <label className="block text-white/50 text-xs mb-1.5">Горизонт планирования: <span className="text-white font-semibold">{horizon} лет</span></label>
                <input type="range" min={3} max={15} value={horizon} onChange={(e) => setHorizon(Number(e.target.value))}
                  className="w-full accent-green-400 cursor-pointer" />
              </>
            )}

            {/* STEP 2 — solutions */}
            {stepKey === 'solutions' && (
              <>
                <h2 className="text-white font-bold text-base mb-1">Шаг 3 · Подбор решений</h2>
                <p className="text-white/40 text-xs mb-4">Технологии, методологии, оборудование, инновации. Выбрано: <span className="text-green-400 font-semibold">{selected.size}</span></p>
                {Object.entries(SOLUTIONS).map(([cat, items]) => (
                  <div key={cat} className="mb-4">
                    <div className="text-[11px] uppercase tracking-wider text-white/35 font-semibold mb-2">{cat}</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {items.map((s) => (
                        <button key={s.id} onClick={() => toggle(s.id)}
                          className="flex items-center gap-2.5 p-2.5 rounded-xl text-left transition-all cursor-pointer"
                          style={selected.has(s.id)
                            ? { background: `${s.c}12`, border: `1px solid ${s.c}50` }
                            : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${s.c}15`, color: s.c }}>{s.icon}</div>
                          <div className="flex-1 min-w-0">
                            <div className="text-white text-xs font-medium truncate">{s.name}</div>
                            <div className="text-white/40 text-[10px]">{s.effect} · CAPEX ${s.capex}M</div>
                          </div>
                          <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                            style={{ background: selected.has(s.id) ? s.c : 'rgba(255,255,255,0.06)' }}>
                            {selected.has(s.id) && <Check size={13} className="text-black" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* STEP 3 — economics */}
            {stepKey === 'economics' && (
              <>
                <h2 className="text-white font-bold text-base mb-1">Шаг 4 · Технико-экономическое обоснование</h2>
                <p className="text-white/40 text-xs mb-4">Расчёт CAPEX/OPEX, выручки и окупаемости.</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
                  {[
                    { l: 'CAPEX', v: `$${capex.toFixed(1)}M`, c: '#f59e0b' },
                    { l: 'OPEX/год', v: `$${opexAnnual.toFixed(2)}M`, c: '#f87171' },
                    { l: 'IRR', v: `${irr.toFixed(1)}%`, c: '#4ade80' },
                    { l: 'Окупаемость', v: `${payback.toFixed(1)} лет`, c: '#38bdf8' },
                  ].map((m) => (
                    <div key={m.l} className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="font-black text-lg" style={{ color: m.c }}>{m.v}</div>
                      <div className="text-[10px] text-white/40 mt-0.5">{m.l}</div>
                    </div>
                  ))}
                </div>
                <label className="block text-white/50 text-xs mb-1.5">OPEX (% от CAPEX/год): <span className="text-white font-semibold">{opexPct}%</span></label>
                <input type="range" min={2} max={15} value={opexPct} onChange={(e) => setOpexPct(Number(e.target.value))} className="w-full accent-red-400 cursor-pointer mb-4" />
                <label className="block text-white/50 text-xs mb-1.5">Тариф на воду ($/м³): <span className="text-white font-semibold">${tariff.toFixed(2)}</span></label>
                <input type="range" min={0.04} max={0.4} step={0.01} value={tariff} onChange={(e) => setTariff(Number(e.target.value))} className="w-full accent-cyan-400 cursor-pointer" />
                <div className="mt-4 rounded-xl p-3 text-xs text-white/50" style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.15)' }}>
                  Чистый годовой поток: <span className="text-green-400 font-semibold">${netAnnual.toFixed(2)}M</span> · за {horizon} лет: <span className="text-green-400 font-semibold">${(netAnnual * horizon).toFixed(1)}M</span>
                </div>
              </>
            )}

            {/* STEP 4 — invest */}
            {stepKey === 'invest' && (
              <>
                <h2 className="text-white font-bold text-base mb-1">Шаг 5 · Инвестиционная структура</h2>
                <p className="text-white/40 text-xs mb-4">Источники финансирования CAPEX ${capex.toFixed(1)}M.</p>
                {[
                  { l: 'Грант / донор (ADB, WB)', pct: 35, c: '#4ade80' },
                  { l: 'Гос. со-финансирование', pct: 25, c: '#38bdf8' },
                  { l: 'Частные инвесторы / токенсейл', pct: 30, c: '#a78bfa' },
                  { l: 'Льготный кредит', pct: 10, c: '#fbbf24' },
                ].map((r) => (
                  <div key={r.l} className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-white/60">{r.l}</span>
                      <span className="text-white font-semibold">{r.pct}% · ${(capex * r.pct / 100).toFixed(1)}M</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${r.pct}%` }} transition={{ duration: 0.8 }}
                        className="h-full rounded-full" style={{ background: r.c }} />
                    </div>
                  </div>
                ))}
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {['Seed', 'Раунд A', 'Масштаб'].map((r, i) => (
                    <div key={r} className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="text-white font-bold text-sm">${(capex * [0.2, 0.45, 0.35][i]).toFixed(1)}M</div>
                      <div className="text-[10px] text-white/40">{r}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* STEP 5 — roadmap */}
            {stepKey === 'roadmap' && (
              <>
                <h2 className="text-white font-bold text-base mb-1">Шаг 6 · Дорожная карта</h2>
                <p className="text-white/40 text-xs mb-4">Фазы реализации и распределение бюджета.</p>
                <div className="space-y-2">
                  {ROADMAP_PHASES.map((p, i) => (
                    <div key={p.phase} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80' }}>{i}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm font-medium">{p.phase}</div>
                        <div className="h-1.5 rounded-full overflow-hidden mt-1.5" style={{ background: 'rgba(255,255,255,0.06)' }}>
                          <div className="h-full rounded-full" style={{ width: `${p.share}%`, background: 'linear-gradient(90deg,#4ade80,#38bdf8)' }} />
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-white/70 text-xs">{p.dur}</div>
                        <div className="text-white/40 text-[10px]">${(capex * p.share / 100).toFixed(1)}M</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* STEP 6 — summary */}
            {stepKey === 'summary' && (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 size={22} style={{ color: '#4ade80' }} />
                  <h2 className="text-white font-bold text-lg">Проект сформирован</h2>
                </div>
                <div className="rounded-xl p-4 mb-4" style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.18)' }}>
                  <div className="text-white/40 text-xs">Основа</div>
                  <div className="text-white font-semibold">{srcObj?.name} <span className="text-white/40 text-xs">· {srcObj?.kind}</span></div>
                  <div className="text-white/50 text-xs mt-2">Цель: {goal || '—'}</div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                  {[
                    { l: 'Решений', v: selected.size },
                    { l: 'CAPEX', v: `$${capex.toFixed(1)}M` },
                    { l: 'IRR', v: `${irr.toFixed(1)}%` },
                    { l: 'Окупаемость', v: `${payback.toFixed(1)} лет` },
                  ].map((m) => (
                    <div key={m.l} className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="text-white font-black">{m.v}</div>
                      <div className="text-[10px] text-white/40">{m.l}</div>
                    </div>
                  ))}
                </div>
                <div className="mb-4">
                  <div className="text-white/40 text-xs mb-2">Пакет решений</div>
                  <div className="flex flex-wrap gap-1.5">
                    {chosen.map((s) => (
                      <span key={s.id} className="text-[11px] px-2 py-1 rounded-full" style={{ background: `${s.c}12`, color: s.c, border: `1px solid ${s.c}25` }}>{s.name}</span>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="rounded-xl p-3 text-center text-xs" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <FileText size={16} className="mx-auto mb-1 text-cyan-400" /><span className="text-white/60">Технико-эконом. ТЭО</span>
                  </div>
                  <div className="rounded-xl p-3 text-center text-xs" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <TrendingUp size={16} className="mx-auto mb-1 text-amber-400" /><span className="text-white/60">Инвест-меморандум</span>
                  </div>
                  <div className="rounded-xl p-3 text-center text-xs" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <Calendar size={16} className="mx-auto mb-1 text-green-400" /><span className="text-white/60">Дорожная карта</span>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* nav buttons */}
        <div className="flex items-center justify-between gap-3">
          <button onClick={() => step > 0 ? setStep(step - 1) : setLocation('/hub')}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white transition-colors cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
            {step > 0 ? 'Назад' : 'Отмена'}
          </button>
          {step < STEPS.length - 1 ? (
            <button onClick={() => canNext() && setStep(step + 1)} disabled={!canNext()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer"
              style={canNext()
                ? { background: '#4ade80', color: '#04140a' }
                : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)', cursor: 'not-allowed' }}>
              Далее <ChevronRight size={16} />
            </button>
          ) : (
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] cursor-pointer"
              style={{ background: 'linear-gradient(90deg,#4ade80,#38bdf8)', color: '#04140a' }}>
              <Download size={16} /> Экспорт проекта
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
