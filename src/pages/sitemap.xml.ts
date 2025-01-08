import { GetServerSideProps } from 'next'
import { EnumChangefreq, SitemapItem, SitemapStream, streamToPromise } from 'sitemap'
import { Readable } from 'stream'

function generateSiteMap(): Promise<string> {
  const links: SitemapItem[] = [
    {
      url: '/',
      lastmod: new Date().toString(),
      changefreq: EnumChangefreq.WEEKLY,
      priority: 0.7,
      img: [],
      video: [],
      links: [],
    },
    {
      url: '/products/solar-network',
      lastmod: new Date().toString(),
      changefreq: EnumChangefreq.WEEKLY,
      priority: 0.7,
      img: [],
      video: [],
      links: [],
    },
    {
      url: '/posts',
      lastmod: new Date().toString(),
      changefreq: EnumChangefreq.HOURLY,
      priority: 0.8,
      img: [],
      video: [],
      links: [],
    },
    {
      url: '/posts/sitemap.xml',
      lastmod: new Date().toString(),
      changefreq: EnumChangefreq.HOURLY,
      priority: 0.8,
      img: [],
      video: [],
      links: [],
    },
  ]

  const stream = new SitemapStream({ hostname: 'https://solsynth.dev' })

  return streamToPromise(Readable.from(links).pipe(stream)).then((data) => data.toString())
}

export const getServerSideProps: GetServerSideProps = async ({ res, query }) => {
  const sitemap = await generateSiteMap()

  res.setHeader('Content-Type', 'text/xml')
  res.write(sitemap)
  res.end()

  return {
    props: {},
  }
}

export default function PostSiteMap() {
  // getServerSideProps will do the heavy lifting
}
