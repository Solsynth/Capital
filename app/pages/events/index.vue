<script setup lang="ts">
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

const statusOptions = computed(() => [
  { value: '', label: t('events.all') },
  { value: 'upcoming', label: t('events.upcoming') },
  { value: 'ongoing', label: t('events.ongoing') },
  { value: 'past', label: t('events.past') },
])

// A fixed-width stamp: the date column lines up the way a ledger does.
function stamp(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(isZh.value ? 'zh-CN' : 'en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

function endStamp(start: string, end: string): string | null {
  const startDate = new Date(start)
  const endDate = new Date(end)
  if (Number.isNaN(endDate.getTime())) return null
  if (startDate.toDateString() === endDate.toDateString()) return null
  return stamp(end)
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
    <header class="band">
      <div class="shell">
        <h1 class="title page-title">
          {{ t('events.title') }}
        </h1>
        <p class="lede page-lede">
          {{ t('events.subtitle') }}
        </p>
      </div>
    </header>

    <section class="body">
      <div class="shell">
        <div class="controls">
          <nav class="rail" :aria-label="t('events.title')">
            <NuxtLink
              v-for="option in statusOptions"
              :key="option.value || 'all'"
              :to="statusQuery(option.value)"
              class="rail-tab"
              :class="{ 'is-current': urlStatus === option.value }"
              :aria-current="urlStatus === option.value ? 'page' : undefined"
            >
              {{ option.label }}
            </NuxtLink>
          </nav>

          <div v-if="allTags.length > 0" class="tags">
            <NuxtLink
              v-for="tag in allTags"
              :key="tag"
              :to="tagQuery(tag)"
              class="chip"
              :class="{ 'is-current': urlTag === tag }"
            >
              {{ tag }}
            </NuxtLink>
            <NuxtLink
              v-if="urlTag"
              :to="tagQuery('')"
              class="chip tag-clear"
            >
              {{ t('events.clearFilter') }}
            </NuxtLink>
          </div>
        </div>

        <p v-if="filteredEvents.length === 0" class="log-empty">
          {{ t('events.noEvents') }}
        </p>

        <ol v-else class="log">
          <li v-for="event in filteredEvents" :key="event.slug" class="log-row">
            <NuxtLink
              :to="localePath(`/events/${event.slug}`)"
              class="log-link"
            >
              <span class="mono log-date">
                {{ stamp(event.startDate) }}
                <span v-if="endStamp(event.startDate, event.endDate)" class="log-date-end">
                  {{ endStamp(event.startDate, event.endDate) }}
                </span>
              </span>

              <span class="log-body">
                <span class="log-name">{{ event.name }}</span>
                <span class="log-desc">{{ event.description }}</span>
              </span>

              <span v-if="event.location" class="log-place">{{ event.location }}</span>

              <span class="log-status">
                <span class="dot" :class="`dot-${event.status}`" />
                {{ t(`events.${event.status}`) }}
              </span>
            </NuxtLink>
          </li>
        </ol>
      </div>
    </section>
  </div>
</template>

<style scoped>
.band {
  padding-block: 3.5rem 2.5rem;
  border-bottom: 1px solid var(--color-line-soft);
}

.page-title {
  margin: 0;
  font-size: clamp(2rem, 4vw, 2.75rem);
}

.page-lede {
  margin: 0.75rem 0 0;
}

.body {
  padding-block: 2rem 4rem;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  margin-bottom: 1.75rem;
}

.rail {
  display: inline-flex;
  align-self: flex-start;
  gap: 0.125rem;
  padding: 0.1875rem;
  border: 1px solid var(--color-line-soft);
  border-radius: 999px;
  background: color-mix(in oklab, var(--color-base-200) 45%, transparent);
}

.rail-tab {
  padding: 0.375rem 0.9rem;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--color-faint);
  font-family: inherit;
  font-size: 0.8125rem;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  transition:
    color 140ms ease,
    background-color 140ms ease;
}

.rail-tab:hover {
  color: var(--color-base-content);
}

.rail-tab.is-current {
  background: var(--color-base-300);
  color: var(--color-base-content);
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.tag-clear {
  border-color: color-mix(in oklab, var(--color-error) 40%, transparent);
  color: var(--color-error);
}

.log-row {
  border-bottom: 1px solid var(--color-line-soft);
}

.log-link {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.5rem;
  padding: 1.1rem 0.5rem 1.1rem 0;
  color: inherit;
  text-decoration: none;
  transition: background-color 140ms ease;
}

.log-link:hover {
  background: color-mix(in oklab, var(--color-base-200) 55%, transparent);
}

.log-link:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: -2px;
}

.log-date {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  padding-top: 0.15rem;
  color: var(--color-faint);
}

.log-date-end::before {
  content: '– ';
  color: var(--color-line);
}

.log-body {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.log-name {
  font-size: 0.9375rem;
  font-weight: 600;
  line-height: 1.4;
  color: var(--color-base-content);
  letter-spacing: -0.005em;
}

.log-link:hover .log-name {
  color: var(--color-primary);
}

.log-desc {
  overflow: hidden;
  font-size: 0.8125rem;
  line-height: 1.55;
  color: var(--color-faint);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.log-place {
  font-size: 0.8125rem;
  color: var(--color-faint);
}

.log-status {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
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

.log-empty {
  margin: 0;
  padding: 2.5rem 0;
  border-top: 1px solid var(--color-line);
  border-bottom: 1px solid var(--color-line-soft);
  font-size: 0.9375rem;
  color: var(--color-faint);
}

@media (min-width: 768px) {
  .log-link {
    grid-template-columns: 6.5rem minmax(0, 1fr) 10rem 7rem;
    align-items: start;
    gap: 1.5rem;
    padding-block: 1.15rem;
  }

  .log-date {
    flex-direction: column;
    gap: 0;
  }

  .log-place {
    padding-top: 0.15rem;
  }

  .log-status {
    justify-content: flex-start;
    padding-top: 0.15rem;
  }
}
</style>
