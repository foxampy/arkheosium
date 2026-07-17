import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, TrendingUp, User, Bitcoin,
  Droplets, BarChart2, DollarSign, Repeat,
  Landmark, CreditCard, Wallet, ArrowRight, ArrowLeft,
  Copy, Check, CheckCircle2, AlertTriangle, ChevronRight,
  Globe, Mail, Phone, FileText, Shield,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

// ─── Types ────────────────────────────────────────────────────

type InvestorType = 'bank' | 'fund' | 'corporate' | 'individual' | 'crypto';
type InvestmentType = 'token_vod' | 'project_equity' | 'project_debt' | 'hybrid';
type PaymentMethod = 'wire' | 'stripe_card' | 'usdt_trc20' | 'eth' | 'btc' | 'trx';
type FundType = 'pe' | 'vc' | 'hedge' | 'sovereign' | 'pension' | 'family_office' | 'other';
type NetWorthTier = 'under_100k' | '100k_1m' | '1m_10m' | 'over_10m';
type RiskTolerance = 'conservative' | 'moderate' | 'aggressive';
type InvestmentExperience = 'beginner' | 'intermediate' | 'experienced' | 'professional';

interface FormState {
  investor_type: InvestorType | '';
  investment_type: InvestmentType | '';
  amount_usd: number;
  currency: string;
  payment_method: PaymentMethod | '';
  full_name: string;
  email: string;
  phone: string;
  country: string;
  company_name: string;
  bank_name: string;
  swift_bic: string;
  iban_account: string;
  correspondent_bank: string;
  regulatory_jurisdiction: string;
  fund_type: FundType | '';
  aum_usd: string;
  investment_mandate: string;
  investment_horizon: string;
  gp_name: string;
  accredited_investor: boolean;
  industry: string;
  partnership_goals: string;
  net_worth_tier: NetWorthTier | '';
  risk_tolerance: RiskTolerance | '';
  investment_experience: InvestmentExperience | '';
  source_of_funds: string;
  crypto_wallet_address: string;
  crypto_network: string;
  crypto_tx_hash: string;
  token_amount: number;
  presale_stage: string;
  kyc_agreed: boolean;
  terms_agreed: boolean;
  aml_agreed: boolean;
  message: string;
}

// ─── Style helpers ────────────────────────────────────────────

const GLASS = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
};
const GLASS_STRONG = {
  background: 'rgba(0,8,24,0.85)',
  border: '1px solid rgba(0,230,200,0.12)',
  backdropFilter: 'blur(20px)',
};
const TEAL = '#00e6c8';
const INPUT_CLASS =
  'w-full rounded-xl px-4 py-3 text-sm text-white bg-white/[0.05] border border-white/10 ' +
  'focus:outline-none focus:border-teal-400/60 focus:ring-1 focus:ring-teal-400/30 placeholder-white/25 transition';
const SELECT_CLASS =
  'w-full rounded-xl px-4 py-3 text-sm text-white bg-[#000d20] border border-white/10 ' +
  'focus:outline-none focus:border-teal-400/60 focus:ring-1 focus:ring-teal-400/30 transition cursor-pointer';
const LABEL_CLASS = 'block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider';

// ─── Step motion variants ─────────────────────────────────────

const stepVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0, transition: { duration: 0.2 } }),
};

// ─── Step Indicator ───────────────────────────────────────────

const STEP_LABELS = ['Тип', 'Объект', 'Данные', 'Оплата', 'Итог'];

function StepIndicator({ current, total }: { current: number; total: number }) {
  const pct = ((current - 1) / (total - 1)) * 100;
  return (
    <div className="w-full mb-8">
      {/* Progress bar */}
      <div className="h-1 rounded-full bg-white/8 mb-4 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${TEAL}, #0099ff)` }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>
      {/* Circles */}
      <div className="flex items-center justify-between">
        {STEP_LABELS.map((label, i) => {
          const n = i + 1;
          const done = n < current;
          const active = n === current;
          return (
            <div key={n} className="flex flex-col items-center gap-1.5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                style={{
                  background: done ? TEAL : active ? 'rgba(0,230,200,0.15)' : 'rgba(255,255,255,0.05)',
                  border: `2px solid ${done || active ? TEAL : 'rgba(255,255,255,0.12)'}`,
                  color: done ? '#000818' : active ? TEAL : 'rgba(255,255,255,0.35)',
                  boxShadow: active ? `0 0 12px ${TEAL}50` : 'none',
                }}
              >
                {done ? <Check size={12} /> : n}
              </div>
              <span
                className="text-[10px] font-medium hidden sm:block"
                style={{ color: active ? TEAL : 'rgba(255,255,255,0.3)' }}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Nav Buttons ──────────────────────────────────────────────

function NavButtons({
  onBack, onNext, nextLabel = 'Далее', nextDisabled = false, loading = false,
}: {
  onBack?: () => void; onNext?: () => void;
  nextLabel?: string; nextDisabled?: boolean; loading?: boolean;
}) {
  return (
    <div className="flex gap-3 mt-8">
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium text-white/60 hover:text-white cursor-pointer transition-colors"
          style={GLASS}
        >
          <ArrowLeft size={15} /> Назад
        </button>
      )}
      {onNext && (
        <button
          onClick={onNext}
          disabled={nextDisabled || loading}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer"
          style={{
            background: nextDisabled || loading
              ? 'rgba(255,255,255,0.06)'
              : `linear-gradient(135deg, ${TEAL}, #0099ff)`,
            color: nextDisabled || loading ? 'rgba(255,255,255,0.25)' : '#000818',
            boxShadow: nextDisabled || loading ? 'none' : `0 4px 20px ${TEAL}30`,
          }}
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <>{nextLabel} <ArrowRight size={15} /></>
          )}
        </button>
      )}
    </div>
  );
}

// ─── Field components ─────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={LABEL_CLASS}>{label}</label>
      {children}
    </div>
  );
}

// ─── STEP 1: Investor Type ────────────────────────────────────

const INVESTOR_TYPES: { id: InvestorType; icon: typeof Building2; title: string; sub: string; color: string }[] = [
  { id: 'bank', icon: Landmark, title: 'Банк', sub: 'Корпоративное финансирование', color: '#60a5fa' },
  { id: 'fund', icon: TrendingUp, title: 'Инвестиционный фонд', sub: 'PE, VC, хедж, суверенный', color: '#a78bfa' },
  { id: 'corporate', icon: Building2, title: 'Корпорация', sub: 'Стратегическое партнёрство', color: '#4ade80' },
  { id: 'individual', icon: User, title: 'Частный инвестор', sub: 'Аккредитованный инвестор', color: '#fbbf24' },
  { id: 'crypto', icon: Bitcoin, title: 'Крипто-инвестор', sub: 'USDT, ETH, BTC, TRX', color: TEAL },
];

function Step1({ form, onChange }: { form: FormState; onChange: (f: Partial<FormState>) => void }) {
  return (
    <div>
      <h2 className="text-2xl font-black text-white mb-1">Кто вы?</h2>
      <p className="text-white/40 text-sm mb-6">Выберите тип инвестора для персонализации формы</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {INVESTOR_TYPES.map(({ id, icon: Icon, title, sub, color }) => {
          const active = form.investor_type === id;
          return (
            <button
              key={id}
              onClick={() => onChange({ investor_type: id })}
              className="text-left p-4 rounded-2xl transition-all duration-200 cursor-pointer"
              style={{
                background: active ? `${color}12` : 'rgba(255,255,255,0.03)',
                border: `1.5px solid ${active ? color : 'rgba(255,255,255,0.08)'}`,
                boxShadow: active ? `0 0 20px ${color}25` : 'none',
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: `${color}15`, border: `1px solid ${color}25` }}
              >
                <Icon size={18} style={{ color }} />
              </div>
              <div className="text-sm font-bold text-white leading-tight">{title}</div>
              <div className="text-[11px] text-white/40 mt-1 leading-tight">{sub}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── STEP 2: Investment Object ────────────────────────────────

const INVEST_PRODUCTS: { id: InvestmentType; icon: typeof Droplets; title: string; sub: string; minUsd: number }[] = [
  { id: 'token_vod', icon: Droplets, title: 'VOD Токен', sub: 'Пресейл, от $200 (100 VOD × $0.20)', minUsd: 200 },
  { id: 'project_equity', icon: BarChart2, title: 'Проектное участие (equity)', sub: 'Доля в водных проектах', minUsd: 10000 },
  { id: 'project_debt', icon: DollarSign, title: 'Долговое финансирование', sub: 'Кредитование с фиксированным доходом', minUsd: 25000 },
  { id: 'hybrid', icon: Repeat, title: 'Гибрид', sub: 'Токен + проект', minUsd: 5000 },
];

const QUICK_AMOUNTS = [1000, 5000, 25000, 100000, 500000];
const PAYMENT_METHODS: { id: PaymentMethod; icon: typeof Landmark; label: string; sub: string }[] = [
  { id: 'wire', icon: Landmark, label: 'Банковский перевод', sub: 'SWIFT / IBAN' },
  { id: 'stripe_card', icon: CreditCard, label: 'Карта', sub: 'Stripe' },
  { id: 'usdt_trc20', icon: Wallet, label: 'USDT TRC-20', sub: 'Tron сеть' },
  { id: 'eth', icon: Wallet, label: 'ETH', sub: 'ERC-20' },
  { id: 'btc', icon: Bitcoin, label: 'BTC', sub: 'Bitcoin' },
  { id: 'trx', icon: Wallet, label: 'TRX', sub: 'Tron' },
];

function Step2({ form, onChange }: { form: FormState; onChange: (f: Partial<FormState>) => void }) {
  const vodAmount = form.investment_type === 'token_vod' && form.amount_usd > 0
    ? Math.floor(form.amount_usd / 0.2)
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-white mb-1">Объект инвестирования</h2>
        <p className="text-white/40 text-sm mb-4">Выберите инструмент и сумму</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {INVEST_PRODUCTS.map(({ id, icon: Icon, title, sub }) => {
            const active = form.investment_type === id;
            return (
              <button
                key={id}
                onClick={() => onChange({ investment_type: id })}
                className="text-left p-4 rounded-2xl transition-all duration-200 cursor-pointer flex items-start gap-3"
                style={{
                  background: active ? 'rgba(0,230,200,0.08)' : 'rgba(255,255,255,0.03)',
                  border: `1.5px solid ${active ? TEAL : 'rgba(255,255,255,0.08)'}`,
                  boxShadow: active ? `0 0 18px ${TEAL}20` : 'none',
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: active ? `${TEAL}18` : 'rgba(255,255,255,0.05)' }}
                >
                  <Icon size={16} style={{ color: active ? TEAL : 'rgba(255,255,255,0.4)' }} />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{title}</div>
                  <div className="text-[11px] text-white/40 mt-0.5">{sub}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {form.investment_type && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <Field label="Сумма инвестиции (USD)">
            <input
              type="number"
              min={0}
              value={form.amount_usd || ''}
              onChange={e => onChange({ amount_usd: Number(e.target.value) })}
              placeholder="Введите сумму"
              className={INPUT_CLASS}
            />
          </Field>
          <div className="flex flex-wrap gap-2">
            {QUICK_AMOUNTS.map(a => (
              <button
                key={a}
                onClick={() => onChange({ amount_usd: a })}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all"
                style={{
                  background: form.amount_usd === a ? `${TEAL}18` : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${form.amount_usd === a ? TEAL : 'rgba(255,255,255,0.1)'}`,
                  color: form.amount_usd === a ? TEAL : 'rgba(255,255,255,0.5)',
                }}
              >
                {a >= 1000000 ? '$1M+' : a >= 500000 ? '$500K+' : `$${a.toLocaleString()}`}
              </button>
            ))}
          </div>

          {vodAmount !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: `${TEAL}08`, border: `1px solid ${TEAL}20` }}
            >
              <Droplets size={16} style={{ color: TEAL }} />
              <span className="text-sm" style={{ color: TEAL }}>
                = <strong>{vodAmount.toLocaleString()} VOD</strong> токенов по $0.20
              </span>
            </motion.div>
          )}

          <Field label="Валюта">
            <select value={form.currency} onChange={e => onChange({ currency: e.target.value })} className={SELECT_CLASS}>
              <option value="USD">USD — Доллар США</option>
              <option value="EUR">EUR — Евро</option>
              <option value="USDT">USDT — Tether</option>
            </select>
          </Field>
        </motion.div>
      )}

      {form.amount_usd > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <label className={LABEL_CLASS}>Способ оплаты</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {PAYMENT_METHODS.map(({ id, icon: Icon, label, sub }) => {
              const active = form.payment_method === id;
              return (
                <button
                  key={id}
                  onClick={() => onChange({ payment_method: id })}
                  className="text-left p-3 rounded-xl transition-all cursor-pointer"
                  style={{
                    background: active ? 'rgba(0,230,200,0.08)' : 'rgba(255,255,255,0.03)',
                    border: `1.5px solid ${active ? TEAL : 'rgba(255,255,255,0.08)'}`,
                  }}
                >
                  <Icon size={14} style={{ color: active ? TEAL : 'rgba(255,255,255,0.35)' }} className="mb-1.5" />
                  <div className="text-xs font-semibold text-white">{label}</div>
                  <div className="text-[10px] text-white/35 mt-0.5">{sub}</div>
                </button>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─── STEP 3: Personal / Org Data ──────────────────────────────

function Step3({ form, onChange }: { form: FormState; onChange: (f: Partial<FormState>) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-black text-white mb-1">Ваши данные</h2>
        <p className="text-white/40 text-sm mb-4">Заполните информацию об инвесторе</p>
      </div>

      {/* Common fields */}
      <div className="space-y-4">
        <Field label="ФИО / Название организации">
          <input value={form.full_name} onChange={e => onChange({ full_name: e.target.value })} placeholder="Иванов Иван Иванович" className={INPUT_CLASS} />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Email">
            <input type="email" value={form.email} onChange={e => onChange({ email: e.target.value })} placeholder="investor@email.com" className={INPUT_CLASS} />
          </Field>
          <Field label="Телефон">
            <input type="tel" value={form.phone} onChange={e => onChange({ phone: e.target.value })} placeholder="+998 90 123 45 67" className={INPUT_CLASS} />
          </Field>
        </div>
        <Field label="Страна">
          <input value={form.country} onChange={e => onChange({ country: e.target.value })} placeholder="Узбекистан" className={INPUT_CLASS} />
        </Field>
      </div>

      {/* Bank-specific */}
      {form.investor_type === 'bank' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pt-2">
          <div className="text-xs text-white/30 uppercase tracking-wider font-semibold border-t border-white/8 pt-4">Реквизиты банка</div>
          <Field label="Название банка"><input value={form.bank_name} onChange={e => onChange({ bank_name: e.target.value })} placeholder="Kapitalbank" className={INPUT_CLASS} /></Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="SWIFT / BIC"><input value={form.swift_bic} onChange={e => onChange({ swift_bic: e.target.value })} placeholder="KPCBUZ22" className={INPUT_CLASS} /></Field>
            <Field label="IBAN / Счёт"><input value={form.iban_account} onChange={e => onChange({ iban_account: e.target.value })} placeholder="UZ00 KPCB..." className={INPUT_CLASS} /></Field>
          </div>
          <Field label="Банк-корреспондент"><input value={form.correspondent_bank} onChange={e => onChange({ correspondent_bank: e.target.value })} placeholder="Deutsche Bank" className={INPUT_CLASS} /></Field>
          <Field label="Регуляторная юрисдикция"><input value={form.regulatory_jurisdiction} onChange={e => onChange({ regulatory_jurisdiction: e.target.value })} placeholder="Узбекистан, CBU" className={INPUT_CLASS} /></Field>
        </motion.div>
      )}

      {/* Fund-specific */}
      {form.investor_type === 'fund' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pt-2">
          <div className="text-xs text-white/30 uppercase tracking-wider font-semibold border-t border-white/8 pt-4">Параметры фонда</div>
          <Field label="Название фонда"><input value={form.company_name} onChange={e => onChange({ company_name: e.target.value })} placeholder="VODPROM Capital Fund I" className={INPUT_CLASS} /></Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Тип фонда">
              <select value={form.fund_type} onChange={e => onChange({ fund_type: e.target.value as FundType })} className={SELECT_CLASS}>
                <option value="">Выбрать</option>
                <option value="pe">Private Equity</option>
                <option value="vc">Venture Capital</option>
                <option value="hedge">Хедж-фонд</option>
                <option value="sovereign">Суверенный фонд</option>
                <option value="pension">Пенсионный фонд</option>
                <option value="family_office">Family Office</option>
                <option value="other">Другое</option>
              </select>
            </Field>
            <Field label="AUM (объём активов)">
              <select value={form.aum_usd} onChange={e => onChange({ aum_usd: e.target.value })} className={SELECT_CLASS}>
                <option value="">Выбрать</option>
                <option value="under_10m">До $10 млн</option>
                <option value="10m_100m">$10–100 млн</option>
                <option value="100m_1b">$100 млн – $1 млрд</option>
                <option value="over_1b">Свыше $1 млрд</option>
              </select>
            </Field>
          </div>
          <Field label="Инвестиционный мандат">
            <textarea value={form.investment_mandate} onChange={e => onChange({ investment_mandate: e.target.value })} maxLength={200} rows={3} placeholder="Стратегия и цели фонда..." className={INPUT_CLASS + ' resize-none'} />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Горизонт инвестирования">
              <select value={form.investment_horizon} onChange={e => onChange({ investment_horizon: e.target.value })} className={SELECT_CLASS}>
                <option value="">Выбрать</option>
                <option value="under_1yr">До 1 года</option>
                <option value="1_3yr">1–3 года</option>
                <option value="3_5yr">3–5 лет</option>
                <option value="over_5yr">5+ лет</option>
              </select>
            </Field>
            <Field label="GP контакт"><input value={form.gp_name} onChange={e => onChange({ gp_name: e.target.value })} placeholder="Имя партнёра" className={INPUT_CLASS} /></Field>
          </div>
          <label className="flex items-center gap-3 cursor-pointer group">
            <div
              onClick={() => onChange({ accredited_investor: !form.accredited_investor })}
              className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all"
              style={{ background: form.accredited_investor ? TEAL : 'rgba(255,255,255,0.08)', border: `1.5px solid ${form.accredited_investor ? TEAL : 'rgba(255,255,255,0.2)'}` }}
            >
              {form.accredited_investor && <Check size={11} color="#000818" strokeWidth={3} />}
            </div>
            <span className="text-sm text-white/70">Аккредитованный инвестор (SEC / CIMA / FSA)</span>
          </label>
        </motion.div>
      )}

      {/* Corporate-specific */}
      {form.investor_type === 'corporate' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pt-2">
          <div className="text-xs text-white/30 uppercase tracking-wider font-semibold border-t border-white/8 pt-4">Данные компании</div>
          <Field label="Название компании"><input value={form.company_name} onChange={e => onChange({ company_name: e.target.value })} placeholder="ACME Water Corp" className={INPUT_CLASS} /></Field>
          <Field label="Отрасль">
            <select value={form.industry} onChange={e => onChange({ industry: e.target.value })} className={SELECT_CLASS}>
              <option value="">Выбрать</option>
              <option value="water_tech">Водные технологии</option>
              <option value="energy">Энергетика</option>
              <option value="real_estate">Недвижимость</option>
              <option value="finance">Финансы</option>
              <option value="other">Другое</option>
            </select>
          </Field>
          <Field label="Цели партнёрства">
            <textarea value={form.partnership_goals} onChange={e => onChange({ partnership_goals: e.target.value })} rows={3} placeholder="Опишите стратегические цели..." className={INPUT_CLASS + ' resize-none'} />
          </Field>
        </motion.div>
      )}

      {/* Individual-specific */}
      {form.investor_type === 'individual' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pt-2">
          <div className="text-xs text-white/30 uppercase tracking-wider font-semibold border-t border-white/8 pt-4">Профиль инвестора</div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Уровень состояния">
              <select value={form.net_worth_tier} onChange={e => onChange({ net_worth_tier: e.target.value as NetWorthTier })} className={SELECT_CLASS}>
                <option value="">Выбрать</option>
                <option value="under_100k">До $100 тыс</option>
                <option value="100k_1m">$100 тыс – $1 млн</option>
                <option value="1m_10m">$1–10 млн</option>
                <option value="over_10m">Свыше $10 млн</option>
              </select>
            </Field>
            <Field label="Опыт инвестирования">
              <select value={form.investment_experience} onChange={e => onChange({ investment_experience: e.target.value as InvestmentExperience })} className={SELECT_CLASS}>
                <option value="">Выбрать</option>
                <option value="beginner">Начинающий</option>
                <option value="intermediate">Средний</option>
                <option value="experienced">Опытный</option>
                <option value="professional">Профессионал</option>
              </select>
            </Field>
          </div>
          <Field label="Риск-профиль">
            <div className="flex gap-3">
              {(['conservative', 'moderate', 'aggressive'] as RiskTolerance[]).map(r => {
                const labels = { conservative: 'Консервативный', moderate: 'Умеренный', aggressive: 'Агрессивный' };
                const colors = { conservative: '#4ade80', moderate: '#fbbf24', aggressive: '#f87171' };
                return (
                  <button key={r} onClick={() => onChange({ risk_tolerance: r })} className="flex-1 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all"
                    style={{ background: form.risk_tolerance === r ? `${colors[r]}15` : 'rgba(255,255,255,0.03)', border: `1.5px solid ${form.risk_tolerance === r ? colors[r] : 'rgba(255,255,255,0.08)'}`, color: form.risk_tolerance === r ? colors[r] : 'rgba(255,255,255,0.45)' }}>
                    {labels[r]}
                  </button>
                );
              })}
            </div>
          </Field>
          <Field label="Источник средств">
            <select value={form.source_of_funds} onChange={e => onChange({ source_of_funds: e.target.value })} className={SELECT_CLASS}>
              <option value="">Выбрать</option>
              <option value="salary">Зарплата / доход</option>
              <option value="business">Бизнес</option>
              <option value="inheritance">Наследство</option>
              <option value="investment">Инвестиции</option>
              <option value="other">Другое</option>
            </select>
          </Field>
        </motion.div>
      )}

      {/* Crypto-specific */}
      {form.investor_type === 'crypto' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pt-2">
          <div className="text-xs text-white/30 uppercase tracking-wider font-semibold border-t border-white/8 pt-4">Крипто-реквизиты</div>
          <Field label="Адрес кошелька (для получения VOD)">
            <input value={form.crypto_wallet_address} onChange={e => onChange({ crypto_wallet_address: e.target.value })} placeholder="0x... / T..." className={INPUT_CLASS} />
          </Field>
          <Field label="Предпочтительная сеть">
            <select value={form.crypto_network} onChange={e => onChange({ crypto_network: e.target.value })} className={SELECT_CLASS}>
              <option value="">Выбрать</option>
              <option value="erc20">ETH (ERC-20)</option>
              <option value="trc20">USDT (TRC-20)</option>
              <option value="bitcoin">Bitcoin</option>
              <option value="tron">TRON (TRX)</option>
            </select>
          </Field>
        </motion.div>
      )}
    </div>
  );
}

// ─── STEP 4: Payment Details ──────────────────────────────────

const CRYPTO_ADDRS: Record<string, { addr: string; color: string; label: string }> = {
  usdt_trc20: { addr: 'PLACEHOLDER_USDT_TRC20', color: '#26a17b', label: 'USDT TRC-20' },
  eth: { addr: 'PLACEHOLDER_ETH_ADDRESS', color: '#627eea', label: 'ETH ERC-20' },
  btc: { addr: 'PLACEHOLDER_BTC_ADDRESS', color: '#f7931a', label: 'BTC' },
  trx: { addr: 'PLACEHOLDER_TRX_ADDRESS', color: '#ef0027', label: 'TRX' },
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }, [text]);
  return (
    <button onClick={copy} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all"
      style={{ background: copied ? `${TEAL}15` : 'rgba(255,255,255,0.06)', color: copied ? TEAL : 'rgba(255,255,255,0.5)', border: `1px solid ${copied ? TEAL + '30' : 'rgba(255,255,255,0.1)'}` }}>
      {copied ? <><Check size={12} /> Скопировано</> : <><Copy size={12} /> Копировать</>}
    </button>
  );
}

function Step4({ form, onChange, refCode }: { form: FormState; onChange: (f: Partial<FormState>) => void; refCode: string }) {
  const isCrypto = ['usdt_trc20', 'eth', 'btc', 'trx'].includes(form.payment_method);
  const cryptoInfo = isCrypto ? CRYPTO_ADDRS[form.payment_method] : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-white mb-1">Способ оплаты</h2>
        <p className="text-white/40 text-sm mb-4">Детали перевода и инструкции</p>
      </div>

      {/* Wire transfer */}
      {form.payment_method === 'wire' && (
        <div className="space-y-4">
          <div className="rounded-2xl p-5 space-y-3" style={GLASS}>
            <div className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-3">Реквизиты VODPROM</div>
            {[
              ['Банк', 'Kapitalbank (Tashkent)'],
              ['SWIFT', 'KPCBUZ22'],
              ['IBAN', 'UZ00 KPCB 0000 0000 0000 0000'],
              ['Получатель', 'VODPROM LLC'],
              ['Назначение', `Investment Application #${refCode}`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                <span className="text-xs text-white/40">{k}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-white">{v}</span>
                  <CopyButton text={v} />
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)' }}>
            <Mail size={16} className="text-blue-400 mt-0.5 shrink-0" />
            <p className="text-sm text-blue-300/80">После перевода отправьте подтверждение на: <strong className="text-blue-300">invest@vodprom.uz</strong></p>
          </div>
          <Field label="Загрузка квитанции">
            <input disabled placeholder="Загрузка квитанции — скоро" className={INPUT_CLASS + ' opacity-40 cursor-not-allowed'} />
          </Field>
        </div>
      )}

      {/* Stripe card */}
      {form.payment_method === 'stripe_card' && (
        <div className="space-y-4">
          <div className="rounded-2xl p-5 space-y-4" style={GLASS}>
            <Field label="Номер карты">
              <input placeholder="0000 0000 0000 0000" maxLength={19} className={INPUT_CLASS} disabled />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="MM/YY"><input placeholder="MM/YY" className={INPUT_CLASS} disabled /></Field>
              <Field label="CVC"><input placeholder="CVC" maxLength={4} className={INPUT_CLASS} disabled /></Field>
            </div>
            <Field label="Имя на карте"><input placeholder="IVAN IVANOV" className={INPUT_CLASS} disabled /></Field>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
            <AlertTriangle size={16} className="text-yellow-400 mt-0.5 shrink-0" />
            <p className="text-sm text-yellow-300/80">Stripe интеграция в процессе. Заявка будет создана, оплата подтверждается командой.</p>
          </div>
        </div>
      )}

      {/* Crypto */}
      {isCrypto && cryptoInfo && (
        <div className="space-y-4">
          <div className="rounded-2xl p-5 space-y-4" style={GLASS}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold" style={{ color: cryptoInfo.color }}>{cryptoInfo.label}</span>
            </div>
            <div className="flex justify-center py-2">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${cryptoInfo.addr}&bgcolor=000818&color=00e6c8`}
                alt="QR код кошелька"
                className="rounded-xl border border-white/10"
                width={160}
                height={160}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Адрес кошелька</label>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/8">
                <code className="text-xs text-white/70 flex-1 break-all">{cryptoInfo.addr}</code>
                <CopyButton text={cryptoInfo.addr} />
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.18)' }}>
            <AlertTriangle size={15} className="text-yellow-400 mt-0.5 shrink-0" />
            <p className="text-xs text-yellow-300/70">Адреса будут обновлены. Уточняйте актуальные у команды: <strong className="text-yellow-300">invest@vodprom.uz</strong></p>
          </div>
          <Field label="Хэш транзакции (после отправки)">
            <input value={form.crypto_tx_hash} onChange={e => onChange({ crypto_tx_hash: e.target.value })} placeholder="0x..." className={INPUT_CLASS} />
          </Field>
        </div>
      )}
    </div>
  );
}

// ─── STEP 5: Review & Submit ──────────────────────────────────

function ReviewRow({ label, value }: { label: string; value: string | number }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex justify-between items-start py-2 border-b border-white/5 last:border-0">
      <span className="text-xs text-white/40 shrink-0 mr-4">{label}</span>
      <span className="text-xs font-medium text-white text-right">{String(value)}</span>
    </div>
  );
}

function Step5({ form, onChange, onSubmit, loading }: {
  form: FormState; onChange: (f: Partial<FormState>) => void;
  onSubmit: () => void; loading: boolean;
}) {
  const allChecked = form.kyc_agreed && form.terms_agreed && form.aml_agreed;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-white mb-1">Подтверждение</h2>
        <p className="text-white/40 text-sm mb-4">Проверьте данные и отправьте заявку</p>
      </div>

      {/* Review card */}
      <div className="rounded-2xl p-5 space-y-1" style={GLASS}>
        <ReviewRow label="Тип инвестора" value={INVESTOR_TYPES.find(t => t.id === form.investor_type)?.title ?? ''} />
        <ReviewRow label="Инструмент" value={INVEST_PRODUCTS.find(p => p.id === form.investment_type)?.title ?? ''} />
        <ReviewRow label="Сумма" value={form.amount_usd ? `$${form.amount_usd.toLocaleString()} ${form.currency}` : ''} />
        <ReviewRow label="Способ оплаты" value={PAYMENT_METHODS.find(m => m.id === form.payment_method)?.label ?? ''} />
        <ReviewRow label="ФИО / Организация" value={form.full_name} />
        <ReviewRow label="Email" value={form.email} />
        <ReviewRow label="Телефон" value={form.phone} />
        <ReviewRow label="Страна" value={form.country} />
        {form.company_name && <ReviewRow label="Компания" value={form.company_name} />}
        {form.investor_type === 'individual' && form.net_worth_tier && <ReviewRow label="Состояние" value={form.net_worth_tier} />}
        {form.crypto_wallet_address && <ReviewRow label="Кошелёк" value={form.crypto_wallet_address} />}
      </div>

      {/* Checkboxes */}
      <div className="space-y-3">
        {[
          { key: 'kyc_agreed' as const, text: 'Я подтверждаю, что предоставленные данные достоверны и прохожу KYC верификацию' },
          { key: 'terms_agreed' as const, text: 'Я прочитал и принимаю Условия использования платформы VODPROM' },
          { key: 'aml_agreed' as const, text: 'Я подтверждаю, что источник средств является законным (Anti-Money Laundering)' },
        ].map(({ key, text }) => (
          <label key={key} className="flex items-start gap-3 cursor-pointer group">
            <div
              onClick={() => onChange({ [key]: !form[key] })}
              className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-all"
              style={{ background: form[key] ? TEAL : 'rgba(255,255,255,0.06)', border: `1.5px solid ${form[key] ? TEAL : 'rgba(255,255,255,0.18)'}` }}
            >
              {form[key] && <Check size={11} color="#000818" strokeWidth={3} />}
            </div>
            <span className="text-sm text-white/65 leading-relaxed">{text}</span>
          </label>
        ))}
      </div>

      {/* Optional message */}
      <Field label="Дополнительная информация (опционально)">
        <textarea value={form.message} onChange={e => onChange({ message: e.target.value })} rows={3} placeholder="Любые комментарии к заявке..." className={INPUT_CLASS + ' resize-none'} />
      </Field>

      {/* Submit */}
      <button
        onClick={onSubmit}
        disabled={!allChecked || loading}
        className="w-full py-4 rounded-2xl text-base font-black flex items-center justify-center gap-2 transition-all cursor-pointer"
        style={{
          background: allChecked && !loading ? `linear-gradient(135deg, ${TEAL}, #0099ff)` : 'rgba(255,255,255,0.06)',
          color: allChecked && !loading ? '#000818' : 'rgba(255,255,255,0.2)',
          boxShadow: allChecked && !loading ? `0 6px 30px ${TEAL}35` : 'none',
        }}
      >
        {loading
          ? <><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> Отправка...</>
          : <><Shield size={18} /> Отправить заявку</>
        }
      </button>
    </div>
  );
}

// ─── Success Screen ───────────────────────────────────────────

function SuccessScreen({ refCode, onHome, onProfile }: { refCode: string; onHome: () => void; onProfile: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
      className="text-center py-12 px-4">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
        className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
        style={{ background: `${TEAL}15`, border: `2px solid ${TEAL}`, boxShadow: `0 0 40px ${TEAL}35` }}>
        <motion.div initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}>
          <CheckCircle2 size={40} style={{ color: TEAL }} />
        </motion.div>
      </motion.div>
      <h2 className="text-2xl font-black text-white mb-2">Заявка #{refCode} отправлена!</h2>
      <p className="text-white/50 text-sm mb-2">Наша команда свяжется с вами в течение 24 часов.</p>
      <p className="text-white/35 text-sm mb-8">
        <Mail size={13} className="inline mr-1" />
        invest@vodprom.uz
      </p>
      <div className="flex gap-3 justify-center">
        <button onClick={onHome} className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)' }}>
          <Globe size={15} /> На главную
        </button>
        <button onClick={onProfile} className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold cursor-pointer transition-all"
          style={{ background: `linear-gradient(135deg, ${TEAL}, #0099ff)`, color: '#000818', boxShadow: `0 4px 18px ${TEAL}30` }}>
          <User size={15} /> Профиль <ChevronRight size={14} />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────

const DEFAULT_FORM: FormState = {
  investor_type: '', investment_type: '', amount_usd: 0, currency: 'USD', payment_method: '',
  full_name: '', email: '', phone: '', country: '',
  company_name: '', bank_name: '', swift_bic: '', iban_account: '', correspondent_bank: '', regulatory_jurisdiction: '',
  fund_type: '', aum_usd: '', investment_mandate: '', investment_horizon: '', gp_name: '', accredited_investor: false,
  industry: '', partnership_goals: '',
  net_worth_tier: '', risk_tolerance: '', investment_experience: '', source_of_funds: '',
  crypto_wallet_address: '', crypto_network: '', crypto_tx_hash: '',
  token_amount: 0, presale_stage: 'seed',
  kyc_agreed: false, terms_agreed: false, aml_agreed: false, message: '',
};

export default function InvestApplicationPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [form, setForm] = useState<FormState>({ ...DEFAULT_FORM });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [refCode] = useState(() => String(Math.floor(100000 + Math.random() * 900000)));

  // Pre-fill email from auth
  useEffect(() => {
    if (user?.email) setForm(f => ({ ...f, email: f.email || user.email || '' }));
  }, [user]);

  const update = useCallback((patch: Partial<FormState>) => setForm(f => ({ ...f, ...patch })), []);

  const canProceed = (): boolean => {
    if (step === 1) return !!form.investor_type;
    if (step === 2) return !!form.investment_type && form.amount_usd > 0 && !!form.payment_method;
    if (step === 3) return !!form.full_name && !!form.email && !!form.phone && !!form.country;
    return true;
  };

  const go = (delta: number) => {
    setDirection(delta);
    setStep(s => s + delta);
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const payload = {
        investor_type: form.investor_type,
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        country: form.country,
        company_name: form.company_name || null,
        investment_type: form.investment_type,
        amount_usd: form.amount_usd,
        currency: form.currency,
        payment_method: form.payment_method,
        token_amount: form.investment_type === 'token_vod' ? Math.floor(form.amount_usd / 0.2) : null,
        presale_stage: form.investment_type === 'token_vod' ? form.presale_stage : null,
        crypto_wallet_address: form.crypto_wallet_address || null,
        crypto_network: form.crypto_network || null,
        crypto_tx_hash: form.crypto_tx_hash || null,
        bank_name: form.bank_name || null,
        swift_bic: form.swift_bic || null,
        iban_account: form.iban_account || null,
        correspondent_bank: form.correspondent_bank || null,
        regulatory_jurisdiction: form.regulatory_jurisdiction || null,
        fund_type: form.fund_type || null,
        aum_usd: form.aum_usd || null,
        investment_mandate: form.investment_mandate || null,
        investment_horizon: form.investment_horizon || null,
        gp_name: form.gp_name || null,
        accredited_investor: form.accredited_investor,
        net_worth_tier: form.net_worth_tier || null,
        risk_tolerance: form.risk_tolerance || null,
        investment_experience: form.investment_experience || null,
        source_of_funds: form.source_of_funds || null,
        kyc_agreed: form.kyc_agreed,
        terms_agreed: form.terms_agreed,
        aml_agreed: form.aml_agreed,
        message: form.message || null,
        status: 'pending',
        user_id: user?.id ?? null,
      };
      const { error: dbError } = await supabase.from('investment_applications').insert([payload]);
      if (dbError) throw dbError;
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка при отправке. Попробуйте ещё раз.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-lg">
          <SuccessScreen refCode={refCode} onHome={() => setLocation('/')} onProfile={() => setLocation('/profile')} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12 px-4 pt-16">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8 pt-4">
          <div className="flex items-center justify-center gap-2.5 mb-2">
            <Droplets size={22} style={{ color: TEAL }} />
            <h1 className="text-xl font-black text-white tracking-tight">Заявка на инвестицию</h1>
          </div>
          <p className="text-white/35 text-xs">VODPROM · Water Resource Investment Platform</p>
        </motion.div>

        {/* Step indicator */}
        <StepIndicator current={step} total={5} />

        {/* Step content */}
        <div className="rounded-3xl p-5 sm:p-7 mb-4" style={GLASS_STRONG}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div key={step} custom={direction} variants={stepVariants} initial="enter" animate="center" exit="exit">
              {step === 1 && <Step1 form={form} onChange={update} />}
              {step === 2 && <Step2 form={form} onChange={update} />}
              {step === 3 && <Step3 form={form} onChange={update} />}
              {step === 4 && <Step4 form={form} onChange={update} refCode={refCode} />}
              {step === 5 && <Step5 form={form} onChange={update} onSubmit={handleSubmit} loading={loading} />}
            </motion.div>
          </AnimatePresence>

          {/* Error banner */}
          {error && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-start gap-3 p-4 rounded-xl"
              style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)' }}>
              <AlertTriangle size={16} className="text-red-400 mt-0.5 shrink-0" />
              <p className="text-sm text-red-300">{error}</p>
            </motion.div>
          )}

          {/* Nav buttons (not shown on step 5 — step 5 has its own submit) */}
          {step < 5 && (
            <NavButtons
              onBack={step > 1 ? () => go(-1) : undefined}
              onNext={() => go(1)}
              nextDisabled={!canProceed()}
            />
          )}
          {step === 5 && (
            <NavButtons onBack={() => go(-1)} />
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-center gap-4 text-xs text-white/20 mt-6">
          <span className="flex items-center gap-1"><Shield size={11} /> KYC защита</span>
          <span className="w-0.5 h-3 bg-white/10" />
          <span className="flex items-center gap-1"><FileText size={11} /> Ref #{refCode}</span>
          <span className="w-0.5 h-3 bg-white/10" />
          <span className="flex items-center gap-1"><Phone size={11} /> invest@vodprom.uz</span>
        </div>
      </div>
    </div>
  );
}
