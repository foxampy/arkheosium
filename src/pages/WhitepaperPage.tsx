import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Download,
  FileText,
  Droplets,
  Coins,
  BarChart3,
  Users,
  Map,
  Handshake,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

// ─── Types ───────────────────────────────────────────────────────

interface TocItem {
  id: string;
  labelKey: string;
  icon: React.ReactNode;
}

// ─── Data ────────────────────────────────────────────────────────

const TOC_ITEMS_DEF: TocItem[] = [
  { id: 'intro',       labelKey: 'whitepaper.toc_intro',       icon: <Droplets size={14} /> },
  { id: 'tokenomics',  labelKey: 'whitepaper.toc_tokenomics',  icon: <Coins size={14} /> },
  { id: 'mechanism',   labelKey: 'whitepaper.toc_mechanism',   icon: <BarChart3 size={14} /> },
  { id: 'dao',         labelKey: 'whitepaper.toc_dao',         icon: <Users size={14} /> },
  { id: 'roadmap',     labelKey: 'whitepaper.toc_roadmap',     icon: <Map size={14} /> },
  { id: 'team',        labelKey: 'whitepaper.toc_team',        icon: <Handshake size={14} /> },
];

const ALLOCATION_DEFS = [
  { labelKey: 'whitepaper.alloc_public',    pct: 40, color: '#00e6c8' },
  { labelKey: 'whitepaper.alloc_ecosystem', pct: 20, color: '#0099ff' },
  { labelKey: 'whitepaper.alloc_team',      pct: 20, color: '#7c3aed' },
  { labelKey: 'whitepaper.alloc_reserve',   pct: 10, color: '#f59e0b' },
  { labelKey: 'whitepaper.alloc_early',     pct: 10, color: '#ef4444' },
];

const STAGES_DEFS = [
  { stage: 'Stage 1', price: '$0.20', amount: '100M VOD', statusKey: 'whitepaper.stage_active', active: true  },
  { stage: 'Stage 2', price: '$0.40', amount: '100M VOD', statusKey: 'whitepaper.stage_soon',   active: false },
  { stage: 'Stage 3', price: '$0.80', amount: '100M VOD', statusKey: 'whitepaper.stage_soon',   active: false },
  { stage: 'Stage 4', price: '$1.20', amount: '100M VOD', statusKey: 'whitepaper.stage_tba',    active: false },
];

const ROADMAP = [
  { period: 'Q2 2026', text: 'Запуск платформы + пресейл Stage 1',                  done: true  },
  { period: 'Q3 2026', text: 'Конференция ЦА + маркетинговая кампания',             done: false },
  { period: 'Q4 2026', text: 'Stage 2 + интеграция с партнёрами (EBRD, ADB)',       done: false },
  { period: '2027',    text: 'DEX листинг + запуск DAO',                            done: false },
  { period: '2028',    text: 'Глобальная экспансия',                                done: false },
];

// ─── Pie SVG ─────────────────────────────────────────────────────

function AllocationPie({ allocation }: { allocation: { label: string; pct: number; color: string }[] }) {
  const cx = 90, cy = 90, r = 75;
  let cumulative = 0;

  function slice(pct: number, color: string, idx: number) {
    const start = (cumulative / 100) * 2 * Math.PI - Math.PI / 2;
    cumulative += pct;
    const end = (cumulative / 100) * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);
    const large = pct > 50 ? 1 : 0;
    return (
      <path
        key={idx}
        d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`}
        fill={color}
        opacity={0.9}
        stroke="#000818"
        strokeWidth={2}
      />
    );
  }

  cumulative = 0;
  return (
    <svg viewBox="0 0 180 180" width={180} height={180}>
      {allocation.map((a, i) => slice(a.pct, a.color, i))}
      <circle cx={cx} cy={cy} r={36} fill="#000d24" />
      <text x={cx} y={cy - 5} textAnchor="middle" fill="#00e6c8" fontSize={11} fontFamily="monospace">1B</text>
      <text x={cx} y={cy + 9} textAnchor="middle" fill="#8eaabf" fontSize={9}>VOD</text>
    </svg>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-14 scroll-mt-24">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#00e6c8]/30" />
        <h2 className="text-xl font-bold text-white tracking-wide">{title}</h2>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#00e6c8]/30" />
      </div>
      {children}
    </section>
  );
}

// ─── Main component ───────────────────────────────────────────────

export default function WhitepaperPage() {
  const [, navigate] = useLocation();
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState('intro');
  const articleRef = useRef<HTMLDivElement>(null);

  const allocation = ALLOCATION_DEFS.map((a) => ({ ...a, label: t(a.labelKey) }));
  const stages = STAGES_DEFS.map((s) => ({ ...s, status: t(s.statusKey) }));

  // Intersection observer for TOC highlight
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActiveSection(e.target.id);
        }
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );
    TOC_ITEMS_DEF.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className="min-h-screen text-gray-200">
      {/* ── Top bar ── */}
      <div className="sticky top-0 z-30 bg-[#000818]/90 backdrop-blur border-b border-white/5 px-4 py-3 flex items-center gap-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-[#00e6c8] hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          {t('whitepaper.back')}
        </button>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <FileText size={14} />
          VOD Whitepaper v7
        </div>
        <div className="ml-auto">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border border-[#00e6c8]/30 text-[#00e6c8] hover:bg-[#00e6c8]/10 transition-colors"
          >
            <Download size={13} />
            {t('whitepaper.download_pdf')}
          </button>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-4 py-10 flex gap-8">
        {/* ── Article ── */}
        <motion.article
          ref={articleRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 min-w-0 max-w-[900px]"
        >
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 text-xs text-[#00e6c8] bg-[#00e6c8]/10 border border-[#00e6c8]/20 rounded-full px-4 py-1.5 mb-5">
              <Droplets size={12} />
              {t('whitepaper.official_doc')}
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3 leading-tight">
              VOD Token — Whitepaper v7
            </h1>
            <p className="text-lg text-[#00e6c8] font-medium mb-4">
              {t('whitepaper.tagline')}
            </p>
            <p className="text-sm text-gray-500">
              {t('whitepaper.version')}
            </p>
          </div>

          {/* ── Section 1: Введение ── */}
          <Section id="intro" title={t('whitepaper.section_intro')}>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                <span className="text-[#00e6c8] font-semibold">VOD (Voda/Water)</span> — первый
                цифровой актив, привязанный к реальным водным ресурсам Центральной Азии. В отличие от
                спекулятивных криптовалют, каждый токен обеспечен конкретными правами на использование
                воды, верифицированными государственными органами и международными организациями.
              </p>
              <div className="bg-[#000d24] border border-[#00e6c8]/20 rounded-xl p-5 font-mono text-sm">
                <div className="text-[#00e6c8] text-2xl font-bold mb-1">1 VOD = 4 600 м³</div>
                <div className="text-gray-400">права на использование воды</div>
              </div>
              <p>
                Центральная Азия столкнулась с острейшим водным кризисом. По прогнозам ООН, к 2030 году
                регион будет испытывать дефицит воды в объёме <span className="text-[#00e6c8] font-semibold">7 млрд м³</span> ежегодно.
                Ледники Тянь-Шаня и Памира, питающие крупнейшие реки региона, сокращаются в{' '}
                <span className="text-[#00e6c8] font-semibold">4 раза</span> быстрее, чем предсказывали
                модели прошлого десятилетия.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { val: '7 млрд м³',  label: 'дефицит к 2030' },
                  { val: '×4',          label: 'скорость таяния ледников' },
                  { val: '60M+',        label: 'человек под угрозой' },
                ].map((s) => (
                  <div key={s.val} className="bg-[#000d24] border border-white/10 rounded-xl p-4 text-center">
                    <div className="text-[#00e6c8] font-mono text-2xl font-bold">{s.val}</div>
                    <div className="text-xs text-gray-500 mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* ── Section 2: Токеномика ── */}
          <Section id="tokenomics" title={t('whitepaper.section_tokenomics')}>
            <div className="space-y-6">
              <div className="bg-[#000d24] border border-white/10 rounded-xl p-5 font-mono text-center">
                <div className="text-xs text-gray-500 mb-1">Total Supply</div>
                <div className="text-[#00e6c8] text-3xl font-bold tracking-wider">1 000 000 000 VOD</div>
              </div>

              {/* Pie + Legend */}
              <div className="flex flex-col sm:flex-row items-center gap-6 bg-[#000d24] border border-white/10 rounded-xl p-6">
                <div className="flex-shrink-0">
                  <AllocationPie allocation={allocation} />
                </div>
                <div className="flex-1 space-y-2.5">
                  {allocation.map((a) => (
                    <div key={a.labelKey} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: a.color }} />
                      <span className="text-sm text-gray-300 flex-1">{a.label}</span>
                      <span className="font-mono text-sm font-bold" style={{ color: a.color }}>{a.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Presale table */}
              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#000d24] text-gray-400 text-left">
                      <th className="px-4 py-3 font-medium">{t('whitepaper.table_stage')}</th>
                      <th className="px-4 py-3 font-medium">{t('whitepaper.table_price')}</th>
                      <th className="px-4 py-3 font-medium">{t('whitepaper.table_amount')}</th>
                      <th className="px-4 py-3 font-medium">{t('whitepaper.table_status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stages.map((s) => (
                      <tr key={s.stage} className={`border-t border-white/5 ${s.active ? 'bg-[#00e6c8]/5' : ''}`}>
                        <td className="px-4 py-3 font-semibold text-white">{s.stage}</td>
                        <td className="px-4 py-3 font-mono text-[#00e6c8]">{s.price}</td>
                        <td className="px-4 py-3 font-mono text-gray-300">{s.amount}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${
                            s.active
                              ? 'border-[#00e6c8]/40 text-[#00e6c8] bg-[#00e6c8]/10'
                              : 'border-white/10 text-gray-500'
                          }`}>
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Section>

          {/* ── Section 3: Механизм ценности ── */}
          <Section id="mechanism" title={t('whitepaper.section_mechanism')}>
            <div className="space-y-5 text-gray-300 leading-relaxed">
              <p>
                Каждый VOD обеспечен правом на{' '}
                <span className="text-[#00e6c8] font-semibold">4 600 м³ воды</span> в бассейне
                Аральского моря / рек Сырдарья и Амударья, зарегистрированным в соответствии
                с межгосударственным соглашением о водопользовании стран ЦА.
              </p>
              <div className="bg-[#000d24] border border-[#00e6c8]/20 rounded-xl p-5 space-y-4">
                <div className="text-sm text-gray-400 mb-2">Расчёт реальной стоимости:</div>
                {[
                  { label: 'Объём воды на 1 VOD',          val: '4 600 м³' },
                  { label: 'Рыночная цена воды в ЦА',      val: '$0.003 – $0.012 / м³' },
                  { label: 'Реальная стоимость (max)',      val: '$55.20 / VOD', highlight: true },
                  { label: 'Цена пресейла Stage 1',         val: '$0.20 / VOD' },
                  { label: 'Дисконт к реальной стоимости', val: '99.6%', highlight: true },
                ].map((row) => (
                  <div key={row.label} className={`flex justify-between items-center py-2 border-b border-white/5 last:border-0 ${row.highlight ? 'text-[#00e6c8]' : ''}`}>
                    <span className="text-sm text-gray-400">{row.label}</span>
                    <span className={`font-mono font-semibold ${row.highlight ? 'text-[#00e6c8] text-lg' : 'text-gray-200'}`}>{row.val}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-400">
                Прирост стоимости воды прогнозируется на уровне 8–15% в год до 2030 года, что
                делает VOD одним из наиболее защищённых от инфляции активов в регионе.
              </p>
            </div>
          </Section>

          {/* ── Section 4: DAO ── */}
          <Section id="dao" title={t('whitepaper.section_dao')}>
            <div className="space-y-4">
              <p className="text-gray-300 leading-relaxed">
                Управление платформой VODPROM осуществляется через трёхуровневую систему
                децентрализованного управления (DAO), обеспечивающую представительство всех
                категорий участников.
              </p>
              <div className="space-y-3">
                {[
                  { level: 1, title: 'Members',   threshold: '>100 VOD',     quorum: '25%',  desc: 'голосование по операционным вопросам', color: '#00e6c8' },
                  { level: 2, title: 'Delegates',  threshold: '>10,000 VOD',  quorum: '67%',  desc: 'право veto на стратегические решения',  color: '#0099ff' },
                  { level: 3, title: 'Governors',  threshold: '>100,000 VOD', quorum: '90%',  desc: 'конституционные изменения платформы',   color: '#7c3aed' },
                ].map((row) => (
                  <div key={row.level} className="flex items-start gap-4 bg-[#000d24] border border-white/10 rounded-xl p-4">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ background: row.color + '22', color: row.color, border: `1px solid ${row.color}44` }}>
                      {row.level}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <span className="font-bold text-white">{row.title}</span>
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-white/5 text-gray-400">{row.threshold}</span>
                        <span className="text-xs px-2 py-0.5 rounded font-mono" style={{ color: row.color, background: row.color + '15' }}>{t('whitepaper.quorum')} {row.quorum}</span>
                      </div>
                      <p className="text-sm text-gray-400">{row.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* ── Section 5: Roadmap ── */}
          <Section id="roadmap" title={t('whitepaper.section_roadmap')}>
            <div className="relative pl-6 border-l-2 border-[#00e6c8]/20 space-y-0">
              {ROADMAP.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  viewport={{ once: true }}
                  className="relative pb-8 last:pb-0"
                >
                  <div className={`absolute -left-[29px] top-1 w-4 h-4 rounded-full border-2 ${
                    item.done
                      ? 'bg-[#00e6c8] border-[#00e6c8]'
                      : 'bg-[#000818] border-[#00e6c8]/40'
                  }`} />
                  <div className="flex items-start gap-3">
                    <span className={`font-mono text-xs px-2 py-0.5 rounded flex-shrink-0 mt-0.5 ${
                      item.done
                        ? 'text-[#00e6c8] bg-[#00e6c8]/10 border border-[#00e6c8]/30'
                        : 'text-gray-500 bg-white/5 border border-white/10'
                    }`}>
                      {item.period}
                    </span>
                    <p className="text-gray-300 text-sm leading-relaxed">{item.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Section>

          {/* ── Section 6: Team ── */}
          <Section id="team" title={t('whitepaper.section_team')}>
            <div className="space-y-5">
              <div className="flex flex-wrap gap-3">
                {['EBRD', 'World Bank', 'ADB', 'Plug and Play Uzbekistan', 'IT Park Uzbekistan'].map((p) => (
                  <div key={p} className="px-4 py-2 rounded-xl border border-[#00e6c8]/20 bg-[#00e6c8]/5 text-sm text-gray-300 flex items-center gap-2">
                    <ExternalLink size={12} className="text-[#00e6c8]" />
                    {p}
                  </div>
                ))}
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                VODPROM взаимодействует с ведущими международными финансовыми институтами и
                технологическими акселераторами региона для обеспечения соответствия лучшим
                мировым стандартам прозрачности и устойчивого развития.
              </p>
              <div className="bg-[#000d24] border border-[#00e6c8]/20 rounded-xl p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#00e6c8]/10 flex items-center justify-center text-[#00e6c8]">
                  @
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-0.5">{t('whitepaper.team_contact_label')}</div>
                  <a href="mailto:info@vodprom.uz" className="text-[#00e6c8] text-sm hover:underline">
                    info@vodprom.uz
                  </a>
                </div>
              </div>
            </div>
          </Section>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00e6c8]/10 border border-[#00e6c8]/30 text-[#00e6c8] hover:bg-[#00e6c8]/20 transition-colors text-sm font-medium"
            >
              <Download size={15} />
              {t('whitepaper.download_pdf')}
            </button>
            <p className="text-xs text-gray-600">{t('whitepaper.copyright')}</p>
          </div>
        </motion.article>

        {/* ── Table of Contents (desktop) ── */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <div className="sticky top-24 bg-[#000d24] border border-white/10 rounded-2xl p-4">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
              {t('whitepaper.toc_title')}
            </div>
            <nav className="space-y-1">
              {TOC_ITEMS_DEF.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className={`w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-all ${
                    activeSection === item.id
                      ? 'bg-[#00e6c8]/10 text-[#00e6c8]'
                      : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                  }`}
                >
                  <span className={activeSection === item.id ? 'text-[#00e6c8]' : 'text-gray-600'}>
                    {item.icon}
                  </span>
                  {t(item.labelKey)}
                  {activeSection === item.id && (
                    <ChevronRight size={10} className="ml-auto text-[#00e6c8]" />
                  )}
                </button>
              ))}
            </nav>
          </div>
        </aside>
      </div>
    </div>
  );
}
