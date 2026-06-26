<script setup lang="ts">
import { User, GitPullRequest, FileCheck, ExternalLink, Loader2, CheckCircle, XCircle, Unlink } from '@lucide/vue'

const { t } = useI18n()
const route = useRoute()
const username = computed(() => route.params.username as string)

const { data: profile, status } = await useAsyncData(
  `contribution-${username.value}`,
  () => $fetch<any>(`/api/contribution/${username.value}`),
)

const prCount = ref<number | null>(null)

onMounted(async () => {
  if (profile.value?.githubUsername) {
    try {
      const resp = await fetch(
        `https://api.github.com/search/issues?q=author:${profile.value.githubUsername}+org:solsynth+type:pr&per_page=1`
      )
      const data = await resp.json()
      prCount.value = data?.total_count ?? 0
    } catch { /* ignore */ }
  }
})

useSeoMeta({
  title: () => profile.value
    ? `${profile.value.solarDisplayName} — ${t('seo.contributions.title')}`
    : t('seo.contributions.title'),
  description: () => profile.value
    ? `${profile.value.solarDisplayName}'s contribution profile on Solsynth.`
    : '',
})
</script>

<template>
  <div class="container mx-auto px-8 py-16 max-w-2xl">
    <!-- Loading -->
    <div v-if="status === 'pending'" class="flex justify-center py-16">
      <Loader2 class="w-8 h-8 animate-spin text-primary" />
    </div>

    <!-- Not found / not linked -->
    <div v-else-if="!profile" class="text-center py-16">
      <User class="w-12 h-12 mx-auto mb-4 text-base-content/30" />
      <p class="text-lg opacity-70">{{ t('contributions.profileNotFound') }}</p>
    </div>

    <template v-else>
      <!-- Header -->
      <div class="flex items-center gap-4 mb-8">
        <div class="avatar">
          <img
            v-if="profile.githubUsername"
            :src="`https://github.com/${profile.githubUsername}.png`"
            :alt="profile.solarDisplayName"
            class="w-14 h-14 rounded-full"
          >
          <div v-else class="bg-primary text-primary-content w-14 h-14 rounded-full flex items-center justify-center">
            <span class="text-xl">{{ profile.solarDisplayName?.[0] ?? '?' }}</span>
          </div>
        </div>
        <div>
          <h1 class="text-2xl font-bold">{{ profile.solarDisplayName }}</h1>
          <a
            :href="`https://solian.app/@${profile.solarUsername}`"
            target="_blank"
            rel="noopener"
            class="text-sm text-primary/70 hover:text-primary"
          >
            @{{ profile.solarUsername }}
          </a>
        </div>
      </div>

      <!-- Not linked -->
      <div v-if="!profile.linked" class="alert">
        <Unlink class="w-5 h-5" />
        <span>{{ t('contributions.notLinked') }}</span>
      </div>

      <!-- Stats -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <!-- CLA -->
        <div class="card bg-base-200 p-5 text-center">
          <component
            :is="profile.claSigned ? CheckCircle : XCircle"
            class="w-7 h-7 mx-auto mb-2"
            :class="profile.claSigned ? 'text-success' : 'text-base-content/30'"
          />
          <p class="text-sm font-medium">
            {{ profile.claSigned ? t('contributions.claSigned') : t('contributions.claNotSigned') }}
          </p>
          <p class="text-xs opacity-50 mt-1">{{ t('contributions.claStatus') }}</p>
        </div>

        <!-- PRs -->
        <div class="card bg-base-200 p-5 text-center">
          <GitPullRequest class="w-7 h-7 mx-auto mb-2 text-info" />
          <p class="text-2xl font-bold">{{ prCount ?? '—' }}</p>
          <p class="text-xs opacity-50 mt-1">{{ t('contributions.pullRequests') }}</p>
        </div>

        <!-- GitHub -->
        <div class="card bg-base-200 p-5 text-center">
          <div class="avatar placeholder mb-2 mx-auto">
            <div class="bg-neutral text-neutral-content w-7 rounded-full">
              <span class="text-xs">{{ profile.githubUsername?.[0]?.toUpperCase() ?? '?' }}</span>
            </div>
          </div>
          <p class="text-sm font-medium truncate">
            {{ profile.githubUsername ?? '—' }}
          </p>
          <p class="text-xs opacity-50 mt-1">GitHub</p>
        </div>
      </div>

      <!-- Links -->
      <div v-if="profile.githubUsername" class="flex gap-3">
        <a
          :href="`https://github.com/${profile.githubUsername}`"
          target="_blank"
          rel="noopener"
          class="btn btn-outline btn-sm gap-2"
        >
          <ExternalLink class="w-4 h-4" />
          GitHub
        </a>
        <a
          :href="`https://solian.app/@${profile.solarUsername}`"
          target="_blank"
          rel="noopener"
          class="btn btn-outline btn-sm gap-2"
        >
          <ExternalLink class="w-4 h-4" />
          Solar Network
        </a>
      </div>
    </template>
  </div>
</template>
