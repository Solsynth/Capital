<script setup lang="ts">
import HeroSection from "~/components/landing/HeroSection.vue";
import ProductsSection from "~/components/landing/ProductsSection.vue";
import StatsSection from "~/components/landing/StatsSection.vue";
import UpdatesSection from "~/components/landing/UpdatesSection.vue";

const { t, locale } = useI18n()
const lang = computed(() => locale.value)

definePageMeta({
  description: '',
})

useSeoMeta({
  description: () => t('seo.home.description'),
})

defineOgImageComponent('OgImage', {
  title: 'Solsynth',
  description: t('seo.home.description'),
})

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
  }))
})
</script>

<template>
  <div>
    <HeroSection />
    <StatsSection />
    <ProductsSection :products="products || []" />
    <UpdatesSection />
  </div>
</template>
