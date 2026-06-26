import { createHmac, createPrivateKey } from 'crypto'
import { readFileSync } from 'fs'

const GITHUB_API = 'https://api.github.com'

async function createJwt(appId: string, privateKeyPem: string): Promise<string> {
  const { SignJWT } = await import('jose').catch(() => {
    throw new Error('jose is required — install with: npm i jose')
  })

  // ponytail: convert PKCS#1 → PKCS#8 if needed, jose only accepts PKCS#8
  const pkcs8 = createPrivateKey({ key: privateKeyPem, format: 'pem' }).export({ type: 'pkcs8', format: 'pem' }).toString()
  const key = await import('jose').then(j => j.importPKCS8(pkcs8, 'RS256'))

  return new SignJWT({})
    .setProtectedHeader({ alg: 'RS256' })
    .setIssuedAt()
    .setExpirationTime('10m')
    .setIssuer(appId)
    .sign(key)
}

// ponytail: single token cache per process. App tokens are installation-scoped and short-lived.
let cachedToken: { token: string; expires: number } | null = null

export async function getGithubAppToken(): Promise<string> {
  if (cachedToken && cachedToken.expires > Date.now()) return cachedToken.token

  const appId = process.env.GITHUB_APP_ID
  const keyPath = process.env.GITHUB_APP_PRIVATE_KEY_PATH
  const installationId = process.env.GITHUB_APP_INSTALLATION_ID

  if (!appId || !keyPath || !installationId) {
    throw new Error('Missing GITHUB_APP_* env vars')
  }

  const privateKey = readFileSync(keyPath, 'utf-8')
  const jwt = await createJwt(appId, privateKey)

  const resp = await fetch(
    `${GITHUB_API}/app/installations/${installationId}/access_tokens`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwt}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    }
  )

  if (!resp.ok) throw new Error(`GitHub token error: ${resp.status}`)
  const data = await resp.json()

  cachedToken = {
    token: data.token,
    expires: Date.now() + 50 * 60_000, // 50 min (tokens last 60 min)
  }

  return cachedToken.token
}

export async function graphqlQuery<T = any>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const token = await getGithubAppToken()

  const resp = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  })

  if (!resp.ok) throw new Error(`GitHub GraphQL error: ${resp.status}`)
  const data = await resp.json()

  if (data.errors?.length) {
    throw new Error(`GitHub GraphQL: ${data.errors[0].message}`)
  }

  return data.data as T
}
