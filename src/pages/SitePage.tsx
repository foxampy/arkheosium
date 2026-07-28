/**
 * SitePage — публичная главная страница-«сайт» ARKHEOSIUM.
 * Маркетинговый обзор платформы: что это, 6 доменов, ключевые возможности,
 * живая экосистема, как это работает, ИИ/Genesis, финальный CTA + мини-футер.
 * Route: /site — открыта всем. Внутренняя навигация через wouter setLocation.
 */

import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { motion, useInView } from 'framer-motion';
import {
  Droplets, Zap, Mountain, Leaf, Wheat, CloudSun,
  Map as MapIcon, Globe2, Share2, FlaskConical, Gavel, BookOpen,
  ArrowRight, Sparkles, Brain, Network, ShieldCheck, Layers,
  Cpu, Coins, Compass, LineChart, Rocket,
} from 'lucide-react';

const ACCENT = '#00e6c8';
const ACCENT2 = '#00d4ff';

const GLASS = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
} as const;

// ── 6 ресурсных доменов ────────────────────────────────────────
const DOMAINS = [
  { name: 'Вода',        color: '#00e6c8', icon: Droplets, desc: 'Водные объекты, ирригация и цифровые двойники сетей.',   stat: '780+ объектов' },
  { name: 'Энергетика',  color: '#f59e0b', icon: Zap,      desc: 'ГЭС, ВИЭ и энергобаланс регионов в реальном времени.',   stat: '120+ станций' },
  { name: 'Ископаемые',  color: '#c084fc', icon: Mountain, desc: 'Месторождения, добыча и переработка минеральных ресурсов.', stat: '90+ месторождений' },
  { name: 'Природа',     color: '#34d399', icon: Leaf,     desc: 'Экосистемы, биоразнообразие и природоохранные проекты.', stat: '60+ зон' },
  { name: 'Агро',        color: '#a3e635', icon: Wheat,    desc: 'Земли, урожайность и продовольственная безопасность.',    stat: '140+ хозяйств' },
  { name: 'Климат',      color: '#7dd3fc', icon: CloudSun, desc: 'Мониторинг климата, выбросов и адаптационных сценариев.', stat: '50+ моделей' },
];

// ── Ключевые возможности (каждая ведёт на реальный маршрут) ─────
const FEATURES = [
  { path: '/map',     title: 'Интерактивная карта', icon: MapIcon,       color: '#00e6c8', desc: 'Живая карта объектов, проектов и субъектов по всем 6 доменам с фильтрами и слоями.' },
  { path: '/',        title: '3D-глобус',           icon: Globe2,        color: '#00d4ff', desc: 'Планетарный вид: ресурсы Земли, связи и потоки данных в объёме.' },
  { path: '/hub',     title: 'Граф знаний · хаб',   icon: Share2,        color: '#a78bfa', desc: 'Объекты, проекты, субъекты и комплексы, связанные в единый граф знаний.' },
  { path: '/lab',     title: 'AI-лаборатория',      icon: FlaskConical,  color: '#34d399', desc: 'ИИ-верстак разработки: концепция, технологии, ТЭО и дорожная карта проекта.' },
  { path: '/dao',     title: 'DAO-управление',      icon: Gavel,         color: '#f59e0b', desc: 'Предложения экосистемы, голосование силой VOD и казна децентрализованного управления.' },
  { path: '/catalog', title: 'Каталог тех/оборуд.', icon: BookOpen,      color: '#7dd3fc', desc: 'База технологий и оборудования для сборки инвестпроектов из готовых решений.' },
];

// ── Живая экосистема — статистика (count-up) ────────────────────
const STATS = [
  { label: 'объектов',  value: 780, prefix: 'более ', color: '#00e6c8' },
  { label: 'проектов',  value: 340, prefix: 'более ', color: '#00d4ff' },
  { label: 'субъектов', value: 270, prefix: 'более ', color: '#a3e635' },
  { label: 'комплексов', value: 50, prefix: 'более ', color: '#c084fc' },
  { label: 'доменов',   value: 6,   prefix: '',       color: '#34d399' },
  { label: 'связей',    value: 400, prefix: '',       suffix: '+', color: '#f59e0b' },
];

// ── Как это работает ────────────────────────────────────────────
const STEPS = [
  { n: '01', title: 'Собираем данные',   icon: Network,   color: '#00e6c8', desc: 'Объекты, проекты и субъекты 6 доменов сводятся в единый граф знаний.' },
  { n: '02', title: 'Анализируем ИИ',    icon: Brain,     color: '#00d4ff', desc: 'ИИ-модели находят связи, риски и возможности развития территорий.' },
  { n: '03', title: 'Разрабатываем',     icon: FlaskConical, color: '#34d399', desc: 'В лаборатории из данных рождаются проработанные проекты и продукты.' },
  { n: '04', title: 'Управляем через DAO', icon: Gavel,   color: '#f59e0b', desc: 'Сообщество голосует, финансирует и запускает инициативы в жизнь.' },
];

// ── Хайлайты «что это» ──────────────────────────────────────────
const HIGHLIGHTS = [
  { label: 'Ресурсная DAO-ОС', icon: ShieldCheck },
  { label: 'Живая карта и 3D-глобус', icon: Globe2 },
  { label: 'Граф знаний', icon: Network },
  { label: 'Токеномика VOD', icon: Coins },
];

// ── Мини-футер ссылки ───────────────────────────────────────────
const FOOTER_LINKS = [
  { path: '/updates',    label: 'Обновления' },
  { path: '/whitepaper', label: 'Whitepaper' },
  { path: '/dao',        label: 'DAO' },
  { path: '/roadmap',    label: 'Дорожная карта' },
];

// ── Count-up число, стартует при попадании в вьюпорт ────────────
function CountUp({ value, duration = 1400 }: { value: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const reduce = typeof window !== 'undefined'
      && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setDisplay(value); return; }

    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setDisplay(Math.round(eased * value));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration]);

  return <span ref={ref}>{display.toLocaleString('ru-RU')}</span>;
}

// ── Обёртка секции с whileInView-появлением ─────────────────────
function Reveal({
  children, delay = 0, className = '',
}: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Заголовок секции ────────────────────────────────────────────
function SectionHead({
  eyebrow, title, sub, color = ACCENT,
}: { eyebrow: string; title: string; sub?: string; color?: string }) {
  return (
    <div className="mb-8 sm:mb-10">
      <div className="flex items-center gap-2 mb-3">
        <span className="h-px w-8" style={{ background: color }} />
        <span className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color }}>
          {eyebrow}
        </span>
      </div>
      <h2 className="text-white font-black text-2xl sm:text-3xl lg:text-4xl leading-tight max-w-3xl">
        {title}
      </h2>
      {sub && <p className="text-white/45 text-sm sm:text-base mt-3 max-w-2xl leading-relaxed">{sub}</p>}
    </div>
  );
}

export default function SitePage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen pb-24" style={{ background: '#03060e' }}>
      {/* ══════════════════ HERO ══════════════════ */}
      <section className="relative overflow-hidden">
        {/* Фоновые градиентные орбы */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-40 -left-32 w-[520px] h-[520px] rounded-full blur-3xl opacity-40"
            style={{ background: 'radial-gradient(circle, rgba(0,230,200,0.35), transparent 70%)' }}
          />
          <div
            className="absolute -top-24 right-0 w-[560px] h-[560px] rounded-full blur-3xl opacity-35"
            style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.30), transparent 70%)' }}
          />
          <div
            className="absolute top-64 left-1/3 w-[420px] h-[420px] rounded-full blur-3xl opacity-25"
            style={{ background: 'radial-gradient(circle, rgba(192,132,252,0.25), transparent 70%)' }}
          />
        </div>

        {/* Анимированная сеть данных / воды (inline SVG) */}
        <svg
          className="pointer-events-none absolute inset-0 w-full h-full opacity-[0.18]"
          aria-hidden="true"
          preserveAspectRatio="xMidYMid slice"
          viewBox="0 0 1200 700"
        >
          <defs>
            <linearGradient id="site-net" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={ACCENT} />
              <stop offset="100%" stopColor={ACCENT2} />
            </linearGradient>
          </defs>
          {[
            [120, 140, 360, 90], [360, 90, 620, 210], [620, 210, 900, 120],
            [900, 120, 1080, 300], [360, 90, 480, 340], [620, 210, 540, 460],
            [120, 140, 300, 420], [300, 420, 540, 460], [540, 460, 820, 520],
            [820, 520, 1080, 300], [900, 120, 1140, 480], [480, 340, 300, 420],
          ].map(([x1, y1, x2, y2], i) => (
            <motion.line
              key={i}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="url(#site-net)" strokeWidth={1.2}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.6, delay: 0.2 + i * 0.08, ease: 'easeInOut' }}
            />
          ))}
          {[
            [120, 140], [360, 90], [620, 210], [900, 120], [1080, 300],
            [480, 340], [540, 460], [300, 420], [820, 520], [1140, 480],
          ].map(([cx, cy], i) => (
            <motion.circle
              key={i}
              cx={cx} cy={cy} r={4}
              fill={i % 2 ? ACCENT2 : ACCENT}
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.4, 1] }}
              transition={{ duration: 0.9, delay: 0.4 + i * 0.09 }}
            />
          ))}
        </svg>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-5 pt-16 sm:pt-24 pb-16 sm:pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
            style={{ background: 'rgba(0,230,200,0.08)', border: '1px solid rgba(0,230,200,0.22)' }}
          >
            <Sparkles size={14} style={{ color: ACCENT }} />
            <span className="text-xs font-semibold" style={{ color: ACCENT }}>
              Операционная система ресурсов и данных
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="text-white font-black leading-[1.05] tracking-tight
                       text-4xl sm:text-6xl lg:text-7xl max-w-4xl"
          >
            ARKHEOSIUM —{' '}
            <span
              style={{
                background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT2})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              операционная система
            </span>{' '}
            воды, ресурсов и данных планеты.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="text-white/55 text-base sm:text-xl mt-6 max-w-2xl leading-relaxed"
          >
            Живая карта, граф знаний, ИИ-лаборатория разработки и DAO-управление —
            всё для 6 ресурсных доменов в одной децентрализованной платформе.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row gap-3 mt-9"
          >
            <button
              onClick={() => setLocation('/map')}
              className="cursor-pointer group inline-flex items-center justify-center gap-2 px-6 py-3.5
                         rounded-2xl font-bold text-sm sm:text-base text-[#03060e] transition-opacity hover:opacity-90"
              style={{ background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT2})` }}
            >
              Открыть карту
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
            </button>
            <button
              onClick={() => setLocation('/lab')}
              className="cursor-pointer group inline-flex items-center justify-center gap-2 px-6 py-3.5
                         rounded-2xl font-bold text-sm sm:text-base text-white transition-colors"
              style={{ ...GLASS }}
            >
              <FlaskConical size={18} style={{ color: ACCENT }} />
              Лаборатория разработки
              <ArrowRight size={18} className="opacity-40 transition-transform group-hover:translate-x-0.5" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════ ЧТО ЭТО ══════════════════ */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-5 mt-4">
        <Reveal>
          <div className="rounded-3xl p-6 sm:p-10" style={GLASS}>
            <div className="flex items-center gap-2 mb-4">
              <Compass size={18} style={{ color: ACCENT }} />
              <span className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: ACCENT }}>
                Что такое ARKHEOSIUM
              </span>
            </div>
            <p className="text-white/70 text-lg sm:text-2xl leading-relaxed font-medium max-w-4xl">
              Это операционная система для управления ресурсами и данными:
              она объединяет объекты, проекты и сообщества шести доменов в единый
              цифровой контур — от живой карты и графа знаний до ИИ-разработки
              проектов и прозрачного DAO-управления.
            </p>

            <div className="flex flex-wrap gap-2.5 mt-7">
              {HIGHLIGHTS.map((h) => (
                <span
                  key={h.label}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs sm:text-sm font-semibold text-white/80"
                  style={{ background: 'rgba(0,230,200,0.06)', border: '1px solid rgba(0,230,200,0.18)' }}
                >
                  <h.icon size={14} style={{ color: ACCENT }} />
                  {h.label}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ══════════════════ 6 ДОМЕНОВ ══════════════════ */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-5 mt-16 sm:mt-24">
        <Reveal>
          <SectionHead
            eyebrow="6 доменов"
            title="Шесть ресурсных доменов — единая платформа"
            sub="Каждый домен со своей палитрой, данными и проектами. Всё связано в общий граф знаний."
          />
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {DOMAINS.map((d, i) => (
            <Reveal key={d.name} delay={i * 0.05}>
              <div
                className="group h-full rounded-2xl p-5 sm:p-6 transition-colors"
                style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${d.color}22` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center transition-colors"
                    style={{ background: `${d.color}14`, border: `1px solid ${d.color}30` }}
                  >
                    <d.icon size={22} style={{ color: d.color }} />
                  </div>
                  <span
                    className="px-2.5 py-1 rounded-full text-[11px] font-bold"
                    style={{ background: `${d.color}12`, color: d.color, border: `1px solid ${d.color}25` }}
                  >
                    {d.stat}
                  </span>
                </div>
                <h3 className="text-white font-bold text-lg mb-1.5">{d.name}</h3>
                <p className="text-white/45 text-sm leading-relaxed">{d.desc}</p>
                <div
                  className="mt-4 h-1 rounded-full w-full overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500 group-hover:w-full"
                    style={{ width: '40%', background: `linear-gradient(90deg, ${d.color}, ${d.color}55)` }}
                  />
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══════════════════ КЛЮЧЕВЫЕ ВОЗМОЖНОСТИ ══════════════════ */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-5 mt-16 sm:mt-24">
        <Reveal>
          <SectionHead
            eyebrow="Возможности"
            title="Ключевые модули платформы"
            sub="Живые рабочие инструменты — нажмите, чтобы открыть."
            color={ACCENT2}
          />
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {FEATURES.map((f, i) => (
            <Reveal key={f.path} delay={i * 0.05}>
              <button
                onClick={() => setLocation(f.path)}
                className="cursor-pointer text-left w-full h-full rounded-2xl p-5 sm:p-6 group transition-colors"
                style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${f.color}22` }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: `${f.color}14`, border: `1px solid ${f.color}30` }}
                >
                  <f.icon size={22} style={{ color: f.color }} />
                </div>
                <h3 className="text-white font-bold text-lg mb-1.5">{f.title}</h3>
                <p className="text-white/45 text-sm leading-relaxed mb-4">{f.desc}</p>
                <span
                  className="inline-flex items-center gap-1.5 text-sm font-semibold transition-opacity opacity-70 group-hover:opacity-100"
                  style={{ color: f.color }}
                >
                  Открыть
                  <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══════════════════ ЖИВАЯ ЭКОСИСТЕМА ══════════════════ */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-5 mt-16 sm:mt-24">
        <Reveal>
          <div
            className="relative overflow-hidden rounded-3xl p-6 sm:p-10"
            style={{ background: 'rgba(0,230,200,0.04)', border: '1px solid rgba(0,230,200,0.16)' }}
          >
            <div
              className="pointer-events-none absolute -right-20 -top-20 w-72 h-72 rounded-full blur-3xl opacity-40"
              style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.4), transparent 70%)' }}
            />
            <div className="relative flex items-center gap-2 mb-2">
              <LineChart size={18} style={{ color: ACCENT }} />
              <span className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: ACCENT }}>
                Живая экосистема
              </span>
            </div>
            <h2 className="relative text-white font-black text-2xl sm:text-3xl mb-8 max-w-2xl">
              Платформа растёт вместе с сообществом
            </h2>

            <div className="relative grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
              {STATS.map((s, i) => (
                <Reveal key={s.label} delay={i * 0.06}>
                  <div className="text-center sm:text-left">
                    <div className="text-3xl sm:text-4xl font-black" style={{ color: s.color }}>
                      <CountUp value={s.value} />{s.suffix ?? ''}
                    </div>
                    <div className="text-white/40 text-xs sm:text-sm mt-1">
                      {s.prefix}{s.label}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ══════════════════ КАК ЭТО РАБОТАЕТ ══════════════════ */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-5 mt-16 sm:mt-24">
        <Reveal>
          <SectionHead
            eyebrow="Как это работает"
            title="От данных — к реализованным проектам"
            sub="Четыре шага непрерывного цикла развития территорий."
          />
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.08}>
              <div className="relative h-full rounded-2xl p-5 sm:p-6" style={GLASS}>
                {/* соединительная стрелка между шагами (desktop) */}
                {i < STEPS.length - 1 && (
                  <ArrowRight
                    size={20}
                    className="hidden lg:block absolute top-1/2 -right-3.5 -translate-y-1/2 z-10 text-white/20"
                  />
                )}
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ background: `${s.color}14`, border: `1px solid ${s.color}30` }}
                  >
                    <s.icon size={20} style={{ color: s.color }} />
                  </div>
                  <span className="text-2xl font-black text-white/10">{s.n}</span>
                </div>
                <h3 className="text-white font-bold text-base mb-1.5">{s.title}</h3>
                <p className="text-white/45 text-sm leading-relaxed">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══════════════════ ИИ / GENESIS + ЛАБОРАТОРИЯ ══════════════════ */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-5 mt-16 sm:mt-24">
        <Reveal>
          <div
            className="relative overflow-hidden rounded-3xl p-6 sm:p-10 grid lg:grid-cols-2 gap-8 items-center"
            style={GLASS}
          >
            <div
              className="pointer-events-none absolute -left-24 -bottom-24 w-80 h-80 rounded-full blur-3xl opacity-30"
              style={{ background: 'radial-gradient(circle, rgba(0,230,200,0.4), transparent 70%)' }}
            />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <Brain size={18} style={{ color: ACCENT }} />
                <span className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: ACCENT }}>
                  ИИ · Genesis Engine
                </span>
              </div>
              <h2 className="text-white font-black text-2xl sm:text-4xl leading-tight mb-4">
                Идея → готовый проект за минуты
              </h2>
              <p className="text-white/50 text-sm sm:text-base leading-relaxed mb-6 max-w-lg">
                Genesis Engine и AI-лаборатория превращают сырой запрос в структурированный
                проект: исследование, концепция, подбор технологий, ТЭО и дорожная карта —
                автономным агентным конвейером.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setLocation('/lab')}
                  className="cursor-pointer group inline-flex items-center justify-center gap-2 px-5 py-3
                             rounded-2xl font-bold text-sm text-[#03060e] transition-opacity hover:opacity-90"
                  style={{ background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT2})` }}
                >
                  <FlaskConical size={17} />
                  Открыть лабораторию
                </button>
                <button
                  onClick={() => setLocation('/genesis')}
                  className="cursor-pointer group inline-flex items-center justify-center gap-2 px-5 py-3
                             rounded-2xl font-bold text-sm text-white transition-colors"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <Rocket size={17} style={{ color: ACCENT }} />
                  Genesis Engine
                  <ArrowRight size={15} className="opacity-40 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>

            {/* Визуальный «конвейер» стадий */}
            <div className="relative grid grid-cols-2 gap-3">
              {[
                { icon: Layers,   label: 'Исследование', color: '#00e6c8' },
                { icon: Sparkles, label: 'Концепция',    color: '#00d4ff' },
                { icon: Cpu,      label: 'Технологии',   color: '#a78bfa' },
                { icon: LineChart, label: 'ТЭО',         color: '#34d399' },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, scale: 0.92 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="rounded-2xl p-4 flex items-center gap-3"
                  style={{ background: `${s.color}0e`, border: `1px solid ${s.color}25` }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${s.color}18`, border: `1px solid ${s.color}30` }}
                  >
                    <s.icon size={16} style={{ color: s.color }} />
                  </div>
                  <span className="text-white/80 text-sm font-semibold">{s.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ══════════════════ ФИНАЛЬНЫЙ CTA ══════════════════ */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-5 mt-16 sm:mt-24">
        <Reveal>
          <div
            className="relative overflow-hidden rounded-3xl p-8 sm:p-14 text-center"
            style={{
              background: `linear-gradient(135deg, rgba(0,230,200,0.14), rgba(0,212,255,0.12))`,
              border: '1px solid rgba(0,230,200,0.25)',
            }}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{ background: 'radial-gradient(circle at 50% 0%, rgba(0,212,255,0.35), transparent 60%)' }}
            />
            <div className="relative">
              <h2 className="text-white font-black text-3xl sm:text-5xl leading-tight max-w-3xl mx-auto">
                Присоединяйтесь к экосистеме ARKHEOSIUM
              </h2>
              <p className="text-white/60 text-sm sm:text-lg mt-4 max-w-xl mx-auto leading-relaxed">
                Исследуйте карту, разрабатывайте проекты с ИИ и участвуйте в DAO-управлении
                ресурсами планеты.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
                <button
                  onClick={() => setLocation('/map')}
                  className="cursor-pointer group inline-flex items-center justify-center gap-2 px-7 py-3.5
                             rounded-2xl font-bold text-sm sm:text-base text-[#03060e] transition-opacity hover:opacity-90"
                  style={{ background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT2})` }}
                >
                  Открыть карту
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
                </button>
                <button
                  onClick={() => setLocation('/dao')}
                  className="cursor-pointer inline-flex items-center justify-center gap-2 px-7 py-3.5
                             rounded-2xl font-bold text-sm sm:text-base text-white transition-colors"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)' }}
                >
                  <Gavel size={18} style={{ color: ACCENT }} />
                  Перейти в DAO
                </button>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ══════════════════ МИНИ-ФУТЕР ══════════════════ */}
      <footer className="relative max-w-7xl mx-auto px-4 sm:px-5 mt-16">
        <div className="pt-8 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(0,230,200,0.1)', border: '1px solid rgba(0,230,200,0.25)' }}
              >
                <Droplets size={16} style={{ color: ACCENT }} />
              </div>
              <span className="text-white font-black tracking-tight">ARKHEOSIUM</span>
            </div>

            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {FOOTER_LINKS.map((l) => (
                <button
                  key={l.path}
                  onClick={() => setLocation(l.path)}
                  className="cursor-pointer text-sm text-white/45 hover:text-white transition-colors"
                >
                  {l.label}
                </button>
              ))}
            </nav>
          </div>

          <p className="text-white/25 text-xs text-center sm:text-left mt-6">
            © {new Date().getFullYear()} ARKHEOSIUM · Операционная система ресурсов и данных
          </p>
        </div>
      </footer>
    </div>
  );
}
