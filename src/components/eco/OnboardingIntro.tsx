import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FlaskConical, Handshake, Building2, Coins, Code2, GraduationCap,
  BookOpen, Landmark, Sparkles, ArrowRight, ArrowLeft, Check, UserCircle2,
  Boxes, Users, FileText, Cpu, Network, Microscope,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ROLES, INTERESTS } from '@/data/ecosystem';

/**
 * Онбординг презентации /journey — 5 стадий на локальном стейте.
 * Самодостаточный, презентационный. Выбор роли/интересов — косметический
 * (только подсветка). На последней стадии CTA вызывает onComplete().
 * Уважает prefers-reduced-motion (копия useReduced из KarakalpakCampaign).
 */

const ACCENT = '#00e6c8';
const ACCENT_2 = '#00d4ff';
const STAGES = 5;

// ── Reduced-motion hook ──────────────────────────────────────────────────────
function useReduced() {
  const [r, setR] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setR(mq.matches);
    const on = () => setR(mq.matches);
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, []);
  return r;
}

// ── Icon resolver for role string names ──────────────────────────────────────
const ROLE_ICONS: Record<string, LucideIcon> = {
  FlaskConical, Handshake, Building2, Coins, Code2, GraduationCap, BookOpen, Landmark,
};
function RoleIcon({ name, size = 18 }: { name: string; size?: number }) {
  const Cmp = ROLE_ICONS[name] ?? Boxes;
  return <Cmp size={size} />;
}

// ── Living core (lightweight SVG/CSS: pulsing rings + scattered dots) ─────────
function LivingCore({ reduced, size = 200 }: { reduced: boolean; size?: number }) {
  const dots = useMemo(() => {
    const arr: { x: number; y: number; r: number; d: number }[] = [];
    for (let i = 0; i < 46; i++) {
      const a = Math.random() * Math.PI * 2;
      const rad = 26 + Math.random() * 66;
      arr.push({
        x: 100 + Math.cos(a) * rad,
        y: 100 + Math.sin(a) * rad,
        r: 0.8 + Math.random() * 1.8,
        d: Math.random() * 2,
      });
    }
    return arr;
  }, []);

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Pulsing concentric rings */}
        {[40, 62, 84].map((r, i) => (
          <motion.circle
            key={r}
            cx="100" cy="100" r={r}
            fill="none" stroke={i % 2 ? ACCENT_2 : ACCENT}
            strokeOpacity="0.25" strokeWidth="1"
            initial={reduced ? false : { scale: 0.85, opacity: 0.15 }}
            animate={reduced ? undefined : { scale: [0.85, 1.05, 0.85], opacity: [0.15, 0.4, 0.15] }}
            transition={{ duration: 3 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
            style={{ transformOrigin: '100px 100px' }}
          />
        ))}
        {/* Scattered particles forming the core */}
        {dots.map((p, i) => (
          <motion.circle
            key={i}
            cx={p.x} cy={p.y} r={p.r}
            fill={i % 3 === 0 ? ACCENT_2 : ACCENT}
            initial={reduced ? { opacity: 0.6 } : { opacity: 0 }}
            animate={reduced ? { opacity: 0.6 } : { opacity: [0.25, 0.9, 0.25] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: p.d }}
            style={{ filter: `drop-shadow(0 0 3px ${ACCENT})` }}
          />
        ))}
        {/* Core */}
        <circle cx="100" cy="100" r="18" fill={ACCENT + '33'} stroke={ACCENT} strokeOpacity="0.7" />
        <circle cx="100" cy="100" r="8" fill={ACCENT} fillOpacity="0.9" style={{ filter: `drop-shadow(0 0 8px ${ACCENT})` }} />
      </svg>
    </div>
  );
}

// ── Emergent elements for stage 2 ────────────────────────────────────────────
const EMERGE = [
  { label: 'Исследования', icon: Microscope, color: ACCENT },
  { label: 'Проекты', icon: Boxes, color: ACCENT_2 },
  { label: 'Люди', icon: Users, color: '#34d399' },
  { label: 'Компании', icon: Building2, color: '#a3e635' },
  { label: 'AI', icon: Cpu, color: '#7dd3fc' },
  { label: 'Документы', icon: FileText, color: '#f59e0b' },
  { label: 'DAO', icon: Network, color: '#c084fc' },
];

// ── Stage wrapper (fade/scale transition) ────────────────────────────────────
function StageShell({
  reduced, children,
}: { reduced: boolean; children: React.ReactNode }) {
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}

const glassStyle = {
  background: 'rgba(6,15,28,0.6)',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: `0 20px 80px rgba(0,0,0,0.55), 0 0 60px ${ACCENT}12`,
  backdropFilter: 'blur(28px)',
  WebkitBackdropFilter: 'blur(28px)',
} as const;

function PrimaryCta({
  children, onClick,
}: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-[#001018] transition-all hover:opacity-90 active:scale-95 cursor-pointer min-h-[44px]"
      style={{ background: `linear-gradient(120deg, ${ACCENT}, ${ACCENT_2})`, boxShadow: `0 8px 30px ${ACCENT}44` }}
    >
      {children}
      <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
    </button>
  );
}

export default function OnboardingIntro({ onComplete }: { onComplete: () => void }) {
  const reduced = useReduced();
  const [stage, setStage] = useState(0);
  const [role, setRole] = useState<string | null>(null);
  const [interests, setInterests] = useState<string[]>([]);

  const next = () => setStage((s) => Math.min(STAGES - 1, s + 1));
  const back = () => setStage((s) => Math.max(0, s - 1));
  const toggleInterest = (id: string) =>
    setInterests((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  return (
    <section
      data-scene
      className="relative flex min-h-screen w-full items-center justify-center px-6 py-16"
    >
      <div data-scene-content className="w-full max-w-2xl">
        <div className="rounded-3xl px-6 py-10 sm:px-10 sm:py-12 text-center" style={glassStyle}>
          <AnimatePresence mode="wait">
            {/* ── Stage 0 — Welcome ── */}
            {stage === 0 && (
              <StageShell key="s0" reduced={reduced}>
                <LivingCore reduced={reduced} size={200} />
                <span
                  className="mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide"
                  style={{ background: ACCENT + '18', color: ACCENT, border: `1px solid ${ACCENT}33` }}
                >
                  <Sparkles size={12} /> UNICAP · экосистема
                </span>
                <h1 className="mt-4 text-3xl font-black leading-tight text-white sm:text-5xl" style={{ textShadow: `0 0 40px ${ACCENT_2}33` }}>
                  Добро пожаловать
                </h1>
                <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-white/60 sm:text-base">
                  Живое ядро формируется из тысяч частиц — так рождается экосистема
                  исследований, проектов и людей. Начнём исследование.
                </p>
                <div className="mt-8 flex justify-center">
                  <PrimaryCta onClick={next}>Начать исследование</PrimaryCta>
                </div>
              </StageShell>
            )}

            {/* ── Stage 1 — Что такое Лаборатория ── */}
            {stage === 1 && (
              <StageShell key="s1" reduced={reduced}>
                <span
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide"
                  style={{ background: ACCENT_2 + '18', color: ACCENT_2, border: `1px solid ${ACCENT_2}33` }}
                >
                  <Boxes size={12} /> Что такое Лаборатория
                </span>
                <h2 className="mt-4 text-2xl font-black text-white sm:text-3xl">
                  Из ядра рождается экосистема
                </h2>
                <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-white/60">
                  Единый организм, где исследования, проекты и люди связаны в общий
                  контур знаний и данных.
                </p>
                <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {EMERGE.map((e, i) => (
                    <motion.div
                      key={e.label}
                      initial={reduced ? false : { opacity: 0, y: 14, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.4, delay: 0.06 * i }}
                      className="flex flex-col items-center gap-2 rounded-2xl px-2 py-4"
                      style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${e.color}33` }}
                    >
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl"
                        style={{ background: e.color + '1c', border: `1px solid ${e.color}44`, color: e.color }}
                      >
                        <e.icon size={18} />
                      </div>
                      <span className="text-[11px] font-semibold text-white/85">{e.label}</span>
                    </motion.div>
                  ))}
                </div>
                <StageNav reduced={reduced} onBack={back} onNext={next} nextLabel="Далее" />
              </StageShell>
            )}

            {/* ── Stage 2 — Выбор роли ── */}
            {stage === 2 && (
              <StageShell key="s2" reduced={reduced}>
                <span
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide"
                  style={{ background: ACCENT + '18', color: ACCENT, border: `1px solid ${ACCENT}33` }}
                >
                  <UserCircle2 size={12} /> Выбор роли
                </span>
                <h2 className="mt-4 text-2xl font-black text-white sm:text-3xl">Кто вы в экосистеме?</h2>
                <p className="mx-auto mt-3 max-w-lg text-sm text-white/60">Выберите роль — подстроим акценты.</p>
                <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {ROLES.map((r) => {
                    const on = role === r.id;
                    return (
                      <button
                        key={r.id}
                        onClick={() => setRole(r.id)}
                        className="flex min-h-[44px] flex-col items-center gap-2 rounded-2xl px-2 py-4 text-center transition-all active:scale-95 cursor-pointer"
                        style={{
                          background: on ? ACCENT + '22' : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${on ? ACCENT : 'rgba(255,255,255,0.08)'}`,
                          boxShadow: on ? `0 0 20px ${ACCENT}33` : 'none',
                        }}
                      >
                        <div
                          className="flex h-9 w-9 items-center justify-center rounded-xl"
                          style={{ background: (on ? ACCENT : '#ffffff') + '18', color: on ? ACCENT : 'rgba(255,255,255,0.7)' }}
                        >
                          <RoleIcon name={r.icon} size={18} />
                        </div>
                        <span className="text-[12px] font-bold text-white/90 leading-tight">{r.label}</span>
                        <span className="text-[10px] text-white/45 leading-tight">{r.desc}</span>
                      </button>
                    );
                  })}
                </div>
                <StageNav reduced={reduced} onBack={back} onNext={next} nextLabel="Далее" />
              </StageShell>
            )}

            {/* ── Stage 3 — Интересы ── */}
            {stage === 3 && (
              <StageShell key="s3" reduced={reduced}>
                <span
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide"
                  style={{ background: ACCENT_2 + '18', color: ACCENT_2, border: `1px solid ${ACCENT_2}33` }}
                >
                  <Sparkles size={12} /> Интересы
                </span>
                <h2 className="mt-4 text-2xl font-black text-white sm:text-3xl">Что вам близко?</h2>
                <p className="mx-auto mt-3 max-w-lg text-sm text-white/60">Отметьте несколько направлений.</p>
                <div className="mt-6 flex flex-wrap justify-center gap-2.5">
                  {INTERESTS.map((it) => {
                    const on = interests.includes(it.id);
                    return (
                      <button
                        key={it.id}
                        onClick={() => toggleInterest(it.id)}
                        className="inline-flex min-h-[44px] items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all active:scale-95 cursor-pointer"
                        style={{
                          background: on ? it.color + '2a' : it.color + '12',
                          color: on ? '#ffffff' : it.color,
                          border: `1px solid ${it.color}${on ? '' : '33'}`,
                          boxShadow: on ? `0 0 16px ${it.color}44` : 'none',
                        }}
                      >
                        {on && <Check size={14} />}
                        {it.label}
                      </button>
                    );
                  })}
                </div>
                <StageNav reduced={reduced} onBack={back} onNext={next} nextLabel="Далее" />
              </StageShell>
            )}

            {/* ── Stage 4 — Цифровой профиль ── */}
            {stage === 4 && (
              <StageShell key="s4" reduced={reduced}>
                <div className="relative mx-auto flex h-28 w-28 items-center justify-center">
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{ background: `radial-gradient(circle, ${ACCENT}33, transparent 70%)` }}
                    initial={reduced ? false : { scale: 0.8, opacity: 0.4 }}
                    animate={reduced ? undefined : { scale: [0.8, 1.1, 0.8], opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <div
                    className="relative flex h-20 w-20 items-center justify-center rounded-full"
                    style={{ background: ACCENT + '1c', border: `1px solid ${ACCENT}`, boxShadow: `0 0 30px ${ACCENT}55` }}
                  >
                    <UserCircle2 size={40} style={{ color: ACCENT }} />
                  </div>
                </div>
                <span
                  className="mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide"
                  style={{ background: ACCENT + '18', color: ACCENT, border: `1px solid ${ACCENT}33` }}
                >
                  <Sparkles size={12} /> Цифровой профиль
                </span>
                <h2 className="mt-4 text-2xl font-black text-white sm:text-3xl">Ваш аватар оживает</h2>
                <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-white/60">
                  Профиль собран — теперь можно погрузиться в путешествие по экосистеме
                  и её флагману.
                </p>
                <div className="mt-8 flex justify-center">
                  <PrimaryCta onClick={onComplete}>Продолжить путешествие</PrimaryCta>
                </div>
              </StageShell>
            )}
          </AnimatePresence>
        </div>

        {/* Progress dots + skip */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            {Array.from({ length: STAGES }).map((_, i) => (
              <button
                key={i}
                onClick={() => setStage(i)}
                aria-label={`Стадия ${i + 1}`}
                className="h-2 rounded-full transition-all cursor-pointer"
                style={{
                  width: i === stage ? 22 : 8,
                  background: i === stage ? ACCENT : 'rgba(255,255,255,0.22)',
                  boxShadow: i === stage ? `0 0 8px ${ACCENT}` : 'none',
                }}
              />
            ))}
          </div>
          <span className="h-4 w-px bg-white/10" />
          <button
            onClick={onComplete}
            className="text-[11px] font-semibold text-white/45 transition-colors hover:text-white/75 cursor-pointer"
          >
            Пропустить онбординг
          </button>
        </div>
      </div>
    </section>
  );
}

// ── Back / Next row for middle stages ────────────────────────────────────────
function StageNav({
  onBack, onNext, nextLabel,
}: { reduced: boolean; onBack: () => void; onNext: () => void; nextLabel: string }) {
  return (
    <div className="mt-8 flex items-center justify-center gap-3">
      <button
        onClick={onBack}
        className="inline-flex min-h-[44px] items-center gap-1.5 rounded-2xl px-4 py-2.5 text-sm font-medium text-white/70 transition-all hover:bg-white/[0.05] active:scale-95 cursor-pointer"
        style={{ border: '1px solid rgba(255,255,255,0.14)' }}
      >
        <ArrowLeft size={15} /> Назад
      </button>
      <PrimaryCta onClick={onNext}>{nextLabel}</PrimaryCta>
    </div>
  );
}
