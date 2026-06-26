import { db } from '~~/server/utils/db'
import { cached } from '~~/server/utils/cache'

const SOLAR_API = 'https://api.solian.app'

export async function getSolarToken(userId: string): Promise<string | null> {
  const client = (db as any).$client
  const result = await client.query(
    'SELECT access_token FROM account WHERE user_id = $1 AND provider_id = $2 LIMIT 1',
    [userId, 'solian']
  )
  return result.rows?.[0]?.access_token ?? null
}

export async function getGithubConnection(userId: string) {
  return cached(`gh-conn:${userId}`, 5 * 60_000, async () => {
    const token = await getSolarToken(userId)
    if (!token) return null

    const response = await fetch(`${SOLAR_API}/passport/accounts/me/connections?provider=github`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    })
    if (!response.ok) return null

    const connections = await response.json()
    return connections?.[0] ?? null
  })
}

export async function getSolarUser(username: string) {
  return cached(`solar-user:${username}`, 10 * 60_000, async () => {
    const resp = await fetch(`${SOLAR_API}/passport/accounts/${username}`)
    if (!resp.ok) return null
    return resp.json()
  })
}

export async function fetchSolarApi(token: string, path: string) {
  const response = await fetch(`${SOLAR_API}${path}`, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  })
  if (!response.ok) {
    throw createError({
      statusCode: response.status,
      statusMessage: `Solar Network API error: ${response.statusText}`,
    })
  }
  return response.json()
}
