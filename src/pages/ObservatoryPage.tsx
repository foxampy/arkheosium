import { useState, useMemo, useRef } from 'react';
import { useLocation } from 'wouter';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, Satellite, Radar, Radio, Plane, Leaf, Droplets,
  Wind, Thermometer, TrendingUp, TrendingDown, FileText, Compass,
  Gauge, Activity, Eye, Layers, AlertTriangle, Waves,
} from 'lucide-react';

// ══════════════════════════════════════════════════════════════════════════════
//  ArkheOSium — Planetary Observatory (Earth observation / remote sensing hub)
//  Route: /observatory
// ══════════════════════════════════════════════════════════════════════════════

const ACCENT = '#818cf8';
const ACCENT2 = '#22d3ee';

const GRID_COLS = 18;
const GRID_ROWS = 11;
const CELL_COUNT = GRID_COLS * GRID_ROWS;
const FRAMES = 8; // time-scrubber steps 2019 → 2026

// ─── i18n (self-contained, bilingual) ───────────────────────────────────────────

const STRINGS = {
  ru: {
    back: 'Назад к дорожной карте',
    doc_label: 'Планетарная обсерватория',
    eyebrow: 'Наблюдение Земли',
    hero_title: 'Планетарная обсерватория',
    hero_accent: 'Дистанционное зондирование Приаралья',
    hero_lead:
      'Единый центр наблюдения Земли над бассейном Арала. Спутники, радар и наземные датчики сливаются в живую карту. Выбирайте слой данных и двигайте время — сцена оживает.',
    kpi_sats: 'Активных сенсоров',
    kpi_area: 'Площадь мониторинга, км²',
    kpi_data: 'Поток данных, ТБ/сут',
    kpi_alerts: 'Активных тревог',
    console_eyebrow: 'Цифровой двойник наблюдения',
    console_title: 'Консоль мониторинга',
    console_sub:
      'Каждая ячейка — участок съёмки. Выберите слой данных, затем двигайте временной ползунок: значения слоя перестраиваются от 2019 к 2026 году.',
    layer_label: 'Слой данных',
    time_label: 'Временной срез',
    layer_ndvi: 'Растительность (NDVI)',
    layer_water: 'Поверхностные воды',
    layer_dust: 'Пыль / аэрозоль',
    layer_temp: 'Температура поверхности',
    legend_low: 'Низкое',
    legend_mid: 'Среднее',
    legend_high: 'Высокое',
    tip_cell: 'Участок',
    tip_value: 'Значение',
    tip_conf: 'Достоверность',
    tip_rev: 'Ревизит',
    net_eyebrow: 'Сеть сенсоров',
    net_title: 'Источники данных',
    net_sub:
      'Включайте источники наблюдения — они расширяют покрытие, повышают разрешение и учащают ревизит. Метрики пересчитываются мгновенно.',
    net_coverage: 'Покрытие',
    net_res: 'Разрешение',
    net_revisit: 'Ревизит',
    net_active: 'источников активно',
    charts_eyebrow: 'Динамика',
    charts_title: 'Тренды наблюдения',
    charts_sub:
      'Площадь водной поверхности восстанавливается, индекс растительности растёт. Кривые перестраиваются вслед за выбранным слоем и временным срезом.',
    chart_water_title: 'Площадь водной поверхности',
    chart_veg_title: 'Индекс растительности',
    src_optical_t: 'Оптические спутники',
    src_optical_d: 'Мультиспектральная съёмка Sentinel-2 / Landsat. NDVI, вода, пыль.',
    src_sar_t: 'Радар (SAR)',
    src_sar_d: 'Всепогодная радарная съёмка Sentinel-1. Работает ночью и сквозь облака.',
    src_ground_t: 'Наземные станции',
    src_ground_d: 'Сеть метео- и гидропостов. Калибровка спутниковых данных.',
    src_drone_t: 'Дроновые облёты',
    src_drone_d: 'БПЛА для точечной съёмки высокого разрешения над очагами.',
    cta_title: 'Обсерватория — глаза планетарной ОС',
    cta_sub: 'Как непрерывное наблюдение Земли встраивается в дорожную карту и архитектуру платформы ArkheOSium.',
    cta_roadmap: 'Дорожная карта',
    cta_wp: 'Полный whitepaper',
    copyright: '© ArkheOSium — Planetary Infrastructure OS. Данные демонстрационные.',
    years_note: 'Годы: 2019 → 2026',
  },
  en: {
    back: 'Back to roadmap',
    doc_label: 'Planetary Observatory',
    eyebrow: 'Earth observation',
    hero_title: 'Planetary Observatory',
    hero_accent: 'Remote sensing of the Aral region',
    hero_lead:
      'A unified Earth-observation hub over the Aral basin. Satellites, radar and ground sensors fuse into a living map. Pick a data layer and drag time — the scene comes alive.',
    kpi_sats: 'Active sensors',
    kpi_area: 'Monitored area, km²',
    kpi_data: 'Data throughput, TB/day',
    kpi_alerts: 'Active alerts',
    console_eyebrow: 'Observation digital twin',
    console_title: 'Monitoring console',
    console_sub:
      'Each cell is an imaging plot. Choose a data layer, then drag the time slider: layer values redraw from 2019 to 2026.',
    layer_label: 'Data layer',
    time_label: 'Time slice',
    layer_ndvi: 'Vegetation (NDVI)',
    layer_water: 'Surface water',
    layer_dust: 'Dust / aerosol',
    layer_temp: 'Surface temperature',
    legend_low: 'Low',
    legend_mid: 'Mid',
    legend_high: 'High',
    tip_cell: 'Plot',
    tip_value: 'Value',
    tip_conf: 'Confidence',
    tip_rev: 'Revisit',
    net_eyebrow: 'Sensor network',
    net_title: 'Data sources',
    net_sub:
      'Toggle observation sources — they widen coverage, raise resolution and shorten revisit time. Metrics recompute instantly.',
    net_coverage: 'Coverage',
    net_res: 'Resolution',
    net_revisit: 'Revisit',
    net_active: 'sources active',
    charts_eyebrow: 'Dynamics',
    charts_title: 'Observation trends',
    charts_sub:
      'Surface-water area recovers while the vegetation index rises. Curves redraw with the selected layer and time slice.',
    chart_water_title: 'Surface-water area',
    chart_veg_title: 'Vegetation index',
    src_optical_t: 'Optical satellites',
    src_optical_d: 'Multispectral Sentinel-2 / Landsat imagery. NDVI, water, dust.',
    src_sar_t: 'Radar (SAR)',
    src_sar_d: 'All-weather Sentinel-1 radar. Works at night and through cloud.',
    src_ground_t: 'Ground stations',
    src_ground_d: 'Network of weather and hydro posts. Calibrates satellite data.',
    src_drone_t: 'Drone surveys',
    src_drone_d: 'UAVs for targeted high-resolution imaging over hotspots.',
    cta_title: 'The observatory is the eyes of the planetary OS',
    cta_sub: 'How continuous Earth observation fits into the roadmap and the ArkheOSium platform architecture.',
    cta_roadmap: 'Roadmap',
    cta_wp: 'Full whitepaper',
    copyright: '© ArkheOSium — Planetary Infrastructure OS. Data is illustrative.',
    years_note: 'Years: 2019 → 2026',
  },
  kk: {
    back: 'Жол картасына оралу',
    doc_label: 'Планеталық обсерватория',
    eyebrow: 'Жерді қашықтан зерттеу',
    hero_title: 'Планеталық обсерватория',
    hero_accent: 'Арал өңірін қашықтан зондтау',
    hero_lead:
      'Арал алабын Жерден бақылаудың біртұтас орталығы. Спутниктер, радар және жердегі датчиктер тірі картаға бірігеді. Дерек қабатын таңдап, уақытты жылжытыңыз — көрініс жанданады.',
    kpi_sats: 'Белсенді сенсорлар',
    kpi_area: 'Мониторинг ауданы, км²',
    kpi_data: 'Дерек ағыны, ТБ/тәул',
    kpi_alerts: 'Белсенді дабылдар',
    console_eyebrow: 'Бақылаудың цифрлық егізі',
    console_title: 'Мониторинг консолі',
    console_sub:
      'Әр ұяшық — түсіру учаскесі. Дерек қабатын таңдап, уақыт жүгірткісін жылжытыңыз: қабат мәндері 2019-дан 2026 жылға дейін қайта құрылады.',
    layer_label: 'Дерек қабаты',
    time_label: 'Уақыт кесіндісі',
    layer_ndvi: 'Өсімдік жамылғысы (NDVI)',
    layer_water: 'Беткі сулар',
    layer_dust: 'Шаң / аэрозоль',
    layer_temp: 'Бет температурасы',
    legend_low: 'Төмен',
    legend_mid: 'Орташа',
    legend_high: 'Жоғары',
    tip_cell: 'Учаске',
    tip_value: 'Мән',
    tip_conf: 'Сенімділік',
    tip_rev: 'Қайта түсіру',
    net_eyebrow: 'Сенсорлар желісі',
    net_title: 'Дерек көздері',
    net_sub:
      'Бақылау көздерін қосыңыз — олар қамтуды кеңейтеді, ажыратымдылықты арттырады және қайта түсіруді жиілетеді. Метрикалар бірден қайта есептеледі.',
    net_coverage: 'Қамту',
    net_res: 'Ажыратымдылық',
    net_revisit: 'Қайта түсіру',
    net_active: 'дерек көзі белсенді',
    charts_eyebrow: 'Динамика',
    charts_title: 'Бақылау трендтері',
    charts_sub:
      'Су бетінің ауданы қалпына келуде, өсімдік индексі өсуде. Қисықтар таңдалған қабат пен уақыт кесіндісіне сай қайта құрылады.',
    chart_water_title: 'Су бетінің ауданы',
    chart_veg_title: 'Өсімдік индексі',
    src_optical_t: 'Оптикалық спутниктер',
    src_optical_d: 'Sentinel-2 / Landsat мультиспектрлік түсірілімі. NDVI, су, шаң.',
    src_sar_t: 'Радар (SAR)',
    src_sar_d: 'Sentinel-1 барлық ауа райындағы радар. Түнде және бұлт арқылы жұмыс істейді.',
    src_ground_t: 'Жердегі станциялар',
    src_ground_d: 'Метео- және гидропосттар желісі. Спутниктік деректерді калибрлеу.',
    src_drone_t: 'Дрон ұшулары',
    src_drone_d: 'Ошақтар үстінде жоғары ажыратымдылықты нүктелік түсіруге арналған ҰША.',
    cta_title: 'Обсерватория — планеталық ОЖ-нің көзі',
    cta_sub: 'Жерді үздіксіз бақылаудың ArkheOSium платформасының жол картасы мен архитектурасына қалай кірігетіні.',
    cta_roadmap: 'Жол картасы',
    cta_wp: 'Толық whitepaper',
    copyright: '© ArkheOSium — Planetary Infrastructure OS. Деректер көрсетілім үшін.',
    years_note: 'Жылдар: 2019 → 2026',
  },
  uz: {
    back: 'Yo‘l xaritasiga qaytish',
    doc_label: 'Planetar rasadxona',
    eyebrow: 'Yerni masofadan zondlash',
    hero_title: 'Planetar rasadxona',
    hero_accent: 'Orol mintaqasini masofadan zondlash',
    hero_lead:
      'Orol havzasi ustidan Yerni kuzatishning yagona markazi. Sun’iy yo‘ldoshlar, radar va yerdagi datchiklar jonli xaritaga birlashadi. Ma’lumot qatlamini tanlang va vaqtni suring — manzara jonlanadi.',
    kpi_sats: 'Faol sensorlar',
    kpi_area: 'Monitoring maydoni, km²',
    kpi_data: 'Ma’lumot oqimi, TB/kun',
    kpi_alerts: 'Faol ogohlantirishlar',
    console_eyebrow: 'Kuzatuvning raqamli egizagi',
    console_title: 'Monitoring konsoli',
    console_sub:
      'Har bir katak — suratga olish uchastkasi. Ma’lumot qatlamini tanlang, so‘ng vaqt slayderini suring: qatlam qiymatlari 2019 dan 2026 yilgacha qayta chiziladi.',
    layer_label: 'Ma’lumot qatlami',
    time_label: 'Vaqt kesimi',
    layer_ndvi: 'O‘simliklar qoplami (NDVI)',
    layer_water: 'Yuza suvlari',
    layer_dust: 'Chang / aerozol',
    layer_temp: 'Yuza harorati',
    legend_low: 'Past',
    legend_mid: 'O‘rta',
    legend_high: 'Yuqori',
    tip_cell: 'Uchastka',
    tip_value: 'Qiymat',
    tip_conf: 'Ishonchlilik',
    tip_rev: 'Qayta suratga olish',
    net_eyebrow: 'Sensorlar tarmog‘i',
    net_title: 'Ma’lumot manbalari',
    net_sub:
      'Kuzatuv manbalarini yoqing — ular qamrovni kengaytiradi, aniqlikni oshiradi va qayta suratga olishni tezlashtiradi. Ko‘rsatkichlar bir zumda qayta hisoblanadi.',
    net_coverage: 'Qamrov',
    net_res: 'Aniqlik',
    net_revisit: 'Qayta tashrif',
    net_active: 'manba faol',
    charts_eyebrow: 'Dinamika',
    charts_title: 'Kuzatuv tendensiyalari',
    charts_sub:
      'Suv yuzasi maydoni tiklanmoqda, o‘simlik indeksi esa o‘smoqda. Egri chiziqlar tanlangan qatlam va vaqt kesimiga qarab qayta chiziladi.',
    chart_water_title: 'Suv yuzasi maydoni',
    chart_veg_title: 'O‘simlik indeksi',
    src_optical_t: 'Optik sun’iy yo‘ldoshlar',
    src_optical_d: 'Sentinel-2 / Landsat multispektral suratlari. NDVI, suv, chang.',
    src_sar_t: 'Radar (SAR)',
    src_sar_d: 'Har qanday ob-havoda Sentinel-1 radari. Tunda va bulut orqali ishlaydi.',
    src_ground_t: 'Yerdagi stansiyalar',
    src_ground_d: 'Meteo- va gidropostlar tarmog‘i. Sun’iy yo‘ldosh ma’lumotlarini kalibrlaydi.',
    src_drone_t: 'Dron uchishlari',
    src_drone_d: 'O‘choqlar ustida yuqori aniqlikdagi nuqtaviy suratga olish uchun UUA.',
    cta_title: 'Rasadxona — planetar OT ning ko‘zlari',
    cta_sub: 'Yerni uzluksiz kuzatish ArkheOSium platformasining yo‘l xaritasi va arxitekturasiga qanday integratsiyalashuvi.',
    cta_roadmap: 'Yo‘l xaritasi',
    cta_wp: 'To‘liq whitepaper',
    copyright: '© ArkheOSium — Planetary Infrastructure OS. Ma’lumotlar namoyish uchun.',
    years_note: 'Yillar: 2019 → 2026',
  },
  ar: {
    back: 'العودة إلى خارطة الطريق',
    doc_label: 'المرصد الكوكبي',
    eyebrow: 'رصد الأرض',
    hero_title: 'المرصد الكوكبي',
    hero_accent: 'الاستشعار عن بُعد لمنطقة بحر آرال',
    hero_lead:
      'مركز موحد لرصد الأرض فوق حوض بحر آرال. تندمج الأقمار الصناعية والرادار وأجهزة الاستشعار الأرضية في خريطة حية. اختر طبقة بيانات وحرّك الزمن — ينبض المشهد بالحياة.',
    kpi_sats: 'أجهزة استشعار نشطة',
    kpi_area: 'مساحة الرصد، كم²',
    kpi_data: 'تدفق البيانات، تيرابايت/يوم',
    kpi_alerts: 'تنبيهات نشطة',
    console_eyebrow: 'التوأم الرقمي للرصد',
    console_title: 'وحدة تحكم المراقبة',
    console_sub:
      'كل خلية هي قطعة تصوير. اختر طبقة بيانات، ثم حرّك شريط الزمن: تُعاد رسم قيم الطبقة من 2019 إلى 2026.',
    layer_label: 'طبقة البيانات',
    time_label: 'الشريحة الزمنية',
    layer_ndvi: 'الغطاء النباتي (NDVI)',
    layer_water: 'المياه السطحية',
    layer_dust: 'الغبار / الهباء الجوي',
    layer_temp: 'حرارة السطح',
    legend_low: 'منخفض',
    legend_mid: 'متوسط',
    legend_high: 'مرتفع',
    tip_cell: 'قطعة',
    tip_value: 'القيمة',
    tip_conf: 'الموثوقية',
    tip_rev: 'إعادة الزيارة',
    net_eyebrow: 'شبكة أجهزة الاستشعار',
    net_title: 'مصادر البيانات',
    net_sub:
      'فعّل مصادر الرصد — فهي توسّع التغطية وترفع الدقة وتقصّر زمن إعادة الزيارة. تُعاد حساب المقاييس فورًا.',
    net_coverage: 'التغطية',
    net_res: 'الدقة',
    net_revisit: 'إعادة الزيارة',
    net_active: 'مصدر نشط',
    charts_eyebrow: 'الديناميكيات',
    charts_title: 'اتجاهات الرصد',
    charts_sub:
      'تتعافى مساحة المياه السطحية بينما يرتفع مؤشر الغطاء النباتي. تُعاد رسم المنحنيات وفق الطبقة المختارة والشريحة الزمنية.',
    chart_water_title: 'مساحة المياه السطحية',
    chart_veg_title: 'مؤشر الغطاء النباتي',
    src_optical_t: 'الأقمار الصناعية البصرية',
    src_optical_d: 'تصوير متعدد الأطياف من Sentinel-2 / Landsat. الغطاء النباتي والمياه والغبار.',
    src_sar_t: 'الرادار (SAR)',
    src_sar_d: 'رادار Sentinel-1 لجميع الأحوال الجوية. يعمل ليلًا وعبر الغيوم.',
    src_ground_t: 'المحطات الأرضية',
    src_ground_d: 'شبكة محطات الأرصاد والهيدرولوجيا. تعاير البيانات الفضائية.',
    src_drone_t: 'رحلات الطائرات المسيّرة',
    src_drone_d: 'طائرات مسيّرة للتصوير النقطي عالي الدقة فوق البؤر الساخنة.',
    cta_title: 'المرصد هو عيون نظام التشغيل الكوكبي',
    cta_sub: 'كيف يندمج رصد الأرض المستمر في خارطة الطريق وبنية منصة ArkheOSium.',
    cta_roadmap: 'خارطة الطريق',
    cta_wp: 'الورقة البيضاء الكاملة',
    copyright: '© ArkheOSium — Planetary Infrastructure OS. البيانات توضيحية.',
    years_note: 'السنوات: 2019 ← 2026',
  },
} as const;

// ─── Types ───────────────────────────────────────────────────────────────────────

type LayerId = 'ndvi' | 'water' | 'dust' | 'temp';

interface CellMeta {
  idx: number;
  col: number;
  row: number;
  seed: number; // deterministic 0..1
  waterCore: number; // proximity to the lake basin (0..1)
}

interface LayerDef {
  id: LayerId;
  Icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  color: string;
  labelKey: 'layer_ndvi' | 'layer_water' | 'layer_dust' | 'layer_temp';
}

interface SensorSource {
  id: string;
  Icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  color: string;
  titleKey: 'src_optical_t' | 'src_sar_t' | 'src_ground_t' | 'src_drone_t';
  descKey: 'src_optical_d' | 'src_sar_d' | 'src_ground_d' | 'src_drone_d';
  coverage: number; // km² added
  res: number; // resolution boost factor (higher = finer)
  revisit: number; // revisit-hours reduction
}

// ─── Deterministic pseudo-random (no per-frame arrays) ──────────────────────────

function hash(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function lerp(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * t);
}

// ─── Layer palettes: 0 (low) → 1 (high) → RGB ────────────────────────────────────

function layerColor(layer: LayerId, v: number): string {
  const t = Math.max(0, Math.min(1, v));
  switch (layer) {
    case 'ndvi': // barren tan → lush green
      return t < 0.5
        ? `rgb(${lerp(120, 190, t / 0.5)}, ${lerp(96, 176, t / 0.5)}, ${lerp(58, 66, t / 0.5)})`
        : `rgb(${lerp(190, 34, (t - 0.5) / 0.5)}, ${lerp(176, 160, (t - 0.5) / 0.5)}, ${lerp(66, 72, (t - 0.5) / 0.5)})`;
    case 'water': // dry sand → deep cyan/blue
      return t < 0.5
        ? `rgb(${lerp(150, 60, t / 0.5)}, ${lerp(132, 150, t / 0.5)}, ${lerp(90, 190, t / 0.5)})`
        : `rgb(${lerp(60, 14, (t - 0.5) / 0.5)}, ${lerp(150, 110, (t - 0.5) / 0.5)}, ${lerp(190, 220, (t - 0.5) / 0.5)})`;
    case 'dust': // clear teal → hazy amber/red
      return t < 0.5
        ? `rgb(${lerp(30, 210, t / 0.5)}, ${lerp(140, 170, t / 0.5)}, ${lerp(130, 70, t / 0.5)})`
        : `rgb(${lerp(210, 200, (t - 0.5) / 0.5)}, ${lerp(170, 70, (t - 0.5) / 0.5)}, ${lerp(70, 50, (t - 0.5) / 0.5)})`;
    case 'temp': // cool blue → hot red
    default:
      return t < 0.5
        ? `rgb(${lerp(40, 235, t / 0.5)}, ${lerp(90, 200, t / 0.5)}, ${lerp(210, 90, t / 0.5)})`
        : `rgb(${lerp(235, 210, (t - 0.5) / 0.5)}, ${lerp(200, 44, (t - 0.5) / 0.5)}, ${lerp(90, 38, (t - 0.5) / 0.5)})`;
  }
}

const LAYERS: LayerDef[] = [
  { id: 'ndvi', Icon: Leaf, color: '#22c55e', labelKey: 'layer_ndvi' },
  { id: 'water', Icon: Droplets, color: ACCENT2, labelKey: 'layer_water' },
  { id: 'dust', Icon: Wind, color: '#fbbf24', labelKey: 'layer_dust' },
  { id: 'temp', Icon: Thermometer, color: '#f87171', labelKey: 'layer_temp' },
];

const SOURCES: SensorSource[] = [
  { id: 'optical', Icon: Satellite, color: ACCENT, titleKey: 'src_optical_t', descKey: 'src_optical_d', coverage: 178000, res: 10, revisit: 5 },
  { id: 'sar', Icon: Radar, color: ACCENT2, titleKey: 'src_sar_t', descKey: 'src_sar_d', coverage: 142000, res: 6, revisit: 6 },
  { id: 'ground', Icon: Radio, color: '#22c55e', titleKey: 'src_ground_t', descKey: 'src_ground_d', coverage: 24000, res: 1, revisit: 2 },
  { id: 'drone', Icon: Plane, color: '#fbbf24', titleKey: 'src_drone_t', descKey: 'src_drone_d', coverage: 8000, res: 40, revisit: 1 },
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
  points, color, title, unit, reduce,
}: {
  points: number[]; color: string; title: string; unit: string; reduce: boolean;
}) {
  const W = 480;
  const H = 160;
  const PAD = 8;
  const max = 100;
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

// ══════════════════════════════════════════════════════════════════════════════

export default function ObservatoryPage() {
  const [, navigate] = useLocation();
  const { i18n } = useTranslation();
  const reduce = useReducedMotion() ?? false;
  const lang = (i18n.language || 'ru').slice(0, 2);
  const s = (STRINGS as Record<string, typeof STRINGS.ru>)[lang] ?? STRINGS.ru;

  const [layer, setLayer] = useState<LayerId>('water');
  const [frame, setFrame] = useState(FRAMES - 1); // default = latest year
  const [active, setActive] = useState<Record<string, boolean>>({ optical: true, sar: true });
  const [hover, setHover] = useState<{ meta: CellMeta; val: number; x: number; y: number } | null>(null);

  // Memoized static grid metadata (never recreated per render)
  const cells = useMemo<CellMeta[]>(() => {
    const cx = GRID_COLS * 0.42;
    const cy = GRID_ROWS * 0.44;
    return Array.from({ length: CELL_COUNT }, (_, idx) => {
      const col = idx % GRID_COLS;
      const row = Math.floor(idx / GRID_COLS);
      // Elliptical basin footprint — the former Aral lake bed.
      const dx = (col - cx) / (GRID_COLS * 0.34);
      const dy = (row - cy) / (GRID_ROWS * 0.4);
      const dist = Math.sqrt(dx * dx + dy * dy);
      const waterCore = Math.max(0, 1 - dist);
      return { idx, col, row, seed: hash(idx * 1.7 + 4.2), waterCore };
    });
  }, []);

  // Time fraction 0..1 across frames
  const timeT = frame / (FRAMES - 1);

  // Sensor-network derived metrics
  const netActive = SOURCES.filter((src) => active[src.id]);
  const activeCount = netActive.length;
  const coverage = netActive.reduce((a, src) => a + src.coverage, 0);
  const bestRes = netActive.reduce((a, src) => Math.max(a, src.res), 0); // finer number = better
  const revisitCut = netActive.reduce((a, src) => a + src.revisit, 0);
  const revisitHrs = Math.max(6, 96 - revisitCut * 8); // hours between passes
  // Confidence rises with more independent sources.
  const confidence = Math.min(0.99, 0.4 + activeCount * 0.15);

  // Per-cell layer value in [0,1], evolving with the time scrubber.
  function cellValue(meta: CellMeta, ly: LayerId, t: number): number {
    const noise = meta.seed;
    switch (ly) {
      case 'water':
        // Basin refills over time; edges gain first.
        return Math.max(0, Math.min(1, meta.waterCore * (0.25 + t * 0.75) + noise * 0.12 - 0.06));
      case 'ndvi':
        // Vegetation recovers on the exposed rim (moderate waterCore) as time advances.
        return Math.max(0, Math.min(1, (0.15 + t * 0.55) * (0.4 + (1 - Math.abs(meta.waterCore - 0.45)) * 0.9) + noise * 0.15 - 0.05));
      case 'dust':
        // Dust storms subside over time, strongest on dry outer flats.
        return Math.max(0, Math.min(1, (1 - meta.waterCore) * (0.9 - t * 0.55) + noise * 0.14 - 0.05));
      case 'temp':
      default:
        // Surface cools where water returns; hotter on bare land, easing over time.
        return Math.max(0, Math.min(1, (1 - meta.waterCore) * (0.85 - t * 0.3) + noise * 0.16 - 0.04));
    }
  }

  const curLayer = LAYERS.find((l) => l.id === layer)!;

  // Derived KPIs (respond to network + time)
  const kpiSats = 8 + activeCount * 4 + (active.drone ? 6 : 0);
  const kpiArea = Math.round(coverage).toLocaleString('ru-RU');
  const kpiData = (2.4 + activeCount * 1.7 + (active.sar ? 1.2 : 0)).toFixed(1);
  // Alerts: dust + heat pressure fall over time and with denser observation.
  const kpiAlerts = Math.max(0, Math.round(34 - timeT * 20 - activeCount * 2));

  // Trend series (2019→2026). Water area rises, veg index rises.
  const waterSeries = useMemo(
    () => Array.from({ length: FRAMES }, (_, i) => {
      const t = i / (FRAMES - 1);
      return 14 + t * 58 + (layer === 'water' ? 6 : 0);
    }),
    [layer],
  );
  const vegSeries = useMemo(
    () => Array.from({ length: FRAMES }, (_, i) => {
      const t = i / (FRAMES - 1);
      return 8 + t * 46 + (layer === 'ndvi' ? 8 : 0);
    }),
    [layer],
  );

  return (
    <div className="min-h-screen text-gray-200">

      {/* ── Top bar ── */}
      <div className="sticky top-0 z-40 bg-[#000818]/95 backdrop-blur border-b border-white/5 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate('/roadmap')}
          className="flex items-center gap-2 text-sm text-[#818cf8]/70 hover:text-[#818cf8] transition-colors flex-shrink-0"
        >
          <ArrowLeft size={16} /> {s.back}
        </button>
        <div className="flex items-center gap-2 text-sm text-gray-400 flex-shrink-0">
          <Eye size={14} />
          <span className="hidden sm:inline">{s.doc_label}</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => navigate('/whitepaper-full')}
            className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border border-[#818cf8]/30 text-[#818cf8] hover:bg-[#818cf8]/10 transition-colors"
          >
            <FileText size={12} /> {s.cta_wp}
          </button>
        </div>
      </div>

      {/* ══ HERO ══ */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a2a]/40 via-[#00153a]/30 to-[#000818]" />
          {!reduce && (
            <>
              <motion.div
                className="absolute -top-20 right-0 w-[560px] h-[340px] rounded-full bg-[#818cf8]/10 blur-3xl"
                animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
                transition={{ duration: 13, repeat: Infinity }}
              />
              <motion.div
                className="absolute bottom-0 left-1/4 w-[440px] h-[220px] rounded-full bg-[#22d3ee]/10 blur-3xl"
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
            <div className="flex items-center gap-2 text-xs text-[#818cf8] bg-[#818cf8]/10 border border-[#818cf8]/20 rounded-full px-3 py-1 mb-6 w-fit">
              <Satellite size={11} /> {s.eyebrow}
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white mb-5 tracking-tight leading-[0.98]">
              {s.hero_title}
              <br />
              <span className="bg-gradient-to-r from-[#818cf8] via-[#22d3ee] to-[#00d4ff] bg-clip-text text-transparent text-2xl md:text-4xl">
                {s.hero_accent}
              </span>
            </h1>

            <p className="text-gray-400 text-base md:text-lg mb-8 max-w-2xl leading-relaxed">
              {s.hero_lead}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl">
              <KpiTile Icon={Satellite} val={String(kpiSats)} label={s.kpi_sats} color={ACCENT} trend="up" />
              <KpiTile Icon={Layers} val={kpiArea} label={s.kpi_area} color={ACCENT2} trend="up" />
              <KpiTile Icon={Activity} val={kpiData} label={s.kpi_data} color="#22c55e" trend="up" />
              <KpiTile Icon={AlertTriangle} val={String(kpiAlerts)} label={s.kpi_alerts} color="#f87171" trend="down" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ MONITORING CONSOLE (centerpiece) ══ */}
      <Section id="console" eyebrow={s.console_eyebrow} title={s.console_title} subtitle={s.console_sub}>
        <div className="bg-[#000d24] border border-white/10 rounded-2xl p-4 md:p-6">

          {/* Layer selector */}
          <div className="mb-5">
            <label className="text-xs font-semibold uppercase tracking-widest block mb-2" style={{ color: ACCENT }}>
              {s.layer_label}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {LAYERS.map((ly) => {
                const on = ly.id === layer;
                return (
                  <button
                    key={ly.id}
                    onClick={() => setLayer(ly.id)}
                    className="flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition-all"
                    style={{
                      borderColor: on ? ly.color + '80' : 'rgba(255,255,255,0.1)',
                      background: on ? `linear-gradient(135deg, ${ly.color}22, transparent)` : 'rgba(255,255,255,0.02)',
                    }}
                  >
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: ly.color + '1f', color: ly.color }}>
                      <ly.Icon size={16} />
                    </span>
                    <span className="text-[11px] sm:text-xs font-semibold" style={{ color: on ? '#fff' : '#9ca3af' }}>
                      {s[ly.labelKey]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time scrubber */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: ACCENT2 }}>
                {s.time_label}
              </label>
              <span className="font-mono text-sm font-bold" style={{ color: ACCENT2 }}>
                {2019 + frame}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={FRAMES - 1}
              value={frame}
              onChange={(e) => setFrame(Number(e.target.value))}
              className="w-full accent-[#22d3ee] cursor-pointer"
              aria-label={s.time_label}
            />
            <div className="flex justify-between text-[10px] text-gray-600 font-mono mt-1">
              <span>2019</span><span>2026</span>
            </div>
          </div>

          {/* Grid heatmap */}
          <div className="relative">
            <div
              className="grid gap-[2px] rounded-xl overflow-hidden"
              style={{ gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))` }}
              onMouseLeave={() => setHover(null)}
            >
              {cells.map((meta) => {
                const v = cellValue(meta, layer, timeT);
                return (
                  <div
                    key={meta.idx}
                    className="aspect-square rounded-[2px] cursor-pointer"
                    style={{
                      backgroundColor: layerColor(layer, v),
                      transition: reduce ? 'none' : 'background-color 0.5s ease',
                      opacity: 0.92,
                    }}
                    onMouseEnter={(e) => {
                      const rect = (e.currentTarget.closest('.relative') as HTMLElement)?.getBoundingClientRect();
                      const cr = e.currentTarget.getBoundingClientRect();
                      setHover({
                        meta,
                        val: v,
                        x: cr.left - (rect?.left ?? 0) + cr.width / 2,
                        y: cr.top - (rect?.top ?? 0),
                      });
                    }}
                  />
                );
              })}
            </div>

            {/* Tooltip */}
            {hover && (
              <div
                className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full mb-1 w-44 bg-[#000818] border border-white/15 rounded-lg p-3 shadow-xl"
                style={{ left: hover.x, top: hover.y - 6 }}
              >
                <div className="text-[11px] text-gray-500 mb-2">
                  {s.tip_cell} R{hover.meta.row + 1}·C{hover.meta.col + 1}
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-gray-400">{s[curLayer.labelKey]}</span>
                    <span className="font-mono" style={{ color: curLayer.color }}>{Math.round(hover.val * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">{s.tip_conf}</span>
                    <span className="font-mono text-emerald-400">{Math.round(confidence * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">{s.tip_rev}</span>
                    <span className="font-mono text-cyan-400">{revisitHrs}ч</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between mt-5 flex-wrap gap-3">
            <div className="flex items-center gap-5 flex-wrap text-[11px] text-gray-400">
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-[3px]" style={{ backgroundColor: layerColor(layer, 0) }} /> {s.legend_low}
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-[3px]" style={{ backgroundColor: layerColor(layer, 0.5) }} /> {s.legend_mid}
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-[3px]" style={{ backgroundColor: layerColor(layer, 1) }} /> {s.legend_high}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono" style={{ color: curLayer.color }}>
              <curLayer.Icon size={13} /> {s[curLayer.labelKey]}
            </div>
          </div>
        </div>
      </Section>

      {/* ══ SENSOR NETWORK ══ */}
      <Section id="network" eyebrow={s.net_eyebrow} title={s.net_title} subtitle={s.net_sub}>
        <div className="grid sm:grid-cols-2 gap-3 mb-6">
          {SOURCES.map((src) => {
            const on = !!active[src.id];
            return (
              <button
                key={src.id}
                onClick={() => setActive((p) => ({ ...p, [src.id]: !p[src.id] }))}
                className="text-left rounded-2xl border p-4 transition-all"
                style={{
                  borderColor: on ? src.color + '80' : 'rgba(255,255,255,0.1)',
                  background: on ? `linear-gradient(135deg, ${src.color}18, transparent)` : 'rgba(255,255,255,0.02)',
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: src.color + '1f', color: src.color }}>
                    <src.Icon size={18} />
                  </div>
                  <span
                    className="w-9 h-5 rounded-full flex items-center transition-all px-0.5"
                    style={{ background: on ? src.color : 'rgba(255,255,255,0.12)', justifyContent: on ? 'flex-end' : 'flex-start' }}
                  >
                    <span className="w-4 h-4 rounded-full bg-white block" />
                  </span>
                </div>
                <div className="text-sm font-semibold text-white">{s[src.titleKey]}</div>
                <div className="text-[11px] text-gray-400 mt-1 leading-relaxed">{s[src.descKey]}</div>
              </button>
            );
          })}
        </div>

        <div className="grid sm:grid-cols-4 gap-3">
          <div className="bg-[#000d24] border border-white/10 rounded-2xl p-4">
            <div className="text-[11px] text-gray-500 mb-1">{s.net_coverage}</div>
            <div className="text-2xl font-black font-mono" style={{ color: ACCENT2 }}>{Math.round(coverage / 1000)}K</div>
            <div className="text-[10px] text-gray-600 mt-0.5">км²</div>
          </div>
          <div className="bg-[#000d24] border border-white/10 rounded-2xl p-4">
            <div className="text-[11px] text-gray-500 mb-1">{s.net_res}</div>
            <div className="text-2xl font-black font-mono" style={{ color: '#22c55e' }}>{bestRes || '—'}</div>
            <div className="text-[10px] text-gray-600 mt-0.5">{bestRes ? 'см/px' : ''}</div>
          </div>
          <div className="bg-[#000d24] border border-white/10 rounded-2xl p-4">
            <div className="text-[11px] text-gray-500 mb-1">{s.net_revisit}</div>
            <div className="text-2xl font-black font-mono" style={{ color: '#fbbf24' }}>{revisitHrs}</div>
            <div className="text-[10px] text-gray-600 mt-0.5">ч</div>
          </div>
          <div className="bg-[#000d24] border border-white/10 rounded-2xl p-4">
            <div className="text-[11px] text-gray-500 mb-1">{s.net_active}</div>
            <div className="text-2xl font-black font-mono" style={{ color: ACCENT }}>{activeCount}/{SOURCES.length}</div>
          </div>
        </div>
      </Section>

      {/* ══ TREND CHARTS ══ */}
      <Section id="trends" eyebrow={s.charts_eyebrow} title={s.charts_title} subtitle={s.charts_sub}>
        <div className="grid md:grid-cols-2 gap-4">
          <TrendChart points={waterSeries} color={ACCENT2} title={s.chart_water_title} unit="%" reduce={reduce} />
          <TrendChart points={vegSeries} color="#22c55e" title={s.chart_veg_title} unit="%" reduce={reduce} />
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
            className="rounded-2xl border border-[#818cf8]/20 p-8 text-center bg-gradient-to-b from-[#818cf8]/5 to-transparent"
          >
            <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-5 bg-[#818cf8]/10 text-[#818cf8]">
              <Gauge size={26} />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white mb-3">{s.cta_title}</h2>
            <p className="text-gray-400 text-sm md:text-base mb-7 max-w-xl mx-auto leading-relaxed">{s.cta_sub}</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => navigate('/roadmap')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#818cf8]/10 border border-[#818cf8]/30 text-[#818cf8] hover:bg-[#818cf8]/20 transition-colors text-sm font-medium"
              >
                <Compass size={14} /> {s.cta_roadmap}
              </button>
              <button
                onClick={() => navigate('/whitepaper-full')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#22d3ee]/10 border border-[#22d3ee]/30 text-[#22d3ee] hover:bg-[#22d3ee]/20 transition-colors text-sm font-medium"
                style={{ borderColor: ACCENT2 + '4d' }}
              >
                <FileText size={14} /> {s.cta_wp}
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-8">{s.copyright}</p>
          </motion.div>
        </div>
      </section>

      {/* keep Waves + Radio icons referenced for potential legend use */}
      <span className="hidden"><Waves size={0} /></span>
    </div>
  );
}
