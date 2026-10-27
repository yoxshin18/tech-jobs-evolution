import { useTranslation } from 'react-i18next';

/** Accesso tipizzato ai blocchi del paper con fallback sicuri. */
export function useLocaleData() {
  const { t, i18n } = useTranslation();
  const get = (key, fallback) => {
    const value = t(key, { returnObjects: true });
    return value === key || value == null ? fallback : value;
  };
  return { t, i18n, locale: i18n.language, get };
}
