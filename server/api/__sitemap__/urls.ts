import { defineSitemapEventHandler } from '#imports'

export default defineSitemapEventHandler(async (event) => {
  const urls: Array<{ loc: string; changefreq: string; priority: number; lastmod?: string }> = []

  const locales = ['en', 'zh']
  const staticPages = [
    { path: '/', priority: 1.0, changefreq: 'daily' },
    { path: '/about', priority: 0.8, changefreq: 'monthly' },
    { path: '/products', priority: 0.9, changefreq: 'weekly' },
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

  // Add dynamic product pages
  try {
    const products = await queryCollection(event, 'products')
      .where('hasPage', '=', true)
      .select(['path', 'title'])
      .all()

    for (const product of products) {
      for (const locale of locales) {
        if (product.path.includes(`/${locale}/`)) {
          urls.push({
            loc: product.path,
            changefreq: 'weekly',
            priority: 0.9,
          })
        }
      }
    }
  } catch (error) {
    console.error('Error fetching products for sitemap:', error)
  }

  // Add dynamic legal pages
  try {
    const legalPages = await queryCollection(event, 'legal')
      .select(['path', 'updatedDate'])
      .all()

    for (const legal of legalPages) {
      for (const locale of locales) {
        if (legal.path.includes(`/${locale}/`)) {
          urls.push({
            loc: legal.path,
            changefreq: 'monthly',
            priority: 0.6,
            lastmod: legal.updatedDate,
          })
        }
      }
    }
  } catch (error) {
    console.error('Error fetching legal pages for sitemap:', error)
  }

  // Add dynamic event pages
  try {
    const events = await queryCollection(event, 'events')
      .select(['path', 'startDate', 'endDate', 'status'])
      .all()

    for (const event of events) {
      for (const locale of locales) {
        if (event.path.includes(`/${locale}/`)) {
          urls.push({
            loc: event.path,
            changefreq: event.status === 'upcoming' ? 'daily' : 'monthly',
            priority: event.status === 'upcoming' ? 0.9 : 0.7,
            lastmod: event.endDate,
          })
        }
      }
    }
  } catch (error) {
    console.error('Error fetching events for sitemap:', error)
  }

  return urls
})
