import { db } from '~~/server/utils/db'
import { user } from '~~/server/db'
import { requireAdmin } from '~~/server/utils/admin'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const { session } = await requireAdmin(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'User ID is required' })
  }

  const body = await readBody(event)

  try {
    // Check if user exists
    const existing = await db
      .select()
      .from(user)
      .where(eq(user.id, id))
      .limit(1)
      .then(rows => rows[0])

    if (!existing) {
      throw createError({ statusCode: 404, statusMessage: 'User not found' })
    }

    // Update user
    await db.update(user)
      .set({
        name: body.name ?? existing.name,
        email: body.email ?? existing.email,
        emailVerified: body.emailVerified ?? existing.emailVerified,
        image: body.image !== undefined ? body.image : existing.image,
        updatedAt: new Date(),
      })
      .where(eq(user.id, id))

    return { success: true }
  }
  catch (e: any) {
    if (e?.statusCode) throw e
    console.error('Failed to update user:', e)
    throw createError({ statusCode: 500, statusMessage: 'Failed to update user' })
  }
})
