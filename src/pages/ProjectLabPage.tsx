// ═══════════════════════════════════════════════════════════════
//  ProjectLabPage — «Лаборатория разработки»  (route: /lab)
//  Claude-Code-подобная IDE для разработки проектов и продуктов:
//   • ЛЕВО   — список чат-сессий (persist в localStorage)
//   • ЦЕНТР  — основной чат с ИИ (useLabChat) + патч блоков
//   • ПРАВО  — панель с вкладками: Конструктор · Превью · Карта · Исследование
//  Контракт /api/lab-chat и labTypes НЕ меняются.
// ═══════════════════════════════════════════════════════════════

import { useMemo, useRef, useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FlaskConical, Send, Loader2, Sparkles, RotateCcw, Download, AlertTriangle,
  Lightbulb, Cpu, DollarSign, Calendar, Users, ListChecks, Rocket, Zap, Brain,
  Boxes, TrendingUp, Package, Building2, Wand2, Check,
  LayoutGrid, FileText, Map as MapIcon, Search, PanelLeft, Cpu as CpuIcon,
} from 'lucide-react';
import { useLabChat } from '@/hooks/useLabChat';
import { useLabSessions } from '@/hooks/useLabSessions';
import {
  LAB_MODELS, LAB_TEMPLATES, type LabMode, type LabBlock, type ChatMessage,
} from '@/lib/labTypes';
import SessionSidebar from '@/components/lab/SessionSidebar';
import PreviewDoc from '@/components/lab/PreviewDoc';
import ResearchPanel from '@/components/lab/ResearchPanel';
import { WaterMap } from '@/components/map/WaterMap';
import { getMapMarkersByType } from '@/data/map-markers';
import type { MapMarker } from '@/components/map/types';

const ACCENT = '#00e6c8';
const ACCENT2 = '#00d4ff';

// lucide icon resolver (block + model + input-type icons referenced by name)
const ICONS: Record<string, typeof Lightbulb> = {
  Lightbulb, Cpu, DollarSign, Calendar, Users, ListChecks, Rocket, Zap, Brain,
  Boxes, TrendingUp, AlertTriangle, Sparkles, Package, Building2,
};
const Icon = ({ name, className, style }: { name: string; className?: string; style?: React.CSSProperties }) => {
  const C = ICONS[name] || Package;
  return <C className={className} style={style} />;
};

const QUICK_PROMPTS: Record<LabMode, string[]> = {
  project: [
    'Предложи концепцию водного проекта для Приаралья',
    'Подбери технологии и оборудование под задачу',
    'Рассчитай ориентировочное ТЭО (CAPEX/OPEX/окупаемость)',
    'Составь дорожную карту по фазам',
  ],
  product: [
    'Придумай цифровой продукт для мониторинга воды',
    'Опиши аудиторию и её боли (JTBD)',
    'Сформируй объём MVP и функции v1',
    'Предложи модель монетизации и метрики',
  ],
};

const greeting = (mode: LabMode): ChatMessage => ({
  role: 'assistant',
  content:
    mode === 'product'
      ? 'Привет! Я — со-пилот разработки продуктов ARKHEOSIUM. Опишите идею продукта — я помогу проработать концепцию, аудиторию, функции, стек, монетизацию и go-to-market, и заполню блоки конструктора.'
      : 'Привет! Я — со-пилот разработки проектов ARKHEOSIUM. Опишите задачу или объект — я помогу собрать концепцию, решение, технологии, ТЭО и дорожную карту, заполняя блоки конструктора.',
});

// Curated regional water objects for the map tab (fallback if aggregator is empty).
const CURATED_MARKERS: MapMarker[] = [
  { id: 'lab-aral', type: 'object', lat: 45.0, lng: 59.5, title: 'Аральское море', description: 'Зона экологической катастрофы, восстановление Северного Арала.', domain: 'water' },
  { id: 'lab-amudarya', type: 'object', lat: 41.5, lng: 60.6, title: 'Амударья', description: 'Крупнейшая река бассейна, орошение и водораспределение.', domain: 'water' },
  { id: 'lab-syrdarya', type: 'object', lat: 44.0, lng: 65.5, title: 'Сырдарья', description: 'Вторая по значимости река Центральной Азии.', domain: 'water' },
  { id: 'lab-charvak', type: 'object', lat: 41.62, lng: 70.05, title: 'Чарвакское вдхр.', description: 'Водохранилище и ГЭС под Ташкентом.', domain: 'energy' },
  { id: 'lab-toktogul', type: 'object', lat: 41.68, lng: 72.94, title: 'Токтогульское вдхр.', description: 'Ключевой регулятор стока Сырдарьи, Кыргызстан.', domain: 'energy' },
];

const CENTER: [number, number] = [63, 43];
const ZOOM = 4.2;

type PanelTab = 'build' | 'preview' | 'map' | 'research';
type MobileView = 'sessions' | 'chat' | 'panel';

const PANEL_TABS: { key: PanelTab; label: string; icon: typeof LayoutGrid }[] = [
  { key: 'build', label: 'Конструктор', icon: LayoutGrid },
  { key: 'preview', label: 'Превью', icon: FileText },
  { key: 'map', label: 'Карта', icon: MapIcon },
  { key: 'research', label: 'Исследование', icon: Search },
];

export default function ProjectLabPage() {
  const [, setLocation] = useLocation();
  const chat = useLabChat();
  const store = useLabSessions();

  const [input, setInput] = useState('');
  const [flash, setFlash] = useState<Set<string>>(new Set());
  const [panelTab, setPanelTab] = useState<PanelTab>('build');
  const [mobileView, setMobileView] = useState<MobileView>('chat');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const feedRef = useRef<HTMLDivElement>(null);

  // ── Active-session-derived state ──────────────────────────────
  const active = store.active;
  const mode: LabMode = active?.mode ?? 'project';
  const modelId = active?.modelId ?? LAB_MODELS[0].id;
  const blocks: LabBlock[] = active?.blocks ?? [];
  const messages: ChatMessage[] = active?.messages ?? [];

  const filled = blocks.filter((b) => b.content.trim().length > 0).length;
  const progress = blocks.length ? Math.round((filled / blocks.length) * 100) : 0;
  const activeModel = LAB_MODELS.find((m) => m.id === modelId) || LAB_MODELS[0];

  // Markers for the map tab: derive from app data, fall back to curated set.
  const mapMarkers = useMemo<MapMarker[]>(() => {
    try {
      const all = getMapMarkersByType('object', 'project', 'subject');
      return all.length ? all : CURATED_MARKERS;
    } catch {
      return CURATED_MARKERS;
    }
  }, []);

  // auto-scroll chat to bottom on new message
  useEffect(() => {
    feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, chat.loading]);

  // ── Session mutations (write through the persistent store) ────
  const setModelId = (id: string) => store.updateActive({ modelId: id });

  const switchMode = (m: LabMode) => {
    if (!active || m === mode) return;
    store.updateActive({
      mode: m,
      blocks: freshBlocks(m),
      messages: [greeting(m)],
    });
    setFlash(new Set());
  };

  const setBlocks = (updater: (prev: LabBlock[]) => LabBlock[]) =>
    store.updateActive((s) => ({ blocks: updater(s.blocks) }));

  const setMessages = (updater: (prev: ChatMessage[]) => ChatMessage[]) =>
    store.updateActive((s) => ({ messages: updater(s.messages) }));

  const applyUpdates = (updates: { id: string; content: string }[]) => {
    if (!updates.length) return;
    setBlocks((prev) =>
      prev.map((b) => {
        const u = updates.find((x) => x.id === b.id);
        return u ? { ...b, content: u.content } : b;
      }),
    );
    const ids = new Set(updates.map((u) => u.id));
    setFlash(ids);
    setTimeout(() => setFlash(new Set()), 1600);
  };

  const doSend = async (text: string) => {
    const clean = text.trim();
    if (!clean || chat.loading || !active) return;
    const userMsg: ChatMessage = { role: 'user', content: clean };
    const history = messages;
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    const resp = await chat.send({ model: modelId, mode, userText: clean, messages: history, blocks });
    if (!resp) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '⚠️ Сетевая ошибка. Попробуйте ещё раз.' },
      ]);
      return;
    }
    if (!resp.ok) {
      const msg =
        resp.error_code === 'NO_KEYS'
          ? 'Ключи ИИ-моделей ещё не настроены на сервере. Конструктор доступен для ручного заполнения.'
          : `Ошибка: ${resp.error ?? 'неизвестно'}`;
      setMessages((prev) => [...prev, { role: 'assistant', content: msg }]);
      return;
    }
    applyUpdates(resp.block_updates);
    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: resp.reply, patched: resp.block_updates.map((u) => u.id) },
    ]);
  };

  const editBlock = (id: string, content: string) =>
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, content } : b)));

  const resetAll = () => {
    if (!active) return;
    store.updateActive({ blocks: freshBlocks(mode), messages: [greeting(mode)] });
    setFlash(new Set());
  };

  const exportJson = () => {
    const doc = {
      mode,
      model: activeModel.name,
      blocks: blocks.map((b) => ({ title: b.title, content: b.content })),
      generated_at: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lab-${mode}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handoff to Genesis with the concept block prefilled.
  const toGenesis = () => {
    const concept = blocks.find((b) => b.id === 'concept')?.content || '';
    try {
      sessionStorage.setItem('lab-handoff', JSON.stringify({ mode, concept, blocks }));
    } catch {
      /* ignore */
    }
    setLocation('/genesis');
  };

  const insertToChat = (name: string) =>
    setInput((prev) => (prev.trim() ? `${prev} ${name}` : name));

  const blockTitle = useMemo(
    () => (mode === 'product' ? 'Конструктор продукта' : 'Конструктор проекта'),
    [mode],
  );

  if (!active) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/40">
        <Loader2 className="w-6 h-6 animate-spin mr-2" style={{ color: ACCENT }} /> Загрузка лаборатории…
      </div>
    );
  }

  // ── Reusable pane renderers ───────────────────────────────────
  const SessionsPane = (
    <SessionSidebar
      sessions={store.sessions}
      activeId={store.activeId}
      onSelect={store.selectSession}
      onCreate={() => store.createSession(mode)}
      onRename={store.renameSession}
      onDelete={store.deleteSession}
    />
  );

  const ChatPane = (
    <div className="flex flex-col h-full">
      {/* Model selector */}
      <div className="p-3 border-b border-white/5">
        <div className="text-[10px] uppercase tracking-wide text-white/40 mb-2 px-1">ИИ / LLM модель</div>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 custom-scrollbar" style={{ scrollbarWidth: 'thin' }}>
          {LAB_MODELS.map((m) => {
            const activeM = modelId === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setModelId(m.id)}
                title={m.tagline}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0"
                style={{
                  background: activeM ? `${m.color}1f` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${activeM ? m.color + '66' : 'rgba(255,255,255,0.08)'}`,
                  color: activeM ? '#fff' : 'rgba(255,255,255,0.55)',
                }}
              >
                <Icon name={m.icon} className="w-3.5 h-3.5" style={{ color: m.color }} />
                {m.name}
                <span className="text-[9px] px-1 py-px rounded uppercase" style={{ background: `${m.color}22`, color: m.color }}>
                  {m.tier === 'deep' ? 'PRO' : 'FAST'}
                </span>
              </button>
            );
          })}
        </div>
        <div className="text-[11px] text-white/35 mt-1.5 px-1">{activeModel.tagline}</div>
      </div>

      {/* Message feed */}
      <div ref={feedRef} className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className="max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap"
              style={
                m.role === 'user'
                  ? { background: `linear-gradient(135deg, ${ACCENT}22, ${ACCENT2}14)`, border: `1px solid ${ACCENT}33`, color: '#fff' }
                  : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.85)' }
              }
            >
              {m.content}
              {m.patched && m.patched.length > 0 && (
                <div className="flex flex-wrap items-center gap-1 mt-2 pt-2 border-t border-white/10">
                  <Check className="w-3 h-3" style={{ color: ACCENT }} />
                  <span className="text-[10px] text-white/45">Обновлено:</span>
                  {m.patched.map((pid) => {
                    const blk = blocks.find((b) => b.id === pid);
                    return (
                      <span key={pid} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: `${ACCENT}18`, color: ACCENT }}>
                        {blk?.title ?? pid}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        ))}
        {chat.loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl px-3.5 py-3 flex items-center gap-2" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Loader2 className="w-4 h-4 animate-spin" style={{ color: ACCENT }} />
              <span className="text-xs text-white/50">{activeModel.name} думает…</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick prompts (only before user has chatted much) */}
      {messages.length <= 1 && (
        <div className="px-3 pb-2 flex flex-wrap gap-1.5">
          {QUICK_PROMPTS[mode].map((q) => (
            <button
              key={q}
              onClick={() => doSend(q)}
              className="text-left text-[11px] px-2.5 py-1.5 rounded-lg text-white/60 hover:text-white transition-colors cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-white/5">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                doSend(input);
              }
            }}
            placeholder={`Сообщение для ${activeModel.name}…`}
            rows={1}
            className="flex-1 max-h-32 px-3 py-2.5 rounded-xl bg-black/30 text-white text-[13px] outline-none border border-white/10 focus:border-cyan-400/50 transition resize-none"
          />
          <button
            onClick={() => doSend(input)}
            disabled={!input.trim() || chat.loading}
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition disabled:opacity-40 cursor-pointer"
            style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`, color: '#000' }}
            aria-label="Отправить"
          >
            {chat.loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );

  const ConstructorTab = (
    <div className="flex flex-col h-full">
      {/* Progress + actions */}
      <div className="flex items-center gap-3 px-3 pt-3 pb-2 border-b border-white/5">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-white/60 uppercase tracking-wide">{blockTitle}</span>
            <span className="text-xs font-bold" style={{ color: ACCENT }}>{filled}/{blocks.length} · {progress}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT2})` }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
        <button
          onClick={resetAll}
          title="Сбросить"
          className="w-9 h-9 rounded-lg flex items-center justify-center text-white/50 hover:text-white transition-colors cursor-pointer"
          style={{ border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
        <div className="grid sm:grid-cols-2 gap-3">
          {blocks.map((b, i) => {
            const isFlash = flash.has(b.id);
            const hasContent = b.content.trim().length > 0;
            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-2xl p-4 flex flex-col"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${isFlash ? ACCENT + '99' : hasContent ? 'rgba(0,230,200,0.22)' : 'rgba(255,255,255,0.08)'}`,
                  boxShadow: isFlash ? `0 0 0 1px ${ACCENT}55, 0 0 24px ${ACCENT}30` : 'none',
                  transition: 'border-color .3s, box-shadow .3s',
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${ACCENT}14`, border: `1px solid ${ACCENT}2e` }}>
                    <Icon name={b.icon} className="w-3.5 h-3.5" style={{ color: ACCENT }} />
                  </div>
                  <span className="text-sm font-semibold text-white flex-1 min-w-0 truncate">{b.title}</span>
                  <AnimatePresence>
                    {isFlash && (
                      <motion.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                        style={{ background: `${ACCENT}22`, color: ACCENT }}
                      >
                        <Wand2 className="w-2.5 h-2.5" /> ИИ
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <textarea
                  value={b.content}
                  onChange={(e) => editBlock(b.id, e.target.value)}
                  placeholder={b.hint}
                  rows={5}
                  className="w-full flex-1 bg-transparent text-[13px] leading-relaxed text-white/80 placeholder:text-white/25 outline-none resize-none"
                />
              </motion.div>
            );
          })}
        </div>

        {/* Canvas footer actions */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <button
            onClick={toGenesis}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition disabled:opacity-40 cursor-pointer"
            style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`, color: '#000' }}
          >
            <Sparkles className="w-4 h-4" /> Собрать в Genesis
          </button>
          <button
            onClick={exportJson}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:bg-white/5 transition-colors cursor-pointer"
            style={{ border: '1px solid rgba(255,255,255,0.12)' }}
          >
            <Download className="w-4 h-4" /> Экспорт JSON
          </button>
        </div>
      </div>
    </div>
  );

  const PanelInner = (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex items-center gap-1 p-1.5 border-b border-white/5 overflow-x-auto custom-scrollbar">
        {PANEL_TABS.map((t) => {
          const activeT = panelTab === t.key;
          const TIcon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setPanelTab(t.key)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0"
              style={{
                background: activeT ? `${ACCENT}1f` : 'transparent',
                color: activeT ? '#fff' : 'rgba(255,255,255,0.5)',
                border: `1px solid ${activeT ? ACCENT + '55' : 'transparent'}`,
              }}
            >
              <TIcon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab body */}
      <div className="flex-1 min-h-0">
        {panelTab === 'build' && ConstructorTab}
        {panelTab === 'preview' && (
          <PreviewDoc blocks={blocks} mode={mode} modelName={activeModel.name} onExport={exportJson} />
        )}
        {panelTab === 'map' && (
          <div className="h-full flex flex-col">
            <div className="px-3 py-2 border-b border-white/5 flex items-center gap-2">
              <MapIcon className="w-4 h-4 text-white/40" />
              <span className="text-xs text-white/50">Регионы и объекты Центральной Азии · {mapMarkers.length} маркеров</span>
            </div>
            <div className="flex-1 min-h-0">
              {/* mounted only when the tab is active (map is heavy) */}
              <WaterMap
                center={CENTER}
                zoom={ZOOM}
                markers={mapMarkers}
                height="100%"
                interactive
                cluster
                layers={['rivers', 'lakes', 'glaciers', 'borders', 'cities']}
              />
            </div>
          </div>
        )}
        {panelTab === 'research' && <ResearchPanel onInsert={insertToChat} />}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-6 lab-page">
      {/* ── Top toolbar ── */}
      <div className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 opacity-40" style={{ background: `radial-gradient(60% 120% at 50% 0%, ${ACCENT}22, transparent 70%)` }} />
        <div className="relative max-w-[1600px] mx-auto px-4 sm:px-5 pt-5 pb-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="hidden lg:flex w-9 h-9 rounded-lg items-center justify-center text-white/50 hover:text-white transition-colors cursor-pointer"
              style={{ border: '1px solid rgba(255,255,255,0.1)' }}
              title={sidebarOpen ? 'Скрыть сессии' : 'Показать сессии'}
            >
              <PanelLeft className="w-4 h-4" />
            </button>
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg, ${ACCENT}33, ${ACCENT2}18)`, border: `1px solid ${ACCENT}40` }}>
              <FlaskConical className="w-5 h-5" style={{ color: ACCENT }} />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-white leading-tight flex items-center gap-2">
                Лаборатория разработки
                <span className="hidden sm:inline text-[11px] font-medium text-white/40 truncate">/ {active.name}</span>
              </h1>
              <p className="text-[11px] sm:text-xs text-white/40 flex items-center gap-1.5">
                <CpuIcon className="w-3 h-3" /> {activeModel.name} · IDE для проектов и продуктов
              </p>
            </div>

            {/* Mode toggle */}
            <div className="ml-auto flex items-center gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {(['project', 'product'] as const).map((m) => {
                const activeMode = mode === m;
                return (
                  <button
                    key={m}
                    onClick={() => switchMode(m)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    style={{
                      background: activeMode ? `${ACCENT}1f` : 'transparent',
                      color: activeMode ? '#fff' : 'rgba(255,255,255,0.5)',
                      border: `1px solid ${activeMode ? ACCENT + '55' : 'transparent'}`,
                    }}
                  >
                    {m === 'project' ? <Building2 className="w-3.5 h-3.5" /> : <Package className="w-3.5 h-3.5" />}
                    {m === 'project' ? 'Проект' : 'Продукт'}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile view switcher ── */}
      <div className="lg:hidden max-w-[1600px] mx-auto px-4 mt-3">
        <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {([['sessions', 'Сессии', PanelLeft], ['chat', 'Чат', Send], ['panel', 'Панель', LayoutGrid]] as const).map(([v, label, IconC]) => {
            const activeV = mobileView === v;
            return (
              <button
                key={v}
                onClick={() => setMobileView(v)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                style={{ background: activeV ? `${ACCENT}1f` : 'transparent', color: activeV ? '#fff' : 'rgba(255,255,255,0.5)' }}
              >
                <IconC className="w-3.5 h-3.5" />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Desktop 3-pane IDE grid ── */}
      <div
        className="hidden lg:grid max-w-[1600px] mx-auto px-4 sm:px-5 mt-4 gap-4"
        style={{
          gridTemplateColumns: sidebarOpen ? '260px minmax(360px, 1fr) minmax(420px, 1.15fr)' : 'minmax(360px, 1fr) minmax(420px, 1.15fr)',
          height: 'calc(100vh - 150px)',
        }}
      >
        {sidebarOpen && (
          <aside className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {SessionsPane}
          </aside>
        )}
        <section className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,230,200,0.15)' }}>
          {ChatPane}
        </section>
        <section className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {PanelInner}
        </section>
      </div>

      {/* ── Mobile single-pane ── */}
      <div className="lg:hidden max-w-[1600px] mx-auto px-4 mt-4">
        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', height: 'calc(100vh - 210px)', minHeight: 460 }}>
          {mobileView === 'sessions' && SessionsPane}
          {mobileView === 'chat' && ChatPane}
          {mobileView === 'panel' && PanelInner}
        </div>
      </div>
    </div>
  );
}

// Local helper mirrored from labTypes templates (fresh copy of blocks).
function freshBlocks(mode: LabMode): LabBlock[] {
  return LAB_TEMPLATES[mode].map((b) => ({ ...b }));
}
