// ═══════════════════════════════════════════════════════════════
//  WaterFlowDiagram — 9-step water treatment process
// ═══════════════════════════════════════════════════════════════
import React from 'react';
import { motion } from 'framer-motion';
import {
  Waves, Filter, FlaskConical, Layers, Zap, Shield,
  CheckCircle, Database, Droplets, Wind, Sun, GitBranch,
  SlidersHorizontal, AlertTriangle, Activity,
} from 'lucide-react';
import { ProjectData, WaterProcessStep } from '@/data/projects/types';

interface Props {
  project: ProjectData;
}

// ─── Icon mapping ─────────────────────────────────────────────
const ICON_MAP: Record<string, React.ElementType> = {
  Waves,
  Filter,
  FlaskConical,
  Layers,
  Zap,
  Shield,
  CheckCircle,
  Database,
  Droplets,
  Wind,
  Sun,
  GitBranch,
  SlidersHorizontal,
  AlertTriangle,
  Activity,
};

function getIcon(name: string): React.ElementType {
  return ICON_MAP[name] ?? Droplets;
}

// ─── Step card ───────────────────────────────────────────────
function StepCard({ step, index }: { step: WaterProcessStep; index: number }) {
  const Icon = getIcon(step.icon);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 * index, duration: 0.4 }}
      className="relative flex-shrink-0"
      style={{ width: 148 }}
    >
      {/* Top color accent */}
      <div
        className="w-full h-1.5 rounded-t-2xl"
        style={{ background: `linear-gradient(90deg, ${step.color}, ${step.color}55)` }}
      />

      {/* Card body */}
      <div
        className="rounded-b-2xl p-3.5"
        style={{
          background: 'rgba(0,6,20,0.85)',
          border: `1px solid ${step.color}25`,
          borderTop: 'none',
          minHeight: 140,
        }}
      >
        {/* Step number */}
        <div
          className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black mb-2"
          style={{ background: `${step.color}20`, color: step.color, border: `1px solid ${step.color}40` }}
        >
          {step.step}
        </div>

        {/* Icon */}
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center mb-2"
          style={{
            background: `${step.color}15`,
            border: `1px solid ${step.color}30`,
            boxShadow: `0 0 12px ${step.color}18`,
          }}
        >
          <Icon size={18} style={{ color: step.color }} />
        </div>

        {/* Name */}
        <div className="font-bold text-sm leading-tight mb-1" style={{ color: step.color }}>
          {step.name}
        </div>

        {/* Description */}
        <p className="text-white/45 text-xs leading-relaxed">{step.desc}</p>
      </div>
    </motion.div>
  );
}

// ─── Arrow connector ─────────────────────────────────────────
function FlowArrow({ color1, color2 }: { color1: string; color2: string }) {
  return (
    <div
      className="flex-shrink-0 flex items-center justify-center self-center"
      style={{ width: 28, paddingTop: 24 }}
      aria-hidden
    >
      <svg width="28" height="20" viewBox="0 0 28 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={`arrowGrad-${color1.replace('#', '')}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={color1} stopOpacity="0.6" />
            <stop offset="100%" stopColor={color2} stopOpacity="0.6" />
          </linearGradient>
        </defs>
        <line
          x1="2"
          y1="10"
          x2="20"
          y2="10"
          stroke={`url(#arrowGrad-${color1.replace('#', '')})`}
          strokeWidth="1.5"
          strokeDasharray="3 2"
        />
        <polygon
          points="20,6 28,10 20,14"
          fill={color2}
          opacity="0.65"
        />
      </svg>
    </div>
  );
}

export const WaterFlowDiagram: React.FC<Props> = ({ project }) => {
  const steps = project.waterProcess;

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: 'rgba(0,6,20,0.8)', border: '1px solid rgba(0,230,200,0.1)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(0,230,200,0.12)', border: '1px solid rgba(0,230,200,0.25)' }}
        >
          <Waves size={16} style={{ color: '#00e6c8' }} />
        </div>
        <div>
          <h2 className="text-white font-bold text-base leading-none">Технологическая цепочка водоочистки</h2>
          <p className="text-white/35 text-xs mt-0.5">{steps.length} этапов — от водозабора до абонента</p>
        </div>
      </div>

      {/* Desktop: horizontal scroll */}
      <div className="hidden sm:block overflow-x-auto pb-3" style={{ scrollbarWidth: 'thin' }}>
        <div className="flex items-stretch gap-0" style={{ minWidth: steps.length * 148 + (steps.length - 1) * 28 }}>
          {steps.map((step, i) => (
            <React.Fragment key={step.step}>
              <StepCard step={step} index={i} />
              {i < steps.length - 1 && (
                <FlowArrow color1={step.color} color2={steps[i + 1].color} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Mobile: vertical stack */}
      <div className="flex flex-col gap-3 sm:hidden">
        {steps.map((step, i) => {
          const Icon = getIcon(step.icon);
          return (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.06 * i }}
              className="flex items-start gap-3"
            >
              {/* Left line + dot */}
              <div className="flex flex-col items-center flex-shrink-0" style={{ width: 24 }}>
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
                  style={{ background: `${step.color}20`, color: step.color, border: `1px solid ${step.color}40` }}
                >
                  {step.step}
                </div>
                {i < steps.length - 1 && (
                  <div
                    className="w-px flex-1 mt-1"
                    style={{ minHeight: 24, background: `linear-gradient(to bottom, ${step.color}50, transparent)` }}
                  />
                )}
              </div>

              {/* Content */}
              <div
                className="flex-1 rounded-xl p-3 flex items-start gap-3"
                style={{ background: `${step.color}08`, border: `1px solid ${step.color}20` }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${step.color}15` }}
                >
                  <Icon size={16} style={{ color: step.color }} />
                </div>
                <div>
                  <div className="font-bold text-sm" style={{ color: step.color }}>{step.name}</div>
                  <p className="text-white/45 text-xs leading-relaxed mt-0.5">{step.desc}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom flow indicator */}
      <div
        className="mt-4 h-1.5 rounded-full overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.04)' }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${steps[0]?.color ?? '#00b4ff'}, ${steps[Math.floor(steps.length / 2)]?.color ?? '#818cf8'}, ${steps[steps.length - 1]?.color ?? '#4ade80'})`,
          }}
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ delay: 0.5, duration: 1.2, ease: 'easeOut' }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-white/25 text-xs">р. Сырдарья</span>
        <span className="text-white/25 text-xs">Абонент</span>
      </div>
    </div>
  );
};

export default WaterFlowDiagram;
