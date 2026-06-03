import { defineSitemapEventHandler } from '#imports'

export default defineSitemapEventHandler(async () => {
  const urls: Array<{ loc: string; changefreq: string; priority: number }> = []

  const locales = ['en', 'zh']
  const staticPages = [
    { path: '/', priority: 1.0, changefreq: 'daily' },
    { path: '/about', priority: 0.8, changefreq: 'monthly' },
    { path: '/products', priority: 0.9, changefreq: 'weekly' },
    { path: '/products/solar-network', priority: 0.9, changefreq: 'weekly' },
    { path: '/updates', priority: 0.8, changefreq: 'daily' },
    { path: '/events', priority: 0.8, changefreq: 'weekly' },
    { path: '/legal', priority: 0.6, changefreq: 'monthly' },
    { path: '/icp', priority: 0.7, changefreq: 'weekly' },
  ]

  for (const locale of locales) {
    for (const page of staticPages) {
      urls.push({
        loc: `/${locale}${page.path}`,
        changefreq: page.changefreq,
        priority: page.priority,
      })
    }
  }

  return urls
})
