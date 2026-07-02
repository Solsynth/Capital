import { auth } from '#server/utils/auth'

export interface AdminCheckResult {
  session: any
  isAdmin: boolean
}

export async function requireAdmin(event: any): Promise<AdminCheckResult> {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }

  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean)

  if (adminEmails.length === 0) {
    if (import.meta.dev) {
      return { session, isAdmin: true }
    }
    throw createError({ statusCode: 403, statusMessage: 'Forbidden: ADMIN_EMAILS not configured' })
  }

  const isAdmin = adminEmails.includes(session.user.email)
  if (!isAdmin) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden: Admin access required' })
  }

  return { session, isAdmin: true }
}

export async function getIsAdmin(session: any): Promise<boolean> {
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean)
  if (adminEmails.length === 0) {
    return import.meta.dev
  }
  return adminEmails.includes(session.user.email)
}
