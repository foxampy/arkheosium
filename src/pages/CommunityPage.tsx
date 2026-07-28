import { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Search,
  X,
  Users,
  Globe,
  Building2,
  DollarSign,
  LayoutGrid,
  List,
  MapPin,
  Tag,
  Handshake,
  ChevronDown,
  Filter,
} from 'lucide-react';
import {
  SUBJECTS_DATA,
  getSubjectColor,
  type PlatformSubject,
} from '@/data/subjects-data';
import { useSupabaseCommunity } from '@/hooks/useSupabaseCommunity';
import ProductCard from '@/components/ProductCard';
import { localizedField } from '@/lib/i18n-utils';

// ─── Helpers ────────────────────────────────────────────────

function fmtBudget(n: number | undefined): string {
  if (!n) return '--';
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(0)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

function fmtNumber(n: number | undefined): string {
  if (!n) return '--';
  return n.toLocaleString('ru-RU');
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function getSubjectById(id: string): PlatformSubject | undefined {
  return SUBJECTS_DATA.find((s) => s.id === id);
}

// ─── Animation variants ─────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

// ─── Stats Bar ──────────────────────────────────────────────

function StatsBar({ subjects }: { subjects: PlatformSubject[] }) {
  const totalOrgs = subjects.length;
  const countries = new Set(subjects.map((s) => s.country)).size;
  const totalStaff = subjects.reduce((sum, s) => sum + (s.staff_count ?? 0), 0);
  const totalBudget = subjects.reduce((sum, s) => sum + (s.budget_annual ?? 0), 0);

  const stats = [
    { label: 'Организаций', value: totalOrgs.toString(), icon: Building2, color: '#00e6c8' },
    { label: 'Стран', value: countries.toString(), icon: Globe, color: '#60a5fa' },
    { label: 'Сотрудников', value: fmtNumber(totalStaff), icon: Users, color: '#fbbf24' },
    { label: 'Общий бюджет', value: fmtBudget(totalBudget), icon: DollarSign, color: '#a78bfa' },
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
                <Icon size={14} style={{ color: stat.color }} />
              </div>
              <span className="text-white/35 text-xs">{stat.label}</span>
            </div>
            <div className="text-white font-black text-lg sm:text-xl">{stat.value}</div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Organization Card (Grid) ───────────────────────────────

function OrgCard({
  subject,
  onClick,
  index,
}: {
  subject: PlatformSubject;
  onClick: () => void;
  index: number;
}) {
  const color = getSubjectColor(subject.type);

  return (
    <ProductCard
      index={index}
      title={subject.name_ru}
      subtitle={subject.type_label}
      description={localizedField(subject, 'description')}
      placeholderIcon={Building2}
      placeholderColor={color}
      imageUrl={subject.image_url}
      badges={[
        { label: subject.country, color: '#60a5fa' },
        { label: subject.type_label, color },
        ...(subject.partnerships && subject.partnerships.length > 0
          ? [{ label: `${subject.partnerships.length} партнёр${subject.partnerships.length === 1 ? '' : subject.partnerships.length < 5 ? 'а' : 'ов'}`, color: '#a78bfa' }]
          : []),
      ]}
      specs={[
        ...(subject.staff_count ? [{ label: 'Сотрудников', value: fmtNumber(subject.staff_count) }] : []),
        ...(subject.budget_annual ? [{ label: 'Бюджет', value: fmtBudget(subject.budget_annual) }] : []),
        ...(subject.founded_year ? [{ label: 'Основан', value: String(subject.founded_year) }] : []),
      ].slice(0, 3)}
      onClick={onClick}
    />
  );
}

// ─── Organization Row (List) ────────────────────────────────

function OrgRow({
  subject,
  onClick,
  index,
}: {
  subject: PlatformSubject;
  onClick: () => void;
  index: number;
}) {
  const color = getSubjectColor(subject.type);
  const initials = getInitials(subject.name_ru);

  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      whileHover={{ x: 4 }}
      onClick={onClick}
      className="flex items-center gap-3 sm:gap-4 rounded-xl px-3 sm:px-4 py-3 cursor-pointer group transition-all duration-200"
      style={{
        background: 'rgba(0,22,52,0.55)',
        border: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      {/* Avatar */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold"
        style={{
          background: `${color}12`,
          border: `1px solid ${color}25`,
          color,
        }}
      >
        {initials}
      </div>

      {/* Name + type */}
      <div className="flex-1 min-w-0">
        <h3 className="text-white font-semibold text-sm truncate group-hover:text-cyan-300 transition-colors">
          {subject.name_ru}
        </h3>
        <div className="flex items-center gap-2 mt-0.5">
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-md font-medium"
            style={{ background: `${color}10`, color }}
          >
            {subject.type_label}
          </span>
          {subject.location && (
            <span className="flex items-center gap-1 text-[10px] text-white/25">
              <MapPin size={8} />
              {subject.location}
            </span>
          )}
        </div>
      </div>

      {/* Country */}
      <div className="hidden sm:flex items-center gap-1 text-xs text-white/30 shrink-0">
        <Globe size={10} />
        {subject.country}
      </div>

      {/* Staff */}
      {subject.staff_count ? (
        <div className="hidden md:flex items-center gap-1 text-xs text-white/30 shrink-0 w-20 justify-end">
          <Users size={10} />
          {fmtNumber(subject.staff_count)}
        </div>
      ) : (
        <div className="hidden md:block w-20" />
      )}

      {/* Budget */}
      <div className="text-right shrink-0 w-20">
        {subject.budget_annual ? (
          <span className="text-xs font-semibold" style={{ color }}>
            {fmtBudget(subject.budget_annual)}
          </span>
        ) : (
          <span className="text-xs text-white/15">--</span>
        )}
      </div>
    </motion.div>
  );
}

// ─── Partnerships Section ───────────────────────────────────

function PartnershipsSection({ allSubjects }: { allSubjects: PlatformSubject[] }) {
  const subjectsWithPartnerships = allSubjects.filter(
    (s) => s.partnerships && s.partnerships.length > 0
  );

  if (subjectsWithPartnerships.length === 0) return null;

  // Build unique partnership pairs
  const pairs: { from: PlatformSubject; to: PlatformSubject }[] = [];
  const seen = new Set<string>();

  subjectsWithPartnerships.forEach((subj) => {
    subj.partnerships?.forEach((partnerId) => {
      const pairKey = [subj.id, partnerId].sort().join('|');
      if (seen.has(pairKey)) return;
      seen.add(pairKey);
      const partner = getSubjectById(partnerId);
      if (partner) {
        pairs.push({ from: subj, to: partner });
      }
    });
  });

  if (pairs.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mt-8 rounded-2xl p-5"
      style={{
        background: 'linear-gradient(145deg, rgba(0,22,52,0.7), rgba(0,38,80,0.4))',
        border: '1px solid rgba(167,139,250,0.12)',
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.2)' }}
        >
          <Handshake size={14} style={{ color: '#a78bfa' }} />
        </div>
        <h2 className="text-white font-bold text-base">Партнёрства</h2>
        <span className="text-white/25 text-xs ml-1">({pairs.length} связей)</span>
      </div>

      <div className="space-y-2">
        {pairs.map(({ from, to }) => {
          const fromColor = getSubjectColor(from.type);
          const toColor = getSubjectColor(to.type);

          return (
            <div
              key={`${from.id}-${to.id}`}
              className="flex items-center gap-2 sm:gap-3 rounded-xl px-3 py-2.5"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              {/* From */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-[9px] font-bold"
                  style={{ background: `${fromColor}12`, color: fromColor, border: `1px solid ${fromColor}22` }}
                >
                  {getInitials(from.name_ru)}
                </div>
                <span className="text-white/70 text-xs truncate">{from.name_ru}</span>
              </div>

              {/* Connector line */}
              <div className="flex items-center gap-1 shrink-0">
                <div className="w-6 sm:w-10 h-px" style={{ background: 'linear-gradient(90deg, rgba(167,139,250,0.3), rgba(0,230,200,0.3))' }} />
                <Handshake size={10} className="text-white/15" />
                <div className="w-6 sm:w-10 h-px" style={{ background: 'linear-gradient(90deg, rgba(0,230,200,0.3), rgba(167,139,250,0.3))' }} />
              </div>

              {/* To */}
              <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                <span className="text-white/70 text-xs truncate text-right">{to.name_ru}</span>
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-[9px] font-bold"
                  style={{ background: `${toColor}12`, color: toColor, border: `1px solid ${toColor}22` }}
                >
                  {getInitials(to.name_ru)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── Main Component ─────────────────────────────────────────

export default function CommunityPage() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch from Supabase + merge with hardcoded
  const { subjects: allSubjects, hardcodedCount, supabaseCount, loading: sbLoading, error: sbError } = useSupabaseCommunity();

  // Extract unique type_labels and countries
  const typeLabels = useMemo(() => {
    const set = new Set(allSubjects.map((s) => s.type_label));
    return Array.from(set).sort();
  }, [allSubjects]);

  const countries = useMemo(() => {
    const set = new Set(allSubjects.map((s) => s.country));
    return Array.from(set).sort();
  }, [allSubjects]);

  // Filtered subjects
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allSubjects.filter((s) => {
      // Search match
      const matchSearch =
        !q ||
        s.name_ru.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q)) ||
        (s.location ?? '').toLowerCase().includes(q) ||
        s.country.toLowerCase().includes(q) ||
        s.type_label.toLowerCase().includes(q);
      // Type filter
      const matchType = typeFilter === 'all' || s.type_label === typeFilter;
      // Country filter
      const matchCountry = countryFilter === 'all' || s.country === countryFilter;
      return matchSearch && matchType && matchCountry;
    });
  }, [search, typeFilter, countryFilter, allSubjects]);

  return (
    <div
      className="min-h-screen flex flex-col"
    >
      {/* ── Header ─────────────────────────────────────────── */}
      <div
        className="sticky top-0 z-30 border-b"
        style={{
          background: 'rgba(0,6,20,0.92)',
          backdropFilter: 'blur(20px)',
          borderColor: 'rgba(0,200,230,0.08)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          {/* Back + Title */}
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setLocation('/hub')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white/50 hover:text-white text-xs transition-colors cursor-pointer"
              style={{
                background: 'rgba(0,20,50,0.7)',
                border: '1px solid rgba(0,200,230,0.14)',
              }}
            >
              <ArrowLeft size={14} />
              Назад
            </button>
            <div className="flex-1">
              <motion.h1
                className="text-xl sm:text-2xl font-black text-white"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                Экосистема участников
              </motion.h1>
              <motion.p
                className="text-white/30 text-xs sm:text-sm mt-0.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                Государственные органы, корпорации и международные организации
              </motion.p>
            </div>

            {/* View toggle */}
            <div
              className="flex rounded-xl overflow-hidden shrink-0"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <button
                onClick={() => setViewMode('grid')}
                className="px-3 py-2 transition-all cursor-pointer"
                style={
                  viewMode === 'grid'
                    ? { background: 'rgba(0,230,200,0.12)', color: '#00e6c8' }
                    : { color: 'rgba(255,255,255,0.3)' }
                }
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className="px-3 py-2 transition-all cursor-pointer"
                style={
                  viewMode === 'list'
                    ? { background: 'rgba(0,230,200,0.12)', color: '#00e6c8' }
                    : { color: 'rgba(255,255,255,0.3)' }
                }
              >
                <List size={16} />
              </button>
            </div>
          </div>

          {/* Search + filter toggle */}
          <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск по названию, описанию, тегам..."
                className="w-full h-10 pl-9 pr-8 rounded-xl bg-transparent text-sm text-white placeholder-white/20 outline-none transition"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(0,230,200,0.12)',
                }}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                >
                  <X size={12} className="text-white/40 hover:text-white" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 px-3 h-10 rounded-xl text-xs font-medium transition-all cursor-pointer shrink-0"
              style={
                showFilters || typeFilter !== 'all' || countryFilter !== 'all'
                  ? { background: 'rgba(0,230,200,0.12)', color: '#00e6c8', border: '1px solid rgba(0,230,200,0.25)' }
                  : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }
              }
            >
              <Filter size={13} />
              <span className="hidden sm:inline">Фильтры</span>
              <ChevronDown
                size={12}
                className="transition-transform"
                style={{ transform: showFilters ? 'rotate(180deg)' : undefined }}
              />
            </button>
          </div>

          {/* Filters panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pb-3 space-y-2">
                  {/* Type filter chips */}
                  <div>
                    <span className="text-white/25 text-[10px] uppercase tracking-wider mb-1.5 block">
                      Тип организации
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => setTypeFilter('all')}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer"
                        style={
                          typeFilter === 'all'
                            ? { background: 'rgba(0,230,200,0.15)', color: '#00e6c8', border: '1px solid rgba(0,230,200,0.3)' }
                            : { background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.06)' }
                        }
                      >
                        Все типы
                      </button>
                      {typeLabels.map((label) => (
                        <button
                          key={label}
                          onClick={() => setTypeFilter(typeFilter === label ? 'all' : label)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer"
                          style={
                            typeFilter === label
                              ? { background: 'rgba(0,230,200,0.15)', color: '#00e6c8', border: '1px solid rgba(0,230,200,0.3)' }
                              : { background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.06)' }
                          }
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Country filter chips */}
                  <div>
                    <span className="text-white/25 text-[10px] uppercase tracking-wider mb-1.5 block">
                      Страна
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => setCountryFilter('all')}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer"
                        style={
                          countryFilter === 'all'
                            ? { background: 'rgba(96,165,250,0.15)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.3)' }
                            : { background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.06)' }
                        }
                      >
                        Все страны
                      </button>
                      {countries.map((country) => (
                        <button
                          key={country}
                          onClick={() => setCountryFilter(countryFilter === country ? 'all' : country)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer"
                          style={
                            countryFilter === country
                              ? { background: 'rgba(96,165,250,0.15)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.3)' }
                              : { background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.06)' }
                          }
                        >
                          {country}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Clear all */}
                  {(typeFilter !== 'all' || countryFilter !== 'all') && (
                    <button
                      onClick={() => {
                        setTypeFilter('all');
                        setCountryFilter('all');
                      }}
                      className="text-[11px] text-white/30 hover:text-white/60 transition cursor-pointer"
                    >
                      Сбросить фильтры
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results count */}
          <div className="flex items-center justify-between">
            <span className="text-white/25 text-xs">
              Показано: <span className="text-white/50 font-medium">{filtered.length}</span> из{' '}
              {allSubjects.length}{sbLoading && ' (загрузка...)'}{sbError && ' (ошибка загрузки)'}
            </span>
            {(typeFilter !== 'all' || countryFilter !== 'all') && (
              <div className="flex gap-1.5">
                {typeFilter !== 'all' && (
                  <span
                    className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full cursor-pointer"
                    style={{ background: 'rgba(0,230,200,0.1)', color: '#00e6c8', border: '1px solid rgba(0,230,200,0.2)' }}
                    onClick={() => setTypeFilter('all')}
                  >
                    {typeFilter}
                    <X size={8} />
                  </span>
                )}
                {countryFilter !== 'all' && (
                  <span
                    className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full cursor-pointer"
                    style={{ background: 'rgba(96,165,250,0.1)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.2)' }}
                    onClick={() => setCountryFilter('all')}
                  >
                    {countryFilter}
                    <X size={8} />
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────── */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        {/* Stats */}
        <StatsBar subjects={filtered} />

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Search size={40} className="mx-auto mb-3 text-white/10" />
            <p className="text-white/30 text-sm">Организации не найдены</p>
            <p className="text-white/15 text-xs mt-1">Попробуйте изменить фильтры или поисковый запрос</p>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid view */
          <AnimatePresence mode="wait">
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {filtered.map((subject, i) => (
                <OrgCard
                  key={subject.id}
                  subject={subject}
                  index={i}
                  onClick={() => setLocation(`/hub/subject/${subject.id}`)}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        ) : (
          /* List view */
          <AnimatePresence mode="wait">
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              {/* List header */}
              <div
                className="hidden sm:flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-2 text-[10px] uppercase tracking-wider text-white/20"
              >
                <div className="w-10" />
                <div className="flex-1">Организация</div>
                <div className="hidden sm:block w-24">Страна</div>
                <div className="hidden md:block w-20 text-right">Персонал</div>
                <div className="w-20 text-right">Бюджет</div>
              </div>
              {filtered.map((subject, i) => (
                <OrgRow
                  key={subject.id}
                  subject={subject}
                  index={i}
                  onClick={() => setLocation(`/hub/subject/${subject.id}`)}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Partnerships section */}
        <PartnershipsSection allSubjects={allSubjects} />
      </div>
    </div>
  );
}
