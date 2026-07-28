import { memo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, CalendarClock, Globe2, ShieldCheck, Wallet } from 'lucide-react';
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  KIND_LABELS,
  SCOPE_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
  daysLeft,
  effectiveStatus,
  formatFunding,
  type Opportunity,
} from '@/data/opportunities/types';

const RU_DATE = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });

function fmtDate(iso: string | null): string | null {
  if (!iso) return null;
  return RU_DATE.format(new Date(`${iso}T12:00:00Z`));
}

/** Человеческая формулировка срочности вместо голого числа. */
function urgencyLabel(left: number | null): { text: string; color: string } | null {
  if (left === null) return null;
  if (left < 0) return { text: 'приём завершён', color: '#64748b' };
  if (left === 0) return { text: 'последний день', color: '#f87171' };
  if (left <= 7) return { text: `${left} дн. до дедлайна`, color: '#f87171' };
  if (left <= 30) return { text: `${left} дн. до дедлайна`, color: '#f59e0b' };
  return { text: `${left} дн. до дедлайна`, color: '#34d399' };
}

export interface OpportunityCardProps {
  opportunity: Opportunity;
  /** Индекс в списке — для каскадной анимации появления. */
  index?: number;
  onOpen?: (id: string) => void;
}

function OpportunityCardBase({ opportunity: o, index = 0, onOpen }: OpportunityCardProps) {
  const reduce = useReducedMotion();
  const status = effectiveStatus(o);
  const statusColor = STATUS_COLORS[status];
  const left = daysLeft(o);
  const urgency = status === 'open' ? urgencyLabel(left) : null;
  const funding = formatFunding(o.funding);
  const accent = CATEGORY_COLORS[o.categories[0]] ?? '#00d4ff';
  const deadline = fmtDate(o.deadline);

  return (
    <motion.article
      layout
      initial={reduce ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? undefined : { opacity: 0, y: -8 }}
      transition={{
        type: 'spring',
        stiffness: 320,
        damping: 32,
        delay: reduce ? 0 : Math.min(index, 12) * 0.035,
      }}
      whileHover={reduce ? undefined : { y: -4 }}
      className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-3xl p-5 text-left transition-colors duration-200"
      style={{
        background: 'rgba(6,15,28,0.6)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 14px 44px rgba(0,0,0,0.45)',
        backdropFilter: 'blur(22px)',
      }}
      onClick={() => onOpen?.(o.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen?.(o.id);
        }
      }}
      aria-label={`${KIND_LABELS[o.kind]}: ${o.name}`}
    >
      {/* тонкая акцентная кромка сверху — цвет = первая категория */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-px opacity-70"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
      />

      {/* строка статуса */}
      <header className="mb-3 flex flex-wrap items-center gap-2">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em]"
          style={{ color: statusColor, background: `${statusColor}18`, border: `1px solid ${statusColor}44` }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: statusColor, boxShadow: `0 0 6px ${statusColor}` }} />
          {STATUS_LABELS[status]}
        </span>
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-white/55">
          {KIND_LABELS[o.kind]}
        </span>
        {urgency && (
          <span className="ml-auto text-[11px] font-bold" style={{ color: urgency.color }}>
            {urgency.text}
          </span>
        )}
      </header>

      <h3 className="mb-1 text-[17px] font-black leading-snug text-white">{o.name}</h3>
      <p className="mb-3 text-[12px] font-medium text-white/45">{o.organizer}</p>

      <p className="mb-4 line-clamp-3 text-[13px] leading-relaxed text-white/60">{o.description}</p>

      {/* факты — только подтверждённые; отсутствующие строки не рисуем */}
      <dl className="mt-auto grid gap-2 text-[12px]">
        {funding && (
          <div className="flex items-center gap-2">
            <Wallet size={14} className="shrink-0 text-white/30" />
            <dt className="sr-only">Финансирование</dt>
            <dd className="font-bold text-white/85">{funding}</dd>
            {o.funding?.covers && <span className="truncate text-white/35">· {o.funding.covers}</span>}
          </div>
        )}
        {deadline && (
          <div className="flex items-center gap-2">
            <CalendarClock size={14} className="shrink-0 text-white/30" />
            <dt className="sr-only">Дедлайн</dt>
            <dd className="text-white/65">Дедлайн: {deadline}</dd>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Globe2 size={14} className="shrink-0 text-white/30" />
          <dt className="sr-only">География</dt>
          <dd className="truncate text-white/50">{o.scope.map((s) => SCOPE_LABELS[s]).join(' · ')}</dd>
        </div>
        {o.centralAsiaEligible === true && (
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="shrink-0" style={{ color: '#34d399' }} />
            <dd className="font-semibold" style={{ color: '#34d399' }}>
              Заявители из Центральной Азии допущены
            </dd>
          </div>
        )}
      </dl>

      {/* категории */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {o.categories.slice(0, 4).map((c) => (
          <span
            key={c}
            className="rounded-lg px-2 py-0.5 text-[10px] font-semibold"
            style={{
              color: CATEGORY_COLORS[c],
              background: `${CATEGORY_COLORS[c]}14`,
              border: `1px solid ${CATEGORY_COLORS[c]}30`,
            }}
          >
            {CATEGORY_LABELS[c]}
          </span>
        ))}
      </div>

      {/* подпись о верификации — доказательство, что данные настоящие */}
      <footer className="mt-4 flex items-center justify-between border-t border-white/8 pt-3">
        <span className="text-[10px] font-medium text-white/30">
          Сверено {fmtDate(o.verifiedAt)}
        </span>
        <a
          href={o.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold transition-colors duration-200 hover:bg-white/10"
          style={{ color: accent }}
        >
          Первоисточник
          <ArrowUpRight size={13} />
        </a>
      </footer>
    </motion.article>
  );
}

export const OpportunityCard = memo(OpportunityCardBase);
export default OpportunityCard;
