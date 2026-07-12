<script setup lang="ts">
import { ArrowLeft, Code2, ExternalLink, Edit3 } from '@lucide/vue'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

const slug = computed(() => route.params?.slug as string)
const submissionId = computed(() => route.params?.id as string)

const session = import.meta.server ? await useServerSession() : null

const { data: submission } = await useAsyncData(
  `submission-${submissionId.value}`,
  () => {
    return $fetch(`/api/contests/submissions/${submissionId.value}`)
  },
)

const { data: contest } = await useAsyncData(
  `contest-for-${slug.value}`,
  () => {
    return $fetch(`/api/contests/${slug.value}`, {
      headers: { 'x-locale': locale.value },
    })
  },
)

const voteLoading = ref(false)

const { data: voteData, refresh: refreshVote } = await useAsyncData(
  `vote-${submissionId.value}`,
  () => {
    return $fetch(`/api/contests/submissions/${submissionId.value}/vote`)
  },
)

const isOwner = computed(
  () => session?.user?.id && session.user.id === submission.value?.userId,
)

if (!submission.value) {
  navigateTo(localePath(`/contests/${slug.value}/submissions`))
}

async function handleVote(vote: {
  creativity: number
  functionality: number
  integration: number
  isPositive: boolean
}) {
  voteLoading.value = true
  try {
    await $fetch(`/api/contests/submissions/${submissionId.value}/vote`, {
      method: 'POST',
      body: {
        creativity: vote.creativity,
        functionality: vote.functionality,
        integration: vote.integration,
        is_positive: vote.isPositive,
      },
    })
    await refreshVote()
  }
  finally {
    voteLoading.value = false
  }
}
</script>

<template>
  <div v-if="submission">
    <section class="border-b border-base-200 px-4 py-12 md:py-16">
      <div class="container mx-auto max-w-5xl">
        <NuxtLink
          :to="localePath(`/contests/${slug}/submissions`)"
          class="btn btn-ghost btn-sm mb-8 -ml-2 gap-1.5 text-base-content/60"
        >
          <ArrowLeft class="h-4 w-4" />
          {{ t('contests.viewSubmissions') }}
        </NuxtLink>

        <h1 class="mb-3 text-3xl font-extrabold tracking-tight md:text-4xl">
          {{ submission.data?.title }}
        </h1>
        <p class="mb-4 max-w-2xl text-base text-base-content/70">
          {{ submission.data?.description }}
        </p>

        <div
          v-if="submission.author"
          class="flex items-center gap-2"
        >
          <img
            v-if="submission.author.avatar"
            :src="submission.author.avatar"
            :alt="submission.author.name"
            class="h-7 w-7 rounded-full object-cover"
          >
          <span class="text-sm text-base-content/60">
            <a
              v-if="submission.author.solarAccountId"
              :href="`https://id.solian.app/@${submission.author.name}`"
              target="_blank"
              rel="noopener noreferrer"
              class="hover:underline"
            >
              @{{ submission.author.name }}
            </a>
            <template v-else>
              {{ submission.author.name }}
            </template>
          </span>
        </div>
      </div>
    </section>

    <section class="px-4 py-10">
      <div class="container mx-auto max-w-5xl">
        <div class="grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div class="space-y-6 lg:col-span-2">
            <div
              v-if="submission.data?.note"
              class="prose prose-sm max-w-none text-base-content/70"
            >
              <p>{{ submission.data.note }}</p>
            </div>

            <div
              v-if="submission.data?.screenshots?.length"
              class="grid grid-cols-1 gap-3 sm:grid-cols-2"
            >
              <img
                v-for="(url, idx) in submission.data.screenshots"
                :key="idx"
                :src="url"
                :alt="`Screenshot ${idx + 1}`"
                class="h-48 w-full rounded-lg border border-base-200 object-cover"
              >
            </div>

            <div
              v-if="submission.data?.tags?.length"
              class="flex flex-wrap gap-1.5"
            >
              <span
                v-for="tag in submission.data.tags"
                :key="tag"
                class="badge badge-outline badge-sm"
              >
                {{ tag }}
              </span>
            </div>

            <div class="flex flex-wrap items-center gap-3">
              <a
                v-if="submission.data?.repo_url"
                :href="submission.data.repo_url"
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn-ghost btn-sm gap-1.5 border border-base-300"
              >
                <Code2 class="h-4 w-4" />
                {{ t('contests.viewSource') }}
                <ExternalLink class="h-3.5 w-3.5" />
              </a>

              <span class="text-sm text-base-content/45">
                {{ t('contests.referral') }}: {{ submission.referralCode }}
              </span>
            </div>

            <div
              v-if="isOwner"
              class="border-t border-base-200 pt-4"
            >
              <NuxtLink
                :to="localePath(`/contests/${slug}/submissions/${submissionId}/edit`)"
                class="btn btn-ghost btn-sm gap-1.5 border border-base-300"
              >
                <Edit3 class="h-4 w-4" />
                {{ t('contests.edit') }}
              </NuxtLink>
            </div>
          </div>

          <aside>
            <div class="sticky top-20">
              <VoteCard
                :existing-vote="voteData?.vote"
                :contest-state="contest?.state || null"
                :loading="voteLoading"
                @submit="handleVote"
              />
            </div>
          </aside>
        </div>
      </div>
    </section>
  </div>
</template>
