<script setup lang="ts">
import {
  FileText,
  Globe,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Download,
  Trophy,
} from '@lucide/vue'

const { t } = useI18n()

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

useHead({
  title: 'Admin Dashboard',
})

const { data: stats } = await useAsyncData('admin-stats', async () => {
  const [submissions, sites, contests] = await Promise.all([
    $fetch<{ submissions: any[] }>('/api/admin/icp/submissions').catch(() => ({ submissions: [] })),
    $fetch<{ sites: any[] }>('/api/icp/sites').catch(() => ({ sites: [] })),
    $fetch<{ states: Record<string, any> }>('/api/contests').catch(() => ({ states: {} })),
  ])

  const pending = submissions.submissions.filter(s => s.status === 'pending').length
  const approved = submissions.submissions.filter(s => s.status === 'approved').length
  const rejected = submissions.submissions.filter(s => s.status === 'rejected').length

  const contestStates = contests.states || {}
  const activeContests = Object.values(contestStates).filter((s: any) => s.status === 'ongoing').length

  return {
    totalSubmissions: submissions.submissions.length,
    pending,
    approved,
    rejected,
    totalSites: sites.sites.length,
    activeContests,
  }
})

const importResult = ref<{ success: boolean; identities?: { imported: number; skipped: number }; sites?: { imported: number; skipped: number }; assetsUploaded?: number; error?: string } | null>(null)
const importing = ref(false)

async function importFromPb() {
  importing.value = true
  importResult.value = null
  try {
    const res = await $fetch('/api/admin/import/pocketbase', { method: 'POST' })
    importResult.value = res
  }
  catch (e: any) {
    importResult.value = { success: false, error: e?.data?.statusMessage || e?.message || 'Unknown error' }
  }
  finally {
    importing.value = false
  }
}

const statCards = computed(() => [
  {
    label: 'Pending',
    value: stats.value?.pending ?? 0,
    icon: Clock,
    color: 'text-warning',
    bg: 'bg-warning/10',
    to: '/admin/submissions?status=pending',
  },
  {
    label: 'Approved',
    value: stats.value?.approved ?? 0,
    icon: CheckCircle,
    color: 'text-success',
    bg: 'bg-success/10',
    to: '/admin/submissions?status=approved',
  },
  {
    label: 'Rejected',
    value: stats.value?.rejected ?? 0,
    icon: XCircle,
    color: 'text-error',
    bg: 'bg-error/10',
    to: '/admin/submissions?status=rejected',
  },
  {
    label: 'Certified Sites',
    value: stats.value?.totalSites ?? 0,
    icon: Globe,
    color: 'text-primary',
    bg: 'bg-primary/10',
    to: '/admin/sites',
  },
  {
    label: t('admin.contests.activeContests'),
    value: stats.value?.activeContests ?? 0,
    icon: Trophy,
    color: 'text-secondary',
    bg: 'bg-secondary/10',
    to: '/admin/contests',
  },
])
</script>

<template>
  <div>
    <h2 class="text-2xl font-bold mb-6">
      Dashboard
    </h2>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <NuxtLink
        v-for="card in statCards"
        :key="card.label"
        :to="card.to"
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
        Quick Actions
      </h3>
      <div class="flex flex-wrap gap-3">
        <NuxtLink to="/admin/submissions?status=pending" class="btn btn-outline btn-sm">
          <FileText class="w-4 h-4 mr-1" />
          Review Submissions
        </NuxtLink>
        <NuxtLink to="/admin/users" class="btn btn-outline btn-sm">
          <Users class="w-4 h-4 mr-1" />
          Manage Users
        </NuxtLink>
        <NuxtLink to="/admin/sites" class="btn btn-outline btn-sm">
          <Globe class="w-4 h-4 mr-1" />
          View Sites
        </NuxtLink>
        <NuxtLink to="/admin/contests" class="btn btn-outline btn-sm">
          <Trophy class="w-4 h-4 mr-1" />
          {{ t('admin.contests.manageContests') }}
        </NuxtLink>
        <button class="btn btn-outline btn-sm" @click="importFromPb">
          <span v-if="importing" class="loading loading-spinner loading-xs mr-1" />
          <Download v-else class="w-4 h-4 mr-1" />
          Import from PocketBase
        </button>
      </div>
      <div v-if="importResult" class="mt-3 text-sm">
        <span v-if="importResult.success" class="text-success">
          Done: {{ importResult.identities?.imported ?? 0 }} identities, {{ importResult.sites?.imported ?? 0 }} sites, {{ importResult.assetsUploaded ?? 0 }} assets uploaded to R2
        </span>
        <span v-else class="text-error">
          {{ importResult.error || 'Import failed' }}
        </span>
      </div>
    </div>
  </div>
</template>
