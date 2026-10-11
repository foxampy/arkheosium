// src/components/dashboard/WidgetWrapper.tsx
import { ReactNode } from 'react';
import { X, GripVertical, Settings } from 'lucide-react';
import { useDashboardStore } from '@/store/dashboardStore';

interface Props {
  id: string;
  title: string;
  editMode: boolean;
  children: ReactNode;
  onSettings?: () => void;
}

export function WidgetWrapper({ id, title, editMode, children, onSettings }: Props) {
  const { removeWidget } = useDashboardStore();
  return (
    <div className="h-full flex flex-col rounded-2xl border border-white/8 bg-black/40 backdrop-blur-md overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/6">
        <div className="flex items-center gap-2">
          {editMode && (
            <span className="drag-handle cursor-grab active:cursor-grabbing text-white/30 hover:text-white/60">
              <GripVertical size={14} />
            </span>
          )}
          <span className="text-xs font-semibold text-white/60 uppercase tracking-widest">{title}</span>
        </div>
        {editMode && (
          <div className="flex items-center gap-1.5">
            {onSettings && (
              <button onClick={onSettings}
                className="p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/80 transition-colors">
                <Settings size={12} />
              </button>
            )}
            <button onClick={() => removeWidget(id)}
              className="p-1 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors">
              <X size={12} />
            </button>
          </div>
        )}
      </div>
      {/* Content */}
      <div className="flex-1 overflow-hidden p-4">
        {children}
      </div>
    </div>
  );
}
