// ═══════════════════════════════════════════════════════════════
//  Проект «Ширин» — VODPROM × UNICAP
//  Система водоснабжения, Сырдарьинская область, Узбекистан
// ═══════════════════════════════════════════════════════════════

import type { ProjectData } from './types';

export const shirinProject: ProjectData = {
  id: 'shirin',
  name: 'Ширин',
  subtitle: 'VODPROM × UNICAP — Система водоснабжения г. Самарканд',
  description:
    'Проект «Ширин» реализуется в соответствии с Постановлением Президента РУз ПП-233 о строительстве делового центра и жилого комплекса «Ширин» в г. Самарканд. Проект предусматривает создание современной системы очистки воды мощностью 150 000 м³/сут, обслуживающей три ключевые зоны: микрорайон Ширин (250 000 чел.), административный центр Самаркандской области (150 000 чел.) и комплекс «Имам аль-Бухари» (100 000 чел.). Реализуется совместно с UNICAP в формате ГЧП (ГП — АО «Узсувтаминот»).',
  decree: 'Постановление Президента РУз №ПП-233, 20 июля 2023 г.',
  status: 'Сбор данных / Подготовка ТЗ',
  investmentTotal: '$220M',
  tags: ['ГЧП', 'Водоснабжение', 'Самарканд', 'EPC', 'O&M', 'UNICAP'],

  // ─── Location ────────────────────────────────────────────────
  location: {
    city: 'Самарканд',
    region: 'Самаркандская область',
    country: 'Узбекистан',
    lat: 39.65,
    lng: 66.97,
  },

  // ─── Hero KPIs ───────────────────────────────────────────────
  heroKPIs: [
    { label: 'Мощность', value: '150 000', unit: 'м³/сут', color: '#00e6c8', icon: 'Droplets' },
    { label: 'Инвестиции', value: '$220M', unit: 'USD', color: '#60a5fa', icon: 'DollarSign' },
    { label: 'Окупаемость', value: '10', unit: 'лет', color: '#fbbf24', icon: 'Clock' },
    { label: 'Население', value: '500 000+', unit: 'чел.', color: '#4ade80', icon: 'Users' },
    { label: 'IRR', value: '~18%', unit: '', color: '#a78bfa', icon: 'TrendingUp' },
    { label: 'Маржа', value: '23.9%', unit: 'прибыль', color: '#fb923c', icon: 'BarChart2' },
  ],

  // ─── Tech Params ─────────────────────────────────────────────
  techParams: [
    { label: 'Мощность (полная)', value: '250 000 м³/сут', color: '#00e6c8' },
    { label: 'Мощность (Фаза 1)', value: '150 000 м³/сут', color: '#60a5fa' },
    { label: 'Мощность (Фаза 2)', value: '100 000 м³/сут', color: '#a78bfa' },
    { label: 'Протяжённость трубопровода', value: '19.4 км', color: '#fbbf24' },
    { label: 'Диаметр магистрали', value: '1000 / 800 мм', color: '#fb923c' },
    { label: 'Площадь обслуживания', value: '280 км²', color: '#4ade80' },
    { label: 'Подключений', value: '551 700', color: '#34d399' },
    { label: 'Норматив водоподачи', value: '280 л/чел·сут', color: '#22c55e' },
  ],

  // ─── Problem Stats ───────────────────────────────────────────
  problemStats: [
    { label: 'Охват водоснабжением', current: '62%', target: '98%', unit: '', color: '#ff4d6d', icon: 'Droplets' },
    { label: 'Суточный дефицит', current: '89 000 м³', target: '0 м³', unit: '', color: '#fb923c', icon: 'AlertTriangle' },
    { label: 'Потери в сетях', current: '45%', target: '12%', unit: '', color: '#fbbf24', icon: 'Activity' },
    { label: 'Жители без стабильного водоснабжения', current: '187 000 чел.', target: '0', unit: '', color: '#f87171', icon: 'Users' },
    { label: 'Возраст инфраструктуры', current: '60+ лет', target: 'Новая', unit: '', color: '#a78bfa', icon: 'Clock' },
  ],

  // ─── Financials ──────────────────────────────────────────────
  financials: {
    avgRevenue: '$22.4M',
    avgProfit: '$4.7M',
    margin: '23.9%',
    breakEven: '5 лет',
    payback: '10 лет',
    horizon: '25–30 лет',
    attractedPct: 80,
    equityPct: 20,
    attractedAmt: '~$176M',
    equityAmt: '~$44M',
    investmentBreakdown: [
      { label: 'EPC-работы (строительство и монтаж)', min: 157.5, max: 231, color: '#00e6c8', icon: 'Building2' },
      { label: 'Проектирование и инжиниринг', min: 42, max: 63, color: '#60a5fa', icon: 'FileText' },
      { label: 'Оборудование и технологии', min: 12.6, max: 18.9, color: '#a78bfa', icon: 'Zap' },
      { label: 'Прочие расходы (резерв, страхование)', min: 6.3, max: 9.5, color: '#fbbf24', icon: 'Shield' },
    ],
    yearlyProjections: [
      { year: 2030, capacity: '75%', revenue: 16.8, costs: 13.5, netProfit: 2.1, note: 'Запуск' },
      { year: 2031, capacity: '100%', revenue: 22.4, costs: 17.1, netProfit: 4.7, note: '' },
      { year: 2032, capacity: '100%', revenue: 22.9, costs: 17.4, netProfit: 4.8, note: '' },
      { year: 2033, capacity: '100%', revenue: 23.4, costs: 17.8, netProfit: 4.9, note: '' },
      { year: 2034, capacity: '100%', revenue: 23.9, costs: 18.1, netProfit: 5.1, note: '' },
      { year: 2035, capacity: '100%', revenue: 24.4, costs: 18.5, netProfit: 5.2, note: '' },
      { year: 2036, capacity: '100%', revenue: 24.9, costs: 18.9, netProfit: 5.4, note: '' },
      { year: 2037, capacity: '100%', revenue: 25.4, costs: 19.2, netProfit: 5.5, note: '' },
      { year: 2038, capacity: '100%', revenue: 26.0, costs: 19.6, netProfit: 5.7, note: '' },
      { year: 2039, capacity: '100%', revenue: 26.5, costs: 20.0, netProfit: 5.8, note: '' },
      { year: 2040, capacity: '100%', revenue: 27.1, costs: 20.4, netProfit: 6.0, note: '' },
      { year: 2041, capacity: '100%', revenue: 27.7, costs: 20.8, netProfit: 6.2, note: '' },
      { year: 2042, capacity: '100%', revenue: 28.3, costs: 21.2, netProfit: 6.4, note: '' },
      { year: 2043, capacity: '100%', revenue: 28.9, costs: 21.7, netProfit: 6.6, note: '' },
      { year: 2044, capacity: '100%', revenue: 29.5, costs: 22.1, netProfit: 6.8, note: '' },
      { year: 2045, capacity: '100%', revenue: 30.1, costs: 22.6, netProfit: 7.0, note: '' },
      { year: 2046, capacity: '100%', revenue: 30.8, costs: 23.1, netProfit: 7.2, note: 'Передача актива' },
    ],
  },

  // ─── PPP ─────────────────────────────────────────────────────
  ppp: {
    parties: [
      { name: 'UNICAP', role: 'Частный партнёр', share: 45, color: '#00e6c8', desc: 'Финансирование, проектирование, строительство, O&M' },
      { name: 'GTTCI', role: 'Частный партнёр', share: 45, color: '#60a5fa', desc: 'Привлечение долгового финансирования, соглашение с Государственным партнёром' },
      { name: 'Государство', role: 'Государственный партнёр', share: 10, color: '#fbbf24', desc: 'Земля, льготы, гарантия 100% загрузки мощностей' },
    ],
    obligations: [
      {
        party: 'Частный партнёр (UNICAP + GTTCI)',
        color: '#00e6c8',
        icon: 'Building2',
        items: [
          'Финансирование всего проекта',
          'Проектирование и инжиниринг (EPC)',
          'Строительство и ввод в эксплуатацию',
          'Управление и эксплуатация (O&M) 15 лет',
        ],
      },
      {
        party: 'Государственный партнёр',
        color: '#fbbf24',
        icon: 'Shield',
        items: [
          'Предоставление земельного участка (бесплатно)',
          'Таможенные и налоговые льготы в период строительства',
          'Гарантия производительности — 100% загрузка мощности',
          'Передача актива в государственную собственность в 2047 г.',
        ],
      },
    ],
  },

  // ─── Timeline ────────────────────────────────────────────────
  timeline: [
    { phase: 'Сбор данных / Техническое задание', period: 'Окт 2024 — Апр 2025', status: 'current', color: '#00e6c8', desc: 'Подготовка технических условий для проектирования' },
    { phase: 'Предпроектные работы', period: 'Апр — Июл 2025', status: 'upcoming', color: '#60a5fa', desc: 'Обоснование инвестиций, выбор технологий' },
    { phase: 'Тендер и отбор EPC-подрядчика', period: 'Июл — Сен 2025', status: 'upcoming', color: '#a78bfa', desc: 'Конкурсный отбор партнёров по технологиям и строительству' },
    { phase: 'Заключение ГЧП-соглашения', period: 'Сен — Ноя 2025', status: 'upcoming', color: '#fbbf24', desc: 'Подписание договора с Государственным партнёром' },
    { phase: 'Регистрация SPV и финансовое закрытие', period: 'Ноя 2025 — Янв 2026', status: 'upcoming', color: '#fb923c', desc: 'Создание проектной компании SPV в Узбекистане' },
    { phase: 'Подписание ГЧП-соглашения', period: 'Янв — Апр 2026', status: 'planned', color: '#4ade80', desc: 'Официальное подписание ГЧП, начало проектирования' },
    { phase: 'Проектирование и строительство', period: 'Апр 2026 — Апр 2028', status: 'planned', color: '#34d399', desc: 'Строительство объектов мощностью 150 000 м³/сут' },
    { phase: 'Ввод в эксплуатацию', period: '2030', status: 'planned', color: '#22c55e', desc: 'Пуск и выход на полную мощность' },
    { phase: 'Управление и эксплуатация (O&M)', period: '2031 — 2046', status: 'planned', color: '#86efac', desc: '15 лет коммерческой эксплуатации' },
    { phase: 'Передача актива государству', period: 'Январь 2047', status: 'planned', color: '#bbf7d0', desc: 'Переход права собственности к Государственному партнёру' },
  ],

  // ─── Tech Partners ───────────────────────────────────────────
  techPartners: [
    { category: 'design', label: 'Проектирование и инжиниринг', names: ['Metito', 'ACCIONA Agua'], color: '#00e6c8' },
    { category: 'construction', label: 'Строительство (EPC)', names: ['ACCIONA Agua', 'Metito', 'Doosan Enerbility'], color: '#60a5fa' },
    {
      category: 'equipment',
      label: 'Оборудование и технологии',
      names: ['Xylem', 'Sulzer', 'HUBER', 'Alfa Laval', 'Andritz', 'Sanitaire', 'Aerzen', 'Atlas Copco', 'Nereda', 'Siemens'],
      color: '#a78bfa',
    },
  ],

  // ─── Benefits ────────────────────────────────────────────────
  benefits: {
    social: [
      { icon: 'Users', value: '500 000+', label: 'жителей охвачено', sublabel: 'Сырдарьинская область', color: '#00e6c8' },
      { icon: 'TrendingUp', value: '+36%', label: 'охват водоснабжением', sublabel: '62% → 98%', color: '#4ade80' },
      { icon: 'HardHat', value: '2 000+', label: 'рабочих мест', sublabel: 'Строительная фаза', color: '#60a5fa' },
      { icon: 'Briefcase', value: '150', label: 'постоянных рабочих мест', sublabel: 'O&M персонал', color: '#a78bfa' },
      { icon: 'Heart', value: '-40%', label: 'водных заболеваний', sublabel: 'Улучшение здоровья населения', color: '#fb923c' },
    ],
    economic: [
      { icon: 'DollarSign', value: '$22.4M', label: 'годовой выручки', sublabel: 'Среднегодовой показатель', color: '#4ade80' },
      { icon: 'BarChart2', value: '$45M', label: 'мультипликатор ВРП', sublabel: 'Региональный эффект', color: '#00e6c8' },
      { icon: 'Home', value: '+15%', label: 'стоимость недвижимости', sublabel: 'В зоне обслуживания', color: '#60a5fa' },
      { icon: 'Factory', value: '-60%', label: 'затраты бизнеса на воду', sublabel: 'Промышленные потребители', color: '#fbbf24' },
      { icon: 'Landmark', value: '+$3.2M', label: 'налоговые поступления', sublabel: 'В год в бюджет', color: '#fb923c' },
    ],
    environmental: [
      { icon: 'Leaf', value: '-12 000 т', label: 'CO₂ в год', sublabel: 'Эффективная насосная станция', color: '#4ade80' },
      { icon: 'Droplets', value: '-33%', label: 'потерь воды', sublabel: '45% → 12%', color: '#00e6c8' },
      { icon: 'Wifi', value: 'IoT 24/7', label: 'мониторинг качества воды', sublabel: 'Умная система контроля', color: '#60a5fa' },
      { icon: 'Waves', value: '↓', label: 'нагрузка на р. Сырдарья', sublabel: 'Рациональное водопотребление', color: '#a78bfa' },
      { icon: 'TreePine', value: '↑', label: 'экосистема дельты', sublabel: 'Восстановление природной среды', color: '#34d399' },
    ],
  },

  // ─── Water Treatment Process ─────────────────────────────────
  waterProcess: [
    { step: 1, name: 'Водозабор', desc: 'Забор воды из р. Сырдарья', icon: 'Waves', color: '#00b4ff' },
    { step: 2, name: 'Предварительная очистка', desc: 'Грубые решётки, сита', icon: 'Filter', color: '#00ccff' },
    { step: 3, name: 'Коагуляция/Флокуляция', desc: 'Добавление реагентов', icon: 'FlaskConical', color: '#38bdf8' },
    { step: 4, name: 'Отстаивание', desc: 'Первичные отстойники', icon: 'Layers', color: '#60a5fa' },
    { step: 5, name: 'Фильтрация', desc: 'Песчаные + угольные фильтры', icon: 'SlidersHorizontal', color: '#818cf8' },
    { step: 6, name: 'УФ-обеззараживание', desc: 'Ультрафиолетовые установки', icon: 'Sun', color: '#a78bfa' },
    { step: 7, name: 'Хлорирование', desc: 'Финальная дезинфекция', icon: 'Beaker', color: '#c084fc' },
    { step: 8, name: 'Резервуар', desc: 'Накопительные резервуары', icon: 'Database', color: '#00e6c8' },
    { step: 9, name: 'Распределение', desc: 'Магистральная сеть 19.4 км', icon: 'GitBranch', color: '#4ade80' },
  ],

  // ─── SPV ─────────────────────────────────────────────────────
  spv: {
    type: 'Special Purpose Vehicle (SPV)',
    currency: 'USD / UZS (привязка к курсу)',
    description:
      'Для реализации проекта в Узбекистане создаётся специализированная компания SPV — отдельное юридическое лицо. Структура обеспечивает изоляцию рисков проекта от головных компаний партнёров и прозрачность управления активами в соответствии с международными стандартами ГЧП. Тарификация ведётся в USD с конвертацией по официальному курсу ЦБ, что снижает валютный риск инвесторов.',
  },

  // ─── Main Partner ────────────────────────────────────────────
  mainPartner: {
    name: 'UNICAP',
    fullName: 'United Innovation Capital Partners',
    address: '16192, Coastal Highway, Lewes, Delaware 19958, USA',
    website: 'unicapinvest.org',
    email: 'global@unicapinvest.org',
    description:
      'UNICAP — международная инвестиционная компания, специализирующаяся на инфраструктурных проектах в сфере водоснабжения, водоотведения и коммунальной инфраструктуры в развивающихся рынках. Компания реализует проекты по модели EPC и O&M, обеспечивая полный цикл от проектирования до долгосрочного управления активами. Стратегический ориентир — программа «Умные города 2030».',
    stats: [
      { label: 'Инвестировано', value: '$1B+', color: '#00e6c8' },
      { label: 'Стран присутствия', value: '10+', color: '#60a5fa' },
      { label: 'Управляемые активы', value: '$2B+', color: '#a78bfa' },
      { label: 'Лет на рынке', value: '5+', color: '#fbbf24' },
      { label: 'Реализованных проектов', value: '20+', color: '#fb923c' },
      { label: 'Партнёров', value: '140+', color: '#4ade80' },
    ],
  },

  // ─── FAQ ─────────────────────────────────────────────────────
  faq: [
    {
      q: 'Какова детальная финансовая модель проекта?',
      a: 'Общий объём инвестиций: $220M | Мощность: 150 000 м³/сут | Привлечённые средства: 80%, собственный капитал: 20% | Среднегодовая выручка: $22.4M | Чистая прибыль: $4.7M | Рентабельность: 23.9% | Окупаемость: 10 лет | Точка безубыточности: 5 лет после ввода. Детальная финансовая модель — в прилагаемой таблице.',
    },
    {
      q: 'Каков статус реализации проекта?',
      a: 'Проект находится на стадии сбора данных для подготовки технических условий к проектной фазе. ГЧП-соглашение планируется к подписанию в 2026 г. Фаза проектирования и строительства: 2027–2030. Эксплуатация: 2031–2046. Передача актива государству: январь 2047 г.',
    },
    {
      q: 'Кто является технологическими и строительными партнёрами?',
      a: 'Рассматриваемые партнёры: проектирование — Metito, ACCIONA Agua; строительство — ACCIONA Agua, Metito, Doosan Enerbility; оборудование — Xylem, Sulzer, HUBER, Alfa Laval, Andritz, Siemens и др. Окончательный состав определяется конкурсным отбором.',
    },
    {
      q: 'Как распределена собственность в SPV?',
      a: 'Государственный партнёр (ГП): 10% уставного капитала. Частные партнёры: 90% — GTTCI: 45%, UNICAP: 45%. Роли: UNICAP — финансирование, EPC, O&M; GTTCI — привлечение долгового финансирования, соглашение с ГП.',
    },
  ],

  // ─── Map Data ────────────────────────────────────────────────
  mapData: {
    cities: [
      { name: 'Самарканд', lat: 39.65, lng: 66.97, isMain: true },
      { name: 'Ташкент', lat: 41.3, lng: 69.27 },
      { name: 'Самарканд', lat: 39.65, lng: 66.97 },
      { name: 'Фергана', lat: 40.38, lng: 71.78 },
      { name: 'Бухара', lat: 39.77, lng: 64.43 },
      { name: 'Нукус', lat: 42.47, lng: 59.61 },
      { name: 'Термез', lat: 37.22, lng: 67.28 },
    ],
    rivers: [
      {
        name: 'Сырдарья',
        color: '#00ccff',
        coords: [[40.5, 72], [41, 70.5], [41, 68], [40.9, 68.5], [40.5, 64], [40.2, 62], [40.2, 60.5]],
      },
      {
        name: 'Амударья',
        color: '#00b4ff',
        coords: [[37.9, 67.4], [38.5, 65], [39.5, 63.5], [41.5, 59.5], [43.5, 59], [44, 58.5]],
      },
    ],
    pipelineCoords: [
      [40.49, 68.66],
      [40.4, 68.5],
      [40.3, 68.3],
      [40.2, 68.0],
      [40.0, 67.8],
    ],
  },
};
