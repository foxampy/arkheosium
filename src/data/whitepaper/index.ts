/**
 * Реестр глав вайтпейпера.
 *
 * Единственное место, где перечислены главы. Все виды документа —
 * полный текст, короткая презентация, отдельная глава по ссылке,
 * дорожная карта, токеномика — собираются отсюда и не имеют
 * собственного содержания.
 *
 * Зачем так. На платформе стояло три разных числа эмиссии в трёх
 * разделах: 1 000 000 000, 500 000 000 и 100 000 000. Никто не врал —
 * тексты жили в трёх файлах и разъехались. Пока документ, презентация и
 * дорожная карта пишутся раздельно, они будут расходиться снова: это
 * свойство конструкции, а не небрежность автора. Число, названное один
 * раз, физически не может отличаться в двух видах — оно одно.
 *
 * Проверка контракта запускается при загрузке модуля, а не по команде.
 * Проверка, которую надо не забыть запустить, однажды не запускается.
 */

import type { Chapter } from './types';
import { validateChapter } from './types';

import { CONSTITUTION } from './00-constitution';
import { WHAT_IT_IS } from './01-what-it-is';
import { HISTORY } from './02-history';
import { METHODOLOGY } from './03-methodology';
import { ONTOLOGY } from './04-ontology';
import { TOKENOMICS } from './05-tokenomics';
import { ECONOMY } from './06-economy';
import { REALIZATION } from './07-realization';
import { MODULES } from './08-modules';
import { ROADMAP } from './09-roadmap';
import { STANDARDS_CH } from './10-standards';
import { STATUS } from './11-status';
import { SOURCES } from './12-sources';

/**
 * Порядок глав — порядок чтения. Он же задаёт нумерацию: поле `num`
 * обязано совпадать с позицией, и это проверяется ниже. Расхождение
 * номера и позиции даёт документ, в котором «глава 07» стоит шестой, —
 * мелочь, которая рушит доверие к остальному быстрее любой ошибки
 * в расчётах.
 */
export const CHAPTERS: readonly Chapter[] = [
  CONSTITUTION,
  WHAT_IT_IS,
  HISTORY,
  METHODOLOGY,
  ONTOLOGY,
  TOKENOMICS,
  ECONOMY,
  REALIZATION,
  MODULES,
  ROADMAP,
  STANDARDS_CH,
  STATUS,
  SOURCES,
];

/**
 * Короткая презентация. Не отдельный текст, а подмножество глав,
 * помеченных `inShort`. Именно поэтому презентация не может сказать
 * того, чего нет в документе: у неё нет собственных предложений.
 *
 * В презентацию попадают lede глав и ключевые блоки — но блоки берутся
 * из тех же данных. Переписать фразу «для презентации покрасивее»
 * негде: файла с презентацией не существует.
 */
export const SHORT_CHAPTERS: readonly Chapter[] = CHAPTERS.filter((c) => c.inShort);

/** Глава по идентификатору маршрута. undefined, если такой главы нет. */
export function chapterById(id: string): Chapter | undefined {
  return CHAPTERS.find((c) => c.id === id);
}

/**
 * Срезы документа для отдельных страниц.
 *
 * Срез — это список идентификаторов, а не копия текста. Страница
 * «Токеномика» показывает конституцию, токеномику и экономику целиком
 * в том же виде, в каком они стоят в документе; расходиться ей не с чем.
 */
export const SLICES = {
  tokenomics: ['constitution', 'tokenomics', 'economy', 'realization'],
  roadmap: ['roadmap', 'status'],
  method: ['methodology', 'ontology', 'sources'],
} as const;

export function slice(ids: readonly string[]): Chapter[] {
  return ids.map(chapterById).filter((c): c is Chapter => !!c);
}

// ─────────────────────────────────────────────────────────────────────
// Проверка при сборке
// ─────────────────────────────────────────────────────────────────────

/**
 * Полный список нарушений контракта по всем главам.
 *
 * Проверяется:
 *   1. Контракт каждой главы — validateChapter: непустой lede,
 *      источник при основании «измерено» и «по стандарту», расшифровка
 *      членов формулы.
 *   2. Уникальность id — два одинаковых id дают маршрут, по которому
 *      открывается не та глава.
 *   3. Совпадение num с позицией в списке.
 */
export function validateAll(): string[] {
  const errs: string[] = [];

  const seen = new Set<string>();
  CHAPTERS.forEach((ch, i) => {
    errs.push(...validateChapter(ch));

    if (seen.has(ch.id)) errs.push(`дублирующийся id главы: «${ch.id}»`);
    seen.add(ch.id);

    const expected = String(i).padStart(2, '0');
    if (ch.num !== expected) {
      errs.push(`глава «${ch.id}»: номер ${ch.num}, а позиция в списке ${expected}`);
    }
  });

  return errs;
}

/**
 * Нарушения печатаются в консоль при разработке, а не молча
 * игнорируются. Сборку это не роняет намеренно: документ с одним
 * незаполненным источником полезнее, чем белый экран. Но и промолчать
 * нельзя — молчание здесь означало бы, что дисциплина основания
 * соблюдается только пока про неё помнят.
 */
const ISSUES = validateAll();
if (ISSUES.length > 0 && typeof console !== 'undefined') {
  console.warn(
    `[whitepaper] нарушений контракта: ${ISSUES.length}\n` + ISSUES.map((e) => ' · ' + e).join('\n'),
  );
}

export { ISSUES as WHITEPAPER_ISSUES };
export type { Chapter };
