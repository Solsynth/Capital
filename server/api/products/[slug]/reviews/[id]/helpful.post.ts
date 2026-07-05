import { markHelpful } from "#server/utils/products"
import { auth } from "#server/utils/auth"

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: "Not authenticated" })
  }

  const id = getRouterParam(event, "id")
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "Missing review ID" })
  }

  const review = await markHelpful(id)
  return { review }
})
