import { motion } from 'framer-motion';
import { Building2, Shield, Layers } from 'lucide-react';
import type { ProjectData } from '@/data/projects/types';

// ─── Icon resolver ────────────────────────────────────────────
const ICON_MAP: Record<string, React.ElementType> = { Building2, Shield, Layers };
function resolveIcon(name?: string): React.ElementType {
  return (name && ICON_MAP[name]) ? ICON_MAP[name] : Building2;
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

// ─── Props ────────────────────────────────────────────────────
interface PPPSectionProps {
  project: ProjectData;
}

// ─── Component ───────────────────────────────────────────────
export default function PPPSection({ project }: PPPSectionProps) {
  const { ppp } = project;
  const totalShare = ppp.parties.reduce((a, b) => a + b.share, 0);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
    >
      <SectionTitle
        icon={Layers}
        title="Структура ГЧП"
        subtitle="Распределение долей и обязательства сторон"
        color="#60a5fa"
      />

      {/* Ownership cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        {ppp.parties.map((party, i) => (
          <motion.div
            key={party.name}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.07 }}
            className="rounded-2xl p-5"
            style={{
              background: `${party.color}06`,
              border: `1px solid ${party.color}20`,
            }}
          >
            {/* Share badge */}
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl mb-3"
              style={{ background: `${party.color}15`, border: `1px solid ${party.color}30`, color: party.color }}
            >
              {party.share}%
            </div>
            <div className="text-white font-black text-lg leading-tight mb-0.5">{party.name}</div>
            <div className="text-white/40 text-xs mb-2">{party.role}</div>
            <p className="text-white/55 text-xs leading-relaxed">{party.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Animated share bar */}
      <div
        className="rounded-2xl p-5 mb-5"
        style={{ background: 'rgba(0,6,20,0.8)', border: '1px solid rgba(96,165,250,0.12)' }}
      >
        <h4 className="text-white/60 text-xs font-semibold mb-3 uppercase tracking-wider">
          Распределение долей
        </h4>
        <div className="h-4 rounded-full overflow-hidden flex" style={{ background: 'rgba(255,255,255,0.05)' }}>
          {ppp.parties.map((party, i) => {
            const pct = (party.share / totalShare) * 100;
            return (
              <motion.div
                key={party.name}
                initial={{ flex: 0 }}
                animate={{ flex: pct }}
                transition={{ duration: 0.9, ease: 'easeOut', delay: 0.3 + i * 0.08 }}
                className="h-full"
                style={{
                  background: `linear-gradient(90deg, ${party.color}, ${party.color}cc)`,
                  marginRight: i < ppp.parties.length - 1 ? '2px' : 0,
                  borderRadius: i === 0 ? '999px 0 0 999px' : i === ppp.parties.length - 1 ? '0 999px 999px 0' : 0,
                }}
              />
            );
          })}
        </div>
        <div className="flex flex-wrap gap-4 mt-3">
          {ppp.parties.map((party) => (
            <div key={party.name} className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: party.color }}
              />
              <span className="text-white/55 text-xs">
                {party.name}{' '}
                <span className="font-bold" style={{ color: party.color }}>
                  {party.share}%
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Obligations grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {ppp.obligations.map((obl, i) => {
          const Icon = resolveIcon(obl.icon);
          return (
            <motion.div
              key={obl.party}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.08 }}
              className="rounded-2xl p-5"
              style={{
                background: 'rgba(0,6,20,0.8)',
                border: `1px solid ${obl.color}18`,
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${obl.color}15`, border: `1px solid ${obl.color}25` }}
                >
                  <Icon size={14} style={{ color: obl.color }} />
                </div>
                <h4 className="font-bold text-sm" style={{ color: obl.color }}>
                  {obl.party}
                </h4>
              </div>
              <ul className="space-y-2.5">
                {obl.items.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <div
                      className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                      style={{ background: obl.color }}
                    />
                    <span className="text-white/65 text-xs leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}
