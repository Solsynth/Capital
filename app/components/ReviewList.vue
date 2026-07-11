<script setup lang="ts">
import ReviewCard from "./ReviewCard.vue"

interface Review {
  id: string
  userId: string
  rating: number
  title: string | null
  content: string
  isRecommended: boolean | null
  helpfulCount: number
  createdAt: Date | string
  user?: {
    id: string
    name: string
    image: string | null
  }
}

interface Props {
  reviews: Review[]
  sort?: "newest" | "helpful"
  loading?: boolean
  page?: number
  totalPages?: number
}

const props = withDefaults(defineProps<Props>(), {
  sort: "newest",
  loading: false,
  page: 1,
  totalPages: 1,
})

const emit = defineEmits<{
  "update:sort": [value: "newest" | "helpful"]
  helpful: [id: string]
  nextPage: []
  prevPage: []
}>()

const { t } = useI18n()

const sortOptions = [
  { value: "newest" as const, labelKey: "reviews.sortNewest" },
  { value: "helpful" as const, labelKey: "reviews.sortHelpful" },
]
</script>

<template>
  <div>
    <div
      v-if="reviews.length > 0 || loading"
      class="flex items-center justify-between gap-3 mb-4"
    >
      <span class="text-sm opacity-50">{{ t("reviews.sortBy") }}</span>
      <div class="flex items-center gap-1 p-0.5 rounded-lg bg-base-200 border border-base-content/5">
        <button
          v-for="option in sortOptions"
          :key="option.value"
          type="button"
          class="text-xs px-3 py-1.5 rounded-md transition-colors font-medium"
          :class="
            sort === option.value
              ? 'bg-base-100 text-base-content shadow-sm'
              : 'opacity-50 hover:opacity-80'
          "
          @click="emit('update:sort', option.value)"
        >
          {{ t(option.labelKey) }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="space-y-3">
      <div
        v-for="i in 3"
        :key="i"
        class="animate-pulse rounded-xl border border-base-content/5 bg-base-200 p-5"
      >
        <div class="flex gap-3 mb-3">
          <div class="w-9 h-9 rounded-full bg-base-300" />
          <div class="flex-1 space-y-2">
            <div class="h-3 w-28 bg-base-300 rounded" />
            <div class="h-3 w-20 bg-base-300 rounded" />
          </div>
        </div>
        <div class="h-3 w-full bg-base-300 rounded mb-2" />
        <div class="h-3 w-4/5 bg-base-300 rounded" />
      </div>
    </div>

    <div
      v-else-if="reviews.length === 0"
      class="rounded-xl border border-dashed border-base-content/15 bg-base-200/40 px-6 py-12 text-center"
    >
      <p class="text-sm opacity-60">{{ t("reviews.noReviews") }}</p>
    </div>

    <div v-else class="space-y-3">
      <ReviewCard
        v-for="review in reviews"
        :key="review.id"
        :id="review.id"
        :user-name="review.user?.name || 'Anonymous'"
        :user-image="review.user?.image"
        :rating="review.rating"
        :title="review.title"
        :content="review.content"
        :is-recommended="review.isRecommended"
        :helpful-count="review.helpfulCount"
        :created-at="review.createdAt"
        @helpful="emit('helpful', $event)"
      />
    </div>

    <div
      v-if="totalPages > 1 && !loading"
      class="flex items-center justify-center gap-2 mt-6"
    >
      <button
        type="button"
        class="btn btn-sm btn-ghost"
        :disabled="page <= 1"
        @click="emit('prevPage')"
      >
        «
      </button>
      <span class="text-sm opacity-60 tabular-nums px-2">
        {{ page }} / {{ totalPages }}
      </span>
      <button
        type="button"
        class="btn btn-sm btn-ghost"
        :disabled="page >= totalPages"
        @click="emit('nextPage')"
      >
        »
      </button>
    </div>
  </div>
</template>
