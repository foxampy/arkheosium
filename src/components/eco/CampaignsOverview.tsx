import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { motion, useInView } from 'framer-motion';
import {
  Building2, CloudRain, Waves, Droplets, Sprout, Sun, Globe2,
  Network, Rocket, ArrowRight, Snowflake, Ship, Cpu, Users,
  Gauge, ShieldCheck, Boxes, Sparkles,
} from 'lucide-react';
import {
  ISLAND_RINGS, ISLAND_STATS, TRANSFER_STATS, CORRIDOR_NODES,
  TRANSFER_PRINCIPLES, CAMPAIGNS,
} from '@/data/campaigns-overview';

/**
 * Block 6 — обзор кампаний единой программы.
 *
 * Self-contained: зеркалирует палитру/glass-стиль AralSeaProjectPage, как и
 * соседние KarakalpakCampaign / DualProgramStage, чтобы встать прямо в колонку
 * глав. Три подраздела сверху вниз:
 *   1. Город-остров — концентрические кольца самодостаточного острова в центре
 *      восстановленного Арала.
 *   2. Переброс паводковых вод из Сибири — коридор сезонного профицита воды на юг.
 *   3. Прочие кампании и модули — сетка тиражируемых контуров программы.
 */

const C = {
  accent: '#00e6c8',
  accent2: '#00d4ff',
  water: '#00e6c8',
  energy: '#f59e0b',
  minerals: '#c084fc',
  nature: '#34d399',
  agriculture: '#a3e635',
  climate: '#7dd3fc',
  gold: '#f59e0b',
};

// ── Reduced-motion hook (copy of sibling useReduced) ─────────────────────────
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

// ── Icon resolver for string names from the data module ──────────────────────
const ICONS: Record<string, React.ComponentType<{ size?: number | string }>> = {
  Building2, CloudRain, Waves, Droplets, Sprout, Sun, Globe2,
  Network, Rocket, ArrowRight, Snowflake, Ship, Cpu, Users,
  Gauge, ShieldCheck, Boxes,
};
function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const Cmp = ICONS[name] ?? Boxes;
  return <Cmp size={size} />;
}

// ── Eyebrow pill (mirrors page style) ────────────────────────────────────────
function Eyebrow({ color = C.accent, children }: { color?: string; children: React.ReactNode }) {
  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase"
      style={{ background: color + '18', color, border: `1px solid ${color}33` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {children}
    </div>
  );
}

// ── Reveal-on-scroll wrapper ─────────────────────────────────────────────────
function Reveal({
  children, delay = 0, className, reduced,
}: { children: React.ReactNode; delay?: number; className?: string; reduced: boolean }) {
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 18 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 1 · Island-city — concentric rings + KPI stats
// ─────────────────────────────────────────────────────────────────────────────
function IslandCitySection({ reduced }: { reduced: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  const W = 340, H = 340, cx = W / 2, cy = H / 2;
  // Outer→inner radii for the 5 rings (index 0 = outer shoreline … 4 = core).
  const radii = [150, 120, 90, 60, 30];
  // Data is core→periphery; render outer→inner so the core sits on top.
  const outerToInner = [...ISLAND_RINGS].reverse();

  return (
    <div>
      <Eyebrow color={C.accent}>Город-остров · самодостаточный контур</Eyebrow>
      <h3 className="mt-4 text-xl sm:text-3xl font-bold text-white leading-tight">
        Остров-город в центре восстановленного Арала
      </h3>
      <p className="mt-3 text-white/55 text-sm sm:text-base max-w-2xl">
        Круговой самодостаточный город на возрождённой акватории: ядро → жилое кольцо →
        кольцо агро-куполов → энергопериметр ВИЭ → восстановленный берег. Каждое кольцо
        замыкает свой цикл воды, энергии и биоразнообразия.
      </p>

      {/* Concentric-ring diagram */}
      <div ref={ref} className="mt-5 rounded-2xl p-3 sm:p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="relative mx-auto" style={{ width: W, maxWidth: '100%', aspectRatio: `${W} / ${H}` }}>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
            <defs>
              <radialGradient id="islandCore" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={C.accent2} stopOpacity="0.5" />
                <stop offset="100%" stopColor={C.accent2} stopOpacity="0.05" />
              </radialGradient>
            </defs>
            {/* restored water backdrop */}
            <circle cx={cx} cy={cy} r={radii[0] + 14} fill={C.water} fillOpacity="0.05" />
            {outerToInner.map((ring, i) => {
              const r = radii[i];
              return (
                <motion.g
                  key={ring.id}
                  initial={reduced ? false : { scale: 0.6, opacity: 0 }}
                  animate={inView && !reduced ? { scale: 1, opacity: 1 } : undefined}
                  transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
                  style={{ transformOrigin: `${cx}px ${cy}px` }}
                >
                  <circle
                    cx={cx} cy={cy} r={r}
                    fill={ring.id === 'core' ? 'url(#islandCore)' : ring.color}
                    fillOpacity={ring.id === 'core' ? 1 : 0.08}
                    stroke={ring.color}
                    strokeOpacity="0.7"
                    strokeWidth={ring.id === 'core' ? 2 : 1.5}
                    style={{ filter: `drop-shadow(0 0 8px ${ring.color}55)` }}
                  />
                  {ring.id !== 'core' && (
                    <text
                      x={cx} y={cy - r + 15} textAnchor="middle"
                      fill="#ffffff" fontSize="8.5" fontWeight="600" opacity="0.85"
                    >
                      {ring.label}
                    </text>
                  )}
                </motion.g>
              );
            })}
            <text x={cx} y={cy + 4} textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="700">ЯДРО</text>
          </svg>
        </div>
      </div>

      {/* KPI stats */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {ISLAND_STATS.map((s, i) => (
          <Reveal key={s.id} reduced={reduced} delay={i * 0.05}>
            <div
              className="h-full rounded-2xl p-4 text-center"
              style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${s.color}33` }}
            >
              <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl mb-2" style={{ background: s.color + '1c', border: `1px solid ${s.color}44`, color: s.color }}>
                <Icon name={s.icon} size={16} />
              </div>
              <div className="text-xl sm:text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[11px] text-white/45 mt-1 leading-tight">{s.label}</div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Ring legend */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ISLAND_RINGS.map((ring, i) => (
          <Reveal key={ring.id} reduced={reduced} delay={i * 0.04}>
            <div
              className="h-full rounded-2xl p-4 flex gap-3"
              style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${ring.color}33` }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0" style={{ background: ring.color + '1c', border: `1px solid ${ring.color}44`, color: ring.color }}>
                <Icon name={ring.icon} />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-white leading-tight">{ring.label}</div>
                <p className="text-xs text-white/55 mt-1.5 leading-relaxed">{ring.desc}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2 · Siberia → Aral seasonal flood-water transfer corridor
// ─────────────────────────────────────────────────────────────────────────────
function TransferSection({ reduced }: { reduced: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  const W = 720, H = 240;
  const nodeX = [110, 360, 610];
  const nodeY = H / 2;

  return (
    <div>
      <Eyebrow color={C.accent2}>Переброс паводковых вод · Сибирь → Арал</Eyebrow>
      <h3 className="mt-4 text-xl sm:text-3xl font-bold text-white leading-tight">
        Умный коридор сезонного паводкового профицита
      </h3>
      <p className="mt-3 text-white/55 text-sm sm:text-base max-w-2xl">
        Сезонный весенний профицит сибирских бассейнов направляется на юг по умному
        каналу-акведуку в Аральский бассейн для восстановления экологии. Забирается
        <span className="text-white/80 font-semibold"> только паводковый избыток</span> —
        экологически безопасно для рек-доноров.
      </p>

      {/* Flow / corridor diagram */}
      <div ref={ref} className="mt-5 rounded-2xl p-3 sm:p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          <defs>
            <linearGradient id="corridorGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={C.climate} />
              <stop offset="50%" stopColor={C.accent2} />
              <stop offset="100%" stopColor={C.nature} />
            </linearGradient>
          </defs>

          {/* corridor bed */}
          <path
            d={`M${nodeX[0]},${nodeY} L${nodeX[2]},${nodeY}`}
            stroke="url(#corridorGrad)" strokeOpacity="0.18" strokeWidth="26" strokeLinecap="round"
          />
          {/* animated dashed flow lines (gated behind reduced) */}
          {[0, 1].map((k) => (
            <motion.path
              key={k}
              d={`M${nodeX[0]},${nodeY} L${nodeX[2]},${nodeY}`}
              fill="none" stroke="url(#corridorGrad)" strokeOpacity={0.75 - k * 0.3}
              strokeWidth={4 - k} strokeDasharray="6 16" strokeLinecap="round"
              animate={reduced ? undefined : { strokeDashoffset: [0, -220] }}
              transition={{ duration: 3 + k, repeat: Infinity, ease: 'linear' }}
            />
          ))}

          {/* nodes */}
          {CORRIDOR_NODES.map((n, i) => (
            <motion.g
              key={n.id}
              initial={reduced ? false : { scale: 0.7, opacity: 0 }}
              animate={inView && !reduced ? { scale: 1, opacity: 1 } : undefined}
              transition={{ duration: 0.45, delay: 0.15 + i * 0.15 }}
              style={{ transformOrigin: `${nodeX[i]}px ${nodeY}px` }}
            >
              <circle cx={nodeX[i]} cy={nodeY} r="34" fill={n.color} fillOpacity="0.16" stroke={n.color} strokeOpacity="0.8" strokeWidth="2" style={{ filter: `drop-shadow(0 0 12px ${n.color}66)` }} />
              <circle cx={nodeX[i]} cy={nodeY} r="10" fill={n.color} fillOpacity="0.9" />
              <text x={nodeX[i]} y={nodeY - 48} textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="700">{n.label}</text>
              <text x={nodeX[i]} y={nodeY + 60} textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="500" opacity="0.55">{n.sub}</text>
            </motion.g>
          ))}
        </svg>
      </div>

      {/* Safety principles */}
      <div className="mt-4 flex flex-wrap gap-2">
        {TRANSFER_PRINCIPLES.map((p) => (
          <div
            key={p.id}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold"
            style={{ background: p.color + '18', color: p.color, border: `1px solid ${p.color}33` }}
          >
            <Icon name={p.icon} size={13} /> {p.title}
          </div>
        ))}
      </div>

      {/* Transfer stats */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {TRANSFER_STATS.map((s, i) => (
          <Reveal key={s.id} reduced={reduced} delay={i * 0.05}>
            <div
              className="h-full rounded-2xl p-4"
              style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${s.color}33` }}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl mb-3" style={{ background: s.color + '1c', border: `1px solid ${s.color}44`, color: s.color }}>
                <Icon name={s.icon} size={16} />
              </div>
              <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[11px] text-white/45 mt-1 leading-tight">{s.label}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3 · Other replication campaigns & modules
// ─────────────────────────────────────────────────────────────────────────────
function CampaignsGridSection({ reduced }: { reduced: boolean }) {
  return (
    <div>
      <Eyebrow color={C.agriculture}>Прочие кампании и модули</Eyebrow>
      <h3 className="mt-4 text-xl sm:text-3xl font-bold text-white leading-tight">
        Один шаблон — множество контуров Земли
      </h3>
      <p className="mt-3 text-white/55 text-sm sm:text-base max-w-2xl">
        Отработанный на Арале подход тиражируется по регионам и разворачивается как
        модульные кампании — каждая со своим доменом и метрикой эффекта.
      </p>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {CAMPAIGNS.map((c, i) => (
          <Reveal key={c.id} reduced={reduced} delay={i * 0.04}>
            <div
              className="group h-full rounded-2xl p-4 flex gap-3 cursor-pointer transition-all hover:bg-white/[0.05]"
              style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${c.color}33` }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0" style={{ background: c.color + '1c', border: `1px solid ${c.color}44`, color: c.color }}>
                <Icon name={c.icon} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="text-sm font-bold text-white leading-tight">{c.title}</div>
                  <span
                    className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase"
                    style={{ background: c.color + '22', color: c.color }}
                  >
                    {c.kind === 'region' ? 'регион' : 'модуль'}
                  </span>
                </div>
                <p className="text-xs text-white/55 mt-1.5 leading-relaxed">{c.desc}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Root
// ─────────────────────────────────────────────────────────────────────────────
export default function CampaignsOverview() {
  const reduced = useReduced();
  const [, setLocation] = useLocation();

  return (
    <div
      className="rounded-3xl p-5 sm:p-8"
      style={{
        background: 'rgba(6,15,28,0.6)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
      }}
    >
      {/* Header */}
      <Eyebrow color={C.accent2}>Обзор кампаний · единая программа</Eyebrow>
      <h2 className="mt-4 text-2xl sm:text-4xl font-bold text-white leading-tight">
        От острова-города до всех контуров Земли
      </h2>
      <p className="mt-3 text-white/55 text-sm sm:text-base max-w-2xl">
        Самодостаточный город-остров, экологичный переброс сезонной паводковой воды и
        сетка тиражируемых кампаний — единая программа в масштабе планеты.
      </p>

      <div className="mt-8 space-y-10 sm:space-y-14">
        <IslandCitySection reduced={reduced} />
        <TransferSection reduced={reduced} />
        <CampaignsGridSection reduced={reduced} />

        {/* Closing seam — every campaign is one contour of a single DAO program */}
        <div
          className="relative rounded-2xl p-5 sm:p-6 overflow-hidden"
          style={{ background: `linear-gradient(120deg, ${C.accent}12, ${C.accent2}0e)`, border: `1px solid ${C.accent}33` }}
        >
          <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full" style={{ background: C.accent + '22', filter: 'blur(48px)' }} />
          <div className="relative">
            <Sparkles size={22} style={{ color: C.accent }} />
            <p className="mt-3 text-white/75 text-sm sm:text-[15px] leading-relaxed max-w-3xl">
              Каждая кампания — тиражируемый контур единой программы: город-остров, водный
              переброс и региональные развёртывания интегрируются в общий граф эффективности
              и в <span className="text-white font-semibold">DAO</span>. Один отработанный
              шаблон масштабируется на всю планету и за её пределы.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setLocation('/dao')}
                className="group inline-flex min-h-[44px] items-center gap-2 px-4 py-2.5 rounded-2xl font-medium text-white/80 transition-all hover:text-white hover:bg-white/[0.06] active:scale-95 cursor-pointer"
                style={{ border: `1px solid ${C.accent}55` }}
              >
                <Network size={16} style={{ color: C.accent }} /> Связующий слой — DAO
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" style={{ color: C.accent }} />
              </button>
              <button
                type="button"
                onClick={() => setLocation('/whitepaper-full')}
                className="group inline-flex min-h-[44px] items-center gap-2 px-4 py-2.5 rounded-2xl font-medium text-white/80 transition-all hover:text-white hover:bg-white/[0.06] active:scale-95 cursor-pointer"
                style={{ border: `1px solid ${C.accent2}55` }}
              >
                <Rocket size={16} style={{ color: C.accent2 }} /> Тиражируемый контур программы
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" style={{ color: C.accent2 }} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
