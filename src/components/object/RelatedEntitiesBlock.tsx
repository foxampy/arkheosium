/**
 * RelatedEntitiesBlock — связи объекта с субъектами и проектами корпуса.
 *
 * Объект хранит только идентификаторы (`SUBJ-UZ-OG-001`, `OG-PJ-UZ-002`).
 * Здесь они разрешаются в реальные записи корпуса и получают переход.
 *
 * Отдельно про битые связи. Идентификатор, которого нет в корпусе, не
 * скрывается и не роняет страницу: он показывается как есть, с пометкой,
 * что запись не найдена. Разрыв в графе — такой же факт, как и сама связь,
 * и прятать его значило бы показывать корпус полнее, чем он есть.
 */

import { Link } from 'wouter';
import { Link2, Building2, FolderKanban, HelpCircle, ChevronRight } from 'lucide-react';

import { SUBJECTS_DATA } from '@/data/subjects-data';
import { PROJECTS_DATA } from '@/data/projects-data';
import { OILGAS_ALL_ITEMS } from '@/data/oilgas/catalog';

interface Resolved {
  id: string;
  title: string;
  /** Подпись, откуда взята запись (тип субъекта, раздел каталога). */
  note?: string;
  /** null — записи в корпусе нет, перехода не будет. */
  href: string | null;
}

function resolveSubject(id: string): Resolved {
  const s = SUBJECTS_DATA.find(x => x.id === id);
  if (!s) return { id, title: id, href: null };
  return {
    id,
    title: s.name_ru || s.name || id,
    note: s.type_label,
    // Страница субъекта — единственный маршрут, который действительно
    // разрешает идентификаторы вида SUBJ-*: OrganizationDetailPage читает
    // организации из Supabase и такие id не находит.
    href: `/hub/subject/${id}`,
  };
}

function resolveProject(id: string): Resolved {
  const p = PROJECTS_DATA.find(x => x.id === id);
  if (p) {
    return {
      id,
      title: p.name_ru || p.name || id,
      note: p.type_label,
      href: `/hub/project/${id}`,
    };
  }
  // Проекты нефтегазового модуля живут в каталоге «Газнефть» и своей
  // страницы детали не имеют — ведём в модуль, а не в несуществующий маршрут.
  const c = OILGAS_ALL_ITEMS.find(x => x.id === id);
  if (c) {
    return { id, title: c.title, note: 'Каталог «Газнефть»', href: '/oilgas' };
  }
  return { id, title: id, href: null };
}

function EntityRow({ item, icon: Icon, accent }: { item: Resolved; icon: React.ElementType; accent: string }) {
  const body = (
    <>
      <Icon size={14} style={{ color: item.href ? accent : 'rgba(148,163,184,0.6)' }} className="flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <div className={`text-sm font-semibold truncate ${item.href ? 'text-white/85' : 'text-white/55'}`}>
          {item.title}
        </div>
        <div className="text-white/30 text-xs truncate">
          {item.href ? (
            <>
              {item.id}
              {item.note ? ` · ${item.note}` : ''}
            </>
          ) : (
            'записи с таким идентификатором в корпусе нет'
          )}
        </div>
      </div>
      {item.href ? (
        <ChevronRight size={14} className="text-white/25 flex-shrink-0" />
      ) : (
        <HelpCircle size={14} style={{ color: 'rgba(148,163,184,0.5)' }} className="flex-shrink-0" />
      )}
    </>
  );

  const style = {
    background: item.href ? 'rgba(255,255,255,0.03)' : 'rgba(148,163,184,0.05)',
    border: item.href ? `1px solid ${accent}22` : '1px dashed rgba(148,163,184,0.3)',
  } as const;

  if (!item.href) {
    return (
      <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl" style={style}>
        {body}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors hover:bg-white/[0.06]"
      style={style}
    >
      {body}
    </Link>
  );
}

interface Props {
  relatedSubjects?: unknown;
  relatedProjects?: unknown;
  accent?: string;
}

export function RelatedEntitiesBlock({ relatedSubjects, relatedProjects, accent = '#00e6c8' }: Props) {
  const subjectIds = Array.isArray(relatedSubjects) ? (relatedSubjects as unknown[]).map(String) : [];
  const projectIds = Array.isArray(relatedProjects) ? (relatedProjects as unknown[]).map(String) : [];

  // Нет полей — нет блока. Пустой массив — это заявленное отсутствие связей,
  // и оно показывается.
  if (relatedSubjects === undefined && relatedProjects === undefined) return null;

  const subjects = subjectIds.map(resolveSubject);
  const projects = projectIds.map(resolveProject);

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: 'rgba(0,6,20,0.85)', border: `1px solid ${accent}22` }}
    >
      <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
        <Link2 size={14} style={{ color: accent }} />
        Связи в корпусе
      </h3>

      <div className="space-y-4">
        {relatedSubjects !== undefined && (
          <div>
            <div className="text-white/35 text-xs font-semibold uppercase tracking-widest mb-2">
              Субъекты
            </div>
            {subjects.length === 0 ? (
              <p className="text-white/45 text-sm italic">Связанные субъекты не указаны.</p>
            ) : (
              <div className="space-y-2">
                {subjects.map(s => (
                  <EntityRow key={s.id} item={s} icon={Building2} accent={accent} />
                ))}
              </div>
            )}
          </div>
        )}

        {relatedProjects !== undefined && (
          <div>
            <div className="text-white/35 text-xs font-semibold uppercase tracking-widest mb-2">
              Проекты
            </div>
            {projects.length === 0 ? (
              <p className="text-white/45 text-sm italic">Связанные проекты не указаны.</p>
            ) : (
              <div className="space-y-2">
                {projects.map(p => (
                  <EntityRow key={p.id} item={p} icon={FolderKanban} accent={accent} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
