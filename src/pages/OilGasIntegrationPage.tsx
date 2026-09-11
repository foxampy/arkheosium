/**
 * OilGasIntegrationPage — витрина интеграционного модуля «Газнефть».
 * Маршрут: /oilgas/integration
 *
 * Раскрывает карточку каталога OG-SV-INTEG-001 до полноценной страницы:
 * контур интеграции, пять функциональных блоков (CRM, DAO, ИИ,
 * автоматизация, цифровой двойник) и дорожная карта внедрения.
 *
 * Структура повторяет родительскую страницу модуля: три верхние вкладки
 * плюс чипы-разделы внутри второй вкладки — ровно как «Онбординг /
 * Whitepaper / Каталог» с чипами секций каталога. Так страница читается
 * как часть модуля, а не как отдельный продукт.
 *
 * Дисциплина корпуса наследуется от каталога:
 *  — цифры вендора подписаны как заявления вендора;
 *  — стадия готовности каждого блока названа явно и не завышена;
 *  — цены не выдумываются: только «по запросу», «подписка», «грант»,
 *    «не публикуется» — те же четыре значения, что в каталоге;
 *  — там, где данных нет, стоит ⟨заполнить⟩, а не правдоподобное.
 */

import { useState } from 'react';
import { Link } from 'wouter';
import {
  Flame, ArrowLeft, ArrowRight, ChevronRight, ChevronDown,
  Plug, Server, Radio, FileText, Boxes, Wrench, Handshake,
  Users2, Gavel, Brain, Workflow, ClipboardCheck, Layers,
  Network, Activity, ShieldCheck, AlertTriangle, Building2,
  Gauge, Map as MapIcon, Timer, CheckCircle2, Package,
  Database, Milestone, Link2,
} from 'lucide-react';
import {
  STAGE_LABEL, CLAIM_LABEL, PRICING_LABEL,
  type Stage, type ClaimBasis, type Pricing,
} from '@/data/oilgas/catalog';

const ACCENT = '#fb923c';

const STAGE_COLOR: Record<Stage, string> = {
  concept: '#94a3b8',
  prototype: '#a78bfa',
  pilot: '#fbbf24',
  deployed: '#34d399',
  reference: '#64748b',
};

const CLAIM_COLOR: Record<ClaimBasis, string> = {
  standard: '#34d399',
  independent: '#22d3ee',
  vendor: '#fbbf24',
  declared: '#94a3b8',
};

// ─────────────────────────────────────────────────────────────────────
//  Мелкие элементы отображения
// ─────────────────────────────────────────────────────────────────────

function StageBadge({ stage }: { stage: Stage }) {
  return (
    <span
      className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
      style={{ color: STAGE_COLOR[stage], border: `1px solid ${STAGE_COLOR[stage]}55` }}
    >
      {STAGE_LABEL[stage]}
    </span>
  );
}

function ClaimTag({ claim }: { claim: ClaimBasis }) {
  return (
    <span
      className="text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap"
      style={{ color: CLAIM_COLOR[claim], background: 'rgba(148,163,184,0.08)' }}
    >
      {CLAIM_LABEL[claim]}
    </span>
  );
}

/** Строка «параметр — значение — основание»: у каждого числа видно источник. */
function SpecRow({ label, value, claim }: { label: string; value: string; claim: ClaimBasis }) {
  return (
    <div
      className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-[12.5px] py-1.5 border-b"
      style={{ borderColor: 'rgba(148,163,184,0.08)' }}
    >
      <span className="text-slate-500 min-w-[170px]">{label}</span>
      <span className="text-slate-200 font-medium flex-1">{value}</span>
      <ClaimTag claim={claim} />
    </div>
  );
}

function PricingNote({ pricing, note }: { pricing: Pricing; note?: string }) {
  return (
    <div
      className="mt-4 text-[12px] px-3 py-2 rounded-lg inline-flex items-start gap-2"
      style={{ background: `${ACCENT}12`, color: ACCENT }}
    >
      <FileText size={13} className="shrink-0 mt-0.5" />
      <span>
        {PRICING_LABEL[pricing]}
        {note && <span className="text-slate-400"> — {note}</span>}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
//  Данные страницы
// ─────────────────────────────────────────────────────────────────────

/** Что подключается со стороны компании. */
type Connector = {
  icon: typeof Server;
  title: string;
  what: string;
  protocol: string;
  stage: Stage;
};

const INBOUND: Connector[] = [
  {
    icon: Server,
    title: 'Учётные системы',
    what: 'Контрагенты, договоры, номенклатура, акты. Источник справочников для CRM и основание для сверки: карточка в платформе не должна расходиться с бухгалтерией.',
    protocol: 'Состав систем заказчика — ⟨заполнить по обследованию⟩. Обмен: выгрузка по расписанию либо REST/JSON.',
    stage: 'concept',
  },
  {
    icon: Radio,
    title: 'SCADA и телеметрия промысла',
    what: 'Параметрический поток с площадок: давления, расходы, температуры, токи приводов. Основной вход для предиктива и для двойника.',
    protocol: 'Целевые протоколы обмена — OPC UA (IEC 62541) и MQTT. Только чтение: платформа не управляет технологическим процессом.',
    stage: 'prototype',
  },
  {
    icon: FileText,
    title: 'Документооборот',
    what: 'Регламенты, паспорта, акты, предписания, переписка по объекту. Даёт корпус, по которому работает поиск и разбор документов.',
    protocol: 'Способ подключения — ⟨заполнить: СЭД заказчика не определена⟩.',
    stage: 'concept',
  },
  {
    icon: Package,
    title: 'Склад и МТР',
    what: 'Остатки, резервы, движение запчастей. Без этого предиктив выдаёт предупреждение, под которое нечего заказать.',
    protocol: 'Обмен по номенклатурному справочнику заказчика. Сопоставление кодов — ручное на первом этапе.',
    stage: 'concept',
  },
  {
    icon: Wrench,
    title: 'Парк оборудования',
    what: 'Реестр машин и узлов, паспорта, наработка, история ремонтов и отказов. Это же — обучающая выборка для предиктивных моделей.',
    protocol: 'Целевая рамка описания данных о надёжности — ISO 14224:2016 (сбор и обмен данными о надёжности и ТОиР в нефтегазовой отрасли).',
    stage: 'concept',
  },
  {
    icon: Building2,
    title: 'Реестр объектов и площадок',
    what: 'Месторождения, переделы, хранилища, участки трасс — с координатами и признаком их точности.',
    protocol: 'Часть уже есть в базе платформы: нефтегазовый слой региона с явной точностью координаты. Требуется сверка с внутренним реестром компании.',
    stage: 'pilot',
  },
];

/** Что даёт платформа обратно. */
const OUTBOUND: { icon: typeof Layers; title: string; text: string; stage: Stage }[] = [
  {
    icon: MapIcon,
    title: 'Единая карточка объекта',
    text: 'Скважина, установка или участок трассы существует в одном месте: геометрия, паспорт, телеметрия, история работ, связанные договоры и решения. Не четыре системы с четырьмя версиями одного объекта.',
    stage: 'prototype',
  },
  {
    icon: ShieldCheck,
    title: 'Проверяемость измерения',
    text: 'Показание запечатывается хэшем в момент снятия, на краю сети, и связывается с записью в реестре. Спор о цифре превращается из спора о доверии в проверку цепочки. Механизм модуля описан в whitepaper «Газнефти»; собственная сеть узлов на объектах заказчика не развёрнута.',
    stage: 'concept',
  },
  {
    icon: Activity,
    title: 'Мониторинг состояния активов',
    text: 'Контроль оборудования по вибрационной и параметрической картине в опоре на ISO 17359, ISO 20816, ISO 13373 и ISO 13379-1. Постановка контроля существует как услуга каталога OG-SV-CBM-001 и помечена там как находящаяся в эксплуатации.',
    stage: 'deployed',
  },
  {
    icon: Gauge,
    title: 'Отчётность по метану',
    text: 'Программа LDAR и подготовка отчётности под Регламент (ЕС) 2024/1787, OGMP 2.0 и 40 CFR Part 60 Appendix K. В каталоге это отдельная услуга OG-SV-LDAR-001 со стадией «в эксплуатации»; в интеграционном контуре она получает автоматическую подачу данных.',
    stage: 'pilot',
  },
  {
    icon: Network,
    title: 'Связь с корпусом платформы',
    text: 'Объекты компании попадают в тот же атлас, что и водные объекты Центральной Азии. Попутная вода, возвращённая в оборот на промысле, считается в водном модуле, а не отдельной табличкой.',
    stage: 'prototype',
  },
];

/** Пять функциональных блоков. */
type Block = {
  id: string;
  chip: string;
  icon: typeof Handshake;
  title: string;
  stage: Stage;
  lead: string;
  points: { title: string; text: string }[];
  specs: { label: string; value: string; claim: ClaimBasis }[];
  gaps: string[];
  pricing: Pricing;
  pricingNote?: string;
  links?: { href: string; label: string }[];
};

const BLOCKS: Block[] = [
  // ── CRM ───────────────────────────────────────────────────────────
  {
    id: 'crm',
    chip: 'CRM',
    icon: Handshake,
    title: 'CRM промыслового профиля',
    stage: 'prototype',
    lead:
      'Обычная CRM оперирует сделкой и контактом. Компании, которая одновременно оказывает сервис, работает подрядчиком, продаёт и разрабатывает собственные месторождения, этого не хватает: у неё сделка привязана к объекту, наряду, бригаде и партии. Поэтому базовая сущность здесь — не сделка, а объект и работа на нём.',
    points: [
      {
        title: 'Сделки и сбыт',
        text: 'Воронка по направлениям — сервис, подряд, поставка, собственная добыча — с разными стадиями, потому что цикл у них разный. Контрагент связан с объектом на карте, а не только со строкой в таблице.',
      },
      {
        title: 'Подрядчики и субподряд',
        text: 'Реестр исполнителей с допусками, аттестациями и сроками их действия. Просроченный допуск виден до выхода бригады на площадку, а не в акте по факту.',
      },
      {
        title: 'Тендеры',
        text: 'Ведение заявок и предложений: сроки, комплектность пакета, ответственный, результат. Интеграция с внешними тендерными площадками — ⟨заполнить: перечень площадок не определён⟩.',
      },
      {
        title: 'Сервисные заявки',
        text: 'Заявка от заказчика или от внутренней службы проходит один маршрут: приём, классификация, назначение бригады, наряд, выполнение, акт. Каждый шаг имеет отметку времени и ответственного.',
      },
      {
        title: 'История работ по скважине и объекту',
        text: 'Хронология по объекту: обследования, ремонты, замены узлов, отказы, измерения. Это одновременно и справка для заказчика, и обучающая выборка для предиктивных моделей.',
      },
    ],
    specs: [
      { label: 'Базовая сущность', value: 'Объект / скважина, а не абстрактная сделка', claim: 'declared' },
      { label: 'Связь с картой', value: 'Контрагент и работа привязаны к объекту в реестре платформы', claim: 'declared' },
      { label: 'Рамка данных о ТОиР', value: 'ISO 14224:2016 — целевая, соответствие не подтверждено', claim: 'standard' },
      { label: 'Число внедрений', value: '⟨нет⟩', claim: 'declared' },
    ],
    gaps: [
      'Промышленных внедрений CRM этого профиля нет. Показывается интерфейсный прототип на модельных данных.',
      'Миграция исторических данных из действующих систем компании не выполнялась и по трудоёмкости не оценена.',
    ],
    pricing: 'subscription',
    pricingNote: 'расчёт по числу рабочих мест и объектов; ставка до обследования не называется',
  },

  // ── DAO ───────────────────────────────────────────────────────────
  {
    id: 'dao',
    chip: 'DAO',
    icon: Gavel,
    title: 'DAO-контур решений',
    stage: 'concept',
    lead:
      'Это не замена корпоративному управлению и не перенос компании в блокчейн. Это проверяемый слой над уже существующим порядком: правила, по которым решение принимается, записаны исполняемо, а сам факт решения нельзя переписать задним числом. Ценность появляется там, где в проекте несколько сторон с разными интересами — оператор, подрядчик, инвестор, регулятор.',
    points: [
      {
        title: 'Права и роли участников',
        text: 'Роли задаются по функции, а не по человеку: оператор объекта, служба главного механика, HSE, финансы, представитель партнёра, совет направления. У роли — заданный набор прав: инициировать, согласовывать, голосовать, накладывать вето, только читать.',
      },
      {
        title: 'Голосование по проектам',
        text: 'Предмет голосования — бюджет направления, включение объекта в реестр, изменение регламента, допуск подрядчика. У предложения есть кворум, срок и распределение голосов; итог фиксируется вместе с составом голосовавших.',
      },
      {
        title: 'Прозрачность решений',
        text: 'Каждое решение хранит основание: какие данные были на момент голосования, кто инициировал, кто возражал. Через полгода вопрос «почему тогда решили так» имеет ответ, а не реконструкцию по переписке.',
      },
      {
        title: 'Разграничение с корпоративным контуром',
        text: 'Юридически значимое решение остаётся за органами управления компании. DAO-слой фиксирует подготовку и согласование — то, что обычно теряется между письмами и совещаниями.',
      },
    ],
    specs: [
      { label: 'Демонстрационный контур', value: 'Страница /dao платформы — на модельных данных', claim: 'declared' },
      { label: 'Применение в нефтегазовом контуре', value: '⟨не пилотировалось⟩', claim: 'declared' },
      { label: 'Юридический статус решений', value: '⟨заполнить: правовая квалификация не проработана⟩', claim: 'declared' },
      { label: 'Модель голоса', value: '⟨заполнить: определяется соглашением сторон⟩', claim: 'declared' },
    ],
    gaps: [
      'DAO-страница платформы работает на модельных данных и служит демонстрацией механики, а не действующим контуром управления.',
      'Правовая квалификация DAO-решений в юрисдикциях региона не проработана — это открытый вопрос, а не решённый.',
    ],
    pricing: 'quote',
    pricingNote: 'состав ролей и регламент проектируются под конкретную схему управления',
    links: [{ href: '/dao', label: 'Посмотреть механику DAO-контура' }],
  },

  // ── ИИ ────────────────────────────────────────────────────────────
  {
    id: 'ai',
    chip: 'ИИ',
    icon: Brain,
    title: 'ИИ-слой',
    stage: 'concept',
    lead:
      'Три задачи, у которых разная зрелость и разная цена ошибки. Предиктивная диагностика — самая ценная и самая требовательная к данным: без размеченной истории отказов модель обучать не на чем. Поиск по корпусу документов даёт результат раньше всех и почти не требует подготовки.',
    points: [
      {
        title: 'Предиктивная диагностика оборудования',
        text: 'Раннее обнаружение развивающегося дефекта по вибрационной и параметрической картине до выхода за уставки. Опорная референция по классу задачи: AspenTech Aspen Mtell — на СПГ-объекте заявлено предупреждение об отказе компрессора за срок до 61 суток при стоимости события свыше 40 млн долларов. Это кейс вендора и приводится как кейс вендора: он показывает класс достижимого результата, а не наш результат.',
      },
      {
        title: 'Обработка телеметрии',
        text: 'Очистка потока, отсев сбоев датчиков, выделение режимов работы, обнаружение аномалий. Без этого слоя предиктив тратит себя на артефакты измерения.',
      },
      {
        title: 'Поиск по корпусу документов',
        text: 'Запрос на естественном языке по регламентам, паспортам, актам и предписаниям — с указанием документа и места, откуда взят ответ. Ответ без ссылки на источник в этом контуре считается не ответом.',
      },
      {
        title: 'Чего ИИ-слой не делает',
        text: 'Не принимает решений об остановке оборудования и не управляет процессом. Выход слоя — ранжированное предупреждение для специалиста, за которым остаётся решение.',
      },
    ],
    specs: [
      { label: 'Референция класса задачи', value: 'Aspen Mtell — до 61 сут. до отказа компрессора', claim: 'vendor' },
      { label: 'Стоимость предотвращённого события', value: 'свыше 40 млн долл. — по материалам вендора', claim: 'vendor' },
      { label: 'Опора на интерпретацию данных', value: 'ISO 13379-1:2025', claim: 'standard' },
      { label: 'Собственная обученная модель', value: '⟨нет⟩', claim: 'declared' },
      { label: 'Объём размеченной истории отказов', value: '⟨заполнить: предоставляется заказчиком⟩', claim: 'declared' },
      { label: 'Точность предиктива на парке заказчика', value: '⟨не измерена⟩', claim: 'declared' },
    ],
    gaps: [
      'Собственная предиктивная модель не обучена: обучающей выборки по парку заказчика нет до обследования.',
      'Заявлять горизонт предупреждения до пилота нельзя. Цифра вендора относится к его установке и его данным.',
    ],
    pricing: 'quote',
    pricingNote: 'считается после оценки объёма и качества исторических данных',
  },

  // ── Автоматизация ─────────────────────────────────────────────────
  {
    id: 'auto',
    chip: 'Автоматизация',
    icon: Workflow,
    title: 'Автоматизация процессов',
    stage: 'prototype',
    lead:
      'Сквозные маршруты вместо ручной пересылки: от заявки до акта, от показания до отчёта. Смысл не в скорости как таковой, а в том, что у каждого шага остаётся отметка — кто, когда, на каком основании. Это то же требование проверяемости, только применённое к процессу, а не к измерению.',
    points: [
      {
        title: 'Регламенты ТОиР',
        text: 'Планово-предупредительные работы, переход к обслуживанию по состоянию, привязка периодичности к наработке и к результатам контроля. Опорная рамка — ISO 17359 для общего порядка контроля состояния и ISO 14224 для структуры данных о надёжности.',
      },
      {
        title: 'Наряды-допуски',
        text: 'Маршрут оформления с проверкой действующих допусков бригады, аттестаций и совместимости работ на площадке. Просроченная аттестация блокирует выпуск наряда, а не обнаруживается постфактум.',
      },
      {
        title: 'Отчётность LDAR',
        text: 'Обнаружение, ремонт и подтверждение по циклу, который требует Регламент (ЕС) 2024/1787: не намерения, а обследования в срок и подтверждённые ремонты. Отчётные формы — под OGMP 2.0 и 40 CFR Part 60 Appendix K.',
      },
      {
        title: 'MRV-процесс',
        text: 'Измерение, отчётность и верификация как исполняемая процедура, а не письменная методология. Отраслевая референция механизма — Hedera Guardian; консорциум Blockchain for Energy с участием Chevron, ConocoPhillips, ExxonMobil и SLB вошёл в совет Hedera в июне 2025 года. Собственных выпущенных сертификатов MiQ у платформы нет.',
      },
    ],
    specs: [
      { label: 'Рамка контроля состояния', value: 'ISO 17359:2018', claim: 'standard' },
      { label: 'Структура данных о надёжности', value: 'ISO 14224:2016', claim: 'standard' },
      { label: 'Требование к LDAR', value: 'Regulation (EU) 2024/1787', claim: 'standard' },
      { label: 'Формы отчётности по метану', value: 'OGMP 2.0, 40 CFR Part 60 App. K', claim: 'standard' },
      { label: 'Выпущенных сертификатов MiQ', value: '⟨нет⟩', claim: 'declared' },
      { label: 'Срок автоматизации одного маршрута', value: '⟨определяется обследованием⟩', claim: 'declared' },
    ],
    gaps: [
      'Соответствие форм отчётности требованиям конкретного верификатора до приёмки не подтверждено.',
      'Перечень маршрутов, подлежащих автоматизации, формируется на обследовании и заранее не фиксируется.',
    ],
    pricing: 'subscription',
    pricingNote: 'расчёт по числу маршрутов и точек контроля',
    links: [{ href: '/oilgas', label: 'Услуги LDAR и контроля состояния в каталоге' }],
  },

  // ── Цифровой двойник ──────────────────────────────────────────────
  {
    id: 'twin',
    chip: 'Цифровой двойник',
    icon: Layers,
    title: 'Цифровой двойник актива',
    stage: 'concept',
    lead:
      'Двойник здесь — не трёхмерная картинка установки, а объект платформы, у которого сходятся геометрия, паспорт, живая телеметрия и история решений. Он полезен ровно настолько, насколько подключены предыдущие блоки: без телеметрии это макет, без CRM — макет с паспортом.',
    points: [
      {
        title: 'Связь с объектами платформы',
        text: 'Двойник строится поверх той же записи объекта, что показана на карте и глобусе, и наследует признак точности координаты. Отдельного реестра «объектов двойника» не заводится.',
      },
      {
        title: 'Что на нём видно',
        text: 'Текущее состояние по параметрическому и вибрационному контролю, открытые заявки и наряды, ближайшие работы по регламенту, связанные решения DAO-контура.',
      },
      {
        title: 'Существующая реализация на платформе',
        text: 'Страница двойника объекта существует в водном профиле — баланс, приток, сток, уровень для гидротехнического сооружения. Промысловый профиль (скважина, компрессорная, установка подготовки) на этой основе не реализован.',
      },
      {
        title: 'Отраслевые референции',
        text: 'Kongsberg Kognitwin Energy — рамочное соглашение с Shell, двойник Nyhamna в работе с января 2020 года, проекты ExxonMobil Guyana и Aker BP. Также AVEVA AIM и Visual APM, SLB Delfi совместно с Lumi и Petrel, Halliburton DecisionSpace 365. Это ориентиры зрелости класса решений, а не наши внедрения.',
      },
    ],
    specs: [
      { label: 'Референция класса', value: 'Kongsberg Kognitwin, Nyhamna с 01.2020', claim: 'independent' },
      { label: 'Прочие референции', value: 'AVEVA AIM / Visual APM, SLB Delfi, Halliburton DecisionSpace 365', claim: 'vendor' },
      { label: 'Реализовано на платформе', value: 'Двойник водного объекта (гидроузел, водохранилище)', claim: 'declared' },
      { label: 'Промысловый профиль двойника', value: '⟨не реализован⟩', claim: 'declared' },
      { label: 'Частота обновления телеметрии', value: '⟨заполнить: зависит от контура SCADA⟩', claim: 'declared' },
    ],
    gaps: [
      'Промысловый двойник — концепция. Показать сегодня можно только водный профиль на существующих объектах платформы.',
      'Трёхмерная модель установки требует исходных данных проектировщика; их наличие у заказчика не проверялось.',
    ],
    pricing: 'quote',
    pricingNote: 'объём зависит от глубины модели и состава подключённой телеметрии',
    links: [{ href: '/hub/objects', label: 'Объекты платформы — существующие двойники' }],
  },
];

/** Дорожная карта внедрения. */
const ROADMAP: {
  n: string;
  title: string;
  body: string;
  result: string;
  stage: Stage;
  term: string;
}[] = [
  {
    n: '00',
    title: 'Обследование контура',
    body: 'Инвентаризация систем компании, парка оборудования и точек телеметрии. Отдельно фиксируется качество исторических данных: без него нельзя ни планировать сроки, ни обещать предиктив.',
    result: 'Карта систем и данных, перечень маршрутов, оценка объёма работ.',
    stage: 'deployed',
    term: 'по договорённости',
  },
  {
    n: '01',
    title: 'Один передел, один промысел',
    body: 'Пилот ставится на ограниченный контур: одна площадка, один вид работ. Расширение до пилотного результата не начинается — это правило, а не осторожность.',
    result: 'Работающая CRM-часть и реестр активов на выбранном контуре.',
    stage: 'pilot',
    term: '⟨определяется обследованием⟩',
  },
  {
    n: '02',
    title: 'Подключение телеметрии',
    body: 'Чтение параметрического потока со SCADA пилотной площадки. Только чтение: платформа не входит в контур управления технологическим процессом.',
    result: 'Живые данные на карточке объекта и в двойнике.',
    stage: 'prototype',
    term: '⟨определяется обследованием⟩',
  },
  {
    n: '03',
    title: 'Контроль состояния и предиктив',
    body: 'Постановка схемы точек контроля и порогов по ISO 17359 и ISO 20816 — это отработанная услуга. Обучение предиктивных моделей начинается только после накопления размеченной истории.',
    result: 'Регламент реагирования; предиктив — при достаточности данных.',
    stage: 'concept',
    term: '⟨зависит от объёма истории отказов⟩',
  },
  {
    n: '04',
    title: 'Автоматизация маршрутов и отчётности',
    body: 'Сквозные процессы от заявки до акта, от показания до отчёта. Отчётность LDAR/MRV подключается к уже идущему потоку данных.',
    result: 'Автоматически формируемые отчётные формы с прослеживаемым основанием.',
    stage: 'prototype',
    term: '⟨определяется обследованием⟩',
  },
  {
    n: '05',
    title: 'DAO-контур решений',
    body: 'Подключается последним и осознанно: пока нет данных и процессов, голосовать не о чем. Требует отдельной правовой проработки в юрисдикции компании.',
    result: 'Роли, регламенты голосования, аудит-след решений.',
    stage: 'concept',
    term: '⟨правовая проработка не выполнена⟩',
  },
  {
    n: '06',
    title: 'Расширение на остальные переделы',
    body: 'Тиражирование отработанного контура. Объём и очерёдность определяются результатом пилота, а не планом, составленным до него.',
    result: 'Единый контур компании.',
    stage: 'concept',
    term: '⟨заполнить⟩',
  },
];

// ─────────────────────────────────────────────────────────────────────
//  Карточка коннектора
// ─────────────────────────────────────────────────────────────────────

function ConnectorCard({ c }: { c: Connector }) {
  const Icon = c.icon;
  return (
    <div
      className="rounded-xl border p-4"
      style={{ borderColor: 'rgba(148,163,184,0.16)', background: 'rgba(2,10,26,0.5)' }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${ACCENT}1a`, color: ACCENT }}
        >
          <Icon size={17} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <h4 className="text-[14.5px] font-semibold text-slate-100">{c.title}</h4>
            <StageBadge stage={c.stage} />
          </div>
          <p className="text-[13px] text-slate-400 leading-relaxed">{c.what}</p>
          <p className="text-[12px] text-slate-500 leading-relaxed mt-2">{c.protocol}</p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
//  Страница
// ─────────────────────────────────────────────────────────────────────

export default function OilGasIntegrationPage() {
  const [tab, setTab] = useState<'contour' | 'blocks' | 'rollout'>('contour');
  const [blockId, setBlockId] = useState<string>('crm');
  const [openGaps, setOpenGaps] = useState(true);

  const block = BLOCKS.find((b) => b.id === blockId) ?? BLOCKS[0];
  const BlockIcon = block.icon;

  return (
    <div className="min-h-screen text-slate-200">
      {/* ── Шапка ───────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden border-b"
        style={{
          borderColor: `${ACCENT}22`,
          background: 'linear-gradient(160deg, rgba(251,146,60,0.10), rgba(2,8,23,0) 60%)',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <Link
            href="/oilgas"
            className="inline-flex items-center gap-1.5 text-[12px] text-slate-400 hover:text-slate-200 transition-colors mb-5"
          >
            <ArrowLeft size={13} /> Модуль «Газнефть»
          </Link>

          <div className="flex items-center gap-2 mb-4">
            <Flame size={18} style={{ color: ACCENT }} />
            <span className="text-[11px] font-bold tracking-[0.18em] uppercase" style={{ color: ACCENT }}>
              Газнефть · Интеграционный модуль
            </span>
            <span className="text-[10px] text-slate-500 font-mono">OG-SV-INTEG-001</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold text-white leading-tight max-w-3xl">
            Единый контур для компании, где сервис, подряд, сбыт и собственная добыча живут вместе
          </h1>
          <p className="text-[14px] sm:text-base text-slate-400 mt-4 max-w-2xl leading-relaxed">
            CRM промыслового профиля, DAO-слой решений, ИИ-предиктив, автоматизация регламентов
            и цифровой двойник актива — на одной базе объектов. Ниже у каждого блока названа
            его настоящая стадия: большинство из них — концепция или прототип.
          </p>

          <div className="flex flex-wrap gap-6 mt-8">
            {[
              { v: '5', l: 'функциональных блоков' },
              { v: '6', l: 'точек подключения' },
              { v: '7', l: 'этапов внедрения' },
            ].map((s) => (
              <div key={s.l}>
                <div className="text-2xl sm:text-3xl font-bold" style={{ color: ACCENT }}>{s.v}</div>
                <div className="text-[11px] text-slate-500 uppercase tracking-wide mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 mt-8">
            <button
              onClick={() => setTab('rollout')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-semibold text-slate-900"
              style={{ background: ACCENT }}
            >
              <Milestone size={15} /> Этапы внедрения
            </button>
            <Link
              href="/oilgas"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-semibold border text-slate-200"
              style={{ borderColor: 'rgba(148,163,184,0.28)' }}
            >
              <Boxes size={15} /> Каталог модуля
            </Link>
          </div>
        </div>
      </div>

      {/* ── Вкладки ─────────────────────────────────────────────── */}
      <div
        className="sticky top-0 z-20 border-b backdrop-blur"
        style={{ borderColor: 'rgba(148,163,184,0.14)', background: 'rgba(2,8,23,0.86)' }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex gap-1 overflow-x-auto">
          {([
            ['contour', 'Контур интеграции', Plug],
            ['blocks', 'Функциональные блоки', Layers],
            ['rollout', 'Внедрение', Milestone],
          ] as const).map(([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="px-4 py-3.5 text-[13px] font-semibold whitespace-nowrap inline-flex items-center gap-2 border-b-2 transition-colors"
              style={{
                color: tab === id ? ACCENT : '#94a3b8',
                borderColor: tab === id ? ACCENT : 'transparent',
              }}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* ── Контур интеграции ─────────────────────────────────── */}
        {tab === 'contour' && (
          <div>
            <div className="max-w-3xl mb-8">
              <p className="text-[14px] text-slate-400 leading-[1.75]">
                Профиль заказчика определяет архитектуру. Компания, у которой сервис, подряд, сбыт
                и собственная разработка живут в одном юридическом лице, обычно ведёт их в четырёх
                несвязанных системах — и теряет на стыках больше, чем внутри каждой. Контур
                интеграции описывает две стороны обмена: что подключается со стороны компании и
                что платформа отдаёт обратно.
              </p>
            </div>

            {/* Вход */}
            <div className="flex items-center gap-2 mb-4">
              <Database size={15} style={{ color: ACCENT }} />
              <h2 className="text-[15px] font-bold text-slate-100">Со стороны компании</h2>
              <span className="text-[11px] text-slate-500">{INBOUND.length} точки подключения</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {INBOUND.map((c) => (
                <ConnectorCard key={c.title} c={c} />
              ))}
            </div>

            {/* Выход */}
            <div className="flex items-center gap-2 mt-10 mb-4">
              <Link2 size={15} style={{ color: ACCENT }} />
              <h2 className="text-[15px] font-bold text-slate-100">Что даёт платформа</h2>
            </div>
            <div className="grid gap-3">
              {OUTBOUND.map((o) => {
                const Icon = o.icon;
                return (
                  <div
                    key={o.title}
                    className="rounded-xl border p-4 sm:p-5 flex items-start gap-3.5"
                    style={{ borderColor: 'rgba(148,163,184,0.16)', background: 'rgba(2,10,26,0.5)' }}
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${ACCENT}1a`, color: ACCENT }}
                    >
                      <Icon size={17} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <h4 className="text-[14.5px] font-semibold text-slate-100">{o.title}</h4>
                        <StageBadge stage={o.stage} />
                      </div>
                      <p className="text-[13px] text-slate-400 leading-relaxed">{o.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Границы контура */}
            <div
              className="rounded-xl border p-5 mt-8 flex gap-3.5"
              style={{ borderColor: 'rgba(251,191,36,0.28)', background: 'rgba(251,191,36,0.06)' }}
            >
              <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-[13.5px] font-semibold text-amber-200 mb-1.5">
                  Границы контура
                </div>
                <ul className="text-[13px] text-slate-400 leading-relaxed space-y-1.5">
                  <li>
                    Платформа читает технологические данные, но не управляет процессом: в контур
                    противоаварийной защиты и регулирования она не входит.
                  </li>
                  <li>
                    Перечень действующих систем компании до обследования неизвестен, поэтому
                    коннекторы описаны по классам систем, а не по конкретным продуктам —
                    ⟨заполнить по результатам обследования⟩.
                  </li>
                  <li>
                    Собственная сеть узлов запечатывания измерений на объектах заказчика не
                    развёрнута. Механизм описан в whitepaper модуля как проектный.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ── Функциональные блоки ──────────────────────────────── */}
        {tab === 'blocks' && (
          <div>
            {/* Чипы разделов — как в каталоге модуля */}
            <div className="flex flex-wrap gap-2 mb-6">
              {BLOCKS.map((b) => {
                const Icon = b.icon;
                const on = blockId === b.id;
                return (
                  <button
                    key={b.id}
                    onClick={() => setBlockId(b.id)}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-[12.5px] font-semibold border transition-colors"
                    style={{
                      color: on ? ACCENT : '#94a3b8',
                      borderColor: on ? `${ACCENT}55` : 'rgba(148,163,184,0.18)',
                      background: on ? `${ACCENT}12` : 'transparent',
                    }}
                  >
                    <Icon size={14} /> {b.chip}
                  </button>
                );
              })}
            </div>

            <div
              className="rounded-xl border p-5 sm:p-6"
              style={{ borderColor: `${ACCENT}33`, background: 'rgba(2,10,26,0.6)' }}
            >
              <div className="flex items-start gap-3.5 mb-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${ACCENT}1a`, color: ACCENT }}
                >
                  <BlockIcon size={19} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">{block.title}</h2>
                    <StageBadge stage={block.stage} />
                  </div>
                  <p className="text-[13.5px] text-slate-400 leading-relaxed mt-2">{block.lead}</p>
                </div>
              </div>

              {/* Пункты блока */}
              <div className="grid gap-3 mt-6">
                {block.points.map((p) => (
                  <div
                    key={p.title}
                    className="rounded-lg border p-4"
                    style={{ borderColor: 'rgba(148,163,184,0.14)', background: 'rgba(2,8,23,0.5)' }}
                  >
                    <div className="flex items-start gap-2.5">
                      <ChevronRight size={15} className="shrink-0 mt-0.5" style={{ color: `${ACCENT}aa` }} />
                      <div>
                        <h4 className="text-[14px] font-semibold text-slate-100 mb-1">{p.title}</h4>
                        <p className="text-[13px] text-slate-400 leading-relaxed">{p.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Параметры с основанием */}
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-2">
                  <ClipboardCheck size={14} className="text-slate-500" />
                  <span className="text-[12px] font-semibold text-slate-400 uppercase tracking-wide">
                    Параметры и основания
                  </span>
                </div>
                <div className="space-y-1.5">
                  {block.specs.map((s) => (
                    <SpecRow key={s.label} label={s.label} value={s.value} claim={s.claim} />
                  ))}
                </div>
              </div>

              {/* Чего нет */}
              <div
                className="rounded-lg border p-4 mt-6"
                style={{ borderColor: 'rgba(148,163,184,0.2)', background: 'rgba(148,163,184,0.05)' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={14} className="text-slate-400" />
                  <span className="text-[12.5px] font-semibold text-slate-300">Чего в этом блоке нет</span>
                </div>
                <ul className="space-y-1.5">
                  {block.gaps.map((g) => (
                    <li key={g} className="text-[12.5px] text-slate-400 leading-relaxed pl-3.5 relative">
                      <span className="absolute left-0 top-[0.55em] w-1 h-1 rounded-full bg-slate-600" />
                      {g}
                    </li>
                  ))}
                </ul>
              </div>

              <PricingNote pricing={block.pricing} note={block.pricingNote} />

              {block.links && block.links.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {block.links.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold px-3 py-1.5 rounded-lg border transition-colors"
                      style={{ borderColor: 'rgba(148,163,184,0.24)', color: '#cbd5e1' }}
                    >
                      {l.label} <ArrowRight size={13} />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Мониторинг активов — сквозной слой под всеми блоками */}
            <div
              className="rounded-xl border p-5 mt-6 flex gap-3.5"
              style={{ borderColor: 'rgba(34,211,238,0.24)', background: 'rgba(34,211,238,0.05)' }}
            >
              <Activity size={18} className="text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-[13.5px] font-semibold text-cyan-200 mb-1.5">
                  Мониторинг активов — общий слой под всеми пятью блоками
                </div>
                <p className="text-[13px] text-slate-400 leading-relaxed">
                  Состояние оборудования по вибрационной и параметрической картине, утечки метана
                  тремя слоями от спутника до площадочного датчика, целостность трасс распределённым
                  акустическим контролем. Нормативная опора — ISO 17359, ISO 20816, ISO 13373,
                  ISO 13379-1. Постановка контроля существует как отдельная услуга каталога и
                  помечена там как находящаяся в эксплуатации; всё остальное в этом контуре питается
                  её данными. Отдельно оговорено в whitepaper модуля: ни один стандарт ISO или API
                  не квалифицирует характеристики распределённого акустического контроля в задаче
                  обнаружения утечек — вендорские пороги проверяются только приёмкой на конкретной
                  трассе.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Внедрение ─────────────────────────────────────────── */}
        {tab === 'rollout' && (
          <div>
            <div className="max-w-3xl mb-8">
              <p className="text-[14px] text-slate-400 leading-[1.75]">
                Порядок этапов не произволен: каждый следующий опирается на данные, которые
                появляются только на предыдущем. Предиктив невозможен без телеметрии и истории
                отказов, DAO-контур бессмыслен без процессов, о которых голосовать. Сроки в
                таблице ниже не проставлены там, где их нельзя назвать до обследования.
              </p>
            </div>

            <div className="relative">
              {ROADMAP.map((r, i) => (
                <div key={r.n} className="relative pl-8 sm:pl-10 pb-6">
                  {/* линия */}
                  {i < ROADMAP.length - 1 && (
                    <div
                      className="absolute left-[11px] sm:left-[13px] top-6 bottom-0 w-px"
                      style={{ background: 'rgba(148,163,184,0.2)' }}
                    />
                  )}
                  {/* маркер */}
                  <div
                    className="absolute left-0 top-1 w-[23px] h-[23px] sm:w-[27px] sm:h-[27px] rounded-full flex items-center justify-center text-[10px] font-mono font-bold"
                    style={{
                      background: 'rgba(2,8,23,1)',
                      border: `1px solid ${STAGE_COLOR[r.stage]}66`,
                      color: STAGE_COLOR[r.stage],
                    }}
                  >
                    {r.n}
                  </div>

                  <div
                    className="rounded-xl border p-4 sm:p-5"
                    style={{ borderColor: 'rgba(148,163,184,0.16)', background: 'rgba(2,10,26,0.5)' }}
                  >
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="text-[15px] font-semibold text-slate-100">{r.title}</h3>
                      <StageBadge stage={r.stage} />
                    </div>
                    <p className="text-[13px] text-slate-400 leading-relaxed">{r.body}</p>

                    <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
                      <div className="flex items-start gap-2 text-[12.5px]">
                        <CheckCircle2 size={13} className="shrink-0 mt-0.5 text-slate-600" />
                        <span className="text-slate-500">
                          Результат: <span className="text-slate-300">{r.result}</span>
                        </span>
                      </div>
                      <div className="flex items-start gap-2 text-[12.5px]">
                        <Timer size={13} className="shrink-0 mt-0.5 text-slate-600" />
                        <span className="text-slate-500">
                          Срок: <span className="text-slate-300">{r.term}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Условия и цена */}
            <div
              className="rounded-xl border p-5 mt-4"
              style={{ borderColor: `${ACCENT}33`, background: `${ACCENT}0a` }}
            >
              <div className="flex items-center gap-2 mb-3">
                <FileText size={15} style={{ color: ACCENT }} />
                <h3 className="text-[14px] font-bold text-slate-100">Как считается стоимость</h3>
              </div>
              <div className="space-y-1.5">
                <SpecRow label="Интеграционный контур в целом" value={PRICING_LABEL.quote} claim="declared" />
                <SpecRow label="CRM и автоматизация маршрутов" value={PRICING_LABEL.subscription} claim="declared" />
                <SpecRow label="Совместные исследовательские работы" value={PRICING_LABEL.grant} claim="declared" />
                <SpecRow label="Стоимость до обследования" value="⟨не называется⟩" claim="declared" />
              </div>
              <p className="text-[12.5px] text-slate-400 leading-relaxed mt-4">
                В отрасли почти всё считается под конкретную площадку, поэтому здесь стоит честное
                «по запросу», а не подставленное правдоподобное число. Смета собирается по
                результатам обследования контура — этапа 00.
              </p>
            </div>

            {/* Дисциплина корпуса */}
            <div className="mt-6">
              <button
                onClick={() => setOpenGaps((v) => !v)}
                className="w-full rounded-xl border p-4 sm:p-5 text-left flex items-start gap-3.5"
                style={{ borderColor: 'rgba(251,191,36,0.28)', background: 'rgba(251,191,36,0.06)' }}
              >
                <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-[13.5px] font-semibold text-amber-200">
                    О статусе заявлений на этой странице
                  </div>
                  {openGaps && (
                    <div className="text-[13px] text-slate-400 leading-relaxed mt-2 space-y-2">
                      <p>
                        Карточка каталога OG-SV-INTEG-001 помечена как пилот — это стадия программы
                        в целом. Отдельные её блоки на этой странице показаны на своей собственной
                        стадии, и большинство из них — концепция или прототип. Противоречия здесь
                        нет: пилотная программа состоит в том числе из непроверенных частей, и
                        честнее показать это, чем усреднить.
                      </p>
                      <p>
                        Показатели рыночных решений — Aspen Mtell, Kongsberg Kognitwin, AVEVA, SLB,
                        Halliburton — взяты из материалов производителей и подписаны как заявления
                        вендора. Они обозначают класс достижимого результата на чужих установках,
                        а не результат, полученный этой платформой.
                      </p>
                      <p>
                        Незаполненные параметры оставлены незаполненными и помечены знаком
                        ⟨заполнить⟩. Они закрываются на обследовании контура, а не догадкой.
                      </p>
                    </div>
                  )}
                </div>
                <ChevronDown
                  size={16}
                  className="text-amber-400/60 shrink-0 mt-1 transition-transform"
                  style={{ transform: openGaps ? 'rotate(180deg)' : 'none' }}
                />
              </button>
            </div>

            {/* Переходы */}
            <div className="flex flex-wrap gap-3 mt-8">
              <Link
                href="/oilgas"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-semibold text-slate-900"
                style={{ background: ACCENT }}
              >
                <Boxes size={15} /> Каталог модуля «Газнефть»
              </Link>
              <Link
                href="/contacts"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-semibold border text-slate-200"
                style={{ borderColor: 'rgba(148,163,184,0.28)' }}
              >
                <Users2 size={15} /> Обсудить обследование контура
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
