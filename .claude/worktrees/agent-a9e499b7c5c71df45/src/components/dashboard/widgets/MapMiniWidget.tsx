// src/components/dashboard/widgets/MapMiniWidget.tsx
import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { useLocation } from 'wouter';
import { OBJECTS_DATA } from '@/data/objects-data';

export function MapMiniWidget() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [, nav] = useLocation();

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: [63, 42],
      zoom: 2.5,
      attributionControl: false,
      interactive: true,
    });
    mapRef.current = map;
    map.on('load', () => {
      OBJECTS_DATA.forEach(obj => {
        if (!obj.coordinates) return;
        const { lat, lng } = obj.coordinates;
        const el = document.createElement('div');
        el.style.cssText = 'width:8px;height:8px;border-radius:50%;background:#00e6c8;box-shadow:0 0 6px #00e6c880;cursor:pointer;';
        new maplibregl.Marker({ element: el })
          .setLngLat([lng, lat])
          .addTo(map);
        el.addEventListener('click', () => nav(`/hub/object/${obj.id}`));
      });
    });
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full rounded-lg overflow-hidden" />;
}
