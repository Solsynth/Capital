import { db } from '~~/server/utils/db'
import { contestSubmission } from '~~/server/db'
import { eq, sql, and } from 'drizzle-orm'
import { getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const contestId = query.contest_id as string
  const sort = (query.sort as string) || 'newest'

  if (!contestId) {
    throw createError({ statusCode: 400, statusMessage: 'contest_id is required' })
  }

  const submissions = await db
    .select()
    .from(contestSubmission)
    .where(
      and(
        eq(contestSubmission.contestId, contestId),
        eq(contestSubmission.status, 'accepted'),
      ),
    )
    .orderBy(
      sort === 'newest'
        ? sql`${contestSubmission.createdAt} DESC`
        : sql`${contestSubmission.createdAt} ASC`,
    )

  return submissions
})
