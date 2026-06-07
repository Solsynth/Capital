import { db } from '~~/server/utils/db'
import { icpIdentity, user } from '~~/server/db'
import { auth } from '~~/server/utils/auth'
import { desc, eq } from 'drizzle-orm'

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

  try {
    const identities = await db
      .select({
        id: icpIdentity.id,
        name: icpIdentity.name,
        type: icpIdentity.type,
        description: icpIdentity.description,
        icon: icpIdentity.icon,
        createdAt: icpIdentity.createdAt,
        userId: icpIdentity.userId,
        userName: user.name,
        userEmail: user.email,
      })
      .from(icpIdentity)
      .leftJoin(user, eq(icpIdentity.userId, user.id))
      .orderBy(desc(icpIdentity.createdAt))

    return {
      identities: identities.map(identity => ({
        id: identity.id,
        name: identity.name,
        type: identity.type,
        description: identity.description,
        icon: identity.icon,
        created: identity.createdAt.toISOString(),
        user: {
          id: identity.userId,
          name: identity.userName,
          email: identity.userEmail,
        },
      })),
    }
  }
  catch (e) {
    console.error('Failed to fetch identities:', e)
    return { identities: [] }
  }
})
