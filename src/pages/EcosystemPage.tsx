import { useState, useMemo } from "react";

// ─── Types ───────────────────────────────────────────────────

interface Grant {
  id: string;
  title: string;
  donor: string;
  donorFlag: string;
  amount: string;
  deadline: string;
  deadlineDate: Date;
  category: string;
  regions: string[];
  description: string;
  requirements: string[];
  status: "open" | "closing_soon" | "closed";
  url: string;
}

interface Competition {
  id: string;
  title: string;
  type: "hackathon" | "competition" | "accelerator" | "award";
  host: string;
  hostFlag: string;
  dates: string;
  location: string;
  format: "online" | "offline" | "hybrid";
  prize: string;
  participants: string;
  theme: string;
  deadline: string;
  deadlineDate: Date;
  description: string;
  tracks: string[];
  status: "open" | "upcoming" | "ongoing" | "closing_soon" | "ended";
}

interface Research {
  id: string;
  title: string;
  institution: string;
  country: string;
  flag: string;
  field: string;
  status: "active" | "published" | "seeking_partners";
  funding: string;
  duration: string;
  summary: string;
  keywords: string[];
  contactEmail: string;
  publicationYear?: number;
}

interface Education {
  id: string;
  title: string;
  institution: string;
  flag: string;
  format: "online" | "offline" | "hybrid";
  duration: string;
  cost: string;
  description: string;
  level: string;
}

interface Diplomacy {
  id: string;
  title: string;
  organization: string;
  date: string;
  location: string;
  countries: string[];
  type: "meeting" | "agreement" | "negotiation" | "session" | "program";
  description: string;
  status: "completed" | "upcoming" | "ongoing";
}

// ─── Data ────────────────────────────────────────────────────

const GRANTS: Grant[] = [
  {
    id: "g1",
    title: "ADB Water Security Grant",
    donor: "Asian Development Bank",
    donorFlag: "🌏",
    amount: "$2,000,000",
    deadline: "15 июля 2026",
    deadlineDate: new Date("2026-07-15"),
    category: "Грант",
    regions: ["Казахстан", "Кыргызстан", "Таджикистан", "Туркменистан", "Узбекистан"],
    description: "Финансирование проектов по водной безопасности и устойчивому управлению водными ресурсами в Центральной Азии.",
    requirements: [
      "Государственная или НКО-организация с опытом 5+ лет",
      "Проект в области водоснабжения или ирригации",
      "Наличие со-финансирования 20%",
    ],
    status: "open",
    url: "#",
  },
  {
    id: "g2",
    title: "GEF Small Grants Programme",
    donor: "Global Environment Facility",
    donorFlag: "🌍",
    amount: "$50,000 – $300,000",
    deadline: "30 июня 2026",
    deadlineDate: new Date("2026-06-30"),
    category: "Грант",
    regions: ["Все регионы"],
    description: "Поддержка локальных инициатив по охране окружающей среды и устойчивому управлению водными ресурсами.",
    requirements: [
      "НКО или общественная организация",
      "Вовлечение местных сообществ",
      "Экологическая направленность проекта",
    ],
    status: "closing_soon",
    url: "#",
  },
  {
    id: "g3",
    title: "USAID Water for the World",
    donor: "USAID",
    donorFlag: "🇺🇸",
    amount: "$500,000 – $5,000,000",
    deadline: "1 августа 2026",
    deadlineDate: new Date("2026-08-01"),
    category: "Грант",
    regions: ["Центральная Азия (приоритет)", "Южная Азия"],
    description: "Программа улучшения доступа к безопасной воде и санитарии в приоритетных регионах мира.",
    requirements: [
      "Опыт реализации проектов WASH",
      "Партнёрство с местными органами власти",
      "Измеримые индикаторы охвата населения",
    ],
    status: "open",
    url: "#",
  },
  {
    id: "g4",
    title: 'Фонд "Ёшлар" Узбекистан',
    donor: "Фонд поддержки молодёжи Узбекистана",
    donorFlag: "🇺🇿",
    amount: "до 500 000 000 сум",
    deadline: "1 июля 2026",
    deadlineDate: new Date("2026-07-01"),
    category: "Грант",
    regions: ["Узбекистан"],
    description: "Гранты для молодёжных стартапов в области водных технологий, экологии и агроинноваций.",
    requirements: [
      "Руководитель проекта до 35 лет",
      "Регистрация юридического лица в Узбекистане",
      "Технологическая или инновационная составляющая",
    ],
    status: "open",
    url: "#",
  },
  {
    id: "g5",
    title: "EU LIFE Programme Water",
    donor: "Европейский союз",
    donorFlag: "🇪🇺",
    amount: "€1,000,000 – €5,000,000",
    deadline: "30 сентября 2026",
    deadlineDate: new Date("2026-09-30"),
    category: "Грант",
    regions: ["Страны-партнёры ЕС", "Центральная Азия"],
    description: "Финансирование инновационных решений в области водной политики, экологии и климатической адаптации.",
    requirements: [
      "Консорциум из 3+ организаций",
      "Инновационный технологический компонент",
      "Демонстрационный эффект и масштабируемость",
    ],
    status: "open",
    url: "#",
  },
  {
    id: "g6",
    title: "EBRD Green Economy Financing",
    donor: "European Bank for Reconstruction and Development",
    donorFlag: "🌍",
    amount: "$1,000,000 – $20,000,000",
    deadline: "Постоянный приём заявок",
    deadlineDate: new Date("2027-12-31"),
    category: "Грант",
    regions: ["Центральная Азия", "Восточная Европа"],
    description: "Финансирование зелёной инфраструктуры, энергоэффективности и устойчивого водопользования.",
    requirements: [
      "Проект зелёной инфраструктуры",
      "Частный или государственный сектор",
      "Соответствие стандартам ЕБРР по экологии",
    ],
    status: "open",
    url: "#",
  },
  {
    id: "g7",
    title: "UN-Water Innovation Prize",
    donor: "ООН — Водные ресурсы",
    donorFlag: "🌐",
    amount: "$100,000",
    deadline: "31 октября 2026",
    deadlineDate: new Date("2026-10-31"),
    category: "Грант",
    regions: ["Все страны"],
    description: "Международная премия за прорывные технологические решения в управлении водными ресурсами.",
    requirements: [
      "Инновационная технология или методология",
      "Доказанный практический результат",
      "Потенциал глобального масштабирования",
    ],
    status: "open",
    url: "#",
  },
  {
    id: "g8",
    title: 'Фонд "Ватандош"',
    donor: "Фонд поддержки узбекских предпринимателей",
    donorFlag: "🇺🇿",
    amount: "до $200,000",
    deadline: "20 июня 2026",
    deadlineDate: new Date("2026-06-20"),
    category: "Грант",
    regions: ["Узбекистан и диаспора"],
    description: "Поддержка стартапов и малых предприятий узбекских предпринимателей в сфере технологий и экологии.",
    requirements: [
      "Основатели с узбекским гражданством или корнями",
      "Стартап или МСБ на ранней стадии",
      "Технологический или социальный эффект",
    ],
    status: "closing_soon",
    url: "#",
  },
];

const COMPETITIONS: Competition[] = [
  {
    id: "c1",
    title: "Water Innovation Hackathon 2026",
    type: "hackathon",
    host: "UN-Water & WRI",
    hostFlag: "🌐",
    dates: "18–20 июля 2026",
    location: "Онлайн",
    format: "online",
    prize: "$30,000",
    participants: "до 500 участников",
    theme: "IoT + AI для управления водой",
    deadline: "10 июля 2026",
    deadlineDate: new Date("2026-07-10"),
    description: "Международный хакатон по разработке цифровых решений для умного мониторинга воды и предотвращения потерь.",
    tracks: ["IoT-мониторинг", "ML-прогнозирование", "Мобильные приложения", "Open Data"],
    status: "open",
  },
  {
    id: "c2",
    title: "TIIF Water Tech Challenge",
    type: "competition",
    host: "Ташкентский международный инвестиционный форум",
    hostFlag: "🇺🇿",
    dates: "22 сентября 2026",
    location: "Ташкент, Узбекистан",
    format: "offline",
    prize: "$50,000 + акселерация",
    participants: "до 100 команд",
    theme: "Водная безопасность Центральной Азии",
    deadline: "1 сентября 2026",
    deadlineDate: new Date("2026-09-01"),
    description: "Конкурс технологических решений для улучшения водной безопасности и эффективности ирригации в ЦА.",
    tracks: ["Ирригационные технологии", "Очистка воды", "Цифровой мониторинг", "Водопотребление"],
    status: "open",
  },
  {
    id: "c3",
    title: "ADB WaterXPrize Central Asia",
    type: "competition",
    host: "Asian Development Bank",
    hostFlag: "🌏",
    dates: "Финал: декабрь 2026",
    location: "Онлайн (заявки)",
    format: "online",
    prize: "$500,000",
    participants: "открыто",
    theme: "Прорывные технологии водообеспечения",
    deadline: "15 августа 2026",
    deadlineDate: new Date("2026-08-15"),
    description: "Крупнейший конкурс инновационных решений для обеспечения доступа к чистой воде в Центральной Азии.",
    tracks: ["Опреснение", "Повторное использование воды", "Умная ирригация", "Менеджмент водных данных"],
    status: "open",
  },
  {
    id: "c4",
    title: "GWP Youth Water Competition",
    type: "competition",
    host: "Global Water Partnership",
    hostFlag: "🌍",
    dates: "Июль–август 2026",
    location: "Гибрид",
    format: "hybrid",
    prize: "Стажировка + $5,000",
    participants: "молодёжь до 30 лет",
    theme: "Вовлечённость молодёжи в водное управление",
    deadline: "30 июня 2026",
    deadlineDate: new Date("2026-06-30"),
    description: "Международный конкурс для молодых специалистов и студентов в области водных ресурсов.",
    tracks: ["Молодёжная политика", "Образование о воде", "Общественное участие", "Инновации"],
    status: "closing_soon",
  },
  {
    id: "c5",
    title: "Узводхоз Best Project Award 2026",
    type: "award",
    host: "Министерство водного хозяйства РУз",
    hostFlag: "🇺🇿",
    dates: "Декабрь 2026",
    location: "Ташкент",
    format: "offline",
    prize: "Официальное признание + грант",
    participants: "проекты МВХ",
    theme: "Лучший ирригационный проект года",
    deadline: "1 ноября 2026",
    deadlineDate: new Date("2026-11-01"),
    description: "Ежегодная государственная премия за лучшие достижения в сфере водного хозяйства Узбекистана.",
    tracks: ["Ирригация", "Водоснабжение", "Цифровизация", "Экологичность"],
    status: "upcoming",
  },
  {
    id: "c6",
    title: "Smart Irrigation Startup Cup",
    type: "accelerator",
    host: "GIZ & Fraunhofer Institute",
    hostFlag: "🇩🇪",
    dates: "Сентябрь 2026",
    location: "Берлин, Германия",
    format: "offline",
    prize: "€100,000 + инвестиции",
    participants: "стартапы до Series A",
    theme: "Умная ирригация и агроводные технологии",
    deadline: "15 июля 2026",
    deadlineDate: new Date("2026-07-15"),
    description: "Европейский акселератор для стартапов, разрабатывающих технологии умного водопользования в сельском хозяйстве.",
    tracks: ["Точное земледелие", "Сенсорные сети", "Автоматизация полива", "AgriFinTech"],
    status: "upcoming",
  },
  {
    id: "c7",
    title: "WaterHack Almaty",
    type: "hackathon",
    host: "Central Asia Water Hub",
    hostFlag: "🇰🇿",
    dates: "5–7 сентября 2026",
    location: "Алматы, Казахстан",
    format: "offline",
    prize: "$15,000",
    participants: "до 200 участников",
    theme: "Трансграничное управление водными ресурсами",
    deadline: "25 августа 2026",
    deadlineDate: new Date("2026-08-25"),
    description: "Региональный хакатон по созданию инструментов для совместного управления трансграничными водотоками ЦА.",
    tracks: ["Трансграничные данные", "Дипломатические инструменты", "Совместный мониторинг", "Прогнозирование"],
    status: "open",
  },
  {
    id: "c8",
    title: "UN-Water Youth Accelerator",
    type: "accelerator",
    host: "ООН — Водные ресурсы",
    hostFlag: "🌐",
    dates: "Октябрь–декабрь 2026",
    location: "Онлайн",
    format: "online",
    prize: "$25,000 + менторство",
    participants: "молодые лидеры до 35 лет",
    theme: "Молодёжь в водном секторе",
    deadline: "30 июня 2026",
    deadlineDate: new Date("2026-06-30"),
    description: "Акселератор ООН для молодых лидеров, реализующих инновационные проекты в области водных ресурсов.",
    tracks: ["Лидерство", "Стартапы", "Политика", "Технологии"],
    status: "closing_soon",
  },
];

const RESEARCH: Research[] = [
  {
    id: "r1",
    title: "Прогнозирование засух с ML в бассейне Амударьи",
    institution: "ТашГТУ",
    country: "Узбекистан",
    flag: "🇺🇿",
    field: "Гидрология + AI",
    status: "seeking_partners",
    funding: "Национальный фонд науки",
    duration: "2024–2027",
    summary: "Разработка ML-моделей для прогнозирования засух и маловодных периодов в бассейне Амударьи на основе данных спутникового мониторинга, климатических реанализов и гидрологических станций.",
    keywords: ["машинное обучение", "засухи", "Амударья", "гидрология", "климат"],
    contactEmail: "hydro@tashgtu.uz",
  },
  {
    id: "r2",
    title: "Солевое загрязнение почв Приаралья: мониторинг и реабилитация",
    institution: "НУУ им. Мирзо Улугбека",
    country: "Узбекистан",
    flag: "🇺🇿",
    field: "Экология",
    status: "published",
    funding: "ЮНЕП + МВХ РУз",
    duration: "2022–2025",
    summary: "Комплексное исследование динамики засоления почв и грунтовых вод в Приаральском регионе. Разработаны рекомендации по фиторемедиации и агромелиорации для возврата деградированных земель в оборот.",
    keywords: ["засоление", "Приаралье", "мониторинг", "реабилитация почв", "экология"],
    contactEmail: "ecology@nuu.uz",
    publicationYear: 2025,
  },
  {
    id: "r3",
    title: "Сравнительный анализ ирригационных КПД ЦА 2015–2025",
    institution: "IWMI",
    country: "Международная",
    flag: "🌍",
    field: "Ирригация",
    status: "published",
    funding: "CGIAR Water Security Program",
    duration: "2023–2026",
    summary: "Десятилетний сравнительный анализ эффективности ирригационных систем пяти стран Центральной Азии. Выявлены ключевые факторы потерь воды, предложены меры по повышению КПД до 0.75+.",
    keywords: ["ирригация", "КПД", "водоотдача", "Центральная Азия", "сравнительный анализ"],
    contactEmail: "info@iwmi.org",
    publicationYear: 2026,
  },
  {
    id: "r4",
    title: "Трансграничные водные конфликты: правовые механизмы урегулирования",
    institution: "ПРООН",
    country: "Международная",
    flag: "🌐",
    field: "Право + Дипломатия",
    status: "active",
    funding: "UNDP + ЕС",
    duration: "2025–2028",
    summary: "Изучение правовых инструментов урегулирования водных споров между государствами ЦА. Анализ международного водного права, опыта Меконга и Нила, разработка модельных соглашений для региона.",
    keywords: ["международное право", "водные конфликты", "дипломатия", "соглашения", "трансграничные реки"],
    contactEmail: "water@undp.org",
  },
  {
    id: "r5",
    title: "IoT-сети для мониторинга горных рек Кыргызстана",
    institution: "КРСУ (Кыргызско-Российский Славянский университет)",
    country: "Кыргызстан",
    flag: "🇰🇬",
    field: "IoT + Гидрология",
    status: "seeking_partners",
    funding: "Государственная программа КР",
    duration: "2025–2027",
    summary: "Разработка и внедрение распределённой сети IoT-датчиков для мониторинга уровня, расхода и качества воды в горных реках Тянь-Шаня. Интеграция с платформой раннего предупреждения о паводках.",
    keywords: ["IoT", "горные реки", "мониторинг", "датчики", "паводки", "Кыргызстан"],
    contactEmail: "iot@krsu.edu.kg",
  },
  {
    id: "r6",
    title: "Экономика водопользования в условиях климатических изменений",
    institution: "Всемирный банк",
    country: "Международная",
    flag: "🌍",
    field: "Экономика",
    status: "published",
    funding: "World Bank Research Program",
    duration: "2024–2026",
    summary: "Экономическое моделирование последствий изменения климата для водных ресурсов ЦА. Оценка потерь ВВП, расчёт оптимальных тарифов на воду, анализ ROI инвестиций в водную инфраструктуру.",
    keywords: ["экономика воды", "климатические изменения", "водный тариф", "ВВП", "инвестиции"],
    contactEmail: "watereconomics@worldbank.org",
    publicationYear: 2026,
  },
];

const EDUCATION: Education[] = [
  {
    id: "e1",
    title: 'Курс "Цифровое водное хозяйство"',
    institution: "Министерство водного хозяйства РУз",
    flag: "🇺🇿",
    format: "online",
    duration: "3 месяца",
    cost: "Бесплатно для сотрудников МВХ",
    description: "Профессиональная переподготовка по цифровым технологиям в водном хозяйстве: ГИС, IoT, аналитика данных, SCADA-системы.",
    level: "Профессиональная переподготовка",
  },
  {
    id: "e2",
    title: "Water Management MSc",
    institution: "UNESCO-IHE Institute for Water Education",
    flag: "🇳🇱",
    format: "offline",
    duration: "2 года",
    cost: "Грант доступен",
    description: "Магистерская программа мирового уровня по управлению водными ресурсами, гидрологии, ирригации и политике в области воды.",
    level: "Магистратура",
  },
  {
    id: "e3",
    title: "Water Leadership Program",
    institution: "Asian Development Bank",
    flag: "🌏",
    format: "hybrid",
    duration: "1 неделя",
    cost: "Финансируется ADB",
    description: "Интенсивная программа развития лидерских компетенций для государственных служащих в водном секторе ЦА и ЮВА.",
    level: "Профессиональное развитие",
  },
  {
    id: "e4",
    title: "Regional Training on Water Management",
    institution: "IWMI (International Water Management Institute)",
    flag: "🌍",
    format: "online",
    duration: "2 недели",
    cost: "Бесплатно",
    description: "Онлайн-тренинг по современным методам управления водными ресурсами, мониторинга и оценки ирригационных систем.",
    level: "Повышение квалификации",
  },
  {
    id: "e5",
    title: "Water Security Certificate",
    institution: "Stanford University",
    flag: "🇺🇸",
    format: "online",
    duration: "6 месяцев",
    cost: "$1,200",
    description: "Сертификатная программа Стэнфорда по водной безопасности: политика, технологии, финансирование, глобальные вызовы.",
    level: "Сертификат",
  },
  {
    id: "e6",
    title: "Водохозяйственное дело (бакалавриат)",
    institution: "ТашГТУ им. Ислама Каримова",
    flag: "🇺🇿",
    format: "offline",
    duration: "4 года",
    cost: "Бюджетные места доступны",
    description: "Классическая инженерная программа по водному хозяйству, гидравлике, ирригации и мелиорации с производственной практикой.",
    level: "Бакалавриат",
  },
];

const DIPLOMACY: Diplomacy[] = [
  {
    id: "d1",
    title: "Совещание МКВК — Межгосударственная координационная водная комиссия",
    organization: "МКВК",
    date: "Июнь 2026",
    location: "Ашхабад, Туркменистан",
    countries: ["🇺🇿", "🇰🇿", "🇰🇬", "🇹🇯", "🇹🇲"],
    type: "meeting",
    description: "Очередное заседание МКВК по распределению водных лимитов на 2026–2027 годы, оценке паводковой ситуации и координации трансграничного управления Амударьёй и Сырдарьёй.",
    status: "upcoming",
  },
  {
    id: "d2",
    title: "Ратификация соглашения по Амударье",
    organization: "МИД Узбекистана и Таджикистана",
    date: "Май 2026",
    location: "Душанбе, Таджикистан",
    countries: ["🇺🇿", "🇹🇯"],
    type: "agreement",
    description: "Узбекистан и Таджикистан подписали обновлённый двусторонний протокол о порядке использования водных ресурсов Амударьи, включая режим работы Нурекского водохранилища в вегетационный период.",
    status: "completed",
  },
  {
    id: "d3",
    title: "Переговоры о Нурекском водохранилище — 4-й раунд",
    organization: "Правительства Таджикистана и Узбекистана",
    date: "Апрель 2026",
    location: "Ташкент, Узбекистан",
    countries: ["🇹🇯", "🇺🇿"],
    type: "negotiation",
    description: "Четвёртый раунд переговоров по режиму сбросов Нурекского водохранилища. Стороны согласовали летний режим сбросов и создали совместный технический комитет мониторинга.",
    status: "completed",
  },
  {
    id: "d4",
    title: "Сессия ЮНЕП — Водная повестка Центральной Азии",
    organization: "ЮНЕП",
    date: "Сентябрь 2026",
    location: "Женева, Швейцария",
    countries: ["🌐", "🇺🇿", "🇰🇿", "🇰🇬", "🇹🇯", "🇹🇲"],
    type: "session",
    description: "Специальная сессия ЮНЕП по оценке экологического состояния бассейна Аральского моря и принятию обновлённых рекомендаций для правительств региона по управлению трансграничными водотоками.",
    status: "upcoming",
  },
  {
    id: "d5",
    title: "Программа восстановления Аральского моря 2026–2031",
    organization: "ООН + правительства ЦА + МФСА",
    date: "Январь 2026 — декабрь 2031",
    location: "Регион Аральского моря",
    countries: ["🌐", "🇺🇿", "🇰🇿", "🇰🇬", "🇹🇯", "🇹🇲"],
    type: "program",
    description: "Новая пятилетняя международная программа восстановления экосистемы Аральского моря. Бюджет $2.5 млрд. Включает облесение, реабилитацию каналов, создание малого Арала-2 и поддержку пострадавших сообществ.",
    status: "ongoing",
  },
];

// ─── Unified Feed Data ────────────────────────────────────────

interface FeedItem {
  id: string;
  category: "Грант" | "Хакатон" | "Конкурс" | "Акселератор" | "НИОКР" | "Образование" | "Дипломатия";
  headline: string;
  organization: string;
  date: string;
  location: string;
  description: string;
  status?: string;
  actionLabel: "Подать заявку" | "Подробнее" | "Участвовать";
}

const FEED_ITEMS: FeedItem[] = [
  { id: "f1", category: "Грант", headline: "ADB Water Security Grant — $2M для проектов ЦА", organization: "Asian Development Bank", date: "Дедлайн: 15 июля 2026", location: "Центральная Азия", description: "Крупный грант на водную безопасность. Приоритет — инновационные ирригационные системы и цифровой мониторинг.", status: "Открыт", actionLabel: "Подать заявку" },
  { id: "f2", category: "Хакатон", headline: "Water Innovation Hackathon 2026 — IoT+AI", organization: "UN-Water & WRI", date: "18–20 июля 2026", location: "Онлайн", description: "Международный хакатон по умному водному мониторингу. Призовой фонд $30,000. До 500 участников.", status: "Открыта регистрация", actionLabel: "Участвовать" },
  { id: "f3", category: "НИОКР", headline: "Ищем партнёров: ML-прогнозирование засух в бассейне Амударьи", organization: "ТашГТУ 🇺🇿", date: "2024–2027", location: "Ташкент / дистанционно", description: "Активный исследовательский проект по ML-моделям засух ищет международных партнёров с климатическими данными.", status: "Ищет партнёров", actionLabel: "Подробнее" },
  { id: "f4", category: "Грант", headline: 'GEF Small Grants — до $300K, дедлайн скоро!', organization: "Global Environment Facility", date: "Дедлайн: 30 июня 2026", location: "Все регионы", description: "Гранты для НКО и общественных организаций. Закрытие приёма заявок через несколько недель!", status: "Скоро закрытие", actionLabel: "Подать заявку" },
  { id: "f5", category: "Образование", headline: "UNESCO-IHE Water Management MSc — гранты доступны", organization: "UNESCO-IHE 🇳🇱", date: "Набор 2026–2027", location: "Делфт, Нидерланды", description: "Магистерская программа мирового уровня по водному менеджменту. Стипендии для кандидатов из ЦА.", status: "Набор открыт", actionLabel: "Подробнее" },
  { id: "f6", category: "Дипломатия", headline: "Ратификация соглашения УЗ-ТДЖ по Амударье", organization: "МИД Узбекистана и Таджикистана", date: "Май 2026", location: "Душанбе", description: "Подписан обновлённый двусторонний протокол по использованию водных ресурсов Амударьи.", status: "Завершено", actionLabel: "Подробнее" },
  { id: "f7", category: "Конкурс", headline: "ADB WaterXPrize — $500K за прорывные технологии", organization: "Asian Development Bank 🌏", date: "Дедлайн: 15 августа 2026", location: "Онлайн", description: "Крупнейший конкурс инноваций в водной отрасли ЦА. Призовой фонд полмиллиона долларов.", status: "Открыт", actionLabel: "Участвовать" },
  { id: "f8", category: "Грант", headline: 'Фонд "Ёшлар" — до 500M сум для молодёжных стартапов', organization: "Фонд Ёшлар 🇺🇿", date: "Дедлайн: 1 июля 2026", location: "Узбекистан", description: "Гранты для молодёжных команд до 35 лет в сфере водных технологий и экологии.", status: "Открыт", actionLabel: "Подать заявку" },
  { id: "f9", category: "НИОКР", headline: "IoT-мониторинг горных рек Кыргызстана — ищем партнёров", organization: "КРСУ 🇰🇬", date: "2025–2027", location: "Кыргызстан / дистанционно", description: "Проект по IoT-сетям мониторинга в горных реках ищет технологических партнёров и инвесторов.", status: "Ищет партнёров", actionLabel: "Подробнее" },
  { id: "f10", category: "Акселератор", headline: "UN-Water Youth Accelerator — $25K + менторство", organization: "ООН 🌐", date: "Дедлайн: 30 июня 2026", location: "Онлайн", description: "Акселератор ООН для молодых лидеров до 35 лет. Срок подачи заявок истекает!", status: "Скоро закрытие", actionLabel: "Участвовать" },
  { id: "f11", category: "Дипломатия", headline: "Программа ООН по Аральскому морю 2026–2031 запущена", organization: "ООН + правительства ЦА", date: "Январь 2026", location: "Центральная Азия", description: "Стартовала новая пятилетняя программа восстановления экосистемы Аральского моря с бюджетом $2.5 млрд.", status: "В процессе", actionLabel: "Подробнее" },
  { id: "f12", category: "Образование", headline: "Курс МВХ «Цифровое водное хозяйство» — старт набора", organization: "МВХ Республики Узбекистан 🇺🇿", date: "Онлайн, 3 месяца", location: "Онлайн", description: "Бесплатная профессиональная переподготовка для сотрудников МВХ: IoT, ГИС, SCADA, аналитика.", status: "Набор открыт", actionLabel: "Подробнее" },
];

// ─── Helper functions ─────────────────────────────────────────

function getDaysUntil(date: Date): number {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatDaysUntil(date: Date): string {
  const days = getDaysUntil(date);
  if (days < 0) return "Истёк";
  if (days === 0) return "Сегодня!";
  if (days === 1) return "Завтра!";
  if (days <= 7) return `${days} дней`;
  if (days <= 30) return `${days} дней`;
  return `${days} дней`;
}

// ─── Sub-components ──────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  Грант: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
  Хакатон: "bg-purple-500/20 text-purple-300 border border-purple-500/30",
  Конкурс: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
  Акселератор: "bg-green-500/20 text-green-300 border border-green-500/30",
  НИОКР: "bg-orange-500/20 text-orange-300 border border-orange-500/30",
  Образование: "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30",
  Дипломатия: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
  Премия: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
};

function CategoryBadge({ category }: { category: string }) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLORS[category] ?? "bg-white/10 text-white/60"}`}>
      {category}
    </span>
  );
}

function StatusPill({ status }: { status: string }) {
  const cfg: Record<string, { cls: string; label: string }> = {
    open: { cls: "bg-emerald-500/20 text-emerald-300", label: "Открыт" },
    closing_soon: { cls: "bg-orange-500/20 text-orange-300 animate-pulse", label: "Скоро закрытие" },
    closed: { cls: "bg-white/10 text-white/40", label: "Закрыт" },
    upcoming: { cls: "bg-blue-500/20 text-blue-300", label: "Скоро" },
    ongoing: { cls: "bg-cyan-500/20 text-cyan-300", label: "Идёт" },
    ended: { cls: "bg-white/10 text-white/40", label: "Завершён" },
    active: { cls: "bg-emerald-500/20 text-emerald-300", label: "Активное" },
    published: { cls: "bg-blue-500/20 text-blue-300", label: "Опубликовано" },
    seeking_partners: { cls: "bg-yellow-500/20 text-yellow-300", label: "Ищет партнёров" },
    completed: { cls: "bg-white/10 text-white/50", label: "Завершено" },
  };
  const s = cfg[status] ?? { cls: "bg-white/10 text-white/40", label: status };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${s.cls}`}>
      {s.label}
    </span>
  );
}

function CyanButton({ children, small }: { children: React.ReactNode; small?: boolean }) {
  return (
    <button
      className={`rounded-lg font-medium text-black transition-all hover:opacity-90 active:scale-95 ${small ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"}`}
      style={{ background: "linear-gradient(135deg, #00e6c8, #00b4ff)" }}
    >
      {children}
    </button>
  );
}

function GhostButton({ children, small }: { children: React.ReactNode; small?: boolean }) {
  return (
    <button
      className={`rounded-lg font-medium text-white/60 border border-white/10 hover:border-white/20 hover:text-white/80 transition-all active:scale-95 ${small ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"}`}
    >
      {children}
    </button>
  );
}

// ─── Tab 1: Feed ──────────────────────────────────────────────

function FeedTab() {
  const statusColors: Record<string, string> = {
    "Открыт": "text-emerald-400",
    "Открыта регистрация": "text-emerald-400",
    "Набор открыт": "text-emerald-400",
    "Скоро закрытие": "text-orange-400",
    "Ищет партнёров": "text-yellow-400",
    "В процессе": "text-cyan-400",
    "Завершено": "text-white/40",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {FEED_ITEMS.map((item) => (
        <div
          key={item.id}
          className="rounded-2xl border border-white/7 p-5 flex flex-col gap-3 hover:border-white/15 transition-colors"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CategoryBadge category={item.category} />
            {item.status && (
              <span className={`text-xs font-medium ${statusColors[item.status] ?? "text-white/50"}`}>
                {item.status}
              </span>
            )}
          </div>
          <h3 className="text-sm font-semibold text-white leading-snug">{item.headline}</h3>
          <div className="space-y-1">
            <p className="text-xs text-white/50 flex items-center gap-1">
              <span>🏢</span> {item.organization}
            </p>
            <p className="text-xs text-white/50 flex items-center gap-1">
              <span>📅</span> {item.date}
            </p>
            <p className="text-xs text-white/50 flex items-center gap-1">
              <span>📍</span> {item.location}
            </p>
          </div>
          <p className="text-xs text-white/60 leading-relaxed line-clamp-2">{item.description}</p>
          <div className="mt-auto pt-1">
            <CyanButton small>{item.actionLabel} →</CyanButton>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Tab 2: Grants ────────────────────────────────────────────

function GrantCard({ grant }: { grant: Grant }) {
  const days = getDaysUntil(grant.deadlineDate);
  const urgency = days <= 14 ? "text-orange-400" : days <= 30 ? "text-yellow-400" : "text-white/60";

  return (
    <div
      className="rounded-2xl border border-white/7 p-5 flex flex-col gap-4 hover:border-white/15 transition-colors"
      style={{ background: "rgba(255,255,255,0.04)" }}
    >
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-lg">{grant.donorFlag}</span>
            <span className="text-xs text-white/50">{grant.donor}</span>
          </div>
          <h3 className="text-sm font-semibold text-white">{grant.title}</h3>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-sm font-bold" style={{ color: "#00e6c8" }}>{grant.amount}</span>
          <StatusPill status={grant.status} />
        </div>
      </div>

      <p className="text-xs text-white/60 leading-relaxed">{grant.description}</p>

      <div className="flex flex-wrap gap-1">
        {grant.regions.map((r) => (
          <span key={r} className="text-xs bg-white/5 text-white/50 px-2 py-0.5 rounded-full border border-white/8">{r}</span>
        ))}
      </div>

      <div>
        <p className="text-xs font-medium text-white/40 mb-1.5 uppercase tracking-wide">Требования</p>
        <ul className="space-y-1">
          {grant.requirements.map((req, i) => (
            <li key={i} className="text-xs text-white/60 flex items-start gap-1.5">
              <span className="text-emerald-400 mt-0.5 flex-shrink-0">✓</span>
              {req}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-white/5">
        <div>
          <p className="text-xs text-white/40">Дедлайн: {grant.deadline}</p>
          {grant.status !== "closed" && (
            <p className={`text-xs font-medium ${urgency}`}>
              {days < 0 ? "Истёк" : `Осталось ${formatDaysUntil(grant.deadlineDate)}`}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <GhostButton small>+ В проект</GhostButton>
          <CyanButton small>Подать заявку →</CyanButton>
        </div>
      </div>
    </div>
  );
}

function GrantsTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {GRANTS.map((g) => <GrantCard key={g.id} grant={g} />)}
      </div>

      {/* AI Matching box */}
      <div
        className="rounded-2xl border p-5"
        style={{ background: "rgba(0,230,200,0.04)", borderColor: "rgba(0,230,200,0.2)" }}
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">🤖</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white mb-1">ИИ подобрал 3 гранта для ваших объектов</p>
            <p className="text-xs text-white/50 mb-3">На основе анализа ваших объектов водного хозяйства и текущих проектов</p>
            <div className="space-y-2">
              {[
                { grant: "ADB Water Security Grant", match: "98%", reason: "Ирригационный канал Буюк Фарғона соответствует всем критериям" },
                { grant: 'Фонд "Ёшлар"', match: "91%", reason: "Ваш стартап-профиль и возраст руководителя соответствуют" },
                { grant: "GEF Small Grants Programme", match: "87%", reason: "Экологические показатели объектов подходят под критерии GEF" },
              ].map((m) => (
                <div key={m.grant} className="flex items-center gap-3 bg-white/4 rounded-xl px-3 py-2">
                  <span className="text-xs font-bold text-emerald-400 w-10 flex-shrink-0">{m.match}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">{m.grant}</p>
                    <p className="text-xs text-white/40 truncate">{m.reason}</p>
                  </div>
                  <CyanButton small>Открыть</CyanButton>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tab 3: Competitions ──────────────────────────────────────

function CompetitionCard({ comp }: { comp: Competition }) {
  const typeColors: Record<string, string> = {
    hackathon: "bg-purple-500/20 text-purple-300 border border-purple-500/30",
    competition: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
    accelerator: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
    award: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
  };
  const typeLabels: Record<string, string> = {
    hackathon: "Хакатон",
    competition: "Конкурс",
    accelerator: "Акселератор",
    award: "Премия",
  };
  const formatLabels: Record<string, string> = {
    online: "🌐 Онлайн",
    offline: "📍 Очно",
    hybrid: "⚡ Гибрид",
  };

  const days = getDaysUntil(comp.deadlineDate);
  const urgency = days <= 14 ? "text-orange-400 animate-pulse" : days <= 30 ? "text-yellow-400" : "text-white/50";

  return (
    <div
      className="rounded-2xl border border-white/7 p-5 flex flex-col gap-3 hover:border-white/15 transition-colors"
      style={{ background: "rgba(255,255,255,0.04)" }}
    >
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeColors[comp.type]}`}>
            {typeLabels[comp.type]}
          </span>
          <span className="text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded-full">
            {formatLabels[comp.format]}
          </span>
        </div>
        <StatusPill status={comp.status} />
      </div>

      <div>
        <div className="flex items-center gap-2 mb-1">
          <span>{comp.hostFlag}</span>
          <span className="text-xs text-white/40">{comp.host}</span>
        </div>
        <h3 className="text-sm font-semibold text-white leading-snug">{comp.title}</h3>
      </div>

      <div className="space-y-1">
        <p className="text-xs text-white/50">📅 {comp.dates}</p>
        <p className="text-xs text-white/50">📍 {comp.location}</p>
        <p className="text-xs text-white/50">🎯 {comp.theme}</p>
        <p className="text-xs font-semibold" style={{ color: "#00e6c8" }}>🏆 {comp.prize}</p>
      </div>

      <p className="text-xs text-white/60 leading-relaxed">{comp.description}</p>

      <div className="flex flex-wrap gap-1">
        {comp.tracks.map((t) => (
          <span key={t} className="text-xs bg-white/5 text-white/50 px-2 py-0.5 rounded-full border border-white/8">{t}</span>
        ))}
      </div>

      <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-white/5">
        <div>
          <p className="text-xs text-white/40">Заявки до: {comp.deadline}</p>
          {comp.status !== "ended" && days >= 0 && (
            <p className={`text-xs font-medium ${urgency}`}>Осталось {formatDaysUntil(comp.deadlineDate)}</p>
          )}
        </div>
        <CyanButton small>Участвовать →</CyanButton>
      </div>
    </div>
  );
}

function CompetitionsTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {COMPETITIONS.map((c) => <CompetitionCard key={c.id} comp={c} />)}
    </div>
  );
}

// ─── Tab 4: Research ──────────────────────────────────────────

function ResearchCard({ item }: { item: Research }) {
  const seekingPartners = item.status === "seeking_partners";
  return (
    <div
      className={`rounded-2xl p-5 flex flex-col gap-3 transition-all ${
        seekingPartners
          ? "border border-emerald-400/30"
          : "border border-white/7 hover:border-white/15"
      }`}
      style={{
        background: seekingPartners ? "rgba(0,230,200,0.04)" : "rgba(255,255,255,0.04)",
        boxShadow: seekingPartners ? "0 0 20px rgba(0,230,200,0.06)" : undefined,
      }}
    >
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          <span className="text-xs bg-orange-500/20 text-orange-300 border border-orange-500/30 px-2 py-0.5 rounded-full">
            {item.field}
          </span>
          <StatusPill status={item.status} />
        </div>
        {seekingPartners && (
          <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            🤝 Ищет партнёров
          </span>
        )}
      </div>

      <div>
        <div className="flex items-center gap-2 mb-1">
          <span>{item.flag}</span>
          <span className="text-xs text-white/40">{item.institution} · {item.country}</span>
        </div>
        <h3 className="text-sm font-semibold text-white leading-snug">{item.title}</h3>
      </div>

      <div className="space-y-1">
        <p className="text-xs text-white/50">💰 {item.funding}</p>
        <p className="text-xs text-white/50">⏱ {item.duration}</p>
        {item.publicationYear && (
          <p className="text-xs text-white/50">📄 Опубликовано: {item.publicationYear}</p>
        )}
      </div>

      <p className="text-xs text-white/60 leading-relaxed line-clamp-3">{item.summary}</p>

      <div className="flex flex-wrap gap-1">
        {item.keywords.map((k) => (
          <span key={k} className="text-xs bg-white/5 text-white/40 px-2 py-0.5 rounded-full border border-white/8">#{k}</span>
        ))}
      </div>

      <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-white/5">
        <span className="text-xs text-white/30">{item.contactEmail}</span>
        <CyanButton small>
          {item.status === "seeking_partners" ? "Связаться →" : "Читать →"}
        </CyanButton>
      </div>
    </div>
  );
}

function RDTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {RESEARCH.map((r) => <ResearchCard key={r.id} item={r} />)}
    </div>
  );
}

// ─── Tab 5: Education ─────────────────────────────────────────

function EducationCard({ item }: { item: Education }) {
  const formatLabels: Record<string, string> = {
    online: "🌐 Онлайн",
    offline: "📍 Очно",
    hybrid: "⚡ Гибрид",
  };
  const levelColors: Record<string, string> = {
    "Магистратура": "bg-purple-500/20 text-purple-300 border border-purple-500/30",
    "Бакалавриат": "bg-blue-500/20 text-blue-300 border border-blue-500/30",
    "Сертификат": "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30",
    "Повышение квалификации": "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
    "Профессиональная переподготовка": "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
    "Профессиональное развитие": "bg-orange-500/20 text-orange-300 border border-orange-500/30",
  };

  return (
    <div
      className="rounded-2xl border border-white/7 p-5 flex flex-col gap-3 hover:border-white/15 transition-colors"
      style={{ background: "rgba(255,255,255,0.04)" }}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${levelColors[item.level] ?? "bg-white/10 text-white/50"}`}>
          {item.level}
        </span>
        <span className="text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded-full">{formatLabels[item.format]}</span>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-1">
          <span>{item.flag}</span>
          <span className="text-xs text-white/40">{item.institution}</span>
        </div>
        <h3 className="text-sm font-semibold text-white leading-snug">{item.title}</h3>
      </div>

      <p className="text-xs text-white/60 leading-relaxed">{item.description}</p>

      <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-white/5">
        <div>
          <p className="text-xs text-white/50">⏱ {item.duration}</p>
          <p className="text-xs font-medium" style={{ color: "#00e6c8" }}>💰 {item.cost}</p>
        </div>
        <CyanButton small>Подробнее →</CyanButton>
      </div>
    </div>
  );
}

function EducationTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {EDUCATION.map((e) => <EducationCard key={e.id} item={e} />)}
    </div>
  );
}

// ─── Tab 6: Diplomacy ─────────────────────────────────────────

function DiplomacyCard({ item, index }: { item: Diplomacy; index: number }) {
  const typeLabels: Record<string, string> = {
    meeting: "Совещание",
    agreement: "Соглашение",
    negotiation: "Переговоры",
    session: "Сессия",
    program: "Программа",
  };
  const typeColors: Record<string, string> = {
    meeting: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
    agreement: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
    negotiation: "bg-orange-500/20 text-orange-300 border border-orange-500/30",
    session: "bg-purple-500/20 text-purple-300 border border-purple-500/30",
    program: "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30",
  };
  const statusColors: Record<string, string> = {
    completed: "bg-white/10 text-white/40",
    upcoming: "bg-blue-500/20 text-blue-300",
    ongoing: "bg-emerald-500/20 text-emerald-300",
  };
  const statusLabels: Record<string, string> = {
    completed: "Завершено",
    upcoming: "Предстоит",
    ongoing: "В процессе",
  };

  return (
    <div className="flex gap-4">
      {/* Timeline line */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-black flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #00e6c8, #00b4ff)" }}
        >
          {index + 1}
        </div>
        {index < DIPLOMACY.length - 1 && (
          <div className="w-px flex-1 mt-2" style={{ background: "rgba(0,230,200,0.15)" }} />
        )}
      </div>

      {/* Card */}
      <div
        className="rounded-2xl border border-white/7 p-5 flex flex-col gap-3 flex-1 mb-4 hover:border-white/15 transition-colors"
        style={{ background: "rgba(255,255,255,0.04)" }}
      >
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeColors[item.type]}`}>
              {typeLabels[item.type]}
            </span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[item.status]}`}>
              {statusLabels[item.status]}
            </span>
          </div>
          <div className="flex gap-1">
            {item.countries.map((c, i) => (
              <span key={i} className="text-base">{c}</span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white leading-snug mb-1">{item.title}</h3>
          <p className="text-xs text-white/40">{item.organization}</p>
        </div>

        <div className="flex gap-4 flex-wrap">
          <p className="text-xs text-white/50">📅 {item.date}</p>
          <p className="text-xs text-white/50">📍 {item.location}</p>
        </div>

        <p className="text-xs text-white/60 leading-relaxed">{item.description}</p>

        <div className="pt-1">
          <GhostButton small>Подробнее</GhostButton>
        </div>
      </div>
    </div>
  );
}

function DiplomacyTab() {
  return (
    <div className="max-w-3xl">
      {DIPLOMACY.map((d, i) => (
        <DiplomacyCard key={d.id} item={d} index={i} />
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────

const TABS = [
  { id: "feed", label: "📰 Все события" },
  { id: "grants", label: "🚀 Стартапы и гранты" },
  { id: "competitions", label: "🏆 Конкурсы и хакатоны" },
  { id: "rd", label: "🔬 R&D и НИОКР" },
  { id: "education", label: "🎓 Образование" },
  { id: "diplomacy", label: "🌐 Дипломатия" },
];

const STATS = [
  { value: "23", label: "открытых гранта" },
  { value: "8", label: "конкурсов" },
  { value: "42", label: "исследования" },
  { value: "18", label: "образовательных программ" },
];

export default function EcosystemPage() {
  const [activeTab, setActiveTab] = useState("feed");

  const activeContent = useMemo(() => {
    switch (activeTab) {
      case "feed": return <FeedTab />;
      case "grants": return <GrantsTab />;
      case "competitions": return <CompetitionsTab />;
      case "rd": return <RDTab />;
      case "education": return <EducationTab />;
      case "diplomacy": return <DiplomacyTab />;
      default: return null;
    }
  }, [activeTab]);

  return (
    <div
      className="min-h-screen text-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            🌱 Экосистема инноваций
          </h1>
          <p className="text-sm text-white/50 tracking-wide">
            Стартапы · Гранты · Хакатоны · R&amp;D · Образование · Дипломатия
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-white/7 p-4 text-center"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              <p className="text-2xl font-bold" style={{ color: "#00e6c8" }}>{s.value}</p>
              <p className="text-xs text-white/50 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="overflow-x-auto -mx-4 px-4">
          <div className="flex gap-1 min-w-max">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "text-black"
                    : "text-white/50 hover:text-white/80 hover:bg-white/5"
                }`}
                style={
                  activeTab === tab.id
                    ? { background: "linear-gradient(135deg, #00e6c8, #00b4ff)" }
                    : {}
                }
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div>{activeContent}</div>
      </div>
    </div>
  );
}
