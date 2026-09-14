/**
 * FundPage — главная посадочная и рабочий стол разговора с фондом.
 *
 * Первая версия этой страницы открывалась отговоркой: «средства не
 * привлекаются, доходности нет, дальше можно не читать». Формально это
 * правда, но как первый экран это неверно по существу — предмет
 * разговора не в том, чего здесь нет. Девятнадцать узлов и тридцать
 * тысяч строк существуют; открывать ими же отрицанием — значит
 * занижать сделанное ровно так же, как обычная посадочная его
 * завышает. Неправда в обе стороны остаётся неправдой.
 *
 * Поэтому предмет первого экрана — сама структура: из чего собрано и
 * как пересобирается. Нули с него никуда не делись и стоят строкой
 * состояния рядом, а не в подвале: их видно сразу, но они не выдают
 * себя за тему.
 *
 * Главное на странице — переключатель конфигураций. Разговор не
 * начинается с библиотеки узлов, он начинается с «у нас бассейн» или
 * «у нас муниципалитет». Щелчок по конфигурации перестраивает карту
 * узлов, состав работ и пакет разом — и это настоящая пересборка из
 * реестра, а не смена слайда: карта не перерисовывается, узлы стоят на
 * местах, меняется состояние. Отличить одно от другого собеседник
 * может, и это стоит того, чтобы сделать честно.
 *
 * Порядок:
 *   1. Что это и из чего собрано — карта библиотеки, строка нулей.
 *   2. Конфигурации — переключение при собеседнике.
 *   3. Состав выбранной конфигурации и чего в ней нет.
 *   4. Работы к финансированию → пакет, копируется текстом.
 *   5. Что фонд получает и чего не получает.
 *   6. Полное состояние и переходы.
 *
 * Своих величин у страницы нет ни одной: узлы, нули, роли, работы и
 * конфигурации берутся из src/data/platform, сборка пакета — из
 * src/lib/offer/fundPacket.
 */

import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import {
  ArrowRight,
  Check,
  ClipboardCopy,
  LayoutGrid,
  ListChecks,
  ShieldAlert,
  Wrench,
} from 'lucide-react';

import { FUND_STEPS, NOT_OFFERED, SELF_FUNDED, WORK_PACKAGES } from '@/data/platform/fund';
import {
  NODE_COUNT,
  NODE_LINES_TOTAL,
  NODE_STATUS_COLOR,
  NODE_STATUS_LABEL,
  NODE_WITH_CODE_COUNT,
} from '@/data/platform/nodes';
import { RESOLVED_PRESETS, presetById } from '@/data/platform/presets';
import { ZEROS } from '@/data/platform/state';
import { ROLES } from '@/data/platform/roles';
import { SYSTEMS } from '@/data/platform/systems';
import { NodeMap } from '@/components/os/NodeMap';
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

/** Счётные величины, которые собеседник может перепроверить сам. */
const EVIDENCE: { n: string; label: string }[] = [
  { n: String(NODE_COUNT), label: 'узлов в библиотеке' },
  { n: String(NODE_WITH_CODE_COUNT), label: 'с кодом в репозитории' },
  { n: NODE_LINES_TOTAL.toLocaleString('ru-RU'), label: 'строк по названным каталогам' },
  { n: String(RESOLVED_PRESETS.length), label: 'готовых конфигураций' },
];

export default function FundPage() {
  const [presetId, setPresetId] = useState<string>('basin');
  const [picked, setPicked] = useState<string[]>(
    () => [...(presetById('basin')?.nodeIds ?? [])],
  );
  const [copied, setCopied] = useState(false);

  const preset = presetById(presetId);
  const packet = useMemo(() => buildPacket(picked), [picked]);
  const investor = ROLES.find((r) => r.id === 'investor');
  const build = SYSTEMS.find((s) => s.id === preset?.build);

  /** Переключение конфигурации: карта, состав и пакет меняются разом. */
  function applyPreset(id: string) {
    const p = presetById(id);
    if (!p) return;
    setPresetId(id);
    setPicked([...p.nodeIds]);
  }

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
        {/* ── 1. Что это и из чего собрано ─────────────────────────── */}
        <section>
          <div className="max-w-3xl">
            <div
              className="text-[10.5px] font-bold tracking-[0.18em] uppercase mb-3"
              style={{ color: ACCENT }}
            >
              ArkheOSium · ἀρχή — первооснова · операционная система цивилизации
            </div>
            {/*
              Прежний заголовок начинался со слов «библиотека узлов». Это
              описание средства, а не предмета: так же можно описать любой
              фреймворк. Архэ у греков — первоначало, то, из чего всё
              возникает и во что возвращается; отсюда и название. Предмет
              называется первым, устройство — следом, потому что порядок
              обратный оставляет собеседника с вопросом «библиотека чего».
            */}
            <h1 className="text-[24px] sm:text-[32px] font-semibold text-white leading-[1.15]">
              Операционная система цивилизации: учёт ресурса, среды и
              взаимодействий на уровне планеты — собираемая под задачу и
              пересобираемая при вас.
            </h1>
            <p className="text-[13.5px] sm:text-[14px] text-slate-400 mt-4 leading-relaxed">
              <span className="text-slate-300">Архэ</span> (ἀρχή) у греков — первооснова: то,
              из чего возникает всё сущее и во что возвращается. Отсюда название и отсюда
              устройство: не одно приложение, а первоосновы — узлы, из которых под конкретную
              задачу собирается система. Ниже они все. Выберите задачу — карта перестроится:
              загорятся узлы, которые под неё собираются, соберётся состав работ и пакет для
              разговора. Это не переключение картинок: конфигурация берёт узлы из того же
              реестра, из которого состояние читает документ.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-7">
            {EVIDENCE.map((e) => (
              <div
                key={e.label}
                className="rounded-xl p-4"
                style={{ border: `1px solid ${HAIR}`, background: PANEL }}
              >
                <div className="text-[24px] font-semibold text-white leading-none">{e.n}</div>
                <div className="text-[11.5px] text-slate-400 mt-2 leading-snug">{e.label}</div>
              </div>
            ))}
          </div>

          {/*
            Строка состояния. Набрана нейтрально, а не тревожным красным:
            красная рамка на первом экране читается как авария и говорит
            о проекте то, чего в ней не написано. Величины при этом не
            смягчены и не опущены — пропущенный ноль читался бы как
            отсутствие темы, а не как отсутствие величины.

            Подписи берутся из реестра нулей, а не набраны здесь руками:
            пока они существовали в двух местах, расхождение было
            вопросом времени.
          */}
          <div
            className="mt-3 rounded-xl px-4 py-3"
            style={{ border: `1px solid ${HAIR}`, background: PANEL }}
          >
            <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-600">
              Состояние на сегодня
            </span>
            <p className="text-[11.5px] text-slate-500 leading-relaxed mt-1.5">
              {ZEROS.map((z) => z.short).join(' · ')} — по всем восьми ноль.
              Это границы применимости того, что ниже, а не оценка сделанного.
            </p>
          </div>
        </section>

        {/* ── 2. Конфигурации ──────────────────────────────────────── */}
        <section>
          <SectionHead
            icon={LayoutGrid}
            eyebrow="Конфигурации"
            title="Под какую задачу собираем"
            note="Разговор начинается не с библиотеки, а с «у нас бассейн» или «у нас муниципалитет». Щелчок перестраивает карту, состав и пакет разом."
          />

          <div className="flex flex-wrap gap-2 mb-5">
            {RESOLVED_PRESETS.map((p) => {
              const on = p.id === presetId;
              return (
                <button
                  key={p.id}
                  onClick={() => applyPreset(p.id)}
                  className="rounded-lg px-3.5 py-2 text-[12.5px] transition-colors"
                  style={{
                    border: `1px solid ${on ? `${ACCENT}66` : HAIR}`,
                    background: on ? 'rgba(34,211,238,0.08)' : PANEL,
                    color: on ? ACCENT : '#cbd5e1',
                  }}
                >
                  {p.title}
                </button>
              );
            })}
          </div>

          <NodeMap active={picked} onToggle={toggle} showLines />

          <p className="text-[11.5px] text-slate-600 mt-3 leading-relaxed">
            Узлы можно включать и выключать поверх конфигурации — состав работ пересчитается.
            Погашенный узел остаётся на своём месте: библиотека одна, меняется только сборка.
          </p>
        </section>

        {/* ── 3. Состав выбранной конфигурации ─────────────────────── */}
        {preset && (
          <section>
            <SectionHead
              icon={Check}
              eyebrow="Выбранная конфигурация"
              title={preset.title}
              note={preset.who}
            />
            <div className="grid md:grid-cols-2 gap-3">
              <div
                className="rounded-xl p-4"
                style={{ border: `1px solid ${HAIR}`, background: PANEL }}
              >
                <div
                  className="text-[10.5px] font-bold tracking-[0.16em] uppercase mb-3"
                  style={{ color: OK }}
                >
                  Что делает
                </div>
                <p className="text-[13px] text-slate-300 leading-relaxed">{preset.does}</p>
                <div className="flex flex-wrap gap-x-5 gap-y-1 mt-4">
                  <span className="text-[11.5px] text-slate-500">
                    Узлов: {preset.nodes.length}, с кодом: {preset.withCode}
                  </span>
                  <span className="text-[11.5px] text-slate-500">
                    Объём: {preset.lines.toLocaleString('ru-RU')} строк
                  </span>
                  <span className="text-[11.5px] text-slate-500">
                    Стандартизовано: {preset.standardized}
                  </span>
                </div>
                {build && (
                  <div className="text-[11.5px] text-slate-500 mt-2">
                    Сборка: {build.name} — {build.domain}
                  </div>
                )}
              </div>

              <div
                className="rounded-xl p-4"
                style={{ border: `1px solid ${WARN}33`, background: 'rgba(248,113,113,0.04)' }}
              >
                <div
                  className="text-[10.5px] font-bold tracking-[0.16em] uppercase mb-3"
                  style={{ color: WARN }}
                >
                  Чего в этой конфигурации нет
                </div>
                <p className="text-[13px] text-slate-400 leading-relaxed">{preset.without}</p>
              </div>
            </div>
          </section>
        )}

        {/* ── 4. Работы и пакет ────────────────────────────────────── */}
        <section>
          <SectionHead
            icon={Wrench}
            eyebrow="Предмет разговора"
            title="Что именно предлагается профинансировать"
            note="Работа берётся из состояния узла, а не придумывается под встречу. Список следует за конфигурацией; пакет справа копируется текстом."
          />

          <div className="grid lg:grid-cols-[1fr_380px] gap-4 items-start">
            <div className="space-y-2">
              {WORK_PACKAGES.filter((w) => picked.includes(w.nodeId)).map((w) => (
                <div
                  key={w.nodeId}
                  className="rounded-xl p-4"
                  style={{ border: `1px solid ${ACCENT}33`, background: 'rgba(34,211,238,0.04)' }}
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
                </div>
              ))}
              {picked.length === 0 && (
                <div
                  className="rounded-xl p-4 text-[12.5px] text-slate-500"
                  style={{ border: `1px solid ${HAIR}`, background: PANEL }}
                >
                  Узлы не выбраны. Выберите конфигурацию выше или включите узлы на карте.
                </div>
              )}
            </div>

            <div
              className="rounded-xl p-4 lg:sticky lg:top-20"
              style={{ border: `1px solid ${HAIR}`, background: 'rgba(2,6,23,0.5)' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <ListChecks size={14} style={{ color: ACCENT }} />
                <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-slate-400">
                  Пакет · работ {packet.items.length}
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
                Заготовка для разговора. Не оферта, не предложение инвестиции, не согласованные
                условия.
              </p>
            </div>
          </div>
        </section>

        {/* ── 5. Вопросы, границы, спрос с нас ─────────────────────── */}
        <section>
          <SectionHead
            icon={ShieldAlert}
            eyebrow="Границы"
            title="Что фонд получает, чего не получает и что обычно спрашивает"
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

          <div className="grid md:grid-cols-2 gap-3 mt-3">
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

          <div className="mt-3 space-y-2">
            <div className="text-[11px] font-bold tracking-[0.16em] uppercase text-slate-500">
              Что можно сделать без финансирования — и потому справедливо спросить с нас
            </div>
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

        {/*
          Здесь стояла секция «Все восемь нулей» — восемь крупных карточек
          с нулями во всю ширину. Она снята, и это не сокрытие: те же
          величины остались там, где они к чему-то относятся — строкой
          состояния в первом экране, предупреждениями в рабочем пакете,
          отдельными блоками в главах документа, где каждый ноль стоит
          рядом с утверждением, которое он ограничивает.

          Разница не в количестве правды, а в том, что правда делает.
          Ноль рядом с утверждением — это оговорка: она мешает прочитать
          соседнюю строку сильнее, чем написано. Восемь нулей подряд
          отдельным разделом — уже не оговорка, а заявление о себе, и
          заявление неверное: 19 узлов и 30 тысяч строк существуют.
          Понижение — такая же неправда, как завышение, и повтор одной
          и той же оговорки трижды на одной странице превращает её в
          лозунг, который перестают читать.
        */}

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
