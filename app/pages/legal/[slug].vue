<script setup lang="ts">
import { ArrowLeft } from '@lucide/vue'

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
    <header class="shell masthead">
      <NuxtLink :to="localePath('/legal')" class="back">
        <ArrowLeft class="back-icon" aria-hidden="true" />
        {{ t('legal.backToLegal') }}
      </NuxtLink>

      <h1 class="display masthead-title">
        {{ page.title }}
      </h1>

      <p v-if="page.description" class="lede masthead-lede">
        {{ page.description }}
      </p>

      <p v-if="page.updatedDate" class="mono masthead-date">
        {{ lang === 'zh' ? t('legal.lastUpdatedZh') : t('legal.lastUpdated') }}
        {{ page.updatedDate }}
      </p>
    </header>

    <section class="shell body">
      <article class="prose measure">
        <ContentRenderer :value="page" />
      </article>
    </section>
  </div>
</template>

<style scoped>
.masthead {
  padding-block: 3rem 2rem;
}

.back {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-bottom: 1.5rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-faint);
  text-decoration: none;
  transition: color 140ms ease;
}

.back:hover,
.back:focus-visible {
  color: var(--color-base-content);
}

.back-icon {
  width: 0.875rem;
  height: 0.875rem;
}

.masthead-title {
  margin: 0;
  font-size: clamp(1.75rem, 3.4vw, 2.375rem);
}

.masthead-lede {
  margin: 0.75rem 0 0;
}

.masthead-date {
  margin: 0.9rem 0 0;
}

.body {
  padding-bottom: 4rem;
}
</style>
