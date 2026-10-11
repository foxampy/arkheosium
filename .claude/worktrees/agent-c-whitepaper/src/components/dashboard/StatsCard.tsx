import React from 'react';
import { DropletIcon, Vote, UsersRound, Coins, TrendingUp } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: string;
  color: 'primary' | 'accent' | 'secondary' | 'coins';
}

const COLOR_MAP = {
  primary:   { hex: '#00e6c8', glow: 'rgba(0,230,200,0.35)', bg: 'rgba(0,230,200,0.08)' },
  secondary: { hex: '#4ade80', glow: 'rgba(74,222,128,0.3)',  bg: 'rgba(74,222,128,0.08)' },
  accent:    { hex: '#a78bfa', glow: 'rgba(167,139,250,0.3)', bg: 'rgba(167,139,250,0.08)' },
  coins:     { hex: '#facc15', glow: 'rgba(250,204,21,0.3)',  bg: 'rgba(250,204,21,0.08)' },
};

const StatsCard: React.FC<StatsCardProps> = ({ title, value, change, icon, color }) => {
  const c = COLOR_MAP[color] ?? COLOR_MAP.primary;

  const getIcon = () => {
    switch (icon) {
      case 'water_drop': return <DropletIcon className="h-5 w-5" />;
      case 'how_to_vote': return <Vote className="h-5 w-5" />;
      case 'groups':  return <UsersRound className="h-5 w-5" />;
      case 'currency_bitcoin': return <Coins className="h-5 w-5" />;
      case 'coins': return <Coins className="h-5 w-5" />;
      default: return <DropletIcon className="h-5 w-5" />;
    }
  };

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-4 sm:p-5 transition-all duration-300 group"
      style={{
        background: 'linear-gradient(145deg, rgba(0,22,55,0.92), rgba(0,12,38,0.96))',
        boxShadow: `5px 5px 18px rgba(0,0,0,0.55), -3px -3px 10px ${c.glow.replace('0.3','0.06')}, inset 0 1px 0 rgba(255,255,255,0.055), inset 0 0 20px rgba(0,150,220,0.03)`,
        border: `1px solid rgba(0,210,240,0.09)`,
      }}
    >
      {/* bg glow on hover */}
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${c.glow}, transparent)`, transform: 'translate(40%,-40%)' }} />

      <div className="relative z-10">
        <div className="flex items-center mb-3 gap-3">
          {/* Icon bubble */}
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110"
            style={{
              background: `linear-gradient(145deg, ${c.bg}, rgba(0,0,0,0.1))`,
              boxShadow: `3px 3px 8px rgba(0,0,0,0.4), -2px -2px 6px ${c.glow.replace('0.3','0.08')}, inset 0 1px 0 rgba(255,255,255,0.07)`,
              border: `1px solid ${c.hex}22`,
              color: c.hex,
            }}
          >
            {getIcon()}
          </div>
          <h3 className="font-medium text-white/70 text-sm leading-tight">{title}</h3>
        </div>

        <p className="text-2xl sm:text-3xl font-black text-white mb-1 tracking-tight"
          style={{ textShadow: `0 0 20px ${c.glow}` }}>
          {value}
        </p>

        {change && (
          <div className="flex items-center gap-1 text-xs font-medium" style={{ color: c.hex }}>
            <TrendingUp className="h-3 w-3" />
            <span>{change}</span>
          </div>
        )}
      </div>

      {/* bottom shimmer line */}
      <div className="absolute bottom-0 left-0 right-0 h-px opacity-40"
        style={{ background: `linear-gradient(90deg, transparent, ${c.hex}, transparent)` }} />
    </div>
  );
};

export default StatsCard;
