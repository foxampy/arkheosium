// ─────────────────────────────────────────────────────────────────────────────
// Block 6 — данные обзора кампаний: город-остров, переброс паводковых вод из
// Сибири и прочие тиражируемые кампании / модули единой программы.
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

// ── 1 · Город-остров: концентрические кольца ────────────────────────────────
export interface IslandRing {
  id: string;
  label: string;
  color: string;
  icon: string; // lucide icon name — resolved in the component
  desc: string;
}

// Кольца от ядра к периферии (rendered outer→inner in the SVG).
export const ISLAND_RINGS: IslandRing[] = [
  {
    id: 'core',
    label: 'Ядро города',
    color: DOMAIN.accent2,
    icon: 'Cpu',
    desc: 'Центр управления, цифровой двойник и общественные пространства «15-минутного города».',
  },
  {
    id: 'residential',
    label: 'Жилое кольцо',
    color: DOMAIN.nature,
    icon: 'Building2',
    desc: 'Биоклиматические кварталы с зелёными кровлями, оборотом серых вод и локальной генерацией.',
  },
  {
    id: 'agro',
    label: 'Кольцо агро-куполов',
    color: DOMAIN.agriculture,
    icon: 'Sprout',
    desc: 'Климатические купола с вертикальными фермами и аквапоникой по замкнутому циклу воды.',
  },
  {
    id: 'energy',
    label: 'Периметр ВИЭ',
    color: DOMAIN.energy,
    icon: 'Sun',
    desc: 'Солнце, ветер и накопители по кольцу дают полную энергоавтономность острова.',
  },
  {
    id: 'shoreline',
    label: 'Восстановленный берег',
    color: DOMAIN.water,
    icon: 'Waves',
    desc: 'Водно-болотные угодья и нерестилища по кромке восстановленной акватории Арала.',
  },
];

export interface IslandStat {
  id: string;
  value: string;
  label: string;
  color: string;
  icon: string;
}

export const ISLAND_STATS: IslandStat[] = [
  { id: 'residents', value: '45 000', label: 'жителей острова', color: DOMAIN.nature, icon: 'Users' },
  { id: 'energy', value: '92%', label: 'энергоавтономность', color: DOMAIN.energy, icon: 'Sun' },
  { id: 'water', value: '99,4%', label: 'замкнутый цикл воды', color: DOMAIN.water, icon: 'Droplets' },
  { id: 'green', value: '38%', label: 'доля зелёных зон', color: DOMAIN.agriculture, icon: 'Sprout' },
];

// ── 2 · Переброс паводковых вод из Сибири ────────────────────────────────────
export interface TransferStat {
  id: string;
  value: string;
  label: string;
  color: string;
  icon: string;
}

export const TRANSFER_STATS: TransferStat[] = [
  { id: 'volume', value: '27 км³/год', label: 'объём переброса (только паводок)', color: DOMAIN.water, icon: 'CloudRain' },
  { id: 'length', value: '2 550 км', label: 'длина умного коридора', color: DOMAIN.accent2, icon: 'Waves' },
  { id: 'area', value: '18 000 га', label: 'восстановление акватории', color: DOMAIN.nature, icon: 'Droplets' },
];

// Узлы коридора: сибирский бассейн → умный канал/акведук → Аральский бассейн.
export interface CorridorNode {
  id: string;
  label: string;
  sub: string;
  color: string;
  icon: string;
}

export const CORRIDOR_NODES: CorridorNode[] = [
  { id: 'siberia', label: 'Сибирские бассейны', sub: 'сезонный паводковый профицит', color: DOMAIN.climate, icon: 'Snowflake' },
  { id: 'corridor', label: 'Умный коридор', sub: 'клапаны · мониторинг · самотёк + солнце', color: DOMAIN.accent2, icon: 'Waves' },
  { id: 'aral', label: 'Аральский бассейн', sub: 'восстановление экологии акватории', color: DOMAIN.nature, icon: 'Droplets' },
];

// Принципы экологической безопасности переброса.
export interface TransferPrinciple {
  id: string;
  title: string;
  color: string;
  icon: string;
}

export const TRANSFER_PRINCIPLES: TransferPrinciple[] = [
  { id: 'flood', title: 'Только сезонный паводковый профицит', color: DOMAIN.water, icon: 'CloudRain' },
  { id: 'smart', title: 'Умные клапаны и непрерывный мониторинг', color: DOMAIN.accent2, icon: 'Gauge' },
  { id: 'gravity', title: 'Самотёк + солнечные насосы', color: DOMAIN.energy, icon: 'Sun' },
  { id: 'eco', title: 'Экологически безопасно для рек-доноров', color: DOMAIN.nature, icon: 'ShieldCheck' },
];

// ── 3 · Прочие кампании и модули ─────────────────────────────────────────────
export interface Campaign {
  id: string;
  title: string;
  desc: string;
  color: string;
  icon: string;
  kind: 'region' | 'module';
}

export const CAMPAIGNS: Campaign[] = [
  {
    id: 'sahel',
    title: 'Сахель',
    desc: 'Зелёный пояс против опустынивания на 8 000 км.',
    color: DOMAIN.agriculture,
    icon: 'Sprout',
    kind: 'region',
  },
  {
    id: 'mideast',
    title: 'Ближний Восток',
    desc: 'Солнечное опреснение для засушливых мегаполисов.',
    color: DOMAIN.energy,
    icon: 'Sun',
    kind: 'region',
  },
  {
    id: 'deadsea',
    title: 'Бассейн Мёртвого моря',
    desc: 'Стабилизация уровня и минералы из рассола.',
    color: DOMAIN.minerals,
    icon: 'Droplets',
    kind: 'region',
  },
  {
    id: 'arid',
    title: 'Засушливые регионы',
    desc: 'Тиражируемый шаблон эко-города «под ключ».',
    color: DOMAIN.climate,
    icon: 'Globe2',
    kind: 'region',
  },
  {
    id: 'caspian',
    title: 'Каспийский контур',
    desc: 'Модуль стабилизации уровня и логистики каспийского побережья.',
    color: DOMAIN.water,
    icon: 'Ship',
    kind: 'module',
  },
  {
    id: 'arctic',
    title: 'Арктический водный резерв',
    desc: 'Модуль сбора и переброса талых паводковых вод в засушливые контуры.',
    color: DOMAIN.accent2,
    icon: 'Snowflake',
    kind: 'module',
  },
];
