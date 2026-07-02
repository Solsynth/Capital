<script setup lang="ts">
import { ArrowLeft, Code2 } from '@lucide/vue'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

const slug = computed(() => route.params.slug as string)

const { data: contest } = await useAsyncData(`contest-submissions-${locale.value}-${slug.value}`, () => {
  return $fetch(`/api/contests/${slug.value}`, {
    headers: { 'x-locale': locale.value },
  })
})

const { data: submissions } = await useAsyncData(`submissions-list-${slug.value}`, () => {
  if (!contest.value) return Promise.resolve([])
  return $fetch('/api/contests/submissions', {
    query: { contest_id: slug.value, sort: 'newest' },
  })
})

if (!contest.value) {
  navigateTo(localePath('/contests'))
}
</script>

<template>
  <div v-if="contest">
    <div class="container mx-auto px-4 py-12">
      <div class="max-w-5xl mx-auto">
        <NuxtLink
          :to="localePath(`/contests/${slug}`)"
          class="btn btn-ghost btn-sm mb-6 inline-flex"
        >
          <ArrowLeft class="w-4 h-4 mr-2" />
          {{ t('contests.backToContest') }}
        </NuxtLink>

        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="text-3xl font-bold">{{ contest.title }}</h1>
            <p class="opacity-70 mt-1">{{ t('contests.viewSubmissions') }}</p>
          </div>
          <NuxtLink
            v-if="contest.state?.submissionEnabled"
            :to="localePath(`/contests/${slug}/submit`)"
            class="btn btn-primary"
          >
            {{ t('contests.submitProject') }}
          </NuxtLink>
        </div>

        <div v-if="submissions && submissions.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <NuxtLink
            v-for="sub in submissions"
            :key="sub.id"
            :to="localePath(`/contests/${slug}/submissions/${sub.id}`)"
            class="card bg-base-200 hover:bg-base-300 transition-colors group"
          >
            <figure v-if="sub.data?.screenshots?.length" class="h-40 overflow-hidden">
              <img
                :src="sub.data.screenshots[0]"
                :alt="sub.data.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              >
            </figure>
            <figure v-else class="h-40 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <Code2 class="w-12 h-12 opacity-30" />
            </figure>

            <div class="card-body">
              <h2 class="card-title text-lg">{{ sub.data?.title }}</h2>
              <p class="opacity-70 line-clamp-2 text-sm">{{ sub.data?.description }}</p>
              <div v-if="sub.referralCode" class="text-xs opacity-50 mt-2">
                {{ t('contests.referral') }}: {{ sub.referralCode }}
              </div>
            </div>
          </NuxtLink>
        </div>

        <div v-else class="text-center py-16">
          <Code2 class="w-16 h-16 opacity-30 mx-auto mb-4" />
          <p class="text-lg opacity-70">
            {{ t('contests.noSumbissions') }}
          </p>
          <NuxtLink
            v-if="contest.state?.submissionEnabled"
            :to="localePath(`/contests/${slug}/submit`)"
            class="btn btn-primary mt-4"
          >
            {{ t('contests.submitFirst') }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
