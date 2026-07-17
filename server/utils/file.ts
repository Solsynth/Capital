import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { db } from './db'
import { file } from '~~/server/db'
import { and, inArray, lt, isNull } from 'drizzle-orm'

/**
 * Mark one or more files as "used" by updating their usedAt timestamp.
 * Call this whenever a file is linked to a record (identity, site, submission).
 */
export async function markFilesUsed(fileIds: (string | null | undefined)[]): Promise<void> {
  const ids = fileIds.filter(Boolean) as string[]
  if (ids.length === 0) return

  const now = new Date()
  await db.update(file)
    .set({
      usedAt: now,
      updatedAt: now,
    })
    .where(inArray(file.id, ids))
}

/**
 * Delete orphaned files that were uploaded but never linked to any record,
 * and have been sitting unused for more than the specified duration.
 * Also deletes them from the S3 bucket.
 *
 * @param olderThanMs - Minimum age in milliseconds (default: 24 hours)
 */
export async function cleanupOrphanedFiles(olderThanMs: number = 24 * 60 * 60 * 1000): Promise<number> {
  const cutoff = new Date(Date.now() - olderThanMs)

  // Find orphaned files
  const orphanedFiles = await db
    .select({ id: file.id, key: file.key, bucket: file.bucket })
    .from(file)
    .where(
      and(
        isNull(file.usedAt),
        lt(file.createdAt, cutoff),
      ),
    )

  if (orphanedFiles.length === 0) return 0

  // Delete from S3
  const s3 = getS3Client()
  let deletedCount = 0

  for (const f of orphanedFiles) {
    try {
      await s3.send(new DeleteObjectCommand({
        Bucket: f.bucket,
        Key: f.key,
      }))
    }
    catch (e) {
      console.error(`Failed to delete ${f.key} from S3:`, e)
    }
  }

  // Delete from database
  const ids = orphanedFiles.map(f => f.id)
  await db.delete(file).where(inArray(file.id, ids))

  return orphanedFiles.length
}
