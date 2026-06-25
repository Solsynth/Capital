import { db } from '~~/server/utils/db'
import { user, icpSubmission, icpSite, icpIdentity } from '~~/server/db'
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
    throw createError({ statusCode: 400, statusMessage: 'User ID is required' })
  }

  // Prevent self-deletion
  if (id === session.user.id) {
    throw createError({ statusCode: 400, statusMessage: 'Cannot delete your own account' })
  }

  try {
    // Check if user exists
    const existing = await db
      .select()
      .from(user)
      .where(eq(user.id, id))
      .limit(1)
      .then(rows => rows[0])

    if (!existing) {
      throw createError({ statusCode: 404, statusMessage: 'User not found' })
    }

    // Check if user has submissions or sites
    const [submissionCount] = await db
      .select({ count: db.$count })
      .from(icpSubmission)
      .where(eq(icpSubmission.userId, id))

    const [siteCount] = await db
      .select({ count: db.$count })
      .from(icpSite)
      .where(eq(icpSite.userId, id))

    if ((submissionCount?.count ?? 0) > 0 || (siteCount?.count ?? 0) > 0) {
      throw createError({ 
        statusCode: 409, 
        statusMessage: 'Cannot delete user with existing submissions or sites. Reassign them first.' 
      })
    }

    // Delete user (cascade will handle sessions and accounts)
    await db.delete(user).where(eq(user.id, id))

    return { success: true }
  }
  catch (e: any) {
    if (e?.statusCode) throw e
    console.error('Failed to delete user:', e)
    throw createError({ statusCode: 500, statusMessage: 'Failed to delete user' })
  }
})
