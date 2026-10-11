import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ArrowLeft, Factory, GraduationCap, Rocket,
  Cpu, Wrench, FlaskConical, ExternalLink, Globe,
  MapPin, Tag, Filter, DollarSign, Loader2,
} from 'lucide-react';
import { useLocation } from 'wouter';
import {
  MANUFACTURERS,
  RESEARCH_INSTITUTES,
  STARTUPS,
} from '@/data/catalog-data';
import { useSupabaseCatalog } from '@/hooks/useSupabaseCatalog';
import ProductCard from '@/components/ProductCard';

type TabKey = 'manufacturers' | 'institutes' | 'startups' | 'technologies' | 'equipment' | 'rd';

const TAB_COLORS: Record<TabKey, string> = {
  manufacturers: '#00e6c8',
  institutes: '#60a5fa',
  startups: '#f472b6',
  technologies: '#fbbf24',
  equipment: '#a78bfa',
  rd: '#4ade80',
};

export default function CatalogPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabKey>('manufacturers');
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [manufacturerFilter, setManufacturerFilter] = useState('');
  const [, setLocation] = useLocation();

  // Supabase catalog data for technologies & equipment
  const catalog = useSupabaseCatalog();

  const TABS: { key: TabKey; label: string; icon: typeof Factory; color: string; count: number }[] = [
    { key: 'manufacturers', label: t('catalog.tab_manufacturers'), icon: Factory, color: TAB_COLORS.manufacturers, count: MANUFACTURERS.length },
    { key: 'institutes', label: t('catalog.tab_institutes'), icon: GraduationCap, color: TAB_COLORS.institutes, count: RESEARCH_INSTITUTES.length },
    { key: 'startups', label: t('catalog.tab_startups'), icon: Rocket, color: TAB_COLORS.startups, count: STARTUPS.length },
    { key: 'technologies', label: t('catalog.tab_technologies'), icon: Cpu, color: TAB_COLORS.technologies, count: catalog.technologies.length },
    { key: 'equipment', label: t('catalog.tab_equipment'), icon: Wrench, color: TAB_COLORS.equipment, count: catalog.equipment.length },
    { key: 'rd', label: 'R&D', icon: FlaskConical, color: TAB_COLORS.rd, count: 0 },
  ];

  /* ---------- available countries & categories per tab ---------- */
  const allCountries = useMemo(() => {
    const countries = new Set<string>();
    MANUFACTURERS.forEach((m) => countries.add(m.country));
    RESEARCH_INSTITUTES.forEach((i) => countries.add(i.country));
    STARTUPS.forEach((s) => countries.add(s.country));
    return Array.from(countries).sort();
  }, []);

  // Categories & manufacturers from Supabase
  const techCategories = useMemo(() => {
    const cats = new Set<string>();
    catalog.allItems
      .filter((i) => i.item_type === 'technology')
      .forEach((t) => { if (t.category) cats.add(t.category); });
    return Array.from(cats).sort();
  }, [catalog.allItems]);

  const equipCategories = useMemo(() => {
    const cats = new Set<string>();
    catalog.allItems
      .filter((i) => i.item_type === 'equipment')
      .forEach((e) => { if (e.category) cats.add(e.category); });
    return Array.from(cats).sort();
  }, [catalog.allItems]);

  const equipManufacturers = useMemo(() => {
    const mfrs = new Set<string>();
    catalog.allItems
      .filter((i) => i.item_type === 'equipment')
      .forEach((e) => { if (e.manufacturer) mfrs.add(e.manufacturer); });
    return Array.from(mfrs).sort();
  }, [catalog.allItems]);

  const equipCountries = useMemo(() => {
    const c = new Set<string>();
    catalog.allItems
      .filter((i) => i.item_type === 'equipment')
      .forEach((e) => { if (e.country_of_origin) c.add(e.country_of_origin); });
    return Array.from(c).sort();
  }, [catalog.allItems]);

  /* ---------- filtered lists (org tabs still hardcoded) ---------- */
  const filteredManufacturers = useMemo(() => {
    const q = search.toLowerCase();
    return MANUFACTURERS.filter((m) => {
      const matchSearch = !q ||
        m.name.toLowerCase().includes(q) ||
        m.country.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.specialization.some((s) => s.toLowerCase().includes(q));
      const matchCountry = !countryFilter || m.country === countryFilter;
      return matchSearch && matchCountry;
    });
  }, [search, countryFilter]);

  const filteredInstitutes = useMemo(() => {
    const q = search.toLowerCase();
    return RESEARCH_INSTITUTES.filter((i) => {
      const matchSearch = !q ||
        i.name.toLowerCase().includes(q) ||
        i.country.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.specialization.some((s) => s.toLowerCase().includes(q));
      const matchCountry = !countryFilter || i.country === countryFilter;
      return matchSearch && matchCountry;
    });
  }, [search, countryFilter]);

  const filteredStartups = useMemo(() => {
    const q = search.toLowerCase();
    return STARTUPS.filter((s) => {
      const matchSearch = !q ||
        s.name.toLowerCase().includes(q) ||
        s.country.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.specialization.some((sp) => sp.toLowerCase().includes(q));
      const matchCountry = !countryFilter || s.country === countryFilter;
      return matchSearch && matchCountry;
    });
  }, [search, countryFilter]);

  // Technologies & equipment filtered via Supabase hook
  const filteredTechnologies = useMemo(() => {
    const q = search.toLowerCase();
    return catalog.technologies.filter((t) => {
      const searchable = [t.name_ru, t.name_en, t.category, t.description, ...(t.applications || [])].join(' ').toLowerCase();
      const matchSearch = !q || searchable.includes(q);
      const matchCategory = !categoryFilter || t.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [catalog.technologies, search, categoryFilter]);

  const filteredEquipment = useMemo(() => {
    const q = search.toLowerCase();
    return catalog.equipment.filter((e) => {
      const searchable = [e.name_ru, e.name_en, e.category, e.manufacturer, e.description, ...(e.applications || [])].join(' ').toLowerCase();
      const matchSearch = !q || searchable.includes(q);
      const matchCategory = !categoryFilter || e.category === categoryFilter;
      const matchMfr = !manufacturerFilter || e.manufacturer === manufacturerFilter;
      const matchCountry = !countryFilter || e.country_of_origin === countryFilter;
      return matchSearch && matchCategory && matchMfr && matchCountry;
    });
  }, [catalog.equipment, search, categoryFilter, manufacturerFilter, countryFilter]);

  /* ---------- current list length for empty state ---------- */
  const currentLength: Record<TabKey, number> = {
    manufacturers: filteredManufacturers.length,
    institutes: filteredInstitutes.length,
    startups: filteredStartups.length,
    technologies: filteredTechnologies.length,
    equipment: filteredEquipment.length,
    rd: 0,
  };

  /* ---------- (render helpers removed — using ProductCard inline) ---------- */

  return (
    <div className="min-h-screen pt-14 pb-8">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        {/* Back button */}
        <button
          onClick={() => setLocation('/hub')}
          className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {t('catalog.back')}
        </button>

        <motion.h1
          className="text-2xl sm:text-3xl font-black text-white mb-1"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {t('catalog.title')}
        </motion.h1>
        <motion.p
          className="text-white/35 text-sm mb-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {t('catalog.subtitle')}
        </motion.p>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
          <input
            type="text"
            placeholder={t('catalog.search_placeholder')}
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
                onClick={() => {
                  if (tab.key === 'rd') {
                    setLocation('/rd');
                    return;
                  }
                  setActiveTab(tab.key);
                  setSearch('');
                  setCountryFilter('');
                  setCategoryFilter('');
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition shrink-0
                  ${isActive ? 'text-white' : 'text-white/40 hover:text-white/60'}`}
                style={
                  isActive
                    ? {
                        background: `${tab.color}15`,
                        border: `1px solid ${tab.color}30`,
                      }
                    : { background: 'rgba(255,255,255,0.03)', border: '1px solid transparent' }
                }
              >
                <Icon className="w-3.5 h-3.5" style={{ color: isActive ? tab.color : undefined }} />
                {tab.label}
                {tab.key !== 'rd' && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/10' : 'bg-white/5'}`}
                  >
                    {tab.count}
                  </span>
                )}
                {tab.key === 'rd' && (
                  <ExternalLink className="w-3 h-3 opacity-40" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter chips */}
      <div className="px-4 pb-3 space-y-2">
        {/* Country filter for org tabs */}
        {(activeTab === 'manufacturers' || activeTab === 'institutes' || activeTab === 'startups') && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] text-white/30 uppercase font-medium tracking-wider shrink-0">{t('catalog.country_label')}:</span>
            <button
              onClick={() => setCountryFilter('')}
              className={`text-[11px] px-2.5 py-1 rounded-lg transition ${!countryFilter ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' : 'bg-white/5 text-white/40 border border-transparent hover:text-white/60'}`}
            >
              {t('catalog.filter_all')}
            </button>
            {allCountries.map((c) => (
              <button
                key={c}
                onClick={() => setCountryFilter(countryFilter === c ? '' : c)}
                className={`text-[11px] px-2.5 py-1 rounded-lg transition ${countryFilter === c ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' : 'bg-white/5 text-white/40 border border-transparent hover:text-white/60'}`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {/* Category filter for technology tab */}
        {activeTab === 'technologies' && techCategories.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] text-white/30 uppercase font-medium tracking-wider shrink-0">{t('catalog.category_label')}:</span>
            <button
              onClick={() => setCategoryFilter('')}
              className={`text-[11px] px-2.5 py-1 rounded-lg transition ${!categoryFilter ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'bg-white/5 text-white/40 border border-transparent hover:text-white/60'}`}
            >
              {t('catalog.filter_all')}
            </button>
            {techCategories.map((c) => (
              <button
                key={c}
                onClick={() => setCategoryFilter(categoryFilter === c ? '' : c)}
                className={`text-[11px] px-2.5 py-1 rounded-lg transition ${categoryFilter === c ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'bg-white/5 text-white/40 border border-transparent hover:text-white/60'}`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {/* Equipment filters: category + manufacturer + country */}
        {activeTab === 'equipment' && (
          <>
            {equipCategories.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] text-white/30 uppercase font-medium tracking-wider shrink-0">{t('catalog.category_label')}:</span>
                <button
                  onClick={() => setCategoryFilter('')}
                  className={`text-[11px] px-2.5 py-1 rounded-lg transition ${!categoryFilter ? 'bg-violet-500/15 text-violet-400 border border-violet-500/30' : 'bg-white/5 text-white/40 border border-transparent hover:text-white/60'}`}
                >
                  {t('catalog.filter_all')}
                </button>
                {equipCategories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategoryFilter(categoryFilter === c ? '' : c)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg transition ${categoryFilter === c ? 'bg-violet-500/15 text-violet-400 border border-violet-500/30' : 'bg-white/5 text-white/40 border border-transparent hover:text-white/60'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
            {equipManufacturers.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] text-white/30 uppercase font-medium tracking-wider shrink-0">
                  <Factory className="w-3 h-3 inline mr-1" />{t('catalog.manufacturer_label')}:
                </span>
                <button
                  onClick={() => setManufacturerFilter('')}
                  className={`text-[11px] px-2.5 py-1 rounded-lg transition ${!manufacturerFilter ? 'bg-violet-500/15 text-violet-400 border border-violet-500/30' : 'bg-white/5 text-white/40 border border-transparent hover:text-white/60'}`}
                >
                  {t('catalog.filter_all')}
                </button>
                {equipManufacturers.map((m) => (
                  <button
                    key={m}
                    onClick={() => setManufacturerFilter(manufacturerFilter === m ? '' : m)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg transition ${manufacturerFilter === m ? 'bg-violet-500/15 text-violet-400 border border-violet-500/30' : 'bg-white/5 text-white/40 border border-transparent hover:text-white/60'}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}
            {equipCountries.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] text-white/30 uppercase font-medium tracking-wider shrink-0">
                  <Globe className="w-3 h-3 inline mr-1" />{t('catalog.country_label')}:
                </span>
                <button
                  onClick={() => setCountryFilter('')}
                  className={`text-[11px] px-2.5 py-1 rounded-lg transition ${!countryFilter ? 'bg-violet-500/15 text-violet-400 border border-violet-500/30' : 'bg-white/5 text-white/40 border border-transparent hover:text-white/60'}`}
                >
                  {t('catalog.filter_all')}
                </button>
                {equipCountries.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCountryFilter(countryFilter === c ? '' : c)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg transition ${countryFilter === c ? 'bg-violet-500/15 text-violet-400 border border-violet-500/30' : 'bg-white/5 text-white/40 border border-transparent hover:text-white/60'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* Loading indicator for Supabase data */}
        {(activeTab === 'technologies' || activeTab === 'equipment') && catalog.loading && (
          <div className="flex items-center gap-2 text-white/30 text-xs py-1">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            {t('catalog.loading')}
          </div>
        )}
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
            {/* Manufacturers */}
            {activeTab === 'manufacturers' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredManufacturers.map((m, i) => (
                  <a key={m.id} href={m.website} target="_blank" rel="noopener noreferrer" className="block">
                    <ProductCard
                      index={i}
                      title={m.name}
                      subtitle={m.country}
                      description={m.description}
                      placeholderIcon={Factory}
                      placeholderColor={TAB_COLORS.manufacturers}
                      badges={[
                        { label: m.country, color: '#60a5fa' },
                        ...m.specialization.slice(0, 2).map((s) => ({ label: s, color: TAB_COLORS.manufacturers })),
                      ]}
                      specs={[
                        { label: t('catalog.spec_founded'), value: String(m.founded_year) },
                        { label: t('catalog.spec_employees'), value: m.employees_range },
                      ]}
                    />
                  </a>
                ))}
              </div>
            )}

            {/* Institutes */}
            {activeTab === 'institutes' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredInstitutes.map((inst, i) => (
                  <a key={inst.id} href={inst.website} target="_blank" rel="noopener noreferrer" className="block">
                    <ProductCard
                      index={i}
                      title={inst.name}
                      subtitle={inst.country}
                      description={inst.description}
                      placeholderIcon={GraduationCap}
                      placeholderColor={TAB_COLORS.institutes}
                      badges={[
                        { label: inst.country, color: '#60a5fa' },
                        ...inst.specialization.slice(0, 2).map((s) => ({ label: s, color: TAB_COLORS.institutes })),
                      ]}
                      specs={[
                        { label: t('catalog.spec_founded'), value: String(inst.founded_year) },
                      ]}
                    />
                  </a>
                ))}
              </div>
            )}

            {/* Startups */}
            {activeTab === 'startups' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStartups.map((s, i) => (
                  <a key={s.id} href={s.website} target="_blank" rel="noopener noreferrer" className="block">
                    <ProductCard
                      index={i}
                      title={s.name}
                      subtitle={s.country}
                      description={s.description}
                      placeholderIcon={Rocket}
                      placeholderColor={TAB_COLORS.startups}
                      badges={[
                        { label: s.country, color: '#60a5fa' },
                        { label: s.funding, color: TAB_COLORS.startups },
                        ...s.specialization.slice(0, 1).map((sp) => ({ label: sp, color: '#94a3b8' })),
                      ]}
                      specs={[
                        { label: t('catalog.spec_founded'), value: String(s.founded_year) },
                        { label: t('catalog.spec_funding'), value: s.funding },
                      ]}
                    />
                  </a>
                ))}
              </div>
            )}

            {/* Technologies (from Supabase) */}
            {activeTab === 'technologies' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTechnologies.map((tech, i) => {
                  const ml = tech.maturity_level || '';
                  const maturityColor =
                    ml === 'commercial'
                      ? '#4ade80'
                      : ml.startsWith('TRL') && parseInt(ml.replace('TRL ', '')) >= 7
                        ? '#fbbf24'
                        : '#f97316';
                  const priceStr = tech.price_min && tech.price_max
                    ? `$${(tech.price_min / 1000).toFixed(0)}K — $${(tech.price_max / 1000).toFixed(0)}K`
                    : tech.price_min ? `from $${(tech.price_min / 1000).toFixed(0)}K` : null;
                  return (
                    <ProductCard
                      key={tech.id}
                      index={i}
                      title={tech.name_ru}
                      subtitle={tech.name_en}
                      description={tech.description}
                      imageUrl={tech.image_url || undefined}
                      placeholderIcon={Cpu}
                      placeholderColor={TAB_COLORS.technologies}
                      badges={[
                        { label: tech.category, color: TAB_COLORS.technologies },
                        { label: ml === 'commercial' ? 'Commercial' : ml || 'N/A', color: maturityColor },
                        ...(tech.applications || []).slice(0, 1).map((a) => ({ label: a, color: '#94a3b8' })),
                      ]}
                      specs={[
                        ...(priceStr ? [{ label: t('catalog.spec_price'), value: priceStr }] : []),
                        ...(tech.lifespan_years ? [{ label: t('catalog.spec_lifespan'), value: `${tech.lifespan_years} ${t('catalog.years')}` }] : []),
                      ]}
                      onClick={() => setLocation(`/catalog/technology/${tech.id}`)}
                    />
                  );
                })}
              </div>
            )}

            {/* Equipment (from Supabase) */}
            {activeTab === 'equipment' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEquipment.map((e, i) => {
                  const ml = e.maturity_level || '';
                  const maturityColor =
                    ml === 'commercial'
                      ? '#4ade80'
                      : ml.startsWith('TRL') && parseInt(ml.replace('TRL ', '')) >= 7
                        ? '#fbbf24'
                        : '#f97316';
                  const priceStr = e.price_min && e.price_max
                    ? `$${e.price_min.toLocaleString()} — $${e.price_max.toLocaleString()}`
                    : e.price_min ? `от $${e.price_min.toLocaleString()}` : null;
                  return (
                    <ProductCard
                      key={e.id}
                      index={i}
                      title={e.name_ru}
                      subtitle={`${e.manufacturer || ''} ${e.model_number ? `• ${e.model_number}` : ''}`}
                      description={e.description}
                      imageUrl={e.image_url || undefined}
                      placeholderIcon={Wrench}
                      placeholderColor={TAB_COLORS.equipment}
                      badges={[
                        { label: e.category, color: TAB_COLORS.equipment },
                        ...(e.manufacturer ? [{ label: e.manufacturer, color: '#00e6c8' }] : []),
                        ...(e.country_of_origin ? [{ label: e.country_of_origin, color: '#60a5fa' }] : []),
                      ]}
                      specs={[
                        ...(priceStr ? [{ label: t('catalog.spec_price'), value: priceStr }] : []),
                        ...(e.power_kw ? [{ label: t('catalog.spec_power'), value: `${e.power_kw} kW` }] : []),
                        ...(e.capacity_m3h ? [{ label: t('catalog.spec_capacity'), value: `${e.capacity_m3h} m³/h` }] : []),
                      ]}
                      onClick={() => setLocation(`/catalog/equipment/${e.id}`)}
                    />
                  );
                })}
              </div>
            )}

            {/* Empty state */}
            {activeTab !== 'rd' && currentLength[activeTab] === 0 && (
              <div className="text-center py-16">
                <Search className="w-10 h-10 text-white/10 mx-auto mb-3" />
                <p className="text-sm text-white/30">{t('catalog.empty')}</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
