import { auth } from '~~/server/utils/auth'
import { refreshSolarProfile } from '~~/server/utils/solarProfile'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }

  const profile = await refreshSolarProfile(session.user.id)
  if (!profile) {
    throw createError({ statusCode: 502, statusMessage: 'Failed to refresh Solar Network profile' })
  }

  return { success: true, profile }
})
