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
  () => $fetch<{ site: any }>('/api/icp/site', {
    params: { filling_no: fillingNo.value },
  }),
)

if (error.value || !data.value?.site) {
  navigateTo(localePath('/icp'))
}

const site = computed(() => data.value?.site)

const { data: identitiesData } = await useAsyncData(
  'icp-identities-for-edit',
  () => $fetch<{ identities: Identity[] }>('/api/icp/identities'),
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
  { value: 'official', label: t('categories.official', 'ROY Official') },
  { value: 'entertainment', label: t('categories.entertainment', 'Entertainment') },
  { value: 'technology', label: t('categories.technology', 'Technology') },
  { value: 'education', label: t('categories.education', 'Education') },
  { value: 'social', label: t('categories.social', 'Social') },
  { value: 'business', label: t('categories.business', 'Business') },
  { value: 'personal', label: t('categories.personal', 'Personal') },
  { value: 'media', label: t('categories.media', 'Media') },
  { value: 'community', label: t('categories.community', 'Community') },
  { value: 'tools', label: t('categories.tools', 'Tools') },
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
  <div class="container mx-auto px-4 py-16 max-w-2xl">
    <NuxtLink
      :to="localePath(`/icp/${fillingNo}`)"
      class="btn btn-ghost btn-sm mb-8"
    >
      <ArrowLeft class="w-4 h-4 mr-1" />
      {{ t('royIcp.edit.backToSite') }}
    </NuxtLink>

    <div class="card bg-base-200 p-8">
      <div class="flex items-center gap-4 mb-8">
        <Globe class="w-10 h-10 text-primary" />
        <div>
          <h1 class="text-3xl font-bold">
            {{ t('royIcp.edit.title') }}
          </h1>
          <p class="opacity-70">
            {{ t('royIcp.edit.desc') }}
          </p>
        </div>
      </div>

      <div v-if="submitSuccess" class="alert alert-success mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ t('royIcp.edit.success') }}</span>
      </div>

      <div v-if="submitError" class="alert alert-error mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ submitError }}</span>
      </div>

      <form v-if="!submitSuccess" @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Identity Selection -->
        <fieldset class="fieldset">
          <legend class="fieldset-legend">{{ t('royIcp.submit.selectIdentity') }} *</legend>
          <div class="space-y-2">
            <label
              v-for="identity in identities"
              :key="identity.id"
              class="flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-all"
              :class="form.identity_id === identity.id ? 'bg-primary/10 ring-2 ring-primary' : 'bg-base-100 hover:bg-base-300'"
            >
              <input
                v-model="form.identity_id"
                type="radio"
                :value="identity.id"
                class="radio radio-primary"
              >
              <div class="w-10 h-10 rounded-lg bg-base-200 flex items-center justify-center overflow-hidden">
                <img v-if="identity.iconUrl" :src="identity.iconUrl" :alt="identity.name" class="w-full h-full object-cover">
                <component v-else :is="getTypeIcon(identity.type)" class="w-5 h-5 opacity-60" />
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <span class="font-bold">{{ identity.name }}</span>
                  <span class="badge badge-sm" :class="identity.type === 'organization' ? 'badge-primary' : 'badge-ghost'">
                    {{ getTypeLabel(identity.type) }}
                  </span>
                </div>
              </div>
            </label>
          </div>
        </fieldset>

        <!-- Identity Update Toggle -->
        <div v-if="form.identity_id" class="space-y-4">
          <label class="flex items-center gap-3 cursor-pointer">
            <input v-model="form.updateIdentity" type="checkbox" class="checkbox checkbox-primary">
            <span class="text-sm font-medium">{{ t('royIcp.submit.identityUpdate') }}</span>
          </label>

          <div v-if="form.updateIdentity" class="space-y-4 pl-7 border-l-2 border-primary/20">
            <div>
              <label class="text-sm opacity-60">{{ t('royIcp.submit.identityName') }}</label>
              <input v-model="form.identityName" type="text" class="input w-full mt-1">
            </div>

            <div>
              <label class="text-sm opacity-60">{{ t('royIcp.submit.identityDesc') }}</label>
              <textarea v-model="form.identityDescription" class="textarea h-16 w-full mt-1" />
            </div>

            <div>
              <label class="text-sm opacity-60">{{ t('royIcp.submit.identityIcon') }}</label>
              <FileUpload v-model="form.identityIconFileId" compact class="mt-1" />
            </div>
          </div>
        </div>

        <fieldset class="fieldset">
          <legend class="fieldset-legend">{{ t('royIcp.submit.domain') }} *</legend>
          <input
            v-model="form.domain"
            type="text"
            placeholder="example.com"
            class="input w-full"
            required
          >
        </fieldset>

        <fieldset class="fieldset">
          <legend class="fieldset-legend">{{ t('royIcp.submit.siteName') }} *</legend>
          <input
            v-model="form.name"
            type="text"
            class="input w-full"
            required
          >
        </fieldset>

        <fieldset class="fieldset">
          <legend class="fieldset-legend">{{ t('royIcp.submit.siteUrl') }} *</legend>
          <input
            v-model="form.site_url"
            type="url"
            placeholder="https://example.com"
            class="input w-full"
            required
          >
        </fieldset>

        <fieldset class="fieldset">
          <legend class="fieldset-legend">{{ t('royIcp.submit.description') }}</legend>
          <textarea
            v-model="form.description"
            class="textarea h-24 w-full"
          />
        </fieldset>

        <fieldset class="fieldset">
          <legend class="fieldset-legend">{{ t('royIcp.submit.categories') }}</legend>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="cat in categoryOptions"
              :key="cat.value"
              type="button"
              class="badge badge-lg cursor-pointer transition-all"
              :class="form.categories.includes(cat.value) ? 'badge-primary' : 'badge-outline hover:badge-primary'"
              @click="toggleCategory(cat.value)"
            >
              {{ cat.label }}
            </button>
          </div>
        </fieldset>

        <fieldset class="fieldset">
          <legend class="fieldset-legend">{{ t('royIcp.submit.siteIcon') }}</legend>
          <FileUpload
            v-model="form.iconFileId"
            :hint="t('royIcp.submit.iconHint')"
          />
        </fieldset>

        <div class="form-control mt-8">
          <button
            type="submit"
            class="btn btn-primary btn-lg w-full"
            :disabled="isSubmitting"
          >
            <span v-if="isSubmitting" class="loading loading-spinner loading-sm" />
            <Send v-else class="w-5 h-5 mr-2" />
            {{ t('royIcp.edit.submitBtn') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
