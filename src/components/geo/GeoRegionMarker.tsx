// ─────────────────────────────────────────────────────────────────────────────
//  Территория на глобусе: настоящие границы, заливка, подпись с количеством.
//
//  Заменяет кольцо, радиус которого считался от числа объектов. У того кольца
//  не было отношения к географии вообще: «Израиль (299)» рисовался кругом на
//  пол-Африки просто потому, что в нём было много объектов.
//
//  Компонент общий для глобуса (EarthGlobePage) и вводной сцены (/journey),
//  чтобы обе показывали мир одинаково.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { GeoGroup } from '@/lib/regionGrouping';
import { buildBorderGeometry, buildFillGeometry, latLngToVec3 } from '@/lib/geo/sphereGeometry';

/** Радиус самой Земли на сцене. Слои границ ставятся чуть выше. */
export const EARTH_R = 1.5;
/** Радиус, на котором живут маркеры и дуги связей. */
export const MARKER_R = 1.53;

const FILL_R = EARTH_R * 1.004;   // заливка ложится почти на поверхность
const BORDER_R = EARTH_R * 1.008; // линия границы — поверх заливки, без z-fighting

export interface GeoRegionMarkerProps {
  group: GeoGroup;
  onHover?: (hovered: boolean) => void;
  onSelect?: (pos: THREE.Vector3, group: GeoGroup) => void;
  /** Подсветить как фокусный сектор (для Центральной Азии во вводной сцене). */
  pulse?: boolean;
}

export function GeoRegionMarker({ group, onHover, onSelect, pulse }: GeoRegionMarkerProps) {
  const { camera } = useThree();
  const [hovered, setHovered] = useState(false);
  const [labelVisible, setLabelVisible] = useState(true);
  const visRef = useRef(true);

  const fillMat = useRef<THREE.MeshBasicMaterial>(null);
  const lineMat = useRef<THREE.LineBasicMaterial>(null);

  const anchor = useMemo(
    () => latLngToVec3(group.anchorLat, group.anchorLng, MARKER_R),
    [group.anchorLat, group.anchorLng],
  );
  const normal = useMemo(() => anchor.clone().normalize(), [anchor]);

  // Геометрия строится один раз на состав контуров. Ключ по составу, а не по
  // ссылке: пересчёт группировки создаёт новый объект с теми же границами, и
  // перестраивать десятки тысяч треугольников на каждый кадр камеры незачем.
  const shapeKey = group.isoCodes.join(',');
  const { fill, border } = useMemo(() => {
    return {
      fill: buildFillGeometry(group.outlines, FILL_R),
      border: buildBorderGeometry(group.outlines, BORDER_R),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shapeKey]);

  useEffect(() => {
    return () => {
      fill?.dispose();
      border?.dispose();
    };
  }, [fill, border]);

  useFrame((state) => {
    // Подпись прячется, когда территория ушла на обратную сторону планеты.
    const camDir = camera.position.clone().normalize();
    const vis = normal.dot(camDir) > 0.02;
    if (vis !== visRef.current) { visRef.current = vis; setLabelVisible(vis); }

    const base = hovered ? 0.34 : 0.18;
    const beat = pulse ? 0.06 * Math.sin(state.clock.elapsedTime * 2.4) : 0;
    if (fillMat.current) fillMat.current.opacity = base + beat;
    if (lineMat.current) lineMat.current.opacity = (hovered ? 1 : 0.72) + beat;
  });

  const enter = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    setHovered(true);
    onHover?.(true);
    document.body.style.cursor = 'zoom-in';
  };
  const leave = () => {
    setHovered(false);
    onHover?.(false);
    document.body.style.cursor = 'auto';
  };

  return (
    <group>
      {fill && (
        <mesh
          geometry={fill}
          onPointerOver={enter}
          onPointerOut={leave}
          onClick={(e) => { e.stopPropagation(); onSelect?.(anchor, group); }}
        >
          <meshBasicMaterial
            ref={fillMat}
            color={group.color}
            transparent
            opacity={0.18}
            depthWrite={false}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>
      )}

      {border && (
        <lineSegments geometry={border}>
          <lineBasicMaterial
            ref={lineMat}
            color={group.color}
            transparent
            opacity={0.72}
            depthWrite={false}
            toneMapped={false}
          />
        </lineSegments>
      )}

      {labelVisible && (
        <Html position={anchor} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
          <div
            style={{
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
              boxShadow: pulse
                ? `0 0 20px ${group.color}, 0 0 8px ${group.color}`
                : `0 0 14px ${group.color}66`,
              backdropFilter: 'blur(6px)',
              opacity: hovered ? 1 : 0.92,
            }}
          >
            <span style={{ letterSpacing: '0.01em' }}>{group.name}</span>
            <span
              style={{
                minWidth: 16,
                padding: '0 5px',
                borderRadius: 999,
                background: group.color,
                color: '#04121a',
                fontSize: 10,
                fontWeight: 900,
                textAlign: 'center',
              }}
            >
              {group.count > 999 ? '999+' : group.count}
            </span>
          </div>
        </Html>
      )}
    </group>
  );
}

export default GeoRegionMarker;
