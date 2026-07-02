<script setup lang="ts">
import { Trophy, Eye } from '@lucide/vue'

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

const { t } = useI18n()

const { data: contests } = await useAsyncData('admin-contests', async () => {
  const allContests = await queryCollection('contests')
    .where('path', 'LIKE', '/contests/en/%')
    .all()
  return allContests.map(c => ({
    ...c,
    slug: c.path.replace('/contests/en/', ''),
  }))
})

const { data: dbData } = await useAsyncData('admin-contests-db', () => {
  return $fetch('/api/contests')
})
</script>

<template>
  <div>
    <h2 class="text-2xl font-bold mb-6">{{ t('admin.contests.title') }}</h2>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <NuxtLink
        v-for="contest in (contests || [])"
        :key="contest.slug"
        :to="`/admin/contests/${contest.slug}`"
        class="card bg-base-200 hover:bg-base-300 transition-colors"
      >
        <div class="card-body">
          <div class="flex items-center gap-3">
            <Trophy class="w-5 h-5 text-primary" />
            <h3 class="card-title">{{ contest.title }}</h3>
          </div>
          <p class="opacity-70 text-sm mt-2 line-clamp-2">{{ contest.description }}</p>

          <div class="flex items-center gap-4 mt-4 text-sm">
            <div class="flex items-center gap-1">
              <Eye class="w-4 h-4 opacity-60" />
              <span>{{ (dbData?.submissionCounts as Record<string, number>)?.[contest.slug] || 0 }} {{ t('admin.contests.submissions') }}</span>
            </div>
            <span
              v-if="(dbData?.states as Record<string, any>)?.[contest.slug]"
              class="badge badge-sm"
              :class="{
                'badge-info': (dbData?.states as Record<string, any>)?.[contest.slug]?.phase === 'dev',
                'badge-secondary': (dbData?.states as Record<string, any>)?.[contest.slug]?.phase === 'voting',
                'badge-success': (dbData?.states as Record<string, any>)?.[contest.slug]?.phase === 'results',
              }"
            >
              {{ t(`admin.contests.phase${(dbData?.states as Record<string, any>)?.[contest.slug]?.phase.charAt(0).toUpperCase() + (dbData?.states as Record<string, any>)?.[contest.slug]?.phase.slice(1)}`) }}
            </span>
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
