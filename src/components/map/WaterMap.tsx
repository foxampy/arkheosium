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
import { createMarkerElement, createRegionChipElement } from './MapIcons';
import { DOMAIN_CONFIG, normalizeDomain } from '@/lib/domains';
import { useWorldBorders } from '@/lib/geo/useWorldBorders';
import { clusterByGeography, clampDrilldownZoom, type GeoCluster } from '@/lib/map/geo-cluster';

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
  graphEdges,
  complexes,
  onComplexClick,
}: WaterMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  // Тот же атлас границ, по которому группирует глобус: карта и глобус должны
  // давать одинаковые числа для одного набора объектов.
  const { world } = useWorldBorders();
  const markerInstancesRef = useRef<Marker[]>([]);
  const loadedRef = useRef(false);
  // keep latest callbacks so map.on('click') handlers always see the newest ref
  const onGroupClickRef = useRef(onGroupClick);
  const onMarkerClickRef = useRef(onMarkerClick);
  const onBoundsChangeRef = useRef(onBoundsChange);
  const onComplexClickRef = useRef(onComplexClick);
  useEffect(() => {
    onComplexClickRef.current = onComplexClick;
  }, [onComplexClick]);

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

  // ── Knowledge-graph edges (relationship web) ─────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const SRC = 'kg-edges';
    const data: GeoJSON.FeatureCollection = graphEdges ?? { type: 'FeatureCollection', features: [] };

    const apply = () => {
      const existing = map.getSource(SRC) as maplibregl.GeoJSONSource | undefined;
      if (existing) {
        existing.setData(data as any);
        return;
      }
      map.addSource(SRC, { type: 'geojson', data: data as any });
      // Soft glow underlay
      map.addLayer({
        id: 'kg-edges-glow',
        type: 'line',
        source: SRC,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': ['get', 'color'],
          'line-width': ['interpolate', ['linear'], ['zoom'], 2, 3, 6, 6, 10, 9],
          'line-blur': 4,
          'line-opacity': 0.22,
        },
      });
      // Crisp core line
      map.addLayer({
        id: 'kg-edges-core',
        type: 'line',
        source: SRC,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': ['get', 'color'],
          'line-width': ['interpolate', ['linear'], ['zoom'], 2, 0.6, 6, 1.1, 10, 1.8],
          'line-opacity': 0.75,
          'line-dasharray': [2, 2],
        },
      });
      // Invisible wide hit-line so thin edges are easy to click
      map.addLayer({
        id: 'kg-edges-hit',
        type: 'line',
        source: SRC,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#000', 'line-opacity': 0.01, 'line-width': 12 },
      });

      const CAT_LABEL: Record<string, string> = {
        operational: 'Операционная',
        financial: 'Финансовая',
        development: 'Развитие',
        infrastructure: 'Инфраструктура',
        other: 'Прочая',
      };
      map.on('click', 'kg-edges-hit', (e) => {
        const f = e.features?.[0];
        if (!f) return;
        const p = f.properties as Record<string, any>;
        const color = p.color ?? '#00e6c8';
        const rel = p.relationship ?? 'related';
        const strength = p.strength ?? 1;
        const catLabel = CAT_LABEL[p.category] ?? 'Связь';
        const bars = Math.max(1, Math.min(5, Math.round(Number(strength))));
        const barsHtml = Array.from({ length: 5 })
          .map((_, i) => `<span style="display:inline-block;width:8px;height:8px;border-radius:2px;margin-right:2px;background:${i < bars ? color : 'rgba(255,255,255,0.15)'}"></span>`)
          .join('');
        const html = `
          <div style="font-family:system-ui,sans-serif;min-width:180px">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
              <span style="width:10px;height:10px;border-radius:50%;background:${color};box-shadow:0 0 8px ${color}"></span>
              <strong style="color:#0f172a;font-size:13px">${catLabel}</strong>
            </div>
            <div style="font-size:12px;color:#334155;margin-bottom:6px">Тип: <code style="background:#f1f5f9;padding:1px 5px;border-radius:4px">${rel}</code></div>
            <div style="font-size:11px;color:#64748b;display:flex;align-items:center;gap:4px">Сила связи ${barsHtml}</div>
          </div>`;
        new maplibregl.Popup({ offset: 8, closeButton: true, maxWidth: '260px' })
          .setLngLat(e.lngLat)
          .setHTML(html)
          .addTo(map);
      });
      map.on('mouseenter', 'kg-edges-hit', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'kg-edges-hit', () => {
        map.getCanvas().style.cursor = '';
      });
    };

    if (loadedRef.current) apply();
    else map.once('load', apply);
  }, [graphEdges]);

  // ── Complex hubs (entity_groups) — glowing multi-ring markers ─
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const SRC = 'kg-complexes';
    const data: GeoJSON.FeatureCollection = complexes ?? { type: 'FeatureCollection', features: [] };

    const apply = () => {
      const existing = map.getSource(SRC) as maplibregl.GeoJSONSource | undefined;
      if (existing) {
        existing.setData(data as any);
        return;
      }
      map.addSource(SRC, { type: 'geojson', data: data as any });
      // Outer glow halo
      map.addLayer({
        id: 'kg-complexes-halo',
        type: 'circle',
        source: SRC,
        paint: {
          'circle-color': ['get', 'color'],
          'circle-opacity': 0.18,
          'circle-blur': 0.9,
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 12, 6, 20, 10, 30],
        },
      });
      // Ring
      map.addLayer({
        id: 'kg-complexes-ring',
        type: 'circle',
        source: SRC,
        paint: {
          'circle-color': 'rgba(0,0,0,0)',
          'circle-stroke-color': ['get', 'color'],
          'circle-stroke-width': 2,
          'circle-stroke-opacity': 0.85,
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 8, 6, 13, 10, 20],
        },
      });
      // Bright core
      map.addLayer({
        id: 'kg-complexes-core',
        type: 'circle',
        source: SRC,
        paint: {
          'circle-color': ['get', 'color'],
          'circle-opacity': 0.95,
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 1,
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 3.5, 6, 5, 10, 7],
        },
      });

      const onClick = (e: any) => {
        const f = e.features?.[0];
        if (!f) return;
        const p = f.properties as Record<string, any>;
        const color = p.color ?? '#00e6c8';
        const title = p.title ?? p.slug ?? 'Комплекс';
        const desc = (p.description ?? '').toString().slice(0, 220);
        const html = `
          <div style="font-family:system-ui,sans-serif;min-width:200px;max-width:240px">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
              <span style="width:11px;height:11px;border-radius:50%;background:${color};box-shadow:0 0 10px ${color}"></span>
              <strong style="color:#0f172a;font-size:13px;line-height:1.25">${title}</strong>
            </div>
            <div style="font-size:11px;color:#475569;line-height:1.4">${desc}</div>
            <div style="margin-top:6px;font-size:10px;color:${color};font-weight:600;text-transform:uppercase;letter-spacing:.04em">Комплекс</div>
          </div>`;
        new maplibregl.Popup({ offset: 14, closeButton: true, maxWidth: '260px' })
          .setLngLat((f.geometry as any).coordinates)
          .setHTML(html)
          .addTo(map);
        if (p.slug) onComplexClickRef.current?.(p.slug);
      };
      for (const id of ['kg-complexes-core', 'kg-complexes-ring', 'kg-complexes-halo']) {
        map.on('click', id, onClick);
        map.on('mouseenter', id, () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', id, () => { map.getCanvas().style.cursor = ''; });
      }
    };

    if (loadedRef.current) apply();
    else map.once('load', apply);
  }, [complexes]);

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
    // subjects/projects keep their type pill colour so the top legend stays
    // meaningful. Physical objects are coloured by their RESOURCE DOMAIN
    // (water=cyan, energy=amber, minerals=violet, nature=green, agriculture=lime,
    // climate=sky) — water objects resolve to #00e6c8 so nothing regresses.
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
              : DOMAIN_CONFIG[normalizeDomain(m.domain)].color;
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

    // Чип географической группы: приближает к следующему уровню детализации.
    const renderChip = (c: GeoCluster<MapMarker>) => {
      const breakdown = c.byDomain.map((d) => ({
        emoji: DOMAIN_CONFIG[d.domain].emoji,
        color: DOMAIN_CONFIG[d.domain].color,
        count: d.count,
      }));
      const el = createRegionChipElement(
        c.label,
        breakdown,
        c.color,
        c.markers.length,
      );
      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([c.lng, c.lat])
        .addTo(map);
      el.addEventListener('click', (ev) => {
        ev.stopPropagation();
        // Приближаем на охват меток группы, а не на точку подписи: подпись
        // сидит на якоре страны, а объекты могут лежать в её углу.
        const camera = map.cameraForBounds(c.bounds, { padding: 64 });
        map.easeTo({
          center: camera?.center ?? [c.lng, c.lat],
          zoom: clampDrilldownZoom(c.level, camera?.zoom, MAP_DEFAULTS.maxZoom),
          duration: 600,
        });
      });
      markerInstancesRef.current.push(marker);
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

      // Группировка по настоящим границам: макрорегион → страна → область.
      // Пока атлас не загрузился, `world` равен null и метки показываются по
      // отдельности — это корректное промежуточное состояние, а не пустая карта.
      const { single, clusters } = clusterByGeography(markers, world, map.getZoom());
      clusters.forEach(renderChip);
      single.forEach(renderSingle);
    };

    // Пересчитываем группы при смене зума: уровень детализации зависит от него.
    const onMove = () => apply();

    if (loadedRef.current) apply();
    else map.once('load', apply);

    if (cluster) map.on('moveend', onMove);

    return () => {
      if (cluster) map.off('moveend', onMove);
    };
  }, [markers, showPopups, cluster, world]);

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
  const dom = DOMAIN_CONFIG[normalizeDomain(m.domain)];
  // Domain chip shown for objects (physical resources carry a meaningful domain)
  const domainChip = m.type === 'object'
    ? `<span style="display:inline-block;padding:3px 9px;border-radius:999px;background:${dom.color}22;color:${dom.color};font-size:11px;font-weight:600;margin-bottom:8px;margin-left:6px;">${dom.emoji} ${escapeHtml(dom.labelRu)}</span>`
    : '';

  // Water body markers (wb-*) and completed projects (CP-*) don't have separate detail pages
  const isWaterBody = m.id.startsWith('wb-');
  const isCompleted = m.id.startsWith('CP-');
  const href = `/hub/${m.type}/${encodeURIComponent(m.id)}`;

  return `
    <div style="font-family: Inter, system-ui, sans-serif; color: #e2e8f0; padding: 6px 4px;">
      <div style="display: inline-block; padding: 3px 10px; border-radius: 999px; background: ${tc.bg}; color: ${tc.text}; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; font-weight: 600;">
        ${typeLabel}
      </div>${domainChip}
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
