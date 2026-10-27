/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Dark Deep Blue: niente nero puro, solo blu notte / ardesia.
        ink: {
          950: '#0A0F1D', // background principale
          900: '#0B132B', // fasce alternate
          850: '#0F1729',
        },
        surface: {
          DEFAULT: '#131B2E', // card e contenitori
          raised: '#17213A',
          sunken: '#0E1526',
        },
        line: {
          DEFAULT: '#1E293B', // bordi sottili e griglia strutturale
          strong: '#2A3A55',
        },
        fg: {
          DEFAULT: '#F8FAFC', // testo primario
          muted: '#94A3B8', // didascalie
          faint: '#64748B',
        },
        accent: {
          cyan: '#38BDF8',
          indigo: '#818CF8',
          emerald: '#34D399',
          amber: '#FBBF24',
        },
      },
      fontFamily: {
        display: ['"Tiny5"', '"JetBrains Mono"', 'ui-monospace', 'monospace'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['"Source Serif 4"', 'ui-serif', 'Georgia', 'serif'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.02em' }],
        mega: ['clamp(3.25rem, 11.5vw, 10.5rem)', { lineHeight: '0.86', letterSpacing: '-0.01em' }],
      },
      maxWidth: {
        prose: '42rem',
        page: '84rem',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(56,189,248,0.25), 0 8px 40px -12px rgba(56,189,248,0.35)',
        card: '0 1px 0 0 rgba(248,250,252,0.03) inset, 0 20px 40px -24px rgba(2,6,23,0.8)',
      },
      backgroundImage: {
        'grid-fade': 'radial-gradient(ellipse at top, rgba(56,189,248,0.08), transparent 60%)',
      },
      keyframes: {
        blink: { '0%, 49%': { opacity: '1' }, '50%, 100%': { opacity: '0' } },
      },
      animation: {
        blink: 'blink 1.1s steps(1) infinite',
      },
    },
  },
  plugins: [],
};
