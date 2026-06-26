import { db } from '~~/server/utils/db'
import { claSignature, account } from '~~/server/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { CLA_VERSION } from '~~/server/utils/cla'
import { getSolarUser } from '~~/server/utils/sn'
import { getGithubPrCount } from '~~/server/utils/github-stats'

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

  if (!linkedAccount) {
    return {
      solarUsername: username,
      solarDisplayName: solarUser.nick || solarUser.name,
      githubUsername: null,
      claSigned: false,
      prCount: 0,
      linked: false,
    }
  }

  const [signature] = await db
    .select()
    .from(claSignature)
    .where(eq(claSignature.userId, linkedAccount.userId))
    .orderBy(desc(claSignature.signedAt))
    .limit(1)

  const githubUsername = signature?.githubUsername ?? null
  const githubUserId = signature?.githubUserId ?? 0
  const claSigned = signature?.claVersion === CLA_VERSION
  const prCount = githubUsername && githubUserId ? await getGithubPrCount(githubUserId, githubUsername) : 0

  return {
    solarUsername: username,
    solarDisplayName: solarUser.nick || solarUser.name,
    githubUsername,
    claSigned,
    claVersion: signature?.claVersion ?? null,
    signedAt: signature?.signedAt ?? null,
    prCount,
    linked: true,
  }
})
