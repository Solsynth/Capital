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
      averageRating: Number(summary?.average ?? 0) || 0,
      reviewCount: Number(summary?.count ?? 0) || 0,
    }
  })
})

const seriesMap = computed(() => {
  const map = new Map<string, typeof allProducts.value>()
  if (!allProducts.value) return map
  for (const product of allProducts.value) {
    const series = product.series
    if (series) {
      if (!map.has(series)) {
        map.set(series, [])
      }
      map.get(series)!.push(product)
    }
  }
  return map
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
</script>

<template>
  <div>
    <section class="border-b border-base-200 px-4 py-16 md:py-20">
      <div class="container mx-auto">
        <h1 class="mb-3 text-4xl font-extrabold tracking-tight md:text-5xl">
          {{ t('products.title') }}
        </h1>
        <p class="max-w-2xl text-lg text-base-content/65 md:text-xl">
          {{ t('products.subtitle') }}
        </p>
      </div>
    </section>

    <section class="px-4 py-10">
      <div class="container mx-auto">
        <div
          v-if="seriesMap.size > 0"
          class="mb-8"
        >
          <h2 class="mb-3 text-sm font-semibold text-base-content/60">
            {{ t('products.series') }}
          </h2>
          <div class="flex flex-wrap gap-2">
            <NuxtLink
              v-for="series in seriesMap.keys()"
              :key="series"
              :to="`${localePath('/products')}?series=${encodeURIComponent(series)}`"
              class="btn btn-sm"
              :class="urlSeries === series ? 'btn-primary' : 'btn-ghost border border-base-300'"
            >
              {{ series }}
            </NuxtLink>
          </div>
        </div>

        <div
          v-if="allTags.length > 0"
          class="mb-10"
        >
          <h2 class="mb-3 text-sm font-semibold text-base-content/60">
            {{ t('products.tags') }}
          </h2>
          <div class="flex flex-wrap gap-2">
            <NuxtLink
              :to="localePath('/products')"
              class="btn btn-sm"
              :class="!urlTag && !urlSeries ? 'btn-primary' : 'btn-ghost border border-base-300'"
            >
              {{ t('products.all') }}
            </NuxtLink>
            <NuxtLink
              v-for="tag in allTags"
              :key="tag"
              :to="`${localePath('/products')}?tag=${encodeURIComponent(tag)}`"
              class="btn btn-sm"
              :class="urlTag === tag ? 'btn-primary' : 'btn-ghost border border-base-300'"
            >
              {{ tag }}
            </NuxtLink>
          </div>
        </div>

        <div
          v-if="filteredProducts.length === 0"
          class="rounded-lg border border-dashed border-base-300 px-6 py-16 text-center"
        >
          <p class="mb-4 text-base text-base-content/55">
            {{ t('products.noProducts') }}
          </p>
          <NuxtLink
            :to="localePath('/')"
            class="btn btn-primary btn-sm"
          >
            {{ lang === 'zh' ? '返回首页' : 'Back to Home' }}
          </NuxtLink>
        </div>
        <div
          v-else
          class="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-3"
        >
          <ProductCard
            v-for="product in filteredProducts"
            :key="product.slug"
            :name="product.title"
            :description="product.description"
            :icon="product.icon"
            :background="product.background"
            :url="product.url"
            :repo="product.repo"
            :has-page="product.hasPage"
            :slug="product.slug"
            :tags="product.tags"
            :series="product.series"
            :average-rating="product.averageRating"
            :review-count="product.reviewCount"
          />
        </div>
      </div>
    </section>
  </div>
</template>
