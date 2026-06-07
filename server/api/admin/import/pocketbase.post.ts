import { db } from '~~/server/utils/db'
import { icpSite, icpIdentity } from '~~/server/db'
import { eq } from 'drizzle-orm'

interface PbRecord {
  id: string
  [key: string]: any
}

interface PbListResponse {
  page: number
  perPage: number
  totalItems: number
  totalPages: number
  items: PbRecord[]
}

async function fetchAllFromPb(pbUrl: string, collection: string): Promise<PbRecord[]> {
  const items: PbRecord[] = []
  let page = 1
  const perPage = 500

  while (true) {
    const res = await $fetch<PbListResponse>(
      `${pbUrl}/api/collections/${collection}/records`,
      { params: { page, perPage, sort: 'created' } },
    )
    items.push(...res.items)
    if (page >= res.totalPages) break
    page++
  }

  return items
}

function parsePbDate(val: any): Date | null {
  if (!val) return null
  // PocketBase uses space instead of T in ISO dates — fix for JS Date
  const d = new Date(String(val).replace(' ', 'T'))
  return isNaN(d.getTime()) ? null : d
}

function pbFileUrl(pbUrl: string, record: PbRecord, filename: string | null): string | null {
  if (!filename) return null
  return `${pbUrl}/api/files/${record.collectionId}/${record.id}/${filename}`
}

export default defineEventHandler(async () => {
  const pbUrl = process.env.NUXT_PUBLIC_PB_URL || process.env.PUBLIC_PB_URL
  if (!pbUrl) {
    throw createError({ statusCode: 400, statusMessage: 'PUBLIC_PB_URL not configured' })
  }

  let importedSites = 0
  let importedIdentities = 0
  let skippedSites = 0
  let skippedIdentities = 0

  // Import identities
  try {
    const identities = await fetchAllFromPb(pbUrl, 'icp_identities')

    for (const iden of identities) {
      const exists = await db
        .select({ id: icpIdentity.id })
        .from(icpIdentity)
        .where(eq(icpIdentity.id, iden.id))
        .then(r => r[0])

      if (exists) {
        skippedIdentities++
        continue
      }

      const iconUrl = pbFileUrl(pbUrl, iden, iden.icon)

      await db.insert(icpIdentity).values({
        id: iden.id,
        name: iden.name,
        type: 'organization', // Default, PocketBase has no type field
        description: iden.description || null,
        icon: iconUrl,
        userId: null,
      })
      importedIdentities++
    }
  }
  catch (e: any) {
    console.error('Failed to import identities from PocketBase:', e.message)
  }

  // Import sites
  try {
    const sites = await fetchAllFromPb(pbUrl, 'icp_sites')

    for (const site of sites) {
      const exists = await db
        .select({ id: icpSite.id })
        .from(icpSite)
        .where(eq(icpSite.id, site.id))
        .then(r => r[0])

      if (exists) {
        skippedSites++
        continue
      }

      const iconUrl = pbFileUrl(pbUrl, site, site.icon)

      // Handle categories: PocketBase returns array of strings
      const categories = Array.isArray(site.categories) && site.categories.length > 0
        ? JSON.stringify(site.categories)
        : null

      // approved_at can be empty string
      const approvedAt = parsePbDate(site.approved_at)

      await db.insert(icpSite).values({
        id: site.id,
        fillingNo: site.filling_no,
        domain: site.domain,
        name: site.name,
        description: site.description || null,
        siteUrl: site.site_url,
        icon: iconUrl,
        categories,
        approvedAt,
        identityId: site.identity || null,
        userId: null,
      })
      importedSites++
    }
  }
  catch (e: any) {
    console.error('Failed to import sites from PocketBase:', e.message)
  }

  return {
    success: true,
    identities: { imported: importedIdentities, skipped: skippedIdentities },
    sites: { imported: importedSites, skipped: skippedSites },
  }
})
