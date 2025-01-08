import { sni } from '@/services/network'
import { SnPost } from '@/services/post'
import { GetServerSideProps } from 'next'
import { Feed } from 'feed'

function generateFeed(posts: SnPost[]): string {
  const feed = new Feed({
    title: 'Solar Network Posts',
    description: 'All posts on the Solar Network platform, and now you can view them via the RSS feed!',
    id: 'https://solsynth.dev/posts',
    link: 'https://solsynth.dev/posts',
    favicon: 'https://solsynth.dev/favicon.png',
    copyright: `All rights reserved ${new Date().getFullYear()} © Solsynth LLC & Post Publishers`,
    updated: new Date(posts[0].createdAt),
    generator: 'Capital',
    feedLinks: {},
  })

  for (const p of posts) {
    feed.addItem({
      id: p.id.toString(),
      title: p.body.title ?? `Post #${p.id}`,
      description: p.body.description,
      link:
        p.alias && p.aliasPrefix
          ? `https://solsynth.dev/posts/${p.aliasPrefix}/${p.alias}`
          : `https://solsynth.dev/posts/${p.id}`,
      content: p.body.content,
      date: new Date(p.publishedAt ?? p.createdAt),
      published: new Date(p.publishedAt ?? p.createdAt),
      copyright: `All right reserved ${new Date().getFullYear()} © @${p.publisher.name}`,
      author: [
        {
          name: `@${p.publisher.name}`,
        },
      ],
    })
  }

  return feed.rss2()
}

export const getServerSideProps: GetServerSideProps = async ({ res, query }) => {
  let page: number = parseInt(query.page as string)
  if (isNaN(page)) page = 1

  const countPerPage = 20

  const { data: resp } = await sni.get<{ data: SnPost[] }>('/cgi/co/posts', {
    params: {
      take: countPerPage,
      offset: (page - 1) * countPerPage,
    },
  })

  const sitemap = generateFeed(resp.data)

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
