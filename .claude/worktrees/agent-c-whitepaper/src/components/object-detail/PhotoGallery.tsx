import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, ChevronLeft, ChevronRight, Image } from 'lucide-react';
import type { FullObjectData, ObjectPhoto } from '@/types/object-full';

// ─── Types ────────────────────────────────────────────────────────────────────

type PhotoType = ObjectPhoto['type'] | 'all';

const FILTER_LABELS: Record<PhotoType, string> = {
  all:       'Все',
  exterior:  'Внешний вид',
  interior:  'Интерьер',
  aerial:    'С воздуха',
  technical: 'Технические',
  problem:   'Проблемы',
};

// ─── Lightbox ─────────────────────────────────────────────────────────────────

function Lightbox({
  photos,
  initialIndex,
  onClose,
}: {
  photos: ObjectPhoto[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(initialIndex);

  const prev = useCallback(() => setCurrent((c) => (c - 1 + photos.length) % photos.length), [photos.length]);
  const next = useCallback(() => setCurrent((c) => (c + 1) % photos.length), [photos.length]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, prev, next]);

  const photo = photos[current];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      >
        {/* Content area — stop propagation so clicking image doesn't close */}
        <div className="relative max-w-4xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute -top-12 right-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
            style={{ color: 'rgba(255,255,255,0.6)' }}
          >
            <X size={20} />
          </button>

          {/* Image */}
          <motion.img
            key={current}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            src={photo.url}
            alt={photo.caption_ru ?? 'Фото объекта'}
            loading="lazy"
            className="w-full rounded-2xl object-contain"
            style={{ maxHeight: '70vh' }}
          />

          {/* Caption */}
          <div className="mt-4 text-center">
            {photo.caption_ru && (
              <p className="text-white/70 text-sm mb-1">{photo.caption_ru}</p>
            )}
            <div className="flex items-center justify-center gap-3">
              <span
                className="px-2 py-0.5 rounded-full text-xs"
                style={{ background: 'rgba(0,230,200,0.12)', color: '#00e6c8', border: '1px solid rgba(0,230,200,0.2)' }}
              >
                {FILTER_LABELS[photo.type]}
              </span>
              {photo.taken_at && (
                <span className="text-white/25 text-xs">{photo.taken_at}</span>
              )}
              <span className="text-white/25 text-xs">{current + 1} / {photos.length}</span>
            </div>
          </div>

          {/* Prev/Next buttons */}
          {photos.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-14 w-11 h-11 rounded-full flex items-center justify-center transition-all hover:bg-white/10"
                style={{
                  background: 'rgba(0,6,20,0.85)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.6)',
                }}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={next}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-14 w-11 h-11 rounded-full flex items-center justify-center transition-all hover:bg-white/10"
                style={{
                  background: 'rgba(0,6,20,0.85)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.6)',
                }}
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Photo Card ───────────────────────────────────────────────────────────────

function PhotoCard({ photo, onClick }: { photo: ObjectPhoto; onClick: () => void }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="relative overflow-hidden rounded-xl cursor-pointer group"
      style={{ aspectRatio: '16/9' }}
    >
      <img
        src={photo.url}
        alt={photo.caption_ru ?? 'Фото объекта'}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />

      {/* Dark gradient overlay */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: 'linear-gradient(to top, rgba(0,4,14,0.85) 0%, transparent 50%)' }}
      />
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to top, rgba(0,4,14,0.65) 0%, transparent 60%)' }}
      />

      {/* Caption overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        {photo.caption_ru && (
          <p className="text-white/80 text-xs leading-snug mb-1.5 line-clamp-2">{photo.caption_ru}</p>
        )}
        <span
          className="inline-block px-2 py-0.5 rounded-full text-xs"
          style={{ background: 'rgba(0,6,20,0.75)', color: '#00e6c8', border: '1px solid rgba(0,230,200,0.25)' }}
        >
          {FILTER_LABELS[photo.type]}
        </span>
      </div>

      {/* Expand icon on hover */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(0,6,20,0.85)', border: '1px solid rgba(255,255,255,0.15)' }}
        >
          <Image size={13} className="text-white/70" />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div
      className="rounded-xl flex flex-col items-center justify-center py-16 gap-3"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}
    >
      <Camera size={32} className="text-white/15" />
      <p className="text-white/25 text-sm">Фотографии не добавлены</p>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PhotoGallery({ object }: { object: FullObjectData }) {
  const [activeFilter, setActiveFilter] = useState<PhotoType>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const allPhotos = object.photos ?? [];

  // Available filter types based on what photos exist
  const availableTypes: PhotoType[] = ['all', ...Array.from(new Set(allPhotos.map((p) => p.type)))];

  const filtered = activeFilter === 'all' ? allPhotos : allPhotos.filter((p) => p.type === activeFilter);

  // For lightbox, we use the full filtered list
  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

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
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.2)' }}
        >
          <Camera size={17} style={{ color: '#60a5fa' }} />
        </div>
        <h2 className="text-white font-black text-xl flex-1">Фотогалерея</h2>
        <span className="text-white/30 text-sm">{filtered.length} фото</span>
      </div>

      {/* Filter tabs */}
      {allPhotos.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {availableTypes.map((type) => {
            const count = type === 'all' ? allPhotos.length : allPhotos.filter((p) => p.type === type).length;
            return (
              <button
                key={type}
                onClick={() => setActiveFilter(type)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={
                  activeFilter === type
                    ? { background: 'rgba(0,230,200,0.18)', color: '#00e6c8', border: '1px solid rgba(0,230,200,0.3)' }
                    : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.08)' }
                }
              >
                {FILTER_LABELS[type]}
                <span className="ml-1.5 opacity-60">({count})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((photo, i) => (
            <PhotoCard key={i} photo={photo} onClick={() => openLightbox(i)} />
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          photos={filtered}
          initialIndex={lightboxIndex}
          onClose={closeLightbox}
        />
      )}
    </motion.section>
  );
}
