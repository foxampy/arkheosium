/**
 * Одноразовый извлекатель: собирает метки из реестров ArkheOSium и пишет
 * плоский модуль в uic-site. Запускается вручную, в сборку не входит.
 *
 * Зачем выгрузка, а не импорт: реестры ArkheOSium тянут за собой
 * `@/types/object-full`, нефтегазовые подмодули и связанные записи —
 * несколько сотен килобайт того, что витрине не нужно. Метке нужны
 * координаты, имя, вид и привязка; остальное остаётся в ArkheOSium.
 */
import { writeFileSync } from 'node:fs';
import { OBJECTS_DATA } from './src/data/objects-data';
import { SUBJECTS_DATA } from './src/data/subjects-data';
import { PROJECTS_DATA } from './src/data/projects-data';
import { ALL_FULL_OBJECTS } from './src/data/objects/index';

type Kind = 'object' | 'subject' | 'project';

interface Mark {
  id: string;
  kind: Kind;
  lat: number;
  lng: number;
  label: string;
  type?: string;
  country?: string;
  region?: string;
  domain?: string;
  status?: string;
}

function coords(e: any): { lat: number; lng: number } | null {
  const c = e?.coordinates;
  if (c && typeof c.lat === 'number' && typeof c.lng === 'number') {
    return { lat: c.lat, lng: c.lng };
  }
  if (typeof e?.lat === 'number' && typeof e?.lng === 'number') {
    return { lat: e.lat, lng: e.lng };
  }
  return null;
}

function str(v: unknown): string | undefined {
  return typeof v === 'string' && v.trim() ? v.trim() : undefined;
}

const seen = new Set<string>();
const out: Mark[] = [];

function push(e: any, kind: Kind) {
  const c = coords(e);
  const id = str(e?.id);
  if (!c || !id) return;
  const key = `${kind}:${id}`;
  if (seen.has(key)) return;
  seen.add(key);
  const label = str(e.name_ru) ?? str(e.name) ?? str(e.name_en) ?? id;
  out.push({
    id,
    kind,
    lat: Math.round(c.lat * 1e4) / 1e4,
    lng: Math.round(c.lng * 1e4) / 1e4,
    label,
    type: str(e.type_label) ?? str(e.type),
    country: str(e.country),
    region: str(e.region),
    domain: str(e.domain),
    status: str(e.status),
  });
}

for (const o of OBJECTS_DATA as any[]) push(o, 'object');
for (const o of ALL_FULL_OBJECTS as any[]) push(o, 'object');
for (const s of SUBJECTS_DATA as any[]) push(s, 'subject');
for (const p of PROJECTS_DATA as any[]) push(p, 'project');

out.sort((a, b) => (a.kind === b.kind ? a.id.localeCompare(b.id) : a.kind.localeCompare(b.kind)));

const counts = out.reduce<Record<string, number>>((acc, m) => {
  acc[m.kind] = (acc[m.kind] ?? 0) + 1;
  return acc;
}, {});

const body = out
  .map((m) => {
    const parts = [
      `id: ${JSON.stringify(m.id)}`,
      `kind: ${JSON.stringify(m.kind)}`,
      `lat: ${m.lat}`,
      `lng: ${m.lng}`,
      `label: ${JSON.stringify(m.label)}`,
    ];
    if (m.type) parts.push(`type: ${JSON.stringify(m.type)}`);
    if (m.country) parts.push(`country: ${JSON.stringify(m.country)}`);
    if (m.region) parts.push(`region: ${JSON.stringify(m.region)}`);
    if (m.domain) parts.push(`domain: ${JSON.stringify(m.domain)}`);
    if (m.status) parts.push(`status: ${JSON.stringify(m.status)}`);
    return `  { ${parts.join(', ')} },`;
  })
  .join('\n');

const header = `/**
 * Метки глобуса: объекты, субъекты и проекты контура.
 *
 * Файл выгружен из реестров ArkheOSium (\`src/data/{objects,subjects,projects}-data.ts\`
 * плюс \`src/data/objects/index.ts\`) скриптом \`extract-markers.ts\` того же
 * проекта. Правится он там, а не здесь: ручная правка этого файла переживёт
 * ровно до следующей выгрузки.
 *
 * Выгружено записей: ${out.length} — объектов ${counts.object ?? 0}, субъектов ${counts.subject ?? 0}, проектов ${counts.project ?? 0}.
 * Дата выгрузки: ${new Date().toISOString().slice(0, 10)}.
 *
 * Взяты только те поля, которые нужны метке на шаре: координаты, подпись, вид,
 * административная привязка и состояние. Бюджеты, IRR, контакты и связи между
 * записями остались в ArkheOSium — витрине они не нужны, а весили бы сотни
 * килобайт в основном куске сборки.
 */

export type MarkKind = 'object' | 'subject' | 'project';

export interface Mark {
  id: string;
  kind: MarkKind;
  lat: number;
  lng: number;
  label: string;
  /** Подвид записи как он назван в реестре: «Насосная станция», «Министерство»… */
  type?: string;
  country?: string;
  region?: string;
  /** Домен ресурса: water | oilgas | energy | ecology… — им красится метка. */
  domain?: string;
  status?: string;
}

export const MARK_LABEL: Record<MarkKind, string> = {
  object: 'Объекты',
  subject: 'Субъекты',
  project: 'Проекты',
};

/* Цвет метки здесь не лежит: он относится к оформлению витрины, а не к
   реестру, и живёт в \`marks-view.ts\` — файле, который выгрузка не трогает. */

export const MARKS: Mark[] = [
`;

writeFileSync(
  'F:/LAB/uic-site/src/data/marks.ts',
  header + body + '\n];\n\nexport const MARKS_TOTAL = MARKS.length;\n',
  'utf8',
);

console.log(`written ${out.length}`, counts);
