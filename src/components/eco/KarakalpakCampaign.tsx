import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { motion, useInView } from 'framer-motion';
import {
  Database, Cpu, FlaskConical, Coins, Users, ShieldCheck, Hash,
  Boxes, Network, Gauge, Waves, Sun, Sprout, Building2, Ship,
  Rocket, ArrowRight, InfinityIcon, Sparkles, BookOpen,
} from 'lucide-react';
import {
  ECONOMY, VECTORS, MODULES, LIBRARIES, KNOWLEDGE_EDGES, KNOWLEDGE_TERM,
  DAO, DATA_PRODUCTS, MRV_TERM,
} from '@/data/karakalpak-campaign';

/**
 * Block 5 — глубокое раскрытие кампании «Каракалпакия» + слой
 * «знания / продукты / DAO / верификация данных».
 *
 * Self-contained: зеркалирует палитру/glass-стиль AralSeaProjectPage, как и
 * соседний DualProgramStage, чтобы встать прямо в колонку глав. Последовательность
 * подразделов: экономика (контраст) → эффекты по векторам → модули →
 * граф знаний / библиотеки → DAO → продукты MRV/DePIN.
 */

const C = {
  accent: '#00e6c8',
  accent2: '#00d4ff',
  water: '#00e6c8',
  energy: '#f59e0b',
  minerals: '#c084fc',
  nature: '#34d399',
  agriculture: '#a3e635',
  climate: '#7dd3fc',
  gold: '#f59e0b',
};

// ── Reduced-motion hook (copy of DualProgramStage.useReduced) ────────────────
function useReduced() {
  const [r, setR] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setR(mq.matches);
    const on = () => setR(mq.matches);
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, []);
  return r;
}

// ── Icon resolver for string names from the data module ──────────────────────
const ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  Database, Cpu, FlaskConical, Coins, Users, ShieldCheck, Hash,
  Boxes, Network, Gauge, Waves, Sun, Sprout, Building2, Ship,
};
function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const Cmp = ICONS[name] ?? Boxes;
  return <Cmp size={size} />;
}

// ── Eyebrow pill (mirrors page style) ────────────────────────────────────────
function Eyebrow({ color = C.accent, children }: { color?: string; children: React.ReactNode }) {
  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase"
      style={{ background: color + '18', color, border: `1px solid ${color}33` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {children}
    </div>
  );
}

// ── Reveal-on-scroll wrapper ─────────────────────────────────────────────────
function Reveal({
  children, delay = 0, className, reduced,
}: { children: React.ReactNode; delay?: number; className?: string; reduced: boolean }) {
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 18 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 1 · Economics contrast
// ─────────────────────────────────────────────────────────────────────────────
function EconomicsSection({ reduced }: { reduced: boolean }) {
  return (
    <div>
      <Eyebrow color={C.agriculture}>Экономика · $250 млн ↔ $0.5 трлн</Eyebrow>
      <h3 className="mt-4 text-xl sm:text-3xl font-bold text-white leading-tight">
        Кампания окупается сама — программа рентабельнее в разы
      </h3>
      <p className="mt-3 text-white/55 text-sm sm:text-base max-w-2xl">
        Каракалпакия самодостаточна при интеграции всех модулей. Общая программа связывает
        каждый вектор в единый организм — эффект <span className="text-white/80 font-semibold">мультипликативен, не аддитивен</span>.
      </p>

      {/* Multiplier seam */}
      <div className="flex items-center gap-3 my-5">
        <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, transparent, ${C.gold}55, transparent)` }} />
        <div
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold"
          style={{ background: C.gold + '18', color: C.gold, border: `1px solid ${C.gold}44` }}
        >
          <InfinityIcon size={13} /> системный множитель
        </div>
        <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, transparent, ${C.gold}55, transparent)` }} />
      </div>

      <div className="flex flex-col md:flex-row gap-3 md:items-stretch">
        {ECONOMY.map((e, i) => (
          <div key={e.id} className="contents md:contents">
            <Reveal reduced={reduced} delay={i * 0.08} className="flex-1">
              <div
                className="relative h-full rounded-3xl p-5 sm:p-6 overflow-hidden"
                style={{
                  background: `linear-gradient(160deg, ${e.color}1c, rgba(6,15,28,0.7))`,
                  border: `1px solid ${e.color}55`,
                  boxShadow: `0 12px 48px ${e.color}18`,
                }}
              >
                <div className="absolute -right-16 -top-16 w-52 h-52 rounded-full pointer-events-none" style={{ background: e.color + '22', filter: 'blur(60px)' }} />
                <div className="relative">
                  <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: e.color }}>{e.eyebrow}</div>
                  <h4 className="text-lg sm:text-xl font-black text-white leading-tight mt-0.5">{e.name}</h4>
                  <p className="text-white/50 text-xs sm:text-sm mt-2">{e.scope}</p>
                  <div className="mt-4">
                    <div className="text-3xl sm:text-4xl font-black" style={{ color: e.color }}>{e.value}</div>
                    <div className="text-white/45 text-xs mt-1">{e.valueSub}</div>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {e.points.map((p) => (
                      <li key={p} className="flex items-start gap-2 text-xs sm:text-[13px] text-white/70">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: e.color, boxShadow: `0 0 6px ${e.color}` }} />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
            {i === 0 && (
              <div className="flex md:flex-col items-center justify-center gap-2 py-1 md:py-0">
                <div className="text-2xl font-black" style={{ color: C.gold }}>×</div>
                <div className="text-[10px] text-white/40 text-center leading-tight max-w-[70px]">эффект &gt; суммы</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2 · Effects by vector
// ─────────────────────────────────────────────────────────────────────────────
function VectorsSection({ reduced }: { reduced: boolean }) {
  return (
    <div>
      <Eyebrow color={C.climate}>Эффекты по векторам</Eyebrow>
      <h3 className="mt-4 text-xl sm:text-3xl font-bold text-white leading-tight">Пять направлений системного эффекта</h3>
      <p className="mt-3 text-white/55 text-sm sm:text-base max-w-2xl">
        Наука, экономика, инженерия, экология и социум — каждый вектор даёт измеримый результат.
      </p>
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {VECTORS.map((v, i) => (
          <Reveal key={v.id} reduced={reduced} delay={i * 0.05}>
            <div
              className="h-full rounded-2xl p-4 sm:p-5 transition-all hover:bg-white/[0.05]"
              style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${v.color}33` }}
            >
              <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: v.color }}>{v.vector}</div>
              <div className="text-2xl sm:text-3xl font-black mt-2" style={{ color: v.color }}>
                {v.metric.toLocaleString('ru-RU')}{v.metricSuffix}
              </div>
              <div className="text-[11px] text-white/45 mt-0.5">{v.metricLabel}</div>
              <div className="text-sm font-semibold text-white mt-3">{v.headline}</div>
              <p className="text-xs text-white/55 mt-1.5 leading-relaxed">{v.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3 · Project & product modules
// ─────────────────────────────────────────────────────────────────────────────
function ModulesSection({ reduced }: { reduced: boolean }) {
  return (
    <div>
      <Eyebrow color={C.accent2}>Модули проектов и продуктов</Eyebrow>
      <h3 className="mt-4 text-xl sm:text-3xl font-bold text-white leading-tight">Модули каждого вектора</h3>
      <p className="mt-3 text-white/55 text-sm sm:text-base max-w-2xl">
        Вода, энергия, агро, эко-город, логистика, наука и мониторинг — один связанный контур.
      </p>
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {MODULES.map((m, i) => (
          <Reveal key={m.id} reduced={reduced} delay={i * 0.04}>
            <div
              className="group h-full rounded-2xl p-4 flex gap-3 cursor-pointer transition-all hover:bg-white/[0.05]"
              style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${m.color}33` }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0" style={{ background: m.color + '1c', border: `1px solid ${m.color}44`, color: m.color }}>
                <Icon name={m.icon} />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-white leading-tight">{m.name}</div>
                <div className="text-[11px] font-semibold mt-0.5" style={{ color: m.color }}>{m.metric}</div>
                <p className="text-xs text-white/55 mt-1.5 leading-relaxed">{m.purpose}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4 · Ontological knowledge graph / libraries
// ─────────────────────────────────────────────────────────────────────────────
function KnowledgeSection({ reduced }: { reduced: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  // Radial layout for the graph nodes.
  const W = 340, H = 340, cx = W / 2, cy = H / 2, R = 128;
  const pos: Record<string, { x: number; y: number }> = {};
  LIBRARIES.forEach((l, i) => {
    const a = (i / LIBRARIES.length) * Math.PI * 2 - Math.PI / 2;
    pos[l.id] = { x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R };
  });

  return (
    <div>
      <Eyebrow color={C.climate}>Библиотеки знаний · граф знаний</Eyebrow>
      <h3 className="mt-4 text-xl sm:text-3xl font-bold text-white leading-tight">
        {KNOWLEDGE_TERM.title}
      </h3>
      <p className="mt-2 text-sm font-semibold" style={{ color: C.climate }}>{KNOWLEDGE_TERM.subtitle}</p>
      <p className="mt-3 text-white/55 text-sm sm:text-base max-w-2xl">{KNOWLEDGE_TERM.note}</p>

      {/* Graph — connected library nodes over SVG edges */}
      <div ref={ref} className="mt-5 rounded-2xl p-3 sm:p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="relative mx-auto" style={{ width: W, maxWidth: '100%', aspectRatio: `${W} / ${H}` }}>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
            {KNOWLEDGE_EDGES.map(([a, b], i) => {
              const pa = pos[a], pb = pos[b];
              if (!pa || !pb) return null;
              return (
                <motion.line
                  key={a + b}
                  x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
                  stroke={C.accent} strokeOpacity="0.28" strokeWidth="1.5"
                  initial={reduced ? false : { pathLength: 0, opacity: 0 }}
                  animate={inView && !reduced ? { pathLength: 1, opacity: 1 } : undefined}
                  transition={{ duration: 0.6, delay: 0.1 + i * 0.05 }}
                />
              );
            })}
            <circle cx={cx} cy={cy} r="22" fill={C.accent + '22'} stroke={C.accent} strokeOpacity="0.6" />
            <text x={cx} y={cy + 4} textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="700">ОНТО</text>
            {LIBRARIES.map((l, i) => {
              const p = pos[l.id];
              return (
                <motion.g
                  key={l.id}
                  initial={reduced ? false : { scale: 0, opacity: 0 }}
                  animate={inView && !reduced ? { scale: 1, opacity: 1 } : undefined}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.06 }}
                  style={{ transformOrigin: `${p.x}px ${p.y}px` }}
                >
                  <circle cx={p.x} cy={p.y} r="9" fill={l.color} fillOpacity="0.85" stroke={l.color} style={{ filter: `drop-shadow(0 0 6px ${l.color})` }} />
                  <text x={p.x} y={p.y - 14} textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="600" opacity="0.85">{l.domain}</text>
                </motion.g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Library cards (own + partner) */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {LIBRARIES.map((l, i) => (
          <Reveal key={l.id} reduced={reduced} delay={i * 0.04}>
            <div
              className="h-full rounded-2xl p-4 flex gap-3"
              style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${l.color}33` }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0" style={{ background: l.color + '1c', border: `1px solid ${l.color}44`, color: l.color }}>
                <BookOpen size={18} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="text-sm font-bold text-white leading-tight">{l.name}</div>
                  <span
                    className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase"
                    style={{ background: l.color + '22', color: l.color }}
                  >
                    {l.kind === 'own' ? 'своя' : 'партнёр'}
                  </span>
                </div>
                <p className="text-xs text-white/55 mt-1.5 leading-relaxed">{l.desc}</p>
                <div className="text-[10px] text-white/40 mt-2">{l.facet}</div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5 · DAO — connective layer
// ─────────────────────────────────────────────────────────────────────────────
function DaoSection({ reduced }: { reduced: boolean }) {
  return (
    <div>
      <Eyebrow color={C.accent}>DAO · связующий слой</Eyebrow>
      <h3 className="mt-4 text-xl sm:text-3xl font-bold text-white leading-tight">DAO как система интеграции</h3>
      <p className="mt-3 text-white/55 text-sm sm:text-base max-w-2xl">
        Управление, консенсус, финансирование и распределение эффективности связывают все модули в единый организм.
      </p>
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {DAO.map((d, i) => (
          <Reveal key={d.id} reduced={reduced} delay={i * 0.05}>
            <div
              className="h-full rounded-2xl p-4 flex gap-3"
              style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${d.color}33` }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0" style={{ background: d.color + '1c', border: `1px solid ${d.color}44`, color: d.color }}>
                <Icon name={d.icon} />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-white leading-tight">{d.title}</div>
                <p className="text-xs text-white/55 mt-1.5 leading-relaxed">{d.desc}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 6 · MRV / DePIN data products
// ─────────────────────────────────────────────────────────────────────────────
function DataProductsSection({ reduced }: { reduced: boolean }) {
  return (
    <div>
      <Eyebrow color={C.minerals}>Верификация данных · MRV + DePIN</Eyebrow>
      <h3 className="mt-4 text-xl sm:text-3xl font-bold text-white leading-tight">
        {MRV_TERM.title}
      </h3>
      <p className="mt-2 text-sm font-semibold" style={{ color: C.minerals }}>{MRV_TERM.subtitle}</p>
      <p className="mt-3 text-white/55 text-sm sm:text-base max-w-2xl">{MRV_TERM.note}</p>

      {/* Hash / token duality legend */}
      <div className="mt-5 flex flex-wrap gap-2">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold" style={{ background: C.accent2 + '18', color: C.accent2, border: `1px solid ${C.accent2}33` }}>
          <Hash size={13} /> хеш → неизменяемое доказательство факта
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold" style={{ background: C.energy + '18', color: C.energy, border: `1px solid ${C.energy}33` }}>
          <Coins size={13} /> токен эмиссии → данные становятся активом
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {DATA_PRODUCTS.map((p, i) => (
          <Reveal key={p.id} reduced={reduced} delay={i * 0.04}>
            <div
              className="h-full rounded-2xl p-4"
              style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${p.color}33` }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0" style={{ background: p.color + '1c', border: `1px solid ${p.color}44`, color: p.color }}>
                  <Icon name={p.icon} />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-white leading-tight">{p.name}</div>
                  <span
                    className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase"
                    style={{ background: (p.seal === 'hash' ? C.accent2 : C.energy) + '22', color: p.seal === 'hash' ? C.accent2 : C.energy }}
                  >
                    {p.seal === 'hash' ? <Hash size={9} /> : <Coins size={9} />} {p.sealLabel}
                  </span>
                </div>
              </div>
              <p className="text-xs text-white/55 mt-3 leading-relaxed">{p.desc}</p>
              <div className="text-[10px] text-white/40 mt-2 font-mono">{p.metric}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Root
// ─────────────────────────────────────────────────────────────────────────────
export default function KarakalpakCampaign({
  onOpenCampaigns,
}: {
  onOpenCampaigns?: () => void;
}) {
  const reduced = useReduced();
  const [, setLocation] = useLocation();

  return (
    <div
      className="rounded-3xl p-5 sm:p-8"
      style={{
        background: 'rgba(6,15,28,0.6)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
      }}
    >
      {/* Header */}
      <Eyebrow color={C.accent}>Кампания «Каракалпакия» · глубокое раскрытие</Eyebrow>
      <h2 className="mt-4 text-2xl sm:text-4xl font-bold text-white leading-tight">
        Регион как отработанный эталон подхода
      </h2>
      <p className="mt-3 text-white/55 text-sm sm:text-base max-w-2xl">
        Экономика, эффекты по векторам, модули, граф знаний, DAO и верифицируемые
        потоки данных — единая система, готовая к тиражированию.
      </p>

      <div className="mt-8 space-y-10 sm:space-y-14">
        <EconomicsSection reduced={reduced} />
        <VectorsSection reduced={reduced} />
        <ModulesSection reduced={reduced} />
        <KnowledgeSection reduced={reduced} />
        <DaoSection reduced={reduced} />
        <DataProductsSection reduced={reduced} />

        {/* Seam to Block 6 */}
        <div
          className="relative rounded-2xl p-5 sm:p-6 overflow-hidden"
          style={{ background: `linear-gradient(120deg, ${C.accent}12, ${C.accent2}0e)`, border: `1px solid ${C.accent}33` }}
        >
          <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full" style={{ background: C.accent + '22', filter: 'blur(48px)' }} />
          <div className="relative">
            <Sparkles size={22} style={{ color: C.accent }} />
            <p className="mt-3 text-white/75 text-sm sm:text-[15px] leading-relaxed max-w-3xl">
              Каждый контур — от региона до модуля — эмитирует собственный верифицируемый поток,
              который агрегируется в общую эффективность программы и в DAO. Так один регион
              становится шаблоном для всех остальных кампаний Земли и за её пределами.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={onOpenCampaigns}
                className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-semibold text-[#001018] transition-all hover:opacity-90 cursor-pointer"
                style={{ background: `linear-gradient(120deg, ${C.accent}, ${C.accent2})`, boxShadow: `0 8px 30px ${C.accent}44` }}
              >
                <Rocket size={18} /> Тиражировать по регионам
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </button>
              <button
                type="button"
                onClick={() => setLocation('/dao')}
                className="group inline-flex min-h-[44px] items-center gap-2 px-4 py-2.5 rounded-2xl font-medium text-white/80 transition-all hover:text-white hover:bg-white/[0.06] active:scale-95 cursor-pointer"
                style={{ border: `1px solid ${C.accent}55` }}
              >
                <Network size={16} style={{ color: C.accent }} /> Связующий слой — DAO
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" style={{ color: C.accent }} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
