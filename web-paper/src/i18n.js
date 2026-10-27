import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import it from './locales/it.json';
import en from './locales/en.json';
import fr from './locales/fr.json';
import es from './locales/es.json';
import de from './locales/de.json';

/**
 * Registro delle lingue. Per aggiungerne una:
 *   1. crea src/locales/<codice>.json con la stessa forma di it.json
 *   2. importalo qui e aggiungilo a `resources` e `LANGUAGES`
 * Le chiavi mancanti ricadono sull'italiano (fallbackLng).
 */
export const LANGUAGES = [
  { code: 'it', label: 'IT', complete: true },
  { code: 'en', label: 'EN', complete: true },
  { code: 'fr', label: 'FR', complete: true },
  { code: 'es', label: 'ES', complete: true },
  { code: 'de', label: 'DE', complete: true },
];

const STORAGE_KEY = 'tje.lang';

const isSupported = (code) => LANGUAGES.some((l) => l.code === code);

// Priorità: ?lang= nell'URL > scelta salvata > italiano.
function initialLanguage() {
  const fromUrl = new URLSearchParams(window.location.search).get('lang');
  if (isSupported(fromUrl)) return fromUrl;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isSupported(stored)) return stored;
  } catch {
    /* storage non disponibile: si usa il default */
  }
  return 'it';
}

i18n.use(initReactI18next).init({
  resources: {
    it: { translation: it },
    en: { translation: en },
    fr: { translation: fr },
    es: { translation: es },
    de: { translation: de },
  },
  lng: initialLanguage(),
  fallbackLng: 'it',
  returnObjects: true,
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
  try {
    window.localStorage.setItem(STORAGE_KEY, lng);
  } catch {
    /* ignora */
  }
});
document.documentElement.lang = i18n.language;

export default i18n;
