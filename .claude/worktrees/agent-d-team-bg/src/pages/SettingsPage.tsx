import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, Bell, Globe, Shield,
  Moon, Smartphone, ChevronRight,
} from 'lucide-react';

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('ru');

  return (
    <div className="min-h-screen pt-14 pb-8 px-4">
      <div className="max-w-lg mx-auto">
        <motion.div className="pt-6 mb-6" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-black text-white mb-1">Настройки</h1>
          <p className="text-white/35 text-sm">Управление параметрами приложения</p>
        </motion.div>

        <div className="space-y-3">
          <SettingCard icon={Bell} color="#22d3ee" title="Уведомления" description="Push-уведомления о проектах">
            <ToggleSwitch checked={notifications} onChange={setNotifications} />
          </SettingCard>

          <SettingCard icon={Globe} color="#4ade80" title="Язык" description="Язык интерфейса">
            <select value={language} onChange={(e) => setLanguage(e.target.value)}
              className="h-8 px-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white outline-none">
              <option value="ru">Русский</option>
              <option value="uz">O'zbek</option>
              <option value="en">English</option>
            </select>
          </SettingCard>

          <SettingCard icon={Shield} color="#f97316" title="Конфиденциальность" description="Управление данными">
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </SettingCard>

          <div className="rounded-2xl p-4 mt-6" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(0,200,230,0.08)' }}>
            <div className="flex items-center gap-3 mb-3">
              <Smartphone className="w-5 h-5 text-cyan-400/50" />
              <span className="text-sm font-medium text-white/60">О приложении</span>
            </div>
            <div className="space-y-2 pl-8">
              <div className="flex justify-between"><span className="text-xs text-white/30">Версия</span><span className="text-xs text-white/60 font-medium">1.0.0</span></div>
              <div className="flex justify-between"><span className="text-xs text-white/30">Платформа</span><span className="text-xs text-white/60 font-medium">VODPROM PWA</span></div>
            </div>
          </div>

          <button onClick={() => { localStorage.clear(); window.location.reload(); }}
            className="w-full mt-4 h-11 rounded-xl text-sm font-medium text-red-400/50 hover:text-red-400 hover:bg-red-500/5 border border-red-500/8 transition">
            Сбросить все данные
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingCard({ icon: Icon, color, title, description, children }: {
  icon: typeof Settings; color: string; title: string; description: string; children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl p-4 flex items-center gap-3"
      style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${color}10` }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${color}12`, border: `1px solid ${color}20` }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white">{title}</p>
        <p className="text-[11px] text-white/30 mt-0.5">{description}</p>
      </div>
      {children}
    </div>
  );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)}
      className="relative rounded-full transition-colors shrink-0"
      style={{ width: 40, height: 22, background: checked ? 'rgba(34,211,238,0.4)' : 'rgba(255,255,255,0.1)' }}>
      <div className="absolute top-0.5 rounded-full"
        style={{ width: 18, height: 18, left: checked ? 20 : 2, background: checked ? '#22d3ee' : 'rgba(255,255,255,0.3)', transition: 'left 0.2s, background 0.2s' }} />
    </button>
  );
}
