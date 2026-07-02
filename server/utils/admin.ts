import { auth } from '#server/utils/auth'
import { db } from '#server/utils/db'
import { user } from '#server/db'
import { eq } from 'drizzle-orm'

export interface AdminCheckResult {
  session: any
  isAdmin: boolean
}

export async function requireAdmin(event: any): Promise<AdminCheckResult> {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }

  if (!await getIsAdmin(session)) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden: Admin access required' })
  }

  return { session, isAdmin: true }
}

export async function getIsAdmin(session: any): Promise<boolean> {
  if (!session) return false

  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean)
  if (adminEmails.length === 0) {
    return import.meta.dev
  }

  const [record] = await db
    .select({ isAdmin: user.isAdmin })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1)

  return record?.isAdmin ?? false
}
