import { db } from '~~/server/utils/db'
import { contribPendingCheck } from '~~/server/db/schema'
import { eq, desc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) throw createError({ statusCode: 401 })

  const status = getQuery(event).status as string | undefined
  const where = status ? eq(contribPendingCheck.status, status) : undefined

  const rows = await db
    .select()
    .from(contribPendingCheck)
    .where(where)
    .orderBy(desc(contribPendingCheck.createdAt))

  return { checks: rows }
})
