// ═══════════════════════════════════════════════════════════════
//  CommandPalette — глобальный поиск и быстрые действия (⌘K / Ctrl+K)
//  Единая точка входа в ОС: страницы, разделы, действия.
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useMemo, useRef, useCallback, memo, useDeferredValue } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Globe, Map as MapIcon, LayoutDashboard, BarChart2, Newspaper,
  Database, Building2, FolderOpen, Activity, Bell, Leaf,
  FlaskConical, BookOpen, ShoppingCart, FileText, Droplets,
  Briefcase, TrendingUp, Cpu, Network, Users, MessageSquare,
  Phone, User, Settings, CornerDownLeft, Sparkles, Gavel,
  Compass, Waves, Milestone, ScrollText,
  Satellite, Radio, Cloud, Zap, Truck, Bot, Sprout, Recycle, Telescope, Store,
  Fingerprint, TreePine, AudioWaveform, Handshake, ShieldAlert, Flame,
} from 'lucide-react';

type Cmd = {
  label: string;
  path: string;
  group: string;
  icon: typeof Search;
  keywords?: string;
  /** Одна строка под названием: что это. Для узлов и глав — их собственная. */
  sub?: string;
};

const COMMANDS: Cmd[] = [
  // Система.

  // Эти шесть страниц отсутствовали в индексе целиком, включая
  // конструктор конфигураций и вход для фондов. Сверка маршрутов
  // App.tsx с индексом палитры показала сорок незаиндексированных
  // адресов: индекс писался руками и отставал от маршрутов.
  {
    label: 'Операционная система — реестр узлов',
    path: '/os',
    group: 'Система',
    icon: Cpu,
    sub: 'Все узлы, их объём, состояние и то, чего в них нет',
    keywords: 'ос os система system about о проекте узлы реестр конструктор конфигурация пресет архитектура состав',
  },
  {
    label: 'Вход для фондов и инвесторов',
    path: '/fund',
    group: 'Система',
    icon: Briefcase,
    sub: 'С чего начинается разговор: границы, пакет работ, состояние',
    keywords: 'фонд фонды funds инвестор инвесторы investors вход посадочная пакет работ границы нули due diligence',
  },
  {
    label: 'Архитектура и передача',
    path: '/architecture',
    group: 'Система',
    icon: Network,
    sub: 'Что именно передаётся при франшизе и на каких границах',
    keywords: 'архитектура architecture франшиза franchise передача лицензия контур границы слои',
  },
  {
    label: 'Документ — полный текст',
    path: '/doc',
    group: 'Система',
    icon: ScrollText,
    sub: 'Четырнадцать глав; каждое утверждение несёт своё основание',
    keywords: 'документ doc вайтпейпер whitepaper главы полный текст основания',
  },
  {
    label: 'Документ — короткая версия',
    path: '/doc/short',
    group: 'Система',
    icon: FileText,
    sub: 'Подмножество тех же глав, не отдельный текст',
    keywords: 'короткая презентация short выжимка кратко',
  },
  {
    label: 'Обзор платформы',
    path: '/explore',
    group: 'Система',
    icon: Compass,
    sub: 'Регионы, проекты и модули одним экраном',
    keywords: 'обзор explore осмотр что есть регионы проекты',
  },
  // Остаток незаиндексированного, найденный сверкой маршрутов
  // (scripts/check-nav-links.mjs). Часть адресов — синонимы: «/about»
  // и «/system» ведут на ту же страницу, что «/os», «/investors» и
  // «/funds» — на «/fund». Они записаны ключевыми словами канонических
  // пунктов выше, а не отдельными строками: пять одинаковых результатов
  // на один запрос — не полнота, а шум.
  {
    label: 'Проекты — перечень',
    path: '/hub/projects',
    group: 'Система',
    icon: FolderOpen,
    sub: 'Все проекты списком, без группировки по хабу',
    keywords: 'проекты перечень список projects',
  },
  {
    label: 'Лаборатория проектов',
    path: '/lab',
    group: 'Система',
    icon: FlaskConical,
    sub: 'Черновики и заготовки проектов',
    keywords: 'лаборатория lab черновики заготовки песочница',
  },
  {
    label: 'Инновации',
    path: '/innovations',
    group: 'Система',
    icon: Sparkles,
    sub: 'Разработки и заявки на них',
    keywords: 'инновации innovations патенты разработки изобретения',
  },
  {
    label: 'Лента новостей',
    path: '/news',
    group: 'Система',
    icon: Newspaper,
    sub: 'Публикации и события',
    keywords: 'новости лента news публикации события',
  },
  {
    label: 'Проект Аральского моря',
    path: '/aral',
    group: 'Система',
    icon: Droplets,
    sub: 'Страница проекта восстановления',
    keywords: 'арал аральское море проект восстановление aral',
  },
  {
    label: 'Онбординг',
    path: '/onboard',
    group: 'Система',
    icon: Compass,
    sub: 'Первый проход по платформе',
    keywords: 'онбординг onboard знакомство начало первый вход приветствие welcome',
  },
  {
    label: 'Презентация',
    path: '/presentation',
    group: 'Система',
    icon: ScrollText,
    sub: 'Слайды для показа',
    keywords: 'презентация presentation слайды показ демонстрация',
  },
  {
    label: 'Конференция TIIF 2026',
    path: '/conference/tiif-2026',
    group: 'Система',
    icon: Users,
    sub: 'Страница участия в конференции',
    keywords: 'конференция tiif 2026 форум участие выступление',
  },
  {
    label: 'Экопуть',
    path: '/journey',
    group: 'Система',
    icon: Leaf,
    sub: 'Маршрут по экологическим точкам',
    keywords: 'экопуть journey маршрут путь экология',
  },
  // Планета
  { label: 'Главная', path: '/', group: 'Планета', icon: Globe, sub: 'Глобус первым экраном, дальше — что это за ОС, шесть сборок с их состоянием, кто ведёт и кто назван стороной', keywords: 'earth 3d карта мира глобус globe главная основатель садыков foxampy labforge unicap united innovation capital партнёры участники' },
  { label: 'Карта', path: '/map', group: 'Планета', icon: MapIcon, keywords: 'world map регионы' },
  { label: '🛢 Газнефть — модуль', path: '/oilgas', group: 'Промышленность', icon: Flame, keywords: 'нефть газ oilgas месторождения нпз гпз gtl метан вибродиагностика labforge узбекистан казахстан туркменистан whitepaper онбординг каталог' },
  { label: '🛢 Газнефть — интеграционный контур', path: '/oilgas/integration', group: 'Промышленность', icon: Network, keywords: 'интеграция crm dao ai ии автоматизация партнёр партнер нефтегаз нефть газ цифровой двойник телеметрия scada предиктив тоир наряд допуск ldar mrv внедрение контур' },
  { label: 'Дашборд', path: '/dashboard', group: 'Планета', icon: LayoutDashboard, keywords: 'метрики kpi' },
  { label: 'Аналитика', path: '/analytics', group: 'Планета', icon: BarChart2, keywords: 'графики данные' },
  { label: 'Обновления', path: '/updates', group: 'Планета', icon: Newspaper, keywords: 'новости лента' },
  { label: 'Дорожная карта', path: '/roadmap', group: 'Планета', icon: Milestone, keywords: 'roadmap развитие план фазы модули пре-рендер' },
  { label: 'Направления', path: '/directions', group: 'Планета', icon: Compass, keywords: 'темы разделы навигация хаб оглавление directions' },
  { label: '🌍 Экология — модуль', path: '/ecology', group: 'Планета', icon: TreePine, keywords: 'экология арал аралкум муйнак приаралье хвостохранилища уран майлуу-суу оопт заповедник национальный парк биосферный резерват метан эмиттеры суперэмиттеры tropomi ghgsat ледники федченко абрамова засоление опустынивание пыль соль семипалатинск ecology' },
  { label: '🧭 Ресурсы — обозреватель', path: '/resources', group: 'Планета', icon: Compass, keywords: 'ресурсы домены обозреватель вода нефть газ экология минералы энергетика агро климат связи пересечения объекты субъекты геоданные счётчики resources' },
  // Инфраструктура
  { label: 'Объекты', path: '/hub/objects', group: 'Инфраструктура', icon: Database, keywords: 'водохранилище дамба канал 473' },
  { label: 'Субъекты', path: '/hub/subjects', group: 'Инфраструктура', icon: Building2, keywords: 'организации агентства' },
  { label: 'Проекты', path: '/hub', group: 'Инфраструктура', icon: FolderOpen, keywords: 'проекты hub' },
  { label: 'IoT-сеть', path: '/iot', group: 'Инфраструктура', icon: Activity, keywords: 'датчики сенсоры' },
  { label: 'Алерты', path: '/alerts', group: 'Инфраструктура', icon: Bell, keywords: 'предупреждения тревоги' },
  { label: 'Экосистема', path: '/ecosystem', group: 'Инфраструктура', icon: Leaf, keywords: 'связи граф' },
  { label: 'Живая модель региона', path: '/simulator', group: 'Инфраструктура', icon: Waves, keywords: 'модель карта объекты проекты инициативы благополучие экология восстановление арал simulator' },
  // Знания
  { label: '🏛 Витрина контура', path: '/showcase', group: 'Знания', icon: Store, keywords: 'витрина услуги консалтинг аудит r&d разработка платформы решения продукты исследования уровни участия поставщики unicap labforge daociv arkheos showcase предложения прайс условия расчёт' },
  { label: '⛓ Токенизация измерений', path: '/tokenization', group: 'Промышленность', icon: Fingerprint, keywords: 'токенизация хэш ноды измерения эмиссия верификация mrv labforge прослеживаемость хеш нода запечатывание метан ogmp miq guardian hedera стандарты неопределённость поверка' },
  { label: '〰 Вибродиагностика оборудования', path: '/diagnostics', group: 'Промышленность', icon: AudioWaveform, keywords: 'вибрация вибродиагностика вибро-волновая сетка медная обшивка прошивка подшипник bpfo bpfi bsf ftf дефект iso 20816 iso 10816 виброскорость спектр огибающая насос компрессор редуктор предиктивная диагностика состояние оборудования labforge diagnostics' },
  { label: '🤝 Партнёрские входы', path: '/partners', group: 'Знания', icon: Handshake, keywords: 'партнёры партнерство вход приглашение инвайт код онбординг презентация whitepaper промышленность инфраструктура градостроение город бизнес корпорации государство госорганы организации нко сегмент предложение сотрудничество partners invite' },
  { label: 'R&D / Методологии', path: '/rd', group: 'Знания', icon: FlaskConical, keywords: 'исследования разработки наука' },
  { label: 'Каталог технологий и оборудования', path: '/catalog', group: 'Промышленность', icon: BookOpen, keywords: 'технологии оборудование каталог станки насосы компрессоры арматура поставка' },
  { label: 'Тех-маркет: поставщики', path: '/tech-marketplace', group: 'Промышленность', icon: ShoppingCart, keywords: 'маркетплейс поставщики вендоры закупка оборудование' },
  { label: 'Документы', path: '/documents', group: 'Знания', icon: FileText, keywords: 'файлы брошюры' },
  { label: 'Whitepaper (VOD)', path: '/vod-whitepaper', group: 'Знания', icon: BookOpen, keywords: 'вайтпейпер токеномика dao роадмап' },
  { label: 'Whitepaper Арал', path: '/aral-whitepaper', group: 'Знания', icon: Droplets, keywords: 'вайтпейпер арал мегапроект' },
  { label: 'Обзор платформы', path: '/whitepaper', group: 'Знания', icon: BookOpen, keywords: 'explore обзор регионы проекты' },
  { label: 'Whitepaper (полный)', path: '/whitepaper-full', group: 'Знания', icon: ScrollText, keywords: 'вайтпейпер полный модули aral nexus ai core дорожная карта' },
  { label: 'ARAL NEXUS', path: '/aral-nexus', group: 'Знания', icon: Droplets, keywords: 'арал море' },

  { label: 'Genesis Engine', path: '/genesis', group: 'Модули', icon: Sparkles, keywords: 'генезис ии генерация модуль' },
  { label: 'Спутниковый мониторинг', path: '/satellite', group: 'Модули', icon: Satellite, keywords: 'спутник снимки слои море satellite' },
  { label: 'Сеть датчиков воды', path: '/sensors', group: 'Модули', icon: Radio, keywords: 'датчики сенсоры качество воды телеметрия sensors' },
  { label: 'Восстановление моря', path: '/water-recovery', group: 'Модули', icon: Waves, keywords: 'восстановление уровень приток испарение water recovery' },
  { label: 'Климат-инженерия', path: '/climate', group: 'Модули', icon: Cloud, keywords: 'климат опустынивание аралкум climate' },
  { label: 'Энергокольцо / H₂', path: '/energy', group: 'Модули', icon: Zap, keywords: 'энергия водород гидро солнце ветер energy hydrogen' },
  { label: 'Автономный транспорт', path: '/transport', group: 'Модули', icon: Truck, keywords: 'транспорт коридоры логистика маршруты transport' },
  { label: 'Роботы и дроны', path: '/robotics', group: 'Модули', icon: Bot, keywords: 'роботы дроны флот миссии robotics drones' },
  { label: 'Агротехнологии', path: '/agritech', group: 'Модули', icon: Sprout, keywords: 'агро земледелие культуры орошение agritech farming' },
  { label: 'Умный город-остров', path: '/city', group: 'Модули', icon: Building2, keywords: 'город остров кварталы инфраструктура city' },
  { label: 'Циркулярная экономика', path: '/circular', group: 'Модули', icon: Recycle, keywords: 'циркулярная переработка ресурсы циклы circular' },
  { label: 'Мировая обсерватория воды', path: '/observatory', group: 'Модули', icon: Telescope, keywords: 'обсерватория мониторинг воды страны observatory' },
  { label: 'Открытая наука', path: '/open-science', group: 'Модули', icon: FlaskConical, keywords: 'датасеты api открытые данные open science' },
  // Инвестиции
  { label: 'Конструктор проектов', path: '/constructor', group: 'Инвестиции', icon: Briefcase, keywords: 'создать проект новый' },
  { label: 'Инвестиции', path: '/invest', group: 'Инвестиции', icon: TrendingUp, keywords: 'вложить финансирование' },
  // Найти страницу можно по прямому запросу — она объясняет, что продажи нет.
  // Ключевые слова оставлены те же: человек, ищущий «купить токен», должен
  // попасть на отказ, а не на пустой результат.
  { label: 'Токенсейл — предложение снято', path: '/token-sale', group: 'Инвестиции', icon: ShieldAlert, keywords: 'токенсейл токены ico купить продажа vod token эмиссия кошелёк снято не проводится' },
  // Как и токенсейл, эти два раздела сняты, но остаются находимыми: ищущий
  // «стейкинг», «APY» или «казну DAO» должен увидеть разбор снятого.
  { label: 'Блокчейн / VOD Token — раздел снят', path: '/blockchain', group: 'Инвестиции', icon: ShieldAlert, keywords: 'токен nft реестр протокол курс капитализация стейкинг apy доходность tvl холдеры снято не выпущен' },
  { label: 'DAO / Голосование — раздел снят', path: '/dao', group: 'Инвестиции', icon: ShieldAlert, keywords: 'дао управление предложения казна голосование governance стейкинг apy снято не учреждено' },
  { label: 'Токеномика — раздел снят', path: '/tokenomics', group: 'Инвестиции', icon: ShieldAlert, keywords: 'токеномика эмиссия распределение аллокация supply tvl утилита стейкинг снято не утверждена' },
  { label: 'Регуляторика', path: '/regulatory', group: 'Инвестиции', icon: FileText, keywords: 'право закон' },
  // Аккаунт
  { label: 'Рабочий стол', path: '/workspace', group: 'Аккаунт', icon: Briefcase, keywords: 'workspace задачи' },
  { label: 'Сообщество', path: '/community', group: 'Аккаунт', icon: Users, keywords: 'коммьюнити' },
  { label: 'Сообщения', path: '/messages', group: 'Аккаунт', icon: MessageSquare, keywords: 'чат' },
  { label: 'Контакты', path: '/contacts', group: 'Аккаунт', icon: Phone, keywords: 'связаться' },
  { label: 'Профиль', path: '/account', group: 'Аккаунт', icon: User, keywords: 'аккаунт вход' },
  { label: 'Настройки', path: '/settings', group: 'Аккаунт', icon: Settings, keywords: 'опции язык' },
  // Прототипы стилей
  { label: 'Прототип: Цифровой двойник (HUD)', path: '/proto/object-hud', group: 'Прототипы', icon: Sparkles },
  { label: 'Прототип: Проект (Glass)', path: '/proto/project-glass', group: 'Прототипы', icon: Sparkles },
  { label: 'Прототип: Субъект (BI)', path: '/proto/subject-bi', group: 'Прототипы', icon: Sparkles },
  { label: 'Прототип: Мониторинг (Heatmap)', path: '/proto/monitor-heatmap', group: 'Прототипы', icon: Sparkles },
  { label: 'Прототип: R&D (Bento)', path: '/proto/rd-bento', group: 'Прототипы', icon: Sparkles },
];

// Precompute the lowercased haystack once per command (module scope) so filtering
// never rebuilds/​lowercases these strings on each keystroke.
type IndexedCmd = Cmd & { search: string };
const index1 = (c: Cmd): IndexedCmd => ({
  ...c,
  search: (c.label + ' ' + c.group + ' ' + (c.sub ?? '') + ' ' + (c.keywords ?? '')).toLowerCase(),
});

const INDEXED: IndexedCmd[] = COMMANDS.map(index1);

/**
 * Узлы реестра и главы документа — тоже предмет поиска.
 *
 * Индекс из одних названий страниц отвечает на вопрос «где страница
 * про воду», но не на вопрос «что у вас есть про метан» или «чем
 * подтверждена эмиссия». Ответ на второй вопрос лежит в реестре узлов
 * и в главах, и он там уже написан — своими словами авторов, а не
 * пересказом в ключевых словах.
 *
 * Загружается по первому открытию, а не при старте: реестр глав тянет
 * за собой весь корпус — 448 кб в сборке против 45 кб у узлов. Класть
 * это во входной бандл ради поиска, который откроют не все, — плата
 * временем загрузки каждого посетителя за удобство некоторых.
 *
 * Копии здесь не делается намеренно. Название узла живёт в одном месте;
 * попади оно сюда строкой — разошлось бы с реестром при первой правке,
 * ровно как разошлись три числа эмиссии в трёх файлах.
 */
async function loadRegistryEntries(): Promise<IndexedCmd[]> {
  const [{ NODES, FAMILY_LABEL, NODE_STATUS_LABEL }, { CHAPTERS }] = await Promise.all([
    import('@/data/platform/nodes'),
    import('@/data/whitepaper'),
  ]);

  const nodes: Cmd[] = NODES.map((n) => ({
    label: n.title,
    // Узел, которому есть что показать, ведёт на свою поверхность.
    // Остальные — в реестр: там узел описан целиком, включая то,
    // чего в нём нет. Вести в никуда хуже, чем вести в реестр.
    path: n.where?.to ?? '/os',
    group: 'Узлы ОС',
    icon: Cpu,
    sub: n.purpose,
    keywords: [
      n.id,
      FAMILY_LABEL[n.family],
      NODE_STATUS_LABEL[n.status],
      n.have,
      n.missing,
      'узел',
    ].join(' '),
  }));

  const chapters: Cmd[] = CHAPTERS.map((c) => ({
    label: `${c.num} · ${c.title}`,
    path: `/doc/${c.id}`,
    group: 'Главы документа',
    icon: ScrollText,
    sub: c.lede,
    keywords: `${c.id} глава документ вайтпейпер`,
  }));

  return [...nodes, ...chapters].map(index1);
}

// Memoized result row: only re-renders when its own props change (active/onEnter/onSelect),
// not when a sibling row's hover/selection changes. Handlers are passed stable via useCallback.
type RowProps = {
  cmd: Cmd;
  idx: number;
  active: boolean;
  onEnter: (idx: number) => void;
  onSelect: (path: string) => void;
};
const ResultRow = memo(function ResultRow({ cmd, idx, active, onEnter, onSelect }: RowProps) {
  const Icon = cmd.icon;
  return (
    <button
      onMouseEnter={() => onEnter(idx)}
      onClick={() => onSelect(cmd.path)}
      className="w-full flex items-start gap-3 px-4 py-2.5 text-left transition-colors cursor-pointer"
      style={{ background: active ? 'rgba(0,200,230,0.1)' : 'transparent' }}
    >
      <Icon size={16} className="shrink-0 mt-0.5" style={{ color: active ? '#00e6c8' : 'rgba(255,255,255,0.5)' }} />
      <span className="flex-1 min-w-0">
        <span className={`block text-sm ${active ? 'text-white' : 'text-white/70'}`}>{cmd.label}</span>
        {/* Подпись есть у узлов и глав: она объясняет, что человек
            откроет, до того как он это откроет. */}
        {cmd.sub && (
          <span className="block text-[11.5px] text-white/35 leading-snug mt-0.5 line-clamp-2">{cmd.sub}</span>
        )}
      </span>
      {active && <CornerDownLeft size={13} className="text-cyan-400/60 shrink-0 mt-0.5" />}
    </button>
  );
});

export function CommandPalette() {
  const [, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Реестр узлов и главы догружаются по первому открытию — см.
  // loadRegistryEntries. Пока они не пришли, поиск работает по
  // страницам: пустой список лучше, чем заблокированный ввод.
  const [registry, setRegistry] = useState<IndexedCmd[]>([]);
  const registryAsked = useRef(false);

  useEffect(() => {
    if (!open || registryAsked.current) return;
    registryAsked.current = true;
    loadRegistryEntries().then(setRegistry).catch(() => {
      // Разметка не догрузилась — поиск по страницам остаётся рабочим.
      // Молча делать вид, что реестр пуст, нельзя: об этом скажет
      // строка состояния внизу списка.
      registryAsked.current = false;
    });
  }, [open]);

  // Открытие: горячая клавиша и событие от строки поиска в шапке.
  // Раньше шапка подделывала нажатие Ctrl+K синтетическим
  // KeyboardEvent — работало, но связывало кнопку с раскладкой
  // клавиатуры вместо того, чтобы связать её с действием.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === 'Escape') setOpen(false);
    }
    function onAsk() { setOpen(true); }
    window.addEventListener('keydown', onKey);
    window.addEventListener('arkhe:palette', onAsk);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('arkhe:palette', onAsk);
    };
  }, []);

  useEffect(() => {
    if (open) { setQ(''); setSel(0); setTimeout(() => inputRef.current?.focus(), 30); }
  }, [open]);

  // Deferred query: keeps the <input> responsive (high-priority) while the list
  // filters/re-renders at a lower priority. On a fast keystroke burst React skips
  // intermediate list renders and only commits the latest.
  const deferredQ = useDeferredValue(q);

  const all = useMemo(() => [...INDEXED, ...registry], [registry]);

  const results = useMemo(() => {
    const s = deferredQ.trim().toLowerCase();
    // Без запроса узлы и главы не показываются: тридцать три лишние
    // строки в списке из полусотни страниц — не помощь, а шум.
    if (!s) return INDEXED;
    // Каждое слово запроса обязано найтись — иначе «метан узбекистан»
    // выдаёт всё, где есть хоть «метан», хоть «узбекистан».
    const words = s.split(/\s+/);
    return all.filter((c) => words.every((w) => c.search.includes(w)));
  }, [deferredQ, all]);

  useEffect(() => { setSel(0); }, [deferredQ]);

  const go = useCallback((path: string) => { setLocation(path); setOpen(false); }, [setLocation]);

  // Stable hover handler so memoized rows don't re-render just because the parent re-rendered.
  const onEnter = useCallback((idx: number) => setSel(idx), []);

  const onListKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => Math.min(s + 1, results.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
    if (e.key === 'Enter' && results[sel]) { e.preventDefault(); go(results[sel].path); }
  };

  // Group results preserving order, and assign each command its flat keyboard-nav
  // index up front — no mutable `let` counter threaded through render.
  const grouped = useMemo(() => {
    const map = new Map<string, { cmd: IndexedCmd; idx: number }[]>();
    results.forEach((c, idx) => {
      if (!map.has(c.group)) map.set(c.group, []);
      map.get(c.group)!.push({ cmd: c, idx });
    });
    return Array.from(map.entries());
  }, [results]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[10000] flex items-start justify-center pt-[12vh] px-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ background: 'rgba(0,4,12,0.7)', backdropFilter: 'blur(6px)' }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={onListKey}
            className="w-full max-w-xl rounded-2xl overflow-hidden"
            style={{ background: 'rgba(8,14,28,0.98)', border: '1px solid rgba(0,200,230,0.2)', boxShadow: '0 24px 80px rgba(0,0,0,0.7)' }}
          >
            {/* search */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
              <Search size={18} className="text-cyan-400 shrink-0" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Узел, страница или глава документа…"
                className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/30"
              />
              <kbd className="text-[10px] px-1.5 py-0.5 rounded text-white/40" style={{ background: 'rgba(255,255,255,0.06)' }}>ESC</kbd>
            </div>

            {/* results */}
            <div className="max-h-[52vh] overflow-y-auto py-2 wm-menu-scroll">
              {/* Пустой ответ называет, где искали. «Ничего не найдено»
                  оставляет человека гадать, чего у нас нет: раздела
                  или слова в описании. */}
              {grouped.length === 0 && (
                <div className="px-6 py-8 text-center">
                  <div className="text-white/40 text-sm">Совпадений нет</div>
                  <div className="text-white/25 text-[11.5px] mt-2 leading-relaxed">
                    Искали по названиям страниц, по {registry.length > 0 ? `${registry.length} записям реестра узлов и глав документа` : 'страницам — реестр узлов ещё догружается'} и по ключевым словам.
                    Поиск — по совпадению слов, синонимов он не подбирает.
                  </div>
                </div>
              )}
              {grouped.map(([group, items]) => (
                <div key={group} className="mb-1">
                  <div className="px-4 py-1 text-[10px] uppercase tracking-widest text-white/25 font-semibold">{group}</div>
                  {items.map(({ cmd, idx }) => (
                    <ResultRow
                      key={cmd.path}
                      cmd={cmd}
                      idx={idx}
                      active={idx === sel}
                      onEnter={onEnter}
                      onSelect={go}
                    />
                  ))}
                </div>
              ))}
            </div>

            {/* footer */}
            <div className="flex items-center justify-between px-4 py-2 border-t text-[10px] text-white/30"
              style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
              <span className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.06)' }}>↑↓</kbd> навигация
                <kbd className="px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.06)' }}>↵</kbd> открыть
              </span>
              {/* Названо тем, что есть: поиск по реестру. Подписать это
                  «ИИ-ассистентом» при отсутствии модели значило бы
                  начать знакомство с экосистемой с неправды. */}
              <span>
                {registry.length > 0
                  ? `Поиск по реестру · ${INDEXED.length} страниц, ${registry.length} узлов и глав`
                  : `Поиск по реестру · ${INDEXED.length} страниц`}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
