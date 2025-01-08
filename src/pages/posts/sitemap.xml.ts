import { sni } from '@/services/network'
import { SnPost } from '@/services/post'
import { GetServerSideProps } from 'next'
import { EnumChangefreq, SitemapItem, SitemapStream, streamToPromise } from 'sitemap'
import { Readable } from 'stream'

function generateSiteMap(posts: SnPost[]): Promise<string> {
  const links: SitemapItem[] = posts.map((p) => ({
    url: p.alias && p.aliasPrefix ? `/posts/${p.aliasPrefix}/${p.alias}` : `/posts/${p.id}`,
    lastmod: (p.editedAt ?? p.publishedAt ?? p.editedAt)?.toString(),
    changefreq: EnumChangefreq.DAILY,
    priority: 0.9,
    img: [],
    video: [],
    links: [],
  }))

  const stream = new SitemapStream({ hostname: 'https://solsynth.dev' })

  return streamToPromise(Readable.from(links).pipe(stream)).then((data) => data.toString())
}

export const getServerSideProps: GetServerSideProps = async ({ res, query }) => {
  let page: number = parseInt(query.page as string)
  if (isNaN(page)) page = 1

  const countPerPage = 500

  const { data: resp } = await sni.get<{ data: SnPost[] }>('/cgi/co/posts/minimal', {
    params: {
      take: countPerPage,
      offset: (page - 1) * countPerPage,
    },
  })

  const sitemap = await generateSiteMap(resp.data)

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
