import { getDistributionProductId, getDistributionReleases } from "#server/utils/distribution"

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug")
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: "Missing slug parameter" })
  }

  const query = getQuery(event)
  const limit = Math.min(Number(query.limit) || 20, 100)
  const offset = Math.max(Number(query.offset) || 0, 0)
  const productId = await getDistributionProductId(event, slug)
  const releases = await getDistributionReleases(slug, { limit, offset, productId })
  return { releases }
})
