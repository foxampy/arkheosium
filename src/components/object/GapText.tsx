/**
 * GapText — вывод текста корпуса с сохранением маркеров пробела.
 *
 * В данных встречаются осознанные пометки вида ⟨заполнить⟩ и ⟨не решено⟩.
 * Это не баг и не мусор: это место, где значение не подтверждено, и корпус
 * отказался подставить правдоподобное число. Прятать такой маркер значило бы
 * вернуть ту самую мнимую полноту, против которой он и поставлен.
 *
 * Поэтому маркер не вырезается и не заменяется прочерком — он выделяется
 * приглушённым стилем, чтобы читатель видел границу известного.
 */

import { Fragment } from 'react';

/** Любой маркер в угловых скобках ⟨…⟩ — ⟨заполнить⟩, ⟨не решено⟩ и т. п. */
const GAP_RE = /⟨[^⟩]*⟩/g;

export function GapMarker({ text }: { text: string }) {
  return (
    <span
      className="inline-block px-1.5 py-0.5 rounded-md text-xs align-baseline mx-0.5"
      style={{
        background: 'rgba(148,163,184,0.10)',
        border: '1px dashed rgba(148,163,184,0.35)',
        color: 'rgba(203,213,225,0.65)',
      }}
      title="Пробел корпуса: значение не подтверждено и намеренно не заполнено"
    >
      {text}
    </span>
  );
}

/** Содержит ли строка маркер пробела. */
export function hasGapMarker(text?: string | null): boolean {
  if (!text) return false;
  GAP_RE.lastIndex = 0;
  return GAP_RE.test(text);
}

/**
 * Рендерит текст, подсвечивая маркеры пробела.
 * Если маркеров нет — вывод посимвольно совпадает с обычным текстом.
 */
export function GapText({ text }: { text?: string | null }) {
  if (!text) return null;

  const nodes: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  GAP_RE.lastIndex = 0;

  while ((m = GAP_RE.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    nodes.push(<GapMarker key={`g-${m.index}`} text={m[0]} />);
    last = m.index + m[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));

  return (
    <>
      {nodes.map((n, i) => (
        <Fragment key={i}>{n}</Fragment>
      ))}
    </>
  );
}
