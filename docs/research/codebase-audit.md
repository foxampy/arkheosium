# ArkheOSium — Codebase Audit

> Read-only audit. No source file was modified in producing this document.
> Scope: `src/` (77 pages, ~40 hooks, ~22 data modules), `docs/`.

---

## 1. Placeholder / mock / demo-data inventory

**473 matches across 79 files** for the pattern set
`Данные демонстрационные | демонстрационная телеметрия | симуляция | mock | Mock | fabricated | placeholder | TODO | заглушк | Скоро | В разработке`.

Note: a large share of matches in `src/components/ui/*` (`input.tsx`, `select.tsx`, `textarea.tsx`, `command.tsx`) are legitimate `placeholder` props on form primitives — those are **not** offenders and are excluded below.

### 1.1 The "demo data" footer stamp (highest-volume, highest-visibility)

Eleven module pages render a literal disclaimer in their page footer. This is the single most damaging class of placeholder because it appears on-screen, in Russian, on every module a visitor clicks through.

| File | Line | String |
|---|---|---|
| `src/pages/AgritechPage.tsx` | 85 | `© ArkheOSium — Planetary Infrastructure OS. Данные демонстрационные.` |
| `src/pages/CircularPage.tsx` | 76 | same |
| `src/pages/CityPage.tsx` | 96 | same |
| `src/pages/ClimatePage.tsx` | 78 | same |
| `src/pages/EnergyPage.tsx` | 80 | same |
| `src/pages/ObservatoryPage.tsx` | 82 | same |
| `src/pages/OpenSciencePage.tsx` | 73 | same |
| `src/pages/RoboticsPage.tsx` | 87 | same |
| `src/pages/TransportPage.tsx` | 76 | same |
| `src/pages/SensorsPage.tsx` | 67 | `© ArkheOSium · демонстрационная телеметрия (симуляция)` |
| `src/pages/SatellitePage.tsx` | ~14 | header comment: all data fabricated / mock — "presentation-grade demo" |

### 1.2 Highest-density files (match count)

| File | Count | Character of the placeholders |
|---|---|---|
| `src/data/catalog-data.ts` | 52 | Catalog entries with mock imagery/status fields |
| `src/pages/RoadmapPage.tsx` | 35 | Entire page composed of `Mockup` primitives explicitly labelled "fake pre-render UI" |
| `src/data/completed-projects-data.ts` | 35 | Fabricated "completed" project records |
| `src/pages/InvestApplicationPage.tsx` | 24 | Mostly form `placeholder` props (largely benign) |
| `src/i18n/locales/en.json` | 19 | Translation strings containing "Скоро"/"In development"/mock labels |
| `src/components/ProductCard.tsx` | 16 | Mock pricing/rating |
| `src/i18n/locales/ru.json` | 15 | as above |
| `src/pages/MessagesPage.tsx` | 14 | Mock conversation threads |
| `src/pages/ProjectHubPage.tsx` | 13 | `status: 'В разработке'`, `budget: '$2.1M'` |
| `src/pages/CatalogPage.tsx`, `ContactsPage.tsx`, `ProfilePage.tsx`, `DocumentsPage.tsx` | 12/12/12/8 | Mock records + "Скоро" affordances |
| `src/lib/web3.ts` | 11 | **Whole mock token/balance/transaction layer**, incl. a comment that it "would be replaced with real ABI" |
| `src/i18n/locales/uz.json`, `kk.json`, `ar.json` | 10 each | Untranslated / stub strings |
| `src/components/contact/ContactForm.tsx` | 10 | Mostly form placeholders |

### 1.3 Fabricated-numbers offenders (no disclaimer, presented as fact)

- `src/pages/OnboardingPage.tsx` — `ROLE_ACCESS_STATS`: `1 240+`, `380+`, `$4.2B`, `67`, `23`, `148`, `34`. None are sourced. Page also still renders the stale `VodpromLogo`.
- `src/pages/EcosystemPage.tsx` — fake urgency: hardcoded `Дедлайн: 30 июня 2026`, `Скоро закрытие` badge with `animate-pulse`.
- `src/pages/WaterRecoveryPage.tsx:343,346` — mock sea level (30 m) and mock basin geometry (8 km³ per metre) feed the page's *headline* recovery forecast.
- `src/pages/BlockchainPage.tsx:242` — hardcoded mock wallet address.
- `src/components/layout/Header.tsx:258` — alert badge hardcoded to `3` on every page.
- `src/pages/EcoJourneyPage.tsx:98` — `subtitle: 'Скоро'`.
- `src/pages/LandingPage.tsx` — `DevProgressBanner` publicly admits in-development status (dismissal persisted as `vodprom_dev_banner_dismissed`, a stale brand key).

---

## 2. Route / page map

77 page components under `src/pages/` (+ `src/pages/prototypes/`). Routing is centralised in `src/App.tsx`.

### 2.1 Nine pages most relevant to an "opportunities / onboarding" surface

1. **`OnboardingPage.tsx`** — role-selection funnel (investor / partner / researcher / municipality). Rich, already segmented by audience, already has a stats band and CTA structure. Carries fabricated `ROLE_ACCESS_STATS` and legacy Vodprom branding.
2. **`EcosystemPage.tsx`** — the closest thing to an opportunities board today: grant/programme cards, deadlines, urgency badges. All deadlines are hardcoded and already in the past-tense risk window.
3. **`EcoJourneyPage.tsx`** — narrative "journey" walkthrough; several steps stubbed with `subtitle: 'Скоро'`.
4. **`ProjectHubPage.tsx`** — project directory with `status`/`budget` fields; fabricated `В разработке` + `$2.1M`.
5. **`ProjectLabPage.tsx`** — lab/AI workspace (`src/components/lab/`), wired to `useLabChat` / `useLabSessions`.
6. **`EarthGlobePage.tsx`** — 3D entry point; owns an independent `OS_MODULES` registry that must be kept in sync with the header nav.
7. **`RoadmapPage.tsx`** — fully mockup-driven; useful as a *visual* reference only.
8. **`LandingPage.tsx` / `LandingPromoPage.tsx`** — public entry; `DevProgressBanner` lives here.
9. **`PresentationPage.tsx`** — deck-style surface built for demos; the natural host for polished, non-interactive storytelling.

### 2.2 Recommendation

Build the unified onboarding on **`OnboardingPage.tsx`**, not a new page.

Rationale: it is the only surface that already models *audience segmentation* (the hard part), already owns a hero → stats → role-cards → CTA layout, and is already routed and linked from `Header`/`CommandPalette`. The work reduces to (a) replacing `ROLE_ACCESS_STATS` with real or removed figures, (b) dropping `VodpromLogo`, (c) grafting the opportunities/contests feed in as a per-role section. Rebuilding on `EcosystemPage.tsx` would mean re-deriving role segmentation from scratch and inheriting its fake-deadline machinery.

---

## 3. Navigation registry

**File:** `F:\VODECO\ArkheOSium\src\components\layout\Header.tsx`

**Shape:**

```ts
type NavItem  = { nameKey: string; path: string; icon: LucideIcon; color: string; badge?: ...; label?: string };
type NavGroup = { id: string; title: string; items: NavItem[] };
const NAV_GROUPS: NavGroup[] = [ ... ];
```

A "Конкурсы, гранты, хакатоны" entry belongs in the **`infra`** group, adjacent to `/ecosystem`:

```ts
{ nameKey: 'nav.contests', path: '/contests', icon: Trophy, color: '#fbbf24', label: 'Конкурсы, гранты, хакатоны' }
```

**Four sibling surfaces must change in the same commit** or the app desyncs:

| Surface | File | What to add |
|---|---|---|
| Header nav | `src/components/layout/Header.tsx` | `NAV_GROUPS` → `infra.items` |
| Command palette | `src/components/CommandPalette.tsx` | `COMMANDS` → `{ label, path, group: 'Инфраструктура', icon, keywords }` |
| Route table | `src/App.tsx` | `<Route path="/contests" …>` + lazy import |
| Globe module grid | `src/pages/EarthGlobePage.tsx` | `OS_MODULES` entry |
| (optional) Mobile tabs | `src/components/layout/MobileTabBar.tsx` | only if it should be a primary tab |

---

## 4. Broken imports / type errors

`tsc --noEmit` reports, among others:

- **`TS2307` — Cannot find module `src/data/contest-data`** and **`src/data/hackathon-data`**. Neither file exists on disk (confirmed against the `src/data/` listing).
- **`TS2305` / `TS2339`** — missing named exports and property accesses downstream of the above.

### The `contest-data` question

`contestConfig` and `hackathonConfig` are referenced but **their backing modules do not exist**, and the config symbols themselves have **zero importers**. This is dead code, not a missing file that needs restoring.

**Recommendation:** do **not** resurrect `contest-data.ts` / `hackathon-data.ts` from the config stubs. The new contests page should ship its own real, sourced dataset (real programme names, real deadlines, real links). Delete the orphaned `contestConfig` / `hackathonConfig` references so `tsc` goes clean.

---

## 5. Paused / unfinished work

### 5.1 `docs/os-backlog-v2.md`

Open items remain across **P0, P1 and P2** tiers — the backlog was never burned down.

### 5.2 The explicit pause marker

`docs/os-backlog-v2.md` contains a **"⏸️ ПАУЗА — точка возобновления"** entry against the **Wave 1** block. This is the canonical resume point: work stopped mid-Wave-1 and was never restarted.

### 5.3 Uncommitted eco-presentation feature set

An entire feature set exists in the working tree with no corresponding commit:

- `src/components/eco/`
- `src/components/onboarding/`
- `src/components/os/`
- `src/components/lab/`
- 8 untracked pages, 4 untracked data modules, 5 untracked hooks, 3 untracked `src/lib/` files

**This is the highest-risk item in the repository.** Any careless `git checkout` / `git reset --hard` destroys it. It should be committed before any new work lands on top.

### 5.4 Presentation readiness blocked on credentials

`docs/KEYS-AND-ACCESS.md` tracks several presentation-readiness statuses that are blocked pending user-supplied API keys — these cannot be closed by code changes alone.

### 5.5 Never-closed plan

`docs/plans/` contains a **2026-07-14 phase-1 plan** that was opened and never marked complete.

---

## 6. SVG / canvas / visual asset inventory

### 6.1 Production-quality (keep, reuse)

| Asset | Notes |
|---|---|
| `NetworkMeshBackground` | Animated mesh; genuinely good ambient background |
| `VodIcons` | Coherent custom icon set |
| `AralOverlay` | Real geographic overlay |
| `StationBlueprint` | Detailed technical illustration |
| `WaterFlowDiagram` | Clear process diagram |
| `CleanGlobe` | Clean, reusable globe |
| `ROICalculator`, `WorldBankPanel` | recharts-based — real chart library, real axes, credible output |

### 6.2 Crude / placeholder-grade (replace or delete)

| Asset | Location | Problem |
|---|---|---|
| `Sparkline`, `GaugeArc`, `SkeletonMockup`, `MapMockup`, `SensorMockup`, `DashMockup`, `WaterMockup`, `HeatmapMockup`, `GenesisMockup`, `FleetMockup` | `src/pages/RoadmapPage.tsx` | Hand-rolled "fake pre-render UI" primitives; 35 placeholder matches in this one file |
| Static graph | `src/pages/KnowledgeGraphPage.tsx` | Nodes and edges hardcoded; no data binding |
| `MiniMap` | `src/pages/CatalogDetailPage.tsx:540` | Explicit placeholder standing in for a real map |

---

## Appendix — Top 10 offenders ranked by user visibility

1. Eleven module-page footers stamping `Данные демонстрационные` / `демонстрационная телеметрия (симуляция)` (Agritech, Circular, City, Climate, Energy, Observatory, OpenScience, Robotics, Transport, Sensors, Satellite).
2. `SatellitePage.tsx:14` — "all data is fabricated / mock — presentation-grade demo".
3. `RoadmapPage.tsx` — the whole page is `Mockup` primitives labelled "fake pre-render UI".
4. `EcosystemPage.tsx` — fake urgency: `Дедлайн: 30 июня 2026`, `Скоро закрытие` + `animate-pulse`.
5. `OnboardingPage.tsx` — fabricated `ROLE_ACCESS_STATS` (1 240+, 380+, $4.2B, 67, 23, 148, 34) + stale `VodpromLogo`.
6. `LandingPage.tsx` — `DevProgressBanner` publicly admits in-development status (`vodprom_dev_banner_dismissed`).
7. `src/lib/web3.ts` — entire mock token/balance/transaction layer ("would be replaced with real ABI"); `BlockchainPage.tsx:242` mock wallet address.
8. `WaterRecoveryPage.tsx:343,346` — mock sea level (30 m) and mock basin geometry (8 km³/m) driving a headline forecast.
9. `EcoJourneyPage.tsx:98` `subtitle: 'Скоро'`; `ProjectHubPage.tsx:18` `status: 'В разработке'`, `budget: '$2.1M'`.
10. `Header.tsx:258` — alert badge hardcoded to `3`, visible on every single page.
