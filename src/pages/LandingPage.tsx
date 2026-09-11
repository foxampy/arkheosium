import { useRef, useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Map,
  Coins,
  Users,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  Droplets,
  ExternalLink,
  X,
} from 'lucide-react';
import TeamPartners from '@/components/TeamPartners';

// ─── Dev Progress Banner ──────────────────────────────────────────

const DEV_BANNER_KEY = 'vodprom_dev_banner_dismissed';

function DevProgressBanner() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!localStorage.getItem(DEV_BANNER_KEY)) setVisible(true);
  }, []);
  const dismiss = () => { localStorage.setItem(DEV_BANNER_KEY, '1'); setVisible(false); };
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -20, height: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="overflow-hidden"
        >
          <div className="relative flex items-center justify-between gap-3 px-4 py-2.5"
            style={{
              background: 'linear-gradient(90deg, rgba(245,158,11,0.18) 0%, rgba(0,230,200,0.18) 50%, rgba(245,158,11,0.18) 100%)',
              borderBottom: '1px solid rgba(245,158,11,0.25)',
            }}>
            <span className="w-2 h-2 rounded-full shrink-0 animate-pulse"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #00e6c8)' }} />
            <p className="flex-1 text-center text-xs font-semibold leading-snug" style={{ color: 'rgba(255,255,255,0.85)' }}>
              <span className="text-amber-400 font-black">🚧 Платформа разработана на 65%</span>
              <span className="text-white/50 mx-1.5">·</span>
              <span className="text-teal-300">Пресейл открыт</span>
              <span className="text-white/50 mx-1.5">·</span>
              <span className="text-white/70">Принять участие сейчас</span>
            </p>
            <button onClick={dismiss} aria-label="Закрыть"
              className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/15 transition-all"
              style={{ color: 'rgba(255,255,255,0.45)' }}>
              <X size={13} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────

const fadeUp = {
  hidden:  { opacity: 0, y: 28 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.55 } }),
};

// ─── Sub-components ───────────────────────────────────────────────

function FeatureCard({
  icon, title, desc, delay,
}: { icon: React.ReactNode; title: string; desc: string; delay: number }) {
  return (
    <motion.div
      variants={fadeUp}
      custom={delay}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 hover:border-[#00e6c8]/30 hover:bg-[#00e6c8]/5 transition-all group"
    >
      <div className="w-12 h-12 rounded-xl bg-[#00e6c8]/10 border border-[#00e6c8]/20 flex items-center justify-center text-[#00e6c8] mb-4 group-hover:bg-[#00e6c8]/20 transition-colors">
        {icon}
      </div>
      <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────

export default function LandingPage() {
  const [, navigate] = useLocation();
  const featuresRef = useRef<HTMLElement>(null);
  const [email, setEmail] = useState('');
  const { t } = useTranslation();

  function scrollToFeatures() {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className="min-h-screen text-gray-200 overflow-x-hidden">

      <DevProgressBanner />

      {/* TIIF Conference Banner */}
      <div className="relative overflow-hidden border-b border-[#00e6c8]/15"
        style={{ background: 'linear-gradient(90deg, rgba(0,102,255,0.12), rgba(0,230,200,0.08), rgba(167,139,250,0.10))' }}>
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 max-w-6xl mx-auto">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-lg shrink-0">🇺🇿</span>
            <p className="text-xs text-white/70 truncate">
              <span className="text-[#00e6c8] font-semibold">VODecology на TIIF 2026</span>
              <span className="text-white/30 mx-1.5">·</span>
              Tashkent International Investment Forum
              <span className="text-white/30 mx-1.5 hidden sm:inline">·</span>
              <span className="text-white/40 hidden sm:inline">Встречайтесь с нами в Ташкенте</span>
            </p>
          </div>
          <button
            onClick={() => navigate('/conference/tiif-2026')}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{ background: 'rgba(0,230,200,0.12)', border: '1px solid rgba(0,230,200,0.25)', color: '#00e6c8' }}>
            Подробнее →
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">

        {/* Animated gradient background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[#000818]" />
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: `
                radial-gradient(ellipse 80% 60% at 20% 40%, #003366 0%, transparent 60%),
                radial-gradient(ellipse 60% 50% at 80% 60%, #001a33 0%, transparent 55%),
                radial-gradient(ellipse 50% 40% at 50% 20%, #00332e 0%, transparent 50%)
              `,
              animation: 'gradientShift 14s ease-in-out infinite alternate',
            }}
          />
          {/* Water ripple rings */}
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="absolute rounded-full border border-[#00e6c8]/8 pointer-events-none"
              style={{
                width:  `${280 + i * 180}px`,
                height: `${280 + i * 180}px`,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                animation: `ripple ${4 + i * 1.2}s ease-out infinite`,
                animationDelay: `${i * 1.1}s`,
              }}
            />
          ))}
        </div>

        {/* CSS keyframes injected via style tag approach */}
        <style>{`
          @keyframes gradientShift {
            0%   { opacity: 0.25; }
            50%  { opacity: 0.40; }
            100% { opacity: 0.30; }
          }
          @keyframes ripple {
            0%   { transform: translate(-50%,-50%) scale(0.6); opacity: 0.5; }
            100% { transform: translate(-50%,-50%) scale(1.8); opacity: 0; }
          }
          @keyframes floatY {
            0%, 100% { transform: translateY(0px);  }
            50%       { transform: translateY(-8px); }
          }
        `}</style>

        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 mb-6"
          style={{ animation: 'floatY 5s ease-in-out infinite' }}
        >
          <div className="text-6xl md:text-7xl font-black tracking-tighter text-white select-none">
            <span style={{ color: '#00e6c8' }}>💧</span>
            {' '}VODPROM
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative z-10 text-xl md:text-2xl font-semibold text-[#00e6c8] mb-3"
        >
          {t('landing.hero.tagline')}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative z-10 text-base md:text-lg text-gray-400 mb-10 max-w-xl"
        >
          {t('landing.hero.description')}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative z-10 flex flex-col sm:flex-row gap-3"
        >
          <button
            onClick={() => navigate('/account')}
            className="px-7 py-3 rounded-xl bg-[#00e6c8] text-[#000818] font-bold text-sm hover:bg-[#00ffd9] transition-colors flex items-center gap-2"
          >
            {t('landing.hero.cta_login')}
            <ArrowRight size={15} />
          </button>
          <button
            onClick={scrollToFeatures}
            className="px-7 py-3 rounded-xl border border-white/20 text-gray-300 font-medium text-sm hover:border-[#00e6c8]/40 hover:text-white transition-colors flex items-center gap-2"
          >
            {t('landing.hero.cta_learn')}
            <ChevronDown size={15} />
          </button>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-gray-600 text-xs"
        >
          <ChevronDown size={18} className="animate-bounce" />
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════
          FEATURES
      ══════════════════════════════════════════════ */}
      <section ref={featuresRef} className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <div className="inline-flex items-center gap-2 text-xs text-[#00e6c8] bg-[#00e6c8]/10 border border-[#00e6c8]/20 rounded-full px-4 py-1.5 mb-4">
              <Droplets size={12} />
              {t('landing.features.badge')}
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">
              {t('landing.features.title')}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <FeatureCard
              icon={<Map size={22} />}
              title={t('landing.features.map.title')}
              desc={t('landing.features.map.desc')}
              delay={0}
            />
            <FeatureCard
              icon={<Coins size={22} />}
              title={t('landing.features.invest.title')}
              desc={t('landing.features.invest.desc')}
              delay={1}
            />
            <FeatureCard
              icon={<Users size={22} />}
              title={t('landing.features.network.title')}
              desc={t('landing.features.network.desc')}
              delay={2}
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          PROBLEM / SOLUTION
      ══════════════════════════════════════════════ */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent via-[#000d24]/60 to-transparent">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Problem */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-red-950/20 border border-red-500/20 rounded-2xl p-7"
          >
            <div className="flex items-center gap-3 mb-5">
              <AlertTriangle size={20} className="text-red-400" />
              <h3 className="text-lg font-bold text-red-300">{t('landing.problem.title')}</h3>
            </div>
            <ul className="space-y-3">
              {[
                t('landing.problem.item1'),
                t('landing.problem.item2'),
                t('landing.problem.item3'),
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-300 leading-relaxed">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Solution */}
          <motion.div
            variants={fadeUp}
            custom={1}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-[#00e6c8]/5 border border-[#00e6c8]/20 rounded-2xl p-7"
          >
            <div className="flex items-center gap-3 mb-5">
              <CheckCircle2 size={20} className="text-[#00e6c8]" />
              <h3 className="text-lg font-bold text-[#00e6c8]">{t('landing.solution.title')}</h3>
            </div>
            <ul className="space-y-3">
              {[
                t('landing.solution.item1'),
                t('landing.solution.item2'),
                t('landing.solution.item3'),
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-300 leading-relaxed">
                  <CheckCircle2 size={14} className="mt-0.5 text-[#00e6c8] flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          TOKEN SECTION
      ══════════════════════════════════════════════ */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="relative bg-gradient-to-br from-[#000d24] to-[#001a33] border border-[#00e6c8]/25 rounded-3xl p-8 overflow-hidden"
          >
            {/* Glow */}
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-[#00e6c8]/8 blur-3xl pointer-events-none" />

            <div className="flex items-center gap-3 mb-2">
              <Coins size={22} className="text-[#00e6c8]" />
              <h3 className="text-2xl font-extrabold text-white">VOD Token</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#00e6c8]/10 border border-[#00e6c8]/30 text-[#00e6c8]">
                {t('landing.token.presale_active')}
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-1">{t('landing.token.digital_asset')}</p>
            <div className="font-mono text-[#00e6c8] text-sm mb-6">
              {t('landing.token.formula')}
            </div>

            {/* Progress bar */}
            <div className="mb-6">
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>{t('landing.token.progress_label')}</span>
                <span className="text-[#00e6c8] font-mono font-semibold">23%</span>
              </div>
              <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: '23%' }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  viewport={{ once: true }}
                  className="h-full bg-gradient-to-r from-[#00e6c8] to-[#0099ff] rounded-full"
                />
              </div>
              <div className="flex justify-between text-xs text-gray-600 mt-1.5">
                <span>{t('landing.token.raised')}</span>
                <span>{t('landing.token.goal')}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/token-sale')}
              className="w-full py-3 rounded-xl bg-[#00e6c8] text-[#000818] font-bold hover:bg-[#00ffd9] transition-colors flex items-center justify-center gap-2"
            >
              {t('landing.token.buy')}
              <ArrowRight size={16} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          TEAM & PARTNERS
      ══════════════════════════════════════════════ */}
      <TeamPartners />

      {/* ══════════════════════════════════════════════
          PARTNERS STRIP
      ══════════════════════════════════════════════ */}
      <section className="py-14 px-4 border-y border-white/5">
        <div className="max-w-4xl mx-auto">
          {/*
            Здесь стояла полоса логотипов EBRD, World Bank, ADB, IT Park Uz и
            Plug and Play — как будто это партнёры платформы. Соглашений с ними
            нет, и полоса снята. Подключённых партнёров ноль, и число названо
            прямо: на первом экране особенно нельзя занимать доверие у чужих
            имён.
          */}
          <p className="text-center text-xs text-gray-600 uppercase tracking-widest mb-4">
            Партнёры
          </p>
          <p className="text-center text-sm text-gray-400 leading-relaxed max-w-xl mx-auto">
            Подключённых партнёров — <span className="text-gray-200 font-semibold">ноль</span>.
            Соглашений с международными институтами нет. Входы открыты по восьми сегментам,
            и как только появится подписанное соглашение, его можно будет назвать здесь.
          </p>
          <div className="flex justify-center mt-5">
            <a href="/partners" className="text-sm font-medium text-[#00e6c8] hover:underline">
              Партнёрские входы →
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════════════ */}
      <section className="py-28 px-4 text-center">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-lg mx-auto"
        >
          <div className="text-4xl mb-4 select-none">💧</div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
            {t('landing.final_cta.title')}
          </h2>
          <p className="text-gray-400 mb-8 text-sm leading-relaxed">
            {t('landing.final_cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
            <input
              type="email"
              placeholder={t('landing.final_cta.email_placeholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#00e6c8]/40 transition-colors"
            />
            <button
              onClick={() => navigate('/account')}
              className="px-5 py-3 rounded-xl bg-[#00e6c8] text-[#000818] font-bold text-sm hover:bg-[#00ffd9] transition-colors flex-shrink-0"
            >
              {t('landing.final_cta.get_access')}
            </button>
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════ */}
      <footer className="py-8 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm font-bold text-gray-500">
            <span className="text-[#00e6c8]">💧</span> {t('landing.footer.copyright')}
          </div>
          <nav className="flex flex-wrap justify-center gap-5 text-xs text-gray-600">
            {[
              { labelKey: 'landing.footer.platform',    href: '/' },
              { labelKey: 'landing.footer.whitepaper',  href: '/vod-whitepaper' },
              { labelKey: 'landing.footer.token',       href: '/token-sale' },
              { labelKey: 'landing.footer.contacts',    href: '/contacts' },
              { labelKey: 'landing.footer.privacy',     href: '/privacy' },
            ].map((link) => (
              <button
                key={link.labelKey}
                onClick={() => navigate(link.href)}
                className="hover:text-gray-300 transition-colors"
              >
                {t(link.labelKey)}
              </button>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}
