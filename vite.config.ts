import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', manifest: {
        name: 'Woowon Vehicle Log',
        short_name: 'TW Car',
        description: 'Woowon Vehicle Log',
        theme_color: '#085cac',
        icons: [
          {
            src: 'logo_192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logo_512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  base: './'
})
