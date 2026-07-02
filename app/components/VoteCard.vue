<script setup lang="ts">
import { Star, ThumbsUp, ThumbsDown, Send } from '@lucide/vue'

const { t } = useI18n()

const props = defineProps<{
  existingVote?: {
    creativity: number
    functionality: number
    integration: number
    isPositive: boolean
  } | null
  contestState: { phase: string; votingEnabled: boolean } | null
  loading?: boolean
}>()

const emit = defineEmits<{
  submit: [vote: { creativity: number; functionality: number; integration: number; isPositive: boolean }]
}>()

const creativity = ref(props.existingVote?.creativity ?? 0)
const functionality = ref(props.existingVote?.functionality ?? 0)
const integration = ref(props.existingVote?.integration ?? 0)
const isPositive = ref(props.existingVote?.isPositive ?? true)

const isVoting = computed(() => props.contestState?.votingEnabled ?? false)
const isResults = computed(() => props.contestState?.phase === 'results')
const isDev = computed(() => props.contestState && props.contestState.phase !== 'voting' && !props.contestState.votingEnabled)
const hasState = computed(() => !!props.contestState)

function toggleStar(field: 'creativity' | 'functionality' | 'integration', value: number) {
  if (field === 'creativity') creativity.value = value
  else if (field === 'functionality') functionality.value = value
  else integration.value = value
}

function handleSubmit() {
  if (!creativity.value || !functionality.value || !integration.value) return
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
  <div class="card bg-base-200 border border-base-300">
    <div class="card-body">
      <h3 class="card-title text-lg mb-1">
        {{ t('vote.title') }}
      </h3>
      <p class="text-xs opacity-50 mb-4">
        {{ t('vote.subtitle') }}
      </p>

      <!-- Phase notices -->
      <div v-if="!hasState" class="alert alert-warning alert-sm mb-4">
        {{ t('vote.phase.pending') }}
      </div>
      <div v-else-if="isDev" class="alert alert-info alert-sm mb-4">
        {{ t('vote.phase.dev') }}
      </div>
      <div v-else-if="isResults" class="alert alert-success alert-sm mb-4">
        {{ t('vote.phase.results') }}
      </div>

      <!-- Category Scoring -->
      <div class="space-y-4">
        <div
          v-for="cat in categories"
          :key="cat.key"
          class="flex items-center justify-between"
        >
          <div class="flex-1 min-w-0">
            <span class="font-medium text-sm">{{ cat.label }}</span>
            <span class="text-xs opacity-50 ml-2">{{ cat.weight }}%</span>
          </div>
          <div class="flex gap-1 ml-3">
            <button
              v-for="star in 5"
              :key="star"
              type="button"
              class="p-0.5 transition-transform hover:scale-110"
              :disabled="!isVoting || isResults || loading"
              @click="toggleStar(cat.key, star)"
            >
              <Star
                class="w-5 h-5"
                :class="star <= cat.model.value ? 'text-warning fill-warning' : 'opacity-30'"
              />
            </button>
          </div>
        </div>
      </div>

      <!-- Positive / Negative -->
      <div class="mt-6">
        <p class="text-xs opacity-50 mb-2">
          {{ t('vote.verdict') }}
        </p>
        <div class="flex gap-3">
          <button
            type="button"
            class="btn btn-sm flex-1 gap-2"
            :class="isPositive ? 'btn-success' : 'btn-outline'"
            :disabled="!isVoting || isResults || loading"
            @click="isPositive = true"
          >
            <ThumbsUp class="w-4 h-4" />
            {{ t('admin.contests.upvote') }}
          </button>
          <button
            type="button"
            class="btn btn-sm flex-1 gap-2"
            :class="!isPositive ? 'btn-error' : 'btn-outline'"
            :disabled="!isVoting || isResults || loading"
            @click="isPositive = false"
          >
            <ThumbsDown class="w-4 h-4" />
            {{ t('admin.contests.downvote') }}
          </button>
        </div>
        <p class="text-xs opacity-40 mt-1 text-center">
          {{ t('vote.verdictHelp') }}
        </p>
      </div>

      <!-- Submit -->
      <button
        v-if="isVoting && !isResults"
        type="button"
        class="btn btn-primary w-full mt-6 gap-2"
        :disabled="!scoresEntered || loading"
        @click="handleSubmit"
      >
        <Send class="w-4 h-4" />
        <span v-if="loading">{{ t('vote.submitting') }}</span>
        <span v-else-if="hasVote">{{ t('vote.update') }}</span>
        <span v-else>{{ t('vote.submit') }}</span>
      </button>

      <!-- Existing vote indicator -->
      <div v-if="hasVote && !isResults" class="mt-3 text-center">
        <span class="badge badge-success badge-sm">
          {{ t('vote.voted') }}
        </span>
      </div>
    </div>
  </div>
</template>
