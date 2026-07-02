<script setup lang="ts">
import { ArrowLeft, Code2, ExternalLink, Edit3 } from '@lucide/vue'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

const slug = computed(() => route.params?.slug as string)
const submissionId = computed(() => route.params?.id as string)

const session = import.meta.server ? await useServerSession() : null

const { data: submission } = await useAsyncData(`submission-${submissionId.value}`, () => {
  return $fetch(`/api/contests/submissions/${submissionId.value}`)
})

const { data: contest } = await useAsyncData(`contest-for-${slug.value}`, () => {
  return $fetch(`/api/contests/${slug.value}`, {
    headers: { 'x-locale': locale.value },
  })
})

const { data: voteData, refresh: refreshVote } = await useAsyncData(`vote-${submissionId.value}`, () => {
  return $fetch(`/api/contests/submissions/${submissionId.value}/vote`)
})

const isOwner = computed(() => session?.user?.id && session.user.id === submission.value?.userId)

if (!submission.value) {
  navigateTo(localePath(`/contests/${slug.value}/submissions`))
}

async function handleVote(vote: { creativity: number; functionality: number; integration: number; isPositive: boolean }) {
  await $fetch(`/api/contests/submissions/${submissionId.value}/vote`, {
    method: 'POST',
    body: vote,
  })
  await refreshVote()
}
</script>

<template>
  <div v-if="submission" class="container mx-auto px-4 py-12">
    <div class="max-w-4xl mx-auto">
        <NuxtLink
          :to="localePath(`/contests/${slug}/submissions`)"
          class="btn btn-ghost btn-sm mb-6 inline-flex"
        >
          <ArrowLeft class="w-4 h-4 mr-2" />
          {{ t('contests.viewSubmissions') }}
        </NuxtLink>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <div class="card bg-base-200">
            <div class="card-body">
              <h1 class="text-3xl font-bold mb-2">{{ submission.data?.title }}</h1>
              <p class="opacity-80 mb-4">{{ submission.data?.description }}</p>

              <div v-if="submission.data?.note" class="prose prose-sm max-w-none opacity-70 mb-4">
                <p>{{ submission.data.note }}</p>
              </div>

              <!-- Screenshots -->
              <div v-if="submission.data?.screenshots?.length" class="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
                <img
                  v-for="(url, idx) in submission.data.screenshots"
                  :key="idx"
                  :src="url"
                  :alt="`Screenshot ${idx + 1}`"
                  class="rounded-lg object-cover w-full h-48"
                >
              </div>

              <!-- Tags -->
              <div v-if="submission.data?.tags?.length" class="flex flex-wrap gap-2 mb-4">
                <span v-for="tag in submission.data.tags" :key="tag" class="badge badge-outline badge-sm">
                  {{ tag }}
                </span>
              </div>

              <!-- Repo Link -->
              <div v-if="submission.data?.repo_url">
                <a :href="submission.data.repo_url" target="_blank" class="btn btn-sm btn-ghost">
                  <Code2 class="w-4 h-4 mr-2" />
                  {{ t('contests.viewSource') }}
                  <ExternalLink class="w-3 h-3 ml-1" />
                </a>
              </div>

              <!-- Referral Code -->
              <div class="text-sm opacity-50 mt-4">
                {{ t('contests.referral') }}: {{ submission.referralCode }}
              </div>

              <!-- Owner Actions -->
              <div v-if="isOwner" class="mt-4 pt-4 border-t border-base-300">
                <NuxtLink
                  :to="localePath(`/contests/${slug}/submissions/${submissionId}/edit`)"
                  class="btn btn-sm btn-outline"
                >
                  <Edit3 class="w-4 h-4 mr-2" />
                  {{ t('contests.edit') }}
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar: Voting -->
        <div class="lg:col-span-1">
          <VoteCard
            :existing-vote="voteData?.vote"
            :contest-state="contest?.state || null"
            @submit="handleVote"
          />
        </div>
      </div>
    </div>
  </div>
</template>
