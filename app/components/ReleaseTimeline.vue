<script setup lang="ts">
import ReleaseCard from "./ReleaseCard.vue"

interface Release {
  id: string
  version: string
  title?: string | null
  releasedAt: Date | string
  changelog?: string
  downloadUrl?: string | null
  githubReleaseUrl?: string | null
  isPrerelease?: boolean
}

interface Props {
  releases: Release[]
}

defineProps<Props>()
</script>

<template>
  <div class="relative pl-6">
    <!-- Timeline line -->
    <div class="absolute left-2 top-0 bottom-0 w-0.5 bg-base-200" />

    <!-- Timeline items -->
    <div class="space-y-6">
      <div
        v-for="(release, index) in releases"
        :key="release.id"
        class="relative"
      >
        <!-- Timeline dot -->
        <div
          class="absolute -left-6 top-5 w-3 h-3 rounded-full border-2 border-base-100"
          :class="index === 0 ? 'bg-primary' : 'bg-base-300'"
        />

        <ReleaseCard
          :version="release.version"
          :title="release.title"
          :released-at="release.releasedAt"
          :changelog="release.changelog"
          :download-url="release.downloadUrl"
          :github-release-url="release.githubReleaseUrl"
          :is-prerelease="release.isPrerelease"
        />
      </div>
    </div>
  </div>
</template>
