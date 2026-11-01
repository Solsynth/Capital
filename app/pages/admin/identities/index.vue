<script setup lang="ts">
import {
  User,
  Building2,
  Search,
  Trash2,
  Edit,
  Check,
  Link,
  RefreshCw,
} from '@lucide/vue'

const { locale } = useI18n()
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
  () => useRequestFetch()<{ identities: Identity[] }>('/api/admin/icp/identities'),
)

// Fetch users for reassociation dropdown
const { data: usersData } = await useAsyncData(
  'admin-users-list',
  () => useRequestFetch()<{ users: UserOption[] }>('/api/admin/icp/users'),
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
    <div class="head">
      <div>
        <h2 class="admin-h">
          {{ isZh ? '身份管理' : 'Identities' }}
        </h2>
        <p class="admin-sub">
          {{ isZh ? '每个备案身份及其所属用户。' : 'Filing identities and the account each one belongs to.' }}
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
        :placeholder="isZh ? '搜索身份…' : 'Search identities…'"
      >
    </div>

    <AppDialog
      :open="!!editingIdentity"
      :title="isZh ? '编辑身份' : 'Edit identity'"
      max-width="max-w-md"
      @update:open="!$event && (editingIdentity = null)"
    >
      <div class="form-stack">
        <div>
          <span class="field-label">{{ isZh ? '图标' : 'Icon' }}</span>
          <IconUpload
            :current-icon="editForm.iconUrl"
            folder="icp/identities"
            @uploaded="handleIconUploaded"
            @removed="handleIconRemoved"
          />
        </div>

        <label>
          <span class="field-label">{{ isZh ? '类型' : 'Type' }}</span>
          <select v-model="editForm.type" class="select">
            <option value="individual">{{ isZh ? '个人' : 'Individual' }}</option>
            <option value="organization">{{ isZh ? '组织' : 'Organization' }}</option>
          </select>
        </label>

        <label>
          <span class="field-label">{{ isZh ? '名称' : 'Name' }}</span>
          <input v-model="editForm.name" type="text" class="input" required>
        </label>

        <label>
          <span class="field-label">{{ isZh ? '介绍' : 'Description' }}</span>
          <textarea v-model="editForm.description" class="textarea h-20" />
        </label>

        <div>
          <span class="field-label">
            <Link class="inline-icon" aria-hidden="true" />
            {{ isZh ? '关联用户' : 'Associated user' }}
          </span>
          <div class="picker">
            <input
              v-model="editForm.userSearch"
              type="text"
              class="input"
              :placeholder="isZh ? '搜索邮箱或用户名…' : 'Search email or name…'"
            >
            <div v-if="filteredUserOptions.length" class="picker-menu">
              <button
                v-for="u in filteredUserOptions"
                :key="u.id"
                type="button"
                class="picker-option"
                @click="selectUser(u)"
              >
                <span class="picker-name">{{ u.name }}</span>
                <span class="picker-email">{{ u.email }}</span>
              </button>
            </div>
          </div>
          <p class="picker-current">
            {{ isZh ? '当前：' : 'Current: ' }}{{ editingIdentity?.user?.name }} ({{ editingIdentity?.user?.email }})
          </p>
        </div>
      </div>

      <template #footer>
        <button class="btn" @click="editingIdentity = null">
          {{ isZh ? '取消' : 'Cancel' }}
        </button>
        <button
          class="btn btn-primary"
          :disabled="isSaving || !editForm.name"
          @click="saveEdit"
        >
          <span v-if="isSaving" class="spinner" />
          <Check v-else class="btn-icon" aria-hidden="true" />
          {{ isZh ? '保存' : 'Save' }}
        </button>
      </template>
    </AppDialog>

    <AppDialog
      :open="!!deletingIdentity"
      :title="isZh ? '确认删除' : 'Confirm delete'"
      max-width="max-w-sm"
      @update:open="!$event && (deletingIdentity = null)"
    >
      <p class="dialog-copy">
        {{ isZh
          ? `确定要删除身份"${deletingIdentity?.name}"吗？此操作不可撤销。`
          : `Are you sure you want to delete "${deletingIdentity?.name}"? This cannot be undone.`
        }}
      </p>
      <template #footer>
        <button class="btn" @click="deletingIdentity = null">
          {{ isZh ? '取消' : 'Cancel' }}
        </button>
        <button class="btn btn-error" :disabled="isDeleting" @click="confirmDelete">
          <span v-if="isDeleting" class="spinner" />
          <Trash2 v-else class="btn-icon" aria-hidden="true" />
          {{ isZh ? '删除' : 'Delete' }}
        </button>
      </template>
    </AppDialog>

    <div v-if="filteredIdentities.length" class="table-wrap">
      <table class="ledger">
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
              <div class="entity">
                <span class="entity-mark">
                  <img v-if="identity.icon" :src="identity.icon" :alt="identity.name">
                  <component :is="getTypeIcon(identity.type)" v-else class="entity-icon" aria-hidden="true" />
                </span>
                <span class="entity-text">
                  <span class="entity-name">{{ identity.name }}</span>
                  <span v-if="identity.description" class="entity-sub">{{ identity.description }}</span>
                </span>
              </div>
            </td>
            <td>
              <span class="chip">{{ getTypeLabel(identity.type) }}</span>
            </td>
            <td>
              <span class="entity-text">
                <span>{{ identity.user?.name || (isZh ? '未知' : 'Unknown') }}</span>
                <span class="entity-sub">{{ identity.user?.email }}</span>
              </span>
            </td>
            <td class="mono">
              {{ new Date(identity.created).toLocaleDateString(isZh ? 'zh-CN' : 'en-US') }}
            </td>
            <td>
              <div class="row-actions">
                <button class="btn btn-xs" :title="isZh ? '编辑' : 'Edit'" @click="startEdit(identity)">
                  <Edit class="btn-icon" aria-hidden="true" />
                </button>
                <button class="btn btn-xs" :title="isZh ? '删除' : 'Delete'" @click="deletingIdentity = identity">
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
        ? (isZh ? '没有匹配的身份。清空搜索以查看全部。' : 'No identities match that search. Clear the search to see them all.')
        : (isZh ? '暂无身份。' : 'No identities yet.')
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

.inline-icon {
  width: 0.75rem;
  height: 0.75rem;
  vertical-align: -1px;
  margin-right: 0.25rem;
}

.picker {
  position: relative;
}

.picker-menu {
  position: absolute;
  top: 100%;
  right: 0;
  left: 0;
  z-index: 10;
  max-height: 10rem;
  margin-top: 0.25rem;
  overflow-y: auto;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-input);
  background: var(--color-base-200);
}

.picker-option {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  width: 100%;
  padding: 0.5rem 0.7rem;
  border: 0;
  background: transparent;
  color: inherit;
  font-family: inherit;
  font-size: 0.8125rem;
  text-align: left;
  cursor: pointer;
}

.picker-option:hover {
  background: color-mix(in oklab, var(--color-base-300) 55%, transparent);
}

.picker-name {
  font-weight: 600;
}

.picker-email {
  font-size: 0.75rem;
  color: var(--color-faint);
}

.picker-current {
  margin: 0.4rem 0 0;
  font-size: 0.75rem;
  color: var(--color-faint);
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

.entity-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: var(--radius-mark);
  background: var(--color-base-300);
}

.entity-mark img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.entity-icon {
  width: 0.875rem;
  height: 0.875rem;
  color: var(--color-faint);
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

.entity-sub {
  overflow: hidden;
  font-size: 0.75rem;
  color: var(--color-faint);
  text-overflow: ellipsis;
  white-space: nowrap;
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
