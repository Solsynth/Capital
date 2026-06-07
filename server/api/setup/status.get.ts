import { db } from '~~/server/utils/db'
import { user } from '~~/server/db'

export default defineEventHandler(async () => {
  const count = await db.$count(user)
  return { needsSetup: count === 0 }
})
