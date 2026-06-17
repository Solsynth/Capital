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

  return products.map(p => ({
    id: p.path.replace(`/products/${lang.value}/`, ''),
    title: p.title || '',
    description: p.description || '',
    icon: p.icon || '',
    background: p.background || '',
    url: p.url,
    repo: p.repo,
    hasPage: p.hasPage ?? false,
    tags: p.tags || [],
    series: p.series,
  }))
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
  <div class="container mx-auto px-4 py-16">
    <div class="text-center mb-16">
      <h1 class="text-4xl md:text-5xl font-bold mb-4">
        {{ t('products.title') }}
      </h1>
      <p class="text-xl opacity-70 max-w-2xl mx-auto">
        {{ t('products.subtitle') }}
      </p>
    </div>

    <div v-if="seriesMap.size > 0" class="mb-12">
      <h2 class="text-lg font-semibold mb-4">
        {{ t('products.series') }}
      </h2>
      <div class="flex flex-wrap gap-2">
        <NuxtLink
          v-for="series in seriesMap.keys()"
          :key="series"
          :to="`${localePath('/products')}?series=${encodeURIComponent(series)}`"
          class="btn btn-sm"
          :class="urlSeries === series ? 'btn-primary' : 'btn-outline'"
        >
          {{ series }}
        </NuxtLink>
      </div>
    </div>

    <div v-if="allTags.length > 0" class="mb-12">
      <h2 class="text-lg font-semibold mb-4">
        {{ t('products.tags') }}
      </h2>
      <div class="flex flex-wrap gap-2">
        <NuxtLink
          :to="localePath('/products')"
          class="btn btn-sm"
          :class="!urlTag ? 'btn-primary' : 'btn-ghost'"
        >
          {{ t('products.all') }}
        </NuxtLink>
        <NuxtLink
          v-for="tag in allTags"
          :key="tag"
          :to="`${localePath('/products')}?tag=${encodeURIComponent(tag)}`"
          class="btn btn-sm"
          :class="urlTag === tag ? 'btn-primary' : 'btn-outline'"
        >
          {{ tag }}
        </NuxtLink>
      </div>
    </div>

    <div v-if="filteredProducts.length === 0" class="text-center py-16">
      <p class="text-lg opacity-70">
        {{ t('products.noProducts') }}
      </p>
      <NuxtLink :to="localePath('/')" class="btn btn-primary mt-4">
        {{ lang === 'zh' ? '返回首页' : 'Back to Home' }}
      </NuxtLink>
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <ProductCard
        v-for="product in filteredProducts"
        :key="product.id"
        :name="product.title"
        :description="product.description"
        :icon="product.icon"
        :background="product.background"
        :url="product.url"
        :repo="product.repo"
        :has-page="product.hasPage"
        :slug="product.id"
        :tags="product.tags"
        :series="product.series"
        :lang="lang"
      />
    </div>
  </div>
</template>
