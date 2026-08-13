<script setup lang="ts">
import { CodeXml, ExternalLink, Info } from "@lucide/vue";
import StarRating from "./StarRating.vue";

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
  averageRating?: number;
  reviewCount?: number;
}

const props = withDefaults(defineProps<Props>(), {
  tags: () => [],
  averageRating: 0,
  reviewCount: 0,
});

const routes = useLocalePath();

// API may send numeric as string (Postgres avg/numeric)
const rating = computed(() => Number(props.averageRating) || 0);
</script>

<template>
  <div
    class="card bg-base-100 border border-base-200 overflow-hidden transition-colors duration-150 hover:border-base-300"
  >
    <div class="relative aspect-video overflow-hidden">
      <NuxtLink :to="routes(`/products/${slug}`)">
        <NuxtImg
          :src="background"
          class="w-full h-full object-cover"
          :alt="name"
          width="640"
          height="360"
          sizes="sm:100vw md:50vw lg:33vw"
          format="webp"
          loading="lazy"
          decoding="async"
        />
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
          :to="routes(`/products/${slug}`)"
          class="btn btn-circle btn-xs bg-white/80 hover:bg-white text-black border-none"
        >
          <Info class="w-3.5 h-3.5" />
        </NuxtLink>
      </div>

      <div class="absolute top-3 left-3">
        <div
          v-if="rating > 0"
          class="flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded px-2 py-1"
        >
          <span class="text-warning text-xs font-bold">{{ rating.toFixed(1) }}</span>
          <svg class="w-3 h-3 text-warning fill-warning" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
        </div>
      </div>

      <NuxtLink
        :to="routes(`/products/${slug}`)"
        class="absolute bottom-0 left-0 right-0 p-5"
      >
        <div class="flex items-center gap-3 mb-2">
          <NuxtImg
            :src="icon"
            class="w-9 h-9 rounded shadow-sm"
            :alt="name"
            width="36"
            height="36"
            format="webp"
            loading="lazy"
            decoding="async"
          />
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
          :to="`${routes('/products')}?series=${encodeURIComponent(series)}`"
          class="badge badge-sm badge-primary hover:badge-secondary transition-colors"
        >
          {{ series }}
        </NuxtLink>
        <NuxtLink
          v-for="tag in tags.slice(0, 4)"
          :key="tag"
          :to="`${routes('/products')}?tag=${encodeURIComponent(tag)}`"
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
