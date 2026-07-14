import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import ru from './locales/ru.json';
import en from './locales/en.json';
import uz from './locales/uz.json';
import kk from './locales/kk.json';
import ar from './locales/ar.json';

export const SUPPORTED_LANGUAGES = [
  { code: 'ru', label: 'Русский', flag: '🇷🇺', dir: 'ltr' as const },
  { code: 'en', label: 'English', flag: '🇬🇧', dir: 'ltr' as const },
  { code: 'uz', label: "O'zbek", flag: '🇺🇿', dir: 'ltr' as const },
  { code: 'kk', label: 'Қазақша', flag: '🇰🇿', dir: 'ltr' as const },
  { code: 'ar', label: 'العربية', flag: '🇸🇦', dir: 'rtl' as const },
];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ru: { translation: ru },
      en: { translation: en },
      uz: { translation: uz },
      kk: { translation: kk },
      ar: { translation: ar },
    },
    fallbackLng: 'ru',
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'vodprom-language',
    },
    interpolation: { escapeValue: false },
  });

export default i18n;
