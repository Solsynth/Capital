export default defineSitemapEventHandler(async () => {
  const config = useRuntimeConfig();

  const res = await fetch(`${config.public.solarNetworkApi}/cgi/interactive/posts?take=500`)
  const result = await res.json()

  return result.data.map((item: any) => asSitemapUrl({
    loc: `/posts/${item.id}`,
    _sitemap: "posts",
  }));
})
