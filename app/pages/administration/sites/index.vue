<script setup lang="ts">
import {
  Globe,
  CheckCircle,
  ExternalLink,
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
  title: computed(() => isZh.value ? '站点管理' : 'Sites'),
})

interface Site {
  id: string
  filling_no: string
  domain: string
  name: string
  description?: string
  site_url: string
  icon?: string
  approved: boolean
  iconUrl: string | null
}

const { data: sitesData, refresh } = await useAsyncData(
  'admin-sites',
  () => $fetch<{ sites: Site[] }>('/api/icp/sites')
)

const sites = computed(() => sitesData.value?.sites ?? [])

const searchQuery = ref('')
const filteredSites = computed(() => {
  if (!searchQuery.value.trim()) return sites.value
  const q = searchQuery.value.toLowerCase()
  return sites.value.filter(s =>
    s.name.toLowerCase().includes(q) ||
    s.domain.toLowerCase().includes(q)
  )
})
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold">
        {{ isZh ? '站点管理' : 'Sites' }}
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
        :placeholder="isZh ? '搜索站点...' : 'Search sites...'"
      >
    </div>

    <div v-if="filteredSites.length === 0" class="card bg-base-200 p-12 text-center">
      <Globe class="w-16 h-16 mx-auto mb-4 opacity-30" />
      <p class="text-lg opacity-60">
        {{ isZh ? '暂无站点' : 'No sites found' }}
      </p>
    </div>

    <div v-else class="overflow-x-auto">
      <table class="table table-zebra">
        <thead>
          <tr>
            <th>{{ isZh ? '站点名称' : 'Site Name' }}</th>
            <th>{{ isZh ? '域名' : 'Domain' }}</th>
            <th>{{ isZh ? '备案号' : 'Filling No' }}</th>
            <th>{{ isZh ? '状态' : 'Status' }}</th>
            <th>{{ isZh ? '操作' : 'Actions' }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="site in filteredSites" :key="site.id">
            <td>
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg overflow-hidden bg-base-300 flex items-center justify-center">
                  <img v-if="site.iconUrl" :src="site.iconUrl" :alt="site.name" class="w-full h-full object-cover">
                  <Globe v-else class="w-4 h-4 opacity-50" />
                </div>
                <div>
                  <p class="font-bold">{{ site.name }}</p>
                  <p v-if="site.description" class="text-xs opacity-60 truncate max-w-xs">
                    {{ site.description }}
                  </p>
                </div>
              </div>
            </td>
            <td>
              <code class="text-xs">{{ site.domain }}</code>
            </td>
            <td>
              <code class="text-xs">{{ site.filling_no }}</code>
            </td>
            <td>
              <span class="badge badge-sm" :class="site.approved ? 'badge-success' : 'badge-warning'">
                <CheckCircle v-if="site.approved" class="w-3 h-3 mr-1" />
                {{ site.approved ? (isZh ? '已认证' : 'Certified') : (isZh ? '待审核' : 'Pending') }}
              </span>
            </td>
            <td>
              <NuxtLink
                :to="localePath(`/icp/${site.filling_no}`)"
                class="btn btn-ghost btn-xs"
              >
                <ExternalLink class="w-3 h-3" />
              </NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
