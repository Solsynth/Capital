<script setup lang="ts">
interface Props {
  products: Array<{
    id: string
    title: string
    description: string
    icon: string
    background: string
    series?: string
    color?: string
    version?: string
    releasedDate?: string
  }>
}

const props = defineProps<Props>()

const { t } = useI18n()
const localePath = useLocalePath()

const count = computed(() => props.products.length)
</script>

<template>
  <section id="products" class="catalog">
    <div class="shell">
      <div class="catalog-head">
        <h2 class="catalog-title">
          {{ t('home.products.title') }}
        </h2>
        <p class="catalog-note">
          <span class="catalog-count">{{ count.toString().padStart(2, '0') }}</span>
          {{ t('home.products.count') }}
        </p>
      </div>

      <p class="catalog-lede">
        {{ t('home.products.subtitle') }}
      </p>

      <ol v-if="products.length" class="catalog-list">
        <ProductRow
          v-for="product in products"
          :key="product.id"
          :slug="product.id"
          :title="product.title"
          :description="product.description"
          :icon="product.icon"
          :background="product.background"
          :series="product.series"
          :version="product.version"
          :released-date="product.releasedDate"
        />
      </ol>

      <p v-else class="catalog-empty">
        {{ t('products.noProducts') }}
      </p>

      <div class="catalog-foot">
        <NuxtLink :to="localePath('/products')" class="catalog-all">
          {{ t('nav.products') }}
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.catalog {
  padding-block: 4rem 1rem;
}

.catalog-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
}

.catalog-title {
  margin: 0;
  font-size: 1.375rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.catalog-note {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--color-faint);
}

.catalog-count {
  margin-right: 0.25rem;
  font-family: var(--font-mono);
  color: var(--color-dim);
  font-variant-numeric: tabular-nums;
}

.catalog-lede {
  margin: 0.5rem 0 2.25rem;
  max-width: 34rem;
  font-size: 0.9375rem;
  line-height: 1.6;
  color: var(--color-faint);
}

.catalog-list {
  margin: 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid var(--color-line);
}

.catalog-empty {
  margin: 0;
  padding: 2.5rem 0;
  border-top: 1px solid var(--color-line);
  border-bottom: 1px solid var(--color-line-soft);
  font-size: 0.9375rem;
  color: var(--color-faint);
}

.catalog-foot {
  display: flex;
  justify-content: flex-end;
  padding-top: 1rem;
}

.catalog-all {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-dim);
  text-decoration: none;
  transition: color 140ms ease;
}

.catalog-all:hover,
.catalog-all:focus-visible {
  color: var(--color-primary);
}

@media (min-width: 768px) {
  .catalog {
    padding-block: 4.5rem 1rem;
  }

  .catalog-title {
    font-size: 1.5rem;
  }
}
</style>
