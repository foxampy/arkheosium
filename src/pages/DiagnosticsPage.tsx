/**
 * DiagnosticsPage — первая собственная линия LabForge: сквозная вибро-волновая
 * диагностика состояния оборудования, включая «прошивку» объекта проводящей сеткой.
 * Маршрут: /diagnostics
 *
 * Разворачивает позицию каталога «Газнефть» OG-RD-VIB-001 до страницы,
 * опираясь на типизированную модель в src/data/diagnostics/model.ts.
 *
 * Дисциплина корпуса:
 *  — стенд не собран, чувствительность не измерена, взрывозащита не сертифицирована,
 *    сравнительных испытаний против рыночных датчиков не проводилось; это вынесено
 *    отдельным блоком на вкладку «Статус», а не спрятано в примечании;
 *  — характеристики рыночных систем даны как заявления производителей и НЕ
 *    сопоставляются с LabForge Mesh по цифрам: собственных измерений нет;
 *  — ни одного выдуманного числа: где нет значения, стоит ⟨заполнить⟩;
 *  — экономический эффект не обещается;
 *  — у каждого стандарта названо не только что он покрывает, но и чего не покрывает.
 */

import { useState } from 'react';
import { Link } from 'wouter';
import {
  Radar, ArrowLeft, ArrowRight, Activity, Waves, Cog, Wrench,
  AlertTriangle, CheckCircle2, XCircle, ShieldCheck, FileCheck2,
  ListChecks, Boxes, CircleDashed, Scale, Gauge, Grid3x3,
  Layers, Ruler, TrendingUp, Signal,
} from 'lucide-react';
import {
  D_STAGE_LABEL, D_CLAIM_LABEL, D_STAGE_COLOR, D_CLAIM_COLOR,
  MEASURED_QUANTITIES, MESH_IDEA, POINT_VS_MESH, MESH_QUESTIONS,
  DEFECTS, ZONE_MEANING, MACHINE_CLASSES, CLASSES_CAVEAT, ZONES_LIMIT,
  MAINTENANCE_LEVELS, MATURITY_HONEST, APPLICATION_POINTS,
  STANDARDS, STANDARDS_GAP, APPLICABILITY_LABEL, APPLICABILITY_COLOR,
  MARKET_DISCLAIMER, MARKET_REFERENCE, MESH_VS_MARKET,
  STATUS_DONE, STATUS_NOT_DONE, NOT_TESTED, OPEN_GAPS, CATALOG_REFS,
  type Stage, type ClaimBasis, type Spec,
} from '@/data/diagnostics/model';

/** Циан LabForge. */
const ACCENT = '#22d3ee';

const CARD = 'rounded-xl border p-5';
const CARD_STYLE = {
  borderColor: 'rgba(148,163,184,0.14)',
  background: 'rgba(15,23,42,0.45)',
} as const;

// ─────────────────────────────────────────────────────────────────────
//  Мелкие элементы отображения
// ─────────────────────────────────────────────────────────────────────

function StageBadge({ stage }: { stage: Stage }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap"
      style={{
        color: D_STAGE_COLOR[stage],
        background: `${D_STAGE_COLOR[stage]}18`,
        border: `1px solid ${D_STAGE_COLOR[stage]}33`,
      }}
    >
      {D_STAGE_LABEL[stage]}
    </span>
  );
}

function ClaimTag({ claim }: { claim: ClaimBasis }) {
  return (
    <span
      className="inline-flex items-center text-[10px] whitespace-nowrap"
      style={{ color: D_CLAIM_COLOR[claim] }}
    >
      {D_CLAIM_LABEL[claim]}
    </span>
  );
}

function SpecRow({ spec }: { spec: Spec }) {
  return (
    <div
      className="flex items-baseline justify-between gap-3 py-1.5 border-b last:border-0"
      style={{ borderColor: 'rgba(148,163,184,0.10)' }}
    >
      <span className="text-[12px] text-slate-500 shrink-0">{spec.label}</span>
      <span className="text-[12px] text-slate-300 text-right">
        {spec.value} <ClaimTag claim={spec.claim} />
      </span>
    </div>
  );
}

function SectionTitle({ children, note }: { children: React.ReactNode; note?: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-lg sm:text-xl font-bold text-white">{children}</h2>
      {note && <p className="text-[13px] text-slate-400 mt-1.5 leading-relaxed max-w-3xl">{note}</p>}
    </div>
  );
}

function Caveat({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-lg border p-4 flex gap-3"
      style={{ borderColor: 'rgba(251,191,36,0.28)', background: 'rgba(251,191,36,0.06)' }}
    >
      <AlertTriangle size={15} className="shrink-0 mt-0.5" style={{ color: '#fbbf24' }} />
      <div className="text-[12.5px] text-amber-200/85 leading-relaxed">{children}</div>
    </div>
  );
}

/**
 * Постоянная оговорка о стадии. Рендерится под шапкой на всех вкладках,
 * потому что она обязана быть видна, а не найдена.
 */
function StageBanner({ compact = false }: { compact?: boolean }) {
  const points = [
    'Стенд не собран: ни одного измерения на контролируемом источнике вибрации не выполнено.',
    'Чувствительность сетки против штатной схемы — ⟨не измерена⟩. Полоса частот и предел обнаружения дефекта — ⟨заполнить по итогам стенда⟩.',
    'Взрывозащита не сертифицирована: установка на действующем объекте пока невозможна.',
    'Сравнительных испытаний против серийных датчиков не проводилось. Характеристики рынка на этой странице — заявления производителей, и с LabForge Mesh они не сопоставляются.',
    'Экономический эффект не рассчитывался и здесь не заявляется.',
  ];
  return (
    <div
      className="rounded-xl border p-4 sm:p-5"
      style={{ borderColor: 'rgba(248,113,113,0.30)', background: 'rgba(248,113,113,0.07)' }}
    >
      <div className="flex items-center gap-2 mb-2.5">
        <AlertTriangle size={16} style={{ color: '#f87171' }} />
        <span className="text-[13px] font-bold text-red-200">
          Стадия линии: концепт и прототип. Это проработка, а не поставляемый продукт
        </span>
      </div>
      <ul className="space-y-1.5">
        {(compact ? points.slice(0, 3) : points).map((p) => (
          <li key={p} className="text-[12.5px] text-red-100/80 leading-relaxed flex gap-2">
            <span className="text-red-400/60 shrink-0">—</span>
            <span>{p}</span>
          </li>
        ))}
      </ul>
      {compact && (
        <p className="text-[11.5px] text-red-200/60 mt-2.5">
          Полный перечень непроверенного — на вкладке «Статус».
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────

type Tab = 'method' | 'defects' | 'standards' | 'status';

export default function DiagnosticsPage() {
  const [tab, setTab] = useState<Tab>('method');
  const [qtyId, setQtyId] = useState<string>(MEASURED_QUANTITIES[0].id);
  const [pointId, setPointId] = useState<string>(APPLICATION_POINTS[0].id);

  const qty = MEASURED_QUANTITIES.find((q) => q.id === qtyId) ?? MEASURED_QUANTITIES[0];
  const point = APPLICATION_POINTS.find((p) => p.id === pointId) ?? APPLICATION_POINTS[0];

  return (
    <div className="min-h-screen text-slate-200">
      {/* ── Шапка ───────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden border-b"
        style={{
          borderColor: `${ACCENT}22`,
          background: 'linear-gradient(160deg, rgba(34,211,238,0.10), rgba(2,8,23,0) 60%)',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <Link
            href="/oilgas"
            className="inline-flex items-center gap-1.5 text-[12px] text-slate-400 hover:text-slate-200 transition-colors mb-5"
          >
            <ArrowLeft size={13} /> Модуль «Газнефть»
          </Link>

          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <Radar size={18} style={{ color: ACCENT }} />
            <span className="text-[11px] font-bold tracking-[0.18em] uppercase" style={{ color: ACCENT }}>
              LabForge · Вибро-волновая диагностика
            </span>
            <span className="text-[10px] text-slate-500 font-mono">OG-RD-VIB-001</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold text-white leading-tight max-w-3xl">
            Состояние машины читается по волне: частота говорит, что сломалось, амплитуда — насколько
          </h1>
          <p className="text-[14px] sm:text-base text-slate-400 mt-4 max-w-2xl leading-relaxed">
            Первая линия LabForge. Замысел — «прошить» объект проводящей сеткой и снимать волновые
            характеристики не в одной точке корпуса, а по протяжённой области конструкции. Ниже —
            физика, по которой ставится диагноз, перечень дефектов с их частотными сигнатурами,
            разметка применимости стандартов и честный список того, что ещё не проверено.
          </p>

          <div className="flex flex-wrap gap-6 mt-8">
            {[
              { v: '0', l: 'измерений на стенде' },
              { v: '0', l: 'сертификатов взрывозащиты' },
              { v: '0', l: 'сравнительных испытаний' },
            ].map((s) => (
              <div key={s.l}>
                <div className="text-2xl sm:text-3xl font-bold" style={{ color: ACCENT }}>{s.v}</div>
                <div className="text-[11px] text-slate-500 uppercase tracking-wide mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 mt-8">
            <button
              onClick={() => setTab('status')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-semibold text-slate-900"
              style={{ background: ACCENT }}
            >
              <ListChecks size={15} /> Что сделано, а что нет
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
            ['method', 'Метод', Waves],
            ['defects', 'Что диагностируем', Cog],
            ['standards', 'Стандарты', FileCheck2],
            ['status', 'Статус', ListChecks],
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
        {/* Оговорка о стадии видна на любой вкладке. */}
        <div className="mb-8">
          <StageBanner compact={tab !== 'status'} />
        </div>

        {/* ── Метод ─────────────────────────────────────────────── */}
        {tab === 'method' && (
          <div>
            <SectionTitle note="Диагностика начинается не с датчика, а с выбора величины. Одна и та же машина в виброскорости, виброускорении и огибающей выглядит по-разному, и дефект, невидимый в первой, отчётливо стоит в третьей. Ниже — величины, на которых держится вся вибродиагностика, с указанием нормирующего документа там, где он есть.">
              Что измеряют и почему именно это
            </SectionTitle>

            <div className="grid lg:grid-cols-[280px_1fr] gap-5 mb-10">
              <div className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-1">
                {MEASURED_QUANTITIES.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => setQtyId(q.id)}
                    className="text-left px-3.5 py-2.5 rounded-lg text-[12.5px] font-semibold whitespace-nowrap lg:whitespace-normal border transition-colors shrink-0"
                    style={{
                      color: qtyId === q.id ? ACCENT : '#cbd5e1',
                      borderColor: qtyId === q.id ? `${ACCENT}55` : 'rgba(148,163,184,0.14)',
                      background: qtyId === q.id ? `${ACCENT}12` : 'rgba(15,23,42,0.40)',
                    }}
                  >
                    <span className="block">{q.name}</span>
                    <span className="block text-[10.5px] font-mono font-normal mt-0.5 text-slate-500">
                      {q.symbol} · {q.unit}
                    </span>
                  </button>
                ))}
              </div>

              <div className={CARD} style={CARD_STYLE}>
                <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                  <h3 className="text-[15px] font-bold text-white">{qty.name}</h3>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded font-mono"
                    style={{ color: ACCENT, background: `${ACCENT}18`, border: `1px solid ${ACCENT}33` }}
                  >
                    {qty.unit}
                  </span>
                </div>
                <p className="text-[13.5px] text-slate-300 leading-[1.75]">{qty.reveals}</p>

                <div className="mt-4 pt-3.5 border-t" style={{ borderColor: 'rgba(148,163,184,0.12)' }}>
                  <div className="text-[11px] text-slate-500 uppercase tracking-wide mb-1.5">Информативная полоса</div>
                  <p className="text-[12.5px] text-slate-400 leading-relaxed">{qty.band}</p>
                </div>
                <div className="mt-3.5 pt-3.5 border-t" style={{ borderColor: 'rgba(148,163,184,0.12)' }}>
                  <div className="text-[11px] text-slate-500 uppercase tracking-wide mb-1.5">Нормирующий документ</div>
                  <p className="text-[12.5px] text-slate-400 leading-relaxed">
                    {qty.normedBy} <ClaimTag claim={qty.claim} />
                  </p>
                </div>
              </div>
            </div>

            <SectionTitle note="Теперь — собственно предмет линии. Формулировка замысла даётся ровно так, как она стоит в каталоге, без усиления.">
              «Прошивка» сеткой: замысел и его незакрытая середина
            </SectionTitle>

            <div className="grid lg:grid-cols-[1fr_320px] gap-5 mb-6">
              <div className={CARD} style={CARD_STYLE}>
                <div className="flex items-center gap-2 mb-3">
                  <Grid3x3 size={16} style={{ color: ACCENT }} />
                  <span className="text-[13px] font-bold text-white">Заявленный принцип</span>
                  <StageBadge stage={MESH_IDEA.stage} />
                </div>
                <p className="text-[13.5px] text-slate-300 leading-[1.75]">{MESH_IDEA.claim}</p>
                <div className="text-[10.5px] text-slate-500 font-mono mt-3">{MESH_IDEA.origin}</div>
              </div>

              <div
                className="rounded-xl border p-5"
                style={{ borderColor: 'rgba(251,191,36,0.28)', background: 'rgba(251,191,36,0.06)' }}
              >
                <div className="flex items-center gap-2 mb-2.5">
                  <AlertTriangle size={15} style={{ color: '#fbbf24' }} />
                  <span className="text-[12.5px] font-bold text-amber-200">Принцип преобразования</span>
                </div>
                <p className="text-[12.5px] text-amber-100/80 leading-relaxed">{MESH_IDEA.transduction}</p>
              </div>
            </div>

            <div className="mb-10">
              <Caveat>
                Проводящая сетка сама по себе не является преобразователем вибрации. Пока не назван
                физический эффект, превращающий деформацию в электрический сигнал, всё, что идёт ниже
                про полосу, чувствительность и достижимые дефекты, остаётся расчётом от неизвестной.
              </Caveat>
            </div>

            <SectionTitle note="Сравнение с точечным датчиком — по аспектам, а не по общему впечатлению. Ни одна строка справа пока не подтверждена измерением: это заявленные различия, а не измеренные.">
              Точечный датчик против распределённой сетки
            </SectionTitle>

            <div className="space-y-3 mb-10">
              {POINT_VS_MESH.map((c) => (
                <div key={c.aspect} className="rounded-xl border p-4 sm:p-5" style={CARD_STYLE}>
                  <div className="flex items-center gap-2.5 mb-3 flex-wrap">
                    <Layers size={14} style={{ color: ACCENT }} />
                    <span className="text-[13.5px] font-bold text-white">{c.aspect}</span>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded font-semibold uppercase tracking-wide"
                      style={
                        c.status === 'verified'
                          ? { color: '#34d399', background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.28)' }
                          : { color: '#fbbf24', background: 'rgba(251,191,36,0.10)', border: '1px solid rgba(251,191,36,0.28)' }
                      }
                    >
                      {c.status === 'verified' ? 'проверено' : 'не проверено'}
                    </span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div
                      className="rounded-lg border px-3.5 py-2.5"
                      style={{ borderColor: 'rgba(148,163,184,0.18)', background: 'rgba(148,163,184,0.04)' }}
                    >
                      <div className="text-[10.5px] uppercase tracking-wide mb-1 text-slate-500">Точечный датчик</div>
                      <p className="text-[12.5px] text-slate-300 leading-relaxed">{c.point}</p>
                    </div>
                    <div
                      className="rounded-lg border px-3.5 py-2.5"
                      style={{ borderColor: `${ACCENT}33`, background: `${ACCENT}0A` }}
                    >
                      <div className="text-[10.5px] uppercase tracking-wide mb-1" style={{ color: ACCENT }}>LabForge Mesh</div>
                      <p className="text-[12.5px] text-slate-300 leading-relaxed">{c.mesh}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <SectionTitle note="Список вопросов, которые закрываются работой, а не формулировкой. Каждый из них блокирует что-то конкретное — это указано.">
              Открытые вопросы метода
            </SectionTitle>

            <div className="space-y-3 mb-10">
              {MESH_QUESTIONS.map((q) => (
                <div key={q.id} className="rounded-xl border p-4 sm:p-5" style={CARD_STYLE}>
                  <div className="flex items-start gap-4">
                    <div
                      className="w-11 h-9 rounded-lg shrink-0 flex items-center justify-center text-[11px] font-mono font-bold"
                      style={{ color: '#fbbf24', background: 'rgba(251,191,36,0.10)', border: '1px solid rgba(251,191,36,0.28)' }}
                    >
                      {q.id}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[14px] font-bold text-white leading-snug">{q.question}</h3>
                      <p className="text-[12.5px] text-slate-400 leading-relaxed mt-2">{q.why}</p>
                      <div className="mt-2.5 pt-2.5 border-t" style={{ borderColor: 'rgba(148,163,184,0.12)' }}>
                        <div className="text-[10.5px] uppercase tracking-wide mb-1" style={{ color: '#f87171' }}>Что блокирует</div>
                        <p className="text-[12.5px] text-red-100/70 leading-relaxed">{q.blocks}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <SectionTitle note="Уровни зрелости обслуживания. Нужны, чтобы не выдавать одно за другое: контроль состояния и прогноз остаточного ресурса — разные уровни с разными требованиями к данным.">
              Реактивное → плановое → по состоянию → предиктивное
            </SectionTitle>

            <div className="space-y-3 mb-6">
              {MAINTENANCE_LEVELS.map((m) => (
                <div key={m.id} className="rounded-xl border p-4 sm:p-5" style={CARD_STYLE}>
                  <div className="flex items-start gap-4">
                    <div
                      className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center text-[13px] font-mono font-bold"
                      style={{ color: ACCENT, background: `${ACCENT}12`, border: `1px solid ${ACCENT}33` }}
                    >
                      {m.level}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <h3 className="text-[14.5px] font-bold text-white">{m.name}</h3>
                        {m.labforgeStage && <StageBadge stage={m.labforgeStage} />}
                      </div>
                      <p className="text-[13px] text-slate-300 leading-relaxed mt-2">{m.description}</p>
                      <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 mt-3">
                        <div>
                          <div className="text-[10.5px] uppercase tracking-wide mb-1 text-slate-500">Что требуется</div>
                          <p className="text-[12px] text-slate-400 leading-relaxed">{m.needs}</p>
                        </div>
                        <div>
                          <div className="text-[10.5px] uppercase tracking-wide mb-1 text-slate-500">Нормативная опора</div>
                          <p className="text-[12px] text-slate-400 leading-relaxed">{m.standard}</p>
                        </div>
                      </div>
                      <div className="mt-3 pt-2.5 border-t" style={{ borderColor: 'rgba(148,163,184,0.12)' }}>
                        <div className="text-[10.5px] uppercase tracking-wide mb-1" style={{ color: ACCENT }}>Где здесь LabForge</div>
                        <p className="text-[12.5px] text-slate-300 leading-relaxed">{m.labforge}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Caveat>{MATURITY_HONEST}</Caveat>
          </div>
        )}

        {/* ── Что диагностируем ─────────────────────────────────── */}
        {tab === 'defects' && (
          <div>
            <SectionTitle note="Диагноз ставится не по уровню вибрации, а по тому, на каких частотах сидит её энергия. Ниже — дефекты, их сигнатуры и величина, в которой дефект проявляется раньше всего. Для каждого отдельно сказано, достижим ли он «прошивкой сеткой» — и это честная колонка, а не рекламная.">
              Дефекты и их частотные сигнатуры
            </SectionTitle>

            <div className="space-y-3 mb-10">
              {DEFECTS.map((d) => (
                <div key={d.id} className="rounded-xl border p-4 sm:p-5" style={CARD_STYLE}>
                  <div className="flex items-start justify-between gap-3 flex-wrap mb-1.5">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <Wrench size={15} style={{ color: ACCENT }} />
                      <h3 className="text-[14.5px] font-bold text-white">{d.name}</h3>
                      <span className="text-[10px] text-slate-500 font-mono">{d.id}</span>
                    </div>
                    <ClaimTag claim={d.claim} />
                  </div>
                  <div className="text-[12px] text-slate-500 mb-3">{d.where}</div>

                  <div
                    className="rounded-lg border px-3.5 py-3"
                    style={{ borderColor: `${ACCENT}2E`, background: `${ACCENT}0A` }}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Activity size={12} style={{ color: ACCENT }} />
                      <span className="text-[10.5px] uppercase tracking-wide" style={{ color: ACCENT }}>Сигнатура</span>
                    </div>
                    <p className="text-[12.5px] text-slate-200 leading-[1.8]">{d.signature}</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 mt-3">
                    <div>
                      <div className="text-[10.5px] uppercase tracking-wide mb-1 text-slate-500">Показывает раньше всего</div>
                      <p className="text-[12px] text-slate-400 leading-relaxed">{d.bestQuantity}</p>
                    </div>
                    <div>
                      <div className="text-[10.5px] uppercase tracking-wide mb-1 text-slate-500">Стандарт</div>
                      <p className="text-[12px] text-slate-400 leading-relaxed">{d.standard}</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t" style={{ borderColor: 'rgba(148,163,184,0.12)' }}>
                    <div className="text-[10.5px] uppercase tracking-wide mb-1" style={{ color: '#fbbf24' }}>
                      Достижим ли сеткой
                    </div>
                    <p className="text-[12.5px] text-amber-100/75 leading-relaxed">{d.meshReach}</p>
                  </div>
                </div>
              ))}
            </div>

            <SectionTitle note="Оценка тяжести вибрации по зонам A/B/C/D. Зона отвечает на вопрос «можно ли эксплуатировать», а не «что именно сломалось».">
              Классы машин и зоны оценки
            </SectionTitle>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
              {ZONE_MEANING.map((z) => (
                <div
                  key={z.zone}
                  className="rounded-xl border p-4"
                  style={{ borderColor: `${z.color}33`, background: `${z.color}0A` }}
                >
                  <div className="text-2xl font-bold mb-1.5" style={{ color: z.color }}>{z.zone}</div>
                  <p className="text-[12px] text-slate-300 leading-relaxed">{z.meaning}</p>
                </div>
              ))}
            </div>

            <div className={`${CARD} mb-5 overflow-x-auto`} style={CARD_STYLE}>
              <table className="w-full text-left border-collapse min-w-[560px]">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(148,163,184,0.16)' }}>
                    <th className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold pb-2.5 pr-4">Класс</th>
                    <th className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold pb-2.5 px-2 text-right">A/B</th>
                    <th className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold pb-2.5 px-2 text-right">B/C</th>
                    <th className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold pb-2.5 px-2 text-right">C/D</th>
                    <th className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold pb-2.5 pl-4">Единица</th>
                  </tr>
                </thead>
                <tbody>
                  {MACHINE_CLASSES.map((c) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid rgba(148,163,184,0.08)' }}>
                      <td className="py-3 pr-4 align-top">
                        <div className="text-[13px] font-semibold text-white">{c.name}</div>
                        <div className="text-[11.5px] text-slate-500 leading-relaxed mt-0.5 max-w-md">{c.examples}</div>
                        <div className="mt-1"><ClaimTag claim={c.claim} /></div>
                      </td>
                      <td className="py-3 px-2 text-right align-top font-mono text-[13px]" style={{ color: '#a3e635' }}>{c.ab}</td>
                      <td className="py-3 px-2 text-right align-top font-mono text-[13px]" style={{ color: '#fbbf24' }}>{c.bc}</td>
                      <td className="py-3 px-2 text-right align-top font-mono text-[13px]" style={{ color: '#f87171' }}>{c.cd}</td>
                      <td className="py-3 pl-4 align-top text-[11.5px] text-slate-500">мм/с СКЗ</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 mb-10">
              <Caveat>{CLASSES_CAVEAT}</Caveat>
              <Caveat>{ZONES_LIMIT}</Caveat>
            </div>

            <SectionTitle note="Что именно измеряется на конкретном объекте — с привязкой к методам отраслевой карты. Здесь же названо, где «прошивка» неприменима в принципе: скважинный насос недоступен снаружи, а магистральная труба — задача другой линии.">
              Точки применения на объектах
            </SectionTitle>

            <div className="grid lg:grid-cols-[280px_1fr] gap-5">
              <div className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-1">
                {APPLICATION_POINTS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPointId(p.id)}
                    className="text-left px-3.5 py-2.5 rounded-lg text-[12.5px] font-semibold whitespace-nowrap lg:whitespace-normal border transition-colors shrink-0"
                    style={{
                      color: pointId === p.id ? ACCENT : '#cbd5e1',
                      borderColor: pointId === p.id ? `${ACCENT}55` : 'rgba(148,163,184,0.14)',
                      background: pointId === p.id ? `${ACCENT}12` : 'rgba(15,23,42,0.40)',
                    }}
                  >
                    <span className="block">{p.object}</span>
                    <span className="block text-[10.5px] font-mono font-normal mt-0.5 text-slate-500">{p.methodId}</span>
                  </button>
                ))}
              </div>

              <div className={CARD} style={CARD_STYLE}>
                <h3 className="text-[15px] font-bold text-white mb-1.5">{point.object}</h3>
                <div className="text-[11.5px] text-slate-500 font-mono mb-3">{point.methodId}</div>

                <div className="mb-3.5">
                  <div className="text-[10.5px] uppercase tracking-wide mb-1 text-slate-500">Машинный состав</div>
                  <p className="text-[12.5px] text-slate-300 leading-relaxed">{point.machines}</p>
                </div>

                <div className="mb-3.5 pt-3 border-t" style={{ borderColor: 'rgba(148,163,184,0.12)' }}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Ruler size={12} className="text-slate-500" />
                    <div className="text-[10.5px] uppercase tracking-wide text-slate-500">Что и где измеряется</div>
                  </div>
                  <p className="text-[12.5px] text-slate-300 leading-[1.75]">{point.what}</p>
                </div>

                {point.defects.length > 0 && (
                  <div className="mb-3.5">
                    <div className="text-[10.5px] uppercase tracking-wide mb-1.5 text-slate-500">Ожидаемые дефекты</div>
                    <div className="flex flex-wrap gap-1.5">
                      {point.defects.map((id) => {
                        const d = DEFECTS.find((x) => x.id === id);
                        return (
                          <span
                            key={id}
                            className="text-[11px] px-2 py-0.5 rounded"
                            style={{ color: ACCENT, background: `${ACCENT}12`, border: `1px solid ${ACCENT}2E` }}
                          >
                            {d ? d.name : id}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="mb-3.5 pt-3 border-t" style={{ borderColor: 'rgba(148,163,184,0.12)' }}>
                  <div className="text-[10.5px] uppercase tracking-wide mb-1 text-slate-500">Отраслевые документы</div>
                  <p className="text-[12.5px] text-slate-400 leading-relaxed">{point.standard}</p>
                </div>

                <div
                  className="rounded-lg border px-3.5 py-2.5"
                  style={{ borderColor: 'rgba(251,191,36,0.28)', background: 'rgba(251,191,36,0.06)' }}
                >
                  <div className="text-[10.5px] uppercase tracking-wide mb-1" style={{ color: '#fbbf24' }}>
                    Ограничение для сетки на этом объекте
                  </div>
                  <p className="text-[12.5px] text-amber-100/80 leading-relaxed">{point.meshNote}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Стандарты ─────────────────────────────────────────── */}
        {tab === 'standards' && (
          <div>
            <SectionTitle note="Нормативные рамки вибродиагностики. У каждой указано, применима ли она к задаче «прошивки сеткой» и чего она не покрывает. Там, где рамка не подходит, это сказано прямо, а не обойдено молчанием.">
              Стандарты: что покрывают и чего не покрывают
            </SectionTitle>

            <div className="space-y-3 mb-8">
              {STANDARDS.map((s) => (
                <div key={s.code} className="rounded-xl border p-4 sm:p-5" style={CARD_STYLE}>
                  <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <FileCheck2 size={15} style={{ color: ACCENT }} />
                      <span className="text-[14px] font-bold text-white font-mono">{s.code}</span>
                      <ClaimTag claim={s.claim} />
                    </div>
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide"
                      style={{
                        color: APPLICABILITY_COLOR[s.applicability],
                        background: `${APPLICABILITY_COLOR[s.applicability]}18`,
                        border: `1px solid ${APPLICABILITY_COLOR[s.applicability]}33`,
                      }}
                    >
                      {APPLICABILITY_LABEL[s.applicability]}
                    </span>
                  </div>
                  <div className="text-[12.5px] text-slate-400 mb-2.5">{s.title}</div>
                  <p className="text-[13px] text-slate-300 leading-relaxed">{s.covers}</p>
                  <div className="mt-3 pt-3 border-t" style={{ borderColor: 'rgba(148,163,184,0.12)' }}>
                    <div className="text-[10.5px] uppercase tracking-wide mb-1" style={{ color: '#f87171' }}>
                      Чего рамка не покрывает
                    </div>
                    <p className="text-[12.5px] text-slate-400 leading-relaxed">{s.limit}</p>
                  </div>
                </div>
              ))}
            </div>

            <div
              className="rounded-xl border p-5 mb-10"
              style={{ borderColor: 'rgba(251,191,36,0.30)', background: 'rgba(251,191,36,0.06)' }}
            >
              <div className="flex items-center gap-2 mb-2.5">
                <Scale size={16} style={{ color: '#fbbf24' }} />
                <span className="text-[13.5px] font-bold text-amber-200">Пробел в нормативной базе</span>
              </div>
              <ul className="space-y-2">
                {STANDARDS_GAP.map((g) => (
                  <li key={g} className="text-[13px] text-amber-100/80 leading-[1.75] flex gap-2">
                    <span className="text-amber-400/60 shrink-0">—</span>
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            </div>

            <SectionTitle note={MARKET_DISCLAIMER}>
              Рыночная референция
            </SectionTitle>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
              {MARKET_REFERENCE.map((m) => (
                <div key={m.vendor} className={CARD} style={CARD_STYLE}>
                  <div className="flex items-center gap-2 mb-1">
                    <Signal size={14} className="text-slate-500" />
                    <span className="text-[13.5px] font-bold text-white">{m.vendor}</span>
                  </div>
                  <div className="text-[11.5px] text-slate-500 mb-3">{m.product}</div>
                  <div>
                    {m.specs.map((s) => (
                      <SpecRow key={s.label} spec={s} />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <Caveat>{MESH_VS_MARKET}</Caveat>

            <div className="text-[11.5px] text-slate-500 mt-4 font-mono">
              Источник раздела — позиция каталога OG-EQ-VIB-REF.
            </div>
          </div>
        )}

        {/* ── Статус ────────────────────────────────────────────── */}
        {tab === 'status' && (
          <div>
            <SectionTitle note="Отдельным блоком, а не примечанием: перечень того, что не проверено. Он идёт первым намеренно — раньше списка достижений.">
              Что не проверено
            </SectionTitle>

            <div
              className="rounded-xl border p-5 mb-10"
              style={{ borderColor: 'rgba(248,113,113,0.30)', background: 'rgba(248,113,113,0.07)' }}
            >
              <ul className="space-y-2.5">
                {NOT_TESTED.map((t) => (
                  <li key={t} className="text-[13px] text-red-100/85 leading-[1.75] flex gap-2.5">
                    <XCircle size={14} className="shrink-0 mt-1" style={{ color: '#f87171' }} />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <SectionTitle note="Раздельно: что действительно существует и что не существует. Формулировки стадии совпадают с каталогом намеренно — расхождение между витриной и каталогом было бы дефектом корпуса.">
              Что реально сделано, а что нет
            </SectionTitle>

            <div className="grid md:grid-cols-2 gap-5 mb-10">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 size={15} style={{ color: '#34d399' }} />
                  <h3 className="text-[13.5px] font-bold text-white">Существует</h3>
                  <span className="text-[11px] text-slate-500">{STATUS_DONE.length}</span>
                </div>
                <div className="space-y-3">
                  {STATUS_DONE.map((s) => (
                    <div
                      key={s.title}
                      className="rounded-xl border p-4"
                      style={{ borderColor: 'rgba(52,211,153,0.20)', background: 'rgba(15,23,42,0.45)' }}
                    >
                      <div className="flex items-start justify-between gap-3 flex-wrap mb-1.5">
                        <h4 className="text-[13.5px] font-bold text-white">{s.title}</h4>
                        <StageBadge stage={s.stage} />
                      </div>
                      <p className="text-[12.5px] text-slate-400 leading-relaxed">{s.text}</p>
                      {s.catalogId && (
                        <div className="text-[10.5px] text-slate-500 font-mono mt-2">{s.catalogId}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <XCircle size={15} style={{ color: '#f87171' }} />
                  <h3 className="text-[13.5px] font-bold text-white">Предстоит, в такой очерёдности</h3>
                  <span className="text-[11px] text-slate-500">{STATUS_NOT_DONE.length}</span>
                </div>
                <div className="space-y-3">
                  {STATUS_NOT_DONE.map((s) => (
                    <div
                      key={s.title}
                      className="rounded-xl border p-4"
                      style={{ borderColor: 'rgba(248,113,113,0.20)', background: 'rgba(15,23,42,0.45)' }}
                    >
                      <div className="flex items-start justify-between gap-3 flex-wrap mb-1.5">
                        <h4 className="text-[13.5px] font-bold text-white">{s.title}</h4>
                        <StageBadge stage={s.stage} />
                      </div>
                      <p className="text-[12.5px] text-slate-400 leading-relaxed">{s.text}</p>
                      {s.catalogId && (
                        <div className="text-[10.5px] text-slate-500 font-mono mt-2">{s.catalogId}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <SectionTitle note="Значения, которые закрываются измерением, а не догадкой. Пока они не получены, здесь стоит маркер, а не правдоподобная подстановка.">
              Открытые пробелы
            </SectionTitle>

            <div className={`${CARD} mb-10`} style={CARD_STYLE}>
              <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
                {OPEN_GAPS.map((g) => (
                  <li key={g} className="text-[12.5px] text-slate-400 leading-relaxed flex gap-2">
                    <CircleDashed size={13} className="shrink-0 mt-0.5 text-slate-600" />
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            </div>

            <SectionTitle note="Страница разворачивает шесть позиций каталога «Газнефть» — головную и связанные с ней.">
              Позиции каталога
            </SectionTitle>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {CATALOG_REFS.map((c) => (
                <div key={c.id} className={CARD} style={CARD_STYLE}>
                  <div className="text-[10.5px] text-slate-500 font-mono mb-1.5">{c.id}</div>
                  <h4 className="text-[13.5px] font-bold text-white leading-snug mb-2">{c.title}</h4>
                  <p className="text-[12px] text-slate-400 leading-relaxed">{c.note}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/oilgas"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-semibold text-slate-900"
                style={{ background: ACCENT }}
              >
                Каталог модуля «Газнефть» <ArrowRight size={15} />
              </Link>
              <Link
                href="/tokenization"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-semibold border text-slate-200"
                style={{ borderColor: 'rgba(148,163,184,0.28)' }}
              >
                <TrendingUp size={15} /> Токенизация измерений
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ── Подвал страницы ─────────────────────────────────────── */}
      <div className="border-t" style={{ borderColor: 'rgba(148,163,184,0.12)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-start gap-3">
            <ShieldCheck size={15} className="shrink-0 mt-0.5 text-slate-500" />
            <p className="text-[12px] text-slate-500 leading-relaxed max-w-3xl">
              Материал носит описательный характер и не является офертой или техническим предложением.
              Приведённые границы зон и формулы — общеизвестные положения вибродиагностики и
              соответствующих стандартов; редакции документов следует сверять по действующим текстам.
              Характеристики систем сторонних производителей приведены по их публикациям и
              независимо не проверялись. Экспериментальная схема съёма не заменяет и не может
              заменять штатную систему аварийной защиты машины.
            </p>
          </div>
          <div className="flex items-center gap-2 mt-4 text-[11px] text-slate-600">
            <Gauge size={12} />
            <span>Стадия линии — концепт метода и прототип сетки. Обновляется по мере получения измерений.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
