<script setup lang="ts">
import {
  ArrowLeft,
  Plus,
  User,
  Building2,
  Edit,
  Trash2,
  X,
  Check,
} from '@lucide/vue'

const { t } = useI18n()
const localePath = useLocalePath()

definePageMeta({
  middleware: 'auth',
})

useHead({
  title: t('royIcp.identities.title'),
})

interface Identity {
  id: string
  name: string
  type: 'individual' | 'organization'
  description?: string
  icon?: string
  iconFileId?: string | null
  created: string
}

const { data: identitiesData, refresh } = await useAsyncData(
  'icp-identities',
  () => useRequestFetch()<{ identities: Identity[] }>('/api/icp/identities'),
)

const identities = computed(() => identitiesData.value?.identities ?? [])

const showForm = ref(false)
const editingIdentity = ref<Identity | null>(null)
const form = reactive({
  name: '',
  type: 'individual' as 'individual' | 'organization',
  description: '',
  iconFileId: null as string | null,
})
const isSubmitting = ref(false)
const formError = ref<string | null>(null)

function openCreateForm() {
  editingIdentity.value = null
  form.name = ''
  form.type = 'individual'
  form.description = ''
  form.iconFileId = null
  formError.value = null
  showForm.value = true
}

function openEditForm(identity: Identity) {
  editingIdentity.value = identity
  form.name = identity.name
  form.type = identity.type
  form.description = identity.description || ''
  form.iconFileId = identity.iconFileId || null
  formError.value = null
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  editingIdentity.value = null
  formError.value = null
}

async function handleSubmit() {
  if (isSubmitting.value) return
  if (!form.name.trim()) {
    formError.value = t('royIcp.identities.name') + ' *'
    return
  }

  isSubmitting.value = true
  formError.value = null

  try {
    if (editingIdentity.value) {
      await $fetch(`/api/icp/identities/${editingIdentity.value.id}`, {
        method: 'PUT',
        body: {
          name: form.name.trim(),
          type: form.type,
          description: form.description.trim() || null,
          iconFileId: form.iconFileId?.id || null,
        },
      })
    } else {
      await $fetch('/api/icp/identities/create', {
        method: 'POST',
        body: {
          name: form.name.trim(),
          type: form.type,
          description: form.description.trim() || null,
          iconFileId: form.iconFileId?.id || null,
        },
      })
    }

    closeForm()
    await refresh()
  }
  catch (err: any) {
    formError.value = err.data?.statusMessage || t('common.error')
  }
  finally {
    isSubmitting.value = false
  }
}

async function handleDelete(identity: Identity) {
  const confirmMessage = t('royIcp.identities.deleteConfirm', { name: identity.name })
  if (!confirm(confirmMessage)) return

  try {
    await $fetch(`/api/icp/identities/${identity.id}`, {
      method: 'DELETE',
    })
    await refresh()
  }
  catch (err: any) {
    alert(err.data?.statusMessage || t('common.error'))
  }
}

function getTypeLabel(type: string) {
  return type === 'organization' ? t('royIcp.identities.organization') : t('royIcp.identities.individual')
}

function getTypeIcon(type: string) {
  return type === 'organization' ? Building2 : User
}
</script>

<template>
  <div>
    <header class="band">
      <div class="shell">
        <NuxtLink
          :to="localePath('/icp')"
          class="back"
        >
          <ArrowLeft class="back-icon" aria-hidden="true" />
          {{ t('royIcp.identities.back') }}
        </NuxtLink>

        <div class="masthead">
          <div>
            <h1 class="title page-title">
              {{ t('royIcp.identities.title') }}
            </h1>
            <p class="lede page-lede">
              {{ t('royIcp.identities.desc') }}
            </p>
          </div>

          <button
            v-if="!showForm"
            type="button"
            class="btn btn-primary btn-sm"
            @click="openCreateForm"
          >
            <Plus class="icon" aria-hidden="true" />
            {{ t('royIcp.identities.new') }}
          </button>
        </div>
      </div>
    </header>

    <div class="body">
      <div class="shell">
        <section v-if="showForm" class="plate form-panel">
          <div class="form-head">
            <h2 class="title form-title">
              {{ editingIdentity ? t('royIcp.identities.edit') : t('royIcp.identities.create') }}
            </h2>
            <button
              type="button"
              class="btn btn-ghost btn-sm btn-square"
              :aria-label="t('royIcp.identities.cancel')"
              @click="closeForm"
            >
              <X class="icon" aria-hidden="true" />
            </button>
          </div>

          <p v-if="formError" class="note note-error">
            {{ formError }}
          </p>

          <form class="form" @submit.prevent="handleSubmit">
            <fieldset class="field">
              <legend class="field-label">
                {{ t('royIcp.identities.type') }}
              </legend>
              <div class="radio-row">
                <label class="radio-option">
                  <input
                    v-model="form.type"
                    type="radio"
                    value="individual"
                    class="radio radio-primary radio-sm"
                  >
                  <User class="icon" aria-hidden="true" />
                  {{ t('royIcp.identities.individual') }}
                </label>
                <label class="radio-option">
                  <input
                    v-model="form.type"
                    type="radio"
                    value="organization"
                    class="radio radio-primary radio-sm"
                  >
                  <Building2 class="icon" aria-hidden="true" />
                  {{ t('royIcp.identities.organization') }}
                </label>
              </div>
            </fieldset>

            <div class="field">
              <label class="field-label" for="identity-name">
                {{ t('royIcp.identities.name') }}
              </label>
              <input
                id="identity-name"
                v-model="form.name"
                type="text"
                :placeholder="form.type === 'organization'
                  ? t('royIcp.identities.namePlaceholderOrg')
                  : t('royIcp.identities.namePlaceholderIndividual')"
                class="input"
                required
              >
            </div>

            <div class="field">
              <label class="field-label" for="identity-description">
                {{ t('royIcp.identities.description') }}
              </label>
              <textarea
                id="identity-description"
                v-model="form.description"
                :placeholder="t('royIcp.identities.descriptionPlaceholder')"
                class="textarea"
                rows="3"
              />
            </div>

            <div class="field">
              <p class="field-label">
                {{ t('royIcp.identities.icon') }}
              </p>
              <FileUpload
                v-model="form.iconFileId"
                :hint="t('royIcp.identities.iconHint')"
                compact
              />
              <p class="field-hint">
                {{ t('royIcp.identities.iconRecommended') }}
              </p>
            </div>

            <div class="form-actions">
              <button
                type="submit"
                class="btn btn-primary btn-sm"
                :disabled="isSubmitting"
              >
                <span v-if="isSubmitting" class="spinner" aria-hidden="true" />
                <Check v-else class="icon" aria-hidden="true" />
                {{ editingIdentity ? t('royIcp.identities.save') : t('royIcp.identities.createBtn') }}
              </button>
              <button
                type="button"
                class="btn btn-ghost btn-sm"
                @click="closeForm"
              >
                {{ t('royIcp.identities.cancel') }}
              </button>
            </div>
          </form>
        </section>

        <p v-if="identities.length === 0 && !showForm" class="empty">
          {{ t('royIcp.identities.empty') }}
          <button type="button" class="link-quiet empty-action" @click="openCreateForm">
            {{ t('royIcp.identities.createFirst') }}
          </button>
        </p>

        <ul v-else-if="identities.length > 0" class="list">
          <li
            v-for="identity in identities"
            :key="identity.id"
            class="row"
          >
            <span class="row-mark">
              <img
                v-if="identity.icon"
                :src="identity.icon"
                alt=""
                loading="lazy"
                decoding="async"
              >
              <component
                :is="getTypeIcon(identity.type)"
                v-else
                class="icon"
                aria-hidden="true"
              />
            </span>

            <div class="row-text">
              <div class="row-title">
                <span class="row-name">{{ identity.name }}</span>
                <span class="chip">{{ getTypeLabel(identity.type) }}</span>
              </div>
              <p v-if="identity.description" class="row-desc">
                {{ identity.description }}
              </p>
              <p class="mono row-meta">
                {{ t('royIcp.identities.created') }}
                {{ new Date(identity.created).toLocaleDateString() }}
              </p>
            </div>

            <div class="row-actions">
              <button
                type="button"
                class="btn btn-ghost btn-sm btn-square"
                :aria-label="t('royIcp.identities.edit')"
                :title="t('royIcp.identities.edit')"
                @click="openEditForm(identity)"
              >
                <Edit class="icon" aria-hidden="true" />
              </button>
              <button
                type="button"
                class="btn btn-ghost btn-sm btn-square row-delete"
                :aria-label="t('royIcp.identities.delete')"
                :title="t('royIcp.identities.delete')"
                @click="handleDelete(identity)"
              >
                <Trash2 class="icon" aria-hidden="true" />
              </button>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.band {
  padding-block: 2rem 2.25rem;
  border-bottom: 1px solid var(--color-line-soft);
}

.back {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-bottom: 1.5rem;
  color: var(--color-faint);
  font-size: 0.8125rem;
  font-weight: 600;
  text-decoration: none;
}

.back:hover {
  color: var(--color-base-content);
}

.back-icon {
  width: 0.9rem;
  height: 0.9rem;
}

.masthead {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
}

.page-title {
  margin: 0;
  font-size: clamp(1.75rem, 3.5vw, 2.375rem);
}

.page-lede {
  margin: 0.6rem 0 0;
}

.icon {
  width: 0.9rem;
  height: 0.9rem;
}

.body {
  padding-block: 2rem 4rem;
}

.form-panel {
  padding: 1.25rem 1.5rem 1.5rem;
  margin-bottom: 1.5rem;
}

.form-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.form-title {
  margin: 0;
  font-size: 1.0625rem;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  margin-top: 1rem;
}

.field {
  margin: 0;
  padding: 0;
  border: 0;
}

.field-hint {
  margin: 0.4rem 0 0;
  font-size: 0.75rem;
  color: var(--color-faint);
}

.radio-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.radio-option {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.9rem;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-chip);
  font-size: 0.875rem;
  color: var(--color-dim);
  cursor: pointer;
}

.form-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding-top: 0.25rem;
}

.empty {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.5rem;
  margin: 0;
  padding: 2.25rem 0;
  border-top: 1px solid var(--color-line);
  border-bottom: 1px solid var(--color-line-soft);
  font-size: 0.9375rem;
  color: var(--color-faint);
}

.empty-action {
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  cursor: pointer;
}

.list {
  margin: 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid var(--color-line);
}

.row {
  display: flex;
  align-items: flex-start;
  gap: 0.9rem;
  padding: 1.1rem 0;
  border-bottom: 1px solid var(--color-line-soft);
}

.row-mark {
  display: flex;
  width: 2.5rem;
  height: 2.5rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: var(--radius-mark);
  background: var(--color-base-200);
  color: var(--color-faint);
}

.row-mark img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.row-text {
  flex: 1;
  min-width: 0;
}

.row-title {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.row-name {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-base-content);
}

.row-desc {
  margin: 0.25rem 0 0;
  font-size: 0.8125rem;
  line-height: 1.55;
  color: var(--color-faint);
}

.row-meta {
  margin: 0.4rem 0 0;
}

.row-actions {
  display: flex;
  flex-shrink: 0;
  gap: 0.25rem;
}

.row-delete {
  color: var(--color-error);
}
</style>
