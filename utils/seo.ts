export function createSEOHead(title: string, description: string, url: string) {
  return [
    { key: "og:title", property: "og:title", content: title },
    {
      key: "og:description",
      name: "og:description",
      content: description,
    },
    {
      key: "description",
      name: "description",
      content: description,
    },
    {
      hid: 'og:url',
      property: 'og:url',
      content: useRuntimeConfig().public.siteUrl + '/' + url,
    },
  ]
}
