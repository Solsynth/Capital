<script setup lang="ts">
import { Tag, Code2, X } from '@lucide/vue'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

const lang = computed(() => locale.value)
const urlStatus = computed(() => route.query.status as string || '')
const urlTag = computed(() => route.query.tag as string || '')

definePageMeta({
  description: '',
})

useSeoMeta({
  title: () => t('contests.title'),
  description: () => t('contests.subtitle'),
})

defineOgImage('UniOgImage', {
  title: t('contests.title'),
  description: t('contests.subtitle'),
})

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
  if (!contests.value)
    return []
  return [...new Set(contests.value.flatMap(c => c.tags || []))].sort()
})

const enrichedContests = computed(() => {
  if (!contests.value || !dbData.value)
    return contests.value || []
  const states = dbData.value.states as Record<string, any>
  const counts = dbData.value.submissionCounts as Record<string, number>
  return contests.value.map((c) => {
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
  if (!enrichedContests.value)
    return []
  let filtered = enrichedContests.value
  if (urlStatus.value)
    filtered = filtered.filter(c => c.status === urlStatus.value)
  if (urlTag.value)
    filtered = filtered.filter(c => c.tags?.includes(urlTag.value))
  return filtered.sort((a, b) => {
    const statusOrder: Record<string, number> = { ongoing: 0, upcoming: 1, past: 2 }
    return (statusOrder[a.status] ?? 1) - (statusOrder[b.status] ?? 1)
  })
})

const statusCounts = computed(() => {
  if (!enrichedContests.value)
    return { upcoming: 0, ongoing: 0, past: 0 }
  return {
    upcoming: enrichedContests.value.filter(c => c.status === 'upcoming').length,
    ongoing: enrichedContests.value.filter(c => c.status === 'ongoing').length,
    past: enrichedContests.value.filter(c => c.status === 'past').length,
  }
})

const hasActiveFilter = computed(() => !!(urlStatus.value || urlTag.value))

function statusQuery(status: string) {
  const base = localePath('/contests')
  if (!status)
    return base
  return `${base}?status=${status}`
}

function tagQuery(tag: string) {
  const params = new URLSearchParams()
  if (urlStatus.value)
    params.set('status', urlStatus.value)
  if (tag)
    params.set('tag', tag)
  const q = params.toString()
  return q ? `${localePath('/contests')}?${q}` : localePath('/contests')
}
</script>

<template>
  <div>
    <section class="border-b border-base-200 px-4 py-16 md:py-20">
      <div class="container mx-auto max-w-5xl">
        <h1 class="mb-3 text-4xl font-extrabold tracking-tight md:text-5xl">
          {{ t('contests.title') }}
        </h1>
        <p class="max-w-2xl text-lg text-base-content/65 md:text-xl">
          {{ t('contests.subtitle') }}
        </p>
      </div>
    </section>

    <section class="px-4 py-10">
      <div class="container mx-auto max-w-5xl">
        <div class="mb-6 flex flex-wrap gap-2">
          <NuxtLink
            :to="statusQuery('')"
            class="btn btn-sm"
            :class="!urlStatus ? 'btn-primary' : 'btn-ghost border border-base-300'"
          >
            {{ t('contests.all') }}
          </NuxtLink>
          <NuxtLink
            :to="statusQuery('ongoing')"
            class="btn btn-sm gap-1.5"
            :class="urlStatus === 'ongoing' ? 'btn-primary' : 'btn-ghost border border-base-300'"
          >
            {{ t('contests.ongoing') }}
            <span
              v-if="statusCounts.ongoing > 0"
              class="text-xs opacity-70"
            >{{ statusCounts.ongoing }}</span>
          </NuxtLink>
          <NuxtLink
            :to="statusQuery('upcoming')"
            class="btn btn-sm gap-1.5"
            :class="urlStatus === 'upcoming' ? 'btn-primary' : 'btn-ghost border border-base-300'"
          >
            {{ t('contests.upcoming') }}
            <span
              v-if="statusCounts.upcoming > 0"
              class="text-xs opacity-70"
            >{{ statusCounts.upcoming }}</span>
          </NuxtLink>
          <NuxtLink
            :to="statusQuery('past')"
            class="btn btn-sm gap-1.5"
            :class="urlStatus === 'past' ? 'btn-primary' : 'btn-ghost border border-base-300'"
          >
            {{ t('contests.past') }}
            <span
              v-if="statusCounts.past > 0"
              class="text-xs opacity-70"
            >{{ statusCounts.past }}</span>
          </NuxtLink>
        </div>

        <div
          v-if="allTags.length > 0"
          class="mb-10 flex flex-wrap items-center gap-2"
        >
          <NuxtLink
            v-for="tag in allTags"
            :key="tag"
            :to="tagQuery(tag)"
            class="btn btn-xs gap-1"
            :class="urlTag === tag ? 'btn-secondary' : 'btn-ghost border border-base-300'"
          >
            <Tag class="h-3 w-3" />
            {{ tag }}
          </NuxtLink>
          <NuxtLink
            v-if="urlTag"
            :to="tagQuery('')"
            class="btn btn-xs btn-ghost gap-1 text-error"
          >
            <X class="h-3 w-3" />
            {{ t('contests.clearFilters') }}
          </NuxtLink>
        </div>

        <div
          v-if="hasActiveFilter && filteredContests.length === 0"
          class="rounded-lg border border-dashed border-base-300 px-6 py-16 text-center"
        >
          <p class="mb-4 text-base text-base-content/55">
            {{ t('contests.noMatch') }}
          </p>
          <NuxtLink
            :to="localePath('/contests')"
            class="btn btn-ghost btn-sm border border-base-300"
          >
            {{ t('contests.clearFilters') }}
          </NuxtLink>
        </div>

        <div
          v-else-if="filteredContests.length > 0"
          class="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
        >
          <ContestCard
            v-for="contest in filteredContests"
            :key="contest.slug"
            :contest="contest"
          />
        </div>

        <div
          v-else-if="!hasActiveFilter"
          class="rounded-lg border border-dashed border-base-300 px-6 py-16 text-center"
        >
          <Code2 class="mx-auto mb-4 h-10 w-10 text-base-content/20" />
          <p class="text-base text-base-content/55">
            {{ t('contests.noContests') }}
          </p>
        </div>
      </div>
    </section>
  </div>
</template>
