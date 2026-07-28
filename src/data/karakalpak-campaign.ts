// ─────────────────────────────────────────────────────────────────────────────
// Block 5 — данные кампании «Каракалпакия» (Каракалпакстан, южное Приаралье).
//
// Типизированный контент-модуль: экономика, эффекты по векторам, модули проектов,
// библиотеки знаний (онтологическая систематизация → граф знаний), DAO как
// связующий слой и продукты автоматического сбора/верификации данных (MRV + DePIN
// с хеш-якорением и токенизацией потока измерений).
//
// Доменные цвета (hex) синхронизированы с палитрой AralSeaProjectPage:
//   water #00e6c8 · energy #f59e0b · minerals #c084fc · nature #34d399
//   agriculture #a3e635 · climate #7dd3fc · accent #00e6c8 · accent2 #00d4ff
// ─────────────────────────────────────────────────────────────────────────────

export const DOMAIN = {
  water: '#00e6c8',
  energy: '#f59e0b',
  minerals: '#c084fc',
  nature: '#34d399',
  agriculture: '#a3e635',
  climate: '#7dd3fc',
  accent: '#00e6c8',
  accent2: '#00d4ff',
} as const;

export type DomainColor = (typeof DOMAIN)[keyof typeof DOMAIN];

// ── Экономика: кампания vs общая программа ──────────────────────────────────
export interface EconomyFact {
  id: string;
  eyebrow: string;
  name: string;
  scope: string;
  value: string;
  valueSub: string;
  color: string;
  points: string[];
}

export const ECONOMY: EconomyFact[] = [
  {
    id: 'campaign',
    eyebrow: 'Региональная кампания',
    name: 'Кампания «Каракалпакия»',
    scope: 'Один регион как отработанный эталон подхода',
    value: '$250 млн',
    valueSub: 'самодостаточна при интеграции всех модулей',
    color: DOMAIN.agriculture,
    points: [
      'Все векторы (вода, энергия, агро, эко-город, наука) в одном контуре',
      'Окупается внутри региона — рентабельна сама по себе',
      'Каждый модуль подключён к DAO и потоку верифицируемых данных',
      'Служит рабочим шаблоном для тиражирования',
    ],
  },
  {
    id: 'program',
    eyebrow: 'Общая программа Проекта',
    name: 'Глобальная интеграция',
    scope: 'Тиражирование по всем регионам Земли и за её пределами',
    value: '$0.5 трлн',
    valueSub: 'рентабельность в разы выше — эффект мультипликативен',
    color: DOMAIN.accent2,
    points: [
      'Совместная работа всех модулей, систем и кампаний как единого организма',
      'Готовность разворачивать такие же кампании где угодно',
      'Колонизация и новые сферы интегрирования',
      'Системный множитель: эффект больше суммы отдельных кампаний',
    ],
  },
];

// ── Эффекты по направлениям / векторам ──────────────────────────────────────
export interface VectorEffect {
  id: string;
  vector: string;
  color: string;
  headline: string;
  metric: number;
  metricSuffix: string;
  metricLabel: string;
  desc: string;
}

export const VECTORS: VectorEffect[] = [
  {
    id: 'research',
    vector: 'Научно-исследовательский',
    color: DOMAIN.climate,
    headline: 'Открытая наука и полигон технологий',
    metric: 85,
    metricSuffix: ' патентов/год',
    metricLabel: 'публикации и патенты',
    desc: 'Международный кампус климатологии, гидрологии и биоинженерии превращает регион в живую лабораторию тиражируемых решений.',
  },
  {
    id: 'economic',
    vector: 'Экономический',
    color: DOMAIN.agriculture,
    headline: 'Самоокупаемый региональный контур',
    metric: 28000,
    metricSuffix: '',
    metricLabel: 'рабочих мест',
    desc: 'Замкнутая экономика воды, энергии и минералов создаёт устойчивую занятость и экспортную выручку внутри региона.',
  },
  {
    id: 'engineering',
    vector: 'Инженерный',
    color: DOMAIN.accent2,
    headline: 'Цифровой двойник и автоматизация',
    metric: 52000,
    metricSuffix: '',
    metricLabel: 'датчиков в сети',
    desc: 'Инфраструктура опреснения, микрогридов и логистики управляется AI-оркестрацией в реальном времени.',
  },
  {
    id: 'ecological',
    vector: 'Экологический',
    color: DOMAIN.nature,
    headline: 'Восстановление экосистемы',
    metric: 18000,
    metricSuffix: ' га',
    metricLabel: 'восстановлено',
    desc: 'Водно-болотные угодья, лесополосы против пыльных бурь и возврат биоразнообразия разворачивают деградацию вспять.',
  },
  {
    id: 'social',
    vector: 'Социальный',
    color: DOMAIN.minerals,
    headline: 'Здоровье, образование, среда',
    metric: 3,
    metricSuffix: ' млн',
    metricLabel: 'человек под влиянием',
    desc: 'Чистая вода, воздух и новые компетенции меняют качество жизни населения южного Приаралья.',
  },
];

// ── Модули проектов и продуктов ──────────────────────────────────────────────
export interface ProjectModule {
  id: string;
  name: string;
  vectorId: string;
  color: string;
  icon: string; // lucide icon name — resolved in the component
  purpose: string;
  metric: string;
}

export const MODULES: ProjectModule[] = [
  {
    id: 'desalination',
    name: 'Вода и опреснение',
    vectorId: 'engineering',
    color: DOMAIN.water,
    icon: 'Waves',
    purpose: 'Солнечное опреснение и рециркуляция для города, агрокуполов и восстановления водоёмов.',
    metric: '480 000 м³/сут',
  },
  {
    id: 'energy',
    name: 'Солнце + ветер + накопители',
    vectorId: 'engineering',
    color: DOMAIN.energy,
    icon: 'Sun',
    purpose: 'Гибридное поле ВИЭ с зелёным водородом питает опреснение, промышленность и город.',
    metric: '3,2 ГВт',
  },
  {
    id: 'agro',
    name: 'Агро-биокупола',
    vectorId: 'economic',
    color: DOMAIN.agriculture,
    icon: 'Sprout',
    purpose: 'Климатические купола с вертикальными фермами, аквапоникой и солеустойчивыми культурами.',
    metric: '120 га',
  },
  {
    id: 'ecocity',
    name: 'Эко-город',
    vectorId: 'social',
    color: DOMAIN.nature,
    icon: 'Building2',
    purpose: 'Биоклиматический «15-минутный город» с локальной генерацией и оборотом серых вод.',
    metric: '45 000 жителей',
  },
  {
    id: 'port',
    name: 'Логистика и порт',
    vectorId: 'economic',
    color: DOMAIN.minerals,
    icon: 'Ship',
    purpose: 'Мультимодальный узел на восстановленной береговой линии и экспорт минералов из рассола.',
    metric: '2,4 млн т/год',
  },
  {
    id: 'rnd',
    name: 'R&D-кампус',
    vectorId: 'research',
    color: DOMAIN.climate,
    icon: 'FlaskConical',
    purpose: 'Открытая наука, климат-лаборатории и полигон прототипов для тиражируемых решений.',
    metric: '1 200 исследователей',
  },
  {
    id: 'monitoring',
    name: 'Сеть мониторинга',
    vectorId: 'engineering',
    color: DOMAIN.accent2,
    icon: 'Gauge',
    purpose: 'Датчики, спутники и IoT формируют цифровой двойник района и поток верифицируемых данных.',
    metric: '52 000 датчиков',
  },
];

// ── Библиотеки знаний (собственные + партнёрские) по доменам векторов ────────
// Онтологическая систематизация: узлы графа знаний над таксономией + фасетами.
export interface KnowledgeLibrary {
  id: string;
  name: string;
  domain: string;
  color: string;
  kind: 'own' | 'partner';
  desc: string;
  facet: string;
}

export const KNOWLEDGE_TERM = {
  title: 'Онтологическая систематизация',
  subtitle: 'граф знаний (knowledge graph) над таксономией и фасетной классификацией',
  note: 'Библиотеки каждого вектора — узлы онтологии; связи между ними задают семантику интеграции модулей.',
} as const;

export const LIBRARIES: KnowledgeLibrary[] = [
  {
    id: 'lib-engineering',
    name: 'Инженерная библиотека',
    domain: 'Инженерия',
    color: DOMAIN.accent2,
    kind: 'own',
    desc: 'Проектные решения опреснения, микрогридов, цифровых двойников и автоматизации.',
    facet: 'Фасет: технология · TRL · модуль',
  },
  {
    id: 'lib-research',
    name: 'Научно-исследовательская библиотека',
    domain: 'Наука',
    color: DOMAIN.climate,
    kind: 'own',
    desc: 'Климатология, гидрология, биоинженерия — открытые датасеты и методики.',
    facet: 'Фасет: дисциплина · метод · датасет',
  },
  {
    id: 'lib-water',
    name: 'Библиотека воды',
    domain: 'Вода',
    color: DOMAIN.water,
    kind: 'own',
    desc: 'Гидробаланс, мембранные модули, рекуперация рассола и минералов.',
    facet: 'Фасет: процесс · источник · качество',
  },
  {
    id: 'lib-energy',
    name: 'Энергетическая библиотека',
    domain: 'Энергия',
    color: DOMAIN.energy,
    kind: 'partner',
    desc: 'ВИЭ, накопители и водород — партнёрские стандарты и модели диспетчеризации.',
    facet: 'Фасет: генерация · хранение · баланс',
  },
  {
    id: 'lib-agro',
    name: 'Агро-биологическая библиотека',
    domain: 'Агро',
    color: DOMAIN.agriculture,
    kind: 'partner',
    desc: 'Галофиты, аквапоника и замкнутые циклы питательных веществ.',
    facet: 'Фасет: культура · цикл · субстрат',
  },
  {
    id: 'lib-eco',
    name: 'Экологическая библиотека',
    domain: 'Экология',
    color: DOMAIN.nature,
    kind: 'own',
    desc: 'Реинтродукция видов, стабилизация почв и мониторинг биоразнообразия.',
    facet: 'Фасет: экосистема · вид · индикатор',
  },
  {
    id: 'lib-social',
    name: 'Социально-правовая библиотека',
    domain: 'Социум',
    color: DOMAIN.minerals,
    kind: 'partner',
    desc: 'Здравоохранение, образование, регламенты и правовые контуры кампании.',
    facet: 'Фасет: сектор · норма · практика',
  },
];

// Рёбра онтологического графа (пары id библиотек) для связного мотива.
export const KNOWLEDGE_EDGES: [string, string][] = [
  ['lib-engineering', 'lib-research'],
  ['lib-engineering', 'lib-water'],
  ['lib-engineering', 'lib-energy'],
  ['lib-research', 'lib-eco'],
  ['lib-water', 'lib-agro'],
  ['lib-energy', 'lib-agro'],
  ['lib-eco', 'lib-social'],
  ['lib-research', 'lib-water'],
];

// ── DAO — связующий слой системности и интеграции ───────────────────────────
export interface DaoFact {
  id: string;
  title: string;
  color: string;
  icon: string;
  desc: string;
}

export const DAO: DaoFact[] = [
  {
    id: 'governance',
    title: 'Управление',
    color: DOMAIN.accent,
    icon: 'Users',
    desc: 'Держатели голосуют за приоритеты модулей и распределение ресурсов кампании.',
  },
  {
    id: 'consensus',
    title: 'Консенсус',
    color: DOMAIN.accent2,
    icon: 'Network',
    desc: 'Решения фиксируются on-chain — прозрачно и невозвратно для всех контуров.',
  },
  {
    id: 'funding',
    title: 'Финансирование',
    color: DOMAIN.agriculture,
    icon: 'Coins',
    desc: 'Пул капитала направляется в модули по верифицируемым результатам, а не по обещаниям.',
  },
  {
    id: 'distribution',
    title: 'Распределение эффективности',
    color: DOMAIN.minerals,
    icon: 'Boxes',
    desc: 'Эффект каждого модуля агрегируется и справедливо распределяется между участниками.',
  },
];

// ── Продукты автоматического сбора / измерения / контроля (MRV + DePIN) ─────
// Данные запечатываются криптографическим хешем ИЛИ токеном эмиссии модуля.
export interface DataProduct {
  id: string;
  name: string;
  moduleId: string;
  color: string;
  icon: string;
  seal: 'hash' | 'token';
  sealLabel: string;
  desc: string;
  metric: string;
}

export const MRV_TERM = {
  title: 'MRV + DePIN',
  subtitle: 'Measurement, Reporting, Verification · Decentralized Physical Infrastructure',
  note: 'Каждый контур (регион → кампания → модуль → вектор) эмитирует собственный верифицируемый поток: измерение сразу запечатывается хешем (неизменяемое доказательство факта) или токеном эмиссии самого модуля (данные → актив прямо в точке замера). Потоки агрегируются в общую эффективность программы и в DAO.',
} as const;

export const DATA_PRODUCTS: DataProduct[] = [
  {
    id: 'water-meter',
    name: 'Счётчики воды и качества',
    moduleId: 'desalination',
    color: DOMAIN.water,
    icon: 'Hash',
    seal: 'hash',
    sealLabel: 'Хеш-якорь',
    desc: 'Объём и качество опреснённой воды сразу запечатываются криптографическим хешем on-chain.',
    metric: 'immutable proof',
  },
  {
    id: 'energy-oracle',
    name: 'Энергетический оракул',
    moduleId: 'energy',
    color: DOMAIN.energy,
    icon: 'Coins',
    seal: 'token',
    sealLabel: 'Токен эмиссии',
    desc: 'Выработка ВИЭ токенизируется модулем в точке замера — данные становятся верифицируемым активом.',
    metric: 'data → asset',
  },
  {
    id: 'agro-sensors',
    name: 'Агро-телеметрия',
    moduleId: 'agro',
    color: DOMAIN.agriculture,
    icon: 'Sprout',
    seal: 'hash',
    sealLabel: 'Хеш-якорь',
    desc: 'Урожайность, расход воды и питательных веществ фиксируются неизменяемым доказательством.',
    metric: 'immutable proof',
  },
  {
    id: 'eco-mrv',
    name: 'Экологический MRV',
    moduleId: 'monitoring',
    color: DOMAIN.nature,
    icon: 'ShieldCheck',
    seal: 'token',
    sealLabel: 'Токен эмиссии',
    desc: 'Поглощение CO₂ и восстановление угодий эмитируются как верифицируемые углеродные токены.',
    metric: 'data → asset',
  },
  {
    id: 'port-ledger',
    name: 'Логистический реестр',
    moduleId: 'port',
    color: DOMAIN.minerals,
    icon: 'Database',
    seal: 'hash',
    sealLabel: 'Хеш-якорь',
    desc: 'Грузооборот и экспорт минералов из рассола запечатываются on-chain в момент операции.',
    metric: 'immutable proof',
  },
  {
    id: 'grid-controller',
    name: 'Контроллер микрогрида',
    moduleId: 'monitoring',
    color: DOMAIN.accent2,
    icon: 'Cpu',
    seal: 'token',
    sealLabel: 'Токен эмиссии',
    desc: 'DePIN-узлы автономно измеряют и токенизируют потоки, агрегируя эффективность в DAO.',
    metric: 'data → asset',
  },
];
