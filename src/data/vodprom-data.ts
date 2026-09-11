// ═══════════════════════════════════════════════════════════════
//  VODPROM — Полная база данных объектов, субъектов и проектов
//  Центральная Азия, фокус — Узбекистан
// ═══════════════════════════════════════════════════════════════
//
//  О статусе чисел в этом файле.
//
//  Бюджеты, KPI, IRR и ROI взяты из описаний самих проектов и из открытых
//  публикаций. Платформа их не измеряла, не проверяла и не утверждала;
//  поля-источника у записей нет: ⟨заполнить⟩. Поэтому доходность здесь
//  везде помечена как заявленная и нигде не подаётся как показатель
//  платформы — платформа не привлекает средства и не обещает доходности.
//
//  Поле owners перечисляет стороны, названные в описании проекта (МВХР,
//  World Bank, ЕБРР, UNDP, IFAS и другие). Это не состав участников на
//  стороне платформы: соглашений с этими организациями нет.
// ═══════════════════════════════════════════════════════════════

export type SubjectType =
  | 'international_org'
  | 'state_agency'
  | 'research'
  | 'ngo'
  | 'business'
  | 'hydro_station'
  | 'river'
  | 'reservoir'
  | 'canal'
  | 'monitoring_station'
  | 'project';

export type MarkerRole = 'critical' | 'promising' | 'partner' | 'infrastructure' | 'monitoring';

export interface VodpromSubject {
  id: string;
  name: string;
  nameRu: string;
  type: SubjectType;
  role: MarkerRole;
  lat: number;
  lng: number;
  country: string;
  region?: string;
  description: string;
  budget?: string;
  kpis?: string[];
  website?: string;
  tags?: string[];
}

export interface VodpromProject {
  id: string;
  name: string;
  nameRu: string;
  icon: string;
  description: string;
  budget: string;
  kpis: string[];
  status: 'active' | 'funded' | 'planning' | 'completed';
  statusColor: string;
  impact: string;
  location: string;
  owners: string[];
  risks?: string;
  timeline?: string;
  lat: number;
  lng: number;
}

export interface TimelineEvent {
  year: number;
  type: 'drought' | 'crisis' | 'investment' | 'milestone';
  title: string;
  description: string;
  severity: number; // 0–1
  lat: number;
  lng: number;
  radius: number; // km
}

// ─── СУБЪЕКТЫ И ОБЪЕКТЫ ───────────────────────────────────────

export const VODPROM_SUBJECTS: VodpromSubject[] = [
  // ── Международные организации ──
  {
    id: 'ifas',
    name: 'IFAS (МФСА)',
    nameRu: 'Международный фонд спасения Арала',
    type: 'international_org',
    role: 'partner',
    lat: 43.2389,
    lng: 76.8897,
    country: 'Kazakhstan',
    region: 'Алматы',
    description: 'Межгосударственная организация пяти стран ЦА по координации проектов Аральского моря',
    tags: ['Аральское море', 'межгосударственный', 'фонд'],
  },
  {
    id: 'icwc',
    name: 'МКВК (ICWC)',
    nameRu: 'Межгосударственная координационная водохозяйственная комиссия',
    type: 'international_org',
    role: 'partner',
    lat: 41.2987,
    lng: 69.2411,
    country: 'Uzbekistan',
    region: 'Ташкент',
    description: 'Орган пяти стран ЦА по межгосударственному управлению водными ресурсами. НИЦ в Ташкенте.',
    tags: ['управление водой', 'ЦА', 'межгосударственный'],
  },
  {
    id: 'carec',
    name: 'CAREC / NIESA',
    nameRu: 'Центр экологии Центральной Азии',
    type: 'international_org',
    role: 'partner',
    lat: 43.2248,
    lng: 76.9066,
    country: 'Kazakhstan',
    region: 'Алматы',
    description: 'Региональный центр по экологии ЦА. Восстановление экосистем, CAWater-Info.',
    tags: ['экология', 'ЦА', 'мониторинг'],
  },
  {
    id: 'undp_uz',
    name: 'UNDP Uzbekistan',
    nameRu: 'ПРООН Узбекистан',
    type: 'international_org',
    role: 'partner',
    lat: 41.2994,
    lng: 69.2874,
    country: 'Uzbekistan',
    region: 'Ташкент',
    description: 'Программа развития ООН. Проекты прозрачного управления водой, GIS-платформа, $4.6 млн.',
    budget: '$4.6M',
    kpis: ['1 000 домохозяйств', '+30% водная эффективность', 'GIS-платформа'],
    tags: ['ООН', 'развитие', 'финансирование'],
  },
  {
    id: 'worldbank_uz',
    name: 'World Bank Uzbekistan',
    nameRu: 'Всемирный банк — офис Ташкент',
    type: 'international_org',
    role: 'promising',
    lat: 41.3275,
    lng: 69.2710,
    country: 'Uzbekistan',
    region: 'Ташкент',
    description: 'Финансирование модернизации ирригации Узбекистана. Проект $223 млн (200+23).',
    budget: '$223M',
    kpis: ['+232 тыс. га орошаемых земель', '–540 млн м³ потерь', '–165 млн кВт·ч/год'],
    tags: ['финансирование', 'ирригация', 'банк'],
  },

  // ── Государственные органы Узбекистана ──
  {
    id: 'minwater_uz',
    name: 'МВХР Узбекистана',
    nameRu: 'Министерство водного хозяйства Республики Узбекистан',
    type: 'state_agency',
    role: 'critical',
    lat: 41.2965,
    lng: 69.3270,
    country: 'Uzbekistan',
    region: 'Ташкент',
    description: 'Главный регулятор водной политики страны. Управляет ~3.9 млн га орошаемых площадей.',
    tags: ['государство', 'политика', 'регулятор'],
  },
  {
    id: 'uzhydromet',
    name: 'Узгидромет',
    nameRu: 'Гидрометеорологическая служба Узбекистана',
    type: 'state_agency',
    role: 'monitoring',
    lat: 41.3171,
    lng: 69.3349,
    country: 'Uzbekistan',
    region: 'Ташкент',
    description: 'Наблюдения на сотнях метеостанций и водобалансовых пунктах. Реанимировано 10+ станций.',
    tags: ['мониторинг', 'метео', 'данные'],
  },

  // ── Научные организации ──
  {
    id: 'niip_uz',
    name: 'НИИ Ирригации',
    nameRu: 'Научно-исследовательский институт ирригации и водных проблем',
    type: 'research',
    role: 'promising',
    lat: 41.2848,
    lng: 69.2879,
    country: 'Uzbekistan',
    region: 'Ташкент',
    description: 'СНИИИВП. Исследования эффективности орошения, технологии водосбережения.',
    tags: ['наука', 'ирригация', 'исследования'],
  },
  {
    id: 'tiiiam',
    name: 'ТИИЯМ',
    nameRu: 'Ташкентский институт инженеров ирригации и мелиорации',
    type: 'research',
    role: 'promising',
    lat: 41.2820,
    lng: 69.2803,
    country: 'Uzbekistan',
    region: 'Ташкент',
    description: 'Подготовка инженеров, инновации в водном секторе, стартап-инкубатор.',
    tags: ['образование', 'инженерия', 'инновации'],
  },
  {
    id: 'kazniigidroproject',
    name: 'КазНИИГидропроект',
    nameRu: 'Казахстанский НИИ гидропроектирования',
    type: 'research',
    role: 'partner',
    lat: 43.1948,
    lng: 76.8519,
    country: 'Kazakhstan',
    region: 'Алматы',
    description: 'Научный институт гидропроектирования. Исследования трансграничных рек.',
    tags: ['наука', 'Казахстан', 'гидропроект'],
  },

  // ── Реки (трассы) ──
  {
    id: 'amudarya',
    name: 'Амударья',
    nameRu: 'Амударья',
    type: 'river',
    role: 'infrastructure',
    lat: 39.5,
    lng: 63.5,
    country: 'Uzbekistan',
    description: 'Главная река ЦА. 57% территории Узбекистана. Исток — Памир (Таджикистан/Афганистан). Критически истощена.',
    tags: ['река', 'трансграничная', 'Аральское море'],
  },
  {
    id: 'syrdarya',
    name: 'Сырдарья',
    nameRu: 'Сырдарья',
    type: 'river',
    role: 'infrastructure',
    lat: 41.0,
    lng: 68.0,
    country: 'Uzbekistan',
    description: '27% территории Узбекистана. Сток из Ферганской долины (Киргизия, Таджикистан).',
    tags: ['река', 'трансграничная', 'Ферганская долина'],
  },
  {
    id: 'zarafshan',
    name: 'Зарафшан',
    nameRu: 'Зарафшан',
    type: 'river',
    role: 'infrastructure',
    lat: 39.8,
    lng: 64.4,
    country: 'Uzbekistan',
    description: 'Река Бухарской и Самаркандской областей. Исток — ледники Таджикистана.',
    tags: ['река', 'Бухара', 'Самарканд'],
  },
  {
    id: 'kashkadarya',
    name: 'Кашкадарья',
    nameRu: 'Кашкадарья',
    type: 'river',
    role: 'infrastructure',
    lat: 38.8,
    lng: 65.8,
    country: 'Uzbekistan',
    description: 'Река Кашкадарьинской области. Снабжает регион Карши.',
    tags: ['река', 'Карши', 'Кашкадарья'],
  },
  {
    id: 'surkhandarya',
    name: 'Сурхандарья',
    nameRu: 'Сурхандарья',
    type: 'river',
    role: 'infrastructure',
    lat: 37.9,
    lng: 67.4,
    country: 'Uzbekistan',
    description: 'Самая южная река Узбекистана. Граничит с Афганистаном.',
    tags: ['река', 'юг', 'Термез'],
  },

  // ── Гидроузлы и станции ──
  {
    id: 'charvak_hes',
    name: 'ГЭС Чарвак',
    nameRu: 'Чарвакская ГЭС',
    type: 'hydro_station',
    role: 'infrastructure',
    lat: 41.6267,
    lng: 70.0108,
    country: 'Uzbekistan',
    region: 'Ташкентская область',
    description: 'ГЭС на р. Чирчик. Мощность 620 МВт. Главный источник электроэнергии Ташкента.',
    tags: ['ГЭС', 'энергетика', 'водохранилище'],
  },
  {
    id: 'shardara_res',
    name: 'Шардаринское водохранилище',
    nameRu: 'Шардаринское водохранилище',
    type: 'reservoir',
    role: 'infrastructure',
    lat: 41.2300,
    lng: 68.0200,
    country: 'Kazakhstan',
    description: 'Крупное водохранилище на Сырдарье. Регулирует сток для Казахстана и Узбекистана.',
    tags: ['водохранилище', 'Сырдарья', 'Казахстан'],
  },
  {
    id: 'toktogul_hes',
    name: 'Токтогульская ГЭС',
    nameRu: 'Токтогульская ГЭС',
    type: 'hydro_station',
    role: 'critical',
    lat: 41.8300,
    lng: 72.7200,
    country: 'Kyrgyzstan',
    description: 'Крупнейшее водохранилище бассейна Сырдарьи (Кыргызстан). Ключ к ирригации низовий.',
    tags: ['ГЭС', 'Кыргызстан', 'Сырдарья', 'конфликт'],
  },
  {
    id: 'karakum_canal',
    name: 'Каракумский канал',
    nameRu: 'Каракумский канал',
    type: 'canal',
    role: 'critical',
    lat: 38.5,
    lng: 58.5,
    country: 'Turkmenistan',
    description: 'Крупнейший ирригационный канал мира. Отводит ~11 км³/год из Амударьи в Туркменистан.',
    tags: ['канал', 'Туркменистан', 'ирригация', 'потери'],
  },
  {
    id: 'amu_bukhara_canal',
    name: 'Аму-Бухарский канал',
    nameRu: 'Аму-Бухарский канал',
    type: 'canal',
    role: 'infrastructure',
    lat: 40.2,
    lng: 63.8,
    country: 'Uzbekistan',
    description: 'Питает Бухарскую область. Модернизация под программой World Bank снизит потери на 540 млн м³/год.',
    tags: ['канал', 'Бухара', 'модернизация'],
  },

  // ── Мониторинговые станции ──
  {
    id: 'chimbay_station',
    name: 'Пост Чимбай',
    nameRu: 'Гидрологический пост Чимбай (Амударья)',
    type: 'monitoring_station',
    role: 'monitoring',
    lat: 42.9400,
    lng: 59.7800,
    country: 'Uzbekistan',
    region: 'Каракалпакстан',
    description: 'Гидрологический пост учёта водоподачи на нижней Амударье. Реконструирован при поддержке Швейцарии.',
    tags: ['мониторинг', 'Амударья', 'Каракалпакстан'],
  },
  {
    id: 'sherabad_station',
    name: 'Пост Шерабад',
    nameRu: 'Гидрологический пост Шерабад',
    type: 'monitoring_station',
    role: 'monitoring',
    lat: 37.7200,
    lng: 66.9800,
    country: 'Uzbekistan',
    region: 'Сурхандарьинская область',
    description: 'Пост учёта стока р. Амударья у Термеза. Граница с Афганистаном.',
    tags: ['мониторинг', 'Амударья', 'Сурхандарья'],
  },

  // ── Зоны экологического кризиса ──
  {
    id: 'aral_south',
    name: 'Южный Арал / Аралкум',
    nameRu: 'Южная часть Аральского моря (Аралкум)',
    type: 'monitoring_station',
    role: 'critical',
    lat: 43.5,
    lng: 59.0,
    country: 'Uzbekistan',
    region: 'Каракалпакстан',
    description: 'Осушенное дно бывшего Аральского моря. 90–95% объёма потеряно с 1960-х. Пыльные бури.',
    tags: ['кризис', 'экология', 'пустыня', 'Аральское море'],
  },
  {
    id: 'aral_north',
    name: 'Северный Арал (Кокарал)',
    nameRu: 'Северное Аральское море (Казахстан)',
    type: 'reservoir',
    role: 'promising',
    lat: 46.8,
    lng: 61.0,
    country: 'Kazakhstan',
    description: 'Восстановленная часть Арала. Плотина Кокарал спасла ~20% объёма, рыболовство восстанавливается.',
    tags: ['восстановление', 'Казахстан', 'Аральское море'],
  },
];

// ─── ПРОЕКТЫ VODPROM ─────────────────────────────────────────

export const VODPROM_PROJECTS: VodpromProject[] = [
  {
    id: 'aral_restoration',
    name: 'Aral Sea Restoration',
    nameRu: 'Восстановление Аральского моря',
    icon: '🌊',
    description: 'Частичная реставрация экосистемы через дамбы, дезалинизацию и управляемое затопление. Северный Арал уже вырос с 18.9 до 23.5 км³.',
    budget: '$50B+',
    kpis: ['+20% объёма Северного Арала', '2 млн га обводнены', 'снижение пылевых бурь на 40%'],
    status: 'active',
    statusColor: '#00e6c8',
    impact: '90% площади может быть восстановлено',
    location: 'Приаралье (Казахстан / Узбекистан)',
    owners: ['IFAS', 'Правительство КЗ', 'Правительство УЗ'],
    risks: 'Засолённость воды, токсичные отложения, политические разногласия',
    timeline: '2030+',
    lat: 45.0,
    lng: 60.0,
  },
  {
    id: 'flood_redirect',
    name: 'Flood Redirection',
    nameRu: 'Переброска паводков',
    icon: '🔀',
    description: 'Перенаправление весенних паводковых вод крупных рек в засушливые регионы (модернизированный проект «Транс-Казахстанский канал»).',
    budget: 'Исследование',
    kpis: ['рост стока на юг', 'снижение наводнений', 'новые орошаемые площади'],
    status: 'planning',
    statusColor: '#a78bfa',
    impact: 'Потенциально 1 млн га новых угодий',
    location: 'Центральная Азия',
    owners: ['МКВК', 'WB', 'ЕБРР'],
    risks: 'Высокие энергозатраты, EIRR <10%, трансграничные споры',
    timeline: '2028–2035',
    lat: 43.0,
    lng: 65.0,
  },
  {
    id: 'irrigation_reform',
    name: 'Irrigation Reform',
    nameRu: 'Оросительные реформы',
    icon: '💧',
    description: 'Модернизация 259 км крупных каналов, замена насосов, внедрение капельного орошения (экономия 50–80% воды). Поддержано Всемирным банком.',
    budget: '$223M',
    kpis: ['+232 тыс. га орошаемых земель', '–540 млн м³ потерь/год', '–165 млн кВт·ч/год', '180K фермеров'],
    status: 'funded',
    statusColor: '#4ade80',
    impact: '180 000 фермеров получат надёжное водоснабжение',
    location: 'Узбекистан (5 регионов)',
    owners: ['МВХР Узбекистана', 'World Bank'],
    timeline: '2024–2027',
    lat: 40.5,
    lng: 65.5,
  },
  {
    id: 'hackathons_grants',
    name: 'Hackathons & Grants',
    nameRu: 'Хакатоны и гранты',
    icon: '🔬',
    description: 'Наука и инновации в водном секторе: хакатоны, стартап-инкубаторы, гранты R&D. Цель Узбекистана — 1% ВВП на науку к 2030.',
    budget: '$85M',
    kpis: ['50+ стартапов', 'Топ-60 Global Innovation Index', '+15% R&D бюджет'],
    status: 'planning',
    statusColor: '#a78bfa',
    impact: 'Новое поколение водных инженеров',
    location: 'Ташкент, Самарканд',
    owners: ['ТИИЯМ', 'НИИ', 'UNDP'],
    timeline: '2025–2030',
    lat: 41.3,
    lng: 69.3,
  },
  {
    id: 'aral_forests',
    name: 'Aral Forests (GRIP)',
    nameRu: 'Леса Приаралья — GRIP',
    icon: '🌳',
    description: 'Посадка мангровых и саксауловых лесов на осушённом дне Аральского моря (Аралкум). Снижение пылевых бурь, стабилизация почв.',
    budget: '$5–15M (каждая страна)',
    kpis: ['50 тыс. га лесопосадок', '–30% пылевых бурь', 'снижение ущерба здоровью'],
    status: 'active',
    statusColor: '#00e6c8',
    impact: 'Восстановление 1.5 млн га деградировавших земель',
    location: 'Каракалпакстан, Хорезм (Узбекистан)',
    owners: ['Правительство УЗ', 'CAREC', 'UNDP'],
    timeline: '2023–2030',
    lat: 43.8,
    lng: 59.5,
  },
  {
    id: 'pumping_station_2',
    name: 'Pumping Station No. 2',
    nameRu: 'Насосная станция №2',
    icon: '🏢',
    description: 'Модернизация насосной станции №2 в Джизакской области. Часть национальной системы управления водными ресурсами.',
    budget: '$7.76M',
    kpis: ['+25% энергоэффективность', 'Digital Twin интеграция', '17% IRR — заявлено в проекте'],
    status: 'active',
    statusColor: '#00e6c8',
    impact: 'Обеспечение стабильного водоснабжения региона',
    location: 'Джизакская область',
    owners: ['МВХР Узбекистана', 'UNICAP', 'VODPROM'],
    timeline: '2024–2034',
    lat: 40.12,
    lng: 67.83,
  },
  {
    id: 'korovulbozor_station',
    name: 'Korovulbozor Pumping Station',
    nameRu: 'Насосная станция Коровулбозор',
    icon: '⚡',
    description: 'Модернизация станции в Бухарской области. Переход на цифровое управление и энергосберегающие технологии.',
    budget: '$6.18M',
    kpis: ['–15% потери воды', 'Автоматизация 100%', '15% IRR — заявлено в проекте'],
    status: 'active',
    statusColor: '#00e6c8',
    impact: 'Снижение эксплуатационных расходов на 30%',
    location: 'Бухарская область',
    owners: ['МВХР Узбекистана', 'UNICAP', 'VODPROM'],
    timeline: '2024–2034',
    lat: 39.5,
    lng: 64.7,
  },
  {
    id: 'kuyumazar_auxiliary',
    name: 'Kuyumazar Auxiliary Station',
    nameRu: 'Вспомогательная станция Куюмазар',
    icon: '⚙️',
    description: 'Вспомогательная насосная станция в Бухарской области. Реконструкция и цифровая трансформация.',
    budget: '$11.96M',
    kpis: ['+40% пропускная способность', 'SCADA система', '22% IRR — заявлено в проекте'],
    status: 'active',
    statusColor: '#00e6c8',
    impact: 'Повышение надежности водной инфраструктуры',
    location: 'Бухарская область',
    owners: ['МВХР Узбекистана', 'UNICAP', 'VODPROM'],
    timeline: '2024–2034',
    lat: 39.8,
    lng: 64.5,
  },
  {
    id: 'kuyumazar_main',
    name: 'Kuyumazar Pumping Station',
    nameRu: 'Насосная станция Куюмазар',
    icon: '💧',
    description: 'Основная станция в Бухарской области. Крупнейший объект ирригационной системы региона.',
    budget: '$7.76M',
    kpis: ['Smart Water Monitoring', 'ROI в течение 7 лет — заявлено в проекте', '17% IRR — заявлено в проекте'],
    status: 'active',
    statusColor: '#00e6c8',
    impact: 'Гарантированное водоснабжение 50 тыс. га',
    location: 'Бухарская область',
    owners: ['МВХР Узбекистана', 'UNICAP', 'VODPROM'],
    timeline: '2024–2034',
    lat: 39.8,
    lng: 64.6,
  },
  {
    id: 'amu_bukhara_1',
    name: 'Amu-Bukhara-1 Station',
    nameRu: 'Насосная станция Аму-Бухара-1',
    icon: '🌊',
    description: 'Критически важный объект инфраструктуры. Требует срочной модернизации и внедрения систем эффективности.',
    budget: '$9.49M',
    kpis: ['–40% энергопотребление', 'Blockchain-учет воды', '20% IRR — заявлено в проекте'],
    status: 'active',
    statusColor: '#00e6c8',
    impact: 'Предотвращение системного дефицита в регионе',
    location: 'Бухарская область',
    owners: ['МВХР Узбекистана', 'UNICAP', 'VODPROM'],
    timeline: '2024–2034',
    lat: 39.4,
    lng: 64.4,
  },
  {
    id: 'chimkur_treatment',
    name: 'Chimkur Treatment Plant',
    nameRu: 'Очистные сооружения Чимкур',
    icon: '🟢',
    description: 'Строительство и модернизация очистных сооружений в Хорезмской области. Обеспечение 2 млн человек качественной питьевой водой.',
    budget: '$50.0M',
    kpis: ['95% очистка стоков', '2.1 км³ экономия воды', '⭐ Топ-1 приоритет'],
    status: 'active',
    statusColor: '#10b981',
    impact: 'Снижение заболеваемости на 40% и улучшение экологии',
    location: 'Хорезмская область',
    owners: ['МВХР Узбекистана', 'World Bank', 'VODPROM'],
    timeline: '2025–2028',
    lat: 41.5,
    lng: 60.6,
  },
];

// ─── СОБЫТИЯ ТАЙМЛАЙНА 1900–2040 ─────────────────────────────

export const TIMELINE_EVENTS: TimelineEvent[] = [
  // Ранний период — почти нет кризисов
  { year: 1900, type: 'milestone', title: 'Начало ирригации', description: 'Советская программа освоения степей', severity: 0.05, lat: 43.5, lng: 59.0, radius: 50 },

  // Начало деградации Арала
  { year: 1960, type: 'crisis', title: 'Начало усыхания Арала', description: 'Советские проекты хлопкового орошения забирают воду из рек', severity: 0.2, lat: 44.0, lng: 60.0, radius: 200 },
  { year: 1970, type: 'drought', title: 'Первые зоны засухи', description: 'Расширение орошаемых площадей, падение уровня Арала', severity: 0.35, lat: 43.5, lng: 59.0, radius: 300 },
  { year: 1980, type: 'crisis', title: 'Аральская катастрофа', description: 'Арал потерял 60% объёма. Пыльные бури в Каракалпакстане', severity: 0.55, lat: 43.0, lng: 58.0, radius: 450 },
  { year: 1990, type: 'drought', title: 'Усиление деградации', description: 'Распад СССР, потеря контроля над ирригацией. Аральское море — 30% от 1960', severity: 0.68, lat: 43.5, lng: 59.0, radius: 550 },

  // 2000-е — международное внимание
  { year: 2000, type: 'investment', title: 'Международные программы', description: 'IFAS, UNDP, World Bank начинают проекты восстановления', severity: 0.72, lat: 41.3, lng: 69.3, radius: 100 },
  { year: 2005, type: 'milestone', title: 'Плотина Кокарал (Казахстан)', description: 'Северный Арал начинает восстановление. Рыбный промысел возобновлён.', severity: 0.7, lat: 46.8, lng: 61.0, radius: 150 },
  { year: 2010, type: 'drought', title: 'Засухи в ЦА', description: 'Климатические изменения — снижение осадков и отступление ледников', severity: 0.75, lat: 40.0, lng: 65.0, radius: 600 },

  // 2020-е — усугубление
  { year: 2020, type: 'crisis', title: 'Критический дефицит', description: 'Весенний сток снизился на 15–20%. 90% Южного Арала пересохло.', severity: 0.82, lat: 43.5, lng: 59.0, radius: 700 },
  { year: 2023, type: 'investment', title: 'Программы модернизации', description: 'World Bank $223M на ирригацию. Капельное орошение CNPC.', severity: 0.80, lat: 41.3, lng: 69.3, radius: 120 },
  { year: 2025, type: 'drought', title: 'Ледники Памира отступают', description: 'Прогноз: –30–40% водных ресурсов к 2040 из-за таяния ледников', severity: 0.85, lat: 38.5, lng: 73.5, radius: 400 },

  // Пик кризиса 2036
  { year: 2036, type: 'crisis', title: 'Пиковый кризис', description: 'Дефицит воды 5–12 км³/год. Угроза продовольственной безопасности 82 млн человек.', severity: 0.95, lat: 43.0, lng: 62.0, radius: 900 },

  // Восстановление (при внедрении VODPROM)
  { year: 2038, type: 'investment', title: 'VODPROM интегрирован', description: 'Цифровой мониторинг, инвестпакеты, блокчейн-транзакции запущены', severity: 0.6, lat: 41.3, lng: 69.3, radius: 200 },
  { year: 2040, type: 'milestone', title: 'Начало восстановления', description: 'Реки полнее, леса Аралкума разрастаются, дефицит снижен на 35%', severity: 0.4, lat: 43.5, lng: 59.0, radius: 600 },
];

// ─── МЕТРИКИ ПО ГОДАМ ────────────────────────────────────────

export interface YearMetrics {
  year: number;
  waterDeficit: number;   // % дефицита от нормы
  droughtArea: number;    // % площади ЦА под засухой
  aralVolume: number;     // % от объёма 1960 года
  investments: number;    // $млрд
  rdIndex: number;        // индекс R&D 0–100
  affectedPeople: number; // млн человек в зоне риска
}

export const YEAR_METRICS: YearMetrics[] = [
  { year: 1900, waterDeficit: 0,  droughtArea: 5,  aralVolume: 100, investments: 0,    rdIndex: 0,  affectedPeople: 2  },
  { year: 1960, waterDeficit: 3,  droughtArea: 12, aralVolume: 98,  investments: 0.1,  rdIndex: 5,  affectedPeople: 8  },
  { year: 1970, waterDeficit: 8,  droughtArea: 18, aralVolume: 75,  investments: 0.2,  rdIndex: 8,  affectedPeople: 15 },
  { year: 1980, waterDeficit: 14, droughtArea: 26, aralVolume: 40,  investments: 0.4,  rdIndex: 12, affectedPeople: 25 },
  { year: 1990, waterDeficit: 19, droughtArea: 33, aralVolume: 22,  investments: 0.5,  rdIndex: 15, affectedPeople: 38 },
  { year: 2000, waterDeficit: 22, droughtArea: 38, aralVolume: 13,  investments: 1.2,  rdIndex: 22, affectedPeople: 50 },
  { year: 2005, waterDeficit: 23, droughtArea: 40, aralVolume: 10,  investments: 2.1,  rdIndex: 28, affectedPeople: 55 },
  { year: 2010, waterDeficit: 25, droughtArea: 44, aralVolume: 8,   investments: 3.5,  rdIndex: 35, affectedPeople: 62 },
  { year: 2020, waterDeficit: 30, droughtArea: 52, aralVolume: 5,   investments: 5.8,  rdIndex: 48, affectedPeople: 75 },
  { year: 2023, waterDeficit: 32, droughtArea: 55, aralVolume: 4,   investments: 7.2,  rdIndex: 55, affectedPeople: 80 },
  { year: 2025, waterDeficit: 34, droughtArea: 57, aralVolume: 4,   investments: 8.5,  rdIndex: 60, affectedPeople: 82 },
  { year: 2030, waterDeficit: 37, droughtArea: 62, aralVolume: 3,   investments: 10.0, rdIndex: 68, affectedPeople: 85 },
  { year: 2036, waterDeficit: 42, droughtArea: 70, aralVolume: 2,   investments: 12.0, rdIndex: 75, affectedPeople: 90 },
  { year: 2038, waterDeficit: 35, droughtArea: 60, aralVolume: 5,   investments: 18.0, rdIndex: 82, affectedPeople: 78 },
  { year: 2040, waterDeficit: 25, droughtArea: 45, aralVolume: 12,  investments: 25.0, rdIndex: 90, affectedPeople: 60 },
];

// Interpolate metrics for any year
export function getMetricsForYear(year: number): YearMetrics {
  const sorted = [...YEAR_METRICS].sort((a, b) => a.year - b.year);
  if (year <= sorted[0].year) return sorted[0];
  if (year >= sorted[sorted.length - 1].year) return sorted[sorted.length - 1];

  const lo = [...sorted].reverse().find(m => m.year <= year)!;
  const hi = sorted.find(m => m.year > year)!;
  const t = (year - lo.year) / (hi.year - lo.year);

  return {
    year,
    waterDeficit:    lo.waterDeficit    + (hi.waterDeficit    - lo.waterDeficit)    * t,
    droughtArea:     lo.droughtArea     + (hi.droughtArea     - lo.droughtArea)     * t,
    aralVolume:      lo.aralVolume      + (hi.aralVolume      - lo.aralVolume)      * t,
    investments:     lo.investments     + (hi.investments     - lo.investments)     * t,
    rdIndex:         lo.rdIndex         + (hi.rdIndex         - lo.rdIndex)         * t,
    affectedPeople:  lo.affectedPeople  + (hi.affectedPeople  - lo.affectedPeople)  * t,
  };
}
