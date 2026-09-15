/**
 * Досье проекта — универсальная страница инвестиционного пакета.
 *
 * Одна страница на все проекты, и это не экономия усилий, а условие
 * достоверности. Когда каждый проект оформляется отдельной вёрсткой,
 * разделы начинают расходиться: у одного есть экономика точки, у
 * другого её «не успели», у третьего она названа иначе. Фонд читает
 * такую разницу как сигнал, и правильно читает. Здесь состав разделов
 * задан типом `ProjectDossier`, и проект без экономики одной точки
 * просто не компилируется.
 *
 * Порядок разделов повторяет порядок чтения инвестиционного комитета:
 * сначала одна цифра и кто рядом, потом одностраничник, потом
 * экономика точки — и только после неё масштаб. Обратный порядок
 * (сначала миллиарды, потом на чём они стоят) — то, по чему пакет
 * узнают и закрывают.
 */

import { useMemo } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Download, FileText } from 'lucide-react';

import { getDossier } from '@/data/dossier';
import { AUTHORITY_STAGE_LABEL, CURRENCY_SIGN } from '@/data/dossier/types';
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
  AuthorityBar,
  HeadlineFigure,
  MetricGrid,
  ScaleChain,
  VerticalGrid,
  ShareBar,
  PnLChart,
  RoadmapStrip,
  TickList,
  TermRows,
} from '@/components/dossier/kit';

/** Разделитель разворотов: волосяная золотая нить по центру. */
function Rule() {
  return (
    <div className="px-6">
      <div
        className="mx-auto max-w-6xl h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${GOLD_DIM}, transparent)` }}
      />
    </div>
  );
}

export default function ProjectDossierPage({ id }: { id?: string }) {
  const d = getDossier(id);

  const sign = d ? CURRENCY_SIGN[d.currency] : '$';

  /** Экономика точки считается здесь, а не хранится: два числа рядом не разойдутся. */
  const unit = useMemo(() => {
    if (!d) return null;
    const u = d.unitEconomics;
    const ebitdaK = u.revenueK - u.opexK;
    const margin = (ebitdaK / u.revenueK) * 100;
    const payback = u.capexK / ebitdaK;
    return { ebitdaK, margin, payback };
  }, [d]);

  if (!d || !unit) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: DECK_BG }}>
        <div className="text-center">
          <div className="text-[13px] uppercase tracking-[0.2em] text-white/40">Досье не найдено</div>
          <p className="mt-4 text-[14px] text-slate-400">
            Идентификатор «{id}» отсутствует в реестре досье.
          </p>
          <Link href="/" className="mt-8 inline-flex items-center gap-2 text-[13px]" style={{ color: GOLD_LIGHT }}>
            <ArrowLeft className="w-3.5 h-3.5" />
            На главную
          </Link>
        </div>
      </div>
    );
  }

  const f = d.financials;
  const u = d.unitEconomics;
  const k = (n: number) => `${sign}${n.toLocaleString('ru-RU')} тыс.`;
  const m = (n: number) => `${sign}${n.toLocaleString('ru-RU')} млн`;

  /**
   * Показатели доходности печатаются только те, что заданы.
   * Программа со смешанным финансированием не имеет ни ROI, ни IRR —
   * и вместо пустых строк с прочерком страница показывает структуру
   * источников капитала, которая для неё и есть ответ на вопрос
   * «откуда деньги и чего они ждут».
   */
  const returnRows = [
    ...(f.roi !== undefined ? [{ k: 'ROI за горизонт', v: `${f.roi}%` }] : []),
    ...(f.irr !== undefined
      ? [{ k: 'IRR', v: `${String(f.irr).replace('.', ',')}% годовых` }]
      : []),
    ...(f.paybackYears !== undefined
      ? [{ k: 'Окупаемость', v: `${String(f.paybackYears).replace('.', ',')} года` }]
      : []),
    ...(f.npvM !== undefined ? [{ k: 'NPV', v: m(f.npvM) }] : []),
    ...(f.discountRate !== undefined
      ? [{ k: 'Ставка дисконтирования', v: `${f.discountRate}%` }]
      : []),
  ];

  const verticalsTotal = d.verticals.reduce((a, v) => a + v.targetM, 0);

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
          <div className="flex items-center gap-5">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 text-[12px] text-white/40 hover:text-white/70 transition"
            >
              <Download className="w-3.5 h-3.5" />
              Печать пакета
            </button>
            <Link
              href="/fund"
              className="inline-flex items-center gap-2 text-[12px] transition hover:brightness-125"
              style={{ color: GOLD_LIGHT }}
            >
              <FileText className="w-3.5 h-3.5" />
              Фонду
            </Link>
          </div>
        </div>
      </header>

      <div className="px-6 pt-8 pb-6">
        <div className="mx-auto max-w-6xl">
          <AuthorityBar
            items={d.authorities.map((a) => ({
              name: a.name,
              role: a.role,
              stageLabel: AUTHORITY_STAGE_LABEL[a.stage],
              url: a.url,
            }))}
          />
        </div>
      </div>

      <Rule />

      <section className="px-6 pt-20 pb-20 sm:pt-24 sm:pb-24">
        <div className="mx-auto max-w-4xl text-center">
          <div className="text-[12px] uppercase tracking-[0.3em] text-white/35">{d.geography}</div>
          <h1 className="mt-6 text-[34px] sm:text-[52px] leading-[1.05] font-light text-white">{d.name}</h1>
          <p className="mt-6 text-[15px] sm:text-[17px] leading-[1.65] text-slate-300 max-w-2xl mx-auto">
            {d.tagline}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-2">
            {d.sectors.map((s) => (
              <span key={s} className="text-[11px] uppercase tracking-[0.13em] text-white/40">
                {s}
              </span>
            ))}
          </div>

          <div className="mt-16">
            <HeadlineFigure {...d.headline} />
          </div>
        </div>
      </section>

      <Rule />

      {/* ── 01 Одностраничник ───────────────────────────────── */}
      <Spread>
        <DeckTitle n="01" title="Одностраничник" note="То, что читают за девяносто секунд." />

        <div className="grid sm:grid-cols-2 gap-8">
          <Panel>
            <div className="text-[11px] uppercase tracking-[0.18em]" style={{ color: GOLD }}>
              Проблема
            </div>
            <p className="mt-4 text-[13.5px] leading-[1.75] text-slate-300">{d.onePager.problem}</p>
          </Panel>
          <Panel>
            <div className="text-[11px] uppercase tracking-[0.18em]" style={{ color: GOLD }}>
              Решение
            </div>
            <p className="mt-4 text-[13.5px] leading-[1.75] text-slate-300">{d.onePager.solution}</p>
          </Panel>
        </div>

        <div className="mt-14">
          <div className="text-[11px] uppercase tracking-[0.18em] text-white/45 mb-8">Рынок</div>
          <MetricGrid items={d.onePager.market} cols={4} />
        </div>

        <div className="mt-14">
          <div className="text-[11px] uppercase tracking-[0.18em] text-white/45 mb-7">Почему это работает</div>
          <TickList items={d.onePager.why} />
        </div>

        <div className="mt-14 grid lg:grid-cols-2 gap-10 items-start">
          <Panel>
            <div className="text-[11px] uppercase tracking-[0.18em]" style={{ color: GOLD }}>
              Запрос
            </div>
            <div className="mt-5 text-[38px] leading-none font-light tabular-nums text-white">
              {d.onePager.ask.value}
            </div>
            <div className="mt-3 text-[13.5px] text-slate-200">{d.onePager.ask.label}</div>
            {d.onePager.ask.note && (
              <div className="mt-2 text-[12px] leading-[1.6] text-slate-500">{d.onePager.ask.note}</div>
            )}
          </Panel>
          <ShareBar title="На что идёт капитал" total={d.onePager.ask.value} items={d.onePager.use} />
        </div>
      </Spread>

      <Rule />

      {/* ── 02 Дек ──────────────────────────────────────────── */}
      <Spread wide>
        <DeckTitle
          n="02"
          title="Инвестиционный дек"
          note="Каждый слайд несёт одну мысль. Слайд без мысли из пакета удалён, а не оформлен."
        />

        <div className="grid md:grid-cols-2 gap-5">
          {d.deck.map((s) => (
            <div
              key={s.n}
              className="rounded-xl p-6 flex flex-col"
              style={{ background: PANEL, border: `1px solid ${HAIR}` }}
            >
              <div className="flex items-baseline gap-3">
                <span className="text-[11px] font-mono tabular-nums" style={{ color: GOLD }}>
                  {String(s.n).padStart(2, '0')}
                </span>
                <h3 className="text-[16px] text-white leading-snug">{s.title}</h3>
              </div>
              <p className="mt-4 text-[13px] leading-[1.7] text-slate-300 flex-1">{s.claim}</p>

              {s.points && (
                <ul className="mt-5 space-y-2">
                  {s.points.map((p) => (
                    <li key={p} className="flex gap-3 text-[12.5px] leading-[1.6] text-slate-400">
                      <span className="mt-[8px] w-2.5 h-px shrink-0" style={{ background: GOLD }} />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              )}

              {s.metrics && (
                <div className="mt-6 pt-5 grid grid-cols-3 gap-4" style={{ borderTop: `1px solid ${HAIR}` }}>
                  {s.metrics.map((mm) => (
                    <div key={mm.label}>
                      <div className="text-[17px] font-light tabular-nums leading-none" style={{ color: GOLD_LIGHT }}>
                        {mm.value}
                      </div>
                      <div className="mt-2 text-[11px] leading-[1.45] text-slate-400">{mm.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </Spread>

      <Rule />

      {/* ── 03 Экономика одной точки ────────────────────────── */}
      <Spread wide>
        <DeckTitle
          n="03"
          title="Бизнес-модель · экономика одной точки"
          note="Самый важный блок пакета. Всё, что идёт дальше, — это умножение его на число точек."
        />

        <div className="grid lg:grid-cols-[1fr_360px] gap-12 items-start">
          <div>
            <div className="text-[19px] text-white">{u.unitName}</div>
            <div className="mt-8">
              <MetricGrid items={u.composition} cols={2} />
            </div>

            <div className="mt-12">
              <TermRows
                rows={[
                  { k: 'CAPEX точки', v: k(u.capexK) },
                  { k: 'Выручка в год', v: k(u.revenueK) },
                  { k: 'OPEX в год', v: k(u.opexK) },
                  { k: 'EBITDA в год', v: k(Math.round(unit.ebitdaK)) },
                  { k: 'EBITDA-маржа', v: `${unit.margin.toFixed(1).replace('.', ',')}%` },
                  { k: u.occupancyLabel ?? 'Загрузка в расчёте', v: `${u.occupancy}%` },
                  ...(u.adr
                    ? [
                        {
                          k: u.adrLabel ?? 'Средний чек за сутки',
                          v: `${sign}${u.adr.toLocaleString('ru-RU')}`,
                        },
                      ]
                    : []),
                  {
                    k: 'Простая окупаемость CAPEX',
                    v: `${unit.payback.toFixed(1).replace('.', ',')} года`,
                  },
                ]}
              />
            </div>
          </div>

          <Panel className="lg:sticky lg:top-8">
            <div className="text-[11px] uppercase tracking-[0.18em]" style={{ color: GOLD }}>
              EBITDA точки
            </div>
            <div className="mt-5 text-[40px] leading-none font-light tabular-nums text-white">
              {k(Math.round(unit.ebitdaK))}
            </div>
            <div className="mt-3 text-[13px] text-slate-400">
              выручка {k(u.revenueK)} минус OPEX {k(u.opexK)}
            </div>
            <div className="mt-6 pt-5 text-[12.5px] leading-[1.7] text-slate-500" style={{ borderTop: `1px solid ${HAIR}` }}>
              Цифра посчитана из двух строк выше, а не записана отдельно: разойтись с ними она не может.
            </div>
          </Panel>
        </div>

        <div className="mt-16 grid lg:grid-cols-3 gap-10">
          <ShareBar title="Структура CAPEX" total={k(u.capexK)} items={u.capexBreakdown} />
          <ShareBar title="Потоки выручки" total={k(u.revenueK)} items={u.revenueStreams} />
          <ShareBar title="Структура OPEX" total={k(u.opexK)} items={u.opexBreakdown} />
        </div>

        <div className="mt-16">
          <div className="text-[11px] uppercase tracking-[0.18em] text-white/45 mb-7">Допущения расчёта</div>
          <TickList items={u.assumptions} />
        </div>
      </Spread>

      <Rule />

      {/* ── 04 Масштабирование ──────────────────────────────── */}
      <Spread wide>
        <DeckTitle
          n="04"
          title={`Масштабирование · ${d.geography}`}
          note="Каждая ступень финансируется выручкой предыдущей и капиталом на уровне актива. Числа ступеней сходятся с экономикой точки."
        />
        <ScaleChain tiers={d.scaling} sign={sign} />
      </Spread>

      <Rule />

      {/* ── 05 Направления ──────────────────────────────────── */}
      <Spread wide>
        <DeckTitle
          n="05"
          title="Направления инвестиций"
          note={`Совокупный целевой объём — ${m(verticalsTotal)}. Направления не конкурируют за один и тот же капитал: у каждого свой профиль риска и свой источник финансирования.`}
        />
        <VerticalGrid items={d.verticals} sign={sign} />
      </Spread>

      <Rule />

      {/* ── 06 Финансовая модель ────────────────────────────── */}
      <Spread wide>
        <DeckTitle
          n="06"
          title={
            returnRows.length > 0
              ? 'Финансовая модель · ROI · IRR · CAPEX · OPEX'
              : 'Финансовая модель · CAPEX · OPEX · источники капитала'
          }
          note={`Горизонт: ${f.horizon}.`}
        />

        <div className="grid lg:grid-cols-2 gap-x-14 gap-y-10">
          <TermRows
            rows={[
              { k: 'CAPEX платформы за горизонт', v: m(f.capexTotalM) },
              { k: 'OPEX на выходе, в год', v: m(f.opexAnnualM) },
              { k: 'Выручка первого года', v: m(f.revenueYear1M) },
              { k: 'Выручка на горизонте', v: m(f.revenueTargetM) },
              { k: 'EBITDA-маржа на выходе', v: `${f.ebitdaMargin}%` },
            ]}
          />
          {returnRows.length > 0 ? (
            <TermRows rows={returnRows} />
          ) : (
            f.financeMix && (
              <ShareBar
                title="Структура финансирования"
                total={m(f.capexTotalM)}
                items={f.financeMix}
              />
            )
          )}
        </div>

        {f.note && (
          <Panel className="mt-10">
            <div className="text-[13px] leading-relaxed text-slate-300">{f.note}</div>
          </Panel>
        )}

        {returnRows.length > 0 && f.financeMix && (
          <div className="mt-14">
            <ShareBar
              title="Структура финансирования"
              total={m(f.capexTotalM)}
              items={f.financeMix}
            />
          </div>
        )}

        <div className="mt-16">
          <div className="text-[11px] uppercase tracking-[0.18em] text-white/45 mb-8">P&L по годам</div>
          <PnLChart rows={f.pnl} sign={sign} />

          <div className="mt-12 overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-[0.13em] text-white/40">
                  <th className="pb-3 font-normal">Год</th>
                  <th className="pb-3 font-normal text-right">Выручка</th>
                  <th className="pb-3 font-normal text-right">OPEX</th>
                  <th className="pb-3 font-normal text-right">EBITDA</th>
                  <th className="pb-3 font-normal text-right">Маржа</th>
                </tr>
              </thead>
              <tbody>
                {f.pnl.map((r) => (
                  <tr key={r.year} style={{ borderTop: `1px solid rgba(148,163,184,0.09)` }}>
                    <td className="py-3 tabular-nums text-slate-400">{r.year}</td>
                    <td className="py-3 tabular-nums text-right text-white">{m(r.revenueM)}</td>
                    <td className="py-3 tabular-nums text-right text-slate-400">{m(r.opexM)}</td>
                    <td className="py-3 tabular-nums text-right" style={{ color: GOLD_LIGHT }}>
                      {m(r.ebitdaM)}
                    </td>
                    <td className="py-3 tabular-nums text-right text-slate-400">
                      {r.revenueM > 0 ? `${((r.ebitdaM / r.revenueM) * 100).toFixed(0)}%` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-16">
          <div className="text-[11px] uppercase tracking-[0.18em] text-white/45 mb-7">Структура сделки</div>
          <TickList items={f.dealTerms} />
        </div>
      </Spread>

      <Rule />

      {/* ── 07 Лизинг ───────────────────────────────────────── */}
      <Spread>
        <DeckTitle n="07" title="Лизинговая модель" note={d.leasing.about} />

        <div className="grid lg:grid-cols-2 gap-x-14 gap-y-12 items-start">
          <TermRows
            rows={[
              { k: 'Срок договора', v: d.leasing.term },
              { k: 'Первоначальный взнос', v: `${d.leasing.downPayment}%` },
              { k: 'Ставка', v: `${String(d.leasing.rate).replace('.', ',')}% годовых` },
              { k: 'Остаточная стоимость', v: `${d.leasing.residual}%` },
            ]}
          />
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-white/45 mb-7">Предмет лизинга</div>
            <TickList items={d.leasing.assets} />
          </div>
        </div>

        <div className="mt-16">
          <div className="text-[11px] uppercase tracking-[0.18em] text-white/45 mb-8">
            Преимущество перед покупкой
          </div>
          <MetricGrid items={d.leasing.advantages} cols={4} />
        </div>
      </Spread>

      <Rule />

      {/* ── 08 Франшиза ─────────────────────────────────────── */}
      <Spread>
        <DeckTitle
          n="08"
          title="Архитектура франшизы · международный стандарт"
          note={d.franchise.about}
        />

        <TermRows
          rows={[
            { k: 'Паушальный взнос', v: k(d.franchise.entryFeeK) },
            { k: 'Роялти', v: `${d.franchise.royalty}% выручки` },
            { k: 'Маркетинговый сбор', v: `${d.franchise.marketingFee}% выручки` },
            { k: 'Срок', v: d.franchise.term },
            { k: 'Территория', v: d.franchise.territory },
          ]}
        />

        <div className="mt-14">
          <div className="text-[11px] uppercase tracking-[0.18em] text-white/45 mb-7">Что входит</div>
          <TickList items={d.franchise.included} columns={2} />
        </div>

        <div className="mt-14">
          <div className="text-[11px] uppercase tracking-[0.18em] text-white/45 mb-7">Стандарты</div>
          <TickList items={d.franchise.standards} />
        </div>

        <div className="mt-14">
          <div className="text-[11px] uppercase tracking-[0.18em] text-white/45 mb-7">Требования к франчайзи</div>
          <TickList items={d.franchise.requirements} />
        </div>
      </Spread>

      <Rule />

      {/* ── 09 ESG Impact Returns ───────────────────────────── */}
      <Spread wide>
        <DeckTitle n="09" title="ESG · Impact Returns" note={d.esg.about} />

        <div className="space-y-14">
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] mb-8" style={{ color: GOLD }}>
              Environmental
            </div>
            <MetricGrid items={d.esg.environmental} cols={3} />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] mb-8" style={{ color: GOLD }}>
              Social
            </div>
            <MetricGrid items={d.esg.social} cols={3} />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] mb-8" style={{ color: GOLD }}>
              Governance
            </div>
            <MetricGrid items={d.esg.governance} cols={4} />
          </div>
        </div>

        <div className="mt-16">
          <div className="text-[11px] uppercase tracking-[0.18em] text-white/45 mb-8">
            Цели устойчивого развития ООН
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {d.esg.sdg.map((s) => (
              <div
                key={s.n}
                className="rounded-xl p-5"
                style={{ background: PANEL, border: `1px solid ${HAIR}` }}
              >
                <div className="flex items-baseline gap-3">
                  <span className="text-[22px] font-light tabular-nums leading-none" style={{ color: GOLD_LIGHT }}>
                    {s.n}
                  </span>
                  <span className="text-[13px] text-white leading-snug">{s.title}</span>
                </div>
                <p className="mt-4 text-[12px] leading-[1.65] text-slate-400">{s.contribution}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16">
          <div className="text-[11px] uppercase tracking-[0.18em] text-white/45 mb-7">Как измеряется импакт</div>
          <TickList items={d.esg.methodology} />
        </div>
      </Spread>

      <Rule />

      {/* ── 10 Дорожная карта ───────────────────────────────── */}
      <Spread wide>
        <DeckTitle n="10" title="Дорожная карта" />
        <RoadmapStrip phases={d.roadmap} />
      </Spread>

      <footer className="px-6 py-20" style={{ borderTop: `1px solid ${HAIR}` }}>
        <div className="mx-auto max-w-4xl text-center">
          <div className="text-[13px] uppercase tracking-[0.22em] text-white/45">{d.name}</div>
          <p className="mt-5 text-[13.5px] leading-[1.75] text-slate-400 max-w-xl mx-auto">
            Пакет собран из реестра проекта: одни и те же числа стоят в одностраничнике, в деке, в модели
            и в этой странице, потому что берутся из одного места.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-3">
            <Link href="/fund" className="text-[13px] transition hover:brightness-125" style={{ color: GOLD_LIGHT }}>
              Материалы фонду
            </Link>
            <Link href="/contacts" className="text-[13px] text-white/45 hover:text-white/75 transition">
              Контакты
            </Link>
            <Link href="/" className="text-[13px] text-white/45 hover:text-white/75 transition">
              ArkheOSium
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
