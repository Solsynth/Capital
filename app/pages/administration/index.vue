<script setup lang="ts">
import {
  FileText,
  Globe,
  Users,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-vue-next'

const { locale } = useI18n()
const localePath = useLocalePath()
const lang = computed(() => locale.value)
const isZh = computed(() => lang.value === 'zh')

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

useHead({
  title: computed(() => isZh.value ? '管理后台' : 'Admin Dashboard'),
})

const { data: stats } = await useAsyncData('admin-stats', async () => {
  const [submissions, sites] = await Promise.all([
    $fetch<{ submissions: any[] }>('/api/admin/icp/submissions').catch(() => ({ submissions: [] })),
    $fetch<{ sites: any[] }>('/api/icp/sites').catch(() => ({ sites: [] })),
  ])

  const pending = submissions.submissions.filter(s => s.status === 'pending').length
  const approved = submissions.submissions.filter(s => s.status === 'approved').length
  const rejected = submissions.submissions.filter(s => s.status === 'rejected').length

  return {
    totalSubmissions: submissions.submissions.length,
    pending,
    approved,
    rejected,
    totalSites: sites.sites.length,
  }
})

const statCards = computed(() => [
  {
    label: isZh.value ? '待审核' : 'Pending',
    value: stats.value?.pending ?? 0,
    icon: Clock,
    color: 'text-warning',
    bg: 'bg-warning/10',
    to: '/administration/submissions?status=pending',
  },
  {
    label: isZh.value ? '已通过' : 'Approved',
    value: stats.value?.approved ?? 0,
    icon: CheckCircle,
    color: 'text-success',
    bg: 'bg-success/10',
    to: '/administration/submissions?status=approved',
  },
  {
    label: isZh.value ? '已拒绝' : 'Rejected',
    value: stats.value?.rejected ?? 0,
    icon: XCircle,
    color: 'text-error',
    bg: 'bg-error/10',
    to: '/administration/submissions?status=rejected',
  },
  {
    label: isZh.value ? '认证站点' : 'Certified Sites',
    value: stats.value?.totalSites ?? 0,
    icon: Globe,
    color: 'text-primary',
    bg: 'bg-primary/10',
    to: '/administration/sites',
  },
])
</script>

<template>
  <div>
    <h2 class="text-2xl font-bold mb-6">
      {{ isZh ? '仪表盘' : 'Dashboard' }}
    </h2>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <NuxtLink
        v-for="card in statCards"
        :key="card.label"
        :to="localePath(card.to)"
        class="card bg-base-200 hover:bg-base-300 transition-colors p-4"
      >
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center" :class="card.bg">
            <component :is="card.icon" class="w-6 h-6" :class="card.color" />
          </div>
          <div>
            <p class="text-sm opacity-60">{{ card.label }}</p>
            <p class="text-2xl font-bold">{{ card.value }}</p>
          </div>
        </div>
      </NuxtLink>
    </div>

    <div class="card bg-base-200 p-6">
      <h3 class="font-bold mb-4">
        {{ isZh ? '快捷操作' : 'Quick Actions' }}
      </h3>
      <div class="flex flex-wrap gap-3">
        <NuxtLink :to="localePath('/administration/submissions?status=pending')" class="btn btn-outline btn-sm">
          <FileText class="w-4 h-4 mr-1" />
          {{ isZh ? '审核提交' : 'Review Submissions' }}
        </NuxtLink>
        <NuxtLink :to="localePath('/administration/users')" class="btn btn-outline btn-sm">
          <Users class="w-4 h-4 mr-1" />
          {{ isZh ? '管理用户' : 'Manage Users' }}
        </NuxtLink>
        <NuxtLink :to="localePath('/administration/sites')" class="btn btn-outline btn-sm">
          <Globe class="w-4 h-4 mr-1" />
          {{ isZh ? '查看站点' : 'View Sites' }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
