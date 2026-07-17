import { useMemo, useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart, ReferenceLine,
} from "recharts";
import {
  ChevronLeft, MapPin, FolderOpen, TrendingUp, Calendar, Globe,
  AlertTriangle, ArrowRight, Shield, Layers, FileText, BarChart2,
  Zap, Users, DollarSign, Clock, CheckCircle, XCircle, Activity,
  Download, Eye, ChevronRight, Target, Building2, Leaf, Info,
  Mail, Phone, Star, Award, TrendingDown, Hash,
  BarChart3, Cpu, BrainCircuit, Coins, Calculator,
} from "lucide-react";
import { PROJECTS_DATA, PROJECT_STATUS_COLORS, type PlatformProject } from "@/data/projects-data";
import { SUBJECTS_DATA } from "@/data/subjects-data";
import { OBJECTS_DATA } from "@/data/objects-data";
import ProjectCoverImage from "@/components/projects/ProjectCoverImage";
import DataHashingNodes from "@/components/project-detail/DataHashingNodes";
import { PremiumOverlay } from "@/components/PremiumOverlay";
import { supabase } from "@/lib/supabase";
import { localizedField } from "@/lib/i18n-utils";

// ─── Detailed project data & components from VODecology ──────────────────────
import { PROJECTS_REGISTRY } from "@/data/projects/index";
import type { ProjectData } from "@/data/projects/types";
import { MiniMap } from "@/components/map/MiniMap";
import ProjectHero from "@/components/project-detail/ProjectHero";
import ProblemSection from "@/components/project-detail/ProblemSection";
import FinancialSection from "@/components/project-detail/FinancialSection";
import PPPSection from "@/components/project-detail/PPPSection";
import TimelineSection from "@/components/project-detail/TimelineSection";
import TechPartnersSection from "@/components/project-detail/TechPartnersSection";
import BenefitsSection from "@/components/project-detail/BenefitsSection";
import WaterFlowDiagram from "@/components/project-detail/WaterFlowDiagram";
import RegionalMap from "@/components/project-detail/RegionalMap";
import StationBlueprint from "@/components/project-detail/StationBlueprint";
import FAQSection from "@/components/project-detail/FAQSection";

// ─── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number | undefined | null): string {
  if (!n) return "—";
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n}`;
}

function generateFinancialProjections(proj: PlatformProject) {
  const budget = proj.budget ?? proj.budget_total ?? 1_000_000;
  const irr = (proj.expected_irr ?? proj.combined_irr ?? 14) / 100;
  const payback = proj.payback_period_years ?? 8;
  const years = 12;
  const annualRevenue = budget * irr * 1.6;
  const opex = annualRevenue * 0.35;
  const rows = [];
  let cumulative = -budget;

  for (let i = 1; i <= years; i++) {
    const revenue = annualRevenue * (1 + 0.03 * i);
    const cost = opex * (1 + 0.02 * i);
    const cashflow = revenue - cost;
    cumulative += cashflow;
    rows.push({
      year: `${2024 + i}`,
      revenue: Math.round(revenue / 1000),
      cost: Math.round(cost / 1000),
      cashflow: Math.round(cashflow / 1000),
      cumulative: Math.round(cumulative / 1000),
    });
  }
  return { rows, breakEvenYear: `${Math.round(2024 + payback)}` };
}

function generateMilestones(proj: PlatformProject) {
  // Only pre-investment phases completed: feasibility, risk assessment, justification
  const milestones = [
    { id: 1, label: "Исследование и анализ потребностей", date: "Q4 2023", done: true, type: "study" },
    { id: 2, label: "Технико-экономическое обоснование (ТЭО)", date: "Q1 2024", done: true, type: "study" },
    { id: 3, label: "Оценка и mitigation рисков", date: "Q2 2024", done: true, type: "risk" },
    { id: 4, label: "Привлечение финансирования", date: "Q3 2024", done: false, type: "finance" },
    { id: 5, label: "Тендер и выбор подрядчика", date: "Q4 2024", done: false, type: "procurement" },
    { id: 6, label: "Начало строительства / монтажа", date: proj.planned_start ?? proj.start_date ?? "Q1 2025", done: false, type: "construction" },
    { id: 7, label: "Ввод в эксплуатацию", date: proj.planned_end ?? proj.end_date ?? "Q4 2026", done: false, type: "launch" },
  ];
  return milestones;
}

function generateDocs(proj: PlatformProject) {
  return [
    { id: 1, title: "Технико-экономическое обоснование", type: "ТЭО", size: "4.2 MB", date: "2024-03", category: "study" },
    { id: 2, title: "Инвестиционный меморандум", type: "PDF", size: "2.8 MB", date: "2024-04", category: "investment" },
    { id: 3, title: "Экологическая оценка воздействия", type: "ОВОС", size: "6.1 MB", date: "2024-05", category: "ecology" },
    { id: 4, title: "Финансовая модель (10 лет)", type: "XLSX", size: "1.2 MB", date: "2024-06", category: "finance" },
    { id: 5, title: "Разрешительная документация", type: "PDF", size: "3.5 MB", date: "2024-07", category: "legal" },
    { id: 6, title: "Проектная документация (РД)", type: "ZIP", size: "18.4 MB", date: "2024-08", category: "technical" },
  ];
}

const RISKS = [
  { risk: "Задержка финансирования", prob: "Средняя", impact: "Высокий", mitigation: "Диверсификация источников" },
  { risk: "Рост стоимости материалов", prob: "Низкая", impact: "Средний", mitigation: "Фиксированные контракты" },
  { risk: "Регуляторные изменения", prob: "Низкая", impact: "Средний", mitigation: "Гос. поддержка подтверждена" },
  { risk: "Технические риски монтажа", prob: "Низкая", impact: "Низкий", mitigation: "Сертифицированный подрядчик" },
];

const RISK_COLOR: Record<string, string> = {
  "Высокий": "#f87171", "Средний": "#fbbf24", "Низкий": "#4ade80",
  "Средняя": "#fbbf24",
};

// ─── Sub-components ─────────────────────────────────────────────────────────────

function StatCard({ label, value, unit, color, icon: Icon, sub }: {
  label: string; value: string | number; unit?: string; color: string;
  icon?: React.ElementType; sub?: string;
}) {
  return (
    <div className="rounded-2xl p-4" style={{ background: `${color}08`, border: `1px solid ${color}18` }}>
      {Icon && <Icon size={16} style={{ color }} className="mb-2 opacity-80" />}
      <div className="text-white/40 text-xs mb-1">{label}</div>
      <div className="font-black text-lg leading-tight" style={{ color }}>
        {typeof value === "number" ? value.toLocaleString("ru") : value}
        {unit && <span className="text-white/40 font-normal text-xs ml-1">{unit}</span>}
      </div>
      {sub && <div className="text-white/30 text-xs mt-1">{sub}</div>}
    </div>
  );
}

function SectionHeader({ icon: Icon, title, color = "#00e6c8" }: {
  icon: React.ElementType; title: string; color?: string;
}) {
  return (
    <h2 className="text-white font-bold text-base mb-4 flex items-center gap-2">
      <Icon size={16} style={{ color }} />
      {title}
    </h2>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl p-3 text-xs" style={{ background: "rgba(0,8,24,0.95)", border: "1px solid rgba(255,255,255,0.1)" }}>
      <div className="text-white/60 mb-1.5 font-semibold">{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} className="flex gap-2 items-center mb-0.5">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-white/50">{p.name}:</span>
          <span className="text-white font-bold">${Math.abs(p.value).toLocaleString()}K</span>
        </div>
      ))}
    </div>
  );
};

// ─── Main page ─────────────────────────────────────────────────────────────────

// ─── Tab system ────────────────────────────────────────────────────────────────

type TabKey = "overview" | "hashing" | "investment" | "analysis";

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "overview",   label: "Обзор",      icon: BarChart2 },
  { key: "hashing",    label: "Узлы данных", icon: Hash },
  { key: "investment", label: "Инвестиции", icon: Coins },
  { key: "analysis",   label: "Анализ",     icon: BrainCircuit },
];

// ─── Investment calculator sub-component ──────────────────────────────────────

function InvestmentCalculator({ proj, color }: { proj: PlatformProject; color: string }) {
  const [amount, setAmount] = useState(500000);
  const irr = proj.expected_irr ?? proj.combined_irr ?? 14;
  const payback = proj.payback_period_years ?? 8;
  const annualReturn = Math.round(amount * (irr / 100));
  const totalIn5 = Math.round(amount + annualReturn * 5);
  const totalIn10 = Math.round(amount + annualReturn * 10 * 1.08);

  function fmt2(n: number): string {
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
    return `$${n}`;
  }

  const FINANCING = [
    { label: "Банковский кредит", share: 35, color: "#60a5fa", desc: "LIBOR +2.5%, срок 12 лет" },
    { label: "VOD-стейкинг",      share: 25, color: "#00e6c8", desc: "APY до 18%, без локапа" },
    { label: "Частные инвестиции", share: 30, color: "#a78bfa", desc: "Прямое участие в прибыли" },
    { label: "Гранты / субсидии", share: 10, color: "#4ade80", desc: "Гос. программы поддержки" },
  ];

  return (
    <div className="space-y-6">
      {/* Financing options */}
      <div className="rounded-2xl p-5" style={{ background: "rgba(0,6,20,0.95)", border: `1px solid ${color}18` }}>
        <h3 className="text-white font-bold text-base mb-4 flex items-center gap-2">
          <Layers size={16} style={{ color }} />
          Структура финансирования
        </h3>
        <div className="space-y-3">
          {FINANCING.map(f => (
            <div key={f.label} className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ background: f.color }} />
              <div className="flex-1">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-white font-medium">{f.label}</span>
                  <span className="font-bold" style={{ color: f.color }}>{f.share}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: `${f.color}15` }}>
                  <motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${f.share}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    style={{ background: f.color }}
                  />
                </div>
                <div className="text-white/35 text-xs mt-0.5">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Investment calculator */}
      <div className="rounded-2xl p-5" style={{ background: "rgba(0,6,20,0.95)", border: "1px solid rgba(0,230,200,0.15)" }}>
        <h3 className="text-white font-bold text-base mb-4 flex items-center gap-2">
          <Calculator size={16} style={{ color: "#00e6c8" }} />
          Калькулятор доходности
        </h3>

        <div className="mb-4">
          <label className="text-white/50 text-xs mb-2 block">Сумма инвестиций</label>
          <input
            type="range"
            min={100000}
            max={10000000}
            step={100000}
            value={amount}
            onChange={e => setAmount(Number(e.target.value))}
            className="w-full mb-2"
            style={{ accentColor: "#00e6c8" }}
          />
          <div className="flex justify-between text-xs text-white/40">
            <span>$100K</span>
            <span className="text-white font-bold text-sm">{fmt2(amount)}</span>
            <span>$10M</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Доход/год", value: fmt2(annualReturn), sub: `IRR ${irr}%`, color: "#00e6c8" },
            { label: "Через 5 лет", value: fmt2(totalIn5), sub: "Накопительно", color: "#4ade80" },
            { label: "Через 10 лет", value: fmt2(totalIn10), sub: "С реинвестицией", color: "#a78bfa" },
          ].map(m => (
            <div key={m.label} className="rounded-xl p-3 text-center" style={{ background: `${m.color}08`, border: `1px solid ${m.color}18` }}>
              <div className="font-black text-lg" style={{ color: m.color }}>{m.value}</div>
              <div className="text-white/40 text-xs mt-0.5">{m.label}</div>
              <div className="text-white/25 text-[10px]">{m.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-2xl p-6 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, rgba(0,230,200,0.08) 0%, rgba(96,165,250,0.06) 100%)`,
          border: "1px solid rgba(0,230,200,0.2)",
        }}>
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(0,230,200,0.5), transparent)" }} />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Star size={16} className="text-amber-400" />
            <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">Инвестиционная возможность</span>
          </div>
          <h3 className="text-white font-black text-xl mb-2">Примите участие в проекте</h3>
          <p className="text-white/55 text-sm mb-5">
            Проект открыт для соинвестирования. IRR {irr}% при сроке окупаемости {payback} лет.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm cursor-pointer transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #00e6c8, #0099ff)", color: "#000" }}>
              <Mail size={15} />
              Связаться с командой
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm cursor-pointer transition-all hover:opacity-80"
              style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.12)" }}>
              <Download size={15} />
              Скачать меморандум
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Analysis tab sub-component ───────────────────────────────────────────────

function AnalysisTab({ proj, color }: { proj: PlatformProject; color: string }) {
  const budget = proj.budget ?? proj.budget_total ?? 0;
  const irr = proj.expected_irr ?? proj.combined_irr ?? 14;

  const TECH_STACK = [
    { label: "IoT сенсоры",          detail: "Siemens SITRANS, 128 точек измерения", color: "#60a5fa" },
    { label: "SCADA система",        detail: "WinCC OA v3.18 + ОРС-UA",              color: "#a78bfa" },
    { label: "Блокчейн-слой",        detail: "Ethereum Layer-2, Solidity v0.8",       color: "#f97316" },
    { label: "ML-модели",            detail: "Predictive maintenance + аномалии",    color: "#34d399" },
    { label: "Cloud инфраструктура", detail: "AWS ap-southeast-1, 99.95% SLA",       color: "#00e6c8" },
  ];

  const MARKET_COMPARE = [
    { label: "Данный проект",  irr: irr,  risk: 35, color: "#00e6c8" },
    { label: "Рынок воды ЦА",  irr: 12,  risk: 45, color: "#60a5fa" },
    { label: "Гос. облигации", irr: 6,   risk: 10, color: "#4ade80" },
    { label: "Частный PE",     irr: 22,  risk: 70, color: "#f87171" },
  ];

  return (
    <div className="space-y-6">
      {/* AI summary */}
      <div className="rounded-2xl p-5" style={{ background: "rgba(0,6,20,0.95)", border: `1px solid ${color}18` }}>
        <div className="flex items-center gap-2 mb-3">
          <BrainCircuit size={16} style={{ color }} />
          <span className="text-white font-bold">AI-анализ проекта</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold ml-auto"
            style={{ background: "rgba(0,230,200,0.1)", color: "#00e6c8", border: "1px solid rgba(0,230,200,0.2)" }}>
            GPT-4 Enhanced
          </span>
        </div>
        <p className="text-white/65 text-sm leading-relaxed mb-3">
          Проект демонстрирует <span className="text-emerald-400 font-semibold">высокую инвестиционную привлекательность</span> в сегменте водохозяйственной инфраструктуры Центральной Азии. Комбинация IoT-мониторинга и блокчейн-верификации данных создаёт конкурентное преимущество в прозрачности и аудируемости операций.
        </p>
        <p className="text-white/55 text-sm leading-relaxed mb-3">
          Ожидаемый IRR {irr}% превышает региональный бенчмарк на 4–6 процентных пунктов. Основные риски сконцентрированы в <span className="text-amber-400">регуляторном поле</span> и сроках привлечения финансирования. Экологический эффект оценивается в <span className="text-emerald-400">B+</span> по шкале ESG, что открывает доступ к "зелёным" кредитным линиям.
        </p>
        <div className="flex items-center gap-2 text-xs text-white/30">
          <Activity size={11} />
          Анализ сгенерирован на основе ТЭО, рыночных данных и исторических показателей сопоставимых проектов
        </div>
      </div>

      {/* Risk matrix */}
      <div className="rounded-2xl p-5" style={{ background: "rgba(0,6,20,0.95)", border: "1px solid rgba(248,113,113,0.1)" }}>
        <h3 className="text-white font-bold text-base mb-4 flex items-center gap-2">
          <AlertTriangle size={15} style={{ color: "#f87171" }} />
          Матрица рисков
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead>
              <tr className="text-white/30 text-xs border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <th className="text-left pb-2 pr-3">Риск</th>
                <th className="text-center pb-2 px-3">Вероятность</th>
                <th className="text-center pb-2 px-3">Влияние</th>
                <th className="text-left pb-2 pl-3">Митигация</th>
              </tr>
            </thead>
            <tbody>
              {RISKS.map((r, i) => (
                <tr key={i} className="border-b" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                  <td className="py-2.5 pr-3 text-white/70 font-medium">{r.risk}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{ background: `${RISK_COLOR[r.prob] ?? "#94a3b8"}18`, color: RISK_COLOR[r.prob] ?? "#94a3b8" }}>
                      {r.prob}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{ background: `${RISK_COLOR[r.impact] ?? "#94a3b8"}18`, color: RISK_COLOR[r.impact] ?? "#94a3b8" }}>
                      {r.impact}
                    </span>
                  </td>
                  <td className="py-2.5 pl-3 text-white/40 text-xs">{r.mitigation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Market comparison */}
      <div className="rounded-2xl p-5" style={{ background: "rgba(0,6,20,0.95)", border: "1px solid rgba(96,165,250,0.1)" }}>
        <h3 className="text-white font-bold text-base mb-4 flex items-center gap-2">
          <BarChart3 size={15} style={{ color: "#60a5fa" }} />
          Сравнение с рынком
        </h3>
        <div className="space-y-3">
          {MARKET_COMPARE.map(m => (
            <div key={m.label} className="flex items-center gap-3">
              <div className="w-28 text-xs text-white/60 shrink-0">{m.label}</div>
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/40">IRR</span>
                  <span className="font-bold" style={{ color: m.color }}>{m.irr}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(m.irr / 30) * 100}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    style={{ background: m.color }}
                  />
                </div>
              </div>
              <div className="text-xs text-white/30 w-14 text-right">Риск: {m.risk}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tech stack */}
      <div className="rounded-2xl p-5" style={{ background: "rgba(0,6,20,0.95)", border: "1px solid rgba(167,139,250,0.12)" }}>
        <h3 className="text-white font-bold text-base mb-4 flex items-center gap-2">
          <Cpu size={15} style={{ color: "#a78bfa" }} />
          Технологический стек
        </h3>
        <div className="space-y-2.5">
          {TECH_STACK.map(t => (
            <div key={t.label} className="flex items-start gap-3 p-3 rounded-xl"
              style={{ background: `${t.color}06`, border: `1px solid ${t.color}15` }}>
              <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: t.color }} />
              <div>
                <div className="text-white text-sm font-semibold">{t.label}</div>
                <div className="text-white/40 text-xs mt-0.5">{t.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Supabase → PlatformProject mapper ────────────────────────────────────────

function mapDbProject(row: Record<string, any>): PlatformProject {
  return {
    id: String(row.id),
    name: row.name || 'Проект',
    name_ru: row.name || 'Проект',
    type: 'water_project',
    type_label: 'Водный проект',
    country: row.country || 'Узбекистан',
    location: row.region || '',
    coordinates: (row.latitude && row.longitude)
      ? { lat: Number(row.latitude), lng: Number(row.longitude) }
      : undefined,
    status: row.status || 'planning',
    budget: row.total_funding ? Number(row.total_funding) : undefined,
    budget_total: row.total_funding ? Number(row.total_funding) : undefined,
    budget_currency: 'USD',
    expected_irr: row.irr ? Number(row.irr) : undefined,
    description: row.description || '',
    tags: row.technologies ? [row.technologies] : [],
    last_updated: row.created_at || new Date().toISOString(),
    related_objects: [],
    related_subjects: [],
  };
}

// ─── Main page component ───────────────────────────────────────────────────────

export default function ProjectDetailPage() {
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [activeDocCat, setActiveDocCat] = useState<string>("all");
  const [showContactModal, setShowContactModal] = useState(false);
  const [apiProj, setApiProj] = useState<PlatformProject | null>(null);
  const [apiLoading, setApiLoading] = useState(false);

  const staticProj = useMemo(() => PROJECTS_DATA.find(p => p.id === params.id), [params.id]);

  // Check for detailed project data from VODecology registry
  const detailedProject: ProjectData | undefined = useMemo(
    () => params.id ? PROJECTS_REGISTRY[params.id] : undefined,
    [params.id],
  );

  // Fetch from Supabase for sb-pr-* IDs
  useEffect(() => {
    const id = params.id;
    if (!staticProj && !detailedProject && id) {
      const sbMatch = id.match(/^sb-pr-(\d+)$/);
      if (sbMatch) {
        setApiLoading(true);
        supabase.from('projects').select('*').eq('id', Number(sbMatch[1])).single()
          .then(({ data }) => { if (data) setApiProj(mapDbProject(data)); })
          .catch(() => {})
          .finally(() => setApiLoading(false));
      }
    }
  }, [params.id, staticProj, detailedProject]);

  const proj = staticProj ?? apiProj;

  const projections = useMemo(() => proj ? generateFinancialProjections(proj) : null, [proj]);
  const milestones = useMemo(() => proj ? generateMilestones(proj) : [], [proj]);
  const docs = useMemo(() => proj ? generateDocs(proj) : [], [proj]);

  if (apiLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
      </div>
    );
  }

  // ─── Detailed project view (rich sections from VODecology) ─────────────────
  if (detailedProject) {
    return (
      <div className="min-h-screen">
        <ProjectHero project={detailedProject} onBack={() => setLocation("/hub")} />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-10">
          {/* Problem / Water Crisis */}
          <ProblemSection project={detailedProject} />

          {/* Water Treatment Process */}
          <WaterFlowDiagram project={detailedProject} />

          {/* Station Blueprint */}
          <StationBlueprint project={detailedProject} />

          {/* Financial Section */}
          <FinancialSection project={detailedProject} />

          {/* PPP Structure */}
          <PPPSection project={detailedProject} />

          {/* Timeline */}
          <TimelineSection project={detailedProject} />

          {/* Tech Partners */}
          <TechPartnersSection project={detailedProject} />

          {/* Benefits */}
          <BenefitsSection project={detailedProject} />

          {/* Regional Map */}
          <RegionalMap project={detailedProject} />

          {/* FAQ */}
          <FAQSection project={detailedProject} />
        </div>
      </div>
    );
  }

  if (!proj) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/40 text-lg mb-4">Проект не найден</p>
          <button onClick={() => setLocation("/hub")}
            className="px-4 py-2 rounded-xl text-sm cursor-pointer"
            style={{ background: "rgba(96,165,250,0.1)", color: "#60a5fa", border: "1px solid rgba(96,165,250,0.2)" }}>
            ← Проект Хаб
          </button>
        </div>
      </div>
    );
  }

  const statusCfg = PROJECT_STATUS_COLORS[proj.status] ?? { color: "#94a3b8", label: proj.status, bg: "rgba(148,163,184,0.1)" };
  const color = statusCfg.color;
  const budget = proj.budget ?? proj.budget_total ?? 0;
  const irr = proj.expected_irr ?? proj.combined_irr;

  const relatedSubjects = useMemo(() =>
    SUBJECTS_DATA.filter(s => proj.related_subjects?.includes(s.id)), [proj]);
  const relatedObjects = useMemo(() =>
    OBJECTS_DATA.filter(o => proj.related_objects?.includes(o.id)), [proj]);

  const docCategories = ["all", "investment", "study", "ecology", "finance", "legal", "technical"];
  const filteredDocs = activeDocCat === "all" ? docs : docs.filter(d => d.category === activeDocCat);

  const hasCoords = !!(proj.coordinates?.lat && proj.coordinates?.lng);

  return (
    <div className="min-h-screen">

      {/* ═══════════════════════════════════════════════════════
          HERO — branded cover poster
      ═══════════════════════════════════════════════════════ */}
      <div className="relative">
        <ProjectCoverImage project={proj} showStats={true} className="w-full rounded-none" />
        <button onClick={() => setLocation("/hub")}
          className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs cursor-pointer z-20"
          style={{ background: "rgba(0,6,20,0.85)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(12px)" }}>
          <ChevronLeft size={14} /> Проект Хаб
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════
          STICKY TAB BAR
      ═══════════════════════════════════════════════════════ */}
      <div className="sticky top-0 z-30 border-b" style={{ background: "rgba(0,6,20,0.95)", borderColor: "rgba(255,255,255,0.07)", backdropFilter: "blur(16px)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1 overflow-x-auto no-scrollbar py-1">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap cursor-pointer transition-all flex-shrink-0"
                  style={{
                    background: active ? `${color}15` : "transparent",
                    color: active ? color : "rgba(255,255,255,0.4)",
                    border: `1px solid ${active ? color + "30" : "transparent"}`,
                  }}
                >
                  <Icon size={14} />
                  {tab.label}
                  {tab.key === "hashing" && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold"
                      style={{ background: "rgba(0,230,200,0.15)", color: "#00e6c8" }}>
                      NEW
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-8">

        {/* ═══════════════════════════════════════════════════════
            TITLE + DESCRIPTION
        ═══════════════════════════════════════════════════════ */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
              <FolderOpen size={22} style={{ color }} />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                  style={{ background: `${color}15`, color, border: `1px solid ${color}25` }}>
                  {proj.type_label}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                  style={{ background: `${color}10`, color, border: `1px solid ${color}25` }}>
                  {statusCfg.label ?? proj.status}
                </span>
                {proj.portfolio && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs"
                    style={{ background: "rgba(167,139,250,0.1)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.2)" }}>
                    {proj.portfolio.replace(/_/g, " ")}
                  </span>
                )}
              </div>
              <h1 className="text-white font-black text-2xl sm:text-3xl leading-tight mb-1">{localizedField(proj, 'name')}</h1>
              <p className="text-white/40 text-sm">{proj.name}</p>
              {(proj.location || proj.country) && (
                <div className="flex items-center gap-1.5 mt-2">
                  <MapPin size={12} className="text-white/30" />
                  <span className="text-white/50 text-sm">{[proj.location, proj.country].filter(Boolean).join(", ")}</span>
                </div>
              )}
            </div>
          </div>
          <p className="text-white/70 text-sm leading-relaxed mt-4">{proj.description}</p>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════
            TAB CONTENT — DATA HASHING
        ═══════════════════════════════════════════════════════ */}
        {activeTab === "hashing" && (
          <PremiumOverlay title="Data Hashing & Блокчейн">
            <motion.div key="hashing" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <DataHashingNodes projectId={proj.id} projectName={localizedField(proj, 'name')} />
            </motion.div>
          </PremiumOverlay>
        )}

        {activeTab === "investment" && (
          <motion.div key="investment" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <InvestmentCalculator proj={proj} color={color} />
          </motion.div>
        )}

        {activeTab === "analysis" && (
          <motion.div key="analysis" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <AnalysisTab proj={proj} color={color} />
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════
            OVERVIEW TAB STARTS HERE
        ═══════════════════════════════════════════════════════ */}
        {activeTab === "overview" && <>

        {/* ═══════════════════════════════════════════════════════
            KEY METRICS DASHBOARD
        ═══════════════════════════════════════════════════════ */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="rounded-2xl p-5" style={{ background: "rgba(0,6,20,0.9)", border: `1px solid ${color}18` }}>
            <SectionHeader icon={BarChart2} title="Ключевые показатели" color={color} />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {budget > 0 && (
                <StatCard label="Общий бюджет" value={fmt(budget)} color="#00e6c8" icon={DollarSign}
                  sub={proj.budget_currency ?? "USD"} />
              )}
              {irr && (
                <StatCard label="IRR" value={`${irr}%`} color="#4ade80" icon={TrendingUp}
                  sub="Внутренняя норма доходности" />
              )}
              {proj.payback_period_years && (
                <StatCard label="Окупаемость" value={proj.payback_period_years} unit="лет" color="#60a5fa" icon={Clock} />
              )}
              {(proj.start_date ?? proj.planned_start) && (
                <StatCard label="Плановый старт" value={(proj.start_date ?? proj.planned_start) as string} color={color} icon={Calendar} />
              )}
              {(proj.end_date ?? proj.planned_end) && (
                <StatCard label="Завершение" value={(proj.end_date ?? proj.planned_end) as string} color={color} icon={Calendar} />
              )}
              {budget > 0 && irr && (
                <StatCard label="NPV (10 лет)" value={fmt(budget * ((irr / 100) * 8))} color="#fbbf24" icon={Award}
                  sub="Чистая приведённая стоимость" />
              )}
            </div>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════
            FINANCIAL PROJECTIONS CHART
        ═══════════════════════════════════════════════════════ */}
        {projections && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="rounded-2xl p-5" style={{ background: "rgba(0,6,20,0.9)", border: "1px solid rgba(0,230,200,0.12)" }}>
              <SectionHeader icon={TrendingUp} title="Финансовые прогнозы (12 лет)" color="#00e6c8" />
              <p className="text-white/40 text-xs mb-4">Выручка, операционные расходы и кумулятивный денежный поток ($тыс.)</p>

              {/* Cumulative cash-flow */}
              <div className="h-52 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={projections.rows} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
                    <defs>
                      <linearGradient id="cumGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00e6c8" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#00e6c8" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="year" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" />
                    <Area type="monotone" dataKey="cumulative" name="Накопленный CF"
                      stroke="#00e6c8" strokeWidth={2} fill="url(#cumGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Revenue vs Costs bars */}
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={projections.rows} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="year" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="revenue" name="Выручка" fill="rgba(0,230,200,0.5)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="cost" name="Расходы" fill="rgba(248,113,113,0.45)" radius={[4, 4, 0, 0]} />
                    <Line type="monotone" dataKey="cashflow" name="Чистый CF" stroke="#fbbf24" strokeWidth={2} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-wrap gap-4 mt-3 text-xs text-white/40">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded" style={{ background: "rgba(0,230,200,0.5)" }} />Выручка</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded" style={{ background: "rgba(248,113,113,0.45)" }} />Опер. расходы</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded" style={{ background: "#fbbf24" }} />Чистый ден. поток</span>
                <span className="flex items-center gap-1.5 ml-auto text-amber-400">
                  <Clock size={12} />Точка безубыточности: {projections.breakEvenYear}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════
            FINANCING BREAKDOWN
        ═══════════════════════════════════════════════════════ */}
        {(proj as any).financing && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
            <div className="rounded-2xl p-5" style={{ background: "rgba(0,6,20,0.9)", border: `1px solid ${color}12` }}>
              <SectionHeader icon={DollarSign} title="Структура финансирования" color={color} />
              <div className="space-y-3">
                {Object.entries((proj as any).financing).map(([k, v]) => {
                  const val = v as number;
                  const pct = budget > 0 ? Math.round((val / budget) * 100) : 0;
                  return (
                    <div key={k} className="flex items-center gap-3">
                      <span className="text-white/50 text-sm w-44 shrink-0 capitalize">{k.replace(/_/g, " ")}</span>
                      <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: `${color}12` }}>
                        <motion.div className="h-full rounded-full"
                          initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          style={{ background: `linear-gradient(90deg, ${color}, ${color}80)` }} />
                      </div>
                      <span className="text-white font-bold text-sm w-16 text-right">{fmt(val)}</span>
                      <span className="text-white/30 text-xs w-8">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════
            PROJECT MILESTONES / TIMELINE
        ═══════════════════════════════════════════════════════ */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="rounded-2xl p-5" style={{ background: "rgba(0,6,20,0.9)", border: "1px solid rgba(96,165,250,0.12)" }}>
            <SectionHeader icon={Target} title="Этапы реализации" color="#60a5fa" />
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-4 top-2 bottom-2 w-0.5 rounded-full"
                style={{ background: "rgba(96,165,250,0.15)" }} />
              <div className="space-y-4 ml-2">
                {milestones.map((m, i) => (
                  <motion.div key={m.id}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    className="flex items-start gap-4 relative">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 z-10"
                      style={{
                        background: m.done ? "rgba(74,222,128,0.2)" : "rgba(0,6,20,0.9)",
                        border: `2px solid ${m.done ? "#4ade80" : "rgba(96,165,250,0.3)"}`
                      }}>
                      {m.done
                        ? <CheckCircle size={12} className="text-green-400" />
                        : <div className="w-2 h-2 rounded-full" style={{ background: "rgba(96,165,250,0.4)" }} />
                      }
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white text-sm font-semibold">{m.label}</span>
                        {m.done && (
                          <span className="px-1.5 py-0.5 rounded text-xs"
                            style={{ background: "rgba(74,222,128,0.1)", color: "#4ade80" }}>завершено</span>
                        )}
                      </div>
                      <div className="text-white/35 text-xs mt-0.5">{m.date}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════
            TASKS / OBJECTIVES
        ═══════════════════════════════════════════════════════ */}
        {((proj as any).specific_works ?? (proj as any).objectives ?? (proj as any).integration_benefits) && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
            <div className="rounded-2xl p-5" style={{ background: "rgba(0,6,20,0.9)", border: "1px solid rgba(74,222,128,0.1)" }}>
              <SectionHeader icon={CheckCircle} title="Задачи и работы" color="#4ade80" />
              <div className="grid sm:grid-cols-2 gap-2">
                {((proj as any).specific_works ?? (proj as any).objectives ?? (proj as any).integration_benefits ?? []).map((w: string, i: number) => (
                  <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl"
                    style={{ background: "rgba(74,222,128,0.04)", border: "1px solid rgba(74,222,128,0.08)" }}>
                    <div className="w-5 h-5 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: "rgba(74,222,128,0.12)" }}>
                      <ChevronRight size={11} className="text-green-400" />
                    </div>
                    <p className="text-white/65 text-sm leading-snug">{w}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════
            EXPECTED OUTCOMES / IMPACT
        ═══════════════════════════════════════════════════════ */}
        {(proj as any).expected_outcomes && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="rounded-2xl p-5" style={{ background: "rgba(0,6,20,0.9)", border: "1px solid rgba(52,211,153,0.12)" }}>
              <SectionHeader icon={Activity} title="Ожидаемые результаты и эффект" color="#34d399" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {(proj as any).expected_outcomes.energy_savings_annual && (
                  <div className="p-3 rounded-xl text-center" style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.15)" }}>
                    <Zap size={18} className="text-emerald-400 mx-auto mb-1" />
                    <div className="text-white font-black">${((proj as any).expected_outcomes.energy_savings_annual / 1000).toFixed(0)}K</div>
                    <div className="text-white/40 text-xs">Экономия энергии/год</div>
                  </div>
                )}
                {(proj as any).expected_outcomes.water_loss_reduction && (
                  <div className="p-3 rounded-xl text-center" style={{ background: "rgba(96,165,250,0.06)", border: "1px solid rgba(96,165,250,0.15)" }}>
                    <BarChart2 size={18} className="text-blue-400 mx-auto mb-1" />
                    <div className="text-white font-black">{(proj as any).expected_outcomes.water_loss_reduction}м³/ч</div>
                    <div className="text-white/40 text-xs">Снижение потерь</div>
                  </div>
                )}
                {(proj as any).expected_outcomes.co2_reduction && (
                  <div className="p-3 rounded-xl text-center" style={{ background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.15)" }}>
                    <Leaf size={18} className="text-purple-400 mx-auto mb-1" />
                    <div className="text-white font-black">{(proj as any).expected_outcomes.co2_reduction}т</div>
                    <div className="text-white/40 text-xs">CO₂ сокращение/год</div>
                  </div>
                )}
                <div className="p-3 rounded-xl text-center" style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)" }}>
                  <Users size={18} className="text-amber-400 mx-auto mb-1" />
                  <div className="text-white font-black">50K+</div>
                  <div className="text-white/40 text-xs">Чел. под защитой</div>
                </div>
              </div>

              {/* ESG bar */}
              <div className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: "rgba(52,211,153,0.04)", border: "1px solid rgba(52,211,153,0.1)" }}>
                <Leaf size={14} className="text-emerald-400 shrink-0" />
                <div className="flex-1">
                  <div className="flex justify-between text-xs text-white/50 mb-1">
                    <span>ESG-рейтинг проекта</span>
                    <span className="text-emerald-400 font-bold">82/100</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(52,211,153,0.1)" }}>
                    <motion.div className="h-full rounded-full"
                      initial={{ width: 0 }} animate={{ width: "82%" }}
                      transition={{ duration: 1, delay: 0.5 }}
                      style={{ background: "linear-gradient(90deg, #34d399, #4ade80)" }} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════
            RISK MATRIX
        ═══════════════════════════════════════════════════════ */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
          <div className="rounded-2xl p-5" style={{ background: "rgba(0,6,20,0.9)", border: "1px solid rgba(248,113,113,0.1)" }}>
            <SectionHeader icon={AlertTriangle} title="Анализ рисков" color="#f87171" />
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[500px]">
                <thead>
                  <tr className="text-white/30 text-xs border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    <th className="text-left pb-2 pr-3">Риск</th>
                    <th className="text-center pb-2 px-3">Вероятность</th>
                    <th className="text-center pb-2 px-3">Влияние</th>
                    <th className="text-left pb-2 pl-3">Митигация</th>
                  </tr>
                </thead>
                <tbody>
                  {RISKS.map((r, i) => (
                    <tr key={i} className="border-b" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                      <td className="py-2.5 pr-3 text-white/70 font-medium">{r.risk}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={{ background: `${RISK_COLOR[r.prob] ?? "#94a3b8"}18`, color: RISK_COLOR[r.prob] ?? "#94a3b8" }}>
                          {r.prob}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={{ background: `${RISK_COLOR[r.impact] ?? "#94a3b8"}18`, color: RISK_COLOR[r.impact] ?? "#94a3b8" }}>
                          {r.impact}
                        </span>
                      </td>
                      <td className="py-2.5 pl-3 text-white/40 text-xs">{r.mitigation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════
            MAP
        ═══════════════════════════════════════════════════════ */}
        {hasCoords && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(96,165,250,0.15)" }}>
              <div className="px-5 py-3 flex items-center justify-between"
                style={{ background: "rgba(0,6,20,0.9)", borderBottom: "1px solid rgba(96,165,250,0.1)" }}>
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-blue-400" />
                  <span className="text-white text-sm font-semibold">Расположение проекта</span>
                </div>
              </div>
              <MiniMap
                latitude={proj.coordinates!.lat}
                longitude={proj.coordinates!.lng}
                zoom={11}
                markerColor={color}
                markerType="project"
                height="250px"
              />
              <div className="px-5 py-2.5 text-xs text-white/30"
                style={{ background: "rgba(0,6,20,0.85)" }}>
                {proj.coordinates!.lat.toFixed(4)}°N, {proj.coordinates!.lng.toFixed(4)}°E — {proj.location ?? proj.country}
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════
            RELATED OBJECTS
        ═══════════════════════════════════════════════════════ */}
        {relatedObjects.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.27 }}>
            <div className="rounded-2xl p-5" style={{ background: "rgba(0,6,20,0.9)", border: "1px solid rgba(0,230,200,0.1)" }}>
              <SectionHeader icon={Layers} title="Объекты проекта" color="#00e6c8" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {relatedObjects.map(o => (
                  <button key={o.id}
                    onClick={() => setLocation(`/hub/object/${o.id}`)}
                    className="flex items-center gap-3 p-3 rounded-xl text-left cursor-pointer transition-all hover:opacity-80"
                    style={{ background: "rgba(0,230,200,0.04)", border: "1px solid rgba(0,230,200,0.1)" }}>
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
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════
            STAKEHOLDERS / PARTICIPANTS
        ═══════════════════════════════════════════════════════ */}
        {relatedSubjects.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="rounded-2xl p-5" style={{ background: "rgba(0,6,20,0.9)", border: "1px solid rgba(251,191,36,0.1)" }}>
              <SectionHeader icon={Building2} title="Участники и партнёры" color="#fbbf24" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {relatedSubjects.map(s => (
                  <button key={s.id}
                    onClick={() => setLocation(`/hub/subject/${s.id}`)}
                    className="flex items-center gap-3 p-3 rounded-xl text-left cursor-pointer transition-all hover:opacity-80"
                    style={{ background: "rgba(251,191,36,0.04)", border: "1px solid rgba(251,191,36,0.1)" }}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: "rgba(251,191,36,0.1)" }}>
                      <Shield size={14} style={{ color: "#fbbf24" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-semibold truncate">{s.name_ru}</div>
                      <div className="text-white/40 text-xs">{s.type_label}</div>
                    </div>
                    <ArrowRight size={12} className="text-white/30" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════
            DOCUMENTS — Premium
        ═══════════════════════════════════════════════════════ */}
        <PremiumOverlay title="Документация проекта">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.33 }}>
          <div className="rounded-2xl p-5" style={{ background: "rgba(0,6,20,0.9)", border: "1px solid rgba(167,139,250,0.12)" }}>
            <SectionHeader icon={FileText} title="Документация" color="#a78bfa" />

            {/* Category filter */}
            <div className="flex gap-1.5 flex-wrap mb-4">
              {docCategories.map(cat => (
                <button key={cat}
                  onClick={() => setActiveDocCat(cat)}
                  className="px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-all"
                  style={{
                    background: activeDocCat === cat ? "rgba(167,139,250,0.2)" : "rgba(167,139,250,0.06)",
                    color: activeDocCat === cat ? "#a78bfa" : "rgba(255,255,255,0.35)",
                    border: `1px solid ${activeDocCat === cat ? "rgba(167,139,250,0.4)" : "rgba(167,139,250,0.1)"}`,
                  }}>
                  {cat === "all" ? "Все" : cat}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {filteredDocs.map(doc => (
                <div key={doc.id}
                  className="flex items-center gap-3 p-3 rounded-xl transition-all hover:opacity-80"
                  style={{ background: "rgba(167,139,250,0.04)", border: "1px solid rgba(167,139,250,0.08)" }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "rgba(167,139,250,0.1)" }}>
                    <FileText size={16} style={{ color: "#a78bfa" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium truncate">{doc.title}</div>
                    <div className="text-white/30 text-xs mt-0.5">{doc.type} · {doc.size} · {doc.date}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button className="p-1.5 rounded-lg cursor-pointer hover:opacity-70"
                      style={{ background: "rgba(167,139,250,0.1)" }}>
                      <Eye size={13} style={{ color: "#a78bfa" }} />
                    </button>
                    <button className="p-1.5 rounded-lg cursor-pointer hover:opacity-70"
                      style={{ background: "rgba(167,139,250,0.1)" }}>
                      <Download size={13} style={{ color: "#a78bfa" }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
        </PremiumOverlay>

        {/* ═══════════════════════════════════════════════════════
            INVESTMENT CTA
        ═══════════════════════════════════════════════════════ */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.37 }}>
          <div className="rounded-2xl p-6 relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, rgba(0,230,200,0.08) 0%, rgba(96,165,250,0.06) 100%)`,
              border: "1px solid rgba(0,230,200,0.2)",
            }}>
            {/* Background glow */}
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-20"
              style={{ background: "radial-gradient(circle, rgba(0,230,200,0.5), transparent)" }} />

            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Star size={16} className="text-amber-400" />
                <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">Инвестиционная возможность</span>
              </div>
              <h3 className="text-white font-black text-xl mb-2">Примите участие в проекте</h3>
              <p className="text-white/55 text-sm mb-5">
                Проект открыт для соинвестирования, государственно-частного партнёрства и технического сотрудничества.
                IRR {irr ?? 15}% при сроке окупаемости {proj.payback_period_years ?? 8} лет.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                {[
                  { label: "Минимальный взнос", value: "$500K", color: "#00e6c8" },
                  { label: "Целевой IRR", value: `${irr ?? 15}%`, color: "#4ade80" },
                  { label: "Окупаемость", value: `${proj.payback_period_years ?? 8} л`, color: "#60a5fa" },
                ].map(m => (
                  <div key={m.label} className="text-center p-3 rounded-xl"
                    style={{ background: `${m.color}08`, border: `1px solid ${m.color}18` }}>
                    <div className="font-black text-lg" style={{ color: m.color }}>{m.value}</div>
                    <div className="text-white/35 text-xs mt-0.5">{m.label}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowContactModal(true)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm cursor-pointer transition-all hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #00e6c8, #0099ff)", color: "#000" }}>
                  <Mail size={15} />
                  Связаться с командой
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm cursor-pointer transition-all hover:opacity-80"
                  style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.12)" }}>
                  <Download size={15} />
                  Скачать меморандум
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 pb-8">
          {proj.tags.map(tag => (
            <span key={tag} className="px-2.5 py-1 rounded-full text-xs text-white/35"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              #{tag}
            </span>
          ))}
        </div>

        {/* END OVERVIEW TAB */}
        </>}

      </div>

      {/* ═══════════════════════════════════════════════════════
          CONTACT MODAL
      ═══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showContactModal && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 cursor-pointer" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
              onClick={() => setShowContactModal(false)} />
            <motion.div className="relative w-full max-w-md rounded-2xl p-6"
              style={{ background: "rgba(0,8,24,0.98)", border: "1px solid rgba(0,230,200,0.2)" }}
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}>
              <h3 className="text-white font-black text-xl mb-1">Инвестиционный запрос</h3>
              <p className="text-white/40 text-sm mb-4">Проект: {localizedField(proj, 'name')}</p>
              <div className="space-y-3">
                <div>
                  <label className="text-white/50 text-xs mb-1 block">Ваше имя и организация</label>
                  <input className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                    placeholder="Иван Иванов, ООО «Инвест»" />
                </div>
                <div>
                  <label className="text-white/50 text-xs mb-1 block">Email</label>
                  <input type="email" className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                    placeholder="email@company.com" />
                </div>
                <div>
                  <label className="text-white/50 text-xs mb-1 block">Тип участия</label>
                  <select className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: "rgba(0,6,20,0.95)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <option>Прямое инвестирование</option>
                    <option>ГЧП партнёрство</option>
                    <option>Техническое сотрудничество</option>
                    <option>Грантовое финансирование</option>
                  </select>
                </div>
                <div>
                  <label className="text-white/50 text-xs mb-1 block">Комментарий</label>
                  <textarea rows={3} className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none resize-none"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                    placeholder="Опишите ваш интерес к проекту..." />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button className="flex-1 py-2.5 rounded-xl font-bold text-sm cursor-pointer"
                  style={{ background: "linear-gradient(135deg, #00e6c8, #0099ff)", color: "#000" }}>
                  Отправить запрос
                </button>
                <button onClick={() => setShowContactModal(false)}
                  className="px-4 py-2.5 rounded-xl text-sm cursor-pointer"
                  style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  Отмена
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
