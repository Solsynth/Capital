<script setup lang="ts">
import { ChevronLeft, ChevronRight, Calendar, Paperclip, ArrowRight, Hash } from 'lucide-vue-next'

const { t } = useI18n()
const localePath = useLocalePath()
const { getPosts, getRealmPosts, formatDate, truncateContent, getAttachmentUrl } = useApi()

const { data: officialPosts } = await useAsyncData('updates-home-official', () => getPosts(8, 0))
const { data: communityPosts } = await useAsyncData('updates-home-community', () => getRealmPosts('solsynth', 8, 0))

const officialCarouselRef = ref<HTMLElement | null>(null)
const communityCarouselRef = ref<HTMLElement | null>(null)

const officialScroll = reactive({ left: false, right: true })
const communityScroll = reactive({ left: false, right: true })

function getDisplayTitle(post: { title: string, content: string }): string {
  if (post.title && post.title.trim())
    return post.title
  const firstLine = post.content?.split('\n')[0]?.trim() || ''
  return firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine || 'View Post'
}

function getInitials(name: string): string {
  if (!name || name === 'Unknown') return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function getTagName(tag: { slug: string, name: string | null }): string {
  return tag.name || tag.slug
}

function updateScrollButtons(el: HTMLElement | null, state: { left: boolean, right: boolean }) {
  if (!el) return
  state.left = el.scrollLeft > 10
  state.right = el.scrollLeft < el.scrollWidth - el.clientWidth - 10
}

function scrollCarousel(el: HTMLElement | null, direction: 'left' | 'right') {
  if (!el) return
  el.scrollBy({ left: direction === 'left' ? -340 : 340, behavior: 'smooth' })
}

onMounted(() => {
  if (officialCarouselRef.value) {
    officialCarouselRef.value.addEventListener('scroll', () => updateScrollButtons(officialCarouselRef.value, officialScroll), { passive: true })
    updateScrollButtons(officialCarouselRef.value, officialScroll)
  }
  if (communityCarouselRef.value) {
    communityCarouselRef.value.addEventListener('scroll', () => updateScrollButtons(communityCarouselRef.value, communityScroll), { passive: true })
    updateScrollButtons(communityCarouselRef.value, communityScroll)
  }
})
</script>

<template>
  <section class="py-16 px-4">
    <div class="container mx-auto space-y-14">
      <!-- Official Announcements -->
      <div v-if="officialPosts && officialPosts.length > 0">
        <div class="flex items-end justify-between mb-8">
          <div>
            <h2 class="text-2xl md:text-3xl font-bold mb-2">
              {{ t('home.updates.officialTitle') }}
            </h2>
            <p class="text-base opacity-60">
              {{ t('home.updates.officialSubtitle') }}
            </p>
          </div>
          <div class="hidden sm:flex items-center gap-2">
            <button
              class="btn btn-circle btn-sm btn-ghost"
              :class="{ 'opacity-30 cursor-default': !officialScroll.left }"
              :disabled="!officialScroll.left"
              @click="scrollCarousel(officialCarouselRef, 'left')"
            >
              <ChevronLeft class="w-4 h-4" />
            </button>
            <button
              class="btn btn-circle btn-sm btn-ghost"
              :class="{ 'opacity-30 cursor-default': !officialScroll.right }"
              :disabled="!officialScroll.right"
              @click="scrollCarousel(officialCarouselRef, 'right')"
            >
              <ChevronRight class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div
          ref="officialCarouselRef"
          class="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 -mx-4 px-4 scrollbar-hide"
        >
          <NuxtLink
            v-for="post in officialPosts"
            :key="post.id"
            :to="localePath(`/updates/${post.id}`)"
            class="card bg-base-100 border border-base-200/60 shadow-sm hover:shadow-md transition-all duration-200 snap-start shrink-0 w-[320px] group"
          >
            <figure v-if="post.attachments.length > 0" class="overflow-hidden rounded-t-xl max-h-48">
              <img
                :src="getAttachmentUrl(post.attachments[0].id)"
                :alt="post.attachments[0].name"
                class="w-full object-cover group-hover:scale-105 transition-transform duration-300"
              >
            </figure>
            <div class="card-body p-4 gap-2">
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
                  <div class="h-6 w-6 rounded-full bg-primary text-primary-content">
                    <span class="text-[10px] font-medium">
                      {{ getInitials(post.publisher?.nick || 'Unknown') }}
                    </span>
                  </div>
                </div>
                <span class="text-xs font-medium truncate">
                  {{ post.publisher?.nick || 'Unknown' }}
                </span>
                <span class="text-xs text-base-content/40 flex items-center gap-1 ml-auto">
                  <Calendar class="w-3 h-3" />
                  {{ formatDate(post.published_at) }}
                </span>
              </div>

              <h3 class="font-bold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                {{ getDisplayTitle(post) }}
              </h3>

              <p class="text-xs text-base-content/60 line-clamp-2">
                {{ truncateContent(post.content, 100) }}
              </p>

              <div v-if="post.tags.length > 0" class="flex flex-wrap gap-1.5 mt-1">
                <span
                  v-for="tag in post.tags.slice(0, 3)"
                  :key="tag.id"
                  class="badge badge-ghost badge-xs gap-0.5"
                >
                  <Hash class="w-2.5 h-2.5" />
                  {{ getTagName(tag) }}
                </span>
                <span v-if="post.tags.length > 3" class="badge badge-ghost badge-xs opacity-50">
                  +{{ post.tags.length - 3 }}
                </span>
              </div>

              <div v-if="post.attachments.length > 1" class="flex items-center gap-1 text-xs text-base-content/40 mt-auto">
                <Paperclip class="w-3 h-3" />
                <span>{{ post.attachments.length }} attachments</span>
              </div>
            </div>
          </NuxtLink>

          <NuxtLink
            :to="localePath('/updates')"
            class="card bg-base-200/40 border border-base-200/60 border-dashed hover:bg-base-200/60 transition-all duration-200 snap-start shrink-0 w-[320px] flex items-center justify-center min-h-[200px]"
          >
            <div class="flex flex-col items-center gap-2 text-base-content/50">
              <ArrowRight class="w-6 h-6" />
              <span class="text-sm font-medium">{{ t('home.updates.viewAll') }}</span>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- Community & Developers Updates -->
      <div v-if="communityPosts && communityPosts.length > 0">
        <div class="flex items-end justify-between mb-8">
          <div>
            <h2 class="text-2xl md:text-3xl font-bold mb-2">
              {{ t('home.updates.communityTitle') }}
            </h2>
            <p class="text-base opacity-60">
              {{ t('home.updates.communitySubtitle') }}
            </p>
          </div>
          <div class="hidden sm:flex items-center gap-2">
            <button
              class="btn btn-circle btn-sm btn-ghost"
              :class="{ 'opacity-30 cursor-default': !communityScroll.left }"
              :disabled="!communityScroll.left"
              @click="scrollCarousel(communityCarouselRef, 'left')"
            >
              <ChevronLeft class="w-4 h-4" />
            </button>
            <button
              class="btn btn-circle btn-sm btn-ghost"
              :class="{ 'opacity-30 cursor-default': !communityScroll.right }"
              :disabled="!communityScroll.right"
              @click="scrollCarousel(communityCarouselRef, 'right')"
            >
              <ChevronRight class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div
          ref="communityCarouselRef"
          class="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 -mx-4 px-4 scrollbar-hide"
        >
          <NuxtLink
            v-for="post in communityPosts"
            :key="post.id"
            :to="localePath(`/updates/${post.id}`)"
            class="card bg-base-100 border border-base-200/60 shadow-sm hover:shadow-md transition-all duration-200 snap-start shrink-0 w-[320px] group"
          >
            <figure v-if="post.attachments.length > 0" class="overflow-hidden rounded-t-xl max-h-48">
              <img
                :src="getAttachmentUrl(post.attachments[0].id)"
                :alt="post.attachments[0].name"
                class="w-full object-cover group-hover:scale-105 transition-transform duration-300"
              >
            </figure>
            <div class="card-body p-4 gap-2">
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
                  <div class="h-6 w-6 rounded-full bg-secondary text-secondary-content">
                    <span class="text-[10px] font-medium">
                      {{ getInitials(post.publisher?.nick || 'Unknown') }}
                    </span>
                  </div>
                </div>
                <span class="text-xs font-medium truncate">
                  {{ post.publisher?.nick || 'Unknown' }}
                </span>
                <span class="text-xs text-base-content/40 flex items-center gap-1 ml-auto">
                  <Calendar class="w-3 h-3" />
                  {{ formatDate(post.published_at) }}
                </span>
              </div>

              <h3 class="font-bold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                {{ getDisplayTitle(post) }}
              </h3>

              <p class="text-xs text-base-content/60 line-clamp-2">
                {{ truncateContent(post.content, 100) }}
              </p>

              <div v-if="post.tags.length > 0" class="flex flex-wrap gap-1.5 mt-1">
                <span
                  v-for="tag in post.tags.slice(0, 3)"
                  :key="tag.id"
                  class="badge badge-ghost badge-xs gap-0.5"
                >
                  <Hash class="w-2.5 h-2.5" />
                  {{ getTagName(tag) }}
                </span>
                <span v-if="post.tags.length > 3" class="badge badge-ghost badge-xs opacity-50">
                  +{{ post.tags.length - 3 }}
                </span>
              </div>

              <div v-if="post.attachments.length > 1" class="flex items-center gap-1 text-xs text-base-content/40 mt-auto">
                <Paperclip class="w-3 h-3" />
                <span>{{ post.attachments.length }} attachments</span>
              </div>
            </div>
          </NuxtLink>

          <NuxtLink
            :to="localePath('/updates')"
            class="card bg-base-200/40 border border-base-200/60 border-dashed hover:bg-base-200/60 transition-all duration-200 snap-start shrink-0 w-[320px] flex items-center justify-center min-h-[200px]"
          >
            <div class="flex flex-col items-center gap-2 text-base-content/50">
              <ArrowRight class="w-6 h-6" />
              <span class="text-sm font-medium">{{ t('home.updates.viewAll') }}</span>
            </div>
          </NuxtLink>
        </div>
      </div>
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
