import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MAP_TILES } from '@/lib/map-config';
import { createMarkerElement } from './MapIcons';

export interface MiniMapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  markerColor?: string;
  /** Icon type key for the marker (dam, river, subject, project, etc.) */
  markerType?: string;
  height?: string;
  className?: string;
}

/**
 * A minimal MapLibre GL map with a single marker, styled to match the WaterMap dark theme.
 * Intended for use in detail pages to show entity location.
 */
export function MiniMap({
  latitude,
  longitude,
  zoom = 10,
  markerColor = '#22d3ee',
  markerType = 'object',
  height = '200px',
  className = '',
}: MiniMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_TILES.styleUrl,
      center: [longitude, latitude],
      zoom,
      interactive: true,
      attributionControl: false,
      dragRotate: false,
      pitchWithRotate: false,
    });

    // Add minimal attribution
    map.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      'bottom-right',
    );

    // Disable rotation
    map.touchZoomRotate.disableRotation();

    mapInstanceRef.current = map;

    map.on('load', () => {
      // Create the marker with the entity-specific icon
      const el = createMarkerElement(markerType, markerColor, 40);

      new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([longitude, latitude])
        .addTo(map);
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latitude, longitude, zoom, markerColor, markerType]);

  return (
    <div
      ref={containerRef}
      className={`w-full ${className}`}
      style={{
        height,
        borderRadius: '16px',
        overflow: 'hidden',
        background: '#0a1628',
      }}
    />
  );
}
