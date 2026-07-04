import { db } from '~~/server/utils/db'
import { contestSubmission, user as userTable } from '~~/server/db'
import { auth } from '~~/server/utils/auth'
import { eq, and, sql } from 'drizzle-orm'
import { getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }

  const query = getQuery(event)
  const contestId = query.contest_id as string

  const where = contestId
    ? and(
        eq(contestSubmission.userId, session.user.id),
        eq(contestSubmission.contestId, contestId),
      )
    : eq(contestSubmission.userId, session.user.id)

  const rows = await db
    .select({
      id: contestSubmission.id,
      contestId: contestSubmission.contestId,
      status: contestSubmission.status,
      userId: contestSubmission.userId,
      referralCode: contestSubmission.referralCode,
      data: contestSubmission.data,
      reviewNote: contestSubmission.reviewNote,
      reviewedBy: contestSubmission.reviewedBy,
      reviewedAt: contestSubmission.reviewedAt,
      createdAt: contestSubmission.createdAt,
      updatedAt: contestSubmission.updatedAt,
      userName: userTable.name,
      userNick: sql<string>`${userTable.solarProfile}->>'nick'`,
      userSolarName: sql<string>`${userTable.solarProfile}->>'name'`,
      userPicture: sql<string>`coalesce(${userTable.solarProfile}->'profile'->'picture'->>'id', ${userTable.solarProfile}->'profile'->>'picture')`,
      userSolarAccountId: userTable.solarAccountId,
    })
    .from(contestSubmission)
    .leftJoin(userTable, eq(userTable.id, contestSubmission.userId))
    .where(where)

  const mySubmissions = rows.map(row => ({
    id: row.id,
    contestId: row.contestId,
    status: row.status,
    userId: row.userId,
    referralCode: row.referralCode,
    data: row.data,
    reviewNote: row.reviewNote,
    reviewedBy: row.reviewedBy,
    reviewedAt: row.reviewedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    author: {
      id: row.userId,
      name: row.userNick || row.userSolarName || row.userName,
      avatar: row.userPicture
        ? `https://api.solian.app/drive/files/${row.userPicture}`
        : null,
      solarAccountId: row.userSolarAccountId,
    },
  }))

  return { submissions: mySubmissions }
})
