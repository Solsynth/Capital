<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()

const lang = computed(() => locale.value)

definePageMeta({
  title: 'Updates',
  description: '',
})

useSeoMeta({
  description: () => t('seo.updates.description'),
})

defineOgImageComponent('OgImage', {
  title: t('updates.title'),
  description: t('seo.updates.description'),
})
const isZh = computed(() => lang.value === 'zh')

const { getPosts, formatDate, truncateContent } = useApi()

const { data: posts } = await useAsyncData('updates', () => getPosts(20, 0))

function getDisplayTitle(post: { title: string; content: string }): string {
  if (post.title && post.title.trim()) return post.title
  const firstLine = post.content?.split('\n')[0]?.trim() || ''
  return firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine || 'View Post'
}
</script>

<template>
  <div class="container mx-auto px-4 py-16 max-w-4xl">
    <div class="text-center mb-12">
      <h1 class="text-4xl md:text-5xl font-bold mb-4">{{ t('updates.title') }}</h1>
      <p class="text-xl opacity-70 max-w-2xl mx-auto">
        {{ t('updates.subtitle') }}
      </p>
    </div>

    <div v-if="!posts || posts.length === 0" class="text-center py-16">
      <p class="text-lg opacity-70">{{ t('updates.noUpdates') }}</p>
      <NuxtLink :to="localePath('/')" class="btn btn-primary mt-4">
        {{ isZh ? '返回首页' : 'Back to Home' }}
      </NuxtLink>
    </div>
    <div v-else class="space-y-4">
      <NuxtLink
        v-for="post in posts"
        :key="post.id"
        :to="localePath(`/updates/${post.id}`)"
        class="card bg-base-200 p-6 hover:shadow-lg transition-all duration-300 block group"
      >
        <div class="flex flex-col lg:flex-row lg:items-start gap-4">
          <div class="flex-1">
            <div class="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
              <h2 class="text-xl font-bold group-hover:text-primary transition-colors">
                {{ getDisplayTitle(post) }}
              </h2>
              <span class="text-sm opacity-50">{{ formatDate(post.published_at) }}</span>
            </div>
            <p class="text-sm opacity-70">{{ truncateContent(post.content, 200) }}</p>
            <div class="flex items-center gap-4 mt-3 text-sm opacity-50">
              <span>{{ post.views_unique }} {{ t('updates.views') }}</span>
              <span v-if="Object.keys(post.reactions_count).length > 0">
                {{ Object.values(post.reactions_count).reduce((a, b) => a + b, 0) }} {{ t('updates.reactions') }}
              </span>
              <span v-if="post.replies_count > 0">
                {{ post.replies_count }} {{ t('updates.replies') }}
              </span>
            </div>
          </div>
          <div v-if="post.attachments.length > 0" class="shrink-0 flex gap-2 overflow-x-auto pb-2 lg:pb-0">
            <div
              v-for="attachment in post.attachments.slice(0, 3)"
              :key="attachment.id"
              class="w-16 h-16 rounded-lg overflow-hidden bg-base-300 shrink-0"
            >
              <img
                :src="`https://api.solian.app/drive/files/${attachment.id}`"
                :alt="attachment.name"
                class="w-full h-full object-cover"
              >
            </div>
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
