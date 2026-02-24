import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/lifti-v2/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['vite.svg'],
      manifest: {
        name: 'Lifti Trainer',
        short_name: 'Lifti',
        description: 'Gym training tracker with workout plans and session history.',
        theme_color: '#0d1321',
        background_color: '#0d1321',
        display: 'standalone',
        start_url: '/lifti-v2/',
        icons: [
          {
            src: 'vite.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any'
          }
        ]
      }
    })
  ]
});
