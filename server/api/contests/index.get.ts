import { db } from '~~/server/utils/db'
import { contestState, contestSubmission } from '~~/server/db'
import { eq, sql } from 'drizzle-orm'

export default defineEventHandler(async () => {
  const states = await db
    .select()
    .from(contestState)

  const submissionCounts = await db
    .select({
      contestId: contestSubmission.contestId,
      count: sql<number>`cast(count(*) as integer)`,
    })
    .from(contestSubmission)
    .where(eq(contestSubmission.status, 'accepted'))
    .groupBy(contestSubmission.contestId)

  const statesRecord: Record<string, any> = {}
  for (const s of states) {
    statesRecord[s.contestId] = s
  }

  const countsRecord: Record<string, number> = {}
  for (const c of submissionCounts) {
    countsRecord[c.contestId] = c.count as number
  }

  return {
    states: statesRecord,
    submissionCounts: countsRecord,
  }
})
