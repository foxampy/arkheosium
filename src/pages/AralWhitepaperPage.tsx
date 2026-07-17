import { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import {
  ArrowLeft, FileText, Waves, Brain, Database, Leaf, Zap,
  Building2, Rocket, Microscope, GraduationCap, Lightbulb,
  BarChart3, Globe2, Handshake, DollarSign, Map, ChevronRight,
  Download, ExternalLink, Droplets, Network, Shield
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Volume {
  num: number;
  roman: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  chapters: string[];
  summary: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const VOLUMES: Volume[] = [
  {
    num: 1, roman: 'I', title: 'Концепция и стратегия', subtitle: 'Vision & Strategy',
    icon: <Globe2 size={16}/>, color: '#00d4ff',
    chapters: ['История Аральского моря', 'Современные вызовы', 'Почему существующих мер недостаточно', 'Новая модель восстановления', 'Миссия и видение', 'Долгосрочная стратегия', 'Глобальная значимость'],
    summary: 'Аральское море — одна из крупнейших экологических катастроф современности. Традиционные подходы к восстановлению сосредоточены на отдельных проблемах. ARAL NEXUS вводит новую парадигму: самообучающаяся экологическая цивилизационная инфраструктура, где технология становится продолжением природных процессов.',
  },
  {
    num: 2, roman: 'II', title: 'Генеральный мастер-план', subtitle: 'Master Plan',
    icon: <Map size={16}/>, color: '#0099ff',
    chapters: ['Центральный остров', 'Правительственный центр', 'Международный кампус', 'AI City & Quantum Campus', 'Innovation District', 'BioTech & Energy District', 'Прибрежные территории', 'Морская инфраструктура', 'Плавучие платформы'],
    summary: 'Пространственная архитектура ARAL NEXUS охватывает Центральный остров (столица проекта), прибрежные территории с новыми городами и агрокластерами, морскую инфраструктуру с плавучими платформами и научными станциями.',
  },
  {
    num: 3, roman: 'III', title: 'Цифровая экосистема', subtitle: 'Digital Intelligence',
    icon: <Brain size={16}/>, color: '#7c3aed',
    chapters: ['AI Core — AI Government', 'AI Ecology & Climate', 'AI Agriculture & Water', 'AI Medicine & Energy', 'Quantum Computing Center', 'Supercomputing / HPC / GPU', 'Digital Twin Aral', 'Полная модель региона'],
    summary: 'Интеллектуальное ядро проекта: AI Core управляет всеми системами, Quantum Computing Center моделирует климат и экосистемы, а Digital Twin Aral — непрерывно обновляемая цифровая копия всего региона, включая атмосферу, гидрологию, биоразнообразие и экономику.',
  },
  {
    num: 4, roman: 'IV', title: 'Подводная инфраструктура', subtitle: 'Underwater Systems',
    icon: <Database size={16}/>, color: '#1d4ed8',
    chapters: ['Underwater DataBase', 'Подводная оптоволоконная сеть', 'Квантовые каналы связи', 'IoT Sensor Network — 1M+ датчиков', 'Мониторинг воды, воздуха, грунта', 'Underwater Robotics Fleet', 'Инспекционные и ремонтные роботы', 'Автономные подводные лаборатории'],
    summary: 'Уникальная подводная инфраструктура: дата-центры с естественным охлаждением, миллионы IoT-датчиков, флот автономных роботов для обслуживания и исследований. Подводная оптоволоконная сеть с квантовыми каналами обеспечивает защищённую передачу данных.',
  },
  {
    num: 5, roman: 'V', title: 'Экология', subtitle: 'Ecology & Restoration',
    icon: <Leaf size={16}/>, color: '#22c55e',
    chapters: ['Water Recovery — очистка и восстановление', 'Новые каналы и гидросооружения', 'Desert Recovery — борьба с опустыниванием', 'Восстановление биоразнообразия', 'Рыбы, птицы, растения, микрофлора', 'Carbon Capture Program', 'Blue Carbon & Green Carbon', 'Природные заповедники'],
    summary: 'Комплексное восстановление экосистемы: водопотоки, каналы, дельты, биоразнообразие. Борьба с опустыниванием через озеленение и микроклиматические технологии. Программа поглощения углерода и восстановление природных заповедников.',
  },
  {
    num: 6, roman: 'VI', title: 'Энергетика', subtitle: 'Renewable Energy',
    icon: <Zap size={16}/>, color: '#f59e0b',
    chapters: ['Solar Energy — наземные и плавучие СЭС', 'Wind Energy — ветропарки', 'Hydrogen Center — зелёный водород', 'Smart Grid & Battery Storage', 'Floating Solar & Floating Wind', 'Energy AI — оптимизация потребления', 'Энергетический экспорт'],
    summary: 'Энергетическое кольцо вокруг комплекса обеспечивает полную автономию. Солнечные, ветровые, водородные станции и интеллектуальные накопители создают 100% возобновляемый энергобаланс. AI-оптимизация снижает потребление на 40%.',
  },
  {
    num: 7, roman: 'VII', title: 'Автономный город', subtitle: 'Smart Island City',
    icon: <Building2 size={16}/>, color: '#7c3aed',
    chapters: ['Архитектура и зонирование', 'Жилые кварталы и умные дома', 'Водоснабжение — замкнутый цикл', 'Энергоснабжение острова', 'Zero Waste Management', 'Здравоохранение — AI Medicine', 'Образование и культура', 'Безопасность и туризм'],
    summary: 'Островной город — живая лаборатория будущего. Энергоэффективные здания с зелёными крышами и интеллектуальными фасадами. Замкнутый цикл воды и энергии. AI-медицина, международные школы, культурные кварталы.',
  },
  {
    num: 8, roman: 'VIII', title: 'Транспорт', subtitle: 'Autonomous Mobility',
    icon: <Rocket size={16}/>, color: '#6366f1',
    chapters: ['Autonomous Vehicles — беспилотные автобусы', 'Electric Transport — вся инфраструктура', 'Water Transport — автономные лодки', 'Air Mobility — аэротакси', 'Drone Corridors — грузовые маршруты', 'Cargo Robots', 'Smart Roads & Logistics'],
    summary: 'Полностью автономная транспортная система без выбросов: беспилотные автобусы, электрические суда, аэротакси и грузовые дроны. Smart Roads с интегрированными датчиками и адаптивным управлением потоками.',
  },
  {
    num: 9, roman: 'IX', title: 'Наука', subtitle: 'International Research',
    icon: <Microscope size={16}/>, color: '#00e6c8',
    chapters: ['Hydrology & Oceanography Institute', 'Ecology & Climate Institute', 'AI & Robotics Institute', 'Quantum Technologies Lab', 'Biotechnology Center', 'Materials Science Lab', 'Water Economy Research', 'Sustainable Cities Program'],
    summary: 'Международный исследовательский кампус объединяет ведущих учёных мира. Институты гидрологии, климата, ИИ, квантовых технологий, биоинженерии и материаловедения. Открытый доступ к данным для глобального научного сообщества.',
  },
  {
    num: 10, roman: 'X', title: 'Образование', subtitle: 'Education & Academy',
    icon: <GraduationCap size={16}/>, color: '#00d4ff',
    chapters: ['Aral University — международный вуз', 'International School', 'Исследовательские лаборатории', 'PhD-программы', 'Академия ИИ', 'Академия робототехники', 'Школа экологического управления'],
    summary: 'Aral University — международный университет с PhD-программами по экологии, ИИ, квантовым технологиям и водному хозяйству. Академии ИИ и робототехники готовят специалистов нового поколения.',
  },
  {
    num: 11, roman: 'XI', title: 'Инновационный кластер', subtitle: 'Innovation Valley',
    icon: <Lightbulb size={16}/>, color: '#f59e0b',
    chapters: ['Стартап-экосистема', 'Акселераторы и инкубаторы', 'Венчурные фонды', 'Исследовательские лаборатории', 'Прототипирование', 'Пилотные производства', 'Международные R&D-центры'],
    summary: 'Innovation Valley — технологический парк мирового уровня. Стартапы, акселераторы, венчурные фонды и производственные прототипные центры. Площадка для тестирования экотехнологий в реальных условиях.',
  },
  {
    num: 12, roman: 'XII', title: 'Экономика', subtitle: 'Blue Economy',
    icon: <BarChart3 size={16}/>, color: '#22c55e',
    chapters: ['Blue Economy — водная экономика', 'WaterTech & GreenTech', 'CleanTech & AgriTech', 'BioTech & ClimateTech', 'AI Economy', 'Hydrogen Economy', 'Eco Tourism', 'Рыночная капитализация'],
    summary: 'Blue Economy как новая отрасль: водные технологии, зелёные решения, агротех, биотех и экотуризм создают устойчивую экономическую базу. Прогнозируемый ВВП кластера к 2040 году — $200B+.',
  },
  {
    num: 13, roman: 'XIII', title: 'Цифровая экономика', subtitle: 'Digital Economy',
    icon: <Network size={16}/>, color: '#ec4899',
    chapters: ['Интеграция с VOD.eco', 'DAO-управление', 'Blockchain-реестр', 'Smart Contracts — гранты и субсидии', 'Digital Identity', 'Ecological Tokens & Carbon Tokens', 'Water Credits', 'NFT научных данных'],
    summary: 'Цифровая экономика ARAL NEXUS построена на VOD.eco: блокчейн-реестр экологических данных, токенизация проектов, DAO-управление инициативами и смарт-контракты для распределения грантов.',
  },
  {
    num: 14, roman: 'XIV', title: 'Международное сотрудничество', subtitle: 'Global Partnerships',
    icon: <Handshake size={16}/>, color: '#0099ff',
    chapters: ['Государства Центральной Азии', 'Международные банки развития (EBRD, ADB, WB)', 'Агентства ООН (UNEP, UNDP, UNESCO)', 'Ведущие университеты мира', 'Экологические фонды', 'Частные технологические компании', 'Международные научные институты'],
    summary: 'Проект строится на многостороннем сотрудничестве: правительства ЦА, EBRD, Мировой банк, агентства ООН, ведущие технологические компании и университеты. Формат — международный договор с механизмами совместного управления.',
  },
  {
    num: 15, roman: 'XV', title: 'Финансирование', subtitle: 'Investment & Finance',
    icon: <DollarSign size={16}/>, color: '#f59e0b',
    chapters: ['Государственные инвестиции', 'Международные гранты', 'ESG-фонды', 'Зелёные облигации', 'Климатические фонды', 'Частный капитал', 'Концессионные модели', 'Цифровые инфраструктурные активы'],
    summary: 'Диверсифицированная модель финансирования: государственные и международные гранты (Фаза I), ESG-фонды и зелёные облигации (Фаза II), концессии и частный капитал (Фазы III–IV). Цифровые инфраструктурные активы через VOD.eco.',
  },
  {
    num: 16, roman: 'XVI', title: 'Дорожная карта', subtitle: 'Roadmap 2026–2040+',
    icon: <Map size={16}/>, color: '#00e6c8',
    chapters: ['2026–2028: Исследования и согласование', '2028–2030: Инженерная инфраструктура', '2030–2032: Системы мониторинга и Digital Twin', '2032–2034: Восстановление гидрологии', '2034–2037: Строительство острова', '2037–2039: Энергетика и транспорт', '2039–2040: Масштабирование экологии', '2040+: Экспорт технологий'],
    summary: '10 ключевых этапов реализации от научных исследований до глобального экспорта технологий. Каждый этап имеет измеримые KPI и контрольные точки верификации Digital Twin.',
  },
];

// ─── Stat counter ─────────────────────────────────────────────────────────────

function StatChip({ val, label, color }: { val: string; label: string; color: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.4 }}
      className="bg-[#000d24] border border-white/10 rounded-xl p-4 text-center"
    >
      <div className="text-xl font-black font-mono" style={{ color }}>{val}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </motion.div>
  );
}

// ─── Volume Card ──────────────────────────────────────────────────────────────

function VolumeCard({ vol, isActive, onClick }: { vol: Volume; isActive: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm ${
        isActive
          ? 'bg-white/5 text-white'
          : 'text-gray-500 hover:text-gray-300 hover:bg-white/3'
      }`}
      style={{ borderLeft: isActive ? `2px solid ${vol.color}` : '2px solid transparent' }}
    >
      <span
        className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 text-xs font-bold"
        style={{ background: vol.color + '20', color: vol.color }}
      >
        {vol.num}
      </span>
      <span className="truncate">{vol.title}</span>
      {isActive && <ChevronRight size={12} className="ml-auto flex-shrink-0" style={{ color: vol.color }} />}
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AralWhitepaperPage() {
  const [, navigate] = useLocation();
  const [activeVol, setActiveVol] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  function selectVol(i: number) {
    setActiveVol(i);
    contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const vol = VOLUMES[activeVol];

  return (
    <div className="min-h-screen text-gray-200">

      {/* ── Top Bar ── */}
      <div className="sticky top-0 z-30 bg-[#000818]/95 backdrop-blur border-b border-white/5 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-[#00d4ff]/70 hover:text-[#00d4ff] transition-colors flex-shrink-0"
        >
          <ArrowLeft size={16} /> Назад
        </button>
        <div className="flex items-center gap-2 text-sm text-gray-400 flex-shrink-0">
          <FileText size={14} />
          <span className="hidden sm:inline">ARAL NEXUS WhitePaper</span>
          <span className="sm:hidden">WhitePaper</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => navigate('/aral-nexus')}
            className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border border-[#7c3aed]/30 text-[#7c3aed] hover:bg-[#7c3aed]/10 transition-colors"
          >
            <ExternalLink size={12} /> Мегапроект
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border border-[#00d4ff]/30 text-[#00d4ff] hover:bg-[#00d4ff]/10 transition-colors"
          >
            <Download size={12} /> PDF
          </button>
        </div>
      </div>

      {/* ── Hero ── */}
      <div className="relative border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#00153a]/60 to-[#000818]" />
          {/* Animated orbs */}
          <motion.div
            className="absolute top-0 right-0 w-[600px] h-[300px] rounded-full bg-[#00d4ff]/6 blur-3xl"
            animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
            transition={{ duration: 10, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-0 left-1/4 w-[400px] h-[200px] rounded-full bg-[#7c3aed]/8 blur-3xl"
            animate={{ x: [0, -20, 0], y: [0, 20, 0] }}
            transition={{ duration: 12, repeat: Infinity }}
          />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <div className="flex items-center gap-2 text-xs text-[#00d4ff] bg-[#00d4ff]/10 border border-[#00d4ff]/20 rounded-full px-3 py-1">
                <Waves size={11} /> Whitepaper v1.0
              </div>
              <div className="flex items-center gap-2 text-xs text-[#7c3aed] bg-[#7c3aed]/10 border border-[#7c3aed]/20 rounded-full px-3 py-1">
                <Shield size={11} /> Conceptual Master Plan
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white mb-3 tracking-tight leading-tight">
              ARAL NEXUS
              <br />
              <span className="bg-gradient-to-r from-[#00d4ff] via-[#7c3aed] to-[#22c55e] bg-clip-text text-transparent text-3xl md:text-5xl">
                White Paper
              </span>
            </h1>

            <p className="text-gray-400 text-base md:text-lg mb-6 max-w-2xl leading-relaxed">
              A Global Ecosystem for the Restoration of the Aral Sea and Creation
              of the World's First Autonomous Eco-Technological City
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatChip val="16" label="Томов" color="#00d4ff" />
              <StatChip val="100+" label="Глав" color="#7c3aed" />
              <StatChip val="$60B+" label="Инвестиций" color="#f59e0b" />
              <StatChip val="2040+" label="Горизонт" color="#22c55e" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Executive Summary ── */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#000d24] border border-[#00d4ff]/20 rounded-2xl p-6 mb-2"
        >
          <div className="text-xs text-[#00d4ff] font-semibold uppercase tracking-widest mb-3">Executive Summary</div>
          <p className="text-gray-300 text-sm leading-relaxed mb-3">
            Проект ARAL NEXUS представляет собой масштабную инициативу по экологической, технологической
            и экономической трансформации региона Аральского моря. Он сочетает восстановление экосистемы
            с созданием научно-технологического хаба на центральном острове.
          </p>
          <p className="text-gray-300 text-sm leading-relaxed mb-3">
            Фундаментальная идея ARAL NEXUS: переход от реактивного управления окружающей средой
            к <span className="text-[#00d4ff] font-semibold">предиктивному экологическому интеллекту</span>.
            Вместо того чтобы реагировать на ущерб, система непрерывно анализирует миллионы параметров
            и автономно оптимизирует процессы восстановления.
          </p>
          <div className="grid sm:grid-cols-2 gap-3 mt-4">
            {[
              { label: 'Глобальная платформа управления водой', color: '#00d4ff' },
              { label: 'Новая модель устойчивого городского развития', color: '#7c3aed' },
              { label: 'Научный центр: климат, экология, ИИ, квант', color: '#22c55e' },
              { label: 'Международная лаборатория восстановления', color: '#f59e0b' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                <span className="text-xs text-gray-400">{item.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Main Layout: Sidebar + Content ── */}
      <div className="max-w-5xl mx-auto px-4 pb-16 flex gap-6">

        {/* ── Sidebar: Volume list ── */}
        <aside className="hidden lg:block w-60 flex-shrink-0">
          <div className="sticky top-20 space-y-1">
            <div className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-3 px-3">
              Содержание
            </div>
            {VOLUMES.map((v, i) => (
              <VolumeCard key={v.num} vol={v} isActive={i === activeVol} onClick={() => selectVol(i)} />
            ))}
          </div>
        </aside>

        {/* ── Content ── */}
        <div className="flex-1 min-w-0" ref={contentRef}>

          {/* Mobile volume selector */}
          <div className="lg:hidden mb-4">
            <select
              value={activeVol}
              onChange={e => setActiveVol(Number(e.target.value))}
              className="w-full bg-[#000d24] border border-white/20 text-white rounded-xl px-3 py-2 text-sm"
            >
              {VOLUMES.map((v, i) => (
                <option key={v.num} value={i}>Том {v.roman}: {v.title}</option>
              ))}
            </select>
          </div>

          {/* Volume content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeVol}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {/* Volume header */}
              <div
                className="rounded-2xl border p-6 mb-5"
                style={{ borderColor: vol.color + '30', background: `linear-gradient(135deg, ${vol.color}08, transparent)` }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-black flex-shrink-0"
                    style={{ background: vol.color + '20', color: vol.color }}
                  >
                    {vol.roman}
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-mono mb-1">ТОМ {vol.num} — {vol.subtitle}</div>
                    <h2 className="text-xl md:text-2xl font-bold text-white mb-1">{vol.title}</h2>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-[#000d24] border border-white/10 rounded-xl p-5 mb-5">
                <div
                  className="text-xs font-semibold uppercase tracking-widest mb-3"
                  style={{ color: vol.color }}
                >
                  Обзор тома
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">{vol.summary}</p>
              </div>

              {/* Chapters */}
              <div className="mb-5">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Главы</div>
                <div className="space-y-2">
                  {vol.chapters.map((ch, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="flex items-center gap-3 bg-[#000d24] border border-white/5 rounded-xl px-4 py-3 hover:border-white/10 transition-colors"
                    >
                      <div
                        className="w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: vol.color + '20', color: vol.color }}
                      >
                        {i + 1}
                      </div>
                      <span className="text-sm text-gray-300">{ch}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Key metrics for this volume */}
              {activeVol === 0 && (
                <VolumeMetrics color={vol.color} items={[
                  { label: 'Площадь моря потеряна', val: '90%' },
                  { label: 'Соли в воздухе, млн т/год', val: '150M' },
                  { label: 'Население под угрозой', val: '60M+' },
                  { label: 'Существующих решений', val: '0' },
                ]} />
              )}
              {activeVol === 2 && (
                <VolumeMetrics color={vol.color} items={[
                  { label: 'AI-систем в ядре', val: '10+' },
                  { label: 'Параметров Digital Twin', val: '∞' },
                  { label: 'Квантовые кубиты', val: '1000+' },
                  { label: 'HPC терафлопс', val: '100+' },
                ]} />
              )}
              {activeVol === 4 && (
                <VolumeMetrics color={vol.color} items={[
                  { label: 'Новых каналов (км)', val: '2000+' },
                  { label: 'Объём воды (км³/год)', val: '5+' },
                  { label: 'Видов биоразнообразия', val: '200+' },
                  { label: 'Лесопосадки (тыс. га)', val: '500+' },
                ]} />
              )}
              {activeVol === 5 && (
                <VolumeMetrics color={vol.color} items={[
                  { label: 'СЭС (ГВт)', val: '5+' },
                  { label: 'Ветропарки (ГВт)', val: '3+' },
                  { label: 'Водород (тыс. т/год)', val: '100+' },
                  { label: 'Автономность', val: '100%' },
                ]} />
              )}
              {activeVol === 14 && (
                <VolumeMetrics color={vol.color} items={[
                  { label: 'Страны-участники', val: '5+' },
                  { label: 'Международных банков', val: '10+' },
                  { label: 'ESG-фондов', val: '50+' },
                  { label: 'Горизонт инвестиций', val: '20 лет' },
                ]} />
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between mt-6 pt-5 border-t border-white/5">
                <button
                  onClick={() => setActiveVol(v => Math.max(0, v - 1))}
                  disabled={activeVol === 0}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ArrowLeft size={14} />
                  {activeVol > 0 && `Том ${VOLUMES[activeVol - 1].roman}`}
                </button>
                <span className="text-xs text-gray-600 font-mono">{activeVol + 1} / {VOLUMES.length}</span>
                <button
                  onClick={() => setActiveVol(v => Math.min(VOLUMES.length - 1, v + 1))}
                  disabled={activeVol === VOLUMES.length - 1}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {activeVol < VOLUMES.length - 1 && `Том ${VOLUMES[activeVol + 1].roman}`}
                  <ChevronRight size={14} />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Principles visual block */}
          <div className="mt-10 border-t border-white/5 pt-10">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-5">Принципы проекта</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { label: 'AI First',             color: '#00d4ff' },
                { label: 'Digital Twin First',   color: '#00d4ff' },
                { label: 'Zero Waste',           color: '#22c55e' },
                { label: 'Carbon Neutral',       color: '#22c55e' },
                { label: 'Water Positive',       color: '#0099ff' },
                { label: 'Nature Positive',      color: '#22c55e' },
                { label: 'Quantum Ready',        color: '#7c3aed' },
                { label: 'Open Science',         color: '#00e6c8' },
                { label: 'DAO Governance',       color: '#ec4899' },
                { label: 'ESG / SDGs',           color: '#f59e0b' },
                { label: 'Circular Economy',     color: '#22c55e' },
                { label: 'International Co-op',  color: '#0099ff' },
              ].map((p, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-2 bg-[#000d24] border border-white/5 rounded-lg px-3 py-2"
                >
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: p.color }} />
                  <span className="text-xs text-gray-400">{p.label}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Footer CTA */}
          <div className="mt-10 rounded-2xl border border-[#00d4ff]/20 p-6 text-center bg-gradient-to-b from-[#00d4ff]/5 to-transparent">
            <div className="text-[#00d4ff] font-bold text-lg mb-2">Готовы к сотрудничеству?</div>
            <p className="text-gray-500 text-sm mb-4">
              ARAL NEXUS открыт для государственных партнёров, международных инвесторов и учёных
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => navigate('/aral-nexus')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00d4ff]/10 border border-[#00d4ff]/30 text-[#00d4ff] hover:bg-[#00d4ff]/20 transition-colors text-sm"
              >
                <ExternalLink size={13} /> Мегапроект
              </button>
              <button
                onClick={() => navigate('/invest')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#7c3aed]/10 border border-[#7c3aed]/30 text-[#7c3aed] hover:bg-[#7c3aed]/20 transition-colors text-sm"
              >
                <Droplets size={13} /> Инвестировать
              </button>
              <button
                onClick={() => navigate('/contacts')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors text-sm"
              >
                <Handshake size={13} /> Контакты
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Volume Metrics ────────────────────────────────────────────────────────────

function VolumeMetrics({ items, color }: { items: { label: string; val: string }[]; color: string }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
      {items.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className="bg-[#000d24] border border-white/10 rounded-xl p-3 text-center"
          style={{ borderColor: color + '20' }}
        >
          <div className="font-mono font-black text-lg" style={{ color }}>{item.val}</div>
          <div className="text-xs text-gray-500 mt-0.5">{item.label}</div>
        </motion.div>
      ))}
    </div>
  );
}
