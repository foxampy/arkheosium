import { motion } from 'framer-motion';
import { Droplets } from 'lucide-react';
import type { FullObjectData } from '@/types/object-full';

// ─── Flow node config ─────────────────────────────────────────────────────────

interface FlowNode {
  id: string;
  label: string;
  sublabel?: string;
  color: string;
}

function buildNodes(obj: FullObjectData): FlowNode[] {
  const fmtM3 = (v?: number) => {
    if (!v) return undefined;
    if (v >= 1e9) return `${(v / 1e9).toFixed(1)} млрд м³/г`;
    if (v >= 1e6) return `${(v / 1e6).toFixed(1)} млн м³/г`;
    if (v >= 1e3) return `${(v / 1e3).toFixed(0)}K м³/сут`;
    return `${v} м³/сут`;
  };

  return [
    {
      id: 'source',
      label: 'Источник воды',
      sublabel: obj.water_source_name ?? (obj.water_source_type === 'river' ? 'Река' : obj.water_source_type === 'groundwater' ? 'Подземные воды' : obj.water_source_type ?? ''),
      color: '#00e6c8',
    },
    {
      id: 'intake',
      label: 'Водозабор',
      sublabel: fmtM3(obj.annual_water_intake_m3),
      color: '#60a5fa',
    },
    {
      id: 'pretreatment',
      label: 'Предочистка',
      sublabel: obj.treatment_technologies?.[0],
      color: '#a78bfa',
    },
    {
      id: 'treatment',
      label: 'Очистка',
      sublabel: obj.quality_index != null ? `Индекс ${obj.quality_index}/100` : undefined,
      color: '#4ade80',
    },
    {
      id: 'storage',
      label: 'Накопление',
      sublabel: obj.useful_volume_m3 ? `${(obj.useful_volume_m3 / 1e6).toFixed(0)} млн м³` : undefined,
      color: '#00e6c8',
    },
    {
      id: 'distribution',
      label: 'Распределение',
      sublabel: obj.pipeline_length_km ? `${obj.pipeline_length_km} км` : undefined,
      color: '#60a5fa',
    },
    {
      id: 'consumers',
      label: 'Потребители',
      sublabel: obj.serves_population ? `${(obj.serves_population / 1e6).toFixed(1)}M чел.` : undefined,
      color: '#fbbf24',
    },
  ];
}

// SVG dimensions
const NODE_W = 110;
const NODE_H = 52;
const NODE_GAP = 32;
const TOTAL_NODES = 7;
const SVG_W = TOTAL_NODES * NODE_W + (TOTAL_NODES - 1) * NODE_GAP;
const SVG_H = 120;
const Y_TOP = 18;

// ─── Component ────────────────────────────────────────────────────────────────

export default function WaterFlowSection({ object }: { object: FullObjectData }) {
  const nodes = buildNodes(object);

  // Build arrowhead marker once
  const arrowId = 'arrowhead-flow';

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl p-6"
      style={{
        background: 'rgba(0,6,20,0.85)',
        border: '1px solid rgba(0,230,200,0.15)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(0,230,200,0.12)', border: '1px solid rgba(0,230,200,0.2)' }}
        >
          <Droplets size={17} style={{ color: '#00e6c8' }} />
        </div>
        <h2 className="text-white font-black text-xl">Схема водоснабжения</h2>
      </div>

      {/* SVG Diagram */}
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width="100%"
          preserveAspectRatio="xMidYMid meet"
          style={{ minWidth: 480 }}
        >
          <defs>
            <marker id={arrowId} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="rgba(0,230,200,0.5)" />
            </marker>
          </defs>

          {nodes.map((node, i) => {
            const x = i * (NODE_W + NODE_GAP);
            const cx = x + NODE_W / 2;
            const midY = Y_TOP + NODE_H / 2;

            return (
              <g key={node.id}>
                {/* Arrow to next node */}
                {i < nodes.length - 1 && (
                  <line
                    x1={x + NODE_W}
                    y1={midY}
                    x2={x + NODE_W + NODE_GAP - 2}
                    y2={midY}
                    stroke="rgba(0,230,200,0.4)"
                    strokeWidth="1.5"
                    markerEnd={`url(#${arrowId})`}
                  />
                )}

                {/* Node rect */}
                <rect
                  x={x}
                  y={Y_TOP}
                  width={NODE_W}
                  height={NODE_H}
                  rx="8"
                  ry="8"
                  fill={`${node.color}18`}
                  stroke={`${node.color}40`}
                  strokeWidth="1"
                />

                {/* Label */}
                <text
                  x={cx}
                  y={Y_TOP + 18}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.85)"
                  fontSize="9"
                  fontWeight="700"
                  fontFamily="system-ui, sans-serif"
                >
                  {node.label}
                </text>

                {/* Sublabel */}
                {node.sublabel && (
                  <text
                    x={cx}
                    y={Y_TOP + 32}
                    textAnchor="middle"
                    fill={node.color}
                    fontSize="7.5"
                    fontFamily="system-ui, sans-serif"
                    opacity={0.85}
                  >
                    {node.sublabel.length > 16 ? node.sublabel.slice(0, 15) + '…' : node.sublabel}
                  </text>
                )}

                {/* Step number */}
                <circle cx={x + 10} cy={Y_TOP + 10} r="7" fill={`${node.color}25`} stroke={`${node.color}40`} strokeWidth="0.8" />
                <text x={x + 10} y={Y_TOP + 14} textAnchor="middle" fill={node.color} fontSize="7" fontWeight="700" fontFamily="system-ui, sans-serif">
                  {i + 1}
                </text>
              </g>
            );
          })}

          {/* Return flow arrow (below) */}
          <path
            d={`M ${(TOTAL_NODES - 1) * (NODE_W + NODE_GAP) + NODE_W / 2},${Y_TOP + NODE_H + 4}
                L ${(TOTAL_NODES - 1) * (NODE_W + NODE_GAP) + NODE_W / 2},${SVG_H - 8}
                L ${4 * (NODE_W + NODE_GAP) + NODE_W / 2},${SVG_H - 8}
                L ${4 * (NODE_W + NODE_GAP) + NODE_W / 2},${Y_TOP + NODE_H + 4}`}
            fill="none"
            stroke="rgba(0,230,200,0.15)"
            strokeWidth="1"
            strokeDasharray="4 3"
            markerEnd={`url(#${arrowId})`}
          />
          <text
            x={(5.5) * (NODE_W + NODE_GAP) / 1.5}
            y={SVG_H - 1}
            textAnchor="middle"
            fill="rgba(0,230,200,0.35)"
            fontSize="7"
            fontFamily="system-ui, sans-serif"
          >
            Возврат стоков
          </text>
        </svg>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        {/* Water source card */}
        <div
          className="rounded-xl p-4"
          style={{ background: 'rgba(0,230,200,0.06)', border: '1px solid rgba(0,230,200,0.15)' }}
        >
          <div className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-3">Источник воды</div>
          <div className="space-y-2">
            {object.water_source_name && (
              <div className="flex justify-between">
                <span className="text-white/50 text-sm">Название</span>
                <span className="text-white font-semibold text-sm">{object.water_source_name}</span>
              </div>
            )}
            {object.water_source_type && (
              <div className="flex justify-between">
                <span className="text-white/50 text-sm">Тип</span>
                <span className="text-white font-semibold text-sm capitalize">
                  {object.water_source_type === 'river' ? 'Река' :
                    object.water_source_type === 'groundwater' ? 'Подземные воды' :
                    object.water_source_type === 'reservoir' ? 'Водохранилище' : 'Смешанный'}
                </span>
              </div>
            )}
            {object.annual_water_intake_m3 != null && (
              <div className="flex justify-between">
                <span className="text-white/50 text-sm">Годовой забор</span>
                <span className="text-[#00e6c8] font-bold text-sm tabular-nums">
                  {(object.annual_water_intake_m3 / 1e6).toFixed(1)} млн м³
                </span>
              </div>
            )}
            {object.water_source_rivers && object.water_source_rivers.length > 0 && (
              <div>
                <span className="text-white/50 text-sm">Притоки: </span>
                <span className="text-white/70 text-sm">{object.water_source_rivers.join(', ')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Return card */}
        <div
          className="rounded-xl p-4"
          style={{ background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.15)' }}
        >
          <div className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-3">Возврат воды</div>
          <div className="space-y-2">
            {object.water_return_method ? (
              <div>
                <span className="text-white/50 text-sm">Метод: </span>
                <span className="text-white/80 text-sm">{object.water_return_method}</span>
              </div>
            ) : (
              <p className="text-white/30 text-sm italic">Данные о возврате воды отсутствуют</p>
            )}
            {object.water_loss_pct != null && (
              <div className="flex justify-between">
                <span className="text-white/50 text-sm">Потери при распределении</span>
                <span className="text-[#fb923c] font-bold text-sm tabular-nums">{object.water_loss_pct}%</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
