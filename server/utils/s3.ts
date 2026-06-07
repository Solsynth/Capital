import { S3Client } from '@aws-sdk/client-s3'

let _client: S3Client | null = null

export function getS3Client(): S3Client {
  if (_client) return _client

  if (!process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
    throw new Error('Missing R2 credentials. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY')
  }

  _client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  })

  return _client
}

export function getR2Bucket(): string {
  return process.env.R2_BUCKET || 'capital'
}

export function getR2KeyPrefix(): string {
  return process.env.R2_KEY_PREFIX || ''
}

export function getR2PublicUrl(): string {
  return process.env.R2_PUBLIC_URL || ''
}

/**
 * Build a full object key with the universal prefix applied.
 * Example: buildKey("uploads", "user123", "abc.jpg")
 *   → "solsynth-capital/uploads/user123/abc.jpg" (if prefix is "solsynth-capital")
 *   → "uploads/user123/abc.jpg" (if prefix is "")
 */
export function buildKey(...parts: string[]): string {
  const prefix = getR2KeyPrefix()
  const path = parts.filter(Boolean).join('/')
  return prefix ? `${prefix}/${path}` : path
}

/**
 * Build the public URL for a given object key.
 * If R2_PUBLIC_URL is set (e.g. custom domain or R2.dev URL), uses that.
 * Otherwise falls back to the bucket's S3 endpoint.
 */
export function buildPublicUrl(key: string): string {
  const publicUrl = getR2PublicUrl()
  if (publicUrl) {
    return `${publicUrl.replace(/\/$/, '')}/${key}`
  }
  // Fallback to R2.dev public URL pattern
  const bucket = getR2Bucket()
  return `https://${bucket}.${process.env.R2_ACCOUNT_ID}.r2.dev/${key}`
}
