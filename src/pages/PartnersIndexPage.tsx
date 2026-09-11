// ═══════════════════════════════════════════════════════════════
//  PartnersIndexPage — обзор партнёрских входов.
//
//  Восемь категорий партнёра, у каждой свой адрес, своя приветственная
//  презентация, свой срез whitepaper и свой набор позиций витрины.
//
//  Дисциплина отображения наследуется от витрины и модуля «Газнефть»:
//
//  • Ни одного захардкоженного числа. Все счётчики выводятся из
//    PARTNER_ENTRIES и SHOWCASE_OFFERINGS.
//  • Пустое показывается пустым и называется словами. Ноль пишется
//    нулём, а не опускается.
//  • Оговорка про пригласительный код стоит целиком и на виду:
//    партнёр должен понимать, что код не является пропуском.
// ═══════════════════════════════════════════════════════════════

import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import {
  Handshake, ArrowRight, KeyRound, Copy, Check, AlertTriangle,
  ScrollText, Store, LayoutGrid, Link2, X,
} from 'lucide-react';
import {
  SEGMENT_ORDER, ENTRY_STATE_LABEL, ENTRY_STATE_COLOR, INVITE_DISCLAIMER,
  type PartnerEntry, type PartnerSegment,
} from '@/data/partners/types';
import { PARTNER_ENTRIES, ENTRY_BY_KEY, findEntryByInvite } from '@/data/partners/entries';
import { SHOWCASE_OFFERINGS } from '@/data/showcase/offerings';

const ACCENT = '#38bdf8';

/**
 * Отбор позиций витрины под вход. Правило одно и то же на обзоре и на
 * странице входа: закреплённая позиция показывается всегда, остальные —
 * по пересечению меток. Выдуманный тег не покажет ничего: `tags`
 * сверяются с тем, что действительно записано в витрине.
 */
function selectOfferingIds(entry: PartnerEntry): string[] {
  const pinned = entry.pinnedOfferings ?? [];
  const tags = new Set(entry.offeringTags ?? []);
  const ids = new Set<string>();

  pinned.forEach((id) => {
    if (SHOWCASE_OFFERINGS.some((o) => o.id === id)) ids.add(id);
  });
  SHOWCASE_OFFERINGS.forEach((o) => {
    if ((o.tags ?? []).some((t) => tags.has(t))) ids.add(o.id);
  });
  return Array.from(ids);
}

// ── Карточка сегмента ────────────────────────────────────────────────

function SegmentCard({ entry, offerings }: { entry: PartnerEntry; offerings: number }) {
  const stateColor = ENTRY_STATE_COLOR[entry.state];

  return (
    <Link
      href={`/partner/${entry.key}`}
      className="rounded-xl border p-4 sm:p-5 flex flex-col transition-colors"
      style={{
        borderColor: `${entry.color}33`,
        background: `linear-gradient(160deg, ${entry.color}0d, rgba(2,10,26,0.55) 70%)`,
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-lg"
          style={{ background: `${entry.color}1a` }}
        >
          <span aria-hidden>{entry.emoji}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-bold text-slate-100 leading-snug">{entry.title}</h3>
          <div className="text-[11px] mt-0.5" style={{ color: `${entry.color}cc` }}>
            позиций витрины под этот вход: {offerings}
          </div>
        </div>
      </div>

      <p className="text-[13px] text-slate-400 leading-relaxed mt-3 flex-1">{entry.lead}</p>

      <div className="flex flex-wrap items-center gap-2 mt-3.5">
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ color: stateColor, border: `1px solid ${stateColor}55` }}
        >
          {ENTRY_STATE_LABEL[entry.state]}
        </span>
        <span
          className="text-[10px] font-mono px-2 py-0.5 rounded-full text-slate-400"
          style={{ background: 'rgba(148,163,184,0.08)' }}
        >
          /invite/{entry.inviteCode}
        </span>
      </div>

      {entry.stateNote && (
        <p className="text-[11.5px] leading-relaxed mt-2.5" style={{ color: `${stateColor}cc` }}>
          {entry.stateNote}
        </p>
      )}

      <div
        className="mt-3.5 pt-3 border-t flex items-center gap-2 text-[12px] font-semibold"
        style={{ borderColor: 'rgba(148,163,184,0.12)', color: entry.color }}
      >
        Открыть вход <ArrowRight size={13} />
      </div>
    </Link>
  );
}

// ── Страница ─────────────────────────────────────────────────────────

export default function PartnersIndexPage() {
  const [copied, setCopied] = useState<string | null>(null);
  const [failed, setFailed] = useState<string | null>(null);

  /** Порядок входов задаётся корпусом, а не порядком записи в файле. */
  const entries = useMemo(() => {
    const rank = new Map<PartnerSegment, number>();
    SEGMENT_ORDER.forEach((k, i) => rank.set(k, i));
    return [...PARTNER_ENTRIES].sort(
      (a, b) => (rank.get(a.key) ?? 99) - (rank.get(b.key) ?? 99),
    );
  }, []);

  /** Счётчики шапки. Все три считаются из данных. */
  const totalEntries = entries.length;
  const openEntries = useMemo(
    () => entries.filter((e) => e.state === 'open').length,
    [entries],
  );

  /**
   * Подключённых партнёров считать не из чего: ни одно поле PartnerEntry
   * не фиксирует факт подключения, реестра партнёров в корпусе нет.
   * Пока реестра нет, счётчик равен нулю — и показывается нулём.
   * Подставить правдоподобное число вместо отсутствующего мы не будем.
   */
  const connectedPartners = 0;

  /** Сколько позиций витрины отбирается под каждый вход. */
  const offeringsBySegment = useMemo(() => {
    const m = new Map<PartnerSegment, number>();
    entries.forEach((e) => m.set(e.key, selectOfferingIds(e).length));
    return m;
  }, [entries]);

  /** Сколько всего разных позиций витрины закрыто входами. */
  const coveredOfferings = useMemo(() => {
    const ids = new Set<string>();
    entries.forEach((e) => selectOfferingIds(e).forEach((id) => ids.add(id)));
    return ids.size;
  }, [entries]);

  /** Сколько входов вообще не имеет отобранных позиций. Пустое называется словами. */
  const emptyEntries = useMemo(
    () => entries.filter((e) => (offeringsBySegment.get(e.key) ?? 0) === 0),
    [entries, offeringsBySegment],
  );

  const inviteUrl = (code: string) =>
    `${typeof window === 'undefined' ? '' : window.location.origin}/invite/${code}`;

  const copyInvite = async (code: string) => {
    setFailed(null);
    try {
      await navigator.clipboard.writeText(inviteUrl(code));
      setCopied(code);
      window.setTimeout(() => setCopied(null), 2000);
    } catch {
      // Буфер обмена может быть недоступен: небезопасный контекст или отказ
      // пользователя. Молча делать вид, что скопировалось, нельзя.
      setCopied(null);
      setFailed(code);
    }
  };

  /**
   * Проверка кодов на однозначность. Если два входа объявили один код,
   * findEntryByInvite вернёт один из них, и второй вход по ссылке не
   * откроется. Это видно здесь, а не в отладке.
   */
  const brokenInvites = useMemo(
    () => entries.filter((e) => findEntryByInvite(e.inviteCode)?.key !== e.key),
    [entries],
  );

  /** Обратная сверка: карта по ключу должна содержать те же записи. */
  const missingInMap = useMemo(
    () => entries.filter((e) => !ENTRY_BY_KEY[e.key]),
    [entries],
  );

  return (
    <div className="min-h-screen text-slate-200 pt-14">
      {/* ── Шапка ── */}
      <div
        className="relative overflow-hidden border-b"
        style={{
          borderColor: `${ACCENT}22`,
          background: 'linear-gradient(160deg, rgba(56,189,248,0.10), rgba(2,8,23,0) 60%)',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="flex items-center gap-2 mb-4">
            <Handshake size={18} style={{ color: ACCENT }} />
            <span className="text-[11px] font-bold tracking-[0.18em] uppercase" style={{ color: ACCENT }}>
              Партнёрские входы
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold text-white leading-tight max-w-3xl">
            Отдельный вход для каждой категории партнёра
          </h1>
          <p className="text-[14px] sm:text-base text-slate-400 mt-4 max-w-2xl leading-relaxed">
            Промышленность, инфраструктура, градостроение, бизнес, корпорации, государства,
            организации и прочие партнёры заходят в контур по-разному. У каждого входа своя
            приветственная презентация, свой онбординг, свой срез whitepaper и свой набор
            позиций витрины. У каждого входа указано, чего в предложении нет.
          </p>

          <div className="flex flex-wrap gap-6 mt-8">
            {[
              { v: String(totalEntries), l: 'входов описано' },
              { v: String(openEntries), l: 'из них открыто для заявок' },
              { v: String(connectedPartners), l: 'партнёров подключено' },
              { v: String(coveredOfferings), l: 'позиций витрины закрыто входами' },
            ].map((s) => (
              <div key={s.l}>
                <div className="text-2xl sm:text-3xl font-bold" style={{ color: ACCENT }}>{s.v}</div>
                <div className="text-[11px] text-slate-500 uppercase tracking-wide mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>

          <p className="text-[12px] text-slate-500 leading-relaxed mt-4 max-w-2xl">
            Счётчик подключённых партнёров равен нулю потому, что реестра подключённых
            партнёров в корпусе нет: ни одно поле записи входа не фиксирует подключение.
            Появится реестр — появится число.
          </p>

          <div className="flex flex-wrap gap-3 mt-8">
            <Link
              href="/showcase"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-semibold text-slate-900"
              style={{ background: ACCENT }}
            >
              <Store size={15} /> Витрина контура
            </Link>
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-semibold border text-slate-200"
              style={{ borderColor: 'rgba(148,163,184,0.28)' }}
            >
              <LayoutGrid size={15} /> Каталог технологий
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* ── Сетка входов ── */}
        <div className="flex items-baseline gap-3 mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-slate-100">Куда вы заходите</h2>
          <span
            className="text-[11px] font-bold px-2 py-0.5 rounded-full"
            style={{ color: ACCENT, background: `${ACCENT}14` }}
          >
            {totalEntries}
          </span>
        </div>

        {totalEntries === 0 ? (
          <div
            className="rounded-xl border p-5 text-[13px] text-slate-400 leading-relaxed"
            style={{ borderColor: 'rgba(148,163,184,0.18)', background: 'rgba(2,10,26,0.5)' }}
          >
            Ни один партнёрский вход пока не описан. Сетка не рисуется, потому что рисовать
            нечего: записей входов в корпусе нет.
          </div>
        ) : (
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
            {entries.map((e) => (
              <SegmentCard
                key={e.key}
                entry={e}
                offerings={offeringsBySegment.get(e.key) ?? 0}
              />
            ))}
          </div>
        )}

        {/* Пустые входы называются прямо, а не прячутся за нулём в карточке. */}
        {emptyEntries.length > 0 && (
          <div
            className="rounded-xl border p-4 sm:p-5 mt-4 flex gap-3.5"
            style={{ borderColor: 'rgba(148,163,184,0.18)', background: 'rgba(148,163,184,0.05)' }}
          >
            <ScrollText size={16} className="shrink-0 mt-0.5 text-slate-500" />
            <div>
              <div className="text-[13px] font-semibold text-slate-300 mb-1">
                Входов без отобранных позиций витрины: {emptyEntries.length}
              </div>
              <p className="text-[12.5px] text-slate-400 leading-relaxed">
                {emptyEntries.map((e) => e.title).join(', ')} — под эти входы позиции витрины
                ещё не отобраны. Страница входа скажет об этом теми же словами и не покажет
                пустую сетку.
              </p>
            </div>
          </div>
        )}

        {/* ── Пригласительные ссылки ── */}
        <div className="flex items-center gap-2 mt-10 sm:mt-12 mb-4">
          <KeyRound size={15} className="text-slate-500" />
          <h2 className="text-[13px] font-bold uppercase tracking-[0.14em] text-slate-400">
            Пригласительные ссылки
          </h2>
        </div>

        {/* Оговорка стоит ДО таблицы, а не под ней мелким шрифтом: партнёр
            должен прочитать её раньше, чем скопирует адрес. */}
        <div
          className="rounded-xl border p-5 flex gap-3.5"
          style={{ borderColor: 'rgba(248,113,113,0.30)', background: 'rgba(248,113,113,0.07)' }}
        >
          <AlertTriangle size={18} className="shrink-0 mt-0.5 text-red-400" />
          <div>
            <div className="text-[13.5px] font-bold text-red-200 mb-1.5">
              Что на самом деле делает пригласительный код
            </div>
            <p className="text-[13px] text-red-100/85 leading-[1.7]">{INVITE_DISCLAIMER}</p>
          </div>
        </div>

        {entries.length === 0 ? (
          <p className="text-[13px] text-slate-400 leading-relaxed mt-4">
            Пригласительных кодов нет: входов в корпусе нет.
          </p>
        ) : (
          <div
            className="rounded-xl border overflow-hidden mt-4"
            style={{ borderColor: 'rgba(148,163,184,0.18)', background: 'rgba(2,10,26,0.6)' }}
          >
            <div
              className="hidden sm:grid grid-cols-[1.4fr_0.8fr_1.4fr_auto] gap-3 px-4 py-2.5 text-[10.5px] uppercase tracking-wider text-slate-500 border-b"
              style={{ borderColor: 'rgba(148,163,184,0.12)' }}
            >
              <div>Сегмент</div>
              <div>Код</div>
              <div>Адрес</div>
              <div className="text-right">Буфер</div>
            </div>

            {entries.map((e) => {
              const isCopied = copied === e.inviteCode;
              const isFailed = failed === e.inviteCode;
              return (
                <div
                  key={e.key}
                  className="grid sm:grid-cols-[1.4fr_0.8fr_1.4fr_auto] gap-2 sm:gap-3 px-4 py-3 border-b items-center"
                  style={{ borderColor: 'rgba(148,163,184,0.08)' }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span aria-hidden className="text-[15px]">{e.emoji}</span>
                    <span className="text-[13px] text-slate-200 font-medium truncate">{e.title}</span>
                  </div>
                  <div className="text-[12.5px] font-mono" style={{ color: e.color }}>
                    {e.inviteCode}
                  </div>
                  <Link
                    href={`/invite/${e.inviteCode}`}
                    className="text-[12.5px] font-mono text-slate-400 inline-flex items-center gap-1.5 min-w-0"
                  >
                    <Link2 size={12} className="shrink-0 text-slate-600" />
                    <span className="truncate">/invite/{e.inviteCode}</span>
                  </Link>
                  <div className="flex items-center gap-2 sm:justify-end">
                    <button
                      onClick={() => copyInvite(e.inviteCode)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11.5px] font-semibold border transition-colors"
                      style={{
                        color: isCopied ? '#34d399' : '#e2e8f0',
                        borderColor: isCopied ? 'rgba(52,211,153,0.45)' : 'rgba(148,163,184,0.22)',
                      }}
                      title="Скопировать полный адрес приглашения"
                    >
                      {isCopied ? <Check size={12} /> : <Copy size={12} />}
                      {isCopied ? 'Скопировано' : 'Копировать адрес'}
                    </button>
                    {isFailed && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-red-300">
                        <X size={11} /> буфер недоступен
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Служебная сверка корпуса. Показывается, только если что-то
            действительно расходится: молчаливое расхождение хуже шума. */}
        {(brokenInvites.length > 0 || missingInMap.length > 0) && (
          <div
            className="rounded-xl border p-4 sm:p-5 mt-4"
            style={{ borderColor: 'rgba(251,191,36,0.28)', background: 'rgba(251,191,36,0.06)' }}
          >
            <div className="text-[13px] font-semibold text-amber-200 mb-1.5">
              Расхождение в корпусе входов
            </div>
            {brokenInvites.length > 0 && (
              <p className="text-[12.5px] text-amber-100/85 leading-relaxed">
                Коды, которые не открывают свой вход ({brokenInvites.length}):{' '}
                {brokenInvites.map((e) => `${e.inviteCode} → ${e.title}`).join('; ')}. Скорее
                всего, код объявлен дважды.
              </p>
            )}
            {missingInMap.length > 0 && (
              <p className="text-[12.5px] text-amber-100/85 leading-relaxed mt-1.5">
                Входы, отсутствующие в карте по ключу ({missingInMap.length}):{' '}
                {missingInMap.map((e) => e.key).join(', ')}. Адрес /partner/КЛЮЧ для них
                не откроется.
              </p>
            )}
          </div>
        )}

        {/* ── Основания ── */}
        <div className="mt-10 sm:mt-12">
          <h2 className="text-[13px] font-bold uppercase tracking-[0.14em] text-slate-400 mb-3">
            На чём основаны описания входов
          </h2>
          <div className="space-y-1.5">
            {entries.map((e) => (
              <div
                key={e.key}
                className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-[12px] py-1.5 border-b"
                style={{ borderColor: 'rgba(148,163,184,0.08)' }}
              >
                <span className="text-slate-500 min-w-[190px]">{e.title}</span>
                <span className="text-slate-400 flex-1">Основание: {e.source}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
