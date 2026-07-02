import { auth } from '#server/utils/auth'
import { getIsAdmin } from '#server/utils/admin'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })

  if (!session) {
    return { isAdmin: false }
  }

  const isAdmin = await getIsAdmin(session)
  return { isAdmin }
})
