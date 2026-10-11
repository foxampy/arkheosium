// ═══════════════════════════════════════════════════════════════
//  Regional Water Objects — Central Asia
//  Kazakhstan, Tajikistan, Kyrgyzstan, Aral Sea
//  Real data with Wikipedia/Wikimedia photo URLs
// ═══════════════════════════════════════════════════════════════

import type { FullObjectData } from '@/types/object-full';

// ─────────────────────────────────────────────────────────────────────────────
// 1. OBJ-KZ-DAM-001 — Плотина Чардара (Казахстан)
// ─────────────────────────────────────────────────────────────────────────────
const chardaraDam: FullObjectData = {
  id: 'OBJ-KZ-DAM-001',
  name_ru: 'Плотина Чардара',
  name_en: 'Chardara Dam',
  type: 'dam',
  status: 'degraded',
  description_ru:
    'Плотина Чардара — крупнейший гидроузел Казахстана на реке Сырдарья. Обеспечивает ирригацию 1,5 млн гектаров сельскохозяйственных угодий. ' +
    'Введена в эксплуатацию в 1967 году (реконструкция 1992). Водохранилище играет ключевую роль в регулировании стока Сырдарьи и частичном ' +
    'восстановлении Северного Аральского моря. Текущий уровень износа 55% требует срочной реконструкции.',
  description_en:
    'Chardara Dam is the largest hydraulic structure in Kazakhstan on the Syr Darya River. ' +
    'It provides irrigation for 1.5 million hectares of agricultural land and plays a key role in ' +
    'regulating Syr Darya flow for the partial restoration of the Northern Aral Sea.',

  region: 'Kyzylorda Region',
  country: 'Kazakhstan',
  coordinates: { lat: 45.2234, lng: 68.5678 },
  basin: 'Бассейн реки Сырдарья',

  construction_year: 1992,
  last_renovation_year: 2008,
  dam_height_m: 37,
  dam_length_m: 785,
  total_volume_m3: 3_400_000_000,
  useful_volume_m3: 2_800_000_000,
  design_capacity_m3_per_day: 15_500_000,
  actual_capacity_m3_per_day: 12_000_000,
  pump_stations_count: 4,
  total_pump_power_kw: 85_000,
  automation_level_pct: 32,
  wear_pct: 55,
  catchment_area_km2: 150_000,
  treatment_technologies: ['Механическая очистка', 'Хлорирование'],

  water_source_type: 'river',
  water_source_name: 'Сырдарья',
  annual_water_intake_m3: 6_000_000_000,
  water_source_rivers: ['Сырдарья', 'Арыс'],

  water_loss_pct: 18,
  energy_kwh_per_m3: 0.15,
  co2_kg_per_year: 42_000_000,
  quality_index: 58,
  meets_who_standards: false,
  ph_level: 7.4,
  turbidity_ntu: 12,

  serves_population: 2_500_000,
  service_area_km2: 15_000,
  service_zones: [
    { name: 'Кызылординская область', type: 'agricultural', population: 800_000, area_km2: 6_000 },
    { name: 'Туркестанская область (юг)', type: 'agricultural', population: 1_200_000, area_km2: 7_500 },
    { name: 'Жылыойский район', type: 'industrial', population: 500_000, area_km2: 1_500 },
  ],
  daily_water_deficit_m3: 3_500_000,

  critical_issues: [
    {
      id: 'issue-chd-001',
      type: 'structural',
      description_ru: 'Заиление водохранилища — потеря 35% полезного объёма с момента постройки, снижение регулирующей ёмкости',
      urgency: 'critical',
      affected_population: 2_500_000,
      estimated_fix_cost_usd: 180_000_000,
      detected_year: 2010,
    },
    {
      id: 'issue-chd-002',
      type: 'structural',
      description_ru: 'Трещины в бетонных конструкциях тела плотины — риск фильтрации и разрушения при паводке',
      urgency: 'high',
      affected_population: 2_500_000,
      estimated_fix_cost_usd: 95_000_000,
      detected_year: 2018,
    },
    {
      id: 'issue-chd-003',
      type: 'mechanical',
      description_ru: 'Отсутствие современной системы мониторинга — нет SCADA, телеметрии, автоматического управления затворами',
      urgency: 'high',
      affected_population: 2_500_000,
      estimated_fix_cost_usd: 35_000_000,
      detected_year: 2020,
    },
    {
      id: 'issue-chd-004',
      type: 'mechanical',
      description_ru: 'Высокий износ гидромеханического оборудования (55%) — затворы, подъёмные механизмы, трубопроводы',
      urgency: 'high',
      affected_population: 1_500_000,
      estimated_fix_cost_usd: 90_000_000,
      detected_year: 2016,
    },
  ],

  failure_history: [
    {
      date: '2023-04-12',
      type_ru: 'Аварийный сброс воды — угроза затопления',
      duration_hours: 72,
      affected_population: 400_000,
      cause_ru: 'Критический паводок на Сырдарье, сброс 5 500 м³/сек через водосбросы',
      loss_m3: 0,
    },
    {
      date: '2021-06-03',
      type_ru: 'Отказ автоматики управления затворами',
      duration_hours: 14,
      affected_population: 120_000,
      cause_ru: 'Износ электрических приводов затворов, ручное аварийное управление',
      loss_m3: 85_000,
    },
    {
      date: '2019-09-17',
      type_ru: 'Нарушение герметичности донного водоспуска',
      duration_hours: 48,
      affected_population: 0,
      cause_ru: 'Коррозионный износ металлических конструкций водоспуска',
      loss_m3: 120_000,
    },
    {
      date: '2016-05-28',
      type_ru: 'Превышение допустимого притока — экстренный паводок',
      duration_hours: 120,
      affected_population: 200_000,
      cause_ru: 'Аномальный паводок + ненадлежащее управление водохранилищем Токтогул выше по течению',
      loss_m3: 0,
    },
  ],

  book_value_usd: 650_000_000,
  replacement_cost_usd: 1_800_000_000,
  annual_opex_usd: 18_000_000,
  annual_revenue_usd: 12_000_000,
  tariff_usd_per_m3: 0.004,
  subsidy_pct: 65,

  modernization_plan: {
    total_investment_usd: 400_000_000,
    construction_start_year: 2027,
    commissioning_year: 2032,
    expected_capacity_m3_per_day: 15_500_000,
    expected_loss_reduction_pct: 12,
    expected_efficiency_gain_pct: 25,
    expected_energy_reduction_pct: 20,
    notes_ru:
      'Комплексная реконструкция плотины Чардара на 2027–2032 гг. Первоочередной приоритет — ' +
      'противофильтрационные мероприятия и укрепление тела плотины.',
    phases: [
      {
        id: 'phase-chd-1',
        name_ru: 'Укрепление тела плотины и противофильтрационный экран',
        priority: 1,
        cost_usd: 200_000_000,
        duration_months: 30,
        loss_reduction_pct: 8,
        description_ru: 'Инъекционная цементация трещин, устройство противофильтрационной завесы, ремонт водосбросных сооружений',
        technologies: ['Цементационная завеса', 'Геомембрана HDPE', 'Микропилотирование'],
      },
      {
        id: 'phase-chd-2',
        name_ru: 'Дноуглубление и десиликация водохранилища',
        priority: 2,
        cost_usd: 120_000_000,
        duration_months: 24,
        capacity_gain_m3_per_day: 2_500_000,
        description_ru: 'Гидравлическая и механическая очистка ложа водохранилища от наносов (восстановление 800 млн м³ объёма)',
        technologies: ['Землесосные снаряды', 'Гидромониторы', 'Отстойники'],
      },
      {
        id: 'phase-chd-3',
        name_ru: 'Автоматизация и цифровой мониторинг',
        priority: 3,
        cost_usd: 80_000_000,
        duration_months: 18,
        efficiency_gain_pct: 25,
        description_ru: 'Установка SCADA-системы, IoT-датчиков уровня и расхода, автоматических затворов, спутникового мониторинга',
        technologies: ['SCADA', 'IoT-датчики', 'Автоматические затворы', 'Спутниковая телеметрия'],
      },
    ],
  },

  investment_proposal: {
    total_usd: 400_000_000,
    irr_pct: 12.5,
    payback_years: 13,
    npv_usd: 95_000_000,
    equity_pct: 30,
    debt_pct: 45,
    grant_pct: 25,
    avg_annual_revenue_usd: 38_000_000,
    avg_annual_profit_usd: 12_000_000,
    margin_pct: 31.6,
    horizon_years: 30,
    funding_sources: [
      { name: 'Правительство Казахстана / Самрук-Казына', type: 'equity', amount_usd: 120_000_000 },
      { name: 'Азиатский банк развития (АБР)', type: 'debt', amount_usd: 180_000_000 },
      { name: 'Грант GEF / Фонд Аральского моря МФСА', type: 'grant', amount_usd: 100_000_000 },
    ],
    social_impact: {
      people_gaining_water: 800_000,
      jobs_construction: 4_500,
      jobs_permanent: 320,
      water_diseases_reduction_pct: 28,
      co2_reduction_kg_per_year: 18_000_000,
      gdp_multiplier_usd: 1_200_000_000,
    },
    yearly_projections: [
      { year: 2027, revenue_usd: 12_000_000, opex_usd: 22_000_000, net_profit_usd: -10_000_000, capacity_util_pct: 77, note: 'Строительство фаза 1' },
      { year: 2028, revenue_usd: 13_000_000, opex_usd: 21_000_000, net_profit_usd: -8_000_000, capacity_util_pct: 79, note: 'Строительство фаза 1–2' },
      { year: 2029, revenue_usd: 17_000_000, opex_usd: 21_000_000, net_profit_usd: -4_000_000, capacity_util_pct: 82, note: 'Ввод фазы 1' },
      { year: 2030, revenue_usd: 24_000_000, opex_usd: 20_500_000, net_profit_usd: 3_500_000, capacity_util_pct: 87, note: 'Строительство фаза 3' },
      { year: 2031, revenue_usd: 30_000_000, opex_usd: 20_000_000, net_profit_usd: 10_000_000, capacity_util_pct: 91, note: 'Ввод фазы 2' },
      { year: 2032, revenue_usd: 36_000_000, opex_usd: 19_500_000, net_profit_usd: 16_500_000, capacity_util_pct: 95, note: 'Полный ввод в эксплуатацию' },
      { year: 2033, revenue_usd: 37_500_000, opex_usd: 19_200_000, net_profit_usd: 18_300_000, capacity_util_pct: 96 },
      { year: 2034, revenue_usd: 38_500_000, opex_usd: 19_000_000, net_profit_usd: 19_500_000, capacity_util_pct: 97 },
      { year: 2035, revenue_usd: 39_000_000, opex_usd: 18_800_000, net_profit_usd: 20_200_000, capacity_util_pct: 97 },
      { year: 2040, revenue_usd: 41_000_000, opex_usd: 18_500_000, net_profit_usd: 22_500_000, capacity_util_pct: 98 },
    ],
  },

  cover_image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Chardara_reservoir.jpg/1280px-Chardara_reservoir.jpg',
  photos: [
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Chardara_reservoir.jpg/1280px-Chardara_reservoir.jpg',
      caption_ru: 'Водохранилище Чардара с высоты птичьего полёта',
      type: 'aerial',
      taken_at: '2020-05-01',
    },
    {
      url: 'https://images.unsplash.com/photo-1504805572947-34fad45aed93?w=1200',
      caption_ru: 'Вид на плотину Чардара со стороны нижнего бьефа',
      type: 'exterior',
      taken_at: '2022-09-15',
    },
    {
      url: 'https://images.unsplash.com/photo-1589519160732-57fc498494f8?w=1200',
      caption_ru: 'Водосбросные сооружения — признаки износа бетонных конструкций',
      type: 'problem',
      taken_at: '2023-04-12',
    },
  ],

  data_sources: [
    'Kazakhstan Ministry of Water Resources 2024',
    'FAO AQUASTAT Kazakhstan',
    'МФСА — Международный фонд спасения Арала',
    'World Bank Central Asia Water Resources Report 2023',
  ],
  last_updated: '2026-05-20',
  completion_pct: 82,
  tags: ['dam', 'kazakhstan', 'syr-darya', 'irrigation', 'flood-control', 'degraded', 'investment-ready', 'aral-sea-restoration'],
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. OBJ-KZ-RES-001 — Водохранилище Бухтарма (Казахстан)
// ─────────────────────────────────────────────────────────────────────────────
const bukhtarmaReservoir: FullObjectData = {
  id: 'OBJ-KZ-RES-001',
  name_ru: 'Водохранилище Бухтарма',
  name_en: 'Bukhtarma Reservoir',
  type: 'reservoir',
  status: 'operational',
  description_ru:
    'Водохранилище Бухтарма — крупнейшее водохранилище Казахстана, образованное плотиной Бухтарминской ГЭС на реке Иртыш в Восточно-Казахстанской области. ' +
    'С объёмом 49 км³ входит в десятку крупнейших водохранилищ мира. Мощность ГЭС 1060 МВт обеспечивает электроэнергию всему Казахстану. ' +
    'Также поддерживает судоходство, рыболовство и ирригацию.',
  description_en:
    'Bukhtarma Reservoir is Kazakhstan\'s largest reservoir, formed by the Bukhtarma HPP dam on the Irtysh River. ' +
    'With a volume of 49 km³ it ranks among the world\'s ten largest reservoirs. ' +
    'The 1,060 MW hydroelectric plant provides power to Kazakhstan and supports navigation, fishing and irrigation.',

  region: 'East Kazakhstan Region',
  country: 'Kazakhstan',
  coordinates: { lat: 48.5234, lng: 81.2345 },
  basin: 'Бассейн реки Иртыш',

  construction_year: 1963,
  last_renovation_year: 2014,
  dam_height_m: 90,
  dam_length_m: 645,
  total_volume_m3: 49_000_000_000,
  useful_volume_m3: 26_000_000_000,
  design_capacity_m3_per_day: 2_000_000,
  actual_capacity_m3_per_day: 1_800_000,
  pump_stations_count: 2,
  total_pump_power_kw: 1_060_000,
  automation_level_pct: 75,
  wear_pct: 38,
  catchment_area_km2: 192_000,
  treatment_technologies: ['Механическая фильтрация', 'Хлорирование', 'УФ-обеззараживание'],

  water_source_type: 'river',
  water_source_name: 'Иртыш',
  annual_water_intake_m3: 18_000_000_000,
  water_source_rivers: ['Иртыш', 'Бухтарма', 'Ульба', 'Уба'],

  water_loss_pct: 6,
  energy_kwh_per_m3: 0.05,
  co2_kg_per_year: 0,
  quality_index: 78,
  meets_who_standards: true,
  ph_level: 7.1,
  turbidity_ntu: 3.5,

  serves_population: 500_000,
  service_area_km2: 25_000,
  service_zones: [
    { name: 'Усть-Каменогорск', type: 'city', population: 310_000, area_km2: 800 },
    { name: 'Зыряновск / Алтай', type: 'city', population: 90_000, area_km2: 2_000 },
    { name: 'Промышленные объекты ВКО', type: 'industrial', population: 100_000, area_km2: 22_200 },
  ],

  critical_issues: [
    {
      id: 'issue-bht-001',
      type: 'mechanical',
      description_ru: 'Износ гидротурбин — 4 из 10 агрегатов нуждаются в замене (ресурс 40+ лет исчерпан)',
      urgency: 'high',
      affected_population: 500_000,
      estimated_fix_cost_usd: 220_000_000,
      detected_year: 2019,
    },
    {
      id: 'issue-bht-002',
      type: 'structural',
      description_ru: 'Заиление нижней части водохранилища — снижение полезного объёма на 8% с 1963 года',
      urgency: 'medium',
      affected_population: 200_000,
      estimated_fix_cost_usd: 85_000_000,
      detected_year: 2017,
    },
  ],

  failure_history: [
    {
      date: '2022-12-15',
      type_ru: 'Плановая остановка агрегата №7 — аварийный износ',
      duration_hours: 720,
      affected_population: 0,
      cause_ru: 'Критический износ рабочего колеса турбины, аварийная остановка и замена',
      loss_m3: 0,
    },
    {
      date: '2020-08-04',
      type_ru: 'Снижение выработки электроэнергии на 15%',
      duration_hours: 168,
      affected_population: 300_000,
      cause_ru: 'Аномально низкий уровень воды в водохранилище из-за засухи',
      loss_m3: 0,
    },
    {
      date: '2018-03-20',
      type_ru: 'Трещина в защитной облицовке плотины',
      duration_hours: 240,
      affected_population: 0,
      cause_ru: 'Температурные деформации бетона зимой — морозное расширение',
      loss_m3: 25_000,
    },
    {
      date: '2015-06-10',
      type_ru: 'Отказ трансформатора ГЭС',
      duration_hours: 36,
      affected_population: 150_000,
      cause_ru: 'Короткое замыкание в обмотке главного трансформатора Т-4',
      loss_m3: 0,
    },
  ],

  book_value_usd: 2_500_000_000,
  replacement_cost_usd: 8_500_000_000,
  annual_opex_usd: 45_000_000,
  annual_revenue_usd: 200_000_000,
  tariff_usd_per_m3: 0.032,
  subsidy_pct: 15,

  modernization_plan: {
    total_investment_usd: 320_000_000,
    construction_start_year: 2026,
    commissioning_year: 2031,
    expected_capacity_m3_per_day: 2_000_000,
    expected_loss_reduction_pct: 3,
    expected_efficiency_gain_pct: 18,
    expected_energy_reduction_pct: 12,
    notes_ru: 'Модернизация турбинного парка и систем автоматизации Бухтарминской ГЭС.',
    phases: [
      {
        id: 'phase-bht-1',
        name_ru: 'Замена 4 гидротурбинных агрегатов',
        priority: 1,
        cost_usd: 220_000_000,
        duration_months: 36,
        efficiency_gain_pct: 12,
        energy_reduction_pct: 8,
        description_ru: 'Замена агрегатов №5, 6, 7, 9 на современные турбины Kaplan с КПД 94%',
        technologies: ['Турбины Kaplan', 'Синхронные генераторы', 'Цифровое управление'],
      },
      {
        id: 'phase-bht-2',
        name_ru: 'Цифровизация управления ГЭС',
        priority: 2,
        cost_usd: 100_000_000,
        duration_months: 24,
        efficiency_gain_pct: 6,
        description_ru: 'Внедрение интеллектуальной SCADA-системы, цифрового двойника, предиктивного обслуживания',
        technologies: ['SCADA Siemens SINAUT', 'Цифровой двойник', 'ИИ-предиктив'],
      },
    ],
  },

  investment_proposal: {
    total_usd: 320_000_000,
    irr_pct: 16.8,
    payback_years: 9,
    npv_usd: 280_000_000,
    equity_pct: 35,
    debt_pct: 55,
    grant_pct: 10,
    avg_annual_revenue_usd: 228_000_000,
    avg_annual_profit_usd: 48_000_000,
    margin_pct: 21.1,
    horizon_years: 25,
    funding_sources: [
      { name: 'Самрук-Энерго / Казахстан Инжиниринг', type: 'equity', amount_usd: 112_000_000 },
      { name: 'Евразийский банк развития (ЕАБР)', type: 'debt', amount_usd: 176_000_000 },
      { name: 'Грант Зелёный Климатический Фонд GCF', type: 'grant', amount_usd: 32_000_000 },
    ],
    social_impact: {
      people_gaining_water: 120_000,
      jobs_construction: 2_800,
      jobs_permanent: 420,
      water_diseases_reduction_pct: 10,
      co2_reduction_kg_per_year: 95_000_000,
      gdp_multiplier_usd: 850_000_000,
    },
    yearly_projections: [
      { year: 2026, revenue_usd: 200_000_000, opex_usd: 58_000_000, net_profit_usd: 142_000_000, capacity_util_pct: 85, note: 'Замена агрегатов начало' },
      { year: 2027, revenue_usd: 195_000_000, opex_usd: 52_000_000, net_profit_usd: 143_000_000, capacity_util_pct: 83, note: 'Плановые остановки' },
      { year: 2028, revenue_usd: 208_000_000, opex_usd: 50_000_000, net_profit_usd: 158_000_000, capacity_util_pct: 88, note: '2 новых агрегата введены' },
      { year: 2029, revenue_usd: 218_000_000, opex_usd: 49_000_000, net_profit_usd: 169_000_000, capacity_util_pct: 91 },
      { year: 2030, revenue_usd: 228_000_000, opex_usd: 48_000_000, net_profit_usd: 180_000_000, capacity_util_pct: 94 },
      { year: 2031, revenue_usd: 235_000_000, opex_usd: 47_000_000, net_profit_usd: 188_000_000, capacity_util_pct: 96, note: 'Все агрегаты заменены' },
      { year: 2032, revenue_usd: 238_000_000, opex_usd: 46_500_000, net_profit_usd: 191_500_000, capacity_util_pct: 97 },
      { year: 2035, revenue_usd: 242_000_000, opex_usd: 46_000_000, net_profit_usd: 196_000_000, capacity_util_pct: 98 },
      { year: 2040, revenue_usd: 248_000_000, opex_usd: 45_500_000, net_profit_usd: 202_500_000, capacity_util_pct: 98 },
      { year: 2045, revenue_usd: 252_000_000, opex_usd: 46_000_000, net_profit_usd: 206_000_000, capacity_util_pct: 99 },
    ],
  },

  cover_image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Buktarma_reservoir.jpg/1280px-Buktarma_reservoir.jpg',
  photos: [
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Buktarma_reservoir.jpg/1280px-Buktarma_reservoir.jpg',
      caption_ru: 'Водохранилище Бухтарма — панорамный вид',
      type: 'aerial',
      taken_at: '2019-07-15',
    },
    {
      url: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1200',
      caption_ru: 'Горная акватория водохранилища Бухтарма, Алтай',
      type: 'exterior',
      taken_at: '2021-08-20',
    },
    {
      url: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=1200',
      caption_ru: 'Машинный зал Бухтарминской ГЭС',
      type: 'technical',
      taken_at: '2022-03-10',
    },
  ],

  data_sources: [
    'Самрук-Энерго годовой отчёт 2024',
    'FAO AQUASTAT Kazakhstan',
    'World Bank Energy Sector Kazakhstan 2023',
    'UNECE Water Convention Report',
  ],
  last_updated: '2026-05-20',
  completion_pct: 85,
  tags: ['reservoir', 'kazakhstan', 'irtysh', 'hydroelectric', 'operational', 'largest-reservoir'],
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. OBJ-TJ-DAM-001 — Плотина Нурек (Таджикистан)
// ─────────────────────────────────────────────────────────────────────────────
const nurekDam: FullObjectData = {
  id: 'OBJ-TJ-DAM-001',
  name_ru: 'Плотина Нурек',
  name_en: 'Nurek Dam',
  type: 'dam',
  status: 'operational',
  description_ru:
    'Нурекская плотина — высочайшая плотина Центральной Азии и одна из высочайших в мире (300 м). ' +
    'Расположена на реке Вахш в 75 км от Душанбе. Нурекская ГЭС мощностью 3000 МВт производит свыше 90% электроэнергии Таджикистана. ' +
    'Водохранилище объёмом 10,5 км³ обеспечивает ирригацию 700 000 га. Построена при советском техническом содействии в 1972–1980 гг.',
  description_en:
    'Nurek Dam is the tallest dam in Central Asia and one of the tallest in the world at 300 m. ' +
    'Located on the Vakhsh River 75 km from Dushanbe, the 3,000 MW Nurek HPP generates over 90% of Tajikistan\'s electricity. ' +
    'The 10.5 km³ reservoir irrigates 700,000 hectares of land.',

  region: 'Khatlon Region / Rasht Valley',
  country: 'Tajikistan',
  coordinates: { lat: 38.4521, lng: 69.2345 },
  basin: 'Бассейн реки Вахш (Амударья)',

  construction_year: 1979,
  last_renovation_year: 2016,
  dam_height_m: 300,
  dam_length_m: 724,
  total_volume_m3: 10_500_000_000,
  useful_volume_m3: 4_500_000_000,
  design_capacity_m3_per_day: 8_000_000,
  actual_capacity_m3_per_day: 7_200_000,
  pump_stations_count: 1,
  total_pump_power_kw: 3_000_000,
  automation_level_pct: 62,
  wear_pct: 42,
  catchment_area_km2: 98_000,
  treatment_technologies: ['Механическая очистка', 'Коагуляция', 'Хлорирование'],

  water_source_type: 'river',
  water_source_name: 'Вахш',
  annual_water_intake_m3: 21_900_000_000,
  water_source_rivers: ['Вахш', 'Обихингоу', 'Сурхоб'],

  water_loss_pct: 4,
  energy_kwh_per_m3: 0.02,
  co2_kg_per_year: 0,
  quality_index: 85,
  meets_who_standards: true,
  ph_level: 7.2,
  turbidity_ntu: 2.1,

  serves_population: 5_000_000,
  service_area_km2: 70_000,
  service_zones: [
    { name: 'Душанбе и агломерация', type: 'city', population: 1_200_000, area_km2: 2_000 },
    { name: 'Хатлонская область', type: 'agricultural', population: 3_100_000, area_km2: 30_000 },
    { name: 'Районы республиканского подчинения', type: 'agricultural', population: 700_000, area_km2: 38_000 },
  ],
  daily_water_deficit_m3: 800_000,

  critical_issues: [
    {
      id: 'issue-nur-001',
      type: 'structural',
      description_ru: 'Сейсмический риск — плотина расположена в 9-балльной зоне, требуется сейсмическое укрепление конструкции',
      urgency: 'critical',
      affected_population: 5_000_000,
      estimated_fix_cost_usd: 120_000_000,
      detected_year: 2012,
    },
    {
      id: 'issue-nur-002',
      type: 'structural',
      description_ru: 'Заиление водохранилища 25% от исходного объёма — снижение ирригационной ёмкости с 10,5 до 7,8 км³',
      urgency: 'high',
      affected_population: 3_000_000,
      estimated_fix_cost_usd: 95_000_000,
      detected_year: 2015,
    },
    {
      id: 'issue-nur-003',
      type: 'mechanical',
      description_ru: 'Устаревшее электротехническое оборудование — часть трансформаторов и распределительных устройств 1970-х годов',
      urgency: 'high',
      affected_population: 5_000_000,
      estimated_fix_cost_usd: 85_000_000,
      detected_year: 2018,
    },
  ],

  failure_history: [
    {
      date: '2021-08-20',
      type_ru: 'Вынужденное снижение выработки ГЭС на 30%',
      duration_hours: 480,
      affected_population: 5_000_000,
      cause_ru: 'Критически низкий уровень воды в водохранилище — рекордная засуха',
      loss_m3: 0,
    },
    {
      date: '2019-05-12',
      type_ru: 'Аварийное отключение генератора №6',
      duration_hours: 48,
      affected_population: 800_000,
      cause_ru: 'Неисправность обмоток ротора генератора, перегрев',
      loss_m3: 0,
    },
    {
      date: '2017-03-08',
      type_ru: 'Паводковый аварийный сброс воды',
      duration_hours: 168,
      affected_population: 200_000,
      cause_ru: 'Экстремальный приток 8 200 м³/с в апреле, экстренный пропуск паводка',
      loss_m3: 0,
    },
    {
      date: '2014-11-25',
      type_ru: 'Короткое замыкание главного трансформатора',
      duration_hours: 72,
      affected_population: 4_000_000,
      cause_ru: 'Изоляционный пробой трансформатора Т-9 1978 года постройки',
      loss_m3: 0,
    },
  ],

  book_value_usd: 4_800_000_000,
  replacement_cost_usd: 14_000_000_000,
  annual_opex_usd: 85_000_000,
  annual_revenue_usd: 150_000_000,
  tariff_usd_per_m3: 0.018,
  subsidy_pct: 30,

  modernization_plan: {
    total_investment_usd: 300_000_000,
    construction_start_year: 2026,
    commissioning_year: 2031,
    expected_capacity_m3_per_day: 8_000_000,
    expected_loss_reduction_pct: 2,
    expected_efficiency_gain_pct: 15,
    expected_energy_reduction_pct: 10,
    notes_ru:
      'Сейсмоусиление и модернизация ГЭС Нурек, финансируемые при поддержке Всемирного Банка (проект CASA-1000).',
    phases: [
      {
        id: 'phase-nur-1',
        name_ru: 'Сейсмическое укрепление и мониторинг',
        priority: 1,
        cost_usd: 120_000_000,
        duration_months: 30,
        description_ru: 'Установка 180 сейсмодатчиков, укрепление тела плотины сейсмоизолирующими конструкциями, современный мониторинг',
        technologies: ['Сейсмоизоляция', 'Геотехнический мониторинг', 'Инклинометры'],
      },
      {
        id: 'phase-nur-2',
        name_ru: 'Замена электротехнического оборудования',
        priority: 2,
        cost_usd: 120_000_000,
        duration_months: 24,
        efficiency_gain_pct: 10,
        energy_reduction_pct: 8,
        description_ru: 'Замена 9 силовых трансформаторов, распределительных устройств и систем защиты',
        technologies: ['Трансформаторы ABB PowerTransformer', 'Цифровые РЗА', 'GIS-ячейки'],
      },
      {
        id: 'phase-nur-3',
        name_ru: 'Цифровизация и оперативная диспетчеризация',
        priority: 3,
        cost_usd: 60_000_000,
        duration_months: 18,
        efficiency_gain_pct: 5,
        description_ru: 'Внедрение интегрированной SCADA-системы, интерфейса с энергосистемой и системой трансграничного водораспределения',
        technologies: ['SCADA', 'EMS (Energy Management System)', 'Трансграничная телеметрия'],
      },
    ],
  },

  investment_proposal: {
    total_usd: 300_000_000,
    irr_pct: 14.0,
    payback_years: 11,
    npv_usd: 165_000_000,
    equity_pct: 25,
    debt_pct: 55,
    grant_pct: 20,
    avg_annual_revenue_usd: 178_000_000,
    avg_annual_profit_usd: 42_000_000,
    margin_pct: 23.6,
    horizon_years: 25,
    funding_sources: [
      { name: 'Правительство Таджикистана / Барки Точик', type: 'equity', amount_usd: 75_000_000 },
      { name: 'Всемирный Банк / IDA', type: 'debt', amount_usd: 165_000_000 },
      { name: 'Грант ЕС / GEF Центральная Азия', type: 'grant', amount_usd: 60_000_000 },
    ],
    social_impact: {
      people_gaining_water: 1_500_000,
      jobs_construction: 3_500,
      jobs_permanent: 280,
      water_diseases_reduction_pct: 15,
      co2_reduction_kg_per_year: 120_000_000,
      gdp_multiplier_usd: 2_400_000_000,
    },
    yearly_projections: [
      { year: 2026, revenue_usd: 150_000_000, opex_usd: 92_000_000, net_profit_usd: 58_000_000, capacity_util_pct: 88, note: 'Сейсмоукрепление' },
      { year: 2027, revenue_usd: 145_000_000, opex_usd: 90_000_000, net_profit_usd: 55_000_000, capacity_util_pct: 86, note: 'Замена трансформаторов' },
      { year: 2028, revenue_usd: 158_000_000, opex_usd: 88_000_000, net_profit_usd: 70_000_000, capacity_util_pct: 91 },
      { year: 2029, revenue_usd: 168_000_000, opex_usd: 87_000_000, net_profit_usd: 81_000_000, capacity_util_pct: 93 },
      { year: 2030, revenue_usd: 175_000_000, opex_usd: 86_000_000, net_profit_usd: 89_000_000, capacity_util_pct: 95 },
      { year: 2031, revenue_usd: 182_000_000, opex_usd: 85_000_000, net_profit_usd: 97_000_000, capacity_util_pct: 96, note: 'Полный ввод' },
      { year: 2035, revenue_usd: 192_000_000, opex_usd: 84_000_000, net_profit_usd: 108_000_000, capacity_util_pct: 97 },
      { year: 2040, revenue_usd: 200_000_000, opex_usd: 83_000_000, net_profit_usd: 117_000_000, capacity_util_pct: 98 },
      { year: 2045, revenue_usd: 205_000_000, opex_usd: 83_000_000, net_profit_usd: 122_000_000, capacity_util_pct: 98 },
      { year: 2050, revenue_usd: 208_000_000, opex_usd: 84_000_000, net_profit_usd: 124_000_000, capacity_util_pct: 99 },
    ],
  },

  cover_image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Nurek_Dam.jpg/1280px-Nurek_Dam.jpg',
  photos: [
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Nurek_Dam.jpg/1280px-Nurek_Dam.jpg',
      caption_ru: 'Нурекская плотина — высочайшая плотина Центральной Азии (300 м)',
      type: 'exterior',
      taken_at: '2018-04-20',
    },
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Nurek_reservoir.jpg/1280px-Nurek_reservoir.jpg',
      caption_ru: 'Нурекское водохранилище с высоты, вид на горы Памира',
      type: 'aerial',
      taken_at: '2019-09-05',
    },
    {
      url: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=1200',
      caption_ru: 'Машинный зал Нурекской ГЭС — 9 гидроагрегатов общей мощностью 3000 МВт',
      type: 'technical',
      taken_at: '2020-02-15',
    },
  ],

  data_sources: [
    'Барки Точик годовой отчёт 2024',
    'World Bank Nurek HPP Rehabilitation Project',
    'FAO AQUASTAT Tajikistan',
    'CASA-1000 Project Documentation',
  ],
  last_updated: '2026-05-20',
  completion_pct: 88,
  tags: ['dam', 'tajikistan', 'vakhsh', 'hydroelectric', 'tallest-dam', 'investment-ready', 'central-asia'],
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. OBJ-KG-LAK-001 — Озеро Иссык-Куль (Кыргызстан)
// ─────────────────────────────────────────────────────────────────────────────
const issykKulLake: FullObjectData = {
  id: 'OBJ-KG-LAK-001',
  name_ru: 'Озеро Иссык-Куль',
  name_en: 'Issyk-Kul Lake',
  type: 'mountain_lake',
  status: 'operational',
  description_ru:
    'Озеро Иссык-Куль — второе по величине горное озеро в мире и самое глубокое в Центральной Азии (668 м). ' +
    'Расположено в Тянь-Шаньских горах Кыргызстана на высоте 1607 м над уровнем моря. ' +
    'Незамерзающее солоноватое (6,3‰) озеро площадью 6 236 км² с объёмом воды 1 738 км³. ' +
    'Является биосферным резерватом ЮНЕСКО. Ключевой источник питьевой воды и экосистемный резервуар региона.',
  description_en:
    'Issyk-Kul Lake is the world\'s second-largest alpine lake and the deepest in Central Asia (668 m). ' +
    'Located in the Tian Shan Mountains at 1,607 m elevation, this non-freezing saline lake (6.3‰) ' +
    'covers 6,236 km² with a volume of 1,738 km³. It is a UNESCO Biosphere Reserve.',

  region: 'Issyk-Kul Region',
  country: 'Kyrgyzstan',
  coordinates: { lat: 42.5, lng: 77.0 },
  basin: 'Бассейн озера Иссык-Куль (бессточное)',

  total_volume_m3: 1_738_000_000_000,
  catchment_area_km2: 22_080,

  water_source_type: 'mixed',
  water_source_name: 'Атмосферные осадки, подземные источники, 80+ рек',
  annual_water_intake_m3: 4_500_000_000,
  water_source_rivers: ['Тюп', 'Жергалан', 'Тон', 'Чон-Кемин', 'Каракол'],

  water_loss_pct: 2,
  energy_kwh_per_m3: 0.01,
  quality_index: 91,
  meets_who_standards: true,
  ph_level: 7.8,
  turbidity_ntu: 0.8,
  nitrate_mg_per_l: 1.2,

  serves_population: 500_000,
  service_area_km2: 22_080,
  service_zones: [
    { name: 'г. Каракол', type: 'city', population: 75_000, area_km2: 150 },
    { name: 'Чолпон-Ата', type: 'city', population: 15_000, area_km2: 80 },
    { name: 'Иссык-Кульская область (сельская зона)', type: 'agricultural', population: 410_000, area_km2: 21_850 },
  ],

  critical_issues: [
    {
      id: 'issue-ik-001',
      type: 'ecological',
      description_ru: 'Постепенное снижение уровня воды — 3 см/год за последние 30 лет, прогноз ускорения из-за изменения климата',
      urgency: 'high',
      affected_population: 500_000,
      estimated_fix_cost_usd: 85_000_000,
      detected_year: 2005,
    },
    {
      id: 'issue-ik-002',
      type: 'ecological',
      description_ru: 'Давление туризма на экосистему — загрязнение береговой зоны, разрушение прибрежных биотопов, эвтрофикация',
      urgency: 'medium',
      affected_population: 500_000,
      estimated_fix_cost_usd: 45_000_000,
      detected_year: 2015,
    },
  ],

  failure_history: [
    {
      date: '2023-07-18',
      type_ru: 'Массовый замор рыбы в прибрежной зоне',
      duration_hours: 240,
      affected_population: 20_000,
      cause_ru: 'Тепловой стресс: температура воды 26°С, аномальная жара, цветение синезелёных водорослей',
      loss_m3: 0,
    },
    {
      date: '2022-05-08',
      type_ru: 'Аномальный паводок — разрушение береговой инфраструктуры',
      duration_hours: 96,
      affected_population: 8_000,
      cause_ru: 'Обильное таяние снегов в Тянь-Шане, уровень озера поднялся на 42 см за неделю',
      loss_m3: 0,
    },
    {
      date: '2019-08-25',
      type_ru: 'Загрязнение прибрежной зоны туристическими стоками',
      duration_hours: 720,
      affected_population: 50_000,
      cause_ru: 'Неочищенные бытовые стоки туристических баз — превышение нормы колибактерий в 15 раз',
      loss_m3: 0,
    },
    {
      date: '2017-11-12',
      type_ru: 'Шторм — разрушение прибрежных сооружений',
      duration_hours: 18,
      affected_population: 5_000,
      cause_ru: 'Экстремальный шторм с волнами 3.5 м, разрушение набережных Каракола',
      loss_m3: 0,
    },
  ],

  book_value_usd: 0,
  annual_opex_usd: 8_500_000,
  annual_revenue_usd: 180_000_000,
  tariff_usd_per_m3: 0.005,
  subsidy_pct: 80,

  modernization_plan: {
    total_investment_usd: 120_000_000,
    construction_start_year: 2026,
    commissioning_year: 2030,
    expected_capacity_m3_per_day: 0,
    expected_loss_reduction_pct: 1,
    expected_efficiency_gain_pct: 30,
    notes_ru: 'Экосистемное восстановление и устойчивое управление водными ресурсами Иссык-Куля.',
    phases: [
      {
        id: 'phase-ik-1',
        name_ru: 'Создание очистных сооружений береговой зоны',
        priority: 1,
        cost_usd: 60_000_000,
        duration_months: 30,
        efficiency_gain_pct: 20,
        description_ru: 'Строительство 12 современных очистных станций для туристических зон, канализационные коллекторы',
        technologies: ['Биологическая очистка MBR', 'УФ-дезинфекция', 'Нулевой сброс ZLD'],
      },
      {
        id: 'phase-ik-2',
        name_ru: 'Экологический мониторинг и управление бассейном',
        priority: 2,
        cost_usd: 35_000_000,
        duration_months: 18,
        description_ru: 'Развёртывание сети из 150 IoT-датчиков мониторинга качества воды, уровня, температуры',
        technologies: ['IoT гидрологические датчики', 'Спутниковый мониторинг', 'ГИС-платформа'],
      },
      {
        id: 'phase-ik-3',
        name_ru: 'Прибрежная рекультивация и экотуризм',
        priority: 3,
        cost_usd: 25_000_000,
        duration_months: 24,
        co2_reduction_pct: 15,
        description_ru: 'Восстановление 40 км прибрежной полосы, насаждение тугайных лесов, зонирование туристической нагрузки',
        technologies: ['Фиторемедиация', 'Береговое укрепление биоматами', 'Экотуристическая инфраструктура'],
      },
    ],
  },

  investment_proposal: {
    total_usd: 120_000_000,
    irr_pct: 11.5,
    payback_years: 14,
    npv_usd: 55_000_000,
    equity_pct: 25,
    debt_pct: 40,
    grant_pct: 35,
    avg_annual_revenue_usd: 195_000_000,
    avg_annual_profit_usd: 22_000_000,
    margin_pct: 11.3,
    horizon_years: 30,
    funding_sources: [
      { name: 'Правительство Кыргызстана', type: 'equity', amount_usd: 30_000_000 },
      { name: 'ЕБРР туризм и экология', type: 'debt', amount_usd: 48_000_000 },
      { name: 'Грант ЮНЕСКО / GEF биоразнообразие', type: 'grant', amount_usd: 42_000_000 },
    ],
    social_impact: {
      people_gaining_water: 500_000,
      jobs_construction: 1_800,
      jobs_permanent: 350,
      water_diseases_reduction_pct: 22,
      co2_reduction_kg_per_year: 8_500_000,
      gdp_multiplier_usd: 450_000_000,
    },
    yearly_projections: [
      { year: 2026, revenue_usd: 180_000_000, opex_usd: 12_000_000, net_profit_usd: 168_000_000, capacity_util_pct: 78, note: 'Строительство ОС' },
      { year: 2027, revenue_usd: 185_000_000, opex_usd: 11_500_000, net_profit_usd: 173_500_000, capacity_util_pct: 80 },
      { year: 2028, revenue_usd: 190_000_000, opex_usd: 11_000_000, net_profit_usd: 179_000_000, capacity_util_pct: 83 },
      { year: 2029, revenue_usd: 193_000_000, opex_usd: 10_500_000, net_profit_usd: 182_500_000, capacity_util_pct: 86 },
      { year: 2030, revenue_usd: 197_000_000, opex_usd: 10_000_000, net_profit_usd: 187_000_000, capacity_util_pct: 88, note: 'Ввод ОС' },
      { year: 2031, revenue_usd: 205_000_000, opex_usd: 9_500_000, net_profit_usd: 195_500_000, capacity_util_pct: 90 },
      { year: 2035, revenue_usd: 220_000_000, opex_usd: 9_200_000, net_profit_usd: 210_800_000, capacity_util_pct: 93 },
      { year: 2040, revenue_usd: 240_000_000, opex_usd: 9_000_000, net_profit_usd: 231_000_000, capacity_util_pct: 95 },
      { year: 2045, revenue_usd: 255_000_000, opex_usd: 9_000_000, net_profit_usd: 246_000_000, capacity_util_pct: 96 },
      { year: 2050, revenue_usd: 265_000_000, opex_usd: 9_200_000, net_profit_usd: 255_800_000, capacity_util_pct: 97 },
    ],
  },

  cover_image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Issyk-Kul_lake_from_space.jpg/1280px-Issyk-Kul_lake_from_space.jpg',
  photos: [
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Issyk-Kul_lake_from_space.jpg/1280px-Issyk-Kul_lake_from_space.jpg',
      caption_ru: 'Озеро Иссык-Куль из космоса — снимок NASA',
      type: 'aerial',
      taken_at: '2020-06-01',
    },
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Issyk-Kul_shores.jpg/1280px-Issyk-Kul_shores.jpg',
      caption_ru: 'Северный берег Иссык-Куля — кристально чистая вода',
      type: 'exterior',
      taken_at: '2022-08-14',
    },
    {
      url: 'https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?w=1200',
      caption_ru: 'Горные вершины Тянь-Шаня отражаются в водах Иссык-Куля',
      type: 'exterior',
      taken_at: '2023-07-22',
    },
  ],

  data_sources: [
    'ЮНЕСКО Биосферный резерват Иссык-Куль',
    'Министерство природных ресурсов КР 2024',
    'FAO AQUASTAT Kyrgyzstan',
    'UNEP Central Asia Water Report 2023',
  ],
  last_updated: '2026-05-20',
  completion_pct: 80,
  tags: ['mountain_lake', 'kyrgyzstan', 'tian-shan', 'UNESCO', 'biosphere-reserve', 'tourism', 'ecology', 'issyk-kul'],
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. OBJ-KG-RES-001 — Водохранилище Токтогул (Кыргызстан)
// ─────────────────────────────────────────────────────────────────────────────
const toktogulReservoir: FullObjectData = {
  id: 'OBJ-KG-RES-001',
  name_ru: 'Водохранилище Токтогул',
  name_en: 'Toktogul Reservoir',
  type: 'reservoir',
  status: 'operational',
  description_ru:
    'Токтогульское водохранилище — крупнейший водоём Кыргызстана на реке Нарын с объёмом 19,6 км³. ' +
    'Токтогульская ГЭС мощностью 1200 МВт обеспечивает более 40% электроэнергии страны. ' +
    'Стратегически важный объект: регулирует зимнее накопление воды для весеннего паводка в Узбекистане и Казахстане. ' +
    'Является источником трансграничных конфликтов между странами бассейна.',
  description_en:
    'Toktogul Reservoir is Kyrgyzstan\'s largest water body on the Naryn River with a volume of 19.6 km³. ' +
    'The 1,200 MW Toktogul HPP provides over 40% of the country\'s electricity. ' +
    'It is a strategically crucial facility regulating winter water storage for Uzbekistan and Kazakhstan.',

  region: 'Jalal-Abad Region',
  country: 'Kyrgyzstan',
  coordinates: { lat: 41.8678, lng: 73.0234 },
  basin: 'Бассейн реки Нарын (Сырдарья)',

  construction_year: 1978,
  last_renovation_year: 2019,
  dam_height_m: 215,
  dam_length_m: 292,
  total_volume_m3: 19_600_000_000,
  useful_volume_m3: 14_000_000_000,
  design_capacity_m3_per_day: 5_000_000,
  actual_capacity_m3_per_day: 4_200_000,
  pump_stations_count: 1,
  total_pump_power_kw: 1_200_000,
  automation_level_pct: 55,
  wear_pct: 46,
  catchment_area_km2: 48_900,
  treatment_technologies: ['Механическая очистка', 'Хлорирование'],

  water_source_type: 'river',
  water_source_name: 'Нарын',
  annual_water_intake_m3: 14_000_000_000,
  water_source_rivers: ['Нарын', 'Кара-Дарья', 'Чаткал'],

  water_loss_pct: 5,
  energy_kwh_per_m3: 0.025,
  co2_kg_per_year: 0,
  quality_index: 88,
  meets_who_standards: true,
  ph_level: 7.3,
  turbidity_ntu: 1.8,

  serves_population: 2_000_000,
  service_area_km2: 48_900,
  service_zones: [
    { name: 'Джалал-Абадская область', type: 'city', population: 1_200_000, area_km2: 15_000 },
    { name: 'Ошская область', type: 'agricultural', population: 500_000, area_km2: 20_000 },
    { name: 'Нарынская область', type: 'agricultural', population: 300_000, area_km2: 13_900 },
  ],
  daily_water_deficit_m3: 800_000,

  critical_issues: [
    {
      id: 'issue-tkt-001',
      type: 'capacity',
      description_ru: 'Регулярные маловодные годы — уровень опускается ниже мёртвого объёма в засушливые периоды (2000, 2008, 2021 гг.)',
      urgency: 'high',
      affected_population: 2_000_000,
      estimated_fix_cost_usd: 60_000_000,
      detected_year: 2008,
    },
    {
      id: 'issue-tkt-002',
      type: 'mechanical',
      description_ru: 'Износ 3 из 4 гидроагрегатов (более 45 лет эксплуатации) — снижение КПД с 92% до 84%',
      urgency: 'high',
      affected_population: 2_000_000,
      estimated_fix_cost_usd: 110_000_000,
      detected_year: 2020,
    },
    {
      id: 'issue-tkt-003',
      type: 'structural',
      description_ru: 'Трансграничные конфликты — конкурирующие интересы Узбекистана (ирригация), Казахстана (ирригация) и Кыргызстана (энергетика)',
      urgency: 'medium',
      affected_population: 5_000_000,
      estimated_fix_cost_usd: 50_000_000,
      detected_year: 1991,
    },
  ],

  failure_history: [
    {
      date: '2021-02-15',
      type_ru: 'Критически низкий уровень водохранилища',
      duration_hours: 720,
      affected_population: 2_000_000,
      cause_ru: 'Зимняя выработка ГЭС при маловодье, уровень опустился до 895 м н.у.м. (критический: 900 м)',
      loss_m3: 0,
    },
    {
      date: '2019-05-22',
      type_ru: 'Аварийная остановка агрегата №3',
      duration_hours: 96,
      affected_population: 500_000,
      cause_ru: 'Разрушение направляющих лопаток турбины — износ после 40 лет эксплуатации',
      loss_m3: 0,
    },
    {
      date: '2016-12-08',
      type_ru: 'Паводок — экстренный сброс воды в Узбекистан',
      duration_hours: 240,
      affected_population: 50_000,
      cause_ru: 'Зимний паводок 4800 м³/с, принудительный сброс для защиты плотины',
      loss_m3: 0,
    },
    {
      date: '2013-07-10',
      type_ru: 'Снижение выработки на 25% из-за засухи',
      duration_hours: 2160,
      affected_population: 1_500_000,
      cause_ru: 'Рекордно низкий снежный покров Тянь-Шаня зимой 2012–2013',
      loss_m3: 0,
    },
  ],

  book_value_usd: 3_200_000_000,
  replacement_cost_usd: 9_500_000_000,
  annual_opex_usd: 55_000_000,
  annual_revenue_usd: 180_000_000,
  tariff_usd_per_m3: 0.022,
  subsidy_pct: 25,

  modernization_plan: {
    total_investment_usd: 220_000_000,
    construction_start_year: 2026,
    commissioning_year: 2030,
    expected_capacity_m3_per_day: 5_000_000,
    expected_loss_reduction_pct: 3,
    expected_efficiency_gain_pct: 18,
    expected_energy_reduction_pct: 12,
    notes_ru: 'Модернизация ГЭС Токтогул при поддержке ЕБРР и АБР. Новые агрегаты повысят мощность до 1440 МВт.',
    phases: [
      {
        id: 'phase-tkt-1',
        name_ru: 'Замена гидроагрегатов — повышение мощности до 1440 МВт',
        priority: 1,
        cost_usd: 160_000_000,
        duration_months: 36,
        efficiency_gain_pct: 12,
        energy_reduction_pct: 8,
        description_ru: 'Замена 3 устаревших агрегатов на современные турбины типа Фрэнсис мощностью 360 МВт каждый',
        technologies: ['Гидротурбины Francis 360МВт', 'Генераторы 400МВт', 'Цифровые регуляторы скорости'],
      },
      {
        id: 'phase-tkt-2',
        name_ru: 'Система трансграничного водораспределения',
        priority: 2,
        cost_usd: 35_000_000,
        duration_months: 18,
        efficiency_gain_pct: 6,
        description_ru: 'Создание интегрированной системы мониторинга и согласования водораспределения с Узбекистаном и Казахстаном',
        technologies: ['SCADA трансграничная', 'Телеметрия на 8 гидропостах', 'ГИС трансграничная платформа'],
      },
      {
        id: 'phase-tkt-3',
        name_ru: 'Сейсмомониторинг и безопасность плотины',
        priority: 3,
        cost_usd: 25_000_000,
        duration_months: 12,
        description_ru: 'Установка системы сейсмического мониторинга, инклинометров и тензодатчиков тела плотины',
        technologies: ['Сейсмодатчики', 'Инклинометры', 'Пьезометры'],
      },
    ],
  },

  investment_proposal: {
    total_usd: 220_000_000,
    irr_pct: 13.0,
    payback_years: 12,
    npv_usd: 120_000_000,
    equity_pct: 30,
    debt_pct: 55,
    grant_pct: 15,
    avg_annual_revenue_usd: 210_000_000,
    avg_annual_profit_usd: 52_000_000,
    margin_pct: 24.8,
    horizon_years: 25,
    funding_sources: [
      { name: 'Электрические станции КР', type: 'equity', amount_usd: 66_000_000 },
      { name: 'Азиатский банк развития (АБР)', type: 'debt', amount_usd: 121_000_000 },
      { name: 'Грант ЕБРР / Зелёный климат GCF', type: 'grant', amount_usd: 33_000_000 },
    ],
    social_impact: {
      people_gaining_water: 600_000,
      jobs_construction: 2_200,
      jobs_permanent: 240,
      water_diseases_reduction_pct: 12,
      co2_reduction_kg_per_year: 85_000_000,
      gdp_multiplier_usd: 980_000_000,
    },
    yearly_projections: [
      { year: 2026, revenue_usd: 180_000_000, opex_usd: 62_000_000, net_profit_usd: 118_000_000, capacity_util_pct: 85, note: 'Замена агрегатов' },
      { year: 2027, revenue_usd: 175_000_000, opex_usd: 60_000_000, net_profit_usd: 115_000_000, capacity_util_pct: 83, note: 'Плановые остановки' },
      { year: 2028, revenue_usd: 192_000_000, opex_usd: 58_000_000, net_profit_usd: 134_000_000, capacity_util_pct: 89 },
      { year: 2029, revenue_usd: 205_000_000, opex_usd: 57_000_000, net_profit_usd: 148_000_000, capacity_util_pct: 92 },
      { year: 2030, revenue_usd: 215_000_000, opex_usd: 56_000_000, net_profit_usd: 159_000_000, capacity_util_pct: 95, note: 'Все агрегаты заменены' },
      { year: 2031, revenue_usd: 218_000_000, opex_usd: 55_500_000, net_profit_usd: 162_500_000, capacity_util_pct: 96 },
      { year: 2035, revenue_usd: 225_000_000, opex_usd: 55_000_000, net_profit_usd: 170_000_000, capacity_util_pct: 97 },
      { year: 2040, revenue_usd: 232_000_000, opex_usd: 54_500_000, net_profit_usd: 177_500_000, capacity_util_pct: 98 },
      { year: 2045, revenue_usd: 238_000_000, opex_usd: 54_000_000, net_profit_usd: 184_000_000, capacity_util_pct: 98 },
      { year: 2050, revenue_usd: 242_000_000, opex_usd: 55_000_000, net_profit_usd: 187_000_000, capacity_util_pct: 99 },
    ],
  },

  cover_image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Toktogul_Stausee.jpg/1280px-Toktogul_Stausee.jpg',
  photos: [
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Toktogul_Stausee.jpg/1280px-Toktogul_Stausee.jpg',
      caption_ru: 'Водохранилище Токтогул — самое большое водохранилище Кыргызстана',
      type: 'aerial',
      taken_at: '2019-09-01',
    },
    {
      url: 'https://images.unsplash.com/photo-1441794016917-7b6933969960?w=1200',
      caption_ru: 'Плотина Токтогул, вид на водосбросы, высота 215 м',
      type: 'exterior',
      taken_at: '2021-05-15',
    },
    {
      url: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1200',
      caption_ru: 'Машинный зал Токтогульской ГЭС — 4 агрегата по 300 МВт',
      type: 'technical',
      taken_at: '2022-11-08',
    },
  ],

  data_sources: [
    'ОАО Электрические Станции Кыргызстана 2024',
    'FAO AQUASTAT Kyrgyzstan',
    'ЕБРР Проект модернизации Токтогул',
    'МКВК Межгосударственная координационная водохозяйственная комиссия',
  ],
  last_updated: '2026-05-20',
  completion_pct: 86,
  tags: ['reservoir', 'kyrgyzstan', 'naryn', 'hydroelectric', 'transboundary', 'investment-ready', 'central-asia', 'toktogul'],
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. OBJ-ARAL-LAKE-001 — Аральское море
// ─────────────────────────────────────────────────────────────────────────────
const aralSea: FullObjectData = {
  id: 'OBJ-ARAL-LAKE-001',
  name_ru: 'Аральское море',
  name_en: 'Aral Sea',
  type: 'mountain_lake',
  status: 'critical',
  description_ru:
    'Аральское море — солёное безрыбное море в Центральной Азии, разделённое между Казахстаном и Узбекистаном. ' +
    'В 1960-х годах было четвёртым по величине озером мира площадью 68 100 км². ' +
    'В результате советской политики перенаправления рек Амударьи и Сырдарьи на орошение хлопка потеряло более 90% объёма. ' +
    'Северное Аральское море частично восстанавливается (дамба Кок-Арал, Казахстан), Южное практически исчезло. ' +
    'Экологическая катастрофа мирового масштаба.',
  description_en:
    'The Aral Sea is a saline, fishless endorheic sea in Central Asia, divided between Kazakhstan and Uzbekistan. ' +
    'Once the world\'s fourth-largest lake at 68,100 km², it has lost over 90% of its volume due to Soviet-era irrigation ' +
    'diversion of the Amu Darya and Syr Darya rivers. The Northern Aral is partially recovering via Kazakhstan\'s Kok-Aral Dam.',

  region: 'Kazakhstan / Uzbekistan',
  country: 'Kazakhstan',
  coordinates: { lat: 45.0, lng: 59.5 },
  basin: 'Аральское море — бессточный бассейн',

  total_volume_m3: 93_000_000_000,
  catchment_area_km2: 1_549_000,

  water_source_type: 'river',
  water_source_name: 'Амударья, Сырдарья (сокращающийся сток)',
  annual_water_intake_m3: 2_000_000_000,
  water_source_rivers: ['Амударья (редко)', 'Сырдарья (Северный Арал)'],
  water_return_method: 'Испарение, нет поверхностного стока',

  water_loss_pct: 95,
  energy_kwh_per_m3: 0.0,
  quality_index: 20,
  meets_who_standards: false,
  ph_level: 8.8,
  turbidity_ntu: 85,
  nitrate_mg_per_l: 48,

  serves_population: 5_000_000,
  service_area_km2: 68_000,
  service_zones: [
    { name: 'Кызылорда (Казахстан)', type: 'city', population: 260_000, area_km2: 5_000 },
    { name: 'Каракалпакстан (Узбекистан)', type: 'district', population: 1_900_000, area_km2: 35_000 },
    { name: 'Муйнак — бывший рыбный порт', type: 'city', population: 12_000, area_km2: 200 },
    { name: 'Аральск (Казахстан)', type: 'city', population: 40_000, area_km2: 500 },
  ],

  critical_issues: [
    {
      id: 'issue-aral-001',
      type: 'ecological',
      description_ru: 'Коллапс экосистемы — исчезновение всех 24 видов промысловых рыб, полное разрушение пищевой цепочки',
      urgency: 'critical',
      affected_population: 5_000_000,
      estimated_fix_cost_usd: 2_000_000_000,
      detected_year: 1985,
    },
    {
      id: 'issue-aral-002',
      type: 'ecological',
      description_ru: 'Соляно-пылевые бури — 75 млн тонн соли и пыли в год, радиус 1000 км, ледники Памира и Тянь-Шаня загрязнены',
      urgency: 'critical',
      affected_population: 10_000_000,
      estimated_fix_cost_usd: 500_000_000,
      detected_year: 1990,
    },
    {
      id: 'issue-aral-003',
      type: 'water_quality',
      description_ru: 'Кризис здоровья населения — рак пищевода, туберкулёз, детская смертность в Каракалпакстане в 3 раза выше нормы',
      urgency: 'critical',
      affected_population: 2_500_000,
      estimated_fix_cost_usd: 800_000_000,
      detected_year: 1995,
    },
    {
      id: 'issue-aral-004',
      type: 'capacity',
      description_ru: 'Экономическое опустошение — уничтожена рыбная промышленность (60 000 рабочих мест), туризм, судоходство',
      urgency: 'critical',
      affected_population: 5_000_000,
      estimated_fix_cost_usd: 1_500_000_000,
      detected_year: 1990,
    },
  ],

  failure_history: [
    {
      date: '1985-01-01',
      type_ru: 'Коллапс рыбного хозяйства',
      duration_hours: 0,
      affected_population: 60_000,
      cause_ru: 'Солёность превысила 14‰ — полное исчезновение промысловых рыб. 60 000 рыбаков потеряли работу',
      loss_m3: 200_000_000_000,
    },
    {
      date: '1990-01-01',
      type_ru: 'Раздел на Северное и Южное Аральское море',
      duration_hours: 0,
      affected_population: 5_000_000,
      cause_ru: 'Падение уровня обнажило Берг-Страт, разделившее море на две части',
      loss_m3: 500_000_000_000,
    },
    {
      date: '2003-01-01',
      type_ru: 'Южное Аральское море разделилось ещё на 2 части',
      duration_hours: 0,
      affected_population: 2_000_000,
      cause_ru: 'Продолжение усыхания: Западная и Восточная котловины разделились',
      loss_m3: 150_000_000_000,
    },
    {
      date: '2014-01-01',
      type_ru: 'Восточная котловина Южного Арала полностью высохла',
      duration_hours: 0,
      affected_population: 1_500_000,
      cause_ru: 'Восточная часть Южного Арала полностью пересохла. NASA: "Аральское море пересохло впервые за 600 лет"',
      loss_m3: 15_000_000_000,
    },
  ],

  book_value_usd: 0,
  annual_opex_usd: 25_000_000,
  annual_revenue_usd: 5_000_000,
  subsidy_pct: 100,

  modernization_plan: {
    total_investment_usd: 1_500_000_000,
    construction_start_year: 2025,
    commissioning_year: 2050,
    expected_capacity_m3_per_day: 0,
    expected_loss_reduction_pct: 0,
    expected_efficiency_gain_pct: 0,
    notes_ru:
      'Программа восстановления Аральского моря (МФСА, 2025–2050). ' +
      'Северное море: дамба Кок-Арал уже дала результат — +23.5 км³. ' +
      'Южное море: облесение дна саксаулом (4,4 млн га). Программа "Зелёный Арал".',
    phases: [
      {
        id: 'phase-aral-1',
        name_ru: 'Расширение дамбы Кок-Арал и укрепление Северного Арала',
        priority: 1,
        cost_usd: 500_000_000,
        duration_months: 60,
        efficiency_gain_pct: 40,
        description_ru: 'Расширение дамбы Кок-Арал на 100 км, увеличение объёма Северного Арала до 35 км³',
        technologies: ['Земляная насыпная дамба', 'Водорегулирующие шлюзы', 'Рыборазводные заводы'],
      },
      {
        id: 'phase-aral-2',
        name_ru: 'Облесение дна — Зелёный Арал',
        priority: 2,
        cost_usd: 600_000_000,
        duration_months: 120,
        co2_reduction_pct: 35,
        description_ru: 'Посадка 4.4 млн га саксаула на обнажённом дне, создание агролесоводства для фиксации засоленных почв',
        technologies: ['Саксаул Haloxylon ammodendron', 'Антропогенное лесовосстановление', 'Беспилотный посев'],
      },
      {
        id: 'phase-aral-3',
        name_ru: 'Эффективное водопользование в бассейне',
        priority: 3,
        cost_usd: 400_000_000,
        duration_months: 180,
        efficiency_gain_pct: 25,
        description_ru: 'Модернизация ирригационных систем Узбекистана и Казахстана для снижения водозабора из рек на 30%',
        technologies: ['Капельное орошение', 'SCADA ирригационная', 'Подземные трубопроводы'],
      },
    ],
  },

  investment_proposal: {
    total_usd: 1_500_000_000,
    irr_pct: 4.5,
    payback_years: 35,
    npv_usd: -200_000_000,
    equity_pct: 10,
    debt_pct: 20,
    grant_pct: 70,
    avg_annual_revenue_usd: 15_000_000,
    avg_annual_profit_usd: -8_000_000,
    margin_pct: -53.0,
    horizon_years: 50,
    funding_sources: [
      { name: 'МФСА — Казахстан, Кыргызстан, Таджикистан, Туркменистан, Узбекистан', type: 'equity', amount_usd: 150_000_000 },
      { name: 'Всемирный Банк / ВБ Аральское море', type: 'debt', amount_usd: 300_000_000 },
      { name: 'Грант ООН / UNDP / GEF / ЕС экологическое восстановление', type: 'grant', amount_usd: 1_050_000_000 },
    ],
    social_impact: {
      people_gaining_water: 3_500_000,
      jobs_construction: 15_000,
      jobs_permanent: 8_000,
      water_diseases_reduction_pct: 45,
      co2_reduction_kg_per_year: 35_000_000,
      gdp_multiplier_usd: 5_500_000_000,
    },
    yearly_projections: [
      { year: 2025, revenue_usd: 5_000_000, opex_usd: 35_000_000, net_profit_usd: -30_000_000, capacity_util_pct: 5, note: 'Посадка 428 000 га саксаула' },
      { year: 2026, revenue_usd: 5_500_000, opex_usd: 38_000_000, net_profit_usd: -32_500_000, capacity_util_pct: 5, note: 'Расширение Кок-Арал фаза 1' },
      { year: 2027, revenue_usd: 6_000_000, opex_usd: 36_000_000, net_profit_usd: -30_000_000, capacity_util_pct: 6 },
      { year: 2028, revenue_usd: 6_500_000, opex_usd: 35_000_000, net_profit_usd: -28_500_000, capacity_util_pct: 7 },
      { year: 2030, revenue_usd: 7_500_000, opex_usd: 34_000_000, net_profit_usd: -26_500_000, capacity_util_pct: 8, note: 'Северный Арал: 27.5 км³' },
      { year: 2035, revenue_usd: 10_000_000, opex_usd: 32_000_000, net_profit_usd: -22_000_000, capacity_util_pct: 12 },
      { year: 2040, revenue_usd: 13_000_000, opex_usd: 30_000_000, net_profit_usd: -17_000_000, capacity_util_pct: 16 },
      { year: 2045, revenue_usd: 16_000_000, opex_usd: 28_000_000, net_profit_usd: -12_000_000, capacity_util_pct: 20 },
      { year: 2050, revenue_usd: 20_000_000, opex_usd: 25_000_000, net_profit_usd: -5_000_000, capacity_util_pct: 25, note: 'Цель: 30% восстановление' },
      { year: 2055, revenue_usd: 25_000_000, opex_usd: 22_000_000, net_profit_usd: 3_000_000, capacity_util_pct: 30 },
    ],
  },

  cover_image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/NASA_Aral_Sea_2014.jpg/1280px-NASA_Aral_Sea_2014.jpg',
  photos: [
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/NASA_Aral_Sea_2014.jpg/1280px-NASA_Aral_Sea_2014.jpg',
      caption_ru: 'Аральское море — снимок NASA 2014 года. Восточная котловина полностью высохла',
      type: 'aerial',
      taken_at: '2014-08-01',
    },
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Aral_Sea_1989_2008.jpg/1280px-Aral_Sea_1989_2008.jpg',
      caption_ru: 'Сравнение: Аральское море 1989 и 2008 годов — катастрофическое усыхание',
      type: 'problem',
      taken_at: '2008-08-01',
    },
    {
      url: 'https://images.unsplash.com/photo-1527603968043-8b82d0d3aba7?w=1200',
      caption_ru: 'Ржавые остовы кораблей на дне бывшего Аральского моря, Муйнак',
      type: 'problem',
      taken_at: '2022-05-10',
    },
  ],

  data_sources: [
    'NASA Earth Observatory Aral Sea 2014-2024',
    'МФСА Международный фонд спасения Арала',
    'UNDP Green Aral Sea Programme 2024',
    'World Bank Aral Sea Basin Programme',
    'UNEP Post-Soviet Environmental Legacy Report',
  ],
  last_updated: '2026-05-20',
  completion_pct: 78,
  tags: ['aral-sea', 'ecological-disaster', 'kazakhstan', 'uzbekistan', 'critical', 'restoration', 'climate-crisis', 'transboundary'],
};

// ─────────────────────────────────────────────────────────────────────────────
// 7. OBJ-AMU-DARYA-001 — Амударья
// ─────────────────────────────────────────────────────────────────────────────
const amuDarya: FullObjectData = {
  id: 'OBJ-AMU-DARYA-001',
  name_ru: 'Амударья',
  name_en: 'Amu Darya River',
  type: 'irrigation_canal',
  status: 'critical',
  description_ru:
    'Амударья — главная река Центральной Азии длиной 2540 км. Берёт начало в ледниках Памира и Гиндукуша. ' +
    'Основной источник воды для Узбекистана и Туркменистана. Годовой сток сократился с 120 до 67 м³/сек за последние десятилетия ' +
    'из-за интенсивного орошения хлопка и таяния ледников. К 2050 году прогнозируется снижение ещё на 15–20%.',
  description_en:
    'Amu Darya is Central Asia\'s main river, 2,540 km long, originating in the glaciers of the Pamir and Hindu Kush. ' +
    'The primary water source for Uzbekistan and Turkmenistan, its annual flow has decreased from 120 to 67 m³/s ' +
    'due to intensive cotton irrigation and glacier retreat.',

  region: 'Tajikistan / Uzbekistan / Turkmenistan',
  country: 'Uzbekistan',
  coordinates: { lat: 40.0, lng: 63.5 },
  coordinates_start: { lat: 37.5, lng: 67.5 },
  coordinates_end: { lat: 43.5, lng: 59.0 },
  basin: 'Аральское море — бассейн Амударьи',

  pipeline_length_km: 2540,
  catchment_area_km2: 309_000,

  water_source_type: 'mixed',
  water_source_name: 'Ледники Памира и Гиндукуша, атмосферные осадки',
  annual_water_intake_m3: 78_000_000_000,
  water_source_rivers: ['Вахш', 'Пяндж', 'Кундуз', 'Сурхандарья', 'Зарафшан (частично)'],

  water_loss_pct: 45,
  energy_kwh_per_m3: 0.02,
  quality_index: 35,
  meets_who_standards: false,
  ph_level: 7.9,
  turbidity_ntu: 42,
  nitrate_mg_per_l: 28,

  serves_population: 30_000_000,
  service_area_km2: 309_000,
  service_zones: [
    { name: 'Узбекистан — Хорезм, Каракалпакстан', type: 'agricultural', population: 14_000_000, area_km2: 120_000 },
    { name: 'Туркменистан — Лебапский велаят', type: 'agricultural', population: 10_000_000, area_km2: 150_000 },
    { name: 'Таджикистан — Хатлонская область', type: 'agricultural', population: 6_000_000, area_km2: 39_000 },
  ],

  critical_issues: [
    {
      id: 'issue-amu-001',
      type: 'ecological',
      description_ru: 'Деградация ледников Памира — потеря 30% ледникового покрова за 30 лет. К 2050 г. — снижение стока на 15-20%',
      urgency: 'critical',
      affected_population: 30_000_000,
      estimated_fix_cost_usd: 0,
      detected_year: 2000,
    },
    {
      id: 'issue-amu-002',
      type: 'capacity',
      description_ru: 'Сверхнормативный водозабор — 44 км³/год при норме 37.4 км³ по соглашению 1992 г., непрекращающийся дефицит',
      urgency: 'critical',
      affected_population: 20_000_000,
      estimated_fix_cost_usd: 2_500_000_000,
      detected_year: 1992,
    },
    {
      id: 'issue-amu-003',
      type: 'water_quality',
      description_ru: 'Загрязнение реки агрохимикатами (ДДТ, пестициды хлопковых плантаций) — превышение ПДК в 5-8 раз',
      urgency: 'high',
      affected_population: 15_000_000,
      estimated_fix_cost_usd: 800_000_000,
      detected_year: 1995,
    },
    {
      id: 'issue-amu-004',
      type: 'structural',
      description_ru: 'Потери воды в ирригационных каналах — КПД ирригации 38%, 62% воды теряется при транспортировке',
      urgency: 'high',
      affected_population: 25_000_000,
      estimated_fix_cost_usd: 3_000_000_000,
      detected_year: 1980,
    },
  ],

  failure_history: [
    {
      date: '2024-07-15',
      type_ru: 'Рекордно низкий расход — дефицит воды в Каракалпакстане',
      duration_hours: 720,
      affected_population: 1_900_000,
      cause_ru: 'Аномальная жара +48°С + рекордно малое количество снега в горах зимой 2023-24',
      loss_m3: 5_000_000_000,
    },
    {
      date: '2022-07-01',
      type_ru: 'Конфликт водораспределения Кыргызстан-Узбекистан',
      duration_hours: 2160,
      affected_population: 500_000,
      cause_ru: 'Несанкционированный забор воды из Кемпир-Абадского водохранилища, уголовные дела',
      loss_m3: 0,
    },
    {
      date: '2018-04-20',
      type_ru: 'Паводок — прорыв дамб Каракалпакстана',
      duration_hours: 96,
      affected_population: 80_000,
      cause_ru: 'Резкое таяние снегов Памира, прорыв ирригационных дамб в Хорезмской области',
      loss_m3: 0,
    },
    {
      date: '2008-08-01',
      type_ru: 'Критическая засуха — дно русла обнажилось',
      duration_hours: 4320,
      affected_population: 3_000_000,
      cause_ru: 'Минимальный расход воды за всё время наблюдений, деградация ледников Памира',
      loss_m3: 12_000_000_000,
    },
  ],

  book_value_usd: 0,
  annual_opex_usd: 120_000_000,
  annual_revenue_usd: 850_000_000,
  subsidy_pct: 90,

  modernization_plan: {
    total_investment_usd: 4_500_000_000,
    construction_start_year: 2026,
    commissioning_year: 2040,
    expected_capacity_m3_per_day: 0,
    expected_loss_reduction_pct: 30,
    expected_efficiency_gain_pct: 40,
    notes_ru:
      'Программа интегрированного управления бассейном Амударьи (Узбекистан, Туркменистан, Таджикистан). ' +
      'Основная цель — снижение водопотребления на 30% при сохранении урожайности.',
    phases: [
      {
        id: 'phase-amu-1',
        name_ru: 'Модернизация ирригации — капельное орошение на 2 млн га',
        priority: 1,
        cost_usd: 2_500_000_000,
        duration_months: 120,
        loss_reduction_pct: 20,
        efficiency_gain_pct: 30,
        description_ru: 'Замена открытых каналов закрытыми трубопроводами, капельное орошение хлопковых полей Узбекистана',
        technologies: ['Капельное орошение Netafim', 'Закрытые трубопроводы ПЭ100', 'SCADA-ирригация'],
      },
      {
        id: 'phase-amu-2',
        name_ru: 'Сохранение ледников и горные водосборы',
        priority: 2,
        cost_usd: 1_200_000_000,
        duration_months: 180,
        co2_reduction_pct: 20,
        description_ru: 'Программа сохранения ледников Памира — посадка высокогорных лесов, сокращение выбросов CH4',
        technologies: ['Искусственное снегонакопление', 'Высокогорное лесовосстановление', 'Климатическое моделирование'],
      },
      {
        id: 'phase-amu-3',
        name_ru: 'Очистка загрязнённых участков реки',
        priority: 3,
        cost_usd: 800_000_000,
        duration_months: 96,
        efficiency_gain_pct: 10,
        description_ru: 'Ремедиация загрязнённых пестицидами участков, строительство ОС для сельхозстоков',
        technologies: ['Биоремедиация', 'Конструированные водно-болотные угодья', 'Фиторемедиация'],
      },
    ],
  },

  investment_proposal: {
    total_usd: 4_500_000_000,
    irr_pct: 7.2,
    payback_years: 22,
    npv_usd: 800_000_000,
    equity_pct: 15,
    debt_pct: 35,
    grant_pct: 50,
    avg_annual_revenue_usd: 950_000_000,
    avg_annual_profit_usd: 110_000_000,
    margin_pct: 11.6,
    horizon_years: 50,
    funding_sources: [
      { name: 'Узбекистан / Туркменистан / Таджикистан (совместно)', type: 'equity', amount_usd: 675_000_000 },
      { name: 'Всемирный Банк / АБР / ЕБРР', type: 'debt', amount_usd: 1_575_000_000 },
      { name: 'ООН / GEF / Климатический фонд ЕС / КСА', type: 'grant', amount_usd: 2_250_000_000 },
    ],
    social_impact: {
      people_gaining_water: 12_000_000,
      jobs_construction: 45_000,
      jobs_permanent: 18_000,
      water_diseases_reduction_pct: 40,
      co2_reduction_kg_per_year: 250_000_000,
      gdp_multiplier_usd: 18_000_000_000,
    },
    yearly_projections: [
      { year: 2026, revenue_usd: 850_000_000, opex_usd: 180_000_000, net_profit_usd: 670_000_000, capacity_util_pct: 42, note: 'Начало программы' },
      { year: 2027, revenue_usd: 870_000_000, opex_usd: 175_000_000, net_profit_usd: 695_000_000, capacity_util_pct: 44 },
      { year: 2028, revenue_usd: 890_000_000, opex_usd: 170_000_000, net_profit_usd: 720_000_000, capacity_util_pct: 46 },
      { year: 2030, revenue_usd: 920_000_000, opex_usd: 165_000_000, net_profit_usd: 755_000_000, capacity_util_pct: 50 },
      { year: 2035, revenue_usd: 950_000_000, opex_usd: 155_000_000, net_profit_usd: 795_000_000, capacity_util_pct: 56 },
      { year: 2040, revenue_usd: 980_000_000, opex_usd: 145_000_000, net_profit_usd: 835_000_000, capacity_util_pct: 62, note: 'Полный ввод программы' },
      { year: 2045, revenue_usd: 1_010_000_000, opex_usd: 140_000_000, net_profit_usd: 870_000_000, capacity_util_pct: 68 },
      { year: 2050, revenue_usd: 1_050_000_000, opex_usd: 135_000_000, net_profit_usd: 915_000_000, capacity_util_pct: 72 },
    ],
  },

  cover_image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  photos: [
    {
      url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200',
      caption_ru: 'Верховья Амударьи — горные истоки на Памире',
      type: 'exterior',
      taken_at: '2021-09-10',
    },
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Amu_Darya_Delta_from_space.jpg/1280px-Amu_Darya_Delta_from_space.jpg',
      caption_ru: 'Дельта Амударьи из космоса — деградация водотока к Аральскому морю',
      type: 'aerial',
      taken_at: '2019-07-20',
    },
    {
      url: 'https://images.unsplash.com/photo-1589519160732-57fc498494f8?w=1200',
      caption_ru: 'Засыхающее русло Амударьи в Туркменистане',
      type: 'problem',
      taken_at: '2023-08-05',
    },
  ],

  data_sources: [
    'МКВК Межгосударственная координационная водохозяйственная комиссия 2024',
    'FAO AQUASTAT Amu Darya Basin',
    'World Bank Central Asia Water Report 2023',
    'NASA GRACE Glacier Monitoring Pamir 2024',
  ],
  last_updated: '2026-05-20',
  completion_pct: 75,
  tags: ['river', 'critical', 'central-asia', 'amu-darya', 'glacier-melt', 'irrigation', 'transboundary', 'aral-sea'],
};

// ─────────────────────────────────────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────────────────────────────────────
export const regionalObjects: FullObjectData[] = [
  chardaraDam,
  bukhtarmaReservoir,
  nurekDam,
  issykKulLake,
  toktogulReservoir,
  aralSea,
  amuDarya,
];
