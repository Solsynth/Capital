import { db } from '~~/server/utils/db'
import { icpSite, file } from '~~/server/db'
import { auth } from '~~/server/utils/auth'
import { eq } from 'drizzle-orm'

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

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Site ID is required' })
  }

  const body = await readBody(event)

  try {
    // Check if site exists
    const existing = await db
      .select()
      .from(icpSite)
      .where(eq(icpSite.id, id))
      .limit(1)
      .then(rows => rows[0])

    if (!existing) {
      throw createError({ statusCode: 404, statusMessage: 'Site not found' })
    }

    // If iconFileId is provided, get the file URL
    let iconUrl = existing.icon
    if (body.iconFileId) {
      const fileRecord = await db
        .select()
        .from(file)
        .where(eq(file.id, body.iconFileId))
        .limit(1)
        .then(rows => rows[0])

      if (fileRecord) {
        iconUrl = fileRecord.url
      }
    } else if (body.icon === null) {
      // Remove icon
      iconUrl = null
    }

    // Update site
    await db.update(icpSite)
      .set({
        name: body.name ?? existing.name,
        domain: body.domain ?? existing.domain,
        description: body.description !== undefined ? body.description : existing.description,
        siteUrl: body.siteUrl ?? existing.siteUrl,
        icon: iconUrl,
        iconFileId: body.iconFileId !== undefined ? body.iconFileId : existing.iconFileId,
        categories: body.categories !== undefined ? JSON.stringify(body.categories) : existing.categories,
        updatedAt: new Date(),
      })
      .where(eq(icpSite.id, id))

    return { success: true }
  }
  catch (e: any) {
    if (e?.statusCode) throw e
    console.error('Failed to update site:', e)
    throw createError({ statusCode: 500, statusMessage: 'Failed to update site' })
  }
})
