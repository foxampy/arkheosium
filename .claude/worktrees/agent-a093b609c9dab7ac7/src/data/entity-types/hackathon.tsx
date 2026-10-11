// ═══════════════════════════════════════════════════════════════
//  hackathonConfig — EntityTypeConfig for "hackathon"
//  Reads from HACKATHONS_DATA fixture
// ═══════════════════════════════════════════════════════════════

import type { EntityTypeConfig } from './types';
import { HACKATHONS_MAP } from '@/data/hackathon-data';

export const hackathonConfig: EntityTypeConfig = {
  typeKey: 'hackathon',
  label: 'Хакатон',
  pluralLabel: 'Хакатоны',
  color: '#f97316',
  loadData(id) {
    const h = HACKATHONS_MAP[id];
    if (!h) return null;
    const dateRange =
      h.date_from === h.date_to ? h.date_from : `${h.date_from} → ${h.date_to}`;
    return {
      id: h.id,
      title: h.name,
      type: 'hackathon',
      status: h.status,
      coverImage: h.coverImage,
      description: h.description,
      location: h.location,
      kpis: [
        { label: 'Дата', value: dateRange },
        { label: 'Место', value: h.venue },
        { label: 'Треки', value: h.tracks.length },
        { label: 'Призы', value: h.prizes_summary },
      ],
      documents: h.documents,
      related: h.related,
      extra: { tracks: h.tracks, mentors: h.mentors, prizes: h.prizes },
    };
  },
  renderTypeSpecific(data) {
    const tracks = (data.extra?.tracks ?? []) as {
      name: string;
      description: string;
    }[];
    const mentors = (data.extra?.mentors ?? []) as {
      name: string;
      role: string;
      affiliation?: string;
    }[];
    const prizes = (data.extra?.prizes ?? []) as {
      place: string;
      reward: string;
    }[];
    if (tracks.length === 0 && mentors.length === 0 && prizes.length === 0) return null;
    return (
      <>
        {tracks.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Треки</h2>
            <div className="grid md:grid-cols-3 gap-3">
              {tracks.map((t, i) => (
                <div
                  key={i}
                  className="p-4 bg-slate-900/50 border border-slate-800 rounded"
                >
                  <div className="font-semibold text-orange-300">{t.name}</div>
                  <div className="text-sm text-slate-400 mt-2 leading-relaxed">
                    {t.description}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        {mentors.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Менторы</h2>
            <div className="grid md:grid-cols-2 gap-3">
              {mentors.map((m, i) => (
                <div
                  key={i}
                  className="p-4 bg-slate-900/50 border border-slate-800 rounded"
                >
                  <div className="font-semibold">{m.name}</div>
                  <div className="text-sm text-orange-300 mt-1">{m.role}</div>
                  {m.affiliation && (
                    <div className="text-xs text-slate-500 mt-1">{m.affiliation}</div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
        {prizes.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Призы</h2>
            <ol className="space-y-2">
              {prizes.map((p, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-800 rounded"
                >
                  <div className="font-semibold text-orange-300">{p.place}</div>
                  <div className="text-slate-200">{p.reward}</div>
                </li>
              ))}
            </ol>
          </section>
        )}
      </>
    );
  },
};
