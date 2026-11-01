<script setup lang="ts">
import {
  Mail,
  Search,
  Edit,
  Trash2,
  Check,
  RefreshCw,
} from '@lucide/vue'

const { locale } = useI18n()
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
  () => useRequestFetch()<{ users: User[] }>('/api/admin/icp/users'),
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
    <div class="head">
      <div>
        <h2 class="admin-h">
          {{ isZh ? '用户管理' : 'Users' }}
        </h2>
        <p class="admin-sub">
          {{ isZh ? '账号、邮箱验证状态与提交统计。' : 'Accounts, email verification, and submission totals.' }}
        </p>
      </div>
      <button class="btn btn-sm" @click="refresh()">
        <RefreshCw class="btn-icon" aria-hidden="true" />
        {{ isZh ? '刷新' : 'Refresh' }}
      </button>
    </div>

    <div class="search">
      <Search class="search-icon" aria-hidden="true" />
      <input
        v-model="searchQuery"
        type="search"
        class="input search-input"
        :placeholder="isZh ? '搜索用户…' : 'Search users…'"
      >
    </div>

    <AppDialog
      :open="!!editingUser"
      :title="isZh ? '编辑用户' : 'Edit user'"
      max-width="max-w-md"
      @update:open="!$event && (editingUser = null)"
    >
      <div class="form-stack">
        <label>
          <span class="field-label">{{ isZh ? '用户名' : 'Name' }}</span>
          <input v-model="editForm.name" type="text" class="input" required>
        </label>
        <label>
          <span class="field-label">{{ isZh ? '邮箱' : 'Email' }}</span>
          <input v-model="editForm.email" type="email" class="input" required>
        </label>
        <label class="check">
          <input v-model="editForm.emailVerified" type="checkbox">
          <span>{{ isZh ? '邮箱已验证' : 'Email verified' }}</span>
        </label>
      </div>
      <template #footer>
        <button class="btn" @click="editingUser = null">
          {{ isZh ? '取消' : 'Cancel' }}
        </button>
        <button
          class="btn btn-primary"
          :disabled="isSaving || !editForm.name || !editForm.email"
          @click="saveEdit"
        >
          <span v-if="isSaving" class="spinner" />
          <Check v-else class="btn-icon" aria-hidden="true" />
          {{ isZh ? '保存' : 'Save' }}
        </button>
      </template>
    </AppDialog>

    <AppDialog
      :open="!!deletingUser"
      :title="isZh ? '确认删除' : 'Confirm delete'"
      max-width="max-w-sm"
      @update:open="!$event && (deletingUser = null)"
    >
      <p class="dialog-copy">
        {{ isZh
          ? `确定要删除用户"${deletingUser?.name || deletingUser?.email}"吗？此操作不可撤销。`
          : `Are you sure you want to delete "${deletingUser?.name || deletingUser?.email}"? This cannot be undone.`
        }}
      </p>
      <template #footer>
        <button class="btn" @click="deletingUser = null">
          {{ isZh ? '取消' : 'Cancel' }}
        </button>
        <button class="btn btn-error" :disabled="isDeleting" @click="confirmDelete">
          <span v-if="isDeleting" class="spinner" />
          <Trash2 v-else class="btn-icon" aria-hidden="true" />
          {{ isZh ? '删除' : 'Delete' }}
        </button>
      </template>
    </AppDialog>

    <div v-if="filteredUsers.length" class="table-wrap">
      <table class="ledger">
        <thead>
          <tr>
            <th>{{ isZh ? '用户' : 'User' }}</th>
            <th>{{ isZh ? '邮箱' : 'Email' }}</th>
            <th>{{ isZh ? '已验证' : 'Verified' }}</th>
            <th>{{ isZh ? '提交数' : 'Submissions' }}</th>
            <th>{{ isZh ? '站点数' : 'Sites' }}</th>
            <th>{{ isZh ? '注册时间' : 'Joined' }}</th>
            <th>{{ isZh ? '操作' : 'Actions' }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in filteredUsers" :key="u.id">
            <td>
              <div class="entity">
                <img v-if="u.image" :src="u.image" :alt="u.name" class="entity-avatar">
                <span v-else class="entity-avatar entity-initial">
                  {{ u.name?.charAt(0)?.toUpperCase() || '?' }}
                </span>
                <span class="entity-text">
                  <span class="entity-name">{{ u.name || (isZh ? '未设置' : 'Not set') }}</span>
                  <span class="mono">{{ u.id.slice(0, 8) }}…</span>
                </span>
              </div>
            </td>
            <td>
              <span class="cell-mail">
                <Mail class="cell-icon" aria-hidden="true" />
                {{ u.email }}
              </span>
            </td>
            <td>
              <span v-if="u.emailVerified" class="status status-ok">
                <span class="dot" aria-hidden="true" />
                {{ isZh ? '已验证' : 'Verified' }}
              </span>
              <span v-else class="status status-muted">
                <span class="dot" aria-hidden="true" />
                {{ isZh ? '未验证' : 'Unverified' }}
              </span>
            </td>
            <td class="numeric">
              {{ u.submissionCount }}
            </td>
            <td class="numeric">
              {{ u.siteCount }}
            </td>
            <td class="mono">
              {{ new Date(u.created).toLocaleDateString(isZh ? 'zh-CN' : 'en-US') }}
            </td>
            <td>
              <div class="row-actions">
                <button class="btn btn-xs" :title="isZh ? '编辑' : 'Edit'" @click="startEdit(u)">
                  <Edit class="btn-icon" aria-hidden="true" />
                </button>
                <button class="btn btn-xs" :title="isZh ? '删除' : 'Delete'" @click="deletingUser = u">
                  <Trash2 class="btn-icon" aria-hidden="true" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-else class="empty">
      {{ searchQuery
        ? (isZh ? '没有匹配的用户。清空搜索以查看全部。' : 'No users match that search. Clear the search to see them all.')
        : (isZh ? '暂无用户。' : 'No users yet.')
      }}
    </p>
  </div>
</template>

<style scoped>
.head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.admin-h {
  margin: 0;
  font-size: 1.375rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.admin-sub {
  max-width: 40rem;
  margin: 0.35rem 0 0;
  font-size: 0.8125rem;
  color: var(--color-faint);
}

.btn-icon {
  width: 0.875rem;
  height: 0.875rem;
}

.search {
  position: relative;
  max-width: 22rem;
  margin-bottom: 1.25rem;
}

.search-icon {
  position: absolute;
  top: 50%;
  left: 0.75rem;
  width: 0.875rem;
  height: 0.875rem;
  color: var(--color-faint);
  transform: translateY(-50%);
  pointer-events: none;
}

.search-input {
  padding-left: 2.15rem;
}

.form-stack {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.check {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: var(--color-dim);
  cursor: pointer;
}

.check input {
  width: 0.9rem;
  height: 0.9rem;
  accent-color: var(--color-primary);
}

.dialog-copy {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--color-dim);
}

.table-wrap {
  overflow-x: auto;
}

.entity {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  min-width: 11rem;
}

.entity-avatar {
  width: 1.75rem;
  height: 1.75rem;
  flex-shrink: 0;
  border-radius: 999px;
  object-fit: cover;
}

.entity-initial {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-base-300);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-dim);
}

.entity-text {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
  font-size: 0.8125rem;
}

.entity-name {
  font-weight: 600;
  color: var(--color-base-content);
}

.cell-mail {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8125rem;
  color: var(--color-dim);
}

.cell-icon {
  width: 0.75rem;
  height: 0.75rem;
  color: var(--color-faint);
}

.status {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.status .dot {
  background: currentColor;
}

.status-ok {
  color: var(--color-success);
}

.status-muted {
  color: var(--color-faint);
}

.numeric {
  font-variant-numeric: tabular-nums;
}

.row-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.3rem;
}

.empty {
  margin: 0;
  padding: 1.5rem 0;
  font-size: 0.8125rem;
  color: var(--color-faint);
}
</style>
