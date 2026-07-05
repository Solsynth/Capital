import { requireAdmin } from "#server/utils/admin"
import { retryGithubSync } from "#server/utils/product-release-sync"

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const slug = getRouterParam(event, "slug")
  const version = getRouterParam(event, "version")

  if (!slug || !version) {
    throw createError({ statusCode: 400, statusMessage: "Missing slug or version parameter" })
  }

  // Find the product to get its GitHub repo
  const product = await queryCollection("products")
    .where("path", "LIKE", `%/products/%/${slug}`)
    .first()

  const repo = product?.githubRepo || product?.repo
  if (!repo) {
    throw createError({ statusCode: 400, statusMessage: "Product has no linked GitHub repository" })
  }

  const updated = await retryGithubSync(slug, version, repo)
  return { release: updated }
})
