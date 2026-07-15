// Generates SQL to seed catalog_items from the static catalog-data.ts.
// Run with: npx tsx scripts/gen-catalog-seed.mjs > scripts/catalog-seed.sql
import { TECHNOLOGIES, EQUIPMENT } from '../src/data/catalog-data.ts';

const esc = (s) => (s == null ? 'NULL' : `'${String(s).replace(/'/g, "''")}'`);
const arr = (a) =>
  a == null || a.length === 0
    ? 'NULL'
    : `ARRAY[${a.map((x) => `'${String(x).replace(/'/g, "''")}'`).join(',')}]::text[]`;
const jsonb = (o) =>
  o == null ? "'{}'::jsonb" : `'${JSON.stringify(o).replace(/'/g, "''")}'::jsonb`;

function rowsFor(list, itemType) {
  return list.map((it) => {
    return `(${esc(itemType)}, ${esc(it.name_ru)}, ${esc(it.name_en)}, ${esc(it.category)}, ` +
      `${esc(it.description)}, ${esc(it.maturity_level)}, ${arr(it.applications)}, ${arr(it.advantages)}, ` +
      `${jsonb(it.specifications)}, ${esc(it.manufacturer)}, ${esc(it.country_of_origin)}, ${esc(it.price_range)})`;
  });
}

const rows = [...rowsFor(TECHNOLOGIES, 'technology'), ...rowsFor(EQUIPMENT, 'equipment')];

const sql = `-- Auto-generated seed for catalog_items (${rows.length} rows)
delete from catalog_items;
insert into catalog_items
  (item_type, name_ru, name_en, category, description, maturity_level, applications, advantages,
   specifications, manufacturer, country_of_origin, price_unit)
values
${rows.join(',\n')};
`;

process.stdout.write(sql);
