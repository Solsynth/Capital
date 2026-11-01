<script setup lang="ts">
import {
  FileCheck,
  Clock,
  RefreshCw,
  Users,
} from '@lucide/vue'

const { locale } = useI18n()
const localePath = useLocalePath()
const lang = computed(() => locale.value)
const isZh = computed(() => lang.value === 'zh')

definePageMeta({ layout: 'admin', middleware: 'auth' })
useHead({ title: computed(() => isZh.value ? '贡献管理' : 'Contributions Admin') })

// Stats
const { data: stats, refresh: refreshStats } = await useAsyncData('admin-contrib-stats', () =>
  useRequestFetch()<any>('/api/admin/contrib/stats'),
)

// Pending checks
const { data: pendingData, refresh: refreshPending, status: pendingStatus } = await useAsyncData('admin-contrib-pending', () =>
  useRequestFetch()<any>('/api/admin/contrib/pending?status=pending'),
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
    <div class="head">
      <div>
        <h2 class="admin-h">
          {{ isZh ? '贡献管理' : 'Contributions' }}
        </h2>
        <p class="admin-sub">
          {{ isZh ? '查看贡献统计、CLA 签署情况与待处理的 PR。' : 'Contribution totals, CLA signatures, and pull requests waiting on a signature.' }}
        </p>
      </div>
      <div class="head-actions">
        <button
          class="btn btn-sm"
          :disabled="backfilling"
          @click="backfillSolar"
        >
          <RefreshCw class="btn-icon" :class="{ 'is-spinning': backfilling }" aria-hidden="true" />
          {{ isZh ? '缓存 Solar 用户名' : 'Backfill Solar names' }}
        </button>
        <NuxtLink :to="localePath('/admin/contributions/cla')" class="btn btn-sm">
          <FileCheck class="btn-icon" aria-hidden="true" />
          {{ isZh ? '查看 CLA 签署' : 'CLA signatures' }}
        </NuxtLink>
      </div>
    </div>

    <div class="stat-row">
      <div class="stat">
        <span class="stat-label">{{ isZh ? '追踪用户' : 'Tracked users' }}</span>
        <span class="stat-figure">
          <Users class="stat-icon" aria-hidden="true" />
          {{ stats?.totalTrackedUsers ?? 0 }}
        </span>
      </div>
      <div class="stat">
        <span class="stat-label">{{ isZh ? '当前版本 CLA' : 'Current CLA' }}</span>
        <span class="stat-figure">
          <FileCheck class="stat-icon" aria-hidden="true" />
          {{ stats?.currentSignatures ?? 0 }}
        </span>
      </div>
      <div class="stat">
        <span class="stat-label">{{ isZh ? '总签署数' : 'Total signatures' }}</span>
        <span class="stat-figure">
          <FileCheck class="stat-icon" aria-hidden="true" />
          {{ stats?.totalSignatures ?? 0 }}
        </span>
      </div>
      <div class="stat">
        <span class="stat-label">{{ isZh ? '待处理 PR' : 'Pending PRs' }}</span>
        <span class="stat-figure">
          <Clock class="stat-icon" aria-hidden="true" />
          {{ stats?.pendingChecks ?? 0 }}
        </span>
      </div>
    </div>

    <p v-if="backfillResult" class="note note-success mb-4">
      {{ isZh ? `已更新 ${backfillResult.updated} / ${backfillResult.total} 个用户的 Solar 用户名` : `Updated ${backfillResult.updated} / ${backfillResult.total} users with Solar usernames` }}
    </p>
    <p v-if="resetResult && !resetResult.startsWith('Error')" class="note note-success mb-4">
      {{ isZh ? `已重置 ${resetResult} 的冷却` : `Cooldown reset for ${resetResult}` }}
    </p>
    <p v-else-if="resetResult" class="note note-error mb-4">
      {{ resetResult }}
    </p>

    <section class="queue">
      <div class="queue-head">
        <h3 class="queue-title">
          {{ isZh ? '等待 CLA 的 PR' : 'PRs waiting for a CLA' }}
        </h3>
        <button class="btn btn-xs" @click="refreshPending()">
          <RefreshCw class="btn-icon" aria-hidden="true" />
          {{ isZh ? '刷新' : 'Refresh' }}
        </button>
      </div>

      <div v-if="pendingStatus === 'pending'" class="loading-rows">
        <span class="skeleton sk-row" />
        <span class="skeleton sk-row" />
        <span class="skeleton sk-row" />
      </div>

      <div v-else-if="pendingData?.checks?.length" class="table-wrap">
        <table class="ledger">
          <thead>
            <tr>
              <th>GitHub</th>
              <th>{{ isZh ? '仓库' : 'Repository' }}</th>
              <th>PR</th>
              <th>{{ isZh ? '创建时间' : 'Created' }}</th>
              <th>{{ isZh ? '操作' : 'Actions' }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="check in pendingData.checks" :key="check.id">
              <td>{{ check.githubUsername }}</td>
              <td class="mono">
                {{ check.repoOwner }}/{{ check.repoName }}
              </td>
              <td>
                <a
                  :href="`https://github.com/${check.repoOwner}/${check.repoName}/pull/${check.prNumber}`"
                  target="_blank"
                  rel="noopener"
                  class="link-quiet mono"
                >
                  #{{ check.prNumber }}
                </a>
              </td>
              <td class="mono">
                {{ new Date(check.createdAt).toLocaleDateString() }}
              </td>
              <td>
                <div class="row-actions">
                  <button
                    class="btn btn-xs"
                    :disabled="resetting === check.githubUsername"
                    @click="resetCooldown(check.githubUsername)"
                  >
                    <RefreshCw class="btn-icon" :class="{ 'is-spinning': resetting === check.githubUsername }" aria-hidden="true" />
                    {{ isZh ? '重置冷却' : 'Reset cooldown' }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-else class="empty">
        {{ isZh ? '没有等待中的 PR。' : 'No pull requests are waiting on a signature.' }}
      </p>
    </section>
  </div>
</template>

<style scoped>
.head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.admin-h {
  margin: 0;
  font-size: 1.375rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.admin-sub {
  max-width: 40rem;
  margin: 0.35rem 0 0;
  font-size: 0.8125rem;
  color: var(--color-faint);
}

.head-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.btn-icon {
  width: 0.875rem;
  height: 0.875rem;
}

.is-spinning {
  animation: spin 900ms linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.stat-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1px;
  overflow: hidden;
  margin-bottom: 1.5rem;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-card);
  background: var(--color-line-soft);
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 0.9rem 1rem;
  background: var(--color-base-100);
}

.stat-label {
  font-size: 0.8125rem;
  color: var(--color-faint);
}

.stat-figure {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-family: var(--font-mono);
  font-size: 1.375rem;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

.stat-icon {
  width: 0.875rem;
  height: 0.875rem;
  color: var(--color-primary);
}

.queue-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding-bottom: 0.6rem;
}

.queue-title {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 600;
}

.table-wrap {
  overflow-x: auto;
}

.loading-rows {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-top: 0.5rem;
}

.sk-row {
  height: 2.25rem;
}

.row-actions {
  display: flex;
  justify-content: flex-end;
}

.empty {
  margin: 0;
  padding: 1.25rem 0;
  font-size: 0.8125rem;
  color: var(--color-faint);
}

@media (min-width: 640px) {
  .stat-row {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>
