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

defineOgImage('UniOgImage', {
  title: page.value?.title || t('legal.title'),
  description: page.value?.description || t('seo.legal.description'),
})

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
  <div v-if="page">
    <section class="border-b border-base-200 px-4 py-12 md:py-16">
      <div class="container mx-auto max-w-3xl">
        <NuxtLink
          :to="localePath('/legal')"
          class="btn btn-ghost btn-sm mb-8 -ml-2 gap-1.5 text-base-content/60"
        >
          <ArrowLeft class="h-4 w-4" />
          {{ t('legal.backToLegal') }}
        </NuxtLink>

        <h1 class="mb-3 text-3xl font-extrabold tracking-tight md:text-4xl lg:text-5xl">
          {{ page.title }}
        </h1>

        <p
          v-if="page.description"
          class="mb-4 max-w-2xl text-base text-base-content/65 md:text-lg"
        >
          {{ page.description }}
        </p>

        <div
          v-if="page.updatedDate"
          class="flex items-center gap-1.5 text-sm text-base-content/50"
        >
          <Calendar class="h-4 w-4" />
          <span>
            {{ lang === 'zh' ? t('legal.lastUpdatedZh') : t('legal.lastUpdated') }}
            {{ page.updatedDate }}
          </span>
        </div>
      </div>
    </section>

    <section class="px-4 py-12">
      <article class="container mx-auto max-w-3xl">
        <div class="prose prose-base max-w-none md:prose-lg prose-headings:tracking-tight prose-a:text-primary">
          <ContentRenderer :value="page" />
        </div>
      </article>
    </section>
  </div>
</template>
