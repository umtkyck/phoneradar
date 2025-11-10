import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'PhoneRadar - FLIR One BLE Radar',
    short_name: 'PhoneRadar',
    description: 'Telefona takılan BLE radar cihazı - FLIR One benzeri termal ve radar görüntüleme',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#6366f1',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon-192',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-192',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['utilities', 'productivity', 'tools'],
    shortcuts: [
      {
        name: 'Cihaza Bağlan',
        short_name: 'Bağlan',
        description: 'BLE radar cihazına hızlı bağlan',
        url: '/',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }],
      },
    ],
  }
}
