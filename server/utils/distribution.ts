const DEFAULT_DISTRIBUTION_API_BASE_URL = "https://api.solian.app/dist"

interface DistributionArtifact {
  id?: string
  platform?: string
  architecture?: string
  file_name?: string
  mime_type?: string
  size?: number
  hash?: string
  download_url?: string
  expired?: boolean
  uploaded_at?: string | null
  created_at?: string | null
}

interface DistributionRelease {
  id: string
  product_id?: string
  version: string
  channel?: string
  channels?: string[]
  release_notes?: string
  title?: string
  metadata?: Record<string, unknown>
  status?: string
  created_at?: string | null
  published_at?: string | null
  artifacts?: DistributionArtifact[]
}
interface DistributionListResponse {
  data?: DistributionRelease[]
}

 

export interface CapitalRelease {
  id: string
  slug: string
  version: string
  createdAt: string | null
  releasedAt: string | null
  title: string | null
  changelog: string
  downloadUrl: string | null
  isPrerelease: boolean
  minimumVersion: string | null
  status: string
  artifactsExpired: boolean
  artifacts: DistributionArtifact[]
}

function distributionBaseUrl(): string {
  return (process.env.DISTRIBUTION_API_BASE_URL || DEFAULT_DISTRIBUTION_API_BASE_URL).replace(/\/+$/, "")
}

function productIdForSlug(slug: string, productId?: string): string {
  const resolvedProductId = productId || process.env.DISTRIBUTION_PRODUCT_ID
  if (!resolvedProductId) {
    throw createError({
      statusCode: 503,
      statusMessage: `DistributionCenter product ID is not configured for ${slug}`,
    })
  }
  return resolvedProductId
}

export async function getDistributionProductId(event: H3Event, slug: string): Promise<string> {
  const product = await queryCollection(event, "products")
    .where("path", "LIKE", `%/products/%/${slug}`)
    .first()
  return productIdForSlug(slug, product?.distributionProductId)
}

async function distributionFetch<T>(slug: string, path: string, productId?: string): Promise<T> {
  const response = await fetch(
    `${distributionBaseUrl()}/products/${encodeURIComponent(productIdForSlug(slug, productId))}${path}`,
    { headers: { Accept: "application/json" } },
  )

  if (!response.ok) {
    const detail = await response.text().catch(() => "")
    throw createError({
      statusCode: response.status >= 500 ? 502 : response.status,
      statusMessage: `DistributionCenter request failed (${response.status})${detail ? `: ${detail.slice(0, 300)}` : ""}`,
    })
  }

  return await response.json() as T
}

function compareReleaseVersions(a: string, b: string): number {
  const parse = (version: string) => {
    const [core, build = ""] = version.replace(/^v/, "").split("+", 2)
    const coreParts = core.split(".").map((part) => Number.parseInt(part, 10) || 0)
    return { coreParts, build }
  }
  const left = parse(a)
  const right = parse(b)
  for (let index = 0; index < Math.max(left.coreParts.length, right.coreParts.length); index++) {
    const difference = (left.coreParts[index] || 0) - (right.coreParts[index] || 0)
    if (difference) return difference
  }
  if (left.build === right.build) return 0
  const leftParts = left.build.split(".")
  const rightParts = right.build.split(".")
  for (let index = 0; index < Math.max(leftParts.length, rightParts.length); index++) {
    const leftPart = leftParts[index]
    const rightPart = rightParts[index]
    if (leftPart === undefined) return -1
    if (rightPart === undefined) return 1
    const leftNumber = /^\\d+$/.test(leftPart)
    const rightNumber = /^\\d+$/.test(rightPart)
    if (leftNumber && rightNumber) {
      const difference = Number(leftPart) - Number(rightPart)
      if (difference) return difference
    } else if (leftPart !== rightPart) {
      return leftPart < rightPart ? -1 : 1
    }
  }
  return 0
}

function sortReleases(releases: CapitalRelease[]): CapitalRelease[] {
  return releases.sort((left, right) => {
    const leftDate = left.createdAt || left.releasedAt
    const rightDate = right.createdAt || right.releasedAt
    const leftTime = leftDate ? Date.parse(leftDate) : Number.NaN
    const rightTime = rightDate ? Date.parse(rightDate) : Number.NaN
    if (!Number.isNaN(leftTime) && !Number.isNaN(rightTime) && leftTime !== rightTime) {
      return rightTime - leftTime
    }
    if (!Number.isNaN(leftTime) !== !Number.isNaN(rightTime)) {
      return Number.isNaN(leftTime) ? 1 : -1
    }
    return compareReleaseVersions(right.version, left.version)
  })
}


function mapRelease(slug: string, release: DistributionRelease): CapitalRelease {
  const artifacts = release.artifacts || []
  const metadata = release.metadata || {}
  const primaryArtifact = artifacts.find((artifact) => !artifact.expired && artifact.download_url)
  const artifactsExpired = artifacts.length > 0 && artifacts.every((artifact) => artifact.expired)

  return {
    id: release.id,
    slug,
    version: release.version,
    createdAt: release.created_at || release.published_at || null,
    releasedAt: release.published_at || release.created_at || null,
    title: release.title || null,
    changelog: release.release_notes || "",
    downloadUrl: primaryArtifact?.download_url || null,
    isPrerelease: (release.channels || [release.channel]).some((channel) => channel && channel !== "stable"),
    minimumVersion: typeof metadata.minimum_version === "string" ? metadata.minimum_version : null,
    status: release.status || "published",
    artifactsExpired,
    artifacts,
  }
}

export async function getDistributionReleases(
  slug: string,
  opts: { limit?: number; offset?: number; productId?: string } = {},
): Promise<CapitalRelease[]> {
  const query = new URLSearchParams({
    channel: "stable",
    limit: String(opts.limit ?? 20),
    offset: String(opts.offset ?? 0),
  })
  const result = await distributionFetch<DistributionListResponse>(slug, `/releases?${query}`, opts.productId)
  return sortReleases((result.data || []).map((release) => mapRelease(slug, release)))
}

export async function getDistributionRelease(
  slug: string,
  version: string,
  productId?: string,
): Promise<CapitalRelease | null> {
  const releases = await getDistributionReleases(slug, { limit: 100, productId })
  return releases.find((release) => release.version === version || `v${release.version}` === version) || null
}

export async function getLatestDistributionRelease(
  slug: string,
  opts: { productId?: string } = {},
): Promise<CapitalRelease | null> {
  const [release] = await getDistributionReleases(slug, { limit: 100, productId: opts.productId })
  return release || null
}


