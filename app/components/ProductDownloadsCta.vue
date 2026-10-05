<script setup lang="ts">
import { Download } from "@lucide/vue"
import type { ProductRelease } from "~/types/release"

const props = defineProps<{
  slug: string
  productTitle?: string
}>()

const { t, locale } = useI18n()
const localePath = useLocalePath()

const releasesHref = computed(() => localePath(`/products/${props.slug}/releases`))
const latest = ref<ProductRelease | null>(null)

const platforms = computed(() => {
  const labels = new Set<string>()
  for (const artifact of latest.value?.artifacts ?? []) {
    if (artifact.expired || !artifact.download_url) continue
    const label = artifactPlatformLabel(artifact.platform)
    if (label) labels.add(label)
  }
  return [...labels]
})

const releasedLabel = computed(() => {
  const value = latest.value?.releasedAt
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString(locale.value === "zh" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
})

onMounted(async () => {
  try {
    const data = await $fetch<{ releases: ProductRelease[] }>(
      `/api/products/${encodeURIComponent(props.slug)}/releases?limit=1`,
    )
    latest.value = data.releases[0] ?? null
  } catch {
    latest.value = null
  }
})
</script>

<template>
  <section id="download" class="container mx-auto px-4 py-16 scroll-mt-24">
    <div class="rounded-2xl border border-base-content/5 bg-base-200/60 p-6 sm:p-9">
      <ExpressMark />

      <h2 class="mt-6 text-3xl font-bold tracking-tight md:text-4xl">
        {{ productTitle ? t("productDownloadsCta.title", { product: productTitle }) : t("releasePage.downloads") }}
      </h2>
      <p class="mt-3 max-w-2xl leading-relaxed opacity-70">
        {{ t("productDownloadsCta.body") }}
      </p>

      <div class="mt-6 flex min-h-7 flex-wrap items-center gap-2">
        <template v-if="latest">
          <span class="badge badge-ghost badge-sm font-mono">
            {{ t("releasePage.latest") }} · v{{ latest.version }}
          </span>
          <span v-if="releasedLabel" class="text-xs tabular-nums opacity-55">{{ releasedLabel }}</span>
          <span v-for="label in platforms" :key="label" class="badge badge-outline badge-sm">
            {{ label }}
          </span>
        </template>
      </div>

      <NuxtLink :to="releasesHref" class="btn btn-primary rounded-full mt-7 gap-2">
        <Download class="w-4 h-4" aria-hidden="true" />
        {{ t("releasePage.downloads") }}
      </NuxtLink>
    </div>
  </section>
</template>
