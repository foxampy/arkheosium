import * as THREE from 'three';

/**
 * Realistic Earth surface shader.
 *
 * Replaces the old "flat texture + colour-tint film" look with a real,
 * physically-motivated surface:
 *  - true day/night terminator driven by a sun direction (city lights glow
 *    only on the night side, blended smoothly across the terminator);
 *  - ocean specular highlight from the water mask (sun glint on seas);
 *  - subtle relief shading from the topology (bump) map;
 *  - REAL polar ice caps whose extent grows/recedes with `uGlaciation`
 *    (0 = today's caps, 1 = full ice-age advance) — geometry-accurate
 *    latitude masking, not a colour wash over the whole globe.
 *
 * All change is localised and physically meaningful, so the planet visibly
 * *terraforms* as the timeline scrubs instead of just changing hue.
 */
export interface EarthUniforms {
  uDay: { value: THREE.Texture | null };
  uNight: { value: THREE.Texture | null };
  uSpec: { value: THREE.Texture | null };
  uBump: { value: THREE.Texture | null };
  uSunDir: { value: THREE.Vector3 };
  /** 0 = modern ice caps, 1 = glacial maximum (caps reach lower latitudes). */
  uGlaciation: { value: number };
  /** 0 = lush/green bias, 1 = arid/dust bias (global desertification tint). */
  uAridity: { value: number };
  /** Overall night-lights intensity (civilisation glow). */
  uCityGlow: { value: number };
  uBumpScale: { value: number };
}

export function createEarthUniforms(): EarthUniforms {
  return {
    uDay: { value: null },
    uNight: { value: null },
    uSpec: { value: null },
    uBump: { value: null },
    uSunDir: { value: new THREE.Vector3(1, 0.2, 0.6).normalize() },
    uGlaciation: { value: 0 },
    uAridity: { value: 0 },
    uCityGlow: { value: 1 },
    uBumpScale: { value: 0.55 },
  };
}

export const earthVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vPosW;

  void main() {
    vUv = uv;
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vPosW = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

export const earthFragmentShader = /* glsl */ `
  precision highp float;

  uniform sampler2D uDay;
  uniform sampler2D uNight;
  uniform sampler2D uSpec;
  uniform sampler2D uBump;
  uniform vec3  uSunDir;
  uniform float uGlaciation;
  uniform float uAridity;
  uniform float uCityGlow;
  uniform float uBumpScale;

  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vPosW;

  // cheap relief: derive a perturbed normal from the topology luminance.
  vec3 reliefNormal(vec3 N) {
    float e = 1.0 / 1024.0;
    float hL = texture2D(uBump, vUv - vec2(e, 0.0)).r;
    float hR = texture2D(uBump, vUv + vec2(e, 0.0)).r;
    float hD = texture2D(uBump, vUv - vec2(0.0, e)).r;
    float hU = texture2D(uBump, vUv + vec2(0.0, e)).r;
    vec3 dn = vec3((hL - hR) * uBumpScale, (hD - hU) * uBumpScale, 1.0);
    return normalize(N + normalize(dn) * 0.35);
  }

  void main() {
    vec3 N = reliefNormal(normalize(vNormalW));
    vec3 L = normalize(uSunDir);

    float diffuse = dot(N, L);
    // smooth terminator: night -> day across the sunrise band
    float dayMix = smoothstep(-0.12, 0.30, diffuse);

    vec3 dayCol = texture2D(uDay, vUv).rgb;
    vec3 nightCol = texture2D(uNight, vUv).rgb;

    // global aridity bias: push land toward dusty ochre as the world dries.
    vec3 arid = mix(dayCol, vec3(0.62, 0.50, 0.34), 0.55);
    dayCol = mix(dayCol, arid, clamp(uAridity, 0.0, 1.0) * 0.7);

    // lit day
    float lit = clamp(diffuse, 0.0, 1.0);
    vec3 dayLit = dayCol * (0.35 + 0.85 * lit);

    // city lights only on the dark side
    vec3 lights = nightCol * uCityGlow * (1.0 - dayMix);

    vec3 color = mix(dayLit + lights, dayLit, dayMix);

    // ocean specular glint (water mask: white = water)
    float water = texture2D(uSpec, vUv).r;
    vec3 V = normalize(cameraPosition - vPosW);
    vec3 H = normalize(L + V);
    float spec = pow(max(dot(N, H), 0.0), 60.0) * water * dayMix;
    color += vec3(0.7, 0.85, 1.0) * spec * 0.9;

    // ---- REAL polar ice caps (latitude-accurate) ----
    // vUv.y: 0=south pole, 1=north pole -> latitude fraction |lat|/90
    float latFrac = abs(vUv.y - 0.5) * 2.0;
    // ice line marches from ~0.86 (modern) down to ~0.52 (glacial max)
    float iceLine = mix(0.86, 0.52, clamp(uGlaciation, 0.0, 1.0));
    float ice = smoothstep(iceLine - 0.04, iceLine + 0.02, latFrac);
    // caps are brighter on the lit side; keep a cold blue-white tone
    vec3 iceCol = vec3(0.90, 0.95, 1.0) * (0.45 + 0.75 * lit);
    color = mix(color, iceCol, ice);

    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`;

// ── Atmosphere (fresnel rim glow) ──────────────────────────────
export const atmosphereVertexShader = /* glsl */ `
  varying vec3 vNormalW;
  varying vec3 vPosW;
  void main() {
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vPosW = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

export const atmosphereFragmentShader = /* glsl */ `
  precision highp float;
  uniform vec3 uColor;
  uniform vec3 uSunDir;
  uniform float uIntensity;
  varying vec3 vNormalW;
  varying vec3 vPosW;
  void main() {
    vec3 V = normalize(cameraPosition - vPosW);
    float fres = pow(1.0 - max(dot(normalize(vNormalW), V), 0.0), 2.6);
    float sun = clamp(dot(normalize(vNormalW), normalize(uSunDir)) * 0.5 + 0.5, 0.0, 1.0);
    float a = fres * uIntensity * (0.35 + 0.65 * sun);
    gl_FragColor = vec4(uColor, a);
  }
`;
