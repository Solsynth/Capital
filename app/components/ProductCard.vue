<script setup lang="ts">
import { Github, ExternalLink, Info } from 'lucide-vue-next'

interface Props {
  name: string
  description: string
  icon: string
  background: string
  url?: string
  repo?: string
  hasPage?: boolean
  slug?: string
  tags?: string[]
  series?: string
  lang?: string
}

const props = withDefaults(defineProps<Props>(), {
  tags: () => [],
  lang: 'en',
})

const localePath = useLocalePath()
</script>

<template>
  <div class="card bg-base-100 shadow-xl overflow-hidden hover:-translate-y-2 transition-transform duration-300">
    <div class="relative aspect-video overflow-hidden group">
      <NuxtLink :to="localePath(`/products/${slug}`)">
        <img
          :src="background"
          class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          :alt="name"
        >
      </NuxtLink>
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90" />

      <div class="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <a
          v-if="repo"
          :href="repo"
          target="_blank"
          class="btn btn-circle btn-sm bg-white/80 hover:bg-white"
        >
          <Github class="w-4 h-4" />
        </a>
        <a
          v-if="url"
          :href="url"
          target="_blank"
          class="btn btn-circle btn-sm bg-white/80 hover:bg-white"
        >
          <ExternalLink class="w-4 h-4" />
        </a>
        <NuxtLink
          :to="localePath(`/products/${slug}`)"
          class="btn btn-circle btn-sm bg-white/80 hover:bg-white"
        >
          <Info class="w-4 h-4" />
        </NuxtLink>
      </div>

      <NuxtLink
        :to="localePath(`/products/${slug}`)"
        class="absolute bottom-0 left-0 right-0 p-6"
      >
        <div class="flex items-center gap-3 mb-2">
          <img :src="icon" class="w-10 h-10 rounded-lg shadow-sm" :alt="name">
          <h3 class="text-xl font-bold text-white">
            {{ name }}
          </h3>
        </div>
        <p class="text-gray-200 text-sm line-clamp-2">
          {{ description }}
        </p>
      </NuxtLink>
    </div>

    <div v-if="tags.length > 0 || series" class="p-4 border-t border-base-200">
      <div class="flex flex-wrap gap-1">
        <NuxtLink
          v-if="series"
          :to="`${localePath('/products')}?series=${encodeURIComponent(series)}`"
          class="badge badge-sm badge-primary hover:badge-secondary transition-colors"
        >
          {{ series }}
        </NuxtLink>
        <NuxtLink
          v-for="tag in tags.slice(0, 4)"
          :key="tag"
          :to="`${localePath('/products')}?tag=${encodeURIComponent(tag)}`"
          class="badge badge-sm badge-outline hover:badge-primary transition-colors"
        >
          {{ tag }}
        </NuxtLink>
        <span v-if="tags.length > 4" class="badge badge-sm badge-ghost">
          +{{ tags.length - 4 }}
        </span>
      </div>
    </div>
  </div>
</template>
