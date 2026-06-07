import { PutObjectCommand } from '@aws-sdk/client-s3'
import { randomUUID } from 'crypto'
import { db } from '~~/server/utils/db'
import { file } from '~~/server/db'
import { auth } from '~~/server/utils/auth'

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
]

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }

  const formData = await readMultipartFormData(event)
  if (!formData || formData.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No file provided' })
  }

  // Find the file field
  const fileField = formData.find(f => f.name === 'file')
  if (!fileField || !fileField.data || !fileField.filename) {
    throw createError({ statusCode: 400, statusMessage: 'Missing file field' })
  }

  // Validate mime type
  const mimeType = fileField.type || 'application/octet-stream'
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid file type: ${mimeType}. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`,
    })
  }

  // Validate file size
  if (fileField.data.length > MAX_FILE_SIZE) {
    throw createError({
      statusCode: 400,
      statusMessage: `File too large. Max size: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    })
  }

  // Optional: folder/prefix from form data
  const folderField = formData.find(f => f.name === 'folder')
  const folder = folderField?.data?.toString() || 'uploads'

  // Declare outside try so catch can reference them for error logging
  let key = ''
  let bucket = ''

  try {
    const s3 = getS3Client()
    bucket = getR2Bucket()

    // Generate unique key with universal prefix
    const ext = fileField.filename.split('.').pop() || 'bin'
    key = buildKey(folder, session.user.id, `${randomUUID()}.${ext}`)

    // Upload to R2
    await s3.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: fileField.data,
      ContentType: mimeType,
      ContentLength: fileField.data.length,
    }))

    // Build public URL
    const url = buildPublicUrl(key)

    // Save to database
    const fileId = randomUUID()
    await db.insert(file).values({
      id: fileId,
      key,
      name: fileField.filename,
      mimeType,
      size: fileField.data.length,
      bucket,
      url,
      userId: session.user.id,
    })

    return {
      id: fileId,
      key,
      name: fileField.filename,
      mimeType,
      size: fileField.data.length,
      url,
    }
  }
  catch (e: any) {
    if (e?.statusCode) throw e

    // Extract the actual R2/S3 error details
    const s3Error = e?.name === 'S3ServiceException'
      ? `${e.name}: ${e.message} (code: ${e.Code}, requestId: ${e.$metadata?.requestId})`
      : e.message || 'Unknown error'

    console.error('R2 upload failed:', { key, bucket, error: s3Error })
    throw createError({
      statusCode: 500,
      statusMessage: `Upload failed: ${s3Error}`,
    })
  }
})
