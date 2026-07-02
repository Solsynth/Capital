import { db } from '~~/server/utils/db'
import { contestSubmission } from '~~/server/db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const submissionId = event.context.params?.id as string

  const submission = await db
    .select()
    .from(contestSubmission)
    .where(eq(contestSubmission.id, submissionId))
    .limit(1)
    .then(rows => rows[0])

  if (!submission) {
    throw createError({ statusCode: 404, statusMessage: 'Submission not found' })
  }

  const auth = event.context.session
  if (submission.status !== 'accepted') {
    if (!auth?.user || (auth.user.id !== submission.userId)) {
      throw createError({ statusCode: 404, statusMessage: 'Submission not found' })
    }
  }

  return submission
})
