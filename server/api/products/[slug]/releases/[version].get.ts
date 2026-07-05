import { getReleaseByVersion } from "#server/utils/products"

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug")
  const version = getRouterParam(event, "version")

  if (!slug || !version) {
    throw createError({ statusCode: 400, statusMessage: "Missing slug or version parameter" })
  }

  const release = await getReleaseByVersion(slug, version)
  if (!release) {
    throw createError({ statusCode: 404, statusMessage: "Release not found" })
  }

  return { release }
})
