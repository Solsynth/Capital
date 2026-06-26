<script setup lang="ts">
import {
  ArrowLeft,
  ExternalLink,
  CheckCircle,
  Globe,
  User,
  Calendar,
  Shield,
  Edit,
} from '@lucide/vue'

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const { data: authData } = await useAuth().useSession(useFetch)

const fillingNo = computed(() => route.params.filling_no as string)

interface SiteDetail {
  id: string
  filling_no: string
  domain: string
  name: string
  description?: string
  site_url: string
  icon?: string
  categories?: Record<string, boolean> | string[]
  approved_at?: string | null
  created: string
  updated: string
  iconUrl: string | null
  identity: {
    id: string
    name: string
    description?: string
    icon?: string
    iconUrl: string | null
  } | null
  owner: {
    id: string
    name: string
    email: string
  } | null
}

const { data, error } = await useAsyncData(
  `icp-site-${fillingNo.value}`,
  () => $fetch<{ site: SiteDetail }>('/api/icp/site', {
    params: { filling_no: fillingNo.value },
  }),
)

if (error.value || !data.value?.site) {
  navigateTo(localePath('/icp'))
}

const site = computed(() => data.value?.site)

const pageTitle = computed(() =>
  site.value ? `${site.value.name} - ${t('seo.icp.title')}` : '',
)

const isApproved = computed(() => Boolean(site.value?.approved_at))

const isOwner = computed(() => {
  if (!authData.value?.user || !site.value?.owner) return false
  return authData.value.user.id === site.value.owner.id
})

const pageDescription = computed(() => {
  if (!site.value) return ''
  return (
    site.value.description
    || (isApproved.value
      ? t('royIcp.site.certified')
      : t('royIcp.site.pendingApproval'))
  )
})

const categoryLabels: Record<string, string> = {
  official: 'categories.official',
  entertainment: 'categories.entertainment',
  technology: 'categories.technology',
  education: 'categories.education',
  social: 'categories.social',
  business: 'categories.business',
  personal: 'categories.personal',
  media: 'categories.media',
  community: 'categories.community',
  tools: 'categories.tools',
  blog: 'categories.blog',
}

const activeCategories = computed(() => {
  if (!site.value?.categories) return []
  const raw = site.value.categories
  const keys = Array.isArray(raw)
    ? raw
    : Object.entries(raw).filter(([, v]) => v).map(([k]) => k)
  return keys.map((key) => {
    const i18nKey = categoryLabels[key]
    return i18nKey ? t(i18nKey, key) : key
  })
})

useHead({
  title: pageTitle,
})

useSeoMeta({
  description: pageDescription,
  ogTitle: pageTitle,
  ogDescription: pageDescription,
  twitterCard: 'summary',
  twitterTitle: pageTitle,
  twitterDescription: pageDescription,
})
</script>

<template>
  <div v-if="site" class="container mx-auto px-4 py-16 max-w-2xl">
    <NuxtLink
      :to="localePath('/icp')"
      class="btn btn-ghost btn-sm mb-8"
    >
      <ArrowLeft class="w-4 h-4 mr-1" />
      {{ t('royIcp.site.back') }}
    </NuxtLink>

    <div class="card bg-base-200 p-8">
      <div class="flex items-start gap-6 mb-8">
        <div class="w-20 h-20 rounded-2xl overflow-hidden shrink-0 bg-base-100 flex items-center justify-center shadow-lg">
          <img
            v-if="site.iconUrl"
            :src="site.iconUrl"
            :alt="site.name"
            class="w-full h-full object-cover"
          >
          <Globe v-else class="w-10 h-10 opacity-50" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-2">
            <h1 class="text-3xl font-bold truncate">
              {{ site.name }}
            </h1>
            <div
              class="tooltip"
              :data-tip="isApproved ? t('royIcp.site.certified') : t('royIcp.site.pendingApproval')"
            >
              <CheckCircle
                class="w-6 h-6 shrink-0"
                :class="isApproved ? 'text-success' : 'text-warning'"
              />
            </div>
          </div>
          <code class="text-sm opacity-60 block mb-3">{{ site.domain }}</code>
          <p class="text-sm opacity-70 font-mono mb-4">
            {{ t('royIcp.directory.icpNumber', { id: site.filling_no }) }}
          </p>
          <div class="flex gap-2">
            <a
              :href="site.site_url"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn-primary"
            >
              <ExternalLink class="w-4 h-4 mr-1" />
              {{ t('royIcp.site.visit') }}
            </a>
            <NuxtLink
              v-if="isOwner"
              :to="localePath(`/icp/${fillingNo}/edit`)"
              class="btn btn-outline"
            >
              <Edit class="w-4 h-4 mr-1" />
              {{ t('royIcp.site.edit') }}
            </NuxtLink>
          </div>
        </div>
      </div>

      <div v-if="site.description" class="mb-8">
        <h2 class="text-lg font-bold mb-2">
          {{ t('royIcp.site.about') }}
        </h2>
        <p class="opacity-80">
          {{ site.description }}
        </p>
      </div>

      <div v-if="site.identity" class="mb-8">
        <h2 class="text-lg font-bold mb-2">
          {{ t('royIcp.site.identity') }}
        </h2>
        <div class="flex flex-row gap-4 items-center">
          <div class="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-base-100 flex items-center justify-center">
            <img
              v-if="site.identity.iconUrl"
              :src="site.identity.iconUrl"
              :alt="site.identity.name"
              class="w-full h-full object-cover"
            >
            <User v-else class="w-5 h-5 opacity-50" />
          </div>
          <div class="flex flex-col">
            <p class="font-medium">
              {{ site.identity.name }}
            </p>
            <p v-if="site.identity.description" class="opacity-70 text-sm mt-1">
              {{ site.identity.description }}
            </p>
          </div>
        </div>
      </div>

      <div v-if="activeCategories.length > 0" class="flex items-start gap-3 sm:col-span-2 mb-8">
        <div>
          <p class="text-sm opacity-60 mb-2">
            {{ t('royIcp.site.categories') }}
          </p>
          <div class="flex flex-wrap gap-2">
            <span v-for="label in activeCategories" :key="label" class="badge badge-primary">
              {{ label }}
            </span>
          </div>
        </div>
      </div>

      <div class="border-t border-base-300 pt-6">
        <h2 class="text-lg font-bold mb-4">
          {{ t('royIcp.site.certDetails') }}
        </h2>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="flex items-start gap-3">
            <Shield class="w-5 h-5 text-success mt-0.5 shrink-0" />
            <div>
              <p class="text-sm opacity-60 mb-0.5">
                {{ t('royIcp.site.status') }}
              </p>
              <p class="font-medium">
                {{ isApproved ? t('royIcp.site.certified') : t('royIcp.site.pendingApproval') }}
              </p>
            </div>
          </div>

          <div v-if="site.approved_at" class="flex items-start gap-3">
            <Calendar class="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p class="text-sm opacity-60 mb-0.5">
                {{ t('royIcp.site.certifiedOn') }}
              </p>
              <p class="font-medium">
                {{ new Date(site.approved_at).toLocaleDateString() }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
