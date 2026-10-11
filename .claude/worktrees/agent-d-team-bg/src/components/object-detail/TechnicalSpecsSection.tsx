import { motion } from 'framer-motion';
import { Wrench } from 'lucide-react';
import type { FullObjectData } from '@/types/object-full';

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div
      className="w-full h-1.5 rounded-full overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.06)' }}
    >
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: `${Math.min(100, value)}%` }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="h-full rounded-full"
        style={{ background: color }}
      />
    </div>
  );
}

function wearBarColor(pct: number): string {
  if (pct >= 75) return '#ff4d6d';
  if (pct >= 55) return '#fb923c';
  if (pct >= 30) return '#fbbf24';
  return '#4ade80';
}

// ─── Row ──────────────────────────────────────────────────────────────────────

function SpecRow({
  label,
  value,
  children,
}: {
  label: string;
  value?: string | React.ReactNode;
  children?: React.ReactNode;
}) {
  if (value == null && !children) return null;
  return (
    <div className="py-2.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
      <div className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-1">{label}</div>
      {children ? children : <div className="text-white/90 font-semibold text-sm">{value}</div>}
    </div>
  );
}

// ─── Technology chip ──────────────────────────────────────────────────────────

function TechChip({ label }: { label: string }) {
  return (
    <span
      className="px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{
        background: 'rgba(0,230,200,0.1)',
        color: '#00e6c8',
        border: '1px solid rgba(0,230,200,0.2)',
      }}
    >
      {label}
    </span>
  );
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function n(v: number | undefined, suffix = ''): string | undefined {
  if (v == null) return undefined;
  return `${v.toLocaleString('ru')}${suffix ? ' ' + suffix : ''}`;
}

function pct(actual?: number, design?: number): string | undefined {
  if (!actual || !design) return undefined;
  return `${Math.round((actual / design) * 100)}%`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TechnicalSpecsSection({ object }: { object: FullObjectData }) {
  const wearVal = object.wear_pct ?? 0;
  const autoVal = object.automation_level_pct ?? 0;

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl p-6"
      style={{
        background: 'rgba(0,6,20,0.85)',
        border: '1px solid rgba(0,230,200,0.15)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(0,230,200,0.12)', border: '1px solid rgba(0,230,200,0.2)' }}
        >
          <Wrench size={17} style={{ color: '#00e6c8' }} />
        </div>
        <h2 className="text-white font-black text-xl">Технические характеристики</h2>
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
        {/* Left column — structural */}
        <div>
          <div className="text-white/25 text-xs font-semibold uppercase tracking-widest mb-3 pb-2"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            Общие данные
          </div>

          <SpecRow label="Год постройки" value={n(object.construction_year)} />
          <SpecRow label="Последняя реконструкция" value={n(object.last_renovation_year)} />
          <SpecRow label="Проектная мощность" value={n(object.design_capacity_m3_per_day, 'м³/сут')} />
          <SpecRow label="Фактическая мощность" value={n(object.actual_capacity_m3_per_day, 'м³/сут')} />
          <SpecRow
            label="Загрузка мощности"
            value={pct(object.actual_capacity_m3_per_day, object.design_capacity_m3_per_day)}
          />
          {object.dam_height_m != null && (
            <SpecRow label="Высота плотины" value={n(object.dam_height_m, 'м')} />
          )}
          {object.dam_length_m != null && (
            <SpecRow label="Длина плотины" value={n(object.dam_length_m, 'м')} />
          )}
          <SpecRow label="Общий объём" value={n(object.total_volume_m3, 'м³')} />
          <SpecRow label="Полезный объём" value={n(object.useful_volume_m3, 'м³')} />
          <SpecRow label="Площадь водосбора" value={n(object.catchment_area_km2, 'км²')} />
        </div>

        {/* Right column — mechanical */}
        <div>
          <div className="text-white/25 text-xs font-semibold uppercase tracking-widest mb-3 pb-2"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            Механика и эксплуатация
          </div>

          <SpecRow label="Насосных станций" value={n(object.pump_stations_count)} />
          <SpecRow label="Установленная мощность" value={n(object.total_pump_power_kw, 'кВт')} />
          <SpecRow label="Протяжённость труб" value={n(object.pipeline_length_km, 'км')} />
          <SpecRow label="Диаметр магистрали" value={n(object.pipeline_diameter_mm, 'мм')} />

          {/* Automation progress */}
          <SpecRow label="Автоматизация">
            <div className="flex items-center gap-3">
              <span className="text-white/90 font-semibold text-sm tabular-nums w-10">{autoVal}%</span>
              <div className="flex-1">
                <ProgressBar value={autoVal} color="#00e6c8" />
              </div>
            </div>
          </SpecRow>

          {/* Treatment technologies chips */}
          {object.treatment_technologies && object.treatment_technologies.length > 0 && (
            <SpecRow label="Технологии очистки">
              <div className="flex flex-wrap gap-1.5 mt-0.5">
                {object.treatment_technologies.map((t, i) => (
                  <TechChip key={i} label={t} />
                ))}
              </div>
            </SpecRow>
          )}

          <SpecRow label="Расход энергии" value={n(object.energy_kwh_per_m3, 'кВт·ч/м³')} />

          {/* Wear progress */}
          {object.wear_pct != null && (
            <SpecRow label="Износ оборудования">
              <div className="flex items-center gap-3">
                <span
                  className="font-semibold text-sm tabular-nums w-10"
                  style={{ color: wearBarColor(wearVal) }}
                >
                  {wearVal}%
                </span>
                <div className="flex-1">
                  <ProgressBar value={wearVal} color={wearBarColor(wearVal)} />
                </div>
              </div>
            </SpecRow>
          )}
        </div>
      </div>
    </motion.section>
  );
}
