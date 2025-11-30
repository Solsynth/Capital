<template>
  <div class="container max-w-xl mx-auto my-16 px-8">
    <h1 class="text-4xl font-bold mb-8">Our Products</h1>

    <nuxt-link
      v-for="product in products"
      :key="product.url"
      :to="
        product.hasPage
          ? `/products/${product.stem.split('/').pop()}`
          : product.url
      "
      class="no-underline block mb-4"
    >
      <n-card hoverable>
        <template #cover>
          <div class="h-48 overflow-hidden relative">
            <img :src="product.background" class="w-full h-full object-cover" />
            <div
              class="absolute bottom-0 left-0 p-4 bg-linear-to-t from-black/80 to-transparent w-full flex items-center gap-3"
            >
              <img
                :src="product.icon"
                class="aspect-square h-10 rounded-full bg-white/10 p-1"
                style="width: auto"
              />
              <span class="text-white font-bold text-lg grow">{{
                product.name
              }}</span>
            </div>
          </div>
        </template>
        <p class="line-clamp-3 pt-4">{{ product.description }}</p>
        <template #footer>
          <div class="flex justify-between items-center text-xs opacity-75">
            <span>v{{ product.version }}</span>
            <span>
              Released:
              {{ new Date(product.releasedDate ?? "").toLocaleDateString() }}
            </span>
          </div>
        </template>
      </n-card>
    </nuxt-link>
  </div>
</template>

<script setup lang="ts">
import { NCard } from "naive-ui";

const { data: products } = await useAsyncData("products", () =>
  queryCollection("products").all()
);

useHead({
  title: "Products",
});
</script>
