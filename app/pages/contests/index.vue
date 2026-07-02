<script setup lang="ts">
import { Trophy, Tag, Code2 } from '@lucide/vue'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

const lang = computed(() => locale.value)
const urlStatus = computed(() => route.query.status as string || '')
const urlTag = computed(() => route.query.tag as string || '')

const { data: contests } = await useAsyncData(`contests-${lang.value}`, async () => {
  const allContests = await queryCollection('contests')
    .where('path', 'LIKE', `/contests/${lang.value}/%`)
    .all()
  return allContests.map(c => ({
    ...c,
    slug: c.path.replace(`/contests/${lang.value}/`, ''),
  }))
})

const { data: dbData } = await useAsyncData('contests-db-data', () => {
  return $fetch('/api/contests')
})

const allTags = computed(() => {
  if (!contests.value) return []
  return [...new Set(contests.value.flatMap(c => c.tags || []))].sort()
})

const enrichedContests = computed(() => {
  if (!contests.value || !dbData.value) return contests.value || []
  const states = dbData.value.states as Record<string, any>
  const counts = dbData.value.submissionCounts as Record<string, number>
  return contests.value.map(c => {
    const state = states[c.slug] || {}
    return {
      ...c,
      status: state.status || c.status || 'upcoming',
      state,
      submissionCount: counts[c.slug] || 0,
    }
  })
})

const filteredContests = computed(() => {
  if (!enrichedContests.value) return []
  let filtered = enrichedContests.value
  if (urlStatus.value) {
    filtered = filtered.filter(c => c.status === urlStatus.value)
  }
  if (urlTag.value) {
    filtered = filtered.filter(c => c.tags?.includes(urlTag.value))
  }
  return filtered.sort((a, b) => {
    const statusOrder: Record<string, number> = { ongoing: 0, upcoming: 1, past: 2 }
    return (statusOrder[a.status] ?? 1) - (statusOrder[b.status] ?? 1)
  })
})

const statusCounts = computed(() => {
  if (!enrichedContests.value) return { upcoming: 0, ongoing: 0, past: 0 }
  return {
    upcoming: enrichedContests.value.filter(c => c.status === 'upcoming').length,
    ongoing: enrichedContests.value.filter(c => c.status === 'ongoing').length,
    past: enrichedContests.value.filter(c => c.status === 'past').length,
  }
})

const hasActiveFilter = computed(() => !!(urlStatus.value || urlTag.value))
</script>

<template>
  <div class="container mx-auto px-4 py-16">
    <div class="text-center mb-12">
      <h1 class="text-4xl md:text-5xl font-bold mb-4">{{ t('contests.title') }}</h1>
      <p class="text-xl opacity-70 max-w-2xl mx-auto">{{ t('contests.subtitle') }}</p>
    </div>

    <!-- Status Filter -->
    <div class="flex flex-wrap justify-center gap-2 mb-4">
      <NuxtLink
        :to="localePath('/contests')"
        class="btn btn-sm"
        :class="!urlStatus ? 'btn-primary' : 'btn-outline'"
      >
        {{ t('contests.all') }}
      </NuxtLink>
      <NuxtLink
        :to="`${localePath('/contests')}?status=ongoing`"
        class="btn btn-sm"
        :class="urlStatus === 'ongoing' ? 'btn-secondary' : 'btn-outline'"
      >
        {{ t('contests.ongoing') }}
        <span v-if="statusCounts.ongoing > 0" class="badge badge-sm ml-1">{{ statusCounts.ongoing }}</span>
      </NuxtLink>
      <NuxtLink
        :to="`${localePath('/contests')}?status=upcoming`"
        class="btn btn-sm"
        :class="urlStatus === 'upcoming' ? 'btn-primary' : 'btn-outline'"
      >
        {{ t('contests.upcoming') }}
        <span v-if="statusCounts.upcoming > 0" class="badge badge-sm ml-1">{{ statusCounts.upcoming }}</span>
      </NuxtLink>
      <NuxtLink
        :to="`${localePath('/contests')}?status=past`"
        class="btn btn-sm"
        :class="urlStatus === 'past' ? 'btn-ghost' : 'btn-outline'"
      >
        {{ t('contests.past') }}
        <span v-if="statusCounts.past > 0" class="badge badge-sm ml-1">{{ statusCounts.past }}</span>
      </NuxtLink>
    </div>

    <!-- Tag Filter -->
    <div v-if="allTags.length > 0" class="flex flex-wrap justify-center gap-2 mb-10">
      <NuxtLink
        v-for="tag in allTags"
        :key="tag"
        :to="`${localePath('/contests')}${urlStatus ? `?status=${urlStatus}&` : '?'}tag=${encodeURIComponent(tag)}`"
        class="btn btn-xs"
        :class="urlTag === tag ? 'btn-secondary' : 'btn-ghost'"
      >
        <Tag class="w-3 h-3 mr-1" />
        {{ tag }}
      </NuxtLink>
      <NuxtLink
        v-if="urlTag"
        :to="`${localePath('/contests')}${urlStatus ? `?status=${urlStatus}` : ''}`"
        class="btn btn-xs btn-ghost text-error"
      >
        {{ t('contests.clearFilters') }}
      </NuxtLink>
    </div>

    <!-- Active filter notice -->
    <div v-if="hasActiveFilter && filteredContests.length === 0" class="text-center py-8">
      <p class="opacity-70">{{ t('contests.noMatch') }}</p>
      <NuxtLink :to="localePath('/contests')" class="btn btn-sm btn-outline mt-4">
        {{ t('contests.clearFilters') }}
      </NuxtLink>
    </div>

    <!-- Contest Grid -->
    <div v-if="filteredContests.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ContestCard
        v-for="contest in filteredContests"
        :key="contest.slug"
        :contest="contest"
      />
    </div>

    <!-- Empty State -->
    <div v-else-if="!hasActiveFilter" class="text-center py-16">
      <Code2 class="w-16 h-16 opacity-30 mx-auto mb-4" />
      <p class="text-lg opacity-70">{{ t('contests.noContests') }}</p>
    </div>
  </div>
</template>
