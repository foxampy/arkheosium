// ══════════════════════════════════════════════════════════════
//  gen-seed.ts — generate Postgres seed SQL from static frontend data
//  Run:  npx tsx scripts/gen-seed.ts
//  Targets Supabase project "vodeco". Tables have extra columns:
//    slug text  — original string id (for relations / idempotency)
//    data jsonb — full original record (lossless)
// ══════════════════════════════════════════════════════════════
import { mkdirSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import { OBJECTS_DATA } from '../src/data/objects-data';
import { PROJECTS_DATA } from '../src/data/projects-data';
import { SUBJECTS_DATA } from '../src/data/subjects-data';
import { TECHNOLOGIES, EQUIPMENT } from '../src/data/catalog-data';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, 'seed');
mkdirSync(OUT, { recursive: true });

// ---------- SQL value helpers ----------
const esc = (str: string) => str.replace(/'/g, "''");
function s(v: unknown): string {
  if (v === null || v === undefined) return 'NULL';
  const str = String(v);
  if (str.trim() === '') return 'NULL';
  return `'${esc(str)}'`;
}
function n(v: unknown): string {
  if (v === null || v === undefined || v === '') return 'NULL';
  const num = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(num) ? String(num) : 'NULL';
}
function arr(v: unknown): string {
  if (!Array.isArray(v) || v.length === 0) return 'NULL';
  const parts = v.filter((x) => x != null).map((x) => `'${esc(String(x))}'`);
  return parts.length ? `ARRAY[${parts.join(',')}]::text[]` : 'NULL';
}
function j(v: unknown): string {
  if (v === null || v === undefined) return 'NULL';
  return `'${esc(JSON.stringify(v))}'::jsonb`;
}
const lat = (o: any) => o?.coordinates?.lat ?? null;
const lng = (o: any) => o?.coordinates?.lng ?? null;

const row = (vals: string[]) => `(${vals.join(', ')})`;

// ---------- objects → water_resources ----------
function genObjects(): string {
  const cols = ['slug','name','name_ru','name_en','description','description_en','location','region','country','latitude','longitude','status','irr','total_funding','category','object_type','capacity','year_established'];
  const rows = OBJECTS_DATA.map((o: any) => row([
    s(o.id), s(o.name ?? o.name_ru), s(o.name_ru ?? o.name), s(o.name),
    s(o.description), s(o.description_full),
    s(o.region), s(o.region), s(o.country),
    n(lat(o)), n(lng(o)), s(o.status), n(o.expected_irr), n(o.investment_potential),
    s(o.type), s(o.type),
    s(o.capacity != null ? `${o.capacity} ${o.capacity_unit ?? ''}`.trim() : null),
    n(o.year_built),
  ]));
  return [
    'DELETE FROM public.water_resources WHERE slug IS NOT NULL;',
    `INSERT INTO public.water_resources (${cols.join(', ')}) VALUES`,
    rows.join(',\n') + ';',
    '',
  ].join('\n');
}

// ---------- projects → projects ----------
function genProjects(): string {
  const cols = ['slug','name','name_ru','name_en','description','description_en','country','region','status','irr','total_funding','technologies','latitude','longitude'];
  const rows = PROJECTS_DATA.map((p: any) => row([
    s(p.id), s(p.name), s(p.name_ru ?? p.name), s(p.name),
    s(p.description), s(p.description),
    s(p.country), s(p.location), s(p.status),
    n(p.expected_irr ?? p.combined_irr), n(p.budget ?? p.budget_total),
    s(Array.isArray(p.tags) ? p.tags.join(', ') : null),
    n(lat(p)), n(lng(p)),
  ]));
  return [
    'DELETE FROM public.projects WHERE slug IS NOT NULL;',
    `INSERT INTO public.projects (${cols.join(', ')}) VALUES`,
    rows.join(',\n') + ';',
    '',
  ].join('\n');
}

// ---------- subjects → stakeholders ----------
function genSubjects(): string {
  const cols = ['slug','full_name','full_name_en','name_ru','name_en','description','activity_area','region','country','website','email','latitude','longitude','stakeholder_type','tags'];
  const rows = SUBJECTS_DATA.map((x: any) => row([
    s(x.id), s(x.name_ru ?? x.name), s(x.name), s(x.name_ru ?? x.name), s(x.name),
    s(x.description), s(x.type_label), s(x.region ?? x.location), s(x.country),
    s(x.website), s(x.email), n(lat(x)), n(lng(x)), s(x.type), arr(x.tags),
  ]));
  return [
    'DELETE FROM public.stakeholders WHERE slug IS NOT NULL;',
    `INSERT INTO public.stakeholders (${cols.join(', ')}) VALUES`,
    rows.join(',\n') + ';',
    '',
  ].join('\n');
}

// ---------- catalog → catalog_items ----------
function genCatalog(): string {
  const cols = ['slug','item_type','name_ru','name_en','category','manufacturer','country_of_origin','description','description_ru','description_en','maturity_level','specifications','advantages','applications','tags'];
  const mk = (c: any, type: 'technology' | 'equipment') => row([
    s(c.id), s(type), s(c.name_ru), s(c.name_en), s(c.category), s(c.manufacturer),
    s(c.country_of_origin), s(c.description), s(c.description), s(c.description),
    s(c.maturity_level), j(c.specifications), arr(c.advantages), arr(c.applications),
    arr(c.applications), 
  ]);
  const rows = [
    ...TECHNOLOGIES.map((c: any) => mk(c, 'technology')),
    ...EQUIPMENT.map((c: any) => mk(c, 'equipment')),
  ];
  return [
    'TRUNCATE public.catalog_items RESTART IDENTITY;',
    `INSERT INTO public.catalog_items (${cols.join(', ')}) VALUES`,
    rows.join(',\n') + ';',
    '',
  ].join('\n');
}

writeFileSync(join(OUT, 'objects.sql'), genObjects());
writeFileSync(join(OUT, 'projects.sql'), genProjects());
writeFileSync(join(OUT, 'subjects.sql'), genSubjects());
writeFileSync(join(OUT, 'catalog.sql'), genCatalog());

console.log(`seed generated: objects=${OBJECTS_DATA.length} projects=${PROJECTS_DATA.length} subjects=${SUBJECTS_DATA.length} catalog=${TECHNOLOGIES.length + EQUIPMENT.length} (tech=${TECHNOLOGIES.length} equip=${EQUIPMENT.length})`);
