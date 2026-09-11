/**
 * CoordPrecisionBlock — насколько точно известно место объекта.
 *
 * У 93 объектов нового корпуса координата не является координатой площадки:
 * это центр контура месторождения, привязка к посёлку, только область или
 * опорная точка трассы. Пользователь, смотрящий на точку на карте, обязан
 * видеть это прямо, а не догадываться по мелкому шрифту.
 *
 * Правило отображения: чем ниже точность, тем громче блок. Цвет и вес идут
 * по возрастанию неопределённости, а не по эстетике карточки.
 */

import { CheckCircle2, AlertTriangle, Crosshair, Route, MapPin } from 'lucide-react';

export type CoordPrecision =
  | 'exact'
  | 'field_centroid'
  | 'settlement_proxy'
  | 'region_proxy'
  | 'route_anchor';

interface PrecisionMeta {
  /** Короткое имя уровня — заголовок блока. */
  title: string;
  /** Что это значит человеческим языком. */
  detail: string;
  /** Порядок ожидаемой ошибки, если он вообще определим. */
  error?: string;
  color: string;
  icon: React.ElementType;
  /** 0 — точно, 4 — почти ничего не известно. Задаёт громкость блока. */
  severity: 0 | 1 | 2 | 3 | 4;
}

export const COORD_PRECISION_META: Record<CoordPrecision, PrecisionMeta> = {
  exact: {
    title: 'Точная координата площадки',
    detail: 'Точка снята для самого объекта. Это координата площадки, а не приближение.',
    color: '#4ade80',
    icon: CheckCircle2,
    severity: 0,
  },
  field_centroid: {
    title: 'Центроид месторождения — точка условна',
    detail:
      'Точка лежит внутри контура месторождения, но сам контур не оцифрован. Где именно внутри — неизвестно; на карте это метка площади, а не адрес объекта.',
    error: 'Контур занимает десятки километров',
    color: '#fbbf24',
    icon: Crosshair,
    severity: 2,
  },
  settlement_proxy: {
    title: 'Привязка к населённому пункту',
    detail:
      'Координата ближайшего посёлка или районного центра, а не самой площадки. Собственной координаты объекта в открытых источниках нет.',
    error: 'Ошибка порядка десятков километров',
    color: '#fb923c',
    icon: MapPin,
    severity: 3,
  },
  region_proxy: {
    title: 'Привязка к области — место известно приблизительно',
    detail:
      'Известна только область. Точка поставлена по её массиву и не указывает на объект: это признак принадлежности региону, а не местоположение.',
    error: 'Ошибка может достигать сотен километров',
    color: '#ff4d6d',
    icon: AlertTriangle,
    severity: 4,
  },
  route_anchor: {
    title: 'Опорная точка трассы, а не сама трасса',
    detail:
      'Линейный объект точкой не описывается. Это метка на трассе, поставленная, чтобы объект был находим, — но геометрии маршрута в корпусе нет.',
    error: 'Протяжённость объекта точкой не выражена',
    color: '#c084fc',
    icon: Route,
    severity: 3,
  },
};

/** Короткая подпись для плитки в шапке — та же шкала, в двух словах. */
export const COORD_PRECISION_SHORT: Record<string, string> = {
  exact: 'Площадка',
  field_centroid: 'Центроид',
  settlement_proxy: 'По посёлку',
  region_proxy: 'По области',
  route_anchor: 'Точка трассы',
};

/** Насыщенность фона и рамки растёт вместе с неопределённостью. */
function tone(severity: number) {
  const bg = [0.05, 0.07, 0.1, 0.13, 0.16][severity] ?? 0.1;
  const bd = [0.22, 0.28, 0.36, 0.45, 0.55][severity] ?? 0.35;
  return { bg, bd };
}

function hexToRgba(hex: string, a: number): string {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

interface Props {
  precision?: string | null;
  coordinates?: { lat: number; lng: number } | null;
  /** Регион и район — то немногое, что при низкой точности остаётся достоверным. */
  region?: string | null;
  district?: string | null;
}

export function CoordPrecisionBlock({ precision, coordinates, region, district }: Props) {
  if (!precision) return null;

  const meta = COORD_PRECISION_META[precision as CoordPrecision];

  // Неизвестный уровень не подменяется ближайшим: показываем как есть.
  if (!meta) {
    return (
      <div
        className="rounded-2xl p-5"
        style={{ background: 'rgba(148,163,184,0.06)', border: '1px solid rgba(148,163,184,0.25)' }}
      >
        <div className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-2">
          Точность координаты
        </div>
        <div className="text-white/75 text-sm">
          Уровень <code className="text-white/90">{precision}</code> не описан в корпусе —
          интерпретация не подставляется.
        </div>
      </div>
    );
  }

  const Icon = meta.icon;
  const { bg, bd } = tone(meta.severity);
  const loud = meta.severity >= 3;

  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: hexToRgba(meta.color, bg),
        border: `1px solid ${hexToRgba(meta.color, bd)}`,
        boxShadow: loud ? `inset 3px 0 0 ${meta.color}` : undefined,
      }}
    >
      <div className="flex items-start gap-3">
        <Icon size={loud ? 22 : 18} style={{ color: meta.color, flexShrink: 0 }} className="mt-0.5" />
        <div className="min-w-0 flex-1">
          <div
            className="text-xs font-semibold uppercase tracking-widest mb-1.5"
            style={{ color: hexToRgba(meta.color, 0.7) }}
          >
            Точность координаты
          </div>

          <div
            className={loud ? 'font-black text-lg leading-snug mb-2' : 'font-bold text-base leading-snug mb-2'}
            style={{ color: meta.color }}
          >
            {meta.title}
          </div>

          <p className="text-white/70 text-sm leading-relaxed">{meta.detail}</p>

          {meta.error && (
            <div
              className="inline-flex items-center gap-1.5 mt-3 px-2.5 py-1 rounded-lg text-xs font-semibold"
              style={{
                background: hexToRgba(meta.color, 0.14),
                border: `1px solid ${hexToRgba(meta.color, 0.3)}`,
                color: meta.color,
              }}
            >
              <AlertTriangle size={11} />
              {meta.error}
            </div>
          )}

          {/* Что известно достоверно даже при низкой точности точки. */}
          {(coordinates || region || district) && (
            <div className="mt-4 pt-3 flex flex-wrap gap-x-6 gap-y-2"
              style={{ borderTop: `1px solid ${hexToRgba(meta.color, 0.18)}` }}>
              {coordinates && (
                <div>
                  <div className="text-white/35 text-xs mb-0.5">Точка в корпусе</div>
                  <div className="text-white/80 text-xs font-semibold tabular-nums">
                    {coordinates.lat}, {coordinates.lng}
                  </div>
                </div>
              )}
              {region && (
                <div>
                  <div className="text-white/35 text-xs mb-0.5">Область</div>
                  <div className="text-white/80 text-xs font-semibold">{region}</div>
                </div>
              )}
              {district && (
                <div>
                  <div className="text-white/35 text-xs mb-0.5">Район</div>
                  <div className="text-white/80 text-xs font-semibold">{district}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
