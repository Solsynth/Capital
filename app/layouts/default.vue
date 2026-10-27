<script setup lang="ts">
const { locale, t } = useI18n()
const route = useRoute()

const lang = computed(() => locale.value as string)
const siteName = computed(() => t('seo.siteName'))
const fullTitle = computed(() => (route.meta?.title as string) || siteName.value)

const siteUrl = 'https://solsynth.dev'
const canonicalUrl = computed(() => `${siteUrl}${route.path}`)

useHead({
  // Single localized brand suffix; overrides nuxt-seo-utils' "%s %separator %siteName"
  // which uses the non-localized site name.
  titleTemplate: (chunk?: string) => (chunk ? `${chunk} | ${siteName.value}` : siteName.value),
  htmlAttrs: { lang: () => locale.value },
  link: [
    { rel: 'canonical', href: canonicalUrl.value, key: 'canonical' },
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
    logo: 'https://solsynth.dev/favicon-64.png',
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
  <AppToast>
    <div class="site">
      <a href="#main" class="skip">{{ t('nav.skipToContent') }}</a>

      <AppNavbar banner-height="0px" />

      <main id="main" class="site-main">
        <slot />
      </main>

      <AppFooter />
    </div>

    <DownloadDialog />
  </AppToast>
</template>

<style scoped>
.site {
  display: flex;
  min-height: 100dvh;
  flex-direction: column;
}

.site-main {
  flex: 1;
  margin-top: var(--site-page-offset);
}

.skip {
  position: absolute;
  left: -9999px;
  top: 0;
  z-index: 60;
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-chip);
  background: var(--color-base-300);
  color: var(--color-base-content);
  font-size: 0.8125rem;
  font-weight: 600;
}

.skip:focus {
  left: 1rem;
  top: calc(var(--site-page-offset) + 0.75rem);
}
</style>
