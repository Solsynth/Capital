import { db } from '~~/server/utils/db'
import { icpSubmission, icpSite, icpIdentity } from '~~/server/db'
import { auth } from '~~/server/utils/auth'
import { eq, and, sql } from 'drizzle-orm'
import { randomUUID } from 'crypto'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }

  const body = await readBody(event)

  // Validate required fields
  if (!body.domain || !body.name || !body.site_url || !body.identity_id) {
    throw createError({ statusCode: 400, statusMessage: 'Domain, name, site URL, and identity are required' })
  }

  const type = body.type || 'create' // 'create' or 'update'

  // For update submissions, site_id is required
  if (type === 'update' && !body.site_id) {
    throw createError({ statusCode: 400, statusMessage: 'Site ID is required for update submissions' })
  }

  try {
    // Verify identity belongs to user
    const identity = await db
      .select({ id: icpIdentity.id })
      .from(icpIdentity)
      .where(and(eq(icpIdentity.id, body.identity_id), eq(icpIdentity.userId, session.user.id)))
      .limit(1)
      .then(rows => rows[0])

    if (!identity) {
      throw createError({ statusCode: 404, statusMessage: 'Identity not found or does not belong to you' })
    }

    // For create submissions, check if domain already exists
    if (type === 'create') {
      const existing = await db
        .select({ id: icpSite.id })
        .from(icpSite)
        .where(eq(icpSite.domain, body.domain))
        .limit(1)

      if (existing.length > 0) {
        throw createError({ statusCode: 409, statusMessage: 'A site with this domain already exists' })
      }
    }

    const submissionData: any = {
      domain: body.domain,
      name: body.name,
      description: body.description || null,
      site_url: body.site_url,
      categories: body.categories || null,
      identity_id: body.identity_id,
      icon_file_id: body.iconFileId || null,
    }

    // Include identity update fields if provided
    if (body.identity_name || body.identity_description || body.identity_icon_file_id) {
      submissionData.identity_name = body.identity_name || null
      submissionData.identity_description = body.identity_description || null
      submissionData.identity_icon_file_id = body.identity_icon_file_id || null
    }

    // Enforce max 3 pending submissions per user
    if (type === 'create') {
      const pendingCount = await db
        .select({ count: sql<number>`cast(count(*) as integer)` })
        .from(icpSubmission)
        .where(
          and(
            eq(icpSubmission.userId, session.user.id),
            eq(icpSubmission.status, 'pending'),
          ),
        )
        .then(rows => Number(rows[0]?.count ?? 0))

      if (pendingCount >= 3) {
        throw createError({
          statusCode: 429,
          statusMessage: 'You can only have up to 3 pending submissions at a time. Please wait for existing submissions to be reviewed.',
        })
      }
    }

    const submissionId = randomUUID()

    await db.insert(icpSubmission).values({
      id: submissionId,
      type,
      status: 'pending',
      siteId: type === 'update' ? body.site_id : null,
      userId: session.user.id,
      data: JSON.stringify(submissionData),
    })

    // Mark uploaded file as used
    if (body.iconFileId) {
      await markFilesUsed([body.iconFileId])
    }

    return { success: true, id: submissionId }
  }
  catch (e: any) {
    if (e?.statusCode) throw e
    console.error('Failed to create submission:', e)
    throw createError({ statusCode: 500, statusMessage: 'Failed to create submission' })
  }
})
