import { auth } from '~~/server/utils/auth'
import { db } from '~~/server/utils/db'
import { contribClaSignature, contribGithubStats, account } from '~~/server/db/schema'
import { eq, and } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import { CLA_VERSION } from '~~/server/utils/cla'
import { getGithubConnection, cacheSolarUser } from '~~/server/utils/sn'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }

  const connection = await getGithubConnection(session.user.id)
  if (!connection) {
    throw createError({ statusCode: 400, statusMessage: 'GitHub account not connected. Connect it on Solar Network first.' })
  }

  const githubUserId = parseInt(String(connection.meta?.user_id ?? '0').replace(/^"|"$/g, ''))
  const githubUsername = String(connection.meta?.preferred_username ?? '').replace(/^"|"$/g, '')

  const claVersion = CLA_VERSION

  const [existing] = await db
    .select()
    .from(contribClaSignature)
    .where(and(
      eq(contribClaSignature.githubUserId, githubUserId),
      eq(contribClaSignature.claVersion, claVersion),
    ))
    .limit(1)

  if (existing) {
    return { signature: existing, alreadySigned: true }
  }

  const [inserted] = await db
    .insert(contribClaSignature)
    .values({
      id: randomUUID(),
      userId: session.user.id,
      githubUserId,
      githubUsername,
      claVersion,
    })
    .returning()

  // Populate Solar cache for this contributor
  const [solarAccount] = await db
    .select({ accountId: account.accountId })
    .from(account)
    .where(and(eq(account.userId, session.user.id), eq(account.providerId, 'solian')))
    .limit(1)
  if (solarAccount) {
    await cacheSolarUser(githubUsername, solarAccount.accountId)
  }

  return { signature: inserted, alreadySigned: false }
})
