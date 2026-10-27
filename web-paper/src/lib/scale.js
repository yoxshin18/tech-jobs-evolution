// Passi "puliti" (× 10^k) tra cui scegliere l'intervallo fra i tick.
const STEPS = [1, 2, 2.5, 3, 5, 10];

function niceStep(raw) {
  const mag = 10 ** Math.floor(Math.log10(raw));
  return STEPS.find((s) => s * mag >= raw - 1e-9) * mag;
}

/**
 * Dominio e tick di un asse numerico calcolati dai dati: estensione dei valori
 * più un margine (`pad`, quota dell'estensione per lato), estesa ai valori in
 * `include` (es. 0 per le barre, 100 per un indice), poi arrotondata a multipli
 * di un passo pulito scelto per avere circa `count` intervalli.
 */
export function niceAxis(values, { count = 5, pad = 0.05, include = [] } = {}) {
  const v = values.filter(Number.isFinite);
  const min = Math.min(...v);
  const max = Math.max(...v);
  const margin = (max - min) * pad;
  const lo0 = Math.min(min - margin, ...include);
  const hi0 = Math.max(max + margin, ...include);
  const step = niceStep((hi0 - lo0) / count || 1);
  const lo = Math.floor(lo0 / step) * step;
  const hi = Math.ceil(hi0 / step) * step;
  const ticks = [];
  for (let t = lo; t <= hi + step / 2; t += step) ticks.push(Number(t.toFixed(10)));
  return { domain: [lo, hi], ticks };
}
