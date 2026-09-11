import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Lock, User, ArrowRight, Loader2,
  Eye, EyeOff, Sparkles, ChevronDown,
} from 'lucide-react';
import { useAuth, ROLES, SELECTABLE_ROLES } from '@/hooks/useAuth';
import { useLocation } from 'wouter';

type AuthMode = 'login' | 'register' | 'magic';

export default function AuthPage() {
  const { isAuthenticated, loading: authLoading, profile, signInWithGoogle, signInWithEmail, signUpWithEmail, signInWithMagicLink, signOut, updateProfile } = useAuth();
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('investor');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [magicSent, setMagicSent] = useState(false);

  // While Supabase resolves the initial session (including OAuth callback tokens),
  // show a spinner so we never render a blank screen.
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2 text-white/40 text-sm">
          <div className="w-5 h-5 border-2 border-cyan-400/40 border-t-cyan-400 rounded-full animate-spin" />
          Загрузка...
        </div>
      </div>
    );
  }

  // Already authenticated — navigate away (done in a render-safe way via useEffect
  // in onAuthStateChange, but also guard here to avoid showing the form)
  if (isAuthenticated) {
    setLocation('/profile');
    return null;
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'register') {
        const { error: err } = await signUpWithEmail(email, password, name, role);
        if (err) setError(err.message);
        else setLocation('/map');
      } else {
        const { error: err } = await signInWithEmail(email, password);
        if (err) setError(err.message);
        else setLocation('/map');
      }
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error: err } = await signInWithMagicLink(email);
      if (err) setError(err.message);
      else setMagicSent(true);
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen pt-14 flex items-center justify-center px-4 py-8">
      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(34,211,238,0.08))',
              border: '1px solid rgba(34,211,238,0.3)',
              boxShadow: '0 0 40px rgba(6,182,212,0.1)',
            }}>
            <svg viewBox="0 0 40 50" className="w-8 h-9">
              <defs><linearGradient id="aDropGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#22d3ee"/><stop offset="100%" stopColor="#06b6d4"/></linearGradient></defs>
              <path d="M20 2 C20 2 4 22 4 32 C4 40.8 11.2 48 20 48 C28.8 48 36 40.8 36 32 C36 22 20 2 20 2Z" fill="url(#aDropGrad)" opacity="0.9"/>
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white mb-1">
            {mode === 'register' ? 'Регистрация' : mode === 'magic' ? 'Вход по ссылке' : 'Вход в VODPROM'}
          </h1>
          <p className="text-xs text-white/35">Платформа управления водными ресурсами</p>
        </div>

        {/* Magic link sent */}
        {magicSent ? (
          <div className="text-center py-8 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(34,211,238,0.15)' }}>
            <Sparkles className="w-10 h-10 text-cyan-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">Проверьте почту</h3>
            <p className="text-sm text-white/40">Ссылка для входа отправлена на<br/><span className="text-cyan-400">{email}</span></p>
          </div>
        ) : (
          <>
            {/* Google button */}
            <button
              onClick={signInWithGoogle}
              className="w-full flex items-center justify-center gap-2.5 h-11 rounded-xl text-sm font-semibold mb-4 transition
                bg-white/5 border border-white/10 text-white hover:bg-white/8 hover:border-white/20"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Войти через Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-white/8" />
              <span className="text-[10px] text-white/20 uppercase tracking-wider">или</span>
              <div className="flex-1 h-px bg-white/8" />
            </div>

            {/* Form */}
            <form onSubmit={mode === 'magic' ? handleMagicLink : handleEmailAuth} className="space-y-3">
              {mode === 'register' && (
                <>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input type="text" required placeholder="Ваше имя" value={name} onChange={(e) => setName(e.target.value)}
                      className="w-full h-10 pl-9 pr-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/20 outline-none focus:border-cyan-500/40 transition" />
                  </div>
                  <div>
                    <label className="text-xs text-white/30 mb-1 block">Роль</label>
                    <div className="relative">
                      <select value={role} onChange={(e) => setRole(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white appearance-none outline-none focus:border-cyan-500/40 transition cursor-pointer">
                        {SELECTABLE_ROLES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none" />
                    </div>
                  </div>
                </>
              )}

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/20 outline-none focus:border-cyan-500/40 transition" />
              </div>

              {mode !== 'magic' && (
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input type={showPassword ? 'text' : 'password'} required placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-10 pl-9 pr-10 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/20 outline-none focus:border-cyan-500/40 transition" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/40">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              )}

              {error && <p className="text-xs text-red-400 px-1">{error}</p>}

              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-semibold text-white transition disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.3), rgba(34,211,238,0.1))', border: '1px solid rgba(34,211,238,0.3)' }}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                {mode === 'register' ? 'Создать аккаунт' : mode === 'magic' ? 'Отправить ссылку' : 'Войти'}
              </button>
            </form>

            {/* Mode switchers */}
            <div className="flex flex-col items-center gap-2 mt-4">
              {mode === 'login' && (
                <>
                  <button onClick={() => setMode('register')} className="text-xs text-cyan-400/60 hover:text-cyan-400 transition">
                    Нет аккаунта? Зарегистрироваться
                  </button>
                  <button onClick={() => setMode('magic')} className="text-xs text-white/25 hover:text-white/40 transition">
                    Войти по ссылке (без пароля)
                  </button>
                </>
              )}
              {mode === 'register' && (
                <button onClick={() => setMode('login')} className="text-xs text-cyan-400/60 hover:text-cyan-400 transition">
                  Уже есть аккаунт? Войти
                </button>
              )}
              {mode === 'magic' && (
                <button onClick={() => setMode('login')} className="text-xs text-cyan-400/60 hover:text-cyan-400 transition">
                  Войти с паролем
                </button>
              )}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

// ── Profile view (shown when authenticated) ──
function ProfileView() {
  const { profile, signOut, updateProfile } = useAuth();
  const [editingRole, setEditingRole] = useState(false);
  const [newRole, setNewRole] = useState(profile?.role ?? 'investor');

  const handleSaveRole = async () => {
    await updateProfile({ role: newRole });
    setEditingRole(false);
  };

  const currentRoleLabel = ROLES.find((r) => r.id === profile?.role)?.label ?? profile?.role;

  return (
    <div className="min-h-screen pt-14 pb-8 px-4">
      <div className="max-w-sm mx-auto pt-8">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold"
            style={{
              background: 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(34,211,238,0.08))',
              border: '2px solid rgba(34,211,238,0.3)',
              color: '#22d3ee',
            }}>
            {profile?.name?.charAt(0)?.toUpperCase() ?? 'U'}
          </div>
          <h2 className="text-xl font-bold text-white">{profile?.name ?? 'Пользователь'}</h2>
          <p className="text-sm text-white/40 mt-0.5">{profile?.email}</p>
        </motion.div>

        {/* Role */}
        <div className="rounded-2xl p-4 mb-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(0,200,230,0.1)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/35 mb-0.5">Роль</p>
              <p className="text-sm font-medium text-white">{currentRoleLabel}</p>
            </div>
            <button
              onClick={() => setEditingRole(!editingRole)}
              className="text-xs text-cyan-400/60 hover:text-cyan-400 transition"
            >
              {editingRole ? 'Отмена' : 'Изменить'}
            </button>
          </div>
          {editingRole && (
            <div className="mt-3 flex gap-2">
              <select value={newRole} onChange={(e) => setNewRole(e.target.value)}
                className="flex-1 h-9 px-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white appearance-none outline-none">
                {SELECTABLE_ROLES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
              </select>
              <button onClick={handleSaveRole}
                className="px-4 h-9 rounded-xl text-xs font-semibold text-white"
                style={{ background: 'rgba(6,182,212,0.2)', border: '1px solid rgba(34,211,238,0.3)' }}>
                Сохранить
              </button>
            </div>
          )}
        </div>

        {/* Sign out */}
        <button
          onClick={signOut}
          className="w-full h-11 rounded-xl text-sm font-medium text-red-400/60 hover:text-red-400 hover:bg-red-500/5 border border-red-500/10 transition"
        >
          Выйти из аккаунта
        </button>
      </div>
    </div>
  );
}
