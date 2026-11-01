<script setup lang="ts">
import { CheckCircle, XCircle, Eye } from '@lucide/vue'

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

const { t } = useI18n()
const route = useRoute()

const statusFilter = computed(() => route.query.status as string || '')
const contestFilter = computed(() => route.query.contest as string || '')

const { data, refresh } = await useAsyncData('admin-submissions', () => {
  const query: Record<string, string> = {}
  if (statusFilter.value) query.status = statusFilter.value
  if (contestFilter.value) query.contest_id = contestFilter.value
  return useRequestFetch()('/api/admin/contests/submissions', { query })
})

const { data: contests } = await useAsyncData('admin-contests-list', async () => {
  const allContests = await queryCollection('contests')
    .where('path', 'LIKE', '/contests/en/%')
    .all()
  return allContests.map(c => ({
    slug: c.path.replace('/contests/en/', ''),
    title: c.title,
  }))
})

async function reviewSubmission(id: string, action: string) {
  try {
    await $fetch(`/api/admin/contests/submissions/${id}`, {
      method: 'PATCH',
      body: { action },
    })
    await refresh()
  }
  catch {
    // silent fail
  }
}

function statusTone(status: string) {
  if (status === 'pending') return 'tone-warn'
  if (status === 'accepted') return 'tone-ok'
  if (status === 'rejected') return 'tone-bad'
  return ''
}

function setFilter(key: 'status' | 'contest', value: string) {
  const query: Record<string, string> = {}
  const nextStatus = key === 'status' ? value : statusFilter.value
  const nextContest = key === 'contest' ? value : contestFilter.value
  if (nextStatus) query.status = nextStatus
  if (nextContest) query.contest = nextContest
  navigateTo({ path: '/admin/contests/submissions', query })
}
</script>

<template>
  <div>
    <div class="admin-head">
      <h2 class="admin-h">
        {{ t('admin.contests.review') }}
      </h2>
    </div>

    <div v-if="data?.stats" class="stat-row">
      <div class="stat">
        <span class="stat-label">{{ t('admin.contests.pending') }}</span>
        <span class="stat-figure">{{ data.stats.pending || 0 }}</span>
      </div>
      <div class="stat">
        <span class="stat-label">{{ t('admin.contests.accepted') }}</span>
        <span class="stat-figure">{{ data.stats.accepted || 0 }}</span>
      </div>
      <div class="stat">
        <span class="stat-label">{{ t('admin.contests.rejected') }}</span>
        <span class="stat-figure">{{ data.stats.rejected || 0 }}</span>
      </div>
      <div class="stat">
        <span class="stat-label">{{ t('admin.contests.total') }}</span>
        <span class="stat-figure">{{ data.stats.total || 0 }}</span>
      </div>
    </div>

    <div class="filters">
      <label class="filter">
        <span class="field-label">{{ t('admin.contests.status') }}</span>
        <select
          class="select select-sm"
          :value="statusFilter"
          @change="setFilter('status', ($event.target as HTMLSelectElement).value)"
        >
          <option value="">{{ t('admin.contests.all') }}</option>
          <option value="pending">{{ t('admin.contests.pending') }}</option>
          <option value="accepted">{{ t('admin.contests.accepted') }}</option>
          <option value="rejected">{{ t('admin.contests.rejected') }}</option>
        </select>
      </label>
      <label class="filter">
        <span class="field-label">{{ t('admin.contests.contest') }}</span>
        <select
          class="select select-sm"
          :value="contestFilter"
          @change="setFilter('contest', ($event.target as HTMLSelectElement).value)"
        >
          <option value="">{{ t('admin.contests.allContests') }}</option>
          <option v-for="c in (contests || [])" :key="c.slug" :value="c.slug">{{ c.title }}</option>
        </select>
      </label>
    </div>

    <div v-if="data?.submissions?.length" class="table-wrap">
      <table class="ledger">
        <thead>
          <tr>
            <th>{{ t('admin.contests.submission') }}</th>
            <th>{{ t('admin.contests.status') }}</th>
            <th>{{ t('admin.contests.contest') }}</th>
            <th>{{ t('admin.contests.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="sub in data.submissions" :key="sub.id">
            <td>
              <div class="cell-main">
                <p class="cell-title">{{ sub.data?.title }}</p>
                <p v-if="sub.data?.description" class="cell-sub">{{ sub.data?.description }}</p>
                <div class="cell-meta">
                  <a
                    v-if="sub.data?.repo_url"
                    :href="sub.data.repo_url"
                    target="_blank"
                    rel="noopener"
                    class="link-quiet"
                  >{{ t('admin.contests.repository') }}</a>
                  <span v-if="sub.author" class="cell-author">
                    <img
                      v-if="sub.author.avatar"
                      :src="sub.author.avatar"
                      :alt="sub.author.name"
                      class="avatar"
                    >
                    <a
                      v-if="sub.author.solarAccountId"
                      :href="`https://id.solian.app/@${sub.author.name}`"
                      target="_blank"
                      rel="noopener"
                      class="link-quiet"
                    >@{{ sub.author.name }}</a>
                    <template v-else>{{ sub.author.name }}</template>
                  </span>
                </div>
                <p v-if="sub.reviewNote" class="cell-note">
                  "{{ sub.reviewNote }}"
                </p>
              </div>
            </td>
            <td>
              <span class="status" :class="statusTone(sub.status)">
                <span class="dot" aria-hidden="true" />
                {{ sub.status }}
              </span>
            </td>
            <td class="mono">{{ sub.contestId }}</td>
            <td>
              <div class="row-actions">
                <NuxtLink
                  :to="`/admin/contests/${sub.contestId}`"
                  class="btn btn-xs"
                  :title="t('admin.contests.viewContest')"
                >
                  <Eye class="btn-icon" aria-hidden="true" />
                </NuxtLink>
                <button
                  v-if="sub.status !== 'accepted'"
                  class="btn btn-xs"
                  :title="t('admin.contests.accepted')"
                  @click="reviewSubmission(sub.id, 'accepted')"
                >
                  <CheckCircle class="btn-icon" aria-hidden="true" />
                </button>
                <button
                  v-if="sub.status !== 'rejected'"
                  class="btn btn-xs"
                  :title="t('admin.contests.rejected')"
                  @click="reviewSubmission(sub.id, 'rejected')"
                >
                  <XCircle class="btn-icon" aria-hidden="true" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-else class="empty">
      {{ t('admin.contests.noPending') }}
    </p>
  </div>
</template>

<style scoped>
.admin-head {
  margin-bottom: 1.25rem;
}

.admin-h {
  margin: 0;
  font-size: 1.375rem;
  font-weight: 700;
  letter-spacing: -0.02em;
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
  font-family: var(--font-mono);
  font-size: 1.375rem;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.filter {
  flex: 1 1 12rem;
  max-width: 16rem;
}

.table-wrap {
  overflow-x: auto;
}

.cell-main {
  min-width: 12rem;
}

.cell-title {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 600;
}

.cell-sub {
  margin: 0.1rem 0 0;
  font-size: 0.8125rem;
  color: var(--color-faint);
}

.cell-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.35rem;
  font-size: 0.75rem;
  color: var(--color-faint);
}

.cell-author {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.avatar {
  width: 0.875rem;
  height: 0.875rem;
  border-radius: 999px;
  object-fit: cover;
}

.cell-note {
  margin: 0.35rem 0 0;
  font-size: 0.8125rem;
  color: var(--color-faint);
  font-style: italic;
}

.status {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.status .dot {
  background: currentColor;
}

.tone-ok {
  color: var(--color-success);
}

.tone-warn {
  color: var(--color-warning);
}

.tone-bad {
  color: var(--color-error);
}

.row-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.3rem;
}

.btn-icon {
  width: 0.8125rem;
  height: 0.8125rem;
}

.empty {
  margin: 0;
  padding: 1.5rem 0;
  font-size: 0.8125rem;
  color: var(--color-faint);
}

@media (min-width: 640px) {
  .stat-row {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>
