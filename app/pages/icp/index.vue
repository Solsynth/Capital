<script setup lang="ts">
import {
  Search,
  Globe,
  CircleQuestionMark,
  Plus,
  FileText,
  ArrowUpRight,
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
  <div>
    <header class="band">
      <div class="shell">
        <h1 class="title page-title">
          {{ pageTitle }}
        </h1>
        <p class="lede page-lede">
          {{ pageDescription }}
        </p>

        <div class="controls">
          <div class="search">
            <Search class="search-icon" aria-hidden="true" />
            <input
              type="search"
              class="input search-input"
              :placeholder="t('royIcp.search.placeholder')"
              :aria-label="t('royIcp.search.placeholder')"
              @input="onSearchInput"
            >
            <span v-if="isSearching" class="search-busy" aria-hidden="true" />
          </div>

          <div class="actions">
            <NuxtLink
              :to="localePath('/icp/submit')"
              class="btn btn-primary btn-sm"
            >
              <Plus class="icon" aria-hidden="true" />
              {{ t('royIcp.mySubmissions.submitNew') }}
            </NuxtLink>
            <NuxtLink
              :to="localePath('/icp/submissions/me')"
              class="btn btn-ghost btn-sm"
            >
              <FileText class="icon" aria-hidden="true" />
              {{ t('royIcp.mySubmissions.title') }}
            </NuxtLink>
            <NuxtLink
              :to="localePath('/products/roy-filling')"
              class="btn btn-ghost btn-sm btn-square"
              :aria-label="t('royIcpFilling.learnMore')"
              :title="t('royIcpFilling.learnMore')"
            >
              <CircleQuestionMark class="icon" aria-hidden="true" />
            </NuxtLink>
          </div>
        </div>
      </div>
    </header>

    <section class="body">
      <div class="shell">
        <h2 class="section-label register-title">
          {{ t('royIcp.certifiedDomains') }}
        </h2>

        <p v-if="displayedSites.length === 0" class="register-empty">
          {{ t('royIcp.directory.empty') }}
          <NuxtLink
            :to="localePath('/icp/submit')"
            class="link-quiet"
          >
            {{ t('royIcp.mySubmissions.submitNew') }}
          </NuxtLink>
        </p>

        <ul v-else class="register">
          <li v-for="site in displayedSites" :key="site.id" class="register-row">
            <NuxtLink
              :to="localePath(`/icp/${site.filling_no}`)"
              class="register-link"
            >
              <span class="site-mark">
                <img
                  v-if="site.iconUrl"
                  :src="site.iconUrl"
                  alt=""
                  loading="lazy"
                  decoding="async"
                >
                <Globe v-else class="icon" aria-hidden="true" />
              </span>

              <span class="site-ident">
                <span class="site-name">
                  {{ site.name }}
                  <ArrowUpRight class="site-arrow" aria-hidden="true" />
                </span>
                <span class="mono site-domain">{{ site.domain }}</span>
              </span>

              <span class="site-facts">
                <span class="mono site-number">
                  {{ t('royIcp.directory.icpNumber', { id: site.filling_no }) }}
                </span>

                <span class="site-status">
                  <span
                    class="dot"
                    :class="site.approved ? 'is-approved' : 'is-pending'"
                    aria-hidden="true"
                  />
                  {{ site.approved ? t('royIcp.site.certified') : t('royIcp.site.pendingApproval') }}
                </span>
              </span>
            </NuxtLink>
          </li>
        </ul>

        <p
          v-if="hiddenSiteCount > 0 && !searchQuery.trim()"
          class="register-more"
        >
          {{ t('royIcp.moreSites', { count: hiddenSiteCount }) }}
        </p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.band {
  padding-block: 3.5rem 2.5rem;
  border-bottom: 1px solid var(--color-line-soft);
}

.page-title {
  font-size: clamp(2rem, 4vw, 2.75rem);
  margin: 0;
}

.page-lede {
  margin: 0.75rem 0 0;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1.75rem;
}

.search {
  position: relative;
  flex: 1 1 18rem;
  max-width: 26rem;
}

.search-icon {
  position: absolute;
  top: 50%;
  left: 0.9rem;
  z-index: 1;
  width: 1rem;
  height: 1rem;
  transform: translateY(-50%);
  color: var(--color-faint);
  pointer-events: none;
}

.search-input {
  padding-left: 2.5rem;
  padding-right: 2.25rem;
}

.search-input::-webkit-search-cancel-button {
  appearance: none;
}

.search-busy {
  position: absolute;
  top: 50%;
  right: 0.9rem;
  width: 0.8rem;
  height: 0.8rem;
  margin-top: -0.4rem;
  border: 1.5px solid var(--color-line);
  border-top-color: var(--color-primary);
  border-radius: 999px;
  animation: search-spin 700ms linear infinite;
}

@keyframes search-spin {
  to {
    transform: rotate(360deg);
  }
}

.actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.icon {
  width: 0.9rem;
  height: 0.9rem;
}

.body {
  padding-block: 2rem 4rem;
}

.register-title {
  margin: 0 0 0.75rem;
}

.register {
  margin: 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid var(--color-line);
}

.register-row {
  border-bottom: 1px solid var(--color-line-soft);
}

.register-link {
  display: grid;
  grid-template-columns: 2rem minmax(0, 1fr);
  grid-template-areas:
    'mark ident'
    '.    facts';
  align-items: start;
  gap: 0.75rem;
  padding: 0.95rem 0.5rem 0.95rem 0;
  color: inherit;
  text-decoration: none;
  transition: background-color 140ms ease;
}

.register-link:hover {
  background: color-mix(in oklab, var(--color-base-200) 55%, transparent);
}

.register-link:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: -2px;
}

.site-mark {
  grid-area: mark;
  display: flex;
  width: 2rem;
  height: 2rem;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: var(--radius-mark);
  background: var(--color-base-200);
  color: var(--color-faint);
}

.site-mark img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.site-ident {
  grid-area: ident;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
}

.site-name {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.9375rem;
  font-weight: 600;
  line-height: 1.35;
  color: var(--color-base-content);
  letter-spacing: -0.005em;
}

.site-arrow {
  width: 0.8rem;
  height: 0.8rem;
  flex-shrink: 0;
  opacity: 0.4;
}

.register-link:hover .site-name {
  color: var(--color-primary);
}

.site-domain {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.site-facts {
  grid-area: facts;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem 0.9rem;
}

.site-number {
  color: var(--color-faint);
  white-space: nowrap;
}

.site-status {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  color: var(--color-faint);
  white-space: nowrap;
}

.dot.is-approved {
  background: var(--color-success);
}

.dot.is-pending {
  background: var(--color-warning);
}

.register-empty {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.5rem;
  margin: 0;
  padding: 2.25rem 0;
  border-top: 1px solid var(--color-line);
  border-bottom: 1px solid var(--color-line-soft);
  font-size: 0.9375rem;
  color: var(--color-faint);
}

.register-more {
  margin: 1rem 0 0;
  font-size: 0.8125rem;
  color: var(--color-faint);
}

@media (min-width: 768px) {
  .register-link {
    grid-template-columns: 2rem minmax(0, 1fr) 12rem 8.5rem;
    grid-template-areas: 'mark ident number status';
    align-items: center;
    gap: 1.25rem;
    padding-block: 0.9rem;
  }

  .site-facts {
    display: contents;
  }

  .site-number {
    grid-area: number;
  }

  .site-status {
    grid-area: status;
    justify-content: flex-end;
  }
}
</style>
