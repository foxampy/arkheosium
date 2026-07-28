import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { latLngToVec3, ARAL_COORD } from './geo';

/**
 * Localised Aral-Sea drying decal.
 *
 * A small patch tangent to the globe over the real Aral basin. Its water body
 * shrinks through the historically-observed retreat stages as `dry` goes 0→1:
 *   0.00  1960 — single large sea (pre-diversion)
 *   0.45  2000 — North Aral splits off; large South lobe
 *   0.75  2010 — South splits into a western sliver + shrinking eastern basin
 *   1.00  2014+ — eastern basin gone; only North + thin western sliver remain
 * A dry lakebed (Aralkum) tint fills the exposed floor. This is real, localised
 * terraforming — not a colour wash over the planet.
 */

// Normalised basin outlines (x,y in 0..1 patch space), approximating the real
// Aral shoreline at four epochs. y grows downward (canvas convention).
const SEA_1960: [number, number][] = [
  [0.42, 0.08], [0.55, 0.10], [0.60, 0.22], [0.57, 0.36], [0.62, 0.50],
  [0.60, 0.66], [0.52, 0.80], [0.44, 0.90], [0.40, 0.74], [0.44, 0.58],
  [0.40, 0.44], [0.36, 0.30], [0.38, 0.16],
];
const NORTH_2000: [number, number][] = [
  [0.42, 0.08], [0.55, 0.10], [0.58, 0.20], [0.50, 0.26], [0.40, 0.22], [0.38, 0.13],
];
const SOUTH_2000: [number, number][] = [
  [0.40, 0.34], [0.58, 0.34], [0.61, 0.50], [0.58, 0.66], [0.50, 0.80],
  [0.44, 0.88], [0.41, 0.72], [0.45, 0.58], [0.40, 0.46],
];
const SOUTH_WEST_2010: [number, number][] = [
  [0.42, 0.36], [0.47, 0.36], [0.46, 0.54], [0.48, 0.72], [0.45, 0.86], [0.42, 0.70], [0.44, 0.52],
];
const SOUTH_EAST_2010: [number, number][] = [
  [0.49, 0.38], [0.60, 0.42], [0.58, 0.58], [0.52, 0.66], [0.49, 0.52],
];

function poly(ctx: CanvasRenderingContext2D, pts: [number, number][], s: number) {
  ctx.beginPath();
  pts.forEach(([x, y], i) => {
    const px = x * s, py = y * s;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  });
  ctx.closePath();
}

function drawAral(ctx: CanvasRenderingContext2D, s: number, dry: number) {
  ctx.clearRect(0, 0, s, s);

  // 1) dry lakebed (Aralkum) — appears where water has retreated. Draw the
  // full 1960 footprint as pale salt flat, fading in as the sea recedes.
  const bedA = Math.min(1, dry * 1.15);
  if (bedA > 0.01) {
    ctx.globalAlpha = 0.5 * bedA;
    const grd = ctx.createLinearGradient(0, 0, s, s);
    grd.addColorStop(0, '#c9b48a');
    grd.addColorStop(1, '#9c8a63');
    ctx.fillStyle = grd;
    poly(ctx, SEA_1960, s);
    ctx.fill();
  }

  // 2) water bodies for the current epoch (cross-faded between stages).
  const water = (a: number) => {
    ctx.globalAlpha = Math.max(0, Math.min(1, a));
    const wg = ctx.createLinearGradient(0, 0, 0, s);
    wg.addColorStop(0, '#0b6ea8');
    wg.addColorStop(1, '#063d63');
    ctx.fillStyle = wg;
  };

  if (dry < 0.45) {
    // 1960 → 2000: single sea fading toward the split
    const a = 1 - dry / 0.45;
    water(a); poly(ctx, SEA_1960, s); ctx.fill();
    // the split forms as `a` fades
    const b = 1 - a;
    water(b * 0.95); poly(ctx, NORTH_2000, s); ctx.fill();
    water(b * 0.95); poly(ctx, SOUTH_2000, s); ctx.fill();
  } else if (dry < 0.75) {
    // 2000 → 2010: south splits into west sliver + east basin
    const t = (dry - 0.45) / 0.30;
    water(1); poly(ctx, NORTH_2000, s); ctx.fill();            // north persists
    water(1 - t); poly(ctx, SOUTH_2000, s); ctx.fill();        // whole south fades
    water(t); poly(ctx, SOUTH_WEST_2010, s); ctx.fill();       // west sliver forms
    water(t * (1 - t * 0.4)); poly(ctx, SOUTH_EAST_2010, s); ctx.fill();
  } else {
    // 2010 → 2014+: eastern basin disappears; north + west sliver remain
    const t = (dry - 0.75) / 0.25;
    water(1); poly(ctx, NORTH_2000, s); ctx.fill();
    water(1); poly(ctx, SOUTH_WEST_2010, s); ctx.fill();
    water(1 - t); poly(ctx, SOUTH_EAST_2010, s); ctx.fill();   // east dries out
  }

  ctx.globalAlpha = 1;
}

export default function AralOverlay({
  radius,
  dry,
  size = 0.9,
  visible = true,
}: {
  radius: number;
  dry: number;
  size?: number;
  visible?: boolean;
}) {
  const canvas = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 256; c.height = 256;
    return c;
  }, []);
  const texture = useMemo(() => {
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [canvas]);

  useEffect(() => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawAral(ctx, canvas.width, dry);
    texture.needsUpdate = true;
  }, [canvas, texture, dry]);

  const meshRef = useRef<THREE.Mesh>(null);
  const { position, quaternion } = useMemo(() => {
    const pos = latLngToVec3(ARAL_COORD.lat, ARAL_COORD.lng, radius * 1.002);
    const normal = pos.clone().normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
    return { position: pos, quaternion: q };
  }, [radius]);

  if (!visible) return null;

  return (
    <mesh ref={meshRef} position={position} quaternion={quaternion}>
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial
        map={texture}
        transparent
        depthWrite={false}
        opacity={0.96}
        side={THREE.FrontSide}
      />
    </mesh>
  );
}
