import { requireAdmin } from "#server/utils/admin"
import { updateRelease } from "#server/utils/products"

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const slug = getRouterParam(event, "slug")
  const version = getRouterParam(event, "version")

  if (!slug || !version) {
    throw createError({ statusCode: 400, statusMessage: "Missing slug or version parameter" })
  }

  const body = await readBody(event)
  const updated = await updateRelease(slug, version, body)
  return { release: updated }
})
