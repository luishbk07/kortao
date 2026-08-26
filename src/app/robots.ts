import type { MetadataRoute } from 'next'
import { obtenerOrigenSitio } from '@/shared/utils/sitio'

const robots = (): MetadataRoute.Robots => {
  const origen = obtenerOrigenSitio()

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/panel', '/admin', '/login', '/registro', '/reservar']
    },
    sitemap: `${origen}/sitemap.xml`,
    host: origen
  }
}

export default robots
