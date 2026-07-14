import { Suspense, useRef, useState, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, OrbitControls, Html, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { useLocation } from 'wouter';

// Infrastructure nodes (lat/lng on globe)
const INFRA_NODES = [
  { id: 'aral',      lat: 45.0,  lng: 59.5,  label: 'Аральское море',    color: '#00d4ff', type: 'water'   },
  { id: 'amu',       lat: 39.5,  lng: 63.5,  label: 'Амударья',          color: '#00d4ff', type: 'water'   },
  { id: 'syr',       lat: 40.5,  lng: 68.5,  label: 'Сырдарья',          color: '#00d4ff', type: 'water'   },
  { id: 'charvak',   lat: 41.6,  lng: 70.0,  label: 'Чарвак ГЭС',        color: '#00e6c8', type: 'infra'   },
  { id: 'tashkent',  lat: 41.3,  lng: 69.3,  label: 'Ташкент',           color: '#7c3aed', type: 'city'    },
  { id: 'almaty',    lat: 43.25, lng: 76.9,  label: 'Алматы',            color: '#7c3aed', type: 'city'    },
  { id: 'ashgabat',  lat: 37.95, lng: 58.38, label: 'Ашхабад',           color: '#7c3aed', type: 'city'    },
  { id: 'bishkek',   lat: 42.87, lng: 74.59, label: 'Бишкек',            color: '#7c3aed', type: 'city'    },
  { id: 'dushanbe',  lat: 38.56, lng: 68.77, label: 'Душанбе',           color: '#7c3aed', type: 'city'    },
  { id: 'nurek',     lat: 38.4,  lng: 69.4,  label: 'Нурекская ГЭС',     color: '#00e6c8', type: 'infra'   },
  { id: 'karakum',   lat: 40.5,  lng: 58.0,  label: 'Каракумский канал', color: '#f59e0b', type: 'project' },
] as const;

function latLngToVec3(lat: number, lng: number, r = 1.52): THREE.Vector3 {
  const phi   = (90 - lat)  * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
     r * Math.cos(phi),
     r * Math.sin(phi) * Math.sin(theta),
  );
}

interface NodeProps { lat: number; lng: number; label: string; color: string; type: string }

function InfraNode({ lat, lng, label, color }: NodeProps) {
  const [hovered, setHovered] = useState(false);
  const pos = latLngToVec3(lat, lng);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      const target = hovered ? 2.5 : 1.2;
      const mat = meshRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, target, delta * 6);
    }
  });

  return (
    <group position={pos}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[hovered ? 0.024 : 0.018, 8, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} />
      </mesh>
      {hovered && (
        <Html center distanceFactor={5}>
          <div style={{
            background: 'rgba(5,13,26,0.95)',
            border: `1px solid ${color}50`,
            borderRadius: 8,
            padding: '5px 12px',
            color: '#fff',
            fontSize: 11,
            fontWeight: 600,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            boxShadow: `0 0 16px ${color}30`,
          }}>
            {label}
          </div>
        </Html>
      )}
    </group>
  );
}

function Globe() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.04;
  });

  return (
    <group ref={groupRef}>
      {/* Core sphere */}
      <Sphere args={[1.5, 64, 64]}>
        <meshStandardMaterial color="#071428" roughness={0.85} metalness={0.05} />
      </Sphere>

      {/* Grid overlay */}
      <Sphere args={[1.502, 40, 40]}>
        <meshBasicMaterial color="#00d4ff" wireframe transparent opacity={0.055} />
      </Sphere>

      {/* Atmosphere glow */}
      <Sphere args={[1.62, 32, 32]}>
        <meshStandardMaterial color="#002244" transparent opacity={0.18} side={THREE.BackSide} />
      </Sphere>

      {/* Infrastructure nodes */}
      {INFRA_NODES.map(n => <InfraNode key={n.id} {...n} />)}
    </group>
  );
}

const STATS = [
  { label: 'Объектов',   value: '1,247', color: '#00d4ff' },
  { label: 'Проектов',   value: '84',    color: '#00d4ff' },
  { label: 'Регионов',   value: '47',    color: '#7c3aed' },
  { label: 'AI агентов', value: '12',    color: '#7c3aed' },
];

export default function EarthGlobePage() {
  const [, setLocation] = useLocation();
  const [autoRotate, setAutoRotate] = useState(false);

  const handleCanvasClick = useCallback(() => setAutoRotate(r => !r), []);

  return (
    <div className="fixed inset-0" style={{ background: 'radial-gradient(ellipse at 50% 40%, #030d1f 0%, #020810 100%)' }}>
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 4.2], fov: 42 }}
        style={{ width: '100%', height: '100%' }}
        onClick={handleCanvasClick}
      >
        <ambientLight intensity={0.12} />
        <directionalLight position={[5, 3, 5]} intensity={1.1} />
        <pointLight position={[0, 5, 2]} intensity={0.6} color="#00d4ff" distance={10} />
        <pointLight position={[-4, -2, -4]} intensity={0.25} color="#7c3aed" distance={12} />

        <Stars radius={120} depth={60} count={6000} factor={4} saturation={0} fade speed={0.4} />

        <Suspense fallback={null}>
          <Globe />
        </Suspense>

        <OrbitControls
          enableZoom
          enablePan={false}
          minDistance={2.4}
          maxDistance={9}
          autoRotate={autoRotate}
          autoRotateSpeed={0.4}
          dampingFactor={0.07}
          enableDamping
        />
      </Canvas>

      {/* ── Header overlay ── */}
      <div className="absolute top-16 inset-x-0 flex flex-col items-center pointer-events-none select-none">
        <p className="text-xs tracking-[0.35em] uppercase mb-1.5" style={{ color: 'rgba(0,212,255,0.45)' }}>
          Planetary OS
        </p>
        <h1 className="text-4xl font-black tracking-[0.12em]" style={{ color: 'rgba(255,255,255,0.92)' }}>
          ARKHEOSIUM
        </h1>
        <p className="text-sm mt-1.5 tracking-wide" style={{ color: 'rgba(255,255,255,0.32)' }}>
          Infrastructure Intelligence Operating System
        </p>
        <p className="text-xs mt-3" style={{ color: 'rgba(255,255,255,0.2)' }}>
          {autoRotate ? 'Нажми чтобы остановить' : 'Нажми для авторотации · Тяни для поворота'}
        </p>
      </div>

      {/* ── Stats bar ── */}
      <div className="absolute bottom-6 inset-x-0 flex justify-center gap-3 px-4 pointer-events-none">
        {STATS.map(s => (
          <div
            key={s.label}
            className="flex flex-col items-center px-4 py-2.5 rounded-2xl"
            style={{
              background: 'rgba(5,13,26,0.72)',
              border: `1px solid ${s.color}18`,
              backdropFilter: 'blur(16px)',
            }}
          >
            <span className="text-lg font-bold leading-none" style={{ color: s.color }}>{s.value}</span>
            <span className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Action buttons ── */}
      <div className="absolute bottom-6 right-4 flex flex-col gap-2 pointer-events-auto">
        <button
          onClick={() => setLocation('/map')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
          style={{
            background: 'rgba(0,212,255,0.1)',
            border: '1px solid rgba(0,212,255,0.28)',
            color: '#00d4ff',
            backdropFilter: 'blur(14px)',
          }}
        >
          🗺&nbsp;Карта
        </button>
        <button
          onClick={() => setLocation('/graph')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
          style={{
            background: 'rgba(124,58,237,0.1)',
            border: '1px solid rgba(124,58,237,0.28)',
            color: '#a78bfa',
            backdropFilter: 'blur(14px)',
          }}
        >
          🕸&nbsp;Граф знаний
        </button>
      </div>
    </div>
  );
}
