/**
 * ArchitecturePage — страница для фондов, инвесторов и партнёров.
 *
 * Отдельная страница понадобилась потому, что этой аудитории документ
 * читают не с начала: её интересует, что именно можно получить и на
 * каких условиях. Обычный ответ на такой вопрос — презентация с
 * прогнозом выручки. Здесь ответ другой, и он должен прозвучать до
 * всего остального: доли не предлагаются, инструмент не выпущен,
 * доходность не обещается, лицензий выдано ноль.
 *
 * Поэтому страница устроена в четыре части и именно в таком порядке:
 *
 *   1. Что здесь не предлагается — раньше всего, пока читатель не
 *      достроил недостающее сам. Оговорка, вынесенная в подвал,
 *      не читается.
 *   2. Схема слоёв — что передаётся, а что не передаётся никогда.
 *   3. Состояние на сегодня числами, включая нули.
 *   4. Главы документа целиком — конституция, архитектура, контур
 *      участия, статус.
 *
 * Собственного текста у четвёртой части нет: это срез вайтпейпера.
 * Если формулировка изменится в главе, она изменится и здесь — другого
 * места, где она записана, не существует. Первые три части — навигация
 * и краткая сводка; ни одно число в них не вводится заново, все взяты
 * из тех же глав.
 */

import { Link } from 'wouter';
import { Layers, ShieldAlert, ArrowRight, Lock, Unlock } from 'lucide-react';

import DocPage from '@/pages/DocPage';
import { SLICES } from '@/data/whitepaper';

const HAIR = 'rgba(148,163,184,0.16)';
const PANEL = 'rgba(148,163,184,0.03)';
const ACCENT = '#22d3ee';
const WARN = '#f87171';

/** Слои сверху вниз. Верхние не передаются, нижние собираются заново. */
const LAYERS: { title: string; body: string; transferable: boolean }[] = [
  {
    title: 'Ядро и конституция',
    body: 'Двенадцать запретов, из которых выводится всё остальное.',
    transferable: false,
  },
  {
    title: 'Методы, исследования, права на результат',
    body: 'Производственный слой: из него выходят узлы библиотеки.',
    transferable: false,
  },
  {
    title: 'Библиотека узлов',
    body: 'Учёт ресурса, геослой, каталог, корпус, расчёт, идентичность.',
    transferable: true,
  },
  {
    title: 'Сборщик конфигураций',
    body: 'Набор узлов, политики, юрисдикция, оборудование, интеграции.',
    transferable: true,
  },
];

/** Что собирается из одной и той же библиотеки. */
const BUILDS: { title: string; body: string }[] = [
  {
    title: 'ArkheOSium',
    body: 'Собственная сборка. Живёт по конституции целиком, включая правила выпуска единиц.',
  },
  {
    title: 'Внутренний проект',
    body: 'Те же узлы, та же конституция, своя предметная область и свой темп.',
  },
  {
    title: 'Внешнее предприятие',
    body: 'Коммерческая сборка со своими правилами поверх неотключаемого минимума.',
  },
  {
    title: 'Франшиза',
    body: 'Конфигурация с правом эксплуатации на названном рынке и в названном сроке.',
  },
];

/** Сводка числами. Все значения — из глав документа, не из кода страницы. */
const FACTS: { n: string; label: string }[] = [
  { n: '0', label: 'выдано лицензий на конфигурацию' },
  { n: '0', label: 'продано франшиз' },
  { n: '0', label: 'развёртываний у заказчика' },
  { n: '0', label: 'узлов прошло стандартизацию' },
  { n: '0', label: 'объектов с аудированным денежным потоком' },
  { n: '0', label: 'выпущено цифровых единиц' },
  { n: '0', label: 'привлечено средств' },
  { n: '0', label: 'подключённых партнёров' },
];

export default function ArchitecturePage() {
  return (
    <div className="min-h-screen text-slate-200">
      {/* ─── Шапка ─────────────────────────────────────────────── */}
      <div
        className="border-b"
        style={{
          borderColor: `${ACCENT}22`,
          background: 'linear-gradient(160deg, rgba(34,211,238,0.08), rgba(2,8,23,0) 60%)',
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="flex items-center gap-2 mb-4">
            <Layers size={18} style={{ color: ACCENT }} />
            <span
              className="text-[11px] font-bold tracking-[0.18em] uppercase"
              style={{ color: ACCENT }}
            >
              Фондам, инвесторам и партнёрам
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold text-white leading-tight max-w-3xl">
            Передаётся конфигурация узлов с правом эксплуатации. Ядро и конституция не передаются
            никому.
          </h1>

          <p className="text-[14px] text-slate-400 mt-5 max-w-2xl leading-relaxed">
            Один цикл исследований даёт узел, узел входит в библиотеку, из библиотеки собираются
            конфигурации, конфигурация разворачивается как самостоятельная система. ArkheOSium —
            одна из таких сборок, а не владелец остальных. Коммерческая сборка не входит внутрь
            цивилизационного контура и не получает права менять его правила.
          </p>
        </div>
      </div>

      {/* ─── 1. Чего здесь нет. Раньше всего остального. ───────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10">
        <div
          className="rounded-xl border p-5"
          style={{ borderColor: `${WARN}33`, background: `${WARN}0d` }}
        >
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert size={16} style={{ color: WARN }} />
            <span
              className="text-[11px] font-bold uppercase tracking-[0.16em]"
              style={{ color: WARN }}
            >
              Что на этой странице не предлагается
            </span>
          </div>
          <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
            {[
              'Доли в платформе и доли в будущей прибыли.',
              'Цифровой инструмент: выпущено ноль, эмитент не зарегистрирован.',
              'Доходность в любом виде — ни ставки, ни диапазона, ни прогноза.',
              'Приём средств: реквизитов платформа не публикует.',
              'Готовые к передаче узлы: стандартизацию не прошёл ни один.',
              'Оценка компании и раунд: ни того, ни другого не существует.',
            ].map((t) => (
              <li key={t} className="text-[13px] text-slate-300 leading-[1.65] flex gap-2">
                <span className="shrink-0" style={{ color: WARN }}>
                  ·
                </span>
                {t}
              </li>
            ))}
          </ul>
          <p className="text-[12.5px] text-slate-500 mt-4 leading-relaxed">
            Предмет разговора сегодня — совместная доводка узла до состояния, в котором его можно
            передать: обследование объекта, оборудование створа, испытание методики,
            стандартизация. Условие открытия контура участия названо ниже и не зависит от
            готовности этой страницы.
          </p>
        </div>
      </div>

      {/* ─── 2. Слои ───────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-12">
        <h2 className="text-[15px] font-semibold text-white mb-1">Слои и граница передачи</h2>
        <p className="text-[13px] text-slate-500 mb-5 max-w-2xl leading-relaxed">
          Замо́к означает, что слой не лицензируется ни в какой форме. Открытый замок — что слой
          передаётся поимённо: не «библиотека», а перечисленные в договоре позиции, рынок и срок.
        </p>

        <div className="grid gap-2.5">
          {LAYERS.map((l) => {
            const c = l.transferable ? '#34d399' : WARN;
            const Icon = l.transferable ? Unlock : Lock;
            return (
              <div
                key={l.title}
                className="rounded-xl border p-4 flex items-start gap-3.5"
                style={{ borderColor: HAIR, background: PANEL }}
              >
                <span
                  className="shrink-0 mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: `${c}18` }}
                >
                  <Icon size={14} style={{ color: c }} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                    <span className="text-[13.5px] font-medium text-slate-200">{l.title}</span>
                    <span
                      className="text-[10px] font-bold uppercase tracking-[0.12em] px-1.5 py-0.5 rounded"
                      style={{ color: c, background: `${c}18` }}
                    >
                      {l.transferable ? 'передаётся' : 'не передаётся'}
                    </span>
                  </div>
                  <div className="text-[12.5px] text-slate-500 mt-1 leading-relaxed">{l.body}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center py-3 text-slate-700">↓</div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {BUILDS.map((b) => (
            <div
              key={b.title}
              className="rounded-xl border p-4"
              style={{ borderColor: `${ACCENT}26`, background: `${ACCENT}08` }}
            >
              <div className="text-[13px] font-medium text-slate-100 mb-1.5">{b.title}</div>
              <div className="text-[12px] text-slate-500 leading-relaxed">{b.body}</div>
            </div>
          ))}
        </div>

        <p className="text-[12.5px] text-slate-500 mt-4 max-w-2xl leading-relaxed">
          Обратный поток от сборок к исследованию — только отказы, нагрузки, требования и данные
          эксплуатации, и только с согласия заказчика: данные клиента принадлежат клиенту. Доход и
          управление обратно не идут.
        </p>
      </div>

      {/* ─── 3. Состояние числами ──────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-12">
        <h2 className="text-[15px] font-semibold text-white mb-1">Состояние на сегодня</h2>
        <p className="text-[13px] text-slate-500 mb-5 max-w-2xl leading-relaxed">
          Восемь величин, и все восемь — нули. Написаны числами, а не опущены: пропущенный ноль
          читается как отсутствие темы, а не как отсутствие величины.
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          {FACTS.map((f) => (
            <div
              key={f.label}
              className="rounded-xl border p-4"
              style={{ borderColor: HAIR, background: PANEL }}
            >
              <div className="text-3xl font-bold text-white tabular-nums leading-none mb-2">
                {f.n}
              </div>
              <div className="text-[12px] text-slate-500 leading-snug">{f.label}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2.5 mt-6">
          {[
            { to: '/doc/architecture', t: 'Глава об архитектуре целиком' },
            { to: '/doc/realization', t: 'Контур участия и условие открытия' },
            { to: '/partners', t: 'Партнёрские входы' },
            { to: '/doc', t: 'Полный документ' },
          ].map((l) => (
            <Link
              key={l.to}
              href={l.to}
              className="rounded-lg border px-3.5 py-2 text-[12.5px] text-slate-300 hover:bg-white/[0.04] transition-colors inline-flex items-center gap-2"
              style={{ borderColor: HAIR }}
            >
              {l.t}
              <ArrowRight size={12} className="text-slate-600" />
            </Link>
          ))}
        </div>
      </div>

      {/* ─── 4. Главы документа. Срез, а не пересказ. ──────────── */}
      <DocPage
        sliceIds={SLICES.investors}
        sliceTitle="Что читать целиком"
        sliceNote={
          'Четыре главы документа без сокращений: правила, из которых всё выводится; ' +
          'архитектура со списком узлов и границей передачи; контур участия с условием ' +
          'открытия; состояние дел. Это срез документа, а не изложение его на этой ' +
          'странице — переписать здесь формулировку негде.'
        }
      />
    </div>
  );
}
