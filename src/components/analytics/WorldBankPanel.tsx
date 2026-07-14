// src/components/analytics/WorldBankPanel.tsx
// World Bank open data comparison for 5 Central Asian countries
// Uses getCARegionalWaterData() → WorldBankWaterData[]

import { useEffect, useState } from 'react';
import { Globe, Loader2, RefreshCw, AlertTriangle } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, Cell,
} from 'recharts';
import { getCARegionalWaterData, type WorldBankWaterData } from '@/services/openDataAPI';

// ─── Constants ─────────────────────────────────────────────────────────────

const COUNTRY_COLORS: Record<string, string> = {
  UZ: '#00e6c8',
  KZ: '#60a5fa',
  KG: '#a78bfa',
  TJ: '#f59e0b',
  TM: '#f97316',
};

const COUNTRY_NAMES: Record<string, string> = {
  UZ: 'Узбекистан',
  KZ: 'Казахстан',
  KG: 'Кыргызстан',
  TJ: 'Таджикистан',
  TM: 'Туркменистан',
};

interface MetricDef {
  key: keyof WorldBankWaterData;
  label: string;
  unit: string;
  description: string;
}

const METRICS: MetricDef[] = [
  { key: 'freshwater_withdrawal_pct', label: 'Водозабор', unit: '% от ВИВ', description: 'Общий забор пресной воды как % от возобновляемых внутренних водных ресурсов' },
  { key: 'agricultural_water_pct',    label: 'С/х водозабор', unit: '%',      description: '% водозабора, используемого сельским хозяйством' },
  { key: 'access_safe_water_pct',     label: 'Доступ к воде', unit: '%',      description: 'Население с доступом к безопасной питьевой воде' },
  { key: 'water_productivity_usd_m3', label: 'Водопродуктивность', unit: '$/м³', description: 'ВВП на единицу использованной воды (постоянные $2015)' },
];

// ─── Main Component ─────────────────────────────────────────────────────────

export function WorldBankPanel() {
  const [data, setData] = useState<WorldBankWaterData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<MetricDef>(METRICS[0]);

  async function load() {
    setLoading(true);
    setError(false);
    try {
      const result = await getCARegionalWaterData();
      setData(result);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  // Prepare bar chart data for selected metric
  const barData = data
    .map(d => ({
      name: COUNTRY_NAMES[d.country_code] ?? d.country_code,
      code: d.country_code,
      value: (d[selectedMetric.key] as number | null) ?? 0,
      color: COUNTRY_COLORS[d.country_code] ?? '#60a5fa',
    }))
    .filter(d => d.value > 0)
    .sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe size={16} style={{ color: '#00e6c8' }} />
          <h3 className="font-bold text-white/80 text-sm uppercase tracking-widest">
            Сравнение ЦА · World Bank Open Data
          </h3>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full cursor-pointer"
          style={{ background: 'rgba(0,230,200,0.1)', color: '#00e6c8', border: '1px solid rgba(0,230,200,0.2)' }}
        >
          {loading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
          Обновить
        </button>
      </div>

      {loading ? (
        <div className="rounded-2xl p-10 flex items-center justify-center gap-3"
          style={{ background: 'rgba(0,8,30,0.7)', border: '1px solid rgba(0,230,200,0.1)' }}>
          <Loader2 size={20} className="animate-spin" style={{ color: '#00e6c8' }} />
          <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Загрузка данных World Bank...
          </span>
        </div>
      ) : error ? (
        <div className="rounded-2xl p-8 flex items-center gap-3"
          style={{ background: 'rgba(0,8,30,0.7)', border: '1px solid rgba(255,190,50,0.2)' }}>
          <AlertTriangle size={20} style={{ color: '#fbbf24' }} />
          <div>
            <div className="text-sm font-semibold" style={{ color: '#fbbf24' }}>Данные World Bank недоступны</div>
            <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Проверьте интернет-соединение или повторите попытку
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Country legend */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(COUNTRY_NAMES).map(([code, name]) => (
              <div key={code} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs"
                style={{
                  background: `${COUNTRY_COLORS[code]}15`,
                  border: `1px solid ${COUNTRY_COLORS[code]}30`,
                  color: COUNTRY_COLORS[code],
                }}>
                <div className="w-2 h-2 rounded-full" style={{ background: COUNTRY_COLORS[code] }} />
                {name}
              </div>
            ))}
          </div>

          {/* Metric selector */}
          <div className="flex flex-wrap gap-2">
            {METRICS.map(m => (
              <button
                key={String(m.key)}
                onClick={() => setSelectedMetric(m)}
                className="text-xs px-3 py-1.5 rounded-full cursor-pointer transition"
                style={{
                  background: selectedMetric.key === m.key ? 'rgba(0,230,200,0.2)' : 'rgba(0,230,200,0.05)',
                  border: `1px solid ${selectedMetric.key === m.key ? 'rgba(0,230,200,0.5)' : 'rgba(0,230,200,0.1)'}`,
                  color: selectedMetric.key === m.key ? '#00e6c8' : 'rgba(255,255,255,0.5)',
                }}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Bar chart */}
          <div className="rounded-2xl p-4"
            style={{ background: 'rgba(0,8,30,0.7)', border: '1px solid rgba(0,230,200,0.1)' }}>
            <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {selectedMetric.label} ({selectedMetric.unit})
            </div>
            <div className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {selectedMetric.description}
            </div>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={barData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} unit={selectedMetric.unit.length < 4 ? selectedMetric.unit : ''} />
                  <Tooltip
                    contentStyle={{ background: '#000c24', border: '1px solid rgba(0,230,200,0.2)', borderRadius: 10 }}
                    labelStyle={{ color: '#00e6c8' }}
                    itemStyle={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                    formatter={(val: number) => [`${val.toFixed(2)} ${selectedMetric.unit}`, selectedMetric.label]}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {barData.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Нет данных для отображения. Данные World Bank обновляются ежегодно.
              </div>
            )}
          </div>

          {/* Data table */}
          {data.length > 0 && (
            <div className="rounded-2xl overflow-hidden"
              style={{ background: 'rgba(0,8,30,0.7)', border: '1px solid rgba(0,230,200,0.1)' }}>
              <div className="px-4 py-3 text-xs font-semibold uppercase tracking-widest"
                style={{ color: 'rgba(255,255,255,0.4)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                📊 Сводная таблица (последние данные World Bank)
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs" style={{ minWidth: 560 }}>
                  <thead>
                    <tr style={{ background: 'rgba(0,230,200,0.04)' }}>
                      <th className="px-4 py-2 text-left font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>Страна</th>
                      {METRICS.map(m => (
                        <th key={String(m.key)} className="px-3 py-2 text-right font-semibold text-xs"
                          style={{ color: 'rgba(255,255,255,0.4)' }}>
                          {m.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((country, idx) => (
                      <tr key={country.country_code}
                        style={{
                          borderTop: '1px solid rgba(255,255,255,0.04)',
                          background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                        }}>
                        <td className="px-4 py-2.5 font-semibold flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ background: COUNTRY_COLORS[country.country_code] ?? '#60a5fa' }} />
                          <span style={{ color: COUNTRY_COLORS[country.country_code] ?? '#fff' }}>
                            {COUNTRY_NAMES[country.country_code] ?? country.country_code}
                          </span>
                        </td>
                        {METRICS.map(m => {
                          const val = country[m.key] as number | null;
                          return (
                            <td key={String(m.key)} className="px-3 py-2.5 text-right tabular-nums"
                              style={{ color: val != null ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.2)' }}>
                              {val != null ? `${val.toFixed(1)} ${m.unit}` : '—'}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-2 text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
                Источник: World Bank Open Data API · data.worldbank.org · Обновляется ежегодно
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
