---
name: ArkheOS Digital Twin System
colors:
  surface: '#031427'
  surface-dim: '#031427'
  surface-bright: '#2a3a4f'
  surface-container-lowest: '#000f21'
  surface-container-low: '#0b1c30'
  surface-container: '#102034'
  surface-container-high: '#1b2b3f'
  surface-container-highest: '#26364a'
  on-surface: '#d3e4fe'
  on-surface-variant: '#b9cacb'
  inverse-surface: '#d3e4fe'
  inverse-on-surface: '#213145'
  outline: '#849495'
  outline-variant: '#3a494b'
  surface-tint: '#00dbe7'
  primary: '#e1fdff'
  on-primary: '#00363a'
  primary-container: '#00f2ff'
  on-primary-container: '#006a71'
  inverse-primary: '#00696f'
  secondary: '#ffffff'
  on-secondary: '#003827'
  secondary-container: '#3cffc0'
  on-secondary-container: '#007353'
  tertiary: '#f8f6ff'
  on-tertiary: '#2d2f40'
  tertiary-container: '#d8d9ef'
  on-tertiary-container: '#5c5e71'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#74f5ff'
  primary-fixed-dim: '#00dbe7'
  on-primary-fixed: '#002022'
  on-primary-fixed-variant: '#004f54'
  secondary-fixed: '#3cffc0'
  secondary-fixed-dim: '#00e1a6'
  on-secondary-fixed: '#002115'
  on-secondary-fixed-variant: '#00513a'
  tertiary-fixed: '#e0e1f7'
  tertiary-fixed-dim: '#c3c5db'
  on-tertiary-fixed: '#181b2a'
  on-tertiary-fixed-variant: '#434657'
  background: '#031427'
  on-background: '#d3e4fe'
  surface-variant: '#26364a'
  space-void: '#05070F'
  infrastructure-silver: '#E2E8F0'
  solar-gold: '#FFD700'
  trust-blue: '#007AFF'
  warning-red: '#FF4D4D'
typography:
  display-xl:
    fontFamily: Sora
    fontSize: 64px
    fontWeight: '700'
    lineHeight: 72px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Sora
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Sora
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-xs:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.1em
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
  margin-desktop: 64px
  margin-mobile: 16px
  panel-padding: 20px
---

## Brand & Style
The design system embodies the concept of a "Civilizational Operating System"—a high-fidelity, planetary-scale interface designed for the management of global infrastructure, AI engineering, and Web3 transparency. It is visionary, scientific, and authoritative, positioning the user as an architect of the future.

The visual style is **Glassmorphic** with a **Planetary OS** influence. It utilizes deep spatial depth, cinematic lighting, and a "HUD" (Heads-Up Display) aesthetic. The interface should feel like a thin, sophisticated layer of intelligence floating over complex data. Key characteristics include:
- **Cinematic Depth:** Using Z-axis layering to represent hierarchy, from subsurface geological data to atmospheric satellite telemetry.
- **Technical Precision:** High-contrast accents and micro-thin lines (0.5px) that evoke engineering blueprints.
- **Luminescence:** Strategic use of "glow" to indicate active data streams, "trusted" cryptographic blocks, and energy flow.

## Colors
The palette is rooted in the "Deep Space" aesthetic, utilizing a dark-mode-only foundation to ensure that glowing data elements achieve maximum pop.

- **Primary (Cyan Glow):** Used for interactive elements, primary call-to-actions, and "active" system states. It represents the interface's intelligence.
- **Secondary (Bioluminescent Green):** Reserved for ecological data, sustainability indicators, and "healthy" infrastructure status.
- **Tertiary (Deep Space Blue):** The core canvas color, providing a rich, cinematic background that recedes to create depth.
- **Neutral (Slate/Silver):** Used for secondary text, borders, and structural UI elements that should not distract from primary data.

**Functional Color Application:**
- **Solar Gold:** Specifically for energy grids and power-related telemetry.
- **Trust Blue:** Used for cryptographic signatures, blockchain hashes, and verified "immutable" data.
- **Warning Red:** Used sparingly for anthropogenic load indicators or critical sensor failures.

## Typography
Typography bridges the gap between cinematic storytelling and rigorous engineering data.

- **Display & Headlines:** **Sora** provides a futuristic, geometric feel with high-tech personality. Use large scales for "Genesis Engine" prompts and planetary titles.
- **Body:** **Inter** is used for maximum legibility in complex reports, Object Passports, and BIM documentation.
- **Technical Data:** **JetBrains Mono** is mandatory for all telemetry, coordinates, hashes, and code-based inputs. It conveys a "machine-readable" aesthetic.

**Typographic Hierarchy:**
- Use **label-xs** for metadata tags and sensor IDs.
- Use **data-mono** for any value that is subject to real-time updates.
- Maintain wide letter-spacing on mono fonts to enhance the "technical instrument" feel.

## Layout & Spacing
The layout follows a **Fluid HUD** model. The primary canvas is a 3D environment (the Earth), with UI "panels" docked to the edges or floating as glassmorphic overlays.

- **Grid:** A 12-column fluid grid for dashboard views, with generous 24px gutters to allow the background "world" to remain visible between components.
- **Density:** High information density in sidebars (Project Management) contrasted with vast whitespace in the central viewport.
- **Breakpoints:**
  - **Mobile (<768px):** Single column, bottom-sheet navigation for sensor data.
  - **Tablet (768px - 1280px):** Collapsible side panels; focused data views.
  - **Desktop (>1280px):** Persistent Knowledge Graph overlays and multi-pane telemetry displays.

## Elevation & Depth
Depth in this design system is semantic, mapping directly to physical and digital "layers" of infrastructure.

- **Layer 0 (Background):** The "Space Void" or the 3D globe.
- **Layer 1 (Subsurface):** Dark, semi-transparent panels representing underground/underwater systems.
- **Layer 2 (Surface):** Default UI panels with a 10% white tint and 20px backdrop blur (Glassmorphism).
- **Layer 3 (Atmospheric):** High-brightness HUD elements, floating tooltips, and "Active" state glows.

**Shadows & Outlines:**
Instead of traditional drop shadows, use **Outer Glows** tinted with the primary Cyan or secondary Green to indicate elevation. Apply 0.5px borders (Infrastructure Silver at 20% opacity) to all panels to define edges without adding visual weight.

## Shapes
The shape language is a mix of **Structured Geometry** for man-made elements and **Fluid Organicism** for natural resources.

- **UI Containers:** Use "Soft" (0.25rem) roundedness for a modern, hardware-module feel. Avoid fully rounded corners unless used for specific status "pills."
- **Data Nodes:** Knowledge Graph nodes should be perfect circles for natural entities and hard-edged diamonds for engineering/technical entities.
- **Interactive Strips:** Buttons and inputs should have clipped or subtly chamfered corners to reinforce the "industrial engineering" aesthetic.

## Components
- **Buttons:** Use "Glass Buttons" with a 1px Cyan border and a subtle inner glow on hover. Text should be **label-xs** for a technical feel.
- **Input Fields:** Minimalist underlines or thin-bordered boxes with JetBrains Mono text. On focus, the border should pulse with a Cyan glow.
- **Cards/Panels:** Utilize backdrop-filter: blur(20px). Backgrounds are #080B1A at 60% opacity. Headers should have a subtle 1px "separator" line.
- **Data Chips:** Small, pill-shaped indicators for Web3 status (e.g., "VERIFIED" in Trust Blue).
- **Knowledge Graph Nodes:** Circular markers with "connecting filaments" (thin lines). Active filaments should animate like flowing data.
- **FoxampyForge Modules:** Rugged, industrial-style containers for telemetry feeds, featuring "exposed" corner accents or bracket-style borders.