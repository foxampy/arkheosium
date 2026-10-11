// ═══════════════════════════════════════════════════════════════
//  Comprehensive water body data for Uzbekistan & Central Asia
//  Used by the map detail panel when clicking on water features.
// ═══════════════════════════════════════════════════════════════

export interface WaterBody {
  id: string;
  name_ru: string;
  name_en: string;
  type: 'river' | 'lake' | 'glacier' | 'reservoir' | 'canal' | 'aquifer';
  coordinates: { lat: number; lng: number };
  description: string;
  characteristics: {
    length_km?: number;
    area_km2?: number;
    volume_km3?: number;
    depth_m?: number;
    altitude_m?: number;
    salinity_ppt?: number;
    flow_rate_m3s?: number;
    glaciation_km2?: number;
    temperature_avg_c?: number;
  };
  water_quality: 'excellent' | 'good' | 'moderate' | 'poor' | 'critical';
  extraction_difficulty: 'easy' | 'moderate' | 'hard' | 'very_hard';
  purification_complexity: 'low' | 'medium' | 'high' | 'very_high';
  freshness: 'fresh' | 'brackish' | 'saline' | 'brine';
  status: string;
  threats: string[];
  usage: string[];
  image_url?: string;
}

export const WATER_BODIES: WaterBody[] = [
  // ─── Rivers ───────────────────────────────────────────────────
  {
    id: 'syrdarya',
    name_ru: 'Сырдарья',
    name_en: 'Syr Darya',
    type: 'river',
    coordinates: { lat: 40.85, lng: 68.75 },
    description: 'Вторая по длине река Центральной Азии. Берёт начало в горах Тянь-Шаня, протекает через Ферганскую долину и впадает в Аральское море. Основной источник ирригации для Узбекистана и Казахстана.',
    characteristics: {
      length_km: 2212,
      flow_rate_m3s: 703,
      area_km2: 219000,
      volume_km3: 37.2,
      temperature_avg_c: 12.5,
    },
    water_quality: 'moderate',
    extraction_difficulty: 'easy',
    purification_complexity: 'medium',
    freshness: 'fresh',
    status: 'Сильно зарегулирована, сток снижен на 80% относительно естественного уровня',
    threats: ['Ирригационный водоотбор', 'Засоление', 'Загрязнение пестицидами', 'Таяние ледников-источников'],
    usage: ['Ирригация', 'Водоснабжение', 'Гидроэнергетика', 'Рыболовство'],
  },
  {
    id: 'amudarya',
    name_ru: 'Амударья',
    name_en: 'Amu Darya',
    type: 'river',
    coordinates: { lat: 39.75, lng: 63.5 },
    description: 'Самая крупная река Центральной Азии. Образуется слиянием Вахша и Пянджа в Таджикистане. Исторически впадала в Аральское море, но сейчас практически не достигает его из-за массового водозабора.',
    characteristics: {
      length_km: 2540,
      flow_rate_m3s: 2000,
      area_km2: 309000,
      volume_km3: 78.5,
      temperature_avg_c: 14.2,
    },
    water_quality: 'moderate',
    extraction_difficulty: 'easy',
    purification_complexity: 'medium',
    freshness: 'fresh',
    status: 'Критический уровень: до Арала доходит менее 5% естественного стока',
    threats: ['Полное перенаправление на ирригацию', 'Загрязнение дренажными водами', 'Трансграничные конфликты', 'Деградация дельты'],
    usage: ['Ирригация хлопка и риса', 'Водоснабжение городов', 'Гидроэнергетика', 'Транспорт'],
  },
  {
    id: 'chirchik',
    name_ru: 'Чирчик',
    name_en: 'Chirchik',
    type: 'river',
    coordinates: { lat: 41.47, lng: 69.2 },
    description: 'Крупнейший приток Сырдарьи в Ташкентской области. Образуется слиянием Чаткала и Пскема. Основной источник водоснабжения Ташкента и ирригации Ташкентского оазиса.',
    characteristics: {
      length_km: 161,
      flow_rate_m3s: 225,
      area_km2: 14900,
      volume_km3: 7.9,
      temperature_avg_c: 10.8,
    },
    water_quality: 'good',
    extraction_difficulty: 'easy',
    purification_complexity: 'low',
    freshness: 'fresh',
    status: 'Относительно стабильный, но растущий спрос Ташкента угрожает водному балансу',
    threats: ['Промышленное загрязнение', 'Урбанизация водосбора', 'Рост водопотребления Ташкента'],
    usage: ['Водоснабжение Ташкента', 'Ирригация', 'Гидроэнергетика', 'Рекреация'],
  },
  {
    id: 'zarafshan',
    name_ru: 'Зарафшан',
    name_en: 'Zarafshan',
    type: 'river',
    coordinates: { lat: 39.65, lng: 66.95 },
    description: 'Историческая река, питающая Самарканд и Бухару. Берёт начало на леднике Зарафшан в Таджикистане. Полностью разбирается на ирригацию и не достигает Амударьи уже с 1970-х.',
    characteristics: {
      length_km: 877,
      flow_rate_m3s: 162,
      area_km2: 12100,
      volume_km3: 5.1,
      temperature_avg_c: 11.3,
    },
    water_quality: 'moderate',
    extraction_difficulty: 'easy',
    purification_complexity: 'medium',
    freshness: 'fresh',
    status: 'Полностью расходуется на ирригацию; высокая минерализация в нижнем течении',
    threats: ['Полный водоразбор', 'Минерализация', 'Сокращение ледника Зарафшан', 'Трансграничный спор с Таджикистаном'],
    usage: ['Ирригация Самаркандского и Бухарского оазисов', 'Водоснабжение', 'Историческое наследие'],
  },
  {
    id: 'kashkadarya',
    name_ru: 'Кашкадарья',
    name_en: 'Kashkadarya',
    type: 'river',
    coordinates: { lat: 38.85, lng: 66.05 },
    description: 'Река в южном Узбекистане, протекает через Кашкадарьинскую область. Теряется в песках Каршинской степи. Один из наиболее дефицитных речных бассейнов страны.',
    characteristics: {
      length_km: 378,
      flow_rate_m3s: 42,
      area_km2: 8780,
      volume_km3: 1.3,
      temperature_avg_c: 15.1,
    },
    water_quality: 'poor',
    extraction_difficulty: 'moderate',
    purification_complexity: 'high',
    freshness: 'brackish',
    status: 'Маловодная река, высокий дефицит водных ресурсов',
    threats: ['Засуха', 'Засоление', 'Чрезмерный водоотбор', 'Деградация русла'],
    usage: ['Ирригация', 'Ограниченное водоснабжение'],
  },
  {
    id: 'surkhandarya',
    name_ru: 'Сурхандарья',
    name_en: 'Surkhandarya',
    type: 'river',
    coordinates: { lat: 37.8, lng: 67.27 },
    description: 'Правый приток Амударьи на крайнем юге Узбекистана. Протекает через самый тёплый регион страны. Важен для сельского хозяйства Сурхандарьинской области.',
    characteristics: {
      length_km: 175,
      flow_rate_m3s: 65,
      area_km2: 5450,
      volume_km3: 2.0,
      temperature_avg_c: 17.5,
    },
    water_quality: 'moderate',
    extraction_difficulty: 'easy',
    purification_complexity: 'medium',
    freshness: 'fresh',
    status: 'Умеренно зарегулирована, зависит от сезонного стока',
    threats: ['Сельскохозяйственное загрязнение', 'Сезонное маловодье', 'Эрозия берегов'],
    usage: ['Ирригация', 'Водоснабжение', 'Животноводство'],
  },
  {
    id: 'naryn',
    name_ru: 'Нарын',
    name_en: 'Naryn',
    type: 'river',
    coordinates: { lat: 41.43, lng: 71.3 },
    description: 'Крупнейшая составляющая Сырдарьи, берёт начало в ледниках Тянь-Шаня в Кыргызстане. Ключевая река для гидроэнергетики региона, на ней расположен Токтогульский каскад ГЭС.',
    characteristics: {
      length_km: 807,
      flow_rate_m3s: 430,
      area_km2: 59900,
      volume_km3: 13.5,
      temperature_avg_c: 8.2,
    },
    water_quality: 'good',
    extraction_difficulty: 'moderate',
    purification_complexity: 'low',
    freshness: 'fresh',
    status: 'Сток зависит от режима Токтогульского водохранилища',
    threats: ['Энерго-водный конфликт с Кыргызстаном', 'Изменение ледникового питания', 'Зимние попуски для энергетики'],
    usage: ['Гидроэнергетика', 'Ирригация', 'Водоснабжение'],
  },
  {
    id: 'kyzylsu',
    name_ru: 'Кызылсу',
    name_en: 'Kyzylsu',
    type: 'river',
    coordinates: { lat: 40.2, lng: 72.1 },
    description: 'Приток Сырдарьи в Ферганской долине. Берёт начало на склонах Алайского хребта в Кыргызстане. Название переводится как "красная вода" из-за красноватого оттенка от глинистых взвесей.',
    characteristics: {
      length_km: 235,
      flow_rate_m3s: 38,
      area_km2: 4300,
      volume_km3: 1.2,
      temperature_avg_c: 10.5,
    },
    water_quality: 'moderate',
    extraction_difficulty: 'moderate',
    purification_complexity: 'medium',
    freshness: 'fresh',
    status: 'Сезонный режим, повышенная мутность',
    threats: ['Селевые потоки', 'Трансграничное загрязнение', 'Горнодобывающая промышленность'],
    usage: ['Ирригация Ферганской долины', 'Водоснабжение'],
  },

  // ─── Lakes / Reservoirs ───────────────────────────────────────
  {
    id: 'aral-sea',
    name_ru: 'Аральское море',
    name_en: 'Aral Sea',
    type: 'lake',
    coordinates: { lat: 45.0, lng: 59.5 },
    description: 'Бывшее 4-е по величине озеро мира, превратившееся в одну из крупнейших экологических катастроф XX века. К 2025 году сохранилось лишь около 5% от первоначальной площади. Северный (Малый) Арал частично восстанавливается благодаря дамбе Кок-Арал.',
    characteristics: {
      area_km2: 3500,
      volume_km3: 21.5,
      depth_m: 42,
      altitude_m: 42,
      salinity_ppt: 100,
      temperature_avg_c: 13.0,
    },
    water_quality: 'critical',
    extraction_difficulty: 'very_hard',
    purification_complexity: 'very_high',
    freshness: 'brine',
    status: 'Экологическая катастрофа: усыхание на 90%, солёность выросла в 10 раз',
    threats: ['Продолжающееся усыхание', 'Солевые и пылевые бури', 'Токсичные пестициды на обнажённом дне', 'Разрушение экосистем'],
    usage: ['Научные исследования', 'Ограниченное рыболовство (Малый Арал)', 'Экологический мониторинг'],
  },
  {
    id: 'aydar-arnasay',
    name_ru: 'Айдаро-Арнасайская система озёр',
    name_en: 'Aydar-Arnasay Lake System',
    type: 'lake',
    coordinates: { lat: 40.85, lng: 67.3 },
    description: 'Крупнейшая система озёр в Узбекистане, образовавшаяся случайно в 1969 году при аварийном сбросе воды из Чардаринского водохранилища в Арнасайскую впадину. Площадь колеблется от 2000 до 4000 км².',
    characteristics: {
      area_km2: 3478,
      volume_km3: 44.3,
      depth_m: 25,
      altitude_m: 247,
      salinity_ppt: 8,
      temperature_avg_c: 14.8,
    },
    water_quality: 'moderate',
    extraction_difficulty: 'moderate',
    purification_complexity: 'medium',
    freshness: 'brackish',
    status: 'Стабильная, но солёность постепенно растёт из-за испарения',
    threats: ['Рост солёности', 'Колебания уровня', 'Загрязнение дренажными водами'],
    usage: ['Рыболовство', 'Рекреация', 'Ирригационный дренаж', 'Биоразнообразие'],
  },
  {
    id: 'charvak',
    name_ru: 'Чарвакское водохранилище',
    name_en: 'Charvak Reservoir',
    type: 'reservoir',
    coordinates: { lat: 41.63, lng: 70.03 },
    description: 'Крупнейшее водохранилище Ташкентской области, созданное в 1970 году на реке Чирчик. Расположено в живописных горах Западного Тянь-Шаня. Главный источник питьевой воды и энергии для Ташкента.',
    characteristics: {
      area_km2: 39.5,
      volume_km3: 2.0,
      depth_m: 168,
      altitude_m: 897,
      salinity_ppt: 0.3,
      temperature_avg_c: 9.5,
    },
    water_quality: 'excellent',
    extraction_difficulty: 'easy',
    purification_complexity: 'low',
    freshness: 'fresh',
    status: 'Стабильное, хорошо управляемое, уровень зависит от снеготаяния',
    threats: ['Заиление', 'Рекреационная нагрузка', 'Изменение снежного покрова в горах'],
    usage: ['Водоснабжение Ташкента', 'Гидроэнергетика', 'Рекреация и туризм', 'Ирригация'],
  },
  {
    id: 'tudakul',
    name_ru: 'Тудакульское водохранилище',
    name_en: 'Tudakul Reservoir',
    type: 'reservoir',
    coordinates: { lat: 39.9, lng: 64.95 },
    description: 'Крупное водохранилище в Навоийской области, созданное на реке Зарафшан. Служит основным источником водоснабжения города Навои и промышленных предприятий региона.',
    characteristics: {
      area_km2: 210,
      volume_km3: 1.2,
      depth_m: 18,
      altitude_m: 220,
      salinity_ppt: 1.8,
      temperature_avg_c: 16.0,
    },
    water_quality: 'moderate',
    extraction_difficulty: 'easy',
    purification_complexity: 'medium',
    freshness: 'fresh',
    status: 'Умеренное состояние; подвержено колебаниям из-за водоразбора Зарафшана',
    threats: ['Промышленное загрязнение (Навоийский ГМК)', 'Снижение притока', 'Испарение'],
    usage: ['Промышленное водоснабжение', 'Ирригация', 'Водоснабжение Навои'],
  },
  {
    id: 'sardoba',
    name_ru: 'Сардобинское водохранилище',
    name_en: 'Sardoba Reservoir',
    type: 'reservoir',
    coordinates: { lat: 40.18, lng: 68.05 },
    description: 'Водохранилище в Сырдарьинской области, печально известное прорывом дамбы 1 мая 2020 года, вызвавшим катастрофическое наводнение. Было эвакуировано более 90,000 человек.',
    characteristics: {
      area_km2: 30.8,
      volume_km3: 0.922,
      depth_m: 29,
      altitude_m: 310,
      salinity_ppt: 0.8,
      temperature_avg_c: 15.2,
    },
    water_quality: 'poor',
    extraction_difficulty: 'moderate',
    purification_complexity: 'medium',
    freshness: 'fresh',
    status: 'Восстанавливается после катастрофического прорыва дамбы 2020 года',
    threats: ['Структурная ненадёжность дамбы', 'Повторный прорыв', 'Заиление'],
    usage: ['Ирригация (при восстановлении)', 'Водоснабжение'],
  },
  {
    id: 'tuzkan',
    name_ru: 'Тузкан',
    name_en: 'Tuzkan Lake',
    type: 'lake',
    coordinates: { lat: 40.68, lng: 67.85 },
    description: 'Солоноватое озеро в Джизакской области, входящее в Айдаро-Арнасайскую систему. Традиционно использовалось для рыболовства, но повышение солёности угрожает биоразнообразию.',
    characteristics: {
      area_km2: 265,
      volume_km3: 1.5,
      depth_m: 12,
      altitude_m: 247,
      salinity_ppt: 12,
      temperature_avg_c: 15.5,
    },
    water_quality: 'poor',
    extraction_difficulty: 'moderate',
    purification_complexity: 'high',
    freshness: 'brackish',
    status: 'Умеренно деградированное; солёность продолжает расти',
    threats: ['Повышение солёности', 'Сокращение видового разнообразия', 'Загрязнение'],
    usage: ['Рыболовство', 'Водоснабжение скота'],
  },

  // ─── Glaciers ─────────────────────────────────────────────────
  {
    id: 'fedchenko',
    name_ru: 'Ледник Федченко',
    name_en: 'Fedchenko Glacier',
    type: 'glacier',
    coordinates: { lat: 38.9, lng: 72.2 },
    description: 'Крупнейший ледник Памира и всей Центральной Азии (вне полярных регионов). Расположен в Таджикистане, но питает реки, от которых зависит весь регион. Теряет до 16-20 метров в длину ежегодно.',
    characteristics: {
      length_km: 77,
      glaciation_km2: 700,
      volume_km3: 144,
      altitude_m: 6280,
      temperature_avg_c: -18.0,
    },
    water_quality: 'excellent',
    extraction_difficulty: 'very_hard',
    purification_complexity: 'low',
    freshness: 'fresh',
    status: 'Отступает со скоростью 16-20 м/год; потерял ~11 км за последние 100 лет',
    threats: ['Глобальное потепление', 'Ускоренное таяние', 'Ледниковые озёрные прорывы (GLOFs)'],
    usage: ['Источник пресной воды для Амударьи', 'Научные исследования', 'Индикатор климатических изменений'],
  },
  {
    id: 'abramov',
    name_ru: 'Ледник Абрамова',
    name_en: 'Abramov Glacier',
    type: 'glacier',
    coordinates: { lat: 39.63, lng: 71.56 },
    description: 'Один из наиболее изученных ледников мира, расположен на Алайском хребте в Кыргызстане. С 1967 года ведутся непрерывные наблюдения. Потерял более 25% массы за последние 50 лет.',
    characteristics: {
      length_km: 9,
      glaciation_km2: 26,
      volume_km3: 3.2,
      altitude_m: 4640,
      temperature_avg_c: -8.5,
    },
    water_quality: 'excellent',
    extraction_difficulty: 'very_hard',
    purification_complexity: 'low',
    freshness: 'fresh',
    status: 'Потеря 25% массы за 50 лет; опорный объект мониторинга WGMS',
    threats: ['Ускоренное таяние (+4x нормы)', 'Деградация вечной мерзлоты', 'Потеря альбедо'],
    usage: ['Научный мониторинг (WGMS)', 'Источник стока Кызылсу', 'Климатические исследования'],
  },
  {
    id: 'zeravshan-glacier',
    name_ru: 'Ледник Зарафшан',
    name_en: 'Zeravshan Glacier',
    type: 'glacier',
    coordinates: { lat: 39.5, lng: 70.3 },
    description: 'Исток реки Зарафшан, расположен на Туркестанском хребте в Таджикистане. Критически важен для водоснабжения Самарканда и Бухары. Сокращается с ускоряющимися темпами.',
    characteristics: {
      length_km: 35,
      glaciation_km2: 134,
      volume_km3: 15.8,
      altitude_m: 5100,
      temperature_avg_c: -12.0,
    },
    water_quality: 'excellent',
    extraction_difficulty: 'very_hard',
    purification_complexity: 'low',
    freshness: 'fresh',
    status: 'Отступает; потеря ~20% площади за последние 40 лет',
    threats: ['Климатическое потепление', 'Сокращение ледовой массы', 'Угроза водоснабжению Зарафшанского бассейна'],
    usage: ['Источник реки Зарафшан', 'Водоснабжение Самарканда и Бухары'],
  },

  // ─── Canals ───────────────────────────────────────────────────
  {
    id: 'karakum-canal',
    name_ru: 'Каракумский канал',
    name_en: 'Karakum Canal',
    type: 'canal',
    coordinates: { lat: 38.8, lng: 60.5 },
    description: 'Крупнейший ирригационный канал в мире (1445 км). Отводит воду из Амударьи через пустыню Каракумы в Туркменистане. Главная причина сокращения Аральского моря наряду с хлопководством.',
    characteristics: {
      length_km: 1445,
      flow_rate_m3s: 500,
      volume_km3: 13.0,
      depth_m: 7.5,
      temperature_avg_c: 18.0,
    },
    water_quality: 'poor',
    extraction_difficulty: 'easy',
    purification_complexity: 'high',
    freshness: 'brackish',
    status: 'Функционирует, но потери на фильтрацию достигают 30-50%',
    threats: ['Огромные потери воды (до 50%)', 'Засоление прилегающих земель', 'Ветхость инфраструктуры'],
    usage: ['Ирригация Туркменистана', 'Водоснабжение Ашхабада', 'Рыбоводство'],
  },
  {
    id: 'south-fergana-canal',
    name_ru: 'Южно-Ферганский канал',
    name_en: 'South Fergana Canal',
    type: 'canal',
    coordinates: { lat: 40.35, lng: 71.3 },
    description: 'Важнейший магистральный канал Ферганской долины. Отводит воду из Сырдарьи для ирригации южной части долины. Построен в советское время, требует модернизации.',
    characteristics: {
      length_km: 168,
      flow_rate_m3s: 86,
      depth_m: 4.5,
      temperature_avg_c: 13.5,
    },
    water_quality: 'moderate',
    extraction_difficulty: 'easy',
    purification_complexity: 'medium',
    freshness: 'fresh',
    status: 'Функционирует, изношена инфраструктура, планируется модернизация при поддержке ВБ',
    threats: ['Износ каналов', 'Потери воды при транспортировке', 'Заиление'],
    usage: ['Ирригация Ферганской долины', 'Водоснабжение сельских районов'],
  },
  {
    id: 'amu-bukhara-canal',
    name_ru: 'Аму-Бухарский канал',
    name_en: 'Amu-Bukhara Canal',
    type: 'canal',
    coordinates: { lat: 39.55, lng: 64.6 },
    description: 'Магистральный канал, доставляющий воду Амударьи в Бухарский оазис. Длина 295 км. Обеспечивает водой крупные ирригационные массивы и водоснабжение Бухары.',
    characteristics: {
      length_km: 295,
      flow_rate_m3s: 200,
      depth_m: 5.5,
      temperature_avg_c: 16.5,
    },
    water_quality: 'moderate',
    extraction_difficulty: 'easy',
    purification_complexity: 'medium',
    freshness: 'fresh',
    status: 'Работает, потери на транспортировку 25-35%, ведётся реконструкция',
    threats: ['Потери на транспортировку', 'Износ облицовки', 'Снижение притока Амударьи'],
    usage: ['Ирригация Бухарского оазиса', 'Водоснабжение Бухары', 'Промышленное водоснабжение'],
  },

  // ─── Aquifers ─────────────────────────────────────────────────
  {
    id: 'tashkent-aquifer',
    name_ru: 'Ташкентский подземный бассейн',
    name_en: 'Tashkent Underground Basin',
    type: 'aquifer',
    coordinates: { lat: 41.31, lng: 69.28 },
    description: 'Крупный артезианский бассейн под Ташкентом и окрестностями. Обеспечивает до 30% водоснабжения столицы. Запасы оцениваются в 8-12 км³, но уровень снижается из-за интенсивной эксплуатации.',
    characteristics: {
      area_km2: 4500,
      volume_km3: 10.0,
      depth_m: 350,
      temperature_avg_c: 16.0,
      salinity_ppt: 0.5,
    },
    water_quality: 'good',
    extraction_difficulty: 'moderate',
    purification_complexity: 'low',
    freshness: 'fresh',
    status: 'Уровень снижается на 0.5-1 м/год из-за чрезмерной эксплуатации',
    threats: ['Истощение запасов', 'Загрязнение с поверхности', 'Промышленные стоки', 'Снижение естественного подпитывания'],
    usage: ['Водоснабжение Ташкента', 'Резервный стратегический запас', 'Промышленность'],
  },
  {
    id: 'fergana-aquifer',
    name_ru: 'Ферганский артезианский бассейн',
    name_en: 'Fergana Valley Aquifer',
    type: 'aquifer',
    coordinates: { lat: 40.55, lng: 71.0 },
    description: 'Крупнейший артезианский бассейн Ферганской долины. Запасы подземных вод значительные, но качество ухудшается из-за десятилетий интенсивного использования пестицидов и удобрений в хлопководстве.',
    characteristics: {
      area_km2: 22000,
      volume_km3: 35.0,
      depth_m: 500,
      temperature_avg_c: 14.0,
      salinity_ppt: 1.2,
    },
    water_quality: 'moderate',
    extraction_difficulty: 'moderate',
    purification_complexity: 'medium',
    freshness: 'fresh',
    status: 'Значительные запасы, но растущее загрязнение агрохимикатами',
    threats: ['Загрязнение пестицидами и нитратами', 'Чрезмерная откачка', 'Засоление от ирригационных возвратных вод'],
    usage: ['Ирригация', 'Водоснабжение городов Ферганской долины', 'Промышленность'],
  },
  {
    id: 'bukhara-karshi-aquifer',
    name_ru: 'Бухаро-Каршинский артезианский бассейн',
    name_en: 'Bukhara-Karshi Aquifer',
    type: 'aquifer',
    coordinates: { lat: 39.3, lng: 65.0 },
    description: 'Подземный водоносный горизонт между Бухарой и Карши. Относительно маломощный, с повышенной минерализацией. Критически важен как дополнительный источник в засушливом регионе.',
    characteristics: {
      area_km2: 15000,
      volume_km3: 8.5,
      depth_m: 400,
      temperature_avg_c: 18.0,
      salinity_ppt: 3.5,
    },
    water_quality: 'poor',
    extraction_difficulty: 'hard',
    purification_complexity: 'high',
    freshness: 'brackish',
    status: 'Ограниченные и минерализованные запасы; важен как резервный источник',
    threats: ['Высокая минерализация', 'Истощение при откачке', 'Отсутствие пополнения в аридных условиях'],
    usage: ['Резервное водоснабжение Бухары и Карши', 'Водопой скота', 'Ограниченная ирригация'],
  },
];

// Lookup map for fast access by id
export const WATER_BODIES_MAP = new Map<string, WaterBody>(
  WATER_BODIES.map(wb => [wb.id, wb])
);

// Find nearest water body to given coordinates (within radius in degrees)
export function findNearestWaterBody(lat: number, lng: number, radiusDeg = 0.8): WaterBody | null {
  let best: WaterBody | null = null;
  let bestDist = Infinity;
  for (const wb of WATER_BODIES) {
    const dlat = wb.coordinates.lat - lat;
    const dlng = wb.coordinates.lng - lng;
    const dist = Math.sqrt(dlat * dlat + dlng * dlng);
    if (dist < radiusDeg && dist < bestDist) {
      best = wb;
      bestDist = dist;
    }
  }
  return best;
}

// Water quality color mapping
export const WATER_QUALITY_COLORS: Record<WaterBody['water_quality'], string> = {
  excellent: '#22d3ee',
  good: '#06b6d4',
  moderate: '#eab308',
  poor: '#f97316',
  critical: '#ef4444',
};

export const WATER_QUALITY_LABELS: Record<WaterBody['water_quality'], string> = {
  excellent: 'Отличное',
  good: 'Хорошее',
  moderate: 'Умеренное',
  poor: 'Плохое',
  critical: 'Критическое',
};

export const FRESHNESS_LABELS: Record<WaterBody['freshness'], string> = {
  fresh: 'Пресная',
  brackish: 'Солоноватая',
  saline: 'Солёная',
  brine: 'Рассол',
};

export const FRESHNESS_COLORS: Record<WaterBody['freshness'], string> = {
  fresh: '#22d3ee',
  brackish: '#eab308',
  saline: '#f97316',
  brine: '#ef4444',
};

export const EXTRACTION_LABELS: Record<WaterBody['extraction_difficulty'], string> = {
  easy: 'Лёгкая',
  moderate: 'Умеренная',
  hard: 'Сложная',
  very_hard: 'Очень сложная',
};

export const EXTRACTION_COLORS: Record<WaterBody['extraction_difficulty'], string> = {
  easy: '#22c55e',
  moderate: '#eab308',
  hard: '#f97316',
  very_hard: '#ef4444',
};

export const PURIFICATION_LABELS: Record<WaterBody['purification_complexity'], string> = {
  low: 'Низкая',
  medium: 'Средняя',
  high: 'Высокая',
  very_high: 'Очень высокая',
};

export const PURIFICATION_COLORS: Record<WaterBody['purification_complexity'], string> = {
  low: '#22c55e',
  medium: '#eab308',
  high: '#f97316',
  very_high: '#ef4444',
};

export const WATER_TYPE_ICONS: Record<WaterBody['type'], string> = {
  river: 'Река',
  lake: 'Озеро',
  glacier: 'Ледник',
  reservoir: 'Водохранилище',
  canal: 'Канал',
  aquifer: 'Водоносный горизонт',
};

export const WATER_TYPE_COLORS: Record<WaterBody['type'], string> = {
  river: '#22d3ee',
  lake: '#3b82f6',
  glacier: '#e2e8f0',
  reservoir: '#06b6d4',
  canal: '#8b5cf6',
  aquifer: '#6366f1',
};
