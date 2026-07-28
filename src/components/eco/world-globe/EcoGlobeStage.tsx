import { useMemo, useState } from 'react';
import {
  Snowflake, Waves, Factory, Sprout, Wind, Droplet, CloudOff,
  MapPin, ArrowRight, type LucideIcon,
} from 'lucide-react';
import WorldGlobe from './WorldGlobe';
import { GLOBE_REGIONS } from './geo';
import { ECO_TIMELINE, terraformAt, activePhaseIndex } from '@/data/eco-timeline';

const ICONS: Record<string, LucideIcon> = {
  Snowflake, Waves, Factory, Sprout, Wind, Droplet, CloudOff,
};

/** Region long-form copy for the interactive panel (Block-2 replacement). */
const REGION_INFO: Record<string, { body: string; stats: [string, string][] }> = {
  aral: {
    body: 'Флагманский полигон. Здесь мы восстанавливаем водный баланс: MRV-мониторинг, DePIN-датчики, лесополосы против солевых бурь.',
    stats: [['Потеря объёма', '−90%'], ['Аралкум', '60 000 км²'], ['Цель', 'Возрождение']],
  },
  amudarya: {
    body: 'Главная питающая артерия. Умный учёт водозабора и распределение стока — основа возврата воды в море.',
    stats: [['Длина', '2 400 км'], ['Забор', 'под контроль'], ['Роль', 'Питание']],
  },
  syrdarya: {
    body: 'Северный контур. Кокаральская плотина уже вернула Малый Арал — доказательство, что путь возможен.',
    stats: [['Длина', '2 212 км'], ['Малый Арал', '+3.3 м'], ['Роль', 'Контур']],
  },
  tashkent: {
    body: 'Хаб региона: данные, управление, DAO-координация участников экосистемы ARKHEOSIUM.',
    stats: [['Функция', 'Хаб'], ['Управление', 'DAO'], ['Слой', 'Оркестрация']],
  },
};

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="mb-2.5">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[11px] font-medium text-white/60">{label}</span>
        <span className="text-[11px] font-bold" style={{ color }}>
          {Math.round(value * 100)}%
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/8">
        <div
          className="h-full rounded-full transition-[width] duration-500 ease-out"
          style={{ width: `${Math.round(value * 100)}%`, background: color, boxShadow: `0 0 8px ${color}` }}
        />
      </div>
    </div>
  );
}

export interface EcoGlobeStageProps {
  /** Timelapse scrub 0..1. */
  progress: number;
  /** True once the scrub reaches the present → same globe turns interactive. */
  interactive: boolean;
  /** Navigate to the Aral deep-dive. */
  onRequestNavigate?: () => void;
}

/**
 * ONE sticky globe with information arranged AROUND it (never covering it).
 * Left: the era narrative. Right: live terraforming telemetry (real physical
 * state, not a colour wash). When the scrub reaches the present, the SAME globe
 * becomes interactive — region markers, camera fly-to, region briefings.
 */
export default function EcoGlobeStage({ progress, interactive, onRequestNavigate }: EcoGlobeStageProps) {
  const [selected, setSelected] = useState<string | null>('aral');

  const idx = activePhaseIndex(progress);
  const phase = ECO_TIMELINE[idx];
  const terra = useMemo(() => terraformAt(progress), [progress]);
  const Icon = ICONS[phase.icon] ?? Droplet;

  const region = selected ? GLOBE_REGIONS.find((r) => r.id === selected) ?? null : null;
  const focusLatLng = interactive && region ? { lat: region.lat, lng: region.lng } : null;

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* ── The single globe (background layer) ── */}
      <div className="absolute inset-0">
        <WorldGlobe
          progress={progress}
          autoRotate={!interactive}
          interactive={interactive}
          showRegions={interactive}
          activeRegion={selected}
          focusLatLng={focusLatLng}
          onRegionClick={setSelected}
        />
      </div>

      {/* radial vignette keeps side cards legible without covering the globe */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at 50% 50%, transparent 34%, rgba(1,8,16,0.62) 82%)' }}
      />

      {/* ── LEFT: era narrative (timelapse) ── */}
      {!interactive && (
        <div className="pointer-events-none absolute left-4 top-1/2 w-[min(340px,42vw)] -translate-y-1/2 sm:left-8">
          <div
            className="pointer-events-auto rounded-3xl px-5 py-5"
            style={{
              background: 'rgba(6,15,28,0.6)',
              border: `1px solid ${phase.accent}44`,
              boxShadow: `0 16px 50px rgba(0,0,0,0.5), 0 0 34px ${phase.accent}18`,
              backdropFilter: 'blur(22px)',
            }}
          >
            <div className="mb-3 flex items-center gap-2.5">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: `${phase.accent}18`, border: `1px solid ${phase.accent}44` }}
              >
                <Icon size={20} style={{ color: phase.accent }} />
              </div>
              <div
                className="rounded-full px-2.5 py-1 text-[11px] font-black tracking-[0.15em]"
                style={{ color: phase.accent, background: `${phase.accent}14`, border: `1px solid ${phase.accent}33` }}
              >
                {phase.year}
              </div>
            </div>
            <h3 className="mb-2 text-xl font-black text-white sm:text-2xl">{phase.title}</h3>
            <p className="text-[13px] leading-relaxed text-white/60">{phase.body}</p>
          </div>
        </div>
      )}

      {/* ── RIGHT: live terraforming telemetry (schemes, not 4 vectors) ── */}
      {!interactive && (
        <div className="pointer-events-none absolute right-4 top-1/2 w-[min(300px,40vw)] -translate-y-1/2 sm:right-8">
          <div
            className="pointer-events-auto rounded-3xl px-5 py-5"
            style={{
              background: 'rgba(6,15,28,0.6)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 16px 50px rgba(0,0,0,0.5)',
              backdropFilter: 'blur(22px)',
            }}
          >
            <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">
              Состояние планеты
            </div>
            <StatBar label="Ледники (полярные шапки)" value={terra.glaciation} color="#7dd3fc" />
            <StatBar label="Аридизация суши" value={terra.aridity} color="#e8a13a" />
            <StatBar label="Усыхание Арала" value={terra.aralDry} color="#d97706" />
            <div className="mt-4 border-t border-white/8 pt-3 text-[11px] leading-relaxed text-white/45">
              Модель тераформирования в реальном времени: геометрия льдов и водоёмов
              меняется физически — не цветовой фильтр.
            </div>
          </div>
        </div>
      )}

      {/* ── INTERACTIVE: region briefing (Block-2 on the SAME globe) ── */}
      {interactive && region && (
        <div className="pointer-events-none absolute right-4 top-1/2 w-[min(340px,44vw)] -translate-y-1/2 sm:right-10">
          <div
            key={region.id}
            className="pointer-events-auto rounded-3xl px-5 py-5"
            style={{
              background: 'rgba(6,15,28,0.62)',
              border: `1px solid ${region.color}55`,
              boxShadow: `0 16px 50px rgba(0,0,0,0.5), 0 0 34px ${region.color}22`,
              backdropFilter: 'blur(22px)',
            }}
          >
            <div className="mb-3 flex items-center gap-2">
              <MapPin size={16} style={{ color: region.color }} />
              <span className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: region.color }}>
                {region.sub}
              </span>
            </div>
            <h3 className="mb-2 text-2xl font-black text-white">{region.label}</h3>
            <p className="mb-4 text-[13px] leading-relaxed text-white/60">{REGION_INFO[region.id]?.body}</p>

            <div className="mb-4 grid grid-cols-3 gap-2">
              {REGION_INFO[region.id]?.stats.map(([k, v]) => (
                <div
                  key={k}
                  className="rounded-xl px-2 py-2 text-center"
                  style={{ background: `${region.color}12`, border: `1px solid ${region.color}28` }}
                >
                  <div className="text-sm font-black text-white">{v}</div>
                  <div className="mt-0.5 text-[9px] font-medium leading-tight text-white/45">{k}</div>
                </div>
              ))}
            </div>

            {region.id === 'aral' && (
              <button
                onClick={onRequestNavigate}
                className="group flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-bold text-[#012] transition-all active:scale-95"
                style={{ background: region.color, boxShadow: `0 0 22px ${region.color}66`, cursor: 'pointer' }}
              >
                Открыть историю Арала
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── INTERACTIVE hint (left) ── */}
      {interactive && (
        <div className="pointer-events-none absolute left-4 top-1/2 w-[min(260px,40vw)] -translate-y-1/2 sm:left-10">
          <div
            className="rounded-2xl px-4 py-3"
            style={{
              background: 'rgba(6,15,28,0.55)',
              border: '1px solid rgba(0,212,255,0.22)',
              backdropFilter: 'blur(18px)',
            }}
          >
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#7dd3fc]">
              Настоящее · интерактив
            </div>
            <p className="mt-1.5 text-[12px] leading-relaxed text-white/55">
              Вращайте планету и нажимайте на узлы экосистемы, чтобы изучить регион.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
