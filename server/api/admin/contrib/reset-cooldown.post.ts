import { db } from '~~/server/utils/db'
import { contribGithubStats } from '~~/server/db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) throw createError({ statusCode: 401 })

  const body = await readBody(event)
  if (!body?.githubUsername) {
    throw createError({ statusCode: 400, statusMessage: 'githubUsername required' })
  }

  const result = await db
    .update(contribGithubStats)
    .set({ lastManualRefresh: null })
    .where(eq(contribGithubStats.githubUsername, body.githubUsername))
    .returning()

  if (!result.length) {
    throw createError({ statusCode: 404, statusMessage: 'User not found in stats table' })
  }

  return { ok: true, user: result[0] }
})
