import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.png', 'favicon.svg'],
      manifest: {
        name: 'ARKHEOSIUM — Planetary Infrastructure OS',
        short_name: 'ARKHEOSIUM',
        description: 'Глобальная цифровая операционная система управления ресурсами, инфраструктурой и развитием цивилизации.',
        theme_color: '#050d1a',
        background_color: '#050d1a',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/logo.png', sizes: '192x192', type: 'image/png' },
          { src: '/logo.png', sizes: '512x512', type: 'image/png' },
          { src: '/logo.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.maptiler\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'maptiler-cache', expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 7 } },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Keep React in one place — @react-three/fiber & @react-three/drei
          // must resolve the same React instance, so don't put them in a
          // separate chunk from 'react'/'react-dom'.
          vendor:  ['react', 'react-dom', 'wouter', 'zustand', 'recharts'],
          motion:  ['framer-motion'],
          maps:    ['maplibre-gl'],
          // three (base only) — fiber/drei are co-bundled with EarthGlobePage
          // by Rollup's lazy-chunk splitting, keeping one React per page.
          three:   ['three'],
          graph:   ['graphology', 'sigma'],
        },
      },
    },
  },
});
