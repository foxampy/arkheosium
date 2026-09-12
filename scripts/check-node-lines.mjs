/**
 * Сверка объёма узлов с исходниками.
 *
 * В реестре `src/data/platform/nodes.ts` у каждого узла стоит число
 * строк. Это число проставлено руками по обходу каталогов, и оно
 * устаревает молча: каталог вырос, а в реестре осталась старая
 * величина. Один раз так и вышло — узел «конструктор предложения»
 * показывал 965 строк в тот момент, когда их уже было 1270, потому что
 * каталог вырос тем же изменением, которым число вписывали.
 *
 * Число, которое показывают фонду, не имеет права устаревать молча.
 * Поэтому сверка вынесена в скрипт: он пересчитывает строки по тем же
 * путям, что записаны в поле `source`, и печатает расхождения.
 *
 * Скрипт ничего не исправляет сам. Автоматическая правка числа означала
 * бы, что величина всегда «верна», и расхождение никто бы не увидел —
 * а расхождение здесь и есть полезный сигнал: оно означает, что узел
 * изменился и его описание, скорее всего, тоже пора перечитать.
 *
 *   node scripts/check-node-lines.mjs
 *
 * Код возврата 1, если есть расхождение больше порога.
 */

import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync, mkdtempSync } from 'node:fs';
import { join, extname } from 'node:path';
import { tmpdir } from 'node:os';

/** Расхождение меньше этого числа строк не считается расхождением. */
const TOLERANCE = 25;

const EXTS = new Set(['.ts', '.tsx', '.js', '.jsx']);

function countLines(path) {
  let total = 0;
  let st;
  try {
    st = statSync(path);
  } catch {
    return { total: 0, missing: true };
  }
  if (st.isFile()) {
    return { total: readFileSync(path, 'utf8').split('\n').length, missing: false };
  }
  for (const entry of readdirSync(path, { withFileTypes: true })) {
    const child = join(path, entry.name);
    if (entry.isDirectory()) {
      total += countLines(child).total;
    } else if (EXTS.has(extname(entry.name))) {
      total += readFileSync(child, 'utf8').split('\n').length;
    }
  }
  return { total, missing: false };
}

// Реестр — TypeScript, поэтому его сначала собираем в CommonJS.
const out = join(mkdtempSync(join(tmpdir(), 'nodecheck-')), 'nodes.cjs');
execFileSync(
  'npx',
  [
    'esbuild',
    'src/data/platform/nodes.ts',
    '--bundle',
    '--format=cjs',
    '--platform=node',
    '--alias:@=./src',
    `--outfile=${out}`,
  ],
  { stdio: 'pipe', shell: process.platform === 'win32' },
);

const { NODES } = await import(`file://${out.replace(/\\/g, '/')}`).then(
  (m) => m.default ?? m,
);

let drifted = 0;
let missing = 0;
const rows = [];

for (const node of NODES) {
  if (node.source === '—') {
    if (node.lines !== 0) {
      rows.push([node.id, String(node.lines), 'нет путей', 'ПРОТИВОРЕЧИЕ']);
      drifted++;
    }
    continue;
  }
  let actual = 0;
  let anyMissing = false;
  for (const part of node.source.split(',').map((s) => s.trim())) {
    const r = countLines(part);
    actual += r.total;
    if (r.missing) anyMissing = true;
  }
  const delta = actual - node.lines;
  if (anyMissing) {
    rows.push([node.id, String(node.lines), String(actual), 'ПУТЬ НЕ НАЙДЕН']);
    missing++;
  } else if (Math.abs(delta) >= TOLERANCE) {
    rows.push([
      node.id,
      String(node.lines),
      String(actual),
      `${delta > 0 ? '+' : ''}${delta}`,
    ]);
    drifted++;
  }
}

const declaredTotal = NODES.reduce((s, n) => s + n.lines, 0);

if (rows.length === 0) {
  console.log(
    `Расхождений нет. Узлов ${NODES.length}, заявленный объём ${declaredTotal} строк ` +
      `(допуск ${TOLERANCE} строк на узел).`,
  );
  process.exit(0);
}

const head = ['узел', 'в реестре', 'по исходникам', 'разница'];
const widths = head.map((h, i) =>
  Math.max(h.length, ...rows.map((r) => r[i].length)),
);
const line = (cells) => cells.map((c, i) => c.padEnd(widths[i])).join('  ');

console.log(line(head));
console.log(widths.map((w) => '-'.repeat(w)).join('  '));
for (const r of rows) console.log(line(r));
console.log(
  `\nРасхождений ${drifted}, ненайденных путей ${missing}. ` +
    'Число в реестре правится руками — вместе с перечитыванием того, ' +
    'что про узел написано.',
);
process.exit(1);
