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
  title: () => event.value?.name ? `${event.value.name}` : `${t('seo.events.title')}`,
  description: () => event.value?.description || t('seo.events.description'),
  ogTitle: () => event.value?.name ? `${event.value.name}` : `${t('seo.events.title')}`,
  ogDescription: () => event.value?.description || t('seo.events.description'),
  ogImage: () => event.value?.coverImage || undefined,
  twitterCard: 'summary_large_image',
  twitterTitle: () => event.value?.name ? `${event.value.name}` : `${t('seo.events.title')}`,
  twitterDescription: () => event.value?.description || t('seo.events.description'),
  twitterImage: () => event.value?.coverImage || undefined,
})

defineOgImage('UniOgImage', {
  title: event.value?.name || t('events.title'),
  description: event.value?.description || t('seo.events.description'),
})

useSchemaOrg([
  defineEvent({
    name: () => event.value?.name || '',
    description: () => event.value?.description || '',
    image: () => event.value?.coverImage,
    startDate: () => event.value?.startDate || '',
    endDate: () => event.value?.endDate || '',
    eventStatus: () => {
      if (!event.value)
        return 'https://schema.org/EventScheduled'
      switch (event.value.status) {
        case 'upcoming': return 'https://schema.org/EventScheduled'
        case 'ongoing': return 'https://schema.org/EventScheduled'
        case 'past': return 'https://schema.org/EventCompleted'
        default: return 'https://schema.org/EventScheduled'
      }
    },
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: () => event.value?.location
      ? {
          '@type': 'Place',
          name: event.value.location,
        }
      : undefined,
    organizer: {
      '@type': 'Organization',
      name: 'Solsynth',
      url: 'https://solsynth.dev',
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: () => event.value?.registrationUrl || `https://solsynth.dev${route.path}`,
    },
  }),
  defineBreadcrumb({
    itemListElement: [
      {
        name: t('seo.home.title'),
        item: 'https://solsynth.dev',
      },
      {
        name: t('seo.events.title'),
        item: `https://solsynth.dev${localePath('/events')}`,
      },
      {
        name: () => event.value?.name || '',
        item: () => `https://solsynth.dev${route.path}`,
      },
    ],
  }),
])

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
    return `${formatDate(startDate)} · ${formatTime(startDate)} – ${formatTime(endDate)}`
  }

  return `${formatDate(startDate)} – ${formatDate(endDate)}`
}
</script>

<template>
  <div v-if="event">
    <section class="relative overflow-hidden border-b border-base-200">
      <template v-if="event.coverImage">
        <img
          :src="event.coverImage"
          :alt="event.name"
          class="absolute inset-0 h-full w-full object-cover opacity-30"
        >
        <div class="absolute inset-0 bg-linear-to-b from-base-100/40 via-base-100/80 to-base-100" />
      </template>

      <div class="relative container mx-auto max-w-5xl px-4 py-12 md:py-16">
        <NuxtLink
          :to="localePath('/events')"
          class="btn btn-ghost btn-sm mb-8 -ml-2 gap-1.5 text-base-content/60"
        >
          <ArrowLeft class="h-4 w-4" />
          {{ t('events.backToEvents') }}
        </NuxtLink>

        <div class="mb-4">
          <span
            class="badge"
            :class="{
              'badge-primary': event.status === 'upcoming',
              'badge-secondary': event.status === 'ongoing',
              'badge-ghost': event.status === 'past',
            }"
          >
            {{ t(`events.${event.status}`) }}
          </span>
        </div>

        <h1 class="mb-5 max-w-3xl text-3xl font-extrabold tracking-tight md:text-4xl lg:text-5xl">
          {{ event.name }}
        </h1>

        <div class="flex flex-wrap gap-x-5 gap-y-2 text-base text-base-content/65">
          <div class="flex items-center gap-2">
            <Calendar class="h-4 w-4 shrink-0" />
            <span>{{ formatDateRange(event.startDate, event.endDate) }}</span>
          </div>
          <div v-if="event.location" class="flex items-center gap-2">
            <MapPin class="h-4 w-4 shrink-0" />
            <span>{{ event.location }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="px-4 py-12">
      <div class="container mx-auto max-w-5xl">
        <div class="grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div class="lg:col-span-2">
            <h2 class="mb-3 text-xl font-bold tracking-tight">
              {{ isZh ? '关于活动' : 'About this event' }}
            </h2>
            <p class="text-base leading-relaxed text-base-content/75 md:text-lg">
              {{ event.description }}
            </p>

            <div v-if="event.tags?.length" class="mt-8">
              <h3 class="mb-3 flex items-center gap-2 text-sm font-semibold text-base-content/70">
                <Tag class="h-4 w-4" />
                {{ t('events.tags') }}
              </h3>
              <div class="flex flex-wrap gap-2">
                <NuxtLink
                  v-for="tag in event.tags"
                  :key="tag"
                  :to="`${localePath('/events')}?tag=${encodeURIComponent(tag)}`"
                  class="badge badge-outline hover:badge-primary"
                >
                  {{ tag }}
                </NuxtLink>
              </div>
            </div>
          </div>

          <aside>
            <div class="sticky top-20 rounded-lg border border-base-200 bg-base-100 p-5">
              <h3 class="mb-4 text-base font-semibold">
                {{ isZh ? '活动详情' : 'Event details' }}
              </h3>

              <div class="space-y-4">
                <div class="flex items-start gap-3">
                  <Calendar class="mt-0.5 h-4 w-4 shrink-0 text-base-content/50" />
                  <div>
                    <p class="text-sm font-medium">
                      {{ t('events.date') }}
                    </p>
                    <p class="text-sm text-base-content/60">
                      {{ formatDate(event.startDate) }}
                      <template v-if="event.startDate !== event.endDate">
                        – {{ formatDate(event.endDate) }}
                      </template>
                    </p>
                  </div>
                </div>

                <div class="flex items-start gap-3">
                  <Clock class="mt-0.5 h-4 w-4 shrink-0 text-base-content/50" />
                  <div>
                    <p class="text-sm font-medium">
                      {{ t('events.time') }}
                    </p>
                    <p class="text-sm text-base-content/60">
                      {{ formatTime(event.startDate) }} – {{ formatTime(event.endDate) }}
                    </p>
                  </div>
                </div>

                <div v-if="event.location" class="flex items-start gap-3">
                  <MapPin class="mt-0.5 h-4 w-4 shrink-0 text-base-content/50" />
                  <div>
                    <p class="text-sm font-medium">
                      {{ t('events.location') }}
                    </p>
                    <p class="text-sm text-base-content/60">
                      {{ event.location }}
                    </p>
                  </div>
                </div>
              </div>

              <div v-if="event.registrationUrl" class="mt-6">
                <a
                  :href="event.registrationUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="btn w-full gap-1.5"
                  :class="event.status === 'past' ? 'btn-ghost border border-base-300' : 'btn-primary'"
                >
                  {{ event.status === 'past' ? t('events.viewRecording') : t('events.register') }}
                  <ExternalLink class="h-4 w-4" />
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  </div>
</template>
