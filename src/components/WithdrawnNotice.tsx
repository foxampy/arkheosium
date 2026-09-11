/**
 * WithdrawnNotice — общий макет страницы, с которой снято предложение.
 *
 * На платформе оказалось несколько разделов, публиковавших финансовые
 * величины без основания: цену токена, ставки доходности, объём эмиссии,
 * капитализацию, число держателей. Ни одно из этих чисел не выводилось
 * из документа корпуса — они стояли в коде константами, а часть вообще
 * генерировалась случайно при каждой загрузке страницы.
 *
 * Такие разделы не удаляются и не подменяются редиректом. Маршрут
 * сохраняется, а на его месте публикуется прямой отказ с перечислением
 * того, что именно было заявлено и почему снято. Удалить страницу значило
 * бы спрятать факт, что заявление публиковалось; оставить как было —
 * продолжать его делать.
 *
 * Компонент задаёт единую форму такого отказа, чтобы разные разделы не
 * объясняли одно и то же по-разному.
 */

import { Link } from 'wouter';
import { ShieldAlert, ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const WITHDRAWN_ACCENT = '#f87171';

/** Одно снятое утверждение и причина снятия. Причина обязательна. */
export interface WithdrawnRow {
  claim: string;
  why: string;
}

/** Ссылка на то, что на платформе действительно существует. */
export interface WithdrawnLink {
  icon: LucideIcon;
  title: string;
  body: string;
  path: string;
}

export interface WithdrawnNoticeProps {
  /** Короткая метка над заголовком: «Предложение снято», «Раздел не запущен». */
  badge: string;
  /** Заголовок. Утверждение об отсутствии, а не о паузе. */
  title: string;
  /** Что было на странице и почему этого больше нет. */
  lede: string;
  /** Почему маршрут сохранён. */
  note?: string;
  /** Перечень снятого. Полный, включая то, что выглядело безобидно. */
  rows: WithdrawnRow[];
  rowsTitle?: string;
  rowsNote?: string;
  /** Отдельный блок для тех, кого утверждение могло затронуть. */
  warning?: { title: string; body: React.ReactNode };
  /** Что существует на самом деле. */
  links?: WithdrawnLink[];
  linksTitle?: string;
  linksNote?: string;
  /** Заключительная оговорка. */
  footer: string;
}

export default function WithdrawnNotice({
  badge,
  title,
  lede,
  note,
  rows,
  rowsTitle = 'Что было заявлено и почему снято',
  rowsNote,
  warning,
  links,
  linksTitle = 'Что на платформе существует на самом деле',
  linksNote,
  footer,
}: WithdrawnNoticeProps) {
  const ACCENT = WITHDRAWN_ACCENT;

  return (
    <div className="min-h-screen text-slate-200">
      <div
        className="border-b"
        style={{
          borderColor: `${ACCENT}22`,
          background: 'linear-gradient(160deg, rgba(248,113,113,0.10), rgba(2,8,23,0) 60%)',
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert size={18} style={{ color: ACCENT }} />
            <span
              className="text-[11px] font-bold tracking-[0.18em] uppercase"
              style={{ color: ACCENT }}
            >
              {badge}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold text-white leading-tight max-w-2xl">
            {title}
          </h1>

          <p className="text-[14px] sm:text-base text-slate-400 mt-5 max-w-2xl leading-relaxed">
            {lede}
          </p>

          {note && (
            <p className="text-[13px] text-slate-500 mt-4 max-w-2xl leading-relaxed">{note}</p>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <h2 className="text-[15px] font-semibold text-white mb-1">{rowsTitle}</h2>
        {rowsNote && (
          <p className="text-[13px] text-slate-500 mb-5 max-w-2xl leading-relaxed">{rowsNote}</p>
        )}

        <div className="grid gap-2.5">
          {rows.map((row) => (
            <div
              key={row.claim}
              className="rounded-xl border p-4"
              style={{ borderColor: 'rgba(148,163,184,0.16)', background: 'rgba(148,163,184,0.03)' }}
            >
              <div className="flex items-start gap-2.5">
                <span
                  className="shrink-0 mt-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide"
                  style={{ color: ACCENT, background: `${ACCENT}18` }}
                >
                  снято
                </span>
                <div className="min-w-0">
                  <div className="text-[13.5px] font-medium text-slate-200 leading-snug">
                    {row.claim}
                  </div>
                  <div className="text-[12.5px] text-slate-500 mt-1 leading-relaxed">{row.why}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {warning && (
          <div
            className="rounded-xl border p-5 mt-8"
            style={{ borderColor: `${ACCENT}33`, background: `${ACCENT}0a` }}
          >
            <div className="text-[13.5px] font-semibold text-white mb-1.5">{warning.title}</div>
            <p className="text-[13px] text-slate-400 leading-relaxed">{warning.body}</p>
          </div>
        )}

        {links && links.length > 0 && (
          <>
            <h2 className="text-[15px] font-semibold text-white mt-10 mb-1">{linksTitle}</h2>
            {linksNote && (
              <p className="text-[13px] text-slate-500 mb-4 max-w-2xl leading-relaxed">
                {linksNote}
              </p>
            )}
            <div className="grid gap-2.5">
              {links.map((c) => (
                <Link
                  key={c.path}
                  href={c.path}
                  className="flex items-start gap-3 rounded-xl border p-4 transition-colors hover:bg-white/[0.03]"
                  style={{ borderColor: 'rgba(148,163,184,0.16)' }}
                >
                  <c.icon size={16} className="shrink-0 mt-0.5 text-slate-400" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13.5px] font-medium text-slate-200">{c.title}</span>
                    <span className="block text-[12.5px] text-slate-500 mt-1 leading-relaxed">
                      {c.body}
                    </span>
                  </span>
                  <ArrowRight size={14} className="shrink-0 mt-1 text-slate-600" />
                </Link>
              ))}
            </div>
          </>
        )}

        <div className="border-t mt-10 pt-6" style={{ borderColor: 'rgba(148,163,184,0.12)' }}>
          <p className="text-[12px] text-slate-500 leading-relaxed max-w-3xl">{footer}</p>
        </div>
      </div>
    </div>
  );
}
