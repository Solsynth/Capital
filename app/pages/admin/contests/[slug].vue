<script setup lang="ts">
import { CheckCircle, XCircle, Save, CheckCheck, ArrowLeft } from '@lucide/vue'

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

const { t } = useI18n()
const route = useRoute()

const slug = computed(() => route.params.slug as string)

const { data: submissions, refresh: refreshSubmissions } = await useAsyncData(`admin-submissions-${slug.value}`, () => {
  return useRequestFetch()('/api/admin/contests/submissions', {
    query: { contest_id: slug.value },
  })
})

const status = ref('upcoming')
const phase = ref('dev')
const submissionEnabled = ref(true)
const votingEnabled = ref(false)
const startDate = ref('')
const endDate = ref('')
const saving = ref(false)
const saveError = ref('')
const saveSuccess = ref(false)

async function saveState() {
  saveError.value = ''
  saveSuccess.value = false
  saving.value = true

  try {
    await $fetch(`/api/admin/contests/state/${slug.value}`, {
      method: 'PATCH',
      body: {
        status: status.value,
        phase: phase.value,
        submission_enabled: submissionEnabled.value,
        voting_enabled: votingEnabled.value,
        start_date: startDate.value || undefined,
        end_date: endDate.value || undefined,
      },
    })
    saveSuccess.value = true
    setTimeout(() => { saveSuccess.value = false }, 3000)
  }
  catch (e: any) {
    saveError.value = e.data?.statusMessage || t('admin.contests.saveError')
  }
  finally {
    saving.value = false
  }
}

async function reviewSubmission(id: string, action: string) {
  try {
    await $fetch(`/api/admin/contests/submissions/${id}`, {
      method: 'PATCH',
      body: { action },
    })
    await refreshSubmissions()
  }
  catch {
    // Silent fail
  }
}

const pendingSubmissions = computed(() => submissions.value?.submissions?.filter((s: any) => s.status === 'pending') || [])
const acceptedSubmissions = computed(() => submissions.value?.submissions?.filter((s: any) => s.status === 'accepted') || [])
const rejectedSubmissions = computed(() => submissions.value?.submissions?.filter((s: any) => s.status === 'rejected') || [])
</script>

<template>
  <div>
    <NuxtLink to="/admin/contests" class="back-link">
      <ArrowLeft class="back-icon" aria-hidden="true" />
      {{ t('admin.contests.backToAdmin') }}
    </NuxtLink>

    <div class="admin-head">
      <h2 class="admin-h">
        {{ slug }}
      </h2>
      <p class="admin-sub">
        {{ t('admin.contests.subtitle') }}
      </p>
    </div>

    <p v-if="saveError" class="note note-error mb-4">
      {{ saveError }}
    </p>
    <p v-if="saveSuccess" class="note note-success mb-4">
      {{ t('admin.contests.saved') }}
    </p>

    <form class="plate state-form" @submit.prevent="saveState">
      <div class="state-grid">
        <label class="field">
          <span class="field-label">{{ t('admin.contests.status') }}</span>
          <select v-model="status" class="select">
            <option value="upcoming">{{ t('admin.contests.statusUpcoming') }}</option>
            <option value="ongoing">{{ t('admin.contests.statusOngoing') }}</option>
            <option value="past">{{ t('admin.contests.statusPast') }}</option>
          </select>
        </label>

        <label class="field">
          <span class="field-label">{{ t('admin.contests.phase') }}</span>
          <select v-model="phase" class="select">
            <option value="dev">{{ t('admin.contests.phaseDev') }}</option>
            <option value="voting">{{ t('admin.contests.phaseVoting') }}</option>
            <option value="results">{{ t('admin.contests.phaseResults') }}</option>
          </select>
        </label>

        <label class="field">
          <span class="field-label">{{ t('admin.contests.startDate') }}</span>
          <input v-model="startDate" type="date" class="input">
        </label>

        <label class="field">
          <span class="field-label">{{ t('admin.contests.endDate') }}</span>
          <input v-model="endDate" type="date" class="input">
        </label>
      </div>

      <div class="toggles">
        <label class="toggle">
          <input v-model="submissionEnabled" type="checkbox">
          <span>{{ t('admin.contests.submissionEnabled') }}</span>
        </label>
        <label class="toggle">
          <input v-model="votingEnabled" type="checkbox">
          <span>{{ t('admin.contests.votingEnabled') }}</span>
        </label>
      </div>

      <div class="state-foot">
        <NuxtLink to="/admin/contests/submissions" class="btn btn-sm">
          {{ t('admin.contests.allSubmissions') }}
        </NuxtLink>
        <button class="btn btn-sm btn-primary" :disabled="saving" type="submit">
          <span v-if="saving" class="spinner" />
          <Save v-else class="btn-icon" aria-hidden="true" />
          {{ t('admin.contests.save') }}
        </button>
      </div>
    </form>

    <section class="review">
      <div class="review-head">
        <h3 class="review-title">
          {{ t('admin.contests.review') }}
          <span class="mono">{{ t('admin.contests.total') }} {{ submissions?.submissions?.length || 0 }}</span>
        </h3>
      </div>

      <div class="stat-row">
        <div class="stat">
          <span class="stat-label">{{ t('admin.contests.pending') }}</span>
          <span class="stat-figure">{{ pendingSubmissions.length }}</span>
        </div>
        <div class="stat">
          <span class="stat-label">{{ t('admin.contests.accepted') }}</span>
          <span class="stat-figure">{{ acceptedSubmissions.length }}</span>
        </div>
        <div class="stat">
          <span class="stat-label">{{ t('admin.contests.rejected') }}</span>
          <span class="stat-figure">{{ rejectedSubmissions.length }}</span>
        </div>
      </div>

      <ul v-if="pendingSubmissions.length > 0" class="queue">
        <li v-for="sub in pendingSubmissions" :key="sub.id" class="queue-row">
          <div class="queue-main">
            <p class="queue-title">{{ sub.data?.title }}</p>
            <p v-if="sub.data?.description" class="queue-desc">{{ sub.data?.description }}</p>
            <div v-if="sub.data?.tags?.length" class="queue-tags">
              <span v-for="tag in (sub.data.tags as string[]).slice(0, 3)" :key="tag" class="chip">{{ tag }}</span>
            </div>
          </div>
          <div class="queue-actions">
            <button class="btn btn-xs" :title="t('admin.contests.accepted')" @click="reviewSubmission(sub.id, 'accepted')">
              <CheckCircle class="btn-icon" aria-hidden="true" />
              {{ t('admin.contests.accepted') }}
            </button>
            <button class="btn btn-xs" :title="t('admin.contests.rejected')" @click="reviewSubmission(sub.id, 'rejected')">
              <XCircle class="btn-icon" aria-hidden="true" />
              {{ t('admin.contests.rejected') }}
            </button>
          </div>
        </li>
      </ul>

      <p v-else class="empty">
        <CheckCheck class="empty-icon" aria-hidden="true" />
        {{ t('admin.contests.noPending') }}
      </p>
    </section>
  </div>
</template>

<style scoped>
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-bottom: 1rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-faint);
  text-decoration: none;
  transition: color 140ms ease;
}

.back-link:hover {
  color: var(--color-base-content);
}

.back-icon {
  width: 0.875rem;
  height: 0.875rem;
}

.admin-head {
  margin-bottom: 1.25rem;
}

.admin-h {
  margin: 0;
  font-size: 1.375rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.admin-sub {
  margin: 0.35rem 0 0;
  font-size: 0.8125rem;
  color: var(--color-faint);
}

.state-form {
  padding: 1.1rem 1.15rem;
  margin-bottom: 2rem;
}

.state-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.9rem;
}

.field {
  display: block;
  min-width: 0;
}

.toggles {
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-line-soft);
}

.toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: var(--color-dim);
  cursor: pointer;
}

.toggle input {
  width: 0.9rem;
  height: 0.9rem;
  accent-color: var(--color-primary);
}

.state-foot {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1.1rem;
}

.btn-icon {
  width: 0.875rem;
  height: 0.875rem;
}

.review-head {
  margin-bottom: 0.9rem;
}

.review-title {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.6rem;
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 600;
}

.stat-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1px;
  overflow: hidden;
  margin-bottom: 1.25rem;
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

.queue {
  margin: 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid var(--color-line-soft);
}

.queue-row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.9rem 0;
  border-bottom: 1px solid var(--color-line-soft);
}

.queue-main {
  flex: 1;
  min-width: 12rem;
}

.queue-title {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 600;
}

.queue-desc {
  margin: 0.15rem 0 0;
  font-size: 0.8125rem;
  color: var(--color-faint);
}

.queue-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  margin-top: 0.4rem;
}

.queue-actions {
  display: flex;
  gap: 0.4rem;
  flex-shrink: 0;
}

.empty {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  padding: 1.25rem 0;
  font-size: 0.8125rem;
  color: var(--color-faint);
}

.empty-icon {
  width: 1rem;
  height: 1rem;
}

@media (min-width: 640px) {
  .state-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
