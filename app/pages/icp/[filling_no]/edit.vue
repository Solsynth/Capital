<script setup lang="ts">
import {
  ArrowLeft,
  Globe,
  Send,
  User,
  Building2,
} from '@lucide/vue'

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const router = useRouter()

const fillingNo = computed(() => route.params.filling_no as string)

definePageMeta({
  middleware: 'auth',
})

useHead({ title: t('royIcp.edit.title') })

interface Identity {
  id: string
  name: string
  type: 'individual' | 'organization'
  description?: string
  icon?: string
  iconUrl?: string | null
}

const { data, error } = await useAsyncData(
  `icp-site-edit-${fillingNo.value}`,
  () => useRequestFetch()<{ site: any }>('/api/icp/site', {
    params: { filling_no: fillingNo.value },
  }),
)

if (error.value || !data.value?.site) {
  navigateTo(localePath('/icp'))
}

const site = computed(() => data.value?.site)

const { data: identitiesData } = await useAsyncData(
  'icp-identities-for-edit',
  () => useRequestFetch()<{ identities: Identity[] }>('/api/icp/identities'),
)

const identities = computed(() => identitiesData.value?.identities ?? [])

const form = reactive({
  identity_id: site.value?.identity?.id || '',
  domain: site.value?.domain || '',
  name: site.value?.name || '',
  description: site.value?.description || '',
  site_url: site.value?.site_url || '',
  categories: [] as string[],
  iconFileId: site.value?.iconUrl ? { id: site.value.icon_file_id } : null,
  updateIdentity: false,
  identityName: '',
  identityDescription: '',
  identityIconFileId: null as string | null,
})

if (site.value?.categories) {
  const raw = site.value.categories
  form.categories = Array.isArray(raw)
    ? raw
    : Object.entries(raw).filter(([, v]) => v).map(([k]) => k)
}

watch(() => form.identity_id, (id) => {
  const identity = identities.value.find(i => i.id === id)
  if (identity) {
    form.identityName = identity.name
    form.identityDescription = identity.description || ''
    form.identityIconFileId = null
  }
})

const isSubmitting = ref(false)
const submitError = ref<string | null>(null)
const submitSuccess = ref(false)

const categoryOptions = [
  { value: 'official', label: t('categories.official') },
  { value: 'entertainment', label: t('categories.entertainment') },
  { value: 'technology', label: t('categories.technology') },
  { value: 'education', label: t('categories.education') },
  { value: 'social', label: t('categories.social') },
  { value: 'business', label: t('categories.business') },
  { value: 'personal', label: t('categories.personal') },
  { value: 'media', label: t('categories.media') },
  { value: 'community', label: t('categories.community') },
  { value: 'tools', label: t('categories.tools') },
  { value: 'blog', label: t('categories.blog', 'Blog') },
]

function toggleCategory(value: string) {
  const index = form.categories.indexOf(value)
  if (index === -1) form.categories.push(value)
  else form.categories.splice(index, 1)
}

async function handleSubmit() {
  if (isSubmitting.value) return
  if (!form.identity_id) {
    submitError.value = t('royIcp.submit.selectIdentity')
    return
  }

  isSubmitting.value = true
  submitError.value = null
  submitSuccess.value = false

  try {
    const body: any = {
      type: 'update',
      site_id: site.value.id,
      identity_id: form.identity_id,
      domain: form.domain,
      name: form.name,
      description: form.description || null,
      site_url: form.site_url,
      categories: form.categories.length > 0 ? form.categories : null,
      iconFileId: form.iconFileId?.id || null,
    }

    if (form.updateIdentity) {
      body.identity_name = form.identityName.trim() || null
      body.identity_description = form.identityDescription.trim() || null
      body.identity_icon_file_id = form.identityIconFileId?.id || null
    }

    await $fetch('/api/icp/submissions/create', {
      method: 'POST',
      body,
    })

    submitSuccess.value = true
    setTimeout(() => {
      router.push(localePath('/icp/submissions/me'))
    }, 2000)
  }
  catch (err: any) {
    submitError.value = err.data?.statusMessage || t('royIcp.submission.error')
  }
  finally {
    isSubmitting.value = false
  }
}

function getTypeIcon(type: string) {
  return type === 'organization' ? Building2 : User
}

function getTypeLabel(type: string) {
  return type === 'organization' ? t('royIcp.identities.organization') : t('royIcp.identities.individual')
}
</script>

<template>
  <div class="shell page">
    <NuxtLink :to="localePath(`/icp/${fillingNo}`)" class="back">
      <ArrowLeft class="back-icon" aria-hidden="true" />
      {{ t('royIcp.edit.backToSite') }}
    </NuxtLink>

    <header class="head">
      <h1 class="title head-title">
        {{ t('royIcp.edit.title') }}
      </h1>
      <p class="head-desc">
        {{ t('royIcp.edit.desc') }}
      </p>
    </header>

    <p v-if="submitSuccess" class="note note-success">
      {{ t('royIcp.edit.success') }}
    </p>
    <p v-if="submitError" class="note note-error">
      {{ submitError }}
    </p>

    <form v-if="!submitSuccess" class="form" @submit.prevent="handleSubmit">
      <fieldset class="field">
        <legend class="field-label">
          {{ t('royIcp.submit.selectIdentity') }}
        </legend>
        <div class="identity-list">
          <label
            v-for="identity in identities"
            :key="identity.id"
            class="identity"
            :class="{ 'is-current': form.identity_id === identity.id }"
          >
            <input
              v-model="form.identity_id"
              type="radio"
              :value="identity.id"
              class="sr-only"
            >
            <span class="identity-mark">
              <img v-if="identity.iconUrl" :src="identity.iconUrl" :alt="''" class="identity-img">
              <component :is="getTypeIcon(identity.type)" v-else class="identity-glyph" aria-hidden="true" />
            </span>
            <span class="identity-name">{{ identity.name }}</span>
            <span class="identity-type">{{ getTypeLabel(identity.type) }}</span>
          </label>
        </div>
      </fieldset>

      <div v-if="form.identity_id" class="identity-update">
        <label class="check">
          <input v-model="form.updateIdentity" type="checkbox">
          <span>{{ t('royIcp.submit.identityUpdate') }}</span>
        </label>

        <div v-if="form.updateIdentity" class="identity-fields">
          <label class="field">
            <span class="field-label">{{ t('royIcp.submit.identityName') }}</span>
            <input v-model="form.identityName" type="text" class="input">
          </label>

          <label class="field">
            <span class="field-label">{{ t('royIcp.submit.identityDesc') }}</span>
            <textarea v-model="form.identityDescription" class="textarea h-16" />
          </label>

          <div class="field">
            <span class="field-label">{{ t('royIcp.submit.identityIcon') }}</span>
            <FileUpload v-model="form.identityIconFileId" compact />
          </div>
        </div>
      </div>

      <label class="field">
        <span class="field-label">{{ t('royIcp.submit.domain') }}</span>
        <input v-model="form.domain" type="text" placeholder="example.com" class="input" required>
      </label>

      <label class="field">
        <span class="field-label">{{ t('royIcp.submit.siteName') }}</span>
        <input v-model="form.name" type="text" class="input" required>
      </label>

      <label class="field">
        <span class="field-label">{{ t('royIcp.submit.siteUrl') }}</span>
        <input v-model="form.site_url" type="url" placeholder="https://example.com" class="input" required>
      </label>

      <label class="field">
        <span class="field-label">{{ t('royIcp.submit.description') }}</span>
        <textarea v-model="form.description" class="textarea h-24" />
      </label>

      <div class="field">
        <span class="field-label">{{ t('royIcp.submit.categories') }}</span>
        <div class="chips">
          <button
            v-for="cat in categoryOptions"
            :key="cat.value"
            type="button"
            class="chip"
            :class="{ 'is-current': form.categories.includes(cat.value) }"
            :aria-pressed="form.categories.includes(cat.value)"
            @click="toggleCategory(cat.value)"
          >
            {{ cat.label }}
          </button>
        </div>
      </div>

      <div class="field">
        <span class="field-label">{{ t('royIcp.submit.siteIcon') }}</span>
        <FileUpload v-model="form.iconFileId" :hint="t('royIcp.submit.iconHint')" />
      </div>

      <div class="submit-row">
        <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
          <span v-if="isSubmitting" class="spinner" />
          <Send v-else class="submit-icon" aria-hidden="true" />
          {{ t('royIcp.edit.submitBtn') }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.page {
  padding-block: 2.25rem 0;
}

.back {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-bottom: 1.5rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-faint);
  text-decoration: none;
  transition: color 140ms ease;
}

.back:hover,
.back:focus-visible {
  color: var(--color-base-content);
}

.back-icon {
  width: 0.875rem;
  height: 0.875rem;
}

.head {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--color-line-soft);
}

.head-title {
  margin: 0;
  font-size: clamp(1.75rem, 3.5vw, 2.25rem);
}

.head-desc {
  margin: 0.6rem 0 0;
  max-width: 34rem;
  font-size: 0.9375rem;
  line-height: 1.65;
  color: var(--color-dim);
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 34rem;
}

.field {
  display: block;
  margin: 0;
  border: 0;
  padding: 0;
}

.identity-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.identity {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-input);
  cursor: pointer;
  transition:
    border-color 140ms ease,
    background-color 140ms ease;
}

.identity:hover {
  border-color: var(--color-faint);
}

.identity.is-current {
  border-color: color-mix(in oklab, var(--color-primary) 55%, transparent);
  background: color-mix(in oklab, var(--color-primary) 12%, transparent);
}

.identity:focus-within {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.identity-mark {
  display: flex;
  width: 1.75rem;
  height: 1.75rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: var(--radius-mark);
  background: var(--color-base-300);
}

.identity-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.identity-glyph {
  width: 0.875rem;
  height: 0.875rem;
  color: var(--color-faint);
}

.identity-name {
  font-size: 0.9375rem;
  font-weight: 600;
}

.identity-type {
  margin-left: auto;
  font-size: 0.75rem;
  color: var(--color-faint);
}

.identity-update {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.check {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-dim);
}

.identity-fields {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-left: 1rem;
  border-left: 1px solid var(--color-line);
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.submit-row {
  padding-top: 1.25rem;
  border-top: 1px solid var(--color-line-soft);
}

.submit-icon {
  width: 0.9375rem;
  height: 0.9375rem;
}
</style>
