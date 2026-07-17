import { useRef } from 'react';
import { useLocation } from 'wouter';
import { motion, useInView } from 'framer-motion';
import {
  Map,
  FolderKanban,
  ShoppingBag,
  FlaskConical,
  TrendingUp,
  Phone,
  ArrowRight,
  Activity,
  Shield,
  BrainCircuit,
  ChevronRight,
  Globe,
  Building2,
  CalendarDays,
} from 'lucide-react';
import { ALL_REGIONS, type WaterRegion } from '@/data/regions-data';
import {
  COMPLETED_PROJECTS,
  COMPLETED_PROJECTS_COUNT,
  getCompletedProjectCountries,
  getCountryFlag,
} from '@/data/completed-projects-data';
import { OBJECTS_DATA } from '@/data/objects-data';

// ─── Animation variants ──────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

function AnimatedSection({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={stagger}
      className={className}
    >
      {children}
    </motion.section>
  );
}

// ─── Water stress badge ───────────────────────────────────────

const STRESS_CONFIG: Record<
  WaterRegion['key_stats']['water_stress_level'],
  { label: string; bg: string; text: string }
> = {
  low: { label: 'Низкий', bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
  medium: { label: 'Средний', bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  high: { label: 'Высокий', bg: 'bg-orange-500/20', text: 'text-orange-400' },
  critical: { label: 'Критический', bg: 'bg-red-500/20', text: 'text-red-400' },
};

// ─── Navigation cards config ──────────────────────────────────

const NAV_CARDS = [
  {
    to: '/map',
    icon: Map,
    title: 'Карта',
    desc: 'Интерактивная карта водных ресурсов',
    accent: '#00e6c8',
  },
  {
    to: '/hub',
    icon: FolderKanban,
    title: 'Проект Хаб',
    desc: 'Объекты, субъекты, проекты',
    accent: '#3b82f6',
  },
  {
    to: '/catalog',
    icon: ShoppingBag,
    title: 'Каталог',
    desc: 'Технологии, оборудование, стартапы',
    accent: '#a78bfa',
  },
  {
    to: '/rd',
    icon: FlaskConical,
    title: 'R&D',
    desc: 'Исследования и разработки',
    accent: '#f59e0b',
  },
  {
    to: '/invest',
    icon: TrendingUp,
    title: 'Инвестиции',
    desc: 'Инвестиционные возможности',
    accent: '#22c55e',
  },
  {
    to: '/contacts',
    icon: Phone,
    title: 'Контакты',
    desc: 'Связаться с командой',
    accent: '#06b6d4',
  },
] as const;

// ─── Platform highlights ──────────────────────────────────────

const HIGHLIGHTS = [
  {
    icon: Activity,
    title: 'Мониторинг',
    desc: 'Данные о водных ресурсах в реальном времени из спутниковых и наземных источников',
    accent: '#00e6c8',
  },
  {
    icon: Shield,
    title: 'Блокчейн',
    desc: 'Прозрачное и безопасное инвестирование через распределенный реестр',
    accent: '#a78bfa',
  },
  {
    icon: BrainCircuit,
    title: 'ИИ Аналитика',
    desc: 'Прогнозирование рисков и возможностей с помощью машинного обучения',
    accent: '#3b82f6',
  },
];

// ─── Main component ──────────────────────────────────────────

export default function ExplorePage() {
  const [, navigate] = useLocation();
  const objectsCount = OBJECTS_DATA.length;
  const regionsCount = ALL_REGIONS.filter((r) => r.id !== 'global').length;
  const countriesInProjects = getCompletedProjectCountries();
  const featuredProjects = COMPLETED_PROJECTS.slice(0, 6);

  return (
    <div className="min-h-screen text-white overflow-x-hidden">
      {/* ═══ HERO ═══ */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          {/* Gradient base */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#001a3d] via-[#000c20] to-[#000c20]" />

          {/* Animated water ripple rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="absolute rounded-full border border-cyan-400/10"
                style={{
                  width: `${300 + i * 200}px`,
                  height: `${300 + i * 200}px`,
                  animation: `pulse-ring ${4 + i * 1.5}s ease-in-out infinite`,
                  animationDelay: `${i * 0.8}s`,
                }}
              />
            ))}
          </div>

          {/* Floating particles */}
          {[...Array(20)].map((_, i) => (
            <div
              key={`p-${i}`}
              className="absolute w-1 h-1 rounded-full bg-cyan-400/20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float-particle ${6 + Math.random() * 8}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}

          {/* Gradient mesh overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(0,230,200,0.08)_0%,_transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(59,130,246,0.06)_0%,_transparent_60%)]" />
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative z-10 text-center px-4 max-w-5xl mx-auto"
        >
          {/* Logo mark */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-6 inline-flex items-center justify-center"
          >
            <img src="/logo.png" alt="VODPROM" className="w-16 h-16"
              style={{ filter: 'brightness(0) invert(1) sepia(1) saturate(2) hue-rotate(185deg)' }} />
          </motion.div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
              VODPROM
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            Глобальная платформа водных ресурсов и инвестиций
          </p>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-wrap justify-center gap-6 sm:gap-10 mb-12"
          >
            {[
              { value: `${COMPLETED_PROJECTS_COUNT}`, label: 'реализованных проектов' },
              { value: `${objectsCount}+`, label: 'объектов в базе' },
              { value: `${regionsCount}`, label: 'регионов мира' },
              { value: '$200M+', label: 'обработано' },
            ].map((stat) => (
              <div key={stat.label} className="text-center min-w-[120px]">
                <div className="text-2xl sm:text-3xl font-bold text-cyan-400">{stat.value}</div>
                <div className="text-xs sm:text-sm text-white/40 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <button
              onClick={() => navigate('/map')}
              className="group flex items-center gap-2 px-8 py-3.5 rounded-xl
                         bg-gradient-to-r from-cyan-500 to-blue-500
                         text-white font-semibold text-sm
                         hover:from-cyan-400 hover:to-blue-400
                         transition-all duration-300 shadow-lg shadow-cyan-500/20
                         hover:shadow-cyan-500/40 hover:scale-[1.02]"
            >
              <Map className="w-4 h-4" />
              Открыть карту
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/invest')}
              className="group flex items-center gap-2 px-8 py-3.5 rounded-xl
                         border border-cyan-500/30 text-cyan-400 font-semibold text-sm
                         hover:bg-cyan-500/10 hover:border-cyan-500/50
                         transition-all duration-300 hover:scale-[1.02]"
            >
              <TrendingUp className="w-4 h-4" />
              Инвестировать
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </motion.div>
        </motion.div>

      </section>

      {/* ═══ QUICK NAVIGATION ═══ */}
      <AnimatedSection className="max-w-6xl mx-auto px-4 py-20">
        <motion.h2
          variants={fadeUp}
          className="text-2xl sm:text-3xl font-bold text-center mb-3"
        >
          Навигация по платформе
        </motion.h2>
        <motion.p
          variants={fadeUp}
          className="text-white/40 text-center mb-12 max-w-lg mx-auto"
        >
          Все инструменты для управления водными ресурсами в одном месте
        </motion.p>

        <motion.div
          variants={stagger}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {NAV_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <motion.button
                key={card.to}
                variants={fadeUp}
                onClick={() => navigate(card.to)}
                className="group relative p-6 rounded-2xl text-left
                           bg-[rgba(0,6,20,0.8)] border border-white/[0.06]
                           hover:border-white/[0.12] transition-all duration-300
                           hover:bg-[rgba(0,12,40,0.9)]"
              >
                {/* Glow on hover */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100
                             transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse at 30% 30%, ${card.accent}08, transparent 70%)`,
                  }}
                />
                <div className="relative z-10">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${card.accent}15` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: card.accent }} />
                  </div>
                  <h3 className="text-base font-semibold mb-1 text-white/90 group-hover:text-white transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-sm text-white/40 group-hover:text-white/50 transition-colors">
                    {card.desc}
                  </p>
                  <ArrowRight
                    className="absolute top-6 right-6 w-4 h-4 text-white/10
                               group-hover:text-white/30 group-hover:translate-x-0.5
                               transition-all duration-300"
                  />
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      </AnimatedSection>

      {/* ═══ REGIONS PREVIEW ═══ */}
      <AnimatedSection className="py-20">
        <div className="max-w-6xl mx-auto px-4 mb-8">
          <motion.h2
            variants={fadeUp}
            className="text-2xl sm:text-3xl font-bold mb-3"
          >
            Регионы мониторинга
          </motion.h2>
          <motion.p variants={fadeUp} className="text-white/40 max-w-lg">
            Охват водных ресурсов по всему миру
          </motion.p>
        </div>

        <motion.div variants={fadeUp} className="relative">
          <div
            className="flex gap-4 overflow-x-auto px-4 pb-4 scrollbar-thin
                        scrollbar-thumb-white/10 scrollbar-track-transparent
                        snap-x snap-mandatory"
            style={{ scrollPaddingLeft: 'max(1rem, calc((100vw - 72rem)/2))' }}
          >
            {/* Spacer to align with max-w-6xl */}
            <div className="shrink-0 w-[max(0px,calc((100vw-72rem)/2))]" />

            {ALL_REGIONS.map((region) => {
              const stress = STRESS_CONFIG[region.key_stats.water_stress_level];
              return (
                <button
                  key={region.id}
                  onClick={() => navigate('/map')}
                  className="group shrink-0 w-[260px] snap-start p-5 rounded-2xl text-left
                             bg-[rgba(0,6,20,0.8)] border border-white/[0.06]
                             hover:border-white/[0.12] transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{region.emoji}</span>
                    <div>
                      <h3 className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors">
                        {region.name_ru}
                      </h3>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full ${stress.bg} ${stress.text}`}>
                        {stress.label} стресс
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-white/30 space-y-1">
                    <div className="flex justify-between">
                      <span>Население</span>
                      <span className="text-white/50">
                        {region.key_stats.population_millions >= 1000
                          ? `${(region.key_stats.population_millions / 1000).toFixed(1)} млрд`
                          : `${region.key_stats.population_millions} млн`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Вода/чел/год</span>
                      <span className="text-white/50">
                        {region.key_stats.renewable_water_per_capita_m3.toLocaleString()} м{'³'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Проектов</span>
                      <span className="text-white/50">{region.key_projects_count}</span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-[11px] text-white/20 group-hover:text-cyan-400/50 transition-colors">
                    На карте
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </button>
              );
            })}

            {/* End spacer */}
            <div className="shrink-0 w-4" />
          </div>
        </motion.div>
      </AnimatedSection>

      {/* ═══ PLATFORM HIGHLIGHTS ═══ */}
      <AnimatedSection className="max-w-6xl mx-auto px-4 py-20">
        <motion.h2
          variants={fadeUp}
          className="text-2xl sm:text-3xl font-bold text-center mb-3"
        >
          Технологии платформы
        </motion.h2>
        <motion.p
          variants={fadeUp}
          className="text-white/40 text-center mb-12 max-w-lg mx-auto"
        >
          Инновационный стек для управления водными инвестициями
        </motion.p>

        <motion.div
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {HIGHLIGHTS.map((h) => {
            const Icon = h.icon;
            return (
              <motion.div
                key={h.title}
                variants={fadeUp}
                className="relative p-8 rounded-2xl bg-[rgba(0,6,20,0.8)]
                           border border-white/[0.06] text-center group
                           hover:border-white/[0.1] transition-all duration-500"
              >
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100
                             transition-opacity duration-700 pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse at 50% 0%, ${h.accent}08, transparent 70%)`,
                  }}
                />
                <div className="relative z-10">
                  <div
                    className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center"
                    style={{ backgroundColor: `${h.accent}12` }}
                  >
                    <Icon className="w-7 h-7" style={{ color: h.accent }} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{h.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{h.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatedSection>

      {/* ═══ COMPLETED PROJECTS ═══ */}
      <AnimatedSection className="max-w-6xl mx-auto px-4 py-20">
        <motion.div variants={fadeUp} className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">
              Реализованные проекты
            </h2>
            <p className="text-white/40 text-sm">
              {COMPLETED_PROJECTS_COUNT} проектов в {countriesInProjects.length} странах
            </p>
          </div>
          <button
            onClick={() => navigate('/hub')}
            className="hidden sm:flex items-center gap-1.5 text-sm text-cyan-400/70
                       hover:text-cyan-400 transition-colors"
          >
            Смотреть все
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>

        <motion.div
          variants={stagger}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {featuredProjects.map((project) => (
            <motion.div
              key={project.id}
              variants={fadeUp}
              className="group p-5 rounded-2xl bg-[rgba(0,6,20,0.8)]
                         border border-white/[0.06] hover:border-white/[0.12]
                         transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getCountryFlag(project.country)}</span>
                  <div>
                    <div className="text-xs text-white/30">{project.city}</div>
                    <div className="flex items-center gap-1.5 text-[11px] text-white/20">
                      <CalendarDays className="w-3 h-3" />
                      {project.year}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">
                  Завершен
                </span>
              </div>
              <h4 className="text-sm font-medium text-white/80 group-hover:text-white/90 transition-colors line-clamp-2 mb-2">
                {project.name_ru}
              </h4>
              {project.capacity_m3_day && (
                <div className="text-xs text-white/30">
                  {project.capacity_m3_day.toLocaleString()} м{'³'}/сут
                </div>
              )}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {project.technology.slice(0, 2).map((tech) => (
                  <span
                    key={tech}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] text-white/30"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Mobile "see all" */}
        <motion.div variants={fadeUp} className="mt-6 text-center sm:hidden">
          <button
            onClick={() => navigate('/hub')}
            className="inline-flex items-center gap-1.5 text-sm text-cyan-400/70
                       hover:text-cyan-400 transition-colors"
          >
            Смотреть все проекты
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </AnimatedSection>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-white/[0.06] bg-[rgba(0,4,12,0.6)]">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="VODPROM" className="w-6 h-6"
                style={{ filter: 'brightness(0) invert(1) sepia(1) saturate(2) hue-rotate(185deg)' }} />
              <div>
                <div className="font-bold text-white/90">VODPROM</div>
                <div className="text-xs text-white/30">Powered by VODecology</div>
              </div>
            </div>

            {/* Links */}
            <nav className="flex flex-wrap gap-x-6 gap-y-2">
              {[
                { label: 'Карта', to: '/map' },
                { label: 'Хаб', to: '/hub' },
                { label: 'Каталог', to: '/catalog' },
                { label: 'R&D', to: '/rd' },
                { label: 'Инвестиции', to: '/invest' },
                { label: 'Контакты', to: '/contacts' },
              ].map((link) => (
                <button
                  key={link.to}
                  onClick={() => navigate(link.to)}
                  className="text-sm text-white/30 hover:text-white/60 transition-colors"
                >
                  {link.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-8 pt-6 border-t border-white/[0.04] text-center text-xs text-white/20">
            VODPROM &copy; 2026. Все права защищены.
          </div>
        </div>
      </footer>

      {/* ═══ CSS Animations ═══ */}
      <style>{`
        @keyframes pulse-ring {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.08); opacity: 0.1; }
        }
        @keyframes float-particle {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.2; }
          25% { transform: translateY(-20px) translateX(10px); opacity: 0.5; }
          50% { transform: translateY(-10px) translateX(-5px); opacity: 0.3; }
          75% { transform: translateY(-30px) translateX(15px); opacity: 0.4; }
        }
        .scrollbar-thin::-webkit-scrollbar { height: 4px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
