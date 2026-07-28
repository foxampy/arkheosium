import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, useTexture, Html, OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import {
  createEarthUniforms,
  earthVertexShader,
  earthFragmentShader,
  atmosphereVertexShader,
  atmosphereFragmentShader,
} from './earthMaterial';
import { latLngToVec3, GLOBE_REGIONS } from './geo';
import { terraformAt } from '@/data/eco-timeline';
import AralOverlay from './AralOverlay';

const TEX = {
  day: '/textures/earth/earth-blue-marble.jpg',
  night: '/textures/earth/earth-night.jpg',
  water: '/textures/earth/earth-water.png',
  topo: '/textures/earth/earth-topology.png',
  clouds: '/textures/earth/clouds.png',
};

const RADIUS = 1.5;
const SUN_DIR = new THREE.Vector3(1, 0.28, 0.7).normalize();

// ── Realistic Earth surface (custom shader) ────────────────────
function Earth({
  progress,
  autoRotate,
  focusLatLng,
  groupRef,
}: {
  progress: number;
  autoRotate: boolean;
  focusLatLng: { lat: number; lng: number } | null;
  groupRef: React.RefObject<THREE.Group>;
}) {
  const [day, night, water, topo] = useTexture([TEX.day, TEX.night, TEX.water, TEX.topo]);

  // colour vs data textures
  day.colorSpace = THREE.SRGBColorSpace;
  night.colorSpace = THREE.SRGBColorSpace;
  water.colorSpace = THREE.NoColorSpace;
  topo.colorSpace = THREE.NoColorSpace;
  [day, night, water, topo].forEach((t) => {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 8;
  });

  const material = useMemo(() => {
    const uniforms = createEarthUniforms();
    uniforms.uDay.value = day;
    uniforms.uNight.value = night;
    uniforms.uSpec.value = water;
    uniforms.uBump.value = topo;
    uniforms.uSunDir.value = SUN_DIR.clone();
    return new THREE.ShaderMaterial({
      uniforms: uniforms as unknown as Record<string, THREE.IUniform>,
      vertexShader: earthVertexShader,
      fragmentShader: earthFragmentShader,
    });
  }, [day, night, water, topo]);

  // smoothed terraform state
  const cur = useRef({ glaciation: 1, aridity: 0, cityGlow: 0 });

  useFrame((_, delta) => {
    const g = groupRef.current;
    // rotation: ease toward focus longitude, else gentle spin
    if (g) {
      if (focusLatLng) {
        const n = latLngToVec3(focusLatLng.lat, focusLatLng.lng, 1);
        const targetY = -Math.atan2(n.x, n.z);
        // shortest-path ease
        let d = targetY - g.rotation.y;
        d = Math.atan2(Math.sin(d), Math.cos(d));
        g.rotation.y += d * Math.min(1, delta * 2.2);
      } else if (autoRotate) {
        g.rotation.y += delta * 0.04;
      }
    }

    // ease shader uniforms toward the timeline target
    const target = terraformAt(progress);
    const s = Math.min(1, delta * 2.5);
    cur.current.glaciation += (target.glaciation - cur.current.glaciation) * s;
    cur.current.aridity += (target.aridity - cur.current.aridity) * s;
    cur.current.cityGlow += (target.cityGlow - cur.current.cityGlow) * s;
    const u = material.uniforms as unknown as ReturnType<typeof createEarthUniforms>;
    u.uGlaciation.value = cur.current.glaciation;
    u.uAridity.value = cur.current.aridity;
    u.uCityGlow.value = cur.current.cityGlow;
  });

  return (
    <mesh material={material}>
      <sphereGeometry args={[RADIUS, 128, 128]} />
    </mesh>
  );
}

// ── Cloud layer (rotates a touch faster than the surface) ──────
function Clouds({ aridity }: { aridity: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const tex = useTexture(TEX.clouds);
  tex.colorSpace = THREE.SRGBColorSpace;

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.055;
  });

  // clouds thin out as the world dries
  const opacity = 0.5 * (1 - aridity * 0.7);

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[RADIUS * 1.012, 96, 96]} />
      <meshStandardMaterial
        map={tex}
        alphaMap={tex}
        transparent
        opacity={opacity}
        depthWrite={false}
        roughness={1}
        metalness={0}
      />
    </mesh>
  );
}

// ── Fresnel atmosphere rim ─────────────────────────────────────
function Atmosphere({ color }: { color: string }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uColor: { value: new THREE.Color(color) },
          uSunDir: { value: SUN_DIR.clone() },
          uIntensity: { value: 1.15 },
        },
        vertexShader: atmosphereVertexShader,
        fragmentShader: atmosphereFragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        depthWrite: false,
      }),
    [],
  );

  useEffect(() => {
    (material.uniforms.uColor.value as THREE.Color).set(color);
  }, [color, material]);

  return (
    <mesh material={material}>
      <sphereGeometry args={[RADIUS * 1.18, 64, 64]} />
    </mesh>
  );
}

// ── Interactive region marker + label ──────────────────────────
function RegionMarker({
  region,
  active,
  onClick,
}: {
  region: (typeof GLOBE_REGIONS)[number];
  active: boolean;
  onClick: (id: string) => void;
}) {
  const pos = useMemo(
    () => latLngToVec3(region.lat, region.lng, RADIUS * 1.02),
    [region.lat, region.lng],
  );
  const pulse = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (pulse.current) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 2.2) * 0.25 * (active ? 1.4 : 1);
      pulse.current.scale.setScalar(s);
    }
  });

  return (
    <group position={pos}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onClick(region.id);
        }}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = 'auto')}
      >
        <sphereGeometry args={[0.028, 16, 16]} />
        <meshBasicMaterial color={region.color} toneMapped={false} />
      </mesh>
      <mesh ref={pulse}>
        <ringGeometry args={[0.035, 0.05, 24]} />
        <meshBasicMaterial color={region.color} transparent opacity={active ? 0.9 : 0.5} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      <Html
        center
        distanceFactor={6}
        style={{ pointerEvents: 'none', transform: 'translateY(-28px)' }}
        occlude
      >
        <div
          style={{
            whiteSpace: 'nowrap',
            padding: '3px 9px',
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '-0.01em',
            color: '#e6fbff',
            background: 'rgba(6,15,28,0.72)',
            border: `1px solid ${region.color}`,
            boxShadow: active ? `0 0 16px ${region.color}aa` : '0 2px 10px rgba(0,0,0,0.4)',
            backdropFilter: 'blur(8px)',
            transition: 'box-shadow .3s',
          }}
        >
          {region.label}
        </div>
      </Html>
    </group>
  );
}

// ── Sun as a directional light aligned with the shader sun ─────
function SunLight() {
  const p = SUN_DIR.clone().multiplyScalar(8);
  return (
    <>
      <ambientLight intensity={0.12} />
      <directionalLight position={[p.x, p.y, p.z]} intensity={1.1} color="#fff6e8" />
    </>
  );
}

// ── Scene graph ────────────────────────────────────────────────
function Scene({
  progress,
  autoRotate,
  interactive,
  showRegions,
  activeRegion,
  focusLatLng,
  onRegionClick,
}: {
  progress: number;
  autoRotate: boolean;
  interactive: boolean;
  showRegions: boolean;
  activeRegion: string | null;
  focusLatLng: { lat: number; lng: number } | null;
  onRegionClick: (id: string) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const terra = terraformAt(progress);

  return (
    <>
      <SunLight />
      <Stars radius={140} depth={60} count={6000} factor={4} saturation={0} fade speed={0.2} />

      <Suspense fallback={null}>
        <group ref={groupRef}>
          <Earth
            progress={progress}
            autoRotate={autoRotate}
            focusLatLng={focusLatLng}
            groupRef={groupRef}
          />
          {/* Localised Aral drying — anchored to the surface, rotates with Earth */}
          <AralOverlay radius={RADIUS} dry={terra.aralDry} size={0.62} />
          {showRegions &&
            GLOBE_REGIONS.map((r) => (
              <RegionMarker
                key={r.id}
                region={r}
                active={activeRegion === r.id}
                onClick={onRegionClick}
              />
            ))}
        </group>
        <Clouds aridity={terra.aridity} />
        <Atmosphere color={terra.atmosphere} />
      </Suspense>

      {interactive && (
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          rotateSpeed={0.45}
        />
      )}

      <EffectComposer>
        <Bloom intensity={0.5} luminanceThreshold={0.2} luminanceSmoothing={0.9} mipmapBlur height={240} />
      </EffectComposer>
    </>
  );
}

// ── Public component ───────────────────────────────────────────
export interface WorldGlobeProps {
  /** Timelapse scrub 0..1 → real terraforming. */
  progress?: number;
  /** Gentle auto-spin when not focused (default true). */
  autoRotate?: boolean;
  /** Enable OrbitControls + clickable markers. */
  interactive?: boolean;
  /** Show region markers/labels. */
  showRegions?: boolean;
  /** Currently highlighted region id. */
  activeRegion?: string | null;
  /** Ease the globe so this lat/lng faces the camera. */
  focusLatLng?: { lat: number; lng: number } | null;
  /** Region click handler. */
  onRegionClick?: (id: string) => void;
  className?: string;
}

export default function WorldGlobe({
  progress = 0,
  autoRotate = true,
  interactive = false,
  showRegions = false,
  activeRegion = null,
  focusLatLng = null,
  onRegionClick = () => {},
  className,
}: WorldGlobeProps) {
  return (
    <Canvas
      className={className}
      camera={{ position: [0, 0.3, 4.3], fov: 42 }}
      style={{ width: '100%', height: '100%' }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
    >
      <Scene
        progress={progress}
        autoRotate={autoRotate}
        interactive={interactive}
        showRegions={showRegions}
        activeRegion={activeRegion}
        focusLatLng={focusLatLng}
        onRegionClick={onRegionClick}
      />
    </Canvas>
  );
}
