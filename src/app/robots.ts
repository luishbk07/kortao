import type { MetadataRoute } from 'next'
import { obtenerOrigenSitio } from '@/shared/utils/sitio'

const robots = (): MetadataRoute.Robots => {
  const origen = obtenerOrigenSitio()

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Do NOT disallow /login or /registro: Google must be able to crawl
      // them to see robots noindex and drop the old form-label snippets.
      disallow: ['/panel/', '/admin/']
    },
    sitemap: `${origen}/sitemap.xml`,
    host: origen
  }
}

export default robots
