<script setup lang="ts">
import {
  ArrowLeft,
  ExternalLink,
  CheckCircle,
  Globe,
  User,
  Calendar,
  Shield,
} from 'lucide-vue-next'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

const lang = computed(() => locale.value)
const fillingNo = computed(() => route.params.filling_no as string)
const isZh = computed(() => lang.value === 'zh')

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
  site.value
    ? isZh.value
      ? `${site.value.name} - 中羊网备`
      : `${site.value.name} - ROY ICP Filling`
    : '',
)

const isApproved = computed(() => Boolean(site.value?.approved_at))

const pageDescription = computed(() => {
  if (!site.value) return ''
  return (
    site.value.description
    || (isApproved.value
      ? isZh.value ? '已通过中羊网备认证' : 'ROY ICP certified website'
      : isZh.value ? '等待中羊网备审核' : 'Awaiting ROY ICP approval')
  )
})

const categoryLabels: Record<string, [string, string]> = {
  official: ['ROY Official', '羊国官方'],
  entertainment: ['Entertainment', '娱乐'],
  technology: ['Technology', '科技'],
  education: ['Education', '教育'],
  social: ['Social', '社交'],
  business: ['Business', '商业'],
  personal: ['Personal', '个人'],
  media: ['Media', '媒体'],
  community: ['Community', '社区'],
  tools: ['Tools', '工具'],
  blog: ['Blog', '博客'],
}

const activeCategories = computed(() => {
  if (!site.value?.categories) return []
  const raw = site.value.categories
  const keys = Array.isArray(raw)
    ? raw
    : Object.entries(raw).filter(([, v]) => v).map(([k]) => k)
  return keys.map((key) => {
    const label = categoryLabels[key]
    return label ? (isZh.value ? label[1] : label[0]) : key
  })
})

const localeForDate = computed(() => (lang.value === 'zh' ? 'zh-CN' : 'en-US'))

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
      {{ isZh ? '返回目录' : 'Back to Directory' }}
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
              :data-tip="isZh
                ? isApproved ? '已通过 ROY ICP 认证' : '等待 ROY ICP 审核'
                : isApproved ? 'ROY ICP Certified' : 'Awaiting ROY ICP approval'"
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
          <a
            :href="site.site_url"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-primary"
          >
            <ExternalLink class="w-4 h-4 mr-1" />
            {{ isZh ? '访问网站' : 'Visit Website' }}
          </a>
        </div>
      </div>

      <div v-if="site.description" class="mb-8">
        <h2 class="text-lg font-bold mb-2">
          {{ isZh ? '网站介绍' : 'About' }}
        </h2>
        <p class="opacity-80">
          {{ site.description }}
        </p>
      </div>

      <div v-if="site.identity" class="mb-8">
        <h2 class="text-lg font-bold mb-2">
          {{ isZh ? '备案主体' : 'Identity' }}
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
            {{ isZh ? '分类' : 'Categories' }}
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
          {{ isZh ? '认证信息' : 'Certification Details' }}
        </h2>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="flex items-start gap-3">
            <Shield class="w-5 h-5 text-success mt-0.5 shrink-0" />
            <div>
              <p class="text-sm opacity-60 mb-0.5">
                {{ isZh ? '认证状态' : 'Status' }}
              </p>
              <p class="font-medium">
                {{ isApproved
                  ? (isZh ? '已通过' : 'Certified')
                  : (isZh ? '待审核' : 'Pending approval')
                }}
              </p>
            </div>
          </div>

          <div v-if="site.approved_at" class="flex items-start gap-3">
            <Calendar class="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p class="text-sm opacity-60 mb-0.5">
                {{ isZh ? '认证日期' : 'Certified on' }}
              </p>
              <p class="font-medium">
                {{ new Date(site.approved_at).toLocaleDateString(localeForDate) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
