import { useState } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  FlaskConical, Cpu, Satellite, Dna, Globe, BarChart3,
  ChevronRight, ExternalLink, Calendar, MapPin, Award,
  TrendingUp, Zap, BookOpen, Microscope, Waves,
  Package, Radio, Shield, Layers, Battery, CircuitBoard,
  Droplets, Eye, TestTubes, Activity, CheckCircle2,
} from "lucide-react";
import { RD_DATA } from "@/data/rd-data";

const VOD_LAB_PRO_COMPONENTS = [
  { name: "Корпус IP68", spec: "-40°C до +60°C, солнечная панель", cost: 3000, icon: Shield, color: "#00e6c8" },
  { name: "Насосная система", spec: "Микродозирование 0.1–10 мл/мин, самоочистка", cost: 800, icon: Droplets, color: "#00b4ff" },
  { name: "Спектрофотометр", spec: "UV-Vis-NIR 190–1100 нм, 20+ параметров", cost: 5000, icon: Eye, color: "#a78bfa" },
  { name: "Картриджная система", spec: "12 слотов, автозамена, RFID-маркировка", cost: 2000, icon: TestTubes, color: "#4ade80" },
  { name: "Edge-Computing", spec: "NVIDIA Jetson, локальный AI, шифрование", cost: 1500, icon: CircuitBoard, color: "#fb923c" },
  { name: "Коммуникации", spec: "LoRaWAN + спутник + 4G резерв", cost: 600, icon: Radio, color: "#f472b6" },
  { name: "Блокчейн-нода", spec: "Лёгкая нода VOD Chain, подпись транзакций", cost: 500, icon: Layers, color: "#fbbf24" },
  { name: "Реагенты (мес.)", spec: "6 месяцев автономной работы, дрон-доставка", cost: 500, icon: FlaskConical, color: "#34d399" },
];

const CARTRIDGE_MATRIX = [
  { name: "Базовый", params: "pH, температура, проводимость, мутность, ОВП", freq: "Непрерывно", life: "1 год", color: "#4ade80" },
  { name: "Металлы-1", params: "Pb, Cd, Hg, As (тяжёлые)", freq: "1 раз/день", life: "6 мес.", color: "#f87171" },
  { name: "Металлы-2", params: "Fe, Mn, Cu, Zn", freq: "1 раз/день", life: "6 мес.", color: "#fb923c" },
  { name: "Органика", params: "ПАВ, фенолы, нефтепродукты", freq: "1 раз/6 ч", life: "4 мес.", color: "#fbbf24" },
  { name: "Микробиология", params: "E.coli, колиформы, легионелла", freq: "1 раз/день", life: "3 мес.", color: "#a78bfa" },
  { name: "Нитраты/фосфаты", params: "NO₃, NO₂, PO₄, NH₄", freq: "Непрерывно", life: "8 мес.", color: "#60a5fa" },
  { name: "Пестициды", params: "20+ препаратов (гербицид, инсектицид)", freq: "1 раз/нед", life: "6 мес.", color: "#f472b6" },
  { name: "Микропластик", params: "Частицы 1–1000 мкм, классификация", freq: "1 раз/нед", life: "4 мес.", color: "#94a3b8" },
];

const PROCESS_STEPS = [
  { icon: Droplets, label: "Забор воды", desc: "Автоматический отбор по расписанию или аварийному триггеру" },
  { icon: TestTubes, label: "Анализ", desc: "Спектрофотометрия + картриджи, реагенты меняются автоматически" },
  { icon: CircuitBoard, label: "Верификация AI", desc: "NVIDIA Jetson проверяет данные на аномалии, сверяет с соседними станциями" },
  { icon: Layers, label: "Эмиссия", desc: "Смарт-контракт выпускает VOD токены пропорционально качеству и объёму" },
  { icon: Activity, label: "Распределение", desc: "Оператору объекта, валидаторам, казне DAO, провайдеру данных" },
];

const STATION_BLOCK_FEATURES = [
  "Встроенный SCADA-интерфейс для операторов", "Автоматическое пробоотборное устройство (4 точки)",
  "Блок нейтрализации и детоксикации (60 л/ч)", "Реестр проб в блокчейне VOD Chain",
  "Интеграция с VODecology API (REST + MQTT)", "Сертификат аналитической лаборатории ВОЗ",
  "Дополнительный картриджный слот (16 позиций)", "Модуль прогнозирования качества воды (ML)",
];

const RD_PROGRAMS = [
  {
    icon: Satellite, color: "#00e6c8", title: "Спутниковый мониторинг воды",
    org: "NASA SERVIR + VODECO", status: "Активен",
    desc: "Использование данных Landsat, Sentinel-2 и MODIS для мониторинга состояния водоёмов, ледников и засухи в Центральной Азии в реальном времени.",
    outputs: ["Карты засухи ЦА", "Мониторинг уровня Арала", "Ледниковый индекс ЦА"],
    invest: "$12M", year: "2024–2027",
  },
  {
    icon: Cpu, color: "#00a0ff", title: "ИИ-оптимизация ирригации",
    org: "MIT + Минводхоз РУз", status: "Активен",
    desc: "Машинное обучение для прогнозирования спроса на воду, оптимизации расписания полива и раннего обнаружения утечек в ирригационных сетях.",
    outputs: ["ML-модель спроса", "Система обнаружения утечек", "Digital twin ирригации"],
    invest: "$8M", year: "2025–2028",
  },
  {
    icon: Dna, color: "#4ade80", title: "Биоремедиация водоёмов",
    org: "Институт биохимии АН РУз", status: "Исследование",
    desc: "Разработка биологических методов очистки загрязнённых водоёмов с использованием специализированных микроорганизмов и растений-фитоаккумуляторов.",
    outputs: ["Штаммы биоремедиаторов", "Пилот на Заравшане", "Протоколы очистки"],
    invest: "$5M", year: "2025–2029",
  },
  {
    icon: Waves, color: "#a78bfa", title: "Технология опреснения",
    org: "KOICA + KAIST + VODECO", status: "Пилот",
    desc: "Разработка энергоэффективных мембранных систем опреснения на основе ВИЭ для применения в аридных зонах Средней Азии.",
    outputs: ["Прототип 500 м³/сут", "Стоимость: $0.3/м³", "Солнечная интеграция"],
    invest: "$18M", year: "2025–2030",
  },
  {
    icon: BarChart3, color: "#fb923c", title: "Цифровой двойник бассейна",
    org: "VODECO R&D + Esri", status: "Разработка",
    desc: "Создание цифрового двойника бассейна Аму- и Сырдарьи для симуляции сценариев, оптимизации водораспределения и оценки климатических рисков.",
    outputs: ["3D-модель бассейна", "Сценарии 2030/2040", "API для управленцев"],
    invest: "$22M", year: "2025–2028",
  },
  {
    icon: Globe, color: "#f472b6", title: "Трансграничные данные ЦА",
    org: "CAWater-Info + VODECO", status: "Активен",
    desc: "Единая платформа обмена гидрологическими данными для 5 стран ЦА с открытым API и интеграцией с глобальными базами данных ООН-Вода.",
    outputs: ["Open Water API", "Гидро-БД ЦА", "Протоколы обмена"],
    invest: "$6M", year: "2024–2026",
  },
];

const PUBLICATIONS = [
  { year: 2025, title: "Central Asia Water Stress Index 2025", journal: "Nature Water", doi: "10.1038/nwater.2025.001", cited: 48 },
  { year: 2025, title: "AI-Driven Irrigation Optimization in Arid Regions", journal: "Water Resources Research", doi: "10.1029/2025WR001234", cited: 31 },
  { year: 2024, title: "Aral Sea Recovery Trajectory: 2020–2024", journal: "Remote Sensing of Environment", doi: "10.1016/j.rse.2024.01.015", cited: 89 },
  { year: 2024, title: "Blockchain for Water Rights Management", journal: "NPJ Clean Water", doi: "10.1038/s41545-024-00001-1", cited: 22 },
  { year: 2024, title: "Glacier Mass Balance Central Asia: Satellite Analysis", journal: "The Cryosphere", doi: "10.5194/tc-2024-001", cited: 67 },
];

export default function RDPage() {
  const [, navigate] = useLocation();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("products");

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4"
          style={{ background: 'rgba(0,230,200,0.1)', border: '1px solid rgba(0,230,200,0.2)' }}>
          <FlaskConical size={12} style={{ color: '#00e6c8' }} />
          <span className="text-xs font-semibold tracking-wider" style={{ color: '#00e6c8' }}>VODECO R&D</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">
          {t("rd.title_prefix")}{" "}
          <span style={{ background: 'linear-gradient(135deg, #00e6c8, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {t("rd.title_highlight")}
          </span>
        </h1>
        <p className="text-white/50 max-w-2xl text-sm leading-relaxed">
          {t("rd.subtitle")}
        </p>
      </motion.div>

      {/* Metrics bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: t("rd.metric_products"), value: "2", color: "#00e6c8" },
          { label: t("rd.metric_params"), value: "20+", color: "#00a0ff" },
          { label: t("rd.metric_capex"), value: "$13.4K", color: "#a78bfa" },
          { label: t("rd.metric_programs"), value: String(RD_DATA.length), color: "#4ade80" },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="rounded-2xl p-4 text-center"
            style={{ background: 'linear-gradient(145deg, rgba(0,18,48,0.9), rgba(0,28,68,0.75))', border: `1px solid ${s.color}18`, backdropFilter: 'blur(16px)' }}>
            <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
            <div className="text-white/45 text-xs mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { id: "products", label: t("rd.tab_products"), icon: Package },
          { id: "programs", label: t("rd.tab_programs"), icon: FlaskConical },
          { id: "publications", label: t("rd.tab_publications"), icon: BookOpen },
          { id: "labs", label: t("rd.tab_labs"), icon: Microscope },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              background: activeTab === tab.id ? 'rgba(0,230,200,0.15)' : 'rgba(0,20,55,0.7)',
              border: `1px solid ${activeTab === tab.id ? 'rgba(0,230,200,0.35)' : 'rgba(0,230,200,0.1)'}`,
              color: activeTab === tab.id ? '#00e6c8' : 'rgba(255,255,255,0.5)',
            }}>
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── ПРОДУКТЫ VODECO ──────────────────────────────────────── */}
      {activeTab === "products" && (
        <div className="space-y-8">

          {/* VOD-Lab Pro */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="rounded-3xl overflow-hidden"
              style={{ background: 'linear-gradient(145deg, rgba(0,14,40,0.97), rgba(0,25,60,0.92))', border: '1px solid rgba(0,230,200,0.2)', backdropFilter: 'blur(20px)' }}>

              {/* Product header */}
              <div className="px-6 pt-6 pb-4 flex flex-wrap items-start justify-between gap-4"
                style={{ borderBottom: '1px solid rgba(0,230,200,0.08)' }}>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: 'rgba(0,230,200,0.12)', border: '1px solid rgba(0,230,200,0.25)' }}>
                      <TestTubes size={20} style={{ color: '#00e6c8' }} />
                    </div>
                    <div>
                      <div className="text-white font-black text-xl">VOD-Lab Pro</div>
                      <div className="text-white/40 text-xs">{t("rd.vod_lab_desc")}</div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                      style={{ background: 'rgba(0,230,200,0.15)', color: '#00e6c8', border: '1px solid rgba(0,230,200,0.3)' }}>
                      R&D • Прототип
                    </span>
                  </div>
                  <p className="text-white/55 text-sm max-w-xl leading-relaxed">
                    Портативный IoT-анализатор для непрерывного мониторинга 20+ параметров качества воды.
                    Оснащён UV-Vis-NIR спектрофотометром, картриджной матрицей, edge AI на NVIDIA Jetson
                    и блокчейн-нодой. Разработка VODECO — от концепции до серийного производства.
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-white/40 text-xs mb-1">{t("rd.capex_per_node")}</div>
                  <div className="text-3xl font-black" style={{ color: '#00e6c8' }}>$13 400</div>
                  <div className="text-white/40 text-xs mt-1">{t("rd.opex_per_month")}</div>
                </div>
              </div>

              {/* Component breakdown */}
              <div className="p-6">
                <div className="text-white/60 text-xs font-semibold tracking-wider uppercase mb-4">{t("rd.components_cost")}</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {VOD_LAB_PRO_COMPONENTS.map((comp, i) => {
                    const Icon = comp.icon;
                    return (
                      <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                        className="rounded-2xl p-3"
                        style={{ background: `${comp.color}08`, border: `1px solid ${comp.color}18` }}>
                        <div className="flex items-center gap-2 mb-2">
                          <Icon size={14} style={{ color: comp.color }} />
                          <span className="text-white/70 text-xs font-medium">{comp.name}</span>
                        </div>
                        <div className="text-white/40 text-xs leading-tight mb-2">{comp.spec}</div>
                        <div className="font-bold text-sm" style={{ color: comp.color }}>
                          {comp.name === "Реагенты (мес.)" ? `$${comp.cost}/мес` : `$${comp.cost.toLocaleString()}`}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Cartridge matrix */}
              <div className="px-6 pb-6">
                <div className="text-white/60 text-xs font-semibold tracking-wider uppercase mb-4">{t("rd.cartridge_matrix")}</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        {[t("rd.col_cartridge"), t("rd.col_params"), t("rd.col_freq"), t("rd.col_life")].map(h => (
                          <th key={h} className="py-2 px-3 text-left text-white/30 font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {CARTRIDGE_MATRIX.map((row, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: row.color }} />
                              <span className="font-semibold" style={{ color: row.color }}>{row.name}</span>
                            </div>
                          </td>
                          <td className="py-2 px-3 text-white/55">{row.params}</td>
                          <td className="py-2 px-3 text-white/55">{row.freq}</td>
                          <td className="py-2 px-3 text-white/55">{row.life}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Process flow */}
              <div className="px-6 pb-6">
                <div className="text-white/60 text-xs font-semibold tracking-wider uppercase mb-4">{t("rd.process_title")}</div>
                <div className="flex flex-wrap gap-2 items-center">
                  {PROCESS_STEPS.map((step, i) => {
                    const Icon = step.icon;
                    return (
                      <div key={i} className="flex items-center gap-1">
                        <div className="flex flex-col items-center px-3 py-2 rounded-xl text-center"
                          style={{ background: 'rgba(0,230,200,0.06)', border: '1px solid rgba(0,230,200,0.12)' }}>
                          <Icon size={14} style={{ color: '#00e6c8' }} className="mb-1" />
                          <div className="text-white/80 text-xs font-semibold">{step.label}</div>
                          <div className="text-white/35 text-xs mt-0.5 max-w-[110px] leading-tight">{step.desc}</div>
                        </div>
                        {i < PROCESS_STEPS.length - 1 && (
                          <ChevronRight size={14} className="text-white/20 flex-shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Station Analysis Block */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <div className="rounded-3xl overflow-hidden"
              style={{ background: 'linear-gradient(145deg, rgba(0,14,40,0.97), rgba(0,25,60,0.92))', border: '1px solid rgba(0,164,255,0.2)', backdropFilter: 'blur(20px)' }}>

              {/* Header */}
              <div className="px-6 pt-6 pb-4 flex flex-wrap items-start justify-between gap-4"
                style={{ borderBottom: '1px solid rgba(0,164,255,0.08)' }}>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: 'rgba(0,164,255,0.12)', border: '1px solid rgba(0,164,255,0.25)' }}>
                      <Activity size={20} style={{ color: '#00a4ff' }} />
                    </div>
                    <div>
                      <div className="text-white font-black text-xl">Станционный блок анализа воды</div>
                      <div className="text-white/40 text-xs">{t("rd.station_desc")}</div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                      style={{ background: 'rgba(0,164,255,0.15)', color: '#00a4ff', border: '1px solid rgba(0,164,255,0.3)' }}>
                      R&D • Концепция
                    </span>
                  </div>
                  <p className="text-white/55 text-sm max-w-xl leading-relaxed">
                    Стационарный аналитический блок для интеграции непосредственно в насосные станции.
                    В отличие от полевого VOD-Lab Pro, станционный блок обеспечивает непрерывный контроль
                    в четырёх точках пробоотбора, более высокую производительность и прямое подключение к SCADA.
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-white/40 text-xs mb-1">{t("rd.target_cost")}</div>
                  <div className="text-3xl font-black" style={{ color: '#00a4ff' }}>$28 000</div>
                  <div className="text-white/40 text-xs mt-1">{t("rd.per_station")}</div>
                </div>
              </div>

              {/* Features */}
              <div className="p-6">
                <div className="text-white/60 text-xs font-semibold tracking-wider uppercase mb-4">{t("rd.key_features")}</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {STATION_BLOCK_FEATURES.map((f, i) => (
                    <div key={i} className="flex items-start gap-2 py-1.5">
                      <CheckCircle2 size={13} style={{ color: '#00a4ff' }} className="mt-0.5 flex-shrink-0" />
                      <span className="text-white/60 text-xs">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comparison row */}
              <div className="px-6 pb-6">
                <div className="text-white/60 text-xs font-semibold tracking-wider uppercase mb-4">{t("rd.comparison_title")}</div>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  {[
                    { label: t("rd.cmp_sample_points"), vodlab: "1", station: "4" },
                    { label: t("rd.cmp_throughput"), vodlab: t("rd.cmp_up_to_24"), station: t("rd.cmp_continuous") },
                    { label: t("rd.cmp_scada"), vodlab: t("rd.cmp_via_api"), station: t("rd.cmp_native") },
                    { label: t("rd.cmp_mobility"), vodlab: t("rd.cmp_portable"), station: t("rd.cmp_stationary") },
                    { label: t("rd.cmp_cartridges"), vodlab: "12 " + t("rd.cmp_slots"), station: "16 " + t("rd.cmp_slots") },
                    { label: t("rd.cmp_power"), vodlab: t("rd.cmp_solar"), station: t("rd.cmp_grid") },
                  ].map((row, i) => (
                    <div key={i} className="col-span-3 grid grid-cols-3 gap-3">
                      <div className="text-white/40">{row.label}</div>
                      <div className="text-center px-2 py-1 rounded-lg text-white/60"
                        style={{ background: 'rgba(0,230,200,0.06)', border: '1px solid rgba(0,230,200,0.1)' }}>
                        {row.vodlab}
                      </div>
                      <div className="text-center px-2 py-1 rounded-lg font-medium"
                        style={{ background: 'rgba(0,164,255,0.08)', border: '1px solid rgba(0,164,255,0.15)', color: '#00a4ff' }}>
                        {row.station}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── ПРОГРАММЫ R&D ──────────────────────────────────────── */}
      {activeTab === "programs" && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {RD_DATA.map((rd, i) => {
            const stageColors: Record<string, string> = {
              fundamental: "#a78bfa", applied: "#00b4ff", prototype: "#fbbf24", pilot: "#4ade80", commercial: "#00e6c8",
            };
            const color = stageColors[rd.stage] ?? "#00e6c8";
            const budgetStr = rd.grant_total_usd
              ? rd.grant_total_usd >= 1e6 ? `$${(rd.grant_total_usd / 1e6).toFixed(1)}M` : `$${(rd.grant_total_usd / 1e3).toFixed(0)}K`
              : "—";
            return (
              <motion.div key={rd.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 8) * 0.06 }}
                onClick={() => navigate(`/rd/${rd.id}`)}
                className="rounded-2xl p-5 hover:scale-[1.02] transition-all duration-300 cursor-pointer group"
                style={{ background: 'linear-gradient(145deg, rgba(0,16,45,0.92), rgba(0,28,68,0.78))', border: `1px solid ${color}15`, backdropFilter: 'blur(18px)' }}>
                <div className="h-0.5 w-16 rounded-full mb-4 transition-all duration-300 group-hover:w-full"
                  style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />
                <div className="flex items-start gap-3 mb-3">
                  <div className="rounded-xl p-2.5 flex-shrink-0" style={{ background: `${color}14`, border: `1px solid ${color}25` }}>
                    <FlaskConical size={18} style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-sm leading-tight">{rd.name}</h3>
                    <div className="text-white/35 text-xs mt-0.5">{rd.laboratory}</div>
                  </div>
                </div>
                <p className="text-white/50 text-xs leading-relaxed mb-4 line-clamp-3">{rd.description}</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                    style={{ background: `${color}15`, color, border: `1px solid ${color}25` }}>
                    {rd.stage_label}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                    style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)' }}>
                    {rd.status}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <div className="text-white/30 text-xs">{t("rd.grants")}</div>
                    <div className="font-bold text-sm" style={{ color }}>{budgetStr}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-white/30 text-xs">{t("rd.publications")}</div>
                    <div className="text-white/60 text-xs font-bold">{rd.publications_count}</div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Publications */}
      {activeTab === "publications" && (
        <div className="space-y-3">
          {PUBLICATIONS.map((pub, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
              className="flex items-start gap-4 p-4 rounded-2xl hover:scale-[1.01] transition-all cursor-pointer"
              style={{ background: 'linear-gradient(145deg, rgba(0,16,45,0.9), rgba(0,28,68,0.75))', border: '1px solid rgba(0,200,230,0.1)', backdropFilter: 'blur(16px)' }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(0,150,255,0.1)', border: '1px solid rgba(0,150,255,0.2)' }}>
                <span className="text-xs font-bold text-blue-400">{pub.year}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white text-sm mb-1">{pub.title}</h3>
                <div className="text-white/40 text-xs mb-2">{pub.journal}</div>
                <div className="flex items-center gap-3 text-xs text-white/30">
                  <span>DOI: {pub.doi}</span>
                  <span style={{ color: '#4ade80' }}>↑ {pub.cited} citations</span>
                </div>
              </div>
              <ExternalLink size={14} className="text-white/20 flex-shrink-0 mt-1" />
            </motion.div>
          ))}
        </div>
      )}

      {/* Labs */}
      {activeTab === "labs" && (
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { name: "Центральная лаборатория водного анализа", city: "Ташкент", area: "Физико-химический анализ, биомониторинг", cap: "500 проб/день", color: "#00e6c8" },
            { name: "Полевая станция Нукус", city: "Каракалпакстан", area: "Мониторинг Аральского моря, геодезия", cap: "24/7 онлайн", color: "#00a0ff" },
            { name: "Лаборатория цифровых двойников", city: "Самарканд", area: "GIS, гидрологическое моделирование", cap: "HPC кластер 128 CPU", color: "#4ade80" },
            { name: "Биотехнологический центр", city: "Фергана", area: "Биоремедиация, фитоочистка воды", cap: "Биореакторы 10 000 л", color: "#a78bfa" },
          ].map((lab, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="rounded-2xl p-5"
              style={{ background: 'linear-gradient(145deg, rgba(0,16,45,0.92), rgba(0,28,68,0.78))', border: `1px solid ${lab.color}15`, backdropFilter: 'blur(18px)' }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: lab.color }} />
                <span className="text-xs text-white/40">{lab.city}</span>
              </div>
              <h3 className="font-bold text-white text-sm mb-2">{lab.name}</h3>
              <p className="text-white/45 text-xs mb-3">{lab.area}</p>
              <div className="flex items-center gap-2 text-xs" style={{ color: lab.color }}>
                <Zap size={11} />
                <span>{lab.cap}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
