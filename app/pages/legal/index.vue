<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

const lang = computed(() => locale.value)

definePageMeta({
  description: '',
})

useSeoMeta({
  title: () => `${t('seo.legal.title')}`,
  description: () => t('seo.legal.description'),
})

defineOgImage('UniOgImage', {
  title: t('legal.title'),
  description: t('seo.legal.description'),
})

useSchemaOrg([
  defineWebPage({
    name: () => t('seo.legal.title'),
    description: () => t('seo.legal.description'),
    url: () => `https://solsynth.dev${route.path}`,
  }),
  defineBreadcrumb({
    itemListElement: [
      {
        name: t('seo.home.title'),
        item: 'https://solsynth.dev',
      },
      {
        name: t('seo.legal.title'),
        item: () => `https://solsynth.dev${route.path}`,
      },
    ],
  }),
])

const { data: currentLangPages } = await useAsyncData(`legal-list-${lang.value}`, async () => {
  const pages = await queryCollection('legal')
    .where('path', 'LIKE', `/legal/${lang.value}/%`)
    .all()

  return pages.map(p => ({
    path: p.path,
    title: p.title || '',
    description: p.description || '',
    updatedDate: p.updatedDate || '',
  }))
})

function getSlug(path: string): string {
  return path.replace(/^\/legal\/(en|zh)\//, '')
}
</script>

<template>
  <div>
    <header class="shell masthead">
      <h1 class="display masthead-title">
        {{ t('legal.title') }}
      </h1>
      <p class="lede masthead-lede">
        {{ t('legal.subtitle') }}
      </p>
    </header>

    <section class="shell body">
      <p v-if="!currentLangPages?.length" class="note empty">
        {{ t('legal.subtitle') }}
      </p>

      <ul v-else class="docs">
        <li v-for="page in currentLangPages" :key="page.path" class="doc">
          <NuxtLink :to="localePath(`/legal/${getSlug(page.path)}`)" class="doc-link">
            <span class="doc-text">
              <span class="doc-title">{{ page.title }}</span>
              <span v-if="page.description" class="doc-desc">{{ page.description }}</span>
            </span>
            <span v-if="page.updatedDate" class="mono doc-date">
              {{ page.updatedDate }}
            </span>
          </NuxtLink>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.masthead {
  padding-block: 3.5rem 2.5rem;
}

.masthead-title {
  margin: 0;
  font-size: clamp(2rem, 4vw, 2.75rem);
}

.masthead-lede {
  margin: 0.75rem 0 0;
}

.body {
  padding-bottom: 4rem;
}

.empty {
  margin: 0;
  padding: 1rem 1.125rem;
}

.docs {
  margin: 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid var(--color-line);
}

.doc {
  border-bottom: 1px solid var(--color-line-soft);
}

.doc:last-child {
  border-bottom: 0;
}

.doc-link {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.35rem 1.5rem;
  align-items: baseline;
  padding: 1.15rem 0.5rem 1.15rem 0;
  color: inherit;
  text-decoration: none;
  transition: background-color 140ms ease;
}

.doc-link:hover {
  background: color-mix(in oklab, var(--color-base-200) 55%, transparent);
}

.doc-link:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: -2px;
}

.doc-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.doc-title {
  font-size: 0.9375rem;
  font-weight: 600;
  line-height: 1.4;
  color: var(--color-base-content);
  letter-spacing: -0.005em;
  transition: color 140ms ease;
}

.doc-link:hover .doc-title {
  color: var(--color-primary);
}

.doc-desc {
  max-width: 40rem;
  font-size: 0.8125rem;
  line-height: 1.6;
  color: var(--color-faint);
}

.doc-date {
  grid-column: 2;
  grid-row: 1;
  text-align: right;
  white-space: nowrap;
}
</style>
