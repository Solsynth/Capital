import { auth } from '~~/server/utils/auth'
import { db } from '~~/server/utils/db'
import { claSignature } from '~~/server/db/schema'
import { eq, and } from 'drizzle-orm'
import { CLA_VERSION } from '~~/server/utils/cla'
import { getGithubConnection } from '~~/server/utils/sn'
import { getGithubPrCount } from '~~/server/utils/github-stats'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }

  const connection = await getGithubConnection(session.user.id)

  if (!connection) {
    return { signed: false, githubConnected: false, githubUsername: null, prCount: 0 }
  }

  const githubUserId = parseInt(String(connection.meta?.user_id ?? '0').replace(/^"|"$/g, ''))
  const githubUsername = String(connection.meta?.preferred_username ?? '').replace(/^"|"$/g, '')

  const [existing] = await db
    .select()
    .from(claSignature)
    .where(and(
      eq(claSignature.githubUserId, githubUserId),
      eq(claSignature.claVersion, CLA_VERSION),
    ))
    .limit(1)

  const prCount = githubUserId ? await getGithubPrCount(githubUserId, githubUsername) : 0

  if (existing) {
    return {
      signed: true,
      githubConnected: true,
      githubUsername,
      prCount,
      signature: {
        signedAt: existing.signedAt,
        claVersion: existing.claVersion,
      },
    }
  }

  return { signed: false, githubConnected: true, githubUsername, prCount }
})
