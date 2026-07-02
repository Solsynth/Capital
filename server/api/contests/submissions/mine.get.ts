import { db } from '~~/server/utils/db'
import { contestSubmission } from '~~/server/db'
import { auth } from '~~/server/utils/auth'
import { eq, and } from 'drizzle-orm'
import { getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }

  const query = getQuery(event)
  const contestId = query.contest_id as string

  const where = contestId
    ? and(
        eq(contestSubmission.userId, session.user.id),
        eq(contestSubmission.contestId, contestId),
      )
    : eq(contestSubmission.userId, session.user.id)

  const submissions = await db
    .select()
    .from(contestSubmission)
    .where(where)

  return { submissions }
})
