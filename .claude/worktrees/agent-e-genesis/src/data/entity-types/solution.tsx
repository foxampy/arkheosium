// ═══════════════════════════════════════════════════════════════
//  solutionConfig — EntityTypeConfig for "solution"
//  Reads from SOLUTIONS_DATA fixture
// ═══════════════════════════════════════════════════════════════

import type { EntityTypeConfig } from './types';
import { SOLUTIONS_MAP } from '@/data/solution-data';

export const solutionConfig: EntityTypeConfig = {
  typeKey: 'solution',
  label: 'Решение',
  pluralLabel: 'Решения',
  color: '#f472b6',
  loadData(id) {
    const s = SOLUTIONS_MAP[id];
    if (!s) return null;
    const stackPreview =
      s.stack.slice(0, 3).join(', ') + (s.stack.length > 3 ? '…' : '');
    return {
      id: s.id,
      title: s.name,
      type: 'solution',
      status: s.status,
      coverImage: s.coverImage,
      description: s.description,
      location: s.location,
      kpis: [
        { label: 'TRL', value: s.trl, unit: '/ 9' },
        { label: 'Стек', value: stackPreview || '—' },
        { label: 'Лицензия', value: s.license },
        { label: 'Кейсы', value: s.cases_count },
      ],
      documents: s.documents,
      related: s.related,
      extra: {
        stack: s.stack,
        use_cases: s.use_cases,
        partners: s.partners,
        trl_label: s.trl_label,
      },
    };
  },
  renderTypeSpecific(data) {
    const stack = (data.extra?.stack ?? []) as string[];
    const useCases = (data.extra?.use_cases ?? []) as {
      title: string;
      description: string;
      client?: string;
    }[];
    const partners = (data.extra?.partners ?? []) as string[];
    const trlLabel = data.extra?.trl_label as string | undefined;
    if (stack.length === 0 && useCases.length === 0) return null;
    return (
      <>
        {stack.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Технологический стек</h2>
            <div className="flex flex-wrap gap-2">
              {stack.map((t, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-slate-900 border border-slate-700 rounded-full text-sm text-pink-300"
                >
                  {t}
                </span>
              ))}
            </div>
            {trlLabel && (
              <div className="mt-4 text-sm text-slate-400">{trlLabel}</div>
            )}
            {partners.length > 0 && (
              <div className="mt-4">
                <div className="text-sm text-slate-400 mb-2">Партнёры-разработчики</div>
                <div className="flex flex-wrap gap-2">
                  {partners.map((p, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-slate-900/50 border border-slate-800 rounded text-sm"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
        {useCases.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Кейсы внедрения</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {useCases.map((c, i) => (
                <div
                  key={i}
                  className="p-4 bg-slate-900/50 border border-slate-800 rounded"
                >
                  <div className="font-semibold">{c.title}</div>
                  {c.client && (
                    <div className="text-xs text-pink-300 mt-1 uppercase tracking-wider">
                      {c.client}
                    </div>
                  )}
                  <div className="text-sm text-slate-400 mt-2 leading-relaxed">
                    {c.description}
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
