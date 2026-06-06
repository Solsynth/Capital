<script setup lang="ts">
import { ArrowLeft, Eye, MessageCircle, Heart, ArrowRight, Calendar, Paperclip } from 'lucide-vue-next'
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

function getDisplayTitle(post: { title: string, content: string }): string {
  if (post.title && post.title.trim()) return post.title
  const firstLine = post.content?.split('\n')[0]?.trim() || ''
  return firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine || 'View Post'
}

function getInitials(name: string): string {
  if (!name || name === 'Unknown') return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const displayTitle = computed(() => post.value ? getDisplayTitle(post.value) : '')
const contentHtml = computed(() => post.value?.content ? renderMarkdown(post.value.content) : '')

definePageMeta({
  title: '',
  description: '',
})

useSeoMeta({
  title: () => displayTitle.value ? `${displayTitle.value} - Solsynth` : 'Update - Solsynth',
  description: () => post.value?.content
    ? post.value.content.substring(0, 160).replace(/[#*\n]/g, ' ').trim()
    : t('seo.updates.description'),
  ogTitle: () => displayTitle.value ? `${displayTitle.value} - Solsynth` : 'Update - Solsynth',
  ogImage: () => post.value?.attachments?.[0]?.id
    ? `https://api.solian.app/drive/files/${post.value.attachments[0].id}`
    : undefined,
  twitterCard: 'summary_large_image',
  twitterTitle: () => displayTitle.value ? `${displayTitle.value} - Solsynth` : 'Update - Solsynth',
  twitterImage: () => post.value?.attachments?.[0]?.id
    ? `https://api.solian.app/drive/files/${post.value.attachments[0].id}`
    : undefined,
})
</script>

<template>
  <div v-if="post" class="container mx-auto px-4 py-16 max-w-4xl">
    <div class="mb-8">
      <NuxtLink :to="localePath('/updates')" class="btn btn-ghost btn-sm gap-1 -ml-2">
        <ArrowLeft class="w-4 h-4" />
        {{ t('updates.backToUpdates') }}
      </NuxtLink>
    </div>

    <article>
      <header class="mb-8">
        <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">{{ displayTitle }}</h1>
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
            <span class="font-semibold block">
              {{ post.publisher?.nick || 'Unknown' }}
            </span>
            <span class="text-sm text-base-content/50 flex items-center gap-1">
              <Calendar class="w-3.5 h-3.5" />
              {{ formatDate(post.published_at) }}
              <span v-if="post.edited_at" class="italic ml-1">
                ({{ isZh ? '已编辑' : 'edited' }})
              </span>
            </span>
          </div>
        </div>
      </header>

      <div v-if="post.attachments.length > 0" class="mb-8">
        <div v-if="post.attachments.length === 1" class="rounded-xl overflow-hidden border border-base-200/60">
          <img
            :src="getAttachmentUrl(post.attachments[0].id)"
            :alt="post.attachments[0].name"
            class="w-full max-h-[500px] object-contain bg-base-200"
          >
        </div>
        <div v-else class="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div
            v-for="attachment in post.attachments"
            :key="attachment.id"
            class="rounded-xl overflow-hidden bg-base-200 border border-base-200/60"
          >
            <img
              :src="getAttachmentUrl(attachment.id)"
              :alt="attachment.name"
              class="w-full aspect-video object-cover"
            >
          </div>
        </div>
      </div>

      <div class="prose prose-lg max-w-none mb-12" v-html="contentHtml" />

      <footer class="border-t border-base-200 pt-6">
        <div class="flex flex-wrap items-center gap-6 text-sm text-base-content/50">
          <div class="flex items-center gap-2">
            <Eye class="w-4 h-4" />
            <span>{{ post.views_unique }} {{ t('updates.uniqueViews') }}</span>
          </div>
          <div class="flex items-center gap-2">
            <MessageCircle class="w-4 h-4" />
            <span>{{ post.replies_count }} {{ t('updates.replies') }}</span>
          </div>
          <div v-if="Object.keys(post.reactions_count).length > 0" class="flex items-center gap-2">
            <Heart class="w-4 h-4" />
            <span>{{ Object.values(post.reactions_count).reduce((a, b) => a + b, 0) }}</span>
          </div>
          <div v-if="post.attachments.length > 0" class="flex items-center gap-2">
            <Paperclip class="w-4 h-4" />
            <span>{{ post.attachments.length }} attachment{{ post.attachments.length > 1 ? 's' : '' }}</span>
          </div>
        </div>
      </footer>
    </article>

    <div class="mt-8">
      <a
        :href="`https://solian.app/posts/${post.id}`"
        target="_blank"
        class="btn btn-outline btn-sm gap-2"
      >
        {{ t('updates.discussion') }}
        <ArrowRight class="w-4 h-4" />
      </a>
    </div>
  </div>
</template>
