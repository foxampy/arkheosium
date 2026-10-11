// ═══════════════════════════════════════════════════════════════
//  PROTOTYPE 5 — R&D / Technology · Style: Bento Grid Showcase
//  Apple-style modular bento grid, mixed cell sizes, hover tilt,
//  vibrant accent icons. Entity class: R&D program + technologies.
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { ChevronLeft, FlaskConical, Cpu, Leaf, Gauge, Beaker, Zap, ArrowUpRight, TrendingUp, Award } from 'lucide-react';

const PROGRAM = {
  title: 'Программа R&D · Ресурсосбережение в ирригации',
  lead: 'НИИ ирригации и водных проблем',
  trl: 7,
  budget: 24_000_000,
  patents: 11,
};

function Bento({ children, className = '', accent, delay = 0 }: { children: React.ReactNode; className?: string; accent: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ scale: 1.015, y: -2 }}
      className={`rounded-3xl p-5 relative overflow-hidden cursor-pointer group ${className}`}
      style={{ background: 'linear-gradient(160deg, #14151a, #0d0e12)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-40"
        style={{ background: accent }} />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

export default function RDBento() {
  const [, setLocation] = useLocation();
  const [active, setActive] = useState(0);

  const techs = [
    { name: 'Капельное AI-орошение', icon: <Leaf size={18} />, c: '#22c55e', trl: 8, save: '−42% воды' },
    { name: 'Мембранное опреснение', icon: <Beaker size={18} />, c: '#38bdf8', trl: 7, save: '0.8 кВт·ч/м³' },
    { name: 'Сенсорная сеть LoRa', icon: <Cpu size={18} />, c: '#a78bfa', trl: 9, save: '3400 узлов' },
    { name: 'Реагентная очистка', icon: <FlaskConical size={18} />, c: '#f59e0b', trl: 6, save: '99.2% чистоты' },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#080909', fontFamily: "system-ui, sans-serif" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <button onClick={() => setLocation('/updates')} className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white mb-5 transition-colors">
          <ChevronLeft size={16} /> Назад к обновлениям
        </button>

        {/* header */}
        <div className="mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-3"
            style={{ background: 'rgba(34,197,94,0.12)', color: '#4ade80' }}>
            <FlaskConical size={12} /> R&D Программа
          </div>
          <h1 className="text-white font-black text-2xl sm:text-3xl leading-tight max-w-2xl">{PROGRAM.title}</h1>
          <p className="text-white/40 text-sm mt-1">{PROGRAM.lead}</p>
        </div>

        {/* bento grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 auto-rows-[minmax(0,1fr)]">
          {/* big feature cell */}
          <Bento accent="#22c55e" className="col-span-2 row-span-2 min-h-[280px] flex flex-col justify-between" delay={0.05}>
            <div>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80' }}>
                <Award size={22} />
              </div>
              <div className="text-white/40 text-xs uppercase tracking-wider mb-1">Уровень готовности</div>
              <div className="flex items-baseline gap-2">
                <span className="text-white font-black text-6xl">TRL {PROGRAM.trl}</span>
              </div>
              <p className="text-white/50 text-sm mt-3 max-w-xs">Прототип прошёл валидацию в реальных условиях Ферганской долины. Готовность к пилотному внедрению.</p>
            </div>
            <div className="flex gap-1.5">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="h-1.5 flex-1 rounded-full" style={{ background: i < PROGRAM.trl ? '#22c55e' : 'rgba(255,255,255,0.08)' }} />
              ))}
            </div>
          </Bento>

          {/* budget */}
          <Bento accent="#38bdf8" delay={0.1}>
            <Zap size={18} style={{ color: '#38bdf8' }} className="mb-3" />
            <div className="text-white font-black text-2xl">${(PROGRAM.budget / 1e6).toFixed(0)}M</div>
            <div className="text-white/40 text-xs mt-0.5">Бюджет НИОКР</div>
          </Bento>

          {/* patents */}
          <Bento accent="#a78bfa" delay={0.15}>
            <Award size={18} style={{ color: '#a78bfa' }} className="mb-3" />
            <div className="text-white font-black text-2xl">{PROGRAM.patents}</div>
            <div className="text-white/40 text-xs mt-0.5">Патентов</div>
          </Bento>

          {/* efficiency wide */}
          <Bento accent="#f59e0b" className="col-span-2" delay={0.2}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold mb-1">
                  <TrendingUp size={13} /> Эффект
                </div>
                <div className="text-white font-black text-xl">−42% расход воды</div>
                <div className="text-white/40 text-xs mt-0.5">против традиционного полива</div>
              </div>
              <Gauge size={40} className="text-amber-400/30" />
            </div>
          </Bento>
        </div>

        {/* tech stack selector */}
        <div className="mt-6">
          <h2 className="text-white font-bold text-lg mb-3">Технологический стек</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {techs.map((t, i) => (
              <motion.button key={t.name} onClick={() => setActive(i)}
                whileHover={{ y: -3 }}
                className="rounded-2xl p-4 text-left transition-all cursor-pointer"
                style={{
                  background: active === i ? `${t.c}14` : 'linear-gradient(160deg, #14151a, #0d0e12)',
                  border: `1px solid ${active === i ? `${t.c}55` : 'rgba(255,255,255,0.07)'}`,
                }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: `${t.c}18`, color: t.c }}>{t.icon}</div>
                <div className="text-white font-semibold text-sm leading-tight mb-2">{t.name}</div>
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${t.c}14`, color: t.c }}>TRL {t.trl}</span>
                  <span className="text-xs text-white/50">{t.save}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-6 rounded-3xl p-6 flex items-center justify-between flex-wrap gap-4"
          style={{ background: 'linear-gradient(120deg, rgba(34,197,94,0.12), rgba(56,189,248,0.1))', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div>
            <h3 className="text-white font-bold text-lg">Внедрить технологию в проект</h3>
            <p className="text-white/50 text-sm">Подобрать оборудование и рассчитать эффект для вашего объекта</p>
          </div>
          <button onClick={() => setLocation('/updates')}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all hover:scale-[1.02] cursor-pointer"
            style={{ background: '#22c55e', color: '#04140a' }}>
            К конструктору <ArrowUpRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
