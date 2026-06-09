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
  Camera,
} from '@lucide/vue'

const { t, locale } = useI18n()
const localePath = useLocalePath()

const lang = computed(() => locale.value)
const isZh = computed(() => lang.value === 'zh')

const pageTitle = computed(() => isZh.value ? '管理身份 - 中羊网备' : 'Manage Identities - ROY ICP')

definePageMeta({
  middleware: 'auth',
})

useHead({
  title: pageTitle,
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
  () => $fetch<{ identities: Identity[] }>('/api/icp/identities')
)

const identities = computed(() => identitiesData.value?.identities ?? [])

// Form state
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
    formError.value = isZh.value ? '请输入名称' : 'Name is required'
    return
  }

  isSubmitting.value = true
  formError.value = null

  try {
    if (editingIdentity.value) {
      // Update existing identity
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
      // Create new identity
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
    formError.value = err.data?.statusMessage || (isZh.value ? '操作失败，请重试' : 'Action failed, please try again')
  }
  finally {
    isSubmitting.value = false
  }
}

async function handleDelete(identity: Identity) {
  const confirmMessage = isZh.value
    ? `确定要删除身份"${identity.name}"吗？`
    : `Are you sure you want to delete identity "${identity.name}"?`

  if (!confirm(confirmMessage)) return

  try {
    await $fetch(`/api/icp/identities/${identity.id}`, {
      method: 'DELETE',
    })
    await refresh()
  }
  catch (err: any) {
    alert(err.data?.statusMessage || (isZh.value ? '删除失败' : 'Delete failed'))
  }
}

function getTypeLabel(type: string) {
  return type === 'organization'
    ? (isZh.value ? '组织' : 'Organization')
    : (isZh.value ? '个人' : 'Individual')
}

function getTypeIcon(type: string) {
  return type === 'organization' ? Building2 : User
}
</script>

<template>
  <div class="container mx-auto px-4 py-16 max-w-3xl">
    <NuxtLink
      :to="localePath('/icp')"
      class="btn btn-ghost btn-sm mb-8"
    >
      <ArrowLeft class="w-4 h-4 mr-1" />
      {{ isZh ? '返回目录' : 'Back to Directory' }}
    </NuxtLink>

    <div class="flex items-center justify-between mb-8">
      <div class="flex items-center gap-4">
        <User class="w-10 h-10 text-primary" />
        <div>
          <h1 class="text-3xl font-bold">
            {{ isZh ? '管理身份' : 'Manage Identities' }}
          </h1>
          <p class="opacity-70">
            {{ isZh ? '创建和管理您的备案主体' : 'Create and manage your filing identities' }}
          </p>
        </div>
      </div>

      <button
        class="btn btn-primary"
        @click="openCreateForm"
      >
        <Plus class="w-4 h-4 mr-1" />
        {{ isZh ? '新建身份' : 'New Identity' }}
      </button>
    </div>

    <!-- Identity Form Modal -->
    <div v-if="showForm" class="card bg-base-200 p-6 mb-8">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold">
          {{ editingIdentity
            ? (isZh ? '编辑身份' : 'Edit Identity')
            : (isZh ? '新建身份' : 'New Identity')
          }}
        </h2>
        <button class="btn btn-ghost btn-sm btn-circle" @click="closeForm">
          <X class="w-4 h-4" />
        </button>
      </div>

      <div v-if="formError" class="alert alert-error mb-4">
        <span>{{ formError }}</span>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <fieldset class="fieldset">
          <legend class="fieldset-legend">{{ isZh ? '身份类型' : 'Identity Type' }} *</legend>
          <div class="flex gap-4">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="form.type"
                type="radio"
                value="individual"
                class="radio radio-primary"
              >
              <User class="w-4 h-4" />
              {{ isZh ? '个人' : 'Individual' }}
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="form.type"
                type="radio"
                value="organization"
                class="radio radio-primary"
              >
              <Building2 class="w-4 h-4" />
              {{ isZh ? '组织' : 'Organization' }}
            </label>
          </div>
        </fieldset>

        <fieldset class="fieldset">
          <legend class="fieldset-legend">{{ isZh ? '名称' : 'Name' }} *</legend>
          <input
            v-model="form.name"
            type="text"
            :placeholder="form.type === 'organization'
              ? (isZh ? '公司或组织名称' : 'Company or organization name')
              : (isZh ? '您的姓名' : 'Your name')"
            class="input w-full"
            required
          >
        </fieldset>

        <fieldset class="fieldset">
          <legend class="fieldset-legend">{{ isZh ? '介绍' : 'Description' }}</legend>
          <textarea
            v-model="form.description"
            :placeholder="isZh ? '简要介绍...' : 'Brief description...'"
            class="textarea h-20 w-full"
          />
        </fieldset>

        <fieldset class="fieldset">
          <legend class="fieldset-legend">{{ isZh ? '图标' : 'Icon' }}</legend>
          <FileUpload
            v-model="form.iconFileId"
            :hint="isZh ? '支持 JPG, PNG, WebP, SVG，最大 5MB' : 'JPG, PNG, WebP, SVG. Max 5MB'"
            compact
          />
          <p class="label">{{ isZh ? '选填，建议 256x256 正方形' : 'Optional, 256x256 square recommended' }}</p>
        </fieldset>

        <div class="flex gap-4">
          <button
            type="submit"
            class="btn btn-primary flex-1"
            :disabled="isSubmitting"
          >
            <span v-if="isSubmitting" class="loading loading-spinner loading-sm" />
            <Check v-else class="w-4 h-4 mr-1" />
            {{ editingIdentity
              ? (isZh ? '保存' : 'Save')
              : (isZh ? '创建' : 'Create')
            }}
          </button>
          <button
            type="button"
            class="btn btn-ghost"
            @click="closeForm"
          >
            {{ isZh ? '取消' : 'Cancel' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Identities List -->
    <div v-if="identities.length === 0 && !showForm" class="card bg-base-200 p-12 text-center">
      <User class="w-16 h-16 mx-auto mb-4 opacity-30" />
      <p class="text-lg opacity-60 mb-4">
        {{ isZh ? '暂无身份' : 'No identities yet' }}
      </p>
      <button class="btn btn-primary" @click="openCreateForm">
        <Plus class="w-4 h-4 mr-1" />
        {{ isZh ? '创建第一个身份' : 'Create your first identity' }}
      </button>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="identity in identities"
        :key="identity.id"
        class="card bg-base-200 p-6"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-xl overflow-hidden bg-base-100 flex items-center justify-center">
              <img
                v-if="identity.icon"
                :src="identity.icon"
                :alt="identity.name"
                class="w-full h-full object-cover"
              >
              <component
                v-else
                :is="getTypeIcon(identity.type)"
                class="w-6 h-6 opacity-60"
              />
            </div>
            <div>
              <div class="flex items-center gap-2 mb-1">
                <h3 class="font-bold text-lg">{{ identity.name }}</h3>
                <span class="badge badge-sm" :class="identity.type === 'organization' ? 'badge-primary' : 'badge-ghost'">
                  {{ getTypeLabel(identity.type) }}
                </span>
              </div>
              <p v-if="identity.description" class="text-sm opacity-70">
                {{ identity.description }}
              </p>
              <p class="text-xs opacity-50 mt-2">
                {{ isZh ? '创建于' : 'Created' }}: {{ new Date(identity.created).toLocaleDateString(isZh ? 'zh-CN' : 'en-US') }}
              </p>
            </div>
          </div>

          <div class="flex gap-2">
            <button
              class="btn btn-ghost btn-sm"
              @click="openEditForm(identity)"
            >
              <Edit class="w-4 h-4" />
            </button>
            <button
              class="btn btn-ghost btn-sm text-error"
              @click="handleDelete(identity)"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
