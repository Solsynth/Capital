<script setup lang="ts">
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Trash2,
  Link,
  ExternalLink,
  ArrowLeftRight,
  MoreHorizontal,
} from '@lucide/vue'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

useHead({
  title: computed(() => t('admin.submissions.title')),
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
    identity_name?: string
    identity_description?: string
    identity_icon_file_id?: string
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

interface Identity {
  id: string
  name: string
  type: 'individual' | 'organization'
  description?: string
  icon?: string
  user?: { id: string; name: string; email: string } | null
}

const filterStatus = ref<string>((route.query.status as string) || 'pending')

const { data: submissionsData, refresh } = await useAsyncData(
  `admin-submissions-${filterStatus.value}`,
  () => $fetch<{ submissions: Submission[] }>('/api/admin/icp/submissions', {
    params: { status: filterStatus.value || undefined },
  }),
  { watch: [filterStatus] }
)

const { data: identitiesData } = await useAsyncData(
  'admin-submissions-identities',
  () => $fetch<{ identities: Identity[] }>('/api/admin/icp/identities'),
)

const submissions = computed(() => submissionsData.value?.submissions ?? [])
const identities = computed(() => identitiesData.value?.identities ?? [])

const selectedSubmission = ref<Submission | null>(null)
const reviewNote = ref('')
const isReviewing = ref(false)

function selectSubmission(sub: Submission) {
  selectedSubmission.value = sub
  reviewNote.value = ''
  resetSiteActions()
}

function resetSiteActions() {
  reassigningSiteId.value = null
  reassignIdentityId.value = ''
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
    alert(err.data?.statusMessage || t('admin.submissions.actionFailed'))
  }
  finally {
    isReviewing.value = false
  }
}

// Site delete
const deletingSiteId = ref<string | null>(null)
const isDeletingSite = ref(false)

async function handleDeleteSite() {
  if (!deletingSiteId.value || isDeletingSite.value) return
  isDeletingSite.value = true
  try {
    await $fetch(`/api/admin/icp/sites/${deletingSiteId.value}`, { method: 'DELETE' })
    deletingSiteId.value = null
    if (selectedSubmission.value) {
      selectedSubmission.value.site_id = null
      selectedSubmission.value.site_filling_no = undefined
      selectedSubmission.value.site_name = undefined
    }
    await refresh()
  }
  catch (err: any) {
    alert(err.data?.statusMessage || t('admin.submissions.deleteFailed'))
  }
  finally {
    isDeletingSite.value = false
  }
}

// Reassign identity
const reassigningSiteId = ref<string | null>(null)
const reassignIdentityId = ref('')
const isReassigning = ref(false)

function startReassign(siteId: string) {
  reassigningSiteId.value = siteId
  reassignIdentityId.value = selectedSubmission.value?.data.identity_id || ''
}

async function handleReassign() {
  if (!reassigningSiteId.value || isReassigning.value) return
  isReassigning.value = true
  try {
    await $fetch(`/api/admin/icp/sites/${reassigningSiteId.value}`, {
      method: 'PATCH',
      body: { identityId: reassignIdentityId.value || null },
    })
    if (selectedSubmission.value) {
      selectedSubmission.value.data.identity_id = reassignIdentityId.value || undefined
    }
    reassigningSiteId.value = null
    reassignIdentityId.value = ''
    await refresh()
  }
  catch (err: any) {
    alert(err.data?.statusMessage || t('admin.submissions.actionFailed'))
  }
  finally {
    isReassigning.value = false
  }
}

function getIdentityById(id: string) {
  return identities.value.find(i => i.id === id)
}

function getIdentityTypeLabel(ident: Identity) {
  return ident.type === 'organization' ? t('admin.submissions.org') : t('admin.submissions.ind')
}

// Identity delete
const deletingIdentityId = ref<string | null>(null)
const isDeletingIdentity = ref(false)

async function handleDeleteIdentity() {
  if (!deletingIdentityId.value || isDeletingIdentity.value) return
  isDeletingIdentity.value = true
  try {
    await $fetch(`/api/admin/icp/identities/${deletingIdentityId.value}`, { method: 'DELETE' })
    deletingIdentityId.value = null
    await refresh()
  }
  catch (err: any) {
    alert(err.data?.statusMessage || t('admin.submissions.deleteFailed'))
  }
  finally {
    isDeletingIdentity.value = false
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
  const keyMap: Record<string, string> = {
    pending: 'royIcp.mySubmissions.pending',
    approved: 'royIcp.mySubmissions.approved',
    rejected: 'royIcp.mySubmissions.rejected',
  }
  return t(keyMap[status] || status)
}

function getTypeLabel(type: string) {
  return type === 'create'
    ? t('admin.submissions.createType')
    : t('admin.submissions.updateType')
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold">
        {{ t('admin.submissions.title') }}
      </h2>
    </div>

    <div class="tabs tabs-boxed mb-6">
      <button
        class="tab"
        :class="{ 'tab-active': filterStatus === '' }"
        @click="filterStatus = ''"
      >
        {{ t('admin.submissions.all') }}
      </button>
      <button
        class="tab"
        :class="{ 'tab-active': filterStatus === 'pending' }"
        @click="filterStatus = 'pending'"
      >
        <Clock class="w-4 h-4 mr-1" />
        {{ t('royIcp.mySubmissions.pending') }}
      </button>
      <button
        class="tab"
        :class="{ 'tab-active': filterStatus === 'approved' }"
        @click="filterStatus = 'approved'"
      >
        <CheckCircle class="w-4 h-4 mr-1" />
        {{ t('royIcp.mySubmissions.approved') }}
      </button>
      <button
        class="tab"
        :class="{ 'tab-active': filterStatus === 'rejected' }"
        @click="filterStatus = 'rejected'"
      >
        <XCircle class="w-4 h-4 mr-1" />
        {{ t('royIcp.mySubmissions.rejected') }}
      </button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Submissions List -->
      <div class="lg:col-span-1 space-y-3 max-h-[calc(100vh-16rem)] overflow-y-auto px-1 py-1">
        <div
          v-for="sub in submissions"
          :key="sub.id"
          class="card bg-base-200 hover:bg-base-300 cursor-pointer transition-all p-4 border-2"
          :class="selectedSubmission?.id === sub.id ? 'border-primary' : 'border-transparent'"
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
            <p>{{ new Date(sub.created).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US') }}</p>
          </div>
          <!-- Quick actions on list cards -->
          <div v-if="sub.site_id || sub.data.identity_id" class="flex gap-1 mt-2 pt-2 border-t border-base-content/10" @click.stop>
            <button
              v-if="sub.site_id"
              class="btn btn-ghost btn-xs text-error"
              :title="t('admin.submissions.deleteSiteWarning')"
              @click="selectSubmission(sub); deletingSiteId = sub.site_id"
            >
              <Trash2 class="w-3 h-3 mr-1" />
              {{ t('reviews.delete') }} {{ t('admin.nav.sites') }}
            </button>
            <button
              v-if="sub.data.identity_id"
              class="btn btn-ghost btn-xs text-error"
              :title="t('admin.submissions.deleteIdentityWarning')"
              @click="selectSubmission(sub); deletingIdentityId = sub.data.identity_id"
            >
              <Trash2 class="w-3 h-3 mr-1" />
              {{ t('reviews.delete') }} {{ t('royIcp.site.identity') }}
            </button>
          </div>
        </div>

        <div v-if="submissions.length === 0" class="card bg-base-200 p-8 text-center">
          <Eye class="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p class="opacity-60">{{ t('admin.submissions.noSubmissions') }}</p>
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

          <!-- Site Management (for approved submissions with linked site) — shown near top -->
          <template v-if="selectedSubmission.site_id">
            <div class="p-4 bg-primary/5 rounded-xl mb-6 border border-primary/20">
              <h3 class="text-sm font-bold mb-3 flex items-center gap-2">
                <ExternalLink class="w-4 h-4" />
                {{ t('admin.submissions.siteManagement') }}
              </h3>
              <div class="flex items-center justify-between gap-2">
                <div class="min-w-0">
                  <p class="text-sm font-bold truncate">{{ selectedSubmission.site_name || selectedSubmission.data.name }}</p>
                  <p class="text-xs opacity-60">
                    {{ t('admin.submissions.fillingNo') }}: {{ selectedSubmission.site_filling_no || '-' }}
                  </p>
                </div>
                <div class="flex gap-1 shrink-0">
                  <NuxtLink
                    v-if="selectedSubmission.site_filling_no"
                    :to="localePath(`/icp/${selectedSubmission.site_filling_no}`)"
                    class="btn btn-ghost btn-xs"
                  >
                    <ExternalLink class="w-3 h-3" />
                  </NuxtLink>
                  <button
                    class="btn btn-ghost btn-xs text-error"
                    @click="deletingSiteId = selectedSubmission.site_id"
                  >
                    <Trash2 class="w-3.5 h-3.5 mr-1" />
                    {{ t('reviews.delete') }}
                  </button>
                </div>
              </div>

              <!-- Reassign Identity inline -->
              <div class="mt-3 pt-3 border-t border-base-content/10">
                <div class="flex items-center gap-2 mb-2">
                  <Link class="w-3.5 h-3.5 opacity-60" />
                  <span class="text-xs opacity-60">{{ t('admin.submissions.associatedIdentity') }}</span>
                </div>
                <div v-if="reassigningSiteId === selectedSubmission.site_id" class="space-y-2">
                  <select v-model="reassignIdentityId" class="select select-bordered select-sm w-full">
                    <option value="">
                      {{ t('admin.submissions.selectIdentity') }}
                    </option>
                    <option
                      v-for="ident in identities"
                      :key="ident.id"
                      :value="ident.id"
                    >
                      {{ ident.name }} ({{ getIdentityTypeLabel(ident) }}) — {{ ident.user?.email || t('admin.submissions.unknown') }}
                    </option>
                  </select>
                  <div class="flex gap-2">
                    <button class="btn btn-xs" @click="resetSiteActions">
                      {{ t('royIcp.identities.cancel') }}
                    </button>
                    <button
                      class="btn btn-primary btn-xs"
                      :disabled="isReassigning"
                      @click="handleReassign"
                    >
                      <span v-if="isReassigning" class="loading loading-spinner loading-xs" />
                      {{ t('admin.contests.save') }}
                    </button>
                  </div>
                </div>
                <div v-else class="flex items-center justify-between">
                  <span class="text-sm">
                    <template v-if="selectedSubmission.data.identity_id && getIdentityById(selectedSubmission.data.identity_id)">
                      {{ getIdentityById(selectedSubmission.data.identity_id)?.name }}
                      <span class="opacity-50 text-xs">({{ selectedSubmission.data.identity_id.slice(0, 8) }}...)</span>
                    </template>
                    <span v-else class="opacity-50">{{ t('admin.submissions.none') }}</span>
                  </span>
                  <button
                    class="btn btn-ghost btn-xs"
                    @click="startReassign(selectedSubmission.site_id!)"
                  >
                    <ArrowLeftRight class="w-3 h-3 mr-1" />
                    {{ t('admin.submissions.selectIdentity') }}
                  </button>
                </div>
              </div>
            </div>
          </template>

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
                <p class="text-sm opacity-60">{{ t('admin.submissions.siteIcon') }}</p>
              </div>
            </div>
            <div>
              <label class="text-sm opacity-60">{{ t('royIcp.submit.domain') }}</label>
              <p class="font-mono">{{ selectedSubmission.data.domain }}</p>
            </div>
            <div>
              <label class="text-sm opacity-60">{{ t('royIcp.submit.siteUrl') }}</label>
              <a :href="selectedSubmission.data.site_url" target="_blank" class="link link-primary">
                {{ selectedSubmission.data.site_url }}
              </a>
            </div>
            <div v-if="selectedSubmission.data.description">
              <label class="text-sm opacity-60">{{ t('royIcp.submit.description') }}</label>
              <p>{{ selectedSubmission.data.description }}</p>
            </div>
            <div v-if="selectedSubmission.data.categories?.length">
              <label class="text-sm opacity-60">{{ t('royIcp.site.categories') }}</label>
              <div class="flex flex-wrap gap-2 mt-1">
                <span v-for="cat in selectedSubmission.data.categories" :key="cat" class="badge badge-primary">
                  {{ cat }}
                </span>
              </div>
            </div>
          </div>

          <div class="divider" />

          <!-- Identity Section -->
          <div v-if="selectedSubmission.data.identity_id" class="mb-6">
            <label class="text-sm opacity-60">{{ t('royIcp.site.identity') }}</label>
            <div class="flex items-center justify-between mt-1">
              <div class="flex items-center gap-2">
                <p class="font-mono text-sm">{{ selectedSubmission.data.identity_id }}</p>
                <span v-if="getIdentityById(selectedSubmission.data.identity_id)" class="text-sm opacity-60">
                  ({{ getIdentityById(selectedSubmission.data.identity_id)?.name }})
                </span>
              </div>
              <button
                class="btn btn-ghost btn-xs text-error"
                @click="deletingIdentityId = selectedSubmission.data.identity_id"
              >
                <Trash2 class="w-3 h-3 mr-1" />
                {{ t('reviews.delete') }} {{ t('royIcp.site.identity') }}
              </button>
            </div>
          </div>

          <div v-if="selectedSubmission.data.identity_name || selectedSubmission.data.identity_description || selectedSubmission.data.identity_icon_file_id" class="p-3 bg-primary/10 rounded-lg mb-6">
            <p class="text-sm font-bold mb-2">{{ t('royIcp.mySubmissions.identityUpdates') }}</p>
            <div v-if="selectedSubmission.data.identity_name" class="text-sm">
              <span class="opacity-60">{{ t('royIcp.identities.name') }}:</span> {{ selectedSubmission.data.identity_name }}
            </div>
            <div v-if="selectedSubmission.data.identity_description" class="text-sm">
              <span class="opacity-60">{{ t('royIcp.identities.description') }}:</span> {{ selectedSubmission.data.identity_description }}
            </div>
            <p v-if="selectedSubmission.data.identity_icon_file_id" class="text-sm">{{ t('admin.submissions.includesNewIcon') }}</p>
          </div>

          <div class="divider" />

          <div class="mb-6">
            <label class="text-sm opacity-60">{{ t('admin.submissions.submittedBy') }}</label>
            <p>{{ selectedSubmission.user.name || selectedSubmission.user.email }}</p>
            <p class="text-sm opacity-60">{{ selectedSubmission.user.email }}</p>
          </div>

          <div v-if="selectedSubmission.status === 'pending'" class="space-y-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text">{{ t('royIcp.mySubmissions.reviewNote') }}</span>
              </label>
              <textarea
                v-model="reviewNote"
                :placeholder="t('admin.submissions.reviewNotePlaceholder')"
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
                {{ t('admin.submissions.approve') }}
              </button>
              <button
                class="btn btn-error flex-1"
                :disabled="isReviewing"
                @click="handleReview('reject')"
              >
                <span v-if="isReviewing" class="loading loading-spinner loading-sm" />
                <XCircle v-else class="w-5 h-5 mr-2" />
                {{ t('admin.submissions.reject') }}
              </button>
            </div>
          </div>

          <div v-else-if="selectedSubmission.review_note" class="mt-4">
            <label class="text-sm opacity-60">{{ t('royIcp.mySubmissions.reviewNote') }}</label>
            <p class="bg-base-300 p-3 rounded-lg mt-1">{{ selectedSubmission.review_note }}</p>
          </div>
        </div>

        <div v-else class="card bg-base-200 p-12 text-center sticky top-20">
          <Eye class="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p class="text-lg opacity-60">
            {{ t('admin.submissions.selectHint') }}
          </p>
        </div>
      </div>
    </div>

    <!-- Delete Site Dialog -->
    <AppDialog
      :open="!!deletingSiteId"
      :title="t('admin.submissions.confirmDeleteSite')"
      max-width="max-w-sm"
      @update:open="!$event && (deletingSiteId = null)"
    >
      <p class="text-sm">
        {{ t('admin.submissions.deleteSiteWarning') }}
      </p>
      <template #footer>
        <button class="btn" @click="deletingSiteId = null">{{ t('royIcp.identities.cancel') }}</button>
        <button class="btn btn-error" :disabled="isDeletingSite" @click="handleDeleteSite">
          <span v-if="isDeletingSite" class="loading loading-spinner loading-sm" />
          <Trash2 v-else class="w-4 h-4 mr-1" />
          {{ t('reviews.delete') }}
        </button>
      </template>
    </AppDialog>

    <!-- Delete Identity Dialog -->
    <AppDialog
      :open="!!deletingIdentityId"
      :title="t('admin.submissions.confirmDeleteIdentity')"
      max-width="max-w-sm"
      @update:open="!$event && (deletingIdentityId = null)"
    >
      <p class="text-sm">
        {{ t('admin.submissions.deleteIdentityWarning') }}
      </p>
      <template #footer>
        <button class="btn" @click="deletingIdentityId = null">{{ t('royIcp.identities.cancel') }}</button>
        <button class="btn btn-error" :disabled="isDeletingIdentity" @click="handleDeleteIdentity">
          <span v-if="isDeletingIdentity" class="loading loading-spinner loading-sm" />
          <Trash2 v-else class="w-4 h-4 mr-1" />
          {{ t('reviews.delete') }}
        </button>
      </template>
    </AppDialog>
  </div>
</template>
