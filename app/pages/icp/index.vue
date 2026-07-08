<script setup lang="ts">
import {
  Search,
  ExternalLink,
  CheckCircle,
  Globe,
  CircleQuestionMark,
  Plus,
  FileText,
} from '@lucide/vue'

const { t, locale } = useI18n()
const localePath = useLocalePath()

const lang = computed(() => locale.value)
const maxVisibleSites = 3

const pageTitle = computed(() => t('seo.icp.title'))
const pageDescription = computed(() => t('seo.icp.description'))

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

interface SiteItem {
  id: string
  filling_no: string
  domain: string
  name: string
  approved: boolean
  iconUrl: string | null
}

const { data: sitesData } = await useAsyncData(`icp-sites-${lang.value}`, () =>
  $fetch<{ sites: SiteItem[] }>('/api/icp/sites'))

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
    const data = await $fetch<{ sites: SiteItem[] }>('/api/icp/sites', {
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
        src="/images/republic-of-yang/filling.png"
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

      <div class="flex items-center justify-center gap-3 mb-6">
        <NuxtLink
          :to="localePath('/icp/submissions/me')"
          class="btn btn-outline btn-sm"
        >
          <FileText class="w-4 h-4 mr-1" />
          {{ t('royIcp.mySubmissions.title') }}
        </NuxtLink>
        <NuxtLink
          :to="localePath('/icp/submit')"
          class="btn btn-primary btn-sm"
        >
          <Plus class="w-4 h-4 mr-1" />
          {{ t('royIcp.mySubmissions.submitNew') }}
        </NuxtLink>
      </div>

      <div class="relative max-w-md mx-auto mb-6">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-50" />
        <input
          type="text"
          class="input input-bordered w-full pl-12 input-lg"
          :placeholder="t('royIcp.search.placeholder')"
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
        {{ t('royIcp.certifiedDomains') }}
      </h2>

      <div v-if="allSites.length === 0 && !searchQuery.trim()" class="card bg-base-200 p-12 text-center">
        <Globe class="w-16 h-16 mx-auto mb-4 opacity-30" />
        <p class="text-lg opacity-60">
          {{ t('royIcp.directory.empty') }}
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
                    {{ t('royIcp.mySubmissions.pending') }}
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
              {{ t('royIcp.directory.empty') }}
            </p>
          </div>
        </div>

        <p
          v-if="hiddenSiteCount > 0 && !searchQuery.trim()"
          class="mt-4 text-center text-sm opacity-60"
        >
          {{ t('royIcp.moreSites', { count: hiddenSiteCount }) }}
        </p>
      </template>
    </section>
  </div>
</template>
