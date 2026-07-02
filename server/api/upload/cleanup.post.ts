import { auth } from '~~/server/utils/auth'
import { getIsAdmin } from '~~/server/utils/admin'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }

  const isAdmin = await getIsAdmin(session)
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
