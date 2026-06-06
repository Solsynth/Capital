import { auth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const secret = process.env.SEED_ADMIN_SECRET
  if (!secret) {
    throw createError({ statusCode: 500, statusMessage: 'SEED_ADMIN_SECRET is not configured' })
  }

  const body = await readBody(event)
  if (body?.secret !== secret) {
    throw createError({ statusCode: 403, statusMessage: 'Invalid secret' })
  }

  // Use Better Auth's internal signup to handle password hashing, etc.
  const result = await auth.api.signUpEmail({
    body: {
      email: body.email,
      password: body.password,
      name: body.name,
    },
  })

  if (!result) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to create user' })
  }

  return { success: true, userId: result.user.id }
})
