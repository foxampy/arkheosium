// ═══════════════════════════════════════════════════════════════
//  projectConfig — EntityTypeConfig for "project"
//  Reads from PROJECTS_DATA (projects-data.ts)
// ═══════════════════════════════════════════════════════════════

import type { EntityTypeConfig, EntityData } from './types';
import { PROJECTS_DATA } from '@/data/projects-data';

function formatBudget(b: any): string {
  if (b == null) return '—';
  if (typeof b === 'number') {
    if (b >= 1_000_000) return `${(b / 1_000_000).toFixed(1)} млн`;
    if (b >= 1_000) return `${(b / 1_000).toFixed(0)} тыс`;
    return String(b);
  }
  return String(b);
}

function pickProjectMilestones(p: any): { title: string; description: string }[] {
  // Real data has no "milestones" field; fall back to specific_works / objectives / expected_benefits
  const candidates: any[] =
    p.milestones ??
    p.specific_works ??
    p.objectives ??
    p.expected_benefits ??
    p.integration_benefits ??
    [];
  if (!Array.isArray(candidates)) return [];
  return candidates.map((c: any) =>
    typeof c === 'string'
      ? { title: c, description: '' }
      : { title: c.title ?? c.name ?? '—', description: c.description ?? '' },
  );
}

export const projectConfig: EntityTypeConfig = {
  typeKey: 'project',
  label: 'Проект',
  pluralLabel: 'Проекты',
  color: '#22d3ee',
  loadData(id) {
    const p: any = PROJECTS_DATA.find((x: any) => x.id === id);
    if (!p) return null;

    const title = p.name_ru ?? p.name ?? p.title ?? p.id;
    const coords = p.coordinates ?? p.location_coords;
    const location = coords
      ? {
          lat: coords.lat,
          lng: coords.lng,
          address: p.location ?? p.country ?? '',
        }
      : undefined;

    const milestones = pickProjectMilestones(p);
    const deadline = p.end_date ?? p.planned_end ?? '—';
    const teamSize = p.team_size ?? p.teamSize ?? p.staff_count ?? '—';
    const budget = formatBudget(p.budget ?? p.budget_total);
    const budgetUnit = p.budget_currency ?? 'USD';

    const related: EntityData['related'] = [];
    (p.related_objects ?? []).forEach((rid: string) =>
      related.push({ type: 'object', id: rid, title: rid }),
    );
    (p.related_subjects ?? []).forEach((rid: string) =>
      related.push({ type: 'subject', id: rid, title: rid }),
    );
    (p.related_projects ?? []).forEach((rid: string) =>
      related.push({ type: 'project', id: rid, title: rid }),
    );

    return {
      id: p.id,
      title,
      type: 'project',
      status: p.status_label ?? p.status ?? 'Активный',
      coverImage: p.image_url ?? p.coverImage ?? p.image,
      description: p.description_ru ?? p.description ?? '',
      location,
      kpis: [
        { label: 'Бюджет', value: budget, unit: budgetUnit },
        { label: 'Прогресс', value: p.progress ?? p.completion_pct ?? '—', unit: '%' },
        { label: 'Срок', value: deadline },
        { label: 'Команда', value: teamSize },
      ],
      documents: p.documents ?? [],
      related,
      extra: { milestones, stack: p.stack ?? [], financing: p.financing ?? null },
    };
  },
  renderTypeSpecific(data) {
    const milestones = (data.extra?.milestones ?? []) as { title: string; description: string }[];
    if (milestones.length === 0) return null;
    return (
      <section>
        <h2 className="text-2xl font-bold mb-4">Этапы проекта</h2>
        <ol className="space-y-3">
          {milestones.map((m, i) => (
            <li
              key={i}
              className="flex gap-4 items-start p-4 bg-slate-900/50 border border-slate-800 rounded"
            >
              <span className="text-cyan-400 font-bold text-lg shrink-0">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <div className="font-semibold">{m.title}</div>
                {m.description && (
                  <div className="text-sm text-slate-400 mt-1">{m.description}</div>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>
    );
  },
};
