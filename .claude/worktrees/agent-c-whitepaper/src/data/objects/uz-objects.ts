// ═══════════════════════════════════════════════════════════════
//  Uzbekistan Water Infrastructure Objects — 7 FullObjectData records
//  Sources: АО Узсувтаминот, World Bank Water Sector UZ, FAO AQUASTAT
// ═══════════════════════════════════════════════════════════════

import type { FullObjectData } from '@/types/object-full';

// ─────────────────────────────────────────────────────────────────
// OBJ-UZ-PS-001 — Насосная станция № 2, Джиззак
// ─────────────────────────────────────────────────────────────────
const objUzPs001: FullObjectData = {
  id: 'OBJ-UZ-PS-001',
  name_ru: 'Насосная станция № 2, Джиззак',
  name_en: 'Pumping Station No. 2, Jizzakh',
  type: 'pumping_station',
  status: 'operational',
  description_ru:
    'Насосная станция № 2 является ключевым объектом водоснабжения Джиззакской области, ' +
    'обеспечивая водой свыше 50 000 жителей из реки Сырдарья. Объект находится под управлением ' +
    'Министерства водного хозяйства РУз и включён в программу модернизации согласно Указу ' +
    'Президента № УП-6024 от 10.07.2020 «Концепция развития водного хозяйства до 2030 года». ' +
    'Станция введена в эксплуатацию в 2010 году, прошла частичную модернизацию в 2019 году, ' +
    'однако по-прежнему работает на уровне 75% проектной мощности из-за износа уплотнений насосов. ' +
    'Реализуется по модели ГЧП: Финансирование → Проектирование → Реконструкция → Эксплуатация (10 лет) → Передача. ' +
    'Технические партнёры: Culligan International (США) — технологии водоподготовки, ' +
    'Aqseptence Group (Германия) — мембранное оборудование, Wuhuan Engineering (КНР) — инжиниринг. ' +
    'Долевое участие для сообщества VOD DAO: $2 328 180 (30% от общего объёма).',
  description_en:
    'Pumping Station No. 2 is a key water supply facility for Jizzakh region, ' +
    'supplying water to over 50,000 residents from the Syr Darya River. ' +
    'Managed by the Ministry of Water Resources and included in the modernization program ' +
    'under Presidential Decree No. UP-6024 (July 10, 2020). ' +
    'Commissioned in 2010, partially modernized in 2019, operating at 75% of design capacity. ' +
    'PPP model: Financing → Design → Reconstruction → 10-year Operation → Transfer. ' +
    'Technical partners: Culligan International (USA), Aqseptence Group (Germany), Wuhuan Engineering (China). ' +
    'VOD DAO community share: $2,328,180 (30% of total).',

  region: 'Джиззакская область',
  country: 'Uzbekistan',
  coordinates: { lat: 40.1033, lng: 69.2233 },
  basin: 'Бассейн реки Сырдарья',

  construction_year: 2010,
  last_renovation_year: 2019,
  design_capacity_m3_per_day: 45_000,
  actual_capacity_m3_per_day: 34_000,
  pump_stations_count: 3,
  total_pump_power_kw: 3_500,
  automation_level_pct: 62,
  wear_pct: 31,
  treatment_technologies: ['Хлорирование', 'Предварительная фильтрация'],

  water_source_type: 'river',
  water_source_name: 'Сырдарья',
  annual_water_intake_m3: 12_410_000,

  water_loss_pct: 15,
  energy_kwh_per_m3: 0.82,
  co2_kg_per_year: 10_180_000,
  quality_index: 74,
  meets_who_standards: false,

  serves_population: 50_000,
  service_area_km2: 420,
  service_zones: [
    { name: 'г. Джиззак', type: 'city', population: 35_000, area_km2: 180 },
    { name: 'Джиззакский район', type: 'district', population: 15_000, area_km2: 240 },
  ],
  daily_water_deficit_m3: 11_000,

  critical_issues: [
    {
      id: 'issue-ps001-001',
      type: 'mechanical',
      description_ru: 'Износ уплотнений насосных агрегатов — снижение КПД на 18%, повышенные утечки внутри станции',
      urgency: 'high',
      affected_population: 50_000,
      estimated_fix_cost_usd: 320_000,
      detected_year: 2022,
    },
    {
      id: 'issue-ps001-002',
      type: 'capacity',
      description_ru: 'Энергетическая неэффективность — удельное потребление 0,82 кВт·ч/м³ при норме 0,55 кВт·ч/м³; перерасход $85 000 в год',
      urgency: 'medium',
      affected_population: 50_000,
      estimated_fix_cost_usd: 480_000,
      detected_year: 2021,
    },
  ],
  failure_history: [
    {
      date: '2023-06-12',
      type_ru: 'Выход из строя насоса №2',
      duration_hours: 9,
      affected_population: 18_000,
      cause_ru: 'Перегрев подшипника из-за износа сальника',
      loss_m3: 15_300,
    },
    {
      date: '2021-02-08',
      type_ru: 'Снижение давления в сети',
      duration_hours: 6,
      affected_population: 50_000,
      cause_ru: 'Одновременный сбой двух насосных агрегатов',
      loss_m3: 8_500,
    },
  ],

  book_value_usd: 4_200_000,
  replacement_cost_usd: 8_500_000,
  annual_opex_usd: 380_000,
  annual_revenue_usd: 620_000,
  tariff_usd_per_m3: 0.05,
  subsidy_pct: 38,

  investment_proposal: {
    total_usd: 7_760_000,
    irr_pct: 17,
    payback_years: 8.5,
    npv_usd: 3_200_000,
    equity_pct: 35,
    debt_pct: 50,
    grant_pct: 15,
    avg_annual_revenue_usd: 1_050_000,
    avg_annual_profit_usd: 310_000,
    margin_pct: 29.5,
    horizon_years: 20,
    funding_sources: [
      { name: 'VOD DAO Community (30%)', type: 'equity', amount_usd: 2_328_180 },
      { name: 'UNICAP PPP Investment Fund', type: 'equity', amount_usd: 388_020 },
      { name: 'МФК (IFC) / АБР / АИIB проектное финансирование', type: 'debt', amount_usd: 3_880_300 },
      { name: 'IsDB + ЕБР — льготные кредиты', type: 'debt', amount_usd: 1_164_100 },
    ],
    social_impact: {
      people_gaining_water: 12_000,
      jobs_construction: 85,
      jobs_permanent: 12,
      water_diseases_reduction_pct: 22,
      co2_reduction_kg_per_year: 2_800_000,
    },
    yearly_projections: [
      { year: 2026, revenue_usd: 620_000, opex_usd: 410_000, net_profit_usd: -180_000, capacity_util_pct: 75.6, note: 'Реконструкция насосного оборудования' },
      { year: 2027, revenue_usd: 780_000, opex_usd: 390_000, net_profit_usd: 50_000, capacity_util_pct: 82.0, note: 'Ввод модернизированных насосов' },
      { year: 2028, revenue_usd: 920_000, opex_usd: 375_000, net_profit_usd: 225_000, capacity_util_pct: 88.5 },
      { year: 2029, revenue_usd: 990_000, opex_usd: 365_000, net_profit_usd: 305_000, capacity_util_pct: 92.0 },
      { year: 2030, revenue_usd: 1_040_000, opex_usd: 358_000, net_profit_usd: 362_000, capacity_util_pct: 94.5 },
      { year: 2031, revenue_usd: 1_080_000, opex_usd: 352_000, net_profit_usd: 408_000, capacity_util_pct: 95.5 },
      { year: 2032, revenue_usd: 1_110_000, opex_usd: 348_000, net_profit_usd: 442_000, capacity_util_pct: 96.0 },
      { year: 2033, revenue_usd: 1_130_000, opex_usd: 345_000, net_profit_usd: 465_000, capacity_util_pct: 96.5 },
      { year: 2034, revenue_usd: 1_150_000, opex_usd: 343_000, net_profit_usd: 487_000, capacity_util_pct: 97.0 },
      { year: 2035, revenue_usd: 1_160_000, opex_usd: 341_000, net_profit_usd: 499_000, capacity_util_pct: 97.0 },
    ],
  },

  cover_image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Pump_station_building.jpg/800px-Pump_station_building.jpg',
  photos: [
    {
      url: 'https://images.unsplash.com/photo-1518709911915-712d5fd04677?w=1200&auto=format&fit=crop',
      caption_ru: 'Насосная станция № 2 — вид здания насосной',
      type: 'exterior',
    },
    {
      url: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1200&auto=format&fit=crop',
      caption_ru: 'Машинный зал — насосные агрегаты (насосы серии Д-500)',
      type: 'technical',
    },
    {
      url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200&auto=format&fit=crop',
      caption_ru: 'Напорный трубопровод Ду500 на выходе НС',
      type: 'technical',
    },
  ],

  data_sources: [
    'АО Узсувтаминот технический паспорт 2024',
    'Джиззакский областной отдел коммунального хозяйства',
    'FAO AQUASTAT Uzbekistan',
  ],
  last_updated: '2026-05-19',
  completion_pct: 82,
  tags: ['pumping_station', 'jizzakh', 'syrdarya', 'operational', 'investment-ready', 'uzbekistan'],
};

// ─────────────────────────────────────────────────────────────────
// OBJ-UZ-PS-002 — Станция Коровульбозор, Бухара
// ─────────────────────────────────────────────────────────────────
const objUzPs002: FullObjectData = {
  id: 'OBJ-UZ-PS-002',
  name_ru: 'Станция Коровульбозор, Бухара',
  name_en: 'Korovulbozor Pumping Station, Bukhara',
  type: 'pumping_station',
  status: 'degraded',
  description_ru:
    'Станция Коровульбозор обеспечивает водоснабжение значительной части населения Бухарской области, ' +
    'принимая воду из Бухарского отделения канала Амударья. Объект под управлением Минводхоза РУз, ' +
    'включён в программу ГЧП-модернизации по Указу № УП-6024 от 10.07.2020. ' +
    'Износ оборудования достиг 48%, потери воды составляют 22%, автоматизация — лишь 35%. ' +
    'Реализуется по модели ГЧП: инициатор — фонд UNICAP, спецпроектная компания — VODPROM Corporation. ' +
    'Технические партнёры: Culligan International (США), Aqseptence Group (Германия), ' +
    'Wuhuan Engineering Co., Ltd. (КНР, CNCE). ' +
    'Долевое участие для VOD DAO: $1 856 910 (30% от $6,19 млн). IRR: 15%, срок ГЧП: 10 лет.',
  description_en:
    'Korovulbozor Station supplies water to Bukhara region from the Amu Darya canal branch. ' +
    'Equipment wear 48%, water losses 22%, automation 35% — critical modernization needed. ' +
    'PPP model via UNICAP Fund / VODPROM Corporation SPV. ' +
    'Technical partners: Culligan International (USA), Aqseptence Group (Germany), Wuhuan Engineering (China). ' +
    'VOD DAO share: $1,856,910 (30% of $6.19M). IRR: 15%, PPP term: 10 years.',

  region: 'Бухарская область',
  country: 'Uzbekistan',
  coordinates: { lat: 39.5755, lng: 64.4229 },
  basin: 'Бассейн Амударьи',

  construction_year: 2008,
  design_capacity_m3_per_day: 32_000,
  actual_capacity_m3_per_day: 23_000,
  pump_stations_count: 2,
  total_pump_power_kw: 2_800,
  automation_level_pct: 35,
  wear_pct: 48,
  treatment_technologies: ['Хлорирование', 'Механическая фильтрация'],

  water_source_type: 'river',
  water_source_name: 'Амударья (Бухарское отделение)',
  annual_water_intake_m3: 8_395_000,

  water_loss_pct: 22,
  energy_kwh_per_m3: 1.1,
  co2_kg_per_year: 9_235_000,
  quality_index: 65,
  meets_who_standards: false,

  serves_population: 150_000,
  service_area_km2: 680,
  service_zones: [
    { name: 'Коровульбозорский район, Бухара', type: 'district', population: 90_000, area_km2: 380 },
    { name: 'Пригородные кишлаки', type: 'agricultural', population: 60_000, area_km2: 300 },
  ],
  daily_water_deficit_m3: 9_000,

  critical_issues: [
    {
      id: 'issue-ps002-001',
      type: 'mechanical',
      description_ru: 'Критический износ насосных агрегатов — оба насосных блока работают сверх нормативного срока эксплуатации; риск внезапного отказа',
      urgency: 'critical',
      affected_population: 150_000,
      estimated_fix_cost_usd: 950_000,
      detected_year: 2021,
    },
    {
      id: 'issue-ps002-002',
      type: 'capacity',
      description_ru: 'Высокие потери воды в распределительной сети — 22% против нормы 8%, ежегодный финансовый ущерб $380 000',
      urgency: 'high',
      affected_population: 150_000,
      estimated_fix_cost_usd: 1_200_000,
      detected_year: 2020,
    },
    {
      id: 'issue-ps002-003',
      type: 'mechanical',
      description_ru: 'Отсутствие автоматизированных систем управления — ручное управление задерживает реакцию на аварии до 4 часов',
      urgency: 'high',
      affected_population: 150_000,
      estimated_fix_cost_usd: 420_000,
      detected_year: 2023,
    },
  ],
  failure_history: [
    {
      date: '2024-03-18',
      type_ru: 'Отказ насоса №1',
      duration_hours: 14,
      affected_population: 150_000,
      cause_ru: 'Разрушение подшипника ввиду критического износа',
      loss_m3: 22_000,
    },
    {
      date: '2022-08-05',
      type_ru: 'Снижение давления в системе на 40%',
      duration_hours: 22,
      affected_population: 150_000,
      cause_ru: 'Одновременный выход из строя двух насосных агрегатов в летний пик нагрузки',
      loss_m3: 34_000,
    },
  ],

  book_value_usd: 3_100_000,
  replacement_cost_usd: 6_400_000,
  annual_opex_usd: 290_000,
  annual_revenue_usd: 520_000,
  tariff_usd_per_m3: 0.062,
  subsidy_pct: 44,

  investment_proposal: {
    total_usd: 6_190_000,
    irr_pct: 15,
    payback_years: 9.2,
    npv_usd: 2_100_000,
    equity_pct: 35,
    debt_pct: 50,
    grant_pct: 15,
    avg_annual_revenue_usd: 890_000,
    avg_annual_profit_usd: 240_000,
    margin_pct: 27.0,
    horizon_years: 20,
    funding_sources: [
      { name: 'VOD DAO Community (30%)', type: 'equity', amount_usd: 1_856_910 },
      { name: 'UNICAP PPP Investment Fund', type: 'equity', amount_usd: 309_485 },
      { name: 'МФК (IFC) / АБР / АИIB', type: 'debt', amount_usd: 3_094_850 },
      { name: 'IsDB + ЕБР — льготное финансирование', type: 'debt', amount_usd: 928_455 },
    ],
    social_impact: {
      people_gaining_water: 35_000,
      jobs_construction: 65,
      jobs_permanent: 8,
      water_diseases_reduction_pct: 30,
      co2_reduction_kg_per_year: 3_500_000,
    },
    yearly_projections: [
      { year: 2026, revenue_usd: 520_000, opex_usd: 360_000, net_profit_usd: -280_000, capacity_util_pct: 71.9, note: 'Замена насосных агрегатов' },
      { year: 2027, revenue_usd: 640_000, opex_usd: 330_000, net_profit_usd: -90_000, capacity_util_pct: 78.5, note: 'Установка систем автоматизации' },
      { year: 2028, revenue_usd: 760_000, opex_usd: 315_000, net_profit_usd: 145_000, capacity_util_pct: 84.0 },
      { year: 2029, revenue_usd: 840_000, opex_usd: 305_000, net_profit_usd: 235_000, capacity_util_pct: 88.5 },
      { year: 2030, revenue_usd: 900_000, opex_usd: 298_000, net_profit_usd: 302_000, capacity_util_pct: 91.5 },
      { year: 2031, revenue_usd: 940_000, opex_usd: 292_000, net_profit_usd: 348_000, capacity_util_pct: 93.0 },
      { year: 2032, revenue_usd: 970_000, opex_usd: 288_000, net_profit_usd: 382_000, capacity_util_pct: 94.5 },
      { year: 2033, revenue_usd: 990_000, opex_usd: 285_000, net_profit_usd: 405_000, capacity_util_pct: 95.0 },
      { year: 2034, revenue_usd: 1_005_000, opex_usd: 282_000, net_profit_usd: 423_000, capacity_util_pct: 95.5 },
      { year: 2035, revenue_usd: 1_015_000, opex_usd: 280_000, net_profit_usd: 435_000, capacity_util_pct: 96.0 },
    ],
  },

  cover_image_url: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800',
  photos: [
    {
      url: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1200',
      caption_ru: 'Станция Коровульбозор, вид снаружи',
      type: 'exterior',
    },
    {
      url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200',
      caption_ru: 'Насосное оборудование — видны следы коррозии и износа',
      type: 'problem',
    },
    {
      url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1200',
      caption_ru: 'Приборный щит управления (устаревший)',
      type: 'interior',
    },
  ],

  data_sources: [
    'АО Узсувтаминот технический паспорт объекта 2024',
    'Бухарский областной отдел водного хозяйства',
    'World Bank Water Sector Report UZ 2023',
  ],
  last_updated: '2026-05-19',
  completion_pct: 80,
  tags: ['pumping_station', 'bukhara', 'amudaryа', 'degraded', 'urgent-modernization', 'uzbekistan'],
};

// ─────────────────────────────────────────────────────────────────
// OBJ-UZ-PS-003 — Главная станция Кюмазара, Бухара
// ─────────────────────────────────────────────────────────────────
const objUzPs003: FullObjectData = {
  id: 'OBJ-UZ-PS-003',
  name_ru: 'Главная станция Кюмазара, Бухара',
  name_en: 'Kuyumazar Main Station, Bukhara',
  type: 'pumping_station',
  status: 'degraded',
  description_ru:
    'Главная насосная станция Кюмазара — крупнейший объект водоснабжения Бухарской области, ' +
    'обеспечивающий водой 150 000 жителей из одноимённого канала. ' +
    'Объект введён в эксплуатацию в 2005 году, включён в программу ГЧП-модернизации по Указу № УП-6024 от 10.07.2020. ' +
    'Критический износ оборудования 56% — наибольший среди насосных станций региона. ' +
    'Работает на 65% проектной мощности, без резервного электроснабжения, вода не отвечает стандартам ВОЗ. ' +
    'Реализуется по ГЧП: UNICAP (инициатор), VODPROM Corporation (СПК), срок передачи управления: 10 лет. ' +
    'Технические партнёры: Culligan International (США), Aqseptence Group (Германия), ' +
    'Wuhuan Engineering Co., Ltd. (КНР). ' +
    'Международные финансовые институты: МФК, АИIB, АБР, IsDB, ЕБР. ' +
    'Долевое участие VOD DAO: $2 328 180 (30% от $7,76 млн). IRR: 17%.',
  description_en:
    'Kuyumazar Main Station serves 150,000 residents with 56% equipment wear — highest in the region. ' +
    'Operates at 65% capacity without backup power. PPP via UNICAP/VODPROM, 10-year operation term. ' +
    'Technical partners: Culligan International (USA), Aqseptence Group (Germany), Wuhuan Engineering (China). ' +
    'Financiers: IFC, AIIB, ADB, IsDB, EDB. VOD DAO share: $2,328,180 (30%). IRR: 17%.',

  region: 'Бухарская область',
  country: 'Uzbekistan',
  coordinates: { lat: 39.8234, lng: 64.3892 },
  basin: 'Бассейн Амударьи / Канал Кюмазар',

  construction_year: 2005,
  design_capacity_m3_per_day: 58_000,
  actual_capacity_m3_per_day: 37_700,
  pump_stations_count: 4,
  total_pump_power_kw: 5_200,
  automation_level_pct: 25,
  wear_pct: 56,
  treatment_technologies: ['Хлорирование', 'Механическая фильтрация', 'Коагуляция'],

  water_source_type: 'mixed',
  water_source_name: 'Канал Кюмазар (питание Амударья)',
  annual_water_intake_m3: 13_760_500,

  water_loss_pct: 26,
  energy_kwh_per_m3: 1.25,
  co2_kg_per_year: 17_200_000,
  quality_index: 61,
  meets_who_standards: false,
  ph_level: 7.8,
  turbidity_ntu: 1.8,
  nitrate_mg_per_l: 18.4,

  serves_population: 150_000,
  service_area_km2: 820,
  service_zones: [
    { name: 'Кюмазарский район, Бухара', type: 'district', population: 95_000, area_km2: 480 },
    { name: 'Сельские районы к востоку от Бухары', type: 'agricultural', population: 55_000, area_km2: 340 },
  ],
  daily_water_deficit_m3: 20_300,

  critical_issues: [
    {
      id: 'issue-ps003-001',
      type: 'mechanical',
      description_ru: 'Критический износ основных насосных агрегатов (56%) — три из четырёх насосов работают сверх назначенного ресурса; вероятность отказа в ближайшие 12 месяцев — 78%',
      urgency: 'critical',
      affected_population: 150_000,
      estimated_fix_cost_usd: 2_100_000,
      detected_year: 2022,
    },
    {
      id: 'issue-ps003-002',
      type: 'capacity',
      description_ru: 'Отсутствие резервного электроснабжения — любое отключение электроэнергии приводит к полной остановке водоподачи на весь регион',
      urgency: 'critical',
      affected_population: 150_000,
      estimated_fix_cost_usd: 680_000,
      detected_year: 2021,
    },
    {
      id: 'issue-ps003-003',
      type: 'water_quality',
      description_ru: 'Качество воды не соответствует стандартам ВОЗ — превышение нормы по мутности (1,8 НТЕ против 1,0) и нитратам (18,4 мг/л против 10,0 мг/л)',
      urgency: 'high',
      affected_population: 150_000,
      estimated_fix_cost_usd: 950_000,
      detected_year: 2023,
    },
    {
      id: 'issue-ps003-004',
      type: 'capacity',
      description_ru: 'Высокое удельное энергопотребление (1,25 кВт·ч/м³) — вдвое превышает норму, ежегодный перерасход энергозатрат $320 000',
      urgency: 'medium',
      affected_population: 150_000,
      estimated_fix_cost_usd: 560_000,
      detected_year: 2020,
    },
  ],
  failure_history: [
    {
      date: '2024-07-22',
      type_ru: 'Аварийная остановка насоса №3',
      duration_hours: 28,
      affected_population: 150_000,
      cause_ru: 'Разрушение ротора главного насоса — критический механический износ',
      loss_m3: 52_640,
    },
    {
      date: '2023-01-14',
      type_ru: 'Веерное отключение электроэнергии',
      duration_hours: 12,
      affected_population: 150_000,
      cause_ru: 'Отключение ЛЭП без резервного питания на станции',
      loss_m3: 25_000,
    },
    {
      date: '2021-09-03',
      type_ru: 'Превышение мутности воды',
      duration_hours: 48,
      affected_population: 150_000,
      cause_ru: 'Паводковые воды в канале Кюмазар при неработающем коагуляторе',
      loss_m3: 0,
    },
  ],

  book_value_usd: 5_800_000,
  replacement_cost_usd: 12_000_000,
  annual_opex_usd: 520_000,
  annual_revenue_usd: 840_000,
  tariff_usd_per_m3: 0.061,
  subsidy_pct: 46,

  investment_proposal: {
    total_usd: 7_760_000,
    irr_pct: 17,
    payback_years: 7.8,
    npv_usd: 3_800_000,
    equity_pct: 35,
    debt_pct: 50,
    grant_pct: 15,
    avg_annual_revenue_usd: 1_380_000,
    avg_annual_profit_usd: 430_000,
    margin_pct: 31.2,
    horizon_years: 20,
    funding_sources: [
      { name: 'VOD DAO Community (30%)', type: 'equity', amount_usd: 2_328_180 },
      { name: 'UNICAP PPP Investment Fund', type: 'equity', amount_usd: 388_020 },
      { name: 'МФК (IFC) / АИIB / АБР', type: 'debt', amount_usd: 3_880_300 },
      { name: 'IsDB + ЕБР — льготные кредиты', type: 'debt', amount_usd: 1_164_100 },
    ],
    social_impact: {
      people_gaining_water: 48_000,
      jobs_construction: 92,
      jobs_permanent: 14,
      water_diseases_reduction_pct: 35,
      co2_reduction_kg_per_year: 5_200_000,
    },
    yearly_projections: [
      { year: 2026, revenue_usd: 840_000, opex_usd: 620_000, net_profit_usd: -450_000, capacity_util_pct: 65.0, note: 'Замена насосного блока, установка ДГУ' },
      { year: 2027, revenue_usd: 1_020_000, opex_usd: 580_000, net_profit_usd: -120_000, capacity_util_pct: 74.5, note: 'Монтаж системы водоочистки' },
      { year: 2028, revenue_usd: 1_180_000, opex_usd: 540_000, net_profit_usd: 250_000, capacity_util_pct: 82.0 },
      { year: 2029, revenue_usd: 1_280_000, opex_usd: 510_000, net_profit_usd: 420_000, capacity_util_pct: 87.5 },
      { year: 2030, revenue_usd: 1_360_000, opex_usd: 490_000, net_profit_usd: 545_000, capacity_util_pct: 91.0 },
      { year: 2031, revenue_usd: 1_410_000, opex_usd: 478_000, net_profit_usd: 612_000, capacity_util_pct: 93.0 },
      { year: 2032, revenue_usd: 1_450_000, opex_usd: 470_000, net_profit_usd: 660_000, capacity_util_pct: 94.5 },
      { year: 2033, revenue_usd: 1_480_000, opex_usd: 465_000, net_profit_usd: 695_000, capacity_util_pct: 95.5 },
      { year: 2034, revenue_usd: 1_500_000, opex_usd: 461_000, net_profit_usd: 719_000, capacity_util_pct: 96.0 },
      { year: 2035, revenue_usd: 1_515_000, opex_usd: 458_000, net_profit_usd: 737_000, capacity_util_pct: 96.5 },
    ],
  },

  cover_image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
  photos: [
    {
      url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200',
      caption_ru: 'Главная станция Кюмазара, машинный зал',
      type: 'technical',
    },
    {
      url: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1200',
      caption_ru: 'Внешний вид станции — следы износа здания',
      type: 'exterior',
    },
    {
      url: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=1200',
      caption_ru: 'Видимые повреждения трубопроводной арматуры',
      type: 'problem',
    },
  ],

  data_sources: [
    'АО Узсувтаминот — техническая инспекция 2024',
    'Бухарский вилоятный водохозяйственный отдел',
    'World Bank Water Sector Report UZ 2023',
  ],
  last_updated: '2026-05-19',
  completion_pct: 85,
  tags: ['pumping_station', 'bukhara', 'kuyumazar', 'degraded', 'critical-infrastructure', 'urgent', 'uzbekistan'],
};

// ─────────────────────────────────────────────────────────────────
// OBJ-UZ-PS-004 — Вспомогательная станция Кюмазара, Бухара
// ─────────────────────────────────────────────────────────────────
const objUzPs004: FullObjectData = {
  id: 'OBJ-UZ-PS-004',
  name_ru: 'Вспомогательная станция Кюмазара, Бухара',
  name_en: 'Kuyumazar Auxiliary Pumping Station, Bukhara',
  type: 'pumping_station',
  status: 'operational',
  description_ru:
    'Вспомогательная насосная станция Кюмазара — наиболее современный объект водоснабжения в узле Кюмазар, ' +
    'введённый в эксплуатацию в 2012 году. Износ 24%, автоматизация 72%, работает на 80% мощности, ' +
    'обеспечивая водой 80 000 жителей. ' +
    'Включён в программу ГЧП-модернизации по Указу № УП-6024 от 10.07.2020. ' +
    'Высокий потенциал для интеграции солнечной энергетики (5.8 кВт·ч/м²/день) и перехода к модели «умной насосной станции». ' +
    'Реализуется по ГЧП: UNICAP (инициатор), VODPROM Corporation (СПК), срок эксплуатации: 10 лет. ' +
    'Технические партнёры: Culligan International (США) — водоочистка, ' +
    'Aqseptence Group (Германия) — мембранные системы, Wuhuan Engineering (КНР) — инжиниринг. ' +
    'Финансовые институты: МФК, АИIB, АБР, IsDB, ЕБР. ' +
    'Долевое участие VOD DAO: $3 589 620 (30% от $11,97 млн). IRR: 22%.',
  description_en:
    'Kuyumazar Auxiliary Station is the most modern facility in Kuyumazar hub, commissioned 2012. ' +
    '24% wear, 72% automation, 80% capacity. High solar integration potential (5.8 kWh/m²/day). ' +
    'PPP via UNICAP/VODPROM, 10-year operation. ' +
    'Technical partners: Culligan International (USA), Aqseptence Group (Germany), Wuhuan Engineering (China). ' +
    'Financiers: IFC, AIIB, ADB, IsDB, EDB. VOD DAO share: $3,589,620 (30%). IRR: 22%.',

  region: 'Бухарская область',
  country: 'Uzbekistan',
  coordinates: { lat: 39.7892, lng: 64.4123 },
  basin: 'Бассейн Амударьи / Канал Кюмазар',

  construction_year: 2012,
  design_capacity_m3_per_day: 28_000,
  actual_capacity_m3_per_day: 22_400,
  pump_stations_count: 2,
  total_pump_power_kw: 2_400,
  automation_level_pct: 72,
  wear_pct: 24,
  treatment_technologies: ['Хлорирование', 'Механическая фильтрация', 'УФ-обеззараживание'],

  water_source_type: 'mixed',
  water_source_name: 'Канал Кюмазар (питание Амударья)',
  annual_water_intake_m3: 8_176_000,

  water_loss_pct: 11,
  energy_kwh_per_m3: 0.72,
  co2_kg_per_year: 5_887_000,
  quality_index: 79,
  meets_who_standards: false,
  ph_level: 7.3,
  turbidity_ntu: 0.8,
  nitrate_mg_per_l: 10.2,

  serves_population: 80_000,
  service_area_km2: 410,
  service_zones: [
    { name: 'Юго-западный Кюмазарский район', type: 'district', population: 55_000, area_km2: 240 },
    { name: 'Агропромышленная зона', type: 'agricultural', population: 25_000, area_km2: 170 },
  ],
  daily_water_deficit_m3: 5_600,

  critical_issues: [
    {
      id: 'issue-ps004-001',
      type: 'capacity',
      description_ru: 'Ограниченная мощность в часы пиковой нагрузки — в летний период дефицит достигает 5 600 м³/сут',
      urgency: 'medium',
      affected_population: 80_000,
      estimated_fix_cost_usd: 380_000,
      detected_year: 2023,
    },
    {
      id: 'issue-ps004-002',
      type: 'capacity',
      description_ru: 'Отсутствие собственной солнечной генерации — 100% зависимость от сетевого электроснабжения при значительном солнечном потенциале региона (5,8 кВт·ч/м²/день)',
      urgency: 'low',
      affected_population: 80_000,
      estimated_fix_cost_usd: 1_200_000,
      detected_year: 2024,
    },
  ],
  failure_history: [
    {
      date: '2023-08-15',
      type_ru: 'Плановое техническое обслуживание',
      duration_hours: 6,
      affected_population: 35_000,
      cause_ru: 'Ежегодная замена уплотнений и профилактика автоматики',
      loss_m3: 5_600,
    },
  ],

  book_value_usd: 4_800_000,
  replacement_cost_usd: 9_200_000,
  annual_opex_usd: 265_000,
  annual_revenue_usd: 720_000,
  tariff_usd_per_m3: 0.088,
  subsidy_pct: 28,

  investment_proposal: {
    total_usd: 11_970_000,
    irr_pct: 22,
    payback_years: 6.5,
    npv_usd: 7_200_000,
    equity_pct: 35,
    debt_pct: 50,
    grant_pct: 15,
    avg_annual_revenue_usd: 1_820_000,
    avg_annual_profit_usd: 680_000,
    margin_pct: 37.4,
    horizon_years: 20,
    funding_sources: [
      { name: 'VOD DAO Community (30%)', type: 'equity', amount_usd: 3_589_620 },
      { name: 'UNICAP PPP Investment Fund', type: 'equity', amount_usd: 598_270 },
      { name: 'МФК (IFC) / АИIB / АБР — зелёное финансирование', type: 'debt', amount_usd: 5_982_700 },
      { name: 'IsDB + ЕБР — льготные кредиты ВИЭ', type: 'debt', amount_usd: 1_794_810 },
    ],
    social_impact: {
      people_gaining_water: 22_000,
      jobs_construction: 115,
      jobs_permanent: 18,
      water_diseases_reduction_pct: 18,
      co2_reduction_kg_per_year: 4_100_000,
      gdp_multiplier_usd: 2_400_000,
    },
    yearly_projections: [
      { year: 2026, revenue_usd: 720_000, opex_usd: 310_000, net_profit_usd: -820_000, capacity_util_pct: 80.0, note: 'Монтаж солнечных панелей и расширение мощности' },
      { year: 2027, revenue_usd: 1_050_000, opex_usd: 288_000, net_profit_usd: 182_000, capacity_util_pct: 86.5, note: 'Ввод солнечной генерации 1,5 МВт' },
      { year: 2028, revenue_usd: 1_380_000, opex_usd: 272_000, net_profit_usd: 608_000, capacity_util_pct: 90.5 },
      { year: 2029, revenue_usd: 1_580_000, opex_usd: 265_000, net_profit_usd: 845_000, capacity_util_pct: 93.0 },
      { year: 2030, revenue_usd: 1_720_000, opex_usd: 260_000, net_profit_usd: 1_000_000, capacity_util_pct: 95.0 },
      { year: 2031, revenue_usd: 1_800_000, opex_usd: 257_000, net_profit_usd: 1_093_000, capacity_util_pct: 96.0 },
      { year: 2032, revenue_usd: 1_850_000, opex_usd: 255_000, net_profit_usd: 1_155_000, capacity_util_pct: 97.0 },
      { year: 2033, revenue_usd: 1_890_000, opex_usd: 253_000, net_profit_usd: 1_207_000, capacity_util_pct: 97.5 },
      { year: 2034, revenue_usd: 1_920_000, opex_usd: 251_000, net_profit_usd: 1_239_000, capacity_util_pct: 98.0 },
      { year: 2035, revenue_usd: 1_940_000, opex_usd: 250_000, net_profit_usd: 1_260_000, capacity_util_pct: 98.0 },
    ],
  },

  cover_image_url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800',
  photos: [
    {
      url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1200',
      caption_ru: 'Вспомогательная станция Кюмазара — современное здание',
      type: 'exterior',
    },
    {
      url: 'https://images.unsplash.com/photo-1581093804475-577d72e38aa0?w=1200',
      caption_ru: 'Центр управления с автоматизированными системами',
      type: 'interior',
    },
    {
      url: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1200',
      caption_ru: 'Насосные агрегаты (современное оборудование 2012 г.)',
      type: 'technical',
    },
  ],

  data_sources: [
    'АО Узсувтаминот технический паспорт 2024',
    'Бухарский вилоятный водохозяйственный отдел',
    'IRENA — Renewable Energy Potential Central Asia 2023',
  ],
  last_updated: '2026-05-19',
  completion_pct: 83,
  tags: ['pumping_station', 'bukhara', 'kuyumazar', 'operational', 'solar-potential', 'modern', 'uzbekistan'],
};

// ─────────────────────────────────────────────────────────────────
// OBJ-UZ-PS-005 — Станция Аму-Бухара-1
// ─────────────────────────────────────────────────────────────────
const objUzPs005: FullObjectData = {
  id: 'OBJ-UZ-PS-005',
  name_ru: 'Станция Аму-Бухара-1',
  name_en: 'Amu-Bukhara-1 Pumping Station',
  type: 'pumping_station',
  status: 'degraded',
  description_ru:
    'Насосная станция Аму-Бухара-1 — критически важный распределительный узел из Амударьи ' +
    'в водную сеть Бухарской области, обеспечивающий 120 000 жителей. ' +
    'Построена в 2009 году, включена в ГЧП-программу по Указу № УП-6024 от 10.07.2020. ' +
    'Износ 45%, работает на 68% мощности, проблемы коррозии входных коллекторов (прорыв 2024 г.). ' +
    'Реализуется по ГЧП: инициатор — UNICAP, СПК — VODPROM Corporation, ' +
    'Правительство РУз обеспечивает гарантии исполнения. Срок ГЧП: 10 лет. ' +
    'Технические партнёры: Culligan International (США), Aqseptence Group (Германия), ' +
    'Wuhuan Engineering Co., Ltd. (КНР, часть CNCE). ' +
    'Международные финансовые институты: МФК, АИIB, АБР, IsDB, ЕБР. ' +
    'Долевое участие VOD DAO: $2 837 030 (30% от $9,49 млн). IRR: 20%.',
  description_en:
    'Amu-Bukhara-1 is a critical Amu Darya distribution hub for 120,000 Bukhara residents. ' +
    '45% wear, 68% capacity, corrosion-caused pipe rupture in 2024. ' +
    'PPP: UNICAP initiator, VODPROM Corporation SPV, Government of Uzbekistan guarantees. 10-year PPP term. ' +
    'Technical partners: Culligan International (USA), Aqseptence Group (Germany), Wuhuan Engineering (China). ' +
    'Financiers: IFC, AIIB, ADB, IsDB, EDB. VOD DAO share: $2,837,030 (30%). IRR: 20%.',

  region: 'Бухарская область',
  country: 'Uzbekistan',
  coordinates: { lat: 39.6234, lng: 64.5001 },
  basin: 'Бассейн Амударьи',

  construction_year: 2009,
  design_capacity_m3_per_day: 35_000,
  actual_capacity_m3_per_day: 23_800,
  pump_stations_count: 3,
  total_pump_power_kw: 3_200,
  automation_level_pct: 40,
  wear_pct: 45,
  treatment_technologies: ['Хлорирование', 'Осветление', 'Механическая фильтрация'],

  water_source_type: 'river',
  water_source_name: 'Амударья',
  annual_water_intake_m3: 8_687_000,

  water_loss_pct: 19,
  energy_kwh_per_m3: 0.98,
  co2_kg_per_year: 8_512_000,
  quality_index: 68,
  meets_who_standards: false,
  ph_level: 7.6,
  turbidity_ntu: 1.2,
  nitrate_mg_per_l: 14.8,

  serves_population: 120_000,
  service_area_km2: 560,
  service_zones: [
    { name: 'Центральный Бухарский распределительный узел', type: 'city', population: 75_000, area_km2: 280 },
    { name: 'Сельские районы вдоль канала', type: 'agricultural', population: 45_000, area_km2: 280 },
  ],
  daily_water_deficit_m3: 11_200,

  critical_issues: [
    {
      id: 'issue-ps005-001',
      type: 'mechanical',
      description_ru: 'Коррозия и износ трубопроводной арматуры на входных коллекторах — риск прорыва трубопровода высокого давления',
      urgency: 'critical',
      affected_population: 120_000,
      estimated_fix_cost_usd: 780_000,
      detected_year: 2022,
    },
    {
      id: 'issue-ps005-002',
      type: 'capacity',
      description_ru: 'Отсутствие резервных насосных агрегатов — любой внеплановый выход из строя основного насоса ведёт к полному прекращению водоподачи',
      urgency: 'high',
      affected_population: 120_000,
      estimated_fix_cost_usd: 1_100_000,
      detected_year: 2021,
    },
    {
      id: 'issue-ps005-003',
      type: 'water_quality',
      description_ru: 'Загрязнение воды из Амударьи — сезонное повышение мутности и концентрации нитратов в период половодья, недостаточная мощность системы очистки',
      urgency: 'high',
      affected_population: 120_000,
      estimated_fix_cost_usd: 920_000,
      detected_year: 2023,
    },
  ],
  failure_history: [
    {
      date: '2024-04-30',
      type_ru: 'Прорыв входного коллектора DN400',
      duration_hours: 18,
      affected_population: 120_000,
      cause_ru: 'Коррозионный прорыв стального коллектора 2009 г.',
      loss_m3: 38_000,
    },
    {
      date: '2022-06-11',
      type_ru: 'Снижение качества воды сверх нормы',
      duration_hours: 72,
      affected_population: 120_000,
      cause_ru: 'Паводок на Амударье — система очистки не справилась с нагрузкой',
      loss_m3: 0,
    },
    {
      date: '2020-11-25',
      type_ru: 'Отказ насоса №2',
      duration_hours: 11,
      affected_population: 120_000,
      cause_ru: 'Механический износ рабочего колеса',
      loss_m3: 16_800,
    },
  ],

  book_value_usd: 4_500_000,
  replacement_cost_usd: 9_800_000,
  annual_opex_usd: 340_000,
  annual_revenue_usd: 780_000,
  tariff_usd_per_m3: 0.09,
  subsidy_pct: 40,

  investment_proposal: {
    total_usd: 9_490_000,
    irr_pct: 20,
    payback_years: 7.2,
    npv_usd: 5_400_000,
    equity_pct: 35,
    debt_pct: 50,
    grant_pct: 15,
    avg_annual_revenue_usd: 1_520_000,
    avg_annual_profit_usd: 560_000,
    margin_pct: 36.8,
    horizon_years: 20,
    funding_sources: [
      { name: 'VOD DAO Community (30%)', type: 'equity', amount_usd: 2_847_030 },
      { name: 'UNICAP PPP Investment Fund', type: 'equity', amount_usd: 474_505 },
      { name: 'МФК (IFC) / АИIB / АБР', type: 'debt', amount_usd: 4_745_050 },
      { name: 'IsDB + ЕБР — льготные кредиты', type: 'debt', amount_usd: 1_423_515 },
    ],
    social_impact: {
      people_gaining_water: 28_000,
      jobs_construction: 98,
      jobs_permanent: 15,
      water_diseases_reduction_pct: 28,
      co2_reduction_kg_per_year: 3_800_000,
    },
    yearly_projections: [
      { year: 2026, revenue_usd: 780_000, opex_usd: 490_000, net_profit_usd: -620_000, capacity_util_pct: 68.0, note: 'Замена коллекторов, установка резервных насосов' },
      { year: 2027, revenue_usd: 980_000, opex_usd: 450_000, net_profit_usd: -100_000, capacity_util_pct: 76.5, note: 'Расширение системы водоочистки' },
      { year: 2028, revenue_usd: 1_180_000, opex_usd: 425_000, net_profit_usd: 355_000, capacity_util_pct: 83.0 },
      { year: 2029, revenue_usd: 1_320_000, opex_usd: 410_000, net_profit_usd: 560_000, capacity_util_pct: 88.0 },
      { year: 2030, revenue_usd: 1_430_000, opex_usd: 400_000, net_profit_usd: 710_000, capacity_util_pct: 91.5 },
      { year: 2031, revenue_usd: 1_510_000, opex_usd: 393_000, net_profit_usd: 797_000, capacity_util_pct: 93.5 },
      { year: 2032, revenue_usd: 1_560_000, opex_usd: 388_000, net_profit_usd: 852_000, capacity_util_pct: 95.0 },
      { year: 2033, revenue_usd: 1_600_000, opex_usd: 384_000, net_profit_usd: 896_000, capacity_util_pct: 96.0 },
      { year: 2034, revenue_usd: 1_625_000, opex_usd: 381_000, net_profit_usd: 924_000, capacity_util_pct: 96.5 },
      { year: 2035, revenue_usd: 1_645_000, opex_usd: 379_000, net_profit_usd: 946_000, capacity_util_pct: 97.0 },
    ],
  },

  cover_image_url: 'https://images.unsplash.com/photo-1542621334-a254cf47733d?w=800',
  photos: [
    {
      url: 'https://images.unsplash.com/photo-1542621334-a254cf47733d?w=1200',
      caption_ru: 'Станция Аму-Бухара-1, внешний вид',
      type: 'exterior',
    },
    {
      url: 'https://images.unsplash.com/photo-1581093804475-577d72e38aa0?w=1200',
      caption_ru: 'Насосный зал — агрегаты с видимыми следами износа',
      type: 'technical',
    },
    {
      url: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=1200',
      caption_ru: 'Коррозия входного коллектора — критическая проблема',
      type: 'problem',
    },
  ],

  data_sources: [
    'АО Узсувтаминот технический паспорт 2024',
    'Бухарский вилоятный водохозяйственный отдел',
    'FAO AQUASTAT Uzbekistan — Amu Darya basin',
  ],
  last_updated: '2026-05-19',
  completion_pct: 81,
  tags: ['pumping_station', 'bukhara', 'amudaryа', 'degraded', 'critical-junction', 'investment-ready', 'uzbekistan'],
};

// ─────────────────────────────────────────────────────────────────
// OBJ-UZ-WTF-001 — Комплекс очистки воды Ташкента
// ─────────────────────────────────────────────────────────────────
const objUzWtf001: FullObjectData = {
  id: 'OBJ-UZ-WTF-001',
  name_ru: 'Комплекс очистки воды Ташкента',
  name_en: 'Tashkent Water Treatment Complex',
  type: 'water_treatment_facility',
  status: 'operational',
  description_ru:
    'Комплекс очистки воды Ташкента — крупнейший объект водоподготовки Узбекистана, ' +
    'обеспечивающий питьевой водой более 3 млн жителей столичного мегаполиса. ' +
    'Введённый в эксплуатацию в 2003 году и прошедший масштабную реконструкцию в 2021 году, ' +
    'комплекс использует многоступенчатые технологии очистки, включая мембранную доочистку и УФ-обеззараживание, ' +
    'что обеспечивает соответствие воды стандартам ВОЗ по большинству показателей. ' +
    'Работает на уровне 90% проектной мощности (720 000 м³/сут), ' +
    'является стратегически критическим объектом национальной водной безопасности.',
  description_en:
    'Tashkent Water Treatment Complex is the largest water purification facility in Uzbekistan, ' +
    'supplying drinking water to over 3 million metropolitan residents. ' +
    'Commissioned in 2003 and extensively renovated in 2021, it uses multi-stage treatment ' +
    'including membrane polishing and UV disinfection, meeting WHO standards for most parameters.',

  region: 'г. Ташкент',
  country: 'Uzbekistan',
  coordinates: { lat: 41.2995, lng: 69.2401 },
  basin: 'Бассейн реки Чирчик',

  construction_year: 2003,
  last_renovation_year: 2021,
  design_capacity_m3_per_day: 800_000,
  actual_capacity_m3_per_day: 720_000,
  pump_stations_count: 12,
  total_pump_power_kw: 28_000,
  automation_level_pct: 68,
  wear_pct: 28,
  treatment_technologies: [
    'Преддезинфекция',
    'Коагуляция/Флокуляция',
    'Отстаивание',
    'Быстрая фильтрация',
    'Хлорирование',
    'UV-обработка',
    'Мембранная доочистка',
  ],

  water_source_type: 'river',
  water_source_name: 'Чирчик (отводной канал)',
  annual_water_intake_m3: 262_800_000,
  water_return_method: 'Очищенные сточные воды возвращаются в Чирчик ниже по течению через биологическую доочистку',

  water_loss_pct: 10,
  energy_kwh_per_m3: 0.38,
  co2_kg_per_year: 99_864_000,
  quality_index: 82,
  meets_who_standards: true,
  ph_level: 7.2,
  turbidity_ntu: 0.3,
  nitrate_mg_per_l: 8.5,

  serves_population: 3_000_000,
  service_area_km2: 334,
  service_zones: [
    { name: 'г. Ташкент (центр и север)', type: 'city', population: 1_800_000, area_km2: 180 },
    { name: 'г. Ташкент (юг и запад)', type: 'city', population: 900_000, area_km2: 100 },
    { name: 'Пригородные районы', type: 'district', population: 300_000, area_km2: 54 },
  ],
  daily_water_deficit_m3: 80_000,

  critical_issues: [
    {
      id: 'issue-wtf001-001',
      type: 'capacity',
      description_ru: 'Дефицит мощности в часы пиковой нагрузки — в летний период (июль–август) суточный дефицит достигает 80 000 м³/сут, затрагивая 400 000 жителей',
      urgency: 'high',
      affected_population: 400_000,
      estimated_fix_cost_usd: 45_000_000,
      detected_year: 2022,
    },
    {
      id: 'issue-wtf001-002',
      type: 'mechanical',
      description_ru: 'Устаревшее оборудование коагуляции и флокуляции (2003 г.) — снижает эффективность в паводковый период; требует замены в рамках следующей программы модернизации',
      urgency: 'medium',
      affected_population: 3_000_000,
      estimated_fix_cost_usd: 18_000_000,
      detected_year: 2023,
    },
  ],
  failure_history: [
    {
      date: '2023-07-18',
      type_ru: 'Снижение давления в северных районах',
      duration_hours: 8,
      affected_population: 600_000,
      cause_ru: 'Пиковое летнее потребление, превысившее пропускную способность вторичных насосных станций',
      loss_m3: 0,
    },
    {
      date: '2021-03-15',
      type_ru: 'Остановка линии №4 на плановый ремонт',
      duration_hours: 48,
      affected_population: 800_000,
      cause_ru: 'Плановая реконструкция — замена мембранных фильтров',
      loss_m3: 0,
    },
    {
      date: '2019-05-10',
      type_ru: 'Превышение мутности',
      duration_hours: 24,
      affected_population: 3_000_000,
      cause_ru: 'Паводок на Чирчике — мутность исходной воды 180 НТЕ при проектном максимуме 100 НТЕ',
      loss_m3: 0,
    },
  ],

  book_value_usd: 185_000_000,
  replacement_cost_usd: 480_000_000,
  annual_opex_usd: 12_000_000,
  annual_revenue_usd: 28_000_000,
  tariff_usd_per_m3: 0.11,
  subsidy_pct: 35,

  modernization_plan: {
    total_investment_usd: 85_000_000,
    construction_start_year: 2027,
    commissioning_year: 2030,
    expected_capacity_m3_per_day: 950_000,
    expected_loss_reduction_pct: 5,
    expected_efficiency_gain_pct: 12,
    expected_energy_reduction_pct: 18,
    notes_ru:
      'Двухфазная программа модернизации 2027–2030 гг.: расширение мощности на 19% и ' +
      'полный переход на цифровое управление с SCADA 4-го поколения.',
    phases: [
      {
        id: 'phase-wtf001-1',
        name_ru: 'Расширение производительности до 950 000 м³/сут',
        priority: 1,
        cost_usd: 55_000_000,
        duration_months: 24,
        capacity_gain_m3_per_day: 150_000,
        efficiency_gain_pct: 8,
        description_ru: 'Строительство 5-й технологической линии очистки, замена оборудования коагуляции и флокуляции',
        technologies: ['Высокоскоростная флокуляция DAF', 'Многослойная фильтрация', 'Озонирование'],
      },
      {
        id: 'phase-wtf001-2',
        name_ru: 'Цифровизация и автоматизация до 90%',
        priority: 2,
        cost_usd: 30_000_000,
        duration_months: 18,
        efficiency_gain_pct: 12,
        energy_reduction_pct: 18,
        description_ru: 'Внедрение SCADA 4.0, ИИ-управление дозированием реагентов, создание цифрового двойника',
        technologies: ['SCADA 4.0', 'AI-дозирование реагентов', 'IoT-мониторинг качества воды'],
      },
    ],
  },

  investment_proposal: {
    total_usd: 85_000_000,
    irr_pct: 18.5,
    payback_years: 7.5,
    npv_usd: 62_000_000,
    equity_pct: 35,
    debt_pct: 50,
    grant_pct: 15,
    avg_annual_revenue_usd: 38_500_000,
    avg_annual_profit_usd: 14_200_000,
    margin_pct: 36.9,
    horizon_years: 20,
    funding_sources: [
      { name: 'Частный капитал', type: 'equity', amount_usd: 29_750_000 },
      { name: 'Кредит ЕБРР / АБР', type: 'debt', amount_usd: 42_500_000 },
      { name: 'Грант ЕС — городская водная инфраструктура', type: 'grant', amount_usd: 12_750_000 },
    ],
    social_impact: {
      people_gaining_water: 450_000,
      jobs_construction: 680,
      jobs_permanent: 85,
      water_diseases_reduction_pct: 15,
      co2_reduction_kg_per_year: 18_000_000,
      gdp_multiplier_usd: 120_000_000,
    },
    yearly_projections: [
      { year: 2026, revenue_usd: 28_000_000, opex_usd: 12_500_000, net_profit_usd: 8_200_000, capacity_util_pct: 90.0, note: 'Предпроектная подготовка' },
      { year: 2027, revenue_usd: 28_500_000, opex_usd: 14_200_000, net_profit_usd: 5_800_000, capacity_util_pct: 90.5, note: 'Строительство фаза 1' },
      { year: 2028, revenue_usd: 30_200_000, opex_usd: 14_800_000, net_profit_usd: 7_200_000, capacity_util_pct: 92.0, note: 'Строительство фаза 1-2' },
      { year: 2029, revenue_usd: 34_000_000, opex_usd: 15_400_000, net_profit_usd: 10_800_000, capacity_util_pct: 95.5, note: 'Ввод линии 5' },
      { year: 2030, revenue_usd: 40_200_000, opex_usd: 15_800_000, net_profit_usd: 15_600_000, capacity_util_pct: 97.0, note: 'Полный ввод + цифровизация' },
      { year: 2031, revenue_usd: 41_500_000, opex_usd: 15_400_000, net_profit_usd: 17_300_000, capacity_util_pct: 97.5 },
      { year: 2032, revenue_usd: 42_500_000, opex_usd: 15_200_000, net_profit_usd: 18_500_000, capacity_util_pct: 98.0 },
      { year: 2033, revenue_usd: 43_200_000, opex_usd: 15_000_000, net_profit_usd: 19_400_000, capacity_util_pct: 98.5 },
      { year: 2034, revenue_usd: 43_800_000, opex_usd: 14_900_000, net_profit_usd: 20_100_000, capacity_util_pct: 98.5 },
      { year: 2035, revenue_usd: 44_200_000, opex_usd: 14_800_000, net_profit_usd: 20_600_000, capacity_util_pct: 99.0 },
    ],
  },

  cover_image_url: 'https://images.unsplash.com/photo-1565459576688-a2dfefe57ce5?w=800',
  photos: [
    {
      url: 'https://images.unsplash.com/photo-1565459576688-a2dfefe57ce5?w=1200',
      caption_ru: 'Комплекс очистки воды Ташкента — аэрофотосъёмка',
      type: 'aerial',
    },
    {
      url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200',
      caption_ru: 'Технологические линии водоочистки',
      type: 'technical',
    },
    {
      url: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=1200',
      caption_ru: 'Лаборатория контроля качества воды',
      type: 'interior',
    },
    {
      url: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1200',
      caption_ru: 'Насосный зал главной подачи',
      type: 'technical',
    },
  ],

  data_sources: [
    'АО Узсувтаминот годовой технический отчёт 2024',
    'Комитет по водным ресурсам РУз',
    'WHO Water Quality Guidelines 2022',
    'World Bank Tashkent Water Supply Project Completion Report 2022',
  ],
  last_updated: '2026-05-19',
  completion_pct: 90,
  tags: [
    'water_treatment', 'tashkent', 'operational', 'who-compliant',
    'major-infrastructure', 'investment-ready', 'uzbekistan', 'capital',
  ],
};

// ─────────────────────────────────────────────────────────────────
// OBJ-UZ-CAN-001 — Канал Бухара-Карши
// ─────────────────────────────────────────────────────────────────
const objUzCan001: FullObjectData = {
  id: 'OBJ-UZ-CAN-001',
  name_ru: 'Канал Бухара-Карши',
  name_en: 'Bukhara-Karshi Irrigation Canal',
  type: 'irrigation_canal',
  status: 'degraded',
  description_ru:
    'Канал Бухара-Карши — одна из крупнейших ирригационных артерий Узбекистана, ' +
    'построенная в 1976 году и протяжённостью 254 км. ' +
    'Канал подаёт воду из Амударьи для орошения 300 000 гектаров сельскохозяйственных угодий ' +
    'Бухарской и Кашкадарьинской областей, обеспечивая средства к существованию 1,2 млн человек. ' +
    'Из-за значительного физического износа (62%) и повреждений бетонной облицовки ' +
    'канальные потери воды достигают 35%, ежегодно теряется более 4 млрд литров воды. ' +
    'Программа реабилитации на $48 млн критически важна для продовольственной безопасности региона.',
  description_en:
    'The Bukhara-Karshi Canal is one of Uzbekistan\'s largest irrigation arteries, ' +
    'built in 1976 at 254 km length, supplying Amu Darya water to 300,000 hectares ' +
    'of agricultural land and sustaining 1.2 million people. ' +
    '35% water losses due to 62% physical wear demand a $48M rehabilitation program.',

  region: 'Бухарская — Кашкадарьинская область',
  country: 'Uzbekistan',
  coordinates: { lat: 39.35, lng: 64.92 },
  coordinates_start: { lat: 39.8234, lng: 64.3892 },
  coordinates_end: { lat: 38.8765, lng: 65.4567 },
  basin: 'Бассейн Амударьи — Зарафшанская низменность',

  construction_year: 1976,
  pipeline_length_km: 254,
  design_capacity_m3_per_day: 15_552_000,
  actual_capacity_m3_per_day: 11_664_000,
  pump_stations_count: 8,
  total_pump_power_kw: 18_000,
  automation_level_pct: 18,
  wear_pct: 62,

  water_source_type: 'river',
  water_source_name: 'Амударья',
  annual_water_intake_m3: 4_257_360_000,

  water_loss_pct: 35,
  energy_kwh_per_m3: 0.28,
  co2_kg_per_year: 326_000_000,
  quality_index: 58,
  meets_who_standards: false,

  serves_population: 1_200_000,
  service_area_km2: 3_000,
  service_zones: [
    { name: 'Бухарская область (ирригационная зона)', type: 'agricultural', population: 720_000, area_km2: 1_800 },
    { name: 'Кашкадарьинская область (северная часть)', type: 'agricultural', population: 480_000, area_km2: 1_200 },
  ],
  daily_water_deficit_m3: 3_888_000,

  critical_issues: [
    {
      id: 'issue-can001-001',
      type: 'structural',
      description_ru: 'Разрушение бетонной облицовки на 41% протяжённости канала — фильтрационные потери 35% объёма воды, ежегодный ущерб $28 млн',
      urgency: 'critical',
      affected_population: 1_200_000,
      estimated_fix_cost_usd: 28_000_000,
      detected_year: 2018,
    },
    {
      id: 'issue-can001-002',
      type: 'capacity',
      description_ru: 'Заиление русла канала — снижение пропускной способности с 180 до 135 м³/с, угроза нехватки воды в вегетационный период',
      urgency: 'high',
      affected_population: 1_200_000,
      estimated_fix_cost_usd: 8_500_000,
      detected_year: 2020,
    },
    {
      id: 'issue-can001-003',
      type: 'mechanical',
      description_ru: 'Отсутствие автоматизации водораспределения (18%) — неравномерная подача воды, конфликты между водопользователями, потери в сезон пикового спроса',
      urgency: 'high',
      affected_population: 1_200_000,
      estimated_fix_cost_usd: 5_200_000,
      detected_year: 2021,
    },
  ],
  failure_history: [
    {
      date: '2023-05-20',
      type_ru: 'Прорыв дамбы на участке 112 км',
      duration_hours: 96,
      affected_population: 380_000,
      cause_ru: 'Разрушение облицовки ввиду морозного пучения — затопление 450 га сельхозугодий',
      loss_m3: 9_800_000,
    },
    {
      date: '2021-07-08',
      type_ru: 'Критическое снижение расхода в период полива',
      duration_hours: 240,
      affected_population: 1_200_000,
      cause_ru: 'Заиление на участке 67–89 км — расход снизился до 90 м³/с против 135 м³/с нормы',
      loss_m3: 25_920_000,
    },
    {
      date: '2019-04-15',
      type_ru: 'Аварийный ремонт насосной станции №4',
      duration_hours: 72,
      affected_population: 580_000,
      cause_ru: 'Отказ главного трансформатора насосной станции',
      loss_m3: 3_240_000,
    },
  ],

  book_value_usd: 42_000_000,
  replacement_cost_usd: 320_000_000,
  annual_opex_usd: 3_800_000,
  annual_revenue_usd: 8_200_000,
  tariff_usd_per_m3: 0.019,
  subsidy_pct: 58,

  modernization_plan: {
    total_investment_usd: 48_000_000,
    construction_start_year: 2026,
    commissioning_year: 2032,
    expected_capacity_m3_per_day: 15_120_000,
    expected_loss_reduction_pct: 30,
    expected_efficiency_gain_pct: 20,
    expected_energy_reduction_pct: 15,
    notes_ru:
      'Шестилетняя программа реабилитации (2026–2032) включает восстановление облицовки, ' +
      'дноуглубительные работы на 85 км и установку автоматизированных водомерных узлов.',
    phases: [
      {
        id: 'phase-can001-1',
        name_ru: 'Восстановление бетонной облицовки (участки приоритета 1)',
        priority: 1,
        cost_usd: 22_000_000,
        duration_months: 30,
        loss_reduction_pct: 20,
        description_ru: 'Облицовка бетоном ПЦ 400 на 104 км наиболее повреждённых участков',
        technologies: ['Бетон ПЦ 400 с гидрофобизатором', 'Геомембрана HDPE', 'Механизированная укладка'],
      },
      {
        id: 'phase-can001-2',
        name_ru: 'Дноуглубление и расчистка русла',
        priority: 2,
        cost_usd: 12_000_000,
        duration_months: 24,
        capacity_gain_m3_per_day: 3_456_000,
        description_ru: 'Землечерпальные работы на 85 км канала, восстановление проектной глубины',
        technologies: ['Гидроэкскаватор', 'Земснаряд', 'Гидромониторная промывка'],
      },
      {
        id: 'phase-can001-3',
        name_ru: 'Автоматизация водораспределения',
        priority: 3,
        cost_usd: 14_000_000,
        duration_months: 18,
        efficiency_gain_pct: 20,
        description_ru: 'Установка 240 автоматизированных водомерных узлов, SCADA-диспетчеризация',
        technologies: ['Ультразвуковые расходомеры', 'SCADA водораспределения', 'Спутниковый мониторинг'],
      },
    ],
  },

  investment_proposal: {
    total_usd: 48_000_000,
    irr_pct: 11,
    payback_years: 14,
    npv_usd: 18_000_000,
    equity_pct: 35,
    debt_pct: 50,
    grant_pct: 15,
    avg_annual_revenue_usd: 12_500_000,
    avg_annual_profit_usd: 2_800_000,
    margin_pct: 22.4,
    horizon_years: 20,
    funding_sources: [
      { name: 'Государственный капитал / бюджет РУз', type: 'equity', amount_usd: 16_800_000 },
      { name: 'Кредит ВБ — ирригационный сектор ЦА', type: 'debt', amount_usd: 24_000_000 },
      { name: 'Грант ГЭФ — управление водными ресурсами', type: 'grant', amount_usd: 7_200_000 },
    ],
    social_impact: {
      people_gaining_water: 280_000,
      jobs_construction: 1_200,
      jobs_permanent: 95,
      water_diseases_reduction_pct: 12,
      co2_reduction_kg_per_year: 48_000_000,
      gdp_multiplier_usd: 380_000_000,
    },
    yearly_projections: [
      { year: 2026, revenue_usd: 8_200_000, opex_usd: 4_200_000, net_profit_usd: -6_800_000, capacity_util_pct: 75.0, note: 'Реабилитация участков 1 приоритета' },
      { year: 2027, revenue_usd: 9_000_000, opex_usd: 4_100_000, net_profit_usd: -5_200_000, capacity_util_pct: 78.5, note: 'Дноуглубление — фаза 1' },
      { year: 2028, revenue_usd: 10_200_000, opex_usd: 4_000_000, net_profit_usd: -2_400_000, capacity_util_pct: 82.0, note: 'Завершение облицовки' },
      { year: 2029, revenue_usd: 11_400_000, opex_usd: 3_900_000, net_profit_usd: 800_000, capacity_util_pct: 86.5, note: 'Автоматизация водомерных узлов' },
      { year: 2030, revenue_usd: 12_400_000, opex_usd: 3_800_000, net_profit_usd: 2_400_000, capacity_util_pct: 89.5 },
      { year: 2031, revenue_usd: 13_100_000, opex_usd: 3_750_000, net_profit_usd: 3_450_000, capacity_util_pct: 92.0 },
      { year: 2032, revenue_usd: 13_600_000, opex_usd: 3_700_000, net_profit_usd: 4_200_000, capacity_util_pct: 93.5, note: 'Полный ввод после реабилитации' },
      { year: 2033, revenue_usd: 14_000_000, opex_usd: 3_680_000, net_profit_usd: 4_720_000, capacity_util_pct: 95.0 },
      { year: 2034, revenue_usd: 14_300_000, opex_usd: 3_660_000, net_profit_usd: 5_140_000, capacity_util_pct: 96.0 },
      { year: 2035, revenue_usd: 14_500_000, opex_usd: 3_640_000, net_profit_usd: 5_460_000, capacity_util_pct: 96.5 },
    ],
  },

  cover_image_url: 'https://images.unsplash.com/photo-1585159812596-fac104bd4f0e?w=800',
  photos: [
    {
      url: 'https://images.unsplash.com/photo-1585159812596-fac104bd4f0e?w=1200',
      caption_ru: 'Канал Бухара-Карши — вид с воздуха',
      type: 'aerial',
    },
    {
      url: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200',
      caption_ru: 'Разрушение бетонной облицовки канала',
      type: 'problem',
    },
    {
      url: 'https://images.unsplash.com/photo-1566438480900-0609be27a4be?w=1200',
      caption_ru: 'Водораспределительный узел на 54 км канала',
      type: 'technical',
    },
    {
      url: 'https://images.unsplash.com/photo-1527515545081-5db817172677?w=1200',
      caption_ru: 'Участок канала с сохранившейся облицовкой',
      type: 'exterior',
    },
  ],

  data_sources: [
    'Министерство водного хозяйства РУз — паспорт канала 2023',
    'FAO AQUASTAT — Aral Sea Basin Water Resources',
    'World Bank Central Asia Water Resources Management Project',
    'МКВК — Межгосударственная координационная водохозяйственная комиссия',
  ],
  last_updated: '2026-05-19',
  completion_pct: 85,
  tags: [
    'irrigation_canal', 'bukhara', 'kashkadarya', 'amudaryа', 'degraded',
    'agriculture', 'food-security', 'investment-ready', 'uzbekistan',
  ],
};

// ─────────────────────────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────────────────────────
export const uzObjects: FullObjectData[] = [
  objUzPs001,
  objUzPs002,
  objUzPs003,
  objUzPs004,
  objUzPs005,
  objUzWtf001,
  objUzCan001,
];
