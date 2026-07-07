import { db } from "#server/utils/db"
import { productRelease, productReview, user } from "#server/db"
import { and, desc, eq, sql } from "drizzle-orm"

// ==================== Product Releases ====================

export interface CreateReleaseInput {
  slug: string
  version: string
  releasedAt: Date
  title?: string
  changelog?: string
  downloadUrl?: string
  githubReleaseUrl?: string
  githubReleaseId?: string
  isPrerelease?: boolean
  minimumVersion?: string
}

export interface UpdateReleaseInput {
  title?: string
  changelog?: string
  downloadUrl?: string
  githubReleaseUrl?: string
  githubReleaseId?: string
  githubSyncStatus?: string
  githubSyncError?: string
  isPrerelease?: boolean
  minimumVersion?: string
  releasedAt?: Date
}

export async function getReleasesForProduct(slug: string, opts?: { limit?: number; offset?: number }) {
  const limit = opts?.limit ?? 20
  const offset = opts?.offset ?? 0

  return db
    .select()
    .from(productRelease)
    .where(eq(productRelease.slug, slug))
    .orderBy(desc(productRelease.releasedAt))
    .limit(limit)
    .offset(offset)
}

export async function getLatestRelease(slug: string) {
  const [release] = await db
    .select()
    .from(productRelease)
    .where(eq(productRelease.slug, slug))
    .orderBy(desc(productRelease.releasedAt))
    .limit(1)

  return release ?? null
}

export async function getReleaseByVersion(slug: string, version: string) {
  const [release] = await db
    .select()
    .from(productRelease)
    .where(
      and(
        eq(productRelease.slug, slug),
        eq(productRelease.version, version),
      ),
    )
    .limit(1)

  return release ?? null
}

export async function createRelease(nanoid: string, data: CreateReleaseInput) {
  const [release] = await db
    .insert(productRelease)
    .values({
      id: nanoid,
      slug: data.slug,
      version: data.version,
      releasedAt: data.releasedAt,
      title: data.title,
      changelog: data.changelog ?? "",
      downloadUrl: data.downloadUrl,
      githubReleaseUrl: data.githubReleaseUrl,
      githubReleaseId: data.githubReleaseId,
      isPrerelease: data.isPrerelease ?? false,
      minimumVersion: data.minimumVersion,
      githubSyncStatus: data.githubReleaseId ? "synced" : "pending",
    })
    .returning()

  return release
}

export async function updateRelease(slug: string, version: string, data: UpdateReleaseInput) {
  const [release] = await db
    .update(productRelease)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(productRelease.slug, slug),
        eq(productRelease.version, version),
      ),
    )
    .returning()

  return release
}

export async function deleteRelease(slug: string, version: string) {
  await db
    .delete(productRelease)
    .where(
      and(
        eq(productRelease.slug, slug),
        eq(productRelease.version, version),
      ),
    )
}

// ==================== Product Reviews ====================

export interface CreateReviewInput {
  slug: string
  userId: string
  rating: number
  title?: string
  content?: string
  isRecommended?: boolean
}

export interface UpdateReviewInput {
  rating?: number
  title?: string
  content?: string
  isRecommended?: boolean
  status?: string
}

export async function getReviewsForProduct(slug: string, opts?: { limit?: number; offset?: number; sort?: "newest" | "helpful" }) {
  const limit = opts?.limit ?? 10
  const offset = opts?.offset ?? 0
  const sort = opts?.sort ?? "newest"

  const orderBy = sort === "helpful"
    ? [desc(productReview.helpfulCount), desc(productReview.createdAt)]
    : [desc(productReview.createdAt)]

  return db
    .select()
    .from(productReview)
    .where(
      and(
        eq(productReview.slug, slug),
        eq(productReview.status, "published"),
      ),
    )
    .orderBy(...orderBy)
    .limit(limit)
    .offset(offset)
}

export async function getReviewSummary(slug: string) {
  const [result] = await db
    .select({
      average: sql<number>`round(avg(${productReview.rating})::numeric, 1)`,
      count: sql<number>`count(*)::int`,
      fiveStar: sql<number>`count(*) filter (where ${productReview.rating} = 5)::int`,
      fourStar: sql<number>`count(*) filter (where ${productReview.rating} = 4)::int`,
      threeStar: sql<number>`count(*) filter (where ${productReview.rating} = 3)::int`,
      twoStar: sql<number>`count(*) filter (where ${productReview.rating} = 2)::int`,
      oneStar: sql<number>`count(*) filter (where ${productReview.rating} = 1)::int`,
    })
    .from(productReview)
    .where(
      and(
        eq(productReview.slug, slug),
        eq(productReview.status, "published"),
      ),
    )

  return result
}

export async function getReviewById(id: string) {
  const [review] = await db
    .select()
    .from(productReview)
    .where(eq(productReview.id, id))
    .limit(1)

  return review ?? null
}

export async function getMyReview(slug: string, userId: string) {
  const [review] = await db
    .select()
    .from(productReview)
    .where(
      and(
        eq(productReview.slug, slug),
        eq(productReview.userId, userId),
      ),
    )
    .limit(1)

  return review ?? null
}

export async function createReview(nanoid: string, data: CreateReviewInput) {
  const [review] = await db
    .insert(productReview)
    .values({
      id: nanoid,
      slug: data.slug,
      userId: data.userId,
      rating: data.rating,
      title: data.title,
      content: data.content ?? "",
      isRecommended: data.isRecommended,
    })
    .returning()

  return review
}

export async function updateReview(id: string, data: UpdateReviewInput) {
  const [review] = await db
    .update(productReview)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(productReview.id, id))
    .returning()

  return review
}

export async function deleteReview(id: string) {
  await db
    .delete(productReview)
    .where(eq(productReview.id, id))
}

export async function markHelpful(reviewId: string) {
  const [review] = await db
    .update(productReview)
    .set({
      helpfulCount: sql`${productReview.helpfulCount} + 1`,
    })
    .where(eq(productReview.id, reviewId))
    .returning()

  return review
}

export interface AdminReviewFilters {
  status?: string
  slug?: string
  limit?: number
  offset?: number
}

export async function getAllReviews(opts?: AdminReviewFilters) {
  const limit = opts?.limit ?? 25
  const offset = opts?.offset ?? 0

  const conditions = []
  if (opts?.status && opts.status !== "all") {
    conditions.push(eq(productReview.status, opts.status))
  }
  if (opts?.slug) {
    conditions.push(eq(productReview.slug, opts.slug))
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  const rows = await db
    .select({
      id: productReview.id,
      slug: productReview.slug,
      userId: productReview.userId,
      rating: productReview.rating,
      title: productReview.title,
      content: productReview.content,
      isRecommended: productReview.isRecommended,
      helpfulCount: productReview.helpfulCount,
      status: productReview.status,
      createdAt: productReview.createdAt,
      updatedAt: productReview.updatedAt,
      userName: user.name,
      userEmail: user.email,
      userImage: user.image,
    })
    .from(productReview)
    .leftJoin(user, eq(productReview.userId, user.id))
    .where(whereClause)
    .orderBy(desc(productReview.createdAt))
    .limit(limit)
    .offset(offset)

  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(productReview)
    .where(whereClause)

  return { reviews: rows, total: countResult?.count ?? 0 }
}
