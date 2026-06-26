import { createHmac } from 'crypto'
import { readFileSync } from 'fs'
import { db } from '~~/server/utils/db'
import { claSignature } from '~~/server/db/schema'
import { eq, and } from 'drizzle-orm'

function verifySignature(body: string, signature: string | undefined): boolean {
  const secret = process.env.GITHUB_WEBHOOK_SECRET
  if (!secret || !signature) return false

  const expected = `sha256=${createHmac('sha256', secret).update(body).digest('hex')}`
  const sigBuf = Buffer.from(signature)
  const expectedBuf = Buffer.from(expected)
  if (sigBuf.length !== expectedBuf.length) return false
  return require('crypto').timingSafeEqual(sigBuf, expectedBuf)
}

async function getGithubToken(): Promise<string> {
  const appId = process.env.GITHUB_APP_ID
  const keyPath = process.env.GITHUB_APP_PRIVATE_KEY_PATH
  const installationId = process.env.GITHUB_APP_INSTALLATION_ID

  if (!appId || !keyPath || !installationId) {
    throw new Error('Missing GITHUB_APP_* env vars')
  }

  const privateKey = readFileSync(keyPath, 'utf-8')
  const jwt = await createJwt(appId, privateKey)

  const resp = await fetch(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
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
  return data.token
}

async function createJwt(appId: string, privateKey: string): Promise<string> {
  // ponytail: use jose for JWT — already a transitive dep in Nuxt ecosystem
  const { SignJWT } = await import('jose').catch(() => {
    throw new Error('jose is required — install with: npm i jose')
  })
  const key = await import('jose').then(j => j.importPKCS8(privateKey, 'RS256'))
  return new SignJWT({})
    .setProtectedHeader({ alg: 'RS256' })
    .setIssuedAt()
    .setExpirationTime('10m')
    .setIssuer(appId)
    .sign(key)
}

function getClaVersion(): string {
  return CLA_VERSION
}

export default defineEventHandler(async (event) => {
  const rawBody = await readRawBody(event) ?? ''
  const sig = getHeader(event, 'x-hub-signature-256')

  if (!verifySignature(rawBody, sig)) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid signature' })
  }

  const payload = JSON.parse(rawBody)
  const ghEvent = getHeader(event, 'x-github-event')

  if (ghEvent !== 'pull_request') return { ok: true, skipped: true }

  const action = payload.action
  if (!['opened', 'synchronize', 'reopened'].includes(action)) {
    return { ok: true, skipped: true }
  }

  const pr = payload.pull_request
  const owner = payload.repository.owner.login
  const repo = payload.repository.name
  const sha = pr.head.sha
  const authorLogin = pr.user.login
  const prNumber = pr.number

  const claVersion = getClaVersion()

  const [match] = await db
    .select()
    .from(claSignature)
    .where(and(
      eq(claSignature.githubUsername, authorLogin),
      eq(claSignature.claVersion, claVersion),
    ))
    .limit(1)

  const signed = !!match
  const signUrl = 'https://capital.solsynth.dev/contributions/licensing'

  const token = await getGithubToken()

  // Set commit status
  await fetch(`https://api.github.com/repos/${owner}/${repo}/statuses/${sha}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      state: signed ? 'success' : 'failure',
      description: signed ? 'CLA signed' : 'CLA not signed',
      context: 'CLA',
      target_url: signed ? undefined : signUrl,
    }),
  })

  // Manage labels
  if (signed) {
    await fetch(`https://api.github.com/repos/${owner}/${repo}/issues/${prNumber}/labels/cla-not-signed`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
    }).catch(() => {})
    await fetch(`https://api.github.com/repos/${owner}/${repo}/issues/${prNumber}/labels`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ labels: ['cla-signed'] }),
    })
  } else {
    await fetch(`https://api.github.com/repos/${owner}/${repo}/issues/${prNumber}/labels/cla-signed`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
    }).catch(() => {})
    await fetch(`https://api.github.com/repos/${owner}/${repo}/issues/${prNumber}/labels`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ labels: ['cla-not-signed'] }),
    })
  }

  // Comment (only on first check — avoid spam)
  const commentsResp = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/issues/${prNumber}/comments?per_page=100`,
    { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' } }
  )
  const comments = await commentsResp.json()
  const alreadyCommented = (comments as any[]).some(
    (c: any) => c.user?.login === 'solsynth-bot[bot]' || c.body?.includes('<!-- cla-check -->')
  )

  if (!alreadyCommented) {
    const body = signed
      ? `<!-- cla-check -->\n✅ **CLA check passed** — @${authorLogin} has signed the Contributor License Agreement.`
      : `<!-- cla-check -->\n❌ **CLA check failed** — @${authorLogin} has not signed the Contributor License Agreement.\n\nPlease sign the CLA before this PR can be merged: [Sign CLA](${signUrl})`

    await fetch(`https://api.github.com/repos/${owner}/${repo}/issues/${prNumber}/comments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ body }),
    })
  }

  return { ok: true, signed }
})
