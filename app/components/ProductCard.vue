<script setup lang="ts">
import { CodeXml, ExternalLink, Info } from "@lucide/vue";

interface Props {
  name: string;
  description: string;
  icon: string;
  background: string;
  url?: string;
  repo?: string;
  hasPage?: boolean;
  slug?: string;
  tags?: string[];
  series?: string;
}

const props = withDefaults(defineProps<Props>(), {
  tags: () => [],
});

const localePath = useLocalePath();
</script>

<template>
  <div
    class="card bg-base-100 border border-base-200 overflow-hidden transition-colors duration-150 hover:border-base-300"
  >
    <div class="relative aspect-video overflow-hidden">
      <NuxtLink :to="localePath(`/products/${slug}`)">
        <img :src="background" class="w-full h-full object-cover" :alt="name" />
      </NuxtLink>
      <div
        class="absolute inset-0 bg-linear-to-t from-black/70 to-transparent"
      />

      <div class="absolute top-3 right-3 flex gap-1.5">
        <a
          v-if="repo"
          :href="repo"
          target="_blank"
          class="btn btn-circle btn-xs bg-white/80 hover:bg-white text-black border-none"
        >
          <CodeXml class="w-3.5 h-3.5" />
        </a>
        <a
          v-if="url"
          :href="url"
          target="_blank"
          class="btn btn-circle btn-xs bg-white/80 hover:bg-white text-black border-none"
        >
          <ExternalLink class="w-3.5 h-3.5" />
        </a>
        <NuxtLink
          :to="localePath(`/products/${slug}`)"
          class="btn btn-circle btn-xs bg-white/80 hover:bg-white text-black border-none"
        >
          <Info class="w-3.5 h-3.5" />
        </NuxtLink>
      </div>

      <NuxtLink
        :to="localePath(`/products/${slug}`)"
        class="absolute bottom-0 left-0 right-0 p-5"
      >
        <div class="flex items-center gap-3 mb-2">
          <img :src="icon" class="w-9 h-9 rounded shadow-sm" :alt="name" />
          <h3 class="text-lg font-bold text-white">
            {{ name }}
          </h3>
        </div>
        <p class="text-gray-300 text-sm line-clamp-2">
          {{ description }}
        </p>
      </NuxtLink>
    </div>

    <div
      v-if="tags.length > 0 || series"
      class="px-4 py-3 border-t border-base-200"
    >
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
