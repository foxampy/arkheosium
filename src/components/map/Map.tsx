// ═══════════════════════════════════════════════════════════════
//  Map.tsx — Enhanced interactive map with:
//  - Water resources AND partnerships (organizations) as markers
//  - Differentiated icons per type (Dam, Reservoir, Treatment Plant,
//    Organization/Company, Investment Project, Startup)
//  - Cluster markers when zoomed out (count badge)
//  - Progressive layer loading (water first, then organizations)
//  - Rich popup mini-cards: name, country, type, status, funding
//  - Accepts MapFilters for filtering markers client-side
// ═══════════════════════════════════════════════════════════════

import { useEffect, useRef, useCallback } from 'react';
import maplibregl, { Map as MapLibreMap, Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MAP_TILES, MAP_DEFAULTS } from '@/lib/map-config';
import type { MapFilters } from './MapFilterPanel';

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

// ── Clustering logic (client-side) ────────────────────────────

interface ClusterGroup {
  markers: EnhancedMapMarker[];
  lat: number;
  lng: number;
}

function clusterMarkers(
  markers: EnhancedMapMarker[],
  zoom: number,
): { single: EnhancedMapMarker[]; clusters: ClusterGroup[] } {
  // Cluster radius in degrees — shrinks as zoom increases
  const radius = zoom < 4 ? 8 : zoom < 6 ? 4 : zoom < 8 ? 1.5 : 0;

  if (radius === 0) {
    return { single: markers, clusters: [] };
  }

  const visited = new Set<number>();
  const clusters: ClusterGroup[] = [];
  const single: EnhancedMapMarker[] = [];

  markers.forEach((m, i) => {
    if (visited.has(i)) return;
    const neighbors = markers.filter((n, j) => {
      if (visited.has(j) || j === i) return false;
      return (
        Math.abs(m.lat - n.lat) < radius &&
        Math.abs(m.lng - n.lng) < radius
      );
    });

    if (neighbors.length > 0) {
      const group = [m, ...neighbors];
      const indices = [i, ...neighbors.map((_, j) =>
        markers.findIndex((x) => x === neighbors[j]))];
      indices.forEach(idx => visited.add(idx));
      visited.add(i);
      clusters.push({
        markers: group,
        lat: group.reduce((s, x) => s + x.lat, 0) / group.length,
        lng: group.reduce((s, x) => s + x.lng, 0) / group.length,
      });
    } else {
      visited.add(i);
      single.push(m);
    }
  });

  return { single, clusters };
}

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

function buildClusterPopup(cluster: ClusterGroup): string {
  const types = Array.from(new Set(cluster.markers.map(m => MARKER_STYLES[m.type].emoji))).slice(0, 5).join(' ');
  return `
    <div style="font-family:Inter,system-ui,sans-serif;color:#e2e8f0;padding:2px 0;min-width:160px;">
      <div style="font-weight:700;font-size:14px;margin-bottom:6px;color:#f8fafc;">
        ${types} Cluster (${cluster.markers.length})
      </div>
      <div style="font-size:11px;color:rgba(255,255,255,0.5);margin-bottom:8px;">
        Zoom in to see individual markers
      </div>
      <div style="display:flex;flex-direction:column;gap:3px;max-height:120px;overflow:auto;">
        ${cluster.markers.slice(0, 5).map(m => `
          <div style="display:flex;align-items:center;gap:6px;padding:3px 0;">
            <span style="font-size:12px">${MARKER_STYLES[m.type].emoji}</span>
            <span style="font-size:11px;color:#e2e8f0;line-clamp:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:130px;">${escHtml(m.name)}</span>
          </div>`).join('')}
        ${cluster.markers.length > 5 ? `<div style="font-size:10px;color:rgba(255,255,255,0.35);padding-top:4px;">+${cluster.markers.length - 5} more</div>` : ''}
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

function createClusterEl(count: number, types: EnhancedMarkerType[]): HTMLElement {
  const primaryType = types[0] ?? 'organization';
  const style = MARKER_STYLES[primaryType];

  const el = document.createElement('div');
  el.style.cssText = `
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; pointer-events: auto;
  `;

  const circle = document.createElement('div');
  circle.style.cssText = `
    width: 40px; height: 40px;
    border-radius: 50%;
    background: rgba(0,8,24,0.9);
    border: 2.5px solid ${style.color};
    box-shadow: 0 0 16px ${style.color}50;
    display: flex; align-items: center; justify-content: center;
    flex-direction: column;
    transition: transform 0.15s ease;
  `;

  const countEl = document.createElement('div');
  countEl.style.cssText = `
    font-size: 12px; font-weight: 900;
    color: ${style.color};
    line-height: 1;
  `;
  countEl.textContent = String(count);

  circle.appendChild(countEl);
  el.appendChild(circle);

  el.addEventListener('mouseenter', () => { circle.style.transform = 'scale(1.15)'; });
  el.addEventListener('mouseleave', () => { circle.style.transform = 'scale(1)'; });

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

    // Separate by layer
    const waterMarkers = filtered.filter(m => m.layer === 'water');
    const orgMarkers = filtered.filter(m => m.layer === 'organization');

    // Cluster each layer independently
    const { single: wSingle, clusters: wClusters } = clusterMarkers(waterMarkers, currentZoom);
    const { single: oSingle, clusters: oClusters } = clusterMarkers(orgMarkers, currentZoom);

    const addDelay = (fn: () => void, delay: number) =>
      setTimeout(fn, delay);

    // Layer 1: water resources (immediate)
    const addWater = () => {
      wSingle.forEach(m => {
        const el = createMarkerEl(m, () => onMarkerClickRef.current?.(m));
        const popup = new maplibregl.Popup({ offset: 16, closeButton: true, maxWidth: '260px' })
          .setHTML(buildMarkerPopup(m));
        const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat([m.lng, m.lat])
          .setPopup(popup)
          .addTo(map);
        markerInstancesRef.current.push(marker);
      });

      wClusters.forEach(cluster => {
        const types = cluster.markers.map(m => m.type);
        const el = createClusterEl(cluster.markers.length, types);
        const popup = new maplibregl.Popup({ offset: 20, closeButton: true, maxWidth: '240px' })
          .setHTML(buildClusterPopup(cluster));
        const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat([cluster.lng, cluster.lat])
          .setPopup(popup)
          .addTo(map);
        markerInstancesRef.current.push(marker);
      });
    };

    // Layer 2: organizations (slight delay for progressive effect)
    const addOrgs = () => {
      oSingle.forEach(m => {
        const el = createMarkerEl(m, () => onMarkerClickRef.current?.(m));
        const popup = new maplibregl.Popup({ offset: 16, closeButton: true, maxWidth: '260px' })
          .setHTML(buildMarkerPopup(m));
        const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat([m.lng, m.lat])
          .setPopup(popup)
          .addTo(map);
        markerInstancesRef.current.push(marker);
      });

      oClusters.forEach(cluster => {
        const types = cluster.markers.map(m => m.type);
        const el = createClusterEl(cluster.markers.length, types);
        const popup = new maplibregl.Popup({ offset: 20, closeButton: true, maxWidth: '240px' })
          .setHTML(buildClusterPopup(cluster));
        const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat([cluster.lng, cluster.lat])
          .setPopup(popup)
          .addTo(map);
        markerInstancesRef.current.push(marker);
      });
    };

    addWater();
    addDelay(addOrgs, 300);

  }, [markers, filters]);

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
