import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react(), VitePWA({
    registerType: 'autoUpdate',
    injectRegister: false,

    pwaAssets: {
      disabled: false,
      config: true,
    },

    manifest: {
      name: 'PrintSuit',
      short_name: 'PrintSuit',
      description: 'Remote printing solutions',
      theme_color: '#ffffff',
    },

    workbox: {
      globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
      cleanupOutdatedCaches: true,
      clientsClaim: true,
      maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // ← this line
    },

    devOptions: {
      enabled: false,
      navigateFallback: 'index.html',
      suppressWarnings: true,
      type: 'module',
    },
  })],

  server: {
    mimeTypes: {
      'text/javascript': ['js'],
    },
  },

  optimizeDeps: {
    include: ['pdfjs-dist', 'react-hot-toast'],
  },

  build: {
    outDir: 'dist',
    commonjsOptions: {
      include: [/node_modules/, /pdfjs-dist/],
    },
  },
});
