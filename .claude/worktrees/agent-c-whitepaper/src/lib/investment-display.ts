// ═══════════════════════════════════════════════════════════════
//  Investment Display Utilities — Client-side formatting helpers
//  No server calls — pure transform functions
// ═══════════════════════════════════════════════════════════════

import type { YearlyProjection } from '@/types/object-full';

// ─── Currency Formatting ──────────────────────────────────────

/**
 * Format a USD amount as a short human-readable string.
 * $1.2B, $450M, $12.3K, $850
 */
export function fmtUSD(amount: number): string {
  if (amount === 0) return '$0';
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (abs >= 1_000_000_000) {
    return `${sign}$${(abs / 1_000_000_000).toFixed(1)}B`;
  }
  if (abs >= 1_000_000) {
    return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  }
  if (abs >= 1_000) {
    return `${sign}$${(abs / 1_000).toFixed(1)}K`;
  }
  return `${sign}$${Math.round(abs)}`;
}

// ─── IRR Color ────────────────────────────────────────────────

/**
 * Returns a Tailwind color class name based on IRR value.
 * red < 8%, amber < 12%, green >= 12%
 */
export function getIRRColor(irr: number): string {
  if (irr < 8) return 'text-red-500';
  if (irr < 12) return 'text-amber-500';
  return 'text-green-500';
}

// ─── Payback Visualization ────────────────────────────────────

/**
 * Returns progress as 0–100% where 0 = full horizon (worst) and 100 = payback year 0 (best).
 * Used for progress bars / gauges.
 */
export function paybackProgress(payback_years: number, horizon: number): number {
  if (horizon <= 0) return 0;
  // Payback at 0 → 100%, at horizon → 0%
  const progress = Math.max(0, 1 - payback_years / horizon) * 100;
  return Math.round(progress);
}

// ─── Chart Data ───────────────────────────────────────────────

export interface ProjectionChartPoint {
  year: number;
  revenue: number;
  opex: number;
  netProfit: number;
  capacityUtil: number;
  label: string;
}

/**
 * Transform yearly projections into chart-ready data.
 * All monetary values are in USD (divide by 1M for display if needed).
 */
export function projectionsToChartData(projections: YearlyProjection[]): ProjectionChartPoint[] {
  return projections.map((p) => ({
    year: p.year,
    revenue: p.revenue_usd,
    opex: p.opex_usd,
    netProfit: p.net_profit_usd,
    capacityUtil: p.capacity_util_pct,
    label: String(p.year),
  }));
}

// ─── Status Badge ─────────────────────────────────────────────

export interface StatusBadge {
  text: string;
  color: string; // Tailwind class
  bgColor: string;
}

/**
 * Returns badge display info for a project status.
 */
export function getStatusBadge(
  status: 'viable' | 'marginal' | 'high_risk'
): StatusBadge {
  switch (status) {
    case 'viable':
      return {
        text: 'Привлекателен',
        color: 'text-green-700',
        bgColor: 'bg-green-100',
      };
    case 'marginal':
      return {
        text: 'Умеренный риск',
        color: 'text-amber-700',
        bgColor: 'bg-amber-100',
      };
    case 'high_risk':
      return {
        text: 'Высокий риск',
        color: 'text-red-700',
        bgColor: 'bg-red-100',
      };
  }
}

// ─── Capacity Formatting ──────────────────────────────────────

/**
 * Format capacity in m³/day with human-readable suffix.
 * "850K м³/сут", "1.2M м³/сут", "45K м³/сут"
 */
export function fmtCapacity(m3_per_day: number): string {
  if (m3_per_day === 0) return '0 м³/сут';
  if (m3_per_day >= 1_000_000) {
    return `${(m3_per_day / 1_000_000).toFixed(1)}M м³/сут`;
  }
  if (m3_per_day >= 1_000) {
    return `${(m3_per_day / 1_000).toFixed(0)}K м³/сут`;
  }
  return `${Math.round(m3_per_day)} м³/сут`;
}

// ─── Wear Color ───────────────────────────────────────────────

/**
 * Returns a Tailwind color class for wear percentage.
 * green < 30, amber < 55, orange < 75, red >= 75
 */
export function wearColor(pct: number): string {
  if (pct < 30) return 'text-green-500';
  if (pct < 55) return 'text-amber-500';
  if (pct < 75) return 'text-orange-500';
  return 'text-red-600';
}

// ─── Additional helpers ───────────────────────────────────────

/**
 * Format a percentage with a sign and fixed decimals.
 * e.g., formatPct(12.3) → "12.3%"
 */
export function formatPct(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format a large number of people in a compact form.
 * "1.2M чел.", "450K чел.", "12 тыс. чел."
 */
export function fmtPeople(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M чел.`;
  if (count >= 1_000) return `${Math.round(count / 1_000)}K чел.`;
  return `${count} чел.`;
}

/**
 * Format CO2 reduction in kg/year to more readable units.
 */
export function fmtCO2(kgPerYear: number): string {
  if (kgPerYear >= 1_000_000) {
    return `${(kgPerYear / 1_000_000).toFixed(1)} тыс. т CO₂/год`;
  }
  if (kgPerYear >= 1_000) {
    return `${(kgPerYear / 1_000).toFixed(0)} т CO₂/год`;
  }
  return `${Math.round(kgPerYear)} кг CO₂/год`;
}
