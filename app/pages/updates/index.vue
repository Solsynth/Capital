<script setup lang="ts">
import {
  Calendar,
  Paperclip,
  Eye,
  MessageCircle,
  Heart,
  ArrowRight,
  Hash,
  X,
  Loader2,
} from '@lucide/vue'

const { t } = useI18n()
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

const { getPosts, getRealmPosts, formatDate, truncateContent, getAttachmentUrl } = useApi()

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

function getDisplayTitle(post: { title: string, content: string }): string | null {
  if (post.title?.trim())
    return post.title
  return null
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
    <section class="border-b border-base-200 px-4 py-16 md:py-20">
      <div class="container mx-auto max-w-5xl">
        <h1 class="mb-3 text-4xl font-extrabold tracking-tight md:text-5xl">
          {{ t('updates.title') }}
        </h1>
        <p class="max-w-2xl text-lg text-base-content/65 md:text-xl">
          {{ t('updates.subtitle') }}
        </p>
      </div>
    </section>

    <section class="px-4 py-10">
      <div class="container mx-auto max-w-5xl">
        <div class="mb-8 flex gap-1 border-b border-base-200">
          <button
            type="button"
            class="border-b-2 px-4 py-2.5 text-sm font-medium transition-colors"
            :class="activeTab === 'official'
              ? 'border-primary text-primary'
              : 'border-transparent text-base-content/55 hover:text-base-content/80'"
            @click="switchTab('official')"
          >
            {{ t('updates.tabs.official') }}
          </button>
          <button
            type="button"
            class="border-b-2 px-4 py-2.5 text-sm font-medium transition-colors"
            :class="activeTab === 'community'
              ? 'border-primary text-primary'
              : 'border-transparent text-base-content/55 hover:text-base-content/80'"
            @click="switchTab('community')"
          >
            {{ t('updates.tabs.community') }}
          </button>
        </div>

        <div
          v-if="allTags.length > 0"
          class="mb-8 flex flex-wrap items-center gap-2"
        >
          <button
            v-for="tag in allTags"
            :key="tag.slug"
            type="button"
            class="badge badge-sm gap-1 cursor-pointer border transition-colors"
            :class="selectedTag === tag.slug
              ? 'badge-primary border-primary'
              : 'badge-ghost border-base-300 hover:border-base-content/20'"
            @click="selectTag(tag.slug)"
          >
            <Hash class="h-3 w-3" />
            {{ getTagName(tag) }}
          </button>
          <button
            v-if="selectedTag"
            type="button"
            class="badge badge-sm badge-ghost gap-1 cursor-pointer text-error"
            @click="clearTag"
          >
            <X class="h-3 w-3" />
            {{ t('updates.clearFilter') }}
          </button>
        </div>

        <div
          v-if="!filteredPosts?.length"
          class="rounded-lg border border-dashed border-base-300 px-6 py-16 text-center"
        >
          <p class="mb-4 text-base text-base-content/55">
            {{ t('updates.noUpdates') }}
          </p>
          <button
            v-if="selectedTag"
            type="button"
            class="btn btn-ghost btn-sm"
            @click="clearTag"
          >
            {{ t('updates.clearFilter') }}
          </button>
          <NuxtLink
            v-else
            :to="localePath('/')"
            class="btn btn-primary btn-sm"
          >
            {{ t('about.backToHome') }}
          </NuxtLink>
        </div>

        <div v-else class="grid grid-cols-1 gap-5 md:grid-cols-2">
          <NuxtLink
            v-for="post in filteredPosts"
            :key="post.id"
            :to="localePath(`/updates/${post.id}`)"
            class="group flex flex-col overflow-hidden rounded-lg border border-base-200 bg-base-100 transition-colors duration-150 hover:border-base-300"
          >
            <div
              v-if="post.attachments.length > 0 && isImageAttachment(post.attachments[0])"
              class="aspect-video w-full overflow-hidden border-b border-base-200"
            >
              <img
                :src="getAttachmentUrl(post.attachments[0].id)"
                :alt="post.attachments[0].name"
                class="h-full w-full object-cover"
                loading="lazy"
              >
            </div>
            <div
              v-else-if="post.attachments.length > 0 && isVideoAttachment(post.attachments[0])"
              class="w-full overflow-hidden border-b border-base-200"
            >
              <video
                :src="getAttachmentUrl(post.attachments[0].id)"
                class="aspect-video w-full object-cover"
                controls
                preload="metadata"
                @click.stop
              />
            </div>
            <div
              v-else-if="post.attachments.length > 0 && isAudioAttachment(post.attachments[0])"
              class="border-b border-base-200 bg-base-200/40 p-3"
            >
              <audio
                :src="getAttachmentUrl(post.attachments[0].id)"
                class="w-full"
                controls
                preload="metadata"
                @click.stop
              />
            </div>

            <div class="flex flex-1 flex-col gap-3 p-5">
              <div class="flex items-center gap-3">
                <div v-if="post.publisher?.picture" class="avatar">
                  <div class="h-8 w-8 rounded-full">
                    <img
                      :src="getAttachmentUrl(post.publisher.picture.id)"
                      :alt="post.publisher.nick"
                      class="h-full w-full rounded-full object-cover"
                    >
                  </div>
                </div>
                <div v-else class="avatar avatar-placeholder">
                  <div
                    class="h-8 w-8 rounded-full text-xs font-medium"
                    :class="activeTab === 'official'
                      ? 'bg-primary text-primary-content'
                      : 'bg-secondary text-secondary-content'"
                  >
                    {{ getInitials(post.publisher?.nick || 'Unknown') }}
                  </div>
                </div>
                <div class="min-w-0 flex-1">
                  <span class="block truncate text-sm font-semibold">
                    {{ post.publisher?.nick || 'Unknown' }}
                  </span>
                </div>
                <span class="flex shrink-0 items-center gap-1 text-xs text-base-content/40">
                  <Calendar class="h-3.5 w-3.5" />
                  {{ formatDate(post.published_at) }}
                </span>
              </div>

              <h2
                v-if="getDisplayTitle(post)"
                class="line-clamp-2 text-lg font-bold leading-snug transition-colors group-hover:text-primary"
              >
                {{ getDisplayTitle(post) }}
              </h2>

              <p class="line-clamp-3 flex-1 text-sm text-base-content/60">
                {{ truncateContent(post.content, 200) }}
              </p>

              <div v-if="post.tags.length > 0" class="flex flex-wrap gap-1.5">
                <span
                  v-for="tag in post.tags.slice(0, 4)"
                  :key="tag.id"
                  class="badge badge-ghost badge-sm gap-0.5"
                >
                  <Hash class="h-2.5 w-2.5" />
                  {{ getTagName(tag) }}
                </span>
                <span
                  v-if="post.tags.length > 4"
                  class="badge badge-ghost badge-sm opacity-50"
                >
                  +{{ post.tags.length - 4 }}
                </span>
              </div>

              <div class="mt-auto flex items-center gap-4 text-xs text-base-content/40">
                <span
                  v-if="post.attachments.length > 0"
                  class="flex items-center gap-1"
                >
                  <Paperclip class="h-3.5 w-3.5" />
                  {{ t('home.updates.attachments', { count: post.attachments.length }) }}
                </span>
                <span class="flex items-center gap-1">
                  <Eye class="h-3.5 w-3.5" />
                  {{ post.views_unique }}
                </span>
                <span
                  v-if="Object.keys(post.reactions_count).length > 0"
                  class="flex items-center gap-1"
                >
                  <Heart class="h-3.5 w-3.5" />
                  {{ Object.values(post.reactions_count).reduce((a, b) => a + b, 0) }}
                </span>
                <span
                  v-if="post.replies_count > 0"
                  class="flex items-center gap-1"
                >
                  <MessageCircle class="h-3.5 w-3.5" />
                  {{ post.replies_count }}
                </span>
                <span class="ml-auto flex items-center gap-1 text-base-content/50 transition-colors group-hover:text-primary">
                  <ArrowRight class="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          </NuxtLink>
        </div>

        <div
          v-if="hasMore && !selectedTag"
          class="mt-10 text-center"
        >
          <button
            type="button"
            class="btn btn-ghost gap-2 border border-base-300"
            :disabled="isLoading"
            @click="loadMore"
          >
            <Loader2
              v-if="isLoading"
              class="h-4 w-4 animate-spin"
            />
            <span>{{ isLoading ? t('updates.loading') : t('updates.loadMore') }}</span>
          </button>
        </div>
      </div>
    </section>
  </div>
</template>
