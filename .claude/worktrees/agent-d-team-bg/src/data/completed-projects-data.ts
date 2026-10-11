// ═══════════════════════════════════════════════════════════════
//  VODPROM — Completed Culligan Projects Database
//  Historical portfolio of water treatment projects (2003–2016)
// ═══════════════════════════════════════════════════════════════

export interface CompletedProject {
  id: string;
  name_ru: string;
  name_en: string;
  year: number;
  country: string;
  city: string;
  coordinates: { lat: number; lng: number };
  capacity_m3_day?: number;
  description: string;
  description_en: string;
  client: string;
  type: 'water_treatment' | 'industrial' | 'municipal' | 'food_beverage' | 'recreation' | 'energy' | 'government';
  status: 'completed';
  investment_usd?: number;
  technology: string[];
  image_placeholder?: string;
}

// ───────────────────────────────────────────────────────────────
//  Country flag emoji helper
// ───────────────────────────────────────────────────────────────

const COUNTRY_FLAGS: Record<string, string> = {
  'Uzbekistan': '\u{1F1FA}\u{1F1FF}',
  'Ukraine': '\u{1F1FA}\u{1F1E6}',
  'Poland': '\u{1F1F5}\u{1F1F1}',
  'Kazakhstan': '\u{1F1F0}\u{1F1FF}',
  'Belarus': '\u{1F1E7}\u{1F1FE}',
  'Russia': '\u{1F1F7}\u{1F1FA}',
  'Turkmenistan': '\u{1F1F9}\u{1F1F2}',
  'Moldova': '\u{1F1F2}\u{1F1E9}',
  'Turkey': '\u{1F1F9}\u{1F1F7}',
  'International': '\u{1F30D}',
};

/**
 * Returns the flag emoji for a given country name.
 * Falls back to a globe emoji for unknown countries.
 */
export function getCountryFlag(country: string): string {
  return COUNTRY_FLAGS[country] ?? '\u{1F30D}';
}

// ───────────────────────────────────────────────────────────────
//  Completed-project marker color
// ───────────────────────────────────────────────────────────────

/**
 * Returns the standard green color used for completed project markers.
 */
export function getCompletedProjectColor(): string {
  return '#22c55e';
}

// ───────────────────────────────────────────────────────────────
//  Dataset — 34 completed projects (2003–2016)
// ───────────────────────────────────────────────────────────────

export const COMPLETED_PROJECTS: CompletedProject[] = [
  // ── 1. Tashkent Water Park (2003) ──────────────────────────
  {
    id: 'CP-UZ-001',
    name_ru: 'Аквапарк Ташкент — система водоподготовки Culligan',
    name_en: 'Tashkent Water Park — Culligan Water Purification',
    year: 2003,
    country: 'Uzbekistan',
    city: 'Tashkent',
    coordinates: { lat: 41.3111, lng: 69.2797 },
    description:
      'Комплексная система водоподготовки Culligan для аквапарка площадью 10 гектаров. ' +
      'Вместимость — 1 000 человек одновременно. Включает 3 насосные станции, ' +
      '7 бассейнов с водой питьевого качества. Один из крупнейших аквапарков в Центральной Азии.',
    description_en:
      'Comprehensive Culligan water purification system for a 10-hectare water park. ' +
      'Capacity for 1,000 simultaneous visitors. Includes 3 pumping stations, ' +
      '7 pools with drinking-quality water.',
    client: 'Tashkent Water Park',
    type: 'recreation',
    status: 'completed',
    technology: ['Culligan filtration', 'UV disinfection', 'multi-stage purification'],
    image_placeholder: '/images/projects/tashkent-waterpark.jpg',
  },

  // ── 2. Nemiroff Factory (2003) ─────────────────────────────
  {
    id: 'CP-UA-001',
    name_ru: 'Завод «Немиров» — водоподготовка для производства',
    name_en: 'Nemiroff Factory — Production Water Treatment',
    year: 2003,
    country: 'Ukraine',
    city: 'Nemyriv',
    coordinates: { lat: 48.9717, lng: 28.8356 },
    capacity_m3_day: 1512, // 63 m3/hour * 24
    description:
      'Станция водоподготовки производительностью 63 м³/час для ликёро-водочного завода «Немиров». ' +
      'Технологическая цепочка: механическая фильтрация, обезжелезивание, умягчение, обратный осмос. ' +
      'Обеспечивает воду высочайшего качества для премиального производства.',
    description_en:
      'Water treatment plant at 63 m³/hour for the Nemiroff distillery. ' +
      'Process chain: mechanical filtration, de-ironing, softening, reverse osmosis.',
    client: 'Nemiroff',
    type: 'food_beverage',
    status: 'completed',
    technology: ['mechanical filtration', 'de-ironing', 'water softening', 'reverse osmosis'],
    image_placeholder: '/images/projects/nemiroff.jpg',
  },

  // ── 3. Ostrolenka Water Station (2004) ─────────────────────
  {
    id: 'CP-PL-001',
    name_ru: 'Водозаборная станция Остроленка — удаление аммония',
    name_en: 'Ostrolenka Water Station — Ammonia Removal',
    year: 2004,
    country: 'Poland',
    city: 'Ostrolenka',
    coordinates: { lat: 53.0842, lng: 21.5735 },
    capacity_m3_day: 14400,
    description:
      'Станция водоподготовки в городе Остроленка (Польша) производительностью 14 400 м³/сутки. ' +
      'Специализированная система удаления аммония из подземных вод. ' +
      'Обеспечивает питьевой водой жителей города и окрестностей.',
    description_en:
      'Water treatment station in Ostrolenka, Poland. Capacity: 14,400 m³/day. ' +
      'Specialized ammonia removal system for underground water sources.',
    client: 'Ostrolenka Municipality',
    type: 'municipal',
    status: 'completed',
    technology: ['ammonia removal', 'biological treatment', 'aeration'],
    image_placeholder: '/images/projects/ostrolenka.jpg',
  },

  // ── 4. Kazakhstan Chemical Plant (2004) ────────────────────
  {
    id: 'CP-KZ-001',
    name_ru: 'Химический завод Казахстана — фильтрация и деминерализация',
    name_en: 'Kazakhstan Chemical Plant — Filtration & Demineralization',
    year: 2004,
    country: 'Kazakhstan',
    city: 'Pavlodar',
    coordinates: { lat: 52.2873, lng: 76.9674 },
    capacity_m3_day: 528,
    description:
      'Система водоподготовки для химического производства: фильтрация и деминерализация. ' +
      'Производительность 528 м³/сутки. Подготовка воды для технологических процессов ' +
      'химической промышленности с жёсткими требованиями к качеству.',
    description_en:
      'Water treatment for chemical production: filtration and demineralization. ' +
      'Capacity: 528 m³/day for industrial process water.',
    client: 'Kazakhstan Chemical Plant',
    type: 'industrial',
    status: 'completed',
    technology: ['multi-media filtration', 'demineralization', 'ion exchange'],
    image_placeholder: '/images/projects/kz-chemical.jpg',
  },

  // ── 5. World of Fitness, Minsk (2004) ──────────────────────
  {
    id: 'CP-BY-001',
    name_ru: '«Мир Фитнеса» Минск — водоподготовка спорткомплекса',
    name_en: 'World of Fitness Minsk — Sports Complex Water Treatment',
    year: 2004,
    country: 'Belarus',
    city: 'Minsk',
    coordinates: { lat: 53.9178, lng: 27.5879 },
    description:
      'Водоподготовка для крупнейшего спортивного комплекса Минска площадью 7 000 м². ' +
      'Обслуживает более 6 000 посетителей в год. ' +
      'Системы очистки воды для бассейнов, душевых и питьевого водоснабжения.',
    description_en:
      'Water treatment for the largest Minsk sports complex (7,000 m²). ' +
      'Serves 6,000+ visitors/year with pool, shower, and drinking water purification.',
    client: 'World of Fitness',
    type: 'recreation',
    status: 'completed',
    technology: ['pool water treatment', 'UV disinfection', 'Culligan filtration'],
    image_placeholder: '/images/projects/world-fitness-minsk.jpg',
  },

  // ── 6. Khortytsa Vodka (2004) ──────────────────────────────
  {
    id: 'CP-UA-002',
    name_ru: '«Хортица» — водоподготовка для производства водки',
    name_en: 'Khortytsa Vodka — Water Treatment for Vodka Production',
    year: 2004,
    country: 'Ukraine',
    city: 'Zaporizhzhia',
    coordinates: { lat: 47.8388, lng: 35.1396 },
    description:
      'Система водоподготовки Culligan для завода «Хортица» — одного из трёх крупнейших ' +
      'водочных брендов мира. Обеспечение ультрачистой воды для премиального производства. ' +
      'Вода проходит многоступенчатую очистку до идеального качества.',
    description_en:
      'Culligan water treatment for Khortytsa — one of the top 3 global vodka brands. ' +
      'Multi-stage purification to achieve ultra-pure production water.',
    client: 'Khortytsa',
    type: 'food_beverage',
    status: 'completed',
    technology: ['reverse osmosis', 'activated carbon', 'multi-stage filtration'],
    image_placeholder: '/images/projects/khortytsa.jpg',
  },

  // ── 7. Boryspil Airport (2004) ─────────────────────────────
  {
    id: 'CP-UA-003',
    name_ru: 'Аэропорт «Борисполь» — водоснабжение',
    name_en: 'Boryspil Airport — Water Supply System',
    year: 2004,
    country: 'Ukraine',
    city: 'Boryspil',
    coordinates: { lat: 50.3450, lng: 30.8947 },
    capacity_m3_day: 1500,
    description:
      'Система водоподготовки производительностью 1 500 м³/сутки для международного ' +
      'аэропорта «Борисполь». Обслуживает более 8 миллионов пассажиров ежегодно. ' +
      'Обеспечивает питьевую воду, технические нужды терминалов и инфраструктуры.',
    description_en:
      'Water treatment system at 1,500 m³/day for Boryspil International Airport. ' +
      'Serves 8M+ passengers annually with drinking and utility water.',
    client: 'Boryspil International Airport',
    type: 'municipal',
    status: 'completed',
    technology: ['Culligan purification', 'pressure filtration', 'disinfection'],
    image_placeholder: '/images/projects/boryspil.jpg',
  },

  // ── 8. President of Russia Office (2005) ───────────────────
  {
    id: 'CP-RU-001',
    name_ru: 'Управление делами Президента РФ — водоподготовка',
    name_en: 'President of Russia Office — Water Treatment',
    year: 2005,
    country: 'Russia',
    city: 'Moscow',
    coordinates: { lat: 55.7520, lng: 37.6175 },
    description:
      'Установка систем водоподготовки Culligan для объектов Управления делами ' +
      'Президента Российской Федерации. Высший уровень требований к качеству и ' +
      'надёжности оборудования.',
    description_en:
      'Culligan water treatment systems for the Presidential Administration facilities. ' +
      'Highest standards of water quality and equipment reliability.',
    client: 'Presidential Administration of Russia',
    type: 'government',
    status: 'completed',
    technology: ['Culligan premium systems', 'multi-barrier purification'],
    image_placeholder: '/images/projects/kremlin.jpg',
  },

  // ── 9. Chernogolovka Drinks (2005) ─────────────────────────
  {
    id: 'CP-RU-002',
    name_ru: '«Черноголовка» — водоподготовка для производства напитков',
    name_en: 'Chernogolovka Drinks — Beverage Production Water Treatment',
    year: 2005,
    country: 'Russia',
    city: 'Chernogolovka',
    coordinates: { lat: 56.0133, lng: 38.3728 },
    description:
      'Водоподготовка для производства легендарных российских лимонадов «Черноголовка». ' +
      'Артезианская вода добывается из скважин глубиной 103–170 метров. ' +
      'Система обеспечивает стабильное качество воды для массового производства напитков.',
    description_en:
      'Water treatment for Chernogolovka — iconic Russian lemonade brand. ' +
      'Artesian water sourced from 103–170m deep wells.',
    client: 'Chernogolovka',
    type: 'food_beverage',
    status: 'completed',
    technology: ['artesian water treatment', 'Culligan filtration', 'mineralization control'],
    image_placeholder: '/images/projects/chernogolovka.jpg',
  },

  // ── 10. Gazprom HQ (2005) ──────────────────────────────────
  {
    id: 'CP-RU-003',
    name_ru: 'Штаб-квартира «Газпром» — водоподготовка',
    name_en: 'Gazprom Headquarters — Water Treatment',
    year: 2005,
    country: 'Russia',
    city: 'Moscow',
    coordinates: { lat: 55.7616, lng: 37.5317 },
    description:
      'Системы водоподготовки Culligan для здания штаб-квартиры ПАО «Газпром» в Москве. ' +
      'Объект эксплуатируется с 1995 года. Обеспечение питьевой водой и водой для ' +
      'технических систем крупнейшей энергетической компании России.',
    description_en:
      'Culligan water treatment for Gazprom headquarters in Moscow. ' +
      'Building operational since 1995. Drinking and utility water for Russia\'s largest energy company.',
    client: 'Gazprom',
    type: 'industrial',
    status: 'completed',
    technology: ['Culligan commercial systems', 'softening', 'carbon filtration'],
    image_placeholder: '/images/projects/gazprom.jpg',
  },

  // ── 11. ALROSA Diamond Company (2005) ──────────────────────
  {
    id: 'CP-RU-004',
    name_ru: 'АК «АЛРОСА» — водоподготовка для алмазодобычи',
    name_en: 'ALROSA Diamond Company — Water Treatment for Mining',
    year: 2005,
    country: 'Russia',
    city: 'Mirny',
    coordinates: { lat: 62.5354, lng: 113.9610 },
    capacity_m3_day: 800,
    description:
      'Система водоподготовки производительностью 800 м³/сутки для АК «АЛРОСА» — ' +
      'компании, добывающей 95% всех российских алмазов. Работа в экстремальных ' +
      'климатических условиях Якутии (до -60°C). Обеспечение питьевой водой горняков и ' +
      'технической водой для обогатительных процессов.',
    description_en:
      'Water treatment at 800 m³/day for ALROSA — responsible for 95% of Russian diamond mining. ' +
      'Operating in extreme Yakutia climate (down to -60°C).',
    client: 'ALROSA',
    type: 'industrial',
    status: 'completed',
    technology: ['cold-climate water treatment', 'Culligan industrial systems', 'de-ironing'],
    image_placeholder: '/images/projects/alrosa.jpg',
  },

  // ── 12. Ashgabat Water Treatment Plant (2006) ──────────────
  {
    id: 'CP-TM-001',
    name_ru: 'Водоочистная станция Ашхабада — крупнейший контракт',
    name_en: 'Ashgabat Water Treatment Plant — Largest Contract',
    year: 2006,
    country: 'Turkmenistan',
    city: 'Ashgabat',
    coordinates: { lat: 37.9601, lng: 58.3261 },
    capacity_m3_day: 320000,
    investment_usd: 200000000,
    description:
      'Крупнейший контракт в истории компании — водоочистная станция в Ашхабаде ' +
      'производительностью 320 000 м³/сутки. Стоимость контракта превышает $200 млн. ' +
      'Обеспечивает чистой питьевой водой столицу Туркменистана.',
    description_en:
      'The largest contract in company history — Ashgabat water treatment plant ' +
      'at 320,000 m³/day. Contract value exceeds $200M. Supplies clean drinking water to the capital.',
    client: 'Government of Turkmenistan',
    type: 'municipal',
    status: 'completed',
    technology: ['coagulation-flocculation', 'sedimentation', 'sand filtration', 'chlorination'],
    image_placeholder: '/images/projects/ashgabat.jpg',
  },

  // ── 13. Mercury Mineral Water (2006) ───────────────────────
  {
    id: 'CP-RU-005',
    name_ru: '«Меркурий» — минеральная вода, Черкесск',
    name_en: 'Mercury Mineral Water — Cherkessk',
    year: 2006,
    country: 'Russia',
    city: 'Cherkessk',
    coordinates: { lat: 44.2233, lng: 42.0578 },
    description:
      'Водоподготовка для завода минеральной воды «Меркурий» в Черкесске. ' +
      'Производственная мощность — 370 миллионов бутылок в год. ' +
      'Система обеспечивает стабильный минеральный состав и микробиологическую чистоту.',
    description_en:
      'Water treatment for Mercury mineral water plant in Cherkessk. ' +
      'Production capacity: 370 million bottles per year.',
    client: 'Mercury',
    type: 'food_beverage',
    status: 'completed',
    technology: ['mineral water treatment', 'microbiological purification', 'bottling line prep'],
    image_placeholder: '/images/projects/mercury.jpg',
  },

  // ── 14. Belovezhsky Cheese Factory (2007) ──────────────────
  {
    id: 'CP-BY-002',
    name_ru: 'Беловежский сыродельный завод — водоподготовка',
    name_en: 'Belovezhsky Cheese Factory — Water Treatment',
    year: 2007,
    country: 'Belarus',
    city: 'Brest',
    coordinates: { lat: 52.7613, lng: 23.7340 },
    description:
      'Система водоподготовки для молочного производства Беловежского сыродельного завода. ' +
      'Обеспечение высококачественной водой для технологических процессов сыроделия ' +
      'и молокопереработки. Соответствие строгим стандартам пищевой промышленности.',
    description_en:
      'Water treatment for dairy production at Belovezhsky cheese factory. ' +
      'High-quality water for cheese-making and dairy processing.',
    client: 'Belovezhsky Cheese Factory',
    type: 'food_beverage',
    status: 'completed',
    technology: ['food-grade water treatment', 'softening', 'Culligan filtration'],
    image_placeholder: '/images/projects/belovezhsky.jpg',
  },

  // ── 15. Tiraspol Boiler House (2008) ───────────────────────
  {
    id: 'CP-MD-001',
    name_ru: 'Тираспольская котельная — водоподготовка для паровых котлов',
    name_en: 'Tiraspol Boiler House — Steam Boiler Water Treatment',
    year: 2008,
    country: 'Moldova',
    city: 'Tiraspol',
    coordinates: { lat: 46.8403, lng: 29.6433 },
    capacity_m3_day: 12000,
    description:
      'Система водоподготовки для паровых котлов производительностью 12 000 м³/сутки. ' +
      'Подготовка котловой воды для теплоснабжения города Тирасполь. ' +
      'Предотвращение накипеобразования и коррозии в котельном оборудовании.',
    description_en:
      'Steam boiler water treatment at 12,000 m³/day for Tiraspol district heating. ' +
      'Scale and corrosion prevention for boiler equipment.',
    client: 'Tiraspol Municipal Services',
    type: 'energy',
    status: 'completed',
    technology: ['boiler water treatment', 'deaeration', 'softening', 'chemical dosing'],
    image_placeholder: '/images/projects/tiraspol.jpg',
  },

  // ── 16. Kobrin SUPER-IRON Filtration (2009) ────────────────
  {
    id: 'CP-BY-003',
    name_ru: 'Кобрин — станция обезжелезивания SUPER-IRON',
    name_en: 'Kobrin SUPER-IRON Filtration Station',
    year: 2009,
    country: 'Belarus',
    city: 'Kobrin',
    coordinates: { lat: 52.2142, lng: 24.3564 },
    capacity_m3_day: 25000,
    description:
      'Станция обезжелезивания по технологии SUPER-IRON производительностью 25 000 м³/сутки. ' +
      'Содержание железа на выходе — менее 0,1 мг/л. Обеспечивает чистой питьевой водой ' +
      'жителей города Кобрин и прилегающих районов.',
    description_en:
      'SUPER-IRON de-ironing station at 25,000 m³/day. Output iron content < 0.1 mg/l. ' +
      'Supplies clean drinking water to Kobrin residents.',
    client: 'Kobrin Municipal Water Utility',
    type: 'municipal',
    status: 'completed',
    technology: ['SUPER-IRON', 'catalytic de-ironing', 'pressure filtration'],
    image_placeholder: '/images/projects/kobrin-iron.jpg',
  },

  // ── 17. Gelenovo Station, Molodechno (2010) ────────────────
  {
    id: 'CP-BY-004',
    name_ru: 'Станция «Гелёново», Молодечно — артезианское водоснабжение',
    name_en: 'Gelenovo Station, Molodechno — Artesian Water Supply',
    year: 2010,
    country: 'Belarus',
    city: 'Molodechno',
    coordinates: { lat: 54.3103, lng: 26.8547 },
    capacity_m3_day: 25,
    description:
      'Модернизация станции «Гелёново» в Молодечно. 19 артезианских скважин, ' +
      'действующих с 1956 года. Производительность 25 м³/сутки. ' +
      'Восстановление и обновление исторической системы артезианского водоснабжения.',
    description_en:
      'Modernization of Gelenovo station in Molodechno. 19 artesian wells active since 1956. ' +
      'Capacity: 25 m³/day.',
    client: 'Molodechno Water Utility',
    type: 'municipal',
    status: 'completed',
    technology: ['artesian well rehabilitation', 'de-ironing', 'Culligan filtration'],
    image_placeholder: '/images/projects/gelenovo.jpg',
  },

  // ── 18. Mayak Water Park, Vinnytsia (2010) ─────────────────
  {
    id: 'CP-UA-004',
    name_ru: 'Аквапарк «Маяк», Винница — водоподготовка бассейнов',
    name_en: 'Mayak Water Park, Vinnytsia — Pool Water Treatment',
    year: 2010,
    country: 'Ukraine',
    city: 'Vinnytsia',
    coordinates: { lat: 49.2328, lng: 28.4810 },
    description:
      'Система водоподготовки для аквапарка «Маяк» в Виннице. Общий объём бассейнов — 1 230 м³. ' +
      'Очистка и рециркуляция воды, поддержание санитарных норм для рекреационных объектов.',
    description_en:
      'Water treatment for Mayak Water Park in Vinnytsia. Total pool volume: 1,230 m³. ' +
      'Water purification and recirculation for recreational facilities.',
    client: 'Mayak Water Park',
    type: 'recreation',
    status: 'completed',
    technology: ['pool water circulation', 'sand filtration', 'UV disinfection', 'pH control'],
    image_placeholder: '/images/projects/mayak.jpg',
  },

  // ── 19. Koblevo Recreation Center (2010) ───────────────────
  {
    id: 'CP-UA-005',
    name_ru: 'База отдыха «Коблево» — водоподготовка бассейнов',
    name_en: 'Koblevo Recreation Center — Pool Water Treatment',
    year: 2010,
    country: 'Ukraine',
    city: 'Koblevo',
    coordinates: { lat: 46.6374, lng: 31.1898 },
    description:
      'Водоподготовка для бассейнов базы отдыха «Коблево» на Чёрном море. ' +
      'Объём бассейнов — 219 м³. Системы очистки морской и пресной воды ' +
      'для курортной инфраструктуры.',
    description_en:
      'Pool water treatment for Koblevo Black Sea resort. Pool volume: 219 m³. ' +
      'Seawater and freshwater purification for resort infrastructure.',
    client: 'Koblevo Resort',
    type: 'recreation',
    status: 'completed',
    technology: ['pool water treatment', 'Culligan filtration', 'disinfection'],
    image_placeholder: '/images/projects/koblevo.jpg',
  },

  // ── 20. Lida City Water Intake (2010) ──────────────────────
  {
    id: 'CP-BY-005',
    name_ru: 'Лидский городской водозабор «Дубровня»',
    name_en: 'Lida City Water Intake — Dubrovnya',
    year: 2010,
    country: 'Belarus',
    city: 'Lida',
    coordinates: { lat: 53.8878, lng: 25.2998 },
    capacity_m3_day: 24,
    description:
      'Водозабор «Дубровня» для города Лида. Производительность 24 м³/сутки. ' +
      'Обезжелезивание и очистка подземных вод для питьевого водоснабжения города.',
    description_en:
      'Dubrovnya water intake for Lida city. Capacity: 24 m³/day. ' +
      'De-ironing and purification of underground water for municipal drinking supply.',
    client: 'Lida Municipal Water Utility',
    type: 'municipal',
    status: 'completed',
    technology: ['de-ironing', 'underground water treatment', 'pressure filtration'],
    image_placeholder: '/images/projects/lida.jpg',
  },

  // ── 21. Petrovskoye Filtration Station (2011) ──────────────
  {
    id: 'CP-UA-006',
    name_ru: 'Фильтровальная станция «Петровское» — 20 000 м³/сутки',
    name_en: 'Petrovskoye Filtration Station — 20,000 m³/day',
    year: 2011,
    country: 'Ukraine',
    city: 'Petrovskoye',
    coordinates: { lat: 48.3694, lng: 37.8556 },
    capacity_m3_day: 20000,
    description:
      'Фильтровальная станция «Петровское» производительностью 20 000 м³/сутки. ' +
      '18 фильтров. Торжественно открыта с участием премьер-министра Украины. ' +
      'Ключевой объект водоснабжения региона.',
    description_en:
      'Petrovskoye filtration station at 20,000 m³/day with 18 filters. ' +
      'Officially opened by the Prime Minister of Ukraine.',
    client: 'Ukrainian Water Authority',
    type: 'municipal',
    status: 'completed',
    technology: ['rapid sand filtration', 'multi-media filtration', 'chlorination'],
    image_placeholder: '/images/projects/petrovskoye.jpg',
  },

  // ── 22. Culligan Bel Factory, Zaslavl (2012) ───────────────
  {
    id: 'CP-BY-006',
    name_ru: 'Завод «Кулиган Бел», Заславль — производственный объект',
    name_en: 'Culligan Bel Factory, Zaslavl — Production Facility',
    year: 2012,
    country: 'Belarus',
    city: 'Zaslavl',
    coordinates: { lat: 53.9831, lng: 27.2758 },
    description:
      'Собственный производственный завод «Кулиган Бел» в Заславле (Минская область). ' +
      'Создан на основе инвестиционного договора. Производство оборудования для ' +
      'водоподготовки и сборка фильтрационных систем.',
    description_en:
      'Culligan Bel production facility in Zaslavl, Minsk region. ' +
      'Established via investment agreement for manufacturing water treatment equipment.',
    client: 'Culligan Bel',
    type: 'industrial',
    status: 'completed',
    technology: ['equipment manufacturing', 'filtration system assembly'],
    image_placeholder: '/images/projects/culligan-bel.jpg',
  },

  // ── 23. Balakovo Nuclear Power Plant (2012) ────────────────
  {
    id: 'CP-RU-006',
    name_ru: 'Балаковская АЭС — водоподготовка для ядерной энергетики',
    name_en: 'Balakovo Nuclear Power Plant — Water Treatment',
    year: 2012,
    country: 'Russia',
    city: 'Balakovo',
    coordinates: { lat: 52.0913, lng: 47.9564 },
    capacity_m3_day: 6500,
    description:
      'Система водоподготовки для крупнейшей АЭС России — Балаковской атомной ' +
      'электростанции. Производительность 6 500 м³/сутки. Подготовка ' +
      'деминерализованной воды для контуров охлаждения реакторов и вспомогательных систем.',
    description_en:
      'Water treatment for Russia\'s largest NPP — Balakovo Nuclear Power Plant. ' +
      'Capacity: 6,500 m³/day. Demineralized water for reactor cooling circuits.',
    client: 'Rosenergoatom (Balakovo NPP)',
    type: 'energy',
    status: 'completed',
    technology: ['demineralization', 'ion exchange', 'ultra-pure water', 'nuclear-grade treatment'],
    image_placeholder: '/images/projects/balakovo.jpg',
  },

  // ── 24. Savushkin Product Dairy (2013) ──────────────────────
  {
    id: 'CP-BY-007',
    name_ru: '«Савушкин продукт» — водоподготовка для молочного производства',
    name_en: 'Savushkin Product Dairy — Water Treatment',
    year: 2013,
    country: 'Belarus',
    city: 'Brest',
    coordinates: { lat: 52.1029, lng: 23.7048 },
    description:
      'Система водоподготовки для крупного молочного предприятия «Савушкин продукт» (Брест). ' +
      'Обеспечение качественной водой всех этапов молочного производства. ' +
      'Соответствие международным стандартам пищевой безопасности.',
    description_en:
      'Water treatment for Savushkin Product — a major dairy enterprise in Brest. ' +
      'Quality water for all stages of dairy production per international food safety standards.',
    client: 'Savushkin Product',
    type: 'food_beverage',
    status: 'completed',
    technology: ['food-grade purification', 'softening', 'Culligan commercial systems'],
    image_placeholder: '/images/projects/savushkin.jpg',
  },

  // ── 25. St. Petersburg Water Treatment Plant (2013) ────────
  {
    id: 'CP-RU-007',
    name_ru: 'Водоочистная станция Санкт-Петербург — 10 000 м³/сутки',
    name_en: 'St. Petersburg Water Treatment Plant — 10,000 m³/day',
    year: 2013,
    country: 'Russia',
    city: 'Saint Petersburg',
    coordinates: { lat: 59.9343, lng: 30.3351 },
    capacity_m3_day: 10000,
    description:
      'Водоочистная станция в Санкт-Петербурге производительностью 10 000 м³/сутки. ' +
      'Торжественно открыта с участием Валентины Матвиенко. ' +
      'Современные технологии очистки для второго по величине города России.',
    description_en:
      'Water treatment plant in St. Petersburg at 10,000 m³/day. ' +
      'Officially opened by Valentina Matviyenko.',
    client: 'St. Petersburg Water Utility',
    type: 'municipal',
    status: 'completed',
    technology: ['coagulation', 'sedimentation', 'rapid filtration', 'ozonation'],
    image_placeholder: '/images/projects/spb-water.jpg',
  },

  // ── 26. Slonim Drinking Water (2014) ───────────────────────
  {
    id: 'CP-BY-008',
    name_ru: 'Слоним — станция питьевого водоснабжения',
    name_en: 'Slonim Drinking Water Station',
    year: 2014,
    country: 'Belarus',
    city: 'Slonim',
    coordinates: { lat: 53.0867, lng: 25.3161 },
    capacity_m3_day: 15000,
    description:
      'Станция питьевого водоснабжения города Слоним производительностью 15 000 м³/сутки. ' +
      'Срок службы фильтров — более 25 лет. Долгосрочное решение для обеспечения ' +
      'города чистой питьевой водой.',
    description_en:
      'Drinking water station for Slonim at 15,000 m³/day. ' +
      'Filter lifespan exceeds 25 years — a long-term municipal solution.',
    client: 'Slonim Municipal Water',
    type: 'municipal',
    status: 'completed',
    technology: ['long-life filtration', 'de-ironing', 'de-manganation'],
    image_placeholder: '/images/projects/slonim.jpg',
  },

  // ── 27. Berezovsky Cheese Factory (2016) ───────────────────
  {
    id: 'CP-BY-009',
    name_ru: 'Берёзовский сыродельный комбинат — обезжелезивание и водозабор',
    name_en: 'Berezovsky Cheese Factory — De-ironing & Water Intake',
    year: 2016,
    country: 'Belarus',
    city: 'Beryoza',
    coordinates: { lat: 52.5318, lng: 24.9781 },
    description:
      'Станция обезжелезивания производительностью 80 м³/час и насосная станция ' +
      '345 м³/час для Берёзовского сыродельного комбината. ' +
      'Обеспечение молочного производства водой без примесей железа.',
    description_en:
      'De-ironing station at 80 m³/hour and pumping station at 345 m³/hour ' +
      'for Berezovsky cheese factory.',
    client: 'Berezovsky Cheese Factory',
    type: 'food_beverage',
    status: 'completed',
    technology: ['de-ironing', 'high-capacity pumping', 'Culligan industrial filtration'],
    image_placeholder: '/images/projects/berezovsky.jpg',
  },

  // ── 28. Tetra Pak Partnership (2016) ───────────────────────
  {
    id: 'CP-INT-001',
    name_ru: 'Партнёрство с Tetra Pak — система WFS, рекуперация воды',
    name_en: 'Tetra Pak Partnership — WFS System, Wastewater Recovery',
    year: 2016,
    country: 'International',
    city: 'Multiple',
    coordinates: { lat: 55.6050, lng: 13.0038 }, // Tetra Pak HQ, Lund, Sweden
    description:
      'Стратегическое партнёрство с Tetra Pak. Внедрение системы WFS (Water Filtration System) ' +
      'с рекуперацией 95–100% сточных вод. Инновационная технология для пищевой ' +
      'промышленности, позволяющая практически полностью замкнуть водный цикл.',
    description_en:
      'Strategic partnership with Tetra Pak. WFS (Water Filtration System) implementation ' +
      'achieving 95–100% wastewater recovery for food industry.',
    client: 'Tetra Pak',
    type: 'industrial',
    status: 'completed',
    technology: ['WFS system', 'wastewater recovery', 'closed-loop water cycle', 'membrane filtration'],
    image_placeholder: '/images/projects/tetra-pak.jpg',
  },

  // ── 29. Kobrin Butter & Cheese Factory (2016) ──────────────
  {
    id: 'CP-BY-010',
    name_ru: 'Кобринский маслодельно-сыродельный завод — водоподготовка',
    name_en: 'Kobrin Butter & Cheese Factory — Water Treatment',
    year: 2016,
    country: 'Belarus',
    city: 'Kobrin',
    coordinates: { lat: 52.2097, lng: 24.3631 },
    capacity_m3_day: 2400,
    description:
      'Система водоподготовки производительностью 2 400 м³/сутки для Кобринского ' +
      'маслодельно-сыродельного завода. Обеспечение качественной водой ' +
      'для производства масла и сыров.',
    description_en:
      'Water treatment at 2,400 m³/day for Kobrin butter and cheese factory. ' +
      'Quality water supply for dairy production.',
    client: 'Kobrin Butter & Cheese Factory',
    type: 'food_beverage',
    status: 'completed',
    technology: ['dairy-grade water treatment', 'de-ironing', 'softening'],
    image_placeholder: '/images/projects/kobrin-dairy.jpg',
  },

  // ── 30. Babushkina Krynka Dairy (2016) ─────────────────────
  {
    id: 'CP-BY-011',
    name_ru: '«Бабушкина крынка» — водоподготовка для молочного производства',
    name_en: 'Babushkina Krynka Dairy — Water Treatment',
    year: 2016,
    country: 'Belarus',
    city: 'Mogilev',
    coordinates: { lat: 53.9045, lng: 30.3449 },
    description:
      'Система водоподготовки для крупного молочного предприятия «Бабушкина крынка» в Могилёве. ' +
      'Комплексная очистка воды для всех этапов молочного производства: ' +
      'от приёмки сырья до упаковки готовой продукции.',
    description_en:
      'Water treatment for Babushkina Krynka dairy enterprise in Mogilev. ' +
      'Comprehensive water purification for all dairy production stages.',
    client: 'Babushkina Krynka',
    type: 'food_beverage',
    status: 'completed',
    technology: ['food-grade filtration', 'softening', 'UV disinfection'],
    image_placeholder: '/images/projects/babushkina-krynka.jpg',
  },

  // ── 31. Freestyle Water Park, Minsk (2016) ─────────────────
  {
    id: 'CP-BY-012',
    name_ru: 'Аквапарк «Фристайл», Минск — водоподготовка',
    name_en: 'Freestyle Water Park, Minsk — Water Treatment',
    year: 2016,
    country: 'Belarus',
    city: 'Minsk',
    coordinates: { lat: 53.9276, lng: 27.5873 }, // Surganova street area
    description:
      'Водоподготовка для аквапарка «Фристайл» на улице Сурганова в Минске. ' +
      'Системы очистки и рециркуляции воды для бассейнов, водных аттракционов ' +
      'и зон отдыха. Соответствие санитарным нормам Республики Беларусь.',
    description_en:
      'Water treatment for Freestyle Water Park on Surganova Street, Minsk. ' +
      'Pool water purification and recirculation systems.',
    client: 'Freestyle Water Park',
    type: 'recreation',
    status: 'completed',
    technology: ['pool water treatment', 'ozonation', 'sand filtration', 'pH balancing'],
    image_placeholder: '/images/projects/freestyle.jpg',
  },

  // ── 32. Mosvodokanal (2016) ────────────────────────────────
  {
    id: 'CP-RU-008',
    name_ru: 'Мосводоканал — 12 мобильных станций водоподготовки',
    name_en: 'Mosvodokanal — 12 Mobile Water Treatment Facilities',
    year: 2016,
    country: 'Russia',
    city: 'Moscow',
    coordinates: { lat: 55.7558, lng: 37.6173 },
    description:
      'Поставка 12 мобильных станций водоподготовки для АО «Мосводоканал» — ' +
      'крупнейшего предприятия водоснабжения Москвы. Мобильные установки обеспечивают ' +
      'резервное водоснабжение при аварийных ситуациях и плановых ремонтах.',
    description_en:
      '12 mobile water treatment facilities for Mosvodokanal — Moscow\'s main water utility. ' +
      'Backup water supply for emergencies and planned maintenance.',
    client: 'Mosvodokanal',
    type: 'municipal',
    status: 'completed',
    technology: ['mobile water treatment', 'containerized systems', 'rapid deployment filtration'],
    image_placeholder: '/images/projects/mosvodokanal.jpg',
  },

  // ── 33. Petrovshchyna Station, Minsk (2016) ────────────────
  {
    id: 'CP-BY-013',
    name_ru: 'Станция «Петровщина», Минск — артезианское водоснабжение',
    name_en: 'Petrovshchyna Station, Minsk — Artesian Water Supply',
    year: 2016,
    country: 'Belarus',
    city: 'Minsk',
    coordinates: { lat: 53.8632, lng: 27.4781 },
    capacity_m3_day: 30000,
    description:
      'Станция водоподготовки «Петровщина» производительностью ~30 000 м³/сутки. ' +
      'Часть программы перевода Минска на артезианское водоснабжение к 2030 году. ' +
      'Стратегический объект обеспечения столицы Беларуси чистой подземной водой.',
    description_en:
      'Petrovshchyna water treatment station at ~30,000 m³/day. ' +
      'Part of the plan to transition Minsk to artesian water supply by 2030.',
    client: 'Minskvodokanal',
    type: 'municipal',
    status: 'completed',
    technology: ['artesian water treatment', 'de-ironing', 'de-manganation', 'aeration'],
    image_placeholder: '/images/projects/petrovshchyna.jpg',
  },

  // ── 34. Izmir Filtration Station (2016) ────────────────────
  {
    id: 'CP-TR-001',
    name_ru: 'Фильтровальная станция Измир — 270 000 м³/сутки',
    name_en: 'Izmir Filtration Station — 270,000 m³/day',
    year: 2016,
    country: 'Turkey',
    city: 'Izmir',
    coordinates: { lat: 38.4237, lng: 27.1428 },
    capacity_m3_day: 270000,
    description:
      'Фильтровальная станция в Измире (Турция) производительностью 270 000 м³/сутки. ' +
      'Проект упоминается в контексте встречи с Президентом Турции. ' +
      'Один из крупнейших объектов водоподготовки в регионе.',
    description_en:
      'Filtration station in Izmir, Turkey at 270,000 m³/day. ' +
      'Referenced in the context of a meeting with the President of Turkey. ' +
      'One of the largest water treatment facilities in the region.',
    client: 'Izmir Metropolitan Municipality',
    type: 'municipal',
    status: 'completed',
    investment_usd: undefined,
    technology: ['large-scale filtration', 'coagulation', 'sedimentation', 'disinfection'],
    image_placeholder: '/images/projects/izmir.jpg',
  },
];

// ───────────────────────────────────────────────────────────────
//  Helper utilities
// ───────────────────────────────────────────────────────────────

/** Total number of completed projects */
export const COMPLETED_PROJECTS_COUNT = COMPLETED_PROJECTS.length;

/** All unique countries in the portfolio */
export function getCompletedProjectCountries(): string[] {
  return Array.from(new Set(COMPLETED_PROJECTS.map((p) => p.country)));
}

/** Filter projects by country */
export function getProjectsByCountry(country: string): CompletedProject[] {
  return COMPLETED_PROJECTS.filter((p) => p.country === country);
}

/** Filter projects by type */
export function getProjectsByType(type: CompletedProject['type']): CompletedProject[] {
  return COMPLETED_PROJECTS.filter((p) => p.type === type);
}

/** Filter projects by year range */
export function getProjectsByYearRange(from: number, to: number): CompletedProject[] {
  return COMPLETED_PROJECTS.filter((p) => p.year >= from && p.year <= to);
}

/** Total installed capacity across all projects (m3/day) */
export function getTotalCapacity(): number {
  return COMPLETED_PROJECTS.reduce((sum, p) => sum + (p.capacity_m3_day ?? 0), 0);
}

/** Country statistics: count + total capacity */
export function getCountryStats(): Array<{ country: string; flag: string; count: number; capacity: number }> {
  const map = new Map<string, { count: number; capacity: number }>();
  for (const p of COMPLETED_PROJECTS) {
    const entry = map.get(p.country) ?? { count: 0, capacity: 0 };
    entry.count += 1;
    entry.capacity += p.capacity_m3_day ?? 0;
    map.set(p.country, entry);
  }
  return Array.from(map.entries())
    .map(([country, stats]) => ({
      country,
      flag: getCountryFlag(country),
      count: stats.count,
      capacity: stats.capacity,
    }))
    .sort((a, b) => b.count - a.count);
}
