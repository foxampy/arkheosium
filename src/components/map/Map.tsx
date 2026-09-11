// ═══════════════════════════════════════════════════════════════
//  Map.tsx — Enhanced interactive map with:
//  - Water resources AND partnerships (organizations) as markers
//  - Differentiated icons per type (Dam, Reservoir, Treatment Plant,
//    Organization/Company, Investment Project, Startup)
//  - Geographic clustering by country / region / district, driven by zoom
//  - Progressive layer loading (water first, then organizations)
//  - Rich popup mini-cards: name, country, type, status, funding
//  - Accepts MapFilters for filtering markers client-side
// ═══════════════════════════════════════════════════════════════

import { useEffect, useRef, useCallback } from 'react';
import maplibregl, { Map as MapLibreMap, Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MAP_TILES, MAP_DEFAULTS } from '@/lib/map-config';
import type { MapFilters } from './MapFilterPanel';
import { DOMAIN_CONFIG } from '@/lib/domains';
import { useWorldBorders } from '@/lib/geo/useWorldBorders';
import {
  clusterByGeography,
  clampDrilldownZoom,
  type GeoCluster,
} from '@/lib/map/geo-cluster';

// ── Marker types ──────────────────────────────────────────────

export type EnhancedMarkerType =
  | 'dam'
  | 'reservoir'
  | 'treatment_plant'
  | 'canal'
  | 'organization'
  | 'company'
  | 'startup'
  | 'investment_project';

export interface EnhancedMapMarker {
  id: string;
  type: EnhancedMarkerType;
  lat: number;
  lng: number;
  name: string;
  country?: string;
  region?: string;
  district?: string;
  domain?: string;
  status?: string;
  funding?: number;
  layer: 'water' | 'organization';
}

export interface EnhancedMapProps {
  center?: [number, number];
  zoom?: number;
  markers?: EnhancedMapMarker[];
  filters?: MapFilters;
  onMarkerClick?: (m: EnhancedMapMarker) => void;
  height?: string;
  className?: string;
  interactive?: boolean;
}

// ── Type config ───────────────────────────────────────────────

interface MarkerStyle {
  emoji: string;
  color: string;
  bg: string;
  label: string;
}

const MARKER_STYLES: Record<EnhancedMarkerType, MarkerStyle> = {
  dam:              { emoji: '🏗️', color: '#3b82f6', bg: 'rgba(59,130,246,0.2)',  label: 'Dam' },
  reservoir:        { emoji: '💧', color: '#06b6d4', bg: 'rgba(6,182,212,0.2)',   label: 'Reservoir' },
  treatment_plant:  { emoji: '⚗️', color: '#22c55e', bg: 'rgba(34,197,94,0.2)',   label: 'Treatment Plant' },
  canal:            { emoji: '🌊', color: '#14b8a6', bg: 'rgba(20,184,166,0.2)',  label: 'Canal' },
  organization:     { emoji: '🏢', color: '#f97316', bg: 'rgba(249,115,22,0.2)',  label: 'Organization' },
  company:          { emoji: '🏢', color: '#f97316', bg: 'rgba(249,115,22,0.2)',  label: 'Company' },
  startup:          { emoji: '🚀', color: '#a855f7', bg: 'rgba(168,85,247,0.2)',  label: 'Startup' },
  investment_project:{ emoji: '💰', color: '#eab308', bg: 'rgba(234,179,8,0.2)', label: 'Investment Project' },
};

// ── HTML helpers ──────────────────────────────────────────────

function fmtFunding(n?: number): string {
  if (!n) return '—';
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  return `$${n.toLocaleString()}`;
}

function escHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] ?? c)
  );
}

function buildMarkerPopup(m: EnhancedMapMarker): string {
  const style = MARKER_STYLES[m.type];
  return `
    <div style="font-family:Inter,system-ui,sans-serif;color:#e2e8f0;padding:2px 0;min-width:200px;">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">
        <span style="font-size:18px">${style.emoji}</span>
        <span style="display:inline-block;padding:2px 8px;border-radius:999px;background:${style.bg};color:${style.color};font-size:10px;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;">
          ${escHtml(style.label)}
        </span>
      </div>
      <div style="font-weight:700;font-size:13px;line-height:1.35;margin-bottom:4px;color:#f8fafc;">
        ${escHtml(m.name)}
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:8px;">
        ${m.country ? `
          <div style="padding:6px 8px;background:rgba(255,255,255,0.05);border-radius:8px;">
            <div style="font-size:10px;color:rgba(255,255,255,0.35);margin-bottom:2px;">Country</div>
            <div style="font-size:11px;font-weight:600;color:#e2e8f0;">${escHtml(m.country)}</div>
          </div>` : ''}
        ${m.status ? `
          <div style="padding:6px 8px;background:rgba(255,255,255,0.05);border-radius:8px;">
            <div style="font-size:10px;color:rgba(255,255,255,0.35);margin-bottom:2px;">Status</div>
            <div style="font-size:11px;font-weight:600;color:${style.color};">${escHtml(m.status)}</div>
          </div>` : ''}
        ${m.funding ? `
          <div style="padding:6px 8px;background:rgba(255,255,255,0.05);border-radius:8px;">
            <div style="font-size:10px;color:rgba(255,255,255,0.35);margin-bottom:2px;">Funding</div>
            <div style="font-size:11px;font-weight:700;color:#eab308;">${fmtFunding(m.funding)}</div>
          </div>` : ''}
        ${m.region ? `
          <div style="padding:6px 8px;background:rgba(255,255,255,0.05);border-radius:8px;">
            <div style="font-size:10px;color:rgba(255,255,255,0.35);margin-bottom:2px;">Region</div>
            <div style="font-size:11px;font-weight:600;color:#e2e8f0;">${escHtml(m.region)}</div>
          </div>` : ''}
      </div>
    </div>
  `;
}

function buildClusterPopup(cluster: GeoCluster<EnhancedMapMarker>): string {
  return `
    <div style="font-family:Inter,system-ui,sans-serif;color:#e2e8f0;padding:2px 0;min-width:180px;">
      <div style="font-weight:700;font-size:14px;margin-bottom:2px;color:#f8fafc;">
        ${escHtml(cluster.label)}
      </div>
      <div style="font-size:11px;color:rgba(255,255,255,0.45);margin-bottom:8px;">
        ${cluster.markers.length} объектов
      </div>
      <div style="display:flex;flex-direction:column;gap:4px;">
        ${cluster.byDomain.map(({ domain, count }) => {
          const meta = DOMAIN_CONFIG[domain];
          return `
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="font-size:12px;">${meta.emoji}</span>
              <span style="flex:1;font-size:11px;color:#e2e8f0;">${escHtml(meta.labelRu)}</span>
              <span style="font-size:11px;font-weight:700;color:${meta.color};">${count}</span>
            </div>`;
        }).join('')}
      </div>
      <div style="font-size:10px;color:rgba(255,255,255,0.35);margin-top:8px;">
        Клик по метке — приблизить
      </div>
    </div>
  `;
}

// ── Single marker DOM element ─────────────────────────────────

function createMarkerEl(m: EnhancedMapMarker, onClick?: () => void): HTMLElement {
  const style = MARKER_STYLES[m.type];

  const el = document.createElement('div');
  el.style.cssText = `
    width: 32px; height: 32px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; pointer-events: auto;
    position: relative;
  `;

  const bg = document.createElement('div');
  bg.style.cssText = `
    width: 28px; height: 28px;
    border-radius: 50%;
    background: ${style.bg};
    border: 2px solid ${style.color};
    box-shadow: 0 0 10px ${style.color}60;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
    transform-origin: center;
    will-change: transform;
    line-height: 1;
  `;
  bg.textContent = style.emoji;
  el.appendChild(bg);

  el.addEventListener('mouseenter', () => {
    bg.style.transform = 'scale(1.25)';
    bg.style.boxShadow = `0 0 18px ${style.color}90`;
  });
  el.addEventListener('mouseleave', () => {
    bg.style.transform = 'scale(1)';
    bg.style.boxShadow = `0 0 10px ${style.color}60`;
  });

  if (onClick) el.addEventListener('click', (e) => { e.stopPropagation(); onClick(); });

  return el;
}

/** Чип региона: название места и разбивка по доменам вместо кружка с числом. */
function createClusterEl(
  cluster: GeoCluster<EnhancedMapMarker>,
  onClick: () => void,
): HTMLElement {
  // Цвет преобладающего домена группы приходит готовым из `clusterByGeography`,
  // чтобы обе карты красили чипы по одному правилу.
  const accent = cluster.color;

  const el = document.createElement('div');
  el.style.cssText = 'cursor: pointer; pointer-events: auto;';

  const chip = document.createElement('div');
  chip.style.cssText = `
    display: flex; flex-direction: column; gap: 3px;
    padding: 6px 10px;
    border-radius: 12px;
    background: rgba(0,8,24,0.88);
    border: 1.5px solid ${accent}80;
    box-shadow: 0 0 16px ${accent}40;
    backdrop-filter: blur(6px);
    transition: transform 0.15s ease, box-shadow 0.15s ease;
    white-space: nowrap;
  `;

  const title = document.createElement('div');
  title.style.cssText = `
    font-family: Inter, system-ui, sans-serif;
    font-size: 11px; font-weight: 700; line-height: 1;
    color: #f8fafc;
  `;
  title.textContent = cluster.label;
  chip.appendChild(title);

  const row = document.createElement('div');
  row.style.cssText = 'display: flex; align-items: center; gap: 6px;';
  for (const { domain, count } of cluster.byDomain.slice(0, 4)) {
    const meta = DOMAIN_CONFIG[domain];
    const item = document.createElement('span');
    item.style.cssText = `
      font-family: Inter, system-ui, sans-serif;
      font-size: 10px; font-weight: 700; line-height: 1;
      color: ${meta.color};
    `;
    item.textContent = `${meta.emoji} ${count}`;
    row.appendChild(item);
  }
  chip.appendChild(row);
  el.appendChild(chip);

  el.addEventListener('mouseenter', () => {
    chip.style.transform = 'scale(1.06)';
    chip.style.boxShadow = `0 0 24px ${accent}70`;
  });
  el.addEventListener('mouseleave', () => {
    chip.style.transform = 'scale(1)';
    chip.style.boxShadow = `0 0 16px ${accent}40`;
  });
  el.addEventListener('click', (e) => { e.stopPropagation(); onClick(); });

  return el;
}

// ── Filter markers client-side ────────────────────────────────

function applyFilters(markers: EnhancedMapMarker[], filters?: MapFilters): EnhancedMapMarker[] {
  if (!filters) return markers;

  return markers.filter(m => {
    // Object type
    const typeMatch = filters.objectTypes.length === 0 ||
      filters.objectTypes.some(t =>
        t === m.type ||
        (t === 'organization' && m.type === 'company') ||
        (t === 'company' && m.type === 'organization')
      );
    if (!typeMatch) return false;

    // Region
    if (filters.region !== 'all' && m.region !== filters.region) return false;

    // Country
    if (filters.country !== 'all' && m.country !== filters.country) return false;

    // Status
    if (filters.status !== 'all' && m.status?.toLowerCase() !== filters.status.toLowerCase()) return false;

    // Search
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const hay = `${m.name} ${m.country ?? ''} ${m.region ?? ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }

    // Funding
    if (m.funding !== undefined) {
      const fundingM = m.funding / 1_000_000;
      if (fundingM < filters.fundingMin || fundingM > filters.fundingMax * 1.1) return false;
    }

    return true;
  });
}

// ── Main Component ────────────────────────────────────────────

export function Map({
  center = MAP_DEFAULTS.center,
  zoom = MAP_DEFAULTS.zoom,
  markers = [],
  filters,
  onMarkerClick,
  height = '100%',
  className = '',
  interactive = true,
}: EnhancedMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markerInstancesRef = useRef<Marker[]>([]);
  const loadedRef = useRef(false);
  const onMarkerClickRef = useRef(onMarkerClick);
  const { world } = useWorldBorders();

  useEffect(() => { onMarkerClickRef.current = onMarkerClick; }, [onMarkerClick]);

  // ── Map init ──────────────────────────────────────────────
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
    map.on('load', () => { loadedRef.current = true; });

    return () => {
      markerInstancesRef.current.forEach(m => m.remove());
      markerInstancesRef.current = [];
      loadedRef.current = false;
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Render markers ────────────────────────────────────────
  const renderMarkers = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers
    markerInstancesRef.current.forEach(m => m.remove());
    markerInstancesRef.current = [];

    if (!markers || markers.length === 0) return;

    const filtered = applyFilters(markers, filters);
    const currentZoom = map.getZoom();

    // Все слои кластеризуются вместе: чип региона один, а не по чипу на слой,
    // иначе два чипа встали бы в одну и ту же точку центра области.
    const { single, clusters } = clusterByGeography(filtered, world, currentZoom);

    clusters.forEach(cluster => {
      const el = createClusterEl(cluster, () => {
        // Приближаем на охват меток группы, а не на точку подписи.
        const camera = map.cameraForBounds(cluster.bounds, { padding: 64 });
        map.easeTo({
          center: camera?.center ?? [cluster.lng, cluster.lat],
          zoom: clampDrilldownZoom(cluster.level, camera?.zoom, MAP_DEFAULTS.maxZoom),
          duration: 700,
        });
      });
      const popup = new maplibregl.Popup({ offset: 20, closeButton: true, maxWidth: '260px' })
        .setHTML(buildClusterPopup(cluster));
      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([cluster.lng, cluster.lat])
        .setPopup(popup)
        .addTo(map);
      markerInstancesRef.current.push(marker);
    });

    const addSingles = (layer: EnhancedMapMarker['layer']) => () => {
      single.filter(m => m.layer === layer).forEach(m => {
        const el = createMarkerEl(m, () => onMarkerClickRef.current?.(m));
        const popup = new maplibregl.Popup({ offset: 16, closeButton: true, maxWidth: '260px' })
          .setHTML(buildMarkerPopup(m));
        const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat([m.lng, m.lat])
          .setPopup(popup)
          .addTo(map);
        markerInstancesRef.current.push(marker);
      });
    };

    addSingles('water')();
    setTimeout(addSingles('organization'), 300);

  }, [markers, filters, world]);

  // Run renderMarkers on markers / filters change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (loadedRef.current) {
      renderMarkers();
    } else {
      map.once('load', renderMarkers);
    }
  }, [renderMarkers]);

  // Re-cluster on zoom change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const onZoom = () => renderMarkers();
    map.on('zoomend', onZoom);
    return () => { map.off('zoomend', onZoom); };
  }, [renderMarkers]);

  return (
    <div
      ref={containerRef}
      className={`w-full ${className}`}
      style={{ height, background: '#0a1628' }}
    />
  );
}
