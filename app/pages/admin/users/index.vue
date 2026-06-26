<script setup lang="ts">
import {
  Users,
  Mail,
  CheckCircle,
  FileText,
  Globe,
  Search,
  Edit,
  Trash2,
  Check,
} from '@lucide/vue'

const { locale } = useI18n()
const localePath = useLocalePath()
const lang = computed(() => locale.value)
const isZh = computed(() => lang.value === 'zh')

definePageMeta({ layout: 'admin', middleware: 'auth' })
useHead({ title: computed(() => isZh.value ? '用户管理' : 'Users') })

interface User {
  id: string
  name: string
  email: string
  emailVerified: boolean
  image?: string
  created: string
  submissionCount: number
  siteCount: number
}

const { data: usersData, refresh } = await useAsyncData(
  'admin-users',
  () => $fetch<{ users: User[] }>('/api/admin/icp/users'),
)

const users = computed(() => usersData.value?.users ?? [])

const searchQuery = ref('')
const filteredUsers = computed(() => {
  if (!searchQuery.value.trim()) return users.value
  const q = searchQuery.value.toLowerCase()
  return users.value.filter(u =>
    u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
  )
})

// Edit dialog
const editingUser = ref<User | null>(null)
const editForm = reactive({ name: '', email: '', emailVerified: false })
const isSaving = ref(false)

function startEdit(user: User) {
  editingUser.value = user
  editForm.name = user.name
  editForm.email = user.email
  editForm.emailVerified = user.emailVerified
}

async function saveEdit() {
  if (!editingUser.value || isSaving.value) return
  isSaving.value = true
  try {
    await $fetch(`/api/admin/users/${editingUser.value.id}`, {
      method: 'PATCH',
      body: { name: editForm.name, email: editForm.email, emailVerified: editForm.emailVerified },
    })
    editingUser.value = null
    await refresh()
  }
  catch (err: any) {
    alert(err.data?.statusMessage || (isZh.value ? '保存失败' : 'Save failed'))
  }
  finally {
    isSaving.value = false
  }
}

// Delete confirm dialog
const deletingUser = ref<User | null>(null)
const isDeleting = ref(false)

async function confirmDelete() {
  if (!deletingUser.value || isDeleting.value) return
  isDeleting.value = true
  try {
    await $fetch(`/api/admin/users/${deletingUser.value.id}`, { method: 'DELETE' })
    deletingUser.value = null
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
      <h2 class="text-2xl font-bold">{{ isZh ? '用户管理' : 'Users' }}</h2>
      <button class="btn btn-outline btn-sm" @click="refresh()">{{ isZh ? '刷新' : 'Refresh' }}</button>
    </div>

    <div class="relative max-w-md mb-6">
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
      <input
        v-model="searchQuery"
        type="text"
        class="input input-bordered w-full pl-10"
        :placeholder="isZh ? '搜索用户...' : 'Search users...'"
      >
    </div>

    <!-- Edit Dialog -->
    <AppDialog
      :open="!!editingUser"
      :title="isZh ? '编辑用户' : 'Edit User'"
      max-width="max-w-md"
      @update:open="!$event && (editingUser = null)"
    >
      <div class="space-y-4">
        <div class="form-control">
          <label class="label"><span class="label-text">{{ isZh ? '用户名' : 'Name' }} *</span></label>
          <input v-model="editForm.name" type="text" class="input input-bordered w-full" required>
        </div>
        <div class="form-control">
          <label class="label"><span class="label-text">{{ isZh ? '邮箱' : 'Email' }} *</span></label>
          <input v-model="editForm.email" type="email" class="input input-bordered w-full" required>
        </div>
        <label class="cursor-pointer label justify-start gap-3">
          <input v-model="editForm.emailVerified" type="checkbox" class="checkbox checkbox-primary">
          <span class="label-text">{{ isZh ? '邮箱已验证' : 'Email Verified' }}</span>
        </label>
      </div>
      <template #footer>
        <button class="btn" @click="editingUser = null">{{ isZh ? '取消' : 'Cancel' }}</button>
        <button
          class="btn btn-primary"
          :disabled="isSaving || !editForm.name || !editForm.email"
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
      :open="!!deletingUser"
      :title="isZh ? '确认删除' : 'Confirm Delete'"
      max-width="max-w-sm"
      @update:open="!$event && (deletingUser = null)"
    >
      <p class="text-sm">
        {{ isZh
          ? `确定要删除用户"${deletingUser?.name || deletingUser?.email}"吗？此操作不可撤销。`
          : `Are you sure you want to delete "${deletingUser?.name || deletingUser?.email}"? This cannot be undone.`
        }}
      </p>
      <template #footer>
        <button class="btn" @click="deletingUser = null">{{ isZh ? '取消' : 'Cancel' }}</button>
        <button class="btn btn-error" :disabled="isDeleting" @click="confirmDelete">
          <span v-if="isDeleting" class="loading loading-spinner loading-sm" />
          <Trash2 v-else class="w-4 h-4 mr-1" />
          {{ isZh ? '删除' : 'Delete' }}
        </button>
      </template>
    </AppDialog>

    <!-- Empty state -->
    <div v-if="filteredUsers.length === 0" class="card bg-base-200 p-12 text-center">
      <Users class="w-16 h-16 mx-auto mb-4 opacity-30" />
      <p class="text-lg opacity-60">{{ isZh ? '暂无用户' : 'No users found' }}</p>
    </div>

    <!-- Users table -->
    <div v-else class="overflow-x-auto">
      <table class="table table-zebra">
        <thead>
          <tr>
            <th>{{ isZh ? '用户' : 'User' }}</th>
            <th>{{ isZh ? '邮箱' : 'Email' }}</th>
            <th>{{ isZh ? '邮箱验证' : 'Verified' }}</th>
            <th>{{ isZh ? '提交数' : 'Submissions' }}</th>
            <th>{{ isZh ? '站点数' : 'Sites' }}</th>
            <th>{{ isZh ? '注册时间' : 'Joined' }}</th>
            <th>{{ isZh ? '操作' : 'Actions' }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in filteredUsers" :key="u.id">
            <td>
              <div class="flex items-center gap-3">
                <img
                  v-if="u.image"
                  :src="u.image"
                  :alt="u.name"
                  class="w-8 h-8 rounded-full object-cover"
                >
                <div v-else class="w-8 h-8 rounded-full bg-neutral text-neutral-content flex items-center justify-center text-xs font-bold">
                  {{ u.name?.charAt(0)?.toUpperCase() || '?' }}
                </div>
                <div>
                  <p class="font-bold text-sm">{{ u.name || (isZh ? '未设置' : 'Not set') }}</p>
                  <p class="text-xs opacity-60 font-mono">{{ u.id.slice(0, 8) }}…</p>
                </div>
              </div>
            </td>
            <td>
              <div class="flex items-center gap-1">
                <Mail class="w-3 h-3 opacity-50" />
                <span class="text-sm">{{ u.email }}</span>
              </div>
            </td>
            <td>
              <CheckCircle class="w-4 h-4" :class="u.emailVerified ? 'text-success' : 'text-base-300'" />
            </td>
            <td>
              <div class="flex items-center gap-1">
                <FileText class="w-3 h-3 opacity-50" />
                <span>{{ u.submissionCount }}</span>
              </div>
            </td>
            <td>
              <div class="flex items-center gap-1">
                <Globe class="w-3 h-3 opacity-50" />
                <span>{{ u.siteCount }}</span>
              </div>
            </td>
            <td>
              <span class="text-sm opacity-60">
                {{ new Date(u.created).toLocaleDateString(isZh ? 'zh-CN' : 'en-US') }}
              </span>
            </td>
            <td>
              <div class="flex gap-1">
                <button class="btn btn-ghost btn-xs" @click="startEdit(u)">
                  <Edit class="w-3 h-3" />
                </button>
                <button class="btn btn-ghost btn-xs text-error" @click="deletingUser = u">
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
