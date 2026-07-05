<script setup lang="ts">
import { Calendar, Download, ExternalLink, AlertCircle } from "@lucide/vue"

interface Props {
  version: string
  title?: string | null
  releasedAt: Date | string
  changelog?: string
  downloadUrl?: string | null
  githubReleaseUrl?: string | null
  isPrerelease?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  changelog: "",
  isPrerelease: false,
})

const { t, d } = useI18n()

const formattedDate = computed(() => {
  const date = new Date(props.releasedAt)
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
})
</script>

<template>
  <div class="card bg-base-100 border border-base-200 p-5">
    <div class="flex items-start justify-between gap-4 mb-3">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="text-lg font-bold">v{{ version }}</span>
          <span
            v-if="isPrerelease"
            class="badge badge-warning badge-xs"
          >
            {{ t("releases.prerelease") }}
          </span>
        </div>
        <p v-if="title" class="text-sm opacity-80">{{ title }}</p>
      </div>
      <div class="flex items-center gap-1.5 text-sm opacity-60 shrink-0">
        <Calendar class="w-3.5 h-3.5" />
        <time :datetime="new Date(releasedAt).toISOString()">{{ formattedDate }}</time>
      </div>
    </div>

    <div v-if="changelog" class="prose prose-sm max-w-none mb-4">
      <div class="text-sm opacity-80 whitespace-pre-wrap">{{ changelog }}</div>
    </div>

    <div v-if="downloadUrl || githubReleaseUrl" class="flex gap-2">
      <a
        v-if="downloadUrl"
        :href="downloadUrl"
        target="_blank"
        class="btn btn-sm btn-primary"
      >
        <Download class="w-3.5 h-3.5" />
        {{ t("releases.download") }}
      </a>
      <a
        v-if="githubReleaseUrl"
        :href="githubReleaseUrl"
        target="_blank"
        class="btn btn-sm btn-outline"
      >
        <ExternalLink class="w-3.5 h-3.5" />
        {{ t("releases.viewOnGitHub") }}
      </a>
    </div>
  </div>
</template>
