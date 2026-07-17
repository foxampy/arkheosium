import { useMemo, useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { motion } from "framer-motion";
import {
  ChevronLeft, MapPin, Building, TrendingUp, TrendingDown,
  Users, Calendar, Globe, AlertTriangle, ArrowRight,
  Shield, Layers, FileText, BarChart2, Zap, Phone, Mail, ExternalLink,
  MessageSquare,
} from "lucide-react";
import { SUBJECTS_DATA, getSubjectColor, type PlatformSubject } from "@/data/subjects-data";
import { PremiumOverlay } from "@/components/PremiumOverlay";
import { localizedField } from "@/lib/i18n-utils";
import { OBJECTS_DATA } from "@/data/objects-data";
import { PROJECTS_DATA } from "@/data/projects-data";
import { supabase } from "@/lib/supabase";
import { MiniMap } from "@/components/map/MiniMap";
import { useAuth } from "@/hooks/useAuth";

function fmt(n: number | undefined): string {
  if (!n) return "—";
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n}`;
}

function StatCard({ label, value, unit, color, icon: Icon }: {
  label: string; value: string | number; unit?: string; color: string; icon?: any;
}) {
  return (
    <div className="rounded-2xl p-4" style={{ background: `${color}08`, border: `1px solid ${color}18` }}>
      {Icon && <Icon size={16} style={{ color }} className="mb-2" />}
      <div className="text-white/40 text-xs mb-1">{label}</div>
      <div className="font-black text-lg leading-tight" style={{ color }}>
        {typeof value === "number" ? value.toLocaleString("ru") : value}
        {unit && <span className="text-white/40 font-normal text-xs ml-1">{unit}</span>}
      </div>
    </div>
  );
}

function mapDbSubject(row: Record<string, any>): PlatformSubject {
  return {
    id: String(row.id),
    name: row.organization_name || 'Организация',
    name_ru: row.organization_name || 'Организация',
    type: row.organization_type || 'government',
    type_label: row.organization_type || 'Организация',
    country: row.country || 'Узбекистан',
    location: row.region || '',
    region: row.region || '',
    email: row.contact_email,
    website: row.website,
    founded_year: row.founded_year,
    staff_count: row.employees_count,
    budget_annual: row.annual_budget,
    description: row.description || '',
    tags: row.partnership_type ? [row.partnership_type] : [],
    last_updated: row.created_at || new Date().toISOString(),
    managed_objects: [],
    key_projects: [],
  };
}

export default function SubjectDetailPage() {
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const [apiSubj, setApiSubj] = useState<PlatformSubject | null>(null);
  const [apiLoading, setApiLoading] = useState(false);

  const staticSubj = useMemo(() => SUBJECTS_DATA.find(s => s.id === params.id), [params.id]);

  useEffect(() => {
    const id = params.id;
    if (!staticSubj && id) {
      // Match sb-pt-123, sb-partner-123, or plain numeric ID
      const sbPtMatch = id.match(/^sb-pt-(\d+)$/);
      const sbPartnerMatch = id.match(/^sb-partner-(\d+)$/);
      const numericMatch = /^\d+$/.test(id) ? id : null;
      const numericId = sbPtMatch?.[1] ?? sbPartnerMatch?.[1] ?? numericMatch;

      if (numericId) {
        setApiLoading(true);
        supabase.from('partnerships').select('*').eq('id', Number(numericId)).single()
          .then(({ data }) => { if (data) setApiSubj(mapDbSubject(data)); })
          .catch(() => {})
          .finally(() => setApiLoading(false));
      }
    }
  }, [params.id, staticSubj]);

  const subj = staticSubj ?? apiSubj;

  // ⚠️ Hooks must be called unconditionally — before any early return
  const color = getSubjectColor(subj?.type ?? 'government');
  const managedObjects = useMemo(() =>
    subj ? OBJECTS_DATA.filter(o => subj.managed_objects?.includes(o.id)) : [], [subj]);
  const activeProjects = useMemo(() =>
    subj ? PROJECTS_DATA.filter(p => (subj.key_projects ?? subj.active_projects ?? []).includes(p.id)) : [], [subj]);

  if (apiLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!subj) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/40 text-lg mb-4">Субъект не найден</p>
          <button onClick={() => setLocation("/hub")}
            className="px-4 py-2 rounded-xl text-sm cursor-pointer"
            style={{ background: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.2)" }}>
            ← Проект Хаб
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">

      {/* Hero */}
      <div className="relative">
        {subj.image_url ? (
          <div className="h-44 overflow-hidden">
            <img src={subj.image_url} alt={localizedField(subj, 'name')} className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,8,24,1))" }} />
          </div>
        ) : (
          <div className="h-24 flex items-center justify-center" style={{ background: `${color}06`, borderBottom: `1px solid ${color}12` }}>
            <Building size={40} style={{ color: `${color}25` }} />
          </div>
        )}
        <button onClick={() => setLocation("/hub")}
          className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs cursor-pointer"
          style={{ background: "rgba(0,6,20,0.85)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(12px)" }}>
          <ChevronLeft size={14} /> Проект Хаб
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-5 py-6 space-y-6">

        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
              <Building size={22} style={{ color }} />
            </div>
            <div className="flex-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold inline-block mb-2"
                style={{ background: `${color}15`, color, border: `1px solid ${color}25` }}>
                {subj.type_label}
              </span>
              <h1 className="text-white font-black text-2xl leading-tight mb-1">{localizedField(subj, 'name')}</h1>
              <p className="text-white/40 text-sm">{subj.name}</p>
              {(subj.location || subj.country) && (
                <div className="flex items-center gap-1.5 mt-2">
                  <MapPin size={12} className="text-white/30" />
                  <span className="text-white/50 text-sm">{[subj.location, subj.country].filter(Boolean).join(", ")}</span>
                </div>
              )}
            </div>
          </div>
          <p className="text-white/70 text-sm leading-relaxed mt-4">{subj.description}</p>

          {/* Send message button */}
          <button
            onClick={() => {
              if (isAuthenticated) {
                setLocation(`/messages?to_subject=${encodeURIComponent(subj.id)}&subject_name=${encodeURIComponent(localizedField(subj, 'name'))}`);
              } else {
                setLocation('/account');
              }
            }}
            className="mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition hover:opacity-80 cursor-pointer"
            style={{ background: `${color}18`, border: `1px solid ${color}30`, color }}
          >
            <MessageSquare size={16} />
            Написать сообщение
          </button>
        </motion.div>

        {/* Map */}
        {subj.coordinates && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
            <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${color}20` }}>
              <MiniMap
                latitude={subj.coordinates.lat}
                longitude={subj.coordinates.lng}
                zoom={12}
                markerColor={color}
                markerType="subject"
                height="180px"
              />
              <div className="px-4 py-2 flex items-center gap-1.5"
                style={{ background: "rgba(0,6,20,0.9)", borderTop: `1px solid ${color}12` }}>
                <MapPin size={12} style={{ color }} />
                <span className="text-white/45 text-xs">
                  {subj.coordinates.lat.toFixed(4)}°N, {subj.coordinates.lng.toFixed(4)}°E
                  {subj.location ? ` — ${subj.location}` : ''}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {subj.founded_year && <StatCard label="Основан" value={subj.founded_year} color={color} icon={Calendar} />}
            {subj.staff_count && <StatCard label="Персонал" value={subj.staff_count} unit="чел." color="#a78bfa" icon={Users} />}
            {subj.budget_annual && <StatCard label="Бюджет" value={fmt(subj.budget_annual)} color="#00e6c8" icon={BarChart2} />}
            {(subj as any).capital && <StatCard label="Капитал" value={fmt((subj as any).capital)} color="#4ade80" icon={TrendingUp} />}
            {(subj as any).uzbekistan_portfolio && <StatCard label="Портфель в УЗ" value={fmt((subj as any).uzbekistan_portfolio)} color="#60a5fa" icon={BarChart2} />}
            {(subj as any).total_assets && <StatCard label="Активы" value={fmt((subj as any).total_assets)} color="#00e6c8" icon={TrendingUp} />}
            {managedObjects.length > 0 && <StatCard label="Объектов" value={managedObjects.length} color={color} icon={Layers} />}
            {activeProjects.length > 0 && <StatCard label="Проектов" value={activeProjects.length} color="#60a5fa" icon={FileText} />}
          </div>
        </motion.div>

        {/* Critical indicators (for Ministry) */}
        {(subj as any).key_crises && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <div className="rounded-2xl p-5" style={{ background: "rgba(255,77,109,0.05)", border: "1px solid rgba(255,77,109,0.15)" }}>
              <h2 className="text-white font-bold text-base mb-4 flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-400" /> Критические показатели
              </h2>
              {(subj as any).key_crises.water_deficit && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl" style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.15)" }}>
                      <div className="text-white/40 text-xs mb-1">Вода на чел. (2008)</div>
                      <div className="font-black text-lg text-emerald-400">{(subj as any).key_crises.water_deficit.per_person_2008.toLocaleString("ru")} м³</div>
                    </div>
                    <div className="p-3 rounded-xl" style={{ background: "rgba(255,77,109,0.06)", border: "1px solid rgba(255,77,109,0.15)" }}>
                      <div className="text-white/40 text-xs mb-1">Вода на чел. (2022)</div>
                      <div className="font-black text-lg text-red-400">{(subj as any).key_crises.water_deficit.per_person_2022.toLocaleString("ru")} м³</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(251,146,60,0.06)", border: "1px solid rgba(251,146,60,0.15)" }}>
                    <TrendingDown size={16} className="text-orange-400 shrink-0" />
                    <div>
                      <div className="text-white font-semibold text-sm">Снижение за 14 лет: {Math.abs((subj as any).key_crises.water_deficit.change_percent)}%</div>
                      <div className="text-white/50 text-xs">Прогноз: дефицит {(subj as any).key_crises.water_deficit.forecast_2030_deficit_km3} млрд м³ к 2030</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Key indicators — premium */}
        <PremiumOverlay title="Ключевые показатели">
        {(subj as any).key_indicators && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="rounded-2xl p-5" style={{ background: "rgba(0,6,20,0.8)", border: `1px solid ${color}12` }}>
              <h2 className="text-white font-bold text-base mb-4 flex items-center gap-2">
                <BarChart2 size={16} style={{ color }} /> Ключевые показатели
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries((subj as any).key_indicators).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between p-2.5 rounded-xl"
                    style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <span className="text-white/40 text-xs">{k.replace(/_/g, " ")}</span>
                    <span className="text-white font-semibold text-sm">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        </PremiumOverlay>

        {/* Responsibilities */}
        {subj.responsibilities && (subj.responsibilities as string[]).length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="rounded-2xl p-5" style={{ background: "rgba(0,6,20,0.8)", border: `1px solid rgba(255,255,255,0.06)` }}>
              <h2 className="text-white font-bold text-base mb-3 flex items-center gap-2">
                <Shield size={16} style={{ color }} /> Функции и ответственность
              </h2>
              <div className="space-y-2">
                {(subj.responsibilities as string[]).map((r, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: color }} />
                    <p className="text-white/65 text-sm">{r}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* International partners */}
        {(subj as any).international_partners && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <div className="rounded-2xl p-5" style={{ background: "rgba(0,6,20,0.8)", border: "1px solid rgba(96,165,250,0.12)" }}>
              <h2 className="text-white font-bold text-base mb-4 flex items-center gap-2">
                <Globe size={16} style={{ color: "#60a5fa" }} /> Международные партнёры
              </h2>
              <div className="space-y-3">
                {(subj as any).international_partners.map((p: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: "rgba(96,165,250,0.05)", border: "1px solid rgba(96,165,250,0.1)" }}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: "rgba(96,165,250,0.12)" }}>
                      <Globe size={14} style={{ color: "#60a5fa" }} />
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-semibold text-sm">{p.org}</div>
                      <div className="text-white/50 text-xs">{p.program}</div>
                    </div>
                    {p.amount_mln && (
                      <span className="text-emerald-400 font-bold text-sm shrink-0">${p.amount_mln}M</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Managed objects */}
        {managedObjects.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h2 className="text-white font-bold text-base mb-3 flex items-center gap-2">
              <Layers size={16} style={{ color: "#00e6c8" }} /> Управляемые объекты
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {managedObjects.map(o => (
                <button key={o.id}
                  onClick={() => setLocation(`/hub/object/${o.id}`)}
                  className="flex items-center gap-3 p-3 rounded-xl text-left cursor-pointer transition-all hover:opacity-80"
                  style={{ background: "rgba(0,230,200,0.05)", border: "1px solid rgba(0,230,200,0.12)" }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "rgba(0,230,200,0.1)" }}>
                    <Layers size={14} style={{ color: "#00e6c8" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-semibold truncate">{o.name_ru}</div>
                    <div className="text-white/40 text-xs">{o.type_label}</div>
                  </div>
                  <ArrowRight size={12} className="text-white/30" />
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Contact info — premium */}
        <PremiumOverlay title="Контактные данные">
        {(subj.phone || subj.email || subj.website) && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <div className="rounded-2xl p-5" style={{ background: "rgba(0,6,20,0.8)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <h2 className="text-white font-bold text-base mb-3">Контакты</h2>
              <div className="space-y-2">
                {subj.phone && (
                  <div className="flex items-center gap-2.5 text-sm text-white/60">
                    <Phone size={13} style={{ color }} /> {subj.phone}
                  </div>
                )}
                {subj.email && (
                  <div className="flex items-center gap-2.5 text-sm text-white/60">
                    <Mail size={13} style={{ color }} /> {subj.email}
                  </div>
                )}
                {subj.website && (
                  <div className="flex items-center gap-2.5 text-sm text-white/60">
                    <ExternalLink size={13} style={{ color }} /> {subj.website}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        </PremiumOverlay>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 pb-8">
          {subj.tags.map(tag => (
            <span key={tag} className="px-2.5 py-1 rounded-full text-xs text-white/35"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
