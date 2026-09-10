import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// ВАЖЛИВО: якщо деплоїш на GitHub Pages у репозиторій, що НЕ є username.github.io,
// заміни base на '/назва-репозиторію/'. Якщо репозиторій називається username.github.io — залиш '/'.
export default defineConfig({
  base: '/nail-studio/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png'],
      manifest: {
        name: 'Студія — записи та фінанси',
        short_name: 'Студія',
        description: 'Записи клієнтів, послуги та облік доходів/витрат манікюрної студії',
        theme_color: '#7A2E3C',
        background_color: '#F3ECE7',
        display: 'standalone',
        start_url: '/nail-studio/',
        scope: '/nail-studio/',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin.includes('firestore.googleapis.com'),
            handler: 'NetworkFirst',
            options: { cacheName: 'firestore-cache', networkTimeoutSeconds: 3 },
          },
        ],
      },
    }),
  ],
})
