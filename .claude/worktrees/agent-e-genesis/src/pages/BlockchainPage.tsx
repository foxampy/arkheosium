/**
 * BlockchainPage — VOD Token + Water Object NFTs
 * Wallet connect via MetaMask, token info, NFT portfolio, on-chain registry
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Cpu, Wallet, Link2, Copy, ExternalLink, CheckCircle,
  TrendingUp, TrendingDown, Shield, Zap, Globe, Lock,
  BarChart2, Layers, Hash, AlertTriangle, RefreshCw, Award,
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

// ── Types ──────────────────────────────────────────────────────────────────

interface WaterNFT {
  tokenId: number;
  objectName: string;
  objectType: string;
  region: string;
  volume: number;         // annual water rights m³
  mintDate: string;
  owner: string;
  verified: boolean;
  ipfsHash: string;
  estimatedValue: number; // USD
}

interface TokenMetrics {
  price: number;
  change24h: number;
  marketCap: number;
  circulatingSupply: number;
  totalSupply: number;
  holders: number;
  volume24h: number;
  tvl: number;
}

// ── Mock Data ──────────────────────────────────────────────────────────────

const TOKEN_METRICS: TokenMetrics = {
  price: 0.0847,
  change24h: +3.2,
  marketCap: 8_470_000,
  circulatingSupply: 100_000_000,
  totalSupply: 500_000_000,
  holders: 3_841,
  volume24h: 284_500,
  tvl: 2_340_000,
};

const WATER_NFTS: WaterNFT[] = [
  {
    tokenId: 1, objectName: 'Чарвакское водохранилище', objectType: 'reservoir',
    region: 'Ташкентская обл.', volume: 500_000, mintDate: '2024-03-15',
    owner: '0x3a9f...c847', verified: true,
    ipfsHash: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
    estimatedValue: 9_500,
  },
  {
    tokenId: 2, objectName: 'Фергана — Главный канал', objectType: 'irrigation_canal',
    region: 'Ферганская обл.', volume: 1_200_000, mintDate: '2024-04-02',
    owner: '0x7b2a...f391', verified: true,
    ipfsHash: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
    estimatedValue: 22_800,
  },
  {
    tokenId: 3, objectName: 'Андижанское водохранилище', objectType: 'reservoir',
    region: 'Андижанская обл.', volume: 280_000, mintDate: '2024-04-18',
    owner: '0x1c6e...a024', verified: true,
    ipfsHash: 'QmcgpsyWgH8Y8ajJz1Cu72KnS5oBQkPF1P5kAjb7DXKYRB',
    estimatedValue: 5_320,
  },
  {
    tokenId: 4, objectName: 'Нурекское вдхр. (доля)', objectType: 'hydroelectric_reservoir',
    region: 'Таджикистан', volume: 150_000, mintDate: '2024-05-01',
    owner: '0x9d4c...e712', verified: false,
    ipfsHash: 'Qmb2A3vHwv3YpCz4i5Y7f8P9Q1R2S3T4U5V6W7X8Y9Z0',
    estimatedValue: 2_850,
  },
  {
    tokenId: 5, objectName: 'Иссык-Кульская квота', objectType: 'mountain_lake',
    region: 'Кыргызстан', volume: 75_000, mintDate: '2024-05-14',
    owner: '0x5f8b...d203', verified: true,
    ipfsHash: 'QmT4NT98VmazL2cBo6iCB3iLMkTqaKxyz1234567890abcd',
    estimatedValue: 1_425,
  },
  {
    tokenId: 6, objectName: 'Каракум-канал (сегмент)', objectType: 'irrigation_canal',
    region: 'Туркменистан', volume: 420_000, mintDate: '2024-06-01',
    owner: '0x2a7d...b516', verified: true,
    ipfsHash: 'QmVa18L3mFHJeSRq9Bz4VCDkJqJGPTH8aqvVzfBDgPvY',
    estimatedValue: 7_980,
  },
];

function genVodHistory() {
  let p = 0.06;
  return Array.from({ length: 30 }, (_, i) => {
    p += (Math.random() - 0.44) * 0.005;
    p = Math.max(0.04, Math.min(0.15, p));
    return { day: `Jun ${i + 1}`, price: +p.toFixed(4), volume: Math.round(80000 + Math.random() * 400000) };
  });
}

const VOD_HISTORY = genVodHistory();

const DISTRIBUTION_DATA = [
  { name: 'Экосистема', value: 30, color: '#00e6c8' },
  { name: 'Команда (lock 4y)', value: 20, color: '#60a5fa' },
  { name: 'Инвесторы', value: 15, color: '#a78bfa' },
  { name: 'Резерв', value: 15, color: '#fbbf24' },
  { name: 'Маркетплейс', value: 12, color: '#4ade80' },
  { name: 'Airdrop', value: 8, color: '#f87171' },
];

// ── Sub-components ──────────────────────────────────────────────────────────

const TYPE_ICONS: Record<string, string> = {
  reservoir: '🌊', irrigation_canal: '🚿', hydroelectric_reservoir: '⚡',
  mountain_lake: '🏔️', pumping_station: '🔧', default: '💧',
};

function NFTCard({ nft }: { nft: WaterNFT }) {
  const [copied, setCopied] = useState(false);
  const icon = TYPE_ICONS[nft.objectType] ?? TYPE_ICONS.default;

  function copyHash() {
    navigator.clipboard.writeText(nft.ipfsHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div
      className="rounded-2xl p-4 relative overflow-hidden transition hover:scale-[1.01]"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid ${nft.verified ? 'rgba(0,230,200,0.2)' : 'rgba(255,255,255,0.07)'}`,
      }}
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: nft.verified
            ? 'radial-gradient(circle at top right, rgba(0,230,200,0.06), transparent 60%)'
            : 'radial-gradient(circle at top right, rgba(255,255,255,0.02), transparent 60%)',
        }}
      />

      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{icon}</span>
            <div>
              <div className="font-semibold text-white text-sm">{nft.objectName}</div>
              <div className="text-xs text-white/40">{nft.region}</div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] font-mono text-white/30">#{nft.tokenId}</span>
            {nft.verified ? (
              <span className="flex items-center gap-0.5 text-[10px] text-cyan-400">
                <CheckCircle className="w-2.5 h-2.5" /> Верифицирован
              </span>
            ) : (
              <span className="flex items-center gap-0.5 text-[10px] text-yellow-400">
                <AlertTriangle className="w-2.5 h-2.5" /> Ожидает
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
          <div className="rounded-lg p-2" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="text-white/30 mb-0.5">Квота</div>
            <div className="text-white/70 font-mono">{(nft.volume / 1000).toFixed(0)}k м³/год</div>
          </div>
          <div className="rounded-lg p-2" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="text-white/30 mb-0.5">Оценка</div>
            <div className="text-cyan-300 font-mono">${nft.estimatedValue.toLocaleString()}</div>
          </div>
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-white/30">Владелец</span>
            <span className="text-white/50 font-mono">{nft.owner}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/30">Выпущен</span>
            <span className="text-white/50">{nft.mintDate}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/30">IPFS</span>
            <button
              onClick={copyHash}
              className="flex items-center gap-1 text-white/30 hover:text-white/60 transition font-mono"
            >
              {nft.ipfsHash.slice(0, 12)}…
              {copied ? <CheckCircle className="w-2.5 h-2.5 text-green-400" /> : <Copy className="w-2.5 h-2.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

type Tab = 'token' | 'nfts' | 'registry' | 'protocol';

export default function BlockchainPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('token');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [chainId, setChainId] = useState<string | null>(null);

  async function connectWallet() {
    setConnecting(true);
    try {
      // @ts-ignore
      if (typeof window.ethereum !== 'undefined') {
        // @ts-ignore
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          // @ts-ignore
          const chain = await window.ethereum.request({ method: 'eth_chainId' });
          setChainId(chain);
        }
      } else {
        // MetaMask not installed — show mock address for demo
        setWalletAddress('0x742d35Cc6634C0532925a3b8D4C9C3f0b44bC4aF');
        setChainId('0x89'); // Polygon
      }
    } catch (err) {
      console.error('Wallet connect failed', err);
    } finally {
      setConnecting(false);
    }
  }

  function formatAddress(addr: string) {
    return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
  }

  const chainName: Record<string, string> = {
    '0x1': 'Ethereum Mainnet', '0x89': 'Polygon', '0xa': 'Optimism',
    '0x2105': 'Base', '0xa4b1': 'Arbitrum',
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'token', label: '🪙 VOD Token' },
    { id: 'nfts', label: '🌊 Water NFTs' },
    { id: 'registry', label: '📜 Реестр' },
    { id: 'protocol', label: '⚙ Протокол' },
  ];

  return (
    <div
      className="min-h-screen pt-16 pb-10 px-4"
      style={{ background: 'linear-gradient(135deg, #000818 0%, #000d1f 100%)' }}
    >
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header + Wallet connect */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Cpu className="w-7 h-7 text-cyan-400" />
              VOD Blockchain
            </h1>
            <p className="text-white/40 text-sm mt-1">
              VOD Token · Water Object NFTs · On-chain Registry · DeFi Protocol
            </p>
          </div>
          {walletAddress ? (
            <div
              className="flex items-center gap-3 px-4 py-2 rounded-xl"
              style={{ background: 'rgba(0,230,200,0.08)', border: '1px solid rgba(0,230,200,0.2)' }}
            >
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <div>
                <div className="text-xs font-mono text-cyan-300">{formatAddress(walletAddress)}</div>
                <div className="text-[10px] text-white/40">{chainName[chainId ?? ''] ?? `Chain ${chainId}`}</div>
              </div>
              <button
                onClick={() => setWalletAddress(null)}
                className="text-[10px] text-white/30 hover:text-white/60 transition"
              >
                Выйти
              </button>
            </div>
          ) : (
            <button
              onClick={connectWallet}
              disabled={connecting}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #00e6c8, #0080ff)', color: '#000' }}
            >
              {connecting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />}
              {connecting ? 'Подключение...' : 'Подключить кошелёк'}
            </button>
          )}
        </div>

        {/* Token stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              label: 'Цена VOD',
              value: `$${TOKEN_METRICS.price}`,
              delta: `${TOKEN_METRICS.change24h >= 0 ? '+' : ''}${TOKEN_METRICS.change24h}%`,
              up: TOKEN_METRICS.change24h >= 0,
              icon: <TrendingUp className="w-5 h-5" />, color: '#00e6c8',
            },
            {
              label: 'Market Cap',
              value: `$${(TOKEN_METRICS.marketCap / 1e6).toFixed(1)}M`,
              delta: `${(TOKEN_METRICS.circulatingSupply / 1e6).toFixed(0)}M в обращении`,
              up: true, icon: <BarChart2 className="w-5 h-5" />, color: '#60a5fa',
            },
            {
              label: 'Держателей',
              value: TOKEN_METRICS.holders.toLocaleString(),
              delta: '+127 за 30 дней',
              up: true, icon: <Globe className="w-5 h-5" />, color: '#a78bfa',
            },
            {
              label: 'TVL (DeFi)',
              value: `$${(TOKEN_METRICS.tvl / 1e6).toFixed(2)}M`,
              delta: 'locked в протоколе',
              up: true, icon: <Lock className="w-5 h-5" />, color: '#4ade80',
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

        {/* ── Token Tab ── */}
        {tab === 'token' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: chart + details */}
            <div className="lg:col-span-2 space-y-4">
              <div
                className="rounded-2xl p-4"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-sm font-semibold text-white">VOD / USDC</div>
                    <div className="text-2xl font-bold text-cyan-300">${TOKEN_METRICS.price}</div>
                  </div>
                  <span
                    className={`text-sm font-semibold px-2 py-1 rounded-lg ${
                      TOKEN_METRICS.change24h >= 0 ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'
                    }`}
                  >
                    {TOKEN_METRICS.change24h >= 0 ? '+' : ''}{TOKEN_METRICS.change24h}% 24h
                  </span>
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={VOD_HISTORY}>
                    <defs>
                      <linearGradient id="vodGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00e6c8" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#00e6c8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#ffffff30' }} interval={6} />
                    <YAxis tick={{ fontSize: 9, fill: '#ffffff30' }} width={45} tickFormatter={v => `$${v}`} />
                    <Tooltip
                      contentStyle={{ background: '#0a1628', border: '1px solid rgba(0,230,200,0.2)', borderRadius: 8, fontSize: 11 }}
                      formatter={(v: number) => [`$${v}`, 'Цена']}
                    />
                    <Area type="monotone" dataKey="price" stroke="#00e6c8" strokeWidth={2} fill="url(#vodGrad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Volume bar */}
              <div
                className="rounded-2xl p-4"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="text-sm font-semibold text-white mb-3">Объём торгов (VOD)</div>
                <ResponsiveContainer width="100%" height={100}>
                  <BarChart data={VOD_HISTORY}>
                    <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#ffffff30' }} interval={6} />
                    <YAxis tick={{ fontSize: 9, fill: '#ffffff30' }} width={50} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{ background: '#0a1628', border: '1px solid rgba(0,230,200,0.2)', borderRadius: 8, fontSize: 11 }}
                    />
                    <Bar dataKey="volume" fill="#00e6c8" fillOpacity={0.5} radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right: tokenomics */}
            <div className="space-y-4">
              <div
                className="rounded-2xl p-4"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="text-sm font-semibold text-white mb-3">Токеномика</div>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={DISTRIBUTION_DATA} dataKey="value" cx="50%" cy="50%" outerRadius={60} stroke="none">
                      {DISTRIBUTION_DATA.map((entry, index) => (
                        <Cell key={index} fill={entry.color} fillOpacity={0.8} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#0a1628', border: '1px solid rgba(0,230,200,0.2)', borderRadius: 8, fontSize: 11 }}
                      formatter={(v: number) => [`${v}%`]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5">
                  {DISTRIBUTION_DATA.map(d => (
                    <div key={d.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                        <span className="text-white/60">{d.name}</span>
                      </div>
                      <span className="text-white/40 font-mono">{d.value}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key info */}
              <div
                className="rounded-2xl p-4 space-y-2 text-xs"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                {[
                  { label: 'Тикер', value: 'VOD' },
                  { label: 'Сеть', value: 'Polygon (ERC-20)' },
                  { label: 'Всего', value: '500M VOD' },
                  { label: 'В обращении', value: '100M VOD (20%)' },
                  { label: 'Контракт', value: '0x...4f2a' },
                  { label: 'Листинг', value: 'Q3 2026' },
                ].map(item => (
                  <div key={item.label} className="flex justify-between">
                    <span className="text-white/30">{item.label}</span>
                    <span className="text-white/60 font-mono">{item.value}</span>
                  </div>
                ))}
                <a
                  href="https://polygonscan.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-cyan-400 hover:underline mt-2"
                >
                  <ExternalLink className="w-3 h-3" /> Polygonscan
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ── Water NFTs Tab ── */}
        {tab === 'nfts' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/40">
                  {WATER_NFTS.length} объектов токенизировано ·{' '}
                  ${WATER_NFTS.reduce((s, n) => s + n.estimatedValue, 0).toLocaleString()} общая оценка
                </p>
              </div>
              {!walletAddress && (
                <button
                  onClick={connectWallet}
                  className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <Wallet className="w-3 h-3" /> Подключить для просмотра своих NFT
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {WATER_NFTS.map(nft => <NFTCard key={nft.tokenId} nft={nft} />)}
            </div>
          </div>
        )}

        {/* ── Registry Tab ── */}
        {tab === 'registry' && (
          <div className="space-y-4">
            <div
              className="rounded-2xl p-4"
              style={{ background: 'rgba(0,230,200,0.05)', border: '1px solid rgba(0,230,200,0.15)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Hash className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-semibold text-cyan-300">On-chain реестр водных объектов</span>
              </div>
              <p className="text-xs text-white/50 leading-relaxed">
                Каждый водный объект, внесённый в VODPROM, проходит верификацию и получает запись в смарт-контракте.
                Данные хранятся в IPFS, хэш зафиксирован on-chain — неизменяемая история состояния объекта.
              </p>
            </div>

            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="px-4 py-3 border-b border-white/8">
                <h3 className="text-sm font-semibold text-white">Последние on-chain записи</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/8">
                      {['Блок', 'Token ID', 'Объект', 'Тип операции', 'IPFS Hash', 'Статус'].map(h => (
                        <th key={h} className="px-3 py-2 text-left text-white/30 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {WATER_NFTS.map((nft, i) => (
                      <tr key={nft.tokenId} className="border-b border-white/4 hover:bg-white/3 transition">
                        <td className="px-3 py-2 text-white/30 font-mono">{52000000 + i * 1847}</td>
                        <td className="px-3 py-2 text-cyan-300 font-mono">#{nft.tokenId}</td>
                        <td className="px-3 py-2 text-white/70 max-w-[140px] truncate">{nft.objectName}</td>
                        <td className="px-3 py-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-green-400/10 text-green-400">
                            {i < 3 ? 'MINT' : i < 5 ? 'TRANSFER' : 'UPDATE'}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-white/25 font-mono text-[10px]">
                          {nft.ipfsHash.slice(0, 14)}…
                        </td>
                        <td className="px-3 py-2">
                          {nft.verified ? (
                            <span className="flex items-center gap-1 text-[10px] text-green-400">
                              <CheckCircle className="w-2.5 h-2.5" /> Verified
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[10px] text-yellow-400">
                              <AlertTriangle className="w-2.5 h-2.5" /> Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── Protocol Tab ── */}
        {tab === 'protocol' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Architecture */}
            <div
              className="rounded-2xl p-6"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" /> Архитектура протокола
              </h3>
              <div className="space-y-3">
                {[
                  { layer: 'L1', name: 'Polygon PoS', desc: 'Основная сеть, low gas, ~2s finality', color: '#a78bfa' },
                  { layer: 'L2', name: 'IPFS + Filecoin', desc: 'Хранение метаданных объектов и документов', color: '#60a5fa' },
                  { layer: 'SC', name: 'VODToken.sol', desc: 'ERC-20 с governance + staking', color: '#00e6c8' },
                  { layer: 'SC', name: 'WaterNFT.sol', desc: 'ERC-721 water rights ownership', color: '#4ade80' },
                  { layer: 'SC', name: 'Marketplace.sol', desc: 'Order book для торговли квотами', color: '#fbbf24' },
                  { layer: 'SC', name: 'Oracle.sol', desc: 'Chainlink-совместимый оракул данных', color: '#f87171' },
                ].map(item => (
                  <div key={item.name} className="flex items-center gap-3">
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded font-mono w-7 text-center shrink-0"
                      style={{ background: `${item.color}20`, color: item.color }}
                    >
                      {item.layer}
                    </span>
                    <div>
                      <div className="text-sm text-white/80 font-mono">{item.name}</div>
                      <div className="text-xs text-white/40">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Staking + Governance */}
            <div className="space-y-4">
              <div
                className="rounded-2xl p-4"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" /> Стейкинг
                </h3>
                <div className="space-y-2 text-xs">
                  {[
                    { tier: 'Bronze', amount: '1,000 VOD', apy: '8%', lock: '30 дней', color: '#cd7f32' },
                    { tier: 'Silver', amount: '10,000 VOD', apy: '14%', lock: '90 дней', color: '#c0c0c0' },
                    { tier: 'Gold', amount: '100,000 VOD', apy: '22%', lock: '180 дней', color: '#ffd700' },
                    { tier: 'Platinum', amount: '1,000,000 VOD', apy: '35%', lock: '365 дней', color: '#00e6c8' },
                  ].map(tier => (
                    <div
                      key={tier.tier}
                      className="flex items-center justify-between p-2 rounded-lg"
                      style={{ background: `${tier.color}10`, border: `1px solid ${tier.color}30` }}
                    >
                      <div className="flex items-center gap-2">
                        <Award className="w-3.5 h-3.5" style={{ color: tier.color }} />
                        <span style={{ color: tier.color }}>{tier.tier}</span>
                        <span className="text-white/40">{tier.amount}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-green-400 font-mono">{tier.apy} APY</span>
                        <span className="text-white/30">{tier.lock}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className="rounded-2xl p-4"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-400" /> Governance
                </h3>
                <div className="space-y-2 text-xs text-white/60">
                  <p>1 VOD = 1 голос в DAO. Холдеры голосуют за:</p>
                  <ul className="space-y-1 ml-3 list-disc text-white/40">
                    <li>Добавление новых водных объектов в реестр</li>
                    <li>Параметры смарт-контракта маркетплейса</li>
                    <li>Распределение экосистемного фонда</li>
                    <li>Партнёрства с государственными структурами</li>
                  </ul>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-white/30">Активных предложений</span>
                    <span className="text-white/60">3</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/30">Следующее голосование</span>
                    <span className="text-white/60">2026-06-15</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
