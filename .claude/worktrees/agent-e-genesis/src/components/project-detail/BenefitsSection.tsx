import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, TrendingUp, HardHat, Briefcase, Heart,
  DollarSign, BarChart2, Home, Factory, Landmark,
  Leaf, Droplets, Wifi, Waves, TreePine, Star,
} from 'lucide-react';
import type { ProjectData, BenefitItem } from '@/data/projects/types';

// ─── Icon resolver ────────────────────────────────────────────
const ICON_MAP: Record<string, React.ElementType> = {
  Users, TrendingUp, HardHat, Briefcase, Heart,
  DollarSign, BarChart2, Home, Factory, Landmark,
  Leaf, Droplets, Wifi, Waves, TreePine, Star,
};

function resolveIcon(name: string): React.ElementType {
  return ICON_MAP[name] ?? Star;
}

// ─── Section title ────────────────────────────────────────────
function SectionTitle({
  icon: Icon,
  title,
  subtitle,
  color = '#00e6c8',
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  color?: string;
}) {
  return (
    <div className="flex items-start gap-3 mb-6">
      <div
        className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
        style={{ background: `${color}15`, border: `1px solid ${color}30` }}
      >
        <Icon size={18} style={{ color }} />
      </div>
      <div>
        <h2 className="text-white font-black text-xl leading-tight">{title}</h2>
        {subtitle && <p className="text-white/40 text-sm mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

// ─── Tab config ───────────────────────────────────────────────
const TABS = [
  { key: 'social' as const, label: 'Социальный', color: '#00e6c8' },
  { key: 'economic' as const, label: 'Экономический', color: '#4ade80' },
  { key: 'environmental' as const, label: 'Экологический', color: '#34d399' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

// ─── Benefit card ────────────────────────────────────────────
function BenefitCard({ item, index }: { item: BenefitItem; index: number }) {
  const Icon = resolveIcon(item.icon);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="rounded-2xl p-4"
      style={{ background: `${item.color}08`, border: `1px solid ${item.color}20` }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
        style={{ background: `${item.color}15`, border: `1px solid ${item.color}25` }}
      >
        <Icon size={15} style={{ color: item.color }} />
      </div>
      <div className="font-black text-2xl leading-tight mb-0.5" style={{ color: item.color }}>
        {item.value}
      </div>
      <div className="text-white/75 text-xs font-semibold mb-0.5">{item.label}</div>
      {item.sublabel && <div className="text-white/35 text-xs">{item.sublabel}</div>}
    </motion.div>
  );
}

// ─── Props ────────────────────────────────────────────────────
interface BenefitsSectionProps {
  project: ProjectData;
}

// ─── Component ───────────────────────────────────────────────
export default function BenefitsSection({ project }: BenefitsSectionProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('social');
  const { benefits } = project;

  const tabColor = TABS.find((t) => t.key === activeTab)?.color ?? '#00e6c8';
  const items = benefits[activeTab];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <SectionTitle
        icon={Users}
        title="Эффекты проекта"
        subtitle="Социальный, экономический и экологический вклад"
        color="#00e6c8"
      />

      {/* Tab switcher */}
      <div
        className="inline-flex rounded-2xl p-1 mb-6 gap-1"
        style={{ background: 'rgba(0,6,20,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
              style={{
                background: isActive ? `${tab.color}18` : 'transparent',
                color: isActive ? tab.color : 'rgba(255,255,255,0.4)',
                border: isActive ? `1px solid ${tab.color}30` : '1px solid transparent',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Animated tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3"
        >
          {items.map((item, idx) => (
            <BenefitCard key={item.label} item={item} index={idx} />
          ))}
        </motion.div>
      </AnimatePresence>
    </motion.section>
  );
}
