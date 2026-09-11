/**
 * SourcesBlock — откуда взяты сведения об объекте.
 *
 * Утверждение без основания в корпусе не хранится, поэтому список источников —
 * не украшение карточки, а её несущая часть. Пустой список не прячется: «источник
 * не указан» — это тоже содержательный факт, и он должен быть виден.
 */

import { FileText, ExternalLink } from 'lucide-react';
import { GapText } from './GapText';

const URL_RE = /^https?:\/\//i;

interface Props {
  sources?: unknown;
  accent?: string;
}

export function SourcesBlock({ sources, accent = '#60a5fa' }: Props) {
  const list = Array.isArray(sources) ? (sources as unknown[]).map(String).filter(Boolean) : [];

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: 'rgba(0,6,20,0.85)', border: `1px solid ${accent}22` }}
    >
      <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-3 flex items-center gap-2">
        <FileText size={14} style={{ color: accent }} />
        Источники
        {list.length > 0 && (
          <span className="text-white/30 font-semibold normal-case tracking-normal">
            {list.length}
          </span>
        )}
      </h3>

      {list.length === 0 ? (
        <p className="text-white/45 text-sm italic">
          Источник не указан. Сведения в карточке не имеют прослеживаемого основания.
        </p>
      ) : (
        <ul className="space-y-2">
          {list.map((src, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span
                className="text-xs font-bold tabular-nums mt-0.5 flex-shrink-0"
                style={{ color: `${accent}99` }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              {URL_RE.test(src) ? (
                <a
                  href={src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm leading-relaxed hover:underline inline-flex items-start gap-1 break-all"
                  style={{ color: accent }}
                >
                  <span>{src}</span>
                  <ExternalLink size={11} className="mt-1 flex-shrink-0 opacity-70" />
                </a>
              ) : (
                <span className="text-white/70 text-sm leading-relaxed">
                  <GapText text={src} />
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
