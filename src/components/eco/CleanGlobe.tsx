import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Sphere, useTexture } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

// ── Props ──────────────────────────────────────────────────────
interface CleanGlobeProps {
  /** Gentle auto-rotation of the Earth (default: true). */
  autoRotate?: boolean;
  /** Optional wrapper className for the Canvas container. */
  className?: string;
  /** Atmosphere halo colour (timelapse phase). Default: deep ocean blue. */
  atmosphere?: string;
  /** Colour film laid over the globe (drying → dust → ash). */
  tint?: string;
  /** Opacity of the tint film, 0..1. Default 0 (no film). */
  tintOpacity?: number;
}

// ── Earth sphere (reuses the same day/night texture as EarthGlobePage) ──
// Same texture source as src/pages/EarthGlobePage.tsx so it definitely loads.
function EarthMesh({ autoRotate }: { autoRotate: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const earthTex = useTexture(
    'https://unpkg.com/three-globe@2.31.1/example/img/earth-night.jpg',
  );

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.045;
    }
  });

  return (
    <group ref={groupRef}>
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
    </group>
  );
}

// ── Scene (inside Canvas) ──────────────────────────────────────
function Scene({
  autoRotate,
  atmosphere,
  tint,
  tintOpacity,
}: {
  autoRotate: boolean;
  atmosphere: string;
  tint: string;
  tintOpacity: number;
}) {
  return (
    <>
      <ambientLight intensity={0.05} />
      <directionalLight position={[6, 4, 5]} intensity={0.28} color="#b8d8ff" />
      <pointLight position={[-4, 2, 3]} intensity={0.3} color="#00d4ff" distance={14} />
      <pointLight position={[3, -3, -4]} intensity={0.15} color="#7c3aed" distance={14} />

      <Stars radius={140} depth={60} count={7000} factor={4} saturation={0} fade speed={0.25} />

      {/* Earth */}
      <Suspense
        fallback={
          <Sphere args={[1.5, 64, 64]}>
            <meshStandardMaterial color="#071428" roughness={0.9} metalness={0.0} />
          </Sphere>
        }
      >
        <EarthMesh autoRotate={autoRotate} />
      </Suspense>

      {/* Phase tint film over the globe (drying → dust → ash). */}
      {tintOpacity > 0.001 && (
        <Sphere args={[1.505, 64, 64]}>
          <meshBasicMaterial
            color={tint}
            transparent
            opacity={tintOpacity}
            depthWrite={false}
            side={THREE.FrontSide}
          />
        </Sphere>
      )}

      {/* Inner atmosphere (phase-tinted) */}
      <Sphere args={[1.56, 32, 32]}>
        <meshStandardMaterial color={atmosphere} transparent opacity={0.1} side={THREE.BackSide} />
      </Sphere>
      {/* Outer glow halo */}
      <Sphere args={[1.66, 32, 32]}>
        <meshStandardMaterial color="#001133" transparent opacity={0.15} side={THREE.BackSide} />
      </Sphere>

      {/* Subtle bloom for realistic ocean/atmosphere glow.
          Low resolution + mipmapBlur keeps it performant. */}
      <EffectComposer>
        <Bloom
          intensity={0.55}
          luminanceThreshold={0.15}
          luminanceSmoothing={0.9}
          mipmapBlur
          height={220}
        />
      </EffectComposer>
    </>
  );
}

// ── Public component ───────────────────────────────────────────
export default function CleanGlobe({
  autoRotate = true,
  className,
  atmosphere = '#0077bb',
  tint = '#bfe4ff',
  tintOpacity = 0,
}: CleanGlobeProps) {
  return (
    <Canvas
      className={className}
      camera={{ position: [0, 0.4, 4.3], fov: 42 }}
      style={{ width: '100%', height: '100%' }}
      gl={{ antialias: true, alpha: true }}
    >
      <Scene
        autoRotate={autoRotate}
        atmosphere={atmosphere}
        tint={tint}
        tintOpacity={tintOpacity}
      />
    </Canvas>
  );
}
