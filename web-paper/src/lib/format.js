const cache = new Map();

function nf(locale, options) {
  const key = `${locale}|${JSON.stringify(options)}`;
  if (!cache.has(key)) cache.set(key, new Intl.NumberFormat(locale, options));
  return cache.get(key);
}

export const fmtNumber = (value, locale, digits = 0) =>
  value == null ? '—' : nf(locale, { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(value);

const USD = { style: 'currency', currency: 'USD', currencyDisplay: 'narrowSymbol' };

export const fmtUsd = (value, locale) =>
  value == null ? '—' : nf(locale, { ...USD, maximumFractionDigits: 0 }).format(value);

/** 135980 -> "$136k" / "136k $" (compatto, per card e assi): la "k" segue la cifra. */
export const fmtUsdK = (value, locale) => {
  if (value == null) return '—';
  const parts = nf(locale, { ...USD, minimumFractionDigits: 0, maximumFractionDigits: 1 }).formatToParts(value / 1000);
  const last = parts.reduce((acc, p, i) => (p.type === 'integer' || p.type === 'fraction' ? i : acc), -1);
  return parts.map((p, i) => (i === last ? `${p.value}k` : p.value)).join('');
};

export const fmtPct = (value, locale, digits = 0, signed = false) =>
  value == null
    ? '—'
    : nf(locale, {
        style: 'percent',
        maximumFractionDigits: digits,
        minimumFractionDigits: digits,
        signDisplay: signed ? 'exceptZero' : 'auto',
      }).format(value / 100);

export const fmtCompact = (value, locale) =>
  value == null ? '—' : nf(locale, { notation: 'compact', maximumFractionDigits: 1 }).format(value);
