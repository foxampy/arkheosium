import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { motion, useInView } from 'framer-motion';
import {
  Coins, Blocks, ShieldCheck, Eye, Cpu, Vote, Layers,
  ArrowRight, Database, Radio, GitBranch, Gauge, Lock,
  Repeat, TrendingUp, Wallet, HandCoins, Zap, FileCode2,
  Sparkles, Boxes, Network, Gift, ScrollText,
} from 'lucide-react';

// ── Палитра ──────────────────────────────────────────────────
const BG = '#000818';
const ACCENT = '#00e6c8';
const ACCENT2 = '#00d4ff';
const GOLD = '#f59e0b';

// ── CountUp с уважением к prefers-reduced-motion ──────────────
function CountUp({
  value, duration = 1600, decimals = 0,
}: { value: number; duration?: number; decimals?: number }) {
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
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(eased * value);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration]);

  const shown = decimals > 0
    ? display.toFixed(decimals)
    : Math.round(display).toLocaleString('ru-RU');
  return <span ref={ref}>{shown}</span>;
}

// ── Обёртка секции ───────────────────────────────────────────
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

function SectionHeading({
  eyebrow, title, sub, color = ACCENT,
}: { eyebrow: string; title: string; sub?: string; color?: string }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-2">
        <span className="h-px w-8" style={{ background: color }} />
        <span className="text-xs font-semibold uppercase tracking-[0.25em]" style={{ color }}>
          {eyebrow}
        </span>
      </div>
      <h2 className="text-white font-black text-2xl sm:text-3xl leading-tight">{title}</h2>
      {sub && <p className="text-white/40 text-sm mt-2 max-w-2xl leading-relaxed">{sub}</p>}
    </div>
  );
}

// ── Данные ───────────────────────────────────────────────────
const HERO_STATS = [
  { label: 'Общая эмиссия VOD', value: 1_000_000_000, suffix: '', color: GOLD },
  { label: 'Доля DAO-казны', value: 24, suffix: '%', color: ACCENT },
  { label: 'On-chain активов', value: 18_420, suffix: '', color: ACCENT2 },
  { label: 'TVL экосистемы', value: 142, suffix: 'M', prefix: '$', color: '#a78bfa' },
];

const WHY_CARDS = [
  {
    icon: <Eye size={22} />,
    color: ACCENT2,
    title: 'Прозрачность реестра',
    desc: 'Каждый ресурс, объект и проект — публичная запись в on-chain реестре. Кто владеет, кто управляет, какой статус — проверяемо без посредников.',
  },
  {
    icon: <Lock size={22} />,
    color: ACCENT,
    title: 'Неизменяемость данных',
    desc: 'Показания сенсоров и мониторинга фиксируются хешами в блокчейне. История наблюдений не переписывается — основа доверия к экологическим данным.',
  },
  {
    icon: <Cpu size={22} />,
    color: GOLD,
    title: 'Программируемая координация',
    desc: 'Смарт-контракты автоматизируют финансирование, распределение долей и вознаграждений между субъектами без ручного согласования.',
  },
  {
    icon: <Vote size={22} />,
    color: '#a78bfa',
    title: 'Децентрализованное управление',
    desc: 'DAO управляет казной и параметрами ОС. Держатели VOD задают приоритеты развития ресурсной системы напрямую.',
  },
];

const UTILITY = [
  { icon: <Vote size={20} />, title: 'Голосование в DAO', desc: 'Вес голоса пропорционален застейканному VOD. Управление казной, грантами и параметрами ОС.', color: ACCENT },
  { icon: <Lock size={20} />, title: 'Стейкинг', desc: 'Блокировка VOD обеспечивает безопасность сети и приносит долю комиссий и эмиссионных наград.', color: ACCENT2 },
  { icon: <FileCode2 size={20} />, title: 'Доступ к разработке', desc: 'Запуск проектов в лаборатории, приоритетные мощности ИИ и расширенные модули оплачиваются в VOD.', color: GOLD },
  { icon: <Wallet size={20} />, title: 'Оплата услуг ОС', desc: 'Транзакции реестра, регистрация активов, доступ к аналитике и API — единая расчётная единица.', color: '#a78bfa' },
  { icon: <Gift size={20} />, title: 'Награда за данные', desc: 'Операторы сенсоров и поставщики верифицированного мониторинга получают VOD за вклад в реестр.', color: '#4ade80' },
  { icon: <HandCoins size={20} />, title: 'Обеспечение проектов', desc: 'Токенизированные доли ресурсных проектов используются как залог и инструмент со-финансирования.', color: '#f87171' },
];

// Распределение токена — суммируется в 100%
const ALLOCATION: { label: string; pct: number; color: string }[] = [
  { label: 'Экосистема и гранты', pct: 30, color: ACCENT },
  { label: 'DAO-казна', pct: 24, color: ACCENT2 },
  { label: 'Команда', pct: 16, color: GOLD },
  { label: 'Инвесторы', pct: 14, color: '#a78bfa' },
  { label: 'Ликвидность', pct: 10, color: '#4ade80' },
  { label: 'Резерв', pct: 6, color: '#f87171' },
];

// Кривая эмиссии в обращении (%) по годам 0..10
const EMISSION: number[] = [8, 18, 30, 42, 54, 65, 74, 82, 89, 95, 100];
const EMISSION_PHASES = [
  { label: 'Genesis', color: ACCENT },
  { label: 'Рост', color: ACCENT2 },
  { label: 'Зрелость', color: GOLD },
];

// ── Донат-чарт распределения (hand-computed arc paths) ───────
function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}
function arcPath(cx: number, cy: number, rOuter: number, rInner: number, a0: number, a1: number) {
  const large = a1 - a0 > 180 ? 1 : 0;
  const o0 = polar(cx, cy, rOuter, a0);
  const o1 = polar(cx, cy, rOuter, a1);
  const i1 = polar(cx, cy, rInner, a1);
  const i0 = polar(cx, cy, rInner, a0);
  return [
    `M ${o0.x} ${o0.y}`,
    `A ${rOuter} ${rOuter} 0 ${large} 1 ${o1.x} ${o1.y}`,
    `L ${i1.x} ${i1.y}`,
    `A ${rInner} ${rInner} 0 ${large} 0 ${i0.x} ${i0.y}`,
    'Z',
  ].join(' ');
}

function DonutChart() {
  const size = 260;
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = 118;
  const rInner = 72;
  const gap = 2; // градусный зазор между сегментами
  let cursor = 0;
  const segments = ALLOCATION.map((a) => {
    const a0 = cursor + gap / 2;
    const a1 = cursor + (a.pct / 100) * 360 - gap / 2;
    cursor += (a.pct / 100) * 360;
    return { ...a, a0, a1 };
  });

  return (
    <div className="flex flex-col sm:flex-row items-center gap-8">
      <div className="relative shrink-0">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {segments.map((s, i) => (
            <motion.path
              key={s.label}
              d={arcPath(cx, cy, rOuter, rInner, s.a0, s.a1)}
              fill={s.color}
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 0.9, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformOrigin: `${cx}px ${cy}px` }}
            />
          ))}
          <circle cx={cx} cy={cy} r={rInner - 1} fill={BG} />
          <text x={cx} y={cy - 6} textAnchor="middle" fill="#fff" fontSize="26" fontWeight="900">VOD</text>
          <text x={cx} y={cy + 16} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="11">1 000 000 000</text>
        </svg>
      </div>
      <div className="flex-1 w-full grid grid-cols-1 gap-2">
        {segments.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 + i * 0.08 }}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: s.color }} />
            <span className="text-sm text-white/80 flex-1">{s.label}</span>
            <span className="text-sm font-black" style={{ color: s.color }}>{s.pct}%</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── График эмиссии (polyline / area, hand-computed) ──────────
function EmissionChart() {
  const w = 640;
  const h = 300;
  const padL = 44;
  const padR = 20;
  const padT = 20;
  const padB = 40;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;
  const maxY = 100;
  const pts = EMISSION.map((v, i) => {
    const x = padL + (i / (EMISSION.length - 1)) * innerW;
    const y = padT + innerH - (v / maxY) * innerH;
    return { x, y, v, year: i };
  });
  const line = pts.map((p) => `${p.x},${p.y}`).join(' ');
  const area = `M ${padL},${padT + innerH} ` + pts.map((p) => `L ${p.x},${p.y}`).join(' ') + ` L ${pts[pts.length - 1].x},${padT + innerH} Z`;
  const yTicks = [0, 25, 50, 75, 100];

  return (
    <div className="overflow-x-auto">
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} className="min-w-[520px]">
        <defs>
          <linearGradient id="emArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ACCENT} stopOpacity="0.35" />
            <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Сетка + ось Y */}
        {yTicks.map((t) => {
          const y = padT + innerH - (t / maxY) * innerH;
          return (
            <g key={t}>
              <line x1={padL} y1={y} x2={w - padR} y2={y} stroke="rgba(255,255,255,0.06)" />
              <text x={padL - 8} y={y + 4} textAnchor="end" fill="rgba(255,255,255,0.35)" fontSize="10">{t}%</text>
            </g>
          );
        })}

        {/* Ось X — годы */}
        {pts.map((p) => (
          <text key={p.year} x={p.x} y={h - padB + 18} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="10">
            {p.year}
          </text>
        ))}
        <text x={padL + innerW / 2} y={h - 4} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="10">
          Год с момента запуска
        </text>

        {/* Область */}
        <motion.path
          d={area}
          fill="url(#emArea)"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        />

        {/* Линия — анимация рисования */}
        <motion.polyline
          points={line}
          fill="none"
          stroke={ACCENT}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: 'easeInOut' }}
        />

        {/* Точки */}
        {pts.map((p, i) => (
          <motion.circle
            key={p.year}
            cx={p.x}
            cy={p.y}
            r={3}
            fill={BG}
            stroke={ACCENT}
            strokeWidth={2}
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 + i * 0.08 }}
          />
        ))}
      </svg>
    </div>
  );
}

// ── Архитектура: слоистая диаграмма с анимированным потоком ──
function ArchitectureDiagram() {
  const layers = [
    { icon: <Radio size={18} />, title: 'Физические ресурсы · IoT-сенсоры', color: ACCENT2 },
    { icon: <Gauge size={18} />, title: 'Оракулы · верификация данных', color: '#a78bfa' },
    { icon: <Database size={18} />, title: 'On-chain реестр · токенизированные записи', color: GOLD },
    { icon: <FileCode2 size={18} />, title: 'Смарт-контракты · логика координации', color: ACCENT },
    { icon: <Network size={18} />, title: 'DAO и приложения ОС', color: '#4ade80' },
  ];
  return (
    <div className="relative">
      {layers.map((l, i) => (
        <div key={l.title}>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.12 }}
            className="flex items-center gap-4 rounded-2xl px-4 sm:px-6 py-4"
            style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${l.color}30` }}
          >
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${l.color}18`, border: `1px solid ${l.color}35`, color: l.color }}>
              {l.icon}
            </div>
            <span className="text-white font-semibold text-sm sm:text-base">{l.title}</span>
            <span className="ml-auto text-xs font-mono" style={{ color: `${l.color}99` }}>L{i}</span>
          </motion.div>
          {i < layers.length - 1 && (
            <svg width="100%" height="34" viewBox="0 0 100 34" preserveAspectRatio="none" className="block">
              <motion.line
                x1="50" y1="0" x2="50" y2="34"
                stroke={ACCENT}
                strokeWidth="1.5"
                strokeDasharray="4 4"
                initial={{ strokeDashoffset: 32 }}
                whileInView={{ strokeDashoffset: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Флайвил ценности (циркулярная диаграмма) ─────────────────
function Flywheel() {
  const size = 340;
  const cx = size / 2;
  const cy = size / 2;
  const r = 118;
  const nodes = [
    { label: 'Ресурсы', icon: <Boxes size={16} />, color: ACCENT2 },
    { label: 'Проекты', icon: <FileCode2 size={16} />, color: GOLD },
    { label: 'Ценность', icon: <TrendingUp size={16} />, color: '#4ade80' },
    { label: 'Токен VOD', icon: <Coins size={16} />, color: ACCENT },
    { label: 'Реинвестиции', icon: <Repeat size={16} />, color: '#a78bfa' },
  ];
  const positions = nodes.map((_, i) => {
    const deg = (i / nodes.length) * 360 - 90;
    return polar(cx, cy, r, deg);
  });

  return (
    <div className="flex justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="max-w-full">
        {/* Кольцо-поток */}
        <motion.circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={ACCENT}
          strokeWidth="2"
          strokeDasharray="6 8"
          initial={{ strokeDashoffset: 200, opacity: 0.5 }}
          whileInView={{ strokeDashoffset: 0, opacity: 0.8 }}
          viewport={{ once: true }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
        <circle cx={cx} cy={cy} r={r - 40} fill="none" stroke="rgba(255,255,255,0.06)" />
        <text x={cx} y={cy - 4} textAnchor="middle" fill="#fff" fontSize="13" fontWeight="800">Экономический</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fill={ACCENT} fontSize="13" fontWeight="800">флайвил</text>

        {positions.map((p, i) => (
          <motion.g
            key={nodes[i].label}
            initial={{ opacity: 0, scale: 0.7 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.14 }}
          >
            <circle cx={p.x} cy={p.y} r={30} fill={BG} stroke={nodes[i].color} strokeWidth="1.5" />
            <circle cx={p.x} cy={p.y} r={30} fill={nodes[i].color} opacity="0.12" />
            <text x={p.x} y={p.y + 4} textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700">
              {nodes[i].label}
            </text>
          </motion.g>
        ))}
      </svg>
    </div>
  );
}

// ── Страница ─────────────────────────────────────────────────
export default function TokenomicsPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen" style={{ background: BG }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-5 pb-24">

        {/* ── 1. HERO ─────────────────────────────────────────── */}
        <section className="relative pt-12 sm:pt-20 pb-14">
          <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/4 w-[420px] h-[420px] rounded-full blur-[120px]"
              style={{ background: `${ACCENT}18` }} />
            <div className="absolute top-20 right-1/4 w-[380px] h-[380px] rounded-full blur-[120px]"
              style={{ background: `${GOLD}14` }} />
          </div>

          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
                style={{ background: `${ACCENT}12`, border: `1px solid ${ACCENT}30` }}
              >
                <Sparkles size={14} style={{ color: ACCENT }} />
                <span className="text-xs font-semibold" style={{ color: ACCENT }}>Экономический слой ОС</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                className="font-black text-4xl sm:text-5xl leading-[1.05] tracking-tight"
              >
                <span className="text-white">Токен </span>
                <span style={{ background: `linear-gradient(90deg, ${GOLD}, ${ACCENT})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  VOD
                </span>
                <span className="text-white"> и on-chain реестр ресурсов</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.16 }}
                className="text-white/50 text-base sm:text-lg mt-5 leading-relaxed max-w-xl"
              >
                Блокчейн-фундамент, на котором работает вся операционная система ресурсов:
                токенизированный реестр объектов, программируемая координация субъектов
                и DAO-экономика, приводящая ценность к тем, кто создаёт и сохраняет ресурсы.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.24 }}
                className="flex flex-wrap gap-3 mt-7"
              >
                <button
                  onClick={() => setLocation('/dao')}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all hover:opacity-90"
                  style={{ background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT2})`, color: BG }}
                >
                  <Vote size={16} /> Перейти в DAO
                </button>
                <button
                  onClick={() => setLocation('/whitepaper')}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all hover:opacity-80"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff' }}
                >
                  <ScrollText size={16} /> Whitepaper
                </button>
              </motion.div>
            </div>

            {/* Анимированный SVG-мотив: цепочка блоков + токен */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="relative"
            >
              <svg width="100%" viewBox="0 0 400 320" className="max-w-[440px] mx-auto">
                <defs>
                  <linearGradient id="tokGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={GOLD} />
                    <stop offset="100%" stopColor={ACCENT} />
                  </linearGradient>
                </defs>
                {/* Соединительная линия потока */}
                <motion.path
                  d="M 60 90 L 200 160 L 340 90 M 60 230 L 200 160 L 340 230"
                  fill="none" stroke={ACCENT} strokeWidth="1.5" strokeDasharray="5 6"
                  initial={{ strokeDashoffset: 60 }}
                  animate={{ strokeDashoffset: 0 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  opacity="0.5"
                />
                {/* Блоки-узлы */}
                {[[60, 90], [340, 90], [60, 230], [340, 230]].map(([x, y], i) => (
                  <motion.rect
                    key={i}
                    x={x - 26} y={y - 26} width="52" height="52" rx="12"
                    fill="rgba(255,255,255,0.03)" stroke={ACCENT2} strokeWidth="1.5"
                    initial={{ opacity: 0, y: y - 16 }}
                    animate={{ opacity: 1, y: y - 26 }}
                    transition={{ delay: 0.3 + i * 0.12 }}
                  />
                ))}
                {[[60, 90], [340, 90], [60, 230], [340, 230]].map(([x, y], i) => (
                  <g key={`ic-${i}`} transform={`translate(${x - 9}, ${y - 9})`} opacity="0.85">
                    <Blocks size={18} color={ACCENT2} />
                  </g>
                ))}
                {/* Центральный токен */}
                <motion.circle
                  cx="200" cy="160" r="46"
                  fill="url(#tokGrad)"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ transformOrigin: '200px 160px' }}
                />
                <circle cx="200" cy="160" r="46" fill="none" stroke="#fff" strokeOpacity="0.2" strokeWidth="1" />
                <text x="200" y="167" textAnchor="middle" fill={BG} fontSize="24" fontWeight="900">VOD</text>
                <motion.circle
                  cx="200" cy="160" r="62" fill="none" stroke={ACCENT} strokeWidth="1" strokeOpacity="0.3"
                  animate={{ r: [56, 72], opacity: [0.4, 0] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }}
                />
              </svg>
            </motion.div>
          </div>

          {/* Стат-полоса */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-12">
            {HERO_STATS.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.08}>
                <div className="rounded-2xl px-4 py-5 h-full"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="text-2xl sm:text-3xl font-black" style={{ color: s.color }}>
                    {(s as { prefix?: string }).prefix ?? ''}
                    <CountUp value={s.value} />
                    {s.suffix}
                  </div>
                  <div className="text-white/40 text-xs mt-1.5">{s.label}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── 2. ЗАЧЕМ БЛОКЧЕЙН ───────────────────────────────── */}
        <section className="py-14">
          <SectionHeading
            eyebrow="Фундамент доверия"
            title="Зачем ресурсной ОС блокчейн"
            sub="Четыре свойства распределённого реестра превращают разрозненные данные о ресурсах в единую проверяемую и программируемую систему."
            color={ACCENT2}
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {WHY_CARDS.map((c, i) => (
              <Reveal key={c.title} delay={i * 0.08}>
                <div className="rounded-3xl p-5 h-full"
                  style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${c.color}25` }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: `${c.color}15`, border: `1px solid ${c.color}30`, color: c.color }}>
                    {c.icon}
                  </div>
                  <h3 className="text-white font-bold text-base mb-2">{c.title}</h3>
                  <p className="text-white/45 text-sm leading-relaxed">{c.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── 3. АРХИТЕКТУРА ──────────────────────────────────── */}
        <section className="py-14">
          <SectionHeading
            eyebrow="Слои системы"
            title="Архитектура: от сенсора до DAO"
            sub="Данные поднимаются снизу вверх — от физических ресурсов и сенсоров через оракулы в неизменяемый реестр, где смарт-контракты приводят их в действие."
            color={GOLD}
          />
          <div className="rounded-3xl p-4 sm:p-8"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <ArchitectureDiagram />
          </div>
        </section>

        {/* ── 4. РАСПРЕДЕЛЕНИЕ ТОКЕНА ─────────────────────────── */}
        <section className="py-14">
          <SectionHeading
            eyebrow="Аллокация"
            title="Распределение токена VOD"
            sub="Общая эмиссия — 1 000 000 000 VOD, зафиксированная навсегда. Большая часть направлена в экосистему и управляемую сообществом казну."
            color={ACCENT}
          />
          <div className="rounded-3xl p-6 sm:p-8"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <DonutChart />
          </div>
        </section>

        {/* ── 5. УТИЛИТА ТОКЕНА ───────────────────────────────── */}
        <section className="py-14">
          <SectionHeading
            eyebrow="Полезность"
            title="Утилита токена"
            sub="VOD — не спекулятивный актив, а рабочий инструмент координации: управление, безопасность, доступ и вознаграждение в единой экономике."
            color="#a78bfa"
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {UTILITY.map((u, i) => (
              <Reveal key={u.title} delay={i * 0.07}>
                <div className="rounded-2xl p-5 h-full flex gap-4"
                  style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${u.color}22` }}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${u.color}15`, border: `1px solid ${u.color}30`, color: u.color }}>
                    {u.icon}
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm mb-1.5">{u.title}</h3>
                    <p className="text-white/45 text-xs leading-relaxed">{u.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── 6. ГРАФИК ЭМИССИИ ───────────────────────────────── */}
        <section className="py-14">
          <SectionHeading
            eyebrow="Вестинг"
            title="График эмиссии"
            sub="Плавный выход токенов в обращение за 10 лет предотвращает инфляционное давление и удерживает долгосрочную согласованность интересов."
            color={ACCENT}
          />
          <div className="rounded-3xl p-5 sm:p-8"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <EmissionChart />
            <div className="flex flex-wrap gap-4 mt-6 justify-center">
              {EMISSION_PHASES.map((p) => (
                <div key={p.label} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
                  <span className="text-xs text-white/50">{p.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 7. ФЛАЙВИЛ ──────────────────────────────────────── */}
        <section className="py-14">
          <SectionHeading
            eyebrow="Циркуляция ценности"
            title="Экономический флайвил"
            sub="Ресурсы порождают проекты, проекты создают измеримую ценность, ценность фиксируется токеном, а токен реинвестируется обратно в ресурсы — самоусиливающийся контур."
            color="#4ade80"
          />
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="rounded-3xl p-6 sm:p-8"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Flywheel />
            </div>
            <div className="space-y-4">
              {[
                { icon: <Boxes size={18} />, color: ACCENT2, t: 'Ресурсы', d: 'Физические активы и данные о них становятся токенизированными записями реестра.' },
                { icon: <FileCode2 size={18} />, color: GOLD, t: 'Проекты', d: 'Субъекты запускают проекты поверх реестра, привлекая VOD-финансирование.' },
                { icon: <TrendingUp size={18} />, color: '#4ade80', t: 'Ценность', d: 'Результаты проектов измеряются on-chain и повышают спрос на экосистему.' },
                { icon: <Coins size={18} />, color: ACCENT, t: 'Токен', d: 'Созданная ценность возвращается держателям и казне через комиссии и стейкинг.' },
                { icon: <Repeat size={18} />, color: '#a78bfa', t: 'Реинвестиции', d: 'DAO направляет казну в новые ресурсы — контур замыкается и усиливается.' },
              ].map((s, i) => (
                <Reveal key={s.t} delay={i * 0.07}>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${s.color}15`, border: `1px solid ${s.color}30`, color: s.color }}>
                      {s.icon}
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-sm">{s.t}</h3>
                      <p className="text-white/45 text-xs leading-relaxed mt-0.5">{s.d}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── 8. УПРАВЛЕНИЕ ───────────────────────────────────── */}
        <section className="py-14">
          <Reveal>
            <div className="rounded-3xl p-8 sm:p-10 relative overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${ACCENT}12, ${ACCENT2}08)`, border: `1px solid ${ACCENT}30` }}>
              <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full blur-[90px]"
                style={{ background: `${ACCENT}22` }} />
              <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: `${ACCENT}20`, border: `1px solid ${ACCENT}40`, color: ACCENT }}>
                  <Vote size={26} />
                </div>
                <div className="flex-1">
                  <h2 className="text-white font-black text-2xl mb-2">Управление в руках держателей</h2>
                  <p className="text-white/55 text-sm leading-relaxed max-w-2xl">
                    Параметры эмиссии, распределение казны и приоритеты развития ОС решает DAO.
                    Каждый застейканный VOD — это голос за будущее ресурсной системы.
                  </p>
                </div>
                <button
                  onClick={() => setLocation('/dao')}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold cursor-pointer transition-all hover:opacity-90 shrink-0"
                  style={{ background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT2})`, color: BG }}
                >
                  Открыть DAO <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ── 9. ФИНАЛЬНЫЙ CTA ────────────────────────────────── */}
        <section className="pt-6">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5"
                style={{ background: `${GOLD}12`, border: `1px solid ${GOLD}30` }}>
                <GitBranch size={14} style={{ color: GOLD }} />
                <span className="text-xs font-semibold" style={{ color: GOLD }}>Продолжить изучение</span>
              </div>
              <h2 className="text-white font-black text-3xl mb-3">Экономика — это только начало</h2>
              <p className="text-white/45 text-sm mb-8 leading-relaxed">
                Изучите последние обновления протокола или погрузитесь в полное техническое описание
                архитектуры операционной системы ресурсов.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={() => setLocation('/updates')}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold cursor-pointer transition-all hover:opacity-90"
                  style={{ background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT2})`, color: BG }}
                >
                  <Layers size={16} /> Обновления
                </button>
                <button
                  onClick={() => setLocation('/whitepaper')}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold cursor-pointer transition-all hover:opacity-80"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff' }}
                >
                  <ScrollText size={16} /> Whitepaper
                </button>
              </div>
            </div>
          </Reveal>

          <div className="mt-16 text-center text-xs text-white/15 space-y-1">
            <p>ARKHEOSIUM · Экономический и блокчейн-слой ОС ресурсов</p>
            <p>Концептуальный документ. Токен VOD · on-chain реестр · DAO-экономика</p>
          </div>
        </section>
      </div>
    </div>
  );
}
