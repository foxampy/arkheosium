/**
 * TokenizationPage — вторая линия LabForge: запечатывание измерений
 * в хэш-ноды и эмиссия токена измерения.
 * Маршрут: /tokenization
 *
 * Разворачивает позицию каталога «Газнефть» OG-RD-HASH-001 до страницы,
 * опираясь на типизированную модель в src/data/tokenization/model.ts.
 *
 * Дисциплина корпуса — как в каталоге и на странице интеграционного
 * модуля, но строже, потому что предмет юридически чувствительный:
 *  — токен не выпущен, сеть узлов не развёрнута, сертификатов нет;
 *    это сказано на каждой вкладке, а не спрятано в примечании;
 *  — оговорка «это не финансовый инструмент» выведена постоянным
 *    блоком под шапкой и продублирована на вкладке модели токена;
 *  — цен, курсов, доходностей, объёмов эмиссии и долей здесь нет,
 *    потому что их не существует;
 *  — там, где решение не принято, стоит ⟨заполнить⟩ или ⟨не решено⟩,
 *    а не правдоподобная подстановка;
 *  — у каждого стандарта названо не только что он покрывает,
 *    но и чего он не покрывает.
 */

import { useState } from 'react';
import { Link } from 'wouter';
import {
  Fingerprint, ArrowLeft, ArrowRight, Ban, Scale, Users2,
  ShieldCheck, AlertTriangle, CheckCircle2, XCircle, SearchCheck,
  Link2, KeyRound, Landmark, Boxes, ListChecks, Workflow,
  FileCheck2, Gauge, CircleDashed,
} from 'lucide-react';
import {
  T_STAGE_LABEL, T_CLAIM_LABEL, T_STAGE_COLOR, T_CLAIM_COLOR,
  MEASUREMENT_FIELDS, HASH_NODE_RULES, CHAIN_STEPS,
  TOKEN_MODEL, NON_FINANCIAL, PARTICIPANT_ROLES,
  STANDARDS, STANDARDS_GAP, APPLICABILITY_LABEL, APPLICABILITY_COLOR,
  VERIFICATION_LAYERS, STATUS_DONE, STATUS_NOT_DONE, OPEN_GAPS, CATALOG_REFS,
  type Stage, type ClaimBasis, type Spec,
} from '@/data/tokenization/model';

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
        color: T_STAGE_COLOR[stage],
        background: `${T_STAGE_COLOR[stage]}18`,
        border: `1px solid ${T_STAGE_COLOR[stage]}33`,
      }}
    >
      {T_STAGE_LABEL[stage]}
    </span>
  );
}

function ClaimTag({ claim }: { claim: ClaimBasis }) {
  return (
    <span
      className="inline-flex items-center text-[10px] whitespace-nowrap"
      style={{ color: T_CLAIM_COLOR[claim] }}
    >
      {T_CLAIM_LABEL[claim]}
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

/** Предупреждение янтарного цвета — как в каталоге и интеграционном модуле. */
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
 * Постоянная юридическая оговорка. Рендерится под шапкой на всех вкладках,
 * потому что она обязана быть видна, а не найдена.
 */
function NonFinancialBanner({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className="rounded-xl border p-4 sm:p-5"
      style={{ borderColor: 'rgba(248,113,113,0.30)', background: 'rgba(248,113,113,0.07)' }}
    >
      <div className="flex items-center gap-2 mb-2.5">
        <Ban size={16} style={{ color: '#f87171' }} />
        <span className="text-[13px] font-bold text-red-200">{NON_FINANCIAL.title}</span>
      </div>
      <ul className="space-y-1.5">
        {(compact ? NON_FINANCIAL.points.slice(0, 3) : NON_FINANCIAL.points).map((p) => (
          <li key={p} className="text-[12.5px] text-red-100/80 leading-relaxed flex gap-2">
            <span className="text-red-400/60 shrink-0">—</span>
            <span>{p}</span>
          </li>
        ))}
      </ul>
      {compact && (
        <p className="text-[11.5px] text-red-200/60 mt-2.5">
          Полный текст оговорки — на вкладке «Модель токена».
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────

type Tab = 'how' | 'token' | 'verify' | 'status';

export default function TokenizationPage() {
  const [tab, setTab] = useState<Tab>('how');
  const [fieldKey, setFieldKey] = useState<string>('what');
  const [roleId, setRoleId] = useState<string>('operator');

  const field = MEASUREMENT_FIELDS.find((f) => f.key === fieldKey) ?? MEASUREMENT_FIELDS[0];
  const role = PARTICIPANT_ROLES.find((r) => r.id === roleId) ?? PARTICIPANT_ROLES[0];

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
            <Fingerprint size={18} style={{ color: ACCENT }} />
            <span className="text-[11px] font-bold tracking-[0.18em] uppercase" style={{ color: ACCENT }}>
              LabForge · Токенизация измерений
            </span>
            <span className="text-[10px] text-slate-500 font-mono">OG-RD-HASH-001</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold text-white leading-tight max-w-3xl">
            Измерение запечатывается в хэш-ноду, и токен выпускается на измерение — не на актив
          </h1>
          <p className="text-[14px] sm:text-base text-slate-400 mt-4 max-w-2xl leading-relaxed">
            Вторая линия LabForge. Показание снимается вместе с прибором, временем, местом,
            ответственной ролью и неопределённостью, отпечаток считается на краю сети в момент
            снятия, ноды сцепляются в цепочку. Хэш подтверждает неизменность записи — достоверность
            числа подтверждает метрология, и одно другого не заменяет.
          </p>

          <div className="flex flex-wrap gap-6 mt-8">
            {[
              { v: '0', l: 'токенов эмитировано' },
              { v: '0', l: 'узлов развёрнуто' },
              { v: '0', l: 'сертификатов выдано' },
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
            ['how', 'Как это работает', Workflow],
            ['token', 'Модель токена', Link2],
            ['verify', 'Верификация', SearchCheck],
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
        {/* Оговорка видна на любой вкладке. */}
        <div className="mb-8">
          <NonFinancialBanner compact={tab !== 'token'} />
        </div>

        {/* ── Как это работает ──────────────────────────────────── */}
        {tab === 'how' && (
          <div>
            <SectionTitle note="Прежде чем говорить о цепочке и токене, надо назвать, что именно запечатывается. Число без контекста измерением не является: «17,4» совпадает у сотни разных измерений и не сравнимо ни с порогом, ни с прошлым замером. В модели измерение — это набор полей, отвечающих на семь обязательных вопросов.">
              Что считается измерением
            </SectionTitle>

            <div className="grid lg:grid-cols-[280px_1fr] gap-5 mb-10">
              <div className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-1">
                {MEASUREMENT_FIELDS.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setFieldKey(f.key)}
                    className="text-left px-3.5 py-2.5 rounded-lg text-[12.5px] font-semibold whitespace-nowrap lg:whitespace-normal border transition-colors shrink-0"
                    style={{
                      color: fieldKey === f.key ? ACCENT : '#cbd5e1',
                      borderColor: fieldKey === f.key ? `${ACCENT}55` : 'rgba(148,163,184,0.14)',
                      background: fieldKey === f.key ? `${ACCENT}12` : 'rgba(15,23,42,0.40)',
                    }}
                  >
                    <span className="block">{f.question}</span>
                    <span className="block text-[10.5px] font-normal mt-0.5" style={{ color: f.required ? '#94a3b8' : '#64748b' }}>
                      {f.required ? 'обязательное поле' : 'дополнительное поле'}
                    </span>
                  </button>
                ))}
              </div>

              <div className={CARD} style={CARD_STYLE}>
                <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                  <h3 className="text-[15px] font-bold text-white">{field.title}</h3>
                  <div className="flex items-center gap-2">
                    {field.inDigest && (
                      <span className="text-[10px] px-2 py-0.5 rounded" style={{ color: ACCENT, background: `${ACCENT}18`, border: `1px solid ${ACCENT}33` }}>
                        входит в дайджест
                      </span>
                    )}
                    <span
                      className="text-[10px] px-2 py-0.5 rounded"
                      style={
                        field.required
                          ? { color: '#34d399', background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.28)' }
                          : { color: '#94a3b8', background: 'rgba(148,163,184,0.10)', border: '1px solid rgba(148,163,184,0.22)' }
                      }
                    >
                      {field.required ? 'обязательное' : 'дополнительное'}
                    </span>
                  </div>
                </div>
                <p className="text-[13.5px] text-slate-300 leading-[1.75]">{field.description}</p>
                <div className="mt-4 pt-3.5 border-t" style={{ borderColor: 'rgba(148,163,184,0.12)' }}>
                  <div className="text-[11px] text-slate-500 uppercase tracking-wide mb-1.5">Чем поле подтверждается вне записи</div>
                  <p className="text-[12.5px] text-slate-400 leading-relaxed">{field.backing}</p>
                </div>
              </div>
            </div>

            <SectionTitle note="Правила формирования ноды — это места, где принимаются решения, которые потом нельзя переиграть дёшево. Часть из них принята, часть нет; непринятые названы прямо.">
              Правила формирования хэш-ноды
            </SectionTitle>

            <div className="grid md:grid-cols-2 gap-4 mb-10">
              {HASH_NODE_RULES.map((r) => (
                <div key={r.n} className={CARD} style={CARD_STYLE}>
                  <div className="flex items-start gap-3 mb-2">
                    <span className="text-[11px] font-mono font-bold shrink-0 mt-0.5" style={{ color: ACCENT }}>{r.n}</span>
                    <h3 className="text-[14px] font-bold text-white leading-snug flex-1">{r.title}</h3>
                    <StageBadge stage={r.status} />
                  </div>
                  <p className="text-[12.5px] text-slate-400 leading-relaxed">{r.text}</p>
                  {r.spec && (
                    <div className="mt-3 pt-2 border-t" style={{ borderColor: 'rgba(148,163,184,0.12)' }}>
                      <SpecRow spec={r.spec} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <SectionTitle note="Путь одного измерения от поверенного прибора до проверки третьей стороной. У каждого шага назван действующий и то, что на этом шаге может быть подменено, — потому что цепочка настолько прочна, насколько прочно её слабейшее звено, а слабейшее звено здесь нулевое и не цифровое.">
              Путь измерения: от прибора до проверки
            </SectionTitle>

            <div className="space-y-3 mb-10">
              {CHAIN_STEPS.map((s) => (
                <div key={s.n} className="rounded-xl border p-4 sm:p-5" style={CARD_STYLE}>
                  <div className="flex items-start gap-4">
                    <div
                      className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center text-[12px] font-mono font-bold"
                      style={{ color: ACCENT, background: `${ACCENT}12`, border: `1px solid ${ACCENT}33` }}
                    >
                      {s.n}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <h3 className="text-[14.5px] font-bold text-white">{s.title}</h3>
                        <StageBadge stage={s.stage} />
                      </div>
                      <div className="text-[11.5px] text-slate-500 mt-0.5">{s.actor}</div>
                      <p className="text-[13px] text-slate-300 leading-relaxed mt-2.5">{s.body}</p>
                      <div
                        className="mt-3 rounded-lg border px-3.5 py-2.5"
                        style={{ borderColor: 'rgba(251,191,36,0.22)', background: 'rgba(251,191,36,0.05)' }}
                      >
                        <div className="text-[10.5px] uppercase tracking-wide mb-1" style={{ color: '#fbbf24' }}>
                          Где рвётся
                        </div>
                        <p className="text-[12.5px] text-amber-100/75 leading-relaxed">{s.risk}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Caveat>
              Ни один шаг этой цепочки не выполняется сейчас на реальном объекте: сеть узлов
              ⟨не развёрнута⟩, пилотных площадок для линии не назначено. Описанное — модель и
              прототип узла, а не работающий контур.
            </Caveat>
          </div>
        )}

        {/* ── Модель токена ─────────────────────────────────────── */}
        {tab === 'token' && (
          <div>
            <SectionTitle note="Токенизируется подтверждённое измерение, а не актив. Разница не терминологическая: токен на актив представляет вещь и права на неё, токен на измерение представляет только факт, что измерение было выполнено конкретным прибором в конкретный момент и запечатано.">
              Что запечатывается и что эмитируется
            </SectionTitle>

            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <div className={CARD} style={CARD_STYLE}>
                <div className="flex items-center gap-2 mb-3">
                  <KeyRound size={15} style={{ color: ACCENT }} />
                  <h3 className="text-[14px] font-bold text-white">Что запечатывается в ноду</h3>
                </div>
                <ul className="space-y-2.5">
                  {TOKEN_MODEL.sealed.map((t) => (
                    <li key={t} className="text-[12.5px] text-slate-300 leading-relaxed flex gap-2.5">
                      <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full" style={{ background: ACCENT }} />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={CARD} style={CARD_STYLE}>
                <div className="flex items-center gap-2 mb-3">
                  <Link2 size={15} style={{ color: ACCENT }} />
                  <h3 className="text-[14px] font-bold text-white">Что эмитируется и на что</h3>
                </div>
                <ul className="space-y-2.5">
                  {TOKEN_MODEL.emitted.map((t) => (
                    <li key={t} className="text-[12.5px] text-slate-300 leading-relaxed flex gap-2.5">
                      <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full" style={{ background: ACCENT }} />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div
              className="rounded-xl border p-5 mb-8"
              style={{ borderColor: 'rgba(248,113,113,0.24)', background: 'rgba(15,23,42,0.45)' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <XCircle size={15} style={{ color: '#f87171' }} />
                <h3 className="text-[14px] font-bold text-white">Чем токен не является</h3>
              </div>
              <ul className="space-y-2.5">
                {TOKEN_MODEL.isNot.map((t) => (
                  <li key={t} className="text-[12.5px] text-slate-300 leading-relaxed flex gap-2.5">
                    <Ban size={13} className="shrink-0 mt-0.5" style={{ color: '#f87171' }} />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-3.5 border-t" style={{ borderColor: 'rgba(148,163,184,0.12)' }}>
                <div className="text-[11px] text-slate-500 uppercase tracking-wide mb-1.5">
                  Параметры, которых нет
                </div>
                {TOKEN_MODEL.absent.map((s) => (
                  <SpecRow key={s.label} spec={s} />
                ))}
              </div>
            </div>

            <SectionTitle note="Кто действует в схеме, что каждая роль может и — что важнее — чего не может. Столбец «не может» здесь содержательнее столбца «может»: он и определяет, зачем нужна цепочка.">
              Роли участников
            </SectionTitle>

            <div className="grid lg:grid-cols-[280px_1fr] gap-5 mb-10">
              <div className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-1">
                {PARTICIPANT_ROLES.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setRoleId(r.id)}
                    className="text-left px-3.5 py-2.5 rounded-lg text-[12.5px] font-semibold whitespace-nowrap lg:whitespace-normal border transition-colors shrink-0"
                    style={{
                      color: roleId === r.id ? ACCENT : '#cbd5e1',
                      borderColor: roleId === r.id ? `${ACCENT}55` : 'rgba(148,163,184,0.14)',
                      background: roleId === r.id ? `${ACCENT}12` : 'rgba(15,23,42,0.40)',
                    }}
                  >
                    {r.title}
                  </button>
                ))}
              </div>

              <div className={CARD} style={CARD_STYLE}>
                <div className="flex items-center gap-2 mb-2">
                  <Users2 size={15} style={{ color: ACCENT }} />
                  <h3 className="text-[15px] font-bold text-white">{role.title}</h3>
                </div>
                <p className="text-[13px] text-slate-400 leading-relaxed">{role.who}</p>

                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <div className="text-[11px] uppercase tracking-wide mb-2" style={{ color: '#34d399' }}>Может</div>
                    <ul className="space-y-1.5">
                      {role.can.map((c) => (
                        <li key={c} className="text-[12.5px] text-slate-300 leading-relaxed flex gap-2">
                          <CheckCircle2 size={13} className="shrink-0 mt-0.5" style={{ color: '#34d399' }} />
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wide mb-2" style={{ color: '#f87171' }}>Не может</div>
                    <ul className="space-y-1.5">
                      {role.cannot.map((c) => (
                        <li key={c} className="text-[12.5px] text-slate-300 leading-relaxed flex gap-2">
                          <Ban size={13} className="shrink-0 mt-0.5" style={{ color: '#f87171' }} />
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t text-[12px] text-slate-400" style={{ borderColor: 'rgba(148,163,184,0.12)' }}>
                  <span className="text-slate-500">Статус роли: </span>{role.status}
                </div>
              </div>
            </div>

            <Caveat>
              Всё на этой вкладке — проектная схема. Эмиссии не было: токенов выпущено 0, объём
              эмиссии ⟨не определён⟩, единица эмиссии (одна запись или пакет за период) ⟨не решено⟩,
              правовая квалификация в юрисдикциях региона ⟨не проработана⟩.
            </Caveat>
          </div>
        )}

        {/* ── Верификация ───────────────────────────────────────── */}
        {tab === 'verify' && (
          <div>
            <SectionTitle note="Проверка распадается на четыре независимых слоя, и путать их — главная ошибка при разговоре о таких системах. Поэтому у каждого слоя названо не только что он доказывает, но и чего он не доказывает.">
              Кто и что проверяет
            </SectionTitle>

            <div className="space-y-3 mb-10">
              {VERIFICATION_LAYERS.map((l) => (
                <div key={l.n} className="rounded-xl border p-4 sm:p-5" style={CARD_STYLE}>
                  <div className="flex items-start gap-4">
                    <div
                      className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center text-[12px] font-mono font-bold"
                      style={{ color: ACCENT, background: `${ACCENT}12`, border: `1px solid ${ACCENT}33` }}
                    >
                      {l.n}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <h3 className="text-[14.5px] font-bold text-white">{l.title}</h3>
                        <StageBadge stage={l.stage} />
                      </div>
                      <div className="text-[11.5px] text-slate-500 mt-0.5">{l.who}</div>
                      <p className="text-[13px] text-slate-300 leading-relaxed mt-2.5">{l.how}</p>

                      <div className="grid sm:grid-cols-2 gap-3 mt-3">
                        <div
                          className="rounded-lg border px-3.5 py-2.5"
                          style={{ borderColor: 'rgba(52,211,153,0.22)', background: 'rgba(52,211,153,0.05)' }}
                        >
                          <div className="text-[10.5px] uppercase tracking-wide mb-1" style={{ color: '#34d399' }}>Доказывает</div>
                          <p className="text-[12.5px] text-emerald-100/80 leading-relaxed">{l.proves}</p>
                        </div>
                        <div
                          className="rounded-lg border px-3.5 py-2.5"
                          style={{ borderColor: 'rgba(248,113,113,0.22)', background: 'rgba(248,113,113,0.05)' }}
                        >
                          <div className="text-[10.5px] uppercase tracking-wide mb-1" style={{ color: '#f87171' }}>Не доказывает</div>
                          <p className="text-[12.5px] text-red-100/75 leading-relaxed">{l.provesNot}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <SectionTitle note="Нормативные рамки, на которые линия опирается. У каждой указано, применима ли она к задаче токенизации измерений и чего она не покрывает. Там, где рамка не подходит, это сказано, а не обойдено молчанием.">
              Стандарты и рамки: что покрывают и чего не покрывают
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
              className="rounded-xl border p-5"
              style={{ borderColor: 'rgba(251,191,36,0.30)', background: 'rgba(251,191,36,0.06)' }}
            >
              <div className="flex items-center gap-2 mb-2.5">
                <Scale size={16} style={{ color: '#fbbf24' }} />
                <span className="text-[13.5px] font-bold text-amber-200">Пробел в нормативной базе</span>
              </div>
              <p className="text-[13px] text-amber-100/80 leading-[1.75]">{STANDARDS_GAP}</p>
            </div>
          </div>
        )}

        {/* ── Статус ────────────────────────────────────────────── */}
        {tab === 'status' && (
          <div>
            <SectionTitle note="Раздельно: что действительно существует и что не существует. Второй список длиннее первого, и это точное отражение стадии, а не скромность.">
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
                  <h3 className="text-[13.5px] font-bold text-white">Не существует</h3>
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

            <SectionTitle note="Решения, которые закрываются работой, а не догадкой. Пока они не приняты, здесь стоит маркер, а не правдоподобная подстановка.">
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

            <SectionTitle note="Страница разворачивает три позиции каталога «Газнефть». Формулировки стадии здесь и в каталоге совпадают намеренно: расхождение между витриной и каталогом было бы дефектом корпуса.">
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
                href="/oilgas/integration"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-semibold border text-slate-200"
                style={{ borderColor: 'rgba(148,163,184,0.28)' }}
              >
                <Landmark size={15} /> Интеграционный модуль
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
              Материал носит описательный характер и не является офертой, инвестиционной
              рекомендацией или предложением приобрести какой-либо инструмент. Токен измерения
              не выпущен, приём средств не производится. Раздел не связан с VOD Token и разделом
              «Блокчейн» платформы: там описан другой контур со своей токеномикой.
            </p>
          </div>
          <div className="flex items-center gap-2 mt-4 text-[11px] text-slate-600">
            <Gauge size={12} />
            <span>Стадия линии — прототип узла и концепция контура. Обновляется по мере принятия решений.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
