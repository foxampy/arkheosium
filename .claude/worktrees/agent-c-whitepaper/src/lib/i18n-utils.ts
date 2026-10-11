// src/lib/i18n-utils.ts
// Utility to pick the correct localized field from a DB record
// based on the current i18next language.

import i18n from '@/i18n';

/**
 * Returns the best available localized value for a field.
 *
 * Priority for 'ru': name_ru → name → name_en
 * Priority for 'en': name_en → name → name_ru
 * All other languages fall back to 'ru' first, then 'en'
 *
 * Usage:
 *   localizedField(obj, 'name')     // picks name_ru or name_en
 *   localizedField(obj, 'description')
 */
export function localizedField<T extends Record<string, unknown>>(
  obj: T,
  field: string,
  lang?: string,
): string {
  const language = lang ?? i18n.language ?? 'ru';
  const base = String(obj[field] ?? '');

  if (language === 'en') {
    const en = obj[`${field}_en`];
    if (en && String(en).trim()) return String(en);
    return base || String(obj[`${field}_ru`] ?? '');
  }

  if (language === 'ru' || language === 'kk' || language === 'uz') {
    const ru = obj[`${field}_ru`];
    if (ru && String(ru).trim()) return String(ru);
    return base || String(obj[`${field}_en`] ?? '');
  }

  // Arabic and others: prefer English
  if (language === 'ar') {
    const en = obj[`${field}_en`];
    if (en && String(en).trim()) return String(en);
    const ru = obj[`${field}_ru`];
    if (ru && String(ru).trim()) return String(ru);
    return base;
  }

  return base;
}

/**
 * React hook version — re-runs whenever language changes.
 * Use when you need a reactive localizedField inside a component.
 */
export function useLocalizedField() {
  // We import useTranslation lazily to avoid circular deps
  // The simplest approach: just call localizedField(obj, field) directly —
  // components that already call useTranslation() will re-render on lang change,
  // which causes localizedField() to pick the new value automatically.
  return localizedField;
}
