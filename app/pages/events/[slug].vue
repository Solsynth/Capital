<script setup lang="ts">
import { Calendar, MapPin, ArrowLeft, Tag, ExternalLink, Clock } from '@lucide/vue'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

const lang = computed(() => locale.value)
const slug = computed(() => route.params.slug as string)
const isZh = computed(() => lang.value === 'zh')

const { data: event } = await useAsyncData(`event-${lang.value}-${slug.value}`, async () => {
  const allEvents = await queryCollection('events')
    .where('path', 'LIKE', `/events/${lang.value}/%`)
    .all()
  return allEvents.find(e => e.path === `/events/${lang.value}/${slug.value}`) || null
})

if (!event.value) {
  navigateTo(localePath('/events'))
}

definePageMeta({
  title: '',
  description: '',
})

useSeoMeta({
  title: () => event.value?.name ? `${event.value.name} - ${t('seo.siteName')}` : `${t('seo.events.title')} - ${t('seo.siteName')}`,
  description: () => event.value?.description || t('seo.events.description'),
  ogTitle: () => event.value?.name ? `${event.value.name} - ${t('seo.siteName')}` : `${t('seo.events.title')} - ${t('seo.siteName')}`,
  ogDescription: () => event.value?.description || t('seo.events.description'),
  ogImage: () => event.value?.coverImage || undefined,
  twitterCard: 'summary_large_image',
  twitterTitle: () => event.value?.name ? `${event.value.name} - ${t('seo.siteName')}` : `${t('seo.events.title')} - ${t('seo.siteName')}`,
  twitterDescription: () => event.value?.description || t('seo.events.description'),
  twitterImage: () => event.value?.coverImage || undefined,
})

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString(lang.value === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'long',
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

function formatDateRange(startDate: string, endDate: string) {
  const start = new Date(startDate)
  const end = new Date(endDate)

  if (start.toDateString() === end.toDateString()) {
    return `${formatDate(startDate)} · ${formatTime(startDate)} - ${formatTime(endDate)}`
  }

  return `${formatDate(startDate)} - ${formatDate(endDate)}`
}
</script>

<template>
  <div v-if="event">
    <div class="relative min-h-[50vh] flex items-end">
      <template v-if="event.coverImage">
        <img
          :src="event.coverImage"
          :alt="event.name"
          class="absolute inset-0 w-full h-full object-cover"
        >
        <div class="absolute inset-0 bg-gradient-to-t from-base-100 via-base-100/80 to-base-100/30" />
      </template>
      <div v-else class="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10" />

      <div class="relative container mx-auto px-4 py-12">
        <div class="max-w-4xl">
          <NuxtLink
            :to="localePath('/events')"
            class="btn btn-ghost btn-sm mb-6 inline-flex"
          >
            <ArrowLeft class="w-4 h-4 mr-2" />
            {{ t('events.backToEvents') }}
          </NuxtLink>

          <div class="mb-4">
            <span
              class="badge badge-lg"
              :class="{
                'badge-primary': event.status === 'upcoming',
                'badge-secondary': event.status === 'ongoing',
                'badge-ghost': event.status === 'past',
              }"
            >
              {{ t(`events.${event.status}`) }}
            </span>
          </div>

          <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            {{ event.name }}
          </h1>

          <div class="flex flex-wrap gap-4 text-lg opacity-80">
            <div class="flex items-center gap-2">
              <Calendar class="w-5 h-5" />
              <span>{{ formatDateRange(event.startDate, event.endDate) }}</span>
            </div>
            <div v-if="event.location" class="flex items-center gap-2">
              <MapPin class="w-5 h-5" />
              <span>{{ event.location }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="container mx-auto px-4 py-12">
      <div class="max-w-4xl mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2">
            <div class="prose prose-lg max-w-none">
              <h2 class="text-2xl font-bold mb-4">
                {{ isZh ? '关于活动' : 'About this Event' }}
              </h2>
              <p class="opacity-80 leading-relaxed">{{ event.description }}</p>
            </div>

            <div v-if="event.tags && event.tags.length > 0" class="mt-8">
              <h3 class="text-lg font-semibold mb-3 flex items-center gap-2">
                <Tag class="w-5 h-5" />
                {{ t('events.tags') }}
              </h3>
              <div class="flex flex-wrap gap-2">
                <NuxtLink
                  v-for="tag in event.tags"
                  :key="tag"
                  :to="`${localePath('/events')}?tag=${encodeURIComponent(tag)}`"
                  class="badge badge-outline badge-lg hover:badge-primary cursor-pointer"
                >
                  {{ tag }}
                </NuxtLink>
              </div>
            </div>
          </div>

          <div class="lg:col-span-1">
            <div class="card bg-base-200 sticky top-4">
              <div class="card-body">
                <h3 class="card-title text-lg">
                  {{ isZh ? '活动详情' : 'Event Details' }}
                </h3>

                <div class="space-y-4 mt-4">
                  <div class="flex items-start gap-3">
                    <Calendar class="w-5 h-5 mt-0.5 opacity-70" />
                    <div>
                      <p class="font-medium">{{ t('events.date') }}</p>
                      <p class="text-sm opacity-70">
                        {{ formatDate(event.startDate) }}
                        <template v-if="event.startDate !== event.endDate">
                          - {{ formatDate(event.endDate) }}
                        </template>
                      </p>
                    </div>
                  </div>

                  <div class="flex items-start gap-3">
                    <Clock class="w-5 h-5 mt-0.5 opacity-70" />
                    <div>
                      <p class="font-medium">{{ t('events.time') }}</p>
                      <p class="text-sm opacity-70">
                        {{ formatTime(event.startDate) }} - {{ formatTime(event.endDate) }}
                      </p>
                    </div>
                  </div>

                  <div v-if="event.location" class="flex items-start gap-3">
                    <MapPin class="w-5 h-5 mt-0.5 opacity-70" />
                    <div>
                      <p class="font-medium">{{ t('events.location') }}</p>
                      <p class="text-sm opacity-70">{{ event.location }}</p>
                    </div>
                  </div>
                </div>

                <div v-if="event.registrationUrl" class="card-actions mt-6">
                  <a
                    :href="event.registrationUrl"
                    target="_blank"
                    class="btn w-full"
                    :class="event.status === 'past' ? 'btn-outline' : 'btn-primary'"
                  >
                    <template v-if="event.status === 'past'">
                      {{ t('events.viewRecording') }}
                      <ExternalLink class="w-4 h-4" />
                    </template>
                    <template v-else>
                      {{ t('events.register') }}
                      <ExternalLink class="w-4 h-4" />
                    </template>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-12 pt-8 border-t border-base-300">
          <NuxtLink
            :to="localePath('/events')"
            class="btn btn-ghost"
          >
            <ArrowLeft class="w-4 h-4 mr-2" />
            {{ t('events.backToEvents') }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
