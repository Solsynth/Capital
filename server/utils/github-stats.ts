import { db } from '~~/server/utils/db'
import { githubStats } from '~~/server/db/schema'
import { eq } from 'drizzle-orm'
import { graphqlQuery } from '~~/server/utils/github'

const STALE_MS = 24 * 60 * 60 * 1000 // 24 hours

const pending = new Set<number>()
const heatmapPending = new Set<number>()

export interface GithubContributionStats {
  prCount: number
  issueCount: number
  commitCount: number
}

export interface HeatmapDay {
  date: string
  count: number
}

const GITHUB_ORG = 'solsynth'

export async function getGithubStats(githubUserId: number, githubUsername: string): Promise<GithubContributionStats> {
  const [row] = await db
    .select()
    .from(githubStats)
    .where(eq(githubStats.githubUserId, githubUserId))
    .limit(1)

  const now = Date.now()
  const fresh = row && (now - new Date(row.updatedAt).getTime()) < STALE_MS

  if (fresh) {
    return { prCount: row.prCount, issueCount: row.issueCount, commitCount: row.commitCount }
  }

  if (!pending.has(githubUserId)) {
    pending.add(githubUserId)
    refreshGithubStats(githubUserId, githubUsername).finally(() => pending.delete(githubUserId))
  }

  return {
    prCount: row?.prCount ?? 0,
    issueCount: row?.issueCount ?? 0,
    commitCount: row?.commitCount ?? 0,
  }
}

export async function getHeatmap(githubUserId: number, githubUsername: string): Promise<HeatmapDay[]> {
  const [row] = await db
    .select()
    .from(githubStats)
    .where(eq(githubStats.githubUserId, githubUserId))
    .limit(1)

  const now = Date.now()
  const fresh = row?.heatmapUpdatedAt && (now - new Date(row.heatmapUpdatedAt).getTime()) < STALE_MS

  if (fresh && row.heatmapData) {
    return JSON.parse(row.heatmapData)
  }

  if (!heatmapPending.has(githubUserId)) {
    heatmapPending.add(githubUserId)
    refreshHeatmap(githubUserId, githubUsername).finally(() => heatmapPending.delete(githubUserId))
  }

  return row?.heatmapData ? JSON.parse(row.heatmapData) : []
}

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

const HEATMAP_QUERY = `
  query ($username: String!) {
    user(login: $username) {
      contributionsCollection {
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

interface RepoContributions {
  repository: { name: string; owner: { login: string } }
  contributions: { nodes: { occurredAt: string; commitCount: number }[] }
}

async function refreshGithubStats(githubUserId: number, githubUsername: string): Promise<void> {
  try {
    const data = await graphqlQuery<{ user: { contributionsCollection: any } }>(
      CONTRIBUTIONS_QUERY,
      { username: githubUsername }
    )

    const c = data.user.contributionsCollection
    const prCount = c.totalPullRequestContributions
    const issueCount = c.totalIssueContributions
    const commitCount = c.totalCommitContributions

    await db
      .insert(githubStats)
      .values({ githubUserId, githubUsername, prCount, issueCount, commitCount })
      .onConflictDoUpdate({
        target: githubStats.githubUserId,
        set: { prCount, issueCount, commitCount, githubUsername, updatedAt: new Date() },
      })
  } catch {
    // silently fail — stale data is still served
  }
}

async function refreshHeatmap(githubUserId: number, githubUsername: string): Promise<void> {
  try {
    const data = await graphqlQuery<{ user: { contributionsCollection: { commitContributionsByRepository: RepoContributions[] } } }>(
      HEATMAP_QUERY,
      { username: githubUsername }
    )

    const repos = data.user.contributionsCollection.commitContributionsByRepository
    const byDate: Record<string, number> = {}

    for (const repo of repos) {
      if (repo.repository.owner.login !== GITHUB_ORG) continue
      for (const node of repo.contributions.nodes) {
        const day = node.occurredAt.slice(0, 10)
        byDate[day] = (byDate[day] ?? 0) + node.commitCount
      }
    }

    const heatmap: HeatmapDay[] = Object.entries(byDate)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))

    const now = new Date()
    await db
      .update(githubStats)
      .set({ heatmapData: JSON.stringify(heatmap), heatmapUpdatedAt: now })
      .where(eq(githubStats.githubUserId, githubUserId))
  } catch {
    // silently fail
  }
}
