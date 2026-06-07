import { db } from '~~/server/utils/db'
import { icpSubmission, icpSite, user, file } from '~~/server/db'
import { auth } from '~~/server/utils/auth'
import { desc, eq, inArray } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }

  // Check if user is admin (you may need to adjust this based on your admin logic)
  // For now, we'll check if the user has a specific role or is the first user
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean)
  const isAdmin = adminEmails.includes(session.user.email) || adminEmails.length === 0

  if (!isAdmin) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden: Admin access required' })
  }

  const query = getQuery(event)
  const status = query.status as string || undefined

  try {
    const conditions = []
    if (status) {
      conditions.push(eq(icpSubmission.status, status))
    }

    const submissions = await db
      .select({
        id: icpSubmission.id,
        type: icpSubmission.type,
        status: icpSubmission.status,
        siteId: icpSubmission.siteId,
        data: icpSubmission.data,
        reviewNote: icpSubmission.reviewNote,
        reviewedAt: icpSubmission.reviewedAt,
        reviewedBy: icpSubmission.reviewedBy,
        createdAt: icpSubmission.createdAt,
        updatedAt: icpSubmission.updatedAt,
        userId: icpSubmission.userId,
        userName: user.name,
        userEmail: user.email,
        siteFillingNo: icpSite.fillingNo,
        siteName: icpSite.name,
      })
      .from(icpSubmission)
      .leftJoin(user, eq(icpSubmission.userId, user.id))
      .leftJoin(icpSite, eq(icpSubmission.siteId, icpSite.id))
      .where(conditions.length > 0 ? conditions[0] : undefined)
      .orderBy(desc(icpSubmission.createdAt))

    // Resolve icon file URLs from submission data
    const fileIds = submissions
      .map(sub => {
        try {
          const data = JSON.parse(sub.data)
          return data.icon_file_id
        } catch { return null }
      })
      .filter(Boolean) as string[]

    const fileMap = new Map<string, string>()
    if (fileIds.length > 0) {
      const files = await db
        .select({ id: file.id, url: file.url })
        .from(file)
        .where(inArray(file.id, fileIds))
      for (const f of files) {
        fileMap.set(f.id, f.url)
      }
    }

    return {
      submissions: submissions.map(sub => {
        const parsedData = JSON.parse(sub.data)
        return {
          id: sub.id,
          type: sub.type,
          status: sub.status,
          site_id: sub.siteId,
          data: {
            ...parsedData,
            icon_url: fileMap.get(parsedData.icon_file_id) || null,
          },
          review_note: sub.reviewNote,
          reviewed_at: sub.reviewedAt?.toISOString() || null,
          reviewed_by: sub.reviewedBy,
          created: sub.createdAt.toISOString(),
          updated: sub.updatedAt.toISOString(),
          user: {
            id: sub.userId,
            name: sub.userName,
            email: sub.userEmail,
          },
          site_filling_no: sub.siteFillingNo,
          site_name: sub.siteName,
        }
      }),
    }
  }
  catch (e) {
    console.error('Failed to fetch submissions:', e)
    return { submissions: [] }
  }
})
