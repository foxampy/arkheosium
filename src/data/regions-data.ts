// ═══════════════════════════════════════════════════════════════
//  VODPROM — Global Water Regions Database
//  Region-based filtering, map navigation & analytics
//  Data sourced from: World Bank, FAO AQUASTAT, UN-Water
// ═══════════════════════════════════════════════════════════════

export interface WaterRegion {
  id: string;
  name_ru: string;
  name_en: string;
  emoji: string; // flag emoji
  countries: string[];
  center: [number, number]; // [lng, lat] for map
  zoom: number; // map zoom level
  color: string; // accent color hex
  description: string; // Russian, 2-3 sentences about water situation
  key_challenges: string[]; // 3-5 main water challenges
  key_stats: {
    population_millions: number;
    water_stress_level: 'low' | 'medium' | 'high' | 'critical';
    renewable_water_per_capita_m3: number;
    irrigation_percent_of_water_use: number;
  };
  key_rivers: string[];
  key_projects_count: number; // approximate
  api_sources: string[]; // which APIs provide data for this region
}

// ─────────────────────────────────────────────────────────────
//  Region Definitions
// ─────────────────────────────────────────────────────────────

const centralAsia: WaterRegion = {
  id: 'central-asia',
  name_ru: 'Центральная Азия',
  name_en: 'Central Asia',
  emoji: '🏔️',
  countries: ['Uzbekistan', 'Kazakhstan', 'Kyrgyzstan', 'Tajikistan', 'Turkmenistan'],
  center: [63.0, 41.5],
  zoom: 5,
  color: '#00e6c8',
  description:
    'Центральная Азия — один из наиболее водно-уязвимых регионов мира. ' +
    'Катастрофа Аральского моря стала символом неустойчивого водопользования, а таяние ледников Тянь-Шаня и Памира угрожает долгосрочному водоснабжению. ' +
    'Трансграничные конфликты за воду между странами бассейнов Амударьи и Сырдарьи остаются одной из ключевых геополитических проблем региона.',
  key_challenges: [
    'Катастрофа Аральского моря и деградация экосистемы',
    'Таяние ледников Тянь-Шаня и Памира (потеря 27% за 50 лет)',
    'Трансграничные водные конфликты (Амударья, Сырдарья)',
    'Зависимость от ирригации (90%+ водопотребления)',
    'Изношенность советской ирригационной инфраструктуры',
  ],
  key_stats: {
    population_millions: 78.5,
    water_stress_level: 'critical',
    // FAO AQUASTAT: суммарно ~2500 м3/чел/год для региона (средневзвешенное)
    renewable_water_per_capita_m3: 2490,
    // FAO AQUASTAT: ~91% водозабора идёт на ирригацию
    irrigation_percent_of_water_use: 91,
  },
  key_rivers: ['Амударья', 'Сырдарья', 'Зеравшан', 'Чу', 'Нарын'],
  key_projects_count: 42,
  api_sources: ['fao-aquastat', 'world-bank', 'cawater-info', 'unece-water'],
};

const middleEastIsrael: WaterRegion = {
  id: 'middle-east-israel',
  name_ru: 'Израиль',
  name_en: 'Israel',
  emoji: '🇮🇱',
  countries: ['Israel'],
  center: [35.2, 31.5],
  zoom: 7,
  color: '#3b82f6',
  description:
    'Израиль — мировой лидер в технологиях водопользования. ' +
    'Страна перерабатывает более 90% сточных вод для повторного использования в сельском хозяйстве и обеспечивает около 70% питьевой воды за счёт опреснения. ' +
    'Капельное орошение, изобретённое в Израиле, произвело революцию в мировом земледелии.',
  key_challenges: [
    'Мировой лидер в опреснении морской воды (5 крупных заводов)',
    'Пионер капельного орошения (снижение потребления воды на 50%)',
    'Рециклинг 90%+ сточных вод — мировой рекорд',
    'Сельское хозяйство в пустыне Негев',
    'Геополитические споры вокруг водных ресурсов Иордана',
  ],
  key_stats: {
    population_millions: 9.8,
    water_stress_level: 'high',
    // World Bank: ~230 м3/чел/год возобновляемых ресурсов (без опреснения)
    renewable_water_per_capita_m3: 230,
    // FAO AQUASTAT: ~58% водозабора на ирригацию
    irrigation_percent_of_water_use: 58,
  },
  key_rivers: ['Иордан', 'Яркон', 'Кишон'],
  key_projects_count: 18,
  api_sources: ['israel-water-authority', 'world-bank', 'fao-aquastat'],
};

const middleEastUae: WaterRegion = {
  id: 'middle-east-uae',
  name_ru: 'ОАЭ',
  name_en: 'United Arab Emirates',
  emoji: '🇦🇪',
  countries: ['UAE'],
  center: [54.0, 24.0],
  zoom: 7,
  color: '#f59e0b',
  description:
    'ОАЭ — одна из наиболее водно-дефицитных стран мира с крайне ограниченными природными пресноводными ресурсами. ' +
    'Более 90% питьевой воды производится путём опреснения морской воды. ' +
    'Страна активно инвестирует в умные технологии управления водой и облачный посев для увеличения осадков.',
  key_challenges: [
    'Экстремальный дефицит пресной воды (менее 60 м3/чел/год)',
    'Критическая зависимость от опреснения (42 опреснительных завода)',
    'Истощение подземных водоносных горизонтов',
    'Умные технологии водоснабжения в городах',
    'Облачный посев и инновации в водоснабжении',
  ],
  key_stats: {
    population_millions: 10.1,
    water_stress_level: 'critical',
    // FAO AQUASTAT: ~16 м3/чел/год — одна из самых низких в мире
    renewable_water_per_capita_m3: 16,
    // FAO AQUASTAT: ~83% водозабора на ирригацию (финиковые пальмы и т.д.)
    irrigation_percent_of_water_use: 83,
  },
  key_rivers: [],
  key_projects_count: 12,
  api_sources: ['uae-water-security', 'world-bank', 'fao-aquastat'],
};

const easternEurope: WaterRegion = {
  id: 'eastern-europe',
  name_ru: 'Восточная Европа',
  name_en: 'Eastern Europe',
  emoji: '🇪🇺',
  countries: ['Poland', 'Czech Republic', 'Slovakia', 'Hungary', 'Romania', 'Bulgaria'],
  center: [20.0, 50.0],
  zoom: 5,
  color: '#8b5cf6',
  description:
    'Восточная Европа реализует масштабную модернизацию водной инфраструктуры в рамках Водной рамочной директивы ЕС. ' +
    'Регион сталкивается с возрастающими рисками наводнений, особенно в бассейнах Дуная и Одера. ' +
    'Страны региона активно инвестируют в очистку сточных вод и восстановление речных экосистем.',
  key_challenges: [
    'Имплементация Водной рамочной директивы ЕС',
    'Управление наводнениями (бассейны Дуная и Одера)',
    'Модернизация советской водной инфраструктуры',
    'Загрязнение рек промышленными стоками',
    'Адаптация к изменению климата (засухи и паводки)',
  ],
  key_stats: {
    population_millions: 63.2,
    water_stress_level: 'low',
    // World Bank: средневзвешенное ~5800 м3/чел/год
    renewable_water_per_capita_m3: 5800,
    // FAO AQUASTAT: ~10% водозабора на ирригацию (в среднем по региону)
    irrigation_percent_of_water_use: 10,
  },
  key_rivers: ['Дунай', 'Висла', 'Одер', 'Тиса', 'Влтава'],
  key_projects_count: 25,
  api_sources: ['eu-wfd', 'eurostat', 'world-bank', 'fao-aquastat'],
};

const germany: WaterRegion = {
  id: 'germany',
  name_ru: 'Германия',
  name_en: 'Germany',
  emoji: '🇩🇪',
  countries: ['Germany'],
  center: [10.4, 51.2],
  zoom: 6,
  color: '#64748b',
  description:
    'Германия обладает одной из самых развитых систем водоснабжения и водоочистки в мире. ' +
    'Бассейн Рейна — крупнейшая трансграничная водная система Западной Европы, управляемая через международные комиссии. ' +
    'Страна адаптируется к участившимся засухам и маловодным периодам, особенно на востоке.',
  key_challenges: [
    'Управление бассейном Рейна (международное сотрудничество)',
    'Промышленная очистка воды (мировые стандарты)',
    'Климатическая адаптация (засухи 2018, 2022)',
    'Загрязнение нитратами из сельского хозяйства',
    'Модернизация ливневой канализации в городах',
  ],
  key_stats: {
    population_millions: 84.5,
    water_stress_level: 'low',
    // World Bank/FAO: ~1870 м3/чел/год
    renewable_water_per_capita_m3: 1870,
    // FAO AQUASTAT: ~0.4% водозабора на ирригацию (дождевое земледелие)
    irrigation_percent_of_water_use: 1,
  },
  key_rivers: ['Рейн', 'Эльба', 'Дунай (верховья)', 'Везер', 'Одер'],
  key_projects_count: 15,
  api_sources: ['bfg-germany', 'eu-wfd', 'eurostat', 'world-bank'],
};

const uk: WaterRegion = {
  id: 'uk',
  name_ru: 'Великобритания',
  name_en: 'United Kingdom',
  emoji: '🇬🇧',
  countries: ['United Kingdom'],
  center: [-2.0, 54.0],
  zoom: 6,
  color: '#06b6d4',
  description:
    'Великобритания сталкивается с парадоксом: при обилии осадков юго-восток Англии испытывает растущий водный дефицит. ' +
    'Викторианская водная инфраструктура Лондона требует масштабной модернизации — проект Thames Tideway Tunnel стоимостью 4.3 млрд фунтов. ' +
    'Барьер Темзы защищает столицу от наводнений, но его мощности будут исчерпаны к 2070-м годам.',
  key_challenges: [
    'Барьер Темзы и защита от наводнений (рассчитан до 2070-х)',
    'Модернизация викторианской инфраструктуры (Thames Tideway Tunnel)',
    'Дефицит воды на юго-востоке Англии',
    'Загрязнение рек сточными водами (sewage overflow)',
    'Приватизация водных компаний и регуляторные реформы',
  ],
  key_stats: {
    population_millions: 68.3,
    water_stress_level: 'medium',
    // World Bank: ~2290 м3/чел/год
    renewable_water_per_capita_m3: 2290,
    // FAO AQUASTAT: ~3% водозабора на ирригацию
    irrigation_percent_of_water_use: 3,
  },
  key_rivers: ['Темза', 'Северн', 'Трент', 'Ус', 'Тайн'],
  key_projects_count: 14,
  api_sources: ['environment-agency-uk', 'ofwat', 'world-bank', 'fao-aquastat'],
};

const china: WaterRegion = {
  id: 'china',
  name_ru: 'Китай',
  name_en: 'China',
  emoji: '🇨🇳',
  countries: ['China'],
  center: [104.0, 35.0],
  zoom: 4,
  color: '#ef4444',
  description:
    'Китай — страна с крайне неравномерным распределением водных ресурсов: 80% воды сосредоточено на юге, а 45% населения живёт на севере. ' +
    'Проект переброски воды Юг-Север стоимостью более 80 млрд долларов — крупнейший инфраструктурный водный проект в истории. ' +
    'Загрязнение рек и истощение подземных вод на Северо-Китайской равнине угрожают продовольственной безопасности.',
  key_challenges: [
    'Проект переброски воды Юг-Север (стоимость 80+ млрд $)',
    'Загрязнение Янцзы и других крупных рек',
    'Истощение подземных вод Северо-Китайской равнины',
    'Три ущелья — экологические последствия',
    'Трансграничные реки (Меконг, Брахмапутра)',
  ],
  key_stats: {
    population_millions: 1425,
    water_stress_level: 'high',
    // World Bank/FAO: ~2010 м3/чел/год
    renewable_water_per_capita_m3: 2010,
    // FAO AQUASTAT: ~65% водозабора на ирригацию
    irrigation_percent_of_water_use: 65,
  },
  key_rivers: ['Янцзы', 'Хуанхэ', 'Чжуцзян', 'Сунгари', 'Меконг (Ланьцанцзян)'],
  key_projects_count: 35,
  api_sources: ['china-mwr', 'world-bank', 'fao-aquastat'],
};

const usa: WaterRegion = {
  id: 'usa',
  name_ru: 'США',
  name_en: 'United States',
  emoji: '🇺🇸',
  countries: ['United States'],
  center: [-98.0, 39.0],
  zoom: 4,
  color: '#60a5fa',
  description:
    'США переживают нарастающий водный кризис, особенно на западе: река Колорадо, питающая 40 млн человек, находится на историческом минимуме. ' +
    'Наследие свинцового кризиса во Флинте привело к федеральной программе замены трубопроводов на 15 млрд долларов. ' +
    'Загрязнение PFAS (вечные химикаты) обнаружено в водоснабжении 45% населения страны.',
  key_challenges: [
    'Кризис реки Колорадо (снижение стока на 20% с 2000 г.)',
    'Наследие свинцового кризиса во Флинте (замена труб)',
    'Загрязнение PFAS (обнаружено у 45% населения)',
    'Стареющая инфраструктура (250 000+ разрывов труб/год)',
    'Засухи на западе и наводнения на востоке',
  ],
  key_stats: {
    population_millions: 335,
    water_stress_level: 'medium',
    // World Bank/FAO: ~8910 м3/чел/год
    renewable_water_per_capita_m3: 8910,
    // FAO AQUASTAT: ~40% водозабора на ирригацию
    irrigation_percent_of_water_use: 40,
  },
  key_rivers: ['Миссисипи', 'Колорадо', 'Колумбия', 'Миссури', 'Рио-Гранде'],
  key_projects_count: 28,
  api_sources: ['usgs-waterdata', 'epa-water', 'usbr', 'world-bank', 'fao-aquastat'],
};

const globalRegion: WaterRegion = {
  id: 'global',
  name_ru: 'Весь мир',
  name_en: 'Global Overview',
  emoji: '🌍',
  countries: [],
  center: [20.0, 20.0],
  zoom: 2,
  color: '#22d3ee',
  description:
    'Глобальный обзор водных ресурсов мира. Более 2 миллиардов человек живут в странах с высоким водным стрессом. ' +
    'К 2030 году мировой спрос на воду превысит устойчивое предложение на 40%. ' +
    'Платформа VODPROM агрегирует данные из всех регионов для комплексного анализа водных вызовов.',
  key_challenges: [
    'Глобальный водный дефицит (2+ млрд человек)',
    'Изменение климата и нарушение гидрологического цикла',
    'Загрязнение пресноводных экосистем',
    'Неравномерное распределение водных ресурсов',
    'Устаревшая инфраструктура в развивающихся странах',
  ],
  key_stats: {
    population_millions: 8100,
    water_stress_level: 'high',
    // World Bank: глобальное среднее ~5950 м3/чел/год
    renewable_water_per_capita_m3: 5950,
    // FAO AQUASTAT: глобальное среднее ~70% водозабора на ирригацию
    irrigation_percent_of_water_use: 70,
  },
  key_rivers: ['Амазонка', 'Нил', 'Янцзы', 'Миссисипи', 'Ганг'],
  key_projects_count: 200,
  api_sources: ['world-bank', 'fao-aquastat', 'un-water', 'who-unicef-jmp'],
};

// ─────────────────────────────────────────────────────────────
//  Exports
// ─────────────────────────────────────────────────────────────

/**
 * All available water regions, ordered from primary focus outward.
 * `global` is always the last element.
 */
export const ALL_REGIONS: WaterRegion[] = [
  centralAsia,
  middleEastIsrael,
  middleEastUae,
  easternEurope,
  germany,
  uk,
  china,
  usa,
  globalRegion,
];

/**
 * Look up a region by its unique `id` string.
 *
 * @example
 * const region = getRegionById('central-asia');
 * // => { id: 'central-asia', name_ru: 'Центральная Азия', ... }
 */
export function getRegionById(id: string): WaterRegion | undefined {
  return ALL_REGIONS.find((r) => r.id === id);
}

/**
 * Find which region a given country belongs to.
 * Country name matching is case-insensitive.
 *
 * @example
 * const region = getRegionByCountry('Uzbekistan');
 * // => { id: 'central-asia', ... }
 *
 * const region2 = getRegionByCountry('germany');
 * // => { id: 'germany', ... }
 */
export function getRegionByCountry(country: string): WaterRegion | undefined {
  const needle = country.toLowerCase();
  return ALL_REGIONS.find((r) =>
    r.countries.some((c) => c.toLowerCase() === needle),
  );
}
