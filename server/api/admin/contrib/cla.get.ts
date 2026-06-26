import { db } from '~~/server/utils/db'
import { contribClaSignature } from '~~/server/db/schema'
import { desc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) throw createError({ statusCode: 401 })

  const rows = await db
    .select()
    .from(contribClaSignature)
    .orderBy(desc(contribClaSignature.signedAt))

  return { signatures: rows }
})
