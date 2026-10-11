import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  ChevronLeft, MapPin, Calendar, Users, DollarSign,
  FileText, Link2, FlaskConical, Microscope, Award,
  BookOpen, ExternalLink, Building2, Layers,
} from "lucide-react";
import { RD_MAP, type RDItem } from "@/data/rd-data";

const STAGE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  fundamental: { bg: "rgba(167,139,250,0.15)", text: "#a78bfa", border: "rgba(167,139,250,0.3)" },
  applied:     { bg: "rgba(0,180,255,0.15)",   text: "#00b4ff", border: "rgba(0,180,255,0.3)" },
  prototype:   { bg: "rgba(251,191,36,0.15)",  text: "#fbbf24", border: "rgba(251,191,36,0.3)" },
  pilot:       { bg: "rgba(74,222,128,0.15)",   text: "#4ade80", border: "rgba(74,222,128,0.3)" },
  commercial:  { bg: "rgba(0,230,200,0.15)",    text: "#00e6c8", border: "rgba(0,230,200,0.3)" },
};

function formatUSD(n: number | undefined): string {
  if (!n) return "—";
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

export default function RDDetailPage({ id }: { id: string }) {
  const [, navigate] = useLocation();
  const item: RDItem | undefined = RD_MAP[id];

  if (!item) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <motion.div {...fadeUp}>
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: "rgba(248,113,113,0.12)", border: "1px solid rgba(248,113,113,0.25)" }}>
            <FlaskConical size={28} style={{ color: "#f87171" }} />
          </div>
          <h1 className="text-2xl font-black text-white mb-2">R&D программа не найдена</h1>
          <p className="text-white/50 text-sm mb-6">
            Программа с идентификатором <span className="text-white/70 font-mono">{id}</span> не существует или была удалена.
          </p>
          <button
            onClick={() => navigate("/rd")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105"
            style={{ background: "rgba(0,230,200,0.12)", border: "1px solid rgba(0,230,200,0.25)", color: "#00e6c8" }}>
            <ChevronLeft size={16} />
            Вернуться к R&D
          </button>
        </motion.div>
      </div>
    );
  }

  const stageStyle = STAGE_COLORS[item.stage] ?? STAGE_COLORS.applied;

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-6">
      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate("/rd")}
        className="flex items-center gap-1.5 text-sm mb-5 group transition-colors"
        style={{ color: "rgba(255,255,255,0.45)" }}>
        <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
        <span className="group-hover:text-white/70 transition-colors">Назад к R&D</span>
      </motion.button>

      {/* Cover image */}
      {item.coverImage && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl overflow-hidden mb-6 h-48 sm:h-64">
          <img
            src={item.coverImage}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0"
            style={{ background: "linear-gradient(to top, rgba(0,12,32,0.95) 0%, rgba(0,12,32,0.3) 50%, transparent)" }} />
          <div className="absolute bottom-4 left-5 right-5">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold mb-2"
              style={{ background: stageStyle.bg, color: stageStyle.text, border: `1px solid ${stageStyle.border}` }}>
              {item.stage_label}
            </span>
          </div>
        </motion.div>
      )}

      {/* Title & status block */}
      <motion.div {...fadeUp} className="mb-6">
        <div className="flex flex-wrap items-start gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(0,230,200,0.1)", border: "1px solid rgba(0,230,200,0.2)" }}>
            <FlaskConical size={22} style={{ color: "#00e6c8" }} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-1">{item.name}</h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-white/40">
              <span className="font-mono">{item.id}</span>
              <span className="px-2 py-0.5 rounded-full font-semibold"
                style={{ background: "rgba(74,222,128,0.12)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.2)" }}>
                {item.status}
              </span>
            </div>
          </div>
        </div>
        <p className="text-white/55 text-sm leading-relaxed">{item.description}</p>
      </motion.div>

      {/* Key metrics row */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { icon: DollarSign, label: "Гранты", value: formatUSD(item.grant_total_usd), color: "#00e6c8" },
          { icon: BookOpen, label: "Публикации", value: String(item.publications_count), color: "#a78bfa" },
          { icon: Users, label: "Команда", value: String(item.researchers.length), color: "#00b4ff" },
          { icon: Award, label: "Грантодатели", value: String(item.grants.length), color: "#fbbf24" },
        ].map((m, i) => {
          const Icon = m.icon;
          return (
            <div key={i} className="rounded-2xl p-4 text-center"
              style={{ background: "linear-gradient(145deg, rgba(0,18,48,0.9), rgba(0,28,68,0.75))", border: `1px solid ${m.color}18`, backdropFilter: "blur(16px)" }}>
              <Icon size={16} style={{ color: m.color }} className="mx-auto mb-1.5" />
              <div className="text-xl font-black" style={{ color: m.color }}>{m.value}</div>
              <div className="text-white/40 text-xs mt-0.5">{m.label}</div>
            </div>
          );
        })}
      </motion.div>

      {/* Two-column layout */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Left column (2/3) */}
        <div className="lg:col-span-2 space-y-4">

          {/* Researchers */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="rounded-2xl p-5"
            style={{ background: "linear-gradient(145deg, rgba(0,14,40,0.95), rgba(0,25,60,0.85))", border: "1px solid rgba(0,230,200,0.1)", backdropFilter: "blur(18px)" }}>
            <div className="flex items-center gap-2 mb-4">
              <Users size={15} style={{ color: "#00e6c8" }} />
              <span className="text-white/60 text-xs font-semibold tracking-wider uppercase">Исследовательская команда</span>
            </div>
            <div className="space-y-3">
              {item.researchers.map((r, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl"
                  style={{ background: "rgba(0,230,200,0.04)", border: "1px solid rgba(0,230,200,0.08)" }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(0,230,200,0.1)", border: "1px solid rgba(0,230,200,0.15)" }}>
                    <span className="text-xs font-bold" style={{ color: "#00e6c8" }}>
                      {r.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-semibold">{r.name}</div>
                    <div className="text-white/40 text-xs">{r.role}</div>
                    {r.affiliation && (
                      <div className="text-white/30 text-xs mt-0.5 flex items-center gap-1">
                        <Building2 size={10} />
                        {r.affiliation}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Grants */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="rounded-2xl p-5"
            style={{ background: "linear-gradient(145deg, rgba(0,14,40,0.95), rgba(0,25,60,0.85))", border: "1px solid rgba(251,191,36,0.1)", backdropFilter: "blur(18px)" }}>
            <div className="flex items-center gap-2 mb-4">
              <DollarSign size={15} style={{ color: "#fbbf24" }} />
              <span className="text-white/60 text-xs font-semibold tracking-wider uppercase">Гранты и финансирование</span>
            </div>
            <div className="space-y-2">
              {item.grants.map((g, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl"
                  style={{ background: "rgba(251,191,36,0.04)", border: "1px solid rgba(251,191,36,0.08)" }}>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-semibold">{g.funder}</div>
                    {g.program && <div className="text-white/35 text-xs mt-0.5">{g.program}</div>}
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <div className="font-bold text-sm" style={{ color: "#fbbf24" }}>{formatUSD(g.amount_usd)}</div>
                    <div className="text-white/30 text-xs">{g.year}</div>
                  </div>
                </div>
              ))}
              {item.grant_total_usd && (
                <div className="flex items-center justify-between pt-3 mt-1"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <span className="text-white/50 text-xs font-semibold">Итого</span>
                  <span className="font-black text-lg" style={{ color: "#fbbf24" }}>{formatUSD(item.grant_total_usd)}</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Documents */}
          {item.documents.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="rounded-2xl p-5"
              style={{ background: "linear-gradient(145deg, rgba(0,14,40,0.95), rgba(0,25,60,0.85))", border: "1px solid rgba(0,164,255,0.1)", backdropFilter: "blur(18px)" }}>
              <div className="flex items-center gap-2 mb-4">
                <FileText size={15} style={{ color: "#00a4ff" }} />
                <span className="text-white/60 text-xs font-semibold tracking-wider uppercase">Документы</span>
              </div>
              <div className="space-y-2">
                {item.documents.map((d, i) => (
                  <a key={i} href={d.url} target="_blank" rel="noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl hover:scale-[1.01] transition-all"
                    style={{ background: "rgba(0,164,255,0.04)", border: "1px solid rgba(0,164,255,0.08)" }}>
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <FileText size={14} style={{ color: "#00a4ff" }} className="flex-shrink-0" />
                      <span className="text-white/70 text-sm truncate">{d.name}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      {d.size && <span className="text-white/25 text-xs">{d.size}</span>}
                      <ExternalLink size={12} className="text-white/20" />
                    </div>
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Right column (1/3) */}
        <div className="space-y-4">

          {/* Location */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="rounded-2xl p-5"
            style={{ background: "linear-gradient(145deg, rgba(0,14,40,0.95), rgba(0,25,60,0.85))", border: "1px solid rgba(0,230,200,0.1)", backdropFilter: "blur(18px)" }}>
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={15} style={{ color: "#00e6c8" }} />
              <span className="text-white/60 text-xs font-semibold tracking-wider uppercase">Локация</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">{item.location.address}</p>
            <div className="text-white/25 text-xs mt-2 font-mono">
              {item.location.lat.toFixed(4)}, {item.location.lng.toFixed(4)}
            </div>
          </motion.div>

          {/* Laboratory */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="rounded-2xl p-5"
            style={{ background: "linear-gradient(145deg, rgba(0,14,40,0.95), rgba(0,25,60,0.85))", border: "1px solid rgba(167,139,250,0.1)", backdropFilter: "blur(18px)" }}>
            <div className="flex items-center gap-2 mb-3">
              <Microscope size={15} style={{ color: "#a78bfa" }} />
              <span className="text-white/60 text-xs font-semibold tracking-wider uppercase">Лаборатория</span>
            </div>
            <p className="text-white/70 text-sm font-medium">{item.laboratory}</p>
          </motion.div>

          {/* Stage */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="rounded-2xl p-5"
            style={{ background: "linear-gradient(145deg, rgba(0,14,40,0.95), rgba(0,25,60,0.85))", border: `1px solid ${stageStyle.border}`, backdropFilter: "blur(18px)" }}>
            <div className="flex items-center gap-2 mb-3">
              <Layers size={15} style={{ color: stageStyle.text }} />
              <span className="text-white/60 text-xs font-semibold tracking-wider uppercase">Стадия</span>
            </div>
            <div className="inline-block px-3 py-1 rounded-full text-xs font-bold"
              style={{ background: stageStyle.bg, color: stageStyle.text, border: `1px solid ${stageStyle.border}` }}>
              {item.stage_label}
            </div>
            <div className="mt-3">
              <div className="text-white/40 text-xs mb-1.5">Статус</div>
              <div className="text-white/70 text-sm font-medium">{item.status}</div>
            </div>
          </motion.div>

          {/* Related items */}
          {item.related.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="rounded-2xl p-5"
              style={{ background: "linear-gradient(145deg, rgba(0,14,40,0.95), rgba(0,25,60,0.85))", border: "1px solid rgba(0,230,200,0.1)", backdropFilter: "blur(18px)" }}>
              <div className="flex items-center gap-2 mb-3">
                <Link2 size={15} style={{ color: "#00e6c8" }} />
                <span className="text-white/60 text-xs font-semibold tracking-wider uppercase">Связанные элементы</span>
              </div>
              <div className="space-y-2">
                {item.related.map((rel, i) => {
                  const typeLabels: Record<string, string> = {
                    project: "Проект", object: "Объект", subject: "Субъект",
                    rd: "R&D", solution: "Решение", contest: "Конкурс", hackathon: "Хакатон",
                  };
                  const typeColors: Record<string, string> = {
                    project: "#00e6c8", object: "#00b4ff", subject: "#fbbf24",
                    rd: "#a78bfa", solution: "#4ade80", contest: "#fb923c", hackathon: "#f472b6",
                  };
                  const color = typeColors[rel.type] ?? "#00e6c8";

                  const handleRelClick = () => {
                    if (rel.type === "rd" && RD_MAP[rel.id]) {
                      navigate(`/rd/${rel.id}`);
                    } else if (rel.type === "project") {
                      navigate(`/hub/project/${rel.id}`);
                    } else if (rel.type === "object") {
                      navigate(`/hub/object/${rel.id}`);
                    } else if (rel.type === "subject") {
                      navigate(`/hub/subject/${rel.id}`);
                    }
                  };

                  return (
                    <button key={i} onClick={handleRelClick}
                      className="w-full flex items-center gap-2.5 p-2.5 rounded-xl text-left hover:scale-[1.02] transition-all"
                      style={{ background: `${color}06`, border: `1px solid ${color}12` }}>
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
                      <div className="flex-1 min-w-0">
                        <div className="text-white/60 text-xs truncate">{rel.title}</div>
                        <div className="text-xs mt-0.5" style={{ color }}>{typeLabels[rel.type] ?? rel.type}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
