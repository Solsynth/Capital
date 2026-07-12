<script setup lang="ts">
import { Trophy, ArrowRight } from '@lucide/vue'

const props = defineProps<{
  contest: any
}>()

const { t } = useI18n()
const localePath = useLocalePath()

const phaseLabel = computed(() => {
  const phase = props.contest.state?.phase
  if (phase === 'dev')
    return t('contests.phase.dev')
  if (phase === 'voting')
    return t('contests.phase.voting')
  if (phase === 'results')
    return t('contests.phase.results')
  return ''
})
</script>

<template>
  <NuxtLink
    :to="localePath(`/contests/${contest.slug}`)"
    class="group flex flex-col overflow-hidden rounded-lg border border-base-200 bg-base-100 transition-colors duration-150 hover:border-base-300"
  >
    <div class="relative aspect-video overflow-hidden border-b border-base-200 bg-base-200/50">
      <img
        v-if="contest.coverImage"
        :src="contest.coverImage"
        :alt="contest.title"
        class="h-full w-full object-cover"
        loading="lazy"
      >
      <div
        v-else
        class="flex h-full w-full items-center justify-center"
      >
        <Trophy class="h-10 w-10 text-base-content/20" />
      </div>
    </div>

    <div class="flex flex-1 flex-col p-5">
      <div class="mb-2 flex flex-wrap items-center gap-1.5">
        <span
          class="badge badge-sm"
          :class="{
            'badge-primary': contest.status === 'upcoming',
            'badge-secondary': contest.status === 'ongoing',
            'badge-ghost': contest.status === 'past',
          }"
        >
          {{ t(`contests.statusLabel.${contest.status}`) }}
        </span>
        <span
          v-if="phaseLabel"
          class="badge badge-outline badge-sm"
        >
          {{ phaseLabel }}
        </span>
      </div>

      <h2 class="mb-2 text-lg font-bold leading-snug transition-colors group-hover:text-primary">
        {{ contest.title }}
      </h2>

      <p class="mb-4 line-clamp-2 flex-1 text-sm text-base-content/60">
        {{ contest.shortDescription || contest.description }}
      </p>

      <div
        v-if="contest.tags?.length"
        class="mb-3 flex flex-wrap gap-1"
      >
        <span
          v-for="tag in contest.tags.slice(0, 3)"
          :key="tag"
          class="badge badge-outline badge-xs"
        >
          {{ tag }}
        </span>
      </div>

      <div class="mt-auto flex items-center justify-between gap-2">
        <span
          v-if="contest.submissionCount > 0"
          class="text-sm text-base-content/50"
        >
          {{ contest.submissionCount }} {{ t('contests.submissions') }}
        </span>
        <span class="ml-auto flex items-center gap-1 text-sm font-medium text-base-content/50 transition-colors group-hover:text-primary">
          {{ t('contests.viewDetails') }}
          <ArrowRight class="h-3.5 w-3.5" />
        </span>
      </div>
    </div>
  </NuxtLink>
</template>
