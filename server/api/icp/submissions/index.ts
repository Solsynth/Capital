import { db } from '~~/server/utils/db'
import { icpSubmission, icpSite } from '~~/server/db'
import { auth } from '~~/server/utils/auth'
import { eq, desc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }

  try {
    const submissions = await db
      .select({
        id: icpSubmission.id,
        type: icpSubmission.type,
        status: icpSubmission.status,
        siteId: icpSubmission.siteId,
        data: icpSubmission.data,
        reviewNote: icpSubmission.reviewNote,
        reviewedAt: icpSubmission.reviewedAt,
        createdAt: icpSubmission.createdAt,
        updatedAt: icpSubmission.updatedAt,
        siteFillingNo: icpSite.fillingNo,
        siteName: icpSite.name,
      })
      .from(icpSubmission)
      .leftJoin(icpSite, eq(icpSubmission.siteId, icpSite.id))
      .where(eq(icpSubmission.userId, session.user.id))
      .orderBy(desc(icpSubmission.createdAt))

    return {
      submissions: submissions.map(sub => ({
        id: sub.id,
        type: sub.type,
        status: sub.status,
        site_id: sub.siteId,
        data: JSON.parse(sub.data),
        review_note: sub.reviewNote,
        reviewed_at: sub.reviewedAt?.toISOString() || null,
        created: sub.createdAt.toISOString(),
        updated: sub.updatedAt.toISOString(),
        site_filling_no: sub.siteFillingNo,
        site_name: sub.siteName,
      })),
    }
  }
  catch (e) {
    console.error('Failed to fetch submissions:', e)
    return { submissions: [] }
  }
})
