import { db } from '~~/server/utils/db'
import { user, icpSite, icpSubmission } from '~~/server/db'
import { requireAdmin } from '~~/server/utils/admin'
import { desc, eq, count } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const { session } = await requireAdmin(event)

  try {
    const users = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
        createdAt: user.createdAt,
      })
      .from(user)
      .orderBy(desc(user.createdAt))

    // Get submission and site counts for each user
    const usersWithCounts = await Promise.all(
      users.map(async (u) => {
        const [submissionCount] = await db
          .select({ count: count() })
          .from(icpSubmission)
          .where(eq(icpSubmission.userId, u.id))

        const [siteCount] = await db
          .select({ count: count() })
          .from(icpSite)
          .where(eq(icpSite.userId, u.id))

        return {
          id: u.id,
          name: u.name,
          email: u.email,
          emailVerified: u.emailVerified,
          image: u.image,
          created: u.createdAt.toISOString(),
          submissionCount: submissionCount?.count ?? 0,
          siteCount: siteCount?.count ?? 0,
        }
      })
    )

    return { users: usersWithCounts }
  }
  catch (e) {
    console.error('Failed to fetch users:', e)
    return { users: [] }
  }
})
