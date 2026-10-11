// ═══════════════════════════════════════════════════════════════
//  VODecology — R&D Initiatives Database
//  Real technology developments from VODPROM / VODeco / LoopOrb ecosystem
//  Sources: F:/1 VODeco/looporb/docs/* and F:/1 VODeco/VODeco docs/docs/*
// ═══════════════════════════════════════════════════════════════

export interface RDItem {
  id: string;
  name: string;
  description: string;
  status: string;
  coverImage?: string;
  location: { lat: number; lng: number; address: string };
  laboratory: string;
  stage: 'fundamental' | 'applied' | 'prototype' | 'pilot' | 'commercial';
  stage_label: string;
  grant_total_usd?: number;
  publications_count: number;
  researchers: { name: string; role: string; affiliation?: string }[];
  grants: { funder: string; amount_usd: number; year: number; program?: string }[];
  documents: { name: string; url: string; size?: string }[];
  related: { type: 'project' | 'object' | 'subject' | 'rd' | 'solution' | 'contest' | 'hackathon'; id: string; title: string }[];
  _source?: { file: string; quote?: string };
}

export const RD_DATA: RDItem[] = [
  // ─── HARDWARE DEVICES ────────────────────────────────────────────────────────

  {
    id: 'RD-AQUACELL-GO',
    name: 'AquaCell Go — карманный полевой анализатор воды',
    description:
      'Компактный портативный анализатор воды (85×55×18 мм, 100 г) для туристов и гражданских учёных. ' +
      'Измеряет pH, температуру, электропроводность и ОВП (ORP) через сменный картридж (50 тестов). ' +
      'Интеграция по Bluetooth с мобильным приложением LoopOrb; каждая проба хэшируется через аппаратный защищённый элемент и записывается в VOD Chain. ' +
      'NFT-верификация картриджа исключает подделку расходников. Динамическое ценообразование данных: $2–5/проба в плотных зонах, до $15 в редко посещаемых локациях. ' +
      'Целевая окупаемость: 1,5–2 месяца при 3 пробах в день.',
    status: 'Прототип / R&D',
    coverImage:
      'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=1200&auto=format&fit=crop',
    location: {
      lat: 41.2995,
      lng: 69.2401,
      address: 'Ташкент — Hardware Lab VODPROM × ТУИТ',
    },
    laboratory: 'Consumer IoT Lab — VODPROM × ТУИТ',
    stage: 'prototype',
    stage_label: 'Прототип / TRL 4',
    grant_total_usd: 80_000,
    publications_count: 0,
    researchers: [
      { name: 'Тимур Кадик', role: 'Архитектор экосистемы / Product owner', affiliation: 'VODPROM / Multiverse Forge' },
    ],
    grants: [
      { funder: 'VODPROM Treasury', amount_usd: 50_000, year: 2026, program: 'DePIN Consumer Devices' },
      { funder: 'IT Park Uzbekistan', amount_usd: 30_000, year: 2026, program: 'Hardware Startup Grant' },
    ],
    documents: [
      { name: 'AquaCell Go — технические требования v0.3.pdf', url: '#', size: '1.4 MB' },
      { name: 'Unit-экономика AquaCell Go.pdf', url: '#', size: '0.6 MB' },
    ],
    related: [
      { type: 'rd', id: 'RD-PROOF-OF-WATER', title: 'Proof-of-Water Protocol' },
      { type: 'rd', id: 'RD-AQUACELL-PRO', title: 'AquaCell Pro' },
      { type: 'solution', id: 'SOL-AQUADEX', title: 'AquaDEX Data Marketplace' },
    ],
    _source: {
      file: 'F:/1 VODeco/looporb/docs/17.03_дополнения.md',
      quote: 'AquaCell Go | Карманный скрининг воды | pH, TDS, температура, ORP | Bluetooth → мобильное приложение | 50 тестов/картридж | Цена: $149 | Окупаемость: 1.5-2 мес',
    },
  },

  {
    id: 'RD-AQUACELL-PRO',
    name: 'AquaCell Pro — полевой лабораторный анализатор воды',
    description:
      'Профессиональный портативный анализатор воды (95×60×22 мм, 120 г) для экспедиторов и гражданских учёных. ' +
      'Модуль A: химический блок — pH, NO₃⁻, NO₂⁻, PO₄³⁻, NH₄⁺ (цветиметрический анализ с LED-спектрофотометром). ' +
      'Модуль B: биологический блок — детекция E.coli и общих колиформ через биолюминесценцию (метод AMP). ' +
      'Модуль C: физический блок — турбидность (NTU), растворённый кислород (DO), электропроводность, температура, TDS. ' +
      'NB-IoT автономная связь, GPS+RTK (±1 м), Secure Element (ATECC608A) для аппаратной подписи, 30 тестов/картридж. ' +
      'Точность: ±5% (полуколичественный анализ). Цена данных $6–15/проба (стандарт), $35–50 (редкие зоны). Окупаемость 2,5–3 месяца.',
    status: 'R&D / детальное проектирование',
    coverImage:
      'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1200&auto=format&fit=crop',
    location: {
      lat: 41.2995,
      lng: 69.2401,
      address: 'Ташкент — Кафедра аналитической химии НУУз',
    },
    laboratory: 'Analytical Chemistry × IoT Lab — НУУз × ТУИТ × VODPROM',
    stage: 'applied',
    stage_label: 'Прикладные R&D / TRL 3',
    grant_total_usd: 320_000,
    publications_count: 0,
    researchers: [
      { name: 'Тимур Кадик', role: 'Product owner / Архитектор', affiliation: 'VODPROM' },
    ],
    grants: [
      { funder: 'VODPROM Treasury', amount_usd: 200_000, year: 2026, program: 'DePIN Field Research Devices' },
      { funder: 'IT Park Uzbekistan', amount_usd: 120_000, year: 2026, program: 'Hardware Startup Grant' },
    ],
    documents: [
      { name: 'AquaCell Pro — спецификация картриджной системы v0.4.pdf', url: '#', size: '3.2 MB' },
      { name: 'Сравнительный анализ: YSI ProDSS vs Hach DR900 vs AquaCell Pro.pdf', url: '#', size: '1.1 MB' },
      { name: 'Anti-counterfeit NFC + SE архитектура.pdf', url: '#', size: '0.9 MB' },
    ],
    related: [
      { type: 'rd', id: 'RD-AQUACELL-GO', title: 'AquaCell Go' },
      { type: 'rd', id: 'RD-AQUACELL-LAB', title: 'AquaCell Lab' },
      { type: 'rd', id: 'RD-PROOF-OF-WATER', title: 'Proof-of-Water Protocol' },
      { type: 'solution', id: 'SOL-AQUADEX', title: 'AquaDEX Data Marketplace' },
    ],
    _source: {
      file: 'F:/1 VODeco/looporb/docs/17.03_дополнения.md',
      quote: 'Тип: Lab-on-a-chip картридж со встроенными микрофлюидными каналами... MCU: ESP32-S3 с Secure Boot и Flash Encryption... Anti-counterfeit: Каждый картридж содержит NFC-чип с приватным ключём',
    },
  },

  {
    id: 'RD-AQUACELL-LAB',
    name: 'AquaCell Lab — лабораторная точность в полевых условиях',
    description:
      'Профессиональное устройство класса «лаборатория в поле» (110×75×25 мм, 180 г) для аккредитованных исследователей. ' +
      'Включает флуориметр (детекция E.coli, цианобактерий), ICP-MS чипы для тяжёлых металлов (Pb, As, Cd, Hg), ' +
      'фото-фиксацию пробы с GPS-привязкой, калибровку по эталонам NIST. ' +
      'Точность: ±2% (лабораторный уровень). Данные принимаются в научные журналы (DOI-метка через VOD Chain). ' +
      'GNSS+RTK+фото фиксация, NB-IoT + LoRaWAN backup. ' +
      'Цена данных: $20–50/проба (стандарт), $75+ за инциденты и редкие зоны. Окупаемость 3–4 месяца.',
    status: 'Концепт / детальное проектирование',
    coverImage:
      'https://images.unsplash.com/photo-1589254065878-42c9da997008?w=1200&auto=format&fit=crop',
    location: {
      lat: 41.2995,
      lng: 69.2401,
      address: 'Ташкент — НУУз / ИИТ АН РУз',
    },
    laboratory: 'Research Instruments Lab — НУУз × ТIIИМСХ × VODPROM',
    stage: 'applied',
    stage_label: 'Прикладные R&D / TRL 2–3',
    grant_total_usd: 450_000,
    publications_count: 0,
    researchers: [
      { name: 'Тимур Кадик', role: 'Product owner', affiliation: 'VODPROM' },
    ],
    grants: [
      { funder: 'VODPROM Treasury', amount_usd: 300_000, year: 2026, program: 'Scientific Instruments DePIN' },
      { funder: 'UNDP Green Aral Sea', amount_usd: 150_000, year: 2026, program: 'Citizen Science Equipment' },
    ],
    documents: [
      { name: 'AquaCell Lab — TRD v0.2.pdf', url: '#', size: '4.1 MB' },
      { name: 'ICP-MS chip feasibility study.pdf', url: '#', size: '2.3 MB' },
    ],
    related: [
      { type: 'rd', id: 'RD-AQUACELL-PRO', title: 'AquaCell Pro' },
      { type: 'rd', id: 'RD-PROOF-OF-WATER', title: 'Proof-of-Water Protocol' },
    ],
    _source: {
      file: 'F:/1 VODeco/looporb/docs/17.03_дополнения.md',
      quote: 'AquaCell Lab | Лабораторная точность в поле | Флуориметр (E.coli, тяжелые металлы) | ICP-MS чипы (Pb, As, Cd, Hg) | Цена данных: $20-50/проба, $75+ за инциденты',
    },
  },

  {
    id: 'RD-AQUACELL-MINI',
    name: 'AquaCell Mini — игровой анализатор воды для детей',
    description:
      'Безопасный образовательный анализатор воды для детей 8–14 лет. ' +
      'Измеряет безопасные индикаторы: pH-полоски, уровень хлора, температуру. ' +
      'Встроенная геймификация: квесты ("Найди 5 источников в парке", "Проверь воду в фонтане"), ' +
      'NFT-бейджи ("Юный гидролог" — 10 проб, "Защитник реки" — найдено загрязнение, "Лаборант" — верифицированные данные). ' +
      'QR-коды для интеграции со школьными программами. Образовательные токены за выполнение квестов. ' +
      'Нет острых элементов, IP54 корпус. Картридж 20 тестов. Модель "Razor & Blades" — низкая цена устройства, стабильный доход на картриджах.',
    status: 'Концепт / дизайн',
    coverImage:
      'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=1200&auto=format&fit=crop',
    location: {
      lat: 41.3192,
      lng: 69.2401,
      address: 'Ташкент — VODPROM × Минпросвещения РУз',
    },
    laboratory: 'EdTech & Consumer Design — VODPROM',
    stage: 'fundamental',
    stage_label: 'Концепт / TRL 1',
    grant_total_usd: 50_000,
    publications_count: 0,
    researchers: [
      { name: 'Тимур Кадик', role: 'Product owner', affiliation: 'VODPROM' },
    ],
    grants: [
      { funder: 'VODPROM Treasury', amount_usd: 50_000, year: 2026, program: 'Educational DePIN' },
    ],
    documents: [
      { name: 'AquaCell Mini — концепт-документ v0.1.pdf', url: '#', size: '0.8 MB' },
    ],
    related: [
      { type: 'rd', id: 'RD-AQUACELL-GO', title: 'AquaCell Go' },
      { type: 'solution', id: 'SOL-AQUAEDU', title: 'AquaEdu Platform' },
    ],
    _source: {
      file: 'F:/1 VODeco/looporb/docs/17.03_дополнения.md',
      quote: 'AquaCell Mini | Игровой анализатор для детей 8-14 | Безопасные индикаторы (pH, хлор) | Геймификация (NFT-бейджи) | QR-коды для школ',
    },
  },

  // ─── HOME & PORTABLE SYSTEMS ─────────────────────────────────────────────────

  {
    id: 'RD-AQUAHOME-TAP',
    name: 'AquaHome Tap — умный кухонный фильтр с мониторингом',
    description:
      'Стационарный фильтр под мойку со встроенными датчиками TDS, давления и расходомером. ' +
      'NFC-маркировка картриджей: устройство знает, сколько литров прошло через конкретный картридж, ' +
      'и автоматически заказывает замену при 80% износа. ' +
      'При скачке TDS >10% за 1 минуту (пробой фильтра) — электромагнитный клапан блокирует кран и отправляет push-уведомление. ' +
      'LED-индикатор качества воды на кране. Данные TDS анонимизируются и продаются муниципалитетам ($0.10/день пассивного дохода). ' +
      'Интеграция с LoopOrb через AquaSDK. Цена: $299 + картридж $25/6–12 месяцев.',
    status: 'R&D / прототипирование',
    coverImage:
      'https://images.unsplash.com/photo-1543393716-375f47996a77?w=1200&auto=format&fit=crop',
    location: {
      lat: 41.2995,
      lng: 69.2401,
      address: 'Ташкент — IoT Consumer Lab ТУИТ',
    },
    laboratory: 'Consumer IoT Lab — ТУИТ × VODPROM',
    stage: 'prototype',
    stage_label: 'Прототип / TRL 3–4',
    grant_total_usd: 75_000,
    publications_count: 0,
    researchers: [
      { name: 'Тимур Кадик', role: 'Product owner', affiliation: 'VODPROM' },
    ],
    grants: [
      { funder: 'VODPROM Treasury', amount_usd: 45_000, year: 2026, program: 'Consumer IoT R&D' },
      { funder: 'IT Park Uzbekistan', amount_usd: 30_000, year: 2026, program: 'Smart Home Hardware Grant' },
    ],
    documents: [
      { name: 'AquaHome Tap — техническое задание v0.2.pdf', url: '#', size: '1.6 MB' },
      { name: 'Анализ конкурентов: Hydroviv, Aquana, HM Digital.pdf', url: '#', size: '0.9 MB' },
    ],
    related: [
      { type: 'rd', id: 'RD-AQUAHOME-PRO', title: 'AquaHome Pro' },
      { type: 'rd', id: 'RD-PROOF-OF-WATER', title: 'Proof-of-Water Protocol' },
      { type: 'solution', id: 'SOL-AQUASDК', title: 'AquaSDK' },
    ],
    _source: {
      file: 'F:/1 VODeco/looporb/docs/17.03_дополнения.md',
      quote: 'AquaHome Tap | Умный фильтр под мойку | TDS, давление, расходомер | NFC-картриджи (авто-учет) | Блокировка при пробое фильтра | Пассивный доход: $0.10/день',
    },
  },

  {
    id: 'RD-AQUAHOME-PRO',
    name: 'AquaHome Pro — долгосрочный мониторинг качества водопровода',
    description:
      'Комплексная система долгосрочного наблюдения за водопроводной водой для загородных домов. ' +
      'Компонент A: TimeCapsule AutoSampler — встроенный перистальтический микронасос забирает 5 мл воды раз в неделю ' +
      'в герметичный микрофлюидный картридж (12 проб / 3 месяца автономности). Картридж отправляется в региональный лаб-хаб. ' +
      'Компонент B: Real-time Guardian — сенсоры TDS, ОВП (ORP), UV-254, температуры на выходе из фильтра. ' +
      'При скачке TDS >10% — мгновенное отключение крана через электромагнитный клапан + алерт. ' +
      'LoRaWAN backup связь. Двойной доход: $0.50/день (real-time) + $5/лабораторный анализ каждые 3 месяца. ' +
      'Цена: $599 + $29/квартал (картриджи). Окупаемость: 18–20 месяцев.',
    status: 'R&D / детальное проектирование',
    coverImage:
      'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=1200&auto=format&fit=crop',
    location: {
      lat: 41.2995,
      lng: 69.2401,
      address: 'Ташкент / Ташкентская область — полигон загородных домов',
    },
    laboratory: 'Smart Home Lab — VODPROM × ТУИТ',
    stage: 'applied',
    stage_label: 'Прикладные R&D / TRL 2',
    grant_total_usd: 120_000,
    publications_count: 0,
    researchers: [
      { name: 'Тимур Кадик', role: 'Product owner', affiliation: 'VODPROM' },
    ],
    grants: [
      { funder: 'VODPROM Treasury', amount_usd: 80_000, year: 2026, program: 'Home IoT DePIN' },
      { funder: 'EBRD Pilot', amount_usd: 40_000, year: 2026, program: 'Smart Water Metering' },
    ],
    documents: [
      { name: 'AquaHome Pro — спецификация TimeCapsule + Guardian.pdf', url: '#', size: '2.4 MB' },
      { name: 'Бизнес-модель пассивного дохода с домашних датчиков.pdf', url: '#', size: '1.0 MB' },
    ],
    related: [
      { type: 'rd', id: 'RD-AQUAHOME-TAP', title: 'AquaHome Tap' },
      { type: 'rd', id: 'RD-PROOF-OF-WATER', title: 'Proof-of-Water Protocol' },
      { type: 'solution', id: 'SOL-AQUAGRID-API', title: 'AquaGrid API' },
    ],
    _source: {
      file: 'F:/1 VODeco/looporb/docs/17.03_дополнения.md',
      quote: 'AquaHome Pro | TimeCapsule: Автосэмплер (12 проб/3 мес) | Guardian: Real-time TDS/ORP/UV на выходе | Двойной доход: $0.50/день (real-time) + $5/анализ',
    },
  },

  {
    id: 'RD-AQUAHOME-SHOWER',
    name: 'AquaHome Shower — система обезжелезивания и смягчения воды для душа',
    description:
      'Стационарная система водоподготовки для душа с мониторингом качества воды. ' +
      'Компоненты: (1) Солевой умягчитель с авторегенерацией по расходу (не по таймеру); ' +
      '(2) Ферротон для удаления железа при концентрации >0.3 мг/л; ' +
      '(3) УФ-C LED стерилизатор (защита от легионеллы в стоячей воде); ' +
      '(4) Сенсор жёсткости воды на выходе с передачей метрик в LoopOrb. ' +
      'Анонимные данные о региональной жёсткости воды продаются муниципалитетам ($0.05/день кэшбэк в токенах). ' +
      'Реферальная программа: токены за привлечение соседа. Цена: $499 + соль $15/мешок.',
    status: 'Концепт / R&D',
    coverImage:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop',
    location: {
      lat: 41.2995,
      lng: 69.2401,
      address: 'Ташкент — Smart Home Lab VODPROM',
    },
    laboratory: 'Consumer Smart Home Lab — VODPROM',
    stage: 'fundamental',
    stage_label: 'Концепт / TRL 1–2',
    grant_total_usd: 60_000,
    publications_count: 0,
    researchers: [
      { name: 'Тимур Кадик', role: 'Product owner', affiliation: 'VODPROM' },
    ],
    grants: [
      { funder: 'VODPROM Treasury', amount_usd: 60_000, year: 2026, program: 'Consumer Water IoT' },
    ],
    documents: [
      { name: 'AquaHome Shower — концепт-документ v0.1.pdf', url: '#', size: '1.2 MB' },
    ],
    related: [
      { type: 'rd', id: 'RD-AQUAHOME-TAP', title: 'AquaHome Tap' },
      { type: 'rd', id: 'RD-AQUAHOME-PRO', title: 'AquaHome Pro' },
    ],
    _source: {
      file: 'F:/1 VODeco/looporb/docs/17.03_дополнения.md',
      quote: 'AquaHome Shower | Обезжелезивание + смягчение + мониторинг качества воды для кожи/волос | Солевой умягчитель (регенерация по расходу) | Ферротон | УФ-стерилизация',
    },
  },

  {
    id: 'RD-AQUAPURE-KIT',
    name: 'AquaPure Kit — модульная портативная система очистки воды',
    description:
      'Модульная полевая система очистки воды на основе результатов анализа AquaCell. ' +
      'Корпус: титановая фляжка 600 мл (180 г), универсальный вход под сменные картриджи-модули. ' +
      'Модули (выбираются по итогам анализа): ' +
      '1. Механика 0.1 мкм керамика — $15 (1000 л); ' +
      '2. Активированный уголь с серебром — $12 (500 л); ' +
      '3. Катионитовая смола (ионообмен, железо) — $18 (300 л); ' +
      '4. Мембрана обратного осмоса — $45 (100 л, морская вода, тяжёлые металлы); ' +
      '5. UV-C LED стерилизатор — $35 (перезаряжаемый). ' +
      'Горная река (бактерии): Механика + УФ = $50. Озеро с железом: Механика + ионообмен = $33. ' +
      'Морская вода: все модули = $125. Владельцы голосуют в DAO за приоритетные зоны исследований.',
    status: 'Прототип / испытания',
    coverImage:
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&auto=format&fit=crop',
    location: {
      lat: 41.6300,
      lng: 70.0400,
      address: 'Чарвакское водохранилище — полевые испытания',
    },
    laboratory: 'Portable Systems Lab — VODPROM',
    stage: 'prototype',
    stage_label: 'Прототип / TRL 4–5',
    grant_total_usd: 90_000,
    publications_count: 0,
    researchers: [
      { name: 'Тимур Кадик', role: 'Product owner', affiliation: 'VODPROM' },
    ],
    grants: [
      { funder: 'VODPROM Treasury', amount_usd: 90_000, year: 2026, program: 'Portable Water Purification' },
    ],
    documents: [
      { name: 'AquaPure Kit — модульная архитектура.pdf', url: '#', size: '1.8 MB' },
      { name: 'Полевые испытания горные реки Чарвак 2026.pdf', url: '#', size: '0.7 MB' },
    ],
    related: [
      { type: 'rd', id: 'RD-AQUACELL-GO', title: 'AquaCell Go' },
      { type: 'rd', id: 'RD-AQUACELL-PRO', title: 'AquaCell Pro' },
    ],
    _source: {
      file: 'F:/1 VODeco/looporb/docs/17.03_дополнения.md',
      quote: 'AquaPure Kit | Модульная очистка воды в поле | Титановый фляжка 600мл | Модули: механика, уголь, ионообмен, ОСМОС, УФ | Конфигуратор по результатам AquaCell | $59-149',
    },
  },

  // ─── INFRASTRUCTURE DEVICES ─────────────────────────────────────────────────

  {
    id: 'RD-AQUANODE-BUOY',
    name: 'AquaNode Buoy — стационарный автономный буй мониторинга водоёмов',
    description:
      'Автономный стационарный буй для постоянного мониторинга рек, озёр и водохранилищ. ' +
      'Солнечная панель + аккумулятор для автономной работы. ' +
      'Мультисенсорный зонд (до 10 м глубины): pH, температура, мутность, растворённый кислород, нитраты, проводимость. ' +
      'Спутниковая связь (Iridium/LoRaWAN). Акустический модем для связи с AquaDrone. ' +
      'Грантовая модель: государство оплачивает установку (цена ~$5000), ' +
      'сообщество LoopOrb получает токены за техническое обслуживание ($100/мес). ' +
      'Данные поступают в открытый доступ (OpenData). ' +
      'Целевые локации: крупные реки ЦА (Амударья, Сырдарья), водохранилища (Чарвак, Каркидон, Шардара).',
    status: 'Проектирование / пилот',
    coverImage:
      'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200&auto=format&fit=crop',
    location: {
      lat: 41.6300,
      lng: 70.0400,
      address: 'Чарвакское водохранилище — пилотная установка',
    },
    laboratory: 'Infrastructure IoT Lab — VODPROM × ОАО «Узбекгидроэнерго»',
    stage: 'applied',
    stage_label: 'Прикладные R&D / TRL 3–4',
    grant_total_usd: 250_000,
    publications_count: 0,
    researchers: [
      { name: 'Тимур Кадик', role: 'System architect', affiliation: 'VODPROM' },
    ],
    grants: [
      { funder: 'VODPROM / UNICAP', amount_usd: 150_000, year: 2026, program: 'Infrastructure Monitoring Network' },
      { funder: 'Минэкологии РУз', amount_usd: 100_000, year: 2026, program: 'Экологический мониторинг водоёмов' },
    ],
    documents: [
      { name: 'AquaNode Buoy — техническое задание.pdf', url: '#', size: '2.8 MB' },
      { name: 'Карта целевых локаций ЦА.pdf', url: '#', size: '4.2 MB' },
    ],
    related: [
      { type: 'rd', id: 'RD-AQUADRONE', title: 'AquaDrone' },
      { type: 'rd', id: 'RD-PROOF-OF-WATER', title: 'Proof-of-Water Protocol' },
      { type: 'solution', id: 'SOL-AQUAGRID-API', title: 'AquaGrid API' },
    ],
    _source: {
      file: 'F:/1 VODeco/looporb/docs/17.03_дополнения.md',
      quote: 'AquaNode Buoy | Стационарный мониторинг водоемов | Солнечная панель + батарея | Мультисенсорный зонд (до 10м глубины) | Спутниковая связь | Грантовая модель: Гос оплачивает установку',
    },
  },

  {
    id: 'RD-AQUADRONE',
    name: 'AquaDrone — автономный катамаран для труднодоступных водоёмов',
    description:
      'Беспилотный водный катамаран для мониторинга водоёмов в труднодоступных зонах. ' +
      'Автономность: 4–6 часов на одном заряде. ' +
      'Функции: взятие проб воды в удалённых точках, доставка картриджей между AquaNode Buoy, ' +
      'аварийный поиск очагов загрязнений по спутниковой тепловой карте. ' +
      'Mission Rewards: токены за выполнение миссий, поставленных через DAO голосование. ' +
      'Data Harvesting: сбор премиум-данных с удалённых зон ($75+ за пробу). ' +
      'Финансирование через краудфандинг DAO. Окупаемость: 18 месяцев по контрактам на мониторинг. ' +
      'Целевые зоны: бывшее дно Аральского моря, горные озёра Памира, трансграничные реки ЦА.',
    status: 'Концепт / проектирование',
    coverImage:
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&auto=format&fit=crop',
    location: {
      lat: 45.0000,
      lng: 60.0000,
      address: 'Аральское море / бассейн Амударьи — целевые зоны',
    },
    laboratory: 'Autonomous Robotics Lab — VODPROM × ТIIИМСХ',
    stage: 'fundamental',
    stage_label: 'Концепт / TRL 1–2',
    grant_total_usd: 180_000,
    publications_count: 0,
    researchers: [
      { name: 'Тимур Кадик', role: 'Product owner', affiliation: 'VODPROM' },
    ],
    grants: [
      { funder: 'VODPROM DAO Treasury', amount_usd: 100_000, year: 2026, program: 'Autonomous Monitoring Craft' },
      { funder: 'UNDP Green Aral Sea', amount_usd: 80_000, year: 2026 },
    ],
    documents: [
      { name: 'AquaDrone — концепт-документ v0.2.pdf', url: '#', size: '2.1 MB' },
    ],
    related: [
      { type: 'rd', id: 'RD-AQUANODE-BUOY', title: 'AquaNode Buoy' },
      { type: 'rd', id: 'RD-PROOF-OF-WATER', title: 'Proof-of-Water Protocol' },
      { type: 'object', id: 'OBJ-ARAL-SEA', title: 'Аральское море' },
    ],
    _source: {
      file: 'F:/1 VODeco/looporb/docs/17.03_дополнения.md',
      quote: 'AquaDrone | Автономный катамаран | Беспилотный (4-6 часов автономности) | Взятие проб в труднодоступных зонах | Mission Rewards: Токены за выполнение миссий DAO',
    },
  },

  // ─── PROTOCOLS & SOFTWARE ────────────────────────────────────────────────────

  {
    id: 'RD-PROOF-OF-WATER',
    name: 'Proof-of-Water (PoWtr) — протокол верификации и эмиссии токенов на реальных данных о воде',
    description:
      'Фундаментальный протокол экосистемы LoopOrb/VODeco: ' +
      'эмиссия токенов VOD/ORB возможна только при верификации физического объёма воды с работающими сенсорами. ' +
      'Стек верификации: IoT-сенсор → аппаратная подпись (Secure Element) → шлюз → ' +
      'Oracle Nodes → запись хэша в VOD Chain → mint токенов. ' +
      'Консенсус данных: при расхождении IoT и Citizen >10% — флаг для Validator Node, ' +
      'аудит в течение 24 часов, коррекция репутации источников. ' +
      'Anti-Sybil: SBT (Soulbound Tokens) для всех ролей (Citizen, Validator, Scientist, Operator). ' +
      'Формула W_m3 — нормализованный индекс ценности воды: ' +
      'энергия + очистка + дефицит + качество + углерод + экстерналии + эффективность. ' +
      'Burn-механизм при выявлении потерь объёма. Налог 2%/год на "спящие" VOD (анти-спекуляция).',
    status: 'Фундаментальные исследования',
    coverImage:
      'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&auto=format&fit=crop',
    location: {
      lat: 41.3192,
      lng: 69.2401,
      address: 'Ташкент / распределённая команда VOD DAO',
    },
    laboratory: 'VOD Protocol Lab — DAO Research',
    stage: 'applied',
    stage_label: 'Прикладные R&D протокола',
    grant_total_usd: 240_000,
    publications_count: 2,
    researchers: [
      { name: 'Тимур Кадик', role: 'Архитектор протокола', affiliation: 'VODPROM / Multiverse Forge' },
    ],
    grants: [
      { funder: 'TON Foundation', amount_usd: 150_000, year: 2025, program: 'Real-World Assets grants' },
      { funder: 'VOD DAO Treasury', amount_usd: 90_000, year: 2026 },
    ],
    documents: [
      { name: 'Litepaper VODeco — Proof-of-Water.md', url: '#', size: '180 KB' },
      { name: 'Спецификация формулы W_m3 и консенсус данных.pdf', url: '#', size: '1.4 MB' },
    ],
    related: [
      { type: 'rd', id: 'RD-IOT-SENSORS', title: 'IoT-сенсоры с блокчейн-подписью' },
      { type: 'rd', id: 'RD-AQUADEX', title: 'AquaDEX Data Marketplace' },
      { type: 'rd', id: 'RD-SBT-REPUTATION', title: 'SBT-репутация и DAO голосование' },
    ],
    _source: {
      file: 'F:/1 VODeco/looporb/docs/litepaper.md',
      quote: 'Первичная верификация объёма воды | Validator Node | Подтверждение 10,000 м³ в резервуаре | 10,000 VOD... Ключевое правило: Эмиссия токенов VOD возможна только при наличии верифицированного физического объекта',
    },
  },

  {
    id: 'RD-IOT-SENSORS',
    name: 'IoT-сенсоры с аппаратной блокчейн-подписью пакетов данных',
    description:
      'Стационарные гидрохимические сенсоры с встроенным Secure Element (SE) для аппаратной подписи телеметрии. ' +
      'Параметры: pH, мутность, TDS, DO, температура, ОВП (ORP). ' +
      'Шлюз отправляет хэши пакетов (SHA-256) + метаданные (GPS, timestamp, ID сенсора) ' +
      'в ноды VOD Chain каждые 5 минут. ' +
      'Low-power профиль: LoRaWAN/NB-IoT для развёртывания в удалённых речных бассейнах без устойчивого LTE. ' +
      'Oracle-нода: Edge-computing валидация данных перед записью в цепочку. ' +
      'Целевые этапы: R&D $150k–300k → пилот 500–1000 шт. $250k–600k → массовое 10k+ $1.5M–3.5M. ' +
      'Интеграция с цифровым двойником водной инфраструктуры и Government-кабинетом ситуационного центра.',
    status: 'Проектирование / ранний прототип',
    coverImage:
      'https://images.unsplash.com/photo-1589254065878-42c9da997008?w=1200&auto=format&fit=crop',
    location: {
      lat: 41.3192,
      lng: 69.2401,
      address: 'Ташкент — IoT Lab VODPROM × ТУИТ',
    },
    laboratory: 'IoT-лаборатория VODPROM × ТУИТ',
    stage: 'applied',
    stage_label: 'Прикладные R&D + ранний прототип',
    grant_total_usd: 270_000,
    publications_count: 1,
    researchers: [
      { name: 'Тимур Кадик', role: 'System architect', affiliation: 'VODPROM' },
    ],
    grants: [
      { funder: 'VODPROM Treasury', amount_usd: 150_000, year: 2025, program: 'DePIN Infrastructure Sensors' },
      { funder: 'AIIB', amount_usd: 120_000, year: 2025, program: 'Smart Infrastructure CA' },
    ],
    documents: [
      { name: 'IoT Sensor BOM прототипа v0.3.pdf', url: '#', size: '0.9 MB' },
      { name: 'Pipeline верификации данных и data-mint.pdf', url: '#', size: '1.7 MB' },
    ],
    related: [
      { type: 'rd', id: 'RD-PROOF-OF-WATER', title: 'Proof-of-Water протокол' },
      { type: 'rd', id: 'RD-DIGITAL-TWIN', title: 'Цифровой двойник водной инфраструктуры' },
      { type: 'solution', id: 'SOL-IOT-CHAIN', title: 'IoT Chain Integration' },
    ],
    _source: {
      file: 'F:/1 VODeco/looporb/docs/litepaper.md',
      quote: 'IoT Sensors | pH, температура, мутность, объём, давление | Validator Nodes (PoA) | Каждые 5 минут... IoT-датчики полного анализа с блокчейном... R&D $150k–300k; пилот 500–1000 шт $250k–600k',
    },
  },

  {
    id: 'RD-AQUADEX',
    name: 'AquaDEX — децентрализованная биржа верифицированных данных о воде',
    description:
      'Платформа для торговли верифицированными наборами данных о качестве воды (B2B Data Marketplace). ' +
      'Функции: торговля датасетами в режиме реального времени, фьючерсы на качество воды (предиктивные рынки), ' +
      'NFT на уникальные локации (право первичного сбора данных в точке). ' +
      'Потребители данных: муниципалитеты ($50–100/точка/мес), ' +
      'страховые компании (оценка рисков для недвижимости), ' +
      'агрохолдинги (контроль дренажных вод по нитратам), ' +
      'NGO (экологические рейтинги), DeFi-протоколы (parametric insurance). ' +
      'Цена данных для B2B: $25–50 за verified dataset (дешевле лаборатории $50–150, но с блокчейн-провенансом). ' +
      'Комиссия платформы: 2.5% с транзакции. Farming токенов за предоставление ликвидности данных.',
    status: 'Проектирование / разработка MVP',
    coverImage:
      'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=1200&auto=format&fit=crop',
    location: {
      lat: 41.3192,
      lng: 69.2401,
      address: 'Распределённо: Ташкент / распределённая команда',
    },
    laboratory: 'VOD Protocol Lab — DAO Research × VODPROM',
    stage: 'applied',
    stage_label: 'Прикладные R&D / протокол',
    grant_total_usd: 160_000,
    publications_count: 0,
    researchers: [
      { name: 'Тимур Кадик', role: 'Архитектор платформы', affiliation: 'VODPROM' },
    ],
    grants: [
      { funder: 'TON Foundation', amount_usd: 100_000, year: 2026, program: 'RWA & Data Markets' },
      { funder: 'VOD DAO Treasury', amount_usd: 60_000, year: 2026 },
    ],
    documents: [
      { name: 'AquaDEX — дизайн протокола v0.3.pdf', url: '#', size: '1.2 MB' },
      { name: 'Экономика Data Marketplace (B2B сегмент).pdf', url: '#', size: '0.8 MB' },
    ],
    related: [
      { type: 'rd', id: 'RD-PROOF-OF-WATER', title: 'Proof-of-Water Protocol' },
      { type: 'rd', id: 'RD-ORACLE-NETWORK', title: 'LoopOrb Oracle Network' },
      { type: 'solution', id: 'SOL-AQUAGRID-API', title: 'AquaGrid API' },
    ],
    _source: {
      file: 'F:/1 VODeco/looporb/docs/17.03_дополнения.md',
      quote: 'AquaDEX | Биржа данных о воде | Торговля датасетами (B2B) | Фьючерсы на качество воды (предиктивные рынки) | NFT на уникальные локации | Комиссия: 2.5% с транзакции',
    },
  },

  {
    id: 'RD-ORACLE-NETWORK',
    name: 'LoopOrb Oracle Network — децентрализованная верификация внешних данных о воде',
    description:
      'Оракульная сеть для верификации внешних источников данных и их интеграции в VOD Chain. ' +
      'Подключения: LIMS лабораторий (юридически значимые анализы), ' +
      'погодные API, спутниковые снимки (подтверждение цветения водорослей, разливов), ' +
      'мосты к другим DePIN-сетям. ' +
      'Физическая плаузибельность: автоматическая проверка данных (pH не может быть 15, ' +
      'температура воды не может быть 200°C). ' +
      'Cross-validation: при наличии двух AquaCell в радиусе 500 м — консенсус 2-of-3. ' +
      'Геоверификация: GPS + опциональное фото/видео через мобильное приложение. ' +
      'Оракулы получают % вознаграждения за верификацию. ' +
      'Challenge-механизм: оспаривание данных с залогом токенов.',
    status: 'Фундаментальные исследования / проектирование',
    coverImage:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop',
    location: {
      lat: 41.3192,
      lng: 69.2401,
      address: 'Распределённо: DAO Research Team',
    },
    laboratory: 'VOD Protocol Lab — DAO Research',
    stage: 'fundamental',
    stage_label: 'Фундаментальные R&D протокола',
    grant_total_usd: 120_000,
    publications_count: 0,
    researchers: [
      { name: 'Тимур Кадик', role: 'Архитектор протокола', affiliation: 'VODPROM' },
    ],
    grants: [
      { funder: 'TON Foundation', amount_usd: 80_000, year: 2026, program: 'Oracle Infrastructure' },
      { funder: 'VOD DAO Treasury', amount_usd: 40_000, year: 2026 },
    ],
    documents: [
      { name: 'Oracle Network — архитектура верификации.pdf', url: '#', size: '1.5 MB' },
      { name: 'Challenge mechanism spec.pdf', url: '#', size: '0.6 MB' },
    ],
    related: [
      { type: 'rd', id: 'RD-PROOF-OF-WATER', title: 'Proof-of-Water Protocol' },
      { type: 'rd', id: 'RD-AQUADEX', title: 'AquaDEX' },
      { type: 'rd', id: 'RD-SBT-REPUTATION', title: 'SBT-репутация' },
    ],
    _source: {
      file: 'F:/1 VODeco/looporb/docs/17.03_дополнения.md',
      quote: 'LoopOrb Oracle Network | Верификация внешних данных | LIMS-лаборатории | Погодные API | Спутниковые снимки | Мосты к другим DePIN сетям | Оракулы: получают % за верификацию',
    },
  },

  {
    id: 'RD-SBT-REPUTATION',
    name: 'SBT-репутация и многоуровневое DAO-голосование для водной экосистемы',
    description:
      'Система идентификации и репутации на базе Soulbound Tokens (SBT) — непродаваемых токенов репутации. ' +
      'Роли и SBT: Citizen (регистрация + KYC), Verified Citizen (10+ подтверждённых замеров), ' +
      'Operator (лицензия + аудит), Validator (стейк 100 000 VODeco + технический аудит), ' +
      'Scientist (ORCID + верификация DAO), Government (межправительственное соглашение), ' +
      'Investor (KYC + AML + стейк). ' +
      'DAO-голосование: L1 (Конституционный — 66% VODeco + 51% валидаторов), ' +
      'L2 (Экономический — параметры стейкинга), ' +
      'L3 (Проектный — квадратичное голосование по инвестициям), ' +
      'L4 (Операционный — жидкая демократия, делегаты). ' +
      'Government SBT имеет право вето на L3/L4 по критической инфраструктуре питьевой воды. ' +
      'Симуляции на агент-моделях (Mesa). Пилот в Telegram Mini App.',
    status: 'Концепт / симуляции',
    coverImage:
      'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&auto=format&fit=crop',
    location: {
      lat: 41.3192,
      lng: 69.2401,
      address: 'Распределённо: Ташкент / DAO Research Team',
    },
    laboratory: 'DAO Research — VOD DAO',
    stage: 'fundamental',
    stage_label: 'Фундаментальные исследования (концепт)',
    grant_total_usd: 60_000,
    publications_count: 0,
    researchers: [
      { name: 'Тимур Кадик', role: 'Координатор', affiliation: 'VODPROM' },
    ],
    grants: [
      { funder: 'VOD DAO Treasury', amount_usd: 60_000, year: 2026, program: 'DAO Research grants' },
    ],
    documents: [
      { name: 'SBT & quadratic voting — design draft.pdf', url: '#', size: '0.8 MB' },
      { name: 'Mesa agent-based simulation results.pdf', url: '#', size: '0.5 MB' },
    ],
    related: [
      { type: 'rd', id: 'RD-PROOF-OF-WATER', title: 'Proof-of-Water протокол' },
      { type: 'rd', id: 'RD-ORACLE-NETWORK', title: 'LoopOrb Oracle Network' },
    ],
    _source: {
      file: 'F:/1 VODeco/looporb/docs/litepaper.md',
      quote: 'SBT (Soulbound Tokens) — непродаваемая репутация... Если IoT показывает pH 7.0, а Citizen замерил pH 6.5... При расхождении >10% — флаг для проверки Validator Node',
    },
  },

  // ─── ANALYTICS & PLATFORM ────────────────────────────────────────────────────

  {
    id: 'RD-AI-ENGINE',
    name: 'AI Analytics Engine — предиктивные ML-модели дефицита и загрязнения воды',
    description:
      'Платформенный AI-модуль с точностью прогнозирования 94% на горизонте 6 месяцев. ' +
      'Архитектура: ансамбли LSTM + Gradient Boosting + Transformer для табличных данных. ' +
      'Источники данных: IoT-сенсоры сети VOD, спутниковые снимки Sentinel-2/3, ' +
      'погодные реанализы ERA5, исторические архивы Узгидромет. ' +
      'Задачи: прогноз дефицита воды, аномалия-детекция загрязнений, ' +
      'оптимизация режимов работы насосных станций и очистных сооружений. ' +
      'Интеграция в кризисные панели Government-кабинета, Operator Digital Twin, Scientist Cabinet. ' +
      'Аллерт-система: немедленное уведомление Operator и Government при выявлении аномалии. ' +
      'Открытый Jupyter-API для исследователей (облачные вычисления на данных VOD Chain).',
    status: 'Сбор датасетов / R&D',
    coverImage:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop',
    location: {
      lat: 41.3111,
      lng: 69.2797,
      address: 'Ташкент — AI Lab VODPROM',
    },
    laboratory: 'AI Lab — VODPROM',
    stage: 'applied',
    stage_label: 'Прикладные ML-исследования',
    grant_total_usd: 180_000,
    publications_count: 1,
    researchers: [
      { name: 'Тимур Кадик', role: 'Архитектор экосистемы', affiliation: 'VODPROM' },
    ],
    grants: [
      { funder: 'VODPROM Treasury', amount_usd: 120_000, year: 2025, program: 'AI Prediction P-VOD' },
      { funder: 'KOICA', amount_usd: 60_000, year: 2025, program: 'Smart Water CA' },
    ],
    documents: [
      { name: 'AI Analytics Engine — спецификация.pdf', url: '#', size: '2.6 MB' },
      { name: 'Benchmark моделей качества воды.pdf', url: '#', size: '1.8 MB' },
    ],
    related: [
      { type: 'rd', id: 'RD-DIGITAL-TWIN', title: 'Цифровой двойник инфраструктуры' },
      { type: 'solution', id: 'SOL-AI-ANALYTICS', title: 'AI Analytics Engine (продукт)' },
    ],
    _source: {
      file: 'F:/1 VODeco/looporb/docs/WHITEPAPER_COMPLETE.md',
      quote: 'AI Analytics Engine | Предиктивные модели дефицита воды | Аномалия-детекция загрязнений | Оптимизация режимов работы станций | Точность прогнозов: 94% на горизонт 6 месяцев',
    },
  },

  {
    id: 'RD-DIGITAL-TWIN',
    name: 'Digital Twin — цифровой двойник водной инфраструктуры в реальном времени',
    description:
      'Гидродинамическая 3D-модель реального времени для водной инфраструктуры: насосных станций, каналов, очистных сооружений. ' +
      'Синхронизация с IoT-сенсорами каждые 5 минут, данные SCADA, спутниковые снимки SAR. ' +
      'ML-прогноз спроса на воду и прогноз аварий (LSTM на сигналах вибрации/тока). ' +
      'Предиктивное обслуживание: модели выживания (Cox PH, DeepSurv) для прогноза остаточного ресурса ' +
      'критичных узлов (подшипники, рабочие колёса насосов), ' +
      'цель — сокращение аварийных простоев на 30%+. ' +
      'Целевые объекты: насосные станции Jizzakh PS No.2, Korovulbozor, Kuyumazar, Kuyumazar Aux, Amu-Bukhara-1 (суммарный бюджет ГЧП $43 млн). ' +
      'Интеграция в Operator-кабинет через SaaS ($500–2000/мес).',
    status: 'Прототип / калибровка',
    coverImage:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop',
    location: {
      lat: 40.5283,
      lng: 70.9425,
      address: 'Ферганская долина — пилотный полигон (ирригационные насосные станции)',
    },
    laboratory: 'Digital Infrastructure Lab — VODPROM × ТIIИМСХ',
    stage: 'prototype',
    stage_label: 'Прототип / TRL 5',
    grant_total_usd: 400_000,
    publications_count: 2,
    researchers: [
      { name: 'Тимур Кадик', role: 'Архитектор продукта', affiliation: 'VODPROM' },
    ],
    grants: [
      { funder: 'ADB', amount_usd: 250_000, year: 2024, program: 'From Glaciers to Farms' },
      { funder: 'VODPROM / UNICAP PPP', amount_usd: 150_000, year: 2025, program: 'Pumping Station Digitalization' },
    ],
    documents: [
      { name: 'Digital Twin архитектура v2.pdf', url: '#', size: '6.4 MB' },
      { name: 'Predictive Maintenance — LSTM + Survival Analysis.pdf', url: '#', size: '2.1 MB' },
      { name: 'Пилот — насосные станции Бухарской области.pdf', url: '#', size: '3.2 MB' },
    ],
    related: [
      { type: 'rd', id: 'RD-IOT-SENSORS', title: 'IoT-сенсоры с блокчейн-подписью' },
      { type: 'rd', id: 'RD-AI-ENGINE', title: 'AI Analytics Engine' },
      { type: 'project', id: 'PROJ-PS-KOROVULBOZOR', title: 'Насосная станция Korovulbozor' },
      { type: 'project', id: 'PROJ-PS-AMU-BUKHARA', title: 'Насосная станция Amu-Bukhara-1' },
    ],
    _source: {
      file: 'F:/1 VODeco/looporb/docs/litepaper.md',
      quote: 'Digital Twin | 3D-модель объекта с real-time данными | IoT → Уровень 2 → Визуализация + AI-прогнозы | Баланс воды | Предиктивная аналитика: Прогноз аварий, оптимизация режимов',
    },
  },

  // ─── BUSINESS SOLUTIONS ──────────────────────────────────────────────────────

  {
    id: 'RD-AQUAFARM',
    name: 'AquaFarm Station — система мониторинга ирригационных вод для агропредприятий',
    description:
      'Стационарная система мониторинга воды для агрохолдингов и теплиц. ' +
      'Мониторинг орошения в реальном времени: нитраты и фосфаты в дренажных водах, ' +
      'температура, электропроводность, pH. ' +
      'Интегрированная погодная станция. API для систем управления поливом. ' +
      'Автоматическая комплаенс-отчётность (EcoStandards). ' +
      'Токеномика: агрохозяйства продают избыток нитратных квот как «зелёные кредиты» через AquaDEX, ' +
      'токеновые санкции за превышение норм. ' +
      'Целевые пользователи: Ферганская долина (хлопок, пшеница, садоводство), ' +
      'Сырдарьинская область (рис, бахчевые). ' +
      'Цена: $2999 + $200/мес подписка. Окупаемость: 6 месяцев (экономия воды + избежание штрафов).',
    status: 'R&D / проектирование',
    coverImage:
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&auto=format&fit=crop',
    location: {
      lat: 40.5283,
      lng: 70.9425,
      address: 'Ферганская долина, Узбекистан',
    },
    laboratory: 'AgriTech & Water Lab — VODPROM × Минсельводхоз РУз',
    stage: 'applied',
    stage_label: 'Прикладные R&D / TRL 3',
    grant_total_usd: 150_000,
    publications_count: 0,
    researchers: [
      { name: 'Тимур Кадик', role: 'Product owner', affiliation: 'VODPROM' },
    ],
    grants: [
      { funder: 'VODPROM Treasury', amount_usd: 100_000, year: 2026, program: 'AgriWater IoT' },
      { funder: 'ADB', amount_usd: 50_000, year: 2026, program: 'Sustainable Agriculture CA' },
    ],
    documents: [
      { name: 'AquaFarm Station — техническое задание.pdf', url: '#', size: '2.0 MB' },
      { name: 'Потенциал рынка AgriWater ЦА.pdf', url: '#', size: '1.4 MB' },
    ],
    related: [
      { type: 'rd', id: 'RD-IOT-SENSORS', title: 'IoT-сенсоры с блокчейн-подписью' },
      { type: 'rd', id: 'RD-AQUADEX', title: 'AquaDEX Data Marketplace' },
      { type: 'rd', id: 'RD-DIGITAL-TWIN', title: 'Digital Twin инфраструктуры' },
    ],
    _source: {
      file: 'F:/1 VODeco/looporb/docs/17.03_дополнения.md',
      quote: 'AquaFarm Station | Мониторинг агро-орошения | Нитраты/фосфаты в дренажных водах | Погодная станция | API для систем полива | Комплаенс отчетность | $2,999 + $200/мес подписка',
    },
  },

  // ─── PPP INFRASTRUCTURE ──────────────────────────────────────────────────────

  {
    id: 'RD-PPP-PUMPING',
    name: 'VODPROM ГЧП — цифровая модернизация насосных станций Узбекистана',
    description:
      'Программа модернизации и цифровизации 5 насосных станций Министерства водного хозяйства РУз ' +
      'по схеме ГЧП (Финансирование → Проектирование → Реконструкция → Эксплуатация → Передача, 10 лет). ' +
      'Участники: Правительство РУз (гарантии), UNICAP PPP Fund (инициатор), VODPROM Corporation (SPV), ' +
      'IFC, AIIB, ADB, IsDB, EDB (финансирование), Culligan International (технологии водоподготовки), ' +
      'Aqseptence Group (фильтрация), VOD DAO (частные партнёры). ' +
      'Объекты: PS No.2 Jizzakh ($7.76M, IRR 17%), Korovulbozor Bukhara ($6.19M, IRR 15%), ' +
      'Kuyumazar Aux Bukhara ($11.97M, IRR 22%), Kuyumazar Bukhara ($7.76M, IRR 17%), ' +
      'Amu-Bukhara-1 ($9.49M, IRR 20%). Суммарный бюджет: ~$43.2M. ' +
      'Доля VOD DAO: 30% каждого проекта (выплаты в USDT + VOD-токены).',
    status: 'Активная фаза ГЧП',
    coverImage:
      'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=1200&auto=format&fit=crop',
    location: {
      lat: 39.7700,
      lng: 64.4231,
      address: 'Бухарская и Джизакская области, Узбекистан',
    },
    laboratory: 'VODPROM Corporation / UNICAP PPP Fund',
    stage: 'pilot',
    stage_label: 'Пилотное внедрение ГЧП',
    grant_total_usd: 43_200_000,
    publications_count: 0,
    researchers: [
      { name: 'Тимур Кадик', role: 'Архитектор экосистемы / VODPROM', affiliation: 'VODPROM Corporation' },
    ],
    grants: [
      { funder: 'ADB', amount_usd: 15_000_000, year: 2024, program: 'Water Infrastructure CA' },
      { funder: 'AIIB', amount_usd: 12_000_000, year: 2024, program: 'Infrastructure Financing' },
      { funder: 'IsDB', amount_usd: 8_000_000, year: 2025 },
      { funder: 'VOD DAO Community', amount_usd: 8_200_000, year: 2025, program: 'PPP Staking' },
    ],
    documents: [
      { name: 'Korovulbozor PS — проектное соглашение.pdf', url: '#', size: '8.2 MB' },
      { name: 'Kuyumazar PS — финансовая модель ГЧП.pdf', url: '#', size: '5.6 MB' },
      { name: 'Amu-Bukhara-1 — технический отчёт.pdf', url: '#', size: '7.1 MB' },
    ],
    related: [
      { type: 'rd', id: 'RD-DIGITAL-TWIN', title: 'Digital Twin инфраструктуры' },
      { type: 'rd', id: 'RD-IOT-SENSORS', title: 'IoT-сенсоры с блокчейн-подписью' },
      { type: 'project', id: 'PROJ-PS-KOROVULBOZOR', title: 'Насосная станция Korovulbozor' },
      { type: 'project', id: 'PROJ-PS-AMU-BUKHARA', title: 'Насосная станция Amu-Bukhara-1' },
    ],
    _source: {
      file: 'F:/1 VODeco/VODeco docs/docs/objects for invest.txt',
      quote: 'VODPROM Corporation: A leading company specializing in water resource modernization and digitalization... Financing → Design → Reconstruction → Operation → Transfer to Management',
    },
  },
];

export const RD_MAP: Record<string, RDItem> = Object.fromEntries(
  RD_DATA.map((r) => [r.id, r]),
);
