<script setup lang="ts">
import { Plus, RefreshCw, ExternalLink, CheckCircle, XCircle, Clock } from "@lucide/vue"

definePageMeta({
  layout: "admin",
})

const { t, locale } = useI18n()
const route = useRoute()
const slug = computed(() => route.params.slug as string)
const localePath = useLocalePath()

const { data: product } = await useAsyncData(`admin-product-${slug.value}`, async () => {
  const p = await queryCollection("products")
    .where("path", "LIKE", `%/products/%/${slug.value}`)
    .first()
  return p
})

const { data: releases, refresh } = await useAsyncData(`admin-releases-${slug.value}`, async () => {
  const data = await $fetch(`/api/products/${slug.value}/releases`, {
    query: { limit: 100 },
  })
  return data.releases
})

async function handleSync(release: any) {
  await $fetch(`/api/products/${slug.value}/releases/${release.version}/sync`, {
    method: "POST",
  })
  await refresh()
}

function goToCreate() {
  navigateTo(localePath(`/admin/products/${slug.value}/releases/new`))
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font bold">
          {{ t("admin.products.releases") }}
          <span class="text-base font-normal opacity-60">/ {{ product?.title || slug }}</span>
        </h1>
      </div>
      <button class="btn btn-primary btn-sm gap-2" @click="goToCreate">
        <Plus class="w-4 h-4" />
        {{ t("admin.products.addRelease") }}
      </button>
    </div>

    <div v-if="releases?.length" class="space-y-3">
      <div
        v-for="release in releases"
        :key="release.id"
        class="card bg-base-100 border border-base-200 p-4"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="font-bold">v{{ release.version }}</span>
              <span v-if="release.isPrerelease" class="badge badge-warning badge-xs">
                Pre-release
              </span>
              <span
                v-if="release.githubSyncStatus === 'synced'"
                class="badge badge-success badge-xs gap-1"
              >
                <CheckCircle class="w-3 h-3" />
                Synced
              </span>
              <span
                v-else-if="release.githubSyncStatus === 'failed'"
                class="badge badge-error badge-xs gap-1"
              >
                <XCircle class="w-3 h-3" />
                Sync Failed
              </span>
              <span
                v-else
                class="badge badge-neutral badge-xs gap-1"
              >
                <Clock class="w-3 h-3" />
                Pending
              </span>
            </div>
            <p v-if="release.title" class="text-sm">{{ release.title }}</p>
            <p class="text-xs opacity-50 mt-1">
              Released {{ new Date(release.releasedAt).toLocaleDateString() }}
            </p>
            <p v-if="release.githubSyncError" class="text-xs text-error mt-1">
              {{ release.githubSyncError }}
            </p>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <NuxtLink
              :to="localePath(`/admin/products/${slug}/releases/${release.version}/edit`)"
              class="btn btn-sm btn-outline"
            >
              Edit
            </NuxtLink>
            <button
              v-if="release.githubSyncStatus === 'failed' && (product?.githubRepo || product?.repo)"
              class="btn btn-sm btn-ghost gap-1"
              @click="handleSync(release)"
            >
              <RefreshCw class="w-3 h-3" />
              Retry
            </button>
            <a
              v-if="release.githubReleaseUrl"
              :href="release.githubReleaseUrl"
              target="_blank"
              class="btn btn-sm btn-ghost"
            >
              <ExternalLink class="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-12">
      <p class="opacity-60 mb-4">{{ t("releases.noReleases") }}</p>
      <button class="btn btn-primary btn-sm gap-2" @click="goToCreate">
        <Plus class="w-4 h-4" />
        {{ t("admin.products.addRelease") }}
      </button>
    </div>
  </div>
</template>
