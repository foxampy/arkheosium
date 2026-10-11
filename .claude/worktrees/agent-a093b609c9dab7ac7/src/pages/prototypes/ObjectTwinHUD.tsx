// ═══════════════════════════════════════════════════════════════
//  PROTOTYPE 1 — Object Digital Twin · Style: HUD / Sci-Fi FUI
//  Cyan neon on deep black, monospace telemetry, radial gauges,
//  scanline overlay, live-updating sensor readouts.
//  Entity class: Water Infrastructure Object (reservoir / dam)
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { ChevronLeft, Radio, Activity, Droplets, Zap, Gauge, AlertTriangle, Waves } from 'lucide-react';

const HUD = '#00e5ff';
const HUD_DIM = 'rgba(0,229,255,0.4)';

const OBJECT = {
  name: 'ЧАРВАКСКОЕ ВДХР.',
  code: 'UZ-RES-0417',
  river: 'р. Чирчик',
  region: 'Ташкентская обл.',
  coords: '41.6383° N, 70.0872° E',
  capacityMax: 2000, // млн м³
  power: 600, // МВт
  built: 1970,
};

// radial gauge component
function Gauge360({ value, max, label, unit, color = HUD }: { value: number; max: number; label: string; unit: string; color?: string }) {
  const pct = Math.min(value / max, 1);
  const R = 46;
  const C = 2 * Math.PI * R;
  return (
    <div className="relative flex flex-col items-center">
      <svg width="120" height="120" className="-rotate-90">
        <circle cx="60" cy="60" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
        <circle cx="60" cy="60" r={R} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={C} strokeDashoffset={C * (1 - pct)}
          style={{ filter: `drop-shadow(0 0 6px ${color})`, transition: 'stroke-dashoffset 0.8s ease' }} />
        {/* tick marks */}
        {Array.from({ length: 24 }).map((_, i) => {
          const a = (i / 24) * 2 * Math.PI;
          const x1 = 60 + Math.cos(a) * 54, y1 = 60 + Math.sin(a) * 54;
          const x2 = 60 + Math.cos(a) * 58, y2 = 60 + Math.sin(a) * 58;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(0,229,255,0.25)" strokeWidth="1" />;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono font-bold text-xl" style={{ color, textShadow: `0 0 8px ${color}` }}>
          {value.toLocaleString()}
        </span>
        <span className="font-mono text-[9px] text-white/40">{unit}</span>
      </div>
      <span className="font-mono text-[10px] uppercase tracking-widest mt-1 text-white/50">{label}</span>
    </div>
  );
}

export default function ObjectTwinHUD() {
  const [, setLocation] = useLocation();
  const [tick, setTick] = useState(0);
  const [level, setLevel] = useState(1720);

  // live jitter simulation
  useEffect(() => {
    const t = setInterval(() => {
      setTick((v) => v + 1);
      setLevel((v) => Math.max(1600, Math.min(1980, v + (Math.random() - 0.5) * 24)));
    }, 1500);
    return () => clearInterval(t);
  }, []);

  const sensors = [
    { id: 'FLOW-01', label: 'Расход', value: (142 + Math.sin(tick) * 6).toFixed(1), unit: 'м³/с', ok: true },
    { id: 'TEMP-03', label: 'Т воды', value: (12.4 + Math.cos(tick) * 0.3).toFixed(1), unit: '°C', ok: true },
    { id: 'TURB-02', label: 'Мутность', value: (3.1 + Math.random() * 0.4).toFixed(1), unit: 'NTU', ok: true },
    { id: 'PRES-05', label: 'Давление', value: (18.7 + Math.sin(tick / 2) * 0.5).toFixed(1), unit: 'бар', ok: true },
    { id: 'GEN-01', label: 'Генерация', value: (548 + Math.floor(Math.sin(tick) * 30)).toString(), unit: 'МВт', ok: true },
    { id: 'SEIS-01', label: 'Сейсмо', value: (0.02 + Math.random() * 0.03).toFixed(2), unit: 'g', ok: level < 1950 },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden font-mono"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, #001420 0%, #000508 60%, #000 100%)' }}>
      {/* scanline overlay */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.06]"
        style={{ background: 'repeating-linear-gradient(0deg, #00e5ff 0px, #00e5ff 1px, transparent 1px, transparent 3px)' }} />
      {/* corner brackets */}
      <div className="pointer-events-none fixed inset-4 z-0 border" style={{ borderColor: 'rgba(0,229,255,0.10)' }} />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-5">
        {/* top bar */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setLocation('/updates')}
            className="flex items-center gap-1.5 text-xs uppercase tracking-widest transition-colors hover:text-white"
            style={{ color: HUD_DIM }}>
            <ChevronLeft size={14} /> RETURN
          </button>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest" style={{ color: HUD }}>
            <motion.span animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <Radio size={12} />
            </motion.span>
            LIVE TELEMETRY · SYNC {String(tick).padStart(4, '0')}
          </div>
        </div>

        {/* title block */}
        <div className="mb-6 pb-4 border-b" style={{ borderColor: 'rgba(0,229,255,0.15)' }}>
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: '#fff', textShadow: `0 0 12px ${HUD_DIM}` }}>
              {OBJECT.name}
            </h1>
            <span className="text-xs px-2 py-0.5 border" style={{ color: HUD, borderColor: HUD_DIM }}>{OBJECT.code}</span>
          </div>
          <div className="flex gap-4 mt-2 text-[11px] text-white/40 flex-wrap">
            <span>◈ {OBJECT.river}</span>
            <span>◈ {OBJECT.region}</span>
            <span>◈ {OBJECT.coords}</span>
            <span>◈ EST. {OBJECT.built}</span>
          </div>
        </div>

        {/* gauges row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="flex justify-center p-4 border" style={{ borderColor: 'rgba(0,229,255,0.12)', background: 'rgba(0,229,255,0.02)' }}>
            <Gauge360 value={Math.round(level)} max={2000} label="Уровень" unit="млн м³" color={level > 1950 ? '#ff5252' : HUD} />
          </div>
          <div className="flex justify-center p-4 border" style={{ borderColor: 'rgba(0,229,255,0.12)', background: 'rgba(0,229,255,0.02)' }}>
            <Gauge360 value={86} max={100} label="Заполнение" unit="%" color="#00ffa3" />
          </div>
          <div className="flex justify-center p-4 border" style={{ borderColor: 'rgba(0,229,255,0.12)', background: 'rgba(0,229,255,0.02)' }}>
            <Gauge360 value={548} max={600} label="Мощность" unit="МВт" color="#ffd54f" />
          </div>
          <div className="flex justify-center p-4 border" style={{ borderColor: 'rgba(0,229,255,0.12)', background: 'rgba(0,229,255,0.02)' }}>
            <Gauge360 value={94} max={100} label="Целостность" unit="SI" color={HUD} />
          </div>
        </div>

        {/* sensor grid */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3 text-[10px] uppercase tracking-widest text-white/40">
            <Activity size={12} style={{ color: HUD }} /> SENSOR ARRAY · 6 NODES ONLINE
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {sensors.map((s) => (
              <div key={s.id} className="p-3 border relative overflow-hidden"
                style={{ borderColor: s.ok ? 'rgba(0,229,255,0.15)' : 'rgba(255,82,82,0.4)', background: 'rgba(0,10,16,0.6)' }}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] tracking-widest" style={{ color: s.ok ? HUD_DIM : '#ff5252' }}>{s.id}</span>
                  <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }}
                    className="w-1.5 h-1.5 rounded-full" style={{ background: s.ok ? '#00ffa3' : '#ff5252' }} />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold" style={{ color: s.ok ? '#fff' : '#ff5252' }}>{s.value}</span>
                  <span className="text-[10px] text-white/40">{s.unit}</span>
                </div>
                <span className="text-[10px] text-white/40 uppercase">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* waveform strip */}
        <div className="p-4 border mb-6" style={{ borderColor: 'rgba(0,229,255,0.12)', background: 'rgba(0,10,16,0.5)' }}>
          <div className="flex items-center gap-2 mb-2 text-[10px] uppercase tracking-widest text-white/40">
            <Waves size={12} style={{ color: HUD }} /> INFLOW WAVEFORM · 24H
          </div>
          <svg viewBox="0 0 600 80" className="w-full h-20">
            <polyline fill="none" stroke={HUD} strokeWidth="1.5" style={{ filter: `drop-shadow(0 0 4px ${HUD})` }}
              points={Array.from({ length: 60 }).map((_, i) =>
                `${i * 10},${40 + Math.sin(i / 3 + tick / 4) * 18 + Math.sin(i / 1.5) * 6}`).join(' ')} />
            <line x1="0" y1="40" x2="600" y2="40" stroke="rgba(0,229,255,0.15)" strokeDasharray="4 4" />
          </svg>
        </div>

        {/* status footer */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
          {[
            { icon: <Droplets size={13} />, k: 'РЕЖИМ', v: 'НОРМА · СБРОС 142 м³/с', c: '#00ffa3' },
            { icon: <Zap size={13} />, k: 'ЭНЕРГОСЕТЬ', v: 'ПОДКЛЮЧЕНА · 50 Гц', c: HUD },
            { icon: level > 1950 ? <AlertTriangle size={13} /> : <Gauge size={13} />, k: 'ПАВОДОК', v: level > 1950 ? 'ВНИМАНИЕ' : 'КОНТРОЛЬ', c: level > 1950 ? '#ff5252' : '#ffd54f' },
          ].map((r) => (
            <div key={r.k} className="flex items-center gap-2 p-3 border" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <span style={{ color: r.c }}>{r.icon}</span>
              <div>
                <div className="text-[9px] tracking-widest text-white/35">{r.k}</div>
                <div style={{ color: r.c }}>{r.v}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
