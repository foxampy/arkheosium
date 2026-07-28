import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  Layers, Rocket, Globe2, Users, ArrowRight, Check,
  Infinity as InfinityIcon, Sparkles, Gauge,
} from 'lucide-react';

/**
 * Block 4 — Дорожная карта → выбор программы → параллельный split.
 *
 * Self-contained: mirrors the AralSeaProjectPage palette/glass style so it can be
 * dropped straight into the chapters column. The user picks one of two programs;
 * EITHER choice opens an info block where the visualization splits in half and
 * shows BOTH programs in parallel (region campaign = worked example of the whole
 * approach). Economics are multiplicative, not additive: the general program
 * ($0.5T) is many times more profitable than even the full Karakalpakia campaign
 * ($250M), because integrating every vector yields a systemic multiplier.
 */

const C = {
  accent: '#00e6c8',
  accent2: '#00d4ff',
  campaign: '#a3e635', // Karakalpakia — regional / agriculture-green
  program: '#00d4ff', // general program — global / cyan
  gold: '#f59e0b',
};

type ChoiceKey = 'campaign' | 'program';

interface ProgramDef {
  key: ChoiceKey;
  eyebrow: string;
  name: string;
  scope: string;
  value: string;
  valueSub: string;
  color: string;
  icon: React.ReactNode;
  points: string[];
}

const PROGRAMS: Record<ChoiceKey, ProgramDef> = {
  campaign: {
    key: 'campaign',
    eyebrow: 'Региональный эталон',
    name: 'Кампания «Каракалпакия»',
    scope: 'Один регион как рабочий пример подхода',
    value: '$250 млн',
    valueSub: 'самодостаточна при интеграции всех модулей',
    color: C.campaign,
    icon: <Layers size={22} />,
    points: [
      'Глубокие исследования и региональная системность',
      'Все модули (вода, энергия, агро, эко-город) в одном контуре',
      'Рентабельна сама по себе, окупается внутри региона',
      'Интеграция в DAO: управление, консенсус, распределение',
    ],
  },
  program: {
    key: 'program',
    eyebrow: 'Глобальная интеграция',
    name: 'Общая программа Проекта',
    scope: 'Тиражирование по всем регионам Земли и за её пределами',
    value: '$0.5 трлн',
    valueSub: 'мультипликативная эффективность по ВСЕМ модулям',
    color: C.program,
    icon: <Globe2 size={22} />,
    points: [
      'Совместная работа всех модулей / систем / кампаний',
      'Готовность разворачивать такие же кампании где угодно',
      'Колонизация и новые сферы интегрирования',
      'Системный множитель: эффект > суммы кампаний',
    ],
  },
};

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

function ProgramPanel({
  def, active, dimmed, reduced,
}: {
  def: ProgramDef; active: boolean; dimmed: boolean; reduced: boolean;
}) {
  return (
    <motion.div
      layout={!reduced}
      animate={{ opacity: dimmed ? 0.62 : 1, scale: dimmed ? 0.99 : 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative flex-1 rounded-3xl p-5 sm:p-6 overflow-hidden"
      style={{
        background: active
          ? `linear-gradient(160deg, ${def.color}1c, rgba(6,15,28,0.7))`
          : 'rgba(6,15,28,0.6)',
        border: `1px solid ${active ? def.color + '77' : 'rgba(255,255,255,0.09)'}`,
        boxShadow: active ? `0 12px 48px ${def.color}22, inset 0 0 40px ${def.color}0f` : 'none',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
      }}
    >
      <div
        className="absolute -right-16 -top-16 w-52 h-52 rounded-full pointer-events-none"
        style={{ background: def.color + '22', filter: 'blur(60px)' }}
      />
      <div className="relative">
        {active && (
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide mb-3"
            style={{ background: def.color + '22', color: def.color, border: `1px solid ${def.color}55` }}
          >
            <Check size={11} /> Ваш выбор
          </div>
        )}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-2xl flex-shrink-0"
            style={{ background: def.color + '1c', border: `1px solid ${def.color}44`, color: def.color }}
          >
            {def.icon}
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: def.color }}>
              {def.eyebrow}
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white leading-tight">{def.name}</h3>
          </div>
        </div>

        <p className="text-white/50 text-xs sm:text-sm mb-4">{def.scope}</p>

        <div className="mb-5">
          <div className="text-3xl sm:text-4xl font-black" style={{ color: def.color }}>
            {def.value}
          </div>
          <div className="text-white/45 text-xs mt-1">{def.valueSub}</div>
        </div>

        <ul className="space-y-2">
          {def.points.map((p) => (
            <li key={p} className="flex items-start gap-2 text-xs sm:text-[13px] text-white/70">
              <span
                className="mt-1 h-1.5 w-1.5 rounded-full flex-shrink-0"
                style={{ background: def.color, boxShadow: `0 0 6px ${def.color}` }}
              />
              {p}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

export default function DualProgramStage({
  onOpenCampaign,
}: {
  onOpenCampaign?: () => void;
}) {
  const reduced = useReduced();
  const [, setLocation] = useLocation();
  const [choice, setChoice] = useState<ChoiceKey | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { once: true, margin: '-60px' });

  const order = useMemo<ChoiceKey[]>(() => ['campaign', 'program'], []);

  return (
    <div
      ref={rootRef}
      className="rounded-3xl p-5 sm:p-8"
      style={{
        background: 'rgba(6,15,28,0.6)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
      }}
    >
      {/* Eyebrow + heading */}
      <div
        className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase mb-4"
        style={{ background: C.accent + '18', color: C.accent, border: `1px solid ${C.accent}33` }}
      >
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: C.accent }} />
        Дорожная карта · выбор программы
      </div>
      <h2 className="text-2xl sm:text-4xl font-bold text-white leading-tight">
        Куда ведёт путь Арала
      </h2>
      <p className="mt-3 text-white/55 text-sm sm:text-base max-w-2xl">
        Выберите точку входа — и любой путь раскроет <span className="text-white/80 font-semibold">обе программы параллельно</span>.
        Регион Каракалпакия — эталонный пример подхода ко всем остальным кампаниям.
      </p>

      {/* Choice module */}
      <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {order.map((k) => {
          const def = PROGRAMS[k];
          const selected = choice === k;
          return (
            <button
              key={k}
              onClick={() => setChoice(k)}
              className="group relative flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left cursor-pointer transition-all active:scale-[0.98]"
              style={{
                background: selected ? def.color + '1c' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${selected ? def.color + '88' : 'rgba(255,255,255,0.1)'}`,
                boxShadow: selected ? `0 8px 30px ${def.color}33` : 'none',
              }}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0"
                style={{ background: def.color + '1c', border: `1px solid ${def.color}44`, color: def.color }}
              >
                {k === 'campaign' ? <Layers size={18} /> : <Globe2 size={18} />}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-white leading-tight">
                  {k === 'campaign' ? 'Открыть кампанию Каракалпакия' : 'Открыть общую программу'}
                </div>
                <div className="text-[11px] mt-0.5" style={{ color: def.color }}>
                  {def.value} · {k === 'campaign' ? 'региональный эталон' : 'глобальная интеграция'}
                </div>
              </div>
              <ArrowRight
                size={16}
                className="ml-auto flex-shrink-0 text-white/40 transition-transform group-hover:translate-x-1"
              />
            </button>
          );
        })}
      </div>

      {/* Parallel split — appears after a choice, shows BOTH programs */}
      <AnimatePresence>
        {choice && (
          <motion.div
            initial={reduced ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={reduced ? undefined : { opacity: 0, height: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="mt-6">
              {/* Multiplier seam between the two programs */}
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, transparent, ${C.gold}55, transparent)` }} />
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold"
                  style={{ background: C.gold + '18', color: C.gold, border: `1px solid ${C.gold}44` }}
                >
                  <InfinityIcon size={13} /> эффект мультипликативен, не аддитивен
                </div>
                <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, transparent, ${C.gold}55, transparent)` }} />
              </div>

              <div className="flex flex-col md:flex-row gap-3 md:items-stretch">
                <ProgramPanel def={PROGRAMS.campaign} active={choice === 'campaign'} dimmed={choice !== 'campaign'} reduced={reduced} />

                {/* × connector */}
                <div className="flex md:flex-col items-center justify-center gap-2 py-1 md:py-0">
                  <div className="text-2xl font-black" style={{ color: C.gold }}>×</div>
                  <div className="text-[10px] text-white/40 text-center leading-tight max-w-[70px]">
                    системный множитель
                  </div>
                </div>

                <ProgramPanel def={PROGRAMS.program} active={choice === 'program'} dimmed={choice !== 'program'} reduced={reduced} />
              </div>

              {/* Narrative + onward CTA */}
              <motion.div
                initial={reduced ? false : { opacity: 0, y: 16 }}
                animate={inView ? { opacity: 1, y: 0 } : undefined}
                transition={{ delay: 0.15, duration: 0.5 }}
                className="mt-5 relative rounded-2xl p-5 overflow-hidden"
                style={{ background: `linear-gradient(120deg, ${C.accent}12, ${C.accent2}0e)`, border: `1px solid ${C.accent}33` }}
              >
                <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full" style={{ background: C.accent + '22', filter: 'blur(48px)' }} />
                <div className="relative">
                  <Sparkles size={22} style={{ color: C.accent }} />
                  <p className="mt-3 text-white/75 text-sm sm:text-[15px] leading-relaxed max-w-3xl">
                    Только <span className="text-white font-semibold">прямая интеграция всех проектов и кампаний</span> ведёт
                    к процветанию. Каракалпакия окупается сама; общая программа — в разы рентабельнее,
                    потому что связывает каждый вектор (экология, R&D, экономика, наука, соц. программы)
                    в единый граф знаний и DAO.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      onClick={onOpenCampaign}
                      className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-semibold text-[#001018] transition-all hover:opacity-90 cursor-pointer"
                      style={{ background: `linear-gradient(120deg, ${C.accent}, ${C.accent2})`, boxShadow: `0 8px 30px ${C.accent}44` }}
                    >
                      <Rocket size={18} /> Раскрыть кампанию Каракалпакия
                      <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setLocation('/dao')}
                      className="group inline-flex min-h-[44px] items-center gap-2 px-4 py-2.5 rounded-2xl font-medium text-white/80 transition-all hover:text-white hover:bg-white/[0.06] active:scale-95 cursor-pointer"
                      style={{ border: `1px solid ${C.accent}55` }}
                    >
                      <Users size={16} style={{ color: C.accent }} /> Связующий слой — DAO
                      <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" style={{ color: C.accent }} />
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!choice && (
        <div className="mt-5 flex items-center gap-2 text-white/35 text-xs">
          <Gauge size={14} /> выберите программу выше, чтобы раскрыть параллельное сравнение
        </div>
      )}
    </div>
  );
}
