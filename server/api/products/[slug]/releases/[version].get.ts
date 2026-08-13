import { getDistributionProductId, getDistributionRelease } from "#server/utils/distribution"

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug")
  const version = getRouterParam(event, "version")
  if (!slug || !version) {
    throw createError({ statusCode: 400, statusMessage: "Missing slug or version parameter" })
  }
  const productId = await getDistributionProductId(event, slug)
  const release = await getDistributionRelease(slug, version, productId)
  if (!release) {
    throw createError({ statusCode: 404, statusMessage: "Release not found" })
  }

  return { release }
})
