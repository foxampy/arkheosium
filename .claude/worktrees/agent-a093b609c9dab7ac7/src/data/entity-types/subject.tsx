// ═══════════════════════════════════════════════════════════════
//  subjectConfig — EntityTypeConfig for "subject"
//  Reads from SUBJECTS_DATA
// ═══════════════════════════════════════════════════════════════

import type { EntityTypeConfig, EntityData } from './types';
import { SUBJECTS_DATA } from '@/data/subjects-data';

export const subjectConfig: EntityTypeConfig = {
  typeKey: 'subject',
  label: 'Субъект',
  pluralLabel: 'Субъекты',
  color: '#a78bfa',
  loadData(id) {
    const s: any = SUBJECTS_DATA.find((x: any) => x.id === id);
    if (!s) return null;

    const title = s.name_ru ?? s.name ?? s.id;
    const coords = s.coordinates;
    const location = coords
      ? {
          lat: coords.lat,
          lng: coords.lng,
          address: [s.address, s.location, s.country].filter(Boolean).join(', '),
        }
      : undefined;

    const projectsCount =
      (s.key_projects?.length ?? 0) + (s.active_projects?.length ?? 0);

    const contacts = [s.phone, s.email, s.website].filter(Boolean);

    const related: EntityData['related'] = [];
    (s.key_projects ?? []).forEach((rid: string) =>
      related.push({ type: 'project', id: rid, title: rid }),
    );
    (s.managed_objects ?? []).forEach((rid: string) =>
      related.push({ type: 'object', id: rid, title: rid }),
    );
    (s.partnerships ?? []).forEach((rid: string) =>
      related.push({ type: 'subject', id: rid, title: rid }),
    );

    return {
      id: s.id,
      title,
      type: 'subject',
      status: s.type_label ?? s.status ?? 'Организация',
      coverImage: s.image_url ?? s.logo_url,
      description: s.description ?? '',
      location,
      kpis: [
        { label: 'Тип организации', value: s.type_label ?? s.type ?? '—' },
        { label: 'Зона ответственности', value: s.region ?? s.country ?? '—' },
        { label: 'Проекты', value: projectsCount || '—' },
        { label: 'Контакты', value: contacts.length },
      ],
      documents: s.documents ?? [],
      related,
      extra: {
        phone: s.phone,
        email: s.email,
        website: s.website,
        address: s.address,
        staff_count: s.staff_count,
        founded_year: s.founded_year,
        responsibilities: s.responsibilities ?? [],
        structure: s.structure ?? [],
      },
    };
  },
  renderTypeSpecific(data) {
    const x = data.extra ?? {};
    const hasContacts = x.phone || x.email || x.website || x.address;
    const hasResp = Array.isArray(x.responsibilities) && x.responsibilities.length > 0;
    if (!hasContacts && !hasResp) return null;
    return (
      <>
        {hasContacts && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Контакты</h2>
            <div className="grid md:grid-cols-2 gap-3">
              {x.address && (
                <div className="p-4 bg-slate-900/50 border border-slate-800 rounded">
                  <div className="text-xs text-slate-400 uppercase tracking-wider">Адрес</div>
                  <div className="mt-1">{x.address}</div>
                </div>
              )}
              {x.phone && (
                <div className="p-4 bg-slate-900/50 border border-slate-800 rounded">
                  <div className="text-xs text-slate-400 uppercase tracking-wider">Телефон</div>
                  <a href={`tel:${x.phone}`} className="mt-1 text-cyan-300 block">{x.phone}</a>
                </div>
              )}
              {x.email && (
                <div className="p-4 bg-slate-900/50 border border-slate-800 rounded">
                  <div className="text-xs text-slate-400 uppercase tracking-wider">E-mail</div>
                  <a href={`mailto:${x.email}`} className="mt-1 text-cyan-300 block">{x.email}</a>
                </div>
              )}
              {x.website && (
                <div className="p-4 bg-slate-900/50 border border-slate-800 rounded">
                  <div className="text-xs text-slate-400 uppercase tracking-wider">Сайт</div>
                  <div className="mt-1 text-cyan-300">{x.website}</div>
                </div>
              )}
            </div>
          </section>
        )}
        {hasResp && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Зона ответственности</h2>
            <ul className="space-y-2">
              {x.responsibilities.map((r: string, i: number) => (
                <li
                  key={i}
                  className="flex gap-3 p-3 bg-slate-900/50 border border-slate-800 rounded"
                >
                  <span className="text-cyan-400 mt-0.5">▸</span>
                  <span className="text-slate-200">{r}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </>
    );
  },
};
