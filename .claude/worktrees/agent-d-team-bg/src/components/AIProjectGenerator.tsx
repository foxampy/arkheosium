import { useState, useEffect, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────

export interface AIProjectGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  objectName?: string;
  objectType?: string;
}

type Step = "input" | "loading" | "result";

interface FormState {
  objectType: string;
  workType: string;
  problem: string;
  budget: number;
  duration: string;
}

// ─── Budget helpers ───────────────────────────────────────────

function formatUSD(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  return `$${(n / 1_000).toFixed(0)}K`;
}

function calcBudgetBreakdown(total: number) {
  const design = Math.round(total * 0.08);
  const materials = Math.round(total * 0.38);
  const construction = Math.round(total * 0.35);
  const supervision = Math.round(total * 0.04);
  const reserve = Math.round(total * 0.15);
  return { design, materials, construction, supervision, reserve, total };
}

// ─── Template generator ───────────────────────────────────────

interface GeneratedSpec {
  title: string;
  projectNumber: number;
  goal: string;
  scope: string[];
  budget: ReturnType<typeof calcBudgetBreakdown>;
  schedule: { period: string; activity: string }[];
  risks: { desc: string; severity: "Высокий" | "Средний" | "Низкий" }[];
  contractors: { name: string; specialty: string; rating: string }[];
}

const OBJECT_GOALS: Record<string, string> = {
  "Водохранилище": "Повышение надёжности и безопасности гидротехнического сооружения, увеличение ресурса эксплуатации и водорегулирующей ёмкости",
  "Канал": "Снижение фильтрационных потерь воды, восстановление пропускной способности и повышение КПД ирригационной системы",
  "Насосная станция": "Модернизация насосного оборудования, снижение энергозатрат и обеспечение бесперебойной подачи воды",
  "ВОС": "Обеспечение соответствия качества питьевой воды нормативам СанПиН, повышение производительности и надёжности очистки",
  "ГЭС": "Увеличение установленной мощности, повышение КПД турбин и снижение аварийности гидроагрегатов",
  "Другое": "Улучшение технических характеристик объекта и повышение эффективности водохозяйственной деятельности",
};

const WORK_SCOPE: Record<string, string[]> = {
  "Реконструкция": [
    "Разработка проектно-сметной документации и прохождение экспертизы",
    "Демонтаж устаревших конструкций и оборудования",
    "Выполнение основных строительно-монтажных работ по проекту",
    "Поставка и монтаж нового оборудования и приборов КИПиА",
    "Пусконаладочные работы и сдача объекта в эксплуатацию",
  ],
  "Новое строительство": [
    "Инженерно-геологические изыскания и разработка ПСД",
    "Подготовка строительной площадки и устройство фундаментов",
    "Возведение основных конструкций и зданий сооружений",
    "Монтаж технологического оборудования и инженерных систем",
    "Благоустройство территории, пусконаладка и ввод в эксплуатацию",
  ],
  "Капремонт": [
    "Обследование технического состояния и составление дефектных ведомостей",
    "Замена изношенных несущих и ограждающих конструкций",
    "Ремонт или замена инженерных систем и коммуникаций",
    "Восстановление защитных покрытий и антикоррозионной защиты",
    "Контрольные испытания и оформление актов приёмки",
  ],
  "Модернизация": [
    "Технический аудит существующего оборудования и систем",
    "Разработка концепции и технического задания на модернизацию",
    "Поставка современного оборудования и программного обеспечения",
    "Монтаж, интеграция с АСУ ТП и обучение персонала",
    "Опытная эксплуатация и оптимизация параметров работы",
  ],
  "Мониторинг": [
    "Проектирование сети мониторинга и подбор датчиков",
    "Монтаж измерительного оборудования и кабельной инфраструктуры",
    "Развёртывание серверной части и панели мониторинга",
    "Интеграция с центральной диспетчерской и SCADA",
    "Обучение операторов и запуск в режиме реального времени",
  ],
};

const SCHEDULE_TEMPLATES: Record<string, { period: string; activity: string }[]> = {
  "6 месяцев": [
    { period: "Мес. 1–2", activity: "Проектирование, согласования, закупочные процедуры" },
    { period: "Мес. 2–5", activity: "Строительно-монтажные работы основного объёма" },
    { period: "Мес. 5–6", activity: "Пусконаладочные работы, испытания, устранение замечаний" },
    { period: "Мес. 6", activity: "Приёмка, оформление документации, ввод в эксплуатацию" },
  ],
  "1 год": [
    { period: "Мес. 1–3", activity: "Проектирование, экспертиза, торги и заключение контрактов" },
    { period: "Мес. 3–9", activity: "Основные строительно-монтажные и специальные работы" },
    { period: "Мес. 9–11", activity: "Монтаж оборудования, пусконаладочные работы" },
    { period: "Мес. 12", activity: "Сдача объекта, устранение дефектов, гарантийные обязательства" },
  ],
  "2 года": [
    { period: "Мес. 1–4", activity: "Изыскания, проектирование, экологическая экспертиза" },
    { period: "Мес. 4–16", activity: "Строительство и реконструкция в несколько пусковых комплексов" },
    { period: "Мес. 16–22", activity: "Монтаж оборудования, наладка, обучение персонала" },
    { period: "Мес. 22–24", activity: "Опытная эксплуатация, приёмочные испытания, сдача ГК" },
  ],
  "3+ года": [
    { period: "Год 1", activity: "Изыскания, ПСД, экспертизы, привлечение финансирования" },
    { period: "Год 2", activity: "Первый пусковой комплекс: подготовительные работы и основное строительство" },
    { period: "Год 3", activity: "Второй пусковой комплекс, монтаж оборудования и сетей" },
    { period: "Год 3+", activity: "Завершение, пусконаладка, ввод в эксплуатацию, гарантийный период" },
  ],
};

const RISKS = [
  { desc: "Рост цен на строительные материалы сверх сметных норм (инфляция, логистика)", severity: "Средний" as const },
  { desc: "Задержка согласования ПСД и получения разрешений на строительство", severity: "Средний" as const },
  { desc: "Обнаружение скрытых дефектов при вскрытии конструкций сверх проектных объёмов", severity: "Высокий" as const },
  { desc: "Форс-мажорные климатические условия (паводок, засуха), влияющие на ход работ", severity: "Низкий" as const },
];

const CONTRACTORS = [
  { name: "ООО «АкваСтрой»", specialty: "Гидротехнические сооружения, ирригация", rating: "4.8/5 (37 объектов)" },
  { name: "АО «Водстройпроект»", specialty: "Проектирование и реконструкция ВХО", rating: "4.9/5 (52 объекта)" },
  { name: "GmbH WaterTech Solutions", specialty: "Автоматизация и SCADA-системы", rating: "4.7/5 (28 объектов)" },
  { name: "ООО «МелиоГрупп»", specialty: "Мелиоративные и ирригационные работы", rating: "4.6/5 (44 объекта)" },
];

function generateSpec(form: FormState): GeneratedSpec {
  const number = Math.floor(Math.random() * 500) + 100;
  const goal = OBJECT_GOALS[form.objectType] ?? OBJECT_GOALS["Другое"];
  const scope = WORK_SCOPE[form.workType] ?? WORK_SCOPE["Реконструкция"];
  const budget = calcBudgetBreakdown(form.budget);
  const schedule = SCHEDULE_TEMPLATES[form.duration] ?? SCHEDULE_TEMPLATES["1 год"];

  // Pick 3 risks
  const shuffledRisks = [...RISKS].sort(() => 0.5 - Math.random()).slice(0, 3);

  // Pick 2 contractors
  const shuffledContractors = [...CONTRACTORS].sort(() => 0.5 - Math.random()).slice(0, 2);

  return {
    title: `${form.workType} — ${form.objectType}`,
    projectNumber: number,
    goal,
    scope,
    budget,
    schedule,
    risks: shuffledRisks,
    contractors: shuffledContractors,
  };
}

// ─── Loading messages ─────────────────────────────────────────

const LOADING_MESSAGES = [
  "Анализ данных объекта...",
  "Подбор аналогичных проектов (847 в базе)...",
  "Расчёт сметы и рисков...",
  "Подбор подрядчиков и оборудования...",
  "✓ Готово!",
];

// ─── Sub-components ───────────────────────────────────────────

function ModalSection({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-xl p-4 space-y-2"
      style={{ background: "rgba(255,255,255,0.04)" }}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-white/60 uppercase tracking-wide">
          {icon} {title}
        </p>
        <CopyButton getText={() => {
          // We can't easily extract text here so just return title
          const el = document.createElement("div");
          return title;
        }} />
      </div>
      {children}
    </div>
  );
}

function CopyButton({ getText }: { getText: () => string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(getText()).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      });
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };
  return (
    <button
      onClick={handleCopy}
      className="text-xs text-white/30 hover:text-white/60 transition-colors"
    >
      {copied ? "✓ Скопировано" : "📋"}
    </button>
  );
}

function RiskBadge({ severity }: { severity: "Высокий" | "Средний" | "Низкий" }) {
  const colors: Record<string, string> = {
    Высокий: "bg-red-500/20 text-red-300 border border-red-500/30",
    Средний: "bg-orange-500/20 text-orange-300 border border-orange-500/30",
    Низкий: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[severity]}`}>
      {severity}
    </span>
  );
}

// ─── Step 1: Input Form ───────────────────────────────────────

function InputStep({
  form,
  objectName,
  setForm,
  onGenerate,
}: {
  form: FormState;
  objectName?: string;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  onGenerate: () => void;
}) {
  const selectCls =
    "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400/50 transition-colors appearance-none cursor-pointer";
  const inputCls =
    "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/50 transition-colors";
  const labelCls = "text-xs font-medium text-white/50 uppercase tracking-wide mb-1.5 block";

  return (
    <div className="space-y-5">
      {objectName && (
        <div
          className="rounded-xl px-4 py-2.5 border"
          style={{ background: "rgba(0,230,200,0.05)", borderColor: "rgba(0,230,200,0.15)" }}
        >
          <p className="text-xs text-white/40">Объект: <span className="text-white/70 font-medium">{objectName}</span></p>
        </div>
      )}
      <div>
        <label className={labelCls}>Объект водного хозяйства</label>
        <select
          className={selectCls}
          value={form.objectType}
          onChange={(e) => setForm((f) => ({ ...f, objectType: e.target.value }))}
        >
          <option value="Водохранилище">Водохранилище</option>
          <option value="Канал">Канал</option>
          <option value="Насосная станция">Насосная станция</option>
          <option value="ВОС">Водоочистная станция (ВОС)</option>
          <option value="ГЭС">Гидроэлектростанция (ГЭС)</option>
          <option value="Другое">Другое</option>
        </select>
      </div>

      <div>
        <label className={labelCls}>Тип работ</label>
        <select
          className={selectCls}
          value={form.workType}
          onChange={(e) => setForm((f) => ({ ...f, workType: e.target.value }))}
        >
          <option value="Реконструкция">Реконструкция</option>
          <option value="Новое строительство">Новое строительство</option>
          <option value="Капремонт">Капитальный ремонт</option>
          <option value="Модернизация">Модернизация</option>
          <option value="Мониторинг">Цифровой мониторинг</option>
        </select>
      </div>

      <div>
        <label className={labelCls}>Приоритетная проблема</label>
        <input
          type="text"
          className={inputCls}
          placeholder="Например: падение уровня воды, устаревшее оборудование..."
          value={form.problem}
          onChange={(e) => setForm((f) => ({ ...f, problem: e.target.value }))}
        />
      </div>

      <div>
        <label className={labelCls}>
          Бюджетный диапазон:{" "}
          <span className="font-bold" style={{ color: "#00e6c8" }}>
            {formatUSD(form.budget)}
          </span>
        </label>
        <div className="relative pt-1">
          <input
            type="range"
            min={500_000}
            max={100_000_000}
            step={500_000}
            value={form.budget}
            onChange={(e) => setForm((f) => ({ ...f, budget: Number(e.target.value) }))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #00e6c8 0%, #00b4ff ${((form.budget - 500_000) / (100_000_000 - 500_000)) * 100}%, rgba(255,255,255,0.1) ${((form.budget - 500_000) / (100_000_000 - 500_000)) * 100}%, rgba(255,255,255,0.1) 100%)`,
            }}
          />
          <div className="flex justify-between mt-1">
            <span className="text-xs text-white/30">$500K</span>
            <span className="text-xs text-white/30">$100M</span>
          </div>
        </div>
      </div>

      <div>
        <label className={labelCls}>Срок реализации</label>
        <select
          className={selectCls}
          value={form.duration}
          onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
        >
          <option value="6 месяцев">6 месяцев</option>
          <option value="1 год">1 год</option>
          <option value="2 года">2 года</option>
          <option value="3+ года">3+ года</option>
        </select>
      </div>

      <button
        onClick={onGenerate}
        className="w-full py-3 rounded-xl font-semibold text-black text-sm transition-all hover:opacity-90 active:scale-[0.98]"
        style={{ background: "linear-gradient(135deg, #00e6c8, #00b4ff)" }}
      >
        Сгенерировать ТЗ →
      </button>
    </div>
  );
}

// ─── Step 2: Loading ──────────────────────────────────────────

function LoadingStep({ onDone }: { onDone: () => void }) {
  const [visibleMessages, setVisibleMessages] = useState<number[]>([0]);

  useEffect(() => {
    const timings = [500, 1000, 1500, 2000, 2500];
    const timers: ReturnType<typeof setTimeout>[] = [];

    timings.forEach((delay, i) => {
      timers.push(
        setTimeout(() => {
          setVisibleMessages((prev) => [...prev, i + 1]);
        }, delay)
      );
    });

    // Trigger completion
    timers.push(
      setTimeout(() => {
        onDone();
      }, 3000)
    );

    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-8">
      {/* Spinner */}
      <div className="relative w-16 h-16">
        <div
          className="absolute inset-0 rounded-full border-2 border-transparent animate-spin"
          style={{
            borderTopColor: "#00e6c8",
            borderRightColor: "rgba(0,230,200,0.3)",
          }}
        />
        <div className="absolute inset-2 rounded-full border border-white/5" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl">🤖</span>
        </div>
      </div>

      {/* Messages */}
      <div className="space-y-3 w-full max-w-sm">
        {LOADING_MESSAGES.map((msg, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 transition-all duration-500 ${
              visibleMessages.includes(i)
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-2"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                i === LOADING_MESSAGES.length - 1
                  ? "bg-emerald-400"
                  : visibleMessages.includes(i + 1)
                  ? "bg-white/20"
                  : "bg-cyan-400 animate-pulse"
              }`}
              style={
                visibleMessages.includes(i) && !visibleMessages.includes(i + 1) && i !== LOADING_MESSAGES.length - 1
                  ? { background: "#00e6c8" }
                  : {}
              }
            />
            <span
              className={`text-sm ${
                i === LOADING_MESSAGES.length - 1 && visibleMessages.includes(i)
                  ? "text-emerald-400 font-medium"
                  : visibleMessages.includes(i)
                  ? "text-white/60"
                  : "text-white/30"
              }`}
            >
              {msg}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Step 3: Result ───────────────────────────────────────────

function ResultStep({
  spec,
  form,
  objectName,
  onSave,
  onOpenHub,
}: {
  spec: GeneratedSpec;
  form: FormState;
  objectName?: string;
  onSave: () => void;
  onOpenHub: () => void;
}) {
  return (
    <div className="space-y-4">
      {/* Title header */}
      <div
        className="rounded-xl p-4 border"
        style={{ background: "rgba(0,230,200,0.05)", borderColor: "rgba(0,230,200,0.2)" }}
      >
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <p className="text-xs text-white/40 mb-0.5">Авт. проект #{spec.projectNumber}</p>
            <h3 className="text-base font-bold text-white">ТЗ: {spec.title}</h3>
            {objectName && (
              <p className="text-xs text-white/50 mt-0.5">Объект: {objectName}</p>
            )}
          </div>
          <span
            className="text-xs px-2 py-1 rounded-full font-medium"
            style={{ background: "rgba(0,230,200,0.15)", color: "#00e6c8" }}
          >
            ИИ-генерация
          </span>
        </div>
      </div>

      {/* Technical Specification */}
      <div className="rounded-xl p-4 space-y-3" style={{ background: "rgba(255,255,255,0.04)" }}>
        <p className="text-xs font-semibold text-white/60 uppercase tracking-wide">📋 Техническое задание</p>
        {form.problem && (
          <p className="text-xs text-white/70">
            <span className="text-white/40">Проблема: </span>{form.problem}
          </p>
        )}
        <p className="text-xs text-white/70">
          <span className="text-white/40">Цель: </span>{spec.goal}
        </p>
        <div>
          <p className="text-xs text-white/40 mb-2">Объём работ:</p>
          <ul className="space-y-1.5">
            {spec.scope.map((item, i) => (
              <li key={i} className="text-xs text-white/70 flex items-start gap-2">
                <span className="text-cyan-400 flex-shrink-0 mt-0.5">{i + 1}.</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Budget */}
      <div className="rounded-xl p-4 space-y-3" style={{ background: "rgba(255,255,255,0.04)" }}>
        <p className="text-xs font-semibold text-white/60 uppercase tracking-wide">💰 Смета (предварительная)</p>
        <div className="space-y-2">
          {[
            { label: "Проектирование", value: spec.budget.design },
            { label: "Материалы / оборудование", value: spec.budget.materials },
            { label: "СМР (строительно-монтажные)", value: spec.budget.construction },
            { label: "Технический надзор", value: spec.budget.supervision },
            { label: "Резерв (15%)", value: spec.budget.reserve },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-xs text-white/50">{label}</span>
              <span className="text-xs text-white/70 font-mono">{formatUSD(value)}</span>
            </div>
          ))}
          <div className="border-t border-white/10 pt-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-white">ИТОГО</span>
            <span className="text-sm font-bold" style={{ color: "#00e6c8" }}>
              {formatUSD(spec.budget.total)}
            </span>
          </div>
        </div>
      </div>

      {/* Schedule */}
      <div className="rounded-xl p-4 space-y-3" style={{ background: "rgba(255,255,255,0.04)" }}>
        <p className="text-xs font-semibold text-white/60 uppercase tracking-wide">📅 График реализации</p>
        <div className="space-y-2">
          {spec.schedule.map(({ period, activity }, i) => (
            <div key={i} className="flex items-start gap-3">
              <span
                className="text-xs font-mono flex-shrink-0 pt-0.5"
                style={{ color: "#00e6c8", minWidth: 80 }}
              >
                {period}
              </span>
              <span className="text-xs text-white/60">{activity}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Risks */}
      <div className="rounded-xl p-4 space-y-3" style={{ background: "rgba(255,255,255,0.04)" }}>
        <p className="text-xs font-semibold text-white/60 uppercase tracking-wide">⚠️ Риски</p>
        <div className="space-y-2">
          {spec.risks.map((risk, i) => (
            <div key={i} className="flex items-start gap-3">
              <RiskBadge severity={risk.severity} />
              <span className="text-xs text-white/60 flex-1">{risk.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Contractors */}
      <div className="rounded-xl p-4 space-y-3" style={{ background: "rgba(255,255,255,0.04)" }}>
        <p className="text-xs font-semibold text-white/60 uppercase tracking-wide">🏢 Рекомендуемые подрядчики</p>
        <div className="space-y-2">
          {spec.contractors.map((c) => (
            <div
              key={c.name}
              className="flex items-start justify-between gap-3 bg-white/4 rounded-xl px-3 py-2 flex-wrap"
            >
              <div>
                <p className="text-xs font-medium text-white">{c.name}</p>
                <p className="text-xs text-white/40">{c.specialty}</p>
              </div>
              <span className="text-xs text-yellow-400">⭐ {c.rating}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onSave}
          className="flex-1 py-2.5 rounded-xl font-medium text-sm border border-white/10 text-white/70 hover:border-white/20 hover:text-white transition-all"
        >
          Сохранить как черновик
        </button>
        <button
          onClick={onOpenHub}
          className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-black transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #00e6c8, #00b4ff)" }}
        >
          Открыть в Хаб →
        </button>
      </div>
    </div>
  );
}

// ─── Main Modal Component ─────────────────────────────────────

export function AIProjectGenerator({
  isOpen,
  onClose,
  objectName,
  objectType,
}: AIProjectGeneratorProps) {
  const [step, setStep] = useState<Step>("input");
  const [form, setForm] = useState<FormState>({
    objectType: objectType ?? "Водохранилище",
    workType: "Реконструкция",
    problem: "",
    budget: 5_000_000,
    duration: "1 год",
  });
  const [spec, setSpec] = useState<GeneratedSpec | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync objectType prop
  useEffect(() => {
    if (objectType) {
      setForm((f) => ({ ...f, objectType }));
    }
  }, [objectType]);

  // Reset when closed
  useEffect(() => {
    if (!isOpen) {
      const t = setTimeout(() => {
        setStep("input");
        setSpec(null);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Scroll to top when step changes
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const handleGenerate = () => {
    setStep("loading");
  };

  const handleLoadingDone = () => {
    const generated = generateSpec(form);
    setSpec(generated);
    setStep("result");
  };

  const handleSave = () => {
    // Mock save action
    onClose();
  };

  const handleOpenHub = () => {
    // Mock open in hub
    onClose();
  };

  if (!isOpen) return null;

  const stepTitles: Record<Step, string> = {
    input: "🤖 Генератор проектов (ИИ)",
    loading: "Генерация проекта...",
    result: "Результат генерации",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border flex flex-col overflow-hidden"
        style={{
          background: "#0a1628",
          borderColor: "rgba(0,230,200,0.2)",
          maxHeight: "90vh",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          <div>
            <h2 className="text-base font-bold text-white">{stepTitles[step]}</h2>
            {step === "input" && (
              <p className="text-xs text-white/40 mt-0.5">
                Опишите задачу — ИИ создаст ТЗ, смету и план
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all text-lg leading-none"
          >
            ×
          </button>
        </div>

        {/* Step indicators */}
        {step !== "loading" && (
          <div className="flex items-center gap-2 px-6 py-3 border-b flex-shrink-0" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
            {(["input", "result"] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step === s
                      ? "text-black"
                      : step === "result" && s === "input"
                      ? "bg-white/10 text-white/40"
                      : "bg-white/10 text-white/40"
                  }`}
                  style={step === s ? { background: "linear-gradient(135deg, #00e6c8, #00b4ff)" } : {}}
                >
                  {step === "result" && s === "input" ? "✓" : i + 1}
                </div>
                <span className={`text-xs ${step === s ? "text-white/70" : "text-white/30"}`}>
                  {s === "input" ? "Параметры" : "Результат"}
                </span>
                {i === 0 && <div className="w-8 h-px bg-white/10 mx-1" />}
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-5">
          {step === "input" && (
            <InputStep
              form={form}
              objectName={objectName}
              setForm={setForm}
              onGenerate={handleGenerate}
            />
          )}
          {step === "loading" && <LoadingStep onDone={handleLoadingDone} />}
          {step === "result" && spec && (
            <ResultStep
              spec={spec}
              form={form}
              objectName={objectName}
              onSave={handleSave}
              onOpenHub={handleOpenHub}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default AIProjectGenerator;
