import { getDistributionProductId, getLatestDistributionRelease } from "#server/utils/distribution"

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug")
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: "Missing slug parameter" })
  }

  const productId = await getDistributionProductId(event, slug)
  const release = await getLatestDistributionRelease(slug, { productId })
  if (!release) {
    throw createError({ statusCode: 404, statusMessage: "No releases found for this product" })
  }

  return { release }
})
