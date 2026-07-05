import { requireAdmin } from "#server/utils/admin"
import { publishRelease } from "#server/utils/product-release-sync"
import { getLatestRelease } from "#server/utils/products"

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const slug = getRouterParam(event, "slug")
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: "Missing slug parameter" })
  }

  const body = await readBody(event)
  const { version, releasedAt, title, changelog, downloadUrl, isPrerelease, minimumVersion, githubRepo, syncToGithub } = body

  if (!version || !releasedAt) {
    throw createError({ statusCode: 400, statusMessage: "version and releasedAt are required" })
  }

  // Fetch product from Nuxt Content to get repo info if not provided
  let repo = githubRepo
  if (!repo) {
    const product = await queryCollection("products")
      .where("path", "LIKE", `%/products/%/${slug}`)
      .first()
    repo = product?.githubRepo || product?.repo
  }

  const result = await publishRelease({
    slug,
    version,
    releasedAt: new Date(releasedAt),
    title,
    changelog,
    downloadUrl,
    isPrerelease,
    minimumVersion,
    githubRepo: repo,
    syncToGithub: syncToGithub ?? !!repo,
  })

  return result
})
