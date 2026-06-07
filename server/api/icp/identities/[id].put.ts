import { db } from '~~/server/utils/db'
import { icpIdentity } from '~~/server/db'
import { auth } from '~~/server/utils/auth'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Identity ID is required' })
  }

  const body = await readBody(event)

  // Validate required fields
  if (!body.name || !body.type) {
    throw createError({ statusCode: 400, statusMessage: 'Name and type are required' })
  }

  // Validate type
  if (!['individual', 'organization'].includes(body.type)) {
    throw createError({ statusCode: 400, statusMessage: 'Type must be individual or organization' })
  }

  try {
    // Check if identity exists and belongs to user
    const existing = await db
      .select({ id: icpIdentity.id })
      .from(icpIdentity)
      .where(and(eq(icpIdentity.id, id), eq(icpIdentity.userId, session.user.id)))
      .limit(1)
      .then(rows => rows[0])

    if (!existing) {
      throw createError({ statusCode: 404, statusMessage: 'Identity not found' })
    }

    await db.update(icpIdentity)
      .set({
        name: body.name,
        type: body.type,
        description: body.description || null,
        icon: body.icon || null,
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
