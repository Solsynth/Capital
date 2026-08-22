<script setup lang="ts">
import HeroSection from '../components/Landing/HeroSection.vue'
import ProductsSection from '../components/Landing/ProductsSection.vue'
import StatsSection from '../components/Landing/StatsSection.vue'
import UpdatesSection from '../components/Landing/UpdatesSection.vue'

const { t, locale } = useI18n()
const lang = computed(() => locale.value)

definePageMeta({
  description: '',
})

useSeoMeta({
  title: () => `${t('seo.home.title')}`,
  description: () => t('seo.home.description'),
})

defineOgImage('UniOgImage', {
  title: t('seo.siteName'),
  description: t('seo.home.description'),
})

// Schema.org Structured Data for Homepage
useSchemaOrg([
  defineWebPage({
    name: () => t('seo.home.title'),
    description: () => t('seo.home.description'),
    url: 'https://solsynth.dev',
  }),
  defineOrganization({
    name: 'Solsynth',
    url: 'https://solsynth.dev',
    logo: 'https://solsynth.dev/favicon-64.png',
    sameAs: [
      'https://github.com/solsynth',
    ],
  }),
])

const { data: products } = await useAsyncData(`products-home-${lang.value}`, async () => {
  const allProducts = await queryCollection('products')
    .where('path', 'LIKE', `/products/${lang.value}/%`)
    .all()

  return allProducts.map(p => ({
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
    color: p.color,
  }))
})
</script>

<template>
  <div>
    <HeroSection />
    <StatsSection />
    <ProductsSection :products="products || []" />
    <ClientOnly>
      <UpdatesSection />
      <template #fallback>
        <div class="px-4 py-16">
          <div class="container mx-auto space-y-4">
            <div class="h-8 w-48 animate-pulse rounded bg-base-200" />
            <div class="h-4 w-72 animate-pulse rounded bg-base-200" />
            <div class="mt-6 flex gap-4 overflow-hidden">
              <div
                v-for="n in 3"
                :key="n"
                class="h-56 w-80 shrink-0 animate-pulse rounded-box border border-base-200 bg-base-200/60"
              />
            </div>
          </div>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>
