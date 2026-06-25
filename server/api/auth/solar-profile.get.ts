import { auth } from '~~/server/utils/auth'
import { db } from '~~/server/utils/db'

const SOLAR_API = 'https://api.solian.app'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }

  const client = (db as any).$client
  const result = await client.query(
    'SELECT access_token FROM account WHERE user_id = $1 AND provider_id = $2 LIMIT 1',
    [session.user.id, 'solian']
  )
  const token = result.rows?.[0]?.access_token

  if (!token) {
    throw createError({ statusCode: 400, statusMessage: 'No Solar Network account linked' })
  }

  try {
    const response = await fetch(`${SOLAR_API}/passport/accounts/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        statusMessage: `Solar Network API error: ${response.statusText}`,
      })
    }

    const data = await response.json()
    return data
  } catch (e: any) {
    if (e.statusCode) throw e
    throw createError({ statusCode: 502, statusMessage: 'Failed to fetch Solar Network profile' })
  }
})
