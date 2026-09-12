/**
 * Карта библиотеки: все узлы разом, по семействам, с подсветкой того,
 * что вошло в текущую конфигурацию.
 *
 * Смысл компонента — в одном движении. Когда при собеседнике
 * переключается пресет, на карте гаснут одни узлы и загораются другие,
 * и видно, что система действительно пересобирается из одних и тех же
 * частей, а не показывает следующий слайд. Ради этого карта не
 * сворачивается и не перерисовывается заново: узлы всегда стоят на
 * своих местах, меняется только состояние.
 *
 * Ни одного собственного узла и ни одной собственной подписи здесь нет:
 * компонент — вид на реестр. Поэтому он не может разойтись ни с главой
 * документа, ни со страницей фонда, ни с конструктором предложения.
 */

import { NODES_BY_FAMILY, FAMILY_LABEL, NODE_STATUS_COLOR } from '@/data/platform/nodes';

const HAIR = 'rgba(148,163,184,0.16)';
const ACCENT = '#22d3ee';

export interface NodeMapProps {
  /** Идентификаторы узлов текущей конфигурации. */
  active: readonly string[];
  /** Щелчок по узлу. Если не передан, карта только показывает. */
  onToggle?: (id: string) => void;
  /** Показывать объём узла в строках. */
  showLines?: boolean;
}

export function NodeMap({ active, onToggle, showLines = false }: NodeMapProps) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
      {NODES_BY_FAMILY.map(({ family, nodes }) => (
        <div key={family} className="space-y-2">
          <div className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-500 px-0.5">
            {FAMILY_LABEL[family]}
          </div>

          {nodes.map((n) => {
            const on = active.includes(n.id);
            const Tag = onToggle ? 'button' : 'div';
            return (
              <Tag
                key={n.id}
                {...(onToggle ? { onClick: () => onToggle(n.id), type: 'button' as const } : {})}
                className="w-full text-left rounded-lg px-3 py-2.5 block transition-all duration-300"
                style={{
                  border: `1px solid ${on ? `${ACCENT}66` : HAIR}`,
                  background: on ? 'rgba(34,211,238,0.07)' : 'rgba(148,163,184,0.02)',
                  opacity: on ? 1 : 0.45,
                }}
              >
                <div className="flex items-start gap-2">
                  <span
                    className="mt-1 shrink-0 w-1.5 h-1.5 rounded-full transition-colors duration-300"
                    style={{ background: on ? ACCENT : NODE_STATUS_COLOR[n.status] }}
                  />
                  <span className="text-[11.5px] leading-snug text-white">{n.title}</span>
                </div>
                {showLines && (
                  <div className="text-[10px] text-slate-500 mt-1 pl-3.5">
                    {n.lines > 0 ? `${n.lines.toLocaleString('ru-RU')} строк` : 'не начат'}
                  </div>
                )}
              </Tag>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default NodeMap;
