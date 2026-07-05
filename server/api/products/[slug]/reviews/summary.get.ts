import { getReviewSummary } from "#server/utils/products"

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug")
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: "Missing slug parameter" })
  }

  const summary = await getReviewSummary(slug)
  return { summary }
})
