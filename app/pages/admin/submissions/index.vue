<script setup lang="ts">
import {
  CheckCircle,
  XCircle,
  Trash2,
  Link,
  ExternalLink,
  ArrowLeftRight,
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
  () => useRequestFetch()<{ submissions: Submission[] }>('/api/admin/icp/submissions', {
    params: { status: filterStatus.value || undefined },
  }),
  { watch: [filterStatus] }
)

const { data: identitiesData } = await useAsyncData(
  'admin-submissions-identities',
  () => useRequestFetch()<{ identities: Identity[] }>('/api/admin/icp/identities'),
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

function statusTone(status: string) {
  switch (status) {
    case 'pending': return 'tone-warn'
    case 'approved': return 'tone-ok'
    case 'rejected': return 'tone-bad'
    default: return 'tone-muted'
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
    <div class="admin-head">
      <h2 class="admin-h">
        {{ t('admin.submissions.title') }}
      </h2>
      <p class="admin-sub">
        {{ t('admin.submissions.desc') }}
      </p>
    </div>

    <div class="rail" role="tablist" :aria-label="t('admin.submissions.title')">
      <button
        v-for="option in [
          { value: '', label: t('admin.submissions.all') },
          { value: 'pending', label: t('royIcp.mySubmissions.pending') },
          { value: 'approved', label: t('royIcp.mySubmissions.approved') },
          { value: 'rejected', label: t('royIcp.mySubmissions.rejected') },
        ]"
        :key="option.value || 'all'"
        type="button"
        role="tab"
        class="rail-tab"
        :class="{ 'is-current': filterStatus === option.value }"
        :aria-selected="filterStatus === option.value"
        @click="filterStatus = option.value"
      >
        {{ option.label }}
      </button>
    </div>

    <div class="split">
      <div class="list-col">
        <ul v-if="submissions.length" class="queue">
          <li v-for="sub in submissions" :key="sub.id">
            <div
              class="queue-item"
              :class="{ 'is-selected': selectedSubmission?.id === sub.id }"
              role="button"
              tabindex="0"
              @click="selectSubmission(sub)"
              @keydown.enter.prevent="selectSubmission(sub)"
              @keydown.space.prevent="selectSubmission(sub)"
            >
              <div class="queue-head">
                <div class="queue-main">
                  <p class="queue-name">{{ sub.data.name }}</p>
                  <p class="mono">{{ sub.data.domain }}</p>
                </div>
                <span class="status" :class="statusTone(sub.status)">
                  <span class="dot" aria-hidden="true" />
                  {{ getStatusLabel(sub.status) }}
                </span>
              </div>
              <div class="queue-meta">
                <span class="chip">{{ getTypeLabel(sub.type) }}</span>
                <span>{{ sub.user.name || sub.user.email }}</span>
                <span class="mono">{{ new Date(sub.created).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US') }}</span>
              </div>
              <div
                v-if="sub.site_id || sub.data.identity_id"
                class="queue-actions"
                @click.stop
              >
                <button
                  v-if="sub.site_id"
                  class="btn btn-xs"
                  :title="t('admin.submissions.deleteSiteWarning')"
                  @click="selectSubmission(sub); deletingSiteId = sub.site_id"
                >
                  <Trash2 class="btn-icon" aria-hidden="true" />
                  {{ t('reviews.delete') }} {{ t('admin.nav.sites') }}
                </button>
                <button
                  v-if="sub.data.identity_id"
                  class="btn btn-xs"
                  :title="t('admin.submissions.deleteIdentityWarning')"
                  @click="selectSubmission(sub); deletingIdentityId = sub.data.identity_id"
                >
                  <Trash2 class="btn-icon" aria-hidden="true" />
                  {{ t('reviews.delete') }} {{ t('royIcp.site.identity') }}
                </button>
              </div>
            </div>
          </li>
        </ul>

        <p v-else class="empty">
          {{ t('admin.submissions.noSubmissions') }}
        </p>
      </div>

      <div class="detail-col">
        <div v-if="selectedSubmission" class="detail">
          <div class="detail-head">
            <h3 class="detail-title">
              {{ selectedSubmission.data.name }}
            </h3>
            <div class="detail-tags">
              <span class="status" :class="statusTone(selectedSubmission.status)">
                <span class="dot" aria-hidden="true" />
                {{ getStatusLabel(selectedSubmission.status) }}
              </span>
              <span class="chip">{{ getTypeLabel(selectedSubmission.type) }}</span>
            </div>
          </div>

          <div v-if="selectedSubmission.site_id" class="plate site-block">
            <div class="site-head">
              <h4 class="block-title">
                <ExternalLink class="block-icon" aria-hidden="true" />
                {{ t('admin.submissions.siteManagement') }}
              </h4>
              <div class="site-actions">
                <NuxtLink
                  v-if="selectedSubmission.site_filling_no"
                  :to="localePath(`/icp/${selectedSubmission.site_filling_no}`)"
                  class="btn btn-xs"
                >
                  <ExternalLink class="btn-icon" aria-hidden="true" />
                  {{ t('royIcp.site.visit') }}
                </NuxtLink>
                <button
                  class="btn btn-xs"
                  @click="deletingSiteId = selectedSubmission.site_id"
                >
                  <Trash2 class="btn-icon" aria-hidden="true" />
                  {{ t('reviews.delete') }}
                </button>
              </div>
            </div>

            <p class="site-name">
              {{ selectedSubmission.site_name || selectedSubmission.data.name }}
            </p>
            <p class="mono">
              {{ t('admin.submissions.fillingNo') }}: {{ selectedSubmission.site_filling_no || '-' }}
            </p>

            <div class="reassign">
              <p class="field-label reassign-label">
                <Link class="inline-icon" aria-hidden="true" />
                {{ t('admin.submissions.associatedIdentity') }}
              </p>
              <div v-if="reassigningSiteId === selectedSubmission.site_id" class="reassign-form">
                <select v-model="reassignIdentityId" class="select select-sm">
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
                <div class="reassign-actions">
                  <button class="btn btn-xs" @click="resetSiteActions">
                    {{ t('royIcp.identities.cancel') }}
                  </button>
                  <button
                    class="btn btn-xs btn-primary"
                    :disabled="isReassigning"
                    @click="handleReassign"
                  >
                    <span v-if="isReassigning" class="spinner" />
                    {{ t('admin.contests.save') }}
                  </button>
                </div>
              </div>
              <div v-else class="reassign-current">
                <span class="reassign-value">
                  <template v-if="selectedSubmission.data.identity_id && getIdentityById(selectedSubmission.data.identity_id)">
                    {{ getIdentityById(selectedSubmission.data.identity_id)?.name }}
                    <span class="mono">({{ selectedSubmission.data.identity_id.slice(0, 8) }}…)</span>
                  </template>
                  <span v-else class="reassign-none">{{ t('admin.submissions.none') }}</span>
                </span>
                <button class="btn btn-xs" @click="startReassign(selectedSubmission.site_id!)">
                  <ArrowLeftRight class="btn-icon" aria-hidden="true" />
                  {{ t('admin.submissions.selectIdentity') }}
                </button>
              </div>
            </div>
          </div>

          <dl class="facts">
            <div v-if="selectedSubmission.data.icon_url" class="fact">
              <dt>{{ t('admin.submissions.siteIcon') }}</dt>
              <dd>
                <img
                  :src="selectedSubmission.data.icon_url"
                  :alt="selectedSubmission.data.name"
                  class="fact-icon"
                >
              </dd>
            </div>
            <div class="fact">
              <dt>{{ t('royIcp.submit.domain') }}</dt>
              <dd class="mono">
                {{ selectedSubmission.data.domain }}
              </dd>
            </div>
            <div class="fact">
              <dt>{{ t('royIcp.submit.siteUrl') }}</dt>
              <dd>
                <a :href="selectedSubmission.data.site_url" target="_blank" rel="noopener" class="link-quiet">
                  {{ selectedSubmission.data.site_url }}
                </a>
              </dd>
            </div>
            <div v-if="selectedSubmission.data.description" class="fact">
              <dt>{{ t('royIcp.submit.description') }}</dt>
              <dd>{{ selectedSubmission.data.description }}</dd>
            </div>
            <div v-if="selectedSubmission.data.categories?.length" class="fact">
              <dt>{{ t('royIcp.site.categories') }}</dt>
              <dd class="fact-chips">
                <span v-for="cat in selectedSubmission.data.categories" :key="cat" class="chip">
                  {{ cat }}
                </span>
              </dd>
            </div>
            <div v-if="selectedSubmission.data.identity_id" class="fact">
              <dt>{{ t('royIcp.site.identity') }}</dt>
              <dd class="fact-identity">
                <span class="mono">{{ selectedSubmission.data.identity_id }}</span>
                <span v-if="getIdentityById(selectedSubmission.data.identity_id)" class="fact-note">
                  ({{ getIdentityById(selectedSubmission.data.identity_id)?.name }})
                </span>
                <button
                  class="btn btn-xs"
                  @click="deletingIdentityId = selectedSubmission.data.identity_id"
                >
                  <Trash2 class="btn-icon" aria-hidden="true" />
                  {{ t('reviews.delete') }}
                </button>
              </dd>
            </div>
          </dl>

          <div
            v-if="selectedSubmission.data.identity_name || selectedSubmission.data.identity_description || selectedSubmission.data.identity_icon_file_id"
            class="plate identity-block"
          >
            <p class="block-title">
              {{ t('royIcp.mySubmissions.identityUpdates') }}
            </p>
            <p v-if="selectedSubmission.data.identity_name" class="identity-line">
              <span class="identity-key">{{ t('royIcp.identities.name') }}:</span>
              {{ selectedSubmission.data.identity_name }}
            </p>
            <p v-if="selectedSubmission.data.identity_description" class="identity-line">
              <span class="identity-key">{{ t('royIcp.identities.description') }}:</span>
              {{ selectedSubmission.data.identity_description }}
            </p>
            <p v-if="selectedSubmission.data.identity_icon_file_id" class="identity-line">
              {{ t('admin.submissions.includesNewIcon') }}
            </p>
          </div>

          <div class="fact">
            <p class="field-label">
              {{ t('admin.submissions.submittedBy') }}
            </p>
            <p class="submitter">
              {{ selectedSubmission.user.name || selectedSubmission.user.email }}
            </p>
            <p class="mono">
              {{ selectedSubmission.user.email }}
            </p>
          </div>

          <div v-if="selectedSubmission.status === 'pending'" class="review-form">
            <label>
              <span class="field-label">{{ t('royIcp.mySubmissions.reviewNote') }}</span>
              <textarea
                v-model="reviewNote"
                :placeholder="t('admin.submissions.reviewNotePlaceholder')"
                class="textarea h-20"
              />
            </label>
            <div class="review-actions">
              <button
                class="btn btn-sm btn-primary"
                :disabled="isReviewing"
                @click="handleReview('approve')"
              >
                <span v-if="isReviewing" class="spinner" />
                <CheckCircle v-else class="btn-icon" aria-hidden="true" />
                {{ t('admin.submissions.approve') }}
              </button>
              <button
                class="btn btn-sm"
                :disabled="isReviewing"
                @click="handleReview('reject')"
              >
                <span v-if="isReviewing" class="spinner" />
                <XCircle v-else class="btn-icon" aria-hidden="true" />
                {{ t('admin.submissions.reject') }}
              </button>
            </div>
          </div>

          <div v-else-if="selectedSubmission.review_note" class="review-note">
            <p class="field-label">
              {{ t('royIcp.mySubmissions.reviewNote') }}
            </p>
            <p class="review-note-body">
              {{ selectedSubmission.review_note }}
            </p>
          </div>
        </div>

        <p v-else class="empty detail-empty">
          {{ t('admin.submissions.selectHint') }}
        </p>
      </div>
    </div>

    <AppDialog
      :open="!!deletingSiteId"
      :title="t('admin.submissions.confirmDeleteSite')"
      max-width="max-w-sm"
      @update:open="!$event && (deletingSiteId = null)"
    >
      <p class="dialog-copy">
        {{ t('admin.submissions.deleteSiteWarning') }}
      </p>
      <template #footer>
        <button class="btn" @click="deletingSiteId = null">
          {{ t('royIcp.identities.cancel') }}
        </button>
        <button class="btn btn-error" :disabled="isDeletingSite" @click="handleDeleteSite">
          <span v-if="isDeletingSite" class="spinner" />
          <Trash2 v-else class="btn-icon" aria-hidden="true" />
          {{ t('reviews.delete') }}
        </button>
      </template>
    </AppDialog>

    <AppDialog
      :open="!!deletingIdentityId"
      :title="t('admin.submissions.confirmDeleteIdentity')"
      max-width="max-w-sm"
      @update:open="!$event && (deletingIdentityId = null)"
    >
      <p class="dialog-copy">
        {{ t('admin.submissions.deleteIdentityWarning') }}
      </p>
      <template #footer>
        <button class="btn" @click="deletingIdentityId = null">
          {{ t('royIcp.identities.cancel') }}
        </button>
        <button class="btn btn-error" :disabled="isDeletingIdentity" @click="handleDeleteIdentity">
          <span v-if="isDeletingIdentity" class="spinner" />
          <Trash2 v-else class="btn-icon" aria-hidden="true" />
          {{ t('reviews.delete') }}
        </button>
      </template>
    </AppDialog>
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

.admin-sub {
  margin: 0.35rem 0 0;
  font-size: 0.8125rem;
  color: var(--color-faint);
}

.rail {
  display: flex;
  gap: 0.125rem;
  padding: 0.1875rem;
  margin-bottom: 1.5rem;
  overflow-x: auto;
  border: 1px solid var(--color-line-soft);
  border-radius: 999px;
  background: color-mix(in oklab, var(--color-base-200) 45%, transparent);
}

.rail-tab {
  padding: 0.375rem 0.9rem;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--color-faint);
  font-family: inherit;
  font-size: 0.8125rem;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition:
    color 140ms ease,
    background-color 140ms ease;
}

.rail-tab:hover {
  color: var(--color-base-content);
}

.rail-tab.is-current {
  background: var(--color-base-300);
  color: var(--color-base-content);
}

.rail-tab:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.split {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1.5rem;
}

.queue {
  margin: 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid var(--color-line-soft);
}

.queue-item {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 0.85rem 0.6rem 0.85rem 0.65rem;
  border-bottom: 1px solid var(--color-line-soft);
  border-left: 2px solid transparent;
  cursor: pointer;
  transition:
    background-color 140ms ease,
    border-color 140ms ease;
}

.queue-item:hover {
  background: color-mix(in oklab, var(--color-base-200) 55%, transparent);
}

.queue-item:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: -2px;
}

.queue-item.is-selected {
  border-left-color: var(--color-primary);
  background: color-mix(in oklab, var(--color-primary) 8%, transparent);
}

.queue-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.6rem;
}

.queue-main {
  min-width: 0;
}

.queue-name {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 600;
  letter-spacing: -0.005em;
}

.queue-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: var(--color-faint);
}

.queue-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  margin-top: 0.2rem;
}

.status {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  flex-shrink: 0;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
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

.tone-muted {
  color: var(--color-faint);
}

.detail {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  padding: 1.1rem 1.15rem 1.25rem;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-card);
  background: color-mix(in oklab, var(--color-base-200) 40%, transparent);
}

.detail-head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
}

.detail-title {
  margin: 0;
  font-size: 1.0625rem;
  font-weight: 700;
  letter-spacing: -0.015em;
}

.detail-tags {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.site-block {
  padding: 0.9rem 1rem;
}

.site-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.block-title {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin: 0;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-dim);
}

.block-icon {
  width: 0.8125rem;
  height: 0.8125rem;
}

.site-actions {
  display: flex;
  gap: 0.3rem;
}

.site-name {
  margin: 0.45rem 0 0;
  font-size: 0.9375rem;
  font-weight: 600;
}

.reassign {
  margin-top: 0.85rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--color-line-soft);
}

.reassign-label {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.inline-icon {
  width: 0.75rem;
  height: 0.75rem;
}

.reassign-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.reassign-actions {
  display: flex;
  gap: 0.4rem;
}

.reassign-current {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.reassign-value {
  font-size: 0.8125rem;
}

.reassign-none {
  color: var(--color-faint);
}

.facts {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.8rem;
  margin: 0;
}

.fact dt {
  margin: 0 0 0.15rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-faint);
}

.fact dd {
  margin: 0;
  font-size: 0.875rem;
  word-break: break-word;
}

.fact-icon {
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-mark);
  object-fit: cover;
}

.fact-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.fact-identity {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
}

.fact-note {
  font-size: 0.75rem;
  color: var(--color-faint);
}

.identity-block {
  padding: 0.85rem 1rem;
}

.identity-line {
  margin: 0.3rem 0 0;
  font-size: 0.8125rem;
  color: var(--color-dim);
}

.identity-key {
  color: var(--color-faint);
}

.submitter {
  margin: 0.2rem 0 0;
  font-size: 0.875rem;
}

.review-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-line-soft);
}

.review-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.review-note {
  padding-top: 0.9rem;
  border-top: 1px solid var(--color-line-soft);
}

.review-note-body {
  margin: 0.25rem 0 0;
  font-size: 0.8125rem;
  color: var(--color-dim);
}

.dialog-copy {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--color-dim);
}

.btn-icon {
  width: 0.8125rem;
  height: 0.8125rem;
}

.empty {
  margin: 0;
  padding: 1.25rem 0;
  font-size: 0.8125rem;
  color: var(--color-faint);
}

.detail-empty {
  padding: 2rem 0;
}

@media (min-width: 1024px) {
  .split {
    grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
    align-items: start;
  }

  .detail {
    position: sticky;
    top: 4.5rem;
  }
}
</style>
