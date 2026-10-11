import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import {
  User, Mail, Phone, Globe, AtSign, Building2, MapPin,
  Edit3, Save, X, Loader2, LogOut, MessageSquare, FileText, Briefcase,
  ChevronDown, Shield,
} from 'lucide-react';
import { useAuth, ROLES, type UserProfile } from '@/hooks/useAuth';
import { useMessages } from '@/hooks/useMessages';

const ROLE_COLORS: Record<string, string> = {
  manager: '#06b6d4',
  employee: '#60a5fa',
  investor: '#fbbf24',
  researcher: '#a78bfa',
  developer: '#4ade80',
  partner: '#f472b6',
  admin: '#ef4444',
  other: '#94a3b8',
};

function getAvatarColor(role: string): string {
  return ROLE_COLORS[role] || '#06b6d4';
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default function ProfilePage() {
  const { isAuthenticated, profile, signOut, updateProfile, loading: authLoading } = useAuth();
  const { inbox, sent, unread } = useMessages();
  const [, setLocation] = useLocation();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [form, setForm] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || '',
        role: profile.role || 'other',
        bio: profile.bio || '',
        organization: profile.organization || '',
        region: profile.region || '',
        phone: profile.phone || '',
        telegram: profile.telegram || '',
        website: profile.website || '',
      });
    }
  }, [profile]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation('/account');
    }
  }, [authLoading, isAuthenticated, setLocation]);

  if (authLoading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    );
  }

  const avatarColor = getAvatarColor(profile.role);
  const roleLabel = ROLES.find((r) => r.id === profile.role)?.label ?? profile.role;

  const handleSave = async () => {
    setSaving(true);
    await updateProfile(form);
    setSaving(false);
    setEditing(false);
  };

  const handleCancel = () => {
    setForm({
      name: profile.name || '',
      role: profile.role || 'other',
      bio: profile.bio || '',
      organization: profile.organization || '',
      region: profile.region || '',
      phone: profile.phone || '',
      telegram: profile.telegram || '',
      website: profile.website || '',
    });
    setEditing(false);
  };

  const updateField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Stats
  const messagesSent = sent.length;
  const proposalsReceived = inbox.filter((m) => m.message_type === 'proposal').length;

  return (
    <div className="min-h-screen pt-14 pb-12" style={{ background: 'linear-gradient(180deg, #000818 0%, #000c22 100%)' }}>
      <div className="max-w-xl mx-auto px-4 pt-6 space-y-5">

        {/* Avatar + Name + Role */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div
            className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-black"
            style={{
              background: `linear-gradient(135deg, ${avatarColor}25, ${avatarColor}10)`,
              border: `2px solid ${avatarColor}50`,
              color: avatarColor,
              boxShadow: `0 0 40px ${avatarColor}15`,
            }}
          >
            {getInitials(profile.name || 'U')}
          </div>

          {editing ? (
            <input
              type="text"
              value={form.name || ''}
              onChange={(e) => updateField('name', e.target.value)}
              className="text-xl font-bold text-white bg-white/5 border border-white/15 rounded-xl px-4 py-2 text-center outline-none focus:border-cyan-500/40 w-full max-w-xs mx-auto block"
            />
          ) : (
            <h1 className="text-xl font-bold text-white">{profile.name || 'Пользователь'}</h1>
          )}

          {/* Role badge */}
          <div className="flex items-center justify-center gap-2 mt-2">
            {editing ? (
              <div className="relative">
                <select
                  value={form.role || 'other'}
                  onChange={(e) => updateField('role', e.target.value)}
                  className="h-9 px-3 pr-8 rounded-xl bg-white/5 border border-white/15 text-sm text-white appearance-none outline-none focus:border-cyan-500/40"
                >
                  {ROLES.map((r) => (
                    <option key={r.id} value={r.id}>{r.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
              </div>
            ) : (
              <span
                className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{ background: `${avatarColor}15`, color: avatarColor, border: `1px solid ${avatarColor}30` }}
              >
                {roleLabel}
              </span>
            )}
          </div>

          <p className="text-sm text-white/40 mt-1.5">{profile.email}</p>
        </motion.div>

        {/* Edit / Save buttons */}
        <motion.div
          className="flex justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {editing ? (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition disabled:opacity-50"
                style={{ background: 'rgba(6,182,212,0.2)', border: '1px solid rgba(34,211,238,0.3)' }}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Сохранить
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white transition"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <X className="w-4 h-4" /> Отмена
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:text-white transition"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <Edit3 className="w-4 h-4" /> Редактировать профиль
            </button>
          )}
        </motion.div>

        {/* Bio */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(0,200,230,0.1)' }}
        >
          <h3 className="text-xs text-white/35 uppercase tracking-wider mb-2">О себе</h3>
          {editing ? (
            <textarea
              value={form.bio || ''}
              onChange={(e) => updateField('bio', e.target.value)}
              placeholder="Расскажите о себе, вашем опыте и интересах..."
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-cyan-500/40 resize-none"
            />
          ) : (
            <p className="text-sm text-white/60 leading-relaxed">
              {profile.bio || 'Не указано'}
            </p>
          )}
        </motion.div>

        {/* Organization + Region */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl p-5 space-y-4"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(0,200,230,0.1)' }}
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-4 h-4 text-white/30" />
              <span className="text-xs text-white/35 uppercase tracking-wider">Организация</span>
            </div>
            {editing ? (
              <input
                type="text"
                value={form.organization || ''}
                onChange={(e) => updateField('organization', e.target.value)}
                placeholder="Название организации"
                className="w-full h-10 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-white placeholder-white/20 outline-none focus:border-cyan-500/40"
              />
            ) : (
              <p className="text-sm text-white/60">{profile.organization || 'Не указано'}</p>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-white/30" />
              <span className="text-xs text-white/35 uppercase tracking-wider">Регион</span>
            </div>
            {editing ? (
              <input
                type="text"
                value={form.region || ''}
                onChange={(e) => updateField('region', e.target.value)}
                placeholder="Регион ответственности"
                className="w-full h-10 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-white placeholder-white/20 outline-none focus:border-cyan-500/40"
              />
            ) : (
              <p className="text-sm text-white/60">{profile.region || 'Не указано'}</p>
            )}
          </div>
        </motion.div>

        {/* Contact info */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-5 space-y-4"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(0,200,230,0.1)' }}
        >
          <h3 className="text-xs text-white/35 uppercase tracking-wider">Контактная информация</h3>

          {/* Phone */}
          <div className="flex items-center gap-3">
            <Phone className="w-4 h-4 text-white/30 shrink-0" />
            {editing ? (
              <input
                type="tel"
                value={form.phone || ''}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="+998 ..."
                className="flex-1 h-9 bg-white/5 border border-white/10 rounded-xl px-3 text-sm text-white placeholder-white/20 outline-none focus:border-cyan-500/40"
              />
            ) : (
              <span className="text-sm text-white/60">{profile.phone || 'Не указано'}</span>
            )}
          </div>

          {/* Telegram */}
          <div className="flex items-center gap-3">
            <AtSign className="w-4 h-4 text-white/30 shrink-0" />
            {editing ? (
              <input
                type="text"
                value={form.telegram || ''}
                onChange={(e) => updateField('telegram', e.target.value)}
                placeholder="@username"
                className="flex-1 h-9 bg-white/5 border border-white/10 rounded-xl px-3 text-sm text-white placeholder-white/20 outline-none focus:border-cyan-500/40"
              />
            ) : (
              <span className="text-sm text-white/60">{profile.telegram || 'Не указано'}</span>
            )}
          </div>

          {/* Website */}
          <div className="flex items-center gap-3">
            <Globe className="w-4 h-4 text-white/30 shrink-0" />
            {editing ? (
              <input
                type="url"
                value={form.website || ''}
                onChange={(e) => updateField('website', e.target.value)}
                placeholder="https://..."
                className="flex-1 h-9 bg-white/5 border border-white/10 rounded-xl px-3 text-sm text-white placeholder-white/20 outline-none focus:border-cyan-500/40"
              />
            ) : (
              <span className="text-sm text-white/60">{profile.website || 'Не указано'}</span>
            )}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="grid grid-cols-3 gap-3"
        >
          <div
            className="rounded-2xl p-4 text-center"
            style={{ background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.15)' }}
          >
            <MessageSquare className="w-5 h-5 text-blue-400 mx-auto mb-1.5" />
            <div className="text-lg font-bold text-white">{messagesSent}</div>
            <div className="text-[10px] text-white/35">Отправлено</div>
          </div>
          <div
            className="rounded-2xl p-4 text-center"
            style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)' }}
          >
            <FileText className="w-5 h-5 text-yellow-400 mx-auto mb-1.5" />
            <div className="text-lg font-bold text-white">{proposalsReceived}</div>
            <div className="text-[10px] text-white/35">Предложений</div>
          </div>
          <div
            className="rounded-2xl p-4 text-center"
            style={{ background: 'rgba(0,230,200,0.06)', border: '1px solid rgba(0,230,200,0.15)' }}
          >
            <Briefcase className="w-5 h-5 text-emerald-400 mx-auto mb-1.5" />
            <div className="text-lg font-bold text-white">{unread}</div>
            <div className="text-[10px] text-white/35">Непрочитано</div>
          </div>
        </motion.div>

        {/* Messages shortcut */}
        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => setLocation('/messages')}
          className="w-full flex items-center gap-3 p-4 rounded-2xl transition hover:opacity-80"
          style={{ background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.15)' }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(96,165,250,0.15)' }}>
            <Mail className="w-5 h-5 text-blue-400" />
          </div>
          <div className="flex-1 text-left">
            <div className="text-sm font-semibold text-white">Сообщения</div>
            <div className="text-xs text-white/40">
              {unread > 0 ? `${unread} непрочитанных` : 'Нет новых сообщений'}
            </div>
          </div>
          {unread > 0 && (
            <span className="w-6 h-6 rounded-full bg-cyan-500 text-white text-xs font-bold flex items-center justify-center">
              {unread}
            </span>
          )}
        </motion.button>

        {/* Admin panel link (admin only) */}
        {profile.role === 'admin' && (
          <motion.button
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.33 }}
            onClick={() => setLocation('/admin/invites')}
            className="w-full flex items-center gap-3 p-4 rounded-2xl transition hover:opacity-80"
            style={{ background: 'rgba(0,230,200,0.06)', border: '1px solid rgba(0,230,200,0.15)' }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,230,200,0.15)' }}>
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm font-semibold text-white">Управление приглашениями</div>
              <div className="text-xs text-white/40">QR-коды и ссылки для стейкхолдеров</div>
            </div>
          </motion.button>
        )}

        {/* Sign out */}
        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          onClick={signOut}
          className="w-full flex items-center justify-center gap-2 h-12 rounded-xl text-sm font-medium text-red-400/60 hover:text-red-400 hover:bg-red-500/5 border border-red-500/10 transition"
        >
          <LogOut className="w-4 h-4" />
          Выйти из аккаунта
        </motion.button>
      </div>
    </div>
  );
}
