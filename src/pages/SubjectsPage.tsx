import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building, MapPin, Search, X, ArrowRight, ChevronLeft,
  Users, Globe, Mail, Phone, ExternalLink, Shield, Landmark,
  Loader2, AlertCircle, ChevronLeft as PrevIcon, ChevronRight
} from "lucide-react";

// ─── DB interface matching `partnerships` table ───────────────
interface DBSubject {
  id: number;
  organization_name: string;
  contact_email?: string;
  partnership_type?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  latitude?: number;
  longitude?: number;
  country?: string;
  region?: string;
  organization_type?: string;
  website?: string;
  description?: string;
  employees_count?: number;
  annual_budget?: number;
  founded_year?: number;
}

// ─── Helpers ─────────────────────────────────────────────────
function fmt(n: number | undefined | null): string {
  if (!n) return "—";
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(0)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n}`;
}

function getOrgColor(type: string | undefined): string {
  const t = (type ?? "").toLowerCase();
  if (t.includes("government") || t.includes("ministry") || t.includes("agency")) return "#fbbf24";
  if (t.includes("international") || t.includes("multilateral") || t.includes("un")) return "#a78bfa";
  if (t.includes("corporation") || t.includes("enterprise") || t.includes("company")) return "#00e6c8";
  if (t.includes("ngo") || t.includes("foundation") || t.includes("fund")) return "#4ade80";
  if (t.includes("research") || t.includes("institute") || t.includes("university")) return "#38bdf8";
  if (t.includes("bank")) return "#f472b6";
  return "#60a5fa";
}

function getTypeIcon(type: string | undefined): React.ElementType {
  const t = (type ?? "").toLowerCase();
  if (t.includes("government") || t.includes("ministry")) return Landmark;
  if (t.includes("agency") || t.includes("commission")) return Shield;
  if (t.includes("international") || t.includes("global") || t.includes("un")) return Globe;
  return Building;
}

function getTypeLabelKey(type: string | undefined): string {
  if (!type) return "subjects.org_default";
  const t = type.toLowerCase();
  if (t.includes("government_ministry") || t.includes("ministry")) return "subjects.org_ministry";
  if (t.includes("government_agency") || t.includes("agency")) return "subjects.org_agency";
  if (t.includes("regional_government")) return "subjects.org_regional";
  if (t.includes("state_corporation") || t.includes("state_enterprise")) return "subjects.org_state_corp";
  if (t.includes("international_investment_fund")) return "subjects.org_invest_fund";
  if (t.includes("multilateral_development_bank") || t.includes("development bank")) return "subjects.org_dev_bank";
  if (t.includes("international_consortium") || t.includes("international")) return "subjects.org_international";
  if (t.includes("ngo") || t.includes("non-governmental")) return "subjects.org_ngo";
  if (t.includes("research")) return "subjects.org_research";
  if (t.includes("government")) return "subjects.org_government";
  if (t.includes("corporation") || t.includes("company")) return "subjects.org_corporation";
  return "";
}

// ─── Type filter keys (labels resolved at render time via t()) ────────────────
const TYPE_FILTER_KEYS = [
  { key: "all", labelKey: "subjects.filter_all" },
  { key: "government", labelKey: "subjects.filter_government" },
  { key: "corporation", labelKey: "subjects.filter_corporation" },
  { key: "international", labelKey: "subjects.filter_international" },
  { key: "ngo", labelKey: "subjects.filter_ngo" },
  { key: "research", labelKey: "subjects.filter_research" },
];

function matchesTypeFilter(subj: DBSubject, filter: string): boolean {
  if (filter === "all") return true;
  const t = (subj.organization_type ?? "").toLowerCase();
  if (filter === "government") return t.includes("government") || t.includes("ministry") || t.includes("agency") || t.includes("commission");
  if (filter === "corporation") return t.includes("corporation") || t.includes("enterprise") || t.includes("company") || t.includes("state_owned");
  if (filter === "international") return t.includes("international") || t.includes("multilateral") || t.includes("un") || t.includes("global") || t.includes("bank");
  if (filter === "ngo") return t.includes("ngo") || t.includes("foundation") || t.includes("fund") || t.includes("non-governmental");
  if (filter === "research") return t.includes("research") || t.includes("institute") || t.includes("university") || t.includes("center");
  return true;
}

// ─── Detail Popup ─────────────────────────────────────────────
function SubjectDetailPopup({ subj, onClose, onNavigate }: {
  subj: DBSubject;
  onClose: () => void;
  onNavigate: () => void;
}) {
  const { t } = useTranslation();
  const color = getOrgColor(subj.organization_type);
  const Icon = getTypeIcon(subj.organization_type);
  const typeLabelKey = getTypeLabelKey(subj.organization_type);
  const typeLabel = typeLabelKey ? t(typeLabelKey) : (subj.organization_type?.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") ?? t("subjects.org_default"));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,5,15,0.85)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ duration: 0.25 }}
        className="glass-card rounded-2xl w-full max-w-lg overflow-hidden"
        style={{ borderColor: `${color}25`, boxShadow: `0 0 60px ${color}12, 0 20px 60px rgba(0,0,0,0.6)` }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 pb-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
              <Icon size={22} style={{ color }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-white font-bold text-base leading-tight">{subj.organization_name}</h3>
                <button onClick={onClose} className="shrink-0 mt-0.5 cursor-pointer">
                  <X size={16} className="text-white/30 hover:text-white" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="px-2 py-0.5 rounded-full text-xs"
                  style={{ background: `${color}15`, color, border: `1px solid ${color}25` }}>
                  {typeLabel}
                </span>
                {subj.country && (
                  <span className="px-2 py-0.5 rounded-full text-xs text-white/40"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    {subj.country}
                  </span>
                )}
                {subj.status && (
                  <span className="px-2 py-0.5 rounded-full text-xs"
                    style={{ background: "rgba(74,222,128,0.08)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.2)" }}>
                    {subj.status}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-5">
          {/* Location */}
          {(subj.region || subj.country) && (
            <div className="flex items-center gap-1.5 mb-3">
              <MapPin size={12} className="text-white/35" />
              <span className="text-white/50 text-xs">{[subj.region, subj.country].filter(Boolean).join(", ")}</span>
            </div>
          )}

          {subj.description && (
            <p className="text-white/60 text-sm leading-relaxed mb-4">{subj.description}</p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {subj.founded_year && (
              <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="text-white/35 text-xs mb-1">{t("subjects.founded")}</div>
                <div className="text-white font-bold text-sm">{subj.founded_year}</div>
              </div>
            )}
            {subj.employees_count && (
              <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="text-white/35 text-xs mb-1">{t("subjects.personnel")}</div>
                <div className="text-white font-bold text-sm">{subj.employees_count.toLocaleString()}</div>
              </div>
            )}
            {subj.annual_budget && (
              <div className="rounded-xl p-3 col-span-2" style={{ background: `${color}06`, border: `1px solid ${color}12` }}>
                <div className="text-white/35 text-xs mb-1">{t("subjects.annual_budget")}</div>
                <div className="font-bold text-sm" style={{ color }}>{fmt(subj.annual_budget)}</div>
              </div>
            )}
          </div>

          {/* Contact */}
          {(subj.contact_email || subj.website) && (
            <div className="rounded-xl p-3 mb-4 space-y-1.5"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              {subj.contact_email && (
                <div className="flex items-center gap-2">
                  <Mail size={11} className="text-white/30 shrink-0" />
                  <span className="text-white/50 text-xs">{subj.contact_email}</span>
                </div>
              )}
              {subj.website && (
                <div className="flex items-center gap-2">
                  <ExternalLink size={11} className="text-white/30 shrink-0" />
                  <a href={subj.website} target="_blank" rel="noopener noreferrer"
                    className="text-white/50 text-xs hover:text-cyan-400 transition-colors"
                    onClick={e => e.stopPropagation()}>
                    {subj.website.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm text-white/50 hover:text-white/80 transition-colors cursor-pointer"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
              {t("subjects.close")}
            </button>
            <button onClick={onNavigate}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer"
              style={{ background: `${color}20`, border: `1px solid ${color}35`, color }}>
              {t("subjects.navigate")} <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Subject Card ─────────────────────────────────────────────
function SubjectCard({ subj, onClick }: { subj: DBSubject; onClick: () => void }) {
  const { t } = useTranslation();
  const color = getOrgColor(subj.organization_type);
  const Icon = getTypeIcon(subj.organization_type);
  const typeLabelKey = getTypeLabelKey(subj.organization_type);
  const typeLabel = typeLabelKey ? t(typeLabelKey) : (subj.organization_type?.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") ?? t("subjects.org_default"));

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      whileHover={{ y: -3, boxShadow: `0 12px 40px ${color}15` }}
      onClick={onClick}
      className="glass-card rounded-2xl p-3 sm:p-4 cursor-pointer group transition-all duration-200"
      style={{ borderColor: `${color}18` }}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
          <Icon size={18} style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-bold text-sm sm:text-base leading-snug group-hover:text-cyan-300 transition-colors line-clamp-2">
            {subj.organization_name}
          </h3>
          <div className="flex items-center gap-1 mt-1">
            <span className="px-1.5 py-0.5 rounded-md text-xs"
              style={{ background: `${color}12`, color, border: `1px solid ${color}20` }}>
              {typeLabel}
            </span>
          </div>
        </div>
      </div>

      {(subj.region || subj.country) && (
        <div className="flex items-center gap-1.5 mb-2">
          <MapPin size={10} className="text-white/30" />
          <span className="text-white/40 text-xs">{[subj.region, subj.country].filter(Boolean).join(", ")}</span>
        </div>
      )}

      {subj.description && (
        <p className="text-white/50 text-xs leading-relaxed line-clamp-2 mb-3">{subj.description}</p>
      )}

      <div className="flex items-center gap-3 text-xs">
        {subj.founded_year && (
          <span className="text-white/35">с {subj.founded_year}</span>
        )}
        {subj.employees_count && (
          <div className="flex items-center gap-1 text-white/35">
            <Users size={9} />
            <span>{subj.employees_count.toLocaleString()}</span>
          </div>
        )}
        {subj.annual_budget && (
          <div className="ml-auto font-semibold" style={{ color }}>
            {fmt(subj.annual_budget)}/год
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
const PAGE_SIZE = 24;

export default function SubjectsPage() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  const [subjects, setSubjects] = useState<DBSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [selectedSubj, setSelectedSubj] = useState<DBSubject | null>(null);
  const [page, setPage] = useState(1);

  // Fetch all subjects directly from Supabase (no REST API)
  useEffect(() => {
    setLoading(true);
    setError(null);
    supabase
      .from("partnerships")
      .select("*")
      .order("organization_name")
      .limit(500)
      .then(({ data, error: err }) => {
        if (err) throw err;
        setSubjects(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setError(t("subjects.load_error"));
        setLoading(false);
      });
  }, []);

  // Unique countries for filter
  const countries = useMemo(() => {
    const set = new Set(subjects.map(s => s.country).filter(Boolean) as string[]);
    return ["all", ...Array.from(set).sort()];
  }, [subjects]);

  // Filtered subjects
  const filtered = useMemo(() => {
    return subjects.filter(s => {
      const matchType = matchesTypeFilter(s, typeFilter);
      const matchCountry = countryFilter === "all" || s.country === countryFilter;
      const q = search.toLowerCase();
      const matchSearch = !q
        || s.organization_name.toLowerCase().includes(q)
        || (s.description ?? "").toLowerCase().includes(q)
        || (s.country ?? "").toLowerCase().includes(q)
        || (s.region ?? "").toLowerCase().includes(q);
      return matchType && matchCountry && matchSearch;
    });
  }, [subjects, search, typeFilter, countryFilter]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [search, typeFilter, countryFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Country list truncated to most common ones
  const countryOptions = countries.slice(0, 8);

  return (
    <div className="min-h-screen flex flex-col">

      {/* Header */}
      <div className="sticky top-0 z-30 border-b"
        style={{ background: "rgba(0,6,20,0.92)", backdropFilter: "blur(20px)", borderColor: "rgba(0,200,230,0.08)" }}>
        <div className="max-w-7xl mx-auto px-5 py-4">
          <div className="flex items-center gap-4 mb-3">
            <button onClick={() => setLocation("/map")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white/50 hover:text-white text-xs transition-colors cursor-pointer"
              style={{ background: "rgba(0,20,50,0.7)", border: "1px solid rgba(0,200,230,0.14)" }}>
              <ChevronLeft size={14} />{t("nav.map")}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.2)" }}>
                <Building size={16} style={{ color: "#fbbf24" }} />
              </div>
              <div>
                <h1 className="text-white font-black text-base">{t("subjects.title")}</h1>
                <p className="text-white/35 text-xs">{t("subjects.subtitle")}</p>
              </div>
            </div>
            <div className="ml-auto">
              <div className="text-white/30 text-xs">{t("subjects.shown")}</div>
              <div className="text-white font-bold text-right">{filtered.length}</div>
            </div>
          </div>

          {/* Search */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder={t("subjects.search_placeholder")}
                className="w-full pl-9 pr-3 py-2 rounded-xl text-sm text-white bg-transparent outline-none placeholder-white/25"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(251,191,36,0.12)" }}
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer">
                  <X size={12} className="text-white/40 hover:text-white" />
                </button>
              )}
            </div>
            <div className="flex gap-2 overflow-x-auto flex-nowrap">
              {countryOptions.map(c => (
                <button key={c} onClick={() => setCountryFilter(c)}
                  className="shrink-0 px-3 h-10 rounded-xl text-xs font-medium transition-all cursor-pointer"
                  style={countryFilter === c
                    ? { background: "rgba(251,191,36,0.15)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.3)" }
                    : { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.40)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  {c === "all" ? t("subjects.all_countries") : c}
                </button>
              ))}
            </div>
          </div>

          {/* Type filters */}
          <div className="flex gap-2 mt-2 overflow-x-auto pb-0.5 flex-nowrap">
            {TYPE_FILTER_KEYS.map(item => {
              const col = item.key === "all" ? "#fbbf24" :
                item.key === "government" ? "#f59e0b" :
                item.key === "corporation" ? "#00e6c8" :
                item.key === "international" ? "#a78bfa" :
                item.key === "ngo" ? "#4ade80" : "#38bdf8";
              return (
                <button key={item.key} onClick={() => setTypeFilter(item.key)}
                  className="shrink-0 px-3 h-9 rounded-lg text-xs font-medium transition-all cursor-pointer"
                  style={typeFilter === item.key
                    ? { background: `${col}18`, color: col, border: `1px solid ${col}30` }
                    : { background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.30)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  {t(item.labelKey)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-5 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 size={32} className="text-yellow-400 animate-spin" />
            <p className="text-white/40 text-sm">{t("subjects.loading")}</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <AlertCircle size={32} className="text-red-400" />
            <p className="text-white/50 text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-xl text-sm text-yellow-400 cursor-pointer"
              style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)" }}>
              {t("subjects.retry")}
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-white/30">
            <Building size={40} className="mx-auto mb-3 opacity-30" />
            <p>{t("subjects.empty")}</p>
          </div>
        ) : (
          <>
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <AnimatePresence mode="popLayout">
                {paginated.map(subj => (
                  <SubjectCard key={subj.id} subj={subj} onClick={() => setSelectedSubj(subj)} />
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1.5 px-4 h-10 rounded-xl text-sm transition-all cursor-pointer disabled:opacity-40"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}>
                  <PrevIcon size={14} /> {t("subjects.prev")}
                </button>
                <span className="text-white/40 text-sm">{page} / {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex items-center gap-1.5 px-4 h-10 rounded-xl text-sm transition-all cursor-pointer disabled:opacity-40"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}>
                  {t("subjects.next")} <ChevronRight size={14} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <AnimatePresence>
        {selectedSubj && (
          <SubjectDetailPopup
            subj={selectedSubj}
            onClose={() => setSelectedSubj(null)}
            onNavigate={() => {
              setLocation(`/hub/subject/${selectedSubj.id}`);
              setSelectedSubj(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
