import { useState, useRef, useEffect, useMemo } from 'react';
import { useLocation } from 'wouter';
import {
  motion, AnimatePresence, useInView,
} from 'framer-motion';
import {
  Sparkles, Waves, MapPin, Coins, Droplets, Sun,
  Building2, Ship, TreePine, Cpu, FlaskConical, ArrowRight,
  ChevronRight, Fish, Gauge, Globe2, Rocket,
  Zap, Users, CloudRain, Sprout, Layers, Database,
} from 'lucide-react';
import { WaterMap } from '@/components/map/WaterMap';
import type { MapMarker, WaterMapHandle } from '@/components/map/types';
import { getAllMapMarkers } from '@/data/map-markers';
import { CA_BBOX } from '@/data/geo/ca-sources';
import DualProgramStage from '@/components/eco/DualProgramStage';
import KarakalpakCampaign from '@/components/eco/KarakalpakCampaign';
import CampaignsOverview from '@/components/eco/CampaignsOverview';

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  bg: '#000818',
  accent: '#00e6c8',
  accent2: '#00d4ff',
  water: '#00e6c8',
  energy: '#f59e0b',
  minerals: '#c084fc',
  nature: '#34d399',
  agriculture: '#a3e635',
  climate: '#7dd3fc',
};

// ─── Reduced motion hook ──────────────────────────────────────────────────────
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, []);
  return reduced;
}

// ─── Animated count-up ────────────────────────────────────────────────────────
function Counter({
  to, suffix = '', prefix = '', decimals = 0,
}: { to: number; suffix?: string; prefix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const reduced = usePrefersReducedMotion();
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduced) { setVal(to); return; }
    const dur = 1600, step = 16, inc = to / (dur / step);
    let cur = 0;
    const t = setInterval(() => {
      cur = Math.min(cur + inc, to);
      setVal(cur);
      if (cur >= to) clearInterval(t);
    }, step);
    return () => clearInterval(t);
  }, [inView, to, reduced]);

  const shown = decimals > 0
    ? val.toLocaleString('ru-RU', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : Math.round(val).toLocaleString('ru-RU');
  return <span ref={ref}>{prefix}{shown}{suffix}</span>;
}

// ─── Data: masterplan zones ───────────────────────────────────────────────────
interface Zone {
  id: string;
  name: string;
  color: string;
  icon: React.ReactNode;
  desc: string;
  tech: string[];
  kpi: { label: string; value: string }[];
  poly: string;
  cx: number; cy: number;
}

const ZONES: Zone[] = [
  {
    id: 'housing', name: 'Жилой эко-квартал', color: C.nature, icon: <Building2 size={18} />,
    desc: 'Компактный самодостаточный квартал из биоклиматических зданий с зелёными кровлями, естественной вентиляцией и локальной генерацией. Пешеходная среда «15-минутного города».',
    tech: ['Пассивные дома', 'Зелёные кровли', 'Локальный микрогрид', 'Серые воды в оборот'],
    kpi: [
      { label: 'Жителей', value: '45 000' },
      { label: 'Энергоавтономность', value: '92%' },
      { label: 'Зелёных зон', value: '38%' },
    ],
    poly: '60,60 230,60 230,190 60,190', cx: 145, cy: 125,
  },
  {
    id: 'water', name: 'Опреснение и вода', color: C.water, icon: <Droplets size={18} />,
    desc: 'Кластер солнечного опреснения и рециркуляции. Мембранные модули на ВИЭ подают пресную воду в город, агрокупола и на восстановление водоёмов.',
    tech: ['Обратный осмос', 'Солнечная дистилляция', 'Рассол → минералы', 'Умные акведуки'],
    kpi: [
      { label: 'Пресной воды', value: '480 000 м³/сут' },
      { label: 'Рекуперация', value: '99,4%' },
      { label: 'Энергия на м³', value: '2,1 кВт·ч' },
    ],
    poly: '250,60 430,60 430,190 250,190', cx: 340, cy: 125,
  },
  {
    id: 'energy', name: 'Возобновляемая энергетика', color: C.energy, icon: <Sun size={18} />,
    desc: 'Гибридное поле солнце + ветер + накопители и зелёный водород. Питает опреснение, промышленность и город, балансируя пики через AI-грид.',
    tech: ['PV-трекеры', 'Ветропарк', 'Батарейные хабы', 'Электролиз H₂'],
    kpi: [
      { label: 'Установленная мощность', value: '3,2 ГВт' },
      { label: 'Доля ВИЭ', value: '100%' },
      { label: 'Накопитель', value: '4,8 ГВт·ч' },
    ],
    poly: '450,60 640,60 640,190 450,190', cx: 545, cy: 125,
  },
  {
    id: 'agro', name: 'Агро-биокупола', color: C.agriculture, icon: <Sprout size={18} />,
    desc: 'Климатические купола с вертикальными фермами, аквапоникой и солеустойчивыми культурами. Замкнутый цикл воды и питательных веществ.',
    tech: ['Вертикальные фермы', 'Аквапоника', 'Галофиты', 'Досветка на ВИЭ'],
    kpi: [
      { label: 'Урожайность', value: 'x12 к открытому полю' },
      { label: 'Расход воды', value: '−94%' },
      { label: 'Площадь куполов', value: '120 га' },
    ],
    poly: '60,210 230,210 230,340 60,340', cx: 145, cy: 275,
  },
  {
    id: 'nature', name: 'Био-парк / восстановление', color: C.nature, icon: <TreePine size={18} />,
    desc: 'Ядро восстановления экосистемы: водно-болотные угодья, лесополосы против пыльных бурь, нерестилища и коридоры для дикой природы.',
    tech: ['Водно-болотные угодья', 'Лесополосы', 'Реинтродукция видов', 'Стабилизация почв'],
    kpi: [
      { label: 'Восстановлено', value: '18 000 га' },
      { label: 'Видов флоры/фауны', value: '240+' },
      { label: 'Пыльные бури', value: '−70%' },
    ],
    poly: '250,210 430,210 430,340 250,340', cx: 340, cy: 275,
  },
  {
    id: 'ops', name: 'Центр управления ОС', color: C.accent2, icon: <Cpu size={18} />,
    desc: 'Цифровой двойник района: AI-ядро сводит данные датчиков, спутников и IoT, оптимизирует потоки воды, энергии и логистики в реальном времени.',
    tech: ['Цифровой двойник', 'AI-оркестрация', 'IoT-телеметрия', 'Предиктивная аналитика'],
    kpi: [
      { label: 'Датчиков', value: '52 000' },
      { label: 'Отклик системы', value: '<200 мс' },
      { label: 'Экономия ресурсов', value: '31%' },
    ],
    poly: '450,210 640,210 640,340 450,340', cx: 545, cy: 275,
  },
  {
    id: 'port', name: 'Логистика и порт', color: C.minerals, icon: <Ship size={18} />,
    desc: 'Мультимодальный узел на восстановленной береговой линии: грузовой порт, склады, зелёный транспорт и хаб экспорта минералов из рассола.',
    tech: ['Электро-логистика', 'Автономные суда', 'Складская роботизация', 'Экспорт минералов'],
    kpi: [
      { label: 'Грузооборот', value: '2,4 млн т/год' },
      { label: 'Электрофлот', value: '100%' },
      { label: 'Рабочих мест', value: '3 600' },
    ],
    poly: '60,360 340,360 340,470 60,470', cx: 200, cy: 415,
  },
  {
    id: 'rnd', name: 'Наука и R&D', color: C.climate, icon: <FlaskConical size={18} />,
    desc: 'Международный кампус: климатология, гидрология, биоинженерия и материаловедение. Открытая наука и полигон для тиражируемых решений.',
    tech: ['Открытая наука', 'Климат-лаборатории', 'Биоинженерия', 'Полигон прототипов'],
    kpi: [
      { label: 'Исследователей', value: '1 200' },
      { label: 'Патентов/год', value: '85' },
      { label: 'Партнёр-вузов', value: '40' },
    ],
    poly: '360,360 640,360 640,470 360,470', cx: 500, cy: 415,
  },
];

// ─── Data: ecosystem phases ───────────────────────────────────────────────────
interface EcoPhase {
  id: number; title: string; color: string; goal: string;
  metrics: { label: string; value: string }[];
  render: 'bare' | 'water' | 'plants' | 'wildlife' | 'city';
}
const ECO_PHASES: EcoPhase[] = [
  {
    id: 1, title: 'Стабилизация', color: C.minerals, render: 'bare',
    goal: 'Остановить деградацию: закрепление грунтов, борьба с солевой пылью, базовая инфраструктура и сеть мониторинга.',
    metrics: [{ label: 'Стаб. грунтов', value: '4 000 га' }, { label: 'Датчиков', value: '5 000' }, { label: 'Срок', value: '2025–2027' }],
  },
  {
    id: 2, title: 'Вода', color: C.water, render: 'water',
    goal: 'Возврат воды: солнечное опреснение, умные акведуки, наполнение водно-болотных угодий и восстановление гидробаланса.',
    metrics: [{ label: 'Заполнено', value: '1 800 га' }, { label: 'Опреснение', value: '150 000 м³/сут' }, { label: 'Срок', value: '2027–2030' }],
  },
  {
    id: 3, title: 'Биоразнообразие', color: C.nature, render: 'plants',
    goal: 'Возвращение жизни: лесополосы, галофиты, планктон и водоросли как основа пищевой цепи, восстановление почв.',
    metrics: [{ label: 'Посадки', value: '9 500 га' }, { label: 'Видов флоры', value: '120+' }, { label: 'Срок', value: '2029–2033' }],
  },
  {
    id: 4, title: 'Экосистема', color: C.agriculture, render: 'wildlife',
    goal: 'Устойчивая фауна: рыбные популяции, птичьи маршруты, самоподдерживающиеся пищевые цепи и аквакультура.',
    metrics: [{ label: 'Видов фауны', value: '120+' }, { label: 'Рыбозапас', value: '↑ 8x' }, { label: 'Срок', value: '2032–2036' }],
  },
  {
    id: 5, title: 'Город и масштаб', color: C.accent2, render: 'city',
    goal: 'Полноценный эко-город и превращение модели в тиражируемый шаблон для засушливых регионов планеты.',
    metrics: [{ label: 'Жителей', value: '45 000' }, { label: 'Рабочих мест', value: '28 000' }, { label: 'Срок', value: '2035–2040' }],
  },
];

// ─── Ecosystem mini diagram (per phase) ───────────────────────────────────────
function EcoDiagram({ render, color }: { render: EcoPhase['render']; color: string }) {
  return (
    <svg viewBox="0 0 320 200" className="w-full h-auto">
      <defs>
        <linearGradient id="ecoSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#001028" />
          <stop offset="100%" stopColor="#00203a" />
        </linearGradient>
        <linearGradient id="ecoWater" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.water} stopOpacity="0.55" />
          <stop offset="100%" stopColor={C.accent2} stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="320" height="200" rx="14" fill="url(#ecoSky)" />
      {/* ground */}
      <path d="M0,150 L320,150 L320,200 L0,200 Z" fill="#3a2f1e" opacity="0.85" />
      {/* water */}
      <AnimatePresence>
        {render !== 'bare' && (
          <motion.path
            key="water"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            d="M0,150 Q80,138 160,150 T320,150 L320,200 L0,200 Z"
            fill="url(#ecoWater)"
          />
        )}
      </AnimatePresence>
      {/* plants */}
      <AnimatePresence>
        {(render === 'plants' || render === 'wildlife' || render === 'city') &&
          [40, 90, 250, 285].map((x, i) => (
            <motion.g
              key={'plant' + x}
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{ scaleY: 1, opacity: 1 }}
              exit={{ scaleY: 0, opacity: 0 }}
              transition={{ delay: i * 0.08 }}
              style={{ transformOrigin: `${x}px 150px` }}
            >
              <rect x={x - 1.5} y={128} width="3" height="22" fill="#6b4a2a" />
              <circle cx={x} cy={124} r="12" fill={C.nature} opacity="0.9" />
            </motion.g>
          ))}
      </AnimatePresence>
      {/* wildlife (fish + bird) */}
      <AnimatePresence>
        {(render === 'wildlife' || render === 'city') && (
          <motion.g key="wild" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.g
              animate={{ x: [0, 30, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ellipse cx="150" cy="175" rx="9" ry="4" fill={C.agriculture} />
              <path d="M141,175 l-7,-4 l0,8 z" fill={C.agriculture} />
            </motion.g>
            <motion.g
              animate={{ x: [0, 40, 0], y: [0, -6, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <path d="M120,50 q6,-6 12,0 q6,-6 12,0" stroke={C.climate} strokeWidth="2" fill="none" />
            </motion.g>
          </motion.g>
        )}
      </AnimatePresence>
      {/* city */}
      <AnimatePresence>
        {render === 'city' &&
          [175, 205, 235].map((x, i) => (
            <motion.rect
              key={'b' + x}
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{ scaleY: 1, opacity: 1 }}
              exit={{ scaleY: 0, opacity: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{ transformOrigin: `${x}px 150px` }}
              x={x} y={100} width="20" height="50" rx="3"
              fill={C.accent2} opacity="0.75"
            />
          ))}
      </AnimatePresence>
      {/* sun/marker */}
      <circle cx="285" cy="45" r="16" fill={color} opacity="0.35" />
      <circle cx="285" cy="45" r="9" fill={color} opacity="0.8" />
    </svg>
  );
}

// ─── Timeline sea-shape morph ─────────────────────────────────────────────────
const SEA_SHAPES: Record<string, string> = {
  '1960': 'M40,60 C90,30 190,25 250,55 C300,80 300,150 250,175 C180,205 90,200 45,165 C10,135 5,90 40,60 Z',
  '2010': 'M150,110 C165,100 185,102 195,115 C202,128 198,142 182,148 C168,153 152,150 145,138 C138,126 140,118 150,110 Z',
  '2040': 'M70,80 C120,55 200,58 240,88 C265,108 250,150 205,162 C155,175 100,168 72,140 C52,120 50,98 70,80 Z',
};

// ─── Resource flow (Sankey-like) ──────────────────────────────────────────────
interface FlowNode { id: string; label: string; x: number; y: number; color: string; }
const FLOW_SOURCES: FlowNode[] = [
  { id: 'desal', label: 'Опреснение', x: 60, y: 70, color: C.water },
  { id: 'solar', label: 'Солнце', x: 60, y: 170, color: C.energy },
  { id: 'wind', label: 'Ветер', x: 60, y: 270, color: C.climate },
];
const FLOW_CONS: FlowNode[] = [
  { id: 'city', label: 'Город', x: 340, y: 70, color: C.nature },
  { id: 'agro', label: 'Агро', x: 340, y: 170, color: C.agriculture },
  { id: 'ind', label: 'Промышленность', x: 340, y: 270, color: C.minerals },
];
const FLOW_RETURN: FlowNode[] = [
  { id: 'recycle', label: 'Переработка', x: 620, y: 120, color: C.accent2 },
  { id: 'restore', label: 'Восстановление', x: 620, y: 220, color: C.nature },
];

// ─── KPI dashboard data ───────────────────────────────────────────────────────
const KPIS = [
  { label: 'Восстановленная площадь', to: 18000, suffix: ' га', icon: <TreePine size={18} />, color: C.nature },
  { label: 'Рабочих мест', to: 28000, suffix: '', icon: <Users size={18} />, color: C.agriculture },
  { label: 'Мощность ВИЭ', to: 3.2, suffix: ' ГВт', decimals: 1, icon: <Zap size={18} />, color: C.energy },
  { label: 'CO₂ поглощение', to: 640000, suffix: ' т/год', icon: <CloudRain size={18} />, color: C.climate },
  { label: 'Пресной воды', to: 480000, suffix: ' м³/сут', icon: <Droplets size={18} />, color: C.water },
  { label: 'Видов флоры/фауны', to: 240, suffix: '+', icon: <Fish size={18} />, color: C.minerals },
];

// ─── Roadmap ──────────────────────────────────────────────────────────────────
const ROADMAP = [
  { year: '2025', title: 'Старт и мониторинг', color: C.minerals, items: ['Соглашения и финансирование', 'Сеть датчиков', 'Цифровой двойник v1'] },
  { year: '2028', title: 'Вода и энергия', color: C.water, items: ['Первый опреснительный кластер', 'Солнце+ветер 1 ГВт', 'Наполнение угодий'] },
  { year: '2032', title: 'Живая экосистема', color: C.nature, items: ['Лесополосы и галофиты', 'Возврат фауны', 'Агро-биокупола'] },
  { year: '2036', title: 'Эко-город', color: C.accent2, items: ['Жилой квартал', 'Порт и логистика', 'R&D-кампус'] },
  { year: '2040', title: 'Тиражирование', color: C.accent, items: ['Экспорт модели', 'Открытая наука', 'DAO-управление'] },
];

// ─── Replicability targets ────────────────────────────────────────────────────
const REPLICA = [
  { region: 'Сахель', desc: 'Зелёный пояс против опустынивания на 8000 км.', color: C.agriculture, icon: <Sprout size={18} /> },
  { region: 'Ближний Восток', desc: 'Солнечное опреснение для засушливых мегаполисов.', color: C.energy, icon: <Sun size={18} /> },
  { region: 'Бассейн Мёртвого моря', desc: 'Стабилизация уровня и минералы из рассола.', color: C.minerals, icon: <Droplets size={18} /> },
  { region: 'Засушливые регионы', desc: 'Тиражируемый шаблон эко-города «под ключ».', color: C.climate, icon: <Globe2 size={18} /> },
];

// ─── Chapter shell (glass card + IntersectionObserver anchor) ──────────────────
function ChapterCard({
  id, eyebrow, title, subtitle, color = C.accent, children,
}: {
  id?: string; eyebrow: string; title: string; subtitle?: string;
  color?: string; children: React.ReactNode;
}) {
  const reduced = usePrefersReducedMotion();
  return (
    <div
      className="rounded-3xl p-5 sm:p-8"
      style={{
        background: 'rgba(6,15,28,0.6)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
      }}
    >
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 20 }}
        whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase mb-4"
          style={{ background: color + '18', color, border: `1px solid ${color}33` }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
          {eyebrow}
        </div>
        <h2 className="text-2xl sm:text-4xl font-bold text-white leading-tight">{title}</h2>
        {subtitle && (
          <p className="mt-3 text-white/55 text-sm sm:text-base">{subtitle}</p>
        )}
      </motion.div>
      {children}
    </div>
  );
}

// ─── Chapter meta: map center + zoom per chapter ───────────────────────────────
// Central Asia region center [63,41.5] z5; Aral Sea ≈ [59,45].
interface ChapterMeta { key: string; center: [number, number]; zoom: number }
const CHAPTERS: ChapterMeta[] = [
  { key: 'intro',   center: [63, 41.5], zoom: 5 },   // whole Central Asia
  { key: 'crisis',  center: [59, 45],   zoom: 6 },   // Aral basin
  { key: 'zones',   center: [58.5, 45.2], zoom: 6.5 }, // restored shoreline / zones
  { key: 'phases',  center: [59, 45],   zoom: 6 },   // Aral (eco phases / water balance)
  { key: 'economy', center: [63, 41.5], zoom: 5 },   // wider CA — single economic space
  { key: 'roadmap', center: [63, 41.5], zoom: 5 },   // whole CA — seam to Block 4
  { key: 'program', center: [63, 41.5], zoom: 4.4 }, // Block 4 — zoom out: region → whole program
  { key: 'karakalpak', center: [59.7, 43.0], zoom: 6 }, // Block 5 — Karakalpakstan / south Aral
  { key: 'campaigns', center: [64, 50], zoom: 3.2 }, // Block 6 — zoom out: Siberia→Aral transfer corridor + all campaigns
];

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function AralSeaProjectPage() {
  const [, setLocation] = useLocation();
  const [selectedZone, setSelectedZone] = useState<Zone>(ZONES[0]);
  const [ecoPhase, setEcoPhase] = useState<EcoPhase>(ECO_PHASES[0]);
  const reduced = usePrefersReducedMotion();

  // ── Map handle + markers ─────────────────────────────────────
  const mapHandle = useRef<WaterMapHandle | null>(null);
  const caMarkers = useMemo<MapMarker[]>(() => {
    const inCa = (m: MapMarker) =>
      m.lng >= CA_BBOX.west && m.lng <= CA_BBOX.east &&
      m.lat >= CA_BBOX.south && m.lat <= CA_BBOX.north;
    return getAllMapMarkers().filter(inCa);
  }, []);

  // ── Active-chapter detection → flyTo ─────────────────────────
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the most-visible chapter currently intersecting.
        let best: { idx: number; ratio: number } | null = null;
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const idx = Number((e.target as HTMLElement).dataset.chapter);
          if (Number.isNaN(idx)) continue;
          if (!best || e.intersectionRatio > best.ratio) {
            best = { idx, ratio: e.intersectionRatio };
          }
        }
        if (best && best.idx !== activeRef.current) {
          activeRef.current = best.idx;
          setActive(best.idx);
          const ch = CHAPTERS[best.idx];
          mapHandle.current?.flyTo(ch.center, ch.zoom);
        }
      },
      { threshold: [0.5], rootMargin: '-10% 0px -10% 0px' },
    );
    sectionRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const setSectionRef = (idx: number) => (el: HTMLElement | null) => {
    sectionRefs.current[idx] = el;
  };

  const timeline = ['1960', '2010', '2040'] as const;
  const [tlYear, setTlYear] = useState<'1960' | '2010' | '2040'>('1960');

  return (
    <div className="min-h-screen text-white" style={{ background: C.bg }}>
      {/* ══ SPLIT LAYOUT: sticky map (left / top) + scrolling chapters ══ */}
      <div className="lg:flex lg:items-start">

        {/* ── MAP: sticky top-half on mobile, sticky left column on desktop ── */}
        <div className="sticky top-0 z-10 w-full lg:w-1/2 h-[45vh] lg:h-screen overflow-hidden">
          <div className="relative w-full h-full">
            <WaterMap
              mapRef={mapHandle}
              center={CHAPTERS[0].center}
              zoom={CHAPTERS[0].zoom}
              markers={caMarkers}
              layers={['rivers', 'lakes', 'glaciers', 'borders', 'cities']}
              showGroups
              cluster
              interactive
              height="100%"
              className="h-full"
            />
            {/* subtle top gradient so chapters read over the map seam */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-16"
              style={{ background: `linear-gradient(180deg, ${C.bg}cc, transparent)` }}
            />
            <div
              className="pointer-events-none absolute left-4 top-4 px-3 py-1.5 rounded-full text-[11px] font-semibold"
              style={{ background: 'rgba(6,15,28,0.7)', color: C.accent, border: `1px solid ${C.accent}33`, backdropFilter: 'blur(8px)' }}
            >
              <MapPin size={12} className="inline mr-1 -mt-0.5" />
              Центральная Азия · Аральский бассейн
            </div>
          </div>
        </div>

        {/* ── CHAPTERS: scroll in the right column (desktop) / below map (mobile) ── */}
        <div className="w-full lg:w-1/2 px-4 sm:px-6 pb-24">
          <div className="max-w-2xl mx-auto space-y-10 sm:space-y-16 pt-8 sm:pt-14">

            {/* ══ CHAPTER 1 — INTRO ══════════════════════════════════════ */}
            <section
              ref={setSectionRef(0)}
              data-chapter={0}
              id="intro"
              className="scroll-mt-8"
            >
              <div
                className="rounded-3xl p-6 sm:p-9 relative overflow-hidden"
                style={{
                  background: 'rgba(6,15,28,0.6)',
                  border: `1px solid ${C.accent}33`,
                  backdropFilter: 'blur(14px)',
                }}
              >
                <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full" style={{ background: C.accent + '18', filter: 'blur(60px)' }} />
                <div className="relative">
                  <div
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-5"
                    style={{ background: C.accent + '18', color: C.accent, border: `1px solid ${C.accent}33` }}
                  >
                    <Sparkles size={14} /> Проект «Аральское море»
                  </div>
                  <h1 className="text-3xl sm:text-5xl font-black leading-[1.05]">
                    <span className="bg-clip-text text-transparent" style={{
                      backgroundImage: `linear-gradient(120deg, ${C.accent}, ${C.accent2} 55%, ${C.climate})`,
                    }}>
                      Возрождение
                    </span>
                    <br />
                    <span className="text-white">Аральского моря</span>
                  </h1>
                  <p className="mt-5 text-white/65 text-base sm:text-lg leading-relaxed">
                    Превращаем крупнейшую рукотворную экокатастрофу планеты в тиражируемый
                    чертёж эко-городов будущего — где вода, энергия, природа и люди
                    работают как единая живая система.
                  </p>

                  <div className="mt-7 grid grid-cols-3 gap-3">
                    {[
                      { to: caMarkers.length, suffix: '', l: 'объектов на карте', c: C.accent2 },
                      { to: 18000, suffix: ' га', l: 'восстановления', c: C.nature },
                      { to: 45000, suffix: '', l: 'жителей эко-города', c: C.agriculture },
                    ].map((s) => (
                      <div key={s.l} className="rounded-2xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <div className="text-lg sm:text-2xl font-black" style={{ color: s.c }}>
                          <Counter to={s.to} suffix={s.suffix} />
                        </div>
                        <div className="text-[10px] text-white/45 mt-1 leading-tight">{s.l}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-7 flex flex-wrap gap-3">
                    <button
                      onClick={() => setLocation('/map')}
                      className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-semibold text-[#001018] transition-all hover:opacity-90 cursor-pointer"
                      style={{ background: `linear-gradient(120deg, ${C.accent}, ${C.accent2})`, boxShadow: `0 8px 30px ${C.accent}44` }}
                    >
                      <MapPin size={18} /> Открыть на карте
                      <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                    </button>
                    <button
                      onClick={() => setLocation('/tokenomics')}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-semibold text-white/85 border border-white/15 hover:bg-white/5 hover:text-white transition-all cursor-pointer"
                    >
                      <Coins size={18} /> Экономика проекта
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* ══ CHAPTER 2 — CRISIS / TIMELINE ══════════════════════════ */}
            <section ref={setSectionRef(1)} data-chapter={1} id="crisis" className="scroll-mt-8">
              <ChapterCard
                eyebrow="Кризис → Возрождение"
                title="От катастрофы к восстановлению"
                subtitle="За 60 лет море потеряло почти всю воду. Наша модель разворачивает этот процесс вспять."
                color={C.water}
              >
                <div className="rounded-2xl p-5 mb-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <svg viewBox="0 0 300 220" className="w-full h-auto">
                    <defs>
                      <linearGradient id="tlSea" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={C.water} />
                        <stop offset="100%" stopColor={C.accent2} />
                      </linearGradient>
                    </defs>
                    <rect x="0" y="0" width="300" height="220" rx="14" fill="#00121f" />
                    <path d={SEA_SHAPES['1960']} fill="none" stroke={C.minerals} strokeOpacity="0.3" strokeDasharray="5 6" strokeWidth="1.5" />
                    <motion.path
                      d={SEA_SHAPES[tlYear]}
                      animate={{ d: SEA_SHAPES[tlYear] }}
                      transition={{ duration: 1, ease: 'easeInOut' }}
                      fill="url(#tlSea)" fillOpacity="0.75"
                    />
                    <text x="150" y="205" textAnchor="middle" fill="#ffffff" fontSize="16" fontWeight="700">{tlYear}</text>
                  </svg>
                  <div className="mt-4 flex gap-2">
                    {timeline.map((y) => (
                      <button
                        key={y}
                        onClick={() => setTlYear(y)}
                        className="flex-1 py-2 rounded-xl text-sm font-semibold border transition-all cursor-pointer"
                        style={{
                          background: tlYear === y ? C.water + '22' : 'transparent',
                          borderColor: tlYear === y ? C.water : 'rgba(255,255,255,0.12)',
                          color: tlYear === y ? C.water : 'rgba(255,255,255,0.6)',
                        }}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { label: 'Площадь моря', to: 68000, suffix: ' км²', color: C.water, note: 'пик 1960 → минимум 2010' },
                    { label: 'Потеря воды', to: 90, suffix: '%', color: C.minerals, note: 'испарилось от исходного объёма' },
                    { label: 'Население под влиянием', to: 3, suffix: ' млн', color: C.agriculture, note: 'здоровье, климат, экономика' },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="rounded-2xl p-4"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <div className="text-xs text-white/45 uppercase tracking-wide mb-1">{s.label}</div>
                      <div className="text-3xl font-black" style={{ color: s.color }}>
                        <Counter to={s.to} suffix={s.suffix} />
                      </div>
                      <div className="text-xs text-white/40 mt-1">{s.note}</div>
                    </div>
                  ))}
                </div>
              </ChapterCard>
            </section>

            {/* ══ CHAPTER 3 — RECOVERY ZONES (masterplan) ════════════════ */}
            <section ref={setSectionRef(2)} data-chapter={2} id="zones" className="scroll-mt-8">
              <ChapterCard
                eyebrow="Зоны восстановления"
                title="Мастер-план эко-района"
                subtitle="Выберите зону, чтобы изучить технологии и ключевые показатели. Каждый цвет — свой домен."
                color={C.accent2}
              >
                <div className="rounded-2xl p-3 sm:p-5 mb-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <svg viewBox="0 0 700 500" className="w-full h-auto">
                    <rect x="0" y="0" width="700" height="500" rx="18" fill="#00101c" />
                    {Array.from({ length: 14 }).map((_, i) => (
                      <line key={'v' + i} x1={i * 50} y1="0" x2={i * 50} y2="500" stroke="#ffffff" strokeOpacity="0.03" />
                    ))}
                    {Array.from({ length: 10 }).map((_, i) => (
                      <line key={'h' + i} x1="0" y1={i * 50} x2="700" y2={i * 50} stroke="#ffffff" strokeOpacity="0.03" />
                    ))}
                    {ZONES.map((z) => {
                      const activeZone = selectedZone.id === z.id;
                      return (
                        <g key={z.id} className="cursor-pointer" onClick={() => setSelectedZone(z)}>
                          <motion.polygon
                            points={z.poly}
                            fill={z.color}
                            initial={{ fillOpacity: 0.12 }}
                            animate={{ fillOpacity: activeZone ? 0.4 : 0.12 }}
                            whileHover={{ fillOpacity: 0.3 }}
                            stroke={z.color}
                            strokeWidth={activeZone ? 3 : 1.5}
                            strokeOpacity={activeZone ? 1 : 0.5}
                            style={{ filter: activeZone ? `drop-shadow(0 0 14px ${z.color})` : undefined }}
                          />
                          <foreignObject x={z.cx - 60} y={z.cy - 26} width="120" height="52">
                            <div className="flex flex-col items-center justify-center text-center h-full pointer-events-none">
                              <div style={{ color: z.color }}>{z.icon}</div>
                              <div className="text-[10px] leading-tight mt-1 font-semibold text-white/85">{z.name}</div>
                            </div>
                          </foreignObject>
                        </g>
                      );
                    })}
                  </svg>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {ZONES.map((z) => (
                      <button
                        key={z.id}
                        onClick={() => setSelectedZone(z)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all cursor-pointer"
                        style={{
                          background: selectedZone.id === z.id ? z.color + '22' : 'transparent',
                          borderColor: selectedZone.id === z.id ? z.color : 'rgba(255,255,255,0.1)',
                          color: selectedZone.id === z.id ? z.color : 'rgba(255,255,255,0.55)',
                        }}
                      >
                        <span className="w-2 h-2 rounded-full" style={{ background: z.color }} /> {z.name}
                      </button>
                    ))}
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedZone.id}
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.35 }}
                    className="rounded-2xl p-5"
                    style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${selectedZone.color}44`, boxShadow: `0 0 40px ${selectedZone.color}18` }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: selectedZone.color + '22', color: selectedZone.color }}>
                        {selectedZone.icon}
                      </div>
                      <h3 className="text-xl font-bold text-white">{selectedZone.name}</h3>
                    </div>
                    <p className="text-sm text-white/60 leading-relaxed">{selectedZone.desc}</p>

                    <div className="mt-5">
                      <div className="text-[11px] uppercase tracking-wide text-white/40 mb-2">Ключевые технологии</div>
                      <div className="flex flex-wrap gap-2">
                        {selectedZone.tech.map((t) => (
                          <span key={t} className="px-2.5 py-1 rounded-lg text-xs font-medium"
                            style={{ background: selectedZone.color + '18', color: selectedZone.color }}>{t}</span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-3 gap-2">
                      {selectedZone.kpi.map((k) => (
                        <div key={k.label} className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
                          <div className="text-sm font-bold" style={{ color: selectedZone.color }}>{k.value}</div>
                          <div className="text-[10px] text-white/45 mt-0.5 leading-tight">{k.label}</div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </ChapterCard>
            </section>

            {/* ══ CHAPTER 4 — ECO PHASES / WATER BALANCE ═════════════════ */}
            <section ref={setSectionRef(3)} data-chapter={3} id="phases" className="scroll-mt-8">
              <ChapterCard
                eyebrow="Фазы восстановления"
                title="Пять фаз возрождения экосистемы"
                subtitle="Выберите фазу — диаграмма оживает: голая земля → вода → растения → фауна → город."
                color={C.agriculture}
              >
                <div className="flex flex-wrap gap-2 mb-5">
                  {ECO_PHASES.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setEcoPhase(p)}
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl text-sm font-semibold border transition-all cursor-pointer"
                      style={{
                        background: ecoPhase.id === p.id ? p.color + '22' : 'transparent',
                        borderColor: ecoPhase.id === p.id ? p.color : 'rgba(255,255,255,0.12)',
                        color: ecoPhase.id === p.id ? p.color : 'rgba(255,255,255,0.6)',
                      }}
                    >
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold"
                        style={{ background: p.color + '33', color: p.color }}>{p.id}</span>
                      {p.title}
                    </button>
                  ))}
                </div>

                <div className="rounded-2xl p-5 mb-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <EcoDiagram render={ecoPhase.render} color={ecoPhase.color} />
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={ecoPhase.id}
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.35 }}
                    className="rounded-2xl p-5"
                    style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${ecoPhase.color}44` }}
                  >
                    <div className="text-xs uppercase tracking-wide" style={{ color: ecoPhase.color }}>Фаза {ecoPhase.id}</div>
                    <h3 className="text-2xl font-bold text-white mt-1">{ecoPhase.title}</h3>
                    <p className="text-sm text-white/60 mt-3 leading-relaxed">{ecoPhase.goal}</p>
                    <div className="mt-5 grid grid-cols-3 gap-2">
                      {ecoPhase.metrics.map((m) => (
                        <div key={m.label} className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
                          <div className="text-sm font-bold" style={{ color: ecoPhase.color }}>{m.value}</div>
                          <div className="text-[10px] text-white/45 mt-0.5">{m.label}</div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Resource flow — closed water/energy economy */}
                <div className="rounded-2xl p-3 sm:p-5 mt-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="text-[11px] uppercase tracking-wide text-white/40 mb-3">Замкнутая экономика воды и энергии</div>
                  <svg viewBox="0 0 720 340" className="w-full h-auto">
                    {FLOW_SOURCES.map((s) =>
                      FLOW_CONS.map((cns, j) => (
                        <motion.path
                          key={s.id + cns.id}
                          d={`M${s.x + 46},${s.y} C170,${s.y} 220,${cns.y} ${cns.x - 46},${cns.y}`}
                          fill="none" stroke={s.color} strokeOpacity="0.22" strokeWidth="6"
                          strokeDasharray="4 10"
                          animate={reduced ? undefined : { strokeDashoffset: [0, -140] }}
                          transition={{ duration: 3 + j * 0.4, repeat: Infinity, ease: 'linear' }}
                        />
                      ))
                    )}
                    {FLOW_CONS.map((cns) =>
                      FLOW_RETURN.map((r, j) => (
                        <motion.path
                          key={cns.id + r.id}
                          d={`M${cns.x + 46},${cns.y} C470,${cns.y} 520,${r.y} ${r.x - 46},${r.y}`}
                          fill="none" stroke={r.color} strokeOpacity="0.2" strokeWidth="5"
                          strokeDasharray="4 10"
                          animate={reduced ? undefined : { strokeDashoffset: [0, -140] }}
                          transition={{ duration: 3.4 + j * 0.4, repeat: Infinity, ease: 'linear' }}
                        />
                      ))
                    )}
                    {[...FLOW_SOURCES, ...FLOW_CONS, ...FLOW_RETURN].map((n) => (
                      <g key={n.id}>
                        <rect x={n.x - 46} y={n.y - 22} width="92" height="44" rx="12"
                          fill={n.color} fillOpacity="0.16" stroke={n.color} strokeOpacity="0.7" />
                        <text x={n.x} y={n.y + 4} textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="600">{n.label}</text>
                      </g>
                    ))}
                    <text x={FLOW_SOURCES[0].x} y="28" textAnchor="middle" fill={C.water} fontSize="11" fontWeight="700">ИСТОЧНИКИ</text>
                    <text x={FLOW_CONS[0].x} y="28" textAnchor="middle" fill={C.nature} fontSize="11" fontWeight="700">ПОТРЕБИТЕЛИ</text>
                    <text x={FLOW_RETURN[0].x} y="70" textAnchor="middle" fill={C.accent2} fontSize="11" fontWeight="700">ВОЗВРАТ</text>
                  </svg>
                </div>
              </ChapterCard>
            </section>

            {/* ══ CHAPTER 5 — ECONOMY / SELF-SUFFICIENCY / R&D / KPI ══════ */}
            <section ref={setSectionRef(4)} data-chapter={4} id="economy" className="scroll-mt-8">
              <ChapterCard
                eyebrow="Экономика и самодостаточность"
                title="Единое экономическое пространство"
                subtitle="Автоматизация, наука и инженерия делают эко-район самодостаточным. Ключевые метрики при полном развёртывании."
                color={C.accent}
              >
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {KPIS.map((k, i) => (
                    <motion.div
                      key={k.label}
                      initial={reduced ? false : { opacity: 0, y: 16 }}
                      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
                      viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                      className="rounded-2xl p-4 relative overflow-hidden"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full" style={{ background: k.color + '18', filter: 'blur(8px)' }} />
                      <div className="relative">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: k.color + '22', color: k.color }}>
                          {k.icon}
                        </div>
                        <div className="text-xl sm:text-2xl font-black" style={{ color: k.color }}>
                          <Counter to={k.to} suffix={k.suffix} decimals={k.decimals ?? 0} />
                        </div>
                        <div className="text-xs text-white/50 mt-1">{k.label}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Replicability — one project, thousands of cities */}
                <div className="text-[11px] uppercase tracking-wide text-white/40 mb-3">Тиражируемость модели</div>
                <div className="grid sm:grid-cols-2 gap-3 mb-6">
                  {REPLICA.map((r, i) => (
                    <motion.div
                      key={r.region}
                      initial={reduced ? false : { opacity: 0, y: 16 }}
                      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
                      viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                      className="rounded-2xl p-4 transition-all hover:bg-white/[0.05]"
                      style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${r.color}33` }}
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: r.color + '22', color: r.color }}>
                        {r.icon}
                      </div>
                      <div className="font-bold text-white">{r.region}</div>
                      <p className="text-xs text-white/55 mt-1.5 leading-relaxed">{r.desc}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setLocation('/lab')}
                    className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-semibold text-[#001018] transition-all hover:opacity-90 cursor-pointer"
                    style={{ background: `linear-gradient(120deg, ${C.minerals}, ${C.accent2})`, boxShadow: `0 8px 30px ${C.minerals}44` }}
                  >
                    <Rocket size={18} /> Спроектировать мегапроект
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </button>
                  <button
                    onClick={() => setLocation('/genesis')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-semibold text-white/85 border border-white/15 hover:bg-white/5 hover:text-white transition-all cursor-pointer"
                  >
                    <Layers size={18} /> Генезис экосистемы
                  </button>
                </div>
              </ChapterCard>
            </section>

            {/* ══ CHAPTER 6 — FINAL / ROADMAP SEAM (Block 4) ═════════════ */}
            <section ref={setSectionRef(5)} data-chapter={5} id="roadmap" className="scroll-mt-8">
              <ChapterCard
                eyebrow="Дорожная карта"
                title="Путь 2025 → 2040"
                subtitle="Поэтапное развёртывание: от мониторинга к тиражируемой модели."
                color={C.climate}
              >
                <div className="space-y-3 mb-7">
                  {ROADMAP.map((r, i) => (
                    <motion.div
                      key={r.year}
                      initial={reduced ? false : { opacity: 0, x: 20 }}
                      whileInView={reduced ? undefined : { opacity: 1, x: 0 }}
                      viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                      className="rounded-2xl p-4 flex gap-4"
                      style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${r.color}33` }}
                    >
                      <div className="flex flex-col items-center pt-1">
                        <div className="w-4 h-4 rounded-full" style={{ background: r.color, boxShadow: `0 0 12px ${r.color}` }} />
                        <div className="text-lg font-black mt-2" style={{ color: r.color }}>{r.year}</div>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-white">{r.title}</div>
                        <ul className="mt-2 space-y-1.5">
                          {r.items.map((it) => (
                            <li key={it} className="flex items-start gap-1.5 text-xs text-white/55">
                              <ChevronRight size={12} style={{ color: r.color }} className="mt-0.5 flex-shrink-0" /> {it}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div
                  className="relative rounded-2xl p-6 overflow-hidden"
                  style={{ background: `linear-gradient(120deg, ${C.accent}14, ${C.accent2}10)`, border: `1px solid ${C.accent}33` }}
                >
                  <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full" style={{ background: C.accent + '22', filter: 'blur(50px)' }} />
                  <div className="relative">
                    <Waves size={26} style={{ color: C.accent }} />
                    <h3 className="text-xl sm:text-2xl font-black text-white mt-3 leading-tight">
                      Возрождение начинается с одного решения
                    </h3>
                    <p className="mt-2 text-white/65 text-sm">
                      Дорожная карта связывает пилот Арала с полной экосистемой ArkheOS.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                      {/* Block 4 seam: scroll to the program-choice / dual-program split. */}
                      <a
                        href="#program"
                        className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-semibold text-[#001018] transition-all hover:opacity-90 cursor-pointer"
                        style={{ background: `linear-gradient(120deg, ${C.accent}, ${C.accent2})`, boxShadow: `0 8px 30px ${C.accent}44` }}
                      >
                        <Gauge size={18} /> Выбрать программу
                        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                      </a>
                      <button
                        onClick={() => setLocation('/dao')}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-semibold text-white/85 border border-white/15 hover:bg-white/5 hover:text-white transition-all cursor-pointer"
                      >
                        <Users size={18} /> Голосование DAO
                      </button>
                    </div>
                  </div>
                </div>
              </ChapterCard>
            </section>

            {/* ══ CHAPTER 7 — BLOCK 4: PROGRAM CHOICE → PARALLEL SPLIT ═══ */}
            <section ref={setSectionRef(6)} data-chapter={6} id="program" className="scroll-mt-8">
              <DualProgramStage onOpenCampaign={() => document.getElementById('karakalpak')?.scrollIntoView({ behavior: 'smooth' })} />
            </section>

            {/* ══ CHAPTER 8 — BLOCK 5: KARAKALPAK CAMPAIGN DEEP-DIVE ═════ */}
            <section ref={setSectionRef(7)} data-chapter={7} id="karakalpak" className="scroll-mt-8">
              <KarakalpakCampaign onOpenCampaigns={() => document.getElementById('campaigns')?.scrollIntoView({ behavior: 'smooth' })} />
            </section>

            {/* ══ CHAPTER 9 — BLOCK 6: OTHER CAMPAIGNS OVERVIEW ═════════ */}
            <section ref={setSectionRef(8)} data-chapter={8} id="campaigns" className="scroll-mt-8">
              <CampaignsOverview />
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
