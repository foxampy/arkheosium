---
name: Hyper-Glass Planetary OS
colors:
  surface: '#081421'
  surface-dim: '#081421'
  surface-bright: '#2e3a48'
  surface-container-lowest: '#040f1b'
  surface-container-low: '#101c29'
  surface-container: '#15202d'
  surface-container-high: '#1f2b38'
  surface-container-highest: '#2a3643'
  on-surface: '#d7e3f5'
  on-surface-variant: '#b9cacb'
  inverse-surface: '#d7e3f5'
  inverse-on-surface: '#26313f'
  outline: '#849495'
  outline-variant: '#3a494b'
  surface-tint: '#00dbe7'
  primary: '#e1fdff'
  on-primary: '#00363a'
  primary-container: '#00f2ff'
  on-primary-container: '#006a71'
  inverse-primary: '#00696f'
  secondary: '#f5fff4'
  on-secondary: '#00391f'
  secondary-container: '#16ff9e'
  on-secondary-container: '#007243'
  tertiary: '#fcf5ff'
  on-tertiary: '#3c0090'
  tertiary-container: '#e3d4ff'
  on-tertiary-container: '#7318ff'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#74f5ff'
  primary-fixed-dim: '#00dbe7'
  on-primary-fixed: '#002022'
  on-primary-fixed-variant: '#004f54'
  secondary-fixed: '#56ffa8'
  secondary-fixed-dim: '#00e38b'
  on-secondary-fixed: '#002110'
  on-secondary-fixed-variant: '#00522f'
  tertiary-fixed: '#e9ddff'
  tertiary-fixed-dim: '#d1bcff'
  on-tertiary-fixed: '#23005b'
  on-tertiary-fixed-variant: '#5700c9'
  background: '#081421'
  on-background: '#d7e3f5'
  surface-variant: '#2a3643'
typography:
  display-lg:
    fontFamily: Sora
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Sora
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Sora
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-md:
    fontFamily: Sora
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.05em
  label-xs:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '700'
    lineHeight: '1'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin-edge: 40px
  panel-gap: 16px
---

## Brand & Style

The design system embodies a "Planetary OS" aesthetic, moving beyond traditional HUDs into a high-fidelity **Hyper-Glass** environment. It is designed for high-stakes planetary monitoring and complex systems management, evoking a sense of absolute precision, immense scale, and advanced intelligence. 

The visual style is characterized by:
- **Spatial Depth:** A multi-layered architecture where information floats in a 3D coordinate space.
- **Materiality:** Deep obsidian glass with varying levels of refraction, frosted blurs, and a microscopic noise grain that gives digital surfaces a physical, high-end optical quality.
- **Atmospheric Glow:** Interactive elements emit organic cyan and emerald light, simulating phosphorescent energy rather than flat digital colors.
- **Technical Elegance:** A blend of Brutalist structural integrity with Minimalist refined details, utilizing hairline borders and monospaced data accents.

## Colors

The palette is rooted in the "Deep Obsidian" void, providing a high-contrast foundation for luminous data visualization.

- **Base Surface:** `#000814` (Deep Obsidian). Used for the lowest layer of the interface.
- **Primary Accent:** `#00f2ff` (Vibrant Cyan). Reserved for active states, primary data streams, and core interactions.
- **Success/Growth:** `#00ff9d` (Emerald). Used for positive status indicators, biological data, and secondary system pathways.
- **Alert/Override:** `#ff3e3e` (Pulse Red). Used sparingly for critical system failures.
- **Glass Tint:** Semi-transparent variants of the primary cyan (`rgba(0, 242, 255, 0.05)`) are used to tint background blurs, creating a cohesive "atmospheric" feel.

## Typography

This design system utilizes a dual-font strategy to balance human-centric legibility with machine-like precision.

- **Sora:** The primary typeface for all narrative and structural elements. It provides a geometric yet warm tone that feels futuristic. Use Bold/ExtraBold for high-level "Planetary" metrics.
- **JetBrains Mono:** The "Data Layer." Every numerical value, timestamp, coordinate, or technical label must be rendered in JetBrains Mono. This reinforces the "OS" aspect of the system.
- **Micro-type:** Technical labels (label-xs) should always be uppercase with generous letter spacing to ensure legibility on translucent backgrounds.

## Layout & Spacing

The layout follows a **Fluid Spatial Grid** designed for edge-to-edge immersion.

- **Grid System:** A 12-column grid for desktop with 24px gutters. Elements do not sit on a solid background; they float.
- **Margins:** Large 40px outer margins create a "viewport" effect, framing the planetary data.
- **Mobile Reflow:** On mobile, the 12-column grid collapses to a 4-column system. Spatial depth is maintained through vertical stacking and varying blur intensities rather than horizontal spread.
- **Rhythm:** All spacing must be multiples of 4px. Use wider gaps between disparate system modules to maintain the "floating" feeling.

## Elevation & Depth

Hierarchy is established through **Refractive Stacking** rather than traditional drop shadows.

- **Layer 0 (Void):** The background (#000814) with a subtle, fixed noise texture (2% opacity).
- **Layer 1 (Sub-surface):** Large containers with a 40px backdrop blur and 10% opacity white fill.
- **Layer 2 (Active Panels):** 60px backdrop blur, 15% opacity primary color tint, and a 0.5px "hairline" border (`rgba(255,255,255,0.1)`).
- **Layer 3 (Modals/Pop-overs):** 80px backdrop blur, 20% opacity fill, and a secondary inner glow (1px stroke) using the Primary Cyan.
- **Depth Cues:** Elements at higher elevations should have a slightly sharper noise texture and a more vibrant border glow.

## Shapes

The shape language is "Soft-Industrial"—highly structured but with enough radius to feel engineered rather than sharp.

- **Standard Radius:** 0.25rem (4px) for most interactive components (buttons, inputs).
- **Container Radius:** 0.75rem (12px) for major glass panels to suggest a "lens" or "screen" feel.
- **Interactive States:** When hovered, buttons should not just change color but "expand" slightly (1-2px) via an inner glow rather than a physical scale change.
- **Clipping:** All glass panels must use hard clipping for content to maintain the illusion of a solid glass slab.

## Components

- **Hyper-Glass Buttons:** Transparent backgrounds with a 1px Cyan hairline border. On hover, a 15% Cyan fill fades in with a 20px outer "organic" glow. Text remains Sora SemiBold.
- **Data Chips:** Small JetBrains Mono capsules with a solid Emerald or Cyan background (at 20% opacity) and high-contrast text. Use for status flags.
- **Telemetry Lists:** Use "Zebra-stripping" with 5% white opacity variations. Every row ends with a micro-sparkline or a flickering status dot.
- **Control Inputs:** Input fields should be "Underlined" style or fully enclosed in 5% glass boxes. The caret should be a 2px thick Cyan block that blinks with a soft fade.
- **Planetary Cards:** Use a 0.5px border and a subtle top-down gradient (White at 10% to Transparent). Headlines inside cards should have -0.02em letter spacing.
- **System HUD Gauges:** Circular progress indicators using "Conic Gradients" from Deep Blue to Vibrant Cyan. Use hair-thin stroke widths (1px or 1.5px).