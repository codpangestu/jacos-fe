import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // FR-FE-5.2 — app shell caching minimal supaya push notification tetap
      // bisa diterima meski tab/browser tertutup; MVP tidak butuh offline data-entry.
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        navigateFallbackDenylist: [/^\/api\//, /^\/sanctum\//, /^\/storage\//],
      },
      manifest: {
        name: 'JACOS — Jakarta Cosmopolite Islamic School',
        short_name: 'JACOS',
        description: 'Sistem manajemen sekolah JACOS — absensi, jemput anak, HR, dan keuangan.',
        theme_color: '#0C2B4C',
        background_color: '#f7f9fc',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
    }),
  ],
})
