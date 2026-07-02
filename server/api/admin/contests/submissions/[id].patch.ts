import { db } from '~~/server/utils/db'
import { contestSubmission } from '~~/server/db'
import { requireAdmin } from '~~/server/utils/admin'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const { session } = await requireAdmin(event)

  const submissionId = event.context.params?.id as string
  const body = await readBody(event)

  if (!body.action || !['accepted', 'rejected'].includes(body.action)) {
    throw createError({ statusCode: 400, statusMessage: 'Action must be "accepted" or "rejected"' })
  }

  const existing = await db
    .select({ id: contestSubmission.id })
    .from(contestSubmission)
    .where(eq(contestSubmission.id, submissionId))
    .limit(1)

  if (existing.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Submission not found' })
  }

  await db.update(contestSubmission)
    .set({
      status: body.action,
      reviewNote: body.review_note || null,
      reviewedBy: session.user.id,
      reviewedAt: new Date(),
    })
    .where(eq(contestSubmission.id, submissionId))

  const updated = await db
    .select()
    .from(contestSubmission)
    .where(eq(contestSubmission.id, submissionId))
    .limit(1)
    .then(rows => rows[0])

  return { success: true, submission: updated }
})
