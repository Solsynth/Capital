import { db } from '~~/server/utils/db'
import { contribGithubStats, contribClaSignature, user } from '~~/server/db/schema'
import { desc, sql, eq, inArray } from 'drizzle-orm'

export default defineEventHandler(async () => {
  const rows = await db
    .select({
      githubUserId: contribGithubStats.githubUserId,
      githubUsername: contribGithubStats.githubUsername,
      userId: contribClaSignature.userId,
      prCount: contribGithubStats.prCount,
      issueCount: contribGithubStats.issueCount,
      commitCount: contribGithubStats.commitCount,
    })
    .from(contribGithubStats)
    .leftJoin(
      contribClaSignature,
      eq(contribClaSignature.githubUserId, contribGithubStats.githubUserId),
    )
    .orderBy(desc(sql`${contribGithubStats.prCount} * 5 + ${contribGithubStats.issueCount} * 3 + ${contribGithubStats.commitCount}`))
    .limit(50)

  const userIds = [...new Set(rows.map(r => r.userId).filter(Boolean))]
  const users = userIds.length > 0
    ? await db
        .select({
          id: user.id,
          solarProfile: user.solarProfile,
        })
        .from(user)
        .where(inArray(user.id, userIds as string[]))
    : []

  const profileMap = new Map(users.map(u => [u.id, u.solarProfile]))

  return {
    leaderboard: rows.map((row, i) => {
      const profile = row.userId ? profileMap.get(row.userId) : null
      return {
        rank: i + 1,
        githubUsername: row.githubUsername,
        solarUsername: (profile as any)?.name ?? null,
        solarDisplayName: (profile as any)?.nick ?? null,
        prCount: row.prCount,
        issueCount: row.issueCount,
        commitCount: row.commitCount,
      }
    }),
  }
})
