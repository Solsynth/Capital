export interface ClaStatus {
  signed: boolean
  githubConnected: boolean
  githubUsername: string | null
  prCount: number
  issueCount: number
  commitCount: number
  signature?: {
    signedAt: string
    claVersion: string
  }
}

export function useContribution() {
  const status = ref<ClaStatus | null>(null)
  const loading = ref(false)
  const refreshing = ref(false)
  const error = ref<string | null>(null)

  async function refresh() {
    loading.value = true
    error.value = null
    try {
      const result = await $fetch<ClaStatus>('/api/contribution/profile')
      status.value = result
    } catch (e: any) {
      error.value = e?.data?.statusMessage || e?.message || 'Failed to fetch CLA status'
    } finally {
      loading.value = false
    }
  }

  async function refreshStats() {
    refreshing.value = true
    error.value = null
    try {
      const result = await $fetch<any>('/api/contribution/refresh', { method: 'POST' })
      if (status.value) {
        status.value.prCount = result.prCount
        status.value.issueCount = result.issueCount
        status.value.commitCount = result.commitCount
      }
    } catch (e: any) {
      error.value = e?.data?.statusMessage || e?.message || 'Failed to refresh stats'
    } finally {
      refreshing.value = false
    }
  }

  async function sign() {
    loading.value = true
    error.value = null
    try {
      await $fetch('/api/contribution/cla-sign', { method: 'POST' })
      await refresh()
    } catch (e: any) {
      error.value = e?.data?.statusMessage || e?.message || 'Failed to sign CLA'
    } finally {
      loading.value = false
    }
  }

  return { status, loading, refreshing, error, refresh, refreshStats, sign }
}
