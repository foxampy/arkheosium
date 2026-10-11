import { useEffect, useRef, useState } from 'react';
import Graph from 'graphology';
import Sigma from 'sigma';
import { useLocation } from 'wouter';

// ── Graph layout helpers ───────────────────────────────────────
function polar(angle: number, r: number) {
  return { x: Math.cos(angle) * r, y: Math.sin(angle) * r };
}

// ── Static graph definition ────────────────────────────────────
interface NodeDef { id: string; label: string; color: string; size: number; x: number; y: number }
interface EdgeDef { source: string; target: string; color: string; size: number }

function buildGraphData(): { nodes: NodeDef[]; edges: EdgeDef[] } {
  const nodes: NodeDef[] = [];
  const edges: EdgeDef[] = [];

  // ── Core node ──
  nodes.push({ id: 'core', label: 'ARKHEOSIUM', color: '#00d4ff', size: 24, x: 0, y: 0 });

  // ── Module ring at r=5 ──
  const MODULES = [
    { id: 'water',     label: 'Водные ресурсы', color: '#00d4ff', angle: 0 },
    { id: 'energy',    label: 'Энергетика',     color: '#00e6c8', angle: Math.PI * 1/4 },
    { id: 'transport', label: 'Транспорт',       color: '#3b82f6', angle: Math.PI * 2/4 },
    { id: 'agro',      label: 'АгроПром',        color: '#4ade80', angle: Math.PI * 3/4 },
    { id: 'cities',    label: 'Города',          color: '#a78bfa', angle: Math.PI * 4/4 },
    { id: 'climate',   label: 'Климат',          color: '#06b6d4', angle: Math.PI * 5/4 },
    { id: 'ai',        label: 'ИИ / Данные',     color: '#7c3aed', angle: Math.PI * 6/4 },
    { id: 'society',   label: 'Общество',        color: '#f472b6', angle: Math.PI * 7/4 },
  ] as const;

  const R = 5;
  MODULES.forEach(({ id, label, color, angle }) => {
    const pos = polar(angle, R);
    nodes.push({ id, label, color, size: 14, ...pos });
    edges.push({ source: 'core', target: id, color: `${color}55`, size: 1.5 });
  });

  // ── Sub-nodes per module ──
  const SUB_DEFS = [
    { id: 'aral',    parent: 'water',     label: 'Аральское море',   color: '#00d4ff' },
    { id: 'amu',     parent: 'water',     label: 'Амударья',         color: '#00d4ff' },
    { id: 'syr',     parent: 'water',     label: 'Сырдарья',        color: '#00d4ff' },
    { id: 'karakum', parent: 'water',     label: 'Каракум. канал',  color: '#f59e0b' },
    { id: 'nurek',   parent: 'energy',    label: 'Нурекская ГЭС',  color: '#00e6c8' },
    { id: 'charvak', parent: 'energy',    label: 'Чарвак ГЭС',     color: '#00e6c8' },
    { id: 'silk',    parent: 'transport', label: 'Шёлковый путь',  color: '#3b82f6' },
    { id: 'rail',    parent: 'transport', label: 'Ж/Д сеть ЦА',   color: '#3b82f6' },
    { id: 'irrig',   parent: 'agro',      label: 'Ирригация',      color: '#4ade80' },
    { id: 'cotton',  parent: 'agro',      label: 'Хлопок',         color: '#4ade80' },
    { id: 'tashkent',parent: 'cities',    label: 'Ташкент',        color: '#a78bfa' },
    { id: 'almaty',  parent: 'cities',    label: 'Алматы',         color: '#a78bfa' },
    { id: 'bishkek', parent: 'cities',    label: 'Бишкек',         color: '#a78bfa' },
    { id: 'dushanbe',parent: 'cities',    label: 'Душанбе',        color: '#a78bfa' },
    { id: 'desert',  parent: 'climate',   label: 'Опустынивание',  color: '#f59e0b' },
    { id: 'glacier', parent: 'climate',   label: 'Ледники',        color: '#06b6d4' },
    { id: 'llm',     parent: 'ai',        label: 'LLM-агенты',    color: '#7c3aed' },
    { id: 'iot',     parent: 'ai',        label: 'IoT-сеть',      color: '#7c3aed' },
    { id: 'twin',    parent: 'ai',        label: 'Цифр. двойники',color: '#7c3aed' },
    { id: 'gov',     parent: 'society',   label: 'Регуляторика',  color: '#f472b6' },
    { id: 'invest_n',parent: 'society',   label: 'Инвестиции',    color: '#fbbf24' },
  ];

  // Group sub-nodes by parent for spread positioning
  const byParent: Record<string, typeof SUB_DEFS> = {};
  SUB_DEFS.forEach(s => { (byParent[s.parent] ??= []).push(s); });

  const parentAngles: Record<string, number> = {};
  MODULES.forEach(m => { parentAngles[m.id] = m.angle; });

  const SR = 3.5;

  Object.entries(byParent).forEach(([parentId, children]) => {
    const pAngle = parentAngles[parentId];
    const spread = 0.65;
    children.forEach((child, i) => {
      const offset = children.length === 1 ? 0 : spread * (i / (children.length - 1) - 0.5);
      const pos = polar(pAngle + offset, R + SR);
      nodes.push({ id: child.id, label: child.label, color: child.color, size: 9, ...pos });
      edges.push({ source: parentId, target: child.id, color: `${child.color}40`, size: 1 });
    });
  });

  // ── Cross-module relationships ──
  const cross: [string, string, string][] = [
    ['aral',    'amu',      'rgba(0,212,255,0.3)'],
    ['amu',     'nurek',    'rgba(0,230,200,0.3)'],
    ['syr',     'charvak',  'rgba(0,230,200,0.3)'],
    ['karakum', 'irrig',    'rgba(245,158,11,0.3)'],
    ['charvak', 'tashkent', 'rgba(124,58,237,0.3)'],
    ['iot',     'nurek',    'rgba(124,58,237,0.3)'],
    ['llm',     'twin',     'rgba(124,58,237,0.4)'],
    ['desert',  'aral',     'rgba(245,158,11,0.3)'],
    ['glacier', 'amu',      'rgba(6,182,212,0.3)'],
    ['irrig',   'aral',     'rgba(0,212,255,0.25)'],
    ['twin',    'tashkent', 'rgba(124,58,237,0.25)'],
    ['gov',     'invest_n', 'rgba(244,114,182,0.3)'],
  ];
  cross.forEach(([source, target, color]) =>
    edges.push({ source, target, color, size: 0.8 }),
  );

  return { nodes, edges };
}

// ── Page component ─────────────────────────────────────────────
export default function KnowledgeGraphPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const { nodes, edges } = buildGraphData();
    const graph = new Graph({ multi: false });

    nodes.forEach(({ id, ...attrs }) => graph.addNode(id, attrs));
    edges.forEach(({ source, target, ...attrs }) => {
      try { graph.addEdge(source, target, attrs); } catch { /* skip duplicates */ }
    });

    const renderer = new Sigma(graph, container, {
      renderEdgeLabels: false,
      defaultNodeColor: '#00d4ff',
      defaultEdgeColor: 'rgba(0,212,255,0.2)',
      labelColor: { color: '#ffffff' },
      labelFont: 'Inter, system-ui, sans-serif',
      labelSize: 11,
      labelWeight: '600',
      labelThreshold: 7,
      minCameraRatio: 0.15,
      maxCameraRatio: 5,
    } as ConstructorParameters<typeof Sigma>[2]);

    renderer.on('enterNode', ({ node }) => {
      const attrs = graph.getNodeAttributes(node);
      setHoveredLabel(attrs.label as string);
    });
    renderer.on('leaveNode', () => setHoveredLabel(null));

    return () => renderer.kill();
  }, []);

  return (
    <div
      className="fixed inset-0"
      style={{ background: 'radial-gradient(ellipse at 50% 40%, #020d22 0%, #010810 100%)' }}
    >
      {/* Sigma canvas container */}
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100%', position: 'relative' }}
      />

      {/* Header overlay */}
      <div className="absolute top-16 inset-x-0 flex flex-col items-center pointer-events-none select-none">
        <p className="text-xs tracking-[0.35em] uppercase mb-1.5" style={{ color: 'rgba(124,58,237,0.6)' }}>
          Knowledge Graph
        </p>
        <h1 className="text-2xl font-black tracking-[0.12em]" style={{ color: 'rgba(255,255,255,0.92)' }}>
          Граф знаний
        </h1>
        <p className="text-sm mt-1 tracking-wide" style={{ color: 'rgba(255,255,255,0.35)' }}>
          {hoveredLabel ?? 'Прокрути · Тяни · Наведи на узел'}
        </p>
      </div>

      {/* Legend */}
      <div
        className="absolute bottom-6 left-4 flex flex-col gap-1.5 pointer-events-none select-none"
        style={{
          background: 'rgba(5,13,26,0.82)',
          border: '1px solid rgba(0,212,255,0.12)',
          backdropFilter: 'blur(16px)',
          borderRadius: 12,
          padding: '10px 14px',
        }}
      >
        <p className="text-[10px] uppercase tracking-wider font-semibold mb-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Легенда
        </p>
        {[
          { color: '#00d4ff', label: 'Инфраструктура' },
          { color: '#7c3aed', label: 'ИИ / Данные' },
          { color: '#4ade80', label: 'АгроПром / Экология' },
          { color: '#a78bfa', label: 'Города / Общество' },
          { color: '#00e6c8', label: 'Энергетика' },
          { color: '#f59e0b', label: 'Климат / Риски' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="absolute bottom-6 right-4 flex flex-col gap-2 pointer-events-auto">
        <button
          onClick={() => setLocation('/')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
          style={{
            background: 'rgba(0,212,255,0.1)',
            border: '1px solid rgba(0,212,255,0.28)',
            color: '#00d4ff',
            backdropFilter: 'blur(14px)',
          }}
        >
          🌍&nbsp;Глобус
        </button>
        <button
          onClick={() => setLocation('/map')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
          style={{
            background: 'rgba(0,212,255,0.1)',
            border: '1px solid rgba(0,212,255,0.28)',
            color: '#00d4ff',
            backdropFilter: 'blur(14px)',
          }}
        >
          🗺&nbsp;Карта
        </button>
      </div>
    </div>
  );
}
