// src/store/dashboardStore.ts
import { create } from 'zustand';
import type { Layout } from 'react-grid-layout';

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title?: string;
  settings?: Record<string, unknown>;
}

export type WidgetType =
  | 'kpi' | 'map-mini' | 'pipeline' | 'alerts'
  | 'activity' | 'invest' | 'news' | 'token'
  | 'weather' | 'timeline' | 'object-status' | 'region-chart';

interface DashboardState {
  editMode: boolean;
  layouts: Layout[];
  widgets: WidgetConfig[];
  catalogueOpen: boolean;
  setEditMode: (v: boolean) => void;
  setLayouts: (l: Layout[]) => void;
  setWidgets: (w: WidgetConfig[]) => void;
  addWidget: (type: WidgetType) => void;
  removeWidget: (id: string) => void;
  setCatalogueOpen: (v: boolean) => void;
}

const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: 'kpi-objects', type: 'kpi', settings: { metric: 'objects' } },
  { id: 'kpi-projects', type: 'kpi', settings: { metric: 'projects' } },
  { id: 'kpi-portfolio', type: 'kpi', settings: { metric: 'portfolio' } },
  { id: 'kpi-capacity', type: 'kpi', settings: { metric: 'capacity' } },
  { id: 'map-mini-1', type: 'map-mini' },
  { id: 'pipeline-1', type: 'pipeline' },
  { id: 'timeline-1', type: 'timeline' },
  { id: 'token-1', type: 'token' },
];

const DEFAULT_LAYOUT: Layout[] = [
  { i: 'kpi-objects',  x: 0, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
  { i: 'kpi-projects', x: 3, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
  { i: 'kpi-portfolio',x: 6, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
  { i: 'kpi-capacity', x: 9, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
  { i: 'map-mini-1',   x: 0, y: 2, w: 6, h: 6, minW: 4, minH: 4 },
  { i: 'pipeline-1',  x: 6, y: 2, w: 6, h: 4, minW: 4, minH: 3 },
  { i: 'timeline-1',  x: 6, y: 6, w: 6, h: 4, minW: 4, minH: 3 },
  { i: 'token-1',     x: 0, y: 8, w: 6, h: 4, minW: 3, minH: 3 },
];

export const useDashboardStore = create<DashboardState>((set, get) => ({
  editMode: false,
  layouts: DEFAULT_LAYOUT,
  widgets: DEFAULT_WIDGETS,
  catalogueOpen: false,
  setEditMode: (v) => set({ editMode: v }),
  setLayouts: (l) => set({ layouts: l }),
  setWidgets: (w) => set({ widgets: w }),
  addWidget: (type) => {
    const id = `${type}-${Date.now()}`;
    const newWidget: WidgetConfig = { id, type };
    const newLayout: Layout = { i: id, x: 0, y: Infinity, w: 4, h: 4, minW: 2, minH: 2 };
    set((s) => ({
      widgets: [...s.widgets, newWidget],
      layouts: [...s.layouts, newLayout],
    }));
  },
  removeWidget: (id) => set((s) => ({
    widgets: s.widgets.filter(w => w.id !== id),
    layouts: s.layouts.filter(l => l.i !== id),
  })),
  setCatalogueOpen: (v) => set({ catalogueOpen: v }),
}));
