import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Droplets, Building, FolderOpen, Cpu, Bell, Newspaper,
  MapPin, TrendingUp, Zap, Users, Calendar, ArrowRight,
  AlertTriangle, CheckCircle2, Clock, ExternalLink, Tag,
  Activity, Wifi, Globe, BarChart2, Database, Sparkles,
  Radio, Layers, Grid3x3, FlaskConical, Gavel, Briefcase, BookOpen,
  Compass, Waves,
} from 'lucide-react';

// ── Newly shipped functional capabilities ─────────────────────
const NEW_FEATURES = [
  {
    path: '/aral',
    title: 'Мегапроект «Арал»',
    tag: 'Флагман',
    desc: 'Пилотный мегапроект возрождения Аральского моря: интерактивный мастер-план эко-города, таймлайн кризиса, фазы восстановления экосистемы, потоки ресурсов, KPI и модель тиражирования по всему миру.',
    icon: <Droplets size={18} />,
    color: '#00d4ff',
  },
  {
    path: '/innovations',
    title: 'Инновации и разработки',
    tag: 'R&D',
    desc: 'Витрина инноваций экосистемы: 12 разработок по 6 доменам с TRL-стадиями, pipeline idea→scale, фильтрами и детальными карточками.',
    icon: <Sparkles size={18} />,
    color: '#c084fc',
  },
  {
    path: '/tokenomics',
    title: 'Токеномика и блокчейн',
    tag: 'Экономика',
    desc: 'Экономический слой ОС: токен VOD, on-chain реестр ресурсов, распределение эмиссии, график вестинга, утилита токена и флайвил ценности.',
    icon: <TrendingUp size={18} />,
    color: '#f59e0b',
  },
  {
    path: '/news',
    title: 'Лента новостей ОС',
    tag: 'События',
    desc: 'Живая лента событий по всем элементам экосистемы — объектам, субъектам, проектам и ресурсам, с фильтрами по доменам и категориям.',
    icon: <Newspaper size={18} />,
    color: '#00e6c8',
  },
  {
    path: '/site',
    title: 'Сайт экосистемы',
    tag: 'Витрина',
    desc: 'Публичная главная страница ARKHEOSIUM: 6 доменов, живая экосистема ресурсов, ИИ-разработка и путь пользователя — точка входа во всю операционную систему.',
    icon: <Globe size={18} />,
    color: '#00d4ff',
  },
  {
    path: '/landing',
    title: 'Лендинг · Ранний доступ',
    tag: 'Промо',
    desc: 'Конверсионная страница: проблема→решение, преимущества, живые метрики, отзывы, FAQ и форма раннего доступа.',
    icon: <Sparkles size={18} />,
    color: '#00e6c8',
  },
  {
    path: '/lab',
    title: 'Лаборатория разработки',
    tag: 'ИИ',
    desc: 'AI-верстак: конструктор блоков проекта/продукта + чат с выбором ИИ/LLM-модели. Ассистент отвечает и на лету заполняет карточки — концепция, технологии, ТЭО, дорожная карта.',
    icon: <FlaskConical size={18} />,
    color: '#00e6c8',
  },
  {
    path: '/simulator',
    title: 'Живая модель региона',
    tag: 'Механика',
    desc: 'Реальная карта: обновляй объекты, проекты и инициативы — вживую растут индексы благополучия и экологии, а система подсказывает, что улучшить дальше.',
    icon: <Waves size={18} />,
    color: '#38bdf8',
  },
  {
    path: '/directions',
    title: 'Направления',
    tag: 'Навигация',
    desc: 'Тематический хаб: весь контент ОС сгруппирован по 6 водным направлениям с кросс-ссылками.',
    icon: <Compass size={18} />,
    color: '#a78bfa',
  },
  {
    path: '/dao',
    title: 'DAO ОС · Голосование',
    tag: 'Управление',
    desc: 'Живые предложения экосистемы, голосование силой VOD, казна DAO и делегирование.',
    icon: <Gavel size={18} />,
    color: '#00e6c8',
  },
  {
    path: '/constructor',
    title: 'Конструктор проектов',
    tag: 'Инвестиции',
    desc: 'Пошаговая сборка инвестпроекта из объектов и решений с расчётом экономики и IRR.',
    icon: <Briefcase size={18} />,
    color: '#4ade80',
  },
  {
    path: '/catalog',
    title: 'Каталог тех/оборуд.',
    tag: 'Данные',
    desc: '72 технологии и единицы оборудования — теперь из живой базы Supabase с фильтрами.',
    icon: <BookOpen size={18} />,
    color: '#a78bfa',
  },
];

// ── 5 UX/UI style prototypes ──────────────────────────────────
const STYLE_PROTOTYPES = [
  {
    path: '/proto/object-hud',
    title: 'Цифровой двойник объекта',
    style: 'HUD / Sci-Fi FUI',
    desc: 'Живая телеметрия водохранилища: радиальные датчики, сканлайны, неон.',
    icon: <Radio size={18} />,
    color: '#00e5ff',
    bg: 'radial-gradient(circle at 30% 20%, #001420, #000508)',
  },
  {
    path: '/proto/project-glass',
    title: 'Проект и инвестиции',
    style: 'Glassmorphism',
    desc: 'Матовое стекло на aurora-градиенте, слой инвест-виджета и дорожной карты.',
    icon: <Layers size={18} />,
    color: '#38bdf8',
    bg: 'radial-gradient(circle at 70% 20%, rgba(168,85,247,0.5), #0a0f2c)',
  },
  {
    path: '/proto/subject-bi',
    title: 'Субъект · BI-дашборд',
    style: 'Data-Dense Dashboard',
    desc: 'Плотная сетка KPI со спарклайнами и сортируемой таблицей портфеля.',
    icon: <BarChart2 size={18} />,
    color: '#22c55e',
    bg: 'linear-gradient(135deg, #0f172a, #0b1220)',
  },
  {
    path: '/proto/monitor-heatmap',
    title: 'Мониторинг регионов',
    style: 'Heatmap + Real-Time',
    desc: 'Матрица водного стресса регион×показатель и живая лента алертов.',
    icon: <Activity size={18} />,
    color: '#f59e0b',
    bg: 'radial-gradient(ellipse at top, #0a1424, #050a14)',
  },
  {
    path: '/proto/rd-bento',
    title: 'R&D · технологии',
    style: 'Bento Grid Showcase',
    desc: 'Модульная bento-сетка: TRL, патенты, стек технологий с hover-эффектами.',
    icon: <Grid3x3 size={18} />,
    color: '#4ade80',
    bg: 'linear-gradient(160deg, #14151a, #080909)',
  },
];

// ── Sample card data ──────────────────────────────────────────

const SAMPLE_OBJECT = {
  id: 1,
  name: 'Чарвакское водохранилище',
  type: 'Водохранилище',
  status: 'operational',
  region: 'Ташкентская обл.',
  country: 'Узбекистан',
  capacity: '2 000 млн м³',
  irr: 14.2,
  total_funding: 850_000_000,
  year_completed: 1970,
  description: 'Крупнейшее водохранилище Узбекистана на реке Чирчик. Снабжает Ташкент питьевой водой и вырабатывает 600 МВт электроэнергии.',
};

const SAMPLE_SUBJECT = {
  id: 2,
  organization_name: 'Государственный комитет водного хозяйства Узбекистана',
  organization_type: 'government_agency',
  country: 'Узбекистан',
  region: 'Ташкент',
  employees_count: 12_400,
  annual_budget: 340_000_000,
  founded_year: 1996,
  status: 'active',
  description: 'Регулятор водохозяйственной отрасли. Управляет 1 200+ ирригационными объектами по всей стране.',
};

const SAMPLE_PROJECT = {
  id: 3,
  title: 'Smart Water Grid — Ферганская долина',
  category: 'Цифровизация',
  status: 'active',
  region: 'Ферганская долина',
  total_funding: 120_000_000,
  irr: 18.5,
  progress: 64,
  deadline: '2026-Q3',
  team: 47,
  description: 'Установка 3 400 IoT-датчиков расхода воды, создание цифрового двойника ирригационной сети и AI-системы предупреждения потерь.',
};

const SAMPLE_EQUIPMENT = {
  id: 4,
  name: 'AquaSense Pro 4000',
  category: 'IoT-датчик',
  manufacturer: 'HydroTech Systems',
  status: 'available',
  price: 1_200,
  accuracy: '±0.3%',
  battery: '5 лет',
  protocol: 'LoRaWAN / MQTT',
  certifications: 'IP68, CE, EAC',
  description: 'Ультразвуковой расходомер промышленного класса с дистанционной передачей данных. Работает в диапазоне -30 / +85 °C.',
};

const SAMPLE_ALERT = {
  id: 5,
  title: 'Критический уровень воды — канал Карши',
  severity: 'critical',
  type: 'water_level',
  region: 'Кашкадарьинская обл.',
  value: 0.34,
  threshold: 0.50,
  timestamp: '2025-07-14T08:23:00Z',
  description: 'Уровень воды в главном канале опустился до 34% от нормы. Возможен дефицит полива на 18 000 га.',
};

const SAMPLE_UPDATE = {
  id: 6,
  title: 'ARKHEOSIUM v3.0 — Релиз Planetary OS',
  type: 'release',
  date: '2025-07-15',
  tags: ['релиз', 'планетарная ОС', 'AI'],
  summary: 'Запуск новой операционной системы управления водной инфраструктурой Центральной Азии. 12 новых AI-модулей, цифровые двойники объектов, интеграция блокчейна.',
  author: 'Команда ARKHEOSIUM',
};

// ── Helpers ───────────────────────────────────────────────────
function fmtMoney(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n}`;
}

// ── Card: Объект (Water Infrastructure Object) ────────────────
function ObjectCardNew() {
  const color = '#00d4ff';
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(0,8,24,0.85)', border: `1px solid ${color}22`, backdropFilter: 'blur(16px)' }}
    >
      {/* Photo gradient placeholder */}
      <div className="relative h-36 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #001a3a 0%, #003366 40%, #00224d 100%)' }}>
        {/* Decorative water ripple */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          {[0,1,2].map(i => (
            <div key={i} className="absolute rounded-full border border-cyan-400 animate-ping"
              style={{ width: 60 + i*40, height: 60 + i*40, animationDelay: `${i * 0.5}s`, animationDuration: '3s' }} />
          ))}
        </div>
        <Droplets className="absolute bottom-3 right-4 w-16 h-16 opacity-15" style={{ color }} />

        <div className="absolute top-3 left-3 flex gap-1.5">
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
            style={{ background: `${color}20`, color, border: `1px solid ${color}30` }}>
            {SAMPLE_OBJECT.type}
          </span>
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.25)' }}>
            ● Активный
          </span>
        </div>

        <div className="absolute bottom-3 left-3">
          <div className="text-white/40 text-xs">{SAMPLE_OBJECT.year_completed} · {SAMPLE_OBJECT.country}</div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-white font-bold text-base leading-tight">{SAMPLE_OBJECT.name}</h3>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
            <Droplets size={16} style={{ color }} />
          </div>
        </div>

        <div className="flex items-center gap-1.5 mb-3">
          <MapPin size={10} className="text-white/30" />
          <span className="text-xs text-white/40">{SAMPLE_OBJECT.region}, {SAMPLE_OBJECT.country}</span>
        </div>

        <p className="text-xs text-white/50 leading-relaxed line-clamp-2 mb-4">{SAMPLE_OBJECT.description}</p>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: 'Объём', value: SAMPLE_OBJECT.capacity, color: '#00d4ff' },
            { label: 'IRR', value: `${SAMPLE_OBJECT.irr}%`, color: '#00e6c8' },
            { label: 'Финансирование', value: fmtMoney(SAMPLE_OBJECT.total_funding), color: '#4ade80' },
          ].map(m => (
            <div key={m.label} className="rounded-xl p-2.5 text-center"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="font-black text-sm" style={{ color: m.color }}>{m.value}</div>
              <div className="text-[9px] text-white/30 mt-0.5">{m.label}</div>
            </div>
          ))}
        </div>

        <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all hover:scale-[1.01]"
          style={{ background: `${color}12`, border: `1px solid ${color}25`, color }}>
          Открыть объект <ArrowRight size={12} />
        </button>
      </div>
    </motion.div>
  );
}

// ── Card: Субъект (Organization) ──────────────────────────────
function SubjectCardNew() {
  const color = '#fbbf24';
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(0,8,24,0.85)', border: `1px solid ${color}22`, backdropFilter: 'blur(16px)' }}
    >
      {/* Top header band */}
      <div className="h-2 w-full" style={{ background: `linear-gradient(90deg, ${color}90, ${color}20)` }} />

      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-2xl"
            style={{ background: `${color}10`, border: `1px solid ${color}25` }}>
            🏛️
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-sm leading-tight mb-1.5 line-clamp-2">
              {SAMPLE_SUBJECT.organization_name}
            </h3>
            <div className="flex flex-wrap gap-1">
              <span className="px-2 py-0.5 rounded-full text-xs"
                style={{ background: `${color}12`, color, border: `1px solid ${color}20` }}>
                Госагентство
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs"
                style={{ background: 'rgba(74,222,128,0.08)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.15)' }}>
                Активный
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 mb-3">
          <MapPin size={10} className="text-white/30" />
          <span className="text-xs text-white/40">{SAMPLE_SUBJECT.region}, {SAMPLE_SUBJECT.country}</span>
        </div>

        <p className="text-xs text-white/50 leading-relaxed line-clamp-2 mb-4">{SAMPLE_SUBJECT.description}</p>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { icon: <Calendar size={10} />, label: 'Основан', value: SAMPLE_SUBJECT.founded_year },
            { icon: <Users size={10} />, label: 'Персонал', value: SAMPLE_SUBJECT.employees_count?.toLocaleString() },
            { icon: <Zap size={10} />, label: 'Бюджет/год', value: fmtMoney(SAMPLE_SUBJECT.annual_budget!) },
          ].map(m => (
            <div key={m.label} className="rounded-xl p-2.5 text-center"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center justify-center gap-1 text-white/30 mb-1">{m.icon}</div>
              <div className="font-black text-xs text-white">{m.value}</div>
              <div className="text-[9px] text-white/30 mt-0.5">{m.label}</div>
            </div>
          ))}
        </div>

        <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all hover:scale-[1.01]"
          style={{ background: `${color}12`, border: `1px solid ${color}25`, color }}>
          Профиль субъекта <ArrowRight size={12} />
        </button>
      </div>
    </motion.div>
  );
}

// ── Card: Проект ──────────────────────────────────────────────
function ProjectCardNew() {
  const color = '#4ade80';
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.10 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(0,8,24,0.85)', border: `1px solid ${color}22`, backdropFilter: 'blur(16px)' }}
    >
      <div className="h-2 w-full" style={{ background: `linear-gradient(90deg, ${color}80, ${color}15)` }} />

      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-xl"
            style={{ background: `${color}10`, border: `1px solid ${color}25` }}>
            🚀
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs text-white/35 font-semibold uppercase tracking-wider">{SAMPLE_PROJECT.category}</span>
            <h3 className="text-white font-bold text-sm leading-tight mt-0.5 line-clamp-2">{SAMPLE_PROJECT.title}</h3>
          </div>
        </div>

        <div className="flex items-center gap-1.5 mb-3">
          <MapPin size={10} className="text-white/30" />
          <span className="text-xs text-white/40">{SAMPLE_PROJECT.region}</span>
          <span className="text-white/15 ml-1">·</span>
          <Clock size={10} className="text-white/30" />
          <span className="text-xs text-white/40">до {SAMPLE_PROJECT.deadline}</span>
        </div>

        <p className="text-xs text-white/50 leading-relaxed line-clamp-2 mb-4">{SAMPLE_PROJECT.description}</p>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-white/35">Прогресс</span>
            <span className="text-xs font-bold" style={{ color }}>{SAMPLE_PROJECT.progress}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${SAMPLE_PROJECT.progress}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${color}, ${color}70)` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: 'Финансирование', value: fmtMoney(SAMPLE_PROJECT.total_funding) },
            { label: 'IRR', value: `${SAMPLE_PROJECT.irr}%` },
            { label: 'Команда', value: `${SAMPLE_PROJECT.team} чел.` },
          ].map(m => (
            <div key={m.label} className="rounded-xl p-2.5 text-center"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="font-black text-xs" style={{ color }}>{m.value}</div>
              <div className="text-[9px] text-white/30 mt-0.5">{m.label}</div>
            </div>
          ))}
        </div>

        <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all hover:scale-[1.01]"
          style={{ background: `${color}12`, border: `1px solid ${color}25`, color }}>
          Открыть проект <ArrowRight size={12} />
        </button>
      </div>
    </motion.div>
  );
}

// ── Card: Оборудование ────────────────────────────────────────
function EquipmentCardNew() {
  const color = '#a78bfa';
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(0,8,24,0.85)', border: `1px solid ${color}22`, backdropFilter: 'blur(16px)' }}
    >
      <div className="h-2 w-full" style={{ background: `linear-gradient(90deg, ${color}80, ${color}15)` }} />

      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `${color}10`, border: `1px solid ${color}25` }}>
            <Cpu size={20} style={{ color }} />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: `${color}90` }}>
              {SAMPLE_EQUIPMENT.category}
            </span>
            <h3 className="text-white font-bold text-sm leading-tight mt-0.5">{SAMPLE_EQUIPMENT.name}</h3>
            <span className="text-xs text-white/35">{SAMPLE_EQUIPMENT.manufacturer}</span>
          </div>
          <div className="px-2 py-1 rounded-lg text-xs font-bold"
            style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)' }}>
            В наличии
          </div>
        </div>

        <p className="text-xs text-white/50 leading-relaxed line-clamp-2 mb-4">{SAMPLE_EQUIPMENT.description}</p>

        <div className="grid grid-cols-2 gap-2 mb-4">
          {[
            { label: 'Точность', value: SAMPLE_EQUIPMENT.accuracy, icon: <Activity size={10} /> },
            { label: 'Батарея', value: SAMPLE_EQUIPMENT.battery, icon: <Zap size={10} /> },
            { label: 'Протокол', value: SAMPLE_EQUIPMENT.protocol, icon: <Wifi size={10} /> },
            { label: 'Сертификаты', value: SAMPLE_EQUIPMENT.certifications, icon: <CheckCircle2 size={10} /> },
          ].map(m => (
            <div key={m.label} className="rounded-xl p-2.5"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-1 text-white/30 mb-1" style={{ color: `${color}80` }}>{m.icon}
                <span className="text-[9px] text-white/30">{m.label}</span>
              </div>
              <div className="font-semibold text-xs text-white/80 truncate">{m.value}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs text-white/30">Цена за ед.</div>
            <div className="text-xl font-black" style={{ color }}>
              ${SAMPLE_EQUIPMENT.price.toLocaleString()}
            </div>
          </div>
          <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all hover:scale-[1.01]"
            style={{ background: `${color}15`, border: `1px solid ${color}30`, color }}>
            Запросить <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Card: Алерт ───────────────────────────────────────────────
function AlertCardNew() {
  const color = '#f87171';
  const ts = new Date(SAMPLE_ALERT.timestamp);
  const timeAgo = '5 ч. назад';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.20 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(10,3,3,0.90)', border: `1px solid ${color}30`, backdropFilter: 'blur(16px)' }}
    >
      {/* Pulse bar */}
      <div className="h-1.5 w-full relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(90deg, ${color}, #ff8c00, ${color})` }} />
        <motion.div
          className="absolute inset-0 opacity-60"
          style={{ background: `linear-gradient(90deg, transparent, #fff, transparent)` }}
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
            <AlertTriangle size={18} style={{ color }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-white font-bold text-sm leading-tight line-clamp-2">{SAMPLE_ALERT.title}</h3>
              <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
                style={{ background: `${color}20`, color, border: `1px solid ${color}35` }}>
                Критично
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <MapPin size={10} style={{ color: `${color}80` }} />
              <span className="text-xs" style={{ color: `${color}80` }}>{SAMPLE_ALERT.region}</span>
              <span className="text-white/20">·</span>
              <Clock size={10} className="text-white/25" />
              <span className="text-xs text-white/35">{timeAgo}</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-white/55 leading-relaxed mb-4">{SAMPLE_ALERT.description}</p>

        {/* Level indicator */}
        <div className="rounded-xl p-3 mb-4" style={{ background: `${color}08`, border: `1px solid ${color}18` }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-white/40">Уровень воды</span>
            <span className="text-xs font-bold" style={{ color }}>{(SAMPLE_ALERT.value * 100).toFixed(0)}% от нормы</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div className="h-full rounded-full" style={{ width: `${SAMPLE_ALERT.value * 100}%`, background: `linear-gradient(90deg, ${color}, #ff8c00)` }} />
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[9px] text-white/20">0%</span>
            <span className="text-[9px] text-white/30">Порог: {(SAMPLE_ALERT.threshold * 100).toFixed(0)}%</span>
            <span className="text-[9px] text-white/20">100%</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button className="flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all"
            style={{ background: `${color}15`, border: `1px solid ${color}30`, color }}>
            Просмотр
          </button>
          <button className="flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
            Закрыть
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Card: Обновление/Новость ──────────────────────────────────
function UpdateCardNew() {
  const color = '#06b6d4';
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(0,8,24,0.85)', border: `1px solid ${color}22`, backdropFilter: 'blur(16px)' }}
    >
      {/* Gradient header */}
      <div className="h-24 relative overflow-hidden flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #001a2e, #002244, #001833)' }}>
        <Globe className="absolute right-4 bottom-2 w-14 h-14 opacity-10" style={{ color }} />
        <div className="text-center z-10">
          <div className="text-xs uppercase tracking-widest font-bold mb-1" style={{ color: `${color}80` }}>
            🆕 {SAMPLE_UPDATE.type === 'release' ? 'Релиз' : 'Обновление'}
          </div>
          <div className="text-white/25 text-xs">{new Date(SAMPLE_UPDATE.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-white font-bold text-sm leading-tight mb-2">{SAMPLE_UPDATE.title}</h3>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {SAMPLE_UPDATE.tags.map(tag => (
            <span key={tag} className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px]"
              style={{ background: `${color}10`, color: `${color}cc`, border: `1px solid ${color}18` }}>
              <Tag size={8} />{tag}
            </span>
          ))}
        </div>

        <p className="text-xs text-white/55 leading-relaxed mb-4">{SAMPLE_UPDATE.summary}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
              style={{ background: `${color}15`, border: `1px solid ${color}25` }}>А</div>
            <span className="text-xs text-white/35">{SAMPLE_UPDATE.author}</span>
          </div>
          <button className="flex items-center gap-1.5 text-xs font-semibold transition-all hover:scale-105"
            style={{ color }}>
            Подробнее <ExternalLink size={10} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Recent Updates Feed ───────────────────────────────────────
const RECENT_UPDATES = [
  { id: 1, type: 'object',    icon: '💧', title: 'Нурекская ГЭС: плановое ТО завершено',      time: '2 ч. назад',  color: '#00d4ff' },
  { id: 2, type: 'alert',     icon: '🚨', title: 'Алерт: снижение уровня — канал Карши',       time: '5 ч. назад',  color: '#f87171' },
  { id: 3, type: 'project',   icon: '🚀', title: 'Smart Grid Фергана: прогресс 64%',           time: '1 д. назад',  color: '#4ade80' },
  { id: 4, type: 'subject',   icon: '🏢', title: 'Новый партнёр: Asian Development Bank',      time: '2 д. назад',  color: '#fbbf24' },
  { id: 5, type: 'equipment', icon: '📡', title: 'Поставка 200 ед. AquaSense Pro в Ташкент', time: '3 д. назад',  color: '#a78bfa' },
  { id: 6, type: 'release',   icon: '🆕', title: 'ARKHEOSIUM v3.0: запуск Planetary OS',      time: '5 д. назад',  color: '#06b6d4' },
];

// ── Page ──────────────────────────────────────────────────────
type CardType = 'all' | 'object' | 'subject' | 'project' | 'equipment' | 'alert' | 'update';

const CARD_FILTERS: { key: CardType; label: string; icon: string; color: string }[] = [
  { key: 'all',       label: 'Все',          icon: '🔷', color: '#00d4ff' },
  { key: 'object',    label: 'Объекты',      icon: '💧', color: '#00d4ff' },
  { key: 'subject',   label: 'Субъекты',     icon: '🏢', color: '#fbbf24' },
  { key: 'project',   label: 'Проекты',      icon: '🚀', color: '#4ade80' },
  { key: 'equipment', label: 'Оборудование', icon: '📡', color: '#a78bfa' },
  { key: 'alert',     label: 'Алерты',       icon: '🚨', color: '#f87171' },
  { key: 'update',    label: 'Обновления',   icon: '🆕', color: '#06b6d4' },
];

export default function UpdatesPage() {
  const [, setLocation] = useLocation();
  const [activeFilter, setActiveFilter] = useState<CardType>('all');

  const showCard = (type: CardType) => activeFilter === 'all' || activeFilter === type;

  return (
    <div
      className="min-h-screen"
    >
      {/* ── Header ───────────────────────────────────────────── */}
      <div
        className="sticky top-0 z-30 px-4 sm:px-6 py-4"
        style={{ background: 'rgba(0,6,20,0.94)', borderBottom: '1px solid rgba(0,200,230,0.08)', backdropFilter: 'blur(20px)' }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.22)' }}>
              <Newspaper size={16} style={{ color: '#06b6d4' }} />
            </div>
            <div>
              <h1 className="text-white font-black text-lg leading-tight">Обновления</h1>
              <p className="text-white/30 text-xs">Лента событий · новые карточки всех классов</p>
            </div>
          </div>

          {/* Filter chips */}
          <div className="flex gap-2 overflow-x-auto pb-0.5 flex-nowrap">
            {CARD_FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all h-8"
                style={activeFilter === f.key
                  ? { background: `${f.color}18`, color: f.color, border: `1px solid ${f.color}30` }
                  : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <span>{f.icon}</span>
                <span>{f.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* ── Section: 5 new UX/UI style prototypes ─────────── */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={16} style={{ color: '#06b6d4' }} />
            <h2 className="text-white font-bold text-base">5 новых стилей интерфейса</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
              style={{ background: 'rgba(6,182,212,0.12)', color: '#06b6d4', border: '1px solid rgba(6,182,212,0.25)' }}>
              прототипы
            </span>
          </div>
          <p className="text-white/30 text-xs mb-5">
            Каждый прототип — отдельный проработанный UX/UI-стиль на реальном классе сущности. Нажмите, чтобы открыть.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {STYLE_PROTOTYPES.map((p, i) => (
              <motion.button
                key={p.path}
                onClick={() => setLocation(p.path)}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -4 }}
                className="text-left rounded-2xl overflow-hidden group cursor-pointer"
                style={{ border: `1px solid ${p.color}25`, background: 'rgba(0,8,24,0.6)' }}
              >
                {/* preview band */}
                <div className="h-24 relative overflow-hidden" style={{ background: p.bg }}>
                  <div className="absolute inset-0 opacity-40"
                    style={{ background: `radial-gradient(circle at 80% 30%, ${p.color}40, transparent 60%)` }} />
                  <div className="absolute top-3 left-3 w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${p.color}18`, border: `1px solid ${p.color}35`, color: p.color }}>
                    {p.icon}
                  </div>
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                    style={{ background: 'rgba(0,0,0,0.4)', color: p.color, border: `1px solid ${p.color}30` }}>
                    {p.style}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="text-white font-bold text-sm mb-1 flex items-center justify-between">
                    {p.title}
                    <ArrowRight size={14} className="opacity-30 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" style={{ color: p.color }} />
                  </h3>
                  <p className="text-white/40 text-xs leading-relaxed">{p.desc}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* ── Section: Newly shipped functional pages ───────── */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={16} style={{ color: '#4ade80' }} />
            <h2 className="text-white font-bold text-base">Новые возможности</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
              style={{ background: 'rgba(74,222,128,0.12)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.25)' }}>
              в проде
            </span>
          </div>
          <p className="text-white/30 text-xs mb-5">
            Готовые рабочие модули платформы. Нажмите, чтобы открыть.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {NEW_FEATURES.map((f, i) => (
              <motion.button
                key={f.path}
                onClick={() => setLocation(f.path)}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -4 }}
                className="text-left rounded-2xl p-4 group cursor-pointer"
                style={{ border: `1px solid ${f.color}25`, background: 'rgba(0,8,24,0.6)' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${f.color}15`, border: `1px solid ${f.color}30`, color: f.color }}>
                    {f.icon}
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                    style={{ background: `${f.color}12`, color: f.color, border: `1px solid ${f.color}25` }}>
                    {f.tag}
                  </span>
                </div>
                <h3 className="text-white font-bold text-sm mb-1 flex items-center justify-between">
                  {f.title}
                  <ArrowRight size={14} className="opacity-30 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" style={{ color: f.color }} />
                </h3>
                <p className="text-white/40 text-xs leading-relaxed">{f.desc}</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* ── Section: New card designs ─────────────────────── */}
        <div className="mb-2">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.05)' }} />
            <span className="text-xs text-white/20 uppercase tracking-widest font-semibold px-2">
              Новые образцы карточек
            </span>
            <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.05)' }} />
          </div>
          <p className="text-center text-xs text-white/20 mb-6">
            По одному примеру для каждого класса объектов
          </p>
        </div>

        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
            {showCard('object')    && <ObjectCardNew />}
            {showCard('subject')   && <SubjectCardNew />}
            {showCard('project')   && <ProjectCardNew />}
            {showCard('equipment') && <EquipmentCardNew />}
            {showCard('alert')     && <AlertCardNew />}
            {showCard('update')    && <UpdateCardNew />}
          </div>
        </AnimatePresence>

        {/* ── Section: Recent updates feed ─────────────────── */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.05)' }} />
            <span className="text-xs text-white/20 uppercase tracking-widest font-semibold px-2">
              Лента последних событий
            </span>
            <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.05)' }} />
          </div>

          <div className="space-y-2">
            {RECENT_UPDATES.filter(u => activeFilter === 'all' || u.type === activeFilter).map((upd, i) => (
              <motion.div
                key={upd.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center gap-4 px-4 py-3 rounded-2xl cursor-pointer group transition-all"
                style={{
                  background: 'rgba(255,255,255,0.025)',
                  border: `1px solid ${upd.color}12`,
                }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0"
                  style={{ background: `${upd.color}12`, border: `1px solid ${upd.color}20` }}>
                  {upd.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/75 font-medium group-hover:text-white transition-colors truncate">
                    {upd.title}
                  </p>
                  <p className="text-xs text-white/30 mt-0.5">{upd.time}</p>
                </div>
                <ArrowRight size={14} className="text-white/15 group-hover:text-white/40 transition-colors shrink-0" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Footer note ──────────────────────────────────── */}
        <div className="mt-10 text-center text-xs text-white/15 space-y-1">
          <p>ARKHEOSIUM v3.0 · Planetary Infrastructure OS</p>
          <p>Данные обновляются в реальном времени из Supabase</p>
        </div>
      </div>
    </div>
  );
}
