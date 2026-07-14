import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import type { ProjectData } from '@/data/projects/types';

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

// ─── Props ────────────────────────────────────────────────────
interface TechPartnersSectionProps {
  project: ProjectData;
}

// ─── Component ───────────────────────────────────────────────
export default function TechPartnersSection({ project }: TechPartnersSectionProps) {
  const { techPartners } = project;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45 }}
    >
      <SectionTitle
        icon={Globe}
        title="Технологические партнёры"
        subtitle="Рассматриваемые подрядчики и поставщики"
        color="#60a5fa"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {techPartners.map((cat, i) => (
          <motion.div
            key={cat.category}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.07 }}
            className="rounded-2xl p-5"
            style={{ background: 'rgba(0,6,20,0.8)', border: `1px solid ${cat.color}15` }}
          >
            <h4 className="font-bold text-sm mb-3" style={{ color: cat.color }}>
              {cat.label}
            </h4>
            <div className="flex flex-wrap gap-2">
              {cat.names.map((name) => (
                <span
                  key={name}
                  className="px-2.5 py-1 rounded-xl text-xs font-semibold"
                  style={{
                    background: `${cat.color}10`,
                    color: 'rgba(255,255,255,0.75)',
                    border: `1px solid ${cat.color}20`,
                  }}
                >
                  {name}
                </span>
              ))}
            </div>
            <p className="text-white/25 text-xs mt-3 leading-relaxed">
              Окончательный состав определяется через конкурсный отбор в ходе реализации.
            </p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
