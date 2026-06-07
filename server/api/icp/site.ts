import { db } from '~~/server/utils/db'
import { icpSite, icpIdentity, user } from '~~/server/db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const fillingNo = (query.filling_no as string || '').trim()

  if (!fillingNo) {
    throw createError({ statusCode: 400, statusMessage: 'filling_no is required' })
  }

  try {
    const site = await db
      .select({
        id: icpSite.id,
        fillingNo: icpSite.fillingNo,
        domain: icpSite.domain,
        name: icpSite.name,
        description: icpSite.description,
        siteUrl: icpSite.siteUrl,
        icon: icpSite.icon,
        categories: icpSite.categories,
        approvedAt: icpSite.approvedAt,
        createdAt: icpSite.createdAt,
        updatedAt: icpSite.updatedAt,
        userId: icpSite.userId,
        identityId: icpSite.identityId,
        userName: user.name,
        userEmail: user.email,
        identityName: icpIdentity.name,
        identityDescription: icpIdentity.description,
        identityIcon: icpIdentity.icon,
      })
      .from(icpSite)
      .leftJoin(user, eq(icpSite.userId, user.id))
      .leftJoin(icpIdentity, eq(icpSite.identityId, icpIdentity.id))
      .where(eq(icpSite.fillingNo, fillingNo))
      .limit(1)
      .then(rows => rows[0])

    if (!site) {
      throw createError({ statusCode: 404, statusMessage: 'Site not found' })
    }

    return {
      site: {
        id: site.id,
        filling_no: site.fillingNo,
        domain: site.domain,
        name: site.name,
        description: site.description,
        site_url: site.siteUrl,
        icon: site.icon,
        categories: site.categories ? JSON.parse(site.categories) : null,
        approved_at: site.approvedAt?.toISOString() || null,
        created: site.createdAt.toISOString(),
        updated: site.updatedAt.toISOString(),
        iconUrl: site.icon || null,
        identity: site.identityId ? {
          id: site.identityId,
          name: site.identityName,
          description: site.identityDescription,
          icon: site.identityIcon,
          iconUrl: site.identityIcon || null,
        } : null,
        owner: site.userId ? {
          id: site.userId,
          name: site.userName,
          email: site.userEmail,
        } : null,
      },
    }
  }
  catch (e: any) {
    if (e?.statusCode) throw e
    console.error('Failed to fetch ICP site detail:', e)
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch site' })
  }
})
