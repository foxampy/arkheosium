// ═══════════════════════════════════════════════════════════════
//  PresentRevealScene — /journey Block 2
//  An interactive Earth globe with ALL data markers open, grouped
//  into region contours (zoomed out) / individual glowing markers
//  (zoomed in). Mirrors the marker rework from EarthGlobePage.
//
//  Scripted focus flow: after the user has explored the globe, the
//  Central Asia region gently pulses; a CTA flies the camera to the
//  Aral Sea and opens a popup that navigates to /aral.
//
//  Self-contained: renders its OWN <Canvas> (the /journey background
//  globe is pointerEvents:none decorative and cannot be used here).
// ═══════════════════════════════════════════════════════════════
import { Suspense, useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, OrbitControls, Sphere, useTexture, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, MapPin, ArrowRight, X } from 'lucide-react';
import { getAllMapMarkers } from '@/data/map-markers';
import { DOMAIN_CONFIG, normalizeDomain } from '@/lib/domains';
import type { MapMarker } from '@/components/map/types';
import { groupMarkersByGeography, findCentralAsia } from '@/lib/regionGrouping';
import { useWorldBorders } from '@/lib/geo/useWorldBorders';
import type { WorldBorders } from '@/lib/geo/worldBorders';
import { GeoRegionMarker } from '@/components/geo/GeoRegionMarker';

const ACCENT = '#00e6c8';
const ACCENT_2 = '#00d4ff';

// ── Aral Sea focus target (approx) ─────────────────────────────
const ARAL_LAT = 45.0;
const ARAL_LNG = 59.0;

// ── Marker colour (mirror of EarthGlobePage) ───────────────────
const TYPE_COLOR: Record<string, string> = {
  object: '#00d4ff',
  subject: '#fbbf24',
  project: '#4ade80',
  rd: '#f59e0b',
};
function markerColor(m: MapMarker): string {
  if (m.type === 'object') return DOMAIN_CONFIG[normalizeDomain(m.domain)].color;
  return TYPE_COLOR[m.type] ?? '#a78bfa';
}

// ── Geo helpers (mirror of EarthGlobePage) ─────────────────────
const GLOBE_R = 1.53;
const REF_CAM_DIST = 4.32;

function latLngToVec3(lat: number, lng: number, r = GLOBE_R): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  );
}

// ── Single glowing marker ──────────────────────────────────────
function SingleMarker({ marker }: { marker: MapMarker }) {
  const { camera } = useThree();
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const glowColor = markerColor(marker);
  const pos = useMemo(() => latLngToVec3(marker.lat, marker.lng), [marker.lat, marker.lng]);

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
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
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

// ── Earth mesh (mirror of CleanGlobe / EarthGlobePage) ─────────
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
  markers, controlsRef, flyToken, aralFlyToken, onArrivedAral, world,
}: {
  markers: MapMarker[];
  controlsRef: React.MutableRefObject<any>;
  flyToken: number;        // unused external fly (reserved)
  aralFlyToken: number;    // increments to trigger the Aral fly-to
  onArrivedAral: () => void;
  world: WorldBorders | null;
}) {
  const { camera } = useThree();
  const [camDist, setCamDist] = useState(4.3);
  const flyRef = useRef<FlyTarget | null>(null);
  const aralRef = useRef(0);

  // Территории по настоящим границам: издалека — макрорегионы ООН, ближе —
  // отдельные государства, вплотную — сами объекты.
  const level = camDist > 3.6 ? 'macro' : 'country';
  const { groups, ungrouped } = useMemo(
    () => groupMarkersByGeography(markers, world, level),
    [markers, world, level],
  );
  const focus = useMemo(() => findCentralAsia(groups), [groups]);
  const regionsReady = camDist > 2.6 && groups.length > 0;

  // trigger the Aral fly-to when the token changes
  useEffect(() => {
    if (aralFlyToken !== aralRef.current) {
      aralRef.current = aralFlyToken;
      if (aralFlyToken > 0) {
        const target = latLngToVec3(ARAL_LAT, ARAL_LNG).clone().normalize().multiplyScalar(2.7);
        flyRef.current = { camPos: target };
      }
    }
  }, [aralFlyToken]);

  useFrame(() => {
    const d = camera.position.length();
    const q = Math.round(d * 4) / 4;
    if (q !== camDist) setCamDist(q);

    if (flyRef.current) {
      const t = flyRef.current.camPos;
      camera.position.lerp(t, 0.06);
      if (controlsRef.current) {
        // aim the orbit target at the Aral centre so it stays framed
        const look = latLngToVec3(ARAL_LAT, ARAL_LNG).clone().multiplyScalar(0.0);
        controlsRef.current.target.lerp(look, 0.06);
      }
      if (camera.position.distanceTo(t) < 0.06) {
        flyRef.current = null;
        onArrivedAral();
      }
    }
  });

  const handleRegionZoom = (pos: THREE.Vector3) => {
    const next = camDist > 3.6 ? 3.2 : 2.4;
    flyRef.current = { camPos: pos.clone().normalize().multiplyScalar(next) };
  };

  return (
    <>
      <ambientLight intensity={0.05} />
      <directionalLight position={[6, 4, 5]} intensity={0.28} color="#b8d8ff" />
      <pointLight position={[-4, 2, 3]} intensity={0.3} color="#00d4ff" distance={14} />
      <pointLight position={[3, -3, -4]} intensity={0.15} color="#7c3aed" distance={14} />

      <Stars radius={140} depth={60} count={7000} factor={4} saturation={0} fade speed={0.25} />

      <Suspense fallback={
        <Sphere args={[1.5, 64, 64]}>
          <meshStandardMaterial color="#071428" roughness={0.9} metalness={0.0} />
        </Sphere>
      }>
        <EarthMesh />
      </Suspense>

      {/* Inner atmosphere */}
      <Sphere args={[1.56, 32, 32]}>
        <meshStandardMaterial color="#0077bb" transparent opacity={0.08} side={THREE.BackSide} />
      </Sphere>
      {/* Outer glow halo */}
      <Sphere args={[1.65, 32, 32]}>
        <meshStandardMaterial color="#001133" transparent opacity={0.14} side={THREE.BackSide} />
      </Sphere>

      {/* Территории по настоящим границам → объекты вблизи */}
      {regionsReady ? (
        <>
          {groups.map((g) => (
            <GeoRegionMarker
              key={`${g.level}:${g.id}`}
              group={g}
              onSelect={handleRegionZoom}
              pulse={focus ? g.id === focus.id : false}
            />
          ))}
          {ungrouped.map((m) => (
            <SingleMarker key={`${m.type}:${m.id}`} marker={m} />
          ))}
        </>
      ) : (
        markers.map((m) => (
          <SingleMarker key={`${m.type}:${m.id}`} marker={m} />
        ))
      )}
    </>
  );
}

// ── Public component ───────────────────────────────────────────
export default function PresentRevealScene({
  onRequestNavigate,
}: {
  onRequestNavigate?: () => void;
}) {
  const [, setLocation] = useLocation();
  const controlsRef = useRef<any>(null);

  const [aralFlyToken, setAralFlyToken] = useState(0);
  const [showAralPopup, setShowAralPopup] = useState(false);

  const markers: MapMarker[] = useMemo(() => getAllMapMarkers(), []);
  const { world } = useWorldBorders();
  const groups = useMemo(
    () => groupMarkersByGeography(markers, world, 'macro').groups,
    [markers, world],
  );
  const centralAsia = useMemo(() => findCentralAsia(groups), [groups]);

  const goToAral = () => {
    setShowAralPopup(false);
    setAralFlyToken((t) => t + 1);
  };

  const openProject = () => {
    if (onRequestNavigate) onRequestNavigate();
    else setLocation('/aral');
  };

  return (
    <div className="relative h-full w-full">
      {/* keyframes for the primary-button pulse (very faint shadow) */}
      <style>{`
        @keyframes aralGlowPulse {
          0%, 100% { box-shadow: 0 0 26px ${ACCENT}cc, 0 0 60px ${ACCENT}44, 0 8px 30px rgba(0,0,0,0.5); }
          50%      { box-shadow: 0 0 34px ${ACCENT}ee, 0 0 76px ${ACCENT}55, 0 8px 30px rgba(0,0,0,0.5); }
        }
        @media (prefers-reduced-motion: reduce) {
          .aral-open-btn { animation: none !important; }
        }
      `}</style>

      {/* 3D globe canvas (interactive) */}
      <Canvas
        camera={{ position: [0, 0.4, 4.3], fov: 42 }}
        style={{ width: '100%', height: '100%' }}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene
          markers={markers}
          controlsRef={controlsRef}
          flyToken={0}
          aralFlyToken={aralFlyToken}
          onArrivedAral={() => setShowAralPopup(true)}
          world={world}
        />
        <OrbitControls
          ref={controlsRef}
          enableZoom
          enablePan={false}
          minDistance={2.4}
          maxDistance={9}
          autoRotate={false}
          dampingFactor={0.07}
          enableDamping
        />
      </Canvas>

      {/* Header hint */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 flex justify-center px-6 pt-6">
        <div className="max-w-md text-center">
          <span
            className="mb-2 inline-block rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em]"
            style={{
              color: ACCENT,
              background: `${ACCENT}18`,
              border: `1px solid ${ACCENT}40`,
            }}
          >
            Блок 2 · Метки регионов
          </span>
          <p className="mt-1 text-xs text-white/45">
            Вращайте и приближайте глобус — регионы раскроются в отдельные метки.
          </p>
        </div>
      </div>

      {/* CTA — fly to Central Asia / Aral */}
      {!showAralPopup && (
        <div className="absolute bottom-8 left-0 right-0 flex justify-center px-6">
          <button
            onClick={goToAral}
            className="flex items-center gap-2 rounded-full px-5 py-2.5 font-semibold text-sm transition-transform active:scale-95"
            style={{
              background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}bb)`,
              color: '#04121f',
              boxShadow: `0 0 24px ${ACCENT}55, 0 8px 24px rgba(0,0,0,0.4)`,
            }}
          >
            <MapPin size={16} />
            Перейти к Средней Азии
            <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* Aral popup card */}
      <AnimatePresence>
        {showAralPopup && (
          <motion.div
            key="aral-popup"
            className="absolute inset-0 z-30 flex items-center justify-center p-5"
            style={{ background: 'rgba(1,6,14,0.5)', backdropFilter: 'blur(4px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAralPopup(false)}
          >
            <motion.div
              className="relative w-full max-w-sm overflow-hidden rounded-2xl"
              style={{
                background: 'rgba(6,15,28,0.6)',
                border: `1px solid ${ACCENT}33`,
                boxShadow: `0 20px 60px rgba(0,0,0,0.6), 0 0 40px ${ACCENT}18`,
                backdropFilter: 'blur(22px)',
              }}
              initial={{ scale: 0.9, y: 24, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: 16, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT}00)` }} />

              <button
                onClick={() => setShowAralPopup(false)}
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}
              >
                <X size={16} />
              </button>

              <div className="p-6">
                <div
                  className="mb-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1"
                  style={{ background: `${ACCENT}18`, border: `1px solid ${ACCENT}40` }}
                >
                  <Droplets size={13} style={{ color: ACCENT }} />
                  <span className="text-[11px] font-semibold" style={{ color: ACCENT }}>
                    Средняя Азия
                  </span>
                </div>

                <h3 className="mb-2 text-xl font-bold leading-snug text-white">
                  Проект «Аральское море»
                </h3>

                <p className="mb-5 text-sm leading-relaxed text-white/55">
                  {centralAsia
                    ? `${centralAsia.count} взаимосвязанных объектов, субъектов и решений`
                    : 'Комплекс объектов и решений'}{' '}
                  собраны по направлениям возрождения: восстановление водного баланса,
                  экосистемы и устойчивая экономика региона.
                </p>

                <button
                  onClick={openProject}
                  className="aral-open-btn flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-transform active:scale-95"
                  style={{
                    background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_2})`,
                    color: '#04121f',
                    boxShadow: `0 0 26px ${ACCENT}cc, 0 0 60px ${ACCENT}44, 0 8px 30px rgba(0,0,0,0.5)`,
                    animation: 'aralGlowPulse 2.6s ease-in-out infinite',
                  }}
                >
                  Открыть проект
                  <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
