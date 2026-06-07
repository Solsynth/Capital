import { db } from '~~/server/utils/db'
import { icpSubmission, icpSite, icpIdentity } from '~~/server/db'
import { auth } from '~~/server/utils/auth'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'crypto'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }

  // Check if user is admin
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean)
  const isAdmin = adminEmails.includes(session.user.email) || adminEmails.length === 0

  if (!isAdmin) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden: Admin access required' })
  }

  const body = await readBody(event)

  if (!body.submission_id || !body.action) {
    throw createError({ statusCode: 400, statusMessage: 'Submission ID and action are required' })
  }

  if (!['approve', 'reject'].includes(body.action)) {
    throw createError({ statusCode: 400, statusMessage: 'Action must be approve or reject' })
  }

  try {
    const submission = await db
      .select()
      .from(icpSubmission)
      .where(eq(icpSubmission.id, body.submission_id))
      .limit(1)
      .then(rows => rows[0])

    if (!submission) {
      throw createError({ statusCode: 404, statusMessage: 'Submission not found' })
    }

    if (submission.status !== 'pending') {
      throw createError({ statusCode: 400, statusMessage: 'Submission has already been reviewed' })
    }

    const data = JSON.parse(submission.data)

    if (body.action === 'approve') {
      // Create or update the site
      if (submission.type === 'create') {
        // Generate a filling number
        const fillingNo = `ROY-${Date.now().toString(36).toUpperCase()}-${randomUUID().slice(0, 4).toUpperCase()}`

        // Use the identity_id from submission data
        const identityId = data.identity_id || null

        // Create site
        const siteId = randomUUID()
        await db.insert(icpSite).values({
          id: siteId,
          fillingNo,
          domain: data.domain,
          name: data.name,
          description: data.description || null,
          siteUrl: data.site_url,
          categories: data.categories ? JSON.stringify(data.categories) : null,
          approvedAt: new Date(),
          identityId,
          userId: submission.userId,
        })

        // Update submission
        await db.update(icpSubmission)
          .set({
            status: 'approved',
            siteId,
            reviewNote: body.note || null,
            reviewedAt: new Date(),
            reviewedBy: session.user.id,
          })
          .where(eq(icpSubmission.id, submission.id))

        return { success: true, siteId, fillingNo }
      }
      else if (submission.type === 'update' && submission.siteId) {
        // Update existing site
        await db.update(icpSite)
          .set({
            domain: data.domain,
            name: data.name,
            description: data.description || null,
            siteUrl: data.site_url,
            categories: data.categories ? JSON.stringify(data.categories) : null,
            updatedAt: new Date(),
          })
          .where(eq(icpSite.id, submission.siteId))

        // Update submission
        await db.update(icpSubmission)
          .set({
            status: 'approved',
            reviewNote: body.note || null,
            reviewedAt: new Date(),
            reviewedBy: session.user.id,
          })
          .where(eq(icpSubmission.id, submission.id))

        return { success: true }
      }
    }
    else {
      // Reject
      await db.update(icpSubmission)
        .set({
          status: 'rejected',
          reviewNote: body.note || null,
          reviewedAt: new Date(),
          reviewedBy: session.user.id,
        })
        .where(eq(icpSubmission.id, submission.id))

      return { success: true }
    }
  }
  catch (e: any) {
    if (e?.statusCode) throw e
    console.error('Failed to review submission:', e)
    throw createError({ statusCode: 500, statusMessage: 'Failed to review submission' })
  }
})
