// ═══════════════════════════════════════════════════════════════
//  contestConfig — EntityTypeConfig for "contest"
//  Reads from CONTESTS_DATA fixture
// ═══════════════════════════════════════════════════════════════

import type { EntityTypeConfig } from './types';
import { CONTESTS_MAP } from '@/data/contest-data';

function formatUsd(v?: number): string {
  if (v == null) return '—';
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)} млн`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)} тыс`;
  return `$${v}`;
}

export const contestConfig: EntityTypeConfig = {
  typeKey: 'contest',
  label: 'Конкурс',
  pluralLabel: 'Конкурсы',
  color: '#fbbf24',
  loadData(id) {
    const c = CONTESTS_MAP[id];
    if (!c) return null;
    return {
      id: c.id,
      title: c.name,
      type: 'contest',
      status: c.status,
      coverImage: c.coverImage,
      description: c.description,
      location: c.location,
      kpis: [
        { label: 'Призовой фонд', value: formatUsd(c.prize_fund_usd) },
        { label: 'Дедлайн', value: c.deadline },
        { label: 'Жюри', value: c.jury.length, unit: 'чел.' },
        { label: 'Заявок', value: c.applications_count },
      ],
      documents: c.documents,
      related: c.related,
      extra: { criteria: c.criteria, jury: c.jury, prize_fund_label: c.prize_fund_label },
    };
  },
  renderTypeSpecific(data) {
    const criteria = (data.extra?.criteria ?? []) as {
      title: string;
      weight_pct: number;
      description: string;
    }[];
    const jury = (data.extra?.jury ?? []) as {
      name: string;
      role: string;
      affiliation?: string;
    }[];
    if (criteria.length === 0 && jury.length === 0) return null;
    return (
      <>
        {criteria.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Критерии оценки</h2>
            <div className="space-y-3">
              {criteria.map((c, i) => (
                <div
                  key={i}
                  className="p-4 bg-slate-900/50 border border-slate-800 rounded"
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <div className="font-semibold">{c.title}</div>
                    <div className="text-amber-300 font-bold whitespace-nowrap">
                      {c.weight_pct}%
                    </div>
                  </div>
                  <div className="text-sm text-slate-400 mt-2">{c.description}</div>
                  <div className="mt-2 h-1 bg-slate-800 rounded overflow-hidden">
                    <div
                      className="h-full bg-amber-400"
                      style={{ width: `${c.weight_pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        {jury.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Жюри</h2>
            <div className="grid md:grid-cols-2 gap-3">
              {jury.map((j, i) => (
                <div
                  key={i}
                  className="p-4 bg-slate-900/50 border border-slate-800 rounded"
                >
                  <div className="font-semibold">{j.name}</div>
                  <div className="text-sm text-amber-300 mt-1">{j.role}</div>
                  {j.affiliation && (
                    <div className="text-xs text-slate-500 mt-1">{j.affiliation}</div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </>
    );
  },
};
