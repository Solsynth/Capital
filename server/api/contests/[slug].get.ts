import { db } from '~~/server/utils/db'
import { contestState, contestSubmission } from '~~/server/db'
import { eq, sql, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const slug = event.context.params?.slug as string

  const state = await db
    .select()
    .from(contestState)
    .where(eq(contestState.contestId, slug))
    .limit(1)
    .then(rows => rows[0] || null)

  const auth = event.context.session
  let userSubmission = null

  if (auth?.user) {
    userSubmission = await db
      .select()
      .from(contestSubmission)
      .where(
        and(
          eq(contestSubmission.contestId, slug),
          eq(contestSubmission.userId, auth.user.id),
        ),
      )
      .limit(1)
      .then(rows => rows[0] || null)
  }

  const submissionCount = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(contestSubmission)
    .where(
      and(
        eq(contestSubmission.contestId, slug),
        eq(contestSubmission.status, 'accepted'),
      ),
    )
    .then(rows => Number(rows[0]?.count ?? 0))

  return {
    state,
    submissionCount,
    userSubmission,
  }
})
