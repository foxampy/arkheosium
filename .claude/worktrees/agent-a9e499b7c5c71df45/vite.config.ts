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
    // Guarantee a single copy of three + fiber/drei so that class
    // constructors (e.g. THREE.* referenced inside drei helpers) resolve to
    // the same live binding. A duplicated/mis-resolved `three` is what makes
    // a minified constructor become `undefined` ("Os is not a constructor").
    dedupe: ['three', '@react-three/fiber', '@react-three/drei'],
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        // Function-form manualChunks. The object form only matches modules whose
        // id EQUALS the listed package name, so the deep/transitive imports that
        // @react-three/fiber & drei pull in (three/src/**, three-stdlib,
        // three-mesh-bvh, three/examples/jsm/**) leaked into other chunks. Split
        // across chunks + minify then made a THREE class constructor referenced
        // inside a drei/fiber helper resolve to an undefined/non-live binding →
        // "TypeError: <minified> is not a constructor" (dev-clean, prod-only).
        //
        // Fix: DO NOT manually chunk three / @react-three/* at all. `three` is
        // used only by the lazy EarthGlobePage route, so Rollup naturally
        // co-bundles the entire three graph into that single lazy chunk — one
        // live THREE instance, no cross-chunk binding hazard. We only pull out
        // clearly-independent vendor groups below; anything three-related (and
        // its transitive deps) is deliberately left to land with its consumer.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          // Explicitly keep the three family OUT of every named vendor chunk so
          // it stays co-located with the lazy globe route that consumes it.
          if (
            /[\\/]node_modules[\\/](three|three-stdlib|three-mesh-bvh|@react-three[\\/])/.test(id)
          ) {
            return undefined;
          }
          if (
            /[\\/]node_modules[\\/](react|react-dom|scheduler|wouter|zustand|recharts)[\\/]/.test(id)
          ) {
            return 'vendor';
          }
          if (/[\\/]node_modules[\\/]framer-motion[\\/]/.test(id)) return 'motion';
          if (/[\\/]node_modules[\\/]maplibre-gl[\\/]/.test(id)) return 'maps';
          if (/[\\/]node_modules[\\/](graphology|sigma)[\\/]/.test(id)) return 'graph';
          return undefined;
        },
      },
    },
  },
});
