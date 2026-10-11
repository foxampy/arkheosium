// src/components/dashboard/WidgetGrid.tsx
import { useCallback } from 'react';
import GridLayout from 'react-grid-layout';
import type { Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { useDashboardStore } from '@/store/dashboardStore';
import { useDashboardLayout } from '@/hooks/useDashboardLayout';
import { WidgetWrapper } from './WidgetWrapper';
import { KPIWidget } from './widgets/KPIWidget';
import { MapMiniWidget } from './widgets/MapMiniWidget';
import { PipelineWidget } from './widgets/PipelineWidget';
import { TimelineWidget } from './widgets/TimelineWidget';
import { TokenWidget } from './widgets/TokenWidget';
import { AlertsWidget } from './widgets/AlertsWidget';
import { ActivityWidget } from './widgets/ActivityWidget';
import { RegionChartWidget } from './widgets/RegionChartWidget';
import type { WidgetType, WidgetConfig } from '@/store/dashboardStore';

function renderWidget(cfg: WidgetConfig) {
  const type = cfg.type as WidgetType;
  const s = cfg.settings ?? {};
  switch (type) {
    case 'kpi':           return <KPIWidget metric={s.metric as any ?? 'objects'} />;
    case 'map-mini':      return <MapMiniWidget />;
    case 'pipeline':      return <PipelineWidget />;
    case 'timeline':      return <TimelineWidget />;
    case 'token':         return <TokenWidget />;
    case 'alerts':        return <AlertsWidget />;
    case 'activity':      return <ActivityWidget />;
    case 'region-chart':  return <RegionChartWidget />;
    default:              return <div className="text-white/30 text-xs p-4">Widget: {type}</div>;
  }
}

const WIDGET_TITLES: Record<WidgetType, string> = {
  'kpi': 'KPI', 'map-mini': 'Карта', 'pipeline': 'Пайплайн',
  'timeline': 'История', 'token': 'VOD Token', 'alerts': 'Алерты',
  'activity': 'Активность', 'news': 'Новости', 'weather': 'Погода / Засуха',
  'invest': 'Инвестиции', 'object-status': 'Статус объектов', 'region-chart': 'Регионы',
};

export function WidgetGrid({ width }: { width: number }) {
  const { layouts, widgets, editMode, setLayouts } = useDashboardStore();
  const { save } = useDashboardLayout();

  const onLayoutChange = useCallback((newLayout: Layout[]) => {
    setLayouts(newLayout);
  }, [setLayouts]);

  return (
    <GridLayout
      className="layout"
      layout={layouts}
      cols={12}
      rowHeight={60}
      width={width}
      onLayoutChange={onLayoutChange}
      onDragStop={save}
      onResizeStop={save}
      isDraggable={editMode}
      isResizable={editMode}
      draggableHandle=".drag-handle"
      margin={[12, 12]}
    >
      {widgets.map(cfg => (
        <div key={cfg.id}>
          <WidgetWrapper
            id={cfg.id}
            title={WIDGET_TITLES[cfg.type] ?? cfg.type}
            editMode={editMode}
          >
            {renderWidget(cfg)}
          </WidgetWrapper>
        </div>
      ))}
    </GridLayout>
  );
}
