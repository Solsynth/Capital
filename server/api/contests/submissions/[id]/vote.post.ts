import { db } from '~~/server/utils/db'
import { contestVote, contestState } from '~~/server/db'
import { auth } from '~~/server/utils/auth'
import { eq, and, sql } from 'drizzle-orm'
import { randomUUID } from 'crypto'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }

  const submissionId = event.context.params?.id as string

  const body = await readBody(event)
  const { creativity, functionality, integration, is_positive } = body

  if (!creativity || !functionality || !integration || is_positive === undefined) {
    throw createError({ statusCode: 400, statusMessage: 'creativity, functionality, integration, and vote polarity are required' })
  }

  if (creativity < 1 || creativity > 5 || functionality < 1 || functionality > 5 || integration < 1 || integration > 5) {
    throw createError({ statusCode: 400, statusMessage: 'Scores must be between 1 and 5' })
  }

  // Check if contest is in voting phase
  const submission = await db
    .select({ contestId: contestSubmission.contestId })
    .from(contestSubmission)
    .where(eq(contestSubmission.id, submissionId))
    .limit(1)
    .then(rows => rows[0])

  if (!submission) {
    throw createError({ statusCode: 404, statusMessage: 'Submission not found' })
  }

  const state = await db
    .select()
    .from(contestState)
    .where(eq(contestState.contestId, submission.contestId))
    .limit(1)
    .then(rows => rows[0])

  if (!state || !state.votingEnabled) {
    throw createError({ statusCode: 403, statusMessage: 'Voting is not currently open' })
  }

  // Check for existing vote from this user
  const existing = await db
    .select()
    .from(contestVote)
    .where(
      and(
        eq(contestVote.submissionId, submissionId),
        eq(contestVote.userId, session.user.id),
      ),
    )
    .limit(1)

  if (existing.length > 0) {
    await db.update(contestVote)
      .set({
        creativity,
        functionality,
        integration,
        isPositive: is_positive,
      })
      .where(eq(contestVote.id, existing[0].id))

    const vote = await db
      .select()
      .from(contestVote)
      .where(eq(contestVote.id, existing[0].id))
      .limit(1)
      .then(rows => rows[0])

    return { success: true, vote, updated: true }
  }

  const voteId = randomUUID()

  await db.insert(contestVote).values({
    id: voteId,
    submissionId,
    userId: session.user.id,
    creativity,
    functionality,
    integration,
    isPositive: is_positive,
  })

  const vote = await db
    .select()
    .from(contestVote)
    .where(eq(contestVote.id, voteId))
    .limit(1)
    .then(rows => rows[0])

  return { success: true, vote, updated: false }
})
