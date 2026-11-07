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
  reply: string | null
  replyAt: Date | string | null
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
      class="list-head"
    >
      <span class="list-label">{{ t("reviews.sortBy") }}</span>
      <div class="rail" role="group" :aria-label="t('reviews.sortBy')">
        <button
          v-for="option in sortOptions"
          :key="option.value"
          type="button"
          class="rail-tab"
          :class="{ 'is-current': sort === option.value }"
          :aria-pressed="sort === option.value"
          @click="emit('update:sort', option.value)"
        >
          {{ t(option.labelKey) }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="skeletons" aria-hidden="true">
      <div v-for="i in 3" :key="i" class="skeleton-row">
        <span class="skeleton skeleton-avatar" />
        <span class="skeleton skeleton-line" />
        <span class="skeleton skeleton-line short" />
      </div>
    </div>

    <p v-else-if="reviews.length === 0" class="list-empty">
      {{ t("reviews.noReviews") }}
    </p>

    <div v-else class="ledger-list">
      <ReviewCard
        v-for="review in reviews"
        :key="review.id"
        :id="review.id"
        :user-name="review.user?.name"
        :user-image="review.user?.image"
        :rating="review.rating"
        :title="review.title"
        :content="review.content"
        :is-recommended="review.isRecommended"
        :helpful-count="review.helpfulCount"
        :created-at="review.createdAt"
        :reply="review.reply"
        :reply-at="review.replyAt"
        @helpful="emit('helpful', $event)"
      />
    </div>

    <div v-if="totalPages > 1 && !loading" class="pager">
      <button
        type="button"
        class="btn btn-sm btn-ghost"
        :disabled="page <= 1"
        :aria-label="t('reviews.previousPage')"
        @click="emit('prevPage')"
      >
        ‹
      </button>
      <span class="mono pager-count">{{ page }} / {{ totalPages }}</span>
      <button
        type="button"
        class="btn btn-sm btn-ghost"
        :disabled="page >= totalPages"
        :aria-label="t('reviews.nextPage')"
        @click="emit('nextPage')"
      >
        ›
      </button>
    </div>
  </div>
</template>

<style scoped>
.list-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.list-label {
  font-size: 0.75rem;
  color: var(--color-faint);
}

.rail {
  display: inline-flex;
  gap: 0.125rem;
  padding: 0.1875rem;
  border: 1px solid var(--color-line-soft);
  border-radius: 999px;
}

.rail-tab {
  padding: 0.3rem 0.7rem;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--color-faint);
  font-family: inherit;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    color 140ms ease,
    background-color 140ms ease;
}

.rail-tab:hover {
  color: var(--color-base-content);
}

.rail-tab.is-current {
  background: var(--color-base-300);
  color: var(--color-base-content);
}

.rail-tab:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.skeletons {
  border-top: 1px solid var(--color-line-soft);
}

.skeleton-row {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding-block: 1.15rem;
  border-bottom: 1px solid var(--color-line-soft);
}

.skeleton-avatar {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 999px;
}

.skeleton-line {
  height: 0.6rem;
  flex: 1;
}

.skeleton-line.short {
  flex: 0 0 4rem;
}

.list-empty {
  margin: 0;
  padding: 2.5rem 0;
  border-top: 1px solid var(--color-line-soft);
  font-size: 0.9375rem;
  color: var(--color-faint);
}

.ledger-list {
  border-top: 1px solid var(--color-line-soft);
}

.pager {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
}

.pager-count {
  color: var(--color-faint);
}
</style>
