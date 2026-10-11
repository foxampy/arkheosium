import { useState, useRef, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import {
  ArrowLeft, Cpu, Waves, Wind, Zap, Globe2, Brain, Database,
  Bot, FlaskConical, Leaf, Building2, Droplets, BarChart3,
  Microscope, GraduationCap, Lightbulb, TreePine, Sun,
  Network, Satellite, ChevronRight, ExternalLink, Radio,
  Factory, Fish, Rocket, Shield
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type Category = 'all' | 'digital' | 'water' | 'energy' | 'city' | 'integration';

interface Component {
  id: number;
  title: string;
  desc: string;
  icon: React.ReactNode;
  category: Category;
  color: string;
}

interface Phase {
  num: number;
  title: string;
  budget: string;
  duration: string;
  items: string[];
  color: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const COMPONENTS: Component[] = [
  { id: 1,  title: 'Центральный остров',       desc: 'Административный, научный и культурный центр восстановленного моря. Полностью автономный экогород будущего.',                      icon: <Globe2 size={18}/>,       category: 'city',        color: '#7c3aed' },
  { id: 2,  title: 'AI Core',                  desc: 'Главный интеллект: суперкомпьютер + квантовый кластер + AI-ядро. Управляет всеми системами в реальном времени.',                icon: <Brain size={18}/>,        category: 'digital',     color: '#00d4ff' },
  { id: 3,  title: 'Quantum Computing Center', desc: 'Моделирование климата, водных потоков, разработка материалов, биоинформатика и квантовые алгоритмы ИИ.',                        icon: <Cpu size={18}/>,          category: 'digital',     color: '#00d4ff' },
  { id: 4,  title: 'Underwater DataBase',      desc: 'Сеть герметичных подводных модулей. Естественное охлаждение, минимум энергии, высокая отказоустойчивость.',                     icon: <Database size={18}/>,     category: 'digital',     color: '#0099ff' },
  { id: 5,  title: 'Sensor Network',           desc: 'Тысячи интеллектуальных датчиков: вода, минерализация, кислород, температура, биоразнообразие — всё в AI Core.',              icon: <Radio size={18}/>,        category: 'digital',     color: '#0099ff' },
  { id: 6,  title: 'Underwater Robots',        desc: 'Флот автономных подводных машин: исследование дна, картография, очистка, ремонт инфраструктуры.',                              icon: <Bot size={18}/>,          category: 'digital',     color: '#0099ff' },
  { id: 7,  title: 'Surface Drone Fleet',      desc: 'Надводные беспилотники для анализа воды, доставки оборудования, экологического контроля и картографии.',                        icon: <Waves size={18}/>,        category: 'digital',     color: '#0099ff' },
  { id: 8,  title: 'Aerial Drone System',      desc: 'Воздушная сеть БПЛА: мониторинг береговой линии, анализ испарения, контроль растительности и пожаров.',                        icon: <Wind size={18}/>,         category: 'digital',     color: '#00d4ff' },
  { id: 9,  title: 'Satellite Monitoring',     desc: 'Интеграция SAR, гиперспектральной съёмки, LiDAR и климатических данных в цифровой двойник.',                                  icon: <Satellite size={18}/>,    category: 'digital',     color: '#00d4ff' },
  { id: 10, title: 'Digital Twin Aral',        desc: 'Полная цифровая копия региона. Моделирует реки, климат, экосистемы, энергетику, транспорт и экономику.',                       icon: <Network size={18}/>,      category: 'digital',     color: '#00e6c8' },
  { id: 11, title: 'Water Recovery System',    desc: 'Очистка, перераспределение потоков, новые каналы, опреснение, биологическая фильтрация, восстановление дельт.',                icon: <Droplets size={18}/>,     category: 'water',       color: '#00e6c8' },
  { id: 12, title: 'Climate Engineering',      desc: 'Лесопосадки, зелёные пояса, борьба с пылевыми бурями, восстановление почв и управление влагой.',                              icon: <TreePine size={18}/>,     category: 'water',       color: '#22c55e' },
  { id: 13, title: 'Renewable Energy Ring',    desc: 'Солнечные станции, ветропарки, плавучие солнечные платформы, накопители энергии и Smart Grid вокруг комплекса.',              icon: <Sun size={18}/>,          category: 'energy',      color: '#f59e0b' },
  { id: 14, title: 'Hydrogen Center',          desc: 'Производство зелёного водорода и кислорода для транспорта, промышленности и энергетики.',                                       icon: <Zap size={18}/>,          category: 'energy',      color: '#f59e0b' },
  { id: 15, title: 'Circular Economy Hub',     desc: 'Производственный комплекс с нулевыми отходами. Все материалы перерабатываются и повторно используются.',                         icon: <Factory size={18}/>,      category: 'energy',      color: '#f59e0b' },
  { id: 16, title: 'BioTech Center',           desc: 'Исследования микроводорослей, бактерий, биофильтрации, аквакультуры и восстановления экосистем.',                               icon: <FlaskConical size={18}/>, category: 'water',       color: '#22c55e' },
  { id: 17, title: 'AgriTech Zone',            desc: 'Вертикальные фермы, гидропоника, аэропоника, AI-орошение и роботизированные теплицы.',                                          icon: <Leaf size={18}/>,         category: 'water',       color: '#22c55e' },
  { id: 18, title: 'Smart Island City',        desc: 'Полностью автономный город: наука, жильё, медицина, культура и туризм с энергоэффективными зданиями.',                         icon: <Building2 size={18}/>,    category: 'city',        color: '#7c3aed' },
  { id: 19, title: 'Autonomous Transport',     desc: 'Беспилотные автобусы, электро-транспорт, автономные лодки, подводные системы, аэротакси и грузовые дроны.',                    icon: <Rocket size={18}/>,       category: 'city',        color: '#7c3aed' },
  { id: 20, title: 'Research Campus',          desc: 'Международные институты по климатологии, экологии, ИИ, робототехнике, квантовым технологиям и биоинженерии.',                  icon: <Microscope size={18}/>,   category: 'city',        color: '#7c3aed' },
  { id: 21, title: 'Innovation Valley',        desc: 'Технопарк со стартапами, R&D-центрами, лабораториями и производственными прототипными центрами.',                               icon: <Lightbulb size={18}/>,    category: 'city',        color: '#7c3aed' },
  { id: 22, title: 'Global Water Observatory', desc: 'Мировой центр мониторинга рек, озёр, морей, ледников и подземных вод. Эталонная площадка ООН.',                               icon: <BarChart3 size={18}/>,    category: 'water',       color: '#22c55e' },
  { id: 23, title: 'Open Science Platform',    desc: 'Все экологические данные — открытый доступ для университетов, правительств и международных организаций.',                        icon: <GraduationCap size={18}/>,category: 'integration', color: '#ec4899' },
  { id: 24, title: 'VOD.eco Integration',      desc: 'Блокчейн-реестр, токенизация проектов, DAO-управление, смарт-контракты для грантов и цифровые паспорта объектов.',            icon: <Shield size={18}/>,       category: 'integration', color: '#ec4899' },
];

const PHASES: Phase[] = [
  {
    num: 1, title: 'Фаза I — Фундамент',
    budget: '$500M – $1B', duration: '2026–2028', color: '#00d4ff',
    items: ['Международные соглашения', 'Научные исследования', 'Базовая цифровая инфраструктура', 'Запуск сети датчиков', 'Прототип Digital Twin', 'Первые пилотные проекты'],
  },
  {
    num: 2, title: 'Фаза II — Инфраструктура',
    budget: '$5B – $10B', duration: '2028–2032', color: '#7c3aed',
    items: ['AI Core + Quantum Center', 'Underwater DataBase', 'Полный Digital Twin Aral', 'Системы восстановления воды', 'Возобновляемая энергетика', 'Начало городского строительства'],
  },
  {
    num: 3, title: 'Фаза III — Масштабирование',
    budget: '$30B – $50B', duration: '2032–2040', color: '#22c55e',
    items: ['Полное восстановление гидрологии', 'Островной научный город', 'Международный кампус', 'Innovation Valley', 'Транспортный комплекс', 'Биоразнообразие восстановлено'],
  },
  {
    num: 4, title: 'Фаза IV — Глобальная экспансия',
    budget: '$60B+', duration: '2040+', color: '#f59e0b',
    items: ['Полная экологическая автономия', 'Экспорт технологий', 'Глобальный центр воды', 'Тиражирование модели', 'Open Science мирового масштаба', 'DAO-управление в полную силу'],
  },
];

const SUBPROJECTS = [
  { title: 'Aral AI',            desc: 'ИИ управления экосистемой',          color: '#00d4ff' },
  { title: 'Aral Quantum',       desc: 'Квантовые вычисления',                color: '#00d4ff' },
  { title: 'Aral Digital Twin',  desc: 'Цифровой двойник региона',            color: '#00d4ff' },
  { title: 'Aral Data Ocean',    desc: 'Подводная вычислительная инфра',      color: '#0099ff' },
  { title: 'Aral SensorNet',     desc: 'Экологический мониторинг',            color: '#0099ff' },
  { title: 'Aral Robotics',      desc: 'Роботизированные комплексы',          color: '#0099ff' },
  { title: 'Aral Energy',        desc: 'Солнце, ветер, водород',              color: '#f59e0b' },
  { title: 'Aral Water',         desc: 'Управление водными ресурсами',        color: '#22c55e' },
  { title: 'Aral Bio',           desc: 'Восстановление биоразнообразия',      color: '#22c55e' },
  { title: 'Aral Green Belt',    desc: 'Озеленение и борьба с опустыниванием',color: '#22c55e' },
  { title: 'Aral Smart City',    desc: 'Автономный островной город',          color: '#7c3aed' },
  { title: 'Aral University',    desc: 'Международный кампус',                color: '#7c3aed' },
  { title: 'Aral Innovation',    desc: 'Технопарк и стартап-экосистема',      color: '#7c3aed' },
  { title: 'Aral Blue Economy',  desc: 'Новые отрасли водной экономики',      color: '#ec4899' },
  { title: 'Aral Mobility',      desc: 'Интеллектуальный транспорт',          color: '#7c3aed' },
  { title: 'Aral Health',        desc: 'Медицина и биобезопасность',          color: '#ef4444' },
  { title: 'Aral Tourism',       desc: 'Научный и экологический туризм',      color: '#f59e0b' },
  { title: 'Aral Security',      desc: 'Физическая и цифровая безопасность',  color: '#6b7280' },
  { title: 'Aral DAO',           desc: 'Цифровое управление, блокчейн',       color: '#ec4899' },
  { title: 'Aral Open Science',  desc: 'Глобальный обмен научными данными',   color: '#ec4899' },
];

// ─── Architecture Layers ──────────────────────────────────────────────────────

const LAYERS = [
  { id: 'sat',    label: 'Спутники', sub: 'SAR · LiDAR · Гиперспектр',   color: '#94a3b8', icon: <Satellite size={14}/> },
  { id: 'air',    label: 'Воздушные дроны', sub: 'Картография · Мониторинг', color: '#00d4ff', icon: <Wind size={14}/> },
  { id: 'surf',   label: 'Надводные платформы', sub: 'Анализ · Доставка',  color: '#0099ff', icon: <Waves size={14}/> },
  { id: 'sub',    label: 'Подводный слой', sub: 'Датчики · Роботы',         color: '#1d4ed8', icon: <Bot size={14}/> },
  { id: 'db',     label: 'Underwater DataBase', sub: 'Серверы · ИИ · Архив', color: '#4f46e5', icon: <Database size={14}/> },
  { id: 'ai',     label: 'AI Core + Quantum', sub: 'Суперкомп. · Предикт.',  color: '#7c3aed', icon: <Brain size={14}/> },
  { id: 'twin',   label: 'Digital Twin Aral', sub: 'Полная модель региона',  color: '#00e6c8', icon: <Network size={14}/> },
  { id: 'app',    label: 'Приложения', sub: 'Экология · Энергетика · Город', color: '#22c55e', icon: <Globe2 size={14}/> },
  { id: 'vod',    label: 'VOD.eco / DAO / Blockchain', sub: 'Токены · Смарт-контракты', color: '#ec4899', icon: <Shield size={14}/> },
];

const CATEGORY_LABELS: Record<Category, string> = {
  all: 'Все',
  digital: '🤖 Цифровые',
  water: '🌊 Вода/Экология',
  energy: '⚡ Энергетика',
  city: '🏙️ Город',
  integration: '🔗 Интеграция',
};

// ─── Animated Counter ─────────────────────────────────────────────────────────

function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const dur = 1600;
    const step = 16;
    const inc = to / (dur / step);
    let cur = 0;
    const t = setInterval(() => {
      cur = Math.min(cur + inc, to);
      setVal(Math.round(cur));
      if (cur >= to) clearInterval(t);
    }, step);
    return () => clearInterval(t);
  }, [inView, to]);

  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

// ─── Architecture Diagram ─────────────────────────────────────────────────────

function ArchDiagram() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="relative">
      <div className="space-y-1.5">
        {LAYERS.map((layer, i) => (
          <motion.div
            key={layer.id}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
            viewport={{ once: true }}
            onClick={() => setActive(active === layer.id ? null : layer.id)}
            className="cursor-pointer"
          >
            <div
              className={`relative flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all duration-200 ${
                active === layer.id
                  ? 'border-opacity-100 bg-white/5'
                  : 'border-white/10 hover:bg-white/3'
              }`}
              style={{
                borderColor: active === layer.id ? layer.color : undefined,
                boxShadow: active === layer.id ? `0 0 20px ${layer.color}30` : undefined,
              }}
            >
              {/* Left connector line */}
              {i > 0 && (
                <div
                  className="absolute left-6 -top-1.5 w-0.5 h-1.5"
                  style={{ background: `linear-gradient(to bottom, ${LAYERS[i-1].color}60, ${layer.color}60)` }}
                />
              )}

              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: layer.color + '22', color: layer.color }}
              >
                {layer.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white">{layer.label}</div>
                <div className="text-xs text-gray-500">{layer.sub}</div>
              </div>

              <div className="text-xs font-mono text-gray-600">L{9 - i}</div>

              <div
                className={`text-xs transition-transform ${active === layer.id ? 'rotate-90' : ''}`}
                style={{ color: layer.color }}
              >
                <ChevronRight size={12} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {active && (() => {
          const l = LAYERS.find(x => x.id === active)!;
          return (
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="mt-3 p-4 rounded-xl border text-sm text-gray-300"
              style={{ borderColor: l.color + '40', background: l.color + '08' }}
            >
              <span style={{ color: l.color }} className="font-semibold">{l.label}</span>
              {' '}— {l.sub}. Данные этого уровня передаются вниз по архитектурной цепочке
              и накапливаются в AI Core для принятия решений.
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}

// ─── Component Card ───────────────────────────────────────────────────────────

function CompCard({ comp }: { comp: Component }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      layout
      whileHover={{ scale: 1.02 }}
      onClick={() => setOpen(!open)}
      className="cursor-pointer bg-[#000d24] border border-white/10 rounded-xl p-4 transition-all duration-200 hover:border-white/20"
      style={{ boxShadow: open ? `0 0 15px ${comp.color}20` : undefined }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: comp.color + '20', color: comp.color }}
        >
          {comp.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-gray-600">#{comp.id.toString().padStart(2,'0')}</span>
            <span className="font-semibold text-white text-sm leading-tight">{comp.title}</span>
          </div>
          <AnimatePresence>
            {open && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-xs text-gray-400 leading-relaxed mt-2 overflow-hidden"
              >
                {comp.desc}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        <div style={{ color: comp.color }} className={`transition-transform flex-shrink-0 ${open ? 'rotate-90' : ''}`}>
          <ChevronRight size={14} />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AralNexusPage() {
  const [, navigate] = useLocation();
  const [catFilter, setCatFilter] = useState<Category>('all');
  const [activePhase, setActivePhase] = useState(0);

  const filtered = catFilter === 'all'
    ? COMPONENTS
    : COMPONENTS.filter(c => c.category === catFilter);

  return (
    <div className="min-h-screen bg-[#000818] text-gray-200 overflow-x-hidden">

      {/* ── Animated Hero ── */}
      <div className="relative min-h-[520px] flex flex-col justify-end overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0">
          {/* Deep ocean gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#000818] via-[#00153a] to-[#000818]" />
          {/* Animated water rings */}
          {[0,1,2,3].map(i => (
            <motion.div
              key={i}
              className="absolute rounded-full border opacity-10"
              style={{
                width: `${400 + i * 200}px`, height: `${400 + i * 200}px`,
                left: '50%', top: '60%',
                x: '-50%', y: '-50%',
                borderColor: i % 2 === 0 ? '#00d4ff' : '#7c3aed',
              }}
              animate={{ scale: [1, 1.05, 1], opacity: [0.06, 0.12, 0.06] }}
              transition={{ duration: 4 + i * 1.5, repeat: Infinity, delay: i * 0.8 }}
            />
          ))}
          {/* Glow orb */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-[#00d4ff]/5 blur-3xl pointer-events-none" />
          <div className="absolute top-1/3 right-1/4 w-[400px] h-[200px] rounded-full bg-[#7c3aed]/8 blur-3xl pointer-events-none" />
        </div>

        {/* Back button */}
        <div className="absolute top-0 left-0 right-0 z-20 px-4 pt-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm text-[#00d4ff]/70 hover:text-[#00d4ff] transition-colors"
          >
            <ArrowLeft size={15} /> На главную
          </button>
        </div>

        {/* Hero content */}
        <div className="relative z-10 px-4 pb-12 max-w-5xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center gap-2 text-xs text-[#00d4ff] bg-[#00d4ff]/10 border border-[#00d4ff]/20 rounded-full px-4 py-1.5">
                <Waves size={12} /> Мегапроект
              </div>
              <div className="flex items-center gap-2 text-xs text-[#7c3aed] bg-[#7c3aed]/10 border border-[#7c3aed]/20 rounded-full px-4 py-1.5">
                <Globe2 size={12} /> Центральная Азия
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-white mb-3 tracking-tight">
              ARAL{' '}
              <span className="bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] bg-clip-text text-transparent">
                NEXUS
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl leading-relaxed">
              Международная платформа восстановления Аральского моря и создания
              крупнейшего научно-экологического комплекса Центральной Азии
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { val: 60, suffix: 'B$+', label: 'Общий бюджет', color: '#00d4ff' },
                { val: 24,  suffix: '',   label: 'Подсистемы',   color: '#7c3aed' },
                { val: 20,  suffix: '',   label: 'Подпроекта',   color: '#22c55e' },
                { val: 4,   suffix: '',   label: 'Фазы',         color: '#f59e0b' },
              ].map((s) => (
                <div key={s.label} className="bg-[#000d24]/80 backdrop-blur border border-white/10 rounded-xl p-3 text-center">
                  <div className="text-2xl font-black font-mono" style={{ color: s.color }}>
                    <Counter to={s.val} suffix={s.suffix} />
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-6xl mx-auto px-4 pb-16 space-y-16">

        {/* ── Architecture Diagram ── */}
        <section>
          <SectionHeader
            tag="Архитектура"
            title="Единая система слоёв"
            subtitle="От спутников до блокчейна — все уровни работают как единый организм"
          />
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <ArchDiagram />
            <div className="space-y-4">
              <div className="bg-[#000d24] border border-[#00d4ff]/20 rounded-xl p-5">
                <div className="text-xs text-[#00d4ff] font-semibold uppercase tracking-widest mb-3">Принцип работы</div>
                <p className="text-sm text-gray-300 leading-relaxed mb-4">
                  Каждый слой собирает данные и передаёт их вниз по цепочке.
                  Спутники, дроны и датчики формируют информационный поток,
                  который накапливается в Underwater DataBase и обрабатывается
                  AI Core в реальном времени.
                </p>
                <p className="text-sm text-gray-300 leading-relaxed">
                  Digital Twin Aral получает обработанные данные и строит
                  предиктивные модели. На их основе системы управления принимают
                  автономные решения по экологии, энергетике и городу.
                  Результаты фиксируются в VOD.eco через блокчейн.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Датчиков', val: '1M+',  color: '#0099ff' },
                  { label: 'Роботов',  val: '10K+', color: '#7c3aed' },
                  { label: 'AI-агентов',val: '500+', color: '#00d4ff' },
                ].map(s => (
                  <div key={s.label} className="bg-[#000d24] border border-white/10 rounded-xl p-3 text-center">
                    <div className="font-mono font-bold text-lg" style={{ color: s.color }}>{s.val}</div>
                    <div className="text-xs text-gray-500">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── 24 Components ── */}
        <section>
          <SectionHeader
            tag="Компоненты"
            title="24 подсистемы мегапроекта"
            subtitle="Нажмите на карточку, чтобы узнать подробности"
          />

          {/* Category filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            {(Object.keys(CATEGORY_LABELS) as Category[]).map(cat => (
              <button
                key={cat}
                onClick={() => setCatFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  catFilter === cat
                    ? 'bg-[#00d4ff]/20 border border-[#00d4ff]/50 text-[#00d4ff]'
                    : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'
                }`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>

          <motion.div
            layout
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((comp, i) => (
                <motion.div
                  key={comp.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <CompCard comp={comp} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </section>

        {/* ── Investment Phases ── */}
        <section>
          <SectionHeader
            tag="Финансирование"
            title="4 инвестиционные фазы"
            subtitle={`Общий объём: $35–60B+ на горизонте 2026–2040+`}
          />

          {/* Phase tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {PHASES.map((p, i) => (
              <button
                key={i}
                onClick={() => setActivePhase(i)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activePhase === i
                    ? 'text-white'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
                style={{
                  background: activePhase === i ? p.color + '20' : undefined,
                  border: `1px solid ${activePhase === i ? p.color + '60' : '#ffffff15'}`,
                }}
              >
                {p.title.split('—')[0].trim()}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {(() => {
              const p = PHASES[activePhase];
              return (
                <motion.div
                  key={activePhase}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="rounded-2xl border p-6"
                  style={{ borderColor: p.color + '30', background: p.color + '06' }}
                >
                  <div className="grid sm:grid-cols-3 gap-4 mb-5">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Название</div>
                      <div className="text-lg font-bold text-white">{p.title}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Бюджет</div>
                      <div className="text-2xl font-black font-mono" style={{ color: p.color }}>{p.budget}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Период</div>
                      <div className="text-lg font-semibold text-white">{p.duration}</div>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {p.items.map((item, j) => (
                      <motion.div
                        key={j}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: j * 0.05 }}
                        className="flex items-center gap-2 text-sm"
                      >
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: p.color }} />
                        <span className="text-gray-300">{item}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              );
            })()}
          </AnimatePresence>

          {/* Phase timeline bar */}
          <div className="mt-6 flex gap-1 h-2 rounded-full overflow-hidden">
            {PHASES.map((p, i) => (
              <motion.div
                key={i}
                className="flex-1 rounded-full cursor-pointer"
                style={{ background: p.color + (activePhase === i ? 'ff' : '40') }}
                whileHover={{ opacity: 1 }}
                onClick={() => setActivePhase(i)}
              />
            ))}
          </div>
          <div className="flex mt-1.5">
            {PHASES.map((p, i) => (
              <div key={i} className="flex-1 text-center text-xs text-gray-600">{p.duration.split('–')[0]}</div>
            ))}
            <div className="text-xs text-gray-600 pl-1">+</div>
          </div>
        </section>

        {/* ── 20 Sub-Projects ── */}
        <section>
          <SectionHeader
            tag="Подпроекты"
            title="20 самостоятельных программ"
            subtitle="Каждая имеет собственный бюджет, команду и KPI"
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {SUBPROJECTS.map((sp, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ scale: 1.03, y: -2 }}
                className="bg-[#000d24] border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all cursor-pointer"
              >
                <div
                  className="text-xs font-bold font-mono mb-1"
                  style={{ color: sp.color }}
                >
                  {sp.title}
                </div>
                <div className="text-xs text-gray-500">{sp.desc}</div>
                <div
                  className="mt-2 h-0.5 rounded-full"
                  style={{ background: `linear-gradient(to right, ${sp.color}60, transparent)` }}
                />
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Philosophy ── */}
        <section>
          <SectionHeader
            tag="Философия"
            title="5 фундаментальных принципов"
            subtitle="Основа идеологии ARAL NEXUS"
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: 'Природа как умная система',       desc: 'Среда — сложная адаптивная сеть. Каждый компонент влияет на другой. Управление через взаимосвязанный интеллект.', num: '01', color: '#22c55e' },
              { title: 'Цифровое зеркало реальности',     desc: 'Digital Twin — непрерывно обновляемая виртуальная модель всего региона. Любые изменения проверяются здесь.',        num: '02', color: '#00d4ff' },
              { title: 'Автономная инфраструктура',        desc: 'Замкнутый цикл: энергия, вода, еда, отходы, транспорт. Ресурсы циркулируют непрерывно.',                             num: '03', color: '#7c3aed' },
              { title: 'Человек + ИИ = Коллаборация',     desc: 'ИИ не заменяет людей — предоставляет анализ, прогнозы, оптимизацию. Стратегические решения — за людьми.',          num: '04', color: '#f59e0b' },
              { title: 'Экономика восстановления',         desc: 'Экологическое восстановление — экономический двигатель: наука, технологии, энергетика, туризм, биотех.',         num: '05', color: '#ec4899' },
              { title: 'Open Science & DAO',               desc: 'Все экологические данные открыты. Управление децентрализовано через VOD.eco и смарт-контракты.',                   num: '06', color: '#00e6c8' },
            ].map((p) => (
              <motion.div
                key={p.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
                className="bg-[#000d24] border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all"
              >
                <div className="font-mono text-3xl font-black mb-2 opacity-20 text-white">{p.num}</div>
                <div className="font-bold text-white text-sm mb-2" style={{ color: 'inherit' }}>
                  <span style={{ color: p.color }}>{p.title}</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section>
          <div
            className="rounded-2xl border p-8 text-center relative overflow-hidden"
            style={{ borderColor: '#00d4ff30', background: 'linear-gradient(135deg, #00d4ff08, #7c3aed08)' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#00d4ff]/5 via-transparent to-[#7c3aed]/5 pointer-events-none" />
            <div className="relative">
              <h3 className="text-2xl font-bold text-white mb-2">
                ARAL NEXUS — первая в мире
              </h3>
              <p className="text-gray-400 mb-6 max-w-xl mx-auto">
                Экологическая цивилизационная инфраструктура с предиктивным интеллектом.
                Не реакция на ущерб — а превентивное экологическое управление.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={() => navigate('/aral-whitepaper')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00d4ff]/10 border border-[#00d4ff]/30 text-[#00d4ff] hover:bg-[#00d4ff]/20 transition-colors text-sm font-medium"
                >
                  <ExternalLink size={15} /> Читать WhitePaper
                </button>
                <button
                  onClick={() => navigate('/invest')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7c3aed]/10 border border-[#7c3aed]/30 text-[#7c3aed] hover:bg-[#7c3aed]/20 transition-colors text-sm font-medium"
                >
                  <Zap size={15} /> Инвестировать
                </button>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

// ─── Section Header ────────────────────────────────────────────────────────────

function SectionHeader({ tag, title, subtitle }: { tag: string; title: string; subtitle: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mb-8"
    >
      <div className="text-xs text-[#00d4ff] font-semibold uppercase tracking-widest mb-2">{tag}</div>
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{title}</h2>
      <p className="text-gray-500 text-sm">{subtitle}</p>
    </motion.div>
  );
}
