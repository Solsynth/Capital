<script setup lang="ts">
import {
  ArrowLeft,
  Send,
  Plus,
  User,
  Building2,
} from '@lucide/vue'

const { t } = useI18n()
const localePath = useLocalePath()
const router = useRouter()

definePageMeta({
  middleware: 'auth',
})

useHead({
  title: t('royIcp.submit.title'),
})

useSeoMeta({
  description: t('royIcp.submit.desc'),
  ogTitle: t('royIcp.submit.title'),
  ogDescription: t('royIcp.submit.desc'),
})

interface Identity {
  id: string
  name: string
  type: 'individual' | 'organization'
  description?: string
  icon?: string
  iconUrl?: string | null
}

const { data: identitiesData } = await useAsyncData(
  'icp-identities-for-submit',
  () => useRequestFetch()<{ identities: Identity[] }>('/api/icp/identities'),
)

const identities = computed(() => identitiesData.value?.identities ?? [])

const form = reactive({
  identity_id: '',
  domain: '',
  name: '',
  description: '',
  site_url: '',
  categories: [] as string[],
  iconFileId: null as string | null,
  updateIdentity: false,
  identityName: '',
  identityDescription: '',
  identityIconFileId: null as string | null,
})

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
      type: 'create',
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
  <div>
    <header class="band">
      <div class="shell">
        <NuxtLink
          :to="localePath('/icp')"
          class="back"
        >
          <ArrowLeft class="back-icon" aria-hidden="true" />
          {{ t('common.back') }}
        </NuxtLink>

        <h1 class="title page-title">
          {{ t('royIcp.submit.title') }}
        </h1>
        <p class="lede page-lede">
          {{ t('royIcp.submit.desc') }}
        </p>
      </div>
    </header>

    <div class="body">
      <div class="shell">
        <p v-if="submitSuccess" class="note note-success outcome">
          {{ t('royIcp.submit.success') }}
        </p>

        <p v-if="submitError" class="note note-error outcome">
          {{ submitError }}
        </p>

        <form v-if="!submitSuccess" class="plate form" @submit.prevent="handleSubmit">
          <section class="fieldset">
            <h2 class="field-label">
              {{ t('royIcp.submit.selectIdentity') }}
            </h2>

            <div v-if="identities.length === 0" class="note note-warning identity-empty">
              <div>
                <p class="identity-empty-title">
                  {{ t('royIcp.submit.noIdentity') }}
                </p>
                <p class="identity-empty-desc">
                  {{ t('royIcp.submit.createIdentityFirst') }}
                </p>
              </div>
              <NuxtLink :to="localePath('/icp/identities')" class="btn btn-primary btn-sm">
                <Plus class="icon" aria-hidden="true" />
                {{ t('royIcp.submit.createIdentity') }}
              </NuxtLink>
            </div>

            <div v-else class="identity-list">
              <label
                v-for="identity in identities"
                :key="identity.id"
                class="identity-option"
                :class="{ 'is-current': form.identity_id === identity.id }"
              >
                <input
                  v-model="form.identity_id"
                  type="radio"
                  :value="identity.id"
                  class="radio radio-primary radio-sm"
                >
                <span class="identity-mark">
                  <img
                    v-if="identity.iconUrl"
                    :src="identity.iconUrl"
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
                <span class="identity-text">
                  <span class="identity-name">
                    {{ identity.name }}
                    <span class="chip">{{ getTypeLabel(identity.type) }}</span>
                  </span>
                  <span v-if="identity.description" class="identity-desc">
                    {{ identity.description }}
                  </span>
                </span>
              </label>
            </div>

            <p class="field-hint">
              <NuxtLink :to="localePath('/icp/identities')" class="link-quiet">
                {{ t('royIcp.submit.manageIdentities') }}
              </NuxtLink>
            </p>
          </section>

          <section v-if="form.identity_id" class="fieldset">
            <label class="check-option">
              <input v-model="form.updateIdentity" type="checkbox" class="checkbox checkbox-primary checkbox-sm">
              <span>{{ t('royIcp.submit.identityUpdate') }}</span>
            </label>

            <div v-if="form.updateIdentity" class="nested">
              <div class="field">
                <label class="field-label" for="identity-name">
                  {{ t('royIcp.submit.identityName') }}
                </label>
                <input id="identity-name" v-model="form.identityName" type="text" class="input">
              </div>

              <div class="field">
                <label class="field-label" for="identity-description">
                  {{ t('royIcp.submit.identityDesc') }}
                </label>
                <textarea id="identity-description" v-model="form.identityDescription" class="textarea" rows="3" />
              </div>

              <div class="field">
                <p class="field-label">
                  {{ t('royIcp.submit.identityIcon') }}
                </p>
                <FileUpload v-model="form.identityIconFileId" compact />
              </div>
            </div>
          </section>

          <section class="fieldset">
            <label class="field-label" for="site-domain">
              {{ t('royIcp.submit.domain') }}
            </label>
            <input
              id="site-domain"
              v-model="form.domain"
              type="text"
              placeholder="example.com"
              class="input"
              required
            >
            <p class="field-hint">
              {{ t('royIcp.submit.domainHint') }}
            </p>
          </section>

          <section class="fieldset">
            <label class="field-label" for="site-name">
              {{ t('royIcp.submit.siteName') }}
            </label>
            <input
              id="site-name"
              v-model="form.name"
              type="text"
              :placeholder="t('royIcp.submit.siteNamePlaceholder')"
              class="input"
              required
            >
          </section>

          <section class="fieldset">
            <label class="field-label" for="site-url">
              {{ t('royIcp.submit.siteUrl') }}
            </label>
            <input
              id="site-url"
              v-model="form.site_url"
              type="url"
              placeholder="https://example.com"
              class="input"
              required
            >
          </section>

          <section class="fieldset">
            <label class="field-label" for="site-description">
              {{ t('royIcp.submit.description') }}
            </label>
            <textarea
              id="site-description"
              v-model="form.description"
              :placeholder="t('royIcp.submit.descriptionPlaceholder')"
              class="textarea"
              rows="4"
            />
          </section>

          <section class="fieldset">
            <p class="field-label">
              {{ t('royIcp.submit.categories') }}
            </p>
            <div class="category-chips">
              <button
                v-for="cat in categoryOptions"
                :key="cat.value"
                type="button"
                class="chip category-chip"
                :class="{ 'is-current': form.categories.includes(cat.value) }"
                :aria-pressed="form.categories.includes(cat.value)"
                @click="toggleCategory(cat.value)"
              >
                {{ cat.label }}
              </button>
            </div>
            <p class="field-hint">
              {{ t('royIcp.submit.categoriesHint') }}
            </p>
          </section>

          <section class="fieldset">
            <p class="field-label">
              {{ t('royIcp.submit.siteIcon') }}
            </p>
            <FileUpload
              v-model="form.iconFileId"
              :hint="t('royIcp.submit.iconHint')"
            />
            <p class="field-hint">
              {{ t('royIcp.submit.iconRecommended') }}
            </p>
          </section>

          <div class="submit-row">
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="isSubmitting || identities.length === 0"
            >
              <span v-if="isSubmitting" class="spinner" aria-hidden="true" />
              <Send v-else class="icon" aria-hidden="true" />
              {{ t('royIcp.submit.submitBtn') }}
            </button>
          </div>
        </form>
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

.page-title {
  margin: 0;
  font-size: clamp(1.75rem, 3.5vw, 2.375rem);
}

.page-lede {
  margin: 0.6rem 0 0;
}

.body {
  padding-block: 2rem 4rem;
}

.outcome {
  max-width: 40rem;
  margin: 0 0 1rem;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 40rem;
  padding: 1.5rem;
}

.fieldset {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  border: 0;
}

.field {
  display: flex;
  flex-direction: column;
}

.field-hint {
  margin: 0.4rem 0 0;
  font-size: 0.75rem;
  color: var(--color-faint);
}

.icon {
  width: 0.9rem;
  height: 0.9rem;
}

.identity-empty {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.identity-empty-title {
  margin: 0;
  font-weight: 600;
}

.identity-empty-desc {
  margin: 0.15rem 0 0;
}

.identity-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.identity-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.7rem 0.85rem;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-input);
  cursor: pointer;
  transition:
    border-color 140ms ease,
    background-color 140ms ease;
}

.identity-option:hover {
  background: color-mix(in oklab, var(--color-base-200) 60%, transparent);
}

.identity-option.is-current {
  border-color: var(--color-primary);
  background: color-mix(in oklab, var(--color-primary) 8%, transparent);
}

.identity-mark {
  display: flex;
  width: 2rem;
  height: 2rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: var(--radius-mark);
  background: var(--color-base-200);
  color: var(--color-faint);
}

.identity-mark img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.identity-text {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.identity-name {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.9375rem;
  font-weight: 600;
}

.identity-desc {
  font-size: 0.8125rem;
  line-height: 1.5;
  color: var(--color-faint);
}

.check-option {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.875rem;
  color: var(--color-dim);
  cursor: pointer;
}

.nested {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
  padding-left: 1.25rem;
  border-left: 1px solid var(--color-line);
}

.category-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.category-chip {
  padding-block: 0.3rem;
  font-size: 0.75rem;
  cursor: pointer;
}

.submit-row {
  padding-top: 0.5rem;
}
</style>
