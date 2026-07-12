<script setup lang="ts">
import {
  Trophy,
  ArrowLeft,
  Tag,
  FileText,
  Vote,
} from '@lucide/vue'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

const slug = computed(() => route.params?.slug as string)

const { data: contest } = await useAsyncData(
  `contest-${locale.value}-${slug.value}`,
  async () => {
    const allContests = await queryCollection('contests')
      .where('path', 'LIKE', `/contests/${locale.value}/%`)
      .all()
    return (
      allContests.find(
        c => c.path === `/contests/${locale.value}/${slug.value}`,
      ) || null
    )
  },
)

const { data: dbData } = await useAsyncData(`contest-db-${slug.value}`, () => {
  return $fetch(`/api/contests/${slug.value}`)
})

if (!contest.value) {
  navigateTo(localePath('/contests'))
}

const phaseLabel = computed(() => {
  const phase = dbData.value?.state?.phase
  if (phase === 'dev')
    return t('contests.phase.dev')
  if (phase === 'voting')
    return t('contests.phase.voting')
  if (phase === 'results')
    return t('contests.phase.results')
  return ''
})

const canSubmit = computed(() => {
  if (!dbData.value?.state)
    return false
  return (
    dbData.value.state.status !== 'past'
    && dbData.value.state.phase !== 'results'
    && dbData.value.state.submissionEnabled
  )
})

const canVote = computed(() => {
  if (!dbData.value?.state)
    return false
  return dbData.value.state.votingEnabled
})

const submissionCount = computed(() => dbData.value?.submissionCount || 0)

const contestStatus = computed(
  () => dbData.value?.state?.status || contest.value?.status || 'upcoming',
)

function statusLabel(status: string) {
  const key = `contests.statusLabel.${status}`
  const label = t(key)
  return label !== key
    ? label
    : status.charAt(0).toUpperCase() + status.slice(1)
}

useSeoMeta({
  title: () => contest.value?.title || t('contests.title'),
  description: () => contest.value?.description || t('contests.subtitle'),
})

defineOgImage('UniOgImage', {
  title: contest.value?.title || t('contests.title'),
  description: contest.value?.description || t('contests.subtitle'),
})
</script>

<template>
  <div v-if="contest">
    <section class="relative overflow-hidden border-b border-base-200">
      <template v-if="contest.coverImage">
        <img
          :src="contest.coverImage"
          :alt="contest.title"
          class="absolute inset-0 h-full w-full object-cover opacity-30"
        >
        <div class="absolute inset-0 bg-linear-to-b from-base-100/40 via-base-100/80 to-base-100" />
      </template>

      <div class="relative container mx-auto max-w-5xl px-4 py-12 md:py-16">
        <NuxtLink
          :to="localePath('/contests')"
          class="btn btn-ghost btn-sm mb-8 -ml-2 gap-1.5 text-base-content/60"
        >
          <ArrowLeft class="h-4 w-4" />
          {{ t('contests.backToContests') }}
        </NuxtLink>

        <div class="mb-4 flex flex-wrap items-center gap-2">
          <span
            class="badge"
            :class="{
              'badge-primary': contestStatus === 'upcoming',
              'badge-secondary': contestStatus === 'ongoing',
              'badge-ghost': contestStatus === 'past',
            }"
          >
            {{ statusLabel(contestStatus) }}
          </span>
          <span
            v-if="phaseLabel"
            class="badge badge-outline"
          >
            {{ phaseLabel }}
          </span>
        </div>

        <h1 class="mb-4 max-w-3xl text-3xl font-extrabold tracking-tight md:text-4xl lg:text-5xl">
          {{ contest.title }}
        </h1>
        <p class="max-w-3xl text-base text-base-content/70 md:text-lg">
          {{ contest.description }}
        </p>
      </div>
    </section>

    <section class="px-4 py-10">
      <div class="container mx-auto max-w-5xl">
        <div class="mb-10 flex flex-wrap gap-2">
          <NuxtLink
            v-if="canSubmit"
            :to="localePath(`/contests/${slug}/submit`)"
            class="btn btn-primary gap-1.5"
          >
            <FileText class="h-4 w-4" />
            {{ t('contests.submitProject') }}
          </NuxtLink>
          <NuxtLink
            v-if="canVote"
            :to="localePath(`/contests/${slug}/submissions`)"
            class="btn btn-secondary gap-1.5"
          >
            <Vote class="h-4 w-4" />
            {{ t('contests.vote') }}
          </NuxtLink>
          <NuxtLink
            :to="localePath(`/contests/${slug}/submissions`)"
            class="btn btn-ghost gap-1.5 border border-base-300"
          >
            {{ t('contests.viewSubmissions') }}
            <span
              v-if="submissionCount > 0"
              class="text-xs opacity-70"
            >
              {{ submissionCount }}
            </span>
          </NuxtLink>
          <NuxtLink
            :to="localePath(`/contests/${slug}/mine`)"
            class="btn btn-ghost border border-base-300"
          >
            {{ t('contests.mySubmissions') }}
          </NuxtLink>
        </div>

        <div class="grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div class="space-y-10 lg:col-span-2">
            <section v-if="contest.rules?.length">
              <h2 class="mb-4 text-xl font-bold tracking-tight">
                {{ t('contests.rules') }}
              </h2>
              <ul class="space-y-3">
                <li
                  v-for="(rule, idx) in contest.rules"
                  :key="idx"
                  class="flex items-start gap-3"
                >
                  <span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-base-300 text-xs font-medium text-base-content/55">
                    {{ idx + 1 }}
                  </span>
                  <span class="text-base-content/75">{{ rule }}</span>
                </li>
              </ul>
            </section>

            <section v-if="contest.prizes?.length">
              <h2 class="mb-4 text-xl font-bold tracking-tight">
                {{ t('contests.prizes') }}
              </h2>
              <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div
                  v-for="prize in contest.prizes"
                  :key="prize.place"
                  class="rounded-lg border border-base-200 bg-base-100 p-4"
                >
                  <div class="mb-1.5 flex items-center gap-2">
                    <Trophy class="h-4 w-4 text-base-content/50" />
                    <span class="font-semibold">{{ prize.place }}</span>
                  </div>
                  <p class="text-sm text-base-content/60">
                    {{ prize.reward }}
                  </p>
                </div>
              </div>
            </section>
          </div>

          <aside>
            <div class="sticky top-20 rounded-lg border border-base-200 bg-base-100 p-5">
              <h3 class="mb-4 text-base font-semibold">
                {{ t('contests.contestInfo') }}
              </h3>

              <div class="space-y-4">
                <div class="flex items-start gap-3">
                  <FileText class="mt-0.5 h-4 w-4 shrink-0 text-base-content/50" />
                  <div>
                    <p class="text-sm font-medium">
                      {{ t('contests.viewSubmissions') }}
                    </p>
                    <p class="text-sm text-base-content/55">
                      {{ submissionCount }} {{ t('contests.accepted') }}
                    </p>
                  </div>
                </div>

                <div
                  v-if="dbData?.state"
                  class="flex items-start gap-3"
                >
                  <Vote class="mt-0.5 h-4 w-4 shrink-0 text-base-content/50" />
                  <div>
                    <p class="text-sm font-medium">
                      {{ t('contests.currentPhase') }}
                    </p>
                    <p class="text-sm text-base-content/55">
                      {{ phaseLabel }}
                    </p>
                  </div>
                </div>
              </div>

              <div
                v-if="dbData?.userSubmission"
                class="mt-5 border-t border-base-200 pt-4"
              >
                <p class="mb-2 text-sm font-medium">
                  {{ t('contests.yourSubmission') }}
                </p>
                <span
                  class="badge badge-sm"
                  :class="{
                    'badge-warning': dbData.userSubmission.status === 'pending',
                    'badge-success': dbData.userSubmission.status === 'accepted',
                    'badge-error': dbData.userSubmission.status === 'rejected',
                  }"
                >
                  {{ statusLabel(dbData.userSubmission.status) }}
                </span>
              </div>

              <div
                v-if="contest.tags?.length"
                class="mt-5 border-t border-base-200 pt-4"
              >
                <h4 class="mb-2 flex items-center gap-1.5 text-sm font-medium text-base-content/70">
                  <Tag class="h-3.5 w-3.5" />
                  {{ t('contests.tags') }}
                </h4>
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="tag in contest.tags"
                    :key="tag"
                    class="badge badge-outline badge-xs"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  </div>
</template>
