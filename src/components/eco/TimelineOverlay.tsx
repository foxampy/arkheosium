// TimelineOverlay — presentational, scroll-progress-driven UI for the Block-1
// onboarding timelapse. The parent (EcoJourneyPage) computes `progress` (0..1)
// from a GSAP ScrollTrigger scrub and passes it here; this component renders the
// bottom scrubber (era ticks + current year) and the active phase info-card.
import { AnimatePresence, motion } from 'framer-motion';
import {
  Snowflake,
  Waves,
  Factory,
  Sprout,
  Wind,
  Droplet,
  CloudOff,
  type LucideIcon,
} from 'lucide-react';
import type { EcoPhase } from '@/data/eco-timeline';

const ICONS: Record<string, LucideIcon> = {
  Snowflake,
  Waves,
  Factory,
  Sprout,
  Wind,
  Droplet,
  CloudOff,
};

interface TimelineOverlayProps {
  phases: EcoPhase[];
  /** Scrub progress across the whole timelapse, 0..1. */
  progress: number;
  /** Index of the phase whose card is currently shown. */
  activeIndex: number;
  /** Whether the overlay is visible at all (Block-1 section in view). */
  visible: boolean;
}

export default function TimelineOverlay({
  phases,
  progress,
  activeIndex,
  visible,
}: TimelineOverlayProps) {
  const active = phases[Math.max(0, Math.min(phases.length - 1, activeIndex))];
  const ActiveIcon = ICONS[active.icon] ?? Droplet;
  const pct = Math.max(0, Math.min(1, progress)) * 100;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-20 transition-opacity duration-500"
      style={{ opacity: visible ? 1 : 0 }}
      aria-hidden={!visible}
    >
      {/* ── Active phase info-card (top-left on desktop, top on mobile) ── */}
      <div className="absolute left-0 right-0 top-16 flex justify-center px-5 sm:left-8 sm:right-auto sm:top-24 sm:justify-start">
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -18, filter: 'blur(6px)' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-sm rounded-2xl p-5"
            style={{
              background: 'rgba(6,15,28,0.62)',
              border: `1px solid ${active.accent}33`,
              boxShadow: `0 18px 60px rgba(0,0,0,0.5), 0 0 44px ${active.accent}1a`,
              backdropFilter: 'blur(22px)',
            }}
          >
            <div className="mb-3 flex items-center gap-3">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                style={{ background: `${active.accent}1f`, border: `1px solid ${active.accent}55` }}
              >
                <ActiveIcon size={22} style={{ color: active.accent }} />
              </div>
              <div className="min-w-0">
                <div
                  className="text-[11px] font-bold uppercase tracking-[0.18em]"
                  style={{ color: active.accent }}
                >
                  {active.year}
                </div>
                <h3 className="truncate text-lg font-bold leading-tight text-white">
                  {active.title}
                </h3>
              </div>
            </div>
            <p className="text-[13px] leading-relaxed text-white/65">{active.body}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Bottom scrubber ── */}
      <div className="absolute bottom-6 left-1/2 w-[min(92vw,720px)] -translate-x-1/2 sm:bottom-8">
        {/* Big current year */}
        <div className="mb-2 flex items-end justify-between">
          <span
            className="text-2xl font-black tabular-nums tracking-tight sm:text-3xl"
            style={{ color: active.accent, textShadow: `0 0 24px ${active.accent}55` }}
          >
            {active.year}
          </span>
          <span className="pb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
            История воды
          </span>
        </div>

        {/* Track */}
        <div
          className="relative h-1.5 w-full rounded-full"
          style={{ background: 'rgba(255,255,255,0.10)' }}
        >
          <div
            className="absolute left-0 top-0 h-full rounded-full"
            style={{
              width: `${pct}%`,
              background: `linear-gradient(90deg, #7dd3fc, ${active.accent})`,
              boxShadow: `0 0 14px ${active.accent}88`,
              transition: 'width 0.15s linear',
            }}
          />
          {/* Era ticks */}
          {phases.map((ph, i) => (
            <div
              key={ph.id}
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${ph.t * 100}%` }}
            >
              <div
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === activeIndex ? 12 : 8,
                  height: i === activeIndex ? 12 : 8,
                  background: i <= activeIndex ? ph.accent : 'rgba(255,255,255,0.25)',
                  boxShadow: i === activeIndex ? `0 0 12px ${ph.accent}` : 'none',
                  border: '1.5px solid rgba(2,10,20,0.85)',
                }}
              />
            </div>
          ))}
        </div>

        {/* Era labels */}
        <div className="relative mt-2 hidden h-3 sm:block">
          {phases.map((ph, i) => (
            <span
              key={ph.id}
              className="absolute -translate-x-1/2 text-[9px] font-semibold tabular-nums transition-colors duration-300"
              style={{
                left: `${ph.t * 100}%`,
                color: i === activeIndex ? ph.accent : 'rgba(255,255,255,0.35)',
              }}
            >
              {ph.year}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
