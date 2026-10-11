import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Copy, Check, ChevronDown, ChevronUp,
  Droplets, Users, TrendingUp, Clock, Wallet,
  AlertTriangle, CreditCard, Coins, CheckCircle2, X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';

// ─── Dev Progress Banner ──────────────────────────────────────

const DEV_BANNER_KEY = 'vodprom_dev_banner_dismissed';

function DevProgressBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(DEV_BANNER_KEY);
    if (!dismissed) setVisible(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem(DEV_BANNER_KEY, '1');
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -20, height: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="overflow-hidden"
        >
          <div
            className="relative flex items-center justify-between gap-3 px-4 py-2.5"
            style={{
              background: 'linear-gradient(90deg, rgba(245,158,11,0.18) 0%, rgba(0,230,200,0.18) 50%, rgba(245,158,11,0.18) 100%)',
              borderBottom: '1px solid rgba(245,158,11,0.25)',
              backgroundSize: '200% 100%',
              animation: 'devBannerShimmer 3s ease-in-out infinite',
            }}
          >
            {/* Pulsing left accent */}
            <span
              className="w-2 h-2 rounded-full shrink-0 animate-pulse"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #00e6c8)' }}
            />

            <p className="flex-1 text-center text-xs font-semibold leading-snug"
              style={{ color: 'rgba(255,255,255,0.85)' }}>
              <span className="text-amber-400 font-black">🚧 Платформа разработана на 65%</span>
              <span className="text-white/50 mx-1.5">·</span>
              <span className="text-teal-300">Пресейл открыт</span>
              <span className="text-white/50 mx-1.5">·</span>
              <span className="text-white/70">Принять участие сейчас</span>
            </p>

            <button
              onClick={dismiss}
              aria-label="Закрыть"
              className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all hover:bg-white/15"
              style={{ color: 'rgba(255,255,255,0.45)' }}
            >
              <X size={13} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Inject keyframes once
const devBannerStyle = `
@keyframes devBannerShimmer {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
`;
if (typeof document !== 'undefined' && !document.getElementById('dev-banner-style')) {
  const s = document.createElement('style');
  s.id = 'dev-banner-style';
  s.textContent = devBannerStyle;
  document.head.appendChild(s);
}

// ─── Constants ────────────────────────────────────────────────

const TOTAL_SUPPLY = 100_000_000;
const SOLD = 0;
const PRICE_USD = 0.20;
const WATER_PER_VOD = 4600; // m³

const CRYPTO_OPTIONS = [
  {
    id: 'usdt',
    symbol: 'USDT',
    network: 'TRC-20',
    emoji: '💵',
    address: 'PLACEHOLDER_USDT_WALLET',
    color: '#26a17b',
  },
  {
    id: 'eth',
    symbol: 'ETH',
    network: 'ERC-20',
    emoji: '💎',
    address: 'PLACEHOLDER_ETH_WALLET',
    color: '#627eea',
  },
  {
    id: 'btc',
    symbol: 'BTC',
    network: 'Bitcoin',
    emoji: '₿',
    address: 'PLACEHOLDER_BTC_WALLET',
    color: '#f7931a',
  },
  {
    id: 'trx',
    symbol: 'TRX',
    network: 'TRON',
    emoji: '🔴',
    address: 'PLACEHOLDER_TRX_WALLET',
    color: '#ef0027',
  },
];

// ─── Tier bonus helper ────────────────────────────────────────

function getTierBonus(amount: number): number {
  if (amount >= 100_000) return 0.15;
  if (amount >= 10_000) return 0.10;
  if (amount >= 1_000) return 0.05;
  return 0;
}

function getTierLabel(amount: number, t: (key: string) => string): string {
  if (amount >= 100_000) return '+15% бонус';
  if (amount >= 10_000) return '+10% бонус';
  if (amount >= 1_000) return '+5% бонус';
  return t('tokensale.no_bonus');
}

// ─── Countdown ───────────────────────────────────────────────

function useCountdown(days: number) {
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const target = Date.now() + days * 24 * 60 * 60 * 1000;
    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      const d = Math.floor(diff / 86_400_000);
      const h = Math.floor((diff % 86_400_000) / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1000);
      setTime({ d, h, m, s });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [days]);

  return time;
}

// ─── Sub-components ───────────────────────────────────────────

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center font-black text-xl text-white border"
        style={{ background: 'rgba(0,230,200,0.08)', borderColor: 'rgba(0,230,200,0.2)' }}
      >
        {String(value).padStart(2, '0')}
      </div>
      <span className="text-white/35 text-[10px] mt-1 font-medium uppercase tracking-wider">{label}</span>
    </div>
  );
}

function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border p-5 ${className}`}
      style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}
    >
      {children}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────

export default function TokenSalePage() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, profile } = useAuth();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<'card' | 'crypto'>('card');
  const [tokenAmount, setTokenAmount] = useState(1000);
  const [selectedCrypto, setSelectedCrypto] = useState(CRYPTO_OPTIONS[0].id);
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');

  const countdown = useCountdown(90);

  const soldPct = (SOLD / TOTAL_SUPPLY) * 100;
  const bonus = getTierBonus(tokenAmount);
  const totalWithBonus = Math.floor(tokenAmount * (1 + bonus));
  const costUsd = (tokenAmount * PRICE_USD).toFixed(2);
  const waterM3 = (totalWithBonus * WATER_PER_VOD).toLocaleString('ru-RU');

  const selectedCryptoData = CRYPTO_OPTIONS.find((c) => c.id === selectedCrypto)!;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${selectedCryptoData.address}`;

  const faqItems = [
    { q: t('tokensale.faq1_q'), a: t('tokensale.faq1_a') },
    { q: t('tokensale.faq2_q'), a: t('tokensale.faq2_a') },
    { q: t('tokensale.faq3_q'), a: t('tokensale.faq3_a') },
    { q: t('tokensale.faq4_q'), a: t('tokensale.faq4_a') },
  ];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(selectedCryptoData.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div
      className="min-h-screen pb-10"
      style={{ background: 'linear-gradient(160deg,#000818 0%,#000c20 60%,#001018 100%)' }}
    >
      {/* ── Dev Progress Banner ──────────────────────────────── */}
      <DevProgressBanner />

      {/* Animated background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div
          className="absolute w-96 h-96 rounded-full opacity-5 animate-pulse"
          style={{ background: '#00e6c8', filter: 'blur(80px)', top: '10%', left: '-10%' }}
        />
        <div
          className="absolute w-80 h-80 rounded-full opacity-5 animate-pulse"
          style={{ background: '#0080ff', filter: 'blur(80px)', bottom: '20%', right: '-5%', animationDelay: '2s' }}
        />
      </div>

      <div className="relative max-w-2xl mx-auto px-4 pt-4">

        {/* ── Header ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6 pt-2"
        >
          <button
            onClick={() => setLocation('/')}
            className="p-2 rounded-xl bg-white/5 border border-white/08 text-white/50 hover:text-white hover:bg-white/10 transition-all"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-white font-black text-xl tracking-tight">{t('tokensale.title')}</h1>
            <p className="text-teal-400 text-xs font-medium mt-0.5">{t('tokensale.subtitle')}</p>
          </div>
        </motion.div>

        {/* ── User balance (if logged in) ─────────────────────── */}
        <AnimatePresence>
          {isAuthenticated && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4"
            >
              <div
                className="flex items-center justify-between px-4 py-3 rounded-xl border"
                style={{ background: 'rgba(0,230,200,0.05)', borderColor: 'rgba(0,230,200,0.15)' }}
              >
                <div className="flex items-center gap-2">
                  <Wallet size={15} style={{ color: '#00e6c8' }} />
                  <span className="text-white/70 text-sm">{t('tokensale.balance')}</span>
                  <span className="text-teal-400 font-bold text-sm">0 VOD</span>
                </div>
                <button
                  onClick={() => setLocation('/profile')}
                  className="text-white/35 text-xs hover:text-white/70 transition-colors underline underline-offset-2"
                >
                  {t('tokensale.purchase_history')}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Presale Progress Card ───────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-4"
        >
          <GlassCard>
            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-white text-sm font-bold">
                  {(SOLD / 1_000_000).toFixed(1)}M / {(TOTAL_SUPPLY / 1_000_000).toFixed(0)}M VOD
                </span>
                <span className="text-teal-400 text-xs font-bold">{soldPct.toFixed(1)}% Stage 1</span>
              </div>
              <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${soldPct}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #00e6c8, #00b4ff)' }}
                />
              </div>
              <p className="text-white/35 text-xs mt-1.5">{t('tokensale.sold')}</p>
            </div>

            {/* Price info */}
            <div className="flex gap-3 mb-4">
              <div
                className="flex-1 rounded-xl p-3 border"
                style={{ background: 'rgba(0,230,200,0.06)', borderColor: 'rgba(0,230,200,0.15)' }}
              >
                <div className="text-white/40 text-[10px] uppercase tracking-wider font-semibold mb-1">{t('tokensale.current_price')}</div>
                <div className="text-teal-400 font-black text-xl">$0.20</div>
              </div>
              <div
                className="flex-1 rounded-xl p-3 border"
                style={{ background: 'rgba(251,191,36,0.06)', borderColor: 'rgba(251,191,36,0.15)' }}
              >
                <div className="text-white/40 text-[10px] uppercase tracking-wider font-semibold mb-1">{t('tokensale.next_stage')}</div>
                <div className="text-yellow-400 font-black text-xl">$0.40</div>
              </div>
            </div>

            {/* Countdown */}
            <div className="mb-4">
              <div className="flex items-center gap-1.5 mb-3">
                <Clock size={13} className="text-white/35" />
                <span className="text-white/40 text-xs font-semibold uppercase tracking-wider">{t('tokensale.stage1_end')}</span>
              </div>
              <div className="flex gap-3 justify-center">
                <CountdownUnit value={countdown.d} label={t('tokensale.days')} />
                <CountdownUnit value={countdown.h} label={t('tokensale.hours')} />
                <CountdownUnit value={countdown.m} label={t('tokensale.minutes')} />
                <CountdownUnit value={countdown.s} label={t('tokensale.seconds')} />
              </div>
            </div>

            {/* Launch status */}
            <div className="pt-3 border-t text-center" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: 'rgba(0,230,200,0.12)', color: '#00e6c8', border: '1px solid rgba(0,230,200,0.25)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                {t('tokensale.presale_open')}
              </div>
              <p className="text-white/30 text-[10px] mt-1.5">{t('tokensale.data_realtime')}</p>
            </div>
          </GlassCard>
        </motion.div>

        {/* ── Token Calculator ────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-4"
        >
          <GlassCard>
            <h2 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
              <Coins size={15} className="text-teal-400" />
              {t('tokensale.calculator')}
            </h2>

            <label className="block text-white/40 text-xs font-semibold uppercase tracking-wider mb-2">
              {t('tokensale.amount_label')}
            </label>
            <input
              type="number"
              min={1}
              value={tokenAmount}
              onChange={(e) => setTokenAmount(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full rounded-xl px-4 py-3 text-white font-bold text-lg bg-white/5 border border-white/10 focus:outline-none focus:border-teal-400/50 transition-colors mb-4"
            />

            {/* Tier bonus indicator */}
            <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
              {[
                { range: '100–999 VOD', bonus: t('tokensale.no_bonus'), active: tokenAmount < 1000 },
                { range: '1,000–9,999 VOD', bonus: '+5%', active: tokenAmount >= 1000 && tokenAmount < 10_000 },
                { range: '10,000–99,999 VOD', bonus: '+10%', active: tokenAmount >= 10_000 && tokenAmount < 100_000 },
                { range: '100,000+ VOD', bonus: '+15%', active: tokenAmount >= 100_000 },
              ].map(({ range, bonus: b, active }) => (
                <div
                  key={range}
                  className="flex items-center justify-between px-3 py-2 rounded-lg border transition-all"
                  style={{
                    background: active ? 'rgba(0,230,200,0.08)' : 'rgba(255,255,255,0.02)',
                    borderColor: active ? 'rgba(0,230,200,0.25)' : 'rgba(255,255,255,0.05)',
                  }}
                >
                  <span className={active ? 'text-teal-300' : 'text-white/30'}>{range}</span>
                  <span className={`font-bold ${active ? 'text-teal-400' : 'text-white/20'}`}>{b}</span>
                </div>
              ))}
            </div>

            {/* Results */}
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <span className="text-white/50 text-sm">{t('tokensale.cost')}</span>
                <span className="text-white font-bold">${costUsd}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <span className="text-white/50 text-sm">{t('tokensale.water_volume')}</span>
                <span className="text-blue-400 font-bold">{waterM3} м³</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <span className="text-white/50 text-sm">{t('tokensale.tier_bonus')}</span>
                <span className="text-yellow-400 font-bold">{getTierLabel(tokenAmount, t)}</span>
              </div>
              <div className="flex justify-between items-center py-3 rounded-xl px-3" style={{ background: 'rgba(0,230,200,0.06)' }}>
                <span className="text-teal-300 font-bold text-sm">{t('tokensale.total_with_bonus')}</span>
                <span className="text-teal-400 font-black text-lg">{totalWithBonus.toLocaleString('ru-RU')} VOD</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* ── Payment Tabs ────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-4"
        >
          <GlassCard>
            {/* Tab switcher */}
            <div className="flex gap-2 mb-5 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
              {([
                { id: 'card' as const, labelKey: 'tokensale.tab_card' },
                { id: 'crypto' as const, labelKey: 'tokensale.tab_crypto' },
              ]).map(({ id, labelKey }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
                  style={{
                    background: activeTab === id ? 'rgba(0,230,200,0.15)' : 'transparent',
                    color: activeTab === id ? '#00e6c8' : 'rgba(255,255,255,0.4)',
                    border: activeTab === id ? '1px solid rgba(0,230,200,0.25)' : '1px solid transparent',
                  }}
                >
                  {t(labelKey)}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'card' && (
                <motion.div
                  key="card"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="space-y-3">
                    <div>
                      <label className="block text-white/40 text-xs font-semibold uppercase tracking-wider mb-1.5">Email</label>
                      <input
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-xl px-4 py-3 text-white bg-white/5 border border-white/10 focus:outline-none focus:border-teal-400/50 transition-colors text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-white/40 text-xs font-semibold uppercase tracking-wider mb-1.5">{t('tokensale.card_number')}</label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        readOnly
                        className="w-full rounded-xl px-4 py-3 text-white/40 bg-white/5 border border-white/10 text-sm cursor-not-allowed"
                      />
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="block text-white/40 text-xs font-semibold uppercase tracking-wider mb-1.5">{t('tokensale.expiry')}</label>
                        <input
                          type="text"
                          placeholder="12/27"
                          readOnly
                          className="w-full rounded-xl px-4 py-3 text-white/40 bg-white/5 border border-white/10 text-sm cursor-not-allowed"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-white/40 text-xs font-semibold uppercase tracking-wider mb-1.5">CVC</label>
                        <input
                          type="text"
                          placeholder="•••"
                          readOnly
                          className="w-full rounded-xl px-4 py-3 text-white/40 bg-white/5 border border-white/10 text-sm cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => setShowStripeModal(true)}
                      className="w-full py-3.5 rounded-xl font-bold text-black transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2"
                      style={{ background: 'linear-gradient(135deg, #00e6c8, #00b4ff)' }}
                    >
                      <CreditCard size={16} />
                      {t('tokensale.pay_button', { amount: costUsd })}
                    </button>

                    <p className="text-white/25 text-xs text-center flex items-center justify-center gap-1.5">
                      <CheckCircle2 size={11} className="text-green-400/60" />
                      {t('tokensale.secure_payment')}
                    </p>
                  </div>
                </motion.div>
              )}

              {activeTab === 'crypto' && (
                <motion.div
                  key="crypto"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Coin selector */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {CRYPTO_OPTIONS.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedCrypto(c.id)}
                        className="flex items-center gap-2.5 px-3 py-3 rounded-xl border transition-all text-left"
                        style={{
                          background: selectedCrypto === c.id ? `${c.color}12` : 'rgba(255,255,255,0.02)',
                          borderColor: selectedCrypto === c.id ? `${c.color}40` : 'rgba(255,255,255,0.07)',
                        }}
                      >
                        <span className="text-xl">{c.emoji}</span>
                        <div>
                          <div className="font-bold text-sm" style={{ color: selectedCrypto === c.id ? c.color : 'rgba(255,255,255,0.7)' }}>
                            {c.symbol}
                          </div>
                          <div className="text-white/30 text-[10px]">{c.network}</div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* QR + address */}
                  <div
                    className="rounded-xl border p-4 mb-3 flex flex-col items-center"
                    style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.07)' }}
                  >
                    <div className="mb-3 rounded-xl overflow-hidden border-2" style={{ borderColor: selectedCryptoData.color + '30' }}>
                      <img
                        src={qrUrl}
                        alt="QR code"
                        width={140}
                        height={140}
                        className="block"
                        style={{ filter: 'invert(1) hue-rotate(180deg)' }}
                      />
                    </div>
                    <div className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <span className="flex-1 text-white/40 text-xs font-mono break-all leading-relaxed">
                        {selectedCryptoData.address}
                      </span>
                      <button
                        onClick={handleCopy}
                        className="shrink-0 p-1.5 rounded-lg transition-all hover:bg-white/10"
                        style={{ color: copied ? '#22c55e' : 'rgba(255,255,255,0.4)' }}
                        title={t('tokensale.copy_address')}
                      >
                        {copied ? <Check size={15} /> : <Copy size={15} />}
                      </button>
                    </div>
                  </div>

                  <p className="text-white/35 text-xs text-center mb-3">
                    {t('tokensale.after_payment')}{' '}
                    <span className="text-teal-400 font-medium">invest@vodprom.uz</span>
                  </p>

                  {/* Amber warning */}
                  <div
                    className="flex items-start gap-2 px-3 py-2.5 rounded-xl border"
                    style={{ background: 'rgba(251,191,36,0.06)', borderColor: 'rgba(251,191,36,0.2)' }}
                  >
                    <AlertTriangle size={14} className="text-yellow-400 shrink-0 mt-0.5" />
                    <p className="text-yellow-400/80 text-xs leading-relaxed">
                      {t('tokensale.wallet_warning')}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>
        </motion.div>

        {/* ── How It Works ────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-4"
        >
          <GlassCard>
            <h2 className="text-white font-bold text-sm mb-4">{t('tokensale.how_it_works')}</h2>
            <div className="space-y-3">
              {[
                { n: 1, textKey: 'tokensale.step1' },
                { n: 2, textKey: 'tokensale.step2' },
                { n: 3, textKey: 'tokensale.step3' },
              ].map(({ n, textKey }) => (
                <div key={n} className="flex items-start gap-3">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5"
                    style={{ background: 'rgba(0,230,200,0.12)', color: '#00e6c8', border: '1px solid rgba(0,230,200,0.2)' }}
                  >
                    {n}
                  </div>
                  <p className="text-white/55 text-sm leading-relaxed">{t(textKey)}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* ── FAQ ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-6"
        >
          <GlassCard>
            <h2 className="text-white font-bold text-sm mb-4">{t('tokensale.faq_title')}</h2>
            <div className="space-y-2">
              {faqItems.map((item, i) => (
                <div
                  key={i}
                  className="rounded-xl border overflow-hidden transition-all"
                  style={{ borderColor: faqOpen === i ? 'rgba(0,230,200,0.2)' : 'rgba(255,255,255,0.06)' }}
                >
                  <button
                    className="w-full flex items-center justify-between px-4 py-3 text-left"
                    onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  >
                    <span className="text-white/80 text-sm font-medium pr-2">{item.q}</span>
                    {faqOpen === i
                      ? <ChevronUp size={15} className="text-teal-400 shrink-0" />
                      : <ChevronDown size={15} className="text-white/30 shrink-0" />}
                  </button>
                  <AnimatePresence>
                    {faqOpen === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-3 pt-1">
                          <p className="text-white/40 text-sm leading-relaxed">{item.a}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* ── Stripe Modal ─────────────────────────────────────── */}
      <AnimatePresence>
        {showStripeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
            onClick={() => setShowStripeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 22 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm rounded-2xl border p-6 text-center"
              style={{ background: 'rgba(0,8,24,0.98)', borderColor: 'rgba(255,255,255,0.1)' }}
            >
              <button
                onClick={() => setShowStripeModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors"
              >
                <X size={15} />
              </button>
              <div className="text-4xl mb-3">⚙️</div>
              <h3 className="text-white font-black text-lg mb-2">{t('tokensale.modal_title')}</h3>
              <p className="text-white/45 text-sm leading-relaxed mb-4">
                {t('tokensale.modal_desc')}
              </p>
              <div
                className="px-4 py-3 rounded-xl border mb-4"
                style={{ background: 'rgba(0,230,200,0.06)', borderColor: 'rgba(0,230,200,0.2)' }}
              >
                <p className="text-teal-300 text-sm font-medium">{t('tokensale.modal_accepting')}</p>
                <p className="text-white/70 text-xs mt-1">{t('tokensale.modal_payment_methods')}</p>
              </div>
              <button
                onClick={() => { setShowStripeModal(false); setLocation('/invest/apply'); }}
                className="w-full py-3 rounded-xl font-bold text-black mb-2"
                style={{ background: 'linear-gradient(135deg, #00e6c8, #00b4ff)' }}
              >
                {t('tokensale.modal_submit')}
              </button>
              <button
                onClick={() => setShowStripeModal(false)}
                className="w-full py-2 rounded-xl text-sm text-white/40 hover:text-white/70 transition-colors"
              >
                {t('tokensale.modal_cancel')}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
