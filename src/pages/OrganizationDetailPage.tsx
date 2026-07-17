import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
  ChevronLeft, MapPin, Building2, Globe, Mail, Phone, ExternalLink,
  Tag, Briefcase, Users, Layers, Send, Loader2, CheckCircle,
  Shield, ArrowRight, TrendingUp, Sparkles, Calendar, Zap,
  Target, DollarSign, Rocket, User,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { MiniMap } from '@/components/map/MiniMap';
import { useOrganizations, type Organization } from '@/hooks/useOrganizations';
import {
  useEntityRelationships,
  type EntityRelationship,
} from '@/hooks/useEntityRelationships';

const ACCENT = '#00e6c8';

const ORG_TYPE_RU: Record<string, string> = {
  company: 'Компания',
  fund: 'Фонд',
  mdb: 'Банк развития',
  startup: 'Стартап',
  ngo: 'НКО',
};

interface StakeholderInfo { id: string; full_name: string; position?: string; stakeholder_type?: string }
interface OrgInfo { id: string; name: string; org_type?: string }

export default function OrganizationDetailPage() {
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const id = params.id ?? '';

  const { fetchById } = useOrganizations();
  const { fetchRelationships } = useEntityRelationships();

  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [relationships, setRelationships] = useState<EntityRelationship[]>([]);
  const [stakeholderNames, setStakeholderNames] = useState<Record<string, StakeholderInfo>>({});
  const [orgNames, setOrgNames] = useState<Record<string, OrgInfo>>({});

  // Contact form state
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // Fetch organization data
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchById(id)
      .then((data) => setOrg(data))
      .catch(() => setOrg(null))
      .finally(() => setLoading(false));
  }, [id, fetchById]);

  // Fetch relationships
  useEffect(() => {
    if (!id) return;
    fetchRelationships('organization', id).then(setRelationships);
  }, [id, fetchRelationships]);

  // Filter connected stakeholders
  const connectedStakeholders = relationships.filter(
    (r) =>
      (r.source_type === 'stakeholder' && r.target_id === id) ||
      (r.target_type === 'stakeholder' && r.source_id === id),
  );

  // Filter connected organizations (other orgs)
  const connectedOrgs = relationships.filter(
    (r) =>
      (r.source_type === 'organization' && r.source_id !== id) ||
      (r.target_type === 'organization' && r.target_id !== id),
  );

  // Fetch real stakeholder names
  useEffect(() => {
    const ids = connectedStakeholders.map(r =>
      r.source_type === 'stakeholder' ? r.source_id : r.target_id
    );
    if (ids.length === 0) return;
    supabase.from('stakeholders').select('id, full_name, position, stakeholder_type').in('id', ids)
      .then(({ data }) => {
        if (!data) return;
        const map: Record<string, StakeholderInfo> = {};
        data.forEach(s => { map[s.id] = s; });
        setStakeholderNames(map);
      });
  }, [relationships]);

  // Fetch real org names for connected orgs
  useEffect(() => {
    const ids = connectedOrgs.map(r => {
      if (r.source_type === 'organization' && r.source_id !== id) return r.source_id;
      return r.target_id;
    });
    if (ids.length === 0) return;
    supabase.from('organizations').select('id, name, org_type').in('id', ids)
      .then(({ data }) => {
        if (!data) return;
        const map: Record<string, OrgInfo> = {};
        data.forEach(o => { map[o.id] = o; });
        setOrgNames(map);
      });
  }, [relationships]);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSending(true);
    try {
      await supabase.from('contact_requests').insert({
        name: form.name,
        email: form.email,
        subject: org ? `Контакт: ${org.name}` : 'Контакт с организацией',
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    );
  }

  // Not found
  if (!org) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/40 text-lg mb-4">Организация не найдена</p>
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
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative">
        <div
          className="h-32 flex items-center justify-center"
          style={{ background: `${ACCENT}06`, borderBottom: `1px solid ${ACCENT}12` }}
        >
          {org.logo_url ? (
            <img
              src={org.logo_url}
              alt={org.name}
              className="w-full h-full object-cover absolute inset-0"
            />
          ) : (
            <Building2 size={48} style={{ color: `${ACCENT}25` }} />
          )}
          {org.logo_url && (
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
          <div className="flex items-start gap-4">
            {/* Logo / icon */}
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden"
              style={{ background: `${ACCENT}15`, border: `1px solid ${ACCENT}30` }}
            >
              {org.logo_url ? (
                <img src={org.logo_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <Building2 size={24} style={{ color: ACCENT }} />
              )}
            </div>

            <div className="flex-1">
              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-2">
                {org.org_type && (
                  <span
                    className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                    style={{ background: `${ACCENT}15`, color: ACCENT, border: `1px solid ${ACCENT}25` }}
                  >
                    {ORG_TYPE_RU[org.org_type] || org.org_type}
                  </span>
                )}
                {org.interaction_type && (
                  <span
                    className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                    style={{
                      background: 'rgba(167,139,250,0.12)',
                      color: '#a78bfa',
                      border: '1px solid rgba(167,139,250,0.25)',
                    }}
                  >
                    {org.interaction_type}
                  </span>
                )}
                {org.event_status && (
                  <span
                    className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                    style={{
                      background: 'rgba(251,191,36,0.12)',
                      color: '#fbbf24',
                      border: '1px solid rgba(251,191,36,0.25)',
                    }}
                  >
                    {org.event_status}
                  </span>
                )}
                {org.priority && (
                  <span
                    className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                    style={{
                      background: 'rgba(74,222,128,0.12)',
                      color: '#4ade80',
                      border: '1px solid rgba(74,222,128,0.25)',
                    }}
                  >
                    {org.priority}
                  </span>
                )}
              </div>

              <h1 className="text-white font-black text-2xl leading-tight mb-1">{org.name}</h1>
              {org.name_en && <p className="text-white/35 text-sm">{org.name_en}</p>}

              {(org.headquarters || org.region || org.country) && (
                <div className="flex items-center gap-1.5 mt-2">
                  <MapPin size={12} className="text-white/30" />
                  <span className="text-white/50 text-sm">
                    {[org.headquarters, org.region, org.country].filter(Boolean).join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Sector & Key solutions */}
        {(org.sector || org.key_solutions) && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <div
              className="rounded-2xl p-5"
              style={{ background: 'rgba(0,6,20,0.8)', border: `1px solid ${ACCENT}12` }}
            >
              {org.sector && (
                <div className="mb-4">
                  <h2 className="text-white font-bold text-base mb-2 flex items-center gap-2">
                    <Briefcase size={16} style={{ color: ACCENT }} /> Сектор
                  </h2>
                  <p className="text-white/65 text-sm">{org.sector}</p>
                </div>
              )}
              {org.key_solutions && (
                <div>
                  <h2 className="text-white font-bold text-base mb-2 flex items-center gap-2">
                    <Zap size={16} style={{ color: '#fbbf24' }} /> Ключевые решения
                  </h2>
                  <p className="text-white/65 text-sm leading-relaxed">{org.key_solutions}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Description */}
        {org.description && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
            <div
              className="rounded-2xl p-5"
              style={{ background: 'rgba(0,6,20,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <h2 className="text-white font-bold text-base mb-3 flex items-center gap-2">
                <Shield size={16} style={{ color: ACCENT }} /> Описание
              </h2>
              <p className="text-white/65 text-sm leading-relaxed">{org.description}</p>
            </div>
          </motion.div>
        )}

        {/* Key people */}
        {org.key_people && (Array.isArray(org.key_people) ? org.key_people.length > 0 : !!org.key_people) && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div
              className="rounded-2xl p-5"
              style={{ background: 'rgba(0,6,20,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <h2 className="text-white font-bold text-base mb-3 flex items-center gap-2">
                <Users size={16} style={{ color: '#60a5fa' }} /> Ключевые люди
              </h2>
              {Array.isArray(org.key_people) ? (
                <div className="flex flex-wrap gap-2">
                  {org.key_people.map((person, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-xl text-sm text-white/70 flex items-center gap-1.5"
                      style={{ background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.15)' }}>
                      <User size={12} style={{ color: '#60a5fa' }} />
                      {person}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-white/65 text-sm leading-relaxed">{org.key_people}</p>
              )}
            </div>
          </motion.div>
        )}

        {/* Funding volume */}
        {org.funding_volume && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
            <div
              className="rounded-2xl p-5"
              style={{ background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.12)' }}
            >
              <h2 className="text-white font-bold text-base mb-2 flex items-center gap-2">
                <DollarSign size={16} style={{ color: '#4ade80' }} /> Объём финансирования
              </h2>
              <p className="text-emerald-400 font-black text-xl">{org.funding_volume}</p>
            </div>
          </motion.div>
        )}

        {/* Map */}
        {org.latitude && org.longitude && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
            <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${ACCENT}20` }}>
              <MiniMap
                latitude={org.latitude}
                longitude={org.longitude}
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
                  {org.latitude.toFixed(4)}°N, {org.longitude.toFixed(4)}°E
                  {org.headquarters ? ` — ${org.headquarters}` : ''}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Key projects */}
        {org.key_projects && org.key_projects.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
            <div
              className="rounded-2xl p-5"
              style={{ background: 'rgba(0,6,20,0.8)', border: '1px solid rgba(96,165,250,0.12)' }}
            >
              <h2 className="text-white font-bold text-base mb-3 flex items-center gap-2">
                <Rocket size={16} style={{ color: '#60a5fa' }} /> Ключевые проекты
              </h2>
              <div className="space-y-2">
                {org.key_projects.map((project, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 p-2.5 rounded-xl"
                    style={{ background: 'rgba(96,165,250,0.04)', border: '1px solid rgba(96,165,250,0.08)' }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 bg-blue-400" />
                    <p className="text-white/65 text-sm">{project}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Key initiatives */}
        {org.key_initiatives && org.key_initiatives.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
            <div
              className="rounded-2xl p-5"
              style={{ background: 'rgba(0,6,20,0.8)', border: '1px solid rgba(167,139,250,0.12)' }}
            >
              <h2 className="text-white font-bold text-base mb-3 flex items-center gap-2">
                <Sparkles size={16} style={{ color: '#a78bfa' }} /> Ключевые инициативы
              </h2>
              <div className="space-y-2">
                {org.key_initiatives.map((initiative, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 p-2.5 rounded-xl"
                    style={{ background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.08)' }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 bg-violet-400" />
                    <p className="text-white/65 text-sm">{initiative}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* CA/VodProm potential */}
        {org.ca_potential && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div
              className="rounded-2xl p-5"
              style={{ background: 'rgba(0,230,200,0.05)', border: '1px solid rgba(0,230,200,0.15)' }}
            >
              <h2 className="text-white font-bold text-base mb-3 flex items-center gap-2">
                <Target size={16} style={{ color: ACCENT }} /> Потенциал CA / VodProm
              </h2>
              <p className="text-white/65 text-sm leading-relaxed">{org.ca_potential}</p>
            </div>
          </motion.div>
        )}

        {/* Connected stakeholders */}
        {connectedStakeholders.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
            <h2 className="text-white font-bold text-base mb-3 flex items-center gap-2">
              <User size={16} style={{ color: ACCENT }} /> Связанные стейкхолдеры
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {connectedStakeholders.map((rel) => {
                const stakeholderId =
                  rel.source_type === 'stakeholder' ? rel.source_id : rel.target_id;
                const info = stakeholderNames[stakeholderId];
                const initials = info?.full_name?.split(' ').slice(0, 2).map(w => w[0]).join('') || '?';
                return (
                  <button
                    key={rel.id}
                    onClick={() => setLocation(`/contacts/stakeholder/${stakeholderId}`)}
                    className="flex items-center gap-3 p-3 rounded-xl text-left cursor-pointer transition-all hover:opacity-80"
                    style={{ background: `${ACCENT}05`, border: `1px solid ${ACCENT}12` }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                      style={{ background: `${ACCENT}10`, color: ACCENT }}
                    >
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-semibold truncate">
                        {info?.full_name || 'Загрузка...'}
                      </div>
                      <div className="text-white/40 text-xs truncate">
                        {info?.position || rel.description || rel.relationship_type || ''}
                      </div>
                    </div>
                    <ArrowRight size={12} className="text-white/30" />
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Connected organizations */}
        {connectedOrgs.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}>
            <h2 className="text-white font-bold text-base mb-3 flex items-center gap-2">
              <Building2 size={16} style={{ color: '#a78bfa' }} /> Связанные организации
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {connectedOrgs.map((rel) => {
                const otherOrgId =
                  rel.source_type === 'organization' && rel.source_id !== id
                    ? rel.source_id
                    : rel.target_id;
                const oInfo = orgNames[otherOrgId];
                return (
                  <button
                    key={rel.id}
                    onClick={() => setLocation(`/contacts/organization/${otherOrgId}`)}
                    className="flex items-center gap-3 p-3 rounded-xl text-left cursor-pointer transition-all hover:opacity-80"
                    style={{ background: 'rgba(167,139,250,0.05)', border: '1px solid rgba(167,139,250,0.12)' }}
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(167,139,250,0.1)' }}
                    >
                      <Building2 size={14} style={{ color: '#a78bfa' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-semibold truncate">
                        {oInfo?.name || 'Загрузка...'}
                      </div>
                      <div className="text-white/40 text-xs">
                        {oInfo?.org_type ? (ORG_TYPE_RU[oInfo.org_type] || oInfo.org_type) : rel.relationship_type || ''}
                      </div>
                    </div>
                    <ArrowRight size={12} className="text-white/30" />
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Website link */}
        {org.website && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}>
            <a
              href={org.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-2xl transition-all hover:opacity-80"
              style={{ background: `${ACCENT}08`, border: `1px solid ${ACCENT}15` }}
            >
              <Globe size={18} style={{ color: ACCENT }} />
              <div className="flex-1">
                <div className="text-white text-sm font-semibold">Официальный сайт</div>
                <div className="text-white/40 text-xs truncate">{org.website}</div>
              </div>
              <ExternalLink size={14} style={{ color: ACCENT }} />
            </a>
          </motion.div>
        )}

        {/* Contact info */}
        {(org.email || org.phone) && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
            <div
              className="rounded-2xl p-5"
              style={{ background: 'rgba(0,6,20,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <h2 className="text-white font-bold text-base mb-3">Контакты</h2>
              <div className="space-y-2">
                {org.email && (
                  <div className="flex items-center gap-2.5 text-sm text-white/60">
                    <Mail size={13} style={{ color: ACCENT }} /> {org.email}
                  </div>
                )}
                {org.phone && (
                  <div className="flex items-center gap-2.5 text-sm text-white/60">
                    <Phone size={13} style={{ color: ACCENT }} /> {org.phone}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Contact form */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div
            className="rounded-2xl p-5"
            style={{ background: 'rgba(0,6,20,0.8)', border: `1px solid ${ACCENT}12` }}
          >
            <h2 className="text-white font-bold text-base mb-4 flex items-center gap-2">
              <Send size={16} style={{ color: ACCENT }} /> Форма обратной связи
            </h2>

            {sent ? (
              <div
                className="flex items-center gap-3 p-4 rounded-xl"
                style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)' }}
              >
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
        {org.tags && org.tags.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}>
            <div className="flex flex-wrap gap-2 pb-8">
              {org.tags.map((tag) => (
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
