import { db } from '~~/server/utils/db'
import { contestSubmission, user as userTable } from '~~/server/db'
import { eq, sql, and } from 'drizzle-orm'
import { getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const contestId = query.contest_id as string
  const sort = (query.sort as string) || 'newest'

  if (!contestId) {
    throw createError({ statusCode: 400, statusMessage: 'contest_id is required' })
  }

  const rows = await db
    .select({
      id: contestSubmission.id,
      contestId: contestSubmission.contestId,
      status: contestSubmission.status,
      userId: contestSubmission.userId,
      referralCode: contestSubmission.referralCode,
      data: contestSubmission.data,
      createdAt: contestSubmission.createdAt,
      userName: userTable.name,
      userNick: sql<string>`${userTable.solarProfile}->>'nick'`,
      userSolarName: sql<string>`${userTable.solarProfile}->>'name'`,
      userPicture: sql<string>`${userTable.solarProfile}->'profile'->>'picture'`,
      userSolarAccountId: userTable.solarAccountId,
    })
    .from(contestSubmission)
    .leftJoin(userTable, eq(userTable.id, contestSubmission.userId))
    .where(
      and(
        eq(contestSubmission.contestId, contestId),
        eq(contestSubmission.status, 'accepted'),
      ),
    )
    .orderBy(
      sort === 'newest'
        ? sql`${contestSubmission.createdAt} DESC`
        : sql`${contestSubmission.createdAt} ASC`,
    )

  return rows.map(row => ({
    id: row.id,
    contestId: row.contestId,
    status: row.status,
    userId: row.userId,
    referralCode: row.referralCode,
    data: row.data,
    createdAt: row.createdAt,
    author: {
      id: row.userId,
      name: row.userNick || row.userSolarName || row.userName,
      avatar: row.userPicture
        ? `https://api.solian.app/drive/files/${row.userPicture}`
        : null,
      solarAccountId: row.userSolarAccountId,
    },
  }))
})
