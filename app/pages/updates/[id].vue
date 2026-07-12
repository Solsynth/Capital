<script setup lang="ts">
import {
  ArrowLeft,
  Eye,
  MessageCircle,
  Heart,
  ArrowRight,
  Calendar,
  Paperclip,
} from '@lucide/vue'
import { renderMarkdown } from '~/utils/marked'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

const lang = computed(() => locale.value)
const id = computed(() => route.params.id as string)
const isZh = computed(() => lang.value === 'zh')

const { getPostById, formatDate, getAttachmentUrl } = useApi()

if (!id.value) {
  navigateTo(localePath('/updates'))
}

const { data: post } = await useAsyncData(`update-${id.value}`, () => getPostById(id.value))

if (!post.value) {
  navigateTo(localePath('/updates'))
}

function getDisplayTitle(item: { title: string, content: string }): string | null {
  if (item.title?.trim())
    return item.title
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

const displayTitle = computed(() => post.value ? getDisplayTitle(post.value) : null)
const contentHtml = computed(() => post.value?.content ? renderMarkdown(post.value.content) : '')

definePageMeta({
  title: '',
  description: '',
})

useSeoMeta({
  title: () => displayTitle.value ? `${displayTitle.value}` : `${t('seo.updates.title')}`,
  description: () => post.value?.content
    ? post.value.content.substring(0, 160).replace(/[#*\n]/g, ' ').trim()
    : t('seo.updates.description'),
  ogTitle: () => displayTitle.value ? `${displayTitle.value}` : `${t('seo.updates.title')}`,
  ogImage: () => post.value?.attachments?.[0]?.mime_type?.startsWith('image/')
    ? `https://api.solian.app/drive/files/${post.value.attachments[0].id}`
    : undefined,
  twitterCard: 'summary_large_image',
  twitterTitle: () => displayTitle.value ? `${displayTitle.value}` : `${t('seo.updates.title')}`,
  twitterImage: () => post.value?.attachments?.[0]?.mime_type?.startsWith('image/')
    ? `https://api.solian.app/drive/files/${post.value.attachments[0].id}`
    : undefined,
})

defineOgImage('UniOgImage', {
  title: displayTitle.value || t('updates.title'),
  description: t('seo.updates.description'),
})
</script>

<template>
  <div v-if="post">
    <section class="border-b border-base-200 px-4 py-12 md:py-16">
      <div class="container mx-auto max-w-3xl">
        <NuxtLink
          :to="localePath('/updates')"
          class="btn btn-ghost btn-sm mb-8 -ml-2 gap-1.5 text-base-content/60"
        >
          <ArrowLeft class="h-4 w-4" />
          {{ t('updates.backToUpdates') }}
        </NuxtLink>

        <h1
          v-if="displayTitle"
          class="mb-6 text-3xl font-extrabold leading-tight tracking-tight md:text-4xl lg:text-5xl"
        >
          {{ displayTitle }}
        </h1>

        <div class="flex items-center gap-3">
          <div v-if="post.publisher?.picture" class="avatar">
            <div class="h-10 w-10 rounded-full">
              <img
                :src="getAttachmentUrl(post.publisher.picture.id)"
                :alt="post.publisher.nick"
                class="h-full w-full rounded-full object-cover"
              >
            </div>
          </div>
          <div v-else class="avatar avatar-placeholder">
            <div class="h-10 w-10 rounded-full bg-primary text-primary-content">
              <span class="text-sm font-medium">
                {{ getInitials(post.publisher?.nick || 'Unknown') }}
              </span>
            </div>
          </div>
          <div>
            <span class="block font-semibold">
              {{ post.publisher?.nick || 'Unknown' }}
            </span>
            <span class="flex items-center gap-1 text-sm text-base-content/50">
              <Calendar class="h-3.5 w-3.5" />
              {{ formatDate(post.published_at) }}
              <span
                v-if="post.edited_at"
                class="ml-1 italic"
              >
                ({{ isZh ? '已编辑' : 'edited' }})
              </span>
            </span>
          </div>
        </div>
      </div>
    </section>

    <section class="px-4 py-10">
      <article class="container mx-auto max-w-3xl">
        <div v-if="post.attachments.length > 0" class="mb-8">
          <div v-if="post.attachments.length === 1">
            <div
              v-if="isImageAttachment(post.attachments[0])"
              class="overflow-hidden rounded-lg border border-base-200"
            >
              <img
                :src="getAttachmentUrl(post.attachments[0].id)"
                :alt="post.attachments[0].name"
                class="max-h-[500px] w-full bg-base-200 object-contain"
              >
            </div>
            <div
              v-else-if="isVideoAttachment(post.attachments[0])"
              class="overflow-hidden rounded-lg border border-base-200"
            >
              <video
                :src="getAttachmentUrl(post.attachments[0].id)"
                class="max-h-[500px] w-full"
                controls
                preload="metadata"
              />
            </div>
            <div
              v-else-if="isAudioAttachment(post.attachments[0])"
              class="rounded-lg border border-base-200 bg-base-200/40 p-4"
            >
              <audio
                :src="getAttachmentUrl(post.attachments[0].id)"
                class="w-full"
                controls
                preload="metadata"
              />
            </div>
            <div
              v-else
              class="rounded-lg border border-base-200 bg-base-200/40 p-4"
            >
              <div class="flex items-center gap-3">
                <Paperclip class="h-5 w-5 text-base-content/50" />
                <span class="text-sm">{{ post.attachments[0].name }}</span>
              </div>
            </div>
          </div>

          <div v-else class="grid grid-cols-2 gap-3 md:grid-cols-3">
            <div
              v-for="attachment in post.attachments"
              :key="attachment.id"
              class="overflow-hidden rounded-lg border border-base-200 bg-base-200"
            >
              <img
                v-if="isImageAttachment(attachment)"
                :src="getAttachmentUrl(attachment.id)"
                :alt="attachment.name"
                class="aspect-video w-full object-cover"
              >
              <video
                v-else-if="isVideoAttachment(attachment)"
                :src="getAttachmentUrl(attachment.id)"
                class="aspect-video w-full object-cover"
                controls
                preload="metadata"
              />
              <div
                v-else-if="isAudioAttachment(attachment)"
                class="p-3"
              >
                <audio
                  :src="getAttachmentUrl(attachment.id)"
                  class="w-full"
                  controls
                  preload="metadata"
                />
              </div>
              <div
                v-else
                class="flex items-center gap-2 p-3"
              >
                <Paperclip class="h-4 w-4 text-base-content/50" />
                <span class="truncate text-xs">{{ attachment.name }}</span>
              </div>
            </div>
          </div>
        </div>

        <div
          class="prose prose-base mb-10 max-w-none md:prose-lg prose-headings:tracking-tight prose-a:text-primary"
          v-html="contentHtml"
        />

        <footer class="border-t border-base-200 pt-6">
          <div class="flex flex-wrap items-center gap-5 text-sm text-base-content/50">
            <div class="flex items-center gap-2">
              <Eye class="h-4 w-4" />
              <span>{{ post.views_unique }} {{ t('updates.uniqueViews') }}</span>
            </div>
            <div class="flex items-center gap-2">
              <MessageCircle class="h-4 w-4" />
              <span>{{ post.replies_count }} {{ t('updates.replies') }}</span>
            </div>
            <div
              v-if="Object.keys(post.reactions_count).length > 0"
              class="flex items-center gap-2"
            >
              <Heart class="h-4 w-4" />
              <span>{{ Object.values(post.reactions_count).reduce((a, b) => a + b, 0) }}</span>
            </div>
            <div
              v-if="post.attachments.length > 0"
              class="flex items-center gap-2"
            >
              <Paperclip class="h-4 w-4" />
              <span>{{ t('home.updates.attachments', { count: post.attachments.length }) }}</span>
            </div>
          </div>
        </footer>

        <div class="mt-8">
          <a
            :href="`https://solian.app/posts/${post.id}`"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-ghost btn-sm gap-2 border border-base-300"
          >
            {{ t('updates.discussion') }}
            <ArrowRight class="h-4 w-4" />
          </a>
        </div>
      </article>
    </section>
  </div>
</template>
