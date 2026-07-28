import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Play,
  Droplets,
  Map,
  Cpu,
  Vote,
  Share2,
  ShieldCheck,
  Sparkles,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Quote,
} from 'lucide-react';

// ─── Animation helpers ────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.55, ease: 'easeOut' as const },
  }),
};

// ─── Count-up hook ────────────────────────────────────────────────

function useCountUp(target: number, active: boolean, duration = 1400) {
  const [value, setValue] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (!active || started.current) return;
    started.current = true;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(eased * target));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target, duration]);
  return value;
}

function StatItem({
  value,
  suffix,
  label,
  prefix,
  active,
  delay,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  active: boolean;
  delay: number;
}) {
  const count = useCountUp(value, active);
  return (
    <motion.div
      variants={fadeUp}
      custom={delay}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="text-center"
    >
      <div className="text-3xl md:text-4xl font-black tracking-tight text-white">
        {prefix && <span className="text-white/40 text-xl mr-1">{prefix}</span>}
        <span style={{ color: '#00e6c8' }}>{count.toLocaleString('ru-RU')}</span>
        {suffix && <span className="text-[#00d4ff]">{suffix}</span>}
      </div>
      <div className="mt-1.5 text-xs uppercase tracking-widest text-gray-500">{label}</div>
    </motion.div>
  );
}

// ─── Benefit card ─────────────────────────────────────────────────

function BenefitCard({
  icon,
  title,
  desc,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  delay: number;
}) {
  return (
    <motion.div
      variants={fadeUp}
      custom={delay}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="group rounded-2xl p-6 transition-colors"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-[#00e6c8] transition-colors group-hover:text-[#00d4ff]"
        style={{ background: 'rgba(0,230,200,0.10)', border: '1px solid rgba(0,230,200,0.20)' }}>
        {icon}
      </div>
      <h3 className="text-white font-bold text-base mb-2">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
    </motion.div>
  );
}

// ─── FAQ item ─────────────────────────────────────────────────────

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="rounded-2xl overflow-hidden transition-colors"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${open ? 'rgba(0,230,200,0.30)' : 'rgba(255,255,255,0.08)'}`,
      }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left cursor-pointer"
      >
        <span className="text-white font-semibold text-sm md:text-base">{q}</span>
        <ChevronDown
          size={18}
          className="shrink-0 transition-transform text-[#00e6c8]"
          style={{ transform: open ? 'rotate(180deg)' : 'none' }}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 text-sm text-gray-400 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────

export default function LandingPromoPage() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const statsRef = useRef<HTMLElement>(null);
  const [statsActive, setStatsActive] = useState(false);

  // Activate count-up when the stats strip scrolls into view.
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setStatsActive(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // NON-FUNCTIONAL demo form: no network, no persistence, just local UI state.
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  function goEarlyAccess() {
    document.getElementById('early-access')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className="min-h-screen text-gray-200 overflow-x-hidden pb-24" style={{ background: '#000818' }}>
      {/* Local keyframes */}
      <style>{`
        @keyframes lp-wave {
          0%   { transform: translate3d(0,0,0); }
          100% { transform: translate3d(-50%,0,0); }
        }
        @keyframes lp-glow {
          0%,100% { opacity: 0.35; }
          50%     { opacity: 0.6; }
        }
        @keyframes lp-float {
          0%,100% { transform: translateY(0); }
          50%     { transform: translateY(-8px); }
        }
      `}</style>

      {/* ══════════════════════════════════════════════
          1 · HERO
      ══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28">
        {/* Animated gradient / water background */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse 70% 55% at 25% 25%, rgba(0,230,200,0.18) 0%, transparent 60%),
                radial-gradient(ellipse 60% 50% at 80% 30%, rgba(0,212,255,0.16) 0%, transparent 55%),
                radial-gradient(ellipse 80% 60% at 50% 100%, rgba(0,60,120,0.30) 0%, transparent 60%)
              `,
              animation: 'lp-glow 9s ease-in-out infinite',
            }}
          />
          {/* Water wave SVG at the bottom of the hero */}
          <svg
            className="absolute bottom-0 left-0 w-[200%] h-40 opacity-50"
            style={{ animation: 'lp-wave 18s linear infinite' }}
            viewBox="0 0 1440 160"
            preserveAspectRatio="none"
          >
            <path
              d="M0,64 C240,120 480,8 720,48 C960,88 1200,152 1440,96 L1440,160 L0,160 Z"
              fill="url(#lp-wave-grad)"
            />
            <defs>
              <linearGradient id="lp-wave-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#00e6c8" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#00d4ff" stopOpacity="0.10" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-5 text-center">
          {/* Eyebrow badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold mb-6"
            style={{
              background: 'rgba(0,230,200,0.10)',
              border: '1px solid rgba(0,230,200,0.25)',
              color: '#00e6c8',
            }}
          >
            <Sparkles size={13} />
            Водная операционная система нового поколения
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-4xl md:text-6xl font-black tracking-tight text-white leading-[1.05] max-w-4xl mx-auto"
          >
            Управляйте водными ресурсами{' '}
            <span
              style={{
                background: 'linear-gradient(90deg,#00e6c8,#00d4ff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              как единой системой
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mt-5 text-base md:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed"
          >
            ARKHEOSIUM — операционная система для водных ресурсов на основе DAO:
            живая карта объектов, ИИ-разработка проектов и прозрачное коллективное
            управление в одном пространстве.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <button
              onClick={goEarlyAccess}
              className="cursor-pointer px-8 py-3.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors"
              style={{ background: '#00e6c8', color: '#000818' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#00ffe0')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#00e6c8')}
            >
              Получить ранний доступ
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => setLocation('/map')}
              className="cursor-pointer px-8 py-3.5 rounded-xl font-medium text-sm flex items-center gap-2 text-gray-300 transition-colors hover:text-white"
              style={{ border: '1px solid rgba(255,255,255,0.18)' }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(0,230,200,0.45)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)')}
            >
              <Play size={15} />
              Смотреть демо
            </button>
          </motion.div>

          {/* Trust line */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-6 text-xs text-gray-500 flex items-center justify-center gap-2 flex-wrap"
          >
            <Droplets size={13} className="text-[#00e6c8]" />
            6 доменов
            <span className="text-white/20">·</span>
            780+ объектов
            <span className="text-white/20">·</span>
            DAO-управление
          </motion.p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          2 · SOCIAL PROOF / TECH BAND
      ══════════════════════════════════════════════ */}
      <section className="py-8" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-5">
          <p className="text-center text-[11px] uppercase tracking-[0.2em] text-gray-600 mb-5">
            Построено на проверенных технологиях
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2.5 md:gap-3">
            {['SCADA', 'IoT-сети', 'Supabase', 'MapLibre', 'AI-модели', 'Blockchain'].map((tech) => (
              <span
                key={tech}
                className="cursor-default px-4 py-2 rounded-full text-xs font-semibold text-gray-400 transition-colors hover:text-[#00e6c8]"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          3 · PROBLEM → SOLUTION
      ══════════════════════════════════════════════ */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="rounded-2xl p-7"
            style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.20)' }}
          >
            <div className="flex items-center gap-3 mb-5">
              <AlertTriangle size={20} className="text-red-400" />
              <h3 className="text-lg font-bold text-red-300">Боль водной инфраструктуры</h3>
            </div>
            <ul className="space-y-3">
              {[
                'Данные разбросаны по десяткам ведомств и несовместимых систем.',
                'Решения о проектах принимаются непрозрачно и с задержками.',
                'Нет единой картины состояния объектов и связей между ними.',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-300 leading-relaxed">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            variants={fadeUp}
            custom={1}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="rounded-2xl p-7"
            style={{ background: 'rgba(0,230,200,0.05)', border: '1px solid rgba(0,230,200,0.22)' }}
          >
            <div className="flex items-center gap-3 mb-5">
              <ShieldCheck size={20} className="text-[#00e6c8]" />
              <h3 className="text-lg font-bold text-[#00e6c8]">Как решает ARKHEOSIUM</h3>
            </div>
            <ul className="space-y-3">
              {[
                'Единое пространство: все объекты, данные и связи на одной карте.',
                'DAO-управление делает каждое решение прозрачным и проверяемым.',
                'ИИ помогает собирать проекты и находить оптимальные связи.',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-300 leading-relaxed">
                  <CheckCircle2 size={15} className="mt-0.5 text-[#00e6c8] shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          4 · BENEFITS
      ══════════════════════════════════════════════ */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-5">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">Что вы получаете</h2>
            <p className="mt-3 text-gray-400 text-sm max-w-xl mx-auto">
              Четыре опоры платформы, объединяющие данные, интеллект и коллективное управление.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <BenefitCard
              icon={<Map size={22} />}
              title="Единая карта ресурсов"
              desc="Все водные объекты, сети и территории — в одном интерактивном пространстве."
              delay={0}
            />
            <BenefitCard
              icon={<Cpu size={22} />}
              title="ИИ-разработка проектов"
              desc="Искусственный интеллект помогает собирать и оценивать проекты за минуты."
              delay={1}
            />
            <BenefitCard
              icon={<Vote size={22} />}
              title="Прозрачное DAO-управление"
              desc="Решения принимаются сообществом — открыто, проверяемо и без посредников."
              delay={2}
            />
            <BenefitCard
              icon={<Share2 size={22} />}
              title="Живой граф знаний"
              desc="Связи между объектами, проектами и участниками видны в реальном времени."
              delay={3}
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          5 · HOW IT WORKS
      ══════════════════════════════════════════════ */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-5">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-extrabold text-white text-center mb-12"
          >
            Как это работает
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                n: '01',
                t: 'Подключитесь',
                d: 'Получите ранний доступ и войдите в единое пространство водных ресурсов.',
              },
              {
                n: '02',
                t: 'Исследуйте карту',
                d: 'Изучайте объекты, домены и связи, собирайте проекты вместе с ИИ.',
              },
              {
                n: '03',
                t: 'Управляйте вместе',
                d: 'Голосуйте, предлагайте инициативы и влияйте на решения через DAO.',
              },
            ].map((step, i) => (
              <motion.div
                key={step.n}
                variants={fadeUp}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="rounded-2xl p-7"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div
                  className="text-4xl font-black mb-4"
                  style={{
                    background: 'linear-gradient(90deg,#00e6c8,#00d4ff)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {step.n}
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{step.t}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          6 · STATS STRIP
      ══════════════════════════════════════════════ */}
      <section
        ref={statsRef}
        className="py-16"
        style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'linear-gradient(180deg, rgba(0,230,200,0.03), transparent)',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-5 grid grid-cols-2 md:grid-cols-4 gap-8">
          <StatItem value={780} suffix="+" label="объектов" active={statsActive} delay={0} />
          <StatItem value={340} suffix="+" label="проектов" active={statsActive} delay={1} />
          <StatItem value={6} label="доменов" active={statsActive} delay={2} />
          <StatItem value={400} suffix="+" prefix="более" label="связей" active={statsActive} delay={3} />
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          7 · TESTIMONIAL / QUOTE
      ══════════════════════════════════════════════ */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-5">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="relative rounded-2xl p-8 md:p-10"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div
              className="absolute -top-16 -left-10 w-48 h-48 rounded-full blur-3xl pointer-events-none"
              style={{ background: 'rgba(0,230,200,0.10)' }}
            />
            <Quote size={28} className="text-[#00e6c8] mb-5" />
            <p className="relative text-lg md:text-xl text-white leading-relaxed font-medium">
              «Впервые состояние всей водной сети региона стало видно на одной карте.
              ARKHEOSIUM превращает разрозненные данные в решения, за которые отвечает
              всё сообщество — это меняет саму логику управления ресурсами».
            </p>
            <div className="mt-6 flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-[#000818]"
                style={{ background: 'linear-gradient(135deg,#00e6c8,#00d4ff)' }}
              >
                АК
              </div>
              <div>
                <div className="text-white font-semibold text-sm">Алина Каримова</div>
                <div className="text-gray-500 text-xs">Эксперт по управлению водными ресурсами</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          8 · EARLY ACCESS FORM (non-functional demo)
      ══════════════════════════════════════════════ */}
      <section id="early-access" className="py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-5">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="rounded-2xl p-8 text-center"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,230,200,0.20)' }}
          >
            <div
              className="w-12 h-12 rounded-xl mx-auto flex items-center justify-center mb-5 text-[#00e6c8]"
              style={{ background: 'rgba(0,230,200,0.10)', border: '1px solid rgba(0,230,200,0.20)' }}
            >
              <Mail size={22} />
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">Ранний доступ</h2>
            <p className="text-gray-400 text-sm mb-7 max-w-md mx-auto">
              Оставьте почту — и мы пригласим вас в закрытый запуск ARKHEOSIUM одними из первых.
            </p>

            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-center gap-2.5 rounded-xl px-5 py-4 text-sm font-semibold"
                  style={{ background: 'rgba(0,230,200,0.10)', border: '1px solid rgba(0,230,200,0.30)', color: '#00e6c8' }}
                >
                  <CheckCircle2 size={18} />
                  Спасибо! Мы свяжемся с вами.
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
                >
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    aria-label="Электронная почта"
                    className="flex-1 px-4 py-3 rounded-xl text-white text-sm placeholder-gray-600 outline-none transition-colors focus:border-[#00e6c8] focus:ring-2 focus:ring-[#00e6c8]/30"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)' }}
                  />
                  <button
                    type="submit"
                    className="cursor-pointer px-6 py-3 rounded-xl font-bold text-sm shrink-0 transition-colors"
                    style={{ background: '#00e6c8', color: '#000818' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#00ffe0')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#00e6c8')}
                  >
                    Присоединиться
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
            <p className="mt-4 text-[11px] text-gray-600">
              Демонстрационная форма — данные никуда не отправляются.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          9 · FAQ
      ══════════════════════════════════════════════ */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-5">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-extrabold text-white text-center mb-10"
          >
            Частые вопросы
          </motion.h2>

          <div className="space-y-3">
            <FaqItem
              q="Что такое ARKHEOSIUM?"
              a="Это операционная система для управления водными ресурсами на основе DAO: единая карта объектов, ИИ-инструменты разработки проектов и прозрачное коллективное управление."
            />
            <FaqItem
              q="Что даёт ранний доступ?"
              a="Вы одними из первых получаете доступ к платформе, влияете на её развитие и участвуете в закрытых обсуждениях сообщества до публичного запуска."
            />
            <FaqItem
              q="Как работает DAO-управление?"
              a="Ключевые решения — от приоритетов проектов до правил платформы — принимаются участниками через открытое голосование. Каждое решение проверяемо и зафиксировано."
            />
            <FaqItem
              q="Нужны ли технические навыки?"
              a="Нет. Интерфейс рассчитан на специалистов по воде, инвесторов и управленцев — работа с картой и проектами не требует программирования."
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          10 · FINAL CTA PANEL
      ══════════════════════════════════════════════ */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-5">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl px-6 py-14 md:px-12 md:py-16 text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(0,230,200,0.14), rgba(0,212,255,0.10))',
              border: '1px solid rgba(0,230,200,0.28)',
            }}
          >
            <div
              className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl pointer-events-none"
              style={{ background: 'rgba(0,230,200,0.16)', animation: 'lp-glow 8s ease-in-out infinite' }}
            />
            <div className="relative">
              <Droplets size={30} className="text-[#00e6c8] mx-auto mb-5" style={{ animation: 'lp-float 5s ease-in-out infinite' }} />
              <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
                Присоединяйтесь к ARKHEOSIUM
              </h2>
              <p className="text-gray-300 text-sm md:text-base max-w-xl mx-auto mb-8">
                Станьте частью сообщества, которое строит прозрачное управление
                водными ресурсами будущего.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={goEarlyAccess}
                  className="cursor-pointer px-8 py-3.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors"
                  style={{ background: '#00e6c8', color: '#000818' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#00ffe0')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#00e6c8')}
                >
                  Получить ранний доступ
                  <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => setLocation('/updates')}
                  className="cursor-pointer px-8 py-3.5 rounded-xl font-medium text-sm text-gray-200 transition-colors hover:text-white"
                  style={{ border: '1px solid rgba(255,255,255,0.20)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(0,230,200,0.45)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.20)')}
                >
                  Все обновления
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
