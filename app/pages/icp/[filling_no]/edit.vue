<script setup lang="ts">
import {
  ArrowLeft,
  Globe,
  Send,
  User,
  Building2,
} from '@lucide/vue'

const { locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const router = useRouter()

const lang = computed(() => locale.value)
const isZh = computed(() => lang.value === 'zh')
const fillingNo = computed(() => route.params.filling_no as string)

const pageTitle = computed(() => isZh.value ? '编辑站点 - 中羊网备' : 'Edit Site - ROY ICP')

definePageMeta({
  middleware: 'auth',
})

useHead({ title: pageTitle })

// Fetch existing site
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

// Fetch identities
const { data: identitiesData } = await useAsyncData(
  'icp-identities-for-edit',
  () => $fetch<{ identities: any[] }>('/api/icp/identities'),
)

const identities = computed(() => identitiesData.value?.identities ?? [])

// Pre-fill form from existing site
const form = reactive({
  identity_id: site.value?.identity?.id || '',
  domain: site.value?.domain || '',
  name: site.value?.name || '',
  description: site.value?.description || '',
  site_url: site.value?.site_url || '',
  categories: [] as string[],
  iconFileId: site.value?.iconUrl ? { id: site.value.icon_file_id } : null,
})

// Parse existing categories
if (site.value?.categories) {
  const raw = site.value.categories
  form.categories = Array.isArray(raw)
    ? raw
    : Object.entries(raw).filter(([, v]) => v).map(([k]) => k)
}

const isSubmitting = ref(false)
const submitError = ref<string | null>(null)
const submitSuccess = ref(false)

const categoryOptions = [
  { value: 'official', labelEn: 'ROY Official', labelZh: '羊国官方' },
  { value: 'entertainment', labelEn: 'Entertainment', labelZh: '娱乐' },
  { value: 'technology', labelEn: 'Technology', labelZh: '科技' },
  { value: 'education', labelEn: 'Education', labelZh: '教育' },
  { value: 'social', labelEn: 'Social', labelZh: '社交' },
  { value: 'business', labelEn: 'Business', labelZh: '商业' },
  { value: 'personal', labelEn: 'Personal', labelZh: '个人' },
  { value: 'media', labelEn: 'Media', labelZh: '媒体' },
  { value: 'community', labelEn: 'Community', labelZh: '社区' },
  { value: 'tools', labelEn: 'Tools', labelZh: '工具' },
  { value: 'blog', labelEn: 'Blog', labelZh: '博客' },
]

function toggleCategory(value: string) {
  const index = form.categories.indexOf(value)
  if (index === -1) form.categories.push(value)
  else form.categories.splice(index, 1)
}

async function handleSubmit() {
  if (isSubmitting.value) return
  if (!form.identity_id) {
    submitError.value = isZh.value ? '请选择一个身份' : 'Please select an identity'
    return
  }

  isSubmitting.value = true
  submitError.value = null
  submitSuccess.value = false

  try {
    await $fetch('/api/icp/submissions/create', {
      method: 'POST',
      body: {
        type: 'update',
        site_id: site.value.id,
        identity_id: form.identity_id,
        domain: form.domain,
        name: form.name,
        description: form.description || null,
        site_url: form.site_url,
        categories: form.categories.length > 0 ? form.categories : null,
        iconFileId: form.iconFileId?.id || null,
      },
    })

    submitSuccess.value = true
    setTimeout(() => {
      router.push(localePath('/icp/submissions/me'))
    }, 2000)
  }
  catch (err: any) {
    submitError.value = err.data?.statusMessage || (isZh.value ? '提交失败，请重试' : 'Submission failed, please try again')
  }
  finally {
    isSubmitting.value = false
  }
}

function getTypeIcon(type: string) {
  return type === 'organization' ? Building2 : User
}

function getTypeLabel(type: string) {
  return type === 'organization'
    ? (isZh.value ? '组织' : 'Organization')
    : (isZh.value ? '个人' : 'Individual')
}
</script>

<template>
  <div class="container mx-auto px-4 py-16 max-w-2xl">
    <NuxtLink
      :to="localePath(`/icp/${fillingNo}`)"
      class="btn btn-ghost btn-sm mb-8"
    >
      <ArrowLeft class="w-4 h-4 mr-1" />
      {{ isZh ? '返回站点' : 'Back to Site' }}
    </NuxtLink>

    <div class="card bg-base-200 p-8">
      <div class="flex items-center gap-4 mb-8">
        <Globe class="w-10 h-10 text-primary" />
        <div>
          <h1 class="text-3xl font-bold">
            {{ isZh ? '编辑站点' : 'Edit Site' }}
          </h1>
          <p class="opacity-70">
            {{ isZh ? '提交站点信息更改，需审核后生效' : 'Submit site changes, takes effect after review' }}
          </p>
        </div>
      </div>

      <div v-if="submitSuccess" class="alert alert-success mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ isZh ? '修改提交成功！正在跳转...' : 'Update submitted! Redirecting...' }}</span>
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
          <legend class="fieldset-legend">{{ isZh ? '选择身份' : 'Select Identity' }} *</legend>
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
              <div class="w-10 h-10 rounded-lg bg-base-200 flex items-center justify-center">
                <component :is="getTypeIcon(identity.type)" class="w-5 h-5 opacity-60" />
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

        <fieldset class="fieldset">
          <legend class="fieldset-legend">{{ isZh ? '域名' : 'Domain' }} *</legend>
          <input
            v-model="form.domain"
            type="text"
            placeholder="example.com"
            class="input w-full"
            required
          >
        </fieldset>

        <fieldset class="fieldset">
          <legend class="fieldset-legend">{{ isZh ? '网站名称' : 'Site Name' }} *</legend>
          <input
            v-model="form.name"
            type="text"
            class="input w-full"
            required
          >
        </fieldset>

        <fieldset class="fieldset">
          <legend class="fieldset-legend">{{ isZh ? '网站链接' : 'Site URL' }} *</legend>
          <input
            v-model="form.site_url"
            type="url"
            placeholder="https://example.com"
            class="input w-full"
            required
          >
        </fieldset>

        <fieldset class="fieldset">
          <legend class="fieldset-legend">{{ isZh ? '网站介绍' : 'Description' }}</legend>
          <textarea
            v-model="form.description"
            class="textarea h-24 w-full"
          />
        </fieldset>

        <fieldset class="fieldset">
          <legend class="fieldset-legend">{{ isZh ? '分类' : 'Categories' }}</legend>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="cat in categoryOptions"
              :key="cat.value"
              type="button"
              class="badge badge-lg cursor-pointer transition-all"
              :class="form.categories.includes(cat.value) ? 'badge-primary' : 'badge-outline hover:badge-primary'"
              @click="toggleCategory(cat.value)"
            >
              {{ isZh ? cat.labelZh : cat.labelEn }}
            </button>
          </div>
        </fieldset>

        <fieldset class="fieldset">
          <legend class="fieldset-legend">{{ isZh ? '网站图标' : 'Site Icon' }}</legend>
          <FileUpload
            v-model="form.iconFileId"
            :hint="isZh ? '支持 JPG, PNG, WebP, SVG，最大 5MB' : 'JPG, PNG, WebP, SVG. Max 5MB'"
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
            {{ isZh ? '提交修改' : 'Submit Changes' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
