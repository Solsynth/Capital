<script setup lang="ts">
import { CheckCircle, XCircle, Clock, Eye, Filter } from '@lucide/vue'

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
  return $fetch('/api/admin/contests/submissions', { query })
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

function statusIcon(status: string) {
  if (status === 'pending') return Clock
  if (status === 'accepted') return CheckCircle
  if (status === 'rejected') return XCircle
  return Clock
}

function statusColor(status: string) {
  if (status === 'pending') return 'text-warning'
  if (status === 'accepted') return 'text-success'
  if (status === 'rejected') return 'text-error'
  return ''
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold">{{ t('admin.contests.review') }}</h2>
    </div>

    <!-- Quick Stats -->
    <div v-if="data?.stats" class="flex gap-4 mb-6">
      <span class="badge badge-warning">{{ data.stats.pending || 0 }} {{ t('admin.contests.pending') }}</span>
      <span class="badge badge-success">{{ data.stats.accepted || 0 }} {{ t('admin.contests.accepted') }}</span>
      <span class="badge badge-error">{{ data.stats.rejected || 0 }} {{ t('admin.contests.rejected') }}</span>
      <span class="badge">{{ data.stats.total || 0 }} {{ t('admin.contests.total') }}</span>
    </div>

    <!-- Filters -->
    <div class="card bg-base-200 p-4 mb-6">
      <div class="flex flex-wrap items-center gap-4">
        <div class="form-control">
          <label class="label"><span class="label-text">Status</span></label>
          <select
            class="select select-bordered select-sm"
            :value="statusFilter"
            @change="navigateTo(`/admin/contests/submissions?status=${($event.target as HTMLSelectElement).value}`)"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div class="form-control">
          <label class="label"><span class="label-text">Contest</span></label>
          <select
            class="select select-bordered select-sm"
            :value="contestFilter"
            @change="navigateTo(`/admin/contests/submissions?contest=${($event.target as HTMLSelectElement).value}`)"
          >
            <option value="">All Contests</option>
            <option v-for="c in (contests || [])" :key="c.slug" :value="c.slug">{{ c.title }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Submissions Table -->
    <div v-if="data?.submissions?.length" class="space-y-3">
      <div
        v-for="sub in data.submissions"
        :key="sub.id"
        class="card bg-base-200"
      >
        <div class="card-body py-4 px-5">
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2 mb-1">
                <component :is="statusIcon(sub.status)" class="w-4 h-4 shrink-0" :class="statusColor(sub.status)" />
                <span class="font-medium">{{ sub.data?.title }}</span>
              </div>
              <p class="text-sm opacity-70 line-clamp-1">{{ sub.data?.description }}</p>
              <div class="flex items-center gap-3 mt-2 text-xs opacity-50">
                <span v-if="sub.data?.repo_url">
                  <a :href="sub.data.repo_url" target="_blank" class="link link-hover">Repository</a>
                </span>
                <span v-if="sub.author" class="flex items-center gap-1">
                  <img
                    v-if="sub.author.avatar"
                    :src="sub.author.avatar"
                    :alt="sub.author.name"
                    class="w-3.5 h-3.5 rounded-full object-cover"
                  />
                  <a
                    v-if="sub.author.solarAccountId"
                    :href="`https://id.solian.app/@${sub.author.name}`"
                    target="_blank"
                    class="link link-hover"
                  >
                    @{{ sub.author.name }}
                  </a>
                  <template v-else>
                    {{ sub.author.name }}
                  </template>
                </span>
                <span>{{ sub.contestId }}</span>
              </div>
              <div v-if="sub.reviewNote" class="mt-2 text-sm opacity-60 italic">
                "{{ sub.reviewNote }}"
              </div>
            </div>
            <div class="flex flex-col items-end gap-2 shrink-0">
              <span class="badge" :class="{
                'badge-warning': sub.status === 'pending',
                'badge-success': sub.status === 'accepted',
                'badge-error': sub.status === 'rejected',
              }">
                {{ sub.status }}
              </span>
              <div class="flex gap-1">
                <NuxtLink
                  :to="`/admin/contests/${sub.contestId}`"
                  class="btn btn-xs btn-ghost"
                  title="View"
                >
                  <Eye class="w-3 h-3" />
                </NuxtLink>
                <button
                  v-if="sub.status !== 'accepted'"
                  class="btn btn-xs btn-success"
                  title="Accept"
                  @click="reviewSubmission(sub.id, 'accepted')"
                >
                  <CheckCircle class="w-3 h-3" />
                </button>
                <button
                  v-if="sub.status !== 'rejected'"
                  class="btn btn-xs btn-error"
                  title="Reject"
                  @click="reviewSubmission(sub.id, 'rejected')"
                >
                  <XCircle class="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-16 opacity-50">
      <CheckCircle class="w-12 h-12 mx-auto mb-2" />
      <p>{{ t('admin.contests.noPending') }}</p>
    </div>
  </div>
</template>
