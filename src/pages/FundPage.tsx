/**
 * FundPage — главная посадочная и вход для фонда, инвестора, партнёра.
 *
 * Порядок экранов здесь обратный принятому, и это главное решение
 * страницы. Обычная инвесторская посадочная сначала обещает, потом
 * удерживает, а ограничения ставит в подвал. Но предложения доходности
 * на платформе не существует: средства не привлекаются, инструмента нет,
 * оценки компании нет, привлечено ноль. Посадочная, выясняющая это на
 * шестом экране, пять экранов удерживает внимание под предлогом, которого
 * не существует. Именно это и называют обманом — независимо от того,
 * написана ли правда где-то ниже.
 *
 * Поэтому первый экран отсеивает: если посетитель ищет доходность, ему
 * сказано уйти, и нули стоят до всякого рассказа. Это стоит трафика.
 * Чужое время здесь считается дороже трафика.
 *
 * Шесть частей в порядке возникновения вопросов:
 *
 *   1. Нули и прямой отсев — до первого утверждения о себе.
 *   2. Шесть вопросов, которые фонд задаёт, с ответами в одну фразу.
 *   3. Что можно проверить прямо сейчас — объёмы, записи, пробы с датой.
 *   4. Что предлагается профинансировать — работы, выбираются в пакет.
 *   5. Что фонд получает и чего не получает.
 *   6. Работы, которые денег не требуют, — и потому спрос за них с нас.
 *
 * Своих чисел у страницы нет. Узлы, нули, роли и работы берутся из
 * src/data/platform, сборка пакета — из src/lib/offer/fundPacket.
 * Переписать величину здесь негде, и это единственная защита от того,
 * чтобы одно и то же число разошлось между страницами.
 */

import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import {
  ArrowRight,
  Ban,
  Check,
  ClipboardCopy,
  FileSearch,
  HelpCircle,
  ListChecks,
  ShieldAlert,
  Wrench,
} from 'lucide-react';

import {
  FUND_STEPS,
  FUND_ZEROS,
  NOT_OFFERED,
  SELF_FUNDED,
  WORK_PACKAGES,
} from '@/data/platform/fund';
import {
  NODES,
  NODE_COUNT,
  NODE_LINES_TOTAL,
  NODE_STATUS_COLOR,
  NODE_STATUS_LABEL,
  NODE_WITH_CODE_COUNT,
  STANDARDIZED_COUNT,
} from '@/data/platform/nodes';
import { ZEROS } from '@/data/platform/state';
import { ROLES } from '@/data/platform/roles';
import { buildPacket, packetToText } from '@/lib/offer/fundPacket';

const HAIR = 'rgba(148,163,184,0.16)';
const PANEL = 'rgba(148,163,184,0.03)';
const ACCENT = '#22d3ee';
const WARN = '#f87171';
const OK = '#34d399';

function SectionHead({
  eyebrow,
  title,
  note,
  icon: Icon,
}: {
  eyebrow: string;
  title: string;
  note?: string;
  icon: typeof Wrench;
}) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={15} style={{ color: ACCENT }} />
        <span
          className="text-[10.5px] font-bold tracking-[0.18em] uppercase"
          style={{ color: ACCENT }}
        >
          {eyebrow}
        </span>
      </div>
      <h2 className="text-[17px] sm:text-[19px] font-semibold text-white leading-snug">{title}</h2>
      {note && <p className="text-[13px] text-slate-500 mt-2 max-w-2xl leading-relaxed">{note}</p>}
    </div>
  );
}

/** Счётные величины, которые посетитель может перепроверить сам. */
const EVIDENCE: { n: string; label: string; how: string }[] = [
  {
    n: String(NODE_COUNT),
    label: 'узлов названо',
    how: 'Реестр src/data/platform/nodes.ts. Список и число — одно и то же место.',
  },
  {
    n: String(NODE_WITH_CODE_COUNT),
    label: 'узлов имеют код',
    how: 'У остальных поле «что есть» помечено ⟨заполнить⟩ и статусом «не начат».',
  },
  {
    n: NODE_LINES_TOTAL.toLocaleString('ru-RU'),
    label: 'строк по названным каталогам',
    how: 'Объём проверяется обходом каталогов, указанных у каждого узла. Это мера работы, не готовности.',
  },
  {
    n: String(STANDARDIZED_COUNT),
    label: 'узлов прошло стандартизацию',
    how: 'Считается из реестра. Пока ноль — передавать нечего, и лицензия не составляется.',
  },
];

export default function FundPage() {
  const [picked, setPicked] = useState<string[]>(['account', 'seal']);
  const [copied, setCopied] = useState(false);

  const packet = useMemo(() => buildPacket(picked), [picked]);
  const investor = ROLES.find((r) => r.id === 'investor');

  function toggle(id: string) {
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(packetToText(packet));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="min-h-screen text-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-16">
        {/* ── 1. Отсев до рассказа ─────────────────────────────────── */}
        <section>
          <div
            className="rounded-xl p-5 sm:p-7"
            style={{ border: `1px solid ${WARN}33`, background: 'rgba(248,113,113,0.05)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Ban size={15} style={{ color: WARN }} />
              <span
                className="text-[10.5px] font-bold tracking-[0.18em] uppercase"
                style={{ color: WARN }}
              >
                Прежде чем читать дальше
              </span>
            </div>
            <h1 className="text-[22px] sm:text-[28px] font-semibold text-white leading-tight max-w-3xl">
              Средства не привлекаются. Оценки компании нет. Доходность не предлагается ни в
              каком виде.
            </h1>
            <p className="text-[13.5px] text-slate-400 mt-4 max-w-3xl leading-relaxed">
              Если вы пришли за долей, за инструментом или за доходностью — дальше можно не
              читать, здесь этого нет и не появится к концу страницы. Если вы пришли посмотреть,
              что сделано и что можно довести до передаваемого состояния, — всё остальное про это.
            </p>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
              {FUND_ZEROS.map((z) => (
                <div
                  key={z.id}
                  className="rounded-lg p-3.5"
                  style={{ border: `1px solid ${HAIR}`, background: 'rgba(2,6,23,0.4)' }}
                >
                  <div className="text-[26px] font-semibold leading-none" style={{ color: WARN }}>
                    0
                  </div>
                  <div className="text-[11.5px] text-slate-400 mt-2 leading-snug">{z.short}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 2. Шесть вопросов ────────────────────────────────────── */}
        <section>
          <SectionHead
            icon={HelpCircle}
            eyebrow="Что обычно спрашивают"
            title="Шесть вопросов фонда и ответы на них"
            note="Ответы даны так, как они звучат в разговоре, а не так, как они звучат в презентации."
          />
          <div className="grid md:grid-cols-2 gap-3">
            {FUND_STEPS.map((s, i) => (
              <div
                key={s.id}
                className="rounded-xl p-4"
                style={{ border: `1px solid ${HAIR}`, background: PANEL }}
              >
                <div className="flex items-start gap-3">
                  <span
                    className="shrink-0 w-6 h-6 rounded-md grid place-items-center text-[11px] font-semibold"
                    style={{ background: 'rgba(34,211,238,0.1)', color: ACCENT }}
                  >
                    {i + 1}
                  </span>
                  <div>
                    <div className="text-[13.5px] font-medium text-white leading-snug">
                      {s.question}
                    </div>
                    <div className="text-[12.5px] text-slate-400 mt-1.5 leading-relaxed">
                      {s.answer}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 3. Что проверяется прямо сейчас ──────────────────────── */}
        <section>
          <SectionHead
            icon={FileSearch}
            eyebrow="Проверяемое"
            title="Что можно проверить, не поверив нам на слово"
            note="Каждая величина ниже получена обходом исходников и повторяется без нашего участия. Ни одна из них не является мерой готовности."
          />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {EVIDENCE.map((e) => (
              <div
                key={e.label}
                className="rounded-xl p-4"
                style={{ border: `1px solid ${HAIR}`, background: PANEL }}
              >
                <div className="text-[24px] font-semibold text-white leading-none">{e.n}</div>
                <div className="text-[11.5px] text-slate-300 mt-2 leading-snug">{e.label}</div>
                <div className="text-[11px] text-slate-500 mt-2 leading-relaxed">{e.how}</div>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-3 mt-3">
            {NODES.filter((n) => n.records).map((n) => (
              <div
                key={n.id}
                className="rounded-lg px-4 py-3 flex items-start gap-3"
                style={{ border: `1px solid ${HAIR}`, background: PANEL }}
              >
                <Check size={14} className="mt-0.5 shrink-0" style={{ color: OK }} />
                <div>
                  <span className="text-[12.5px] text-white">{n.title}</span>
                  <span className="text-[12.5px] text-slate-400"> — {n.records}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 4. Что финансировать ─────────────────────────────────── */}
        <section>
          <SectionHead
            icon={Wrench}
            eyebrow="Предмет разговора"
            title="Что именно предлагается профинансировать"
            note="Работа берётся из состояния узла, а не придумывается под встречу. Выберите позиции — пакет соберётся справа и копируется текстом."
          />

          <div className="grid lg:grid-cols-[1fr_380px] gap-4 items-start">
            <div className="space-y-2">
              {WORK_PACKAGES.map((w) => {
                const on = picked.includes(w.nodeId);
                return (
                  <button
                    key={w.nodeId}
                    onClick={() => toggle(w.nodeId)}
                    className="w-full text-left rounded-xl p-4 transition-colors"
                    style={{
                      border: `1px solid ${on ? `${ACCENT}55` : HAIR}`,
                      background: on ? 'rgba(34,211,238,0.05)' : PANEL,
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-[13.5px] font-medium text-white leading-snug">
                        {w.node.title}
                      </div>
                      <span
                        className="shrink-0 text-[10px] px-1.5 py-0.5 rounded"
                        style={{
                          color: NODE_STATUS_COLOR[w.node.status],
                          background: `${NODE_STATUS_COLOR[w.node.status]}1a`,
                        }}
                      >
                        {NODE_STATUS_LABEL[w.node.status]}
                      </span>
                    </div>
                    <div className="text-[12px] text-slate-400 mt-2 leading-relaxed">
                      <span style={{ color: OK }}>Работа. </span>
                      {w.work}
                    </div>
                    <div className="text-[12px] text-slate-500 mt-1.5 leading-relaxed">
                      <span style={{ color: ACCENT }}>Закрывается. </span>
                      {w.closedBy}
                    </div>
                    <div className="text-[11.5px] text-slate-600 mt-1.5">{w.estimate}</div>
                  </button>
                );
              })}
            </div>

            <div
              className="rounded-xl p-4 lg:sticky lg:top-20"
              style={{ border: `1px solid ${HAIR}`, background: 'rgba(2,6,23,0.5)' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <ListChecks size={14} style={{ color: ACCENT }} />
                <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-slate-400">
                  Пакет · выбрано {packet.items.length}
                </span>
              </div>

              {packet.items.length > 0 && (
                <ul className="space-y-1.5 mb-4">
                  {packet.items.map((w) => (
                    <li key={w.nodeId} className="text-[12px] text-slate-300 leading-snug">
                      · {w.node.title}
                    </li>
                  ))}
                </ul>
              )}

              <div
                className="rounded-lg p-3"
                style={{ border: `1px solid ${WARN}33`, background: 'rgba(248,113,113,0.05)' }}
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <ShieldAlert size={12} style={{ color: WARN }} />
                  <span
                    className="text-[10px] font-bold tracking-[0.14em] uppercase"
                    style={{ color: WARN }}
                  >
                    Чего здесь быть не может
                  </span>
                </div>
                <ul className="space-y-2">
                  {packet.warnings.map((t, i) => (
                    <li key={i} className="text-[11.5px] text-slate-400 leading-relaxed">
                      {t}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={copy}
                className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-[12.5px] font-medium transition-colors"
                style={{
                  border: `1px solid ${ACCENT}44`,
                  background: 'rgba(34,211,238,0.07)',
                  color: ACCENT,
                }}
              >
                {copied ? <Check size={14} /> : <ClipboardCopy size={14} />}
                {copied ? 'Скопировано' : 'Скопировать пакет текстом'}
              </button>
              <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
                Пакет — заготовка для разговора. Не оферта, не предложение инвестиции, не
                согласованные условия.
              </p>
            </div>
          </div>
        </section>

        {/* ── 5. Получает / не получает ────────────────────────────── */}
        <section>
          <SectionHead
            icon={ShieldAlert}
            eyebrow="Границы"
            title="Что фонд получает и чего не получает"
            note="Вторая колонка обязательна. Того, кому не сказали «доли нет», не переубедить потом: он уже достроил её сам."
          />
          <div className="grid md:grid-cols-2 gap-3">
            <div
              className="rounded-xl p-4"
              style={{ border: `1px solid ${OK}33`, background: 'rgba(52,211,153,0.04)' }}
            >
              <div
                className="text-[10.5px] font-bold tracking-[0.16em] uppercase mb-3"
                style={{ color: OK }}
              >
                Получает
              </div>
              <p className="text-[13px] text-slate-300 leading-relaxed">
                {investor?.gets ?? '⟨заполнить⟩'}
              </p>
              <p className="text-[12.5px] text-slate-500 leading-relaxed mt-3">
                {investor?.gives ?? ''}
              </p>
            </div>
            <div
              className="rounded-xl p-4"
              style={{ border: `1px solid ${WARN}33`, background: 'rgba(248,113,113,0.04)' }}
            >
              <div
                className="text-[10.5px] font-bold tracking-[0.16em] uppercase mb-3"
                style={{ color: WARN }}
              >
                Не получает
              </div>
              <ul className="space-y-2">
                {NOT_OFFERED.map((t) => (
                  <li key={t} className="text-[12.5px] text-slate-400 leading-relaxed">
                    · {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── 6. Работы без денег ──────────────────────────────────── */}
        <section>
          <SectionHead
            icon={Check}
            eyebrow="Спрос с нас"
            title="Что можно сделать без финансирования — и потому справедливо спросить, почему не сделано"
            note="Эти работы не упираются ни в деньги, ни в чьё-либо разрешение. Названы здесь, чтобы вопрос задали нам, а не обошли его."
          />
          <div className="space-y-2">
            {SELF_FUNDED.map((t) => (
              <div
                key={t}
                className="rounded-lg px-4 py-3 text-[12.5px] text-slate-400 leading-relaxed"
                style={{ border: `1px solid ${HAIR}`, background: PANEL }}
              >
                {t}
              </div>
            ))}
          </div>
        </section>

        {/* ── Полная плитка нулей ──────────────────────────────────── */}
        <section>
          <SectionHead
            icon={Ban}
            eyebrow="Состояние"
            title="Все восемь нулей"
            note="Пропущенный ноль читается как отсутствие темы, а не как отсутствие величины. Поэтому они написаны."
          />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {ZEROS.map((z) => (
              <div
                key={z.id}
                className="rounded-xl p-4"
                style={{ border: `1px solid ${HAIR}`, background: PANEL }}
              >
                <div className="text-[22px] font-semibold leading-none" style={{ color: WARN }}>
                  0
                </div>
                <div className="text-[11.5px] text-slate-300 mt-2 leading-snug">{z.short}</div>
                <div className="text-[11px] text-slate-500 mt-2 leading-relaxed">{z.note}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Куда дальше ──────────────────────────────────────────── */}
        <section>
          <div className="flex flex-wrap gap-2">
            {[
              { to: '/os', t: 'Как устроена вся система — одна страница' },
              { to: '/architecture', t: 'Что передаётся и что не передаётся никогда' },
              { to: '/doc', t: 'Документ целиком — четырнадцать глав' },
              { to: '/doc/short', t: 'Короткая версия документа' },
              { to: '/showcase', t: 'Витрина услуг' },
              { to: '/globe', t: 'Объекты на глобусе' },
            ].map((l) => (
              <Link
                key={l.to}
                href={l.to}
                className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[12.5px] text-slate-300 hover:text-white transition-colors"
                style={{ border: `1px solid ${HAIR}`, background: PANEL }}
              >
                {l.t}
                <ArrowRight size={13} className="opacity-50" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
