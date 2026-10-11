/**
 * DirectionsPage — «Направления»: тематический навигационный хаб ARKHEOSIUM.
 * Группирует весь контент платформы по водным направлениям. Каждое направление —
 * карточка с описанием, ключевыми метриками и кросс-ссылками на существующие страницы.
 * Это оглавление ОС «по темам»: маршрутизация подключается отдельно.
 */

import { motion, type Variants } from 'framer-motion';
import { useLocation } from 'wouter';
import {
  ArrowLeft, ArrowRight, Compass, Layers,
  Activity, Database, FlaskConical, TrendingUp, Gavel, Droplets,
  type LucideIcon,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

interface Stat {
  label: string;
  value: string;
}

interface CrossLink {
  label: string;
  route: string;
  hint?: string;
}

interface Direction {
  id: string;
  title: string;
  description: string;
  accent: string;
  icon: LucideIcon;
  stats: Stat[];
  links: CrossLink[];
}

// ── Directions data ──────────────────────────────────────────────────────────

const DIRECTIONS: Direction[] = [
  {
    id: 'monitoring',
    title: 'Мониторинг и IoT',
    description: 'Живая телеметрия водных объектов, датчики, алерты и аналитика в реальном времени.',
    accent: '#00e6c8',
    icon: Activity,
    stats: [
      { label: 'Датчиков онлайн', value: '1 240' },
      { label: 'Точек сбора', value: '312' },
      { label: 'Аптайм', value: '99.6%' },
    ],
    links: [
      { label: 'IoT-сеть', route: '/iot', hint: 'Устройства и потоки' },
      { label: 'Алерты', route: '/alerts', hint: 'События и пороги' },
      { label: 'Аналитика', route: '/analytics', hint: 'Тренды и отчёты' },
      { label: 'Дашборд', route: '/dashboard', hint: 'Сводная панель' },
    ],
  },
  {
    id: 'infrastructure',
    title: 'Инфраструктура и объекты',
    description: 'Реестр физических активов, субъектов и экосистемы с картографией по всему бассейну.',
    accent: '#38bdf8',
    icon: Database,
    stats: [
      { label: 'Объектов', value: '473' },
      { label: 'Субъектов', value: '128' },
      { label: 'Стран', value: '5' },
    ],
    links: [
      { label: 'Объекты', route: '/hub/objects', hint: '473 объекта' },
      { label: 'Субъекты', route: '/hub/subjects', hint: 'Операторы и ведомства' },
      { label: 'Экосистема', route: '/ecosystem', hint: 'Граф связей' },
      { label: 'Карта', route: '/map', hint: 'Геопривязка активов' },
    ],
  },
  {
    id: 'science',
    title: 'Наука и технологии',
    description: 'Методологии R&D, каталог оборудования и маркетплейс проверенных водных технологий.',
    accent: '#a78bfa',
    icon: FlaskConical,
    stats: [
      { label: 'Методологий', value: '34' },
      { label: 'Позиций каталога', value: '72' },
      { label: 'Пилотов', value: '9' },
    ],
    links: [
      { label: 'R&D / Методологии', route: '/rd', hint: 'Исследования и разработки' },
      { label: 'Каталог тех/оборуд.', route: '/catalog', hint: '72 позиции' },
      { label: 'Тех-маркет', route: '/tech-marketplace', hint: 'Закупка технологий' },
    ],
  },
  {
    id: 'investments',
    title: 'Инвестиции и токеномика',
    description: 'Инвестиционные возможности, токенсейл, блокчейн-протокол VOD и финансовая модель.',
    accent: '#fbbf24',
    icon: TrendingUp,
    stats: [
      { label: 'Портфель', value: '$6.1M' },
      { label: 'Эмиссия VOD', value: '100M' },
      { label: 'Ср. IRR', value: '18%' },
    ],
    links: [
      { label: 'Инвестиции', route: '/invest', hint: 'Проекты и раунды' },
      { label: 'Токенсейл', route: '/token-sale', hint: 'Продажа VOD' },
      { label: 'Блокчейн / VOD Token', route: '/blockchain', hint: 'Протокол и NFT' },
      { label: 'Whitepaper', route: '/vod-whitepaper', hint: 'Токеномика' },
    ],
  },
  {
    id: 'governance',
    title: 'Управление и DAO',
    description: 'Децентрализованное голосование, конструктор проектов и регуляторный контур платформы.',
    accent: '#4ade80',
    icon: Gavel,
    stats: [
      { label: 'Активных голосований', value: '3' },
      { label: 'Голосующих', value: '3 841' },
      { label: 'Кворум', value: '40%' },
    ],
    links: [
      { label: 'DAO ОС / Голосование', route: '/dao', hint: 'Предложения и казна' },
      { label: 'Конструктор проектов', route: '/constructor', hint: 'Сборка инициатив' },
      { label: 'Регуляторика', route: '/regulatory', hint: 'Нормы и соответствие' },
    ],
  },
  {
    id: 'aral',
    title: 'Мегапроект «Арал»',
    description: 'Флагманская программа восстановления Аральского бассейна: стратегия, документы и метрики.',
    accent: '#22d3ee',
    icon: Droplets,
    stats: [
      { label: 'Площадь фокуса', value: '68 000 км²' },
      { label: 'Горизонт', value: '2035' },
      { label: 'Документов', value: '46' },
    ],
    links: [
      { label: 'ARAL NEXUS', route: '/aral-nexus', hint: 'Центр программы' },
      { label: 'Whitepaper Арал', route: '/aral-whitepaper', hint: 'Концепция восстановления' },
      { label: 'Документы', route: '/documents', hint: 'Архив материалов' },
    ],
  },
];

// ── Motion variants ──────────────────────────────────────────────────────────

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

// ── Direction card ───────────────────────────────────────────────────────────

function DirectionCard({
  direction,
  onNavigate,
}: {
  direction: Direction;
  onNavigate: (route: string) => void;
}) {
  const Icon = direction.icon;
  return (
    <motion.article
      variants={fadeUp}
      className="rounded-2xl p-5 relative overflow-hidden flex flex-col h-full"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      {/* Ambient accent glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(circle at top right, ${direction.accent}0f, transparent 60%)` }}
      />

      <div className="relative flex flex-col h-full">
        {/* Header: icon badge + title */}
        <div className="flex items-start gap-3 mb-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `${direction.accent}18`, border: `1px solid ${direction.accent}30` }}
          >
            <Icon className="w-5 h-5" style={{ color: direction.accent }} />
          </div>
          <div className="min-w-0 pt-0.5">
            <h2 className="text-base font-bold text-white leading-tight">{direction.title}</h2>
            <span className="text-[10px] uppercase tracking-widest text-white/30 font-mono">
              Направление
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-white/50 leading-relaxed mb-4">{direction.description}</p>

        {/* Stat chips */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {direction.stats.map((s) => (
            <span
              key={s.label}
              className="inline-flex items-baseline gap-1 text-[11px] px-2.5 py-1 rounded-full"
              style={{ background: `${direction.accent}12`, border: `1px solid ${direction.accent}22` }}
            >
              <span className="font-bold" style={{ color: direction.accent }}>{s.value}</span>
              <span className="text-white/40">{s.label}</span>
            </span>
          ))}
        </div>

        {/* Cross-links */}
        <div className="mt-auto space-y-1.5">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px] uppercase tracking-widest text-white/30">Разделы ОС</span>
            <span className="text-[10px] text-white/25 font-mono">· {direction.links.length}</span>
          </div>
          {direction.links.map((link) => (
            <button
              key={link.route}
              onClick={() => onNavigate(link.route)}
              className="w-full group flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-left transition-colors duration-200 cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `${direction.accent}14`;
                e.currentTarget.style.borderColor = `${direction.accent}33`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
              }}
            >
              <span className="min-w-0">
                <span className="block text-xs font-semibold text-white/80 truncate">{link.label}</span>
                {link.hint && (
                  <span className="block text-[10px] text-white/35 truncate">{link.hint}</span>
                )}
              </span>
              <ArrowRight
                className="w-4 h-4 shrink-0 text-white/25 group-hover:translate-x-0.5 transition-transform duration-200"
                style={{ color: undefined }}
              />
            </button>
          ))}
        </div>
      </div>
    </motion.article>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function DirectionsPage() {
  const [, setLocation] = useLocation();

  const totalLinks = DIRECTIONS.reduce((sum, d) => sum + d.links.length, 0);

  return (
    <div
      className="min-h-screen pt-14 pb-10"
      style={{ background: 'linear-gradient(135deg, #000818 0%, #000d1f 100%)' }}
    >
      <div className="max-w-6xl mx-auto px-4 pt-6">
        {/* Back */}
        <button
          onClick={() => setLocation('/')}
          className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors duration-200 mb-5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          На главную
        </button>

        {/* Hero header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(0,230,200,0.12)', border: '1px solid rgba(0,230,200,0.25)' }}
            >
              <Compass className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-none">Направления</h1>
              <p className="text-[10px] uppercase tracking-widest text-white/30 mt-1.5 font-mono">
                Тематическая навигация по ОС
              </p>
            </div>
          </div>

          <p className="text-sm text-white/50 leading-relaxed max-w-2xl mb-4">
            Единое оглавление платформы по водным направлениям. Каждое направление собирает
            связанные разделы ARKHEOSIUM в один тематический кластер — от мониторинга и
            инфраструктуры до токеномики, DAO и мегапроекта «Арал».
          </p>

          {/* Summary chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-semibold"
              style={{ background: 'rgba(0,230,200,0.12)', border: '1px solid rgba(0,230,200,0.25)', color: '#00e6c8' }}
            >
              <Compass className="w-3.5 h-3.5" />
              6 направлений
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full text-white/50 bg-white/5 border border-white/8">
              <Layers className="w-3.5 h-3.5 text-white/40" />
              {totalLinks} разделов ОС
            </span>
          </div>
        </motion.div>

        {/* Directions grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {DIRECTIONS.map((d) => (
            <DirectionCard key={d.id} direction={d} onNavigate={setLocation} />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
