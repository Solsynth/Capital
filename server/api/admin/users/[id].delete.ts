import { db } from '~~/server/utils/db'
import { user, icpSubmission, icpSite, icpIdentity } from '~~/server/db'
import { requireAdmin } from '~~/server/utils/admin'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const { session } = await requireAdmin(event)

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
