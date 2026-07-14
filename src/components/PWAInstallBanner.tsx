import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

export function PWAInstallBanner() {
  const { showBanner, install, dismissBanner } = usePWA();

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:bottom-4 sm:w-80 z-[9500] rounded-2xl overflow-hidden"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25 }}
          style={{
            background: 'rgba(5,13,26,0.95)',
            border: '1px solid rgba(0,200,230,0.2)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.5), 0 0 20px rgba(6,182,212,0.1)',
          }}
        >
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(34,211,238,0.1))',
                  border: '1px solid rgba(34,211,238,0.3)',
                }}>
                <Smartphone className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-white mb-0.5">Установить VODPROM</h3>
                <p className="text-xs text-white/40 leading-relaxed">
                  Добавьте на главный экран для быстрого доступа и работы без интернета
                </p>
              </div>
              <button
                onClick={dismissBanner}
                className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white/10 text-slate-500 shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={dismissBanner}
                className="flex-1 py-2 rounded-xl text-xs font-medium text-white/40 hover:text-white/60 hover:bg-white/5 transition"
              >
                Позже
              </button>
              <button
                onClick={install}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-white transition"
                style={{
                  background: 'linear-gradient(135deg, rgba(6,182,212,0.3), rgba(34,211,238,0.15))',
                  border: '1px solid rgba(34,211,238,0.3)',
                }}
              >
                <Download className="w-3.5 h-3.5" />
                Установить
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
