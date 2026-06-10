<script setup lang="ts">
import { ArrowLeft, Calendar } from '@lucide/vue'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

const lang = computed(() => locale.value)
const slug = computed(() => route.params.slug as string)

const { data: page } = await useAsyncData(`legal-${lang.value}-${slug.value}`, () => {
  return queryCollection('legal')
    .where('path', '=', `/legal/${lang.value}/${slug.value}`)
    .first()
})

if (!page.value) {
  navigateTo(localePath('/legal'))
}

definePageMeta({
  title: '',
  description: '',
})

useSeoMeta({
  title: () => page.value?.title ? `${page.value.title}` : `${t('seo.legal.title')}`,
  description: () => page.value?.description || t('seo.legal.description'),
  ogTitle: () => page.value?.title ? `${page.value.title}` : `${t('seo.legal.title')}`,
  ogDescription: () => page.value?.description || t('seo.legal.description'),
})

// Schema.org Structured Data for Legal Document
useSchemaOrg([
  defineArticle({
    headline: () => page.value?.title || '',
    description: () => page.value?.description || '',
    datePublished: () => page.value?.updatedDate || undefined,
    dateModified: () => page.value?.updatedDate || undefined,
    publisher: {
      '@type': 'Organization',
      name: 'Solsynth',
      url: 'https://solsynth.dev',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': () => `https://solsynth.dev${route.path}`,
    },
  }),
  defineBreadcrumb({
    itemListElement: [
      {
        name: t('seo.home.title'),
        item: 'https://solsynth.dev',
      },
      {
        name: t('seo.legal.title'),
        item: `https://solsynth.dev${localePath('/legal')}`,
      },
      {
        name: () => page.value?.title || '',
        item: () => `https://solsynth.dev${route.path}`,
      },
    ],
  }),
])
</script>

<template>
  <div v-if="page" class="container mx-auto px-8 py-16 max-w-4xl">
    <div class="mb-8 -mx-4">
      <NuxtLink :to="localePath('/legal')" class="btn btn-ghost btn-sm gap-1">
        <ArrowLeft class="w-4 h-4" />
        {{ t('legal.backToLegal') }}
      </NuxtLink>
    </div>

    <article>
      <header class="mb-8">
        <h1 class="text-4xl md:text-5xl font-bold mb-4">{{ page.title }}</h1>
        <div v-if="page.updatedDate" class="flex items-center gap-2 text-sm opacity-70">
          <Calendar class="w-4 h-4" />
          <span>{{ lang === 'zh' ? t('legal.lastUpdatedZh') : t('legal.lastUpdated') }} {{ page.updatedDate }}</span>
        </div>
        <p v-if="page.description" class="text-lg opacity-70 mt-4">{{ page.description }}</p>
      </header>

      <div class="divider"></div>

      <div class="prose prose-lg max-w-none">
        <ContentRenderer :value="page" />
      </div>
    </article>
  </div>
</template>
