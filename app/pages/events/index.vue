<script setup lang="ts">
import { Calendar, MapPin, Tag, ArrowRight, X } from '@lucide/vue'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

const lang = computed(() => locale.value)
const isZh = computed(() => lang.value === 'zh')

definePageMeta({
  description: '',
})

useSeoMeta({
  title: () => `${t('seo.events.title')}`,
  description: () => t('seo.events.description'),
})

defineOgImage('UniOgImage', {
  title: t('events.title'),
  description: t('seo.events.description'),
})

useSchemaOrg([
  defineWebPage({
    name: () => t('seo.events.title'),
    description: () => t('seo.events.description'),
    url: () => `https://solsynth.dev${route.path}`,
  }),
  defineBreadcrumb({
    itemListElement: [
      {
        name: t('seo.home.title'),
        item: 'https://solsynth.dev',
      },
      {
        name: t('seo.events.title'),
        item: () => `https://solsynth.dev${route.path}`,
      },
    ],
  }),
])

const urlStatus = computed(() => route.query.status as string || '')
const urlTag = computed(() => route.query.tag as string || '')

const { data: events } = await useAsyncData(`events-${lang.value}`, async () => {
  const allEvents = await queryCollection('events')
    .where('path', 'LIKE', `/events/${lang.value}/%`)
    .all()
  return allEvents.map(e => ({
    ...e,
    slug: e.path.replace(`/events/${lang.value}/`, ''),
  }))
})

const allTags = computed(() => {
  if (!events.value)
    return []
  return [...new Set(events.value.flatMap(e => e.tags || []))].sort()
})

const filteredEvents = computed(() => {
  if (!events.value)
    return []
  let filtered = events.value
  if (urlStatus.value)
    filtered = filtered.filter(e => e.status === urlStatus.value)
  if (urlTag.value)
    filtered = filtered.filter(e => e.tags?.includes(urlTag.value))
  return filtered.sort((a, b) => {
    const dateA = new Date(a.startDate)
    const dateB = new Date(b.startDate)
    return dateB.getTime() - dateA.getTime()
  })
})

const upcomingCount = computed(() => events.value?.filter(e => e.status === 'upcoming').length || 0)
const ongoingCount = computed(() => events.value?.filter(e => e.status === 'ongoing').length || 0)
const pastCount = computed(() => events.value?.filter(e => e.status === 'past').length || 0)

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString(lang.value === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function statusQuery(status: string) {
  const base = localePath('/events')
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
  return q ? `${localePath('/events')}?${q}` : localePath('/events')
}
</script>

<template>
  <div>
    <section class="border-b border-base-200 px-4 py-16 md:py-20">
      <div class="container mx-auto max-w-5xl">
        <h1 class="mb-3 text-4xl font-extrabold tracking-tight md:text-5xl">
          {{ t('events.title') }}
        </h1>
        <p class="max-w-2xl text-lg text-base-content/65 md:text-xl">
          {{ t('events.subtitle') }}
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
            {{ t('events.all') }}
          </NuxtLink>
          <NuxtLink
            :to="statusQuery('upcoming')"
            class="btn btn-sm gap-1.5"
            :class="urlStatus === 'upcoming' ? 'btn-primary' : 'btn-ghost border border-base-300'"
          >
            {{ t('events.upcoming') }}
            <span
              v-if="upcomingCount > 0"
              class="text-xs opacity-70"
            >{{ upcomingCount }}</span>
          </NuxtLink>
          <NuxtLink
            :to="statusQuery('ongoing')"
            class="btn btn-sm gap-1.5"
            :class="urlStatus === 'ongoing' ? 'btn-primary' : 'btn-ghost border border-base-300'"
          >
            {{ t('events.ongoing') }}
            <span
              v-if="ongoingCount > 0"
              class="text-xs opacity-70"
            >{{ ongoingCount }}</span>
          </NuxtLink>
          <NuxtLink
            :to="statusQuery('past')"
            class="btn btn-sm gap-1.5"
            :class="urlStatus === 'past' ? 'btn-primary' : 'btn-ghost border border-base-300'"
          >
            {{ t('events.past') }}
            <span
              v-if="pastCount > 0"
              class="text-xs opacity-70"
            >{{ pastCount }}</span>
          </NuxtLink>
        </div>

        <div v-if="allTags.length > 0" class="mb-10 flex flex-wrap items-center gap-2">
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
            {{ isZh ? '清除筛选' : 'Clear' }}
          </NuxtLink>
        </div>

        <div
          v-if="filteredEvents.length === 0"
          class="rounded-lg border border-dashed border-base-300 px-6 py-16 text-center"
        >
          <p class="mb-4 text-base text-base-content/55">
            {{ t('events.noEvents') }}
          </p>
          <NuxtLink :to="localePath('/events')" class="btn btn-primary btn-sm">
            {{ t('events.all') }}
          </NuxtLink>
        </div>

        <div v-else class="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          <NuxtLink
            v-for="event in filteredEvents"
            :key="event.slug"
            :to="localePath(`/events/${event.slug}`)"
            class="group flex flex-col overflow-hidden rounded-lg border border-base-200 bg-base-100 transition-colors duration-150 hover:border-base-300"
          >
            <div class="relative aspect-video overflow-hidden border-b border-base-200 bg-base-200/50">
              <img
                v-if="event.coverImage"
                :src="event.coverImage"
                :alt="event.name"
                class="h-full w-full object-cover"
                loading="lazy"
              >
              <div
                v-else
                class="flex h-full w-full items-center justify-center"
              >
                <Calendar class="h-10 w-10 text-base-content/20" />
              </div>
            </div>

            <div class="flex flex-1 flex-col p-5">
              <div class="mb-2">
                <span
                  class="badge badge-sm"
                  :class="{
                    'badge-primary': event.status === 'upcoming',
                    'badge-secondary': event.status === 'ongoing',
                    'badge-ghost': event.status === 'past',
                  }"
                >
                  {{ t(`events.${event.status}`) }}
                </span>
              </div>

              <h2 class="mb-2 text-lg font-bold leading-snug transition-colors group-hover:text-primary">
                {{ event.name }}
              </h2>

              <p class="mb-4 line-clamp-2 flex-1 text-sm text-base-content/60">
                {{ event.description }}
              </p>

              <div class="space-y-1.5 text-sm text-base-content/55">
                <div class="flex items-center gap-2">
                  <Calendar class="h-3.5 w-3.5 shrink-0" />
                  <span>
                    {{ formatDate(event.startDate) }}
                    <template v-if="event.startDate !== event.endDate">
                      – {{ formatDate(event.endDate) }}
                    </template>
                  </span>
                </div>
                <div v-if="event.location" class="flex items-center gap-2">
                  <MapPin class="h-3.5 w-3.5 shrink-0" />
                  <span class="truncate">{{ event.location }}</span>
                </div>
              </div>

              <div
                v-if="event.tags?.length"
                class="mt-3 flex flex-wrap gap-1"
              >
                <span
                  v-for="tag in event.tags.slice(0, 3)"
                  :key="tag"
                  class="badge badge-outline badge-xs"
                >
                  {{ tag }}
                </span>
                <span
                  v-if="event.tags.length > 3"
                  class="badge badge-ghost badge-xs"
                >
                  +{{ event.tags.length - 3 }}
                </span>
              </div>

              <div class="mt-4 flex items-center gap-1 text-sm font-medium text-base-content/50 transition-colors group-hover:text-primary">
                {{ isZh ? '查看详情' : 'View details' }}
                <ArrowRight class="h-3.5 w-3.5" />
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
