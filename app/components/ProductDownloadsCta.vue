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
  return new Intl.DateTimeFormat(locale.value === "zh" ? "zh-CN" : "en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date)
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
  <section id="download" class="downloads">
    <div class="shell">
      <div class="downloads-panel">
        <div class="downloads-copy">
          <h2 class="downloads-title">
            {{ productTitle ? t("productDownloadsCta.title", { product: productTitle }) : t("releasePage.downloads") }}
          </h2>
          <p class="downloads-body">
            {{ t("productDownloadsCta.body") }}
          </p>

          <!-- Latest release facts print as one mono line, the way a build
               stamp does: version, date, platforms. -->
          <p v-if="latest" class="downloads-facts mono">
            <span>v{{ latest.version }}</span>
            <span v-if="releasedLabel" class="fact-sep" aria-hidden="true">/</span>
            <span v-if="releasedLabel">{{ releasedLabel }}</span>
            <template v-if="platforms.length">
              <span class="fact-sep" aria-hidden="true">/</span>
              <span>{{ platforms.join(", ") }}</span>
            </template>
          </p>
        </div>

        <div class="downloads-action">
          <NuxtLink :to="releasesHref" class="btn btn-primary">
            <Download class="action-icon" aria-hidden="true" />
            {{ t("productDownloadsCta.browse") }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.downloads {
  margin-top: 3rem;
}

.downloads-panel {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 1.75rem;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-card);
  background: color-mix(in oklab, var(--color-base-200) 55%, transparent);
}

.downloads-copy {
  min-width: 0;
  max-width: 34rem;
}

.downloads-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.015em;
}

.downloads-body {
  margin: 0.5rem 0 0;
  font-size: 0.9375rem;
  line-height: 1.6;
  color: var(--color-dim);
}

.downloads-facts {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
  margin: 0.85rem 0 0;
  color: var(--color-faint);
}

.fact-sep {
  color: var(--color-line);
}

.downloads-action {
  flex-shrink: 0;
}

.action-icon {
  width: 0.9375rem;
  height: 0.9375rem;
}
</style>
