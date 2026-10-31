<script setup lang="ts">
import { ArrowLeft, Eye, Paperclip } from '@lucide/vue'
import { renderMarkdown } from '~/utils/marked'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

const lang = computed(() => locale.value)
const id = computed(() => route.params.id as string)
const isZh = computed(() => lang.value === 'zh')

const { getPostById, getAttachmentUrl } = useApi()

if (!id.value) {
  navigateTo(localePath('/updates'))
}

const { data: post } = await useAsyncData(`update-${id.value}`, () => getPostById(id.value))

if (!post.value) {
  navigateTo(localePath('/updates'))
}

// A fixed-width stamp: the byline's date reads like a ledger cell.
const publishedStamp = computed(() => {
  if (!post.value?.published_at) return ''
  const date = new Date(post.value.published_at)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(lang.value === 'zh' ? 'zh-CN' : 'en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
})


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
    <header class="band">
      <div class="shell">
        <NuxtLink :to="localePath('/updates')" class="back">
          <ArrowLeft class="back-icon" aria-hidden="true" />
          {{ t('updates.backToUpdates') }}
        </NuxtLink>

        <h1 v-if="displayTitle" class="title post-title">
          {{ displayTitle }}
        </h1>

        <div class="byline">
          <span v-if="post.publisher?.picture" class="byline-avatar">
            <img
              :src="getAttachmentUrl(post.publisher.picture.id)"
              :alt="''"
              loading="lazy"
              decoding="async"
            >
          </span>
          <span v-else class="byline-avatar byline-initials" aria-hidden="true">
            {{ getInitials(post.publisher?.nick || 'Unknown') }}
          </span>

          <span class="byline-name">{{ post.publisher?.nick || 'Unknown' }}</span>
          <time class="mono byline-date mb-0.75" :datetime="post.published_at">{{ publishedStamp }}</time>
          <template v-if="post.edited_at">
            <span class="byline-sep" aria-hidden="true">/</span>
            <span class="byline-edited">{{ isZh ? '已编辑' : 'edited' }}</span>
          </template>
        </div>
      </div>
    </header>

    <div class="shell body">
      <article class="post">
        <div v-if="post.attachments.length > 0" class="attachments">
          <figure v-if="post.attachments.length === 1" class="attachment-single">
            <img
              v-if="isImageAttachment(post.attachments[0])"
              :src="getAttachmentUrl(post.attachments[0].id)"
              :alt="post.attachments[0].name"
              loading="lazy"
              decoding="async"
            >
            <video
              v-else-if="isVideoAttachment(post.attachments[0])"
              :src="getAttachmentUrl(post.attachments[0].id)"
              controls
              preload="metadata"
            />
            <div v-else-if="isAudioAttachment(post.attachments[0])" class="attachment-audio">
              <audio :src="getAttachmentUrl(post.attachments[0].id)" class="w-full" controls preload="metadata" />
            </div>
            <div v-else class="attachment-file">
              <Paperclip class="file-icon" aria-hidden="true" />
              <span>{{ post.attachments[0].name }}</span>
            </div>
          </figure>

          <div v-else class="attachment-grid">
            <figure v-for="attachment in post.attachments" :key="attachment.id" class="attachment-cell">
              <img
                v-if="isImageAttachment(attachment)"
                :src="getAttachmentUrl(attachment.id)"
                :alt="attachment.name"
                loading="lazy"
                decoding="async"
              >
              <video
                v-else-if="isVideoAttachment(attachment)"
                :src="getAttachmentUrl(attachment.id)"
                controls
                preload="metadata"
              />
              <div v-else-if="isAudioAttachment(attachment)" class="attachment-audio">
                <audio :src="getAttachmentUrl(attachment.id)" class="w-full" controls preload="metadata" />
              </div>
              <div v-else class="attachment-file">
                <Paperclip class="file-icon" aria-hidden="true" />
                <span class="truncate">{{ attachment.name }}</span>
              </div>
            </figure>
          </div>
        </div>

        <div class="prose post-prose" v-html="contentHtml" />

        <UpdateReactions :post-id="post.id" class="post-extras" />

        <div class="post-foot">
          <span class="post-foot-item">
            <Eye class="foot-icon" aria-hidden="true" />
            {{ post.views_unique }} {{ t('updates.uniqueViews') }}
          </span>
          <span v-if="post.attachments.length > 0" class="post-foot-item">
            <Paperclip class="foot-icon" aria-hidden="true" />
            {{ post.attachments.length === 1 ? t('home.updates.attachments_one') : t('home.updates.attachments_other', { count: post.attachments.length }) }}
          </span>
        </div>

        <UpdateReplies :post-id="post.id" class="post-extras" />
      </article>
    </div>
  </div>
</template>

<style scoped>
.band {
  padding-block: 2.5rem 2rem;
  border-bottom: 1px solid var(--color-line-soft);
}

.back {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-bottom: 1.5rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-faint);
  text-decoration: none;
  transition: color 140ms ease;
}

.back:hover,
.back:focus-visible {
  color: var(--color-base-content);
}

.back-icon {
  width: 0.875rem;
  height: 0.875rem;
}

.post-title {
  margin: 0;
  max-width: 40rem;
  font-size: clamp(1.75rem, 3.5vw, 2.5rem);
}

.byline {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.45rem;
  margin-top: 1.25rem;
  font-size: 0.8125rem;
  color: var(--color-faint);
}

.byline-avatar {
  display: flex;
  width: 1.5rem;
  height: 1.5rem;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 999px;
  background: var(--color-base-300);
}

.byline-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.byline-initials {
  font-family: var(--font-mono);
  font-size: 0.5625rem;
  color: var(--color-dim);
}

.byline-name {
  color: var(--color-dim);
  font-weight: 600;
}

.byline-sep {
  color: var(--color-line);
}

.body {
  padding-block: 2.25rem 0;
}

.post {
  max-width: 42rem;
}

.attachments {
  margin-bottom: 2rem;
}

.attachment-single {
  margin: 0;
  overflow: hidden;
  border: 1px solid var(--color-line-soft);
  border-radius: var(--radius-card);
  background: var(--color-base-200);
}

.attachment-single img,
.attachment-single video {
  display: block;
  width: 100%;
  max-height: 32rem;
  object-fit: contain;
}

.attachment-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
}

.attachment-cell {
  margin: 0;
  overflow: hidden;
  border: 1px solid var(--color-line-soft);
  border-radius: var(--radius-chip);
  background: var(--color-base-200);
}

.attachment-cell img,
.attachment-cell video {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 10;
  object-fit: cover;
}

.attachment-audio {
  padding: 0.75rem;
}

.attachment-file {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  font-size: 0.8125rem;
  color: var(--color-dim);
}

.file-icon {
  width: 0.875rem;
  height: 0.875rem;
  flex-shrink: 0;
  color: var(--color-faint);
}

.post-prose {
  max-width: none;
}

.post-extras {
  margin-top: 1.75rem;
}

.post-foot {
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
  margin-top: 1.75rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-line-soft);
}

.post-foot-item {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  color: var(--color-faint);
}

.foot-icon {
  width: 0.8125rem;
  height: 0.8125rem;
}

@media (min-width: 768px) {
  .attachment-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
