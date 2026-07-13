/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Zorro Aventurero — Sumas y Restas',
        short_name: 'Zorro',
        description:
          'Juego educativo para aprender sumas y restas con acarreo.',
        lang: 'es',
        theme_color: '#e58a6b',
        background_color: '#f3ece0',
        display: 'standalone',
        orientation: 'portrait',
        // F0: icono SVG (escalable). En una fase de pulido se añaden PNG 192/512 y maskable.
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
      },
    }),
  ],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    setupFiles: ['./src/test/setup.ts'],
  },
});
