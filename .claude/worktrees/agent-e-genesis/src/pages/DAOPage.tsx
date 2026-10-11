/**
 * DAOPage — DAO ОС: интерактивное управление экосистемой ARKHEOSIUM
 * Живые предложения с голосованием, казна, сила голоса, делегирование.
 * Дополняет BlockchainPage (там — токен/NFT/протокол), здесь — governance-механика.
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import {
  ArrowLeft, Vote, Landmark, Users2, Gavel, Wallet, Clock,
  CheckCircle2, XCircle, MinusCircle, TrendingUp, ShieldCheck,
  Sparkles, Timer, PlusCircle, Coins, ChevronRight,
} from 'lucide-react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, Tooltip,
} from 'recharts';

// ── Types ────────────────────────────────────────────────────────────────────

type ProposalStatus = 'active' | 'passed' | 'rejected' | 'pending';
type VoteChoice = 'for' | 'against' | 'abstain';

interface Proposal {
  id: string;
  code: string;
  title: string;
  category: string;
  categoryColor: string;
  summary: string;
  status: ProposalStatus;
  forVotes: number;
  againstVotes: number;
  abstainVotes: number;
  quorum: number;       // требуемое число голосов
  endsIn: string;       // человекочитаемый срок
  proposer: string;
}

// ── Mock governance data ─────────────────────────────────────────────────────

const TOTAL_VOTING_POWER = 100_000_000; // 100M VOD в обращении
const USER_VOTING_POWER = 128_500;       // сила голоса пользователя (VOD)

const INITIAL_PROPOSALS: Proposal[] = [
  {
    id: 'p-014', code: 'AIP-014',
    title: 'Финансирование опреснительного модуля для Аральского бассейна',
    category: 'Казна', categoryColor: '#fbbf24',
    summary: 'Выделить 2.4M VOD из экосистемного фонда на пилотный модуль SWRO мощностью 5 000 м³/сут в Муйнаке. ROI-модель приложена в спецификации.',
    status: 'active',
    forVotes: 31_400_000, againstVotes: 6_200_000, abstainVotes: 1_800_000,
    quorum: 40_000_000, endsIn: '2 дня 14 ч', proposer: 'aral-restoration.dao',
  },
  {
    id: 'p-013', code: 'AIP-013',
    title: 'Включить Чарвакское водохранилище в on-chain реестр',
    category: 'Реестр', categoryColor: '#00e6c8',
    summary: 'Верифицировать и токенизировать водные права Чарвакского вдхр. (500 000 м³/год) как WaterNFT #1 с записью IPFS-метаданных.',
    status: 'active',
    forVotes: 44_100_000, againstVotes: 2_400_000, abstainVotes: 900_000,
    quorum: 40_000_000, endsIn: '5 дней 3 ч', proposer: 'vodprom.dao',
  },
  {
    id: 'p-012', code: 'AIP-012',
    title: 'Снизить комиссию маркетплейса квот с 1.5% до 0.8%',
    category: 'Протокол', categoryColor: '#a78bfa',
    summary: 'Изменить параметр tradingFee в Marketplace.sol для стимулирования ликвидности вторичного рынка водных прав.',
    status: 'active',
    forVotes: 18_900_000, againstVotes: 22_600_000, abstainVotes: 3_100_000,
    quorum: 40_000_000, endsIn: '1 день 8 ч', proposer: '0x7b2a…f391',
  },
  {
    id: 'p-011', code: 'AIP-011',
    title: 'Партнёрство с Международным фондом спасения Арала (МФСА)',
    category: 'Партнёрства', categoryColor: '#60a5fa',
    summary: 'Формализовать интеграцию данных мониторинга МФСА в оракул платформы. Обмен верифицированными телеметрическими потоками.',
    status: 'passed',
    forVotes: 58_200_000, againstVotes: 4_100_000, abstainVotes: 2_000_000,
    quorum: 40_000_000, endsIn: 'Завершено', proposer: 'ecosystem.council',
  },
  {
    id: 'p-010', code: 'AIP-010',
    title: 'Увеличить APY стейкинга тира Platinum до 40%',
    category: 'Протокол', categoryColor: '#a78bfa',
    summary: 'Предложение отклонено: нагрузка на эмиссию превышала устойчивый порог инфляции токена (>6%/год).',
    status: 'rejected',
    forVotes: 12_400_000, againstVotes: 39_800_000, abstainVotes: 1_200_000,
    quorum: 40_000_000, endsIn: 'Завершено', proposer: '0x3a9f…c847',
  },
];

const TREASURY_ALLOCATION = [
  { name: 'Экосистемный фонд', value: 42, color: '#00e6c8' },
  { name: 'Гранты R&D', value: 24, color: '#a78bfa' },
  { name: 'Ликвидность', value: 18, color: '#60a5fa' },
  { name: 'Резерв DAO', value: 16, color: '#fbbf24' },
];

const TREASURY_HISTORY = Array.from({ length: 12 }, (_, i) => ({
  month: ['Авг', 'Сен', 'Окт', 'Ноя', 'Дек', 'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл'][i],
  value: +(3.8 + i * 0.22 + Math.sin(i) * 0.15).toFixed(2),
}));

const fmtVod = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(0)}K` : `${n}`;

const STATUS_META: Record<ProposalStatus, { label: string; color: string }> = {
  active: { label: 'Активно', color: '#4ade80' },
  passed: { label: 'Принято', color: '#22d3ee' },
  rejected: { label: 'Отклонено', color: '#f87171' },
  pending: { label: 'Ожидает', color: '#fbbf24' },
};

// ── Proposal card ────────────────────────────────────────────────────────────

function ProposalCard({
  proposal, userVote, onVote, index,
}: {
  proposal: Proposal;
  userVote?: VoteChoice;
  onVote: (id: string, choice: VoteChoice) => void;
  index: number;
}) {
  const total = proposal.forVotes + proposal.againstVotes + proposal.abstainVotes;
  const forPct = total ? (proposal.forVotes / total) * 100 : 0;
  const againstPct = total ? (proposal.againstVotes / total) * 100 : 0;
  const abstainPct = total ? (proposal.abstainVotes / total) * 100 : 0;
  const quorumPct = Math.min(100, (total / proposal.quorum) * 100);
  const quorumMet = total >= proposal.quorum;
  const status = STATUS_META[proposal.status];
  const isActive = proposal.status === 'active';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="rounded-2xl p-5 relative overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(circle at top right, ${proposal.categoryColor}0d, transparent 55%)` }}
      />
      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-mono text-white/40 px-1.5 py-0.5 rounded bg-white/5">{proposal.code}</span>
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: `${proposal.categoryColor}18`, color: proposal.categoryColor }}
              >
                {proposal.category}
              </span>
            </div>
            <h3 className="text-sm font-bold text-white leading-snug">{proposal.title}</h3>
          </div>
          <span
            className="shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg"
            style={{ background: `${status.color}15`, color: status.color }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: status.color }} />
            {status.label}
          </span>
        </div>

        <p className="text-xs text-white/45 leading-relaxed mb-4">{proposal.summary}</p>

        {/* Vote distribution bar */}
        <div className="mb-2 h-2 rounded-full overflow-hidden flex" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <div style={{ width: `${forPct}%`, background: '#4ade80' }} />
          <div style={{ width: `${againstPct}%`, background: '#f87171' }} />
          <div style={{ width: `${abstainPct}%`, background: '#94a3b8' }} />
        </div>
        <div className="flex items-center justify-between text-[11px] mb-4">
          <span className="text-green-400">За {fmtVod(proposal.forVotes)} · {forPct.toFixed(0)}%</span>
          <span className="text-red-400">Против {fmtVod(proposal.againstVotes)} · {againstPct.toFixed(0)}%</span>
          <span className="text-white/40">Возд. {fmtVod(proposal.abstainVotes)}</span>
        </div>

        {/* Quorum */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${quorumPct}%`, background: quorumMet ? '#22d3ee' : '#fbbf24' }}
            />
          </div>
          <span className="text-[10px] font-mono shrink-0" style={{ color: quorumMet ? '#22d3ee' : '#fbbf24' }}>
            Кворум {quorumPct.toFixed(0)}%
          </span>
        </div>

        {/* Footer: meta + voting */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-[10px] text-white/30 min-w-0">
            <span className="flex items-center gap-1 shrink-0"><Clock className="w-3 h-3" />{proposal.endsIn}</span>
            <span className="flex items-center gap-1 truncate"><Users2 className="w-3 h-3 shrink-0" />{proposal.proposer}</span>
          </div>

          {isActive ? (
            userVote ? (
              <span
                className="shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg"
                style={{
                  background: userVote === 'for' ? 'rgba(74,222,128,0.12)' : userVote === 'against' ? 'rgba(248,113,113,0.12)' : 'rgba(148,163,184,0.12)',
                  color: userVote === 'for' ? '#4ade80' : userVote === 'against' ? '#f87171' : '#94a3b8',
                }}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Ваш голос: {userVote === 'for' ? 'За' : userVote === 'against' ? 'Против' : 'Воздерж.'}
              </span>
            ) : (
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => onVote(proposal.id, 'for')}
                  className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg text-green-400 bg-green-400/10 hover:bg-green-400/20 border border-green-400/20 transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />За
                </button>
                <button
                  onClick={() => onVote(proposal.id, 'against')}
                  className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg text-red-400 bg-red-400/10 hover:bg-red-400/20 border border-red-400/20 transition-colors cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5" />Против
                </button>
                <button
                  onClick={() => onVote(proposal.id, 'abstain')}
                  className="flex items-center justify-center text-[11px] font-semibold w-8 h-8 rounded-lg text-white/40 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
                  title="Воздержаться"
                >
                  <MinusCircle className="w-3.5 h-3.5" />
                </button>
              </div>
            )
          ) : (
            <span className="shrink-0 text-[10px] text-white/25 font-mono">голосование закрыто</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

type Tab = 'proposals' | 'treasury' | 'power';

export default function DAOPage() {
  const [, setLocation] = useLocation();
  const [tab, setTab] = useState<Tab>('proposals');
  const [proposals, setProposals] = useState<Proposal[]>(INITIAL_PROPOSALS);
  const [votes, setVotes] = useState<Record<string, VoteChoice>>({});
  const [filter, setFilter] = useState<'all' | ProposalStatus>('all');

  function castVote(id: string, choice: VoteChoice) {
    if (votes[id]) return;
    setVotes((v) => ({ ...v, [id]: choice }));
    setProposals((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        return {
          ...p,
          forVotes: p.forVotes + (choice === 'for' ? USER_VOTING_POWER : 0),
          againstVotes: p.againstVotes + (choice === 'against' ? USER_VOTING_POWER : 0),
          abstainVotes: p.abstainVotes + (choice === 'abstain' ? USER_VOTING_POWER : 0),
        };
      })
    );
  }

  const activeCount = proposals.filter((p) => p.status === 'active').length;
  const passedCount = proposals.filter((p) => p.status === 'passed').length;
  const participation = ((USER_VOTING_POWER / TOTAL_VOTING_POWER) * 100).toFixed(3);

  const filteredProposals = useMemo(
    () => (filter === 'all' ? proposals : proposals.filter((p) => p.status === filter)),
    [proposals, filter]
  );

  const stats = [
    { label: 'Активных предложений', value: activeCount, icon: Vote, color: '#4ade80' },
    { label: 'Казна DAO', value: '$6.1M', icon: Landmark, color: '#fbbf24' },
    { label: 'Держателей-голосующих', value: '3 841', icon: Users2, color: '#a78bfa' },
    { label: 'Принято решений', value: passedCount + 27, icon: Gavel, color: '#22d3ee' },
  ];

  const FILTERS: { key: 'all' | ProposalStatus; label: string }[] = [
    { key: 'all', label: 'Все' },
    { key: 'active', label: 'Активные' },
    { key: 'passed', label: 'Принятые' },
    { key: 'rejected', label: 'Отклонённые' },
  ];

  const TABS: { key: Tab; label: string; icon: typeof Vote }[] = [
    { key: 'proposals', label: 'Предложения', icon: Vote },
    { key: 'treasury', label: 'Казна', icon: Landmark },
    { key: 'power', label: 'Сила голоса', icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen pt-14 pb-8" style={{ background: 'linear-gradient(135deg, #000818 0%, #000d1f 100%)' }}>
      <div className="max-w-5xl mx-auto px-4 pt-6">
        {/* Back */}
        <button
          onClick={() => setLocation('/')}
          className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors mb-4 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          На главную
        </button>

        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-1 flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,230,200,0.12)', border: '1px solid rgba(0,230,200,0.25)' }}>
            <Gavel className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-none">DAO ОС</h1>
            <p className="text-white/35 text-xs mt-1">Децентрализованное управление экосистемой водной инфраструктуры</p>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl p-4"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="flex items-center gap-2 mb-2" style={{ color: s.color }}>
                  <Icon className="w-4 h-4" />
                  <span className="text-[11px] text-white/40 leading-tight">{s.label}</span>
                </div>
                <div className="text-xl font-bold text-white">{s.value}</div>
              </motion.div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 mt-6 mb-5">
          {TABS.map((tb) => {
            const Icon = tb.icon;
            const isActive = tab === tb.key;
            return (
              <button
                key={tb.key}
                onClick={() => setTab(tb.key)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${isActive ? 'text-white' : 'text-white/40 hover:text-white/60'}`}
                style={isActive ? { background: 'rgba(0,230,200,0.12)', border: '1px solid rgba(0,230,200,0.25)' } : { background: 'rgba(255,255,255,0.03)', border: '1px solid transparent' }}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: isActive ? '#00e6c8' : undefined }} />
                {tb.label}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* ── Proposals ── */}
            {tab === 'proposals' && (
              <div className="space-y-4">
                {/* Filter chips */}
                <div className="flex items-center gap-2 flex-wrap">
                  {FILTERS.map((f) => (
                    <button
                      key={f.key}
                      onClick={() => setFilter(f.key)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${filter === f.key ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' : 'bg-white/5 text-white/40 border border-transparent hover:text-white/60'}`}
                    >
                      {f.label}
                    </button>
                  ))}
                  <button
                    className="ml-auto flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg text-cyan-400 bg-cyan-400/10 hover:bg-cyan-400/20 border border-cyan-400/20 transition-colors cursor-pointer"
                    onClick={() => setLocation('/constructor')}
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Создать предложение
                  </button>
                </div>

                {filteredProposals.map((p, i) => (
                  <ProposalCard key={p.id} proposal={p} userVote={votes[p.id]} onVote={castVote} index={i} />
                ))}

                {filteredProposals.length === 0 && (
                  <div className="text-center py-16">
                    <Vote className="w-10 h-10 text-white/10 mx-auto mb-3" />
                    <p className="text-sm text-white/30">Нет предложений в этой категории</p>
                  </div>
                )}
              </div>
            )}

            {/* ── Treasury ── */}
            {tab === 'treasury' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Balance + history */}
                <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="flex items-center gap-2 mb-1 text-white/40 text-xs"><Coins className="w-4 h-4 text-amber-400" />Баланс казны</div>
                  <div className="text-3xl font-black text-white mb-0.5">$6.14M</div>
                  <div className="text-xs text-green-400 flex items-center gap-1 mb-4"><TrendingUp className="w-3 h-3" />+18.2% за 12 месяцев</div>
                  <ResponsiveContainer width="100%" height={140}>
                    <AreaChart data={TREASURY_HISTORY}>
                      <defs>
                        <linearGradient id="treasuryGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#fbbf24" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#ffffff30' }} interval={1} />
                      <YAxis tick={{ fontSize: 9, fill: '#ffffff30' }} width={34} tickFormatter={(v) => `$${v}M`} />
                      <Tooltip
                        contentStyle={{ background: '#0a1628', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 8, fontSize: 11 }}
                        formatter={(v: number) => [`$${v}M`, 'Казна']}
                      />
                      <Area type="monotone" dataKey="value" stroke="#fbbf24" strokeWidth={2} fill="url(#treasuryGrad)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Allocation */}
                <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="flex items-center gap-2 mb-3 text-white/40 text-xs"><Landmark className="w-4 h-4 text-cyan-400" />Распределение средств</div>
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                      <Pie data={TREASURY_ALLOCATION} dataKey="value" cx="50%" cy="50%" innerRadius={38} outerRadius={62} stroke="none" paddingAngle={2}>
                        {TREASURY_ALLOCATION.map((e, i) => <Cell key={i} fill={e.color} fillOpacity={0.85} />)}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: '#0a1628', border: '1px solid rgba(0,230,200,0.2)', borderRadius: 8, fontSize: 11 }}
                        formatter={(v: number) => [`${v}%`]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-1.5 mt-2">
                    {TREASURY_ALLOCATION.map((d) => (
                      <div key={d.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                          <span className="text-white/60">{d.name}</span>
                        </div>
                        <span className="text-white/40 font-mono">{d.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Voting Power ── */}
            {tab === 'power' && (
              <div className="space-y-4">
                <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, rgba(0,230,200,0.08), rgba(96,165,250,0.05))', border: '1px solid rgba(0,230,200,0.2)' }}>
                  <div className="flex items-center gap-2 mb-3 text-cyan-300 text-xs font-semibold"><ShieldCheck className="w-4 h-4" />Ваша сила голоса</div>
                  <div className="flex items-end gap-2 mb-1">
                    <span className="text-3xl font-black text-white">{USER_VOTING_POWER.toLocaleString('ru-RU')}</span>
                    <span className="text-sm text-white/40 mb-1">VOD</span>
                  </div>
                  <div className="text-xs text-white/40">{participation}% от общей силы голоса сети · {Object.keys(votes).length} голосов подано</div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* How power works */}
                  <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4 text-violet-400" />Как формируется сила голоса</h3>
                    <div className="space-y-2.5 text-xs">
                      {[
                        { label: 'Баланс VOD', value: '85 000', weight: '×1.0', color: '#00e6c8' },
                        { label: 'Стейкинг (Gold, 180д)', value: '40 000', weight: '×1.5', color: '#fbbf24' },
                        { label: 'Бонус давности', value: '3 500', weight: '×1.1', color: '#a78bfa' },
                      ].map((r) => (
                        <div key={r.label} className="flex items-center justify-between p-2 rounded-lg" style={{ background: `${r.color}0d`, border: `1px solid ${r.color}22` }}>
                          <span className="text-white/60">{r.label}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-white/70 font-mono">{r.value}</span>
                            <span className="font-mono text-[10px]" style={{ color: r.color }}>{r.weight}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delegation */}
                  <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><Wallet className="w-4 h-4 text-blue-400" />Делегирование</h3>
                    <p className="text-xs text-white/45 leading-relaxed mb-3">Передайте свою силу голоса доверенному делегату — он голосует от вашего имени, вы сохраняете токены.</p>
                    <div className="space-y-2">
                      {[
                        { name: 'aral-restoration.dao', power: '4.2M', badge: 'Эколог. совет' },
                        { name: 'vodprom.dao', power: '3.8M', badge: 'Оператор' },
                        { name: 'hydro-science.dao', power: '2.1M', badge: 'R&D' },
                      ].map((d) => (
                        <button
                          key={d.name}
                          className="w-full flex items-center justify-between p-2.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/8 transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(96,165,250,0.12)' }}>
                              <Users2 className="w-3.5 h-3.5 text-blue-400" />
                            </div>
                            <div className="min-w-0 text-left">
                              <div className="text-xs text-white/70 font-mono truncate">{d.name}</div>
                              <div className="text-[10px] text-white/35">{d.badge} · {d.power} VOD</div>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Governance timeline note */}
                <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <Timer className="w-5 h-5 text-cyan-400 shrink-0" />
                  <p className="text-xs text-white/45 leading-relaxed">
                    Цикл голосования: <span className="text-white/70">7 дней</span> обсуждение → <span className="text-white/70">5 дней</span> голосование → <span className="text-white/70">2 дня</span> timelock перед исполнением. Кворум — 40% силы голоса сети.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
