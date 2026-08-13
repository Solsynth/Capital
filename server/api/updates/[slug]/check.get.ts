import { getDistributionProductId, getLatestDistributionRelease } from "#server/utils/distribution"

function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.replace(/^v/, "").split(".").map(Number)
  const parts2 = v2.replace(/^v/, "").split(".").map(Number)

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const a = parts1[i] ?? 0
    const b = parts2[i] ?? 0
    if (a > b) return 1
    if (a < b) return -1
  }
  return 0
}

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug")
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: "Missing slug parameter" })
  }

  const query = getQuery(event)
  const current = query.current as string | undefined

  const productId = await getDistributionProductId(event, slug)
  const release = await getLatestDistributionRelease(slug, { productId })
  if (!release) {
    return {
      updateAvailable: false,
      version: null,
    }
  }

  let updateAvailable = false
  let force = false

  if (current) {
    updateAvailable = compareVersions(release.version, current) > 0

    // Check minimum version for force update
    if (release.minimumVersion && compareVersions(current, release.minimumVersion) < 0) {
      force = true
      updateAvailable = true
    }
  }

  return {
    updateAvailable,
    force,
    version: release.version,
    releasedAt: release.releasedAt,
    downloadUrl: release.downloadUrl,
    changelog: release.changelog,
    isPrerelease: release.isPrerelease,
    minimumVersion: release.minimumVersion,
  }
})
