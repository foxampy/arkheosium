/**
 * DocumentsPage — Brochures, Business Cards & Personalized QR Invitations
 * Three tabs: Брошюры | Визитки | Приглашения
 */

import { useState, useEffect, useRef } from 'react';
import {
  FileText, Download, CreditCard, Mail, User, Phone,
  Briefcase, Search, Users, Loader2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

// ── Types ──────────────────────────────────────────────────────────────────

type TabId = 'brochures' | 'cards' | 'invitations';

interface Stakeholder {
  id: string;
  full_name: string | null;
  position: string | null;
  activity_area: string | null;
  stakeholder_type: string | null;
  country: string | null;
  region: string | null;
}

interface CardPrefs {
  name: string;
  title: string;
  email: string;
  phone: string;
}

// ── Constants ──────────────────────────────────────────────────────────────

const ACCENT = '#00e6c8';
const CARD_BG = 'rgba(0,8,30,0.8)';
const CARD_BORDER = '1px solid rgba(0,230,200,0.12)';

const ROLE_PRESETS = [
  'CEO / Генеральный директор',
  'Head of Water Infrastructure',
  'Investment Director',
  'Technical Director',
  'Regional Manager',
  'Research Coordinator',
];

const TYPE_COLORS: Record<string, string> = {
  executive: '#00e6c8',
  financial: '#fbbf24',
  political: '#a78bfa',
  technical: '#60a5fa',
};

const TYPE_LABELS: Record<string, string> = {
  executive: 'Руководитель',
  financial: 'Финансовый',
  political: 'Политический',
  technical: 'Технический',
};

// ── Design helpers ──────────────────────────────────────────────────────────

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: CARD_BG,
      border: CARD_BORDER,
      backdropFilter: 'blur(12px)',
      borderRadius: 16,
      ...style,
    }}>
      {children}
    </div>
  );
}

// ── PDF helpers ────────────────────────────────────────────────────────────

async function captureToPDF(
  el: HTMLDivElement,
  filename: string,
  orientation: 'portrait' | 'landscape' = 'portrait',
) {
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import('jspdf'),
    import('html2canvas'),
  ]);
  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#0a1628',
    logging: false,
  });
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({ orientation, unit: 'mm', format: 'a4' });
  const pdfW = pdf.internal.pageSize.getWidth();
  const pdfH = (canvas.height * pdfW) / canvas.width;
  pdf.addImage(imgData, 'PNG', 0, 0, pdfW, pdfH);
  pdf.save(filename);
}

async function captureToPNG(el: HTMLDivElement, filename: string) {
  const { default: html2canvas } = await import('html2canvas');
  const canvas = await html2canvas(el, {
    scale: 3,
    useCORS: true,
    backgroundColor: '#0a1628',
    logging: false,
  });
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

// ── Tab 1: Brochures ───────────────────────────────────────────────────────

const MATERIALS = [
  {
    id: 'invest',
    icon: '💹',
    title: 'Инвестиционная брошюра',
    desc: 'Инвестиционные уровни, финансовые показатели, IRR 15–22%. Для потенциальных инвесторов.',
    format: 'A4 · 2 стр.',
    orientation: 'portrait' as const,
    filename: 'VODPROM-investment-brochure.pdf',
    color: '#00e6c8',
  },
  {
    id: 'gov',
    icon: '🏛',
    title: 'Государственная презентация',
    desc: 'Проблематика, решения, KPI. Для министерств и государственных органов.',
    format: 'A4 · 1 стр.',
    orientation: 'portrait' as const,
    filename: 'VODPROM-government-presentation.pdf',
    color: '#60a5fa',
  },
  {
    id: 'tech',
    icon: '⚙️',
    title: 'Технический листок',
    desc: 'IoT, Digital Twin, SCADA, архитектура платформы. Для технических специалистов.',
    format: 'A4 · 1 стр.',
    orientation: 'portrait' as const,
    filename: 'VODPROM-tech-sheet.pdf',
    color: '#a78bfa',
  },
  {
    id: 'partner',
    icon: '🤝',
    title: 'Партнёрский обзор',
    desc: 'Корпоративные, финансовые, государственные партнёры. Для деловых переговоров.',
    format: 'A4 · 1 стр.',
    orientation: 'portrait' as const,
    filename: 'VODPROM-partner-overview.pdf',
    color: '#fbbf24',
  },
  {
    id: 'euro',
    icon: '📰',
    title: 'Евроброшюра DL',
    desc: 'Трёхпанельная раскладная брошюра. Формат DL (альбомный A4). Для выставок и рассылок.',
    format: 'DL · Landscape',
    orientation: 'landscape' as const,
    filename: 'VODPROM-eurobrochure-DL.pdf',
    color: '#f472b6',
  },
];

// Hidden print layout components
function PrintInvest({ innerRef }: { innerRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div
      ref={innerRef as React.RefObject<HTMLDivElement>}
      aria-hidden="true"
      style={{
        position: 'absolute', left: -9999, top: 0, pointerEvents: 'none',
        width: 794, background: '#0a1628', color: '#fff', fontFamily: 'sans-serif',
        padding: 48,
      }}
    >
      {/* Page 1 */}
      <div style={{ minHeight: 520, borderBottom: '2px solid #00e6c8', marginBottom: 32, paddingBottom: 32 }}>
        <div style={{ fontSize: 28, fontWeight: 900, color: '#00e6c8', letterSpacing: 3, marginBottom: 8 }}>VODPROM</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Цифровое управление водой</div>
        <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', marginBottom: 32 }}>Центральная Азия</div>
        <div style={{ display: 'flex', gap: 24, marginBottom: 32 }}>
          {[['$50B+', 'инфраструктура'], ['473', 'объекта мониторинга'], ['15–22%', 'IRR']].map(([v, l]) => (
            <div key={l} style={{ flex: 1, background: 'rgba(0,230,200,0.08)', borderRadius: 12, padding: '16px 12px', border: '1px solid rgba(0,230,200,0.2)' }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#00e6c8' }}>{v}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 12 }}>Инвестиционные уровни</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: 'rgba(0,230,200,0.1)' }}>
              {['Уровень', 'Вход', 'Доля', 'Горизонт', 'ROI'].map(h => (
                <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: '#00e6c8', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['Seed', '$50,000', '0.5–1%', '3 года', '18% IRR'],
              ['Growth', '$500,000', '2–5%', '5 лет', '21% IRR'],
              ['Strategic', '$5,000,000', '10–20%', '7 лет', '22% IRR'],
            ].map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {row.map((cell, j) => (
                  <td key={j} style={{ padding: '8px 12px', color: j === 0 ? '#fff' : 'rgba(255,255,255,0.6)' }}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Page 2 */}
      <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 16 }}>Проектный портфель</div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, marginBottom: 24 }}>
        <thead>
          <tr style={{ background: 'rgba(96,165,250,0.1)' }}>
            {['Проект', 'Страна', 'Объём', 'Статус'].map(h => (
              <th key={h} style={{ padding: '6px 10px', textAlign: 'left', color: '#60a5fa' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[
            ['Модернизация Чарвака', 'Узбекистан', '$12M', 'Активный'],
            ['Сырдарья IoT', 'Казахстан', '$8M', 'Подготовка'],
            ['Нурек Digital Twin', 'Таджикистан', '$15M', 'Переговоры'],
          ].map((row, i) => (
            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: '6px 10px', color: j === 3 ? '#00e6c8' : 'rgba(255,255,255,0.65)' }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, color: '#00e6c8', fontWeight: 700, marginBottom: 8 }}>VOD Token</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>
            Utility-токен платформы для доступа к данным, управления DAO и дивидендов от водной инфраструктуры. TGE Q4 2026.
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent('https://vodprom.vercel.app')}`} width={80} height={80} alt="QR" />
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>vodprom.vercel.app</div>
        </div>
      </div>
      <div style={{ marginTop: 24, fontSize: 10, color: 'rgba(255,255,255,0.25)', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 12 }}>
        VODPROM © 2026 · Конфиденциально · Только для инвесторов
      </div>
    </div>
  );
}

function PrintGov({ innerRef }: { innerRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div
      ref={innerRef as React.RefObject<HTMLDivElement>}
      aria-hidden="true"
      style={{
        position: 'absolute', left: -9999, top: 0, pointerEvents: 'none',
        width: 794, background: '#0d1b2a', color: '#fff', fontFamily: 'sans-serif', padding: 48,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, borderBottom: '2px solid rgba(96,165,250,0.4)', paddingBottom: 20 }}>
        <div style={{ fontSize: 40 }}>🇺🇿</div>
        <div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>Республика Узбекистан</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#60a5fa' }}>Министерство водного хозяйства</div>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right', fontSize: 22, fontWeight: 900, color: '#00e6c8' }}>VODPROM</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 }}>
        <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: 12, color: '#f87171', fontWeight: 700, marginBottom: 8 }}>Проблема</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
            • 40% потерь воды в ирригационных системах<br />
            • +2°C рост температуры к 2050 году<br />
            • Устаревшая инфраструктура 1960–1980-х гг.<br />
            • Отсутствие единой цифровой системы учёта
          </div>
        </div>
        <div style={{ background: 'rgba(0,230,200,0.08)', border: '1px solid rgba(0,230,200,0.2)', borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: 12, color: '#00e6c8', fontWeight: 700, marginBottom: 8 }}>Решение — VODPROM OS</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
            • Единая IoT-платформа мониторинга<br />
            • AI-прогнозирование водопотребления<br />
            • Digital Twin для каждого объекта<br />
            • Интеграция с SCADA и GIS-системами
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 28 }}>
        {[
          { v: '473', l: 'объекта\nмониторинга', c: '#00e6c8' },
          { v: '5', l: 'стран\nЦА', c: '#60a5fa' },
          { v: '36', l: 'специалистов\nв команде', c: '#a78bfa' },
          { v: '263', l: 'партнёра\nв экосистеме', c: '#fbbf24' },
        ].map(({ v, l, c }) => (
          <div key={v} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 14, textAlign: 'center', border: `1px solid ${c}22` }}>
            <div style={{ fontSize: 30, fontWeight: 900, color: c }}>{v}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 4, whiteSpace: 'pre' }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: 12 }}>
          🌊 <b style={{ color: '#60a5fa' }}>МФСА</b> — Международный Фонд Спасения Арала. Партнёрство по трансграничному мониторингу.
        </div>
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: 12 }}>
          🎯 <b style={{ color: '#00e6c8' }}>ЦУР ООН 6</b> — Обеспечение наличия и рационального использования водных ресурсов для всех.
        </div>
      </div>
      <div style={{ marginTop: 20, fontSize: 10, color: 'rgba(255,255,255,0.2)', borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 10 }}>
        VODPROM · vodprom.vercel.app · contact@vodprom.com · 2026
      </div>
    </div>
  );
}

function PrintTech({ innerRef }: { innerRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div
      ref={innerRef as React.RefObject<HTMLDivElement>}
      aria-hidden="true"
      style={{
        position: 'absolute', left: -9999, top: 0, pointerEvents: 'none',
        width: 794, background: '#080f1e', color: '#fff', fontFamily: 'sans-serif', padding: 48,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderBottom: '1px solid rgba(167,139,250,0.3)', paddingBottom: 16 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#a78bfa', letterSpacing: 2 }}>VODPROM</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>Технический листок · Platform v2.0</div>
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textAlign: 'right' }}>
          Ред. 2026-Q2<br />Конфиденциально
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
        <div>
          <div style={{ fontSize: 12, color: '#a78bfa', fontWeight: 700, marginBottom: 10 }}>IoT Сенсоры</div>
          {[
            ['Мониторинг', 'Реальное время, 1–5 сек'],
            ['Протокол', 'NB-IoT / LoRaWAN'],
            ['Геолокация', 'GPS / ГЛОНАСС'],
            ['Питание', 'Solar + Li-ion'],
            ['Защита', 'IP68, -40°C до +70°C'],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 11 }}>
              <span style={{ color: 'rgba(255,255,255,0.45)' }}>{k}</span>
              <span style={{ color: 'rgba(255,255,255,0.75)' }}>{v}</span>
            </div>
          ))}
          <div style={{ fontSize: 12, color: '#a78bfa', fontWeight: 700, margin: '18px 0 10px' }}>Digital Twin</div>
          {['Физическое моделирование', 'Прогнозная аналитика', 'Сценарный анализ', 'ML-оптимизация'].map(f => (
            <div key={f} style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              ✓ {f}
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 12, color: '#00e6c8', fontWeight: 700, marginBottom: 10 }}>Архитектура</div>
          {[
            ['Датчик', '#a78bfa'],
            ['Шлюз (Gateway)', '#60a5fa'],
            ['VODPROM Cloud', '#00e6c8'],
            ['Dashboard', '#22c55e'],
            ['AI Analytics', '#fbbf24'],
          ].map(([name, color], i, arr) => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: i < arr.length - 1 ? 0 : 0 }}>
              <div style={{ background: `${color}22`, border: `1px solid ${color}55`, borderRadius: 6, padding: '6px 12px', fontSize: 11, color, fontWeight: 600, flex: 1, textAlign: 'center' }}>
                {name}
              </div>
              {i < arr.length - 1 && <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 14, margin: '2px 0' }}>↓</div>}
            </div>
          ))}
          <div style={{ marginTop: 16, fontSize: 12, color: '#60a5fa', fontWeight: 700, marginBottom: 10 }}>Стек технологий</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {['React 18', 'TypeScript', 'Supabase', 'MapLibre GL', 'Three.js', 'NB-IoT', 'LoRaWAN', 'SCADA', 'REST API'].map(t => (
              <span key={t} style={{ background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.25)', borderRadius: 4, padding: '3px 7px', fontSize: 10, color: '#a78bfa' }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
      <div style={{ marginTop: 24, fontSize: 10, color: 'rgba(255,255,255,0.2)', borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 10 }}>
        VODPROM Technical Datasheet · vodprom.vercel.app · 2026
      </div>
    </div>
  );
}

function PrintPartner({ innerRef }: { innerRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div
      ref={innerRef as React.RefObject<HTMLDivElement>}
      aria-hidden="true"
      style={{
        position: 'absolute', left: -9999, top: 0, pointerEvents: 'none',
        width: 794, background: '#09101f', color: '#fff', fontFamily: 'sans-serif', padding: 48,
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 26, fontWeight: 900, color: '#fbbf24', letterSpacing: 2 }}>VODPROM</div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>Партнёрская экосистема · 263 организации</div>
      </div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
        {[
          { title: 'Корпоративные', color: '#00e6c8', items: ['Поставщики оборудования', 'IT-компании', 'Строительные фирмы', 'Сервисные организации', 'Проектировщики'] },
          { title: 'Финансовые', color: '#fbbf24', items: ['АБР (ADB)', 'Всемирный Банк', 'ЕБРР', 'IsDB', 'Частные фонды'] },
          { title: 'Государственные', color: '#a78bfa', items: ['Министерства ВХ', 'Комитеты экологии', 'Региональные органы', 'МФСА', 'UN Water'] },
        ].map(({ title, color, items }) => (
          <div key={title} style={{ flex: 1, background: `${color}08`, border: `1px solid ${color}22`, borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 12, color, fontWeight: 700, marginBottom: 12 }}>{title}</div>
            {items.map(item => (
              <div key={item} style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                · {item}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 32, padding: '16px 0', background: 'rgba(255,255,255,0.03)', borderRadius: 12, marginBottom: 20 }}>
        {[['263', 'Партнёров', '#fbbf24'], ['5', 'Стран', '#60a5fa'], ['$50B+', 'Активов под управлением', '#00e6c8']].map(([v, l, c]) => (
          <div key={l} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: c as string }}>{v}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginBottom: 12 }}>
        Станьте частью экосистемы цифрового водного хозяйства Центральной Азии
      </div>
      <div style={{ textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.2)', borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 10 }}>
        VODPROM Partnership · partners@vodprom.com · vodprom.vercel.app
      </div>
    </div>
  );
}

function PrintEuro({ innerRef }: { innerRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div
      ref={innerRef as React.RefObject<HTMLDivElement>}
      aria-hidden="true"
      style={{
        position: 'absolute', left: -9999, top: 0, pointerEvents: 'none',
        width: 1122, height: 794, background: '#08101e', color: '#fff',
        fontFamily: 'sans-serif', display: 'flex', overflow: 'hidden',
      }}
    >
      {/* Panel 3 — Back/Left */}
      <div style={{ width: 374, background: 'linear-gradient(135deg,#0a1628,#001530)', padding: 40, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
        <div>
          <div style={{ fontSize: 14, color: '#00e6c8', fontWeight: 700, marginBottom: 16 }}>Свяжитесь с нами</div>
          {[['🌐', 'vodprom.vercel.app'], ['📧', 'contact@vodprom.com'], ['📍', 'Ташкент, Узбекистан']].map(([icon, text]) => (
            <div key={text} style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 10, display: 'flex', gap: 8 }}>
              <span>{icon}</span><span>{text}</span>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center' }}>
          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent('https://vodprom.vercel.app')}`} width={100} height={100} alt="QR" style={{ border: '3px solid rgba(0,230,200,0.3)', borderRadius: 8 }} />
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 6 }}>Сканируйте для перехода на платформу</div>
        </div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>VODPROM © 2026</div>
      </div>
      {/* Panel 2 — Middle */}
      <div style={{ width: 374, background: 'rgba(0,8,30,0.9)', padding: 40, borderRight: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontSize: 15, color: '#f87171', fontWeight: 700, marginBottom: 20 }}>Водный кризис в ЦА</div>
        {[
          ['40%', 'воды теряется в ирригационных системах'],
          ['+2°C', 'рост температуры к 2050 году'],
          ['$200B', 'ущерб от неэффективного водопользования'],
        ].map(([v, l]) => (
          <div key={v} style={{ background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.15)', borderRadius: 10, padding: '14px 16px', marginBottom: 12 }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#f87171' }}>{v}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>{l}</div>
          </div>
        ))}
        <div style={{ marginTop: 16, fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
          Без цифровизации водного хозяйства регион столкнётся с острой нехваткой воды к 2035 году.
        </div>
      </div>
      {/* Panel 1 — Front/Right */}
      <div style={{ width: 374, background: 'linear-gradient(135deg,#001830,#000d20)', padding: 40, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 30, fontWeight: 900, color: '#00e6c8', letterSpacing: 3, marginBottom: 4 }}>VODPROM</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 32 }}>Smart Water Management</div>
          {/* Wave graphic */}
          <div style={{ position: 'relative', height: 80, marginBottom: 24 }}>
            {[0, 1, 2, 3].map(i => (
              <div key={i} style={{
                position: 'absolute', borderRadius: '50%',
                border: `1px solid rgba(0,230,200,${0.15 - i * 0.03})`,
                width: 60 + i * 40, height: 60 + i * 40,
                top: '50%', left: '50%',
                transform: 'translate(-50%,-50%)',
              }} />
            ))}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', color: '#00e6c8', fontSize: 20 }}>💧</div>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, marginBottom: 16 }}>
            Цифровая платформа управления<br />водной инфраструктурой<br />Центральной Азии
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['IoT', 'AI', 'Blockchain', 'GIS'].map(t => (
              <span key={t} style={{ background: 'rgba(0,230,200,0.1)', border: '1px solid rgba(0,230,200,0.25)', borderRadius: 4, padding: '3px 8px', fontSize: 10, color: '#00e6c8' }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Business card print layout
function PrintBusinessCard({
  innerRef, prefs,
}: {
  innerRef: React.RefObject<HTMLDivElement | null>;
  prefs: CardPrefs;
}) {
  return (
    <div
      ref={innerRef as React.RefObject<HTMLDivElement>}
      aria-hidden="true"
      style={{
        position: 'absolute', left: -9999, top: 0, pointerEvents: 'none',
        width: 323, height: 209, background: '#0a1628',
        borderRadius: 10, padding: '16px 20px',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        fontFamily: 'sans-serif', overflow: 'hidden',
      }}
    >
      <div style={{ fontSize: 16, fontWeight: 900, color: '#00e6c8', letterSpacing: 2 }}>VODPROM</div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{prefs.name || 'Имя Фамилия'}</div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{prefs.title || 'Должность'}</div>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>{prefs.email}</div>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>{prefs.phone}</div>
      </div>
      <img
        src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${encodeURIComponent('https://vodprom.vercel.app')}`}
        width={50} height={50} alt="QR"
        style={{ position: 'absolute', right: 16, bottom: 16 }}
      />
    </div>
  );
}

// Invitation print layout
// ── Main Page ──────────────────────────────────────────────────────────────

export default function DocumentsPage() {
  const [tab, setTab] = useState<TabId>('brochures');
  const [downloading, setDownloading] = useState<string | null>(null);

  // --- Brochures refs ---
  const refInvest = useRef<HTMLDivElement>(null);
  const refGov = useRef<HTMLDivElement>(null);
  const refTech = useRef<HTMLDivElement>(null);
  const refPartner = useRef<HTMLDivElement>(null);
  const refEuro = useRef<HTMLDivElement>(null);
  const printRefs: Record<string, React.RefObject<HTMLDivElement | null>> = {
    invest: refInvest, gov: refGov, tech: refTech, partner: refPartner, euro: refEuro,
  };

  // --- Business card ---
  const [prefs, setPrefs] = useState<CardPrefs>(() => {
    try {
      const saved = localStorage.getItem('vodprom-card-prefs');
      return saved ? JSON.parse(saved) : { name: '', title: '', email: '', phone: '' };
    } catch { return { name: '', title: '', email: '', phone: '' }; }
  });
  const cardRef = useRef<HTMLDivElement>(null);

  function updatePref(key: keyof CardPrefs, value: string) {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    localStorage.setItem('vodprom-card-prefs', JSON.stringify(next));
  }

  // --- Invitations ---
  const [contacts, setContacts] = useState<Stakeholder[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [bulkGenerating, setBulkGenerating] = useState(false);
  const inviteRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    if (tab !== 'invitations' || contacts.length > 0) return;
    setLoadingContacts(true);
    supabase
      .from('stakeholders')
      .select('id, full_name, position, activity_area, stakeholder_type, country, region')
      .limit(50)
      .then(({ data }) => {
        setContacts((data as Stakeholder[]) ?? []);
        setLoadingContacts(false);
      });
  }, [tab]);

  const filteredContacts = contacts.filter(c => {
    const matchType = typeFilter === 'all' || c.stakeholder_type === typeFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || (c.full_name ?? '').toLowerCase().includes(q) || (c.position ?? '').toLowerCase().includes(q);
    return matchType && matchSearch;
  });

  // --- Handlers ---
  async function handleBrochureDownload(id: string, filename: string, orientation: 'portrait' | 'landscape') {
    const el = printRefs[id]?.current;
    if (!el) return;
    setDownloading(id);
    try {
      await captureToPDF(el, filename, orientation);
    } finally {
      setDownloading(null);
    }
  }

  async function handleCardDownload() {
    if (!cardRef.current) return;
    setDownloading('card');
    try {
      await captureToPNG(cardRef.current, 'VODPROM-business-card.png');
    } finally {
      setDownloading(null);
    }
  }

  async function handleInviteDownload(contact: Stakeholder) {
    const el = inviteRefs.current.get(contact.id);
    if (!el) return;
    setDownloading(contact.id);
    try {
      await captureToPDF(el, `VODPROM-invite-${contact.id}.pdf`);
    } finally {
      setDownloading(null);
    }
  }

  async function handleBulkDownload() {
    if (filteredContacts.length === 0) return;
    setBulkGenerating(true);
    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas'),
      ]);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      let first = true;
      for (const contact of filteredContacts) {
        const el = inviteRefs.current.get(contact.id);
        if (!el) continue;
        const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#0a1628', logging: false });
        const imgData = canvas.toDataURL('image/png');
        if (!first) pdf.addPage();
        const pdfW = pdf.internal.pageSize.getWidth();
        const pdfH = (canvas.height * pdfW) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfW, pdfH);
        first = false;
      }
      pdf.save('VODPROM-invitations-all.pdf');
    } finally {
      setBulkGenerating(false);
    }
  }

  const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'brochures', label: 'Брошюры', icon: <FileText className="w-4 h-4" /> },
    { id: 'cards', label: 'Визитки', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'invitations', label: 'Приглашения', icon: <Mail className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen pt-16 pb-12 px-4">

      {/* Hidden print divs */}
      <PrintInvest innerRef={refInvest} />
      <PrintGov innerRef={refGov} />
      <PrintTech innerRef={refTech} />
      <PrintPartner innerRef={refPartner} />
      <PrintEuro innerRef={refEuro} />
      <PrintBusinessCard innerRef={cardRef} prefs={prefs} />
      {contacts.map(c => (
        <div key={c.id} ref={el => { if (el) inviteRefs.current.set(c.id, el); else inviteRefs.current.delete(c.id); }}
          aria-hidden="true" style={{ position: 'absolute', left: -9999, top: 0, pointerEvents: 'none' }}>
          <InvitationInner contact={c} />
        </div>
      ))}

      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="w-7 h-7" style={{ color: ACCENT }} />
            Документы
          </h1>
          <p className="text-white/40 text-sm mt-1">
            Брошюры для скачивания · Генератор визиток · Персональные приглашения с QR
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-white/8">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition border-b-2 -mb-px"
              style={{
                borderColor: tab === t.id ? ACCENT : 'transparent',
                color: tab === t.id ? ACCENT : 'rgba(255,255,255,0.4)',
              }}
            >
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        {/* ── Tab 1: Brochures ── */}
        {tab === 'brochures' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {MATERIALS.map(m => (
              <Card key={m.id} style={{ padding: 0, overflow: 'hidden' }}>
                {/* Thumbnail */}
                <div style={{
                  height: 140, background: `linear-gradient(135deg, ${m.color}18, ${m.color}06)`,
                  borderBottom: `1px solid ${m.color}22`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8,
                }}>
                  <div style={{ fontSize: 36 }}>{m.icon}</div>
                  <div style={{ fontSize: 10, color: m.color, fontFamily: 'monospace', letterSpacing: 2, fontWeight: 700 }}>VODPROM</div>
                </div>
                <div style={{ padding: '16px 18px' }}>
                  <div className="font-semibold text-white text-sm mb-1">{m.title}</div>
                  <p className="text-white/45 text-xs leading-relaxed mb-3">{m.desc}</p>
                  <div className="flex items-center justify-between">
                    <span style={{ fontSize: 10, color: m.color, background: `${m.color}12`, border: `1px solid ${m.color}30`, borderRadius: 4, padding: '2px 8px' }}>
                      {m.format}
                    </span>
                    <button
                      onClick={() => handleBrochureDownload(m.id, m.filename, m.orientation)}
                      disabled={downloading === m.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-60"
                      style={{ background: `${m.color}15`, color: m.color, border: `1px solid ${m.color}30` }}
                    >
                      {downloading === m.id
                        ? <><Loader2 className="w-3 h-3 animate-spin" /> Генерация...</>
                        : <><Download className="w-3 h-3" /> Скачать PDF</>}
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* ── Tab 2: Business Cards ── */}
        {tab === 'cards' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Preview */}
            <div>
              <div className="text-sm text-white/50 mb-3">Предпросмотр визитки</div>
              <div style={{
                width: 323, height: 209, background: '#0a1628',
                borderRadius: 10, padding: '16px 20px',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                border: `1px solid ${ACCENT}25`, position: 'relative', overflow: 'hidden',
              }}>
                {/* bg decoration */}
                <div style={{ position: 'absolute', right: -30, top: -30, width: 120, height: 120, borderRadius: '50%', background: `${ACCENT}05`, border: `1px solid ${ACCENT}10` }} />
                <div style={{ fontSize: 16, fontWeight: 900, color: ACCENT, letterSpacing: 2 }}>VODPROM</div>
                <div>
                  <div className="text-white font-semibold text-sm">{prefs.name || 'Имя Фамилия'}</div>
                  <div className="text-white/50 text-xs mt-0.5">{prefs.title || 'Должность'}</div>
                  <div className="text-white/40 text-xs mt-2">{prefs.email}</div>
                  <div className="text-white/40 text-xs">{prefs.phone}</div>
                </div>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent('https://vodprom.vercel.app')}`}
                  width={50} height={50} alt="QR"
                  style={{ position: 'absolute', right: 16, bottom: 16 }}
                />
              </div>
              <div className="text-white/25 text-xs mt-2">85 × 55 мм · ISO 7810 ID-1</div>
            </div>

            {/* Editor */}
            <div className="space-y-4">
              <div className="text-sm text-white/50 mb-1">Настройка данных</div>
              {[
                { key: 'name' as const, label: 'Имя и фамилия', icon: <User className="w-4 h-4" />, placeholder: 'Акмаль Рашидов' },
                { key: 'title' as const, label: 'Должность', icon: <Briefcase className="w-4 h-4" />, placeholder: 'Investment Director' },
                { key: 'email' as const, label: 'Email', icon: <Mail className="w-4 h-4" />, placeholder: 'name@vodprom.com' },
                { key: 'phone' as const, label: 'Телефон', icon: <Phone className="w-4 h-4" />, placeholder: '+998 90 123 45 67' },
              ].map(field => (
                <div key={field.key}>
                  <label className="text-xs text-white/40 mb-1 block">{field.label}</label>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <span className="text-white/30">{field.icon}</span>
                    <input
                      type="text"
                      value={prefs[field.key]}
                      onChange={e => updatePref(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="flex-1 bg-transparent text-sm text-white placeholder-white/20 outline-none"
                    />
                  </div>
                </div>
              ))}

              {/* Role presets */}
              <div>
                <div className="text-xs text-white/30 mb-2">Быстрый выбор должности:</div>
                <div className="flex flex-wrap gap-2">
                  {ROLE_PRESETS.map(role => (
                    <button
                      key={role}
                      onClick={() => updatePref('title', role)}
                      className="text-xs px-2.5 py-1 rounded-full transition"
                      style={{
                        background: prefs.title === role ? `${ACCENT}20` : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${prefs.title === role ? ACCENT + '50' : 'rgba(255,255,255,0.1)'}`,
                        color: prefs.title === role ? ACCENT : 'rgba(255,255,255,0.5)',
                      }}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCardDownload}
                disabled={downloading === 'card'}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-60"
                style={{ background: `linear-gradient(135deg, ${ACCENT}, #0080ff)`, color: '#000' }}
              >
                {downloading === 'card'
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Сохранение...</>
                  : <><Download className="w-4 h-4" /> Скачать визитку (PNG)</>}
              </button>
            </div>
          </div>
        )}

        {/* ── Tab 3: Invitations ── */}
        {tab === 'invitations' && (
          <div className="space-y-5">
            {/* Toolbar */}
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg flex-1 min-w-48" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <Search className="w-4 h-4 text-white/30" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Поиск по имени или должности..."
                  className="flex-1 bg-transparent text-sm text-white placeholder-white/25 outline-none"
                />
              </div>
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="text-xs rounded-lg px-3 py-2 outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <option value="all">Все типы</option>
                {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <button
                onClick={handleBulkDownload}
                disabled={bulkGenerating || filteredContacts.length === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition disabled:opacity-50"
                style={{ background: `${ACCENT}15`, color: ACCENT, border: `1px solid ${ACCENT}30` }}
              >
                {bulkGenerating
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Генерация...</>
                  : <><Download className="w-4 h-4" /> Все в PDF ({filteredContacts.length})</>}
              </button>
            </div>

            {/* Contacts grid */}
            {loadingContacts ? (
              <div className="flex items-center justify-center py-20 gap-2 text-white/30">
                <Loader2 className="w-5 h-5 animate-spin" /> Загрузка контактов...
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="text-center py-16 text-white/25">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <div>Контакты не найдены</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredContacts.map(contact => {
                  const typeColor = TYPE_COLORS[contact.stakeholder_type ?? ''] ?? ACCENT;
                  const inviteUrl = `https://vodprom.vercel.app/activate?invite=${contact.id}`;
                  return (
                    <Card key={contact.id} style={{ padding: 0, overflow: 'hidden' }}>
                      {/* Invitation preview — A6-ish */}
                      <div style={{ display: 'flex', height: 142 }}>
                        {/* Left brand */}
                        <div style={{ width: 130, background: 'linear-gradient(135deg,#001530,#000d20)', padding: '12px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
                          <div style={{ fontSize: 12, fontWeight: 900, color: ACCENT, letterSpacing: 1 }}>VODPROM</div>
                          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', lineHeight: 1.4 }}>
                            Приглашаем Вас на встречу с командой
                          </div>
                          <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)' }}>vodprom.vercel.app</div>
                        </div>
                        {/* Right personal */}
                        <div style={{ flex: 1, padding: '12px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <div>
                            <div className="font-semibold text-white" style={{ fontSize: 13, lineHeight: 1.3 }}>{contact.full_name ?? '—'}</div>
                            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>{contact.position}</div>
                            <span style={{ marginTop: 6, display: 'inline-block', fontSize: 9, background: `${typeColor}18`, color: typeColor, border: `1px solid ${typeColor}35`, borderRadius: 3, padding: '1px 5px' }}>
                              {TYPE_LABELS[contact.stakeholder_type ?? ''] ?? contact.stakeholder_type}
                            </span>
                          </div>
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=50x50&data=${encodeURIComponent(inviteUrl)}`}
                            width={40} height={40} alt="invite"
                            style={{ borderRadius: 4 }}
                          />
                        </div>
                      </div>
                      {/* Actions */}
                      <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
                          {contact.country} {contact.region ? `· ${contact.region}` : ''}
                        </div>
                        <button
                          onClick={() => handleInviteDownload(contact)}
                          disabled={downloading === contact.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition disabled:opacity-60"
                          style={{ background: `${ACCENT}12`, color: ACCENT, border: `1px solid ${ACCENT}25` }}
                        >
                          {downloading === contact.id
                            ? <Loader2 className="w-3 h-3 animate-spin" />
                            : <Download className="w-3 h-3" />}
                          PDF
                        </button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Standalone invitation layout for hidden refs (avoids hook-in-loop) ─────

function InvitationInner({ contact }: { contact: Stakeholder }) {
  const typeColor = TYPE_COLORS[contact.stakeholder_type ?? ''] ?? ACCENT;
  const inviteUrl = `https://vodprom.vercel.app/activate?invite=${contact.id}`;
  return (
    <div style={{
      width: 400, height: 283, background: '#0a1628',
      fontFamily: 'sans-serif', display: 'flex', overflow: 'hidden', borderRadius: 10,
    }}>
      <div style={{ width: 180, background: 'linear-gradient(135deg,#001530,#000d20)', padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 16, fontWeight: 900, color: ACCENT, letterSpacing: 2 }}>VODPROM</div>
        <div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>Уважаемый(-ая),</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
            Приглашаем Вас на встречу с командой VODPROM
          </div>
        </div>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)' }}>vodprom.vercel.app · 2026</div>
      </div>
      <div style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeft: '1px solid rgba(255,255,255,0.08)' }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{contact.full_name ?? '—'}</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>{contact.position ?? ''}</div>
          <span style={{ fontSize: 9, background: `${typeColor}22`, color: typeColor, border: `1px solid ${typeColor}44`, borderRadius: 4, padding: '2px 6px' }}>
            {TYPE_LABELS[contact.stakeholder_type ?? ''] ?? contact.stakeholder_type ?? ''}
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=70x70&data=${encodeURIComponent(inviteUrl)}`} width={70} height={70} alt="invite QR" />
          <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)' }}>Персональная ссылка</div>
        </div>
      </div>
    </div>
  );
}
