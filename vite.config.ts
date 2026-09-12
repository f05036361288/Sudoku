import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // Relative paths so GitHub Pages project sites work without a custom domain
  base: './',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.svg',
        'apple-touch-icon.png',
        'pwa-192.png',
        'pwa-512.png',
      ],
      manifest: {
        name: 'Sudoku',
        short_name: 'Sudoku',
        description: 'Play Sudoku with notes, hints, and multiple difficulty levels.',
        theme_color: '#1a5f6e',
        background_color: '#eaf3f1',
        display: 'standalone',
        orientation: 'portrait',
        start_url: './',
        scope: './',
        lang: 'en',
        icons: [
          {
            src: 'pwa-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
})
