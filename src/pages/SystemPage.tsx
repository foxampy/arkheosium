/**
 * SystemPage — одна страница про всю систему целиком.
 *
 * Зачем ещё одна страница, когда есть документ из четырнадцати глав и
 * страница для фондов. Затем, что ни то ни другое не отвечает на вопрос,
 * который задают первым: «что это вообще такое и как вы со всеми
 * связаны». Документ отвечает подробно и по главам — его читают те, кто
 * уже решил читать. Страница для фондов отвечает на вопрос про деньги.
 * А человек, которому проект показали в первый раз, держит в голове
 * другое: продукт это или платформа, один проект или несколько, кто
 * партнёры, что из этого работает и что можно получить.
 *
 * Поэтому здесь семь частей в порядке, в котором эти вопросы возникают:
 *
 *   1. Что это — одной фразой, и сразу нули, а не после.
 *   2. Как устроено — поток от исследования до сборки.
 *   3. Что не передаётся никогда — граница, а не оговорка.
 *   4. Мультимодальность — три сборки из одной библиотеки.
 *   5. Библиотека узлов — с колонкой «чего нет» у каждого.
 *   6. Кто с кем — семь ролей, у каждой три поля, третье обязательное.
 *   7. Конструктор предложения — собирает область работ, не цену.
 *
 * Ни одна величина на странице не введена заново. Узлы, слои, условия
 * передачи, неотключаемый минимум и нули берутся из src/data/platform —
 * оттуда же их берёт глава 12 документа. Если формулировка изменится
 * там, она изменится здесь; переписать её на этой странице негде.
 *
 * Конструктор — единственное место с логикой, и логика вынесена
 * в src/lib/offer: её можно вызвать из теста и из другой сборки.
 * Предложение, живущее внутри компонента, нельзя ни проверить, ни
 * переиспользовать.
 */

import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import {
  ArrowRight,
  Boxes,
  Check,
  ClipboardCopy,
  ExternalLink,
  FlaskConical,
  Globe2,
  Layers,
  Lock,
  ShieldAlert,
  Unlock,
  Users,
} from 'lucide-react';

import { LAYERS, BUILDS } from '@/data/platform/layers';
import { NODES, NODE_STATUS_COLOR, NODE_STATUS_LABEL } from '@/data/platform/nodes';
import {
  NODES_OUTSIDE_PRESETS,
  RESOLVED_PRESETS,
  presetById,
} from '@/data/platform/presets';
import { NodeMap } from '@/components/os/NodeMap';
import { ZEROS } from '@/data/platform/state';
import { SYSTEMS, JOINT_FRANCHISE, PARTNER_STAGE_LABEL } from '@/data/platform/systems';
import { ROLES } from '@/data/platform/roles';
import { MINIMUM } from '@/data/platform/contract';
import {
  buildDraft,
  draftToText,
  KIND_HINT,
  KIND_LABEL,
  PURPOSE_HINT,
  PURPOSE_LABEL,
  type OfferKind,
  type OfferPurpose,
} from '@/lib/offer/draft';

const HAIR = 'rgba(148,163,184,0.16)';
const PANEL = 'rgba(148,163,184,0.03)';
const ACCENT = '#22d3ee';
const WARN = '#f87171';
const OK = '#34d399';

/** Поток производства: слева направо, одна строка. */
const FLOW = [
  { t: 'Исследование', s: 'Задача, методика, допущения названы' },
  { t: 'Узел', s: 'Инженерная версия с интерфейсом' },
  { t: 'Библиотека', s: 'Узел переиспользуется в разных сборках' },
  { t: 'Конфигурация', s: 'Набор узлов, политики, юрисдикция' },
  { t: 'Сборка', s: 'Работающая система на своей области' },
];

function SectionHead({
  eyebrow,
  title,
  note,
  icon: Icon,
}: {
  eyebrow: string;
  title: string;
  note?: string;
  icon: typeof Layers;
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
      {note && (
        <p className="text-[13px] text-slate-500 mt-2 max-w-2xl leading-relaxed">{note}</p>
      )}
    </div>
  );
}

export default function SystemPage() {
  const [kind, setKind] = useState<OfferKind>('project');
  const [purpose, setPurpose] = useState<OfferPurpose>('develop');
  const [presetId, setPresetId] = useState<string>('');
  const [picked, setPicked] = useState<string[]>(['corpus', 'account']);
  const [market, setMarket] = useState('');
  const [term, setTerm] = useState('');
  const [copied, setCopied] = useState(false);

  const draft = useMemo(
    () => buildDraft({ kind, purpose, nodeIds: picked, market, term }),
    [kind, purpose, picked, market, term],
  );

  const preset = presetId ? presetById(presetId) : undefined;

  /**
   * Пресет здесь — не отдельный режим, а начальная точка: он ставит набор
   * узлов, после чего набор правится вручную. Поэтому при первом же ручном
   * щелчке имя конфигурации снимается: конструктор перестал показывать её,
   * и оставленное название было бы подписью не под тем, что собрано.
   */
  function applyPreset(id: string) {
    const p = presetById(id);
    if (!p) return;
    setPresetId(id);
    setPicked([...p.nodeIds]);
  }

  function toggle(id: string) {
    setPresetId('');
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(draftToText(draft));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="min-h-screen text-slate-200 pb-20">
      {/* ─── 1. Что это ──────────────────────────────────────────── */}
      <div
        className="border-b"
        style={{
          borderColor: `${ACCENT}22`,
          background: 'linear-gradient(160deg, rgba(34,211,238,0.08), rgba(2,8,23,0) 60%)',
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="flex items-center gap-2 mb-4">
            <Boxes size={18} style={{ color: ACCENT }} />
            <span
              className="text-[11px] font-bold tracking-[0.18em] uppercase"
              style={{ color: ACCENT }}
            >
              Вся система на одной странице
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold text-white leading-tight max-w-3xl">
            ArkheOSium — не продукт. Это библиотека узлов, правило их сборки и конституция,
            которую сборка не может отключить.
          </h1>

          <p className="text-[14px] text-slate-400 mt-5 max-w-2xl leading-relaxed">
            Один цикл исследований даёт узел. Узел входит в библиотеку и переиспользуется. Из
            библиотеки собирается конфигурация: набор узлов, политики, юрисдикция. Конфигурация
            разворачивается как самостоятельная система — в воде, в земле, в здоровье.
            ArkheOSium — одна из таких сборок, а не владелец остальных.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-8">
            {ZEROS.slice(0, 4).map((z) => (
              <div
                key={z.id}
                className="rounded-xl border p-3.5"
                style={{ borderColor: HAIR, background: PANEL }}
              >
                <div className="text-2xl font-bold text-white tabular-nums leading-none mb-1.5">
                  0
                </div>
                <div className="text-[11.5px] text-slate-500 leading-snug">{z.short}</div>
              </div>
            ))}
          </div>
          <p className="text-[12px] text-slate-600 mt-3 max-w-2xl leading-relaxed">
            Нули стоят здесь, а не в подвале. Пропущенный ноль читается как отсутствие темы, а не
            как отсутствие величины — остальные четыре ниже.
          </p>
        </div>
      </div>

      {/* ─── 2. Как устроено ─────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-12">
        <SectionHead
          icon={FlaskConical}
          eyebrow="Производственный цикл"
          title="От исследования до работающей системы — один путь и пять шагов"
          note="Фрактальность означает, что каждый шаг полезен сам по себе. Узел учёта ресурса работает без экосистемы, сборка работает без ArkheOSium. Это не украшение, а проверка: узел, который работает только целиком со всей системой, нельзя ни продать, ни проверить, ни заменить."
        />

        <div className="grid sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {FLOW.map((f, i) => (
            <div
              key={f.t}
              className="rounded-xl border p-4 relative"
              style={{ borderColor: HAIR, background: PANEL }}
            >
              <div
                className="text-[10px] font-bold tabular-nums mb-2"
                style={{ color: ACCENT }}
              >
                {String(i + 1).padStart(2, '0')}
              </div>
              <div className="text-[13px] font-medium text-slate-100 mb-1">{f.t}</div>
              <div className="text-[11.5px] text-slate-500 leading-relaxed">{f.s}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 3. Граница передачи ─────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-12">
        <SectionHead
          icon={Lock}
          eyebrow="Что передаётся и что не передаётся"
          title="Замо́к означает, что слой не лицензируется ни в какой форме"
          note="Открытый замок — что слой передаётся поимённо: не «библиотека», а перечисленные в договоре позиции, названный рынок и названный срок."
        />

        <div className="grid gap-2.5">
          {LAYERS.map((l) => {
            const c = l.transferable ? OK : WARN;
            const Icon = l.transferable ? Unlock : Lock;
            return (
              <div
                key={l.title}
                className="rounded-xl border p-4 flex items-start gap-3.5"
                style={{ borderColor: HAIR, background: PANEL }}
              >
                <span
                  className="shrink-0 mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: `${c}18` }}
                >
                  <Icon size={14} style={{ color: c }} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                    <span className="text-[13.5px] font-medium text-slate-200">{l.title}</span>
                    <span
                      className="text-[10px] font-bold uppercase tracking-[0.12em] px-1.5 py-0.5 rounded"
                      style={{ color: c, background: `${c}18` }}
                    >
                      {l.transferable ? 'передаётся' : 'не передаётся'}
                    </span>
                  </div>
                  <div className="text-[12.5px] text-slate-500 mt-1 leading-relaxed">{l.body}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center py-3 text-slate-700">↓</div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {BUILDS.map((b) => (
            <div
              key={b.title}
              className="rounded-xl border p-4"
              style={{ borderColor: `${ACCENT}26`, background: `${ACCENT}08` }}
            >
              <div className="text-[13px] font-medium text-slate-100 mb-1.5">{b.title}</div>
              <div className="text-[12px] text-slate-500 leading-relaxed">{b.body}</div>
            </div>
          ))}
        </div>

        <div
          className="rounded-xl border p-5 mt-4"
          style={{ borderColor: `${WARN}33`, background: `${WARN}0d` }}
        >
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert size={15} style={{ color: WARN }} />
            <span
              className="text-[10.5px] font-bold uppercase tracking-[0.16em]"
              style={{ color: WARN }}
            >
              Не отключается ни в какой конфигурации
            </span>
          </div>
          <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
            {MINIMUM.map((m) => (
              <li key={m} className="text-[12.5px] text-slate-300 leading-[1.6] flex gap-2">
                <span className="shrink-0" style={{ color: WARN }}>
                  ·
                </span>
                {m}
              </li>
            ))}
          </ul>
          <p className="text-[12px] text-slate-500 mt-4 leading-relaxed">
            Сборка вправе иметь собственную конституцию — своё управление, свою модель дохода,
            свои отношения с клиентами. Но эти шесть ограничений она не отключает, иначе «своя
            конституция» становится способом обойти правило в один ход. Обеспечено это
            единственным средством: правом отозвать имя. Технического принуждения нет, механизм
            проверки не построен — и писать иначе было бы неправдой.
          </p>
        </div>
      </div>

      {/* ─── 4. Мультимодальность ────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-12">
        <SectionHead
          icon={Globe2}
          eyebrow="Мультимодальность"
          title="Три сборки из одной библиотеки — вода, земля, здоровье"
          note="Это не три компании и не три продукта. Узел учёта ресурса и узел идентичности одинаково нужны реестру воды, реестру земли и реестру состояния человека. Разными у сборок будут предметная область, политики и юрисдикция, а не устройство."
        />

        <div className="grid lg:grid-cols-3 gap-2.5">
          {SYSTEMS.map((sys) => (
            <div
              key={sys.id}
              className="rounded-xl border p-5 flex flex-col"
              style={{
                borderColor: sys.inContour ? `${ACCENT}33` : HAIR,
                background: sys.inContour ? `${ACCENT}0a` : PANEL,
              }}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[15px] font-semibold text-white">{sys.name}</span>
                <span
                  className="text-[9.5px] font-bold uppercase tracking-[0.1em] px-1.5 py-0.5 rounded shrink-0"
                  style={{
                    color: sys.inContour ? OK : '#fbbf24',
                    background: sys.inContour ? `${OK}18` : '#fbbf2418',
                  }}
                >
                  {sys.inContour ? 'в контуре' : 'вне контура'}
                </span>
              </div>

              <div className="text-[11.5px] text-slate-400 mb-3 leading-snug">{sys.domain}</div>

              <p className="text-[12.5px] text-slate-500 leading-relaxed mb-3">{sys.about}</p>

              <div
                className="rounded-lg border px-3 py-2 mb-3 text-[11.5px] text-slate-400 leading-relaxed"
                style={{ borderColor: HAIR }}
              >
                {sys.state}
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {sys.nodes.map((nid) => {
                  const n = NODES.find((x) => x.id === nid);
                  return (
                    <span
                      key={nid}
                      className="text-[10.5px] px-1.5 py-0.5 rounded text-slate-400"
                      style={{ background: 'rgba(148,163,184,0.08)' }}
                    >
                      {n ? n.title : nid}
                    </span>
                  );
                })}
              </div>

              {sys.partners.length > 0 ? (
                <div className="mt-auto pt-2 border-t" style={{ borderColor: HAIR }}>
                  <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600 mb-2">
                    Названные стороны
                  </div>
                  {sys.partners.map((p) => (
                    <div key={p.name} className="mb-2 last:mb-0">
                      <div className="text-[12px] text-slate-300">{p.name}</div>
                      <div className="text-[11px] text-slate-500 leading-snug">{p.role}</div>
                      <div className="text-[10.5px] mt-0.5" style={{ color: '#fbbf24' }}>
                        {PARTNER_STAGE_LABEL[p.stage]}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-auto pt-2 border-t" style={{ borderColor: HAIR }}>
                  <div className="text-[11.5px] text-slate-500">
                    Подключённых партнёров — 0 во всех восьми сегментах.
                  </div>
                </div>
              )}

              {(sys.url || sys.docUrl) && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {sys.url && (
                    <a
                      href={sys.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-[11.5px] text-slate-400 hover:text-slate-200 inline-flex items-center gap-1.5 transition-colors"
                    >
                      сайт <ExternalLink size={11} />
                    </a>
                  )}
                  {sys.docUrl && (
                    <a
                      href={sys.docUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-[11.5px] text-slate-400 hover:text-slate-200 inline-flex items-center gap-1.5 transition-colors"
                    >
                      документ <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div
          className="rounded-xl border p-4 mt-2.5"
          style={{ borderColor: HAIR, background: PANEL }}
        >
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600 mb-2">
            Совместная франшиза на стыке двух сборок
          </div>
          <div className="text-[13.5px] font-medium text-slate-100 mb-1">
            {JOINT_FRANCHISE.title}
          </div>
          <p className="text-[12.5px] text-slate-500 leading-relaxed">{JOINT_FRANCHISE.about}</p>
          <p className="text-[12.5px] mt-2 leading-relaxed" style={{ color: '#fbbf24' }}>
            {JOINT_FRANCHISE.state}
          </p>
        </div>

        <p className="text-[12px] text-slate-600 mt-3 max-w-3xl leading-relaxed">
          Стороны названы владельцем проекта и помечены как заявленные. Ни один договор не
          опубликован; публиковать сторону как партнёра можно только с названием подписанного
          документа. До этого «партнёр» — это тот, с кем идёт разговор, и так и написано.
        </p>
      </div>

      {/* ─── 5. Библиотека узлов ─────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-12">
        <SectionHead
          icon={Layers}
          eyebrow="Библиотека"
          title="Девять узлов, и у каждого написано, чего в нём нет"
          note="Модулем называется узел, прошедший стандартизацию: с описанным интерфейсом, границами применимости и условиями переиспользования. По этому определению модулей сейчас ноль — ниже перечислены заготовки разной степени готовности. Список из пятнадцати красивых названий без второй колонки и есть основной способ соврать, ничего не выдумывая."
        />

        <div className="grid md:grid-cols-2 gap-2.5">
          {NODES.map((n) => (
            <div
              key={n.id}
              className="rounded-xl border p-4"
              style={{ borderColor: HAIR, background: PANEL }}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <span className="text-[13.5px] font-medium text-slate-100 leading-snug">
                  {n.title}
                </span>
                <span
                  className="text-[9.5px] font-bold uppercase tracking-[0.1em] px-1.5 py-0.5 rounded shrink-0"
                  style={{
                    color: NODE_STATUS_COLOR[n.status],
                    background: `${NODE_STATUS_COLOR[n.status]}18`,
                  }}
                >
                  {NODE_STATUS_LABEL[n.status]}
                </span>
              </div>
              <div className="text-[12px] text-slate-500 leading-relaxed mb-3">{n.purpose}</div>
              <div className="grid sm:grid-cols-2 gap-2.5">
                <div>
                  <div className="text-[9.5px] font-bold uppercase tracking-[0.12em] mb-1" style={{ color: OK }}>
                    Есть
                  </div>
                  <div className="text-[11.5px] text-slate-400 leading-relaxed">{n.have}</div>
                </div>
                <div>
                  <div className="text-[9.5px] font-bold uppercase tracking-[0.12em] mb-1" style={{ color: WARN }}>
                    Чего нет
                  </div>
                  <div className="text-[11.5px] text-slate-400 leading-relaxed">{n.missing}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 6. Кто с кем ────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-12">
        <SectionHead
          icon={Users}
          eyebrow="Отношения"
          title="Семь ролей, и у каждой написано, чего она не получает"
          note="«Что даёт» и «что получает» есть в любой презентации. Третьей колонки нет почти нигде — и ровно в этом месте читатель достраивает то, чего ему не обещали. Инвестор, которому не сказали «доли нет», уходит с мыслью, что доля обсуждаема."
        />

        <div className="grid gap-2.5">
          {ROLES.map((r) => (
            <div
              key={r.id}
              className="rounded-xl border p-4"
              style={{ borderColor: HAIR, background: PANEL }}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                <span className="text-[14px] font-semibold text-white">{r.title}</span>
                <Link
                  href={r.entry.to}
                  className="text-[11.5px] text-slate-400 hover:text-slate-200 inline-flex items-center gap-1.5 transition-colors"
                >
                  {r.entry.label}
                  <ArrowRight size={11} />
                </Link>
              </div>
              <div className="text-[12px] text-slate-500 mb-3 leading-relaxed">{r.who}</div>
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <div className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-slate-600 mb-1">
                    Даёт
                  </div>
                  <div className="text-[11.5px] text-slate-400 leading-relaxed">{r.gives}</div>
                </div>
                <div>
                  <div className="text-[9.5px] font-bold uppercase tracking-[0.12em] mb-1" style={{ color: OK }}>
                    Получает
                  </div>
                  <div className="text-[11.5px] text-slate-400 leading-relaxed">{r.gets}</div>
                </div>
                <div>
                  <div className="text-[9.5px] font-bold uppercase tracking-[0.12em] mb-1" style={{ color: WARN }}>
                    Не получает
                  </div>
                  <div className="text-[11.5px] text-slate-400 leading-relaxed">{r.notGets}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 7. Конструктор предложения ──────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-12">
        <SectionHead
          icon={Boxes}
          eyebrow="Конструктор предложений"
          title="Собирает область работ и её границы, а не цену"
          note="Обычный конструктор коммерческого предложения работает как калькулятор: выбрал позиции — получил сумму. Сумму здесь выдать не из чего: развёртываний ноль, стандартизованных узлов ноль, утверждённых ставок ноль. Калькулятор, который в таком положении показывает число, показывает выдуманное число. Этот собирает другое: что передаётся, что не передаётся, что не отключается — и чего в предложении сегодня быть не может."
        />

        {/* Набор узлов. Стоит во всю ширину и перед остальными полями
            потому, что это единственное место, где собеседник видит
            пересборку: та же карта, что и на главной, тот же реестр,
            те же пресеты. Две поверхности, собирающие набор узлов
            по-разному, рано или поздно разойдутся — как уже разошлись
            три числа эмиссии, когда лежали в трёх файлах. */}
        <div
          className="rounded-xl border p-5 mb-3"
          style={{ borderColor: HAIR, background: PANEL }}
        >
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600 mb-2">
            Начать с готовой конфигурации
          </div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {RESOLVED_PRESETS.map((p) => {
              const on = presetId === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => applyPreset(p.id)}
                  className="rounded-lg border px-2.5 py-1.5 text-[11.5px] transition-colors inline-flex items-center gap-1.5"
                  style={{
                    borderColor: on ? `${ACCENT}55` : HAIR,
                    background: on ? `${ACCENT}12` : 'transparent',
                    color: on ? ACCENT : '#94a3b8',
                  }}
                >
                  {on && <Check size={11} />}
                  {p.title}
                </button>
              );
            })}
          </div>

          {/* Чего в выбранной конфигурации нет. Стоит рядом с составом,
              а не в конце страницы: состав без этой строки читается
              как решение задачи целиком. */}
          {preset && (
            <div
              className="rounded-lg border px-3 py-2.5 mb-4"
              style={{ borderColor: `${WARN}33`, background: `${WARN}0a` }}
            >
              <div
                className="text-[10px] font-bold uppercase tracking-[0.14em] mb-1"
                style={{ color: WARN }}
              >
                Чего в этой конфигурации нет
              </div>
              <div className="text-[11.5px] text-slate-400 leading-snug">
                {preset.without}
              </div>
            </div>
          )}

          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600 mb-2">
            Узлы — поимённо{' '}
            <span className="text-slate-600 font-normal normal-case tracking-normal">
              (выбрано {picked.length} из {NODES.length})
            </span>
          </div>
          <NodeMap active={picked} onToggle={toggle} />

          {/* Проверка на лишнее. Узел, не входящий ни в одну конфигурацию,
              должен объясняться — иначе он сделан без задачи. Список
              считается из пресетов, а не написан руками, поэтому соврать
              этой строкой нельзя: добавится неиспользуемый узел — он здесь
              и появится. */}
          <div className="text-[11px] text-slate-500 leading-snug mt-4 pt-3 border-t" style={{ borderColor: HAIR }}>
            {NODES_OUTSIDE_PRESETS.length === 0 ? (
              'Каждый узел реестра входит хотя бы в одну конфигурацию.'
            ) : (
              <>
                Не входят ни в одну конфигурацию{' '}
                {NODES_OUTSIDE_PRESETS.length}:{' '}
                <span className="text-slate-400">
                  {NODES_OUTSIDE_PRESETS.map((n) => n.title).join(', ')}
                </span>
                .{' '}
                {NODES_OUTSIDE_PRESETS.every((n) => n.lines === 0)
                  ? 'Это ровно те узлы, у которых нет кода: они названы в замысле и не начаты. Собирать из них нечего, и показывать их как доступные было бы продажей ненаписанного.'
                  : '⟨заполнить: чем объясняется узел с кодом, не вошедший ни в одну конфигурацию⟩'}
              </>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr,1.15fr] gap-3">
          {/* Ввод */}
          <div
            className="rounded-xl border p-5"
            style={{ borderColor: HAIR, background: PANEL }}
          >
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600 mb-2">
              Что собираем
            </div>
            <div className="grid gap-1.5 mb-5">
              {(Object.keys(KIND_LABEL) as OfferKind[]).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKind(k)}
                  className="text-left rounded-lg border px-3 py-2.5 transition-colors"
                  style={{
                    borderColor: kind === k ? `${ACCENT}55` : HAIR,
                    background: kind === k ? `${ACCENT}12` : 'transparent',
                  }}
                >
                  <div
                    className="text-[12.5px] font-medium"
                    style={{ color: kind === k ? ACCENT : '#cbd5e1' }}
                  >
                    {KIND_LABEL[k]}
                  </div>
                  <div className="text-[11px] text-slate-500 leading-snug mt-0.5">
                    {KIND_HINT[k]}
                  </div>
                </button>
              ))}
            </div>

            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600 mb-2">
              Зачем
            </div>
            <div className="grid gap-1.5 mb-5">
              {(Object.keys(PURPOSE_LABEL) as OfferPurpose[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPurpose(p)}
                  className="text-left rounded-lg border px-3 py-2.5 transition-colors"
                  style={{
                    borderColor: purpose === p ? `${ACCENT}55` : HAIR,
                    background: purpose === p ? `${ACCENT}12` : 'transparent',
                  }}
                >
                  <div
                    className="text-[12.5px] font-medium"
                    style={{ color: purpose === p ? ACCENT : '#cbd5e1' }}
                  >
                    {PURPOSE_LABEL[p]}
                  </div>
                  <div className="text-[11px] text-slate-500 leading-snug mt-0.5">
                    {PURPOSE_HINT[p]}
                  </div>
                </button>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 gap-2.5">
              <label className="block">
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">
                  Рынок или территория
                </span>
                <input
                  value={market}
                  onChange={(e) => setMarket(e.target.value)}
                  placeholder="например: Республика Узбекистан"
                  className="mt-1.5 w-full rounded-lg border bg-transparent px-3 py-2 text-[12.5px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-cyan-500/50"
                  style={{ borderColor: HAIR }}
                />
              </label>
              <label className="block">
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">
                  Срок
                </span>
                <input
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder="например: 3 года"
                  className="mt-1.5 w-full rounded-lg border bg-transparent px-3 py-2 text-[12.5px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-cyan-500/50"
                  style={{ borderColor: HAIR }}
                />
              </label>
            </div>
          </div>

          {/* Черновик */}
          <div
            className="rounded-xl border p-5"
            style={{ borderColor: `${ACCENT}26`, background: `${ACCENT}08` }}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600 mb-1">
                  Черновик — не оферта
                </div>
                <div className="text-[13px] text-slate-200 leading-snug">{draft.subject}</div>
              </div>
              <button
                type="button"
                onClick={copy}
                className="shrink-0 rounded-lg border px-2.5 py-1.5 text-[11.5px] text-slate-300 hover:bg-white/[0.05] transition-colors inline-flex items-center gap-1.5"
                style={{ borderColor: HAIR }}
              >
                {copied ? <Check size={12} /> : <ClipboardCopy size={12} />}
                {copied ? 'скопировано' : 'скопировать'}
              </button>
            </div>

            <div
              className="rounded-lg border px-3 py-2.5 mb-3"
              style={{ borderColor: HAIR, background: 'rgba(2,8,23,0.35)' }}
            >
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="text-[12.5px] font-medium text-white">
                  Уровень: {draft.allowed.title}
                </span>
                {draft.downgraded && (
                  <span
                    className="text-[10px] font-bold uppercase tracking-[0.1em] px-1.5 py-0.5 rounded"
                    style={{ color: WARN, background: `${WARN}18` }}
                  >
                    понижен с «{draft.requested.title}»
                  </span>
                )}
              </div>
              <div className="text-[11.5px] text-slate-500 mt-1 leading-relaxed">
                {draft.allowed.gets}
              </div>
              <div className="text-[11.5px] mt-1.5" style={{ color: WARN }}>
                Ставка: {draft.rate} — утверждённых ставок ноль, условия считаются под задачу.
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 mb-3">
              <div>
                <div
                  className="text-[9.5px] font-bold uppercase tracking-[0.12em] mb-1.5"
                  style={{ color: OK }}
                >
                  Передаётся
                </div>
                <ul className="space-y-1">
                  {draft.transfers.map((t) => (
                    <li key={t} className="text-[11.5px] text-slate-400 leading-relaxed flex gap-1.5">
                      <span style={{ color: OK }}>·</span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div
                  className="text-[9.5px] font-bold uppercase tracking-[0.12em] mb-1.5"
                  style={{ color: WARN }}
                >
                  Не передаётся
                </div>
                <ul className="space-y-1">
                  {draft.notTransfers.map((t) => (
                    <li key={t} className="text-[11.5px] text-slate-400 leading-relaxed flex gap-1.5">
                      <span style={{ color: WARN }}>·</span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mb-3">
              <div className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-slate-600 mb-1.5">
                Порядок работ — не сокращается
              </div>
              <div className="text-[11.5px] text-slate-400 leading-relaxed">
                {draft.workOrder.join(' → ')}
              </div>
            </div>

            <div
              className="rounded-lg border p-3"
              style={{ borderColor: `${WARN}33`, background: `${WARN}0d` }}
            >
              <div
                className="text-[9.5px] font-bold uppercase tracking-[0.12em] mb-1.5"
                style={{ color: WARN }}
              >
                Чего в этом предложении сегодня быть не может
              </div>
              <ul className="space-y-1.5">
                {draft.warnings.map((w) => (
                  <li key={w} className="text-[11.5px] text-slate-300 leading-relaxed flex gap-1.5">
                    <span style={{ color: WARN }}>·</span>
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Состояние числами целиком ───────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-12">
        <SectionHead
          icon={ShieldAlert}
          eyebrow="Состояние на сегодня"
          title="Восемь величин, и все восемь — нули"
          note="Написаны числами, а не опущены. Четыре из них стояли в самом верху страницы — до всего остального, а не после."
        />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          {ZEROS.map((z) => (
            <div
              key={z.id}
              className="rounded-xl border p-4"
              style={{ borderColor: HAIR, background: PANEL }}
            >
              <div className="text-3xl font-bold text-white tabular-nums leading-none mb-2">0</div>
              <div className="text-[12px] text-slate-400 leading-snug mb-1.5">{z.short}</div>
              <div className="text-[11px] text-slate-600 leading-relaxed">{z.note}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Куда дальше ─────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-12">
        <h2 className="text-[15px] font-semibold text-white mb-4">Что читать целиком</h2>
        <div className="flex flex-wrap gap-2.5">
          {[
            { to: '/doc', t: 'Документ — четырнадцать глав' },
            { to: '/doc/short', t: 'Короткая презентация' },
            { to: '/doc/constitution', t: 'Двенадцать запретов' },
            { to: '/doc/architecture', t: 'Архитектура и границы передачи' },
            { to: '/doc/realization', t: 'Контур участия и условие открытия' },
            { to: '/architecture', t: 'Фондам и инвесторам' },
            { to: '/partners', t: 'Партнёрские входы' },
            { to: '/showcase', t: 'Витрина услуг' },
          ].map((l) => (
            <Link
              key={l.to}
              href={l.to}
              className="rounded-lg border px-3.5 py-2 text-[12.5px] text-slate-300 hover:bg-white/[0.04] transition-colors inline-flex items-center gap-2"
              style={{ borderColor: HAIR }}
            >
              {l.t}
              <ArrowRight size={12} className="text-slate-600" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
