import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import solid from 'vite-plugin-solid'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    solid(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['flex.svg'],
      manifest: {
        name: 'One Rep Max Calculator',
        short_name: 'DipCalc',
        start_url: "/",
        display: "standalone",
        description: 'Calculate your one-rep max for weighted dips',
        theme_color: '#ffffff',
        icons: [
          {
            "src": "pwa-64x64.png",
            "sizes": "64x64",
            "type": "image/png"
          },
          {
            "src": "pwa-192x192.png",
            "sizes": "192x192",
            "type": "image/png"
          },
          {
            "src": "pwa-512x512.png",
            "sizes": "512x512",
            "type": "image/png"
          },
          {
            "src": "maskable-icon-512x512.png",
            "sizes": "512x512",
            "type": "image/png",
            "purpose": "maskable"
          }
        ],
        screenshots: [
          {
            "src": "screenshot-desktop.png",
            "sizes": "1920x1080",
            "type": "image/png",
            "form_factor": "wide"
          },
          {
            "src": "screenshot-mobile.png",
            "sizes": "432x934",
            "type": "image/png"
          }
        ],
      },
    })
  ],
})
