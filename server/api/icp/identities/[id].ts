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

  try {
    const identity = await db
      .select({
        id: icpIdentity.id,
        name: icpIdentity.name,
        type: icpIdentity.type,
        description: icpIdentity.description,
        icon: icpIdentity.icon,
        createdAt: icpIdentity.createdAt,
      })
      .from(icpIdentity)
      .where(and(eq(icpIdentity.id, id), eq(icpIdentity.userId, session.user.id)))
      .limit(1)
      .then(rows => rows[0])

    if (!identity) {
      throw createError({ statusCode: 404, statusMessage: 'Identity not found' })
    }

    return {
      identity: {
        id: identity.id,
        name: identity.name,
        type: identity.type,
        description: identity.description,
        icon: identity.icon,
        created: identity.createdAt.toISOString(),
      },
    }
  }
  catch (e: any) {
    if (e?.statusCode) throw e
    console.error('Failed to fetch identity:', e)
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch identity' })
  }
})
