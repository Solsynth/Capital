import { db } from '~~/server/utils/db'
import { icpIdentity, icpSite } from '~~/server/db'
import { requireAdmin } from '~~/server/utils/admin'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const { session } = await requireAdmin(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Identity ID is required' })
  }

  try {
    // Check if identity exists
    const existing = await db
      .select({ id: icpIdentity.id })
      .from(icpIdentity)
      .where(eq(icpIdentity.id, id))
      .limit(1)
      .then(rows => rows[0])

    if (!existing) {
      throw createError({ statusCode: 404, statusMessage: 'Identity not found' })
    }

    // Check if identity is used by any sites
    const sitesUsingIdentity = await db
      .select({ id: icpSite.id })
      .from(icpSite)
      .where(eq(icpSite.identityId, id))
      .limit(1)

    if (sitesUsingIdentity.length > 0) {
      throw createError({ statusCode: 409, statusMessage: 'Cannot delete identity that is used by sites' })
    }

    await db.delete(icpIdentity).where(eq(icpIdentity.id, id))

    return { success: true }
  }
  catch (e: any) {
    if (e?.statusCode) throw e
    console.error('Failed to delete identity:', e)
    throw createError({ statusCode: 500, statusMessage: 'Failed to delete identity' })
  }
})
