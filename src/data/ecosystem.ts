// ─────────────────────────────────────────────────────────────────────────────
// Онбординг + экосистема UNICAP — типизированный контент для сцен /journey.
//
// Роли (кем пользователь входит), интересы (домены) и узлы экосистемы
// (флагманские проекты вокруг центра). Палитра синхронизирована с журналом:
//   water #00e6c8 · energy #f59e0b · minerals #c084fc · nature #34d399
//   agriculture #a3e635 · climate #7dd3fc · accent #00e6c8 · accent2 #00d4ff
//
// ВАЖНО: Лаборатория (FoxampyForge) присутствует ТОЛЬКО как упоминание —
// отдельная среда / R&D-департамент UNICAP. Никакой Lab OS здесь не строится.
// ─────────────────────────────────────────────────────────────────────────────

export const ECO_COLORS = {
  water: '#00e6c8',
  energy: '#f59e0b',
  minerals: '#c084fc',
  nature: '#34d399',
  agriculture: '#a3e635',
  climate: '#7dd3fc',
  accent: '#00e6c8',
  accent2: '#00d4ff',
} as const;

// ── Роли (шаг «Выбор роли») ─────────────────────────────────────────────────
export interface Role {
  id: string;
  label: string;
  icon: string; // имя иконки lucide-react
  desc: string;
}

export const ROLES: Role[] = [
  { id: 'researcher', label: 'Исследователь', icon: 'FlaskConical', desc: 'Наука, данные, гипотезы' },
  { id: 'partner', label: 'Партнёр', icon: 'Handshake', desc: 'Совместные инициативы' },
  { id: 'company', label: 'Компания', icon: 'Building2', desc: 'Бизнес и внедрение' },
  { id: 'investor', label: 'Инвестор', icon: 'Coins', desc: 'Капитал и рост' },
  { id: 'developer', label: 'Разработчик', icon: 'Code2', desc: 'Продукты и инфраструктура' },
  { id: 'expert', label: 'Эксперт', icon: 'GraduationCap', desc: 'Экспертиза и оценка' },
  { id: 'student', label: 'Студент', icon: 'BookOpen', desc: 'Обучение и практика' },
  { id: 'state', label: 'Государство', icon: 'Landmark', desc: 'Политика и регулирование' },
];

// ── Интересы (шаг «Интересы», мультивыбор) ──────────────────────────────────
export interface Interest {
  id: string;
  label: string;
  color: string;
}

export const INTERESTS: Interest[] = [
  { id: 'ai', label: 'AI', color: ECO_COLORS.accent2 },
  { id: 'water', label: 'Water', color: ECO_COLORS.water },
  { id: 'ecology', label: 'Ecology', color: ECO_COLORS.nature },
  { id: 'architecture', label: 'Architecture', color: ECO_COLORS.climate },
  { id: 'branding', label: 'Branding', color: ECO_COLORS.energy },
  { id: 'blockchain', label: 'Blockchain', color: ECO_COLORS.minerals },
  { id: 'design', label: 'Design', color: ECO_COLORS.accent },
  { id: 'innovation', label: 'Innovation', color: ECO_COLORS.agriculture },
  { id: 'smartcity', label: 'Smart City', color: ECO_COLORS.climate },
];

// ── Узлы экосистемы (Living Ecosystem) ──────────────────────────────────────
export interface EcosystemNode {
  id: string;
  name: string;
  tagline: string;
  color: string;
  icon: string; // имя иконки lucide-react
  note?: string;
}

export const ECOSYSTEM_NODES: EcosystemNode[] = [
  {
    id: 'aral',
    name: 'Aral Nexus',
    tagline: 'Флагман возрождения Арала — эталонный контур программы',
    color: ECO_COLORS.water,
    icon: 'Waves',
  },
  {
    id: 'ethosium',
    name: 'Ethosium',
    tagline: 'Этико-ценностный слой — принципы и доверие экосистемы',
    color: ECO_COLORS.minerals,
    icon: 'Scale',
  },
  {
    id: 'vodeco',
    name: 'VOD.eco',
    tagline: 'Водный и эко data-контур — верифицируемые потоки измерений',
    color: ECO_COLORS.accent,
    icon: 'Droplets',
  },
  {
    id: 'lab',
    name: 'Innovation Lab',
    tagline: 'R&D-лаборатория, питающая экосистему исследованиями',
    color: ECO_COLORS.agriculture,
    icon: 'FlaskConical',
    note: 'отдельная среда · R&D-департамент UNICAP',
  },
  {
    id: 'ai',
    name: 'AI',
    tagline: 'ИИ-агенты — аналитика, прогноз и поддержка решений',
    color: ECO_COLORS.accent2,
    icon: 'Cpu',
  },
  {
    id: 'education',
    name: 'Education',
    tagline: 'Академия и курсы — подготовка команд и экспертов',
    color: ECO_COLORS.climate,
    icon: 'GraduationCap',
  },
  {
    id: 'dao',
    name: 'DAO',
    tagline: 'Связующее управление — консенсус и распределение эффектов',
    color: ECO_COLORS.nature,
    icon: 'Network',
  },
];
