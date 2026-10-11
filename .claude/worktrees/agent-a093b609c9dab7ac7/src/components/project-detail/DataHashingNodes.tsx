// ═══════════════════════════════════════════════════════════════
//  DataHashingNodes — Animated data nodes & token emission diagram
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, Radio, Activity, Shield, Hash, Coins, CheckCircle, Wifi, Database, Zap } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface DataNode {
  id: string;
  label: string;
  type: "sensor" | "iot" | "field" | "validator" | "aggregator" | "consensus" | "emission";
  x: number;
  y: number;
  status: "idle" | "active" | "confirmed" | "emitting";
  icon: React.ElementType;
  color: string;
}

interface Particle {
  id: string;
  fromId: string;
  toId: string;
  progress: number;
  color: string;
}

// ─── Static node layout ──────────────────────────────────────────────────────

const NODES: DataNode[] = [
  // Data sources
  { id: "sensor1", label: "IoT Датчик 1", type: "sensor", x: 60, y: 120, status: "idle", icon: Radio, color: "#60a5fa" },
  { id: "sensor2", label: "IoT Датчик 2", type: "sensor", x: 60, y: 240, status: "idle", icon: Wifi, color: "#60a5fa" },
  { id: "sensor3", label: "IoT Датчик 3", type: "sensor", x: 60, y: 360, status: "idle", icon: Activity, color: "#60a5fa" },
  { id: "field1",  label: "Полевой отчёт", type: "field", x: 60, y: 480, status: "idle", icon: Database, color: "#a78bfa" },

  // Processing nodes
  { id: "proc1",  label: "Валидация A",   type: "validator",  x: 240, y: 180, status: "idle", icon: Shield, color: "#34d399" },
  { id: "proc2",  label: "Валидация B",   type: "validator",  x: 240, y: 300, status: "idle", icon: Shield, color: "#34d399" },
  { id: "proc3",  label: "Агрегация",     type: "aggregator", x: 240, y: 420, status: "idle", icon: Cpu,    color: "#fbbf24" },

  // Consensus layer
  { id: "cons1",  label: "Консенсус X",   type: "consensus",  x: 420, y: 220, status: "idle", icon: CheckCircle, color: "#00e6c8" },
  { id: "cons2",  label: "Консенсус Y",   type: "consensus",  x: 420, y: 380, status: "idle", icon: CheckCircle, color: "#00e6c8" },

  // Hash + Emission
  { id: "hash",   label: "SHA-256 Hash",  type: "validator",  x: 580, y: 300, status: "idle", icon: Hash,  color: "#f97316" },
  { id: "token",  label: "VOD Token",     type: "emission",   x: 740, y: 300, status: "idle", icon: Coins, color: "#fbbf24" },
];

const EDGES: [string, string][] = [
  ["sensor1", "proc1"], ["sensor2", "proc1"], ["sensor2", "proc2"],
  ["sensor3", "proc2"], ["sensor3", "proc3"], ["field1", "proc3"],
  ["proc1", "cons1"], ["proc2", "cons1"], ["proc2", "cons2"], ["proc3", "cons2"],
  ["cons1", "hash"], ["cons2", "hash"],
  ["hash", "token"],
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getNode(id: string): DataNode {
  return NODES.find(n => n.id === id)!;
}

function genHexChar(): string {
  return Math.floor(Math.random() * 16).toString(16).toUpperCase();
}

function genHex(len: number): string {
  return Array.from({ length: len }, genHexChar).join("");
}

// ─── SVG Edge Layer ───────────────────────────────────────────────────────────

function EdgeLayer({ nodes, activeEdges }: { nodes: DataNode[]; activeEdges: Set<string> }) {
  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: "visible" }}>
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {EDGES.map(([fromId, toId]) => {
        const from = nodeMap[fromId];
        const to = nodeMap[toId];
        if (!from || !to) return null;
        const key = `${fromId}-${toId}`;
        const active = activeEdges.has(key);
        const cx1 = from.x + 28 + (to.x - from.x) * 0.3;
        const cy1 = from.y + 28;
        const cx2 = to.x + 28 - (to.x - from.x) * 0.3;
        const cy2 = to.y + 28;
        return (
          <g key={key}>
            <path
              d={`M ${from.x + 28} ${from.y + 28} C ${cx1} ${cy1} ${cx2} ${cy2} ${to.x + 28} ${to.y + 28}`}
              fill="none"
              stroke={active ? "#00e6c8" : "rgba(255,255,255,0.07)"}
              strokeWidth={active ? 2 : 1}
              filter={active ? "url(#glow)" : undefined}
              style={{ transition: "stroke 0.3s, stroke-width 0.3s" }}
            />
            {active && (
              <circle r="4" fill="#00e6c8" filter="url(#glow)">
                <animateMotion
                  dur="1.2s"
                  repeatCount="indefinite"
                  path={`M ${from.x + 28} ${from.y + 28} C ${cx1} ${cy1} ${cx2} ${cy2} ${to.x + 28} ${to.y + 28}`}
                />
              </circle>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ─── Single Node ─────────────────────────────────────────────────────────────

function NodeCircle({ node, onClick }: { node: DataNode; onClick: (id: string) => void }) {
  const Icon = node.icon;
  const isEmitting = node.status === "emitting";
  const isActive = node.status === "active" || node.status === "confirmed";

  return (
    <motion.div
      className="absolute flex flex-col items-center cursor-pointer"
      style={{ left: node.x, top: node.y - 14, width: 56 }}
      onClick={() => onClick(node.id)}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Outer pulse ring when active */}
      {(isActive || isEmitting) && (
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 64, height: 64,
            top: -4, left: -4,
            border: `2px solid ${node.color}`,
            opacity: 0.4,
          }}
          animate={{ scale: [1, 1.6], opacity: [0.4, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
        />
      )}

      <motion.div
        className="w-14 h-14 rounded-2xl flex items-center justify-center relative overflow-hidden"
        style={{
          background: isEmitting
            ? `radial-gradient(circle, ${node.color}30, ${node.color}10)`
            : isActive
            ? `${node.color}20`
            : "rgba(0,8,24,0.9)",
          border: `2px solid ${isActive || isEmitting ? node.color : node.color + "30"}`,
          boxShadow: isActive || isEmitting ? `0 0 18px ${node.color}40` : "none",
          transition: "all 0.4s",
        }}
        animate={isEmitting ? { rotate: [0, 360] } : {}}
        transition={isEmitting ? { duration: 2, repeat: Infinity, ease: "linear" } : {}}
      >
        <Icon
          size={20}
          style={{
            color: isActive || isEmitting ? node.color : `${node.color}60`,
            transition: "color 0.4s",
          }}
        />
      </motion.div>

      <div className="text-center mt-1.5 px-1">
        <div className="text-white/70 text-[10px] font-semibold leading-tight text-center line-clamp-2">
          {node.label}
        </div>
        {node.status !== "idle" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold text-center"
            style={{
              background: `${node.color}18`,
              color: node.color,
              border: `1px solid ${node.color}30`,
            }}
          >
            {node.status === "active" ? "●" : node.status === "confirmed" ? "✓" : "⚡"}
            {" "}
            {node.status === "active" ? "Обработка" : node.status === "confirmed" ? "Подтверждён" : "Эмиссия"}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Hash Display ─────────────────────────────────────────────────────────────

function HashDisplay({ hash, visible }: { hash: string; visible: boolean }) {
  const [displayed, setDisplayed] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!visible) {
      setDisplayed("");
      return;
    }
    let i = 0;
    setDisplayed("");
    intervalRef.current = setInterval(() => {
      i++;
      setDisplayed(hash.slice(0, i));
      if (i >= hash.length) {
        clearInterval(intervalRef.current!);
      }
    }, 30);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [hash, visible]);

  if (!visible && !displayed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 rounded-xl p-4"
      style={{
        background: "rgba(249,115,22,0.06)",
        border: "1px solid rgba(249,115,22,0.2)",
        fontFamily: "'Courier New', monospace",
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Hash size={12} style={{ color: "#f97316" }} />
        <span className="text-xs font-bold" style={{ color: "#f97316" }}>SHA-256 Hash</span>
      </div>
      <div className="text-[11px] text-orange-300 break-all leading-relaxed">
        {displayed}
        {displayed.length < hash.length && (
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            style={{ color: "#f97316" }}
          >▌</motion.span>
        )}
      </div>
    </motion.div>
  );
}

// ─── Token Emission Burst ─────────────────────────────────────────────────────

function TokenEmissionBurst({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <AnimatePresence>
      <motion.div
        key="burst"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.2 }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ zIndex: 20 }}
      >
        <motion.div
          className="rounded-full flex items-center justify-center"
          style={{
            width: 120, height: 120,
            background: "radial-gradient(circle, rgba(251,191,36,0.35), transparent 70%)",
            border: "2px solid rgba(251,191,36,0.5)",
          }}
          animate={{ scale: [1, 2], opacity: [1, 0] }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        <motion.div
          className="absolute flex flex-col items-center"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1.2, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Coins size={36} style={{ color: "#fbbf24" }} />
          <motion.span
            className="text-white font-black text-lg mt-1"
            style={{ textShadow: "0 0 20px #fbbf24" }}
            animate={{ y: [-4, 4], opacity: [1, 0.8] }}
            transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
          >
            VOD MINTED
          </motion.span>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Status Log ───────────────────────────────────────────────────────────────

interface LogEntry {
  time: string;
  msg: string;
  color: string;
}

function StatusLog({ entries }: { entries: LogEntry[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [entries]);

  return (
    <div
      ref={ref}
      className="rounded-xl p-3 space-y-1 overflow-y-auto custom-scrollbar"
      style={{
        background: "rgba(0,4,14,0.9)",
        border: "1px solid rgba(255,255,255,0.07)",
        height: 140,
        fontFamily: "'Courier New', monospace",
      }}
    >
      {entries.map((e, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-[11px] flex gap-2"
        >
          <span className="text-white/25 shrink-0">{e.time}</span>
          <span style={{ color: e.color }}>{e.msg}</span>
        </motion.div>
      ))}
      {entries.length === 0 && (
        <div className="text-white/20 text-xs italic">Ожидание данных...</div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface DataHashingNodesProps {
  projectId: string;
  projectName?: string;
}

const SEQUENCE: { node: string; edge?: string; logMsg: string; logColor: string; delay: number }[] = [
  { node: "sensor1", logMsg: "→ [SENSOR-1] Данные о расходе воды получены: 142.3 м³/ч", logColor: "#60a5fa", delay: 600 },
  { node: "sensor2", logMsg: "→ [SENSOR-2] Давление: 3.2 bar | Темп: 18.4°C", logColor: "#60a5fa", delay: 1000 },
  { node: "sensor3", logMsg: "→ [SENSOR-3] pH уровень: 7.1 | Мутность: 0.8 NTU", logColor: "#60a5fa", delay: 1400 },
  { node: "field1",  logMsg: "→ [FIELD] Полевой отчёт загружен — оператор: Karimov A.", logColor: "#a78bfa", delay: 1800 },
  { node: "proc1",   edge: "sensor1-proc1", logMsg: "⚙ [VAL-A] Проверка диапазонов и сигнатур...", logColor: "#34d399", delay: 2400 },
  { node: "proc2",   edge: "sensor2-proc2", logMsg: "⚙ [VAL-B] Верификация дата-пакетов...", logColor: "#34d399", delay: 2800 },
  { node: "proc3",   edge: "sensor3-proc3", logMsg: "⚙ [AGG] Агрегация измерений...", logColor: "#fbbf24", delay: 3200 },
  { node: "cons1",   edge: "proc1-cons1", logMsg: "✓ [CONS-X] Консенсус достигнут (2/3 нод)", logColor: "#00e6c8", delay: 4000 },
  { node: "cons2",   edge: "proc2-cons2", logMsg: "✓ [CONS-Y] Консенсус подтверждён (3/3 нод)", logColor: "#00e6c8", delay: 4600 },
  { node: "hash",    edge: "cons1-hash", logMsg: "# [HASH] Генерация SHA-256 хэша блока...", logColor: "#f97316", delay: 5400 },
  { node: "token",   edge: "hash-token", logMsg: "💎 [EMIT] Порог консенсуса пройден → VOD TOKEN MINTED", logColor: "#fbbf24", delay: 7000 },
];

export default function DataHashingNodes({ projectId, projectName }: DataHashingNodesProps) {
  const [nodeStatuses, setNodeStatuses] = useState<Record<string, DataNode["status"]>>({});
  const [activeEdges, setActiveEdges] = useState<Set<string>>(new Set());
  const [log, setLog] = useState<LogEntry[]>([]);
  const [hashValue, setHashValue] = useState("");
  const [showHash, setShowHash] = useState(false);
  const [showEmission, setShowEmission] = useState(false);
  const [running, setRunning] = useState(false);
  const [confirmedCount, setConfirmedCount] = useState(0);
  const [totalTokens, setTotalTokens] = useState(0);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const addLog = useCallback((msg: string, color: string) => {
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
    setLog(prev => [...prev.slice(-30), { time, msg, color }]);
  }, []);

  const reset = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    setNodeStatuses({});
    setActiveEdges(new Set());
    setLog([]);
    setHashValue("");
    setShowHash(false);
    setShowEmission(false);
    setRunning(false);
  }, []);

  const runSequence = useCallback(() => {
    reset();
    setRunning(true);
    addLog("▶ Инициализация сбора данных...", "#60a5fa");

    SEQUENCE.forEach(step => {
      const t = setTimeout(() => {
        setNodeStatuses(prev => ({ ...prev, [step.node]: "active" }));
        if (step.edge) {
          setActiveEdges(prev => new Set(Array.from(prev).concat([step.edge!])));
        }
        addLog(step.logMsg, step.logColor);

        if (step.node === "cons1" || step.node === "cons2") {
          setConfirmedCount(prev => prev + 1);
          setTimeout(() => {
            setNodeStatuses(prev => ({ ...prev, [step.node]: "confirmed" }));
          }, 500);
        }

        if (step.node === "hash") {
          const newHash = "0x" + genHex(62);
          setHashValue(newHash);
          setTimeout(() => setShowHash(true), 300);
        }

        if (step.node === "token") {
          setNodeStatuses(prev => ({ ...prev, token: "emitting" }));
          setShowEmission(true);
          setTotalTokens(prev => prev + Math.floor(Math.random() * 50 + 100));
          addLog("✅ БЛОК ЗАФИКСИРОВАН — данные записаны в реестр", "#4ade80");
          setTimeout(() => {
            setShowEmission(false);
            setRunning(false);
          }, 3000);
        }
      }, step.delay);

      timeoutsRef.current.push(t);
    });
  }, [reset, addLog]);

  useEffect(() => () => timeoutsRef.current.forEach(clearTimeout), []);

  const nodesWithStatus: DataNode[] = NODES.map(n => ({
    ...n,
    status: nodeStatuses[n.id] ?? "idle",
  }));

  return (
    <div className="space-y-6">
      {/* Header panel */}
      <div className="rounded-2xl p-5" style={{ background: "rgba(0,6,20,0.95)", border: "1px solid rgba(0,230,200,0.15)" }}>
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div>
            <h2 className="text-white font-black text-lg flex items-center gap-2">
              <Zap size={18} style={{ color: "#00e6c8" }} />
              Узлы сбора данных и хэширование
            </h2>
            <p className="text-white/40 text-xs mt-0.5">
              Децентрализованная верификация → консенсус → эмиссия токена
            </p>
          </div>
          <div className="flex gap-3 items-center">
            <div className="flex gap-4 text-xs">
              <div className="text-center">
                <div className="font-black text-lg text-emerald-400">{confirmedCount}</div>
                <div className="text-white/30">Консенсусов</div>
              </div>
              <div className="text-center">
                <div className="font-black text-lg text-amber-400">{totalTokens}</div>
                <div className="text-white/30">VOD заминчено</div>
              </div>
            </div>
            <button
              onClick={running ? reset : runSequence}
              className="px-4 py-2 rounded-xl font-bold text-sm cursor-pointer transition-all"
              style={{
                background: running
                  ? "rgba(248,113,113,0.15)"
                  : "linear-gradient(135deg, rgba(0,230,200,0.2), rgba(96,165,250,0.15))",
                color: running ? "#f87171" : "#00e6c8",
                border: `1px solid ${running ? "rgba(248,113,113,0.3)" : "rgba(0,230,200,0.3)"}`,
              }}
            >
              {running ? "Стоп" : "▶ Запустить симуляцию"}
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 text-xs text-white/40">
          {[
            { color: "#60a5fa", label: "Источники данных" },
            { color: "#34d399", label: "Валидаторы" },
            { color: "#00e6c8", label: "Консенсус" },
            { color: "#f97316", label: "Хэш-генерация" },
            { color: "#fbbf24", label: "Эмиссия токена" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Node diagram */}
      <div
        className="rounded-2xl overflow-hidden relative"
        style={{
          background: "rgba(0,4,14,0.97)",
          border: "1px solid rgba(0,230,200,0.1)",
          minHeight: 560,
        }}
      >
        {/* Column labels */}
        {[
          { label: "Источники", x: 36, color: "#60a5fa" },
          { label: "Обработка", x: 216, color: "#34d399" },
          { label: "Консенсус", x: 396, color: "#00e6c8" },
          { label: "Хэш", x: 556, color: "#f97316" },
          { label: "Токен", x: 716, color: "#fbbf24" },
        ].map(col => (
          <div
            key={col.label}
            className="absolute top-3 text-[10px] font-bold uppercase tracking-widest"
            style={{ left: col.x, color: col.color + "70" }}
          >
            {col.label}
          </div>
        ))}

        {/* Grid lines */}
        {[180, 360, 540, 720].map(x => (
          <div
            key={x}
            className="absolute top-0 bottom-0 w-px"
            style={{ left: x, background: "rgba(255,255,255,0.03)" }}
          />
        ))}

        <div className="relative" style={{ height: 560, width: "100%" }}>
          <EdgeLayer nodes={nodesWithStatus} activeEdges={activeEdges} />
          {nodesWithStatus.map(node => (
            <NodeCircle key={node.id} node={node} onClick={() => {}} />
          ))}
          <TokenEmissionBurst visible={showEmission} />
        </div>
      </div>

      {/* Hash display */}
      <HashDisplay hash={hashValue} visible={showHash} />

      {/* Status log */}
      <div className="rounded-2xl p-4" style={{ background: "rgba(0,4,14,0.95)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2 mb-2">
          <Activity size={12} style={{ color: "#00e6c8" }} />
          <span className="text-xs font-bold text-white/50 uppercase tracking-wider">Лог событий</span>
        </div>
        <StatusLog entries={log} />
      </div>

      {/* Info cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon: Shield,
            color: "#34d399",
            title: "Механизм валидации",
            desc: "Каждый пакет данных проходит криптографическую верификацию на 2 независимых узлах прежде чем попасть в консенсус-слой.",
          },
          {
            icon: Hash,
            color: "#f97316",
            title: "SHA-256 хэширование",
            desc: "Блок данных хэшируется с включением временной метки, ID источника и предыдущего хэша — формируя неизменяемую цепочку записей.",
          },
          {
            icon: Coins,
            color: "#fbbf24",
            title: "Эмиссия VOD токена",
            desc: "Токен минтится только когда N-из-M консенсус-нод подтвердили блок данных. Токены распределяются между стейкерами проекта.",
          },
        ].map(card => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="rounded-2xl p-4" style={{ background: `${card.color}06`, border: `1px solid ${card.color}18` }}>
              <div className="flex items-center gap-2 mb-2">
                <Icon size={14} style={{ color: card.color }} />
                <span className="text-xs font-bold" style={{ color: card.color }}>{card.title}</span>
              </div>
              <p className="text-white/45 text-xs leading-relaxed">{card.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
