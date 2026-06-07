import { auth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }

  // Admin only
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean)
  const isAdmin = adminEmails.includes(session.user.email) || adminEmails.length === 0

  if (!isAdmin) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden: Admin access required' })
  }

  try {
    const deleted = await cleanupOrphanedFiles()

    return {
      success: true,
      deleted,
      message: `Cleaned up ${deleted} orphaned file(s)`,
    }
  }
  catch (e: any) {
    console.error('Failed to clean up files:', e)
    throw createError({ statusCode: 500, statusMessage: 'Failed to clean up files' })
  }
})
