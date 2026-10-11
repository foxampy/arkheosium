import { useState, useEffect } from 'react';
import { useLocation, useSearch } from 'wouter';
import {
  CheckCircle,
  ChevronRight,
  Scan,
  User,
  Shield,
  Zap,
  Users,
  Building2,
  Settings,
  ArrowRight,
  X,
} from 'lucide-react';

const ACCENT = '#00e6c8';

/* ─────────────────────────────────────────
   Real scannable QR code via qrserver API
───────────────────────────────────────── */
function QRCodeSVG({ size = 200, value }: { size?: number; value?: string }) {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://vodprom.vercel.app';
  const target = value ?? `${origin}/activate`;
  const fg = ACCENT.replace('#', '');
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=8&qzone=1&color=${fg}&bgcolor=000d1f&ecc=M&data=${encodeURIComponent(target)}`;

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 12,
        background: '#000d1f',
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
        style={{ display: 'block', borderRadius: 8 }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────
   Role definitions
───────────────────────────────────────── */
type RoleKey = 'state_oversight' | 'minister' | 'regional_water' | 'engineer';

interface RoleDef {
  key: RoleKey;
  icon: string;
  label: string;
  bullets: string[];
}

const ROLES: RoleDef[] = [
  {
    key: 'state_oversight',
    icon: '🏛️',
    label: 'Государственный надзор',
    bullets: [
      'Полная карта страны и все объекты',
      'Регуляторный контроль и проекты',
      'Межведомственные данные',
    ],
  },
  {
    key: 'minister',
    icon: '⭐',
    label: 'Министр / Руководитель',
    bullets: [
      'Сводная статистика и KPI',
      'Бюджетный контроль и тендеры',
      'Дипломатические коммуникации',
    ],
  },
  {
    key: 'regional_water',
    icon: '🌊',
    label: 'Областной водхоз',
    bullets: [
      'Объекты и данные региона',
      'Ирригационные показатели',
      'Отчётность в МВХ и проекты',
    ],
  },
  {
    key: 'engineer',
    icon: '⚙️',
    label: 'Инженер / Специалист',
    bullets: [
      'Технические параметры объектов',
      'IoT-датчики и цифровые двойники',
      'Полевые задачи и мониторинг',
    ],
  },
];

const ROLE_ACCESS_STATS: Record<RoleKey, { label: string; value: string }[]> = {
  state_oversight: [
    { label: 'Объектов', value: '1 240+' },
    { label: 'Регионов', value: '14' },
    { label: 'Отчётов', value: '380+' },
  ],
  minister: [
    { label: 'Проектов', value: '67' },
    { label: 'Тендеров', value: '23' },
    { label: 'Бюджет', value: '$4.2B' },
  ],
  regional_water: [
    { label: 'Объектов', value: '148' },
    { label: 'Каналов', value: '34' },
    { label: 'Отчётов', value: '56' },
  ],
  engineer: [
    { label: 'Датчиков', value: '2 400+' },
    { label: 'Двойников', value: '19' },
    { label: 'Задач', value: '84' },
  ],
};

/* ─────────────────────────────────────────
   Progress dots
───────────────────────────────────────── */
function ProgressDots({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {[1, 2, 3].map((s) => (
        <div
          key={s}
          style={{
            width: s === step ? 24 : 8,
            height: 8,
            borderRadius: 4,
            background: s === step ? ACCENT : s < step ? `${ACCENT}60` : 'rgba(255,255,255,0.1)',
            transition: 'all 0.3s ease',
            boxShadow: s === step ? `0 0 10px ${ACCENT}60` : 'none',
          }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────
   Water drop logo
───────────────────────────────────────── */
function VodpromLogo() {
  return (
    <div className="flex flex-col items-center gap-2 mb-6">
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 16,
          background: `linear-gradient(135deg, ${ACCENT}20, ${ACCENT}08)`,
          border: `1px solid ${ACCENT}50`,
          boxShadow: `0 0 60px ${ACCENT}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg viewBox="0 0 40 50" width={32} height={40}>
          <defs>
            <linearGradient id="dropGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={ACCENT} />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
          <path
            d="M20 2 C20 2 4 22 4 32 C4 40.8 11.2 48 20 48 C28.8 48 36 40.8 36 32 C36 22 20 2 20 2Z"
            fill="url(#dropGrad)"
            opacity="0.9"
          />
        </svg>
      </div>
      <span className="text-xs font-bold tracking-[0.2em] text-white/40 uppercase">VODPROM</span>
    </div>
  );
}

/* ─────────────────────────────────────────
   Step 1 — Welcome / Scan QR
───────────────────────────────────────── */
function Step1({ onNext }: { onNext: () => void }) {
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');

  const handleActivate = () => {
    if (code.length > 0 && code.length !== 6) {
      setCodeError('Код должен содержать 6 символов');
      return;
    }
    setCodeError('');
    onNext();
  };

  return (
    <div className="flex flex-col items-center w-full">
      <VodpromLogo />

      <h1 className="text-2xl font-bold text-white mb-2 text-center">
        Активация профиля
      </h1>
      <p className="text-sm text-white/40 text-center mb-8 max-w-xs leading-relaxed">
        Сканируйте QR-код для получения доступа к платформе
      </p>

      {/* QR Code container */}
      <div
        style={{
          padding: 16,
          borderRadius: 20,
          background: 'rgba(255,255,255,0.03)',
          border: `1px solid ${ACCENT}20`,
          boxShadow: `0 0 60px ${ACCENT}10, 0 0 120px ${ACCENT}05`,
          marginBottom: 24,
        }}
      >
        <QRCodeSVG size={200} />
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 w-full mb-5">
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
        <span className="text-xs text-white/25 uppercase tracking-widest">или введите код</span>
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
      </div>

      {/* Manual code input */}
      <div className="w-full mb-2">
        <div className="relative">
          <Scan
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: `${ACCENT}60` }}
          />
          <input
            type="text"
            maxLength={6}
            placeholder="XXXXXX — 6-значный код"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setCodeError('');
            }}
            className="w-full h-12 pl-11 pr-4 rounded-xl text-sm text-white placeholder-white/20 outline-none transition font-mono tracking-widest"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: codeError ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.08)',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = `${ACCENT}40`)}
            onBlur={(e) =>
              (e.currentTarget.style.borderColor = codeError
                ? 'rgba(239,68,68,0.5)'
                : 'rgba(255,255,255,0.08)')
            }
          />
        </div>
        {codeError && (
          <p className="text-xs text-red-400 mt-1 pl-1">{codeError}</p>
        )}
      </div>

      {/* Activate button */}
      <button
        onClick={handleActivate}
        className="w-full h-12 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition mt-4"
        style={{
          background: `linear-gradient(135deg, ${ACCENT}30, ${ACCENT}10)`,
          border: `1px solid ${ACCENT}40`,
          boxShadow: `0 4px 20px ${ACCENT}15`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = `0 4px 30px ${ACCENT}30`;
          e.currentTarget.style.background = `linear-gradient(135deg, ${ACCENT}40, ${ACCENT}20)`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = `0 4px 20px ${ACCENT}15`;
          e.currentTarget.style.background = `linear-gradient(135deg, ${ACCENT}30, ${ACCENT}10)`;
        }}
      >
        <Shield className="w-4 h-4" />
        Активировать
        <ArrowRight className="w-4 h-4" />
      </button>

      {/* Already have account */}
      <div className="mt-5 text-center">
        <span className="text-xs text-white/30">Уже есть аккаунт? </span>
        <a
          href="/auth"
          className="text-xs font-semibold transition"
          style={{ color: ACCENT }}
        >
          Войти
        </a>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Step 2 — Select Role
───────────────────────────────────────── */
function Step2({
  selected,
  onSelect,
  onNext,
}: {
  selected: RoleKey | null;
  onSelect: (r: RoleKey) => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col items-center w-full">
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
        style={{
          background: `linear-gradient(135deg, ${ACCENT}20, ${ACCENT}08)`,
          border: `1px solid ${ACCENT}40`,
        }}
      >
        <Users className="w-6 h-6" style={{ color: ACCENT }} />
      </div>

      <h1 className="text-2xl font-bold text-white mb-2 text-center">
        Выберите роль доступа
      </h1>
      <p className="text-sm text-white/40 text-center mb-8 max-w-xs leading-relaxed">
        Выбор определяет ваш рабочий стол и уровень доступа
      </p>

      {/* 2×2 role grid */}
      <div className="grid grid-cols-2 gap-3 w-full mb-6">
        {ROLES.map((role) => {
          const isSelected = selected === role.key;
          return (
            <button
              key={role.key}
              onClick={() => onSelect(role.key)}
              className="text-left rounded-2xl p-4 transition-all"
              style={{
                background: isSelected ? `${ACCENT}10` : 'rgba(255,255,255,0.04)',
                border: isSelected
                  ? `1px solid ${ACCENT}60`
                  : '1px solid rgba(255,255,255,0.08)',
                boxShadow: isSelected ? `0 0 20px ${ACCENT}20, inset 0 0 20px ${ACCENT}05` : 'none',
              }}
            >
              <div className="text-2xl mb-2">{role.icon}</div>
              <div className="text-xs font-bold text-white mb-2 leading-tight">{role.label}</div>
              <ul className="space-y-1">
                {role.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <div
                      className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0"
                      style={{ background: isSelected ? ACCENT : 'rgba(255,255,255,0.3)' }}
                    />
                    <span
                      className="text-[10px] leading-tight"
                      style={{ color: isSelected ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.35)' }}
                    >
                      {b}
                    </span>
                  </li>
                ))}
              </ul>
              <div
                className="mt-3 text-[11px] font-semibold text-center py-1.5 rounded-lg transition-all"
                style={{
                  background: isSelected ? `${ACCENT}20` : 'rgba(255,255,255,0.05)',
                  color: isSelected ? ACCENT : 'rgba(255,255,255,0.3)',
                  border: isSelected ? `1px solid ${ACCENT}30` : '1px solid transparent',
                }}
              >
                {isSelected ? '✓ Выбрано' : 'Выбрать'}
              </div>
            </button>
          );
        })}
      </div>

      <button
        onClick={onNext}
        disabled={!selected}
        className="w-full h-12 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background: selected ? `linear-gradient(135deg, ${ACCENT}30, ${ACCENT}10)` : 'rgba(255,255,255,0.05)',
          border: selected ? `1px solid ${ACCENT}40` : '1px solid rgba(255,255,255,0.08)',
          boxShadow: selected ? `0 4px 20px ${ACCENT}15` : 'none',
        }}
      >
        Продолжить
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────
   Step 3 — Profile Setup + Welcome
───────────────────────────────────────── */
function Step3({ role, onFinish }: { role: RoleKey | null; onFinish: () => void }) {
  const roleDef = ROLES.find((r) => r.key === role) ?? ROLES[3];
  const stats = role ? ROLE_ACCESS_STATS[role] : ROLE_ACCESS_STATS['engineer'];

  return (
    <div className="flex flex-col items-center w-full">
      {/* Animated check icon — pure CSS, no framer-motion */}
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${ACCENT}25, ${ACCENT}08)`,
          border: `2px solid ${ACCENT}60`,
          boxShadow: `0 0 40px ${ACCENT}30, 0 0 80px ${ACCENT}10`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
          animation: 'checkPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        }}
      >
        <CheckCircle className="w-10 h-10" style={{ color: ACCENT }} />
      </div>

      <h1 className="text-2xl font-bold text-white mb-2 text-center">
        Профиль настроен
      </h1>

      {/* Role badge */}
      <div
        className="flex items-center gap-2 px-4 py-2 rounded-full mb-3"
        style={{
          background: `${ACCENT}12`,
          border: `1px solid ${ACCENT}40`,
          boxShadow: `0 0 20px ${ACCENT}15`,
          animation: 'glowPulse 2s ease-in-out infinite',
        }}
      >
        <span className="text-base">{roleDef.icon}</span>
        <span className="text-xs font-bold" style={{ color: ACCENT }}>
          {roleDef.label}
        </span>
      </div>

      <p className="text-sm text-white/40 text-center mb-8 max-w-xs leading-relaxed">
        Ваш рабочий стол настроен под роль{' '}
        <span className="font-semibold" style={{ color: ACCENT }}>
          {roleDef.label}
        </span>
      </p>

      {/* Access stats */}
      <div className="grid grid-cols-3 gap-3 w-full mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl p-4 text-center"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div
              className="text-xl font-bold mb-1"
              style={{ color: ACCENT }}
            >
              {stat.value}
            </div>
            <div className="text-[10px] text-white/35">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Open workspace button */}
      <button
        onClick={onFinish}
        className="w-full h-14 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition"
        style={{
          background: `linear-gradient(135deg, ${ACCENT}35, ${ACCENT}15)`,
          border: `1px solid ${ACCENT}50`,
          boxShadow: `0 8px 32px ${ACCENT}20`,
          fontSize: '1rem',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = `0 8px 40px ${ACCENT}40`;
          e.currentTarget.style.background = `linear-gradient(135deg, ${ACCENT}50, ${ACCENT}25)`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = `0 8px 32px ${ACCENT}20`;
          e.currentTarget.style.background = `linear-gradient(135deg, ${ACCENT}35, ${ACCENT}15)`;
        }}
      >
        Открыть рабочий стол
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────
   Main OnboardingPage
───────────────────────────────────────── */
export default function OnboardingPage() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedRole, setSelectedRole] = useState<RoleKey | null>(null);

  // Parse URL query params for pre-selected role
  useEffect(() => {
    const params = new URLSearchParams(search);
    const roleParam = params.get('role') as RoleKey | null;
    if (roleParam && ROLES.some((r) => r.key === roleParam)) {
      setSelectedRole(roleParam);
      setStep(2);
    }
  }, [search]);

  const handleRoleConfirm = () => {
    if (selectedRole) {
      localStorage.setItem('vodprom-user-role', selectedRole);
      setStep(3);
    }
  };

  const handleFinish = () => {
    setLocation('/workspace');
  };

  return (
    <>
      {/* CSS keyframes */}
      <style>{`
        @keyframes checkPop {
          0% { transform: scale(0) rotate(-180deg); opacity: 0; }
          70% { transform: scale(1.15) rotate(5deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 20px ${ACCENT}15; }
          50% { box-shadow: 0 0 30px ${ACCENT}35; }
        }
      `}</style>

      <div
        className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #000818 0%, #000d1f 100%)',
        }}
      >
        {/* Radial ambient glow */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${ACCENT}06 0%, transparent 70%)`,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />

        {/* Subtle grid lines */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(0,230,200,0.02) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,230,200,0.02) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Main card */}
        <div
          className="w-full max-w-lg relative z-10"
          style={{
            borderRadius: 24,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(40px)',
            boxShadow: `0 32px 100px rgba(0,0,0,0.6), 0 0 120px ${ACCENT}05`,
            padding: '40px 36px',
          }}
        >
          {/* Inner top glow line */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-2/3"
            style={{
              background: `linear-gradient(90deg, transparent, ${ACCENT}30, transparent)`,
            }}
          />

          {/* Progress dots */}
          <ProgressDots step={step} />

          {/* Steps */}
          {step === 1 && (
            <Step1 onNext={() => setStep(2)} />
          )}
          {step === 2 && (
            <Step2
              selected={selectedRole}
              onSelect={setSelectedRole}
              onNext={handleRoleConfirm}
            />
          )}
          {step === 3 && (
            <Step3 role={selectedRole} onFinish={handleFinish} />
          )}
        </div>

        {/* Footer */}
        <p
          className="absolute bottom-5 left-0 right-0 text-center text-[10px] text-white/15"
        >
          VODPROM Platform · Powered by VODecology · 2026
        </p>
      </div>
    </>
  );
}
