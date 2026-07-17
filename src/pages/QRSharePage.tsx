import { useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import { Copy, CheckCircle, ExternalLink, User, Shield } from 'lucide-react';

const ACCENT = '#00e6c8';

/* ─────────────────────────────────────────
   Role config
───────────────────────────────────────── */
type RoleKey = 'state_oversight' | 'minister' | 'regional_water' | 'engineer';

interface RoleConfig {
  icon: string;
  label: string;
  color: string;
  code: string;
  param: string;
}

const ROLE_MAP: Record<string, RoleConfig> = {
  state_oversight: {
    icon: '🏛️',
    label: 'Государственный надзор',
    color: '#00e6c8',
    code: 'VODX7K',
    param: 'state_oversight',
  },
  minister: {
    icon: '⭐',
    label: 'Министр',
    color: '#fbbf24',
    code: 'VODM3R',
    param: 'minister',
  },
  regional_water: {
    icon: '🌊',
    label: 'Областной водхоз',
    color: '#60a5fa',
    code: 'VODR9W',
    param: 'regional_water',
  },
  engineer: {
    icon: '⚙️',
    label: 'Инженер',
    color: '#4ade80',
    code: 'VODE5T',
    param: 'engineer',
  },
};

const DEFAULT_ROLE: RoleConfig = {
  icon: '👤',
  label: 'Гость',
  color: '#a78bfa',
  code: 'VODG0X',
  param: 'guest',
};

/* ─────────────────────────────────────────
   Real scannable QR code via qrserver API
───────────────────────────────────────── */
function QRCodeSVG({ size = 280, color, value }: { size?: number; color: string; value: string }) {
  // Strip "#" from accent color for the qrserver `color` param (expects hex without #)
  const fg = color.replace('#', '');
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=8&qzone=1&color=${fg}&bgcolor=000d1f&ecc=M&data=${encodeURIComponent(value)}`;

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 16,
        background: '#000d1f',
        boxShadow: `0 0 40px ${color}40, 0 0 80px ${color}15`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <img
        src={qrSrc}
        alt="QR код активации"
        width={size}
        height={size}
        style={{ display: 'block', borderRadius: 12 }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────
   Water drop logo
───────────────────────────────────────── */
function VodpromLogo() {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: `linear-gradient(135deg, ${ACCENT}20, ${ACCENT}08)`,
          border: `1px solid ${ACCENT}40`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg viewBox="0 0 40 50" width={24} height={30}>
          <defs>
            <linearGradient id="qrDropGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={ACCENT} />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
          <path
            d="M20 2 C20 2 4 22 4 32 C4 40.8 11.2 48 20 48 C28.8 48 36 40.8 36 32 C36 22 20 2 20 2Z"
            fill="url(#qrDropGrad)"
            opacity="0.9"
          />
        </svg>
      </div>
      <div className="text-center">
        <div className="text-xs font-bold tracking-[0.2em] text-white/60 uppercase">VODPROM</div>
        <div className="text-[10px] text-white/25 mt-0.5">Активация профиля</div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Main QRSharePage
───────────────────────────────────────── */
export default function QRSharePage() {
  const [, params] = useRoute('/qr/:role');
  const [, setLocation] = useLocation();
  const [copied, setCopied] = useState(false);

  const roleKey = (params as { role?: string } | null)?.role ?? '';
  const roleConfig: RoleConfig = ROLE_MAP[roleKey] ?? DEFAULT_ROLE;
  const { icon, label, color, code, param } = roleConfig;

  // Encode the QR against the live origin so it resolves on whatever domain
  // the app is served from (vercel.app, custom domain, etc.).
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://vodprom.vercel.app';
  const fullUrl = `${origin}/activate?role=${param}&code=${code}`;
  const activationUrl = fullUrl.replace(/^https?:\/\//, '');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for older browsers
      const el = document.createElement('textarea');
      el.value = fullUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <>
      <style>{`
        @keyframes qrGlow {
          0%, 100% { box-shadow: 0 0 40px ${color}40, 0 0 80px ${color}15; }
          50% { box-shadow: 0 0 60px ${color}60, 0 0 120px ${color}25; }
        }
        @keyframes badgePulse {
          0%, 100% { box-shadow: 0 0 15px ${color}20; }
          50% { box-shadow: 0 0 25px ${color}50; }
        }
      `}</style>

      <div
        className="min-h-screen flex flex-col items-center justify-center px-6 py-10 relative overflow-hidden"
      >
        {/* Ambient glow */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: 700,
            height: 700,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${color}06 0%, transparent 65%)`,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />

        {/* Subtle grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(0,230,200,0.015) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,230,200,0.015) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Main card */}
        <div
          className="w-full max-w-sm relative z-10 flex flex-col items-center"
          style={{
            borderRadius: 28,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(40px)',
            boxShadow: `0 32px 100px rgba(0,0,0,0.65), 0 0 120px ${color}05`,
            padding: '36px 32px',
          }}
        >
          {/* Inner top glow line */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-2/3"
            style={{
              background: `linear-gradient(90deg, transparent, ${color}35, transparent)`,
            }}
          />

          {/* Top logo */}
          <VodpromLogo />

          {/* Divider */}
          <div
            className="w-full h-px my-6"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          />

          {/* QR Code */}
          <div
            style={{
              borderRadius: 20,
              padding: 12,
              background: 'rgba(255,255,255,0.02)',
              border: `1px solid ${color}20`,
              marginBottom: 24,
            }}
          >
            <QRCodeSVG size={280} color={color} value={fullUrl} />
          </div>

          {/* Role badge */}
          <div
            className="flex items-center gap-2.5 px-5 py-2.5 rounded-full mb-3"
            style={{
              background: `${color}10`,
              border: `1px solid ${color}40`,
              animation: 'badgePulse 3s ease-in-out infinite',
            }}
          >
            <span className="text-lg">{icon}</span>
            <span className="text-sm font-bold" style={{ color }}>{label}</span>
          </div>

          {/* Access label */}
          <p className="text-xs text-white/40 mb-1 text-center">
            Уровень доступа:{' '}
            <span className="font-semibold" style={{ color }}>
              {label}
            </span>
          </p>
          <p className="text-xs text-white/30 text-center mb-6 leading-relaxed">
            Сканируйте для активации персонального профиля
          </p>

          {/* URL display */}
          <div
            className="w-full rounded-xl px-4 py-3 mb-3 flex items-center gap-3"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <ExternalLink className="w-4 h-4 flex-shrink-0 text-white/25" />
            <span
              className="text-xs font-mono text-white/50 truncate flex-1"
              title={activationUrl}
            >
              {activationUrl}
            </span>
          </div>

          {/* Copy link button */}
          <button
            onClick={handleCopy}
            className="w-full h-12 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition"
            style={{
              background: copied
                ? 'rgba(74,222,128,0.12)'
                : `linear-gradient(135deg, ${color}25, ${color}08)`,
              border: copied
                ? '1px solid rgba(74,222,128,0.4)'
                : `1px solid ${color}35`,
              color: copied ? '#4ade80' : color,
              boxShadow: copied
                ? '0 4px 20px rgba(74,222,128,0.15)'
                : `0 4px 20px ${color}12`,
            }}
          >
            {copied ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Скопировано!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Скопировать ссылку
              </>
            )}
          </button>

          {/* Divider */}
          <div
            className="w-full h-px my-6"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          />

          {/* Bottom VODPROM branding */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" style={{ color: `${ACCENT}60` }} />
              <span className="text-[11px] font-bold text-white/50 tracking-wide">
                VODPROM Platform
              </span>
            </div>
            <p className="text-[10px] text-white/20">
              Powered by VODecology · 2026
            </p>
          </div>
        </div>

        {/* Role-specific secondary info */}
        <div
          className="mt-4 w-full max-w-sm px-4 py-3 rounded-2xl text-center relative z-10"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <div className="flex items-center justify-center gap-2 text-white/25 text-xs">
            <User className="w-3.5 h-3.5" />
            <span>Персональная ссылка активации · Код:</span>
            <span
              className="font-mono font-bold tracking-widest"
              style={{ color: `${color}80` }}
            >
              {code}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
