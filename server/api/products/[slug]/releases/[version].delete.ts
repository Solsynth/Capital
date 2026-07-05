import { requireAdmin } from "#server/utils/admin"
import { deleteRelease } from "#server/utils/products"

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const slug = getRouterParam(event, "slug")
  const version = getRouterParam(event, "version")

  if (!slug || !version) {
    throw createError({ statusCode: 400, statusMessage: "Missing slug or version parameter" })
  }

  await deleteRelease(slug, version)
  return { success: true }
})
