/**
 * DocPage — читалка вайтпейпера.
 *
 * Одна страница на все виды документа: полный текст, короткая
 * презентация, отдельная глава, тематический срез. Вид задаётся
 * пропсом, содержимое — реестром глав. Собственного текста у страницы
 * нет ни одного предложения, и это главное её свойство: переписать
 * формулировку «для презентации покрасивее» физически негде.
 *
 * Повод конкретный. На платформе стояло три разных числа эмиссии в трёх
 * разделах — миллиард, пятьсот миллионов и сто миллионов. Никто не врал:
 * тексты жили в трёх файлах и разъехались. Пока документ, презентация и
 * дорожная карта пишутся раздельно, они расходятся снова — это свойство
 * конструкции, а не небрежность.
 *
 * Маршруты:
 *   /doc            — весь документ
 *   /doc/short      — короткая презентация (главы с inShort)
 *   /doc/:id        — одна глава
 *   срезы           — через проп sliceIds (см. SLICES в реестре)
 */

import { useMemo } from 'react';
import { Link } from 'wouter';
import { FileText, ArrowRight, AlertTriangle } from 'lucide-react';

import { CHAPTERS, SHORT_CHAPTERS, chapterById, slice, WHITEPAPER_ISSUES } from '@/data/whitepaper';
import type { Chapter } from '@/data/whitepaper/types';
import BlockView from '@/components/whitepaper/BlockView';

const HAIR = 'rgba(148,163,184,0.16)';
const ACCENT = '#22d3ee';

export interface DocPageProps {
  /** 'full' — весь документ, 'short' — главы презентации. */
  mode?: 'full' | 'short';
  /** Показать одну главу по её id. Имеет приоритет над mode. */
  chapterId?: string;
  /** Показать срез по списку id. Имеет приоритет над mode. */
  sliceIds?: readonly string[];
  /** Заголовок среза. Для полного документа и презентации не нужен. */
  sliceTitle?: string;
  /** Пояснение к срезу: почему именно эти главы. */
  sliceNote?: string;
}

export default function DocPage({
  mode = 'full',
  chapterId,
  sliceIds,
  sliceTitle,
  sliceNote,
}: DocPageProps) {
  const view = useMemo(() => {
    if (chapterId) {
      const ch = chapterById(chapterId);
      return {
        chapters: ch ? [ch] : [],
        title: ch ? `${ch.num} · ${ch.title}` : 'Главы нет',
        note: ch
          ? 'Отдельная глава документа. Полный текст — по ссылке ниже.'
          : `Главы с идентификатором «${chapterId}» в документе нет. Список глав — по ссылке ниже.`,
      };
    }
    if (sliceIds) {
      return {
        chapters: slice(sliceIds),
        title: sliceTitle ?? 'Срез документа',
        note:
          sliceNote ??
          'Срез собран из тех же глав, что и полный документ. Собственного текста у него нет.',
      };
    }
    if (mode === 'short') {
      return {
        chapters: [...SHORT_CHAPTERS],
        title: 'Короткая презентация',
        note:
          'Главы, помеченные как обязательные для короткого изложения. ' +
          'Это подмножество документа, а не его пересказ: ни одной фразы, ' +
          'которой нет в полном тексте.',
      };
    }
    return {
      chapters: [...CHAPTERS],
      title: 'Документ',
      note:
        'Полный текст. Главы — единственный источник; страницы токеномики, ' +
        'дорожной карты и презентации собираются из этих же данных.',
    };
  }, [mode, chapterId, sliceIds, sliceTitle, sliceNote]);

  const { chapters, title, note } = view;

  return (
    <div className="min-h-screen text-slate-200">
      {/* ─── Шапка ─────────────────────────────────────────────── */}
      <div
        className="border-b"
        style={{
          borderColor: `${ACCENT}22`,
          background: 'linear-gradient(160deg, rgba(34,211,238,0.08), rgba(2,8,23,0) 60%)',
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="flex items-center gap-2 mb-4">
            <FileText size={18} style={{ color: ACCENT }} />
            <span
              className="text-[11px] font-bold tracking-[0.18em] uppercase"
              style={{ color: ACCENT }}
            >
              ArkheOSium · вайтпейпер
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold text-white leading-tight max-w-2xl">
            {title}
          </h1>

          <p className="text-[14px] text-slate-400 mt-5 max-w-2xl leading-relaxed">{note}</p>

          <p className="text-[13px] text-slate-500 mt-4 max-w-2xl leading-relaxed">
            Документ описывает работающее и отдельно называет то, чего нет. Нули написаны нулями,
            незакрытые вопросы помечены ⟨заполнить⟩ и не заполнены правдоподобным. Средств
            платформа не привлекает и доходности не обещает.
          </p>
        </div>
      </div>

      {/* ─── Нарушения контракта: видны читателю, а не только в консоли ── */}
      {WHITEPAPER_ISSUES.length > 0 && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8">
          <div
            className="rounded-xl border p-4"
            style={{ borderColor: 'rgba(251,191,36,0.3)', background: 'rgba(251,191,36,0.06)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={15} className="text-amber-400" />
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-amber-400">
                Нарушений контракта документа: {WHITEPAPER_ISSUES.length}
              </span>
            </div>
            <p className="text-[12.5px] text-slate-400 leading-relaxed mb-2">
              Автоматическая проверка нашла места, где утверждение не несёт источника либо номер
              главы расходится с её позицией. Список показан читателю, а не спрятан в консоль:
              документ, который проверяет себя молча, ничем не отличается от непроверяемого.
            </p>
            <ul className="text-[12px] text-amber-200/70 grid gap-1">
              {WHITEPAPER_ISSUES.map((e) => (
                <li key={e}>· {e}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ─── Оглавление ────────────────────────────────────────── */}
      {chapters.length > 1 && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10">
          <h2 className="text-[15px] font-semibold text-white mb-4">Оглавление</h2>
          <div className="grid sm:grid-cols-2 gap-2">
            {chapters.map((ch) => (
              <a
                key={ch.id}
                href={`#${ch.id}`}
                className="rounded-lg border px-3.5 py-2.5 flex items-baseline gap-3 hover:bg-white/[0.03] transition-colors"
                style={{ borderColor: HAIR }}
              >
                <span className="text-[11px] font-bold tabular-nums text-slate-600 shrink-0">
                  {ch.num}
                </span>
                <span className="text-[13.5px] text-slate-300 leading-snug">{ch.title}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ─── Главы ─────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 grid gap-16">
        {chapters.map((ch) => (
          <ChapterView key={ch.id} chapter={ch} linkable={chapters.length > 1} />
        ))}

        {chapters.length === 0 && (
          <p className="text-[14px] text-slate-400">
            Показывать нечего: в этом виде документа нет ни одной главы.
          </p>
        )}
      </div>

      {/* ─── Другие виды документа ─────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
        <h2 className="text-[15px] font-semibold text-white mb-1">Другие виды того же текста</h2>
        <p className="text-[13px] text-slate-500 mb-5 max-w-2xl leading-relaxed">
          Не другие документы. Те же главы, собранные под другую задачу: короткое изложение,
          тематический срез, отдельная глава по ссылке.
        </p>
        <div className="grid sm:grid-cols-3 gap-2.5">
          {[
            { to: '/doc', t: 'Полный документ', b: `Все ${CHAPTERS.length} глав подряд.` },
            {
              to: '/doc/short',
              t: 'Короткая презентация',
              b: `${SHORT_CHAPTERS.length} глав, помеченных как обязательные.`,
            },
            {
              to: '/tokenomics',
              t: 'Токеномика и экономика',
              b: 'Срез: конституция, единицы, сценарии, контур участия.',
            },
          ].map((l) => (
            <Link
              key={l.to}
              href={l.to}
              className="rounded-xl border p-4 hover:bg-white/[0.03] transition-colors block"
              style={{ borderColor: HAIR }}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[13.5px] font-medium text-slate-200">{l.t}</span>
                <ArrowRight size={14} className="text-slate-600 shrink-0" />
              </div>
              <span className="text-[12.5px] text-slate-500 leading-relaxed">{l.b}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Глава
// ─────────────────────────────────────────────────────────────────

function ChapterView({ chapter, linkable }: { chapter: Chapter; linkable: boolean }) {
  return (
    <section id={chapter.id} className="scroll-mt-20">
      <div className="flex items-baseline gap-3 mb-3">
        <span className="text-[13px] font-bold tabular-nums text-slate-600">{chapter.num}</span>
        <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">{chapter.title}</h2>
      </div>

      {/* Lede — одна фраза, ради которой глава существует. Именно она
          попадает в короткую презентацию, поэтому набрана заметно. */}
      <p
        className="text-[15px] sm:text-[16px] text-slate-200 leading-[1.7] max-w-3xl border-l-2 pl-4 mb-7"
        style={{ borderColor: `${ACCENT}55` }}
      >
        {chapter.lede}
      </p>

      <div className="grid gap-5">
        {chapter.blocks.map((b, i) => (
          <BlockView key={i} block={b} />
        ))}
      </div>

      {linkable && (
        <div className="mt-6">
          <Link
            href={`/doc/${chapter.id}`}
            className="text-[12.5px] text-slate-500 hover:text-slate-300 transition-colors inline-flex items-center gap-1.5"
          >
            Отдельная ссылка на главу <ArrowRight size={12} />
          </Link>
        </div>
      )}
    </section>
  );
}
