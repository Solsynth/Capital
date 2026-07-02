<script setup lang="ts">
import { Trophy, ArrowRight } from '@lucide/vue'

const props = defineProps<{
  contest: any
}>()

const { t } = useI18n()
const localePath = useLocalePath()

const phaseLabel = computed(() => {
  const phase = props.contest.state?.phase
  if (phase === 'dev') return t('contests.phase.dev')
  if (phase === 'voting') return t('contests.phase.voting')
  if (phase === 'results') return t('contests.phase.results')
  return ''
})
</script>

<template>
  <NuxtLink
    :to="localePath(`/contests/${contest.slug}`)"
    class="card bg-base-200 hover:bg-base-300 transition-colors group"
  >
    <figure v-if="contest.coverImage" class="h-48 overflow-hidden">
      <img
        :src="contest.coverImage"
        :alt="contest.title"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      >
    </figure>
    <figure v-else class="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
      <Trophy class="w-16 h-16 opacity-30" />
    </figure>

    <div class="card-body">
      <div class="flex items-center gap-2 mb-2">
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
        <span v-if="phaseLabel" class="badge badge-outline badge-sm">
          {{ phaseLabel }}
        </span>
      </div>

      <h2 class="card-title text-xl">{{ contest.title }}</h2>

      <p v-if="contest.shortDescription" class="opacity-70 line-clamp-2">
        {{ contest.shortDescription }}
      </p>
      <p v-else class="opacity-70 line-clamp-2">
        {{ contest.description }}
      </p>

      <div v-if="contest.tags && contest.tags.length > 0" class="flex flex-wrap gap-1 mt-3">
        <span v-for="tag in contest.tags.slice(0, 3)" :key="tag" class="badge badge-outline badge-xs">
          {{ tag }}
        </span>
      </div>

      <div class="card-actions justify-between items-center mt-4">
        <span v-if="contest.submissionCount > 0" class="text-sm opacity-60">
          {{ contest.submissionCount }} {{ t('contests.submissions') }}
        </span>
        <span class="btn btn-primary btn-sm ml-auto">
          View Details
          <ArrowRight class="w-4 h-4" />
        </span>
      </div>
    </div>
  </NuxtLink>
</template>
