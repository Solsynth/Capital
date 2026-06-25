import { db } from '~~/server/utils/db'
import { icpSite, icpIdentity, file } from '~~/server/db'
import { eq } from 'drizzle-orm'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { randomUUID } from 'crypto'
import { getS3Client, getR2Bucket, buildKey, buildPublicUrl } from '~~/server/utils/s3'

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
  const d = new Date(String(val).replace(' ', 'T'))
  return isNaN(d.getTime()) ? null : d
}

function pbFileUrl(pbUrl: string, record: PbRecord, filename: string | null): string | null {
  if (!filename) return null
  return `${pbUrl}/api/files/${record.collectionId}/${record.id}/${filename}`
}

function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  const mimeTypes: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
  }
  return mimeTypes[ext || ''] || 'application/octet-stream'
}

async function downloadAndUploadToR2(
  url: string,
  filename: string,
  folder: string
): Promise<{ fileId: string; url: string } | null> {
  try {
    // Download from PocketBase
    const response = await fetch(url)
    if (!response.ok) return null
    
    const buffer = Buffer.from(await response.arrayBuffer())
    const mimeType = getMimeType(filename)
    
    // Upload to R2
    const s3 = getS3Client()
    const bucket = getR2Bucket()
    const ext = filename.split('.').pop() || 'png'
    const key = buildKey(folder, `${randomUUID()}.${ext}`)
    
    await s3.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
      ContentLength: buffer.length,
    }))
    
    const publicUrl = buildPublicUrl(key)
    const fileId = randomUUID()
    
    // Save file record
    await db.insert(file).values({
      id: fileId,
      key,
      name: filename,
      mimeType,
      size: buffer.length,
      bucket,
      url: publicUrl,
      userId: null,
    })
    
    return { fileId, url: publicUrl }
  } catch (err) {
    console.error(`Failed to download/upload ${url}:`, err)
    return null
  }
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
  let uploadedAssets = 0

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

      // Download and upload icon to R2
      let iconUrl = null
      let iconFileId = null
      if (iden.icon) {
        const pbIconUrl = pbFileUrl(pbUrl, iden, iden.icon)
        if (pbIconUrl) {
          const result = await downloadAndUploadToR2(pbIconUrl, iden.icon, 'icp/identities')
          if (result) {
            iconUrl = result.url
            iconFileId = result.fileId
            uploadedAssets++
          }
        }
      }

      await db.insert(icpIdentity).values({
        id: iden.id,
        name: iden.name,
        type: 'organization',
        description: iden.description || null,
        icon: iconUrl,
        iconFileId,
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

      // Download and upload icon to R2
      let iconUrl = null
      let iconFileId = null
      if (site.icon) {
        const pbIconUrl = pbFileUrl(pbUrl, site, site.icon)
        if (pbIconUrl) {
          const result = await downloadAndUploadToR2(pbIconUrl, site.icon, 'icp/sites')
          if (result) {
            iconUrl = result.url
            iconFileId = result.fileId
            uploadedAssets++
          }
        }
      }

      const categories = Array.isArray(site.categories) && site.categories.length > 0
        ? JSON.stringify(site.categories)
        : null

      const approvedAt = parsePbDate(site.approved_at)

      await db.insert(icpSite).values({
        id: site.id,
        fillingNo: site.filling_no,
        domain: site.domain,
        name: site.name,
        description: site.description || null,
        siteUrl: site.site_url,
        icon: iconUrl,
        iconFileId,
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
    assetsUploaded: uploadedAssets,
  }
})
