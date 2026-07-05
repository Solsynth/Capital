import { getLatestRelease } from "#server/utils/products"

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug")
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: "Missing slug parameter" })
  }

  const release = await getLatestRelease(slug)
  if (!release) {
    throw createError({ statusCode: 404, statusMessage: "No releases found" })
  }

  return {
    version: release.version,
    releasedAt: release.releasedAt,
    downloadUrl: release.downloadUrl,
    githubReleaseUrl: release.githubReleaseUrl,
    changelog: release.changelog,
    isPrerelease: release.isPrerelease,
    minimumVersion: release.minimumVersion,
  }
})
