import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps {
  onComplete: () => void;
}

/* ── Hexagonal grid generator ─────────────────────────────── */
function generateHexGrid(cols: number, rows: number, size: number) {
  const points: { x: number; y: number }[] = [];
  const hGap = size * 1.8;
  const vGap = size * 1.56;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const offsetX = row % 2 === 1 ? hGap / 2 : 0;
      points.push({ x: col * hGap + offsetX, y: row * vGap });
    }
  }
  return points;
}

/* ── Particle config ──────────────────────────────────────── */
function generateParticles(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1.5,
    duration: Math.random() * 10 + 12,
    delay: Math.random() * 6,
    opacity: Math.random() * 0.3 + 0.1,
    // ~30% violet particles for AI/Graph modules
    violet: i % 3 === 0,
  }));
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [phase, setPhase] = useState<'intro' | 'done'>('intro');

  const hexPoints = useMemo(() => generateHexGrid(14, 10, 50), []);
  const particles = useMemo(() => generateParticles(30), []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPhase('done');
      onComplete();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          className="fixed inset-0 z-[10000] flex items-center justify-center overflow-hidden"
          style={{ background: '#000c20' }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        >
          {/* ── Background layers ────────────────────────── */}
          <div className="absolute inset-0">

            {/* Radial glow center */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse at 50% 50%, rgba(0,180,220,0.07) 0%, rgba(0,60,120,0.03) 40%, transparent 70%)',
              }}
            />

            {/* Hexagonal cosmic grid (SVG) */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 1200 800"
              preserveAspectRatio="xMidYMid slice"
              style={{ opacity: 0.25 }}
            >
              <defs>
                <radialGradient id="hex-fade" cx="50%" cy="50%" r="55%">
                  <stop offset="0%" stopColor="white" stopOpacity="1" />
                  <stop offset="100%" stopColor="white" stopOpacity="0" />
                </radialGradient>
                <mask id="hex-mask">
                  <rect width="1200" height="800" fill="url(#hex-fade)" />
                </mask>
              </defs>
              <g mask="url(#hex-mask)">
                {/* Lines between adjacent dots */}
                {hexPoints.map((p, i) =>
                  hexPoints.slice(i + 1).map((q, j) => {
                    const dist = Math.hypot(p.x - q.x, p.y - q.y);
                    if (dist < 95) {
                      return (
                        <line
                          key={`l-${i}-${j}`}
                          x1={p.x}
                          y1={p.y}
                          x2={q.x}
                          y2={q.y}
                          stroke="rgba(0,200,230,0.15)"
                          strokeWidth="0.5"
                        />
                      );
                    }
                    return null;
                  })
                )}
                {/* Dots at intersections */}
                {hexPoints.map((p, i) => (
                  <circle
                    key={`d-${i}`}
                    cx={p.x}
                    cy={p.y}
                    r="1.5"
                    fill="rgba(0,200,230,0.3)"
                  >
                    <animate
                      attributeName="opacity"
                      values="0.15;0.5;0.15"
                      dur={`${3 + (i % 5)}s`}
                      repeatCount="indefinite"
                      begin={`${(i % 7) * 0.4}s`}
                    />
                  </circle>
                ))}
              </g>
            </svg>

            {/* Flowing wave lines (CSS + SVG) */}
            <svg
              className="absolute inset-0 w-full h-full splash-waves"
              viewBox="0 0 1440 900"
              preserveAspectRatio="none"
              style={{ opacity: 0.4 }}
            >
              <defs>
                <linearGradient id="waveGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="transparent" />
                  <stop offset="30%" stopColor="rgba(0,220,240,0.4)" />
                  <stop offset="70%" stopColor="rgba(0,180,210,0.3)" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
                <linearGradient id="waveGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="transparent" />
                  <stop offset="40%" stopColor="rgba(0,160,255,0.25)" />
                  <stop offset="60%" stopColor="rgba(0,200,230,0.2)" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
                <linearGradient id="waveGrad3" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="transparent" />
                  <stop offset="25%" stopColor="rgba(0,230,200,0.15)" />
                  <stop offset="75%" stopColor="rgba(0,180,240,0.12)" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
              {/* Wave 1 */}
              <path
                className="splash-wave-1"
                d="M-100,450 C200,350 400,550 720,420 C1040,290 1240,500 1540,400"
                fill="none"
                stroke="url(#waveGrad1)"
                strokeWidth="1"
              />
              {/* Wave 2 */}
              <path
                className="splash-wave-2"
                d="M-100,500 C300,600 500,380 800,500 C1100,620 1300,400 1540,480"
                fill="none"
                stroke="url(#waveGrad2)"
                strokeWidth="0.8"
              />
              {/* Wave 3 */}
              <path
                className="splash-wave-3"
                d="M-100,400 C250,300 550,500 850,370 C1150,240 1350,450 1540,350"
                fill="none"
                stroke="url(#waveGrad3)"
                strokeWidth="0.6"
              />
              {/* Wave 4 — subtle top */}
              <path
                className="splash-wave-4"
                d="M-100,300 C350,220 650,380 950,280 C1250,180 1400,320 1540,260"
                fill="none"
                stroke="url(#waveGrad3)"
                strokeWidth="0.5"
              />
            </svg>

            {/* Floating particles — cyan (infra) + violet (AI) */}
            {particles.map((p) => (
              <div
                key={p.id}
                className="absolute rounded-full splash-particle"
                style={{
                  width: p.size,
                  height: p.size,
                  left: `${p.x}%`,
                  bottom: `-${p.size}px`,
                  background: p.violet
                    ? `rgba(124, 58, 237, ${p.opacity})`
                    : `rgba(0, 210, 240, ${p.opacity})`,
                  boxShadow: p.violet
                    ? `0 0 ${p.size * 2}px rgba(124,58,237,${p.opacity * 0.5})`
                    : `0 0 ${p.size * 2}px rgba(0,210,240,${p.opacity * 0.5})`,
                  animationDuration: `${p.duration}s`,
                  animationDelay: `${p.delay}s`,
                }}
              />
            ))}

            {/* Corner vignette */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(0,12,32,0.6) 100%)',
              }}
            />
          </div>

          {/* ── Content (centered) ───────────────────────── */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Logo image */}
            <motion.img
              src="/logo.png"
              alt="ARKHEOSIUM"
              className="w-20 h-20 mb-5"
              style={{
                filter: 'brightness(0) invert(1) sepia(1) saturate(2) hue-rotate(185deg)',
              }}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            />

            {/* Brand name */}
            <motion.h1
              className="text-[32px] font-bold text-white tracking-[0.25em] mb-3"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
            >
              ARKHEOSIUM
            </motion.h1>

            {/* Tagline */}
            <motion.p
              className="text-white/60 text-sm text-center max-w-xs leading-relaxed tracking-wider"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6, ease: 'easeOut' }}
            >
              Planetary Infrastructure Intelligence OS
            </motion.p>

            {/* Motivational text */}
            <motion.p
              className="text-white/40 text-xs text-center max-w-[280px] leading-relaxed mt-5 whitespace-pre-line"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0, duration: 0.8, ease: 'easeOut' }}
            >
              {'Цифровая основа следующего этапа\nразвития цивилизации.'}
            </motion.p>
          </div>

          {/* ── Inline CSS animations ────────────────────── */}
          <style>{`
            /* Wave flowing animation */
            .splash-wave-1 {
              animation: waveFlow1 8s ease-in-out infinite;
            }
            .splash-wave-2 {
              animation: waveFlow2 10s ease-in-out infinite;
            }
            .splash-wave-3 {
              animation: waveFlow3 12s ease-in-out infinite;
            }
            .splash-wave-4 {
              animation: waveFlow4 14s ease-in-out infinite;
            }

            @keyframes waveFlow1 {
              0%   { d: path("M-100,450 C200,350 400,550 720,420 C1040,290 1240,500 1540,400"); }
              50%  { d: path("M-100,430 C200,530 400,330 720,460 C1040,590 1240,380 1540,440"); }
              100% { d: path("M-100,450 C200,350 400,550 720,420 C1040,290 1240,500 1540,400"); }
            }
            @keyframes waveFlow2 {
              0%   { d: path("M-100,500 C300,600 500,380 800,500 C1100,620 1300,400 1540,480"); }
              50%  { d: path("M-100,520 C300,400 500,600 800,470 C1100,340 1300,560 1540,500"); }
              100% { d: path("M-100,500 C300,600 500,380 800,500 C1100,620 1300,400 1540,480"); }
            }
            @keyframes waveFlow3 {
              0%   { d: path("M-100,400 C250,300 550,500 850,370 C1150,240 1350,450 1540,350"); }
              50%  { d: path("M-100,380 C250,480 550,300 850,420 C1150,540 1350,330 1540,390"); }
              100% { d: path("M-100,400 C250,300 550,500 850,370 C1150,240 1350,450 1540,350"); }
            }
            @keyframes waveFlow4 {
              0%   { d: path("M-100,300 C350,220 650,380 950,280 C1250,180 1400,320 1540,260"); }
              50%  { d: path("M-100,320 C350,400 650,240 950,340 C1250,440 1400,260 1540,300"); }
              100% { d: path("M-100,300 C350,220 650,380 950,280 C1250,180 1400,320 1540,260"); }
            }

            /* Particles rising upward */
            .splash-particle {
              animation: particleRise linear infinite;
            }
            @keyframes particleRise {
              0% {
                transform: translateY(0) translateX(0);
                opacity: 0;
              }
              10% {
                opacity: 1;
              }
              90% {
                opacity: 1;
              }
              100% {
                transform: translateY(-110vh) translateX(${20}px);
                opacity: 0;
              }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
