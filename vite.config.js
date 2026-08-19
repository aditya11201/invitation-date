import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Ensures relative assets work on GitHub Pages, Netlify, or local previews
  server: {
    port: 3000,
    open: false,
  },
  build: {
    target: 'esnext',
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          pdf: ['jspdf', 'html2canvas'],
          icons: ['lucide-react'],
        }
      }
    }
  }
});
