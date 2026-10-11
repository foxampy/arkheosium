import { motion } from 'framer-motion';
import {
  ChevronLeft, MapPin, Droplets, DollarSign, Clock, Users,
  TrendingUp, BarChart2,
} from 'lucide-react';
import type { ProjectData } from '@/data/projects/types';

// ─── Icon resolver ────────────────────────────────────────────
const ICON_MAP: Record<string, React.ElementType> = {
  Droplets, DollarSign, Clock, Users, TrendingUp, BarChart2,
};

function resolveIcon(name?: string): React.ElementType {
  return (name && ICON_MAP[name]) ? ICON_MAP[name] : Droplets;
}

// ─── KPI Card ─────────────────────────────────────────────────
interface KPICardProps {
  label: string;
  value: string;
  unit?: string;
  color: string;
  icon?: string;
  delay?: number;
}

function KPICard({ label, value, unit, color, icon, delay = 0 }: KPICardProps) {
  const Icon = resolveIcon(icon);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-2xl p-4"
      style={{ background: `${color}08`, border: `1px solid ${color}20` }}
    >
      <Icon size={16} style={{ color }} className="mb-2" />
      <div className="text-white/40 text-xs mb-1">{label}</div>
      <div className="font-black text-xl leading-tight" style={{ color }}>
        {value}
        {unit && <span className="text-white/35 font-normal text-xs ml-1">{unit}</span>}
      </div>
    </motion.div>
  );
}

// ─── Props ────────────────────────────────────────────────────
interface ProjectHeroProps {
  project: ProjectData;
  onBack: () => void;
}

// ─── Component ───────────────────────────────────────────────
export default function ProjectHero({ project, onBack }: ProjectHeroProps) {
  return (
    <div className="relative overflow-hidden">
      {/* Background radial glows */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.12 }}
          transition={{ duration: 1.2 }}
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, #00e6c8, transparent)' }}
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.08 }}
          transition={{ duration: 1.4, delay: 0.2 }}
          className="absolute top-20 right-1/4 w-64 h-64 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, #60a5fa, transparent)' }}
        />
      </div>

      {/* Water wave stripe pattern */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 30px, rgba(0,230,200,0.3) 30px, rgba(0,230,200,0.3) 31px)',
        }}
      />

      <div className="relative max-w-5xl mx-auto px-5 pt-6 pb-8">
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs cursor-pointer mb-6 transition-all hover:opacity-80"
          style={{
            background: 'rgba(0,6,20,0.8)',
            color: 'rgba(255,255,255,0.55)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <ChevronLeft size={13} />
          Все проекты
        </button>

        {/* Status badges */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-2 mb-4"
        >
          <span
            className="px-3 py-1 rounded-full text-xs font-bold"
            style={{
              background: 'rgba(0,230,200,0.15)',
              color: '#00e6c8',
              border: '1px solid rgba(0,230,200,0.3)',
            }}
          >
            🇺🇿 {project.location.country}
          </span>
          <span
            className="px-3 py-1 rounded-full text-xs font-bold"
            style={{
              background: 'rgba(96,165,250,0.15)',
              color: '#60a5fa',
              border: '1px solid rgba(96,165,250,0.3)',
            }}
          >
            ГЧП — Государственно-частное партнёрство
          </span>
          {project.status && (
            <span
              className="px-3 py-1 rounded-full text-xs font-bold"
              style={{
                background: 'rgba(251,191,36,0.15)',
                color: '#fbbf24',
                border: '1px solid rgba(251,191,36,0.3)',
              }}
            >
              📋 {project.status}
            </span>
          )}
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <h1
            className="text-white font-black leading-tight mb-2"
            style={{ fontSize: 'clamp(28px, 5vw, 48px)' }}
          >
            Проект{' '}
            <span
              style={{
                background: 'linear-gradient(90deg,#00e6c8,#60a5fa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              «{project.name}»
            </span>
          </h1>
          <p className="text-white/50 text-base font-medium mb-1">{project.subtitle}</p>
          <div className="flex items-center gap-1.5 text-white/30 text-sm">
            <MapPin size={13} />
            <span>
              {project.location.country}
              {project.decree ? ` · ${project.decree}` : ''}
            </span>
          </div>
        </motion.div>

        {/* Hero KPI strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-8"
        >
          {project.heroKPIs.map((kpi, i) => (
            <KPICard
              key={kpi.label}
              label={kpi.label}
              value={kpi.value}
              unit={kpi.unit}
              color={kpi.color}
              icon={kpi.icon}
              delay={0.12 + i * 0.04}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
