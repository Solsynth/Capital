<script setup lang="ts">
import { Loader2 } from '@lucide/vue'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

definePageMeta({
  description: '',
})

useSeoMeta({
  title: () => `${t('seo.updates.title')}`,
  description: () => t('seo.updates.description'),
})

defineOgImage('UniOgImage', {
  title: t('updates.title'),
  description: t('seo.updates.description'),
})

useSchemaOrg([
  defineWebPage({
    name: () => t('seo.updates.title'),
    description: () => t('seo.updates.description'),
    url: () => `https://solsynth.dev${route.path}`,
  }),
  defineBreadcrumb({
    itemListElement: [
      {
        name: t('seo.home.title'),
        item: 'https://solsynth.dev',
      },
      {
        name: t('seo.updates.title'),
        item: () => `https://solsynth.dev${route.path}`,
      },
    ],
  }),
])

const { getPosts, getRealmPosts, getAttachmentUrl } = useApi()

// A fixed-width stamp: the log's date column lines up like a ledger.
function formatStamp(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(locale.value === 'zh' ? 'zh-CN' : 'en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

const PAGE_SIZE = 20

const activeTab = ref<'official' | 'community'>('official')
const selectedTag = ref<string | null>(null)
const officialPage = ref(0)
const communityPage = ref(0)
const officialLoading = ref(false)
const communityLoading = ref(false)
const officialHasMore = ref(true)
const communityHasMore = ref(true)

const officialPosts = ref<Awaited<ReturnType<typeof getPosts>>>([])
const communityPosts = ref<Awaited<ReturnType<typeof getRealmPosts>>>([])

async function loadOfficialPosts(reset = false) {
  if (officialLoading.value)
    return
  if (!reset && !officialHasMore.value)
    return

  officialLoading.value = true
  const skip = reset ? 0 : officialPosts.value.length
  const newPosts = await getPosts(PAGE_SIZE, skip)

  if (reset) {
    officialPosts.value = newPosts
    officialPage.value = 1
  }
  else {
    officialPosts.value = [...officialPosts.value, ...newPosts]
    officialPage.value++
  }

  officialHasMore.value = newPosts.length === PAGE_SIZE
  officialLoading.value = false
}

async function loadCommunityPosts(reset = false) {
  if (communityLoading.value)
    return
  if (!reset && !communityHasMore.value)
    return

  communityLoading.value = true
  const skip = reset ? 0 : communityPosts.value.length
  const newPosts = await getRealmPosts('solsynth', PAGE_SIZE, skip)

  if (reset) {
    communityPosts.value = newPosts
    communityPage.value = 1
  }
  else {
    communityPosts.value = [...communityPosts.value, ...newPosts]
    communityPage.value++
  }

  communityHasMore.value = newPosts.length === PAGE_SIZE
  communityLoading.value = false
}

await loadOfficialPosts()
await loadCommunityPosts()

const currentPosts = computed(() => activeTab.value === 'official' ? officialPosts.value : communityPosts.value)
const isLoading = computed(() => activeTab.value === 'official' ? officialLoading.value : communityLoading.value)
const hasMore = computed(() => activeTab.value === 'official' ? officialHasMore.value : communityHasMore.value)

const allTags = computed(() => {
  if (!currentPosts.value)
    return []
  const tagMap = new Map<string, { slug: string, name: string | null }>()
  for (const post of currentPosts.value) {
    for (const tag of post.tags) {
      if (!tagMap.has(tag.slug))
        tagMap.set(tag.slug, { slug: tag.slug, name: tag.name })
    }
  }
  return Array.from(tagMap.values())
})

const filteredPosts = computed(() => {
  if (!currentPosts.value)
    return []
  if (!selectedTag.value)
    return currentPosts.value
  return currentPosts.value.filter(post =>
    post.tags.some(tag => tag.slug === selectedTag.value),
  )
})

// A post without a title prints its opening words as the line; the excerpt is
// then omitted rather than repeating the same sentence under it.
const TITLE_WORDS = 90

function flatten(content: string): string {
  return (content ?? '').replace(/[#*`>_\-\n]+/g, ' ').replace(/\s+/g, ' ').trim()
}

function clip(text: string, limit: number): string {
  if (text.length <= limit) return text
  const cut = text.lastIndexOf(' ', limit)
  return `${text.slice(0, cut > 0 ? cut : limit).trimEnd()}…`
}

function getDisplayTitle(post: { title: string, content: string }): string {
  return post.title?.trim() || clip(flatten(post.content), TITLE_WORDS)
}

function getExcerpt(post: { title: string, content: string }): string {
  if (!post.title?.trim()) return ''
  return clip(flatten(post.content), 180)
}

function isImageAttachment(attachment: { mime_type: string }): boolean {
  return attachment.mime_type?.startsWith('image/') ?? false
}

function isVideoAttachment(attachment: { mime_type: string }): boolean {
  return attachment.mime_type?.startsWith('video/') ?? false
}

function isAudioAttachment(attachment: { mime_type: string }): boolean {
  return attachment.mime_type?.startsWith('audio/') ?? false
}

function getInitials(name: string): string {
  if (!name || name === 'Unknown')
    return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function getTagName(tag: { slug: string, name: string | null }): string {
  return tag.name || tag.slug
}

function selectTag(slug: string) {
  selectedTag.value = selectedTag.value === slug ? null : slug
}

function clearTag() {
  selectedTag.value = null
}

function loadMore() {
  if (activeTab.value === 'official')
    loadOfficialPosts()
  else
    loadCommunityPosts()
}

function switchTab(tab: 'official' | 'community') {
  activeTab.value = tab
  selectedTag.value = null
}
</script>

<template>
  <div>
    <header class="band">
      <div class="shell">
        <h1 class="title page-title">
          {{ t('updates.title') }}
        </h1>
        <p class="lede page-lede">
          {{ t('updates.subtitle') }}
        </p>
      </div>
    </header>

    <section class="body">
      <div class="shell">
        <div class="controls">
          <div class="rail" role="tablist" :aria-label="t('updates.title')">
            <button
              v-for="tab in (['official', 'community'] as const)"
              :key="tab"
              type="button"
              role="tab"
              class="rail-tab"
              :class="{ 'is-current': activeTab === tab }"
              :aria-selected="activeTab === tab"
              @click="switchTab(tab)"
            >
              {{ t(`updates.tabs.${tab}`) }}
            </button>
          </div>

          <div v-if="allTags.length > 0" class="tags">
            <button
              v-for="tag in allTags"
              :key="tag.slug"
              type="button"
              class="chip"
              :class="{ 'is-current': selectedTag === tag.slug }"
              :aria-pressed="selectedTag === tag.slug"
              @click="selectTag(tag.slug)"
            >
              {{ getTagName(tag) }}
            </button>
            <button
              v-if="selectedTag"
              type="button"
              class="chip filter-clear"
              @click="clearTag"
            >
              {{ t('updates.clearFilter') }}
            </button>
          </div>
        </div>

        <p v-if="!filteredPosts?.length && !isLoading" class="log-empty">
          {{ t('updates.noUpdates') }}
        </p>

        <ol v-else class="log">
          <li v-for="post in filteredPosts" :key="post.id" class="log-row">
            <NuxtLink :to="localePath(`/updates/${post.id}`)" class="log-link">
              <time class="mono log-date" :datetime="post.published_at">{{ formatStamp(post.published_at) }}</time>

              <span class="log-body">
                <span class="log-title">{{ getDisplayTitle(post) }}</span>
                <span v-if="getExcerpt(post)" class="log-excerpt">{{ getExcerpt(post) }}</span>
                <span class="log-meta">
                  <span class="log-avatar" aria-hidden="true">{{ getInitials(post.publisher?.nick || 'Unknown') }}</span>
                  {{ post.publisher?.nick || 'Unknown' }}
                  <template v-if="post.tags.length">
                    <span class="log-sep" aria-hidden="true">/</span>
                    {{ post.tags.slice(0, 2).map(getTagName).join(', ') }}
                  </template>
                  <span v-if="post.views_unique" class="log-views">
                    {{ post.views_unique }} {{ t('updates.views') }}
                  </span>
                </span>
              </span>

              <span
                v-if="post.attachments.length > 0 && isImageAttachment(post.attachments[0])"
                class="log-thumb"
                aria-hidden="true"
              >
                <img :src="getAttachmentUrl(post.attachments[0].id)" alt="" loading="lazy" decoding="async">
              </span>
            </NuxtLink>
          </li>
        </ol>

        <div v-if="hasMore && !selectedTag" class="more">
          <button
            type="button"
            class="btn"
            :disabled="isLoading"
            @click="loadMore"
          >
            <Loader2 v-if="isLoading" class="more-spinner" aria-hidden="true" />
            {{ isLoading ? t('updates.loading') : t('updates.loadMore') }}
          </button>
        </div>
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
  font-size: clamp(2rem, 4vw, 2.75rem);
  margin: 0;
}

.page-lede {
  margin: 0.75rem 0 0;
}

.body {
  padding-block: 2rem 0;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  margin-bottom: 1.75rem;
}

.rail {
  display: flex;
  align-self: flex-start;
  max-width: 100%;
  overflow-x: auto;
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

.rail-tab:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.filter-clear {
  color: var(--color-error);
  border-color: color-mix(in oklab, var(--color-error) 40%, transparent);
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
  color: var(--color-faint);
}

.log-body {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.log-title {
  font-size: 0.9375rem;
  font-weight: 600;
  line-height: 1.4;
  color: var(--color-base-content);
  letter-spacing: -0.005em;
}

.log-link:hover .log-title {
  color: var(--color-primary);
}

.log-excerpt {
  display: -webkit-box;
  overflow: hidden;
  font-size: 0.8125rem;
  line-height: 1.55;
  color: var(--color-faint);
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.log-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem;
  margin-top: 0.15rem;
  font-size: 0.75rem;
  color: var(--color-faint);
}

.log-avatar {
  display: inline-flex;
  width: 1.125rem;
  height: 1.125rem;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: color-mix(in oklab, var(--color-base-300) 80%, transparent);
  font-family: var(--font-mono);
  font-size: 0.5625rem;
  color: var(--color-dim);
}

.log-sep {
  color: var(--color-line);
}

.log-views {
  margin-left: auto;
}

.log-thumb {
  display: none;
}

.log-empty {
  margin: 0;
  padding: 2.5rem 0;
  border-top: 1px solid var(--color-line);
  border-bottom: 1px solid var(--color-line-soft);
  font-size: 0.9375rem;
  color: var(--color-faint);
}

.more {
  display: flex;
  justify-content: center;
  padding-top: 1.5rem;
}

.more-spinner {
  width: 0.875rem;
  height: 0.875rem;
  animation: spin 900ms linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (min-width: 768px) {
  .log-link {
    grid-template-columns: 6.5rem minmax(0, 1fr) 7rem;
    align-items: start;
    gap: 1.5rem;
    padding-block: 1.15rem;
  }

  .log-date {
    padding-top: 0.2rem;
  }

  .log-thumb {
    display: block;
    aspect-ratio: 16 / 10;
    overflow: hidden;
    border-radius: var(--radius-mark);
    background: var(--color-base-300);
  }

  .log-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}
</style>
