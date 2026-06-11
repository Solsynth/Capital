<script setup lang="ts">
import { Calendar, Paperclip, Eye, MessageCircle, Heart, ArrowRight, Hash, X, Loader2 } from '@lucide/vue'

const { t } = useI18n()
const localePath = useLocalePath()

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

// Schema.org Structured Data for Updates Page
useSchemaOrg([
  defineCollectionPage({
    name: () => t('seo.updates.title'),
    description: () => t('seo.updates.description'),
    url: () => `https://solsynth.dev${useRoute().path}`,
  }),
  defineBreadcrumb({
    itemListElement: [
      {
        name: t('seo.home.title'),
        item: 'https://solsynth.dev',
      },
      {
        name: t('seo.updates.title'),
        item: () => `https://solsynth.dev${useRoute().path}`,
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
  if (officialLoading.value) return
  if (!reset && !officialHasMore.value) return

  officialLoading.value = true
  const skip = reset ? 0 : officialPosts.value.length
  const newPosts = await getPosts(PAGE_SIZE, skip)

  if (reset) {
    officialPosts.value = newPosts
    officialPage.value = 1
  } else {
    officialPosts.value = [...officialPosts.value, ...newPosts]
    officialPage.value++
  }

  officialHasMore.value = newPosts.length === PAGE_SIZE
  officialLoading.value = false
}

async function loadCommunityPosts(reset = false) {
  if (communityLoading.value) return
  if (!reset && !communityHasMore.value) return

  communityLoading.value = true
  const skip = reset ? 0 : communityPosts.value.length
  const newPosts = await getRealmPosts('solsynth', PAGE_SIZE, skip)

  if (reset) {
    communityPosts.value = newPosts
    communityPage.value = 1
  } else {
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
  if (!currentPosts.value) return []
  const tagMap = new Map<string, { slug: string, name: string | null }>()
  for (const post of currentPosts.value) {
    for (const tag of post.tags) {
      if (!tagMap.has(tag.slug)) {
        tagMap.set(tag.slug, { slug: tag.slug, name: tag.name })
      }
    }
  }
  return Array.from(tagMap.values())
})

const filteredPosts = computed(() => {
  if (!currentPosts.value) return []
  if (!selectedTag.value) return currentPosts.value
  return currentPosts.value.filter(post =>
    post.tags.some(tag => tag.slug === selectedTag.value)
  )
})

function getDisplayTitle(post: { title: string, content: string }): string | null {
  if (post.title && post.title.trim()) return post.title
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
  if (!name || name === 'Unknown') return '?'
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
  if (activeTab.value === 'official') {
    loadOfficialPosts()
  } else {
    loadCommunityPosts()
  }
}

function switchTab(tab: 'official' | 'community') {
  activeTab.value = tab
  selectedTag.value = null
}
</script>

<template>
  <div class="container mx-auto px-4 py-16 max-w-5xl">
    <div class="text-center mb-10">
      <h1 class="text-4xl md:text-5xl font-bold mb-4">{{ t('updates.title') }}</h1>
      <p class="text-xl opacity-70 max-w-2xl mx-auto">
        {{ t('updates.subtitle') }}
      </p>
    </div>

    <div class="flex justify-center mb-8">
      <div class="tabs tabs-boxed bg-base-200/60 p-1 rounded-xl">
        <button
          class="tab tab-lg rounded-lg font-medium transition-colors"
          :class="{ 'bg-base-100 shadow-sm': activeTab === 'official' }"
          @click="switchTab('official')"
        >
          {{ t('updates.tabs.official') }}
        </button>
        <button
          class="tab tab-lg rounded-lg font-medium transition-colors"
          :class="{ 'bg-base-100 shadow-sm': activeTab === 'community' }"
          @click="switchTab('community')"
        >
          {{ t('updates.tabs.community') }}
        </button>
      </div>
    </div>

    <div v-if="allTags.length > 0" class="flex flex-wrap items-center justify-center gap-2 mb-8">
      <button
        v-for="tag in allTags"
        :key="tag.slug"
        class="badge badge-lg gap-1 cursor-pointer transition-colors"
        :class="selectedTag === tag.slug ? 'badge-primary' : 'badge-ghost hover:badge-primary/30'"
        @click="selectTag(tag.slug)"
      >
        <Hash class="w-3 h-3" />
        {{ getTagName(tag) }}
      </button>
      <button
        v-if="selectedTag"
        class="badge badge-lg badge-error gap-1 cursor-pointer"
        @click="clearTag"
      >
        <X class="w-3 h-3" />
        {{ t('updates.clearFilter') }}
      </button>
    </div>

    <div v-if="!filteredPosts || filteredPosts.length === 0" class="text-center py-16">
      <p class="text-lg opacity-70">{{ t('updates.noUpdates') }}</p>
      <button v-if="selectedTag" class="btn btn-ghost mt-4" @click="clearTag">
        {{ t('updates.clearFilter') }}
      </button>
      <NuxtLink v-else :to="localePath('/')" class="btn btn-primary mt-4">
        {{ t('about.backToHome') }}
      </NuxtLink>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <NuxtLink
        v-for="post in filteredPosts"
        :key="post.id"
        :to="localePath(`/updates/${post.id}`)"
        class="card bg-base-100 border border-base-200/60 shadow-sm hover:shadow-md transition-all duration-200 group overflow-hidden"
      >
        <div v-if="post.attachments.length > 0 && isImageAttachment(post.attachments[0])" class="aspect-video w-full overflow-hidden">
          <img
            :src="getAttachmentUrl(post.attachments[0].id)"
            :alt="post.attachments[0].name"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          >
        </div>
        <div v-else-if="post.attachments.length > 0 && isVideoAttachment(post.attachments[0])" class="w-full overflow-hidden">
          <video
            :src="getAttachmentUrl(post.attachments[0].id)"
            class="w-full aspect-video object-cover"
            controls
            preload="metadata"
          />
        </div>
        <div v-else-if="post.attachments.length > 0 && isAudioAttachment(post.attachments[0])" class="p-3 bg-base-200/40">
          <audio
            :src="getAttachmentUrl(post.attachments[0].id)"
            class="w-full"
            controls
            preload="metadata"
          />
        </div>
        <div class="card-body p-5 gap-3">
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
                :class="activeTab === 'official' ? 'bg-primary text-primary-content' : 'bg-secondary text-secondary-content'"
              >
                {{ getInitials(post.publisher?.nick || 'Unknown') }}
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <span class="text-sm font-semibold truncate block">
                {{ post.publisher?.nick || 'Unknown' }}
              </span>
            </div>
            <span class="text-xs text-base-content/40 flex items-center gap-1 shrink-0">
              <Calendar class="w-3.5 h-3.5" />
              {{ formatDate(post.published_at) }}
            </span>
          </div>

          <h2 v-if="getDisplayTitle(post)" class="text-lg font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {{ getDisplayTitle(post) }}
          </h2>

          <p class="text-sm text-base-content/60 line-clamp-3">
            {{ truncateContent(post.content, 200) }}
          </p>

          <div v-if="post.tags.length > 0" class="flex flex-wrap gap-1.5">
            <span
              v-for="tag in post.tags.slice(0, 4)"
              :key="tag.id"
              class="badge badge-ghost badge-sm gap-0.5"
            >
              <Hash class="w-2.5 h-2.5" />
              {{ getTagName(tag) }}
            </span>
            <span v-if="post.tags.length > 4" class="badge badge-ghost badge-sm opacity-50">
              +{{ post.tags.length - 4 }}
            </span>
          </div>

          <div class="flex items-center gap-4 mt-1 text-xs text-base-content/40">
            <span v-if="post.attachments.length > 0" class="flex items-center gap-1">
              <Paperclip class="w-3.5 h-3.5" />
              {{ post.attachments.length }} attachment{{ post.attachments.length > 1 ? 's' : '' }}
            </span>
            <span class="flex items-center gap-1">
              <Eye class="w-3.5 h-3.5" />
              {{ post.views_unique }}
            </span>
            <span v-if="Object.keys(post.reactions_count).length > 0" class="flex items-center gap-1">
              <Heart class="w-3.5 h-3.5" />
              {{ Object.values(post.reactions_count).reduce((a, b) => a + b, 0) }}
            </span>
            <span v-if="post.replies_count > 0" class="flex items-center gap-1">
              <MessageCircle class="w-3.5 h-3.5" />
              {{ post.replies_count }}
            </span>
            <span class="ml-auto flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              Read more
              <ArrowRight class="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </NuxtLink>
    </div>

    <div v-if="hasMore && !selectedTag" class="text-center mt-10">
      <button
        class="btn btn-outline btn-wide gap-2"
        :class="{ 'btn-disabled': isLoading }"
        :disabled="isLoading"
        @click="loadMore"
      >
        <Loader2 v-if="isLoading" class="w-4 h-4 animate-spin" />
        <span>{{ isLoading ? t('updates.loading') : t('updates.loadMore') }}</span>
      </button>
    </div>
  </div>
</template>
