<script setup lang="ts">
interface Props {
  products: Array<{
    id: string
    title: string
    description: string
    icon: string
    background: string
    url?: string
    repo?: string
    hasPage: boolean
    tags?: string[]
    series?: string
  }>
}

const props = defineProps<Props>()

const { t } = useI18n()
</script>

<template>
  <section id="products" class="scroll-mt-24 py-12 px-4">
    <div class="container mx-auto">
      <div class="text-center mb-10">
        <h2 class="text-2xl md:text-3xl font-bold mb-3">
          {{ t('home.products.title') }}
        </h2>
        <p class="text-base md:text-lg opacity-60 max-w-2xl mx-auto">
          {{ t('home.products.subtitle') }}
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        <ProductCard
          v-for="product in products"
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
        />
      </div>
    </div>
  </section>
</template>
