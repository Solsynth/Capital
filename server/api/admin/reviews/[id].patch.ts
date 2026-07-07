import { requireAdmin } from "#server/utils/admin"
import { getReviewById, updateReview } from "#server/utils/products"

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = getRouterParam(event, "id")
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "Missing review ID" })
  }

  const body = await readBody(event)
  const review = await getReviewById(id)
  if (!review) {
    throw createError({ statusCode: 404, statusMessage: "Review not found" })
  }

  const updated = await updateReview(id, {
    status: body.status,
    title: body.title,
    content: body.content,
  })

  return { review: updated }
})
