import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Droplets,
  FolderKanban,
  TrendingUp,
  MapPin,
  ChevronDown,
  CreditCard,
  Coins,
  Lock,
  ArrowRight,
  X,
  Users,
  Globe,
  Calculator,
} from "lucide-react";
import { Handshake } from "lucide-react";
import { useTranslation } from "react-i18next";
import { VODPROM_PROJECTS, VODPROM_SUBJECTS } from "@/data/vodprom-data";
import ROICalculator from "@/components/projects/ROICalculator";

// ─── Helpers ─────────────────────────────────────────────────

function parseBudgetM(budget: string): number {
  const num = parseFloat(budget.replace(/[^0-9.]/g, "")) || 0;
  return num;
}

function extractIRR(kpis: string[]): number | null {
  for (const k of kpis) {
    const m = k.match(/(\d+)%?\s*IRR/i);
    if (m) return parseInt(m[1], 10);
  }
  return null;
}

// ─── Stat Card ───────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  delay,
}: {
  icon: typeof Droplets;
  label: string;
  value: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="flex-1 min-w-0 rounded-2xl p-4 border"
      style={{
        background: "rgba(255,255,255,0.03)",
        borderColor: "rgba(255,255,255,0.08)",
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} style={{ color }} />
        <span className="text-white/45 text-xs font-medium">{label}</span>
      </div>
      <div className="text-xl font-black" style={{ color }}>
        {value}
      </div>
    </motion.div>
  );
}

// ─── Project Card ────────────────────────────────────────────

function ProjectCard({
  project,
  isExpanded,
  onToggleInvest,
  onDetails,
  index,
  investOptions,
  t,
}: {
  project: (typeof VODPROM_PROJECTS)[0];
  isExpanded: boolean;
  onToggleInvest: () => void;
  onDetails: () => void;
  index: number;
  investOptions: { id: string; icon: typeof CreditCard; title: string; subtitle: string; description: string; color: string; buttonLabel: string }[];
  t: (key: string) => string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.05, duration: 0.35 }}
      className="rounded-2xl border overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.03)",
        borderColor: isExpanded
          ? `${project.statusColor}40`
          : "rgba(255,255,255,0.08)",
      }}
    >
      <div className="p-4">
        {/* Top row: icon + name + budget */}
        <div className="flex items-start gap-3 mb-2">
          <span className="text-2xl shrink-0 mt-0.5">{project.icon}</span>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-sm leading-tight">
              {project.nameRu}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <MapPin size={11} className="text-white/30 shrink-0" />
              <span className="text-white/35 text-xs truncate">
                {project.location}
              </span>
            </div>
          </div>
          <span
            className="shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold"
            style={{
              background: "rgba(251,191,36,0.12)",
              color: "#fbbf24",
            }}
          >
            {project.budget}
          </span>
        </div>

        {/* Description */}
        <p
          className="text-white/40 text-xs leading-relaxed mb-3"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {project.description}
        </p>

        {/* KPI tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {project.kpis.slice(0, 3).map((kpi, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded-md text-[10px] font-medium"
              style={{
                background: `${project.statusColor}10`,
                color: project.statusColor,
                border: `1px solid ${project.statusColor}20`,
              }}
            >
              {kpi}
            </span>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={onDetails}
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white/60 hover:text-white transition-colors"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {t("invest.details")}
          </button>
          <button
            onClick={onToggleInvest}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold text-black flex items-center justify-center gap-1.5 transition-all"
            style={{
              background: isExpanded
                ? "rgba(255,255,255,0.1)"
                : `linear-gradient(135deg, ${project.statusColor}, ${project.statusColor}cc)`,
              color: isExpanded ? "rgba(255,255,255,0.6)" : "#000",
            }}
          >
            {isExpanded ? (
              <>
                {t("invest.collapse")} <ChevronDown size={12} className="rotate-180" />
              </>
            ) : (
              <>
                {t("invest.invest_btn")} <ArrowRight size={12} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Investment options expand */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div
              className="px-4 pb-4 pt-2 border-t space-y-2"
              style={{ borderColor: "rgba(255,255,255,0.06)" }}
            >
              <p className="text-white/30 text-[10px] uppercase tracking-wider font-semibold mb-2">
                {t("invest.choose_method")}
              </p>
              {investOptions.map((opt) => (
                <div
                  key={opt.id}
                  className="flex items-center gap-3 p-3 rounded-xl border transition-colors hover:border-white/15"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    borderColor: "rgba(255,255,255,0.06)",
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${opt.color}15` }}
                  >
                    <opt.icon size={16} style={{ color: opt.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-xs font-bold">
                      {opt.title}{" "}
                      <span className="text-white/30 font-normal">
                        {opt.subtitle}
                      </span>
                    </div>
                    <p className="text-white/30 text-[10px] leading-relaxed mt-0.5">
                      {opt.description}
                    </p>
                  </div>
                  <button
                    className="shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors"
                    style={{
                      background: `${opt.color}18`,
                      color: opt.color,
                      border: `1px solid ${opt.color}30`,
                    }}
                  >
                    {opt.buttonLabel}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Project Detail Modal ────────────────────────────────────

function ProjectDetailModal({
  project,
  onClose,
  t,
}: {
  project: (typeof VODPROM_PROJECTS)[0];
  onClose: () => void;
  t: (key: string) => string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border p-6"
        style={{
          background: "rgba(0,12,32,0.97)",
          borderColor: "rgba(255,255,255,0.1)",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-5">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl border"
            style={{
              background: `${project.statusColor}08`,
              borderColor: `${project.statusColor}20`,
            }}
          >
            {project.icon}
          </div>
          <div>
            <h2 className="text-white font-black text-lg leading-tight">
              {project.nameRu}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <MapPin size={12} className="text-white/30" />
              <span className="text-white/40 text-xs">{project.location}</span>
              {project.timeline && (
                <>
                  <span className="text-white/15 mx-1">|</span>
                  <span className="text-white/40 text-xs">
                    {project.timeline}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Budget + Status */}
        <div className="flex gap-3 mb-5">
          <div
            className="flex-1 rounded-xl p-3 border"
            style={{
              background: "rgba(251,191,36,0.06)",
              borderColor: "rgba(251,191,36,0.15)",
            }}
          >
            <div className="text-white/35 text-[10px] uppercase tracking-wider font-semibold mb-1">
              {t("invest.modal_budget")}
            </div>
            <div className="text-yellow-400 font-black text-lg">
              {project.budget}
            </div>
          </div>
          <div
            className="flex-1 rounded-xl p-3 border"
            style={{
              background: `${project.statusColor}08`,
              borderColor: `${project.statusColor}15`,
            }}
          >
            <div className="text-white/35 text-[10px] uppercase tracking-wider font-semibold mb-1">
              {t("invest.modal_status")}
            </div>
            <div className="font-bold text-sm" style={{ color: project.statusColor }}>
              {project.status === "active"
                ? t("invest.status_active")
                : project.status === "funded"
                  ? t("invest.status_funded")
                  : project.status === "planning"
                    ? t("invest.status_planning")
                    : t("invest.status_completed")}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-5">
          <h4 className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">
            {t("invest.modal_description")}
          </h4>
          <p className="text-white/55 text-sm leading-relaxed">
            {project.description}
          </p>
        </div>

        {/* Impact */}
        <div className="mb-5">
          <h4 className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">
            {t("invest.modal_impact")}
          </h4>
          <p className="text-green-400/80 text-sm font-medium">
            {project.impact}
          </p>
        </div>

        {/* KPIs */}
        <div className="mb-5">
          <h4 className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">
            {t("invest.modal_kpis")}
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {project.kpis.map((kpi, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-lg text-xs font-medium"
                style={{
                  background: `${project.statusColor}10`,
                  color: project.statusColor,
                  border: `1px solid ${project.statusColor}20`,
                }}
              >
                {kpi}
              </span>
            ))}
          </div>
        </div>

        {/*
          Owners. Здесь перечислены МВХР Узбекистана, World Bank, ЕБРР, UNDP,
          IFAS и другие. Это стороны, названные в описании проекта, а не
          подтверждённые соглашения платформы: соглашений с международными
          институтами у платформы нет, подключённых партнёров ноль. Заголовок
          и подпись сказаны так, чтобы список нельзя было прочитать как
          состав участников на нашей стороне.
        */}
        <div className="mb-5">
          <h4 className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">
            Стороны, названные в описании проекта
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {project.owners.map((owner, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-lg text-xs text-white/50 bg-white/5 border border-white/08"
              >
                {owner}
              </span>
            ))}
          </div>
          <p className="mt-2 text-[10px] leading-snug text-white/30">
            Перечисление не означает соглашения с платформой и не подтверждает
            участия этих организаций в её работе. Источники описаний в корпусе
            пока не закреплены: ⟨заполнить⟩.
          </p>
        </div>

        {/* Risks */}
        {project.risks && (
          <div className="mb-5">
            <h4 className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">
              {t("invest.modal_risks")}
            </h4>
            <p className="text-red-400/60 text-xs leading-relaxed">
              {project.risks}
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────────

type PageTab = "projects" | "roi";

export default function InvestFlowPage() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<PageTab>("projects");
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [detailProject, setDetailProject] = useState<
    (typeof VODPROM_PROJECTS)[0] | null
  >(null);

  // Investment options (inside component to use t())
  const investOptions = [
    {
      id: "fiat",
      icon: CreditCard,
      title: t("invest.option_fiat_title"),
      subtitle: t("invest.option_fiat_subtitle"),
      description: t("invest.option_fiat_desc"),
      color: "#60a5fa",
      buttonLabel: t("invest.option_fiat_btn"),
    },
    {
      id: "crypto",
      icon: Coins,
      title: t("invest.option_crypto_title"),
      subtitle: t("invest.option_crypto_subtitle"),
      description: t("invest.option_crypto_desc"),
      color: "#a78bfa",
      buttonLabel: t("invest.option_crypto_btn"),
    },
    {
      id: "staking",
      icon: Lock,
      title: t("invest.option_staking_title"),
      subtitle: t("invest.option_staking_subtitle"),
      description: t("invest.option_staking_desc"),
      color: "#4ade80",
      buttonLabel: t("invest.option_staking_btn"),
    },
  ];

  // Compute stats from project data
  const stats = useMemo(() => {
    let totalBudgetM = 0;
    const irrs: number[] = [];

    for (const p of VODPROM_PROJECTS) {
      totalBudgetM += parseBudgetM(p.budget);
      const irr = extractIRR(p.kpis);
      if (irr !== null) irrs.push(irr);
    }

    const avgIRR =
      irrs.length > 0
        ? (irrs.reduce((a, b) => a + b, 0) / irrs.length).toFixed(0)
        : "N/A";

    return {
      totalBudget: totalBudgetM >= 1000
        ? `$${(totalBudgetM / 1000).toFixed(1)}B+`
        : `$${totalBudgetM.toFixed(0)}M+`,
      projectCount: VODPROM_PROJECTS.length,
      avgIRR: avgIRR !== "N/A" ? `${avgIRR}%` : avgIRR,
    };
  }, []);

  // Key ecosystem subjects
  const keySubjects = VODPROM_SUBJECTS.filter((s) =>
    ["international_org", "state_agency", "research"].includes(s.type)
  ).slice(0, 8);

  return (
    <div
      className="min-h-screen pt-14 pb-8 px-4"
    >
      <div className="max-w-2xl mx-auto">
        {/* ── Header ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-8 pt-4"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <Droplets size={20} className="text-cyan-400" />
            <h1 className="text-white font-black text-xl sm:text-2xl tracking-tight">
              {t("invest.title")}
            </h1>
          </div>
          <p className="text-white/35 text-sm">
            {t("invest.subtitle")}
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-[12.5px] leading-relaxed text-white/40">
            Платформа не привлекает средства, не выпускала токен и не обещает доходности.
            Ниже — отраслевые проекты Центральной Азии, которые платформа описывает, а не
            продаёт. Бюджеты и показатели вроде IRR взяты из описаний самих проектов; их
            источники в корпусе пока не закреплены: ⟨заполнить⟩. Читать их следует как
            заявленные, а не как проверенные платформой.
          </p>
        </motion.div>

        {/* ── Stats ──────────────────────────────────────────── */}
        <div className="flex gap-3 mb-8">
          <StatCard
            icon={TrendingUp}
            label={t("invest.total_volume")}
            value={stats.totalBudget}
            color="#fbbf24"
            delay={0.1}
          />
          <StatCard
            icon={FolderKanban}
            label={t("invest.projects_count")}
            value={String(stats.projectCount)}
            color="#22d3ee"
            delay={0.15}
          />
          {/*
            Здесь стояла карточка «Средний IRR» — усреднённая доходность по
            проектам, вынесенная в шапку страницы с названием «Инвестиции».
            Платформа не привлекает средства и не может обещать доходность,
            а сами значения IRR лежат в описаниях проектов без указания
            источника расчёта. Усреднять их и показывать как показатель
            платформы значило бы делать предложение, которого нет.
            Вместо доходности — число подключённых партнёров, и оно ноль.
          */}
          <StatCard
            icon={Handshake}
            label="Подключено партнёров"
            value="0"
            color="#94a3b8"
            delay={0.2}
          />
        </div>

        {/* ── Tab bar ────────────────────────────────────────── */}
        <div
          className="flex gap-1 mb-6 p-1 rounded-2xl"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {(
            [
              { id: "projects" as PageTab, label: t("invest.tab_projects") || "Проекты", icon: FolderKanban },
              { id: "roi" as PageTab, label: "Калькулятор ROI", icon: Calculator },
            ] as { id: PageTab; label: string; icon: typeof FolderKanban }[]
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: activeTab === id ? "rgba(0,230,200,0.12)" : "transparent",
                color: activeTab === id ? "#00e6c8" : "rgba(255,255,255,0.35)",
                border: activeTab === id ? "1px solid rgba(0,230,200,0.2)" : "1px solid transparent",
              }}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>

        {/* ── Projects tab ──────────────────────────────────── */}
        {activeTab === "projects" && (
          <>
            <div className="mb-8">
              <h2 className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-4">
                {t("invest.available_projects")}
              </h2>
              <div className="space-y-3">
                {VODPROM_PROJECTS.map((project, idx) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    isExpanded={expandedProject === project.id}
                    onToggleInvest={() =>
                      setExpandedProject(
                        expandedProject === project.id ? null : project.id
                      )
                    }
                    onDetails={() => setDetailProject(project)}
                    index={idx}
                    investOptions={investOptions}
                    t={t}
                  />
                ))}
              </div>
            </div>

            {/* ── Partners / Subjects ──────────────────────────── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mb-4"
            >
              <div className="flex items-center gap-2 mb-4">
                <Users size={14} className="text-white/30" />
                <h2 className="text-white/50 text-xs font-semibold uppercase tracking-wider">
                  {t("invest.ecosystem_partners")}
                </h2>
              </div>
              <div
                className="rounded-2xl border p-4"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  borderColor: "rgba(255,255,255,0.06)",
                }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {keySubjects.map((s) => {
                    const roleColors: Record<string, string> = {
                      critical: "#ff4d6d",
                      promising: "#fbbf24",
                      partner: "#00b4ff",
                      infrastructure: "#a78bfa",
                      monitoring: "#4ade80",
                    };
                    const color = roleColors[s.role] ?? "#00e6c8";
                    return (
                      <div
                        key={s.id}
                        className="flex items-center gap-2.5 py-2 px-2 rounded-lg hover:bg-white/3 transition-colors"
                      >
                        <div
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ background: color }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-white/65 text-xs font-medium truncate">
                            {s.nameRu}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Globe size={9} className="text-white/20" />
                            <span className="text-white/25 text-[10px]">
                              {s.country}
                            </span>
                          </div>
                        </div>
                        {s.budget && (
                          <span
                            className="text-[10px] font-bold shrink-0"
                            style={{ color }}
                          >
                            {s.budget}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}

        {/* ── ROI Calculator tab ────────────────────────────── */}
        {activeTab === "roi" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <ROICalculator />
          </motion.div>
        )}
      </div>

      {/* ── CTA: Подать заявку ───────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="max-w-2xl mx-auto px-4 pb-10"
      >
        <div
          className="rounded-2xl p-6 text-center"
          style={{ background: "rgba(0,230,200,0.06)", border: "1px solid rgba(0,230,200,0.18)" }}
        >
          {/*
            Здесь была крупная кнопка «Подать заявку», ведущая на форму с
            реквизитами для перевода. Форма снята, приём средств прекращён.
            Кнопка заменена на вход, с которого разговор действительно
            начинается, — и на ссылку с разбором того, что было снято.
          */}
          <h3 className="text-white font-black text-lg mb-1">
            Платформа не привлекает средства
          </h3>
          <p className="text-white/45 text-sm mb-4 max-w-xl mx-auto leading-relaxed">
            Заявки на инвестицию не принимаются: юридической формы привлечения нет, токен не
            выпущен, доходность не обещается. Разговор о совместной работе начинается с
            партнёрского входа, и денег на входе не просят.
          </p>
          <button
            onClick={() => setLocation("/partners")}
            className="px-8 py-3 rounded-xl font-bold text-black text-sm transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, #00e6c8, #00b4ff)" }}
          >
            Партнёрские входы
          </button>
          <div className="mt-3">
            <button
              onClick={() => setLocation("/invest/apply")}
              className="text-xs text-white/40 hover:text-white/70 underline underline-offset-2"
            >
              Что было на форме заявки и почему она снята
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Detail Modal ──────────────────────────────────────── */}
      <AnimatePresence>
        {detailProject && (
          <ProjectDetailModal
            project={detailProject}
            onClose={() => setDetailProject(null)}
            t={t}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
