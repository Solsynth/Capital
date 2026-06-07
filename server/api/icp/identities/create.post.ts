import { db } from '~~/server/utils/db'
import { icpIdentity } from '~~/server/db'
import { auth } from '~~/server/utils/auth'
import { randomUUID } from 'crypto'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }

  const body = await readBody(event)

  // Validate required fields
  if (!body.name || !body.type) {
    throw createError({ statusCode: 400, statusMessage: 'Name and type are required' })
  }

  // Validate type
  if (!['individual', 'organization'].includes(body.type)) {
    throw createError({ statusCode: 400, statusMessage: 'Type must be individual or organization' })
  }

  try {
    const identityId = randomUUID()

    await db.insert(icpIdentity).values({
      id: identityId,
      name: body.name,
      type: body.type,
      description: body.description || null,
      icon: body.icon || null,
      userId: session.user.id,
    })

    return { success: true, id: identityId }
  }
  catch (e: any) {
    if (e?.statusCode) throw e
    console.error('Failed to create identity:', e)
    throw createError({ statusCode: 500, statusMessage: 'Failed to create identity' })
  }
})
