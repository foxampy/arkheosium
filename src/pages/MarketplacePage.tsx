/**
 * MarketplacePage — Water Rights Trading Exchange
 * Order book, bids/asks, deal history, water rights management
 */

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  TrendingUp, TrendingDown, BarChart2, Droplets, ArrowUpDown,
  Plus, Filter, ChevronDown, CheckCircle, Clock, AlertTriangle,
  Activity, DollarSign, Waves, RefreshCw, Info, Shield,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

// ── Types ──────────────────────────────────────────────────────────────────

interface Order {
  id: string;
  type: 'bid' | 'ask';
  volume: number;        // m³/year
  price: number;         // USD per 1000 m³
  org: string;
  region: string;
  expires: string;
  status: 'active' | 'partial' | 'filled';
  quality: 'A' | 'B' | 'C';
}

interface Deal {
  id: string;
  buyer: string;
  seller: string;
  volume: number;
  price: number;
  date: string;
  region: string;
  txHash: string;
}

// ── Mock Data ──────────────────────────────────────────────────────────────

function genOrders(): Order[] {
  const orgs = [
    'АО "Узводхоз"', 'КГП "Астана Су"', 'ОсОО "Кыргызводстрой"',
    'AQVA Systems LLC', 'Ferghana Irr. Dist.', 'Syr Darya WM',
    'Aral Basin Auth.', 'Bishkek Water Co.',
  ];
  const regions = ['Ферганская', 'Ташкентская', 'Алматинская', 'Бишкек', 'Нур-Султан'];
  const orders: Order[] = [];
  // Asks (sellers)
  const askPrices = [18.5, 19.0, 19.2, 19.8, 20.0, 20.5, 21.0, 21.5];
  askPrices.forEach((price, i) => {
    orders.push({
      id: `ask-${i}`,
      type: 'ask',
      volume: Math.round((5000 + Math.random() * 45000) / 1000) * 1000,
      price,
      org: orgs[i % orgs.length],
      region: regions[i % regions.length],
      expires: `2026-0${(i % 8) + 1}-30`,
      status: i === 2 ? 'partial' : 'active',
      quality: (['A', 'B', 'B', 'C'] as const)[i % 4],
    });
  });
  // Bids (buyers)
  const bidPrices = [18.0, 17.5, 17.0, 16.8, 16.5, 16.0, 15.5, 15.0];
  bidPrices.forEach((price, i) => {
    orders.push({
      id: `bid-${i}`,
      type: 'bid',
      volume: Math.round((8000 + Math.random() * 42000) / 1000) * 1000,
      price,
      org: orgs[(i + 3) % orgs.length],
      region: regions[(i + 2) % regions.length],
      expires: `2026-0${(i % 8) + 1}-28`,
      status: i === 1 ? 'partial' : 'active',
      quality: (['A', 'A', 'B', 'C'] as const)[i % 4],
    });
  });
  return orders;
}

function genDeals(): Deal[] {
  const buyers = ['АО "Узводхоз"', 'Ferghana Irr.', 'AQVA LLC', 'Syr Darya WM'];
  const sellers = ['КГП "Астана Су"', 'Aral Basin Auth.', 'Bishkek Water Co.', 'ОсОО "КВС"'];
  return Array.from({ length: 12 }, (_, i) => ({
    id: `deal-${i}`,
    buyer: buyers[i % buyers.length],
    seller: sellers[i % sellers.length],
    volume: Math.round((10000 + Math.random() * 90000) / 1000) * 1000,
    price: 17 + Math.random() * 3,
    date: `2026-0${Math.min(6, Math.floor(i / 2) + 1)}-${10 + i}`,
    region: ['Ферганская', 'Ташкентская', 'Алматинская'][i % 3],
    txHash: `0x${Math.random().toString(16).slice(2, 18)}...`,
  }));
}

const ORDERS = genOrders();
const DEALS = genDeals();

function genPriceHistory() {
  let price = 17.5;
  return Array.from({ length: 30 }, (_, i) => {
    price += (Math.random() - 0.48) * 0.4;
    price = Math.max(14, Math.min(24, price));
    return {
      day: `Jun ${i + 1}`,
      price: +price.toFixed(2),
      volume: Math.round(50000 + Math.random() * 200000),
      high: +(price + Math.random() * 0.5).toFixed(2),
      low: +(price - Math.random() * 0.5).toFixed(2),
    };
  });
}

const PRICE_HISTORY = genPriceHistory();

// ── Sub-components ──────────────────────────────────────────────────────────

const qualityColor = { A: '#22c55e', B: '#fbbf24', C: '#f87171' };
const qualityBg = { A: 'rgba(34,197,94,0.1)', B: 'rgba(251,191,36,0.1)', C: 'rgba(248,113,113,0.1)' };

function QualityBadge({ q }: { q: 'A' | 'B' | 'C' }) {
  return (
    <span
      className="text-[10px] font-bold px-1.5 py-0.5 rounded"
      style={{ color: qualityColor[q], background: qualityBg[q] }}
    >
      {q}
    </span>
  );
}

function StatusBadge({ s }: { s: Order['status'] }) {
  const map = {
    active: { icon: <CheckCircle className="w-3 h-3" />, color: '#22c55e', label: 'Активный' },
    partial: { icon: <Clock className="w-3 h-3" />, color: '#fbbf24', label: 'Частичный' },
    filled: { icon: <CheckCircle className="w-3 h-3" />, color: '#60a5fa', label: 'Исполнен' },
  };
  const { icon, color, label } = map[s];
  return (
    <span className="flex items-center gap-1 text-[10px]" style={{ color }}>
      {icon}{label}
    </span>
  );
}

function OrderBookRow({ o, side }: { o: Order; side: 'bid' | 'ask' }) {
  const isBid = side === 'bid';
  return (
    <tr className="border-b border-white/4 hover:bg-white/3 transition">
      <td className="py-1.5 px-2 text-xs font-mono" style={{ color: isBid ? '#4ade80' : '#f87171' }}>
        ${o.price.toFixed(2)}
      </td>
      <td className="py-1.5 px-2 text-xs text-white/70 font-mono">
        {(o.volume / 1000).toFixed(0)}k m³
      </td>
      <td className="py-1.5 px-2 text-xs text-white/50 max-w-[120px] truncate">{o.org}</td>
      <td className="py-1.5 px-2"><QualityBadge q={o.quality} /></td>
      <td className="py-1.5 px-2"><StatusBadge s={o.status} /></td>
    </tr>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

type Tab = 'exchange' | 'history' | 'rights' | 'analytics';

export default function MarketplacePage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('exchange');
  const [filterRegion, setFilterRegion] = useState('all');
  const [filterQuality, setFilterQuality] = useState('all');
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [orderType, setOrderType] = useState<'bid' | 'ask'>('bid');
  const [orderVolume, setOrderVolume] = useState(50000);
  const [orderPrice, setOrderPrice] = useState(18.0);

  const asks = useMemo(() => ORDERS.filter(o => o.type === 'ask'), []);
  const bids = useMemo(() => ORDERS.filter(o => o.type === 'bid'), []);
  const spread = (asks[0]?.price ?? 0) - (bids[0]?.price ?? 0);
  const lastPrice = PRICE_HISTORY[PRICE_HISTORY.length - 1]?.price ?? 0;
  const prevPrice = PRICE_HISTORY[PRICE_HISTORY.length - 2]?.price ?? 0;
  const priceDiff = lastPrice - prevPrice;

  const tabs: { id: Tab; label: string }[] = [
    { id: 'exchange', label: '📊 Биржа' },
    { id: 'history', label: '📋 История сделок' },
    { id: 'rights', label: '📜 Права на воду' },
    { id: 'analytics', label: '📈 Аналитика цен' },
  ];

  return (
    <div
      className="min-h-screen pt-16 pb-10 px-4"
    >
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Waves className="w-7 h-7 text-cyan-400" />
              Маркетплейс водных прав
            </h1>
            <p className="text-white/40 text-sm mt-1">
              Децентрализованная биржа прав на водопользование · Центральная Азия
            </p>
          </div>
          <button
            onClick={() => setShowNewOrder(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition"
            style={{ background: 'linear-gradient(135deg, #00e6c8, #0080ff)', color: '#000' }}
          >
            <Plus className="w-4 h-4" /> Новая заявка
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              icon: <DollarSign className="w-5 h-5" />,
              label: 'Цена ($/1000 м³)',
              value: `$${lastPrice.toFixed(2)}`,
              delta: `${priceDiff >= 0 ? '+' : ''}${priceDiff.toFixed(2)}`,
              up: priceDiff >= 0,
              color: '#00e6c8',
            },
            {
              icon: <ArrowUpDown className="w-5 h-5" />,
              label: 'Спред',
              value: `$${spread.toFixed(2)}`,
              delta: '2.3% от цены',
              up: true,
              color: '#fbbf24',
            },
            {
              icon: <BarChart2 className="w-5 h-5" />,
              label: 'Объём (24ч)',
              value: '2.4M м³',
              delta: '+18% vs вчера',
              up: true,
              color: '#60a5fa',
            },
            {
              icon: <Activity className="w-5 h-5" />,
              label: 'Активных заявок',
              value: ORDERS.length,
              delta: `${bids.length} покупок · ${asks.length} продаж`,
              up: true,
              color: '#a78bfa',
            },
          ].map((s, i) => (
            <div
              key={i}
              className="rounded-2xl p-4"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="flex items-center gap-2 mb-2" style={{ color: s.color }}>
                {s.icon}
                <span className="text-xs text-white/40">{s.label}</span>
              </div>
              <div className="text-xl font-bold text-white">{s.value}</div>
              <div className={`text-xs mt-1 flex items-center gap-1 ${s.up ? 'text-green-400' : 'text-red-400'}`}>
                {s.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {s.delta}
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-white/8 pb-0">
          {tabs.map(tb => (
            <button
              key={tb.id}
              onClick={() => setTab(tb.id)}
              className={`px-4 py-2 text-sm font-medium transition border-b-2 -mb-px ${
                tab === tb.id
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-white/40 hover:text-white/70'
              }`}
            >
              {tb.label}
            </button>
          ))}
        </div>

        {/* ── Exchange Tab ── */}
        {tab === 'exchange' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order book */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="px-4 py-3 border-b border-white/8 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Стакан заявок</h3>
                <span className="text-xs text-white/30">Цена / Объём / Организация</span>
              </div>
              {/* Asks */}
              <div className="px-4 pt-2 pb-1">
                <div className="text-[10px] text-red-400/60 font-semibold uppercase tracking-wider mb-1">
                  ПРОДАЖА (ASK)
                </div>
                <table className="w-full">
                  <tbody>
                    {asks.slice(0, 5).reverse().map(o => <OrderBookRow key={o.id} o={o} side="ask" />)}
                  </tbody>
                </table>
              </div>
              {/* Spread */}
              <div
                className="mx-4 my-2 px-3 py-2 rounded-lg flex items-center justify-between text-xs"
                style={{ background: 'rgba(0,230,200,0.07)' }}
              >
                <span className="text-white/40">Последняя сделка</span>
                <span className="text-cyan-300 font-bold font-mono">${lastPrice.toFixed(2)}</span>
                <span className="text-white/40">Спред: ${spread.toFixed(2)}</span>
              </div>
              {/* Bids */}
              <div className="px-4 pb-3">
                <div className="text-[10px] text-green-400/60 font-semibold uppercase tracking-wider mb-1">
                  ПОКУПКА (BID)
                </div>
                <table className="w-full">
                  <tbody>
                    {bids.slice(0, 5).map(o => <OrderBookRow key={o.id} o={o} side="bid" />)}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Price mini chart + place order */}
            <div className="space-y-4">
              {/* Mini chart */}
              <div
                className="rounded-2xl p-4"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="text-sm font-semibold text-white mb-3">График цены (30 дней)</div>
                <ResponsiveContainer width="100%" height={140}>
                  <AreaChart data={PRICE_HISTORY}>
                    <defs>
                      <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00e6c8" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#00e6c8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#ffffff30' }} interval={6} />
                    <YAxis domain={['auto', 'auto']} tick={{ fontSize: 9, fill: '#ffffff30' }} width={40} />
                    <Tooltip
                      contentStyle={{ background: '#0a1628', border: '1px solid rgba(0,230,200,0.2)', borderRadius: 8, fontSize: 11 }}
                      labelStyle={{ color: '#ffffff60' }}
                    />
                    <Area type="monotone" dataKey="price" stroke="#00e6c8" strokeWidth={2} fill="url(#priceGrad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Place order form */}
              <div
                className="rounded-2xl p-4"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-cyan-400" /> Разместить заявку
                </div>
                <div className="flex gap-2 mb-4">
                  {(['bid', 'ask'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setOrderType(type)}
                      className="flex-1 py-2 rounded-lg text-sm font-medium transition"
                      style={{
                        background: orderType === type
                          ? type === 'bid' ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)'
                          : 'rgba(255,255,255,0.04)',
                        color: orderType === type
                          ? type === 'bid' ? '#4ade80' : '#f87171'
                          : '#ffffff60',
                        border: `1px solid ${orderType === type
                          ? type === 'bid' ? 'rgba(74,222,128,0.4)' : 'rgba(248,113,113,0.4)'
                          : 'rgba(255,255,255,0.08)'}`,
                      }}
                    >
                      {type === 'bid' ? '🟢 Купить' : '🔴 Продать'}
                    </button>
                  ))}
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-white/40 mb-1 block">
                      Объём (м³/год): {orderVolume.toLocaleString()}
                    </label>
                    <input
                      type="range" min={5000} max={500000} step={5000}
                      value={orderVolume}
                      onChange={e => setOrderVolume(+e.target.value)}
                      className="w-full accent-cyan-400"
                    />
                    <div className="flex justify-between text-[10px] text-white/25 mt-0.5">
                      <span>5,000 м³</span><span>500,000 м³</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-white/40 mb-1 block">
                      Цена ($/1000 м³): ${orderPrice.toFixed(1)}
                    </label>
                    <input
                      type="range" min={12} max={26} step={0.1}
                      value={orderPrice}
                      onChange={e => setOrderPrice(+e.target.value)}
                      className="w-full accent-cyan-400"
                    />
                    <div className="flex justify-between text-[10px] text-white/25 mt-0.5">
                      <span>$12</span><span>$26</span>
                    </div>
                  </div>
                  <div
                    className="rounded-lg px-3 py-2 text-xs flex justify-between items-center"
                    style={{ background: 'rgba(0,230,200,0.06)' }}
                  >
                    <span className="text-white/40">Итого:</span>
                    <span className="text-cyan-300 font-bold">
                      ${((orderVolume / 1000) * orderPrice).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <button
                    className="w-full py-2.5 rounded-xl font-semibold text-sm transition"
                    style={{
                      background: orderType === 'bid'
                        ? 'linear-gradient(135deg, rgba(74,222,128,0.2), rgba(34,197,94,0.3))'
                        : 'linear-gradient(135deg, rgba(248,113,113,0.2), rgba(239,68,68,0.3))',
                      color: orderType === 'bid' ? '#4ade80' : '#f87171',
                      border: `1px solid ${orderType === 'bid' ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`,
                    }}
                  >
                    {orderType === 'bid' ? 'Разместить заявку на покупку' : 'Разместить заявку на продажу'}
                  </button>
                  <p className="text-[10px] text-white/25 text-center flex items-center justify-center gap-1">
                    <Shield className="w-3 h-3" />
                    Сделки защищены смарт-контрактом VOD Protocol v2
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── History Tab ── */}
        {tab === 'history' && (
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="px-4 py-3 border-b border-white/8">
              <h3 className="text-sm font-semibold text-white">История сделок</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/8">
                    {['Дата', 'Покупатель', 'Продавец', 'Объём', 'Цена', 'Сумма', 'TX Hash'].map(h => (
                      <th key={h} className="px-3 py-2 text-left text-white/30 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DEALS.map(d => (
                    <tr key={d.id} className="border-b border-white/4 hover:bg-white/3 transition">
                      <td className="px-3 py-2 text-white/50">{d.date}</td>
                      <td className="px-3 py-2 text-blue-400 max-w-[100px] truncate">{d.buyer}</td>
                      <td className="px-3 py-2 text-orange-400 max-w-[100px] truncate">{d.seller}</td>
                      <td className="px-3 py-2 text-white/70 font-mono">{(d.volume / 1000).toFixed(0)}k м³</td>
                      <td className="px-3 py-2 text-cyan-300 font-mono">${d.price.toFixed(2)}</td>
                      <td className="px-3 py-2 text-white/70 font-mono">
                        ${((d.volume / 1000) * d.price).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </td>
                      <td className="px-3 py-2 text-white/25 font-mono text-[10px]">{d.txHash}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Water Rights Tab ── */}
        {tab === 'rights' && (
          <div className="space-y-4">
            <div
              className="rounded-2xl p-4"
              style={{ background: 'rgba(0,230,200,0.05)', border: '1px solid rgba(0,230,200,0.15)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-semibold text-cyan-300">О системе прав на воду</span>
              </div>
              <p className="text-xs text-white/50 leading-relaxed">
                Права на водопользование токенизированы как NFT на VOD Protocol. Каждое право привязано
                к конкретному водному объекту, содержит квоту в м³/год, срок действия и класс качества.
                Торговля правами происходит через смарт-контракт с автоматическим исполнением и
                записью в блокчейн для аудита регулятором.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { id: '#WR-2024-001', object: 'Туябугузское вдхр.', volume: '120,000 м³/год', expiry: '2028-12-31', quality: 'A', price: '$2,400/год', owner: 'АО "Узводхоз"' },
                { id: '#WR-2024-002', object: 'Чарвакское вдхр.', volume: '85,000 м³/год', expiry: '2027-06-30', quality: 'A', price: '$1,700/год', owner: 'Ferghana Irr.' },
                { id: '#WR-2024-003', object: 'Нарынский канал', volume: '200,000 м³/год', expiry: '2029-03-31', quality: 'B', price: '$3,200/год', owner: 'Syr Darya WM' },
                { id: '#WR-2024-004', object: 'Арало-Сырдарьин.', volume: '350,000 м³/год', expiry: '2026-12-31', quality: 'B', price: '$5,250/год', owner: 'AQVA LLC' },
                { id: '#WR-2024-005', object: 'Иссык-Куль', volume: '45,000 м³/год', expiry: '2030-09-30', quality: 'A', price: '$900/год', owner: 'Bishkek Water' },
                { id: '#WR-2024-006', object: 'Капчагайское вдхр.', volume: '180,000 м³/год', expiry: '2027-12-31', quality: 'C', price: '$2,160/год', owner: 'КГП "Астана Су"' },
              ].map(r => (
                <div
                  key={r.id}
                  className="rounded-2xl p-4"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-white/30 font-mono">{r.id}</span>
                    <QualityBadge q={r.quality as 'A' | 'B' | 'C'} />
                  </div>
                  <div className="font-semibold text-white text-sm mb-3">{r.object}</div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-white/40">Объём</span>
                      <span className="text-white/70">{r.volume}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Истекает</span>
                      <span className="text-white/70">{r.expiry}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Цена</span>
                      <span className="text-cyan-300">{r.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Владелец</span>
                      <span className="text-white/60 truncate max-w-[120px]">{r.owner}</span>
                    </div>
                  </div>
                  <button
                    className="mt-3 w-full py-1.5 rounded-lg text-xs font-medium transition"
                    style={{ background: 'rgba(0,230,200,0.1)', color: '#00e6c8', border: '1px solid rgba(0,230,200,0.2)' }}
                  >
                    Просмотреть / Торговать
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Analytics Tab ── */}
        {tab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Price + Volume */}
              <div
                className="rounded-2xl p-4"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="text-sm font-semibold text-white mb-4">Динамика цены ($/1000 м³)</div>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={PRICE_HISTORY}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#ffffff30' }} interval={6} />
                    <YAxis tick={{ fontSize: 9, fill: '#ffffff30' }} width={40} />
                    <Tooltip
                      contentStyle={{ background: '#0a1628', border: '1px solid rgba(0,230,200,0.2)', borderRadius: 8, fontSize: 11 }}
                    />
                    <Line type="monotone" dataKey="high" stroke="#4ade80" strokeWidth={1} dot={false} strokeDasharray="4 2" name="Макс" />
                    <Line type="monotone" dataKey="price" stroke="#00e6c8" strokeWidth={2} dot={false} name="Цена" />
                    <Line type="monotone" dataKey="low" stroke="#f87171" strokeWidth={1} dot={false} strokeDasharray="4 2" name="Мин" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              {/* Volume bars */}
              <div
                className="rounded-2xl p-4"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="text-sm font-semibold text-white mb-4">Объём торгов (м³)</div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={PRICE_HISTORY}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#ffffff30' }} interval={6} />
                    <YAxis tick={{ fontSize: 9, fill: '#ffffff30' }} width={55} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{ background: '#0a1628', border: '1px solid rgba(0,230,200,0.2)', borderRadius: 8, fontSize: 11 }}
                      formatter={(v: number) => [`${(v / 1000).toFixed(0)}k м³`]}
                    />
                    <Bar dataKey="volume" fill="#00e6c8" fillOpacity={0.6} radius={[3, 3, 0, 0]} name="Объём" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* New order modal */}
      {showNewOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
          onClick={() => setShowNewOrder(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6"
            style={{ background: '#0a1628', border: '1px solid rgba(0,230,200,0.2)' }}
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <Waves className="w-5 h-5 text-cyan-400" /> Новая заявка
            </h3>
            <p className="text-white/40 text-sm mb-4">
              Для размещения заявки необходима аутентификация и верификация организации.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowNewOrder(false)}
                className="flex-1 py-2 rounded-xl text-sm text-white/50 border border-white/10 hover:bg-white/5 transition"
              >
                Отмена
              </button>
              <button
                onClick={() => setShowNewOrder(false)}
                className="flex-1 py-2 rounded-xl text-sm font-medium transition"
                style={{ background: 'linear-gradient(135deg, #00e6c8, #0080ff)', color: '#000' }}
              >
                Войти / Верифицировать
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
