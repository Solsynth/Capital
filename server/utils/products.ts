import { db } from "#server/utils/db"
import { productReview, user } from "#server/db"
import { and, desc, eq, inArray, sql } from "drizzle-orm"


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

export interface ReviewSummary {
  average: number
  count: number
  fiveStar: number
  fourStar: number
  threeStar: number
  twoStar: number
  oneStar: number
}

export async function getReviewSummary(slug: string): Promise<ReviewSummary | null> {
  const [result] = await db
    .select({
      average: sql<string | number>`round(avg(${productReview.rating})::numeric, 1)`,
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

  if (!result) return null

  // Postgres numeric/avg often serializes as a string
  return {
    average: Number(result.average ?? 0),
    count: Number(result.count ?? 0),
    fiveStar: Number(result.fiveStar ?? 0),
    fourStar: Number(result.fourStar ?? 0),
    threeStar: Number(result.threeStar ?? 0),
    twoStar: Number(result.twoStar ?? 0),
    oneStar: Number(result.oneStar ?? 0),
  }
}

export async function getReviewSummaries(slugs: string[]): Promise<Record<string, ReviewSummary>> {
  if (slugs.length === 0) return {}

  const results = await db
    .select({
      slug: productReview.slug,
      average: sql<string | number>`round(avg(${productReview.rating})::numeric, 1)`,
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
        inArray(productReview.slug, slugs),
        eq(productReview.status, "published"),
      ),
    )
    .groupBy(productReview.slug)

  return Object.fromEntries(results.map(result => [
    result.slug,
    {
      average: Number(result.average ?? 0),
      count: Number(result.count ?? 0),
      fiveStar: Number(result.fiveStar ?? 0),
      fourStar: Number(result.fourStar ?? 0),
      threeStar: Number(result.threeStar ?? 0),
      twoStar: Number(result.twoStar ?? 0),
      oneStar: Number(result.oneStar ?? 0),
    },
  ]))
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
