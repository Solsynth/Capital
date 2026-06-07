<script setup lang="ts">
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Filter,
} from 'lucide-vue-next'

const { locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

const lang = computed(() => locale.value)
const isZh = computed(() => lang.value === 'zh')

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

useHead({
  title: computed(() => isZh.value ? '提交管理' : 'Submissions'),
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
    icon_file_id?: string | null
    icon_url?: string | null
  }
  review_note?: string
  reviewed_at?: string
  created: string
  user: {
    id: string
    name: string
    email: string
  }
  site_filling_no?: string
  site_name?: string
}

const filterStatus = ref<string>((route.query.status as string) || 'pending')

const { data: submissionsData, refresh } = await useAsyncData(
  `admin-submissions-${filterStatus.value}`,
  () => $fetch<{ submissions: Submission[] }>('/api/admin/icp/submissions', {
    params: { status: filterStatus.value || undefined },
  }),
  { watch: [filterStatus] }
)

const submissions = computed(() => submissionsData.value?.submissions ?? [])

const selectedSubmission = ref<Submission | null>(null)
const reviewNote = ref('')
const isReviewing = ref(false)

function selectSubmission(sub: Submission) {
  selectedSubmission.value = sub
  reviewNote.value = ''
}

async function handleReview(action: 'approve' | 'reject') {
  if (!selectedSubmission.value || isReviewing.value) return

  isReviewing.value = true

  try {
    await $fetch('/api/admin/icp/review', {
      method: 'POST',
      body: {
        submission_id: selectedSubmission.value.id,
        action,
        note: reviewNote.value || null,
      },
    })

    selectedSubmission.value = null
    reviewNote.value = ''
    await refresh()
  }
  catch (err: any) {
    alert(err.data?.statusMessage || (isZh.value ? '操作失败' : 'Action failed'))
  }
  finally {
    isReviewing.value = false
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'pending': return 'badge-warning'
    case 'approved': return 'badge-success'
    case 'rejected': return 'badge-error'
    default: return 'badge-ghost'
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

function getTypeLabel(type: string) {
  return type === 'create'
    ? (isZh.value ? '新建' : 'Create')
    : (isZh.value ? '更新' : 'Update')
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold">
        {{ isZh ? '提交管理' : 'Submissions' }}
      </h2>
    </div>

    <div class="tabs tabs-boxed mb-6">
      <button
        class="tab"
        :class="{ 'tab-active': filterStatus === '' }"
        @click="filterStatus = ''"
      >
        {{ isZh ? '全部' : 'All' }}
      </button>
      <button
        class="tab"
        :class="{ 'tab-active': filterStatus === 'pending' }"
        @click="filterStatus = 'pending'"
      >
        <Clock class="w-4 h-4 mr-1" />
        {{ isZh ? '待审核' : 'Pending' }}
      </button>
      <button
        class="tab"
        :class="{ 'tab-active': filterStatus === 'approved' }"
        @click="filterStatus = 'approved'"
      >
        <CheckCircle class="w-4 h-4 mr-1" />
        {{ isZh ? '已通过' : 'Approved' }}
      </button>
      <button
        class="tab"
        :class="{ 'tab-active': filterStatus === 'rejected' }"
        @click="filterStatus = 'rejected'"
      >
        <XCircle class="w-4 h-4 mr-1" />
        {{ isZh ? '已拒绝' : 'Rejected' }}
      </button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Submissions List -->
      <div class="lg:col-span-1 space-y-3 max-h-[calc(100vh-16rem)] overflow-y-auto">
        <div
          v-for="sub in submissions"
          :key="sub.id"
          class="card bg-base-200 hover:bg-base-300 cursor-pointer transition-all p-4"
          :class="{ 'ring-2 ring-primary': selectedSubmission?.id === sub.id }"
          @click="selectSubmission(sub)"
        >
          <div class="flex items-start justify-between gap-2 mb-2">
            <div class="flex-1 min-w-0">
              <h3 class="font-bold truncate">{{ sub.data.name }}</h3>
              <code class="text-xs opacity-60">{{ sub.data.domain }}</code>
            </div>
            <div class="flex flex-col items-end gap-1">
              <span class="badge badge-sm" :class="getStatusBadge(sub.status)">
                {{ getStatusLabel(sub.status) }}
              </span>
              <span class="badge badge-sm badge-outline">
                {{ getTypeLabel(sub.type) }}
              </span>
            </div>
          </div>
          <div class="text-xs opacity-60">
            <p>{{ sub.user.name || sub.user.email }}</p>
            <p>{{ new Date(sub.created).toLocaleDateString(isZh ? 'zh-CN' : 'en-US') }}</p>
          </div>
        </div>

        <div v-if="submissions.length === 0" class="card bg-base-200 p-8 text-center">
          <Eye class="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p class="opacity-60">{{ isZh ? '暂无提交' : 'No submissions' }}</p>
        </div>
      </div>

      <!-- Submission Detail -->
      <div class="lg:col-span-2">
        <div v-if="selectedSubmission" class="card bg-base-200 p-6 sticky top-20">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold">{{ selectedSubmission.data.name }}</h2>
            <div class="flex gap-2">
              <span class="badge" :class="getStatusBadge(selectedSubmission.status)">
                {{ getStatusLabel(selectedSubmission.status) }}
              </span>
              <span class="badge badge-outline">
                {{ getTypeLabel(selectedSubmission.type) }}
              </span>
            </div>
          </div>

          <div class="space-y-4 mb-6">
            <div v-if="selectedSubmission.data.icon_url" class="flex items-center gap-4 mb-4">
              <div class="w-16 h-16 rounded-xl overflow-hidden border border-base-300">
                <img
                  :src="selectedSubmission.data.icon_url"
                  :alt="selectedSubmission.data.name"
                  class="w-full h-full object-cover"
                >
              </div>
              <div>
                <p class="font-bold">{{ selectedSubmission.data.name }}</p>
                <p class="text-sm opacity-60">{{ isZh ? '站点图标' : 'Site Icon' }}</p>
              </div>
            </div>
            <div>
              <label class="text-sm opacity-60">{{ isZh ? '域名' : 'Domain' }}</label>
              <p class="font-mono">{{ selectedSubmission.data.domain }}</p>
            </div>
            <div>
              <label class="text-sm opacity-60">{{ isZh ? '网站链接' : 'Site URL' }}</label>
              <a :href="selectedSubmission.data.site_url" target="_blank" class="link link-primary">
                {{ selectedSubmission.data.site_url }}
              </a>
            </div>
            <div v-if="selectedSubmission.data.description">
              <label class="text-sm opacity-60">{{ isZh ? '介绍' : 'Description' }}</label>
              <p>{{ selectedSubmission.data.description }}</p>
            </div>
            <div v-if="selectedSubmission.data.categories?.length">
              <label class="text-sm opacity-60">{{ isZh ? '分类' : 'Categories' }}</label>
              <div class="flex flex-wrap gap-2 mt-1">
                <span v-for="cat in selectedSubmission.data.categories" :key="cat" class="badge badge-primary">
                  {{ cat }}
                </span>
              </div>
            </div>
            <div v-if="selectedSubmission.data.identity_id">
              <label class="text-sm opacity-60">{{ isZh ? '备案主体 ID' : 'Identity ID' }}</label>
              <p class="font-mono text-sm">{{ selectedSubmission.data.identity_id }}</p>
            </div>
          </div>

          <div class="divider" />

          <div class="mb-6">
            <label class="text-sm opacity-60">{{ isZh ? '提交者' : 'Submitted by' }}</label>
            <p>{{ selectedSubmission.user.name || selectedSubmission.user.email }}</p>
            <p class="text-sm opacity-60">{{ selectedSubmission.user.email }}</p>
          </div>

          <div v-if="selectedSubmission.status === 'pending'" class="space-y-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text">{{ isZh ? '审核备注' : 'Review Note' }}</span>
              </label>
              <textarea
                v-model="reviewNote"
                :placeholder="isZh ? '可选：添加审核备注...' : 'Optional: Add a review note...'"
                class="textarea textarea-bordered w-full h-20"
              />
            </div>

            <div class="flex gap-4">
              <button
                class="btn btn-success flex-1"
                :disabled="isReviewing"
                @click="handleReview('approve')"
              >
                <span v-if="isReviewing" class="loading loading-spinner loading-sm" />
                <CheckCircle v-else class="w-5 h-5 mr-2" />
                {{ isZh ? '通过' : 'Approve' }}
              </button>
              <button
                class="btn btn-error flex-1"
                :disabled="isReviewing"
                @click="handleReview('reject')"
              >
                <span v-if="isReviewing" class="loading loading-spinner loading-sm" />
                <XCircle v-else class="w-5 h-5 mr-2" />
                {{ isZh ? '拒绝' : 'Reject' }}
              </button>
            </div>
          </div>

          <div v-else-if="selectedSubmission.review_note" class="mt-4">
            <label class="text-sm opacity-60">{{ isZh ? '审核备注' : 'Review Note' }}</label>
            <p class="bg-base-300 p-3 rounded-lg mt-1">{{ selectedSubmission.review_note }}</p>
          </div>
        </div>

        <div v-else class="card bg-base-200 p-12 text-center sticky top-20">
          <Eye class="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p class="text-lg opacity-60">
            {{ isZh ? '选择一个提交查看详情' : 'Select a submission to view details' }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
