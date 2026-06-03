<script setup lang="ts">
const { locale, t } = useI18n()
const route = useRoute()

const lang = computed(() => locale.value as string)
const fullTitle = computed(() => {
  const pageTitle = route.meta?.title as string || 'Solsynth'
  return `${pageTitle} - ${t('seo.siteName')}`
})

useHead({
  htmlAttrs: { lang: lang.value },
  title: fullTitle,
})

useSeoMeta({
  title: fullTitle,
  description: () => t('seo.home.description'),
  author: 'Solsynth',
  robots: 'index, follow',
  ogType: 'website',
  ogSiteName: 'Solsynth',
  ogLocale: () => lang.value === 'zh' ? 'zh_CN' : 'en_US',
  twitterCard: 'summary_large_image',
  twitterSite: '@solsynth',
  twitterCreator: '@solsynth',
})
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <AppNavbar banner-height="0px" />

    <main
      class="flex-1 transition-[margin-top] duration-200 ease-out"
      style="margin-top: var(--site-page-offset, 164px);"
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
