/**
 * HomePage — главная.
 *
 * Требование, с которого страница началась, было сформулировано от
 * противного: не лендинг. Разница не в оформлении, а в устройстве.
 * Лендинг ведёт к одному действию и всё остальное подчиняет ему: в нём
 * нет мест, где читателю нечего нажимать. Здесь наоборот — воздух,
 * немного блоков и ни одной попытки удержать. Кто пришёл посмотреть,
 * посмотрит и уйдёт; кто пришёл разбираться, найдёт, куда идти дальше.
 *
 * Что на странице есть и в каком порядке:
 *
 *   1. Глобус на первый экран. Платформа говорит о планетарных
 *      объектах, и вход, на котором их видно, честнее входа, на котором
 *      про них написано.
 *   2. Что это — четыре фразы, и сразу за ними масштаб контура: срок
 *      работы, портфель программ, число экосистем, число проектов,
 *      объём корпуса данных.
 *   3. Куда развивается.
 *   4. Внутренние сборки — из реестра, и от каждой ведёт переход
 *      в её собственный модуль.
 *   5. Кто ведёт — основатель, его путь, лаборатория и компания.
 *   6. Стороны — из реестра сборок.
 *
 * Ни одна строка о сборках, узлах и сторонах здесь не написана заново.
 * Всё берётся из src/data/platform — из тех же файлов, что питают
 * страницу системы и главы документа. Копия текста на главной означала
 * бы, что через месяц главная и реестр будут говорить разное, и никто
 * не заметит, какое из двух верно.
 *
 * Отдельно про пункт 4. Карточка сборки здесь не тупик: у каждой записи
 * реестра есть `moduleTo`, и читатель уходит с главной в модуль этого
 * направления — к его документации, расчётам и интерактиву. Главная
 * называет, модуль показывает; это разделение и есть причина, по которой
 * главная остаётся короткой.
 */

import { Link } from 'wouter';
import { ArrowRight, ArrowUpRight, ChevronDown } from 'lucide-react';

import EarthGlobePage from './EarthGlobePage';
import { SYSTEMS } from '@/data/platform/systems';
import {
  FOUNDER,
  ORGANISATIONS,
  TRACK,
  PORTFOLIO,
  allPartners,
} from '@/data/platform/org';

// ── Мелкие части ───────────────────────────────────────────────

/** Заголовок раздела. Номер — чтобы страницу можно было обсуждать по пунктам. */
function SectionTitle({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-3 mb-8">
      <span className="text-[11px] font-mono text-cyan-400/40 tabular-nums">{n}</span>
      <h2 className="text-[13px] uppercase tracking-[0.16em] text-white/35">{children}</h2>
    </div>
  );
}

/** Обёртка раздела: воздух сверху и снизу — основное содержание этой страницы. */
function Section({ children }: { children: React.ReactNode }) {
  return (
    <section className="py-24 sm:py-32 px-6">
      <div className="max-w-3xl mx-auto">{children}</div>
    </section>
  );
}

function Rule() {
  return <div className="max-w-3xl mx-auto h-px" style={{ background: 'rgba(148,163,184,0.1)' }} />;
}

/** Портрет. Пока файла в репозитории нет, стоят инициалы, а не чужое лицо. */
function Portrait() {
  const initials = FOUNDER.name
    .split(' ')
    .map((w) => w[0])
    .join('');

  if (!FOUNDER.photoPresent) {
    return (
      <div
        className="w-20 h-20 rounded-2xl shrink-0 flex items-center justify-center text-[22px] font-light text-white/30"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(148,163,184,0.14)' }}
      >
        {initials}
      </div>
    );
  }
  return (
    <img
      src={FOUNDER.photo}
      alt={FOUNDER.name}
      className="w-20 h-20 rounded-2xl object-cover shrink-0"
      style={{ border: '1px solid rgba(148,163,184,0.14)' }}
    />
  );
}

// ── Страница ───────────────────────────────────────────────────

export default function HomePage() {
  const partners = allPartners();

  return (
    <div className="min-h-screen">
      {/* ── 1. Глобус ────────────────────────────────────────── */}
      <div className="relative h-[100svh] w-full overflow-hidden">
        <EarthGlobePage embedded />
        <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none z-20">
          <ChevronDown className="w-5 h-5 text-white/20 animate-bounce" />
        </div>
      </div>

      {/* ── 2. Что это ───────────────────────────────────────── */}
      <Section>
        <SectionTitle n="01">Что это</SectionTitle>
        <p className="text-[22px] sm:text-[26px] leading-[1.45] text-white font-light">
          Операционная система из модулей: узлы учёта ресурса, среды, объектов и
          взаимодействий, готовые к интеграции и к сборке под ключ под конкретную задачу.
        </p>
        <div className="mt-8 space-y-5 text-[15px] leading-[1.7] text-slate-400">
          <p>
            Собирается не продукт, а конфигурация. Одна и та же библиотека узлов
            даёт реестр воды, реестр земли и реестр здоровья — предметная область,
            политики и юрисдикция у них разные, устройство одно.
          </p>
          <p>
            <span className="text-slate-300">Архэ</span> (ἀρχή) у греков — первооснова:
            то, из чего возникает всё сущее. Отсюда имя: не приложение поверх
            отрасли, а слой, на котором отрасли описываются.
          </p>
        </div>

        {/* Масштаб контура. Числа берутся из реестра, а не пишутся в разметке. */}
        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-9">
          {PORTFOLIO.map((f) => (
            <div key={f.label}>
              <div className="text-[26px] sm:text-[30px] leading-none text-white font-light tabular-nums">
                {f.value}
              </div>
              <div className="mt-2.5 text-[13px] leading-[1.5] text-slate-300">{f.label}</div>
              {f.note && (
                <div className="mt-1.5 text-[11.5px] leading-[1.55] text-slate-500">{f.note}</div>
              )}
            </div>
          ))}
        </div>

        <Link
          href="/os"
          className="inline-flex items-center gap-2 mt-14 text-[14px] text-cyan-300/80 hover:text-cyan-200 transition"
        >
          Реестр узлов и библиотека модулей
          <ArrowRight className="w-4 h-4" />
        </Link>
      </Section>

      <Rule />

      {/* ── 3. Куда развивается ──────────────────────────────── */}
      <Section>
        <SectionTitle n="02">Куда развивается</SectionTitle>
        <p className="text-[18px] sm:text-[20px] leading-[1.55] text-slate-200 font-light">
          ArkheOSium развивается в самостоятельную операционную систему открытого
          типа — для социальной цивилизации, флоры и фауны, социальных и
          экономических отношений новой парадигмы.
        </p>
        <p className="mt-7 text-[14px] leading-[1.7] text-slate-500">
          Открытый тип означает, что правила и данные проверяемы снаружи: любой
          расчёт можно повторить, любую политику — прочитать. Новая парадигма
          отношений означает конкретное утверждение — право на ресурс не порождает
          права на его истощение. На этом утверждении строится расчётный слой:
          допустимым считается сценарий, в котором восстановление не меньше изъятия.
        </p>
        <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
          <Link
            href="/doc"
            className="inline-flex items-center gap-2 text-[14px] text-cyan-300/80 hover:text-cyan-200 transition"
          >
            Документ, четырнадцать глав
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/tokenomics"
            className="inline-flex items-center gap-2 text-[14px] text-cyan-300/80 hover:text-cyan-200 transition"
          >
            Расчётный слой и токеномика
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </Section>

      <Rule />

      {/* ── 4. Внутренние сборки ─────────────────────────────── */}
      <Section>
        <SectionTitle n="03">Внутренние ОС и экосистемы</SectionTitle>
        <p className="text-[14px] leading-[1.7] text-slate-500 mb-10">
          {SYSTEMS.length} сборки из одной библиотеки узлов. Предметная область,
          политики и юрисдикция у них разные, устройство общее. От каждой ведёт
          переход в её собственный модуль — с документацией, расчётами и
          интерактивом этого направления.
        </p>

        <div className="space-y-px">
          {SYSTEMS.map((s) => (
            <div key={s.id} className="py-7 border-t" style={{ borderColor: 'rgba(148,163,184,0.1)' }}>
              <h3 className="text-[17px] text-white font-medium">{s.name}</h3>
              <div className="mt-2 text-[13.5px] text-slate-400 leading-[1.6]">{s.domain}</div>
              <p className="mt-3 text-[12.5px] text-slate-500 leading-[1.7]">{s.about}</p>

              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
                <Link
                  href={s.moduleTo}
                  className="inline-flex items-center gap-2 text-[13px] text-cyan-300/80 hover:text-cyan-200 transition"
                >
                  {s.moduleLabel}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                {s.url && (
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[12.5px] text-slate-500 hover:text-slate-300 transition"
                  >
                    {s.url.replace('https://', '')}
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 text-[13px] leading-[1.7] text-slate-500">
          Помимо сборок в контуре ведётся ряд специальных проектов, решений,
          продуктов, услуг, франшиз, исследовательских центров и лабораторий.
          Их состав держится в реестрах направлений и каталога, где у каждой
          позиции стоит стадия.
        </p>
        <Link
          href="/directions"
          className="inline-flex items-center gap-2 mt-6 text-[14px] text-cyan-300/80 hover:text-cyan-200 transition"
        >
          Направления и стадии
          <ArrowRight className="w-4 h-4" />
        </Link>
      </Section>

      <Rule />

      {/* ── 5. Кто ведёт ─────────────────────────────────────── */}
      <Section>
        <SectionTitle n="04">Кто ведёт</SectionTitle>

        <div className="flex gap-5 items-start">
          <Portrait />
          <div className="min-w-0">
            <div className="text-[17px] text-white font-medium">
              {FOUNDER.name} <span className="text-slate-500 font-normal">· {FOUNDER.handle}</span>
            </div>
            <div className="mt-1 text-[13.5px] text-slate-400">{FOUNDER.role}</div>
            <p className="mt-4 text-[13.5px] leading-[1.7] text-slate-500">{FOUNDER.about}</p>
          </div>
        </div>

        {/* Путь: что сделано, где и с каким результатом. */}
        <div className="mt-14 space-y-px">
          {TRACK.map((t) => (
            <div
              key={t.period + t.title}
              className="py-6 border-t grid sm:grid-cols-[140px_1fr] gap-x-6 gap-y-2"
              style={{ borderColor: 'rgba(148,163,184,0.1)' }}
            >
              <div className="text-[12px] text-slate-500 tabular-nums pt-0.5">{t.period}</div>
              <div className="min-w-0">
                <div className="text-[15px] text-white leading-snug">{t.title}</div>
                <p className="mt-2 text-[13px] leading-[1.7] text-slate-400">{t.detail}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 grid sm:grid-cols-2 gap-x-8 gap-y-px">
          {ORGANISATIONS.map((o) => (
            <div key={o.id} className="py-6 border-t" style={{ borderColor: 'rgba(148,163,184,0.1)' }}>
              <div className="text-[15px] text-white">{o.name}</div>
              <div className="mt-1 text-[12.5px] text-slate-500">{o.role}</div>
              <p className="mt-3 text-[13px] leading-[1.65] text-slate-400">{o.about}</p>
              {o.alsoKnownAs && (
                <div className="mt-3 text-[11.5px] text-slate-600">
                  встречается также как {o.alsoKnownAs}
                </div>
              )}
              {o.url && (
                <a
                  href={o.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-[12px] text-cyan-400/60 hover:text-cyan-300 transition"
                >
                  {o.url.replace('https://', '')}
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ))}
        </div>
      </Section>

      <Rule />

      {/* ── 6. Стороны ───────────────────────────────────────── */}
      <Section>
        <SectionTitle n="05">Партнёры и участники</SectionTitle>
        <p className="text-[14px] leading-[1.7] text-slate-500 mb-8">
          Стороны, с которыми ведётся работа по сборкам контура: недвижимость и
          девелопмент — в территории, клиническая экспертиза — в здоровье.
        </p>

        <div className="space-y-px">
          {partners.map((p) => (
            <div
              key={`${p.buildId}-${p.name}`}
              className="py-5 border-t flex flex-wrap items-baseline gap-x-3 gap-y-1"
              style={{ borderColor: 'rgba(148,163,184,0.1)' }}
            >
              <span className="text-[15px] text-white">{p.name}</span>
              <span className="text-[12px] text-slate-600">→ {p.buildName}</span>
              <div className="w-full text-[13px] text-slate-400">{p.role}</div>
              {p.url && (
                <a
                  href={p.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[12px] text-cyan-400/60 hover:text-cyan-300 transition"
                >
                  {p.url.replace('https://', '')}
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ))}
        </div>

        <Link
          href="/partners"
          className="inline-flex items-center gap-2 mt-10 text-[14px] text-cyan-300/80 hover:text-cyan-200 transition"
        >
          Партнёрский контур
          <ArrowRight className="w-4 h-4" />
        </Link>
      </Section>

      <Rule />

      {/* ── Выходы ───────────────────────────────────────────── */}
      <Section>
        <div className="flex flex-wrap gap-x-8 gap-y-3 text-[14px]">
          <Link href="/os" className="text-slate-400 hover:text-white transition">
            Реестр узлов
          </Link>
          <Link href="/architecture" className="text-slate-400 hover:text-white transition">
            Архитектура и передача
          </Link>
          <Link href="/doc" className="text-slate-400 hover:text-white transition">
            Документ
          </Link>
          <Link href="/fund" className="text-slate-400 hover:text-white transition">
            Вход для фондов
          </Link>
          <Link href="/globe" className="text-slate-400 hover:text-white transition">
            Глобус отдельно
          </Link>
        </div>
      </Section>
    </div>
  );
}
