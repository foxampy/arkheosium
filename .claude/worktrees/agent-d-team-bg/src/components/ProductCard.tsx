import { motion } from 'framer-motion';
import type { ElementType } from 'react';

export interface ProductCardBadge {
  label: string;
  color?: string;
}

export interface ProductCardSpec {
  label: string;
  value: string;
}

export interface ProductCardProps {
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  placeholderIcon?: ElementType;
  placeholderColor?: string;
  badges?: ProductCardBadge[];
  specs?: ProductCardSpec[];
  onClick?: () => void;
  index?: number;
  /** Extra node rendered in the top-right of the image area */
  imageOverlay?: React.ReactNode;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

export default function ProductCard({
  title,
  subtitle,
  description,
  imageUrl,
  placeholderIcon: Icon,
  placeholderColor = '#06b6d4',
  badges,
  specs,
  onClick,
  index = 0,
  imageOverlay,
}: ProductCardProps) {
  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className="rounded-2xl overflow-hidden cursor-pointer group transition-all duration-200"
      style={{
        background: 'rgba(0,14,40,0.9)',
        border: `1px solid ${placeholderColor}18`,
        boxShadow: `0 2px 12px rgba(0,0,0,0.3)`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${placeholderColor}50`;
        e.currentTarget.style.boxShadow = `0 4px 24px rgba(0,0,0,0.4), 0 0 20px ${placeholderColor}15`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = `${placeholderColor}18`;
        e.currentTarget.style.boxShadow = `0 2px 12px rgba(0,0,0,0.3)`;
      }}
    >
      {/* Image area */}
      <div
        className="relative w-full overflow-hidden"
        style={{ aspectRatio: '16 / 10' }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${placeholderColor}18 0%, ${placeholderColor}08 50%, rgba(0,14,40,0.95) 100%)`,
            }}
          >
            {Icon && (
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                  background: `${placeholderColor}15`,
                  border: `1px solid ${placeholderColor}25`,
                }}
              >
                <Icon
                  size={28}
                  style={{ color: placeholderColor, opacity: 0.7 }}
                />
              </div>
            )}
          </div>
        )}
        {/* Optional overlay in top-right (e.g. DB badge) */}
        {imageOverlay && (
          <div className="absolute top-2 right-2">{imageOverlay}</div>
        )}
      </div>

      {/* Content */}
      <div className="p-3.5">
        {/* Title */}
        <h3 className="text-sm font-bold text-white leading-snug line-clamp-2 group-hover:text-cyan-300 transition-colors">
          {title}
        </h3>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-xs text-white/35 mt-0.5 truncate">{subtitle}</p>
        )}

        {/* Description */}
        {description && (
          <p className="text-xs text-white/40 leading-relaxed line-clamp-2 mt-2">
            {description}
          </p>
        )}

        {/* Badges */}
        {badges && badges.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {badges.map((badge, i) => (
              <span
                key={i}
                className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: `${badge.color || placeholderColor}15`,
                  color: badge.color || placeholderColor,
                  border: `1px solid ${badge.color || placeholderColor}25`,
                }}
              >
                {badge.label}
              </span>
            ))}
          </div>
        )}

        {/* Specs */}
        {specs && specs.length > 0 && (
          <div
            className="flex items-center gap-3 mt-3 pt-2.5"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            {specs.map((spec, i) => (
              <div key={i} className="min-w-0">
                <div className="text-[10px] text-white/25 truncate">{spec.label}</div>
                <div
                  className="text-xs font-bold truncate"
                  style={{ color: placeholderColor }}
                >
                  {spec.value}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
