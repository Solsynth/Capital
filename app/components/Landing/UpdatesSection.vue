<script setup lang="ts">
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Paperclip,
  ArrowRight,
  Hash,
} from '@lucide/vue'
import type { ComponentPublicInstance } from 'vue'

const { t } = useI18n()
const localePath = useLocalePath()
const { getPosts, getRealmPosts, formatDate, truncateContent, getAttachmentUrl } = useApi()

const { data: officialPosts } = await useAsyncData('updates-home-official', () => getPosts(8, 0))
const { data: communityPosts } = await useAsyncData('updates-home-community', () => getRealmPosts('solsynth', 8, 0))

const officialCarouselRef = ref<HTMLElement | null>(null)
const communityCarouselRef = ref<HTMLElement | null>(null)

const officialScroll = reactive({ left: false, right: true })
const communityScroll = reactive({ left: false, right: true })

const sections = computed(() => [
  {
    key: 'official' as const,
    title: t('home.updates.officialTitle'),
    subtitle: t('home.updates.officialSubtitle'),
    posts: officialPosts.value ?? [],
    avatarClass: 'bg-primary text-primary-content',
    scroll: officialScroll,
  },
  {
    key: 'community' as const,
    title: t('home.updates.communityTitle'),
    subtitle: t('home.updates.communitySubtitle'),
    posts: communityPosts.value ?? [],
    avatarClass: 'bg-secondary text-secondary-content',
    scroll: communityScroll,
  },
])

function getCarouselEl(key: 'official' | 'community'): HTMLElement | null {
  return key === 'official' ? officialCarouselRef.value : communityCarouselRef.value
}

function getScrollState(key: 'official' | 'community') {
  return key === 'official' ? officialScroll : communityScroll
}

function bindOfficialCarousel(el: Element | ComponentPublicInstance | null) {
  const node = el instanceof HTMLElement ? el : null
  officialCarouselRef.value = node
  updateScrollButtons(node, officialScroll)
}

function bindCommunityCarousel(el: Element | ComponentPublicInstance | null) {
  const node = el instanceof HTMLElement ? el : null
  communityCarouselRef.value = node
  updateScrollButtons(node, communityScroll)
}

function carouselRefFor(key: 'official' | 'community') {
  return key === 'official' ? bindOfficialCarousel : bindCommunityCarousel
}

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

function updateScrollButtons(
  el: HTMLElement | null,
  state: { left: boolean, right: boolean },
) {
  if (!el)
    return
  state.left = el.scrollLeft > 10
  state.right = el.scrollLeft < el.scrollWidth - el.clientWidth - 10
}

function onCarouselScroll(key: 'official' | 'community') {
  updateScrollButtons(getCarouselEl(key), getScrollState(key))
}

function scrollCarousel(key: 'official' | 'community', direction: 'left' | 'right') {
  const el = getCarouselEl(key)
  if (!el)
    return
  el.scrollBy({ left: direction === 'left' ? -340 : 340, behavior: 'smooth' })
}
</script>

<template>
  <section class="px-4 py-16">
    <div class="container mx-auto space-y-14">
      <template v-for="section in sections" :key="section.key">
        <div v-if="section.posts.length > 0">
          <div class="mb-6 flex items-end justify-between gap-4">
            <div class="min-w-0">
              <h2 class="mb-1 text-2xl font-bold tracking-tight md:text-3xl">
                {{ section.title }}
              </h2>
              <p class="text-base text-base-content/60">
                {{ section.subtitle }}
              </p>
            </div>
            <div class="hidden shrink-0 items-center gap-1 sm:flex">
              <button
                type="button"
                class="btn btn-square btn-sm btn-ghost"
                :class="{ 'opacity-30': !section.scroll.left }"
                :disabled="!section.scroll.left"
                :aria-label="t('home.updates.scrollLeft')"
                @click="scrollCarousel(section.key, 'left')"
              >
                <ChevronLeft class="h-4 w-4" />
              </button>
              <button
                type="button"
                class="btn btn-square btn-sm btn-ghost"
                :class="{ 'opacity-30': !section.scroll.right }"
                :disabled="!section.scroll.right"
                :aria-label="t('home.updates.scrollRight')"
                @click="scrollCarousel(section.key, 'right')"
              >
                <ChevronRight class="h-4 w-4" />
              </button>
            </div>
          </div>

          <div
            :ref="carouselRefFor(section.key)"
            class="scrollbar-hide -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-2"
            @scroll.passive="onCarouselScroll(section.key)"
          >
            <NuxtLink
              v-for="post in section.posts"
              :key="post.id"
              :to="localePath(`/updates/${post.id}`)"
              class="group card w-[300px] shrink-0 snap-start border border-base-200 bg-base-100 transition-colors duration-150 hover:border-base-300 sm:w-[320px]"
            >
              <figure
                v-if="post.attachments.length > 0 && isImageAttachment(post.attachments[0])"
                class="max-h-44 overflow-hidden rounded-t-box border-b border-base-200"
              >
                <img
                  :src="getAttachmentUrl(post.attachments[0].id)"
                  :alt="post.attachments[0].name"
                  class="h-full w-full object-cover"
                  loading="lazy"
                >
              </figure>
              <div
                v-else-if="post.attachments.length > 0 && isVideoAttachment(post.attachments[0])"
                class="overflow-hidden rounded-t-box border-b border-base-200"
              >
                <video
                  :src="getAttachmentUrl(post.attachments[0].id)"
                  class="max-h-44 w-full object-cover"
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

              <div class="card-body gap-2 p-4">
                <div class="flex items-center gap-2">
                  <div v-if="post.publisher?.picture" class="avatar">
                    <div class="h-6 w-6 rounded-full">
                      <img
                        :src="getAttachmentUrl(post.publisher.picture.id)"
                        :alt="post.publisher.nick"
                        class="h-full w-full rounded-full object-cover"
                      >
                    </div>
                  </div>
                  <div v-else class="avatar avatar-placeholder">
                    <div
                      class="h-6 w-6 rounded-full"
                      :class="section.avatarClass"
                    >
                      <span class="text-[10px] font-medium">
                        {{ getInitials(post.publisher?.nick || 'Unknown') }}
                      </span>
                    </div>
                  </div>
                  <span class="truncate text-xs font-medium">
                    {{ post.publisher?.nick || 'Unknown' }}
                  </span>
                  <span class="ml-auto flex items-center gap-1 text-xs text-base-content/40">
                    <Calendar class="h-3 w-3" />
                    {{ formatDate(post.published_at) }}
                  </span>
                </div>

                <h3
                  v-if="getDisplayTitle(post)"
                  class="line-clamp-2 text-sm font-bold leading-snug transition-colors group-hover:text-primary"
                >
                  {{ getDisplayTitle(post) }}
                </h3>

                <p class="line-clamp-2 text-xs text-base-content/60">
                  {{ truncateContent(post.content, 100) }}
                </p>

                <div
                  v-if="post.tags.length > 0"
                  class="mt-0.5 flex flex-wrap gap-1"
                >
                  <span
                    v-for="tag in post.tags.slice(0, 3)"
                    :key="tag.id"
                    class="badge badge-ghost badge-xs gap-0.5"
                  >
                    <Hash class="h-2.5 w-2.5" />
                    {{ getTagName(tag) }}
                  </span>
                  <span
                    v-if="post.tags.length > 3"
                    class="badge badge-ghost badge-xs opacity-50"
                  >
                    +{{ post.tags.length - 3 }}
                  </span>
                </div>

                <div
                  v-if="post.attachments.length > 1"
                  class="mt-auto flex items-center gap-1 text-xs text-base-content/40"
                >
                  <Paperclip class="h-3 w-3" />
                  <span>{{ t('home.updates.attachments', { count: post.attachments.length }) }}</span>
                </div>
              </div>
            </NuxtLink>

            <NuxtLink
              :to="localePath('/updates')"
              class="flex min-h-[200px] w-[300px] shrink-0 snap-start flex-col items-center justify-center gap-2 rounded-box border border-dashed border-base-300 bg-base-200/30 text-base-content/50 transition-colors duration-150 hover:border-base-content/20 hover:bg-base-200/50 hover:text-base-content/70 sm:w-[320px]"
            >
              <ArrowRight class="h-5 w-5" />
              <span class="text-sm font-medium">{{ t('home.updates.viewAll') }}</span>
            </NuxtLink>
          </div>
        </div>
      </template>
    </div>
  </section>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
