<script setup lang="ts">
import {
  Eye,
  EyeOff,
  Flag,
  Trash2,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Star,
} from "@lucide/vue"
import { ref } from "vue"

definePageMeta({
  layout: "admin",
})

interface Review {
  id: string
  slug: string
  userId: string
  rating: number
  title: string | null
  content: string
  isRecommended: boolean | null
  helpfulCount: number
  status: string
  createdAt: Date
  updatedAt: Date
  userName: string | null
  userEmail: string | null
  userImage: string | null
}

const { t } = useI18n()

const statusFilter = ref<"all" | "published" | "flagged" | "hidden">("all")
const page = ref(1)
const pageSize = 20

const { data: reviewsData, refresh, status: loadStatus } = await useAsyncData(
  `admin-reviews-${statusFilter.value}-${page.value}`,
  async () => {
    const result = await useRequestFetch()("/api/admin/reviews", {
      query: {
        status: statusFilter.value,
        limit: pageSize,
        offset: (page.value - 1) * pageSize,
      },
    })
    return result as unknown as { reviews: Review[]; total: number }
  },
)

const reviews = computed(() => reviewsData.value?.reviews ?? [])
const totalReviews = computed(() => reviewsData.value?.total ?? 0)
const totalPages = computed(() => Math.ceil(totalReviews.value / pageSize))

const filters = ["all", "published", "flagged", "hidden"] as const

function filterLabel(filter: typeof filters[number]) {
  return t(`reviews.status${filter.charAt(0).toUpperCase()}${filter.slice(1)}`)
}

function onFilterChange(filter: "all" | "published" | "flagged" | "hidden") {
  statusFilter.value = filter
  page.value = 1
  refresh()
}

const updating = ref<string | null>(null)

async function updateStatus(id: string, status: string) {
  updating.value = id
  try {
    await $fetch(`/api/admin/reviews/${id}`, {
      method: "PATCH",
      body: { status },
    })
    await refresh()
  } catch (e: any) {
    console.error(e)
  } finally {
    updating.value = null
  }
}

async function deleteReview(id: string) {
  if (!confirm("Are you sure you want to delete this review? This cannot be undone.")) return
  updating.value = id
  try {
    await $fetch(`/api/admin/reviews/${id}`, { method: "DELETE" })
    await refresh()
  } catch (e: any) {
    console.error(e)
  } finally {
    updating.value = null
  }
}

function statusTone(status: string) {
  switch (status) {
    case "published":
      return "tone-ok"
    case "flagged":
      return "tone-warn"
    default:
      return "tone-muted"
  }
}

function ratingTone(rating: number) {
  if (rating >= 4) return "tone-ok"
  if (rating === 3) return "tone-warn"
  return "tone-bad"
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}
</script>

<template>
  <div>
    <div class="admin-head">
      <h2 class="admin-h">
        {{ t("reviews.title") }}
      </h2>
      <p class="admin-sub">
        {{ t("reviews.moderateDesc") }}
      </p>
    </div>

    <div class="rail" role="tablist" :aria-label="t('reviews.title')">
      <button
        v-for="filter in filters"
        :key="filter"
        type="button"
        role="tab"
        class="rail-tab"
        :class="{ 'is-current': statusFilter === filter }"
        :aria-selected="statusFilter === filter"
        @click="onFilterChange(filter)"
      >
        {{ filterLabel(filter) }}
      </button>
    </div>

    <div v-if="loadStatus === 'pending'" class="loading-rows">
      <span class="skeleton sk-row" />
      <span class="skeleton sk-row" />
      <span class="skeleton sk-row" />
    </div>

    <div v-else-if="reviews.length" class="table-wrap">
      <table class="ledger">
        <thead>
          <tr>
            <th>{{ t("reviews.rating") }}</th>
            <th>{{ t("reviews.user") }}</th>
            <th>{{ t("reviews.product") }}</th>
            <th>{{ t("reviews.review") }}</th>
            <th>{{ t("reviews.status") }}</th>
            <th>{{ t("reviews.helpful") }}</th>
            <th>{{ t("reviews.actions") }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="review in reviews" :key="review.id">
            <td>
              <span class="rating" :class="ratingTone(review.rating)">
                <Star class="rating-icon" aria-hidden="true" />
                {{ review.rating }}
              </span>
            </td>
            <td>
              <div class="entity">
                <img
                  v-if="review.userImage"
                  :src="review.userImage"
                  :alt="review.userName ?? ''"
                  class="entity-avatar"
                >
                <span v-else class="entity-avatar entity-initial">
                  {{ (review.userName ?? "?").charAt(0) }}
                </span>
                <span class="entity-text">
                  <span class="entity-name">{{ review.userName ?? t("reviews.anonymous") }}</span>
                  <span class="entity-sub">{{ review.userEmail }}</span>
                </span>
              </div>
            </td>
            <td class="mono">
              {{ review.slug }}
            </td>
            <td>
              <div class="review-cell">
                <p v-if="review.title" class="review-title">
                  {{ review.title }}
                </p>
                <p class="review-body">
                  {{ review.content || t("reviews.noContent") }}
                </p>
                <p class="mono">
                  {{ formatDate(review.createdAt) }}
                </p>
              </div>
            </td>
            <td>
              <span class="status" :class="statusTone(review.status)">
                <span class="dot" aria-hidden="true" />
                {{ review.status }}
              </span>
            </td>
            <td class="numeric">
              {{ review.helpfulCount }}
            </td>
            <td>
              <div class="row-actions">
                <button
                  v-if="review.status !== 'published'"
                  class="btn btn-xs"
                  :title="t('reviews.publish')"
                  :disabled="updating === review.id"
                  @click="updateStatus(review.id, 'published')"
                >
                  <CheckCircle class="btn-icon" aria-hidden="true" />
                </button>
                <button
                  v-if="review.status !== 'hidden'"
                  class="btn btn-xs"
                  :title="t('reviews.hide')"
                  :disabled="updating === review.id"
                  @click="updateStatus(review.id, 'hidden')"
                >
                  <EyeOff class="btn-icon" aria-hidden="true" />
                </button>
                <button
                  v-if="review.status !== 'flagged'"
                  class="btn btn-xs"
                  :title="t('reviews.flag')"
                  :disabled="updating === review.id"
                  @click="updateStatus(review.id, 'flagged')"
                >
                  <Flag class="btn-icon" aria-hidden="true" />
                </button>
                <button
                  v-if="review.status === 'hidden'"
                  class="btn btn-xs"
                  :title="t('reviews.unhide')"
                  :disabled="updating === review.id"
                  @click="updateStatus(review.id, 'published')"
                >
                  <Eye class="btn-icon" aria-hidden="true" />
                </button>
                <button
                  class="btn btn-xs"
                  :title="t('reviews.delete')"
                  :disabled="updating === review.id"
                  @click="deleteReview(review.id)"
                >
                  <Trash2 class="btn-icon" aria-hidden="true" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-else class="empty">
      {{ statusFilter === "all" ? t("reviews.empty") : t("reviews.emptyFiltered") }}
    </p>

    <div v-if="totalPages > 1" class="pager">
      <button
        class="btn btn-sm"
        :disabled="page <= 1"
        @click="page--; refresh()"
      >
        <ChevronLeft class="btn-icon" aria-hidden="true" />
        {{ t("reviews.previousPage") }}
      </button>
      <span class="pager-count">
        {{ t("reviews.pageOf", { page, total: totalPages }) }}
      </span>
      <button
        class="btn btn-sm"
        :disabled="page >= totalPages"
        @click="page++; refresh()"
      >
        {{ t("reviews.nextPage") }}
        <ChevronRight class="btn-icon" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.admin-head {
  margin-bottom: 1.25rem;
}

.admin-h {
  margin: 0;
  font-size: 1.375rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.admin-sub {
  margin: 0.35rem 0 0;
  font-size: 0.8125rem;
  color: var(--color-faint);
}

.rail {
  display: inline-flex;
  max-width: 100%;
  gap: 0.125rem;
  padding: 0.1875rem;
  margin-bottom: 1.5rem;
  overflow-x: auto;
  border: 1px solid var(--color-line-soft);
  border-radius: 999px;
  background: color-mix(in oklab, var(--color-base-200) 45%, transparent);
}

.rail-tab {
  padding: 0.375rem 0.9rem;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--color-faint);
  font-family: inherit;
  font-size: 0.8125rem;
  font-weight: 600;
  white-space: nowrap;
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

.table-wrap {
  overflow-x: auto;
}

.loading-rows {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sk-row {
  height: 2.5rem;
}

.rating {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.rating-icon {
  width: 0.75rem;
  height: 0.75rem;
}

.entity {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  min-width: 9rem;
}

.entity-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.6rem;
  height: 1.6rem;
  flex-shrink: 0;
  border-radius: 999px;
  object-fit: cover;
}

.entity-initial {
  background: var(--color-base-300);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-dim);
}

.entity-text {
  display: flex;
  flex-direction: column;
  gap: 0.05rem;
  min-width: 0;
  font-size: 0.8125rem;
}

.entity-name {
  font-weight: 600;
  color: var(--color-base-content);
}

.entity-sub {
  overflow: hidden;
  max-width: 12rem;
  font-size: 0.75rem;
  color: var(--color-faint);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.review-cell {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  max-width: 20rem;
}

.review-title {
  margin: 0;
  overflow: hidden;
  font-size: 0.8125rem;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.review-body {
  margin: 0;
  overflow: hidden;
  font-size: 0.8125rem;
  color: var(--color-faint);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.status .dot {
  background: currentColor;
}

.tone-ok {
  color: var(--color-success);
}

.tone-warn {
  color: var(--color-warning);
}

.tone-bad {
  color: var(--color-error);
}

.tone-muted {
  color: var(--color-faint);
}

.numeric {
  font-variant-numeric: tabular-nums;
}

.row-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.3rem;
}

.btn-icon {
  width: 0.8125rem;
  height: 0.8125rem;
}

.empty {
  margin: 0;
  padding: 1.5rem 0;
  font-size: 0.8125rem;
  color: var(--color-faint);
}

.pager {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  margin-top: 1.5rem;
}

.pager-count {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--color-faint);
}
</style>
