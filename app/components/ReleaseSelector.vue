<script setup lang="ts">
import { ChevronDown, Tag } from "@lucide/vue"
import type { ProductRelease } from "~/composables/useProductReleases"

const props = defineProps<{
  releases: ProductRelease[]
  selectedVersion?: string | null
  label?: string
}>()

const { t } = useI18n()

const emit = defineEmits<{
  select: [version: string]
}>()

function handleChange(event: Event) {
  const version = (event.target as HTMLSelectElement).value
  if (version) emit("select", version)
}
</script>

<template>
  <label v-if="props.releases.length > 1" class="flex items-center gap-2">
    <Tag class="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
    <span class="sr-only">{{ props.label || "Version" }}</span>
    <span class="text-xs uppercase tracking-wide opacity-55 hidden sm:inline">{{ props.label || "Version" }}</span>
    <span class="relative inline-flex items-center">
      <select
        class="select select-bordered select-sm min-w-32 pr-8 font-mono text-xs"
        :value="props.selectedVersion || ''"
        :aria-label="props.label || 'Version'"
        @change="handleChange"
      >
        <option v-for="release in props.releases" :key="release.id" :value="release.version">
          v{{ release.version }}{{ release.artifactsExpired ? ` · ${t("releases.expired")}` : "" }}
        </option>
      </select>
      <ChevronDown class="pointer-events-none absolute right-2 w-3.5 h-3.5 opacity-50" aria-hidden="true" />
    </span>
  </label>
</template>
