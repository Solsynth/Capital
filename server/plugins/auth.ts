import { auth } from '~~/server/utils/auth'
import { db } from '~~/server/utils/db'
import { user as userTable } from '~~/server/db'
import { eq } from 'drizzle-orm'

const ADMIN_REFRESH_INTERVAL = 60 * 60 * 1000 // 1 hour

export default defineNitroPlugin(async (nitroApp) => {
  nitroApp.hooks.hook('request', async (event) => {
    const cookieHeader = getRequestHeader(event, 'cookie') || ''

    if (!cookieHeader) {
      event.context.session = null
      return
    }

    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      if (key && value) {
        acc[key] = decodeURIComponent(value)
      }
      return acc
    }, {} as Record<string, string>)

    const sessionToken = cookies['better-auth.session_token'] || cookies['__Secure-better-auth.session_token']
    if (!sessionToken) {
      event.context.session = null
      return
    }

    try {
      const session = await auth.api.getSession({
        headers: new Headers({ cookie: cookieHeader })
      })
      event.context.session = session

      if (session) {
        maybeAssignAdmin(session.user.id, session.user.email)
      }
    } catch (error) {
      console.error('[Auth Plugin] Error getting session:', error)
      event.context.session = null
    }
  })
})

const lastRefresh = new Map<string, number>()

async function maybeAssignAdmin(userId: string, email: string) {
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean)
  if (adminEmails.length === 0) return
  if (!adminEmails.includes(email)) return

  const now = Date.now()
  const last = lastRefresh.get(userId) ?? 0
  if (now - last < ADMIN_REFRESH_INTERVAL) return

  lastRefresh.set(userId, now)
  await db.update(userTable).set({ isAdmin: true }).where(eq(userTable.id, userId))
}
