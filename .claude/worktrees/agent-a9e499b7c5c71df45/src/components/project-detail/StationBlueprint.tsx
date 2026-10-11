// ═══════════════════════════════════════════════════════════════
//  StationBlueprint — Water Treatment Station Schematic
//  Flat isometric-style flowchart with 3 processing columns
// ═══════════════════════════════════════════════════════════════
import React from 'react';
import { ProjectData } from '@/data/projects/types';

interface Props {
  project: ProjectData;
}

// ─── Layout constants ────────────────────────────────────────
const COL_W = 196;     // column width
const COL_GAP = 24;    // gap between columns
const BOX_H = 56;      // box height
const BOX_GAP = 14;    // vertical gap between boxes
const START_X = 18;    // left margin
const START_Y = 68;    // top margin (below headers)
const ARROW_W = COL_GAP;

// ─── Box definitions per column ──────────────────────────────
interface BoxDef {
  id: string;
  label: string;
  sublabel: string;
  color: string;
  note?: string;
}

const COL1: BoxDef[] = [
  { id: 'intake', label: 'Водозабор', sublabel: 'Насосная ст. I подъёма', color: '#00b4ff', note: '150 000 м³/сут' },
  { id: 'aerate', label: 'Аэрация', sublabel: 'Насыщение O₂', color: '#00ccff' },
  { id: 'coag', label: 'Коагуляция / Флокуляция', sublabel: 'Реагентное хозяйство', color: '#38bdf8' },
];

const COL2: BoxDef[] = [
  { id: 'settle', label: 'Отстойники ×2', sublabel: 'Горизонтальные, 24 000 м³', color: '#60a5fa' },
  { id: 'filter', label: 'Фильтрация ×4', sublabel: 'Антрацит + кварц. песок', color: '#818cf8' },
  { id: 'uv', label: 'УФ + Хлорирование', sublabel: '40 мДж/см² + NaOCl', color: '#a78bfa' },
];

const COL3: BoxDef[] = [
  { id: 'tank', label: 'Резервуары ×2', sublabel: 'Чистая вода 2×30 000 м³', color: '#00e6c8', note: '60 000 м³' },
  { id: 'pump2', label: 'Насосная ст. II', sublabel: 'II подъём, давление 6 бар', color: '#4ade80' },
  { id: 'net', label: 'Распределение', sublabel: 'Сеть 19.4 км, 551 700 абон.', color: '#34d399' },
];

// ─── Control module (right side) ─────────────────────────────
const CTRL_X = START_X + 3 * COL_W + 2 * COL_GAP + 14;
const CTRL_W = 86;

// Total SVG dimensions
const SVG_W = CTRL_X + CTRL_W + 12;
const SVG_H = START_Y + 3 * BOX_H + 2 * BOX_GAP + 40;

// ─── Helper: render a single box ─────────────────────────────
function renderBox(
  x: number,
  y: number,
  w: number,
  h: number,
  box: BoxDef,
  index: number
) {
  const glow = box.color;
  return (
    <g key={box.id}>
      {/* Box shadow / glow */}
      <rect
        x={x - 1}
        y={y - 1}
        width={w + 2}
        height={h + 2}
        rx="8"
        fill="none"
        stroke={glow}
        strokeWidth="0.6"
        opacity="0.25"
      />
      {/* Box fill */}
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx="7"
        fill="rgba(0,10,30,0.82)"
        stroke={glow}
        strokeWidth="1.2"
        opacity="0.9"
      />
      {/* Top accent stripe */}
      <rect
        x={x}
        y={y}
        width={w}
        height="5"
        rx="7"
        fill={glow}
        opacity="0.55"
      />
      <rect
        x={x}
        y={y + 3}
        width={w}
        height="2"
        fill={glow}
        opacity="0.25"
      />
      {/* Step circle */}
      <circle cx={x + 14} cy={y + 24} r="9" fill={`${glow}22`} stroke={glow} strokeWidth="1" />
      <text
        x={x + 14}
        y={y + 28}
        textAnchor="middle"
        fill={glow}
        fontSize="9"
        fontWeight="800"
        fontFamily="sans-serif"
      >
        {index + 1}
      </text>
      {/* Label */}
      <text
        x={x + 28}
        y={y + 22}
        fill="white"
        fontSize="8.5"
        fontWeight="700"
        fontFamily="sans-serif"
      >
        {box.label}
      </text>
      {/* Sublabel */}
      <text
        x={x + 28}
        y={y + 34}
        fill="rgba(255,255,255,0.45)"
        fontSize="6.5"
        fontFamily="sans-serif"
      >
        {box.sublabel}
      </text>
      {/* Note badge */}
      {box.note && (
        <>
          <rect x={x + w - 50} y={y + 40} width={46} height="11" rx="4" fill={`${glow}18`} stroke={`${glow}40`} strokeWidth="0.8" />
          <text
            x={x + w - 27}
            y={y + 48.5}
            textAnchor="middle"
            fill={glow}
            fontSize="6"
            fontWeight="700"
            fontFamily="sans-serif"
          >
            {box.note}
          </text>
        </>
      )}
    </g>
  );
}

// ─── Helper: vertical arrow between boxes ────────────────────
function vertArrow(x: number, y1: number, y2: number, color: string) {
  const mid = (y1 + y2) / 2;
  return (
    <g key={`varrow-${x}-${y1}`}>
      <line
        x1={x}
        y1={y1}
        x2={x}
        y2={y2 - 5}
        stroke={color}
        strokeWidth="1.2"
        strokeDasharray="3 2"
        opacity="0.55"
      />
      <polygon
        points={`${x - 4},${y2 - 5} ${x + 4},${y2 - 5} ${x},${y2}`}
        fill={color}
        opacity="0.7"
      />
    </g>
  );
}

// ─── Helper: horizontal arrow between columns ─────────────────
function horizArrow(
  x1: number,
  x2: number,
  y: number,
  color1: string,
  color2: string,
  label: string
) {
  const mx = (x1 + x2) / 2;
  return (
    <g key={`harrow-${x1}-${y}`}>
      <defs>
        <linearGradient id={`arrowGrad-${Math.floor(x1)}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={color1} />
          <stop offset="100%" stopColor={color2} />
        </linearGradient>
      </defs>
      <line
        x1={x1}
        y1={y}
        x2={x2 - 5}
        y2={y}
        stroke={`url(#arrowGrad-${Math.floor(x1)})`}
        strokeWidth="1.5"
        strokeDasharray="4 2"
        opacity="0.7"
      />
      <polygon
        points={`${x2 - 5},${y - 4} ${x2 - 5},${y + 4} ${x2},${y}`}
        fill={color2}
        opacity="0.8"
      />
      <text
        x={mx}
        y={y - 4}
        textAnchor="middle"
        fill="rgba(255,255,255,0.3)"
        fontSize="5.5"
        fontFamily="sans-serif"
      >
        {label}
      </text>
    </g>
  );
}

export const StationBlueprint: React.FC<Props> = ({ project }) => {
  const col1x = START_X;
  const col2x = START_X + COL_W + COL_GAP;
  const col3x = START_X + 2 * COL_W + 2 * COL_GAP;

  const rowY = (row: number) => START_Y + row * (BOX_H + BOX_GAP);

  // Cross-arrow Y positions (mid-height of matching rows)
  const arrowY = (row: number) => rowY(row) + BOX_H / 2;

  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: 'rgba(0,6,20,0.9)',
        border: '1px solid rgba(96,165,250,0.2)',
      }}
    >
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-7 h-7 rounded-xl flex items-center justify-center text-sm"
            style={{ background: 'rgba(96,165,250,0.15)', border: '1px solid rgba(96,165,250,0.3)' }}
          >
            🏭
          </div>
          <span className="text-white font-bold text-sm">Схема водоочистной станции</span>
        </div>
        <p className="text-white/40 text-xs ml-9">
          Упрощённая технологическая схема — Ширин VODPROM · Мощность 150 000 м³/сут
        </p>
      </div>

      {/* SVG Schematic */}
      <div style={{ overflowX: 'auto' }}>
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          style={{ width: '100%', minWidth: 520, height: 'auto', display: 'block' }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="svgBg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(0,10,30,0)" />
              <stop offset="100%" stopColor="rgba(0,5,18,0.4)" />
            </linearGradient>
          </defs>
          <rect width={SVG_W} height={SVG_H} fill="url(#svgBg)" rx="8" />

          {/* Column headers */}
          {[
            { x: col1x, label: 'ЗАБОР И ПОДГОТОВКА', color: '#00b4ff' },
            { x: col2x, label: 'ОЧИСТКА', color: '#818cf8' },
            { x: col3x, label: 'ХРАНЕНИЕ И ПОДАЧА', color: '#00e6c8' },
          ].map(col => (
            <g key={col.label}>
              <rect x={col.x} y="8" width={COL_W} height="20" rx="5" fill={`${col.color}12`} stroke={`${col.color}30`} strokeWidth="0.8" />
              <text
                x={col.x + COL_W / 2}
                y="22"
                textAnchor="middle"
                fill={col.color}
                fontSize="7"
                fontWeight="800"
                fontFamily="sans-serif"
                letterSpacing="0.5"
                opacity="0.85"
              >
                {col.label}
              </text>
            </g>
          ))}

          {/* Column 1 boxes */}
          {COL1.map((box, i) => renderBox(col1x, rowY(i), COL_W, BOX_H, box, i))}

          {/* Column 2 boxes */}
          {COL2.map((box, i) => renderBox(col2x, rowY(i), COL_W, BOX_H, box, i + 3))}

          {/* Column 3 boxes */}
          {COL3.map((box, i) => renderBox(col3x, rowY(i), COL_W, BOX_H, box, i + 6))}

          {/* Vertical arrows within each column */}
          {[0, 1].map(i => (
            <g key={`v1-${i}`}>
              {vertArrow(col1x + COL_W / 2, rowY(i) + BOX_H, rowY(i + 1), COL1[i].color)}
              {vertArrow(col2x + COL_W / 2, rowY(i) + BOX_H, rowY(i + 1), COL2[i].color)}
              {vertArrow(col3x + COL_W / 2, rowY(i) + BOX_H, rowY(i + 1), COL3[i].color)}
            </g>
          ))}

          {/* Horizontal arrows: col1→col2 at row 0 (top) */}
          {horizArrow(col1x + COL_W, col2x, arrowY(0), COL1[0].color, COL2[0].color, 'сырая вода')}
          {/* Horizontal arrows: col2→col3 at row 0 */}
          {horizArrow(col2x + COL_W, col3x, arrowY(0), COL2[0].color, COL3[0].color, 'очищенная')}

          {/* KIPA / Control box */}
          <rect
            x={CTRL_X}
            y={START_Y}
            width={CTRL_W}
            height={2 * BOX_H + BOX_GAP}
            rx="8"
            fill="rgba(251,191,36,0.06)"
            stroke="rgba(251,191,36,0.35)"
            strokeWidth="1.2"
          />
          <rect x={CTRL_X} y={START_Y} width={CTRL_W} height="5" rx="8" fill="rgba(251,191,36,0.45)" />
          <rect x={CTRL_X} y={START_Y + 3} width={CTRL_W} height="2" fill="rgba(251,191,36,0.2)" />
          <text
            x={CTRL_X + CTRL_W / 2}
            y={START_Y + 20}
            textAnchor="middle"
            fill="#fbbf24"
            fontSize="7.5"
            fontWeight="800"
            fontFamily="sans-serif"
          >
            КИПиА / ЦПУ
          </text>
          <text
            x={CTRL_X + CTRL_W / 2}
            y={START_Y + 32}
            textAnchor="middle"
            fill="rgba(251,191,36,0.55)"
            fontSize="6"
            fontFamily="sans-serif"
          >
            SCADA / IoT
          </text>
          <text
            x={CTRL_X + CTRL_W / 2}
            y={START_Y + 44}
            textAnchor="middle"
            fill="rgba(251,191,36,0.45)"
            fontSize="5.5"
            fontFamily="sans-serif"
          >
            Удалённый
          </text>
          <text
            x={CTRL_X + CTRL_W / 2}
            y={START_Y + 54}
            textAnchor="middle"
            fill="rgba(251,191,36,0.45)"
            fontSize="5.5"
            fontFamily="sans-serif"
          >
            мониторинг 24/7
          </text>

          {/* Control lines to all columns */}
          {[col1x + COL_W / 2, col2x + COL_W / 2, col3x + COL_W / 2].map((cx, idx) => (
            <line
              key={`ctrl-${idx}`}
              x1={CTRL_X}
              y1={START_Y + 30 + idx * 10}
              x2={cx}
              y2={rowY(0) + 10}
              stroke="rgba(251,191,36,0.18)"
              strokeWidth="0.8"
              strokeDasharray="2 3"
            />
          ))}

          {/* Dimension callouts */}
          <g opacity="0.5">
            <text x={col3x} y={SVG_H - 10} fill="rgba(0,230,200,0.6)" fontSize="6" fontFamily="sans-serif">
              Ёмкость резервуаров: 2×30 000 м³
            </text>
            <text x={col1x} y={SVG_H - 10} fill="rgba(0,200,255,0.5)" fontSize="6" fontFamily="sans-serif">
              Источник: р. Сырдарья
            </text>
          </g>

          {/* Flow direction label */}
          <text
            x={SVG_W / 2}
            y={SVG_H - 2}
            textAnchor="middle"
            fill="rgba(255,255,255,0.12)"
            fontSize="7"
            fontFamily="sans-serif"
            letterSpacing="2"
          >
            ← ТЕХНОЛОГИЧЕСКИЙ ПОТОК ВОДООЧИСТКИ →
          </text>
        </svg>
      </div>

      {/* Legend row */}
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
        {[
          { color: '#00b4ff', label: 'Водозабор и подготовка' },
          { color: '#818cf8', label: 'Очистка и дезинфекция' },
          { color: '#00e6c8', label: 'Хранение и подача' },
          { color: '#fbbf24', label: 'Автоматизация (КИПиА)' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: item.color, opacity: 0.8 }} />
            <span className="text-white/40 text-xs">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StationBlueprint;
