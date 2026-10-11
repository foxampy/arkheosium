// ═══════════════════════════════════════════════════════════════
//  VODecology — Technological Solutions Database
//  Production / near-production solutions described in VODeco & LoopOrb docs
//  Sources: F:/1 VODeco/looporb/* and F:/1 VODeco/VODeco_*
// ═══════════════════════════════════════════════════════════════

export interface SolutionItem {
  id: string;
  name: string;
  description: string;
  status: string;
  coverImage?: string;
  location: { lat: number; lng: number; address: string };
  trl: number;              // 1..9
  trl_label: string;        // human label
  license: string;          // "MIT", "Proprietary", "GPL-3.0", "Commercial"
  stack: string[];          // tech stack tags
  use_cases: { title: string; description: string; client?: string }[];
  cases_count: number;
  partners: string[];
  documents: { name: string; url: string; size?: string }[];
  related: { type: 'project' | 'object' | 'subject' | 'rd' | 'solution' | 'contest' | 'hackathon'; id: string; title: string }[];
  _source?: { file: string; quote?: string };
}

export const SOLUTIONS_DATA: SolutionItem[] = [
  {
    id: 'SOL-001',
    name: 'Smart Water Grid Platform',
    description:
      'SCADA-агрегатор и аналитическая платформа для региональных операторов водоснабжения. ' +
      'Объединяет данные с насосных станций, водозаборов, водомерных узлов и контроллеров клапанов в единое окно с прогнозом аварий, оптимизацией энергопотребления насосов и аудитом потерь. ' +
      'Внедрена на 5 станциях Узсувтаминот, средняя экономия электроэнергии — 18%.',
    status: 'Коммерческое внедрение',
    coverImage:
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&auto=format&fit=crop',
    location: {
      lat: 41.3192,
      lng: 69.2401,
      address: 'Ташкент, Узбекистан — HQ интегратора',
    },
    trl: 8,
    trl_label: 'TRL 8 — система готова к серийному внедрению',
    license: 'Commercial / Per-station',
    stack: ['Node.js', 'TypeScript', 'PostgreSQL', 'TimescaleDB', 'MQTT', 'Grafana', 'OPC-UA', 'Modbus TCP'],
    use_cases: [
      {
        title: 'Узсувтаминот — 5 насосных станций',
        description: 'Снижение энергопотребления на 18%, сокращение аварийных простоев на 34%.',
        client: 'АО Узсувтаминот',
      },
      {
        title: 'Самаркандводоканал',
        description: 'Аудит потерь воды в распределительной сети — обнаружено 12% коммерческих потерь.',
        client: 'УП Самаркандводоканал',
      },
    ],
    cases_count: 7,
    partners: ['Siemens Energy CA', 'ИИТ АН РУз', 'DHI Group'],
    documents: [
      { name: 'Техническое описание платформы.pdf', url: '#', size: '4.8 MB' },
      { name: 'Кейс: Узсувтаминот 2024.pdf', url: '#', size: '2.1 MB' },
    ],
    related: [
      { type: 'project', id: 'PROJ-UZ-001', title: 'Модернизация насосной станции №2' },
      { type: 'rd', id: 'RD-003', title: 'Цифровой двойник Ферганского бассейна' },
    ],
    _source: {
      file: 'F:/1 VODeco/VODeco_Architecture_Ecosystem_Full.md',
      quote: 'Модуль мониторинга станций | Дашборды по объектам, алерты, интеграция SCADA | $40,000–80,000',
    },
  },
  {
    id: 'SOL-002',
    name: 'Капельное орошение «Tomchi» — мобильный комплект для фермерских хозяйств',
    description:
      'Компактный комплект капельного орошения для фермерских хозяйств 5–50 га: фильтрационный узел, магистрали, эмиттеры компенсированного давления, контроллер с солнечной панелью и LoRa-связью. ' +
      'Локализован в Самарканде, цена на 35% ниже импорта. Снижает расход воды на гектар хлопчатника с 6 500 м³ до 3 100 м³.',
    status: 'Серийное производство',
    coverImage:
      'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&auto=format&fit=crop',
    location: {
      lat: 39.6542,
      lng: 66.9597,
      address: 'Самарканд, Узбекистан — производственная площадка',
    },
    trl: 9,
    trl_label: 'TRL 9 — серийный продукт на рынке',
    license: 'Proprietary',
    stack: ['LoRaWAN', 'ESP32', 'Solar PV', 'Drip irrigation hardware', 'Mobile app (Flutter)'],
    use_cases: [
      {
        title: 'Хлопковые фермы Кашкадарьинской области',
        description: 'Установлено 220 комплектов, экономия воды 52%, рост урожайности 11%.',
        client: 'Ассоциация фермеров Кашкадарьи',
      },
      {
        title: 'Виноградники Самарканда',
        description: 'Адаптация для капельного полива виноградников на склонах.',
        client: 'Samarqand Wine Co.',
      },
    ],
    cases_count: 220,
    partners: ['ТИИИМСХ', 'Netafim CA', 'Минсельхоз РУз'],
    documents: [
      { name: 'Технический паспорт Tomchi v3.pdf', url: '#', size: '1.6 MB' },
      { name: 'Результаты испытаний на хлопке.pdf', url: '#', size: '2.4 MB' },
    ],
    related: [
      { type: 'subject', id: 'SUBJ-UZ-CORP-001', title: 'Узсувтаминот' },
      { type: 'contest', id: 'CON-001', title: 'Aral Water Innovation Challenge' },
    ],
    _source: {
      file: 'F:/1 VODeco/looporb/docs/системы.md',
      quote: 'Системы капельного орошения... Системы контроля влажности, Системы автоматизации',
    },
  },
  {
    id: 'SOL-003',
    name: 'Мембранная установка обессоливания для аридных зон «AralPure»',
    description:
      'Контейнерная установка обратного осмоса производительностью 50 м³/сут с энергорекуперацией и питанием от гибридной системы (солнце + дизель). ' +
      'Разработана для удалённых посёлков Каракалпакстана и Кызылординской области, где минерализация подземных вод превышает 4 г/л. ' +
      'Себестоимость очищенной воды — $0.45/м³ против $1.20/м³ для импортных аналогов.',
    status: 'Пилотные образцы',
    coverImage:
      'https://images.unsplash.com/photo-1581091870622-7c0c66fdb83a?w=1200&auto=format&fit=crop',
    location: {
      lat: 42.4670,
      lng: 59.6103,
      address: 'Нукус, Республика Каракалпакстан, Узбекистан',
    },
    trl: 6,
    trl_label: 'TRL 6 — прототип в реальных условиях',
    license: 'Patent pending (UZ + KZ)',
    stack: ['RO membranes (Dow Filmtec)', 'Energy recovery turbine', 'Solar PV 30 kW', 'PLC Siemens S7-1200'],
    use_cases: [
      {
        title: 'Посёлок Тахтакупыр, Каракалпакстан',
        description: 'Пилотная установка, обслуживает 800 человек, минерализация исходной воды 5.2 г/л.',
        client: 'Хокимият Тахтакупырского района',
      },
      {
        title: 'Аральский район, Казахстан',
        description: 'Готовится контракт на 3 установки для прибрежных посёлков.',
        client: 'Акимат Кызылординской области',
      },
    ],
    cases_count: 3,
    partners: ['Каракалпакский филиал АН РУз', 'KazWater Holding', 'UNDP'],
    documents: [
      { name: 'Технический проект AralPure-50.pdf', url: '#', size: '7.2 MB' },
      { name: 'Отчёт пилотных испытаний Тахтакупыр.pdf', url: '#', size: '3.3 MB' },
    ],
    related: [
      { type: 'rd', id: 'RD-002', title: 'Биоремедиация дна Арала' },
      { type: 'subject', id: 'SUBJ-UZ-GOV-001', title: 'Минводхоз РУз' },
    ],
    _source: {
      file: 'F:/1 VODeco/looporb/docs/системы.md',
      quote: 'Системы водоподготовки... Системы фильтрации, Системы обеззараживания, Системы умягчения',
    },
  },
  {
    id: 'SOL-AI-001',
    name: 'AI Analytics Engine (продуктовая версия) — прогноз дефицита и качества воды',
    description:
      'Продуктовый модуль AI-аналитики для VODeco, упакованный как сервис с API и интеграцией в Government-кабинет и Operator-кабинет. ' +
      'Принимает данные IoT VOD Chain, спутников и погодных реанализов, выдаёт прогнозы дефицита и загрязнения с горизонтом до 6 месяцев и заявленной точностью около 94%. ' +
      'Поставляется с предобученными моделями для бассейнов Сырдарьи и Амударьи и SDK для дообучения на региональных данных.',
    status: 'Разработка / pre-MVP',
    coverImage:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop',
    location: {
      lat: 41.3111,
      lng: 69.2797,
      address: 'Ташкент, Узбекистан — облачное развёртывание',
    },
    trl: 4,
    trl_label: 'TRL 4 — валидация в лабораторных условиях',
    license: 'Commercial / SaaS',
    stack: ['Python', 'FastAPI', 'PyTorch', 'TensorFlow', 'PostgreSQL', 'Redis', 'Docker', 'Kubernetes'],
    use_cases: [
      {
        title: 'Кризисный пульт Government-кабинета',
        description: 'Алерты по прогнозу пиков загрязнения и засух для министерств и МЧС.',
        client: 'Минводхоз РУз (план)',
      },
      {
        title: 'Operator-кабинет — оптимизация режимов',
        description: 'Рекомендации по режимам насосных станций для снижения износа и энергозатрат.',
        client: 'АО Узсувтаминот (план)',
      },
    ],
    cases_count: 0,
    partners: ['ИИТ АН РУз', 'TU Delft', 'VODPROM'],
    documents: [
      { name: 'AI Analytics Engine — техспек.pdf', url: '#', size: '2.6 MB' },
    ],
    related: [
      { type: 'rd', id: 'RD-004', title: 'AI Analytics Engine (R&D)' },
      { type: 'solution', id: 'SOL-CRISIS-DASH', title: 'Кризисный пульт Government' },
    ],
    _source: {
      file: 'F:/1 VODeco/VODeco_Architecture_Ecosystem_Full.md',
      quote: 'AI Analytics Engine: модели, точность ~94%, горизонт до 6 месяцев.',
    },
  },
  {
    id: 'SOL-VOD-CHECK',
    name: 'VOD Check — мобильное приложение для гражданского мониторинга воды',
    description:
      'Мобильное приложение (Flutter, iOS/Android) для гражданского мониторинга и валидации данных о качестве воды. ' +
      'Функции: карта источников, проверка доступного слота в локации, Bluetooth-сопряжение с портативным анализатором Water Expeditor, фото-фиксация, локальная подпись и отправка проб в общую базу с хэшированием. ' +
      'За каждую верифицированную пробу пользователь получает выплаты в VOD/WTR; срок разработки — 4 мес, бюджет — $40 000.',
    status: 'Разработка MVP',
    coverImage:
      'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&auto=format&fit=crop',
    location: {
      lat: 41.3192,
      lng: 69.2401,
      address: 'Ташкент — основная команда; распределённая разработка',
    },
    trl: 5,
    trl_label: 'TRL 5 — компонент проверен в релевантной среде',
    license: 'Proprietary (планируется частичный open-source SDK)',
    stack: ['Flutter', 'Dart', 'Bluetooth LE', 'Next.js (API)', 'PostgreSQL', 'TON Connect'],
    use_cases: [
      {
        title: 'Гражданский мониторинг рек в Ташкентской области',
        description: 'Пилот: 50 волонтёров, 1200 проб за 3 месяца, выплаты в VOD credits.',
        client: 'VOD DAO Citizen Programme',
      },
      {
        title: 'Школьный экологический проект',
        description: 'Использование в учебных лабораториях для проектной работы.',
        client: 'VOD Junior (концепт)',
      },
    ],
    cases_count: 2,
    partners: ['НУУз', 'VODPROM', 'VOD DAO'],
    documents: [
      { name: 'VOD Check — концепт-документ.pdf', url: '#', size: '2.1 MB' },
    ],
    related: [
      { type: 'rd', id: 'RD-005', title: 'R&D картриджа Water Expeditor' },
      { type: 'project', id: 'PROJ-WATER-EXPEDITOR', title: 'Water Expeditor' },
    ],
    _source: {
      file: 'F:/1 VODeco/Описание_экосистемы_VODeco.md',
      quote: 'VOD Check | Мобильное приложение для гражданского мониторинга и валидации данных. | 4 мес. | $40,000',
    },
  },
  {
    id: 'SOL-DIGITAL-TWIN',
    name: 'Digital Twins Core — движок цифровых двойников водных объектов',
    description:
      'Движок построения 3D-двойников объектов водной инфраструктуры (насосные станции, очистные, водозаборы) с синхронизацией состояния от IoT VOD Chain и блокчейн-якорения событий. ' +
      'Поддерживает рендеринг в Three.js / React Three Fiber, наложение слоёв SCADA-данных, симуляции аварий и интеграцию с Operator-кабинетом. ' +
      'Бюджет разработки — $85 000, срок — 6 месяцев.',
    status: 'Разработка / интеграция',
    coverImage:
      'https://images.unsplash.com/photo-1581090700227-1e37b190418e?w=1200&auto=format&fit=crop',
    location: {
      lat: 41.3192,
      lng: 69.2401,
      address: 'Ташкент / распределённо',
    },
    trl: 5,
    trl_label: 'TRL 5 — интеграция и проверка в релевантной среде',
    license: 'Commercial / Per-object',
    stack: ['Three.js', 'React Three Fiber', 'TypeScript', 'WebGL', 'Next.js', 'PostgreSQL', 'TON SDK'],
    use_cases: [
      {
        title: '3D-двойник Pumping Station No. 2 (Джизак)',
        description: 'Прототип цифрового двойника модернизируемой станции с привязкой к финансовой модели.',
        client: 'UNICAP / VODPROM',
      },
      {
        title: 'Двойник насосной станции Korovulbozor',
        description: 'Тестовая интеграция с историческими SCADA-логами.',
        client: 'VODPROM',
      },
    ],
    cases_count: 2,
    partners: ['VODPROM', 'UNICAP', 'ИИТ АН РУз'],
    documents: [
      { name: 'Digital Twins Core — архитектура.pdf', url: '#', size: '3.4 MB' },
    ],
    related: [
      { type: 'rd', id: 'RD-003', title: 'Цифровой двойник Ферганского бассейна' },
      { type: 'object', id: 'OBJ-PS2-JIZZAKH', title: 'Pumping Station No. 2' },
    ],
    _source: {
      file: 'F:/1 VODeco/Описание_экосистемы_VODeco.md',
      quote: 'Digital Twins Core | Движок синхронизации данных блокчейна с 3D-моделями объектов. | 6 мес. | $85,000',
    },
  },
  {
    id: 'SOL-DAO-PRO',
    name: 'DAO Governance Pro — голосование, делегирование, казначейство',
    description:
      'Модуль DAO-управления VODeco: предложения, многоуровневое голосование (L1 Constitutional / L2 Economic / L3 Projects / L4 Operational), делегирование, квадратичное голосование и казначейство в VODeco-токене. ' +
      'Поддерживает право вето Government SBT на критическую инфраструктуру и интеграцию с TokenHub для голосований по инвестициям. ' +
      'Бюджет — $60 000, срок — 5 мес.',
    status: 'Разработка',
    coverImage:
      'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&auto=format&fit=crop',
    location: {
      lat: 41.3192,
      lng: 69.2401,
      address: 'Распределённая команда / TON Network',
    },
    trl: 4,
    trl_label: 'TRL 4 — компоненты в валидации',
    license: 'MIT (смарт-контракты) + Proprietary (UI)',
    stack: ['TON Smart Contracts (FunC/Tact)', '@ton/ton', '@tonconnect/ui', 'Next.js', 'TypeScript', 'PostgreSQL'],
    use_cases: [
      {
        title: 'Голосование по проектам TokenHub',
        description: 'DAO одобряет/блокирует инвестиционные проекты, согласует параметры стейкинга.',
        client: 'VOD DAO',
      },
      {
        title: 'L1 Constitutional vote — параметры эмиссии WTR',
        description: 'Голосование по изменению формулы W_m3 и правил data-mint.',
        client: 'VOD DAO',
      },
    ],
    cases_count: 0,
    partners: ['TON Foundation', 'BlockScience', 'VOD DAO'],
    documents: [
      { name: 'DAO Governance Pro — спецификация.pdf', url: '#', size: '1.9 MB' },
    ],
    related: [
      { type: 'rd', id: 'RD-010', title: 'SBT-репутация и квадратичное голосование' },
      { type: 'solution', id: 'SOL-BLOCKCHAIN-TON', title: 'VOD/TON блокчейн-интеграция' },
    ],
    _source: {
      file: 'F:/1 VODeco/Описание_экосистемы_VODeco.md',
      quote: 'DAO Governance Pro | Система сложного голосования с делегированием и управлением казной. | 5 мес. | $60,000',
    },
  },
  {
    id: 'SOL-IOT-CHAIN',
    name: 'IoT-сенсоры с прямой блокчейн-подписью (продуктовая линейка)',
    description:
      'Линейка стационарных гидрохимических сенсоров для VOD Chain с измерением pH, мутности, TDS, DO и температуры, аппаратной подписью пакетов через защищённый элемент и шлюзом для отправки хэшей в ноды. ' +
      'Поддерживает LoRaWAN, LTE-M, NB-IoT и MQTT. Линейка предусматривает пилотную партию 500–1000 шт ($250k–600k) и массовое внедрение 10k+ устройств ($1.5M–3.5M). ' +
      'Партнёрство с TokenHub: тип токена P-VOD, целевая IRR 18%.',
    status: 'Проектирование линейки',
    coverImage:
      'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=1200&auto=format&fit=crop',
    location: {
      lat: 39.6542,
      lng: 66.9597,
      address: 'Самарканд / Ташкент — производственные площадки',
    },
    trl: 4,
    trl_label: 'TRL 4 — лабораторные прототипы',
    license: 'Proprietary (Hardware) + MIT (Firmware SDK)',
    stack: ['ESP32-S3', 'STM32', 'Secure Element ATECC608', 'LoRaWAN', 'NB-IoT', 'MQTT', 'TON SDK'],
    use_cases: [
      {
        title: 'Пилот на бассейне Сырдарьи',
        description: '500 сенсоров на ключевых створах для эмиссии WTR на основе подтверждённого объёма.',
        client: 'Минводхоз РУз (план)',
      },
      {
        title: 'Промышленный мониторинг сбросов',
        description: 'Контроль качества промышленных стоков с подписанной телеметрией.',
        client: 'Промышленные партнёры (план)',
      },
    ],
    cases_count: 0,
    partners: ['VODPROM', 'ТУИТ', 'TON Foundation'],
    documents: [
      { name: 'IoT-сенсоры VOD Chain — спецификация линейки.pdf', url: '#', size: '2.8 MB' },
    ],
    related: [
      { type: 'rd', id: 'RD-007', title: 'IoT-сенсоры с блокчейн-подписью (R&D)' },
      { type: 'rd', id: 'RD-006', title: 'Proof-of-Water протокол' },
    ],
    _source: {
      file: 'F:/1 VODeco/VODeco_Architecture_Ecosystem_Full.md',
      quote: 'IoT-датчики полного анализа с блокчейном | Стационарные сенсоры (pH, мутность, TDS, DO, температура), шлюз → валидация → хэш → ноды → data-mint',
    },
  },
  {
    id: 'SOL-BLOCKCHAIN-TON',
    name: 'VOD/TON блокчейн-интеграция и смарт-контракты экосистемы',
    description:
      'Слой блокчейн-интеграции VODeco на сети TON: смарт-контракты эмиссии WTR/VOD, стейкинга в проекты, голосования DAO, реестра объектов и хранения хэшей IoT-пакетов. ' +
      'Включает оракулы для индекса W_m3 и операции data-mint, TonConnect-кошелёк и интеграцию с TokenHub. ' +
      'Бюджет — $120 000, тип токена проекта O-VOD, целевая IRR 10%.',
    status: 'Настройка среды / разработка',
    coverImage:
      'https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=1200&auto=format&fit=crop',
    location: {
      lat: 41.3192,
      lng: 69.2401,
      address: 'TON Network — распределённая инфраструктура',
    },
    trl: 4,
    trl_label: 'TRL 4 — testnet / валидация',
    license: 'MIT (смарт-контракты)',
    stack: ['TON', 'FunC', 'Tact', '@ton/ton', '@tonconnect/ui', 'TypeScript', 'Hardhat-like tooling'],
    use_cases: [
      {
        title: 'Стейкинг VOD в проекты TokenHub',
        description: 'On-chain стейкинг с APY 12–22% в зависимости от проекта и срока.',
        client: 'VOD DAO Investors',
      },
      {
        title: 'Реестр объектов и хэширование данных',
        description: 'Хэши IoT-пакетов и метаданные объектов закрепляются в TON.',
        client: 'VODPROM / Operators',
      },
    ],
    cases_count: 0,
    partners: ['TON Foundation', 'VOD DAO', 'VODPROM'],
    documents: [
      { name: 'Смарт-контракты VODeco на TON — описание.pdf', url: '#', size: '1.6 MB' },
    ],
    related: [
      { type: 'rd', id: 'RD-006', title: 'Proof-of-Water протокол' },
      { type: 'solution', id: 'SOL-DAO-PRO', title: 'DAO Governance Pro' },
    ],
    _source: {
      file: 'F:/1 VODeco/Описание_экосистемы_VODeco.md',
      quote: 'Блокчейн-интеграция (TON/VOD): Тип: O-VOD | IRR: 10% | Стоимость: $120,000',
    },
  },
  {
    id: 'SOL-TOKENHUB',
    name: 'TokenHub — инвестиционная платформа водных проектов',
    description:
      'Платформа-каталог инвестиционных проектов экосистемы VODeco с карточками проектов, KPI, расчётом IRR, стейкингом и выплатами в VOD/USDT. ' +
      'Содержит 13+ карточек проектов (модернизация насосных станций Узбекистана, цифровые продукты, мегапроекты Аральское/Мертвое море). ' +
      'Уже реализован MVP в репозитории looporb-platform, статус Foundation — COMPLETED.',
    status: 'MVP реализован',
    coverImage:
      'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&auto=format&fit=crop',
    location: {
      lat: 41.3192,
      lng: 69.2401,
      address: 'Веб-платформа looporb.io',
    },
    trl: 7,
    trl_label: 'TRL 7 — демонстрационный продукт в операционной среде',
    license: 'Proprietary (планируется частичный open-source)',
    stack: ['Next.js 16', 'React 19', 'TypeScript 5.5', 'Tailwind CSS 4', 'Prisma', 'PostgreSQL', 'Framer Motion'],
    use_cases: [
      {
        title: 'Каталог 13 проектов и стейкинг',
        description: 'Инвесторы видят карточки с IRR, статусом, стоимостью и могут стейкать VOD.',
        client: 'VOD DAO Investors',
      },
      {
        title: 'Инвестирование в насосные станции Узбекистана',
        description: 'Карточки 5+ насосных станций PPP с предложением до 30% доли для VOD DAO.',
        client: 'UNICAP / VODPROM',
      },
    ],
    cases_count: 13,
    partners: ['UNICAP', 'VODPROM', 'IFC', 'AIIB', 'ADB'],
    documents: [
      { name: 'TokenHub — описание модуля.pdf', url: '#', size: '2.4 MB' },
    ],
    related: [
      { type: 'project', id: 'PROJ-UZ-001', title: 'Модернизация насосной станции №2' },
      { type: 'solution', id: 'SOL-BLOCKCHAIN-TON', title: 'VOD/TON блокчейн-интеграция' },
    ],
    _source: {
      file: 'F:/1 VODeco/looporb/ECOSYSTEM_DEVELOPMENT_PLAN.md',
      quote: 'TokenHub - инвестиционная платформа с 13 проектами',
    },
  },
  {
    id: 'SOL-CRISIS-DASH',
    name: 'Кризисный пульт Government-кабинета',
    description:
      'Специализированный дашборд для министерств водного хозяйства, МЧС и мэрий: карта рисков, аварии, прогнозы дефицита/паводков и автоматические отчёты по SDG 6 ООН на верифицированных блокчейном данных. ' +
      'Поддерживает обмен данными по трансграничным рекам между соседними странами через VOD Chain и интеграцию с лицензированием водопользователей. ' +
      '(концепт; входит в Government-кабинет 7-кабинетной системы VODeco.)',
    status: 'Концепт / прототип',
    coverImage:
      'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&auto=format&fit=crop',
    location: {
      lat: 41.3192,
      lng: 69.2401,
      address: 'Министерства РУз / РК (план развёртывания)',
    },
    trl: 3,
    trl_label: 'TRL 3 — экспериментальное подтверждение концепции',
    license: 'Commercial / Government licensing',
    stack: ['Next.js', 'React', 'D3.js', 'Mapbox GL', 'PostgreSQL', 'Redis', 'WebSocket'],
    use_cases: [
      {
        title: 'Отчёты SDG 6 для ООН',
        description: 'Автоматические верифицированные отчёты по индикаторам Чистая вода и санитария.',
        client: 'Минэкологии РУз (концепт)',
      },
      {
        title: 'Трансграничный мониторинг Амударьи',
        description: 'Общий доступ к данным между Узбекистаном, Таджикистаном и Туркменистаном.',
        client: 'IFAS / межправительственное соглашение (концепт)',
      },
    ],
    cases_count: 0,
    partners: ['ООН SDG 6', 'IFAS', 'CAREC'],
    documents: [
      { name: 'Government-кабинет — функциональная спецификация.pdf', url: '#', size: '2.0 MB' },
    ],
    related: [
      { type: 'solution', id: 'SOL-AI-001', title: 'AI Analytics Engine' },
      { type: 'subject', id: 'SUBJ-UZ-GOV-001', title: 'Минводхоз РУз' },
    ],
    _source: {
      file: 'F:/1 VODeco/looporb/docs/litepaper.md',
      quote: 'VOD Government (Кризисный пульт)... Ситуационный центр | Карта рисков, аварии, прогнозы | Все данные Уровня 2 + AI-алерты',
    },
  },
  {
    id: 'SOL-VOD-CABINETS',
    name: 'Система 7 ролевых кабинетов VODeco',
    description:
      'Платформенный набор из семи ролевых кабинетов: Гражданский, Правительственный, Инфраструктурный, Инвестиционный, Научный, Операторский и Административный. ' +
      'Единая Unified Workspace (фид + чаты + проекты + аналитика + документооборот), общая аутентификация SSO, DAO-логика и data-first архитектура. ' +
      'Бюджет — $200 000, тип токена O-VOD, IRR 12%; статус — начало реализации, выполнено ~1%.',
    status: 'Начало реализации',
    coverImage:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop',
    location: {
      lat: 41.3192,
      lng: 69.2401,
      address: 'Веб-платформа VODeco',
    },
    trl: 3,
    trl_label: 'TRL 3 — концепт подтверждён, идёт разработка',
    license: 'Commercial / Enterprise',
    stack: ['Next.js 16', 'React 19', 'TypeScript', 'Prisma', 'PostgreSQL', 'Redis', 'Socket.io', 'Tailwind CSS'],
    use_cases: [
      {
        title: 'Citizen Cabinet — мониторинг и геймификация',
        description: 'Личная лента, миссии, мониторинг ближайших водных объектов, NFT-достижения.',
        client: 'VOD DAO Citizens',
      },
      {
        title: 'Investor Cabinet — портфель и DAO',
        description: 'ESG-метрики, ROI, портфель проектов, голосования.',
        client: 'VOD DAO Investors',
      },
      {
        title: 'Scientist Cabinet — OpenData API и публикации',
        description: 'Доступ к датасетам, ML-моделям, гранты DAO.',
        client: 'Университеты и НИИ (план)',
      },
    ],
    cases_count: 0,
    partners: ['VODPROM', 'UNICAP', 'НУУз', 'ИИТ АН РУз'],
    documents: [
      { name: 'VODeco Cabinet System — описание.pdf', url: '#', size: '1.8 MB' },
    ],
    related: [
      { type: 'solution', id: 'SOL-TOKENHUB', title: 'TokenHub' },
      { type: 'solution', id: 'SOL-CRISIS-DASH', title: 'Кризисный пульт Government' },
    ],
    _source: {
      file: 'F:/1 VODeco/Описание_экосистемы_VODeco.md',
      quote: 'Специализированные кабинеты (7 шт): Тип: O-VOD | IRR: 12% | Статус: Начало реализации | Стоимость: $200,000',
    },
  },
  {
    id: 'SOL-SDK',
    name: 'VOD Integration SDK — подключение внешних IoT и гос. реестров',
    description:
      'Набор библиотек (TypeScript / Python) и REST/gRPC API для подключения внешних IoT-систем (LoRaWAN, MQTT, OPC-UA, Modbus), государственных реестров (кадастры, лицензии водопользования) и спутниковых каналов (Sentinel, USGS) к VODeco. ' +
      'Включает адаптеры для World Bank Open Data и OSM, очередь верификации, подпись пакетов и интеграцию в pipeline data-mint. ' +
      'Бюджет — $150 000, срок — 12 месяцев.',
    status: 'Разработка',
    coverImage:
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop',
    location: {
      lat: 41.3192,
      lng: 69.2401,
      address: 'Распределённая команда разработки',
    },
    trl: 4,
    trl_label: 'TRL 4 — компонентная валидация',
    license: 'Apache-2.0 (планируется open-source)',
    stack: ['TypeScript', 'Python', 'gRPC', 'REST', 'MQTT', 'OPC-UA', 'PostgreSQL', 'Apache Kafka'],
    use_cases: [
      {
        title: 'Подключение SCADA Узсувтаминот',
        description: 'OPC-UA-адаптер и нормализация телеметрии в Smart Water Grid.',
        client: 'АО Узсувтаминот',
      },
      {
        title: 'Интеграция с открытыми данными World Bank',
        description: 'Импорт исторических индикаторов водных ресурсов в дашборды.',
        client: 'VODeco Open Data',
      },
    ],
    cases_count: 2,
    partners: ['Siemens Energy CA', 'World Bank Open Data', 'OSM Community'],
    documents: [
      { name: 'VOD Integration SDK — API reference.pdf', url: '#', size: '1.3 MB' },
    ],
    related: [
      { type: 'solution', id: 'SOL-001', title: 'Smart Water Grid Platform' },
      { type: 'solution', id: 'SOL-IOT-CHAIN', title: 'IoT-сенсоры с блокчейн-подписью' },
    ],
    _source: {
      file: 'F:/1 VODeco/Описание_экосистемы_VODeco.md',
      quote: 'VOD Integration SDK | Набор инструментов для подключения внешних IoT-систем и гос. реестров. | 12 мес. | $150,000',
    },
  },
  // ═══════════════════════════════════════════════════════════════
  //  ДОПОЛНЕНИЕ — реальные инновации в водной сфере 2023–2026
  //  (биогаз из ила, MBR, AWG, AI leak detection, smart metering,
  //   следующее поколение desal, constructed wetlands,
  //   wastewater-to-hydrogen, floating solar, NBS/SUDS,
  //   in-pipe micro-hydro, AI/ML мониторинг качества)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'SOL-BIOGAS-CAMBI',
    name: 'Cambi THP — термический гидролиз ила с энергорекуперацией (биогаз)',
    description:
      'Технология термического гидролиза (Thermal Hydrolysis Process, THP) для канализационного ила перед или после анаэробного сбраживания. ' +
      'Норвежская компания Cambi реализовала >70 заводов в мире; THP повышает биодеградируемость ила, даёт прирост биогаза на 20–50% и снижает объём дигестера на 60–70%. ' +
      'Для ЦА: применимо на крупных КОС Ташкента, Алматы, Бишкека — позволяет покрывать 40–60% энергопотребления станции собственным биогазом и резко снизить количество илового осадка. ' +
      'Технология особенно интересна для пилота Tashkent station (см. конкурс CON-VOD-002).',
    status: 'Коммерческое внедрение (мировое), потенциальный пилот в ЦА',
    coverImage:
      'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=1200&auto=format&fit=crop',
    location: {
      lat: 59.9139,
      lng: 10.7522,
      address: 'Asker, Норвегия — HQ Cambi AS; целевое применение — Ташкент/Алматы',
    },
    trl: 9,
    trl_label: 'TRL 9 — серийная технология (70+ заводов в мире)',
    license: 'Commercial / Licensed',
    stack: ['Thermal hydrolysis', 'Anaerobic digestion', 'CHP biogas turbine', 'PLC Siemens', 'SCADA'],
    use_cases: [
      {
        title: 'Washington DC Blue Plains AWWA — крупнейший THP в мире',
        description: 'Установка обрабатывает ил для 2.2 млн человек, прирост биогаза ~30%, экономия энергии ~$15M/год.',
        client: 'DC Water (USA)',
      },
      {
        title: 'Xiaohongmen, Пекин',
        description: 'Прирост биогаза 43% после установки CambiTHP.',
        client: 'Beijing Drainage Group',
      },
    ],
    cases_count: 70,
    partners: ['Cambi AS (Norway)', 'Veolia (integrator)', 'Suez'],
    documents: [
      { name: 'Cambi THP — process overview', url: 'https://www.cambi.com/process' },
      { name: 'ScienceDirect — Cambi THP sewage sludge', url: 'https://www.sciencedirect.com/science/article/abs/pii/B9780323901789000202' },
    ],
    related: [
      { type: 'contest', id: 'CON-VOD-002', title: 'VODECO Грант — Биогаз из ила (Tashkent station)' },
      { type: 'rd', id: 'RD-BIOGAS-CA', title: 'Энерго-баланс КОС Ташкента и потенциал THP' },
    ],
    _source: {
      file: 'https://www.cambi.com/process',
      quote: 'Biogas increased by 20-50%, digester volume reduction 60-70% (fetched 2026-05-22)',
    },
  },
  {
    id: 'SOL-MBR-TORAY',
    name: 'Мембранные биореакторы (MBR) — Toray / Kubota / Suez Degremont',
    description:
      'Современные мембранные биореакторы (MBR) объединяют биологическую очистку и ультрафильтрационную мембрану в одном модуле, давая на выходе воду качества выше требований ВОЗ для повторного использования. ' +
      'Toray (Япония) — половолоконные мембраны MEMBRAY®; Kubota (Япония) — плоские мембраны на крупнейших MBR-станциях мира; Suez Degremont Ultrafor™ — модульные решения. ' +
      'Применимость в ЦА: компактные MBR-станции для городов 20–200 тыс. человек, где нет места для классических КОС с длинными отстойниками. Особо актуально для районов Каракалпакстана и приграничных трансграничных стоков.',
    status: 'Коммерческое внедрение',
    coverImage:
      'https://images.unsplash.com/photo-1518152006812-edab29b069ac?w=1200&auto=format&fit=crop',
    location: {
      lat: 35.6762,
      lng: 139.6503,
      address: 'Токио, Япония — HQ Toray; применение — города ЦА 20–200 тыс. чел.',
    },
    trl: 9,
    trl_label: 'TRL 9 — серийное оборудование',
    license: 'Commercial / OEM',
    stack: ['Hollow-fiber UF/MF membranes', 'Aerobic bioreactor', 'PLC', 'Activated sludge', 'Permeate pumps'],
    use_cases: [
      {
        title: 'King County (Seattle, USA) — Brightwater MBR 117 MGD',
        description: 'Один из крупнейших MBR в мире, ультрафильтрация, повторное использование на ирригацию.',
        client: 'King County Wastewater',
      },
      {
        title: 'Beixiaohe (Пекин) — MBR на 100 тыс м³/сут',
        description: 'Один из крупнейших MBR в Китае, мембраны Kubota.',
        client: 'Beijing Drainage Group',
      },
    ],
    cases_count: 200,
    partners: ['Toray Industries', 'Kubota Membrane Europe', 'Suez Degremont', 'Veolia'],
    documents: [
      { name: 'Toray MEMBRAY MBR overview', url: 'https://www.water.toray/en/products/mbr/' },
      { name: 'Kubota Submerged Membrane Unit', url: 'https://www.kubota-mbr.com/' },
    ],
    related: [
      { type: 'solution', id: 'SOL-001', title: 'Smart Water Grid Platform' },
      { type: 'project', id: 'PROJ-UZ-001', title: 'Модернизация насосной станции №2' },
    ],
    _source: {
      file: 'https://www.water.toray/en/products/mbr/',
      quote: 'MBR combines bioreactor and ultrafiltration into single compact module (fetched 2026-05-22)',
    },
  },
  {
    id: 'SOL-AWG-SOURCE',
    name: 'Source Hydropanels — атмосферный генератор воды на солнечной энергии',
    description:
      'Гидропанели SOURCE (Arizona, USA) извлекают воду из водяного пара воздуха, используя гигроскопический материал и солнечную тепловую энергию. ' +
      'Каждая панель ~4×8 ft даёт 4–10 л питьевой воды в день; работают полностью off-grid. Уже развёрнуты в 16 странах на 5 континентах, включая Саудовскую Аравию (опыт работы в аридном климате). ' +
      'Применимость в Центральной Азии: удалённые посёлки Каракалпакстана, Кызылординской области, Туркменистан — где нет централизованного водоснабжения, но достаточно солнца. ' +
      'Альтернатива контейнерным desal-установкам там, где нет солёных подземных источников.',
    status: 'Коммерческое внедрение в 16 странах',
    coverImage:
      'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200&auto=format&fit=crop',
    location: {
      lat: 33.4484,
      lng: -112.0740,
      address: 'Scottsdale, Arizona, USA — SOURCE Global PBC',
    },
    trl: 9,
    trl_label: 'TRL 9 — третье поколение R3 (с 2023)',
    license: 'Commercial / Lease',
    stack: ['Hygroscopic material', 'Solar PV+thermal', 'Mineral addition', 'IoT monitoring', 'Cloud telemetry'],
    use_cases: [
      {
        title: 'Школы и сёла в Саудовской Аравии (аридный климат)',
        description: 'Развёртывание панелей в одном из самых аридных регионов мира — релевантный референс для Каракалпакстана.',
        client: 'SOURCE x Saudi NEOM',
      },
      {
        title: 'Острова Тихого океана — школы и больницы',
        description: 'Питьевая вода для удалённых сообществ без логистики бутилированной воды.',
        client: 'SOURCE Global x UNICEF',
      },
    ],
    cases_count: 50,
    partners: ['SOURCE Global PBC', 'BHP Foundation', 'Conservation International'],
    documents: [
      { name: 'SOURCE — How it Works', url: 'https://source.co/pages/how-it-works' },
      { name: 'World Water Reserve review 2026', url: 'https://worldwaterreserve.com/source-hydropanels/' },
    ],
    related: [
      { type: 'solution', id: 'SOL-003', title: 'AralPure — мембранное обессоливание' },
    ],
    _source: {
      file: 'https://source.co/pages/how-it-works',
      quote: 'SOURCE Hydropanels installed in 16 countries across 5 continents (fetched 2026-05-22)',
    },
  },
  {
    id: 'SOL-AGANOVA-LEAK',
    name: 'Aganova Nautilus — AI/акустическое обнаружение утечек в магистральных водоводах',
    description:
      'Свободно плывущее акустическое устройство-сенсор Nautilus (Aganova, Испания) размером с большой апельсин: проходит до 35 км по магистральному водоводу за день, оснащено акустическими датчиками и AI-анализом, обнаруживает утечки с точностью до 1 м и измеряет давление/расход. ' +
      'Партнёрства 2024–2025: Microsoft+Suez в Дублине (Uisce Éireann), Amazon AWS+Uniacque в Бергамо (экономия до 200 млн литров/год), 5-летний контракт SEDIF (Париж). ' +
      'Применимость в ЦА: магистральные водоводы Узсувтаминот, Ташкентский водопровод, водоводы в Алматы — там коммерческие потери оцениваются в 30–40%.',
    status: 'Коммерческое внедрение (Европа, США)',
    coverImage:
      'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=1200&auto=format&fit=crop',
    location: {
      lat: 36.7213,
      lng: -4.4214,
      address: 'Малага, Испания — HQ Aganova',
    },
    trl: 9,
    trl_label: 'TRL 9 — серийный сервис',
    license: 'Commercial / Service contract',
    stack: ['Acoustic sensors', 'AI/ML signal processing', 'AWS cloud', 'GPS', 'In-pipe robotics'],
    use_cases: [
      {
        title: 'Greater Dublin — Uisce Éireann + Microsoft + Suez',
        description: 'AI-driven leak detection на критической инфраструктуре, выявление утечек на трубопроводах большого диаметра.',
        client: 'Uisce Éireann (Irish Water)',
      },
      {
        title: 'Bergamo — Amazon AWS + Uniacque',
        description: 'AI-powered acoustic leak detection на AWS — цель экономии 200 млн л/год за 10 лет.',
        client: 'Uniacque',
      },
      {
        title: 'SEDIF, Париж — 5-летний контракт (2025)',
        description: 'Регулярная инспекция магистральных водоводов Парижского региона.',
        client: 'SEDIF',
      },
    ],
    cases_count: 30,
    partners: ['Aganova', 'Microsoft', 'Amazon AWS', 'Suez'],
    documents: [
      { name: 'Aganova — main site', url: 'https://aganova.com/' },
      { name: 'WaterWorld — Dublin AI leak detection', url: 'https://www.waterworld.com/smart-water-utility/article/55306670/ai-driven-leak-detection-deploying-smart-technology-in-dublins-critical-water-infrastructure' },
    ],
    related: [
      { type: 'solution', id: 'SOL-001', title: 'Smart Water Grid Platform' },
      { type: 'rd', id: 'RD-AI-LEAK', title: 'AI-leak detection на бассейне Сырдарьи' },
    ],
    _source: {
      file: 'https://aganova.com/',
      quote: 'Nautilus travels up to 35 km along large pipes/day, AI-driven leak detection accurate to under 1m (fetched 2026-05-22)',
    },
  },
  {
    id: 'SOL-SMART-METER-DIEHL',
    name: 'Diehl HYDRUS / Itron / Sensus — Smart Water Meters NB-IoT/LoRaWAN',
    description:
      'Линейка ультразвуковых статических водомеров с прямой передачей по NB-IoT и LoRaWAN: Diehl HYDRUS (Германия), Itron Intelis (США/Франция), Sensus iPERL (Xylem). ' +
      'Точность измерения <0.2% во всём диапазоне, отсутствие движущихся частей, ресурс 16+ лет, низкое энергопотребление (батарея на весь срок). ' +
      'Передача показаний в облако каждый час/сутки; обнаружение утечек, обратного потока, кражи воды. ' +
      'Применимость в ЦА: программа AMI (Advanced Metering Infrastructure) для Узсувтаминот и Tashkent Suvtaminot — где сейчас стоят механические счётчики с ручным съёмом раз в квартал.',
    status: 'Коммерческое внедрение (Европа, Азия)',
    coverImage:
      'https://images.unsplash.com/photo-1581094488379-6a99eece9b87?w=1200&auto=format&fit=crop',
    location: {
      lat: 49.4521,
      lng: 11.0767,
      address: 'Нюрнберг, Германия — Diehl Metering HQ',
    },
    trl: 9,
    trl_label: 'TRL 9 — массовое производство',
    license: 'Commercial / Hardware',
    stack: ['Ultrasonic measurement', 'NB-IoT', 'LoRaWAN', 'MQTT', 'wM-Bus', 'AES-128 encryption'],
    use_cases: [
      {
        title: 'Vodafone NB-IoT + Diehl HYDRUS в немецких городах',
        description: 'Десятки тысяч счётчиков на NB-IoT с автосчитыванием.',
        client: 'Stadtwerke (DE)',
      },
      {
        title: 'Itron Intelis — Франция, Италия, Испания',
        description: 'Массовое развёртывание AMI в Veolia/Suez сетях.',
        client: 'Veolia / Suez',
      },
    ],
    cases_count: 100,
    partners: ['Diehl Metering', 'Itron', 'Sensus (Xylem)', 'Vodafone IoT'],
    documents: [
      { name: 'Diehl HYDRUS overview', url: 'https://www.diehl.com/metering/en/products-and-solutions/water-metering/' },
      { name: 'Itron Intelis water meter', url: 'https://www.itron.com/eu/solutions/products-and-services/intelis-water' },
    ],
    related: [
      { type: 'contest', id: 'CON-001', title: 'CSWMP-DB-01R Bulk Flow Metering ADB' },
      { type: 'solution', id: 'SOL-SDK', title: 'VOD Integration SDK' },
    ],
    _source: {
      file: 'https://www.diehl.com/metering/en/products-and-solutions/water-metering/',
      quote: 'Ultrasonic static water meter with NB-IoT/LoRaWAN, accuracy <0.2%, 16-year battery (fetched 2026-05-22)',
    },
  },
  {
    id: 'SOL-DESAL-IDE-PULSE',
    name: 'IDE Pulse / графен-оксидные мембраны — десалинация следующего поколения',
    description:
      'Технология IDE Pulse (Israel) — компактная модульная установка обратного осмоса с энергорекуперацией нового поколения, удельное энергопотребление 2.5–3.0 кВт·ч/м³ против 3.5–4.0 у классического SWRO. ' +
      'Параллельно — графен-оксидные мембраны (G/F, NTU Singapore, Manchester) на стадии TRL 5–6: проницаемость в 2–3 раза выше, антифоулинговые свойства. ' +
      'Применимость в ЦА: контейнерные установки для прибрежных посёлков Каспия, обессоливание солоноватых подземных вод Каракалпакстана (TDS 3–8 г/л — идеальная зона для BWRO/Pulse).',
    status: 'IDE Pulse — коммерческий; графеновые мембраны — TRL 5–6',
    coverImage:
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&auto=format&fit=crop',
    location: {
      lat: 32.0853,
      lng: 34.7818,
      address: 'Кадима-Цоран, Израиль — IDE Technologies',
    },
    trl: 8,
    trl_label: 'TRL 8 — IDE Pulse в серии; графен — TRL 5–6',
    license: 'Commercial / Licensed',
    stack: ['RO membranes', 'Energy recovery device', 'Graphene oxide membranes (research)', 'PLC', 'Remote monitoring'],
    use_cases: [
      {
        title: 'Sorek, Israel — крупнейший SWRO в мире',
        description: 'Референсный проект IDE — 627 000 м³/сут питьевой воды.',
        client: 'IDE Technologies',
      },
      {
        title: 'ACWA Power — Саудовская Аравия, ОАЭ',
        description: 'Серия мега-проектов SWRO/BWRO с энергорекуперацией.',
        client: 'ACWA Power',
      },
    ],
    cases_count: 25,
    partners: ['IDE Technologies', 'ACWA Power', 'NTU Singapore (graphene)', 'University of Manchester'],
    documents: [
      { name: 'IDE Pulse overview', url: 'https://www.ide-tech.com/en/our-products/pulse/' },
      { name: 'ACWA Power desalination', url: 'https://www.acwapower.com/en/projects/' },
    ],
    related: [
      { type: 'solution', id: 'SOL-003', title: 'AralPure — мембранное обессоливание' },
    ],
    _source: {
      file: 'https://www.ide-tech.com/en/our-products/pulse/',
      quote: 'IDE Pulse — energy consumption 2.5-3.0 kWh/m3, compact modular RO (fetched 2026-05-22)',
    },
  },
  {
    id: 'SOL-CONSTRUCTED-WETLANDS',
    name: 'Constructed Wetlands нового поколения (Aquatech / Phytorestore)',
    description:
      'Биоинженерные сооружения "построенные водно-болотные угодья" (CW) для очистки бытовых и сельскохозяйственных стоков. ' +
      'Современные версии (Aquatech, Phytorestore, Bioremediator) — комбинируют вертикальный и горизонтальный потоки, гибридные ячейки, тростник Phragmites australis, рогоз и иву. ' +
      'Капзатраты $50–200/PE, OPEX почти нулевой, не требуют электричества и сложной эксплуатации. ' +
      'Применимость в ЦА: сёла 200–5000 человек по бассейнам Сырдарьи и Амударьи, где КОС с активным илом нерентабельны. Очистка коллекторно-дренажных вод на хлопковых полях.',
    status: 'Коммерческое внедрение (Европа, Индия)',
    coverImage:
      'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=1200&auto=format&fit=crop',
    location: {
      lat: 48.8566,
      lng: 2.3522,
      address: 'Париж, Франция — Phytorestore HQ',
    },
    trl: 9,
    trl_label: 'TRL 9 — десятки тысяч установок',
    license: 'Commercial / Design-build',
    stack: ['Reed beds Phragmites', 'Gravel filtration', 'Vertical+horizontal flow', 'Solar pumps', 'Low-tech sensors'],
    use_cases: [
      {
        title: 'Phytorestore — деревни Франции',
        description: 'Сотни CW для деревень 100–2000 жителей, замена септиков.',
        client: 'Communes (FR)',
      },
      {
        title: 'Auroville (Индия) — DEWATS',
        description: 'Децентрализованные системы очистки сточных вод (DEWATS) на CW.',
        client: 'Auroville Foundation',
      },
    ],
    cases_count: 1000,
    partners: ['Phytorestore', 'Aquatech', 'BORDA (DEWATS)', 'IWA Wetland Specialist Group'],
    documents: [
      { name: 'Phytorestore — projects', url: 'https://www.phytorestore.com/' },
      { name: 'IWA Wetland Specialist Group', url: 'https://www.iwapublishing.com/' },
    ],
    related: [
      { type: 'solution', id: 'SOL-NBS-SUDS', title: 'Nature-Based Solutions / SUDS' },
    ],
    _source: {
      file: 'https://www.phytorestore.com/',
      quote: 'Constructed wetlands — gravel + reeds, CAPEX $50-200 per PE, near-zero OPEX (fetched 2026-05-22)',
    },
  },
  {
    id: 'SOL-WW-HYDROGEN',
    name: 'Wastewater-to-Hydrogen — производство H2 из сточных вод (тренд 2025)',
    description:
      'Свежий тренд 2025 года: интегрированные системы очистки сточных вод и производства "зелёного водорода". ' +
      'Подходы: (1) microbial electrolysis cells (MEC) на бытовых стоках, (2) integrated forward osmosis + alkaline electrolysis на муниципальных стоках (рекордная скорость), (3) urine-powered electrolysis (University of Adelaide, 2025), (4) полупромышленный flow electrolyzer — снижение стоимости стоков на ~60% за счёт продажи H2. ' +
      'Применимость в ЦА: пилот на КОС крупного промышленного центра (Алмалык, Навои, Ангрен), где есть и стоки, и потребитель H2.',
    status: 'TRL 5–7 (полупромышленные пилоты)',
    coverImage:
      'https://images.unsplash.com/photo-1632935189014-1d3e6c7e26d7?w=1200&auto=format&fit=crop',
    location: {
      lat: -34.9285,
      lng: 138.6007,
      address: 'Adelaide, Australia — University of Adelaide research hub',
    },
    trl: 6,
    trl_label: 'TRL 6 — полупромышленные пилоты',
    license: 'Mixed (research + commercial spinoffs)',
    stack: ['Microbial Electrolysis Cell', 'Alkaline electrolysis', 'PEM electrolysis', 'Forward osmosis', 'Catalyst Ni/Pt'],
    use_cases: [
      {
        title: 'Urine-powered electrolysis (Adelaide 2025)',
        description: 'Безмембранные системы извлечения H2 из мочи/стоков с очисткой среды.',
        client: 'University of Adelaide',
      },
      {
        title: 'Полупромышленный flow electrolyzer',
        description: 'Интеграция очистки + производства H2; снижение стоимости стоков на 60% (ScienceDirect 2025).',
        client: 'Multi-university consortium',
      },
    ],
    cases_count: 5,
    partners: ['University of Adelaide', 'Linde Engineering', 'TU Delft'],
    documents: [
      { name: 'TechXplore — urine-powered electrolysis', url: 'https://techxplore.com/news/2025-05-urine-powered-electrolysis-energy-efficient.html' },
      { name: 'ScienceDirect — integrated H2 + wastewater (2025)', url: 'https://www.sciencedirect.com/science/article/abs/pii/S1385894725013683' },
    ],
    related: [
      { type: 'solution', id: 'SOL-BIOGAS-CAMBI', title: 'Cambi THP — биогаз из ила' },
    ],
    _source: {
      file: 'https://techxplore.com/news/2025-05-urine-powered-electrolysis-energy-efficient.html',
      quote: 'Urine-powered electrolysis offers energy-efficient green hydrogen production (2025; fetched 2026-05-22)',
    },
  },
  {
    id: 'SOL-FLOATING-SOLAR',
    name: 'Ciel & Terre Hydrelio — плавучие солнечные станции над водохранилищами',
    description:
      'Французская Ciel & Terre — мировой лидер в floating solar (FPV); запатентованная система Hydrelio с пластиковыми поплавками. ' +
      'Крупнейший проект 2025 — Omkareshwar Dam в Madhya Pradesh (Индия): 120 МВт пик, 407 699 поплавков на 20% поверхности водохранилища; снижение CO2 на 113 406 т/год; впервые применены rock-bolt анкера и spin welding. Новинки 2025 — Fusio® (honeycomb) и WattRack® (максимальная плотность). ' +
      'Применимость в ЦА: Чарвакское, Каркидонское, Тюямуюнское, Шардаринское водохранилища — потенциал FPV 1–3 ГВт суммарно при покрытии 5–10% площади + дополнительный эффект снижения испарения 20–30%.',
    status: 'Коммерческое внедрение',
    coverImage:
      'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200&auto=format&fit=crop',
    location: {
      lat: 50.5135,
      lng: 2.9069,
      address: 'Saint-Saulve, Франция — Ciel & Terre HQ',
    },
    trl: 9,
    trl_label: 'TRL 9 — серийное развёртывание',
    license: 'Commercial / EPC',
    stack: ['HDPE floats Hydrelio', 'Anchoring systems', 'PV modules', 'Inverter barge', 'Marine cables'],
    use_cases: [
      {
        title: 'Omkareshwar Dam, Индия — 120 МВт (2025)',
        description: 'Крупнейший проект C&T в Индии: 407 699 поплавков, экономия 113 406 т CO2/год.',
        client: 'NHDC Limited',
      },
      {
        title: 'Европа — крупнейший FPV проект (2024–2025)',
        description: 'EMEA-команда C&T строит крупнейший в Европе FPV.',
        client: 'Européen utility',
      },
    ],
    cases_count: 350,
    partners: ['Ciel & Terre', 'NHDC Limited', 'EDF Renewables', 'Sunseap (Singapore)'],
    documents: [
      { name: 'PV-Magazine — Omkareshwar 120 MWp (2025)', url: 'https://www.pv-magazine.com/2025/05/14/ciel-terre-completes-120-mwp-floating-solar-in-india-with-rock-bolt-anchoring/' },
      { name: 'C&T — Fusio honeycomb FPV', url: 'https://ciel-et-terre.net/ciel-et-terre-unveils-fusio-innovative-honeycomb-floating-solar-generation/' },
    ],
    related: [
      { type: 'object', id: 'OBJ-CHARVAK', title: 'Чарвакское водохранилище' },
      { type: 'rd', id: 'RD-FPV-CA', title: 'Floating solar потенциал водохранилищ ЦА' },
    ],
    _source: {
      file: 'https://www.pv-magazine.com/2025/05/14/ciel-terre-completes-120-mwp-floating-solar-in-india-with-rock-bolt-anchoring/',
      quote: '120 MWp floating solar at Omkareshwar with rock-bolt anchoring, 407,699 Hydrelio floats (fetched 2026-05-22)',
    },
  },
  {
    id: 'SOL-NBS-SUDS',
    name: 'NBS / SUDS — Природоориентированные решения для городского дренажа',
    description:
      'Nature-Based Solutions (NBS) и Sustainable Urban Drainage Systems (SUDS) для управления ливневыми стоками и снижения городских паводков: биодренажные канавы (bioswales), дождевые сады, зелёные крыши, проницаемые покрытия, биопруды-отстойники, дождевая канализация с фильтрующими элементами. ' +
      'Стандарты: CIRIA SuDS Manual (UK), EPA Green Infrastructure (USA), IUCN Global Standard for NBS. ' +
      'Применимость в ЦА: реконструкция ливневой системы Ташкента (после паводков 2024), Алматы (селевая угроза), Душанбе (сель-сай), Бишкек. Снижение пиковых стоков на 30–60% и улучшение качества воды.',
    status: 'Стандартизированная методология',
    coverImage:
      'https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?w=1200&auto=format&fit=crop',
    location: {
      lat: 51.5074,
      lng: -0.1278,
      address: 'Лондон, Великобритания — CIRIA SuDS Centre',
    },
    trl: 9,
    trl_label: 'TRL 9 — стандартизированная практика',
    license: 'Standards / Design methodology',
    stack: ['GIS hydrology', 'SWMM modeling', 'Permeable pavements', 'Bioswales', 'Green roofs', 'Detention basins'],
    use_cases: [
      {
        title: 'Copenhagen Cloudburst Plan',
        description: 'Системная NBS-программа после паводков 2011, $1.3 млрд на 20 лет.',
        client: 'City of Copenhagen',
      },
      {
        title: 'New York Green Infrastructure',
        description: '$2.4 млрд в зелёную инфраструктуру для CSO control.',
        client: 'NYC DEP',
      },
    ],
    cases_count: 500,
    partners: ['CIRIA (UK)', 'EPA Green Infrastructure', 'IUCN', 'World Bank Nature-Based Solutions'],
    documents: [
      { name: 'CIRIA SuDS Manual', url: 'https://www.susdrain.org/resources/SuDS_Manual.html' },
      { name: 'IUCN Global Standard for NBS', url: 'https://www.iucn.org/theme/nature-based-solutions/iucn-global-standard-nbs' },
      { name: 'EPA Green Infrastructure', url: 'https://www.epa.gov/green-infrastructure' },
    ],
    related: [
      { type: 'solution', id: 'SOL-CONSTRUCTED-WETLANDS', title: 'Constructed Wetlands' },
      { type: 'contest', id: 'CON-VOD-005', title: 'VODECO — Конкурс архитектуры водосбора' },
    ],
    _source: {
      file: 'https://www.susdrain.org/resources/SuDS_Manual.html',
      quote: 'SuDS Manual (CIRIA): bioswales, rain gardens, permeable pavements, detention basins (fetched 2026-05-22)',
    },
  },
  {
    id: 'SOL-LUCIDPIPE',
    name: 'LucidPipe — микро-гидротурбины в существующих водопроводах',
    description:
      'LucidPipe™ Power System (LucidEnergy, Portland OR) — сферические ин-канальные турбины, устанавливаемые в гравитационных водопроводах больших диаметров. ' +
      'Извлекают энергию из перепада давления, который обычно сбрасывается на pressure-reducing valves. Каждый агрегат 20–100 кВт; четыре LucidPipe 42″ работают в Портлэнде (USA). Сертифицированы для питьевой воды, ирригации и сточных вод. ' +
      'Применимость в ЦА: магистральные водоводы из горных источников (Чарвак→Ташкент, Талас→Бишкек, Иссык-Ата→Алматы) — потенциальная установленная мощность 5–25 МВт без вреда для водопотребления.',
    status: 'Коммерческое внедрение (US)',
    coverImage:
      'https://images.unsplash.com/photo-1473773508845-188df298d2d1?w=1200&auto=format&fit=crop',
    location: {
      lat: 45.5152,
      lng: -122.6784,
      address: 'Portland, Oregon, USA — LucidEnergy HQ',
    },
    trl: 8,
    trl_label: 'TRL 8 — коммерческая эксплуатация',
    license: 'Commercial / Hardware + Service',
    stack: ['Spherical in-pipe turbines', 'PMSG generators', 'Power electronics', 'SCADA', 'Grid-tie inverters'],
    use_cases: [
      {
        title: 'Portland Water Bureau — 4 турбины 42″',
        description: 'Установка в гравитационном водоводе, генерация без снижения подачи воды.',
        client: 'Portland Water Bureau',
      },
      {
        title: 'Riverside (CA) — water-to-energy',
        description: 'Пилот микро-гидро в муниципальной системе.',
        client: 'Riverside Public Utilities',
      },
    ],
    cases_count: 5,
    partners: ['LucidEnergy', 'Portland Water Bureau', 'Riverside Public Utilities'],
    documents: [
      { name: 'WaterOnline — LucidPipe commercial availability', url: 'https://www.wateronline.com/doc/lucid-energy-announces-commercial-0001' },
      { name: 'RenewableEnergyWorld — Portland deployment', url: 'https://www.renewableenergyworld.com/hydro-power/lucid-energys-in-pipe-hydropower-plant-begins-operation-in-portland/' },
    ],
    related: [
      { type: 'object', id: 'OBJ-CHARVAK', title: 'Чарвакский водовод' },
    ],
    _source: {
      file: 'https://www.wateronline.com/doc/lucid-energy-announces-commercial-0001',
      quote: 'LucidPipe in-conduit hydropower for municipal water; 20-100 kW per unit (fetched 2026-05-22)',
    },
  },
  {
    id: 'SOL-KETOS-AI-QUALITY',
    name: 'KETOS / Aquana AI/ML мониторинг качества воды в реальном времени',
    description:
      'KETOS SHIELD (San Jose, USA) — автономный лабораторный комплекс качества воды с измерением >35 параметров (тяжёлые металлы Pb/As/Cu/Cr, мутность, pH, DO, проводимость, остаточный хлор) и AI-аналитикой в облаке. ' +
      'Aquana — IoT-устройство на счётчик с дистанционной отсечкой и мониторингом расхода для жилых ЖКХ. AquanaSpire / KETOS — анализ AI трендов, предиктивные алерты на загрязнения, автоматические NPDES-отчёты. ' +
      'Применимость в ЦА: контроль качества питьевой воды на распределительных узлах Ташкента/Алматы (где сейчас редкие лабораторные пробы), мониторинг сбросов промышленных предприятий (NMMC, Алмалык, Кызылкум).',
    status: 'Коммерческое внедрение (US)',
    coverImage:
      'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=1200&auto=format&fit=crop',
    location: {
      lat: 37.3382,
      lng: -121.8863,
      address: 'San Jose, California, USA — KETOS HQ',
    },
    trl: 9,
    trl_label: 'TRL 9 — серийный сервис',
    license: 'Commercial / SaaS + Hardware',
    stack: ['Voltammetry (heavy metals)', 'Optical sensors', 'ML anomaly detection', 'AWS IoT', 'Mobile app'],
    use_cases: [
      {
        title: 'San Francisco Bay Area — мониторинг ЖКХ и промышленности',
        description: 'Десятки KETOS SHIELD в реальном времени отслеживают качество.',
        client: 'Bay Area utilities',
      },
      {
        title: 'Aquana — резидентные домохозяйства',
        description: 'IoT-устройство на домовом счётчике с автоотсечкой при утечке.',
        client: 'Aquana customers',
      },
    ],
    cases_count: 100,
    partners: ['KETOS Inc.', 'Aquana', 'AWS IoT'],
    documents: [
      { name: 'KETOS — SHIELD product', url: 'https://ketos.co/water-quality-monitoring/' },
      { name: 'Aquana — smart water meter', url: 'https://aquana.com/' },
    ],
    related: [
      { type: 'solution', id: 'SOL-AI-001', title: 'VODeco AI Analytics Engine' },
      { type: 'solution', id: 'SOL-IOT-CHAIN', title: 'IoT-сенсоры с блокчейн-подписью' },
    ],
    _source: {
      file: 'https://ketos.co/water-quality-monitoring/',
      quote: 'KETOS SHIELD — autonomous water quality testing with >35 parameters and AI analytics (fetched 2026-05-22)',
    },
  },
  // ═══════════════════════════════════════════════════════════════
  //  ДОПОЛНЕНИЕ — пропущенные проекты из looporb
  //  (домашние системы анализа воды, инструменты исследователей,
  //   автономные системы анализа + хеширование в токены)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'SOL-HOME-FILTER-MONITOR',
    name: 'VOD Home — домашний монитор качества воды и состояния фильтра',
    description:
      'Потребительское устройство для домашних систем фильтрации воды (под мойку / pitcher / магистраль на квартиру/дом): измеряет TDS, проводимость, температуру и мутность до и после фильтра, отслеживает ресурс картриджа в реальных литрах прошедшей воды, предупреждает за 5–7 дней до необходимости замены. ' +
      'Подключение через Wi-Fi/Bluetooth к мобильному приложению VOD Home; push-уведомления, заказ нового картриджа в один клик. ' +
      'За регулярные замеры (вклад в распределённую сеть данных) пользователь получает выплаты в VOD/WTR через Proof-of-Data механизм. ' +
      'Себестоимость прибора $40–70, картриджи partner-ecosystem.',
    status: 'Концепт / pre-MVP',
    coverImage:
      'https://images.unsplash.com/photo-1543393716-375f47996a77?w=1200&auto=format&fit=crop',
    location: {
      lat: 41.3192,
      lng: 69.2401,
      address: 'Ташкент — основная команда; целевой рынок — ЦА + СНГ',
    },
    trl: 3,
    trl_label: 'TRL 3 — концепт, проектирование схемотехники',
    license: 'Proprietary (Hardware) + Open API (data)',
    stack: ['ESP32-C3', 'TDS sensor (Atlas Scientific)', 'Turbidity sensor', 'Wi-Fi/BLE', 'React Native app', 'VOD Chain SDK'],
    use_cases: [
      {
        title: 'Домохозяйства Ташкента/Алматы — pitcher + магистральный фильтр',
        description: 'Своевременная замена картриджа, гарантия качества воды для семьи; данные обогащают экосистему VODeco.',
        client: 'Розничные потребители (B2C)',
      },
      {
        title: 'Партнёрство с ритейлерами фильтров (Аквафор/Барьер/Гейзер аналоги в ЦА)',
        description: 'Bundle с фильтром при покупке, апсейл картриджей через приложение.',
        client: 'Розничные сети ЦА',
      },
    ],
    cases_count: 0,
    partners: ['VODPROM', 'ТУИТ (электроника)', 'Atlas Scientific (сенсоры)', 'TON Foundation'],
    documents: [
      { name: 'VOD Home — концепт-документ.pdf', url: '#', size: '1.4 MB' },
    ],
    related: [
      { type: 'rd', id: 'RD-HOME-FILTER', title: 'R&D домашних сенсоров качества воды' },
      { type: 'solution', id: 'SOL-VOD-CHECK', title: 'VOD Check (мобильное приложение)' },
      { type: 'rd', id: 'RD-PROOF-OF-DATA', title: 'Proof-of-Data: автономное хеширование данных в токены' },
    ],
    _source: {
      file: 'F:/1 VODeco/looporb/docs/системы.md',
      quote: 'Системы водоподготовки... Системы фильтрации (домашние/индустриальные); потребительские устройства мониторинга',
    },
  },
  {
    id: 'SOL-RESEARCHER-TOOLS',
    name: 'Интерактивные инструменты исследователей — полевые/лабораторные kits',
    description:
      'Линейка инструментов для учёных-исследователей водных экосистем: (1) Полевой kit «Aqua Field» — портативный кейс с электродами (pH/EC/DO/ORP/ISE для нитратов/аммония), GPS-логгером, мобильным приложением; (2) Лабораторный «Aqua Lab» — настольная UV-Vis спектрофотометр + флюориметр + ICP-OES адаптер для следовых металлов; (3) Биологический «Aqua Bio» — kit для eDNA-проб, qPCR-меток, пробоотборники. ' +
      'Все инструменты интегрированы с Scientist Cabinet (см. SOL-VOD-CABINETS) и автоматически загружают данные в VOD Chain с подписью исследователя (ORCID/SBT). ' +
      'Целевой пользователь: НИИ, университеты ЦА, гранты UNDP/Всемирного банка.',
    status: 'Концепт / спецификация',
    coverImage:
      'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1200&auto=format&fit=crop',
    location: {
      lat: 41.2995,
      lng: 69.2401,
      address: 'Ташкент — НУУз / ИИТ АН РУз',
    },
    trl: 3,
    trl_label: 'TRL 3 — концепт и спецификация',
    license: 'Mixed (Hardware proprietary + Open data formats)',
    stack: ['Atlas Scientific / In-Situ probes', 'UV-Vis spectrophotometer', 'qPCR + eDNA', 'GPS logger', 'ORCID API', 'VOD Chain SDK'],
    use_cases: [
      {
        title: 'НИИ Аральского моря — eDNA для оценки оставшейся биоты',
        description: 'Регулярные пробы на остатки морской биоты в реликтовых озёрах.',
        client: 'КФ АН РУз',
      },
      {
        title: 'ТИИИМСХ — мониторинг качества коллекторно-дренажных вод',
        description: 'Полевые kit для масштабных съёмок на хлопковых полях.',
        client: 'ТИИИМСХ',
      },
    ],
    cases_count: 0,
    partners: ['НУУз', 'ИИТ АН РУз', 'Atlas Scientific', 'In-Situ Inc.', 'ORCID'],
    documents: [
      { name: 'VOD Research Tools — TRD.pdf', url: '#', size: '2.2 MB' },
    ],
    related: [
      { type: 'solution', id: 'SOL-VOD-CABINETS', title: 'Scientist Cabinet (7 кабинетов)' },
      { type: 'solution', id: 'SOL-EDU-HUB', title: 'VOD Educational Hub' },
      { type: 'rd', id: 'RD-PROOF-OF-DATA', title: 'Proof-of-Data — автономное хеширование' },
    ],
    _source: {
      file: 'F:/1 VODeco/looporb/docs/системы.md',
      quote: 'Интерактивные инструменты исследователей — полевые и лабораторные kits для учёных (упомянуто пользователем в концепции looporb)',
    },
  },
  {
    id: 'SOL-EDU-HUB',
    name: 'VOD Educational Hub — научно-образовательная платформа',
    description:
      'Платформа для публикации научных исследований, открытых датасетов и распределения грантов DAO. ' +
      'Поддерживает программы VOD Junior (школьники 10–16 лет), VOD Pro (студенты/операторы), VOD Executive (чиновники/инвесторы) и VOD Developer; выпускает SBT-сертификаты, открывающие доступ к соответствующим кабинетам. ' +
      'Бюджет — $55 000, срок — 7 мес.',
    status: 'Концепт',
    coverImage:
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&auto=format&fit=crop',
    location: {
      lat: 41.3192,
      lng: 69.2401,
      address: 'Веб-платформа academy.looporb.io (план)',
    },
    trl: 3,
    trl_label: 'TRL 3 — концепт',
    license: 'Commercial / Education partnerships',
    stack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Markdown / MDX', 'ORCID API', 'TON SDK'],
    use_cases: [
      {
        title: 'VOD Junior в школах Узбекистана',
        description: 'Курсы по экологии и проектные работы со школьными комплектами VOD Check.',
        client: 'Министерство образования РУз (концепт)',
      },
      {
        title: 'Гранты DAO для исследователей',
        description: 'Конкурсы грантов на исследования качества воды, голосование L4 DAO.',
        client: 'VOD DAO Treasury',
      },
    ],
    cases_count: 0,
    partners: ['НУУз', 'ТИИИМСХ', 'ORCID'],
    documents: [
      { name: 'VOD Educational Hub — концепт.pdf', url: '#', size: '1.1 MB' },
    ],
    related: [
      { type: 'solution', id: 'SOL-VOD-CABINETS', title: 'Система 7 ролевых кабинетов' },
      { type: 'rd', id: 'RD-010', title: 'SBT-репутация и квадратичное голосование' },
    ],
    _source: {
      file: 'F:/1 VODeco/Описание_экосистемы_VODeco.md',
      quote: 'VOD Educational Hub | Платформа для публикации исследований и распределения грантов. | 7 мес. | $55,000',
    },
  },
];

export const SOLUTIONS_MAP: Record<string, SolutionItem> = Object.fromEntries(
  SOLUTIONS_DATA.map((s) => [s.id, s]),
);
