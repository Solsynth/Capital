import { updateReview, getReviewById } from "#server/utils/products"
import { auth } from "#server/utils/auth"

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: "Not authenticated" })
  }

  const id = getRouterParam(event, "id")
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "Missing review ID" })
  }

  const slug = getRouterParam(event, "slug")

  // Get the review to check ownership
  const existing = await getReviewById(id)
  if (!existing || existing.slug !== slug) {
    throw createError({ statusCode: 404, statusMessage: "Review not found" })
  }

  // Only owner or admin can update
  if (existing.userId !== session.user?.id) {
    throw createError({ statusCode: 403, statusMessage: "Forbidden" })
  }

  const body = await readBody(event)
  const { rating, title, content, isRecommended } = body

  if (rating !== undefined && (typeof rating !== "number" || rating < 1 || rating > 5)) {
    throw createError({ statusCode: 400, statusMessage: "Rating must be an integer between 1 and 5" })
  }

  const updated = await updateReview(id, {
    rating: rating ?? existing.rating,
    title: title ?? existing.title,
    content: content ?? existing.content,
    isRecommended: isRecommended ?? existing.isRecommended,
  })

  return { review: updated }
})
