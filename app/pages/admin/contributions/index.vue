<script setup lang="ts">
import {
  GitPullRequest,
  FileCheck,
  Clock,
  Loader2,
  RefreshCw,
  Users,
  Search,
} from '@lucide/vue'

const { locale } = useI18n()
const localePath = useLocalePath()
const lang = computed(() => locale.value)
const isZh = computed(() => lang.value === 'zh')

definePageMeta({ layout: 'admin', middleware: 'auth' })
useHead({ title: computed(() => isZh.value ? '贡献管理' : 'Contributions Admin') })

// Stats
const { data: stats, refresh: refreshStats } = await useAsyncData('admin-contrib-stats', () =>
  $fetch<any>('/api/admin/contrib/stats'),
)

// Pending checks
const { data: pendingData, refresh: refreshPending, status: pendingStatus } = await useAsyncData('admin-contrib-pending', () =>
  $fetch<any>('/api/admin/contrib/pending?status=pending'),
)

// Reset cooldown
const resetting = ref<string | null>(null)
const resetResult = ref<string | null>(null)

async function resetCooldown(username: string) {
  resetting.value = username
  resetResult.value = null
  try {
    await $fetch('/api/admin/contrib/reset-cooldown', {
      method: 'POST',
      body: { githubUsername: username },
    })
    resetResult.value = username
    await refreshStats()
  } catch (e: any) {
    resetResult.value = `Error: ${e?.data?.statusMessage || e?.message}`
  } finally {
    resetting.value = null
  }
}

// Force refresh all pending
const batchRefreshing = ref(false)
async function batchRefresh() {
  batchRefreshing.value = true
  try {
    // TODO: batch re-check endpoint
    await refreshPending()
  } finally {
    batchRefreshing.value = false
  }
}

// Backfill Solar usernames
const backfilling = ref(false)
const backfillResult = ref<{ total: number; updated: number } | null>(null)
async function backfillSolar() {
  backfilling.value = true
  backfillResult.value = null
  try {
    backfillResult.value = await $fetch('/api/admin/contrib/backfill-solar', { method: 'POST' })
    await refreshStats()
  } catch {} finally {
    backfilling.value = false
  }
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold">
        {{ isZh ? '贡献管理' : 'Contributions' }}
      </h2>
      <div class="flex gap-2">
        <button
          class="btn btn-sm btn-outline gap-2"
          :disabled="backfilling"
          @click="backfillSolar"
        >
          <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': backfilling }" />
          {{ isZh ? '缓存 Solar 用户名' : 'Backfill Solar Names' }}
        </button>
        <NuxtLink :to="localePath('/admin/contributions/cla')" class="btn btn-sm btn-ghost gap-2">
          <FileCheck class="w-4 h-4" />
          {{ isZh ? '查看 CLA 签署' : 'View CLA Signatures' }}
        </NuxtLink>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div class="card bg-base-200/60 border border-base-content/5 p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Users class="w-5 h-5 text-primary" />
          </div>
          <div>
            <p class="text-2xl font-bold tabular-nums">{{ stats?.totalTrackedUsers ?? 0 }}</p>
            <p class="text-xs opacity-50">{{ isZh ? '追踪用户' : 'Tracked Users' }}</p>
          </div>
        </div>
      </div>

      <div class="card bg-base-200/60 border border-base-content/5 p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
            <FileCheck class="w-5 h-5 text-success" />
          </div>
          <div>
            <p class="text-2xl font-bold tabular-nums">{{ stats?.currentSignatures ?? 0 }}</p>
            <p class="text-xs opacity-50">{{ isZh ? '当前版本 CLA' : 'Current CLA' }}</p>
          </div>
        </div>
      </div>

      <div class="card bg-base-200/60 border border-base-content/5 p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
            <FileCheck class="w-5 h-5 text-info" />
          </div>
          <div>
            <p class="text-2xl font-bold tabular-nums">{{ stats?.totalSignatures ?? 0 }}</p>
            <p class="text-xs opacity-50">{{ isZh ? '总签署数' : 'Total Signatures' }}</p>
          </div>
        </div>
      </div>

      <div class="card bg-base-200/60 border border-base-content/5 p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
            <Clock class="w-5 h-5 text-warning" />
          </div>
          <div>
            <p class="text-2xl font-bold tabular-nums">{{ stats?.pendingChecks ?? 0 }}</p>
            <p class="text-xs opacity-50">{{ isZh ? '待处理 PR' : 'Pending PRs' }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Backfill result -->
    <div v-if="backfillResult" class="alert alert-success mb-6 text-sm">
      <span>{{ isZh ? `已更新 ${backfillResult.updated} / ${backfillResult.total} 个用户的 Solar 用户名` : `Updated ${backfillResult.updated} / ${backfillResult.total} users with Solar usernames` }}</span>
    </div>
    <div class="card bg-base-200/60 border border-base-content/5">
      <div class="flex items-center justify-between p-4 border-b border-base-content/5">
        <h3 class="font-semibold text-sm">
          {{ isZh ? '等待 CLA 的 PR' : 'PRs Waiting for CLA' }}
        </h3>
        <button class="btn btn-xs btn-ghost gap-1" @click="refreshPending()">
          <RefreshCw class="w-3 h-3" />
          {{ isZh ? '刷新' : 'Refresh' }}
        </button>
      </div>

      <div v-if="pendingStatus === 'pending'" class="flex justify-center py-8">
        <Loader2 class="w-5 h-5 animate-spin text-primary" />
      </div>

      <div v-else-if="pendingData?.checks?.length" class="overflow-x-auto">
        <table class="table table-sm">
          <thead>
            <tr class="text-xs opacity-60">
              <th>GitHub</th>
              <th>Repo</th>
              <th>PR</th>
              <th>{{ isZh ? '创建时间' : 'Created' }}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="check in pendingData.checks" :key="check.id" class="hover:bg-base-200/50">
              <td class="text-sm font-medium">{{ check.githubUsername }}</td>
              <td class="text-sm opacity-70">{{ check.repoOwner }}/{{ check.repoName }}</td>
              <td>
                <a
                  :href="`https://github.com/${check.repoOwner}/${check.repoName}/pull/${check.prNumber}`"
                  target="_blank"
                  rel="noopener"
                  class="link link-primary text-sm"
                >
                  #{{ check.prNumber }}
                </a>
              </td>
              <td class="text-xs opacity-50">{{ new Date(check.createdAt).toLocaleDateString() }}</td>
              <td>
                <button
                  class="btn btn-xs btn-ghost gap-1"
                  :disabled="resetting === check.githubUsername"
                  @click="resetCooldown(check.githubUsername)"
                >
                  <RefreshCw class="w-3 h-3" :class="{ 'animate-spin': resetting === check.githubUsername }" />
                  {{ isZh ? '重置冷却' : 'Reset Cooldown' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="text-center py-8 opacity-50 text-sm">
        {{ isZh ? '没有等待中的 PR' : 'No pending PRs' }}
      </div>
    </div>
  </div>
</template>
