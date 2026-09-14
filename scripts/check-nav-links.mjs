/**
 * Сверка навигации с маршрутами.
 *
 * Зачем. Меню, палитра поиска и маршруты живут в трёх файлах и правятся
 * порознь. Сверка показала, что они разошлись: сорок адресов из App.tsx
 * не стояли в индексе поиска, среди них «/os» и «/fund», а страница
 * «/oilgas/integration» на тысячу строк не стояла ни в одном меню.
 * Никто ничего не ломал — индексы писались руками и отставали.
 *
 * Расхождение этого рода не проявляется ни в сборке, ни в типах: все три
 * файла корректны по отдельности. Проявляется оно вопросом «где у вас
 * страница про оборудование?», заданным о странице, которая есть.
 *
 * Скрипт ничего не исправляет сам. Автоматическая дописка пункта в меню
 * сделала бы меню всегда полным и всегда бессмысленным: порядок и
 * группировка — решение человека, а не следствие существования файла.
 *
 * Запуск: npm run check:nav
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');

/** Маршруты: <Route path="/x">. Параметрические отбрасываются — они не адрес, а шаблон. */
function routes() {
  const src = read('src/App.tsx');
  const all = [...src.matchAll(/<Route\s+path="([^"]+)"/g)].map((m) => m[1]);
  return new Set(all.filter((p) => !p.includes(':')));
}

/** Пути из массива объектов вида { path: '/x' }. */
function paths(file) {
  return [...read(file).matchAll(/path:\s*'([^']+)'/g)].map((m) => m[1]);
}

const R = routes();
const nav = paths('src/components/layout/Header.tsx');
const pal = paths('src/components/CommandPalette.tsx');

const errors = [];
const notes = [];

// Битая ссылка в меню — это 404 у человека, который доверился меню.
for (const p of new Set(nav)) {
  if (!R.has(p) && !p.includes(':')) errors.push(`меню ведёт на «${p}» — такого маршрута нет`);
}
for (const p of new Set(pal)) {
  if (!R.has(p) && !p.includes(':')) errors.push(`поиск ведёт на «${p}» — такого маршрута нет`);
}

// Дубль в меню — один и тот же адрес в двух группах. Не ошибка сборки,
// но читателю он сообщает, что это две разные страницы.
const dup = nav.filter((p, i) => nav.indexOf(p) !== i);
for (const p of new Set(dup)) errors.push(`«${p}» стоит в меню дважды`);

/**
 * Адреса, которым в поиске делать нечего.
 *
 * Первое — синонимы. «/about» и «/system» ведут на ту же страницу, что
 * «/os»; «/investors» и «/funds» — на «/fund». Отдельной строкой в
 * выдаче они дали бы пять одинаковых результатов на один запрос.
 * Синонимы записаны ключевыми словами канонического пункта.
 *
 * Второе — шаги потоков: вход, активация приглашения, подача заявки,
 * админка. В них попадают из потока, а не поиском по названию.
 *
 * Список ведётся руками намеренно. Если бы скрипт сам решал, какой
 * адрес «служебный», он молча прощал бы и настоящие пропуски.
 */
const NOT_SEARCHABLE = new Set([
  '/about', '/system',        // → /os
  '/investors', '/funds',     // → /fund
  '/franchise',               // → /architecture
  '/globe',                   // → /
  '/welcome', '/landing', '/site', // посадочные-заготовки
  '/auth', '/activate', '/profile', '/admin/invites', '/invest/apply', // шаги потоков
]);

// Страница, которой нет в поиске, для ищущего не существует.
const palSet = new Set(pal);
const missingInPalette = [...R].filter((p) => !palSet.has(p) && !NOT_SEARCHABLE.has(p)).sort();
// Пропуск в индексе — не сломанная сборка, но именно он приводит к
// вопросу «где страница про оборудование?» о существующей странице.
if (missingInPalette.length) {
  errors.push(
    `не индексируются поиском (${missingInPalette.length}): ${missingInPalette.join(', ')}\n` +
    '    — либо добавьте в COMMANDS, либо внесите в NOT_SEARCHABLE с объяснением',
  );
}

const navSet = new Set(nav);
const notInMenu = [...R].filter((p) => !navSet.has(p)).length;

console.log(`маршрутов ${R.size} · в меню ${navSet.size} · в поиске ${palSet.size}`);
console.log(`вне меню ${notInMenu} (это нормально: меню — выбор, а не перечень)`);
for (const n of notes) console.log(`\n· ${n}`);

if (errors.length) {
  console.log('\nОшибки:');
  for (const e of errors) console.log(`  ✗ ${e}`);
  process.exit(1);
}
console.log('\n✓ битых ссылок и дублей в навигации нет');
