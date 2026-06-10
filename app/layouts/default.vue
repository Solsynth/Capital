<script setup lang="ts">
const { locale, t } = useI18n()
const route = useRoute()
const localePath = useLocalePath()

const lang = computed(() => locale.value as string)
const siteName = computed(() => t('seo.siteName'))
const fullTitle = computed(() => {
  const pageTitle = route.meta?.title as string
  if (!pageTitle) return siteName.value
  return `${pageTitle} - ${siteName.value}`
})

const siteUrl = 'https://solsynth.dev'
const canonicalUrl = computed(() => `${siteUrl}${route.path}`)

useHead({
  htmlAttrs: { lang: () => locale.value },
  title: fullTitle,
  link: [
    { rel: 'canonical', href: canonicalUrl.value },
  ],
})

useSeoMeta({
  title: fullTitle,
  description: () => route.meta?.description as string || t('seo.home.description'),
  author: siteName,
  robots: 'index, follow',
  ogTitle: fullTitle,
  ogDescription: () => route.meta?.description as string || t('seo.home.description'),
  ogType: 'website',
  ogSiteName: siteName,
  ogUrl: canonicalUrl,
  ogLocale: () => lang.value === 'zh' ? 'zh_CN' : 'en_US',
  ogLocaleAlternate: () => lang.value === 'zh' ? 'en_US' : 'zh_CN',
  twitterCard: 'summary_large_image',
  twitterSite: '@solsynth',
  twitterCreator: '@solsynth',
  twitterTitle: fullTitle,
  twitterDescription: () => route.meta?.description as string || t('seo.home.description'),
})

// Schema.org Structured Data
useSchemaOrg([
  defineOrganization({
    name: 'Solsynth',
    url: 'https://solsynth.dev',
    logo: 'https://solsynth.dev/favicon.png',
    sameAs: [
      'https://github.com/solsynth',
    ],
  }),
  defineWebSite({
    name: siteName,
    url: siteUrl,
    inLanguage: () => locale.value,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }),
  defineBreadcrumb({
    itemListElement: [
      {
        name: t('seo.home.title'),
        item: siteUrl,
      },
    ],
  }),
])
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <AppNavbar banner-height="0px" />

    <main
      class="flex-1"
      style="margin-top: var(--site-page-offset, 64px);"
    >
      <slot />
    </main>

    <AppFooter />
  </div>
</template>

<script lang="ts">
if (import.meta.client) {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme)
  }
  else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.setAttribute('data-theme', 'dark')
  }
  else {
    document.documentElement.setAttribute('data-theme', 'light')
  }
}
</script>
