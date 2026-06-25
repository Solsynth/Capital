import { auth } from '~~/server/utils/auth'
import { db } from '~~/server/utils/db'
import { isPostgres } from '~~/server/db'

const SOLAR_API = 'https://api.solian.app'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }

  // Access the underlying raw client through drizzle's $client
  // ponytail: direct client query, extract to helper if used elsewhere
  const client = (db as any).$client
  
  let token: string | undefined
  
  if (isPostgres) {
    const result = await client.query(
      'SELECT access_token FROM account WHERE user_id = $1 AND provider_id = $2 LIMIT 1',
      [session.user.id, 'solian']
    )
    token = result.rows?.[0]?.access_token
  } else {
    const stmt = client.prepare('SELECT access_token FROM account WHERE user_id = ? AND provider_id = ?')
    const row = stmt.get(session.user.id, 'solian') as { access_token?: string } | undefined
    token = row?.access_token
  }

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
