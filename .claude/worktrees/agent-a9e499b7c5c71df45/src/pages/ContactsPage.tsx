import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Building2, Briefcase, Globe, Search, Filter,
  ExternalLink, Mail, MapPin, Star, Crown, ChevronRight,
  Phone, MessageSquare, Send, CheckCircle, Loader2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useTranslation } from 'react-i18next';

// ─── Types ──────────────────────────────────────────────────────

interface Stakeholder {
  id: string;
  full_name: string;
  position?: string;
  country?: string;
  stakeholder_type?: string;
  priority?: string;
  tags?: string[];
  website?: string;
  photo_url?: string;
  organization?: string;
  email?: string;
  phone?: string;
  notes?: string;
  created_at?: string;
}

interface Organization {
  id: string;
  name: string;
  org_type?: string;
  sector?: string;
  country?: string;
  priority?: string;
  interaction_type?: string;
  tags?: string[];
  website?: string;
  logo_url?: string;
  description?: string;
  contact_email?: string;
  contact_phone?: string;
  notes?: string;
  created_at?: string;
}

// ─── Constants ──────────────────────────────────────────────────

const CONTACTS_INFO_DATA = [
  { key: 'contact_general', value: 'info@vodprom.uz', href: 'mailto:info@vodprom.uz', color: '#22d3ee', iconType: 'mail' as const },
  { key: 'contact_invest', value: 'invest@vodprom.uz', href: 'mailto:invest@vodprom.uz', color: '#4ade80', iconType: 'mail' as const },
  { key: 'contact_platform', value: 'vodprom.vercel.app', href: 'https://vodprom.vercel.app', color: '#a78bfa', iconType: 'globe' as const },
  { key: 'contact_unicap', value: 'unicapinvest.org', href: 'https://unicapinvest.org', color: '#f59e0b', iconType: 'globe' as const },
];

const STAKEHOLDER_TYPE_COLORS: Record<string, string> = {
  political: '#f59e0b',
  financial: '#22d3ee',
  executive: '#a78bfa',
};

const STAKEHOLDER_TYPE_KEYS: Record<string, string> = {
  all: 'contacts.filter_all',
  political: 'contacts.filter_political',
  financial: 'contacts.filter_financial',
  executive: 'contacts.filter_executive',
};

const ORG_TYPE_COLORS: Record<string, string> = {
  company: '#60a5fa',
  fund: '#4ade80',
  mdb: '#4ade80',
  startup: '#f97316',
};

const ORG_TYPE_KEYS: Record<string, string> = {
  all: 'contacts.filter_all',
  company: 'contacts.filter_companies',
  fund_mdb: 'contacts.filter_funds',
  startup: 'contacts.filter_startups',
};

const MAIN_TAB_KEYS = [
  { key: 'stakeholders', labelKey: 'contacts.tab_stakeholders', icon: Users },
  { key: 'organizations', labelKey: 'contacts.tab_organizations', icon: Building2 },
  { key: 'feedback', labelKey: 'contacts.tab_feedback', icon: MessageSquare },
] as const;

type MainTab = typeof MAIN_TAB_KEYS[number]['key'];

// ─── Helper functions ───────────────────────────────────────────

function getStakeholderColor(type?: string): string {
  return STAKEHOLDER_TYPE_COLORS[type ?? ''] ?? '#60a5fa';
}

function getOrgTypeColor(type?: string): string {
  return ORG_TYPE_COLORS[type ?? ''] ?? '#60a5fa';
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join('');
}

function getPriorityBorderStyle(priority?: string): string {
  if (priority === 'high') return '1px solid rgba(34,211,238,0.4)';
  if (priority === 'medium') return '1px solid rgba(255,255,255,0.1)';
  return '1px solid rgba(255,255,255,0.05)';
}

function getPriorityGlow(priority?: string): string {
  if (priority === 'high') return '0 0 20px rgba(34,211,238,0.15)';
  return 'none';
}

// ─── Skeleton Card ──────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div
      className="rounded-2xl p-5 animate-pulse"
      style={{
        background: 'rgba(0,6,20,0.8)',
        border: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-11 h-11 rounded-full bg-white/5 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-white/5 rounded w-3/4" />
          <div className="h-3 bg-white/5 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-white/5 rounded w-2/3" />
        <div className="flex gap-2">
          <div className="h-5 bg-white/5 rounded-full w-14" />
          <div className="h-5 bg-white/5 rounded-full w-10" />
        </div>
      </div>
    </div>
  );
}

// ─── Stakeholder Card ───────────────────────────────────────────

function StakeholderCard({
  s,
  index,
  onClick,
  priorityHigh,
  priorityMedium,
  priorityLow,
}: {
  s: Stakeholder;
  index: number;
  onClick: () => void;
  priorityHigh: string;
  priorityMedium: string;
  priorityLow: string;
}) {
  const color = getStakeholderColor(s.stakeholder_type);
  const initials = getInitials(s.full_name);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      className="rounded-2xl p-5 cursor-pointer transition-all hover:scale-[1.02] group relative"
      style={{
        background: 'rgba(0,6,20,0.8)',
        border: getPriorityBorderStyle(s.priority),
        boxShadow: getPriorityGlow(s.priority),
      }}
      onClick={onClick}
    >
      {/* Top: Initials + Name */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
          style={{
            background: `${color}18`,
            color: color,
            border: `1px solid ${color}30`,
          }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white truncate">{s.full_name}</h3>
          {s.position && (
            <p className="text-xs text-white/40 mt-0.5 line-clamp-2">{s.position}</p>
          )}
        </div>
      </div>

      {/* Middle: Country + Priority */}
      <div className="flex items-center gap-3 text-xs text-white/35 mb-3">
        {s.country && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {s.country}
          </span>
        )}
        {s.priority && (
          <span className="flex items-center gap-1">
            <Star
              className="w-3 h-3"
              style={{
                color: s.priority === 'high' ? '#ef4444' : s.priority === 'medium' ? '#eab308' : '#6b7280',
              }}
            />
            <span
              style={{
                color: s.priority === 'high' ? '#ef4444' : s.priority === 'medium' ? '#eab308' : '#6b7280',
              }}
            >
              {s.priority === 'high' ? priorityHigh : s.priority === 'medium' ? priorityMedium : priorityLow}
            </span>
          </span>
        )}
      </div>

      {/* Tags */}
      {s.tags && s.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {s.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-2 py-0.5 rounded-full"
              style={{
                background: `${color}12`,
                color: `${color}cc`,
                border: `1px solid ${color}20`,
              }}
            >
              {tag}
            </span>
          ))}
          {s.tags.length > 3 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full text-white/25">
              +{s.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Bottom actions */}
      <div className="flex items-center justify-end gap-2">
        {s.website && (
          <a
            href={s.website}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
            style={{ color: '#22d3ee' }}
          >
            <Globe className="w-3.5 h-3.5" />
          </a>
        )}
        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white/25 group-hover:text-white/60 transition-colors">
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Organization Card ──────────────────────────────────────────

function OrganizationCard({
  o,
  index,
  onClick,
  t,
}: {
  o: Organization;
  index: number;
  onClick: () => void;
  t: (key: string) => string;
}) {
  const color = getOrgTypeColor(o.org_type);
  const initials = getInitials(o.name);

  const orgTypeLabel = (() => {
    switch (o.org_type) {
      case 'company': return t('contacts.org_company');
      case 'fund': return t('contacts.org_fund');
      case 'mdb': return t('contacts.org_mdb');
      case 'startup': return t('contacts.org_startup');
      default: return o.org_type ?? t('contacts.org_default');
    }
  })();

  const interactionLabel = (() => {
    switch (o.interaction_type) {
      case 'partner': return t('contacts.interaction_partner');
      case 'investor': return t('contacts.interaction_investor');
      case 'client': return t('contacts.interaction_client');
      case 'competitor': return t('contacts.interaction_competitor');
      case 'advisor': return t('contacts.interaction_advisor');
      default: return o.interaction_type ?? '';
    }
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      className="rounded-2xl p-5 cursor-pointer transition-all hover:scale-[1.02] group relative"
      style={{
        background: 'rgba(0,6,20,0.8)',
        border: getPriorityBorderStyle(o.priority),
        boxShadow: getPriorityGlow(o.priority),
      }}
      onClick={onClick}
    >
      {/* Top: Logo + Name */}
      <div className="flex items-start gap-3 mb-2">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
          style={{
            background: `${color}15`,
            color: color,
            border: `1px solid ${color}25`,
          }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white truncate">{o.name}</h3>
          <span
            className="inline-block text-[10px] px-2 py-0.5 rounded-full mt-1"
            style={{
              background: `${color}15`,
              color: color,
              border: `1px solid ${color}25`,
            }}
          >
            {orgTypeLabel}
          </span>
        </div>
      </div>

      {/* Sector description */}
      {o.sector && (
        <p className="text-xs text-white/35 mb-3 line-clamp-2">{o.sector}</p>
      )}

      {/* Country + Interaction */}
      <div className="flex items-center gap-3 text-xs text-white/35 mb-3">
        {o.country && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {o.country}
          </span>
        )}
        {interactionLabel && (
          <span className="flex items-center gap-1">
            <Briefcase className="w-3 h-3" />
            {interactionLabel}
          </span>
        )}
      </div>

      {/* Tags */}
      {o.tags && o.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {o.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-2 py-0.5 rounded-full"
              style={{
                background: `${color}12`,
                color: `${color}cc`,
                border: `1px solid ${color}20`,
              }}
            >
              {tag}
            </span>
          ))}
          {o.tags.length > 3 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full text-white/25">
              +{o.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Bottom actions */}
      <div className="flex items-center justify-end gap-2">
        {o.website && (
          <a
            href={o.website}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
            style={{ color: '#22d3ee' }}
          >
            <Globe className="w-3.5 h-3.5" />
          </a>
        )}
        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white/25 group-hover:text-white/60 transition-colors">
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main page ──────────────────────────────────────────────────

export default function ContactsPage() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();

  // Main tab
  const [activeTab, setActiveTab] = useState<MainTab>('stakeholders');

  // Stakeholders state
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [stakeholdersLoading, setStakeholdersLoading] = useState(true);
  const [stakeholderTypeFilter, setStakeholderTypeFilter] = useState('all');
  const [stakeholderSearch, setStakeholderSearch] = useState('');

  // Organizations state
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [orgsLoading, setOrgsLoading] = useState(true);
  const [orgTypeFilter, setOrgTypeFilter] = useState('all');
  const [orgSearch, setOrgSearch] = useState('');

  // Contact form state
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // ─── Fetch data ──────────────────────────────────────────────

  useEffect(() => {
    async function fetchStakeholders() {
      setStakeholdersLoading(true);
      try {
        const { data, error } = await supabase
          .from('stakeholders')
          .select('*')
          .order('priority', { ascending: true })
          .order('full_name');
        if (!error && data) setStakeholders(data);
      } catch {
        // silent fail for prototype
      }
      setStakeholdersLoading(false);
    }
    fetchStakeholders();
  }, []);

  useEffect(() => {
    async function fetchOrganizations() {
      setOrgsLoading(true);
      try {
        const { data, error } = await supabase
          .from('organizations')
          .select('*')
          .order('priority', { ascending: true })
          .order('name');
        if (!error && data) setOrganizations(data);
      } catch {
        // silent fail for prototype
      }
      setOrgsLoading(false);
    }
    fetchOrganizations();
  }, []);

  // ─── Filtered data ───────────────────────────────────────────

  const filteredStakeholders = useMemo(() => {
    let result = stakeholders;
    if (stakeholderTypeFilter !== 'all') {
      result = result.filter((s) => s.stakeholder_type === stakeholderTypeFilter);
    }
    if (stakeholderSearch.trim()) {
      const q = stakeholderSearch.toLowerCase();
      result = result.filter(
        (s) =>
          s.full_name.toLowerCase().includes(q) ||
          (s.position ?? '').toLowerCase().includes(q) ||
          (s.organization ?? '').toLowerCase().includes(q)
      );
    }
    return result;
  }, [stakeholders, stakeholderTypeFilter, stakeholderSearch]);

  const filteredOrganizations = useMemo(() => {
    let result = organizations;
    if (orgTypeFilter !== 'all') {
      if (orgTypeFilter === 'fund_mdb') {
        result = result.filter((o) => o.org_type === 'fund' || o.org_type === 'mdb');
      } else {
        result = result.filter((o) => o.org_type === orgTypeFilter);
      }
    }
    if (orgSearch.trim()) {
      const q = orgSearch.toLowerCase();
      result = result.filter(
        (o) =>
          o.name.toLowerCase().includes(q) ||
          (o.sector ?? '').toLowerCase().includes(q) ||
          (o.description ?? '').toLowerCase().includes(q)
      );
    }
    return result;
  }, [organizations, orgTypeFilter, orgSearch]);

  // ─── Counts for tabs ─────────────────────────────────────────

  const stakeholderTypeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: stakeholders.length };
    for (const s of stakeholders) {
      const tp = s.stakeholder_type ?? 'other';
      counts[tp] = (counts[tp] ?? 0) + 1;
    }
    return counts;
  }, [stakeholders]);

  const orgTypeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: organizations.length, fund_mdb: 0 };
    for (const o of organizations) {
      const tp = o.org_type ?? 'other';
      if (tp === 'fund' || tp === 'mdb') {
        counts.fund_mdb = (counts.fund_mdb ?? 0) + 1;
      }
      counts[tp] = (counts[tp] ?? 0) + 1;
    }
    return counts;
  }, [organizations]);

  // ─── Contact form submit ─────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSending(true);
    try {
      await supabase.from('contact_requests').insert({
        name: form.name,
        email: form.email,
        subject: form.subject,
        message: form.message,
      });
      setSent(true);
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      setSent(true);
    }
    setSending(false);
  };

  // ─── Render ──────────────────────────────────────────────────

  return (
    <div className="min-h-screen pt-14 pb-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* ─── Header ─────────────────────────────────────────── */}
        <motion.div
          className="text-center mb-6 pt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div
            className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(56,189,248,0.2), rgba(56,189,248,0.05))',
              border: '1px solid rgba(56,189,248,0.25)',
            }}
          >
            <Users className="w-7 h-7 text-sky-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">{t('contacts.title')}</h1>
          <p className="text-white/40 text-sm max-w-md mx-auto">
            {t('contacts.subtitle')}
          </p>
        </motion.div>

        {/* ─── Main Tabs ──────────────────────────────────────── */}
        <motion.div
          className="flex justify-center gap-2 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {MAIN_TAB_KEYS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            const count =
              tab.key === 'stakeholders'
                ? stakeholders.length
                : tab.key === 'organizations'
                  ? organizations.length
                  : null;

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: isActive ? 'rgba(34,211,238,0.12)' : 'rgba(255,255,255,0.03)',
                  border: isActive ? '1px solid rgba(34,211,238,0.3)' : '1px solid rgba(255,255,255,0.06)',
                  color: isActive ? '#22d3ee' : 'rgba(255,255,255,0.45)',
                }}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{t(tab.labelKey)}</span>
                {count !== null && count > 0 && (
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                    style={{
                      background: isActive ? 'rgba(34,211,238,0.2)' : 'rgba(255,255,255,0.06)',
                      color: isActive ? '#22d3ee' : 'rgba(255,255,255,0.35)',
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </motion.div>

        {/* ─── Tab Content ────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {/* ═══════════════ STAKEHOLDERS TAB ═══════════════ */}
          {activeTab === 'stakeholders' && (
            <motion.div
              key="stakeholders"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {/* Filter tabs */}
              <div className="flex flex-wrap gap-2 mb-4">
                {Object.entries(STAKEHOLDER_TYPE_KEYS).map(([key, labelKey]) => {
                  const isActive = stakeholderTypeFilter === key;
                  const count = stakeholderTypeCounts[key] ?? 0;
                  const color = key === 'all' ? '#22d3ee' : (STAKEHOLDER_TYPE_COLORS[key] ?? '#60a5fa');

                  return (
                    <button
                      key={key}
                      onClick={() => setStakeholderTypeFilter(key)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                      style={{
                        background: isActive ? `${color}18` : 'rgba(255,255,255,0.03)',
                        border: isActive ? `1px solid ${color}35` : '1px solid rgba(255,255,255,0.06)',
                        color: isActive ? color : 'rgba(255,255,255,0.4)',
                      }}
                    >
                      {t(labelKey)}
                      {count > 0 && (
                        <span
                          className="text-[10px] px-1 rounded"
                          style={{ opacity: isActive ? 0.8 : 0.5 }}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Search bar */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                <input
                  type="text"
                  value={stakeholderSearch}
                  onChange={(e) => setStakeholderSearch(e.target.value)}
                  placeholder={t('contacts.search_stakeholders')}
                  className="w-full h-10 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/20 outline-none focus:border-cyan-500/40 transition"
                />
              </div>

              {/* Cards grid */}
              {stakeholdersLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : filteredStakeholders.length === 0 ? (
                <div className="text-center py-16">
                  <Users className="w-10 h-10 text-white/15 mx-auto mb-3" />
                  <p className="text-white/30 text-sm">
                    {stakeholderSearch ? t('contacts.empty_search') : t('contacts.empty_loading')}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredStakeholders.map((s, i) => (
                    <StakeholderCard
                      key={s.id}
                      s={s}
                      index={i}
                      onClick={() => setLocation(`/contacts/stakeholder/${s.id}`)}
                      priorityHigh={t('contacts.priority_high')}
                      priorityMedium={t('contacts.priority_medium')}
                      priorityLow={t('contacts.priority_low')}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ═══════════════ ORGANIZATIONS TAB ═══════════════ */}
          {activeTab === 'organizations' && (
            <motion.div
              key="organizations"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {/* Filter tabs */}
              <div className="flex flex-wrap gap-2 mb-4">
                {Object.entries(ORG_TYPE_KEYS).map(([key, labelKey]) => {
                  const isActive = orgTypeFilter === key;
                  const count = orgTypeCounts[key] ?? 0;
                  const color =
                    key === 'all'
                      ? '#22d3ee'
                      : key === 'fund_mdb'
                        ? '#4ade80'
                        : (ORG_TYPE_COLORS[key] ?? '#60a5fa');

                  return (
                    <button
                      key={key}
                      onClick={() => setOrgTypeFilter(key)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                      style={{
                        background: isActive ? `${color}18` : 'rgba(255,255,255,0.03)',
                        border: isActive ? `1px solid ${color}35` : '1px solid rgba(255,255,255,0.06)',
                        color: isActive ? color : 'rgba(255,255,255,0.4)',
                      }}
                    >
                      {t(labelKey)}
                      {count > 0 && (
                        <span
                          className="text-[10px] px-1 rounded"
                          style={{ opacity: isActive ? 0.8 : 0.5 }}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Search bar */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                <input
                  type="text"
                  value={orgSearch}
                  onChange={(e) => setOrgSearch(e.target.value)}
                  placeholder={t('contacts.search_orgs')}
                  className="w-full h-10 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/20 outline-none focus:border-cyan-500/40 transition"
                />
              </div>

              {/* Cards grid */}
              {orgsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : filteredOrganizations.length === 0 ? (
                <div className="text-center py-16">
                  <Building2 className="w-10 h-10 text-white/15 mx-auto mb-3" />
                  <p className="text-white/30 text-sm">
                    {orgSearch ? t('contacts.empty_search') : t('contacts.empty_loading')}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredOrganizations.map((o, i) => (
                    <OrganizationCard
                      key={o.id}
                      o={o}
                      index={i}
                      onClick={() => setLocation(`/contacts/organization/${o.id}`)}
                      t={t}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ═══════════════ FEEDBACK TAB ═══════════════ */}
          {activeTab === 'feedback' && (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="max-w-2xl mx-auto"
            >
              {/* Contact info cards */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                {CONTACTS_INFO_DATA.map((c) => {
                  const Icon = c.iconType === 'mail' ? Mail : Globe;
                  return (
                    <a
                      key={c.key}
                      href={c.href}
                      className="rounded-2xl p-4 transition-all hover:scale-[1.02] group"
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: `1px solid ${c.color}15`,
                      }}
                      target={c.href.startsWith('http') ? '_blank' : undefined}
                      rel="noopener noreferrer"
                    >
                      <Icon
                        className="w-5 h-5 mb-2 transition group-hover:scale-110"
                        style={{ color: c.color }}
                      />
                      <p className="text-xs text-white/35 mb-0.5">{t(`contacts.${c.key}`)}</p>
                      <p className="text-sm text-white/80 font-medium">{c.value}</p>
                    </a>
                  );
                })}
              </div>

              {/* Contact form */}
              <div
                className="rounded-2xl p-6"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(0,200,230,0.1)',
                }}
              >
                {sent ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-white mb-1">{t('contacts.sent_title')}</h3>
                    <p className="text-sm text-white/40 mb-4">{t('contacts.sent_desc')}</p>
                    <button
                      onClick={() => setSent(false)}
                      className="text-sm text-cyan-400/70 hover:text-cyan-400 transition"
                    >
                      {t('contacts.sent_again')}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <h3 className="text-base font-bold text-white mb-4">{t('contacts.form_title')}</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-white/40 mb-1 block">{t('contacts.form_name')}</label>
                        <input
                          type="text"
                          required
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/20 outline-none focus:border-cyan-500/40 transition"
                          placeholder={t('contacts.form_name_placeholder')}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-white/40 mb-1 block">{t('contacts.form_email')}</label>
                        <input
                          type="email"
                          required
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/20 outline-none focus:border-cyan-500/40 transition"
                          placeholder="email@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-white/40 mb-1 block">{t('contacts.form_subject')}</label>
                      <input
                        type="text"
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/20 outline-none focus:border-cyan-500/40 transition"
                        placeholder={t('contacts.form_subject_placeholder')}
                      />
                    </div>

                    <div>
                      <label className="text-xs text-white/40 mb-1 block">{t('contacts.form_message')}</label>
                      <textarea
                        required
                        rows={4}
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/20 outline-none focus:border-cyan-500/40 transition resize-none"
                        placeholder={t('contacts.form_message_placeholder')}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={sending}
                      className="w-full flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-semibold text-white transition disabled:opacity-50"
                      style={{
                        background:
                          'linear-gradient(135deg, rgba(6,182,212,0.25), rgba(34,211,238,0.1))',
                        border: '1px solid rgba(34,211,238,0.3)',
                      }}
                    >
                      {sending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      {sending ? t('contacts.form_sending') : t('contacts.form_send')}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
