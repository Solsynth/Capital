<script setup lang="ts">
import { Calendar, Download } from "@lucide/vue"
import { renderMarkdown } from "~/utils/marked"

interface Props {
  version: string
  title?: string | null
  releasedAt: Date | string | null
  changelog?: string
  downloadUrl?: string | null
  isPrerelease?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  changelog: "",
  isPrerelease: false,
})

const { t, locale } = useI18n()

const formattedDate = computed(() => {
  if (!props.releasedAt) return null
  const date = new Date(props.releasedAt)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString(locale.value === "zh" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
})

const renderedChangelog = computed(() => renderMarkdown(props.changelog))
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
      <div
        v-if="formattedDate"
        class="flex items-center gap-1.5 text-sm opacity-60 shrink-0"
      >
        <Calendar class="w-3.5 h-3.5" />
        <time :datetime="new Date(releasedAt || '').toISOString()">{{ formattedDate }}</time>
      </div>
    </div>

    <div
      v-if="renderedChangelog"
      class="prose prose-sm max-w-none mb-4 max-h-48 overflow-y-auto"
      v-html="renderedChangelog"
    />

    <div v-if="downloadUrl" class="flex gap-2">
      <a
        :href="downloadUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="btn btn-sm btn-primary"
      >
        <Download class="w-3.5 h-3.5" />
        {{ t("releases.download") }}
      </a>
    </div>
  </div>
</template>
