<script setup lang="ts">
import {
  User,
  Building2,
  Search,
  Trash2,
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

function getTypeLabel(type: string) {
  return type === 'organization'
    ? (isZh.value ? '组织' : 'Organization')
    : (isZh.value ? '个人' : 'Individual')
}

function getTypeIcon(type: string) {
  return type === 'organization' ? Building2 : User
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
              <button
                class="btn btn-ghost btn-xs text-error"
                @click="handleDelete(identity)"
              >
                <Trash2 class="w-3 h-3" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
