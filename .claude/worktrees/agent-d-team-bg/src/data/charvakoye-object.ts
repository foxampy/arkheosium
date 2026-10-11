// ═══════════════════════════════════════════════════════════════
//  Charvakoye Reservoir — Demo FullObjectData
//  Real data: Chirchiq basin, Tashkent region, Uzbekistan
// ═══════════════════════════════════════════════════════════════

import type { FullObjectData } from '@/types/object-full';

export const charvakoyeObject: FullObjectData = {
  // ─── Core Identity ───────────────────────────────────────────
  id: 'charvakoye-reservoir',
  name_ru: 'Чарвакское водохранилище',
  name_en: 'Charvak Reservoir',
  type: 'reservoir',
  status: 'degraded',
  description_ru:
    'Чарвакское водохранилище — крупнейший стратегический объект водоснабжения Ташкента и Ташкентской области. ' +
    'Введено в эксплуатацию в 1970 году на реке Чирчик. Обеспечивает питьевой и технической водой свыше 5,3 млн человек. ' +
    'В настоящее время работает на уровне 72,5% проектной мощности вследствие заиления, износа насосного оборудования и ' +
    'устаревшей системы водоочистки. Требует комплексной модернизации общей стоимостью $362 млн.',
  description_en:
    'Charvak Reservoir is the largest strategic water supply facility for Tashkent city and Tashkent region. ' +
    'Commissioned in 1970 on the Chirchiq River, it supplies drinking and technical water to over 5.3 million people. ' +
    'Currently operating at 72.5% of design capacity due to siltation, aging pump equipment and outdated treatment systems. ' +
    'Requires comprehensive modernization totalling $362M.',

  // ─── Location ────────────────────────────────────────────────
  region: 'Ташкентская область',
  country: 'Uzbekistan',
  coordinates: { lat: 41.621, lng: 70.030 },
  basin: 'Бассейн реки Чирчик',

  // ─── Technical Specifications ────────────────────────────────
  construction_year: 1970,
  last_renovation_year: 2005,
  design_capacity_m3_per_day: 1_200_000,
  actual_capacity_m3_per_day: 870_000,
  total_volume_m3: 2_000_000_000,
  useful_volume_m3: 1_580_000_000,
  pump_stations_count: 8,
  total_pump_power_kw: 24_000,
  automation_level_pct: 28,
  wear_pct: 44,
  treatment_technologies: [
    'Коагуляция',
    'Флокуляция',
    'Песчаная фильтрация',
    'Хлорирование',
  ],
  dam_height_m: 168,
  dam_length_m: 764,
  catchment_area_km2: 14_900,

  // ─── Water Source & Flow ──────────────────────────────────────
  water_source_type: 'mixed',
  water_source_name: 'Река Чирчик',
  annual_water_intake_m3: 3_100_000_000,
  water_source_rivers: ['Чирчик', 'Чаткал', 'Пскем', 'Коксу'],
  water_return_method: 'Очищенные сточные воды возвращаются в Чирчик ниже по течению',

  // ─── Ecological Indicators ───────────────────────────────────
  water_loss_pct: 34,
  energy_kwh_per_m3: 0.48,
  co2_kg_per_year: 152_000_000,
  quality_index: 68,
  meets_who_standards: false,

  // ─── Service Zones & Population ──────────────────────────────
  serves_population: 5_300_000,
  service_area_km2: 4_054,
  service_zones: [
    {
      name: 'г. Ташкент',
      type: 'city',
      population: 2_900_000,
      area_km2: 334,
    },
    {
      name: 'Чирчик (Ташкентская обл.)',
      type: 'district',
      population: 540_000,
      area_km2: 1_250,
    },
    {
      name: 'Занги-Ата',
      type: 'district',
      population: 380_000,
      area_km2: 850,
    },
    {
      name: 'Юкоричирчик',
      type: 'district',
      population: 310_000,
      area_km2: 1_100,
    },
    {
      name: 'Кибрай',
      type: 'district',
      population: 170_000,
      area_km2: 520,
    },
  ],
  daily_water_deficit_m3: 330_000,

  // ─── Problems & Failure History ──────────────────────────────
  critical_issues: [
    {
      id: 'issue-chv-001',
      type: 'structural',
      description_ru: 'Заиление водохранилища — потеря 21% полезного объёма с 1970 года, продолжающийся процесс',
      urgency: 'high',
      affected_population: 5_300_000,
      estimated_fix_cost_usd: 180_000_000,
      detected_year: 2015,
    },
    {
      id: 'issue-chv-002',
      type: 'mechanical',
      description_ru: 'Износ насосного оборудования — 6 из 8 насосных станций превысили проектный срок службы',
      urgency: 'high',
      affected_population: 3_200_000,
      estimated_fix_cost_usd: 85_000_000,
    },
    {
      id: 'issue-chv-003',
      type: 'mechanical',
      description_ru: 'Низкий уровень автоматизации (28% при целевом 75%) — ручное управление замедляет реакцию на аварии',
      urgency: 'medium',
      affected_population: 5_300_000,
      estimated_fix_cost_usd: 42_000_000,
    },
    {
      id: 'issue-chv-004',
      type: 'water_quality',
      description_ru: 'Качество воды ниже норм ВОЗ — повышенная мутность и концентрация нитратов',
      urgency: 'critical',
      affected_population: 5_300_000,
      estimated_fix_cost_usd: 55_000_000,
    },
  ],
  failure_history: [
    {
      date: '2022-07-15',
      type_ru: 'Авария насосной станции №3',
      duration_hours: 18,
      affected_population: 1_200_000,
      cause_ru: 'Износ рабочего колеса насоса',
      loss_m3: 450_000,
    },
    {
      date: '2020-03-22',
      type_ru: 'Превышение мутности воды',
      duration_hours: 72,
      affected_population: 5_300_000,
      cause_ru: 'Весеннее паводковое замутнение',
      loss_m3: 0,
    },
    {
      date: '2018-11-08',
      type_ru: 'Разрыв магистрального трубопровода',
      duration_hours: 31,
      affected_population: 800_000,
      cause_ru: 'Коррозионный износ трубы 1984 г.',
      loss_m3: 280_000,
    },
    {
      date: '2016-08-19',
      type_ru: 'Снижение мощности на 40%',
      duration_hours: 96,
      affected_population: 5_300_000,
      cause_ru: 'Одновременный выход из строя 3 насосов',
      loss_m3: 0,
    },
  ],

  // ─── Financial Data ──────────────────────────────────────────
  book_value_usd: 890_000_000,
  replacement_cost_usd: 2_800_000_000,
  annual_opex_usd: 31_500_000,
  annual_revenue_usd: 28_900_000,
  tariff_usd_per_m3: 0.09,
  subsidy_pct: 42,

  // ─── Modernization Plan ───────────────────────────────────────
  modernization_plan: {
    total_investment_usd: 362_000_000,
    construction_start_year: 2026,
    commissioning_year: 2030,
    expected_capacity_m3_per_day: 1_380_000,
    expected_loss_reduction_pct: 24,   // 34% → 10%
    expected_efficiency_gain_pct: 15,
    expected_energy_reduction_pct: 33, // 0.48 → 0.32 kWh/m³
    notes_ru:
      'Трёхфазная модернизация рассчитана на 2026–2030 гг. Первоочередной приоритет — ' +
      'замена насосного оборудования для восстановления мощности и снижения потерь.',
    phases: [
      {
        id: 'phase-chv-1',
        name_ru: 'Замена насосного оборудования и трубопроводов',
        priority: 1,
        cost_usd: 185_000_000,
        duration_months: 24,
        capacity_gain_m3_per_day: 180_000,
        loss_reduction_pct: 12,
        energy_reduction_pct: 18,
        description_ru:
          'Замена 6 насосных агрегатов, 180 км магистральных труб, установка SCADA-системы управления',
        technologies: ['Grundfos CR/CRE', 'SCADA автоматизация', 'ПВХ трубопроводы DN1200'],
      },
      {
        id: 'phase-chv-2',
        name_ru: 'Модернизация водоочистного комплекса',
        priority: 2,
        cost_usd: 110_000_000,
        duration_months: 18,
        efficiency_gain_pct: 15,
        description_ru:
          'Новые технологии очистки — качество воды до уровня ВОЗ. ' +
          'Установка мембранных фильтров UF, УФ-обеззараживания и озонирования.',
        technologies: ['Мембранная фильтрация UF', 'УФ-обеззараживание', 'Озонирование'],
      },
      {
        id: 'phase-chv-3',
        name_ru: 'Цифровизация и IoT-мониторинг',
        priority: 3,
        cost_usd: 67_000_000,
        duration_months: 12,
        description_ru:
          'Полная автоматизация объекта до 85%, предиктивное техническое обслуживание на основе ИИ, ' +
          'создание цифрового двойника инфраструктуры.',
        technologies: ['IoT сенсоры', 'ИИ-управление', 'Цифровой двойник'],
      },
    ],
  },

  // ─── Investment Proposal ──────────────────────────────────────
  investment_proposal: {
    total_usd: 362_000_000,
    irr_pct: 14.2,
    payback_years: 11,
    npv_usd: 180_000_000,
    equity_pct: 20,
    debt_pct: 70,
    grant_pct: 10,
    avg_annual_revenue_usd: 47_200_000,
    avg_annual_profit_usd: 8_900_000,
    margin_pct: 18.8,
    horizon_years: 25,
    funding_sources: [
      { name: 'Частный капитал', type: 'equity', amount_usd: 72_400_000 },
      { name: 'ЕБРР / АБР проектное финансирование', type: 'debt', amount_usd: 253_400_000 },
      { name: 'Грант ЕС / ГЭФ водный сектор', type: 'grant', amount_usd: 36_200_000 },
    ],
    social_impact: {
      people_gaining_water: 480_000,
      jobs_construction: 3_200,
      jobs_permanent: 280,
      water_diseases_reduction_pct: 35,
      co2_reduction_kg_per_year: 48_000_000,
    },
    yearly_projections: [
      // ── Construction phase 2026–2029 (negative net profit due to capex service) ──
      { year: 2026, revenue_usd: 28_900_000, opex_usd: 35_200_000, net_profit_usd: -6_300_000, capacity_util_pct: 72.5, note: 'Строительство фаза 1' },
      { year: 2027, revenue_usd: 30_100_000, opex_usd: 34_800_000, net_profit_usd: -4_700_000, capacity_util_pct: 74.0, note: 'Строительство фаза 1–2' },
      { year: 2028, revenue_usd: 33_500_000, opex_usd: 34_100_000, net_profit_usd: -600_000,   capacity_util_pct: 79.5, note: 'Ввод фазы 1' },
      { year: 2029, revenue_usd: 38_200_000, opex_usd: 35_600_000, net_profit_usd: 2_600_000,  capacity_util_pct: 87.0, note: 'Строительство фаза 3' },
      // ── Post-commissioning 2030+ ──
      { year: 2030, revenue_usd: 43_800_000, opex_usd: 39_600_000, net_profit_usd: 4_200_000,  capacity_util_pct: 92.0, note: 'Полный ввод в эксплуатацию' },
      { year: 2031, revenue_usd: 44_900_000, opex_usd: 38_900_000, net_profit_usd: 6_000_000,  capacity_util_pct: 93.5 },
      { year: 2032, revenue_usd: 45_700_000, opex_usd: 38_500_000, net_profit_usd: 7_200_000,  capacity_util_pct: 94.0 },
      { year: 2033, revenue_usd: 46_200_000, opex_usd: 38_200_000, net_profit_usd: 8_000_000,  capacity_util_pct: 94.5 },
      { year: 2034, revenue_usd: 46_800_000, opex_usd: 38_100_000, net_profit_usd: 8_700_000,  capacity_util_pct: 95.0 },
      { year: 2035, revenue_usd: 47_200_000, opex_usd: 38_000_000, net_profit_usd: 9_200_000,  capacity_util_pct: 95.5 },
      { year: 2036, revenue_usd: 47_500_000, opex_usd: 37_800_000, net_profit_usd: 9_700_000,  capacity_util_pct: 96.0 },
      { year: 2037, revenue_usd: 47_800_000, opex_usd: 37_600_000, net_profit_usd: 10_200_000, capacity_util_pct: 96.0 },
      { year: 2038, revenue_usd: 48_100_000, opex_usd: 37_400_000, net_profit_usd: 10_700_000, capacity_util_pct: 96.5 },
      { year: 2039, revenue_usd: 48_400_000, opex_usd: 37_200_000, net_profit_usd: 11_200_000, capacity_util_pct: 96.5 },
      { year: 2040, revenue_usd: 48_700_000, opex_usd: 37_000_000, net_profit_usd: 11_700_000, capacity_util_pct: 97.0 },
      { year: 2041, revenue_usd: 49_000_000, opex_usd: 36_900_000, net_profit_usd: 12_100_000, capacity_util_pct: 97.0 },
      { year: 2042, revenue_usd: 49_200_000, opex_usd: 36_800_000, net_profit_usd: 12_400_000, capacity_util_pct: 97.5 },
      { year: 2043, revenue_usd: 49_400_000, opex_usd: 36_700_000, net_profit_usd: 12_700_000, capacity_util_pct: 97.5 },
      { year: 2044, revenue_usd: 49_500_000, opex_usd: 36_700_000, net_profit_usd: 12_800_000, capacity_util_pct: 98.0 },
      { year: 2045, revenue_usd: 49_600_000, opex_usd: 36_600_000, net_profit_usd: 13_000_000, capacity_util_pct: 98.0 },
      { year: 2046, revenue_usd: 49_700_000, opex_usd: 36_600_000, net_profit_usd: 13_100_000, capacity_util_pct: 98.0 },
      { year: 2047, revenue_usd: 49_800_000, opex_usd: 36_500_000, net_profit_usd: 13_300_000, capacity_util_pct: 98.5 },
      { year: 2048, revenue_usd: 49_900_000, opex_usd: 36_500_000, net_profit_usd: 13_400_000, capacity_util_pct: 98.5 },
      { year: 2049, revenue_usd: 50_000_000, opex_usd: 36_400_000, net_profit_usd: 13_600_000, capacity_util_pct: 99.0 },
      { year: 2050, revenue_usd: 50_100_000, opex_usd: 37_300_000, net_profit_usd: 12_800_000, capacity_util_pct: 99.0, note: 'Плановое обслуживание' },
    ],
  },

  // ─── Media ───────────────────────────────────────────────────
  cover_image_url: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200',
  photos: [
    {
      url: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200',
      caption_ru: 'Чарвакское водохранилище, вид с плотины',
      type: 'exterior',
    },
    {
      url: 'https://images.unsplash.com/photo-1566438480900-0609be27a4be?w=1200',
      caption_ru: 'Аэрофотосъёмка водохранилища',
      type: 'aerial',
    },
    {
      url: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1200',
      caption_ru: 'Машинный зал насосной станции',
      type: 'technical',
    },
    {
      url: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=1200',
      caption_ru: 'Очистное оборудование',
      type: 'interior',
    },
    {
      url: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=1200',
      caption_ru: 'Заиление водохранилища',
      type: 'problem',
    },
    {
      url: 'https://images.unsplash.com/photo-1527515545081-5db817172677?w=1200',
      caption_ru: 'Плотина, вид снизу',
      type: 'exterior',
    },
  ],

  // ─── Metadata ────────────────────────────────────────────────
  data_sources: [
    'FAO AQUASTAT Uzbekistan',
    'World Bank Water Sector Report UZ 2023',
    'АО Узсувтаминот годовой отчет 2024',
    'ВОЗ Стандарты качества воды 2022',
  ],
  last_updated: '2026-05-19',
  completion_pct: 92,
  tags: ['dam', 'reservoir', 'tashkent', 'chirchiq', 'major-infrastructure', 'investment-ready'],
};
