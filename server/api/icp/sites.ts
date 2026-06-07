import { db } from '~~/server/utils/db'
import { icpSite, icpIdentity, user, file } from '~~/server/db'
import { eq, like, and, desc, isNotNull } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const searchQuery = (query.q as string || '').trim()

  try {
    const conditions = [isNotNull(icpSite.approvedAt)]

    if (searchQuery) {
      conditions.push(
        like(icpSite.domain, `%${searchQuery}%`),
        like(icpSite.name, `%${searchQuery}%`)
      )
    }

    const sites = await db
      .select({
        id: icpSite.id,
        fillingNo: icpSite.fillingNo,
        domain: icpSite.domain,
        name: icpSite.name,
        description: icpSite.description,
        siteUrl: icpSite.siteUrl,
        icon: icpSite.icon,
        iconFileId: icpSite.iconFileId,
        iconUrl: file.url,
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
      .leftJoin(file, eq(icpSite.iconFileId, file.id))
      .where(and(...conditions))
      .orderBy(desc(icpSite.createdAt))

    return {
      sites: sites.map(site => ({
        id: site.id,
        filling_no: site.fillingNo,
        domain: site.domain,
        name: site.name,
        description: site.description,
        site_url: site.siteUrl,
        icon: site.iconUrl || site.icon,
        iconFileId: site.iconFileId,
        approved: Boolean(site.approvedAt),
        iconUrl: site.iconUrl || site.icon || null,
      })),
    }
  }
  catch (e) {
    console.error('Failed to fetch ICP sites:', e)
    return { sites: [] }
  }
})
