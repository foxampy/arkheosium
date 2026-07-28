import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { ReactLenis } from 'lenis/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { X, Droplets } from 'lucide-react';
import EcoGlobeStage from '@/components/eco/world-globe/EcoGlobeStage';
import OnboardingIntro from '@/components/eco/OnboardingIntro';
import EcosystemShowcase from '@/components/eco/EcosystemShowcase';

gsap.registerPlugin(ScrollTrigger);

const ACCENT_2 = '#00d4ff';

// The scrub is split: the first STORY_END fraction plays the 12 000-year
// timelapse (progress 0→1); the remaining tail keeps the SAME globe pinned but
// switches it to interactive "present day" mode (region markers + briefings).
const STORY_END = 0.82;
const INTERACTIVE_AT = 0.86;

export default function EcoJourneyPage() {
  const [, setLocation] = useLocation();
  const rootRef = useRef<HTMLDivElement>(null);

  const [entered, setEntered] = useState(false);

  // Timelapse scrub state.
  const [progress, setProgress] = useState(0); // 0..1 story progress
  const [interactive, setInteractive] = useState(false);

  // Skip button: while inside the journey it nudges instead of leaving.
  const [insideJourney, setInsideJourney] = useState(false);
  const [hint, setHint] = useState(false);
  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSkip = () => {
    if (insideJourney && !interactive) {
      setHint(true);
      if (hintTimer.current) clearTimeout(hintTimer.current);
      hintTimer.current = setTimeout(() => setHint(false), 3000);
      return;
    }
    setLocation('/');
  };

  useEffect(() => () => { if (hintTimer.current) clearTimeout(hintTimer.current); }, []);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      if (!reduce) {
        const scenes = gsap.utils.toArray<HTMLElement>('[data-scene]');
        scenes.forEach((scene) => {
          const content = scene.querySelector('[data-scene-content]');
          if (!content) return;
          gsap.fromTo(
            content,
            { autoAlpha: 0, y: 60 },
            {
              autoAlpha: 1, y: 0, ease: 'power2.out', duration: 1,
              scrollTrigger: {
                trigger: scene, start: 'top 70%', end: 'bottom 30%',
                toggleActions: 'play reverse play reverse',
              },
            },
          );
        });
      }

      const tl = rootRef.current?.querySelector('[data-timeline]');
      if (tl) {
        ScrollTrigger.create({
          trigger: tl as HTMLElement,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
          onUpdate: (self) => {
            const p = self.progress;
            setProgress(Math.min(1, p / STORY_END));
            setInteractive(p >= INTERACTIVE_AT);
          },
          onToggle: (self) => setInsideJourney(self.isActive),
        });
      }

      ScrollTrigger.refresh();
    }, rootRef);

    return () => ctx.revert();
  }, []);

  const placeholderScenes = [
    {
      Icon: Droplets,
      tag: 'Блок 3',
      title: 'История Арала',
      subtitle: 'Скоро',
      note: 'Путь возрождения Аральского моря.',
    },
  ];

  return (
    <div
      ref={rootRef}
      data-entered={entered ? 'true' : 'false'}
      className="relative w-full"
      style={{ background: 'radial-gradient(ellipse at 50% 35%, #020d1e 0%, #010810 100%)' }}
    >
      {/* ── Skip / close affordance ── */}
      <div className="fixed top-4 right-4 z-30 flex flex-col items-end gap-2">
        <button
          onClick={handleSkip}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full cursor-pointer transition-all active:scale-95"
          style={{
            background: 'rgba(5,13,26,0.75)',
            border: '1px solid rgba(0,200,230,0.18)',
            color: 'rgba(255,255,255,0.65)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <X size={14} />
          <span className="text-[11px] font-semibold tracking-tight">Пропустить</span>
        </button>

        {hint && (
          <div
            className="max-w-[220px] rounded-xl px-3 py-2 text-right text-[11px] font-medium leading-snug"
            style={{
              background: 'rgba(6,15,28,0.6)',
              border: `1px solid ${ACCENT_2}`,
              color: '#dff6ff',
              boxShadow: `0 0 18px ${ACCENT_2}66, 0 8px 24px rgba(0,0,0,0.4)`,
              backdropFilter: 'blur(22px)',
            }}
          >
            Закончите ознакомление и перейдём в этот блок сразу же
          </div>
        )}
      </div>

      {/* ── Foreground scroll content (Lenis drives the window scroll) ── */}
      <ReactLenis root>
        <div className="relative" style={{ zIndex: 10 }}>
          {/* Scene 0 — Onboarding */}
          <OnboardingIntro
            onComplete={() => {
              setEntered(true);
              document.querySelector('[data-timeline]')?.scrollIntoView({ behavior: 'smooth' });
            }}
          />

          {/* Living Ecosystem bridge */}
          <section
            data-scene
            className="relative flex min-h-screen w-full items-center justify-center px-6 py-16"
          >
            <div data-scene-content className="flex w-full justify-center">
              <EcosystemShowcase />
            </div>
          </section>

          {/* ── The journey — ONE globe: 12 000-year timelapse → live interactive ──
              Tall section provides scroll distance; the sticky child holds the
              single globe with information arranged AROUND it. */}
          <section data-timeline className="relative w-full" style={{ height: '660vh' }}>
            <div className="sticky top-0 h-screen w-full">
              <EcoGlobeStage
                progress={progress}
                interactive={interactive}
                onRequestNavigate={() => setLocation('/aral')}
              />
            </div>

            {/* Intro heading floats at the very top of the timelapse */}
            <div className="pointer-events-none absolute left-0 right-0 top-0 flex h-screen items-start justify-center px-6 pt-20">
              <div className="max-w-md text-center">
                <span
                  className="mb-3 inline-block rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em]"
                  style={{
                    color: '#7dd3fc',
                    background: 'rgba(125,211,252,0.12)',
                    border: '1px solid rgba(125,211,252,0.3)',
                  }}
                >
                  История воды · таймлапс
                </span>
                <h2 className="text-2xl font-black text-white sm:text-3xl">
                  Планета за 12 тысяч лет
                </h2>
                <p className="mt-2 text-sm text-white/50">
                  Листайте — льды отступают, реки рождаются, Арал высыхает у вас на глазах.
                </p>
              </div>
            </div>
          </section>

          {/* Placeholder scenes */}
          {placeholderScenes.map(({ Icon, tag, title, subtitle, note }) => (
            <section
              key={tag}
              data-scene
              className="relative flex min-h-screen w-full items-center justify-center px-6"
            >
              <div
                data-scene-content
                className="w-full max-w-xl rounded-3xl px-8 py-10 text-center"
                style={{
                  background: 'rgba(6,15,28,0.5)',
                  border: `1px solid ${ACCENT_2}22`,
                  boxShadow: `0 16px 60px rgba(0,0,0,0.5), 0 0 40px ${ACCENT_2}10`,
                  backdropFilter: 'blur(24px)',
                }}
              >
                <div
                  className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ background: `${ACCENT_2}16`, border: `1px solid ${ACCENT_2}38` }}
                >
                  <Icon size={22} style={{ color: ACCENT_2 }} />
                </div>

                <div
                  className="mb-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1"
                  style={{ background: `${ACCENT_2}14`, border: `1px solid ${ACCENT_2}33` }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: ACCENT_2, boxShadow: `0 0 6px ${ACCENT_2}` }}
                  />
                  <span className="text-[11px] font-semibold" style={{ color: ACCENT_2 }}>
                    {tag} · {subtitle}
                  </span>
                </div>

                <h2 className="mb-3 text-2xl font-bold text-white sm:text-3xl">{title}</h2>
                <p className="text-sm leading-relaxed text-white/50">{note}</p>
              </div>
            </section>
          ))}
        </div>
      </ReactLenis>
    </div>
  );
}
