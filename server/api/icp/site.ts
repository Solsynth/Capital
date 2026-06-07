import { db } from '~~/server/utils/db'
import { icpSite, icpIdentity, user, file } from '~~/server/db'
import { eq, aliasedTable } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const fillingNo = (query.filling_no as string || '').trim()

  if (!fillingNo) {
    throw createError({ statusCode: 400, statusMessage: 'filling_no is required' })
  }

  try {
    const identityIconFile = aliasedTable(file, 'identity_icon_file')

    const site = await db
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
        identityIconFileId: icpIdentity.iconFileId,
        identityIconUrl: identityIconFile.url,
      })
      .from(icpSite)
      .leftJoin(user, eq(icpSite.userId, user.id))
      .leftJoin(icpIdentity, eq(icpSite.identityId, icpIdentity.id))
      .leftJoin(file, eq(icpSite.iconFileId, file.id))
      .leftJoin(identityIconFile, eq(icpIdentity.iconFileId, identityIconFile.id))
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
        icon: site.iconUrl || site.icon,
        icon_file_id: site.iconFileId,
        categories: site.categories ? JSON.parse(site.categories) : null,
        approved_at: site.approvedAt?.toISOString() || null,
        created: site.createdAt.toISOString(),
        updated: site.updatedAt.toISOString(),
        iconUrl: site.iconUrl || site.icon || null,
        identity: site.identityId ? {
          id: site.identityId,
          name: site.identityName,
          description: site.identityDescription,
          icon: site.identityIconUrl || site.identityIcon,
          iconUrl: site.identityIconUrl || site.identityIcon || null,
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
