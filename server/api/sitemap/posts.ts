export default defineSitemapEventHandler(async () => {
  const config = useRuntimeConfig();

  const res = await fetch(`${config.public.solarNetworkApi}/cgi/interactive/posts/minimal?take=500`)
  const result = await res.json()

  return result.data.map((item: any) => asSitemapUrl({
    loc: `/posts/${item.id}`,
    lastmod: item.edited_at ?? item.published_at,
    priority: 0.9,
    _sitemap: "posts",
  }));
})
