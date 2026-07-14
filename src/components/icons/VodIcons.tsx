/**
 * VODecology Icon System
 * Visual language: smooth flowing bezier curves, pure stroke-based line art.
 * "Water flow expressed as lines" — no water-drop silhouettes (except VodLogo).
 *   – 24×24 viewBox (32×32 default for VodLogo)
 *   – stroke only, no fill (except VodLogo outer drop and specific fill-required shapes)
 *   – strokeWidth 1.5, strokeLinecap="round", strokeLinejoin="round"
 *   – color inherited via color prop passed as stroke={color}
 */

import React from "react";

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

const defaults = { size: 24, color: "currentColor" };

// ─── Logo — water drop + concentric U-arcs + spiral ──────────
export function VodLogo({ size = 32, color = "#4B9FE1", className = "" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer drop silhouette — this IS the logo shape */}
      <path
        d="M12 2.2 C9.5 4.8 3.5 10.2 3.5 15.2 A8.5 8.5 0 0 0 20.5 15.2 C20.5 10.2 14.5 4.8 12 2.2Z"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* Concentric U-arc 1 (outermost) */}
      <path
        d="M6.5 15.8 A5.5 5.5 0 0 1 17.5 15.8"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Concentric U-arc 2 */}
      <path
        d="M8 15.8 A4 4 0 0 1 16 15.8"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      {/* Concentric U-arc 3 */}
      <path
        d="M9.5 15.8 A2.5 2.5 0 0 1 14.5 15.8"
        stroke={color}
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      {/* Inner spiral curl */}
      <path
        d="M11 15.8 C11 14.5 13 14.5 13 15.8 C13 16.6 12.4 17 12 17"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─── Objects / Infrastructure — 3 parallel wavy bezier lines ─
export function VodObjectIcon({ size, color = "currentColor", className = "", style }: IconProps) {
  const s = size ?? defaults.size;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      {/* 3 wavy horizontal bezier lines = pipelines/infrastructure */}
      <path d="M4 9 C9 7 15 11 20 9"   stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 13 C9 11 15 15 20 13" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 17 C9 15 15 19 20 17" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Subjects / Organizations — 3 concentric half-arcs + dot ─
export function VodSubjectIcon({ size, color = "currentColor", className = "", style }: IconProps) {
  const s = size ?? defaults.size;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      {/* 3 concentric half-arcs, open at top, centered at 12,16 */}
      {/* Arc r=3 */}
      <path d="M9 16 A3 3 0 0 1 15 16"       stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Arc r=5.5 */}
      <path d="M6.5 16 A5.5 5.5 0 0 1 17.5 16" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Arc r=8 */}
      <path d="M4 16 A8 8 0 0 1 20 16"        stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Center dot */}
      <circle cx="12" cy="16" r="1.2" fill={color} />
    </svg>
  );
}

// ─── Projects / Plans — flowing S-curve + checkmark ──────────
export function VodProjectIcon({ size, color = "currentColor", className = "", style }: IconProps) {
  const s = size ?? defaults.size;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      {/* Flowing S-curve */}
      <path d="M5 15 C8 8 14 18 17 13" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Checkmark at end */}
      <path d="M16 12 L18 15 L22 9"    stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Map / Geography — 3 organic topographic contours ────────
export function VodMapIcon({ size, color = "currentColor", className = "", style }: IconProps) {
  const s = size ?? defaults.size;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      {/* Outer contour */}
      <path
        d="M4 14 C4 8 10 5 12 5 C14 5 20 8 20 14 C20 19 16 21 12 21 C8 21 4 19 4 14"
        stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      />
      {/* Mid contour */}
      <path
        d="M7 14 C7 10 10 8 12 8 C14 8 17 10 17 14 C17 17 15 19 12 19 C9 19 7 17 7 14"
        stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      />
      {/* Inner contour */}
      <path
        d="M9.5 14 C9.5 12 10.5 11 12 11 C13.5 11 14.5 12 14.5 14 C14.5 15.5 13.5 16.5 12 16.5 C10.5 16.5 9.5 15.5 9.5 14"
        stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Globe — 2 meridian arcs + equator arc ───────────────────
export function VodGlobeIcon({ size, color = "currentColor", className = "", style }: IconProps) {
  const s = size ?? defaults.size;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      {/* Left meridian */}
      <path d="M12 3 C8 7 8 17 12 21"   stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Right meridian */}
      <path d="M12 3 C16 7 16 17 12 21"  stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Equator arc */}
      <path d="M3 12 A9 9 0 0 0 21 12"   stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Outer circle */}
      <circle cx="12" cy="12" r="9"      stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

// ─── Analytics — smooth rising wave/trend ────────────────────
export function VodAnalyticsIcon({ size, color = "currentColor", className = "", style }: IconProps) {
  const s = size ?? defaults.size;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      {/* Smooth rising wave trend line */}
      <path
        d="M3 18 C7 18 8 6 12 10 C16 14 17 6 21 8"
        stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      />
      {/* Baseline */}
      <path d="M3 20 L21 20" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.4" />
    </svg>
  );
}

// ─── Finance — 3 partial concentric circles (coin ripples) ───
export function VodFinanceIcon({ size, color = "currentColor", className = "", style }: IconProps) {
  const s = size ?? defaults.size;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      {/* 3 bottom-arc coin ripples */}
      <path d="M8 16 A4 4 0 0 1 16 16"   stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 18 A6 6 0 0 1 18 18"   stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 20 A8 8 0 0 1 20 20"   stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Wallet — smooth closed path + divider + coin ────────────
export function VodWalletIcon({ size, color = "currentColor", className = "", style }: IconProps) {
  const s = size ?? defaults.size;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      {/* Wallet body — closed path (it IS a container shape) */}
      <path
        d="M5 8 C5 6 7 5 12 5 C17 5 19 6 19 8 L19 17 C19 19 17 20 12 20 C7 20 5 19 5 17 Z"
        stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      />
      {/* Divider line */}
      <path d="M5 12 L19 12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      {/* Coin circle */}
      <circle cx="15" cy="16" r="1.5" stroke={color} strokeWidth="1.3" />
    </svg>
  );
}

// ─── Settings — interlocking S-curve + center circle ─────────
export function VodSettingsIcon({ size, color = "currentColor", className = "", style }: IconProps) {
  const s = size ?? defaults.size;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      {/* Outer flowing S-curve loop (gear as flowing lines) */}
      <path
        d="M6 12 C6 8 10 6 12 8 C14 10 18 8 18 12 C18 16 14 18 12 16 C10 14 6 16 6 12"
        stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      />
      {/* Inner center circle */}
      <circle cx="12" cy="12" r="2" stroke={color} strokeWidth="1.3" />
    </svg>
  );
}

// ─── Community — two flowing human silhouettes as curves ──────
export function VodCommunityIcon({ size, color = "currentColor", className = "", style }: IconProps) {
  const s = size ?? defaults.size;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      {/* Left person head */}
      <circle cx="8.5" cy="8" r="2" stroke={color} strokeWidth="1.5" />
      {/* Left person body curve */}
      <path d="M5 19 C5 15 7 13 8.5 13" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Right person head */}
      <circle cx="15.5" cy="8" r="2" stroke={color} strokeWidth="1.5" />
      {/* Right person body curve */}
      <path d="M19 19 C19 15 17 13 15.5 13" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Connection flow */}
      <path d="M8.5 13 C10.5 11.5 13.5 11.5 15.5 13" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.5" />
    </svg>
  );
}

// ─── Docs — 4 horizontal lines of varying length ─────────────
export function VodDocsIcon({ size, color = "currentColor", className = "", style }: IconProps) {
  const s = size ?? defaults.size;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M5 8 L19 8"   stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M5 11 L19 11" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M5 14 L16 14" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M5 17 L13 17" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// ─── Energy — flowing lightning bezier ───────────────────────
export function VodEnergyIcon({ size, color = "currentColor", className = "", style }: IconProps) {
  const s = size ?? defaults.size;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      {/* Lightning bolt — needs closed fill to be recognizable */}
      <path
        d="M13 3 L9 13 L12 13 L10 21 L17 10 L13 10 Z"
        stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Science — double helix (two interweaving S-curves) ───────
export function VodScienceIcon({ size, color = "currentColor", className = "", style }: IconProps) {
  const s = size ?? defaults.size;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      {/* Left helix strand */}
      <path
        d="M8 4 C10 8 14 10 16 14 C14 18 10 20 8 24"
        stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      />
      {/* Right helix strand */}
      <path
        d="M16 4 C14 8 10 10 8 14 C10 18 14 20 16 24"
        stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      />
      {/* Cross-links (rungs) connecting the two helixes */}
      <path d="M9.5 7.5 L14.5 6.5"  stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.7" />
      <path d="M11.2 11 L12.8 11"   stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.7" />
      <path d="M12.8 14 L11.2 14"   stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.7" />
      <path d="M9.5 17 L14.5 18"    stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.7" />
    </svg>
  );
}

// ─── Dashboard — 5 vertical bars + baseline ──────────────────
export function VodDashboardIcon({ size, color = "currentColor", className = "", style }: IconProps) {
  const s = size ?? defaults.size;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      {/* 5 bars of varying heights */}
      <path d="M5 19 L5 13"    stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8.5 19 L8.5 10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 19 L12 7"    stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M15.5 19 L15.5 11" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M19 19 L19 14"   stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      {/* Baseline */}
      <path d="M3 19 L21 19"    stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// ─── AI — neural network spiral ──────────────────────────────
export function VodAIIcon({ size, color = "currentColor", className = "", style }: IconProps) {
  const s = size ?? defaults.size;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      {/* Central node */}
      <circle cx="12" cy="12" r="2.5" stroke={color} strokeWidth="1.5" />
      {/* 3 curved branches */}
      <path d="M14.5 12 C17 10 18 8 16 6"  stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 9.5 C12 7 14 5 17 6"    stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 12 C7 10 6 8 8 6"      stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Small endpoint dots */}
      <circle cx="16" cy="6"  r="1" fill={color} />
      <circle cx="17" cy="6"  r="0.8" fill={color} opacity="0.5" />
      <circle cx="8"  cy="6"  r="1" fill={color} />
    </svg>
  );
}

// ─── Desktop (OS-shell monitor) ─────────────────────────────
export function VodDesktopIcon({ size, color = "currentColor", className = "", style }: IconProps) {
  const s = size ?? defaults.size;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      {/* Monitor frame */}
      <rect x="2" y="3" width="20" height="14" rx="2" stroke={color} strokeWidth="1.5" />
      {/* Screen inner */}
      <rect x="4" y="5" width="16" height="10" rx="1" fill={color} opacity="0.12" />
      {/* Stand */}
      <path d="M8 20 L16 20" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 17 L12 20" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      {/* Mini window in screen */}
      <rect x="6" y="7" width="5" height="3.5" rx="0.5" stroke={color} strokeWidth="0.8" opacity="0.7" />
      <rect x="13" y="7" width="5" height="6" rx="0.5" stroke={color} strokeWidth="0.8" opacity="0.5" />
      <rect x="6" y="11.5" width="5" height="2" rx="0.5" stroke={color} strokeWidth="0.8" opacity="0.4" />
    </svg>
  );
}

// ─── Map Marker HTML (raw HTML string, framework-agnostic) ───
/**
 * Returns an HTML string suitable for embedding in any map marker
 * element (MapLibre custom marker, divIcon, plain DOM node, etc).
 * kind: "object" | "subject" | "project"
 * color: CSS color string
 * size: icon container size in px
 * pulse: whether to show a pulsing ring animation
 *
 * Design: circular marker with glow ring + category inner symbol.
 */
export function makeMapMarkerHtml(
  kind: "object" | "subject" | "project",
  color: string,
  size = 32,
  pulse = false
): string {
  // Pulse rings
  const pulseHtml = pulse
    ? `
    <div style="
      position:absolute;
      inset:-6px;
      border-radius:50%;
      border:2px solid ${color};
      opacity:0.35;
      animation:vodMapPulse 2s ease-out infinite;
    "></div>
    <div style="
      position:absolute;
      inset:-12px;
      border-radius:50%;
      border:2px solid ${color};
      opacity:0.15;
      animation:vodMapPulse 2s ease-out infinite 0.7s;
    "></div>
    `
    : "";

  // Inner SVG symbol based on kind
  let innerSvg = "";
  if (kind === "object") {
    // 3 horizontal wavy lines (pipeline motif)
    innerSvg = `
      <path d="M3 5 C5.5 4 8.5 6 11 5"  stroke="white" stroke-width="1.4" stroke-linecap="round" fill="none" opacity="0.95"/>
      <path d="M3 8 C5.5 7 8.5 9 11 8"  stroke="white" stroke-width="1.4" stroke-linecap="round" fill="none" opacity="0.75"/>
      <path d="M3 11 C5.5 10 8.5 12 11 11" stroke="white" stroke-width="1.4" stroke-linecap="round" fill="none" opacity="0.55"/>
    `;
  } else if (kind === "subject") {
    // 3 concentric half-arcs (ripple motif)
    innerSvg = `
      <path d="M5 9 A2 2 0 0 1 9 9"   stroke="white" stroke-width="1.4" stroke-linecap="round" fill="none" opacity="0.95"/>
      <path d="M3.5 9 A3.5 3.5 0 0 1 10.5 9" stroke="white" stroke-width="1.3" stroke-linecap="round" fill="none" opacity="0.7"/>
      <path d="M2 9 A5 5 0 0 1 12 9"  stroke="white" stroke-width="1.2" stroke-linecap="round" fill="none" opacity="0.45"/>
      <circle cx="7" cy="9" r="0.9" fill="white" opacity="0.9"/>
    `;
  } else {
    // Flowing checkmark (project completion motif)
    innerSvg = `
      <path d="M2 8 C4 5 7 10 9 7"   stroke="white" stroke-width="1.4" stroke-linecap="round" fill="none" opacity="0.85"/>
      <path d="M8 6 L10 9 L14 3"     stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.95"/>
    `;
  }

  return `
    <div style="position:relative;width:${size}px;height:${size}px;cursor:pointer">
      ${pulseHtml}
      <div style="
        position:absolute;
        inset:0;
        border-radius:50%;
        background:${color};
        box-shadow:0 0 12px ${color}, 0 0 24px ${color}40;
        border:2px solid ${color}cc;
      "></div>
      <div style="
        position:absolute;
        inset:0;
        display:flex;
        align-items:center;
        justify-content:center;
      ">
        <svg width="${Math.round(size * 0.55)}" height="${Math.round(size * 0.55)}" viewBox="0 0 16 16" fill="none">
          ${innerSvg}
        </svg>
      </div>
    </div>
  `;
}

// ─── Globe marker (for Three.js / canvas annotations) ────────
export function makeGlobeMarkerSvg(color: string, size = 20): string {
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="${color}" stroke-width="1.5" />
      <circle cx="12" cy="12" r="4" fill="${color}" opacity="0.9" />
      <circle cx="12" cy="12" r="7" stroke="${color}" stroke-width="0.8" opacity="0.4" />
    </svg>
  `;
}
