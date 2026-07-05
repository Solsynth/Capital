import { deleteReview } from "#server/utils/products"
import { auth } from "#server/utils/auth"

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: "Not authenticated" })
  }

  const id = getRouterParam(event, "id")
  const slug = getRouterParam(event, "slug")

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "Missing review ID" })
  }

  // Import getReviewById to check ownership
  const { getReviewById } = await import("#server/utils/products")
  const existing = await getReviewById(id)
  if (!existing || existing.slug !== slug) {
    throw createError({ statusCode: 404, statusMessage: "Review not found" })
  }

  // Only owner or admin can delete
  if (existing.userId !== session.user?.id) {
    throw createError({ statusCode: 403, statusMessage: "Forbidden" })
  }

  await deleteReview(id)
  return { success: true }
})
