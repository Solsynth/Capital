<script setup lang="ts">
import {
  User,
  Building2,
  Search,
  Trash2,
  Edit,
  Check,
  Link,
} from '@lucide/vue'

const { locale } = useI18n()
const localePath = useLocalePath()
const lang = computed(() => locale.value)
const isZh = computed(() => lang.value === 'zh')

definePageMeta({ layout: 'admin', middleware: 'auth' })
useHead({ title: computed(() => isZh.value ? '身份管理' : 'Identities') })

interface Identity {
  id: string
  name: string
  type: 'individual' | 'organization'
  description?: string
  icon?: string
  iconFileId?: string | null
  userId: string
  created: string
  user: { id: string; name: string; email: string }
}

interface UserOption { id: string; name: string; email: string }

const { data: identitiesData, refresh } = await useAsyncData(
  'admin-identities',
  () => $fetch<{ identities: Identity[] }>('/api/admin/icp/identities'),
)

// Fetch users for reassociation dropdown
const { data: usersData } = await useAsyncData(
  'admin-users-list',
  () => $fetch<{ users: UserOption[] }>('/api/admin/icp/users'),
)

const identities = computed(() => identitiesData.value?.identities ?? [])
const allUsers = computed(() => usersData.value?.users ?? [])

const searchQuery = ref('')
const filteredIdentities = computed(() => {
  if (!searchQuery.value.trim()) return identities.value
  const q = searchQuery.value.toLowerCase()
  return identities.value.filter(i =>
    i.name.toLowerCase().includes(q) ||
    i.user?.name?.toLowerCase().includes(q) ||
    i.user?.email?.toLowerCase().includes(q),
  )
})

function getTypeLabel(type: string) {
  return type === 'organization' ? (isZh.value ? '组织' : 'Organization') : (isZh.value ? '个人' : 'Individual')
}

function getTypeIcon(type: string) {
  return type === 'organization' ? Building2 : User
}

// Edit dialog
const editingIdentity = ref<Identity | null>(null)
const editForm = reactive({
  name: '',
  type: 'individual' as 'individual' | 'organization',
  description: '',
  iconFileId: null as string | null,
  iconUrl: null as string | null,
  userId: '',
  userSearch: '',
})
const isSaving = ref(false)

function startEdit(identity: Identity) {
  editingIdentity.value = identity
  editForm.name = identity.name
  editForm.type = identity.type
  editForm.description = identity.description || ''
  editForm.iconFileId = identity.iconFileId || null
  editForm.iconUrl = identity.icon || null
  editForm.userId = identity.userId
  editForm.userSearch = identity.user?.email || ''
}

function selectUser(user: UserOption) {
  editForm.userId = user.id
  editForm.userSearch = user.email
}

const filteredUserOptions = computed(() => {
  if (!editForm.userSearch) return []
  const q = editForm.userSearch.toLowerCase()
  return allUsers.value.filter(u =>
    u.id !== editForm.userId && (
      u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    ),
  ).slice(0, 5)
})

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
        userId: editForm.userId,
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

// Delete confirm
const deletingIdentity = ref<Identity | null>(null)
const isDeleting = ref(false)

async function confirmDelete() {
  if (!deletingIdentity.value || isDeleting.value) return
  isDeleting.value = true
  try {
    await $fetch(`/api/admin/icp/identities/${deletingIdentity.value.id}`, { method: 'DELETE' })
    deletingIdentity.value = null
    await refresh()
  }
  catch (err: any) {
    alert(err.data?.statusMessage || (isZh.value ? '删除失败' : 'Delete failed'))
  }
  finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold">{{ isZh ? '身份管理' : 'Identities' }}</h2>
      <button class="btn btn-outline btn-sm" @click="refresh()">{{ isZh ? '刷新' : 'Refresh' }}</button>
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

    <!-- Edit Dialog -->
    <AppDialog
      :open="!!editingIdentity"
      :title="isZh ? '编辑身份' : 'Edit Identity'"
      max-width="max-w-md"
      @update:open="!$event && (editingIdentity = null)"
    >
      <div class="space-y-4">
        <!-- Icon -->
        <div class="form-control">
          <label class="label"><span class="label-text">{{ isZh ? '图标' : 'Icon' }}</span></label>
          <IconUpload
            :current-icon="editForm.iconUrl"
            folder="icp/identities"
            @uploaded="handleIconUploaded"
            @removed="handleIconRemoved"
          />
        </div>

        <!-- Type -->
        <div class="form-control">
          <label class="label"><span class="label-text">{{ isZh ? '类型' : 'Type' }} *</span></label>
          <select v-model="editForm.type" class="select select-bordered w-full">
            <option value="individual">{{ isZh ? '个人' : 'Individual' }}</option>
            <option value="organization">{{ isZh ? '组织' : 'Organization' }}</option>
          </select>
        </div>

        <!-- Name -->
        <div class="form-control">
          <label class="label"><span class="label-text">{{ isZh ? '名称' : 'Name' }} *</span></label>
          <input v-model="editForm.name" type="text" class="input input-bordered w-full" required>
        </div>

        <!-- Description -->
        <div class="form-control">
          <label class="label"><span class="label-text">{{ isZh ? '介绍' : 'Description' }}</span></label>
          <textarea v-model="editForm.description" class="textarea textarea-bordered w-full h-20" />
        </div>

        <!-- Reassociate user -->
        <div class="form-control">
          <label class="label">
            <span class="label-text flex items-center gap-1.5">
              <Link class="w-3.5 h-3.5" />
              {{ isZh ? '关联用户' : 'Associated User' }}
            </span>
          </label>
          <div class="relative">
            <input
              v-model="editForm.userSearch"
              type="text"
              class="input input-bordered w-full"
              :placeholder="isZh ? '搜索邮箱或用户名...' : 'Search email or name...'"
            >
            <div
              v-if="filteredUserOptions.length"
              class="absolute top-full left-0 right-0 mt-1 bg-base-100 border border-base-content/10 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto"
            >
              <button
                v-for="u in filteredUserOptions"
                :key="u.id"
                class="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-base-200 text-sm transition-colors"
                @click="selectUser(u)"
              >
                <span class="font-medium">{{ u.name }}</span>
                <span class="opacity-50">{{ u.email }}</span>
              </button>
            </div>
          </div>
          <p class="text-xs opacity-50 mt-1">
            {{ isZh ? '当前：' : 'Current: ' }}{{ editingIdentity?.user?.name }} ({{ editingIdentity?.user?.email }})
          </p>
        </div>
      </div>

      <template #footer>
        <button class="btn" @click="editingIdentity = null">{{ isZh ? '取消' : 'Cancel' }}</button>
        <button
          class="btn btn-primary"
          :disabled="isSaving || !editForm.name"
          @click="saveEdit"
        >
          <span v-if="isSaving" class="loading loading-spinner loading-sm" />
          <Check v-else class="w-4 h-4 mr-1" />
          {{ isZh ? '保存' : 'Save' }}
        </button>
      </template>
    </AppDialog>

    <!-- Delete Confirm Dialog -->
    <AppDialog
      :open="!!deletingIdentity"
      :title="isZh ? '确认删除' : 'Confirm Delete'"
      max-width="max-w-sm"
      @update:open="!$event && (deletingIdentity = null)"
    >
      <p class="text-sm">
        {{ isZh
          ? `确定要删除身份"${deletingIdentity?.name}"吗？此操作不可撤销。`
          : `Are you sure you want to delete "${deletingIdentity?.name}"? This cannot be undone.`
        }}
      </p>
      <template #footer>
        <button class="btn" @click="deletingIdentity = null">{{ isZh ? '取消' : 'Cancel' }}</button>
        <button class="btn btn-error" :disabled="isDeleting" @click="confirmDelete">
          <span v-if="isDeleting" class="loading loading-spinner loading-sm" />
          <Trash2 v-else class="w-4 h-4 mr-1" />
          {{ isZh ? '删除' : 'Delete' }}
        </button>
      </template>
    </AppDialog>

    <!-- Empty state -->
    <div v-if="filteredIdentities.length === 0" class="card bg-base-200 p-12 text-center">
      <User class="w-16 h-16 mx-auto mb-4 opacity-30" />
      <p class="text-lg opacity-60">{{ isZh ? '暂无身份' : 'No identities found' }}</p>
    </div>

    <!-- Identities table -->
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
                  <img v-if="identity.icon" :src="identity.icon" :alt="identity.name" class="w-full h-full object-cover">
                  <component v-else :is="getTypeIcon(identity.type)" class="w-4 h-4 opacity-60" />
                </div>
                <div>
                  <p class="font-bold text-sm">{{ identity.name }}</p>
                  <p v-if="identity.description" class="text-xs opacity-60 truncate max-w-xs">{{ identity.description }}</p>
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
                <button class="btn btn-ghost btn-xs" @click="startEdit(identity)">
                  <Edit class="w-3 h-3" />
                </button>
                <button class="btn btn-ghost btn-xs text-error" @click="deletingIdentity = identity">
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
