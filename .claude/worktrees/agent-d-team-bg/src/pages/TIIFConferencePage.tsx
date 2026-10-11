// src/pages/TIIFConferencePage.tsx
// Tashkent International Investment Forum 2026 — VODecology participation page
// Shown to conference participants to introduce the platform and invite them to join

import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Globe2, Users, TrendingUp, Droplets, Zap, MapPin,
  Calendar, ExternalLink, ChevronRight, Check, Building2, Leaf,
  BarChart3, Waves, Factory, Cpu, Landmark, Award, QrCode,
  Mail, Phone,
} from 'lucide-react';
import { useWaterResources } from '@/hooks/useWaterResources';

// ─── Data ────────────────────────────────────────────────────────

const TIIF_STATS = [
  { label: 'Стран-участниц', value: '95+', icon: Globe2, color: '#00e6c8' },
  { label: 'Спикеров', value: '200+', icon: Users, color: '#a78bfa' },
  { label: 'Международных гостей', value: '3 000+', icon: Building2, color: '#f59e0b' },
  { label: 'Соглашений на $', value: '$30B+', icon: TrendingUp, color: '#22d3ee' },
];

const VODPROM_SESSIONS = [
  {
    time: 'День 1',
    title: 'Водная инфраструктура как инвестиционный актив',
    desc: 'Демонстрация платформы VODPROM — первой в мире блокчейн-системы токенизации водных объектов',
    tag: 'Презентация',
    color: '#00e6c8',
  },
  {
    time: 'День 2',
    title: 'R&D сессия: AquaCell и IoT-мониторинг воды',
    desc: 'Карманные анализаторы качества воды — от потребительского до промышленного уровня. Система дата-оракулов',
    tag: 'Демо',
    color: '#a78bfa',
  },
  {
    time: 'День 3',
    title: 'B2B встречи: инвестиции в водные проекты ЦА',
    desc: 'Индивидуальные встречи с потенциальными инвесторами и партнёрами по проектам в Узбекистане и ЦА',
    tag: 'B2B',
    color: '#f59e0b',
  },
];

const FOCUS_AREAS = [
  { icon: Droplets, label: 'Водоснабжение', desc: 'Питьевая вода для городов и сёл ЦА' },
  { icon: Factory, label: 'Промышленные объекты', desc: 'Модернизация ирригационных систем' },
  { icon: Leaf, label: 'Экология', desc: 'Восстановление водных экосистем (Арал)' },
  { icon: Cpu, label: 'Умные технологии', desc: 'IoT-мониторинг, AI-аналитика воды' },
  { icon: BarChart3, label: 'Инвестиции', desc: 'Токенизация и DAO-управление объектами' },
  { icon: Zap, label: 'ВИЭ', desc: 'Гидроэнергетика и зелёные проекты' },
];

const SPEAKERS_WATER = [
  { name: 'Wei Sun', role: 'TIIF Speaker', org: 'Global Infrastructure Partners', country: '🌐' },
  { name: 'Dr. Shihab M. Elborai', role: 'TIIF Speaker', org: 'Investment Advisory', country: '🌐' },
  { name: 'Momina Aijazuddin', role: 'TIIF Speaker', org: 'Sustainable Development', country: '🌐' },
  { name: 'Minster of Water Resources', role: 'Uzbekistan Gov.', org: 'Ministry of Water Resources', country: '🇺🇿' },
  { name: 'ADB Representative', role: 'Multilateral Bank', org: 'Asian Development Bank', country: '🌏' },
  { name: 'EBRD Water Expert', role: 'Development Finance', org: 'European Bank for Reconstruction', country: '🇪🇺' },
];

// ─── Sub-components ───────────────────────────────────────────────

function ConnectModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<'form' | 'done'>('form');
  const [form, setForm] = useState({ name: '', org: '', email: '', role: '' });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,8,24,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-white/10 p-6"
        style={{ background: '#000f2a' }}
      >
        {step === 'done' ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-400/30 flex items-center justify-center mx-auto mb-4">
              <Check size={28} className="text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Заявка отправлена!</h3>
            <p className="text-white/50 text-sm mb-6">Мы свяжемся с вами в течение 24 часов для назначения встречи на TIIF 2026</p>
            <button onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-[#00e6c8]/10 border border-[#00e6c8]/30 text-[#00e6c8] text-sm hover:bg-[#00e6c8]/20 transition-all">
              Закрыть
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Встретиться на TIIF 2026</h3>
              <button onClick={onClose} className="text-white/40 hover:text-white">✕</button>
            </div>
            <div className="space-y-3">
              {[
                { key: 'name', label: 'Ваше имя', placeholder: 'Имя Фамилия' },
                { key: 'org', label: 'Организация', placeholder: 'Компания / Министерство' },
                { key: 'email', label: 'Email', placeholder: 'your@email.com' },
                { key: 'role', label: 'Роль / интерес', placeholder: 'Инвестор, Партнёр, Технолог...' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="text-xs text-white/40 mb-1 block">{label}</label>
                  <input
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:border-[#00e6c8]/40 focus:outline-none"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={() => setStep('done')}
              disabled={!form.name || !form.email}
              className="mt-5 w-full py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #00e6c8, #0066ff)', color: '#000818' }}
            >
              Запросить встречу на TIIF
            </button>
            <p className="text-[10px] text-white/20 text-center mt-3">
              Данные используются только для организации встречи. info@tiif.online / vodprom@vodeco.com
            </p>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────

export default function TIIFConferencePage() {
  const [, setLocation] = useLocation();
  const [connectOpen, setConnectOpen] = useState(false);
  const { data: uzObjects } = useWaterResources({ country: 'Uzbekistan' });

  return (
    <div className="min-h-screen bg-[#000818] text-white pb-20">

      {/* Top bar */}
      <div className="sticky top-16 z-30 flex items-center justify-between px-6 py-3
        bg-[#000818]/90 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-3">
          <button onClick={() => setLocation('/')}
            className="p-2 rounded-xl hover:bg-white/10 text-white/50 hover:text-white transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-sm font-bold text-white leading-tight">TIIF 2026</h1>
            <p className="text-[10px] text-white/40">Tashkent International Investment Forum</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a href="https://tiif.online" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white/50 text-xs hover:text-white hover:border-white/20 transition-all">
            tiif.online <ExternalLink size={11} />
          </a>
          <button onClick={() => setConnectOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{ background: 'linear-gradient(135deg, #00e6c8, #0066ff)', color: '#000818' }}>
            <Users size={14} /> Встретиться
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 space-y-10">

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="relative rounded-3xl overflow-hidden border border-white/10 p-8 sm:p-12"
            style={{
              background: 'linear-gradient(135deg, rgba(0,102,255,0.15) 0%, rgba(0,230,200,0.08) 50%, rgba(167,139,250,0.10) 100%)',
            }}>
            {/* Uzbekistan flag colors accent */}
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
              style={{ background: 'linear-gradient(90deg, #1eb2a6 0%, #fff 33%, #1eb2a6 66%, #fff 100%)' }} />

            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">🇺🇿</span>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#00e6c8]/10 border border-[#00e6c8]/30 text-[#00e6c8]">
                    VODecology участвует
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 leading-tight">
                  Tashkent International<br />Investment Forum 2026
                </h1>
                <p className="text-white/50 text-lg mb-1 italic">"Where Global Capital Meets the New Frontiers"</p>
                <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-white/60">
                  <span className="flex items-center gap-1.5"><MapPin size={14} className="text-[#00e6c8]" /> Ташкент, Узбекистан</span>
                  <span className="flex items-center gap-1.5"><Calendar size={14} className="text-[#00e6c8]" /> 2026</span>
                  <span className="flex items-center gap-1.5"><Globe2 size={14} className="text-[#00e6c8]" /> 95+ стран</span>
                </div>
              </div>

              <div className="shrink-0 flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/10">
                <QrCode size={64} className="text-[#00e6c8]/70" />
                <p className="text-[10px] text-white/30 text-center">QR для платформы<br />VODPROM</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* TIIF Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {TIIF_STATS.map(({ label, value, icon: Icon, color }, i) => (
            <motion.div key={label}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="rounded-2xl border border-white/8 p-4 text-center"
              style={{ background: `${color}08` }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2"
                style={{ background: `${color}18` }}>
                <Icon size={18} style={{ color }} />
              </div>
              <p className="text-xl font-black" style={{ color }}>{value}</p>
              <p className="text-[11px] text-white/40 mt-0.5">{label}</p>
            </motion.div>
          ))}
        </div>

        {/* VODecology's role + Why Water */}
        <div className="grid sm:grid-cols-2 gap-4">
          <motion.div initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="rounded-2xl border border-[#00e6c8]/20 p-6"
            style={{ background: 'rgba(0,230,200,0.04)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Waves size={20} className="text-[#00e6c8]" />
              <h2 className="text-base font-bold text-white">Почему вода — это инвестиция</h2>
            </div>
            <ul className="space-y-2 text-sm text-white/60">
              {[
                'Центральная Азия — зона критического водного дефицита',
                'Узбекистан выбран для первой полной интеграции VODPROM',
                '473 водных объекта уже в базе данных платформы',
                'Механизм токенизации: каждый объект = инвестиционный актив',
                'IRR 8–18% в водных инфраструктурных проектах',
                'Поддержка ЦУР ООН: #6 (Чистая вода) + #17 (Партнёрства)',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check size={12} className="text-[#00e6c8] mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="rounded-2xl border border-[#a78bfa]/20 p-6"
            style={{ background: 'rgba(167,139,250,0.04)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Landmark size={20} className="text-[#a78bfa]" />
              <h2 className="text-base font-bold text-white">VODecology на TIIF 2026</h2>
            </div>
            <ul className="space-y-2 text-sm text-white/60">
              {[
                'Живая демонстрация платформы VODPROM для участников',
                'B2B встречи с инвесторами в водную инфраструктуру',
                'Представление Proof-of-Water протокола и токена $WTR',
                'Подписание MOU с партнёрами из ЦА и Ближнего Востока',
                'Интеграция участников конференции в экосистему платформы',
                'Сессия "AquaCell" — измерение качества воды прямо на форуме',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <ChevronRight size={12} className="text-[#a78bfa] mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Sessions */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-[#00e6c8]" />
            Программа VODecology на TIIF
          </h2>
          <div className="space-y-3">
            {VODPROM_SESSIONS.map((session, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="flex items-start gap-4 p-4 rounded-2xl border border-white/8"
                style={{ background: `${session.color}06` }}>
                <div className="shrink-0 px-3 py-1 rounded-lg text-xs font-bold"
                  style={{ background: `${session.color}15`, color: session.color }}>
                  {session.time}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white mb-1">{session.title}</h3>
                  <p className="text-xs text-white/50">{session.desc}</p>
                </div>
                <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full border"
                  style={{ borderColor: `${session.color}40`, color: session.color }}>
                  {session.tag}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Focus Areas */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Award size={18} className="text-[#f59e0b]" />
            Ключевые направления
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {FOCUS_AREAS.map(({ icon: Icon, label, desc }, i) => (
              <motion.div key={label}
                initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                className="rounded-xl border border-white/8 p-4 hover:border-[#00e6c8]/20 transition-colors"
                style={{ background: 'rgba(255,255,255,0.03)' }}>
                <Icon size={20} className="text-[#00e6c8] mb-2" />
                <p className="text-sm font-semibold text-white">{label}</p>
                <p className="text-[11px] text-white/40 mt-0.5">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Uzbekistan water objects from DB */}
        {uzObjects && uzObjects.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
              <Droplets size={18} className="text-[#00e6c8]" />
              Водные объекты Узбекистана в платформе
            </h2>
            <p className="text-sm text-white/40 mb-4">
              {uzObjects.length} объектов из базы данных — уже интегрированы в VODPROM
            </p>
            <div className="grid sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
              {uzObjects.slice(0, 20).map((obj) => (
                <div key={obj.id}
                  className="flex items-center justify-between px-3 py-2 rounded-xl border border-white/8 hover:border-[#00e6c8]/20 transition-colors"
                  style={{ background: 'rgba(0,230,200,0.03)' }}>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-white/80 truncate">{obj.name}</p>
                    <p className="text-[10px] text-white/30">{obj.object_type ?? obj.category ?? '—'}</p>
                  </div>
                  {obj.status && (
                    <span className="shrink-0 ml-2 text-[9px] px-1.5 py-0.5 rounded-full"
                      style={{
                        background: obj.status === 'operational' ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)',
                        color: obj.status === 'operational' ? '#4ade80' : '#fbbf24',
                      }}>
                      {obj.status}
                    </span>
                  )}
                </div>
              ))}
            </div>
            {uzObjects.length > 20 && (
              <button onClick={() => setLocation('/hub/objects')}
                className="mt-3 text-xs text-[#00e6c8]/70 hover:text-[#00e6c8] flex items-center gap-1">
                Показать все {uzObjects.length} объектов <ChevronRight size={12} />
              </button>
            )}
          </div>
        )}

        {/* Speakers relevant to water */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Users size={18} className="text-[#a78bfa]" />
            Участники TIIF — водный сектор
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SPEAKERS_WATER.map((speaker, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                className="flex items-center gap-3 p-3 rounded-xl border border-white/8"
                style={{ background: 'rgba(167,139,250,0.04)' }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                  style={{ background: 'rgba(167,139,250,0.12)' }}>
                  {speaker.country}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white leading-tight">{speaker.name}</p>
                  <p className="text-[10px] text-[#a78bfa]/70">{speaker.role}</p>
                  <p className="text-[10px] text-white/30 truncate">{speaker.org}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <p className="text-xs text-white/30 mt-3">
            + 200 спикеров из 95 стран. Полный список на{' '}
            <a href="https://tiif.online" target="_blank" rel="noopener noreferrer"
              className="text-[#00e6c8]/60 hover:text-[#00e6c8] underline">tiif.online</a>
          </p>
        </div>

        {/* CTA — Connect */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="rounded-3xl border border-[#00e6c8]/20 p-8 text-center"
          style={{ background: 'linear-gradient(135deg, rgba(0,102,255,0.10), rgba(0,230,200,0.08))' }}
        >
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(0,230,200,0.12)' }}>
            <Waves size={28} className="text-[#00e6c8]" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">
            Присоединитесь к VODPROM на TIIF 2026
          </h2>
          <p className="text-white/50 text-sm max-w-xl mx-auto mb-6 leading-relaxed">
            Мы ищем инвесторов, партнёров, операторов водных объектов и технологических партнёров.
            Запишитесь на встречу — покажем работающую платформу вживую.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button onClick={() => setConnectOpen(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all"
              style={{ background: 'linear-gradient(135deg, #00e6c8, #0066ff)', color: '#000818' }}>
              <Users size={16} /> Встретиться на TIIF
            </button>
            <a href="https://tiif.online" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-white/70 text-sm hover:border-white/20 hover:text-white transition-all">
              <ExternalLink size={14} /> Сайт конференции
            </a>
            <button onClick={() => setLocation('/invest')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl border border-[#f59e0b]/30 text-[#f59e0b] text-sm hover:border-[#f59e0b]/50 transition-all">
              <TrendingUp size={14} /> Инвестировать сейчас
            </button>
          </div>

          {/* Contact info */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-6 pt-6 border-t border-white/5 text-xs text-white/40">
            <span className="flex items-center gap-1.5"><Mail size={12} /> info@vodeco.com</span>
            <span className="flex items-center gap-1.5"><Globe2 size={12} /> vodeco.com</span>
            <span className="flex items-center gap-1.5"><Phone size={12} /> Стенд VODecology, TIIF 2026</span>
          </div>
        </motion.div>

      </div>

      {/* Connect modal */}
      <AnimatePresence>
        {connectOpen && <ConnectModal onClose={() => setConnectOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}
