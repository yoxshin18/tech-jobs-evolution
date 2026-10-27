import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Senza VITE_BASE la base è "/" (dev, build e preview locali). Su GitHub Pages
// il sito sta sotto /<nome-repo>/: il workflow imposta VITE_BASE di conseguenza.
const base = process.env.VITE_BASE ?? '/';

export default defineConfig({
  base,
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          charts: ['recharts'],
          motion: ['framer-motion'],
          i18n: ['i18next', 'react-i18next'],
        },
      },
    },
  },
  server: { port: 5173, open: false },
});
