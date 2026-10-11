// ═══════════════════════════════════════════════════════════════
//  AIAnalysisPanel — AI innovation analysis modal for water objects
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Sparkles, Brain, Cpu, Sun, Droplets,
  Link, Leaf, Settings, Shield, TrendingUp,
  DollarSign, Clock, ChevronDown, ChevronUp,
  Loader2, CheckCircle, AlertCircle,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Innovation {
  id: string;
  title: string;
  description: string;
  category: 'iot' | 'ai' | 'energy' | 'automation' | 'blockchain' | 'environmental' | 'safety';
  roi_improvement_pct: number;
  implementation_cost_usd: number;
  timeline_months: number;
  priority: 'high' | 'medium' | 'low';
  tags: string[];
}

interface AIAnalysisResult {
  object_id: string;
  object_name: string;
  analysis_timestamp: string;
  summary: string;
  innovations: Innovation[];
  total_estimated_investment_usd: number;
  expected_efficiency_gain_pct: number;
  expected_roi_improvement_pct: number;
  implementation_roadmap: string;
}

interface AIAnalysisPanelProps {
  objectId: string;
  objectData?: {
    name_ru?: string;
    type?: string;
    status?: string;
    country?: string;
    region?: string;
    wear_pct?: number;
    actual_capacity_m3_per_day?: number;
  };
  onClose: () => void;
}

// ─── Category config ──────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<Innovation['category'], {
  label: string;
  color: string;
  bg: string;
  icon: React.ElementType;
}> = {
  iot: { label: 'IoT', color: '#00e6c8', bg: 'rgba(0,230,200,0.1)', icon: Cpu },
  ai: { label: 'AI / ML', color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', icon: Brain },
  energy: { label: 'Энергетика', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', icon: Sun },
  automation: { label: 'Автоматизация', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', icon: Settings },
  blockchain: { label: 'Блокчейн', color: '#f472b6', bg: 'rgba(244,114,182,0.1)', icon: Link },
  environmental: { label: 'Экология', color: '#4ade80', bg: 'rgba(74,222,128,0.1)', icon: Leaf },
  safety: { label: 'Безопасность', color: '#fb923c', bg: 'rgba(251,146,60,0.1)', icon: Shield },
};

const PRIORITY_CONFIG = {
  high: { color: '#ff4d6d', label: 'Высокий', bg: 'rgba(255,77,109,0.1)' },
  medium: { color: '#fbbf24', label: 'Средний', bg: 'rgba(251,191,36,0.1)' },
  low: { color: '#4ade80', label: 'Низкий', bg: 'rgba(74,222,128,0.1)' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtUsd(n: number): string {
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${Math.round(n / 1e3)}K`;
  return `$${n}`;
}

// ─── Innovation Card ──────────────────────────────────────────────────────────

function InnovationCard({ innovation, index }: { innovation: Innovation; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const cat = CATEGORY_CONFIG[innovation.category] ?? CATEGORY_CONFIG.automation;
  const pri = PRIORITY_CONFIG[innovation.priority];
  const CatIcon = cat.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.07 }}
      className="rounded-xl overflow-hidden"
      style={{
        background: 'rgba(0,8,24,0.8)',
        border: `1px solid ${cat.color}20`,
      }}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(x => !x)}
        className="w-full text-left p-4 flex items-start gap-3 group"
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: cat.bg, border: `1px solid ${cat.color}30` }}
        >
          <CatIcon size={15} style={{ color: cat.color }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: cat.bg, color: cat.color, border: `1px solid ${cat.color}25` }}
            >
              {cat.label}
            </span>
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: pri.bg, color: pri.color }}
            >
              {pri.label} приоритет
            </span>
          </div>
          <h4 className="text-white font-bold text-sm leading-snug group-hover:text-cyan-300 transition-colors">
            {innovation.title}
          </h4>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
          <span className="text-xs font-black tabular-nums" style={{ color: '#4ade80' }}>
            +{innovation.roi_improvement_pct}% ROI
          </span>
          {expanded ? (
            <ChevronUp size={14} className="text-white/30" />
          ) : (
            <ChevronDown size={14} className="text-white/30" />
          )}
        </div>
      </button>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              <div
                className="h-px"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              />

              <p className="text-white/60 text-sm leading-relaxed">{innovation.description}</p>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg p-2.5 text-center" style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.12)' }}>
                  <DollarSign size={12} className="mx-auto mb-1" style={{ color: '#fbbf24' }} />
                  <div className="text-xs text-white/40 mb-0.5">Стоимость</div>
                  <div className="text-xs font-black tabular-nums" style={{ color: '#fbbf24' }}>
                    {fmtUsd(innovation.implementation_cost_usd)}
                  </div>
                </div>
                <div className="rounded-lg p-2.5 text-center" style={{ background: 'rgba(96,165,250,0.07)', border: '1px solid rgba(96,165,250,0.12)' }}>
                  <Clock size={12} className="mx-auto mb-1" style={{ color: '#60a5fa' }} />
                  <div className="text-xs text-white/40 mb-0.5">Срок</div>
                  <div className="text-xs font-black tabular-nums" style={{ color: '#60a5fa' }}>
                    {innovation.timeline_months} мес.
                  </div>
                </div>
                <div className="rounded-lg p-2.5 text-center" style={{ background: 'rgba(74,222,128,0.07)', border: '1px solid rgba(74,222,128,0.12)' }}>
                  <TrendingUp size={12} className="mx-auto mb-1" style={{ color: '#4ade80' }} />
                  <div className="text-xs text-white/40 mb-0.5">ROI+</div>
                  <div className="text-xs font-black tabular-nums" style={{ color: '#4ade80' }}>
                    +{innovation.roi_improvement_pct}%
                  </div>
                </div>
              </div>

              {/* Tags */}
              {innovation.tags && innovation.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {innovation.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-xs px-1.5 py-0.5 rounded text-white/30"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Loading Animation ────────────────────────────────────────────────────────

function LoadingState() {
  const steps = [
    'Анализ технических характеристик...',
    'Оценка текущего уровня автоматизации...',
    'Подбор инновационных решений...',
    'Расчёт ROI и сроков окупаемости...',
    'Формирование дорожной карты...',
  ];
  const [step, setStep] = useState(0);

  useState(() => {
    const interval = setInterval(() => {
      setStep(s => (s + 1) % steps.length);
    }, 1200);
    return () => clearInterval(interval);
  });

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      {/* Animated brain icon */}
      <div className="relative mb-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="w-20 h-20 rounded-full border-2 border-transparent"
          style={{
            borderTopColor: '#a78bfa',
            borderRightColor: '#00e6c8',
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Brain size={28} style={{ color: '#a78bfa' }} />
          </motion.div>
        </div>
        {/* Orbiting dots */}
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: ['#00e6c8', '#a78bfa', '#60a5fa'][i],
              top: '50%',
              left: '50%',
            }}
            animate={{ rotate: 360 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
              delay: i * 0.67,
            }}
          />
        ))}
      </div>

      <div className="text-center">
        <h3 className="text-white font-bold text-lg mb-2">AI анализирует объект</h3>
        <AnimatePresence mode="wait">
          <motion.p
            key={step}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="text-white/50 text-sm"
          >
            {steps[step]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Progress bar */}
      <div className="w-48 h-1 rounded-full mt-6" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #00e6c8, #a78bfa)' }}
          animate={{ width: ['0%', '100%'] }}
          transition={{ duration: 6, ease: 'easeInOut' }}
        />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AIAnalysisPanel({ objectId, objectData, onClose }: AIAnalysisPanelProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<AIAnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAnalyze = async () => {
    setStatus('loading');
    setErrorMsg('');
    try {
      const response = await fetch(`/api/ai/analyze-object/${objectId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(objectData ?? {}),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json() as AIAnalysisResult;
      setResult(data);
      setStatus('success');
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Ошибка запроса');
      setStatus('error');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto"
        style={{ background: 'rgba(0,4,12,0.92)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 30 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-2xl my-8 rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(0,6,20,0.98)',
            border: '1px solid rgba(167,139,250,0.25)',
            boxShadow: '0 0 80px rgba(167,139,250,0.12), 0 30px 80px rgba(0,0,0,0.7)',
          }}
        >
          {/* Header */}
          <div
            className="p-5 flex items-center justify-between"
            style={{
              background: 'linear-gradient(135deg, rgba(167,139,250,0.08) 0%, rgba(0,230,200,0.06) 100%)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(167,139,250,0.2), rgba(0,230,200,0.15))',
                  border: '1px solid rgba(167,139,250,0.3)',
                }}
              >
                <Sparkles size={18} style={{ color: '#a78bfa' }} />
              </div>
              <div>
                <h3 className="text-white font-black text-lg">AI-анализ инноваций</h3>
                <p className="text-white/40 text-xs">
                  {objectData?.name_ru ?? `Объект ${objectId}`}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-white/10"
              style={{ border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <X size={14} className="text-white/50" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5">
            {/* Idle state */}
            {status === 'idle' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 px-4"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{
                    background: 'linear-gradient(135deg, rgba(167,139,250,0.15), rgba(0,230,200,0.1))',
                    border: '1px solid rgba(167,139,250,0.25)',
                  }}
                >
                  <Brain size={28} style={{ color: '#a78bfa' }} />
                </div>
                <h4 className="text-white font-bold text-lg mb-2">
                  Какие инновации можно внедрить сегодня?
                </h4>
                <p className="text-white/50 text-sm mb-6 max-w-md mx-auto leading-relaxed">
                  AI проанализирует характеристики объекта и предложит 5–7 конкретных технологий
                  с расчётом ROI, стоимостью внедрения и сроками реализации.
                </p>

                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  {Object.values(CATEGORY_CONFIG).map(cfg => {
                    const Icon = cfg.icon;
                    return (
                      <span
                        key={cfg.label}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs"
                        style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}25` }}
                      >
                        <Icon size={10} />
                        {cfg.label}
                      </span>
                    );
                  })}
                </div>

                <button
                  onClick={handleAnalyze}
                  className="flex items-center gap-2 mx-auto px-6 py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, #a78bfa, #00e6c8)',
                    color: '#000',
                    boxShadow: '0 4px 24px rgba(167,139,250,0.3)',
                  }}
                >
                  <Sparkles size={16} />
                  Запустить AI-анализ
                </button>
              </motion.div>
            )}

            {/* Loading state */}
            {status === 'loading' && <LoadingState />}

            {/* Error state */}
            {status === 'error' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-10"
              >
                <AlertCircle size={36} className="mx-auto mb-3" style={{ color: '#ff4d6d' }} />
                <p className="text-white/60 text-sm mb-1">Ошибка при анализе</p>
                <p className="text-white/30 text-xs mb-5">{errorMsg}</p>
                <button
                  onClick={handleAnalyze}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold"
                  style={{
                    background: 'rgba(167,139,250,0.15)',
                    color: '#a78bfa',
                    border: '1px solid rgba(167,139,250,0.25)',
                  }}
                >
                  Попробовать снова
                </button>
              </motion.div>
            )}

            {/* Success state */}
            {status === 'success' && result && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="space-y-5"
              >
                {/* Summary */}
                <div
                  className="rounded-xl p-4"
                  style={{
                    background: 'linear-gradient(135deg, rgba(167,139,250,0.06), rgba(0,230,200,0.04))',
                    border: '1px solid rgba(167,139,250,0.15)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle size={14} style={{ color: '#4ade80' }} />
                    <span className="text-xs font-semibold" style={{ color: '#4ade80' }}>Анализ завершён</span>
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed">{result.summary}</p>
                </div>

                {/* Top KPIs */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(74,222,128,0.07)', border: '1px solid rgba(74,222,128,0.15)' }}>
                    <TrendingUp size={14} className="mx-auto mb-1.5" style={{ color: '#4ade80' }} />
                    <div className="text-xs text-white/40 mb-0.5">Эффективность+</div>
                    <div className="font-black tabular-nums" style={{ color: '#4ade80' }}>
                      +{result.expected_efficiency_gain_pct}%
                    </div>
                  </div>
                  <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.15)' }}>
                    <DollarSign size={14} className="mx-auto mb-1.5" style={{ color: '#fbbf24' }} />
                    <div className="text-xs text-white/40 mb-0.5">Инвестиции</div>
                    <div className="font-black tabular-nums text-sm" style={{ color: '#fbbf24' }}>
                      {fmtUsd(result.total_estimated_investment_usd)}
                    </div>
                  </div>
                  <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(167,139,250,0.07)', border: '1px solid rgba(167,139,250,0.15)' }}>
                    <Sparkles size={14} className="mx-auto mb-1.5" style={{ color: '#a78bfa' }} />
                    <div className="text-xs text-white/40 mb-0.5">ROI+</div>
                    <div className="font-black tabular-nums" style={{ color: '#a78bfa' }}>
                      +{result.expected_roi_improvement_pct}%
                    </div>
                  </div>
                </div>

                {/* Innovations list */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Loader2 size={13} style={{ color: '#a78bfa' }} />
                    <span className="text-white/50 text-xs font-semibold uppercase tracking-widest">
                      Рекомендованные технологии ({result.innovations.length})
                    </span>
                  </div>
                  <div className="space-y-2">
                    {result.innovations.map((inn, idx) => (
                      <InnovationCard key={inn.id} innovation={inn} index={idx} />
                    ))}
                  </div>
                </div>

                {/* Roadmap */}
                {result.implementation_roadmap && (
                  <div
                    className="rounded-xl p-4"
                    style={{
                      background: 'rgba(96,165,250,0.06)',
                      border: '1px solid rgba(96,165,250,0.15)',
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Clock size={13} style={{ color: '#60a5fa' }} />
                      <span className="text-xs font-semibold uppercase tracking-widest text-white/40">
                        Дорожная карта
                      </span>
                    </div>
                    <p className="text-white/60 text-sm leading-relaxed">{result.implementation_roadmap}</p>
                  </div>
                )}

                {/* Re-analyze button */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-white/20 text-xs">
                    Анализ выполнен: {new Date(result.analysis_timestamp).toLocaleString('ru-RU')}
                  </span>
                  <button
                    onClick={handleAnalyze}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
                    style={{
                      background: 'rgba(167,139,250,0.12)',
                      color: '#a78bfa',
                      border: '1px solid rgba(167,139,250,0.2)',
                    }}
                  >
                    <Sparkles size={11} />
                    Повторить анализ
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
