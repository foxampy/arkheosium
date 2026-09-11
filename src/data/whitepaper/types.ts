/**
 * Контракт главы вайтпейпера.
 *
 * Зачем это данные, а не вёрстка. На платформе уже стояло три разных
 * числа эмиссии в трёх разделах — 1 000 000 000, 500 000 000 и
 * 100 000 000. Никто не врал: тексты жили в трёх файлах и разъехались.
 * Пока документ, презентация и дорожная карта пишутся раздельно, они
 * будут расходиться снова — это свойство конструкции, а не небрежность
 * автора.
 *
 * Поэтому главы описаны данными, а полный документ, короткая
 * презентация и отдельные разделы собираются из одних и тех же глав.
 * Число, названное один раз, физически не может отличаться в двух видах:
 * оно одно.
 *
 * Второе назначение контракта — дисциплина основания. Утверждение
 * обязано нести поле `basis`: чем оно подтверждается. Для `measured` и
 * `standard` источник обязателен; отсутствие источника при таком
 * основании — ошибка данных, а не стилистическая вольность.
 */

/** Чем подтверждается утверждение. */
export type Basis =
  /** Измерено прибором; источник — объект и метод. */
  | 'measured'
  /** Следует из стандарта или нормативного документа; источник обязателен. */
  | 'standard'
  /** Заявлено стороной — вендором, проектом, публикацией. Не проверено. */
  | 'declared'
  /** Получено расчётом из объявленных допущений. Не измерение. */
  | 'computed'
  /** Основания нет. Пробел назван пробелом. */
  | 'gap';

export const BASIS_LABEL: Record<Basis, string> = {
  measured: 'измерено',
  standard: 'по стандарту',
  declared: 'заявлено',
  computed: 'расчёт при допущениях',
  gap: '⟨заполнить⟩',
};

export const BASIS_COLOR: Record<Basis, string> = {
  measured: '#34d399',
  standard: '#22d3ee',
  declared: '#fbbf24',
  computed: '#a78bfa',
  gap: '#f87171',
};

/** Обычный абзац. Ничего не утверждает сверх сказанного. */
export interface TextBlock {
  kind: 'text';
  text: string;
}

/**
 * Утверждение с основанием. Это единственный блок, которому позволено
 * что-либо заявлять о мире, и он обязан сказать, на чём стоит.
 */
export interface ClaimBlock {
  kind: 'claim';
  text: string;
  basis: Basis;
  /** Обязателен при basis 'measured' и 'standard'. */
  source?: string;
}

/** Правило конституции: что запрещает и что вместо. */
export interface RuleBlock {
  kind: 'rule';
  n: number;
  title: string;
  /** Что правило запрещает. Формулируется как запрет, не как пожелание. */
  forbids: string;
  /** Что делается вместо запрещённого. Без этого правило невыполнимо. */
  instead: string;
  /** Почему правило существует: какой конкретный обход оно закрывает. */
  why: string;
}

export interface ListBlock {
  kind: 'list';
  items: string[];
}

export interface TableBlock {
  kind: 'table';
  head: string[];
  rows: string[][];
  note?: string;
}

/**
 * Явный ноль. Нужен отдельным блоком, потому что ноль, выпавший из
 * текста, читается как отсутствие темы, а не как отсутствие величины.
 */
export interface ZeroBlock {
  kind: 'zero';
  label: string;
  note: string;
}

/** Незакрытый вопрос. Не заполняется правдоподобным. */
export interface GapBlock {
  kind: 'gap';
  question: string;
  /** Чем закрывается: какой работой, а не каким предположением. */
  closedBy: string;
}

/** Формула с расшифровкой каждого члена. Скрытых членов не бывает. */
export interface FormulaBlock {
  kind: 'formula';
  formula: string;
  terms: { sym: string; meaning: string }[];
  note?: string;
}

export type Block =
  | TextBlock
  | ClaimBlock
  | RuleBlock
  | ListBlock
  | TableBlock
  | ZeroBlock
  | GapBlock
  | FormulaBlock;

export interface Chapter {
  id: string;
  /** Номер главы как строка: '00', '01' … Порядок задаётся им. */
  num: string;
  title: string;
  /**
   * Одна фраза, ради которой глава существует. Именно она попадает
   * в короткую презентацию — поэтому writing её должен быть таким,
   * чтобы фраза стояла сама по себе, без главы вокруг.
   */
  lede: string;
  blocks: Block[];
  /** Входит ли глава в короткую презентацию. */
  inShort: boolean;
}

/**
 * Проверка контракта. Вызывается при сборке реестра глав: если
 * утверждение со ссылкой на измерение или стандарт не несёт источника,
 * сборка должна об этом сказать, а не промолчать.
 *
 * Возвращает список нарушений. Пустой список — глава в порядке.
 */
export function validateChapter(ch: Chapter): string[] {
  const errs: string[] = [];
  if (!ch.lede.trim()) errs.push(`${ch.num}: пустой lede`);
  ch.blocks.forEach((b, i) => {
    if (b.kind === 'claim' && (b.basis === 'measured' || b.basis === 'standard') && !b.source) {
      errs.push(`${ch.num}, блок ${i}: основание «${BASIS_LABEL[b.basis]}» без источника`);
    }
    if (b.kind === 'formula' && b.terms.length === 0) {
      errs.push(`${ch.num}, блок ${i}: формула без расшифровки членов`);
    }
  });
  return errs;
}
