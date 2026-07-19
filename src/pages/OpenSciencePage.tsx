import { useState, useMemo, useRef } from 'react';
import { useLocation } from 'wouter';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, Database, Download, Building2, Quote, Search, X,
  Droplets, Satellite, Layers, ThermometerSun, TrendingUp,
  FileText, Compass, BookOpen, GitFork, Eye, ShieldCheck, Hash,
} from 'lucide-react';

// ══════════════════════════════════════════════════════════════════════════════
//  ArkheOSium — Open Science (G-OS): open data & research commons
//  Route: /open-science
// ══════════════════════════════════════════════════════════════════════════════

const ACCENT = '#00e6c8';
const ACCENT2 = '#00d4ff';
const VIOLET = '#8b7cff'; // scholarly indigo/violet secondary

// ─── i18n (self-contained, bilingual) ───────────────────────────────────────────

const STRINGS = {
  ru: {
    back: 'Назад к дорожной карте',
    doc_label: 'Открытая наука (G-OS)',
    eyebrow: 'Открытые данные и исследования',
    hero_title: 'Открытая наука',
    hero_accent: 'Общий фонд данных и воспроизводимых моделей',
    hero_lead:
      'Публичные наборы данных, воспроизводимые модели, открытое рецензирование, цитирование и DOI для мегапроекта. Фильтруйте каталог — статистика пересчитывается вживую.',
    kpi_datasets: 'Открытых наборов',
    kpi_downloads: 'Загрузок',
    kpi_institutions: 'Организаций-участников',
    kpi_citations: 'Цитирований',
    explorer_eyebrow: 'Каталог данных',
    explorer_title: 'Обозреватель наборов данных',
    explorer_sub:
      'Ищите и фильтруйте по домену. Чипы мгновенно фильтруют список и пересчитывают агрегаты: наборы, объём (ГБ), загрузки, цитирования.',
    search_ph: 'Поиск по названию, автору, DOI…',
    filter_all: 'Все домены',
    agg_datasets: 'Наборов',
    agg_size: 'Объём, ГБ',
    agg_downloads: 'Загрузок',
    agg_citations: 'Цитирований',
    col_downloads: 'загрузок',
    col_citations: 'цит.',
    open_access: 'Открытый доступ',
    empty: 'Ничего не найдено. Сбросьте фильтры.',
    reset: 'Сбросить',
    dom_hydrology: 'Гидрология',
    dom_remote: 'Дист. зондирование',
    dom_soil: 'Почвы',
    dom_climate: 'Климат',
    principles_eyebrow: 'Принципы',
    principles_title: 'Как устроена открытость',
    principles_sub: 'Три опоры научного commons мегапроекта.',
    fair_t: 'FAIR-данные',
    fair_d: 'Findable, Accessible, Interoperable, Reusable. Каждый набор имеет DOI, метаданные и машиночитаемую схему.',
    repro_t: 'Воспроизводимость',
    repro_d: 'Модели публикуются как контейнеры с зафиксированными зависимостями. Любой запуск даёт тот же результат.',
    peer_t: 'Открытое рецензирование',
    peer_d: 'Рецензии публичны и подписаны. История правок и обсуждение видны всем участникам.',
    trends_eyebrow: 'Динамика',
    trends_title: 'Рост commons',
    trends_sub: 'Накопленное число наборов данных и цитирований по годам. Кривые — совокупный прогресс 2026 → 2033.',
    chart_datasets_title: 'Накопленные наборы',
    chart_citations_title: 'Накопленные цитирования',
    years_note: 'Годы: 2026 → 2033',
    cta_title: 'Открытая наука — фундамент планетарной инфраструктуры',
    cta_sub: 'Как научный commons встраивается в дорожную карту и архитектуру платформы ArkheOSium.',
    cta_roadmap: 'Дорожная карта',
    cta_wp: 'Полный whitepaper',
    copyright: '© ArkheOSium — Planetary Infrastructure OS. Данные демонстрационные.',
  },
  en: {
    back: 'Back to roadmap',
    doc_label: 'Open Science (G-OS)',
    eyebrow: 'Open data & research',
    hero_title: 'Open Science',
    hero_accent: 'A commons of data & reproducible models',
    hero_lead:
      'Public datasets, reproducible models, open peer review, citations and DOIs for the megaproject. Filter the catalog — the statistics recompute live.',
    kpi_datasets: 'Open datasets',
    kpi_downloads: 'Downloads',
    kpi_institutions: 'Contributing institutions',
    kpi_citations: 'Citations',
    explorer_eyebrow: 'Data catalog',
    explorer_title: 'Dataset explorer',
    explorer_sub:
      'Search and filter by domain. Chips instantly filter the list and recompute the aggregates: datasets, volume (GB), downloads, citations.',
    search_ph: 'Search by title, author, DOI…',
    filter_all: 'All domains',
    agg_datasets: 'Datasets',
    agg_size: 'Volume, GB',
    agg_downloads: 'Downloads',
    agg_citations: 'Citations',
    col_downloads: 'downloads',
    col_citations: 'cit.',
    open_access: 'Open access',
    empty: 'Nothing found. Reset the filters.',
    reset: 'Reset',
    dom_hydrology: 'Hydrology',
    dom_remote: 'Remote sensing',
    dom_soil: 'Soil',
    dom_climate: 'Climate',
    principles_eyebrow: 'Principles',
    principles_title: 'How openness is built',
    principles_sub: 'Three pillars of the megaproject science commons.',
    fair_t: 'FAIR data',
    fair_d: 'Findable, Accessible, Interoperable, Reusable. Every dataset carries a DOI, metadata and a machine-readable schema.',
    repro_t: 'Reproducibility',
    repro_d: 'Models ship as containers with pinned dependencies. Any run yields the same result, byte for byte.',
    peer_t: 'Open peer review',
    peer_d: 'Reviews are public and signed. Revision history and discussion are visible to every participant.',
    trends_eyebrow: 'Dynamics',
    trends_title: 'Commons growth',
    trends_sub: 'Cumulative datasets and citations by year. Curves show aggregate progress 2026 → 2033.',
    chart_datasets_title: 'Cumulative datasets',
    chart_citations_title: 'Cumulative citations',
    years_note: 'Years: 2026 → 2033',
    cta_title: 'Open science is the bedrock of planetary infrastructure',
    cta_sub: 'How the science commons fits into the roadmap and the ArkheOSium platform architecture.',
    cta_roadmap: 'Roadmap',
    cta_wp: 'Full whitepaper',
    copyright: '© ArkheOSium — Planetary Infrastructure OS. Data is illustrative.',
  },
} as const;

// ─── Types ───────────────────────────────────────────────────────────────────────

type DomainKey = 'hydrology' | 'remote' | 'soil' | 'climate';

interface Dataset {
  id: string;
  title_ru: string;
  title_en: string;
  author: string;
  doi: string;
  domain: DomainKey;
  sizeGb: number;
  downloads: number;
  citations: number;
  year: number;
}

interface DomainMeta {
  key: DomainKey;
  Icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  color: string;
  label: keyof typeof STRINGS.ru;
}

interface Principle {
  key: string;
  Icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  color: string;
  title: keyof typeof STRINGS.ru;
  desc: keyof typeof STRINGS.ru;
}

// ─── Domains ─────────────────────────────────────────────────────────────────────

const DOMAINS: DomainMeta[] = [
  { key: 'hydrology', Icon: Droplets, color: ACCENT, label: 'dom_hydrology' },
  { key: 'remote', Icon: Satellite, color: ACCENT2, label: 'dom_remote' },
  { key: 'soil', Icon: Layers, color: '#fbbf24', label: 'dom_soil' },
  { key: 'climate', Icon: ThermometerSun, color: VIOLET, label: 'dom_climate' },
];

const DOMAIN_MAP: Record<DomainKey, DomainMeta> = DOMAINS.reduce(
  (acc, d) => ({ ...acc, [d.key]: d }),
  {} as Record<DomainKey, DomainMeta>,
);

// ─── Mock datasets ──────────────────────────────────────────────────────────────

const DATASETS: Dataset[] = [
  {
    id: 'ds-001', title_ru: 'Уровень грунтовых вод дельты Амударьи', title_en: 'Amu Darya delta groundwater levels',
    author: 'A. Nazarov', doi: '10.5281/arkhe.1042', domain: 'hydrology', sizeGb: 12.4, downloads: 8420, citations: 61, year: 2026,
  },
  {
    id: 'ds-002', title_ru: 'Спутниковый индекс NDVI Аралкум 2020–2026', title_en: 'Aralkum NDVI index 2020–2026',
    author: 'L. Chen', doi: '10.5281/arkhe.1077', domain: 'remote', sizeGb: 48.9, downloads: 15230, citations: 142, year: 2026,
  },
  {
    id: 'ds-003', title_ru: 'Засолённость почв обнажённого дна', title_en: 'Soil salinity of the exposed seabed',
    author: 'M. Yusupova', doi: '10.5281/arkhe.1103', domain: 'soil', sizeGb: 6.1, downloads: 4310, citations: 38, year: 2027,
  },
  {
    id: 'ds-004', title_ru: 'Реанализ температуры приземного слоя', title_en: 'Surface-layer temperature reanalysis',
    author: 'R. Okafor', doi: '10.5281/arkhe.1158', domain: 'climate', sizeGb: 91.2, downloads: 20140, citations: 210, year: 2027,
  },
  {
    id: 'ds-005', title_ru: 'Речной сток Сырдарьи: суточные ряды', title_en: 'Syr Darya river discharge: daily series',
    author: 'A. Nazarov', doi: '10.5281/arkhe.1190', domain: 'hydrology', sizeGb: 3.8, downloads: 6720, citations: 55, year: 2027,
  },
  {
    id: 'ds-006', title_ru: 'Гиперспектральные снимки пылевых очагов', title_en: 'Hyperspectral imagery of dust hotspots',
    author: 'K. Ivanov', doi: '10.5281/arkhe.1224', domain: 'remote', sizeGb: 130.5, downloads: 9180, citations: 74, year: 2028,
  },
  {
    id: 'ds-007', title_ru: 'Профили влажности и органики почв', title_en: 'Soil moisture & organic-carbon profiles',
    author: 'M. Yusupova', doi: '10.5281/arkhe.1261', domain: 'soil', sizeGb: 9.7, downloads: 5040, citations: 47, year: 2028,
  },
  {
    id: 'ds-008', title_ru: 'Ансамбль климатических проекций до 2050', title_en: 'Climate projection ensemble to 2050',
    author: 'R. Okafor', doi: '10.5281/arkhe.1299', domain: 'climate', sizeGb: 210.0, downloads: 27890, citations: 305, year: 2028,
  },
  {
    id: 'ds-009', title_ru: 'Батиметрия остаточных водоёмов', title_en: 'Bathymetry of residual water bodies',
    author: 'S. Petrova', doi: '10.5281/arkhe.1334', domain: 'hydrology', sizeGb: 22.3, downloads: 3910, citations: 29, year: 2029,
  },
  {
    id: 'ds-010', title_ru: 'Радарная интерферометрия просадки грунта', title_en: 'Radar interferometry of land subsidence',
    author: 'L. Chen', doi: '10.5281/arkhe.1371', domain: 'remote', sizeGb: 74.6, downloads: 11260, citations: 96, year: 2029,
  },
  {
    id: 'ds-011', title_ru: 'Микробиом ризосферы саксаула', title_en: 'Saxaul rhizosphere microbiome',
    author: 'D. Karimov', doi: '10.5281/arkhe.1408', domain: 'soil', sizeGb: 15.2, downloads: 2870, citations: 33, year: 2029,
  },
  {
    id: 'ds-012', title_ru: 'Индексы пыльных бурь и ветрового режима', title_en: 'Dust-storm & wind-regime indices',
    author: 'R. Okafor', doi: '10.5281/arkhe.1445', domain: 'climate', sizeGb: 5.4, downloads: 8630, citations: 68, year: 2030,
  },
];

// ─── Principles ──────────────────────────────────────────────────────────────────

const PRINCIPLES: Principle[] = [
  { key: 'fair', Icon: ShieldCheck, color: ACCENT, title: 'fair_t', desc: 'fair_d' },
  { key: 'repro', Icon: GitFork, color: ACCENT2, title: 'repro_t', desc: 'repro_d' },
  { key: 'peer', Icon: Eye, color: VIOLET, title: 'peer_t', desc: 'peer_d' },
];

// ─── Reusable animated section ──────────────────────────────────────────────────

function Section({
  id, eyebrow, title, subtitle, children,
}: {
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

// ─── KPI tile ───────────────────────────────────────────────────────────────────

function KpiTile({
  Icon, val, label, color, trend,
}: {
  Icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  val: string; label: string; color: string; trend?: 'up' | 'down';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.4 }}
      className="bg-[#000d24]/70 backdrop-blur-sm border border-white/10 rounded-2xl p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: color + '18', color }}>
          <Icon size={17} />
        </div>
        {trend === 'up' && <TrendingUp size={15} style={{ color: ACCENT }} />}
      </div>
      <div className="text-2xl font-black font-mono" style={{ color }}>{val}</div>
      <div className="text-[11px] text-gray-500 mt-1 leading-tight">{label}</div>
    </motion.div>
  );
}

// ─── Trend chart (SVG area) ─────────────────────────────────────────────────────

function TrendChart({
  points, color, title, unit, reduce,
}: {
  points: number[]; color: string; title: string; unit: string; reduce: boolean;
}) {
  const W = 480;
  const H = 160;
  const PAD = 8;
  const max = Math.max(...points, 1) * 1.08;
  const step = (W - PAD * 2) / (points.length - 1);
  const coords = points.map((p, i) => {
    const x = PAD + i * step;
    const y = PAD + (1 - p / max) * (H - PAD * 2);
    return [x, y] as const;
  });
  const line = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${line} L${coords[coords.length - 1][0].toFixed(1)},${H - PAD} L${coords[0][0].toFixed(1)},${H - PAD} Z`;
  const last = points[points.length - 1];
  const gid = `grad-os-${title.replace(/\s+/g, '')}`;

  return (
    <div className="bg-[#000d24]/70 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-white">{title}</span>
        <span className="text-lg font-black font-mono" style={{ color }}>{Math.round(last).toLocaleString('ru-RU')}{unit}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="none">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((g) => (
          <line key={g} x1={PAD} x2={W - PAD} y1={PAD + g * (H - PAD * 2)} y2={PAD + g * (H - PAD * 2)}
            stroke="#ffffff" strokeOpacity="0.05" strokeWidth="1" />
        ))}
        <motion.path
          d={area}
          fill={`url(#${gid})`}
          initial={false}
          animate={{ d: area }}
          transition={reduce ? { duration: 0 } : { duration: 0.5, ease: 'easeOut' }}
        />
        <motion.path
          d={line}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={{ d: line }}
          transition={reduce ? { duration: 0 } : { duration: 0.5, ease: 'easeOut' }}
        />
        <circle cx={coords[coords.length - 1][0]} cy={coords[coords.length - 1][1]} r="4" fill={color} />
      </svg>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════

export default function OpenSciencePage() {
  const [, navigate] = useLocation();
  const { i18n } = useTranslation();
  const reduce = useReducedMotion() ?? false;
  const lang = (i18n.language || 'ru').slice(0, 2);
  const s = (STRINGS as Record<string, typeof STRINGS.ru>)[lang] ?? STRINGS.ru;
  const isEn = lang === 'en';

  const [query, setQuery] = useState('');
  const [domainFilter, setDomainFilter] = useState<DomainKey | null>(null);

  // ── Live-filtered dataset list (interactive centerpiece) ──
  const filtered = useMemo<Dataset[]>(() => {
    const q = query.trim().toLowerCase();
    return DATASETS.filter((d) => {
      if (domainFilter && d.domain !== domainFilter) return false;
      if (!q) return true;
      const hay = `${d.title_ru} ${d.title_en} ${d.author} ${d.doi}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query, domainFilter]);

  // ── Aggregate stats recomputed from the filtered slice ──
  const agg = useMemo(() => {
    return filtered.reduce(
      (acc, d) => {
        acc.count += 1;
        acc.size += d.sizeGb;
        acc.downloads += d.downloads;
        acc.citations += d.citations;
        return acc;
      },
      { count: 0, size: 0, downloads: 0, citations: 0 },
    );
  }, [filtered]);

  // ── Hero KPIs (full commons totals) ──
  const totals = useMemo(() => {
    const downloads = DATASETS.reduce((a, d) => a + d.downloads, 0);
    const citations = DATASETS.reduce((a, d) => a + d.citations, 0);
    const institutions = new Set(DATASETS.map((d) => d.author)).size + 9; // authors + partner orgs
    return { datasets: DATASETS.length, downloads, citations, institutions };
  }, []);

  // ── Cumulative trend series 2026→2033 (8 steps) ──
  const YEARS = 8;
  const datasetSeries = useMemo(
    () => Array.from({ length: YEARS }, (_, i) => Math.round(4 + Math.pow(i / (YEARS - 1), 1.4) * 168)),
    [],
  );
  const citationSeries = useMemo(
    () => Array.from({ length: YEARS }, (_, i) => Math.round(20 + Math.pow(i / (YEARS - 1), 1.7) * 3180)),
    [],
  );

  const hasFilter = query.trim() !== '' || domainFilter !== null;

  return (
    <div className="min-h-screen text-gray-200">

      {/* ── Top bar ── */}
      <div className="sticky top-0 z-40 bg-[#000818]/95 backdrop-blur border-b border-white/5 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate('/roadmap')}
          className="flex items-center gap-2 text-sm text-[#00e6c8]/70 hover:text-[#00e6c8] transition-colors flex-shrink-0"
        >
          <ArrowLeft size={16} /> {s.back}
        </button>
        <div className="flex items-center gap-2 text-sm text-gray-400 flex-shrink-0">
          <BookOpen size={14} />
          <span className="hidden sm:inline">{s.doc_label}</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => navigate('/whitepaper-full')}
            className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border border-[#00e6c8]/30 text-[#00e6c8] hover:bg-[#00e6c8]/10 transition-colors"
          >
            <FileText size={12} /> {s.cta_wp}
          </button>
        </div>
      </div>

      {/* ══ HERO ══ */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#12082e]/40 via-[#00153a]/25 to-transparent" />
          {!reduce && (
            <>
              <motion.div
                className="absolute -top-20 right-0 w-[560px] h-[340px] rounded-full bg-[#8b7cff]/10 blur-3xl"
                animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
                transition={{ duration: 13, repeat: Infinity }}
              />
              <motion.div
                className="absolute bottom-0 left-1/4 w-[440px] h-[220px] rounded-full bg-[#00e6c8]/8 blur-3xl"
                animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
                transition={{ duration: 15, repeat: Infinity }}
              />
            </>
          )}
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 text-xs text-[#8b7cff] bg-[#8b7cff]/10 border border-[#8b7cff]/20 rounded-full px-3 py-1 mb-6 w-fit">
              <BookOpen size={11} /> {s.eyebrow}
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white mb-5 tracking-tight leading-[0.98]">
              {s.hero_title}
              <br />
              <span className="bg-gradient-to-r from-[#8b7cff] via-[#00e6c8] to-[#00d4ff] bg-clip-text text-transparent text-2xl md:text-4xl">
                {s.hero_accent}
              </span>
            </h1>

            <p className="text-gray-400 text-base md:text-lg mb-8 max-w-2xl leading-relaxed">
              {s.hero_lead}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl">
              <KpiTile Icon={Database} val={String(totals.datasets)} label={s.kpi_datasets} color={ACCENT} trend="up" />
              <KpiTile Icon={Download} val={totals.downloads.toLocaleString('ru-RU')} label={s.kpi_downloads} color={ACCENT2} trend="up" />
              <KpiTile Icon={Building2} val={String(totals.institutions)} label={s.kpi_institutions} color={VIOLET} trend="up" />
              <KpiTile Icon={Quote} val={totals.citations.toLocaleString('ru-RU')} label={s.kpi_citations} color="#fbbf24" trend="up" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ DATASET EXPLORER (centerpiece) ══ */}
      <Section id="explorer" eyebrow={s.explorer_eyebrow} title={s.explorer_title} subtitle={s.explorer_sub}>
        <div className="bg-[#000d24]/70 backdrop-blur-sm border border-white/10 rounded-2xl p-4 md:p-6">

          {/* Search */}
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={s.search_ph}
              aria-label={s.search_ph}
              className="w-full bg-[#000818] border border-white/10 rounded-xl pl-9 pr-9 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#00e6c8]/50 transition-colors"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                aria-label={s.reset}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Filter chips */}
          <div className="flex flex-wrap gap-2 mb-5">
            <button
              onClick={() => setDomainFilter(null)}
              className="text-xs px-3 py-1.5 rounded-full border transition-all"
              style={{
                borderColor: domainFilter === null ? ACCENT + '80' : 'rgba(255,255,255,0.1)',
                background: domainFilter === null ? ACCENT + '18' : 'transparent',
                color: domainFilter === null ? ACCENT : '#9ca3af',
              }}
            >
              {s.filter_all}
            </button>
            {DOMAINS.map((d) => {
              const on = domainFilter === d.key;
              return (
                <button
                  key={d.key}
                  onClick={() => setDomainFilter(on ? null : d.key)}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all"
                  style={{
                    borderColor: on ? d.color + '80' : 'rgba(255,255,255,0.1)',
                    background: on ? d.color + '18' : 'transparent',
                    color: on ? d.color : '#9ca3af',
                  }}
                >
                  <d.Icon size={12} style={{ color: d.color }} />
                  {s[d.label]}
                </button>
              );
            })}
          </div>

          {/* Aggregate stats (recompute live) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
            {[
              { v: String(agg.count), l: s.agg_datasets, c: ACCENT },
              { v: agg.size.toFixed(1), l: s.agg_size, c: ACCENT2 },
              { v: agg.downloads.toLocaleString('ru-RU'), l: s.agg_downloads, c: VIOLET },
              { v: agg.citations.toLocaleString('ru-RU'), l: s.agg_citations, c: '#fbbf24' },
            ].map((a) => (
              <div key={a.l} className="bg-white/5 border border-white/5 rounded-xl px-3 py-2.5">
                <div className="text-lg font-black font-mono leading-none" style={{ color: a.c }}>{a.v}</div>
                <div className="text-[10px] text-gray-500 mt-1.5 uppercase tracking-wider">{a.l}</div>
              </div>
            ))}
          </div>

          {/* Dataset list */}
          <div className="space-y-2">
            {filtered.length === 0 && (
              <div className="text-center py-10">
                <p className="text-sm text-gray-500 mb-3">{s.empty}</p>
                <button
                  onClick={() => { setQuery(''); setDomainFilter(null); }}
                  className="text-xs px-4 py-2 rounded-lg border border-[#00e6c8]/30 text-[#00e6c8] hover:bg-[#00e6c8]/10 transition-colors"
                >
                  {s.reset}
                </button>
              </div>
            )}
            {filtered.map((d, i) => {
              const dm = DOMAIN_MAP[d.domain];
              return (
                <motion.div
                  key={d.id}
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: reduce ? 0 : Math.min(i * 0.03, 0.2) }}
                  className="flex items-center gap-3 rounded-xl border border-white/5 bg-[#000818]/60 hover:border-white/15 transition-colors p-3"
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: dm.color + '18', color: dm.color }}
                  >
                    <dm.Icon size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-white truncate">{isEn ? d.title_en : d.title_ru}</div>
                    <div className="flex items-center gap-2 flex-wrap text-[11px] text-gray-500 mt-0.5">
                      <span>{d.author}</span>
                      <span className="text-gray-700">·</span>
                      <span className="flex items-center gap-1 font-mono" style={{ color: dm.color }}>
                        <Hash size={9} /> {d.doi}
                      </span>
                      <span className="text-gray-700">·</span>
                      <span
                        className="px-1.5 py-0.5 rounded text-[9px] font-medium"
                        style={{ background: dm.color + '14', color: dm.color }}
                      >
                        {s[dm.label]}
                      </span>
                      <span
                        className="hidden sm:inline px-1.5 py-0.5 rounded text-[9px] font-medium border border-[#00e6c8]/20 text-[#00e6c8]/80"
                      >
                        {s.open_access}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0 text-right">
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-gray-400">
                      <span className="font-mono text-gray-300">{d.sizeGb} GB</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-[10px] text-gray-500">
                      <span className="flex items-center gap-1"><Download size={9} />{d.downloads.toLocaleString('ru-RU')}</span>
                      <span className="flex items-center gap-1"><Quote size={9} />{d.citations}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {hasFilter && filtered.length > 0 && (
            <button
              onClick={() => { setQuery(''); setDomainFilter(null); }}
              className="mt-4 flex items-center gap-1.5 text-[11px] text-gray-500 hover:text-gray-300 transition-colors"
            >
              <X size={11} /> {s.reset}
            </button>
          )}
        </div>
      </Section>

      {/* ══ PRINCIPLES ══ */}
      <Section id="principles" eyebrow={s.principles_eyebrow} title={s.principles_title} subtitle={s.principles_sub}>
        <div className="grid md:grid-cols-3 gap-4">
          {PRINCIPLES.map((p, i) => (
            <motion.div
              key={p.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: reduce ? 0 : i * 0.1 }}
              className="rounded-2xl border p-5 backdrop-blur-sm"
              style={{ borderColor: p.color + '30', background: `linear-gradient(135deg, ${p.color}0d, transparent)` }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                style={{ background: p.color + '1f', color: p.color }}
              >
                <p.Icon size={20} />
              </div>
              <h3 className="text-white font-bold mb-2">{s[p.title]}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{s[p.desc]}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ══ TREND CHARTS ══ */}
      <Section id="trends" eyebrow={s.trends_eyebrow} title={s.trends_title} subtitle={s.trends_sub}>
        <div className="grid md:grid-cols-2 gap-4">
          <TrendChart points={datasetSeries} color={ACCENT} title={s.chart_datasets_title} unit="" reduce={reduce} />
          <TrendChart points={citationSeries} color={VIOLET} title={s.chart_citations_title} unit="" reduce={reduce} />
        </div>
        <div className="text-[11px] text-gray-600 mt-3 text-center">{s.years_note}</div>
      </Section>

      {/* ══ CTA ══ */}
      <section id="cta" className="scroll-mt-24 py-16 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-[#8b7cff]/20 p-8 text-center bg-gradient-to-b from-[#8b7cff]/5 to-transparent backdrop-blur-sm"
          >
            <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-5 bg-[#8b7cff]/10 text-[#8b7cff]">
              <BookOpen size={26} />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white mb-3">{s.cta_title}</h2>
            <p className="text-gray-400 text-sm md:text-base mb-7 max-w-xl mx-auto leading-relaxed">{s.cta_sub}</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => navigate('/roadmap')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00e6c8]/10 border border-[#00e6c8]/30 text-[#00e6c8] hover:bg-[#00e6c8]/20 transition-colors text-sm font-medium"
              >
                <Compass size={14} /> {s.cta_roadmap}
              </button>
              <button
                onClick={() => navigate('/whitepaper-full')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00d4ff]/10 border text-[#00d4ff] hover:bg-[#00d4ff]/20 transition-colors text-sm font-medium"
                style={{ borderColor: ACCENT2 + '4d' }}
              >
                <FileText size={14} /> {s.cta_wp}
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-8">{s.copyright}</p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
