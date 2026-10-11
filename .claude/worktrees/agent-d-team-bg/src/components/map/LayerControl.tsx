// ═══════════════════════════════════════════════════════════════
//  LayerControl — sidebar UI for toggling map layers, project
//  groups, and applying numeric filters (salinity, volume, etc).
//
//  Used on the gov dashboard and any other page that needs a
//  rich map-control panel. Self-contained: parent owns the state.
// ═══════════════════════════════════════════════════════════════

import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PROJECT_GROUPS } from '@/data/project-groups';
import type { GroupId, LayerKey } from './types';

export interface LayerControlProps {
  enabledLayers: LayerKey[];
  onLayersChange: (layers: LayerKey[]) => void;
  enabledGroups: GroupId[];
  onGroupsChange: (groups: GroupId[]) => void;
  salinityRange: [number, number];
  onSalinityChange: (r: [number, number]) => void;
  /** Optional discharge / volume slider [min, max] in m³/s. */
  volumeRange?: [number, number];
  onVolumeChange?: (r: [number, number]) => void;
  /** Optional access-index slider [0, 100]. */
  accessRange?: [number, number];
  onAccessChange?: (r: [number, number]) => void;
  className?: string;
}

const ALL_LAYERS: { key: LayerKey; label: string }[] = [
  { key: 'rivers', label: 'Реки' },
  { key: 'lakes', label: 'Озёра' },
  { key: 'glaciers', label: 'Ледники' },
  { key: 'borders', label: 'Границы' },
  { key: 'cities', label: 'Города' },
];

function toggle<T>(arr: T[], v: T): T[] {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
}

export function LayerControl({
  enabledLayers,
  onLayersChange,
  enabledGroups,
  onGroupsChange,
  salinityRange,
  onSalinityChange,
  volumeRange,
  onVolumeChange,
  accessRange,
  onAccessChange,
  className = '',
}: LayerControlProps) {
  return (
    <aside
      className={
        'bg-[#0a1628] border-r border-slate-800 w-[300px] h-full overflow-y-auto text-slate-200 ' +
        className
      }
    >
      <div className="p-4">
        <h2 className="text-base font-semibold text-slate-100 mb-3">
          Управление картой
        </h2>

        <Tabs defaultValue="layers" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-900/60 border border-slate-800 text-slate-400">
            <TabsTrigger value="layers" className="text-xs">
              Слои
            </TabsTrigger>
            <TabsTrigger value="filters" className="text-xs">
              Фильтры
            </TabsTrigger>
            <TabsTrigger value="groups" className="text-xs">
              Группы
            </TabsTrigger>
          </TabsList>

          {/* ── Layers tab ────────────────────────────────────── */}
          <TabsContent value="layers" className="mt-4 space-y-3">
            <h3 className="text-[11px] uppercase tracking-wider text-slate-500">
              Слои данных
            </h3>
            <div className="space-y-2">
              {ALL_LAYERS.map(({ key, label }) => (
                <label
                  key={key}
                  className="flex items-center gap-3 cursor-pointer py-1.5 rounded hover:bg-slate-900/50 px-2 -mx-2 transition-colors"
                >
                  <Checkbox
                    checked={enabledLayers.includes(key)}
                    onCheckedChange={() =>
                      onLayersChange(toggle(enabledLayers, key))
                    }
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </TabsContent>

          {/* ── Filters tab ───────────────────────────────────── */}
          <TabsContent value="filters" className="mt-4 space-y-6">
            <section>
              <div className="flex items-baseline justify-between mb-2">
                <h3 className="text-[11px] uppercase tracking-wider text-slate-500">
                  Опресненность (PSU)
                </h3>
                <span className="text-xs text-slate-400 tabular-nums">
                  {salinityRange[0]}–{salinityRange[1]}
                </span>
              </div>
              <Slider
                value={salinityRange}
                onValueChange={(v) => onSalinityChange(v as [number, number])}
                min={0}
                max={40}
                step={1}
              />
            </section>

            {volumeRange && onVolumeChange && (
              <section>
                <div className="flex items-baseline justify-between mb-2">
                  <h3 className="text-[11px] uppercase tracking-wider text-slate-500">
                    Объём / Discharge
                  </h3>
                  <span className="text-xs text-slate-400 tabular-nums">
                    {volumeRange[0]}–{volumeRange[1]}
                  </span>
                </div>
                <Slider
                  value={volumeRange}
                  onValueChange={(v) =>
                    onVolumeChange(v as [number, number])
                  }
                  min={0}
                  max={10000}
                  step={50}
                />
              </section>
            )}

            {accessRange && onAccessChange && (
              <section>
                <div className="flex items-baseline justify-between mb-2">
                  <h3 className="text-[11px] uppercase tracking-wider text-slate-500">
                    Доступность
                  </h3>
                  <span className="text-xs text-slate-400 tabular-nums">
                    {accessRange[0]}–{accessRange[1]}
                  </span>
                </div>
                <Slider
                  value={accessRange}
                  onValueChange={(v) =>
                    onAccessChange(v as [number, number])
                  }
                  min={0}
                  max={100}
                  step={1}
                />
              </section>
            )}
          </TabsContent>

          {/* ── Groups tab ────────────────────────────────────── */}
          <TabsContent value="groups" className="mt-4 space-y-3">
            <h3 className="text-[11px] uppercase tracking-wider text-slate-500">
              Проектные группы
            </h3>
            <div className="space-y-1.5">
              {PROJECT_GROUPS.map((g) => (
                <label
                  key={g.id}
                  className="flex items-start gap-3 cursor-pointer py-1.5 rounded hover:bg-slate-900/50 px-2 -mx-2 transition-colors"
                >
                  <Checkbox
                    className="mt-0.5"
                    checked={enabledGroups.includes(g.id)}
                    onCheckedChange={() =>
                      onGroupsChange(toggle(enabledGroups, g.id))
                    }
                  />
                  <span
                    className="mt-1 w-3 h-3 shrink-0 rounded-sm"
                    style={{ background: g.color }}
                    aria-hidden
                  />
                  <span className="text-sm leading-snug">{g.name}</span>
                </label>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </aside>
  );
}
