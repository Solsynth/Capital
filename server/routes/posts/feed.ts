import { Feed } from "feed"
import { unified } from "unified"
import rehypeSanitize from "rehype-sanitize"
import rehypeStringify from "rehype-stringify"
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const feed = new Feed({
    title: "Solar Network",
    description: "Content all over solar network",
    id: "https://solsynth.dev",
    copyright: "All rights reserved © 2024 Solsynth LLC",
    generator: "Solar Network Post Web Preview",
    feedLinks: {
      atom: "https://solsynth.dev/posts/feed",
    },
  })

  const queries = getQuery<{
    take?: number,
    offset?: number,
    type?: "atom" | "json" | "rss",
    realmId?: number,
    author?: string,
  }>(event)

  const searchQuery = new URLSearchParams({
    "take": (queries.take ?? 50).toString(),
    "offset": (queries.offset ?? 0).toString(),
  })

  if (queries.realmId) {
    searchQuery.set("realmId", queries.realmId.toString())
  }
  if (queries.author) {
    searchQuery.set("author", queries.author)
  }

  const res = await fetch(`${config.public.solarNetworkApi}/cgi/interactive/posts?` + searchQuery)
  const posts: any[] = (await res.json())["data"]

  for (const post of posts) {
    const content = await unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeSanitize)
      .use(rehypeStringify)
      .process(post.body.content)

    const slug = post.alias ? `/posts/${post.area_alias}/${post.alias}` : `/posts/${post.id}`

    feed.addItem({
      date: new Date(post.published_at),
      link: `https://solsynth.dev/${slug}`,
      title: post.body.title ?? `Post #${post.id}`,
      description: post.body.description,
      content: String(content),
      author: [
        {
          name: post.author.nick,
          link: `https://solsynth.dev/@${post.author.name}`,
        },
      ],
      image: post.body.thumbnail ? `${config.public.solarNetworkApi}/cgi/files/attachments/${post.body.thumbnail}` : void 0,
    })
  }

  switch (queries.type) {
    case "json":
      setResponseHeader(event, "Content-Type", "application/json; charset=utf-8")
      return feed.json1()
    case "rss":
      setResponseHeader(event, "Content-Type", "application/rss+xml; charset=utf-8")
      return feed.rss2()
    default:
      setResponseHeader(event, "Content-Type", "application/rss+xml; charset=utf-8")
      return feed.atom1()
  }
})
