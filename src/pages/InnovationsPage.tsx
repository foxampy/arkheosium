// ═══════════════════════════════════════════════════════════════
//  InnovationsPage — «Инновации и разработки»  (route: /innovations)
//  Портфель прорывных инноваций основателя ARKHEOSIUM: R&D-витрина
//  разработок по всей ресурсной экосистеме (вода, энергия, минералы,
//  природа, агро, климат). Фильтры по домену/стадии + модалка деталей.
// ═══════════════════════════════════════════════════════════════

import { useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FlaskConical, Droplets, Zap, Gem, Leaf, Sprout, CloudSun, Sparkles,
  X, ArrowRight, CheckCircle2, Lightbulb, Wrench, FlaskRound, Rocket,
  Boxes, Cpu, Satellite, Network, Waves, Sun, Recycle, Wind, Users,
  Gauge, TrendingUp,
} from 'lucide-react';

const ACCENT = '#00e6c8';
const ACCENT2 = '#00d4ff';

// ── Domains ──────────────────────────────────────────────────────
type DomainId = 'water' | 'energy' | 'minerals' | 'nature' | 'agriculture' | 'climate';

const DOMAINS: { id: DomainId; label: string; color: string; icon: typeof Droplets }[] = [
  { id: 'water', label: 'Вода', color: '#00e6c8', icon: Droplets },
  { id: 'energy', label: 'Энергия', color: '#f59e0b', icon: Zap },
  { id: 'minerals', label: 'Минералы', color: '#c084fc', icon: Gem },
  { id: 'nature', label: 'Природа', color: '#34d399', icon: Leaf },
  { id: 'agriculture', label: 'Агро', color: '#a3e635', icon: Sprout },
  { id: 'climate', label: 'Климат', color: '#7dd3fc', icon: CloudSun },
];
const domainOf = (id: DomainId) => DOMAINS.find((d) => d.id === id)!;

// ── Pipeline stages ──────────────────────────────────────────────
type StageId = 'idea' | 'prototype' | 'pilot' | 'scale' | 'deployed';

const STAGES: { id: StageId; label: string; icon: typeof Lightbulb }[] = [
  { id: 'idea', label: 'Идея', icon: Lightbulb },
  { id: 'prototype', label: 'Прототип', icon: Wrench },
  { id: 'pilot', label: 'Пилот', icon: FlaskRound },
  { id: 'scale', label: 'Масштаб', icon: Rocket },
  { id: 'deployed', label: 'Внедрено', icon: CheckCircle2 },
];
const stageOf = (id: StageId) => STAGES.find((s) => s.id === id)!;

// ── Innovation model ─────────────────────────────────────────────
interface Innovation {
  id: string;
  title: string;
  tagline: string;
  domain: DomainId;
  trl: number; // 1–9
  stage: StageId;
  icon: typeof Droplets;
  description: string;
  problem: string;
  advantages: string[];
  tech: string[];
  impact: string;
}

const INNOVATIONS: Innovation[] = [
  {
    id: 'atmos-water',
    title: 'Атмосферный водогенератор на солнце',
    tagline: 'Питьевая вода из воздуха там, где нет источников',
    domain: 'water',
    trl: 7,
    stage: 'pilot',
    icon: Sun,
    description:
      'Модуль-конденсатор извлекает влагу из атмосферы с помощью сорбента и солнечного тепла, работая автономно даже в аридных зонах Приаралья без подключения к сетям.',
    problem:
      'Более 2 млрд человек живут в регионах водного дефицита; в пустынных зонах доставка воды дорога и логистически уязвима.',
    advantages: [
      'Полностью автономная работа от солнца',
      'До 30 л чистой воды в сутки с модуля',
      'Минеральная реминерализация на выходе',
      'Не требует скважин и трубопроводов',
    ],
    tech: ['MOF-сорбенты', 'Солнечный термопривод', 'IoT-телеметрия', 'PV-панели'],
    impact: 'До 30 л/сутки автономной питьевой воды на модуль',
  },
  {
    id: 'modular-desal',
    title: 'Модульная опреснительная станция',
    tagline: 'Контейнерное опреснение под ключ за недели',
    domain: 'water',
    trl: 8,
    stage: 'scale',
    icon: Waves,
    description:
      'Стандартизированные контейнерные блоки обратного осмоса с рекуперацией энергии разворачиваются на побережье или у солёных водоёмов и наращиваются по мере роста спроса.',
    problem:
      'Классические опреснительные заводы требуют лет строительства и огромного CAPEX, недоступного для малых сообществ.',
    advantages: [
      'Развёртывание за 4–6 недель',
      'Рекуперация давления снижает энергозатраты на 40%',
      'Масштабирование блок-за-блоком',
      'Дистанционный мониторинг качества',
    ],
    tech: ['Обратный осмос', 'Рекуператоры энергии', 'SCADA', 'Антискаланты'],
    impact: 'От 500 до 10 000 м³/сутки пресной воды',
  },
  {
    id: 'basin-twin',
    title: 'ИИ-цифровой двойник речного бассейна',
    tagline: 'Живая модель водосбора для точного управления',
    domain: 'water',
    trl: 6,
    stage: 'pilot',
    icon: Network,
    description:
      'Цифровой двойник объединяет спутниковые, сенсорные и гидрологические данные в реальном времени, прогнозируя сток, дефицит и последствия управленческих решений.',
    problem:
      'Трансграничные бассейны управляются вслепую: решения о водозаборе принимаются без прогноза их каскадных эффектов.',
    advantages: [
      'Прогноз стока на 90 дней вперёд',
      'Сценарное моделирование водозабора',
      'Раннее предупреждение о дефиците',
      'Единая картина для всех водопользователей',
    ],
    tech: ['ML-гидрология', 'Data fusion', 'Спутниковые данные', 'Симуляция'],
    impact: 'Снижение непродуктивных потерь воды до 25%',
  },
  {
    id: 'agri-biodome',
    title: 'Биокупол для агро в пустыне',
    tagline: 'Замкнутый агроцикл на солёных землях',
    domain: 'agriculture',
    trl: 5,
    stage: 'prototype',
    icon: Sprout,
    description:
      'Купольная теплица с внутренним циклом конденсации влаги, солнечным охлаждением и гидропоникой позволяет выращивать культуры на непригодных землях с минимальным водопотреблением.',
    problem:
      'Опустынивание вокруг Арала выводит из оборота миллионы гектаров; традиционное орошение усугубляет засоление.',
    advantages: [
      'Экономия воды до 90% против открытого поля',
      'Внутренняя реконденсация влаги',
      'Круглогодичный урожай',
      'Не зависит от засолённого грунта',
    ],
    tech: ['Гидропоника', 'Солнечное охлаждение', 'Климат-контроль', 'Сенсоры CO₂'],
    impact: 'Урожайность выше в 8–12 раз при 10% воды',
  },
  {
    id: 'water-blockchain',
    title: 'Сеть IoT-сенсоров качества воды на блокчейне',
    tagline: 'Неизменяемый паспорт качества каждого источника',
    domain: 'water',
    trl: 7,
    stage: 'pilot',
    icon: Cpu,
    description:
      'Распределённая сеть сенсоров непрерывно измеряет параметры воды и записывает их в блокчейн, создавая аудируемый и защищённый от подделки реестр качества.',
    problem:
      'Данные о качестве воды легко фальсифицируются, а разрозненные измерения не вызывают доверия у инвесторов и регуляторов.',
    advantages: [
      'Неизменяемый реестр измерений',
      'Автоматические алерты при превышениях',
      'Токенизация водных прав',
      'Открытая верификация третьими сторонами',
    ],
    tech: ['LoRaWAN', 'Блокчейн', 'Edge-сенсоры', 'Смарт-контракты'],
    impact: 'Доверенные данные для 100% точек мониторинга',
  },
  {
    id: 'gravity-storage',
    title: 'Гравитационное накопление энергии',
    tagline: 'Хранение возобновляемой энергии без химии',
    domain: 'energy',
    trl: 6,
    stage: 'pilot',
    icon: Boxes,
    description:
      'Избыток солнечной и ветровой энергии поднимает массивные грузы; при спаде генерации их спуск вращает генераторы, возвращая энергию в сеть без деградации батарей.',
    problem:
      'Литиевые накопители дороги, деградируют и создают экологический след при утилизации.',
    advantages: [
      'Срок службы 30+ лет без деградации',
      'Отдача 80–85% КПД',
      'Без редкоземельных и токсичных материалов',
      'Быстрый отклик на пики спроса',
    ],
    tech: ['Электроприводы', 'Композитные грузы', 'Grid-инвертор', 'ИИ-диспетчер'],
    impact: 'Хранение до 20 МВт·ч на установку',
  },
  {
    id: 'green-hydrogen',
    title: 'Зелёный водород из опреснённой воды',
    tagline: 'Топливо будущего на солнце и морской воде',
    domain: 'energy',
    trl: 5,
    stage: 'prototype',
    icon: Zap,
    description:
      'Интегрированный комплекс опресняет морскую воду и электролизует её от солнечных панелей, производя чистый водород для транспорта и промышленности без ископаемого сырья.',
    problem:
      'Электролиз требует пресной воды, которой не хватает именно в солнечных регионах с потенциалом для водорода.',
    advantages: [
      'Замкнутый цикл вода→водород',
      'Нулевые прямые выбросы CO₂',
      'Использует избыток дневной генерации',
      'Побочный кислород — в аэрацию водоёмов',
    ],
    tech: ['PEM-электролиз', 'Опреснение', 'PV-массивы', 'Компрессия H₂'],
    impact: 'До 500 кг зелёного водорода в сутки',
  },
  {
    id: 'mycorrhiza-soil',
    title: 'Восстановление почв микоризой',
    tagline: 'Живой грибной каркас против опустынивания',
    domain: 'nature',
    trl: 6,
    stage: 'pilot',
    icon: Leaf,
    description:
      'Инокуляция деградированных земель симбиотическими микоризными грибами восстанавливает структуру почвы, удержание влаги и углеродный баланс без химических удобрений.',
    problem:
      'Осушённое дно Арала и деградированные земли теряют способность удерживать воду и питательные вещества.',
    advantages: [
      'Рост влагоудержания почвы до +40%',
      'Секвестрация углерода в грунте',
      'Приживаемость саженцев выше в 3 раза',
      'Естественный процесс без химии',
    ],
    tech: ['Микоризные штаммы', 'Биоинокулянты', 'Дрон-посев', 'Почвенный анализ'],
    impact: 'Восстановление до 10 000 га деградированных земель',
  },
  {
    id: 'sat-monitoring',
    title: 'Спутниковый мониторинг ресурсов + ИИ',
    tagline: 'Взгляд из космоса на всю ресурсную сеть',
    domain: 'climate',
    trl: 8,
    stage: 'scale',
    icon: Satellite,
    description:
      'Автоматический ИИ-конвейер обрабатывает мультиспектральные снимки, выявляя изменения площади водоёмов, засоления, растительности и незаконного водозабора в масштабе регионов.',
    problem:
      'Наземный мониторинг огромных территорий дорог, медленен и оставляет слепые зоны.',
    advantages: [
      'Покрытие территорий любого масштаба',
      'Обнаружение изменений за часы',
      'Детекция незаконного водозабора',
      'Исторические ряды для трендов',
    ],
    tech: ['Мультиспектр', 'Computer Vision', 'Sentinel/Landsat', 'ML-детекция'],
    impact: 'Мониторинг 1 млн+ км² в непрерывном режиме',
  },
  {
    id: 'resource-dao',
    title: 'DAO-координация трансграничных ресурсов',
    tagline: 'Прозрачное совместное управление водой',
    domain: 'nature',
    trl: 4,
    stage: 'prototype',
    icon: Users,
    description:
      'Децентрализованная автономная организация даёт водопользователям разных стран общий протокол голосования, распределения квот и прозрачного учёта через смарт-контракты.',
    problem:
      'Трансграничные ресурсы страдают от «трагедии общин»: нет доверенного механизма справедливого распределения.',
    advantages: [
      'Прозрачные правила распределения квот',
      'Голосование без единого центра власти',
      'Автоматическое исполнение соглашений',
      'Аудируемая история решений',
    ],
    tech: ['Смарт-контракты', 'Ончейн-голосование', 'Токеномика', 'Оракулы данных'],
    impact: 'Справедливые квоты для 5+ стран бассейна',
  },
  {
    id: 'co2-catalyst',
    title: 'Катализатор улавливания CO₂',
    tagline: 'Превращение выбросов в полезное сырьё',
    domain: 'climate',
    trl: 4,
    stage: 'idea',
    icon: Wind,
    description:
      'Каталитический модуль улавливает CO₂ из воздуха и промышленных потоков, конвертируя его в карбонаты и синтетическое сырьё, пригодное для строительства и агро.',
    problem:
      'Прямое улавливание углерода остаётся энергоёмким и дорогим, лишённым экономической мотивации.',
    advantages: [
      'Конверсия CO₂ в товарный продукт',
      'Работа на возобновляемой энергии',
      'Модульная масштабируемость',
      'Синергия с зелёным водородом',
    ],
    tech: ['Электрокатализ', 'Сорбенты DAC', 'Минерализация', 'Возобновляемая энергия'],
    impact: 'Улавливание до 1 000 т CO₂ в год на модуль',
  },
  {
    id: 'piezo-flow',
    title: 'Пьезо-энергия из водотоков',
    tagline: 'Микрогенерация из течения рек и каналов',
    domain: 'energy',
    trl: 3,
    stage: 'idea',
    icon: Recycle,
    description:
      'Гибкие пьезоэлектрические мембраны колеблются в потоке воды, генерируя распределённую энергию для датчиков и малых узлов без плотин и турбин.',
    problem:
      'Удалённые сенсоры мониторинга воды нуждаются в питании там, где нет сетей и солнце ограничено.',
    advantages: [
      'Питание автономных сенсоров',
      'Нет плотин и вреда для экосистемы',
      'Работа в мутной и медленной воде',
      'Минимальное обслуживание',
    ],
    tech: ['Пьезомембраны', 'Энергосбор', 'Микронакопители', 'Edge-питание'],
    impact: 'Автономное питание сетей мониторинга',
  },
];

export default function InnovationsPage() {
  const [, setLocation] = useLocation();
  const [domainFilter, setDomainFilter] = useState<DomainId | 'all'>('all');
  const [stageFilter, setStageFilter] = useState<StageId | 'all'>('all');
  const [active, setActive] = useState<Innovation | null>(null);

  const filtered = useMemo(
    () =>
      INNOVATIONS.filter(
        (n) =>
          (domainFilter === 'all' || n.domain === domainFilter) &&
          (stageFilter === 'all' || n.stage === stageFilter),
      ),
    [domainFilter, stageFilter],
  );

  const stageCounts = useMemo(() => {
    const m: Record<StageId, number> = { idea: 0, prototype: 0, pilot: 0, scale: 0, deployed: 0 };
    INNOVATIONS.forEach((n) => (m[n.stage] += 1));
    return m;
  }, []);

  const stats = useMemo(() => {
    const inPilot = INNOVATIONS.filter((n) => n.stage === 'pilot' || n.stage === 'scale').length;
    const domains = new Set(INNOVATIONS.map((n) => n.domain)).size;
    const avgTrl = (INNOVATIONS.reduce((s, n) => s + n.trl, 0) / INNOVATIONS.length).toFixed(1);
    return { total: INNOVATIONS.length, inPilot, domains, avgTrl };
  }, []);

  const resetFilters = () => {
    setDomainFilter('all');
    setStageFilter('all');
  };

  return (
    <div className="min-h-screen pb-24">
      {/* ── HERO ── */}
      <div className="relative overflow-hidden border-b border-white/5">
        <div
          className="absolute inset-0 opacity-50"
          style={{ background: `radial-gradient(60% 120% at 50% 0%, ${ACCENT}22, transparent 70%)` }}
        />
        <div
          className="absolute inset-0 opacity-30"
          style={{ background: `radial-gradient(40% 80% at 85% 10%, ${ACCENT2}18, transparent 70%)` }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-5 pt-12 pb-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5"
            style={{ background: `${ACCENT}14`, border: `1px solid ${ACCENT}33` }}
          >
            <Sparkles className="w-3.5 h-3.5" style={{ color: ACCENT }} />
            <span className="text-xs font-semibold" style={{ color: ACCENT }}>
              R&D · Инновации в разработке
            </span>
          </motion.div>

          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8 items-center">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-4"
                style={{
                  background: `linear-gradient(120deg, #fff 20%, ${ACCENT} 60%, ${ACCENT2} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Портфель прорывных инноваций ресурсной ОС
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
                className="text-sm sm:text-base text-white/55 leading-relaxed max-w-2xl"
              >
                Разработки основателя ARKHEOSIUM охватывают всю ресурсную экосистему — от воды и
                энергии до климата. Каждая инновация питает единую операционную систему устойчивого
                управления ресурсами Земли.
              </motion.p>

              {/* Stat strip */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-7"
              >
                {[
                  { label: 'инноваций', value: stats.total, icon: FlaskConical },
                  { label: 'в пилоте/масштабе', value: stats.inPilot, icon: Rocket },
                  { label: 'доменов', value: stats.domains, icon: Boxes },
                  { label: 'средний TRL', value: stats.avgTrl, icon: Gauge },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-2xl p-4"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <s.icon className="w-4 h-4 mb-2" style={{ color: ACCENT }} />
                    <div className="text-2xl font-bold text-white">{s.value}</div>
                    <div className="text-[11px] text-white/45 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Animated inline-SVG lab/nodes motif */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="hidden lg:block"
            >
              <svg viewBox="0 0 320 300" className="w-full h-auto">
                <defs>
                  <linearGradient id="innoEdge" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={ACCENT} />
                    <stop offset="100%" stopColor={ACCENT2} />
                  </linearGradient>
                </defs>
                {/* edges */}
                {[
                  [160, 150, 60, 60],
                  [160, 150, 260, 60],
                  [160, 150, 50, 220],
                  [160, 150, 270, 220],
                  [160, 150, 160, 40],
                ].map(([x1, y1, x2, y2], i) => (
                  <motion.line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="url(#innoEdge)"
                    strokeWidth={1.5}
                    strokeOpacity={0.5}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
                  />
                ))}
                {/* satellite nodes */}
                {[
                  [60, 60, '#00e6c8'],
                  [260, 60, '#f59e0b'],
                  [50, 220, '#c084fc'],
                  [270, 220, '#34d399'],
                  [160, 40, '#7dd3fc'],
                ].map(([cx, cy, c], i) => (
                  <motion.circle
                    key={i}
                    cx={cx as number}
                    cy={cy as number}
                    r={12}
                    fill={c as string}
                    fillOpacity={0.18}
                    stroke={c as string}
                    strokeWidth={1.5}
                    initial={{ scale: 0 }}
                    animate={{ scale: [0.9, 1.1, 0.9] }}
                    transition={{ duration: 3, delay: i * 0.3, repeat: Infinity }}
                    style={{ transformOrigin: `${cx}px ${cy}px` }}
                  />
                ))}
                {/* core */}
                <motion.circle
                  cx={160}
                  cy={150}
                  r={30}
                  fill={ACCENT}
                  fillOpacity={0.12}
                  stroke={ACCENT}
                  strokeWidth={2}
                  animate={{ r: [28, 34, 28] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <FlaskConical x={146} y={136} width={28} height={28} color={ACCENT} />
              </svg>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-5 space-y-12 mt-10">
        {/* ── PIPELINE ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Конвейер инноваций</h2>
            <span className="text-xs text-white/40">от идеи до внедрения</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
            {STAGES.map((s, i) => {
              const activeStage = stageFilter === s.id;
              return (
                <motion.button
                  key={s.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => setStageFilter(activeStage ? 'all' : s.id)}
                  className="relative rounded-2xl p-4 text-left cursor-pointer transition-colors"
                  style={{
                    background: activeStage ? `${ACCENT}14` : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${activeStage ? ACCENT + '55' : 'rgba(255,255,255,0.08)'}`,
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${ACCENT}14`, border: `1px solid ${ACCENT}2e` }}
                    >
                      <s.icon className="w-4 h-4" style={{ color: ACCENT }} />
                    </div>
                    {i < STAGES.length - 1 && (
                      <ArrowRight className="w-3.5 h-3.5 text-white/20 ml-auto hidden sm:block" />
                    )}
                  </div>
                  <div className="text-sm font-semibold text-white">{s.label}</div>
                  <div className="text-xs text-white/40 mt-0.5">
                    {stageCounts[s.id]} {stageCounts[s.id] === 1 ? 'разработка' : 'разработок'}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* ── FILTERS ── */}
        <section>
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h2 className="text-lg font-bold text-white">Фильтры по доменам</h2>
            {(domainFilter !== 'all' || stageFilter !== 'all') && (
              <button
                onClick={resetFilters}
                className="text-xs text-white/50 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Сбросить фильтры
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setDomainFilter('all')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium cursor-pointer transition-colors"
              style={{
                background: domainFilter === 'all' ? `${ACCENT}18` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${domainFilter === 'all' ? ACCENT + '55' : 'rgba(255,255,255,0.08)'}`,
                color: domainFilter === 'all' ? '#fff' : 'rgba(255,255,255,0.55)',
              }}
            >
              <Boxes className="w-4 h-4" /> Все
            </button>
            {DOMAINS.map((d) => {
              const activeD = domainFilter === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => setDomainFilter(activeD ? 'all' : d.id)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium cursor-pointer transition-colors"
                  style={{
                    background: activeD ? `${d.color}1f` : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${activeD ? d.color + '66' : 'rgba(255,255,255,0.08)'}`,
                    color: activeD ? '#fff' : 'rgba(255,255,255,0.55)',
                  }}
                >
                  <d.icon className="w-4 h-4" style={{ color: d.color }} />
                  {d.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* ── GRID ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Сетка инноваций</h2>
            <span className="text-xs text-white/40">
              {filtered.length} из {INNOVATIONS.length}
            </span>
          </div>
          {filtered.length === 0 ? (
            <div
              className="rounded-2xl p-10 text-center text-sm text-white/40"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              Нет инноваций под выбранные фильтры.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {filtered.map((n, i) => {
                  const dom = domainOf(n.domain);
                  const stg = stageOf(n.stage);
                  return (
                    <motion.button
                      key={n.id}
                      layout
                      initial={{ opacity: 0, y: 14 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ delay: (i % 6) * 0.04 }}
                      onClick={() => setActive(n)}
                      className="group relative text-left rounded-3xl p-5 flex flex-col cursor-pointer transition-colors hover:border-white/20"
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      {/* accent glow */}
                      <div
                        className="absolute inset-x-0 top-0 h-1 rounded-t-3xl"
                        style={{ background: `linear-gradient(90deg, ${dom.color}, transparent)` }}
                      />
                      <div className="flex items-start justify-between mb-3">
                        <div
                          className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                          style={{ background: `${dom.color}18`, border: `1px solid ${dom.color}33` }}
                        >
                          <n.icon className="w-5 h-5" style={{ color: dom.color }} />
                        </div>
                        <span
                          className="text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wide"
                          style={{ background: `${dom.color}14`, color: dom.color }}
                        >
                          TRL {n.trl}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white leading-snug mb-1.5">{n.title}</h3>
                      <p className="text-xs text-white/50 leading-relaxed flex-1">{n.tagline}</p>
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/8">
                        <span className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: dom.color }}>
                          <dom.icon className="w-3.5 h-3.5" /> {dom.label}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-white/45">
                          <stg.icon className="w-3.5 h-3.5" /> {stg.label}
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </section>

        {/* ── DEPENDENCY GRAPH ── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Network className="w-5 h-5" style={{ color: ACCENT }} />
            <h2 className="text-lg font-bold text-white">Граф зависимостей · пилот в Приаралье</h2>
          </div>
          <div
            className="rounded-3xl p-5 overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <svg viewBox="0 0 720 220" className="w-full h-auto">
              <defs>
                <linearGradient id="depFlow" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={ACCENT} stopOpacity={0.7} />
                  <stop offset="100%" stopColor={ACCENT2} stopOpacity={0.7} />
                </linearGradient>
              </defs>
              {(() => {
                const feeders = [
                  { label: 'Опреснение', color: '#00e6c8', y: 40 },
                  { label: 'Зелёный H₂', color: '#f59e0b', y: 90 },
                  { label: 'Микориза', color: '#34d399', y: 130 },
                  { label: 'Спутник + ИИ', color: '#7dd3fc', y: 180 },
                ];
                return (
                  <>
                    {feeders.map((f, i) => (
                      <motion.path
                        key={i}
                        d={`M 190 ${f.y} C 300 ${f.y}, 320 110, 430 110`}
                        fill="none"
                        stroke="url(#depFlow)"
                        strokeWidth={2}
                        initial={{ pathLength: 0, opacity: 0 }}
                        whileInView={{ pathLength: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: i * 0.15 }}
                      />
                    ))}
                    {feeders.map((f, i) => (
                      <g key={`n${i}`}>
                        <rect x={40} y={f.y - 16} width={150} height={32} rx={10} fill={`${f.color}1f`} stroke={`${f.color}66`} />
                        <text x={115} y={f.y + 4} textAnchor="middle" fontSize={12} fill="#fff" fontWeight={600}>
                          {f.label}
                        </text>
                      </g>
                    ))}
                    {/* Aral pilot hub */}
                    <motion.circle
                      cx={500}
                      cy={110}
                      r={54}
                      fill={`${ACCENT}12`}
                      stroke={ACCENT}
                      strokeWidth={2}
                      animate={{ r: [50, 56, 50] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                    <text x={500} y={104} textAnchor="middle" fontSize={14} fill="#fff" fontWeight={700}>
                      Пилот
                    </text>
                    <text x={500} y={122} textAnchor="middle" fontSize={12} fill={ACCENT}>
                      Приаралье
                    </text>
                    {/* to platform */}
                    <motion.path
                      d="M 554 110 C 600 110, 610 110, 640 110"
                      fill="none"
                      stroke="url(#depFlow)"
                      strokeWidth={2}
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.6 }}
                    />
                    <rect x={640} y={90} width={60} height={40} rx={10} fill={`${ACCENT2}1f`} stroke={`${ACCENT2}66`} />
                    <text x={670} y={114} textAnchor="middle" fontSize={11} fill="#fff" fontWeight={600}>
                      ОС
                    </text>
                  </>
                );
              })()}
            </svg>
            <p className="text-xs text-white/40 mt-2 text-center">
              Ключевые разработки сходятся в пилотном проекте Приаралья и питают платформенную ОС ресурсов.
            </p>
          </div>
        </section>

        {/* ── CO-DEVELOPMENT CALL ── */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl p-8 overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${ACCENT}12, ${ACCENT2}08)`,
              border: `1px solid ${ACCENT}33`,
            }}
          >
            <div
              className="absolute inset-0 opacity-40 pointer-events-none"
              style={{ background: `radial-gradient(50% 100% at 100% 0%, ${ACCENT2}22, transparent 70%)` }}
            />
            <div className="relative max-w-2xl">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5" style={{ color: ACCENT }} />
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: ACCENT }}>
                  Приглашение к соавторству
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Со-разработка инноваций</h2>
              <p className="text-sm text-white/55 leading-relaxed mb-6">
                Инженеры, учёные и партнёры — присоединяйтесь к разработке. Соберите концепцию в
                Genesis-движке или предложите инициативу через DAO-координацию ресурсной экосистемы.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setLocation('/genesis')}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold cursor-pointer transition-opacity hover:opacity-90"
                  style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`, color: '#000' }}
                >
                  <Sparkles className="w-4 h-4" /> Собрать в Genesis
                </button>
                <button
                  onClick={() => setLocation('/dao')}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium text-white/80 cursor-pointer transition-colors hover:bg-white/5"
                  style={{ border: '1px solid rgba(255,255,255,0.15)' }}
                >
                  <Users className="w-4 h-4" /> Предложить в DAO
                </button>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="grid sm:grid-cols-2 gap-4">
          <button
            onClick={() => setLocation('/updates')}
            className="group rounded-3xl p-6 text-left cursor-pointer transition-colors hover:border-white/20"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <TrendingUp className="w-6 h-6 mb-3" style={{ color: ACCENT }} />
            <h3 className="text-base font-bold text-white mb-1.5">Обновления и релизы</h3>
            <p className="text-xs text-white/50 leading-relaxed mb-3">
              Следите за прогрессом разработок и новыми релизами платформы.
            </p>
            <span className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: ACCENT }}>
              К обновлениям <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </span>
          </button>
          <button
            onClick={() => setLocation('/aral')}
            className="group rounded-3xl p-6 text-left cursor-pointer transition-colors hover:border-white/20"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <Droplets className="w-6 h-6 mb-3" style={{ color: ACCENT2 }} />
            <h3 className="text-base font-bold text-white mb-1.5">Пилот в Приаралье</h3>
            <p className="text-xs text-white/50 leading-relaxed mb-3">
              Где инновации встречают реальность: флагманский пилотный проект.
            </p>
            <span className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: ACCENT2 }}>
              К пилоту <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </span>
          </button>
        </section>
      </div>

      {/* ── DETAIL MODAL ── */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
            style={{ background: 'rgba(0,4,12,0.75)', backdropFilter: 'blur(6px)' }}
            onClick={() => setActive(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.98 }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl"
              style={{ background: '#050d1a', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              {(() => {
                const dom = domainOf(active.domain);
                const stg = stageOf(active.stage);
                return (
                  <>
                    {/* modal header */}
                    <div
                      className="relative p-6 border-b border-white/8"
                      style={{ background: `linear-gradient(135deg, ${dom.color}14, transparent)` }}
                    >
                      <button
                        onClick={() => setActive(null)}
                        className="absolute top-4 right-4 w-9 h-9 rounded-xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                        style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                        aria-label="Закрыть"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                        style={{ background: `${dom.color}18`, border: `1px solid ${dom.color}40` }}
                      >
                        <active.icon className="w-7 h-7" style={{ color: dom.color }} />
                      </div>
                      <h2 className="text-xl font-bold text-white leading-snug pr-10">{active.title}</h2>
                      <p className="text-sm text-white/50 mt-1">{active.tagline}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-4">
                        <span
                          className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg"
                          style={{ background: `${dom.color}18`, color: dom.color }}
                        >
                          <dom.icon className="w-3.5 h-3.5" /> {dom.label}
                        </span>
                        <span
                          className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg"
                          style={{ background: `${ACCENT}14`, color: ACCENT }}
                        >
                          <stg.icon className="w-3.5 h-3.5" /> {stg.label}
                        </span>
                        <span
                          className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                          style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)' }}
                        >
                          TRL {active.trl} / 9
                        </span>
                      </div>
                    </div>

                    {/* modal body */}
                    <div className="p-6 space-y-5">
                      <div>
                        <div className="text-xs font-semibold text-white/45 uppercase tracking-wide mb-2">Описание</div>
                        <p className="text-sm text-white/70 leading-relaxed">{active.description}</p>
                      </div>

                      <div
                        className="rounded-2xl p-4"
                        style={{ background: 'rgba(251,113,133,0.06)', border: '1px solid rgba(251,113,133,0.2)' }}
                      >
                        <div className="text-xs font-semibold text-rose-300/80 uppercase tracking-wide mb-1.5">
                          Проблема, которую решает
                        </div>
                        <p className="text-sm text-white/65 leading-relaxed">{active.problem}</p>
                      </div>

                      <div>
                        <div className="text-xs font-semibold text-white/45 uppercase tracking-wide mb-2">
                          Ключевые преимущества
                        </div>
                        <ul className="space-y-2">
                          {active.advantages.map((a) => (
                            <li key={a} className="flex items-start gap-2 text-sm text-white/70">
                              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: dom.color }} />
                              <span>{a}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <div className="text-xs font-semibold text-white/45 uppercase tracking-wide mb-2">
                          Технологии и стек
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {active.tech.map((tch) => (
                            <span
                              key={tch}
                              className="text-xs font-medium px-2.5 py-1 rounded-lg"
                              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
                            >
                              {tch}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div
                        className="rounded-2xl p-4 flex items-center gap-3"
                        style={{ background: `${dom.color}0d`, border: `1px solid ${dom.color}2e` }}
                      >
                        <TrendingUp className="w-5 h-5 shrink-0" style={{ color: dom.color }} />
                        <div>
                          <div className="text-[11px] uppercase tracking-wide text-white/40 mb-0.5">
                            Потенциальный эффект
                          </div>
                          <div className="text-sm font-bold text-white">{active.impact}</div>
                        </div>
                      </div>

                      {/* CTA */}
                      <button
                        onClick={() => setLocation('/lab')}
                        className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-bold cursor-pointer transition-opacity hover:opacity-90"
                        style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`, color: '#000' }}
                      >
                        <FlaskConical className="w-4 h-4" /> Разработать в Лаборатории
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
