import { db } from '~~/server/utils/db'
import { icpSubmission, icpSite, icpIdentity } from '~~/server/db'
import { requireAdmin } from '~~/server/utils/admin'
import { eq, like, desc } from 'drizzle-orm'
import { randomUUID } from 'crypto'

export default defineEventHandler(async (event) => {
  const { session } = await requireAdmin(event)

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
        // Generate a filling number: YYYYNNNNN (year + 5-digit sequential)
        const year = new Date().getFullYear().toString()
        const lastSite = await db
          .select({ fillingNo: icpSite.fillingNo })
          .from(icpSite)
          .where(like(icpSite.fillingNo, `${year}%`))
          .orderBy(desc(icpSite.fillingNo))
          .limit(1)
          .then(rows => rows[0])

        const nextSeq = lastSite
          ? String(Number(lastSite.fillingNo.slice(4)) + 1).padStart(5, '0')
          : '00000'
        const fillingNo = `${year}${nextSeq}`

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
          icon: data.icon || null,
          iconFileId: data.icon_file_id || null,
          categories: data.categories ? JSON.stringify(data.categories) : null,
          approvedAt: new Date(),
          identityId,
          userId: submission.userId,
        })

        // Mark uploaded file as used
        if (data.icon_file_id) {
          await markFilesUsed([data.icon_file_id])
        }

        // Apply identity updates if included
        if (data.identity_name || data.identity_description || data.identity_icon_file_id) {
          const identityUpdate: any = {}
          if (data.identity_name) identityUpdate.name = data.identity_name
          if (data.identity_description) identityUpdate.description = data.identity_description
          if (data.identity_icon_file_id) {
            identityUpdate.iconFileId = data.identity_icon_file_id
            await markFilesUsed([data.identity_icon_file_id])
          }
          if (identityId && Object.keys(identityUpdate).length > 0) {
            await db.update(icpIdentity)
              .set(identityUpdate)
              .where(eq(icpIdentity.id, identityId))
          }
        }

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
            icon: data.icon || null,
            iconFileId: data.icon_file_id || null,
            categories: data.categories ? JSON.stringify(data.categories) : null,
            updatedAt: new Date(),
          })
          .where(eq(icpSite.id, submission.siteId))

        // Apply identity updates if included
        if (data.identity_name || data.identity_description || data.identity_icon_file_id) {
          const identityUpdate: any = {}
          if (data.identity_name) identityUpdate.name = data.identity_name
          if (data.identity_description) identityUpdate.description = data.identity_description
          if (data.identity_icon_file_id) {
            identityUpdate.iconFileId = data.identity_icon_file_id
            await markFilesUsed([data.identity_icon_file_id])
          }
          if (data.identity_id && Object.keys(identityUpdate).length > 0) {
            await db.update(icpIdentity)
              .set(identityUpdate)
              .where(eq(icpIdentity.id, data.identity_id))
          }
        }

        // Update submission
        await db.update(icpSubmission)
          .set({
            status: 'approved',
            reviewNote: body.note || null,
            reviewedAt: new Date(),
            reviewedBy: session.user.id,
          })
          .where(eq(icpSubmission.id, submission.id))

        // Mark uploaded file as used
        if (data.icon_file_id) {
          await markFilesUsed([data.icon_file_id])
        }

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
