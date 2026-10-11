# ARKHEOSIUM Phase 1 — Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Создать `F:/VODECO/arkheosium/` — полноценное PWA на базе vodprom с 3D-глобусом на главной, картой на /map, ребрендингом ARKHEOSIUM и навигацией 15 модулей.

**Architecture:** Копируем vodprom целиком → ребрендируем → заменяем главную страницу (WorldMapPage) на 3D-глобус (EarthGlobePage через @react-three/fiber) → WorldMapPage переезжает на /map → расширяем навигацию до 15 модулей ARKHEOSIUM → добавляем KnowledgeGraphPage (graphology + sigma.js).

**Tech Stack:** Vite + React 18 + TypeScript, @react-three/fiber + @react-three/drei (3D глобус), graphology + sigma.js (граф знаний), Tailwind CSS v4, shadcn/ui, Supabase, framer-motion, wouter, TanStack Query, vite-plugin-pwa.

---

## Файловая карта (новые/изменённые файлы)

```
arkheosium/
├── package.json                              ИЗМЕНИТЬ: name, добавить sigma/graphology
├── index.html                                ИЗМЕНИТЬ: title → ARKHEOSIUM
├── public/
│   └── manifest.json                         ИЗМЕНИТЬ: name → ARKHEOSIUM
├── src/
│   ├── App.tsx                               ИЗМЕНИТЬ: маршруты (/ = Globe, /map = Map)
│   ├── lib/
│   │   └── branding.ts                       ИЗМЕНИТЬ: VODPROM → ARKHEOSIUM
│   ├── pages/
│   │   ├── EarthGlobePage.tsx                СОЗДАТЬ: 3D глобус (главная)
│   │   ├── KnowledgeGraphPage.tsx            СОЗДАТЬ: граф знаний
│   │   └── SplashScreen.tsx                  ИЗМЕНИТЬ: текст → ARKHEOSIUM
│   └── components/
│       └── layout/
│           └── Header.tsx                    ИЗМЕНИТЬ: логотип + 15 модулей навигации
```

---

### Task 1: Скопировать vodprom → arkheosium/

**Files:**
- Create: `F:/VODECO/arkheosium/` (полная копия vodprom)

- [ ] **Step 1: Скопировать все файлы vodprom в новую папку**

```bash
cp -r F:/VODECO/vodprom/. F:/VODECO/arkheosium/
```

- [ ] **Step 2: Удалить dist/ и .vercel/ чтобы не путались**

```bash
rm -rf F:/VODECO/arkheosium/dist
rm -rf F:/VODECO/arkheosium/.vercel
```

- [ ] **Step 3: Проверить что файлы скопированы**

```bash
ls F:/VODECO/arkheosium/
```
Ожидаем: package.json, src/, public/, vite.config.ts, ...

---

### Task 2: Ребрендинг — package.json, index.html, manifest.json

**Files:**
- Modify: `arkheosium/package.json`
- Modify: `arkheosium/index.html`
- Modify: `arkheosium/public/manifest.json` (если есть)

- [ ] **Step 1: Обновить package.json**

Изменить `"name": "vodprom"` → `"name": "arkheosium"`.
Добавить в dependencies:
```json
"graphology": "^0.25.4",
"graphology-types": "^0.24.7",
"sigma": "^3.0.0",
"@sigma/utils": "^3.0.0"
```

- [ ] **Step 2: Обновить index.html**

```html
<title>ARKHEOSIUM — Planetary Infrastructure Intelligence OS</title>
```

- [ ] **Step 3: Обновить manifest.json**

```json
{
  "name": "ARKHEOSIUM",
  "short_name": "ARKHEOSIUM",
  "description": "Planetary Infrastructure Intelligence Operating System",
  "theme_color": "#050d1a",
  "background_color": "#050d1a"
}
```

---

### Task 3: Ребрендинг — branding.ts, SplashScreen.tsx

**Files:**
- Modify: `arkheosium/src/lib/branding.ts`
- Modify: `arkheosium/src/pages/SplashScreen.tsx`

- [ ] **Step 1: Обновить branding.ts**

```typescript
export const BRAND: Branding = {
  name: 'ARKHEOSIUM',
  tagline: 'Planetary Infrastructure Intelligence Operating System',
  logoSrc: '/logo.png',
  htmlTitle: 'ARKHEOSIUM — Planetary OS',
  metaDescription:
    'ARKHEOSIUM — глобальная цифровая операционная система управления инфраструктурой, ресурсами и развитием цивилизации.',
  primaryColor: '#00d4ff',
};
```

Убрать импорт `isGov` и тернарный оператор — оставить один объект.

- [ ] **Step 2: Обновить SplashScreen.tsx — текст**

Найти строки с "VODPROM" и заменить:
- `VODPROM` → `ARKHEOSIUM`
- `Платформенная экосистема экологии и воды` → `Planetary Infrastructure Intelligence OS`
- `Спасибо за участие в спасении экологии...` → `Цифровая основа следующего этапа развития цивилизации.`

- [ ] **Step 3: Добавить второй акцентный цвет violet в splash**

В CSS анимации splash добавить несколько частиц с `rgba(124, 58, 237, ...)` — фиолетовые (AI/Graph модули).

---

### Task 4: Создать EarthGlobePage.tsx — 3D глобус

**Files:**
- Create: `arkheosium/src/pages/EarthGlobePage.tsx`

- [ ] **Step 1: Создать файл с Three.js/R3F глобусом**

```typescript
// src/pages/EarthGlobePage.tsx
import { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Stars, OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useLocation } from 'wouter';

// Узлы инфраструктуры на глобусе (lat/lng → 3D coords)
const INFRA_NODES = [
  { id: 'aral',     lat: 45.0, lng: 59.5, label: 'Аральское море',   color: '#00d4ff', type: 'water'   },
  { id: 'amu',      lat: 40.0, lng: 62.0, label: 'Амударья',         color: '#00d4ff', type: 'water'   },
  { id: 'syr',      lat: 41.0, lng: 69.0, label: 'Сырдарья',         color: '#00d4ff', type: 'water'   },
  { id: 'tashkent', lat: 41.3, lng: 69.3, label: 'Ташкент',          color: '#7c3aed', type: 'city'    },
  { id: 'almaty',   lat: 43.3, lng: 76.9, label: 'Алматы',           color: '#7c3aed', type: 'city'    },
  { id: 'ashgabat', lat: 37.9, lng: 58.4, label: 'Ашхабад',          color: '#7c3aed', type: 'city'    },
];

function latLngToVec3(lat: number, lng: number, radius = 1.52): THREE.Vector3 {
  const phi   = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
     radius * Math.cos(phi),
     radius * Math.sin(phi) * Math.sin(theta),
  );
}

function InfraNode({ lat, lng, label, color }: typeof INFRA_NODES[0]) {
  const [hovered, setHovered] = useState(false);
  const pos = latLngToVec3(lat, lng);
  return (
    <group position={pos}>
      <mesh
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.018, 8, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={hovered ? 3 : 1.5} />
      </mesh>
      {hovered && (
        <Html center distanceFactor={4}>
          <div style={{
            background: 'rgba(5,13,26,0.92)',
            border: `1px solid ${color}40`,
            borderRadius: 8,
            padding: '4px 10px',
            color: '#fff',
            fontSize: 11,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}>
            {label}
          </div>
        </Html>
      )}
    </group>
  );
}

function Globe() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.04;
  });

  return (
    <group>
      {/* Земля */}
      <Sphere ref={meshRef} args={[1.5, 64, 64]}>
        <meshStandardMaterial
          color="#0a1628"
          emissive="#051020"
          emissiveIntensity={0.3}
          roughness={0.8}
          metalness={0.1}
          wireframe={false}
        />
      </Sphere>

      {/* Wireframe сетка поверх */}
      <Sphere args={[1.501, 36, 36]}>
        <meshBasicMaterial
          color="#00d4ff"
          wireframe
          transparent
          opacity={0.06}
        />
      </Sphere>

      {/* Атмосфера */}
      <Sphere args={[1.58, 32, 32]}>
        <meshStandardMaterial
          color="#001836"
          transparent
          opacity={0.25}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Узлы инфраструктуры */}
      {INFRA_NODES.map(node => (
        <InfraNode key={node.id} {...node} />
      ))}
    </group>
  );
}

function SceneLights() {
  return (
    <>
      <ambientLight intensity={0.15} />
      <directionalLight position={[5, 3, 5]} intensity={1.2} color="#ffffff" />
      <pointLight position={[-5, -3, -5]} intensity={0.3} color="#001836" />
      {/* Cyan rim light */}
      <pointLight position={[0, 4, 0]} intensity={0.8} color="#00d4ff" distance={8} />
    </>
  );
}

export default function EarthGlobePage() {
  const [, setLocation] = useLocation();

  return (
    <div className="fixed inset-0" style={{ background: '#030810' }}>
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 4], fov: 45 }}
        style={{ width: '100%', height: '100%' }}
      >
        <SceneLights />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={0.5} />
        <Suspense fallback={null}>
          <Globe />
        </Suspense>
        <OrbitControls
          enableZoom
          enablePan={false}
          minDistance={2.2}
          maxDistance={8}
          autoRotate={false}
          dampingFactor={0.08}
          enableDamping
        />
      </Canvas>

      {/* Оверлей: заголовок */}
      <div className="absolute top-16 left-0 right-0 flex flex-col items-center pointer-events-none">
        <p className="text-white/30 text-xs tracking-[0.3em] uppercase mb-1">Planetary OS</p>
        <h1 className="text-3xl font-black tracking-[0.15em] text-white/90">ARKHEOSIUM</h1>
        <p className="text-white/40 text-sm mt-1">Infrastructure Intelligence Operating System</p>
      </div>

      {/* Оверлей: статистика */}
      <div className="absolute bottom-8 left-4 right-4 flex justify-center gap-4 pointer-events-none">
        {[
          { label: 'Объектов',  value: '1,247', color: '#00d4ff' },
          { label: 'Проектов',  value: '84',    color: '#00d4ff' },
          { label: 'Регионов',  value: '47',    color: '#7c3aed' },
          { label: 'AI агентов', value: '12',   color: '#7c3aed' },
        ].map(s => (
          <div key={s.label}
            className="flex flex-col items-center px-4 py-2 rounded-xl"
            style={{ background: 'rgba(5,13,26,0.7)', border: `1px solid ${s.color}20`, backdropFilter: 'blur(12px)' }}
          >
            <span className="text-xl font-bold" style={{ color: s.color }}>{s.value}</span>
            <span className="text-white/40 text-xs mt-0.5">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Кнопка → карта */}
      <button
        onClick={() => setLocation('/map')}
        className="absolute bottom-8 right-4 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition"
        style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', color: '#00d4ff', backdropFilter: 'blur(12px)', pointerEvents: 'auto' }}
      >
        🗺 Открыть карту
      </button>
    </div>
  );
}
```

---

### Task 5: Обновить App.tsx — маршруты

**Files:**
- Modify: `arkheosium/src/App.tsx`

- [ ] **Step 1: Добавить импорты новых страниц**

```typescript
const EarthGlobePage     = lazy(() => import('@/pages/EarthGlobePage'));
const KnowledgeGraphPage = lazy(() => import('@/pages/KnowledgeGraphPage'));
```

- [ ] **Step 2: Изменить маршрут `/` → EarthGlobePage**

```typescript
<Route path="/">
  <EarthGlobePage />
</Route>
```

- [ ] **Step 3: Добавить `/map` → WorldMapPage (переименовать)**

```typescript
<Route path="/map">
  <MapPage />   {/* существующий WorldMapPage */}
</Route>
```

- [ ] **Step 4: Добавить `/graph` → KnowledgeGraphPage**

```typescript
<Route path="/graph">
  <KnowledgeGraphPage />
</Route>
```

---

### Task 6: Обновить Header.tsx — 15 модулей ARKHEOSIUM

**Files:**
- Modify: `arkheosium/src/components/layout/Header.tsx`

- [ ] **Step 1: Обновить NAV_GROUPS под ARKHEOSIUM структуру**

```typescript
const NAV_GROUPS: NavGroup[] = [
  {
    id: 'core',
    title: 'Ядро системы',
    items: [
      { nameKey: 'nav.earth',      path: '/',          icon: Globe2,         color: '#00d4ff', label: '🌍 Earth — Глобус' },
      { nameKey: 'nav.map',        path: '/map',        icon: Map,            color: '#06b6d4', label: '🗺 Карта' },
      { nameKey: 'nav.atlas',      path: '/analytics',  icon: BarChart2,      color: '#00e6c8', label: '📊 Atlas — Регионы' },
      { nameKey: 'nav.graph',      path: '/graph',      icon: Network,        color: '#7c3aed', label: '🕸 Knowledge Graph' },
    ],
  },
  {
    id: 'data',
    title: 'Данные',
    items: [
      { nameKey: 'nav.objects',    path: '/hub/objects',   icon: Building2,    color: '#4ade80', label: '🏗 Объекты' },
      { nameKey: 'nav.projects',   path: '/hub/projects',  icon: FolderOpen,   color: '#4ade80', label: '📁 Проекты' },
      { nameKey: 'nav.subjects',   path: '/hub/subjects',  icon: Users,        color: '#f472b6', label: '🏛 Субъекты' },
      { nameKey: 'nav.research',   path: '/rd',            icon: FlaskConical, color: '#f59e0b', label: '🔬 Research & R&D' },
    ],
  },
  {
    id: 'ai',
    title: 'AI & Интеллект',
    items: [
      { nameKey: 'nav.genesis',    path: '/workspace',     icon: Cpu,          color: '#7c3aed', label: '⚡ Genesis Engine' },
      { nameKey: 'nav.dashboard',  path: '/dashboard',     icon: LayoutDashboard, color: '#60a5fa', label: '📈 Дашборд' },
      { nameKey: 'nav.catalog',    path: '/catalog',       icon: BookOpen,     color: '#a78bfa', label: '⚙ Технологии' },
      { nameKey: 'nav.tech',       path: '/tech-marketplace', icon: ShoppingCart, color: '#f59e0b', label: '🏪 Маркетплейс' },
    ],
  },
  {
    id: 'infra',
    title: 'Инфраструктура',
    items: [
      { nameKey: 'nav.iot',        path: '/iot',           icon: Activity,     color: '#4ade80', label: '📡 Observatory / IoT' },
      { nameKey: 'nav.alerts',     path: '/alerts',        icon: Bell,         color: '#f87171', label: '🚨 Алерты' },
      { nameKey: 'nav.ecosystem',  path: '/ecosystem',     icon: Leaf,         color: '#4ade80', label: '🌿 Экосистема' },
    ],
  },
  {
    id: 'economy',
    title: 'Экономика & DAO',
    items: [
      { nameKey: 'nav.invest',     path: '/invest',        icon: TrendingUp,   color: '#fbbf24', label: '💰 Инвестиции' },
      { nameKey: 'nav.blockchain', path: '/blockchain',    icon: Cpu,          color: '#a78bfa', label: '⛓ DAO & Blockchain' },
      { nameKey: 'nav.marketplace',path: '/marketplace',   icon: Waves,        color: '#4ade80', label: '💧 Права на воду' },
    ],
  },
  {
    id: 'community',
    title: 'Сообщество',
    items: [
      { nameKey: 'nav.community',  path: '/community',     icon: Users,        color: '#f472b6', label: '👥 Сообщество' },
      { nameKey: 'nav.messages',   path: '/messages',      icon: MessageSquare,color: '#60a5fa', label: '💬 Сообщения' },
      { nameKey: 'nav.documents',  path: '/documents',     icon: FileText,     color: '#00e6c8', label: '📄 Документы' },
    ],
  },
  {
    id: 'account',
    title: 'Аккаунт',
    items: [
      { nameKey: 'nav.account',    path: '/account',       icon: User,         color: '#00e6c8', label: 'Профиль' },
      { nameKey: 'nav.settings',   path: '/settings',      icon: Settings,     color: '#94a3b8', label: 'Настройки' },
    ],
  },
];
```

- [ ] **Step 2: Обновить логотип в Header — имя ARKHEOSIUM**

```typescript
<span className="text-sm font-bold text-white/90 tracking-[0.08em] hidden sm:inline">
  ARKHEOSIUM
</span>
```

- [ ] **Step 3: Добавить импорты недостающих иконок**

```typescript
import { Globe2, Network, Building2 } from 'lucide-react';
```

---

### Task 7: Создать KnowledgeGraphPage.tsx

**Files:**
- Create: `arkheosium/src/pages/KnowledgeGraphPage.tsx`

- [ ] **Step 1: Создать страницу с sigma.js графом**

```typescript
// src/pages/KnowledgeGraphPage.tsx
import { useEffect, useRef } from 'react';
import Graph from 'graphology';
import Sigma from 'sigma';

// Начальные данные графа из существующих сущностей
function buildInitialGraph(): Graph {
  const graph = new Graph({ type: 'directed' });

  // Узлы — типы сущностей ARKHEOSIUM
  const nodes = [
    { id: 'aral-sea',   label: 'Аральское море',      type: 'object',   color: '#00d4ff', x: 0,   y: 0,    size: 20 },
    { id: 'amu-darya',  label: 'Амударья',             type: 'object',   color: '#00d4ff', x: 1,   y: -1,   size: 15 },
    { id: 'prj-001',    label: 'Восстановление Арала', type: 'project',  color: '#4ade80', x: -1,  y: 1,    size: 18 },
    { id: 'sub-001',    label: 'Минводхоз Узбекистан', type: 'subject',  color: '#f472b6', x: 2,   y: 1,    size: 12 },
    { id: 'tech-001',   label: 'Мембранная фильтрация', type: 'tech',    color: '#7c3aed', x: -2,  y: -1,   size: 10 },
    { id: 'research-1', label: 'Гидрология ЦА',        type: 'research', color: '#f59e0b', x: 0,   y: 2,    size: 10 },
    { id: 'invest-001', label: 'ADB $200M',            type: 'invest',   color: '#fbbf24', x: 1,   y: 2,    size: 14 },
    { id: 'charvak',    label: 'Чарвакское вдхр.',     type: 'object',   color: '#00d4ff', x: 3,   y: 0,    size: 16 },
    { id: 'sub-002',    label: 'МФСА',                 type: 'subject',  color: '#f472b6', x: -1,  y: -2,   size: 13 },
    { id: 'tech-002',   label: 'SCADA системы',        type: 'tech',     color: '#7c3aed', x: 2,   y: -2,   size: 9  },
  ];

  nodes.forEach(n => graph.addNode(n.id, n));

  // Рёбра — связи между сущностями
  const edges = [
    { from: 'amu-darya',  to: 'aral-sea',   label: 'питает'       },
    { from: 'prj-001',    to: 'aral-sea',   label: 'восстанавливает' },
    { from: 'prj-001',    to: 'amu-darya',  label: 'управляет'    },
    { from: 'sub-001',    to: 'prj-001',    label: 'финансирует'  },
    { from: 'tech-001',   to: 'prj-001',    label: 'применяется в' },
    { from: 'research-1', to: 'tech-001',   label: 'обосновывает' },
    { from: 'invest-001', to: 'prj-001',    label: 'инвестирует'  },
    { from: 'sub-002',    to: 'prj-001',    label: 'координирует' },
    { from: 'tech-002',   to: 'charvak',    label: 'мониторит'    },
    { from: 'sub-001',    to: 'charvak',    label: 'управляет'    },
  ];

  edges.forEach(e => graph.addEdge(e.from, e.to, { label: e.label, size: 2, color: 'rgba(255,255,255,0.15)' }));

  return graph;
}

export default function KnowledgeGraphPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sigmaRef = useRef<Sigma | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const graph = buildInitialGraph();
    const sigma = new Sigma(graph, containerRef.current, {
      renderEdgeLabels: false,
      defaultEdgeType: 'arrow',
      labelFont: 'system-ui',
      labelSize: 12,
      labelColor: { color: 'rgba(255,255,255,0.7)' },
      nodeProgramClasses: {},
    });

    sigmaRef.current = sigma;

    return () => {
      sigma.kill();
    };
  }, []);

  // Типы — легенда
  const TYPES = [
    { label: 'Объект',       color: '#00d4ff' },
    { label: 'Проект',       color: '#4ade80' },
    { label: 'Субъект',      color: '#f472b6' },
    { label: 'Технология',   color: '#7c3aed' },
    { label: 'Исследование', color: '#f59e0b' },
    { label: 'Инвестиция',   color: '#fbbf24' },
  ];

  return (
    <div className="fixed inset-0 flex flex-col" style={{ background: '#030810', paddingTop: 56 }}>
      {/* Заголовок */}
      <div className="px-4 py-3 flex items-center justify-between shrink-0"
        style={{ background: 'rgba(5,13,26,0.8)', borderBottom: '1px solid rgba(0,212,255,0.1)', backdropFilter: 'blur(12px)' }}>
        <div>
          <h1 className="text-white font-bold text-base tracking-wide">Knowledge Graph</h1>
          <p className="text-white/40 text-xs">Граф знаний экосистемы ARKHEOSIUM</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          {TYPES.map(t => (
            <div key={t.label} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: t.color }} />
              <span className="text-white/50 text-xs">{t.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Граф */}
      <div ref={containerRef} className="flex-1" style={{ cursor: 'grab' }} />
    </div>
  );
}
```

---

### Task 8: npm install + проверка сборки

**Files:** нет

- [ ] **Step 1: Установить зависимости**

```bash
cd F:/VODECO/arkheosium && npm install
```

- [ ] **Step 2: Добавить sigma/graphology если не установились**

```bash
npm install graphology graphology-types sigma
```

- [ ] **Step 3: Запустить dev-сервер и проверить**

```bash
npm run dev
```
Открыть `http://localhost:5173` — должен появиться 3D-глобус.

- [ ] **Step 4: Проверить /map**

Перейти на `/map` — должна открыться существующая карта водпром без изменений.

- [ ] **Step 5: Проверить /graph**

Перейти на `/graph` — должен открыться граф знаний.

---

### Task 9: Git init + Vercel config

**Files:**
- Create: `arkheosium/.gitignore`
- Create: `arkheosium/vercel.json`
- Create: `arkheosium/.env.example`

- [ ] **Step 1: Git init**

```bash
cd F:/VODECO/arkheosium && git init && git add -A
```

- [ ] **Step 2: Создать vercel.json**

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

- [ ] **Step 3: Первый коммит**

```bash
git commit -m "feat: init ARKHEOSIUM — planetary OS based on vodprom

- Copied vodprom as foundation (all components, hooks, Supabase, PWA)
- Rebranded: VODPROM → ARKHEOSIUM
- Main page: 3D Earth Globe (Three.js/R3F)
- /map: existing WorldMapPage (unchanged)
- /graph: Knowledge Graph Explorer (graphology + sigma.js)
- Navigation: 15 ARKHEOSIUM modules
- Colors: cyan #00d4ff (infra) + violet #7c3aed (AI/Graph)"
```
