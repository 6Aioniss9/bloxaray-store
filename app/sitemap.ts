import { fruits } from '@/lib/fruits'
import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://bloxaray.com'

  const staticPages = [
    { url: baseUrl, priority: 1.0 },
    { url: `${baseUrl}/stock`, priority: 0.9 },
    { url: `${baseUrl}/faq`, priority: 0.7 },
    { url: `${baseUrl}/resenas`, priority: 0.7 },
    { url: `${baseUrl}/pagos`, priority: 0.6 },
    { url: `${baseUrl}/privacidad`, priority: 0.5 },
    { url: `${baseUrl}/terminos`, priority: 0.5 },
  ]

  const fruitPages = fruits.map((f) => ({
    url: `${baseUrl}/fruta/${f.id}`,
    priority: f.featured ? 0.9 : 0.8,
  }))

  return [...staticPages, ...fruitPages]
}
