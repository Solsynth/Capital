<script setup lang="ts">
interface Props {
  lang?: string
}

const props = withDefaults(defineProps<Props>(), { lang: 'en' })

const { t } = useI18n()
const localePath = useLocalePath()
const { getPosts, formatDate, truncateContent } = useApi()

const { data: posts } = await useAsyncData('updates-home', () => getPosts(5, 0))

function getDisplayTitle(post: { title: string, content: string }): string {
  if (post.title && post.title.trim())
    return post.title
  const firstLine = post.content?.split('\n')[0]?.trim() || ''
  return firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine || 'View Post'
}
</script>

<template>
  <section v-if="posts && posts.length > 0" class="py-16 px-4">
    <div class="container mx-auto">
      <div class="text-center mb-12">
        <h2 class="text-3xl md:text-4xl font-bold mb-4">
          {{ t('home.updates.title') }}
        </h2>
        <p class="text-lg md:text-xl opacity-70 max-w-2xl mx-auto">
          {{ t('home.updates.subtitle') }}
        </p>
      </div>

      <div class="max-w-3xl mx-auto space-y-4">
        <NuxtLink
          v-for="(post, i) in posts.slice(0, 5)"
          :key="post.id"
          :to="localePath(`/updates/${post.id}`)"
          class="card bg-base-200 p-6 hover:shadow-lg transition-shadow duration-300 block animate-fade-in-up"
          :style="{ animationDelay: `${i * 100}ms` }"
        >
          <div class="flex flex-col sm:flex-row sm:items-center gap-3">
            <div class="flex-1">
              <div class="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                <h3 class="font-bold">
                  {{ getDisplayTitle(post) }}
                </h3>
                <span class="text-sm opacity-50">{{ formatDate(post.published_at) }}</span>
              </div>
              <p class="text-sm opacity-70">
                {{ truncateContent(post.content, 120) }}
              </p>
              <div v-if="post.attachments.length > 0" class="mt-2 flex gap-2">
                <span class="badge badge-sm badge-ghost">
                  {{ post.attachments.length }} attachment{{ post.attachments.length > 1 ? 's' : '' }}
                </span>
              </div>
            </div>
          </div>
        </NuxtLink>
      </div>

      <div class="text-center mt-8">
        <NuxtLink :to="localePath('/updates')" class="btn btn-outline btn-sm">
          {{ t('home.updates.viewAll') }}
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out forwards;
  opacity: 0;
  transform: translateY(20px);
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
