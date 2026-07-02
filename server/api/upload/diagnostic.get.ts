import { auth } from '~~/server/utils/auth'
import { getIsAdmin } from '~~/server/utils/admin'
import { ListBucketsCommand, PutObjectCommand } from '@aws-sdk/client-s3'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }

  const isAdmin = await getIsAdmin(session)
  if (!isAdmin) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  try {
    const s3 = getS3Client()
    const bucket = getR2Bucket()
    const prefix = getR2KeyPrefix()

    const results: Record<string, any> = {}

    try {
      const listResult = await s3.send(new ListBucketsCommand({}))
      results.buckets = (listResult.Buckets || []).map(b => b.Name)
    }
    catch (e: any) {
      results.buckets_error = `${e.name}: ${e.message}`
    }

    try {
      const probeKey = prefix ? `${prefix}/.probe` : '.probe'
      await s3.send(new PutObjectCommand({
        Bucket: bucket,
        Key: probeKey,
        Body: Buffer.from('ok'),
        ContentType: 'text/plain',
      }))
      results.probe = { bucket, key: probeKey, status: 'write_ok' }
    }
    catch (e: any) {
      results.probe = {
        bucket,
        error: `${e.name}: ${e.message}`,
        code: e.Code,
        requestId: e.$metadata?.requestId,
      }
    }

    return {
      success: true,
      env: {
        R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID ? '✅ set' : '❌ missing',
        R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID ? '✅ set' : '❌ missing',
        R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY ? '✅ set' : '❌ missing',
        R2_BUCKET: process.env.R2_BUCKET || '❌ missing (default: capital)',
        R2_KEY_PREFIX: process.env.R2_KEY_PREFIX || '(empty)',
        R2_PUBLIC_URL: process.env.R2_PUBLIC_URL || '(empty)',
      },
      config: {
        bucket,
        keyPrefix: prefix || '(none)',
        bucketExists: results.buckets?.includes(bucket) ?? 'unknown',
        availableBuckets: results.buckets || [],
      },
      diagnostics: results,
    }
  }
  catch (e: any) {
    console.error('R2 diagnostic failed:', e)
    throw createError({ statusCode: 500, statusMessage: `Diagnostic failed: ${e.message}` })
  }
})
