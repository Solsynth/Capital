<script setup lang="ts">
import { GitPullRequest, FileCheck, Trophy, ArrowLeft, ExternalLink, Loader2 } from '@lucide/vue'

const { t } = useI18n()
const localePath = useLocalePath()

let session: any = null
if (import.meta.server) {
  session = ref(await useServerSession())
} else {
  const { data } = await useAuth().useSession(useFetch)
  session = data
}

const { data: stats, status: statsStatus } = useAsyncData('contributions-stats', async () => {
  if (!session.value) return null

  // Get CLA status (includes githubUsername)
  const cla = await $fetch<any>('/api/contribution/profile')
  if (!cla.githubUsername) return { cla, pullRequests: null }

  // Search GitHub for PRs by this user in solsynth org
  const searchResp = await fetch(
    `https://api.github.com/search/issues?q=author:${cla.githubUsername}+org:solsynth+type:pr&per_page=1`
  )
  const search = searchResp.ok ? await searchResp.json() : null

  return {
    cla,
    pullRequests: search?.total_count ?? 0,
    githubUsername: cla.githubUsername,
  }
}, { watch: [session] })

definePageMeta({ layout: 'default' })

useSeoMeta({
  title: t('seo.contributions.title'),
  description: t('seo.contributions.description'),
})
</script>

<template>
  <div class="container mx-auto px-8 py-16 max-w-4xl">
    <div class="flex items-center gap-3 mb-2">
      <Trophy class="w-8 h-8 text-primary" />
      <h1 class="text-3xl font-bold">{{ t('contributions.title') }}</h1>
    </div>
    <p class="text-lg opacity-70 mb-10">{{ t('contributions.subtitle') }}</p>

    <!-- Not signed in -->
    <div v-if="!session" class="card bg-base-200 p-8 text-center">
      <p class="text-lg mb-4">{{ t('contributions.signInRequired') }}</p>
      <NuxtLink :to="localePath('/auth/login')" class="btn btn-primary">
        {{ t('login.signIn') }}
      </NuxtLink>
    </div>

    <!-- Loading -->
    <div v-else-if="statsStatus === 'pending'" class="flex justify-center py-16">
      <Loader2 class="w-8 h-8 animate-spin text-primary" />
    </div>

    <template v-else-if="stats">
      <!-- Stats cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div class="card bg-base-200 p-6 text-center">
          <GitPullRequest class="w-8 h-8 mx-auto mb-2 text-info" />
          <p class="text-3xl font-bold">{{ stats.pullRequests ?? '—' }}</p>
          <p class="text-sm opacity-70">{{ t('contributions.pullRequests') }}</p>
        </div>
        <div class="card bg-base-200 p-6 text-center">
          <FileCheck class="w-8 h-8 mx-auto mb-2" :class="stats.cla?.signed ? 'text-success' : 'text-warning'" />
          <p class="text-lg font-semibold">
            {{ stats.cla?.signed ? t('contributions.claSigned') : t('contributions.claNotSigned') }}
          </p>
          <p class="text-sm opacity-70">{{ t('contributions.claStatus') }}</p>
        </div>
        <div class="card bg-base-200 p-6 text-center">
          <div class="avatar placeholder mb-2">
            <div class="bg-neutral text-neutral-content w-8 rounded-full">
              <span class="text-sm">{{ stats.githubUsername?.[0]?.toUpperCase() ?? '?' }}</span>
            </div>
          </div>
          <p class="text-lg font-semibold">{{ stats.githubUsername ?? '—' }}</p>
          <p class="text-sm opacity-70">{{ t('contributions.githubAccount') }}</p>
        </div>
      </div>

      <!-- Quick links -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <NuxtLink
          :to="localePath('/contributions/licensing')"
          class="card bg-base-200 hover:bg-base-300 transition p-6 flex items-center gap-4"
        >
          <FileCheck class="w-6 h-6 text-primary shrink-0" />
          <div>
            <p class="font-semibold">{{ t('contributions.claLink') }}</p>
            <p class="text-sm opacity-70">{{ t('contributions.claLinkDesc') }}</p>
          </div>
        </NuxtLink>
        <a
          :href="`https://github.com/orgs/solsynth/repositories`"
          target="_blank"
          rel="noopener"
          class="card bg-base-200 hover:bg-base-300 transition p-6 flex items-center gap-4"
        >
          <GitPullRequest class="w-6 h-6 text-info shrink-0" />
          <div>
            <p class="font-semibold">{{ t('contributions.reposLink') }}</p>
            <p class="text-sm opacity-70">{{ t('contributions.reposLinkDesc') }}</p>
          </div>
        </a>
      </div>
    </template>
  </div>
</template>
