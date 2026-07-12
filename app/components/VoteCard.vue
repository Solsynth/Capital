<script setup lang="ts">
import { Star, ThumbsUp, ThumbsDown, Send } from '@lucide/vue'
import { watch } from 'vue'

const { t } = useI18n()

const props = defineProps<{
  existingVote?: {
    creativity: number
    functionality: number
    integration: number
    isPositive: boolean
  } | null
  contestState: { phase: string, votingEnabled: boolean } | null
  loading?: boolean
}>()

const emit = defineEmits<{
  submit: [vote: { creativity: number, functionality: number, integration: number, isPositive: boolean }]
}>()

const creativity = ref(props.existingVote?.creativity ?? 0)
const functionality = ref(props.existingVote?.functionality ?? 0)
const integration = ref(props.existingVote?.integration ?? 0)
const isPositive = ref(props.existingVote?.isPositive ?? true)

watch(() => props.existingVote, (vote) => {
  if (vote) {
    creativity.value = vote.creativity
    functionality.value = vote.functionality
    integration.value = vote.integration
    isPositive.value = vote.isPositive
  }
})

const isVoting = computed(() => props.contestState?.votingEnabled ?? false)
const isResults = computed(() => props.contestState?.phase === 'results')
const isDev = computed(() => props.contestState && props.contestState.phase !== 'voting' && !props.contestState.votingEnabled)
const hasState = computed(() => !!props.contestState)

function toggleStar(field: 'creativity' | 'functionality' | 'integration', value: number) {
  if (field === 'creativity')
    creativity.value = value
  else if (field === 'functionality')
    functionality.value = value
  else integration.value = value
}

function handleSubmit() {
  if (!creativity.value || !functionality.value || !integration.value)
    return
  emit('submit', {
    creativity: creativity.value,
    functionality: functionality.value,
    integration: integration.value,
    isPositive: isPositive.value,
  })
}

const hasVote = computed(() => !!props.existingVote)
const scoresEntered = computed(() => creativity.value > 0 && functionality.value > 0 && integration.value > 0)

const categories = computed(() => [
  {
    key: 'creativity' as const,
    label: t('vote.creativity'),
    weight: 40,
    model: creativity,
  },
  {
    key: 'functionality' as const,
    label: t('vote.functionality'),
    weight: 40,
    model: functionality,
  },
  {
    key: 'integration' as const,
    label: t('vote.integration'),
    weight: 20,
    model: integration,
  },
])
</script>

<template>
  <div class="rounded-lg border border-base-200 bg-base-100 p-5">
    <h3 class="mb-1 text-base font-semibold">
      {{ t('vote.title') }}
    </h3>
    <p class="mb-4 text-xs text-base-content/50">
      {{ t('vote.subtitle') }}
    </p>

    <div
      v-if="!hasState"
      class="mb-4 rounded-md border border-warning/25 bg-warning/5 px-3 py-2 text-xs text-base-content/75"
    >
      {{ t('vote.phase.pending') }}
    </div>
    <div
      v-else-if="isDev"
      class="mb-4 rounded-md border border-info/25 bg-info/5 px-3 py-2 text-xs text-base-content/75"
    >
      {{ t('vote.phase.dev') }}
    </div>
    <div
      v-else-if="isResults"
      class="mb-4 rounded-md border border-success/25 bg-success/5 px-3 py-2 text-xs text-base-content/75"
    >
      {{ t('vote.phase.results') }}
    </div>

    <div class="space-y-4">
      <div
        v-for="cat in categories"
        :key="cat.key"
        class="flex items-center justify-between gap-3"
      >
        <div class="min-w-0 flex-1">
          <span class="text-sm font-medium">{{ cat.label }}</span>
          <span class="ml-2 text-xs text-base-content/45">{{ cat.weight }}%</span>
        </div>
        <div class="flex gap-0.5">
          <button
            v-for="star in 5"
            :key="star"
            type="button"
            class="p-0.5 disabled:cursor-not-allowed"
            :disabled="!isVoting || isResults || loading"
            @click="toggleStar(cat.key, star)"
          >
            <Star
              class="h-5 w-5"
              :class="star <= cat.model.value ? 'fill-warning text-warning' : 'text-base-content/25'"
            />
          </button>
        </div>
      </div>
    </div>

    <div class="mt-6">
      <p class="mb-2 text-xs text-base-content/50">
        {{ t('vote.verdict') }}
      </p>
      <div class="flex gap-2">
        <button
          type="button"
          class="btn btn-sm flex-1 gap-2"
          :class="isPositive ? 'btn-success' : 'btn-ghost border border-base-300'"
          :disabled="!isVoting || isResults || loading"
          @click="isPositive = true"
        >
          <ThumbsUp class="h-4 w-4" />
          {{ t('admin.contests.upvote') }}
        </button>
        <button
          type="button"
          class="btn btn-sm flex-1 gap-2"
          :class="!isPositive ? 'btn-error' : 'btn-ghost border border-base-300'"
          :disabled="!isVoting || isResults || loading"
          @click="isPositive = false"
        >
          <ThumbsDown class="h-4 w-4" />
          {{ t('admin.contests.downvote') }}
        </button>
      </div>
      <p class="mt-1.5 text-center text-xs text-base-content/40">
        {{ t('vote.verdictHelp') }}
      </p>
    </div>

    <button
      v-if="isVoting && !isResults"
      type="button"
      class="btn btn-primary mt-6 w-full gap-2"
      :disabled="!scoresEntered || loading"
      @click="handleSubmit"
    >
      <Send class="h-4 w-4" />
      <span v-if="loading">{{ t('vote.submitting') }}</span>
      <span v-else-if="hasVote">{{ t('vote.update') }}</span>
      <span v-else>{{ t('vote.submit') }}</span>
    </button>

    <div
      v-if="hasVote && !isResults"
      class="mt-3 text-center"
    >
      <span class="badge badge-success badge-sm">
        {{ t('vote.voted') }}
      </span>
    </div>
  </div>
</template>
