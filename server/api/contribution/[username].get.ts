import { db } from '~~/server/utils/db'
import { contribClaSignature, contribGithubStats, account } from '~~/server/db/schema'
import { eq, and, desc, sql } from 'drizzle-orm'
import { CLA_VERSION } from '~~/server/utils/cla'
import { getSolarUser } from '~~/server/utils/sn'
import { getGithubStats } from '~~/server/utils/github-stats'

const SOLAR_DRIVE = 'https://api.solian.app/drive/files'

function fileUrl(file: any, original = false): string | null {
  if (!file?.id) return null
  const base = `${SOLAR_DRIVE}/${file.id}`
  return original ? `${base}?original=1` : base
}

export default defineEventHandler(async (event) => {
  const username = getRouterParam(event, 'username')
  if (!username) {
    throw createError({ statusCode: 400, statusMessage: 'Username required' })
  }

  const solarUser = await getSolarUser(username)
  if (!solarUser) {
    throw createError({ statusCode: 404, statusMessage: 'User not found on Solar Network' })
  }

  const [linkedAccount] = await db
    .select()
    .from(account)
    .where(and(
      eq(account.providerId, 'solian'),
      eq(account.accountId, String(solarUser.id)),
    ))
    .limit(1)

  const avatar = fileUrl(solarUser.profile?.picture)
  const background = fileUrl(solarUser.profile?.background, true)

  if (!linkedAccount) {
    return {
      solarUsername: username,
      solarDisplayName: solarUser.nick || solarUser.name,
      avatar,
      background,
      githubUsername: null,
      claSigned: false,
      prCount: 0,
      issueCount: 0,
      commitCount: 0,
      linked: false,
    }
  }

  const [signature] = await db
    .select()
    .from(contribClaSignature)
    .where(eq(contribClaSignature.userId, linkedAccount.userId))
    .orderBy(desc(contribClaSignature.signedAt))
    .limit(1)

  const githubUsername = signature?.githubUsername ?? null
  const githubUserId = signature?.githubUserId ?? 0
  const claSigned = signature?.claVersion === CLA_VERSION
  const stats = githubUsername && githubUserId
    ? await getGithubStats(githubUserId, githubUsername)
    : { prCount: 0, issueCount: 0, commitCount: 0 }

  const total = stats.prCount * 5 + stats.issueCount * 3 + stats.commitCount

  // Count how many users have a higher weighted score
  const [{ count: higherCount }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(contribGithubStats)
    .where(sql`(pr_count * 5 + issue_count * 3 + commit_count) > ${total}`)

  const rank = Number(higherCount) + 1

  return {
    solarUsername: username,
    solarDisplayName: solarUser.nick || solarUser.name,
    avatar,
    background,
    githubUsername,
    claSigned,
    rank,
    totalContributions: total,
    ...stats,
    linked: true,
  }
})
