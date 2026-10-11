import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { motion, useInView } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  AlertTriangle,
  Globe2,
  Building2,
  Coins,
  Users,
  BarChart3,
  FlaskConical,
  Map,
  ChevronDown,
  ArrowRight,
  Droplets,
  TrendingDown,
  Snowflake,
} from 'lucide-react';

// ─── Animated background blob ─────────────────────────────────────────────────
function Blob({
  x, y, size, color, duration, delay,
}: {
  x: number; y: number; size: number; color: string; duration: number; delay: number;
}) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        background: color,
        filter: 'blur(80px)',
        transform: 'translate(-50%, -50%)',
      }}
      animate={{
        scale: [1, 1.3, 0.9, 1.2, 1],
        x: [0, 30, -20, 15, 0],
        y: [0, -20, 25, -10, 0],
        opacity: [0.4, 0.7, 0.5, 0.8, 0.4],
      }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

// ─── Glass card ────────────────────────────────────────────────────────────────
function GlassCard({
  children, className = '', glow = false,
}: {
  children: React.ReactNode; className?: string; glow?: boolean;
}) {
  return (
    <div
      className={`relative rounded-2xl ${className}`}
      style={{
        background: 'rgba(0, 230, 200, 0.04)',
        border: '1px solid rgba(0, 230, 200, 0.18)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        boxShadow: glow
          ? '0 0 40px rgba(0,230,200,0.12), inset 0 1px 0 rgba(0,230,200,0.15)'
          : 'inset 0 1px 0 rgba(0,230,200,0.08)',
      }}
    >
      {children}
    </div>
  );
}

// ─── Nav dots ──────────────────────────────────────────────────────────────────
function NavDots({
  total, current, onDotClick,
}: {
  total: number; current: number; onDotClick: (i: number) => void;
}) {
  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          onClick={() => onDotClick(i)}
          className="relative w-3 h-3 rounded-full transition-all duration-300 focus:outline-none"
          style={{
            background: i === current
              ? '#00e6c8'
              : 'rgba(0,230,200,0.25)',
            boxShadow: i === current ? '0 0 10px rgba(0,230,200,0.7)' : 'none',
            transform: i === current ? 'scale(1.3)' : 'scale(1)',
          }}
        />
      ))}
    </div>
  );
}

// ─── Floating particles ────────────────────────────────────────────────────────
const PARTICLES = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  x: 10 + i * 11,
  size: 4 + (i % 3) * 4,
  duration: 6 + i * 1.2,
  delay: i * 0.7,
}));

// ─── Section wrapper with IntersectionObserver reporting ──────────────────────
function Section({
  id, children, onVisible,
}: {
  id: number; children: React.ReactNode; onVisible: (id: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { threshold: 0.5 });
  useEffect(() => { if (inView) onVisible(id); }, [inView, id, onVisible]);
  return (
    <div
      ref={ref}
      className="relative overflow-hidden"
      style={{ scrollSnapAlign: 'start', height: '100vh', minHeight: '100vh' }}
    >
      {children}
    </div>
  );
}

// ─── SECTION 1: Hero ──────────────────────────────────────────────────────────
function HeroSection() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  return (
    <div className="relative flex flex-col items-center justify-center h-full px-6 text-center">
      {/* Blobs */}
      <Blob x={20} y={30} size={400} color="radial-gradient(circle, rgba(0,230,200,0.18), transparent 70%)" duration={12} delay={0} />
      <Blob x={80} y={70} size={350} color="radial-gradient(circle, rgba(0,180,255,0.15), transparent 70%)" duration={15} delay={2} />
      <Blob x={50} y={50} size={500} color="radial-gradient(circle, rgba(0,110,255,0.1), transparent 70%)" duration={18} delay={4} />

      {/* Floating water particles */}
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            bottom: 0,
            width: p.size,
            height: p.size,
            background: 'rgba(0, 230, 200, 0.6)',
            boxShadow: `0 0 ${p.size * 2}px rgba(0,230,200,0.4)`,
          }}
          animate={{ y: [0, -window.innerHeight - 50], opacity: [0, 0.8, 0.8, 0] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'linear' }}
        />
      ))}

      {/* Logo + Title */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10"
      >
        <h1
          className="font-black tracking-tight leading-none mb-4"
          style={{
            fontSize: 'clamp(60px, 12vw, 140px)',
            background: 'linear-gradient(135deg, #00e6c8 0%, #00b4ff 50%, #006eff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 0 40px rgba(0,230,200,0.4))',
          }}
        >
          VODPROM
        </h1>
        <motion.p
          className="text-lg md:text-2xl text-white/70 max-w-2xl mx-auto leading-relaxed mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
        >
          {t('presentation.hero.subtitle')}
        </motion.p>

        {/* Stats row */}
        <motion.div
          className="flex flex-wrap justify-center gap-4 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.7 }}
        >
          {[
            { value: '36', label: t('presentation.hero.stat.stakeholders') },
            { value: '42', label: t('presentation.hero.stat.organizations') },
            { value: '260+', label: t('presentation.hero.stat.objects') },
          ].map((stat) => (
            <GlassCard key={stat.label} className="px-6 py-3 flex flex-col items-center">
              <span className="text-2xl font-bold" style={{ color: '#00e6c8' }}>{stat.value}</span>
              <span className="text-white/50 text-xs mt-0.5">{stat.label}</span>
            </GlassCard>
          ))}
        </motion.div>

        <motion.button
          onClick={() => setLocation('/')}
          className="px-8 py-4 rounded-full font-semibold text-base flex items-center gap-2 mx-auto transition-all"
          style={{
            background: 'linear-gradient(135deg, #00e6c8, #006eff)',
            color: '#000818',
            boxShadow: '0 0 30px rgba(0,230,200,0.4)',
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          whileHover={{ scale: 1.05, boxShadow: '0 0 50px rgba(0,230,200,0.6)' }}
          whileTap={{ scale: 0.97 }}
        >
          {t('presentation.hero.enter_platform')} <ArrowRight size={18} />
        </motion.button>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/30 flex flex-col items-center gap-1"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span className="text-xs tracking-widest uppercase">{t('presentation.hero.scroll')}</span>
        <ChevronDown size={16} />
      </motion.div>
    </div>
  );
}

// ─── SECTION 2: Water Crisis ───────────────────────────────────────────────────
function CrisisSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, threshold: 0.3 });
  const { t } = useTranslation();

  const cards = [
    { icon: <TrendingDown size={28} />, value: t('presentation.crisis.aral.value'), label: t('presentation.crisis.aral.label'), color: '#ff6b6b' },
    { icon: <Droplets size={28} />, value: t('presentation.crisis.deficit.value'), label: t('presentation.crisis.deficit.label'), color: '#00b4ff' },
    { icon: <Snowflake size={28} />, value: t('presentation.crisis.glaciers.value'), label: t('presentation.crisis.glaciers.label'), color: '#a78bfa' },
  ];

  return (
    <div className="relative flex flex-col items-center justify-center h-full px-6" ref={ref}>
      <Blob x={15} y={20} size={380} color="radial-gradient(circle, rgba(255,107,107,0.08), transparent 70%)" duration={14} delay={1} />
      <Blob x={85} y={80} size={320} color="radial-gradient(circle, rgba(0,180,255,0.1), transparent 70%)" duration={11} delay={3} />

      <motion.div
        className="relative z-10 max-w-4xl w-full"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="flex items-center gap-3 justify-center mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1 }}
        >
          <AlertTriangle size={32} style={{ color: '#ffb347' }} />
          <h2 className="text-3xl md:text-5xl font-bold text-white">{t('presentation.crisis.title')}</h2>
        </motion.div>

        <motion.p
          className="text-white/50 text-center mb-10 text-lg"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.2 }}
        >
          {t('presentation.crisis.subtitle')}
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {cards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.15 }}
            >
              <GlassCard className="p-6 text-center" glow>
                <div className="mb-3 flex justify-center" style={{ color: card.color }}>{card.icon}</div>
                <div className="text-3xl font-black mb-2" style={{ color: card.color }}>{card.value}</div>
                <div className="text-white/60 text-sm leading-snug">{card.label}</div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Animated SVG water level line */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.7 }}
        >
          <GlassCard className="p-5">
            <p className="text-white/40 text-xs mb-3 uppercase tracking-widest">{t('presentation.crisis.chart.label')}</p>
            <svg viewBox="0 0 500 80" className="w-full" style={{ height: 80 }}>
              <defs>
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#00e6c8" />
                  <stop offset="100%" stopColor="#ff6b6b" />
                </linearGradient>
              </defs>
              <motion.path
                d="M0,10 C80,12 120,15 180,28 C240,42 290,55 360,65 C420,72 460,75 500,76"
                fill="none"
                stroke="url(#lineGrad)"
                strokeWidth="2.5"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={inView ? { pathLength: 1 } : {}}
                transition={{ delay: 0.9, duration: 1.5, ease: 'easeInOut' }}
              />
              <text x="4" y="8" fill="rgba(0,230,200,0.6)" fontSize="8">1960</text>
              <text x="458" y="75" fill="rgba(255,107,107,0.7)" fontSize="8">2025</text>
            </svg>
          </GlassCard>
        </motion.div>

        <motion.p
          className="text-center text-white/60 text-base md:text-lg leading-relaxed"
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1.1 }}
        >
          <span style={{ color: '#00e6c8', fontWeight: 700 }}>VODPROM</span>{' '}
          {t('presentation.crisis.vodprom_description')}
        </motion.p>
      </motion.div>
    </div>
  );
}

// ─── SECTION 3: Platform Modules ──────────────────────────────────────────────
function PlatformSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, threshold: 0.2 });
  const { t } = useTranslation();

  const modules = [
    { icon: <Map size={24} />, title: t('presentation.platform.map.title'), desc: t('presentation.platform.map.desc'), color: '#00e6c8' },
    { icon: <Building2 size={24} />, title: t('presentation.platform.hub.title'), desc: t('presentation.platform.hub.desc'), color: '#00b4ff' },
    { icon: <Coins size={24} />, title: t('presentation.platform.invest.title'), desc: t('presentation.platform.invest.desc'), color: '#a78bfa' },
    { icon: <Users size={24} />, title: t('presentation.platform.contacts.title'), desc: t('presentation.platform.contacts.desc'), color: '#fbbf24' },
    { icon: <BarChart3 size={24} />, title: t('presentation.platform.dashboard.title'), desc: t('presentation.platform.dashboard.desc'), color: '#34d399' },
    { icon: <FlaskConical size={24} />, title: t('presentation.platform.rd.title'), desc: t('presentation.platform.rd.desc'), color: '#f472b6' },
  ];

  return (
    <div className="relative flex flex-col items-center justify-center h-full px-6" ref={ref}>
      <Blob x={50} y={20} size={500} color="radial-gradient(circle, rgba(0,110,255,0.1), transparent 70%)" duration={16} delay={0} />
      <Blob x={10} y={80} size={300} color="radial-gradient(circle, rgba(0,230,200,0.08), transparent 70%)" duration={12} delay={2} />

      <div className="relative z-10 max-w-5xl w-full">
        <motion.h2
          className="text-3xl md:text-5xl font-bold text-white text-center mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1 }}
        >
          {t('presentation.platform.title')}{' '}
          <span style={{
            background: 'linear-gradient(90deg, #00e6c8, #006eff)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>{t('presentation.platform.title_highlight')}</span>
        </motion.h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {modules.map((mod, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ delay: 0.15 + i * 0.1 }}
              whileHover={{ scale: 1.03 }}
            >
              <GlassCard
                className="p-5 h-full transition-all duration-300 cursor-default"
                glow
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: `${mod.color}18`, border: `1px solid ${mod.color}30` }}
                >
                  <span style={{ color: mod.color }}>{mod.icon}</span>
                </div>
                <h3 className="font-semibold text-white text-sm mb-1">{mod.title}</h3>
                <p className="text-white/45 text-xs leading-relaxed">{mod.desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── SECTION 4: VOD Token ─────────────────────────────────────────────────────
function TokenSection() {
  const [, setLocation] = useLocation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, threshold: 0.3 });
  const { t } = useTranslation();

  const stages = [
    { label: 'Stage 1', price: '$0.20', active: true },
    { label: 'Stage 2', price: '$0.40', active: false },
    { label: 'Stage 3', price: '$0.80', active: false },
    { label: 'Stage 4', price: '$1.20', active: false },
  ];

  return (
    <div className="relative flex flex-col items-center justify-center h-full px-6" ref={ref}>
      <Blob x={30} y={50} size={450} color="radial-gradient(circle, rgba(167,139,250,0.1), transparent 70%)" duration={13} delay={1} />
      <Blob x={75} y={25} size={300} color="radial-gradient(circle, rgba(0,230,200,0.1), transparent 70%)" duration={10} delay={3} />

      <div className="relative z-10 max-w-2xl w-full">
        <motion.h2
          className="text-3xl md:text-5xl font-bold text-white text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1 }}
        >
          {t('presentation.token.title')}{' '}
          <span style={{
            background: 'linear-gradient(90deg, #00e6c8, #a78bfa)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>{t('presentation.token.title_highlight')}</span>
        </motion.h2>

        {/* Main card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.2 }}
        >
          <GlassCard className="p-8 text-center mb-6" glow>
            <div className="text-5xl font-black mb-2" style={{
              background: 'linear-gradient(135deg, #00e6c8, #006eff)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              {t('presentation.token.value')}
            </div>
            <p className="text-white/50 text-lg">{t('presentation.token.value_of')}</p>
            <p className="text-white/30 text-sm mt-2">{t('presentation.token.total_supply')}</p>
          </GlassCard>
        </motion.div>

        {/* Presale stages timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.35 }}
        >
          <GlassCard className="p-6 mb-6">
            <p className="text-white/40 text-xs uppercase tracking-widest mb-5">{t('presentation.token.presale_stages')}</p>
            <div className="relative flex items-center justify-between">
              <div
                className="absolute top-4 left-0 right-0 h-px"
                style={{ background: 'rgba(0,230,200,0.2)' }}
              />
              <motion.div
                className="absolute top-4 left-0 h-px"
                style={{ background: 'linear-gradient(90deg, #00e6c8, #006eff)', width: '25%' }}
                initial={{ scaleX: 0, transformOrigin: 'left' }}
                animate={inView ? { scaleX: 1 } : {}}
                transition={{ delay: 0.6, duration: 0.8 }}
              />
              {stages.map((stage, i) => (
                <div key={i} className="relative flex flex-col items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 transition-all"
                    style={{
                      background: stage.active
                        ? 'linear-gradient(135deg, #00e6c8, #006eff)'
                        : 'rgba(0,230,200,0.1)',
                      border: stage.active ? 'none' : '1px solid rgba(0,230,200,0.25)',
                      color: stage.active ? '#000818' : 'rgba(255,255,255,0.5)',
                      boxShadow: stage.active ? '0 0 15px rgba(0,230,200,0.5)' : 'none',
                    }}
                  >
                    {i + 1}
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-white/40">{stage.label}</p>
                    <p className="text-sm font-bold" style={{ color: stage.active ? '#00e6c8' : 'rgba(255,255,255,0.5)' }}>
                      {stage.price}
                    </p>
                    {stage.active && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,230,200,0.15)', color: '#00e6c8' }}>{t('presentation.token.stage_now')}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        <motion.button
          onClick={() => setLocation('/invest')}
          className="w-full py-4 rounded-full font-semibold text-base transition-all"
          style={{
            background: 'linear-gradient(135deg, rgba(0,230,200,0.15), rgba(0,110,255,0.15))',
            border: '1px solid rgba(0,230,200,0.4)',
            color: '#00e6c8',
            backdropFilter: 'blur(20px)',
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5 }}
          whileHover={{
            background: 'linear-gradient(135deg, rgba(0,230,200,0.25), rgba(0,110,255,0.25))',
            boxShadow: '0 0 30px rgba(0,230,200,0.3)',
          }}
          whileTap={{ scale: 0.98 }}
        >
          {t('presentation.token.join_presale')}
        </motion.button>
      </div>
    </div>
  );
}

// ─── SECTION 5: Partners ──────────────────────────────────────────────────────
function PartnersSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, threshold: 0.2 });
  const { t } = useTranslation();

  const partners = [
    { name: 'EBRD', desc: 'European Bank' },
    { name: 'World Bank', desc: 'International' },
    { name: 'ADB', desc: 'Asian Dev Bank' },
    { name: 'JICA', desc: 'Japan Intl Coop' },
    { name: 'EIB', desc: 'European Invest' },
    { name: 'DFC USA', desc: 'US Dev Finance' },
    { name: 'Korea Eximbank', desc: 'Korean Export' },
    { name: 'IT Park UZ', desc: 'Uzbekistan' },
    { name: 'Plug and Play', desc: 'Silicon Valley' },
  ];

  return (
    <div className="relative flex flex-col items-center justify-center h-full px-6" ref={ref}>
      <Blob x={80} y={30} size={400} color="radial-gradient(circle, rgba(251,191,36,0.07), transparent 70%)" duration={14} delay={0} />
      <Blob x={20} y={70} size={350} color="radial-gradient(circle, rgba(0,230,200,0.08), transparent 70%)" duration={11} delay={2} />

      <div className="relative z-10 max-w-4xl w-full">
        <motion.div
          className="flex items-center gap-3 justify-center mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1 }}
        >
          <Globe2 size={30} style={{ color: '#00e6c8' }} />
          <h2 className="text-3xl md:text-5xl font-bold text-white">{t('presentation.partners.title')}</h2>
        </motion.div>

        <motion.div
          className="grid grid-cols-3 gap-3 mb-8"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.2 }}
        >
          {partners.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.15 + i * 0.07 }}
              whileHover={{ scale: 1.04 }}
            >
              <GlassCard className="p-4 text-center cursor-default">
                <p className="font-bold text-white text-sm">{p.name}</p>
                <p className="text-white/35 text-xs mt-0.5">{p.desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8 }}
        >
          <GlassCard className="p-5 text-center" glow>
            <p className="text-white/50 text-sm leading-relaxed">
              <span className="text-2xl font-black" style={{ color: '#00e6c8' }}>{t('presentation.partners.invested')}</span>
              <br />
              {t('presentation.partners.invested_desc')}
              <span className="text-white/30"> {t('presentation.partners.invested_source')}</span>
            </p>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}

// ─── SECTION 6: CTA ───────────────────────────────────────────────────────────
function CTASection() {
  const [, setLocation] = useLocation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, threshold: 0.3 });
  const { t } = useTranslation();

  return (
    <div className="relative flex flex-col items-center justify-center h-full px-6 text-center" ref={ref}>
      <Blob x={50} y={50} size={600} color="radial-gradient(circle, rgba(0,230,200,0.12), transparent 70%)" duration={15} delay={0} />
      <Blob x={20} y={20} size={300} color="radial-gradient(circle, rgba(0,110,255,0.1), transparent 70%)" duration={12} delay={2} />
      <Blob x={80} y={80} size={300} color="radial-gradient(circle, rgba(167,139,250,0.08), transparent 70%)" duration={10} delay={4} />

      <div className="relative z-10 max-w-xl w-full">
        <motion.h2
          className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight"
          initial={{ opacity: 0, y: -30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1 }}
        >
          {t('presentation.cta.title')}<br />{t('presentation.cta.title2')}{' '}
          <span style={{
            background: 'linear-gradient(135deg, #00e6c8, #006eff)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>{t('presentation.cta.title_highlight')}</span>
        </motion.h2>

        <motion.p
          className="text-white/50 text-lg mb-10"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.25 }}
        >
          {t('presentation.cta.subtitle')}
        </motion.p>

        {/* QR Code */}
        <motion.div
          className="flex justify-center mb-10"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.35, type: 'spring', stiffness: 100 }}
        >
          <GlassCard className="p-4 inline-block" glow>
            <img
              src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://vodprom.vercel.app&bgcolor=000818&color=00e6c8"
              alt="QR Code"
              className="w-36 h-36 rounded-xl"
              style={{ imageRendering: 'pixelated' }}
            />
            <p className="text-white/30 text-xs mt-2">vodprom.vercel.app</p>
          </GlassCard>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5 }}
        >
          <motion.button
            onClick={() => setLocation('/')}
            className="px-8 py-4 rounded-full font-semibold text-base flex items-center justify-center gap-2 transition-all"
            style={{
              background: 'linear-gradient(135deg, #00e6c8, #006eff)',
              color: '#000818',
              boxShadow: '0 0 30px rgba(0,230,200,0.4)',
            }}
            whileHover={{ scale: 1.05, boxShadow: '0 0 50px rgba(0,230,200,0.6)' }}
            whileTap={{ scale: 0.97 }}
          >
            {t('presentation.cta.open_platform')} <ArrowRight size={18} />
          </motion.button>

          <motion.button
            onClick={() => setLocation('/whitepaper')}
            className="px-8 py-4 rounded-full font-semibold text-base transition-all"
            style={{
              background: 'rgba(0,230,200,0.08)',
              border: '1px solid rgba(0,230,200,0.35)',
              color: '#00e6c8',
              backdropFilter: 'blur(20px)',
            }}
            whileHover={{
              background: 'rgba(0,230,200,0.15)',
              boxShadow: '0 0 25px rgba(0,230,200,0.25)',
            }}
            whileTap={{ scale: 0.97 }}
          >
            {t('presentation.cta.download_whitepaper')}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}

// ─── ROOT COMPONENT ────────────────────────────────────────────────────────────
export default function PresentationPage() {
  const [currentSection, setCurrentSection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollTo = (index: number) => {
    const container = containerRef.current;
    if (!container) return;
    const sections = container.querySelectorAll('[data-section]');
    sections[index]?.scrollIntoView({ behavior: 'smooth' });
  };

  const sections = [
    <HeroSection key="hero" />,
    <CrisisSection key="crisis" />,
    <PlatformSection key="platform" />,
    <TokenSection key="token" />,
    <PartnersSection key="partners" />,
    <CTASection key="cta" />,
  ];

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{
        background: '#000818',
        overflowY: 'scroll',
        scrollSnapType: 'y mandatory',
        height: '100vh',
      }}
    >
      {sections.map((sectionContent, i) => (
        <div key={i} data-section={i}>
          <Section id={i} onVisible={setCurrentSection}>
            {sectionContent}
          </Section>
        </div>
      ))}

      <NavDots total={sections.length} current={currentSection} onDotClick={scrollTo} />
    </div>
  );
}
