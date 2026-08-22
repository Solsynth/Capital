<script setup lang="ts">
import { ArrowRight } from '@lucide/vue'

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
    color?: string
  }>
}

defineProps<Props>()

const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <section id="products" class="scroll-mt-24 px-4 py-16">
    <div class="container mx-auto">
      <div class="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div class="max-w-2xl">
          <h2 class="mb-2 text-2xl font-bold tracking-tight md:text-3xl">
            {{ t('home.products.title') }}
          </h2>
          <p class="text-base text-base-content/60 md:text-lg">
            {{ t('home.products.subtitle') }}
          </p>
        </div>
        <NuxtLink
          :to="localePath('/products')"
          class="btn btn-ghost btn-sm gap-1.5 self-start text-base-content/70 sm:self-auto"
        >
          {{ t('nav.products') }}
          <ArrowRight class="h-4 w-4" />
        </NuxtLink>
      </div>

      <div
        class="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-3"
        v-if="products.length > 0"
      >
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
          :color="product.color"
          vertical
        />
      </div>
      <p
        v-else
        class="rounded-lg border border-dashed border-base-300 px-6 py-12 text-center text-base-content/50"
      >
        {{ t('products.noProducts') }}
      </p>
    </div>
  </section>
</template>
