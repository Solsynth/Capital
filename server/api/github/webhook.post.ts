import { createHmac } from 'crypto'
import { db } from '~~/server/utils/db'
import { contribClaSignature, contribPendingCheck } from '~~/server/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { CLA_VERSION } from '~~/server/utils/cla'
import { getGithubAppToken } from '~~/server/utils/github'

const LABEL = 'waiting-for-cla'
const SIGN_URL = 'https://capital.solsynth.dev/contributions/licensing'

function verifySignature(body: string, signature: string | undefined): boolean {
  const secret = process.env.GITHUB_WEBHOOK_SECRET
  if (!secret || !signature) return false

  const expected = `sha256=${createHmac('sha256', secret).update(body).digest('hex')}`
  const sigBuf = Buffer.from(signature)
  const expectedBuf = Buffer.from(expected)
  if (sigBuf.length !== expectedBuf.length) return false
  return require('crypto').timingSafeEqual(sigBuf, expectedBuf)
}

async function ghFetch(path: string, token: string, init?: RequestInit) {
  return fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      ...init?.headers,
    },
  })
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
  const repoPath = `/repos/${owner}/${repo}`

  const token = await getGithubAppToken()

  // Look up any CLA signature for this GitHub username
  const [existing] = await db
    .select()
    .from(contribClaSignature)
    .where(eq(contribClaSignature.githubUsername, authorLogin))
    .orderBy(desc(contribClaSignature.signedAt))
    .limit(1)

  const currentSigned = existing?.claVersion === CLA_VERSION

  // Case 1: CLA signed and current → silent pass
  if (currentSigned) {
    // Set success status
    await ghFetch(`${repoPath}/statuses/${sha}`, token, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        state: 'success',
        description: 'CLA signed',
        context: 'CLA',
      }),
    })

    // Remove waiting label if present
    await ghFetch(`${repoPath}/issues/${prNumber}/labels/${LABEL}`, token, {
      method: 'DELETE',
    }).catch(() => {})

    // Mark pending check as resolved
    await db
      .update(contribPendingCheck)
      .set({ status: 'resolved', resolvedAt: new Date() })
      .where(and(
        eq(contribPendingCheck.repoOwner, owner),
        eq(contribPendingCheck.repoName, repo),
        eq(contribPendingCheck.prNumber, prNumber),
      ))

    return { ok: true, signed: true, silent: true }
  }

  // Case 2 or 3: needs attention
  const hasOldVersion = existing && existing.claVersion !== CLA_VERSION

  // Record pending check
  await db
    .insert(contribPendingCheck)
    .values({
      githubUsername: authorLogin,
      repoOwner: owner,
      repoName: repo,
      prNumber,
      sha,
      status: 'pending',
    })
    .onConflictDoNothing()

  // Set failure status
  await ghFetch(`${repoPath}/statuses/${sha}`, token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      state: 'failure',
      description: 'CLA not signed',
      context: 'CLA',
      target_url: SIGN_URL,
    }),
  })

  // Add waiting label
  await ghFetch(`${repoPath}/issues/${prNumber}/labels`, token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ labels: [LABEL] }),
  }).catch(() => {})

  // Check if we already commented (avoid spam on synchronize)
  const commentsResp = await ghFetch(`${repoPath}/issues/${prNumber}/comments?per_page=100`, token)
  const comments = await commentsResp.json()
  const alreadyCommented = (comments as any[]).some(
    (c: any) => c.body?.includes('<!-- cla-check -->')
  )

  if (!alreadyCommented) {
    const body = hasOldVersion
      ? [
          `<!-- cla-check -->`,
          `👋 Thanks for your contribution!`,
          ``,
          `We found a previously signed Contributor License Agreement (CLA) for your GitHub account. However, a newer version of the CLA is now available and requires your acceptance before we can continue reviewing this pull request.`,
          ``,
          `Please sign in to Solarpass with the GitHub account that opened this pull request, then review and sign the latest version of the CLA:`,
          ``,
          `[Sign the CLA](${SIGN_URL})`,
          ``,
          `Once you've completed the process, this check will pass automatically.`,
          ``,
          `Please also make sure you've reviewed our [Code of Conduct](https://capital.solsynth.dev/legal/en/code-of-conduct).`,
          ``,
          `Thanks again for contributing!`,
        ].join('\n')
      : [
          `<!-- cla-check -->`,
          `👋 Thanks for your contribution!`,
          ``,
          `We couldn't find a signed Contributor License Agreement (CLA) for the GitHub account that opened this pull request.`,
          ``,
          `Before we can review or merge your contribution, please sign in to Solarpass with your GitHub account and sign the CLA:`,
          ``,
          `[Sign the CLA](${SIGN_URL})`,
          ``,
          `Please also make sure you've reviewed our [Code of Conduct](https://capital.solsynth.dev/legal/en/code-of-conduct).`,
          ``,
          `Once you've signed the CLA, this check will pass automatically.`,
          ``,
          `Thanks again for contributing!`,
        ].join('\n')

    await ghFetch(`${repoPath}/issues/${prNumber}/comments`, token, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body }),
    })
  }

  return { ok: true, signed: false }
})
