<script setup lang="ts">
import { Calendar, MapPin, Tag, ArrowRight } from '@lucide/vue'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

const lang = computed(() => locale.value)
const isZh = computed(() => lang.value === 'zh')

definePageMeta({
  description: '',
})

useSeoMeta({
  title: () => `${t('seo.events.title')} - ${t('seo.siteName')}`,
  description: () => t('seo.events.description'),
})

defineOgImage('OgImage', {
  title: t('events.title'),
  description: t('seo.events.description'),
})

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
  if (!events.value) return []
  return [...new Set(events.value.flatMap(e => e.tags || []))].sort()
})

const filteredEvents = computed(() => {
  if (!events.value) return []
  let filtered = events.value
  if (urlStatus.value) {
    filtered = filtered.filter(e => e.status === urlStatus.value)
  }
  if (urlTag.value) {
    filtered = filtered.filter(e => e.tags?.includes(urlTag.value))
  }
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

function formatTime(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleTimeString(lang.value === 'zh' ? 'zh-CN' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <div class="container mx-auto px-4 py-16">
    <div class="text-center mb-12">
      <h1 class="text-4xl md:text-5xl font-bold mb-4">{{ t('events.title') }}</h1>
      <p class="text-xl opacity-70 max-w-2xl mx-auto">
        {{ t('events.subtitle') }}
      </p>
    </div>

    <div class="flex flex-wrap justify-center gap-2 mb-8">
      <NuxtLink
        :to="localePath('/events')"
        class="btn btn-sm"
        :class="!urlStatus ? 'btn-primary' : 'btn-outline'"
      >
        {{ t('events.all') }}
      </NuxtLink>
      <NuxtLink
        :to="`${localePath('/events')}?status=upcoming`"
        class="btn btn-sm"
        :class="urlStatus === 'upcoming' ? 'btn-primary' : 'btn-outline'"
      >
        {{ t('events.upcoming') }}
        <span v-if="upcomingCount > 0" class="badge badge-sm ml-2">{{ upcomingCount }}</span>
      </NuxtLink>
      <NuxtLink
        :to="`${localePath('/events')}?status=ongoing`"
        class="btn btn-sm"
        :class="urlStatus === 'ongoing' ? 'btn-primary' : 'btn-outline'"
      >
        {{ t('events.ongoing') }}
        <span v-if="ongoingCount > 0" class="badge badge-sm ml-2">{{ ongoingCount }}</span>
      </NuxtLink>
      <NuxtLink
        :to="`${localePath('/events')}?status=past`"
        class="btn btn-sm"
        :class="urlStatus === 'past' ? 'btn-primary' : 'btn-outline'"
      >
        {{ t('events.past') }}
        <span v-if="pastCount > 0" class="badge badge-sm ml-2">{{ pastCount }}</span>
      </NuxtLink>
    </div>

    <div v-if="allTags.length > 0" class="mb-12">
      <div class="flex flex-wrap justify-center gap-2">
        <NuxtLink
          v-for="tag in allTags"
          :key="tag"
          :to="`${localePath('/events')}${urlStatus ? `?status=${urlStatus}&` : '?'}tag=${encodeURIComponent(tag)}`"
          class="btn btn-xs"
          :class="urlTag === tag ? 'btn-secondary' : 'btn-ghost'"
        >
          <Tag class="w-3 h-3 mr-1" />
          {{ tag }}
        </NuxtLink>
        <NuxtLink
          v-if="urlTag"
          :to="`${localePath('/events')}${urlStatus ? `?status=${urlStatus}` : ''}`"
          class="btn btn-xs btn-ghost text-error"
        >
          ✕ {{ isZh ? '清除筛选' : 'Clear' }}
        </NuxtLink>
      </div>
    </div>

    <div v-if="filteredEvents.length === 0" class="text-center py-16">
      <p class="text-lg opacity-70">{{ t('events.noEvents') }}</p>
      <NuxtLink :to="localePath('/events')" class="btn btn-primary mt-4">
        {{ t('events.all') }}
      </NuxtLink>
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <NuxtLink
        v-for="event in filteredEvents"
        :key="event.slug"
        :to="localePath(`/events/${event.slug}`)"
        class="card bg-base-200 hover:bg-base-300 transition-colors group"
      >
        <figure v-if="event.coverImage" class="h-48 overflow-hidden">
          <img
            :src="event.coverImage"
            :alt="event.name"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          >
        </figure>
        <figure v-else class="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
          <Calendar class="w-16 h-16 opacity-30" />
        </figure>

        <div class="card-body">
          <div class="flex items-center gap-2 mb-2">
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

          <h2 class="card-title text-xl">{{ event.name }}</h2>

          <p class="opacity-70 line-clamp-2">{{ event.description }}</p>

          <div class="mt-4 space-y-2 text-sm opacity-80">
            <div class="flex items-center gap-2">
              <Calendar class="w-4 h-4" />
              <span>
                {{ formatDate(event.startDate) }}
                <template v-if="event.startDate !== event.endDate">
                  - {{ formatDate(event.endDate) }}
                </template>
              </span>
            </div>
            <div v-if="event.location" class="flex items-center gap-2">
              <MapPin class="w-4 h-4" />
              <span>{{ event.location }}</span>
            </div>
          </div>

          <div v-if="event.tags && event.tags.length > 0" class="flex flex-wrap gap-1 mt-3">
            <span v-for="tag in event.tags.slice(0, 3)" :key="tag" class="badge badge-outline badge-xs">
              {{ tag }}
            </span>
            <span v-if="event.tags.length > 3" class="badge badge-ghost badge-xs">
              +{{ event.tags.length - 3 }}
            </span>
          </div>

          <div class="card-actions justify-end mt-4">
            <span class="btn btn-primary btn-sm">
              {{ isZh ? '查看详情' : 'View Details' }}
              <ArrowRight class="w-4 h-4" />
            </span>
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
