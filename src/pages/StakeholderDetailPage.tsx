import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
  ChevronLeft, MapPin, User, Globe, Mail, ExternalLink,
  Tag, Briefcase, Building2, Layers, Users, Send,
  Loader2, CheckCircle, Shield, ArrowRight, Zap, Handshake,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { MiniMap } from '@/components/map/MiniMap';
import { useStakeholders, type Stakeholder } from '@/hooks/useStakeholders';
import {
  useEntityRelationships,
  type EntityRelationship,
} from '@/hooks/useEntityRelationships';

const ACCENT = '#00e6c8';

/* ── Label maps ── */
const STAKEHOLDER_TYPE_LABELS: Record<string, string> = {
  political: 'Политический лидер',
  financial: 'Финансовый институт',
  executive: 'Руководитель',
  government: 'Государственный орган',
  international: 'Международная организация',
  investor: 'Инвестор',
  technical: 'Технический эксперт',
};

const PRIORITY_LABELS: Record<string, { label: string; color: string }> = {
  high:   { label: 'Высокий приоритет', color: '#f87171' },
  medium: { label: 'Средний приоритет', color: '#fbbf24' },
  low:    { label: 'Базовый приоритет', color: '#94a3b8' },
};

type OrgInfo = {
  id: string;
  name: string;
  org_type?: string | null;
  sector?: string | null;
  website?: string | null;
};

export default function StakeholderDetailPage() {
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const id = params.id ?? '';

  const { fetchById } = useStakeholders();
  const { fetchRelationships } = useEntityRelationships();

  const [stakeholder, setStakeholder] = useState<Stakeholder | null>(null);
  const [loading, setLoading] = useState(true);
  const [relationships, setRelationships] = useState<EntityRelationship[]>([]);
  const [orgMap, setOrgMap] = useState<Record<string, OrgInfo>>({});

  // Contact form state
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // Fetch stakeholder data
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchById(id)
      .then((data) => setStakeholder(data))
      .catch(() => setStakeholder(null))
      .finally(() => setLoading(false));
  }, [id, fetchById]);

  // Fetch relationships
  useEffect(() => {
    if (!id) return;
    fetchRelationships('stakeholder', id).then(setRelationships);
  }, [id, fetchRelationships]);

  // Filter connected organizations from relationships
  const connectedOrgs = relationships.filter(
    (r) =>
      (r.source_type === 'organization' && r.target_id === id) ||
      (r.target_type === 'organization' && r.source_id === id),
  );

  // Fetch org details when connectedOrgs change
  useEffect(() => {
    if (connectedOrgs.length === 0) return;
    const orgIds = connectedOrgs.map((r) =>
      r.source_type === 'organization' ? r.source_id : r.target_id,
    );
    const uniqueIds = [...new Set(orgIds)];
    // Skip if we already have them all
    if (uniqueIds.every((oid) => orgMap[oid])) return;

    supabase
      .from('organizations')
      .select('id, name, org_type, sector, website')
      .in('id', uniqueIds)
      .then(({ data }) => {
        if (!data) return;
        const map: Record<string, OrgInfo> = {};
        data.forEach((org: OrgInfo) => {
          map[org.id] = org;
        });
        setOrgMap((prev) => ({ ...prev, ...map }));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectedOrgs.length]);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSending(true);
    try {
      await supabase.from('contact_requests').insert({
        name: form.name,
        email: form.email,
        subject: stakeholder ? `Контакт: ${stakeholder.full_name}` : 'Контакт со стейкхолдером',
        message: form.message,
      });
      setSent(true);
      setForm({ name: '', email: '', message: '' });
    } catch {
      setSent(true);
    }
    setSending(false);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#000818' }}>
        <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    );
  }

  // Not found
  if (!stakeholder) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#000818' }}>
        <div className="text-center">
          <p className="text-white/40 text-lg mb-4">Стейкхолдер не найден</p>
          <button
            onClick={() => setLocation('/contacts')}
            className="px-4 py-2 rounded-xl text-sm cursor-pointer"
            style={{ background: `${ACCENT}10`, color: ACCENT, border: `1px solid ${ACCENT}25` }}
          >
            ← Контакты
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg,#000818 0%,#000c20 100%)' }}>
      {/* Hero */}
      <div className="relative">
        <div
          className="h-32 flex items-center justify-center"
          style={{ background: `${ACCENT}06`, borderBottom: `1px solid ${ACCENT}12` }}
        >
          {stakeholder.photo_url ? (
            <img
              src={stakeholder.photo_url}
              alt={stakeholder.full_name}
              className="w-full h-full object-cover absolute inset-0"
            />
          ) : (
            <User size={48} style={{ color: `${ACCENT}25` }} />
          )}
          {stakeholder.photo_url && (
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,8,24,1))' }}
            />
          )}
        </div>

        <button
          onClick={() => setLocation('/contacts')}
          className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs cursor-pointer"
          style={{
            background: 'rgba(0,6,20,0.85)',
            color: 'rgba(255,255,255,0.6)',
            border: '1px solid rgba(255,255,255,0.12)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <ChevronLeft size={14} /> Контакты
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-5 py-6 space-y-6">
        {/* Title section */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-white/30 text-xs uppercase tracking-wider mb-3">
            Персональная страница
          </div>

          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden"
              style={{ background: `${ACCENT}15`, border: `1px solid ${ACCENT}30` }}
            >
              {stakeholder.photo_url ? (
                <img src={stakeholder.photo_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <User size={24} style={{ color: ACCENT }} />
              )}
            </div>

            <div className="flex-1">
              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-2">
                {stakeholder.stakeholder_type && (
                  <span
                    className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                    style={{ background: `${ACCENT}15`, color: ACCENT, border: `1px solid ${ACCENT}25` }}
                  >
                    {STAKEHOLDER_TYPE_LABELS[stakeholder.stakeholder_type] ?? stakeholder.stakeholder_type}
                  </span>
                )}
                {stakeholder.priority && (() => {
                  const prio = PRIORITY_LABELS[stakeholder.priority] ?? { label: stakeholder.priority, color: '#fbbf24' };
                  return (
                    <span
                      className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                      style={{
                        background: `${prio.color}1F`,
                        color: prio.color,
                        border: `1px solid ${prio.color}40`,
                      }}
                    >
                      {prio.label}
                    </span>
                  );
                })()}
                {(() => {
                  const isVerified = !!(stakeholder.photo_url && stakeholder.position);
                  const isFilled = !isVerified && (stakeholder.tags && stakeholder.tags.length > 0);
                  if (isVerified) {
                    return (
                      <span
                        className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                        style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)' }}
                      >
                        Верифицирован
                      </span>
                    );
                  }
                  if (isFilled) {
                    return (
                      <span
                        className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                        style={{ background: 'rgba(96,165,250,0.12)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.25)' }}
                      >
                        Профиль заполнен
                      </span>
                    );
                  }
                  return (
                    <span
                      className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                      style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.25)' }}
                    >
                      Ожидает верификации
                    </span>
                  );
                })()}
              </div>

              <h1 className="text-white font-black text-2xl leading-tight mb-1">
                {stakeholder.full_name}
              </h1>
              {stakeholder.full_name_en && (
                <p className="text-white/35 text-sm">{stakeholder.full_name_en}</p>
              )}
              {stakeholder.position && (
                <p className="text-white/50 text-sm mt-1 flex items-center gap-1.5">
                  <Briefcase size={12} className="text-white/30" />
                  {stakeholder.position}
                </p>
              )}
              {(stakeholder.region || stakeholder.country) && (
                <div className="flex items-center gap-1.5 mt-2">
                  <MapPin size={12} className="text-white/30" />
                  <span className="text-white/50 text-sm">
                    {[stakeholder.region, stakeholder.country].filter(Boolean).join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Activity area */}
        {stakeholder.activity_area && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <div
              className="rounded-2xl p-5"
              style={{ background: 'rgba(0,6,20,0.8)', border: `1px solid ${ACCENT}12` }}
            >
              <h2 className="text-white font-bold text-base mb-3 flex items-center gap-2">
                <Briefcase size={16} style={{ color: ACCENT }} /> Сфера деятельности
              </h2>
              <p className="text-white/65 text-sm leading-relaxed">{stakeholder.activity_area}</p>
            </div>
          </motion.div>
        )}

        {/* Description */}
        {stakeholder.description && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
            <div
              className="rounded-2xl p-5"
              style={{ background: 'rgba(0,6,20,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <h2 className="text-white font-bold text-base mb-3 flex items-center gap-2">
                <Shield size={16} style={{ color: ACCENT }} /> Описание
              </h2>
              <p className="text-white/65 text-sm leading-relaxed">{stakeholder.description}</p>
            </div>
          </motion.div>
        )}

        {/* Map */}
        {stakeholder.latitude && stakeholder.longitude && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${ACCENT}20` }}>
              <MiniMap
                latitude={stakeholder.latitude}
                longitude={stakeholder.longitude}
                zoom={12}
                markerColor={ACCENT}
                markerType="subject"
                height="180px"
              />
              <div
                className="px-4 py-2 flex items-center gap-1.5"
                style={{ background: 'rgba(0,6,20,0.9)', borderTop: `1px solid ${ACCENT}12` }}
              >
                <MapPin size={12} style={{ color: ACCENT }} />
                <span className="text-white/45 text-xs">
                  {stakeholder.latitude.toFixed(4)}°N, {stakeholder.longitude.toFixed(4)}°E
                  {stakeholder.region ? ` — ${stakeholder.region}` : ''}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Key projects — related_objects (text descriptions, NOT UUIDs) */}
        {stakeholder.related_objects && stakeholder.related_objects.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <div
              className="rounded-2xl p-5"
              style={{ background: 'rgba(0,6,20,0.8)', border: `1px solid ${ACCENT}12` }}
            >
              <h2 className="text-white font-bold text-base mb-4 flex items-center gap-2">
                <Zap size={16} style={{ color: ACCENT }} /> Ключевые проекты
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {stakeholder.related_objects.map((obj, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-xl"
                    style={{ background: 'rgba(0,230,200,0.04)', border: '1px solid rgba(0,230,200,0.10)' }}
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: 'rgba(0,230,200,0.10)' }}
                    >
                      <Layers size={14} style={{ color: ACCENT }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-medium leading-snug">{obj}</div>
                      <div className="text-white/35 text-xs mt-1">Связанный объект</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Partners & connections — related_subjects (text descriptions, NOT UUIDs) */}
        {stakeholder.related_subjects && stakeholder.related_subjects.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
            <div
              className="rounded-2xl p-5"
              style={{ background: 'rgba(0,6,20,0.8)', border: '1px solid rgba(96,165,250,0.12)' }}
            >
              <h2 className="text-white font-bold text-base mb-4 flex items-center gap-2">
                <Handshake size={16} style={{ color: '#60a5fa' }} /> Партнёры и связи
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {stakeholder.related_subjects.map((subj, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-xl"
                    style={{ background: 'rgba(96,165,250,0.04)', border: '1px solid rgba(96,165,250,0.10)' }}
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: 'rgba(96,165,250,0.10)' }}
                    >
                      <Users size={14} style={{ color: '#60a5fa' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-medium leading-snug">{subj}</div>
                      <div className="text-white/35 text-xs mt-1">Партнёр / субъект</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Connected organizations (from entity_relationships, with fetched names) */}
        {connectedOrgs.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div
              className="rounded-2xl p-5"
              style={{ background: 'rgba(0,6,20,0.8)', border: '1px solid rgba(167,139,250,0.12)' }}
            >
              <h2 className="text-white font-bold text-base mb-4 flex items-center gap-2">
                <Building2 size={16} style={{ color: '#a78bfa' }} /> Связанные организации
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {connectedOrgs.map((rel) => {
                  const orgId =
                    rel.source_type === 'organization' ? rel.source_id : rel.target_id;
                  const org = orgMap[orgId];
                  const orgName = org?.name ?? 'Загрузка...';
                  const orgSub = [rel.relationship_type, org?.sector].filter(Boolean).join(' · ');

                  return (
                    <button
                      key={rel.id}
                      onClick={() => setLocation(`/contacts/organization/${orgId}`)}
                      className="flex items-start gap-3 p-3 rounded-xl text-left cursor-pointer transition-all hover:opacity-80"
                      style={{ background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.10)' }}
                    >
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: 'rgba(167,139,250,0.10)' }}
                      >
                        <Building2 size={14} style={{ color: '#a78bfa' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm font-semibold truncate">
                          {orgName}
                        </div>
                        {orgSub && (
                          <div className="text-white/40 text-xs mt-0.5">{orgSub}</div>
                        )}
                        {rel.description && (
                          <div className="text-white/30 text-xs mt-1 line-clamp-2">{rel.description}</div>
                        )}
                      </div>
                      <ArrowRight size={12} className="text-white/30 mt-1 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Website link */}
        {stakeholder.website && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
            <a
              href={stakeholder.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-2xl transition-all hover:opacity-80"
              style={{ background: `${ACCENT}08`, border: `1px solid ${ACCENT}15` }}
            >
              <Globe size={18} style={{ color: ACCENT }} />
              <div className="flex-1">
                <div className="text-white text-sm font-semibold">Официальный сайт</div>
                <div className="text-white/40 text-xs truncate">{stakeholder.website}</div>
              </div>
              <ExternalLink size={14} style={{ color: ACCENT }} />
            </a>
          </motion.div>
        )}

        {/* Contact info */}
        {stakeholder.email && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}>
            <div
              className="rounded-2xl p-5"
              style={{ background: 'rgba(0,6,20,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <h2 className="text-white font-bold text-base mb-3">Контакты</h2>
              <div className="flex items-center gap-2.5 text-sm text-white/60">
                <Mail size={13} style={{ color: ACCENT }} /> {stakeholder.email}
              </div>
            </div>
          </motion.div>
        )}

        {/* Contact form */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}>
          <div
            className="rounded-2xl p-5"
            style={{ background: 'rgba(0,6,20,0.8)', border: `1px solid ${ACCENT}12` }}
          >
            <h2 className="text-white font-bold text-base mb-4 flex items-center gap-2">
              <Send size={16} style={{ color: ACCENT }} /> Форма обратной связи
            </h2>

            {sent ? (
              <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)' }}>
                <CheckCircle size={20} className="text-green-400" />
                <div>
                  <div className="text-white font-semibold text-sm">Сообщение отправлено</div>
                  <div className="text-white/50 text-xs">Мы свяжемся с вами в ближайшее время</div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-3">
                <input
                  type="text"
                  placeholder="Ваше имя"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-white/30 outline-none"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                />
                <input
                  type="email"
                  placeholder="Ваш email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-white/30 outline-none"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                />
                <textarea
                  placeholder="Сообщение..."
                  rows={3}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-white/30 outline-none resize-none"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                />
                <button
                  type="submit"
                  disabled={sending}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all hover:opacity-80 disabled:opacity-50"
                  style={{ background: `${ACCENT}18`, color: ACCENT, border: `1px solid ${ACCENT}30` }}
                >
                  {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  Отправить
                </button>
              </form>
            )}
          </div>
        </motion.div>

        {/* Tags */}
        {stakeholder.tags && stakeholder.tags.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
            <div className="flex flex-wrap gap-2 pb-8">
              {stakeholder.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-full text-xs text-white/35 flex items-center gap-1"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <Tag size={10} />#{tag}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
