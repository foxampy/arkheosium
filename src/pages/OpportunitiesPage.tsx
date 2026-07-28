import { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowDownWideNarrow, FileSearch, ShieldCheck, Sparkles } from 'lucide-react';
import OpportunityCard from '@/components/opportunities/OpportunityCard';
import OpportunityFilters from '@/components/opportunities/OpportunityFilters';
import {
  OPPORTUNITIES,
  buildFacets,
  buildSummary,
  filterOpportunities,
  sortOpportunities,
  type OpportunityFilter,
  type OpportunitySort,
} from '@/data/opportunities/registry';

const ACCENT = '#00e6c8';

const RU_DATE = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
const fmt = (iso: string | null) => (iso ? RU_DATE.format(new Date(`${iso}T12:00:00Z`)) : '—');

const SORT_LABELS: Record<OpportunitySort, string> = {
  urgency: 'По срочности',
  funding: 'По объёму финансирования',
  name: 'По названию',
};

function StatTile({ label, value, hint, color }: { label: string; value: string; hint?: string; color: string }) {
  return (
    <div
      className="rounded-2xl px-4 py-3.5"
      style={{ background: `${color}0f`, border: `1px solid ${color}2e` }}
    >
      <div className="text-[22px] font-black leading-none tabular-nums" style={{ color }}>
        {value}
      </div>
      <div className="mt-1.5 text-[11px] font-semibold text-white/55">{label}</div>
      {hint && <div className="mt-0.5 text-[10px] text-white/30">{hint}</div>}
    </div>
  );
}

export default function OpportunitiesPage() {
  const reduce = useReducedMotion();
  const [filter, setFilter] = useState<OpportunityFilter>({});
  const [sort, setSort] = useState<OpportunitySort>('urgency');

  const summary = useMemo(() => buildSummary(OPPORTUNITIES), []);
  const facets = useMemo(() => buildFacets(OPPORTUNITIES), []);
  const visible = useMemo(
    () => sortOpportunities(filterOpportunities(OPPORTUNITIES, filter), sort),
    [filter, sort],
  );

  const isEmptyRegistry = OPPORTUNITIES.length === 0;

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4 sm:py-8">
      {/* ── Шапка ── */}
      <motion.header
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 30 }}
        className="mb-6 overflow-hidden rounded-3xl px-6 py-7 sm:px-8"
        style={{
          background: 'linear-gradient(135deg, rgba(0,230,200,0.10) 0%, rgba(6,15,28,0.62) 45%)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 18px 60px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(24px)',
        }}
      >
        <span
          className="mb-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em]"
          style={{ color: ACCENT, background: `${ACCENT}16`, border: `1px solid ${ACCENT}38` }}
        >
          <Sparkles size={12} />
          Финансирование экосистемы
        </span>

        <h1 className="mb-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
          Конкурсы, гранты и хакатоны
        </h1>
        <p className="max-w-2xl text-[14px] leading-relaxed text-white/55">
          Действующие, открытые и предстоящие программы финансирования Центральной Азии и
          международных фондов: экология, вода, инженерия, R&amp;D, web3 и DePIN. Каждая запись
          сверена с официальным первоисточником — ссылка есть у каждой карточки.
        </p>

        {!isEmptyRegistry && (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile label="Программ в реестре" value={String(summary.total)} color={ACCENT} />
            <StatTile label="Приём открыт сейчас" value={String(summary.open)} color="#34d399" />
            <StatTile
              label="Доступно из ЦА"
              value={String(summary.centralAsia)}
              color="#00d4ff"
            />
            <StatTile
              label="Ближайший дедлайн"
              value={summary.nextDeadline ? fmt(summary.nextDeadline).replace(/ \d{4} г\.$/, '') : '—'}
              hint={summary.lastVerifiedAt ? `данные сверены ${fmt(summary.lastVerifiedAt)}` : undefined}
              color="#f59e0b"
            />
          </div>
        )}

        <div className="mt-5 flex items-start gap-2 rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
          <ShieldCheck size={16} className="mt-0.5 shrink-0" style={{ color: ACCENT }} />
          <p className="text-[12px] leading-relaxed text-white/45">
            <span className="font-bold text-white/70">Принцип реестра:</span> никаких примерных
            обозначений. Если сумма, дедлайн или условия участия не подтверждены официальным
            источником — поле остаётся пустым, а не заполняется догадкой.
          </p>
        </div>
      </motion.header>

      {isEmptyRegistry ? (
        <div
          className="flex flex-col items-center justify-center rounded-3xl px-6 py-16 text-center"
          style={{ background: 'rgba(6,15,28,0.55)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <FileSearch size={34} className="mb-4 text-white/25" />
          <h2 className="mb-2 text-lg font-bold text-white/80">Реестр наполняется</h2>
          <p className="max-w-md text-[13px] leading-relaxed text-white/45">
            Программы добавляются только после сверки с официальными страницами фондов.
            Непроверенные записи в витрину не попадают.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <OpportunityFilters
              value={filter}
              onChange={setFilter}
              facets={facets}
              resultCount={visible.length}
              totalCount={OPPORTUNITIES.length}
            />
          </aside>

          <section>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <ArrowDownWideNarrow size={15} className="text-white/30" />
              {(Object.keys(SORT_LABELS) as OpportunitySort[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSort(s)}
                  aria-pressed={sort === s}
                  className="cursor-pointer rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors duration-200"
                  style={{
                    color: sort === s ? '#02121c' : 'rgba(255,255,255,0.55)',
                    background: sort === s ? ACCENT : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${sort === s ? ACCENT : 'rgba(255,255,255,0.10)'}`,
                  }}
                >
                  {SORT_LABELS[s]}
                </button>
              ))}
            </div>

            {visible.length === 0 ? (
              <div
                className="rounded-3xl px-6 py-14 text-center"
                style={{ background: 'rgba(6,15,28,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <p className="text-[14px] font-semibold text-white/60">Под фильтры ничего не подошло</p>
                <button
                  type="button"
                  onClick={() => setFilter({})}
                  className="mt-3 cursor-pointer rounded-xl px-4 py-2 text-[13px] font-bold transition-colors duration-200"
                  style={{ background: `${ACCENT}1f`, border: `1px solid ${ACCENT}44`, color: ACCENT }}
                >
                  Сбросить фильтры
                </button>
              </div>
            ) : (
              <motion.div layout className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <AnimatePresence mode="popLayout">
                  {visible.map((o, i) => (
                    <OpportunityCard key={o.id} opportunity={o} index={i} />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
