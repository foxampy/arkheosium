import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Lock, Eye, EyeOff, ArrowRight, Loader2,
  Sparkles, Download, Building2, UserCheck, Shield,
  Link2, CheckCircle2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { usePWA } from '@/hooks/usePWA';
import type { Stakeholder } from '@/hooks/useStakeholders';

const ACCENT = '#00e6c8';

/* ── Stakeholder type labels ── */
const TYPE_LABELS: Record<string, string> = {
  political: 'Политический лидер',
  financial: 'Финансовый институт',
  executive: 'Руководитель',
  government: 'Государственный орган',
  international: 'Международная организация',
  investor: 'Инвестор',
  technical: 'Технический эксперт',
};

/* ── Floating particles background ── */
function Particles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 20 }, (_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 4 + 2,
            height: Math.random() * 4 + 2,
            background: `radial-gradient(circle, ${ACCENT}40, transparent)`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.1, 0.4, 0.1],
          }}
          transition={{
            duration: Math.random() * 6 + 8,
            repeat: Infinity,
            delay: Math.random() * 4,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

/* ── Water drop logo (matching branding) ── */
function VodpromLogo() {
  return (
    <motion.div
      className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center"
      style={{
        background: `linear-gradient(135deg, ${ACCENT}20, ${ACCENT}08)`,
        border: `1px solid ${ACCENT}50`,
        boxShadow: `0 0 60px ${ACCENT}15, 0 0 120px ${ACCENT}08`,
      }}
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
    >
      <svg viewBox="0 0 40 50" className="w-8 h-9">
        <defs>
          <linearGradient id="activateDropGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={ACCENT} />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
        <path
          d="M20 2 C20 2 4 22 4 32 C4 40.8 11.2 48 20 48 C28.8 48 36 40.8 36 32 C36 22 20 2 20 2Z"
          fill="url(#activateDropGrad)"
          opacity="0.9"
        />
      </svg>
    </motion.div>
  );
}

/* ── Stakeholder avatar ── */
function StakeholderAvatar({ stakeholder }: { stakeholder: Stakeholder }) {
  const initials = stakeholder.full_name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  if (stakeholder.photo_url) {
    return (
      <motion.div
        className="w-24 h-24 rounded-full mx-auto overflow-hidden"
        style={{
          border: `3px solid ${ACCENT}60`,
          boxShadow: `0 0 40px ${ACCENT}20`,
        }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.4 }}
      >
        <img
          src={stakeholder.photo_url}
          alt={stakeholder.full_name}
          className="w-full h-full object-cover"
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      className="w-24 h-24 rounded-full mx-auto flex items-center justify-center text-2xl font-bold"
      style={{
        background: `linear-gradient(135deg, ${ACCENT}25, ${ACCENT}08)`,
        border: `3px solid ${ACCENT}60`,
        boxShadow: `0 0 40px ${ACCENT}20`,
        color: ACCENT,
      }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.4 }}
    >
      {initials}
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════
   ActivatePage — main component
   ══════════════════════════════════════════════════ */

type AuthMode = 'signup' | 'magic';

export default function ActivatePage({ id: propId }: { id?: string }) {
  const params = useParams<{ id: string }>();
  const stakeholderId = propId || params.id || '';
  const [, setLocation] = useLocation();
  const { canInstall, isInstalled, install } = usePWA();

  // States
  const [stakeholder, setStakeholder] = useState<Stakeholder | null>(null);
  const [orgName, setOrgName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Auth
  const [authMode, setAuthMode] = useState<AuthMode>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState('');
  const [magicSent, setMagicSent] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);

  const redirectUrl = `${window.location.origin}/contacts/stakeholder/${stakeholderId}`;

  /* ── Fetch stakeholder ── */
  useEffect(() => {
    if (!stakeholderId) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      try {
        const { data, error: err } = await supabase
          .from('stakeholders')
          .select('*')
          .eq('id', stakeholderId)
          .single();

        if (err || !data) {
          setNotFound(true);
          return;
        }

        setStakeholder(data as Stakeholder);

        // Pre-fill email if stakeholder has one
        if (data.email) {
          setEmail(data.email);
        }

        // related_subjects is an array of text descriptions, not UUIDs
        // Try to get org name from entity_relationships → organizations table
        if (data.id) {
          const { data: relData } = await supabase
            .from('entity_relationships')
            .select('target_id, target_type')
            .eq('source_type', 'stakeholder')
            .eq('source_id', data.id)
            .eq('target_type', 'organization')
            .limit(1)
            .single();

          if (relData?.target_id) {
            const { data: orgData } = await supabase
              .from('organizations')
              .select('name')
              .eq('id', relData.target_id)
              .single();
            if (orgData?.name) setOrgName(orgData.name);
          }
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [stakeholderId]);

  /* ── Google OAuth ── */
  const handleGoogleAuth = async () => {
    setError('');
    setAuthLoading(true);
    try {
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      });
      if (err) setError(err.message);
    } catch (e: any) {
      setError(e.message);
    }
    setAuthLoading(false);
  };

  /* ── Email/Password signup ── */
  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAuthLoading(true);
    try {
      const { error: err } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { stakeholder_id: stakeholderId },
          emailRedirectTo: redirectUrl,
        },
      });
      if (err) {
        setError(err.message);
      } else {
        setAuthSuccess(true);
        // Attempt to redirect after a short delay (user may need to confirm email)
        setTimeout(() => setLocation(`/contacts/stakeholder/${stakeholderId}`), 2000);
      }
    } catch (e: any) {
      setError(e.message);
    }
    setAuthLoading(false);
  };

  /* ── Magic link ── */
  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAuthLoading(true);
    try {
      const { error: err } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });
      if (err) {
        setError(err.message);
      } else {
        setMagicSent(true);
      }
    } catch (e: any) {
      setError(e.message);
    }
    setAuthLoading(false);
  };

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div
            className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: `${ACCENT}40`, borderTopColor: 'transparent' }}
          />
          <p className="text-sm text-white/30">Loading your profile...</p>
        </motion.div>
      </div>
    );
  }

  /* ── Not found state ── */
  if (notFound || !stakeholder) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          className="text-center max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            <Shield className="w-7 h-7 text-red-400/60" />
          </div>
          <h2 className="text-lg font-bold text-white mb-2">Ссылка недействительна</h2>
          <p className="text-sm text-white/40 mb-6">
            Приглашение не найдено или было отменено.
            Пожалуйста, свяжитесь с администратором.
          </p>
          <button
            onClick={() => setLocation('/')}
            className="text-sm font-medium transition"
            style={{ color: ACCENT }}
          >
            На главную
          </button>
        </motion.div>
      </div>
    );
  }

  /* ── Auth success state ── */
  if (authSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Particles />
        <motion.div
          className="text-center max-w-sm relative z-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <motion.div
            className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${ACCENT}20, ${ACCENT}08)`,
              border: `2px solid ${ACCENT}50`,
              boxShadow: `0 0 60px ${ACCENT}20`,
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
          >
            <CheckCircle2 className="w-10 h-10" style={{ color: ACCENT }} />
          </motion.div>
          <h2 className="text-xl font-bold text-white mb-2">Добро пожаловать!</h2>
          <p className="text-sm text-white/40 mb-2">
            Аккаунт создан. Проверьте почту для подтверждения.
          </p>
          <p className="text-xs text-white/25">Перенаправляем вас...</p>
        </motion.div>
      </div>
    );
  }

  /* ── Main activation page ── */
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8 relative"
    >
      <Particles />

      {/* Radial glow behind the card */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${ACCENT}08 0%, transparent 70%)`,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />

      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* ── Glassmorphic card ── */}
        <div
          className="rounded-3xl p-8 relative overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            backdropFilter: 'blur(40px)',
            boxShadow: `0 25px 80px rgba(0,0,0,0.5), 0 0 100px ${ACCENT}05`,
          }}
        >
          {/* Inner glow line at top */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px"
            style={{
              background: `linear-gradient(90deg, transparent, ${ACCENT}30, transparent)`,
            }}
          />

          {/* ── Step 1: Logo + Welcome ── */}
          <div className="text-center mb-6">
            <VodpromLogo />
            <motion.h1
              className="text-lg font-bold text-white mt-5 mb-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              VODPROM
            </motion.h1>
            <motion.p
              className="text-xs text-white/35"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Платформа управления водными ресурсами
            </motion.p>
          </div>

          {/* ── Step 2: Profile card ── */}
          <motion.div
            className="rounded-2xl p-5 mb-6"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: `1px solid ${ACCENT}15`,
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <StakeholderAvatar stakeholder={stakeholder} />

            <div className="text-center mt-4">
              <h2 className="text-base font-bold text-white">{stakeholder.full_name}</h2>
              {stakeholder.position && (
                <p className="text-sm text-white/50 mt-0.5">{stakeholder.position}</p>
              )}
              {orgName && (
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  <Building2 className="w-3.5 h-3.5 text-white/25" />
                  <span className="text-xs text-white/35">{orgName}</span>
                </div>
              )}
              {stakeholder.stakeholder_type && (
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  <UserCheck className="w-3.5 h-3.5" style={{ color: `${ACCENT}60` }} />
                  <span className="text-xs" style={{ color: `${ACCENT}80` }}>
                    {TYPE_LABELS[stakeholder.stakeholder_type] || stakeholder.stakeholder_type}
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          {/* ── Welcome heading ── */}
          <motion.div
            className="text-center mb-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <h3 className="text-sm font-semibold text-white mb-1">
              Добро пожаловать на платформу VODPROM
            </h3>
            <p className="text-xs text-white/30">
              Создайте аккаунт для доступа к вашему профилю и ресурсам платформы
            </p>
          </motion.div>

          {/* ── Step 3: Auth options ── */}
          <AnimatePresence mode="wait">
            {magicSent ? (
              /* Magic link sent confirmation */
              <motion.div
                key="magic-sent"
                className="text-center py-6 rounded-2xl"
                style={{
                  background: `${ACCENT}05`,
                  border: `1px solid ${ACCENT}20`,
                }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Sparkles className="w-10 h-10 mx-auto mb-3" style={{ color: ACCENT }} />
                <h3 className="text-sm font-bold text-white mb-1">Проверьте почту</h3>
                <p className="text-xs text-white/40 px-4">
                  Ссылка для входа отправлена на
                  <br />
                  <span style={{ color: ACCENT }}>{email}</span>
                </p>
                <button
                  onClick={() => setMagicSent(false)}
                  className="text-xs text-white/25 hover:text-white/40 mt-4 transition"
                >
                  Отправить повторно
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="auth-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: 0.7 }}
              >
                {/* Google OAuth button */}
                <button
                  onClick={handleGoogleAuth}
                  disabled={authLoading}
                  className="w-full flex items-center justify-center gap-2.5 h-12 rounded-xl text-sm font-semibold mb-4 transition
                    bg-white/5 border border-white/10 text-white hover:bg-white/8 hover:border-white/20 disabled:opacity-50"
                >
                  <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Войти через Google
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px bg-white/8" />
                  <span className="text-[10px] text-white/20 uppercase tracking-wider">или</span>
                  <div className="flex-1 h-px bg-white/8" />
                </div>

                {/* Auth mode tabs */}
                <div className="flex gap-1 mb-4 p-1 rounded-xl bg-white/3">
                  <button
                    onClick={() => setAuthMode('signup')}
                    className="flex-1 py-2 rounded-lg text-xs font-medium transition"
                    style={{
                      background: authMode === 'signup' ? `${ACCENT}12` : 'transparent',
                      color: authMode === 'signup' ? ACCENT : 'rgba(255,255,255,0.3)',
                      border: authMode === 'signup' ? `1px solid ${ACCENT}25` : '1px solid transparent',
                    }}
                  >
                    Email + Пароль
                  </button>
                  <button
                    onClick={() => setAuthMode('magic')}
                    className="flex-1 py-2 rounded-lg text-xs font-medium transition"
                    style={{
                      background: authMode === 'magic' ? `${ACCENT}12` : 'transparent',
                      color: authMode === 'magic' ? ACCENT : 'rgba(255,255,255,0.3)',
                      border: authMode === 'magic' ? `1px solid ${ACCENT}25` : '1px solid transparent',
                    }}
                  >
                    <Link2 className="w-3 h-3 inline mr-1 -mt-0.5" />
                    Magic Link
                  </button>
                </div>

                {/* Email/Password signup form */}
                <form
                  onSubmit={authMode === 'magic' ? handleMagicLink : handleEmailSignup}
                  className="space-y-3"
                >
                  {/* Email */}
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input
                      type="email"
                      required
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/20 outline-none transition"
                      style={{
                        // Focus style is handled by CSS but we add accent on focus via inline
                      }}
                      onFocus={(e) => (e.target.style.borderColor = `${ACCENT}40`)}
                      onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                    />
                  </div>

                  {/* Password (only for signup mode) */}
                  {authMode === 'signup' && (
                    <motion.div
                      className="relative"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Придумайте пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        minLength={6}
                        className="w-full h-11 pl-10 pr-11 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/20 outline-none transition"
                        onFocus={(e) => (e.target.style.borderColor = `${ACCENT}40`)}
                        onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/40 transition"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </motion.div>
                  )}

                  {/* Error message */}
                  {error && (
                    <motion.p
                      className="text-xs text-red-400 px-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {error}
                    </motion.p>
                  )}

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full flex items-center justify-center gap-2 h-12 rounded-xl text-sm font-semibold text-white transition disabled:opacity-50"
                    style={{
                      background: `linear-gradient(135deg, ${ACCENT}30, ${ACCENT}10)`,
                      border: `1px solid ${ACCENT}40`,
                      boxShadow: `0 4px 20px ${ACCENT}10`,
                    }}
                  >
                    {authLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ArrowRight className="w-4 h-4" />
                    )}
                    {authMode === 'magic' ? 'Получить ссылку на email' : 'Присоединиться к платформе'}
                  </button>
                </form>

                {/* Mode switch hint */}
                <div className="text-center mt-3">
                  {authMode === 'signup' && (
                    <button
                      onClick={() => setAuthMode('magic')}
                      className="text-xs text-white/25 hover:text-white/40 transition"
                    >
                      Войти без пароля через magic link
                    </button>
                  )}
                  {authMode === 'magic' && (
                    <button
                      onClick={() => setAuthMode('signup')}
                      className="text-xs text-white/25 hover:text-white/40 transition"
                    >
                      Создать аккаунт с паролем
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── PWA Install prompt ── */}
          {canInstall && !isInstalled && (
            <motion.div
              className="mt-6 rounded-xl p-4 flex items-center gap-3"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  background: `${ACCENT}10`,
                  border: `1px solid ${ACCENT}20`,
                }}
              >
                <Download className="w-5 h-5" style={{ color: ACCENT }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white/70">Установите приложение</p>
                <p className="text-[10px] text-white/30 mt-0.5">Для быстрого доступа</p>
              </div>
              <button
                onClick={install}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition flex-shrink-0"
                style={{
                  background: `${ACCENT}15`,
                  border: `1px solid ${ACCENT}30`,
                  color: ACCENT,
                }}
              >
                Установить
              </button>
            </motion.div>
          )}
        </div>

        {/* ── Footer ── */}
        <motion.p
          className="text-center text-[10px] text-white/15 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          VODPROM Platform &copy; {new Date().getFullYear()}
        </motion.p>
      </motion.div>
    </div>
  );
}
