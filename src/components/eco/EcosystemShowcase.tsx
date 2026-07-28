import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Waves, Scale, Droplets, FlaskConical, Cpu, GraduationCap, Network,
  Boxes, Sparkles, ArrowDown,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ECOSYSTEM_NODES } from '@/data/ecosystem';

/**
 * Living Ecosystem — мост между онбордингом и таймлапсом.
 * Радиальный связанный граф из 7 узлов вокруг центра «UNICAP · экосистема»
 * + сетка карточек. Самодостаточный, презентационный.
 *
 * ВАЖНО: Innovation Lab (FoxampyForge) показан ТОЛЬКО как узел/карточка с
 * бейджем «отдельная среда · R&D-департамент UNICAP» — без Lab OS и роутинга.
 */

const ACCENT = '#00e6c8';
const ACCENT_2 = '#00d4ff';

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

const ICONS: Record<string, LucideIcon> = {
  Waves, Scale, Droplets, FlaskConical, Cpu, GraduationCap, Network,
};
function NodeIcon({ name, size = 18 }: { name: string; size?: number }) {
  const Cmp = ICONS[name] ?? Boxes;
  return <Cmp size={size} />;
}

// ── Radial graph ─────────────────────────────────────────────────────────────
function EcosystemGraph({ reduced }: { reduced: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  const W = 360, H = 360, cx = W / 2, cy = H / 2, R = 132;
  const pos = ECOSYSTEM_NODES.map((n, i) => {
    const a = (i / ECOSYSTEM_NODES.length) * Math.PI * 2 - Math.PI / 2;
    return { ...n, x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R };
  });

  return (
    <div ref={ref} className="mt-6 rounded-2xl p-3 sm:p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="relative mx-auto" style={{ width: W, maxWidth: '100%', aspectRatio: `${W} / ${H}` }}>
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
          {/* Edges from center to each node */}
          {pos.map((n, i) => (
            <motion.line
              key={'e' + n.id}
              x1={cx} y1={cy} x2={n.x} y2={n.y}
              stroke={n.color} strokeOpacity="0.3" strokeWidth="1.5"
              initial={reduced ? false : { pathLength: 0, opacity: 0 }}
              animate={inView && !reduced ? { pathLength: 1, opacity: 1 } : undefined}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.06 }}
            />
          ))}
          {/* Center */}
          <circle cx={cx} cy={cy} r="30" fill={ACCENT + '22'} stroke={ACCENT} strokeOpacity="0.6" />
          <text x={cx} y={cy - 2} textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="700">UNICAP</text>
          <text x={cx} y={cy + 11} textAnchor="middle" fill={ACCENT} fontSize="8" fontWeight="600">экосистема</text>
          {/* Nodes */}
          {pos.map((n, i) => (
            <motion.g
              key={'n' + n.id}
              initial={reduced ? false : { scale: 0, opacity: 0 }}
              animate={inView && !reduced ? { scale: 1, opacity: 1 } : undefined}
              transition={{ duration: 0.4, delay: 0.25 + i * 0.07 }}
              style={{ transformOrigin: `${n.x}px ${n.y}px` }}
            >
              <circle cx={n.x} cy={n.y} r="13" fill={n.color} fillOpacity="0.9" stroke={n.color} style={{ filter: `drop-shadow(0 0 7px ${n.color})` }} />
              <text
                x={n.x}
                y={n.y > cy ? n.y + 26 : n.y - 20}
                textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="700"
                opacity="0.9"
              >
                {n.name}
              </text>
            </motion.g>
          ))}
        </svg>
      </div>
    </div>
  );
}

export default function EcosystemShowcase() {
  const reduced = useReduced();

  return (
    <div
      className="w-full max-w-3xl rounded-3xl p-5 sm:p-8"
      style={{
        background: 'rgba(6,15,28,0.6)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: `0 20px 80px rgba(0,0,0,0.55), 0 0 60px ${ACCENT}12`,
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
      }}
    >
      <div
        className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide"
        style={{ background: ACCENT + '18', color: ACCENT, border: `1px solid ${ACCENT}33` }}
      >
        <Sparkles size={12} /> Живая экосистема
      </div>
      <h2 className="mt-4 text-2xl font-bold leading-tight text-white sm:text-4xl">
        Вот вся экосистема UNICAP
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60 sm:text-base">
        Флагманы и слои связаны в единый организм вокруг общего центра. Сейчас
        погрузимся во флагман — воду и возрождение Арала.
      </p>

      <EcosystemGraph reduced={reduced} />

      {/* Card grid */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {ECOSYSTEM_NODES.map((n, i) => (
          <motion.div
            key={n.id}
            initial={reduced ? false : { opacity: 0, y: 16 }}
            whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
            className="flex h-full gap-3 rounded-2xl p-4"
            style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${n.color}33` }}
          >
            <div
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
              style={{ background: n.color + '1c', border: `1px solid ${n.color}44`, color: n.color }}
            >
              <NodeIcon name={n.icon} />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold leading-tight text-white">{n.name}</div>
              <p className="mt-1.5 text-xs leading-relaxed text-white/60">{n.tagline}</p>
              {n.note && (
                <span
                  className="mt-2 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase"
                  style={{ background: n.color + '22', color: n.color }}
                >
                  {n.note}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bridge seam → timelapse */}
      <div
        className="relative mt-6 overflow-hidden rounded-2xl p-5 sm:p-6"
        style={{ background: `linear-gradient(120deg, ${ACCENT}12, ${ACCENT_2}0e)`, border: `1px solid ${ACCENT}33` }}
      >
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full" style={{ background: ACCENT + '22', filter: 'blur(48px)' }} />
        <div className="relative flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Waves size={22} style={{ color: ACCENT }} />
            <p className="text-sm leading-relaxed text-white/75 sm:text-[15px]">
              Погружаемся во флагман — вода и Арал. Листайте вниз.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-white/45">
            <span className="text-[11px] font-semibold uppercase tracking-widest">Далее</span>
            <ArrowDown size={18} className="animate-bounce" style={{ color: ACCENT }} />
          </div>
        </div>
      </div>
    </div>
  );
}
