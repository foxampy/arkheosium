import { Suspense, useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, OrbitControls, Sphere, useTexture, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Map as MapIcon, BarChart2, Droplets, Building2, FolderOpen,
  FlaskConical, ShoppingCart, Activity, Bell, TrendingUp,
  FileText, Newspaper, X, ArrowRight,
  Sparkles, Satellite, Radio, Waves, Cloud, Zap, Truck, Bot,
  Sprout, Recycle, Telescope,
} from 'lucide-react';
import { useSupabaseMarkers } from '@/hooks/useSupabaseMarkers';
import { getAllMapMarkers } from '@/data/map-markers';
import type { MapMarker } from '@/components/map/types';

// ── OS modules grid ────────────────────────────────────────────
const OS_MODULES = [
  { Icon: MapIcon,      label: 'Карта',       path: '/map',           color: '#00e6c8' },
  { Icon: BarChart2,    label: 'Аналитика',   path: '/analytics',     color: '#60a5fa' },
  { Icon: Droplets,     label: 'Объекты',     path: '/hub/objects',   color: '#00d4ff' },
  { Icon: Building2,    label: 'Субъекты',    path: '/hub/subjects',  color: '#fbbf24' },
  { Icon: FolderOpen,   label: 'Проекты',     path: '/hub',           color: '#4ade80' },
  { Icon: FlaskConical, label: 'R&D',         path: '/rd',            color: '#f59e0b' },
  { Icon: ShoppingCart, label: 'Тех.маркет',  path: '/tech-marketplace', color: '#a78bfa' },
  { Icon: Activity,     label: 'IoT',         path: '/iot',           color: '#34d399' },
  { Icon: Bell,         label: 'Алерты',      path: '/alerts',        color: '#f87171' },
  { Icon: TrendingUp,   label: 'Инвестиции',  path: '/invest',        color: '#fbbf24' },
  { Icon: FileText,     label: 'Документы',   path: '/documents',     color: '#00e6c8' },
  { Icon: Newspaper,    label: 'Обновления',  path: '/updates',       color: '#06b6d4' },
  // ── Ecosystem modules ──
  { Icon: Sparkles,     label: 'Genesis',     path: '/genesis',       color: '#a78bfa' },
  { Icon: Satellite,    label: 'Спутники',    path: '/satellite',     color: '#60a5fa' },
  { Icon: Radio,        label: 'Датчики',     path: '/sensors',       color: '#00e6c8' },
  { Icon: Waves,        label: 'Море',        path: '/water-recovery',color: '#00d4ff' },
  { Icon: Cloud,        label: 'Климат',      path: '/climate',       color: '#22d3ee' },
  { Icon: Zap,          label: 'Энергия',     path: '/energy',        color: '#fbbf24' },
  { Icon: Truck,        label: 'Транспорт',   path: '/transport',     color: '#00d4ff' },
  { Icon: Bot,          label: 'Роботы',      path: '/robotics',      color: '#b6ff2e' },
  { Icon: Sprout,       label: 'Агротех',     path: '/agritech',      color: '#84cc16' },
  { Icon: Building2,    label: 'Город',       path: '/city',          color: '#60a5fa' },
  { Icon: Recycle,      label: 'Циркуляр',    path: '/circular',      color: '#4ade80' },
  { Icon: Telescope,    label: 'Обсерватория',path: '/observatory',   color: '#818cf8' },
  { Icon: FlaskConical, label: 'Откр.наука',  path: '/open-science',  color: '#8b7cff' },
] as const;

// ── Marker type metadata ───────────────────────────────────────
type MetaKey = 'object' | 'subject' | 'project' | 'rd';
const TYPE_META: Record<MetaKey, { color: string; label: string; route: string }> = {
  object:  { color: '#00d4ff', label: 'Объект',  route: '/hub/object' },
  subject: { color: '#fbbf24', label: 'Субъект', route: '/hub/subject' },
  project: { color: '#4ade80', label: 'Проект',  route: '/hub/project' },
  rd:      { color: '#f59e0b', label: 'R&D',     route: '/rd' },
};
const DEFAULT_META = { color: '#a78bfa', label: 'Объект', route: '/hub' };
function metaFor(type: string) {
  return (TYPE_META as Record<string, typeof DEFAULT_META>)[type] ?? DEFAULT_META;
}

// ── Helpers ────────────────────────────────────────────────────
function latLngToVec3(lat: number, lng: number, r = 1.53): THREE.Vector3 {
  const phi   = (90 - lat)  * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
     r * Math.cos(phi),
     r * Math.sin(phi) * Math.sin(theta),
  );
}

// ── Single marker (glowing mesh dot) ───────────────────────────
function SingleMarker({
  marker, onHover, onSelect,
}: {
  marker: MapMarker;
  onHover: (h: boolean) => void;
  onSelect: (m: MapMarker) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const meta = metaFor(marker.type);
  const pos = useMemo(() => latLngToVec3(marker.lat, marker.lng), [marker.lat, marker.lng]);

  return (
    <mesh
      position={pos}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); onHover(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); onHover(false); document.body.style.cursor = 'auto'; }}
      onClick={(e) => { e.stopPropagation(); onSelect(marker); }}
    >
      <sphereGeometry args={[hovered ? 0.032 : 0.02, 14, 14]} />
      <meshStandardMaterial
        color={meta.color}
        emissive={meta.color}
        emissiveIntensity={hovered ? 3.0 : 1.7}
        toneMapped={false}
      />
    </mesh>
  );
}

// ── Cluster marker (mesh halo + HTML count badge) ──────────────
function ClusterMarker({
  lat, lng, count, color, onHover, onZoom,
}: {
  lat: number; lng: number; count: number; color: string;
  onHover: (h: boolean) => void;
  onZoom: (pos: THREE.Vector3) => void;
}) {
  const { camera } = useThree();
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(true);
  const visRef = useRef(true);
  const pos = useMemo(() => latLngToVec3(lat, lng), [lat, lng]);
  const normal = useMemo(() => pos.clone().normalize(), [pos]);
  const r = THREE.MathUtils.clamp(0.03 + Math.log10(count) * 0.02, 0.032, 0.08);

  // hide the HTML badge when the cluster is on the far side of the globe
  useFrame(() => {
    const camDir = camera.position.clone().normalize();
    const v = normal.dot(camDir) > -0.05;
    if (v !== visRef.current) { visRef.current = v; setVisible(v); }
  });

  return (
    <group position={pos}>
      <mesh
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); onHover(true); document.body.style.cursor = 'zoom-in'; }}
        onPointerOut={() => { setHovered(false); onHover(false); document.body.style.cursor = 'auto'; }}
        onClick={(e) => { e.stopPropagation(); onZoom(pos); }}
      >
        <sphereGeometry args={[r, 18, 18]} />
        <meshBasicMaterial color={color} transparent opacity={hovered ? 0.5 : 0.32} />
      </mesh>
      {visible && (
        <Html center distanceFactor={9} zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
          <div style={{
            minWidth: 20,
            padding: '2px 7px',
            borderRadius: 999,
            background: 'rgba(4,12,26,0.9)',
            border: `1.5px solid ${color}`,
            color: '#fff',
            fontSize: 12,
            fontWeight: 800,
            textAlign: 'center',
            boxShadow: `0 0 12px ${color}77`,
            whiteSpace: 'nowrap',
          }}>
            {count > 999 ? '999+' : count}
          </div>
        </Html>
      )}
    </group>
  );
}

// ── Real Earth Globe ───────────────────────────────────────────
function EarthMesh() {
  const earthTex = useTexture(
    'https://unpkg.com/three-globe@2.31.1/example/img/earth-night.jpg',
  );
  return (
    <Sphere args={[1.5, 64, 64]}>
      <meshStandardMaterial
        map={earthTex}
        emissiveMap={earthTex}
        emissive="#ffffff"
        emissiveIntensity={1.0}
        roughness={1.0}
        metalness={0.0}
      />
    </Sphere>
  );
}

// ── Scene (inside Canvas) ──────────────────────────────────────
interface FlyTarget { camPos: THREE.Vector3; }

function Scene({
  markers, onHover, onSelect, controlsRef,
}: {
  markers: MapMarker[];
  onHover: (h: boolean) => void;
  onSelect: (m: MapMarker) => void;
  controlsRef: React.MutableRefObject<any>;
}) {
  const { camera } = useThree();
  const [camDist, setCamDist] = useState(4.3);
  const flyRef = useRef<FlyTarget | null>(null);

  useFrame(() => {
    // quantized distance → drives clustering granularity
    const d = camera.position.length();
    const q = Math.round(d * 4) / 4;
    if (q !== camDist) setCamDist(q);

    // camera fly-to on cluster click
    if (flyRef.current) {
      const t = flyRef.current.camPos;
      camera.position.lerp(t, 0.09);
      if (controlsRef.current) controlsRef.current.target.lerp(new THREE.Vector3(0, 0, 0), 0.09);
      if (camera.position.distanceTo(t) < 0.04) flyRef.current = null;
    }
  });

  const handleZoom = (pos: THREE.Vector3) => {
    const newDist = Math.max(2.6, camDist * 0.55);
    flyRef.current = { camPos: pos.clone().normalize().multiplyScalar(newDist) };
  };

  // ── Zoom-based geographic clustering ──
  const clusters = useMemo(() => {
    const cellDeg = THREE.MathUtils.clamp((camDist - 2.4) * 5.5, 0.6, 40);
    const buckets = new Map<string, MapMarker[]>();
    for (const m of markers) {
      if (typeof m.lat !== 'number' || typeof m.lng !== 'number') continue;
      const key = Math.floor(m.lat / cellDeg) + ':' + Math.floor(m.lng / cellDeg);
      const arr = buckets.get(key);
      if (arr) arr.push(m);
      else buckets.set(key, [m]);
    }
    return Array.from(buckets.entries()).map(([key, items]) => {
      if (items.length === 1) {
        return { key, single: items[0] as MapMarker };
      }
      let lat = 0, lng = 0;
      for (const it of items) { lat += it.lat; lng += it.lng; }
      // dominant type colour
      const typeCount: Record<string, number> = {};
      for (const it of items) typeCount[it.type] = (typeCount[it.type] || 0) + 1;
      const domType = Object.entries(typeCount).sort((a, b) => b[1] - a[1])[0][0];
      return {
        key,
        cluster: {
          lat: lat / items.length,
          lng: lng / items.length,
          count: items.length,
          color: metaFor(domType).color,
        },
      };
    });
  }, [markers, camDist]);

  return (
    <>
      <ambientLight intensity={0.04} />
      <directionalLight position={[6, 4, 5]} intensity={0.25} color="#b8d8ff" />
      <pointLight position={[-4, 2, 3]} intensity={0.3} color="#00d4ff" distance={14} />
      <pointLight position={[3, -3, -4]} intensity={0.15} color="#7c3aed" distance={14} />

      <Stars radius={140} depth={60} count={8000} factor={4} saturation={0} fade speed={0.3} />

      {/* Earth (static in world space — camera orbits it) */}
      <Suspense fallback={
        <Sphere args={[1.5, 64, 64]}>
          <meshStandardMaterial color="#071428" roughness={0.9} metalness={0.0} />
        </Sphere>
      }>
        <EarthMesh />
      </Suspense>

      {/* Inner atmosphere */}
      <Sphere args={[1.56, 32, 32]}>
        <meshStandardMaterial color="#0077bb" transparent opacity={0.07} side={THREE.BackSide} />
      </Sphere>
      {/* Outer glow halo */}
      <Sphere args={[1.65, 32, 32]}>
        <meshStandardMaterial color="#001133" transparent opacity={0.14} side={THREE.BackSide} />
      </Sphere>

      {/* Data markers with zoom clustering */}
      {clusters.map((c) =>
        c.single ? (
          <SingleMarker key={c.key} marker={c.single} onHover={onHover} onSelect={onSelect} />
        ) : c.cluster ? (
          <ClusterMarker
            key={c.key}
            lat={c.cluster.lat}
            lng={c.cluster.lng}
            count={c.cluster.count}
            color={c.cluster.color}
            onHover={onHover}
            onZoom={handleZoom}
          />
        ) : null
      )}
    </>
  );
}

// ── Page ───────────────────────────────────────────────────────
export default function EarthGlobePage() {
  const [, setLocation] = useLocation();
  const [autoRotate, setAutoRotate] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [selected, setSelected] = useState<MapMarker | null>(null);
  const controlsRef = useRef<any>(null);

  const { markers: supabaseMarkers } = useSupabaseMarkers();

  // Feed the globe from the local aggregator (all objects/subjects/projects)
  // merged with Supabase rows. Deduped by `${type}:${id}` via a Set so the
  // same entity never renders twice. The globe's existing clustering
  // (see Scene) consumes this combined array unchanged.
  const markers: MapMarker[] = useMemo(() => {
    const seen = new Set<string>();
    const out: MapMarker[] = [];
    const push = (m: MapMarker) => {
      const key = `${m.type}:${m.id}`;
      if (seen.has(key)) return;
      seen.add(key);
      out.push(m);
    };
    getAllMapMarkers().forEach(push);
    supabaseMarkers.forEach(push);
    return out;
  }, [supabaseMarkers]);

  // Live clock
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const timeStr = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });

  // rotation stops on hover OR when a popup is open
  const effectiveRotate = autoRotate && !hovered && !selected;

  const openMarker = (m: MapMarker) => {
    const meta = metaFor(m.type);
    const rawId = String(m.id).split('-').pop();
    setSelected(null);
    setLocation(rawId ? `${meta.route}/${rawId}` : meta.route);
  };

  return (
    <div
      className="fixed inset-0"
      style={{ background: 'radial-gradient(ellipse at 50% 35%, #020d1e 0%, #010810 100%)' }}
    >
      {/* ── 3D Globe canvas ──────────────────────────────────── */}
      <Canvas
        camera={{ position: [0, 0.4, 4.3], fov: 42 }}
        style={{ width: '100%', height: '100%' }}
      >
        <Scene
          markers={markers}
          onHover={setHovered}
          onSelect={setSelected}
          controlsRef={controlsRef}
        />
        <OrbitControls
          ref={controlsRef}
          enableZoom
          enablePan={false}
          minDistance={2.4}
          maxDistance={9}
          autoRotate={effectiveRotate}
          autoRotateSpeed={0.28}
          dampingFactor={0.07}
          enableDamping
        />
      </Canvas>

      {/* ── OS Interface overlay ──────────────────────────────── */}
      <div
        className="absolute inset-0 flex flex-col pointer-events-none select-none"
        style={{ paddingTop: 56 }}
      >
        {/* Top bar: clock + status */}
        <div className="flex items-start justify-between px-5 pt-4">
          <div>
            <div
              className="text-4xl sm:text-5xl font-black text-white tabular-nums leading-none"
              style={{ textShadow: '0 0 30px rgba(0,212,255,0.4)' }}
            >
              {timeStr}
            </div>
            <div className="text-xs text-white/35 mt-1.5 capitalize tracking-wider">{dateStr}</div>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)' }}>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 6px #4ade80' }} />
              <span className="text-[10px] text-emerald-400/80 font-semibold">Система онлайн</span>
            </div>
            <span className="text-[10px] text-white/20">ARKHEOSIUM v3.0 · Prod</span>
          </div>
        </div>

        <div className="flex-1" />

        {/* Bottom: App dock ────────────────────────────── */}
        <div className="px-3 pb-safe-area-inset-bottom pb-5 pointer-events-auto">
          <div
            className="rounded-2xl px-3 py-2.5"
            style={{
              background: 'rgba(5,13,26,0.85)',
              border: '1px solid rgba(0,200,230,0.08)',
              backdropFilter: 'blur(28px)',
              boxShadow: '0 -6px 32px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.035)',
            }}
          >
            <div className="grid grid-cols-6 gap-1.5">
              {OS_MODULES.map((mod, i) => (
                <motion.button
                  key={mod.path}
                  initial={{ opacity: 0, scale: 0.75 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03, type: 'spring', stiffness: 320, damping: 22 }}
                  whileHover={{ scale: 1.08, y: -2 }}
                  whileTap={{ scale: 0.91 }}
                  onClick={() => setLocation(mod.path)}
                  className="flex flex-col items-center gap-1 py-1.5 rounded-xl group"
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 group-hover:shadow-lg"
                    style={{
                      background: `linear-gradient(145deg, ${mod.color}22, ${mod.color}0d)`,
                      border: `1px solid ${mod.color}28`,
                    }}
                  >
                    <mod.Icon size={16} style={{ color: mod.color }} />
                  </div>
                  <span className="text-[9px] text-white/40 font-medium text-center leading-none tracking-tight group-hover:text-white/70 transition-colors">
                    {mod.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Globe control hint */}
          <button
            onClick={() => setAutoRotate(r => !r)}
            className="mt-2.5 w-full text-center"
            style={{ color: 'rgba(255,255,255,0.15)', fontSize: 10 }}
          >
            {autoRotate ? '⏸ Остановить вращение' : '▶ Запустить вращение'} · Тяни глобус для поворота
          </button>
        </div>
      </div>

      {/* ── Marker popup card ─────────────────────────────────── */}
      <AnimatePresence>
        {selected && (() => {
          const meta = metaFor(selected.type);
          return (
            <motion.div
              key="marker-popup"
              className="absolute inset-0 z-30 flex items-center justify-center p-5"
              style={{ background: 'rgba(1,6,14,0.55)', backdropFilter: 'blur(4px)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
            >
              <motion.div
                className="relative w-full max-w-sm rounded-2xl overflow-hidden"
                style={{
                  background: 'rgba(6,15,28,0.96)',
                  border: `1px solid ${meta.color}33`,
                  boxShadow: `0 20px 60px rgba(0,0,0,0.6), 0 0 40px ${meta.color}18`,
                }}
                initial={{ scale: 0.9, y: 24, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.92, y: 16, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* colour header strip */}
                <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${meta.color}, ${meta.color}00)` }} />

                <button
                  onClick={() => setSelected(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}
                >
                  <X size={16} />
                </button>

                <div className="p-5">
                  <div
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-3"
                    style={{ background: `${meta.color}18`, border: `1px solid ${meta.color}40` }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: meta.color, boxShadow: `0 0 6px ${meta.color}` }} />
                    <span className="text-[11px] font-semibold" style={{ color: meta.color }}>{meta.label}</span>
                  </div>

                  <h3 className="text-lg font-bold text-white leading-snug mb-2">
                    {selected.title || 'Без названия'}
                  </h3>

                  {selected.description && (
                    <p className="text-sm text-white/50 leading-relaxed line-clamp-4 mb-4">
                      {selected.description}
                    </p>
                  )}

                  <div className="flex items-center gap-1.5 text-[11px] text-white/30 mb-4">
                    <span>{selected.lat.toFixed(3)}°, {selected.lng.toFixed(3)}°</span>
                  </div>

                  <button
                    onClick={() => openMarker(selected)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-transform active:scale-95"
                    style={{
                      background: `linear-gradient(135deg, ${meta.color}, ${meta.color}bb)`,
                      color: '#04121f',
                    }}
                  >
                    Открыть
                    <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
