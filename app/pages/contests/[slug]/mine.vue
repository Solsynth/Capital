<script setup lang="ts">
import { ArrowLeft, Edit3, Clock, CheckCircle, XCircle, Plus } from '@lucide/vue'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

const slug = computed(() => route.params?.slug as string)

const { data: content } = await useAsyncData(`contest-mine-${locale.value}-${slug.value}`, async () => {
  const allContests = await queryCollection('contests')
    .where('path', 'LIKE', `/contests/${locale.value}/%`)
    .all()
  return allContests.find(c => c.path === `/contests/${locale.value}/${slug.value}`) || null
})

const { data: submissions, refresh } = await useAsyncData(`my-submissions-${slug.value}`, () => {
  return $fetch('/api/contests/submissions/mine', {
    query: { contest_id: slug.value },
    headers: { 'x-locale': locale.value },
  })
})

if (!content.value) {
  navigateTo(localePath('/contests'))
}

function statusIcon(status: string) {
  if (status === 'pending') return Clock
  if (status === 'accepted') return CheckCircle
  if (status === 'rejected') return XCircle
  return Clock
}

function statusColor(status: string) {
  if (status === 'pending') return 'text-warning'
  if (status === 'accepted') return 'text-success'
  if (status === 'rejected') return 'text-error'
  return 'text-base-content'
}

function statusLabel(status: string) {
  return t(`contests.status.${status}`)
}
</script>

<template>
  <div v-if="content" class="container mx-auto px-4 py-12">
    <div class="max-w-3xl mx-auto">
      <NuxtLink
        :to="localePath(`/contests/${slug}`)"
        class="btn btn-ghost btn-sm mb-6 inline-flex"
      >
        <ArrowLeft class="w-4 h-4 mr-2" />
        {{ t('contests.backToContest') }}
      </NuxtLink>

      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold">{{ content.title }}</h1>
          <p class="opacity-70 mt-1">{{ t('contests.mySubmissions') }}</p>
        </div>
        <NuxtLink
          :to="localePath(`/contests/${slug}/submit`)"
          class="btn btn-primary"
        >
          <Plus class="w-4 h-4 mr-2" />
          {{ t('contests.submitProject') }}
        </NuxtLink>
      </div>

      <!-- Submissions List -->
      <div v-if="submissions?.submissions?.length" class="space-y-4">
        <div
          v-for="sub in submissions.submissions"
          :key="sub.id"
          class="card bg-base-200"
        >
          <div class="card-body">
            <div class="flex items-start justify-between gap-4">
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <component :is="statusIcon(sub.status)" class="w-4 h-4 shrink-0" :class="statusColor(sub.status)" />
                  <span class="font-medium">{{ sub.data?.title }}</span>
                </div>
                <p class="text-sm opacity-70 line-clamp-2">{{ sub.data?.description }}</p>
                <div v-if="sub.data?.tags?.length" class="flex flex-wrap gap-1 mt-2">
                  <span v-for="tag in sub.data.tags.slice(0, 4)" :key="tag" class="badge badge-outline badge-xs">{{ tag }}</span>
                </div>
                <div v-if="sub.reviewNote" class="mt-3 text-sm opacity-60">
                  <span class="font-medium">{{ t('contests.reviewNote') }}:</span> {{ sub.reviewNote }}
                </div>
              </div>
              <div class="flex flex-col items-end gap-2 shrink-0">
                <span class="badge" :class="{
                  'badge-warning': sub.status === 'pending',
                  'badge-success': sub.status === 'accepted',
                  'badge-error': sub.status === 'rejected',
                }">
                  {{ statusLabel(sub.status) }}
                </span>
                <NuxtLink
                  :to="localePath(`/contests/${slug}/submissions/${sub.id}/edit`)"
                  class="btn btn-sm btn-outline"
                >
                  <Edit3 class="w-3 h-3 mr-1" />
                  {{ t('contests.edit') }}
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-16">
        <p class="opacity-70 mb-4">{{ t('contests.noSubmissions') }}</p>
        <NuxtLink :to="localePath(`/contests/${slug}/submit`)" class="btn btn-primary">
          {{ t('contests.submitFirst') }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
