/**
 * GenesisPage — Genesis Engine
 * Autonomous agentic pipeline: raw input → structured PROJECT
 * (research → concept → tech-selection → ТЭО → studio → assembly)
 * Route: /genesis  — open to all; detail/download/publish gated by AuthGate/PremiumOverlay.
 */

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import {
  Sparkles, Building2, Droplets, Rocket, Lightbulb, Cpu, Play, RotateCcw,
  CheckCircle2, Loader2, AlertTriangle, Download, Send, Monitor, FileText,
  ListChecks, TrendingUp, Wrench,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { AuthGate } from '@/components/AuthGate';
import { PremiumOverlay } from '@/components/PremiumOverlay';
import { useGenesis } from '@/hooks/useGenesis';
import { GENESIS_STAGES, GENESIS_INPUT_TYPES } from '@/lib/genesisTypes';
import type { GenesisInputType } from '@/lib/genesisTypes';
import { supabase } from '@/lib/supabase';

const INPUT_ICONS: Record<string, typeof Building2> = {
  Building2, Droplets, Rocket, Lightbulb,
};

const STAGE_ICONS: Record<string, typeof Cpu> = {
  research: FileText,
  concept: Lightbulb,
  'tech-selection': Wrench,
  teo: TrendingUp,
  studio: Monitor,
  assembly: ListChecks,
};

const ACCENT = '#00e6c8';
const ACCENT2 = '#00d4ff';

export default function GenesisPage() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { isAuthenticated, profile } = useAuth();
  const genesis = useGenesis();

  const [inputType, setInputType] = useState<GenesisInputType>('object');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tab, setTab] = useState<'result' | 'studio'>('result');
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);

  // Full access = authenticated (subscriber) or admin. Free/anon users see preview only.
  const isAdmin = profile?.role === 'admin';
  const fullAccess = isAuthenticated || isAdmin;

  const canRun = title.trim().length > 1 && description.trim().length > 4 && !genesis.loading;

  const project = genesis.result?.project ?? null;

  const handleRun = () => {
    if (!canRun) return;
    setPublished(false);
    setTab('result');
    genesis.run({ input_type: inputType, title: title.trim(), description: description.trim() });
  };

  const handleDownload = () => {
    if (!genesis.result) return;
    const blob = new Blob([JSON.stringify(genesis.result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `genesis-${(project?.title || 'project').slice(0, 40).replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePublish = async () => {
    if (!genesis.result?.run_id || !project) return;
    setPublishing(true);
    try {
      const hubId = `genesis-${genesis.result.run_id.slice(0, 8)}`;
      // Mark the generated project as published + attach a hub id.
      await supabase
        .from('genesis_projects')
        .update({ published: true, hub_id: hubId })
        .eq('run_id', genesis.result.run_id);
      setPublished(true);
      // Redirect to the Project Hub (published projects surface there).
      setTimeout(() => setLocation('/hub'), 900);
    } catch {
      /* surface handled below via published flag staying false */
    } finally {
      setPublishing(false);
    }
  };

  const runningOrDone = genesis.loading || !!genesis.result;

  const teoEntries = useMemo(() => {
    const teo = project?.teo || {};
    const fmt = (n: any) =>
      typeof n === 'number' ? new Intl.NumberFormat('ru-RU').format(n) : String(n ?? '—');
    return [
      { key: 'genesis.teo_capex', value: teo.capex_usd != null ? `$${fmt(teo.capex_usd)}` : '—' },
      { key: 'genesis.teo_opex', value: teo.opex_annual_usd != null ? `$${fmt(teo.opex_annual_usd)}/год` : '—' },
      { key: 'genesis.teo_payback', value: teo.payback_years != null ? `${teo.payback_years} лет` : '—' },
      { key: 'genesis.teo_irr', value: teo.irr_percent != null ? `${teo.irr_percent}%` : '—' },
    ];
  }, [project]);

  return (
    <div className="min-h-screen pb-24" style={{ background: '#050d1a' }}>
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-white/5">
        <div
          className="absolute inset-0 opacity-40"
          style={{ background: `radial-gradient(60% 120% at 50% 0%, ${ACCENT}22, transparent 70%)` }}
        />
        <div className="relative max-w-5xl mx-auto px-5 pt-12 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-3"
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${ACCENT}33, ${ACCENT2}18)`, border: `1px solid ${ACCENT}40` }}
            >
              <Sparkles className="w-6 h-6" style={{ color: ACCENT }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{t('genesis.title')}</h1>
              <p className="text-sm text-white/40">{t('genesis.subtitle')}</p>
            </div>
          </motion.div>
          <p className="text-sm text-white/50 max-w-2xl leading-relaxed">{t('genesis.intro')}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 mt-8 space-y-8">
        {/* Input form */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,230,200,0.15)' }}
        >
          <label className="block text-xs font-semibold text-white/50 mb-2 uppercase tracking-wide">
            {t('genesis.input_type_label')}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
            {GENESIS_INPUT_TYPES.map((it) => {
              const Icon = INPUT_ICONS[it.icon] || Building2;
              const active = inputType === it.id;
              return (
                <button
                  key={it.id}
                  onClick={() => setInputType(it.id)}
                  className="flex flex-col items-center gap-2 py-3 rounded-xl transition"
                  style={{
                    background: active ? `${ACCENT}18` : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${active ? ACCENT + '55' : 'rgba(255,255,255,0.08)'}`,
                  }}
                >
                  <Icon className="w-5 h-5" style={{ color: active ? ACCENT : 'rgba(255,255,255,0.5)' }} />
                  <span className="text-xs font-medium" style={{ color: active ? '#fff' : 'rgba(255,255,255,0.55)' }}>
                    {t(it.labelKey)}
                  </span>
                </button>
              );
            })}
          </div>

          <label className="block text-xs font-semibold text-white/50 mb-2 uppercase tracking-wide">
            {t('genesis.title_label')}
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('genesis.title_placeholder')}
            className="w-full mb-4 px-4 py-3 rounded-xl bg-black/30 text-white text-sm outline-none border border-white/10 focus:border-cyan-400/50 transition"
          />

          <label className="block text-xs font-semibold text-white/50 mb-2 uppercase tracking-wide">
            {t('genesis.desc_label')}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('genesis.desc_placeholder')}
            rows={4}
            className="w-full mb-4 px-4 py-3 rounded-xl bg-black/30 text-white text-sm outline-none border border-white/10 focus:border-cyan-400/50 transition resize-none"
          />

          <div className="flex items-center gap-3">
            <button
              onClick={handleRun}
              disabled={!canRun}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition disabled:opacity-40"
              style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`, color: '#000' }}
            >
              {genesis.loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {genesis.loading ? t('genesis.running') : t('genesis.launch')}
            </button>
            {runningOrDone && !genesis.loading && (
              <button
                onClick={genesis.reset}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-white/70 transition hover:bg-white/5"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <RotateCcw className="w-4 h-4" />
                {t('genesis.reset')}
              </button>
            )}
          </div>
        </motion.section>

        {/* NO_KEYS / error banner */}
        {genesis.error && (
          <div
            className="rounded-xl p-4 flex items-start gap-3"
            style={{ background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.25)' }}
          >
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-rose-200">
                {genesis.errorCode === 'NO_KEYS' ? t('genesis.err_no_keys') : t('genesis.err_generic')}
              </div>
              <div className="text-xs text-white/50 mt-1">{genesis.error}</div>
            </div>
          </div>
        )}

        {/* Agent pipeline feed */}
        {runningOrDone && (
          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-3">
              {t('genesis.pipeline')}
            </h2>
            {GENESIS_STAGES.map((s, i) => {
              const st = genesis.stages[i];
              const Icon = STAGE_ICONS[s.id] || Cpu;
              const status = st?.status ?? 'pending';
              const color =
                status === 'done' ? '#4ade80' : status === 'error' ? '#fb7185' : status === 'running' ? ACCENT : 'rgba(255,255,255,0.25)';
              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: `1px solid ${status === 'running' ? ACCENT + '40' : 'rgba(255,255,255,0.07)'}`,
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${color}18`, border: `1px solid ${color}30` }}
                  >
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{t(s.labelKey)}</div>
                    <div className="text-xs text-white/35">
                      {s.model === 'pro' ? 'gemini-2.5-pro' : 'gemini-2.5-flash'}
                      {st?.durationMs ? ` · ${(st.durationMs / 1000).toFixed(1)}s` : ''}
                      {st?.error ? ` · ${st.error.slice(0, 60)}` : ''}
                    </div>
                  </div>
                  <div className="shrink-0">
                    {status === 'running' && <Loader2 className="w-4 h-4 animate-spin" style={{ color: ACCENT }} />}
                    {status === 'done' && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                    {status === 'error' && <AlertTriangle className="w-4 h-4 text-rose-400" />}
                  </div>
                </motion.div>
              );
            })}
          </motion.section>
        )}

        {/* Result */}
        {project && !genesis.loading && (
          <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Tabs */}
            <div className="flex items-center gap-2">
              {(['result', 'studio'] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => setTab(k)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition"
                  style={{
                    background: tab === k ? `${ACCENT}18` : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${tab === k ? ACCENT + '50' : 'rgba(255,255,255,0.08)'}`,
                    color: tab === k ? '#fff' : 'rgba(255,255,255,0.55)',
                  }}
                >
                  {k === 'studio' ? <Monitor className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                  {t(k === 'studio' ? 'genesis.tab_studio' : 'genesis.tab_result')}
                </button>
              ))}
            </div>

            {/* Result tab */}
            {tab === 'result' && (
              <div
                className="rounded-2xl p-5"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,230,200,0.15)' }}
              >
                <h3 className="text-lg font-bold text-white mb-1">{project.title}</h3>
                <p className="text-sm text-white/60 mb-5">{project.summary}</p>

                {/* ТЭО cards — always visible (headline metrics) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
                  {teoEntries.map((e) => (
                    <div
                      key={e.key}
                      className="rounded-xl p-3"
                      style={{ background: 'rgba(0,230,200,0.06)', border: '1px solid rgba(0,230,200,0.12)' }}
                    >
                      <div className="text-[10px] uppercase tracking-wide text-white/40 mb-1">{t(e.key)}</div>
                      <div className="text-sm font-bold text-white">{e.value}</div>
                    </div>
                  ))}
                </div>

                {/* Detailed sections — gated */}
                <PremiumOverlay title={t('genesis.gate_detail_title')}>
                  <GenesisDetail result={genesis.result} />
                </PremiumOverlay>

                {/* Actions — gated behind auth */}
                <div className="mt-6">
                  {fullAccess ? (
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition hover:bg-white/5"
                        style={{ border: '1px solid rgba(255,255,255,0.12)' }}
                      >
                        <Download className="w-4 h-4" />
                        {t('genesis.download')}
                      </button>
                      <button
                        onClick={handlePublish}
                        disabled={publishing || published || !genesis.result?.run_id}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition disabled:opacity-50"
                        style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`, color: '#000' }}
                      >
                        {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        {published ? t('genesis.published') : t('genesis.publish')}
                      </button>
                      {!genesis.result?.run_id && (
                        <span className="text-xs text-white/35">{t('genesis.publish_needs_db')}</span>
                      )}
                    </div>
                  ) : (
                    <AuthGate message={t('genesis.gate_actions')} />
                  )}
                </div>
              </div>
            )}

            {/* Studio tab */}
            {tab === 'studio' && (
              <div
                className="rounded-2xl overflow-hidden"
                style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(0,230,200,0.15)' }}
              >
                {fullAccess ? (
                  project.studio_html ? (
                    <iframe
                      title="Genesis Studio"
                      sandbox="allow-scripts"
                      className="w-full"
                      style={{ height: 560, border: 'none', background: '#050d1a' }}
                      srcDoc={project.studio_html}
                    />
                  ) : (
                    <div className="p-10 text-center text-sm text-white/40">{t('genesis.studio_empty')}</div>
                  )
                ) : (
                  <PremiumOverlay title={t('genesis.gate_studio_title')}>
                    <div className="p-10 text-center text-sm text-white/40 h-72 flex items-center justify-center">
                      {t('genesis.studio_locked')}
                    </div>
                  </PremiumOverlay>
                )}
              </div>
            )}
          </motion.section>
        )}
      </div>
    </div>
  );
}

// ── Detailed research/concept/tech sections (shown blurred to free users) ──

function GenesisDetail({ result }: { result: import('@/lib/genesisTypes').GenesisResponse | null }) {
  const { t } = useTranslation();
  if (!result) return null;
  const byStage = new Map(result.stages.map((s) => [s.stage, s.data]));
  const research = byStage.get('research') || {};
  const concept = byStage.get('concept') || {};
  const tech = byStage.get('tech-selection') || {};
  const teo = byStage.get('teo') || {};

  const List = ({ items }: { items?: any[] }) =>
    Array.isArray(items) && items.length ? (
      <ul className="space-y-1">
        {items.map((it, i) => (
          <li key={i} className="text-xs text-white/60 flex gap-2">
            <span style={{ color: ACCENT }}>•</span>
            <span>{typeof it === 'string' ? it : it?.name || JSON.stringify(it)}</span>
          </li>
        ))}
      </ul>
    ) : (
      <span className="text-xs text-white/30">—</span>
    );

  const Block = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="text-xs font-semibold text-white/70 mb-2 uppercase tracking-wide">{title}</div>
      {children}
    </div>
  );

  return (
    <div className="grid sm:grid-cols-2 gap-3">
      <Block title={t('genesis.d_context')}>
        <p className="text-xs text-white/60 leading-relaxed">{research.context || '—'}</p>
      </Block>
      <Block title={t('genesis.d_challenges')}>
        <List items={research.challenges} />
      </Block>
      <Block title={t('genesis.d_vision')}>
        <p className="text-xs text-white/60 leading-relaxed">{concept.vision || '—'}</p>
        <div className="mt-2"><List items={concept.goals} /></div>
      </Block>
      <Block title={t('genesis.d_tech')}>
        <List items={tech.technologies} />
        <div className="mt-2"><List items={tech.equipment} /></div>
      </Block>
      <Block title={t('genesis.d_revenue')}>
        <List items={teo.revenue_streams} />
      </Block>
      <Block title={t('genesis.d_risks')}>
        <List items={(teo.risks || []).map((r: any) => (typeof r === 'string' ? r : r?.risk))} />
      </Block>
    </div>
  );
}
