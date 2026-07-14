// src/components/dashboard/widgets/TokenWidget.tsx
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { Coins, ExternalLink } from 'lucide-react';

const TOTAL = 1_000_000_000;
const PRESALE = 150_000_000;
const DEV_PCT = 65;

export function TokenWidget() {
  const { t } = useTranslation();
  const [, nav] = useLocation();
  return (
    <div className="h-full flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Coins size={16} className="text-amber-400" />
        <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">VOD TOKEN</span>
        <span className="ml-auto text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Пресейл открыт</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Total Supply', value: '1 000 000 000' },
          { label: 'Presale Pool', value: '150 000 000' },
          { label: 'Разработано', value: `${DEV_PCT}%` },
          { label: 'Цена пресейла', value: '$0.05' },
        ].map(row => (
          <div key={row.label} className="bg-white/5 rounded-xl p-3">
            <p className="text-[10px] text-white/40">{row.label}</p>
            <p className="text-sm font-bold text-white mt-0.5">{row.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-auto">
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-amber-400 to-cyan-400 rounded-full" style={{ width: `${DEV_PCT}%` }} />
        </div>
        <p className="text-[10px] text-white/40 mt-1">Платформа разработана на {DEV_PCT}%</p>
      </div>
      <button onClick={() => nav('/token-sale')}
        className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-cyan-500/20 border border-white/10
          text-xs text-white/70 hover:text-white hover:border-cyan-400/40 transition-all flex items-center justify-center gap-2">
        <ExternalLink size={12} /> Перейти к Token Sale
      </button>
    </div>
  );
}
