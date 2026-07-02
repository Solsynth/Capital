import { db } from '~~/server/utils/db'
import { contestSubmission } from '~~/server/db'
import { requireAdmin } from '~~/server/utils/admin'
import { eq, desc, sql } from 'drizzle-orm'
import { getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const query = getQuery(event)
  const contestId = query.contest_id as string
  const statusFilter = query.status as string

  let baseQuery = db
    .select()
    .from(contestSubmission)
    .orderBy(desc(contestSubmission.createdAt))

  if (contestId) {
    baseQuery = db
      .select()
      .from(contestSubmission)
      .where(eq(contestSubmission.contestId, contestId))
      .orderBy(desc(contestSubmission.createdAt))
  }

  const submissions = await baseQuery

  let filtered = submissions
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
