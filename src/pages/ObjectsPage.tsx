import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, MapPin, Search, X, ArrowRight, Filter,
  ChevronLeft, ChevronRight, Droplets, Zap, TrendingUp,
  Globe, RefreshCw, Database, Waves, Gauge, CheckCircle2
} from "lucide-react";
import { useWaterResources } from "@/hooks/useWaterResources";
import type { WaterResource } from "@/hooks/useWaterResources";
import { localizedField } from "@/lib/i18n-utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface WaterObject {
  id: number;
  name: string;
  description?: string;
  location?: string;
  region?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  status?: string;
  object_type?: string;
  category?: string;
  irr?: number;
  total_funding?: number;
  available_for_dao?: number;
  year_completed?: number;
  year_established?: number;
  employees_count?: number;
  water_output_m3?: number;
  capacity?: string;
  technologies?: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

// TYPE_LABELS are now translated via t() in components
const TYPE_LABEL_KEYS: Record<string, string> = {
  dam: "objects.type_dam",
  reservoir: "objects.type_reservoir",
  treatment_plant: "objects.type_treatment_plant",
  canal: "objects.type_canal",
  desalination: "objects.type_desalination",
  pumping_station: "objects.type_pumping_station",
  river: "objects.type_river",
  lake: "objects.type_lake",
};

const TYPE_COLORS: Record<string, string> = {
  dam: "#1e40af",
  reservoir: "#0ea5e9",
  treatment_plant: "#10b981",
  canal: "#06b6d4",
  desalination: "#8b5cf6",
  pumping_station: "#f97316",
  river: "#3b82f6",
  lake: "#14b8a6",
};

const STATUS_CONFIG: Record<string, { color: string; labelKey: string }> = {
  operational: { color: "#4ade80", labelKey: "objects.status_operational" },
  active:       { color: "#60a5fa", labelKey: "objects.status_active" },
  development:  { color: "#fbbf24", labelKey: "objects.status_development" },
  construction: { color: "#f97316", labelKey: "objects.status_construction" },
  maintenance:  { color: "#a78bfa", labelKey: "objects.status_maintenance" },
  critical:     { color: "#ff4d6d", labelKey: "objects.status_critical" },
  planned:      { color: "#94a3b8", labelKey: "objects.status_planned" },
};

const CATEGORY_LABEL_KEYS: Record<string, string> = {
  investment: "objects.cat_investment",
  completed:  "objects.cat_completed",
  active:     "objects.cat_active",
  pilot:      "objects.cat_pilot",
};

function getTypeColor(t?: string): string {
  return t ? (TYPE_COLORS[t] ?? "#00e6c8") : "#00e6c8";
}

function fmtMoney(n?: number | null): string {
  if (!n) return "—";
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n}`;
}

// ─── DB Object card (Supabase water_resources) ───────────────────────────────

function DbObjectCard({ obj }: { obj: WaterResource }) {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  const color = obj.status === 'operational' ? '#4ade80'
    : obj.status === 'critical' ? '#ff4d6d'
    : obj.status === 'construction' ? '#f97316'
    : '#00e6c8';
  const statusCfgRaw = STATUS_CONFIG[obj.status ?? ''] ?? { color: '#94a3b8', labelKey: '' };
  const statusCfg = { color: statusCfgRaw.color, label: statusCfgRaw.labelKey ? t(statusCfgRaw.labelKey) : (obj.status ?? '—') };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, boxShadow: `0 12px 40px ${color}18` }}
      onClick={() => setLocation(`/hub/object/${obj.id}`)}
      className="rounded-2xl overflow-hidden cursor-pointer group transition-all duration-200 h-full"
      style={{
        background: "rgba(0,8,24,0.7)",
        border: `1px solid ${color}18`,
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${color}80, ${color}20)` }} />

      <div className="p-3 sm:p-4">
        <div className="flex items-start gap-3 mb-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
            style={{ background: `${color}15`, border: `1px solid ${color}30` }}
          >
            <Droplets size={16} style={{ color }} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-sm leading-snug group-hover:text-cyan-300 transition-colors line-clamp-2">
              {localizedField(obj, 'name')}
            </h3>
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              {obj.category && (
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ background: `${color}15`, color, border: `1px solid ${color}25` }}
                >
                  {obj.category}
                </span>
              )}
              {obj.status && (
                <span
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                  style={{ background: `${statusCfg.color}12`, color: statusCfg.color, border: `1px solid ${statusCfg.color}20` }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: statusCfg.color, boxShadow: `0 0 4px ${statusCfg.color}` }}
                  />
                  {statusCfg.label}
                </span>
              )}
            </div>
          </div>
        </div>

        {(obj.region || obj.country) && (
          <div className="flex items-center gap-1.5 mb-2">
            <MapPin size={10} className="text-white/30 shrink-0" />
            <span className="text-white/45 text-xs truncate">
              {[obj.region, obj.country].filter(Boolean).join(", ")}
            </span>
          </div>
        )}

        {obj.description && (
          <p className="text-white/50 text-xs leading-relaxed line-clamp-2 mb-3">{localizedField(obj, 'description')}</p>
        )}

        <div className="flex items-center gap-3 text-xs pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          {obj.irr != null && (
            <div className="flex items-center gap-1" style={{ color: "#00e6c8" }}>
              <TrendingUp size={10} />
              <span className="font-bold">{obj.irr}% IRR</span>
            </div>
          )}
          {obj.total_funding != null && (
            <div className="flex items-center gap-1 text-white/40">
              <Zap size={10} />
              <span>{fmtMoney(obj.total_funding)}</span>
            </div>
          )}
          {obj.year_completed && (
            <div className="text-white/30 ml-auto text-xs">{obj.year_completed}</div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Object card ──────────────────────────────────────────────────────────────

function ObjectCard({ obj, onClick }: { obj: WaterObject; onClick: () => void }) {
  const { t } = useTranslation();
  const color = getTypeColor(obj.object_type);
  const statusRaw = STATUS_CONFIG[obj.status ?? ""] ?? { color: "#94a3b8", labelKey: "" };
  const status = { color: statusRaw.color, label: statusRaw.labelKey ? t(statusRaw.labelKey) : (obj.status ?? "—") };
  const typeLabelKey = obj.object_type ? TYPE_LABEL_KEYS[obj.object_type] : undefined;
  const typeLabel = typeLabelKey ? t(typeLabelKey) : (obj.object_type ?? t("objects.water_object"));

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, boxShadow: `0 12px 40px ${color}18` }}
      onClick={onClick}
      className="rounded-2xl overflow-hidden cursor-pointer group transition-all duration-200 h-full"
      style={{
        background: "rgba(0,8,24,0.7)",
        border: `1px solid ${color}18`,
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Top color strip */}
      <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${color}80, ${color}20)` }} />

      <div className="p-3 sm:p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
            style={{ background: `${color}15`, border: `1px solid ${color}30` }}
          >
            <Building2 size={16} style={{ color }} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-sm sm:text-base leading-snug group-hover:text-cyan-300 transition-colors line-clamp-2">
              {obj.name}
            </h3>
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              <span
                className="px-2 py-0.5 rounded-full text-xs font-medium"
                style={{ background: `${color}15`, color, border: `1px solid ${color}25` }}
              >
                {typeLabel}
              </span>
              <span
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                style={{ background: `${status.color}12`, color: status.color, border: `1px solid ${status.color}20` }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: status.color, boxShadow: `0 0 4px ${status.color}` }}
                />
                {status.label}
              </span>
            </div>
          </div>
        </div>

        {/* Location */}
        {(obj.region || obj.country) && (
          <div className="flex items-center gap-1.5 mb-2">
            <MapPin size={10} className="text-white/30 shrink-0" />
            <span className="text-white/45 text-xs truncate">
              {[obj.region, obj.country].filter(Boolean).join(", ")}
            </span>
          </div>
        )}

        {/* Description */}
        {obj.description && (
          <p className="text-white/50 text-xs leading-relaxed line-clamp-2 mb-3">{obj.description}</p>
        )}

        {/* Metrics row */}
        <div className="flex items-center gap-3 text-xs pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          {obj.irr != null && (
            <div className="flex items-center gap-1" style={{ color: "#00e6c8" }}>
              <TrendingUp size={10} />
              <span className="font-bold">{obj.irr}% IRR</span>
            </div>
          )}
          {obj.total_funding != null && (
            <div className="flex items-center gap-1 text-white/40">
              <Zap size={10} />
              <span>{fmtMoney(obj.total_funding)}</span>
            </div>
          )}
          {obj.year_completed && (
            <div className="text-white/30 ml-auto text-xs">{obj.year_completed}</div>
          )}
          {!obj.year_completed && obj.year_established && (
            <div className="text-white/30 ml-auto text-xs">{obj.year_established}</div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 24;

export default function ObjectsPage() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();

  // Filters
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRegion, setFilterRegion] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  // Single Supabase source — no REST calls
  const { data: allObjects = [], isLoading, error: dbError } = useWaterResources();

  // Derive regions from actual data
  const regions = useMemo(() => {
    const set = new Set(allObjects.map(o => o.region).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, [allObjects]);

  // Client-side filtering
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allObjects.filter(o => {
      if (filterStatus !== "all" && o.status !== filterStatus) return false;
      if (filterRegion !== "all" && o.region !== filterRegion) return false;
      if (filterCategory !== "all" && o.category !== filterCategory) return false;
      if (filterType !== "all" && o.object_type !== filterType) return false;
      if (q) {
        const name = localizedField(o, 'name').toLowerCase();
        const desc = localizedField(o, 'description').toLowerCase();
        const loc = ((o.region ?? "") + " " + (o.country ?? "")).toLowerCase();
        if (!name.includes(q) && !desc.includes(q) && !loc.includes(q)) return false;
      }
      return true;
    });
  }, [allObjects, search, filterType, filterStatus, filterRegion, filterCategory]);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [search, filterType, filterStatus, filterRegion, filterCategory]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div
      className="min-h-screen"
    >
      {/* ── Header ─────────────────────────────────────────────────────────────── */}
      <div
        className="sticky top-0 z-30 px-4 sm:px-6 py-4"
        style={{
          background: "rgba(0,6,20,0.92)",
          borderBottom: "1px solid rgba(0,230,200,0.08)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-4">
            {/* Title */}
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(0,230,200,0.1)", border: "1px solid rgba(0,230,200,0.2)" }}
              >
                <Database size={17} style={{ color: "#00e6c8" }} />
              </div>
              <div>
                <h1 className="text-white font-black text-lg leading-tight">{t("objects.title")}</h1>
                <p className="text-white/35 text-xs">
                  {isLoading ? t("objects.loading") : t("objects.objects_on_page", { count: filtered.length })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setLocation("/hub")}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all h-10"
                style={{
                  background: "rgba(0,230,200,0.08)",
                  border: "1px solid rgba(0,230,200,0.2)",
                  color: "#00e6c8",
                }}
              >
                <CheckCircle2 size={13} />
                {t("objects.completed")}
              </button>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all h-10"
                style={{
                  background: showFilters ? "rgba(0,230,200,0.12)" : "rgba(255,255,255,0.05)",
                  border: showFilters ? "1px solid rgba(0,230,200,0.3)" : "1px solid rgba(255,255,255,0.08)",
                  color: showFilters ? "#00e6c8" : "rgba(255,255,255,0.5)",
                }}
              >
                <Filter size={14} />
                <span className="hidden sm:inline">{t("objects.filters")}</span>
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="mt-3">
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <Search size={14} className="text-white/30 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("objects.search_placeholder")}
                className="flex-1 bg-transparent text-white text-sm placeholder-white/25 outline-none"
              />
              {search && (
                <button onClick={() => setSearch("")}>
                  <X size={12} className="text-white/30" />
                </button>
              )}
            </div>
          </div>

          {/* Category quick chips */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-0.5 flex-nowrap">
            {[
              { key: "all", label: t("objects.cat_all") },
              { key: "investment", label: t("objects.cat_investment_short") },
              { key: "active", label: t("objects.cat_active") },
              { key: "pilot", label: t("objects.cat_pilot") },
              { key: "completed", label: t("objects.cat_completed") },
            ].map((chip) => (
              <button
                key={chip.key}
                onClick={() => setFilterCategory(chip.key)}
                className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all h-8"
                style={filterCategory === chip.key
                  ? { background: "rgba(0,230,200,0.15)", color: "#00e6c8", border: "1px solid rgba(0,230,200,0.3)" }
                  : { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* ── Filters panel ─────────────────────────────────────────────────── */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 overflow-hidden"
              >
                <div className="flex flex-wrap gap-3">
                  {/* Type */}
                  <div className="flex flex-col gap-1">
                    <span className="text-white/30 text-xs font-semibold uppercase tracking-wider">{t("objects.filter_type")}</span>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="px-3 py-1.5 rounded-lg text-sm text-white/70 outline-none"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                    >
                      <option value="all">{t("objects.all_types")}</option>
                      {Object.entries(TYPE_LABEL_KEYS).map(([k, labelKey]) => (
                        <option key={k} value={k} style={{ background: "#000c1e" }}>{t(labelKey)}</option>
                      ))}
                    </select>
                  </div>

                  {/* Status */}
                  <div className="flex flex-col gap-1">
                    <span className="text-white/30 text-xs font-semibold uppercase tracking-wider">{t("objects.filter_status")}</span>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-3 py-1.5 rounded-lg text-sm text-white/70 outline-none"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                    >
                      <option value="all">{t("objects.all_statuses")}</option>
                      {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                        <option key={k} value={k} style={{ background: "#000c1e" }}>{t(v.labelKey)}</option>
                      ))}
                    </select>
                  </div>

                  {/* Region — derived from data */}
                  {regions.length > 0 && (
                    <div className="flex flex-col gap-1">
                      <span className="text-white/30 text-xs font-semibold uppercase tracking-wider">{t("objects.filter_region")}</span>
                      <select
                        value={filterRegion}
                        onChange={(e) => setFilterRegion(e.target.value)}
                        className="px-3 py-1.5 rounded-lg text-sm text-white/70 outline-none"
                        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                      >
                        <option value="all">{t("objects.all_regions")}</option>
                        {regions.map((r) => (
                          <option key={r} value={r} style={{ background: "#000c1e" }}>{r}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Category */}
                  <div className="flex flex-col gap-1">
                    <span className="text-white/30 text-xs font-semibold uppercase tracking-wider">{t("objects.filter_category")}</span>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="px-3 py-1.5 rounded-lg text-sm text-white/70 outline-none"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                    >
                      <option value="all">{t("objects.all_categories")}</option>
                      {Object.entries(CATEGORY_LABEL_KEYS).map(([k, labelKey]) => (
                        <option key={k} value={k} style={{ background: "#000c1e" }}>{t(labelKey)}</option>
                      ))}
                    </select>
                  </div>

                  {/* Reset */}
                  {(filterType !== "all" || filterStatus !== "all" || filterRegion !== "all" || filterCategory !== "all" || search) && (
                    <div className="flex flex-col gap-1 justify-end">
                      <button
                        onClick={() => {
                          setFilterType("all");
                          setFilterStatus("all");
                          setFilterRegion("all");
                          setFilterCategory("all");
                          setSearch("");
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all"
                        style={{ background: "rgba(255,77,109,0.1)", border: "1px solid rgba(255,77,109,0.2)", color: "#ff4d6d" }}
                      >
                        <X size={12} /> {t("objects.reset_filters")}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Stats bar ─────────────────────────────────────────────────────────── */}
      <div className="px-4 sm:px-6 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="max-w-7xl mx-auto w-full grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
          {[
            { icon: <Waves size={13} />, label: t("objects.stat_dams"), value: 68, color: "#1e40af" },
            { icon: <Droplets size={13} />, label: t("objects.stat_canals"), value: 25, color: "#06b6d4" },
            { icon: <Gauge size={13} />, label: t("objects.stat_treatment"), value: 22, color: "#10b981" },
            { icon: <Globe size={13} />, label: t("objects.stat_total"), value: allObjects.length || 458, color: "#00e6c8" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-2">
              <span style={{ color: s.color }}>{s.icon}</span>
              <div>
                <div className="text-white font-black text-sm leading-none">{s.value}</div>
                <div className="text-white/30 text-xs">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-10 h-10 rounded-full border-2 border-transparent animate-spin"
              style={{ borderTopColor: "#00e6c8", borderRightColor: "#60a5fa" }} />
            <span className="text-white/40 text-sm">{t("objects.loading_objects")}</span>
          </div>
        ) : dbError ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="text-red-400 text-center">
              <div className="text-lg font-bold mb-2">{t("objects.error_title")}</div>
              <div className="text-sm opacity-70">{String(dbError)}</div>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Database size={40} className="text-white/15" />
            <div className="text-white/40 text-center">
              <div className="font-bold mb-1">{t("objects.empty_title")}</div>
              <div className="text-sm">{t("objects.empty_hint")}</div>
            </div>
          </div>
        ) : (
          <>
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              <AnimatePresence mode="popLayout">
                {paginated.map((obj) => (
                  <DbObjectCard key={obj.id} obj={obj} />
                ))}
              </AnimatePresence>
            </motion.div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1.5 px-4 h-10 rounded-xl text-sm transition-all disabled:opacity-30"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}
                >
                  <ChevronLeft size={15} /> {t("objects.prev")}
                </button>

                <div className="flex items-center gap-1.5 px-4 h-10 rounded-xl"
                  style={{ background: "rgba(0,230,200,0.08)", border: "1px solid rgba(0,230,200,0.15)" }}>
                  <span className="text-white/40 text-sm">{t("objects.page")}</span>
                  <span className="text-white font-black text-sm">{page}</span>
                  <span className="text-white/40 text-sm">/ {totalPages}</span>
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="flex items-center gap-1.5 px-4 h-10 rounded-xl text-sm transition-all disabled:opacity-30"
                  style={{ background: "rgba(0,230,200,0.08)", border: "1px solid rgba(0,230,200,0.15)", color: "#00e6c8" }}
                >
                  {t("objects.next")} <ChevronRight size={15} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
