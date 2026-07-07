<script setup lang="ts">
import {
  Eye,
  EyeOff,
  Flag,
  Trash2,
  CheckCircle,
  XCircle,
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

const statusFilter = ref<"all" | "published" | "flagged" | "hidden">("all")
const page = ref(1)
const pageSize = 20

const { data: reviewsData, refresh } = await useAsyncData(
  `admin-reviews-${statusFilter.value}-${page.value}`,
  async () => {
    const result = await $fetch("/api/admin/reviews", {
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

const statusBadge = (status: string) => {
  switch (status) {
    case "published":
      return "badge-success"
    case "flagged":
      return "badge-warning"
    case "hidden":
      return "badge-ghost"
    default:
      return "badge-ghost"
  }
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
    <div class="mb-6">
      <h1 class="text-2xl font-bold">Reviews</h1>
      <p class="text-sm opacity-60 mt-1">Moderate product reviews and ratings</p>
    </div>

    <div role="tablist" class="tabs tabs-boxed mb-6">
      <button
        role="tab"
        class="tab"
        :class="statusFilter === 'all' ? 'tab-active' : ''"
        @click="onFilterChange('all')"
      >
        All
      </button>
      <button
        role="tab"
        class="tab"
        :class="statusFilter === 'published' ? 'tab-active' : ''"
        @click="onFilterChange('published')"
      >
        Published
      </button>
      <button
        role="tab"
        class="tab"
        :class="statusFilter === 'flagged' ? 'tab-active' : ''"
        @click="onFilterChange('flagged')"
      >
        Flagged
      </button>
      <button
        role="tab"
        class="tab"
        :class="statusFilter === 'hidden' ? 'tab-active' : ''"
        @click="onFilterChange('hidden')"
      >
        Hidden
      </button>
    </div>

    <!-- Empty state -->
    <div v-if="reviews.length === 0" class="text-center py-16">
      <p class="text-lg opacity-60">No reviews found</p>
      <p class="text-sm opacity-40 mt-1">
        {{ statusFilter !== "all" ? "Try a different filter" : "Reviews will appear here when users submit them" }}
      </p>
    </div>

    <!-- Reviews table -->
    <div v-else class="overflow-x-auto">
      <table class="table table-zebra">
        <thead>
          <tr>
            <th class="w-10"></th>
            <th>User</th>
            <th>Product</th>
            <th>Review</th>
            <th>Status</th>
            <th>Helpful</th>
            <th class="w-48">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="review in reviews" :key="review.id">
            <td>
              <span
                class="badge badge-sm"
                :class="{
                  'badge-success': review.rating >= 4,
                  'badge-warning': review.rating === 3,
                  'badge-error': review.rating < 3,
                }"
              >
                <Star class="w-3 h-3" />
                {{ review.rating }}
              </span>
            </td>
            <td>
              <div class="flex items-center gap-2">
                <div class="avatar placeholder">
                  <div class="bg-base-200 w-8 h-8 rounded-full flex items-center justify-center overflow-hidden">
                    <img v-if="review.userImage" :src="review.userImage" :alt="review.userName ?? ''" class="w-8 h-8 rounded-full" />
                    <span v-else class="text-xs opacity-50">{{ (review.userName ?? "?").charAt(0) }}</span>
                  </div>
                </div>
                <div class="text-sm">
                  <p class="font-medium">{{ review.userName ?? "Anonymous" }}</p>
                  <p class="text-xs opacity-50">{{ review.userEmail }}</p>
                </div>
              </div>
            </td>
            <td class="text-sm font-mono opacity-70">{{ review.slug }}</td>
            <td class="max-w-xs">
              <p v-if="review.title" class="font-medium text-sm truncate">{{ review.title }}</p>
              <p class="text-sm opacity-70 truncate">{{ review.content || "No content" }}</p>
              <p class="text-xs opacity-40 mt-0.5">{{ formatDate(review.createdAt) }}</p>
            </td>
            <td>
              <span class="badge badge-sm" :class="statusBadge(review.status)">
                {{ review.status }}
              </span>
            </td>
            <td class="text-sm text-center">{{ review.helpfulCount }}</td>
            <td>
              <div class="flex items-center gap-1">
                <button
                  v-if="review.status !== 'published'"
                  class="btn btn-ghost btn-xs"
                  title="Publish"
                  :disabled="updating === review.id"
                  @click="updateStatus(review.id, 'published')"
                >
                  <CheckCircle class="w-3.5 h-3.5 text-success" />
                </button>
                <button
                  v-if="review.status !== 'hidden'"
                  class="btn btn-ghost btn-xs"
                  title="Hide"
                  :disabled="updating === review.id"
                  @click="updateStatus(review.id, 'hidden')"
                >
                  <EyeOff class="w-3.5 h-3.5 opacity-60" />
                </button>
                <button
                  v-if="review.status !== 'flagged'"
                  class="btn btn-ghost btn-xs"
                  title="Flag"
                  :disabled="updating === review.id"
                  @click="updateStatus(review.id, 'flagged')"
                >
                  <Flag class="w-3.5 h-3.5 text-warning" />
                </button>
                <button
                  v-if="review.status === 'hidden'"
                  class="btn btn-ghost btn-xs"
                  title="Unhide"
                  :disabled="updating === review.id"
                  @click="updateStatus(review.id, 'published')"
                >
                  <Eye class="w-3.5 h-3.5 text-primary" />
                </button>
                <button
                  class="btn btn-ghost btn-xs text-error"
                  title="Delete"
                  :disabled="updating === review.id"
                  @click="deleteReview(review.id)"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-6">
      <button
        class="btn btn-sm btn-outline gap-1"
        :disabled="page <= 1"
        @click="page--; refresh()"
      >
        <ChevronLeft class="w-4 h-4" />
        Previous
      </button>
      <span class="text-sm opacity-60 px-3">
        Page {{ page }} of {{ totalPages }}
      </span>
      <button
        class="btn btn-sm btn-outline gap-1"
        :disabled="page >= totalPages"
        @click="page++; refresh()"
      >
        Next
        <ChevronRight class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>
