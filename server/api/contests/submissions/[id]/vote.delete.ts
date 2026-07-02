import { db } from '~~/server/utils/db'
import { contestVote } from '~~/server/db'
import { auth } from '~~/server/utils/auth'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }

  const submissionId = event.context.params?.id as string

  const existing = await db
    .select({ id: contestVote.id })
    .from(contestVote)
    .where(
      and(
        eq(contestVote.submissionId, submissionId),
        eq(contestVote.userId, session.user.id),
      ),
    )
    .limit(1)

  if (existing.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Vote not found' })
  }

  await db.delete(contestVote)
    .where(eq(contestVote.id, existing[0].id))

  return { success: true }
})
