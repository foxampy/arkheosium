/**
 * OilGasPage — модуль «Газнефть».
 *
 * Три слоя на одной странице, потому что читатель приходит в разном
 * состоянии: онбординг для того, кто здесь впервые; whitepaper для того,
 * кто решает, стоит ли иметь дело; каталог для того, кто уже выбирает.
 *
 * Правило отображения, наследуемое от водного модуля: у каждого числа
 * видно основание. Заявление вендора подписано как заявление вендора,
 * норматив — как норматив. Пустое место, где данных нет, показывается
 * пустым, а не заполняется правдоподобным.
 */

import { useState } from 'react';
import { Link } from 'wouter';
import {
  Flame, Map as MapIcon, Globe2, ShieldCheck, Radio, Waves, Activity,
  ChevronRight, ChevronDown, ArrowRight, FileText, Boxes, Wrench,
  Handshake, Package, FolderKanban, AlertTriangle, Workflow,
} from 'lucide-react';
import {
  OILGAS_CATALOG_SECTIONS, OILGAS_PROJECT_CORPUS,
  STAGE_LABEL, CLAIM_LABEL, PRICING_LABEL,
  type CatalogItem,
} from '@/data/oilgas/catalog';
import { OILGAS_OBJECTS } from '@/data/objects/oilgas-objects';
import { OILGAS_OBJECTS_EXT } from '@/data/objects/oilgas-objects-ext';
import { OILGAS_OBJECTS_UZ } from '@/data/objects/oilgas-objects-uz';

const ACCENT = '#fb923c';

/**
 * Статусы нефтегазовых записей корпуса. Отдельная шкала: «объявлен» и
 * «приостановлен» здесь не украшения, а результат разбора источников —
 * проект, одобренный девять лет назад и стоящий под уголовным делом,
 * называется приостановленным, а не «в реализации».
 */
/** Русское склонение при числе: 21 проект, 24 проекта, 25 проектов. */
function plural(n: number, one: string, few: string, many: string): string {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m100 >= 11 && m100 <= 14) return many;
  if (m10 === 1) return one;
  if (m10 >= 2 && m10 <= 4) return few;
  return many;
}

const PROJECT_STATUS_LABEL: Record<string, string> = {
  announced: 'Объявлен',
  commissioned: 'Введён в эксплуатацию',
  commitment: 'Обязательство',
  in_construction: 'Строится',
  program_ongoing: 'Программа действует',
  stalled: 'Приостановлен',
};

const SECTION_ICON: Record<string, typeof Boxes> = {
  rd: Boxes,
  methods: Workflow,
  equipment: Wrench,
  services: Handshake,
  products: Package,
  projects: FolderKanban,
};

const ORIGIN_LABEL: Record<CatalogItem['origin'], string> = {
  labforge: 'LabForge',
  arkheos: 'ArkheOSium',
  market: 'Рынок',
};

const ORIGIN_COLOR: Record<CatalogItem['origin'], string> = {
  labforge: '#f472b6',
  arkheos: '#22d3ee',
  market: '#94a3b8',
};

const STAGE_COLOR: Record<CatalogItem['stage'], string> = {
  concept: '#94a3b8',
  prototype: '#a78bfa',
  pilot: '#fbbf24',
  deployed: '#34d399',
  reference: '#64748b',
};

// ── Онбординг: пять шагов, каждый отвечает на один вопрос ────────────

const ONBOARDING = [
  {
    icon: Globe2,
    title: 'Где мы смотрим',
    text: 'Глобус и карта платформы уже несут водные данные Центральной Азии. Нефтегазовый слой встал рядом, в той же геометрии и с той же группировкой: макрорегион, страна, область — в зависимости от масштаба. Это один атлас границ, а не два похожих.',
  },
  {
    icon: MapIcon,
    title: 'Что уже в базе',
    text: 'Месторождения, переделы, хранилища и магистрали Узбекистана, Казахстана, Туркменистана, Киргизии и Таджикистана. У каждой точки указано, насколько точно известно место: съёмочная координата, центр контура месторождения, привязка к посёлку или только область.',
  },
  {
    icon: Activity,
    title: 'Что мы измеряем',
    text: 'Состояние оборудования по вибро-волновой картине, утечки метана тремя слоями от спутника до площадочного датчика, целостность трасс распределённым акустическим контролем, попутную воду на возврат в оборот.',
  },
  {
    icon: ShieldCheck,
    title: 'Почему этому можно верить',
    text: 'Измерение запечатывается хэшем в момент снятия, на краю сети, и связывается с эмитированным инструментом. Спор о цифре превращается из спора о доверии в проверку цепочки.',
  },
  {
    icon: Handshake,
    title: 'Как это внедряется',
    text: 'Единый контур для компании, у которой сервис, подряд, сбыт и собственная добыча живут вместе: CRM промыслового профиля, DAO-слой решений, ИИ-предиктив, автоматизация и цифровой двойник. Поэтапно — сначала один передел, потом расширение.',
  },
];

// ── Whitepaper: тезисы ───────────────────────────────────────────────

const WHITEPAPER = [
  {
    n: '01',
    title: 'Проблема не в добыче, а в проверяемости',
    body: 'Отчётность по выбросам, добыче и состоянию фонда проверяется по документам, которые составляет тот, кого проверяют. Пока цепочка от датчика до отчёта не проверяема независимо, любая цифра остаётся вопросом доверия к источнику. Регулирование это уже догнало: Регламент (ЕС) 2024/1787 требует не намерений, а обследований в срок и подтверждённых ремонтов.',
  },
  {
    n: '02',
    title: 'Данные региона хуже, чем кажется',
    body: 'Отраслевые базы тиражируют координаты юридических адресов вместо координат активов: по Устюртскому ГХК в открытых источниках встречается точка центра Ташкента — примерно в тысяче километров от комплекса. Запасы Газли называются как 470, 500, 700 и 714 млрд м³ одновременно. Такие данные хуже отсутствующих, потому что выглядят данными.',
  },
  {
    n: '03',
    title: 'Ответ — явная точность вместо мнимой',
    body: 'Каждый объект в базе несёт признак точности координаты. Расхождения источников не устраняются выбором одной цифры: если четыре источника называют разные запасы, в записи остаются все четыре. Это делает базу менее гладкой и более пригодной для решений.',
  },
  {
    n: '04',
    title: 'Измерять там, где сигнал ещё не потерян',
    body: 'Штатная вибродиагностика видит то, что дошло до посадочного места датчика. Разработка LabForge снимает волновую картину распределённо — через прошивающую проводящую сетку. Это гипотеза, а не результат: до сопоставительных испытаний против схемы по ISO 20816 преимущество нужно измерить, а не заявить.',
  },
  {
    n: '05',
    title: 'Запечатывать в момент снятия, а не на сервере',
    body: 'Если хэш считается на сервере, доверять приходится каналу и серверу. Если на краю, в момент снятия, — переписать показание задним числом нельзя, не сломав цепочку. Механизм не изобретается: Hedera Guardian превращает письменную методологию в исполняемый MRV-процесс, а консорциум Blockchain for Energy с Chevron, ConocoPhillips, ExxonMobil и SLB вошёл в совет Hedera в июне 2025 года.',
  },
  {
    n: '06',
    title: 'Нефтегаз и вода — один модуль, а не два',
    body: 'Попутная вода — крупнейший по объёму поток отходов промысла. В регионе, где бассейн уже пересыхает, вода, возвращённая в оборот на месторождении, — это вода, не взятая из реки. Поэтому нефтегазовый слой встроен в ту же платформу, что и водный, а не поставлен рядом.',
  },
  {
    n: '07',
    title: 'Чего мы не утверждаем',
    body: 'Публично документированной DePIN-сети сенсоров именно в нефтегазовых измерениях не существует — это пробел, а не наш продукт. Ни один стандарт ISO или API не квалифицирует характеристики DAS в задаче обнаружения утечек: вендорские пороги проверяются только приёмкой на конкретной трассе. MethaneSAT недоступен — связь с аппаратом потеряна 20 июня 2025 года. Собственная сеть узлов не развёрнута, сертификатов MiQ не выпущено.',
  },
];

// ── Карточка каталога ────────────────────────────────────────────────

function CatalogCard({ item }: { item: CatalogItem }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="rounded-xl border transition-colors"
      style={{
        borderColor: open ? `${ACCENT}66` : 'rgba(148,163,184,0.18)',
        background: 'rgba(2,10,26,0.6)',
      }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left p-4 sm:p-5 flex items-start gap-3"
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ color: ORIGIN_COLOR[item.origin], border: `1px solid ${ORIGIN_COLOR[item.origin]}55` }}
            >
              {ORIGIN_LABEL[item.origin]}
            </span>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ color: STAGE_COLOR[item.stage], border: `1px solid ${STAGE_COLOR[item.stage]}55` }}
            >
              {STAGE_LABEL[item.stage]}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">{item.id}</span>
          </div>
          <h4 className="text-[15px] sm:text-base font-semibold text-slate-100 leading-snug">
            {item.title}
          </h4>
          <p className="text-[13px] text-slate-400 mt-1 leading-relaxed">{item.summary}</p>
        </div>
        <ChevronDown
          size={18}
          className="text-slate-500 shrink-0 mt-1 transition-transform"
          style={{ transform: open ? 'rotate(180deg)' : 'none' }}
        />
      </button>

      {open && (
        <div className="px-4 sm:px-5 pb-5 -mt-1">
          <div className="border-t pt-4" style={{ borderColor: 'rgba(148,163,184,0.14)' }}>
            {item.description.split('\n\n').map((para, i) => (
              <p key={i} className="text-[13.5px] text-slate-300 leading-relaxed mb-3 whitespace-pre-line">
                {para}
              </p>
            ))}

            {item.specs && item.specs.length > 0 && (
              <div className="mt-4 space-y-1.5">
                {item.specs.map((s, i) => (
                  <div
                    key={i}
                    className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-[12.5px] py-1.5 border-b"
                    style={{ borderColor: 'rgba(148,163,184,0.08)' }}
                  >
                    <span className="text-slate-500 min-w-[150px]">{s.label}</span>
                    <span className="text-slate-200 font-medium flex-1">{s.value}</span>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded"
                      style={{
                        color: s.claim === 'standard' ? '#34d399'
                          : s.claim === 'independent' ? '#22d3ee'
                            : s.claim === 'vendor' ? '#fbbf24' : '#94a3b8',
                        background: 'rgba(148,163,184,0.08)',
                      }}
                    >
                      {CLAIM_LABEL[s.claim]}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {item.standards && item.standards.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {item.standards.map((s) => (
                  <span
                    key={s}
                    className="text-[10.5px] px-2 py-1 rounded font-mono text-emerald-300/80"
                    style={{ background: 'rgba(52,211,153,0.08)' }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}

            {/* Источники. Пустой массив — тоже сведение: значит, проверяемого
                документа под утверждением нет, и это видно читателю. */}
            {item.sources && item.sources.length > 0 && (
              <div className="mt-4">
                <div className="text-[10.5px] uppercase tracking-wider text-slate-500 mb-1.5">
                  Источники
                </div>
                <ul className="space-y-1">
                  {item.sources.map((src, i) => (
                    <li key={i} className="text-[11.5px] text-slate-400 leading-relaxed pl-3 relative">
                      <span className="absolute left-0 text-slate-600">·</span>
                      {src}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div
              className="mt-4 text-[12px] px-3 py-2 rounded-lg inline-flex items-center gap-2"
              style={{ background: `${ACCENT}12`, color: ACCENT }}
            >
              <FileText size={13} />
              {PRICING_LABEL[item.pricing]}
            </div>
          </div>
        </div>
      )}

      {/* Интеграционный модуль раскрыт в отдельную витрину — переход виден
          независимо от того, развёрнута карточка или нет. */}
      {item.id === 'OG-SV-INTEG-001' && (
        <div className="px-4 sm:px-5 pb-4">
          <Link
            href="/oilgas/integration"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-[12.5px] font-semibold text-slate-900"
            style={{ background: ACCENT }}
          >
            Открыть страницу интеграционного модуля
            <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* Токенизация измерений раскрыта в отдельную страницу — там модель
          хэш-ноды, схема эмиссии и оговорка о нефинансовом характере. */}
      {item.id === 'OG-RD-HASH-001' && (
        <div className="px-4 sm:px-5 pb-4">
          <Link
            href="/tokenization"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-[12.5px] font-semibold text-slate-900"
            style={{ background: '#22d3ee' }}
          >
            Открыть страницу токенизации измерений
            <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}

// ── Страница ─────────────────────────────────────────────────────────

export default function OilGasPage() {
  const [tab, setTab] = useState<'onboarding' | 'whitepaper' | 'catalog'>('onboarding');
  const [step, setStep] = useState(0);
  const [section, setSection] = useState<string>('rd');

  // Счётчик берётся из корпуса, а не из одного файла: узбекский набор
  // добавился отдельным файлом, и без него страница показывала 56 при 96 на глобусе.
  const allObjects = [...OILGAS_OBJECTS, ...OILGAS_OBJECTS_EXT, ...OILGAS_OBJECTS_UZ];
  const totalObjects = allObjects.length;
  const countries = new Set(allObjects.map((o) => o.country_code as string)).size;
  const exactCount = allObjects.filter((o) => o.coord_precision === 'exact').length;

  const active = OILGAS_CATALOG_SECTIONS.find((s) => s.id === section) ?? OILGAS_CATALOG_SECTIONS[0];

  return (
    <div className="min-h-screen text-slate-200">
      {/* Шапка */}
      <div
        className="relative overflow-hidden border-b"
        style={{ borderColor: `${ACCENT}22`, background: 'linear-gradient(160deg, rgba(251,146,60,0.10), rgba(2,8,23,0) 60%)' }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="flex items-center gap-2 mb-4">
            <Flame size={18} style={{ color: ACCENT }} />
            <span className="text-[11px] font-bold tracking-[0.18em] uppercase" style={{ color: ACCENT }}>
              Модуль · Газнефть
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-white leading-tight max-w-3xl">
            Нефть, газ и экология Центральной Азии — с проверяемой цифрой
          </h1>
          <p className="text-[14px] sm:text-base text-slate-400 mt-4 max-w-2xl leading-relaxed">
            Объекты региона на карте и глобусе с явной точностью координаты, контроль состояния
            оборудования и метана, запечатывание измерений в момент снятия. Всё, что заявлено
            вендором, подписано как заявление вендора.
          </p>

          <div className="flex flex-wrap gap-6 mt-8">
            {[
              { v: String(totalObjects), l: 'объектов в базе' },
              { v: String(countries), l: 'стран региона' },
              { v: String(exactCount), l: 'с подтверждённой координатой' },
            ].map((s) => (
              <div key={s.l}>
                <div className="text-2xl sm:text-3xl font-bold" style={{ color: ACCENT }}>{s.v}</div>
                <div className="text-[11px] text-slate-500 uppercase tracking-wide mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 mt-8">
            <Link
              href="/map"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-semibold text-slate-900"
              style={{ background: ACCENT }}
            >
              <MapIcon size={15} /> Открыть на карте
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-semibold border text-slate-200"
              style={{ borderColor: 'rgba(148,163,184,0.28)' }}
            >
              <Globe2 size={15} /> На глобусе
            </Link>
          </div>

          {/* Остальные страницы отраслевого куста.

              Переходы на интеграционный контур и токенизацию на странице
              были, но лежали внутри карточек каталога и показывались
              только при совпадении идентификатора позиции — то есть
              только тому, кто уже нашёл нужную карточку и раскрыл её.
              Вибродиагностика и каталог оборудования не были связаны
              с этой страницей ничем. Модуль, части которого не знают
              друг о друге, читается как набор отдельных страниц. */}
          <div className="mt-8 pt-6 border-t" style={{ borderColor: 'rgba(148,163,184,0.14)' }}>
            <div className="text-[11px] uppercase tracking-wider text-slate-500 mb-3">
              Остальные части модуля
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {[
                { to: '/oilgas/integration', t: 'Интеграционный контур', d: 'Телеметрия, ТОиР, наряд-допуск, LDAR/MRV — как модуль встраивается в работающее предприятие' },
                { to: '/diagnostics', t: 'Вибродиагностика', d: 'Состояние насосов, компрессоров и редукторов по спектру и огибающей; ISO 20816' },
                { to: '/catalog', t: 'Каталог оборудования', d: 'Технологии и оборудование позициями, с условиями поставки' },
                { to: '/tokenization', t: 'Токенизация измерений', d: 'Запечатывание измерения хэшем: что именно подтверждается, а что нет' },
              ].map((x) => (
                <Link
                  key={x.to}
                  href={x.to}
                  className="block px-3.5 py-3 rounded-xl border transition-colors hover:border-orange-400/40"
                  style={{ borderColor: 'rgba(148,163,184,0.18)', background: 'rgba(148,163,184,0.04)' }}
                >
                  <div className="text-[13px] font-semibold text-slate-200 flex items-center gap-1.5">
                    {x.t} <ArrowRight size={12} className="opacity-50" />
                  </div>
                  <div className="text-[11.5px] text-slate-500 mt-1 leading-snug">{x.d}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Вкладки */}
      <div className="sticky top-0 z-20 border-b backdrop-blur" style={{ borderColor: 'rgba(148,163,184,0.14)', background: 'rgba(2,8,23,0.86)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex gap-1 overflow-x-auto">
          {([
            ['onboarding', 'Онбординг', Radio],
            ['whitepaper', 'Whitepaper', FileText],
            ['catalog', 'Каталог', Boxes],
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
        {/* ── Онбординг ── */}
        {tab === 'onboarding' && (
          <div>
            <div className="grid gap-3 sm:gap-4">
              {ONBOARDING.map((s, i) => {
                const Icon = s.icon;
                const isOpen = i === step;
                return (
                  <button
                    key={s.title}
                    onClick={() => setStep(i)}
                    className="text-left rounded-xl border p-4 sm:p-5 transition-all"
                    style={{
                      borderColor: isOpen ? `${ACCENT}55` : 'rgba(148,163,184,0.16)',
                      background: isOpen ? `${ACCENT}0d` : 'rgba(2,10,26,0.5)',
                    }}
                  >
                    <div className="flex items-start gap-3.5">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: `${ACCENT}1a`, color: ACCENT }}
                      >
                        <Icon size={17} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-slate-600">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <h3 className="text-[15px] font-semibold text-slate-100">{s.title}</h3>
                        </div>
                        {isOpen && (
                          <p className="text-[13.5px] text-slate-400 leading-relaxed mt-2">{s.text}</p>
                        )}
                      </div>
                      <ChevronRight
                        size={16}
                        className="text-slate-600 shrink-0 mt-2 transition-transform"
                        style={{ transform: isOpen ? 'rotate(90deg)' : 'none' }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between mt-6">
              <div className="text-[12px] text-slate-500">
                Шаг {step + 1} из {ONBOARDING.length}
              </div>
              <button
                onClick={() => (step < ONBOARDING.length - 1 ? setStep(step + 1) : setTab('whitepaper'))}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold"
                style={{ background: `${ACCENT}1a`, color: ACCENT }}
              >
                {step < ONBOARDING.length - 1 ? 'Дальше' : 'К whitepaper'}
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ── Whitepaper ── */}
        {tab === 'whitepaper' && (
          <div className="max-w-3xl">
            {WHITEPAPER.map((t) => (
              <div key={t.n} className="mb-8 sm:mb-10">
                <div className="flex items-baseline gap-3 mb-2.5">
                  <span className="text-[13px] font-mono font-bold" style={{ color: `${ACCENT}99` }}>
                    {t.n}
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-100 leading-snug">{t.title}</h3>
                </div>
                <p className="text-[14px] text-slate-400 leading-[1.75] pl-8">{t.body}</p>
              </div>
            ))}

            <div
              className="rounded-xl border p-5 mt-10 flex gap-3.5"
              style={{ borderColor: 'rgba(251,191,36,0.28)', background: 'rgba(251,191,36,0.06)' }}
            >
              <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-[13.5px] font-semibold text-amber-200 mb-1.5">
                  О статусе цифр в этом документе
                </div>
                <p className="text-[13px] text-slate-400 leading-relaxed">
                  Показатели рыночных технологий взяты из документации производителей и помечены
                  как заявления вендора; там, где есть независимая проверка, приведены оба значения.
                  Собственные разработки показаны на своей реальной стадии — концепт, прототип или
                  пилот, — и незаполненные параметры оставлены незаполненными.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Каталог ── */}
        {tab === 'catalog' && (
          <div>
            <div className="flex flex-wrap gap-2 mb-6">
              {OILGAS_CATALOG_SECTIONS.map((s) => {
                const Icon = SECTION_ICON[s.id] ?? Boxes;
                const on = section === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSection(s.id)}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-[12.5px] font-semibold border transition-colors"
                    style={{
                      color: on ? ACCENT : '#94a3b8',
                      borderColor: on ? `${ACCENT}55` : 'rgba(148,163,184,0.18)',
                      background: on ? `${ACCENT}12` : 'transparent',
                    }}
                  >
                    <Icon size={14} /> {s.title}
                    <span className="text-[10px] opacity-60">{s.items.length}</span>
                  </button>
                );
              })}
            </div>

            <div className="grid gap-3">
              {active.items.map((item) => (
                <CatalogCard key={item.id} item={item} />
              ))}
            </div>

            {/* Раздел «Проекты» — два разных списка, и это сказано вслух. */}
            {active.id === 'projects' && (
              <div
                className="rounded-xl border p-5 mt-4"
                style={{ borderColor: `${ACCENT}33`, background: `${ACCENT}0a` }}
              >
                <div className="text-[13.5px] font-semibold text-white mb-1.5">
                  Это предложения платформы, а не отраслевые стройки
                </div>
                <p className="text-[13px] text-slate-400 leading-relaxed">
                  Карточки выше — то, что платформа предлагает сделать: у них есть стадия
                  готовности и модель оплаты, площадка при этом может быть ещё не выбрана.
                  Отдельно от них в корпусе лежат{' '}
                  <b className="text-slate-200">
                    {OILGAS_PROJECT_CORPUS.count}{' '}
                    {plural(OILGAS_PROJECT_CORPUS.count, 'нефтегазовый проект', 'нефтегазовых проекта', 'нефтегазовых проектов')}
                  </b>{' '}
                  по {OILGAS_PROJECT_CORPUS.countries}{' '}
                  {plural(OILGAS_PROJECT_CORPUS.countries, 'стране', 'странам', 'странам')} — существующие в отрасли, с
                  координатой, статусом и источниками; у {OILGAS_PROJECT_CORPUS.withBudget} из
                  них указан бюджет. Платформа их описывает, а не продаёт, поэтому списки не
                  сведены в один: иначе чужие стройки читались бы как наше предложение.
                </p>

                <div className="grid gap-1.5 mt-4">
                  {OILGAS_PROJECT_CORPUS.items.map((p) => (
                    <Link
                      key={p.id}
                      href={`/hub/project/${p.id}`}
                      className="flex items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors hover:bg-white/[0.03]"
                      style={{ borderColor: 'rgba(148,163,184,0.14)' }}
                    >
                      <span
                        className="shrink-0 mt-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded"
                        style={{ color: ACCENT, background: `${ACCENT}18` }}
                      >
                        {p.country}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13px] text-slate-200 font-medium leading-snug">
                          {p.title}
                        </span>
                        <span className="block text-[11.5px] text-slate-500 mt-0.5">
                          {[
                            PROJECT_STATUS_LABEL[p.status] ?? p.status,
                            p.region,
                            p.budget,
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </span>
                      </span>
                      <ArrowRight size={13} className="shrink-0 mt-1 text-slate-600" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div
              className="rounded-xl border p-5 mt-8 flex gap-3.5"
              style={{ borderColor: 'rgba(34,211,238,0.24)', background: 'rgba(34,211,238,0.05)' }}
            >
              <Waves size={18} className="text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-[13.5px] font-semibold text-cyan-200 mb-1.5">
                  Стык с водным модулем
                </div>
                <p className="text-[13px] text-slate-400 leading-relaxed">
                  Попутная вода — крупнейший по объёму поток отходов промысла, и в регионе с
                  пересыхающим бассейном это не побочная тема. Направление подготовки и возврата
                  попутной воды описано в разделе R&amp;D и опирается на ту же базу объектов, что и
                  водный модуль платформы.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
