<script setup lang="ts">
import {
  ArrowLeft,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
} from '@lucide/vue'

const { t, locale } = useI18n()
const localePath = useLocalePath()

const lang = computed(() => locale.value)
const isZh = computed(() => lang.value === 'zh')

const pageTitle = computed(() => isZh.value ? '我的提交 - 中羊网备' : 'My Submissions - ROY ICP')

definePageMeta({
  middleware: 'auth',
})

useHead({
  title: pageTitle,
})

interface Submission {
  id: string
  type: 'create' | 'update'
  status: 'pending' | 'approved' | 'rejected'
  site_id: string | null
  data: {
    domain: string
    name: string
    description?: string
    site_url: string
    categories?: string[]
    identity_id?: string
  }
  review_note?: string
  reviewed_at?: string
  created: string
  site_filling_no?: string
  site_name?: string
}

const { data: submissionsData } = await useAsyncData(
  'icp-my-submissions',
  () => $fetch<{ submissions: Submission[] }>('/api/icp/submissions')
)

const submissions = computed(() => submissionsData.value?.submissions ?? [])

function getStatusBadge(status: string) {
  switch (status) {
    case 'pending':
      return 'badge-warning'
    case 'approved':
      return 'badge-success'
    case 'rejected':
      return 'badge-error'
    default:
      return 'badge-ghost'
  }
}

function getStatusLabel(status: string) {
  const labels: Record<string, Record<string, string>> = {
    pending: { en: 'Pending', zh: '待审核' },
    approved: { en: 'Approved', zh: '已通过' },
    rejected: { en: 'Rejected', zh: '已拒绝' },
  }
  return labels[status]?.[isZh.value ? 'zh' : 'en'] || status
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'pending':
      return Clock
    case 'approved':
      return CheckCircle
    case 'rejected':
      return XCircle
    default:
      return FileText
  }
}

function getTypeLabel(type: string) {
  return type === 'create'
    ? (isZh.value ? '新建站点' : 'New Site')
    : (isZh.value ? '更新站点' : 'Update Site')
}
</script>

<template>
  <div class="container mx-auto px-4 py-16 max-w-3xl">
    <NuxtLink
      :to="localePath('/icp')"
      class="btn btn-ghost btn-sm mb-8"
    >
      <ArrowLeft class="w-4 h-4 mr-1" />
      {{ isZh ? '返回目录' : 'Back to Directory' }}
    </NuxtLink>

    <div class="flex items-center justify-between mb-8">
      <div class="flex items-center gap-4">
        <FileText class="w-10 h-10 text-primary" />
        <div>
          <h1 class="text-3xl font-bold">
            {{ isZh ? '我的提交' : 'My Submissions' }}
          </h1>
          <p class="opacity-70">
            {{ isZh ? '查看您的站点提交状态' : 'View your site submission status' }}
          </p>
        </div>
      </div>

      <NuxtLink
        :to="localePath('/icp/submit')"
        class="btn btn-primary"
      >
        <Plus class="w-4 h-4 mr-1" />
        {{ isZh ? '新建提交' : 'New Submission' }}
      </NuxtLink>
    </div>

    <div v-if="submissions.length === 0" class="card bg-base-200 p-12 text-center">
      <FileText class="w-16 h-16 mx-auto mb-4 opacity-30" />
      <p class="text-lg opacity-60 mb-4">
        {{ isZh ? '暂无提交' : 'No submissions yet' }}
      </p>
      <NuxtLink
        :to="localePath('/icp/submit')"
        class="btn btn-primary"
      >
        <Plus class="w-4 h-4 mr-1" />
        {{ isZh ? '提交新站点' : 'Submit New Site' }}
      </NuxtLink>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="sub in submissions"
        :key="sub.id"
        class="card bg-base-200 p-6"
      >
        <div class="flex items-start justify-between gap-4 mb-4">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-3 mb-2">
              <component :is="getStatusIcon(sub.status)" class="w-5 h-5" :class="{
                'text-warning': sub.status === 'pending',
                'text-success': sub.status === 'approved',
                'text-error': sub.status === 'rejected',
              }" />
              <h2 class="text-xl font-bold truncate">
                {{ sub.data.name }}
              </h2>
            </div>
            <code class="text-sm opacity-60">{{ sub.data.domain }}</code>
          </div>
          <div class="flex flex-col items-end gap-2">
            <span class="badge" :class="getStatusBadge(sub.status)">
              {{ getStatusLabel(sub.status) }}
            </span>
            <span class="badge badge-outline badge-sm">
              {{ getTypeLabel(sub.type) }}
            </span>
          </div>
        </div>

        <div class="text-sm opacity-60 mb-4">
          <p>{{ isZh ? '提交时间' : 'Submitted' }}: {{ new Date(sub.created).toLocaleDateString(isZh ? 'zh-CN' : 'en-US') }}</p>
        </div>

        <div v-if="sub.data.description" class="mb-4">
          <p class="text-sm opacity-70">{{ sub.data.description }}</p>
        </div>

        <div v-if="sub.data.categories?.length" class="flex flex-wrap gap-2 mb-4">
          <span v-for="cat in sub.data.categories" :key="cat" class="badge badge-sm badge-primary">
            {{ cat }}
          </span>
        </div>

        <div v-if="sub.status === 'approved' && sub.site_filling_no" class="mt-4">
          <NuxtLink
            :to="localePath(`/icp/${sub.site_filling_no}`)"
            class="btn btn-sm btn-outline btn-primary"
          >
            {{ isZh ? '查看站点' : 'View Site' }}
          </NuxtLink>
        </div>

        <div v-if="sub.data.identity_name || sub.data.identity_description" class="mt-3 p-3 bg-primary/5 rounded-lg">
          <p class="text-xs font-bold mb-1 opacity-60">{{ isZh ? '身份更新' : 'Identity Updates' }}</p>
          <p v-if="sub.data.identity_name" class="text-sm">{{ sub.data.identity_name }}</p>
          <p v-if="sub.data.identity_description" class="text-xs opacity-70">{{ sub.data.identity_description }}</p>
        </div>

        <div v-if="sub.review_note" class="mt-4 p-3 bg-base-300 rounded-lg">
          <p class="text-sm font-bold mb-1">{{ isZh ? '审核备注' : 'Review Note' }}</p>
          <p class="text-sm opacity-80">{{ sub.review_note }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
