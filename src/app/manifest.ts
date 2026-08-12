import type { MetadataRoute } from 'next'

const manifest = (): MetadataRoute.Manifest => {
  return {
    name: 'Kortao',
    short_name: 'Kortao',
    description: 'Reservas simples para barberías y salones',
    start_url: '/panel',
    scope: '/panel',
    display: 'standalone',
    background_color: '#FBF8F3',
    theme_color: '#1F4B3F',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      }
    ]
  }
}

export default manifest
