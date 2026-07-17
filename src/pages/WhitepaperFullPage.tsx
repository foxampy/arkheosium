import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, Download, FileText, ChevronRight, ExternalLink,
  Map, BarChart2, Droplets, Building2, FolderOpen, FlaskConical,
  ShoppingCart, Activity, Bell, TrendingUp, Newspaper,
  Globe2, Brain, Cpu, Waves, Network, Database, Leaf, Zap,
  Rocket, GraduationCap, Shield, Layers, Boxes, Orbit,
  Handshake, Sparkles, Target, Eye, Compass,
} from 'lucide-react';

// ══════════════════════════════════════════════════════════════════════════════
//  ArkheOSium — Full Whitepaper (business / vision presentation)
//  Route: /whitepaper-full
// ══════════════════════════════════════════════════════════════════════════════

const ACCENT = '#00e6c8';
const ACCENT2 = '#00d4ff';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface OSModule {
  Icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  name: string;
  tag: string;
  color: string;
  desc: string;
  value: string;
}

interface EcoLayer {
  Icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  title: string;
  desc: string;
  color: string;
}

interface AiAgent { name: string; role: string; }

interface Phase {
  num: string;
  period: string;
  title: string;
  invest: string;
  color: string;
  points: string[];
}

// ─── Data: 12 OS modules ─────────────────────────────────────────────────────────

const OS_MODULES: OSModule[] = [
  {
    Icon: Map, name: 'Карта Земли', tag: 'Earth Explorer', color: '#00e6c8',
    desc: 'Планетарный цифровой двойник: 3D-глобус с реальными объектами, ресурсами, климатом и инфраструктурой. Единая точка входа во всю экосистему.',
    value: 'Глобальный контекст любого проекта в одном интерфейсе',
  },
  {
    Icon: BarChart2, name: 'Аналитика', tag: 'Analytics', color: '#60a5fa',
    desc: 'Сквозная аналитика по объектам, субъектам и проектам: KPI, тренды, сценарное моделирование, оценка воздействия и экономические модели.',
    value: 'Решения на основе данных, а не интуиции',
  },
  {
    Icon: Droplets, name: 'Объекты', tag: 'Objects Registry', color: '#00d4ff',
    desc: 'Цифровые паспорта водных, земельных и инфраструктурных объектов. Полный жизненный цикл, история, документы и цифровой двойник каждого объекта.',
    value: 'Прозрачный реестр реальных активов территории',
  },
  {
    Icon: Building2, name: 'Субъекты', tag: 'Subjects', color: '#fbbf24',
    desc: 'Цифровые двойники организаций, государств, компаний и университетов: их роли, связи, компетенции и участие в проектах экосистемы.',
    value: 'Карта всех участников и их взаимосвязей',
  },
  {
    Icon: FolderOpen, name: 'Проекты', tag: 'Project Hub', color: '#4ade80',
    desc: 'Ядро управления проектами: от идеи до эксплуатации. Дорожные карты, вехи, бюджеты, риски, документы и связи с объектами и субъектами.',
    value: 'Единая среда разработки инфраструктурных инициатив',
  },
  {
    Icon: FlaskConical, name: 'R&D', tag: 'Research', color: '#f59e0b',
    desc: 'Научно-исследовательский модуль: лаборатории, эксперименты, публикации, патенты и граф знаний. Связь науки с прикладными проектами.',
    value: 'Наука встроена в цикл принятия решений',
  },
  {
    Icon: ShoppingCart, name: 'Тех.маркет', tag: 'Technology Marketplace', color: '#a78bfa',
    desc: 'Маркетплейс технологий, оборудования, материалов и поставщиков. Карточки с рейтингом, стоимостью, совместимостью и экопоказателями.',
    value: 'Быстрый подбор проверенных решений для проектов',
  },
  {
    Icon: Activity, name: 'IoT', tag: 'Sensor Network', color: '#34d399',
    desc: 'Сеть датчиков и телеметрии: качество воды, воздуха, грунта, энергопотребление. Данные в реальном времени поступают в цифровой двойник.',
    value: 'Территория, которая непрерывно сообщает о себе',
  },
  {
    Icon: Bell, name: 'Алерты', tag: 'Alerts', color: '#f87171',
    desc: 'Система раннего предупреждения: экологические риски, аномалии, отклонения KPI и критические события выявляются до наступления последствий.',
    value: 'Переход от реагирования к предупреждению',
  },
  {
    Icon: TrendingUp, name: 'Инвестиции', tag: 'Investment Hub', color: '#fbbf24',
    desc: 'Инвестиционный контур: проекты, финансовые модели, CAPEX/OPEX, ROI, цифровые активы и токенизация экологической инфраструктуры.',
    value: 'Восстановление среды становится инвестиционным продуктом',
  },
  {
    Icon: FileText, name: 'Документы', tag: 'Documents', color: '#00e6c8',
    desc: 'Единая система документов: whitepapers, стратегии, мастер-планы, спецификации, стандарты, контракты, отчёты и презентации.',
    value: 'Вся институциональная память в одном месте',
  },
  {
    Icon: Newspaper, name: 'Обновления', tag: 'Updates', color: '#06b6d4',
    desc: 'Лента развития платформы и экосистемы: новые модули, релизы, прототипы интерфейсов и ключевые события проектов.',
    value: 'Живой пульс развивающейся экосистемы',
  },
];

// ─── Data: ecosystem layers ──────────────────────────────────────────────────────

const ECO_LAYERS: EcoLayer[] = [
  { Icon: Orbit, title: 'Спутники и наблюдение', desc: 'SAR, гиперспектр, LiDAR и климатические данные формируют глобальный слой наблюдения Земли.', color: '#00d4ff' },
  { Icon: Network, title: 'Планетарный цифровой двойник', desc: 'Реки, каналы, климат, экосистемы и города — единая непрерывно обновляемая цифровая модель.', color: '#7c3aed' },
  { Icon: Brain, title: 'AI Core', desc: 'Интеллектуальное ядро: специализированные AI-агенты, оркестратор и контекстная память управляют комплексом.', color: '#00e6c8' },
  { Icon: Cpu, title: 'Quantum & HPC', desc: 'Квантовые вычисления и суперкомпьютер решают задачи климата, гидродинамики и материаловедения.', color: '#f59e0b' },
  { Icon: Layers, title: 'Domain Intelligence', desc: 'Вода, энергия, экология, инфраструктура и экономика — как взаимосвязанные подсистемы одной ОС.', color: '#22c55e' },
  { Icon: Boxes, title: 'VOD.eco / DAO / Blockchain', desc: 'Блокчейн-реестр данных, токенизация, DAO-управление и смарт-контракты финансирования восстановления.', color: '#ec4899' },
];

// ─── Data: AI agents ─────────────────────────────────────────────────────────────

const AI_AGENTS: AiAgent[] = [
  { name: 'AI Architect', role: 'архитектура' },
  { name: 'AI Engineer', role: 'инженерия' },
  { name: 'AI Hydrologist', role: 'гидрология' },
  { name: 'AI Ecologist', role: 'экология' },
  { name: 'AI Economist', role: 'экономика' },
  { name: 'AI Urban Planner', role: 'урбанистика' },
  { name: 'AI Energy Engineer', role: 'энергетика' },
  { name: 'AI Investment Advisor', role: 'инвестиции' },
  { name: 'AI Research Assistant', role: 'исследования' },
  { name: 'AI Legal Advisor', role: 'право' },
  { name: 'AI Procurement', role: 'закупки' },
  { name: 'AI Technical Writer', role: 'документы' },
];

// ─── Data: roadmap phases ────────────────────────────────────────────────────────

const PHASES: Phase[] = [
  {
    num: 'I', period: '2026–2028', title: 'Исследования и цифровой фундамент', invest: '$0.5–1B', color: '#00e6c8',
    points: ['Международный научный консорциум', 'Создание Digital Twin Aral', 'Спутниковый мониторинг', 'Пилотная сеть датчиков'],
  },
  {
    num: 'II', period: '2028–2032', title: 'Инженерная инфраструктура', invest: '$5–10B', color: '#00d4ff',
    points: ['Возобновляемая энергетика', 'Водные системы и гидросооружения', 'Первая инфраструктура острова', 'Запуск AI Core'],
  },
  {
    num: 'III', period: '2032–2040', title: 'Автономный город', invest: '$30–50B', color: '#7c3aed',
    points: ['Полный островной город', 'Quantum Computing Center', 'Подводная инфраструктура', 'Инновационная экосистема'],
  },
  {
    num: 'IV', period: '2040+', title: 'Глобальная экологическая платформа', invest: 'Экспорт', color: '#22c55e',
    points: ['Восстановленная экосистема', 'Глобальная сеть управления водой', 'Экспорт технологий и моделей', 'Тиражирование в других регионах'],
  },
];

// ─── Data: AI Core specialised systems ───────────────────────────────────────────

const AI_CORE_SYSTEMS = [
  { Icon: Leaf, title: 'Environmental AI', desc: 'Качество воды, климат, биоразнообразие. Прогноз экологических рисков до их наступления.', color: '#22c55e' },
  { Icon: Zap, title: 'Infrastructure AI', desc: 'Энергия, транспорт, здания и распределение ресурсов в реальном времени.', color: '#f59e0b' },
  { Icon: FlaskConical, title: 'Scientific AI', desc: 'Климатические симуляции, материаловедение, биотехнологии и моделирование среды.', color: '#00d4ff' },
  { Icon: TrendingUp, title: 'Economic AI', desc: 'Инвестиционные сценарии, распределение ресурсов и рыночные возможности.', color: '#fbbf24' },
];

// ─── Reusable: animated section ──────────────────────────────────────────────────

function Section({ id, eyebrow, title, subtitle, children }: {
  id: string; eyebrow?: string; title: string; subtitle?: string; children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 py-14 md:py-20 border-t border-white/5 first:border-0">
      <div className="max-w-5xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          {eyebrow && (
            <div className="text-xs font-semibold uppercase tracking-[0.25em] mb-3" style={{ color: ACCENT }}>
              {eyebrow}
            </div>
          )}
          <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight leading-tight">{title}</h2>
          {subtitle && <p className="mt-4 text-gray-400 text-sm md:text-base max-w-2xl leading-relaxed">{subtitle}</p>}
        </motion.div>
        {children}
      </div>
    </section>
  );
}

function StatChip({ val, label, color }: { val: string; label: string; color: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.4 }}
      className="bg-[#000d24] border border-white/10 rounded-xl p-4 text-center"
    >
      <div className="text-xl md:text-2xl font-black font-mono" style={{ color }}>{val}</div>
      <div className="text-[11px] md:text-xs text-gray-500 mt-1">{label}</div>
    </motion.div>
  );
}

// ─── TOC ─────────────────────────────────────────────────────────────────────────

const TOC = [
  { id: 'vision', label: 'Видение', Icon: Eye },
  { id: 'ecosystem', label: 'Экосистема', Icon: Globe2 },
  { id: 'modules', label: 'Модули ОС', Icon: Layers },
  { id: 'aral', label: 'ARAL NEXUS', Icon: Waves },
  { id: 'aicore', label: 'AI Core', Icon: Brain },
  { id: 'roadmap', label: 'Дорожная карта', Icon: Compass },
  { id: 'cta', label: 'Сотрудничество', Icon: Handshake },
];

// ══════════════════════════════════════════════════════════════════════════════

export default function WhitepaperFullPage() {
  const [, navigate] = useLocation();
  const { t } = useTranslation();
  const [active, setActive] = useState('vision');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: '-30% 0px -60% 0px' }
    );
    TOC.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="min-h-screen text-gray-200">

      {/* ── Top bar ── */}
      <div className="sticky top-0 z-40 bg-[#000818]/95 backdrop-blur border-b border-white/5 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-[#00e6c8]/70 hover:text-[#00e6c8] transition-colors flex-shrink-0"
        >
          <ArrowLeft size={16} /> {t('wpFull.back')}
        </button>
        <div className="flex items-center gap-2 text-sm text-gray-400 flex-shrink-0">
          <FileText size={14} />
          <span className="hidden sm:inline">{t('wpFull.doc_label')}</span>
          <span className="sm:hidden">Whitepaper</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => navigate('/aral-whitepaper')}
            className="hidden sm:flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border border-[#7c3aed]/30 text-[#7c3aed] hover:bg-[#7c3aed]/10 transition-colors"
          >
            <Waves size={12} /> ARAL NEXUS
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border border-[#00e6c8]/30 text-[#00e6c8] hover:bg-[#00e6c8]/10 transition-colors"
          >
            <Download size={12} /> PDF
          </button>
        </div>
      </div>

      {/* ── Progress-linked layout ── */}
      <div className="flex">
        {/* Sidebar TOC */}
        <aside className="hidden lg:block w-56 flex-shrink-0 border-r border-white/5">
          <div className="sticky top-[57px] p-5">
            <div className="text-[11px] font-semibold text-gray-600 uppercase tracking-widest mb-4">
              {t('wpFull.toc_title')}
            </div>
            <nav className="space-y-1">
              {TOC.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  className={`w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                    active === id ? 'bg-[#00e6c8]/10 text-[#00e6c8]' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                  }`}
                >
                  <Icon size={14} />
                  <span className="truncate">{label}</span>
                  {active === id && <ChevronRight size={12} className="ml-auto text-[#00e6c8]" />}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main column */}
        <main className="flex-1 min-w-0">

          {/* ══ HERO ══ */}
          <section id="vision" className="relative overflow-hidden border-b border-white/5 scroll-mt-24">
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-b from-[#00153a]/50 to-[#000818]" />
              <motion.div
                className="absolute -top-20 right-0 w-[600px] h-[360px] rounded-full bg-[#00e6c8]/8 blur-3xl"
                animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
                transition={{ duration: 12, repeat: Infinity }}
              />
              <motion.div
                className="absolute bottom-0 left-1/4 w-[460px] h-[240px] rounded-full bg-[#7c3aed]/10 blur-3xl"
                animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
                transition={{ duration: 14, repeat: Infinity }}
              />
            </div>

            <div className="relative max-w-5xl mx-auto px-4 py-16 md:py-24">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center gap-3 mb-6 flex-wrap">
                  <div className="flex items-center gap-2 text-xs text-[#00e6c8] bg-[#00e6c8]/10 border border-[#00e6c8]/20 rounded-full px-3 py-1">
                    <Sparkles size={11} /> {t('wpFull.badge_version')}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#00d4ff] bg-[#00d4ff]/10 border border-[#00d4ff]/20 rounded-full px-3 py-1">
                    <Globe2 size={11} /> {t('wpFull.badge_os')}
                  </div>
                </div>

                <h1 className="text-5xl md:text-7xl font-black text-white mb-5 tracking-tight leading-[0.95]">
                  ARKHEOSIUM
                  <br />
                  <span className="bg-gradient-to-r from-[#00e6c8] via-[#00d4ff] to-[#7c3aed] bg-clip-text text-transparent text-3xl md:text-5xl">
                    {t('wpFull.hero_subtitle')}
                  </span>
                </h1>

                <p className="text-gray-400 text-base md:text-xl mb-8 max-w-2xl leading-relaxed">
                  {t('wpFull.hero_lead')}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl">
                  <StatChip val="12" label={t('wpFull.stat_modules')} color="#00e6c8" />
                  <StatChip val="1" label={t('wpFull.stat_twin')} color="#00d4ff" />
                  <StatChip val="∞" label={t('wpFull.stat_scale')} color="#7c3aed" />
                  <StatChip val="2040+" label={t('wpFull.stat_horizon')} color="#22c55e" />
                </div>
              </motion.div>
            </div>
          </section>

          {/* ══ VISION statement ══ */}
          <Section id="vision-body" eyebrow={t('wpFull.vision_eyebrow')} title={t('wpFull.vision_title')} subtitle={t('wpFull.vision_sub')}>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { Icon: Target, title: t('wpFull.vision_c1_t'), desc: t('wpFull.vision_c1_d'), color: '#00e6c8' },
                { Icon: Eye, title: t('wpFull.vision_c2_t'), desc: t('wpFull.vision_c2_d'), color: '#00d4ff' },
                { Icon: Compass, title: t('wpFull.vision_c3_t'), desc: t('wpFull.vision_c3_d'), color: '#7c3aed' },
              ].map((c, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-2xl border p-6"
                  style={{ borderColor: c.color + '25', background: `linear-gradient(135deg, ${c.color}08, transparent)` }}
                >
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: c.color + '18', color: c.color }}>
                    <c.Icon size={20} />
                  </div>
                  <h3 className="text-white font-bold mb-2">{c.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{c.desc}</p>
                </motion.div>
              ))}
            </div>
          </Section>

          {/* ══ ECOSYSTEM overview ══ */}
          <Section id="ecosystem" eyebrow={t('wpFull.eco_eyebrow')} title={t('wpFull.eco_title')} subtitle={t('wpFull.eco_sub')}>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ECO_LAYERS.map((layer, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="bg-[#000d24] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: layer.color + '18', color: layer.color }}>
                    <layer.Icon size={18} />
                  </div>
                  <h3 className="text-white font-semibold mb-2">{layer.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{layer.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* Flow */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mt-8 bg-[#000d24] border border-[#00e6c8]/15 rounded-2xl p-6"
            >
              <div className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: ACCENT }}>{t('wpFull.eco_flow_title')}</div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-300">
                {['Спутники', 'Дроны', 'Датчики', 'Подводная дата-база', 'AI Core', 'Quantum', 'Digital Twin', 'Автономное управление', 'VOD.eco / DAO'].map((step, i, arr) => (
                  <span key={step} className="flex items-center gap-2">
                    <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">{step}</span>
                    {i < arr.length - 1 && <ChevronRight size={14} className="text-[#00e6c8]/50" />}
                  </span>
                ))}
              </div>
            </motion.div>
          </Section>

          {/* ══ 12 MODULES ══ */}
          <Section id="modules" eyebrow={t('wpFull.mod_eyebrow')} title={t('wpFull.mod_title')} subtitle={t('wpFull.mod_sub')}>
            <div className="grid sm:grid-cols-2 gap-4">
              {OS_MODULES.map((mod, i) => (
                <motion.div
                  key={mod.name}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ delay: (i % 2) * 0.08 }}
                  className="group bg-[#000d24] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                      style={{ background: `linear-gradient(145deg, ${mod.color}22, ${mod.color}0d)`, border: `1px solid ${mod.color}30`, color: mod.color }}
                    >
                      <mod.Icon size={22} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <h3 className="text-white font-bold">{mod.name}</h3>
                        <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: mod.color }}>{mod.tag}</span>
                      </div>
                      <p className="text-sm text-gray-400 leading-relaxed mt-2">{mod.desc}</p>
                      <div className="mt-3 flex items-start gap-2 pt-3 border-t border-white/5">
                        <Sparkles size={13} className="mt-0.5 flex-shrink-0" style={{ color: mod.color }} />
                        <span className="text-xs text-gray-300">{mod.value}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Section>

          {/* ══ ARAL NEXUS megaproject ══ */}
          <Section id="aral" eyebrow={t('wpFull.aral_eyebrow')} title={t('wpFull.aral_title')} subtitle={t('wpFull.aral_sub')}>
            <div className="rounded-2xl border border-[#00d4ff]/20 p-6 md:p-8 bg-gradient-to-br from-[#00d4ff]/5 to-transparent mb-6">
              <div className="grid md:grid-cols-2 gap-6 items-center">
                <div>
                  <div className="flex items-center gap-2 text-[#00d4ff] mb-4">
                    <Waves size={20} />
                    <span className="font-bold text-lg">Центральный остров</span>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed mb-4">
                    В центре восстановленного моря — искусственный остров-столица проекта: административный,
                    научный, вычислительный, экологический, образовательный и туристический центр.
                    Полностью экологически автономный город.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Научный', 'AI & Quantum', 'Жилой', 'Медицинский', 'Инженерный', 'Деловой', 'Туристический', 'Культурный'].map((d) => (
                      <span key={d} className="text-xs px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-400">{d}</span>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <StatChip val="$60B+" label="инвестиций (все фазы)" color="#00d4ff" />
                  <StatChip val="1M+" label="IoT-датчиков среды" color="#22c55e" />
                  <StatChip val="100%" label="автономность энергии" color="#f59e0b" />
                  <StatChip val="20" label="взаимосвязанных программ" color="#7c3aed" />
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { Icon: Database, title: 'Подводная дата-база', desc: 'Герметичные модули с серверами и ИИ. Естественное охлаждение, минимум энергии, высокая отказоустойчивость.', color: '#1d4ed8' },
                { Icon: Rocket, title: 'Автономные роботы', desc: 'Подводные, надводные и воздушные флоты: исследование, мониторинг, обслуживание и восстановление среды.', color: '#6366f1' },
                { Icon: Leaf, title: 'Восстановление среды', desc: 'Очистка воды, новые каналы, искусственные болота, борьба с опустыниванием и восстановление биоразнообразия.', color: '#22c55e' },
                { Icon: Zap, title: 'Энергетическое кольцо', desc: 'Солнце, ветер, плавучие станции, водород и Smart Grid — 100% возобновляемый энергобаланс.', color: '#f59e0b' },
              ].map((c, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-[#000d24] border border-white/10 rounded-2xl p-5"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: c.color + '18', color: c.color }}>
                    <c.Icon size={18} />
                  </div>
                  <h3 className="text-white font-semibold text-sm mb-2">{c.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{c.desc}</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={() => navigate('/aral-whitepaper')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00d4ff]/10 border border-[#00d4ff]/30 text-[#00d4ff] hover:bg-[#00d4ff]/20 transition-colors text-sm font-medium"
              >
                <ExternalLink size={14} /> {t('wpFull.aral_cta')}
              </button>
            </div>
          </Section>

          {/* ══ AI CORE ══ */}
          <Section id="aicore" eyebrow={t('wpFull.ai_eyebrow')} title={t('wpFull.ai_title')} subtitle={t('wpFull.ai_sub')}>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {AI_CORE_SYSTEMS.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-[#000d24] border border-white/10 rounded-2xl p-5"
                  style={{ borderColor: s.color + '20' }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: s.color + '18', color: s.color }}>
                    <s.Icon size={18} />
                  </div>
                  <h3 className="text-white font-semibold text-sm mb-2">{s.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{s.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* Quantum + Digital Twin strip */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <div className="rounded-2xl border border-[#f59e0b]/20 p-6 bg-gradient-to-br from-[#f59e0b]/5 to-transparent">
                <div className="flex items-center gap-2 text-[#f59e0b] mb-3"><Cpu size={18} /><span className="font-bold">Quantum Computing Center</span></div>
                <p className="text-sm text-gray-300 leading-relaxed">
                  Моделирование климата и водных потоков, оптимизация энергетики и транспорта, разработка
                  новых материалов, молекулярное моделирование и квантовые алгоритмы ИИ.
                </p>
              </div>
              <div className="rounded-2xl border border-[#7c3aed]/20 p-6 bg-gradient-to-br from-[#7c3aed]/5 to-transparent">
                <div className="flex items-center gap-2 text-[#7c3aed] mb-3"><Network size={18} /><span className="font-bold">Digital Twin Aral</span></div>
                <p className="text-sm text-gray-300 leading-relaxed">
                  Полная цифровая копия региона: каждая река, канал, климат, испарение, экосистемы,
                  энергетика и город. Любое изменение сначала проверяется здесь.
                </p>
              </div>
            </div>

            {/* AI agents */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: ACCENT }}>{t('wpFull.ai_agents_title')}</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {AI_AGENTS.map((a, i) => (
                  <motion.div
                    key={a.name}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-2 bg-[#000d24] border border-white/5 rounded-lg px-3 py-2.5"
                  >
                    <Brain size={13} className="text-[#00e6c8] flex-shrink-0" />
                    <span className="text-xs text-white truncate">{a.name}</span>
                    <span className="text-[10px] text-gray-500 ml-auto flex-shrink-0">{a.role}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </Section>

          {/* ══ ROADMAP ══ */}
          <Section id="roadmap" eyebrow={t('wpFull.rm_eyebrow')} title={t('wpFull.rm_title')} subtitle={t('wpFull.rm_sub')}>
            <div className="relative pl-6 border-l-2 border-[#00e6c8]/20 space-y-8">
              {PHASES.map((p, i) => (
                <motion.div
                  key={p.num}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative"
                >
                  <div
                    className="absolute -left-[35px] top-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-black"
                    style={{ background: '#000818', borderColor: p.color, color: p.color }}
                  >
                    {p.num}
                  </div>
                  <div className="rounded-2xl border p-5" style={{ borderColor: p.color + '25', background: `linear-gradient(135deg, ${p.color}08, transparent)` }}>
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <span className="font-mono text-xs px-2 py-0.5 rounded" style={{ color: p.color, background: p.color + '15' }}>{p.period}</span>
                      <h3 className="text-white font-bold">{p.title}</h3>
                      <span className="ml-auto font-mono text-sm font-bold" style={{ color: p.color }}>{p.invest}</span>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5">
                      {p.points.map((pt) => (
                        <div key={pt} className="flex items-center gap-2 text-sm text-gray-400">
                          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: p.color }} />
                          {pt}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Principles */}
            <div className="mt-12">
              <div className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: ACCENT }}>{t('wpFull.principles_title')}</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {[
                  { label: 'AI First', color: '#00e6c8' },
                  { label: 'Digital Twin First', color: '#00d4ff' },
                  { label: 'Zero Waste', color: '#22c55e' },
                  { label: 'Carbon Neutral', color: '#22c55e' },
                  { label: 'Water Positive', color: '#0099ff' },
                  { label: 'Nature Positive', color: '#22c55e' },
                  { label: 'Quantum Ready', color: '#7c3aed' },
                  { label: 'Open Science', color: '#00e6c8' },
                  { label: 'DAO Governance', color: '#ec4899' },
                  { label: 'ESG / SDGs', color: '#f59e0b' },
                  { label: 'Circular Economy', color: '#22c55e' },
                  { label: 'International Co-op', color: '#0099ff' },
                ].map((pr, i) => (
                  <motion.div
                    key={pr.label}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-2 bg-[#000d24] border border-white/5 rounded-lg px-3 py-2"
                  >
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: pr.color }} />
                    <span className="text-xs text-gray-400">{pr.label}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </Section>

          {/* ══ CTA ══ */}
          <section id="cta" className="scroll-mt-24 py-16 border-t border-white/5">
            <div className="max-w-3xl mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-2xl border border-[#00e6c8]/20 p-8 text-center bg-gradient-to-b from-[#00e6c8]/5 to-transparent"
              >
                <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-5 bg-[#00e6c8]/10 text-[#00e6c8]">
                  <Handshake size={26} />
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-white mb-3">{t('wpFull.cta_title')}</h2>
                <p className="text-gray-400 text-sm md:text-base mb-7 max-w-xl mx-auto leading-relaxed">{t('wpFull.cta_sub')}</p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <button
                    onClick={() => navigate('/aral-nexus')}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00d4ff]/10 border border-[#00d4ff]/30 text-[#00d4ff] hover:bg-[#00d4ff]/20 transition-colors text-sm font-medium"
                  >
                    <Waves size={14} /> {t('wpFull.cta_megaproject')}
                  </button>
                  <button
                    onClick={() => navigate('/invest')}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7c3aed]/10 border border-[#7c3aed]/30 text-[#7c3aed] hover:bg-[#7c3aed]/20 transition-colors text-sm font-medium"
                  >
                    <TrendingUp size={14} /> {t('wpFull.cta_invest')}
                  </button>
                  <button
                    onClick={() => navigate('/contacts')}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white transition-colors text-sm font-medium"
                  >
                    <Shield size={14} /> {t('wpFull.cta_contacts')}
                  </button>
                </div>
                <p className="text-xs text-gray-600 mt-8">{t('wpFull.copyright')}</p>
              </motion.div>
            </div>
          </section>

        </main>
      </div>

      {/* keep AnimatePresence import used (mobile-safe future use) */}
      <AnimatePresence />
    </div>
  );
}
