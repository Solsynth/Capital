import { auth } from '~~/server/utils/auth'
import { db } from '~~/server/utils/db'
import { claSignature, githubStats } from '~~/server/db/schema'
import { eq, and } from 'drizzle-orm'
import { getGithubConnection } from '~~/server/utils/sn'
import { graphqlQuery } from '~~/server/utils/github'

const MANUAL_REFRESH_COOLDOWN = 6 * 60 * 60 * 1000 // 6 hours

const CONTRIBUTIONS_QUERY = `
  query ($username: String!) {
    user(login: $username) {
      contributionsCollection {
        totalPullRequestContributions
        totalIssueContributions
        totalCommitContributions
      }
    }
  }
`

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }

  const connection = await getGithubConnection(session.user.id)
  if (!connection) {
    throw createError({ statusCode: 400, statusMessage: 'GitHub account not connected' })
  }

  const githubUserId = parseInt(String(connection.meta?.user_id ?? '0').replace(/^"|"$/g, ''))
  const githubUsername = String(connection.meta?.preferred_username ?? '').replace(/^"|"$/g, '')

  if (!githubUserId || !githubUsername) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid GitHub connection' })
  }

  // Check cooldown
  const [existing] = await db
    .select()
    .from(githubStats)
    .where(eq(githubStats.githubUserId, githubUserId))
    .limit(1)

  if (existing?.lastManualRefresh) {
    const elapsed = Date.now() - new Date(existing.lastManualRefresh).getTime()
    if (elapsed < MANUAL_REFRESH_COOLDOWN) {
      const remaining = Math.ceil((MANUAL_REFRESH_COOLDOWN - elapsed) / 60_000)
      throw createError({
        statusCode: 429,
        statusMessage: `Please wait ${remaining} minutes before refreshing again.`,
      })
    }
  }

  // Fetch fresh data
  const data = await graphqlQuery<{ user: { contributionsCollection: any } }>(
    CONTRIBUTIONS_QUERY,
    { username: githubUsername }
  )

  const c = data.user.contributionsCollection
  const prCount = c.totalPullRequestContributions
  const issueCount = c.totalIssueContributions
  const commitCount = c.totalCommitContributions
  const now = new Date()

  await db
    .insert(githubStats)
    .values({ githubUserId, githubUsername, prCount, issueCount, commitCount, updatedAt: now, lastManualRefresh: now })
    .onConflictDoUpdate({
      target: githubStats.githubUserId,
      set: { prCount, issueCount, commitCount, githubUsername, updatedAt: now, lastManualRefresh: now },
    })

  return { prCount, issueCount, commitCount, updatedAt: now }
})
