// src/pages/NewsFeedPage.tsx
import { useMemo, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  Radio, Search, ArrowRight, Sparkles, ChevronRight, AlertTriangle,
} from 'lucide-react';
import {
  useSupabaseNews,
  CATEGORY_META,
  DOMAIN_COLORS,
  type NewsItem,
} from '@/hooks/useSupabaseNews';

// ── Filter definitions ────────────────────────────────────────
const DOMAIN_FILTERS: { key: string; label: string }[] = [
  { key: 'all',         label: 'Все' },
  { key: 'water',       label: 'Вода' },
  { key: 'energy',      label: 'Энергетика' },
  { key: 'minerals',    label: 'Минералы' },
  { key: 'nature',      label: 'Природа' },
  { key: 'agriculture', label: 'Агро' },
  { key: 'climate',     label: 'Климат' },
  { key: 'cross',       label: 'Межотраслевое' },
];

const CATEGORY_ORDER = ['launch', 'partnership', 'milestone', 'research', 'alert', 'update'];

const ENTITY_LABELS: Record<string, string> = {
  object:   'объект',
  project:  'проект',
  subject:  'субъект',
  complex:  'комплекс',
  resource: 'ресурс',
};

// ── Relative time helper (Russian) ────────────────────────────
function relativeTimeRu(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diffMs = Date.now() - then;
  const day = 86_400_000;
  const days = Math.floor(diffMs / day);

  if (days <= 0) return 'сегодня';
  if (days === 1) return 'вчера';
  if (days < 7) return `${days} ${pluralRu(days, 'день', 'дня', 'дней')} назад`;

  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} ${pluralRu(weeks, 'неделю', 'недели', 'недель')} назад`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} ${pluralRu(months, 'месяц', 'месяца', 'месяцев')} назад`;

  const years = Math.floor(days / 365);
  return `${years} ${pluralRu(years, 'год', 'года', 'лет')} назад`;
}

function pluralRu(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

// ── Importance dots ───────────────────────────────────────────
function ImportanceDots({ value, color }: { value: number; color: string }) {
  const n = Math.max(1, Math.min(5, value || 1));
  return (
    <div className="flex items-center gap-1" title={`Важность: ${n} из 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className="rounded-full"
          style={{
            width: 6,
            height: 6,
            background: i <= n ? color : 'rgba(255,255,255,0.12)',
          }}
        />
      ))}
    </div>
  );
}

// ── News card ─────────────────────────────────────────────────
function NewsCard({
  item,
  index,
  onEntity,
}: {
  item: NewsItem;
  index: number;
  onEntity: (i: NewsItem) => void;
}) {
  const cat = CATEGORY_META[item.category] ?? { labelRu: item.category, color: '#00e6c8' };
  const domainColor = item.domain ? (DOMAIN_COLORS[item.domain] ?? '#00d4ff') : '#5b6b7a';
  const high = item.importance >= 4;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: Math.min(index, 8) * 0.04 }}
      className="relative rounded-2xl p-4 sm:p-5"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: high
          ? `1px solid ${cat.color}55`
          : '1px solid rgba(255,255,255,0.08)',
        boxShadow: high ? `0 0 28px -12px ${cat.color}` : 'none',
      }}
    >
      {/* header row */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span
          className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
          style={{ background: `${cat.color}18`, color: cat.color, border: `1px solid ${cat.color}33` }}
        >
          {cat.labelRu}
        </span>

        {item.domain && (
          <span className="flex items-center gap-1.5 text-[11px] text-white/40">
            <span
              className="rounded-full"
              style={{ width: 7, height: 7, background: domainColor }}
            />
            {domainLabel(item.domain)}
          </span>
        )}

        <span className="ml-auto text-[11px] text-white/30 whitespace-nowrap">
          {relativeTimeRu(item.published_at)}
        </span>
      </div>

      <h3 className="text-white font-bold text-base leading-snug mb-1.5">
        {item.title_ru}
      </h3>
      <p className="text-sm text-white/55 leading-relaxed mb-4">
        {item.summary_ru}
      </p>

      {/* footer row */}
      <div className="flex items-center justify-between gap-3">
        <ImportanceDots value={item.importance} color={cat.color} />

        {item.entity_slug && item.entity_type && (
          <button
            onClick={() => onEntity(item)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors"
            style={{
              background: `${domainColor}12`,
              border: `1px solid ${domainColor}30`,
              color: domainColor,
            }}
          >
            <ArrowRight size={11} />
            {ENTITY_LABELS[item.entity_type] ?? item.entity_type}
          </button>
        )}
      </div>
    </motion.article>
  );
}

function domainLabel(domain: string): string {
  const found = DOMAIN_FILTERS.find((d) => d.key === domain);
  return found ? found.label : domain;
}

// ── Skeleton ──────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div
      className="rounded-2xl p-5 animate-pulse"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="flex gap-2 mb-3">
        <div className="h-4 w-20 rounded-full bg-white/10" />
        <div className="h-4 w-16 rounded-full bg-white/5" />
      </div>
      <div className="h-4 w-3/4 rounded bg-white/10 mb-2" />
      <div className="h-3 w-full rounded bg-white/5 mb-1.5" />
      <div className="h-3 w-5/6 rounded bg-white/5" />
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────
export default function NewsFeedPage() {
  const [, setLocation] = useLocation();
  const { items, loading } = useSupabaseNews();

  const [domain, setDomain] = useState<string>('all');
  const [category, setCategory] = useState<string>('all');
  const [query, setQuery] = useState<string>('');

  const heroRef = useRef<HTMLDivElement>(null);
  const heroInView = useInView(heroRef, { once: true });

  const importantCount = useMemo(
    () => items.filter((i) => i.importance >= 4).length,
    [items],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
      .filter((i) => (domain === 'all' ? true : i.domain === domain))
      .filter((i) => (category === 'all' ? true : i.category === category))
      .filter((i) =>
        q === ''
          ? true
          : i.title_ru.toLowerCase().includes(q) ||
            i.summary_ru.toLowerCase().includes(q),
      )
      .sort(
        (a, b) =>
          new Date(b.published_at).getTime() - new Date(a.published_at).getTime(),
      );
  }, [items, domain, category, query]);

  const onEntity = (i: NewsItem) => {
    switch (i.entity_type) {
      case 'object':
      case 'project':
      case 'complex':
        setLocation('/map');
        break;
      case 'subject':
        setLocation('/hub');
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen" style={{ background: '#000818' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-5 pb-24">

        {/* ── HERO ─────────────────────────────────────────── */}
        <section ref={heroRef} className="pt-10 sm:pt-14 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <span
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-5"
              style={{
                background: 'rgba(0,230,200,0.1)',
                border: '1px solid rgba(0,230,200,0.28)',
                color: '#00e6c8',
              }}
            >
              <Radio size={13} />
              Живая лента ОС
            </span>

            <h1 className="text-white font-black text-3xl sm:text-4xl leading-tight mb-3">
              Новости экосистемы
            </h1>
            <p className="text-white/50 text-base leading-relaxed max-w-2xl mb-6">
              События по всем элементам — объектам, субъектам, ресурсам и проектам.
            </p>

            <div className="flex items-center gap-3 flex-wrap">
              <div
                className="flex items-baseline gap-2 px-4 py-2.5 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <span className="text-2xl font-black" style={{ color: '#00e6c8' }}>
                  {items.length}
                </span>
                <span className="text-xs text-white/40">
                  {pluralRu(items.length, 'событие', 'события', 'событий')}
                </span>
              </div>
              <div
                className="flex items-baseline gap-2 px-4 py-2.5 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <span className="text-2xl font-black" style={{ color: '#00d4ff' }}>
                  {importantCount}
                </span>
                <span className="text-xs text-white/40">важных</span>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ── ФИЛЬТРЫ ──────────────────────────────────────── */}
        <section className="mb-8 space-y-4">
          {/* search */}
          <div
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <Search size={16} className="text-white/30 shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск по заголовку и описанию…"
              className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-white/25"
            />
          </div>

          {/* domain chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 flex-nowrap">
            {DOMAIN_FILTERS.map((d) => {
              const active = domain === d.key;
              const c = d.key === 'all' ? '#00e6c8' : (DOMAIN_COLORS[d.key] ?? '#00d4ff');
              return (
                <button
                  key={d.key}
                  onClick={() => setDomain(d.key)}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                  style={
                    active
                      ? { background: `${c}18`, color: c, border: `1px solid ${c}33` }
                      : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }
                  }
                >
                  {d.key !== 'all' && (
                    <span className="rounded-full" style={{ width: 7, height: 7, background: c }} />
                  )}
                  {d.label}
                </button>
              );
            })}
          </div>

          {/* category chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 flex-nowrap">
            <button
              onClick={() => setCategory('all')}
              className="shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
              style={
                category === 'all'
                  ? { background: 'rgba(0,230,200,0.14)', color: '#00e6c8', border: '1px solid rgba(0,230,200,0.3)' }
                  : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }
              }
            >
              Все категории
            </button>
            {CATEGORY_ORDER.map((key) => {
              const meta = CATEGORY_META[key];
              const active = category === key;
              return (
                <button
                  key={key}
                  onClick={() => setCategory(key)}
                  className="shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                  style={
                    active
                      ? { background: `${meta.color}18`, color: meta.color, border: `1px solid ${meta.color}33` }
                      : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }
                  }
                >
                  {meta.labelRu}
                </button>
              );
            })}
          </div>
        </section>

        {/* ── ЛЕНТА ────────────────────────────────────────── */}
        <section>
          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2, 3].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="rounded-2xl p-8 text-center"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <AlertTriangle size={22} className="mx-auto mb-3 text-white/30" />
              <p className="text-white/50 text-sm">
                По выбранным фильтрам событий не найдено.
              </p>
              <button
                onClick={() => {
                  setDomain('all');
                  setCategory('all');
                  setQuery('');
                }}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                style={{ background: 'rgba(0,230,200,0.14)', color: '#00e6c8', border: '1px solid rgba(0,230,200,0.3)' }}
              >
                Сбросить фильтры
              </button>
            </div>
          ) : (
            <div className="relative pl-4 sm:pl-5">
              {/* timeline spine */}
              <div
                className="absolute left-0 top-1 bottom-1 w-px"
                style={{ background: 'linear-gradient(to bottom, rgba(0,230,200,0.35), rgba(255,255,255,0.05))' }}
              />
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {filtered.map((item, i) => (
                    <div key={item.id} className="relative">
                      {/* timeline node */}
                      <span
                        className="absolute rounded-full"
                        style={{
                          left: -18,
                          top: 22,
                          width: 9,
                          height: 9,
                          background: (CATEGORY_META[item.category]?.color) ?? '#00e6c8',
                          boxShadow: `0 0 10px -1px ${(CATEGORY_META[item.category]?.color) ?? '#00e6c8'}`,
                        }}
                      />
                      <NewsCard item={item} index={i} onEntity={onEntity} />
                    </div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </section>

        {/* ── ФИНАЛЬНЫЙ CTA ────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-14 rounded-2xl p-6 sm:p-8 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(0,230,200,0.08), rgba(0,212,255,0.05))',
            border: '1px solid rgba(0,230,200,0.22)',
          }}
        >
          <Sparkles size={22} className="mx-auto mb-3" style={{ color: '#00e6c8' }} />
          <h2 className="text-white font-bold text-xl mb-2">
            Хотите увидеть все обновления платформы?
          </h2>
          <p className="text-white/50 text-sm mb-5 max-w-md mx-auto">
            Новые модули, прототипы интерфейсов и релизы — в едином разделе обновлений.
          </p>
          <button
            onClick={() => setLocation('/updates')}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-colors"
            style={{ background: 'rgba(0,230,200,0.16)', color: '#00e6c8', border: '1px solid rgba(0,230,200,0.35)' }}
          >
            Перейти к обновлениям
            <ChevronRight size={16} />
          </button>
        </motion.section>
      </div>
    </div>
  );
}
