import { db } from '~~/server/utils/db'
import { icpIdentity } from '~~/server/db'
import { auth } from '~~/server/utils/auth'
import { eq, desc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }

  try {
    const identities = await db
      .select({
        id: icpIdentity.id,
        name: icpIdentity.name,
        type: icpIdentity.type,
        description: icpIdentity.description,
        icon: icpIdentity.icon,
        createdAt: icpIdentity.createdAt,
      })
      .from(icpIdentity)
      .where(eq(icpIdentity.userId, session.user.id))
      .orderBy(desc(icpIdentity.createdAt))

    return {
      identities: identities.map(identity => ({
        id: identity.id,
        name: identity.name,
        type: identity.type,
        description: identity.description,
        icon: identity.icon,
        created: identity.createdAt.toISOString(),
      })),
    }
  }
  catch (e) {
    console.error('Failed to fetch identities:', e)
    return { identities: [] }
  }
})
