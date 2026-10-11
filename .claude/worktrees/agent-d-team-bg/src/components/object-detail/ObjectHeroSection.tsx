import { motion } from 'framer-motion';
import { ChevronLeft, Droplets, Users, AlertTriangle, Activity, Map } from 'lucide-react';
import { useLocation } from 'wouter';
import type { FullObjectData } from '@/types/object-full';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtCapacity(n?: number): string {
  if (!n) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return n.toLocaleString('ru');
}

function fmtPopulation(n?: number): string {
  if (!n) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString('ru');
}

function fmtArea(n?: number): string {
  if (!n) return '—';
  return n.toLocaleString('ru');
}

function wearColor(pct?: number): string {
  if (!pct) return '#4ade80';
  if (pct >= 75) return '#ff4d6d';
  if (pct >= 55) return '#fb923c';
  if (pct >= 30) return '#fbbf24';
  return '#4ade80';
}

function qualityColor(idx?: number): string {
  if (!idx) return '#00e6c8';
  if (idx >= 85) return '#00e6c8';
  if (idx >= 65) return '#fbbf24';
  return '#ff4d6d';
}

function statusConfig(status: string): { color: string; bg: string; border: string; label: string } {
  switch (status) {
    case 'operational':
      return { color: '#4ade80', bg: 'rgba(74,222,128,0.15)', border: 'rgba(74,222,128,0.3)', label: 'Эксплуатируется' };
    case 'degraded':
      return { color: '#fbbf24', bg: 'rgba(251,191,36,0.15)', border: 'rgba(251,191,36,0.3)', label: 'Деградированное' };
    case 'critical':
      return { color: '#ff4d6d', bg: 'rgba(255,77,109,0.15)', border: 'rgba(255,77,109,0.3)', label: 'Критическое' };
    case 'offline':
      return { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.2)', label: 'Не работает' };
    case 'under_construction':
      return { color: '#60a5fa', bg: 'rgba(96,165,250,0.15)', border: 'rgba(96,165,250,0.3)', label: 'Строится' };
    default:
      return { color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.2)', label: status };
  }
}

function typeLabel(type: string): string {
  const map: Record<string, string> = {
    dam: 'Плотина',
    reservoir: 'Водохранилище',
    irrigation_canal: 'Канал',
    pumping_station: 'Насосная станция',
    water_treatment_facility: 'Водоочистная станция',
    mountain_lake: 'Горное озеро',
    pipeline: 'Трубопровод',
    wastewater_plant: 'Очистные сооружения',
    desalination_plant: 'Опреснительная установка',
    groundwater_well: 'Скважина',
  };
  return map[type] ?? type;
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  unit,
  color,
  icon: Icon,
}: {
  label: string;
  value: string;
  unit: string;
  color: string;
  icon: React.ElementType;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="rounded-2xl p-4 flex-1 min-w-0"
      style={{
        background: 'rgba(0,6,20,0.85)',
        border: `1px solid ${color}25`,
        backdropFilter: 'blur(12px)',
      }}
    >
      <Icon size={14} style={{ color }} className="mb-2 opacity-80" />
      <div className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-1 truncate">{label}</div>
      <div className="font-black text-xl tabular-nums leading-tight" style={{ color }}>
        {value}
        {unit && <span className="text-white/40 font-normal text-xs ml-1">{unit}</span>}
      </div>
    </motion.div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ObjectHeroSection({ object }: { object: FullObjectData }) {
  const [, setLocation] = useLocation();
  const status = statusConfig(object.status);
  const wc = wearColor(object.wear_pct);
  const qc = qualityColor(object.quality_index);

  return (
    <div className="relative overflow-hidden" style={{ minHeight: 420 }}>
      {/* Background image */}
      {object.cover_image_url ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${object.cover_image_url})` }}
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(0,8,18,1) 0%, rgba(0,16,40,1) 50%, rgba(0,8,18,1) 100%)',
          }}
        />
      )}

      {/* Dark overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, rgba(0,8,18,0.55) 0%, rgba(0,8,18,0.92) 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-5 pt-6 pb-8">
        {/* Top row: breadcrumb + badges */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between flex-wrap gap-3 mb-8"
        >
          <button
            onClick={() => setLocation('/hub')}
            className="flex items-center gap-1.5 text-white/50 hover:text-white/80 transition-colors text-sm"
          >
            <ChevronLeft size={16} />
            <span>Объекты</span>
            <span className="text-white/25 mx-1">/</span>
            <span className="text-white/70 truncate max-w-48">{object.name_ru}</span>
          </button>

          <div className="flex items-center gap-2">
            <span
              className="px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: status.bg, color: status.color, border: `1px solid ${status.border}` }}
            >
              {status.label}
            </span>
            <span
              className="px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{
                background: 'rgba(96,165,250,0.12)',
                color: '#60a5fa',
                border: '1px solid rgba(96,165,250,0.25)',
              }}
            >
              {typeLabel(object.type)}
            </span>
          </div>
        </motion.div>

        {/* Main title */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-6"
        >
          <h1 className="text-white font-black text-4xl leading-tight mb-3">{object.name_ru}</h1>
          <div className="flex items-center flex-wrap gap-4 text-white/50 text-sm">
            {object.region && (
              <span className="flex items-center gap-1.5">
                <Map size={13} className="opacity-60" />
                {object.region}
              </span>
            )}
            {object.country && <span>{object.country}</span>}
            {object.construction_year && (
              <span>Построено в {object.construction_year} г.</span>
            )}
          </div>
          {object.description_ru && (
            <p className="text-white/70 text-sm leading-relaxed mt-3 max-w-3xl">
              {object.description_ru.slice(0, 280)}{object.description_ru.length > 280 ? '…' : ''}
            </p>
          )}
        </motion.div>

        {/* KPI cards */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="flex gap-3 flex-wrap sm:flex-nowrap"
        >
          <KpiCard
            label="Мощность"
            value={fmtCapacity(object.actual_capacity_m3_per_day)}
            unit="м³/сут"
            color="#00e6c8"
            icon={Droplets}
          />
          <KpiCard
            label="Население"
            value={fmtPopulation(object.serves_population)}
            unit="чел."
            color="#60a5fa"
            icon={Users}
          />
          <KpiCard
            label="Износ"
            value={object.wear_pct != null ? `${object.wear_pct}` : '—'}
            unit={object.wear_pct != null ? '%' : ''}
            color={wc}
            icon={AlertTriangle}
          />
          <KpiCard
            label="Качество воды"
            value={object.quality_index != null ? `${object.quality_index}` : '—'}
            unit={object.quality_index != null ? '/100' : ''}
            color={qc}
            icon={Activity}
          />
          <KpiCard
            label="Площадь"
            value={fmtArea(object.service_area_km2)}
            unit="км²"
            color="#a78bfa"
            icon={Map}
          />
        </motion.div>
      </div>
    </div>
  );
}
