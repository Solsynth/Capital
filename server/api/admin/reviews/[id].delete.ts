import { requireAdmin } from "#server/utils/admin"
import { getReviewById, deleteReview } from "#server/utils/products"

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = getRouterParam(event, "id")
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "Missing review ID" })
  }

  const review = await getReviewById(id)
  if (!review) {
    throw createError({ statusCode: 404, statusMessage: "Review not found" })
  }

  await deleteReview(id)
  return { success: true }
})
