import { getReviewSummaries } from "#server/utils/products"

export default defineEventHandler(async (event) => {
  setHeader(event, "cache-control", "public, max-age=60, stale-while-revalidate=300")
  const query = getQuery(event)
  const rawSlugs = typeof query.slugs === "string" ? query.slugs : ""
  const slugs = [...new Set(rawSlugs.split(",").map(slug => slug.trim()).filter(Boolean))]

  if (slugs.length > 100) {
    throw createError({ statusCode: 400, statusMessage: "Too many product slugs" })
  }

  return { summaries: await getReviewSummaries(slugs) }
})
