import { motion } from 'framer-motion';
import { ArrowLeft, Droplets, Waves, Home } from 'lucide-react';
import { useLocation } from 'wouter';

export default function NotFoundPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Ripples */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-cyan-500/10"
            style={{
              width: 300 + i * 200,
              height: 300 + i * 200,
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.1, 0.02, 0.1],
            }}
            transition={{ duration: 4 + i, repeat: Infinity, delay: i * 1.5 }}
          />
        ))}

        {/* Floating droplets */}
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.05, 0.15, 0.05],
            }}
            transition={{ duration: 3 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }}
          >
            <Droplets className="w-4 h-4 text-cyan-500/20" />
          </motion.div>
        ))}
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 text-center px-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* 404 number with water effect */}
        <motion.div className="relative mb-8">
          <h1
            className="text-[120px] sm:text-[180px] font-black leading-none select-none"
            style={{
              background: 'linear-gradient(180deg, rgba(34,211,238,0.25) 0%, rgba(6,182,212,0.08) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            404
          </h1>
          {/* Wave overlay on text */}
          <motion.div
            className="absolute bottom-6 left-0 right-0 flex justify-center"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Waves className="w-32 h-8 text-cyan-500/20" />
          </motion.div>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">
            Страница не найдена
          </h2>
          <p className="text-white/40 text-sm sm:text-base max-w-md mx-auto mb-10 leading-relaxed">
            Эта страница утонула в цифровом океане. Возможно, она была перемещена или больше не существует.
          </p>
        </motion.div>

        {/* Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all
              bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 hover:border-white/20"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад
          </button>
          <button
            onClick={() => setLocation('/')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all
              border text-white"
            style={{
              background: 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(34,211,238,0.1))',
              borderColor: 'rgba(34,211,238,0.3)',
            }}
          >
            <Home className="w-4 h-4 text-cyan-400" />
            На главную
          </button>
        </motion.div>

        {/* Decorative bottom wave */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 -z-10"
          style={{ height: '30%' }}
        >
          <svg viewBox="0 0 1440 200" className="absolute bottom-0 w-full" preserveAspectRatio="none" style={{ height: '100%' }}>
            <motion.path
              d="M0,100 C240,140 480,60 720,100 C960,140 1200,60 1440,100 L1440,200 L0,200 Z"
              fill="rgba(6,182,212,0.03)"
              animate={{ d: [
                'M0,100 C240,140 480,60 720,100 C960,140 1200,60 1440,100 L1440,200 L0,200 Z',
                'M0,120 C240,80 480,140 720,110 C960,70 1200,130 1440,90 L1440,200 L0,200 Z',
                'M0,100 C240,140 480,60 720,100 C960,140 1200,60 1440,100 L1440,200 L0,200 Z',
              ]}}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
}
