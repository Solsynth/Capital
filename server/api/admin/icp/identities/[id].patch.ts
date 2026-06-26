import { db } from '~~/server/utils/db'
import { icpIdentity, file } from '~~/server/db'
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
    throw createError({ statusCode: 400, statusMessage: 'Identity ID is required' })
  }

  const body = await readBody(event)

  try {
    // Check if identity exists
    const existing = await db
      .select()
      .from(icpIdentity)
      .where(eq(icpIdentity.id, id))
      .limit(1)
      .then(rows => rows[0])

    if (!existing) {
      throw createError({ statusCode: 404, statusMessage: 'Identity not found' })
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

    // Update identity
    await db.update(icpIdentity)
      .set({
        name: body.name ?? existing.name,
        type: body.type ?? existing.type,
        description: body.description !== undefined ? body.description : existing.description,
        icon: iconUrl,
        iconFileId: body.iconFileId !== undefined ? body.iconFileId : existing.iconFileId,
        userId: body.userId ?? existing.userId,
        updatedAt: new Date(),
      })
      .where(eq(icpIdentity.id, id))

    return { success: true }
  }
  catch (e: any) {
    if (e?.statusCode) throw e
    console.error('Failed to update identity:', e)
    throw createError({ statusCode: 500, statusMessage: 'Failed to update identity' })
  }
})
