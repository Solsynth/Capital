import { createReview, getMyReview } from "#server/utils/products"
import { auth } from "#server/utils/auth"
import { nanoid } from "nanoid"

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: "Not authenticated" })
  }

  const slug = getRouterParam(event, "slug")
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: "Missing slug parameter" })
  }

  const body = await readBody(event)
  const { rating, title, content, isRecommended } = body

  // Validate rating
  if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
    throw createError({ statusCode: 400, statusMessage: "Rating must be an integer between 1 and 5" })
  }

  // Check if user already has a review
  const existing = await getMyReview(slug, session.user.id)
  if (existing) {
    throw createError({ statusCode: 409, statusMessage: "You have already reviewed this product" })
  }

  const review = await createReview(nanoid(), {
    slug,
    userId: session.user.id,
    rating,
    title: title || undefined,
    content: content || undefined,
    isRecommended: isRecommended ?? undefined,
  })

  return { review }
})
