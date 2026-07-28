import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  KIND_PLURAL,
  SCOPE_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
  type GeoScope,
  type OpportunityCategory,
  type OpportunityKind,
  type OpportunityStatus,
} from '@/data/opportunities/types';
import type { Facets, OpportunityFilter } from '@/data/opportunities/registry';

/** Универсальный чип-переключатель с счётчиком и цветовым акцентом. */
function Chip({
  label,
  count,
  active,
  color,
  onClick,
}: {
  label: string;
  count?: number;
  active: boolean;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0"
      style={{
        color: active ? '#02121c' : 'rgba(255,255,255,0.62)',
        background: active ? color : 'rgba(255,255,255,0.05)',
        border: `1px solid ${active ? color : 'rgba(255,255,255,0.10)'}`,
        boxShadow: active ? `0 0 18px ${color}55` : 'none',
      }}
    >
      {label}
      {count !== undefined && (
        <span
          className="rounded-full px-1.5 text-[10px] font-bold tabular-nums"
          style={{
            background: active ? 'rgba(2,18,28,0.18)' : 'rgba(255,255,255,0.08)',
            color: active ? '#02121c' : 'rgba(255,255,255,0.45)',
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">{title}</div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

export interface OpportunityFiltersProps {
  value: OpportunityFilter;
  onChange: (next: OpportunityFilter) => void;
  facets: Facets;
  /** Сколько записей осталось после фильтрации — для строки «Показано N». */
  resultCount: number;
  totalCount: number;
}

const KIND_ORDER: OpportunityKind[] = ['grant', 'contest', 'hackathon', 'prize', 'accelerator', 'fellowship'];
const STATUS_ORDER: OpportunityStatus[] = ['open', 'upcoming', 'rolling', 'annual', 'closed'];
const SCOPE_ORDER: GeoScope[] = ['uz', 'kz', 'kg', 'tj', 'tm', 'central-asia', 'eu', 'asia', 'global'];
const CATEGORY_ORDER: OpportunityCategory[] = [
  'water', 'ecology', 'climate', 'engineering', 'energy', 'rnd', 'digital', 'web3', 'depin', 'refi', 'startup', 'education',
];

export default function OpportunityFilters({
  value,
  onChange,
  facets,
  resultCount,
  totalCount,
}: OpportunityFiltersProps) {
  /** Переключает элемент в массиве-фильтре. */
  function toggle<T>(key: keyof OpportunityFilter, item: T) {
    const cur = (value[key] as T[] | undefined) ?? [];
    const next = cur.includes(item) ? cur.filter((x) => x !== item) : [...cur, item];
    onChange({ ...value, [key]: next.length ? next : undefined });
  }

  const hasAny =
    !!value.kinds?.length ||
    !!value.categories?.length ||
    !!value.scopes?.length ||
    !!value.statuses?.length ||
    !!value.centralAsiaOnly ||
    !!value.query?.trim();

  return (
    <div
      className="rounded-3xl p-5"
      style={{
        background: 'rgba(6,15,28,0.55)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(22px)',
      }}
    >
      {/* поиск */}
      <label className="relative mb-5 block">
        <span className="sr-only">Поиск по названию, организатору или тегу</span>
        <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="search"
          value={value.query ?? ''}
          onChange={(e) => onChange({ ...value, query: e.target.value || undefined })}
          placeholder="Поиск: название, организатор, тег…"
          className="w-full rounded-2xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-[14px] text-white placeholder:text-white/25 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/25"
        />
      </label>

      <Group title="Тип">
        {KIND_ORDER.filter((k) => facets.kinds[k]).map((k) => (
          <Chip
            key={k}
            label={KIND_PLURAL[k]}
            count={facets.kinds[k]}
            active={!!value.kinds?.includes(k)}
            color="#00d4ff"
            onClick={() => toggle('kinds', k)}
          />
        ))}
      </Group>

      <Group title="Статус">
        {STATUS_ORDER.filter((s) => facets.statuses[s]).map((s) => (
          <Chip
            key={s}
            label={STATUS_LABELS[s]}
            count={facets.statuses[s]}
            active={!!value.statuses?.includes(s)}
            color={STATUS_COLORS[s]}
            onClick={() => toggle('statuses', s)}
          />
        ))}
      </Group>

      <Group title="Направление">
        {CATEGORY_ORDER.filter((c) => facets.categories[c]).map((c) => (
          <Chip
            key={c}
            label={CATEGORY_LABELS[c]}
            count={facets.categories[c]}
            active={!!value.categories?.includes(c)}
            color={CATEGORY_COLORS[c]}
            onClick={() => toggle('categories', c)}
          />
        ))}
      </Group>

      <Group title="География">
        {SCOPE_ORDER.filter((s) => facets.scopes[s]).map((s) => (
          <Chip
            key={s}
            label={SCOPE_LABELS[s]}
            count={facets.scopes[s]}
            active={!!value.scopes?.includes(s)}
            color="#a3e635"
            onClick={() => toggle('scopes', s)}
          />
        ))}
      </Group>

      <Group title="Доступность">
        <Chip
          label="Доступно из Центральной Азии"
          active={!!value.centralAsiaOnly}
          color="#00e6c8"
          onClick={() => onChange({ ...value, centralAsiaOnly: value.centralAsiaOnly ? undefined : true })}
        />
      </Group>

      <div className="mt-5 flex items-center justify-between border-t border-white/8 pt-4">
        <motion.span key={resultCount} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} className="text-[12px] font-medium text-white/45">
          Показано <span className="font-bold text-white/80 tabular-nums">{resultCount}</span> из {totalCount}
        </motion.span>
        {hasAny && (
          <button
            type="button"
            onClick={() => onChange({})}
            className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-[12px] font-semibold text-white/45 transition-colors duration-200 hover:bg-white/8 hover:text-white/80"
          >
            <X size={13} />
            Сбросить
          </button>
        )}
      </div>
    </div>
  );
}
