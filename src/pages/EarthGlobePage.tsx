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
  Sprout, Recycle, Telescope, Network,
} from 'lucide-react';
import { useSupabaseMarkers } from '@/hooks/useSupabaseMarkers';
import { useSupabaseGraph } from '@/hooks/useSupabaseGraph';
import { getAllMapMarkers } from '@/data/map-markers';
import { DOMAIN_CONFIG, normalizeDomain } from '@/lib/domains';
import type { MapMarker } from '@/components/map/types';
import OSDesktop from '@/components/os/OSDesktop';
import { groupMarkersByRegion, type RegionGroup } from '@/lib/regionGrouping';

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
// Objects glow by resource domain; subjects/projects keep their type colour.
function markerColor(m: MapMarker): string {
  if (m.type === 'object') return DOMAIN_CONFIG[normalizeDomain(m.domain)].color;
  return metaFor(m.type).color;
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

// ── Knowledge-graph arc layer ──────────────────────────────────
// Builds glowing great-circle-ish arcs between related entities. Endpoints are
// projected with the SAME latLngToVec3 helper + radius (1.53) used by markers,
// so arcs share world space with the markers and orbit identically as the
// camera moves. Each arc's midpoint is pushed outward from the globe centre by
// a factor proportional to the angular separation of its endpoints, so long
// links bow higher above the surface.
const GLOBE_R = 1.53;
const ARC_CAP = 300; // keep draw calls bounded (dataset ~280–420 edges)

// Build THREE.Line objects imperatively and render via <primitive>. This
// sidesteps the react-three-fiber <line> JSX intrinsic (which clashes with the
// SVG `line` DOM type) and lets us own geometry/material disposal explicitly.
function GraphArcs({ edges }: { edges: GeoJSON.FeatureCollection }) {
  const objects = useMemo<THREE.Object3D[]>(() => {
    const out: THREE.Object3D[] = [];
    const feats = edges.features.slice(0, ARC_CAP);
    for (const f of feats) {
      if (!f.geometry || f.geometry.type !== 'LineString') continue;
      const coords = f.geometry.coordinates as [number, number][];
      if (coords.length < 2) continue;
      const [lngA, latA] = coords[0];
      const [lngB, latB] = coords[1];
      const a = latLngToVec3(latA, lngA, GLOBE_R);
      const b = latLngToVec3(latB, lngB, GLOBE_R);

      // angular separation (0..π) drives how far the arc bows outward
      const angle = a.angleTo(b);
      const lift = 1 + angle * 0.42; // 1.0 (adjacent) → up to ~2.3 (antipodal)
      const mid = a.clone().add(b).multiplyScalar(0.5).normalize().multiplyScalar(GLOBE_R * lift);

      const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
      const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(32));
      const color = (f.properties?.color as string) || '#00e6c8';

      // faint halo + bright core sharing one geometry
      const halo = new THREE.Line(
        geometry,
        new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.18, toneMapped: false }),
      );
      const core = new THREE.Line(
        geometry,
        new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.6, toneMapped: false }),
      );
      out.push(halo, core);
    }
    return out;
  }, [edges]);

  // dispose geometries + materials when the arc set is rebuilt or unmounts
  useEffect(() => {
    return () => {
      for (const o of objects) {
        const line = o as THREE.Line;
        line.geometry?.dispose();
        const mat = line.material;
        if (Array.isArray(mat)) mat.forEach(m => m.dispose());
        else mat?.dispose();
      }
    };
  }, [objects]);

  return (
    <group>
      {objects.map((o, i) => (
        <primitive key={i} object={o} />
      ))}
    </group>
  );
}

// Reference camera distance (matches initial camera position length).
// Markers scale ∝ distance-to-camera so their on-screen size stays constant
// regardless of zoom (they no longer visually grow when the user zooms in).
const REF_CAM_DIST = 4.32;

// ── Single marker (glowing mesh dot) ───────────────────────────
function SingleMarker({
  marker, onHover, onSelect,
}: {
  marker: MapMarker;
  onHover: (h: boolean) => void;
  onSelect: (m: MapMarker) => void;
}) {
  const { camera } = useThree();
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const glowColor = markerColor(marker);
  const pos = useMemo(() => latLngToVec3(marker.lat, marker.lng), [marker.lat, marker.lng]);

  // Keep constant apparent (screen) size: world scale grows with distance.
  useFrame(() => {
    if (!meshRef.current) return;
    const d = camera.position.distanceTo(pos);
    const s = THREE.MathUtils.clamp(d / REF_CAM_DIST, 0.45, 1.6);
    meshRef.current.scale.setScalar(s);
  });

  return (
    <mesh
      ref={meshRef}
      position={pos}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); onHover(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); onHover(false); document.body.style.cursor = 'auto'; }}
      onClick={(e) => { e.stopPropagation(); onSelect(marker); }}
    >
      <sphereGeometry args={[hovered ? 0.032 : 0.02, 14, 14]} />
      <meshStandardMaterial
        color={glowColor}
        emissive={glowColor}
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
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(true);
  const visRef = useRef(true);
  const pos = useMemo(() => latLngToVec3(lat, lng), [lat, lng]);
  const normal = useMemo(() => pos.clone().normalize(), [pos]);
  const r = THREE.MathUtils.clamp(0.03 + Math.log10(count) * 0.02, 0.032, 0.08);

  // hide the HTML badge when the cluster is on the far side of the globe;
  // also keep the halo a constant apparent size (scale ∝ camera distance).
  useFrame(() => {
    const camDir = camera.position.clone().normalize();
    const v = normal.dot(camDir) > -0.05;
    if (v !== visRef.current) { visRef.current = v; setVisible(v); }
    if (meshRef.current) {
      const d = camera.position.distanceTo(pos);
      const s = THREE.MathUtils.clamp(d / REF_CAM_DIST, 0.45, 1.6);
      meshRef.current.scale.setScalar(s);
    }
  });

  return (
    <group position={pos}>
      <mesh
        ref={meshRef}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); onHover(true); document.body.style.cursor = 'zoom-in'; }}
        onPointerOut={() => { setHovered(false); onHover(false); document.body.style.cursor = 'auto'; }}
        onClick={(e) => { e.stopPropagation(); onZoom(pos); }}
      >
        <sphereGeometry args={[r, 18, 18]} />
        <meshBasicMaterial color={color} transparent opacity={hovered ? 0.5 : 0.32} />
      </mesh>
      {visible && (
        <Html center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
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

// ── Region contour ring ────────────────────────────────────────
// A small-circle outline drawn on the sphere surface around a region's
// predefined centre. This replaces the number-in-a-circle cluster: instead
// interconnected structures are grouped into a territorial region marked by a
// glowing contour + a name/count label. Ring geometry is built imperatively
// (THREE.Line loop) and rendered via <primitive> — same pattern as GraphArcs.
function buildRing(center: THREE.Vector3, angRad: number, color: string): THREE.Line {
  const normal = center.clone().normalize();
  // stable tangent basis perpendicular to the region normal
  const seed = Math.abs(normal.y) > 0.92 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
  const u = new THREE.Vector3().crossVectors(normal, seed).normalize();
  const v = new THREE.Vector3().crossVectors(normal, u).normalize();
  const pts: THREE.Vector3[] = [];
  const SEG = 72;
  const rSurf = GLOBE_R * 1.01; // hover just above the surface to avoid z-fight
  for (let i = 0; i <= SEG; i++) {
    const t = (i / SEG) * Math.PI * 2;
    const dir = normal
      .clone()
      .multiplyScalar(Math.cos(angRad))
      .add(u.clone().multiplyScalar(Math.sin(angRad) * Math.cos(t)))
      .add(v.clone().multiplyScalar(Math.sin(angRad) * Math.sin(t)));
    pts.push(dir.multiplyScalar(rSurf));
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(pts);
  return new THREE.Line(
    geometry,
    new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.85, toneMapped: false }),
  );
}

function RegionMarker({
  group, onHover, onZoom,
}: {
  group: RegionGroup;
  onHover: (h: boolean) => void;
  onZoom: (pos: THREE.Vector3, group: RegionGroup) => void;
}) {
  const { camera } = useThree();
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(true);
  const visRef = useRef(true);
  const pos = useMemo(
    () => latLngToVec3(group.centerLat, group.centerLng),
    [group.centerLat, group.centerLng],
  );
  const normal = useMemo(() => pos.clone().normalize(), [pos]);
  // angular radius scales gently with object count (bigger regions → wider ring)
  const angRad = THREE.MathUtils.clamp(0.12 + Math.log10(group.count + 1) * 0.05, 0.12, 0.34);

  // build ring (halo + core) once per group/zoom-size change
  const rings = useMemo(() => {
    const core = buildRing(pos, angRad, group.color);
    const halo = buildRing(pos, angRad, group.color);
    (halo.material as THREE.LineBasicMaterial).opacity = 0.28;
    return [halo, core];
  }, [pos, angRad, group.color]);

  useEffect(() => {
    return () => {
      for (const l of rings) {
        l.geometry?.dispose();
        (l.material as THREE.Material)?.dispose();
      }
    };
  }, [rings]);

  // cull the label on the far hemisphere (like ClusterMarker)
  useFrame(() => {
    const camDir = camera.position.clone().normalize();
    const vis = normal.dot(camDir) > 0.02;
    if (vis !== visRef.current) { visRef.current = vis; setVisible(vis); }
  });

  return (
    <group>
      {rings.map((l, i) => (
        <primitive key={i} object={l} />
      ))}
      {/* invisible hit target at the region centre for click-to-zoom */}
      <mesh
        position={pos}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); onHover(true); document.body.style.cursor = 'zoom-in'; }}
        onPointerOut={() => { setHovered(false); onHover(false); document.body.style.cursor = 'auto'; }}
        onClick={(e) => { e.stopPropagation(); onZoom(pos, group); }}
      >
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {visible && (
        <Html position={pos} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
          <div style={{
            transform: 'translateY(-38px)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '3px 9px',
            borderRadius: 999,
            background: 'rgba(4,12,26,0.88)',
            border: `1.5px solid ${group.color}`,
            color: '#fff',
            fontSize: 11,
            fontWeight: 700,
            whiteSpace: 'nowrap',
            boxShadow: `0 0 14px ${group.color}66`,
            backdropFilter: 'blur(6px)',
            opacity: hovered ? 1 : 0.92,
          }}>
            <span style={{ letterSpacing: '0.01em' }}>{group.name}</span>
            <span style={{
              minWidth: 16,
              padding: '0 5px',
              borderRadius: 999,
              background: group.color,
              color: '#04121a',
              fontSize: 10,
              fontWeight: 900,
              textAlign: 'center',
            }}>
              {group.count > 999 ? '999+' : group.count}
            </span>
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
  markers, onHover, onSelect, controlsRef, graphEdges, showGraph,
}: {
  markers: MapMarker[];
  onHover: (h: boolean) => void;
  onSelect: (m: MapMarker) => void;
  controlsRef: React.MutableRefObject<any>;
  graphEdges: GeoJSON.FeatureCollection;
  showGraph: boolean;
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

  // ── Region grouping (replaces number-in-a-circle clusters) ──
  // Interconnected structures are grouped into predefined territorial regions.
  // Zoomed out → show region contours + name/count labels. Zoomed in → reveal
  // the individual markers inside.
  const regionGroups = useMemo(() => groupMarkersByRegion(markers), [markers]);
  const showRegions = camDist > 3.0;

  const handleRegionZoom = (pos: THREE.Vector3) => {
    // fly close enough to cross the showRegions threshold and reveal markers
    flyRef.current = { camPos: pos.clone().normalize().multiplyScalar(2.75) };
  };

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

      {/* Knowledge-graph arcs (world space — orbits with the globe like markers) */}
      {showGraph && <GraphArcs edges={graphEdges} />}

      {/* Region contours (zoomed out) → individual markers (zoomed in) */}
      {showRegions
        ? regionGroups.map((g) => (
            <RegionMarker
              key={g.id}
              group={g}
              onHover={onHover}
              onZoom={handleRegionZoom}
            />
          ))
        : markers.map((m) => (
            <SingleMarker
              key={`${m.type}:${m.id}`}
              marker={m}
              onHover={onHover}
              onSelect={onSelect}
            />
          ))}
    </>
  );
}

// ── Page ───────────────────────────────────────────────────────
export default function EarthGlobePage() {
  const [, setLocation] = useLocation();
  const [autoRotate, setAutoRotate] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [selected, setSelected] = useState<MapMarker | null>(null);
  const [showGraph, setShowGraph] = useState(false);
  const controlsRef = useRef<any>(null);

  const { markers: supabaseMarkers } = useSupabaseMarkers();
  const { edges: graphEdges, count: graphCount } = useSupabaseGraph();

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
          graphEdges={graphEdges}
          showGraph={showGraph}
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

        {/* Bottom control bar (graph toggle + rotation hint). App tiles are now
            a freeform draggable desktop rendered by <OSDesktop/> below. */}
        <div className="px-3 pb-safe-area-inset-bottom pb-5 pointer-events-none">
          {/* Knowledge-graph arc toggle ("Связи графа") */}
          <div className="flex justify-center pointer-events-none">
            <button
              onClick={() => setShowGraph(s => !s)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full transition-all active:scale-95 pointer-events-auto"
              style={{
                background: showGraph ? 'rgba(0,230,200,0.14)' : 'rgba(5,13,26,0.85)',
                border: `1px solid ${showGraph ? '#00e6c8' : 'rgba(0,200,230,0.14)'}`,
                color: showGraph ? '#00e6c8' : 'rgba(255,255,255,0.55)',
                boxShadow: showGraph ? '0 0 18px rgba(0,230,200,0.25)' : 'none',
                backdropFilter: 'blur(28px)',
              }}
            >
              <Network size={15} />
              <span className="text-[11px] font-semibold tracking-tight">
                Связи графа
              </span>
              <span
                className="text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-full"
                style={{
                  background: showGraph ? 'rgba(0,230,200,0.18)' : 'rgba(255,255,255,0.06)',
                  color: showGraph ? '#00e6c8' : 'rgba(255,255,255,0.4)',
                }}
              >
                {graphCount}
              </span>
            </button>
          </div>

          {/* Globe control hint / rotation toggle */}
          <button
            onClick={() => setAutoRotate(r => !r)}
            className="mt-2 w-full text-center pointer-events-auto"
            style={{ color: 'rgba(255,255,255,0.15)', fontSize: 10 }}
          >
            {autoRotate ? '⏸ Остановить вращение' : '▶ Запустить вращение'} · Тяни глобус · Перетаскивай приложения
          </button>
        </div>
      </div>

      {/* ── Freeform draggable OS desktop (tiles + folders over the globe) ── */}
      <OSDesktop modules={OS_MODULES} onNavigate={setLocation} />

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
