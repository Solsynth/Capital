<script setup lang="ts">
import { Trophy, GitPullRequest, CircleDot, GitCommitHorizontal, Loader2, Crown, Users } from '@lucide/vue'

const { t } = useI18n()
const localePath = useLocalePath()

const { data, status } = await useAsyncData('leaderboard', () =>
  $fetch<{ leaderboard: Array<{
    rank: number
    githubUsername: string
    solarUsername: string | null
    solarDisplayName: string | null
    prCount: number
    issueCount: number
    commitCount: number
    total: number
  }> }>('/api/contribution/leaderboard'),
)

useSeoMeta({
  title: t('seo.contributions.title'),
  description: t('seo.contributions.description'),
})
</script>

<template>
  <div class="container mx-auto px-6 py-16 max-w-4xl">
    <div class="flex items-center gap-3 mb-2">
      <Trophy class="w-8 h-8 text-primary" />
      <h1 class="text-3xl font-bold">{{ t('contributions.leaderboard') }}</h1>
    </div>
    <p class="text-lg opacity-70 mb-10">{{ t('contributions.leaderboardDesc') }}</p>

    <!-- Loading -->
    <div v-if="status === 'pending'" class="flex justify-center py-16">
      <Loader2 class="w-8 h-8 animate-spin text-primary" />
    </div>

    <div v-else-if="data?.leaderboard?.length" class="overflow-x-auto">
      <table class="table">
        <thead>
          <tr class="text-xs opacity-60">
            <th class="w-16">{{ t('contributions.rank') }}</th>
            <th>{{ t('contributions.contributor') }}</th>
            <th class="text-right w-20">
              <GitPullRequest class="w-4 h-4 inline" />
            </th>
            <th class="text-right w-20">
              <CircleDot class="w-4 h-4 inline" />
            </th>
            <th class="text-right w-20">
              <GitCommitHorizontal class="w-4 h-4 inline" />
            </th>
            <th class="text-right w-24">{{ t('contributions.score') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in data.leaderboard"
            :key="row.rank"
            class="hover:bg-base-200/50 transition-colors"
          >
            <td>
              <div class="flex items-center gap-1.5">
                <Crown v-if="row.rank <= 3" class="w-4 h-4" :class="row.rank === 1 ? 'text-warning' : row.rank === 2 ? 'text-base-content/40' : 'text-orange-600'" />
                <span class="font-bold tabular-nums" :class="row.rank <= 3 ? '' : 'opacity-60'">
                  #{{ row.rank }}
                </span>
              </div>
            </td>
            <td>
              <NuxtLink
                v-if="row.solarUsername"
                :to="localePath(`/contributions/${row.solarUsername}`)"
                class="flex items-center gap-3 hover:text-primary transition-colors group"
              >
                <img
                  :src="`https://api.solian.app/passport/accounts/${row.solarUsername}/picture`"
                  :alt="row.solarUsername"
                  class="w-8 h-8 rounded-full"
                >
                <div>
                  <p class="font-medium text-sm group-hover:text-primary transition-colors">{{ row.solarDisplayName || row.solarUsername }}</p>
                  <p class="text-xs opacity-50">@{{ row.solarUsername }} · {{ row.githubUsername }}</p>
                </div>
              </NuxtLink>
              <a
                v-else
                :href="`https://github.com/${row.githubUsername}`"
                target="_blank"
                rel="noopener"
                class="flex items-center gap-3 hover:text-primary transition-colors"
              >
                <img
                  :src="`https://github.com/${row.githubUsername}.png`"
                  :alt="row.githubUsername"
                  class="w-8 h-8 rounded-full"
                >
                <div>
                  <p class="font-medium text-sm">{{ row.githubUsername }}</p>
                  <p class="text-xs opacity-50">GitHub</p>
                </div>
              </a>
            </td>
            <td class="text-right tabular-nums text-sm opacity-80">{{ row.prCount }}</td>
            <td class="text-right tabular-nums text-sm opacity-80">{{ row.issueCount }}</td>
            <td class="text-right tabular-nums text-sm opacity-80">{{ row.commitCount }}</td>
            <td class="text-right font-bold tabular-nums text-sm">{{ row.prCount * 5 + row.issueCount * 3 + row.commitCount }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="text-center py-16 opacity-50">
      {{ t('contributions.noData') }}
    </div>
  </div>
</template>
