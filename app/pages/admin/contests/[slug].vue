<script setup lang="ts">
import { CheckCircle, XCircle, Clock, Save, CheckCheck, ArrowLeft } from '@lucide/vue'

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

const { t } = useI18n()
const route = useRoute()

const slug = computed(() => route.params.slug as string)

const { data: submissions, refresh: refreshSubmissions } = await useAsyncData(`admin-submissions-${slug.value}`, () => {
  return $fetch('/api/admin/contests/submissions', {
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

function phaseLabel(p: string) {
  if (p === 'dev') return t('admin.contests.phaseDev')
  if (p === 'voting') return t('admin.contests.phaseVoting')
  if (p === 'results') return t('admin.contests.phaseResults')
  return p
}
</script>

<template>
  <div>
    <NuxtLink
      to="/admin"
      class="btn btn-ghost btn-sm mb-6 inline-flex"
    >
      <ArrowLeft class="w-4 h-4 mr-2" />
      {{ t('admin.contests.backToAdmin') }}
    </NuxtLink>

    <h2 class="text-2xl font-bold mb-2">{{ t('admin.contests.title') }} — {{ slug }}</h2>
    <div class="flex items-center gap-3 mb-8">
      <p class="opacity-60 text-sm">{{ t('admin.contests.subtitle') }}</p>
      <NuxtLink to="/admin/contests/submissions" class="btn btn-sm btn-outline">
        {{ t('admin.contests.allSubmissions') }}
      </NuxtLink>
    </div>

    <!-- State Control -->
    <div v-if="saveError" class="alert alert-error alert-sm mb-4">
      {{ saveError }}
    </div>
    <div v-if="saveSuccess" class="alert alert-success alert-sm mb-4">
      {{ t('admin.contests.saved') }}
    </div>

    <form @submit.prevent="saveState" class="mb-8">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <fieldset class="fieldset">
          <legend class="fieldset-legend">Status</legend>
          <select v-model="status" class="select w-full">
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="past">Past</option>
          </select>
        </fieldset>

        <fieldset class="fieldset">
          <legend class="fieldset-legend">Phase</legend>
          <select v-model="phase" class="select w-full">
            <option value="dev">{{ t('admin.contests.phaseDev') }}</option>
            <option value="voting">{{ t('admin.contests.phaseVoting') }}</option>
            <option value="results">{{ t('admin.contests.phaseResults') }}</option>
          </select>
        </fieldset>

        <fieldset class="fieldset">
          <legend class="fieldset-legend">Start Date</legend>
          <input v-model="startDate" type="date" class="input w-full">
        </fieldset>

        <fieldset class="fieldset">
          <legend class="fieldset-legend">End Date</legend>
          <input v-model="endDate" type="date" class="input w-full">
        </fieldset>

        <fieldset class="fieldset">
          <legend class="fieldset-legend">{{ t('admin.contests.submissionEnabled') }}</legend>
          <label class="label cursor-pointer justify-start gap-3">
            <input v-model="submissionEnabled" type="checkbox" class="toggle toggle-primary" />
            <span class="label-text">{{ t('admin.contests.submissionEnabled') }}</span>
          </label>
        </fieldset>

        <fieldset class="fieldset">
          <legend class="fieldset-legend">{{ t('admin.contests.votingEnabled') }}</legend>
          <label class="label cursor-pointer justify-start gap-3">
            <input v-model="votingEnabled" type="checkbox" class="toggle toggle-secondary" />
            <span class="label-text">{{ t('admin.contests.votingEnabled') }}</span>
          </label>
        </fieldset>
      </div>

      <div class="pt-4">
        <button class="btn btn-primary" :disabled="saving" type="submit">
          <Save v-if="!saving" class="w-4 h-4 mr-2" />
          <span v-else class="loading loading-spinner loading-sm" />
          {{ t('admin.contests.save') }}
        </button>
      </div>
    </form>

    <!-- Submissions Review -->
    <fieldset class="fieldset card bg-base-200 p-4">
      <legend class="fieldset-legend text-lg font-semibold">
        {{ t('admin.contests.review') }}
        <span class="text-sm font-normal opacity-60 ml-1">
          {{ t('admin.contests.total') }} {{ submissions?.submissions?.length || 0 }}
        </span>
      </legend>

      <div class="flex gap-4 mb-4">
        <span class="badge badge-warning">{{ pendingSubmissions.length }} {{ t('admin.contests.pending') }}</span>
        <span class="badge badge-success">{{ acceptedSubmissions.length }} {{ t('admin.contests.accepted') }}</span>
        <span class="badge badge-error">{{ rejectedSubmissions.length }} {{ t('admin.contests.rejected') }}</span>
      </div>

      <div v-if="pendingSubmissions.length > 0" class="space-y-3">
        <div
          v-for="sub in pendingSubmissions"
          :key="sub.id"
          class="card bg-base-100"
        >
          <div class="card-body py-4 px-5">
            <div class="flex items-center justify-between gap-4">
              <div class="min-w-0">
                <h4 class="font-medium truncate">{{ sub.data?.title }}</h4>
                <p class="text-sm opacity-70 line-clamp-1">{{ sub.data?.description }}</p>
                <div v-if="sub.data?.tags?.length" class="flex gap-1 mt-1">
                  <span v-for="tag in (sub.data.tags as string[]).slice(0, 3)" :key="tag" class="badge badge-xs badge-outline">
                    {{ tag }}
                  </span>
                </div>
              </div>
              <div class="flex gap-2 shrink-0">
                <button class="btn btn-sm btn-success" title="Accept" @click="reviewSubmission(sub.id, 'accepted')">
                  <CheckCircle class="w-4 h-4" />
                </button>
                <button class="btn btn-sm btn-error" title="Reject" @click="reviewSubmission(sub.id, 'rejected')">
                  <XCircle class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-8 opacity-50">
        <CheckCheck class="w-12 h-12 mx-auto mb-2" />
        <p>{{ t('admin.contests.noPending') }}</p>
      </div>
    </fieldset>
  </div>
</template>
