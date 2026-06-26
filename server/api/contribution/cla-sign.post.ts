import { auth } from '~~/server/utils/auth'
import { db } from '~~/server/utils/db'
import { claSignature } from '~~/server/db/schema'
import { eq, and } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import { CLA_VERSION } from '~~/server/utils/cla'
import { getGithubConnection } from '~~/server/utils/sn'

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
    .from(claSignature)
    .where(and(
      eq(claSignature.githubUserId, githubUserId),
      eq(claSignature.claVersion, claVersion),
    ))
    .limit(1)

  if (existing) {
    return { signature: existing, alreadySigned: true }
  }

  const [inserted] = await db
    .insert(claSignature)
    .values({
      id: randomUUID(),
      userId: session.user.id,
      githubUserId,
      githubUsername,
      claVersion,
    })
    .returning()

  return { signature: inserted, alreadySigned: false }
})
