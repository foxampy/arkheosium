import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LayoutGrid } from 'lucide-react';
import type { OSModule } from './OSDesktop';

/**
 * Телефон: вместо свободного рабочего стола (плитки на маленьком экране налезали друг на друга)
 * — одна кнопка «Модули» и аккуратная сетка в выдвижной панели. Глобус остаётся свободным.
 */
export default function MobileModules({ modules, onNavigate }: { modules: readonly OSModule[]; onNavigate: (path: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="absolute z-30 left-4 top-[132px] flex items-center gap-2 px-3.5 py-2 rounded-full pointer-events-auto active:scale-95"
        style={{ background: 'rgba(5,13,26,0.85)', border: '1px solid rgba(0,230,200,0.35)', color: '#00e6c8', backdropFilter: 'blur(20px)' }}
      >
        <LayoutGrid size={15} />
        <span className="text-[12px] font-semibold">Модули · {modules.length}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-[200] flex flex-col" style={{ background: 'rgba(2,8,18,0.96)', backdropFilter: 'blur(14px)' }}
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }} transition={{ duration: 0.2 }}>
            <div className="flex items-center justify-between px-5 pt-[72px] pb-3">
              <span className="text-white text-lg font-bold">Модули ARKHEOSIUM</span>
              <button onClick={() => setOpen(false)} aria-label="Закрыть" className="w-9 h-9 rounded-full flex items-center justify-center" style={{ border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)' }}>
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-28">
              <div className="grid grid-cols-4 gap-x-2 gap-y-4">
                {modules.map(({ Icon, label, path, color }) => (
                  <button key={path} onClick={() => { setOpen(false); onNavigate(path); }} className="flex flex-col items-center gap-1.5 active:scale-95">
                    <span className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: `${color}14`, border: `1px solid ${color}44`, color }}>
                      <Icon size={24} />
                    </span>
                    <span className="text-[11px] leading-tight text-white/75 text-center w-full truncate">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
