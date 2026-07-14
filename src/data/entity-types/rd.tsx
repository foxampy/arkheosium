// ═══════════════════════════════════════════════════════════════
//  rdConfig — EntityTypeConfig for "rd" (R&D initiatives)
//  Reads from RD_DATA fixture
// ═══════════════════════════════════════════════════════════════

import type { EntityTypeConfig } from './types';
import { RD_MAP } from '@/data/rd-data';

function formatUsd(v?: number): string {
  if (v == null) return '—';
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)} млн`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)} тыс`;
  return `$${v}`;
}

export const rdConfig: EntityTypeConfig = {
  typeKey: 'rd',
  label: 'R&D',
  pluralLabel: 'R&D',
  color: '#34d399',
  loadData(id) {
    const r = RD_MAP[id];
    if (!r) return null;
    return {
      id: r.id,
      title: r.name,
      type: 'rd',
      status: r.status,
      coverImage: r.coverImage,
      description: r.description,
      location: r.location,
      kpis: [
        { label: 'Лаборатория', value: r.laboratory },
        { label: 'Грант', value: formatUsd(r.grant_total_usd) },
        { label: 'Публикации', value: r.publications_count },
        { label: 'Стадия', value: r.stage_label },
      ],
      documents: r.documents,
      related: r.related,
      extra: { researchers: r.researchers, grants: r.grants },
    };
  },
  renderTypeSpecific(data) {
    const researchers = (data.extra?.researchers ?? []) as {
      name: string;
      role: string;
      affiliation?: string;
    }[];
    const grants = (data.extra?.grants ?? []) as {
      funder: string;
      amount_usd: number;
      year: number;
      program?: string;
    }[];
    if (researchers.length === 0 && grants.length === 0) return null;
    return (
      <>
        {researchers.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Исследовательская команда</h2>
            <div className="grid md:grid-cols-2 gap-3">
              {researchers.map((p, i) => (
                <div
                  key={i}
                  className="p-4 bg-slate-900/50 border border-slate-800 rounded"
                >
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-sm text-cyan-300 mt-1">{p.role}</div>
                  {p.affiliation && (
                    <div className="text-xs text-slate-500 mt-1">{p.affiliation}</div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
        {grants.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Гранты и финансирование</h2>
            <div className="space-y-2">
              {grants.map((g, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-800 rounded"
                >
                  <div>
                    <div className="font-semibold">{g.funder}</div>
                    {g.program && (
                      <div className="text-sm text-slate-400 mt-0.5">
                        {g.program}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-cyan-300">
                      {formatUsd(g.amount_usd)}
                    </div>
                    <div className="text-xs text-slate-500">{g.year}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </>
    );
  },
};
