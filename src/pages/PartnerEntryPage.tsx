// ═══════════════════════════════════════════════════════════════
//  PartnerEntryPage — один партнёрский вход.
//
//  Один компонент обслуживает два адреса:
//    /partner/:segment  — прямой вход по ключу сегмента
//    /invite/:code      — вход по пригласительному коду
//
//  Дисциплина отображения (правило проекта, не стилистика):
//
//  • Пригласительный код — маршрут, а не право доступа. Оговорка
//    INVITE_DISCLAIMER стоит целиком в той же полосе, что и сообщение
//    о входе по приглашению, и не прячется под спойлер.
//  • Список `limits` — чего в предложении нет — показывается наравне
//    с тем, что предлагается, и заметным блоком.
//  • Пустое показывается пустым и называется словами: если позиции
//    витрины под вход не отобраны, так и написано, а пустая сетка
//    не рисуется.
//  • Ни одного захардкоженного числа: счётчики выводятся из данных.
//  • Цены, сроки и проценты в вёрстке не появляются: условия берутся
//    из витрины (TERMS_LABEL), а не выдумываются под сегмент.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'wouter';
import {
  Handshake, ArrowRight, ArrowLeft, ChevronRight, FileText, Store,
  Rocket, Boxes, AlertTriangle, ScrollText, KeyRound, Ban, Pin,
  Users, Target, ExternalLink, Layers, Compass,
} from 'lucide-react';
import {
  SEGMENT_ORDER, SEGMENT_LABEL, ENTRY_STATE_LABEL, ENTRY_STATE_COLOR,
  INVITE_DISCLAIMER,
  type PartnerEntry, type PartnerSegment,
} from '@/data/partners/types';
import { PARTNER_ENTRIES, ENTRY_BY_KEY, findEntryByInvite } from '@/data/partners/entries';
import { SHOWCASE_OFFERINGS } from '@/data/showcase/offerings';
import {
  KIND_LABEL_ONE, STATE_LABEL, STATE_COLOR, TERMS_LABEL,
  type ShowcaseOffering,
} from '@/data/showcase/types';

type TabId = 'welcome' | 'whitepaper' | 'offerings' | 'start' | 'modules';

const TABS: Array<[TabId, string, typeof Handshake]> = [
  ['welcome', 'Знакомство', Compass],
  ['whitepaper', 'Whitepaper', FileText],
  ['offerings', 'Что мы предлагаем', Store],
  ['start', 'Как начать', Rocket],
  ['modules', 'Модули', Boxes],
];

/**
 * Отбор позиций витрины под вход: закреплённые всегда, остальные — по
 * пересечению меток. Закреплённые идут первыми и помечаются. Тег,
 * которого нет в витрине, ничего не покажет — и это правильно.
 */
function selectOfferings(entry: PartnerEntry): Array<{ item: ShowcaseOffering; pinned: boolean }> {
  const pinnedIds = entry.pinnedOfferings ?? [];
  const tags = new Set(entry.offeringTags ?? []);
  const seen = new Set<string>();
  const out: Array<{ item: ShowcaseOffering; pinned: boolean }> = [];

  pinnedIds.forEach((id) => {
    const item = SHOWCASE_OFFERINGS.find((o) => o.id === id);
    if (item && !seen.has(item.id)) {
      seen.add(item.id);
      out.push({ item, pinned: true });
    }
  });
  SHOWCASE_OFFERINGS.forEach((item) => {
    if (seen.has(item.id)) return;
    if ((item.tags ?? []).some((t) => tags.has(t))) {
      seen.add(item.id);
      out.push({ item, pinned: false });
    }
  });
  return out;
}

// ── Подвал вкладки: основание и состояние ────────────────────────────

function TabFooter({ entry }: { entry: PartnerEntry }) {
  const stateColor = ENTRY_STATE_COLOR[entry.state];
  return (
    <div
      className="mt-10 pt-4 border-t flex flex-wrap items-start gap-x-4 gap-y-2"
      style={{ borderColor: 'rgba(148,163,184,0.14)' }}
    >
      <span className="text-[11.5px] text-slate-500 leading-relaxed flex-1 min-w-[220px]">
        Основание: {entry.source}
      </span>
      <div className="flex flex-col items-start gap-1">
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ color: stateColor, border: `1px solid ${stateColor}55` }}
        >
          {ENTRY_STATE_LABEL[entry.state]}
        </span>
        {entry.stateNote && (
          <span className="text-[11.5px] leading-relaxed" style={{ color: `${stateColor}cc` }}>
            {entry.stateNote}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Карточка позиции витрины ─────────────────────────────────────────

function OfferingCard({
  item, pinned, accent,
}: { item: ShowcaseOffering; pinned: boolean; accent: string }) {
  const stateColor = STATE_COLOR[item.state];
  return (
    <div
      className="rounded-xl border p-4 sm:p-5"
      style={{
        borderColor: pinned ? `${accent}55` : 'rgba(148,163,184,0.18)',
        background: pinned ? `${accent}0d` : 'rgba(2,10,26,0.6)',
      }}
    >
      <div className="flex flex-wrap items-center gap-2 mb-1.5">
        {pinned && (
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1.5"
            style={{ color: accent, background: `${accent}1a` }}
          >
            <Pin size={10} /> Закреплено за этим входом
          </span>
        )}
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ color: accent, border: `1px solid ${accent}55` }}
        >
          {KIND_LABEL_ONE[item.kind]}
        </span>
        {item.alsoKinds?.map((k) => (
          <span
            key={k}
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-slate-400"
            style={{ border: '1px solid rgba(148,163,184,0.28)' }}
          >
            {KIND_LABEL_ONE[k]}
          </span>
        ))}
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ color: stateColor, border: `1px solid ${stateColor}55` }}
        >
          {STATE_LABEL[item.state]}
        </span>
      </div>

      <h4 className="text-[15px] sm:text-base font-semibold text-slate-100 leading-snug">
        {item.label}
      </h4>
      <p className="text-[13px] text-slate-400 mt-1 leading-relaxed">{item.body}</p>

      <div
        className="mt-3 rounded-lg px-3.5 py-3"
        style={{ background: `${accent}0f`, border: `1px solid ${accent}2e` }}
      >
        <div className="text-[10.5px] uppercase tracking-wider mb-1.5" style={{ color: `${accent}cc` }}>
          {item.artifactLabel ?? 'Что на выходе'}
        </div>
        <p className="text-[13px] text-slate-200 leading-relaxed">{item.artifact}</p>
      </div>

      <div className="mt-3 space-y-1.5">
        <div
          className="flex flex-wrap items-baseline gap-x-2 text-[12.5px] py-1.5 border-b"
          style={{ borderColor: 'rgba(148,163,184,0.08)' }}
        >
          <span className="text-slate-500 min-w-[110px]">Условия</span>
          <span className="text-slate-300 flex-1 font-medium">{TERMS_LABEL[item.terms]}</span>
        </div>
        {item.stateNote && (
          <div
            className="flex flex-wrap items-baseline gap-x-2 text-[12.5px] py-1.5 border-b"
            style={{ borderColor: 'rgba(148,163,184,0.08)' }}
          >
            <span className="text-slate-500 min-w-[110px]">Уточнение</span>
            <span className="flex-1" style={{ color: stateColor }}>{item.stateNote}</span>
          </div>
        )}
      </div>

      {item.links && item.links.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {item.links.map((l) => (
            <Link
              key={l.path}
              href={l.path}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold border"
              style={{ color: accent, borderColor: `${accent}44`, background: `${accent}0d` }}
            >
              {l.label} <ArrowRight size={12} />
            </Link>
          ))}
        </div>
      )}

      <div className="pt-3 text-[11px] text-slate-500 leading-relaxed">
        Основание: {item.source}
      </div>
    </div>
  );
}

// ── Экран «такого входа нет» ─────────────────────────────────────────

function NotFoundScreen({ segment, inviteCode }: { segment?: string; inviteCode?: string }) {
  const byKey = useMemo(() => {
    const m = new Map<PartnerSegment, PartnerEntry>();
    PARTNER_ENTRIES.forEach((e) => m.set(e.key, e));
    return m;
  }, []);

  return (
    <div className="min-h-screen text-slate-200 pt-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div
          className="rounded-xl border p-5 sm:p-6 flex gap-3.5"
          style={{ borderColor: 'rgba(251,191,36,0.28)', background: 'rgba(251,191,36,0.06)' }}
        >
          <AlertTriangle size={20} className="shrink-0 mt-0.5 text-amber-400" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-amber-100 leading-snug">
              Такого входа нет
            </h1>
            <p className="text-[13.5px] text-amber-100/85 leading-relaxed mt-2">
              {inviteCode
                ? `Пригласительный код «${inviteCode}» не соответствует ни одному описанному входу. Код ничего не открывает не потому, что он просрочен или отозван — сроков и отзыва у кодов нет, — а потому, что такого кода в корпусе не записано.`
                : segment
                  ? `Ключ сегмента «${segment}» в корпусе входов не найден. Возможно, адрес набран с опечаткой или вход ещё не описан.`
                  : 'Адрес открыт без ключа сегмента и без пригласительного кода, поэтому показывать нечего.'}
            </p>
          </div>
        </div>

        <h2 className="text-[13px] font-bold uppercase tracking-[0.14em] text-slate-400 mt-10 mb-3">
          Все входы ({SEGMENT_ORDER.length})
        </h2>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {SEGMENT_ORDER.map((key) => {
            const e = byKey.get(key);
            return (
              <Link
                key={key}
                href={`/partner/${key}`}
                className="rounded-xl border p-3.5 flex items-center gap-3"
                style={{
                  borderColor: e ? `${e.color}33` : 'rgba(148,163,184,0.18)',
                  background: 'rgba(2,10,26,0.55)',
                }}
              >
                <span aria-hidden className="text-lg">{e?.emoji ?? '·'}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-semibold text-slate-100 truncate">
                    {e?.title ?? SEGMENT_LABEL[key]}
                  </div>
                  <div className="text-[11.5px] text-slate-500 truncate">
                    {e ? e.lead : 'Вход ещё не описан в корпусе'}
                  </div>
                </div>
                <ChevronRight size={15} className="text-slate-600 shrink-0" />
              </Link>
            );
          })}
        </div>

        <Link
          href="/partners"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-semibold border text-slate-200 mt-8"
          style={{ borderColor: 'rgba(148,163,184,0.28)' }}
        >
          <Handshake size={15} /> Ко всем партнёрским входам
        </Link>
      </div>
    </div>
  );
}

// ── Страница ─────────────────────────────────────────────────────────

export default function PartnerEntryPage({
  segment, inviteCode,
}: { segment?: string; inviteCode?: string }) {
  const [tab, setTab] = useState<TabId>('welcome');
  const [step, setStep] = useState(0);

  /**
   * Разрешение записи. Пришёл код — ищем по коду и не подменяем его
   * ключом сегмента: если код не найден, показывается экран «такого
   * входа нет», а не соседний вход.
   */
  const viaInvite = useMemo(
    () => (inviteCode ? findEntryByInvite(inviteCode) ?? null : null),
    [inviteCode],
  );
  const entry = useMemo<PartnerEntry | null>(() => {
    if (inviteCode) return viaInvite;
    if (!segment) return null;
    return ENTRY_BY_KEY[segment as PartnerSegment] ?? null;
  }, [inviteCode, viaInvite, segment]);

  const welcome = entry?.welcome ?? [];
  const stepsTotal = welcome.length;

  /** Смена входа сбрасывает презентацию на первый шаг. */
  useEffect(() => {
    setStep(0);
    setTab('welcome');
  }, [entry?.key]);

  /** Клавиши ← и → листают презентацию. Работают только на её вкладке. */
  useEffect(() => {
    if (tab !== 'welcome' || stepsTotal === 0) return;
    const onKey = (ev: KeyboardEvent) => {
      const el = ev.target as HTMLElement | null;
      const tag = el?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || el?.isContentEditable) return;
      if (ev.key === 'ArrowRight') setStep((s) => Math.min(s + 1, stepsTotal - 1));
      if (ev.key === 'ArrowLeft') setStep((s) => Math.max(s - 1, 0));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [tab, stepsTotal]);

  const offerings = useMemo(() => (entry ? selectOfferings(entry) : []), [entry]);
  const pinnedCount = useMemo(() => offerings.filter((o) => o.pinned).length, [offerings]);

  if (!entry) return <NotFoundScreen segment={segment} inviteCode={inviteCode} />;

  const ACCENT = entry.color;
  const stateColor = ENTRY_STATE_COLOR[entry.state];
  const current = welcome[Math.min(step, Math.max(stepsTotal - 1, 0))];

  return (
    <div className="min-h-screen text-slate-200 pt-14">
      {/* ── Полоса входа по приглашению ── */}
      {viaInvite && (
        <div
          className="border-b"
          style={{ borderColor: 'rgba(248,113,113,0.28)', background: 'rgba(248,113,113,0.07)' }}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex gap-3.5">
            <KeyRound size={18} className="shrink-0 mt-0.5 text-red-300" />
            <div>
              <div className="text-[13.5px] font-bold text-red-100">
                Вы вошли по приглашению для сегмента «{SEGMENT_LABEL[entry.key]}» — код{' '}
                <span className="font-mono">{entry.inviteCode}</span>
              </div>
              <p className="text-[12.5px] text-red-100/80 leading-[1.7] mt-1.5">
                {INVITE_DISCLAIMER}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Шапка ── */}
      <div
        className="relative overflow-hidden border-b"
        style={{
          borderColor: `${ACCENT}22`,
          background: `linear-gradient(160deg, ${ACCENT}1a, rgba(2,8,23,0) 60%)`,
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="flex items-center gap-2 mb-4">
            <span aria-hidden className="text-base">{entry.emoji}</span>
            <span className="text-[11px] font-bold tracking-[0.18em] uppercase" style={{ color: ACCENT }}>
              Партнёрский вход · {SEGMENT_LABEL[entry.key]}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold text-white leading-tight max-w-3xl">
            {entry.title}
          </h1>
          <p className="text-[14px] sm:text-base text-slate-400 mt-4 max-w-2xl leading-relaxed">
            {entry.lead}
          </p>

          <div className="flex flex-wrap gap-6 mt-8">
            {[
              { v: String(stepsTotal), l: 'шагов знакомства' },
              { v: String(entry.theses.length), l: 'тезисов whitepaper' },
              { v: String(offerings.length), l: 'позиций витрины отобрано' },
              { v: String(entry.onboarding.length), l: 'шагов онбординга' },
              { v: String(entry.limits.length), l: 'заявленных ограничений' },
            ].map((s) => (
              <div key={s.l}>
                <div className="text-2xl sm:text-3xl font-bold" style={{ color: ACCENT }}>{s.v}</div>
                <div className="text-[11px] text-slate-500 uppercase tracking-wide mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-6">
            <span
              className="text-[10.5px] font-bold px-2.5 py-1 rounded-full"
              style={{ color: stateColor, border: `1px solid ${stateColor}55` }}
            >
              {ENTRY_STATE_LABEL[entry.state]}
            </span>
            {entry.stateNote && (
              <span className="text-[12px] leading-relaxed" style={{ color: `${stateColor}cc` }}>
                {entry.stateNote}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-3 mt-8">
            <Link
              href="/partners"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-semibold border text-slate-200"
              style={{ borderColor: 'rgba(148,163,184,0.28)' }}
            >
              <Handshake size={15} /> Все входы
            </Link>
            <Link
              href="/showcase"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-semibold border text-slate-200"
              style={{ borderColor: 'rgba(148,163,184,0.28)' }}
            >
              <Store size={15} /> Общая витрина
            </Link>
          </div>
        </div>
      </div>

      {/* ── Вкладки ── */}
      <div
        className="sticky top-14 z-20 border-b backdrop-blur"
        style={{ borderColor: 'rgba(148,163,184,0.14)', background: 'rgba(2,8,23,0.86)' }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex gap-1 overflow-x-auto">
          {TABS.map(([id, label, Icon]) => (
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
        {/* ══ Знакомство ══ */}
        {tab === 'welcome' && (
          <div>
            {stepsTotal === 0 || !current ? (
              <div
                className="rounded-xl border p-5 text-[13.5px] text-slate-400 leading-relaxed"
                style={{ borderColor: 'rgba(148,163,184,0.18)', background: 'rgba(2,10,26,0.5)' }}
              >
                Приветственная презентация для этого входа ещё не собрана: шагов записано ноль.
                Пока её нет, знакомство идёт по тезисам whitepaper и разделу «Как начать».
              </div>
            ) : (
              <div className="max-w-3xl">
                {/* Индикатор прогресса */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex gap-1.5 flex-1">
                    {welcome.map((w, i) => (
                      <button
                        key={w.title}
                        onClick={() => setStep(i)}
                        className="h-1.5 flex-1 rounded-full transition-colors"
                        style={{ background: i <= step ? ACCENT : 'rgba(148,163,184,0.18)' }}
                        title={w.title}
                      />
                    ))}
                  </div>
                  <span className="text-[12px] text-slate-500 shrink-0">
                    шаг {step + 1} из {stepsTotal}
                  </span>
                </div>

                <div
                  className="rounded-xl border p-5 sm:p-7"
                  style={{ borderColor: `${ACCENT}44`, background: `${ACCENT}0d` }}
                >
                  <div className="text-[10px] font-mono text-slate-500 mb-2">
                    {String(step + 1).padStart(2, '0')} / {String(stepsTotal).padStart(2, '0')}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                    {current.title}
                  </h2>
                  <p className="text-[14px] sm:text-[15px] text-slate-300 leading-[1.8] mt-3">
                    {current.body}
                  </p>

                  {current.metric && (
                    <div
                      className="mt-5 rounded-lg px-4 py-4"
                      style={{ background: `${ACCENT}14`, border: `1px solid ${ACCENT}33` }}
                    >
                      <div className="text-3xl sm:text-4xl font-bold" style={{ color: ACCENT }}>
                        {current.metric.value}
                      </div>
                      <div className="text-[12px] text-slate-400 mt-1 leading-relaxed">
                        {current.metric.caption}
                      </div>
                    </div>
                  )}

                  {current.link && (
                    <Link
                      href={current.link.path}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-semibold text-slate-900 mt-5"
                      style={{ background: ACCENT }}
                    >
                      {current.link.label} <ArrowRight size={14} />
                    </Link>
                  )}
                </div>

                {/* Стрелки. Клавиши ← и → делают то же самое. */}
                <div className="flex items-center justify-between mt-5">
                  <button
                    onClick={() => setStep((s) => Math.max(s - 1, 0))}
                    disabled={step === 0}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold border"
                    style={{
                      color: step === 0 ? '#64748b' : '#e2e8f0',
                      borderColor: 'rgba(148,163,184,0.22)',
                      opacity: step === 0 ? 0.45 : 1,
                      cursor: step === 0 ? 'default' : 'pointer',
                    }}
                  >
                    <ArrowLeft size={14} /> Назад
                  </button>

                  <span className="text-[11px] text-slate-600">
                    листается клавишами ← и →
                  </span>

                  <button
                    onClick={() =>
                      step < stepsTotal - 1 ? setStep(step + 1) : setTab('whitepaper')
                    }
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold"
                    style={{ background: `${ACCENT}1f`, color: ACCENT }}
                  >
                    {step < stepsTotal - 1 ? 'Дальше' : 'К whitepaper'}
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Кому этот вход и что у сегмента болит */}
            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 mt-8">
              <div
                className="rounded-xl border p-4 sm:p-5"
                style={{ borderColor: 'rgba(148,163,184,0.18)', background: 'rgba(2,10,26,0.55)' }}
              >
                <div className="text-[10.5px] uppercase tracking-wider text-slate-500 mb-2.5 inline-flex items-center gap-1.5">
                  <Users size={12} /> Кому этот вход ({entry.who.length})
                </div>
                {entry.who.length === 0 ? (
                  <p className="text-[13px] text-slate-400 leading-relaxed">
                    Перечень не заполнен: кто относится к сегменту, в корпусе пока не записано.
                  </p>
                ) : (
                  <ul className="space-y-1.5">
                    {entry.who.map((w, i) => (
                      <li key={i} className="text-[13px] text-slate-300 leading-relaxed pl-4 relative">
                        <span className="absolute left-0 top-[3px]" style={{ color: `${ACCENT}aa` }}>·</span>
                        {w}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div
                className="rounded-xl border p-4 sm:p-5"
                style={{ borderColor: 'rgba(148,163,184,0.18)', background: 'rgba(2,10,26,0.55)' }}
              >
                <div className="text-[10.5px] uppercase tracking-wider text-slate-500 mb-2.5 inline-flex items-center gap-1.5">
                  <Target size={12} /> Что у сегмента болит ({entry.pains.length})
                </div>
                {entry.pains.length === 0 ? (
                  <p className="text-[13px] text-slate-400 leading-relaxed">
                    Список не заполнен: боли сегмента в корпусе пока не описаны.
                  </p>
                ) : (
                  <ul className="space-y-1.5">
                    {entry.pains.map((p, i) => (
                      <li key={i} className="text-[13px] text-slate-300 leading-relaxed pl-4 relative">
                        <span className="absolute left-0 top-[3px]" style={{ color: `${ACCENT}aa` }}>·</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <TabFooter entry={entry} />
          </div>
        )}

        {/* ══ Whitepaper ══ */}
        {tab === 'whitepaper' && (
          <div className="max-w-3xl">
            {entry.theses.length === 0 ? (
              <div
                className="rounded-xl border p-5 text-[13.5px] text-slate-400 leading-relaxed"
                style={{ borderColor: 'rgba(148,163,184,0.18)', background: 'rgba(2,10,26,0.5)' }}
              >
                Срез whitepaper под этот вход ещё не собран: тезисов записано ноль.
              </div>
            ) : (
              entry.theses.map((t) => (
                <div key={t.n} className="mb-8 sm:mb-10">
                  <div className="flex items-baseline gap-3 mb-2.5">
                    <span className="text-[13px] font-mono font-bold" style={{ color: `${ACCENT}99` }}>
                      {String(t.n).padStart(2, '0')}
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-100 leading-snug">
                      {t.title}
                    </h3>
                  </div>
                  <p className="text-[14px] text-slate-400 leading-[1.75] pl-8">{t.body}</p>
                  {/* Строка источника обязательна: тезис без основания
                      в корпус не вносится, и на странице это видно. */}
                  <div className="text-[11.5px] text-slate-500 leading-relaxed pl-8 mt-2.5 pt-2 border-t inline-flex gap-2"
                    style={{ borderColor: 'rgba(148,163,184,0.10)' }}>
                    <ScrollText size={12} className="shrink-0 mt-0.5 text-slate-600" />
                    <span>Основание: {t.source}</span>
                  </div>
                </div>
              ))
            )}

            <TabFooter entry={entry} />
          </div>
        )}

        {/* ══ Что мы предлагаем ══ */}
        {tab === 'offerings' && (
          <div>
            {offerings.length === 0 ? (
              <div
                className="rounded-xl border p-5 flex gap-3.5"
                style={{ borderColor: 'rgba(148,163,184,0.18)', background: 'rgba(2,10,26,0.5)' }}
              >
                <ScrollText size={17} className="shrink-0 mt-0.5 text-slate-500" />
                <div>
                  <div className="text-[13.5px] font-semibold text-slate-200 mb-1.5">
                    Под этот вход позиции витрины ещё не отобраны
                  </div>
                  <p className="text-[13px] text-slate-400 leading-relaxed">
                    Закреплённых позиций: {(entry.pinnedOfferings ?? []).length}. Меток отбора:{' '}
                    {entry.offeringTags.length}
                    {entry.offeringTags.length > 0 && ` (${entry.offeringTags.join(', ')})`}. Ни
                    одна позиция общей витрины по ним не подошла — пустую сетку вместо этого
                    мы не рисуем.
                  </p>
                  <Link
                    href="/showcase"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-[12.5px] font-semibold mt-3.5"
                    style={{ background: `${ACCENT}1a`, color: ACCENT }}
                  >
                    Открыть общую витрину <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="text-[12px] text-slate-500 mb-5">
                  Отобрано позиций: {offerings.length} из {SHOWCASE_OFFERINGS.length} в общей
                  витрине. Закреплено за входом: {pinnedCount} — они идут первыми и помечены.
                  Остальные подобраны по меткам: {entry.offeringTags.join(', ') || 'меток нет'}.
                </div>
                <div className="grid gap-3">
                  {offerings.map(({ item, pinned }) => (
                    <OfferingCard key={item.id} item={item} pinned={pinned} accent={ACCENT} />
                  ))}
                </div>
              </>
            )}

            <TabFooter entry={entry} />
          </div>
        )}

        {/* ══ Как начать ══ */}
        {tab === 'start' && (
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-100 mb-4">
              Порядок шагов ({entry.onboarding.length})
            </h2>
            {entry.onboarding.length === 0 ? (
              <div
                className="rounded-xl border p-5 text-[13.5px] text-slate-400 leading-relaxed"
                style={{ borderColor: 'rgba(148,163,184,0.18)', background: 'rgba(2,10,26,0.5)' }}
              >
                Онбординг под этот вход ещё не описан: шагов записано ноль.
              </div>
            ) : (
              <ol className="space-y-2.5 max-w-3xl">
                {entry.onboarding.map((s, i) => (
                  <li
                    key={i}
                    className="rounded-xl border p-4 flex items-start gap-3.5"
                    style={{ borderColor: 'rgba(148,163,184,0.16)', background: 'rgba(2,10,26,0.5)' }}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-[12px] font-bold font-mono"
                      style={{ background: `${ACCENT}1a`, color: ACCENT }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <p className="text-[13.5px] text-slate-300 leading-relaxed flex-1">{s}</p>
                  </li>
                ))}
              </ol>
            )}

            {/* Обмен: две колонки. Не односторонняя выгода. */}
            <h2 className="text-lg sm:text-xl font-bold text-slate-100 mt-10 mb-4">Обмен</h2>
            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
              {([
                ['Что вносит партнёр', entry.exchange.brings],
                ['Что партнёр получает', entry.exchange.gets],
              ] as const).map(([label, list]) => (
                <div
                  key={label}
                  className="rounded-xl border p-4 sm:p-5"
                  style={{ borderColor: `${ACCENT}2e`, background: `${ACCENT}0a` }}
                >
                  <div className="text-[10.5px] uppercase tracking-wider mb-2.5" style={{ color: `${ACCENT}cc` }}>
                    {label} ({list.length})
                  </div>
                  {list.length === 0 ? (
                    <p className="text-[13px] text-slate-400 leading-relaxed">
                      Список пуст: в корпусе по этой стороне обмена ничего не записано.
                    </p>
                  ) : (
                    <ul className="space-y-1.5">
                      {list.map((x, i) => (
                        <li key={i} className="text-[13px] text-slate-300 leading-relaxed pl-4 relative">
                          <span className="absolute left-0 top-[3px]" style={{ color: `${ACCENT}aa` }}>·</span>
                          {x}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>

            {/* Границы ответственности. Блок заметный, а не сноска. */}
            <div
              className="rounded-xl border p-5 mt-6"
              style={{ borderColor: 'rgba(248,113,113,0.30)', background: 'rgba(248,113,113,0.07)' }}
            >
              <div className="flex items-center gap-2 mb-2.5">
                <Ban size={16} className="text-red-400 shrink-0" />
                <span className="text-[13.5px] font-bold text-red-200">
                  Чего в этом предложении нет ({entry.limits.length})
                </span>
              </div>
              {entry.limits.length === 0 ? (
                <p className="text-[12.5px] text-red-100/80 leading-relaxed">
                  Ограничений по этому входу не записано ни одного. Это не значит, что их нет:
                  это значит, что они не описаны — и до разговора границу считать очерченной
                  нельзя.
                </p>
              ) : (
                <ul className="space-y-1.5">
                  {entry.limits.map((l, i) => (
                    <li key={i} className="text-[12.5px] text-red-100/85 leading-relaxed flex gap-2">
                      <span className="text-red-400/60 shrink-0">—</span>
                      {l}
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-[11.5px] text-red-200/70 mt-3 leading-relaxed">
                Ставки, сроки и проценты на этой странице не публикуются: ни одна ставка контура
                не утверждена. Условия расчёта по каждой позиции указаны на вкладке «Что мы
                предлагаем».
              </p>
            </div>

            <TabFooter entry={entry} />
          </div>
        )}

        {/* ══ Модули ══ */}
        {tab === 'modules' && (
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-100 mb-4">
              Куда ведёт этот вход ({entry.modules.length})
            </h2>
            {entry.modules.length === 0 ? (
              <div
                className="rounded-xl border p-5 text-[13.5px] text-slate-400 leading-relaxed"
                style={{ borderColor: 'rgba(148,163,184,0.18)', background: 'rgba(2,10,26,0.5)' }}
              >
                Модули под этот вход не указаны: записей ноль.
              </div>
            ) : (
              <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                {entry.modules.map((m) => (
                  <Link
                    key={m.path}
                    href={m.path}
                    className="rounded-xl border p-4 sm:p-5 flex items-start gap-3.5"
                    style={{ borderColor: `${ACCENT}33`, background: 'rgba(2,10,26,0.55)' }}
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${ACCENT}1a`, color: ACCENT }}
                    >
                      <Layers size={17} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[15px] font-semibold text-slate-100 leading-snug">
                        {m.label}
                      </div>
                      {m.note && (
                        <p className="text-[12.5px] text-slate-400 leading-relaxed mt-1">{m.note}</p>
                      )}
                      <div className="text-[11px] font-mono text-slate-600 mt-1.5 inline-flex items-center gap-1.5">
                        <ExternalLink size={11} /> {m.path}
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-600 shrink-0 mt-1" />
                  </Link>
                ))}
              </div>
            )}

            <h2 className="text-[13px] font-bold uppercase tracking-[0.14em] text-slate-400 mt-10 mb-3">
              Домены платформы ({entry.domains.length})
            </h2>
            {entry.domains.length === 0 ? (
              <p className="text-[13px] text-slate-400 leading-relaxed">
                Домены под этот вход не отмечены: записей ноль.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {entry.domains.map((d) => (
                  <span
                    key={d}
                    className="text-[11.5px] px-2.5 py-1 rounded-lg text-slate-300"
                    style={{ background: `${ACCENT}14`, border: `1px solid ${ACCENT}2e` }}
                  >
                    {d}
                  </span>
                ))}
              </div>
            )}

            <TabFooter entry={entry} />
          </div>
        )}
      </div>
    </div>
  );
}
