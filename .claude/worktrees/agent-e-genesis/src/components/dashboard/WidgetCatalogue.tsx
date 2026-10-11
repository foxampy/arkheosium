// src/components/dashboard/WidgetCatalogue.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { X, BarChart2, Map, Bell, Coins, Activity, TrendingUp, Clock, Droplets, Globe2 } from 'lucide-react';
import { useDashboardStore, WidgetType } from '@/store/dashboardStore';

const CATALOGUE: { type: WidgetType; label: string; desc: string; Icon: any }[] = [
  { type: 'kpi', label: 'KPI-карточка', desc: 'Один ключевой показатель со спарклайном', Icon: TrendingUp },
  { type: 'map-mini', label: 'Карта объектов', desc: 'Интерактивная мини-карта мира', Icon: Map },
  { type: 'pipeline', label: 'Пайплайн проектов', desc: 'Воронка стадий проектов', Icon: BarChart2 },
  { type: 'token', label: 'VOD Token', desc: 'Статус пресейла и токеномика', Icon: Coins },
  { type: 'alerts', label: 'Алерты воды', desc: 'Real-time предупреждения о качестве', Icon: Bell },
  { type: 'activity', label: 'Активность', desc: 'Лента действий на платформе', Icon: Activity },
  { type: 'timeline', label: 'История компании', desc: 'Ключевые вехи 2003–2028', Icon: Clock },
  { type: 'region-chart', label: 'График регионов', desc: 'Инвестиции по регионам мира', Icon: Globe2 },
  { type: 'object-status', label: 'Статус объектов', desc: 'Текущий статус мониторинга', Icon: Droplets },
];

export function WidgetCatalogue() {
  const { catalogueOpen, setCatalogueOpen, addWidget } = useDashboardStore();
  return (
    <AnimatePresence>
      {catalogueOpen && (
        <>
          <motion.div className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setCatalogueOpen(false)} />
          <motion.div
            className="fixed right-0 top-0 h-full w-80 bg-[#000818]/95 backdrop-blur-xl border-l border-white/10 z-50 flex flex-col"
            initial={{ x: 320 }} animate={{ x: 0 }} exit={{ x: 320 }}
            transition={{ type: 'spring', damping: 24, stiffness: 200 }}>
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h3 className="font-semibold text-white">Каталог виджетов</h3>
              <button onClick={() => setCatalogueOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white">
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {CATALOGUE.map(({ type, label, desc, Icon }) => (
                <button key={type}
                  onClick={() => { addWidget(type); setCatalogueOpen(false); }}
                  className="w-full flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5
                    hover:border-cyan-400/30 transition-all text-left group">
                  <div className="p-2 rounded-lg bg-cyan-400/10 text-cyan-400 group-hover:bg-cyan-400/20">
                    <Icon size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/90">{label}</p>
                    <p className="text-xs text-white/40 mt-0.5">{desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
