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
  Fingerprint, TreePine, AudioWaveform, Handshake, ShieldAlert,
} from 'lucide-react';

type Cmd = { label: string; path: string; group: string; icon: typeof Search; keywords?: string };

const COMMANDS: Cmd[] = [
  // Планета
  { label: 'Глобус', path: '/', group: 'Планета', icon: Globe, keywords: 'earth 3d карта мира' },
  { label: 'Карта', path: '/map', group: 'Планета', icon: MapIcon, keywords: 'world map регионы' },
  { label: '🛢 Газнефть — модуль', path: '/oilgas', group: 'Планета', icon: MapIcon, keywords: 'нефть газ oilgas месторождения нпз гпз gtl метан вибродиагностика labforge узбекистан казахстан туркменистан whitepaper онбординг каталог' },
  { label: '🛢 Газнефть — интеграционный модуль', path: '/oilgas/integration', group: 'Планета', icon: Network, keywords: 'интеграция crm dao ai ии автоматизация партнёр партнер нефтегаз нефть газ цифровой двойник телеметрия scada предиктив тоир наряд допуск ldar mrv внедрение контур' },
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
  { label: '⛓ Токенизация измерений', path: '/tokenization', group: 'Знания', icon: Fingerprint, keywords: 'токенизация хэш ноды измерения эмиссия верификация mrv labforge прослеживаемость хеш нода запечатывание метан ogmp miq guardian hedera стандарты неопределённость поверка' },
  { label: '〰 Вибродиагностика оборудования', path: '/diagnostics', group: 'Знания', icon: AudioWaveform, keywords: 'вибрация вибродиагностика вибро-волновая сетка медная обшивка прошивка подшипник bpfo bpfi bsf ftf дефект iso 20816 iso 10816 виброскорость спектр огибающая насос компрессор редуктор предиктивная диагностика состояние оборудования labforge diagnostics' },
  { label: '🤝 Партнёрские входы', path: '/partners', group: 'Знания', icon: Handshake, keywords: 'партнёры партнерство вход приглашение инвайт код онбординг презентация whitepaper промышленность инфраструктура градостроение город бизнес корпорации государство госорганы организации нко сегмент предложение сотрудничество partners invite' },
  { label: 'R&D / Методологии', path: '/rd', group: 'Знания', icon: FlaskConical, keywords: 'исследования разработки наука' },
  { label: 'Каталог тех/оборуд.', path: '/catalog', group: 'Знания', icon: BookOpen, keywords: 'технологии оборудование' },
  { label: 'Тех-маркет', path: '/tech-marketplace', group: 'Знания', icon: ShoppingCart, keywords: 'маркетплейс поставщики' },
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
const INDEXED: IndexedCmd[] = COMMANDS.map((c) => ({
  ...c,
  search: (c.label + ' ' + c.group + ' ' + (c.keywords ?? '')).toLowerCase(),
}));

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
      className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors cursor-pointer"
      style={{ background: active ? 'rgba(0,200,230,0.1)' : 'transparent' }}
    >
      <Icon size={16} className="shrink-0" style={{ color: active ? '#00e6c8' : 'rgba(255,255,255,0.5)' }} />
      <span className={`flex-1 text-sm ${active ? 'text-white' : 'text-white/70'}`}>{cmd.label}</span>
      {active && <CornerDownLeft size={13} className="text-cyan-400/60 shrink-0" />}
    </button>
  );
});

export function CommandPalette() {
  const [, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // global hotkey
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (open) { setQ(''); setSel(0); setTimeout(() => inputRef.current?.focus(), 30); }
  }, [open]);

  // Deferred query: keeps the <input> responsive (high-priority) while the list
  // filters/re-renders at a lower priority. On a fast keystroke burst React skips
  // intermediate list renders and only commits the latest.
  const deferredQ = useDeferredValue(q);

  const results = useMemo(() => {
    const s = deferredQ.trim().toLowerCase();
    if (!s) return INDEXED;
    return INDEXED.filter((c) => c.search.includes(s));
  }, [deferredQ]);

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
                placeholder="Поиск по ОС: объекты, проекты, страницы, действия…"
                className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/30"
              />
              <kbd className="text-[10px] px-1.5 py-0.5 rounded text-white/40" style={{ background: 'rgba(255,255,255,0.06)' }}>ESC</kbd>
            </div>

            {/* results */}
            <div className="max-h-[52vh] overflow-y-auto py-2 wm-menu-scroll">
              {grouped.length === 0 && (
                <div className="px-4 py-8 text-center text-white/30 text-sm">Ничего не найдено</div>
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
              <span>ARKHEOSIUM · Command Palette</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
