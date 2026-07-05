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
  createdAt: Date | string
  updatedAt: Date | string
  user?: {
    id: string
    name: string
    image: string | null
  }
}

interface ReviewSummary {
  average: number
  count: number
  fiveStar: number
  fourStar: number
  threeStar: number
  twoStar: number
  oneStar: number
}

export function useProductReviews(slug: string) {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const reviews = ref<Review[]>([])
  const summary = ref<ReviewSummary | null>(null)
  const page = ref(1)
  const totalPages = ref(1)
  const sort = ref<"newest" | "helpful">("newest")

  const limit = 10

  async function fetchReviews() {
    loading.value = true
    error.value = null
    try {
      const offset = (page.value - 1) * limit
      const data: any = await $fetch(`/api/products/${slug}/reviews`, {
        query: { limit, offset, sort: sort.value },
      })
      reviews.value = data.reviews || []
      totalPages.value = (data.reviews || []).length === limit ? page.value + 1 : page.value
    } catch (e: any) {
      error.value = e.message || "Failed to fetch reviews"
    } finally {
      loading.value = false
    }
  }

  async function fetchSummary() {
    try {
      const data: any = await $fetch(`/api/products/${slug}/reviews/summary`)
      summary.value = data.summary || null
    } catch {
      summary.value = null
    }
  }

  function setSort(newSort: "newest" | "helpful") {
    sort.value = newSort
    page.value = 1
    fetchReviews()
  }

  function nextPage() {
    page.value++
    fetchReviews()
  }

  function prevPage() {
    if (page.value > 1) {
      page.value--
      fetchReviews()
    }
  }

  async function refresh() {
    await Promise.all([fetchReviews(), fetchSummary()])
  }

  return {
    reviews: computed(() => reviews.value),
    summary: computed(() => summary.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    page: computed(() => page.value),
    totalPages: computed(() => totalPages.value),
    sort: computed(() => sort.value),
    fetchReviews,
    fetchSummary,
    setSort,
    nextPage,
    prevPage,
    refresh,
  }
}
