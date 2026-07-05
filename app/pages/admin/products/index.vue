<script setup lang="ts">
import { Tag, Folder, ExternalLink, Plus, Star } from "@lucide/vue"

definePageMeta({
  layout: "admin",
})

const { t, locale } = useI18n()
const lang = computed(() => locale.value)

const { data: products, refresh } = await useAsyncData(`admin-products-${lang.value}`, async () => {
  const allProducts = await queryCollection("products")
    .where("path", "LIKE", `/products/${lang.value}/%`)
    .all()

  return allProducts.map(p => ({
    slug: p.path.replace(`/products/${lang.value}/`, ""),
    title: p.title || "",
    description: p.description || "",
    icon: p.icon || "",
    repo: p.repo,
    githubRepo: p.githubRepo,
    trackReleases: p.trackReleases ?? false,
  }))
})

const localePath = useLocalePath()
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold">{{ t("admin.products.title") }}</h1>
        <p class="text-sm opacity-60 mt-1">Manage product releases and reviews</p>
      </div>
    </div>

    <div v-if="products?.length" class="space-y-3">
      <div
        v-for="product in products"
        :key="product.slug"
        class="card bg-base-100 border border-base-200 p-4"
      >
        <div class="flex items-center gap-4">
          <img
            :src="product.icon"
            class="w-10 h-10 rounded-lg"
            :alt="product.title"
          />
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold truncate">{{ product.title }}</h3>
            <p class="text-xs opacity-50 truncate">{{ product.slug }}</p>
          </div>
          <div class="flex items-center gap-2">
            <span
              v-if="product.trackReleases"
              class="badge badge-xs badge-primary"
            >
              Release Tracking
            </span>
            <span
              v-if="product.githubRepo || product.repo"
              class="badge badge-xs badge-outline"
            >
              GitHub Linked
            </span>
            <NuxtLink
              :to="localePath(`/admin/products/${product.slug}/releases`)"
              class="btn btn-sm btn-outline"
            >
              Releases
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-12">
      <p class="opacity-60">No products found.</p>
    </div>
  </div>
</template>
