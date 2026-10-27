<script setup lang="ts">
import { ArrowLeft, ExternalLink } from '@lucide/vue'

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

// The same-day case prints the date once; the time row below carries the
// hours, so repeating them here would be noise.
function dateRange(startDate: string, endDate: string) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  if (start.toDateString() === end.toDateString()) {
    return formatDate(startDate)
  }
  return `${formatDate(startDate)} – ${formatDate(endDate)}`
}

const coverFailed = ref(false)

// The <img> can fail before hydration attaches its handler, so probe the
// source once more on the client; a missing file leaves the band alone
// instead of printing a grey box.
onMounted(() => {
  const src = event.value?.coverImage
  if (!src) return
  const probe = new Image()
  probe.onerror = () => { coverFailed.value = true }
  probe.src = src
})
</script>

<template>
  <div v-if="event">
    <header class="band">
      <div class="shell">
        <NuxtLink
          :to="localePath('/events')"
          class="back"
        >
          <ArrowLeft class="back-icon" aria-hidden="true" />
          {{ t('events.backToEvents') }}
        </NuxtLink>

        <p class="status">
          <span class="dot" :class="`dot-${event.status}`" />
          <span class="status-word">{{ t(`events.${event.status}`) }}</span>
        </p>

        <h1 class="title event-title">
          {{ event.name }}
        </h1>

        <p class="mono facts-line">
          <span>{{ dateRange(event.startDate, event.endDate) }}</span>
          <template v-if="event.location">
            <span class="facts-sep" aria-hidden="true">/</span>
            <span>{{ event.location }}</span>
          </template>
        </p>
      </div>
    </header>

    <div v-if="event.coverImage && !coverFailed" class="shell">
      <figure class="cover">
        <img
          :src="event.coverImage"
          :alt="event.name"
          loading="lazy"
          decoding="async"
          @error="coverFailed = true"
        >
      </figure>
    </div>

    <div class="shell body">
      <div class="body-grid">
        <article class="prose article">
          <h2>{{ isZh ? '关于活动' : 'About this event' }}</h2>
          <p>{{ event.description }}</p>

          <template v-if="event.tags?.length">
            <h2>{{ t('events.tags') }}</h2>
            <div class="tags">
              <NuxtLink
                v-for="tag in event.tags"
                :key="tag"
                :to="`${localePath('/events')}?tag=${encodeURIComponent(tag)}`"
                class="chip"
              >
                {{ tag }}
              </NuxtLink>
            </div>
          </template>
        </article>

        <aside class="aside">
          <section class="plate detail">
            <h2 class="detail-title">
              {{ isZh ? '活动详情' : 'Event details' }}
            </h2>

            <dl class="detail-list">
              <div class="detail-row">
                <dt>{{ t('events.date') }}</dt>
                <dd>{{ dateRange(event.startDate, event.endDate) }}</dd>
              </div>
              <div class="detail-row">
                <dt>{{ t('events.time') }}</dt>
                <dd class="mono">
                  {{ formatTime(event.startDate) }} – {{ formatTime(event.endDate) }}
                </dd>
              </div>
              <div v-if="event.location" class="detail-row">
                <dt>{{ t('events.location') }}</dt>
                <dd>{{ event.location }}</dd>
              </div>
            </dl>

            <a
              v-if="event.registrationUrl"
              :href="event.registrationUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="btn action"
              :class="event.status === 'past' ? 'btn-ghost' : 'btn-primary'"
            >
              {{ event.status === 'past' ? t('events.viewRecording') : t('events.register') }}
              <ExternalLink class="action-icon" aria-hidden="true" />
            </a>
          </section>
        </aside>
      </div>
    </div>
  </div>
</template>

<style scoped>
.band {
  padding-block: 3.5rem 2.5rem;
  border-bottom: 1px solid var(--color-line-soft);
}

.back {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  margin-bottom: 1.5rem;
  color: var(--color-faint);
  font-size: 0.8125rem;
  font-weight: 600;
  text-decoration: none;
  transition: color 140ms ease;
}

.back:hover {
  color: var(--color-base-content);
}

.back-icon {
  width: 0.875rem;
  height: 0.875rem;
}

.status {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0 0 0.6rem;
}

.status-word {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-dim);
}

.dot-upcoming {
  background: var(--color-primary);
}

.dot-ongoing {
  background: var(--color-success);
}

.dot-past {
  background: var(--color-line);
}

.event-title {
  margin: 0;
  max-width: 34rem;
  font-size: clamp(2rem, 4vw, 2.75rem);
}

.facts-line {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 1rem 0 0;
  color: var(--color-faint);
  font-size: 0.8125rem;
}

.facts-sep {
  color: var(--color-line);
}

.cover {
  margin: 2rem 0 0;
  overflow: hidden;
  border-radius: var(--radius-card);
  background: var(--color-base-300);
}

.cover img {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 7;
  object-fit: cover;
}

.body {
  padding-block: 2.5rem 4rem;
}

.body-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 2.5rem;
}

.article {
  max-width: 34rem;
}

.article :where(h2) {
  margin-top: 2rem;
  margin-bottom: 0.75rem;
  font-size: 1.0625rem;
  font-weight: 700;
}

.article :where(h2:first-child) {
  margin-top: 0;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.aside {
  align-self: start;
}

.detail {
  padding: 1.25rem;
}

.detail-title {
  margin: 0 0 0.5rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-faint);
}

.detail-list {
  margin: 0;
}

.detail-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.6rem 0;
  border-bottom: 1px solid var(--color-line-soft);
  font-size: 0.8125rem;
}

.detail-row:last-child {
  border-bottom: 0;
}

.detail-row dt {
  color: var(--color-faint);
}

.detail-row dd {
  margin: 0;
  text-align: right;
  color: var(--color-base-content);
}

.action {
  width: 100%;
  margin-top: 1rem;
}

.action-icon {
  width: 0.9375rem;
  height: 0.9375rem;
}

@media (min-width: 900px) {
  .body-grid {
    grid-template-columns: minmax(0, 34rem) minmax(0, 1fr);
    gap: 4rem;
  }
}
</style>
