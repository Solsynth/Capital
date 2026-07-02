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

  const vote = await db
    .select()
    .from(contestVote)
    .where(
      and(
        eq(contestVote.submissionId, submissionId),
        eq(contestVote.userId, session.user.id),
      ),
    )
    .limit(1)
    .then(rows => rows[0] || null)

  return { vote }
})
