// ═══════════════════════════════════════════════════════════════
//  PROTOTYPE 2 — Project / Investment · Style: Glassmorphism
//  Frosted glass cards over a vibrant aurora gradient, layered depth,
//  soft light reflections. Entity class: Project (investment view).
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { ChevronLeft, TrendingUp, Users, Calendar, MapPin, Wallet, Target, CheckCircle2, Clock, Droplets } from 'lucide-react';

const PROJECT = {
  title: 'Smart Water Grid — Ферганская долина',
  category: 'Цифровизация ирригации',
  region: 'Ферганская долина, Узбекистан',
  raised: 78_000_000,
  goal: 120_000_000,
  irr: 18.5,
  progress: 64,
  team: 47,
  deadline: '2026 Q3',
  investors: 23,
};

const MILESTONES = [
  { label: 'Проектирование сети', done: true, date: '2024 Q4' },
  { label: 'Пилот 500 датчиков', done: true, date: '2025 Q1' },
  { label: 'Цифровой двойник v1', done: true, date: '2025 Q2' },
  { label: 'Развёртывание 3 400 узлов', done: false, date: '2025 Q4' },
  { label: 'AI-предиктив потерь', done: false, date: '2026 Q2' },
];

function Glass({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className={`rounded-3xl border ${className}`}
      style={{
        background: 'rgba(255,255,255,0.08)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderColor: 'rgba(255,255,255,0.18)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.15)',
      }}
    >
      {children}
    </motion.div>
  );
}

export default function ProjectGlass() {
  const [, setLocation] = useLocation();
  const [pledge, setPledge] = useState(50_000);
  const pct = Math.round((PROJECT.raised / PROJECT.goal) * 100);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* aurora background */}
      <div className="fixed inset-0 z-0" style={{ background: '#0a0f2c' }} />
      <div className="fixed inset-0 z-0" style={{ background: 'radial-gradient(60% 50% at 20% 10%, rgba(56,189,248,0.45), transparent), radial-gradient(50% 50% at 85% 20%, rgba(168,85,247,0.4), transparent), radial-gradient(60% 60% at 60% 100%, rgba(16,185,129,0.35), transparent)' }} />
      <motion.div className="fixed inset-0 z-0"
        animate={{ opacity: [0.3, 0.55, 0.3] }} transition={{ duration: 8, repeat: Infinity }}
        style={{ background: 'radial-gradient(40% 40% at 70% 60%, rgba(236,72,153,0.35), transparent)' }} />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <button onClick={() => setLocation('/updates')}
          className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white mb-5 transition-colors">
          <ChevronLeft size={16} /> Назад к обновлениям
        </button>

        {/* hero glass */}
        <Glass className="p-6 sm:p-8 mb-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-[240px]">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-3"
                style={{ background: 'rgba(255,255,255,0.12)', color: '#e0f2fe' }}>
                <Droplets size={12} /> {PROJECT.category}
              </div>
              <h1 className="text-white font-black text-2xl sm:text-3xl leading-tight mb-2">{PROJECT.title}</h1>
              <div className="flex items-center gap-1.5 text-white/60 text-sm">
                <MapPin size={14} /> {PROJECT.region}
              </div>
            </div>
            <div className="text-right">
              <div className="text-white/50 text-xs uppercase tracking-wider">Целевой IRR</div>
              <div className="text-4xl font-black" style={{ color: '#6ee7b7' }}>{PROJECT.irr}%</div>
            </div>
          </div>

          {/* funding progress */}
          <div className="mt-6">
            <div className="flex items-end justify-between mb-2">
              <div>
                <span className="text-2xl font-black text-white">${(PROJECT.raised / 1e6).toFixed(0)}M</span>
                <span className="text-white/50 text-sm"> / ${(PROJECT.goal / 1e6).toFixed(0)}M цель</span>
              </div>
              <span className="text-lg font-bold" style={{ color: '#38bdf8' }}>{pct}%</span>
            </div>
            <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.12)' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1.2 }}
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #38bdf8, #6ee7b7)', boxShadow: '0 0 16px rgba(56,189,248,0.6)' }} />
            </div>
          </div>
        </Glass>

        {/* stat glasses */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
          {[
            { icon: <Users size={18} />, label: 'Инвесторов', value: PROJECT.investors, c: '#a78bfa' },
            { icon: <Target size={18} />, label: 'Прогресс', value: `${PROJECT.progress}%`, c: '#38bdf8' },
            { icon: <Users size={18} />, label: 'Команда', value: PROJECT.team, c: '#6ee7b7' },
            { icon: <Calendar size={18} />, label: 'Дедлайн', value: PROJECT.deadline, c: '#f472b6' },
          ].map((s, i) => (
            <Glass key={s.label} delay={0.1 + i * 0.05} className="p-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: `${s.c}22`, color: s.c }}>{s.icon}</div>
              <div className="text-2xl font-black text-white">{s.value}</div>
              <div className="text-white/50 text-xs">{s.label}</div>
            </Glass>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* milestones */}
          <Glass delay={0.3} className="p-6 lg:col-span-3">
            <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <TrendingUp size={18} style={{ color: '#6ee7b7' }} /> Дорожная карта
            </h2>
            <div className="space-y-1">
              {MILESTONES.map((m, i) => (
                <div key={i} className="flex items-center gap-3 py-2.5">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: m.done ? 'rgba(110,231,183,0.2)' : 'rgba(255,255,255,0.08)', border: `1px solid ${m.done ? 'rgba(110,231,183,0.5)' : 'rgba(255,255,255,0.15)'}` }}>
                    {m.done ? <CheckCircle2 size={15} style={{ color: '#6ee7b7' }} /> : <Clock size={14} className="text-white/40" />}
                  </div>
                  <div className="flex-1">
                    <div className={m.done ? 'text-white text-sm' : 'text-white/60 text-sm'}>{m.label}</div>
                  </div>
                  <span className="text-white/40 text-xs">{m.date}</span>
                </div>
              ))}
            </div>
          </Glass>

          {/* invest widget */}
          <Glass delay={0.35} className="p-6 lg:col-span-2">
            <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <Wallet size={18} style={{ color: '#38bdf8' }} /> Инвестировать
            </h2>
            <div className="text-white/50 text-xs mb-2">Сумма участия</div>
            <div className="text-3xl font-black text-white mb-4">${pledge.toLocaleString()}</div>
            <input type="range" min={10000} max={500000} step={10000} value={pledge}
              onChange={(e) => setPledge(Number(e.target.value))}
              className="w-full mb-4 accent-cyan-400 cursor-pointer" />
            <div className="grid grid-cols-2 gap-2 mb-4">
              {[25000, 50000, 100000, 250000].map((v) => (
                <button key={v} onClick={() => setPledge(v)}
                  className="py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                  style={pledge === v
                    ? { background: 'rgba(56,189,248,0.3)', color: '#fff', border: '1px solid rgba(56,189,248,0.5)' }
                    : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.12)' }}>
                  ${(v / 1000)}K
                </button>
              ))}
            </div>
            <div className="rounded-xl p-3 mb-4" style={{ background: 'rgba(110,231,183,0.1)', border: '1px solid rgba(110,231,183,0.2)' }}>
              <div className="flex justify-between text-xs mb-1"><span className="text-white/50">Прогноз/год ({PROJECT.irr}%)</span><span className="text-white font-semibold">+${Math.round(pledge * PROJECT.irr / 100).toLocaleString()}</span></div>
              <div className="flex justify-between text-xs"><span className="text-white/50">За 5 лет</span><span style={{ color: '#6ee7b7' }} className="font-semibold">+${Math.round(pledge * (PROJECT.irr / 100) * 5).toLocaleString()}</span></div>
            </div>
            <button className="w-full py-3 rounded-2xl font-bold text-sm transition-all hover:scale-[1.02] cursor-pointer"
              style={{ background: 'linear-gradient(90deg, #38bdf8, #6ee7b7)', color: '#03212e' }}>
              Оформить заявку
            </button>
          </Glass>
        </div>
      </div>
    </div>
  );
}
