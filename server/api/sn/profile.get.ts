import { auth } from '~~/server/utils/auth'
import { getSolarToken, fetchSolarApi } from '~~/server/utils/sn'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }

  const token = await getSolarToken(session.user.id)
  if (!token) {
    throw createError({ statusCode: 400, statusMessage: 'No Solar Network account linked' })
  }

  try {
    return await fetchSolarApi(token, '/passport/accounts/me')
  } catch (e: any) {
    if (e.statusCode) throw e
    throw createError({ statusCode: 502, statusMessage: 'Failed to fetch Solar Network profile' })
  }
})
