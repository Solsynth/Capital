<script setup lang="ts">
import {
  Users,
  Mail,
  CheckCircle,
  FileText,
  Globe,
  Search,
} from 'lucide-vue-next'

const { locale } = useI18n()
const localePath = useLocalePath()

const lang = computed(() => locale.value)
const isZh = computed(() => lang.value === 'zh')

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

useHead({
  title: computed(() => isZh.value ? '用户管理 - 中羊网备' : 'Users - ROY ICP Admin'),
})

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
  () => $fetch<{ users: User[] }>('/api/icp/admin/users')
)

const users = computed(() => usersData.value?.users ?? [])

const searchQuery = ref('')
const filteredUsers = computed(() => {
  if (!searchQuery.value.trim()) return users.value
  const q = searchQuery.value.toLowerCase()
  return users.value.filter(u =>
    u.name.toLowerCase().includes(q) ||
    u.email.toLowerCase().includes(q)
  )
})
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold">
        {{ isZh ? '用户管理' : 'Users' }}
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
        :placeholder="isZh ? '搜索用户...' : 'Search users...'"
      >
    </div>

    <div v-if="filteredUsers.length === 0" class="card bg-base-200 p-12 text-center">
      <Users class="w-16 h-16 mx-auto mb-4 opacity-30" />
      <p class="text-lg opacity-60">
        {{ isZh ? '暂无用户' : 'No users found' }}
      </p>
    </div>

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
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in filteredUsers" :key="u.id">
            <td>
              <div class="flex items-center gap-3">
                <div class="avatar placeholder">
                  <div class="bg-neutral text-neutral-content rounded-full w-8">
                    <span class="text-xs">{{ u.name?.charAt(0)?.toUpperCase() || '?' }}</span>
                  </div>
                </div>
                <div>
                  <p class="font-bold">{{ u.name || (isZh ? '未设置' : 'Not set') }}</p>
                  <p class="text-xs opacity-60 font-mono">{{ u.id.slice(0, 8) }}...</p>
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
              <CheckCircle
                class="w-4 h-4"
                :class="u.emailVerified ? 'text-success' : 'text-base-300'"
              />
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
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
