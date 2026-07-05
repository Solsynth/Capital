import { getMyReview } from "#server/utils/products"
import { auth } from "#server/utils/auth"

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: "Not authenticated" })
  }

  const slug = getRouterParam(event, "slug")
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: "Missing slug parameter" })
  }

  const review = await getMyReview(slug, session.user.id)
  return { review: review ?? null }
})
