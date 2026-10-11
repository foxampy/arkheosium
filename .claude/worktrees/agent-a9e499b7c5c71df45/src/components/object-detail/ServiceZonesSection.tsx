import { motion } from 'framer-motion';
import { MapPin, Building2, Map, Factory, Leaf, Users, AlertTriangle } from 'lucide-react';
import type { FullObjectData, ServiceZone } from '@/types/object-full';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtPop(n?: number): string {
  if (!n) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString('ru');
}

function zoneConfig(type: ServiceZone['type']): {
  icon: React.ElementType;
  color: string;
  label: string;
} {
  switch (type) {
    case 'city':
      return { icon: Building2, color: '#60a5fa', label: 'Город' };
    case 'district':
      return { icon: Map, color: '#a78bfa', label: 'Район' };
    case 'industrial':
      return { icon: Factory, color: '#fb923c', label: 'Промзона' };
    case 'agricultural':
      return { icon: Leaf, color: '#4ade80', label: 'Сельское хоз.' };
    default:
      return { icon: MapPin, color: '#00e6c8', label: type };
  }
}

// ─── Zone Card ────────────────────────────────────────────────────────────────

function ZoneCard({ zone, index }: { zone: ServiceZone; index: number }) {
  const cfg = zoneConfig(zone.type);
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ y: -4 }}
      className="rounded-xl p-4 relative overflow-hidden"
      style={{
        background: 'rgba(0,6,20,0.7)',
        border: `1px solid ${cfg.color}20`,
      }}
    >
      {/* Left color accent */}
      <div
        className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-xl"
        style={{ background: cfg.color }}
      />

      <div className="pl-3">
        <div className="flex items-start gap-3 mb-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: `${cfg.color}15`, border: `1px solid ${cfg.color}25` }}
          >
            <Icon size={14} style={{ color: cfg.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white font-semibold text-sm truncate">{zone.name}</div>
            <div className="text-xs mt-0.5" style={{ color: cfg.color }}>{cfg.label}</div>
          </div>
        </div>

        <div className="space-y-1.5">
          {zone.population != null && (
            <div className="flex justify-between items-center">
              <span className="text-white/40 text-xs">Население</span>
              <span className="text-[#00e6c8] font-bold text-sm tabular-nums">{fmtPop(zone.population)}</span>
            </div>
          )}
          {zone.area_km2 != null && (
            <div className="flex justify-between items-center">
              <span className="text-white/40 text-xs">Площадь</span>
              <span className="text-white/60 text-sm tabular-nums">{zone.area_km2.toLocaleString('ru')} км²</span>
            </div>
          )}
          {zone.water_demand_m3_per_day != null && (
            <div className="flex justify-between items-center">
              <span className="text-white/40 text-xs">Потребность воды</span>
              <span className="text-white/60 text-sm tabular-nums">
                {(zone.water_demand_m3_per_day / 1000).toFixed(0)}K м³/сут
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ServiceZonesSection({ object }: { object: FullObjectData }) {
  const zones = object.service_zones ?? [];
  const hasUnserved = (object.unserved_population ?? 0) > 0;

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
      {/* Header row */}
      <div className="flex items-center flex-wrap gap-3 mb-6">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.2)' }}
        >
          <MapPin size={17} style={{ color: '#60a5fa' }} />
        </div>
        <h2 className="text-white font-black text-xl flex-1">Зоны обслуживания</h2>

        {object.serves_population != null && (
          <span
            className="px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5"
            style={{ background: 'rgba(0,230,200,0.12)', color: '#00e6c8', border: '1px solid rgba(0,230,200,0.2)' }}
          >
            <Users size={11} />
            {fmtPop(object.serves_population)} чел.
          </span>
        )}

        {hasUnserved && (
          <span
            className="px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5"
            style={{ background: 'rgba(255,77,109,0.12)', color: '#ff4d6d', border: '1px solid rgba(255,77,109,0.25)' }}
          >
            <AlertTriangle size={11} />
            Без воды: {fmtPop(object.unserved_population)}
          </span>
        )}
      </div>

      {/* Zones grid */}
      {zones.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          {zones.map((zone, i) => (
            <ZoneCard key={i} zone={zone} index={i} />
          ))}
        </div>
      ) : (
        <div className="py-8 text-center text-white/25 text-sm mb-6">
          Данные о зонах обслуживания отсутствуют
        </div>
      )}

      {/* Bottom stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div
          className="rounded-xl p-4"
          style={{ background: 'rgba(0,230,200,0.06)', border: '1px solid rgba(0,230,200,0.12)' }}
        >
          <div className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-1">Всего населения</div>
          <div className="text-[#00e6c8] font-black text-2xl tabular-nums">
            {fmtPop(object.serves_population)}
            <span className="text-white/30 font-normal text-sm ml-1">чел.</span>
          </div>
        </div>

        <div
          className="rounded-xl p-4"
          style={{ background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.12)' }}
        >
          <div className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-1">Площадь обслуживания</div>
          <div className="text-[#a78bfa] font-black text-2xl tabular-nums">
            {object.service_area_km2 != null
              ? object.service_area_km2.toLocaleString('ru')
              : '—'}
            <span className="text-white/30 font-normal text-sm ml-1">км²</span>
          </div>
        </div>

        <div
          className="rounded-xl p-4"
          style={{
            background: hasUnserved ? 'rgba(255,77,109,0.08)' : 'rgba(74,222,128,0.06)',
            border: hasUnserved ? '1px solid rgba(255,77,109,0.2)' : '1px solid rgba(74,222,128,0.12)',
          }}
        >
          <div className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-1">Без воды</div>
          <div
            className="font-black text-2xl tabular-nums"
            style={{ color: hasUnserved ? '#ff4d6d' : '#4ade80' }}
          >
            {hasUnserved ? fmtPop(object.unserved_population) : '—'}
            {hasUnserved && <span className="text-white/30 font-normal text-sm ml-1">чел.</span>}
          </div>
        </div>
      </div>

      {/* Connected objects */}
      {object.connected_object_ids && object.connected_object_ids.length > 0 && (
        <div className="mt-4">
          <div className="text-white/30 text-xs font-semibold uppercase tracking-widest mb-2">
            Связанные объекты
          </div>
          <div className="flex flex-wrap gap-2">
            {object.connected_object_ids.map((id) => (
              <span
                key={id}
                className="px-2.5 py-1 rounded-full text-xs"
                style={{
                  background: 'rgba(96,165,250,0.1)',
                  color: '#60a5fa',
                  border: '1px solid rgba(96,165,250,0.2)',
                }}
              >
                {id}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.section>
  );
}
