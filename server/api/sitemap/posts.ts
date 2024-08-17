export default defineSitemapEventHandler(async () => {
  const config = useRuntimeConfig();

  const res = await fetch(`${config.public.solarNetworkApi}/cgi/co/posts/minimal?take=500`)
  const result = await res.json()

  return result.data.map((item: any) => asSitemapUrl({
    loc: item.alias ? `/posts/${item.area_alias}/${item.alias}` : `/posts/${item.id}`,
    lastmod: item.edited_at ?? item.published_at,
    priority: 0.7,
    _sitemap: "posts",
  }));
})
