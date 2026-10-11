// ═══════════════════════════════════════════════════════════════
//  PROTOTYPE 3 — Subject / Organization · Style: Data-Dense BI Dashboard
//  Compact 12-col grid, KPI cards, sortable table, sparklines, minimal
//  padding, maximum information density. Entity class: Subject (org).
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react';
import { useLocation } from 'wouter';
import { ChevronLeft, Building2, ArrowUpDown, TrendingUp, TrendingDown, Download, Filter } from 'lucide-react';

const ORG = {
  name: 'Госкомитет водного хозяйства Узбекистана',
  type: 'Государственное агентство',
  founded: 1996,
  employees: 12_400,
  budget: 340_000_000,
  objects: 1_247,
};

const KPIS = [
  { label: 'Объектов под управлением', value: '1 247', delta: +3.2, spark: [40, 42, 41, 45, 48, 47, 52] },
  { label: 'Активных проектов', value: '38', delta: +12.5, spark: [20, 22, 25, 24, 30, 34, 38] },
  { label: 'Бюджет освоен', value: '78%', delta: +5.1, spark: [55, 60, 63, 68, 70, 74, 78] },
  { label: 'Инциденты/мес', value: '14', delta: -22.0, spark: [30, 28, 24, 22, 19, 16, 14] },
  { label: 'Покрытие IoT', value: '61%', delta: +8.4, spark: [35, 40, 44, 50, 54, 57, 61] },
  { label: 'Партнёров', value: '42', delta: +2.0, spark: [38, 39, 40, 40, 41, 41, 42] },
];

type Row = { name: string; region: string; type: string; status: string; funding: number; irr: number };
const PORTFOLIO: Row[] = [
  { name: 'Чарвакское вдхр.', region: 'Ташкентская', type: 'Водохранилище', status: 'Работает', funding: 850, irr: 14.2 },
  { name: 'Smart Grid Фергана', region: 'Ферганская', type: 'Проект', status: 'Активен', funding: 120, irr: 18.5 },
  { name: 'Канал Карши', region: 'Кашкадарьинская', type: 'Канал', status: 'Внимание', funding: 210, irr: 9.8 },
  { name: 'Туямуюнский г/у', region: 'Хорезмская', type: 'Гидроузел', status: 'Работает', funding: 430, irr: 11.4 },
  { name: 'Опреснение Арал', region: 'Каракалпакстан', type: 'Опреснение', status: 'Проект', funding: 640, irr: 16.1 },
  { name: 'Насосная Аму-1', region: 'Бухарская', type: 'Насосная', status: 'Работает', funding: 95, irr: 12.7 },
];

function Sparkline({ data, up }: { data: number[]; up: boolean }) {
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 100},${28 - ((v - min) / (max - min || 1)) * 24}`).join(' ');
  return (
    <svg viewBox="0 0 100 28" className="w-full h-7" preserveAspectRatio="none">
      <polyline fill="none" stroke={up ? '#22c55e' : '#ef4444'} strokeWidth="2" points={pts} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

const statusColor = (s: string) => s === 'Работает' ? '#22c55e' : s === 'Активен' ? '#3b82f6' : s === 'Внимание' ? '#f59e0b' : '#a78bfa';

export default function SubjectBI() {
  const [, setLocation] = useLocation();
  const [sortKey, setSortKey] = useState<keyof Row>('funding');
  const [asc, setAsc] = useState(false);

  const sorted = [...PORTFOLIO].sort((a, b) => {
    const x = a[sortKey], y = b[sortKey];
    const cmp = typeof x === 'number' ? (x as number) - (y as number) : String(x).localeCompare(String(y));
    return asc ? cmp : -cmp;
  });

  const toggleSort = (k: keyof Row) => { if (k === sortKey) setAsc(!asc); else { setSortKey(k); setAsc(false); } };

  return (
    <div className="min-h-screen" style={{ background: '#0b1220', fontFamily: "'Fira Sans', system-ui, sans-serif" }}>
      {/* top bar */}
      <div className="sticky top-0 z-20 px-4 py-2.5 flex items-center justify-between"
        style={{ background: '#0f172a', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <button onClick={() => setLocation('/updates')} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
          <ChevronLeft size={14} /> Назад
        </button>
        <div className="flex items-center gap-2 text-xs">
          <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-slate-300 hover:bg-slate-700 transition-colors" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <Filter size={12} /> Фильтр
          </button>
          <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-slate-300 hover:bg-slate-700 transition-colors" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <Download size={12} /> Экспорт
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-3 sm:p-4">
        {/* org header */}
        <div className="flex items-center gap-3 mb-3 p-3 rounded-lg" style={{ background: '#111c30', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(59,130,246,0.15)' }}>
            <Building2 size={20} className="text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-white font-bold text-sm sm:text-base leading-tight truncate">{ORG.name}</h1>
            <div className="flex gap-3 text-[11px] text-slate-400 mt-0.5 flex-wrap">
              <span>{ORG.type}</span><span>Осн. {ORG.founded}</span>
              <span>{ORG.employees.toLocaleString()} сотр.</span>
              <span>${(ORG.budget / 1e6).toFixed(0)}M/год</span>
            </div>
          </div>
        </div>

        {/* KPI grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-3">
          {KPIS.map((k) => (
            <div key={k.label} className="p-2.5 rounded-lg" style={{ background: '#111c30', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="text-[10px] text-slate-400 leading-tight mb-1 h-6">{k.label}</div>
              <div className="flex items-end justify-between">
                <span className="text-lg font-bold text-white leading-none">{k.value}</span>
                <span className="flex items-center gap-0.5 text-[10px] font-semibold" style={{ color: k.delta >= 0 ? '#22c55e' : '#ef4444' }}>
                  {k.delta >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}{Math.abs(k.delta)}%
                </span>
              </div>
              <Sparkline data={k.spark} up={k.delta >= 0} />
            </div>
          ))}
        </div>

        {/* portfolio table */}
        <div className="rounded-lg overflow-hidden" style={{ background: '#111c30', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="px-3 py-2 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <span className="text-xs font-semibold text-white">Портфель объектов · {PORTFOLIO.length}</span>
            <span className="text-[10px] text-slate-500">клик по заголовку — сортировка</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-400 text-left" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  {([['name', 'Название'], ['region', 'Регион'], ['type', 'Тип'], ['status', 'Статус'], ['funding', '$M'], ['irr', 'IRR %']] as [keyof Row, string][]).map(([k, l]) => (
                    <th key={k} onClick={() => toggleSort(k)}
                      className="px-3 py-2 font-medium cursor-pointer hover:text-white transition-colors select-none whitespace-nowrap">
                      <span className="inline-flex items-center gap-1">{l}<ArrowUpDown size={9} className={sortKey === k ? 'text-blue-400' : 'text-slate-600'} /></span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((r, i) => (
                  <tr key={r.name} className="hover:bg-white/[0.03] transition-colors cursor-pointer"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                    <td className="px-3 py-2 text-white font-medium whitespace-nowrap">{r.name}</td>
                    <td className="px-3 py-2 text-slate-400 whitespace-nowrap">{r.region}</td>
                    <td className="px-3 py-2 text-slate-400 whitespace-nowrap">{r.type}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium"
                        style={{ background: `${statusColor(r.status)}18`, color: statusColor(r.status) }}>
                        <span className="w-1 h-1 rounded-full" style={{ background: statusColor(r.status) }} />{r.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-white font-mono">{r.funding}</td>
                    <td className="px-3 py-2 font-mono font-semibold" style={{ color: r.irr >= 15 ? '#22c55e' : r.irr >= 10 ? '#f59e0b' : '#94a3b8' }}>{r.irr}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
