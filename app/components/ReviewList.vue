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
</script>

<template>
  <div>
    <!-- Sort controls -->
    <div v-if="reviews.length > 0" class="flex items-center gap-2 mb-4">
      <span class="text-xs opacity-50 mr-1">{{ t("reviews.sortBy") }}</span>
      <button
        class="text-xs px-2.5 py-1 rounded-md transition-colors font-medium"
        :class="sort === 'newest' ? 'bg-primary/15 text-primary' : 'opacity-50 hover:opacity-80'"
        @click="emit('update:sort', 'newest')"
      >
        {{ t("reviews.sortNewest") }}
      </button>
      <button
        class="text-xs px-2.5 py-1 rounded-md transition-colors font-medium"
        :class="sort === 'helpful' ? 'bg-primary/15 text-primary' : 'opacity-50 hover:opacity-80'"
        @click="emit('update:sort', 'helpful')"
      >
        {{ t("reviews.sortHelpful") }}
      </button>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="animate-pulse">
        <div class="h-24 bg-base-200 rounded-lg" />
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="reviews.length === 0" class="text-center py-8">
      <p class="opacity-60">{{ t("reviews.noReviews") }}</p>
    </div>

    <!-- Reviews list -->
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

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex justify-center mt-6">
      <div class="btn-group">
        <button
          class="btn btn-sm"
          :disabled="page <= 1"
          @click="emit('prevPage')"
        >
          «
        </button>
        <button class="btn btn-sm btn-ghost">{{ page }} / {{ totalPages }}</button>
        <button
          class="btn btn-sm"
          :disabled="page >= totalPages"
          @click="emit('nextPage')"
        >
          »
        </button>
      </div>
    </div>
  </div>
</template>
