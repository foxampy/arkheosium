import { MapPin, ExternalLink } from 'lucide-react';
import type { FullObjectData } from '@/types/object-full';

export default function MapSection({ object }: { object: FullObjectData }) {
  const coords = object.coordinates;

  if (!coords) {
    return (
      <div
        className="rounded-2xl p-8 text-center"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <MapPin size={32} className="mx-auto mb-3 text-white/20" />
        <p className="text-white/40">Координаты не указаны</p>
      </div>
    );
  }

  const lat = coords.lat;
  const lng = coords.lng;
  const zoom = 12;

  // OpenStreetMap embed
  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.15}%2C${lat - 0.12}%2C${lng + 0.15}%2C${lat + 0.12}&layer=mapnik&marker=${lat}%2C${lng}`;
  const osmLink = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=${zoom}/${lat}/${lng}`;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: '1px solid rgba(0,230,200,0.15)' }}
    >
      {/* Header */}
      <div
        className="px-5 py-3 flex items-center justify-between"
        style={{ background: 'rgba(0,6,20,0.9)', borderBottom: '1px solid rgba(0,230,200,0.1)' }}
      >
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-cyan-400" />
          <span className="text-white/80 text-sm font-semibold">Расположение объекта</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-white/40 text-xs font-mono">
            {lat.toFixed(4)}°N {lng.toFixed(4)}°E
          </span>
          <a
            href={osmLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <ExternalLink size={11} /> OpenStreetMap
          </a>
        </div>
      </div>

      {/* Map iframe */}
      <iframe
        src={osmUrl}
        width="100%"
        height="420"
        style={{ border: 'none', display: 'block' }}
        title={`Карта: ${object.name_ru ?? object.name_en}`}
        loading="lazy"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}
