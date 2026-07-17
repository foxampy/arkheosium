import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { localizedField } from "@/lib/i18n-utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderOpen, MapPin, TrendingUp, Search, X, ArrowRight, ChevronLeft,
  Calendar, DollarSign, BarChart3, Globe, Zap, Loader2, AlertCircle,
  ChevronRight, Users, Shield, CheckCircle2, Wand2
} from "lucide-react";
import AIProjectGenerator from "@/components/AIProjectGenerator";

// ─── DB interface matching `projects` table ───────────────────
interface DBProject {
  id: number;
  name: string;
  description?: string;
  apy?: number;
  total_funding?: number;
  created_at?: string;
  region?: string;
  country?: string;
  status?: string;
  irr?: number;
  technologies?: string;
  team_size?: number;
  risk_level?: string;
  water_object_id?: number;
  latitude?: number;
  longitude?: number;
}

// ─── Helpers ─────────────────────────────────────────────────
function fmt(n: number | undefined | null): string {
  if (!n) return "—";
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n}`;
}

const STATUS_CFG: Record<string, { color: string; labelKey: string }> = {
  active: { color: "#4ade80", labelKey: "projects.status_active" },
  development: { color: "#60a5fa", labelKey: "projects.status_development" },
  construction: { color: "#fbbf24", labelKey: "projects.status_construction" },
  completed: { color: "#00e6c8", labelKey: "projects.status_completed" },
  planning: { color: "#a78bfa", labelKey: "projects.status_planning" },
  suspended: { color: "#f87171", labelKey: "projects.status_suspended" },
};

// Runtime helper that needs t() — will be called inside components
function getStatusCfgRaw(status: string | undefined): { color: string; labelKey: string } {
  if (!status) return { color: "#94a3b8", labelKey: "projects.status_unknown" };
  const key = status.toLowerCase();
  return STATUS_CFG[key] ?? { color: "#94a3b8", labelKey: "" };
}

const RISK_CFG: Record<string, { color: string; labelKey: string }> = {
  low: { color: "#4ade80", labelKey: "projects.risk_low" },
  medium: { color: "#fbbf24", labelKey: "projects.risk_medium" },
  high: { color: "#f87171", labelKey: "projects.risk_high" },
};

function getRiskCfgRaw(risk: string | undefined) {
  if (!risk) return null;
  return RISK_CFG[risk.toLowerCase()] ?? null;
}

function parseTechnologies(tech: string | undefined): string[] {
  if (!tech) return [];
  try {
    const parsed = JSON.parse(tech);
    if (Array.isArray(parsed)) return parsed;
  } catch {}
  return tech.split(/[,;]+/).map(t => t.trim()).filter(Boolean);
}

// ─── Status filter keys (labels resolved at render time via t()) ──────────────
const STATUS_FILTER_KEYS = [
  { key: "all", labelKey: "projects.filter_all" },
  { key: "active", labelKey: "projects.status_active" },
  { key: "development", labelKey: "projects.status_development" },
  { key: "planning", labelKey: "projects.status_planning" },
  { key: "completed", labelKey: "projects.status_completed" },
  { key: "construction", labelKey: "projects.status_construction" },
];

const RISK_FILTER_KEYS = [
  { key: "all", labelKey: "projects.risk_all" },
  { key: "low", labelKey: "projects.risk_low" },
  { key: "medium", labelKey: "projects.risk_medium" },
  { key: "high", labelKey: "projects.risk_high" },
];

// ─── Detail Popup ─────────────────────────────────────────────
function ProjectDetailPopup({ proj, onClose, onNavigate }: {
  proj: DBProject;
  onClose: () => void;
  onNavigate: () => void;
}) {
  const { t } = useTranslation();
  const statusRaw = getStatusCfgRaw(proj.status);
  const statusCfg = { color: statusRaw.color, label: statusRaw.labelKey ? t(statusRaw.labelKey) : (proj.status ?? "") };
  const riskRaw = getRiskCfgRaw(proj.risk_level);
  const riskCfg = riskRaw ? { color: riskRaw.color, label: t(riskRaw.labelKey) } : null;
  const techs = parseTechnologies(proj.technologies);

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
        className="glass-card rounded-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto"
        style={{
          borderColor: `${statusCfg.color}25`,
          boxShadow: `0 0 60px ${statusCfg.color}12, 0 20px 60px rgba(0,0,0,0.6)`
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header gradient */}
        <div className="h-24 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${statusCfg.color}18 0%, rgba(0,8,24,0.9) 100%)`,
            borderBottom: `1px solid ${statusCfg.color}20`
          }}>
          <div className="absolute inset-0 flex items-center justify-between px-5">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: `${statusCfg.color}15`, border: `1px solid ${statusCfg.color}30` }}>
              <FolderOpen size={22} style={{ color: statusCfg.color }} />
            </div>
            <button onClick={onClose}
              className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer"
              style={{ background: "rgba(0,8,24,0.7)", border: "1px solid rgba(255,255,255,0.15)" }}>
              <X size={14} className="text-white/70" />
            </button>
          </div>
        </div>

        <div className="p-5">
          {/* Title */}
          <div className="mb-4">
            <h3 className="text-white font-bold text-base leading-tight mb-2">{localizedField(proj, 'name')}</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-0.5 rounded-full text-xs"
                style={{ background: `${statusCfg.color}15`, color: statusCfg.color, border: `1px solid ${statusCfg.color}25` }}>
                {statusCfg.label}
              </span>
              {riskCfg && (
                <span className="px-2 py-0.5 rounded-full text-xs"
                  style={{ background: `${riskCfg.color}10`, color: riskCfg.color, border: `1px solid ${riskCfg.color}20` }}>
                  {riskCfg.label}
                </span>
              )}
            </div>
          </div>

          {/* Location */}
          {(proj.region || proj.country) && (
            <div className="flex items-center gap-1.5 mb-3">
              <MapPin size={12} className="text-white/35" />
              <span className="text-white/50 text-xs">{[proj.region, proj.country].filter(Boolean).join(", ")}</span>
            </div>
          )}

          {proj.description && (
            <p className="text-white/60 text-sm leading-relaxed mb-4">{localizedField(proj, 'description')}</p>
          )}

          {/* Financial metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
            {proj.total_funding && (
              <div className="rounded-xl p-3 col-span-2"
                style={{ background: `${statusCfg.color}08`, border: `1px solid ${statusCfg.color}15` }}>
                <div className="text-white/35 text-xs mb-1">{t("projects.funding")}</div>
                <div className="font-black text-lg text-white">{fmt(proj.total_funding)}</div>
              </div>
            )}
            {proj.irr && (
              <div className="rounded-xl p-3"
                style={{ background: "rgba(0,230,200,0.06)", border: "1px solid rgba(0,230,200,0.12)" }}>
                <div className="text-white/35 text-xs mb-1">IRR</div>
                <div className="font-black text-lg" style={{ color: "#00e6c8" }}>{proj.irr}%</div>
              </div>
            )}
          </div>

          {/* Extra stats */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {proj.apy && (
              <div className="rounded-xl p-3" style={{ background: "rgba(96,165,250,0.06)", border: "1px solid rgba(96,165,250,0.12)" }}>
                <div className="text-white/35 text-xs mb-1">APY</div>
                <div className="font-bold text-sm" style={{ color: "#60a5fa" }}>{proj.apy}%</div>
              </div>
            )}
            {proj.team_size && (
              <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="text-white/35 text-xs mb-1">{t("projects.team")}</div>
                <div className="font-bold text-sm text-white">{proj.team_size}</div>
              </div>
            )}
          </div>

          {/* Technologies */}
          {techs.length > 0 && (
            <div className="mb-4">
              <div className="text-white/30 text-xs mb-2">{t("projects.technologies")}</div>
              <div className="flex flex-wrap gap-1.5">
                {techs.map(tech => (
                  <span key={tech} className="px-2 py-0.5 rounded-lg text-xs"
                    style={{ background: "rgba(0,230,200,0.08)", color: "#00e6c8", border: "1px solid rgba(0,230,200,0.15)" }}>
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Created date */}
          {proj.created_at && (
            <div className="flex items-center gap-2 mb-4 text-xs text-white/35">
              <Calendar size={11} />
              <span>{t("projects.added")}: {new Date(proj.created_at).toLocaleDateString()}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm text-white/50 hover:text-white/80 transition-colors cursor-pointer"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
              {t("projects.close")}
            </button>
            <button onClick={onNavigate}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer"
              style={{ background: `${statusCfg.color}20`, border: `1px solid ${statusCfg.color}35`, color: statusCfg.color }}>
              {t("projects.navigate")} <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Project Card ─────────────────────────────────────────────
function ProjectCard({ proj, onClick }: { proj: DBProject; onClick: () => void }) {
  const { t } = useTranslation();
  const statusRaw = getStatusCfgRaw(proj.status);
  const statusCfg = { color: statusRaw.color, label: statusRaw.labelKey ? t(statusRaw.labelKey) : (proj.status ?? "") };
  const riskRaw = getRiskCfgRaw(proj.risk_level);
  const riskCfg = riskRaw ? { color: riskRaw.color, label: t(riskRaw.labelKey) } : null;
  const techs = parseTechnologies(proj.technologies);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      whileHover={{ y: -3, boxShadow: `0 12px 40px ${statusCfg.color}15` }}
      onClick={onClick}
      className="glass-card rounded-2xl overflow-hidden cursor-pointer group transition-all duration-200"
      style={{ borderColor: `${statusCfg.color}18` }}
    >
      {/* Mini cover */}
      <div className="h-20 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${statusCfg.color}15 0%, rgba(0,8,24,0.85) 100%)`
        }}>
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <FolderOpen size={40} style={{ color: statusCfg.color }} />
        </div>
        <div className="absolute top-3 left-3">
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
            style={{ background: `${statusCfg.color}20`, color: statusCfg.color, border: `1px solid ${statusCfg.color}35` }}>
            {statusCfg.label}
          </span>
        </div>
        {riskCfg && (
          <div className="absolute top-3 right-3">
            <span className="px-2 py-0.5 rounded-full text-xs"
              style={{ background: `${riskCfg.color}12`, color: riskCfg.color, border: `1px solid ${riskCfg.color}20` }}>
              {riskCfg.label}
            </span>
          </div>
        )}
      </div>

      <div className="p-3 sm:p-4">
        <h3 className="text-white font-bold text-sm sm:text-base leading-snug mb-1 group-hover:text-cyan-300 transition-colors line-clamp-2">
          {localizedField(proj, 'name')}
        </h3>

        {(proj.region || proj.country) && (
          <div className="flex items-center gap-1 mb-2">
            <MapPin size={10} className="text-white/30" />
            <span className="text-white/40 text-xs">{[proj.region, proj.country].filter(Boolean).join(", ")}</span>
          </div>
        )}

        {proj.description && (
          <p className="text-white/50 text-xs leading-relaxed line-clamp-2 mb-3">{localizedField(proj, 'description')}</p>
        )}

        {/* Technologies preview */}
        {techs.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {techs.slice(0, 2).map(tech => (
              <span key={tech} className="px-1.5 py-0.5 rounded text-xs"
                style={{ background: "rgba(0,230,200,0.06)", color: "#00e6c8" }}>
                {tech}
              </span>
            ))}
            {techs.length > 2 && (
              <span className="text-white/25 text-xs">+{techs.length - 2}</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-xs">
          {proj.total_funding && (
            <div className="flex items-center gap-1 text-white/45">
              <DollarSign size={10} />
              <span className="font-semibold text-white">{fmt(proj.total_funding)}</span>
            </div>
          )}
          {proj.irr && (
            <div className="flex items-center gap-1" style={{ color: "#00e6c8" }}>
              <TrendingUp size={10} />
              <span className="font-bold">{proj.irr}% IRR</span>
            </div>
          )}
          {proj.team_size && (
            <div className="flex items-center gap-1 text-white/30">
              <Users size={10} />
              <span>{proj.team_size}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
const PAGE_SIZE = 24;

export default function ProjectsPage() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  const [projects, setProjects] = useState<DBProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");
  const [selectedProj, setSelectedProj] = useState<DBProject | null>(null);
  const [page, setPage] = useState(1);
  const [showAIGenerator, setShowAIGenerator] = useState(false);

  // Fetch all projects from API
  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch("/api/projects/list?limit=100")
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProjects(data);
        } else {
          setProjects([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load projects:", err);
        setError(t("projects.load_error"));
        setLoading(false);
      });
  }, []);

  // Filtered
  const filtered = useMemo(() => {
    return projects.filter(p => {
      const matchStatus = statusFilter === "all" || (p.status ?? "").toLowerCase() === statusFilter;
      const matchRisk = riskFilter === "all" || (p.risk_level ?? "").toLowerCase() === riskFilter;
      const q = search.toLowerCase();
      const matchSearch = !q
        || p.name.toLowerCase().includes(q)
        || (p.description ?? "").toLowerCase().includes(q)
        || (p.country ?? "").toLowerCase().includes(q)
        || (p.region ?? "").toLowerCase().includes(q)
        || (p.technologies ?? "").toLowerCase().includes(q);
      return matchStatus && matchRisk && matchSearch;
    });
  }, [projects, search, statusFilter, riskFilter]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [search, statusFilter, riskFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Aggregate stats
  const totalFunding = useMemo(() => filtered.reduce((s, p) => s + (p.total_funding ?? 0), 0), [filtered]);
  const avgIRR = useMemo(() => {
    const withIRR = filtered.filter(p => p.irr);
    if (!withIRR.length) return 0;
    return withIRR.reduce((s, p) => s + (p.irr ?? 0), 0) / withIRR.length;
  }, [filtered]);

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
                style={{ background: "rgba(96,165,250,0.12)", border: "1px solid rgba(96,165,250,0.2)" }}>
                <FolderOpen size={16} style={{ color: "#60a5fa" }} />
              </div>
              <div>
                <h1 className="text-white font-black text-base">{t("projects.title")}</h1>
                <p className="text-white/35 text-xs">{t("projects.subtitle")}</p>
              </div>
            </div>

            <div className="ml-auto flex items-center gap-2 sm:gap-4 overflow-x-auto">
              {/* Завершённые проекты quick link */}
              <button
                onClick={() => setLocation("/hub")}
                className="shrink-0 flex items-center gap-1.5 px-3 h-10 rounded-xl text-xs font-medium transition-all cursor-pointer"
                style={{
                  background: "rgba(0,230,200,0.08)",
                  border: "1px solid rgba(0,230,200,0.2)",
                  color: "#00e6c8",
                }}>
                <CheckCircle2 size={13} />
                <span className="hidden sm:inline">{t("projects.completed")}</span>
              </button>
              <button
                onClick={() => setShowAIGenerator(true)}
                className="shrink-0 flex items-center gap-1.5 px-4 h-10 rounded-xl text-sm font-bold transition-all cursor-pointer hover:opacity-90"
                style={{
                  background: "linear-gradient(135deg, rgba(0,230,200,0.18), rgba(96,165,250,0.12))",
                  border: "1px solid rgba(0,230,200,0.4)",
                  color: "#00e6c8",
                  boxShadow: "0 0 20px rgba(0,230,200,0.12)",
                }}>
                <Wand2 size={14} />
                <span className="hidden sm:inline">🤖 ИИ-генератор</span>
              </button>
              <div className="hidden sm:block text-right shrink-0">
                <div className="text-white/30 text-xs">{t("projects.count_label")}</div>
                <div className="text-white font-bold">{filtered.length}</div>
              </div>
              {totalFunding > 0 && (
                <>
                  <div className="hidden sm:block w-px h-8 shrink-0" style={{ background: "rgba(0,230,200,0.15)" }} />
                  <div className="hidden sm:block text-right shrink-0">
                    <div className="text-white/30 text-xs">{t("projects.total_volume")}</div>
                    <div className="font-bold" style={{ color: "#60a5fa" }}>{fmt(totalFunding)}</div>
                  </div>
                </>
              )}
              {avgIRR > 0 && (
                <>
                  <div className="hidden sm:block w-px h-8 shrink-0" style={{ background: "rgba(0,230,200,0.15)" }} />
                  <div className="hidden sm:block text-right shrink-0">
                    <div className="text-white/30 text-xs">{t("projects.avg_irr")}</div>
                    <div className="font-bold" style={{ color: "#00e6c8" }}>{avgIRR.toFixed(1)}%</div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-2">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder={t("projects.search_placeholder")}
              className="w-full pl-9 pr-3 py-2 rounded-xl text-sm text-white bg-transparent outline-none placeholder-white/25"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(96,165,250,0.12)" }}
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer">
                <X size={12} className="text-white/40 hover:text-white" />
              </button>
            )}
          </div>

          {/* Status filters */}
          <div className="flex gap-2 overflow-x-auto pb-0.5 mb-2 flex-nowrap">
            {STATUS_FILTER_KEYS.map(item => {
              const col = item.key === "all" ? "#60a5fa" : (STATUS_CFG[item.key]?.color ?? "#60a5fa");
              return (
                <button key={item.key} onClick={() => setStatusFilter(item.key)}
                  className="shrink-0 px-3 h-9 rounded-lg text-xs font-medium transition-all cursor-pointer"
                  style={statusFilter === item.key
                    ? { background: `${col}18`, color: col, border: `1px solid ${col}30` }
                    : { background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.30)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  {t(item.labelKey)}
                </button>
              );
            })}
          </div>

          {/* Risk filters */}
          <div className="flex gap-2 overflow-x-auto flex-nowrap">
            {RISK_FILTER_KEYS.map(r => {
              const col = r.key === "all" ? "#94a3b8" : (RISK_CFG[r.key]?.color ?? "#94a3b8");
              return (
                <button key={r.key} onClick={() => setRiskFilter(r.key)}
                  className="shrink-0 px-3 h-9 rounded-lg text-xs font-medium transition-all cursor-pointer"
                  style={riskFilter === r.key
                    ? { background: `${col}15`, color: col, border: `1px solid ${col}25` }
                    : { background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.30)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  {t(r.labelKey)}
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
            <Loader2 size={32} className="text-blue-400 animate-spin" />
            <p className="text-white/40 text-sm">{t("projects.loading")}</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <AlertCircle size={32} className="text-red-400" />
            <p className="text-white/50 text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-xl text-sm text-blue-400 cursor-pointer"
              style={{ background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.2)" }}>
              {t("projects.retry")}
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-white/30">
            <FolderOpen size={40} className="mx-auto mb-3 opacity-30" />
            <p>{t("projects.empty")}</p>
          </div>
        ) : (
          <>
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <AnimatePresence mode="popLayout">
                {paginated.map(proj => (
                  <ProjectCard key={proj.id} proj={proj} onClick={() => setSelectedProj(proj)} />
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
                  <ChevronLeft size={14} /> {t("projects.prev")}
                </button>
                <span className="text-white/40 text-sm">{page} / {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex items-center gap-1.5 px-4 h-10 rounded-xl text-sm transition-all cursor-pointer disabled:opacity-40"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}>
                  {t("projects.next")} <ChevronRight size={14} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <AnimatePresence>
        {selectedProj && (
          <ProjectDetailPopup
            proj={selectedProj}
            onClose={() => setSelectedProj(null)}
            onNavigate={() => {
              setLocation(`/hub/project/${selectedProj.id}`);
              setSelectedProj(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* AI Project Generator Modal */}
      <AIProjectGenerator
        isOpen={showAIGenerator}
        onClose={() => setShowAIGenerator(false)}
      />
    </div>
  );
}
