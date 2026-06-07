import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { db } from '~~/server/utils/db'
import { file } from '~~/server/db'
import { auth } from '~~/server/utils/auth'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'File ID is required' })
  }

  try {
    // Find file record
    const fileRecord = await db
      .select()
      .from(file)
      .where(and(eq(file.id, id), eq(file.userId, session.user.id)))
      .limit(1)
      .then(rows => rows[0])

    if (!fileRecord) {
      throw createError({ statusCode: 404, statusMessage: 'File not found' })
    }

    // Delete from R2
    const s3 = getS3Client()
    await s3.send(new DeleteObjectCommand({
      Bucket: fileRecord.bucket,
      Key: fileRecord.key,
    }))

    // Delete from database
    await db.delete(file).where(eq(file.id, id))

    return { success: true }
  }
  catch (e: any) {
    if (e?.statusCode) throw e
    console.error('Failed to delete file:', e)
    throw createError({ statusCode: 500, statusMessage: 'Failed to delete file' })
  }
})
