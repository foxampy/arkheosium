// Replace all Unsplash card images with topical Pollinations images.
// Parses each data file, derives a prompt from the item's own fields,
// downloads a JPEG into public/generated/, and rewrites image_url.
// Fallback: if download fails, image_url points to the remote Pollinations URL
// (still topical, never leaves an unsplash link behind).
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'public', 'generated');

const FILES = [
  ['catalog-data.ts', 'cat'],
  ['subjects-data.ts', 'subj'],
  ['solution-data.ts', 'sol'],
  ['objects-data.ts', 'obj'],
  ['rd-data.ts', 'rd'],
  ['projects-data.ts', 'proj'],
  ['objects/uz-objects.ts', 'uz'],
  ['objects/regional-objects.ts', 'reg'],
  ['charvakoye-object.ts', 'charv'],
];

const CONCURRENCY = 6;
const RETRIES = 3;

function hashSeed(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return Math.abs(h) % 1000000;
}
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 48);

function pollUrl(prompt, seed) {
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=800&height=600&nologo=true&seed=${seed}&model=flux`;
}

async function exists(p) { try { await access(p, constants.F_OK); return true; } catch { return false; } }

async function download(url, dest) {
  for (let attempt = 1; attempt <= RETRIES; attempt++) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 60000);
      const res = await fetch(url, { signal: ctrl.signal });
      clearTimeout(t);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 1000) throw new Error('too small ' + buf.length);
      await writeFile(dest, buf);
      return true;
    } catch (e) {
      if (attempt === RETRIES) { console.warn('  ! fail', path.basename(dest), e.message); return false; }
      await new Promise(r => setTimeout(r, 1500 * attempt));
    }
  }
  return false;
}

// Parse a file: return { text, jobs: [{lineIdx, slug, prompt, seed}] } with image_url lines identified.
function parseFile(text, tag) {
  const lines = text.split('\n');
  const jobs = [];
  let cur = { id: '', name_en: '', name_ru: '', category: '' };
  const reId = /^\s*id:\s*['"`]([^'"`]+)['"`]/;
  const reEn = /^\s*name_en:\s*['"`]([^'"`]*)['"`]/;
  const reRu = /^\s*name_ru:\s*['"`]([^'"`]*)['"`]/;
  const reCat = /^\s*category:\s*['"`]([^'"`]*)['"`]/;
  const reImg = /^(\s*image_url:\s*)['"`]https?:\/\/images\.unsplash\.com[^'"`]*['"`](,?)\s*$/;
  let counter = 0;
  for (let i = 0; i < lines.length; i++) {
    let m;
    if ((m = lines[i].match(reId))) { cur = { id: m[1], name_en: '', name_ru: '', category: '' }; continue; }
    if ((m = lines[i].match(reEn))) { cur.name_en = m[1]; continue; }
    if ((m = lines[i].match(reRu))) { cur.name_ru = m[1]; continue; }
    if ((m = lines[i].match(reCat))) { cur.category = m[1]; continue; }
    if ((m = lines[i].match(reImg))) {
      const idBase = cur.id || `${tag}-${counter++}`;
      const slug = `${tag}-${slugify(idBase)}`;
      const name = cur.name_en || cur.name_ru || idBase;
      const cat = cur.category ? `, ${cur.category}` : '';
      const prompt = `${name}${cat}, water infrastructure and environmental technology, cinematic realistic photo, high detail, professional`;
      jobs.push({ lineIdx: i, indent: m[1], comma: m[2], slug, prompt, seed: hashSeed(slug) });
    }
  }
  return { lines, jobs };
}

async function runPool(tasks, worker) {
  let idx = 0, done = 0;
  const total = tasks.length;
  async function next() {
    while (idx < tasks.length) {
      const my = idx++;
      await worker(tasks[my]);
      done++;
      if (done % 20 === 0 || done === total) console.log(`  ...${done}/${total}`);
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, tasks.length) }, next));
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  let grandTotal = 0, grandDl = 0, grandRemote = 0;
  for (const [rel, tag] of FILES) {
    const abs = path.join(ROOT, 'src', 'data', rel);
    let text;
    try { text = await readFile(abs, 'utf8'); } catch { console.warn('skip missing', rel); continue; }
    const { lines, jobs } = parseFile(text, tag);
    if (!jobs.length) { console.log(`${rel}: no unsplash`); continue; }
    console.log(`${rel}: ${jobs.length} images`);
    await runPool(jobs, async (job) => {
      const dest = path.join(OUT_DIR, `${job.slug}.jpg`);
      const url = pollUrl(job.prompt, job.seed);
      let finalUrl;
      if (await exists(dest)) { finalUrl = `/generated/${job.slug}.jpg`; grandDl++; }
      else if (await download(url, dest)) { finalUrl = `/generated/${job.slug}.jpg`; grandDl++; }
      else { finalUrl = url; grandRemote++; } // fallback: remote topical url, never unsplash
      lines[job.lineIdx] = `${job.indent}'${finalUrl}'${job.comma === ',' ? ',' : ''}`;
    });
    await writeFile(abs, lines.join('\n'), 'utf8');
    grandTotal += jobs.length;
    console.log(`  wrote ${rel}`);
  }
  console.log(`\nDONE. total=${grandTotal} localDownloaded=${grandDl} remoteFallback=${grandRemote}`);
}
main().catch(e => { console.error(e); process.exit(1); });
