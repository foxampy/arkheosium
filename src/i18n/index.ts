import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import ru from './locales/ru.json';
import ar from './locales/ar.json';
import uz from './locales/uz.json';
import kk from './locales/kk.json';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English',   flag: '🇬🇧', dir: 'ltr' as const },
  { code: 'ru', label: 'Русский',   flag: '🇷🇺', dir: 'ltr' as const },
  { code: 'zh', label: '中文',       flag: '🇨🇳', dir: 'ltr' as const },
  { code: 'de', label: 'Deutsch',   flag: '🇩🇪', dir: 'ltr' as const },
  { code: 'ja', label: '日本語',     flag: '🇯🇵', dir: 'ltr' as const },
  { code: 'he', label: 'עברית',      flag: '🇮🇱', dir: 'rtl' as const },
  { code: 'ar', label: 'العربية',    flag: '🇸🇦', dir: 'rtl' as const },
  { code: 'fr', label: 'Français',  flag: '🇫🇷', dir: 'ltr' as const },
  { code: 'it', label: 'Italiano',  flag: '🇮🇹', dir: 'ltr' as const },
  { code: 'es', label: 'Español',   flag: '🇪🇸', dir: 'ltr' as const },
  { code: 'pl', label: 'Polski',    flag: '🇵🇱', dir: 'ltr' as const },
  { code: 'uz', label: "O'zbek",    flag: '🇺🇿', dir: 'ltr' as const },
  { code: 'kk', label: 'Қазақша',   flag: '🇰🇿', dir: 'ltr' as const },
];

export const LANGUAGE_STORAGE_KEY = 'vodprom-language';

export function dirFor(code: string): 'ltr' | 'rtl' {
  return SUPPORTED_LANGUAGES.find((l) => l.code === code)?.dir ?? 'ltr';
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // zh/de/ja/he/fr/it/es/pl are offered in the picker but have no locale file
    // yet — they resolve through fallbackLng until the translations land.
    resources: {
      en: { translation: en },
      ru: { translation: ru },
      ar: { translation: ar },
      uz: { translation: uz },
      kk: { translation: kk },
    },
    fallbackLng: 'en',
    supportedLngs: SUPPORTED_LANGUAGES.map((l) => l.code),
    // `navigator.language` gives regional tags (en-GB, zh-CN, pt-BR).
    // Strip the region so detection lands on a locale we actually ship.
    load: 'languageOnly',
    nonExplicitSupportedLngs: true,
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
    },
    // Locale files are flat: keys literally contain dots ("nav.map").
    // i18next resolves those directly, but nested lookup must stay on so
    // fallback traversal keeps working.
    interpolation: { escapeValue: false },
    returnEmptyString: false,
  });

// Text direction + `lang` must follow the active language on boot as well as on
// every switch — `lang` drives hyphenation, CJK font selection and screen readers.
const applyDocumentLang = (lng?: string) => {
  if (typeof document === 'undefined') return;
  const code = (lng || i18n.resolvedLanguage || i18n.language || 'en').split('-')[0];
  document.documentElement.dir = dirFor(code);
  document.documentElement.lang = code;
};
applyDocumentLang();
i18n.on('languageChanged', applyDocumentLang);

export default i18n;
