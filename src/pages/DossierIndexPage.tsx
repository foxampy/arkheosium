/**
 * Реестр инвестиционных пакетов — оглавление досье.
 *
 * До сих пор досье были доступны только через карточку сборки на
 * главной: чтобы найти пакет, нужно было знать, к какой сборке он
 * относится. Для читателя, который пришёл за деньгами и хочет за
 * минуту увидеть, что вообще предлагается, такой путь не работает.
 *
 * Страница ничего не знает о конкретных проектах: она печатает то, что
 * лежит в `DOSSIERS`, и все её числа берутся из тех же полей, что и
 * числа внутри самих досье. Добавление досье добавляет строку сюда без
 * единой правки этого файла.
 *
 * Одна вещь здесь сказана явно, и ради неё страница, пожалуй, и
 * написана. Сводная потребность в капитале не равна сумме колонки
 * CAPEX. Корневая сборка и прикладная сборка EthOSium описывают один и
 * тот же капитальный маршрут материнской компании с двух сторон;
 * сложение их пакетов было бы двойным счётом одной суммы. Читатель,
 * который сложит колонку сам и не найдёт предупреждения, имеет полное
 * право закрыть материал — поэтому предупреждение стоит над колонкой,
 * а не в сноске под ней.
 */

import { Link } from 'wouter';
import { ArrowLeft, ArrowRight, FileText } from 'lucide-react';

import { DOSSIERS } from '@/data/dossier';
import { CURRENCY_SIGN } from '@/data/dossier/types';
import type { ProjectDossier } from '@/data/dossier/types';
import { SYSTEMS } from '@/data/platform/systems';
import {
  GOLD,
  GOLD_LIGHT,
  GOLD_DIM,
  HAIR,
  PANEL,
  DECK_BG,
  Spread,
  DeckTitle,
  Panel,
  MetricGrid,
  TickList,
} from '@/components/dossier/kit';

/** Название сборки по её идентификатору; если сборка не найдена — сам идентификатор. */
function buildName(buildId: string): string {
  const s = SYSTEMS.find((x) => x.id === buildId);
  return s?.name ?? buildId;
}

/**
 * Короткая сводка досье, посчитанная из тех же полей, что и страница
 * самого досье. Здесь нет ни одной величины, которой нет в реестре.
 */
function summarise(d: ProjectDossier) {
  const sign = CURRENCY_SIGN[d.currency];
  const u = d.unitEconomics;
  const ebitdaK = u.revenueK - u.opexK;
  const margin = (ebitdaK / u.revenueK) * 100;
  const m = (n: number) => `${sign}${n.toLocaleString('ru-RU')} млн`;

  /**
   * Показатель возврата печатается тот, который у проекта есть.
   * У программы со смешанным финансированием IRR не существует, и
   * прочерк в этой ячейке был бы не честностью, а неряшливостью:
   * вместо него называется то, чем финансирование является.
   */
  const ret =
    d.financials.irr !== undefined
      ? `IRR ${String(d.financials.irr).replace('.', ',')}%`
      : 'Смешанное финансирование';

  return {
    sign,
    capex: m(d.financials.capexTotalM),
    revenue: m(d.financials.revenueTargetM),
    margin: `${margin.toFixed(1).replace('.', ',')}%`,
    horizon: d.financials.horizon,
    ret,
    hasReturn: d.financials.irr !== undefined,
  };
}

export default function DossierIndexPage() {
  const rows = DOSSIERS.map((d) => ({ d, s: summarise(d) }));

  return (
    <div className="min-h-screen text-slate-200" style={{ background: DECK_BG }}>
      {/* ── Шапка ───────────────────────────────────────────── */}
      <header className="px-6 pt-10 pb-4">
        <div className="mx-auto max-w-6xl flex items-center justify-between gap-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[12px] text-white/40 hover:text-white/70 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            ArkheOSium
          </Link>
          <Link
            href="/fund"
            className="inline-flex items-center gap-2 text-[12px] transition hover:brightness-125"
            style={{ color: GOLD_LIGHT }}
          >
            <FileText className="w-3.5 h-3.5" />
            Фонду
          </Link>
        </div>
      </header>

      <section className="px-6 pt-16 pb-16 sm:pt-20 sm:pb-20">
        <div className="mx-auto max-w-4xl text-center">
          <div className="text-[12px] uppercase tracking-[0.3em] text-white/35">
            Инвестиционные пакеты
          </div>
          <h1 className="mt-6 text-[34px] sm:text-[52px] leading-[1.05] font-light text-white">
            Реестр досье
          </h1>
          <p className="mt-6 text-[15px] sm:text-[17px] leading-[1.65] text-slate-300 max-w-2xl mx-auto">
            {rows.length} пакетов одинакового состава: одностраничник, дек, экономика одной точки,
            масштабирование, лизинг, франшиза, финансовая модель, ESG. Одинаковый состав —
            не оформительское правило, а условие сравнимости: раздел, посчитанный в одном
            проекте и пропущенный в другом, первым бросается в глаза аналитику.
          </p>
        </div>
      </section>

      <div className="px-6">
        <div
          className="mx-auto max-w-6xl h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${GOLD_DIM}, transparent)` }}
        />
      </div>

      {/* ── Сводка реестра ──────────────────────────────────── */}
      <Spread wide>
        <DeckTitle
          n="01"
          title="Что в реестре"
          note="Числа ниже — из тех же полей, что и страницы самих досье: расхождение между оглавлением и пакетом невозможно по устройству."
        />
        <MetricGrid
          cols={4}
          items={[
            {
              value: String(rows.length),
              label: 'инвестиционных пакетов',
              note: 'Каждый со своей сборкой контура и своим адресатом',
            },
            {
              value: String(new Set(DOSSIERS.map((d) => d.buildId)).size),
              label: 'сборок контура',
              note: 'Досье привязано к сборке, а не существует само по себе',
            },
            {
              value: String(rows.filter((r) => r.s.hasReturn).length),
              label: 'с коммерческим возвратом',
              note: 'Остальные — программы со смешанным финансированием',
            },
            {
              value: '8 разделов',
              label: 'в каждом пакете',
              note: 'Состав задан типом: пакет без экономики точки не собирается',
            },
          ]}
        />
      </Spread>

      <div className="px-6">
        <div
          className="mx-auto max-w-6xl h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${GOLD_DIM}, transparent)` }}
        />
      </div>

      {/* ── Пакеты ──────────────────────────────────────────── */}
      <Spread wide>
        <DeckTitle
          n="02"
          title="Пакеты"
          note="Колонка CAPEX не складывается в сводную потребность: корневая сборка и прикладная сборка EthOSium описывают один и тот же капитальный маршрут материнской компании с двух сторон. Потребность считается по материнской компании, а не по числу материалов."
        />

        <div className="space-y-5">
          {rows.map(({ d, s }) => (
            <Link key={d.id} href={`/project/${d.id}`} className="block group">
                <div
                  className="rounded-xl p-6 sm:p-8 transition"
                  style={{ background: PANEL, border: `1px solid ${HAIR}` }}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start gap-8">
                    {/* Левая половина: чем проект является */}
                    <div className="flex-1 min-w-0">
                      <div className="text-[10.5px] uppercase tracking-[0.18em] text-slate-500">
                        {buildName(d.buildId)} · {d.geography}
                      </div>
                      <h3 className="mt-2.5 text-[21px] sm:text-[24px] font-light text-white group-hover:brightness-125 transition">
                        {d.name}
                      </h3>
                      <p className="mt-3 text-[13.5px] leading-[1.65] text-slate-400">
                        {d.tagline}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5">
                        {d.sectors.map((sec) => (
                          <span
                            key={sec}
                            className="text-[10.5px] uppercase tracking-[0.12em] text-white/35"
                          >
                            {sec}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Правая половина: чем проект является в деньгах */}
                    <div className="lg:w-[340px] shrink-0">
                      <div
                        className="text-[30px] sm:text-[36px] leading-none font-light tabular-nums"
                        style={{ color: GOLD_LIGHT }}
                      >
                        {d.headline.value}
                      </div>
                      <div className="mt-2 text-[12px] leading-[1.5] text-slate-300">
                        {d.headline.label}
                      </div>

                      <div className="mt-5 space-y-px">
                        {[
                          { k: 'CAPEX горизонта', v: s.capex },
                          { k: 'Выручка на горизонте', v: s.revenue },
                          { k: 'EBITDA-маржа точки', v: s.margin },
                          { k: 'Горизонт', v: s.horizon },
                          { k: 'Возврат', v: s.ret },
                        ].map((r) => (
                          <div
                            key={r.k}
                            className="flex items-baseline justify-between gap-4 py-2"
                            style={{ borderTop: '1px solid rgba(148,163,184,0.09)' }}
                          >
                            <span className="text-[11.5px] text-slate-500">{r.k}</span>
                            <span className="text-[12.5px] tabular-nums text-white/90 text-right">
                              {r.v}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div
                        className="mt-5 inline-flex items-center gap-2 text-[12px]"
                        style={{ color: GOLD }}
                      >
                        Открыть пакет
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </div>
            </Link>
          ))}
        </div>
      </Spread>

      <div className="px-6">
        <div
          className="mx-auto max-w-6xl h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${GOLD_DIM}, transparent)` }}
        />
      </div>

      {/* ── Как читать ──────────────────────────────────────── */}
      <Spread>
        <DeckTitle n="03" title="Как читать реестр" />
        <Panel>
          <TickList
            items={[
              'Досье привязано к сборке контура: один и тот же проект не существует в реестре дважды под разными именами.',
              'Состав разделов одинаков во всех пакетах и задан типом. Пропущенный раздел означал бы, что проект не посчитан, — такой пакет в реестр не попадает.',
              'Экономика одной точки стоит раньше масштабирования. Обратный порядок — сначала миллиарды, потом основание под ними — то, по чему пакет узнают и закрывают.',
              'Показатели возврата печатаются те, которые у проекта есть. Программа со смешанным государственным и донорским капиталом IRR не имеет, и посчитанная для неё «доходность» была бы арифметикой над несопоставимыми деньгами.',
              'Все схемы внутри пакетов считаются из тех же массивов, что и таблицы под ними: диаграмма и таблица разойтись не могут.',
              'Стороны, стоящие рядом с проектом, печатаются со стадией отношений — предложено, переговоры, соглашение — всегда, а не выборочно.',
            ]}
          />
        </Panel>

        <div className="mt-10 text-center">
          <Link
            href="/fund"
            className="inline-flex items-center gap-2 text-[13px] transition hover:brightness-125"
            style={{ color: GOLD_LIGHT }}
          >
            Инвестиционный контур
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </Spread>

      <div className="h-16" />
    </div>
  );
}
