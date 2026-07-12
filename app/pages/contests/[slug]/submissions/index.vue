<script setup lang="ts">
import { ArrowLeft, Code2 } from '@lucide/vue'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

const slug = computed(() => route.params.slug as string)

const { data: contest } = await useAsyncData(
  `contest-submissions-${locale.value}-${slug.value}`,
  () => {
    return $fetch(`/api/contests/${slug.value}`, {
      headers: { 'x-locale': locale.value },
    })
  },
)

const { data: submissions } = await useAsyncData(
  `submissions-list-${slug.value}`,
  () => {
    if (!contest.value)
      return Promise.resolve([])
    return $fetch('/api/contests/submissions', {
      query: { contest_id: slug.value, sort: 'newest' },
    })
  },
)

if (!contest.value) {
  navigateTo(localePath('/contests'))
}
</script>

<template>
  <div v-if="contest">
    <section class="border-b border-base-200 px-4 py-12 md:py-16">
      <div class="container mx-auto max-w-5xl">
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
              {{ contest.title }}
            </h1>
            <p class="mt-1 text-base text-base-content/60">
              {{ t('contests.viewSubmissions') }}
            </p>
          </div>
          <NuxtLink
            v-if="contest.state?.submissionEnabled"
            :to="localePath(`/contests/${slug}/submit`)"
            class="btn btn-primary btn-sm self-start sm:self-auto"
          >
            {{ t('contests.submitProject') }}
          </NuxtLink>
        </div>
      </div>
    </section>

    <section class="px-4 py-10">
      <div class="container mx-auto max-w-5xl">
        <div
          v-if="submissions && submissions.length > 0"
          class="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
        >
          <NuxtLink
            v-for="sub in submissions"
            :key="sub.id"
            :to="localePath(`/contests/${slug}/submissions/${sub.id}`)"
            class="group flex flex-col overflow-hidden rounded-lg border border-base-200 bg-base-100 transition-colors duration-150 hover:border-base-300"
          >
            <div class="relative aspect-video overflow-hidden border-b border-base-200 bg-base-200/50">
              <img
                v-if="sub.data?.screenshots?.length"
                :src="sub.data.screenshots[0]"
                :alt="sub.data.title"
                class="h-full w-full object-cover"
                loading="lazy"
              >
              <div
                v-else
                class="flex h-full w-full items-center justify-center"
              >
                <Code2 class="h-10 w-10 text-base-content/20" />
              </div>
            </div>

            <div class="flex flex-1 flex-col p-5">
              <h2 class="mb-2 text-lg font-bold leading-snug transition-colors group-hover:text-primary">
                {{ sub.data?.title }}
              </h2>
              <p class="mb-3 line-clamp-2 flex-1 text-sm text-base-content/60">
                {{ sub.data?.description }}
              </p>

              <div
                v-if="sub.author"
                class="flex items-center gap-2"
              >
                <img
                  v-if="sub.author.avatar"
                  :src="sub.author.avatar"
                  :alt="sub.author.name"
                  class="h-5 w-5 rounded-full object-cover"
                >
                <span class="text-xs text-base-content/50">
                  <a
                    v-if="sub.author.solarAccountId"
                    :href="`https://id.solian.app/@${sub.author.name}`"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="hover:underline"
                    @click.stop
                  >
                    @{{ sub.author.name }}
                  </a>
                  <template v-else>
                    {{ sub.author.name }}
                  </template>
                </span>
              </div>

              <div
                v-if="sub.referralCode"
                class="mt-2 text-xs text-base-content/40"
              >
                {{ t('contests.referral') }}: {{ sub.referralCode }}
              </div>
            </div>
          </NuxtLink>
        </div>

        <div
          v-else
          class="rounded-lg border border-dashed border-base-300 px-6 py-16 text-center"
        >
          <Code2 class="mx-auto mb-4 h-10 w-10 text-base-content/20" />
          <p class="mb-4 text-base text-base-content/55">
            {{ t('contests.noSumbissions') }}
          </p>
          <NuxtLink
            v-if="contest.state?.submissionEnabled"
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
