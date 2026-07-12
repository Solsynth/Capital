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

const { data: submissions } = await useAsyncData(`my-submissions-${slug.value}`, () => {
  return $fetch('/api/contests/submissions/mine', {
    query: { contest_id: slug.value },
    headers: { 'x-locale': locale.value },
  })
})

if (!content.value) {
  navigateTo(localePath('/contests'))
}

function statusIcon(status: string) {
  if (status === 'pending')
    return Clock
  if (status === 'accepted')
    return CheckCircle
  if (status === 'rejected')
    return XCircle
  return Clock
}

function statusColor(status: string) {
  if (status === 'pending')
    return 'text-warning'
  if (status === 'accepted')
    return 'text-success'
  if (status === 'rejected')
    return 'text-error'
  return 'text-base-content'
}

function statusLabel(status: string) {
  return t(`contests.status.${status}`)
}
</script>

<template>
  <div v-if="content">
    <section class="border-b border-base-200 px-4 py-12 md:py-16">
      <div class="container mx-auto max-w-3xl">
        <NuxtLink
          :to="localePath(`/contests/${slug}`)"
          class="btn btn-ghost btn-sm mb-8 -ml-2 gap-1.5 text-base-content/60"
        >
          <ArrowLeft class="h-4 w-4" />
          {{ t('contests.backToContest') }}
        </NuxtLink>

        <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 class="text-3xl font-extrabold tracking-tight md:text-4xl">
              {{ content.title }}
            </h1>
            <p class="mt-1 text-base text-base-content/60">
              {{ t('contests.mySubmissions') }}
            </p>
          </div>
          <NuxtLink
            :to="localePath(`/contests/${slug}/submit`)"
            class="btn btn-primary btn-sm gap-1.5 self-start sm:self-auto"
          >
            <Plus class="h-4 w-4" />
            {{ t('contests.submitProject') }}
          </NuxtLink>
        </div>
      </div>
    </section>

    <section class="px-4 py-10">
      <div class="container mx-auto max-w-3xl">
        <div
          v-if="submissions?.submissions?.length"
          class="divide-y divide-base-200 rounded-lg border border-base-200"
        >
          <div
            v-for="sub in submissions.submissions"
            :key="sub.id"
            class="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between"
          >
            <div class="min-w-0 flex-1">
              <div class="mb-1 flex items-center gap-2">
                <component
                  :is="statusIcon(sub.status)"
                  class="h-4 w-4 shrink-0"
                  :class="statusColor(sub.status)"
                />
                <span class="font-semibold">{{ sub.data?.title }}</span>
              </div>
              <p class="line-clamp-2 text-sm text-base-content/60">
                {{ sub.data?.description }}
              </p>
              <div
                v-if="sub.data?.tags?.length"
                class="mt-2 flex flex-wrap gap-1"
              >
                <span
                  v-for="tag in sub.data.tags.slice(0, 4)"
                  :key="tag"
                  class="badge badge-outline badge-xs"
                >{{ tag }}</span>
              </div>
              <div
                v-if="sub.reviewNote"
                class="mt-3 text-sm text-base-content/55"
              >
                <span class="font-medium">{{ t('contests.reviewNote') }}:</span>
                {{ sub.reviewNote }}
              </div>
            </div>

            <div class="flex shrink-0 flex-row items-center gap-2 sm:flex-col sm:items-end">
              <span
                class="badge badge-sm"
                :class="{
                  'badge-warning': sub.status === 'pending',
                  'badge-success': sub.status === 'accepted',
                  'badge-error': sub.status === 'rejected',
                }"
              >
                {{ statusLabel(sub.status) }}
              </span>
              <NuxtLink
                :to="localePath(`/contests/${slug}/submissions/${sub.id}/edit`)"
                class="btn btn-ghost btn-sm gap-1 border border-base-300"
              >
                <Edit3 class="h-3.5 w-3.5" />
                {{ t('contests.edit') }}
              </NuxtLink>
            </div>
          </div>
        </div>

        <div
          v-else
          class="rounded-lg border border-dashed border-base-300 px-6 py-16 text-center"
        >
          <p class="mb-4 text-base text-base-content/55">
            {{ t('contests.noSubmissions') }}
          </p>
          <NuxtLink
            :to="localePath(`/contests/${slug}/submit`)"
            class="btn btn-primary btn-sm"
          >
            {{ t('contests.submitFirst') }}
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
