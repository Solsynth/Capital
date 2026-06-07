<script setup lang="ts">
import {
  ArrowLeft,
  Globe,
  Send,
  Plus,
  User,
  Building2,
} from 'lucide-vue-next'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const router = useRouter()

const lang = computed(() => locale.value)
const isZh = computed(() => lang.value === 'zh')

const pageTitle = computed(() => isZh.value ? '提交新站点 - 中羊网备' : 'Submit New Site - ROY ICP')
const pageDescription = computed(() =>
  isZh.value
    ? '提交您的网站以获取中羊网备认证'
    : 'Submit your website for ROY ICP certification',
)

definePageMeta({
  middleware: 'auth',
})

useHead({
  title: pageTitle,
})

useSeoMeta({
  description: pageDescription,
  ogTitle: pageTitle,
  ogDescription: pageDescription,
})

interface Identity {
  id: string
  name: string
  type: 'individual' | 'organization'
  description?: string
}

// Fetch user's identities
const { data: identitiesData } = await useAsyncData(
  'icp-identities-for-submit',
  () => $fetch<{ identities: Identity[] }>('/api/icp/identities')
)

const identities = computed(() => identitiesData.value?.identities ?? [])

const form = reactive({
  identity_id: '',
  domain: '',
  name: '',
  description: '',
  site_url: '',
  categories: [] as string[],
})

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
  if (index === -1) {
    form.categories.push(value)
  } else {
    form.categories.splice(index, 1)
  }
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
        type: 'create',
        identity_id: form.identity_id,
        domain: form.domain,
        name: form.name,
        description: form.description || null,
        site_url: form.site_url,
        categories: form.categories.length > 0 ? form.categories : null,
      },
    })

    submitSuccess.value = true
    setTimeout(() => {
      router.push(localePath('/icp/my-submissions'))
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
      :to="localePath('/icp')"
      class="btn btn-ghost btn-sm mb-8"
    >
      <ArrowLeft class="w-4 h-4 mr-1" />
      {{ isZh ? '返回目录' : 'Back to Directory' }}
    </NuxtLink>

    <div class="card bg-base-200 p-8">
      <div class="flex items-center gap-4 mb-8">
        <Globe class="w-10 h-10 text-primary" />
        <div>
          <h1 class="text-3xl font-bold">
            {{ isZh ? '提交新站点' : 'Submit New Site' }}
          </h1>
          <p class="opacity-70">
            {{ pageDescription }}
          </p>
        </div>
      </div>

      <div v-if="submitSuccess" class="alert alert-success mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ isZh ? '提交成功！正在跳转...' : 'Submission successful! Redirecting...' }}</span>
      </div>

      <div v-if="submitError" class="alert alert-error mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ submitError }}</span>
      </div>

      <form v-if="!submitSuccess" @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Identity Selection -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-bold">{{ isZh ? '选择身份' : 'Select Identity' }} *</span>
          </label>

          <div v-if="identities.length === 0" class="alert alert-warning">
            <div>
              <p class="font-bold">{{ isZh ? '暂无身份' : 'No identities found' }}</p>
              <p class="text-sm">{{ isZh ? '请先创建一个身份' : 'Please create an identity first' }}</p>
            </div>
            <NuxtLink :to="localePath('/icp/identities')" class="btn btn-sm btn-primary">
              <Plus class="w-4 h-4 mr-1" />
              {{ isZh ? '创建身份' : 'Create Identity' }}
            </NuxtLink>
          </div>

          <div v-else class="space-y-2">
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
                <p v-if="identity.description" class="text-sm opacity-70">{{ identity.description }}</p>
              </div>
            </label>
          </div>

          <div class="mt-2">
            <NuxtLink :to="localePath('/icp/identities')" class="link link-primary text-sm">
              {{ isZh ? '管理身份' : 'Manage identities' }} →
            </NuxtLink>
          </div>
        </div>

        <div class="divider"></div>

        <div class="form-control">
          <label class="label">
            <span class="label-text font-bold">{{ isZh ? '域名' : 'Domain' }} *</span>
          </label>
          <input
            v-model="form.domain"
            type="text"
            placeholder="example.com"
            class="input input-bordered w-full"
            required
          >
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text font-bold">{{ isZh ? '网站名称' : 'Site Name' }} *</span>
          </label>
          <input
            v-model="form.name"
            type="text"
            :placeholder="isZh ? '我的网站' : 'My Website'"
            class="input input-bordered w-full"
            required
          >
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text font-bold">{{ isZh ? '网站链接' : 'Site URL' }} *</span>
          </label>
          <input
            v-model="form.site_url"
            type="url"
            placeholder="https://example.com"
            class="input input-bordered w-full"
            required
          >
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text font-bold">{{ isZh ? '网站介绍' : 'Description' }}</span>
          </label>
          <textarea
            v-model="form.description"
            :placeholder="isZh ? '简要介绍您的网站...' : 'Briefly describe your website...'"
            class="textarea textarea-bordered w-full h-24"
          />
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text font-bold">{{ isZh ? '分类' : 'Categories' }}</span>
          </label>
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
        </div>

        <div class="form-control mt-8">
          <button
            type="submit"
            class="btn btn-primary btn-lg w-full"
            :disabled="isSubmitting || identities.length === 0"
          >
            <span v-if="isSubmitting" class="loading loading-spinner loading-sm" />
            <Send v-else class="w-5 h-5 mr-2" />
            {{ isZh ? '提交申请' : 'Submit Application' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
