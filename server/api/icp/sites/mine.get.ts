import { db } from '~~/server/utils/db'
import { icpSite, icpIdentity } from '~~/server/db'
import { auth } from '~~/server/utils/auth'
import { eq, desc } from 'drizzle-orm'

/**
 * Every site the signed-in account owns, grouped by the identity it was filed
 * under. An account holds one individual and one organization identity, and
 * each site belongs to exactly one of them, so the owner needs this list to see
 * what they hold and to reach the edit form for a filing that has already been
 * approved.
 */
export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }

  try {
    const rows = await db
      .select({
        id: icpSite.id,
        fillingNo: icpSite.fillingNo,
        domain: icpSite.domain,
        name: icpSite.name,
        approvedAt: icpSite.approvedAt,
        createdAt: icpSite.createdAt,
        identityId: icpSite.identityId,
        identityName: icpIdentity.name,
        identityType: icpIdentity.type,
      })
      .from(icpSite)
      .leftJoin(icpIdentity, eq(icpSite.identityId, icpIdentity.id))
      .where(eq(icpSite.userId, session.user.id))
      .orderBy(desc(icpSite.createdAt))

    return {
      sites: rows.map(site => ({
        id: site.id,
        filling_no: site.fillingNo,
        domain: site.domain,
        name: site.name,
        approved: Boolean(site.approvedAt),
        created: site.createdAt.toISOString(),
        identity: site.identityId
          ? { id: site.identityId, name: site.identityName, type: site.identityType }
          : null,
      })),
    }
  }
  catch (e) {
    console.error('Failed to fetch owned ICP sites:', e)
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch your sites' })
  }
})
