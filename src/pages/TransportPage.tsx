import { useState, useMemo, useRef } from 'react';
import { useLocation } from 'wouter';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, Train, Truck, Ship, Plane, Anchor, Route as RouteIcon,
  TrendingDown, TrendingUp, FileText, Compass, Package, Clock, Leaf,
} from 'lucide-react';

// ══════════════════════════════════════════════════════════════════════════════
//  ArkheOSium — Transport & Logistics (G-TR)
//  Multimodal supply corridors for the megaproject
//  Route: /transport
// ══════════════════════════════════════════════════════════════════════════════

const ACCENT = '#00d4ff';
const ACCENT2 = '#00e6c8';

// ─── i18n (self-contained, bilingual) ───────────────────────────────────────────

const STRINGS = {
  ru: {
    back: 'Назад к дорожной карте',
    doc_label: 'Транспорт и логистика',
    eyebrow: 'Мультимодальные коридоры',
    hero_title: 'Транспорт и логистика',
    hero_accent: 'Коридоры снабжения мегапроекта',
    hero_lead:
      'Живая схема транспортной сети: порты, хабы и стройплощадки связаны рельсовыми, автомобильными, водными и воздушными коридорами. Кликните коридор — увидите пропускную способность, режим и ETA. Фильтруйте по видам транспорта.',
    kpi_corridors: 'Активных коридоров',
    kpi_cargo: 'Груз, Мт/год',
    kpi_time: 'Ср. время доставки',
    kpi_modal: 'Низкоуглеродная доля',
    net_eyebrow: 'Цифровой двойник сети',
    net_title: 'Схема транспортных коридоров',
    net_sub:
      'Узлы — порты, логистические хабы и стройплощадки. Линии — коридоры с анимированным потоком груза. Кликните коридор для деталей; переключайте виды транспорта фильтром.',
    filter_label: 'Виды транспорта',
    mode_rail: 'Рельс',
    mode_road: 'Авто',
    mode_water: 'Вода',
    mode_air: 'Воздух',
    sel_prompt: 'Кликните коридор на схеме, чтобы увидеть его характеристики.',
    sel_throughput: 'Пропускная способность',
    sel_mode: 'Режим',
    sel_distance: 'Расстояние',
    sel_eta: 'ETA',
    sel_lowcarbon: 'Низкоуглеродный',
    yes: 'Да',
    no: 'Нет',
    totals_active: 'Активная пропускная способность',
    totals_edges: 'Коридоров в фильтре',
    totals_lowcarbon: 'Низкоуглеродная доля',
    cards_eyebrow: 'Ключевые маршруты',
    cards_title: 'Приоритетные коридоры',
    cards_sub: 'Три опорных коридора снабжения — от порта до фронта строительных работ.',
    card_aral_t: 'Аральский коридор снабжения',
    card_aral_d: 'Водно-рельсовый коридор к восстановительным площадкам Аралкум: инертные материалы, саженцы, оборудование.',
    card_samarkand_t: 'Самаркандский хаб',
    card_samarkand_d: 'Мультимодальный распределительный узел центрального региона: перегрузка авто↔рельс, склады, таможня.',
    card_rail_t: 'Транс-Центральноазиатская магистраль',
    card_rail_d: 'Магистральный рельсовый коридор для тяжёлых грузов между странами региона с минимальным углеродным следом.',
    card_metric_flow: 'Поток',
    card_metric_dist: 'Длина',
    card_metric_util: 'Загрузка',
    charts_eyebrow: 'Динамика',
    charts_title: 'Тренды логистики',
    charts_sub:
      'Совокупная пропускная способность растёт, удельные выбросы на тонно-километр снижаются по мере перехода на рельс и воду.',
    chart_flow_title: 'Пропускная способность',
    chart_emis_title: 'Выбросы / тонно-км',
    cta_title: 'Логистика — кровеносная система мегапроекта',
    cta_sub: 'Как транспортные коридоры встраиваются в дорожную карту и архитектуру платформы ArkheOSium.',
    cta_roadmap: 'Дорожная карта',
    cta_wp: 'Полный whitepaper',
    copyright: '© ArkheOSium — Planetary Infrastructure OS. Данные демонстрационные.',
    years_note: 'Годы: 2026 → 2040',
    unit_mtyr: 'Мт/год',
    unit_km: 'км',
    unit_days: 'дн.',
  },
  en: {
    back: 'Back to roadmap',
    doc_label: 'Transport & Logistics',
    eyebrow: 'Multimodal corridors',
    hero_title: 'Transport & Logistics',
    hero_accent: 'Supply corridors for the megaproject',
    hero_lead:
      'A live schematic of the transport network: ports, hubs and construction sites linked by rail, road, water and air corridors. Click a corridor to see throughput, mode and ETA. Filter by transport mode.',
    kpi_corridors: 'Active corridors',
    kpi_cargo: 'Cargo, Mt/yr',
    kpi_time: 'Avg delivery time',
    kpi_modal: 'Low-carbon modal share',
    net_eyebrow: 'Network digital twin',
    net_title: 'Transport corridor schematic',
    net_sub:
      'Nodes are ports, logistics hubs and construction sites. Lines are corridors with animated cargo flow. Click a corridor for details; toggle transport modes with the filter.',
    filter_label: 'Transport modes',
    mode_rail: 'Rail',
    mode_road: 'Road',
    mode_water: 'Water',
    mode_air: 'Air',
    sel_prompt: 'Click a corridor on the schematic to inspect its characteristics.',
    sel_throughput: 'Throughput',
    sel_mode: 'Mode',
    sel_distance: 'Distance',
    sel_eta: 'ETA',
    sel_lowcarbon: 'Low-carbon',
    yes: 'Yes',
    no: 'No',
    totals_active: 'Active throughput',
    totals_edges: 'Corridors in filter',
    totals_lowcarbon: 'Low-carbon share',
    cards_eyebrow: 'Key routes',
    cards_title: 'Priority corridors',
    cards_sub: 'Three backbone supply corridors — from port to the construction front.',
    card_aral_t: 'Aral supply corridor',
    card_aral_d: 'Water-rail corridor to the Aralkum restoration sites: aggregates, seedlings and equipment.',
    card_samarkand_t: 'Samarkand hub',
    card_samarkand_d: 'Central-region multimodal distribution node: road↔rail transfer, warehousing and customs.',
    card_rail_t: 'Trans-Central-Asia rail line',
    card_rail_d: 'Backbone rail corridor for heavy cargo between regional countries with a minimal carbon footprint.',
    card_metric_flow: 'Flow',
    card_metric_dist: 'Length',
    card_metric_util: 'Utilization',
    charts_eyebrow: 'Dynamics',
    charts_title: 'Logistics trends',
    charts_sub:
      'Aggregate throughput rises while emissions per tonne-km fall as freight shifts to rail and water.',
    chart_flow_title: 'Throughput',
    chart_emis_title: 'Emissions / tonne-km',
    cta_title: 'Logistics is the circulatory system of the megaproject',
    cta_sub: 'How transport corridors fit into the roadmap and the ArkheOSium platform architecture.',
    cta_roadmap: 'Roadmap',
    cta_wp: 'Full whitepaper',
    copyright: '© ArkheOSium — Planetary Infrastructure OS. Data is illustrative.',
    years_note: 'Years: 2026 → 2040',
    unit_mtyr: 'Mt/yr',
    unit_km: 'km',
    unit_days: 'd',
  },
  kk: {
    back: 'Жол картасына оралу',
    doc_label: 'Көлік және логистика',
    eyebrow: 'Мультимодальды дәліздер',
    hero_title: 'Көлік және логистика',
    hero_accent: 'Мегажобаны жабдықтау дәліздері',
    hero_lead:
      'Көлік желісінің тірі схемасы: порттар, хабтар мен құрылыс алаңдары теміржол, автомобиль, су және әуе дәліздерімен байланысқан. Дәлізді басыңыз — өткізу қабілетін, режимін және ETA көресіз. Көлік түрлері бойынша сүзгілеңіз.',
    kpi_corridors: 'Белсенді дәліздер',
    kpi_cargo: 'Жүк, Мт/жыл',
    kpi_time: 'Орташа жеткізу уақыты',
    kpi_modal: 'Төмен көміртекті үлес',
    net_eyebrow: 'Желінің сандық егізі',
    net_title: 'Көлік дәліздерінің схемасы',
    net_sub:
      'Түйіндер — порттар, логистикалық хабтар мен құрылыс алаңдары. Сызықтар — жүк ағыны анимацияланған дәліздер. Толығырақ ақпарат үшін дәлізді басыңыз; көлік түрлерін сүзгімен ауыстырыңыз.',
    filter_label: 'Көлік түрлері',
    mode_rail: 'Теміржол',
    mode_road: 'Авто',
    mode_water: 'Су',
    mode_air: 'Әуе',
    sel_prompt: 'Оның сипаттамаларын көру үшін схемадағы дәлізді басыңыз.',
    sel_throughput: 'Өткізу қабілеті',
    sel_mode: 'Режим',
    sel_distance: 'Қашықтық',
    sel_eta: 'ETA',
    sel_lowcarbon: 'Төмен көміртекті',
    yes: 'Иә',
    no: 'Жоқ',
    totals_active: 'Белсенді өткізу қабілеті',
    totals_edges: 'Сүзгідегі дәліздер',
    totals_lowcarbon: 'Төмен көміртекті үлес',
    cards_eyebrow: 'Негізгі бағыттар',
    cards_title: 'Басым дәліздер',
    cards_sub: 'Үш тірек жабдықтау дәлізі — порттан құрылыс майданына дейін.',
    card_aral_t: 'Арал жабдықтау дәлізі',
    card_aral_d: 'Аралқұм қалпына келтіру алаңдарына су-теміржол дәлізі: инертті материалдар, көшеттер, жабдық.',
    card_samarkand_t: 'Самарқанд хабы',
    card_samarkand_d: 'Орталық өңірдің мультимодальды тарату түйіні: авто↔теміржол қайта тиеу, қоймалар, кеден.',
    card_rail_t: 'Транс-Орталық-Азия магистралі',
    card_rail_d: 'Өңір елдері арасында ауыр жүкке арналған минималды көміртекті ізі бар магистральды теміржол дәлізі.',
    card_metric_flow: 'Ағын',
    card_metric_dist: 'Ұзындық',
    card_metric_util: 'Жүктеме',
    charts_eyebrow: 'Динамика',
    charts_title: 'Логистика трендтері',
    charts_sub:
      'Жалпы өткізу қабілеті артады, ал жүк теміржол мен суға ауысқан сайын тонна-километрге келетін меншікті шығарындылар төмендейді.',
    chart_flow_title: 'Өткізу қабілеті',
    chart_emis_title: 'Шығарындылар / тонна-км',
    cta_title: 'Логистика — мегажобаның қан айналым жүйесі',
    cta_sub: 'Көлік дәліздері жол картасына және ArkheOSium платформасының архитектурасына қалай кіріктірілген.',
    cta_roadmap: 'Жол картасы',
    cta_wp: 'Толық whitepaper',
    copyright: '© ArkheOSium — Planetary Infrastructure OS. Деректер демонстрациялық.',
    years_note: 'Жылдар: 2026 → 2040',
    unit_mtyr: 'Мт/жыл',
    unit_km: 'км',
    unit_days: 'күн',
  },
  uz: {
    back: 'Yo‘l xaritasiga qaytish',
    doc_label: 'Transport va logistika',
    eyebrow: 'Multimodal koridorlar',
    hero_title: 'Transport va logistika',
    hero_accent: 'Megaloyihani taʼminlash koridorlari',
    hero_lead:
      'Transport tarmog‘ining jonli sxemasi: portlar, hablar va qurilish maydonlari temir yo‘l, avtomobil, suv va havo koridorlari bilan bog‘langan. Koridorni bosing — o‘tkazuvchanlik, rejim va ETA ni ko‘rasiz. Transport turlari bo‘yicha filtrlang.',
    kpi_corridors: 'Faol koridorlar',
    kpi_cargo: 'Yuk, Mt/yil',
    kpi_time: 'O‘rtacha yetkazish vaqti',
    kpi_modal: 'Kam uglerodli ulush',
    net_eyebrow: 'Tarmoqning raqamli egizagi',
    net_title: 'Transport koridorlari sxemasi',
    net_sub:
      'Tugunlar — portlar, logistika hablari va qurilish maydonlari. Chiziqlar — yuk oqimi animatsiyalangan koridorlar. Tafsilotlar uchun koridorni bosing; transport turlarini filtr bilan almashtiring.',
    filter_label: 'Transport turlari',
    mode_rail: 'Temir yo‘l',
    mode_road: 'Avto',
    mode_water: 'Suv',
    mode_air: 'Havo',
    sel_prompt: 'Uning tavsiflarini ko‘rish uchun sxemadagi koridorni bosing.',
    sel_throughput: 'O‘tkazuvchanlik',
    sel_mode: 'Rejim',
    sel_distance: 'Masofa',
    sel_eta: 'ETA',
    sel_lowcarbon: 'Kam uglerodli',
    yes: 'Ha',
    no: 'Yo‘q',
    totals_active: 'Faol o‘tkazuvchanlik',
    totals_edges: 'Filtrdagi koridorlar',
    totals_lowcarbon: 'Kam uglerodli ulush',
    cards_eyebrow: 'Asosiy yo‘nalishlar',
    cards_title: 'Ustuvor koridorlar',
    cards_sub: 'Uchta tayanch taʼminlash koridori — portdan qurilish frontigacha.',
    card_aral_t: 'Orol taʼminlash koridori',
    card_aral_d: 'Orolqum tiklash maydonlariga suv-temir yo‘l koridori: inert materiallar, ko‘chatlar, jihozlar.',
    card_samarkand_t: 'Samarqand habi',
    card_samarkand_d: 'Markaziy hududning multimodal taqsimlash tuguni: avto↔temir yo‘l qayta yuklash, omborlar, bojxona.',
    card_rail_t: 'Trans-Markaziy-Osiyo magistrali',
    card_rail_d: 'Hudud mamlakatlari o‘rtasida og‘ir yuklar uchun minimal uglerod izi bo‘lgan magistral temir yo‘l koridori.',
    card_metric_flow: 'Oqim',
    card_metric_dist: 'Uzunlik',
    card_metric_util: 'Yuklama',
    charts_eyebrow: 'Dinamika',
    charts_title: 'Logistika tendensiyalari',
    charts_sub:
      'Umumiy o‘tkazuvchanlik ortadi, yuk temir yo‘l va suvga o‘tishi bilan tonna-kilometrga solishtirma chiqindilar kamayadi.',
    chart_flow_title: 'O‘tkazuvchanlik',
    chart_emis_title: 'Chiqindilar / tonna-km',
    cta_title: 'Logistika — megaloyihaning qon aylanish tizimi',
    cta_sub: 'Transport koridorlari yo‘l xaritasiga va ArkheOSium platformasi arxitekturasiga qanday integratsiyalashgani.',
    cta_roadmap: 'Yo‘l xaritasi',
    cta_wp: 'To‘liq whitepaper',
    copyright: '© ArkheOSium — Planetary Infrastructure OS. Maʼlumotlar namoyish uchun.',
    years_note: 'Yillar: 2026 → 2040',
    unit_mtyr: 'Mt/yil',
    unit_km: 'km',
    unit_days: 'kun',
  },
  ar: {
    back: 'العودة إلى خارطة الطريق',
    doc_label: 'النقل والخدمات اللوجستية',
    eyebrow: 'ممرات متعددة الوسائط',
    hero_title: 'النقل والخدمات اللوجستية',
    hero_accent: 'ممرات إمداد المشروع العملاق',
    hero_lead:
      'مخطط حي لشبكة النقل: الموانئ والمحاور ومواقع البناء مترابطة عبر ممرات السكك الحديدية والطرق والمياه والجو. انقر على ممر لرؤية سعة التمرير والوضع ووقت الوصول المقدر. قم بالتصفية حسب وسيلة النقل.',
    kpi_corridors: 'الممرات النشطة',
    kpi_cargo: 'البضائع، م ط/سنة',
    kpi_time: 'متوسط زمن التسليم',
    kpi_modal: 'الحصة منخفضة الكربون',
    net_eyebrow: 'التوأم الرقمي للشبكة',
    net_title: 'مخطط ممرات النقل',
    net_sub:
      'العقد هي الموانئ والمحاور اللوجستية ومواقع البناء. الخطوط هي ممرات بتدفق بضائع متحرك. انقر على ممر للتفاصيل؛ بدّل وسائل النقل بواسطة المرشّح.',
    filter_label: 'وسائل النقل',
    mode_rail: 'سكة حديد',
    mode_road: 'طرق',
    mode_water: 'مياه',
    mode_air: 'جو',
    sel_prompt: 'انقر على ممر في المخطط لفحص خصائصه.',
    sel_throughput: 'سعة التمرير',
    sel_mode: 'الوضع',
    sel_distance: 'المسافة',
    sel_eta: 'وقت الوصول المقدر',
    sel_lowcarbon: 'منخفض الكربون',
    yes: 'نعم',
    no: 'لا',
    totals_active: 'سعة التمرير النشطة',
    totals_edges: 'الممرات في المرشّح',
    totals_lowcarbon: 'الحصة منخفضة الكربون',
    cards_eyebrow: 'المسارات الرئيسية',
    cards_title: 'الممرات ذات الأولوية',
    cards_sub: 'ثلاثة ممرات إمداد رئيسية — من الميناء إلى جبهة البناء.',
    card_aral_t: 'ممر إمداد بحر آرال',
    card_aral_d: 'ممر مائي-حديدي إلى مواقع استعادة أرالكوم: الركام والشتلات والمعدات.',
    card_samarkand_t: 'محور سمرقند',
    card_samarkand_d: 'عقدة توزيع متعددة الوسائط للمنطقة الوسطى: نقل طرق↔سكة حديد، مستودعات وجمارك.',
    card_rail_t: 'خط سكة حديد عبر آسيا الوسطى',
    card_rail_d: 'ممر سكة حديد رئيسي للبضائع الثقيلة بين دول المنطقة ببصمة كربونية دنيا.',
    card_metric_flow: 'التدفق',
    card_metric_dist: 'الطول',
    card_metric_util: 'الاستخدام',
    charts_eyebrow: 'الديناميكيات',
    charts_title: 'اتجاهات الخدمات اللوجستية',
    charts_sub:
      'ترتفع السعة الإجمالية بينما تنخفض الانبعاثات لكل طن-كيلومتر مع تحوّل الشحن إلى السكك الحديدية والمياه.',
    chart_flow_title: 'سعة التمرير',
    chart_emis_title: 'الانبعاثات / طن-كم',
    cta_title: 'الخدمات اللوجستية هي الجهاز الدوري للمشروع العملاق',
    cta_sub: 'كيف تندمج ممرات النقل في خارطة الطريق وبنية منصة ArkheOSium.',
    cta_roadmap: 'خارطة الطريق',
    cta_wp: 'الورقة البيضاء الكاملة',
    copyright: '© ArkheOSium — Planetary Infrastructure OS. البيانات توضيحية.',
    years_note: 'السنوات: 2026 ← 2040',
    unit_mtyr: 'م ط/سنة',
    unit_km: 'كم',
    unit_days: 'يوم',
  },
} as const;

// ─── Types ───────────────────────────────────────────────────────────────────────

type Mode = 'rail' | 'road' | 'water' | 'air';

interface NodeDef {
  id: string;
  x: number; // SVG coords in a 0..1000 x 0..560 viewBox
  y: number;
  kind: 'port' | 'hub' | 'site';
  label_ru: string;
  label_en: string;
}

interface EdgeDef {
  id: string;
  from: string;
  to: string;
  mode: Mode;
  throughput: number; // Mt/yr
  distance: number; // km
  eta: number; // days
}

interface ModeMeta {
  key: Mode;
  Icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  color: string;
  lowCarbon: boolean;
}

// ─── Mode registry ──────────────────────────────────────────────────────────────

const MODES: ModeMeta[] = [
  { key: 'rail', Icon: Train, color: '#00e6c8', lowCarbon: true },
  { key: 'water', Icon: Ship, color: '#00d4ff', lowCarbon: true },
  { key: 'road', Icon: Truck, color: '#fbbf24', lowCarbon: false },
  { key: 'air', Icon: Plane, color: '#f472b6', lowCarbon: false },
];

const MODE_COLOR: Record<Mode, string> = {
  rail: '#00e6c8',
  water: '#00d4ff',
  road: '#fbbf24',
  air: '#f472b6',
};

// ─── Network topology (self-contained mock data) ────────────────────────────────

const NODES: NodeDef[] = [
  { id: 'port', x: 90, y: 300, kind: 'port', label_ru: 'Морской порт', label_en: 'Seaport' },
  { id: 'aralport', x: 250, y: 130, kind: 'port', label_ru: 'Аральский порт', label_en: 'Aral port' },
  { id: 'hubA', x: 380, y: 300, kind: 'hub', label_ru: 'Хаб «Запад»', label_en: 'West hub' },
  { id: 'samarkand', x: 560, y: 200, kind: 'hub', label_ru: 'Самарканд', label_en: 'Samarkand' },
  { id: 'railyard', x: 620, y: 400, kind: 'hub', label_ru: 'Ж/д узел', label_en: 'Rail yard' },
  { id: 'aralsite', x: 470, y: 90, kind: 'site', label_ru: 'Аралкум', label_en: 'Aralkum site' },
  { id: 'siteE', x: 830, y: 150, kind: 'site', label_ru: 'Восточный фронт', label_en: 'East front' },
  { id: 'siteS', x: 850, y: 420, kind: 'site', label_ru: 'Южный фронт', label_en: 'South front' },
];

const EDGES: EdgeDef[] = [
  { id: 'e1', from: 'port', to: 'hubA', mode: 'rail', throughput: 42, distance: 320, eta: 2 },
  { id: 'e2', from: 'port', to: 'aralport', mode: 'water', throughput: 28, distance: 410, eta: 4 },
  { id: 'e3', from: 'aralport', to: 'aralsite', mode: 'water', throughput: 18, distance: 190, eta: 2 },
  { id: 'e4', from: 'hubA', to: 'aralsite', mode: 'road', throughput: 12, distance: 260, eta: 3 },
  { id: 'e5', from: 'hubA', to: 'samarkand', mode: 'rail', throughput: 55, distance: 480, eta: 3 },
  { id: 'e6', from: 'samarkand', to: 'railyard', mode: 'rail', throughput: 48, distance: 210, eta: 1 },
  { id: 'e7', from: 'samarkand', to: 'siteE', mode: 'road', throughput: 16, distance: 340, eta: 4 },
  { id: 'e8', from: 'railyard', to: 'siteS', mode: 'rail', throughput: 38, distance: 300, eta: 2 },
  { id: 'e9', from: 'railyard', to: 'siteE', mode: 'road', throughput: 9, distance: 380, eta: 5 },
  { id: 'e10', from: 'samarkand', to: 'siteE', mode: 'air', throughput: 3, distance: 340, eta: 1 },
  { id: 'e11', from: 'hubA', to: 'railyard', mode: 'road', throughput: 21, distance: 290, eta: 3 },
];

const NODE_MAP: Record<string, NodeDef> = Object.fromEntries(NODES.map((n) => [n.id, n]));

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
      className="bg-[#000d24] border border-white/10 rounded-2xl p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: color + '18', color }}>
          <Icon size={17} />
        </div>
        {trend === 'down' && <TrendingDown size={15} className="text-emerald-400" />}
        {trend === 'up' && <TrendingUp size={15} style={{ color: ACCENT }} />}
      </div>
      <div className="text-2xl font-black font-mono" style={{ color }}>{val}</div>
      <div className="text-[11px] text-gray-500 mt-1 leading-tight">{label}</div>
    </motion.div>
  );
}

// ─── Trend chart (SVG area) ─────────────────────────────────────────────────────

function TrendChart({
  points, color, title, unit, reduce, max,
}: {
  points: number[]; color: string; title: string; unit: string; reduce: boolean; max: number;
}) {
  const W = 480;
  const H = 160;
  const PAD = 8;
  const step = (W - PAD * 2) / (points.length - 1);
  const coords = points.map((p, i) => {
    const x = PAD + i * step;
    const y = PAD + (1 - p / max) * (H - PAD * 2);
    return [x, y] as const;
  });
  const line = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${line} L${coords[coords.length - 1][0].toFixed(1)},${H - PAD} L${coords[0][0].toFixed(1)},${H - PAD} Z`;
  const last = points[points.length - 1];
  const gid = `grad-${title.replace(/\s+/g, '')}`;

  return (
    <div className="bg-[#000d24] border border-white/10 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-white">{title}</span>
        <span className="text-lg font-black font-mono" style={{ color }}>{Math.round(last)}{unit}</span>
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

// ─── Sparkline ──────────────────────────────────────────────────────────────────

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const W = 120;
  const H = 34;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const step = W / (data.length - 1);
  const d = data
    .map((v, i) => `${i === 0 ? 'M' : 'L'}${(i * step).toFixed(1)},${(H - ((v - min) / range) * H).toFixed(1)}`)
    .join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-8" preserveAspectRatio="none">
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════════════════════

export default function TransportPage() {
  const [, navigate] = useLocation();
  const { i18n } = useTranslation();
  const reduce = useReducedMotion() ?? false;
  const lang = (i18n.language || 'ru').slice(0, 2);
  const s = (STRINGS as Record<string, typeof STRINGS.ru>)[lang] ?? STRINGS.ru;
  const isEn = lang === 'en';

  const [activeModes, setActiveModes] = useState<Record<Mode, boolean>>({
    rail: true, road: true, water: true, air: true,
  });
  const [selected, setSelected] = useState<string | null>('e5');

  function toggleMode(m: Mode) {
    setActiveModes((p) => ({ ...p, [m]: !p[m] }));
  }

  const modeOn = (m: Mode) => activeModes[m];

  // Edges currently visible under the mode filter
  const visibleEdges = useMemo(() => EDGES.filter((e) => modeOn(e.mode)), [activeModes]);

  // If the selected corridor is filtered out, clear the selection
  const selectedEdge = useMemo(() => {
    if (!selected) return null;
    const e = EDGES.find((x) => x.id === selected);
    return e && modeOn(e.mode) ? e : null;
  }, [selected, activeModes]);

  // Recomputed totals over the active filter
  const activeThroughput = useMemo(
    () => visibleEdges.reduce((a, e) => a + e.throughput, 0),
    [visibleEdges],
  );
  const lowCarbonThroughput = useMemo(
    () => visibleEdges.reduce((a, e) => a + (MODES.find((m) => m.key === e.mode)?.lowCarbon ? e.throughput : 0), 0),
    [visibleEdges],
  );
  const lowCarbonShare = activeThroughput > 0 ? Math.round((lowCarbonThroughput / activeThroughput) * 100) : 0;

  // Hero KPIs (whole network baseline)
  const totalThroughput = useMemo(() => EDGES.reduce((a, e) => a + e.throughput, 0), []);
  const avgEta = useMemo(
    () => (EDGES.reduce((a, e) => a + e.eta, 0) / EDGES.length).toFixed(1),
    [],
  );
  const baselineLowCarbon = useMemo(() => {
    const lc = EDGES.reduce((a, e) => a + (MODES.find((m) => m.key === e.mode)?.lowCarbon ? e.throughput : 0), 0);
    return Math.round((lc / totalThroughput) * 100);
  }, [totalThroughput]);

  // Trend series 2026→2040 (8 steps)
  const YEARS = 8;
  const flowSeries = useMemo(
    () => Array.from({ length: YEARS }, (_, i) => {
      const t = i / (YEARS - 1);
      return 110 + t * 180; // aggregate throughput index rising
    }),
    [],
  );
  const emisSeries = useMemo(
    () => Array.from({ length: YEARS }, (_, i) => {
      const t = i / (YEARS - 1);
      return 88 - t * 64; // emissions per tonne-km falling
    }),
    [],
  );

  // Node label lookup
  const nodeLabel = (id: string) => {
    const n = NODE_MAP[id];
    return n ? (isEn ? n.label_en : n.label_ru) : id;
  };
  const modeLabel = (m: Mode) =>
    m === 'rail' ? s.mode_rail : m === 'road' ? s.mode_road : m === 'water' ? s.mode_water : s.mode_air;

  // Priority corridor cards
  const corridorCards = [
    {
      key: 'aral', color: '#00d4ff', title: s.card_aral_t, desc: s.card_aral_d,
      flow: 28, dist: 600, util: 71, spark: [12, 15, 18, 21, 23, 25, 27, 28],
    },
    {
      key: 'samarkand', color: '#00e6c8', title: s.card_samarkand_t, desc: s.card_samarkand_d,
      flow: 55, dist: 480, util: 83, spark: [30, 34, 39, 44, 47, 50, 53, 55],
    },
    {
      key: 'rail', color: '#7dd3fc', title: s.card_rail_t, desc: s.card_rail_d,
      flow: 48, dist: 990, util: 64, spark: [20, 25, 30, 35, 39, 43, 46, 48],
    },
  ];

  return (
    <div className="min-h-screen text-gray-200">

      {/* ── Top bar ── */}
      <div className="sticky top-0 z-40 bg-[#000818]/95 backdrop-blur border-b border-white/5 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate('/roadmap')}
          className="flex items-center gap-2 text-sm text-[#00d4ff]/70 hover:text-[#00d4ff] transition-colors flex-shrink-0"
        >
          <ArrowLeft size={16} /> {s.back}
        </button>
        <div className="flex items-center gap-2 text-sm text-gray-400 flex-shrink-0">
          <RouteIcon size={14} />
          <span className="hidden sm:inline">{s.doc_label}</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => navigate('/whitepaper-full')}
            className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border border-[#00d4ff]/30 text-[#00d4ff] hover:bg-[#00d4ff]/10 transition-colors"
          >
            <FileText size={12} /> {s.cta_wp}
          </button>
        </div>
      </div>

      {/* ══ HERO ══ */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#001a2e]/40 via-[#00153a]/30 to-[#000818]" />
          {!reduce && (
            <>
              <motion.div
                className="absolute -top-20 right-0 w-[560px] h-[340px] rounded-full bg-[#00d4ff]/8 blur-3xl"
                animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
                transition={{ duration: 13, repeat: Infinity }}
              />
              <motion.div
                className="absolute bottom-0 left-1/4 w-[440px] h-[220px] rounded-full bg-[#00e6c8]/10 blur-3xl"
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
            <div className="flex items-center gap-2 text-xs text-[#00d4ff] bg-[#00d4ff]/10 border border-[#00d4ff]/20 rounded-full px-3 py-1 mb-6 w-fit">
              <RouteIcon size={11} /> {s.eyebrow}
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white mb-5 tracking-tight leading-[0.98]">
              {s.hero_title}
              <br />
              <span className="bg-gradient-to-r from-[#00e6c8] via-[#00d4ff] to-[#7dd3fc] bg-clip-text text-transparent text-2xl md:text-4xl">
                {s.hero_accent}
              </span>
            </h1>

            <p className="text-gray-400 text-base md:text-lg mb-8 max-w-2xl leading-relaxed">
              {s.hero_lead}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl">
              <KpiTile Icon={RouteIcon} val={String(EDGES.length)} label={s.kpi_corridors} color={ACCENT} trend="up" />
              <KpiTile Icon={Package} val={String(totalThroughput)} label={s.kpi_cargo} color="#00e6c8" trend="up" />
              <KpiTile Icon={Clock} val={`${avgEta} ${s.unit_days}`} label={s.kpi_time} color="#fbbf24" trend="down" />
              <KpiTile Icon={Leaf} val={`${baselineLowCarbon}%`} label={s.kpi_modal} color="#22c55e" trend="up" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ NETWORK (centerpiece) ══ */}
      <Section id="network" eyebrow={s.net_eyebrow} title={s.net_title} subtitle={s.net_sub}>
        <div className="bg-[#000d24] border border-white/10 rounded-2xl p-4 md:p-6">

          {/* Mode filter */}
          <div className="mb-5">
            <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: ACCENT }}>
              {s.filter_label}
            </div>
            <div className="flex flex-wrap gap-2">
              {MODES.map((m) => {
                const on = activeModes[m.key];
                return (
                  <button
                    key={m.key}
                    onClick={() => toggleMode(m.key)}
                    className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-all"
                    style={{
                      borderColor: on ? m.color + '80' : 'rgba(255,255,255,0.1)',
                      background: on ? `linear-gradient(135deg, ${m.color}20, transparent)` : 'rgba(255,255,255,0.02)',
                      color: on ? m.color : '#6b7280',
                    }}
                    aria-pressed={on}
                  >
                    <m.Icon size={15} />
                    {modeLabel(m.key)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Schematic + detail panel */}
          <div className="grid lg:grid-cols-[1fr_260px] gap-4">
            {/* SVG network */}
            <div className="relative rounded-xl overflow-hidden border border-white/5 bg-[#00081a]/60">
              <svg viewBox="0 0 1000 500" className="w-full h-auto" role="img" aria-label={s.net_title}>
                <defs>
                  {MODES.map((m) => (
                    <linearGradient key={m.key} id={`edge-${m.key}`} x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor={m.color} stopOpacity="0.25" />
                      <stop offset="100%" stopColor={m.color} stopOpacity="0.9" />
                    </linearGradient>
                  ))}
                </defs>

                {/* Edges */}
                {EDGES.map((e) => {
                  const a = NODE_MAP[e.from];
                  const b = NODE_MAP[e.to];
                  const on = modeOn(e.mode);
                  const isSel = selectedEdge?.id === e.id;
                  const color = MODE_COLOR[e.mode];
                  // Stroke width scaled by throughput
                  const w = 1.5 + (e.throughput / 55) * 5;
                  return (
                    <g key={e.id} opacity={on ? 1 : 0.12}>
                      {/* Wide invisible hit area */}
                      <line
                        x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                        stroke="transparent" strokeWidth={16}
                        style={{ cursor: on ? 'pointer' : 'default' }}
                        onClick={() => on && setSelected(e.id)}
                      />
                      {/* Base line */}
                      <line
                        x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                        stroke={color}
                        strokeOpacity={isSel ? 0.9 : 0.4}
                        strokeWidth={w}
                        strokeLinecap="round"
                        pointerEvents="none"
                      />
                      {/* Animated flow dashes */}
                      {on && (
                        <line
                          x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                          stroke={color}
                          strokeWidth={w}
                          strokeLinecap="round"
                          strokeDasharray="2 14"
                          pointerEvents="none"
                          opacity={0.95}
                        >
                          {!reduce && (
                            <animate
                              attributeName="stroke-dashoffset"
                              from="0" to="-16"
                              dur={`${1.1 + e.eta * 0.25}s`}
                              repeatCount="indefinite"
                            />
                          )}
                        </line>
                      )}
                      {isSel && (
                        <line
                          x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                          stroke="#ffffff" strokeOpacity={0.5} strokeWidth={w + 4}
                          strokeLinecap="round" pointerEvents="none"
                        />
                      )}
                    </g>
                  );
                })}

                {/* Nodes */}
                {NODES.map((n) => {
                  const r = n.kind === 'port' ? 13 : n.kind === 'hub' ? 11 : 8;
                  const fill = n.kind === 'port' ? '#00d4ff' : n.kind === 'hub' ? '#00e6c8' : '#7dd3fc';
                  return (
                    <g key={n.id}>
                      <circle cx={n.x} cy={n.y} r={r + 5} fill={fill} opacity={0.14} />
                      <circle cx={n.x} cy={n.y} r={r} fill="#00081a" stroke={fill} strokeWidth={2.5} />
                      {n.kind === 'port' && <Anchor2 x={n.x} y={n.y} color={fill} />}
                      <text
                        x={n.x}
                        y={n.y - r - 8}
                        textAnchor="middle"
                        fill="#cbd5e1"
                        fontSize={15}
                        fontWeight={600}
                      >
                        {nodeLabel(n.id)}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Detail panel */}
            <div className="flex flex-col gap-3">
              <div className="bg-[#00081a]/60 border border-white/10 rounded-xl p-4 min-h-[168px]">
                {selectedEdge ? (
                  <>
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: MODE_COLOR[selectedEdge.mode] + '22', color: MODE_COLOR[selectedEdge.mode] }}
                      >
                        {(() => {
                          const M = MODES.find((m) => m.key === selectedEdge.mode)!;
                          return <M.Icon size={16} />;
                        })()}
                      </span>
                      <div className="text-sm font-bold text-white leading-tight">
                        {nodeLabel(selectedEdge.from)} → {nodeLabel(selectedEdge.to)}
                      </div>
                    </div>
                    <div className="space-y-2 text-[12px]">
                      <Row label={s.sel_throughput} value={`${selectedEdge.throughput} ${s.unit_mtyr}`} color={MODE_COLOR[selectedEdge.mode]} />
                      <Row label={s.sel_mode} value={modeLabel(selectedEdge.mode)} />
                      <Row label={s.sel_distance} value={`${selectedEdge.distance} ${s.unit_km}`} />
                      <Row label={s.sel_eta} value={`${selectedEdge.eta} ${s.unit_days}`} />
                      <Row
                        label={s.sel_lowcarbon}
                        value={MODES.find((m) => m.key === selectedEdge.mode)?.lowCarbon ? s.yes : s.no}
                        color={MODES.find((m) => m.key === selectedEdge.mode)?.lowCarbon ? '#22c55e' : '#fbbf24'}
                      />
                    </div>
                  </>
                ) : (
                  <div className="h-full flex items-center text-[12px] text-gray-500 leading-relaxed">
                    {s.sel_prompt}
                  </div>
                )}
              </div>

              {/* Live totals */}
              <div className="bg-[#00081a]/60 border border-white/10 rounded-xl p-4 space-y-3">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-0.5">{s.totals_active}</div>
                  <div className="text-xl font-black font-mono" style={{ color: ACCENT }}>
                    {activeThroughput} <span className="text-xs font-normal text-gray-500">{s.unit_mtyr}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white/5 rounded-lg py-2 text-center">
                    <div className="text-sm font-black font-mono" style={{ color: ACCENT2 }}>{visibleEdges.length}</div>
                    <div className="text-[9px] text-gray-500 mt-0.5">{s.totals_edges}</div>
                  </div>
                  <div className="bg-white/5 rounded-lg py-2 text-center">
                    <div className="text-sm font-black font-mono text-emerald-400">{lowCarbonShare}%</div>
                    <div className="text-[9px] text-gray-500 mt-0.5">{s.totals_lowcarbon}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-5 flex-wrap text-[11px] text-gray-400">
            {MODES.map((m) => (
              <span key={m.key} className="flex items-center gap-2">
                <span className="w-4 h-1.5 rounded-full" style={{ background: m.color }} />
                {modeLabel(m.key)}
                {m.lowCarbon && <Leaf size={11} className="text-emerald-400" />}
              </span>
            ))}
          </div>
        </div>
      </Section>

      {/* ══ PRIORITY CORRIDOR CARDS ══ */}
      <Section id="corridors" eyebrow={s.cards_eyebrow} title={s.cards_title} subtitle={s.cards_sub}>
        <div className="grid md:grid-cols-3 gap-4">
          {corridorCards.map((c, i) => (
            <motion.div
              key={c.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border p-5"
              style={{ borderColor: c.color + '30', background: `linear-gradient(135deg, ${c.color}0a, transparent)` }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: c.color }} />
                <h3 className="text-white font-bold leading-tight">{c.title}</h3>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed mb-4 min-h-[64px]">{c.desc}</p>

              <div className="mb-4">
                <Sparkline data={c.spark} color={c.color} />
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white/5 rounded-lg py-2">
                  <div className="text-sm font-black font-mono" style={{ color: c.color }}>{c.flow}</div>
                  <div className="text-[9px] text-gray-500 mt-0.5">{s.card_metric_flow}</div>
                </div>
                <div className="bg-white/5 rounded-lg py-2">
                  <div className="text-sm font-black font-mono" style={{ color: c.color }}>{c.dist}</div>
                  <div className="text-[9px] text-gray-500 mt-0.5">{s.card_metric_dist}</div>
                </div>
                <div className="bg-white/5 rounded-lg py-2">
                  <div className="text-sm font-black font-mono" style={{ color: c.color }}>{c.util}%</div>
                  <div className="text-[9px] text-gray-500 mt-0.5">{s.card_metric_util}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ══ TREND CHARTS ══ */}
      <Section id="trends" eyebrow={s.charts_eyebrow} title={s.charts_title} subtitle={s.charts_sub}>
        <div className="grid md:grid-cols-2 gap-4">
          <TrendChart points={flowSeries} color={ACCENT} title={s.chart_flow_title} unit="" reduce={reduce} max={320} />
          <TrendChart points={emisSeries} color="#22c55e" title={s.chart_emis_title} unit="" reduce={reduce} max={100} />
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
            className="rounded-2xl border border-[#00d4ff]/20 p-8 text-center bg-gradient-to-b from-[#00d4ff]/5 to-transparent"
          >
            <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-5 bg-[#00d4ff]/10 text-[#00d4ff]">
              <Anchor size={26} />
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
                style={{ borderColor: ACCENT + '4d' }}
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

// ─── Small detail row ───────────────────────────────────────────────────────────

function Row({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-400">{label}</span>
      <span className="font-mono font-semibold" style={{ color: color ?? '#e5e7eb' }}>{value}</span>
    </div>
  );
}

// ─── Tiny inline anchor glyph for port nodes ────────────────────────────────────

function Anchor2({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g transform={`translate(${x - 6}, ${y - 6}) scale(0.5)`} stroke={color} strokeWidth={2} fill="none"
      strokeLinecap="round" strokeLinejoin="round" pointerEvents="none">
      <circle cx="12" cy="5" r="3" />
      <line x1="12" y1="22" x2="12" y2="8" />
      <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
    </g>
  );
}
