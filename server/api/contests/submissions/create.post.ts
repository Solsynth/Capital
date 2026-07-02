import { db } from '~~/server/utils/db'
import { contestSubmission, contestState } from '~~/server/db'
import { auth } from '~~/server/utils/auth'
import { eq, and, sql } from 'drizzle-orm'
import { randomUUID } from 'crypto'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }

  const body = await readBody(event)
  const { contest_id, title, description, note, icon_file_id, screenshots, tags, repo_url } = body

  if (!contest_id || !title || !description || !repo_url) {
    throw createError({ statusCode: 400, statusMessage: 'Contest ID, title, description, and repository URL are required' })
  }

  const state = await db
    .select()
    .from(contestState)
    .where(eq(contestState.contestId, contest_id))
    .limit(1)
    .then(rows => rows[0])

  if (!state || !state.submissionEnabled) {
    throw createError({ statusCode: 403, statusMessage: 'Submissions are not currently open for this contest' })
  }

  const referralCode = randomUUID().slice(0, 8)

  const submissionData = {
    title,
    description,
    note: note || null,
    icon_file_id: icon_file_id || null,
    screenshots: screenshots || [],
    tags: tags || [],
    repo_url: repo_url || null,
  }

  const existing = await db
    .select({ id: contestSubmission.id })
    .from(contestSubmission)
    .where(
      and(
        eq(contestSubmission.contestId, contest_id),
        eq(contestSubmission.userId, session.user.id),
      ),
    )
    .limit(1)

  if (existing.length > 0) {
    throw createError({ statusCode: 409, statusMessage: 'You have already submitted to this contest' })
  }

  const submissionId = randomUUID()

  await db.insert(contestSubmission).values({
    id: submissionId,
    contestId: contest_id,
    status: 'pending',
    userId: session.user.id,
    referralCode,
    data: JSON.stringify(submissionData),
  })

  if (icon_file_id) {
    const { markFilesUsed } = await import('~~/server/utils/file')
    await markFilesUsed([icon_file_id])
  }

  return { success: true, id: submissionId, referral_code: referralCode }
})
