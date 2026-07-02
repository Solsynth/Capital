import { db } from '~~/server/utils/db'
import { contestSubmission, contestState } from '~~/server/db'
import { auth } from '~~/server/utils/auth'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }

  const submissionId = event.context.params?.id as string
  const body = await readBody(event)

  const existing = await db
    .select()
    .from(contestSubmission)
    .where(eq(contestSubmission.id, submissionId))
    .limit(1)
    .then(rows => rows[0])

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Submission not found' })
  }

  if (existing.userId !== session.user.id) {
    throw createError({ statusCode: 403, statusMessage: 'You can only edit your own submissions' })
  }

  const state = await db
    .select()
    .from(contestState)
    .where(eq(contestState.contestId, existing.contestId))
    .limit(1)
    .then(rows => rows[0])

  if (!state || !state.submissionEnabled) {
    throw createError({ statusCode: 403, statusMessage: 'Submissions are not currently open for this contest' })
  }

  const { title, description, note, screenshots, tags, repo_url } = body

  if (!title || !description || !repo_url) {
    throw createError({ statusCode: 400, statusMessage: 'Title, description, and repository URL are required' })
  }

  const submissionData = {
    title,
    description,
    note: note || null,
    screenshots: screenshots || [],
    tags: tags || [],
    repo_url: repo_url || null,
  }

  await db.update(contestSubmission)
    .set({
      data: JSON.stringify(submissionData),
      status: 'pending',
      reviewNote: null,
      reviewedBy: null,
      reviewedAt: null,
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
