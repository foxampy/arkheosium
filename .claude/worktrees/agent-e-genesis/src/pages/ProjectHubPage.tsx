import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Droplets, Building2, FolderOpen, FlaskConical, CheckCircle,
  Search, ChevronRight, Loader2, X, MapPin, Calendar, Beaker, Users2,
} from 'lucide-react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { OBJECTS_DATA } from '@/data/objects-data';
import { SUBJECTS_DATA } from '@/data/subjects-data';
import { PROJECTS_DATA, PROJECT_STATUS_COLORS } from '@/data/projects-data';
import { useSupabaseHubData } from '@/hooks/useSupabaseHubData';
import { COMPLETED_PROJECTS, getCompletedProjectColor, getCountryFlag, type CompletedProject } from '@/data/completed-projects-data';
import ProductCard from '@/components/ProductCard';

// R&D data (inline for simplicity)
const RD_ITEMS = [
  { id: 'rd-1', name: 'IoT мониторинг водных ресурсов', status: 'В разработке', category: 'Технологии', budget: '$2.1M', color: '#22d3ee' },
  { id: 'rd-2', name: 'AI-прогнозирование паводков', status: 'Пилот', category: 'ИИ', budget: '$1.8M', color: '#a78bfa' },
  { id: 'rd-3', name: 'Биоочистка сточных вод', status: 'Исследование', category: 'Экология', budget: '$3.2M', color: '#4ade80' },
  { id: 'rd-4', name: 'Опреснение солёных водоёмов', status: 'Концепция', category: 'Инженерия', budget: '$5.0M', color: '#fbbf24' },
  { id: 'rd-5', name: 'Капельное орошение нового поколения', status: 'Тестирование', category: 'Агротех', budget: '$1.5M', color: '#f97316' },
];

type TabKey = 'objects' | 'subjects' | 'projects' | 'rd' | 'completed';

export default function ProjectHubPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('objects');
  const [search, setSearch] = useState('');
  const [completedCountry, setCompletedCountry] = useState('');
  const [selectedCompleted, setSelectedCompleted] = useState<CompletedProject | null>(null);
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  const { objects: sbObjects, subjects: sbSubjects, projects: sbProjects, loading: sbLoading } = useSupabaseHubData();

  // Merge hardcoded + Supabase, deduplicate by name
  const mergedObjects = useMemo(() => {
    const hardcoded = OBJECTS_DATA.map((o: any) => ({ ...o, source: 'hardcoded' }));
    const hardcodedNames = new Set(hardcoded.map((o: any) => (o.nameRu || o.name || '').toLowerCase()));
    const unique = sbObjects.filter((o) => !hardcodedNames.has(o.nameRu.toLowerCase()));
    return [...hardcoded, ...unique];
  }, [sbObjects]);

  const mergedSubjects = useMemo(() => {
    const hardcoded = SUBJECTS_DATA.map((s: any) => ({ ...s, source: 'hardcoded' }));
    const hardcodedNames = new Set(hardcoded.map((s: any) => (s.nameRu || s.name || '').toLowerCase()));
    const unique = sbSubjects.filter((s) => !hardcodedNames.has(s.nameRu.toLowerCase()));
    return [...hardcoded, ...unique];
  }, [sbSubjects]);

  const mergedProjects = useMemo(() => {
    const hardcoded = PROJECTS_DATA.map((p: any) => ({ ...p, source: 'hardcoded' }));
    const hardcodedNames = new Set(hardcoded.map((p: any) => (p.nameRu || p.name || '').toLowerCase()));
    const unique = sbProjects.filter((p) => !hardcodedNames.has(p.nameRu.toLowerCase()));
    return [...hardcoded, ...unique];
  }, [sbProjects]);

  // Tab config with dynamic counts
  const TABS: { key: TabKey; labelKey: string; icon: typeof Droplets; color: string; count: number }[] = [
    { key: 'objects',   labelKey: 'hub.tab_objects',   icon: Droplets,      color: '#06b6d4', count: mergedObjects.length },
    { key: 'subjects',  labelKey: 'hub.tab_subjects',  icon: Building2,     color: '#a78bfa', count: mergedSubjects.length },
    { key: 'projects',  labelKey: 'hub.tab_projects',  icon: FolderOpen,    color: '#4ade80', count: mergedProjects.length },
    { key: 'rd',        labelKey: 'hub.tab_rd',        icon: FlaskConical,  color: '#fbbf24', count: RD_ITEMS.length },
    { key: 'completed', labelKey: 'hub.tab_completed', icon: CheckCircle,   color: '#22c55e', count: COMPLETED_PROJECTS.length },
  ];

  const filteredObjects = useMemo(() => {
    const q = search.toLowerCase();
    return mergedObjects.filter((o: any) =>
      !q || o.nameRu?.toLowerCase().includes(q) || o.name?.toLowerCase().includes(q) || o.type?.toLowerCase().includes(q)
    ).sort((a: any, b: any) => {
      const aH = a.source === 'hardcoded' ? 1 : 0;
      const bH = b.source === 'hardcoded' ? 1 : 0;
      if (bH !== aH) return bH - aH;
      const priorityIds = ['charvakoye', 'shirin'];
      const aP = priorityIds.some((p: string) => a.id?.includes(p)) ? 1 : 0;
      const bP = priorityIds.some((p: string) => b.id?.includes(p)) ? 1 : 0;
      if (bP !== aP) return bP - aP;
      return (b.description?.length || 0) - (a.description?.length || 0);
    });
  }, [search, mergedObjects]);

  const filteredSubjects = useMemo(() => {
    const q = search.toLowerCase();
    return mergedSubjects.filter((s: any) =>
      !q || s.name?.toLowerCase().includes(q) || s.nameRu?.toLowerCase().includes(q) || s.type?.toLowerCase().includes(q)
    ).sort((a: any, b: any) => {
      const aH = a.source === 'hardcoded' ? 1 : 0;
      const bH = b.source === 'hardcoded' ? 1 : 0;
      if (bH !== aH) return bH - aH;
      return (b.description?.length || 0) - (a.description?.length || 0);
    });
  }, [search, mergedSubjects]);

  const filteredProjects = useMemo(() => {
    const q = search.toLowerCase();
    return mergedProjects.filter((p: any) =>
      !q || p.nameRu?.toLowerCase().includes(q) || p.name?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q)
    ).sort((a: any, b: any) => {
      const aH = a.source === 'hardcoded' ? 1 : 0;
      const bH = b.source === 'hardcoded' ? 1 : 0;
      if (bH !== aH) return bH - aH;
      const priorityIds = ['shirin', 'vodprom-shirin'];
      const aP = priorityIds.some((p: string) => a.id?.includes(p)) ? 1 : 0;
      const bP = priorityIds.some((p: string) => b.id?.includes(p)) ? 1 : 0;
      if (bP !== aP) return bP - aP;
      const aBudget = (a.budget || a.investment_potential) ? 1 : 0;
      const bBudget = (b.budget || b.investment_potential) ? 1 : 0;
      if (bBudget !== aBudget) return bBudget - aBudget;
      return (b.description?.length || 0) - (a.description?.length || 0);
    });
  }, [search, mergedProjects]);

  const filteredRD = useMemo(() => {
    const q = search.toLowerCase();
    return RD_ITEMS.filter((r) => !q || r.name.toLowerCase().includes(q) || r.category.toLowerCase().includes(q));
  }, [search]);

  const completedCountries = useMemo(() => {
    const countries = Array.from(new Set(COMPLETED_PROJECTS.map((p) => p.country)));
    return countries.sort();
  }, []);

  const filteredCompleted = useMemo(() => {
    const q = search.toLowerCase();
    return COMPLETED_PROJECTS.filter((p) => {
      const matchesSearch = !q ||
        p.name_ru.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.client.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.country.toLowerCase().includes(q);
      const matchesCountry = !completedCountry || p.country === completedCountry;
      return matchesSearch && matchesCountry;
    });
  }, [search, completedCountry]);

  return (
    <div className="min-h-screen pt-14 pb-8">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <motion.h1
          className="text-2xl sm:text-3xl font-black text-white mb-1"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {t('hub.title')}
        </motion.h1>
        <p className="text-white/35 text-sm mb-5">
          {t('hub.subtitle')}
          {sbLoading && <Loader2 className="inline w-3 h-3 ml-2 animate-spin text-cyan-400/50" />}
        </p>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
          <input
            type="text"
            placeholder={t('hub.search_placeholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-xl bg-white/5 border border-white/8 text-sm text-white placeholder-white/20 outline-none focus:border-cyan-500/40 transition"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setSearch(''); setCompletedCountry(''); }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition shrink-0
                  ${isActive ? 'text-white' : 'text-white/40 hover:text-white/60'}`}
                style={isActive ? {
                  background: `${tab.color}15`,
                  border: `1px solid ${tab.color}30`,
                } : { background: 'rgba(255,255,255,0.03)', border: '1px solid transparent' }}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: isActive ? tab.color : undefined }} />
                {t(tab.labelKey)}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/10' : 'bg-white/5'}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Objects */}
            {activeTab === 'objects' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredObjects.map((obj: any, i: number) => {
                  const investFmt = obj.investment_potential
                    ? obj.investment_potential >= 1_000_000
                      ? '$' + (obj.investment_potential / 1_000_000).toFixed(1) + 'M'
                      : obj.investment_potential >= 1_000
                        ? '$' + (obj.investment_potential / 1_000).toFixed(0) + 'K'
                        : '$' + obj.investment_potential
                    : null;
                  return (
                    <ProductCard
                      key={obj.id}
                      index={i}
                      title={obj.nameRu || obj.name}
                      subtitle={obj.type_label || obj.type}
                      description={obj.description}
                      placeholderIcon={Droplets}
                      placeholderColor="#06b6d4"
                      imageUrl={obj.image_url}
                      badges={[
                        ...(obj.country ? [{ label: `${getCountryFlag(obj.country)} ${obj.country}`, color: '#60a5fa' }] : []),
                        ...(obj.type_label ? [{ label: obj.type_label, color: '#06b6d4' }] : []),
                      ]}
                      specs={[
                        ...(investFmt ? [{ label: t('hub.spec_investments'), value: investFmt }] : []),
                        ...(obj.capacity ? [{ label: obj.capacity_unit || t('hub.spec_capacity'), value: obj.capacity.toLocaleString('ru-RU') }] : []),
                        ...(obj.efficiency != null ? [{ label: t('hub.spec_efficiency'), value: `${obj.efficiency}%` }] : []),
                      ].slice(0, 3)}
                      imageOverlay={obj.source === 'supabase' ? (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400/80 backdrop-blur-sm">БД</span>
                      ) : undefined}
                      onClick={() => setLocation(`/hub/object/${obj.id}`)}
                    />
                  );
                })}
              </div>
            )}

            {/* Subjects */}
            {activeTab === 'subjects' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSubjects.map((subj: any, i: number) => {
                  const budgetFmt = subj.budget_annual
                    ? subj.budget_annual >= 1_000_000_000
                      ? '$' + (subj.budget_annual / 1_000_000_000).toFixed(1) + 'B'
                      : subj.budget_annual >= 1_000_000
                        ? '$' + (subj.budget_annual / 1_000_000).toFixed(0) + 'M'
                        : subj.budget_annual >= 1_000
                          ? '$' + (subj.budget_annual / 1_000).toFixed(0) + 'K'
                          : '$' + subj.budget_annual
                    : null;
                  return (
                    <ProductCard
                      key={subj.id}
                      index={i}
                      title={subj.nameRu || subj.name || subj.name_ru}
                      subtitle={subj.type_label || subj.type}
                      description={subj.description}
                      placeholderIcon={Building2}
                      placeholderColor="#a78bfa"
                      imageUrl={subj.image_url}
                      badges={[
                        ...(subj.country ? [{ label: `${getCountryFlag(subj.country)} ${subj.country}`, color: '#60a5fa' }] : []),
                        ...(subj.type_label ? [{ label: subj.type_label, color: '#a78bfa' }] : []),
                      ]}
                      specs={[
                        ...(subj.staff_count ? [{ label: t('hub.spec_staff'), value: subj.staff_count.toLocaleString('ru-RU') }] : []),
                        ...(budgetFmt ? [{ label: t('hub.spec_budget'), value: budgetFmt }] : []),
                      ]}
                      imageOverlay={subj.source === 'supabase' ? (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-400/80 backdrop-blur-sm">БД</span>
                      ) : undefined}
                      onClick={() => setLocation(`/hub/subject/${subj.id}`)}
                    />
                  );
                })}
              </div>
            )}

            {/* Projects */}
            {activeTab === 'projects' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProjects.map((proj: any, i: number) => {
                  const color = proj.color || '#4ade80';
                  const budgetVal = proj.budget || proj.budget_total || proj.investment_potential;
                  const budgetFmt = budgetVal
                    ? budgetVal >= 1_000_000_000
                      ? '$' + (budgetVal / 1_000_000_000).toFixed(1) + 'B'
                      : budgetVal >= 1_000_000
                        ? '$' + (budgetVal / 1_000_000).toFixed(1) + 'M'
                        : budgetVal >= 1_000
                          ? '$' + (budgetVal / 1_000).toFixed(0) + 'K'
                          : '$' + budgetVal
                    : (typeof proj.budget === 'string' ? proj.budget : null);
                  const statusInfo = PROJECT_STATUS_COLORS[proj.status];
                  return (
                    <ProductCard
                      key={proj.id}
                      index={i}
                      title={proj.nameRu || proj.name || proj.name_ru}
                      subtitle={proj.category || proj.type_label || proj.type}
                      description={proj.description}
                      placeholderIcon={FolderOpen}
                      placeholderColor={color}
                      imageUrl={proj.image_url}
                      badges={[
                        ...(proj.country ? [{ label: `${getCountryFlag(proj.country)} ${proj.country}`, color: '#60a5fa' }] : []),
                        ...(statusInfo ? [{ label: statusInfo.label, color: statusInfo.color }] : []),
                      ]}
                      specs={[
                        ...(budgetFmt ? [{ label: t('hub.spec_budget'), value: budgetFmt }] : []),
                        ...(proj.expected_irr != null ? [{ label: 'IRR', value: `${proj.expected_irr}%` }] : []),
                      ]}
                      imageOverlay={proj.source === 'supabase' ? (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-400/80 backdrop-blur-sm">БД</span>
                      ) : undefined}
                      onClick={() => setLocation(`/hub/project/${proj.id}`)}
                    />
                  );
                })}
              </div>
            )}

            {/* R&D */}
            {activeTab === 'rd' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredRD.map((rd, i) => (
                    <ProductCard
                      key={rd.id}
                      index={i}
                      title={rd.name}
                      description={`${rd.category}`}
                      placeholderIcon={FlaskConical}
                      placeholderColor={rd.color}
                      badges={[
                        { label: rd.status, color: rd.color },
                        { label: rd.category, color: '#94a3b8' },
                      ]}
                      specs={[
                        { label: t('hub.spec_budget'), value: rd.budget },
                      ]}
                      onClick={() => setLocation('/rd')}
                    />
                  ))}
                </div>
                {filteredRD.length > 0 && (
                  <button
                    onClick={() => setLocation('/rd')}
                    className="w-full mt-4 py-3 rounded-xl text-sm font-semibold text-amber-400/80 hover:text-amber-300 hover:bg-amber-400/5 border border-amber-400/10 hover:border-amber-400/20 transition"
                  >
                    {t('hub.view_all_rd')}
                  </button>
                )}
              </>
            )}

            {/* Completed Projects */}
            {activeTab === 'completed' && (
              <>
                {/* Country filter */}
                <div className="mb-4">
                  <select
                    value={completedCountry}
                    onChange={(e) => setCompletedCountry(e.target.value)}
                    className="h-9 px-3 rounded-xl bg-white/5 border border-white/8 text-xs text-white outline-none focus:border-green-500/40 transition appearance-none cursor-pointer"
                    style={{ backgroundImage: 'none' }}
                  >
                    <option value="" className="bg-slate-900 text-white">{t('hub.all_countries')}</option>
                    {completedCountries.map((c) => (
                      <option key={c} value={c} className="bg-slate-900 text-white">
                        {getCountryFlag(c)} {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCompleted.map((proj, i) => {
                    const color = getCompletedProjectColor();
                    const capacityFormatted = proj.capacity_m3_day
                      ? proj.capacity_m3_day.toLocaleString('ru-RU') + ' ' + t('hub.m3_per_day')
                      : null;
                    const investmentFormatted = proj.investment_usd
                      ? '$' + (proj.investment_usd >= 1_000_000
                          ? (proj.investment_usd / 1_000_000).toFixed(1) + 'M'
                          : proj.investment_usd >= 1_000
                            ? (proj.investment_usd / 1_000).toFixed(0) + 'K'
                            : proj.investment_usd.toString())
                      : null;
                    return (
                      <ProductCard
                        key={proj.id}
                        index={i}
                        title={proj.name_ru}
                        subtitle={`${proj.year} · ${proj.client}`}
                        description={proj.description}
                        placeholderIcon={CheckCircle}
                        placeholderColor={color}
                        badges={[
                          { label: `${getCountryFlag(proj.country)} ${proj.country}`, color: '#60a5fa' },
                          { label: `${proj.year}`, color },
                          ...proj.technology.slice(0, 2).map((tech) => ({ label: tech, color: '#94a3b8' })),
                        ]}
                        specs={[
                          ...(capacityFormatted ? [{ label: t('hub.spec_capacity'), value: capacityFormatted }] : []),
                          ...(investmentFormatted ? [{ label: t('hub.investments_label'), value: investmentFormatted }] : []),
                        ]}
                        onClick={() => setSelectedCompleted(proj)}
                      />
                    );
                  })}
                </div>
              </>
            )}

            {/* Empty state */}
            {((activeTab === 'objects' && filteredObjects.length === 0) ||
              (activeTab === 'subjects' && filteredSubjects.length === 0) ||
              (activeTab === 'projects' && filteredProjects.length === 0) ||
              (activeTab === 'rd' && filteredRD.length === 0) ||
              (activeTab === 'completed' && filteredCompleted.length === 0)) && (
              <div className="text-center py-16">
                <Search className="w-10 h-10 text-white/10 mx-auto mb-3" />
                <p className="text-sm text-white/30">{t('hub.empty')}</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Completed Project Detail Panel */}
      <AnimatePresence>
        {selectedCompleted && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[600] bg-black/60"
              onClick={() => setSelectedCompleted(null)}
            />

            {/* Slide-in panel */}
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 z-[610] w-full sm:w-[420px] overflow-y-auto"
              style={{
                background: 'linear-gradient(145deg, rgba(0,10,30,0.99), rgba(0,18,50,0.97))',
                borderLeft: `1px solid ${getCompletedProjectColor()}25`,
                boxShadow: `-8px 0 40px rgba(0,0,0,0.5), 0 0 60px ${getCompletedProjectColor()}10`,
                backdropFilter: 'blur(24px)',
              }}
            >
              {/* Top accent bar */}
              <div
                className="h-1 w-full"
                style={{ background: `linear-gradient(90deg, ${getCompletedProjectColor()}, ${getCompletedProjectColor()}60)` }}
              />

              {/* Close button */}
              <button
                onClick={() => setSelectedCompleted(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-colors text-white/60 hover:text-white z-10"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
              >
                <X size={16} />
              </button>

              <div className="p-5 pt-6 space-y-5">
                {/* Header: icon + name + year */}
                <div className="flex items-start gap-3 pr-10">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: `${getCompletedProjectColor()}15`, border: `1px solid ${getCompletedProjectColor()}25` }}
                  >
                    <CheckCircle className="w-5 h-5" style={{ color: getCompletedProjectColor() }} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg font-bold text-white leading-tight">{selectedCompleted.name_ru}</h2>
                    <p className="text-xs text-white/40 mt-1">{selectedCompleted.name_en}</p>
                  </div>
                </div>

                {/* Quick info badges */}
                <div className="flex flex-wrap gap-2">
                  <span
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-medium"
                    style={{ background: `${getCompletedProjectColor()}15`, color: getCompletedProjectColor() }}
                  >
                    <Calendar className="w-3 h-3" />
                    {selectedCompleted.year}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-medium bg-white/5 text-white/60">
                    <MapPin className="w-3 h-3" />
                    {getCountryFlag(selectedCompleted.country)} {selectedCompleted.city}, {selectedCompleted.country}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-medium bg-white/5 text-white/60">
                    <Users2 className="w-3 h-3" />
                    {selectedCompleted.client}
                  </span>
                </div>

                {/* Key metrics */}
                {(selectedCompleted.capacity_m3_day || selectedCompleted.investment_usd) && (
                  <div className="grid grid-cols-2 gap-3">
                    {selectedCompleted.capacity_m3_day && (
                      <div
                        className="rounded-xl p-3"
                        style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.15)' }}
                      >
                        <p className="text-lg font-bold text-cyan-400">
                          {selectedCompleted.capacity_m3_day.toLocaleString('ru-RU')}
                        </p>
                        <p className="text-[10px] text-white/40 mt-0.5">{t('hub.m3_per_day')}</p>
                      </div>
                    )}
                    {selectedCompleted.investment_usd && (
                      <div
                        className="rounded-xl p-3"
                        style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.15)' }}
                      >
                        <p className="text-lg font-bold text-amber-400">
                          ${selectedCompleted.investment_usd >= 1_000_000
                            ? (selectedCompleted.investment_usd / 1_000_000).toFixed(1) + 'M'
                            : selectedCompleted.investment_usd >= 1_000
                              ? (selectedCompleted.investment_usd / 1_000).toFixed(0) + 'K'
                              : selectedCompleted.investment_usd.toString()}
                        </p>
                        <p className="text-[10px] text-white/40 mt-0.5">{t('hub.investments_label')}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Description */}
                <div>
                  <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">{t('hub.detail_description')}</h3>
                  <p className="text-sm text-white/70 leading-relaxed">{selectedCompleted.description}</p>
                </div>

                {/* Technology */}
                {selectedCompleted.technology.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">{t('hub.detail_technology')}</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCompleted.technology.map((tech) => (
                        <span
                          key={tech}
                          className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-white/5 text-white/50 border border-white/5"
                        >
                          <Beaker className="w-3 h-3 text-blue-400/60" />
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Project type */}
                <div>
                  <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">{t('hub.detail_project_type')}</h3>
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-white/5 text-white/50">
                    {selectedCompleted.type === 'water_treatment' ? t('hub.type_water_treatment') :
                     selectedCompleted.type === 'industrial' ? t('hub.type_industrial') :
                     selectedCompleted.type === 'municipal' ? t('hub.type_municipal') :
                     selectedCompleted.type === 'food_beverage' ? t('hub.type_food_beverage') :
                     selectedCompleted.type === 'recreation' ? t('hub.type_recreation') :
                     selectedCompleted.type === 'energy' ? t('hub.type_energy') :
                     selectedCompleted.type === 'government' ? t('hub.type_government') :
                     selectedCompleted.type}
                  </span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
