import type { Ref } from "vue"

interface Release {
  id: string
  slug: string
  version: string
  releasedAt: Date
  title: string | null
  changelog: string
  downloadUrl: string | null
  githubReleaseUrl: string | null
  isPrerelease: boolean
  minimumVersion: string | null
  createdAt: Date
  updatedAt: Date
}

export function useProductReleases(slug: string) {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const releases = ref<Release[]>([])
  const latest = ref<Release | null>(null)

  async function fetchReleases() {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch(`/api/products/${slug}/releases`)
      releases.value = data.releases
    } catch (e: any) {
      error.value = e.message || "Failed to fetch releases"
    } finally {
      loading.value = false
    }
  }

  async function fetchLatest() {
    try {
      const data = await $fetch(`/api/products/${slug}/releases/latest`)
      latest.value = data.release
    } catch {
      latest.value = null
    }
  }

  async function refresh() {
    await Promise.all([fetchReleases(), fetchLatest()])
  }

  return {
    releases: computed(() => releases.value),
    latest: computed(() => latest.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    fetchReleases,
    fetchLatest,
    refresh,
  }
}
