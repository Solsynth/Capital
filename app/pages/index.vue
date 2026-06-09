<script setup lang="ts">
import HeroSection from "../components/Landing/HeroSection.vue";
import ProductsSection from "../components/Landing/ProductsSection.vue";
import StatsSection from "../components/Landing/StatsSection.vue";
import UpdatesSection from "../components/Landing/UpdatesSection.vue";

const { t, locale } = useI18n()
const lang = computed(() => locale.value)

definePageMeta({
  description: '',
})

useSeoMeta({
  title: () => `${t('seo.home.title')} - ${t('seo.siteName')}`,
  description: () => t('seo.home.description'),
})

defineOgImage('OgImage.takumi', {
  title: t('seo.siteName'),
  description: t('seo.home.description')
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
