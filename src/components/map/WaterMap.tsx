import { useEffect, useRef } from 'react';
import maplibregl, { Map as MapLibreMap, Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MAP_TILES, MAP_DEFAULTS, MAP_COLORS } from '@/lib/map-config';
import { GEO_SOURCES } from '@/data/geo/sources';
import {
  LAYER_DEFS,
  LAYER_RENDER_ORDER,
  getLayerIdsForKey,
} from '@/data/geo/layer-styles';
import { PROJECT_GROUPS } from '@/data/project-groups';
import type { GroupId, LayerKey, MapMarker, WaterMapProps, WaterMapHandle } from './types';
import { createMarkerElement, createClusterElement } from './MapIcons';

const DEFAULT_LAYERS: LayerKey[] = ['rivers', 'lakes', 'glaciers', 'borders', 'cities'];

export function WaterMap({
  center = MAP_DEFAULTS.center,
  zoom = MAP_DEFAULTS.zoom,
  layers,
  markers,
  onMarkerClick,
  onGroupClick,
  onBoundsChange,
  showGroups = false,
  height = '100%',
  interactive = true,
  showPopups = true,
  className = '',
  mapRef: externalMapRef,
  cluster = false,
  clusterRadius = 48,
}: WaterMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markerInstancesRef = useRef<Marker[]>([]);
  const loadedRef = useRef(false);
  // keep latest callbacks so map.on('click') handlers always see the newest ref
  const onGroupClickRef = useRef(onGroupClick);
  const onMarkerClickRef = useRef(onMarkerClick);
  const onBoundsChangeRef = useRef(onBoundsChange);

  useEffect(() => {
    onGroupClickRef.current = onGroupClick;
  }, [onGroupClick]);
  useEffect(() => {
    onMarkerClickRef.current = onMarkerClick;
  }, [onMarkerClick]);
  useEffect(() => {
    onBoundsChangeRef.current = onBoundsChange;
  }, [onBoundsChange]);

  // ── Map initialization (once) ────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_TILES.styleUrl,
      center,
      zoom,
      minZoom: MAP_DEFAULTS.minZoom,
      maxZoom: MAP_DEFAULTS.maxZoom,
      interactive,
      attributionControl: { compact: true },
    });

    mapRef.current = map;

    // Expose flyTo + updateSource for external callers
    if (externalMapRef) {
      externalMapRef.current = {
        flyTo: (c, z) => {
          map.flyTo({ center: c, zoom: z, duration: 2000 });
        },
        updateSource: (sourceId, data) => {
          const src = map.getSource(sourceId);
          if (src && 'setData' in src) {
            (src as any).setData(data);
          }
        },
      };
    }

    map.on('load', () => {
      loadedRef.current = true;

      // 1. Register all natural-earth sources
      (Object.keys(GEO_SOURCES) as Array<keyof typeof GEO_SOURCES>).forEach((key) => {
        if (!map.getSource(key)) {
          map.addSource(key, { type: 'geojson', data: GEO_SOURCES[key] });
        }
      });

      // 2. Add layers in render order, respecting the `layers` prop
      const enabled = new Set<LayerKey>(layers ?? DEFAULT_LAYERS);
      LAYER_RENDER_ORDER.forEach((key) => {
        const def = LAYER_DEFS[key];
        if (!def) return;
        def.layers.forEach((spec) => {
          if (!map.getLayer(spec.id)) {
            map.addLayer(spec);
          }
          // honour visibility from initial prop
          map.setLayoutProperty(
            spec.id,
            'visibility',
            enabled.has(key) ? 'visible' : 'none',
          );
        });
      });

      // 2b. Fire bounds callback on load + on every move
      const fireBounds = () => {
        const b = map.getBounds();
        onBoundsChangeRef.current?.([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]);
      };
      fireBounds();
      map.on('moveend', fireBounds);

      // 3. Project groups overlay (bbox polygons with fill + outline)
      //    Only rendered when showGroups=true
      if (showGroups) {
        const groupsGeoJson = {
          type: 'FeatureCollection' as const,
          features: PROJECT_GROUPS.map((g) => ({
            type: 'Feature' as const,
            properties: { id: g.id, name: g.name, color: g.color },
            geometry: {
              type: 'Polygon' as const,
              coordinates: [
                [
                  [g.bbox[0], g.bbox[1]],
                  [g.bbox[2], g.bbox[1]],
                  [g.bbox[2], g.bbox[3]],
                  [g.bbox[0], g.bbox[3]],
                  [g.bbox[0], g.bbox[1]],
                ],
              ],
            },
          })),
        };

        if (!map.getSource('project-groups')) {
          map.addSource('project-groups', { type: 'geojson', data: groupsGeoJson });
        }
        if (!map.getLayer('layer-project-groups-fill')) {
          map.addLayer({
            id: 'layer-project-groups-fill',
            type: 'fill',
            source: 'project-groups',
            paint: {
              'fill-color': ['get', 'color'] as unknown as string,
              'fill-opacity': 0.12,
            },
          });
        }
        if (!map.getLayer('layer-project-groups-outline')) {
          map.addLayer({
            id: 'layer-project-groups-outline',
            type: 'line',
            source: 'project-groups',
            paint: {
              'line-color': ['get', 'color'] as unknown as string,
              'line-width': 1.5,
              'line-opacity': 0.75,
            },
          });
        }

        // Click + hover interactions for groups
        map.on('click', 'layer-project-groups-fill', (e) => {
          const f = e.features?.[0];
          if (!f) return;
          const id = f.properties?.id as GroupId | undefined;
          if (id) onGroupClickRef.current?.(id);
        });
        map.on('mouseenter', 'layer-project-groups-fill', () => {
          map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'layer-project-groups-fill', () => {
          map.getCanvas().style.cursor = '';
        });
      }

      // 4. Water quality circle popups
      map.on('click', 'layer-water-quality-circles', (e) => {
        const f = e.features?.[0];
        if (!f || !f.properties) return;
        const p = f.properties;
        const coords = (f.geometry as any).coordinates?.slice() as [number, number] | undefined;
        if (!coords) return;
        const color = p.color || '#06b6d4';

        let html = `<div style="font-family:Inter,system-ui,sans-serif;color:#e2e8f0;padding:4px 0;min-width:200px;">`;
        html += `<div style="font-weight:700;font-size:13px;margin-bottom:6px;color:#f8fafc;">${escapeHtml(p.name || '')}</div>`;

        if (p.salinity != null) {
          html += `<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:6px;">`;
          html += `<div style="padding:5px 7px;background:rgba(255,255,255,0.05);border-radius:8px;">
            <div style="font-size:9px;color:rgba(255,255,255,0.35);margin-bottom:1px;">Солёность</div>
            <div style="font-size:12px;font-weight:700;color:${color};">${Number(p.salinity).toLocaleString('ru')} ppm</div>
          </div>`;
          if (p.hardness != null) {
            html += `<div style="padding:5px 7px;background:rgba(255,255,255,0.05);border-radius:8px;">
              <div style="font-size:9px;color:rgba(255,255,255,0.35);margin-bottom:1px;">Жёсткость</div>
              <div style="font-size:12px;font-weight:600;color:#e2e8f0;">${p.hardness} мг/л</div>
            </div>`;
          }
          if (p.ph != null) {
            html += `<div style="padding:5px 7px;background:rgba(255,255,255,0.05);border-radius:8px;">
              <div style="font-size:9px;color:rgba(255,255,255,0.35);margin-bottom:1px;">pH</div>
              <div style="font-size:12px;font-weight:600;color:#e2e8f0;">${p.ph}</div>
            </div>`;
          }
          if (p.difficulty) {
            html += `<div style="padding:5px 7px;background:rgba(255,255,255,0.05);border-radius:8px;">
              <div style="font-size:9px;color:rgba(255,255,255,0.35);margin-bottom:1px;">Добыча</div>
              <div style="font-size:12px;font-weight:600;color:${color};">${escapeHtml(p.difficulty)}</div>
            </div>`;
          }
          html += `</div>`;
        } else if (p.quality) {
          html += `<div style="display:inline-block;padding:3px 10px;border-radius:999px;background:${color}25;color:${color};font-size:10px;font-weight:600;margin-bottom:4px;">${escapeHtml(p.quality)}</div>`;
        }

        html += `</div>`;

        new maplibregl.Popup({ offset: 12, closeButton: true, maxWidth: '260px' })
          .setLngLat(coords)
          .setHTML(html)
          .addTo(map);
      });
      map.on('mouseenter', 'layer-water-quality-circles', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'layer-water-quality-circles', () => {
        map.getCanvas().style.cursor = '';
      });

      // 5. Drought polygon popups
      map.on('click', 'layer-drought-fill', (e) => {
        const f = e.features?.[0];
        if (!f || !f.properties) return;
        const p = f.properties;
        const color = p.color || '#ef4444';
        const lngLat = e.lngLat;

        let html = `<div style="font-family:Inter,system-ui,sans-serif;color:#e2e8f0;padding:4px 0;min-width:200px;">`;
        html += `<div style="font-weight:700;font-size:13px;margin-bottom:6px;color:#f8fafc;">${escapeHtml(p.name || '')}</div>`;
        html += `<div style="display:inline-block;padding:3px 10px;border-radius:999px;background:${color}25;color:${color};font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">${escapeHtml(p.severity || '')}</div>`;

        if (p.trend) {
          html += `<div style="font-size:11px;color:rgba(255,255,255,0.5);margin-bottom:6px;">Тренд: ${escapeHtml(p.trend)}</div>`;
        }

        html += `<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;">`;
        if (p.precipDeficit != null) {
          html += `<div style="padding:5px 7px;background:rgba(255,255,255,0.05);border-radius:8px;">
            <div style="font-size:9px;color:rgba(255,255,255,0.35);margin-bottom:1px;">Дефицит осадков</div>
            <div style="font-size:12px;font-weight:700;color:${color};">${p.precipDeficit}%</div>
          </div>`;
        }
        if (p.soilMoisture != null) {
          html += `<div style="padding:5px 7px;background:rgba(255,255,255,0.05);border-radius:8px;">
            <div style="font-size:9px;color:rgba(255,255,255,0.35);margin-bottom:1px;">Влажность почвы</div>
            <div style="font-size:12px;font-weight:600;color:#e2e8f0;">${p.soilMoisture}%</div>
          </div>`;
        }
        html += `</div>`;

        if (p.description) {
          html += `<div style="font-size:11px;color:rgba(255,255,255,0.45);margin-top:6px;line-height:1.4;">${escapeHtml(p.description)}</div>`;
        }

        html += `</div>`;

        new maplibregl.Popup({ offset: 12, closeButton: true, maxWidth: '280px' })
          .setLngLat(lngLat)
          .setHTML(html)
          .addTo(map);
      });
      map.on('mouseenter', 'layer-drought-fill', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'layer-drought-fill', () => {
        map.getCanvas().style.cursor = '';
      });
    });

    return () => {
      markerInstancesRef.current.forEach((m) => m.remove());
      markerInstancesRef.current = [];
      loadedRef.current = false;
      if (externalMapRef) externalMapRef.current = null;
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── React to `layers` prop changes (toggle visibility) ───────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const apply = () => {
      const enabled = new Set<LayerKey>(layers ?? DEFAULT_LAYERS);
      (Object.keys(LAYER_DEFS) as LayerKey[]).forEach((key) => {
        getLayerIdsForKey(key).forEach((id) => {
          if (map.getLayer(id)) {
            map.setLayoutProperty(
              id,
              'visibility',
              enabled.has(key) ? 'visible' : 'none',
            );
          }
        });
      });
    };

    if (loadedRef.current) apply();
    else map.once('load', apply);
  }, [layers]);

  // ── Render markers from prop (optional proximity clustering) ──
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Color mapping for specific object types
    const OBJECT_ICON_COLORS: Record<string, string> = {
      pumping_station: '#00e6c8',
      water_treatment_facility: '#00b4ff',
      irrigation_canal: '#38bdf8',
      dam: '#a78bfa',
      reservoir: '#60a5fa',
      hydroelectric_reservoir: '#818cf8',
      mountain_lake: '#34d399',
      river: '#38bdf8',
      lake_crisis: '#ff4d6d',
      glacier: '#a5f3fc',
    };

    // Water bodies (Реки/Озёра/Ледники) keep their natural per-type colors;
    // everything else is coloured to match its top filter pill:
    //   Объекты #00e6c8 · Субъекты #fbbf24 · Проекты #60a5fa · Реализованные #22c55e
    function getMarkerMeta(m: MapMarker) {
      const isCompleted = (m as any).isCompleted;
      const isWaterBody = m.id.startsWith('wb-');
      const iconColor = isCompleted
        ? '#22c55e'
        : m.type === 'subject'
          ? '#fbbf24'
          : m.type === 'project'
            ? '#60a5fa'
            : isWaterBody
              ? (m.objectType && OBJECT_ICON_COLORS[m.objectType]) || '#22d3ee'
              : '#00e6c8';
      const iconType = isCompleted
        ? 'completed'
        : m.type === 'subject'
          ? 'subject'
          : m.type === 'project'
            ? 'project'
            : m.objectType ?? m.type;
      return { iconColor, iconType };
    }

    // Build a single premium DOM dot marker for `m`.
    const renderSingle = (m: MapMarker) => {
      const { iconColor, iconType } = getMarkerMeta(m);
      const isHighlighted = (m as any).isHighlighted === true;
      // highlighted markers (water bodies) get 14px; regular get 10px
      const dotSize = isHighlighted ? 14 : 10;
      const el = createMarkerElement(iconType, iconColor, dotSize);

      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([m.lng, m.lat])
        .addTo(map);

      if (showPopups) {
        const popup = new maplibregl.Popup({
          offset: 10,
          closeButton: true,
          className: 'wm-popup',
          maxWidth: '300px',
        }).setHTML(buildPopupHtml(m));
        marker.setPopup(popup);
        el.addEventListener('click', () => {
          onMarkerClickRef.current?.(m);
        });
      } else {
        el.addEventListener('click', (ev) => {
          ev.stopPropagation();
          onMarkerClickRef.current?.(m);
        });
      }

      markerInstancesRef.current.push(marker);
    };

    // Build a cluster bubble that zooms in on click.
    const renderCluster = (
      lng: number,
      lat: number,
      count: number,
      color: string,
    ) => {
      const el = createClusterElement(count, color);
      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([lng, lat])
        .addTo(map);
      el.addEventListener('click', (ev) => {
        ev.stopPropagation();
        // Zoom in toward the cluster; maplibre re-buckets on moveend.
        const targetZoom = Math.min(
          MAP_DEFAULTS.maxZoom,
          Math.round(map.getZoom()) + 2,
        );
        map.easeTo({ center: [lng, lat], zoom: targetZoom, duration: 500 });
      });
      markerInstancesRef.current.push(marker);
    };

    // Group markers by screen-space proximity at the current zoom.
    // A cell is `clusterRadius` px wide; each marker falls into one cell.
    const buildClusters = (list: MapMarker[]) => {
      const cell = Math.max(16, clusterRadius);
      const buckets = new Map<string, MapMarker[]>();
      for (const m of list) {
        if (typeof m.lat !== 'number' || typeof m.lng !== 'number') continue;
        const p = map.project([m.lng, m.lat]);
        const key = Math.round(p.x / cell) + ':' + Math.round(p.y / cell);
        const arr = buckets.get(key);
        if (arr) arr.push(m);
        else buckets.set(key, [m]);
      }
      return buckets;
    };

    const apply = () => {
      // Clear previous DOM markers
      markerInstancesRef.current.forEach((m) => m.remove());
      markerInstancesRef.current = [];

      if (!markers || markers.length === 0) return;

      if (!cluster) {
        // Render every marker directly (legacy behaviour).
        markers.forEach(renderSingle);
        return;
      }

      // Proximity clustering: single-marker cells render as dots,
      // multi-marker cells render as an expandable count bubble.
      const buckets = buildClusters(markers);
      buckets.forEach((items) => {
        if (items.length === 1) {
          renderSingle(items[0]);
          return;
        }
        let lat = 0;
        let lng = 0;
        const typeCount: Record<string, number> = {};
        for (const it of items) {
          lat += it.lat;
          lng += it.lng;
          const meta = getMarkerMeta(it);
          typeCount[meta.iconColor] = (typeCount[meta.iconColor] || 0) + 1;
        }
        const domColor =
          Object.entries(typeCount).sort((a, b) => b[1] - a[1])[0]?.[0] ??
          '#00e6c8';
        renderCluster(
          lng / items.length,
          lat / items.length,
          items.length,
          domColor,
        );
      });
    };

    // Recompute clusters when the viewport changes (only when clustering).
    const onMove = () => apply();

    if (loadedRef.current) apply();
    else map.once('load', apply);

    if (cluster) map.on('moveend', onMove);

    return () => {
      if (cluster) map.off('moveend', onMove);
    };
  }, [markers, showPopups, cluster, clusterRadius]);

  return (
    <div
      ref={containerRef}
      className={`w-full ${className}`}
      style={{ height, background: MAP_COLORS.background }}
    />
  );
}

// ── Helpers ────────────────────────────────────────────────────

const TYPE_LABELS: Record<MapMarker['type'], string> = {
  project: 'Проект',
  object: 'Объект',
  subject: 'Субъект',
  rd: 'R&D',
  solution: 'Решение',
  contest: 'Конкурс',
  hackathon: 'Хакатон',
};

function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, (c) => {
    switch (c) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      case "'":
        return '&#39;';
      default:
        return c;
    }
  });
}

const TYPE_COLORS: Record<string, { bg: string; text: string; btnBg: string; btnBorder: string }> = {
  object:  { bg: 'rgba(244,114,182,0.15)', text: '#f472b6', btnBg: 'rgba(244,114,182,0.12)', btnBorder: 'rgba(244,114,182,0.3)' },
  subject: { bg: 'rgba(251,191,36,0.15)',  text: '#fbbf24', btnBg: 'rgba(251,191,36,0.12)',  btnBorder: 'rgba(251,191,36,0.3)' },
  project: { bg: 'rgba(96,165,250,0.15)',  text: '#60a5fa', btnBg: 'rgba(96,165,250,0.12)',  btnBorder: 'rgba(96,165,250,0.3)' },
  rd:      { bg: 'rgba(167,139,250,0.15)', text: '#a78bfa', btnBg: 'rgba(167,139,250,0.12)', btnBorder: 'rgba(167,139,250,0.3)' },
};
const DEFAULT_TYPE_COLOR = { bg: 'rgba(34,211,238,0.15)', text: '#67e8f9', btnBg: 'rgba(34,211,238,0.1)', btnBorder: 'rgba(34,211,238,0.2)' };

function buildPopupHtml(m: MapMarker): string {
  const title = escapeHtml(m.title);
  const description = m.description ? escapeHtml(m.description) : '';
  const typeLabel = escapeHtml(TYPE_LABELS[m.type] ?? m.type);
  const tc = TYPE_COLORS[m.type] ?? DEFAULT_TYPE_COLOR;

  // Water body markers (wb-*) and completed projects (CP-*) don't have separate detail pages
  const isWaterBody = m.id.startsWith('wb-');
  const isCompleted = m.id.startsWith('CP-');
  const href = `/hub/${m.type}/${encodeURIComponent(m.id)}`;

  return `
    <div style="font-family: Inter, system-ui, sans-serif; color: #e2e8f0; padding: 6px 4px;">
      <div style="display: inline-block; padding: 3px 10px; border-radius: 999px; background: ${tc.bg}; color: ${tc.text}; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; font-weight: 600;">
        ${typeLabel}
      </div>
      <div style="font-weight: 700; font-size: 14px; line-height: 1.35; margin-bottom: 6px; color: #f8fafc;">
        ${title}
      </div>
      ${
        description
          ? `<div style="font-size: 12px; line-height: 1.5; color: #94a3b8; margin-bottom: 12px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">${description}</div>`
          : ''
      }
      ${
        !isWaterBody && !isCompleted
          ? `<a href="${href}" style="display: inline-flex; align-items: center; gap: 5px; font-size: 13px; color: ${tc.text}; text-decoration: none; font-weight: 600; padding: 6px 14px; border-radius: 10px; background: ${tc.btnBg}; border: 1px solid ${tc.btnBorder}; transition: opacity 0.15s;">
              Подробнее →
            </a>`
          : isWaterBody
            ? `<div style="font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 4px;">Нажмите на маркер для подробностей</div>`
            : ''
      }
    </div>
  `;
}
