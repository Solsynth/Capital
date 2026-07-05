interface MyReview {
  id: string
  rating: number
  title: string | null
  content: string
  isRecommended: boolean | null
  helpfulCount: number
  createdAt: Date | string
  updatedAt: Date | string
}

export function useProductReviewSubmission(slug: string) {
  const loading = ref(false)
  const submitting = ref(false)
  const myReview = ref<MyReview | null>(null)
  const error = ref<string | null>(null)

  async function fetchMyReview() {
    loading.value = true
    error.value = null
    try {
      const data: any = await $fetch(`/api/products/${slug}/reviews/mine`)
      myReview.value = data.review || null
    } catch (e: any) {
      error.value = e.message || "Failed to fetch your review"
    } finally {
      loading.value = false
    }
  }

  async function submit(input: { rating: number; title?: string; content?: string; isRecommended?: boolean | null }) {
    submitting.value = true
    error.value = null
    try {
      const data: any = await $fetch(`/api/products/${slug}/reviews`, {
        method: "POST",
        body: input,
      })
      myReview.value = data.review
      return data.review
    } catch (e: any) {
      error.value = e.data?.statusMessage || e.message || "Failed to submit review"
      throw e
    } finally {
      submitting.value = false
    }
  }

  async function update(input: { rating: number; title?: string; content?: string; isRecommended?: boolean | null }) {
    if (!myReview.value) return
    submitting.value = true
    error.value = null
    try {
      const data: any = await $fetch(`/api/products/${slug}/reviews/${myReview.value.id}`, {
        method: "PUT",
        body: input,
      })
      myReview.value = data.review
      return data.review
    } catch (e: any) {
      error.value = e.data?.statusMessage || e.message || "Failed to update review"
      throw e
    } finally {
      submitting.value = false
    }
  }

  async function remove() {
    if (!myReview.value) return
    submitting.value = true
    error.value = null
    try {
      await $fetch(`/api/products/${slug}/reviews/${myReview.value.id}`, {
        method: "DELETE",
      })
      myReview.value = null
    } catch (e: any) {
      error.value = e.data?.statusMessage || e.message || "Failed to delete review"
      throw e
    } finally {
      submitting.value = false
    }
  }

  return {
    myReview: computed(() => myReview.value),
    loading: computed(() => loading.value),
    submitting: computed(() => submitting.value),
    error: computed(() => error.value),
    fetchMyReview,
    submit,
    update,
    remove,
  }
}
