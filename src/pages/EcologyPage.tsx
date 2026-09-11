/**
 * EcologyPage — модуль «Экология».
 *
 * Построен по архитектуре нефтегазового модуля: онбординг для того, кто
 * пришёл впервые; whitepaper для того, кто решает, стоит ли иметь дело;
 * витрина объектов для того, кто уже смотрит конкретное место.
 *
 * Отличие от нефтегаза одно, и оно определяет всю страницу: в экологическом
 * наборе нет ни одного объекта с координатой площадки. Все объекты либо
 * площадные (осушенное дно, заповедник, ледник, зона засоления), либо
 * привязаны к посёлку, либо локализованы спутником с ошибкой в десятки
 * километров. Это сказано на странице прямо, а не спрятано в подписи.
 *
 * Правило корпуса: ни одной цифры без источника; расхождения источников
 * приводятся обеими величинами, а не сводятся к одной; пробел ⟨заполнить⟩
 * показывается приглушённым, но показывается.
 */

import { useState, useMemo } from 'react';
import { Link } from 'wouter';
import {
  Leaf, Map as MapIcon, Globe2, Radio, FileText, Boxes, ChevronRight,
  ChevronDown, ArrowRight, AlertTriangle, Crosshair, Satellite, Flame,
  Waves, Factory, Shield, Mountain, Filter, MapPin, Link2,
} from 'lucide-react';
import { ECOLOGY_OBJECTS } from '@/data/objects/ecology-objects';
import type { PlatformObject } from '@/data/objects-data';

const ACCENT = '#4ade80';

// ── Разделы корпуса ──────────────────────────────────────────────────
// Раздел выводится из идентификатора объекта (ECO-<страна>-<раздел>-NNN):
// отдельного поля секции в данных нет, а придумывать его в наборе,
// который правит другой контур, нельзя.

type SectionId = 'aral' | 'legacy' | 'protected' | 'monitoring' | 'degradation';

const SECTION_OF_CODE: Record<string, SectionId> = {
  ARL: 'aral',
  TL: 'legacy',
  IND: 'legacy',
  NUC: 'legacy',
  PA: 'protected',
  MON: 'monitoring',
  MET: 'monitoring',
  DEG: 'degradation',
  GLC: 'degradation',
};

const SECTIONS: { id: SectionId; title: string; icon: typeof Boxes; note: string }[] = [
  {
    id: 'aral',
    title: 'Аральская катастрофа',
    icon: Waves,
    note: 'Море, его остатки, дельта, солепылевые очаги и две площадки восстановления — северная плотина и посадки саксаула на осушенном дне.',
  },
  {
    id: 'legacy',
    title: 'Загрязнение и наследие',
    icon: Factory,
    note: 'Урановые хвостохранилища советского периода, действующие горно-металлургические комбинаты, золоотвалы и Семипалатинский полигон.',
  },
  {
    id: 'protected',
    title: 'Особо охраняемые территории',
    icon: Shield,
    note: 'Заповедники, национальные парки и биосферные резерваты. Для всех координата — точка внутри контура: площадной объект точкой не описывается.',
  },
  {
    id: 'monitoring',
    title: 'Мониторинг и метан',
    icon: Satellite,
    note: 'Посты наблюдения за воздухом и точки спутниковой фиксации метана. У каждого наблюдения назван прибор и его разрешение или порог обнаружения.',
  },
  {
    id: 'degradation',
    title: 'Деградация земель и ледники',
    icon: Mountain,
    note: 'Засоление орошаемых земель, опустынивание плато и пастбищ, отступающие ледники как индикатор климата.',
  },
];

function sectionOf(o: PlatformObject): SectionId {
  const code = o.id.split('-')[2] ?? '';
  return SECTION_OF_CODE[code] ?? 'degradation';
}

// ── Точность координаты — человеческим языком ────────────────────────

const PRECISION_LABEL: Record<string, string> = {
  exact: 'координата самой площадки',
  field_centroid: 'точка внутри контура',
  settlement_proxy: 'привязка к посёлку',
  region_proxy: 'только область',
  route_anchor: 'опорная точка линейного объекта',
};

const PRECISION_HINT: Record<string, string> = {
  exact: 'Место известно с точностью до площадки.',
  field_centroid: 'Контур растянут на десятки километров; точка внутри него условна.',
  settlement_proxy: 'Координата ближайшего населённого пункта, а не самого объекта.',
  region_proxy: 'Известна только область; ошибка может быть в сотни километров.',
  route_anchor: 'Объект линейный — точка отмечает опору, а не геометрию.',
};

const PRECISION_COLOR: Record<string, string> = {
  exact: '#34d399',
  field_centroid: '#a3e635',
  settlement_proxy: '#fbbf24',
  region_proxy: '#f87171',
  route_anchor: '#94a3b8',
};

const PRECISION_ORDER = ['exact', 'field_centroid', 'route_anchor', 'settlement_proxy', 'region_proxy'];

const COUNTRY_LABEL: Record<string, string> = {
  UZ: 'Узбекистан',
  KZ: 'Казахстан',
  KG: 'Киргизия',
  TJ: 'Таджикистан',
  TM: 'Туркменистан',
};

// ── Онбординг ────────────────────────────────────────────────────────

const ONBOARDING = [
  {
    icon: Leaf,
    title: 'Что такое экологический слой',
    text: 'Домен «экология» был объявлен в конфигурации платформы и до сих пор оставался пустым. Теперь в нём 53 записи: Аральская катастрофа, промышленное и радиационное наследие, особо охраняемые территории, точки наблюдения и деградация земель. Это не отдельная база рядом с водной и нефтегазовой, а тот же атлас границ и та же геометрия — просто другой слой на глобусе и карте.',
  },
  {
    icon: FileText,
    title: 'Откуда берутся данные',
    text: 'Спутниковые наблюдения (NASA Earth Observatory, Sentinel-5P/TROPOMI, Sentinel-2, VIIRS Nightfire), отчётность международных организаций (Всемирный банк, ЕБРР, МАГАТЭ, ПРООН, ЮНЕП, ЮНЕСКО MAB), национальные ведомства и научная литература. Источник назван у каждого объекта. Там, где под утверждением нет проверяемого документа, объект не появляется.',
  },
  {
    icon: Crosshair,
    title: 'Что означает уровень точности координаты',
    text: 'Ни у одного из 53 объектов точность не равна «координата площадки». Заповедник, осушенное дно, ледник и зона засоления — площадные объекты: точка внутри контура условна, контур тянется на десятки километров. Хвостохранилища и комбинаты привязаны к посёлку. Метановые шлейфы локализованы спутником: TROPOMI имеет разрешение 7,0 × 5,5 км и показывает область, а не установку. Уровень точности написан на каждой карточке — чтобы точку нельзя было принять за адрес.',
  },
  {
    icon: Flame,
    title: 'Где экология сшита с ресурсными доменами',
    text: 'Метановые эмиттеры — прямой мост к нефтегазовому модулю: одни и те же промысловые районы Туркменистана и Казахстана попадают и в экологический слой как объекты наблюдения, и в нефтегазовый как активы. Инструменты обнаружения описаны в позиции каталога OG-RD-CH4-001, программа обследований и ремонтов — в OG-SV-LDAR-001, отчётная цепочка — в OG-PR-MRV-001. Попутная вода (OG-RD-WATER-001) связывает экологический слой с водным.',
  },
  {
    icon: AlertTriangle,
    title: 'Как читать пробелы ⟨заполнить⟩',
    text: 'Метка ⟨заполнить⟩ означает: величина существует, но сверка с первоисточником не проведена, и правдоподобное число вместо неё не поставлено. Это не недоделка отображения, а состояние знания. Такие места в карточках подсвечены отдельно — чтобы читатель видел границу между тем, что проверено, и тем, что ещё нет.',
  },
];

// ── Whitepaper ───────────────────────────────────────────────────────

const WHITEPAPER = [
  {
    n: '01',
    title: 'Арал — необратимое изменение, а не «проблема с решением»',
    body: 'На 1960 год площадь моря оценивают примерно в 68 тыс. км²; часть источников даёт 66 тыс. км² — разница возникает из-за разных лет съёмки и трактовки мелководий, и обе оценки сохранены. Объём около 1 083 км³ (ЮНЕП, обзорная литература). В августе 2014 года NASA Earth Observatory зафиксировала полное пересыхание восточной чаши Большого Арала — впервые за время современных наблюдений. На месте акватории образовалась пустыня Аралкум: программы облесения ПРООН оперируют величиной порядка 5,5 млн га, часть литературы — около 60 тыс. км². Развернуть ход процесса удалось только на севере: Кокаральская плотина (2005, проект Всемирного банка) подняла уровень северного водоёма примерно с 30 до 42 м. Это восстановление одной части, а не отмена катастрофы.',
  },
  {
    n: '02',
    title: 'Радиационное и промышленное наследие опасно расположением, а не только активностью',
    body: 'В Майлуу-Суу уран перерабатывали в 1946–1968 годах, отходы оставлены на оползневых склонах и в пойме реки выше по течению от густонаселённой Ферганской долины. Опасность создаёт сочетание «радиоактивные отходы + оползневой склон + трансграничная река», а не активность отходов сама по себе. Число хвостохранилищ и объём отходов у Всемирного банка, МАГАТЭ и ЕБРР расходятся, и одна из версий здесь не выбирается. Узбекистанские площадки Чаркесар и Янгиабад включены в программу Счёта экологической реабилитации для Центральной Азии под управлением ЕБРР. Отдельный класс — действующие производства (Алмалык, Навои, Мурунтау, Ангрен, золоотвалы Ново-Ангренской ТЭС) и Семипалатинский полигон.',
  },
  {
    n: '03',
    title: 'ООПТ — контур сохранения, у которого нет точки',
    body: 'Тринадцать заповедников, национальных парков и биосферных резерватов пяти стран, от Чаткальского биосферного заповедника и объекта всемирного наследия «Западный Тянь-Шань» до тугайных Бадай-Тугая и Зарафшанского, устюртского заказника «Сайгачий» и Копетдагского заповедника. Для всех без исключения координата — точка внутри контура или приближение по району: у большинства контур растянут на десятки километров, у некоторых состоит из нескольких разобщённых участков. Площадь у ряда записей стоит как ⟨заполнить⟩ — потому что официальные и справочные величины расходятся, а сверка не проведена.',
  },
  {
    n: '04',
    title: 'Метан: прибор, порог и авторство оценки — часть самой цифры',
    body: 'TROPOMI (Sentinel-5P) имеет пространственное разрешение 7,0 × 5,5 км: он видит область повышенной концентрации, а не установку, и приписывать шлейф отдельной скважине по этим данным нельзя. GHGSat: оператор заявляет порог обнаружения около 100 кг/ч, независимая оценка по контролируемым выпускам — около 180 кг/ч; расхождение принципиально, заявленное и проверенное не одно и то же. Carbon Mapper по независимым оценкам — 64–126 кг/ч. По аварии на Каратуруне (июнь 2023 — глушение в конце года) аналитические компании по спутниковым данным называли десятки–сотни тысяч тонн метана, оператор и государственные органы — существенно меньшие величины; обе позиции сохранены раздельно, окончательной корпус не признаёт ни одну. Инструментальная часть этого сюжета описана в каталоге нефтегазового модуля: OG-RD-CH4-001 (многоуровневое обнаружение), OG-SV-LDAR-001 (обследования и подтверждённые ремонты), OG-PR-MRV-001 (отчётная цепочка).',
  },
  {
    n: '05',
    title: 'Деградация земель — медленный процесс с теми же требованиями к цифре',
    body: 'Засоление орошаемых земель Каракалпакстана и Хорезма, опустынивание плато Устюрт, деградация пастбищ Кызылкума, отступание ледников Абрамова, Федченко и Зеравшанского. Ледники внесены как индикатор климата: их баланс массы измеряется, а не выводится из общих соображений. Перенос аральской соли на горные снежники внесён отдельной записью — как связь, а не как площадка: механизм снижения альбедо физически понятен, но количественный вклад именно аральского материала установлен слабо, и утверждать его как измеренный корпус не будет.',
  },
  {
    n: '06',
    title: 'Измерение — основание для любого утверждения',
    body: 'Экология — область, где цифра без источника живёт дольше всего: её повторяют, потому что она уместна, а не потому, что она проверена. Поэтому в этом слое действует то же правило, что и в нефтегазовом, и здесь оно строже. Число приводится только вместе с тем, кто его назвал. Где источники спорят — приведены обе оценки. Где известна лишь приблизительная величина и сверка не проведена — стоит ⟨заполнить⟩. Спутниковое наблюдение отделено от инверсионного моделирования, заявление оператора — от независимой проверки, оценка аналитической компании — от официального ответа государства.',
  },
  {
    n: '07',
    title: 'Чего мы не утверждаем',
    body: 'Мы не утверждаем, что знаем точное место любого из этих объектов: точных координат площадки в наборе нет ни одной. Мы не утверждаем медицинскую связь солепылевых выносов Приаралья с заболеваемостью — она обсуждается в литературе, но количественно установлена слабо. Мы не утверждаем количественный вклад аральской соли в снижение альбедо ледников. Мы не выбираем между спутниковой и официальной оценкой выброса на Каратуруне и между расходящимися величинами по площади Арала, Аралкума и объёмам хвостохранилищ. Мы не заявляем собственной сети наблюдения в этом слое: записи опираются на чужие измерения, и у каждой названы чьи. MethaneSAT в этот корпус не входит — связь с аппаратом потеряна 20 июня 2025 года.',
  },
];

// ── Карточка объекта ─────────────────────────────────────────────────

function ObjectCard({ o }: { o: PlatformObject }) {
  const [open, setOpen] = useState(false);
  const precision = String(o.coord_precision ?? 'region_proxy');
  const pColor = PRECISION_COLOR[precision] ?? '#94a3b8';
  const sources = (o.sources as string[] | undefined) ?? [];
  const gaps = (o.description.match(/⟨заполнить/g) ?? []).length;

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
              style={{ color: ACCENT, border: `1px solid ${ACCENT}55` }}
            >
              {o.type_label}
            </span>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full text-slate-300"
              style={{ border: '1px solid rgba(148,163,184,0.35)' }}
            >
              {COUNTRY_LABEL[o.country_code] ?? o.country}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">{o.id}</span>
          </div>
          <h4 className="text-[15px] sm:text-base font-semibold text-slate-100 leading-snug">
            {o.name_ru}
          </h4>
          {o.region && (
            <p className="text-[12px] text-slate-500 mt-1">{o.region}</p>
          )}

          <div className="flex flex-wrap items-center gap-2 mt-2.5">
            <span
              className="inline-flex items-center gap-1.5 text-[11px] px-2 py-1 rounded"
              style={{ color: pColor, background: 'rgba(148,163,184,0.08)' }}
              title={PRECISION_HINT[precision]}
            >
              <Crosshair size={11} />
              {PRECISION_LABEL[precision] ?? precision}
            </span>
            {gaps > 0 && (
              <span className="text-[11px] px-2 py-1 rounded text-slate-500" style={{ background: 'rgba(148,163,184,0.06)' }}>
                ⟨заполнить⟩ · {gaps}
              </span>
            )}
          </div>
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
            <p className="text-[13.5px] text-slate-300 leading-relaxed whitespace-pre-line">
              {o.description}
            </p>

            <div
              className="mt-4 text-[12px] px-3 py-2 rounded-lg flex items-start gap-2 text-slate-400"
              style={{ background: 'rgba(148,163,184,0.06)' }}
            >
              <Crosshair size={13} className="shrink-0 mt-0.5" style={{ color: pColor }} />
              <span>
                <span style={{ color: pColor }}>{PRECISION_LABEL[precision] ?? precision}</span>
                {' — '}
                {PRECISION_HINT[precision]}
                {o.coordinates && (
                  <span className="font-mono text-slate-500">
                    {' '}({o.coordinates.lat.toFixed(2)}, {o.coordinates.lng.toFixed(2)})
                  </span>
                )}
              </span>
            </div>

            {sources.length > 0 && (
              <div className="mt-4">
                <div className="text-[10.5px] uppercase tracking-wider text-slate-500 mb-1.5">
                  Источники
                </div>
                <ul className="space-y-1">
                  {sources.map((src, i) => (
                    <li key={i} className="text-[11.5px] text-slate-400 leading-relaxed pl-3 relative">
                      <span className="absolute left-0 text-slate-600">·</span>
                      {src}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {o.tags && o.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {o.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[10.5px] px-2 py-1 rounded text-emerald-300/70"
                    style={{ background: 'rgba(74,222,128,0.08)' }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href={`/hub/object/${o.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-slate-900"
                style={{ background: ACCENT }}
              >
                <Link2 size={13} /> Карточка объекта
              </Link>
              <Link
                href="/map"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold border text-slate-200"
                style={{ borderColor: 'rgba(148,163,184,0.28)' }}
              >
                <MapIcon size={13} /> На карте
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold border text-slate-200"
                style={{ borderColor: 'rgba(148,163,184,0.28)' }}
              >
                <Globe2 size={13} /> На глобусе
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Страница ─────────────────────────────────────────────────────────

export default function EcologyPage() {
  const [tab, setTab] = useState<'onboarding' | 'whitepaper' | 'objects'>('onboarding');
  const [step, setStep] = useState(0);
  const [section, setSection] = useState<SectionId | 'all'>('all');
  const [country, setCountry] = useState<string>('all');
  const [precision, setPrecision] = useState<string>('all');

  const total = ECOLOGY_OBJECTS.length;

  const countryCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const o of ECOLOGY_OBJECTS) m.set(o.country_code, (m.get(o.country_code) ?? 0) + 1);
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
  }, []);

  const precisionCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const o of ECOLOGY_OBJECTS) {
      const p = String(o.coord_precision ?? 'region_proxy');
      m.set(p, (m.get(p) ?? 0) + 1);
    }
    return PRECISION_ORDER.filter((p) => m.has(p)).map((p) => [p, m.get(p)!] as [string, number]);
  }, []);

  const exactCount = useMemo(
    () => ECOLOGY_OBJECTS.filter((o) => o.coord_precision === 'exact').length,
    [],
  );

  const gapCount = useMemo(
    () => ECOLOGY_OBJECTS.filter((o) => o.description.includes('⟨заполнить')).length,
    [],
  );

  const filtered = useMemo(
    () =>
      ECOLOGY_OBJECTS.filter((o) => {
        if (country !== 'all' && o.country_code !== country) return false;
        if (precision !== 'all' && String(o.coord_precision) !== precision) return false;
        if (section !== 'all' && sectionOf(o) !== section) return false;
        return true;
      }),
    [country, precision, section],
  );

  const bySection = useMemo(() => {
    return SECTIONS.map((s) => ({
      ...s,
      items: filtered.filter((o) => sectionOf(o) === s.id),
    })).filter((s) => s.items.length > 0);
  }, [filtered]);

  const sectionTotals = useMemo(() => {
    const m = new Map<SectionId, number>();
    for (const o of ECOLOGY_OBJECTS) {
      const s = sectionOf(o);
      m.set(s, (m.get(s) ?? 0) + 1);
    }
    return m;
  }, []);

  return (
    <div className="min-h-screen text-slate-200">
      {/* Шапка */}
      <div
        className="relative overflow-hidden border-b"
        style={{
          borderColor: `${ACCENT}22`,
          background: 'linear-gradient(160deg, rgba(74,222,128,0.10), rgba(2,8,23,0) 60%)',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="flex items-center gap-2 mb-4">
            <Leaf size={18} style={{ color: ACCENT }} />
            <span className="text-[11px] font-bold tracking-[0.18em] uppercase" style={{ color: ACCENT }}>
              Модуль · Экология
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-white leading-tight max-w-3xl">
            Экологический слой Центральной Азии — с названным источником у каждой цифры
          </h1>
          <p className="text-[14px] sm:text-base text-slate-400 mt-4 max-w-2xl leading-relaxed">
            Аральская катастрофа, урановое и промышленное наследие, охраняемые территории,
            метановые наблюдения и деградация земель. Точных координат площадки в этом наборе
            нет ни одной: объекты площадные либо привязаны к посёлку — и на каждой карточке
            написано, какого именно рода привязка.
          </p>

          <div className="flex flex-wrap gap-6 mt-8">
            {[
              { v: String(total), l: 'объектов в корпусе' },
              { v: String(countryCounts.length), l: 'стран региона' },
              { v: String(exactCount), l: 'с координатой площадки' },
              { v: String(gapCount), l: 'записей с пробелами ⟨заполнить⟩' },
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
            <Link
              href="/oilgas"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-semibold border text-slate-200"
              style={{ borderColor: 'rgba(251,146,60,0.35)', color: '#fb923c' }}
            >
              <Flame size={15} /> Метан — в модуле «Газнефть»
            </Link>
          </div>
        </div>
      </div>

      {/* Вкладки */}
      <div
        className="sticky top-0 z-20 border-b backdrop-blur"
        style={{ borderColor: 'rgba(148,163,184,0.14)', background: 'rgba(2,8,23,0.86)' }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex gap-1 overflow-x-auto">
          {([
            ['onboarding', 'Онбординг', Radio],
            ['whitepaper', 'Whitepaper', FileText],
            ['objects', 'Объекты', Boxes],
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
                  Где источники называют разные величины — приведены обе, а не выбранная одна:
                  так по площади Арала 1960 года, по площади Аралкума, по объёмам хвостохранилищ
                  и по выбросу на Каратуруне. Спутниковое наблюдение отделено от инверсионного
                  моделирования, заявление оператора прибора — от независимой проверки.
                  Незаполненные величины оставлены незаполненными и помечены ⟨заполнить⟩.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Объекты ── */}
        {tab === 'objects' && (
          <div>
            {/* Предупреждение о точности — до фильтров, а не в сноске */}
            <div
              className="rounded-xl border p-4 sm:p-5 mb-6 flex gap-3.5"
              style={{ borderColor: 'rgba(248,113,113,0.26)', background: 'rgba(248,113,113,0.05)' }}
            >
              <MapPin size={18} className="text-red-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-[13.5px] font-semibold text-red-200 mb-1.5">
                  Ни у одного из {total} объектов нет координаты площадки
                </div>
                <p className="text-[13px] text-slate-400 leading-relaxed">
                  Все координаты в этом слое условны. Осушенное дно, заповедник, ледник и зона
                  засоления — площадные объекты: точка внутри контура ничего не адресует.
                  Хвостохранилища и комбинаты привязаны к ближайшему посёлку. Метановые точки
                  локализованы спутником, у которого разрешение измеряется километрами. Уровень
                  привязки указан на каждой карточке — и по нему можно отфильтровать.
                </p>
              </div>
            </div>

            {/* Разделы */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setSection('all')}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-[12.5px] font-semibold border transition-colors"
                style={{
                  color: section === 'all' ? ACCENT : '#94a3b8',
                  borderColor: section === 'all' ? `${ACCENT}55` : 'rgba(148,163,184,0.18)',
                  background: section === 'all' ? `${ACCENT}12` : 'transparent',
                }}
              >
                <Boxes size={14} /> Все разделы
                <span className="text-[10px] opacity-60">{total}</span>
              </button>
              {SECTIONS.map((s) => {
                const Icon = s.icon;
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
                    <span className="text-[10px] opacity-60">{sectionTotals.get(s.id) ?? 0}</span>
                  </button>
                );
              })}
            </div>

            {/* Фильтры: страна и точность */}
            <div
              className="rounded-xl border p-4 mb-6"
              style={{ borderColor: 'rgba(148,163,184,0.16)', background: 'rgba(2,10,26,0.5)' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Filter size={13} className="text-slate-500" />
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                  Страна
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setCountry('all')}
                  className="px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-colors"
                  style={{
                    color: country === 'all' ? ACCENT : '#94a3b8',
                    borderColor: country === 'all' ? `${ACCENT}55` : 'rgba(148,163,184,0.18)',
                    background: country === 'all' ? `${ACCENT}12` : 'transparent',
                  }}
                >
                  Все · {total}
                </button>
                {countryCounts.map(([code, n]) => {
                  const on = country === code;
                  return (
                    <button
                      key={code}
                      onClick={() => setCountry(code)}
                      className="px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-colors"
                      style={{
                        color: on ? ACCENT : '#94a3b8',
                        borderColor: on ? `${ACCENT}55` : 'rgba(148,163,184,0.18)',
                        background: on ? `${ACCENT}12` : 'transparent',
                      }}
                    >
                      {COUNTRY_LABEL[code] ?? code} · {n}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 mt-5 mb-3">
                <Crosshair size={13} className="text-slate-500" />
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                  Уровень привязки координаты
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setPrecision('all')}
                  className="px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-colors"
                  style={{
                    color: precision === 'all' ? ACCENT : '#94a3b8',
                    borderColor: precision === 'all' ? `${ACCENT}55` : 'rgba(148,163,184,0.18)',
                    background: precision === 'all' ? `${ACCENT}12` : 'transparent',
                  }}
                >
                  Любой · {total}
                </button>
                {precisionCounts.map(([p, n]) => {
                  const on = precision === p;
                  const c = PRECISION_COLOR[p] ?? '#94a3b8';
                  return (
                    <button
                      key={p}
                      onClick={() => setPrecision(p)}
                      className="px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-colors"
                      title={PRECISION_HINT[p]}
                      style={{
                        color: on ? c : '#94a3b8',
                        borderColor: on ? `${c}66` : 'rgba(148,163,184,0.18)',
                        background: on ? `${c}14` : 'transparent',
                      }}
                    >
                      {PRECISION_LABEL[p] ?? p} · {n}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11.5px] text-slate-500 mt-3 leading-relaxed">
                Уровня «координата самой площадки» в этом наборе нет — фильтр по нему не
                появляется, потому что таких объектов ноль.
              </p>
            </div>

            <div className="text-[12px] text-slate-500 mb-4">
              Показано {filtered.length} из {total}
              {(country !== 'all' || precision !== 'all' || section !== 'all') && (
                <button
                  onClick={() => { setCountry('all'); setPrecision('all'); setSection('all'); }}
                  className="ml-3 underline underline-offset-2 hover:text-slate-300"
                >
                  сбросить фильтры
                </button>
              )}
            </div>

            {bySection.length === 0 && (
              <div className="text-[13px] text-slate-500 py-10 text-center">
                Под это сочетание фильтров объектов нет.
              </div>
            )}

            {bySection.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.id} className="mb-10">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <Icon size={16} style={{ color: ACCENT }} />
                    <h3 className="text-[16px] font-bold text-slate-100">{s.title}</h3>
                    <span className="text-[11px] text-slate-500">{s.items.length}</span>
                  </div>
                  <p className="text-[12.5px] text-slate-500 leading-relaxed mb-4 max-w-3xl">
                    {s.note}
                  </p>
                  <div className="grid gap-3">
                    {s.items.map((o) => (
                      <ObjectCard key={o.id} o={o} />
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Мост к нефтегазовому модулю */}
            <div
              className="rounded-xl border p-5 mt-4 flex gap-3.5"
              style={{ borderColor: 'rgba(251,146,60,0.26)', background: 'rgba(251,146,60,0.05)' }}
            >
              <Flame size={18} className="shrink-0 mt-0.5" style={{ color: '#fb923c' }} />
              <div>
                <div className="text-[13.5px] font-semibold mb-1.5" style={{ color: '#fdba74' }}>
                  Стык с нефтегазовым модулем
                </div>
                <p className="text-[13px] text-slate-400 leading-relaxed">
                  Метановые точки этого слоя и промысловые активы нефтегазового описывают одни и
                  те же районы с разных сторон. Инструментальная часть не пересказывается здесь
                  своими словами, а лежит в каталоге модуля «Газнефть»: OG-RD-CH4-001 —
                  многоуровневое обнаружение метана, OG-SV-LDAR-001 — программа обследований и
                  подтверждённых ремонтов, OG-PR-MRV-001 — проверяемая отчётная цепочка,
                  OG-RD-WATER-001 — попутная вода, связывающая слой с водным модулем.
                </p>
                <Link
                  href="/oilgas"
                  className="inline-flex items-center gap-2 mt-3 px-3.5 py-2 rounded-lg text-[12.5px] font-semibold text-slate-900"
                  style={{ background: '#fb923c' }}
                >
                  Открыть каталог модуля «Газнефть»
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
