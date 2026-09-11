/**
 * Отрисовка блока главы.
 *
 * Один компонент на все виды блоков, потому что вид блока — это данные,
 * а не выбор вёрстки. Если бы страница решала сама, что показать
 * таблицей, а что абзацем, у одной и той же главы в двух видах документа
 * были бы разные акценты — и разошлись бы они незаметно.
 *
 * Три вида блоков нарисованы намеренно заметнее остальных:
 *
 *   zero — явный ноль. Ноль, набранный тем же кеглем, что и текст,
 *   читается как отсутствие темы, а не как отсутствие величины. Именно
 *   так «сертификатов выдано 0» превращается в ощущение, что
 *   сертификаты есть.
 *
 *   gap — незакрытый вопрос. Он обязан быть виден так же хорошо, как
 *   утверждение: документ, в котором пробелы набраны мельче ответов,
 *   врёт оформлением, ничего не соврав словами.
 *
 *   rule — правило конституции. Показывается тремя частями: что
 *   запрещено, что вместо, зачем. Правило без «зачем» через год
 *   выглядит формальностью, и его снимают первым.
 *
 * Основание утверждения (`basis`) выводится подписью рядом с текстом, а
 * не всплывающей подсказкой. Подсказку не видно при печати и не видно
 * на телефоне, а основание — часть утверждения, а не украшение.
 */

import type { Block } from '@/data/whitepaper/types';
import { BASIS_LABEL, BASIS_COLOR } from '@/data/whitepaper/types';

const HAIR = 'rgba(148,163,184,0.16)';
const PANEL = 'rgba(148,163,184,0.03)';

export default function BlockView({ block }: { block: Block }) {
  switch (block.kind) {
    // ─── Обычный абзац ────────────────────────────────────────────
    case 'text':
      return (
        <p className="text-[14.5px] text-slate-300 leading-[1.75] max-w-3xl">{block.text}</p>
      );

    // ─── Утверждение с основанием ─────────────────────────────────
    case 'claim': {
      const color = BASIS_COLOR[block.basis];
      return (
        <div
          className="rounded-xl border p-4 max-w-3xl"
          style={{ borderColor: `${color}2e`, background: `${color}0a` }}
        >
          <p className="text-[14px] text-slate-200 leading-[1.7]">{block.text}</p>
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 mt-3">
            <span
              className="text-[10px] font-bold uppercase tracking-[0.14em] px-1.5 py-0.5 rounded"
              style={{ color, background: `${color}18` }}
            >
              {BASIS_LABEL[block.basis]}
            </span>
            {block.source && (
              <span className="text-[12px] text-slate-500 leading-snug">
                Источник: {block.source}
              </span>
            )}
          </div>
        </div>
      );
    }

    // ─── Правило конституции ──────────────────────────────────────
    case 'rule':
      return (
        <div
          className="rounded-xl border overflow-hidden max-w-3xl"
          style={{ borderColor: HAIR, background: PANEL }}
        >
          <div
            className="flex items-baseline gap-3 px-4 py-3 border-b"
            style={{ borderColor: HAIR }}
          >
            <span className="text-[11px] font-bold tabular-nums text-slate-500 tracking-widest">
              {String(block.n).padStart(2, '0')}
            </span>
            <h4 className="text-[14.5px] font-semibold text-white leading-snug">{block.title}</h4>
          </div>

          <dl className="divide-y" style={{ borderColor: HAIR }}>
            {[
              { k: 'Запрещает', v: block.forbids, c: '#f87171' },
              { k: 'Вместо', v: block.instead, c: '#34d399' },
              { k: 'Зачем', v: block.why, c: '#94a3b8' },
            ].map((row) => (
              <div
                key={row.k}
                className="px-4 py-3 sm:grid sm:grid-cols-[7.5rem_1fr] sm:gap-4"
                style={{ borderColor: HAIR }}
              >
                <dt
                  className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-1 sm:mb-0"
                  style={{ color: row.c }}
                >
                  {row.k}
                </dt>
                <dd className="text-[13.5px] text-slate-300 leading-[1.7]">{row.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      );

    // ─── Перечень ─────────────────────────────────────────────────
    case 'list':
      return (
        <ul className="max-w-3xl grid gap-2">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3 text-[14px] text-slate-300 leading-[1.7]">
              <span className="shrink-0 text-slate-600 tabular-nums text-[12px] mt-[3px]">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );

    // ─── Таблица ──────────────────────────────────────────────────
    case 'table':
      return (
        <div className="max-w-3xl">
          <div
            className="rounded-xl border overflow-x-auto"
            style={{ borderColor: HAIR, background: PANEL }}
          >
            <table className="w-full text-left border-collapse min-w-[32rem]">
              <thead>
                <tr>
                  {block.head.map((h) => (
                    <th
                      key={h}
                      className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-500 px-4 py-2.5 border-b align-bottom"
                      style={{ borderColor: HAIR }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <td
                        key={ci}
                        className={
                          'text-[13px] px-4 py-3 align-top leading-[1.65] border-b ' +
                          (ci === 0 ? 'text-slate-200 font-medium' : 'text-slate-400')
                        }
                        style={{ borderColor: ri === block.rows.length - 1 ? 'transparent' : HAIR }}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {block.note && (
            <p className="text-[12.5px] text-slate-500 mt-2.5 leading-relaxed">{block.note}</p>
          )}
        </div>
      );

    // ─── Явный ноль ───────────────────────────────────────────────
    case 'zero':
      return (
        <div
          className="rounded-xl border p-4 max-w-3xl flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5"
          style={{ borderColor: 'rgba(148,163,184,0.22)', background: 'rgba(148,163,184,0.05)' }}
        >
          <div className="shrink-0 flex items-baseline gap-2.5">
            <span className="text-4xl font-bold text-white tabular-nums leading-none">0</span>
            <span className="text-[12px] uppercase tracking-[0.14em] text-slate-500 font-semibold">
              ноль
            </span>
          </div>
          <div className="min-w-0">
            <div className="text-[13.5px] font-medium text-slate-200 leading-snug">
              {block.label}
            </div>
            <div className="text-[12.5px] text-slate-500 mt-1 leading-relaxed">{block.note}</div>
          </div>
        </div>
      );

    // ─── Незакрытый вопрос ────────────────────────────────────────
    case 'gap':
      return (
        <div
          className="rounded-xl border p-4 max-w-3xl"
          style={{ borderColor: 'rgba(248,113,113,0.28)', background: 'rgba(248,113,113,0.05)' }}
        >
          <div
            className="text-[10px] font-bold uppercase tracking-[0.16em] mb-2"
            style={{ color: BASIS_COLOR.gap }}
          >
            ⟨заполнить⟩ — вопрос открыт
          </div>
          <p className="text-[14px] text-slate-200 leading-[1.7]">{block.question}</p>
          <p className="text-[12.5px] text-slate-500 mt-2.5 leading-relaxed">
            <span className="text-slate-400">Чем закрывается: </span>
            {block.closedBy}
          </p>
        </div>
      );

    // ─── Формула ──────────────────────────────────────────────────
    case 'formula':
      return (
        <div className="max-w-3xl">
          <div
            className="rounded-xl border overflow-hidden"
            style={{ borderColor: HAIR, background: PANEL }}
          >
            <div
              className="px-4 py-4 border-b text-center font-mono text-[15px] sm:text-[17px] text-white overflow-x-auto"
              style={{ borderColor: HAIR, background: 'rgba(34,211,238,0.05)' }}
            >
              {block.formula}
            </div>
            <dl className="divide-y" style={{ borderColor: HAIR }}>
              {block.terms.map((t) => (
                <div
                  key={t.sym}
                  className="px-4 py-3 sm:grid sm:grid-cols-[8rem_1fr] sm:gap-4"
                  style={{ borderColor: HAIR }}
                >
                  <dt className="font-mono text-[13px] text-cyan-300 mb-1 sm:mb-0">{t.sym}</dt>
                  <dd className="text-[13px] text-slate-400 leading-[1.7]">{t.meaning}</dd>
                </div>
              ))}
            </dl>
          </div>
          {block.note && (
            <p className="text-[12.5px] text-slate-500 mt-2.5 leading-relaxed">{block.note}</p>
          )}
        </div>
      );

    default:
      return null;
  }
}
