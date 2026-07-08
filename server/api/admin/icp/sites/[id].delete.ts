import { db } from '~~/server/utils/db'
import { icpSite, icpSubmission } from '~~/server/db'
import { requireAdmin } from '~~/server/utils/admin'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const { session } = await requireAdmin(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Site ID is required' })
  }

  try {
    const existing = await db
      .select({ id: icpSite.id })
      .from(icpSite)
      .where(eq(icpSite.id, id))
      .limit(1)
      .then(rows => rows[0])

    if (!existing) {
      throw createError({ statusCode: 404, statusMessage: 'Site not found' })
    }

    // Detach submissions that reference this site
    await db.update(icpSubmission)
      .set({ siteId: null })
      .where(eq(icpSubmission.siteId, id))

    await db.delete(icpSite).where(eq(icpSite.id, id))

    return { success: true }
  }
  catch (e: any) {
    if (e?.statusCode) throw e
    console.error('Failed to delete site:', e)
    throw createError({ statusCode: 500, statusMessage: 'Failed to delete site' })
  }
})
