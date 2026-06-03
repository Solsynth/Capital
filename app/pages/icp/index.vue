<script setup lang="ts">
import {
  Search,
  ExternalLink,
  CheckCircle,
  Globe,
  CircleQuestionMark,
} from 'lucide-vue-next'

const { t, locale } = useI18n()
const localePath = useLocalePath()

const lang = computed(() => locale.value)
const isZh = computed(() => lang.value === 'zh')
const config = useRuntimeConfig()
const pbUrl = config.public.pbUrl as string
const maxVisibleSites = 3

const pageTitle = computed(() => isZh.value ? '中羊网备' : 'ROY ICP Filling')
const pageDescription = computed(() =>
  isZh.value
    ? '中华羊国网络信息办公室受信任网站列表'
    : 'Republic of Yang\'s friendly link list',
)

definePageMeta({
  title: '',
  description: '',
})

useHead({
  title: pageTitle,
})

useSeoMeta({
  description: pageDescription,
  ogTitle: pageTitle,
  ogDescription: pageDescription,
})
const emptyText = computed(() => t('royIcp.directory.empty'))
const pendingText = computed(() => isZh.value ? '待审核' : 'Pending')

interface SiteItem {
  id: string
  filling_no: string
  domain: string
  name: string
  approved: boolean
  iconUrl: string | null
}

const { data: sitesData } = await useAsyncData(`icp-sites-${lang.value}`, () =>
  $fetch<{ sites: SiteItem[] }>('/api/icp-sites'))

const allSites = computed(() => sitesData.value?.sites ?? [])
const visibleSites = computed(() => allSites.value.slice(0, maxVisibleSites))
const hiddenSiteCount = computed(() => Math.max(allSites.value.length - maxVisibleSites, 0))

const searchQuery = ref('')
const searchResults = ref<SiteItem[] | null>(null)
const isSearching = ref(false)
let debounceTimer: ReturnType<typeof setTimeout> | null = null
let requestId = 0

const displayedSites = computed(() => searchResults.value ?? visibleSites.value)

function onSearchInput(e: Event) {
  const raw = (e.target as HTMLInputElement).value
  searchQuery.value = raw

  if (debounceTimer) clearTimeout(debounceTimer)

  if (!raw.trim()) {
    searchResults.value = null
    isSearching.value = false
    requestId++
    return
  }

  isSearching.value = true
  debounceTimer = setTimeout(() => fetchSearch(raw), 300)
}

async function fetchSearch(raw: string) {
  const currentId = ++requestId
  try {
    const data = await $fetch<{ sites: SiteItem[] }>('/api/icp-sites', {
      params: { q: raw.trim() },
    })
    if (currentId !== requestId) return
    searchResults.value = data.sites
  }
  catch (err) {
    if (currentId !== requestId) return
    console.error('Failed to search ICP sites:', err)
    searchResults.value = []
  }
  finally {
    if (currentId === requestId) isSearching.value = false
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-20 max-w-3xl">
    <div class="text-center mb-12">
      <img
        src="/republic-of-yang/filling.png"
        alt="ROY ICP"
        class="w-16 h-16 mx-auto mb-8 rounded-2xl"
      >
      <h1 class="text-5xl font-bold mb-2">
        {{ pageTitle }}
      </h1>
      <div class="mb-8 max-w-xl mx-auto flex flex-row items-center justify-center gap-2">
        <p class="text-lg opacity-70">
          {{ pageDescription }}
        </p>
        <NuxtLink
          :to="localePath('/products/roy-filling')"
          class="btn btn-ghost btn-sm btn-circle"
        >
          <CircleQuestionMark class="w-4 h-4 mr-1" />
        </NuxtLink>
      </div>

      <div class="relative max-w-md mx-auto mb-6">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-50" />
        <input
          type="text"
          class="input input-bordered w-full pl-12 input-lg"
          :placeholder="isZh ? '搜索域名或网站名称...' : 'Search domain or site name...'"
          @input="onSearchInput"
        >
        <span
          v-if="isSearching"
          class="loading loading-spinner loading-sm absolute right-4 top-1/2 -translate-y-1/2"
        />
      </div>
    </div>

    <section>
      <h2 class="text-xl font-bold mb-6">
        {{ isZh ? '已认证域名' : 'Certified Domains' }}
      </h2>

      <div v-if="allSites.length === 0 && !searchQuery.trim()" class="card bg-base-200 p-12 text-center">
        <Globe class="w-16 h-16 mx-auto mb-4 opacity-30" />
        <p class="text-lg opacity-60">
          {{ emptyText }}
        </p>
      </div>

      <template v-else>
        <div class="space-y-3">
          <template v-if="displayedSites.length > 0">
            <NuxtLink
              v-for="site in displayedSites"
              :key="site.id"
              :to="localePath(`/icp/${site.filling_no}`)"
              class="card bg-base-200 hover:bg-base-300 transition-all p-4 flex flex-row items-center gap-4 group site-card"
            >
              <div class="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-base-100 flex items-center justify-center">
                <img
                  v-if="site.iconUrl"
                  :src="site.iconUrl"
                  :alt="site.name"
                  class="w-full h-full object-cover"
                >
                <Globe v-else class="w-5 h-5 opacity-50" />
              </div>
              <div class="flex-1 min-w-0 flex flex-col gap-1">
                <div class="flex items-center gap-2 min-w-0">
                  <h3 class="font-bold truncate group-hover:text-primary transition-colors">
                    {{ site.name }}
                  </h3>
                  <CheckCircle v-if="site.approved" class="w-4 h-4 text-success shrink-0" />
                  <span v-else class="badge badge-warning badge-outline shrink-0">
                    {{ pendingText }}
                  </span>
                </div>
                <code class="text-xs opacity-60 truncate">{{ site.domain }}</code>
              </div>
              <span class="text-xs opacity-50 shrink-0">
                <ExternalLink class="me-2" />
              </span>
            </NuxtLink>
          </template>

          <div v-else class="card bg-base-200 p-12 text-center">
            <Globe class="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p class="text-lg opacity-60">
              {{ emptyText }}
            </p>
          </div>
        </div>

        <p
          v-if="hiddenSiteCount > 0 && !searchQuery.trim()"
          class="mt-4 text-center text-sm opacity-60"
        >
          {{ isZh ? `+ ${hiddenSiteCount} 个更多网站` : `+ ${hiddenSiteCount} more sites` }}
        </p>
      </template>
    </section>
  </div>
</template>
