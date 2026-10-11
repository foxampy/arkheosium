// ═══════════════════════════════════════════════════════════════
//  RegionalMap — inline SVG map of Uzbekistan with project marker
// ═══════════════════════════════════════════════════════════════
import React from 'react';
import { ProjectData } from '@/data/projects/types';

interface Props {
  project: ProjectData;
}

// Projection helpers (viewBox 0 0 500 340)
// Uzbekistan: lat 37.2°–45.6°N, lng 55.9°–73.1°E
const lngToX = (lng: number) => ((lng - 55.9) / (73.1 - 55.9)) * 500;
const latToY = (lat: number) => ((45.6 - lat) / (45.6 - 37.2)) * 340;

// Pre-calculated key points
// Samarkand 39.65N 66.97E → x=258 y=213  ← PROJECT SITE (microdistrict Shirin)
// Tashkent 41.30N 69.27E → x=310 y=154
// Fergana  40.38N 71.78E → x=366 y=185
// Bukhara  39.77N 64.43E → x=199 y=208
// Nukus    42.47N 59.61E → x=107 y=113
// Termez   37.22N 67.28E → x=264 y=281

const UZBEK_BORDER =
  'M 107,113 L 90,80 L 95,45 L 130,30 L 180,22 L 235,28 L 295,35 L 340,42 L 375,55 L 390,80 L 395,130 L 390,165 L 380,195 L 370,215 L 355,255 L 330,278 L 295,292 L 240,295 L 175,285 L 130,270 L 95,250 L 80,210 L 70,165 L 75,135 Z';

const SYRDARYA_PATH =
  'M 366,185 C 350,180 330,165 310,154 C 300,148 300,162 296,182 C 288,195 270,192 240,178 C 200,160 160,140 120,110 C 100,96 85,70 80,45';

const AMUDARYA_PATH =
  'M 270,280 C 250,268 220,255 185,235 C 155,218 120,195 107,113';

// Pipeline from Syrdarya river intake point toward Samarkand microdistrict Shirin
const PIPELINE_PATH = 'M 258,213 C 252,222 240,230 225,235';

const ARAL_SEA = 'M 80,42 L 85,35 L 92,38 L 88,48 Z';

// Grid lines
const GRID_LINES_H = [50, 100, 150, 200, 250, 300];
const GRID_LINES_V = [50, 100, 150, 200, 250, 300, 350, 400, 450];

const NON_MAIN_CITIES = [
  { name: 'Ташкент', x: 310, y: 154, isCapital: true },
  { name: 'Фергана', x: 366, y: 185 },
  { name: 'Бухара', x: 199, y: 208 },
  { name: 'Нукус', x: 107, y: 113 },
  { name: 'Термез', x: 264, y: 281 },
];

export const RegionalMap: React.FC<Props> = ({ project }) => {
  const mainCity = project.location.city;
  const region = project.location.region;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: '#000a1e',
        border: '1px solid rgba(0,230,200,0.15)',
      }}
    >
      {/* Header strip */}
      <div
        className="px-5 py-3 flex items-center justify-between flex-wrap gap-2"
        style={{ borderBottom: '1px solid rgba(0,230,200,0.08)', background: 'rgba(0,230,200,0.03)' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-base">🗺</span>
          <span className="text-white font-bold text-sm">Регион реализации — Узбекистан</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="px-3 py-1 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(0,230,200,0.12)', color: '#00e6c8', border: '1px solid rgba(0,230,200,0.25)' }}
          >
            ⚙ {mainCity}
          </span>
          <span
            className="px-3 py-1 rounded-full text-xs"
            style={{ background: 'rgba(96,165,250,0.08)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.2)' }}
          >
            {region}
          </span>
        </div>
      </div>

      {/* SVG Map */}
      <svg
        viewBox="0 0 500 340"
        style={{ width: '100%', height: 'auto', display: 'block' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* CSS animations */}
        <style>{`
          @keyframes shirinPulse { 0%{r:8;opacity:0.8} 100%{r:24;opacity:0} }
          @keyframes riverFlow { to { stroke-dashoffset: -20 } }
          .shirin-pulse { animation: shirinPulse 2s ease-out infinite; fill: rgba(0,230,200,0.4); }
          .river-flow { stroke-dasharray: 8 4; animation: riverFlow 2s linear infinite; }
        `}</style>

        {/* Layer 1: Background gradient */}
        <defs>
          <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#000a1e" />
            <stop offset="100%" stopColor="#001830" />
          </linearGradient>
          <filter id="riverGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="cityGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <marker id="pipelineArrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#4ade80" />
          </marker>
        </defs>
        <rect width="500" height="340" fill="url(#bgGrad)" />

        {/* Layer 2: Grid lines */}
        <g opacity="0.04" stroke="rgba(0,230,200,1)" strokeWidth="0.5">
          {GRID_LINES_H.map(y => (
            <line key={`h${y}`} x1="0" y1={y} x2="500" y2={y} />
          ))}
          {GRID_LINES_V.map(x => (
            <line key={`v${x}`} x1={x} y1="0" x2={x} y2="340" />
          ))}
        </g>

        {/* Layer 3: Uzbekistan border */}
        <path
          d={UZBEK_BORDER}
          fill="rgba(0,100,160,0.15)"
          stroke="rgba(0,200,220,0.4)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Layer 4: Aral Sea */}
        <path
          d={ARAL_SEA}
          fill="rgba(0,100,200,0.3)"
          stroke="rgba(0,180,240,0.5)"
          strokeWidth="1"
        />
        <text x="72" y="33" fill="rgba(0,180,240,0.5)" fontSize="4.5" fontFamily="sans-serif" textAnchor="middle">
          Аральское
        </text>
        <text x="72" y="39" fill="rgba(0,180,240,0.5)" fontSize="4.5" fontFamily="sans-serif" textAnchor="middle">
          море
        </text>

        {/* Layer 5: Rivers — outer glow */}
        <path
          d={SYRDARYA_PATH}
          fill="none"
          stroke="rgba(0,180,255,0.15)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d={AMUDARYA_PATH}
          fill="none"
          stroke="rgba(0,100,200,0.12)"
          strokeWidth="5"
          strokeLinecap="round"
        />

        {/* Rivers — animated inner flow */}
        <path
          d={SYRDARYA_PATH}
          fill="none"
          stroke="rgba(0,200,255,0.8)"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="river-flow"
        />
        <path
          d={AMUDARYA_PATH}
          fill="none"
          stroke="rgba(0,150,230,0.7)"
          strokeWidth="1.2"
          strokeLinecap="round"
          className="river-flow"
          style={{ animationDelay: '0.8s' }}
        />

        {/* River labels */}
        <text x="225" y="155" fill="rgba(0,200,255,0.5)" fontSize="6" fontFamily="sans-serif" transform="rotate(-18,225,155)">
          р. Сырдарья
        </text>
        <text x="155" y="240" fill="rgba(0,150,230,0.5)" fontSize="6" fontFamily="sans-serif" transform="rotate(-40,155,240)">
          р. Амударья
        </text>

        {/* Layer 6: Pipeline */}
        <path
          d={PIPELINE_PATH}
          fill="none"
          stroke="#4ade80"
          strokeWidth="2"
          strokeDasharray="5 3"
          strokeLinecap="round"
          markerEnd="url(#pipelineArrow)"
          opacity="0.85"
        />
        {/* Pipeline label */}
        <rect x="186" y="236" width="72" height="14" rx="3" fill="rgba(0,10,25,0.85)" />
        <text x="222" y="245.5" fill="#4ade80" fontSize="6" fontFamily="sans-serif" textAnchor="middle" fontWeight="600">
          Трубопровод 19.4 км
        </text>

        {/* Layer 7: Non-main city dots */}
        {NON_MAIN_CITIES.map(city => (
          <g key={city.name}>
            <circle
              cx={city.x}
              cy={city.y}
              r={city.isCapital ? 3.5 : 2.5}
              fill={city.isCapital ? 'rgba(255,200,50,0.9)' : 'rgba(255,255,255,0.55)'}
              stroke={city.isCapital ? 'rgba(255,200,50,0.4)' : 'rgba(255,255,255,0.2)'}
              strokeWidth="0.8"
            />
            <text
              x={city.x + 4}
              y={city.y + 3}
              fill={city.isCapital ? 'rgba(255,220,80,0.75)' : 'rgba(255,255,255,0.45)'}
              fontSize="6.5"
              fontFamily="sans-serif"
              fontWeight={city.isCapital ? '600' : '400'}
            >
              {city.name}
            </text>
          </g>
        ))}

        {/* Layer 8: MAIN CITY — Samarkand (мкр. Ширин) pulsing marker */}
        {/* Outer pulse rings */}
        <circle cx="258" cy="213" r="8" className="shirin-pulse" />
        <circle
          cx="258"
          cy="213"
          r="12"
          fill="none"
          stroke="rgba(0,230,200,0.25)"
          strokeWidth="1"
        />
        {/* Medium ring */}
        <circle cx="258" cy="213" r="7" fill="rgba(0,230,200,0.15)" stroke="rgba(0,230,200,0.4)" strokeWidth="1" />
        {/* Inner dot */}
        <circle cx="258" cy="213" r="4" fill="#00e6c8" filter="url(#cityGlow)" />
        <circle cx="258" cy="213" r="2" fill="white" />

        {/* Label box */}
        <rect x="265" y="199" width="92" height="28" rx="4" fill="rgba(0,8,22,0.9)" stroke="rgba(0,230,200,0.35)" strokeWidth="1" />
        <text x="311" y="210.5" fill="#00e6c8" fontSize="7.5" fontFamily="sans-serif" textAnchor="middle" fontWeight="800" letterSpacing="0.5">
          САМАРКАНД
        </text>
        <text x="311" y="220" fill="rgba(0,230,200,0.6)" fontSize="5.5" fontFamily="sans-serif" textAnchor="middle">
          ⚙ мкр. Ширин · Проект водоснабжения
        </text>

        {/* Layer 9: Legend (bottom-left) */}
        <rect x="10" y="282" width="130" height="52" rx="5" fill="rgba(0,5,18,0.88)" stroke="rgba(255,255,255,0.07)" strokeWidth="0.8" />
        {/* Legend items */}
        <circle cx="22" cy="295" r="3.5" fill="#00e6c8" />
        <text x="30" y="298.5" fill="rgba(255,255,255,0.6)" fontSize="6" fontFamily="sans-serif">Объект проекта</text>

        <circle cx="22" cy="308" r="3" fill="rgba(255,200,50,0.9)" />
        <text x="30" y="311.5" fill="rgba(255,255,255,0.6)" fontSize="6" fontFamily="sans-serif">Столица / Город</text>

        <line x1="16" y1="320" x2="28" y2="320" stroke="#4ade80" strokeWidth="1.5" strokeDasharray="3 2" />
        <text x="30" y="323" fill="rgba(255,255,255,0.6)" fontSize="6" fontFamily="sans-serif">Трубопровод</text>

        <line x1="16" y1="330" x2="28" y2="330" stroke="rgba(0,200,255,0.8)" strokeWidth="1.5" />
        <text x="30" y="333" fill="rgba(255,255,255,0.6)" fontSize="6" fontFamily="sans-serif">Реки</text>

        {/* Layer 10: Scale (bottom-right) */}
        <g>
          <line x1="390" y1="326" x2="480" y2="326" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <line x1="390" y1="322" x2="390" y2="330" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <line x1="480" y1="322" x2="480" y2="330" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <text x="435" y="336" fill="rgba(255,255,255,0.3)" fontSize="6" fontFamily="sans-serif" textAnchor="middle">
            0 ─── 200 km
          </text>
        </g>

        {/* Country label */}
        <text x="200" y="260" fill="rgba(255,255,255,0.06)" fontSize="22" fontFamily="sans-serif" fontWeight="900" textAnchor="middle" letterSpacing="4">
          УЗБЕКИСТАН
        </text>
      </svg>
    </div>
  );
};

export default RegionalMap;
