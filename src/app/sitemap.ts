import type { MetadataRoute } from 'next'
import { obtenerOrigenSitio } from '@/shared/utils/sitio'

const sitemap = (): MetadataRoute.Sitemap => {
  const origen = obtenerOrigenSitio()

  return [
    {
      url: origen,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1
    }
  ]
}

export default sitemap
