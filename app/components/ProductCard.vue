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
  averageRating?: number;
  reviewCount?: number;
  color?: string;
  flip?: boolean;
  vertical?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  tags: () => [],
  averageRating: 0,
  reviewCount: 0,
  color: "",
  flip: false,
  vertical: false,
});

const routes = useLocalePath();

// API may send numeric as string (Postgres avg/numeric)
const rating = computed(() => Number(props.averageRating) || 0);

// Preset brand color for SSR/first paint; upgraded to the image's
// dominant color once the visual loads.
const fillColor = ref(props.color || "#94a3b8");
const imgEl = ref<{ $el?: HTMLImageElement } | HTMLImageElement | null>(null);

const heroName = computed(() =>
  props.slug ? `product-hero-${props.slug}` : undefined,
);

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else h = ((rn - gn) / d + 4) / 6;
  return [h, s, l];
}

function hslToHex(h: number, s: number, l: number): string {
  const hue2rgb = (p: number, q: number, t: number) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  if (s === 0) {
    const v = Math.round(l * 255);
    return `#${((v << 16) | (v << 8) | v).toString(16).padStart(6, "0")}`;
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const r = Math.round(hue2rgb(p, q, h + 1 / 3) * 255);
  const g = Math.round(hue2rgb(p, q, h) * 255);
  const b = Math.round(hue2rgb(p, q, h - 1 / 3) * 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

function extractPrimary(img: HTMLImageElement) {
  try {
    const canvas = document.createElement("canvas");
    const w = 32;
    canvas.width = w;
    canvas.height = Math.max(
      1,
      Math.round((w * img.naturalHeight) / (img.naturalWidth || w)),
    );
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // 4-bit-per-channel color buckets
    const buckets = new Map<number, { n: number; r: number; g: number; b: number }>();
    for (let i = 0; i < data.length; i += 4) {
      const key = ((data[i] >> 4) << 8) | ((data[i + 1] >> 4) << 4) | (data[i + 2] >> 4);
      const cur = buckets.get(key) ?? { n: 0, r: 0, g: 0, b: 0 };
      cur.n++;
      cur.r += data[i];
      cur.g += data[i + 1];
      cur.b += data[i + 2];
      buckets.set(key, cur);
    }

    let best: { r: number; g: number; b: number } | null = null;
    let bestScore = -1;
    for (const v of buckets.values()) {
      const r = v.r / v.n;
      const g = v.g / v.n;
      const b = v.b / v.n;
      const [, s] = rgbToHsl(r, g, b);
      // Squared saturation favors vivid regions (blossoms, autumn
      // foliage) over large muted fields.
      const score = v.n * s * s;
      if (score > bestScore) {
        bestScore = score;
        best = { r, g, b };
      }
    }
    if (!best) return;

    // Normalize into a mid-tone accent so white text stays readable in
    // both light and dark mode.
    const [h, rawS, rawL] = rgbToHsl(best.r, best.g, best.b);
    const s = Math.min(0.85, Math.max(0.5, rawS));
    const l = Math.min(0.58, Math.max(0.38, rawL));
    fillColor.value = hslToHex(h, s, l);
  } catch {
    /* tainted canvas or unavailable API: keep preset */
  }
}

function resolveImg(): HTMLImageElement | null {
  const el = imgEl.value as { $el?: unknown } | null;
  const img = (el?.$el ?? el) as unknown;
  return img instanceof HTMLImageElement ? img : null;
}

onMounted(() => {
  const img = resolveImg();
  if (img?.complete && img.naturalWidth > 0) extractPrimary(img);
});
</script>

<template>
  <div
    class="card flex flex-col bg-base-100 border border-base-300/60 overflow-hidden transition-all duration-150 hover:border-[var(--brand)] hover:shadow-md"
    :class="{ 'md:flex-row': !vertical, 'md:flex-row-reverse': !vertical && flip }"
    :style="{ '--brand': fillColor }"
  >
    <div
      class="relative w-full overflow-hidden"
      :class="vertical ? 'aspect-video' : 'aspect-video md:w-1/2 md:aspect-auto'"
    >
      <NuxtLink :to="routes(`/products/${slug}`)" class="block h-full">
        <NuxtImg
          ref="imgEl"
          :src="background"
          class="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.02]"
          :alt="name"
          width="640"
          height="360"
          sizes="sm:100vw md:50vw lg:33vw"
          format="webp"
          loading="lazy"
          decoding="async"
          :style="{ viewTransitionName: heroName }"
          @load="extractPrimary($event.target as HTMLImageElement)"
        />
      </NuxtLink>

      <!-- Vertical: classic layout with overlay content -->
      <template v-if="vertical">
        <div
          class="absolute inset-0 bg-linear-to-t from-black/70 to-transparent"
        />

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
      </template>

      <!-- Horizontal: filled details panel beside the image -->
      <template v-else>
        <!-- Brand color bleeds into the image at the seam -->
        <div
          class="brand-fade pointer-events-none absolute inset-y-0 hidden w-1/5 md:block"
          :style="flip
            ? { left: 0, background: 'linear-gradient(to right, var(--brand), transparent)' }
            : { right: 0, background: 'linear-gradient(to left, var(--brand), transparent)' }"
        />

        <div class="absolute top-3 right-3 flex gap-1.5">
          <a
            v-if="repo"
            :href="repo"
            target="_blank"
            class="btn btn-circle btn-xs bg-white/80 hover:bg-white text-black border-none backdrop-blur-sm"
          >
            <CodeXml class="w-3.5 h-3.5" />
          </a>
          <a
            v-if="url"
            :href="url"
            target="_blank"
            class="btn btn-circle btn-xs bg-white/80 hover:bg-white text-black border-none backdrop-blur-sm"
          >
            <ExternalLink class="w-3.5 h-3.5" />
          </a>
        </div>
      </template>
    </div>

    <!-- Horizontal-only filled panel -->
    <div
      v-if="!vertical"
      class="brand-panel relative flex flex-1 flex-col gap-3 p-6 md:p-8"
    >
      <div class="flex items-start justify-between">
        <NuxtImg
          :src="icon"
          class="h-14 w-14 rounded-xl shadow-md"
          :alt="name"
          width="56"
          height="56"
          format="webp"
          loading="lazy"
          decoding="async"
        />
        <div
          v-if="rating > 0"
          class="flex shrink-0 items-center gap-1 rounded bg-black/40 px-2.5 py-1.5 backdrop-blur-sm"
        >
          <span class="text-sm font-bold text-warning">{{ rating.toFixed(1) }}</span>
          <svg class="h-4 w-4 fill-warning" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
        </div>
      </div>

      <NuxtLink
        :to="routes(`/products/${slug}`)"
        class="group/title w-fit"
      >
        <h3 class="text-2xl font-extrabold tracking-tight text-white group-hover/title:underline underline-offset-4 md:text-3xl">
          {{ name }}
        </h3>
      </NuxtLink>

      <NuxtLink
        :to="routes(`/products/${slug}`)"
        class="line-clamp-3 flex-1 text-base leading-relaxed text-white/85"
      >
        {{ description }}
      </NuxtLink>

      <div
        v-if="tags.length > 0 || series"
        class="mt-auto flex flex-wrap items-center gap-1.5 pt-1"
      >
        <NuxtLink
          v-if="series"
          :to="`${routes('/products')}?series=${encodeURIComponent(series)}`"
          class="badge border-white/30 bg-white/20 text-white transition-colors hover:bg-white/30"
        >
          {{ series }}
        </NuxtLink>
        <NuxtLink
          v-for="tag in tags.slice(0, 4)"
          :key="tag"
          :to="`${routes('/products')}?tag=${encodeURIComponent(tag)}`"
          class="badge border-white/40 text-white/90 transition-colors hover:border-white hover:bg-white/15"
        >
          {{ tag }}
        </NuxtLink>
        <span v-if="tags.length > 4" class="badge badge-ghost text-white/70">
          +{{ tags.length - 4 }}
        </span>
      </div>
    </div>

    <!-- Vertical-only tags footer -->
    <div
      v-else-if="tags.length > 0 || series"
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

<style scoped>
.brand-panel {
  /* Filled with the product's primary color (preset, then extracted
     from the visual once it loads) */
  background: var(--brand);
}
</style>
