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
    <h2 class="admin-h">
      {{ t('admin.panel.dashboard') }}
    </h2>

    <div class="stat-row">
      <NuxtLink
        v-for="card in statCards"
        :key="card.label"
        :to="card.to"
        class="stat"
      >
        <span class="stat-label">{{ card.label }}</span>
        <span class="stat-figure">
          <component :is="card.icon" class="stat-icon" aria-hidden="true" />
          {{ card.value }}
        </span>
      </NuxtLink>
    </div>

    <section class="actions">
      <h3 class="admin-h admin-h-sm">
        {{ t('admin.panel.quickActions') }}
      </h3>
      <div class="actions-row">
        <NuxtLink to="/admin/submissions?status=pending" class="btn btn-sm">
          <FileText class="btn-icon" aria-hidden="true" />
          {{ t('admin.panel.reviewSubmissions') }}
        </NuxtLink>
        <NuxtLink to="/admin/users" class="btn btn-sm">
          <Users class="btn-icon" aria-hidden="true" />
          {{ t('admin.panel.manageUsers') }}
        </NuxtLink>
        <NuxtLink to="/admin/sites" class="btn btn-sm">
          <Globe class="btn-icon" aria-hidden="true" />
          {{ t('admin.panel.viewSites') }}
        </NuxtLink>
        <NuxtLink to="/admin/contests" class="btn btn-sm">
          <Trophy class="btn-icon" aria-hidden="true" />
          {{ t('admin.contests.manageContests') }}
        </NuxtLink>
        <button class="btn btn-sm" @click="importFromPb">
          <span v-if="importing" class="loading loading-spinner loading-xs" />
          <Download v-else class="btn-icon" aria-hidden="true" />
          {{ t('admin.panel.importPocketbase') }}
        </button>
      </div>

      <p v-if="importResult" class="note" :class="importResult.success ? 'note-success' : 'note-error'">
        <template v-if="importResult.success">
          {{ t('admin.panel.importDone', {
            identities: importResult.identities?.imported ?? 0,
            sites: importResult.sites?.imported ?? 0,
            assets: importResult.assetsUploaded ?? 0,
          }) }}
        </template>
        <template v-else>
          {{ importResult.error || t('admin.panel.importFailed') }}
        </template>
      </p>
    </section>
  </div>
</template>

<style scoped>
.admin-h {
  margin: 0 0 1.25rem;
  font-size: 1.375rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.admin-h-sm {
  font-size: 0.9375rem;
  margin-bottom: 0.9rem;
}

.stat-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1px;
  overflow: hidden;
  margin-bottom: 2rem;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-card);
  background: var(--color-line-soft);
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 1rem 1.1rem;
  background: var(--color-base-100);
  text-decoration: none;
  transition: background-color 140ms ease;
}

.stat:hover {
  background: color-mix(in oklab, var(--color-base-200) 70%, transparent);
}

.stat-label {
  font-size: 0.8125rem;
  color: var(--color-faint);
}

.stat-figure {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-mono);
  font-size: 1.5rem;
  font-weight: 500;
  color: var(--color-base-content);
  font-variant-numeric: tabular-nums;
}

.stat-icon {
  width: 0.9375rem;
  height: 0.9375rem;
  color: var(--color-primary);
}

.actions {
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-line-soft);
}

.actions-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 1rem;
}

.btn-icon {
  width: 0.875rem;
  height: 0.875rem;
}

@media (min-width: 640px) {
  .stat-row {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>
