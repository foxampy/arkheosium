/**
 * Визуальный набор досье — «палата фонда».
 *
 * Отдельный от остального сайта язык, и это осознанно. Платформенные
 * страницы говорят тёмно-синим с бирюзовым: это язык инженерного
 * интерфейса, где ничто не должно отвлекать от данных. Инвестиционный
 * пакет читает другой человек в другой ситуации — он листает его рядом
 * с тремя чужими пакетами, и первое решение принимает за десять секунд,
 * до всякого чтения. Поэтому здесь глубокая ночь и золото: язык
 * институциональной презентации, в котором сделан любой материал,
 * который этот человек видел на прошлой неделе.
 *
 * Все схемы здесь — SVG, посчитанный из данных, а не картинка.
 * Причина простая и не эстетическая: картинка с числом внутри
 * расходится с реестром в тот день, когда число меняется, и никто
 * этого не замечает, потому что картинку никто не перечитывает.
 * Диаграмма, которая берёт доли из того же массива, что и таблица под
 * ней, разойтись не может.
 */

import type { ReactNode } from 'react';
import * as Icons from 'lucide-react';

import type { Metric, Vertical, ScaleTier, Phase } from '@/data/dossier/types';

// ── Палитра ────────────────────────────────────────────────────

export const GOLD = '#C9A227';
export const GOLD_LIGHT = '#E8CE7A';
export const GOLD_DIM = 'rgba(201,162,39,0.22)';
export const PANEL = 'rgba(255,255,255,0.028)';
export const HAIR = 'rgba(201,162,39,0.16)';

/** Фон разворота: ночь с подсветкой сверху, как на печатной обложке. */
export const DECK_BG =
  'radial-gradient(ellipse 120% 80% at 50% -10%, #12254A 0%, #0A1630 38%, #050B18 100%)';

// ── Оболочки ───────────────────────────────────────────────────

/** Разворот досье: воздух и одна колонка содержания. */
export function Spread({
  children,
  wide = false,
}: {
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <section className="px-6 py-20 sm:py-24">
      <div className={`mx-auto ${wide ? 'max-w-6xl' : 'max-w-4xl'}`}>{children}</div>
    </section>
  );
}

/** Заголовок раздела с номером и золотой чертой. */
export function DeckTitle({ n, title, note }: { n: string; title: string; note?: string }) {
  return (
    <div className="mb-10">
      <div className="flex items-baseline gap-3">
        <span className="text-[11px] font-mono tabular-nums" style={{ color: GOLD }}>
          {n}
        </span>
        <h2 className="text-[13px] uppercase tracking-[0.2em] text-white/45">{title}</h2>
      </div>
      <div className="mt-3 h-px w-full" style={{ background: `linear-gradient(90deg, ${GOLD_DIM}, transparent)` }} />
      {note && <p className="mt-5 text-[14px] leading-[1.7] text-slate-400">{note}</p>}
    </div>
  );
}

/** Панель: слабая подложка и волосяная золотая рамка. */
export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-xl p-6 ${className}`}
      style={{ background: PANEL, border: `1px solid ${HAIR}` }}
    >
      {children}
    </div>
  );
}

// ── Шапка ──────────────────────────────────────────────────────

/**
 * Полоса авторитета: кто стоит рядом с проектом.
 *
 * Стадия печатается под именем всегда, а не только когда она
 * «неудобная». Ряд, в котором у одних имён есть подпись, а у других
 * нет, читается как попытка спрятать разницу — то есть достигает
 * ровно обратного тому, ради чего затевался.
 */
export function AuthorityBar({
  items,
}: {
  items: { name: string; role: string; stageLabel: string; url?: string }[];
}) {
  return (
    <div className="flex flex-wrap items-stretch justify-center gap-x-0 gap-y-6">
      {items.map((a, i) => (
        <div
          key={a.name}
          className="px-5 sm:px-7 text-center"
          style={{ borderLeft: i === 0 ? 'none' : `1px solid ${HAIR}` }}
        >
          <div className="text-[13.5px] sm:text-[15px] text-white/90 tracking-wide leading-tight">
            {a.url ? (
              <a href={a.url} target="_blank" rel="noreferrer" className="hover:text-white transition">
                {a.name}
              </a>
            ) : (
              a.name
            )}
          </div>
          <div className="mt-1 text-[10.5px] uppercase tracking-[0.13em] text-slate-500">{a.role}</div>
          <div className="mt-0.5 text-[10px] tracking-wide" style={{ color: GOLD_DIM.replace('0.22', '0.7') }}>
            {a.stageLabel}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Главная цифра разворота — та, ради которой открывают пакет. */
export function HeadlineFigure({ value, label, note }: Metric) {
  return (
    <div className="text-center">
      <div
        className="text-[54px] sm:text-[82px] leading-[0.95] font-light tabular-nums"
        style={{
          background: `linear-gradient(180deg, ${GOLD_LIGHT} 0%, ${GOLD} 62%, #8A6E14 100%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {value}
      </div>
      <div className="mt-4 text-[14px] sm:text-[16px] uppercase tracking-[0.22em] text-white/70">
        {label}
      </div>
      {note && <div className="mt-2.5 text-[13px] text-slate-500">{note}</div>}
    </div>
  );
}

// ── Числа ──────────────────────────────────────────────────────

/** Сетка метрик. Числа крупно, подписи мелко — порядок чтения задан. */
export function MetricGrid({ items, cols = 3 }: { items: Metric[]; cols?: 2 | 3 | 4 }) {
  const grid = cols === 2 ? 'sm:grid-cols-2' : cols === 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-3';
  return (
    <div className={`grid ${grid} gap-x-8 gap-y-8`}>
      {items.map((m) => (
        <div key={m.label}>
          <div className="text-[24px] sm:text-[28px] leading-none font-light tabular-nums" style={{ color: GOLD_LIGHT }}>
            {m.value}
          </div>
          <div className="mt-2.5 text-[13px] leading-[1.5] text-slate-200">{m.label}</div>
          {m.note && <div className="mt-1.5 text-[11.5px] leading-[1.55] text-slate-500">{m.note}</div>}
        </div>
      ))}
    </div>
  );
}

// ── Схемы ──────────────────────────────────────────────────────

/**
 * Цепочка масштабирования: одна точка → кластер → регион → сеть.
 *
 * Читается слева направо и на узком экране сворачивается в столбец:
 * горизонтальная прокрутка в инвестиционном материале — способ
 * гарантировать, что последнюю ступень не увидит никто.
 */
export function ScaleChain({ tiers, sign }: { tiers: readonly ScaleTier[]; sign: string }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {tiers.map((t, i) => (
        <div key={t.title} className="relative">
          <div
            className="h-full rounded-xl p-5 flex flex-col"
            style={{
              background: `linear-gradient(165deg, rgba(201,162,39,${0.09 - i * 0.012}) 0%, rgba(255,255,255,0.02) 55%)`,
              border: `1px solid ${HAIR}`,
            }}
          >
            <div className="text-[20px] font-light tabular-nums" style={{ color: GOLD_LIGHT }}>
              {t.units}
            </div>
            <div className="mt-2 text-[13.5px] text-white leading-snug">{t.title}</div>
            <div className="mt-1 text-[11px] uppercase tracking-[0.1em] text-slate-500">{t.place}</div>
            <p className="mt-3 text-[12px] leading-[1.6] text-slate-400 flex-1">{t.detail}</p>
            {(t.capexM !== undefined || t.revenueM !== undefined) && (
              <div className="mt-4 pt-3 space-y-1" style={{ borderTop: `1px solid ${HAIR}` }}>
                {t.capexM !== undefined && (
                  <div className="flex justify-between text-[11.5px]">
                    <span className="text-slate-500">CAPEX</span>
                    <span className="tabular-nums text-slate-300">
                      {sign}
                      {t.capexM} млн
                    </span>
                  </div>
                )}
                {t.revenueM !== undefined && (
                  <div className="flex justify-between text-[11.5px]">
                    <span className="text-slate-500">Выручка/год</span>
                    <span className="tabular-nums text-slate-300">
                      {sign}
                      {t.revenueM} млн
                    </span>
                  </div>
                )}
                {t.year && (
                  <div className="flex justify-between text-[11.5px]">
                    <span className="text-slate-500">Год</span>
                    <span className="tabular-nums text-slate-300">{t.year}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          {i < tiers.length - 1 && (
            <div
              className="hidden lg:block absolute top-1/2 -right-[10px] w-[14px] h-px z-10"
              style={{ background: GOLD_DIM }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

/** Направления инвестиций: плитка с иконкой, суммой и пояснением. */
export function VerticalGrid({ items, sign }: { items: readonly Vertical[]; sign: string }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((v) => {
        const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[v.icon] ?? Icons.Circle;
        return (
          <div
            key={v.name}
            className="rounded-xl p-5"
            style={{ background: PANEL, border: `1px solid ${HAIR}` }}
          >
            <Icon className="w-5 h-5" style={{ color: GOLD }} strokeWidth={1.4} />
            <div className="mt-4 text-[24px] font-light tabular-nums text-white">
              {sign}
              {v.targetM >= 1000 ? `${(v.targetM / 1000).toLocaleString('ru-RU')} млрд` : `${v.targetM} млн`}
            </div>
            <div className="mt-2 text-[13.5px] text-slate-200 leading-snug">{v.name}</div>
            <p className="mt-2 text-[11.5px] leading-[1.6] text-slate-500">{v.detail}</p>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Разбивка долями — горизонтальная полоса плюс легенда.
 *
 * Сумма долей печатается рядом с заголовком. Это не украшение:
 * разбивка, которая не даёт ста процентов, встречается в пакетах
 * постоянно, и читатель имеет право увидеть это сам, а не пересчитывать.
 */
export function ShareBar({
  title,
  total,
  items,
}: {
  title: string;
  /** Подпись абсолютной суммы, например «$420 тыс.». */
  total: string;
  items: readonly { item: string; share: number }[];
}) {
  const sum = items.reduce((a, b) => a + b.share, 0);
  const tone = (i: number) => `rgba(201,162,39,${0.85 - i * 0.11})`;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <div className="text-[13px] uppercase tracking-[0.14em] text-white/55">{title}</div>
        <div className="text-[15px] tabular-nums" style={{ color: GOLD_LIGHT }}>
          {total}
        </div>
      </div>

      <div className="mt-4 flex h-2.5 w-full overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
        {items.map((s, i) => (
          <div key={s.item} style={{ width: `${s.share}%`, background: tone(i) }} title={`${s.item} — ${s.share}%`} />
        ))}
      </div>

      <div className="mt-5 space-y-2.5">
        {items.map((s, i) => (
          <div key={s.item} className="flex items-baseline gap-3 text-[12.5px]">
            <span className="w-2.5 h-2.5 rounded-sm shrink-0 translate-y-0.5" style={{ background: tone(i) }} />
            <span className="text-slate-300 flex-1">{s.item}</span>
            <span className="tabular-nums text-slate-400">{s.share}%</span>
          </div>
        ))}
      </div>

      {sum !== 100 && (
        <div className="mt-3 text-[11.5px] tabular-nums text-slate-500">
          Сумма долей: {sum}%
        </div>
      )}
    </div>
  );
}

/**
 * P&L по годам — столбцы выручки с наложенной EBITDA.
 *
 * Считается из тех же строк, что и таблица под графиком, поэтому
 * разойтись с ней не может.
 */
export function PnLChart({
  rows,
  sign,
}: {
  rows: readonly { year: string; revenueM: number; opexM: number; ebitdaM: number }[];
  sign: string;
}) {
  const max = Math.max(...rows.map((r) => r.revenueM), 1);
  const H = 150;

  return (
    <div>
      <div className="flex items-end gap-3 sm:gap-5" style={{ height: H + 34 }}>
        {rows.map((r) => {
          const rh = Math.max((r.revenueM / max) * H, 2);
          const eh = Math.max((Math.max(r.ebitdaM, 0) / max) * H, 1);
          return (
            <div key={r.year} className="flex-1 flex flex-col items-center justify-end">
              <div className="text-[11px] tabular-nums mb-1.5" style={{ color: GOLD_LIGHT }}>
                {sign}
                {r.revenueM}
              </div>
              <div className="relative w-full rounded-t" style={{ height: rh, background: 'rgba(201,162,39,0.20)' }}>
                <div
                  className="absolute bottom-0 left-0 right-0 rounded-t"
                  style={{ height: eh, background: `linear-gradient(180deg, ${GOLD} 0%, #8A6E14 100%)` }}
                />
              </div>
              <div className="mt-2 text-[11px] tabular-nums text-slate-500">{r.year}</div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-[11.5px] text-slate-500">
        <span className="flex items-center gap-2">
          <span className="w-3 h-2 rounded-sm" style={{ background: 'rgba(201,162,39,0.20)' }} />
          выручка
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-2 rounded-sm" style={{ background: GOLD }} />
          EBITDA
        </span>
      </div>
    </div>
  );
}

/** Дорожная карта: горизонтальная лента фаз с золотыми узлами. */
export function RoadmapStrip({ phases }: { phases: readonly Phase[] }) {
  return (
    <div className="relative">
      <div className="absolute left-0 right-0 top-[7px] h-px hidden lg:block" style={{ background: HAIR }} />
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {phases.map((p, i) => (
          <div key={p.period + p.title} className="relative">
            <div className="flex items-center gap-3">
              <span
                className="w-[15px] h-[15px] rounded-full shrink-0 flex items-center justify-center text-[8px] tabular-nums"
                style={{ background: '#050B18', border: `1px solid ${GOLD}`, color: GOLD }}
              >
                {i + 1}
              </span>
              <span className="text-[12px] tabular-nums tracking-wide" style={{ color: GOLD_LIGHT }}>
                {p.period}
              </span>
            </div>
            <div className="mt-3 pl-[27px]">
              <div className="text-[14px] text-white leading-snug">{p.title}</div>
              <p className="mt-2 text-[12px] leading-[1.65] text-slate-400">{p.detail}</p>
              {p.milestone && (
                <div className="mt-2.5 text-[11.5px] text-slate-500">Веха: {p.milestone}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Перечень с золотой засечкой — «что входит», «требования», «условия». */
export function TickList({ items, columns = 1 }: { items: readonly string[]; columns?: 1 | 2 }) {
  return (
    <ul className={`grid gap-x-8 gap-y-3 ${columns === 2 ? 'sm:grid-cols-2' : ''}`}>
      {items.map((s) => (
        <li key={s} className="flex gap-3 text-[13px] leading-[1.65] text-slate-300">
          <span className="mt-[9px] w-3 h-px shrink-0" style={{ background: GOLD }} />
          <span className="flex-1">{s}</span>
        </li>
      ))}
    </ul>
  );
}

/** Пара «показатель — значение», выровненная по точкам. */
export function TermRows({ rows }: { rows: readonly { k: string; v: string }[] }) {
  return (
    <div className="space-y-px">
      {rows.map((r) => (
        <div
          key={r.k}
          className="flex items-baseline justify-between gap-6 py-3.5"
          style={{ borderTop: `1px solid rgba(148,163,184,0.09)` }}
        >
          <span className="text-[13px] text-slate-400">{r.k}</span>
          <span className="text-[14px] tabular-nums text-white text-right">{r.v}</span>
        </div>
      ))}
    </div>
  );
}
