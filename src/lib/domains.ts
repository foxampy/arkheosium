// src/lib/domains.ts
// Shared multi-domain classification config for ARKHEOSIUM.
// Every seeded resource/object/project/subject/complex carries a `domain`
// (water | energy | minerals | nature | agriculture | climate). This module is
// the single source of truth for how each domain is labelled and coloured on
// maps, legends, filters and cards.

export type DomainKey =
  | 'water'
  | 'oilgas'
  | 'energy'
  | 'minerals'
  | 'ecology'
  | 'nature'
  | 'agriculture'
  | 'climate';

export interface DomainMeta {
  key: DomainKey;
  labelRu: string;
  labelEn: string;
  /** Marker / legend accent colour */
  color: string;
  /** Short emoji used in legend chips and popups */
  emoji: string;
}

export const DOMAIN_CONFIG: Record<DomainKey, DomainMeta> = {
  water: {
    key: 'water',
    labelRu: 'Вода',
    labelEn: 'Water',
    color: '#00e6c8',
    emoji: '💧',
  },
  oilgas: {
    key: 'oilgas',
    labelRu: 'Нефть и газ',
    labelEn: 'Oil & Gas',
    color: '#fb923c',
    emoji: '🛢️',
  },
  energy: {
    key: 'energy',
    labelRu: 'Энергетика',
    labelEn: 'Energy',
    color: '#f59e0b',
    emoji: '⚡',
  },
  minerals: {
    key: 'minerals',
    labelRu: 'Ископаемые',
    labelEn: 'Minerals',
    color: '#c084fc',
    emoji: '⛏️',
  },
  ecology: {
    key: 'ecology',
    labelRu: 'Экология',
    labelEn: 'Ecology',
    color: '#4ade80',
    emoji: '🌍',
  },
  nature: {
    key: 'nature',
    labelRu: 'Природа',
    labelEn: 'Nature',
    color: '#34d399',
    emoji: '🌿',
  },
  agriculture: {
    key: 'agriculture',
    labelRu: 'Агро',
    labelEn: 'Agriculture',
    color: '#a3e635',
    emoji: '🌾',
  },
  climate: {
    key: 'climate',
    labelRu: 'Климат',
    labelEn: 'Climate',
    color: '#7dd3fc',
    emoji: '☁️',
  },
};

/** Ordered list for building legends / filter rows. */
export const DOMAIN_ORDER: DomainKey[] = [
  'water',
  'oilgas',
  'energy',
  'minerals',
  'ecology',
  'nature',
  'agriculture',
  'climate',
];

/** Narrow an arbitrary string to a known DomainKey, defaulting to 'water'. */
export function normalizeDomain(d?: string | null): DomainKey {
  if (d && d in DOMAIN_CONFIG) return d as DomainKey;
  return 'water';
}

/** Colour lookup with a safe fallback for unknown domains. */
export function domainColor(d?: string | null): string {
  return DOMAIN_CONFIG[normalizeDomain(d)].color;
}
