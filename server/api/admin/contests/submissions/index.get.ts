import { db } from '~~/server/utils/db'
import { contestSubmission, user as userTable } from '~~/server/db'
import { requireAdmin } from '~~/server/utils/admin'
import { eq, desc, sql } from 'drizzle-orm'
import { getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const query = getQuery(event)
  const contestId = query.contest_id as string
  const statusFilter = query.status as string

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
    .where(contestId ? eq(contestSubmission.contestId, contestId) : undefined)
    .orderBy(desc(contestSubmission.createdAt))

  let filtered = rows.map(row => ({
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

  if (statusFilter) {
    filtered = filtered.filter(s => s.status === statusFilter)
  }

  const countQuery = await db
    .select({
      total: sql<number>`cast(count(*) as integer)`,
      pending: sql<number>`cast(sum(case when ${contestSubmission.status} = 'pending' then 1 else 0 end) as integer)`,
      accepted: sql<number>`cast(sum(case when ${contestSubmission.status} = 'accepted' then 1 else 0 end) as integer)`,
      rejected: sql<number>`cast(sum(case when ${contestSubmission.status} = 'rejected' then 1 else 0 end) as integer)`,
    })
    .from(contestSubmission)
    .then(rows => rows[0])

  return { submissions: filtered, stats: countQuery }
})
