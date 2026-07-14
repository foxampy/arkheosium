// ═══════════════════════════════════════════════════════════════
//  objectConfig — EntityTypeConfig for "object"
//  Reads from OBJECTS_DATA + ALL_FULL_OBJECTS (extended)
// ═══════════════════════════════════════════════════════════════

import type { EntityTypeConfig, EntityData } from './types';
import { OBJECTS_DATA } from '@/data/objects-data';
import { ALL_FULL_OBJECTS } from '@/data/objects/index';

export const objectConfig: EntityTypeConfig = {
  typeKey: 'object',
  label: 'Объект',
  pluralLabel: 'Объекты',
  color: '#38bdf8',
  loadData(id) {
    // Try OBJECTS_DATA first (lightweight catalog), fall back to ALL_FULL_OBJECTS
    const o: any = OBJECTS_DATA.find((x: any) => x.id === id);
    const f: any = ALL_FULL_OBJECTS.find((x: any) => x.id === id);
    if (!o && !f) return null;

    const merged: any = { ...(f ?? {}), ...(o ?? {}) };

    const title = merged.name_ru ?? merged.name ?? merged.name_en ?? merged.id;
    const coords = merged.coordinates ?? merged.coordinates_start;
    const location = coords
      ? {
          lat: coords.lat,
          lng: coords.lng,
          address: [merged.region, merged.country].filter(Boolean).join(', '),
        }
      : undefined;

    // Capacity: try several shapes
    const capacityValue =
      merged.capacity ??
      merged.design_capacity_m3_per_day ??
      merged.actual_capacity_m3_per_day ??
      '—';
    const capacityUnit =
      merged.capacity_unit ??
      (merged.design_capacity_m3_per_day ? 'м³/сут' : '');

    const volume =
      merged.volume_km3 ??
      merged.reservoir_volume_km3 ??
      merged.annual_water_intake_m3 ??
      '—';
    const volumeUnit =
      merged.volume_km3 || merged.reservoir_volume_km3 ? 'км³' :
      merged.annual_water_intake_m3 ? 'м³/год' : '';

    const typeLabel = merged.type_label ?? merged.type ?? '—';
    const yearBuilt = merged.year_built ?? merged.construction_year ?? '—';

    const related: EntityData['related'] = [];
    (merged.related_projects ?? []).forEach((rid: string) =>
      related.push({ type: 'project', id: rid, title: rid }),
    );
    (merged.related_subjects ?? []).forEach((rid: string) =>
      related.push({ type: 'subject', id: rid, title: rid }),
    );

    // Documents from FullObjectData if present
    const documents = (merged.documents ?? []).map((d: any) => ({
      name: d.title ?? d.name ?? 'Документ',
      url: d.url ?? '#',
      size: d.size_kb ? `${(d.size_kb / 1024).toFixed(1)} MB` : undefined,
    }));

    return {
      id: merged.id,
      title,
      type: 'object',
      status: merged.status ?? 'operational',
      coverImage: merged.image_url ?? merged.cover_image ?? merged.photos?.[0]?.url,
      description: merged.description_ru ?? merged.description ?? merged.description_full ?? '',
      location,
      kpis: [
        { label: 'Мощность', value: capacityValue, unit: capacityUnit },
        { label: 'Объём', value: volume, unit: volumeUnit },
        { label: 'Тип', value: typeLabel },
        { label: 'Год ввода', value: yearBuilt },
      ],
      documents,
      related,
      extra: {
        efficiency: merged.efficiency,
        wear_pct: merged.wear_pct,
        automation_level_pct: merged.automation_level_pct,
        water_loss_pct: merged.water_loss_pct,
        energy_kwh_per_m3: merged.energy_kwh_per_m3,
        serves_population: merged.serves_population,
        water_source: merged.water_source ?? merged.water_source_name,
        treatment_technologies: merged.treatment_technologies,
        last_renovation_year: merged.last_renovation_year ?? merged.last_modernization,
      },
    };
  },
  renderTypeSpecific(data) {
    const x = data.extra ?? {};
    const params: { label: string; value: any; unit?: string }[] = [
      { label: 'КПД / Эффективность', value: x.efficiency, unit: '%' },
      { label: 'Износ', value: x.wear_pct, unit: '%' },
      { label: 'Уровень автоматизации', value: x.automation_level_pct, unit: '%' },
      { label: 'Потери воды', value: x.water_loss_pct, unit: '%' },
      { label: 'Удельная энергия', value: x.energy_kwh_per_m3, unit: 'кВт·ч/м³' },
      { label: 'Обслуживаемое население', value: x.serves_population, unit: 'чел.' },
      { label: 'Источник воды', value: x.water_source },
      { label: 'Последняя модернизация', value: x.last_renovation_year },
    ].filter((p) => p.value != null && p.value !== '');

    if (params.length === 0 && !x.treatment_technologies?.length) return null;

    return (
      <section>
        <h2 className="text-2xl font-bold mb-4">Технические параметры</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {params.map((p, i) => (
            <div
              key={i}
              className="p-4 bg-slate-900/50 border border-slate-800 rounded"
            >
              <div className="text-xs text-slate-400 uppercase tracking-wider">{p.label}</div>
              <div className="text-lg font-semibold mt-1">
                {String(p.value)}
                {p.unit && <span className="text-sm text-slate-500 ml-1">{p.unit}</span>}
              </div>
            </div>
          ))}
        </div>
        {Array.isArray(x.treatment_technologies) && x.treatment_technologies.length > 0 && (
          <div className="mt-6">
            <div className="text-sm text-slate-400 mb-2">Технологии водоподготовки</div>
            <div className="flex flex-wrap gap-2">
              {x.treatment_technologies.map((t: string, i: number) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-slate-900 border border-slate-700 rounded-full text-sm text-cyan-300"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>
    );
  },
};
