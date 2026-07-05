import { getReviewsForProduct } from "#server/utils/products"

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug")
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: "Missing slug parameter" })
  }

  const query = getQuery(event)
  const limit = Math.min(Number(query.limit) || 10, 50)
  const offset = Number(query.offset) || 0
  const sort = (query.sort as "newest" | "helpful") || "newest"

  const reviews = await getReviewsForProduct(slug, { limit, offset, sort })
  return { reviews }
})
