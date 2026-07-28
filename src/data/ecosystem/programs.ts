// ─────────────────────────────────────────────────────────────────────────────
//  Программы экосистемы ARKHEOSIUM.
//
//  `status` каждой программы выведен из фактического состояния кода
//  (обход `src/pages/*` + аудит `docs/research/codebase-audit.md`), а не из
//  желаемого. Программа со штампом «Данные демонстрационные» на странице
//  не может иметь статус `live` — это проверяемо открытием маршрута.
//
//  Экономика — модель с явными допущениями. `basis: 'assumption'` означает
//  «это проектное допущение, а не факт», и интерфейс обязан это показать.
// ─────────────────────────────────────────────────────────────────────────────

import type { Program } from './types';

// Часто повторяющиеся внешние источники данных.
const SRC = {
  aquastat: { title: 'FAO AQUASTAT — база данных по водным ресурсам', url: 'https://www.fao.org/aquastat/en/' },
  worldBank: { title: 'World Bank Open Data', url: 'https://data.worldbank.org/' },
  openMeteo: { title: 'Open-Meteo — свободный погодный и климатический API', url: 'https://open-meteo.com/' },
  nasaPower: { title: 'NASA POWER — солнечная радиация и метеорология', url: 'https://power.larc.nasa.gov/' },
  copernicus: { title: 'Copernicus Data Space Ecosystem (Sentinel)', url: 'https://dataspace.copernicus.eu/' },
  overpass: { title: 'OpenStreetMap Overpass API', url: 'https://overpass-api.de/' },
  gbif: { title: 'GBIF — глобальная база биоразнообразия', url: 'https://www.gbif.org/' },
  gfw: { title: 'Global Forest Watch API', url: 'https://www.globalforestwatch.org/' },
  irena: { title: 'IRENA — статистика возобновляемой энергетики', url: 'https://www.irena.org/Data' },
  unComtrade: { title: 'UN Comtrade — торговая статистика', url: 'https://comtrade.un.org/' },
  icwc: { title: 'МКВК — Межгосударственная координационная водохозяйственная комиссия', url: 'https://www.icwc-aral.uz/' },
} as const;

export const PROGRAMS: Program[] = [
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'platform-core',
    name: 'Ядро операционной системы',
    tagline: 'Роли, доступ, навигация, единая модель сущностей',
    kind: 'platform',
    status: 'partial',
    routes: ['/', '/dashboard', '/workspace', '/account', '/settings', '/analytics'],
    purpose:
      'Слой, на котором держатся все остальные программы: единая модель сущности «объект / субъект / проект», ' +
      'маршрутизация, командная палитра, многоязычность, PWA-каркас и — пока не построенная — ролевая модель доступа. ' +
      'Без него каждая программа вынуждена изобретать собственные типы и навигацию.',
    capabilities: [
      'Командная палитра (⌘K) — сквозной поиск по маршрутам и действиям',
      'Реестр навигации из 6 доменов, синхронизированный с глобусом и мобильным таб-баром',
      'ErrorBoundary со сбросом по маршруту — падение одной страницы не роняет ОС',
      'i18n-каркас на 5 локалей (ru / en / uz / kk / ar)',
      'PWA-каркас и ленивая загрузка ~95 страниц',
    ],
    gaps: [
      'Ролевая модель (гость / инвестор / партнёр / оператор / админ) не реализована — меню не фильтруется',
      'Защищённые маршруты отсутствуют: любая страница открыта любому',
      'Центр уведомлений разорван — /alerts и /messages живут отдельно',
      'Бейдж уведомлений в шапке захардкожен числом 3 на всех страницах',
      'Переводы неполные, часть строк захардкожена по-русски',
    ],
    roadmap: [
      { id: 'core-roles', phase: 'A', title: 'Ролевая модель и защищённые маршруты', outcome: 'Меню и данные фильтруются по роли; закрытые разделы недоступны гостю', status: 'todo', blockedBy: [] },
      { id: 'core-breadcrumbs', phase: 'A', title: 'Хлебные крошки и контекстные действия', outcome: 'С любой детальной страницы виден путь и доступны действия над сущностью', status: 'todo', blockedBy: [] },
      { id: 'core-favorites', phase: 'A', title: 'Избранное и недавнее', outcome: 'Пользователь закрепляет модули и возвращается к последним объектам', status: 'todo', blockedBy: ['core-roles'] },
      { id: 'core-notifications', phase: 'B', title: 'Единый центр уведомлений', outcome: 'Алерты, сообщения и системные события в одной ленте с реальным счётчиком', status: 'todo', blockedBy: [] },
      { id: 'core-graph', phase: 'B', title: 'Граф связей объект↔субъект↔проект↔R&D', outcome: 'Любая сущность показывает свои связи; KnowledgeGraphPage подключён к роутеру', status: 'blocked', blockedBy: ['core-roles'] },
      { id: 'core-api', phase: 'D', title: 'Публичный API и вебхуки', outcome: 'Внешние разработчики получают ключи и читают данные ОС', status: 'todo', blockedBy: ['core-roles', 'core-graph'] },
      { id: 'core-offline', phase: 'D', title: 'Офлайн-режим PWA', outcome: 'Ключевые данные доступны без сети, действия ставятся в очередь', status: 'todo', blockedBy: [] },
    ],
    dependsOn: [],
    feeds: [
      { to: 'observation', payload: 'Единая модель сущностей и маршрутизация карточек объектов', implemented: true },
      { to: 'capital-dao', payload: 'Идентичность пользователя для привязки кошелька и роли инвестора', implemented: false },
      { to: 'funding-registry', payload: 'Роль пользователя для подбора релевантных программ финансирования', implemented: false },
    ],
    dataSources: [],
    economics: null,
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'observation',
    name: 'Планетарное наблюдение',
    tagline: 'Глобус, карта, спутник, датчики, обсерватория воды',
    kind: 'monitoring',
    status: 'partial',
    routes: ['/', '/map', '/satellite', '/sensors', '/observatory', '/iot'],
    purpose:
      'Сенсорный слой ОС: как система вообще узнаёт, что происходит на планете. Объединяет 3D-глобус с реальной ' +
      'геометрией терраформирования, карту на maplibre, спутниковые индексы, сеть наземных датчиков и IoT-телеметрию. ' +
      'Всё, что считают остальные программы, начинается здесь — без измерения нет ни модели, ни экономики.',
    capabilities: [
      '3D-глобус с настоящей геометрией изменений, а не цветовой маской поверх текстуры',
      'История изменений разворачивается на самом глобусе, интерфейс располагается вокруг него',
      'Карта на maplibre-gl с реальными координатами объектов',
      'Живая модель региона (/simulator) на настоящей карте: апгрейд узлов → пересчёт индексов',
    ],
    gaps: [
      'SatellitePage: данные полностью синтетические, страница сама это признаёт в заголовочном комментарии',
      'SensorsPage: телеметрия — симуляция, реальных датчиков в контуре нет',
      'Спутниковые индексы (NDWI, NDVI) не считаются — нет подключения к Copernicus / Sentinel',
      'На глобусе нет тип-фильтров, легенды, дуг-связей и тепловой карты плотности',
      'IoT-сеть — прототип интерфейса без реального протокола приёма телеметрии',
    ],
    roadmap: [
      { id: 'obs-globe-filters', phase: 'C', title: 'Фильтры, легенда и дуги-связи на глобусе', outcome: 'Пользователь включает слои и видит связи между сущностями прямо на сфере', status: 'todo', blockedBy: [] },
      { id: 'obs-weather-api', phase: 'B', title: 'Подключение Open-Meteo и NASA POWER', outcome: 'Погода, осадки и солнечная радиация приходят из реального API, а не из константы', status: 'todo', blockedBy: [] },
      { id: 'obs-sentinel', phase: 'B', title: 'Спутниковые индексы из Copernicus', outcome: 'NDWI/NDVI по бассейну считаются на реальных снимках Sentinel-2', status: 'todo', blockedBy: ['obs-weather-api'] },
      { id: 'obs-sensors-real', phase: 'C', title: 'Протокол приёма телеметрии', outcome: 'Физический датчик пишет в систему, страница /sensors теряет штамп «симуляция»', status: 'blocked', blockedBy: ['core-api'] },
      { id: 'obs-twin', phase: 'C', title: 'Цифровой двойник объекта', outcome: 'Маршрут /hub/object/:id/twin показывает 3D-модель с живой телеметрией', status: 'todo', blockedBy: ['obs-sensors-real'] },
    ],
    dependsOn: ['platform-core'],
    feeds: [
      { to: 'water-restoration', payload: 'Уровень и площадь водоёма, расходы по каналам, испарение', implemented: false },
      { to: 'climate-engineering', payload: 'Температура, осадки, ветер — вход климатических сценариев', implemented: false },
      { to: 'agritech', payload: 'NDVI, влажность почвы, эвапотранспирация для расчёта поливной нормы', implemented: false },
      { to: 'energy-hydrogen', payload: 'Солнечная радиация и скорость ветра для оценки выработки', implemented: false },
      { to: 'science-rnd', payload: 'Сырые временные ряды для исследовательских наборов данных', implemented: false },
    ],
    dataSources: [SRC.openMeteo, SRC.nasaPower, SRC.copernicus, SRC.overpass, SRC.icwc],
    economics: {
      horizonYears: 10,
      capexUsd: null,
      monetisation:
        'Наблюдение само по себе не приносит выручки. Его эффект — снятая неопределённость: решения по поливу, ' +
        'сбросам и ремонту принимаются на измерении, а не на догадке. Монетизируется косвенно, через программы-получатели.',
      caveat:
        'Это модель влияния, а не отчёт. Все допущения ниже помечены основанием; ни одно из них не является ' +
        'измеренным фактом до подключения реальных API.',
      assumptions: [
        { key: 'decisionsPerYear', label: 'Управленческих водохозяйственных решений в год в контуре', value: 2400, unit: 'решений', basis: 'assumption', note: 'Оценка по числу узлов сети и частоте регламентных решений' },
        { key: 'errorShareBefore', label: 'Доля решений, принимаемых без актуального измерения', value: 0.55, unit: 'доля', basis: 'assumption' },
        { key: 'errorShareAfter', label: 'То же после подключения телеметрии и спутника', value: 0.15, unit: 'доля', basis: 'assumption' },
        { key: 'lossPerBadDecisionM3', label: 'Средние потери воды на одно неинформированное решение', value: 1800, unit: 'м³', basis: 'assumption', note: 'Требует замены на измеренное значение после первого сезона' },
      ],
      effects: [
        {
          id: 'obs-water-saved',
          label: 'Предотвращённые потери воды',
          unit: 'млн м³/год',
          expression: 'решения × (доля_до − доля_после) × потери_на_решение',
          compute: (a) => (a.decisionsPerYear * (a.errorShareBefore - a.errorShareAfter) * a.lossPerBadDecisionM3) / 1e6,
        },
        {
          id: 'obs-decisions-informed',
          label: 'Решений на измеренных данных',
          unit: 'решений/год',
          expression: 'решения × (1 − доля_после)',
          compute: (a) => a.decisionsPerYear * (1 - a.errorShareAfter),
        },
      ],
    },
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'water-restoration',
    name: 'Восстановление водных систем',
    tagline: 'Аральский бассейн, модель восстановления, ARAL NEXUS',
    kind: 'engineering',
    status: 'partial',
    routes: ['/water-recovery', '/simulator', '/aral-nexus', '/directions'],
    purpose:
      'Ядро миссии: перевод разговора о восстановлении бассейна в проверяемую инженерную модель. Связывает ' +
      'наблюдаемое состояние водоёма, набор физических мероприятий и их влияние на индексы благополучия, ' +
      'экологии и воды. Здесь же живут 12 модулей мегапроекта ARAL NEXUS.',
    capabilities: [
      'Живая модель региона: апгрейд узлов → рост индексов → рекомендации → годовой бюджетный цикл',
      'Обзорная страница ARAL NEXUS с описанием 12 модулей',
      'Тематический хаб водных направлений (/directions)',
    ],
    gaps: [
      'WaterRecoveryPage: уровень моря и геометрия чаши заданы константами — на них построен головной прогноз',
      'Ни один из 12 модулей ARAL NEXUS не построен как интерактивный модуль, есть только описание',
      'Нет связи «узел модели ↔ цифровой двойник объекта»',
      'Гидрологические ряды не подключены — модель не сверяется с фактическим стоком',
    ],
    roadmap: [
      { id: 'water-real-bathymetry', phase: 'C', title: 'Реальная батиметрия вместо константы', outcome: 'Прогноз восстановления считается на настоящей геометрии чаши', status: 'todo', blockedBy: ['obs-sentinel'] },
      { id: 'water-inflow', phase: 'B', title: 'Подключение гидрологических рядов', outcome: 'Приток по Амударье и Сырдарье приходит из внешнего источника', status: 'todo', blockedBy: ['obs-weather-api'] },
      { id: 'water-scenarios', phase: 'C', title: 'Сценарии восстановления с доверительным интервалом', outcome: 'Каждый сценарий показывает разброс, а не одну «точную» цифру', status: 'todo', blockedBy: ['water-real-bathymetry', 'water-inflow'] },
      { id: 'water-nexus-1', phase: 'E', title: 'Центральный остров как 3D-хаб', outcome: 'Точка входа в подпроекты ARAL NEXUS в 3D-сцене', status: 'todo', blockedBy: ['obs-twin'] },
      { id: 'water-nexus-modules', phase: 'E', title: 'Модули ARAL NEXUS поэтапно', outcome: 'Каждый из 12 модулей получает рабочий интерфейс, а не карточку-описание', status: 'todo', blockedBy: ['water-nexus-1'] },
    ],
    dependsOn: ['observation', 'platform-core'],
    feeds: [
      { to: 'agritech', payload: 'Доступный объём воды по участкам — ограничение поливного плана', implemented: false },
      { to: 'climate-engineering', payload: 'Площадь зеркала и испарение — вход климатической модели', implemented: false },
      { to: 'capital-dao', payload: 'Портфель мероприятий с расчётным эффектом для инвестиционных заявок', implemented: false },
      { to: 'island-city', payload: 'Водный баланс площадки под городскую застройку', implemented: false },
    ],
    dataSources: [SRC.aquastat, SRC.icwc, SRC.copernicus, SRC.worldBank],
    economics: {
      horizonYears: 15,
      capexUsd: null,
      monetisation:
        'Сохранённая вода конвертируется в стоимость через альтернативную стоимость подачи и через урожай, ' +
        'который иначе теряется. Прямой выручки у программы нет — она снимает издержки.',
      caveat:
        'Модель первого приближения. Площадь орошения и норма полива требуют сверки с FAO AQUASTAT по конкретному ' +
        'бассейну; стоимость воды — региональный параметр, который меняется по годам.',
      assumptions: [
        { key: 'irrigatedAreaHa', label: 'Орошаемая площадь в контуре программы', value: 250000, unit: 'га', basis: 'assumption', note: 'Пилотный контур, не вся страна. Подлежит замене на данные водохозяйственных организаций' },
        { key: 'waterNormM3PerHa', label: 'Норма водоподачи', value: 9500, unit: 'м³/га в год', basis: 'assumption', note: 'Сверить с AQUASTAT по культуре и зоне' },
        { key: 'canalLossShare', label: 'Доля потерь в распределительной сети', value: 0.38, unit: 'доля', basis: 'assumption' },
        { key: 'reachableLossShare', label: 'Доля потерь, устранимых мероприятиями программы', value: 0.25, unit: 'доля', basis: 'assumption' },
        { key: 'waterValueUsdPerM3', label: 'Альтернативная стоимость кубометра', value: 0.035, unit: 'USD/м³', basis: 'assumption' },
      ],
      effects: [
        {
          id: 'water-saved',
          label: 'Сокращение потерь воды',
          unit: 'млн м³/год',
          expression: 'площадь × норма × доля_потерь × устранимая_доля',
          compute: (a) => (a.irrigatedAreaHa * a.waterNormM3PerHa * a.canalLossShare * a.reachableLossShare) / 1e6,
        },
        {
          id: 'water-value',
          label: 'Стоимость сохранённой воды',
          unit: 'млн USD/год',
          expression: 'сохранённая_вода × стоимость_м³',
          compute: (a) => (a.irrigatedAreaHa * a.waterNormM3PerHa * a.canalLossShare * a.reachableLossShare * a.waterValueUsdPerM3) / 1e6,
        },
      ],
    },
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'climate-engineering',
    name: 'Климат-инженерия',
    tagline: 'Сценарии климата и их влияние на индексы бассейна',
    kind: 'engineering',
    status: 'prototype',
    routes: ['/climate'],
    purpose:
      'Переводит климатические сценарии в конкретные последствия для водного баланса, урожайности и энергетики ' +
      'региона. Задача программы — не прогнозировать климат самостоятельно, а корректно принять внешний прогноз ' +
      'и показать, что он означает для остальных программ ОС.',
    capabilities: ['Страница-обзор с описанием направления'],
    gaps: [
      'Страница помечена «Данные демонстрационные» в футере',
      'Климатические сценарии не подключены — нет ни одного внешнего источника в контуре',
      'Связь «сценарий → индексы» не реализована',
    ],
    roadmap: [
      { id: 'climate-scenarios', phase: 'C', title: 'Приём климатических сценариев', outcome: 'Страница работает на реальном климатическом прогнозе, штамп «демонстрационные» снимается', status: 'todo', blockedBy: ['obs-weather-api'] },
      { id: 'climate-to-indices', phase: 'C', title: 'Проброс сценария в индексы симулятора', outcome: 'Смена сценария меняет прогноз восстановления и урожайности', status: 'blocked', blockedBy: ['climate-scenarios', 'water-scenarios'] },
    ],
    dependsOn: ['observation'],
    feeds: [
      { to: 'water-restoration', payload: 'Сценарные осадки и испарение', implemented: false },
      { to: 'agritech', payload: 'Сдвиг вегетационного периода и тепловой стресс', implemented: false },
      { to: 'energy-hydrogen', payload: 'Изменение выработки ВИЭ по сценариям', implemented: false },
    ],
    dataSources: [SRC.openMeteo, SRC.copernicus, SRC.nasaPower],
    economics: null,
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'energy-hydrogen',
    name: 'Энергокольцо и водород',
    tagline: 'ВИЭ, накопление, водородный контур',
    kind: 'engineering',
    status: 'prototype',
    routes: ['/energy'],
    purpose:
      'Энергетический контур экосистемы: возобновляемая генерация, накопление и водород как способ переносить ' +
      'энергию во времени. Питает опреснение, насосные станции, транспорт и город — то есть является условием ' +
      'работоспособности почти всех инженерных программ.',
    capabilities: ['Страница-обзор с описанием направления'],
    gaps: [
      'Страница помечена «Данные демонстрационные»',
      'Нет расчёта выработки по реальной инсоляции и ветру',
      'Не связана с потребителями — опреснением, насосами, транспортом',
    ],
    roadmap: [
      { id: 'energy-resource', phase: 'B', title: 'Расчёт ресурса по NASA POWER', outcome: 'Потенциал выработки считается по реальной инсоляции площадки', status: 'todo', blockedBy: ['obs-weather-api'] },
      { id: 'energy-demand-link', phase: 'C', title: 'Связка генерация ↔ потребление', outcome: 'Видно, хватает ли энергии на заявленный контур опреснения и насосов', status: 'blocked', blockedBy: ['energy-resource'] },
      { id: 'energy-h2', phase: 'D', title: 'Водородный контур', outcome: 'Модель производства и хранения H₂ с КПД цепочки', status: 'todo', blockedBy: ['energy-demand-link'] },
    ],
    dependsOn: ['observation', 'climate-engineering'],
    feeds: [
      { to: 'water-restoration', payload: 'Энергобаланс опреснения и перекачки', implemented: false },
      { to: 'mobility-robotics', payload: 'Зарядная и водородная инфраструктура для флота', implemented: false },
      { to: 'island-city', payload: 'Энергоснабжение городской площадки', implemented: false },
    ],
    dataSources: [SRC.nasaPower, SRC.irena, SRC.openMeteo],
    economics: {
      horizonYears: 20,
      capexUsd: null,
      monetisation: 'Замещение сетевой электроэнергии собственной генерацией и продажа излишка.',
      caveat:
        'Расчёт справедлив только после подтверждения инсоляции площадки по NASA POWER и уточнения тарифа. ' +
        'Коэффициент использования мощности взят как проектное допущение.',
      assumptions: [
        { key: 'capacityMw', label: 'Установленная мощность контура', value: 50, unit: 'МВт', basis: 'assumption' },
        { key: 'capacityFactor', label: 'Коэффициент использования установленной мощности', value: 0.21, unit: 'доля', basis: 'assumption', note: 'Типично для солнечной генерации в аридной зоне; требует подтверждения по площадке' },
        { key: 'tariffUsdPerKwh', label: 'Замещаемый тариф', value: 0.06, unit: 'USD/кВт·ч', basis: 'assumption' },
      ],
      effects: [
        {
          id: 'energy-output',
          label: 'Годовая выработка',
          unit: 'ГВт·ч/год',
          expression: 'мощность × 8760 ч × КИУМ',
          compute: (a) => (a.capacityMw * 8760 * a.capacityFactor) / 1000,
        },
        {
          id: 'energy-value',
          label: 'Замещённая стоимость энергии',
          unit: 'млн USD/год',
          expression: 'выработка × тариф',
          compute: (a) => (a.capacityMw * 8760 * a.capacityFactor * 1000 * a.tariffUsdPerKwh) / 1e6,
        },
      ],
    },
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'agritech',
    name: 'Агротехнологии',
    tagline: 'Точный полив, севооборот, урожайность',
    kind: 'engineering',
    status: 'prototype',
    routes: ['/agritech'],
    purpose:
      'Основной потребитель воды в регионе, а значит — основной рычаг её экономии. Программа связывает ' +
      'спутниковые индексы вегетации, погоду и водный баланс в поливной план, который экономит воду ' +
      'без потери урожая.',
    capabilities: ['Страница-обзор с описанием направления'],
    gaps: [
      'Страница помечена «Данные демонстрационные»',
      'Нет расчёта эвапотранспирации и поливной нормы',
      'NDVI не подключён — вегетация не наблюдается',
    ],
    roadmap: [
      { id: 'agri-ndvi', phase: 'B', title: 'NDVI и влажность почвы', outcome: 'Состояние посевов видно по спутнику, а не задано вручную', status: 'todo', blockedBy: ['obs-sentinel'] },
      { id: 'agri-irrigation-plan', phase: 'C', title: 'Поливной план по эвапотранспирации', outcome: 'Система выдаёт норму полива по участку и дате', status: 'blocked', blockedBy: ['agri-ndvi', 'climate-scenarios'] },
      { id: 'agri-yield', phase: 'D', title: 'Связка полив ↔ урожайность', outcome: 'Видно, сколько урожая стоит каждый сэкономленный кубометр', status: 'todo', blockedBy: ['agri-irrigation-plan'] },
    ],
    dependsOn: ['observation', 'water-restoration', 'climate-engineering'],
    feeds: [
      { to: 'water-restoration', payload: 'Фактический водозабор по участкам — замыкание водного баланса', implemented: false },
      { to: 'circular-economy', payload: 'Объём растительных остатков как сырьё переработки', implemented: false },
      { to: 'market-supply', payload: 'Спрос на оборудование точного полива', implemented: false },
    ],
    dataSources: [SRC.copernicus, SRC.aquastat, SRC.openMeteo, SRC.worldBank],
    economics: {
      horizonYears: 10,
      capexUsd: null,
      monetisation: 'Экономия на подаче воды плюс прирост валового сбора за счёт устранения недо- и переполива.',
      caveat:
        'Прирост урожайности от точного полива сильно зависит от культуры и исходного уровня агротехники. ' +
        'Значение взято как консервативное допущение и подлежит проверке на пилотных участках.',
      assumptions: [
        { key: 'fieldsHa', label: 'Площадь под точным поливом', value: 40000, unit: 'га', basis: 'assumption' },
        { key: 'waterNormM3PerHa', label: 'Текущая норма водоподачи', value: 9500, unit: 'м³/га в год', basis: 'assumption' },
        { key: 'waterCutShare', label: 'Сокращение водоподачи без потери урожая', value: 0.18, unit: 'доля', basis: 'assumption' },
        { key: 'yieldGainShare', label: 'Прирост урожайности от устранения стресса', value: 0.07, unit: 'доля', basis: 'assumption' },
        { key: 'grossPerHaUsd', label: 'Валовой доход с гектара', value: 1400, unit: 'USD/га', basis: 'assumption' },
      ],
      effects: [
        {
          id: 'agri-water-saved',
          label: 'Сэкономленная вода',
          unit: 'млн м³/год',
          expression: 'площадь × норма × сокращение',
          compute: (a) => (a.fieldsHa * a.waterNormM3PerHa * a.waterCutShare) / 1e6,
        },
        {
          id: 'agri-yield-value',
          label: 'Прирост валового дохода',
          unit: 'млн USD/год',
          expression: 'площадь × доход_с_га × прирост',
          compute: (a) => (a.fieldsHa * a.grossPerHaUsd * a.yieldGainShare) / 1e6,
        },
      ],
    },
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'circular-economy',
    name: 'Циркулярная экономика',
    tagline: 'Замыкание материальных потоков',
    kind: 'engineering',
    status: 'prototype',
    routes: ['/circular'],
    purpose:
      'Превращает отходы остальных программ в сырьё: дренажные воды, солевые остатки опреснения, растительная ' +
      'биомасса, строительный и бытовой поток города. Экономический смысл — заместить закупку первичного сырья ' +
      'и снять затраты на захоронение.',
    capabilities: ['Страница-обзор с описанием направления'],
    gaps: [
      'Страница помечена «Данные демонстрационные»',
      'Материальные потоки не описаны количественно',
      'Нет связи с источниками отходов внутри ОС',
    ],
    roadmap: [
      { id: 'circ-flows', phase: 'C', title: 'Карта материальных потоков', outcome: 'Видно, откуда и сколько сырья приходит и куда уходит', status: 'todo', blockedBy: [] },
      { id: 'circ-links', phase: 'D', title: 'Связь с источниками отходов', outcome: 'Агро, город и опреснение автоматически питают контур переработки', status: 'blocked', blockedBy: ['circ-flows', 'agri-yield'] },
    ],
    dependsOn: ['agritech', 'island-city'],
    feeds: [
      { to: 'market-supply', payload: 'Вторичное сырьё как товарная позиция', implemented: false },
      { to: 'island-city', payload: 'Строительные материалы из переработки', implemented: false },
    ],
    dataSources: [SRC.unComtrade, SRC.worldBank],
    economics: null,
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'mobility-robotics',
    name: 'Транспорт и робототехника',
    tagline: 'Автономный транспорт, дроны, подводные роботы',
    kind: 'engineering',
    status: 'prototype',
    routes: ['/transport', '/robotics'],
    purpose:
      'Исполнительный слой: то, чем система физически действует на территории. Наземный автономный транспорт, ' +
      'воздушные и надводные дроны, подводные аппараты — носители сенсоров для наблюдения и рабочие единицы ' +
      'для инженерных программ.',
    capabilities: ['Две страницы-обзора с описанием направлений'],
    gaps: [
      'Обе страницы помечены «Данные демонстрационные»',
      'Нет трекинга флота — ни одной реальной единицы в контуре',
      'Не связано с наблюдением: дроны не являются источником данных',
    ],
    roadmap: [
      { id: 'mob-fleet', phase: 'C', title: 'Трекинг флота на карте', outcome: 'Позиции и состояние единиц видны на общей карте', status: 'todo', blockedBy: ['obs-sensors-real'] },
      { id: 'mob-sensor-carrier', phase: 'C', title: 'Дрон как носитель сенсора', outcome: 'Облёт даёт данные, которые попадают в программу наблюдения', status: 'blocked', blockedBy: ['mob-fleet'] },
    ],
    dependsOn: ['observation', 'energy-hydrogen'],
    feeds: [
      { to: 'observation', payload: 'Данные облётов и подводных обследований', implemented: false },
      { to: 'island-city', payload: 'Транспортная связность площадки', implemented: false },
    ],
    dataSources: [SRC.overpass],
    economics: null,
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'island-city',
    name: 'Умный город-остров',
    tagline: 'Городская площадка как потребитель и полигон',
    kind: 'engineering',
    status: 'prototype',
    routes: ['/city'],
    purpose:
      'Место, где все программы сходятся в одну физическую площадку: вода, энергия, транспорт, переработка ' +
      'и люди. Одновременно потребитель ресурсов и полигон, на котором инженерные решения проверяются в связке, ' +
      'а не по отдельности.',
    capabilities: ['Страница-обзор с описанием направления'],
    gaps: [
      'Страница помечена «Данные демонстрационные»',
      'Нет ресурсного баланса площадки',
      'Не связана ни с энергетикой, ни с водным контуром',
    ],
    roadmap: [
      { id: 'city-balance', phase: 'D', title: 'Ресурсный баланс площадки', outcome: 'Видно потребление воды, энергии и материалов по кварталам', status: 'todo', blockedBy: ['energy-demand-link'] },
      { id: 'city-twin', phase: 'E', title: 'Цифровой двойник квартала', outcome: '3D-модель площадки с живыми показателями', status: 'blocked', blockedBy: ['city-balance', 'obs-twin'] },
    ],
    dependsOn: ['energy-hydrogen', 'water-restoration', 'mobility-robotics'],
    feeds: [
      { to: 'circular-economy', payload: 'Городской поток отходов', implemented: false },
      { to: 'community-education', payload: 'Площадка для образовательных и полевых программ', implemented: false },
    ],
    dataSources: [SRC.overpass, SRC.worldBank],
    economics: null,
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'science-rnd',
    name: 'Наука и R&D',
    tagline: 'Методологии, открытая наука, каталог технологий',
    kind: 'science',
    status: 'prototype',
    routes: ['/rd', '/open-science', '/catalog'],
    purpose:
      'Слой знания: методики расчёта, открытые наборы данных, каталог технологий и оборудования. Задача — ' +
      'сделать так, чтобы любое утверждение ОС можно было проследить до метода и источника, а внешний ' +
      'исследователь мог воспроизвести расчёт.',
    capabilities: ['Страницы каталога, R&D и открытой науки существуют и зароутены'],
    gaps: [
      'КРИТИЧНО: RDPage содержит выдуманные публикации с несуществующими DOI, выдуманными индексами цитирования ' +
        'и выдуманными партнёрствами. Это прямой репутационный и юридический риск — подлежит удалению, а не правке',
      'OpenSciencePage помечена «Данные демонстрационные»',
      'Каталог технологий наполнен mock-записями',
      'Нет механизма публикации собственных наборов данных',
    ],
    roadmap: [
      { id: 'sci-purge', phase: 'A', title: 'Удалить выдуманные публикации и партнёрства', outcome: 'На странице R&D не остаётся ни одного непроверяемого утверждения', status: 'todo', blockedBy: [] },
      { id: 'sci-methods', phase: 'B', title: 'Реестр методик расчёта', outcome: 'Каждый индекс ОС ссылается на описанный и воспроизводимый метод', status: 'todo', blockedBy: ['sci-purge'] },
      { id: 'sci-datasets', phase: 'D', title: 'Публикация открытых наборов данных', outcome: 'Внешний исследователь скачивает данные ОС и воспроизводит расчёт', status: 'blocked', blockedBy: ['core-api', 'sci-methods'] },
    ],
    dependsOn: ['observation', 'platform-core'],
    feeds: [
      { to: 'funding-registry', payload: 'Научный профиль для грантовых заявок', implemented: false },
      { to: 'water-restoration', payload: 'Верифицированные методики расчёта восстановления', implemented: false },
      { to: 'market-supply', payload: 'Технические требования к оборудованию', implemented: false },
    ],
    dataSources: [SRC.gbif, SRC.gfw, SRC.worldBank, SRC.aquastat],
    economics: null,
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'funding-registry',
    name: 'Гранты, конкурсы и хакатоны',
    tagline: 'Реестр финансирования Центральной Азии и международных фондов',
    kind: 'social',
    status: 'prototype',
    routes: ['/opportunities'],
    purpose:
      'Единая витрина программ финансирования: гранты, конкурсы, хакатоны, премии, акселераторы. Каждая запись ' +
      'обязана иметь работающую ссылку на первоисточник и дату сверки — контракт данных не пропустит запись ' +
      'без них. Программа превращает «где взять деньги» из личного знания в актив экосистемы.',
    capabilities: [
      'Контракт данных, который отклоняет запись без https-ссылки, даты сверки и первоисточника',
      'Фильтры по типу, статусу, направлению и географии с реальными счётчиками',
      'Сортировка по срочности, объёму финансирования и названию',
      'Честный пустой экран, пока реестр не наполнен проверенными записями',
    ],
    gaps: [
      'Реестр пуст: 115 кандидатов собраны в docs/research, но ни один официальный URL ещё не открыт',
      'Страница не подключена к маршрутизатору и навигации',
      'Нет напоминаний о приближающихся дедлайнах',
      'Нет привязки программ к профилю и роли пользователя',
    ],
    roadmap: [
      { id: 'fund-verify', phase: 'B', title: 'Верификация кандидатов по первоисточникам', outcome: 'В реестр попадают только записи с открытым и подтверждённым официальным URL', status: 'in-progress', blockedBy: [] },
      { id: 'fund-wire', phase: 'B', title: 'Подключение маршрута и навигации', outcome: 'Страница доступна из меню, палитры команд и с глобуса', status: 'todo', blockedBy: [] },
      { id: 'fund-deadlines', phase: 'B', title: 'Напоминания о дедлайнах', outcome: 'Пользователь получает уведомление до закрытия приёма', status: 'blocked', blockedBy: ['core-notifications', 'fund-verify'] },
      { id: 'fund-match', phase: 'D', title: 'Подбор программ по профилю', outcome: 'Реестр предлагает релевантные программы под роль и направление', status: 'blocked', blockedBy: ['core-roles', 'fund-verify'] },
    ],
    dependsOn: ['platform-core'],
    feeds: [
      { to: 'capital-dao', payload: 'Небанковский источник финансирования проектов портфеля', implemented: false },
      { to: 'science-rnd', payload: 'Исследовательские программы и стипендии', implemented: false },
      { to: 'community-education', payload: 'Хакатоны и конкурсы как точка входа в сообщество', implemented: false },
    ],
    dataSources: [],
    economics: {
      horizonYears: 5,
      capexUsd: null,
      monetisation:
        'Программа не создаёт денежный поток сама — она повышает вероятность и скорость получения внешнего ' +
        'безвозвратного финансирования проектами экосистемы.',
      caveat:
        'Расчёт станет содержательным только после наполнения реестра проверенными записями. До этого момента ' +
        'все значения — проектные допущения, а средний размер гранта будет пересчитан по фактическому составу реестра.',
      assumptions: [
        { key: 'applicationsPerYear', label: 'Заявок, подаваемых экосистемой за год', value: 12, unit: 'заявок', basis: 'assumption' },
        { key: 'winRateBefore', label: 'Доля успеха без систематического реестра', value: 0.08, unit: 'доля', basis: 'assumption' },
        { key: 'winRateAfter', label: 'Доля успеха при отборе по подтверждённым критериям', value: 0.18, unit: 'доля', basis: 'assumption', note: 'Эффект отбора «подходящих» программ вместо подачи наугад' },
        { key: 'avgGrantUsd', label: 'Средний размер программы в реестре', value: 120000, unit: 'USD', basis: 'assumption', note: 'Будет пересчитан автоматически по фактическому реестру' },
      ],
      effects: [
        {
          id: 'fund-extra-capital',
          label: 'Дополнительное безвозвратное финансирование',
          unit: 'млн USD/год',
          expression: 'заявки × (успех_после − успех_до) × средний_грант',
          compute: (a) => (a.applicationsPerYear * (a.winRateAfter - a.winRateBefore) * a.avgGrantUsd) / 1e6,
        },
        {
          id: 'fund-wins',
          label: 'Выигранных программ',
          unit: 'программ/год',
          expression: 'заявки × успех_после',
          compute: (a) => a.applicationsPerYear * a.winRateAfter,
        },
      ],
    },
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'capital-dao',
    name: 'Капитал, токен и DAO',
    tagline: 'Инвестиции, конструктор проектов, управление, регуляторика',
    kind: 'economy',
    status: 'prototype',
    routes: ['/invest', '/constructor', '/token-sale', '/blockchain', '/regulatory'],
    purpose:
      'Финансовый и управленческий контур: как проект собирается, как он получает капитал, как держатели ' +
      'участвуют в решениях и как всё это соотносится с регуляторикой. Конструктор проектов превращает ' +
      'намерение в структурированную заявку.',
    capabilities: [
      'Конструктор проектов (/constructor) собирает заявку из типовых блоков',
      'DAO-страница с механикой голосования',
      'Раздел регуляторики',
    ],
    gaps: [
      'КРИТИЧНО: весь web3-слой — мок. src/lib/web3.ts возвращает выдуманные балансы и транзакции',
      'На странице блокчейна захардкожен фиктивный адрес кошелька',
      'Токеномика не связана с реальным контрактом',
      'Нет связи между конструктором проектов и реестром финансирования',
    ],
    roadmap: [
      { id: 'cap-web3-honest', phase: 'A', title: 'Пометить или отключить мок-web3', outcome: 'Пользователь не может принять симуляцию баланса за реальный кошелёк', status: 'todo', blockedBy: [] },
      { id: 'cap-wallet', phase: 'D', title: 'Реальное подключение кошелька', outcome: 'Адрес и баланс читаются из сети, а не из константы', status: 'blocked', blockedBy: ['cap-web3-honest', 'core-roles'] },
      { id: 'cap-project-funding', phase: 'B', title: 'Связка конструктор ↔ реестр грантов', outcome: 'Собранный проект сразу показывает подходящие программы финансирования', status: 'blocked', blockedBy: ['fund-verify'] },
      { id: 'cap-portfolio', phase: 'D', title: 'Портфель с расчётным эффектом', outcome: 'Инвестор видит модельный эффект каждого проекта с указанием оснований', status: 'todo', blockedBy: ['cap-project-funding'] },
    ],
    dependsOn: ['platform-core', 'funding-registry'],
    feeds: [
      { to: 'water-restoration', payload: 'Финансирование инженерных мероприятий', implemented: false },
      { to: 'market-supply', payload: 'Оборотный капитал под закупку оборудования', implemented: false },
    ],
    dataSources: [SRC.worldBank],
    economics: null,
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'market-supply',
    name: 'Технологический рынок',
    tagline: 'Каталог оборудования, поставщики, субъекты',
    kind: 'economy',
    status: 'prototype',
    routes: ['/tech-marketplace', '/catalog', '/hub/subjects'],
    purpose:
      'Соединяет спрос инженерных программ с предложением поставщиков: что нужно купить, у кого, по какой ' +
      'спецификации и с какими характеристиками. Без этого слоя любая инженерная программа останавливается ' +
      'на этапе «а где это взять».',
    capabilities: ['Каталог и маркетплейс зароутены; реестр субъектов существует'],
    gaps: [
      'Каталог наполнен mock-записями (52 совпадения в catalog-data.ts)',
      'Карточки товаров содержат выдуманные цены и рейтинги',
      'Нет связи «потребность программы → позиция каталога»',
      'Возможное дублирование MarketplacePage и TechMarketplacePage',
    ],
    roadmap: [
      { id: 'mkt-dedupe', phase: 'A', title: 'Устранить дублирование маркетплейсов', outcome: 'Один маршрут, одна модель данных', status: 'todo', blockedBy: [] },
      { id: 'mkt-real-catalog', phase: 'D', title: 'Реальные позиции каталога', outcome: 'Каждая карточка имеет проверяемого поставщика и спецификацию', status: 'todo', blockedBy: ['mkt-dedupe'] },
      { id: 'mkt-demand-link', phase: 'D', title: 'Связка потребность ↔ позиция', outcome: 'Из инженерной программы можно перейти к конкретному оборудованию', status: 'blocked', blockedBy: ['mkt-real-catalog', 'core-graph'] },
    ],
    dependsOn: ['platform-core', 'science-rnd'],
    feeds: [
      { to: 'agritech', payload: 'Оборудование точного полива', implemented: false },
      { to: 'energy-hydrogen', payload: 'Генерирующее и накопительное оборудование', implemented: false },
      { to: 'observation', payload: 'Датчики и станции мониторинга', implemented: false },
    ],
    dataSources: [SRC.unComtrade],
    economics: null,
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'community-education',
    name: 'Сообщество и образование',
    tagline: 'Онбординг, тур по ОС, документы, кампании',
    kind: 'social',
    status: 'partial',
    routes: ['/onboarding', '/eco-journey', '/community', '/documents', '/whitepaper'],
    purpose:
      'Точка входа человека в экосистему: как за несколько минут понять, что это, зачем и что делать дальше. ' +
      'Включает интерактивный тур по ОС, ролевой онбординг, документы и whitepaper, а также кампании ' +
      'и площадку сообщества.',
    capabilities: [
      'Ролевой онбординг с сегментацией: инвестор / партнёр / исследователь / муниципалитет',
      'Нарративный маршрут «Эко-путешествие» с историей изменений на глобусе',
      'Документы и whitepaper (обзорный и полный)',
    ],
    gaps: [
      'OnboardingPage содержит выдуманную статистику доступа (1 240+, $4.2B, 67, 23 …) — источников нет',
      'На онбординге остался логотип прежнего бренда',
      'Часть шагов эко-путешествия помечена «Скоро»',
      'Нет сквозного интерактивного тура по операционной системе',
      'Сообщение и лента сообщества работают на mock-данных',
    ],
    roadmap: [
      { id: 'comm-purge-stats', phase: 'A', title: 'Убрать выдуманную статистику и старый бренд', outcome: 'На онбординге не остаётся ни одного неподтверждённого числа', status: 'todo', blockedBy: [] },
      { id: 'comm-presentation', phase: 'A', title: 'Единая презентация экосистемы', outcome: 'Одна страница объясняет всю ОС: программы, связи, дорожные карты, модель эффекта', status: 'in-progress', blockedBy: [] },
      { id: 'comm-tour', phase: 'D', title: 'Интерактивный тур по ОС', outcome: 'Новый пользователь проходит маршрут по живым модулям, а не по скриншотам', status: 'todo', blockedBy: ['comm-presentation'] },
      { id: 'comm-academy', phase: 'D', title: 'Академия и обучающие курсы', outcome: 'Курсы по платформе и водной тематике с прогрессом', status: 'todo', blockedBy: ['comm-tour', 'core-roles'] },
    ],
    dependsOn: ['platform-core'],
    feeds: [
      { to: 'funding-registry', payload: 'Участники хакатонов и конкурсов', implemented: false },
      { to: 'capital-dao', payload: 'Поток квалифицированных инвесторов и партнёров', implemented: false },
      { to: 'science-rnd', payload: 'Гражданская наука и полевые наблюдения', implemented: false },
    ],
    dataSources: [],
    economics: null,
  },
];
