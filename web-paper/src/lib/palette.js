// Colori dei grafici, coerenti con tailwind.config.js.
export const C = {
  cyan: '#38BDF8',
  indigo: '#818CF8',
  emerald: '#34D399',
  amber: '#FBBF24',
  fg: '#F8FAFC',
  muted: '#94A3B8',
  faint: '#64748B',
  line: '#1E293B',
  lineStrong: '#2A3A55',
  surface: '#131B2E',
  ink: '#0A0F1D',
  negative: '#F87171',
};

export const ROLE_COLORS = {
  swe: C.cyan,
  frontend: '#7DD3FC',
  backend: '#0EA5E9',
  ai_ml: C.indigo,
  data_scientist: C.emerald,
  data_engineer: C.amber,
  mlops_cloud: C.fg,
};

export const OCCUPATION_COLORS = {
  data_scientists: C.emerald,
  research_scientists: C.indigo,
  infosec_analysts: C.amber,
  software_developers: C.cyan,
  database_architects: '#A5B4FC',
  network_architects: '#7DD3FC',
  web_developers: C.muted,
  computer_programmers: C.negative,
};

export const FIGURE_SOURCES = {
  exposure: [3],
  employment: [7, 8],
  adoption: [1, 2, 3, 9, 10, 11],
  wef: [6],
  radar: [2, 3, 6, 7],
  salary: [2, 7],
  gartner: [11, 12, 13, 14, 16, 17],
};
