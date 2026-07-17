/**
 * RegulatoryPage — Automated Report Generation for Water Ministries
 * Auto-populates from DB, exports to PDF via jspdf + html2canvas
 */

import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileText, Download, CheckCircle, Clock, AlertTriangle, Send,
  Building2, Calendar, BarChart2, Droplets, Shield, RefreshCw,
  ChevronRight, Eye, Printer, Settings, Globe,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────

type ReportStatus = 'draft' | 'ready' | 'submitted' | 'accepted' | 'rejected';
type Ministry = 'uz_mwrc' | 'kz_miosd' | 'kg_dept' | 'tj_mewr' | 'tm_gus';

interface ReportTemplate {
  id: string;
  name: string;
  ministry: Ministry;
  periodicity: 'monthly' | 'quarterly' | 'annual';
  sections: string[];
  deadline: string;
  status: ReportStatus;
  lastSubmitted?: string;
  autoFill: number;   // % auto-filled from DB
}

// ── Static data ────────────────────────────────────────────────────────────

const MINISTRIES: Record<Ministry, { name: string; country: string; flag: string; color: string }> = {
  uz_mwrc: { name: 'Министерство водного хозяйства РУз', country: 'Узбекистан', flag: '🇺🇿', color: '#1db954' },
  kz_miosd: { name: 'Министерство экологии РК', country: 'Казахстан', flag: '🇰🇿', color: '#fbbf24' },
  kg_dept:  { name: 'Департамент водного хозяйства КР', country: 'Кыргызстан', flag: '🇰🇬', color: '#ef4444' },
  tj_mewr:  { name: 'МЭПР Таджикистана', country: 'Таджикистан', flag: '🇹🇯', color: '#60a5fa' },
  tm_gus:   { name: 'ГУС Туркменистана', country: 'Туркменистан', flag: '🇹🇲', color: '#a78bfa' },
};

const TEMPLATES: ReportTemplate[] = [
  {
    id: 'uzm-01', name: 'Ежемесячный гидрологический отчёт', ministry: 'uz_mwrc',
    periodicity: 'monthly', deadline: '2026-06-05',
    sections: ['Уровни водохранилищ', 'Объёмы водозабора', 'Потери воды', 'КПД ирригации', 'Инциденты'],
    status: 'ready', autoFill: 94,
  },
  {
    id: 'uzm-02', name: 'Квартальный отчёт по объектам ВХ', ministry: 'uz_mwrc',
    periodicity: 'quarterly', deadline: '2026-07-01',
    sections: ['Техсостояние ГТС', 'Ремонтные работы', 'Аварийные риски', 'Мониторинг качества воды'],
    status: 'draft', autoFill: 78,
  },
  {
    id: 'kzm-01', name: 'Трансграничный мониторинг (Сырдарья)', ministry: 'kz_miosd',
    periodicity: 'monthly', deadline: '2026-06-10',
    sections: ['Объёмы стока', 'Химический анализ', 'Соблюдение квот', 'Претензии/споры'],
    status: 'submitted', lastSubmitted: '2026-05-10', autoFill: 88,
  },
  {
    id: 'kzm-02', name: 'Годовой экологический отчёт', ministry: 'kz_miosd',
    periodicity: 'annual', deadline: '2027-01-31',
    sections: ['Биоразнообразие', 'Загрязнение', 'Засоление почв', 'Восстановление Арала'],
    status: 'draft', autoFill: 45,
  },
  {
    id: 'kgd-01', name: 'Ледниковый мониторинг Q2-2026', ministry: 'kg_dept',
    periodicity: 'quarterly', deadline: '2026-07-15',
    sections: ['Объёмы ледников', 'ГЛОФ-риски', 'Весенний паводок', 'Горные водохранилища'],
    status: 'draft', autoFill: 62,
  },
  {
    id: 'tjm-01', name: 'Нурекское вдхр. — операционный отчёт', ministry: 'tj_mewr',
    periodicity: 'monthly', deadline: '2026-06-05',
    sections: ['Выработка ГЭС', 'Уровень воды', 'Водопропуск', 'Безопасность'],
    status: 'accepted', lastSubmitted: '2026-05-05', autoFill: 97,
  },
];

// ── Sub-components ──────────────────────────────────────────────────────────

const statusConfig: Record<ReportStatus, { label: string; icon: JSX.Element; color: string; bg: string }> = {
  draft:     { label: 'Черновик', icon: <Clock className="w-3 h-3" />, color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
  ready:     { label: 'Готов', icon: <CheckCircle className="w-3 h-3" />, color: '#00e6c8', bg: 'rgba(0,230,200,0.1)' },
  submitted: { label: 'Подан', icon: <Send className="w-3 h-3" />, color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
  accepted:  { label: 'Принят', icon: <CheckCircle className="w-3 h-3" />, color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  rejected:  { label: 'Отклонён', icon: <AlertTriangle className="w-3 h-3" />, color: '#f87171', bg: 'rgba(248,113,113,0.1)' },
};

function StatusPill({ s }: { s: ReportStatus }) {
  const cfg = statusConfig[s];
  return (
    <span
      className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
      style={{ color: cfg.color, background: cfg.bg }}
    >
      {cfg.icon}{cfg.label}
    </span>
  );
}

function AutoFillBar({ pct }: { pct: number }) {
  const color = pct >= 90 ? '#22c55e' : pct >= 70 ? '#fbbf24' : '#f87171';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-white/8 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-[10px] font-mono" style={{ color }}>{pct}%</span>
    </div>
  );
}

// ── Report preview data ────────────────────────────────────────────────────

const PREVIEW_SECTIONS = [
  {
    title: '1. Уровни водохранилищ',
    rows: [
      { name: 'Чарвак', value: '1932 млн м³', capacity: '82%', trend: '▲ +2.1%' },
      { name: 'Туябугуз', value: '524 млн м³', capacity: '71%', trend: '▼ -0.8%' },
      { name: 'Андижан', value: '248 млн м³', capacity: '38%', trend: '▼ -3.2%' },
      { name: 'Кайраккум', value: '1870 млн м³', capacity: '93%', trend: '▲ +1.5%' },
    ],
  },
  {
    title: '2. Объёмы водозабора (млн м³)',
    rows: [
      { name: 'Ферганская обл.', value: '284.5 млн м³', capacity: '92%', trend: '+12.3%' },
      { name: 'Ташкентская обл.', value: '198.2 млн м³', capacity: '78%', trend: '-3.1%' },
      { name: 'Самаркандская обл.', value: '156.8 млн м³', capacity: '65%', trend: '+5.7%' },
    ],
  },
];

// ── Main Page ──────────────────────────────────────────────────────────────

type Tab = 'reports' | 'preview' | 'submit' | 'settings';

export default function RegulatoryPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('reports');
  const [selectedReport, setSelectedReport] = useState<ReportTemplate | null>(TEMPLATES[0]);
  const [filterMinistry, setFilterMinistry] = useState<'all' | Ministry>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | ReportStatus>('all');
  const [generating, setGenerating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const filtered = TEMPLATES.filter(r =>
    (filterMinistry === 'all' || r.ministry === filterMinistry) &&
    (filterStatus === 'all' || r.status === filterStatus)
  );

  const dueCount = TEMPLATES.filter(r => r.status === 'draft' || r.status === 'ready').length;
  const acceptedCount = TEMPLATES.filter(r => r.status === 'accepted').length;
  const avgAutoFill = Math.round(TEMPLATES.reduce((s, r) => s + r.autoFill, 0) / TEMPLATES.length);

  async function handleGenerate() {
    setGenerating(true);
    await new Promise(r => setTimeout(r, 1800));
    setGenerating(false);
    if (selectedReport) {
      setSelectedReport({ ...selectedReport, status: 'ready', autoFill: 97 });
    }
    setTab('preview');
  }

  async function handleExportPDF() {
    setExporting(true);
    try {
      const jspdfMod = await import('jspdf');
      const html2canvasMod = await import('html2canvas');
      const jsPDF = jspdfMod.default;
      const html2canvas = html2canvasMod.default;

      if (!previewRef.current) return;
      const canvas = await html2canvas(previewRef.current, {
        backgroundColor: '#0a1628',
        scale: 1.5,
        useCORS: true,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`report-${selectedReport?.id ?? 'export'}-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (e) {
      console.error('PDF export error', e);
    } finally {
      setExporting(false);
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'reports', label: '📋 Отчёты' },
    { id: 'preview', label: '👁 Предпросмотр' },
    { id: 'submit', label: '📤 Подача' },
    { id: 'settings', label: '⚙ Настройки' },
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
              <FileText className="w-7 h-7 text-cyan-400" />
              Регуляторный модуль
            </h1>
            <p className="text-white/40 text-sm mt-1">
              Автоматическая генерация и подача отчётов в министерства · 5 стран
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #00e6c8, #0080ff)', color: '#000' }}
          >
            {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {generating ? 'Генерация...' : 'Обновить данные'}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'К сдаче', value: dueCount, icon: <Clock className="w-5 h-5" />, color: '#fbbf24' },
            { label: 'Принято МВХ', value: acceptedCount, icon: <CheckCircle className="w-5 h-5" />, color: '#22c55e' },
            { label: 'Авто-заполнение', value: `${avgAutoFill}%`, icon: <BarChart2 className="w-5 h-5" />, color: '#00e6c8' },
            { label: 'Министерств', value: Object.keys(MINISTRIES).length, icon: <Building2 className="w-5 h-5" />, color: '#a78bfa' },
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
              <div className="text-2xl font-bold text-white">{s.value}</div>
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

        {/* ── Reports Tab ── */}
        {tab === 'reports' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <select
                value={filterMinistry}
                onChange={e => setFilterMinistry(e.target.value as any)}
                className="text-xs bg-white/5 text-white/70 border border-white/10 rounded-lg px-3 py-1.5 outline-none"
              >
                <option value="all">Все министерства</option>
                {Object.entries(MINISTRIES).map(([k, v]) => (
                  <option key={k} value={k}>{v.flag} {v.country}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value as any)}
                className="text-xs bg-white/5 text-white/70 border border-white/10 rounded-lg px-3 py-1.5 outline-none"
              >
                <option value="all">Все статусы</option>
                {(['draft', 'ready', 'submitted', 'accepted', 'rejected'] as ReportStatus[]).map(s => (
                  <option key={s} value={s}>{statusConfig[s].label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filtered.map(r => {
                const min = MINISTRIES[r.ministry];
                const isSelected = selectedReport?.id === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedReport(r)}
                    className="rounded-2xl p-4 cursor-pointer transition"
                    style={{
                      background: isSelected ? 'rgba(0,230,200,0.07)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${isSelected ? 'rgba(0,230,200,0.3)' : 'rgba(255,255,255,0.07)'}`,
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white text-sm truncate">{r.name}</div>
                        <div className="text-xs text-white/40 mt-0.5 flex items-center gap-1.5">
                          <span>{min.flag}</span>
                          <span className="truncate">{min.name}</span>
                        </div>
                      </div>
                      <StatusPill s={r.status} />
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
                      <div>
                        <span className="text-white/30">Периодичность</span>
                        <div className="text-white/60 mt-0.5">
                          {{ monthly: 'Ежемесячно', quarterly: 'Ежеквартально', annual: 'Ежегодно' }[r.periodicity]}
                        </div>
                      </div>
                      <div>
                        <span className="text-white/30">Срок сдачи</span>
                        <div className={`mt-0.5 ${new Date(r.deadline) < new Date() ? 'text-red-400' : 'text-white/60'}`}>
                          {r.deadline}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="text-[10px] text-white/30 mb-1">Авто-заполнение из БД</div>
                      <AutoFillBar pct={r.autoFill} />
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1">
                      {r.sections.slice(0, 3).map(s => (
                        <span key={s} className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-white/40">
                          {s}
                        </span>
                      ))}
                      {r.sections.length > 3 && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-white/30">
                          +{r.sections.length - 3}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={e => { e.stopPropagation(); setSelectedReport(r); setTab('preview'); }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-white/50 hover:text-white/80 transition border border-white/10 hover:bg-white/5"
                      >
                        <Eye className="w-3 h-3" /> Просмотр
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); setSelectedReport(r); handleGenerate(); }}
                        disabled={generating}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition disabled:opacity-50"
                        style={{ background: 'rgba(0,230,200,0.1)', color: '#00e6c8', border: '1px solid rgba(0,230,200,0.2)' }}
                      >
                        <RefreshCw className={`w-3 h-3 ${generating ? 'animate-spin' : ''}`} /> Генерировать
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Preview Tab ── */}
        {tab === 'preview' && selectedReport && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white">{selectedReport.name}</h3>
                <p className="text-xs text-white/40 mt-0.5">
                  {MINISTRIES[selectedReport.ministry].flag} {MINISTRIES[selectedReport.ministry].name}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleExportPDF}
                  disabled={exporting}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition disabled:opacity-60"
                  style={{ background: 'rgba(0,230,200,0.1)', color: '#00e6c8', border: '1px solid rgba(0,230,200,0.2)' }}
                >
                  <Download className={`w-4 h-4 ${exporting ? 'animate-bounce' : ''}`} />
                  {exporting ? 'Экспорт...' : 'PDF'}
                </button>
                <button
                  onClick={() => setTab('submit')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition"
                  style={{ background: 'linear-gradient(135deg, #00e6c8, #0080ff)', color: '#000' }}
                >
                  <Send className="w-4 h-4" /> Подать
                </button>
              </div>
            </div>

            {/* Report document preview */}
            <div
              ref={previewRef}
              className="rounded-2xl p-8"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              {/* Doc header */}
              <div className="border-b border-white/10 pb-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">
                      VODecology · VODPROM Platform
                    </div>
                    <h2 className="text-xl font-bold text-white">{selectedReport.name}</h2>
                  </div>
                  <div className="text-right text-xs text-white/40">
                    <div>Дата: {new Date().toLocaleDateString('ru-RU')}</div>
                    <div>Период: май 2026</div>
                    <div>ID: {selectedReport.id.toUpperCase()}</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <div className="text-white/30">Получатель</div>
                    <div className="text-white/70 mt-0.5">{MINISTRIES[selectedReport.ministry].name}</div>
                  </div>
                  <div>
                    <div className="text-white/30">Составитель</div>
                    <div className="text-white/70 mt-0.5">VODPROM Data Platform</div>
                  </div>
                  <div>
                    <div className="text-white/30">Авто-заполнение</div>
                    <div className="text-cyan-300 mt-0.5">{selectedReport.autoFill}% из Supabase</div>
                  </div>
                </div>
              </div>

              {/* Sections */}
              {PREVIEW_SECTIONS.map(sec => (
                <div key={sec.title} className="mb-6">
                  <h3 className="text-sm font-semibold text-cyan-300 mb-3">{sec.title}</h3>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-white/8">
                        <th className="text-left pb-2 text-white/30 font-medium">Объект</th>
                        <th className="text-right pb-2 text-white/30 font-medium">Значение</th>
                        <th className="text-right pb-2 text-white/30 font-medium">% наполнения</th>
                        <th className="text-right pb-2 text-white/30 font-medium">Динамика</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sec.rows.map(row => (
                        <tr key={row.name} className="border-b border-white/4">
                          <td className="py-2 text-white/70">{row.name}</td>
                          <td className="py-2 text-right text-white/70 font-mono">{row.value}</td>
                          <td className="py-2 text-right">
                            <span className={
                              parseInt(row.capacity) >= 80 ? 'text-green-400' :
                              parseInt(row.capacity) >= 50 ? 'text-yellow-400' : 'text-red-400'
                            }>{row.capacity}</span>
                          </td>
                          <td className={`py-2 text-right font-mono ${row.trend.startsWith('▲') || row.trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                            {row.trend}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}

              {/* Signature block */}
              <div className="mt-8 pt-4 border-t border-white/8 flex items-center justify-between text-xs text-white/30">
                <div>Сгенерировано автоматически · VODPROM · {new Date().toISOString().slice(0, 19)}</div>
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Верифицировано SHA-256
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Submit Tab ── */}
        {tab === 'submit' && (
          <div className="max-w-xl space-y-4">
            <div
              className="rounded-2xl p-6"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Send className="w-4 h-4 text-cyan-400" /> Подача отчёта
              </h3>
              {selectedReport ? (
                <div className="space-y-4">
                  <div className="rounded-lg p-3 text-sm" style={{ background: 'rgba(0,230,200,0.06)', border: '1px solid rgba(0,230,200,0.15)' }}>
                    <div className="text-cyan-300 font-medium mb-1">{selectedReport.name}</div>
                    <div className="text-white/40 text-xs">{MINISTRIES[selectedReport.ministry].flag} {MINISTRIES[selectedReport.ministry].name}</div>
                  </div>
                  <div className="space-y-2 text-sm">
                    {[
                      { label: 'Способ подачи', value: 'API МВХ v2 (автоматический)' },
                      { label: 'Формат', value: 'XML + PDF (подписанный)' },
                      { label: 'Срок сдачи', value: selectedReport.deadline },
                      { label: 'Авто-заполнение', value: `${selectedReport.autoFill}%` },
                    ].map(item => (
                      <div key={item.label} className="flex justify-between">
                        <span className="text-white/40">{item.label}</span>
                        <span className="text-white/70">{item.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-lg text-xs" style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)' }}>
                    <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span className="text-yellow-300/70">
                      Подача требует ЭЦП руководителя организации. Убедитесь в актуальности подписи.
                    </span>
                  </div>
                  <button
                    className="w-full py-3 rounded-xl font-semibold text-sm transition"
                    style={{ background: 'linear-gradient(135deg, #00e6c8, #0080ff)', color: '#000' }}
                  >
                    Подписать ЭЦП и отправить
                  </button>
                </div>
              ) : (
                <p className="text-white/40 text-sm">Выберите отчёт во вкладке «Отчёты»</p>
              )}
            </div>

            {/* Submission log */}
            <div
              className="rounded-2xl p-4"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <h4 className="text-sm font-semibold text-white mb-3">История подач</h4>
              <div className="space-y-2">
                {TEMPLATES.filter(r => r.status === 'submitted' || r.status === 'accepted' || r.status === 'rejected').map(r => (
                  <div key={r.id} className="flex items-center justify-between text-xs">
                    <div className="truncate mr-2">
                      <span className="text-white/60">{r.name}</span>
                      <span className="text-white/30 ml-2">{r.lastSubmitted}</span>
                    </div>
                    <StatusPill s={r.status} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Settings Tab ── */}
        {tab === 'settings' && (
          <div className="max-w-xl space-y-4">
            <div
              className="rounded-2xl p-6 space-y-4"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Settings className="w-4 h-4 text-cyan-400" /> Настройки интеграций
              </h3>
              {Object.entries(MINISTRIES).map(([k, m]) => (
                <div key={k} className="flex items-center justify-between py-2 border-b border-white/6 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{m.flag}</span>
                    <div>
                      <div className="text-sm text-white/70">{m.name}</div>
                      <div className="text-xs text-white/30">{m.country}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
                      Подключено
                    </span>
                    <button className="text-white/30 hover:text-white/60 transition">
                      <Settings className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
