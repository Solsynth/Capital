import { getReleasesForProduct } from "#server/utils/products"

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug")
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: "Missing slug parameter" })
  }

  const query = getQuery(event)
  const limit = Math.min(Number(query.limit) || 20, 100)
  const offset = Number(query.offset) || 0

  const releases = await getReleasesForProduct(slug, { limit, offset })
  return { releases }
})
