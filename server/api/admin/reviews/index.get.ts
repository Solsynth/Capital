import { requireAdmin } from "#server/utils/admin"
import { getAllReviews } from "#server/utils/products"

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const query = getQuery(event)
  const status = (query.status as string) || "all"
  const slug = query.slug as string | undefined
  const limit = Math.min(Number(query.limit) || 25, 100)
  const offset = Number(query.offset) || 0

  const result = await getAllReviews({ status, slug, limit, offset })
  return result
})
