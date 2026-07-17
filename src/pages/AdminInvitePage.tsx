import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import {
  Shield, Users, QrCode, Copy, ExternalLink, Share2,
  Search, Filter, Crown, Briefcase, Building2, Check,
  Loader2, ChevronDown, X, Smartphone, Link2,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useStakeholders, type Stakeholder } from '@/hooks/useStakeholders';

// ─── Constants ──────────────────────────────────────────────

const STAKEHOLDER_TYPE_CONFIG: Record<string, { label: string; color: string; icon: typeof Crown }> = {
  political: { label: 'Политический', color: '#ef4444', icon: Crown },
  executive: { label: 'Исполнительный', color: '#3b82f6', icon: Briefcase },
  financial: { label: 'Финансовый', color: '#f59e0b', icon: Building2 },
};

const TYPE_FILTERS = [
  { value: '', label: 'Все' },
  { value: 'political', label: 'Политические' },
  { value: 'executive', label: 'Исполнительные' },
  { value: 'financial', label: 'Финансовые' },
];

// ─── Helpers ────────────────────────────────────────────────

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function getInviteUrl(stakeholderId: string): string {
  return `${window.location.origin}/activate/${stakeholderId}`;
}

function getQrImageUrl(data: string, size = 200): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}&bgcolor=000818&color=00e6c8&format=png&margin=8`;
}

function getTypeConfig(type: string | null) {
  if (!type) return { label: 'Общий', color: '#64748b', icon: Users };
  return STAKEHOLDER_TYPE_CONFIG[type.toLowerCase()] || { label: type, color: '#64748b', icon: Users };
}

// ─── Animation variants ─────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const expandVariants = {
  collapsed: { height: 0, opacity: 0 },
  expanded: { height: 'auto', opacity: 1, transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: { height: 0, opacity: 0, transition: { duration: 0.2 } },
};

// ─── Stats Bar ──────────────────────────────────────────────

function StatsBar({ stakeholders }: { stakeholders: Stakeholder[] }) {
  const total = stakeholders.length;
  const political = stakeholders.filter((s) => s.stakeholder_type?.toLowerCase() === 'political').length;
  const executive = stakeholders.filter((s) => s.stakeholder_type?.toLowerCase() === 'executive').length;
  const financial = stakeholders.filter((s) => s.stakeholder_type?.toLowerCase() === 'financial').length;

  const stats = [
    { label: 'Всего', value: total.toString(), icon: Users, color: '#00e6c8' },
    { label: 'Политические', value: political.toString(), icon: Crown, color: '#ef4444' },
    { label: 'Исполнительные', value: executive.toString(), icon: Briefcase, color: '#3b82f6' },
    { label: 'Финансовые', value: financial.toString(), icon: Building2, color: '#f59e0b' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            custom={i}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="rounded-2xl p-4"
            style={{
              background: `linear-gradient(135deg, ${stat.color}08, ${stat.color}04)`,
              border: `1px solid ${stat.color}18`,
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: `${stat.color}12`, border: `1px solid ${stat.color}20` }}
              >
                <Icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>
            </div>
            <div className="text-xl font-bold text-white">{stat.value}</div>
            <div className="text-xs text-white/40">{stat.label}</div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Stakeholder Card ───────────────────────────────────────

function StakeholderCard({ stakeholder, index }: { stakeholder: Stakeholder; index: number }) {
  const [showQr, setShowQr] = useState(false);
  const [copied, setCopied] = useState(false);

  const inviteUrl = getInviteUrl(stakeholder.id);
  const typeConfig = getTypeConfig(stakeholder.stakeholder_type);
  const TypeIcon = typeConfig.icon;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = inviteUrl;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [inviteUrl]);

  const handleOpen = useCallback(() => {
    window.open(inviteUrl, '_blank', 'noopener,noreferrer');
  }, [inviteUrl]);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Приглашение: ${stakeholder.full_name}`,
          text: `Активируйте аккаунт стейкхолдера ${stakeholder.full_name}`,
          url: inviteUrl,
        });
      } catch {
        // User cancelled
      }
    } else {
      handleCopy();
    }
  }, [inviteUrl, stakeholder.full_name, handleCopy]);

  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(0,6,20,0.8)',
        border: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div className="p-5">
        {/* Header: Avatar + Name + Type */}
        <div className="flex items-start gap-3 mb-4">
          {/* Avatar */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
            style={{
              background: `linear-gradient(135deg, ${typeConfig.color}25, ${typeConfig.color}10)`,
              border: `1px solid ${typeConfig.color}40`,
              color: typeConfig.color,
            }}
          >
            {stakeholder.photo_url ? (
              <img
                src={stakeholder.photo_url}
                alt={stakeholder.full_name}
                className="w-full h-full rounded-xl object-cover"
              />
            ) : (
              getInitials(stakeholder.full_name)
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white truncate">{stakeholder.full_name}</h3>
            {stakeholder.position && (
              <p className="text-xs text-white/45 mt-0.5 truncate">{stakeholder.position}</p>
            )}
            {stakeholder.activity_area && (
              <p className="text-xs text-white/30 mt-0.5 truncate">{stakeholder.activity_area}</p>
            )}
          </div>

          {/* Type badge */}
          <span
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold shrink-0"
            style={{
              background: `${typeConfig.color}15`,
              color: typeConfig.color,
              border: `1px solid ${typeConfig.color}25`,
            }}
          >
            <TypeIcon className="w-3 h-3" />
            {typeConfig.label}
          </span>
        </div>

        {/* QR toggle button */}
        <button
          onClick={() => setShowQr(!showQr)}
          className="w-full flex items-center justify-center gap-2 h-10 rounded-xl text-xs font-medium transition mb-3"
          style={{
            background: showQr ? 'rgba(0,230,200,0.1)' : 'rgba(255,255,255,0.03)',
            border: showQr ? '1px solid rgba(0,230,200,0.2)' : '1px solid rgba(255,255,255,0.06)',
            color: showQr ? '#00e6c8' : 'rgba(255,255,255,0.5)',
          }}
        >
          <QrCode className="w-4 h-4" />
          {showQr ? 'Скрыть QR' : 'Показать QR'}
          <ChevronDown
            className="w-3.5 h-3.5 transition-transform"
            style={{ transform: showQr ? 'rotate(180deg)' : 'rotate(0)' }}
          />
        </button>

        {/* QR Code (expandable) */}
        <AnimatePresence>
          {showQr && (
            <motion.div
              variants={expandVariants}
              initial="collapsed"
              animate="expanded"
              exit="exit"
              className="overflow-hidden"
            >
              <div className="flex flex-col items-center py-4 mb-3 rounded-xl"
                style={{ background: 'rgba(0,230,200,0.03)', border: '1px solid rgba(0,230,200,0.08)' }}
              >
                <div className="w-[180px] h-[180px] rounded-xl overflow-hidden bg-[#000818] p-2 mb-3"
                  style={{ border: '1px solid rgba(0,230,200,0.15)' }}
                >
                  <img
                    src={getQrImageUrl(inviteUrl, 300)}
                    alt={`QR: ${stakeholder.full_name}`}
                    className="w-full h-full"
                    loading="lazy"
                  />
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-white/30">
                  <Smartphone className="w-3 h-3" />
                  Сканируйте для активации
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Invite link */}
        <div className="mb-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Link2 className="w-3 h-3 text-white/30" />
            <span className="text-[10px] text-white/30 uppercase tracking-wider">Ссылка-приглашение</span>
          </div>
          <div
            className="flex items-center gap-2 h-9 px-3 rounded-lg text-xs text-cyan-400/70 font-mono overflow-hidden"
            style={{ background: 'rgba(0,230,200,0.04)', border: '1px solid rgba(0,230,200,0.08)' }}
          >
            <span className="truncate flex-1 select-all">{inviteUrl}</span>
          </div>
        </div>

        {/* NFC data */}
        <div className="mb-4">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Smartphone className="w-3 h-3 text-white/30" />
            <span className="text-[10px] text-white/30 uppercase tracking-wider">NFC данные</span>
          </div>
          <div
            className="flex items-center gap-2 h-9 px-3 rounded-lg text-xs text-white/40 font-mono overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <span className="truncate flex-1 select-all">{inviteUrl}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl text-xs font-medium transition"
            style={{
              background: copied ? 'rgba(0,230,200,0.15)' : 'rgba(0,230,200,0.06)',
              border: copied ? '1px solid rgba(0,230,200,0.3)' : '1px solid rgba(0,230,200,0.12)',
              color: copied ? '#00e6c8' : 'rgba(0,230,200,0.7)',
            }}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Скопировано' : 'Копировать'}
          </button>

          <button
            onClick={handleOpen}
            className="flex items-center justify-center gap-1.5 h-9 px-3 rounded-xl text-xs font-medium transition"
            style={{
              background: 'rgba(96,165,250,0.06)',
              border: '1px solid rgba(96,165,250,0.12)',
              color: 'rgba(96,165,250,0.7)',
            }}
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-1.5 h-9 px-3 rounded-xl text-xs font-medium transition"
            style={{
              background: 'rgba(167,139,250,0.06)',
              border: '1px solid rgba(167,139,250,0.12)',
              color: 'rgba(167,139,250,0.7)',
            }}
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Status */}
        <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg"
          style={{ background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.08)' }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400/60 animate-pulse" />
          <span className="text-[11px] text-amber-400/60">Ожидает активации</span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page ──────────────────────────────────────────────

export default function AdminInvitePage() {
  const { profile, loading: authLoading, isAuthenticated } = useAuth();
  const { allStakeholders, loading: stakeholdersLoading } = useStakeholders();
  const [, setLocation] = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Redirect non-admins
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || (profile && profile.role !== 'admin'))) {
      setLocation('/');
    }
  }, [authLoading, isAuthenticated, profile, setLocation]);

  // Filter stakeholders
  const filteredStakeholders = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return allStakeholders.filter((s) => {
      // Type filter
      if (typeFilter && s.stakeholder_type?.toLowerCase() !== typeFilter) return false;

      // Search
      if (q) {
        const searchable = [
          s.full_name,
          s.full_name_en,
          s.position,
          s.activity_area,
          s.region,
          s.country,
          s.description,
          ...(s.tags || []),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!searchable.includes(q)) return false;
      }

      return true;
    });
  }, [allStakeholders, searchQuery, typeFilter]);

  // Loading state
  if (authLoading || stakeholdersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-cyan-400/50 animate-spin" />
          <span className="text-sm text-white/30">Загрузка...</span>
        </div>
      </div>
    );
  }

  // Auth guard
  if (!isAuthenticated || !profile || profile.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen pt-14 pb-16">
      {/* Decorative bg elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div
          className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(0,230,200,0.03) 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(96,165,250,0.03) 0%, transparent 70%)' }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6"
        >
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(0,230,200,0.1)', border: '1px solid rgba(0,230,200,0.2)' }}
          >
            <Shield className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Управление приглашениями</h1>
            <p className="text-xs text-white/35">Суперадмин-панель QR-кодов и ссылок</p>
          </div>
        </motion.div>

        {/* Stats */}
        <StatsBar stakeholders={allStakeholders} />

        {/* Search + Filter */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 space-y-3"
        >
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по имени, позиции, организации..."
              className="w-full h-11 pl-10 pr-10 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white placeholder-white/25 outline-none focus:border-cyan-500/30 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter toggle + chips */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium transition"
              style={{
                background: showFilters ? 'rgba(0,230,200,0.1)' : 'rgba(255,255,255,0.03)',
                border: showFilters ? '1px solid rgba(0,230,200,0.2)' : '1px solid rgba(255,255,255,0.06)',
                color: showFilters ? '#00e6c8' : 'rgba(255,255,255,0.4)',
              }}
            >
              <Filter className="w-3.5 h-3.5" />
              Фильтры
            </button>

            <AnimatePresence>
              {showFilters && TYPE_FILTERS.map((f) => (
                <motion.button
                  key={f.value}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => setTypeFilter(f.value)}
                  className="h-8 px-3 rounded-lg text-xs font-medium transition"
                  style={{
                    background: typeFilter === f.value ? 'rgba(0,230,200,0.12)' : 'rgba(255,255,255,0.03)',
                    border: typeFilter === f.value ? '1px solid rgba(0,230,200,0.25)' : '1px solid rgba(255,255,255,0.06)',
                    color: typeFilter === f.value ? '#00e6c8' : 'rgba(255,255,255,0.4)',
                  }}
                >
                  {f.label}
                </motion.button>
              ))}
            </AnimatePresence>

            {/* Result count */}
            <span className="ml-auto text-xs text-white/25">
              {filteredStakeholders.length} из {allStakeholders.length}
            </span>
          </div>
        </motion.div>

        {/* Cards grid */}
        {filteredStakeholders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <Users className="w-12 h-12 text-white/10 mb-4" />
            <p className="text-sm text-white/30 mb-1">Стейкхолдеры не найдены</p>
            <p className="text-xs text-white/20">Попробуйте изменить фильтры или поисковый запрос</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStakeholders.map((s, i) => (
              <StakeholderCard key={s.id} stakeholder={s} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
