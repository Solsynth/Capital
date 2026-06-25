<script setup lang="ts">
import {
  User,
  Building2,
  Search,
  Trash2,
  Edit,
  X,
  Check,
} from '@lucide/vue'

const { locale } = useI18n()
const localePath = useLocalePath()

const lang = computed(() => locale.value)
const isZh = computed(() => lang.value === 'zh')

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

useHead({
  title: computed(() => isZh.value ? '身份管理' : 'Identities'),
})

interface Identity {
  id: string
  name: string
  type: 'individual' | 'organization'
  description?: string
  icon?: string
  iconFileId?: string | null
  created: string
  user: {
    id: string
    name: string
    email: string
  }
}

const { data: identitiesData, refresh } = await useAsyncData(
  'admin-identities',
  () => $fetch<{ identities: Identity[] }>('/api/admin/icp/identities')
)

const identities = computed(() => identitiesData.value?.identities ?? [])

const searchQuery = ref('')
const filteredIdentities = computed(() => {
  if (!searchQuery.value.trim()) return identities.value
  const q = searchQuery.value.toLowerCase()
  return identities.value.filter(i =>
    i.name.toLowerCase().includes(q) ||
    i.user?.name?.toLowerCase().includes(q) ||
    i.user?.email?.toLowerCase().includes(q)
  )
})

// Edit state
const editingIdentity = ref<Identity | null>(null)
const editForm = reactive({
  name: '',
  type: 'individual' as 'individual' | 'organization',
  description: '',
  iconFileId: null as string | null,
  iconUrl: null as string | null,
})
const isSaving = ref(false)

function getTypeLabel(type: string) {
  return type === 'organization'
    ? (isZh.value ? '组织' : 'Organization')
    : (isZh.value ? '个人' : 'Individual')
}

function getTypeIcon(type: string) {
  return type === 'organization' ? Building2 : User
}

function startEdit(identity: Identity) {
  editingIdentity.value = identity
  editForm.name = identity.name
  editForm.type = identity.type
  editForm.description = identity.description || ''
  editForm.iconFileId = identity.iconFileId || null
  editForm.iconUrl = identity.icon || null
}

function cancelEdit() {
  editingIdentity.value = null
  editForm.iconFileId = null
  editForm.iconUrl = null
}

function handleIconUploaded(fileId: string, url: string) {
  editForm.iconFileId = fileId
  editForm.iconUrl = url
}

function handleIconRemoved() {
  editForm.iconFileId = null
  editForm.iconUrl = null
}

async function saveEdit() {
  if (!editingIdentity.value || isSaving.value) return

  isSaving.value = true

  try {
    await $fetch(`/api/admin/icp/identities/${editingIdentity.value.id}`, {
      method: 'PATCH',
      body: {
        name: editForm.name,
        type: editForm.type,
        description: editForm.description || null,
        iconFileId: editForm.iconFileId,
        icon: editForm.iconUrl,
      },
    })

    editingIdentity.value = null
    await refresh()
  }
  catch (err: any) {
    alert(err.data?.statusMessage || (isZh.value ? '保存失败' : 'Save failed'))
  }
  finally {
    isSaving.value = false
  }
}

async function handleDelete(identity: Identity) {
  const confirmMessage = isZh.value
    ? `确定要删除身份"${identity.name}"吗？`
    : `Are you sure you want to delete identity "${identity.name}"?`

  if (!confirm(confirmMessage)) return

  try {
    await $fetch(`/api/admin/icp/identities/${identity.id}`, {
      method: 'DELETE',
    })
    await refresh()
  }
  catch (err: any) {
    alert(err.data?.statusMessage || (isZh.value ? '删除失败' : 'Delete failed'))
  }
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold">
        {{ isZh ? '身份管理' : 'Identities' }}
      </h2>
      <button class="btn btn-outline btn-sm" @click="refresh()">
        {{ isZh ? '刷新' : 'Refresh' }}
      </button>
    </div>

    <div class="relative max-w-md mb-6">
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
      <input
        v-model="searchQuery"
        type="text"
        class="input input-bordered w-full pl-10"
        :placeholder="isZh ? '搜索身份...' : 'Search identities...'"
      >
    </div>

    <!-- Edit Modal -->
    <dialog v-if="editingIdentity" class="modal modal-open">
      <div class="modal-box">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-lg">
            {{ isZh ? '编辑身份' : 'Edit Identity' }}
          </h3>
          <button class="btn btn-ghost btn-sm btn-circle" @click="cancelEdit">
            <X class="w-4 h-4" />
          </button>
        </div>

        <div class="space-y-4">
          <!-- Icon Upload -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">{{ isZh ? '图标' : 'Icon' }}</span>
            </label>
            <IconUpload
              :current-icon="editForm.iconUrl"
              folder="icp/identities"
              @uploaded="handleIconUploaded"
              @removed="handleIconRemoved"
            />
          </div>

          <!-- Type -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">{{ isZh ? '类型' : 'Type' }} *</span>
            </label>
            <div class="flex gap-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="editForm.type"
                  type="radio"
                  value="individual"
                  class="radio radio-primary"
                >
                <User class="w-4 h-4" />
                {{ isZh ? '个人' : 'Individual' }}
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="editForm.type"
                  type="radio"
                  value="organization"
                  class="radio radio-primary"
                >
                <Building2 class="w-4 h-4" />
                {{ isZh ? '组织' : 'Organization' }}
              </label>
            </div>
          </div>

          <!-- Name -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">{{ isZh ? '名称' : 'Name' }} *</span>
            </label>
            <input
              v-model="editForm.name"
              type="text"
              class="input input-bordered w-full"
              required
            >
          </div>

          <!-- Description -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">{{ isZh ? '介绍' : 'Description' }}</span>
            </label>
            <textarea
              v-model="editForm.description"
              class="textarea textarea-bordered w-full h-20"
            />
          </div>
        </div>

        <div class="modal-action">
          <button class="btn" @click="cancelEdit">
            {{ isZh ? '取消' : 'Cancel' }}
          </button>
          <button
            class="btn btn-primary"
            :disabled="isSaving || !editForm.name"
            @click="saveEdit"
          >
            <span v-if="isSaving" class="loading loading-spinner loading-sm" />
            <Check v-else class="w-4 h-4 mr-1" />
            {{ isZh ? '保存' : 'Save' }}
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="cancelEdit">close</button>
      </form>
    </dialog>

    <div v-if="filteredIdentities.length === 0" class="card bg-base-200 p-12 text-center">
      <User class="w-16 h-16 mx-auto mb-4 opacity-30" />
      <p class="text-lg opacity-60">
        {{ isZh ? '暂无身份' : 'No identities found' }}
      </p>
    </div>

    <div v-else class="overflow-x-auto">
      <table class="table table-zebra">
        <thead>
          <tr>
            <th>{{ isZh ? '身份' : 'Identity' }}</th>
            <th>{{ isZh ? '类型' : 'Type' }}</th>
            <th>{{ isZh ? '所属用户' : 'Owner' }}</th>
            <th>{{ isZh ? '创建时间' : 'Created' }}</th>
            <th>{{ isZh ? '操作' : 'Actions' }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="identity in filteredIdentities" :key="identity.id">
            <td>
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg overflow-hidden bg-base-300 flex items-center justify-center">
                  <img
                    v-if="identity.icon"
                    :src="identity.icon"
                    :alt="identity.name"
                    class="w-full h-full object-cover"
                  >
                  <component
                    v-else
                    :is="getTypeIcon(identity.type)"
                    class="w-4 h-4 opacity-60"
                  />
                </div>
                <div>
                  <p class="font-bold">{{ identity.name }}</p>
                  <p v-if="identity.description" class="text-xs opacity-60 truncate max-w-xs">
                    {{ identity.description }}
                  </p>
                </div>
              </div>
            </td>
            <td>
              <span class="badge badge-sm" :class="identity.type === 'organization' ? 'badge-primary' : 'badge-ghost'">
                {{ getTypeLabel(identity.type) }}
              </span>
            </td>
            <td>
              <div>
                <p class="text-sm">{{ identity.user?.name || (isZh ? '未知' : 'Unknown') }}</p>
                <p class="text-xs opacity-60">{{ identity.user?.email }}</p>
              </div>
            </td>
            <td>
              <span class="text-sm opacity-60">
                {{ new Date(identity.created).toLocaleDateString(isZh ? 'zh-CN' : 'en-US') }}
              </span>
            </td>
            <td>
              <div class="flex gap-1">
                <button
                  class="btn btn-ghost btn-xs"
                  @click="startEdit(identity)"
                >
                  <Edit class="w-3 h-3" />
                </button>
                <button
                  class="btn btn-ghost btn-xs text-error"
                  @click="handleDelete(identity)"
                >
                  <Trash2 class="w-3 h-3" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
