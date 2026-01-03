import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Anchor - Your Digital Soul',
        short_name: 'Anchor',
        description: 'A compassionate AI companion that remembers your journey',
        theme_color: '#1e88e5',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/anchor-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/anchor-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.(js|css|woff2)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'anchor-assets',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60,
              },
            },
          },
        ],
      },
    }),
  ],
})
