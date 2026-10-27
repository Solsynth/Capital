<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

const lang = computed(() => locale.value)

definePageMeta({
  description: '',
})

useSeoMeta({
  title: () => `${t('seo.products.title')}`,
  description: () => t('seo.products.description'),
})

defineOgImage('UniOgImage', {
  title: t('products.title'),
  description: t('seo.products.description'),
})

// Schema.org Structured Data for Products Collection Page
useSchemaOrg([
  defineWebPage({
    name: () => t('seo.products.title'),
    description: () => t('seo.products.description'),
    url: () => `https://solsynth.dev${route.path}`,
  }),
  defineBreadcrumb({
    itemListElement: [
      {
        name: t('seo.home.title'),
        item: 'https://solsynth.dev',
      },
      {
        name: t('seo.products.title'),
        item: () => `https://solsynth.dev${route.path}`,
      },
    ],
  }),
])

const urlTag = computed(() => route.query.tag as string || '')
const urlSeries = computed(() => route.query.series as string || '')

const { data: allProducts } = await useAsyncData(`products-list-${lang.value}`, async () => {
  const products = await queryCollection('products')
    .where('path', 'LIKE', `/products/${lang.value}/%`)
    .all()

  const slugs = products.map(p => p.path.replace(`/products/${lang.value}/`, ''))
  const { summaries } = await $fetch<{
    summaries: Record<string, { average?: number; count?: number }>
  }>('/api/products/reviews/summaries', {
    query: { slugs: slugs.join(',') },
  }).catch(() => ({ summaries: {} }))

  return products.map((p, i) => {
    const slug = slugs[i]
    const summary = summaries[slug]

    return {
      slug,
      title: p.title || '',
      description: p.description || '',
      icon: p.icon || '',
      background: p.background || '',
      url: p.url,
      repo: p.repo,
      hasPage: p.hasPage ?? false,
      tags: p.tags || [],
      series: p.series,
      color: p.color,
      version: p.version,
      releasedDate: p.releasedDate,
      averageRating: Number(summary?.average ?? 0) || 0,
      reviewCount: Number(summary?.count ?? 0) || 0,
    }
  })
})

const seriesList = computed(() => {
  if (!allProducts.value) return []
  return [...new Set(allProducts.value.map(p => p.series).filter(Boolean))] as string[]
})

const allTags = computed(() => {
  if (!allProducts.value) return []
  return [...new Set(allProducts.value.flatMap(p => p.tags || []))].sort()
})

const filteredProducts = computed(() => {
  if (!allProducts.value) return []
  let filtered = allProducts.value
  if (urlTag.value) {
    filtered = filtered.filter(p => p.tags?.includes(urlTag.value))
  }
  if (urlSeries.value) {
    filtered = filtered.filter(p => p.series === urlSeries.value)
  }
  return filtered
})

const filtered = computed(() => Boolean(urlTag.value || urlSeries.value))

// One filter at a time: choosing a tag clears the series and the reverse, so
// the list never narrows through a combination the page does not show.
function tagLink(tag: string) {
  return tag ? `${localePath('/products')}?tag=${encodeURIComponent(tag)}` : localePath('/products')
}

function seriesLink(series: string) {
  return series ? `${localePath('/products')}?series=${encodeURIComponent(series)}` : localePath('/products')
}
</script>

<template>
  <div>
    <header class="band">
      <div class="shell">
        <h1 class="title page-title">
          {{ t('products.title') }}
        </h1>
        <p class="lede page-lede">
          {{ t('products.subtitle') }}
        </p>
      </div>
    </header>

    <section class="body">
      <div class="shell">
        <div class="filters">
          <div v-if="seriesList.length" class="filter-row">
            <span class="filter-label">{{ t('products.series') }}</span>
            <NuxtLink
              :to="seriesLink('')"
              class="chip"
              :class="{ 'is-current': !urlSeries && !urlTag }"
            >
              {{ t('products.all') }}
            </NuxtLink>
            <NuxtLink
              v-for="series in seriesList"
              :key="series"
              :to="seriesLink(series)"
              class="chip"
              :class="{ 'is-current': urlSeries === series }"
            >
              {{ series }}
            </NuxtLink>
          </div>

          <div v-if="allTags.length" class="filter-row">
            <span class="filter-label">{{ t('products.tags') }}</span>
            <NuxtLink
              v-for="tag in allTags"
              :key="tag"
              :to="tagLink(tag)"
              class="chip"
              :class="{ 'is-current': urlTag === tag }"
            >
              {{ tag }}
            </NuxtLink>
            <NuxtLink v-if="filtered" :to="localePath('/products')" class="chip filter-clear">
              {{ t('products.clearFilter') }}
            </NuxtLink>
          </div>
        </div>

        <div class="list-head">
          <span class="list-count">{{ filteredProducts.length.toString().padStart(2, '0') }}</span>
          <span class="list-count-label">{{ t('home.products.count') }}</span>
        </div>

        <ol v-if="filteredProducts.length" class="list">
          <ProductRow
            v-for="product in filteredProducts"
            :key="product.slug"
            thumb
            :slug="product.slug"
            :title="product.title"
            :description="product.description"
            :icon="product.icon"
            :background="product.background"
            :series="product.series"
            :version="product.version"
            :released-date="product.releasedDate"
            :tags="product.tags"
            :average-rating="product.averageRating"
            :review-count="product.reviewCount"
          />
        </ol>

        <div v-else class="empty">
          <p>{{ t('products.noProducts') }}</p>
          <NuxtLink v-if="filtered" :to="localePath('/products')" class="btn btn-sm">
            {{ t('products.clearFilter') }}
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.band {
  padding-block: 3.5rem 2.5rem;
  border-bottom: 1px solid var(--color-line-soft);
}

.page-title {
  font-size: clamp(2rem, 4vw, 2.75rem);
  margin: 0;
}

.page-lede {
  margin: 0.75rem 0 0;
}

.body {
  padding-block: 2rem 0;
}

.filters {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
}

.filter-label {
  margin-right: 0.35rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-faint);
}

.filter-clear {
  color: var(--color-error);
  border-color: color-mix(in oklab, var(--color-error) 40%, transparent);
}

.list-head {
  display: flex;
  align-items: baseline;
  gap: 0.3rem;
  margin: 1.75rem 0 0.5rem;
  font-size: 0.8125rem;
  color: var(--color-faint);
}

.list-count {
  font-family: var(--font-mono);
  color: var(--color-dim);
  font-variant-numeric: tabular-nums;
}

.list {
  margin: 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid var(--color-line);
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
  padding: 3rem 0;
  border-top: 1px solid var(--color-line);
  font-size: 0.9375rem;
  color: var(--color-faint);
}
</style>
