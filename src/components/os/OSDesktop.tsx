import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw, FolderOpen as FolderIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────
export interface OSModule {
  Icon: LucideIcon;
  label: string;
  path: string;
  color: string;
}

// A desktop item is either a single app tile or a folder of tiles.
interface AppItem {
  kind: 'app';
  id: string;        // === module path
  x: number;
  y: number;
}
interface FolderItem {
  kind: 'folder';
  id: string;        // 'folder-<n>'
  name: string;
  apps: string[];    // module paths inside
  x: number;
  y: number;
}
type DesktopItem = AppItem | FolderItem;

interface Layout {
  items: DesktopItem[];
}

const STORAGE_KEY = 'arkheosium-os-layout-v1';
const TILE = 78;          // approx tile footprint (px) used for hit-testing
const GROUP_RADIUS = 46;  // drop-to-group distance threshold (px)

// ── Default scatter: frame the globe, leave centre clear ───────
function defaultLayout(modules: readonly OSModule[]): Layout {
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1280;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  const marginX = 20;
  const topBand = 150;                 // below the clock/status
  const bottomBand = vh - 110;         // above controls
  const colW = 96;
  const rowH = 92;

  // Two vertical columns hugging left & right edges frame the globe.
  const leftX = marginX;
  const rightX = vw - marginX - 66;
  const usableH = bottomBand - topBand;
  const perCol = Math.max(1, Math.floor(usableH / rowH));

  const items: DesktopItem[] = modules.map((m, i) => {
    const side = i % 2;                // alternate L / R so centre stays open
    const idx = Math.floor(i / 2);
    const col = Math.floor(idx / perCol);
    const row = idx % perCol;
    const baseX = side === 0 ? leftX + col * colW : rightX - col * colW;
    const x = Math.max(marginX, Math.min(vw - marginX - 66, baseX));
    const y = topBand + row * rowH;
    return { kind: 'app', id: m.path, x, y };
  });
  return { items };
}

function loadLayout(modules: readonly OSModule[]): Layout {
  if (typeof window === 'undefined') return defaultLayout(modules);
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultLayout(modules);
    const parsed = JSON.parse(raw) as Layout;
    if (!parsed?.items?.length) return defaultLayout(modules);

    // Reconcile with current module set: drop unknown paths, add missing apps.
    const known = new Set(modules.map((m) => m.path));
    const placed = new Set<string>();
    const items: DesktopItem[] = [];
    for (const it of parsed.items) {
      if (it.kind === 'folder') {
        const apps = it.apps.filter((p) => known.has(p));
        apps.forEach((p) => placed.add(p));
        if (apps.length >= 2) items.push({ ...it, apps });
        else if (apps.length === 1) {
          // collapsed folder → back to a loose tile
          placed.add(apps[0]);
          items.push({ kind: 'app', id: apps[0], x: it.x, y: it.y });
        }
      } else if (it.kind === 'app' && known.has(it.id)) {
        placed.add(it.id);
        items.push(it);
      }
    }
    // Append any brand-new modules not present in the saved layout.
    const def = defaultLayout(modules);
    for (const m of modules) {
      if (!placed.has(m.path)) {
        const d = def.items.find((di) => di.kind === 'app' && di.id === m.path) as AppItem | undefined;
        items.push({ kind: 'app', id: m.path, x: d?.x ?? 40, y: d?.y ?? 160 });
      }
    }
    return { items };
  } catch {
    return defaultLayout(modules);
  }
}

// ── Single app tile (glass chip) ───────────────────────────────
function clampToViewport(x: number, y: number) {
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1280;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  return {
    x: Math.max(8, Math.min(vw - TILE, x)),
    y: Math.max(64, Math.min(vh - TILE, y)),
  };
}

function AppTile({
  mod, item, index, dragConstraints, onNavigate, onDragEnd,
}: {
  mod: OSModule;
  item: AppItem;
  index: number;
  dragConstraints: React.RefObject<HTMLDivElement>;
  onNavigate: (path: string) => void;
  onDragEnd: (id: string, x: number, y: number) => void;
}) {
  return (
    <motion.div
      key={item.id}
      drag
      dragConstraints={dragConstraints}
      dragMomentum={false}
      dragElastic={0.12}
      initial={{ opacity: 0, scale: 0.75 }}
      animate={{ opacity: 1, scale: 1, x: item.x, y: item.y }}
      transition={{
        opacity: { delay: index * 0.02 },
        scale: { delay: index * 0.02, type: 'spring', stiffness: 320, damping: 22 },
        x: { type: 'spring', stiffness: 500, damping: 40 },
        y: { type: 'spring', stiffness: 500, damping: 40 },
      }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      whileDrag={{ scale: 1.14, zIndex: 60, cursor: 'grabbing' }}
      onDragEnd={(_, info) => {
        const nx = item.x + info.offset.x;
        const ny = item.y + info.offset.y;
        onDragEnd(item.id, nx, ny);
      }}
      onClick={() => onNavigate(mod.path)}
      className="absolute left-0 top-0 flex flex-col items-center gap-1 p-1.5 rounded-xl group cursor-grab pointer-events-auto"
      style={{ width: 66, touchAction: 'none' }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-150 group-hover:shadow-lg"
        style={{
          background: `linear-gradient(145deg, ${mod.color}26, ${mod.color}0d)`,
          border: `1px solid ${mod.color}33`,
          boxShadow: `0 6px 20px rgba(0,0,0,0.4), 0 0 0 rgba(0,0,0,0)`,
        }}
      >
        <mod.Icon size={19} style={{ color: mod.color }} />
      </div>
      <span className="text-[9px] text-white/40 font-medium text-center leading-none tracking-tight group-hover:text-white/75 transition-colors max-w-[64px] truncate">
        {mod.label}
      </span>
    </motion.div>
  );
}

// ── Folder tile (2x2 mini-preview) ─────────────────────────────
function FolderTile({
  item, index, moduleMap, dragConstraints, onOpen, onDragEnd,
}: {
  item: FolderItem;
  index: number;
  moduleMap: Map<string, OSModule>;
  dragConstraints: React.RefObject<HTMLDivElement>;
  onOpen: (id: string) => void;
  onDragEnd: (id: string, x: number, y: number) => void;
}) {
  const preview = item.apps.slice(0, 4).map((p) => moduleMap.get(p)).filter(Boolean) as OSModule[];
  return (
    <motion.div
      key={item.id}
      drag
      dragConstraints={dragConstraints}
      dragMomentum={false}
      dragElastic={0.12}
      initial={{ opacity: 0, scale: 0.75 }}
      animate={{ opacity: 1, scale: 1, x: item.x, y: item.y }}
      transition={{
        opacity: { delay: index * 0.02 },
        scale: { delay: index * 0.02, type: 'spring', stiffness: 320, damping: 22 },
        x: { type: 'spring', stiffness: 500, damping: 40 },
        y: { type: 'spring', stiffness: 500, damping: 40 },
      }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      whileDrag={{ scale: 1.14, zIndex: 60, cursor: 'grabbing' }}
      onDragEnd={(_, info) => {
        const nx = item.x + info.offset.x;
        const ny = item.y + info.offset.y;
        onDragEnd(item.id, nx, ny);
      }}
      onClick={() => onOpen(item.id)}
      className="absolute left-0 top-0 flex flex-col items-center gap-1 p-1.5 rounded-xl group cursor-grab pointer-events-auto"
      style={{ width: 66, touchAction: 'none' }}
    >
      <div
        className="w-11 h-11 rounded-xl grid grid-cols-2 grid-rows-2 gap-[3px] p-[5px] transition-all duration-150 group-hover:shadow-lg"
        style={{
          background: 'rgba(8,18,34,0.72)',
          border: '1px solid rgba(0,200,230,0.22)',
          backdropFilter: 'blur(14px)',
          boxShadow: '0 6px 20px rgba(0,0,0,0.45)',
        }}
      >
        {Array.from({ length: 4 }).map((_, i) => {
          const m = preview[i];
          return (
            <div
              key={i}
              className="rounded-[4px] flex items-center justify-center"
              style={{ background: m ? `${m.color}22` : 'rgba(255,255,255,0.04)' }}
            >
              {m ? <m.Icon size={9} style={{ color: m.color }} /> : null}
            </div>
          );
        })}
      </div>
      <span className="text-[9px] text-white/50 font-medium text-center leading-none tracking-tight group-hover:text-white/80 transition-colors max-w-[64px] truncate">
        {item.name}
      </span>
    </motion.div>
  );
}

// ── Main desktop ───────────────────────────────────────────────
export default function OSDesktop({
  modules, onNavigate,
}: {
  modules: readonly OSModule[];
  onNavigate: (path: string) => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<Layout>(() => loadLayout(modules));
  const [openFolder, setOpenFolder] = useState<string | null>(null);
  const layoutRef = useRef(layout);
  layoutRef.current = layout;

  const moduleMap = useMemo(() => {
    const m = new Map<string, OSModule>();
    for (const mod of modules) m.set(mod.path, mod);
    return m;
  }, [modules]);

  // Persist on any layout change.
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
    } catch { /* storage may be unavailable */ }
  }, [layout]);

  const folderSeq = useRef(1);
  useEffect(() => {
    // seed folder counter above any existing folder ids
    let max = 0;
    for (const it of layout.items) {
      if (it.kind === 'folder') {
        const n = parseInt(it.id.replace('folder-', ''), 10);
        if (!Number.isNaN(n)) max = Math.max(max, n);
      }
    }
    folderSeq.current = max + 1;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Resolve where a tile was dropped: onto another item (→ group) or free.
  const handleDragEnd = useCallback((draggedId: string, rawX: number, rawY: number) => {
    const { x, y } = clampToViewport(rawX, rawY);
    setLayout((prev) => {
      const items = prev.items;
      const dragged = items.find((it) => it.id === draggedId);
      if (!dragged) return prev;

      // find a drop target (nearest other item within GROUP_RADIUS by centre)
      const cx = x + TILE / 2;
      const cy = y + TILE / 2;
      let target: DesktopItem | null = null;
      let best = GROUP_RADIUS;
      for (const it of items) {
        if (it.id === draggedId) continue;
        const tcx = it.x + TILE / 2;
        const tcy = it.y + TILE / 2;
        const d = Math.hypot(tcx - cx, tcy - cy);
        if (d < best) { best = d; target = it; }
      }

      // Only apps can be dropped INTO things. Folders just reposition.
      if (target && dragged.kind === 'app') {
        if (target.kind === 'app') {
          // create a new folder containing both apps
          const fid = `folder-${folderSeq.current++}`;
          const folder: FolderItem = {
            kind: 'folder',
            id: fid,
            name: 'Папка',
            apps: [target.id, dragged.id],
            x: target.x,
            y: target.y,
          };
          const next = items.filter((it) => it.id !== draggedId && it.id !== target!.id);
          next.push(folder);
          return { items: next };
        }
        if (target.kind === 'folder') {
          // add app into existing folder
          const next = items
            .filter((it) => it.id !== draggedId)
            .map((it) =>
              it.id === target!.id && it.kind === 'folder'
                ? { ...it, apps: it.apps.includes(draggedId) ? it.apps : [...it.apps, draggedId] }
                : it,
            );
          return { items: next };
        }
      }

      // plain reposition
      const next = items.map((it) => (it.id === draggedId ? { ...it, x, y } : it));
      return { items: next };
    });
  }, []);

  // Remove an app from a folder → drop it back on the desktop near the folder.
  const ejectApp = useCallback((folderId: string, appPath: string) => {
    setLayout((prev) => {
      const folder = prev.items.find((it) => it.id === folderId) as FolderItem | undefined;
      if (!folder || folder.kind !== 'folder') return prev;
      const remaining = folder.apps.filter((p) => p !== appPath);
      const spot = clampToViewport(folder.x + 84, folder.y);
      const loose: AppItem = { kind: 'app', id: appPath, x: spot.x, y: spot.y };

      let next: DesktopItem[];
      if (remaining.length >= 2) {
        next = prev.items.map((it) =>
          it.id === folderId && it.kind === 'folder' ? { ...it, apps: remaining } : it,
        );
        next.push(loose);
      } else {
        // folder collapses: last remaining app becomes a loose tile too
        next = prev.items.filter((it) => it.id !== folderId);
        next.push(loose);
        if (remaining[0]) {
          next.push({ kind: 'app', id: remaining[0], x: folder.x, y: folder.y });
        }
        setOpenFolder(null);
      }
      return { items: next };
    });
  }, []);

  const resetLayout = useCallback(() => {
    try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
    setOpenFolder(null);
    setLayout(defaultLayout(modules));
  }, [modules]);

  const openFolderItem = openFolder
    ? (layout.items.find((it) => it.id === openFolder && it.kind === 'folder') as FolderItem | undefined)
    : undefined;

  return (
    <>
      {/* Freeform desktop layer — empty space stays click-through so the globe
          can still be dragged/rotated; only tiles capture pointer events. */}
      <div ref={overlayRef} className="absolute inset-0 pointer-events-none z-20">
        {layout.items.map((it, i) =>
          it.kind === 'app' ? (
            (() => {
              const mod = moduleMap.get(it.id);
              if (!mod) return null;
              return (
                <AppTile
                  key={it.id}
                  mod={mod}
                  item={it}
                  index={i}
                  dragConstraints={overlayRef}
                  onNavigate={onNavigate}
                  onDragEnd={handleDragEnd}
                />
              );
            })()
          ) : (
            <FolderTile
              key={it.id}
              item={it}
              index={i}
              moduleMap={moduleMap}
              dragConstraints={overlayRef}
              onOpen={setOpenFolder}
              onDragEnd={handleDragEnd}
            />
          ),
        )}
      </div>

      {/* Reset-layout affordance (sits with the other bottom controls) */}
      <button
        onClick={resetLayout}
        className="absolute z-30 bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full pointer-events-auto transition-all active:scale-95"
        style={{
          background: 'rgba(5,13,26,0.8)',
          border: '1px solid rgba(0,200,230,0.14)',
          color: 'rgba(255,255,255,0.5)',
          backdropFilter: 'blur(20px)',
        }}
        title="Сбросить раскладку рабочего стола"
      >
        <RotateCcw size={13} />
        <span className="text-[11px] font-semibold tracking-tight">Сбросить раскладку</span>
      </button>

      {/* Folder popover */}
      <AnimatePresence>
        {openFolderItem && (
          <motion.div
            key="folder-backdrop"
            className="absolute inset-0 z-40 flex items-center justify-center p-6 pointer-events-auto"
            style={{ background: 'rgba(1,6,14,0.45)', backdropFilter: 'blur(3px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpenFolder(null)}
          >
            <motion.div
              className="relative w-full max-w-xs rounded-2xl p-4"
              style={{
                background: 'rgba(6,15,28,0.96)',
                border: '1px solid rgba(0,200,230,0.22)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(0,200,230,0.12)',
              }}
              initial={{ scale: 0.9, y: 16, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: 12, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FolderIcon size={16} className="text-cyan-300/80" />
                  <span className="text-sm font-bold text-white/90">{openFolderItem.name}</span>
                </div>
                <button
                  onClick={() => setOpenFolder(null)}
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}
                >
                  <X size={14} />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {openFolderItem.apps.map((p) => {
                  const mod = moduleMap.get(p);
                  if (!mod) return null;
                  return (
                    <div key={p} className="relative group">
                      <button
                        onClick={() => { setOpenFolder(null); onNavigate(mod.path); }}
                        className="w-full flex flex-col items-center gap-1 p-2 rounded-xl transition-all hover:bg-white/5 active:scale-95 cursor-pointer"
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{
                            background: `linear-gradient(145deg, ${mod.color}26, ${mod.color}0d)`,
                            border: `1px solid ${mod.color}33`,
                          }}
                        >
                          <mod.Icon size={18} style={{ color: mod.color }} />
                        </div>
                        <span className="text-[9px] text-white/55 font-medium text-center leading-none truncate max-w-full">
                          {mod.label}
                        </span>
                      </button>
                      {/* eject app from folder */}
                      <button
                        onClick={(e) => { e.stopPropagation(); ejectApp(openFolderItem.id, p); }}
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        style={{ background: 'rgba(248,113,113,0.9)', color: '#0a0a0a' }}
                        title="Убрать из папки"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
