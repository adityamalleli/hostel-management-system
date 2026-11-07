import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // new deployments reach installed apps automatically
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Hostel Manager',
        short_name: 'Hostel',
        description: 'Hostel management: attendance, complaints, rooms and mess menu.',
        theme_color: '#0f2540',
        background_color: '#0f2540',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,png,svg}'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        // API calls go to a different origin and are never cached, so data is always live
      },
    }),
  ],
  server: { port: 5173 },
});
