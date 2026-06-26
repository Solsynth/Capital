import { auth } from '~~/server/utils/auth'
import { db } from '~~/server/utils/db'
import { contribClaSignature, contribGithubStats, account } from '~~/server/db/schema'
import { eq, and } from 'drizzle-orm'
import { getGithubConnection, cacheSolarUser } from '~~/server/utils/sn'
import { graphqlQuery } from '~~/server/utils/github'

const MANUAL_REFRESH_COOLDOWN = 6 * 60 * 60 * 1000 // 6 hours

const GITHUB_ORG = 'solsynth'

const REFRESH_QUERY = `
  query ($username: String!) {
    user(login: $username) {
      contributionsCollection {
        totalPullRequestContributions
        totalIssueContributions
        totalCommitContributions
        commitContributionsByRepository(maxRepositories: 100) {
          repository {
            name
            owner { login }
          }
          contributions(first: 100) {
            nodes {
              occurredAt
              commitCount
            }
          }
        }
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

  // Check cooldown (skip in local dev)
  if (!process.env.CONTRIB_SKIP_COOLDOWN) {
    const [existing] = await db
    .select()
    .from(contribGithubStats)
    .where(eq(contribGithubStats.githubUserId, githubUserId))
    .limit(1)

  if (existing?.lastManualRefresh) {
    const elapsed = Date.now() - new Date(existing.lastManualRefresh).getTime()
    if (elapsed < MANUAL_REFRESH_COOLDOWN) {
      const remainingMinutes = Math.ceil((MANUAL_REFRESH_COOLDOWN - elapsed) / 60_000)
      throw createError({
        statusCode: 429,
        statusMessage: `Please wait ${remainingMinutes} minutes before refreshing again.`,
      })
    }
  }
  }

  // Fetch both stats + heatmap in one GraphQL call
  const data = await graphqlQuery<{ user: { contributionsCollection: any } }>(
    REFRESH_QUERY,
    { username: githubUsername }
  )

  const c = data.user.contributionsCollection
  const prCount = c.totalPullRequestContributions
  const issueCount = c.totalIssueContributions
  const commitCount = c.totalCommitContributions

  // Build heatmap from repo contributions
  const repos = c.commitContributionsByRepository
  console.log(`[refresh] ${githubUsername}: ${repos.length} repos, orgs: ${repos.map((r: any) => r.repository.owner.login).join(', ')}`)
  const byDate: Record<string, number> = {}

  for (const repo of repos) {
    if (repo.repository.owner.login.toLowerCase() !== GITHUB_ORG) continue
    for (const node of repo.contributions.nodes) {
      const day = node.occurredAt.slice(0, 10)
      byDate[day] = (byDate[day] ?? 0) + node.commitCount
    }
  }

  const heatmap = Object.entries(byDate)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))

  console.log(`[refresh] ${githubUsername}: ${heatmap.length} heatmap days, ${heatmap.reduce((s, d) => s + d.count, 0)} total commits`)

  // Resolve Solar account for caching
  const [solarAccount] = await db
    .select({ accountId: account.accountId })
    .from(account)
    .where(and(eq(account.userId, session.user.id), eq(account.providerId, 'solian')))
    .limit(1)
  const solarAccountId = solarAccount?.accountId ?? null
  const solarUsername = solarAccountId ? await cacheSolarUser(githubUsername, solarAccountId) : null

  const now = new Date()

  await db
    .insert(contribGithubStats)
    .values({
      githubUserId,
      githubUsername,
      solarUserId: solarAccountId,
      solarUsername,
      prCount,
      issueCount,
      commitCount,
      updatedAt: now,
      lastManualRefresh: now,
      heatmapData: JSON.stringify(heatmap),
      heatmapUpdatedAt: now,
    })
    .onConflictDoUpdate({
      target: contribGithubStats.githubUserId,
      set: {
        prCount,
        issueCount,
        commitCount,
        githubUsername,
        solarUserId: solarAccountId,
        solarUsername,
        updatedAt: now,
        lastManualRefresh: now,
        heatmapData: JSON.stringify(heatmap),
        heatmapUpdatedAt: now,
      },
    })

  return {
    prCount,
    issueCount,
    commitCount,
    heatmapDays: heatmap.length,
    updatedAt: now,
    nextRefreshAt: new Date(now.getTime() + MANUAL_REFRESH_COOLDOWN),
  }
})
