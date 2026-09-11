// ═══════════════════════════════════════════════════════════════
//  ShowcasePage — общая витрина контура.
//
//  Одна страница на четырёх поставщиков: UNICAP, LabForge, DAOCIV,
//  ArkheOS. Услуги, консалтинг, аудит, R&D, разработка, платформы,
//  решения, продукты, исследования и уровни участия — в одном списке
//  с двойной фильтрацией.
//
//  Дисциплина отображения наследуется от модуля «Газнефть»:
//
//  • Цена не рисуется. Показывается ровно то условие расчёта, которое
//    записано в данных (TERMS_LABEL), и ничего сверх него.
//  • Состояние называется своим именем: «объявлено» не выдаётся за
//    «действует», цвет бейджа берётся из STATE_COLOR.
//  • У каждой позиции внизу карточки виден `source`. Основание — часть
//    предложения, а не сноска для внутреннего пользования.
//  • Оговорки поставщиков (`note`) стоят в карточке провайдера открытым
//    текстом: это юридически значимая часть, она не прячется.
//  • Раздел «Чего в этой позиции нет» показывается наравне с тем, что
//    входит, — граница ответственности видна до разговора.
// ═══════════════════════════════════════════════════════════════

import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import {
  Store, Search, X, ChevronDown, ArrowRight, ExternalLink,
  Handshake, Lightbulb, ShieldCheck, FlaskConical, Code2, Layers,
  Puzzle, Package, Microscope, Users, Building2, LayoutGrid,
  RotateCcw, Ban, Target, FileText, ScrollText, MessageSquare,
} from 'lucide-react';
import {
  KIND_LABEL, KIND_LABEL_ONE, KIND_ORDER,
  STATE_LABEL, STATE_COLOR, TERMS_LABEL,
  type OfferingKind, type ProviderKey,
  type ShowcaseOffering, type ShowcaseProvider,
} from '@/data/showcase/types';
import {
  SHOWCASE_PROVIDERS, SHOWCASE_OFFERINGS, SHOWCASE_KIND_COUNTS,
} from '@/data/showcase/offerings';

const ACCENT = '#a78bfa';

/** Иконка вида. Служебная разметка, к содержанию позиции отношения не имеет. */
const KIND_ICON: Record<OfferingKind, typeof Handshake> = {
  service: Handshake,
  consulting: Lightbulb,
  audit: ShieldCheck,
  rnd: FlaskConical,
  development: Code2,
  platform: Layers,
  solution: Puzzle,
  product: Package,
  research: Microscope,
  membership: Users,
};

type GroupMode = 'kind' | 'provider';

// ── Карточка поставщика ──────────────────────────────────────────────

function ProviderCard({ provider, count }: { provider: ShowcaseProvider; count: number }) {
  return (
    <div
      className="rounded-xl border p-4 sm:p-5 flex flex-col"
      style={{
        borderColor: `${provider.color}33`,
        background: `linear-gradient(160deg, ${provider.color}0d, rgba(2,10,26,0.55) 70%)`,
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${provider.color}1a`, color: provider.color }}
        >
          <Building2 size={17} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-bold text-slate-100 leading-snug">{provider.title}</h3>
          <div className="text-[11px] mt-0.5" style={{ color: `${provider.color}cc` }}>
            позиций в витрине: {count}
          </div>
        </div>
      </div>

      <p className="text-[13px] text-slate-400 leading-relaxed mt-3">{provider.what}</p>

      {/* Оговорка контура. Показывается всегда и целиком: сворачивать
          её в тултип означало бы спрятать ограничение. */}
      {provider.note && (
        <div
          className="mt-3 rounded-lg px-3 py-2.5 text-[12px] leading-relaxed text-amber-200/85 flex gap-2"
          style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.22)' }}
        >
          <ScrollText size={13} className="shrink-0 mt-0.5 text-amber-400/80" />
          <span>{provider.note}</span>
        </div>
      )}

      <div className="mt-3 pt-3 border-t flex items-center gap-3 flex-wrap"
        style={{ borderColor: 'rgba(148,163,184,0.12)' }}>
        <span className="text-[11px] text-slate-500 leading-relaxed flex-1 min-w-0">
          Основание: {provider.source}
        </span>
        {provider.site && (
          <a
            href={provider.site}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold shrink-0"
            style={{ color: provider.color }}
          >
            Сайт <ExternalLink size={11} />
          </a>
        )}
      </div>
    </div>
  );
}

// ── Карточка позиции ─────────────────────────────────────────────────

function OfferingCard({
  item, provider,
}: { item: ShowcaseOffering; provider?: ShowcaseProvider }) {
  const [open, setOpen] = useState(false);
  const KindIcon = KIND_ICON[item.kind];
  const stateColor = STATE_COLOR[item.state];
  const pColor = provider?.color ?? '#94a3b8';

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
              className="text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1.5"
              style={{ color: ACCENT, border: `1px solid ${ACCENT}55` }}
            >
              <KindIcon size={10} />
              {KIND_LABEL_ONE[item.kind]}
            </span>

            {/* Дополнительные виды: позиция может быть сразу услугой и аудитом. */}
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

            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1.5"
              style={{ color: pColor, background: `${pColor}14` }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: pColor }} />
              {provider?.title ?? item.provider}
            </span>
          </div>

          <h4 className="text-[15px] sm:text-base font-semibold text-slate-100 leading-snug">
            {item.label}
          </h4>
          <p className="text-[13px] text-slate-400 mt-1 leading-relaxed">{item.body}</p>
        </div>

        <ChevronDown
          size={18}
          className="text-slate-500 shrink-0 mt-1 transition-transform"
          style={{ transform: open ? 'rotate(180deg)' : 'none' }}
        />
      </button>

      {open && (
        <div className="px-4 sm:px-5 pb-5 -mt-1">
          <div className="border-t pt-4 space-y-4" style={{ borderColor: 'rgba(148,163,184,0.14)' }}>
            {/* Что входит */}
            {item.includes.length > 0 && (
              <div>
                <div className="text-[10.5px] uppercase tracking-wider text-slate-500 mb-2">
                  {item.includesLabel ?? 'Что входит'}
                </div>
                <ul className="space-y-1.5">
                  {item.includes.map((line, i) => (
                    <li key={i} className="text-[13px] text-slate-300 leading-relaxed pl-4 relative">
                      <span className="absolute left-0 top-[3px]" style={{ color: `${ACCENT}aa` }}>·</span>
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Артефакт */}
            <div
              className="rounded-lg px-3.5 py-3"
              style={{ background: `${ACCENT}0f`, border: `1px solid ${ACCENT}2e` }}
            >
              <div className="text-[10.5px] uppercase tracking-wider mb-1.5" style={{ color: `${ACCENT}cc` }}>
                {item.artifactLabel ?? 'Что на выходе'}
              </div>
              <p className="text-[13px] text-slate-200 leading-relaxed">{item.artifact}</p>
            </div>

            {/* Границы ответственности */}
            {item.limits && item.limits.length > 0 && (
              <div
                className="rounded-lg px-3.5 py-3"
                style={{ background: 'rgba(148,163,184,0.06)', border: '1px solid rgba(148,163,184,0.16)' }}
              >
                <div className="text-[10.5px] uppercase tracking-wider text-slate-400 mb-2 inline-flex items-center gap-1.5">
                  <Ban size={11} className="text-slate-500" />
                  Чего в этой позиции нет
                </div>
                <ul className="space-y-1.5">
                  {item.limits.map((line, i) => (
                    <li key={i} className="text-[12.5px] text-slate-400 leading-relaxed pl-4 relative">
                      <span className="absolute left-0 top-[2px] text-slate-600">—</span>
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Служебные строки: кому, на каких условиях, уточнение к состоянию */}
            <div className="space-y-1.5">
              {item.audience && (
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-[12.5px] py-1.5 border-b"
                  style={{ borderColor: 'rgba(148,163,184,0.08)' }}>
                  <span className="text-slate-500 min-w-[130px] inline-flex items-center gap-1.5">
                    <Target size={11} /> Кому адресовано
                  </span>
                  <span className="text-slate-300 flex-1">{item.audience}</span>
                </div>
              )}
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-[12.5px] py-1.5 border-b"
                style={{ borderColor: 'rgba(148,163,184,0.08)' }}>
                <span className="text-slate-500 min-w-[130px] inline-flex items-center gap-1.5">
                  <FileText size={11} /> Условия
                </span>
                <span className="text-slate-300 flex-1 font-medium">{TERMS_LABEL[item.terms]}</span>
              </div>
              {item.stateNote && (
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-[12.5px] py-1.5 border-b"
                  style={{ borderColor: 'rgba(148,163,184,0.08)' }}>
                  <span className="text-slate-500 min-w-[130px]">Уточнение</span>
                  <span className="flex-1" style={{ color: stateColor }}>{item.stateNote}</span>
                </div>
              )}
            </div>

            {/* Теги */}
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10.5px] px-2 py-1 rounded text-slate-400"
                    style={{ background: 'rgba(148,163,184,0.08)' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Переходы внутрь платформы */}
            {item.links && item.links.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {item.links.map((l) => (
                  <Link
                    key={l.path}
                    href={l.path}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-colors"
                    style={{ color: ACCENT, borderColor: `${ACCENT}44`, background: `${ACCENT}0d` }}
                  >
                    {l.label}
                    <ArrowRight size={12} />
                  </Link>
                ))}
              </div>
            )}

            {/* Основание. Мелко, но всегда на виду. */}
            <div className="pt-1 text-[11px] text-slate-500 leading-relaxed">
              Основание: {item.source}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Страница ─────────────────────────────────────────────────────────

export default function ShowcasePage() {
  const [kinds, setKinds] = useState<Set<OfferingKind>>(new Set());
  const [providers, setProviders] = useState<Set<ProviderKey>>(new Set());
  const [query, setQuery] = useState('');
  const [groupBy, setGroupBy] = useState<GroupMode>('kind');

  const providerByKey = useMemo(() => {
    const m = new Map<ProviderKey, ShowcaseProvider>();
    SHOWCASE_PROVIDERS.forEach((p) => m.set(p.key, p));
    return m;
  }, []);

  /** Счётчики шапки — считаются из данных, не проставляются вручную. */
  const totalCount = SHOWCASE_OFFERINGS.length;
  const activeCount = useMemo(
    () => SHOWCASE_OFFERINGS.filter((o) => o.state === 'active').length,
    [],
  );
  const providerCount = SHOWCASE_PROVIDERS.length;

  const countByProvider = useMemo(() => {
    const m = new Map<ProviderKey, number>();
    SHOWCASE_OFFERINGS.forEach((o) => m.set(o.provider, (m.get(o.provider) ?? 0) + 1));
    return m;
  }, []);

  const toggleKind = (k: OfferingKind) =>
    setKinds((prev) => {
      const next = new Set(prev);
      next.has(k) ? next.delete(k) : next.add(k);
      return next;
    });

  const toggleProvider = (p: ProviderKey) =>
    setProviders((prev) => {
      const next = new Set(prev);
      next.has(p) ? next.delete(p) : next.add(p);
      return next;
    });

  const resetAll = () => {
    setKinds(new Set());
    setProviders(new Set());
    setQuery('');
  };

  const filtersOn = kinds.size > 0 || providers.size > 0 || query.trim().length > 0;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SHOWCASE_OFFERINGS.filter((o) => {
      // Вид: позиция подходит и по основному виду, и по дополнительным.
      const matchKind =
        kinds.size === 0 ||
        kinds.has(o.kind) ||
        (o.alsoKinds ?? []).some((k) => kinds.has(k));
      const matchProvider = providers.size === 0 || providers.has(o.provider);
      const haystack = [o.label, o.body, ...(o.tags ?? [])].join(' ').toLowerCase();
      const matchQuery = !q || haystack.includes(q);
      return matchKind && matchProvider && matchQuery;
    });
  }, [kinds, providers, query]);

  /**
   * Секции. Позиция попадает ровно в одну секцию — по основному виду
   * (или по поставщику). Дополнительные виды показаны бейджами на
   * карточке, чтобы одна и та же работа не считалась дважды.
   */
  const sections = useMemo(() => {
    if (groupBy === 'provider') {
      return SHOWCASE_PROVIDERS
        .map((p) => ({
          id: p.key as string,
          title: p.title,
          color: p.color,
          items: filtered.filter((o) => o.provider === p.key),
        }))
        .filter((s) => s.items.length > 0);
    }
    return KIND_ORDER
      .map((k) => ({
        id: k as string,
        title: KIND_LABEL[k],
        color: ACCENT,
        items: filtered.filter((o) => o.kind === k),
      }))
      .filter((s) => s.items.length > 0);
  }, [filtered, groupBy]);

  return (
    <div className="min-h-screen text-slate-200 pt-14">
      {/* ── Шапка ── */}
      <div
        className="relative overflow-hidden border-b"
        style={{
          borderColor: `${ACCENT}22`,
          background: 'linear-gradient(160deg, rgba(167,139,250,0.10), rgba(2,8,23,0) 60%)',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="flex items-center gap-2 mb-4">
            <Store size={18} style={{ color: ACCENT }} />
            <span className="text-[11px] font-bold tracking-[0.18em] uppercase" style={{ color: ACCENT }}>
              Витрина контура
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold text-white leading-tight max-w-3xl">
            Что контур делает и на каких условиях берётся за работу
          </h1>
          <p className="text-[14px] sm:text-base text-slate-400 mt-4 max-w-2xl leading-relaxed">
            Услуги, консалтинг, аудит, R&amp;D, разработка, платформы, решения, продукты,
            исследования и уровни участия — четырёх организаций контура в одном списке.
            У каждой позиции указано её действительное состояние и документ-основание.
            Ставки не публикуются: ни одна из них не утверждена, и подставлять правдоподобное
            число вместо неутверждённого мы не будем.
          </p>

          <div className="flex flex-wrap gap-6 mt-8">
            {[
              { v: String(totalCount), l: 'позиций в витрине' },
              { v: String(activeCount), l: 'из них действуют' },
              { v: String(providerCount), l: 'поставщика контура' },
            ].map((s) => (
              <div key={s.l}>
                <div className="text-2xl sm:text-3xl font-bold" style={{ color: ACCENT }}>{s.v}</div>
                <div className="text-[11px] text-slate-500 uppercase tracking-wide mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 mt-8">
            <Link
              href="/contacts"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-semibold text-slate-900"
              style={{ background: ACCENT }}
            >
              <MessageSquare size={15} /> Обсудить задачу
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

      {/* ── Поставщики ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10">
        <div className="flex items-center gap-2 mb-4">
          <Building2 size={15} className="text-slate-500" />
          <h2 className="text-[13px] font-bold uppercase tracking-[0.14em] text-slate-400">
            Кто исполняет
          </h2>
        </div>
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
          {SHOWCASE_PROVIDERS.map((p) => (
            <ProviderCard
              key={p.key}
              provider={p}
              count={countByProvider.get(p.key) ?? 0}
            />
          ))}
        </div>
      </div>

      {/* ── Фильтры ── */}
      <div
        className="sticky top-14 z-20 border-y backdrop-blur mt-8 sm:mt-10"
        style={{ borderColor: 'rgba(148,163,184,0.14)', background: 'rgba(2,8,23,0.9)' }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 space-y-3">
          {/* Строка поиска + переключатель группировки + сброс */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск по названию, описанию и меткам…"
                className="w-full h-9 pl-9 pr-8 rounded-xl bg-white/5 border border-white/10 text-[13px] text-white placeholder-white/25 outline-none focus:border-violet-400/40 transition"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition"
                  title="Очистить поиск"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1 p-0.5 rounded-xl shrink-0"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(148,163,184,0.14)' }}>
              {([
                ['kind', 'По видам'],
                ['provider', 'По поставщикам'],
              ] as const).map(([mode, label]) => (
                <button
                  key={mode}
                  onClick={() => setGroupBy(mode)}
                  className="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors"
                  style={
                    groupBy === mode
                      ? { background: `${ACCENT}1f`, color: ACCENT }
                      : { color: '#94a3b8' }
                  }
                >
                  {label}
                </button>
              ))}
            </div>

            <button
              onClick={resetAll}
              disabled={!filtersOn}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold border shrink-0 transition-colors"
              style={{
                color: filtersOn ? '#e2e8f0' : '#64748b',
                borderColor: 'rgba(148,163,184,0.2)',
                opacity: filtersOn ? 1 : 0.45,
                cursor: filtersOn ? 'pointer' : 'default',
              }}
            >
              <RotateCcw size={12} /> Сбросить
            </button>
          </div>

          {/* Чипы по виду. Пустой вид не кликается — счётчик показывает ноль
              честно, а не прячет строку. */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] text-white/30 uppercase font-medium tracking-wider shrink-0">
              Вид:
            </span>
            {KIND_ORDER.map((k) => {
              const count = SHOWCASE_KIND_COUNTS[k] ?? 0;
              const empty = count === 0;
              const on = kinds.has(k);
              const Icon = KIND_ICON[k];
              return (
                <button
                  key={k}
                  onClick={() => !empty && toggleKind(k)}
                  disabled={empty}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11.5px] font-semibold border transition-colors"
                  style={{
                    color: on ? ACCENT : '#94a3b8',
                    borderColor: on ? `${ACCENT}55` : 'rgba(148,163,184,0.16)',
                    background: on ? `${ACCENT}14` : 'rgba(255,255,255,0.03)',
                    opacity: empty ? 0.45 : 1,
                    cursor: empty ? 'default' : 'pointer',
                  }}
                >
                  <Icon size={12} /> {KIND_LABEL[k]}
                  <span className="text-[10px] opacity-60">{count}</span>
                </button>
              );
            })}
          </div>

          {/* Чипы по поставщику */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] text-white/30 uppercase font-medium tracking-wider shrink-0">
              Поставщик:
            </span>
            {SHOWCASE_PROVIDERS.map((p) => {
              const on = providers.has(p.key);
              const count = countByProvider.get(p.key) ?? 0;
              return (
                <button
                  key={p.key}
                  onClick={() => toggleProvider(p.key)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11.5px] font-semibold border transition-colors"
                  style={{
                    color: on ? p.color : '#94a3b8',
                    borderColor: on ? `${p.color}66` : 'rgba(148,163,184,0.16)',
                    background: on ? `${p.color}18` : 'rgba(255,255,255,0.03)',
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.color }} />
                  {p.title}
                  <span className="text-[10px] opacity-60">{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Список ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10 pb-24 sm:pb-12">
        <div className="text-[12px] text-slate-500 mb-5">
          {filtersOn
            ? `Показано ${filtered.length} из ${totalCount}`
            : `Всего позиций: ${totalCount}`}
        </div>

        {sections.length === 0 && (
          <div className="text-center py-16">
            <Search className="w-10 h-10 text-white/10 mx-auto mb-3" />
            <p className="text-sm text-white/30">
              По этому набору фильтров позиций нет.
            </p>
            <button
              onClick={resetAll}
              className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12.5px] font-semibold"
              style={{ background: `${ACCENT}1a`, color: ACCENT }}
            >
              <RotateCcw size={13} /> Сбросить фильтры
            </button>
          </div>
        )}

        <div className="space-y-8 sm:space-y-10">
          {sections.map((section) => (
            <section key={section.id}>
              <div className="flex items-baseline gap-3 mb-3.5">
                <h2 className="text-lg sm:text-xl font-bold text-slate-100">{section.title}</h2>
                <span
                  className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                  style={{ color: section.color, background: `${section.color}14` }}
                >
                  {section.items.length}
                </span>
              </div>
              <div className="grid gap-3">
                {section.items.map((item) => (
                  <OfferingCard
                    key={item.id}
                    item={item}
                    provider={providerByKey.get(item.provider)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Пояснение к тому, чего на витрине нет. Ставится в конце, чтобы
            читатель не искал цену там, где её сознательно не публикуют. */}
        <div
          className="rounded-xl border p-5 mt-10 flex gap-3.5"
          style={{ borderColor: `${ACCENT}33`, background: `${ACCENT}0a` }}
        >
          <ScrollText size={18} className="shrink-0 mt-0.5" style={{ color: ACCENT }} />
          <div>
            <div className="text-[13.5px] font-semibold mb-1.5" style={{ color: ACCENT }}>
              О том, чего на этой странице нет
            </div>
            <p className="text-[13px] text-slate-400 leading-relaxed">
              Здесь нет цен, сроков «от N дней», рейтингов и кнопки покупки. Ни одна ставка
              контура публично не утверждена, поэтому в каждой позиции стоит условие расчёта,
              а не число. Состояние позиции показано как есть: объявленное названо объявленным,
              разрабатываемое — разрабатываемым. Под каждой позицией указан документ, из которого
              она взята; позиция без основания в витрину не вносится.
            </p>
            <Link
              href="/contacts"
              className="mt-3.5 inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-[12.5px] font-semibold text-slate-900"
              style={{ background: ACCENT }}
            >
              Обсудить задачу <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
